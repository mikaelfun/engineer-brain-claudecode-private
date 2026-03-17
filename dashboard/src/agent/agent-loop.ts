/**
 * agent-loop.ts — 核心 Agent Loop
 *
 * 调 Copilot API → 如果返回 tool_calls → 执行工具 → 结果回传 → 重复直到 AI 回复文本
 */
import { config } from '../config.js'
import { callCopilotWithTools, type ChatMessage } from '../services/copilot-client.js'
import { getToolsBySafety, getToolSpecs, type ToolSafety } from './tool-registry.js'
import { executeTool } from './tool-executor.js'
import {
  createSession,
  saveSession,
  updateSessionStatus,
  loadSession,
  getRunningSession,
} from './session-manager.js'
import { getWorkflowDefinition, buildKickPrompt, type WorkflowDefinition } from './workflow-configs.js'
import { sseManager } from '../watcher/sse-manager.js'
import type { AgentSession, AgentToolCallRecord, WorkflowId } from '../types/index.js'

// Track running session for cancellation
let activeAbortController: AbortController | null = null

/**
 * Start a workflow — main entry point
 */
export async function startWorkflow(
  workflowId: WorkflowId,
  params: Record<string, string>
): Promise<AgentSession> {
  // Check concurrency
  const running = getRunningSession()
  if (running) {
    throw new WorkflowConflictError(`Workflow "${running.workflowName}" is already running (session: ${running.id})`)
  }

  // Get workflow definition
  const definition = getWorkflowDefinition(workflowId)
  if (!definition) {
    throw new WorkflowError(`Unknown workflow: ${workflowId}`)
  }

  // Validate required params
  for (const param of definition.config.requiredParams) {
    if (!params[param]) {
      throw new WorkflowError(`Missing required parameter: ${param}`)
    }
  }

  // Create session
  const session = createSession(
    workflowId,
    definition.config.name,
    params,
    definition.config.maxIterations
  )

  // Broadcast start event
  sseManager.broadcast('workflow-started', {
    sessionId: session.id,
    workflowId: session.workflowId,
    workflowName: session.workflowName,
  })

  // Run the loop asynchronously
  runAgentLoop(session, definition, params).catch((err) => {
    console.error(`[agent-loop] Unhandled error in workflow ${session.id}:`, err)
  })

  return session
}

/**
 * Cancel a running workflow
 */
export function cancelWorkflow(sessionId: string): boolean {
  const session = loadSession(sessionId)
  if (!session || session.status !== 'running') return false

  // Abort the loop
  if (activeAbortController) {
    activeAbortController.abort()
  }

  updateSessionStatus(sessionId, 'cancelled')
  sseManager.broadcast('workflow-cancelled', {
    sessionId,
    workflowId: session.workflowId,
  })

  return true
}

/**
 * Ensure browser is on D365 page before running agent tools.
 * Runs open-app.ps1 which handles: already on D365 (noop) / navigate / launch.
 */
async function ensureBrowserReady(): Promise<void> {
  console.log('[agent-loop] Ensuring D365 browser session is ready...')
  const result = await executeTool('open_app', {})
  if (result.success) {
    console.log('[agent-loop] Browser ready:', result.output.split('\n').pop()?.trim())
  } else {
    console.warn('[agent-loop] Browser setup warning:', result.error || result.output.slice(0, 200))
    // Don't fail — some read-only API tools may still work without browser
  }
}

/**
 * Core agent loop
 */
async function runAgentLoop(
  session: AgentSession,
  definition: WorkflowDefinition,
  params: Record<string, string>
): Promise<void> {
  const abortController = new AbortController()
  activeAbortController = abortController

  // Overall timeout
  const timeoutTimer = setTimeout(() => {
    abortController.abort()
  }, definition.config.timeoutMs)

  try {
    // Ensure D365 browser session is ready before running tools
    await ensureBrowserReady()

    // Build available tools
    const availableTools = getToolsBySafety(definition.allowedSafety)
    const toolSpecs = getToolSpecs(availableTools)

    // Build initial messages
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: definition.systemPrompt,
      },
      {
        role: 'user',
        content: buildKickPrompt(definition, params),
      },
    ]

    // Add system + user to session messages
    for (const msg of messages) {
      session.messages.push({
        ...msg,
        timestamp: new Date().toISOString(),
      })
    }
    saveSession(session)

    // Loop
    for (let i = 0; i < definition.config.maxIterations; i++) {
      if (abortController.signal.aborted) {
        throw new WorkflowCancelledError('Workflow cancelled')
      }

      session.iterations = i + 1

      // Broadcast iteration
      sseManager.broadcast('workflow-iteration', {
        sessionId: session.id,
        iteration: i + 1,
        maxIterations: definition.config.maxIterations,
      })

      // Call Copilot API with tools
      console.log(`[agent-loop] Session ${session.id} iteration ${i + 1}: calling Copilot API with ${toolSpecs.length} tools...`)
      const response = await callCopilotWithTools(
        messages,
        toolSpecs,
        config.githubCopilotToken
      )

      console.log(`[agent-loop] Session ${session.id}: API response — finishReason=${response.finishReason}, hasContent=${!!response.content}, toolCalls=${response.toolCalls?.length || 0}`)

      // If AI returned text (no tool calls) → done
      if (!response.toolCalls || response.toolCalls.length === 0) {
        const content = response.content || ''

        // Record assistant message
        const assistantMsg: ChatMessage = { role: 'assistant', content }
        messages.push(assistantMsg)
        session.messages.push({ ...assistantMsg, timestamp: new Date().toISOString() })

        // Complete
        const resultPreview = content.length > 500 ? content.slice(0, 500) + '...' : content
        session.result = content

        updateSessionStatus(session.id, 'completed', { result: content })

        sseManager.broadcast('workflow-completed', {
          sessionId: session.id,
          workflowId: session.workflowId,
          resultPreview,
          resultFull: content,
          timing: {
            iterations: session.iterations,
            totalToolCalls: session.toolCalls.length,
            startedAt: session.startedAt,
            completedAt: new Date().toISOString(),
          },
        })

        return
      }

      // AI wants to call tools
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: response.content,
        tool_calls: response.toolCalls,
      }
      messages.push(assistantMsg)
      session.messages.push({ ...assistantMsg, timestamp: new Date().toISOString() })
      saveSession(session)

      // Broadcast AI thinking content (if any)
      if (response.content) {
        sseManager.broadcast('workflow-thinking', {
          sessionId: session.id,
          iteration: i + 1,
          content: response.content,
        })
      }

      // Execute each tool call
      for (const toolCall of response.toolCalls) {
        if (abortController.signal.aborted) {
          throw new WorkflowCancelledError('Workflow cancelled')
        }

        const toolName = toolCall.function.name
        let args: Record<string, string> = {}
        try {
          args = JSON.parse(toolCall.function.arguments || '{}')
        } catch {
          args = {}
        }

        // Broadcast tool call start
        sseManager.broadcast('workflow-tool-call', {
          sessionId: session.id,
          callId: toolCall.id,
          toolName,
          args,
        })

        // Execute
        console.log(`[agent-loop] Executing tool: ${toolName}(${JSON.stringify(args)})`)
        const result = await executeTool(toolName, args)
        console.log(`[agent-loop] Tool ${toolName} finished: success=${result.success}, ${result.durationMs}ms, output=${result.output.slice(0, 100)}`)

        // Record tool call
        const record: AgentToolCallRecord = {
          callId: toolCall.id,
          toolName,
          args,
          success: result.success,
          output: result.output,
          error: result.error,
          durationMs: result.durationMs,
          timestamp: new Date().toISOString(),
        }
        session.toolCalls.push(record)

        // Broadcast tool result
        const outputPreview = result.output.length > 500 ? result.output.slice(0, 500) + '...' : result.output
        sseManager.broadcast('workflow-tool-result', {
          sessionId: session.id,
          callId: toolCall.id,
          toolName,
          success: result.success,
          output: outputPreview,
          durationMs: result.durationMs,
        })

        // Build tool response message
        const toolResultContent = result.success
          ? result.output
          : `Error: ${result.error}\n${result.output}`

        const toolMsg: ChatMessage = {
          role: 'tool',
          content: toolResultContent,
          tool_call_id: toolCall.id,
        }
        messages.push(toolMsg)
        session.messages.push({ ...toolMsg, timestamp: new Date().toISOString() })
      }

      saveSession(session)
    }

    // Exceeded max iterations
    updateSessionStatus(session.id, 'completed', {
      result: `Reached max iterations (${definition.config.maxIterations}). Last state saved.`,
    })

    sseManager.broadcast('workflow-completed', {
      sessionId: session.id,
      workflowId: session.workflowId,
      resultPreview: `Reached max iterations (${definition.config.maxIterations})`,
      timing: {
        iterations: session.iterations,
        totalToolCalls: session.toolCalls.length,
        startedAt: session.startedAt,
        completedAt: new Date().toISOString(),
      },
    })
  } catch (err) {
    if (err instanceof WorkflowCancelledError) {
      // Already handled by cancelWorkflow
      return
    }

    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error(`[agent-loop] Workflow ${session.id} failed:`, errorMsg)

    updateSessionStatus(session.id, 'failed', { error: errorMsg })

    sseManager.broadcast('workflow-failed', {
      sessionId: session.id,
      workflowId: session.workflowId,
      error: errorMsg,
    })
  } finally {
    clearTimeout(timeoutTimer)
    if (activeAbortController === abortController) {
      activeAbortController = null
    }
  }
}

// ============ Error classes ============

export class WorkflowError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'WorkflowError'
  }
}

export class WorkflowConflictError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'WorkflowConflictError'
  }
}

class WorkflowCancelledError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'WorkflowCancelledError'
  }
}

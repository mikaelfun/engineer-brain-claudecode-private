/**
 * steps.ts — Step 级 API 路由
 *
 * 每个步骤可独立触发，在同一 case session 中 resume：
 *   POST /case/:id/step/data-refresh
 *   POST /case/:id/step/compliance-check
 *   POST /case/:id/step/status-judge
 *   POST /case/:id/step/teams-search
 *   POST /case/:id/step/troubleshoot
 *   POST /case/:id/step/draft-email
 *   POST /case/:id/step/inspection
 *   POST /case/:id/step/generate-kb
 *
 * AskUserQuestion interception:
 *   POST /case/:id/step-answer  — submit user answer to a pending question
 *
 * Recovery:
 *   GET  /case/:id/step-progress — recover messages + status + pendingQuestion
 */
import { Hono } from 'hono'
import type { CanUseTool } from '@anthropic-ai/claude-agent-sdk'
import type { ToolCallRecord, ExecutionSummary } from '../types/index.js'
import { getSkillRegistry } from '../services/skill-registry.js'
import {
  stepCaseSession,
  chatCaseSession,
  getActiveSessionForCase,
  acquireCaseOperationLock,
  releaseCaseOperationLock,
  getActiveCaseOperation,
  appendSessionMessage,
  clearStepSessionMessages,
  writeStepLog,
  endSession,
  abortQuery,
  buildExecutionSummary,
  getCaseMcpServerNames,
  cleanupStaleSessions,
} from '../agent/case-session-manager.js'
import { sseManager } from '../watcher/sse-manager.js'
import { getSSEEventType, formatMessageForSSE, getPersistedMessageType } from '../utils/sse-helpers.js'
import { caseStepState, type CaseStepQuestion } from '../services/case-step-state.js'
import { withInactivityTimeout, INACTIVITY_TIMEOUT_MS } from '../utils/operation-timeout.js'
import { sdkQueue } from '../utils/sdk-queue.js'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { config } from '../config.js'

const stepRoutes = new Hono()

// ---- Pipeline step detection for casework (ISS-210 v2) ----
// Uses timing marker files (.t_*) written by the casework agent for precise tracking.
// Fallback to regex-based detection from thinking messages.

/**
 * Pipeline steps definition with timing marker file mappings.
 * Each step can have a start/end marker file and optional agent markers.
 */
const CASEWORK_PIPELINE_STEPS = [
  { id: 'changegate', label: 'Changegate', startMarker: '.t_changegate_start', endMarker: '.t_changegate_end' },
  { id: 'data-refresh', label: 'Data Refresh', startMarker: '.t_dataRefresh_start', endMarker: '.t_dataRefresh_end' },
  { id: 'compliance', label: 'Compliance', startMarker: '.t_compliance_start', endMarker: '.t_compliance_end' },
  { id: 'status-judge', label: 'Status Judge', startMarker: '.t_statusJudge_start', endMarker: '.t_statusJudge_end' },
  { id: 'route', label: 'Route', startMarker: '.t_routing_start', endMarker: '.t_routing_end' },
  { id: 'troubleshoot', label: 'Troubleshoot', startMarker: '.t_troubleshoot_start', endMarker: '.t_troubleshoot_end' },
  { id: 'email-draft', label: 'Email Draft', startMarker: '.t_emailDraft_start', endMarker: '.t_emailDraft_end' },
  { id: 'inspection', label: 'Inspection', startMarker: '.t_inspection_start', endMarker: '.t_inspection_end' },
] as const

/** Agent spawn tracking — detected from Agent tool calls and timing markers */
const AGENT_SPAWNS = [
  { id: 'teams-search', label: 'Teams', startMarker: '.t_teamsSearch_start', endMarker: '.t_teamsSearch_end', patterns: ['teams-search', 'Teams 搜索'] },
  { id: 'onenote-search', label: 'OneNote', startMarker: '.t_onenoteSearch_start', endMarker: '.t_onenoteSearch_end', patterns: ['onenote', 'OneNote'] },
  { id: 'troubleshooter', label: 'Troubleshooter', startMarker: '.t_troubleshoot_start', endMarker: '.t_troubleshoot_end', patterns: ['troubleshoot'] },
  { id: 'email-drafter', label: 'Email Drafter', startMarker: '.t_emailDraft_start', endMarker: '.t_emailDraft_end', patterns: ['email-drafter', 'draft-email'] },
  { id: 'challenger', label: 'Challenger', startMarker: '.t_challenger_start', endMarker: '.t_challenger_end', patterns: ['challenger'] },
] as const

type PipelineStepId = typeof CASEWORK_PIPELINE_STEPS[number]['id']

/** Read a timing marker file (contains Unix timestamp) */
function readTimingMarker(logsDir: string, marker: string): number | null {
  const p = join(logsDir, marker)
  try {
    if (existsSync(p)) {
      const val = readFileSync(p, 'utf-8').trim()
      return parseInt(val, 10) || null
    }
  } catch { /* ignore */ }
  return null
}

/** Track per-case pipeline state to avoid duplicate broadcasts */
const pipelineState: Record<string, Record<string, string>> = {} // caseNumber → { stepId → status }
const agentSpawnState: Record<string, Record<string, string>> = {} // caseNumber → { agentId → status }

/** Active polling timers per case */
const pipelinePollers: Record<string, ReturnType<typeof setInterval>> = {}

/**
 * Start polling timing markers for a case.
 * Reads .t_* files every 3s and broadcasts pipeline updates via SSE.
 */
function startPipelinePoller(caseNumber: string, sessionId?: string) {
  if (pipelinePollers[caseNumber]) return // already polling

  const logsDir = join(config.activeCasesDir, caseNumber, 'logs')
  pipelineState[caseNumber] = {}
  agentSpawnState[caseNumber] = {}

  console.log(`[pipeline-poller] Started for case ${caseNumber}, logsDir=${logsDir}`)

  const poll = () => {
    // Check each pipeline step
    for (const step of CASEWORK_PIPELINE_STEPS) {
      const prevStatus = pipelineState[caseNumber]?.[step.id]
      const startTs = readTimingMarker(logsDir, step.startMarker)
      const endTs = readTimingMarker(logsDir, step.endMarker)

      let newStatus: string
      if (endTs) {
        newStatus = 'completed'
      } else if (startTs) {
        newStatus = 'active'
      } else {
        newStatus = 'pending'
      }

      if (newStatus !== prevStatus) {
        pipelineState[caseNumber][step.id] = newStatus
        const durationMs = (startTs && endTs) ? (endTs - startTs) * 1000 : undefined
        sseManager.broadcast('case-pipeline-step' as any, {
          caseNumber,
          sessionId,
          pipelineStep: step.id,
          status: newStatus,
          durationMs,
          timestamp: new Date().toISOString(),
        })
      }
    }

    // Check agent spawns
    for (const agent of AGENT_SPAWNS) {
      const prevStatus = agentSpawnState[caseNumber]?.[agent.id]
      const startTs = readTimingMarker(logsDir, agent.startMarker)
      const endTs = readTimingMarker(logsDir, agent.endMarker)

      // If start == end (0s), the agent was cache-skipped, not actually spawned — skip it
      if (startTs && endTs && endTs - startTs === 0) continue

      let newStatus: string
      if (endTs) {
        newStatus = 'completed'
      } else if (startTs) {
        newStatus = 'running'
      } else {
        continue // not spawned
      }

      if (newStatus !== prevStatus) {
        agentSpawnState[caseNumber][agent.id] = newStatus
        const durationMs = (startTs && endTs) ? (endTs - startTs) * 1000 : undefined
        sseManager.broadcast('case-agent-spawn' as any, {
          caseNumber,
          sessionId,
          agentId: agent.id,
          agentLabel: agent.label,
          status: newStatus,
          durationMs,
          timestamp: new Date().toISOString(),
        })
      }
    }

    // Check if done
    const doneTs = readTimingMarker(logsDir, '.t_done')
    if (doneTs) {
      stopPipelinePoller(caseNumber)
    }
  }

  // Initial poll immediately
  poll()
  // Then poll every 3s
  pipelinePollers[caseNumber] = setInterval(poll, 3_000)
}

/** Stop polling for a case */
function stopPipelinePoller(caseNumber: string) {
  if (pipelinePollers[caseNumber]) {
    clearInterval(pipelinePollers[caseNumber])
    delete pipelinePollers[caseNumber]
    console.log(`[pipeline-poller] Stopped for case ${caseNumber}`)
  }
}

/**
 * Detect which casework pipeline step is currently active based on tool/thinking content.
 * FALLBACK for cases where timing markers haven't been written yet.
 */
function detectPipelineStep(toolName: string, content: string): PipelineStepId | null {
  const combined = `${toolName} ${content}`.toLowerCase()
  const patterns: Array<{ id: PipelineStepId; pats: string[] }> = [
    { id: 'changegate', pats: ['check-case-changes', 'changegate', 'step 1'] },
    { id: 'data-refresh', pats: ['data-refresh', 'fetch-case-info', 'fetch-emails', 'fast.path'] },
    { id: 'compliance', pats: ['compliance-check', 'compliance', 'entitlement', 'b3'] },
    { id: 'status-judge', pats: ['status-judge', 'statusjudge', 'b4'] },
    { id: 'route', pats: ['routing', 'recommendedaction', 'no-agent', 'b5'] },
    { id: 'troubleshoot', pats: ['troubleshoot', 'claims.json'] },
    { id: 'email-draft', pats: ['email-drafter', 'draft-email', 'humanizer'] },
    { id: 'inspection', pats: ['inspection', 'case-summary', 'generate-todo', 'step 4'] },
  ]
  for (const { id, pats } of patterns) {
    for (const pat of pats) {
      if (combined.includes(pat)) return id
    }
  }
  return null
}

/** Track the current pipeline step per case for regex fallback */
const activePipelineStep: Record<string, string> = {}

// Valid step names — dynamically derived from skill registry
function getValidSteps(): string[] {
  const registry = getSkillRegistry()
  const skills = registry.listSkills()
  const steps: string[] = []
  for (const skill of skills) {
    steps.push(skill.webUiAlias || skill.name)
  }
  // Agent-based steps not in skill registry but available as buttons
  steps.push('onenote-case-search')
  return steps
}

type StepName = string

/**
 * Steps that support interactive Q&A (AskUserQuestion → dashboard UI).
 * Automated steps (data-refresh, compliance-check, etc.) deny AskUserQuestion
 * without interrupting — the model is told to proceed autonomously.
 */
const INTERACTIVE_STEPS: ReadonlySet<string> = new Set([
  'troubleshoot',
  'draft-email',
])

/**
 * Background steps that run concurrently without blocking other steps.
 * These do NOT acquire the per-case operation lock, so other steps can
 * start while they are running.
 *
 * Note: teams-search was moved to inline execution (KQL parallel search,
 * ~15-25s) and no longer needs background mode.
 */
const BACKGROUND_STEPS: ReadonlySet<string> = new Set([
  // Currently empty — teams-search is now inline
])

/**
 * REPL-only tools that hang in headless SDK mode.
 * These are Claude Code built-in tools designed for interactive terminal sessions.
 * They must be denied in automated SDK step sessions to prevent hangs (ISS-079).
 */
const REPL_ONLY_TOOLS: ReadonlySet<string> = new Set([
  'TodoWrite',
  'TodoRead',
  'TaskCreate',
  'TaskUpdate',
  'TaskList',
  'TaskGet',
  'EnterPlanMode',
  'ExitPlanMode',
])

/**
 * Create a canUseTool callback that intercepts AskUserQuestion tool calls.
 * Modeled after the issue-track pattern in issues.ts.
 *
 * Uses a closure over getSessionId so that the session ID can be backfilled
 * after it becomes available from the SDK message stream. (ISS-029 pattern)
 *
 * Also blocks REPL-only tools (TodoWrite, TaskCreate, etc.) that hang in
 * headless SDK mode (ISS-079).
 *
 * For automated steps (data-refresh, compliance-check, etc.), AskUserQuestion
 * is denied WITHOUT interrupting — the model continues autonomously.
 * For interactive steps (troubleshoot, draft-email), AskUserQuestion is
 * intercepted and forwarded to the dashboard UI for user response.
 */
function createStepCanUseTool(
  caseNumber: string,
  stepName: string,
  getSessionId: () => string | undefined,
): CanUseTool {
  return async (toolName, input, _options) => {
    // Block REPL-only tools that hang in headless SDK mode (ISS-079)
    if (REPL_ONLY_TOOLS.has(toolName)) {
      return {
        behavior: 'deny' as const,
        message: 'Task tracking tools (TodoWrite, TaskCreate, etc.) are not available in automated SDK sessions. Skip task management and proceed directly with the actual work.',
      }
    }

    if (toolName === 'AskUserQuestion') {
      // For automated steps, deny without interrupting — model should proceed
      if (!INTERACTIVE_STEPS.has(stepName)) {
        return {
          behavior: 'deny' as const,
          message: 'This is an automated step. Do not ask for approval or confirmation — proceed with all operations autonomously. Execute all bash commands and operations without asking.',
        }
      }

      // For interactive steps, intercept and forward to dashboard UI
      const rawQuestions = (input as any).questions || []
      const questions: CaseStepQuestion[] = rawQuestions.map((q: any) => ({
        question: q.question || '',
        header: q.header,
        options: q.options?.map((o: any) => ({ label: o.label, description: o.description })),
        multiSelect: q.multiSelect,
      }))

      const sessionId = getSessionId()
      // Always store pendingQuestion — even if sessionId is not yet available.
      // If sessionId is missing now, it will be backfilled by processStepMessages
      // once session_id is captured from the message stream.
      caseStepState.setPendingQuestion(caseNumber, sessionId || '', questions)

      const questionMsg = {
        kind: 'question' as const,
        questions,
        sessionId,
        content: questions.map(q => q.question).join('; '),
        timestamp: new Date().toISOString(),
      }
      sseManager.broadcast('case-step-question', {
        caseNumber,
        sessionId,
        questions,
        timestamp: questionMsg.timestamp,
      })
      caseStepState.addMessage(caseNumber, questionMsg)

      return { behavior: 'deny' as const, message: 'Question forwarded to dashboard UI', interrupt: true }
    }
    return { behavior: 'allow' as const }
  }
}

/**
 * Extract a human-readable summary from tool input.
 * Shows what the tool is doing (command, query, file path, search message, etc.)
 */
function summarizeToolInput(toolName: string, input: any): string {
  if (!input || typeof input !== 'object') return ''
  try {
    // Bash: show the command being run
    if (toolName === 'Bash' && input.command) {
      return input.command.slice(0, 500)
    }
    // Read/Write/Edit: show file path
    if ((toolName === 'Read' || toolName === 'Write' || toolName === 'Edit') && input.file_path) {
      return input.file_path
    }
    // Glob: show pattern
    if (toolName === 'Glob' && input.pattern) {
      return input.pattern
    }
    // Grep: show search pattern
    if (toolName === 'Grep' && input.pattern) {
      return `/${input.pattern}/` + (input.path ? ` in ${input.path}` : '')
    }
    // Agent: show prompt summary (expanded to 500 chars to avoid truncation)
    if (toolName === 'Agent' && input.prompt) {
      return input.prompt.slice(0, 500)
    }
    // Teams MCP tools: show message/query
    if (toolName === 'mcp__teams__SearchTeamsMessages' && input.message) {
      return `Search: ${input.message}`
    }
    if (toolName === 'mcp__teams__ListChatMessages' && input.chatId) {
      return `Chat: ${input.chatId.slice(0, 60)}`
    }
    // WebFetch/WebSearch
    if (input.url) return input.url
    if (input.query) return input.query
    // Generic: show first string-valued key
    for (const key of Object.keys(input)) {
      if (typeof input[key] === 'string' && input[key].length > 0) {
        return `${key}: ${input[key].slice(0, 200)}`
      }
    }
  } catch {
    // ignore
  }
  return ''
}

/**
 * Process messages from the step SDK session iterator.
 * Broadcasts semantic SSE events AND writes to caseStepState for recovery.
 * Also maintains backward-compatible appendSessionMessage writes.
 *
 * Returns { interrupted, sessionId } — interrupted=true means AskUserQuestion
 * interrupted the query and we need to wait for user answer.
 */
async function processStepMessages(
  caseNumber: string,
  stepName: string,
  queryIter: AsyncIterable<any>,
  existingSessionId?: string,
  sessionRef?: { current: string | undefined },
  executionId?: string,
): Promise<{ interrupted: boolean; sessionId: string | undefined; messageCount: number; toolCalls: ToolCallRecord[]; turns: number }> {
  let capturedSessionId = existingSessionId
  let messageCount = 0
  let lastToolName: string | undefined
  const toolCalls: ToolCallRecord[] = []
  let turns = 0

  // Casework completion detection (ISS-210): When the casework agent outputs
  // a "completed" thinking message but the SDK query() hasn't returned
  // (because background agents like Teams search are still running),
  // we set a short grace timer. If no new meaningful messages arrive
  // within the grace period, we break out of the loop and trigger
  // normal completion handling.
  let completionDetected = false
  let graceExpired = false
  let completionTimer: ReturnType<typeof setTimeout> | null = null
  const COMPLETION_GRACE_MS = 30_000 // 30s grace period after completion signal

  const COMPLETION_KEYWORDS = [
    '处理完成', '流程已全部完', 'casework 完成', 'casework完成',
    'all steps completed', 'processing complete', 'Step 6',
    '全部完成', 'Show results',
  ]

  function detectCompletion(text: string): boolean {
    if (stepName !== 'casework') return false
    return COMPLETION_KEYWORDS.some(kw => text.includes(kw))
  }

  function startCompletionGrace() {
    if (completionTimer) return // already started
    completionDetected = true
    console.log(`[processStepMessages] Casework completion detected for ${caseNumber}, starting ${COMPLETION_GRACE_MS / 1000}s grace period`)
    completionTimer = setTimeout(() => {
      console.log(`[processStepMessages] Grace period expired for ${caseNumber}, will break on next message`)
      graceExpired = true
    }, COMPLETION_GRACE_MS)
  }

  try {
  for await (const message of queryIter) {
    // Check cancellation
    if (caseStepState.isCancelled(caseNumber)) {
      break
    }

    // Check if completion grace period expired (ISS-210)
    if (graceExpired) {
      console.log(`[processStepMessages] Breaking out of message loop for ${caseNumber} (grace expired, casework done)`)
      break
    }

    // Reset completion grace timer on new meaningful tool calls
    if (completionDetected && message.type === 'assistant') {
      const content = message.message?.content
      if (Array.isArray(content)) {
        const hasToolUse = content.some((b: any) => b.type === 'tool_use')
        if (hasToolUse) {
          // Agent is making new tool calls after saying "done" — reset
          if (completionTimer) { clearTimeout(completionTimer); completionTimer = null }
          completionDetected = false
          graceExpired = false
          console.log(`[processStepMessages] Casework ${caseNumber}: new tool calls after completion signal, resetting`)
        }
      }
    }

    // Capture SDK session ID
    if ((message as any).sdkSessionId && !capturedSessionId) {
      capturedSessionId = (message as any).sdkSessionId
      if (sessionRef) sessionRef.current = capturedSessionId

      // Backfill sessionId on any pendingQuestion stored before session_id was available
      const pending = caseStepState.getPendingQuestion(caseNumber)
      if (pending && !pending.sessionId) {
        caseStepState.setPendingQuestion(caseNumber, capturedSessionId!, pending.questions)
        // Re-broadcast with correct sessionId
        sseManager.broadcast('case-step-question', {
          caseNumber,
          sessionId: capturedSessionId,
          questions: pending.questions,
          timestamp: new Date().toISOString(),
        })
      }
    }

    // Also try raw session_id on SDK messages
    if ((message as any).session_id && !capturedSessionId) {
      capturedSessionId = (message as any).session_id
      if (sessionRef) sessionRef.current = capturedSessionId
    }

    // Parse assistant messages into semantic types
    if (message.type === 'assistant' && message.message?.content) {
      turns++
      const content = message.message.content
      if (Array.isArray(content)) {
        for (const block of content) {
          if (block.type === 'tool_use') {
            // Extract human-readable summary of tool input
            const toolInput = (block as any).input
            const toolContent = summarizeToolInput((block as any).name, toolInput)
            lastToolName = (block as any).name
            // Track tool call for executionSummary (ISS-136)
            toolCalls.push({ name: lastToolName!, success: true })
            const toolMsg = {
              kind: 'tool-call' as const,
              toolName: (block as any).name,
              content: toolContent,
              step: stepName,
              timestamp: new Date().toISOString(),
            }
            sseManager.broadcast('case-step-progress', {
              caseNumber,
              sessionId: capturedSessionId,
              executionId,
              ...toolMsg,
            })
            caseStepState.addMessage(caseNumber, toolMsg)
            messageCount++

            // Pipeline step detection for casework (ISS-210)
            if (stepName === 'casework') {
              const detectedStep = detectPipelineStep((block as any).name, toolContent)
              if (detectedStep && activePipelineStep[caseNumber] !== detectedStep) {
                // Mark previous step as completed
                if (activePipelineStep[caseNumber]) {
                  sseManager.broadcast('case-pipeline-step' as any, {
                    caseNumber,
                    sessionId: capturedSessionId,
                    pipelineStep: activePipelineStep[caseNumber],
                    status: 'completed',
                    timestamp: new Date().toISOString(),
                  })
                }
                // Mark new step as active
                activePipelineStep[caseNumber] = detectedStep
                sseManager.broadcast('case-pipeline-step' as any, {
                  caseNumber,
                  sessionId: capturedSessionId,
                  pipelineStep: detectedStep,
                  status: 'active',
                  timestamp: new Date().toISOString(),
                })
              }
            }
          } else if (block.type === 'text') {
            const thinkText = (block as any).text || ''
            const thinkMsg = {
              kind: 'thinking' as const,
              content: thinkText.slice(0, 800),
              step: stepName,
              timestamp: new Date().toISOString(),
            }
            sseManager.broadcast('case-step-progress', {
              caseNumber,
              sessionId: capturedSessionId,
              executionId,
              ...thinkMsg,
            })
            caseStepState.addMessage(caseNumber, thinkMsg)
            messageCount++

            // Casework completion detection (ISS-210)
            if (!completionDetected && detectCompletion(thinkText)) {
              startCompletionGrace()
            }
          }
        }
      }
    }

    // Parse tool_result messages into semantic 'tool-result' kind
    if (message.type === 'tool_result') {
      // Check if tool_result indicates an error (ISS-136)
      const isError = (message as any).is_error === true
      if (isError && toolCalls.length > 0) {
        const lastCall = toolCalls[toolCalls.length - 1]
        lastCall.success = false
        const errText = typeof message.content === 'string' ? message.content.slice(0, 200) : ''
        if (errText) lastCall.error = errText
      }
      const resultContent = typeof message.content === 'string'
        ? message.content.slice(0, 500)
        : typeof message.text === 'string'
          ? message.text.slice(0, 500)
          : ''
      if (resultContent) {
        const resultMsg = {
          kind: 'tool-result' as const,
          toolName: lastToolName,
          content: resultContent,
          step: stepName,
          timestamp: new Date().toISOString(),
        }
        sseManager.broadcast('case-step-progress', {
          caseNumber,
          sessionId: capturedSessionId,
          executionId,
          ...resultMsg,
        })
        caseStepState.addMessage(caseNumber, resultMsg)
        messageCount++
      }
    }

    // Also broadcast raw SSE events for backward compatibility
    // Exclude 'result' type — it would emit 'case-session-completed' which duplicates
    // the explicit 'case-step-completed' broadcast after the message loop completes.
    if (message.type !== 'assistant' && message.type !== 'tool_result' && message.type !== 'result') {
      messageCount++
      const eventType = getSSEEventType(message)
      const formatted = formatMessageForSSE(message)
      sseManager.broadcast(eventType as any, {
        caseNumber,
        step: stepName,
        sessionId: capturedSessionId,
        executionId,
        ...formatted,
      })
    }

    // Persist message for backward-compatible recovery
    const formatted = formatMessageForSSE(message)
    if (typeof formatted.content === 'string' && formatted.content.trim()) {
      appendSessionMessage(caseNumber, {
        type: getPersistedMessageType(message),
        content: formatted.content,
        toolName: formatted.toolName as string,
        step: stepName,
        timestamp: formatted.timestamp as string || new Date().toISOString(),
      })
    }
  }
  } finally {
    // Clean up completion grace timer
    if (completionTimer) {
      clearTimeout(completionTimer)
      completionTimer = null
    }
  }

  // If we have a pending question, the query was interrupted
  const interrupted = !!caseStepState.getPendingQuestion(caseNumber)
  return { interrupted, sessionId: capturedSessionId, messageCount, toolCalls, turns }
}

/**
 * Resume a step session after user answers a question.
 * Supports multiple rounds of Q&A.
 */
async function resumeStepSession(
  caseNumber: string,
  stepName: string,
  sessionId: string,
  answer: string,
  stepStartedAt: string,
): Promise<void> {
  try {
    const sessionRef: { current: string | undefined } = { current: sessionId }
    const canUseTool = createStepCanUseTool(caseNumber, stepName, () => sessionRef.current)

    const abortCtrl = new AbortController()
    const queryIter = chatCaseSession(sessionId, answer, canUseTool)
    const timedIter = withInactivityTimeout(queryIter, abortCtrl, INACTIVITY_TIMEOUT_MS, `resume:${stepName}:${caseNumber}`)
    const result = await processStepMessages(caseNumber, stepName, timedIter, sessionId, sessionRef)

    if (result.interrupted) {
      // Another question — wait for next answer
      console.log(`[step-answer] Session ${sessionId} interrupted again for ${caseNumber}`)
      return
    }

    // Completed — finalize step
    caseStepState.addMessage(caseNumber, {
      kind: 'completed',
      content: `Step "${stepName}" completed`,
      step: stepName,
      timestamp: new Date().toISOString(),
    })
    caseStepState.finish(caseNumber)

    const executionSummary = buildExecutionSummary(
      result.toolCalls,
      stepName,
      result.turns,
    )

    sseManager.broadcast('case-step-completed', {
      caseNumber,
      step: stepName,
      sessionId: result.sessionId,
      executionSummary,
    })

    appendSessionMessage(caseNumber, {
      type: 'completed',
      content: `Step "${stepName}" completed`,
      step: stepName,
      timestamp: new Date().toISOString(),
    })

    writeStepLog(caseNumber, stepName, {
      status: 'completed',
      startedAt: stepStartedAt,
      messageCount: result.messageCount,
    })

    // Release the operation lock
    releaseCaseOperationLock(caseNumber)
  } catch (err: any) {
    console.error(`[step-answer] Resume failed for ${caseNumber}:`, err.message)
    const errorMsg = {
      kind: 'error' as const,
      error: err.message,
      step: stepName,
      timestamp: new Date().toISOString(),
    }
    caseStepState.addMessage(caseNumber, errorMsg)
    caseStepState.finish(caseNumber)

    sseManager.broadcast('case-step-failed', {
      caseNumber,
      step: stepName,
      error: err.message,
    })

    writeStepLog(caseNumber, stepName, {
      status: 'failed',
      startedAt: stepStartedAt,
      error: err.message,
    })

    releaseCaseOperationLock(caseNumber)
  }
}

// POST /case/:id/step/:step — 执行单个步骤
stepRoutes.post('/case/:id/step/:step', async (c) => {
  const caseNumber = c.req.param('id')
  const stepName = c.req.param('step') as StepName

  if (!getValidSteps().includes(stepName)) {
    return c.json({
      error: `Invalid step: ${stepName}`,
      validSteps: getValidSteps(),
    }, 400)
  }

  // Background steps (e.g. teams-search) run concurrently — skip lock
  const isBackground = BACKGROUND_STEPS.has(stepName)

  if (!isBackground) {
    // Clean up stale/paused sessions from previous operations (ISS-210)
    cleanupStaleSessions(caseNumber)

    // Pre-check: for casework, detect if case is Resolved/Cancelled in D365 → auto-archive
    if (stepName === 'casework') {
      try {
        const detectScript = join(config.projectRoot, 'skills', 'd365-case-ops', 'scripts', 'detect-case-status.ps1')
        if (existsSync(detectScript)) {
          const { execSync } = await import('child_process')
          const detectOutput = execSync(
            `pwsh -NoProfile -File "${detectScript}" -CasesRoot "${config.casesDir}" -CaseNumbers "${caseNumber}" -SkipClosureCheck`,
            { cwd: config.projectRoot, encoding: 'utf-8', timeout: 30_000 },
          )
          const jsonMatch = detectOutput.match(/\[[\s\S]*\]/)
          if (jsonMatch) {
            const entries = JSON.parse(jsonMatch[0])
            if (entries.length > 0) {
              const entry = entries[0]
              // Case is no longer active in D365 — archive it
              const srcDir = join(config.activeCasesDir, caseNumber)
              const targetBase = entry.targetFolder === 'transfer'
                ? join(config.casesDir, 'transfer')
                : join(config.casesDir, 'archived')
              const { mkdirSync, renameSync } = await import('fs')
              if (!existsSync(targetBase)) mkdirSync(targetBase, { recursive: true })
              const destDir = join(targetBase, caseNumber)
              renameSync(srcDir, destDir)
              console.log(`[step-precheck] Archived ${caseNumber} → ${entry.targetFolder} (${entry.reason})`)

              // Broadcast update
              sseManager.broadcast('case-updated' as any, { caseNumber, action: 'archived', reason: entry.reason })

              return c.json({
                status: 'archived',
                caseNumber,
                reason: entry.reason,
                targetFolder: entry.targetFolder,
                message: `Case ${caseNumber} has been ${entry.targetFolder === 'transfer' ? 'transferred' : 'archived'} (${entry.reason}). No casework needed.`,
              }, 200)
            }
          }
        }
      } catch (err) {
        // Pre-check failed — non-blocking, continue with casework
        console.warn(`[step-precheck] detect-case-status failed for ${caseNumber}:`, (err as Error).message)
      }
    }

    // Check if case already has an active operation (prevent duplicate spawn)
    const existingOp = getActiveCaseOperation(caseNumber)
    if (existingOp) {
      return c.json({
        error: 'Case already has an active operation',
        activeOperation: existingOp,
      }, 409)
    }

    // Acquire operation lock
    if (!acquireCaseOperationLock(caseNumber, stepName)) {
      return c.json({
        error: 'Failed to acquire operation lock (race condition)',
        activeOperation: getActiveCaseOperation(caseNumber),
      }, 409)
    }
  }

  // Parse optional body params (e.g. emailType for draft-email, forceRefresh/fullSearch for teams-search)
  let bodyParams: { emailType?: string; forceRefresh?: boolean; fullSearch?: boolean } = {}
  try {
    const body = await c.req.json()
    if (body?.emailType) bodyParams.emailType = body.emailType
    if (body?.forceRefresh) bodyParams.forceRefresh = true
    if (body?.fullSearch) bodyParams.fullSearch = true
  } catch {
    // No body or invalid JSON — fine, use defaults
  }

  const activeSessionId = getActiveSessionForCase(caseNumber)

  // Generate a unique execution ID per step button click
  // This separates message streams even when the underlying SDK session is reused
  const executionId = `${stepName}-${Date.now()}`

  try {
    const stepAsync = async () => {
      const stepStartedAt = new Date().toISOString()

      // Initialize step state (for recovery + semantic events)
      caseStepState.start(caseNumber, stepName, executionId)

      // Broadcast step-started event with executionId so frontend can create a new tab
      const emailTypeLabel = bodyParams.emailType && bodyParams.emailType !== 'auto'
        ? ` (${bodyParams.emailType})`
        : ' (AI Auto-detect)'
      sseManager.broadcast('case-step-started', {
        caseNumber,
        step: stepName,
        executionId,
        startedAt: stepStartedAt,
        ...(stepName === 'draft-email' ? { emailType: bodyParams.emailType || 'auto' } : {}),
        // Include pipeline steps definition for casework (ISS-210)
        ...(stepName === 'casework' ? {
          pipelineSteps: CASEWORK_PIPELINE_STEPS.map(s => ({ id: s.id, label: s.label, status: 'pending' })),
          agentSpawns: AGENT_SPAWNS.map(a => ({ id: a.id, label: a.label, status: 'idle' })),
        } : {}),
      })

      // Start pipeline poller for casework (ISS-210 v2)
      // Polls timing marker files every 3s for precise step tracking
      if (stepName === 'casework') {
        startPipelinePoller(caseNumber)
      }

      // Notify Agent Monitor to refresh session list (ISS-082)
      sseManager.broadcast('sessions-changed' as any, { reason: 'step-started', caseNumber, step: stepName })
      caseStepState.addMessage(caseNumber, {
        kind: 'started',
        content: `Step "${stepName}"${stepName === 'draft-email' ? emailTypeLabel : ''} started`,
        step: stepName,
        timestamp: stepStartedAt,
      })

      // Clear previous persisted messages for this step only (other steps preserved)
      clearStepSessionMessages(caseNumber, stepName)
      appendSessionMessage(caseNumber, {
        type: 'system',
        content: `Step "${stepName}"${stepName === 'draft-email' ? emailTypeLabel : ''} started`,
        step: stepName,
        timestamp: stepStartedAt,
      })

      // Create canUseTool for AskUserQuestion interception
      const sessionRef: { current: string | undefined } = { current: activeSessionId || undefined }
      const canUseTool = createStepCanUseTool(caseNumber, stepName, () => sessionRef.current)

      try {
        const abortCtrl = new AbortController()
        const queryIter = stepCaseSession(caseNumber, stepName, {
          ...bodyParams,
          canUseTool,
        })
        const timedIter = withInactivityTimeout(queryIter, abortCtrl, INACTIVITY_TIMEOUT_MS, `step:${stepName}:${caseNumber}`)

        const result = await processStepMessages(
          caseNumber, stepName, timedIter, activeSessionId || undefined, sessionRef, executionId,
        )

        if (result.interrupted) {
          // AskUserQuestion interrupted — keep the lock, wait for user answer via step-answer
          console.log(`[step] Step "${stepName}" interrupted by AskUserQuestion for case ${caseNumber}`)
          // Store stepStartedAt so resumeStepSession can use it for the log
          // The lock remains acquired; it will be released when the step completes or fails
          return
        }

        // Step completed normally
        caseStepState.addMessage(caseNumber, {
          kind: 'completed',
          content: `Step "${stepName}" completed`,
          step: stepName,
          timestamp: new Date().toISOString(),
        })
        caseStepState.finish(caseNumber)

        const executionSummary = buildExecutionSummary(
          result.toolCalls,
          stepName,
          result.turns,
        )

        sseManager.broadcast('case-step-completed', {
          caseNumber,
          step: stepName,
          sessionId: result.sessionId || activeSessionId,
          executionId,
          executionSummary,
        })
        // Complete any active pipeline step (ISS-210)
        if (stepName === 'casework') {
          stopPipelinePoller(caseNumber)
          // Do one final poll to catch any last-second timing markers
          const logsDir = join(config.activeCasesDir, caseNumber, 'logs')
          for (const step of CASEWORK_PIPELINE_STEPS) {
            const startTs = readTimingMarker(logsDir, step.startMarker)
            const endTs = readTimingMarker(logsDir, step.endMarker)
            const finalStatus = endTs ? 'completed' : startTs ? 'failed' : 'skipped'
            const durationMs = (startTs && endTs) ? (endTs - startTs) * 1000 : undefined
            sseManager.broadcast('case-pipeline-step' as any, {
              caseNumber,
              pipelineStep: step.id,
              status: finalStatus,
              durationMs,
              timestamp: new Date().toISOString(),
            })
          }
          // Broadcast final agent spawn status
          for (const agent of AGENT_SPAWNS) {
            const startTs = readTimingMarker(logsDir, agent.startMarker)
            const endTs = readTimingMarker(logsDir, agent.endMarker)
            // Skip cache-skipped agents (start == end, 0s duration)
            if (startTs && endTs && endTs - startTs === 0) continue
            if (startTs) {
              sseManager.broadcast('case-agent-spawn' as any, {
                caseNumber,
                agentId: agent.id,
                agentLabel: agent.label,
                status: endTs ? 'completed' : 'timeout',
                durationMs: endTs ? (endTs - startTs) * 1000 : (Math.floor(Date.now() / 1000) - startTs) * 1000,
                timestamp: new Date().toISOString(),
              })
            }
          }
          delete activePipelineStep[caseNumber]
        }
        // Notify Agent Monitor to refresh session list (ISS-082)
        sseManager.broadcast('sessions-changed' as any, { reason: 'step-completed', caseNumber, step: stepName })

        appendSessionMessage(caseNumber, {
          type: 'completed',
          content: `Step "${stepName}" completed`,
          step: stepName,
          timestamp: new Date().toISOString(),
        })

        writeStepLog(caseNumber, stepName, {
          status: 'completed',
          startedAt: stepStartedAt,
          messageCount: result.messageCount,
        })

        // Release lock on completion (background steps don't hold a lock)
        if (!isBackground) releaseCaseOperationLock(caseNumber)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err)

        caseStepState.addMessage(caseNumber, {
          kind: 'error',
          error: errorMsg,
          step: stepName,
          timestamp: new Date().toISOString(),
        })
        caseStepState.finish(caseNumber)

        sseManager.broadcast('case-step-failed', {
          caseNumber,
          step: stepName,
          error: errorMsg,
          executionId,
        })
        // Fail any active pipeline step (ISS-210)
        if (stepName === 'casework') {
          stopPipelinePoller(caseNumber)
          delete activePipelineStep[caseNumber]
        }
        // Notify Agent Monitor to refresh session list (ISS-082)
        sseManager.broadcast('sessions-changed' as any, { reason: 'step-failed', caseNumber, step: stepName })

        writeStepLog(caseNumber, stepName, {
          status: 'failed',
          startedAt: stepStartedAt,
          error: errorMsg,
        })

        if (!isBackground) releaseCaseOperationLock(caseNumber)
      }
    }

    sdkQueue.enqueue(stepAsync, `step:${stepName}:${caseNumber}`, caseNumber) // Fire and forget via queue
    return c.json({
      status: 'started',
      caseNumber,
      step: stepName,
      existingSession: activeSessionId || null,
    }, 202)
  } catch (err) {
    if (!isBackground) releaseCaseOperationLock(caseNumber)
    const msg = err instanceof Error ? err.message : String(err)
    return c.json({ error: msg }, 500)
  }
})

// POST /case/:id/step-answer — submit user answer to a pending question
stepRoutes.post('/case/:id/step-answer', async (c) => {
  const caseNumber = c.req.param('id')
  const body = await c.req.json()
  const answer = body.answer

  if (!answer || typeof answer !== 'string' || !answer.trim()) {
    return c.json({ error: 'answer is required' }, 400)
  }

  const pending = caseStepState.getPendingQuestion(caseNumber)
  if (!pending) {
    return c.json({ error: 'No pending question for this case' }, 404)
  }

  const { sessionId } = pending
  if (!sessionId) {
    console.warn(`[step-answer] sessionId is empty for ${caseNumber} — session may not be resumable`)
  }

  caseStepState.clearPendingQuestion(caseNumber)

  // Add a thinking message to show the answer was received
  const answerMsg = {
    kind: 'thinking' as const,
    content: `Answer received: ${answer.trim().slice(0, 200)}`,
    step: caseStepState.getState(caseNumber)?.currentStep,
    timestamp: new Date().toISOString(),
  }
  sseManager.broadcast('case-step-progress', { caseNumber, ...answerMsg })
  caseStepState.addMessage(caseNumber, answerMsg)

  // Get the step name and start time from the active operation for logging
  const activeOp = getActiveCaseOperation(caseNumber)
  const stepName = activeOp?.operationType || 'unknown'
  const stepStartedAt = activeOp?.startedAt || new Date().toISOString()

  // Resume asynchronously — fire and forget
  resumeStepSession(caseNumber, stepName, sessionId, answer.trim(), stepStartedAt)

  return c.json({ ok: true })
})

// GET /case/:id/step-progress — recovery endpoint for page refresh
stepRoutes.get('/case/:id/step-progress', (c) => {
  const caseNumber = c.req.param('id')
  const state = caseStepState.getState(caseNumber)

  if (!state) {
    return c.json({
      messages: [],
      isActive: false,
      pendingQuestion: null,
      currentStep: null,
    })
  }

  return c.json({
    messages: state.messages,
    isActive: state.isActive,
    pendingQuestion: state.pendingQuestion ?? null,
    currentStep: state.currentStep ?? null,
    executionId: state.executionId ?? null,
  })
})

// GET /case/:id/step — 列出可用步骤
stepRoutes.get('/case/:id/step', (c) => {
  const caseNumber = c.req.param('id')
  const activeSessionId = getActiveSessionForCase(caseNumber)

  return c.json({
    caseNumber,
    activeSession: activeSessionId || null,
    availableSteps: getValidSteps().map((step) => ({
      name: step,
      url: `/api/case/${caseNumber}/step/${step}`,
    })),
  })
})

// POST /case/:id/step-cancel — cancel an active step execution
stepRoutes.post('/case/:id/step-cancel', (c) => {
  const caseNumber = c.req.param('id')

  const activeOp = getActiveCaseOperation(caseNumber)
  if (!activeOp && !caseStepState.isActive(caseNumber)) {
    return c.json({ error: 'No active step to cancel' }, 404)
  }

  const stepName = activeOp?.operationType || caseStepState.getState(caseNumber)?.currentStep || 'unknown'
  const executionId = caseStepState.getState(caseNumber)?.executionId

  // Cancel the step state (processStepMessages will break out of loop)
  caseStepState.cancel(caseNumber)

  // Abort the underlying SDK query to terminate child processes (ISS-086)
  abortQuery(caseNumber)

  // Release the operation lock so buttons are re-enabled
  releaseCaseOperationLock(caseNumber)

  // End the SDK session
  const sessionId = getActiveSessionForCase(caseNumber)
  if (sessionId) {
    endSession(sessionId)
  }

  // Broadcast cancellation as a failed event
  sseManager.broadcast('case-step-failed', {
    caseNumber,
    step: stepName,
    error: 'Cancelled by user',
    executionId,
  })

  // Invalidate operation query so buttons are released
  // Use sessions-changed event instead of case-session-completed to avoid
  // duplicate terminal messages in the frontend (ISS-091)
  sseManager.broadcast('sessions-changed' as any, { reason: 'step-cancelled', caseNumber, step: stepName })

  return c.json({ ok: true, step: stepName })
})

export default stepRoutes

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
import {
  stepCaseSession,
  chatCaseSession,
  getActiveSessionForCase,
  acquireCaseOperationLock,
  releaseCaseOperationLock,
  getActiveCaseOperation,
  appendSessionMessage,
  clearSessionMessages,
  writeStepLog,
  endSession,
  abortQuery,
} from '../agent/case-session-manager.js'
import { sseManager } from '../watcher/sse-manager.js'
import { getSSEEventType, formatMessageForSSE, getPersistedMessageType } from '../utils/sse-helpers.js'
import { caseStepState, type CaseStepQuestion } from '../services/case-step-state.js'

const stepRoutes = new Hono()

// Valid step names
const VALID_STEPS = [
  'data-refresh',
  'compliance-check',
  'status-judge',
  'teams-search',
  'troubleshoot',
  'draft-email',
  'inspection',
  'generate-kb',
] as const

type StepName = typeof VALID_STEPS[number]

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
 * start while they are running (mirroring the casework flow where
 * teams-search runs in parallel with data-refresh).
 */
const BACKGROUND_STEPS: ReadonlySet<string> = new Set([
  'teams-search',
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
      return input.command.slice(0, 300)
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
    // Agent: show prompt summary
    if (toolName === 'Agent' && input.prompt) {
      return input.prompt.slice(0, 200)
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
): Promise<{ interrupted: boolean; sessionId: string | undefined; messageCount: number }> {
  let capturedSessionId = existingSessionId
  let messageCount = 0
  let lastToolName: string | undefined

  for await (const message of queryIter) {
    // Check cancellation
    if (caseStepState.isCancelled(caseNumber)) {
      break
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
      const content = message.message.content
      if (Array.isArray(content)) {
        for (const block of content) {
          if (block.type === 'tool_use') {
            // Extract human-readable summary of tool input
            const toolInput = (block as any).input
            const toolContent = summarizeToolInput((block as any).name, toolInput)
            lastToolName = (block as any).name
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
          } else if (block.type === 'text') {
            const thinkMsg = {
              kind: 'thinking' as const,
              content: (block as any).text.slice(0, 500),
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
          }
        }
      }
    }

    // Parse tool_result messages into semantic 'tool-result' kind
    if (message.type === 'tool_result') {
      const resultContent = typeof message.content === 'string'
        ? message.content.slice(0, 300)
        : typeof message.text === 'string'
          ? message.text.slice(0, 300)
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
    if (message.type !== 'assistant' && message.type !== 'tool_result') {
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

  // If we have a pending question, the query was interrupted
  const interrupted = !!caseStepState.getPendingQuestion(caseNumber)
  return { interrupted, sessionId: capturedSessionId, messageCount }
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

    const queryIter = chatCaseSession(sessionId, answer, canUseTool)
    const result = await processStepMessages(caseNumber, stepName, queryIter, sessionId, sessionRef)

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

    sseManager.broadcast('case-step-completed', {
      caseNumber,
      step: stepName,
      sessionId: result.sessionId,
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

  if (!VALID_STEPS.includes(stepName)) {
    return c.json({
      error: `Invalid step: ${stepName}`,
      validSteps: VALID_STEPS,
    }, 400)
  }

  // Background steps (e.g. teams-search) run concurrently — skip lock
  const isBackground = BACKGROUND_STEPS.has(stepName)

  if (!isBackground) {
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

  // Parse optional body params (e.g. emailType for draft-email)
  let bodyParams: { emailType?: string } = {}
  try {
    const body = await c.req.json()
    if (body?.emailType) bodyParams.emailType = body.emailType
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
      })
      // Notify Agent Monitor to refresh session list (ISS-082)
      sseManager.broadcast('sessions-changed' as any, { reason: 'step-started', caseNumber, step: stepName })
      caseStepState.addMessage(caseNumber, {
        kind: 'started',
        content: `Step "${stepName}"${stepName === 'draft-email' ? emailTypeLabel : ''} started`,
        step: stepName,
        timestamp: stepStartedAt,
      })

      // Clear previous persisted messages (backward compat)
      clearSessionMessages(caseNumber)
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
        const queryIter = stepCaseSession(caseNumber, stepName, {
          ...bodyParams,
          canUseTool,
        })

        const result = await processStepMessages(
          caseNumber, stepName, queryIter, activeSessionId || undefined, sessionRef, executionId,
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

        sseManager.broadcast('case-step-completed', {
          caseNumber,
          step: stepName,
          sessionId: result.sessionId || activeSessionId,
          executionId,
        })
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

    stepAsync() // Fire and forget
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
    availableSteps: VALID_STEPS.map((step) => ({
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

  // Invalidate operation query
  sseManager.broadcast('case-session-completed' as any, {
    caseNumber,
    step: stepName,
  })

  return c.json({ ok: true, step: stepName })
})

export default stepRoutes

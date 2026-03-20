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
 */
import { Hono } from 'hono'
import {
  stepCaseSession,
  getActiveSessionForCase,
  acquireCaseOperationLock,
  releaseCaseOperationLock,
  getActiveCaseOperation,
  appendSessionMessage,
  clearSessionMessages,
  writeStepLog,
} from '../agent/case-session-manager.js'
import { sseManager } from '../watcher/sse-manager.js'
import { getSSEEventType, formatMessageForSSE } from '../utils/sse-helpers.js'

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

  // Parse optional body params (e.g. emailType for draft-email)
  let bodyParams: { emailType?: string } = {}
  try {
    const body = await c.req.json()
    if (body?.emailType) bodyParams.emailType = body.emailType
  } catch {
    // No body or invalid JSON — fine, use defaults
  }

  const activeSessionId = getActiveSessionForCase(caseNumber)

  try {
    const stepAsync = async () => {
      let capturedSessionId: string | undefined
      const stepStartedAt = new Date().toISOString()
      let messageCount = 0

      // Broadcast step-started event
      const emailTypeLabel = bodyParams.emailType && bodyParams.emailType !== 'auto'
        ? ` (${bodyParams.emailType})`
        : ' (AI Auto-detect)'
      sseManager.broadcast('case-step-started' as any, {
        caseNumber,
        step: stepName,
        startedAt: stepStartedAt,
        ...(stepName === 'draft-email' ? { emailType: bodyParams.emailType || 'auto' } : {}),
      })

      // Clear previous messages and persist step start
      clearSessionMessages(caseNumber)
      appendSessionMessage(caseNumber, {
        type: 'system',
        content: `Step "${stepName}"${stepName === 'draft-email' ? emailTypeLabel : ''} started`,
        step: stepName,
        timestamp: stepStartedAt,
      })

      try {
        for await (const message of stepCaseSession(caseNumber, stepName, bodyParams)) {
          // Capture the SDK session ID
          if ((message as any).sdkSessionId && !capturedSessionId) {
            capturedSessionId = (message as any).sdkSessionId
          }

          messageCount++
          const eventType = getSSEEventType(message)
          const formatted = formatMessageForSSE(message)
          sseManager.broadcast(eventType as any, {
            caseNumber,
            step: stepName,
            sessionId: capturedSessionId || activeSessionId,
            ...formatted,
          })

          // Persist message for recovery
          appendSessionMessage(caseNumber, {
            type: formatted.messageType as string || 'system',
            content: typeof formatted.content === 'string' ? formatted.content : '',
            toolName: formatted.toolName as string,
            step: stepName,
            timestamp: formatted.timestamp as string || new Date().toISOString(),
          })
        }

        sseManager.broadcast('case-session-completed', {
          caseNumber,
          step: stepName,
          sessionId: capturedSessionId || activeSessionId,
        })
        appendSessionMessage(caseNumber, {
          type: 'completed',
          content: `Step "${stepName}" completed`,
          step: stepName,
          timestamp: new Date().toISOString(),
        })

        // Write step log on completion
        writeStepLog(caseNumber, stepName, {
          status: 'completed',
          startedAt: stepStartedAt,
          messageCount,
        })
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err)
        sseManager.broadcast('case-session-failed', {
          caseNumber,
          step: stepName,
          error: errorMsg,
        })

        // Write step log on failure
        writeStepLog(caseNumber, stepName, {
          status: 'failed',
          startedAt: stepStartedAt,
          error: errorMsg,
          messageCount,
        })
      } finally {
        // Always release the lock when operation finishes
        releaseCaseOperationLock(caseNumber)
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
    releaseCaseOperationLock(caseNumber)
    const msg = err instanceof Error ? err.message : String(err)
    return c.json({ error: msg }, 500)
  }
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

export default stepRoutes

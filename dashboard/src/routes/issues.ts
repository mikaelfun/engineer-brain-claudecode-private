/**
 * issues.ts — Issue Tracker REST API
 *
 * GET    /api/issues          — 列表（支持 ?status=&type=&priority=&page=&pageSize=）
 * GET    /api/issues/:id      — 详情
 * POST   /api/issues          — 创建
 * PUT    /api/issues/:id      — 更新
 * DELETE /api/issues/:id      — 删除
 * POST   /api/issues/:id/create-track   — 从 issue 创建 conductor track
 * POST   /api/issues/:id/track-answer   — 提交用户对 agent 问题的回答
 * POST   /api/issues/:id/start-implement — tracked → in-progress
 * POST   /api/issues/:id/verify         — 运行测试验证
 * POST   /api/issues/:id/reopen         — done → pending
 * GET    /api/issues/:id/track          — 获取关联 track metadata
 * GET    /api/issues/:id/track-plan     — 获取关联 track 的 plan.md 内容
 * GET    /api/issues/:id/track-spec     — 获取关联 track 的 spec.md 内容
 * GET    /api/issues/:id/track-progress — 获取 track 创建的进度消息（刷新恢复用）
 * GET    /api/issues/:id/implement-status — 获取 implement 进度消息（刷新恢复用 + 锁状态）
 */
import { Hono } from 'hono'
import { execSync } from 'child_process'
import { join } from 'path'
import { existsSync, readFileSync } from 'fs'
import { query, type Options, type CanUseTool } from '@anthropic-ai/claude-agent-sdk'
import { listIssues, getIssue, createIssue, updateIssue, deleteIssue } from '../services/issue-reader.js'
import { getTrackMetadata } from '../services/conductor-reader.js'
import { config } from '../config.js'
import { sseManager } from '../watcher/sse-manager.js'
import { issueTrackState, type IssueTrackQuestion } from '../services/issue-track-state.js'
import {
  acquireImplementLock,
  releaseImplementLock,
  isImplementActive,
  appendImplementMessage,
  getImplementStatus,
  type ImplementMessage,
} from '../agent/implement-session-manager.js'
import type { IssueStatus, IssueType, IssuePriority } from '../types/index.js'

const issues = new Hono()

/**
 * Validate that a track's plan.md and spec.md have real content.
 * Returns { valid: true } or { valid: false, reasons: string[] }
 */
export function validateTrackArtifacts(trackDir: string): { valid: boolean; reasons: string[] } {
  const reasons: string[] = []
  const planPath = join(trackDir, 'plan.md')
  const specPath = join(trackDir, 'spec.md')

  // Validate plan.md
  if (!existsSync(planPath)) {
    reasons.push('plan.md does not exist')
  } else {
    const planContent = readFileSync(planPath, 'utf-8')
    if (planContent.length <= 100) {
      reasons.push('plan.md is too short (<=100 chars)')
    }
    if (!/##\s*Phase|[-*]\s*\[.\]\s*Task/i.test(planContent)) {
      reasons.push('plan.md is missing Phase/Task structure')
    }
  }

  // Validate spec.md
  if (!existsSync(specPath)) {
    reasons.push('spec.md does not exist')
  } else {
    const specContent = readFileSync(specPath, 'utf-8')
    if (specContent.length <= 50) {
      reasons.push('spec.md is too short (<=50 chars)')
    }
    if (!/summary|acceptance|specification/i.test(specContent)) {
      reasons.push('spec.md is missing Summary/Acceptance Criteria/Specification keywords')
    }
  }

  return { valid: reasons.length === 0, reasons }
}

// GET /api/issues — list with optional filters + pagination
// When page/pageSize are omitted, returns ALL issues (for client-side grouping + pagination)
issues.get('/', (c) => {
  const status = c.req.query('status') as IssueStatus | undefined
  const type = c.req.query('type') as IssueType | undefined
  const priority = c.req.query('priority') as IssuePriority | undefined
  const rawPage = c.req.query('page')
  const rawPageSize = c.req.query('pageSize')

  let all = listIssues()

  // Apply filters
  if (status) all = all.filter(i => i.status === status)
  if (type) all = all.filter(i => i.type === type)
  if (priority) all = all.filter(i => i.priority === priority)

  const total = all.length

  // If no pagination params → return all issues (client-side pagination mode)
  if (!rawPage && !rawPageSize) {
    return c.json({ issues: all, total, page: 1, pageSize: total, totalPages: 1 })
  }

  // Server-side pagination (backward compatible)
  const page = parseInt(rawPage || '1', 10)
  const pageSize = parseInt(rawPageSize || '20', 10)
  const start = (page - 1) * pageSize
  const items = all.slice(start, start + pageSize)

  return c.json({ issues: items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
})

// GET /api/issues/:id — detail
issues.get('/:id', (c) => {
  const id = c.req.param('id')
  const issue = getIssue(id)
  if (!issue) return c.json({ error: 'Issue not found' }, 404)
  return c.json(issue)
})

// POST /api/issues — create
issues.post('/', async (c) => {
  const body = await c.req.json()
  if (!body.title || typeof body.title !== 'string' || !body.title.trim()) {
    return c.json({ error: 'title is required' }, 400)
  }
  const issue = createIssue({
    title: body.title.trim(),
    description: body.description || '',
    type: body.type,
    priority: body.priority,
  })
  return c.json(issue, 201)
})

// PUT /api/issues/:id — update
issues.put('/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const updated = updateIssue(id, body)
  if (!updated) return c.json({ error: 'Issue not found' }, 404)
  return c.json(updated)
})

// DELETE /api/issues/:id — delete
issues.delete('/:id', (c) => {
  const id = c.req.param('id')
  const ok = deleteIssue(id)
  if (!ok) return c.json({ error: 'Issue not found' }, 404)
  return c.json({ ok: true })
})

/**
 * Build an enhanced prompt for conductor:new-track when called with an ISS-XXX argument.
 * Injects the issue's pre-fill data and instructions to minimize interactive questions.
 *
 * The conductor:new-track skill normally asks 5-6 interactive questions. When we already
 * have issue context (title, description, type, priority), most of those questions are
 * redundant. This prompt instructs the agent to:
 * 1. Use the pre-filled issue data directly (skip Q1 summary, Q2 steps, etc.)
 * 2. Only ask 1 confirmation question (confirm the generated spec)
 * 3. Skip all test-related questions (those belong in the Verify phase)
 * 4. Generate spec.md and plan.md directly from the issue context
 */
function buildTrackPrompt(issueId: string, issue: { title: string; description: string; type?: string; priority?: string }): string {
  const typeMap: Record<string, string> = { bug: 'Bug', feature: 'Feature', refactor: 'Refactor', chore: 'Chore' }
  const trackType = typeMap[issue.type || 'bug'] || 'Bug'

  return `/conductor:new-track ${issueId}

IMPORTANT — This is a WebUI-initiated track creation with pre-filled issue context.
Follow these rules to minimize interactive questions:

## Pre-filled Issue Context (from ${issueId}.json)
- **Title:** ${issue.title}
- **Type:** ${trackType}
- **Priority:** ${issue.priority || 'P1'}
- **Description:** ${issue.description}

## Streamlined Flow
1. **Skip all specification-gathering questions** — use the pre-filled context above to generate the spec directly.
2. **Do NOT ask about testing strategy** — test decisions (unit vs UI, screenshot vs click, frontend vs backend) belong in the Verify phase and will be auto-inferred from the actual code changes.
3. **Generate spec.md immediately** from the pre-filled context, then ask ONE confirmation: "Is this specification correct? 1. Yes, proceed to plan generation / 2. No, let me edit / 3. Start over"
4. **Generate plan.md** after spec approval, then ask ONE confirmation: "Is this plan correct? 1. Yes, create the track / 2. No, let me edit"
5. **Maximum 2 interactive questions total** (spec confirmation + plan confirmation).
6. After both confirmations, create all track files (spec.md, plan.md, metadata.json, index.md), register in tracks.md, and update the issue JSON.`
}

/**
 * Shared canUseTool callback that intercepts AskUserQuestion and denies+interrupts.
 * The intercepted question data is stored in issueTrackState and broadcast via SSE.
 */
function createCanUseTool(issueId: string, getSessionId: () => string | undefined): CanUseTool {
  return async (toolName, input, _options) => {
    if (toolName === 'AskUserQuestion') {
      const rawQuestions = (input as any).questions || []
      const questions: IssueTrackQuestion[] = rawQuestions.map((q: any) => ({
        question: q.question || '',
        header: q.header,
        options: q.options?.map((o: any) => ({ label: o.label, description: o.description })),
        multiSelect: q.multiSelect,
      }))

      const sessionId = getSessionId()
      // Always store pendingQuestion — even if sessionId is not yet available.
      // If sessionId is missing now, it will be backfilled by processQueryMessages
      // once session_id is captured from the message stream. (ISS-029 fix)
      issueTrackState.setPendingQuestion(issueId, sessionId || '', questions)

      const questionMsg = {
        kind: 'question' as const,
        questions,
        sessionId,
        content: questions.map(q => q.question).join('; '),
        timestamp: new Date().toISOString(),
      }
      sseManager.broadcast('issue-track-question', {
        issueId,
        sessionId,
        questions,
        timestamp: questionMsg.timestamp,
      })
      issueTrackState.addMessage(issueId, questionMsg)

      return { behavior: 'deny' as const, message: 'Question forwarded to dashboard UI', interrupt: true }
    }
    return { behavior: 'allow' as const }
  }
}

/**
 * Process messages from a query() iterator. Broadcasts SSE events for thinking/tool-call.
 * Returns { interrupted, sessionId } — interrupted=true means canUseTool deny+interrupt stopped the query.
 *
 * If sessionRef is provided, session_id is written there immediately when captured,
 * allowing canUseTool's closure to read it in real-time (before this function returns).
 */
async function processQueryMessages(
  issueId: string,
  queryIter: AsyncIterable<any>,
  existingSessionId?: string,
  sessionRef?: { current: string | undefined },
): Promise<{ interrupted: boolean; sessionId: string | undefined }> {
  let capturedSessionId = existingSessionId
  let lastContent = ''

  for await (const message of queryIter) {
    // Capture session_id from SDK messages
    if ((message as any).session_id && !capturedSessionId) {
      capturedSessionId = (message as any).session_id
      // Update shared ref so canUseTool closure can read it immediately
      if (sessionRef) sessionRef.current = capturedSessionId

      // ISS-029: Backfill sessionId on any pendingQuestion that was stored before
      // session_id was available (stored with empty string sessionId)
      const pending = issueTrackState.getPendingQuestion(issueId)
      if (pending && !pending.sessionId) {
        issueTrackState.setPendingQuestion(issueId, capturedSessionId!, pending.questions)
        // Re-broadcast SSE with correct sessionId so frontend can update
        sseManager.broadcast('issue-track-question', {
          issueId,
          sessionId: capturedSessionId,
          questions: pending.questions,
          timestamp: new Date().toISOString(),
        })
      }
    }

    if (message.type === 'assistant' && message.message?.content) {
      const content = message.message.content
      if (Array.isArray(content)) {
        for (const block of content) {
          if (block.type === 'tool_use') {
            const toolMsg = {
              kind: 'tool-call' as const,
              toolName: (block as any).name,
              timestamp: new Date().toISOString(),
            }
            sseManager.broadcast('issue-track-progress', { issueId, ...toolMsg })
            issueTrackState.addMessage(issueId, toolMsg)
          } else if (block.type === 'text') {
            lastContent = (block as any).text.slice(0, 500)
            const thinkMsg = {
              kind: 'thinking' as const,
              content: lastContent,
              timestamp: new Date().toISOString(),
            }
            sseManager.broadcast('issue-track-progress', { issueId, ...thinkMsg })
            issueTrackState.addMessage(issueId, thinkMsg)
          }
        }
      }
    }
  }

  // If we have a pending question, the query was interrupted
  const interrupted = !!issueTrackState.getPendingQuestion(issueId)
  return { interrupted, sessionId: capturedSessionId }
}

/**
 * Post-query validation: find the generated track, validate artifacts, update issue.
 * Called after the query completes successfully (not interrupted).
 */
async function finalizeTrackCreation(issueId: string): Promise<void> {
  const tracksDir = join(config.projectRoot, 'conductor', 'tracks')
  let foundTrackId: string | null = null

  if (existsSync(tracksDir)) {
    const { readdirSync } = await import('fs')
    const dirs = readdirSync(tracksDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name)
      .sort()

    for (const dir of dirs) {
      const specPath = join(tracksDir, dir, 'spec.md')
      if (existsSync(specPath)) {
        const specContent = readFileSync(specPath, 'utf-8')
        if (specContent.includes(issueId)) {
          foundTrackId = dir
          break
        }
      }
    }
  }

  let planSummary: string | null = null
  if (foundTrackId) {
    const trackDir = join(config.projectRoot, 'conductor', 'tracks', foundTrackId)
    const validation = validateTrackArtifacts(trackDir)

    if (validation.valid) {
      updateIssue(issueId, { trackId: foundTrackId, status: 'tracked' as IssueStatus })
      const planPath = join(trackDir, 'plan.md')
      planSummary = readFileSync(planPath, 'utf-8').slice(0, 2000)
    } else {
      const errorDetail = `Track directory "${foundTrackId}" was created but artifacts are incomplete: ${validation.reasons.join('; ')}`
      console.error(`[create-track] Validation failed for ${issueId}: ${errorDetail}`)
      updateIssue(issueId, { status: 'pending' as IssueStatus })
      const errorMsg = { kind: 'error' as const, error: errorDetail, timestamp: new Date().toISOString() }
      sseManager.broadcast('issue-track-error', { issueId, error: errorDetail, timestamp: errorMsg.timestamp })
      issueTrackState.addMessage(issueId, errorMsg)
      issueTrackState.finish(issueId)
      return
    }
  } else {
    updateIssue(issueId, { status: 'pending' as IssueStatus })
    const errorDetail = 'Track creation failed: no track directory was generated. The agent may have timed out or encountered an error.'
    console.error(`[create-track] No track found for ${issueId}: ${errorDetail}`)
    const errorMsg = { kind: 'error' as const, error: errorDetail, timestamp: new Date().toISOString() }
    sseManager.broadcast('issue-track-error', { issueId, error: errorDetail, timestamp: errorMsg.timestamp })
    issueTrackState.addMessage(issueId, errorMsg)
    issueTrackState.finish(issueId)
    return
  }

  const completedMsg = {
    kind: 'completed' as const,
    trackId: foundTrackId ?? undefined,
    planSummary: planSummary ?? undefined,
    timestamp: new Date().toISOString(),
  }
  sseManager.broadcast('issue-track-completed', {
    issueId,
    trackId: foundTrackId,
    planSummary,
    timestamp: completedMsg.timestamp,
  })
  issueTrackState.addMessage(issueId, completedMsg)
  issueTrackState.finish(issueId)
}

// POST /api/issues/:id/create-track — create conductor track from issue via Claude session
issues.post('/:id/create-track', async (c) => {
  const id = c.req.param('id')
  const issue = getIssue(id)
  if (!issue) return c.json({ error: 'Issue not found' }, 404)
  if (issue.status !== 'pending' || issue.trackId) {
    return c.json({ error: 'Issue must be pending with no existing trackId' }, 400)
  }

  // Update status to 'tracking' (intermediate state during agent execution)
  const updated = updateIssue(id, { status: 'tracking' as IssueStatus })

  // Spawn track creation asynchronously
  const trackAsync = async () => {
    // Use shared mutable ref so canUseTool closure can read sessionId in real-time
    // (before processQueryMessages returns). Fixes ISS-027 timing bug.
    const sessionRef: { current: string | undefined } = { current: undefined }

    try {
      // Initialize progress state
      issueTrackState.start(id)

      sseManager.broadcast('issue-track-started', {
        issueId: id,
        issueTitle: issue.title,
        timestamp: new Date().toISOString(),
      })
      issueTrackState.addMessage(id, {
        kind: 'started',
        content: `Track creation started for ${issue.title}`,
        timestamp: new Date().toISOString(),
      })

      const canUseTool = createCanUseTool(id, () => sessionRef.current)

      const queryIter = query({
        prompt: buildTrackPrompt(id, issue),
        options: {
          cwd: config.projectRoot,
          settingSources: ['project'] as Options['settingSources'],
          systemPrompt: {
            type: 'preset' as const,
            preset: 'claude_code' as const,
          },
          allowedTools: ['Read', 'Write', 'Edit', 'Bash', 'Glob', 'Grep', 'Agent', 'Skill'],
          permissionMode: 'acceptEdits',
          maxTurns: 40,
          canUseTool,
        },
      })

      const result = await processQueryMessages(id, queryIter, undefined, sessionRef)
      // sessionRef.current is already updated during iteration; sync back for clarity
      sessionRef.current = result.sessionId

      if (result.interrupted) {
        // Query was interrupted by AskUserQuestion → wait for user answer via track-answer endpoint
        console.log(`[create-track] Interrupted for ${id}, waiting for user answer (session: ${sessionRef.current})`)
        return
      }

      // Query completed without interruption → finalize
      await finalizeTrackCreation(id)
    } catch (err: any) {
      console.error(`[create-track] Failed for ${id}:`, err.message)
      updateIssue(id, { status: 'pending' as IssueStatus })
      const errorMsg = { kind: 'error' as const, error: err.message, timestamp: new Date().toISOString() }
      sseManager.broadcast('issue-track-error', { issueId: id, error: err.message, timestamp: errorMsg.timestamp })
      issueTrackState.addMessage(id, errorMsg)
      issueTrackState.finish(id)
    }
  }

  trackAsync() // Fire and forget
  return c.json({ issue: updated, message: `Track creation started for issue ${id}` })
})

/**
 * Resume an interrupted session with the user's answer.
 * Supports multiple rounds of Q&A — if the resumed session asks another question,
 * it will interrupt again and wait for the next answer via track-answer.
 */
async function resumeTrackSession(issueId: string, sessionId: string, answer: string): Promise<void> {
  try {
    // Use shared mutable ref for consistency with trackAsync pattern (ISS-027)
    const sessionRef: { current: string | undefined } = { current: sessionId }
    const canUseTool = createCanUseTool(issueId, () => sessionRef.current)

    const queryIter = query({
      prompt: answer,
      options: {
        resume: sessionId,
        cwd: config.projectRoot,
        settingSources: ['project'] as Options['settingSources'],
        systemPrompt: {
          type: 'preset' as const,
          preset: 'claude_code' as const,
        },
        allowedTools: ['Read', 'Write', 'Edit', 'Bash', 'Glob', 'Grep', 'Agent', 'Skill'],
        permissionMode: 'acceptEdits',
        maxTurns: 40,
        canUseTool,
      },
    })

    const result = await processQueryMessages(issueId, queryIter, sessionId, sessionRef)

    if (result.interrupted) {
      // Another question — wait for next answer
      console.log(`[track-answer] Session ${sessionId} interrupted again for ${issueId}`)
      return
    }

    // Completed — finalize
    await finalizeTrackCreation(issueId)
  } catch (err: any) {
    console.error(`[track-answer] Resume failed for ${issueId}:`, err.message)
    updateIssue(issueId, { status: 'pending' as IssueStatus })
    const errorMsg = { kind: 'error' as const, error: err.message, timestamp: new Date().toISOString() }
    sseManager.broadcast('issue-track-error', { issueId, error: err.message, timestamp: errorMsg.timestamp })
    issueTrackState.addMessage(issueId, errorMsg)
    issueTrackState.finish(issueId)
  }
}

// POST /api/issues/:id/track-answer — submit user answer to a pending question
issues.post('/:id/track-answer', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const answer = body.answer

  if (!answer || typeof answer !== 'string' || !answer.trim()) {
    return c.json({ error: 'answer is required' }, 400)
  }

  const pending = issueTrackState.getPendingQuestion(id)
  if (!pending) {
    return c.json({ error: 'No pending question for this issue' }, 404)
  }

  // ISS-029: Use stored sessionId (may have been backfilled after initial empty store).
  // If sessionId is still empty, it means session_id was never captured — this is a
  // fatal state. Log a warning but still try to proceed by checking sessionRef pattern.
  const { sessionId } = pending
  if (!sessionId) {
    console.warn(`[track-answer] sessionId is empty for ${id} — session may not be resumable`)
  }
  issueTrackState.clearPendingQuestion(id)

  // Add a thinking message to show the answer was received
  const answerMsg = {
    kind: 'thinking' as const,
    content: `Answer received: ${answer.trim().slice(0, 200)}`,
    timestamp: new Date().toISOString(),
  }
  sseManager.broadcast('issue-track-progress', { issueId: id, ...answerMsg })
  issueTrackState.addMessage(id, answerMsg)

  // Resume asynchronously — fire and forget
  resumeTrackSession(id, sessionId, answer.trim())

  return c.json({ ok: true })
})

// POST /api/issues/:id/start-implement — tracked → in-progress, spawn conductor:implement
issues.post('/:id/start-implement', async (c) => {
  const id = c.req.param('id')
  const issue = getIssue(id)
  if (!issue) return c.json({ error: 'Issue not found' }, 404)
  if (issue.status !== 'tracked' && issue.status !== 'pending') {
    return c.json({ error: 'Issue must be in tracked or pending status' }, 400)
  }
  if (!issue.trackId) {
    return c.json({ error: 'Issue has no associated trackId' }, 400)
  }

  const trackId = issue.trackId

  // Acquire operation lock (prevents duplicate concurrent implements)
  if (!acquireImplementLock(id, trackId)) {
    return c.json({ error: 'Implementation already in progress for this issue' }, 409)
  }

  // Update status immediately
  const updated = updateIssue(id, { status: 'in-progress' })

  // Spawn conductor:implement asynchronously
  const implementAsync = async () => {
    try {
      const startedMsg: ImplementMessage = {
        type: 'started',
        content: `Implementation started for track ${trackId}`,
        timestamp: new Date().toISOString(),
      }
      appendImplementMessage(id, startedMsg)
      sseManager.broadcast('issue-implement-started', {
        issueId: id,
        trackId,
        timestamp: startedMsg.timestamp,
      })

      for await (const message of query({
        prompt: `/conductor:implement ${trackId}`,
        options: {
          cwd: config.projectRoot,
          settingSources: ['project'] as Options['settingSources'],
          systemPrompt: {
            type: 'preset' as const,
            preset: 'claude_code' as const,
          },
          allowedTools: ['Read', 'Write', 'Edit', 'Bash', 'Glob', 'Grep', 'Agent', 'Skill'],
          permissionMode: 'acceptEdits',
          maxTurns: 80,
        },
      })) {
        // Fine-grained SSE: thinking / tool-call / tool-result
        if (message.type === 'assistant' && message.message?.content) {
          const content = message.message.content
          if (Array.isArray(content)) {
            for (const block of content) {
              if (block.type === 'tool_use') {
                const toolMsg: ImplementMessage = {
                  type: 'tool-call',
                  content: (block as any).name || 'tool',
                  toolName: (block as any).name,
                  timestamp: new Date().toISOString(),
                }
                appendImplementMessage(id, toolMsg)
                sseManager.broadcast('issue-implement-progress', {
                  issueId: id, trackId, kind: 'tool-call',
                  toolName: (block as any).name,
                  timestamp: toolMsg.timestamp,
                })
              } else if (block.type === 'text') {
                const thinkMsg: ImplementMessage = {
                  type: 'thinking',
                  content: (block as any).text?.slice(0, 500) || '',
                  timestamp: new Date().toISOString(),
                }
                appendImplementMessage(id, thinkMsg)
                sseManager.broadcast('issue-implement-progress', {
                  issueId: id, trackId, kind: 'thinking',
                  content: thinkMsg.content,
                  timestamp: thinkMsg.timestamp,
                })
              }
            }
          }
        }
      }

      // Completed successfully
      releaseImplementLock(id, 'completed')
      const completedMsg: ImplementMessage = {
        type: 'completed',
        content: `Implementation completed for track ${trackId}`,
        timestamp: new Date().toISOString(),
      }
      appendImplementMessage(id, completedMsg)
      sseManager.broadcast('issue-implement-completed', {
        issueId: id, trackId,
        timestamp: completedMsg.timestamp,
      })
      // Auto-update issue status to done on successful completion
      updateIssue(id, { status: 'done' as IssueStatus })
    } catch (err: any) {
      console.error(`[implement] Failed for ${trackId}:`, err.message)
      releaseImplementLock(id, 'failed')
      const failedMsg: ImplementMessage = {
        type: 'failed',
        content: err.message,
        timestamp: new Date().toISOString(),
      }
      appendImplementMessage(id, failedMsg)
      sseManager.broadcast('issue-implement-error', {
        issueId: id, trackId,
        error: err.message,
        timestamp: failedMsg.timestamp,
      })
    }
  }

  implementAsync() // Fire and forget
  return c.json({ issue: updated, message: `Implementation started for track ${trackId}` })
})

// POST /api/issues/:id/verify — run tests, set done if pass
issues.post('/:id/verify', async (c) => {
  const id = c.req.param('id')
  const issue = getIssue(id)
  if (!issue) return c.json({ error: 'Issue not found' }, 404)
  if (issue.status !== 'in-progress') {
    return c.json({ error: 'Issue must be in-progress to verify' }, 400)
  }

  const dashboardDir = join(config.projectRoot, 'dashboard')
  const projectRoot = config.projectRoot

  // Step 1: Unit Tests (Vitest)
  let unitTestSuccess = false
  let unitTestOutput = ''
  try {
    unitTestOutput = execSync('npm test -- --reporter=verbose', {
      cwd: dashboardDir,
      timeout: 120_000,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    })
    unitTestSuccess = true
  } catch (err: any) {
    unitTestOutput = (err.stdout || '') + '\n' + (err.stderr || '')
    unitTestSuccess = false
  }
  // Truncate to last 3000 chars
  if (unitTestOutput.length > 3000) {
    unitTestOutput = '...(truncated)\n' + unitTestOutput.slice(-3000)
  }

  // If unit tests fail, skip UI tests
  let uiTestSuccess = false
  let uiTestOutput = ''
  if (unitTestSuccess) {
    // Step 2: UI Tests (Playwright via browser-test.mjs)
    try {
      uiTestOutput = execSync('node scripts/browser-test.mjs', {
        cwd: projectRoot,
        timeout: 180_000,
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      })
      uiTestSuccess = true
    } catch (err: any) {
      uiTestOutput = (err.stdout || '') + '\n' + (err.stderr || '')
      uiTestSuccess = false
    }
    if (uiTestOutput.length > 3000) {
      uiTestOutput = '...(truncated)\n' + uiTestOutput.slice(-3000)
    }
  }

  // Both pass → mark done
  let updatedIssue = issue
  if (unitTestSuccess && uiTestSuccess) {
    updatedIssue = updateIssue(id, { status: 'done' }) || issue
  }

  return c.json({
    issue: updatedIssue,
    unitTest: { success: unitTestSuccess, output: unitTestOutput },
    uiTest: { success: uiTestSuccess, output: uiTestOutput },
  })
})

// POST /api/issues/:id/reopen — done → pending (keep trackId)
issues.post('/:id/reopen', (c) => {
  const id = c.req.param('id')
  const issue = getIssue(id)
  if (!issue) return c.json({ error: 'Issue not found' }, 404)
  if (issue.status !== 'done') {
    return c.json({ error: 'Issue must be done to reopen' }, 400)
  }
  const updated = updateIssue(id, { status: 'pending' })
  return c.json({ issue: updated })
})

// GET /api/issues/:id/track — get associated track metadata
issues.get('/:id/track', (c) => {
  const id = c.req.param('id')
  const issue = getIssue(id)
  if (!issue) return c.json({ error: 'Issue not found' }, 404)
  if (!issue.trackId) return c.json({ error: 'No track associated' }, 404)
  const track = getTrackMetadata(issue.trackId)
  if (!track) return c.json({ error: 'Track not found' }, 404)
  return c.json({ track })
})

// GET /api/issues/:id/track-plan — get plan.md content for the associated track
issues.get('/:id/track-plan', (c) => {
  const id = c.req.param('id')
  const issue = getIssue(id)
  if (!issue) return c.json({ error: 'Issue not found' }, 404)
  if (!issue.trackId) return c.json({ error: 'No track associated' }, 404)

  const planPath = join(config.projectRoot, 'conductor', 'tracks', issue.trackId, 'plan.md')
  if (!existsSync(planPath)) {
    return c.json({ error: 'Plan not found' }, 404)
  }
  const plan = readFileSync(planPath, 'utf-8')
  return c.json({ plan, trackId: issue.trackId })
})

// GET /api/issues/:id/track-spec — get spec.md content for the associated track
issues.get('/:id/track-spec', (c) => {
  const id = c.req.param('id')
  const issue = getIssue(id)
  if (!issue) return c.json({ error: 'Issue not found' }, 404)
  if (!issue.trackId) return c.json({ error: 'No track associated' }, 404)

  const specPath = join(config.projectRoot, 'conductor', 'tracks', issue.trackId, 'spec.md')
  if (!existsSync(specPath)) {
    return c.json({ error: 'Spec not found' }, 404)
  }
  const spec = readFileSync(specPath, 'utf-8')
  return c.json({ spec, trackId: issue.trackId })
})

// GET /api/issues/:id/track-progress — get cached progress messages (for page refresh recovery)
issues.get('/:id/track-progress', (c) => {
  const id = c.req.param('id')
  const state = issueTrackState.getState(id)
  if (!state) {
    return c.json({ messages: [], isActive: false, pendingQuestion: null })
  }
  return c.json({
    messages: state.messages,
    isActive: state.isActive,
    pendingQuestion: state.pendingQuestion ?? null,
  })
})

// GET /api/issues/:id/implement-status — get implement progress (for page refresh recovery + lock check)
issues.get('/:id/implement-status', (c) => {
  const id = c.req.param('id')
  const status = getImplementStatus(id)
  return c.json(status)
})

export default issues

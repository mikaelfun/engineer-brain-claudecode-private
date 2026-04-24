/**
 * case-routes.ts — Case AI 处理 + Todo 执行 + Settings 路由
 *
 * 路由:
 *   POST /case/:id/process         — 完整 Case 处理（新 session）
 *   POST /case/:id/chat            — 交互式反馈（resume session）
 *   DELETE /case/:id/session       — 结束 session
 *   GET /case/:id/sessions         — 获取 case 的所有 sessions
 *   POST /case/:id/session/end-all — 结束 case 的所有 session
 *   POST /patrol                   — 批量巡检（TypeScript 编排 + per-case SDK sessions）
 *   GET /sessions                  — 全局 session 列表（支持 status 过滤）
 *   GET /todos/all                 — 汇总所有 case 的最新 Todo
 *   POST /todo/:id/execute         — 执行 Todo 项（D365 写操作）
 *   GET /settings                  — 读取用户配置
 *   PUT /settings                  — 保存用户配置
 */
import { Hono } from 'hono'
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, unlinkSync } from 'fs'
import { join, resolve, dirname, isAbsolute } from 'path'
import { fileURLToPath } from 'url'
import {
  processCaseSession,
  executeTodoAction,
  endSession,
  getActiveSessionForCase,
  listCaseSessions,
  getCaseSessions,
  acquireCaseOperationLock,
  releaseCaseOperationLock,
  getActiveCaseOperation,
  listActiveOperations,
  appendSessionMessage,
  getSessionMessages,
  clearSessionMessages,
  getCaseMcpServerNames,
} from '../agent/case-session-manager.js'
import { runSdkPatrol, isSdkPatrolRunning, cancelSdkPatrol, loadPatrolLastRun, killOrphanPatrolProcesses } from '../agent/patrol-orchestrator.js'
import { patrolStateManager } from '../services/patrol-state-manager.js'
import { patrolMessageStore } from '../services/patrol-message-store.js'
import { parseSessionLog, findLatestRunDir } from '../utils/session-log-parser.js'
import { sseManager } from '../watcher/sse-manager.js'
import { sdkQueue } from '../utils/sdk-queue.js'
import { reloadConfig, config as appConfig } from '../config.js'
import { getSSEEventType, formatMessageForSSE, getPersistedMessageType } from '../utils/sse-helpers.js'
import type { ToolCallRecord, ExecutionSummary } from '../types/index.js'

const caseRoutes = new Hono()

// ---- Helpers ----

const __filename_case = fileURLToPath(import.meta.url)
const __dirname_case = dirname(__filename_case)

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function getProjectRoot(): string {
  return resolve(__dirname, '..', '..')
}

function getConfig(): Record<string, any> {
  const configPath = join(getProjectRoot(), '..', 'config.json')
  if (existsSync(configPath)) {
    try {
      return JSON.parse(readFileSync(configPath, 'utf-8'))
    } catch {
      return {}
    }
  }
  return {}
}

function saveConfig(config: Record<string, any>): void {
  const configPath = join(getProjectRoot(), '..', 'config.json')
  writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8')
}

// ---- Case Processing Routes ----

/**
 * REPL-only tools that hang in headless SDK mode.
 * Must be denied in automated SDK sessions to prevent hangs (ISS-079).
 */

// POST /case/:id/process — 完整 Case 处理（backward compat → 转发到 step/casework）
caseRoutes.post('/case/:id/process', async (c) => {
  const caseNumber = c.req.param('id')
  // Internally redirect to the unified step route
  const stepUrl = new URL(`/api/case/${caseNumber}/step/casework`, `http://localhost:${appConfig.port}`)
  const res = await fetch(stepUrl.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': c.req.header('Authorization') || '',
    },
    body: '{}',
  })
  const data = await res.json()
  return c.json(data, res.status as any)
})

// POST /case/:id/chat — 交互式反馈 (always creates fresh ephemeral session)
caseRoutes.post('/case/:id/chat', async (c) => {
  const caseNumber = c.req.param('id')
  const body = await c.req.json<{ message: string }>()

  if (!body.message) {
    return c.json({ error: 'message is required' }, 400)
  }

  try {
    const chatAsync = async () => {
      let newSessionId: string | undefined
      try {
        for await (const message of processCaseSession(caseNumber, body.message, undefined, undefined, true)) {
          if (!newSessionId && (message as any).sdkSessionId) {
            newSessionId = (message as any).sdkSessionId
          }
          const eventType = getSSEEventType(message)
          const formatted = formatMessageForSSE(message)
          sseManager.broadcast(eventType as any, {
            caseNumber,
            sessionId: newSessionId || 'pending',
            ...formatted,
          })
          appendSessionMessage(caseNumber, {
            type: getPersistedMessageType(message),
            content: formatted.content as string || '',
            toolName: formatted.toolName as string,
            timestamp: formatted.timestamp as string || new Date().toISOString(),
          })
        }
        sseManager.broadcast('case-session-completed', {
          caseNumber,
          sessionId: newSessionId || 'unknown',
        })
        appendSessionMessage(caseNumber, {
          type: 'completed',
          content: 'Chat response completed',
          timestamp: new Date().toISOString(),
        })
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err)
        sseManager.broadcast('case-session-failed', {
          caseNumber,
          sessionId: newSessionId || 'unknown',
          error: errorMsg,
        })
        appendSessionMessage(caseNumber, {
          type: 'failed',
          content: errorMsg,
          timestamp: new Date().toISOString(),
        })
      }
    }
    chatAsync()
    return c.json({ status: 'started', caseNumber }, 202)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return c.json({ error: msg }, 500)
  }
})

// DELETE /case/:id/session — 结束 session
caseRoutes.delete('/case/:id/session', async (c) => {
  const caseNumber = c.req.param('id')
  const body = await c.req.json<{ sessionId?: string }>().catch(() => ({ sessionId: undefined }))

  // Use provided sessionId, or find the active session for this case
  const sessionId = body.sessionId || getActiveSessionForCase(caseNumber)
  if (!sessionId) {
    return c.json({ error: 'No active session found' }, 404)
  }

  const ended = endSession(sessionId)
  if (!ended) {
    return c.json({ error: 'Session not found' }, 404)
  }
  return c.json({ success: true, sessionId })
})

// GET /case/:id/sessions — 获取 case 的所有 sessions
caseRoutes.get('/case/:id/sessions', (c) => {
  const caseNumber = c.req.param('id')
  const sessions = getCaseSessions(caseNumber)
  const activeSession = getActiveSessionForCase(caseNumber)
  return c.json({ sessions, activeSession })
})

// ---- Patrol Route (SDK-based orchestration) ----

// POST /patrol — 启动 SDK patrol
caseRoutes.post('/patrol', async (c) => {
  try {
    let force = true
    let mode = 'normal'
    try { const body = await c.req.json<{ force?: boolean; mode?: string }>(); force = body?.force !== false; if (body?.mode) mode = body.mode } catch { /* no body = default force */ }

    if (isSdkPatrolRunning()) {
      return c.json({ error: 'Patrol already running' }, 409)
    }

    // Fire and forget — patrol runs in background
    runSdkPatrol(force, mode).catch(err => {
      console.error('[patrol] SDK patrol failed:', err instanceof Error ? err.message : err)
    })

    return c.json({ status: 'started', mode }, 202)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return c.json({ error: msg }, 500)
  }
})

// POST /patrol/cancel — 取消正在运行的 patrol
caseRoutes.post('/patrol/cancel', (c) => {
  if (!isSdkPatrolRunning()) {
    return c.json({ error: 'No patrol is currently running' }, 404)
  }
  const cancelled = cancelSdkPatrol()
  return c.json({ success: cancelled, message: cancelled ? 'Patrol cancellation requested' : 'Failed to cancel' })
})

// POST /patrol/reset — force reset patrol state + remove lock file + kill orphan processes
caseRoutes.post('/patrol/reset', async (c) => {
  const lockPath = join(appConfig.patrolDir, 'patrol.lock')
  const phasePath = join(appConfig.patrolDir, 'patrol-phase')
  const removed: string[] = []

  // 1. Cancel any running patrol first
  if (isSdkPatrolRunning()) {
    cancelSdkPatrol()
    removed.push('cancelled running patrol')
  }

  // 2. Remove lock file
  try {
    if (existsSync(lockPath)) {
      unlinkSync(lockPath)
      removed.push('patrol.lock')
    }
  } catch { /* ignore */ }

  // 3. Remove phase file
  try {
    if (existsSync(phasePath)) {
      unlinkSync(phasePath)
      removed.push('patrol-phase')
    }
  } catch { /* ignore */ }

  // 4. Kill orphaned claude.exe processes (stale SDK sessions + sub-agents)
  const orphanResult = await killOrphanPatrolProcesses()
  if (orphanResult.killed.length > 0) {
    removed.push(`killed ${orphanResult.killed.length} orphan claude.exe (PIDs: ${orphanResult.killed.join(', ')})`)
  }

  // 5. Reset in-memory state
  patrolStateManager.reset()
  patrolMessageStore.clear()
  removed.push('in-memory state')

  return c.json({ success: true, removed, orphans: orphanResult })
})

// GET /patrol/messages — 恢复 patrol agent 消息
// ?logFile=patrol-sdk-xxx.jsonl → parse specific log (for recovered sessions)
// No param → in-memory store, fallback to latest log on disk
caseRoutes.get('/patrol/messages', (c) => {
  const logFile = c.req.query('logFile')

  // Specific log file requested (recovered session)
  if (logFile) {
    if (!logFile.endsWith('.jsonl') || logFile.includes('/') || logFile.includes('\\') || logFile.includes('..')) {
      return c.json({ error: 'Invalid log file name' }, 400)
    }
    const filePath = join(appConfig.patrolDir, 'logs', logFile)
    if (!existsSync(filePath)) return c.json({ messages: [], subAgents: {} })
    const result = parseSessionLog(filePath)
    return c.json({ messages: result.mainMessages, subAgents: result.subAgents, source: 'disk' })
  }

  // No param → in-memory first, then latest disk log
  const inMemory = patrolMessageStore.getAll()
  if (inMemory.length > 0) {
    return c.json({ messages: inMemory })
  }

  const logsDir = join(appConfig.patrolDir, 'logs')
  if (existsSync(logsDir)) {
    try {
      const files = readdirSync(logsDir)
        .filter(f => f.endsWith('.jsonl'))
        .sort()
        .reverse()
      if (files.length > 0) {
        const result = parseSessionLog(join(logsDir, files[0]))
        return c.json({ messages: result.mainMessages, subAgents: result.subAgents, source: 'disk' })
      }
    } catch { /* fall through */ }
  }

  return c.json({ messages: [] })
})

// GET /patrol/logs — 列出所有 patrol SDK 日志文件
caseRoutes.get('/patrol/logs', (c) => {
  const logsDir = join(appConfig.patrolDir, 'logs')
  if (!existsSync(logsDir)) return c.json({ logs: [] })
  try {
    const files = readdirSync(logsDir)
      .filter(f => f.endsWith('.jsonl'))
      .sort()
      .reverse() // newest first
      .map(f => {
        const stats = statSync(join(logsDir, f))
        return { name: f, sizeKB: Math.round(stats.size / 1024), modifiedAt: stats.mtime.toISOString() }
      })
    return c.json({ logs: files })
  } catch {
    return c.json({ logs: [] })
  }
})

// GET /patrol/logs/:name — 读取单个日志文件内容
// 支持 ?lines=N 参数（默认 200，从尾部读取）
caseRoutes.get('/patrol/logs/:name', (c) => {
  const name = c.req.param('name')
  // Security: only allow .jsonl files, no path traversal
  if (!name.endsWith('.jsonl') || name.includes('/') || name.includes('\\') || name.includes('..')) {
    return c.json({ error: 'Invalid log file name' }, 400)
  }
  const filePath = join(appConfig.patrolDir, 'logs', name)
  if (!existsSync(filePath)) return c.json({ error: 'Log not found' }, 404)

  try {
    const raw = readFileSync(filePath, 'utf-8')
    const allLines = raw.split('\n').filter(l => l.trim())
    const maxLines = parseInt(c.req.query('lines') || '200', 10)
    const lines = allLines.slice(-maxLines)
    return c.json({
      name,
      totalLines: allLines.length,
      returnedLines: lines.length,
      truncated: allLines.length > maxLines,
      messages: lines.map(l => { try { return JSON.parse(l) } catch { return { raw: l } } }),
    })
  } catch (err) {
    return c.json({ error: (err as Error).message }, 500)
  }
})

// GET /patrol/status — 查询 patrol 运行状态 + per-case state
// State comes from PatrolStateManager (single source of truth)
// caseStates are pre-filtered: stale data removed, stuck steps fixed
caseRoutes.get('/patrol/status', (c) => {
  const patrolState = patrolStateManager.getState()
  const running = patrolStateManager.isRunning()

  // Read per-case state.json for hydration
  const caseStates: Record<string, unknown> = {}
  const caseNumbers: string[] = [...(patrolState.caseList || [])]

  // Also include cases from last run result (for completed patrol display)
  // Track which cases came from caseResults (exempt from stale filter)
  const fromCaseResults = new Set<string>()
  if (!running) {
    const lastRun = loadPatrolLastRun()
    if (lastRun?.caseResults && Array.isArray(lastRun.caseResults)) {
      for (const cr of lastRun.caseResults as Array<{ caseNumber?: string }>) {
        if (cr.caseNumber && !caseNumbers.includes(cr.caseNumber)) {
          caseNumbers.push(cr.caseNumber)
        }
        if (cr.caseNumber) fromCaseResults.add(cr.caseNumber)
      }
    }
  }

  // Stale cutoff: skip case states updated before this patrol started (1min grace)
  // Cases explicitly listed in caseResults are exempt — they're confirmed part of this run
  const patrolDone = !running && ['completed', 'failed'].includes(patrolState.phase)
  const cutoff = patrolState.startedAt
    ? new Date(patrolState.startedAt).getTime() - 60_000
    : 0

  for (const cn of caseNumbers) {
    try {
      const statePath = join(appConfig.activeCasesDir, cn, '.casework', 'state.json')
      if (!existsSync(statePath)) continue
      const cs = JSON.parse(readFileSync(statePath, 'utf-8'))

      // Filter stale case state from a previous patrol
      // Skip filter for cases in caseResults (startedAt can be unreliable — set at
      // patrol completion, not actual start, so early-finishing cases get filtered)
      if (cutoff > 0 && cs.updatedAt && !fromCaseResults.has(cn)) {
        const updated = new Date(cs.updatedAt).getTime()
        if (updated < cutoff) continue
      }

      // Fix stuck 'active' steps when patrol has completed
      if (patrolDone && cs.steps) {
        for (const step of Object.values(cs.steps) as any[]) {
          if (step?.status === 'active') step.status = 'completed'
        }
      }

      caseStates[cn] = cs
    } catch { /* skip unreadable */ }
  }

  return c.json({
    patrolState,
    running,
    caseStates,
  })
})

// ---- SDK Queue Status ----

// GET /queue/status — SDK queue status for frontend polling
caseRoutes.get('/queue/status', (c) => {
  return c.json(sdkQueue.getStatus())
})

// ---- Todo Routes ----

// GET /todos/all — 汇总所有 case 的最新 Todo
caseRoutes.get('/todos/all', (c) => {
  const activeCasesDir = appConfig.activeCasesDir

  if (!existsSync(activeCasesDir)) {
    return c.json({ todos: [], total: 0 })
  }

  const todos: any[] = []

  try {
    const caseDirs = readdirSync(activeCasesDir)
    for (const caseId of caseDirs) {
      const casePath = join(activeCasesDir, caseId)
      try {
        if (!statSync(casePath).isDirectory()) continue
      } catch {
        continue
      }

      const todoDir = join(casePath, 'todo')
      if (!existsSync(todoDir)) continue

      try {
        const todoFiles = readdirSync(todoDir)
          .filter((f) => f.endsWith('.md'))
          .sort()
          .reverse()

        if (todoFiles.length > 0) {
          const latestFile = todoFiles[0]
          const filePath = join(todoDir, latestFile)
          const content = readFileSync(filePath, 'utf-8')

          todos.push({
            caseNumber: caseId,
            filename: latestFile,
            content,
            updatedAt: statSync(filePath).mtime.toISOString(),
          })
        }
      } catch {
        // Skip unreadable todo dirs
      }
    }
  } catch {
    // activeCasesDir not readable
  }

  return c.json({
    todos: todos.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    total: todos.length,
  })
})

// POST /todo/:id/execute — 执行 Todo 项 (with verification + structured SSE)
caseRoutes.post('/todo/:id/execute', async (c) => {
  const caseNumber = c.req.param('id')
  const body = await c.req.json<{
    action: string
    params: Record<string, string>
    lineNumber?: number
  }>()

  if (!body.action) {
    return c.json({ error: 'action is required' }, 400)
  }

  const lineNumber = body.lineNumber || 0

  try {
    const execAsync = async () => {
      try {
        // Broadcast execution started
        sseManager.broadcast('todo-execute-progress', {
          caseNumber,
          action: body.action,
          lineNumber,
          phase: 'executing',
          message: `Executing ${body.action} for Case ${caseNumber}...`,
        })

        let lastAssistantContent = ''
        let resultFound = false

        for await (const message of executeTodoAction(caseNumber, body.action, body.params || {})) {
          const formatted = formatMessageForSSE(message)

          // Broadcast progress events
          sseManager.broadcast('todo-execute-progress', {
            caseNumber,
            action: body.action,
            lineNumber,
            phase: lastAssistantContent.includes('Verification') || lastAssistantContent.includes('verify') ? 'verifying' : 'executing',
            message: typeof formatted.content === 'string' ? formatted.content.slice(0, 200) : '',
          })

          // Check for structured result JSON in assistant messages
          if (formatted.content && typeof formatted.content === 'string') {
            lastAssistantContent = formatted.content
            const resultMatch = formatted.content.match(/\{"todoExecuteResult":\s*\{[^}]*\}\}/)
            if (resultMatch) {
              try {
                const parsed = JSON.parse(resultMatch[0])
                const result = parsed.todoExecuteResult
                resultFound = true
                sseManager.broadcast('todo-execute-result', {
                  caseNumber,
                  action: body.action,
                  lineNumber,
                  success: result.success === true,
                  verificationDetails: result.verificationDetails || '',
                })
              } catch {
                // JSON parse failed, will handle below
              }
            }
          }
        }

        // If agent didn't produce structured result, broadcast a generic success
        if (!resultFound) {
          sseManager.broadcast('todo-execute-result', {
            caseNumber,
            action: body.action,
            lineNumber,
            success: true,
            verificationDetails: 'Execution completed (no structured verification result from agent)',
          })
        }

        sseManager.broadcast('todo-updated', { caseNumber })
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err)
        sseManager.broadcast('todo-execute-result', {
          caseNumber,
          action: body.action,
          lineNumber,
          success: false,
          verificationDetails: `Error: ${errorMsg}`,
        })
      }
    }

    execAsync()
    return c.json({ status: 'started', caseNumber, action: body.action, lineNumber }, 202)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return c.json({ error: msg }, 500)
  }
})

// ---- Settings Routes ----

// GET /settings — 读取用户配置
caseRoutes.get('/settings', (c) => {
  const config = getConfig()
  return c.json(config)
})

// PUT /settings — 保存用户配置
caseRoutes.put('/settings', async (c) => {
  const body = await c.req.json<Record<string, any>>()
  const current = getConfig()
  const merged = { ...current, ...body }
  saveConfig(merged)
  reloadConfig() // Invalidate cached config so all getters pick up new values
  return c.json({ success: true, config: merged })
})

// POST /settings/validate-path — 验证路径是否存在并返回 case 数量
caseRoutes.post('/settings/validate-path', async (c) => {
  const body = await c.req.json<{ path: string }>()
  const targetPath = body.path?.trim()
  if (!targetPath) {
    return c.json({ valid: false, error: 'Path is empty' })
  }

  const resolvedPath = isAbsolute(targetPath)
    ? targetPath
    : resolve(getProjectRoot(), '..', targetPath)

  if (!existsSync(resolvedPath)) {
    return c.json({ valid: false, error: 'Directory does not exist', resolvedPath })
  }

  // Check for active cases subdirectory
  const activePath = join(resolvedPath, 'active')
  let caseCount = 0
  if (existsSync(activePath)) {
    try {
      const entries = readdirSync(activePath, { withFileTypes: true })
      caseCount = entries.filter(e => e.isDirectory()).length
    } catch {
      // ignore read errors
    }
  }

  return c.json({ valid: true, resolvedPath, caseCount, hasActiveDir: existsSync(activePath) })
})

// ---- Sessions List ----

// GET /sessions — 列出所有 case sessions (支持 status 过滤)
caseRoutes.get('/sessions', (c) => {
  const status = c.req.query('status')
  let sessions = listCaseSessions()
  if (status) {
    sessions = sessions.filter(s => s.status === status)
  }
  return c.json({ sessions, total: sessions.length })
})

// GET /operations/active — 列出所有活跃的操作（防重复 spawn 查询）
caseRoutes.get('/operations/active', (c) => {
  const operations = listActiveOperations()
  return c.json({ operations, total: operations.length })
})

// GET /case/:id/operation — 查询某个 case 的活跃操作
caseRoutes.get('/case/:id/operation', (c) => {
  const caseNumber = c.req.param('id')
  const operation = getActiveCaseOperation(caseNumber)
  return c.json({ caseNumber, operation })
})

// GET /case/:id/messages — 获取持久化消息（刷新后恢复进度）
caseRoutes.get('/case/:id/messages', (c) => {
  const caseNumber = c.req.param('id')
  const messages = getSessionMessages(caseNumber)
  return c.json({ caseNumber, messages })
})

// DELETE /case/:id/messages — 清除持久化消息
caseRoutes.delete('/case/:id/messages', (c) => {
  const caseNumber = c.req.param('id')
  clearSessionMessages(caseNumber)
  return c.json({ success: true })
})

// POST /case/:id/session/end-all — 结束 case 的所有 session
caseRoutes.post('/case/:id/session/end-all', async (c) => {
  const caseNumber = c.req.param('id')
  const sessions = getCaseSessions(caseNumber)
  let ended = 0
  for (const s of sessions) {
    if (s.status !== 'completed') {
      endSession(s.sessionId)
      ended++
    }
  }
  return c.json({ success: true, endedCount: ended })
})

// GET /case/:id/run-messages — Recover ALL SSE data from latest run's session.jsonl + agents/*.log
// Generic recovery: returns main agent messages + sub-agent messages/output
caseRoutes.get('/case/:id/run-messages', (c) => {
  const caseNumber = c.req.param('id')
  const caseworkDir = join(appConfig.activeCasesDir, caseNumber, '.casework')
  const runDir = findLatestRunDir(caseworkDir)

  if (!runDir) {
    return c.json({ mainMessages: [], subAgents: {}, runDir: null })
  }

  const sessionJsonl = join(runDir, 'session.jsonl')
  const agentsDir = join(runDir, 'agents')
  const result = parseSessionLog(sessionJsonl, agentsDir)

  return c.json({ ...result, runDir: runDir.split(/[/\\]/).slice(-1)[0] })
})

export default caseRoutes

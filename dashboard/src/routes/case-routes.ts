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
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs'
import { join, resolve, dirname, isAbsolute } from 'path'
import { fileURLToPath } from 'url'
import {
  processCaseSession,
  chatCaseSession,
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
  writeStepLog,
  getCaseMcpServerNames,
} from '../agent/case-session-manager.js'
import { startCliPatrol, cancelCliPatrol, isCliPatrolRunning, loadPatrolLastRun } from '../agent/cli-patrol-manager.js'
import { runSdkPatrol, isSdkPatrolRunning, cancelSdkPatrol, loadPatrolLastRun as loadSdkPatrolLastRun } from '../agent/patrol-orchestrator.js'
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

// POST /case/:id/chat — 交互式反馈
caseRoutes.post('/case/:id/chat', async (c) => {
  const caseNumber = c.req.param('id')
  const body = await c.req.json<{ sessionId?: string; message: string }>()

  if (!body.message) {
    return c.json({ error: 'message is required' }, 400)
  }

  // Use provided sessionId, or find the active session for this case
  const sessionId = body.sessionId || getActiveSessionForCase(caseNumber)

  // If no session exists, auto-create one via processCaseSession (free chat)
  if (!sessionId) {
    try {
      const createAsync = async () => {
        let newSessionId: string | undefined
        try {
          for await (const message of processCaseSession(caseNumber, body.message)) {
            // Capture the SDK session ID from the first message
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
      createAsync()
      return c.json({ status: 'started', sessionId: 'creating' }, 202)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      return c.json({ error: msg }, 500)
    }
  }

  try {
    const chatAsync = async () => {
      try {
        for await (const message of chatCaseSession(sessionId, body.message)) {
          const eventType = getSSEEventType(message)
          const formatted = formatMessageForSSE(message)
          sseManager.broadcast(eventType as any, {
            caseNumber,
            sessionId,
            ...formatted,
          })

          // Persist message for recovery after page refresh
          appendSessionMessage(caseNumber, {
            type: getPersistedMessageType(message),
            content: formatted.content as string || '',
            toolName: formatted.toolName as string,
            timestamp: formatted.timestamp as string || new Date().toISOString(),
          })
        }
        sseManager.broadcast('case-session-completed', {
          caseNumber,
          sessionId,
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
          sessionId,
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
    return c.json({ status: 'started', sessionId }, 202)
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
    try { const body = await c.req.json<{ force?: boolean }>(); force = body?.force !== false } catch { /* no body = default force */ }

    if (isSdkPatrolRunning()) {
      return c.json({ error: 'Patrol already running' }, 409)
    }

    // Fire and forget — patrol runs in background
    runSdkPatrol(force).catch(err => {
      console.error('[patrol] SDK patrol failed:', err instanceof Error ? err.message : err)
    })

    return c.json({ status: 'started' }, 202)
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

// GET /patrol/status — 查询 patrol 运行状态 + 上次运行结果
caseRoutes.get('/patrol/status', (c) => {
  return c.json({
    running: isSdkPatrolRunning(),
    lastRun: loadSdkPatrolLastRun(),
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

export default caseRoutes

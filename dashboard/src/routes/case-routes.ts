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
  patrolCoordinator,
  cancelPatrol,
  isPatrolRunning,
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
} from '../agent/case-session-manager.js'
import { sseManager } from '../watcher/sse-manager.js'
import { reloadConfig, config as appConfig } from '../config.js'
import { getSSEEventType, formatMessageForSSE } from '../utils/sse-helpers.js'

const caseRoutes = new Hono()

// ---- Helpers ----

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

// POST /case/:id/process — 完整 Case 处理
caseRoutes.post('/case/:id/process', async (c) => {
  const caseNumber = c.req.param('id')
  const body = await c.req.json<{ intent?: string }>().catch(() => ({ intent: undefined }))
  const intent = body.intent || 'Full casework processing'

  // Check if case already has an active operation (prevent duplicate spawn)
  const existingOp = getActiveCaseOperation(caseNumber)
  if (existingOp) {
    return c.json({
      error: 'Case already has an active operation',
      activeOperation: existingOp,
    }, 409)
  }

  // Acquire operation lock
  if (!acquireCaseOperationLock(caseNumber, 'full-process')) {
    return c.json({
      error: 'Failed to acquire operation lock (race condition)',
      activeOperation: getActiveCaseOperation(caseNumber),
    }, 409)
  }

  try {
    // Start processing asynchronously
    const processAsync = async () => {
      let capturedSessionId: string | undefined
      const processStartedAt = new Date().toISOString()
      let messageCount = 0

      // Broadcast process-started event
      sseManager.broadcast('case-step-started' as any, {
        caseNumber,
        step: 'full-process',
        startedAt: processStartedAt,
      })

      // Clear previous messages for fresh run
      clearSessionMessages(caseNumber)
      appendSessionMessage(caseNumber, {
        type: 'system',
        content: 'Full process started',
        step: 'full-process',
        timestamp: processStartedAt,
      })

      try {
        for await (const message of processCaseSession(caseNumber, intent)) {
          // Capture the SDK session ID from the message stream
          if ((message as any).sdkSessionId && !capturedSessionId) {
            capturedSessionId = (message as any).sdkSessionId
          }

          messageCount++
          // Broadcast each message as SSE event
          const eventType = getSSEEventType(message)
          const formatted = formatMessageForSSE(message)
          sseManager.broadcast(eventType as any, {
            caseNumber,
            sessionId: capturedSessionId,
            ...formatted,
          })

          // Persist message for recovery after page refresh
          appendSessionMessage(caseNumber, {
            type: formatted.messageType as string || 'system',
            content: typeof formatted.content === 'string' ? formatted.content : '',
            toolName: formatted.toolName as string,
            timestamp: formatted.timestamp as string || new Date().toISOString(),
          })
        }

        sseManager.broadcast('case-session-completed', {
          caseNumber,
          sessionId: capturedSessionId,
        })
        appendSessionMessage(caseNumber, {
          type: 'completed',
          content: 'Full process completed',
          step: 'full-process',
          timestamp: new Date().toISOString(),
        })

        // Write step log on completion
        writeStepLog(caseNumber, 'full-process', {
          status: 'completed',
          startedAt: processStartedAt,
          messageCount,
        })
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err)
        sseManager.broadcast('case-session-failed', {
          caseNumber,
          sessionId: capturedSessionId,
          error: errorMsg,
        })

        // Write step log on failure
        writeStepLog(caseNumber, 'full-process', {
          status: 'failed',
          startedAt: processStartedAt,
          error: errorMsg,
          messageCount,
        })
      } finally {
        // Always release the lock when operation finishes
        releaseCaseOperationLock(caseNumber)
      }
    }

    processAsync() // Fire and forget
    return c.json({ status: 'started', caseNumber }, 202)
  } catch (err) {
    releaseCaseOperationLock(caseNumber)
    const msg = err instanceof Error ? err.message : String(err)
    return c.json({ error: msg }, 500)
  }
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
  if (!sessionId) {
    return c.json({ error: 'No active session for this case. Start with POST /case/:id/process first.' }, 404)
  }

  try {
    const chatAsync = async () => {
      try {
        for await (const message of chatCaseSession(sessionId, body.message)) {
          sseManager.broadcast('case-session-thinking', {
            caseNumber,
            sessionId,
            ...formatMessageForSSE(message),
          })
        }
        sseManager.broadcast('case-session-completed', {
          caseNumber,
          sessionId,
        })
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err)
        sseManager.broadcast('case-session-failed', {
          caseNumber,
          sessionId,
          error: errorMsg,
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

// ---- Patrol Route ----

// POST /patrol — 批量巡检 (TypeScript 编排器 + per-case SDK sessions)
caseRoutes.post('/patrol', async (c) => {
  try {
    const patrolAsync = async () => {
      try {
        await patrolCoordinator((progress) => {
          // 广播实时进度
          sseManager.broadcast('patrol-progress' as any, { ...progress } as Record<string, unknown>)

          if (progress.phase === 'completed') {
            sseManager.broadcast('patrol-updated' as any, {
              todoSummary: progress.todoSummary,
              processedCases: progress.processedCases,
              changedCases: progress.changedCases,
              totalCases: progress.totalCases,
            } as Record<string, unknown>)
          }
        })
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err)
        sseManager.broadcast('patrol-progress' as any, {
          phase: 'failed',
          error: errorMsg,
        })
        sseManager.broadcast('case-session-failed', {
          type: 'patrol',
          error: errorMsg,
        })
      }
    }

    patrolAsync() // Fire and forget
    return c.json({ status: 'started' }, 202)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return c.json({ error: msg }, 500)
  }
})

// POST /patrol/cancel — 取消正在运行的 patrol
caseRoutes.post('/patrol/cancel', (c) => {
  if (!isPatrolRunning()) {
    return c.json({ error: 'No patrol is currently running' }, 404)
  }
  const cancelled = cancelPatrol()
  return c.json({ success: cancelled, message: cancelled ? 'Patrol cancellation requested' : 'Failed to cancel' })
})

// GET /patrol/status — 查询 patrol 运行状态
caseRoutes.get('/patrol/status', (c) => {
  return c.json({ running: isPatrolRunning() })
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

// POST /todo/:id/execute — 执行 Todo 项
caseRoutes.post('/todo/:id/execute', async (c) => {
  const caseNumber = c.req.param('id')
  const body = await c.req.json<{
    action: string
    params: Record<string, string>
  }>()

  if (!body.action) {
    return c.json({ error: 'action is required' }, 400)
  }

  try {
    const execAsync = async () => {
      try {
        for await (const message of executeTodoAction(caseNumber, body.action, body.params || {})) {
          sseManager.broadcast('case-session-tool-result', {
            caseNumber,
            action: body.action,
            ...formatMessageForSSE(message),
          })
        }
        sseManager.broadcast('todo-updated', { caseNumber })
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err)
        sseManager.broadcast('case-session-failed', {
          caseNumber,
          action: body.action,
          error: errorMsg,
        })
      }
    }

    execAsync()
    return c.json({ status: 'started', caseNumber, action: body.action }, 202)
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

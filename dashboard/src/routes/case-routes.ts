/**
 * case-routes.ts — Case AI 处理 + Todo 执行 + Settings 路由
 *
 * 新增路由:
 *   POST /case/:id/process  — 完整 Case 处理（新 session）
 *   POST /case/:id/chat     — 交互式反馈（resume session）
 *   DELETE /case/:id/session — 结束 session
 *   POST /patrol            — 批量巡检
 *   GET /todos/all          — 汇总所有 case 的最新 Todo
 *   POST /todo/:id/execute  — 执行 Todo 项（D365 写操作）
 *   GET /settings           — 读取用户配置
 *   PUT /settings           — 保存用户配置
 */
import { Hono } from 'hono'
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs'
import { join, resolve } from 'path'
import {
  processCaseSession,
  chatCaseSession,
  executeTodoAction,
  patrolSession,
  endSession,
  getSession,
  listCaseSessions,
  getCaseSessions,
} from '../agent/case-session-manager.js'
import { sseManager } from '../watcher/sse-manager.js'

const caseRoutes = new Hono()

// ---- Helpers ----

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
  const body = await c.req.json<{ intent?: string }>().catch(() => ({}))
  const intent = body.intent || 'Full casework processing'

  try {
    // Start processing asynchronously
    const processAsync = async () => {
      try {
        for await (const message of processCaseSession(caseNumber, intent)) {
          // Broadcast each message as SSE event
          const eventType = getSSEEventType(message)
          sseManager.broadcast(eventType as any, {
            caseNumber,
            sessionId: (message as any).sessionId,
            ...formatMessageForSSE(message),
          })
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err)
        sseManager.broadcast('workflow-failed' as any, {
          caseNumber,
          error: errorMsg,
        })
      }
    }

    processAsync() // Fire and forget
    return c.json({ status: 'started', caseNumber }, 202)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return c.json({ error: msg }, 500)
  }
})

// POST /case/:id/chat — 交互式反馈
caseRoutes.post('/case/:id/chat', async (c) => {
  const caseNumber = c.req.param('id')
  const body = await c.req.json<{ sessionId: string; message: string }>()

  if (!body.sessionId || !body.message) {
    return c.json({ error: 'sessionId and message are required' }, 400)
  }

  try {
    const chatAsync = async () => {
      try {
        for await (const message of chatCaseSession(body.sessionId, body.message)) {
          sseManager.broadcast('workflow-thinking' as any, {
            caseNumber,
            sessionId: body.sessionId,
            ...formatMessageForSSE(message),
          })
        }
        sseManager.broadcast('workflow-completed' as any, {
          caseNumber,
          sessionId: body.sessionId,
        })
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err)
        sseManager.broadcast('workflow-failed' as any, {
          caseNumber,
          sessionId: body.sessionId,
          error: errorMsg,
        })
      }
    }

    chatAsync()
    return c.json({ status: 'started', sessionId: body.sessionId }, 202)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return c.json({ error: msg }, 500)
  }
})

// DELETE /case/:id/session — 结束 session
caseRoutes.delete('/case/:id/session', async (c) => {
  const body = await c.req.json<{ sessionId: string }>().catch(() => ({ sessionId: '' }))
  if (!body.sessionId) {
    return c.json({ error: 'sessionId is required' }, 400)
  }

  const ended = endSession(body.sessionId)
  if (!ended) {
    return c.json({ error: 'Session not found' }, 404)
  }
  return c.json({ success: true })
})

// GET /case/:id/sessions — 获取 case 的所有 sessions
caseRoutes.get('/case/:id/sessions', (c) => {
  const caseNumber = c.req.param('id')
  const sessions = getCaseSessions(caseNumber)
  return c.json({ sessions })
})

// ---- Patrol Route ----

// POST /patrol — 批量巡检
caseRoutes.post('/patrol', async (c) => {
  try {
    const patrolAsync = async () => {
      try {
        for await (const message of patrolSession()) {
          sseManager.broadcast('workflow-thinking' as any, {
            type: 'patrol',
            ...formatMessageForSSE(message),
          })
        }
        sseManager.broadcast('workflow-completed' as any, {
          type: 'patrol',
        })
        sseManager.broadcast('patrol-updated' as any, {})
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err)
        sseManager.broadcast('workflow-failed' as any, {
          type: 'patrol',
          error: errorMsg,
        })
      }
    }

    patrolAsync()
    return c.json({ status: 'started' }, 202)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return c.json({ error: msg }, 500)
  }
})

// ---- Todo Routes ----

// GET /todos/all — 汇总所有 case 的最新 Todo
caseRoutes.get('/todos/all', (c) => {
  const config = getConfig()
  const casesRoot = config.casesRoot || ''
  const activeCasesDir = join(casesRoot, 'active')

  if (!existsSync(activeCasesDir)) {
    return c.json({ todos: [], total: 0 })
  }

  const todos: any[] = []

  try {
    const caseDirs = readdirSync(activeCasesDir)
    for (const caseId of caseDirs) {
      const todoDir = join(activeCasesDir, caseId, 'todo')
      if (!existsSync(todoDir)) continue

      try {
        const todoFiles = readdirSync(todoDir)
          .filter((f) => f.endsWith('.md'))
          .sort()
          .reverse()

        if (todoFiles.length > 0) {
          const latestFile = todoFiles[0]
          const content = readFileSync(join(todoDir, latestFile), 'utf-8')

          todos.push({
            caseNumber: caseId,
            filename: latestFile,
            content,
            updatedAt: statSync(join(todoDir, latestFile)).mtime.toISOString(),
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
          sseManager.broadcast('workflow-tool-result' as any, {
            caseNumber,
            action: body.action,
            ...formatMessageForSSE(message),
          })
        }
        sseManager.broadcast('todo-updated' as any, { caseNumber })
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err)
        sseManager.broadcast('workflow-failed' as any, {
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
  return c.json({ success: true, config: merged })
})

// ---- Sessions List ----

// GET /sessions — 列出所有 case sessions
caseRoutes.get('/sessions', (c) => {
  const sessions = listCaseSessions()
  return c.json({ sessions, total: sessions.length })
})

// ---- Helpers ----

function getSSEEventType(message: any): string {
  if (message.type === 'text' || message.type === 'result') {
    return 'workflow-thinking'
  }
  if (message.type === 'tool_use') {
    return 'workflow-tool-call'
  }
  if (message.type === 'tool_result') {
    return 'workflow-tool-result'
  }
  return 'workflow-thinking'
}

function formatMessageForSSE(message: any): Record<string, unknown> {
  return {
    messageType: message.type,
    content: message.content || message.text || '',
    toolName: message.name || undefined,
    timestamp: new Date().toISOString(),
  }
}

export default caseRoutes

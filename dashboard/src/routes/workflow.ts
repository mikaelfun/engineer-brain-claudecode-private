/**
 * workflow.ts — Workflow API 路由
 *
 * 5 endpoints: configs / start / cancel / sessions / session-detail
 */
import { Hono } from 'hono'
import { getAllWorkflowConfigs } from '../agent/workflow-configs.js'
import { startWorkflow, cancelWorkflow, WorkflowError, WorkflowConflictError } from '../agent/agent-loop.js'
import { listSessions, loadSession } from '../agent/session-manager.js'
import type { WorkflowId, SessionStatus } from '../types/index.js'

const workflow = new Hono()

// GET /configs — 可用工作流列表 (不含 system prompt)
workflow.get('/configs', (c) => {
  const configs = getAllWorkflowConfigs()
  return c.json({ configs })
})

// POST /start — 启动工作流
workflow.post('/start', async (c) => {
  try {
    const body = await c.req.json<{
      workflowId: WorkflowId
      params?: Record<string, string>
    }>()

    if (!body.workflowId) {
      return c.json({ error: 'workflowId is required' }, 400)
    }

    const session = await startWorkflow(body.workflowId, body.params || {})
    return c.json({ sessionId: session.id, status: session.status }, 201)
  } catch (err) {
    if (err instanceof WorkflowConflictError) {
      return c.json({ error: err.message }, 409)
    }
    if (err instanceof WorkflowError) {
      return c.json({ error: err.message }, 400)
    }
    const msg = err instanceof Error ? err.message : String(err)
    return c.json({ error: msg }, 500)
  }
})

// POST /cancel/:id — 取消运行中的会话
workflow.post('/cancel/:id', (c) => {
  const id = c.req.param('id')
  const cancelled = cancelWorkflow(id)
  if (!cancelled) {
    return c.json({ error: 'Session not found or not running' }, 404)
  }
  return c.json({ success: true })
})

// GET /sessions — 会话列表
workflow.get('/sessions', (c) => {
  const limit = parseInt(c.req.query('limit') || '20', 10)
  const status = c.req.query('status') as SessionStatus | undefined

  const sessions = listSessions({ status, limit })

  // Return summary (strip messages and full toolCalls for list view)
  const summaries = sessions.map(s => ({
    id: s.id,
    workflowId: s.workflowId,
    workflowName: s.workflowName,
    status: s.status,
    params: s.params,
    iterations: s.iterations,
    maxIterations: s.maxIterations,
    toolCallCount: s.toolCalls.length,
    startedAt: s.startedAt,
    completedAt: s.completedAt,
    result: s.result ? (s.result.length > 200 ? s.result.slice(0, 200) + '...' : s.result) : undefined,
    error: s.error,
  }))

  return c.json({ sessions: summaries, total: summaries.length })
})

// GET /sessions/:id — 会话详情
workflow.get('/sessions/:id', (c) => {
  const id = c.req.param('id')
  const session = loadSession(id)

  if (!session) {
    return c.json({ error: 'Session not found' }, 404)
  }

  return c.json(session)
})

export default workflow

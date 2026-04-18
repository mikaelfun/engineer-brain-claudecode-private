/**
 * agents.ts — Agent 状态/cron/trigger 路由
 */
import { Hono } from 'hono'
import { readAgents } from '../services/cron-reader.js'
import {
  listTriggers,
  createTrigger,
  deleteTrigger,
  runTriggerNow,
  toggleTrigger,
  updateTrigger,
  cancelTrigger,
  isTriggerRunning,
  getRunningTriggerIds,
} from '../services/cron-manager.js'

const agents = new Hono()

// GET /api/agents — Agent 列表
agents.get('/', (c) => {
  const agentList = readAgents()
  return c.json({ agents: agentList, total: agentList.length })
})

// GET /api/agents/cron-jobs — Cron 任务列表 (legacy, now returns triggers)
agents.get('/cron-jobs', (c) => {
  const jobs = listTriggers()
  return c.json({ jobs, total: jobs.length })
})

// ---- Trigger CRUD ----

// GET /api/agents/triggers — List all triggers (with running state)
agents.get('/triggers', (c) => {
  const triggers = listTriggers()
  const runningIds = getRunningTriggerIds()
  // Attach running state to each trigger
  const enriched = triggers.map(t => ({
    ...t,
    running: runningIds.includes(t.id),
  }))
  return c.json({ triggers: enriched, total: enriched.length })
})

// POST /api/agents/triggers — Create a new trigger
agents.post('/triggers', async (c) => {
  try {
    const body = await c.req.json<{
      name?: string
      prompt?: string
      cron?: string
      description?: string
    }>()

    if (!body.name || !body.prompt || !body.cron) {
      return c.json({ error: 'Missing required fields: name, prompt, cron' }, 400)
    }

    // Basic cron format validation (5 fields)
    const cronParts = body.cron.trim().split(/\s+/)
    if (cronParts.length !== 5) {
      return c.json({ error: 'Invalid cron expression: must have 5 fields (minute hour day month weekday)' }, 400)
    }

    const trigger = createTrigger({
      name: body.name,
      prompt: body.prompt,
      cron: body.cron,
      description: body.description,
    })

    return c.json(trigger, 201)
  } catch (err: any) {
    return c.json({ error: err.message || 'Failed to create trigger' }, 500)
  }
})

// DELETE /api/agents/triggers/:id — Delete a trigger
agents.delete('/triggers/:id', (c) => {
  const id = c.req.param('id')
  const deleted = deleteTrigger(id)
  if (!deleted) {
    return c.json({ error: 'Trigger not found' }, 404)
  }
  return c.json({ success: true, id })
})

// POST /api/agents/triggers/:id/run — Run a trigger immediately
agents.post('/triggers/:id/run', async (c) => {
  const id = c.req.param('id')
  // Run asynchronously — don't block the response
  const trigger = listTriggers().find(t => t.id === id)
  if (!trigger) {
    return c.json({ error: 'Trigger not found' }, 404)
  }

  // Start execution in background, return immediately
  runTriggerNow(id).catch(err => {
    console.error(`[triggers] Background run failed for ${id}:`, err)
  })

  return c.json({ success: true, message: 'Trigger execution started', id })
})

// PATCH /api/agents/triggers/:id — Toggle enabled/disabled
agents.patch('/triggers/:id', async (c) => {
  const id = c.req.param('id')
  try {
    const body = await c.req.json<{ enabled?: boolean }>()
    if (typeof body.enabled !== 'boolean') {
      return c.json({ error: 'Missing required field: enabled (boolean)' }, 400)
    }

    const updated = toggleTrigger(id, body.enabled)
    if (!updated) {
      return c.json({ error: 'Trigger not found' }, 404)
    }

    return c.json(updated)
  } catch (err: any) {
    return c.json({ error: err.message || 'Failed to update trigger' }, 500)
  }
})

// PUT /api/agents/triggers/:id — Update trigger fields (name, prompt, cron, description)
agents.put('/triggers/:id', async (c) => {
  const id = c.req.param('id')
  try {
    const body = await c.req.json<{ name?: string; prompt?: string; cron?: string; description?: string }>()
    const updated = updateTrigger(id, body)
    if (!updated) {
      return c.json({ error: 'Trigger not found' }, 404)
    }
    return c.json(updated)
  } catch (err: any) {
    return c.json({ error: err.message || 'Failed to update trigger' }, 500)
  }
})

// POST /api/agents/triggers/:id/cancel — Cancel a running trigger
agents.post('/triggers/:id/cancel', (c) => {
  const id = c.req.param('id')
  const cancelled = cancelTrigger(id)
  if (!cancelled) {
    return c.json({ error: 'Trigger is not running or not found' }, 404)
  }
  return c.json({ success: true, message: 'Trigger cancellation requested', id })
})

export default agents

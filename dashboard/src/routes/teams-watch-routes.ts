/**
 * teams-watch-routes.ts — Teams Watch management API
 *
 * GET  /api/teams-watch              — list all watches
 * POST /api/teams-watch              — create/start a watch
 * DELETE /api/teams-watch/:id        — delete a watch
 * POST /api/teams-watch/:id/start    — start a stopped watch
 * POST /api/teams-watch/:id/stop     — stop a running watch
 * GET  /api/teams-watch/:id/history  — get message history
 * GET  /api/teams-watch/sba/status   — SBA trigger status
 */
import { Hono } from 'hono'
import {
  listWatches,
  startWatch,
  stopWatch,
  deleteWatch,
  getWatchHistory,
} from '../services/teams-watch-reader.js'
import { getSbaPatrolStatus } from '../services/sba-patrol-trigger.js'

const teamsWatchRoutes = new Hono()

// List all watches
teamsWatchRoutes.get('/', (c) => {
  const watches = listWatches()
  return c.json({ watches, total: watches.length })
})

// SBA trigger status (must be before /:id to avoid matching "sba" as id)
teamsWatchRoutes.get('/sba/status', (c) => {
  return c.json(getSbaPatrolStatus())
})

// Create/start a new watch
teamsWatchRoutes.post('/', async (c) => {
  try {
    const body = await c.req.json<{
      topic?: string
      chatId?: string
      interval?: number
      action?: string
    }>()
    if (!body.topic && !body.chatId) {
      return c.json({ error: 'topic or chatId required' }, 400)
    }
    const result = startWatch(body)
    return c.json({ ok: true, result })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// Delete a watch
teamsWatchRoutes.delete('/:id', (c) => {
  const id = c.req.param('id')
  const ok = deleteWatch(id)
  return c.json({ ok })
})

// Start a stopped watch
teamsWatchRoutes.post('/:id/start', async (c) => {
  const id = c.req.param('id')
  const watches = listWatches()
  const watch = watches.find(w => w.watchId === id)
  if (!watch) return c.json({ error: 'Watch not found' }, 404)

  const result = startWatch({
    topic: watch.topic || undefined,
    chatId: watch.chatId || undefined,
    interval: watch.interval || 60,
    action: watch.action || 'notify',
  })
  return c.json({ ok: true, result })
})

// Stop a running watch
teamsWatchRoutes.post('/:id/stop', (c) => {
  const id = c.req.param('id')
  const result = stopWatch(id)
  return c.json({ ok: true, result })
})

// Get message history
teamsWatchRoutes.get('/:id/history', (c) => {
  const id = c.req.param('id')
  const history = getWatchHistory(id)
  return c.json({ history, total: history.length })
})

export default teamsWatchRoutes

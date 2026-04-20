/**
 * actions.ts — Merged + scored actions list route
 *
 * GET /api/actions — returns all active cases and unchecked todos,
 *                    scored by urgency, sorted highest-first.
 *
 * Query params:
 *   ?refresh=true — bypass 5-minute cache
 */
import { Hono } from 'hono'
import { getActions } from '../services/urgency-scorer.js'

const actions = new Hono()

// GET /api/actions — returns merged + scored actions list
actions.get('/', (c) => {
  try {
    const forceRefresh = c.req.query('refresh') === 'true'
    const actionsList = getActions(forceRefresh)
    return c.json({ actions: actionsList, total: actionsList.length })
  } catch (err: any) {
    console.error('[actions] Error fetching actions:', err)
    return c.json({ error: err.message }, 500)
  }
})

export default actions

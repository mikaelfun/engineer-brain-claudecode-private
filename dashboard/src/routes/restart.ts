/**
 * restart.ts — Restart API routes
 *
 * POST /api/restart/frontend  — restart vite dev server
 * POST /api/restart/backend   — restart backend (tsx) process
 * POST /api/restart/all       — restart both
 */
import { Hono } from 'hono'
import { restartFrontend, restartBackend, restartAll } from '../services/restart-service.js'

const restart = new Hono()

restart.post('/frontend', async (c) => {
  const result = await restartFrontend()
  return c.json(result)
})

restart.post('/backend', async (c) => {
  const result = await restartBackend()
  return c.json(result)
})

restart.post('/all', async (c) => {
  const result = await restartAll()
  return c.json(result)
})

export default restart

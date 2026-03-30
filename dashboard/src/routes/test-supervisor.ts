/**
 * test-supervisor.ts — API routes for Test Lab dashboard
 *
 * Exposes test-loop data (state, discoveries, trends, results, fixes, manifest)
 * as read-only REST endpoints for the frontend TestLab page.
 */
import { Hono } from 'hono'
import {
  readTestState,
  readDiscoveries,
  readRoundSummaries,
  readTestResult,
  readFixDetails,
  readManifest,
  readTestRegistry,
  readEvolution,
} from '../services/test-reader.js'
import { sseManager } from '../watcher/sse-manager.js'

const testSupervisorRoutes = new Hono()

// GET /api/tests/state — Full test-loop state machine
testSupervisorRoutes.get('/state', (c) => {
  const state = readTestState()
  if (!state) {
    return c.json({ error: 'No test state found' }, 404)
  }
  return c.json(state)
})

// GET /api/tests/discoveries — Discovery index with summary
testSupervisorRoutes.get('/discoveries', (c) => {
  const discoveries = readDiscoveries()
  if (!discoveries) {
    return c.json({ error: 'No discoveries found' }, 404)
  }
  return c.json(discoveries)
})

// GET /api/tests/trends — Round summaries for trend chart
testSupervisorRoutes.get('/trends', (c) => {
  const summaries = readRoundSummaries()
  return c.json(summaries)
})

// GET /api/tests/result/:round/:testId — Single test result
testSupervisorRoutes.get('/result/:round/:testId', (c) => {
  const round = parseInt(c.req.param('round') || '', 10)
  const testId = c.req.param('testId') || ''

  if (isNaN(round) || !testId) {
    return c.json({ error: 'Invalid round or testId' }, 400)
  }

  const result = readTestResult(round, testId)
  if (!result) {
    return c.json({ error: 'Test result not found' }, 404)
  }
  return c.json(result)
})

// GET /api/tests/fix/:testId — Fix analysis markdown
testSupervisorRoutes.get('/fix/:testId', (c) => {
  const testId = c.req.param('testId') || ''
  if (!testId) {
    return c.json({ error: 'testId required' }, 400)
  }

  const content = readFixDetails(testId)
  if (!content) {
    return c.json({ error: 'Fix details not found' }, 404)
  }
  return c.json({ testId, content })
})

// GET /api/tests/manifest — Feature coverage manifest
testSupervisorRoutes.get('/manifest', (c) => {
  const manifest = readManifest()
  if (!manifest) {
    return c.json({ error: 'Manifest not found' }, 404)
  }
  return c.json(manifest)
})

// GET /api/tests/registry — Test registry metadata (name, description, tags)
testSupervisorRoutes.get('/registry', (c) => {
  const registry = readTestRegistry()
  return c.json(registry)
})

// GET /api/tests/evolution — Framework evolution timeline
testSupervisorRoutes.get('/evolution', (c) => {
  const evolution = readEvolution()
  return c.json(evolution)
})

// GET /api/tests/recent-events — Recent SSE events for TestLab (survives page refresh)
testSupervisorRoutes.get('/recent-events', (c) => {
  const limit = Number(c.req.query('limit')) || 50
  const events = sseManager.getRecentEvents(limit)
  return c.json(events)
})

export default testSupervisorRoutes

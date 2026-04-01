/**
 * test-supervisor.ts — API routes for Test Lab dashboard
 *
 * Exposes stage-worker data (state, discoveries, trends, results, fixes, manifest)
 * as read-only REST endpoints for the frontend TestLab page.
 */
import { Hono } from 'hono'
import {
  readTestState,
  readPipeline,
  readQueues,
  readStats,
  readSupervisor,
  readDiscoveries,
  readRoundSummaries,
  readTestResult,
  readLatestTestResult,
  readFixDetails,
  readManifest,
  readTestRegistry,
  readEvolution,
  readStory,
  readDashboardReportDates,
  readDashboardData,
} from '../services/test-reader.js'
import { sseManager } from '../watcher/sse-manager.js'

const testSupervisorRoutes = new Hono()

// GET /api/tests/state — Full stage-worker state (assembled from split files)
testSupervisorRoutes.get('/state', (c) => {
  const state = readTestState()
  if (!state) {
    return c.json({ error: 'No test state found' }, 404)
  }
  return c.json(state)
})

// GET /api/tests/pipeline — Pipeline stage progress (cycle, stages, currentStage)
testSupervisorRoutes.get('/pipeline', (c) => {
  const pipeline = readPipeline()
  if (!pipeline) {
    return c.json({ error: 'No pipeline state found' }, 404)
  }
  return c.json(pipeline)
})

// GET /api/tests/supervisor — Supervisor reasoning + self-heal events
testSupervisorRoutes.get('/supervisor', (c) => {
  const supervisor = readSupervisor()
  if (!supervisor) {
    return c.json({ error: 'No supervisor state found' }, 404)
  }
  return c.json(supervisor)
})

// GET /api/tests/queues — All queues (test, fix, verify, regression, gaps, skipRegistry)
testSupervisorRoutes.get('/queues', (c) => {
  const queues = readQueues()
  if (!queues) {
    return c.json({ error: 'No queues state found' }, 404)
  }
  return c.json(queues)
})

// GET /api/tests/stats — Cumulative and cycle stats
testSupervisorRoutes.get('/stats', (c) => {
  const stats = readStats()
  if (!stats) {
    return c.json({ error: 'No stats found' }, 404)
  }
  return c.json(stats)
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

  // Try exact round match first
  const result = readTestResult(round, testId)
  if (result) {
    return c.json(result)
  }

  // Fallback: find the latest available result for this testId
  const latestResult = readLatestTestResult(testId)
  if (latestResult) {
    return c.json(latestResult)
  }

  return c.json({ error: 'Test result not found' }, 404)
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

// GET /api/tests/story — Natural language narrative summary
testSupervisorRoutes.get('/story', (c) => {
  const story = readStory()
  if (!story) {
    return c.json({ error: 'No test data for story' }, 404)
  }
  return c.json(story)
})

// GET /api/tests/recent-events — Recent SSE events for TestLab (survives page refresh)
testSupervisorRoutes.get('/recent-events', (c) => {
  const limit = Number(c.req.query('limit')) || 50
  const events = sseManager.getRecentEvents(limit)
  return c.json(events)
})

// GET /api/tests/report-dates — List available morning-report dates (newest first)
testSupervisorRoutes.get('/report-dates', (c) => {
  const dates = readDashboardReportDates()
  return c.json({ dates })
})

// GET /api/tests/report — Latest dashboard-data JSON
testSupervisorRoutes.get('/report', (c) => {
  const data = readDashboardData()
  if (!data) {
    return c.json({ error: 'No morning report data found' }, 404)
  }
  return c.json(data)
})

// GET /api/tests/report/:date — Specific date's dashboard-data JSON
testSupervisorRoutes.get('/report/:date', (c) => {
  const date = c.req.param('date') || ''
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return c.json({ error: 'Invalid date format (expected YYYY-MM-DD)' }, 400)
  }
  const data = readDashboardData(date)
  if (!data) {
    return c.json({ error: `No report found for ${date}` }, 404)
  }
  return c.json(data)
})

export default testSupervisorRoutes

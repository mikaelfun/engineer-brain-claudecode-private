/**
 * labor-estimate.ts — Labor estimation API routes
 *
 * GET  /                              — List all existing estimates
 * GET  /:caseNumber                   — Get existing estimate for a case
 * POST /:caseNumber                   — Trigger AI estimation (stub — use CLI)
 * POST /all                           — Trigger batch AI estimation (stub — use CLI)
 * PUT  /:caseNumber                   — Update estimate with user edits
 * POST /:caseNumber/submit            — Submit single case to D365
 * POST /batch-submit                  — Batch submit to D365
 */
import { Hono } from 'hono'
import { existsSync, readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import { config } from '../config.js'
import {
  readLaborEstimate,
  readAllLaborEstimates,
  saveLaborEstimate,
  submitLaborToD365,
} from '../services/labor-estimate-service.js'

const laborEstimateRoutes = new Hono()

// GET / — List all existing estimates
laborEstimateRoutes.get('/', (c) => {
  const estimates = readAllLaborEstimates()
  return c.json({ estimates, total: estimates.length })
})

// GET /:caseNumber — Get existing estimate for a case
laborEstimateRoutes.get('/:caseNumber', (c) => {
  const caseNumber = c.req.param('caseNumber')
  const estimate = readLaborEstimate(caseNumber)
  if (!estimate) {
    return c.json({ estimate: null, exists: false })
  }
  return c.json({ estimate, exists: true })
})

// POST /all — Load existing estimates for today from disk
// Must be before /:caseNumber to avoid matching "all" as a caseNumber
laborEstimateRoutes.post('/all', async (c) => {
  const casesDir = config.activeCasesDir
  const estimates: any[] = []

  if (existsSync(casesDir)) {
    const dirs = readdirSync(casesDir, { withFileTypes: true })
      .filter(d => d.isDirectory())

    for (const dir of dirs) {
      const estimatePath = join(casesDir, dir.name, 'labor', 'labor-estimate.json')
      if (!existsSync(estimatePath)) continue
      try {
        const data = JSON.parse(readFileSync(estimatePath, 'utf-8'))
        // Only include today's estimates
        const today = new Date().toISOString().split('T')[0]
        if (data.date === today) {
          estimates.push({ success: true, estimate: data })
        }
      } catch {}
    }
  }

  return c.json({
    success: true,
    message: `Found ${estimates.length} existing estimates for today`,
    estimates,
    total: estimates.length,
  })
})

// POST /batch-submit — Batch submit to D365
// Must be before /:caseNumber to avoid matching "batch-submit" as a caseNumber
laborEstimateRoutes.post('/batch-submit', async (c) => {
  const { items } = await c.req.json<{
    items: Array<{
      caseNumber: string
      totalMinutes: number
      classification: string
      description: string
    }>
  }>()

  if (!items || items.length === 0) {
    return c.json({ error: 'items array is required' }, 400)
  }

  const results: Array<{ caseNumber: string; success: boolean; message: string }> = []

  for (const item of items) {
    const result = await submitLaborToD365(
      item.caseNumber,
      item.totalMinutes,
      item.classification,
      item.description
    )
    results.push({ caseNumber: item.caseNumber, ...result })
  }

  return c.json({
    results,
    total: results.length,
    succeeded: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
  })
})

// POST /:caseNumber — Trigger AI estimation (stub)
laborEstimateRoutes.post('/:caseNumber', async (c) => {
  const caseNumber = c.req.param('caseNumber')
  return c.json({
    success: false,
    message: `Use CLI /labor-estimate ${caseNumber} command to generate estimate. WebUI SDK integration coming soon.`,
    estimate: null,
  })
})

// PUT /:caseNumber — Update estimate with user edits
laborEstimateRoutes.put('/:caseNumber', async (c) => {
  const caseNumber = c.req.param('caseNumber')
  const body = await c.req.json<{
    totalMinutes?: number
    classification?: string
    description?: string
  }>()

  const estimate = readLaborEstimate(caseNumber)
  if (!estimate) {
    return c.json({ error: 'No estimate found for this case' }, 404)
  }

  if (body.totalMinutes !== undefined) {
    estimate.estimated.totalMinutes = body.totalMinutes
  }
  if (body.classification !== undefined) {
    estimate.estimated.classification = body.classification
  }
  if (body.description !== undefined) {
    estimate.estimated.description = body.description
  }
  estimate.status = 'confirmed'

  saveLaborEstimate(caseNumber, estimate)
  return c.json({ success: true, estimate })
})

// POST /:caseNumber/submit — Submit single case to D365
laborEstimateRoutes.post('/:caseNumber/submit', async (c) => {
  const caseNumber = c.req.param('caseNumber')
  const { totalMinutes, classification, description } = await c.req.json<{
    totalMinutes: number
    classification: string
    description: string
  }>()

  if (!totalMinutes || !classification || !description) {
    return c.json({ error: 'totalMinutes, classification, and description are required' }, 400)
  }

  const result = await submitLaborToD365(caseNumber, totalMinutes, classification, description)
  return c.json(result, result.success ? 200 : 500)
})

export { laborEstimateRoutes }

/**
 * labor-estimate.ts — Labor estimation API routes
 *
 * GET  /                              — List all existing estimates
 * GET  /:caseNumber                   — Get existing estimate for a case
 * POST /:caseNumber                   — Trigger AI estimation via SDK
 * POST /all                           — Trigger batch AI estimation (serial SDK + SSE progress)
 * PUT  /:caseNumber                   — Update estimate with user edits
 * POST /:caseNumber/submit            — Submit single case to D365
 * POST /batch-submit                  — Batch submit to D365
 */
import { Hono } from 'hono'
import { existsSync, readFileSync, readdirSync, statSync, unlinkSync } from 'fs'
import { join } from 'path'
import { execFile } from 'child_process'
import { promisify } from 'util'
import { config } from '../config.js'
import {
  readLaborEstimate,
  readAllLaborEstimates,
  saveLaborEstimate,
  submitLaborToD365,
} from '../services/labor-estimate-service.js'
import { parseLaborRecords } from '../services/labor-reader.js'
import { stepCaseSession } from '../agent/case-session-manager.js'
import { batchParallelQuery, type BatchTask } from '../agent/batch-orchestrator.js'
import { sseManager } from '../watcher/sse-manager.js'

const execFileAsync = promisify(execFile)

/** Refresh labor.md from D365 for a case (non-fatal) */
async function refreshLabor(caseNumber: string): Promise<void> {
  try {
    await execFileAsync('pwsh', ['-NoProfile', '-File', join(config.scriptsDir, 'view-labor.ps1'), '-TicketNumber', caseNumber, '-OutputDir', config.activeCasesDir], { timeout: 60000 })
  } catch (e: any) {
    console.warn(`[labor-estimate] refresh labor failed for ${caseNumber} (non-fatal): ${e.message}`)
  }
}

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

// POST /all — Batch AI estimation: single SDK session → parallel subagent spawn
// Must be before /:caseNumber to avoid matching "all" as a caseNumber
laborEstimateRoutes.post('/all', async (c) => {
  const casesDir = config.activeCasesDir
  if (!existsSync(casesDir)) {
    return c.json({ success: true, estimates: [], total: 0 })
  }

  const dirs = readdirSync(casesDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)

  // Step 0: Refresh labor.md from D365 for all active cases (parallel, non-fatal)
  // Skip cases that also exist in archived/ (stale directory remnants)
  const archivedDir = join(config.casesDir, 'archived')
  const activeDirs = dirs.filter(cn => !existsSync(join(archivedDir, cn)))
  await Promise.all(activeDirs.map(cn => refreshLabor(cn)))

  const today = new Date().toISOString().split('T')[0] // 2026-04-10

  // Normalize D365 date format (M/D/YYYY) to ISO (YYYY-MM-DD) for comparison
  function normalizeDate(dateStr: string): string {
    const m = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
    if (m) return `${m[3]}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}`
    // Already ISO format or similar
    return dateStr.split('T')[0]
  }

  // Pre-check: skip cases that already have today's estimate or today's labor
  const casesToEstimate = dirs.filter(caseNumber => {
    // Skip if already has today's estimate
    const estimatePath = join(casesDir, caseNumber, 'labor', 'labor-estimate.json')
    if (existsSync(estimatePath)) {
      try {
        const data = JSON.parse(readFileSync(estimatePath, 'utf-8'))
        if (data.date === today) return false
      } catch {}
    }
    // Skip if already has today's labor record
    try {
      const records = parseLaborRecords(caseNumber)
      if (records.some((r: any) => normalizeDate(r.date) === today)) return false
    } catch {}
    return true
  })

  // Collect already-estimated cases for the response
  const estimates: Array<{ caseNumber: string; success: boolean; estimate?: any; error?: string }> = []
  for (const caseNumber of dirs) {
    if (casesToEstimate.includes(caseNumber)) continue
    const estimatePath = join(casesDir, caseNumber, 'labor', 'labor-estimate.json')
    try {
      const data = JSON.parse(readFileSync(estimatePath, 'utf-8'))
      estimates.push({ caseNumber, success: true, estimate: data })
    } catch {}
  }

  if (casesToEstimate.length > 0) {
    // Build batch tasks — each subagent runs /labor-estimate for one case
    const tasks: BatchTask[] = casesToEstimate.map(cn => ({
      caseNumber: cn,
      caseDir: join(casesDir, cn),
      prompt: `Execute /labor-estimate for Case ${cn}. Read .claude/skills/labor-estimate/SKILL.md for full instructions, then execute. Do NOT use AskUserQuestion — save the estimate file and skip the interactive step. IMPORTANT: If there is NO actual activity for today, do NOT create the labor-estimate.json file — skip silently. Never generate 0-minute estimates. Description must be 1 short sentence describing what technical work was done (e.g. "Investigated VM boot failure via diagnostics"), NOT file counts like "Produced 3 reports".`,
    }))

    // Parallel execution via single SDK session
    await batchParallelQuery('labor-estimate', tasks)

    // Read results from generated files
    for (const caseNumber of casesToEstimate) {
      const estimate = readLaborEstimate(caseNumber)
      if (estimate && estimate.estimated && estimate.estimated.totalMinutes > 0) {
        estimates.push({ caseNumber, success: true, estimate })
      }
      // Silently skip 0-minute or missing estimates — no error needed
    }
  }

  return c.json({
    success: true,
    message: `Estimated ${casesToEstimate.length} cases (${estimates.filter(e => e.success).length} succeeded)`,
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

// POST /:caseNumber — Trigger AI estimation via SDK session
laborEstimateRoutes.post('/:caseNumber', async (c) => {
  const caseNumber = c.req.param('caseNumber')

  // Refresh labor.md from D365 before estimating
  await refreshLabor(caseNumber)

  try {
    for await (const _msg of stepCaseSession(caseNumber, 'labor-estimate')) {
      // Consume messages — side effect is file generation
    }

    const estimate = readLaborEstimate(caseNumber)
    if (estimate) {
      return c.json({ success: true, estimate })
    }
    return c.json({ success: false, error: 'No estimate file generated', estimate: null })
  } catch (err: any) {
    return c.json({ success: false, error: err.message, estimate: null }, 500)
  }
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
  return c.json(result)
})

// DELETE /all — Discard all estimate caches (must be before /:caseNumber)
laborEstimateRoutes.delete('/all', (c) => {
  const casesDir = config.activeCasesDir
  if (!existsSync(casesDir)) return c.json({ success: true, discarded: 0 })
  const dirs = readdirSync(casesDir, { withFileTypes: true })
  let discarded = 0
  for (const d of dirs) {
    if (!d.isDirectory()) continue
    const estimatePath = join(casesDir, d.name, 'labor', 'labor-estimate.json')
    if (existsSync(estimatePath)) {
      unlinkSync(estimatePath)
      discarded++
    }
  }
  return c.json({ success: true, discarded })
})

// DELETE /:caseNumber — Discard single estimate cache
laborEstimateRoutes.delete('/:caseNumber', (c) => {
  const caseNumber = c.req.param('caseNumber')
  const estimatePath = join(config.activeCasesDir, caseNumber, 'labor', 'labor-estimate.json')
  if (existsSync(estimatePath)) {
    unlinkSync(estimatePath)
  }
  return c.json({ success: true })
})

export { laborEstimateRoutes }

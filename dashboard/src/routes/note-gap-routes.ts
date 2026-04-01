import { Hono } from 'hono'
import { existsSync, readFileSync, readdirSync, unlinkSync } from 'fs'
import { join } from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import { config } from '../config.js'
import matter from 'gray-matter'

const execAsync = promisify(exec)
const noteGapRoutes = new Hono()
const noteGapBatchRoutes = new Hono()

function getDraftPath(caseNumber: string): string {
  return join(config.activeCasesDir, caseNumber, 'note-draft.md')
}

/**
 * GET / — Get all note gaps across all active cases
 * Mounted on /api/note-gaps (separate from /api/case/:id/note-gap)
 */
noteGapBatchRoutes.get('/', (c) => {
  const casesDir = config.activeCasesDir
  if (!existsSync(casesDir)) return c.json({ gaps: [] })

  const dirs = readdirSync(casesDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)

  const gaps: Array<{
    caseNumber: string
    title: string
    body: string
    gapDays: number
    lastNoteDate: string
    generatedAt: string
  }> = []

  for (const dir of dirs) {
    const draftPath = join(casesDir, dir, 'note-draft.md')
    if (!existsSync(draftPath)) continue
    try {
      const content = readFileSync(draftPath, 'utf-8')
      const { data } = matter(content)
      gaps.push({
        caseNumber: dir,
        title: data.title || '',
        body: data.body || '',
        gapDays: data.gapDays || 0,
        lastNoteDate: data.lastNoteDate || '',
        generatedAt: data.generatedAt || '',
      })
    } catch {}
  }

  return c.json({ gaps })
})

/**
 * GET /:id/note-gap — Get current note gap status + draft if exists
 */
noteGapRoutes.get('/:id/note-gap', (c) => {
  const caseNumber = c.req.param('id')
  const draftPath = getDraftPath(caseNumber)

  if (!existsSync(draftPath)) {
    return c.json({ hasGap: false, draft: null })
  }

  try {
    const content = readFileSync(draftPath, 'utf-8')
    const { data } = matter(content)
    return c.json({
      hasGap: true,
      draft: {
        title: data.title || '',
        body: data.body || '',
        gapDays: data.gapDays || 0,
        lastNoteDate: data.lastNoteDate || '',
        generatedAt: data.generatedAt || '',
      },
    })
  } catch {
    return c.json({ hasGap: false, draft: null })
  }
})

/**
 * POST /:id/note-gap/submit — Write note to D365
 * Body: { title: string, body: string }
 */
noteGapRoutes.post('/:id/note-gap/submit', async (c) => {
  const caseNumber = c.req.param('id')
  const { title, body } = await c.req.json<{ title: string; body: string }>()

  if (!title || !body) {
    return c.json({ error: 'title and body are required' }, 400)
  }

  const caseDir = join(config.activeCasesDir, caseNumber)
  const scriptDir = config.scriptsDir

  try {
    // Write note via add-note.ps1
    const escapedTitle = title.replace(/'/g, "''")
    const escapedBody = body.replace(/'/g, "''")
    const addCmd = `pwsh "${join(scriptDir, 'add-note.ps1')}" -TicketNumber "${caseNumber}" -Title '${escapedTitle}' -Body '${escapedBody}' -OutputDir "${caseDir}"`
    await execAsync(addCmd, { timeout: 60000 })

    // Verify via fetch-notes.ps1
    const fetchCmd = `pwsh "${join(scriptDir, 'fetch-notes.ps1')}" -TicketNumber "${caseNumber}" -OutputDir "${caseDir}" -Force`
    await execAsync(fetchCmd, { timeout: 60000 })

    // Clean up draft
    const draftPath = getDraftPath(caseNumber)
    if (existsSync(draftPath)) {
      unlinkSync(draftPath)
    }

    return c.json({ success: true, message: `Note "${title}" written to Case ${caseNumber}` })
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500)
  }
})

/**
 * DELETE /:id/note-gap — Dismiss/ignore the gap
 */
noteGapRoutes.delete('/:id/note-gap', (c) => {
  const caseNumber = c.req.param('id')
  const draftPath = getDraftPath(caseNumber)

  if (existsSync(draftPath)) {
    unlinkSync(draftPath)
  }

  return c.json({ success: true, message: 'Note gap dismissed' })
})

export { noteGapRoutes, noteGapBatchRoutes }

import { Hono } from 'hono'
import { existsSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from 'fs'
import { join, resolve } from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import { config } from '../config.js'
import matter from 'gray-matter'
import { batchParallelQuery, type BatchTask } from '../agent/batch-orchestrator.js'

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
 * POST / — Batch check all active cases for note gaps via parallel SDK subagents
 * Pre-check: only skip cases that already have a draft
 * All other cases → AI agent determines gap and generates draft if needed
 */
noteGapBatchRoutes.post('/', async (c) => {
  const casesDir = config.activeCasesDir
  if (!existsSync(casesDir)) {
    return c.json({ checked: 0, gaps: 0, generated: 0, skipped: 0, details: [] })
  }

  const dirs = readdirSync(casesDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)

  const details: Array<{
    caseNumber: string
    status: 'gap' | 'ok' | 'no-notes' | 'already-has-draft' | 'checked'
    gapDays?: number
    lastNoteDate?: string
  }> = []
  let skipped = 0

  // Pre-check: only skip cases that already have a draft
  const casesToCheck: string[] = []
  for (const caseNumber of dirs) {
    const draftPath = join(casesDir, caseNumber, 'note-draft.md')
    if (existsSync(draftPath)) {
      details.push({ caseNumber, status: 'already-has-draft' })
      skipped++
    } else {
      casesToCheck.push(caseNumber)
    }
  }

  if (casesToCheck.length > 0) {
    // Build batch tasks — each subagent runs note-gap for one case
    const tasks: BatchTask[] = casesToCheck.map(cn => ({
      caseNumber: cn,
      caseDir: join(casesDir, cn),
      prompt: `Case ${cn}, caseDir=${join(casesDir, cn)}. Read .claude/skills/note-gap/SKILL.md for full instructions, then execute. Do NOT use AskUserQuestion.`,
      subagentType: 'note-gap-checker',
    }))

    // Parallel execution via single SDK session
    await batchParallelQuery('note-gap', tasks)

    // Check results — see which cases got drafts generated
    for (const caseNumber of casesToCheck) {
      const draftPath = join(casesDir, caseNumber, 'note-draft.md')
      if (existsSync(draftPath)) {
        details.push({ caseNumber, status: 'gap' })
      } else {
        details.push({ caseNumber, status: 'ok' })
      }
    }
  }

  const gapCount = details.filter(d => d.status === 'gap' || d.status === 'already-has-draft').length
  const generated = details.filter(d => d.status === 'gap').length

  return c.json({
    checked: dirs.length,
    gaps: gapCount,
    generated,
    skipped,
    details,
  })
})

// ===== Helper functions for batch note gap check =====

function fmtDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

/** Parse latest non-system note date from notes.md */
function parseLatestNoteDate(notesPath: string): Date | null {
  try {
    const content = readFileSync(notesPath, 'utf-8')
    const lines = content.split('\n')
    let latestDate: Date | null = null

    for (const line of lines) {
      // Format: ### 📝 M/D/YYYY H:MM AM|PM | author
      const match = line.match(/^### 📝\s+(\d{1,2}\/\d{1,2}\/\d{4}\s+\d{1,2}:\d{2}\s+[AP]M)\s*\|\s*(.+)/)
      if (!match) continue

      // Skip system notes
      const author = match[2].trim()
      if (author.includes('系统自动分配') || author.includes('System')) continue

      try {
        const dateStr = match[1]
        const parsed = new Date(dateStr)
        if (!isNaN(parsed.getTime()) && (!latestDate || parsed > latestDate)) {
          latestDate = parsed
        }
      } catch {}
    }

    return latestDate
  } catch {
    return null
  }
}

/** Extract progress entries from case-summary.md after a given date */
function extractProgressAfter(summaryPath: string, afterDate: Date): Array<{ date: string; items: string[] }> {
  if (!existsSync(summaryPath)) return []

  try {
    const content = readFileSync(summaryPath, 'utf-8')
    const entries: Array<{ date: string; items: string[] }> = []
    let currentDate = ''
    let currentItems: string[] = []

    for (const line of content.split('\n')) {
      // Match date entries like: - [2026-03-28] description
      const dateMatch = line.match(/^- \[(\d{4}-\d{2}-\d{2})\]\s+(.+)/)
      if (dateMatch) {
        const entryDate = new Date(dateMatch[1])
        if (entryDate > afterDate) {
          if (currentDate !== dateMatch[1]) {
            if (currentDate && currentItems.length > 0) {
              entries.push({ date: currentDate, items: [...currentItems] })
            }
            currentDate = dateMatch[1]
            currentItems = []
          }
          currentItems.push(dateMatch[2])
        }
      }
    }

    // Push last group
    if (currentDate && currentItems.length > 0) {
      entries.push({ date: currentDate, items: currentItems })
    }

    return entries
  } catch {
    return []
  }
}

/** Generate draft body in YYMMDD-- format */
function generateDraftBody(
  progressEntries: Array<{ date: string; items: string[] }>,
  lastNoteDate: Date,
  now: Date
): string {
  if (progressEntries.length === 0) {
    // No progress found — generate a minimal status update
    const yy = String(now.getFullYear()).slice(2)
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const dd = String(now.getDate()).padStart(2, '0')
    return `${yy}${mm}${dd}--\n- -continued investigation, no update.`
  }

  const lines: string[] = []
  for (const entry of progressEntries) {
    // Convert 2026-03-28 to 260328
    const parts = entry.date.split('-')
    const yymmdd = parts[0].slice(2) + parts[1] + parts[2]
    lines.push(`${yymmdd}--`)
    for (const item of entry.items) {
      // Ensure starts with - - (dash space dash)
      const cleaned = item.replace(/^[-•]\s*/, '').trim()
      lines.push(`- -${cleaned}`)
    }
  }

  return lines.join('\n')
}

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
 * POST /:id/note-gap/submit — Write note to D365 via add-note-safe.ps1
 * Body: { title: string, body: string }
 * Uses base64 encoding to pass content safely, pre-write validation, post-write verification.
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
    // Write title and body to temp files to avoid shell escaping issues
    const titleFile = join(caseDir, 'note-title.tmp')
    const bodyFile = join(caseDir, 'note-body.tmp')
    writeFileSync(titleFile, title, 'utf-8')
    writeFileSync(bodyFile, body, 'utf-8')

    try {
      // Write note via add-note-safe.ps1 (safe version with validation)
      const addCmd = `pwsh "${join(scriptDir, 'add-note-safe.ps1')}" -TicketNumber "${caseNumber}" -TitleFile "${titleFile}" -BodyFile "${bodyFile}"`
      console.log(`[note-gap/submit] Running: ${addCmd}`)
      const addResult = await execAsync(addCmd, { timeout: 90000 })
      console.log(`[note-gap/submit] stdout: ${addResult.stdout}`)
      if (addResult.stderr) console.error(`[note-gap/submit] stderr: ${addResult.stderr}`)

      // Parse last line as JSON result
      const lines = addResult.stdout.trim().split('\n')
      const lastLine = lines[lines.length - 1].trim()
      let scriptResult: { success: boolean; error?: string; annotationId?: string }

      try {
        scriptResult = JSON.parse(lastLine)
      } catch {
        console.error(`[note-gap/submit] Failed to parse script result: ${lastLine}`)
        return c.json({ success: false, error: `Script output not parseable: ${lastLine.substring(0, 200)}` }, 500)
      }

      if (!scriptResult.success) {
        console.error(`[note-gap/submit] Script reported failure: ${scriptResult.error}`)
        // Do NOT delete draft on failure — user can retry
        return c.json({ success: false, error: scriptResult.error }, 500)
      }

      // Success — refresh notes and clean up draft
      try {
        const fetchCmd = `pwsh "${join(scriptDir, 'fetch-notes.ps1')}" -TicketNumber "${caseNumber}" -OutputDir "${caseDir}" -Force`
        await execAsync(fetchCmd, { timeout: 60000 })
      } catch (fetchErr: any) {
        console.warn(`[note-gap/submit] fetch-notes failed (non-fatal): ${fetchErr.message}`)
      }

      // Clean up draft only on confirmed success
      const draftPath = getDraftPath(caseNumber)
      if (existsSync(draftPath)) {
        unlinkSync(draftPath)
      }

      return c.json({ success: true, message: `Note "${title}" written to Case ${caseNumber}`, annotationId: scriptResult.annotationId })
    } finally {
      // Always clean up temp files
      if (existsSync(titleFile)) unlinkSync(titleFile)
      if (existsSync(bodyFile)) unlinkSync(bodyFile)
    }
  } catch (err: any) {
    console.error(`[note-gap/submit] Unhandled error: ${err.message}`)
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

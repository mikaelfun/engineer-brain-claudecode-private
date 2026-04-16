import { Hono } from 'hono'
import { existsSync, readFileSync, readdirSync, unlinkSync, writeFileSync, statSync } from 'fs'
import { join, resolve } from 'path'
import { exec, execFile } from 'child_process'
import { promisify } from 'util'
import { config } from '../config.js'
import { parseCaseInfo } from '../services/case-reader.js'
import matter from 'gray-matter'
import { batchParallelQuery, type BatchTask } from '../agent/batch-orchestrator.js'

const execAsync = promisify(exec)
const execFileAsync = promisify(execFile)

/** Refresh notes.md from D365 for a case (non-fatal) */
async function refreshNotes(caseNumber: string): Promise<void> {
  try {
    await execFileAsync('pwsh', ['-NoProfile', '-File', join(config.scriptsDir, 'fetch-notes.ps1'), '-TicketNumber', caseNumber, '-OutputDir', config.activeCasesDir, '-Force'], { timeout: 60000 })
  } catch (e: any) {
    console.warn(`[note-gap] refresh notes failed for ${caseNumber} (non-fatal): ${e.message}`)
  }
}

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
    caseTitle: string
    title: string
    body: string
    gapDays: number
    lastNoteDate: string
    generatedAt: string
  }> = []

  for (const dir of dirs) {
    // Skip AR cases
    const metaPath = join(casesDir, dir, 'casework-meta.json')
    if (existsSync(metaPath)) {
      try {
        const meta = JSON.parse(readFileSync(metaPath, 'utf-8'))
        if (meta.isAR === true) continue
      } catch {}
    }
    const draftPath = join(casesDir, dir, 'note-draft.md')
    if (!existsSync(draftPath)) continue
    try {
      const content = readFileSync(draftPath, 'utf-8')
      const { data } = matter(content)
      const caseInfo = parseCaseInfo(dir)
      let caseTitle = caseInfo?.title || ''
      if (!caseTitle) {
        try {
          const metaPath = join(casesDir, dir, 'casework-meta.json')
          if (existsSync(metaPath)) {
            const meta = JSON.parse(readFileSync(metaPath, 'utf-8'))
            caseTitle = meta.caseTitle || meta.title || ''
          }
        } catch {}
      }
      gaps.push({
        caseNumber: dir,
        caseTitle,
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

  // Step 0: Refresh notes.md from D365 for all active cases (parallel, non-fatal)
  // Skip cases that also exist in archived/ (stale directory remnants)
  const archivedDir = join(config.casesDir, 'archived')
  const activeDirs = dirs.filter(cn => !existsSync(join(archivedDir, cn)))
  await Promise.all(activeDirs.map(cn => refreshNotes(cn)))

  const details: Array<{
    caseNumber: string
    status: 'gap' | 'ok' | 'no-notes' | 'already-has-draft' | 'checked'
    gapDays?: number
    lastNoteDate?: string
  }> = []
  let skipped = 0

  // Pre-check: skip cases that already have a draft or are AR cases
  const casesToCheck: string[] = []
  for (const caseNumber of dirs) {
    const draftPath = join(casesDir, caseNumber, 'note-draft.md')
    if (existsSync(draftPath)) {
      details.push({ caseNumber, status: 'already-has-draft' })
      skipped++
      continue
    }
    // Skip AR cases — AR notes should be managed separately, not via batch note-gap
    const metaPath = join(casesDir, caseNumber, 'casework-meta.json')
    if (existsSync(metaPath)) {
      try {
        const meta = JSON.parse(readFileSync(metaPath, 'utf-8'))
        if (meta.isAR === true) {
          details.push({ caseNumber, status: 'ok' as const })
          skipped++
          continue
        }
      } catch {}
    }
    casesToCheck.push(caseNumber)
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

      // Skip system notes (aligned with CLI skill + note-reader.ts)
      const author = match[2].trim()
      if (author.includes('系统自动分配') || author.includes('System') || author === 'CrmGlobal-DFM-MSaaS') continue

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

/** Write draft file in YAML frontmatter format */
function writeDraftFile(
  draftPath: string, title: string, body: string,
  gapDays: number, lastNoteDate: string, isNewCase: boolean, now: Date
): void {
  const draftContent = [
    '---',
    `title: "${title}"`,
    `body: |`,
    ...body.split('\n').map(l => `  ${l}`),
    `gapDays: ${gapDays}`,
    `lastNoteDate: "${lastNoteDate}"`,
    `isNewCase: ${isNewCase}`,
    `generatedAt: "${now.toISOString()}"`,
    '---',
  ].join('\n')
  writeFileSync(draftPath, draftContent, 'utf-8')
}

/**
 * Generate first-day note draft for new cases (no human notes yet).
 * Reads meta + case-summary to construct an initial record.
 * Aligned with CLI SKILL.md Step 4a + Step 6a.
 */
function generateNewCaseDraft(
  caseNumber: string, caseDir: string, metaPath: string, summaryPath: string, now: Date
): { title: string; body: string } | null {
  const yy = String(now.getFullYear()).slice(2)
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const todayYYMMDD = `${yy}${mm}${dd}`

  const bullets: string[] = []

  // Read meta for IR SLA, email count, actualStatus
  if (existsSync(metaPath)) {
    try {
      const meta = JSON.parse(readFileSync(metaPath, 'utf-8'))
      if (meta.irSla?.status === 'Succeeded') {
        bullets.push('- -met IR SLA.')
      }
      // Check if emails exist (implies initial response sent)
      const emailCount = meta.emails_count ?? meta.emailCountAtJudge ?? 0
      if (emailCount > 0) {
        bullets.push('- -sent initial response to customer.')
      }
      if (meta.actualStatus) {
        bullets.push(`- -case status: ${meta.actualStatus}.`)
      }
    } catch {}
  }

  // Read case-summary for today's entries
  if (existsSync(summaryPath)) {
    const progress = extractProgressAfter(summaryPath, new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)) // last 7 days
    for (const entry of progress) {
      for (const item of entry.items) {
        const cleaned = item.replace(/^[-•]\s*/, '').trim()
        const bullet = `- -${cleaned}`
        if (!bullets.includes(bullet)) {
          bullets.push(bullet)
        }
      }
    }
  }

  // Fallback — at least one entry
  if (bullets.length === 0) {
    bullets.push('- -new case received, initial assessment in progress.')
  }

  return {
    title: 'fangkun note',
    body: `${todayYYMMDD}--\n${bullets.join('\n')}`,
  }
}

/**
 * GET /:id/note-gap — Get current note gap status + draft if exists
 */
noteGapRoutes.get('/:id/note-gap', (c) => {
  const caseNumber = c.req.param('id')
  const draftPath = getDraftPath(caseNumber)

  if (!existsSync(draftPath)) {
    // Also return gap info even without a draft (for the "Check" button state)
    const caseDir = join(config.activeCasesDir, caseNumber)
    const notesPath = join(caseDir, 'notes.md')
    const latestDate = existsSync(notesPath) ? parseLatestNoteDate(notesPath) : null
    const now = new Date()
    const gapDays = latestDate ? Math.floor((now.getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24)) : null
    return c.json({ hasGap: false, draft: null, gapDays, lastNoteDate: latestDate ? fmtDate(latestDate) : null })
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
 * POST /:id/note-gap/check — Trigger note gap check for a single case (fast API path)
 *
 * Aligned with CLI skill logic:
 *   Step 2: Auto-refresh notes.md if >24h old
 *   Step 3: Parse latest human note, filter system notes (CrmGlobal-DFM-MSaaS + 系统自动分配)
 *   Step 4: New Case detection (no human notes → generate first-day record from meta)
 *   Step 5-7: Generate draft in fangkun note format
 */
noteGapRoutes.post('/:id/note-gap/check', async (c) => {
  const caseNumber = c.req.param('id')
  const caseDir = join(config.activeCasesDir, caseNumber)

  if (!existsSync(caseDir)) {
    return c.json({ error: 'Case not found' }, 404)
  }

  const notesPath = join(caseDir, 'notes.md')
  const summaryPath = join(caseDir, 'case-summary.md')
  const metaPath = join(caseDir, 'casework-meta.json')
  const draftPath = getDraftPath(caseNumber)
  const now = new Date()
  const threshold = config.noteGapThresholdDays ?? 3

  // ── Step 2: Always refresh notes.md from D365 before checking ──
  await refreshNotes(caseNumber)
  const notesRefreshed = true

  // ── Step 3: Parse latest human note ──
  const latestDate = existsSync(notesPath) ? parseLatestNoteDate(notesPath) : null

  // ── Step 4: New Case detection ──
  if (!latestDate) {
    // No human notes found — check if this is a new case
    const newCaseDraft = generateNewCaseDraft(caseNumber, caseDir, metaPath, summaryPath, now)
    if (newCaseDraft) {
      writeDraftFile(draftPath, newCaseDraft.title, newCaseDraft.body, 0, 'none', true, now)
      return c.json({
        hasGap: true,
        gapDays: 0,
        lastNoteDate: null,
        isNewCase: true,
        notesRefreshed,
        draft: { title: newCaseDraft.title, body: newCaseDraft.body, gapDays: 0, lastNoteDate: 'none', generatedAt: now.toISOString() },
        message: 'New case detected — first-day record draft generated.',
      })
    }
    return c.json({ hasGap: false, gapDays: null, isNewCase: true, notesRefreshed, message: 'No notes found, could not generate draft' })
  }

  // ── Step 4b: Regular gap check ──
  const gapDays = Math.floor((now.getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24))

  if (gapDays < threshold) {
    return c.json({ hasGap: false, gapDays, lastNoteDate: fmtDate(latestDate), notesRefreshed, message: `No gap (${gapDays}d < ${threshold}d threshold)` })
  }

  // ── Steps 5-7: Generate draft ──
  const progress = extractProgressAfter(summaryPath, latestDate)
  const body = generateDraftBody(progress, latestDate, now)
  const title = 'fangkun note'

  writeDraftFile(draftPath, title, body, gapDays, fmtDate(latestDate), false, now)

  return c.json({
    hasGap: true,
    gapDays,
    lastNoteDate: fmtDate(latestDate),
    isNewCase: false,
    notesRefreshed,
    draft: { title, body, gapDays, lastNoteDate: fmtDate(latestDate), generatedAt: now.toISOString() },
    message: `Gap detected: ${gapDays} days. Draft generated.`,
  })
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

      // Parse result JSON — scan from last line backwards (skip lock-release / non-JSON lines)
      const lines = addResult.stdout.trim().split('\n')
      let scriptResult: { success: boolean; error?: string; annotationId?: string } | null = null

      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i].trim()
        if (!line || !line.startsWith('{')) continue
        try {
          const parsed = JSON.parse(line)
          if (typeof parsed.success === 'boolean') {
            scriptResult = parsed
            break
          }
        } catch {
          // not JSON, keep scanning
        }
      }

      if (!scriptResult) {
        const lastLine = lines[lines.length - 1]?.trim() || ''
        console.error(`[note-gap/submit] No JSON result found in script output`)
        return c.json({ success: false, error: `Script output not parseable: ${lastLine.substring(0, 200)}` }, 500)
      }

      if (!scriptResult.success) {
        console.error(`[note-gap/submit] Script reported failure: ${scriptResult.error}`)
        // Do NOT delete draft on failure — user can retry
        return c.json({ success: false, error: scriptResult.error }, 500)
      }

      // Success — refresh notes and clean up draft
      try {
        const fetchCmd = `pwsh "${join(scriptDir, 'fetch-notes.ps1')}" -TicketNumber "${caseNumber}" -OutputDir "${config.activeCasesDir}" -Force`
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

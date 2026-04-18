/**
 * cases.ts — Case 数据读取路由
 */
import { Hono } from 'hono'
import { execFile } from 'child_process'
import { promisify } from 'util'
import { listActiveCases, listArCases } from '../services/workspace.js'
import { parseCaseInfo, readTeamsLastMessageTime } from '../services/case-reader.js'
import { parseEmails } from '../services/email-reader.js'
import { config } from '../config.js'

const execFileAsync = promisify(execFile)
import { parseNotes } from '../services/note-reader.js'
import { parseLaborRecords } from '../services/labor-reader.js'
import { readCaseMeta } from '../services/meta-reader.js'
import { readCaseDrafts } from '../services/draft-reader.js'
import { toggleCaseTodoItem } from '../services/todo-writer.js'
import { readFileSync, existsSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'
import { getCaseDir, isValidCaseNumber } from '../services/workspace.js'
import type { CaseSummary, CaseStats } from '../types/index.js'

const cases = new Hono()

/**
 * Extract customer name from Entitlement Schedule when customer is "Generic Account".
 * Schedule format: "CompanyName - SupportPlan (ContractId)" or "CompanyName–SupportPlan"
 * Returns the part before the first dash/en-dash, trimmed.
 */
function resolveCustomerName(customer: string, schedule?: string): string {
  if (!customer || customer.toLowerCase() === 'generic account') {
    if (schedule) {
      // Split on first '-' or '–' (en-dash)
      const match = schedule.match(/^(.+?)[\s]*[-–]/)
      if (match) return match[1].trim()
    }
  }
  return customer
}

/** Validate caseNumber path param — rejects path traversal */
function validateCaseNumber(c: any): string | null {
  const id = c.req.param('id')
  if (!id || !isValidCaseNumber(id)) {
    return null
  }
  return id
}

// GET /api/cases — 所有活跃 Case 列表
cases.get('/', (c) => {
  const activeCases = listActiveCases()
  const arCases = listArCases()

  const summaries: CaseSummary[] = []

  for (const cn of activeCases) {
    const info = parseCaseInfo(cn)
    const meta = readCaseMeta(cn)
    const teamsLastMessageTime = readTeamsLastMessageTime(cn)
    summaries.push({
      caseNumber: cn,
      title: info?.title || '',
      severity: info?.severity || '',
      status: info?.status || '',
      customer: resolveCustomerName(info?.customer || '', info?.entitlement?.schedule),
      assignedTo: info?.assignedTo || '',
      createdOn: info?.createdOn || '',
      caseAge: info?.caseAge || '',
      fetchedAt: info?.fetchedAt || undefined,
      teamsLastMessageTime,
      meta,
    })
  }

  for (const cn of arCases) {
    const info = parseCaseInfo(cn)
    const meta = readCaseMeta(cn)
    const teamsLastMessageTime = readTeamsLastMessageTime(cn)
    summaries.push({
      caseNumber: cn,
      title: info?.title || 'AR Case',
      severity: info?.severity || '',
      status: info?.status || 'AR',
      customer: resolveCustomerName(info?.customer || '', info?.entitlement?.schedule),
      assignedTo: info?.assignedTo || '',
      createdOn: info?.createdOn || '',
      caseAge: info?.caseAge || '',
      fetchedAt: info?.fetchedAt || undefined,
      teamsLastMessageTime,
      meta,
    })
  }

  return c.json({ cases: summaries, total: summaries.length })
})

// GET /api/cases/stats — 聚合统计
cases.get('/stats', (c) => {
  const activeCases = listActiveCases()

  const stats: CaseStats = {
    total: activeCases.length,
    bySeverity: {},
    byStatus: {},
    slaAtRisk: 0,
    needsMyAction: 0,
    awaitingOthers: 0,
  }

  for (const cn of activeCases) {
    const info = parseCaseInfo(cn)
    if (info) {
      stats.bySeverity[info.severity] = (stats.bySeverity[info.severity] || 0) + 1
      stats.byStatus[info.status] = (stats.byStatus[info.status] || 0) + 1
    }

    // Classify cases by meta (actualStatus + SLA risk)
    const meta = readCaseMeta(cn)
    if (meta) {
      const status = meta.actualStatus || ''
      const days = meta.daysSinceLastContact ?? 0
      const irSlaStatus = meta.irSla?.status || ''

      // SLA At Risk: IR SLA not met, OR daysSinceLastContact >= 3 (regardless of status)
      const isSlaAtRisk = irSlaStatus === 'not-met' || days >= 3
      if (isSlaAtRisk) {
        stats.slaAtRisk++
      }

      // Needs My Action: pending-engineer / new / researching
      if (['pending-engineer', 'new', 'researching'].includes(status)) {
        stats.needsMyAction++
      }
      // Awaiting Others: pending-customer / pending-pg / ready-to-close
      else if (['pending-customer', 'pending-pg', 'ready-to-close'].includes(status)) {
        stats.awaitingOthers++
      }
    }
  }

  return c.json(stats)
})

// GET /api/cases/:id — Case 详情
cases.get('/:id', (c) => {
  const caseNumber = validateCaseNumber(c)
  if (!caseNumber) return c.json({ error: 'Invalid case number' }, 400)
  const info = parseCaseInfo(caseNumber)
  if (!info) {
    return c.json({ error: 'Case not found' }, 404)
  }

  // Compute modifiedAt: latest mtime of key files in case directory
  const caseDir = getCaseDir(caseNumber)
  const keyFiles = ['case-info.md', 'emails.md', 'notes.md', 'casework-meta.json']
  let latestMtime = 0
  for (const f of keyFiles) {
    const p = join(caseDir, f)
    if (existsSync(p)) {
      try {
        const mt = statSync(p).mtimeMs
        if (mt > latestMtime) latestMtime = mt
      } catch { /* ignore */ }
    }
  }
  const modifiedAt = latestMtime > 0 ? new Date(latestMtime).toISOString() : ''

  return c.json({ ...info, modifiedAt })
})

// GET /api/cases/:id/emails
cases.get('/:id/emails', (c) => {
  const caseNumber = validateCaseNumber(c)
  if (!caseNumber) return c.json({ error: 'Invalid case number' }, 400)
  const emails = parseEmails(caseNumber)
  return c.json({ emails, total: emails.length })
})

// GET /api/cases/:id/notes
cases.get('/:id/notes', (c) => {
  const caseNumber = validateCaseNumber(c)
  if (!caseNumber) return c.json({ error: 'Invalid case number' }, 400)
  const notes = parseNotes(caseNumber)
  return c.json({ notes, total: notes.length })
})

// POST /api/cases/:id/notes/refresh — fetch latest notes from D365
cases.post('/:id/notes/refresh', async (c) => {
  const caseNumber = validateCaseNumber(c)
  if (!caseNumber) return c.json({ error: 'Invalid case number' }, 400)
  try {
    await execFileAsync('pwsh', ['-NoProfile', '-File', join(config.scriptsDir, 'fetch-notes.ps1'), '-TicketNumber', caseNumber, '-OutputDir', config.activeCasesDir, '-Force'], { timeout: 60000 })
    const notes = parseNotes(caseNumber)
    return c.json({ notes, total: notes.length })
  } catch (e: any) {
    console.error(`[cases/notes/refresh] failed for ${caseNumber}:`, e.message)
    return c.json({ error: 'Failed to refresh notes', detail: e.message }, 500)
  }
})

// GET /api/cases/:id/labor-records
cases.get('/:id/labor-records', (c) => {
  const caseNumber = validateCaseNumber(c)
  if (!caseNumber) return c.json({ error: 'Invalid case number' }, 400)
  const records = parseLaborRecords(caseNumber)
  return c.json({ records, total: records.length })
})

// POST /api/cases/:id/labor-records/refresh — fetch latest labor from D365
cases.post('/:id/labor-records/refresh', async (c) => {
  const caseNumber = validateCaseNumber(c)
  if (!caseNumber) return c.json({ error: 'Invalid case number' }, 400)
  try {
    await execFileAsync('pwsh', ['-NoProfile', '-File', join(config.scriptsDir, 'view-labor.ps1'), '-TicketNumber', caseNumber, '-OutputDir', config.activeCasesDir], { timeout: 60000 })
    const records = parseLaborRecords(caseNumber)
    return c.json({ records, total: records.length })
  } catch (e: any) {
    console.error(`[cases/labor/refresh] failed for ${caseNumber}:`, e.message)
    return c.json({ error: 'Failed to refresh labor records', detail: e.message }, 500)
  }
})

// GET /api/cases/:id/teams
cases.get('/:id/teams', (c) => {
  const caseNumber = validateCaseNumber(c)
  if (!caseNumber) return c.json({ error: 'Invalid case number' }, 400)
  const caseDir = getCaseDir(caseNumber)
  const teamsDir = join(caseDir, 'teams')

  if (!existsSync(teamsDir)) {
    return c.json({ digest: null, chats: [], total: 0 })
  }

  try {
    // Read relevance metadata if available
    const relevancePath = join(teamsDir, '_relevance.json')
    let relevanceData: Record<string, any> | null = null
    if (existsSync(relevancePath)) {
      try {
        relevanceData = JSON.parse(readFileSync(relevancePath, 'utf-8'))
      } catch { /* ignore parse errors */ }
    }

    // Read digest key facts if available (v2: digest is self-contained, _relevance.json optional)
    let digest: { scoredAt: string; keyFacts: string[]; relevantCount: number; irrelevantCount: number } | null = null
    const digestPath = join(teamsDir, 'teams-digest.md')
    if (existsSync(digestPath)) {
      const digestContent = readFileSync(digestPath, 'utf-8')
      // Extract key facts — support v1 flat list, v2 "## Key Facts", and v3 grouped by "### ChatName"
      const factsMatch = digestContent.match(/## (?:关键事实（Key Facts）|Key Facts)\r?\n\r?\n([\s\S]*?)(?=\r?\n## |$)/)
      const keyFacts = factsMatch
        ? factsMatch[1].split(/\r?\n/).filter((l: string) => l.startsWith('- ') || l.startsWith('### ')).map((l: string) => l.startsWith('### ') ? l : l.slice(2))
        : []

      // Extract relevance counts from digest header or _relevance.json
      let relevantCount = 0
      let irrelevantCount = 0
      let scoredAt = ''

      if (relevanceData) {
        // v1 path: use _relevance.json
        const chatsObj = relevanceData.chats || {}
        relevantCount = Object.values(chatsObj).filter((v: any) => v.relevance === 'high').length
        irrelevantCount = Object.values(chatsObj).filter((v: any) => v.relevance === 'low').length
        scoredAt = relevanceData._scoredAt || ''
      } else {
        // v2 path: parse from digest header "> High-relevance chats: 3 / 6"
        const headerMatch = digestContent.match(/High-relevance chats:\s*(\d+)\s*\/\s*(\d+)/)
        if (headerMatch) {
          relevantCount = parseInt(headerMatch[1])
          irrelevantCount = parseInt(headerMatch[2]) - parseInt(headerMatch[1])
        }
        const dateMatch = digestContent.match(/Generated:\s*([\d\-T:+]+)/)
        scoredAt = dateMatch ? dateMatch[1] : ''
      }

      digest = { scoredAt, keyFacts, relevantCount, irrelevantCount }
    }

    // Read chat files (exclude underscore-prefixed metadata files and digest)
    const files = readdirSync(teamsDir)
      .filter((f: string) => f.endsWith('.md') && !f.startsWith('_') && f !== 'teams-digest.md')
    const chats = files.map((f: string) => {
      const chatId = f.replace('.md', '')
      const content = readFileSync(join(teamsDir, f), 'utf-8')
      const chatRelevance = relevanceData?.chats?.[chatId]
      return {
        chatId,
        content,
        relevance: (chatRelevance?.relevance as string) || 'unknown',
        chatType: (chatRelevance?.chatType as string) || undefined,
        reason: chatRelevance?.reason || undefined,
      }
    })

    // Sort: customer-high first, then internal-high, then low, then unknown
    chats.sort((a, b) => {
      const relOrder: Record<string, number> = { high: 0, low: 1, unknown: 2 }
      const relA = relOrder[a.relevance] ?? 2
      const relB = relOrder[b.relevance] ?? 2
      if (relA !== relB) return relA - relB
      // Within high: customer before internal
      if (a.relevance === 'high' && b.relevance === 'high') {
        const typeOrder: Record<string, number> = { customer: 0, internal: 1 }
        return (typeOrder[a.chatType ?? ''] ?? 1) - (typeOrder[b.chatType ?? ''] ?? 1)
      }
      return 0
    })

    return c.json({ digest, chats, total: chats.length })
  } catch {
    return c.json({ digest: null, chats: [], total: 0 })
  }
})

// GET /api/cases/:id/meta
cases.get('/:id/meta', (c) => {
  const caseNumber = validateCaseNumber(c)
  if (!caseNumber) return c.json({ error: 'Invalid case number' }, 400)
  const meta = readCaseMeta(caseNumber)
  if (!meta) {
    return c.json({ error: 'Meta not found' }, 404)
  }
  return c.json(meta)
})

// GET /api/cases/:id/agent-cache — Pre-check if search agents need spawning
cases.get('/:id/agent-cache', (c) => {
  const caseNumber = validateCaseNumber(c)
  if (!caseNumber) return c.json({ error: 'Invalid case number' }, 400)
  const caseDir = getCaseDir(caseNumber)

  try {
    const { execSync } = require('child_process')
    const projectRoot = join(caseDir, '..', '..', '..')
    const script = join(projectRoot, 'skills', 'casework', 'scripts', 'agent-cache-check.sh')
    const result = execSync(`bash "${script}" "${caseDir}" 8 "${projectRoot}"`, { encoding: 'utf-8', timeout: 5000 }).trim()
    return c.json(JSON.parse(result))
  } catch (e: any) {
    return c.json({ teams: { spawn: true, reason: 'CHECK_FAILED' }, onenote: { spawn: true, reason: 'CHECK_FAILED' } })
  }
})

// GET /api/cases/:id/analysis
cases.get('/:id/analysis', (c) => {
  const caseNumber = validateCaseNumber(c)
  if (!caseNumber) return c.json({ error: 'Invalid case number' }, 400)
  const caseDir = getCaseDir(caseNumber)
  const analysisDir = join(caseDir, 'analysis')

  // Scan analysis/ directory for all text-readable files (.md, .txt, .log, .json)
  // Also scan nested subdirectories (1 level deep)
  const READABLE_EXTS = ['.md', '.txt', '.log', '.json', '.html']

  if (existsSync(analysisDir)) {
    try {
      const allFiles: Array<{ name: string; path: string; mtime: number }> = []

      // Scan top-level files
      const entries = readdirSync(analysisDir, { withFileTypes: true })
      for (const entry of entries) {
        const entryPath = join(analysisDir, entry.name)
        if (entry.isFile() && READABLE_EXTS.some(ext => entry.name.endsWith(ext))) {
          allFiles.push({ name: entry.name, path: entryPath, mtime: statSync(entryPath).mtimeMs })
        }
        // Scan one level of subdirectories
        if (entry.isDirectory()) {
          try {
            const subEntries = readdirSync(entryPath)
            for (const sub of subEntries) {
              const subPath = join(entryPath, sub)
              if (READABLE_EXTS.some(ext => sub.endsWith(ext)) && statSync(subPath).isFile()) {
                allFiles.push({ name: `${entry.name}/${sub}`, path: subPath, mtime: statSync(subPath).mtimeMs })
              }
            }
          } catch {
            // skip unreadable subdirs
          }
        }
      }

      allFiles.sort((a, b) => b.mtime - a.mtime)

      if (allFiles.length > 0) {
        // Return individual files with metadata for frontend to render with collapse
        const files = allFiles.map(f => ({
          filename: f.name,
          content: readFileSync(f.path, 'utf-8'),
          updatedAt: new Date(f.mtime).toISOString(),
          size: statSync(f.path).size,
        }))
        // Also provide concatenated content for backward compatibility
        const content = files.map(f => f.content).join('\n\n---\n\n')
        return c.json({ content, exists: true, fileCount: allFiles.length, files })
      }
    } catch {
      // fall through
    }
  }

  // Fallback: try analysis.md in case root
  const fallbackPath = join(caseDir, 'analysis.md')
  if (existsSync(fallbackPath)) {
    const content = readFileSync(fallbackPath, 'utf-8')
    return c.json({ content, exists: true, fileCount: 1 })
  }

  return c.json({ content: '', exists: false, fileCount: 0 })
})

// GET /api/cases/:id/drafts
cases.get('/:id/drafts', (c) => {
  const caseNumber = validateCaseNumber(c)
  if (!caseNumber) return c.json({ error: 'Invalid case number' }, 400)
  const drafts = readCaseDrafts(caseNumber)
  return c.json({ drafts, total: drafts.length })
})

// GET /api/cases/:id/inspection — case-summary 或 legacy inspection 报告
cases.get('/:id/inspection', (c) => {
  const caseNumber = validateCaseNumber(c)
  if (!caseNumber) return c.json({ error: 'Invalid case number' }, 400)
  const caseDir = getCaseDir(caseNumber)

  // Priority 1: case-summary.md (new format — check both context/ and root)
  const summaryPaths = [
    join(caseDir, 'context', 'case-summary.md'),
    join(caseDir, 'case-summary.md'),
  ]
  for (const summaryPath of summaryPaths) {
    if (existsSync(summaryPath)) {
      try {
        const content = readFileSync(summaryPath, 'utf-8')
        const mtime = statSync(summaryPath).mtimeMs
        return c.json({
          content,
          filename: 'case-summary.md',
          exists: true,
          legacy: false,
          updatedAt: new Date(mtime).toISOString(),
          allFiles: ['case-summary.md'],
        })
      } catch {
        // fall through to next path or legacy
      }
    }
  }

  // Priority 2: legacy inspection-*.md files (fallback)
  try {
    const files = readdirSync(caseDir)
      .filter((f: string) => f.startsWith('inspection-') && f.endsWith('.md'))
      .map((f: string) => ({
        name: f,
        path: join(caseDir, f),
        mtime: statSync(join(caseDir, f)).mtimeMs,
      }))
      .sort((a, b) => b.mtime - a.mtime)

    if (files.length > 0) {
      const latest = files[0]
      const content = readFileSync(latest.path, 'utf-8')
      return c.json({
        content,
        filename: latest.name,
        exists: true,
        legacy: true,
        updatedAt: new Date(latest.mtime).toISOString(),
        allFiles: files.map(f => f.name),
      })
    }
  } catch {
    // fall through
  }

  return c.json({ content: '', filename: '', exists: false, legacy: false, allFiles: [] })
})

// GET /api/cases/:id/todo — per-case todo 文件列表 + 最新内容
// ?filename=xxx — 返回指定文件的内容（而非最新）
cases.get('/:id/todo', (c) => {
  const caseNumber = validateCaseNumber(c)
  if (!caseNumber) return c.json({ error: 'Invalid case number' }, 400)
  const requestedFile = c.req.query('filename')
  const caseDir = getCaseDir(caseNumber)
  const todoDir = join(caseDir, 'todo')

  if (!existsSync(todoDir)) {
    return c.json({ files: [], latest: null, total: 0 })
  }

  try {
    const files = readdirSync(todoDir)
      .filter((f: string) => f.endsWith('.md'))
      .map((f: string) => ({
        filename: f,
        path: join(todoDir, f),
        mtime: statSync(join(todoDir, f)).mtimeMs,
      }))
      .sort((a, b) => b.mtime - a.mtime)

    // If a specific filename is requested, return its content
    if (requestedFile) {
      const target = files.find(f => f.filename === requestedFile)
      if (!target) {
        return c.json({ error: 'File not found' }, 404)
      }
      return c.json({
        file: {
          filename: target.filename,
          content: readFileSync(target.path, 'utf-8'),
          updatedAt: new Date(target.mtime).toISOString(),
        },
      })
    }

    const latest = files.length > 0
      ? {
          filename: files[0].filename,
          content: readFileSync(files[0].path, 'utf-8'),
          updatedAt: new Date(files[0].mtime).toISOString(),
        }
      : null

    // Only return the 3 most recent todo files
    const recentFiles = files.slice(0, 3)

    return c.json({
      files: recentFiles.map(f => ({
        filename: f.filename,
        updatedAt: new Date(f.mtime).toISOString(),
      })),
      latest,
      total: files.length,
    })
  } catch {
    return c.json({ files: [], latest: null, total: 0 })
  }
})

// PATCH /api/cases/:id/todo/toggle — per-case todo checkbox toggle
cases.patch('/:id/todo/toggle', async (c) => {
  const caseNumber = validateCaseNumber(c)
  if (!caseNumber) return c.json({ error: 'Invalid case number' }, 400)
  const { lineNumber, checked, filename } = await c.req.json<{
    lineNumber: number
    checked: boolean
    filename?: string
  }>()

  if (typeof lineNumber !== 'number' || isNaN(lineNumber)) {
    return c.json({ error: 'Invalid lineNumber' }, 400)
  }

  const success = toggleCaseTodoItem(caseNumber, lineNumber, checked, filename)
  if (!success) {
    return c.json({ error: 'Failed to toggle item' }, 400)
  }

  return c.json({ success: true })
})

// GET /api/cases/:id/timing — timing.json or v2 events fallback
cases.get('/:id/timing', (c) => {
  const caseNumber = validateCaseNumber(c)
  if (!caseNumber) return c.json({ error: 'Invalid case number' }, 400)
  const caseDir = getCaseDir(caseNumber)

  // v1 path: timing.json
  const timingPath = join(caseDir, 'timing.json')
  if (existsSync(timingPath)) {
    try {
      const raw = readFileSync(timingPath, 'utf-8')
      const timing = JSON.parse(raw)
      return c.json({ exists: true, timing })
    } catch {
      // fall through to v2
    }
  }

  // v2 path: build timing from .casework/events/*.json
  const eventsDir = join(caseDir, '.casework', 'events')
  if (!existsSync(eventsDir)) {
    return c.json({ exists: false, timing: null })
  }

  try {
    const eventFiles = readdirSync(eventsDir).filter(f => f.endsWith('.json'))
    const phases: Record<string, any> = {}
    let totalMs = 0

    for (const ef of eventFiles) {
      try {
        const evt = JSON.parse(readFileSync(join(eventsDir, ef), 'utf-8'))
        const name = ef.replace('.json', '')
        const durMs = evt.durationMs || 0
        phases[name] = {
          durationMs: durMs,
          durationSec: +(durMs / 1000).toFixed(1),
          status: evt.status || 'unknown',
          startedAt: evt.startedAt,
          completedAt: evt.completedAt,
        }
        if (name !== 'data-refresh') totalMs += durMs  // data-refresh is the wrapper, don't double-count
      } catch { /* skip bad files */ }
    }

    // ISS-227: Compute totalSec as wall-clock time from earliest start to latest end
    // across events + pipeline-state. Never mix timestamps from different patrol runs.
    const drEvent = phases['data-refresh']
    const drStart = drEvent?.startedAt ? new Date(drEvent.startedAt).getTime() : 0
    let latestEnd = 0
    for (const p of Object.values(phases) as any[]) {
      if (p.completedAt) {
        const t = new Date(p.completedAt).getTime()
        if (t > latestEnd) latestEnd = t
      }
    }

    // Include pipeline-state (summarize) in wall-clock calculation
    const pipelinePath = join(caseDir, '.casework', 'pipeline-state.json')
    try {
      const pipeline = JSON.parse(readFileSync(pipelinePath, 'utf-8'))
      const sumStep = pipeline.steps?.summarize
      if (sumStep?.startedAt && sumStep?.completedAt) {
        const sumStart = new Date(sumStep.startedAt).getTime()
        const sumEnd = new Date(sumStep.completedAt).getTime()
        const sumMs = Math.max(0, sumEnd - sumStart)
        phases['summarize'] = {
          durationMs: sumMs,
          durationSec: +(sumMs / 1000).toFixed(1),
          status: sumStep.status || 'completed',
          startedAt: sumStep.startedAt,
          completedAt: sumStep.completedAt,
        }
        if (sumEnd > latestEnd) latestEnd = sumEnd
      }
    } catch { /* no pipeline state */ }

    // Include assess from meta ONLY if it's within the same run window (within 10 min of data-refresh)
    const metaPath = join(caseDir, 'casework-meta.json')
    try {
      const meta = JSON.parse(readFileSync(metaPath, 'utf-8'))
      if (meta.lastAssessedAt && drEvent?.completedAt) {
        const assessEnd = new Date(meta.lastAssessedAt).getTime()
        const drEnd = new Date(drEvent.completedAt).getTime()
        // Only use if assess happened AFTER data-refresh and within 10 minutes (same run)
        if (assessEnd > drEnd && (assessEnd - drEnd) < 600_000) {
          const assessMs = assessEnd - drEnd
          phases['assess'] = {
            durationMs: assessMs,
            durationSec: +(assessMs / 1000).toFixed(1),
            status: 'completed',
            startedAt: drEvent.completedAt,
            completedAt: meta.lastAssessedAt,
          }
          if (assessEnd > latestEnd) latestEnd = assessEnd
        }
      }
    } catch { /* no meta */ }

    // totalSec = wall-clock from data-refresh start to latest end
    let totalSec = 0
    if (drStart > 0 && latestEnd > drStart) {
      totalSec = +((latestEnd - drStart) / 1000).toFixed(1)
    } else {
      // Fallback: sum of sub-event durations (without data-refresh wrapper to avoid double count)
      totalSec = +(totalMs / 1000).toFixed(1)
    }
    // Also try data-refresh-output.json elapsed field
    const drOutputPath = join(caseDir, '.casework', 'data-refresh-output.json')
    if (totalSec === 0 && existsSync(drOutputPath)) {
      try {
        const drOut = JSON.parse(readFileSync(drOutputPath, 'utf-8'))
        if (drOut.elapsed) totalSec = parseFloat(drOut.elapsed)
        else if (drOut.elapsedSeconds) totalSec = parseFloat(drOut.elapsedSeconds)
      } catch { /* use calculated */ }
    }

    totalSec = +totalSec.toFixed(1)

    const timing = {
      totalSeconds: totalSec,
      phases,
      source: 'v2-events',
    }
    return c.json({ exists: true, timing })
  } catch {
    return c.json({ exists: false, timing: null })
  }
})

// GET /api/cases/:id/logs — .casework/logs 目录下所有日志文件（兼容旧 logs/）
cases.get('/:id/logs', (c) => {
  const caseNumber = validateCaseNumber(c)
  if (!caseNumber) return c.json({ error: 'Invalid case number' }, 400)
  const caseDir = getCaseDir(caseNumber)
  // New path: .casework/logs, fallback to legacy logs/
  const newLogsDir = join(caseDir, '.casework', 'logs')
  const legacyLogsDir = join(caseDir, 'logs')

  // Collect files from both directories (new path takes priority)
  const allFiles: Array<{ filename: string; content: string; size: number; updatedAt: string }> = []
  const seen = new Set<string>()

  for (const logsDir of [newLogsDir, legacyLogsDir]) {
    if (!existsSync(logsDir)) continue
    try {
      const files = readdirSync(logsDir)
        .filter((f: string) => f.endsWith('.log') || f.endsWith('.md') || f.endsWith('.txt'))
      for (const f of files) {
        if (seen.has(f)) continue // skip duplicates (new path wins)
        seen.add(f)
        const filePath = join(logsDir, f)
        const stat = statSync(filePath)
        const content = readFileSync(filePath, 'utf-8')
        allFiles.push({
          filename: f,
          content,
          size: stat.size,
          updatedAt: new Date(stat.mtimeMs).toISOString(),
        })
      }
    } catch { /* skip unreadable dirs */ }
  }

  allFiles.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  return c.json({ logs: allFiles, total: allFiles.length })
})

// GET /api/cases/:id/attachments — 附件元数据 + 文件列表
cases.get('/:id/attachments', (c) => {
  const caseNumber = validateCaseNumber(c)
  if (!caseNumber) return c.json({ error: 'Invalid case number' }, 400)
  const caseDir = getCaseDir(caseNumber)
  const attachmentsDir = join(caseDir, 'attachments')
  const metaPath = join(caseDir, 'attachments-meta.json')

  let meta = null
  if (existsSync(metaPath)) {
    try {
      meta = JSON.parse(readFileSync(metaPath, 'utf-8'))
    } catch { /* ignore */ }
  }

  let files: Array<{ filename: string; size: number; updatedAt: string }> = []
  if (existsSync(attachmentsDir)) {
    try {
      files = readdirSync(attachmentsDir)
        .filter((f: string) => !f.startsWith('.'))
        .map((f: string) => {
          const filePath = join(attachmentsDir, f)
          const stat = statSync(filePath)
          return {
            filename: f,
            size: stat.size,
            updatedAt: new Date(stat.mtimeMs).toISOString(),
          }
        })
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    } catch { /* ignore */ }
  }

  return c.json({ meta, files, total: files.length })
})

// GET /api/cases/:id/attachments/:filename — 下载附件文件
cases.get('/:id/attachments/:filename', (c) => {
  const caseNumber = validateCaseNumber(c)
  if (!caseNumber) return c.json({ error: 'Invalid case number' }, 400)
  const filename = c.req.param('filename')

  // Path traversal protection — reject filenames containing path separators or '..'
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return c.json({ error: 'Invalid filename' }, 400)
  }

  const caseDir = getCaseDir(caseNumber)
  const filePath = join(caseDir, 'attachments', filename)

  if (!existsSync(filePath)) {
    return c.json({ error: 'File not found' }, 404)
  }

  const mimeTypes: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.bmp': 'image/bmp',
    '.svg': 'image/svg+xml',
    '.txt': 'text/plain',
    '.log': 'text/plain',
    '.md': 'text/markdown',
    '.json': 'application/json',
    '.xml': 'application/xml',
    '.html': 'text/html',
    '.htm': 'text/html',
    '.csv': 'text/csv',
    '.zip': 'application/zip',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.msg': 'application/vnd.ms-outlook',
    '.eml': 'message/rfc822',
    '.pcap': 'application/vnd.tcpdump.pcap',
    '.pcapng': 'application/vnd.tcpdump.pcap',
    '.har': 'application/json',
    '.evtx': 'application/octet-stream',
  }

  // Previewable types use inline, others use attachment for download
  const previewableExts = new Set([
    '.pdf', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.bmp',
    '.txt', '.log', '.md', '.json', '.xml', '.html', '.htm', '.csv',
  ])

  const ext = extname(filename).toLowerCase()
  const contentType = mimeTypes[ext] || 'application/octet-stream'
  const disposition = previewableExts.has(ext) ? 'inline' : 'attachment'
  const content = readFileSync(filePath)

  return new Response(content, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `${disposition}; filename="${encodeURIComponent(filename)}"`,
      'Content-Length': content.length.toString(),
    },
  })
})

// GET /api/cases/:id/images/:filename — serve email inline images
cases.get('/:id/images/:filename', (c) => {
  const caseNumber = validateCaseNumber(c)
  if (!caseNumber) return c.json({ error: 'Invalid case number' }, 400)
  const filename = c.req.param('filename')

  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return c.json({ error: 'Invalid filename' }, 400)
  }

  const caseDir = getCaseDir(caseNumber)
  const filePath = join(caseDir, 'images', filename)

  if (!existsSync(filePath)) {
    return c.json({ error: 'Image not found' }, 404)
  }

  const ext = extname(filename).toLowerCase()
  const mimeTypes: Record<string, string> = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.bmp': 'image/bmp',
    '.svg': 'image/svg+xml',
  }
  const contentType = mimeTypes[ext] || 'application/octet-stream'
  const content = readFileSync(filePath)

  return new Response(content, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `inline; filename="${encodeURIComponent(filename)}"`,
      'Content-Length': content.length.toString(),
      'Cache-Control': 'public, max-age=86400',
    },
  })
})

// GET /api/cases/:id/claims — claims.json for evidence chain audit
cases.get('/:id/claims', (c) => {
  const caseNumber = validateCaseNumber(c)
  if (!caseNumber) return c.json({ error: 'Invalid case number' }, 400)
  const caseDir = getCaseDir(caseNumber)
  const claimsPath = join(caseDir, 'claims.json')

  if (!existsSync(claimsPath)) {
    return c.json({ claims: null })
  }

  try {
    const raw = readFileSync(claimsPath, 'utf-8')
    const claims = JSON.parse(raw)
    return c.json(claims)
  } catch {
    return c.json({ claims: null })
  }
})

// GET /api/cases/:id/challenge-report — challenge report markdown
cases.get('/:id/challenge-report', (c) => {
  const caseNumber = validateCaseNumber(c)
  if (!caseNumber) return c.json({ error: 'Invalid case number' }, 400)
  const caseDir = getCaseDir(caseNumber)
  const reportPath = join(caseDir, 'challenge-report.md')

  if (!existsSync(reportPath)) {
    return c.json({ content: null })
  }

  try {
    const content = readFileSync(reportPath, 'utf-8')
    return c.json({ content })
  } catch {
    return c.json({ content: null })
  }
})

// GET /api/cases/:id/onenote — OneNote digest from case onenote/ directory
cases.get('/:id/onenote', (c) => {
  const caseNumber = validateCaseNumber(c)
  if (!caseNumber) return c.json({ error: 'Invalid case number' }, 400)
  const caseDir = getCaseDir(caseNumber)
  const onenoteDir = join(caseDir, 'onenote')

  if (!existsSync(onenoteDir)) {
    return c.json({ digest: null, total: 0 })
  }

  try {
    // v2: return only the digest file, not raw _page-*.md files
    const digestPath = join(onenoteDir, 'onenote-digest.md')
    if (existsSync(digestPath)) {
      const stat = statSync(digestPath)
      const content = readFileSync(digestPath, 'utf-8')

      // ISS-224: Also return individual page files for per-page rendering
      const pageFiles = readdirSync(onenoteDir)
        .filter(f => f.startsWith('_page-') && f.endsWith('.md'))
        .sort()
        .map(f => {
          const pPath = join(onenoteDir, f)
          const pStat = statSync(pPath)
          const pContent = readFileSync(pPath, 'utf-8')
          // Count image references in page
          const imgMatches = pContent.match(/!\[[^\]]*\]\(\.\/(assets\/[^)]+)\)/g)
          return {
            filename: f,
            content: pContent,
            size: pStat.size,
            updatedAt: pStat.mtime.toISOString(),
            imageCount: imgMatches ? imgMatches.length : 0,
          }
        })

      // ISS-228: Parse _page-relevance.json for structured scoring data
      const relevancePath = join(onenoteDir, '_page-relevance.json')
      let scoring: {
        scoredAt: string;
        format: string;
        keyInfo: string[];
        analyses: string[];
        actionItems: string[];
        lowRelevance: string[];
        highCount: number;
        lowCount: number;
        pages: Record<string, { relevance: string; reason: string }>
      } | null = null
      if (existsSync(relevancePath)) {
        try {
          const relData = JSON.parse(readFileSync(relevancePath, 'utf-8'))
          const pages = relData.pages || {}
          const highCount = Object.values(pages).filter((p: any) => p.relevance === 'high').length
          const lowCount = Object.values(pages).filter((p: any) => p.relevance !== 'high').length
          const format = relData._format || 'v1'

          // Parse four-section digest from markdown content
          const keyInfo: string[] = []
          const analyses: string[] = []
          const actionItems: string[] = []
          const lowRelevance: string[] = []

          let currentSection = ''
          for (const line of content.split('\n')) {
            // Detect section headers (v2 four-section format)
            if (line.startsWith('## 1.') || line.startsWith('## 1、')) { currentSection = 'keyInfo'; continue }
            if (line.startsWith('## 2.') || line.startsWith('## 2、')) { currentSection = 'analyses'; continue }
            if (line.startsWith('## 3.') || line.startsWith('## 3、')) { currentSection = 'actionItems'; continue }
            if (line.startsWith('## 4.') || line.startsWith('## 4、')) { currentSection = 'lowRelevance'; continue }
            // Legacy v1 format fallback
            if (line.startsWith('## Key Facts')) { currentSection = 'keyInfo'; continue }
            if (line.startsWith('## Summary')) { currentSection = ''; continue }
            if (line.startsWith('## Low-Relevance')) { currentSection = 'lowRelevance'; continue }
            // Another ## resets section
            if (line.startsWith('## ') && !line.startsWith('## ')) { currentSection = ''; continue }

            const trimmed = line.trim()
            if (!trimmed || trimmed.startsWith('>')) continue

            // Collect items based on section
            if (currentSection === 'keyInfo') {
              // Accept: "- fact", "- [fact]", "**事实信息**:", "**问题描述**: ...", "### page-name", bold labels
              if (trimmed.startsWith('- ') || trimmed.startsWith('### ') || trimmed.startsWith('**')) {
                keyInfo.push(trimmed)
              }
            } else if (currentSection === 'analyses') {
              if (trimmed.startsWith('- ')) {
                analyses.push(trimmed.slice(2)) // strip "- " prefix
              }
            } else if (currentSection === 'actionItems') {
              if (trimmed.startsWith('- ')) {
                actionItems.push(trimmed.slice(2))
              }
            } else if (currentSection === 'lowRelevance') {
              if (trimmed.startsWith('- ')) {
                lowRelevance.push(trimmed.slice(2))
              }
            }
          }

          scoring = {
            scoredAt: relData._scoredAt || '',
            format,
            keyInfo,
            analyses,
            actionItems,
            lowRelevance,
            highCount,
            lowCount,
            pages,
          }
        } catch { /* ignore parse errors */ }
      }

      return c.json({
        digest: { content, updatedAt: stat.mtime.toISOString(), size: stat.size },
        scoring,
        // Keep backward-compat: files array with single digest entry for old frontend
        files: [{ filename: 'onenote-digest.md', content, size: stat.size, updatedAt: stat.mtime.toISOString() }],
        pages: pageFiles,
        total: 1,
      })
    }

    // Fallback: legacy personal-notes.md
    const legacyPath = join(onenoteDir, 'personal-notes.md')
    if (existsSync(legacyPath)) {
      const stat = statSync(legacyPath)
      const content = readFileSync(legacyPath, 'utf-8')
      return c.json({
        digest: { content, updatedAt: stat.mtime.toISOString(), size: stat.size },
        files: [{ filename: 'personal-notes.md', content, size: stat.size, updatedAt: stat.mtime.toISOString() }],
        total: 1,
      })
    }

    return c.json({ digest: null, files: [], total: 0 })
  } catch {
    return c.json({ digest: null, files: [], total: 0 })
  }
})

// ISS-226: GET /api/cases/:id/teams/assets/:filename — Serve Teams image files
cases.get('/:id/teams/assets/:filename', (c) => {
  const caseNumber = validateCaseNumber(c)
  if (!caseNumber) return c.json({ error: 'Invalid case number' }, 400)

  const filename = c.req.param('filename')
  if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return c.json({ error: 'Invalid filename' }, 400)
  }

  const caseDir = getCaseDir(caseNumber)
  const assetPath = join(caseDir, 'teams', 'assets', filename)

  if (!existsSync(assetPath)) {
    return c.json({ error: 'Asset not found' }, 404)
  }

  try {
    const data = readFileSync(assetPath)
    const ext = extname(filename).toLowerCase()
    const mimeMap: Record<string, string> = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
    }
    const contentType = mimeMap[ext] || 'application/octet-stream'

    return new Response(data, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch {
    return c.json({ error: 'Cannot read asset' }, 500)
  }
})

// ISS-224: GET /api/cases/:id/onenote/assets/:filename — Serve image files from onenote/assets/
cases.get('/:id/onenote/assets/:filename', (c) => {
  const caseNumber = validateCaseNumber(c)
  if (!caseNumber) return c.json({ error: 'Invalid case number' }, 400)

  const filename = c.req.param('filename')

  // Security: reject path traversal attempts
  if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return c.json({ error: 'Invalid filename' }, 400)
  }

  const caseDir = getCaseDir(caseNumber)
  const assetPath = join(caseDir, 'onenote', 'assets', filename)

  if (!existsSync(assetPath)) {
    return c.json({ error: 'Asset not found' }, 404)
  }

  try {
    const data = readFileSync(assetPath)
    const ext = extname(filename).toLowerCase()
    const mimeMap: Record<string, string> = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
    }
    const contentType = mimeMap[ext] || 'application/octet-stream'

    return new Response(data, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch {
    return c.json({ error: 'Cannot read asset' }, 500)
  }
})

export default cases

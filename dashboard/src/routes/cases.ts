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
import { readCaseMeta, readPatrolState } from '../services/meta-reader.js'
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
  const keyFiles = ['case-info.md', 'emails.md', 'notes.md', 'casehealth-meta.json']
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

    // Read digest key facts if available
    let digest: { scoredAt: string; keyFacts: string[]; relevantCount: number; irrelevantCount: number } | null = null
    const digestPath = join(teamsDir, 'teams-digest.md')
    if (existsSync(digestPath) && relevanceData) {
      const digestContent = readFileSync(digestPath, 'utf-8')
      // Extract key facts from "## 关键事实（Key Facts）" section
      const factsMatch = digestContent.match(/## 关键事实（Key Facts）\r?\n\r?\n([\s\S]*?)(?=\r?\n## |$)/)
      const keyFacts = factsMatch
        ? factsMatch[1].split(/\r?\n/).filter((l: string) => l.startsWith('- ')).map((l: string) => l.slice(2))
        : []

      const chatsObj = relevanceData.chats || {}
      const relevantCount = Object.values(chatsObj).filter((v: any) => v.relevance === 'high').length
      const irrelevantCount = Object.values(chatsObj).filter((v: any) => v.relevance === 'low').length

      digest = {
        scoredAt: relevanceData._scoredAt || '',
        keyFacts,
        relevantCount,
        irrelevantCount,
      }
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
    const script = join(projectRoot, 'skills', 'd365-case-ops', 'scripts', 'agent-cache-check.sh')
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
        const content = allFiles
          .map(f => readFileSync(f.path, 'utf-8'))
          .join('\n\n---\n\n')
        return c.json({ content, exists: true, fileCount: allFiles.length })
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

    return c.json({
      files: files.map(f => ({
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

// GET /api/cases/:id/timing — timing.json
cases.get('/:id/timing', (c) => {
  const caseNumber = validateCaseNumber(c)
  if (!caseNumber) return c.json({ error: 'Invalid case number' }, 400)
  const caseDir = getCaseDir(caseNumber)
  const timingPath = join(caseDir, 'timing.json')

  if (!existsSync(timingPath)) {
    return c.json({ exists: false, timing: null })
  }

  try {
    const raw = readFileSync(timingPath, 'utf-8')
    const timing = JSON.parse(raw)
    return c.json({ exists: true, timing })
  } catch {
    return c.json({ exists: false, timing: null })
  }
})

// GET /api/cases/:id/logs — logs 目录下所有日志文件
cases.get('/:id/logs', (c) => {
  const caseNumber = validateCaseNumber(c)
  if (!caseNumber) return c.json({ error: 'Invalid case number' }, 400)
  const caseDir = getCaseDir(caseNumber)
  const logsDir = join(caseDir, 'logs')

  if (!existsSync(logsDir)) {
    return c.json({ logs: [], total: 0 })
  }

  try {
    const files = readdirSync(logsDir)
      .filter((f: string) => f.endsWith('.log') || f.endsWith('.md') || f.endsWith('.txt'))
      .map((f: string) => {
        const filePath = join(logsDir, f)
        const stat = statSync(filePath)
        const content = readFileSync(filePath, 'utf-8')
        return {
          filename: f,
          content,
          size: stat.size,
          updatedAt: new Date(stat.mtimeMs).toISOString(),
        }
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

    return c.json({ logs: files, total: files.length })
  } catch {
    return c.json({ logs: [], total: 0 })
  }
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

// GET /api/cases/:id/onenote — OneNote markdown files from case onenote/ directory
cases.get('/:id/onenote', (c) => {
  const caseNumber = validateCaseNumber(c)
  if (!caseNumber) return c.json({ error: 'Invalid case number' }, 400)
  const caseDir = getCaseDir(caseNumber)
  const onenoteDir = join(caseDir, 'onenote')

  if (!existsSync(onenoteDir)) {
    return c.json({ files: [], total: 0 })
  }

  try {
    const files = readdirSync(onenoteDir)
      .filter(f => f.endsWith('.md'))
      .map(f => {
        const filePath = join(onenoteDir, f)
        const stat = statSync(filePath)
        const content = readFileSync(filePath, 'utf-8')
        return {
          filename: f,
          content,
          size: stat.size,
          updatedAt: stat.mtime.toISOString(),
        }
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    return c.json({ files, total: files.length })
  } catch {
    return c.json({ files: [], total: 0 })
  }
})

export default cases

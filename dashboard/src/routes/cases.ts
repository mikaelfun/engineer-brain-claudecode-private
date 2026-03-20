/**
 * cases.ts — Case 数据读取路由
 */
import { Hono } from 'hono'
import { listActiveCases, listArCases } from '../services/workspace.js'
import { parseCaseInfo } from '../services/case-reader.js'
import { parseEmails } from '../services/email-reader.js'
import { parseNotes } from '../services/note-reader.js'
import { readCaseMeta, readPatrolState } from '../services/meta-reader.js'
import { readCaseDrafts } from '../services/draft-reader.js'
import { toggleCaseTodoItem } from '../services/todo-writer.js'
import { readFileSync, existsSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'
import { getCaseDir, isValidCaseNumber } from '../services/workspace.js'
import type { CaseSummary, CaseStats } from '../types/index.js'

const cases = new Hono()

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
    summaries.push({
      caseNumber: cn,
      title: info?.title || '',
      severity: info?.severity || '',
      status: info?.status || '',
      customer: info?.customer || '',
      assignedTo: info?.assignedTo || '',
      createdOn: info?.createdOn || '',
      caseAge: info?.caseAge || '',
      meta,
    })
  }

  for (const cn of arCases) {
    const info = parseCaseInfo(cn)
    const meta = readCaseMeta(cn)
    summaries.push({
      caseNumber: cn,
      title: info?.title || 'AR Case',
      severity: info?.severity || '',
      status: info?.status || 'AR',
      customer: info?.customer || '',
      assignedTo: info?.assignedTo || '',
      createdOn: info?.createdOn || '',
      caseAge: info?.caseAge || '',
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
    urgentItems: 0,
    pendingItems: 0,
    normalItems: 0,
  }

  for (const cn of activeCases) {
    const info = parseCaseInfo(cn)
    if (info) {
      stats.bySeverity[info.severity] = (stats.bySeverity[info.severity] || 0) + 1
      stats.byStatus[info.status] = (stats.byStatus[info.status] || 0) + 1
    }

    // Aggregate from per-case todo files
    const caseDir = getCaseDir(cn)
    const todoDir = join(caseDir, 'todo')
    if (existsSync(todoDir)) {
      try {
        const todoFiles = readdirSync(todoDir)
          .filter((f: string) => f.endsWith('.md'))
          .map((f: string) => ({ name: f, mtime: statSync(join(todoDir, f)).mtimeMs }))
          .sort((a, b) => b.mtime - a.mtime)

        if (todoFiles.length > 0) {
          const content = readFileSync(join(todoDir, todoFiles[0].name), 'utf-8')
          // Count 🔴 🟡 ✅ items from the todo content
          const redCount = (content.match(/🔴/g) || []).length
          const yellowCount = (content.match(/🟡/g) || []).length
          const greenCount = (content.match(/✅/g) || []).length
          stats.urgentItems += redCount
          stats.pendingItems += yellowCount
          stats.normalItems += greenCount
        }
      } catch { /* ignore */ }
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

// GET /api/cases/:id/teams
cases.get('/:id/teams', (c) => {
  const caseNumber = validateCaseNumber(c)
  if (!caseNumber) return c.json({ error: 'Invalid case number' }, 400)
  const caseDir = getCaseDir(caseNumber)
  const teamsDir = join(caseDir, 'teams')

  if (!existsSync(teamsDir)) {
    return c.json({ chats: [], total: 0 })
  }

  try {
    const files = readdirSync(teamsDir).filter((f: string) => f.endsWith('.md'))
    const chats = files.map((f: string) => {
      const content = readFileSync(join(teamsDir, f), 'utf-8')
      return {
        chatId: f.replace('.md', ''),
        content,
      }
    })
    return c.json({ chats, total: chats.length })
  } catch {
    return c.json({ chats: [], total: 0 })
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

// GET /api/cases/:id/inspection — 最新 inspection 报告
cases.get('/:id/inspection', (c) => {
  const caseNumber = validateCaseNumber(c)
  if (!caseNumber) return c.json({ error: 'Invalid case number' }, 400)
  const caseDir = getCaseDir(caseNumber)

  // Find inspection-*.md files, sorted by mtime descending
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
        updatedAt: new Date(latest.mtime).toISOString(),
        allFiles: files.map(f => f.name),
      })
    }
  } catch {
    // fall through
  }

  return c.json({ content: '', filename: '', exists: false, allFiles: [] })
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

export default cases

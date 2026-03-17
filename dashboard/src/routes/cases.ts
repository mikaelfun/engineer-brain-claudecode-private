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
import { getLatestTodoFile } from '../services/todo-reader.js'
import { readFileSync, existsSync, readdirSync } from 'fs'
import { join } from 'path'
import { getCaseDir } from '../services/workspace.js'
import type { CaseSummary, CaseStats } from '../types/index.js'

const cases = new Hono()

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
  const todoFile = getLatestTodoFile()

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
  }

  // Count from todo
  if (todoFile?.summary) {
    stats.urgentItems = todoFile.summary.urgent.length
    stats.pendingItems = todoFile.summary.pending.length
    stats.normalItems = todoFile.summary.normal.length
  }

  return c.json(stats)
})

// GET /api/cases/:id — Case 详情
cases.get('/:id', (c) => {
  const caseNumber = c.req.param('id')
  const info = parseCaseInfo(caseNumber)
  if (!info) {
    return c.json({ error: 'Case not found' }, 404)
  }
  return c.json(info)
})

// GET /api/cases/:id/emails
cases.get('/:id/emails', (c) => {
  const caseNumber = c.req.param('id')
  const emails = parseEmails(caseNumber)
  return c.json({ emails, total: emails.length })
})

// GET /api/cases/:id/notes
cases.get('/:id/notes', (c) => {
  const caseNumber = c.req.param('id')
  const notes = parseNotes(caseNumber)
  return c.json({ notes, total: notes.length })
})

// GET /api/cases/:id/teams
cases.get('/:id/teams', (c) => {
  const caseNumber = c.req.param('id')
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
  const caseNumber = c.req.param('id')
  const meta = readCaseMeta(caseNumber)
  if (!meta) {
    return c.json({ error: 'Meta not found' }, 404)
  }
  return c.json(meta)
})

// GET /api/cases/:id/analysis
cases.get('/:id/analysis', (c) => {
  const caseNumber = c.req.param('id')
  const caseDir = getCaseDir(caseNumber)

  // Try analysis/report.md
  const paths = [
    join(caseDir, 'analysis', 'report.md'),
    join(caseDir, 'analysis.md'),
  ]

  for (const p of paths) {
    if (existsSync(p)) {
      const content = readFileSync(p, 'utf-8')
      return c.json({ content, exists: true })
    }
  }

  return c.json({ content: '', exists: false })
})

// GET /api/cases/:id/drafts
cases.get('/:id/drafts', (c) => {
  const caseNumber = c.req.param('id')
  const drafts = readCaseDrafts(caseNumber)
  return c.json({ drafts, total: drafts.length })
})

export default cases

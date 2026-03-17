/**
 * drafts.ts — 邮件草稿路由 (只读)
 */
import { Hono } from 'hono'
import { readAllDrafts, readCaseDrafts } from '../services/draft-reader.js'

const drafts = new Hono()

// GET /api/drafts — 所有待审批草稿
drafts.get('/', (c) => {
  const allDrafts = readAllDrafts()
  return c.json({ drafts: allDrafts, total: allDrafts.length })
})

// GET /api/drafts/:caseId/:file
drafts.get('/:caseId/:file', (c) => {
  const caseId = c.req.param('caseId')
  const file = c.req.param('file')
  const caseDrafts = readCaseDrafts(caseId)
  const draft = caseDrafts.find(d => d.filename === file)

  if (!draft) {
    return c.json({ error: 'Draft not found' }, 404)
  }

  return c.json(draft)
})

export default drafts

/**
 * drafts.ts — 邮件草稿路由 (只读 + Outlook 草稿创建)
 */
import { Hono } from 'hono'
import { readAllDrafts, readCaseDrafts, writeDraft } from '../services/draft-reader.js'
import { createOutlookDraft } from '../services/outlook-draft.js'

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

// PUT /api/drafts/:caseId/:file — save edited draft
drafts.put('/:caseId/:file', async (c) => {
  const caseId = c.req.param('caseId')
  const file = c.req.param('file')
  const body = await c.req.json<{ content: string }>()

  if (!body.content && body.content !== '') {
    return c.json({ error: 'content is required' }, 400)
  }

  const success = writeDraft(caseId, file, body.content)
  if (!success) {
    return c.json({ error: 'Draft not found or write failed' }, 404)
  }

  return c.json({ ok: true })
})

// POST /api/drafts/:caseId/:file/create-outlook-draft — create reply draft in Outlook
drafts.post('/:caseId/:file/create-outlook-draft', async (c) => {
  const caseId = c.req.param('caseId')
  const file = c.req.param('file')

  try {
    const result = await createOutlookDraft(caseId, file)
    return c.json(result)
  } catch (err: any) {
    return c.json({ error: err.message || 'Failed to create Outlook draft' }, 500)
  }
})

export default drafts

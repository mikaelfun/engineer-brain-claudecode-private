/**
 * ai.ts — GitHub Copilot API AI 分析路由
 */
import { Hono } from 'hono'
import { config } from '../config.js'
import {
  callCopilotChat,
  buildCaseAnalysisPrompt,
  buildAllCasesAnalysisPrompt,
} from '../services/copilot-client.js'
import { parseCaseInfo } from '../services/case-reader.js'
import { parseEmails } from '../services/email-reader.js'
import { parseNotes } from '../services/note-reader.js'
import { readCaseMeta } from '../services/meta-reader.js'
import { listActiveCases } from '../services/workspace.js'

const ai = new Hono()

// POST /api/ai/analyze-case/:id
ai.post('/analyze-case/:id', async (c) => {
  const caseNumber = c.req.param('id')

  if (!config.githubCopilotToken) {
    return c.json({ error: 'GitHub Copilot token not configured' }, 503)
  }

  const info = parseCaseInfo(caseNumber)
  if (!info) {
    return c.json({ error: 'Case not found' }, 404)
  }

  const emails = parseEmails(caseNumber)
  const notes = parseNotes(caseNumber)
  const meta = readCaseMeta(caseNumber)

  // Build context
  const caseData = [
    `## Case ${caseNumber}: ${info.title}`,
    `- Severity: ${info.severity}`,
    `- Status: ${info.status}`,
    `- Customer: ${info.customer}`,
    `- Assigned To: ${info.assignedTo}`,
    `- Created: ${info.createdOn} (Age: ${info.caseAge})`,
    `- SAP: ${info.sap}`,
    '',
    `### SLA Status`,
    `- IR SLA: ${meta?.irSla?.status || 'unknown'}`,
    `- FWR: ${meta?.fwr?.status || 'unknown'}`,
    `- FDR: ${meta?.fdr?.status || 'unknown'}`,
    '',
    `### Recent Emails (${emails.length} total)`,
    ...emails.slice(0, 5).map(e =>
      `- ${e.direction === 'sent' ? '📤' : '📥'} ${e.date}: ${e.subject}\n  ${e.body.slice(0, 200)}...`
    ),
    '',
    `### Notes (${notes.length} total)`,
    ...notes.slice(0, 5).map(n =>
      `- 📝 ${n.date} by ${n.author}: ${n.body.slice(0, 200)}`
    ),
  ].join('\n')

  try {
    const messages = buildCaseAnalysisPrompt(caseData)
    const result = await callCopilotChat(messages, config.githubCopilotToken)
    return c.json({ analysis: result })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return c.json({ error: `AI analysis failed: ${msg}` }, 500)
  }
})

// POST /api/ai/analyze-all
ai.post('/analyze-all', async (c) => {
  if (!config.githubCopilotToken) {
    return c.json({ error: 'GitHub Copilot token not configured' }, 503)
  }

  const cases = listActiveCases()
  const overviews: string[] = []

  for (const cn of cases) {
    const info = parseCaseInfo(cn)
    const meta = readCaseMeta(cn)
    if (info) {
      overviews.push(
        `- **${cn}** (${info.customer}): ${info.title} | Sev ${info.severity} | ${info.status} | Age: ${info.caseAge} | IR: ${meta?.irSla?.status || '?'}`
      )
    }
  }

  const casesData = [
    `## Active Cases Overview (${cases.length} cases)`,
    '',
    ...overviews,
  ].join('\n')

  try {
    const messages = buildAllCasesAnalysisPrompt(casesData)
    const result = await callCopilotChat(messages, config.githubCopilotToken)
    return c.json({ analysis: result })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return c.json({ error: `AI analysis failed: ${msg}` }, 500)
  }
})

export default ai

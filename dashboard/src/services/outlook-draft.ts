/**
 * outlook-draft.ts — Create reply draft in Outlook via agency Mail MCP
 *
 * Flow:
 *   1. Read local draft file, parse frontmatter (To, Subject, Type, CC)
 *   2. Search Outlook for the latest email in this case thread
 *   3. Call ReplyToMessage(id, comment, sendImmediately=false) to create reply draft
 *   4. Return the Outlook webLink for the draft
 */
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { execSync, spawn } from 'child_process'
import { getCaseDir } from './workspace.js'

const AGENCY_EXE = join(process.env.APPDATA || '', 'agency', 'CurrentVersion', 'agency.exe')

interface DraftMeta {
  to: string
  subject: string
  cc?: string
  type?: string
  body: string
}

/** Parse draft markdown file.
 *
 * Format:
 *   # Email Draft — {type}
 *
 *   **To:** Name <email>
 *   **CC:** a@b.com;c@d.com
 *   **Subject:** Re: ...
 *   **Language:** en|zh
 *   **Type:** follow-up|closure|...
 *
 *   ---
 *
 *   {邮件正文 — this is the body we need}
 *
 *   ---
 *
 *   _Generated at {timestamp} | Humanized: ✅_
 */
function parseDraftFile(content: string): DraftMeta {
  const lines = content.split('\n')
  const meta: Record<string, string> = {}

  // 1. Parse **Key:** Value metadata lines
  for (const line of lines) {
    const m = line.match(/^\*\*(\w+):\*\*\s*(.+)$/)
    if (m) {
      meta[m[1].toLowerCase()] = m[2].trim()
    }
  }

  // 2. Find body: between first --- and second ---
  const dashPositions: number[] = []
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      dashPositions.push(i)
    }
  }

  let body = ''
  if (dashPositions.length >= 2) {
    // Body is between first and second ---
    body = lines.slice(dashPositions[0] + 1, dashPositions[1]).join('\n').trim()
  } else if (dashPositions.length === 1) {
    // Only one --- → body is everything after it (minus footer)
    body = lines.slice(dashPositions[0] + 1).join('\n').trim()
  } else {
    // No --- → skip metadata lines, use the rest
    const firstNonMeta = lines.findIndex(l => !l.startsWith('#') && !l.startsWith('**') && l.trim() !== '')
    body = lines.slice(firstNonMeta).join('\n').trim()
  }

  // Remove trailing _Generated at..._ footer if present
  body = body.replace(/\n*_Generated at .+_\s*$/, '').trim()

  // 3. Extract email from "Name <email>" format
  const toRaw = meta.to || meta.recipient || ''
  const emailMatch = toRaw.match(/<([^>]+)>/)
  const toEmail = emailMatch ? emailMatch[1] : toRaw

  return {
    to: toEmail,
    subject: meta.subject || '',
    cc: meta.cc,
    type: meta.type || meta.language,
    body,
  }
}

/** Convert markdown body to simple HTML for Outlook */
function markdownToHtml(md: string): string {
  let html = md
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    // Code blocks
    .replace(/```[\s\S]*?```/g, (m) => {
      const code = m.replace(/```\w*\n?/, '').replace(/\n?```$/, '')
      return `<pre style="background:#1e1e1e;color:#d4d4d4;padding:8px;border-radius:4px;font-family:Consolas,monospace;font-size:12px;white-space:pre-wrap">${code}</pre>`
    })
    // Inline code
    .replace(/`([^`]+)`/g, '<code style="background:#f0f0f0;padding:1px 4px;border-radius:2px;font-family:Consolas,monospace;font-size:12px">$1</code>')
    // Section separators (=============)
    .replace(/^=+$/gm, '<hr style="border:none;border-top:1px solid #ccc;margin:8px 0">')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Line breaks
    .replace(/\n/g, '<br>')

  return `<div style="font-family:Segoe UI,Arial,sans-serif;font-size:14px;line-height:20px">${html}</div>`
}

interface McpResponse {
  result?: {
    content?: Array<{ text?: string }>
  }
}

/** Call Mail MCP tool via agency HTTP proxy */
async function mcpCall(port: number, tool: string, args: Record<string, any>): Promise<any> {
  const body = JSON.stringify({
    jsonrpc: '2.0',
    id: Date.now(),
    method: 'tools/call',
    params: { name: tool, arguments: args },
  })

  const res = await fetch(`http://localhost:${port}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
    },
    body,
  })

  const text = await res.text()

  // Parse SSE or direct JSON
  for (const line of text.split('\n')) {
    if (line.startsWith('data: {')) {
      try { return JSON.parse(line.slice(6)) } catch { /* continue */ }
    }
  }
  try { return JSON.parse(text) } catch { return null }
}

function extractToolResult(resp: any): any {
  const content = resp?.result?.content || []
  for (const c of content) {
    if (c.text) {
      try { return JSON.parse(c.text) } catch { return c.text }
    }
  }
  return null
}

export async function createOutlookDraft(caseId: string, filename: string): Promise<{
  ok: boolean
  messageId?: string
  webLink?: string
  method: 'reply' | 'new'
  error?: string
}> {
  // 1. Read local draft
  const caseDir = getCaseDir(caseId)
  const draftPath = join(caseDir, 'drafts', filename)

  if (!existsSync(draftPath)) {
    throw new Error(`Draft file not found: ${filename}`)
  }

  const raw = readFileSync(draftPath, 'utf-8')
  const draft = parseDraftFile(raw)

  if (!draft.body) {
    throw new Error('Draft body is empty')
  }

  // 2. Start agency mail MCP proxy
  if (!existsSync(AGENCY_EXE)) {
    throw new Error('agency.exe not found')
  }

  const port = 9897 + (Date.now() % 10)
  const proxy = spawn(AGENCY_EXE, ['mcp', 'mail', '--transport', 'http', '--port', String(port)], {
    stdio: 'ignore',
    detached: true,
  })
  proxy.unref()

  // Wait for proxy to start
  let ready = false
  for (let i = 0; i < 15; i++) {
    try {
      const initResp = await fetch(`http://localhost:${port}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json, text/event-stream' },
        body: JSON.stringify({
          jsonrpc: '2.0', id: 0, method: 'initialize',
          params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'outlook-draft', version: '1.0' } },
        }),
      })
      if (initResp.ok) { ready = true; break }
    } catch { /* retry */ }
    await new Promise(r => setTimeout(r, 1000))
  }

  if (!ready) {
    try { proxy.kill() } catch { /* ignore */ }
    throw new Error('Mail MCP proxy failed to start')
  }

  const cleanup = () => { try { proxy.kill() } catch { /* ignore */ } }

  try {
    // 3. Search for the latest email in this case thread
    const searchResp = await mcpCall(port, 'SearchMessagesQueryParameters', {
      queryParameters: `?$search="${caseId}"&$top=10`,
    })

    const searchResult = extractToolResult(searchResp)
    let rawResponse: any = null
    if (searchResult?.rawResponse) {
      try { rawResponse = JSON.parse(searchResult.rawResponse) } catch { /* ignore */ }
    }

    const messages: any[] = rawResponse?.value || []

    // Find the latest message from a customer (not from microsoft.com) to reply to
    // If not found, use the latest message regardless
    const customerMsg = messages.find((m: any) => {
      const addr = m.from?.emailAddress?.address?.toLowerCase() || ''
      return !addr.includes('@microsoft.com')
    })

    const targetMsg = customerMsg || messages[0]

    if (targetMsg?.id) {
      // 4a. Reply-all to existing thread (preserves CC recipients)
      const htmlBody = markdownToHtml(draft.body)
      const replyResp = await mcpCall(port, 'ReplyAllToMessage', {
        id: targetMsg.id,
        comment: htmlBody,
        preferHtml: true,
        sendImmediately: false,
      })

      const replyResult = extractToolResult(replyResp)
      cleanup()

      return {
        ok: true,
        messageId: replyResult?.data?.messageId || replyResult?.messageId,
        webLink: replyResult?.data?.webLink || replyResult?.webLink,
        method: 'reply',
      }
    } else {
      // 4b. No existing thread found — create new draft
      const htmlBody = markdownToHtml(draft.body)
      const createResp = await mcpCall(port, 'CreateDraftMessage', {
        to: [draft.to],
        subject: draft.subject || `Case ${caseId}`,
        body: htmlBody,
        contentType: 'HTML',
        ...(draft.cc ? { cc: draft.cc.split(';').map(s => s.trim()) } : {}),
      })

      const createResult = extractToolResult(createResp)
      cleanup()

      return {
        ok: true,
        messageId: createResult?.data?.messageId || createResult?.messageId,
        webLink: createResult?.data?.webLink || createResult?.webLink,
        method: 'new',
      }
    }
  } catch (err) {
    cleanup()
    throw err
  }
}

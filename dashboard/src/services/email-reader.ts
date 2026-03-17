/**
 * email-reader.ts — 解析 emails.md
 */
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { getCaseDir } from './workspace.js'
import type { Email } from '../types/index.js'

export function parseEmails(caseNumber: string): Email[] {
  const caseDir = getCaseDir(caseNumber)
  const filePath = join(caseDir, 'emails.md')

  if (!existsSync(filePath)) return []

  const content = readFileSync(filePath, 'utf-8')
  const emails: Email[] = []

  // Split by email markers: <!-- id: {guid} -->
  const emailBlocks = content.split(/(?=<!-- id: )/).filter(b => b.includes('<!-- id:'))

  for (const block of emailBlocks) {
    // Extract id
    const idMatch = block.match(/<!-- id: ([a-f0-9-]+) -->/)
    const id = idMatch ? idMatch[1] : ''

    // Extract direction and date: ### 📤 Sent | {date} or ### 📥 Received | {date}
    const headerMatch = block.match(/### (📤|📥)\s*(Sent|Received)\s*\|\s*(.+)/)
    if (!headerMatch) continue

    const direction: 'sent' | 'received' = headerMatch[2] === 'Sent' ? 'sent' : 'received'
    const date = headerMatch[3].trim()

    // Parse lines to extract metadata and body
    const lines = block.split('\n')
    let subject = ''
    let from = ''
    let to = ''
    let bodyStartIdx = -1

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (line.startsWith('**Subject:**')) {
        subject = line.replace('**Subject:**', '').trim()
      } else if (line.startsWith('**From:**')) {
        from = line.replace('**From:**', '').trim()
      } else if (line.startsWith('**To:**')) {
        to = line.replace('**To:**', '').trim()
        bodyStartIdx = i + 1
      }
    }

    // Extract body: everything after To: line, before ---
    let body = ''
    if (bodyStartIdx > 0) {
      const bodyLines: string[] = []
      for (let i = bodyStartIdx; i < lines.length; i++) {
        if (lines[i].trim() === '---') break
        bodyLines.push(lines[i])
      }
      body = bodyLines.join('\n').trim()
    }

    // Clean up from/to — remove trailing pipe characters from markdown table artifacts
    from = from.replace(/\|+\s*$/, '').trim()
    to = to.replace(/\|+\s*$/, '').trim()

    emails.push({ id, direction, date, subject, from, to, body })
  }

  return emails
}

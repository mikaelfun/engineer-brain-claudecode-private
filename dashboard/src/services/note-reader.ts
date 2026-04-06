/**
 * note-reader.ts — 解析 notes.md
 */
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { getCaseDir } from './workspace.js'
import type { Note } from '../types/index.js'

export function parseNotes(caseNumber: string): Note[] {
  const caseDir = getCaseDir(caseNumber)
  const filePath = join(caseDir, 'notes.md')

  if (!existsSync(filePath)) return []

  const content = readFileSync(filePath, 'utf-8')
  const notes: Note[] = []

  // Split by note markers
  const noteBlocks = content.split(/(?=<!-- id: )/).filter(b => b.includes('<!-- id:'))

  for (const block of noteBlocks) {
    // Extract id
    const idMatch = block.match(/<!-- id: ([a-f0-9-]+) -->/)
    const id = idMatch ? idMatch[1] : ''

    // Extract date and author: ### 📝 {date} | {author}
    const headerMatch = block.match(/### 📝\s*(.+?)\s*\|\s*(.+)/)
    if (!headerMatch) continue

    const date = headerMatch[1].trim()
    const author = headerMatch[2].trim()

    // Extract title (line after header starting with **)
    const titleMatch = block.match(/\*\*(.+?)\*\*/)
    const title = titleMatch ? titleMatch[1] : '(no title)'

    // Extract body: everything after header and title, before ---
    const lines = block.split('\n')
    const headerIdx = lines.findIndex((l: string) => l.includes('### 📝'))
    let endIdx = -1
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].trim() === '---') { endIdx = i; break; }
    }
    const bodyLines = lines.slice(headerIdx + 2, endIdx > headerIdx ? endIdx : undefined)
    const body = bodyLines.join('\n').trim()

    notes.push({ id, date, author, title, body })
  }

  // Filter out system notes (CrmGlobal-DFM-MSaaS) and sort newest first
  return notes
    .filter(n => n.author !== 'CrmGlobal-DFM-MSaaS')
    .sort((a, b) => {
      const da = new Date(a.date).getTime()
      const db = new Date(b.date).getTime()
      return db - da // descending (newest first)
    })
}

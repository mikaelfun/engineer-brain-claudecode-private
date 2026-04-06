/**
 * labor-reader.ts — 解析 labor.md (D365 labor records snapshot)
 */
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { getCaseDir } from './workspace.js'
import type { LaborRecord } from '../types/index.js'

export function parseLaborRecords(caseNumber: string): LaborRecord[] {
  const caseDir = getCaseDir(caseNumber)
  const filePath = join(caseDir, 'labor.md')

  if (!existsSync(filePath)) return []

  const content = readFileSync(filePath, 'utf-8')
  const records: LaborRecord[] = []

  // Find markdown table rows: | Date | Duration (min) | Classification | Description |
  const lines = content.split('\n')
  let inTable = false

  for (const line of lines) {
    const trimmed = line.trim()
    // Detect table header
    if (trimmed.includes('Date') && trimmed.includes('Duration') && trimmed.includes('Classification')) {
      inTable = true
      continue
    }
    // Skip separator row (|---|---|...)
    if (inTable && /^\|[\s-|]+\|$/.test(trimmed)) {
      continue
    }
    // Parse data rows
    if (inTable && trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const cells = trimmed.split('|').map(c => c.trim()).filter(Boolean)
      if (cells.length >= 4) {
        records.push({
          date: cells[0],
          durationMin: parseInt(cells[1], 10) || 0,
          classification: cells[2],
          description: cells[3],
        })
      }
    } else if (inTable && !trimmed.startsWith('|')) {
      // End of table
      break
    }
  }

  // Sort newest first
  return records.sort((a, b) => {
    const da = new Date(a.date).getTime()
    const db = new Date(b.date).getTime()
    return db - da
  })
}

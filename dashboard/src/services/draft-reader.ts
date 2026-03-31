/**
 * draft-reader.ts — 读 drafts/*.md
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import { getCaseDir } from './workspace.js'
import { listActiveCases } from './workspace.js'
import type { Draft } from '../types/index.js'

export function readCaseDrafts(caseNumber: string): Draft[] {
  const caseDir = getCaseDir(caseNumber)
  const draftsDir = join(caseDir, 'drafts')

  if (!existsSync(draftsDir)) return []

  try {
    const files = readdirSync(draftsDir).filter(f => f.endsWith('.md'))
    return files.map(filename => {
      const filePath = join(draftsDir, filename)
      const content = readFileSync(filePath, 'utf-8')
      const stat = statSync(filePath)
      return {
        caseNumber,
        filename,
        content,
        createdAt: stat.mtime.toISOString(),
      }
    })
  } catch {
    return []
  }
}

export function readAllDrafts(): Draft[] {
  const cases = listActiveCases()
  const allDrafts: Draft[] = []

  for (const caseNumber of cases) {
    const drafts = readCaseDrafts(caseNumber)
    allDrafts.push(...drafts)
  }

  return allDrafts.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export function writeDraft(caseNumber: string, filename: string, content: string): boolean {
  const caseDir = getCaseDir(caseNumber)
  const filePath = join(caseDir, 'drafts', filename)

  if (!existsSync(filePath)) return false

  try {
    writeFileSync(filePath, content, 'utf-8')
    return true
  } catch {
    return false
  }
}

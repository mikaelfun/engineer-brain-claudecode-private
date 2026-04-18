/**
 * meta-reader.ts — Read case and patrol state files
 */
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { getCaseDir } from './workspace.js'
import type { CaseHealthMeta } from '../types/index.js'

export function readCaseMeta(caseNumber: string): CaseHealthMeta | null {
  const caseDir = getCaseDir(caseNumber)
  const filePath = join(caseDir, 'casework-meta.json')

  if (!existsSync(filePath)) return null

  try {
    const content = readFileSync(filePath, 'utf-8')
    return JSON.parse(content) as CaseHealthMeta
  } catch {
    return null
  }
}

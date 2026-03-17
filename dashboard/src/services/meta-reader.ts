/**
 * meta-reader.ts — 读 casehealth-meta.json
 */
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { getCaseDir } from './workspace.js'
import { config } from '../config.js'
import type { CaseHealthMeta, PatrolState } from '../types/index.js'

export function readCaseMeta(caseNumber: string): CaseHealthMeta | null {
  const caseDir = getCaseDir(caseNumber)
  const filePath = join(caseDir, 'casehealth-meta.json')

  if (!existsSync(filePath)) return null

  try {
    const content = readFileSync(filePath, 'utf-8')
    return JSON.parse(content) as CaseHealthMeta
  } catch {
    return null
  }
}

export function readPatrolState(): PatrolState | null {
  if (!existsSync(config.patrolStateFile)) return null

  try {
    const content = readFileSync(config.patrolStateFile, 'utf-8')
    return JSON.parse(content) as PatrolState
  } catch {
    return null
  }
}

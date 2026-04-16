/**
 * meta-reader.ts — Read case and patrol state files
 */
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { getCaseDir } from './workspace.js'
import { config } from '../config.js'
import type { CaseHealthMeta, PatrolState } from '../types/index.js'

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

/**
 * Read patrol state from patrol-state.json.
 * Single source of truth — written by /patrol skill on completion.
 */
export function readPatrolState(): PatrolState | null {
  const stateFile = config.patrolStateFile
  if (!existsSync(stateFile)) return null

  try {
    return JSON.parse(readFileSync(stateFile, 'utf-8')) as PatrolState
  } catch {
    return null
  }
}

/**
 * meta-reader.ts — 读 casehealth-meta.json
 */
import { readFileSync, existsSync, statSync } from 'fs'
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
  const stateFile = config.patrolStateFile
  const resultFile = join(config.casesDir, '.patrol', 'result.json')
  const stateExists = existsSync(stateFile)
  const resultExists = existsSync(resultFile)

  // Determine which source is fresher
  let useResultFallback = false
  if (!stateExists && resultExists) {
    useResultFallback = true
  } else if (stateExists && resultExists) {
    try {
      const stateMtime = statSync(stateFile).mtimeMs
      const resultMtime = statSync(resultFile).mtimeMs
      if (resultMtime > stateMtime) {
        useResultFallback = true
      }
    } catch { /* use stateFile */ }
  }

  if (useResultFallback) {
    // CLI patrol wrote result.json but not casehealth-state.json — derive state
    try {
      const result = JSON.parse(readFileSync(resultFile, 'utf-8'))
      const durationMs = result.completedAt && result.startedAt
        ? new Date(result.completedAt).getTime() - new Date(result.startedAt).getTime()
        : 0
      return {
        lastPatrol: result.completedAt || result.startedAt || new Date().toISOString(),
        currentPatrolStartedAt: result.startedAt || '',
        patrolType: result.phase === 'completed' ? 'full' : String(result.phase || 'unknown'),
        lastRunTiming: {
          caseCount: result.processedCases ?? result.totalCases ?? 0,
          startedAt: result.startedAt || '',
          completedAt: result.completedAt || '',
          wallClockMinutes: Math.round(durationMs / 60000),
          computeSeconds: 0,
          bottlenecks: [],
        },
        // Fields not available from result.json — use safe defaults
        activeCases: (result.caseResults || []).map((cr: { caseNumber: string }) => cr.caseNumber),
        arCases: [],
        todoFile: '',
        summary: { pendingEngineer: 0, pendingCustomer: 0, waitingPG: 0, ar: 0, normal: 0 },
      } as PatrolState
    } catch {
      // Fall through to stateFile
    }
  }

  if (!stateExists) return null

  try {
    const content = readFileSync(stateFile, 'utf-8')
    return JSON.parse(content) as PatrolState
  } catch {
    return null
  }
}

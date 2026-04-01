/**
 * labor-estimate-service.ts — Backend logic for labor estimation
 *
 * Handles:
 * - Reading labor-estimate.json files from case directories
 * - Executing record-labor.ps1 to submit to D365
 * - Managing calibration.json updates
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import { config } from '../config.js'

const execAsync = promisify(exec)

// ===== Types =====

export interface EffortBreakdown {
  type: string
  minutes: number
  detail: string
}

export interface LaborEstimate {
  date: string
  caseNumber: string
  estimated: {
    totalMinutes: number
    classification: string
    description: string
    breakdown: EffortBreakdown[]
  }
  final: {
    totalMinutes: number
    classification: string
    description: string
  } | null
  status: 'pending' | 'confirmed' | 'submitted'
}

export interface CalibrationData {
  adjustments: Record<string, { multiplier: number; samples: number }>
  history: Array<{
    date: string
    caseNumber: string
    aiTotal: number
    userTotal: number
  }>
  lastUpdated: string
}

// ===== Paths =====

function getLaborDir(caseNumber: string): string {
  return join(config.activeCasesDir, caseNumber, 'labor')
}

function getLaborEstimatePath(caseNumber: string): string {
  return join(getLaborDir(caseNumber), 'labor-estimate.json')
}

function getCalibrationPath(): string {
  return join(config.projectRoot, 'skills', 'labor-estimate', 'calibration.json')
}

// ===== Read Operations =====

export function readLaborEstimate(caseNumber: string): LaborEstimate | null {
  const filePath = getLaborEstimatePath(caseNumber)
  if (!existsSync(filePath)) return null
  try {
    return JSON.parse(readFileSync(filePath, 'utf-8'))
  } catch {
    return null
  }
}

export function readAllLaborEstimates(): Array<LaborEstimate & { caseTitle?: string }> {
  const activeCasesDir = config.activeCasesDir
  if (!existsSync(activeCasesDir)) return []

  const results: Array<LaborEstimate & { caseTitle?: string }> = []
  const caseDirs = readdirSync(activeCasesDir).filter(d => {
    const fullPath = join(activeCasesDir, d)
    try { return statSync(fullPath).isDirectory() } catch { return false }
  })

  for (const caseNumber of caseDirs) {
    const estimate = readLaborEstimate(caseNumber)
    if (estimate) {
      // Try to read case title from case-info.md
      let caseTitle: string | undefined
      const caseInfoPath = join(activeCasesDir, caseNumber, 'case-info.md')
      if (existsSync(caseInfoPath)) {
        try {
          const content = readFileSync(caseInfoPath, 'utf-8')
          const titleMatch = content.match(/^#\s+(.+)/m)
          if (titleMatch) caseTitle = titleMatch[1]
        } catch { /* ignore */ }
      }
      results.push({ ...estimate, caseTitle })
    }
  }

  return results
}

export function readCalibration(): CalibrationData {
  const calPath = getCalibrationPath()
  if (!existsSync(calPath)) {
    return {
      adjustments: {
        troubleshooting: { multiplier: 1.0, samples: 0 },
        email: { multiplier: 1.0, samples: 0 },
        research: { multiplier: 1.0, samples: 0 },
        notes: { multiplier: 1.0, samples: 0 },
        remote_session: { multiplier: 1.0, samples: 0 },
        internal_consult: { multiplier: 1.0, samples: 0 },
        analysis: { multiplier: 1.0, samples: 0 },
      },
      history: [],
      lastUpdated: '',
    }
  }
  try {
    return JSON.parse(readFileSync(calPath, 'utf-8'))
  } catch {
    return { adjustments: {}, history: [], lastUpdated: '' }
  }
}

// ===== Write Operations =====

export function saveLaborEstimate(caseNumber: string, estimate: LaborEstimate): void {
  const laborDir = getLaborDir(caseNumber)
  if (!existsSync(laborDir)) {
    mkdirSync(laborDir, { recursive: true })
  }
  writeFileSync(getLaborEstimatePath(caseNumber), JSON.stringify(estimate, null, 2), 'utf-8')
}

export function updateCalibration(
  caseNumber: string,
  aiTotal: number,
  userTotal: number
): void {
  if (aiTotal <= 0 || userTotal <= 0) return
  if (aiTotal === userTotal) return // No adjustment needed

  const cal = readCalibration()
  const ratio = userTotal / aiTotal
  const ALPHA = 0.3

  // Update all adjustment multipliers proportionally
  for (const [_type, adj] of Object.entries(cal.adjustments)) {
    adj.multiplier = ALPHA * ratio + (1 - ALPHA) * adj.multiplier
    adj.samples += 1
  }

  // Append to history
  cal.history.push({
    date: new Date().toISOString().slice(0, 10),
    caseNumber,
    aiTotal,
    userTotal,
  })

  // Keep history manageable (last 100 entries)
  if (cal.history.length > 100) {
    cal.history = cal.history.slice(-100)
  }

  cal.lastUpdated = new Date().toISOString().slice(0, 10)

  const calPath = getCalibrationPath()
  writeFileSync(calPath, JSON.stringify(cal, null, 2), 'utf-8')
}

// ===== D365 Submit =====

export async function submitLaborToD365(
  caseNumber: string,
  minutes: number,
  classification: string,
  description: string
): Promise<{ success: boolean; message: string }> {
  const scriptPath = join(config.scriptsDir, 'record-labor.ps1')
  if (!existsSync(scriptPath)) {
    return { success: false, message: `Script not found: ${scriptPath}` }
  }

  const escapedDesc = description.replace(/'/g, "''")
  const escapedClass = classification.replace(/'/g, "''")
  const cmd = `pwsh -NoProfile -File "${scriptPath}" -Minutes ${minutes} -Classification '${escapedClass}' -Description '${escapedDesc}'`

  try {
    const { stdout, stderr } = await execAsync(cmd, { timeout: 120000 })
    const output = (stdout + stderr).trim()

    // Update the labor-estimate.json status
    const estimate = readLaborEstimate(caseNumber)
    if (estimate) {
      estimate.status = 'submitted'
      estimate.final = {
        totalMinutes: minutes,
        classification,
        description,
      }
      saveLaborEstimate(caseNumber, estimate)

      // Update calibration if user changed the estimate
      if (estimate.estimated.totalMinutes !== minutes) {
        updateCalibration(caseNumber, estimate.estimated.totalMinutes, minutes)
      }
    }

    return { success: true, message: output || `Labor ${minutes}min recorded for Case ${caseNumber}` }
  } catch (err: any) {
    return { success: false, message: err.message }
  }
}

// ===== List Active Cases =====

export function listActiveCaseNumbers(): string[] {
  const activeCasesDir = config.activeCasesDir
  if (!existsSync(activeCasesDir)) return []
  try {
    return readdirSync(activeCasesDir).filter(d => {
      const fullPath = join(activeCasesDir, d)
      try {
        return statSync(fullPath).isDirectory()
      } catch {
        return false
      }
    })
  } catch {
    return []
  }
}

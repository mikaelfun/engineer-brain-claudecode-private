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
import { execFile } from 'child_process'
import { promisify } from 'util'
import { config } from '../config.js'
import { parseLaborRecords } from './labor-reader.js'
import { parseCaseInfo } from './case-reader.js'

const execFileAsync = promisify(execFile)

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

export function readAllLaborEstimates(): Array<LaborEstimate & { caseTitle?: string; daysSinceLastLabor?: number; lastLaborDate?: string }> {
  const activeCasesDir = config.activeCasesDir
  if (!existsSync(activeCasesDir)) return []

  const results: Array<LaborEstimate & { caseTitle?: string; daysSinceLastLabor?: number; lastLaborDate?: string }> = []
  const caseDirs = readdirSync(activeCasesDir).filter(d => {
    const fullPath = join(activeCasesDir, d)
    try { return statSync(fullPath).isDirectory() } catch { return false }
  })

  const now = new Date()

  for (const caseNumber of caseDirs) {
    const estimate = readLaborEstimate(caseNumber)
    if (estimate) {
      // Skip zero-minute estimates — these are worthless "no action" entries
      if (!estimate.estimated || estimate.estimated.totalMinutes <= 0) continue

      // Read case title using shared parser (handles | in title correctly)
      const caseInfo = parseCaseInfo(caseNumber)
      const caseTitle = caseInfo?.title || undefined

      // Compute days since last labor from labor.md
      let daysSinceLastLabor: number | undefined
      let lastLaborDate: string | undefined
      try {
        const records = parseLaborRecords(caseNumber)
        if (records.length > 0) {
          lastLaborDate = records[0].date // already sorted newest first
          const lastDate = new Date(lastLaborDate)
          if (!isNaN(lastDate.getTime())) {
            daysSinceLastLabor = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
          }
        }
      } catch { /* ignore */ }

      results.push({ ...estimate, caseTitle, daysSinceLastLabor, lastLaborDate })
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

  // AR cases: labor must be recorded on the main case (D365 doesn't support labor on AR cases)
  let targetTicket = caseNumber
  const metaPath = join(config.activeCasesDir, caseNumber, 'casehealth-meta.json')
  if (existsSync(metaPath)) {
    try {
      const meta = JSON.parse(readFileSync(metaPath, 'utf-8'))
      if (meta.isAR === true && meta.mainCaseId) {
        console.log(`[labor] AR case ${caseNumber} → recording labor on main case ${meta.mainCaseId}`)
        targetTicket = meta.mainCaseId
      }
    } catch {}
  }

  const escapedDesc = description.replace(/'/g, "''")
  const escapedClass = classification.replace(/'/g, "''")
  const args = [
    '-NoProfile', '-File', scriptPath,
    '-TicketNumber', targetTicket,
    '-Minutes', String(minutes),
    '-Classification', escapedClass,
    '-Description', escapedDesc,
  ]

  try {
    const { stdout, stderr } = await execFileAsync('pwsh', args, { timeout: 120000 })
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
    const stdout = err.stdout || ''
    const stderr = err.stderr || ''
    // Extract meaningful message from script output
    const output = (stdout + stderr).replace(/\r\n/g, '\n').trim()
    const dupMatch = output.match(/Duplicate detected:.*/)
    const reason = dupMatch ? dupMatch[0] : (output || err.message)
    return { success: false, message: reason }
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

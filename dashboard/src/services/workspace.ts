/**
 * workspace.ts — Case 目录路径解析 + 就绪检测
 */
import { existsSync, readdirSync, mkdirSync } from 'fs'
import { join } from 'path'
import { config } from '../config.js'

/**
 * Validate caseNumber: must be digits only (D365 case number format).
 * Prevents path traversal via crafted IDs like "../etc" or "foo/bar".
 */
export function isValidCaseNumber(caseNumber: string): boolean {
  return /^\d{10,20}$/.test(caseNumber)
}

export function getCaseDir(caseNumber: string): string {
  // Check active first, then AR
  const activePath = join(config.activeCasesDir, caseNumber)
  if (existsSync(activePath)) return activePath

  const arPath = join(config.arCasesDir, caseNumber)
  if (existsSync(arPath)) return arPath

  return activePath // default to active path
}

export function listActiveCases(): string[] {
  try {
    const entries = readdirSync(config.activeCasesDir, { withFileTypes: true })
    return entries.filter(e => e.isDirectory()).map(e => e.name).sort()
  } catch {
    return []
  }
}

export function listArCases(): string[] {
  try {
    if (!existsSync(config.arCasesDir)) return []
    const entries = readdirSync(config.arCasesDir, { withFileTypes: true })
    return entries.filter(e => e.isDirectory()).map(e => e.name).sort()
  } catch {
    return []
  }
}

export function isWorkspaceReady(): boolean {
  // Auto-create cases directories if they don't exist but the config path is valid
  const casesDir = config.casesDir
  if (!existsSync(casesDir)) {
    try {
      mkdirSync(casesDir, { recursive: true })
      console.log(`[workspace] Created cases directory: ${casesDir}`)
    } catch {
      return false
    }
  }

  const activeCasesDir = config.activeCasesDir
  if (!existsSync(activeCasesDir)) {
    try {
      mkdirSync(activeCasesDir, { recursive: true })
      console.log(`[workspace] Created active cases directory: ${activeCasesDir}`)
    } catch {
      return false
    }
  }

  return true
}

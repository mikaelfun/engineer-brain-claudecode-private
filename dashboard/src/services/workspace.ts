/**
 * workspace.ts — 路径解析 + 自动检测 .openclaw
 */
import { existsSync, readdirSync } from 'fs'
import { join } from 'path'
import { config } from '../config.js'

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

export function listTodoFiles(): string[] {
  try {
    const entries = readdirSync(config.todoDir)
    return entries
      .filter(f => f.endsWith('.md'))
      .sort()
      .reverse()
  } catch {
    return []
  }
}

export function isWorkspaceReady(): boolean {
  return existsSync(config.workspace) && existsSync(config.activeCasesDir)
}

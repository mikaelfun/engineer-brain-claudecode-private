/**
 * todo-writer.ts — Per-case todo 勾选状态修改 + dismissed 持久化
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import { getCaseDir } from './workspace.js'

/** Per-case todo toggle — toggles checkbox in the latest (or specified) todo file for a case */
export function toggleCaseTodoItem(
  caseNumber: string,
  lineNumber: number,
  checked: boolean,
  filename?: string
): boolean {
  const caseDir = getCaseDir(caseNumber)
  const todoDir = join(caseDir, 'todo')

  if (!existsSync(todoDir)) return false

  let filePath: string

  if (filename) {
    // Sanitize filename — reject path traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\') || !filename.endsWith('.md')) {
      return false
    }
    filePath = join(todoDir, filename)
  } else {
    // Find latest todo file
    try {
      const files = readdirSync(todoDir)
        .filter((f: string) => f.endsWith('.md') && f !== 'dismissed.json')
        .map((f: string) => ({ name: f, mtime: statSync(join(todoDir, f)).mtimeMs }))
        .sort((a, b) => b.mtime - a.mtime)

      if (files.length === 0) return false
      filePath = join(todoDir, files[0].name)
    } catch {
      return false
    }
  }

  if (!existsSync(filePath)) return false

  // Read the item text before toggling (for dismissed tracking)
  const itemText = getItemText(filePath, lineNumber)

  const result = toggleLineInFile(filePath, lineNumber, checked)

  // When checking a 🔴 or 🟡 item, persist to dismissed.json
  // so generate-todo.sh won't recreate it in future runs
  if (result && checked && itemText) {
    const section = getItemSection(filePath, lineNumber)
    if (section === 'red' || section === 'yellow') {
      addDismissedItem(todoDir, itemText)
      // Also handle special meta updates (e.g., AR scopeConfirmed)
      handleMetaSideEffects(caseDir, itemText)
    }
  }

  return result
}

/** Get the text content of a todo item at a specific line */
function getItemText(filePath: string, lineNumber: number): string | null {
  const content = readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')
  const idx = lineNumber - 1
  if (idx < 0 || idx >= lines.length) return null
  const match = lines[idx].match(/^- \[[ x]\]\s*(.*)/)
  return match ? match[1] : null
}

/** Determine which section (red/yellow/green) a line belongs to */
function getItemSection(filePath: string, lineNumber: number): 'red' | 'yellow' | 'green' | null {
  const content = readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')
  let currentSection: 'red' | 'yellow' | 'green' | null = null

  for (let i = 0; i < lineNumber && i < lines.length; i++) {
    const line = lines[i]
    if (line.includes('🔴')) currentSection = 'red'
    else if (line.includes('🟡')) currentSection = 'yellow'
    else if (line.includes('✅')) currentSection = 'green'
  }
  return currentSection
}

/** Add an item to dismissed.json so generate-todo.sh skips it */
function addDismissedItem(todoDir: string, itemText: string): void {
  const dismissedPath = join(todoDir, 'dismissed.json')
  let dismissed: { items: string[], patterns: string[] } = { items: [], patterns: [] }

  try {
    if (existsSync(dismissedPath)) {
      dismissed = JSON.parse(readFileSync(dismissedPath, 'utf-8'))
      if (!Array.isArray(dismissed.items)) dismissed.items = []
      if (!Array.isArray(dismissed.patterns)) dismissed.patterns = []
    }
  } catch {
    dismissed = { items: [], patterns: [] }
  }

  // Avoid duplicates
  if (!dismissed.items.includes(itemText)) {
    dismissed.items.push(itemText)
    writeFileSync(dismissedPath, JSON.stringify(dismissed, null, 2), 'utf-8')
  }
}

/** Handle meta side effects when certain todo items are dismissed */
function handleMetaSideEffects(caseDir: string, itemText: string): void {
  const metaPath = join(caseDir, 'casework-meta.json')
  if (!existsSync(metaPath)) return

  try {
    const meta = JSON.parse(readFileSync(metaPath, 'utf-8'))

    // AR Scope confirmation: when user confirms the scope, update meta
    if (itemText.includes('AR Scope:') && itemText.includes('请确认是否准确')) {
      if (meta.ar && meta.ar.scopeConfirmed === false) {
        meta.ar.scopeConfirmed = true
        writeFileSync(metaPath, JSON.stringify(meta, null, 2), 'utf-8')
      }
    }

    // SAP mismatch: when user acknowledges, mark sapCheck as user-acknowledged
    if (itemText.includes('修改 SAP:')) {
      if (meta.sapCheck) {
        meta.sapCheck.userAcknowledged = true
        writeFileSync(metaPath, JSON.stringify(meta, null, 2), 'utf-8')
      }
    }
  } catch {
    // Silently fail — meta side effects are best-effort
  }
}

/** Shared toggle logic for a specific file + line */
function toggleLineInFile(filePath: string, lineNumber: number, checked: boolean): boolean {
  const content = readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')

  // lineNumber is 1-based
  const idx = lineNumber - 1
  if (idx < 0 || idx >= lines.length) return false

  const line = lines[idx]

  // Toggle: - [ ] → - [x] or - [x] → - [ ]
  if (checked && line.includes('- [ ]')) {
    lines[idx] = line.replace('- [ ]', '- [x]')
  } else if (!checked && line.includes('- [x]')) {
    lines[idx] = line.replace('- [x]', '- [ ]')
  } else {
    return false // Line format doesn't match
  }

  writeFileSync(filePath, lines.join('\n'), 'utf-8')
  return true
}

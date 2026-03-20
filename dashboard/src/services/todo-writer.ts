/**
 * todo-writer.ts — Per-case todo 勾选状态修改
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
        .filter((f: string) => f.endsWith('.md'))
        .map((f: string) => ({ name: f, mtime: statSync(join(todoDir, f)).mtimeMs }))
        .sort((a, b) => b.mtime - a.mtime)

      if (files.length === 0) return false
      filePath = join(todoDir, files[0].name)
    } catch {
      return false
    }
  }

  if (!existsSync(filePath)) return false
  return toggleLineInFile(filePath, lineNumber, checked)
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

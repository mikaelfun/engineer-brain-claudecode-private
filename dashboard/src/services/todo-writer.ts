/**
 * todo-writer.ts — 修改 todo 勾选状态
 */
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { config } from '../config.js'

export function toggleTodoItem(date: string, lineNumber: number, checked: boolean): boolean {
  const filePath = join(config.todoDir, `${date}.md`)
  if (!existsSync(filePath)) return false

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

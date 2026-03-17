/**
 * todo-reader.ts — 解析 todo/YYYYMMDD.md
 */
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { config } from '../config.js'
import { listTodoFiles } from './workspace.js'
import type { TodoFile, TodoSection, TodoCase, TodoItem, TodoSummary } from '../types/index.js'

export function parseTodoFile(filename: string): TodoFile | null {
  const filePath = join(config.todoDir, filename)
  if (!existsSync(filePath)) return null

  const content = readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')

  // Extract title from first heading
  const titleLine = lines.find(l => l.startsWith('# '))
  const title = titleLine ? titleLine.slice(2).trim() : filename

  // Extract patrol info from blockquote
  const infoLine = lines.find(l => l.startsWith('> '))
  const patrolInfo = infoLine ? infoLine.slice(2).trim() : ''

  // Extract date from filename
  const dateMatch = filename.match(/(\d{8})/)
  const date = dateMatch ? dateMatch[1] : ''

  const sections: TodoSection[] = []
  let currentSection: TodoSection | null = null
  let currentCase: TodoCase | null = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Section headers
    if (line.startsWith('## ⏭️')) {
      currentSection = { type: 'carryover', title: line.slice(3).trim(), cases: [] }
      sections.push(currentSection)
      currentCase = null
      continue
    }

    if (line.startsWith('## 本轮巡检') || line.startsWith('## 汇总')) {
      if (line.startsWith('## 汇总')) {
        // Parse summary section separately
        break
      }
      currentSection = { type: 'patrol', title: line.slice(3).trim(), cases: [] }
      sections.push(currentSection)
      currentCase = null
      continue
    }

    // Case headers: ### 🔴/🟡/✅ Case {id}（{customer} | Sev {sev} | {status}）
    const caseMatch = line.match(/^### (🔴|🟡|✅)\s*(?:Case\s+)?(\d+)(?:（(.+?)）)?/)
    if (caseMatch && currentSection) {
      const priority = caseMatch[1] === '🔴' ? 'red' as const
        : caseMatch[1] === '🟡' ? 'yellow' as const
        : 'green' as const

      const caseNumber = caseMatch[2]
      const meta = caseMatch[3] || ''
      const parts = meta.split('|').map(s => s.trim())

      currentCase = {
        caseNumber,
        customer: parts[0] || '',
        severity: (parts.find(p => p.startsWith('Sev'))?.replace('Sev ', '') || ''),
        status: parts[2] || '',
        priority,
        description: '',
        items: [],
      }
      currentSection.cases.push(currentCase)
      continue
    }

    // Carryover case header without emoji prefix
    const carryoverCaseMatch = line.match(/^### Case (\d+)(?:（(.+?)）)?/)
    if (carryoverCaseMatch && currentSection) {
      currentCase = {
        caseNumber: carryoverCaseMatch[1],
        customer: carryoverCaseMatch[2] || '',
        severity: '',
        status: '',
        priority: 'red',
        description: '',
        items: [],
      }
      currentSection.cases.push(currentCase)
      continue
    }

    // Todo items: - [ ] 🔴/🟡 {text} or - [x] 🔴/🟡 {text}
    const todoMatch = line.match(/^- \[([ x])\]\s*(🔴|🟡)?\s*(.+)/)
    if (todoMatch && currentCase) {
      const checked = todoMatch[1] === 'x'
      const priorityEmoji = todoMatch[2]
      const priority = priorityEmoji === '🔴' ? 'red' as const
        : priorityEmoji === '🟡' ? 'yellow' as const
        : 'yellow' as const
      const text = todoMatch[3].trim()
      const isCarryover = text.includes('⏭️ 上轮遗留')

      currentCase.items.push({
        lineNumber: i + 1, // 1-based
        checked,
        priority,
        text,
        isCarryover,
      })
      continue
    }

    // Completed items: - ✅ {text}
    const doneMatch = line.match(/^- ✅\s*(.+)/)
    if (doneMatch && currentCase) {
      currentCase.items.push({
        lineNumber: i + 1,
        checked: true,
        priority: 'done',
        text: doneMatch[1].trim(),
        isCarryover: false,
      })
      continue
    }

    // Case description lines (bold status lines)
    if (line.startsWith('**') && currentCase) {
      currentCase.description += (currentCase.description ? '\n' : '') + line
    }
  }

  // Parse summary
  const summary = parseSummary(content)

  return { date, filename, title, patrolInfo, sections, summary }
}

function parseSummary(content: string): TodoSummary | null {
  const summaryStart = content.indexOf('## 汇总')
  if (summaryStart < 0) return null

  const summaryContent = content.slice(summaryStart)
  const urgent: string[] = []
  const pending: string[] = []
  const carryover: string[] = []
  const normal: string[] = []

  let currentList: string[] | null = null

  for (const line of summaryContent.split('\n')) {
    if (line.includes('需立即关注')) currentList = urgent
    else if (line.includes('待确认执行')) currentList = pending
    else if (line.includes('遗留未处理')) currentList = carryover
    else if (line.includes('正常')) currentList = normal

    const itemMatch = line.match(/^\d+\.\s*\*\*(.+?)\*\*/)
    if (itemMatch && currentList) {
      currentList.push(itemMatch[1])
    }

    const bulletMatch = line.match(/^- (.+)/)
    if (bulletMatch && currentList === normal) {
      normal.push(bulletMatch[1])
    }
  }

  return { urgent, pending, carryover, normal }
}

export function getLatestTodoFile(): TodoFile | null {
  const files = listTodoFiles()
  // Find the latest non-suffixed file (YYYYMMDD.md, not YYYYMMDD-xxx.md)
  const mainFiles = files.filter(f => /^\d{8}\.md$/.test(f))
  if (mainFiles.length === 0) return null
  return parseTodoFile(mainFiles[0])
}

export function getTodoByDate(date: string): TodoFile | null {
  const filename = `${date}.md`
  return parseTodoFile(filename)
}

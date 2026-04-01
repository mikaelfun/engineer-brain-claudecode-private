/**
 * todos.ts — Per-case Todo 路由（统一模型）
 *
 * 所有 todo 数据来自 per-case todo 目录: cases/active/<id>/todo/
 * Legacy 全局 todo 已移除。
 */
import { Hono } from 'hono'
import { readFileSync, existsSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import { config } from '../config.js'
import { readCaseMeta } from '../services/meta-reader.js'

const todos = new Hono()

// GET /api/todos/all — 汇总所有 case 的最新 Todo
todos.get('/all', (c) => {
  const activeCasesDir = config.activeCasesDir

  if (!existsSync(activeCasesDir)) {
    return c.json({ todos: [], total: 0 })
  }

  const allTodos: any[] = []

  try {
    const caseDirs = readdirSync(activeCasesDir)
    for (const caseId of caseDirs) {
      const casePath = join(activeCasesDir, caseId)
      // Skip non-directories
      try {
        if (!statSync(casePath).isDirectory()) continue
      } catch {
        continue
      }

      const todoDir = join(casePath, 'todo')
      if (!existsSync(todoDir)) continue

      try {
        const todoFiles = readdirSync(todoDir)
          .filter((f) => f.endsWith('.md'))
          .sort()
          .reverse()

        if (todoFiles.length > 0) {
          const latestFile = todoFiles[0]
          const filePath = join(todoDir, latestFile)
          const content = readFileSync(filePath, 'utf-8')

          const meta = readCaseMeta(caseId)
          allTodos.push({
            caseNumber: caseId,
            filename: latestFile,
            content,
            updatedAt: statSync(filePath).mtime.toISOString(),
            compliance: meta?.compliance || null,
            ccAccount: meta?.ccAccount || null,
          })
        }
      } catch {
        // Skip unreadable todo dirs
      }
    }
  } catch {
    // activeCasesDir not readable
  }

  return c.json({
    todos: allTodos.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    total: allTodos.length,
  })
})

// GET /api/todos — list of cases with todos (summary)
todos.get('/', (c) => {
  const activeCasesDir = config.activeCasesDir

  if (!existsSync(activeCasesDir)) {
    return c.json({ files: [], total: 0 })
  }

  const files: { caseNumber: string; filename: string; updatedAt: string }[] = []

  try {
    const caseDirs = readdirSync(activeCasesDir)
    for (const caseId of caseDirs) {
      const casePath = join(activeCasesDir, caseId)
      try {
        if (!statSync(casePath).isDirectory()) continue
      } catch {
        continue
      }

      const todoDir = join(casePath, 'todo')
      if (!existsSync(todoDir)) continue

      try {
        const todoFiles = readdirSync(todoDir)
          .filter((f) => f.endsWith('.md'))
          .sort()
          .reverse()

        if (todoFiles.length > 0) {
          const filePath = join(todoDir, todoFiles[0])
          files.push({
            caseNumber: caseId,
            filename: todoFiles[0],
            updatedAt: statSync(filePath).mtime.toISOString(),
          })
        }
      } catch {
        // skip
      }
    }
  } catch {
    // skip
  }

  return c.json({
    files: files.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    total: files.length,
  })
})

export default todos

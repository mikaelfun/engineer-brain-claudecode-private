/**
 * issue-reader.ts — issues/ 目录 CRUD 操作
 */
import { existsSync, readFileSync, writeFileSync, readdirSync, unlinkSync, mkdirSync } from 'fs'
import { join } from 'path'
import { config } from '../config.js'
import type { Issue, IssueType, IssuePriority, IssueStatus } from '../types/index.js'

function getIssuesDir(): string {
  const dir = join(config.projectRoot, 'issues')
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
  return dir
}

/** Generate next issue ID: ISS-001, ISS-002, ... */
function nextId(): string {
  const issues = listIssues()
  if (issues.length === 0) return 'ISS-001'
  const maxNum = issues.reduce((max, iss) => {
    const m = iss.id.match(/^ISS-(\d+)$/)
    return m ? Math.max(max, parseInt(m[1], 10)) : max
  }, 0)
  return `ISS-${String(maxNum + 1).padStart(3, '0')}`
}

export function listIssues(): Issue[] {
  const dir = getIssuesDir()
  const files = readdirSync(dir).filter(f => f.endsWith('.json'))
  const issues: Issue[] = []
  for (const f of files) {
    try {
      const raw = readFileSync(join(dir, f), 'utf-8')
      issues.push(JSON.parse(raw) as Issue)
    } catch {
      // skip malformed files
    }
  }
  // Sort by createdAt desc (newest first)
  issues.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  return issues
}

export function getIssue(id: string): Issue | null {
  const filePath = join(getIssuesDir(), `${id}.json`)
  if (!existsSync(filePath)) return null
  try {
    return JSON.parse(readFileSync(filePath, 'utf-8')) as Issue
  } catch {
    return null
  }
}

export function createIssue(data: {
  title: string
  description?: string
  type?: IssueType
  priority?: IssuePriority
}): Issue {
  const id = nextId()
  const now = new Date().toISOString()
  const issue: Issue = {
    id,
    title: data.title,
    description: data.description || '',
    type: data.type || 'bug',
    priority: data.priority || 'P1',
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  }
  writeFileSync(join(getIssuesDir(), `${id}.json`), JSON.stringify(issue, null, 2), 'utf-8')
  return issue
}

export function updateIssue(id: string, updates: Partial<Omit<Issue, 'id' | 'createdAt'>>): Issue | null {
  const issue = getIssue(id)
  if (!issue) return null

  const updated: Issue = {
    ...issue,
    ...updates,
    id: issue.id, // prevent id overwrite
    createdAt: issue.createdAt, // prevent createdAt overwrite
    updatedAt: new Date().toISOString(),
  }
  writeFileSync(join(getIssuesDir(), `${id}.json`), JSON.stringify(updated, null, 2), 'utf-8')
  return updated
}

export function deleteIssue(id: string): boolean {
  const filePath = join(getIssuesDir(), `${id}.json`)
  if (!existsSync(filePath)) return false
  unlinkSync(filePath)
  return true
}

/**
 * session-manager.ts — Agent Session CRUD + JSON 文件持久化
 *
 * Sessions persist to workspace/agent-sessions/
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs'
import { join } from 'path'
import { config } from '../config.js'
import type { AgentSession, SessionStatus, WorkflowId } from '../types/index.js'

function ensureDir() {
  const dir = config.agentSessionsDir
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
  return dir
}

function sessionPath(id: string): string {
  return join(ensureDir(), `${id}.json`)
}

function generateId(): string {
  const ts = Date.now().toString(36)
  const rand = Math.random().toString(36).slice(2, 6)
  return `${ts}-${rand}`
}

/** Create a new session */
export function createSession(
  workflowId: WorkflowId,
  workflowName: string,
  params: Record<string, string>,
  maxIterations: number
): AgentSession {
  const session: AgentSession = {
    id: generateId(),
    workflowId,
    workflowName,
    status: 'running',
    params,
    messages: [],
    toolCalls: [],
    startedAt: new Date().toISOString(),
    iterations: 0,
    maxIterations,
  }

  saveSession(session)
  return session
}

/** Save session to disk */
export function saveSession(session: AgentSession): void {
  const filePath = sessionPath(session.id)
  writeFileSync(filePath, JSON.stringify(session, null, 2), 'utf-8')
}

/** Load session from disk */
export function loadSession(id: string): AgentSession | null {
  const filePath = sessionPath(id)
  if (!existsSync(filePath)) return null
  try {
    return JSON.parse(readFileSync(filePath, 'utf-8'))
  } catch {
    return null
  }
}

/** Update session status */
export function updateSessionStatus(
  id: string,
  status: SessionStatus,
  extra?: { result?: string; error?: string }
): AgentSession | null {
  const session = loadSession(id)
  if (!session) return null

  session.status = status
  if (status !== 'running') {
    session.completedAt = new Date().toISOString()
  }
  if (extra?.result) session.result = extra.result
  if (extra?.error) session.error = extra.error

  saveSession(session)
  return session
}

/** List sessions, newest first */
export function listSessions(options?: {
  status?: SessionStatus
  limit?: number
}): AgentSession[] {
  const dir = ensureDir()
  const files = readdirSync(dir).filter(f => f.endsWith('.json'))

  let sessions: AgentSession[] = []
  for (const file of files) {
    try {
      const s = JSON.parse(readFileSync(join(dir, file), 'utf-8')) as AgentSession
      sessions.push(s)
    } catch {
      // skip corrupt files
    }
  }

  // Sort newest first
  sessions.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())

  // Filter by status
  if (options?.status) {
    sessions = sessions.filter(s => s.status === options.status)
  }

  // Limit
  if (options?.limit) {
    sessions = sessions.slice(0, options.limit)
  }

  return sessions
}

/** Get the currently running session (if any) */
export function getRunningSession(): AgentSession | null {
  const running = listSessions({ status: 'running', limit: 1 })
  return running[0] || null
}

/**
 * Clean up stale "running" sessions on startup.
 * If the server restarts while a workflow is running, the session file
 * will still say "running" but the actual loop is gone. Mark them failed.
 */
export function cleanupStaleSessions(): number {
  const stale = listSessions({ status: 'running' })
  for (const session of stale) {
    console.log(`[session-manager] Cleaning up stale running session: ${session.id} (${session.workflowName})`)
    updateSessionStatus(session.id, 'failed', {
      error: 'Stale session: server restarted while workflow was running',
    })
  }
  return stale.length
}

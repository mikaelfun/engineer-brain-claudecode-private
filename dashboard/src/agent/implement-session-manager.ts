/**
 * implement-session-manager.ts — Issue implement session management
 *
 * Lightweight session manager for issue implementation progress tracking.
 * Provides:
 *   - Operation lock: prevents duplicate concurrent implements for same issue
 *   - In-memory message persistence: supports page-refresh recovery
 *   - Status tracking: active / completed / failed
 *
 * Modeled after case-session-manager.ts but simpler (read-only progress, no resume/chat).
 */

// ---- Types ----

export interface ImplementMessage {
  type: 'thinking' | 'tool-call' | 'tool-result' | 'completed' | 'failed' | 'started'
  content: string
  toolName?: string
  timestamp: string
}

interface ImplementSession {
  issueId: string
  trackId: string
  status: 'active' | 'completed' | 'failed'
  startedAt: string
  messages: ImplementMessage[]
}

// ---- Constants ----

const MAX_MESSAGES = 100

// ---- In-memory state ----

// issueId → session info (only one active implement per issue at a time)
const sessions = new Map<string, ImplementSession>()

// ---- Lock API ----

/**
 * Acquire an implement lock for an issue.
 * Returns true if lock acquired, false if already active.
 */
export function acquireImplementLock(issueId: string, trackId: string): boolean {
  const existing = sessions.get(issueId)
  if (existing && existing.status === 'active') {
    return false // Already running
  }
  sessions.set(issueId, {
    issueId,
    trackId,
    status: 'active',
    startedAt: new Date().toISOString(),
    messages: [],
  })
  return true
}

/**
 * Release the implement lock for an issue (mark as completed or failed).
 */
export function releaseImplementLock(issueId: string, status: 'completed' | 'failed'): void {
  const session = sessions.get(issueId)
  if (session) {
    session.status = status
  }
}

/**
 * Check if an issue has an active implement session.
 */
export function isImplementActive(issueId: string): boolean {
  const session = sessions.get(issueId)
  return session?.status === 'active'
}

// ---- Message persistence API ----

/**
 * Append a message to the implement session's message store.
 * Bounded to MAX_MESSAGES to prevent unbounded growth.
 */
export function appendImplementMessage(issueId: string, message: ImplementMessage): void {
  const session = sessions.get(issueId)
  if (!session) return
  session.messages.push(message)
  if (session.messages.length > MAX_MESSAGES) {
    session.messages = session.messages.slice(-MAX_MESSAGES)
  }
}

/**
 * Get all messages for an implement session (for page-refresh recovery).
 */
export function getImplementMessages(issueId: string): ImplementMessage[] {
  return sessions.get(issueId)?.messages || []
}

/**
 * Clear messages and session for an issue (optional cleanup).
 */
export function clearImplementSession(issueId: string): void {
  sessions.delete(issueId)
}

// ---- Status API ----

/**
 * Get full implement status for an issue (for the implement-status API).
 */
export function getImplementStatus(issueId: string): {
  active: boolean
  status: 'active' | 'completed' | 'failed' | 'none'
  messages: ImplementMessage[]
  trackId?: string
  startedAt?: string
} {
  const session = sessions.get(issueId)
  if (!session) {
    return { active: false, status: 'none', messages: [] }
  }
  return {
    active: session.status === 'active',
    status: session.status,
    messages: session.messages,
    trackId: session.trackId,
    startedAt: session.startedAt,
  }
}

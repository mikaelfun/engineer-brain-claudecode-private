/**
 * verify-session-manager.ts — Issue verify session management
 *
 * Lightweight session manager for issue verification progress tracking.
 * Provides:
 *   - Operation lock: prevents duplicate concurrent verifies for same issue
 *   - In-memory message persistence: supports page-refresh recovery
 *   - Status tracking: active / completed / failed
 *
 * Modeled after implement-session-manager.ts.
 */

// ---- Types ----

export interface VerifyMessage {
  type: 'thinking' | 'tool-call' | 'tool-result' | 'completed' | 'failed' | 'started'
  content: string
  toolName?: string
  timestamp: string
}

export interface VerifyResult {
  unitTest?: { passed: boolean; output: string }
  uiTest?: { passed: boolean; output: string }
  overall: boolean
}

interface VerifySession {
  issueId: string
  status: 'active' | 'completed' | 'failed'
  startedAt: string
  messages: VerifyMessage[]
  result?: VerifyResult
}

// ---- Constants ----

const MAX_MESSAGES = 100

// ---- In-memory state ----

// issueId → session info (only one active verify per issue at a time)
const sessions = new Map<string, VerifySession>()

// ---- Lock API ----

/**
 * Acquire a verify lock for an issue.
 * Returns true if lock acquired, false if already active.
 */
export function acquireVerifyLock(issueId: string): boolean {
  const existing = sessions.get(issueId)
  if (existing && existing.status === 'active') {
    return false // Already running
  }
  sessions.set(issueId, {
    issueId,
    status: 'active',
    startedAt: new Date().toISOString(),
    messages: [],
  })
  return true
}

/**
 * Release the verify lock for an issue (mark as completed or failed).
 */
export function releaseVerifyLock(issueId: string, status: 'completed' | 'failed', result?: VerifyResult): void {
  const session = sessions.get(issueId)
  if (session) {
    session.status = status
    if (result) {
      session.result = result
    }
  }
}

/**
 * Check if an issue has an active verify session.
 */
export function isVerifyActive(issueId: string): boolean {
  const session = sessions.get(issueId)
  return session?.status === 'active'
}

// ---- Message persistence API ----

/**
 * Append a message to the verify session's message store.
 * Bounded to MAX_MESSAGES to prevent unbounded growth.
 */
export function appendVerifyMessage(issueId: string, message: VerifyMessage): void {
  const session = sessions.get(issueId)
  if (!session) return
  session.messages.push(message)
  if (session.messages.length > MAX_MESSAGES) {
    session.messages = session.messages.slice(-MAX_MESSAGES)
  }
}

/**
 * Get all messages for a verify session (for page-refresh recovery).
 */
export function getVerifyMessages(issueId: string): VerifyMessage[] {
  return sessions.get(issueId)?.messages || []
}

/**
 * Clear messages and session for an issue (optional cleanup).
 */
export function clearVerifySession(issueId: string): void {
  sessions.delete(issueId)
}

// ---- Status API ----

/**
 * Get full verify status for an issue (for the verify-status API).
 */
export function getVerifyStatus(issueId: string): {
  active: boolean
  status: 'active' | 'completed' | 'failed' | 'none'
  messages: VerifyMessage[]
  result?: VerifyResult
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
    result: session.result,
    startedAt: session.startedAt,
  }
}

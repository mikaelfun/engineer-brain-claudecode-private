/**
 * issue-track-state.ts — In-memory cache of track creation progress messages
 *
 * Used to support page-refresh recovery: when a user refreshes while a track
 * creation is in progress, the frontend can GET /api/issues/:id/track-progress
 * to recover the message stream.
 *
 * Data is ephemeral — lost on server restart. That's acceptable because
 * the underlying issue status (tracking/tracked/pending) is persisted in JSON files.
 */

export interface IssueTrackQuestion {
  question: string
  header?: string
  options?: Array<{ label: string; description?: string }>
  multiSelect?: boolean
}

export interface IssueTrackMessage {
  kind: 'started' | 'thinking' | 'tool-call' | 'completed' | 'error' | 'question'
  content?: string
  toolName?: string
  trackId?: string
  planSummary?: string
  error?: string
  questions?: IssueTrackQuestion[]
  sessionId?: string
  timestamp: string
}

interface PendingQuestion {
  sessionId: string
  questions: IssueTrackQuestion[]
  askedAt: string
}

interface TrackState {
  messages: IssueTrackMessage[]
  isActive: boolean
  pendingQuestion?: PendingQuestion | null
  cancelled?: boolean
}

const MAX_MESSAGES = 100

class IssueTrackStateManager {
  private states = new Map<string, TrackState>()

  /** Initialize tracking state for an issue (called on track-started) */
  start(issueId: string): void {
    this.states.set(issueId, { messages: [], isActive: true })
  }

  /** Add a progress message (capped at MAX_MESSAGES) */
  addMessage(issueId: string, msg: IssueTrackMessage): void {
    const state = this.states.get(issueId)
    if (!state) {
      // Auto-initialize if needed (e.g. server restarted mid-track)
      this.states.set(issueId, { messages: [msg], isActive: true })
      return
    }
    state.messages.push(msg)
    if (state.messages.length > MAX_MESSAGES) {
      state.messages = state.messages.slice(-MAX_MESSAGES)
    }
  }

  /** Mark tracking as finished (completed or error) */
  finish(issueId: string): void {
    const state = this.states.get(issueId)
    if (state) {
      state.isActive = false
    }
  }

  /** Get current state for an issue (for the track-progress API) */
  getState(issueId: string): TrackState | null {
    return this.states.get(issueId) || null
  }

  /** Check if an issue is actively being tracked */
  isActive(issueId: string): boolean {
    return this.states.get(issueId)?.isActive ?? false
  }

  /** Store a pending question (agent asked AskUserQuestion, waiting for user answer) */
  setPendingQuestion(issueId: string, sessionId: string, questions: IssueTrackQuestion[]): void {
    const state = this.states.get(issueId)
    if (state) {
      state.pendingQuestion = { sessionId, questions, askedAt: new Date().toISOString() }
    }
  }

  /** Get the pending question for an issue */
  getPendingQuestion(issueId: string): PendingQuestion | null {
    return this.states.get(issueId)?.pendingQuestion ?? null
  }

  /** Clear pending question (after user answers) */
  clearPendingQuestion(issueId: string): void {
    const state = this.states.get(issueId)
    if (state) {
      state.pendingQuestion = null
    }
  }

  /** Clear state for an issue (optional cleanup) */
  clear(issueId: string): void {
    this.states.delete(issueId)
  }

  /** Mark tracking as cancelled — agent output will be discarded */
  cancel(issueId: string): void {
    const state = this.states.get(issueId)
    if (state) {
      state.cancelled = true
      state.isActive = false
      state.pendingQuestion = null
    }
  }

  /** Check if an issue's tracking was cancelled */
  isCancelled(issueId: string): boolean {
    return this.states.get(issueId)?.cancelled ?? false
  }

  /** Get all track states (for unified session view) */
  getAll(): Array<{
    issueId: string
    isActive: boolean
    messageCount: number
    hasPendingQuestion: boolean
    startedAt?: string
  }> {
    return Array.from(this.states.entries()).map(([issueId, state]) => ({
      issueId,
      isActive: state.isActive,
      messageCount: state.messages.length,
      hasPendingQuestion: !!state.pendingQuestion,
      startedAt: state.messages[0]?.timestamp,
    }))
  }
}

export const issueTrackState = new IssueTrackStateManager()

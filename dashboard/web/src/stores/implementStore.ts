/**
 * implementStore.ts — Zustand store for issue implementation progress
 *
 * Populated by SSE events (issue-implement-started, issue-implement-progress,
 * issue-implement-completed, issue-implement-error).
 * Consumed by ImplementPanel for live progress display.
 */
import { create } from 'zustand'

export interface ImplementMessage {
  type: 'started' | 'thinking' | 'tool-call' | 'tool-result' | 'completed' | 'failed'
  content: string
  toolName?: string
  timestamp: string
}

interface ImplementSession {
  status: 'active' | 'completed' | 'failed'
  trackId: string
  messages: ImplementMessage[]
  startedAt: string
}

interface ImplementStoreState {
  /** Per-issue implement sessions, keyed by issueId */
  sessions: Record<string, ImplementSession>

  /** Start a new implement session */
  startSession: (issueId: string, trackId: string) => void
  /** Add a message for a specific issue */
  addMessage: (issueId: string, msg: ImplementMessage) => void
  /** Set session status */
  setStatus: (issueId: string, status: 'active' | 'completed' | 'failed') => void
  /** Clear session for a specific issue */
  clearSession: (issueId: string) => void
  /** Bulk-load session data (for page refresh recovery) */
  loadSession: (issueId: string, data: {
    status: 'active' | 'completed' | 'failed'
    trackId: string
    messages: ImplementMessage[]
    startedAt: string
  }) => void
}

const MAX_MESSAGES = 100

// Stable empty session to avoid re-render loops
export const EMPTY_IMPLEMENT_SESSION: ImplementSession | undefined = undefined

export const useImplementStore = create<ImplementStoreState>()((set) => ({
  sessions: {},

  startSession: (issueId, trackId) =>
    set((state) => ({
      sessions: {
        ...state.sessions,
        [issueId]: {
          status: 'active',
          trackId,
          messages: [],
          startedAt: new Date().toISOString(),
        },
      },
    })),

  addMessage: (issueId, msg) =>
    set((state) => {
      const session = state.sessions[issueId]
      if (!session) return state
      const updated = [...session.messages, msg].slice(-MAX_MESSAGES)
      return {
        sessions: {
          ...state.sessions,
          [issueId]: { ...session, messages: updated },
        },
      }
    }),

  setStatus: (issueId, status) =>
    set((state) => {
      const session = state.sessions[issueId]
      if (!session) return state
      return {
        sessions: {
          ...state.sessions,
          [issueId]: { ...session, status },
        },
      }
    }),

  clearSession: (issueId) =>
    set((state) => {
      const next = { ...state.sessions }
      delete next[issueId]
      return { sessions: next }
    }),

  loadSession: (issueId, data) =>
    set((state) => ({
      sessions: {
        ...state.sessions,
        [issueId]: {
          status: data.status,
          trackId: data.trackId,
          messages: data.messages.slice(-MAX_MESSAGES),
          startedAt: data.startedAt,
        },
      },
    })),
}))

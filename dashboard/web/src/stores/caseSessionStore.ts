/**
 * caseSessionStore.ts — Zustand store for real-time case session messages
 *
 * Updated by SSE events (case-session-thinking, case-session-tool-call,
 * case-session-tool-result, case-session-completed, case-session-failed).
 * Consumed by CaseAIPanel to display live AI activity.
 *
 * Two keying strategies:
 * - `messages[caseNumber]` — backward-compatible, aggregates all messages for a case
 * - `sessionMessages[caseNumber:sessionId]` — per-session messages for multi-tab switching
 */
import { create } from 'zustand'

export interface CaseSessionMessage {
  type: 'thinking' | 'tool-call' | 'tool-result' | 'completed' | 'failed' | 'user' | 'system' | 'queued'
  content: string
  toolName?: string
  step?: string
  timestamp: string
}

interface CaseSessionStoreState {
  /** Per-case message streams, keyed by caseNumber */
  messages: Record<string, CaseSessionMessage[]>
  /** Per-session message streams, keyed by `${caseNumber}:${sessionId}` */
  sessionMessages: Record<string, CaseSessionMessage[]>

  /** Add a message for a specific case (backward compat) */
  addMessage: (caseNumber: string, message: CaseSessionMessage) => void
  /** Clear messages for a specific case */
  clearMessages: (caseNumber: string) => void
  /** Add a message to a specific session */
  addSessionMessage: (caseNumber: string, sessionId: string, message: CaseSessionMessage) => void
  /** Get messages for a specific session */
  getSessionMessages: (caseNumber: string, sessionId: string) => CaseSessionMessage[]
  /** Clear messages for a specific session */
  clearSessionMessages: (caseNumber: string, sessionId: string) => void
}

const MAX_MESSAGES_PER_CASE = 100

export const useCaseSessionStore = create<CaseSessionStoreState>()((set, get) => ({
  messages: {},
  sessionMessages: {},

  addMessage: (caseNumber, message) =>
    set((state) => {
      const existing = state.messages[caseNumber] || []
      // Keep last N messages to avoid unbounded growth
      const updated = [...existing, message].slice(-MAX_MESSAGES_PER_CASE)
      return { messages: { ...state.messages, [caseNumber]: updated } }
    }),

  clearMessages: (caseNumber) =>
    set((state) => {
      const next = { ...state.messages }
      delete next[caseNumber]
      return { messages: next }
    }),

  addSessionMessage: (caseNumber, sessionId, message) =>
    set((state) => {
      const key = `${caseNumber}:${sessionId}`
      const existing = state.sessionMessages[key] || []
      const updated = [...existing, message].slice(-MAX_MESSAGES_PER_CASE)
      return { sessionMessages: { ...state.sessionMessages, [key]: updated } }
    }),

  getSessionMessages: (caseNumber, sessionId) => {
    const key = `${caseNumber}:${sessionId}`
    return get().sessionMessages[key] || []
  },

  clearSessionMessages: (caseNumber, sessionId) =>
    set((state) => {
      const key = `${caseNumber}:${sessionId}`
      const next = { ...state.sessionMessages }
      delete next[key]
      return { sessionMessages: next }
    }),
}))

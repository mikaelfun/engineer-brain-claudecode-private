/**
 * caseSessionStore.ts — Zustand store for real-time case session messages
 *
 * Updated by SSE events (case-session-thinking, case-session-tool-call,
 * case-session-tool-result, case-session-completed, case-session-failed).
 * Consumed by CaseAIPanel to display live AI activity.
 */
import { create } from 'zustand'

export interface CaseSessionMessage {
  type: 'thinking' | 'tool-call' | 'tool-result' | 'completed' | 'failed' | 'user' | 'system'
  content: string
  toolName?: string
  step?: string
  timestamp: string
}

interface CaseSessionStoreState {
  /** Per-case message streams, keyed by caseNumber */
  messages: Record<string, CaseSessionMessage[]>

  /** Add a message for a specific case */
  addMessage: (caseNumber: string, message: CaseSessionMessage) => void
  /** Clear messages for a specific case */
  clearMessages: (caseNumber: string) => void
}

const MAX_MESSAGES_PER_CASE = 100

export const useCaseSessionStore = create<CaseSessionStoreState>()((set) => ({
  messages: {},

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
}))

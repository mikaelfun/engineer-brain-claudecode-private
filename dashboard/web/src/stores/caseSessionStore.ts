/**
 * caseSessionStore.ts — Zustand store for real-time case session messages
 *
 * Updated by SSE events (case-step-started, case-step-progress,
 * case-step-question, case-step-completed, case-step-failed).
 * Consumed by CaseAIPanel and AgentMonitor to display live AI activity.
 *
 * Two keying strategies:
 * - `messages[caseNumber]` — aggregates all messages for a case (unified timeline)
 * - `sessionMessages[caseNumber:sessionId]` — per-session messages for multi-tab switching
 *
 * Also tracks:
 * - `pendingQuestions` — per-case pending AskUserQuestion (waiting for user input)
 * - `sessionStatus` — per-case session status for disable/active logic
 * - `activeSessionId` — per-case active session ID (from SSE events)
 * - `currentStep` — per-case current step name
 */
import { create } from 'zustand'
import type { StepQuestion } from '../components/session/StepQuestionForm'

export interface CaseSessionMessage {
  type: 'thinking' | 'tool-call' | 'tool-result' | 'completed' | 'failed' | 'user' | 'system' | 'queued'
  content: string
  toolName?: string
  step?: string
  timestamp: string
}

export type SessionStatus = 'idle' | 'active' | 'waiting-input' | 'completed' | 'failed'

export interface PendingQuestion {
  sessionId: string
  questions: StepQuestion[]
}

interface CaseSessionStoreState {
  /** Per-case message streams, keyed by caseNumber */
  messages: Record<string, CaseSessionMessage[]>
  /** Per-session message streams, keyed by `${caseNumber}:${sessionId}` */
  sessionMessages: Record<string, CaseSessionMessage[]>
  /** Per-case pending questions, keyed by caseNumber */
  pendingQuestions: Record<string, PendingQuestion>
  /** Per-case session status, keyed by caseNumber */
  sessionStatus: Record<string, SessionStatus>
  /** Per-case active session ID (latest started session) */
  activeSessionId: Record<string, string>
  /** Per-case current step name */
  currentStep: Record<string, string>

  /** Add a message for a specific case (unified timeline) */
  addMessage: (caseNumber: string, message: CaseSessionMessage) => void
  /** Clear messages for a specific case */
  clearMessages: (caseNumber: string) => void
  /** Add a message to a specific session */
  addSessionMessage: (caseNumber: string, sessionId: string, message: CaseSessionMessage) => void
  /** Get messages for a specific session */
  getSessionMessages: (caseNumber: string, sessionId: string) => CaseSessionMessage[]
  /** Clear messages for a specific session */
  clearSessionMessages: (caseNumber: string, sessionId: string) => void

  /** Set a pending question for a case */
  setPendingQuestion: (caseNumber: string, sessionId: string, questions: StepQuestion[]) => void
  /** Clear a pending question for a case */
  clearPendingQuestion: (caseNumber: string) => void
  /** Get the pending question for a case */
  getPendingQuestion: (caseNumber: string) => PendingQuestion | undefined

  /** Set session status for a case */
  setSessionStatus: (caseNumber: string, status: SessionStatus) => void
  /** Get session status for a case */
  getSessionStatus: (caseNumber: string) => SessionStatus

  /** Set active session ID for a case */
  setActiveSessionId: (caseNumber: string, sessionId: string) => void
  /** Set current step name for a case */
  setCurrentStep: (caseNumber: string, step: string) => void

  /** Clear all state for a case */
  clearAll: (caseNumber: string) => void
}

const MAX_MESSAGES_PER_CASE = 200

export const useCaseSessionStore = create<CaseSessionStoreState>()((set, get) => ({
  messages: {},
  sessionMessages: {},
  pendingQuestions: {},
  sessionStatus: {},
  activeSessionId: {},
  currentStep: {},

  addMessage: (caseNumber, message) =>
    set((state) => {
      const existing = state.messages[caseNumber] || []
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

  // ---- Pending Questions ----
  setPendingQuestion: (caseNumber, sessionId, questions) =>
    set((state) => ({
      pendingQuestions: {
        ...state.pendingQuestions,
        [caseNumber]: { sessionId, questions },
      },
    })),

  clearPendingQuestion: (caseNumber) =>
    set((state) => {
      const next = { ...state.pendingQuestions }
      delete next[caseNumber]
      return { pendingQuestions: next }
    }),

  getPendingQuestion: (caseNumber) => get().pendingQuestions[caseNumber],

  // ---- Session Status ----
  setSessionStatus: (caseNumber, status) =>
    set((state) => ({
      sessionStatus: { ...state.sessionStatus, [caseNumber]: status },
    })),

  getSessionStatus: (caseNumber) => get().sessionStatus[caseNumber] || 'idle',

  // ---- Active Session & Step ----
  setActiveSessionId: (caseNumber, sessionId) =>
    set((state) => ({
      activeSessionId: { ...state.activeSessionId, [caseNumber]: sessionId },
    })),

  setCurrentStep: (caseNumber, step) =>
    set((state) => ({
      currentStep: { ...state.currentStep, [caseNumber]: step },
    })),

  // ---- Cleanup ----
  clearAll: (caseNumber) =>
    set((state) => {
      const msgs = { ...state.messages }
      delete msgs[caseNumber]

      // Clear all session messages for this case
      const sessMsgs = { ...state.sessionMessages }
      const prefix = `${caseNumber}:`
      for (const key of Object.keys(sessMsgs)) {
        if (key.startsWith(prefix)) delete sessMsgs[key]
      }

      const pq = { ...state.pendingQuestions }
      delete pq[caseNumber]

      const ss = { ...state.sessionStatus }
      delete ss[caseNumber]

      const asid = { ...state.activeSessionId }
      delete asid[caseNumber]

      const cs = { ...state.currentStep }
      delete cs[caseNumber]

      return {
        messages: msgs,
        sessionMessages: sessMsgs,
        pendingQuestions: pq,
        sessionStatus: ss,
        activeSessionId: asid,
        currentStep: cs,
      }
    }),
}))

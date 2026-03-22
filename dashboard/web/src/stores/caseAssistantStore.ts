/**
 * caseAssistantStore.ts — Zustand store for case AI assistant step progress
 *
 * Modeled after issueTrackStore.ts, providing:
 *   - Per-case semantic message streams (started/thinking/tool-call/completed/error/question)
 *   - Step execution status (idle/active/waiting-input/completed/failed)
 *   - Pending question state for AskUserQuestion interception
 *   - Current step name tracking
 *   - Page-refresh recovery via loadMessages
 *
 * Populated by SSE events:
 *   case-step-started → setStatus(active) + addMessage(started)
 *   case-step-progress → addMessage(thinking/tool-call)
 *   case-step-question → setPendingQuestion + addMessage(question)
 *   case-step-completed → setStatus(completed) + addMessage(completed)
 *   case-step-failed → setStatus(failed) + addMessage(error)
 *
 * Consumed by CaseAIPanel for state-driven UI.
 */
import { create } from 'zustand'

export interface CaseStepQuestion {
  question: string
  header?: string
  options?: Array<{ label: string; description?: string }>
  multiSelect?: boolean
}

export interface CaseStepMessage {
  kind: 'started' | 'thinking' | 'tool-call' | 'completed' | 'error' | 'question'
  content?: string
  toolName?: string
  step?: string
  error?: string
  questions?: CaseStepQuestion[]
  sessionId?: string
  timestamp: string
}

export type CaseStepStatus = 'idle' | 'active' | 'waiting-input' | 'completed' | 'failed'

interface PendingQuestion {
  sessionId: string
  questions: CaseStepQuestion[]
}

interface CaseAssistantStoreState {
  /** Per-case message streams, keyed by caseNumber */
  messages: Record<string, CaseStepMessage[]>
  /** Per-case step execution status */
  status: Record<string, CaseStepStatus>
  /** Per-case pending questions waiting for user answer */
  pendingQuestions: Record<string, PendingQuestion>
  /** Per-case current step name */
  currentStep: Record<string, string>

  /** Add a message for a specific case */
  addMessage: (caseNumber: string, msg: CaseStepMessage) => void
  /** Set step status for a case */
  setStatus: (caseNumber: string, status: CaseStepStatus) => void
  /** Set current step name for a case */
  setCurrentStep: (caseNumber: string, step: string) => void
  /** Set a pending question for a case */
  setPendingQuestion: (caseNumber: string, sessionId: string, questions: CaseStepQuestion[]) => void
  /** Clear a pending question for a case (after user answers) */
  clearPendingQuestion: (caseNumber: string) => void
  /** Bulk-load messages (for page refresh recovery) */
  loadMessages: (caseNumber: string, msgs: CaseStepMessage[], status: CaseStepStatus, currentStep?: string, pendingQuestion?: PendingQuestion | null) => void
  /** Clear all state for a case */
  clearAll: (caseNumber: string) => void
}

const MAX_MESSAGES = 100

// Stable empty array to avoid Zustand infinite re-render
export const EMPTY_STEP_MESSAGES: CaseStepMessage[] = []

export const useCaseAssistantStore = create<CaseAssistantStoreState>()((set) => ({
  messages: {},
  status: {},
  pendingQuestions: {},
  currentStep: {},

  addMessage: (caseNumber, msg) =>
    set((state) => {
      const existing = state.messages[caseNumber] || []
      const updated = [...existing, msg].slice(-MAX_MESSAGES)
      return { messages: { ...state.messages, [caseNumber]: updated } }
    }),

  setStatus: (caseNumber, status) =>
    set((state) => ({
      status: { ...state.status, [caseNumber]: status },
    })),

  setCurrentStep: (caseNumber, step) =>
    set((state) => ({
      currentStep: { ...state.currentStep, [caseNumber]: step },
    })),

  setPendingQuestion: (caseNumber, sessionId, questions) =>
    set((state) => ({
      pendingQuestions: { ...state.pendingQuestions, [caseNumber]: { sessionId, questions } },
      status: { ...state.status, [caseNumber]: 'waiting-input' },
    })),

  clearPendingQuestion: (caseNumber) =>
    set((state) => {
      const next = { ...state.pendingQuestions }
      delete next[caseNumber]
      return {
        pendingQuestions: next,
        // Set status back to active (processing the answer)
        status: { ...state.status, [caseNumber]: 'active' },
      }
    }),

  loadMessages: (caseNumber, msgs, status, currentStep, pendingQuestion) =>
    set((state) => ({
      messages: { ...state.messages, [caseNumber]: msgs.slice(-MAX_MESSAGES) },
      status: { ...state.status, [caseNumber]: status },
      ...(currentStep ? { currentStep: { ...state.currentStep, [caseNumber]: currentStep } } : {}),
      ...(pendingQuestion
        ? { pendingQuestions: { ...state.pendingQuestions, [caseNumber]: pendingQuestion } }
        : {}),
    })),

  clearAll: (caseNumber) =>
    set((state) => {
      const nextMessages = { ...state.messages }
      delete nextMessages[caseNumber]
      const nextStatus = { ...state.status }
      delete nextStatus[caseNumber]
      const nextPending = { ...state.pendingQuestions }
      delete nextPending[caseNumber]
      const nextStep = { ...state.currentStep }
      delete nextStep[caseNumber]
      return {
        messages: nextMessages,
        status: nextStatus,
        pendingQuestions: nextPending,
        currentStep: nextStep,
      }
    }),
}))

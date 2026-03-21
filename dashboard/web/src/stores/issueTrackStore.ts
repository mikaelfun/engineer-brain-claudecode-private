/**
 * issueTrackStore.ts — Zustand store for issue track creation + implement + verify progress
 *
 * Track creation: Populated by SSE events (issue-track-started, issue-track-progress,
 * issue-track-completed, issue-track-error).
 * Consumed by TrackProgressPanel for live progress display.
 *
 * Implement: Populated by SSE events (issue-implement-started, issue-implement-progress,
 * issue-implement-completed, issue-implement-error).
 * Consumed by ImplementPanel for live progress display.
 *
 * Verify: Populated by SSE events (issue-verify-started, issue-verify-progress,
 * issue-verify-completed, issue-verify-error).
 * Consumed by VerifyProgressPanel for inline verify display.
 */
import { create } from 'zustand'

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

export interface ImplementMessage {
  kind: 'started' | 'thinking' | 'tool-call' | 'tool-result' | 'completed' | 'failed'
  content?: string
  toolName?: string
  timestamp: string
}

export interface VerifyMessage {
  kind: 'started' | 'thinking' | 'tool-call' | 'tool-result' | 'completed' | 'error'
  content?: string
  toolName?: string
  timestamp: string
}

export interface VerifyResult {
  unitTest?: { passed: boolean; output: string }
  uiTest?: { passed: boolean; output: string }
  overall: boolean
}

interface PendingQuestion {
  sessionId: string
  questions: IssueTrackQuestion[]
}

interface IssueTrackStoreState {
  /** Per-issue message streams, keyed by issueId */
  messages: Record<string, IssueTrackMessage[]>
  /** Set of issueIds currently being tracked */
  activeTracking: Record<string, boolean>
  /** Pending questions waiting for user answer, keyed by issueId */
  pendingQuestions: Record<string, PendingQuestion>
  /** Optimistic local flag: issue has just started create-track (ISS-029) */
  trackingIssues: Record<string, boolean>

  // ---- Implement state ----
  /** Per-issue implement message streams */
  implementMessages: Record<string, ImplementMessage[]>
  /** Per-issue implement status */
  implementStatus: Record<string, 'active' | 'completed' | 'failed'>
  /** Per-issue implement trackId */
  implementTrackId: Record<string, string>

  // ---- Verify state ----
  /** Per-issue verify message streams */
  verifyMessages: Record<string, VerifyMessage[]>
  /** Set of issueIds currently being verified */
  activeVerify: Record<string, boolean>
  /** Verify result per issue (populated on completion) */
  verifyResult: Record<string, VerifyResult>

  /** Add a message for a specific issue */
  addMessage: (issueId: string, msg: IssueTrackMessage) => void
  /** Set tracking active/inactive for an issue */
  setTrackingActive: (issueId: string, active: boolean) => void
  /** Clear messages for a specific issue */
  clearMessages: (issueId: string) => void
  /** Bulk-load messages (for page refresh recovery) */
  loadMessages: (issueId: string, msgs: IssueTrackMessage[], isActive: boolean) => void
  /** Set a pending question for an issue */
  setPendingQuestion: (issueId: string, sessionId: string, questions: IssueTrackQuestion[]) => void
  /** Clear a pending question for an issue (after user answers) */
  clearPendingQuestion: (issueId: string) => void
  /** Set optimistic tracking flag for an issue (ISS-029) */
  setIssueTracking: (issueId: string, active: boolean) => void

  // ---- Implement actions ----
  /** Start an implement session */
  startImplement: (issueId: string, trackId: string) => void
  /** Add an implement message for a specific issue */
  addImplementMessage: (issueId: string, msg: ImplementMessage) => void
  /** Set implement status */
  setImplementStatus: (issueId: string, status: 'active' | 'completed' | 'failed') => void
  /** Clear implement state for an issue */
  clearImplement: (issueId: string) => void
  /** Bulk-load implement messages (for page refresh recovery) */
  loadImplementMessages: (issueId: string, msgs: ImplementMessage[], status: 'active' | 'completed' | 'failed', trackId: string) => void

  // ---- Verify actions ----
  /** Add a verify message for a specific issue */
  addVerifyMessage: (issueId: string, msg: VerifyMessage) => void
  /** Set verify active/inactive for an issue */
  setVerifyActive: (issueId: string, active: boolean) => void
  /** Set verify result for an issue */
  setVerifyResult: (issueId: string, result: VerifyResult) => void
  /** Clear verify state for an issue */
  clearVerify: (issueId: string) => void
  /** Bulk-load verify messages (for page refresh recovery) */
  loadVerifyMessages: (issueId: string, msgs: VerifyMessage[], isActive: boolean, result?: VerifyResult) => void
}

const MAX_MESSAGES = 100

// Stable empty array to avoid Zustand infinite re-render
export const EMPTY_TRACK_MESSAGES: IssueTrackMessage[] = []
export const EMPTY_IMPLEMENT_MESSAGES: ImplementMessage[] = []
export const EMPTY_VERIFY_MESSAGES: VerifyMessage[] = []

export const useIssueTrackStore = create<IssueTrackStoreState>()((set) => ({
  messages: {},
  activeTracking: {},
  pendingQuestions: {},
  trackingIssues: {},
  implementMessages: {},
  implementStatus: {},
  implementTrackId: {},
  verifyMessages: {},
  activeVerify: {},
  verifyResult: {},

  addMessage: (issueId, msg) =>
    set((state) => {
      const existing = state.messages[issueId] || []
      const updated = [...existing, msg].slice(-MAX_MESSAGES)
      return { messages: { ...state.messages, [issueId]: updated } }
    }),

  setTrackingActive: (issueId, active) =>
    set((state) => ({
      activeTracking: { ...state.activeTracking, [issueId]: active },
    })),

  clearMessages: (issueId) =>
    set((state) => {
      const nextMessages = { ...state.messages }
      delete nextMessages[issueId]
      const nextActive = { ...state.activeTracking }
      delete nextActive[issueId]
      const nextPending = { ...state.pendingQuestions }
      delete nextPending[issueId]
      const nextTracking = { ...state.trackingIssues }
      delete nextTracking[issueId]
      return { messages: nextMessages, activeTracking: nextActive, pendingQuestions: nextPending, trackingIssues: nextTracking }
    }),

  loadMessages: (issueId, msgs, isActive) =>
    set((state) => ({
      messages: { ...state.messages, [issueId]: msgs.slice(-MAX_MESSAGES) },
      activeTracking: { ...state.activeTracking, [issueId]: isActive },
    })),

  setPendingQuestion: (issueId, sessionId, questions) =>
    set((state) => ({
      pendingQuestions: { ...state.pendingQuestions, [issueId]: { sessionId, questions } },
    })),

  clearPendingQuestion: (issueId) =>
    set((state) => {
      const next = { ...state.pendingQuestions }
      delete next[issueId]
      return { pendingQuestions: next }
    }),

  setIssueTracking: (issueId, active) =>
    set((state) => ({
      trackingIssues: { ...state.trackingIssues, [issueId]: active },
    })),

  // ---- Implement actions ----

  startImplement: (issueId, trackId) =>
    set((state) => ({
      implementMessages: { ...state.implementMessages, [issueId]: [] },
      implementStatus: { ...state.implementStatus, [issueId]: 'active' },
      implementTrackId: { ...state.implementTrackId, [issueId]: trackId },
    })),

  addImplementMessage: (issueId, msg) =>
    set((state) => {
      const existing = state.implementMessages[issueId] || []
      const updated = [...existing, msg].slice(-MAX_MESSAGES)
      return { implementMessages: { ...state.implementMessages, [issueId]: updated } }
    }),

  setImplementStatus: (issueId, status) =>
    set((state) => ({
      implementStatus: { ...state.implementStatus, [issueId]: status },
    })),

  clearImplement: (issueId) =>
    set((state) => {
      const nextMsgs = { ...state.implementMessages }
      delete nextMsgs[issueId]
      const nextStatus = { ...state.implementStatus }
      delete nextStatus[issueId]
      const nextTrackId = { ...state.implementTrackId }
      delete nextTrackId[issueId]
      return { implementMessages: nextMsgs, implementStatus: nextStatus, implementTrackId: nextTrackId }
    }),

  loadImplementMessages: (issueId, msgs, status, trackId) =>
    set((state) => ({
      implementMessages: { ...state.implementMessages, [issueId]: msgs.slice(-MAX_MESSAGES) },
      implementStatus: { ...state.implementStatus, [issueId]: status },
      implementTrackId: { ...state.implementTrackId, [issueId]: trackId },
    })),

  // ---- Verify actions ----

  addVerifyMessage: (issueId, msg) =>
    set((state) => {
      const existing = state.verifyMessages[issueId] || []
      const updated = [...existing, msg].slice(-MAX_MESSAGES)
      return { verifyMessages: { ...state.verifyMessages, [issueId]: updated } }
    }),

  setVerifyActive: (issueId, active) =>
    set((state) => ({
      activeVerify: { ...state.activeVerify, [issueId]: active },
    })),

  setVerifyResult: (issueId, result) =>
    set((state) => ({
      verifyResult: { ...state.verifyResult, [issueId]: result },
    })),

  clearVerify: (issueId) =>
    set((state) => {
      const nextMsgs = { ...state.verifyMessages }
      delete nextMsgs[issueId]
      const nextActive = { ...state.activeVerify }
      delete nextActive[issueId]
      const nextResult = { ...state.verifyResult }
      delete nextResult[issueId]
      return { verifyMessages: nextMsgs, activeVerify: nextActive, verifyResult: nextResult }
    }),

  loadVerifyMessages: (issueId, msgs, isActive, result) =>
    set((state) => ({
      verifyMessages: { ...state.verifyMessages, [issueId]: msgs.slice(-MAX_MESSAGES) },
      activeVerify: { ...state.activeVerify, [issueId]: isActive },
      ...(result ? { verifyResult: { ...state.verifyResult, [issueId]: result } } : {}),
    })),
}))

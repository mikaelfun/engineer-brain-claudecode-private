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

/** Pipeline step status for casework visualization */
export type PipelineStepStatus = 'pending' | 'active' | 'completed' | 'failed' | 'skipped'

export interface PipelineStepState {
  id: string
  label: string
  status: PipelineStepStatus
  startedAt?: string
  completedAt?: string
  durationMs?: number
}

export interface AgentSpawnState {
  id: string
  label: string
  status: 'idle' | 'running' | 'completed' | 'timeout' | 'failed'
  durationMs?: number
}

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
  /** Per-case last heartbeat timestamp for stall detection */
  lastHeartbeatAt: Record<string, string>
  /** Global SDK queue status (null = unknown) */
  queueStatus: {
    isQueued: boolean
    currentLabel: string | null
    queueLength: number
    queueLabels: string[]
  } | null

  /** Per-case pipeline steps for casework visualization */
  pipelineSteps: Record<string, PipelineStepState[]>
  /** Per-case agent spawn tracking */
  agentSpawns: Record<string, AgentSpawnState[]>

  /** Add a message for a specific case (unified timeline) */
  addMessage: (caseNumber: string, message: CaseSessionMessage) => void
  /** Clear messages for a specific case */
  clearMessages: (caseNumber: string) => void
  /** Clear only messages for a specific step within a case (other steps' messages preserved) */
  clearStepMessages: (caseNumber: string, step: string) => void
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

  /** Set last heartbeat timestamp for a case (stall detection) */
  setLastHeartbeatAt: (caseNumber: string, timestamp: string) => void
  /** Set global SDK queue status */
  setQueueStatus: (status: CaseSessionStoreState['queueStatus']) => void

  /** Initialize pipeline steps for a case (from casework start event) */
  initPipelineSteps: (caseNumber: string, steps: Array<{ id: string; label: string; status: PipelineStepStatus }>) => void
  /** Update a single pipeline step status */
  updatePipelineStep: (caseNumber: string, stepId: string, status: PipelineStepStatus, durationMs?: number) => void
  /** Get pipeline steps for a case */
  getPipelineSteps: (caseNumber: string) => PipelineStepState[]
  /** Clear pipeline steps for a case */
  clearPipelineSteps: (caseNumber: string) => void

  /** Initialize agent spawns for a case */
  initAgentSpawns: (caseNumber: string, spawns: Array<{ id: string; label: string; status: string }>) => void
  /** Update an agent spawn status */
  updateAgentSpawn: (caseNumber: string, agentId: string, status: AgentSpawnState['status'], durationMs?: number) => void
  /** Get agent spawns for a case */
  getAgentSpawns: (caseNumber: string) => AgentSpawnState[]

  /** Clear all state for a case */
  clearAll: (caseNumber: string) => void
}

const MAX_MESSAGES_PER_CASE = 200

/**
 * De-duplication check: skip if the last N messages contain the same type+content.
 * This prevents duplicate messages caused by:
 * - Backend emitting overlapping SSE events (e.g. case-step-completed + case-session-completed)
 * - Multiple CaseAIPanel instances hydrating recovery data into the same store
 * - Race conditions between live SSE and recovery fetch
 */
const DEDUP_WINDOW = 5
function isDuplicateMessage(existing: CaseSessionMessage[], newMsg: CaseSessionMessage): boolean {
  const tail = existing.slice(-DEDUP_WINDOW)
  return tail.some(m => m.type === newMsg.type && m.content === newMsg.content)
}

export const useCaseSessionStore = create<CaseSessionStoreState>()((set, get) => ({
  messages: {},
  sessionMessages: {},
  pendingQuestions: {},
  sessionStatus: {},
  activeSessionId: {},
  currentStep: {},
  lastHeartbeatAt: {},
  queueStatus: null,
  pipelineSteps: {},
  agentSpawns: {},

  addMessage: (caseNumber, message) =>
    set((state) => {
      const existing = state.messages[caseNumber] || []
      if (isDuplicateMessage(existing, message)) return state // skip duplicate
      const updated = [...existing, message].slice(-MAX_MESSAGES_PER_CASE)
      return { messages: { ...state.messages, [caseNumber]: updated } }
    }),

  clearMessages: (caseNumber) =>
    set((state) => {
      const next = { ...state.messages }
      delete next[caseNumber]
      return { messages: next }
    }),

  clearStepMessages: (caseNumber, step) =>
    set((state) => {
      const existing = state.messages[caseNumber]
      if (!existing) return state
      const filtered = existing.filter(m => m.step !== step)
      return { messages: { ...state.messages, [caseNumber]: filtered } }
    }),

  addSessionMessage: (caseNumber, sessionId, message) =>
    set((state) => {
      const key = `${caseNumber}:${sessionId}`
      const existing = state.sessionMessages[key] || []
      if (isDuplicateMessage(existing, message)) return state // skip duplicate
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

  setLastHeartbeatAt: (caseNumber, timestamp) =>
    set((state) => ({
      lastHeartbeatAt: { ...state.lastHeartbeatAt, [caseNumber]: timestamp },
    })),

  setQueueStatus: (status) =>
    set(() => ({ queueStatus: status })),

  // ---- Pipeline Steps ----
  initPipelineSteps: (caseNumber, steps) =>
    set((state) => ({
      pipelineSteps: {
        ...state.pipelineSteps,
        [caseNumber]: steps.map(s => ({ ...s, startedAt: undefined, completedAt: undefined, durationMs: undefined })),
      },
    })),

  updatePipelineStep: (caseNumber, stepId, status, externalDurationMs) =>
    set((state) => {
      const steps = state.pipelineSteps[caseNumber]
      if (!steps) return state
      const now = new Date().toISOString()
      const updated = steps.map(s => {
        if (s.id !== stepId) return s
        const startedAt = status === 'active' ? now : s.startedAt
        const completedAt = (status === 'completed' || status === 'failed' || status === 'skipped') ? now : s.completedAt
        // Use external durationMs from timing markers if provided, otherwise compute
        const durationMs = externalDurationMs ?? (startedAt && completedAt
          ? new Date(completedAt).getTime() - new Date(startedAt).getTime()
          : s.durationMs)
        return { ...s, status, startedAt, completedAt, durationMs }
      })
      return { pipelineSteps: { ...state.pipelineSteps, [caseNumber]: updated } }
    }),

  getPipelineSteps: (caseNumber) => get().pipelineSteps[caseNumber] || [],

  clearPipelineSteps: (caseNumber) =>
    set((state) => {
      const next = { ...state.pipelineSteps }
      delete next[caseNumber]
      const nextA = { ...state.agentSpawns }
      delete nextA[caseNumber]
      return { pipelineSteps: next, agentSpawns: nextA }
    }),

  // ---- Agent Spawns ----
  initAgentSpawns: (caseNumber, spawns) =>
    set((state) => ({
      agentSpawns: {
        ...state.agentSpawns,
        [caseNumber]: spawns.map(s => ({ ...s, status: s.status as AgentSpawnState['status'], durationMs: undefined })),
      },
    })),

  updateAgentSpawn: (caseNumber, agentId, status, durationMs) =>
    set((state) => {
      const spawns = state.agentSpawns[caseNumber]
      if (!spawns) {
        // Auto-create if not initialized (agent spawned before pipeline init)
        return {
          agentSpawns: {
            ...state.agentSpawns,
            [caseNumber]: [{ id: agentId, label: agentId, status, durationMs }],
          },
        }
      }
      const existing = spawns.find(s => s.id === agentId)
      if (existing) {
        const updated = spawns.map(s => s.id === agentId ? { ...s, status, durationMs } : s)
        return { agentSpawns: { ...state.agentSpawns, [caseNumber]: updated } }
      }
      return {
        agentSpawns: {
          ...state.agentSpawns,
          [caseNumber]: [...spawns, { id: agentId, label: agentId, status, durationMs }],
        },
      }
    }),

  getAgentSpawns: (caseNumber) => get().agentSpawns[caseNumber] || [],

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

      const lhb = { ...state.lastHeartbeatAt }
      delete lhb[caseNumber]

      const ps = { ...state.pipelineSteps }
      delete ps[caseNumber]

      const as2 = { ...state.agentSpawns }
      delete as2[caseNumber]

      return {
        messages: msgs,
        sessionMessages: sessMsgs,
        pendingQuestions: pq,
        sessionStatus: ss,
        activeSessionId: asid,
        currentStep: cs,
        lastHeartbeatAt: lhb,
        pipelineSteps: ps,
        agentSpawns: as2,
      }
    }),
}))

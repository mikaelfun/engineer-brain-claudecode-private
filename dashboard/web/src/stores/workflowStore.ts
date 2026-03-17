/**
 * workflowStore.ts — Zustand store for real-time workflow state
 *
 * Updated by SSE events from the backend.
 * Maintains a unified `logStream` of interleaved thinking / tool-call / tool-result
 * entries so the UI can render a chronological real-time log.
 */
import { create } from 'zustand'

// ---- Log stream entry types ----

export interface LogEntryThinking {
  kind: 'thinking'
  iteration: number
  content: string
  ts: number // Date.now()
}

export interface LogEntryToolCall {
  kind: 'tool-call'
  callId: string
  toolName: string
  args: Record<string, string>
  ts: number
}

export interface LogEntryToolResult {
  kind: 'tool-result'
  callId: string
  toolName: string
  success: boolean
  output: string
  durationMs: number
  ts: number
}

export interface LogEntryIteration {
  kind: 'iteration'
  iteration: number
  maxIterations: number
  ts: number
}

export type LogEntry = LogEntryThinking | LogEntryToolCall | LogEntryToolResult | LogEntryIteration

// ---- Tool call (kept for backward compat) ----

export interface LiveToolCall {
  callId: string
  toolName: string
  args: Record<string, string>
  status: 'running' | 'completed' | 'failed'
  output?: string
  durationMs?: number
  success?: boolean
}

// ---- Live session ----

export interface LiveSession {
  sessionId: string
  workflowId: string
  workflowName: string
  iteration: number
  maxIterations: number
  toolCalls: LiveToolCall[]
  logStream: LogEntry[]
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  resultPreview?: string
  resultFull?: string
  error?: string
}

interface WorkflowState {
  liveSession: LiveSession | null

  // Actions called by SSE event handlers
  onWorkflowStarted: (data: { sessionId: string; workflowId: string; workflowName: string }) => void
  onWorkflowIteration: (data: { sessionId: string; iteration: number; maxIterations: number }) => void
  onWorkflowThinking: (data: { sessionId: string; iteration: number; content: string }) => void
  onWorkflowToolCall: (data: { sessionId: string; callId: string; toolName: string; args: Record<string, string> }) => void
  onWorkflowToolResult: (data: { sessionId: string; callId: string; toolName: string; success: boolean; output: string; durationMs: number }) => void
  onWorkflowCompleted: (data: { sessionId: string; workflowId: string; resultPreview: string; resultFull?: string }) => void
  onWorkflowFailed: (data: { sessionId: string; workflowId: string; error: string }) => void
  onWorkflowCancelled: (data: { sessionId: string; workflowId: string }) => void
  clearLiveSession: () => void
}

export const useWorkflowStore = create<WorkflowState>()((set) => ({
  liveSession: null,

  onWorkflowStarted: (data) => set({
    liveSession: {
      sessionId: data.sessionId,
      workflowId: data.workflowId,
      workflowName: data.workflowName,
      iteration: 0,
      maxIterations: 0,
      toolCalls: [],
      logStream: [],
      status: 'running',
    },
  }),

  onWorkflowIteration: (data) => set((state) => {
    if (!state.liveSession || state.liveSession.sessionId !== data.sessionId) return state
    return {
      liveSession: {
        ...state.liveSession,
        iteration: data.iteration,
        maxIterations: data.maxIterations,
        logStream: [
          ...state.liveSession.logStream,
          { kind: 'iteration', iteration: data.iteration, maxIterations: data.maxIterations, ts: Date.now() } as LogEntryIteration,
        ],
      },
    }
  }),

  onWorkflowThinking: (data) => set((state) => {
    if (!state.liveSession || state.liveSession.sessionId !== data.sessionId) return state
    return {
      liveSession: {
        ...state.liveSession,
        logStream: [
          ...state.liveSession.logStream,
          { kind: 'thinking', iteration: data.iteration, content: data.content, ts: Date.now() } as LogEntryThinking,
        ],
      },
    }
  }),

  onWorkflowToolCall: (data) => set((state) => {
    if (!state.liveSession || state.liveSession.sessionId !== data.sessionId) return state
    return {
      liveSession: {
        ...state.liveSession,
        toolCalls: [
          ...state.liveSession.toolCalls,
          { callId: data.callId, toolName: data.toolName, args: data.args, status: 'running' },
        ],
        logStream: [
          ...state.liveSession.logStream,
          { kind: 'tool-call', callId: data.callId, toolName: data.toolName, args: data.args, ts: Date.now() } as LogEntryToolCall,
        ],
      },
    }
  }),

  onWorkflowToolResult: (data) => set((state) => {
    if (!state.liveSession || state.liveSession.sessionId !== data.sessionId) return state
    return {
      liveSession: {
        ...state.liveSession,
        toolCalls: state.liveSession.toolCalls.map((tc) =>
          tc.callId === data.callId
            ? { ...tc, status: data.success ? 'completed' as const : 'failed' as const, output: data.output, durationMs: data.durationMs, success: data.success }
            : tc
        ),
        logStream: [
          ...state.liveSession.logStream,
          { kind: 'tool-result', callId: data.callId, toolName: data.toolName, success: data.success, output: data.output, durationMs: data.durationMs, ts: Date.now() } as LogEntryToolResult,
        ],
      },
    }
  }),

  onWorkflowCompleted: (data) => set((state) => {
    if (!state.liveSession || state.liveSession.sessionId !== data.sessionId) return state
    return {
      liveSession: {
        ...state.liveSession,
        status: 'completed',
        resultPreview: data.resultPreview,
        resultFull: data.resultFull,
      },
    }
  }),

  onWorkflowFailed: (data) => set((state) => {
    if (!state.liveSession || state.liveSession.sessionId !== data.sessionId) return state
    return {
      liveSession: {
        ...state.liveSession,
        status: 'failed',
        error: data.error,
      },
    }
  }),

  onWorkflowCancelled: (data) => set((state) => {
    if (!state.liveSession || state.liveSession.sessionId !== data.sessionId) return state
    return {
      liveSession: {
        ...state.liveSession,
        status: 'cancelled',
      },
    }
  }),

  clearLiveSession: () => set({ liveSession: null }),
}))

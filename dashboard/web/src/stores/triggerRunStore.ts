/**
 * triggerRunStore.ts — Zustand store for trigger execution state
 *
 * Tracks which triggers are running, their live output, elapsed time, and status.
 * Fed by SSE events: trigger-started, trigger-progress, trigger-completed,
 * trigger-failed, trigger-cancelled.
 */
import { create } from 'zustand'
import type { CaseSessionMessage } from './caseSessionStore'

export interface TriggerRunState {
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  startedAt: number
  elapsedMs: number
  output: string
  /** Structured messages for SessionMessageList rendering */
  messages: CaseSessionMessage[]
  error?: string
}

/** Structured progress data from SSE trigger-progress event */
export interface TriggerProgressData {
  kind?: string     // 'tool-call' | 'tool-result' | 'response' | 'thinking' | 'agent-started' | ...
  chunk?: string
  toolName?: string
  content?: string
  elapsedMs?: number
  timestamp?: string
}

interface TriggerRunStore {
  /** Map of triggerId → run state */
  runs: Record<string, TriggerRunState>

  /** SSE event handlers */
  onTriggerStarted: (triggerId: string) => void
  onTriggerProgress: (triggerId: string, data: TriggerProgressData) => void
  onTriggerCompleted: (triggerId: string, durationMs: number, outputPreview?: string) => void
  onTriggerFailed: (triggerId: string, durationMs: number, error?: string) => void
  onTriggerCancelled: (triggerId: string, durationMs: number) => void

  /** Clear a finished run from the store */
  clearRun: (triggerId: string) => void

  /** Check if a trigger is running */
  isRunning: (triggerId: string) => boolean
}

const MAX_OUTPUT_LENGTH = 20000
const MAX_MESSAGES = 500

/** Map SSE kind to CaseSessionMessage type */
function kindToType(kind?: string): CaseSessionMessage['type'] {
  if (kind === 'tool-call') return 'tool-call'
  if (kind === 'tool-result') return 'tool-result'
  if (kind === 'response') return 'response'
  if (kind === 'thinking') return 'thinking'
  if (kind?.startsWith('agent-')) return 'system'
  return 'thinking'
}

export const useTriggerRunStore = create<TriggerRunStore>((set, get) => ({
  runs: {},

  onTriggerStarted: (triggerId) => {
    set((state) => ({
      runs: {
        ...state.runs,
        [triggerId]: {
          status: 'running',
          startedAt: Date.now(),
          elapsedMs: 0,
          output: '',
          messages: [],
        },
      },
    }))
  },

  onTriggerProgress: (triggerId, data) => {
    set((state) => {
      const existing = state.runs[triggerId]
      if (!existing || existing.status !== 'running') return state
      const chunk = data.chunk || data.content || ''
      const newOutput = (existing.output + chunk).slice(-MAX_OUTPUT_LENGTH)
      const newMsg: CaseSessionMessage = {
        type: kindToType(data.kind),
        content: data.content || data.chunk || '',
        toolName: data.toolName,
        timestamp: data.timestamp || new Date().toISOString(),
      }
      const newMessages = [...existing.messages, newMsg]
      if (newMessages.length > MAX_MESSAGES) newMessages.splice(0, newMessages.length - MAX_MESSAGES)
      return {
        runs: {
          ...state.runs,
          [triggerId]: {
            ...existing,
            elapsedMs: data.elapsedMs ?? existing.elapsedMs,
            output: newOutput,
            messages: newMessages,
          },
        },
      }
    })
  },

  onTriggerCompleted: (triggerId, durationMs, outputPreview) => {
    set((state) => {
      const existing = state.runs[triggerId]
      return {
        runs: {
          ...state.runs,
          [triggerId]: {
            status: 'completed',
            startedAt: existing?.startedAt || Date.now() - durationMs,
            elapsedMs: durationMs,
            output: existing?.output || outputPreview || '',
            messages: existing?.messages || [],
          },
        },
      }
    })
  },

  onTriggerFailed: (triggerId, durationMs, error) => {
    set((state) => {
      const existing = state.runs[triggerId]
      return {
        runs: {
          ...state.runs,
          [triggerId]: {
            status: 'failed',
            startedAt: existing?.startedAt || Date.now() - durationMs,
            elapsedMs: durationMs,
            output: existing?.output || '',
            messages: existing?.messages || [],
            error,
          },
        },
      }
    })
  },

  onTriggerCancelled: (triggerId, durationMs) => {
    set((state) => {
      const existing = state.runs[triggerId]
      return {
        runs: {
          ...state.runs,
          [triggerId]: {
            status: 'cancelled',
            startedAt: existing?.startedAt || Date.now() - durationMs,
            elapsedMs: durationMs,
            output: existing?.output || '',
            messages: existing?.messages || [],
          },
        },
      }
    })
  },

  clearRun: (triggerId) => {
    set((state) => {
      const { [triggerId]: _, ...rest } = state.runs
      return { runs: rest }
    })
  },

  isRunning: (triggerId) => {
    return get().runs[triggerId]?.status === 'running'
  },
}))

/**
 * triggerRunStore.ts — Zustand store for trigger execution state
 *
 * Tracks which triggers are running, their live output, elapsed time, and status.
 * Fed by SSE events: trigger-started, trigger-progress, trigger-completed,
 * trigger-failed, trigger-cancelled.
 */
import { create } from 'zustand'

export interface TriggerRunState {
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  startedAt: number
  elapsedMs: number
  output: string
  error?: string
}

interface TriggerRunStore {
  /** Map of triggerId → run state */
  runs: Record<string, TriggerRunState>

  /** SSE event handlers */
  onTriggerStarted: (triggerId: string) => void
  onTriggerProgress: (triggerId: string, chunk: string, elapsedMs: number) => void
  onTriggerCompleted: (triggerId: string, durationMs: number, outputPreview?: string) => void
  onTriggerFailed: (triggerId: string, durationMs: number, error?: string) => void
  onTriggerCancelled: (triggerId: string, durationMs: number) => void

  /** Clear a finished run from the store */
  clearRun: (triggerId: string) => void

  /** Check if a trigger is running */
  isRunning: (triggerId: string) => boolean
}

const MAX_OUTPUT_LENGTH = 3000

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
        },
      },
    }))
  },

  onTriggerProgress: (triggerId, chunk, elapsedMs) => {
    set((state) => {
      const existing = state.runs[triggerId]
      if (!existing || existing.status !== 'running') return state
      const newOutput = (existing.output + chunk).slice(-MAX_OUTPUT_LENGTH)
      return {
        runs: {
          ...state.runs,
          [triggerId]: {
            ...existing,
            elapsedMs,
            output: newOutput,
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

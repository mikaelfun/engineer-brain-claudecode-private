/**
 * todoExecuteStore — Per-item execution state for Todo Execute with verification
 *
 * State machine per item: idle → executing → verifying → success | failed
 * Keyed by `${caseNumber}:${lineNumber}`
 */
import { create } from 'zustand'

export type TodoExecuteStatus = 'idle' | 'executing' | 'verifying' | 'success' | 'failed'

export interface TodoExecuteState {
  status: TodoExecuteStatus
  startTime?: number       // Date.now() when execution started
  message?: string         // last progress message
  verificationDetails?: string  // final result details
}

interface TodoExecuteStore {
  items: Record<string, TodoExecuteState>

  /** Set item to executing state */
  startExecuting: (key: string) => void
  /** Update progress (executing or verifying phase) */
  setProgress: (key: string, phase: 'executing' | 'verifying', message?: string) => void
  /** Set final result */
  setResult: (key: string, success: boolean, verificationDetails?: string) => void
  /** Get state for a specific item */
  getItem: (key: string) => TodoExecuteState
  /** Reset item back to idle (for retry) */
  resetItem: (key: string) => void
}

const DEFAULT_STATE: TodoExecuteState = { status: 'idle' }

export const useTodoExecuteStore = create<TodoExecuteStore>((set, get) => ({
  items: {},

  startExecuting: (key: string) => {
    set((state) => ({
      items: {
        ...state.items,
        [key]: { status: 'executing', startTime: Date.now() },
      },
    }))
  },

  setProgress: (key: string, phase: 'executing' | 'verifying', message?: string) => {
    set((state) => ({
      items: {
        ...state.items,
        [key]: {
          ...(state.items[key] || DEFAULT_STATE),
          status: phase,
          message,
        },
      },
    }))
  },

  setResult: (key: string, success: boolean, verificationDetails?: string) => {
    set((state) => ({
      items: {
        ...state.items,
        [key]: {
          ...(state.items[key] || DEFAULT_STATE),
          status: success ? 'success' : 'failed',
          verificationDetails,
        },
      },
    }))
  },

  getItem: (key: string) => {
    return get().items[key] || DEFAULT_STATE
  },

  resetItem: (key: string) => {
    set((state) => ({
      items: {
        ...state.items,
        [key]: DEFAULT_STATE,
      },
    }))
  },
}))

/**
 * testLabStore.ts — Zustand store for real-time test supervisor state
 *
 * Intentionally thin — most data comes from TanStack Query.
 * This store only holds "what's happening right now" for instant UI response.
 */
import { create } from 'zustand'

interface TestLabState {
  /** Current phase from SSE push */
  livePhase: string | null
  /** Current round number */
  liveRound: number | null
  /** Currently executing test ID */
  liveCurrentTest: string | null
  /** When last SSE update arrived */
  lastUpdated: string | null

  // Actions
  onStateUpdate: (data: { phase?: string; round?: number; currentTest?: string }) => void
  reset: () => void
}

export const useTestLabStore = create<TestLabState>()((set) => ({
  livePhase: null,
  liveRound: null,
  liveCurrentTest: null,
  lastUpdated: null,

  onStateUpdate: (data) => set({
    livePhase: data.phase ?? null,
    liveRound: data.round ?? null,
    liveCurrentTest: data.currentTest ?? null,
    lastUpdated: new Date().toISOString(),
  }),

  reset: () => set({
    livePhase: null,
    liveRound: null,
    liveCurrentTest: null,
    lastUpdated: null,
  }),
}))

/**
 * patrolStore.ts — Zustand store for real-time patrol progress
 *
 * Updated by SSE events (patrol-progress, patrol-case-completed).
 */
import { create } from 'zustand'

export interface PatrolCaseProgress {
  caseNumber: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  error?: string
}

interface PatrolState {
  isRunning: boolean
  phase: string
  totalCases: number
  changedCases: number
  processedCases: number
  currentCase?: string
  caseProgress: PatrolCaseProgress[]
  error?: string
  lastCompletedAt?: string

  // Actions called by SSE event handlers
  onPatrolProgress: (data: any) => void
  onPatrolCaseCompleted: (data: any) => void
  reset: () => void
}

export const usePatrolStore = create<PatrolState>()((set) => ({
  isRunning: false,
  phase: '',
  totalCases: 0,
  changedCases: 0,
  processedCases: 0,
  currentCase: undefined,
  caseProgress: [],
  error: undefined,
  lastCompletedAt: undefined,

  onPatrolProgress: (data) => set((state) => {
    const update: Partial<PatrolState> = {
      phase: data.phase,
      isRunning: !['completed', 'failed'].includes(data.phase),
    }
    if (data.totalCases !== undefined) update.totalCases = data.totalCases
    if (data.changedCases !== undefined) update.changedCases = data.changedCases
    if (data.processedCases !== undefined) update.processedCases = data.processedCases
    if (data.error) update.error = data.error
    if (data.currentCase) update.currentCase = data.currentCase
    if (data.phase === 'completed') update.lastCompletedAt = new Date().toISOString()
    if (data.currentCase) {
      // In parallel mode, only add new cases as processing — don't remove existing processing cases
      const existingCase = state.caseProgress.find(c => c.caseNumber === data.currentCase)
      if (!existingCase) {
        update.caseProgress = [
          ...state.caseProgress,
          { caseNumber: data.currentCase, status: 'processing' as const },
        ]
      }
    }
    return { ...state, ...update }
  }),

  onPatrolCaseCompleted: (data) => set((state) => ({
    processedCases: data.processedCases ?? state.processedCases + 1,
    caseProgress: [
      ...state.caseProgress.filter(c => c.caseNumber !== data.caseNumber),
      {
        caseNumber: data.caseNumber,
        status: (data.error ? 'failed' : 'completed') as PatrolCaseProgress['status'],
        error: data.error,
      },
    ],
  })),

  reset: () => set({
    isRunning: false,
    phase: '',
    totalCases: 0,
    changedCases: 0,
    processedCases: 0,
    caseProgress: [],
    error: undefined,
  }),
}))

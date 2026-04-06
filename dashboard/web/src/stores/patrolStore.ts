/**
 * patrolStore.ts — Zustand store for real-time patrol progress
 *
 * Updated by SSE events (patrol-progress, patrol-case-completed).
 * Retains last patrol run results until next patrol starts.
 */
import { create } from 'zustand'

export interface PatrolCaseProgress {
  caseNumber: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  currentStep?: string
  lastTool?: string
  lastActivity?: string
  error?: string
}

/** Snapshot of a completed patrol run */
export interface PatrolRunSnapshot {
  phase: string
  totalCases: number
  changedCases: number
  processedCases: number
  caseProgress: PatrolCaseProgress[]
  error?: string
  detail?: string
  completedAt: string
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
  detail?: string
  lastCompletedAt?: string

  /** Snapshot of previous patrol run (kept until next patrol starts) */
  lastRun: PatrolRunSnapshot | null

  // Actions called by SSE event handlers
  onPatrolProgress: (data: any) => void
  onPatrolCaseCompleted: (data: any) => void
  /** Update sub-step progress for a specific case during patrol */
  onCaseStepUpdate: (caseNumber: string, update: { step?: string; tool?: string }) => void
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
  detail: undefined,
  lastCompletedAt: undefined,
  lastRun: null,

  onPatrolProgress: (data) => set((state) => {
    // New patrol starting — snapshot previous run before resetting
    if (data.phase === 'discovering' && state.phase && state.phase !== 'discovering') {
      const snapshot: PatrolRunSnapshot | null = state.lastCompletedAt ? {
        phase: state.phase,
        totalCases: state.totalCases,
        changedCases: state.changedCases,
        processedCases: state.processedCases,
        caseProgress: state.caseProgress,
        error: state.error,
        detail: state.detail,
        completedAt: state.lastCompletedAt,
      } : null

      return {
        ...state,
        isRunning: true,
        phase: data.phase,
        totalCases: data.totalCases ?? 0,
        changedCases: 0,
        processedCases: 0,
        currentCase: undefined,
        caseProgress: [],
        error: undefined,
        detail: data.detail,
        lastRun: snapshot,
      }
    }

    const update: Partial<PatrolState> = {
      phase: data.phase,
      isRunning: !['completed', 'failed'].includes(data.phase),
    }
    if (data.totalCases !== undefined) update.totalCases = data.totalCases
    if (data.changedCases !== undefined) update.changedCases = data.changedCases
    if (data.processedCases !== undefined) update.processedCases = data.processedCases
    if (data.error) update.error = data.error
    if (data.detail !== undefined) update.detail = data.detail
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

  onCaseStepUpdate: (caseNumber, update) => set((state) => {
    if (!state.isRunning) return state
    const idx = state.caseProgress.findIndex(c => c.caseNumber === caseNumber)
    if (idx === -1) return state // case not tracked by patrol
    const existing = state.caseProgress[idx]
    if (existing.status === 'completed' || existing.status === 'failed') return state // done
    const updated = [...state.caseProgress]
    updated[idx] = {
      ...existing,
      currentStep: update.step ?? existing.currentStep,
      lastTool: update.tool ?? existing.lastTool,
      lastActivity: new Date().toISOString(),
    }
    return { caseProgress: updated }
  }),

  reset: () => set({
    isRunning: false,
    phase: '',
    totalCases: 0,
    changedCases: 0,
    processedCases: 0,
    caseProgress: [],
    error: undefined,
    detail: undefined,
    lastRun: null,
  }),
}))

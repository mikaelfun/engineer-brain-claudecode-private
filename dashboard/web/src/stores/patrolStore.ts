/**
 * patrolStore.ts — Zustand store for patrol progress (v3)
 *
 * Consumes 2 SSE events: patrol-state, patrol-case.
 * Clean store with 2 SSE handlers (onPatrolState, onCaseUpdate).
 */
import { create } from 'zustand'

// ─── Types ───

export type PatrolPhase =
  | 'idle' | 'starting' | 'discovering' | 'filtering'
  | 'warming-up' | 'processing' | 'aggregating'
  | 'completed' | 'failed'

export type StepStatus = 'pending' | 'active' | 'completed' | 'failed' | 'skipped'

export interface SubtaskState {
  status: StepStatus
  durationMs?: number
}

export interface ActionState {
  type: string
  status: StepStatus
  durationMs?: number
}

export interface StepState {
  status: StepStatus
  startedAt?: string
  completedAt?: string
  durationMs?: number
  result?: string
  subtasks?: Record<string, SubtaskState>
  actions?: ActionState[]
}

export interface CaseState {
  caseNumber: string
  currentStep?: string
  steps: Record<string, StepState>
  updatedAt?: string
}

// ─── Legacy types (kept for Patrol page CaseCard rendering) ───

/** @deprecated Use CaseState instead */
export interface PatrolCaseProgress {
  caseNumber: string
  status: 'queued' | 'pending' | 'processing' | 'completed' | 'failed'
  currentStep?: string
  lastTool?: string
  lastActivity?: string
  durationMs?: number
  error?: string
  substeps?: Record<string, { status: string; durationMs?: number }>
  actions?: ActionState[]
}

// ─── Store ───

interface PatrolStore {
  // Global
  phase: PatrolPhase
  totalCases: number
  changedCases: number
  processedCases: number
  startedAt?: string
  completedAt?: string
  error?: string
  caseList: string[]

  // Per-case (v3)
  cases: Record<string, CaseState>

  // SSE handlers (v3)
  onPatrolState: (data: Record<string, unknown>) => void
  onCaseUpdate: (data: Record<string, unknown>) => void

  // User actions
  start: () => void
  reset: () => void
}

function deriveProcessedCount(cases: Record<string, CaseState>): number {
  return Object.values(cases).filter(c => {
    const sum = c.steps?.summarize
    const act = c.steps?.act
    return sum?.status === 'completed' || sum?.status === 'skipped'
      || (act?.status === 'completed' && sum?.status !== 'active')
  }).length
}

export const usePatrolStore = create<PatrolStore>()((set, _get) => ({
  // ─── v3 state ───
  phase: 'idle',
  totalCases: 0,
  changedCases: 0,
  processedCases: 0,
  startedAt: undefined,
  completedAt: undefined,
  error: undefined,
  caseList: [],
  cases: {},

  // ─── v3 SSE handlers ───

  onPatrolState: (data) => set(() => {
    const phase = (data.phase as PatrolPhase) || 'idle'
    const update: Partial<PatrolStore> = {
      phase,
    }

    if (data.totalCases !== undefined) update.totalCases = data.totalCases as number
    if (data.changedCases !== undefined) update.changedCases = data.changedCases as number
    if (data.processedCases !== undefined) update.processedCases = data.processedCases as number
    if (data.startedAt) update.startedAt = data.startedAt as string
    if (data.error) update.error = data.error as string
    if (data.caseList && Array.isArray(data.caseList)) update.caseList = data.caseList as string[]
    if (phase === 'completed') {
      update.completedAt = new Date().toISOString()
    }
    if (phase === 'starting') {
      update.cases = {}
      update.processedCases = 0
      update.error = undefined
      update.completedAt = undefined
    }

    return update
  }),

  onCaseUpdate: (data) => set((state) => {
    const caseNumber = data.caseNumber as string
    if (!caseNumber) return state

    const caseState: CaseState = {
      caseNumber,
      currentStep: data.currentStep as string | undefined,
      steps: (data.steps as Record<string, StepState>) || {},
      updatedAt: data.updatedAt as string | undefined,
    }

    const newCases = { ...state.cases, [caseNumber]: caseState }
    const processedCases = deriveProcessedCount(newCases)

    return { cases: newCases, processedCases }
  }),

  // ─── User actions ───

  start: () => set({
    phase: 'starting',
    totalCases: 0,
    changedCases: 0,
    processedCases: 0,
    cases: {},
    error: undefined,
    completedAt: undefined,
    startedAt: new Date().toISOString(),
  }),

  reset: () => set({
    phase: 'idle',
    totalCases: 0,
    changedCases: 0,
    processedCases: 0,
    cases: {},
    caseList: [],
    error: undefined,
    startedAt: undefined,
    completedAt: undefined,
  }),
}))

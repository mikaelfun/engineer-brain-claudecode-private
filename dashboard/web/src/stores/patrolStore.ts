/**
 * patrolStore.ts — Zustand store for patrol progress (v3 rewrite)
 *
 * Consumes 2 SSE events: patrol-state, patrol-case.
 * Replaces v2 store (12 actions → 2 handlers).
 *
 * Backward-compat shims (isRunning, onPatrolProgress, etc.) are provided
 * for useSSE.ts / AgentMonitor / Dashboard until Task 11 cleans them up.
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

// ─── Legacy types (kept for backward compat, remove in Task 11) ───

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

  // ─── Backward-compat shims (remove in Task 11) ───
  /** @deprecated — derived from phase */
  isRunning: boolean
  /** @deprecated — use cases[x].currentStep */
  currentCase?: string
  /** @deprecated — derived from cases */
  caseProgress: PatrolCaseProgress[]
  /** @deprecated — not used in v3 */
  detail?: string
  /** @deprecated — renamed to completedAt */
  lastCompletedAt?: string
  /** @deprecated — alias for onPatrolState */
  onPatrolProgress: (data: any) => void
  /** @deprecated — alias for onCaseUpdate */
  onPatrolCaseCompleted: (data: any) => void
  /** @deprecated — no-op in v3 */
  onCaseStepUpdate: (caseNumber: string, update: { step?: string; tool?: string }) => void
  /** @deprecated — no-op in v3 */
  onSubtaskUpdate: (caseNumber: string, subtask: string, status: string, durationMs?: number) => void
  /** @deprecated — no-op in v3 */
  onPipelineUpdate: (data: any) => void
  /** @deprecated — alias for start() */
  startNew: () => void
}

const RUNNING_PHASES: PatrolPhase[] = [
  'starting', 'discovering', 'filtering', 'warming-up', 'processing', 'aggregating',
]

function deriveProcessedCount(cases: Record<string, CaseState>): number {
  return Object.values(cases).filter(c => {
    const sum = c.steps?.summarize
    const act = c.steps?.act
    return sum?.status === 'completed' || sum?.status === 'skipped'
      || (act?.status === 'completed' && sum?.status !== 'active')
  }).length
}

/** Derive legacy caseProgress array from v3 cases map */
function deriveCaseProgress(cases: Record<string, CaseState>): PatrolCaseProgress[] {
  return Object.values(cases).map(c => {
    const hasActive = Object.values(c.steps).some(s => s.status === 'active')
    const hasFailed = Object.values(c.steps).some(s => s.status === 'failed')
    const isComplete =
      c.steps?.summarize?.status === 'completed' ||
      c.steps?.summarize?.status === 'skipped' ||
      (c.steps?.act?.status === 'completed' && c.steps?.summarize?.status !== 'active')

    let status: PatrolCaseProgress['status'] = 'queued'
    if (isComplete) status = hasFailed ? 'failed' : 'completed'
    else if (hasActive) status = 'processing'

    return {
      caseNumber: c.caseNumber,
      status,
      currentStep: c.currentStep,
    }
  })
}

export const usePatrolStore = create<PatrolStore>()((set, get) => ({
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

  // ─── Compat derived state ───
  isRunning: false,
  currentCase: undefined,
  caseProgress: [],
  detail: undefined,
  lastCompletedAt: undefined,

  // ─── v3 SSE handlers ───

  onPatrolState: (data) => set(() => {
    const phase = (data.phase as PatrolPhase) || 'idle'
    const update: Partial<PatrolStore> = {
      phase,
      isRunning: RUNNING_PHASES.includes(phase),
    }

    if (data.totalCases !== undefined) update.totalCases = data.totalCases as number
    if (data.changedCases !== undefined) update.changedCases = data.changedCases as number
    if (data.processedCases !== undefined) update.processedCases = data.processedCases as number
    if (data.startedAt) update.startedAt = data.startedAt as string
    if (data.error) update.error = data.error as string
    if (data.detail !== undefined) update.detail = data.detail as string
    if (data.caseList && Array.isArray(data.caseList)) update.caseList = data.caseList as string[]
    if (data.currentCase) update.currentCase = data.currentCase as string
    if (phase === 'completed') {
      update.completedAt = new Date().toISOString()
      update.lastCompletedAt = update.completedAt
    }
    if (phase === 'starting') {
      update.cases = {}
      update.caseProgress = []
      update.processedCases = 0
      update.error = undefined
      update.completedAt = undefined
      update.lastCompletedAt = undefined
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
    const caseProgress = deriveCaseProgress(newCases)

    return { cases: newCases, processedCases, caseProgress }
  }),

  // ─── User actions ───

  start: () => set({
    phase: 'starting',
    isRunning: true,
    totalCases: 0,
    changedCases: 0,
    processedCases: 0,
    cases: {},
    caseProgress: [],
    error: undefined,
    completedAt: undefined,
    lastCompletedAt: undefined,
    startedAt: new Date().toISOString(),
  }),

  reset: () => set({
    phase: 'idle',
    isRunning: false,
    totalCases: 0,
    changedCases: 0,
    processedCases: 0,
    cases: {},
    caseProgress: [],
    caseList: [],
    error: undefined,
    detail: undefined,
    startedAt: undefined,
    completedAt: undefined,
    lastCompletedAt: undefined,
    currentCase: undefined,
  }),

  // ─── Backward-compat shims (remove in Task 11) ───

  onPatrolProgress: (data: any) => {
    get().onPatrolState(data)
  },

  onPatrolCaseCompleted: (data: any) => {
    // Map legacy case-completed event to v3 onCaseUpdate
    const caseNumber = data.caseNumber as string
    if (!caseNumber) return
    get().onCaseUpdate({
      caseNumber,
      steps: {
        summarize: {
          status: data.error ? 'failed' : 'completed',
          durationMs: data.durationMs,
        },
      },
    })
  },

  onCaseStepUpdate: (_caseNumber: string, _update: { step?: string; tool?: string }) => {
    // No-op in v3 — step updates come via onCaseUpdate
  },

  onSubtaskUpdate: (_caseNumber: string, _subtask: string, _status: string, _durationMs?: number) => {
    // No-op in v3 — subtask updates come via onCaseUpdate
  },

  onPipelineUpdate: (data: any) => {
    // Forward to onCaseUpdate for v3
    if (data.caseNumber) {
      get().onCaseUpdate(data)
    }
  },

  startNew: () => {
    get().start()
  },
}))

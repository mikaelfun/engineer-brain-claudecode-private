/**
 * patrolStore.ts — Zustand store for real-time patrol progress
 *
 * Updated by SSE events (patrol-progress, patrol-case-completed).
 * Retains last patrol run results until next patrol starts.
 * Persists completion state to localStorage so page refresh doesn't lose results.
 */
import { create } from 'zustand'

const STORAGE_KEY = 'patrol-store-state'

// Forward-declare for persistToStorage
interface PatrolStatePersist {
  phase: string
  totalCases: number
  changedCases: number
  processedCases: number
  caseProgress: PatrolCaseProgress[]
  error?: string
  detail?: string
  lastCompletedAt?: string
  isRunning: boolean
  savedAt?: string
}

/** Save patrol completion state to localStorage */
function persistToStorage(state: PatrolStatePersist) {
  try {
    const data = {
      ...state,
      savedAt: new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch { /* localStorage unavailable */ }
}

/** Load patrol state from localStorage (returns partial state or null) */
function loadFromStorage(): PatrolStatePersist | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    // Only restore if saved within last 2 hours
    const savedAt = new Date(data.savedAt).getTime()
    if (Date.now() - savedAt > 2 * 60 * 60 * 1000) return null
    return data
  } catch { return null }
}

// Load initial state from localStorage
// If restored state says running but is stale (>30min), treat as not running
const _restored = loadFromStorage()
const restored = _restored?.isRunning && _restored.savedAt
  ? (() => {
      const age = Date.now() - new Date(_restored.savedAt as string).getTime()
      if (age > 30 * 60 * 1000) {
        // Stale running state — patrol must have completed/failed while browser was closed
        return { ..._restored, isRunning: false, phase: _restored.phase || 'completed' }
      }
      return _restored
    })()
  : _restored

export interface PatrolCaseProgress {
  caseNumber: string
  status: 'queued' | 'pending' | 'processing' | 'completed' | 'failed'
  currentStep?: string
  lastTool?: string
  lastActivity?: string
  durationMs?: number
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
  /** Called when user clicks Start Patrol — immediately clears old progress and sets running */
  startNew: () => void
  reset: () => void
}

export const usePatrolStore = create<PatrolState>()((set) => ({
  isRunning: restored?.isRunning ?? false,
  phase: restored?.phase ?? '',
  totalCases: restored?.totalCases ?? 0,
  changedCases: restored?.changedCases ?? 0,
  processedCases: restored?.processedCases ?? 0,
  currentCase: undefined,
  caseProgress: restored?.caseProgress ?? [],
  error: restored?.error,
  detail: restored?.detail,
  lastCompletedAt: restored?.lastCompletedAt,
  lastRun: null,

  onPatrolProgress: (data) => set((state) => {
    // New patrol starting — snapshot previous run before resetting
    // Also handle when startNew() already set phase to 'starting'
    if (data.phase === 'discovering' && state.phase !== 'discovering') {
      const snapshot: PatrolRunSnapshot | null = (state.phase !== 'starting' && state.lastCompletedAt) ? {
        phase: state.phase,
        totalCases: state.totalCases,
        changedCases: state.changedCases,
        processedCases: state.processedCases,
        caseProgress: state.caseProgress,
        error: state.error,
        detail: state.detail,
        completedAt: state.lastCompletedAt,
      } : state.lastRun

      const newState = {
        ...state,
        isRunning: true,
        phase: data.phase,
        totalCases: data.totalCases ?? 0,
        changedCases: 0,
        processedCases: 0,
        currentCase: undefined,
        caseProgress: [] as PatrolCaseProgress[],
        error: undefined,
        detail: data.detail,
        lastRun: snapshot,
      }
      persistToStorage(newState)
      return newState
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
    // When discovering phase sends full case list, initialize all cases as "queued"
    if (data.caseList && Array.isArray(data.caseList) && data.caseList.length > 0) {
      update.caseProgress = data.caseList.map((cn: string) => ({
        caseNumber: cn,
        status: 'queued' as const,
      }))
    }
    if (data.currentCase) {
      // Update case from queued→processing, or add new if not tracked
      const currentProgress = update.caseProgress ?? state.caseProgress
      const existingCase = currentProgress.find(c => c.caseNumber === data.currentCase)
      if (!existingCase) {
        update.caseProgress = [
          ...currentProgress,
          { caseNumber: data.currentCase, status: 'processing' as const },
        ]
      } else if (existingCase.status === 'queued') {
        update.caseProgress = currentProgress.map(c =>
          c.caseNumber === data.currentCase ? { ...c, status: 'processing' as const } : c
        )
      }
    }
    const merged = { ...state, ...update }
    // Persist on phase transitions (completed/failed) and progress updates
    if (['completed', 'failed', 'processing'].includes(data.phase)) {
      persistToStorage(merged)
    }
    return merged
  }),

  onPatrolCaseCompleted: (data) => set((state) => {
    const newState = {
      processedCases: data.processedCases ?? state.processedCases + 1,
      caseProgress: [
        ...state.caseProgress.filter(c => c.caseNumber !== data.caseNumber),
        {
          caseNumber: data.caseNumber,
          status: (data.error ? 'failed' : 'completed') as PatrolCaseProgress['status'],
          durationMs: data.durationMs,
          error: data.error,
        },
      ],
    }
    persistToStorage({ ...state, ...newState })
    return newState
  }),

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

  startNew: () => set((state) => {
    // Snapshot previous run before clearing
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

    const newState = {
      isRunning: true,
      phase: 'starting',
      totalCases: 0,
      changedCases: 0,
      processedCases: 0,
      currentCase: undefined,
      caseProgress: [] as PatrolCaseProgress[],
      error: undefined,
      detail: undefined,
      lastRun: snapshot,
    }
    persistToStorage(newState as any)
    return newState
  }),

  reset: () => {
    try { localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
    return set({
      isRunning: false,
      phase: '',
      totalCases: 0,
      changedCases: 0,
      processedCases: 0,
      caseProgress: [],
      error: undefined,
      detail: undefined,
      lastRun: null,
    })
  },
}))

/**
 * patrol-state-manager.ts — Single source of truth for patrol state
 *
 * All patrol state updates (from orchestrator, file-watcher, or API) flow
 * through this singleton. It maintains an in-memory state object and
 * broadcasts changes via SSE (debounced).
 *
 * Consumers:
 *   - SSE 'patrol-state' events → frontend patrolStore.onPatrolState()
 *   - GET /api/patrol/status    → patrolStateManager.getState()
 *
 * Producers:
 *   - patrol-orchestrator.ts    → start/complete/fail/cancel
 *   - file-watcher.ts           → patrol-phase / patrol-progress.json changes
 */
import { existsSync, readFileSync, unlinkSync, statSync, writeFileSync } from 'fs'
import { join } from 'path'
import { config } from '../config.js'
import { sseManager } from '../watcher/sse-manager.js'
import type { SSEEventType } from '../types/index.js'

// ─── Types ───

export type PatrolPhase =
  | 'idle' | 'starting' | 'discovering' | 'filtering'
  | 'warming-up' | 'processing' | 'aggregating'
  | 'completed' | 'failed'

export interface PatrolState {
  phase: PatrolPhase
  totalCases: number
  changedCases: number
  processedCases: number
  startedAt?: string
  completedAt?: string
  error?: string
  caseList: string[]
  source?: string
  sessionId?: string
  detail?: string
  // Phase timing
  phaseStartedAt?: string                  // when the current phase began
  phaseTimings?: Record<string, number>    // completed phase → durationMs
  // Process stage enrichment
  currentAction?: string                   // patrol session's serial decision text
  totalFound?: number                      // total cases found in discover (before filter)
  skippedCount?: number                    // cases skipped by filter
  warmupStatus?: string                    // token daemon status text
}

// ─── Constants ───

const STALE_LOCK_MS = 60 * 60 * 1000    // 60 minutes — same as orchestrator
const BROADCAST_DEBOUNCE_MS = 50         // Coalesce rapid file-watcher events

// Ordered pipeline phases (excluding terminal/meta phases)
const PIPELINE_PHASES: PatrolPhase[] = [
  'starting', 'discovering', 'filtering', 'warming-up', 'processing', 'aggregating',
]

// ─── Default state ───

function defaultState(): PatrolState {
  return {
    phase: 'idle',
    totalCases: 0,
    changedCases: 0,
    processedCases: 0,
    caseList: [],
  }
}

// ─── Singleton ───

class PatrolStateManager {
  private state: PatrolState = defaultState()
  private broadcastTimer: ReturnType<typeof setTimeout> | null = null

  private get timingsPath(): string {
    return join(config.patrolDir, 'patrol-timings.json')
  }

  /**
   * Initialize from disk files (call once at server startup).
   * Recovers state after server restart while patrol may still be running.
   * Handles stale locks from dead processes.
   */
  hydrate(): void {
    const lockPath = join(config.patrolDir, 'patrol.lock')
    const phasePath = join(config.patrolDir, 'patrol-phase')

    // Check if patrol lock exists
    let lock: any = null
    try {
      if (existsSync(lockPath)) {
        lock = JSON.parse(readFileSync(lockPath, 'utf-8'))
      }
    } catch { /* no lock or unreadable */ }

    if (lock) {
      // ── Stale lock detection ──
      // Server restart means any webui-originated SDK query is dead
      // (abortController is always null on fresh start)
      const isStale = this.isLockStale(lock, lockPath, phasePath)

      if (isStale) {
        console.warn(`[patrol-state] Removing stale lock (source=${lock.source}, since=${lock.startedAt})`)
        try { unlinkSync(lockPath) } catch { /* ignore */ }
        lock = null // Fall through to "not running" branch below
      }
    }

    if (lock) {
      // Patrol appears genuinely running (CLI-originated, still active)
      this.state.source = lock.source
      this.state.startedAt = lock.startedAt
      this.state.sessionId = lock.sessionId
      this.state.phase = 'starting' // default if no phase file

      // Read patrol-progress.json first (most detailed)
      try {
        const progressFile = config.patrolProgressFile
        if (existsSync(progressFile)) {
          const progress = JSON.parse(readFileSync(progressFile, 'utf-8'))
          if (progress.phase) this.state.phase = progress.phase
          if (progress.totalCases !== undefined) this.state.totalCases = progress.totalCases
          if (progress.changedCases !== undefined) this.state.changedCases = progress.changedCases
          if (progress.processedCases !== undefined) this.state.processedCases = progress.processedCases
          if (progress.caseList) this.state.caseList = progress.caseList
        }
      } catch { /* ignore */ }

      // Fallback: read patrol-phase text file
      if (this.state.phase === 'starting') {
        try {
          if (existsSync(phasePath)) {
            const raw = readFileSync(phasePath, 'utf-8').trim()
            const [phase, progress] = raw.split('|')
            if (phase) this.state.phase = phase as PatrolPhase
            if (progress) {
              const [done, total] = progress.split('/')
              this.state.processedCases = parseInt(done, 10) || 0
              this.state.changedCases = parseInt(total, 10) || 0
            }
          }
        } catch { /* ignore */ }
      }

      // Restore phase timings from disk
      this.restoreTimings()

      console.log(`[patrol-state] Hydrated running patrol: phase=${this.state.phase}, source=${this.state.source}`)
    } else {
      // Not running — load last run result for display
      try {
        const stateFile = config.patrolStateFile
        if (existsSync(stateFile)) {
          const lastRun = JSON.parse(readFileSync(stateFile, 'utf-8'))
          if (lastRun.phase === 'completed' || lastRun.phase === 'failed') {
            this.state.phase = lastRun.phase
            this.state.totalCases = lastRun.totalCases ?? 0
            this.state.changedCases = lastRun.changedCases ?? 0
            this.state.processedCases = lastRun.processedCases ?? 0
            this.state.startedAt = lastRun.startedAt
            this.state.completedAt = lastRun.completedAt
            this.state.error = lastRun.error
            // Restore phase timings from disk
            this.restoreTimings()
            console.log(`[patrol-state] Hydrated last run: phase=${this.state.phase}`)
          }
        }
      } catch { /* ignore */ }
    }
  }

  /**
   * Update state with partial data and schedule debounced SSE broadcast.
   * Only provided fields are merged; undefined fields are untouched.
   */
  update(partial: Partial<PatrolState>): void {
    const now = new Date().toISOString()

    // ── Phase transition tracking ──
    if (partial.phase && partial.phase !== this.state.phase) {
      const prevPhase = this.state.phase
      const newPhase = partial.phase
      if (!this.state.phaseTimings) this.state.phaseTimings = {}

      // Record completed phase duration
      if (prevPhase !== 'idle' && this.state.phaseStartedAt) {
        const durationMs = Date.now() - new Date(this.state.phaseStartedAt).getTime()
        this.state.phaseTimings[prevPhase] = durationMs
      }

      // Fill skipped phases with 0ms.
      // chokidar's awaitWriteFinish (300ms stabilization) drops rapid intermediate
      // writes, so the skill may write filtering→warming-up within 300ms and we
      // only see warming-up. Without backfill, skipped phases show no timing.
      const prevIdx = PIPELINE_PHASES.indexOf(prevPhase)
      const newIdx = PIPELINE_PHASES.indexOf(newPhase)
      if (prevIdx >= 0 && newIdx > prevIdx + 1) {
        for (let i = prevIdx + 1; i < newIdx; i++) {
          const skipped = PIPELINE_PHASES[i]
          if (!(skipped in this.state.phaseTimings)) {
            this.state.phaseTimings[skipped] = 0
          }
        }
      }

      // Mark new phase start
      this.state.phaseStartedAt = now

      // Persist timings to disk (survives backend restart)
      this.persistTimings()
    }

    // Merge only defined fields
    for (const [key, value] of Object.entries(partial)) {
      if (value !== undefined) {
        (this.state as any)[key] = value
      }
    }

    // Auto-set completedAt on terminal phases
    if (partial.phase === 'completed' || partial.phase === 'failed') {
      if (!this.state.completedAt) {
        this.state.completedAt = new Date().toISOString()
      }
      // Backfill any remaining pipeline phases that were never seen
      if (!this.state.phaseTimings) this.state.phaseTimings = {}
      for (const p of PIPELINE_PHASES) {
        if (!(p in this.state.phaseTimings)) {
          this.state.phaseTimings[p] = 0
        }
      }
      this.persistTimings()
    }

    // Reset on new patrol start
    if (partial.phase === 'starting') {
      this.state.totalCases = partial.totalCases ?? 0
      this.state.changedCases = partial.changedCases ?? 0
      this.state.processedCases = partial.processedCases ?? 0
      this.state.caseList = partial.caseList ?? []
      this.state.error = undefined
      this.state.completedAt = undefined
      this.state.phaseTimings = {}
      this.state.phaseStartedAt = now
      this.persistTimings() // overwrite stale file from previous run
    }

    this.scheduleBroadcast()
  }

  /**
   * Get current state snapshot (for API responses).
   */
  getState(): Readonly<PatrolState> {
    return {
      ...this.state,
      phaseTimings: this.state.phaseTimings ? { ...this.state.phaseTimings } : undefined,
      caseList: [...this.state.caseList],
    }
  }

  /**
   * Check if patrol is in a running phase.
   */
  isRunning(): boolean {
    return !['idle', 'completed', 'failed'].includes(this.state.phase)
  }

  /**
   * Reset to idle (e.g., after lock cleanup).
   */
  reset(): void {
    this.state = defaultState()
    this.scheduleBroadcast()
  }

  // ─── Private ───

  /**
   * Determine if a lock file represents a dead patrol process.
   *
   * - webui source: always stale on server restart (SDK query is in-process,
   *   process restart = query is dead)
   * - cli source: check lock age and patrol-phase file mtime
   */
  private isLockStale(lock: any, lockPath: string, phasePath: string): boolean {
    // Age check (universal)
    const age = Date.now() - new Date(lock.startedAt).getTime()
    if (age > STALE_LOCK_MS) return true

    // WebUI: server just restarted → abortController is null → query is dead
    if (lock.source === 'webui') return true

    // CLI: check patrol-phase file mtime as heartbeat proxy
    try {
      if (existsSync(phasePath)) {
        const phaseAge = Date.now() - statSync(phasePath).mtimeMs
        if (phaseAge > STALE_LOCK_MS) return true
      }
    } catch { /* assume not stale */ }

    return false
  }

  /**
   * Persist phaseTimings + phaseStartedAt to disk (survives backend restart).
   * Only called on phase transitions — at most ~6 writes per patrol run.
   */
  private persistTimings(): void {
    try {
      const data = {
        phaseTimings: this.state.phaseTimings || {},
        phaseStartedAt: this.state.phaseStartedAt,
      }
      writeFileSync(this.timingsPath, JSON.stringify(data), 'utf-8')
    } catch { /* ignore write failures */ }
  }

  /**
   * Restore phaseTimings + phaseStartedAt from disk.
   */
  private restoreTimings(): void {
    try {
      if (existsSync(this.timingsPath)) {
        const data = JSON.parse(readFileSync(this.timingsPath, 'utf-8'))
        if (data.phaseTimings) this.state.phaseTimings = data.phaseTimings
        if (data.phaseStartedAt) this.state.phaseStartedAt = data.phaseStartedAt
      }
    } catch { /* ignore */ }
  }

  /**
   * Debounced SSE broadcast — coalesces rapid file-watcher events
   * (e.g., patrol-phase + patrol-progress.json written in same second).
   */
  private scheduleBroadcast(): void {
    if (this.broadcastTimer) clearTimeout(this.broadcastTimer)
    this.broadcastTimer = setTimeout(() => {
      this.broadcastTimer = null
      sseManager.broadcast('patrol-state' as SSEEventType, { ...this.state })
    }, BROADCAST_DEBOUNCE_MS)
  }
}

// Export singleton
export const patrolStateManager = new PatrolStateManager()

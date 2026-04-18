/**
 * patrol-orchestrator.ts — Thin SDK launcher for patrol
 *
 * Delegates ALL patrol logic to the /patrol skill via a single SDK query().
 * This file only handles: start, cancel, status, lock management, SSE bridging.
 *
 * State files (all in config.patrolDir):
 *   - patrol.lock       — mutual exclusion (exists while running)
 *   - patrol-phase      — single-line progress (written by /patrol skill)
 *   - patrol-state.json — final result (written by /patrol skill)
 *
 * Exports:
 *   - runSdkPatrol(force): Launch patrol via SDK query
 *   - isSdkPatrolRunning(): Check lock file
 *   - cancelSdkPatrol(): Abort SDK query + cleanup
 *   - getSdkPatrolLiveProgress(): Read patrol-phase for API
 *   - loadPatrolLastRun(): Read patrol-state.json
 */
import { query, type Options } from '@anthropic-ai/claude-agent-sdk'
import { existsSync, readFileSync, writeFileSync, mkdirSync, unlinkSync, statSync } from 'fs'
import { join, resolve } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { config } from '../config.js'
import { sseManager } from '../watcher/sse-manager.js'
import { loadAgentDefinitions } from './case-session-manager.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function getProjectRoot(): string {
  return resolve(__dirname, '..', '..', '..')
}

// ============================================================
// Types
// ============================================================

export interface PatrolResult {
  phase: 'completed' | 'failed'
  source: 'cli' | 'webui'
  totalCases: number
  changedCases: number
  processedCases: number
  caseResults: Array<{
    caseNumber: string
    status: string
    actions?: string
    error?: string
  }>
  wallClockMinutes: number
  error?: string
  startedAt: string
  completedAt: string
}

interface PatrolLock {
  source: 'cli' | 'webui'
  pid: number
  startedAt: string
  force: boolean
  sessionId?: string
}

// ============================================================
// Module state
// ============================================================

let abortController: AbortController | null = null

// ============================================================
// Lock management
// ============================================================

const STALE_LOCK_MS = 60 * 60 * 1000 // 60 minutes

function lockPath(): string {
  return join(config.patrolDir, 'patrol.lock')
}

function readLock(): PatrolLock | null {
  try {
    if (!existsSync(lockPath())) return null
    return JSON.parse(readFileSync(lockPath(), 'utf-8')) as PatrolLock
  } catch { return null }
}

function isLockStale(lock: PatrolLock): boolean {
  // Check age
  const age = Date.now() - new Date(lock.startedAt).getTime()
  if (age > STALE_LOCK_MS) return true

  // For WebUI: if abortController is null, SDK query already finished/crashed
  // but lock wasn't cleaned up (process crash, uncaught exception)
  if (lock.source === 'webui') {
    if (!abortController) return true // no active query → stale
    return false
  }

  // For CLI-originated, check phase file age as proxy
  try {
    const phaseFile = join(config.patrolDir, 'patrol-phase')
    if (existsSync(phaseFile)) {
      const phaseAge = Date.now() - statSync(phaseFile).mtimeMs
      if (phaseAge > STALE_LOCK_MS) return true
    }
  } catch { /* not stale */ }

  return false
}

function writeLock(force: boolean): void {
  const patrolDir = config.patrolDir
  if (!existsSync(patrolDir)) mkdirSync(patrolDir, { recursive: true })
  const lock: PatrolLock = {
    source: 'webui',
    pid: process.pid,
    startedAt: new Date().toISOString(),
    force,
  }
  writeFileSync(lockPath(), JSON.stringify(lock, null, 2), 'utf-8')
}

function removeLock(): void {
  try { if (existsSync(lockPath())) unlinkSync(lockPath()) } catch { /* ignore */ }
}

// ============================================================
// Public API
// ============================================================

/**
 * Launch patrol via SDK query("/patrol").
 * All actual patrol logic lives in .claude/skills/patrol/SKILL.md.
 */
export async function runSdkPatrol(force: boolean): Promise<PatrolResult> {
  // Check mutual exclusion
  const existingLock = readLock()
  if (existingLock && !isLockStale(existingLock)) {
    throw new Error(`Patrol already running (source=${existingLock.source}, since ${existingLock.startedAt})`)
  }
  if (existingLock && isLockStale(existingLock)) {
    console.warn('[sdk-patrol] Removing stale lock from', existingLock.startedAt)
    removeLock()
  }

  // Acquire lock
  writeLock(force)
  abortController = new AbortController()

  const startedAt = new Date().toISOString()
  console.log(`[sdk-patrol] Starting patrol via SDK query (force=${force})`)

  // CRITICAL: Reset patrol-phase file to prevent stale "completed" from previous run
  // being read by scanPatrolProgress() before the SDK agent writes "discovering"
  try {
    const phaseFile = join(config.patrolDir, 'patrol-phase')
    writeFileSync(phaseFile, 'starting', 'utf-8')
  } catch { /* ignore */ }

  sseManager.broadcast('patrol-state' as any, {
    phase: 'starting',
    detail: 'Launching patrol via SDK...',
  })

  try {
    const promptText = force
      ? 'Execute /patrol with force mode enabled (skip lastInspected check, process all cases). source=webui'
      : 'Execute /patrol. source=webui'

    // Single SDK query that runs the entire patrol
    // Uses same config pattern as case-session-manager.ts processCaseSession()
    const projectRoot = getProjectRoot()
    const claudeMdPath = join(projectRoot, 'CLAUDE.md')
    const claudeMdContent = existsSync(claudeMdPath) ? readFileSync(claudeMdPath, 'utf-8') : ''

    let sdkSessionId: string | null = null

    for await (const message of query({
      prompt: promptText,
      options: {
        abortController,
        cwd: projectRoot,
        settingSources: ['user'] as Options['settingSources'],
        agents: loadAgentDefinitions(),
        systemPrompt: {
          type: 'preset' as const,
          preset: 'claude_code' as const,
          append: claudeMdContent,
        },
        tools: ['Bash', 'Read', 'Write', 'Edit', 'Glob', 'Grep', 'Agent'],
        allowedTools: ['Bash', 'Read', 'Write', 'Edit', 'Glob', 'Grep', 'Agent'],
        permissionMode: 'bypassPermissions',
        allowDangerouslySkipPermissions: true,
        maxTurns: 300,
        stderr: (data: string) => console.error(`[SDK:stderr:patrol]`, data.trim()),
      },
    })) {
      // Extract session ID from first message
      if (!sdkSessionId && 'session_id' in message) {
        sdkSessionId = (message as any).session_id
        console.log(`[sdk-patrol] Session ID: ${sdkSessionId}`)
        // Update lock file with session ID
        try {
          const lock = readLock()
          if (lock) {
            lock.sessionId = sdkSessionId!
            writeFileSync(lockPath(), JSON.stringify(lock, null, 2), 'utf-8')
          }
        } catch { /* ignore */ }
        sseManager.broadcast('patrol-state' as any, {
          phase: 'starting',
          detail: `SDK session started`,
          sessionId: sdkSessionId,
        })
      }
      // Progress is handled by file-watcher → SSE (patrol-phase, .casework/events, pipeline-state)
    }

    console.log(`[sdk-patrol] SDK query completed`)

    // Read the result written by /patrol skill
    const patrolResult = loadPatrolLastRun() as PatrolResult | null

    if (patrolResult) {
      sseManager.broadcast('patrol-state' as any, { ...patrolResult, phase: patrolResult.phase || 'completed' })
      sseManager.broadcast('patrol-updated' as any, { reason: 'patrol-completed' })
      sseManager.broadcast('sessions-changed' as any, { reason: 'patrol-completed' })
      return patrolResult
    }

    // Fallback: skill didn't write state (shouldn't happen)
    const fallback: PatrolResult = {
      phase: 'completed',
      source: 'webui',
      totalCases: 0,
      changedCases: 0,
      processedCases: 0,
      caseResults: [],
      wallClockMinutes: Math.round((Date.now() - new Date(startedAt).getTime()) / 60000),
      startedAt,
      completedAt: new Date().toISOString(),
    }
    return fallback

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    const isAbort = msg.includes('abort')
    console.error(`[sdk-patrol] ${isAbort ? 'Cancelled' : 'Failed'}:`, msg)

    sseManager.broadcast('patrol-state' as any, {
      phase: 'failed',
      error: isAbort ? 'Patrol cancelled by user' : msg,
    })

    const failResult: PatrolResult = {
      phase: 'failed',
      source: 'webui',
      totalCases: 0,
      changedCases: 0,
      processedCases: 0,
      caseResults: [],
      wallClockMinutes: Math.round((Date.now() - new Date(startedAt).getTime()) / 60000),
      error: msg,
      startedAt,
      completedAt: new Date().toISOString(),
    }
    return failResult

  } finally {
    removeLock()
    abortController = null
  }
}

/** Check if patrol is running (lock file exists and not stale) */
export function isSdkPatrolRunning(): boolean {
  const lock = readLock()
  if (!lock) return false
  if (isLockStale(lock)) {
    console.warn('[sdk-patrol] Cleaning stale lock')
    removeLock()
    return false
  }
  return true
}

/** Get current patrol progress by reading lock + patrol-progress.json */
export function getSdkPatrolLiveProgress(): Record<string, unknown> | null {
  const lock = readLock()
  if (!lock) return null

  const result: Record<string, unknown> = {
    source: lock.source,
    startedAt: lock.startedAt,
    force: lock.force,
    sessionId: lock.sessionId || null,
  }

  // Read patrol-progress.json (written by patrol skill)
  try {
    const progressFile = config.patrolProgressFile
    if (existsSync(progressFile)) {
      const progress = JSON.parse(readFileSync(progressFile, 'utf-8'))
      Object.assign(result, progress)
    }
  } catch { /* ignore */ }

  return result
}

/** Cancel the current patrol */
export function cancelSdkPatrol(): boolean {
  if (!abortController) return false
  console.log('[sdk-patrol] Cancel requested')
  abortController.abort()
  return true
}

/** Load last patrol result from patrol-state.json */
export function loadPatrolLastRun(): Record<string, unknown> | null {
  try {
    const stateFile = config.patrolStateFile
    if (existsSync(stateFile)) {
      return JSON.parse(readFileSync(stateFile, 'utf-8'))
    }
  } catch { /* ignore */ }
  return null
}

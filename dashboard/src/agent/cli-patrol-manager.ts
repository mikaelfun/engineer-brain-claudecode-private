/**
 * cli-patrol-manager.ts — Thin Shell: launch CLI patrol as child process
 *
 * Instead of orchestrating patrol logic in TypeScript (500+ lines of race conditions),
 * we delegate everything to `claude -p "/patrol"` which follows SKILL.md.
 * WebUI only monitors file system changes (.patrol-phase, .patrol-result.json)
 * and broadcasts SSE events to the frontend.
 */
import { spawn, ChildProcess } from 'child_process'
import { existsSync, readFileSync, writeFileSync, statSync, mkdirSync, unlinkSync } from 'fs'
import { join, resolve } from 'path'
import { config } from '../config.js'
import { sseManager } from '../watcher/sse-manager.js'

let patrolProcess: ChildProcess | null = null
let patrolStartedAt: string | null = null
let phasePollerInterval: NodeJS.Timeout | null = null

// ---- Patrol result persistence ----
const PATROL_LAST_RUN_PATH = config.patrolLastRunFile

function savePatrolLastRun(data: Record<string, unknown>): void {
  try {
    writeFileSync(PATROL_LAST_RUN_PATH, JSON.stringify(data, null, 2), 'utf-8')
  } catch (err) {
    console.warn('[cli-patrol] Failed to save last run:', err)
  }
  // Also write casehealth-state.json for Dashboard "Last Patrol" card
  try {
    const stateFile = config.patrolStateFile
    const stateData: Record<string, unknown> = {
      lastPatrol: data.completedAt || data.startedAt || new Date().toISOString(),
      currentPatrolStartedAt: data.startedAt,
      patrolType: data.phase === 'completed' ? 'full' : String(data.phase || 'unknown'),
      lastRunTiming: {
        caseCount: data.changedCases ?? data.totalCases ?? 0,
        wallClockMinutes: data.wallClockMinutes ?? 0,
        computeSeconds: 0,
        bottlenecks: [],
      },
    }
    writeFileSync(stateFile, JSON.stringify(stateData, null, 2), 'utf-8')
  } catch (err) {
    console.warn('[cli-patrol] Failed to save patrol state:', err)
  }
}

export function loadPatrolLastRun(): Record<string, unknown> | null {
  try {
    if (existsSync(PATROL_LAST_RUN_PATH)) {
      return JSON.parse(readFileSync(PATROL_LAST_RUN_PATH, 'utf-8'))
    }
  } catch { /* ignore */ }
  return null
}

// ---- Start/Stop/Query ----

export function startCliPatrol(force: boolean): boolean {
  if (patrolProcess) {
    console.warn('[cli-patrol] Patrol already running, ignoring start request')
    return false
  }

  patrolStartedAt = new Date().toISOString()

  // Ensure .patrol directory exists
  const patrolDir = join(config.casesDir, '.patrol')
  try {
    if (!existsSync(patrolDir)) {
      mkdirSync(patrolDir, { recursive: true })
    }
  } catch (err) {
    console.warn('[cli-patrol] Failed to create .patrol dir:', err)
  }

  // Delete stale result.json from previous run to avoid false-positive completion
  const resultFile = join(patrolDir, 'result.json')
  try {
    if (existsSync(resultFile)) {
      unlinkSync(resultFile)
      console.log('[cli-patrol] Deleted stale result.json from previous run')
    }
  } catch { /* ignore */ }

  // Write initial phase file so file-watcher can broadcast immediately
  try {
    writeFileSync(join(config.casesDir, '.patrol', 'phase'), 'starting', 'utf-8')
  } catch { /* ignore */ }

  // Broadcast initial state via SSE
  sseManager.broadcast('patrol-progress' as any, {
    phase: 'starting',
    detail: 'Launching CLI patrol process...',
  })

  const promptText = force
    ? 'Execute /patrol with force mode enabled (skip lastInspected check, process all cases). casesRoot=./cases (relative path, do NOT resolve to absolute Windows path)'
    : 'Execute /patrol. casesRoot=./cases (relative path, do NOT resolve to absolute Windows path)'

  patrolProcess = spawn('claude', [
    '-p', promptText,
    '--allowedTools', 'Bash,Read,Write,Glob,Grep,Agent',
    '--dangerously-skip-permissions',
  ], {
    cwd: config.projectRoot,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
  })

  const pid = patrolProcess.pid
  console.log(`[cli-patrol] Started patrol CLI process (PID: ${pid}, force: ${force})`)

  // Poll phase file every 5s as backup for file-watcher (Windows can miss overwrites)
  let lastPolledPhase = 'starting'
  const phaseFile = join(config.casesDir, '.patrol', 'phase')
  phasePollerInterval = setInterval(() => {
    try {
      if (!existsSync(phaseFile)) return
      const raw = readFileSync(phaseFile, 'utf-8').trim()
      if (raw && raw !== lastPolledPhase) {
        lastPolledPhase = raw
        const [phase, progress] = raw.split('|')
        const data: Record<string, unknown> = { phase }
        if (progress) {
          const [done, total] = progress.split('/')
          data.processedCases = parseInt(done, 10) || 0
          data.changedCases = parseInt(total, 10) || 0
          data.detail = `${done}/${total} cases done`
        }
        console.log(`[cli-patrol] Phase poll detected: ${raw}`)
        sseManager.broadcast('patrol-progress' as any, data)
      }
    } catch { /* ignore */ }
  }, 5000)

  // Collect stderr for error reporting
  let stderrBuf = ''
  patrolProcess.stderr?.on('data', (chunk: Buffer) => {
    const text = chunk.toString()
    stderrBuf += text
    // Keep only last 2KB of stderr
    if (stderrBuf.length > 2048) {
      stderrBuf = stderrBuf.slice(-2048)
    }
  })

  // Collect stdout (for debugging only, not parsed)
  patrolProcess.stdout?.on('data', (chunk: Buffer) => {
    const text = chunk.toString().trim()
    if (text) {
      console.log(`[cli-patrol:stdout] ${text.slice(0, 200)}`)
    }
  })

  patrolProcess.on('exit', (code, signal) => {
    const completedAt = new Date().toISOString()
    const durationMs = patrolStartedAt
      ? new Date(completedAt).getTime() - new Date(patrolStartedAt).getTime()
      : 0

    console.log(`[cli-patrol] Process exited (code=${code}, signal=${signal}, duration=${Math.round(durationMs / 1000)}s)`)

    // Read result.json with retry — file may still be flushing when process exits
    const resultFile = join(config.casesDir, '.patrol', 'result.json')
    const savedStartedAt = patrolStartedAt

    const tryReadAndBroadcast = (attempt: number) => {
      let result: Record<string, unknown> | null = null
      try {
        if (existsSync(resultFile)) {
          result = JSON.parse(readFileSync(resultFile, 'utf-8'))
        }
      } catch { /* ignore parse errors */ }

      if (code === 0 && result) {
        // Success — use the structured result from CLI
        const persistData = {
          ...result,
          startedAt: savedStartedAt,
          completedAt,
          wallClockMinutes: Math.round(durationMs / 60000),
        }
        savePatrolLastRun(persistData)
        sseManager.broadcast('patrol-progress' as any, {
          phase: 'completed',
          ...result,
        })
        sseManager.broadcast('patrol-updated' as any, {
          todoSummary: (result as any).todoSummary,
          processedCases: (result as any).processedCases,
          changedCases: (result as any).changedCases,
          totalCases: (result as any).totalCases,
        })
        console.log(`[cli-patrol] Result broadcast on attempt ${attempt + 1}`)
      } else if (code === 0 && attempt < 3) {
        // Retry — result.json may not be flushed yet
        console.log(`[cli-patrol] result.json not ready, retry ${attempt + 1}/3 in ${(attempt + 1) * 500}ms`)
        setTimeout(() => tryReadAndBroadcast(attempt + 1), (attempt + 1) * 500)
        return // don't clean up yet
      } else {
        // Final failure or non-zero exit
        const errorMsg = code !== 0
          ? `CLI patrol exited with code ${code}${signal ? ` (signal: ${signal})` : ''}${stderrBuf ? `: ${stderrBuf.slice(-500)}` : ''}`
          : 'Patrol completed but no result file found after retries'

        const failData = {
          phase: code === 0 ? 'completed' : 'failed',
          error: code !== 0 ? errorMsg : undefined,
          startedAt: savedStartedAt,
          completedAt,
          wallClockMinutes: Math.round(durationMs / 60000),
        }
        savePatrolLastRun(failData)
        sseManager.broadcast('patrol-progress' as any, failData)
      }

      // Clean up phase file
      try {
        writeFileSync(join(config.casesDir, '.patrol', 'phase'), code === 0 ? 'completed' : 'failed', 'utf-8')
      } catch { /* ignore */ }
    }

    patrolProcess = null
    patrolStartedAt = null
    if (phasePollerInterval) { clearInterval(phasePollerInterval); phasePollerInterval = null }

    tryReadAndBroadcast(0)
  })

  patrolProcess.on('error', (err) => {
    console.error('[cli-patrol] Failed to start process:', err.message)
    if (phasePollerInterval) { clearInterval(phasePollerInterval); phasePollerInterval = null }
    sseManager.broadcast('patrol-progress' as any, {
      phase: 'failed',
      error: `Failed to start CLI patrol: ${err.message}`,
    })
    patrolProcess = null
    patrolStartedAt = null
  })

  return true
}

export function cancelCliPatrol(): boolean {
  if (!patrolProcess) return false

  console.log('[cli-patrol] Cancelling patrol...')
  if (phasePollerInterval) { clearInterval(phasePollerInterval); phasePollerInterval = null }

  // Write stop signal for teams-search queue (if running)
  try {
    writeFileSync(join(config.casesDir, '.patrol', 'teams-queue-stop'), Date.now().toString(), 'utf-8')
  } catch { /* ignore */ }

  // On Windows, SIGTERM doesn't work well. Use taskkill.
  if (process.platform === 'win32' && patrolProcess.pid) {
    try {
      const { execSync } = require('child_process')
      execSync(`taskkill /PID ${patrolProcess.pid} /T /F`, { stdio: 'ignore' })
    } catch {
      patrolProcess.kill('SIGKILL')
    }
  } else {
    patrolProcess.kill('SIGTERM')
  }

  sseManager.broadcast('patrol-progress' as any, {
    phase: 'failed',
    error: 'Patrol cancelled by user',
  })

  patrolProcess = null
  patrolStartedAt = null
  return true
}

export function isCliPatrolRunning(): boolean {
  // Check both: our own spawned process OR external CLI patrol (detected via .patrol-phase file)
  if (patrolProcess !== null) return true

  // Check .patrol-phase file for external CLI patrol
  try {
    const phaseFile = join(config.casesDir, '.patrol', 'phase')
    if (existsSync(phaseFile)) {
      const phase = readFileSync(phaseFile, 'utf-8').trim()
      const activePhases = ['starting', 'discovering', 'filtering', 'warming-up', 'processing', 'aggregating']
      if (activePhases.includes(phase)) {
        // Verify file is recent (< 30 min) to avoid stale detection
        const stat = statSync(phaseFile)
        const ageMs = Date.now() - stat.mtimeMs
        if (ageMs < 30 * 60 * 1000) return true
      }
    }
  } catch { /* ignore */ }

  return false
}

export function getPatrolStartedAt(): string | null {
  return patrolStartedAt
}

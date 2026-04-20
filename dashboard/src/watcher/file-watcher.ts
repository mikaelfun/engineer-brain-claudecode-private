/**
 * file-watcher.ts — chokidar 文件监控
 */
import chokidar from 'chokidar'
import { join } from 'path'
import { readFileSync, statSync, writeFileSync, existsSync } from 'fs'
import { config } from '../config.js'
import { sseManager } from './sse-manager.js'
import { patrolStateManager } from '../services/patrol-state-manager.js'
import { getSkillRegistry } from '../services/skill-registry.js'
import type { SSEEventType } from '../types/index.js'

let watcher: ReturnType<typeof chokidar.watch> | null = null
let heartbeatInterval: NodeJS.Timeout | null = null

// Supervisor heartbeat timeout: if supervisor.json says "running" but
// hasn't been modified for this many seconds, assume agent died (context limit)
const SUPERVISOR_HEARTBEAT_TIMEOUT_S = 120

// Track previous supervisor status for transition detection
let lastSupervisorStatus: string | null = null

// Supervisor statuses that indicate an active run
const ACTIVE_SUPERVISOR_STATUSES = new Set([
  'running', 'scanning', 'generating', 'testing', 'fixing', 'verifying',
])

// Debounce map: path → timeout
const debounceMap = new Map<string, NodeJS.Timeout>()

function debounceEmit(eventType: SSEEventType, data: Record<string, unknown>, key: string) {
  const existing = debounceMap.get(key)
  if (existing) clearTimeout(existing)

  debounceMap.set(key, setTimeout(() => {
    debounceMap.delete(key)
    sseManager.broadcast(eventType, data)
  }, 500))
}

function classifyChange(filePath: string): { type: SSEEventType; data: Record<string, unknown> } | null {
  const normalized = filePath.replace(/\\/g, '/')

  // Since we watch directories (not globs) on Windows, filter irrelevant files early
  const ext = normalized.split('.').pop()?.toLowerCase()
  const isRelevantExt = ['md', 'json', 'log'].includes(ext || '')
  // Special cases: patrol-phase has no extension, patrol.lock
  const isSpecialFile = normalized.endsWith('patrol-phase') || normalized.endsWith('patrol.lock')
  if (!isRelevantExt && !isSpecialFile) return null

  // Case files
  if (normalized.includes('/cases/active/')) {
    const caseMatch = normalized.match(/\/cases\/active\/(\d+)\//)
    const caseNumber = caseMatch?.[1] || ''

    // Per-case todo files → todo-updated (must check before generic case-updated)
    if (normalized.includes('/todo/')) {
      return { type: 'todo-updated', data: { caseNumber } }
    }
    if (normalized.endsWith('casework-meta.json') || normalized.endsWith('case-info.md')) {
      return { type: 'case-updated', data: { caseNumber } }
    }
    if (normalized.includes('/drafts/')) {
      return { type: 'draft-updated', data: { caseNumber } }
    }

    // Per-case unified progress tracking (state.json)
    if (normalized.endsWith('/.casework/state.json')) {
      try {
        const caseState = JSON.parse(readFileSync(filePath, 'utf-8'))
        return { type: 'patrol-case' as SSEEventType, data: caseState }
      } catch { return null }
    }

    return { type: 'case-updated', data: { caseNumber } }
  }

  // Legacy global todo files (deprecated, kept for backward compat)
  if (normalized.includes('/cases/todo/')) {
    return { type: 'todo-updated', data: {} }
  }

  // Patrol progress (structured JSON — written by patrol skill)
  // → Route through PatrolStateManager (single source of truth)
  if (normalized.includes('patrol-progress.json')) {
    try {
      const progress = JSON.parse(readFileSync(filePath, 'utf-8'))
      patrolStateManager.update(progress)
    } catch { /* ignore */ }
    return null // StateManager handles SSE broadcast
  }

  // Patrol final result (patrol-state.json)
  // For CLI-originated patrols, this is the primary completion signal
  // (orchestrator only handles WebUI patrols)
  if (normalized.includes('patrol-state.json') && !normalized.includes('patrol-progress')) {
    try {
      const result = JSON.parse(readFileSync(filePath, 'utf-8'))
      if (result.phase === 'completed' || result.phase === 'failed') {
        patrolStateManager.update({
          phase: result.phase,
          totalCases: result.totalCases,
          changedCases: result.changedCases,
          processedCases: result.processedCases,
          startedAt: result.startedAt,
          completedAt: result.completedAt,
          error: result.error,
        })
      }
    } catch { /* ignore */ }
    return null // StateManager handles SSE broadcast
  }

  // Patrol lock (running/stopped)
  // → Route through PatrolStateManager
  if (normalized.endsWith('patrol.lock')) {
    try {
      if (existsSync(filePath)) {
        const lock = JSON.parse(readFileSync(filePath, 'utf-8'))
        patrolStateManager.update({ phase: 'initializing', source: lock.source })
      } else {
        // Lock removed — if state manager still thinks running, it was a stale cleanup
        // Don't reset to idle here; orchestrator handles terminal states
      }
    } catch { /* ignore */ }
    return null // StateManager handles SSE broadcast
  }

  // Patrol phase file — written by /patrol skill
  // → Route through PatrolStateManager
  if (normalized.endsWith('patrol-phase')) {
    try {
      const raw = readFileSync(filePath, 'utf-8').trim()
      const [phase, progress] = raw.split('|')
      const update: Record<string, unknown> = { phase }
      if (progress) {
        const [done, total] = progress.split('/')
        update.processedCases = parseInt(done, 10) || 0
        update.changedCases = parseInt(total, 10) || 0
      }
      patrolStateManager.update(update as any)
    } catch { /* ignore */ }
    return null // StateManager handles SSE broadcast
  }

  // Per-case phase — written by casework-light agent
  if (normalized.endsWith('case-phase.json')) {
    try {
      const casePhase = JSON.parse(readFileSync(filePath, 'utf-8'))
      // Extract case number from path: .../active/{caseNumber}/case-phase.json
      const parts = normalized.split('/')
      const activeIdx = parts.indexOf('active')
      const caseNumber = activeIdx >= 0 ? parts[activeIdx + 1] : 'unknown'
      return {
        type: 'case-progress' as SSEEventType,
        data: { caseNumber, ...casePhase },
      }
    } catch { return null }
  }

  // Cron jobs
  if (normalized.includes('cron/jobs.json')) {
    return { type: 'cron-updated', data: {} }
  }

  // Test supervisor files — split state model (pipeline.json, queues.json, stats.json, supervisor.json)
  if (normalized.includes('/tests/pipeline.json')) {
    try {
      const raw = readFileSync(filePath, 'utf8')
      const pipeline = JSON.parse(raw)
      return {
        type: 'test-pipeline-updated',
        data: {
          currentStage: pipeline.currentStage,
          cycle: pipeline.cycle,
          currentTest: pipeline.currentTest || null,
        },
      }
    } catch {
      return { type: 'test-pipeline-updated', data: {} }
    }
  }
  if (normalized.includes('/tests/supervisor.json')) {
    try {
      const raw = readFileSync(filePath, 'utf8')
      const sup = JSON.parse(raw)
      const currentStatus = sup.status as string

      // Detect active→idle transition: broadcast runner-status-changed for frontend auto-recovery
      const wasActive = lastSupervisorStatus !== null && ACTIVE_SUPERVISOR_STATUSES.has(lastSupervisorStatus)
      const isNowActive = ACTIVE_SUPERVISOR_STATUSES.has(currentStatus)
      const isNowInactive = !isNowActive
      // idle→active: external CLI run started
      if (!wasActive && isNowActive && lastSupervisorStatus !== null) {
        debounceEmit('runner-status-changed' as SSEEventType, {
          status: 'external',
          source: 'cli',
          supervisorStatus: currentStatus,
        }, 'runner-status-changed:external-start')
      }
      // active→idle: external CLI run ended
      if (wasActive && isNowInactive) {
        debounceEmit('runner-status-changed' as SSEEventType, {
          status: 'idle',
          externalRunEnded: true,
        }, 'runner-status-changed:external-end')
      }
      lastSupervisorStatus = currentStatus

      return {
        type: 'test-supervisor-updated',
        data: {
          status: sup.status,
          tick: sup.tick,
          step: sup.step,
          hasSelfHeal: !!sup.selfHealEvent,
          reasoning: sup.reasoning,
        },
      }
    } catch {
      return { type: 'test-supervisor-updated', data: {} }
    }
  }
  if (normalized.includes('/tests/queues.json')) {
    try {
      const raw = readFileSync(filePath, 'utf8')
      const q = JSON.parse(raw)
      return {
        type: 'test-queues-updated',
        data: {
          test: (q.testQueue || []).length,
          fix: (q.fixQueue || []).length,
          verify: (q.verifyQueue || []).length,
          regression: (q.regressionQueue || []).length,
        },
      }
    } catch {
      return { type: 'test-queues-updated', data: {} }
    }
  }
  if (normalized.includes('/tests/stats.json')) {
    try {
      const raw = readFileSync(filePath, 'utf8')
      const stats = JSON.parse(raw)
      return {
        type: 'test-stats-updated',
        data: {
          cumulative: stats.cumulative,
          cycleStats: stats.cycleStats,
        },
      }
    } catch {
      return { type: 'test-stats-updated', data: {} }
    }
  }
  // Legacy state.json (still watched for backward compat during migration)
  if (normalized.includes('/tests/state.json')) {
    // Read state.json to extract key context for SSE event
    try {
      const raw = readFileSync(filePath, 'utf8')
      const state = JSON.parse(raw)
      const queues = {
        test: (state.testQueue || []).length,
        fix: (state.fixQueue || []).length,
        verify: (state.verifyQueue || []).length,
        regression: (state.regressionQueue || []).length,
      }
      // Find latest phaseHistory entry for action context
      const history = state.phaseHistory || []
      const latest = history.length > 0 ? history[history.length - 1] : null
      return {
        type: 'test-state-updated',
        data: {
          phase: state.phase,
          round: state.round,
          queues,
          action: latest?.action,
          testId: latest?.testId,
          currentTest: state.currentTest || null,
        },
      }
    } catch {
      return { type: 'test-state-updated', data: {} }
    }
  }
  if (normalized.includes('/tests/discoveries.json')) {
    return { type: 'test-discoveries-updated', data: {} }
  }
  if (normalized.includes('/tests/evolution.json')) {
    return { type: 'test-evolution-updated', data: {} }
  }
  if (normalized.includes('/tests/directives.json')) {
    return { type: 'test-directives-updated', data: {} }
  }
  if (normalized.includes('/tests/results/') && normalized.endsWith('.json')) {
    return { type: 'test-result-updated', data: {} }
  }

  if (normalized.includes('/.claude/skills/') && normalized.endsWith('/SKILL.md')) {
    try { getSkillRegistry().reloadSkill(normalized) } catch {}
    return { type: 'skill-registry-updated', data: {} }
  }

  return null
}

export function startFileWatcher() {
  // IMPORTANT: On Windows, chokidar glob patterns (e.g. **/*.json) fail silently —
  // 0 files matched. Use directory paths instead and filter in classifyChange().
  // See: https://github.com/paulmillr/chokidar/issues/1289
  const watchPaths = [
    config.activeCasesDir,  // Watch entire active cases directory (replaces broken glob)
    config.todoDir,         // Watch todo directory (replaces broken glob)
    config.patrolStateFile,
    config.patrolProgressFile,   // New: structured JSON for WebUI
    config.archiveSummaryFile,   // Archive/transfer summary from detect-case-status.ps1
    join(config.patrolDir, 'patrol.lock'),
    join(config.patrolDir, 'patrol-phase'),
    config.cronJobsFile,
    join(config.projectRoot, 'tests', 'state.json'),
    join(config.projectRoot, 'tests', 'pipeline.json'),
    join(config.projectRoot, 'tests', 'supervisor.json'),
    join(config.projectRoot, 'tests', 'queues.json'),
    join(config.projectRoot, 'tests', 'stats.json'),
    join(config.projectRoot, 'tests', 'discoveries.json'),
    join(config.projectRoot, 'tests', 'evolution.json'),
    join(config.projectRoot, 'tests', 'directives.json'),
    join(config.projectRoot, 'tests', 'results'),  // Watch directory (replaces broken glob)
    join(config.projectRoot, '.claude', 'skills'),  // Watch directory (replaces broken glob)
  ]

  console.log('[watcher] Starting file watcher...')
  console.log('[watcher] Watching:', watchPaths.map(p => p.replace(/\\/g, '/')))

  watcher = chokidar.watch(watchPaths, {
    ignoreInitial: true,
    // IMPORTANT: don't ignore dotfiles/dotdirs — .casework/ contains
    // state.json needed for SSE
    ignored: undefined,
    awaitWriteFinish: {
      stabilityThreshold: 300,
      pollInterval: 100,
    },
  })

  watcher.on('change', (changedPath: string) => {
    const event = classifyChange(changedPath)
    if (event) {
      console.log(`[watcher] File changed: ${changedPath} → ${event.type}`)
      debounceEmit(event.type, event.data, `${event.type}:${JSON.stringify(event.data)}`)
    }
  })

  watcher.on('add', (addedPath: string) => {
    const event = classifyChange(addedPath)
    if (event) {
      console.log(`[watcher] File added: ${addedPath} → ${event.type}`)
      debounceEmit(event.type, event.data, `${event.type}:${JSON.stringify(event.data)}`)
    }
  })

  // Handle file deletions — specifically patrol.lock removal (CLI patrol completion)
  watcher.on('unlink', (removedPath: string) => {
    const normalized = removedPath.replace(/\\/g, '/')
    if (normalized.endsWith('patrol.lock') && patrolStateManager.isRunning()) {
      console.log(`[watcher] patrol.lock removed — checking for final result`)
      // Lock removed while StateManager still thinks running → CLI patrol ended
      // Try to read patrol-state.json for the final result
      try {
        if (existsSync(config.patrolStateFile)) {
          const result = JSON.parse(readFileSync(config.patrolStateFile, 'utf-8'))
          patrolStateManager.update({
            phase: result.phase || 'completed',
            totalCases: result.totalCases,
            changedCases: result.changedCases,
            processedCases: result.processedCases,
            completedAt: result.completedAt || new Date().toISOString(),
          })
          return
        }
      } catch { /* ignore */ }
      // No state file found — default to completed
      patrolStateManager.update({ phase: 'completed' })
    }
  })

  watcher.on('error', (err: unknown) => {
    console.error('[watcher] Error:', err)
  })

  console.log('[watcher] File watcher started')

  // Start supervisor heartbeat checker
  const supervisorPath = join(config.projectRoot, 'tests', 'supervisor.json')
  const pipelinePath = join(config.projectRoot, 'tests', 'pipeline.json')

  heartbeatInterval = setInterval(() => {
    try {
      // Only check when something is supposed to be running
      // Read pipeline first to see if anything is active
      let pipe: any = null
      try {
        pipe = JSON.parse(readFileSync(pipelinePath, 'utf8'))
      } catch { return }

      // If pipeline is already idle, nothing to check — skip entirely
      if (pipe.pipelineStatus !== 'running') return

      const raw = readFileSync(supervisorPath, 'utf8')
      const sup = JSON.parse(raw)

      // Pipeline says "running" — check if any agent is actually alive
      const queuesPath = join(config.projectRoot, 'tests', 'queues.json')
      let mostRecentAge = Infinity
      for (const f of [supervisorPath, pipelinePath, queuesPath]) {
        try { mostRecentAge = Math.min(mostRecentAge, (Date.now() - statSync(f).mtimeMs) / 1000) } catch {}
      }

      if (mostRecentAge > SUPERVISOR_HEARTBEAT_TIMEOUT_S) {
        const deadAgent = sup.status === 'running' ? 'Supervisor' : 'Stage-worker'
        console.log(`[watcher] ⚠️ ${deadAgent} heartbeat timeout: ${Math.round(mostRecentAge)}s since last state update (stage: ${pipe.currentStage}, step: ${sup.step}). Auto-resetting.`)

        // Reset supervisor if it claims to be running
        if (sup.status === 'running') {
          const supData = { ...sup, status: 'idle', step: null, active: null }
          writeFileSync(supervisorPath, JSON.stringify(supData, null, 2) + '\n')
        }

        // Reset pipeline
        pipe.pipelineStatus = 'idle'
        pipe.stopReason = 'context_limit'
        // Build accurate stopDetail from stageProgress
        const progress = pipe.stageProgress
        const progressInfo = progress?.current && progress?.total
          ? ` (was processing item ${progress.current}/${progress.total}: ${progress.testId || 'unknown'})`
          : ''
        pipe.stopDetail = `${deadAgent} stopped responding during ${pipe.currentStage || 'unknown'}${progressInfo} — ${Math.round(mostRecentAge)}s timeout`
        if (pipe.currentStage && pipe.stages?.[pipe.currentStage]?.status === 'running') {
          pipe.stages[pipe.currentStage].status = 'interrupted'
        }
        writeFileSync(pipelinePath, JSON.stringify(pipe, null, 2) + '\n')

        sseManager.broadcast('runner-status-changed' as SSEEventType, {
          status: 'idle',
          reason: 'context_limit',
          lastStage: pipe.currentStage,
        })

        lastSupervisorStatus = 'idle'
      }
    } catch { /* supervisor.json doesn't exist or can't be read */ }
  }, 30_000) // Check every 30 seconds
}

export function stopFileWatcher() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval)
    heartbeatInterval = null
  }
  if (watcher) {
    watcher.close()
    watcher = null
    console.log('[watcher] File watcher stopped')
  }
}

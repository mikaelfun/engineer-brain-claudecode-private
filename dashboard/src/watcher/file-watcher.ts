/**
 * file-watcher.ts — chokidar 文件监控
 */
import chokidar from 'chokidar'
import { join } from 'path'
import { readFileSync } from 'fs'
import { config } from '../config.js'
import { sseManager } from './sse-manager.js'
import type { SSEEventType } from '../types/index.js'

let watcher: ReturnType<typeof chokidar.watch> | null = null

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

  // Case files
  if (normalized.includes('/cases/active/')) {
    const caseMatch = normalized.match(/\/cases\/active\/(\d+)\//)
    const caseNumber = caseMatch?.[1] || ''

    // Per-case todo files → todo-updated (must check before generic case-updated)
    if (normalized.includes('/todo/')) {
      return { type: 'todo-updated', data: { caseNumber } }
    }
    if (normalized.endsWith('casehealth-meta.json') || normalized.endsWith('case-info.md')) {
      return { type: 'case-updated', data: { caseNumber } }
    }
    if (normalized.includes('/drafts/')) {
      return { type: 'draft-updated', data: { caseNumber } }
    }
    return { type: 'case-updated', data: { caseNumber } }
  }

  // Legacy global todo files (deprecated, kept for backward compat)
  if (normalized.includes('/cases/todo/')) {
    return { type: 'todo-updated', data: {} }
  }

  // Patrol state
  if (normalized.includes('casehealth-state.json')) {
    return { type: 'patrol-updated', data: {} }
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

  return null
}

export function startFileWatcher() {
  const watchPaths = [
    join(config.activeCasesDir, '**', '*.{md,json,log}'),
    join(config.todoDir, '*.md'),
    config.patrolStateFile,
    config.cronJobsFile,
    join(config.projectRoot, 'tests', 'state.json'),
    join(config.projectRoot, 'tests', 'pipeline.json'),
    join(config.projectRoot, 'tests', 'supervisor.json'),
    join(config.projectRoot, 'tests', 'queues.json'),
    join(config.projectRoot, 'tests', 'stats.json'),
    join(config.projectRoot, 'tests', 'discoveries.json'),
    join(config.projectRoot, 'tests', 'evolution.json'),
    join(config.projectRoot, 'tests', 'directives.json'),
    join(config.projectRoot, 'tests', 'results', '*.json'),
  ]

  console.log('[watcher] Starting file watcher...')
  console.log('[watcher] Watching:', watchPaths.map(p => p.replace(/\\/g, '/')))

  watcher = chokidar.watch(watchPaths, {
    ignoreInitial: true,
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

  watcher.on('error', (err: unknown) => {
    console.error('[watcher] Error:', err)
  })

  console.log('[watcher] File watcher started')
}

export function stopFileWatcher() {
  if (watcher) {
    watcher.close()
    watcher = null
    console.log('[watcher] File watcher stopped')
  }
}

/**
 * file-watcher.ts — chokidar 文件监控
 */
import chokidar from 'chokidar'
import { join } from 'path'
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

    if (normalized.endsWith('casehealth-meta.json') || normalized.endsWith('case-info.md')) {
      return { type: 'case-updated', data: { caseNumber } }
    }
    if (normalized.includes('/drafts/')) {
      return { type: 'draft-updated', data: { caseNumber } }
    }
    return { type: 'case-updated', data: { caseNumber } }
  }

  // Todo files
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

  return null
}

export function startFileWatcher() {
  const watchPaths = [
    join(config.activeCasesDir, '**', '*.{md,json}'),
    join(config.todoDir, '*.md'),
    config.patrolStateFile,
    config.cronJobsFile,
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

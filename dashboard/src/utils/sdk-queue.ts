/**
 * sdk-queue.ts -- Concurrent SDK execution queue
 *
 * Enforces a configurable concurrency limit on SDK query() calls.
 * All SDK operations are funneled through this queue so concurrent triggers
 * (casework + patrol) don't overwhelm resources. Broadcasts queue status via SSE.
 *
 * Default: maxConcurrency=3 (allows patrol to process multiple cases in parallel)
 */

import { sseManager } from '../watcher/sse-manager.js'


// ===== Types =====

export interface QueueStatus {
  running: boolean
  runningCount: number
  maxConcurrency: number
  currentLabel: string | null
  currentLabels: string[]
  queueLength: number
  queueLabels: string[]
}

interface QueueItem {
  execute: () => Promise<void>
  label: string
  key: string
  resolve: () => void
  reject: (err: unknown) => void
}


// ===== SdkQueue Class =====

export class SdkQueue {
  private queue: QueueItem[] = []
  private runningCount = 0
  private runningItems: { label: string; key: string }[] = []
  private maxConcurrency: number

  constructor(maxConcurrency = 3) {
    this.maxConcurrency = maxConcurrency
  }

  /**
   * Enqueue an SDK operation for execution.
   * If slots are available, executes immediately. Otherwise queues.
   * @param fn - The async operation to execute
   * @param label - Human-readable description for logging/UI
   * @param key - Unique key for dequeue-by-key matching (defaults to label)
   */
  enqueue<T>(fn: () => Promise<T>, label: string, key?: string): Promise<T> {
    const effectiveKey = key ?? label

    return new Promise<T>((resolve, reject) => {
      const item: QueueItem = {
        execute: async () => {
          try {
            const result = await fn()
            resolve(result)
          } catch (err) {
            reject(err)
            throw err // re-throw so _onComplete catch path fires
          }
        },
        label,
        key: effectiveKey,
        resolve: () => { /* resolved inside execute */ },
        reject,
      }

      this.queue.push(item)

      if (this.runningCount < this.maxConcurrency) {
        this._startNext()
      } else {
        this._broadcastStatus()
        console.log(`[sdk-queue] Operation queued: ${label} (key=${effectiveKey}, running=${this.runningCount}/${this.maxConcurrency}, queued=${this.queue.length})`)
      }
    })
  }

  /**
   * Remove all queued (not-yet-started) items matching the given key.
   * Does NOT affect currently running operations.
   * @returns true if any items were removed
   */
  dequeue(key: string): boolean {
    const before = this.queue.length
    const removed: QueueItem[] = []

    this.queue = this.queue.filter(item => {
      if (item.key === key) {
        removed.push(item)
        return false
      }
      return true
    })

    for (const item of removed) {
      item.reject(new Error('Dequeued: operation cancelled before execution'))
    }

    const removedCount = before - this.queue.length
    if (removedCount > 0) {
      this._broadcastStatus()
      console.log(`[sdk-queue] Operation dequeued: key=${key}, removedCount=${removedCount}`)
    }

    return removedCount > 0
  }

  /** Get current queue status snapshot */
  getStatus(): QueueStatus {
    return {
      running: this.runningCount > 0,
      runningCount: this.runningCount,
      maxConcurrency: this.maxConcurrency,
      currentLabel: this.runningItems[0]?.label ?? null,
      currentLabels: this.runningItems.map(r => r.label),
      queueLength: this.queue.length,
      queueLabels: this.queue.map(q => q.label),
    }
  }

  /** Whether any operation is currently executing */
  isRunning(): boolean {
    return this.runningCount > 0
  }

  /** Label of the first currently executing operation, or null (backward compat) */
  getCurrentLabel(): string | null {
    return this.runningItems[0]?.label ?? null
  }

  /** Key of the first currently executing operation, or null (backward compat) */
  getCurrentKey(): string | null {
    return this.runningItems[0]?.key ?? null
  }

  /** Update max concurrency at runtime */
  setMaxConcurrency(n: number): void {
    this.maxConcurrency = Math.max(1, n)
    // If slots freed up, start queued items
    while (this.runningCount < this.maxConcurrency && this.queue.length > 0) {
      this._startNext()
    }
  }

  private _startNext(): void {
    const item = this.queue.shift()
    if (!item) return

    this.runningCount++
    this.runningItems.push({ label: item.label, key: item.key })
    console.log(`[sdk-queue] Operation started: ${item.label} (running=${this.runningCount}/${this.maxConcurrency}, queued=${this.queue.length})`)
    this._broadcastStatus()

    // Execute and handle completion
    item.execute()
      .catch(() => { /* error already forwarded via reject */ })
      .finally(() => {
        this.runningCount--
        this.runningItems = this.runningItems.filter(r => r.key !== item.key || r.label !== item.label)

        // Start next queued item if slot available
        if (this.queue.length > 0 && this.runningCount < this.maxConcurrency) {
          this._startNext()
        } else {
          this._broadcastStatus()
        }
      })
  }

  private _broadcastStatus(): void {
    sseManager.broadcast('sdk-queue-changed', { ...this.getStatus() })
  }
}


// ===== Singleton =====

export const sdkQueue = new SdkQueue(15)

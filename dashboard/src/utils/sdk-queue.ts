/**
 * sdk-queue.ts -- Serial SDK execution queue
 *
 * Enforces one-at-a-time SDK execution globally. All SDK query() calls
 * are funneled through this queue so concurrent triggers (casework + patrol)
 * don't collide. Broadcasts queue status changes via SSE.
 */

import { sseManager } from '../watcher/sse-manager.js'


// ===== Types =====

export interface QueueStatus {
  running: boolean
  currentLabel: string | null
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
  private running = false
  private currentLabel: string | null = null
  private currentKey: string | null = null

  /**
   * Enqueue an SDK operation for serial execution.
   * If nothing is running, executes immediately. Otherwise queues.
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
            throw err // re-throw so _runNext catch path fires
          }
        },
        label,
        key: effectiveKey,
        resolve: () => { /* resolved inside execute */ },
        reject,
      }

      this.queue.push(item)

      if (!this.running) {
        this._runNext()
      } else {
        this._broadcastStatus()
        console.log(`[sdk-queue] Operation queued: ${label} (key=${effectiveKey}, queueLength=${this.queue.length})`)
      }
    })
  }

  /**
   * Remove all queued (not-yet-started) items matching the given key.
   * Does NOT affect the currently running operation.
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
      running: this.running,
      currentLabel: this.currentLabel,
      queueLength: this.queue.length,
      queueLabels: this.queue.map(q => q.label),
    }
  }

  /** Whether an operation is currently executing */
  isRunning(): boolean {
    return this.running
  }

  /** Label of the currently executing operation, or null */
  getCurrentLabel(): string | null {
    return this.currentLabel
  }

  /** Key of the currently executing operation, or null */
  getCurrentKey(): string | null {
    return this.currentKey
  }

  private async _runNext(): Promise<void> {
    const item = this.queue.shift()

    if (!item) {
      this.running = false
      this.currentLabel = null
      this.currentKey = null
      this._broadcastStatus()
      return
    }

    this.running = true
    this.currentLabel = item.label
    this.currentKey = item.key
    console.log(`[sdk-queue] Operation started: ${item.label}`)
    this._broadcastStatus()

    try {
      await item.execute()
    } catch {
      // Error already forwarded to the caller's promise via reject in execute()
    } finally {
      this._runNext()
    }
  }

  private _broadcastStatus(): void {
    sseManager.broadcast('sdk-queue-changed', { ...this.getStatus() })
  }
}


// ===== Singleton =====

export const sdkQueue = new SdkQueue()

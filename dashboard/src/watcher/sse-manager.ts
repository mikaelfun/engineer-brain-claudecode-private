/**
 * sse-manager.ts — SSE 连接管理 + 广播
 *
 * Features:
 *   - Ring buffer (1000 events) with monotonically increasing sequence numbers
 *   - Probe-based stale client detection (every 60s)
 *   - Sequence-based event replay for reconnecting clients
 *   - Diagnostics endpoint support
 */
import type { SSEEvent, SSEEventType } from '../types/index.js'

type SSEClient = {
  id: string
  controller: ReadableStreamDefaultController
}

class SSEManager {
  private clients: SSEClient[] = []
  private clientId = 0
  private recentEvents: (SSEEvent & { seq: number })[] = []
  private readonly maxRecentEvents = 1000
  private encoder = new TextEncoder()
  private cleanupTimer: NodeJS.Timeout | null = null
  private seq = 0

  constructor() {
    this.startCleanup()
  }

  addClient(controller: ReadableStreamDefaultController): string {
    const id = `client-${++this.clientId}`
    this.clients.push({ id, controller })
    console.log(`[SSE] Client connected: ${id} (total: ${this.clients.length})`)

    // Send connected event with current seq baseline
    this.sendToClient({ id, controller }, {
      type: 'connected',
      data: { clientId: id, seq: this.seq },
      timestamp: new Date().toISOString(),
      seq: this.seq,
    })

    return id
  }

  removeClient(id: string) {
    this.clients = this.clients.filter(c => c.id !== id)
    console.log(`[SSE] Client disconnected: ${id} (total: ${this.clients.length})`)
  }

  broadcast(type: SSEEventType, data: Record<string, unknown> = {}) {
    this.seq++
    const event: SSEEvent & { seq: number } = {
      type,
      data,
      timestamp: new Date().toISOString(),
      seq: this.seq,
    }

    // Store in ring buffer (all events except high-frequency heartbeats)
    if (type !== 'case-step-heartbeat') {
      this.recentEvents.push(event)
      if (this.recentEvents.length > this.maxRecentEvents) {
        this.recentEvents = this.recentEvents.slice(-this.maxRecentEvents)
      }
    }

    const deadClients: string[] = []

    for (const client of this.clients) {
      try {
        this.sendToClient(client, event)
      } catch {
        deadClients.push(client.id)
      }
    }

    // Clean up dead clients
    for (const id of deadClients) {
      this.removeClient(id)
    }
  }

  private sendToClient(client: SSEClient, event: SSEEvent & { seq?: number }) {
    const seqId = event.seq ?? this.seq
    const payload = `id: ${seqId}\nevent: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`
    client.controller.enqueue(this.encoder.encode(payload))
  }

  get clientCount() {
    return this.clients.length
  }

  /** Return diagnostic info for debugging SSE connectivity */
  getDiagnostics() {
    return {
      clientCount: this.clients.length,
      clientIds: this.clients.map(c => c.id),
      currentSeq: this.seq,
      bufferSize: this.recentEvents.length,
      oldestSeq: this.recentEvents[0]?.seq ?? null,
      newestSeq: this.recentEvents[this.recentEvents.length - 1]?.seq ?? null,
    }
  }

  getRecentEvents(limit = 50): SSEEvent[] {
    return this.recentEvents.slice(-limit)
  }

  /** Filter events by timestamp (legacy, kept for backward compatibility) */
  getRecentEventsSince(since: string): SSEEvent[] {
    return this.recentEvents.filter(event => event.timestamp > since)
  }

  /** Replay events since a given sequence number (exclusive: seq > lastSeq) */
  getRecentEventsSinceSeq(lastSeq: number): (SSEEvent & { seq: number })[] {
    return this.recentEvents.filter(event => event.seq > lastSeq)
  }

  /** Get the current sequence number (for initial connection baseline) */
  getCurrentSeq(): number {
    return this.seq
  }

  /** Start periodic probe pings to detect stale/dead client connections */
  startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      const deadClients: string[] = []

      for (const client of this.clients) {
        try {
          client.controller.enqueue(this.encoder.encode(': probe\n\n'))
        } catch {
          deadClients.push(client.id)
        }
      }

      if (deadClients.length > 0) {
        for (const id of deadClients) {
          this.removeClient(id)
        }
        console.log(`[SSE] Stale clients cleaned up: removed=${deadClients.length}, remaining=${this.clients.length}`)
      }
    }, 60_000)

    this.cleanupTimer.unref()
  }

  /** Stop the stale client cleanup timer */
  stopCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
  }
}

export const sseManager = new SSEManager()

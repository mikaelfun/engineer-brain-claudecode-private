/**
 * sse-manager.ts — SSE 连接管理 + 广播
 */
import type { SSEEvent, SSEEventType } from '../types/index.js'

type SSEClient = {
  id: string
  controller: ReadableStreamDefaultController
}

class SSEManager {
  private clients: SSEClient[] = []
  private clientId = 0

  addClient(controller: ReadableStreamDefaultController): string {
    const id = `client-${++this.clientId}`
    this.clients.push({ id, controller })
    console.log(`[SSE] Client connected: ${id} (total: ${this.clients.length})`)

    // Send connected event
    this.sendToClient({ id, controller }, {
      type: 'connected',
      data: { clientId: id },
      timestamp: new Date().toISOString(),
    })

    return id
  }

  removeClient(id: string) {
    this.clients = this.clients.filter(c => c.id !== id)
    console.log(`[SSE] Client disconnected: ${id} (total: ${this.clients.length})`)
  }

  broadcast(type: SSEEventType, data: Record<string, unknown> = {}) {
    const event: SSEEvent = {
      type,
      data,
      timestamp: new Date().toISOString(),
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

  private sendToClient(client: SSEClient, event: SSEEvent) {
    const encoder = new TextEncoder()
    const data = `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`
    client.controller.enqueue(encoder.encode(data))
  }

  get clientCount() {
    return this.clients.length
  }
}

export const sseManager = new SSEManager()

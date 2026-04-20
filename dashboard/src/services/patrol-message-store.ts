/**
 * patrol-message-store.ts — In-memory ring buffer for patrol main-agent messages
 *
 * Stores SSE messages (tool-call, thinking, tool-result, agent lifecycle)
 * so the frontend can recover them after a browser refresh via GET /patrol/messages.
 *
 * Cleared on each patrol start. Max 500 messages (ring buffer).
 */

export interface PatrolMessage {
  kind: 'tool-call' | 'thinking' | 'response' | 'tool-result' | 'agent-started' | 'agent-progress' | 'agent-completed'
  toolName?: string
  content: string
  timestamp: string
  // agent lifecycle fields
  taskId?: string
  agentType?: string
  caseNumber?: string
}

class PatrolMessageStore {
  private messages: PatrolMessage[] = []
  private maxMessages = 500

  add(msg: PatrolMessage): void {
    if (this.messages.length >= this.maxMessages) {
      this.messages.shift() // drop oldest
    }
    this.messages.push(msg)
  }

  getAll(): PatrolMessage[] {
    return [...this.messages]
  }

  clear(): void {
    this.messages = []
  }

  get length(): number {
    return this.messages.length
  }
}

export const patrolMessageStore = new PatrolMessageStore()

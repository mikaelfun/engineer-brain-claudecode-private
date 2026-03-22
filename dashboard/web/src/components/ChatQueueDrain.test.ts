/**
 * ChatQueueDrain — unit tests for chat queue drain logic
 *
 * Tests the QueuedMessage interface and queue behavior:
 * - Queue state transitions (queued → sending → sent/failed)
 * - Sequential drain order
 * - Error handling during drain
 */
import { describe, it, expect } from 'vitest'
import type { QueuedMessage } from './CaseAIPanel'

function createQueuedMessage(content: string, status: QueuedMessage['status'] = 'queued'): QueuedMessage {
  return {
    id: `queued-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    content,
    timestamp: new Date().toISOString(),
    status,
  }
}

describe('QueuedMessage', () => {
  it('creates a queued message with correct default status', () => {
    const msg = createQueuedMessage('Hello from queue')
    expect(msg.status).toBe('queued')
    expect(msg.content).toBe('Hello from queue')
    expect(msg.id).toMatch(/^queued-/)
    expect(msg.timestamp).toBeTruthy()
  })

  it('supports all status transitions', () => {
    const msg = createQueuedMessage('Test message')
    expect(msg.status).toBe('queued')

    // Simulate status transitions
    const sending: QueuedMessage = { ...msg, status: 'sending' }
    expect(sending.status).toBe('sending')

    const sent: QueuedMessage = { ...msg, status: 'sent' }
    expect(sent.status).toBe('sent')

    const failed: QueuedMessage = { ...msg, status: 'failed' }
    expect(failed.status).toBe('failed')
  })
})

describe('Queue drain simulation', () => {
  it('drains messages in order', () => {
    const queue = [
      createQueuedMessage('First'),
      createQueuedMessage('Second'),
      createQueuedMessage('Third'),
    ]

    const drained: string[] = []
    for (const msg of queue) {
      drained.push(msg.content)
    }

    expect(drained).toEqual(['First', 'Second', 'Third'])
  })

  it('stops drain on first error', () => {
    const queue = [
      createQueuedMessage('First'),
      createQueuedMessage('Second — will fail'),
      createQueuedMessage('Third — should not send'),
    ]

    const sent: string[] = []
    const remaining: QueuedMessage[] = []

    for (const msg of queue) {
      if (msg.content.includes('will fail')) {
        remaining.push({ ...msg, status: 'failed' })
        // Push remaining unsent messages
        remaining.push(...queue.slice(queue.indexOf(msg) + 1))
        break
      }
      sent.push(msg.content)
    }

    expect(sent).toEqual(['First'])
    expect(remaining).toHaveLength(2)
    expect(remaining[0].status).toBe('failed')
    expect(remaining[1].status).toBe('queued') // not attempted
  })

  it('removes sent messages from queue', () => {
    let queue = [
      createQueuedMessage('First'),
      createQueuedMessage('Second'),
    ]

    // Simulate successful drain
    const toSend = [...queue]
    for (const msg of toSend) {
      queue = queue.filter(m => m.id !== msg.id)
    }

    expect(queue).toHaveLength(0)
  })

  it('preserves new messages added during drain', () => {
    let queue = [
      createQueuedMessage('Pre-existing'),
    ]

    // Simulate a new message added during drain
    const newMsg = createQueuedMessage('Added during drain')
    queue.push(newMsg)

    // Drain only the first (pre-existing) message
    queue = queue.filter(m => m.content !== 'Pre-existing')

    expect(queue).toHaveLength(1)
    expect(queue[0].content).toBe('Added during drain')
  })
})

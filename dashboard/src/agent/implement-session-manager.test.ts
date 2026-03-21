/**
 * implement-session-manager.test.ts — Unit tests for implement session management
 *
 * Tests: operation locks (acquire/release), message persistence (append/get/clear/truncation),
 *        status queries, and session lifecycle.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import {
  acquireImplementLock,
  releaseImplementLock,
  isImplementActive,
  appendImplementMessage,
  getImplementMessages,
  clearImplementSession,
  getImplementStatus,
  type ImplementMessage,
} from './implement-session-manager.js'

describe('implement-session-manager', () => {
  beforeEach(() => {
    // Clean up all sessions between tests
    clearImplementSession('ISS-001')
    clearImplementSession('ISS-002')
    clearImplementSession('ISS-003')
  })

  // ====== Lock API ======

  describe('acquireImplementLock', () => {
    it('acquires lock for a new issue', () => {
      const result = acquireImplementLock('ISS-001', 'track-123')
      expect(result).toBe(true)
      expect(isImplementActive('ISS-001')).toBe(true)
    })

    it('returns false when lock already held', () => {
      acquireImplementLock('ISS-001', 'track-123')
      const result = acquireImplementLock('ISS-001', 'track-456')
      expect(result).toBe(false)
    })

    it('allows re-acquire after release (completed)', () => {
      acquireImplementLock('ISS-001', 'track-123')
      releaseImplementLock('ISS-001', 'completed')
      const result = acquireImplementLock('ISS-001', 'track-456')
      expect(result).toBe(true)
    })

    it('allows re-acquire after release (failed)', () => {
      acquireImplementLock('ISS-001', 'track-123')
      releaseImplementLock('ISS-001', 'failed')
      const result = acquireImplementLock('ISS-001', 'track-456')
      expect(result).toBe(true)
    })

    it('different issues can have independent locks', () => {
      expect(acquireImplementLock('ISS-001', 'track-a')).toBe(true)
      expect(acquireImplementLock('ISS-002', 'track-b')).toBe(true)
      expect(isImplementActive('ISS-001')).toBe(true)
      expect(isImplementActive('ISS-002')).toBe(true)
    })
  })

  describe('releaseImplementLock', () => {
    it('marks session as completed', () => {
      acquireImplementLock('ISS-001', 'track-123')
      releaseImplementLock('ISS-001', 'completed')
      expect(isImplementActive('ISS-001')).toBe(false)
      expect(getImplementStatus('ISS-001').status).toBe('completed')
    })

    it('marks session as failed', () => {
      acquireImplementLock('ISS-001', 'track-123')
      releaseImplementLock('ISS-001', 'failed')
      expect(isImplementActive('ISS-001')).toBe(false)
      expect(getImplementStatus('ISS-001').status).toBe('failed')
    })

    it('is a no-op for non-existent session', () => {
      // Should not throw
      releaseImplementLock('ISS-999', 'completed')
    })
  })

  describe('isImplementActive', () => {
    it('returns false for non-existent session', () => {
      expect(isImplementActive('ISS-999')).toBe(false)
    })

    it('returns true for active session', () => {
      acquireImplementLock('ISS-001', 'track-123')
      expect(isImplementActive('ISS-001')).toBe(true)
    })

    it('returns false after completion', () => {
      acquireImplementLock('ISS-001', 'track-123')
      releaseImplementLock('ISS-001', 'completed')
      expect(isImplementActive('ISS-001')).toBe(false)
    })
  })

  // ====== Message Persistence API ======

  describe('appendImplementMessage', () => {
    it('appends messages to active session', () => {
      acquireImplementLock('ISS-001', 'track-123')
      const msg: ImplementMessage = {
        type: 'thinking',
        content: 'Analyzing code...',
        timestamp: new Date().toISOString(),
      }
      appendImplementMessage('ISS-001', msg)
      const messages = getImplementMessages('ISS-001')
      expect(messages).toHaveLength(1)
      expect(messages[0].content).toBe('Analyzing code...')
    })

    it('is a no-op for non-existent session', () => {
      const msg: ImplementMessage = {
        type: 'thinking',
        content: 'orphan',
        timestamp: new Date().toISOString(),
      }
      appendImplementMessage('ISS-999', msg)
      expect(getImplementMessages('ISS-999')).toHaveLength(0)
    })

    it('appends messages with different types', () => {
      acquireImplementLock('ISS-001', 'track-123')
      appendImplementMessage('ISS-001', { type: 'started', content: 'Started', timestamp: '1' })
      appendImplementMessage('ISS-001', { type: 'thinking', content: 'Thinking', timestamp: '2' })
      appendImplementMessage('ISS-001', { type: 'tool-call', content: 'Read', toolName: 'Read', timestamp: '3' })
      appendImplementMessage('ISS-001', { type: 'completed', content: 'Done', timestamp: '4' })

      const messages = getImplementMessages('ISS-001')
      expect(messages).toHaveLength(4)
      expect(messages[0].type).toBe('started')
      expect(messages[2].toolName).toBe('Read')
    })

    it('truncates to MAX_MESSAGES (100) when exceeded', () => {
      acquireImplementLock('ISS-001', 'track-123')

      // Append 110 messages
      for (let i = 0; i < 110; i++) {
        appendImplementMessage('ISS-001', {
          type: 'thinking',
          content: `Message ${i}`,
          timestamp: new Date().toISOString(),
        })
      }

      const messages = getImplementMessages('ISS-001')
      expect(messages).toHaveLength(100)
      // First message should be message #10 (oldest kept after truncation)
      expect(messages[0].content).toBe('Message 10')
      // Last message should be message #109
      expect(messages[99].content).toBe('Message 109')
    })
  })

  describe('getImplementMessages', () => {
    it('returns empty array for non-existent session', () => {
      expect(getImplementMessages('ISS-999')).toEqual([])
    })

    it('returns messages in order', () => {
      acquireImplementLock('ISS-001', 'track-123')
      appendImplementMessage('ISS-001', { type: 'started', content: 'First', timestamp: '1' })
      appendImplementMessage('ISS-001', { type: 'thinking', content: 'Second', timestamp: '2' })

      const msgs = getImplementMessages('ISS-001')
      expect(msgs[0].content).toBe('First')
      expect(msgs[1].content).toBe('Second')
    })
  })

  // ====== Session Lifecycle ======

  describe('clearImplementSession', () => {
    it('removes session entirely', () => {
      acquireImplementLock('ISS-001', 'track-123')
      appendImplementMessage('ISS-001', { type: 'started', content: 'x', timestamp: '1' })
      clearImplementSession('ISS-001')

      expect(isImplementActive('ISS-001')).toBe(false)
      expect(getImplementMessages('ISS-001')).toEqual([])
      expect(getImplementStatus('ISS-001').status).toBe('none')
    })

    it('is a no-op for non-existent session', () => {
      // Should not throw
      clearImplementSession('ISS-999')
    })
  })

  // ====== Status API ======

  describe('getImplementStatus', () => {
    it('returns none for non-existent session', () => {
      const status = getImplementStatus('ISS-999')
      expect(status.active).toBe(false)
      expect(status.status).toBe('none')
      expect(status.messages).toEqual([])
      expect(status.trackId).toBeUndefined()
      expect(status.startedAt).toBeUndefined()
    })

    it('returns active status with all fields', () => {
      acquireImplementLock('ISS-001', 'my-track')
      appendImplementMessage('ISS-001', { type: 'started', content: 'go', timestamp: '1' })

      const status = getImplementStatus('ISS-001')
      expect(status.active).toBe(true)
      expect(status.status).toBe('active')
      expect(status.trackId).toBe('my-track')
      expect(status.startedAt).toBeTruthy()
      expect(status.messages).toHaveLength(1)
    })

    it('returns completed status', () => {
      acquireImplementLock('ISS-001', 'track-a')
      releaseImplementLock('ISS-001', 'completed')

      const status = getImplementStatus('ISS-001')
      expect(status.active).toBe(false)
      expect(status.status).toBe('completed')
    })

    it('returns failed status', () => {
      acquireImplementLock('ISS-001', 'track-b')
      releaseImplementLock('ISS-001', 'failed')

      const status = getImplementStatus('ISS-001')
      expect(status.active).toBe(false)
      expect(status.status).toBe('failed')
    })
  })
})

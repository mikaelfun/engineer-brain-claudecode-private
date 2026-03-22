/**
 * abort-registry.test.ts — Unit tests for AbortController registry (ISS-086)
 *
 * Tests: registerQuery, abortQuery, unregisterQuery, abortAllQueries, getActiveQueryCount
 */
import { describe, it, expect, beforeEach } from 'vitest'
import {
  registerQuery,
  abortQuery,
  unregisterQuery,
  abortAllQueries,
  getActiveQueryCount,
} from './case-session-manager.js'

describe('AbortController Registry (ISS-086)', () => {
  beforeEach(() => {
    // Clear all active queries between tests
    abortAllQueries()
  })

  // ====== registerQuery ======

  describe('registerQuery', () => {
    it('registers a new AbortController and returns it', () => {
      const ac = registerQuery('case-001')
      expect(ac).toBeInstanceOf(AbortController)
      expect(ac.signal.aborted).toBe(false)
      expect(getActiveQueryCount()).toBe(1)
    })

    it('aborts existing controller when registering same key', () => {
      const ac1 = registerQuery('case-001')
      const ac2 = registerQuery('case-001')
      expect(ac1.signal.aborted).toBe(true) // old one aborted
      expect(ac2.signal.aborted).toBe(false) // new one is active
      expect(getActiveQueryCount()).toBe(1) // still only one
    })

    it('registers multiple controllers with different keys', () => {
      registerQuery('case-001')
      registerQuery('case-002')
      registerQuery('patrol-case-003')
      expect(getActiveQueryCount()).toBe(3)
    })
  })

  // ====== abortQuery ======

  describe('abortQuery', () => {
    it('aborts and removes an active query', () => {
      const ac = registerQuery('case-001')
      const result = abortQuery('case-001')
      expect(result).toBe(true)
      expect(ac.signal.aborted).toBe(true)
      expect(getActiveQueryCount()).toBe(0)
    })

    it('returns false for non-existent key', () => {
      const result = abortQuery('non-existent')
      expect(result).toBe(false)
    })

    it('only aborts the targeted query, not others', () => {
      const ac1 = registerQuery('case-001')
      const ac2 = registerQuery('case-002')
      abortQuery('case-001')
      expect(ac1.signal.aborted).toBe(true)
      expect(ac2.signal.aborted).toBe(false)
      expect(getActiveQueryCount()).toBe(1)
    })
  })

  // ====== unregisterQuery ======

  describe('unregisterQuery', () => {
    it('removes query without aborting', () => {
      const ac = registerQuery('case-001')
      unregisterQuery('case-001')
      expect(ac.signal.aborted).toBe(false) // NOT aborted
      expect(getActiveQueryCount()).toBe(0)
    })

    it('is no-op for non-existent key', () => {
      unregisterQuery('non-existent') // should not throw
      expect(getActiveQueryCount()).toBe(0)
    })
  })

  // ====== abortAllQueries ======

  describe('abortAllQueries', () => {
    it('aborts all active queries and returns count', () => {
      const ac1 = registerQuery('case-001')
      const ac2 = registerQuery('case-002')
      const ac3 = registerQuery('patrol-case-003')
      const count = abortAllQueries()
      expect(count).toBe(3)
      expect(ac1.signal.aborted).toBe(true)
      expect(ac2.signal.aborted).toBe(true)
      expect(ac3.signal.aborted).toBe(true)
      expect(getActiveQueryCount()).toBe(0)
    })

    it('returns 0 when no active queries', () => {
      const count = abortAllQueries()
      expect(count).toBe(0)
    })
  })

  // ====== getActiveQueryCount ======

  describe('getActiveQueryCount', () => {
    it('returns 0 initially', () => {
      expect(getActiveQueryCount()).toBe(0)
    })

    it('tracks registrations and removals', () => {
      registerQuery('a')
      registerQuery('b')
      expect(getActiveQueryCount()).toBe(2)
      abortQuery('a')
      expect(getActiveQueryCount()).toBe(1)
      unregisterQuery('b')
      expect(getActiveQueryCount()).toBe(0)
    })
  })
})

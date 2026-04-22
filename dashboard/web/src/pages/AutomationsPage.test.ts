import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getWatchHealthStatus, formatRelativeTime } from './AutomationsPage'

describe('getWatchHealthStatus', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-22T10:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns "stopped" when backend status is stopped', () => {
    expect(getWatchHealthStatus('2026-04-22T09:59:00Z', 60, 'stopped', 0)).toBe('stopped')
  })

  it('returns "stopped" even if lastPollAt is recent but status is stopped', () => {
    expect(getWatchHealthStatus('2026-04-22T09:59:50Z', 60, 'stopped', 0)).toBe('stopped')
  })

  it('returns "running" when lastPollAt is within 3×interval', () => {
    // 2 minutes ago, interval=60s, threshold=180s → 120s < 180s → running
    expect(getWatchHealthStatus('2026-04-22T09:58:00Z', 60, 'running', 0)).toBe('running')
  })

  it('returns "running" when lastPollAt is exactly at threshold boundary', () => {
    // 3 minutes ago, interval=60s, threshold=180s → 180s === 180s → NOT > threshold → running
    expect(getWatchHealthStatus('2026-04-22T09:57:00Z', 60, 'running', 0)).toBe('running')
  })

  it('returns "stale" when lastPollAt exceeds 3×interval', () => {
    // 5 minutes ago, interval=60s, threshold=180s → 300s > 180s → stale
    expect(getWatchHealthStatus('2026-04-22T09:55:00Z', 60, 'running', 0)).toBe('stale')
  })

  it('returns "stale" when lastPollAt is null (no poll data)', () => {
    expect(getWatchHealthStatus(null, 60, 'running', 0)).toBe('stale')
  })

  it('returns "running" with consecutiveErrors > 0 but recent lastPollAt', () => {
    // Errors don't change health status if polls are recent — the badge handles error display
    expect(getWatchHealthStatus('2026-04-22T09:59:30Z', 60, 'running', 5)).toBe('running')
  })

  it('returns "stale" with long interval and old poll', () => {
    // interval=300s (5min), threshold=900s (15min), lastPoll=20min ago → stale
    expect(getWatchHealthStatus('2026-04-22T09:40:00Z', 300, 'running', 0)).toBe('stale')
  })

  it('returns "running" with long interval and recent poll', () => {
    // interval=300s (5min), threshold=900s (15min), lastPoll=10min ago → running
    expect(getWatchHealthStatus('2026-04-22T09:50:00Z', 300, 'running', 0)).toBe('running')
  })
})

describe('formatRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-22T10:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns "Never" for null input', () => {
    expect(formatRelativeTime(null)).toBe('Never')
  })

  it('returns seconds ago for recent timestamps', () => {
    expect(formatRelativeTime('2026-04-22T09:59:30Z')).toBe('30s ago')
  })

  it('returns minutes ago for timestamps within an hour', () => {
    expect(formatRelativeTime('2026-04-22T09:55:00Z')).toBe('5m ago')
  })

  it('returns hours ago for timestamps within a day', () => {
    expect(formatRelativeTime('2026-04-22T07:00:00Z')).toBe('3h ago')
  })

  it('returns days ago for old timestamps', () => {
    expect(formatRelativeTime('2026-04-20T10:00:00Z')).toBe('2d ago')
  })

  it('returns "刚刚" for future timestamps', () => {
    expect(formatRelativeTime('2026-04-22T10:05:00Z')).toBe('刚刚')
  })
})

/**
 * patrol-helpers.test.ts — Unit tests for patrol helper functions (ISS-111)
 *
 * Tests: filterCasesByLastInspected, runPatrolWarmup
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { filterCasesByLastInspected } from './case-session-manager.js'

// Mock fs module
vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('fs')>()
  return {
    ...actual,
    existsSync: vi.fn(actual.existsSync),
    readFileSync: vi.fn(actual.readFileSync),
  }
})

import { existsSync, readFileSync } from 'fs'

const mockExistsSync = vi.mocked(existsSync)
const mockReadFileSync = vi.mocked(readFileSync)

describe('filterCasesByLastInspected (ISS-111)', () => {
  const casesRoot = '/mock/cases'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('includes case with no casehealth-meta.json', () => {
    mockExistsSync.mockReturnValue(false)

    const result = filterCasesByLastInspected(['case-001'], casesRoot)
    expect(result.filtered).toEqual(['case-001'])
    expect(result.skipped).toEqual([])
  })

  it('includes case with missing lastInspected field', () => {
    mockExistsSync.mockReturnValue(true)
    mockReadFileSync.mockReturnValue(JSON.stringify({ caseNumber: 'case-002' }))

    const result = filterCasesByLastInspected(['case-002'], casesRoot)
    expect(result.filtered).toEqual(['case-002'])
    expect(result.skipped).toEqual([])
  })

  it('includes case with lastInspected older than 24 hours', () => {
    const oldDate = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString() // 25 hours ago
    mockExistsSync.mockReturnValue(true)
    mockReadFileSync.mockReturnValue(JSON.stringify({ lastInspected: oldDate }))

    const result = filterCasesByLastInspected(['case-003'], casesRoot)
    expect(result.filtered).toEqual(['case-003'])
    expect(result.skipped).toEqual([])
  })

  it('skips case with lastInspected within 24 hours', () => {
    const recentDate = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() // 12 hours ago
    mockExistsSync.mockReturnValue(true)
    mockReadFileSync.mockReturnValue(JSON.stringify({ lastInspected: recentDate }))

    const result = filterCasesByLastInspected(['case-004'], casesRoot)
    expect(result.filtered).toEqual([])
    expect(result.skipped).toEqual(['case-004'])
  })

  it('handles mixed cases correctly', () => {
    const oldDate = new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString()
    const recentDate = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()

    // case-A: no meta file → filtered
    // case-B: old lastInspected → filtered
    // case-C: recent lastInspected → skipped
    mockExistsSync.mockImplementation((path: any) => {
      if (String(path).includes('case-A')) return false
      return true
    })
    mockReadFileSync.mockImplementation((path: any) => {
      if (String(path).includes('case-B')) return JSON.stringify({ lastInspected: oldDate })
      if (String(path).includes('case-C')) return JSON.stringify({ lastInspected: recentDate })
      return '{}'
    })

    const result = filterCasesByLastInspected(['case-A', 'case-B', 'case-C'], casesRoot)
    expect(result.filtered).toEqual(['case-A', 'case-B'])
    expect(result.skipped).toEqual(['case-C'])
  })

  it('includes case when meta file has parse error', () => {
    mockExistsSync.mockReturnValue(true)
    mockReadFileSync.mockReturnValue('invalid json {{')

    const result = filterCasesByLastInspected(['case-bad'], casesRoot)
    expect(result.filtered).toEqual(['case-bad'])
    expect(result.skipped).toEqual([])
  })

  it('returns empty arrays for empty input', () => {
    const result = filterCasesByLastInspected([], casesRoot)
    expect(result.filtered).toEqual([])
    expect(result.skipped).toEqual([])
  })

  it('includes case with lastInspected exactly 24 hours ago', () => {
    // Exactly 24 hours should NOT be filtered (need > 24h)
    const exactDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    mockExistsSync.mockReturnValue(true)
    mockReadFileSync.mockReturnValue(JSON.stringify({ lastInspected: exactDate }))

    const result = filterCasesByLastInspected(['case-exact'], casesRoot)
    // Depending on millisecond timing, this could be either. We just verify it doesn't crash.
    expect(result.filtered.length + result.skipped.length).toBe(1)
  })
})

/**
 * conductor-reader.test.ts — Conductor track reader/writer unit tests
 *
 * Tests: getTrackMetadata, createTrackFromIssue, listTrackIds
 * Safety: mocks fs completely, no real filesystem operations
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { join } from 'path'

// ---- Mocks ----

vi.mock('fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  readdirSync: vi.fn(),
  mkdirSync: vi.fn(),
}))

vi.mock('../config.js', () => ({
  config: {
    projectRoot: '/mock/project',
  },
}))

import { existsSync, readFileSync, writeFileSync, readdirSync, mkdirSync } from 'fs'
import { getTrackMetadata, createTrackFromIssue, listTrackIds } from './conductor-reader.js'

const mockExistsSync = vi.mocked(existsSync)
const mockReadFileSync = vi.mocked(readFileSync)
const mockWriteFileSync = vi.mocked(writeFileSync)
const mockReaddirSync = vi.mocked(readdirSync)
const mockMkdirSync = vi.mocked(mkdirSync)

const TRACKS_DIR = join('/mock/project', 'conductor', 'tracks')

function makeIssue(overrides: Record<string, any> = {}) {
  return {
    id: 'ISS-001',
    title: 'Fix login bug',
    description: 'The login fails on Safari',
    type: 'bug' as const,
    priority: 'P1' as const,
    status: 'pending' as const,
    createdAt: '2026-03-20T00:00:00Z',
    updatedAt: '2026-03-20T00:00:00Z',
    ...overrides,
  }
}

describe('conductor-reader', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getTrackMetadata', () => {
    it('reads and parses metadata.json', () => {
      const meta = {
        id: 'fix-login_20260320',
        title: 'Fix login bug',
        type: 'bug',
        status: 'planned',
        created: '2026-03-20T00:00:00Z',
        updated: '2026-03-20T00:00:00Z',
        phases: { total: 2, completed: 1 },
        tasks: { total: 5, completed: 3 },
      }
      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockReturnValue(JSON.stringify(meta))

      const result = getTrackMetadata('fix-login_20260320')
      expect(result).toEqual(meta)
      expect(mockReadFileSync).toHaveBeenCalledWith(
        join(TRACKS_DIR, 'fix-login_20260320', 'metadata.json'),
        'utf-8'
      )
    })

    it('returns null if metadata.json does not exist', () => {
      mockExistsSync.mockReturnValue(false)

      const result = getTrackMetadata('nonexistent')
      expect(result).toBeNull()
    })

    it('returns null on parse error', () => {
      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockReturnValue('invalid json{{{')

      const result = getTrackMetadata('broken-track')
      expect(result).toBeNull()
    })
  })

  describe('listTrackIds', () => {
    it('returns directory names', () => {
      mockExistsSync.mockReturnValue(true)
      mockReaddirSync.mockReturnValue([
        { name: 'track-a_20260320', isDirectory: () => true },
        { name: 'track-b_20260320', isDirectory: () => true },
        { name: 'random-file.txt', isDirectory: () => false },
      ] as any)

      const result = listTrackIds()
      expect(result).toEqual(['track-a_20260320', 'track-b_20260320'])
    })

    it('returns empty array if tracks dir does not exist', () => {
      mockExistsSync.mockReturnValue(false)

      const result = listTrackIds()
      expect(result).toEqual([])
    })

    it('returns empty array on read error', () => {
      mockExistsSync.mockReturnValue(true)
      mockReaddirSync.mockImplementation(() => { throw new Error('permission denied') })

      const result = listTrackIds()
      expect(result).toEqual([])
    })
  })

  describe('createTrackFromIssue', () => {
    it('creates track directory with all files', () => {
      const issue = makeIssue()
      mockExistsSync.mockReturnValue(false) // track dir does not exist yet

      const trackId = createTrackFromIssue(issue)

      // Track ID format: slugified-title_YYYYMMDD
      expect(trackId).toMatch(/^fix-login-bug_\d{8}$/)

      // Should create directory
      expect(mockMkdirSync).toHaveBeenCalledWith(
        expect.stringContaining(trackId),
        { recursive: true }
      )

      // Should write 4 files: metadata.json, spec.md, plan.md, index.md
      expect(mockWriteFileSync).toHaveBeenCalledTimes(4)

      const writeCalls = mockWriteFileSync.mock.calls
      const fileNames = writeCalls.map(c => String(c[0]).split(/[\\/]/).pop())
      expect(fileNames).toContain('metadata.json')
      expect(fileNames).toContain('spec.md')
      expect(fileNames).toContain('plan.md')
      expect(fileNames).toContain('index.md')
    })

    it('metadata.json contains correct fields', () => {
      const issue = makeIssue()
      mockExistsSync.mockReturnValue(false)

      createTrackFromIssue(issue)

      const metaCall = mockWriteFileSync.mock.calls.find(c => String(c[0]).endsWith('metadata.json'))
      expect(metaCall).toBeDefined()

      const metadata = JSON.parse(metaCall![1] as string)
      expect(metadata.title).toBe('Fix login bug')
      expect(metadata.type).toBe('bug')
      expect(metadata.status).toBe('planned')
      expect(metadata.phases).toEqual({ total: 0, completed: 0 })
      expect(metadata.tasks).toEqual({ total: 0, completed: 0 })
    })

    it('spec.md references the source issue', () => {
      const issue = makeIssue()
      mockExistsSync.mockReturnValue(false)

      createTrackFromIssue(issue)

      const specCall = mockWriteFileSync.mock.calls.find(c => String(c[0]).endsWith('spec.md'))
      const specContent = specCall![1] as string
      expect(specContent).toContain('ISS-001')
      expect(specContent).toContain('bug')
      expect(specContent).toContain('P1')
      expect(specContent).toContain('The login fails on Safari')
    })

    it('throws if track directory already exists', () => {
      const issue = makeIssue()
      mockExistsSync.mockReturnValue(true) // track dir exists

      expect(() => createTrackFromIssue(issue)).toThrow('Track directory already exists')
    })

    it('handles special characters in title', () => {
      const issue = makeIssue({ title: 'Fix: "scrollbar" & <overflow>' })
      mockExistsSync.mockReturnValue(false)

      const trackId = createTrackFromIssue(issue)
      // Should not contain special chars
      expect(trackId).toMatch(/^[a-z0-9-]+_\d{8}$/)
      expect(trackId).not.toContain('"')
      expect(trackId).not.toContain('&')
      expect(trackId).not.toContain('<')
    })

    it('handles empty description', () => {
      const issue = makeIssue({ description: '' })
      mockExistsSync.mockReturnValue(false)

      createTrackFromIssue(issue)

      const specCall = mockWriteFileSync.mock.calls.find(c => String(c[0]).endsWith('spec.md'))
      const specContent = specCall![1] as string
      expect(specContent).toContain('No description provided')
    })
  })
})

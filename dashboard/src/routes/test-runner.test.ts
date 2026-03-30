/**
 * test-runner.test.ts — Runner lifecycle API unit tests
 *
 * Tests: GET /status, POST /start (duplicate guard), POST /stop (not-running guard)
 * Safety: mocks Claude SDK query + test-reader to avoid file I/O
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Hono } from 'hono'

// ---- Mocks ----

const mockReadDirectives = vi.fn()
const mockWriteDirectives = vi.fn()
const mockReadTestState = vi.fn()
const mockReadPipeline = vi.fn()

vi.mock('../services/test-reader.js', () => ({
  readDirectives: (...args: any[]) => mockReadDirectives(...args),
  writeDirectives: (...args: any[]) => mockWriteDirectives(...args),
  readTestState: (...args: any[]) => mockReadTestState(...args),
  readPipeline: (...args: any[]) => mockReadPipeline(...args),
}))

// Mock Claude SDK query — hangs forever so runner stays 'running'
vi.mock('@anthropic-ai/claude-agent-sdk', () => ({
  query: vi.fn(() => ({
    async *[Symbol.asyncIterator]() {
      // Never yield/return — simulates a long-running session
      await new Promise(() => {})
    },
  })),
}))

vi.mock('../config.js', () => ({
  config: { projectRoot: '/tmp/test-project' },
}))

vi.mock('../watcher/sse-manager.js', () => ({
  sseManager: { broadcast: vi.fn() },
}))

// ---- Setup ----

let app: Hono

beforeEach(async () => {
  vi.clearAllMocks()
  mockReadDirectives.mockReturnValue([])
  mockReadPipeline.mockReturnValue(null)
  mockReadTestState.mockReturnValue({ phase: 'TEST', round: 3 })

  // Re-import to reset in-memory runnerState
  vi.resetModules()

  vi.doMock('../services/test-reader.js', () => ({
    readDirectives: (...args: any[]) => mockReadDirectives(...args),
    writeDirectives: (...args: any[]) => mockWriteDirectives(...args),
    readTestState: (...args: any[]) => mockReadTestState(...args),
    readPipeline: (...args: any[]) => mockReadPipeline(...args),
  }))
  vi.doMock('@anthropic-ai/claude-agent-sdk', () => ({
    query: vi.fn(() => ({
      async *[Symbol.asyncIterator]() {
        await new Promise(() => {})
      },
    })),
  }))
  vi.doMock('../config.js', () => ({
    config: { projectRoot: '/tmp/test-project' },
  }))
  vi.doMock('../watcher/sse-manager.js', () => ({
    sseManager: { broadcast: vi.fn() },
  }))

  const mod = await import('./test-runner.js')
  app = new Hono()
  app.route('/runner', mod.default)
})

// ---- Tests ----

describe('GET /runner/status', () => {
  it('returns idle status by default', async () => {
    const res = await app.request('/runner/status')
    expect(res.status).toBe(200)
    const body = await res.json() as any
    expect(body.status).toBe('idle')
    expect(body.currentPhase).toBe('TEST')
    expect(body.currentRound).toBe(3)
  })

  it('returns null phase when no test state', async () => {
    mockReadTestState.mockReturnValue(null)
    const res = await app.request('/runner/status')
    const body = await res.json() as any
    expect(body.status).toBe('idle')
    expect(body.currentPhase).toBeNull()
    expect(body.currentRound).toBeNull()
  })
})

describe('POST /runner/start', () => {
  it('returns started status', async () => {
    const res = await app.request('/runner/start', { method: 'POST' })
    expect(res.status).toBe(200)
    const body = await res.json() as any
    expect(body.status).toBe('started')
    expect(body.startedAt).toBeTruthy()
  })

  it('clears pending pause directives on start', async () => {
    mockReadDirectives.mockReturnValue([
      { type: 'pause', status: 'pending', createdAt: '2026-01-01' },
      { type: 'other', status: 'done', createdAt: '2026-01-01' },
    ])
    await app.request('/runner/start', { method: 'POST' })
    expect(mockWriteDirectives).toHaveBeenCalledWith([
      { type: 'other', status: 'done', createdAt: '2026-01-01' },
    ])
  })

  it('rejects double start with 409', async () => {
    // First start — mock hangs so runner stays 'running'
    await app.request('/runner/start', { method: 'POST' })
    // Second start while running
    const res2 = await app.request('/runner/start', { method: 'POST' })
    expect(res2.status).toBe(409)
    const body = await res2.json() as any
    expect(body.error).toContain('已在运行')
  })
})

describe('POST /runner/stop', () => {
  it('rejects stop when idle with 409', async () => {
    const res = await app.request('/runner/stop', { method: 'POST' })
    expect(res.status).toBe(409)
    const body = await res.json() as any
    expect(body.error).toContain('未在运行')
  })

  it('writes pause directive and returns stopping', async () => {
    // Start first — mock hangs so runner stays 'running'
    await app.request('/runner/start', { method: 'POST' })
    // Then stop
    const res = await app.request('/runner/stop', { method: 'POST' })
    expect(res.status).toBe(200)
    const body = await res.json() as any
    expect(body.status).toBe('stopping')

    // Verify pause directive was written
    expect(mockWriteDirectives).toHaveBeenCalled()
    const lastCall = mockWriteDirectives.mock.calls[mockWriteDirectives.mock.calls.length - 1]
    const directives = lastCall[0]
    expect(directives.some((d: any) => d.type === 'pause' && d.source === 'webui-runner-stop')).toBe(true)
  })
})

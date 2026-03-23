/**
 * issues.test.ts — Issue routes unit tests
 *
 * Tests: CRUD + lifecycle endpoints (create-track, start-implement, verify, reopen, track, track-plan, track-progress)
 * Safety: mocks child_process.execSync to avoid real test execution
 *         mocks Claude SDK query to avoid real agent execution
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Hono } from 'hono'

// ---- Mocks ----

// Mock issue-reader
const mockListIssues = vi.fn()
const mockGetIssue = vi.fn()
const mockCreateIssue = vi.fn()
const mockUpdateIssue = vi.fn()
const mockDeleteIssue = vi.fn()

vi.mock('../services/issue-reader.js', () => ({
  listIssues: (...args: any[]) => mockListIssues(...args),
  getIssue: (...args: any[]) => mockGetIssue(...args),
  createIssue: (...args: any[]) => mockCreateIssue(...args),
  updateIssue: (...args: any[]) => mockUpdateIssue(...args),
  deleteIssue: (...args: any[]) => mockDeleteIssue(...args),
}))

// Mock conductor-reader
const mockGetTrackMetadata = vi.fn()
const mockUpdateTrackMetadata = vi.fn()
const mockUpdateTracksMdStatus = vi.fn()
const mockEnrichIssueFromTrack = vi.fn((issue: any) => issue)

vi.mock('../services/conductor-reader.js', () => ({
  getTrackMetadata: (...args: any[]) => mockGetTrackMetadata(...args),
  updateTrackMetadata: (...args: any[]) => mockUpdateTrackMetadata(...args),
  updateTracksMdStatus: (...args: any[]) => mockUpdateTracksMdStatus(...args),
  enrichIssueFromTrack: (issue: any) => mockEnrichIssueFromTrack(issue),
}))

// Mock child_process (safety: never run real tests)
const mockExecSync = vi.fn()
const mockExec = vi.fn()
vi.mock('child_process', () => ({
  execSync: (...args: any[]) => mockExecSync(...args),
  exec: (...args: any[]) => mockExec(...args),
}))

// Mock config
vi.mock('../config.js', () => ({
  config: {
    projectRoot: '/mock/project',
    jwtSecret: 'test-secret',
  },
}))

// Mock SSE manager (prevent real broadcast)
const mockBroadcast = vi.fn()
vi.mock('../watcher/sse-manager.js', () => ({
  sseManager: {
    broadcast: (...args: any[]) => mockBroadcast(...args),
  },
}))

// Mock issue-track-state
const mockTrackStateStart = vi.fn()
const mockTrackStateAddMessage = vi.fn()
const mockTrackStateFinish = vi.fn()
const mockTrackStateGetState = vi.fn()
const mockTrackStateSetPendingQuestion = vi.fn()
const mockTrackStateGetPendingQuestion = vi.fn()
const mockTrackStateClearPendingQuestion = vi.fn()
const mockTrackStateClear = vi.fn()
const mockTrackStateCancel = vi.fn()
const mockTrackStateIsActive = vi.fn().mockReturnValue(false)
const mockTrackStateIsCancelled = vi.fn().mockReturnValue(false)
vi.mock('../services/issue-track-state.js', () => ({
  issueTrackState: {
    start: (...args: any[]) => mockTrackStateStart(...args),
    addMessage: (...args: any[]) => mockTrackStateAddMessage(...args),
    finish: (...args: any[]) => mockTrackStateFinish(...args),
    getState: (...args: any[]) => mockTrackStateGetState(...args),
    setPendingQuestion: (...args: any[]) => mockTrackStateSetPendingQuestion(...args),
    getPendingQuestion: (...args: any[]) => mockTrackStateGetPendingQuestion(...args),
    clearPendingQuestion: (...args: any[]) => mockTrackStateClearPendingQuestion(...args),
    clear: (...args: any[]) => mockTrackStateClear(...args),
    cancel: (...args: any[]) => mockTrackStateCancel(...args),
    isActive: (...args: any[]) => mockTrackStateIsActive(...args),
    isCancelled: (...args: any[]) => mockTrackStateIsCancelled(...args),
  },
}))

// Mock Claude SDK query (safety: never spawn real agents)
vi.mock('@anthropic-ai/claude-agent-sdk', () => ({
  query: vi.fn(),
}))

// Mock implement-session-manager
const mockAcquireImplementLock = vi.fn()
const mockReleaseImplementLock = vi.fn()
const mockIsImplementActive = vi.fn()
const mockAppendImplementMessage = vi.fn()
const mockGetImplementMessages = vi.fn()
const mockClearImplementSession = vi.fn()
const mockGetImplementStatus = vi.fn()

vi.mock('../agent/implement-session-manager.js', () => ({
  acquireImplementLock: (...args: any[]) => mockAcquireImplementLock(...args),
  releaseImplementLock: (...args: any[]) => mockReleaseImplementLock(...args),
  isImplementActive: (...args: any[]) => mockIsImplementActive(...args),
  appendImplementMessage: (...args: any[]) => mockAppendImplementMessage(...args),
  getImplementMessages: (...args: any[]) => mockGetImplementMessages(...args),
  clearImplementSession: (...args: any[]) => mockClearImplementSession(...args),
  getImplementStatus: (...args: any[]) => mockGetImplementStatus(...args),
}))

// Mock verify-session-manager
const mockAcquireVerifyLock = vi.fn().mockReturnValue(true)
const mockReleaseVerifyLock = vi.fn()
const mockIsVerifyActive = vi.fn().mockReturnValue(false)
const mockAppendVerifyMessage = vi.fn()
const mockGetVerifyStatus = vi.fn()
const mockClearVerifySession = vi.fn()

vi.mock('../agent/verify-session-manager.js', () => ({
  acquireVerifyLock: (...args: any[]) => mockAcquireVerifyLock(...args),
  releaseVerifyLock: (...args: any[]) => mockReleaseVerifyLock(...args),
  isVerifyActive: (...args: any[]) => mockIsVerifyActive(...args),
  appendVerifyMessage: (...args: any[]) => mockAppendVerifyMessage(...args),
  getVerifyStatus: (...args: any[]) => mockGetVerifyStatus(...args),
  clearVerifySession: (...args: any[]) => mockClearVerifySession(...args),
}))

// Mock fs functions used by track-plan route and delete cleanup
const mockExistsSync = vi.fn()
const mockReadFileSync = vi.fn()
const mockWriteFileSync = vi.fn()
const mockRmSync = vi.fn()
vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal() as Record<string, any>
  return {
    ...actual,
    existsSync: (...args: any[]) => mockExistsSync(...args),
    readFileSync: (...args: any[]) => mockReadFileSync(...args),
    writeFileSync: (...args: any[]) => mockWriteFileSync(...args),
    rmSync: (...args: any[]) => mockRmSync(...args),
  }
})

// Import route after mocks
import issuesRoute from './issues.js'
import { validateTrackArtifacts } from './issues.js'

// ---- Test App Setup ----

function createApp() {
  const app = new Hono()
  app.route('/issues', issuesRoute)
  return app
}

function makeIssue(overrides: Record<string, any> = {}) {
  return {
    id: 'ISS-001',
    title: 'Test issue',
    description: 'desc',
    type: 'bug',
    priority: 'P1',
    status: 'pending',
    createdAt: '2026-03-20T00:00:00Z',
    updatedAt: '2026-03-20T00:00:00Z',
    ...overrides,
  }
}

// ---- Tests ----

describe('Issue Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ====== Existing CRUD endpoints ======

  describe('GET /issues', () => {
    it('returns all issues when no pagination params (client-side pagination mode)', async () => {
      const issues = Array.from({ length: 25 }, (_, i) => makeIssue({ id: `ISS-${String(i + 1).padStart(3, '0')}` }))
      mockListIssues.mockReturnValue(issues)

      const app = createApp()
      const res = await app.request('/issues')
      expect(res.status).toBe(200)

      const json = await res.json()
      expect(json.issues).toHaveLength(25)
      expect(json.total).toBe(25)
      expect(json.page).toBe(1)
      expect(json.pageSize).toBe(25)
      expect(json.totalPages).toBe(1)
    })

    it('returns paginated issues when page/pageSize params are provided', async () => {
      const issues = Array.from({ length: 25 }, (_, i) => makeIssue({ id: `ISS-${String(i + 1).padStart(3, '0')}` }))
      mockListIssues.mockReturnValue(issues)

      const app = createApp()
      const res = await app.request('/issues?page=2&pageSize=10')
      expect(res.status).toBe(200)

      const json = await res.json()
      expect(json.issues).toHaveLength(10)
      expect(json.total).toBe(25)
      expect(json.page).toBe(2)
      expect(json.pageSize).toBe(10)
      expect(json.totalPages).toBe(3)
    })

    it('filters by status', async () => {
      const issues = [
        makeIssue({ status: 'pending' }),
        makeIssue({ id: 'ISS-002', status: 'done' }),
      ]
      mockListIssues.mockReturnValue(issues)

      const app = createApp()
      const res = await app.request('/issues?status=done')
      const json = await res.json()
      expect(json.issues).toHaveLength(1)
      expect(json.issues[0].status).toBe('done')
    })

    it('filters by tracking status', async () => {
      const issues = [
        makeIssue({ status: 'pending' }),
        makeIssue({ id: 'ISS-002', status: 'tracking' }),
        makeIssue({ id: 'ISS-003', status: 'tracked' }),
      ]
      mockListIssues.mockReturnValue(issues)

      const app = createApp()
      const res = await app.request('/issues?status=tracking')
      const json = await res.json()
      expect(json.issues).toHaveLength(1)
      expect(json.issues[0].status).toBe('tracking')
    })

    it('returns empty when no issues', async () => {
      mockListIssues.mockReturnValue([])

      const app = createApp()
      const res = await app.request('/issues')
      const json = await res.json()
      expect(json.issues).toHaveLength(0)
      expect(json.total).toBe(0)
    })
  })

  describe('GET /issues/:id', () => {
    it('returns issue detail', async () => {
      mockGetIssue.mockReturnValue(makeIssue())

      const app = createApp()
      const res = await app.request('/issues/ISS-001')
      expect(res.status).toBe(200)

      const json = await res.json()
      expect(json.id).toBe('ISS-001')
    })

    it('returns 404 for missing issue', async () => {
      mockGetIssue.mockReturnValue(null)

      const app = createApp()
      const res = await app.request('/issues/ISS-999')
      expect(res.status).toBe(404)
    })
  })

  describe('POST /issues', () => {
    it('creates issue with valid data', async () => {
      const created = makeIssue()
      mockCreateIssue.mockReturnValue(created)

      const app = createApp()
      const res = await app.request('/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New bug', type: 'bug', priority: 'P0' }),
      })
      expect(res.status).toBe(201)
      expect(mockCreateIssue).toHaveBeenCalledWith({
        title: 'New bug',
        description: '',
        type: 'bug',
        priority: 'P0',
      })
    })

    it('rejects empty title', async () => {
      const app = createApp()
      const res = await app.request('/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '   ' }),
      })
      expect(res.status).toBe(400)
    })
  })

  describe('DELETE /issues/:id', () => {
    it('deletes existing issue and cleans up sessions', async () => {
      const issue = makeIssue()
      mockGetIssue.mockReturnValue(issue)
      mockDeleteIssue.mockReturnValue(true)

      const app = createApp()
      const res = await app.request('/issues/ISS-001', { method: 'DELETE' })
      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.ok).toBe(true)
      expect(json.cleanedUp.sessionsCleared).toBe(true)
      expect(mockClearImplementSession).toHaveBeenCalledWith('ISS-001')
      expect(mockClearVerifySession).toHaveBeenCalledWith('ISS-001')
    })

    it('deletes track directory and tracks.md row when issue has trackId', async () => {
      const issue = makeIssue({ trackId: 'my-track_20260321' })
      mockGetIssue.mockReturnValue(issue)
      mockDeleteIssue.mockReturnValue(true)
      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockReturnValue('| [x] | my-track_20260321 | Title | 2026-03-21 | 2026-03-21 |\n')

      const app = createApp()
      const res = await app.request('/issues/ISS-001', { method: 'DELETE' })
      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.cleanedUp.trackDeleted).toBe(true)
      expect(mockRmSync).toHaveBeenCalled()
      expect(mockWriteFileSync).toHaveBeenCalled()
    })

    it('returns 404 for missing issue', async () => {
      mockGetIssue.mockReturnValue(null)

      const app = createApp()
      const res = await app.request('/issues/ISS-999', { method: 'DELETE' })
      expect(res.status).toBe(404)
    })
  })

  // ====== Lifecycle endpoints ======

  describe('POST /issues/:id/create-track', () => {
    it('sets status to tracking and fires async agent', async () => {
      const issue = makeIssue({ status: 'pending' })
      mockGetIssue.mockReturnValue(issue)
      mockUpdateIssue.mockReturnValue({ ...issue, status: 'tracking' })

      const app = createApp()
      const res = await app.request('/issues/ISS-001/create-track', { method: 'POST' })
      expect(res.status).toBe(200)

      const json = await res.json()
      // Immediate response should have tracking status (not tracked)
      expect(json.issue.status).toBe('tracking')
      expect(json.message).toContain('Track creation started')
      // updateIssue should be called with 'tracking' status
      expect(mockUpdateIssue).toHaveBeenCalledWith('ISS-001', { status: 'tracking' })
    })

    it('rejects non-pending issue', async () => {
      mockGetIssue.mockReturnValue(makeIssue({ status: 'tracked' }))

      const app = createApp()
      const res = await app.request('/issues/ISS-001/create-track', { method: 'POST' })
      expect(res.status).toBe(400)
    })

    it('rejects tracking issue (prevents duplicate)', async () => {
      mockGetIssue.mockReturnValue(makeIssue({ status: 'tracking' }))

      const app = createApp()
      const res = await app.request('/issues/ISS-001/create-track', { method: 'POST' })
      expect(res.status).toBe(400)
    })

    it('rejects issue with existing trackId', async () => {
      mockGetIssue.mockReturnValue(makeIssue({ status: 'pending', trackId: 'existing-track' }))

      const app = createApp()
      const res = await app.request('/issues/ISS-001/create-track', { method: 'POST' })
      expect(res.status).toBe(400)
    })

    it('returns 404 for missing issue', async () => {
      mockGetIssue.mockReturnValue(null)

      const app = createApp()
      const res = await app.request('/issues/ISS-999/create-track', { method: 'POST' })
      expect(res.status).toBe(404)
    })
  })

  describe('POST /issues/:id/start-implement', () => {
    it('transitions tracked → in-progress', async () => {
      const issue = makeIssue({ status: 'tracked', trackId: 'some-track' })
      mockGetIssue.mockReturnValue(issue)
      mockAcquireImplementLock.mockReturnValue(true) // Lock available
      // enrichIssueFromTrack: first call returns 'tracked' (guard check), second call returns 'in-progress' (after track metadata update)
      mockEnrichIssueFromTrack
        .mockReturnValueOnce({ ...issue, status: 'tracked' })
        .mockReturnValueOnce({ ...issue, status: 'in-progress' })

      const app = createApp()
      const res = await app.request('/issues/ISS-001/start-implement', { method: 'POST' })
      expect(res.status).toBe(200)

      const json = await res.json()
      expect(json.issue.status).toBe('in-progress')
      // ISS-047: route now updates track metadata instead of issue status directly
      expect(mockUpdateTrackMetadata).toHaveBeenCalledWith('some-track', { status: 'in_progress' })
    })

    it('rejects pending issue without trackId', async () => {
      mockGetIssue.mockReturnValue(makeIssue({ status: 'pending' }))

      const app = createApp()
      const res = await app.request('/issues/ISS-001/start-implement', { method: 'POST' })
      expect(res.status).toBe(400)
    })

    it('rejects tracking issue', async () => {
      mockGetIssue.mockReturnValue(makeIssue({ status: 'tracking' }))

      const app = createApp()
      const res = await app.request('/issues/ISS-001/start-implement', { method: 'POST' })
      expect(res.status).toBe(400)
    })

    it('returns 404 for missing issue', async () => {
      mockGetIssue.mockReturnValue(null)

      const app = createApp()
      const res = await app.request('/issues/ISS-999/start-implement', { method: 'POST' })
      expect(res.status).toBe(404)
    })
  })

  describe('POST /issues/:id/verify', () => {
    it('returns 200 with started message (async fire-and-forget)', async () => {
      const issue = makeIssue({ status: 'in-progress' })
      mockGetIssue.mockReturnValue(issue)
      mockAcquireVerifyLock.mockReturnValue(true)

      const app = createApp()
      const res = await app.request('/issues/ISS-001/verify', { method: 'POST' })
      expect(res.status).toBe(200)

      const json = await res.json()
      expect(json.message).toContain('Verification started')
      expect(mockAcquireVerifyLock).toHaveBeenCalledWith('ISS-001')
    })

    it('returns 409 when verify is already in progress', async () => {
      const issue = makeIssue({ status: 'in-progress' })
      mockGetIssue.mockReturnValue(issue)
      mockAcquireVerifyLock.mockReturnValue(false)

      const app = createApp()
      const res = await app.request('/issues/ISS-001/verify', { method: 'POST' })
      expect(res.status).toBe(409)
    })

    it('rejects non in-progress/done issue', async () => {
      mockGetIssue.mockReturnValue(makeIssue({ status: 'tracked' }))

      const app = createApp()
      const res = await app.request('/issues/ISS-001/verify', { method: 'POST' })
      expect(res.status).toBe(400)
    })

    it('returns 404 for missing issue', async () => {
      mockGetIssue.mockReturnValue(null)

      const app = createApp()
      const res = await app.request('/issues/ISS-999/verify', { method: 'POST' })
      expect(res.status).toBe(404)
    })

    it('allows verify for done issues (re-verify)', async () => {
      const issue = makeIssue({ status: 'done' })
      mockGetIssue.mockReturnValue(issue)
      mockAcquireVerifyLock.mockReturnValue(true)

      const app = createApp()
      const res = await app.request('/issues/ISS-001/verify', { method: 'POST' })
      expect(res.status).toBe(200)
    })
  })

  describe('POST /issues/:id/reopen', () => {
    it('transitions done → implemented (clears verification, keeps trackId)', async () => {
      const issue = makeIssue({ status: 'done', trackId: 'old-track' })
      mockGetIssue.mockReturnValue(issue)
      // enrichIssueFromTrack: first call returns 'done' (guard check), second returns 'implemented' (after verification cleared)
      mockEnrichIssueFromTrack
        .mockReturnValueOnce({ ...issue, status: 'done' })
        .mockReturnValueOnce({ ...issue, status: 'implemented' })

      const app = createApp()
      const res = await app.request('/issues/ISS-001/reopen', { method: 'POST' })
      expect(res.status).toBe(200)

      const json = await res.json()
      // ISS-047: reopen clears verification from track metadata; status re-derives to 'implemented' (track still complete)
      expect(json.issue.status).toBe('implemented')
      expect(mockUpdateTrackMetadata).toHaveBeenCalledWith('old-track', { verification: undefined })
      expect(mockUpdateTracksMdStatus).toHaveBeenCalledWith('old-track', '[~]')
    })

    it('rejects non-done issue', async () => {
      mockGetIssue.mockReturnValue(makeIssue({ status: 'in-progress' }))

      const app = createApp()
      const res = await app.request('/issues/ISS-001/reopen', { method: 'POST' })
      expect(res.status).toBe(400)
    })

    it('returns 404 for missing issue', async () => {
      mockGetIssue.mockReturnValue(null)

      const app = createApp()
      const res = await app.request('/issues/ISS-999/reopen', { method: 'POST' })
      expect(res.status).toBe(404)
    })
  })

  describe('GET /issues/:id/track', () => {
    it('returns track metadata', async () => {
      mockGetIssue.mockReturnValue(makeIssue({ trackId: 'test-track' }))
      const track = { id: 'test-track', title: 'Test', type: 'bug', status: 'planned', created: '', updated: '', phases: { total: 0, completed: 0 }, tasks: { total: 0, completed: 0 } }
      mockGetTrackMetadata.mockReturnValue(track)

      const app = createApp()
      const res = await app.request('/issues/ISS-001/track')
      expect(res.status).toBe(200)

      const json = await res.json()
      expect(json.track.id).toBe('test-track')
    })

    it('returns 404 when issue has no trackId', async () => {
      mockGetIssue.mockReturnValue(makeIssue())

      const app = createApp()
      const res = await app.request('/issues/ISS-001/track')
      expect(res.status).toBe(404)
    })

    it('returns 404 when track metadata not found', async () => {
      mockGetIssue.mockReturnValue(makeIssue({ trackId: 'deleted-track' }))
      mockGetTrackMetadata.mockReturnValue(null)

      const app = createApp()
      const res = await app.request('/issues/ISS-001/track')
      expect(res.status).toBe(404)
    })

    it('returns 404 for missing issue', async () => {
      mockGetIssue.mockReturnValue(null)

      const app = createApp()
      const res = await app.request('/issues/ISS-999/track')
      expect(res.status).toBe(404)
    })
  })

  // ====== New track-plan and track-progress endpoints ======

  describe('GET /issues/:id/track-plan', () => {
    it('returns plan content when track and plan exist', async () => {
      mockGetIssue.mockReturnValue(makeIssue({ trackId: 'test-track' }))
      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockReturnValue('# Plan\n## Phase 1\nDo stuff')

      const app = createApp()
      const res = await app.request('/issues/ISS-001/track-plan')
      expect(res.status).toBe(200)

      const json = await res.json()
      expect(json.plan).toContain('# Plan')
      expect(json.trackId).toBe('test-track')
    })

    it('returns 404 when issue has no trackId', async () => {
      mockGetIssue.mockReturnValue(makeIssue())

      const app = createApp()
      const res = await app.request('/issues/ISS-001/track-plan')
      expect(res.status).toBe(404)
    })

    it('returns 404 when plan.md does not exist', async () => {
      mockGetIssue.mockReturnValue(makeIssue({ trackId: 'test-track' }))
      mockExistsSync.mockReturnValue(false)

      const app = createApp()
      const res = await app.request('/issues/ISS-001/track-plan')
      expect(res.status).toBe(404)
    })

    it('returns 404 for missing issue', async () => {
      mockGetIssue.mockReturnValue(null)

      const app = createApp()
      const res = await app.request('/issues/ISS-999/track-plan')
      expect(res.status).toBe(404)
    })
  })

  describe('GET /issues/:id/track-progress', () => {
    it('returns cached progress messages', async () => {
      const messages = [
        { kind: 'started', content: 'Starting', timestamp: '2026-03-20T00:00:00Z' },
        { kind: 'thinking', content: 'Processing', timestamp: '2026-03-20T00:01:00Z' },
      ]
      mockTrackStateGetState.mockReturnValue({ messages, isActive: true })

      const app = createApp()
      const res = await app.request('/issues/ISS-001/track-progress')
      expect(res.status).toBe(200)

      const json = await res.json()
      expect(json.messages).toHaveLength(2)
      expect(json.isActive).toBe(true)
    })

    it('returns empty array when no state exists', async () => {
      mockTrackStateGetState.mockReturnValue(null)

      const app = createApp()
      const res = await app.request('/issues/ISS-001/track-progress')
      expect(res.status).toBe(200)

      const json = await res.json()
      expect(json.messages).toHaveLength(0)
      expect(json.isActive).toBe(false)
    })

    it('returns isActive=false when tracking is finished', async () => {
      const messages = [
        { kind: 'completed', trackId: 'test-track', timestamp: '2026-03-20T00:05:00Z' },
      ]
      mockTrackStateGetState.mockReturnValue({ messages, isActive: false })

      const app = createApp()
      const res = await app.request('/issues/ISS-001/track-progress')
      const json = await res.json()
      expect(json.isActive).toBe(false)
      expect(json.messages[0].kind).toBe('completed')
    })
  })

  // ====== ISS-029: Track answer endpoint ======

  describe('POST /issues/:id/track-answer', () => {
    it('accepts answer when pending question exists with sessionId', async () => {
      mockTrackStateGetPendingQuestion.mockReturnValue({
        sessionId: 'test-session-123',
        questions: [{ question: 'Confirm?' }],
        askedAt: '2026-03-21T00:00:00Z',
      })

      const app = createApp()
      const res = await app.request('/issues/ISS-001/track-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: 'Yes, proceed' }),
      })
      expect(res.status).toBe(200)

      const json = await res.json()
      expect(json.ok).toBe(true)
      expect(mockTrackStateClearPendingQuestion).toHaveBeenCalledWith('ISS-001')
    })

    it('accepts answer when pending question has backfilled sessionId', async () => {
      // ISS-029: sessionId was initially empty, then backfilled
      mockTrackStateGetPendingQuestion.mockReturnValue({
        sessionId: 'backfilled-session-456',
        questions: [{ question: 'Is this OK?' }],
        askedAt: '2026-03-21T00:00:00Z',
      })

      const app = createApp()
      const res = await app.request('/issues/ISS-001/track-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: 'Yes' }),
      })
      expect(res.status).toBe(200)
      expect(mockTrackStateClearPendingQuestion).toHaveBeenCalledWith('ISS-001')
    })

    it('returns 404 when no pending question exists', async () => {
      mockTrackStateGetPendingQuestion.mockReturnValue(null)

      const app = createApp()
      const res = await app.request('/issues/ISS-001/track-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: 'Yes' }),
      })
      expect(res.status).toBe(404)
    })

    it('rejects empty answer', async () => {
      const app = createApp()
      const res = await app.request('/issues/ISS-001/track-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: '   ' }),
      })
      expect(res.status).toBe(400)
    })

    it('rejects missing answer field', async () => {
      const app = createApp()
      const res = await app.request('/issues/ISS-001/track-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      expect(res.status).toBe(400)
    })

    it('broadcasts thinking message with truncated answer', async () => {
      mockTrackStateGetPendingQuestion.mockReturnValue({
        sessionId: 'sess-789',
        questions: [{ question: 'Pick one' }],
        askedAt: '2026-03-21T00:00:00Z',
      })

      const app = createApp()
      await app.request('/issues/ISS-001/track-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: 'My detailed answer' }),
      })

      // Should broadcast a thinking message with the answer
      expect(mockBroadcast).toHaveBeenCalledWith(
        'issue-track-progress',
        expect.objectContaining({
          issueId: 'ISS-001',
          kind: 'thinking',
          content: expect.stringContaining('Answer received: My detailed answer'),
        }),
      )
    })
  })

  // ====== ISS-029: Track progress with pendingQuestion ======

  describe('GET /issues/:id/track-progress (pendingQuestion)', () => {
    it('returns pendingQuestion when present', async () => {
      mockTrackStateGetState.mockReturnValue({
        messages: [{ kind: 'started', content: 'Starting', timestamp: '2026-03-21T00:00:00Z' }],
        isActive: true,
        pendingQuestion: {
          sessionId: 'test-session',
          questions: [{ question: 'Confirm spec?' }],
          askedAt: '2026-03-21T00:01:00Z',
        },
      })

      const app = createApp()
      const res = await app.request('/issues/ISS-001/track-progress')
      expect(res.status).toBe(200)

      const json = await res.json()
      expect(json.pendingQuestion).toBeTruthy()
      expect(json.pendingQuestion.sessionId).toBe('test-session')
      expect(json.pendingQuestion.questions[0].question).toBe('Confirm spec?')
    })

    it('returns null pendingQuestion when none exists', async () => {
      mockTrackStateGetState.mockReturnValue({
        messages: [],
        isActive: true,
      })

      const app = createApp()
      const res = await app.request('/issues/ISS-001/track-progress')
      const json = await res.json()
      expect(json.pendingQuestion).toBeNull()
    })
  })

  // ====== Track artifact validation (ISS-020 fix) ======

  describe('validateTrackArtifacts', () => {
    it('returns valid for complete plan.md + spec.md', () => {
      // plan.md: >100 chars with Phase/Task keywords
      const validPlan = '# Implementation Plan\n\n## Phase 1: Setup\n\n- [ ] Task 1.1: Do the first thing\n- [ ] Task 1.2: Do the second thing\n\n## Phase 2: Build\n\n- [ ] Task 2.1: Build it'
      // spec.md: >50 chars with Summary keyword
      const validSpec = '# Specification\n\n## Summary\n\nThis is a detailed specification for the feature with acceptance criteria.'

      // existsSync returns true for both paths, readFileSync returns content
      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockImplementation((path: string) => {
        if (String(path).endsWith('plan.md')) return validPlan
        if (String(path).endsWith('spec.md')) return validSpec
        return ''
      })

      const result = validateTrackArtifacts('/mock/track-dir')
      expect(result.valid).toBe(true)
      expect(result.reasons).toHaveLength(0)
    })

    it('returns invalid for empty plan.md', () => {
      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockImplementation((path: string) => {
        if (String(path).endsWith('plan.md')) return '' // empty
        if (String(path).endsWith('spec.md')) return '# Specification\n\n## Summary\n\nValid spec content here that is long enough.'
        return ''
      })

      const result = validateTrackArtifacts('/mock/track-dir')
      expect(result.valid).toBe(false)
      expect(result.reasons).toContain('plan.md is too short (<=100 chars)')
      expect(result.reasons).toContain('plan.md is missing Phase/Task structure')
    })

    it('returns invalid for plan.md without Phase/Task keywords', () => {
      const noKeywordPlan = 'This is some random text that is longer than 100 characters but does not contain the required keywords like phase or task markers anywhere in the content at all.'
      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockImplementation((path: string) => {
        if (String(path).endsWith('plan.md')) return noKeywordPlan
        if (String(path).endsWith('spec.md')) return '# Specification\n\n## Summary\n\nValid spec content here that is long enough.'
        return ''
      })

      const result = validateTrackArtifacts('/mock/track-dir')
      expect(result.valid).toBe(false)
      expect(result.reasons).toContain('plan.md is missing Phase/Task structure')
    })

    it('returns invalid when plan.md does not exist', () => {
      mockExistsSync.mockImplementation((path: string) => {
        if (String(path).endsWith('plan.md')) return false
        return true
      })
      mockReadFileSync.mockImplementation((path: string) => {
        if (String(path).endsWith('spec.md')) return '# Specification\n\n## Summary\n\nValid spec content.'
        return ''
      })

      const result = validateTrackArtifacts('/mock/track-dir')
      expect(result.valid).toBe(false)
      expect(result.reasons).toContain('plan.md does not exist')
    })

    it('returns invalid for empty spec.md', () => {
      const validPlan = '# Plan\n\n## Phase 1: Init\n\n- [ ] Task 1.1: Setup project\n- [ ] Task 1.2: Configure build\n\n## Phase 2: Code\n\n- [ ] Task 2.1: Write code'
      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockImplementation((path: string) => {
        if (String(path).endsWith('plan.md')) return validPlan
        if (String(path).endsWith('spec.md')) return 'short' // too short
        return ''
      })

      const result = validateTrackArtifacts('/mock/track-dir')
      expect(result.valid).toBe(false)
      expect(result.reasons).toContain('spec.md is too short (<=50 chars)')
    })

    it('returns invalid for spec.md without Summary keyword', () => {
      const validPlan = '# Plan\n\n## Phase 1: Init\n\n- [ ] Task 1.1: Setup project\n- [ ] Task 1.2: Configure build\n\n## Phase 2: Code\n\n- [ ] Task 2.1: Write code'
      const noKeywordSpec = 'This is a spec file that is long enough but does not contain the required keywords at all. It just rambles on without structure.'
      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockImplementation((path: string) => {
        if (String(path).endsWith('plan.md')) return validPlan
        if (String(path).endsWith('spec.md')) return noKeywordSpec
        return ''
      })

      const result = validateTrackArtifacts('/mock/track-dir')
      expect(result.valid).toBe(false)
      expect(result.reasons).toContain('spec.md is missing Summary/Acceptance Criteria/Specification keywords')
    })

    it('returns invalid when spec.md does not exist', () => {
      const validPlan = '# Plan\n\n## Phase 1: Init\n\n- [ ] Task 1.1: Setup project\n- [ ] Task 1.2: Configure build\n\n## Phase 2: Code\n\n- [ ] Task 2.1: Write code'
      mockExistsSync.mockImplementation((path: string) => {
        if (String(path).endsWith('spec.md')) return false
        return true
      })
      mockReadFileSync.mockImplementation((path: string) => {
        if (String(path).endsWith('plan.md')) return validPlan
        return ''
      })

      const result = validateTrackArtifacts('/mock/track-dir')
      expect(result.valid).toBe(false)
      expect(result.reasons).toContain('spec.md does not exist')
    })

    it('returns multiple reasons when both files are invalid', () => {
      mockExistsSync.mockReturnValue(false)

      const result = validateTrackArtifacts('/mock/track-dir')
      expect(result.valid).toBe(false)
      expect(result.reasons.length).toBeGreaterThanOrEqual(2)
      expect(result.reasons).toContain('plan.md does not exist')
      expect(result.reasons).toContain('spec.md does not exist')
    })

    it('accepts plan.md with Task items using bullet marker', () => {
      // Use * instead of - for task items
      const validPlan = '# Plan\n\n## Phase 1: Init\n\n* [x] Task 1.1: Done thing\n* [ ] Task 1.2: Pending thing\n\n## Phase 2: Build\n\n* [ ] Task 2.1: Build it all out here'
      const validSpec = '# Specification\n\n## Summary\n\nThis specification covers the feature requirements and acceptance criteria.'

      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockImplementation((path: string) => {
        if (String(path).endsWith('plan.md')) return validPlan
        if (String(path).endsWith('spec.md')) return validSpec
        return ''
      })

      const result = validateTrackArtifacts('/mock/track-dir')
      expect(result.valid).toBe(true)
    })

    it('accepts spec.md with Acceptance keyword instead of Summary', () => {
      const validPlan = '# Plan\n\n## Phase 1: Init\n\n- [ ] Task 1.1: Setup project\n- [ ] Task 1.2: Configure build\n\n## Phase 2: Code\n\n- [ ] Task 2.1: Write code'
      const validSpec = '# Feature Spec\n\n## Acceptance Criteria\n\n- Must handle errors properly\n- Must pass all existing tests'

      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockImplementation((path: string) => {
        if (String(path).endsWith('plan.md')) return validPlan
        if (String(path).endsWith('spec.md')) return validSpec
        return ''
      })

      const result = validateTrackArtifacts('/mock/track-dir')
      expect(result.valid).toBe(true)
    })
  })

  // ====== Implement status endpoint ======

  describe('GET /issues/:id/implement-status', () => {
    it('returns status from session manager', async () => {
      mockGetImplementStatus.mockReturnValue({
        active: true,
        status: 'active',
        messages: [
          { type: 'started', content: 'Started', timestamp: '2026-03-20T00:00:00Z' },
          { type: 'thinking', content: 'Analyzing code', timestamp: '2026-03-20T00:01:00Z' },
        ],
        trackId: 'test-track',
        startedAt: '2026-03-20T00:00:00Z',
      })

      const app = createApp()
      const res = await app.request('/issues/ISS-001/implement-status')
      expect(res.status).toBe(200)

      const json = await res.json()
      expect(json.active).toBe(true)
      expect(json.status).toBe('active')
      expect(json.messages).toHaveLength(2)
      expect(json.trackId).toBe('test-track')
    })

    it('returns none status when no session exists', async () => {
      mockGetImplementStatus.mockReturnValue({
        active: false,
        status: 'none',
        messages: [],
      })

      const app = createApp()
      const res = await app.request('/issues/ISS-001/implement-status')
      expect(res.status).toBe(200)

      const json = await res.json()
      expect(json.active).toBe(false)
      expect(json.status).toBe('none')
      expect(json.messages).toHaveLength(0)
    })

    it('returns completed status with messages', async () => {
      mockGetImplementStatus.mockReturnValue({
        active: false,
        status: 'completed',
        messages: [
          { type: 'started', content: 'Started', timestamp: '2026-03-20T00:00:00Z' },
          { type: 'completed', content: 'Done', timestamp: '2026-03-20T00:05:00Z' },
        ],
        trackId: 'test-track',
        startedAt: '2026-03-20T00:00:00Z',
      })

      const app = createApp()
      const res = await app.request('/issues/ISS-001/implement-status')
      const json = await res.json()
      expect(json.status).toBe('completed')
      expect(json.active).toBe(false)
    })
  })

  // ====== Start-implement with lock (updated behavior) ======

  describe('POST /issues/:id/start-implement (lock behavior)', () => {
    it('returns 409 when implement lock cannot be acquired', async () => {
      const issue = makeIssue({ status: 'tracked', trackId: 'some-track' })
      mockGetIssue.mockReturnValue(issue)
      mockAcquireImplementLock.mockReturnValue(false) // Lock already held

      const app = createApp()
      const res = await app.request('/issues/ISS-001/start-implement', { method: 'POST' })
      expect(res.status).toBe(409)

      const json = await res.json()
      expect(json.error).toContain('already in progress')
    })

    it('acquires lock and starts implementation when available', async () => {
      const issue = makeIssue({ status: 'tracked', trackId: 'some-track' })
      mockGetIssue.mockReturnValue(issue)
      mockAcquireImplementLock.mockReturnValue(true) // Lock available
      // enrichIssueFromTrack: first call returns 'tracked' (guard), subsequent calls return 'in-progress'
      mockEnrichIssueFromTrack
        .mockReturnValueOnce({ ...issue, status: 'tracked' })
        .mockReturnValue({ ...issue, status: 'in-progress' })

      const app = createApp()
      const res = await app.request('/issues/ISS-001/start-implement', { method: 'POST' })
      expect(res.status).toBe(200)

      expect(mockAcquireImplementLock).toHaveBeenCalledWith('ISS-001', 'some-track')
      // ISS-047: route updates track metadata instead of issue status directly
      expect(mockUpdateTrackMetadata).toHaveBeenCalledWith('some-track', { status: 'in_progress' })
    })
  })
})

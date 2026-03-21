/**
 * VerifyProgressPanel component tests (ISS-054)
 *
 * Tests the polling fallback that detects missed SSE completion events.
 * When isActive is true and messages exist, the component polls
 * verify-status every 5s. If backend reports completed/failed,
 * the UI transitions out of "Running Tests..." state.
 */
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { renderWithProviders, screen, waitFor } from '../test-utils'
import VerifyProgressPanel from './VerifyProgressPanel'
import { useIssueTrackStore, type VerifyMessage, type VerifyResult } from '../stores/issueTrackStore'
import * as hooks from '../api/hooks'

// Mock the useVerifyStatus hook
vi.mock('../api/hooks', async () => {
  const actual = await vi.importActual<typeof import('../api/hooks')>('../api/hooks')
  return {
    ...actual,
    useVerifyStatus: vi.fn(),
  }
})

const mockUseVerifyStatus = hooks.useVerifyStatus as Mock

// Helper: set up store state
function setStoreState(issueId: string, opts: {
  messages?: VerifyMessage[]
  isActive?: boolean
  result?: VerifyResult
}) {
  const store = useIssueTrackStore.getState()
  if (opts.messages?.length) {
    for (const msg of opts.messages) {
      store.addVerifyMessage(issueId, msg)
    }
  }
  if (opts.isActive !== undefined) {
    store.setVerifyActive(issueId, opts.isActive)
  }
  if (opts.result) {
    store.setVerifyResult(issueId, opts.result)
  }
}

describe('VerifyProgressPanel', () => {
  const issueId = 'ISS-TEST-054'

  beforeEach(() => {
    // Clear store state
    useIssueTrackStore.getState().clearVerify(issueId)
    vi.clearAllMocks()

    // Default mock: no data
    mockUseVerifyStatus.mockReturnValue({ data: undefined })
  })

  it('shows "Running Tests..." when isActive is true', () => {
    setStoreState(issueId, {
      isActive: true,
      messages: [
        { kind: 'started', content: 'Verification started', timestamp: new Date().toISOString() },
      ],
    })

    renderWithProviders(<VerifyProgressPanel issueId={issueId} />)
    expect(screen.getByText('Running Tests...')).toBeInTheDocument()
  })

  it('shows "All Tests Passed" when completed with overall=true', () => {
    const result: VerifyResult = {
      unitTest: { passed: true, output: 'all pass' },
      uiTest: { passed: true, output: 'all pass' },
      overall: true,
    }
    setStoreState(issueId, {
      isActive: false,
      messages: [
        { kind: 'started', content: 'Verification started', timestamp: new Date().toISOString() },
        { kind: 'completed', content: 'All tests passed ✓', timestamp: new Date().toISOString() },
      ],
      result,
    })

    renderWithProviders(<VerifyProgressPanel issueId={issueId} />)
    expect(screen.getByText('All Tests Passed')).toBeInTheDocument()
  })

  it('transitions from "Running Tests..." to "All Tests Passed" via polling fallback', async () => {
    // Start with isActive=true and messages (SSE completion missed)
    setStoreState(issueId, {
      isActive: true,
      messages: [
        { kind: 'started', content: 'Verification started', timestamp: new Date().toISOString() },
        { kind: 'tool-call', content: 'Running Unit Tests...', toolName: 'Unit Tests', timestamp: new Date().toISOString() },
        { kind: 'tool-result', content: 'All 67 tests pass', toolName: 'Unit Tests', timestamp: new Date().toISOString() },
      ],
    })

    // Polling fallback returns completed status from backend
    const polledResult: VerifyResult = {
      unitTest: { passed: true, output: 'All 67 tests pass' },
      uiTest: { passed: true, output: 'All UI tests pass' },
      overall: true,
    }

    // First call: recovery (enabled=false returns no data)
    // Second call: polling (enabled=true returns completed)
    mockUseVerifyStatus.mockImplementation((_id: string, enabled: boolean, _refetchInterval?: number | false) => {
      if (enabled) {
        return { data: { active: false, status: 'completed' as const, messages: [], result: polledResult } }
      }
      return { data: undefined }
    })

    renderWithProviders(<VerifyProgressPanel issueId={issueId} />)

    // Should initially show "Running Tests..."
    // But the polling fallback effect should fire and sync state
    await waitFor(() => {
      expect(screen.getByText('All Tests Passed')).toBeInTheDocument()
    })
  })

  it('transitions from "Running Tests..." to "Tests Failed" via polling fallback', async () => {
    setStoreState(issueId, {
      isActive: true,
      messages: [
        { kind: 'started', content: 'Verification started', timestamp: new Date().toISOString() },
        { kind: 'tool-call', content: 'Running Unit Tests...', toolName: 'Unit Tests', timestamp: new Date().toISOString() },
      ],
    })

    const polledResult: VerifyResult = {
      unitTest: { passed: false, output: '3 tests failed' },
      uiTest: { passed: false, output: 'Skipped' },
      overall: false,
    }

    mockUseVerifyStatus.mockImplementation((_id: string, enabled: boolean, _refetchInterval?: number | false) => {
      if (enabled) {
        return { data: { active: false, status: 'completed' as const, messages: [], result: polledResult } }
      }
      return { data: undefined }
    })

    renderWithProviders(<VerifyProgressPanel issueId={issueId} />)

    await waitFor(() => {
      expect(screen.getByText('Tests Failed')).toBeInTheDocument()
    })
  })

  it('does not poll when isActive is false', () => {
    setStoreState(issueId, {
      isActive: false,
      messages: [
        { kind: 'started', content: 'Verification started', timestamp: new Date().toISOString() },
        { kind: 'completed', content: 'All tests passed', timestamp: new Date().toISOString() },
      ],
      result: { overall: true },
    })

    renderWithProviders(<VerifyProgressPanel issueId={issueId} />)

    // Check that useVerifyStatus was called with enabled=false for polling
    // The second call (polling) should have enabled=false since isActive=false
    const calls = mockUseVerifyStatus.mock.calls
    const pollingCalls = calls.filter(
      (call: any[]) => call[2] !== undefined // Has refetchInterval param (polling call)
    )
    for (const call of pollingCalls) {
      expect(call[1]).toBe(false) // enabled should be false
    }
  })

  it('returns null when no messages', () => {
    mockUseVerifyStatus.mockReturnValue({ data: undefined })

    const { container } = renderWithProviders(<VerifyProgressPanel issueId={issueId} />)
    expect(container.firstChild).toBeNull()
  })
})

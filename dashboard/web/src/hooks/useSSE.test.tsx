/**
 * useSSE hook tests
 *
 * Tests EventSource lifecycle: connect, message handling, reconnect on error
 * Mocks EventSource, localStorage, and Zustand stores
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

// Mock all Zustand stores before importing the hook
vi.mock('../stores/patrolStore', () => ({
  usePatrolStore: vi.fn((selector: (s: any) => any) => {
    const store = {
      onPatrolState: vi.fn(),
      onCaseUpdate: vi.fn(),
    }
    return selector(store)
  }),
}))

vi.mock('../stores/caseSessionStore', () => ({
  useCaseSessionStore: Object.assign(
    vi.fn((selector: (s: any) => any) => {
      const store = {
        addMessage: vi.fn(),
        addSessionMessage: vi.fn(),
        setSessionStatus: vi.fn(),
        setActiveSessionId: vi.fn(),
        setCurrentStep: vi.fn(),
        setPendingQuestion: vi.fn(),
        clearPendingQuestion: vi.fn(),
        setLastHeartbeatAt: vi.fn(),
        setQueueStatus: vi.fn(),
        initPipelineSteps: vi.fn(),
        updatePipelineStep: vi.fn(),
        initAgentSpawns: vi.fn(),
        updateAgentSpawn: vi.fn(),
        activeSessionId: {},
      }
      return selector(store)
    }),
    { getState: () => ({ activeSessionId: {}, pipelineSteps: {} }) },
  ),
}))

vi.mock('../stores/issueTrackStore', () => ({
  useIssueTrackStore: vi.fn((selector: (s: any) => any) => {
    const store = {
      addMessage: vi.fn(),
      setTrackingActive: vi.fn(),
      clearMessages: vi.fn(),
      setPendingQuestion: vi.fn(),
      startImplement: vi.fn(),
      addImplementMessage: vi.fn(),
      setImplementStatus: vi.fn(),
      addVerifyMessage: vi.fn(),
      setVerifyActive: vi.fn(),
      setVerifyResult: vi.fn(),
      clearVerify: vi.fn(),
    }
    return selector(store)
  }),
}))

vi.mock('../stores/todoExecuteStore', () => ({
  useTodoExecuteStore: vi.fn((selector: (s: any) => any) => {
    const store = {
      setProgress: vi.fn(),
      setResult: vi.fn(),
    }
    return selector(store)
  }),
}))

vi.mock('../stores/triggerRunStore', () => ({
  useTriggerRunStore: Object.assign(
    vi.fn((selector: (s: any) => any) => {
      const store = {
        onTriggerStarted: vi.fn(),
        onTriggerProgress: vi.fn(),
        onTriggerCompleted: vi.fn(),
        onTriggerFailed: vi.fn(),
        onTriggerCancelled: vi.fn(),
        runs: {},
      }
      return selector(store)
    }),
    { getState: () => ({ runs: {} }) },
  ),
}))

// Mock EventSource
class MockEventSource {
  static instances: MockEventSource[] = []

  url: string
  onopen: (() => void) | null = null
  onerror: (() => void) | null = null
  listeners: Record<string, ((e: { data: string }) => void)[]> = {}
  readyState = 0

  constructor(url: string) {
    this.url = url
    MockEventSource.instances.push(this)
    // Simulate async open
    setTimeout(() => {
      this.readyState = 1
      this.onopen?.()
    }, 0)
  }

  addEventListener(type: string, listener: (e: { data: string }) => void) {
    if (!this.listeners[type]) this.listeners[type] = []
    this.listeners[type].push(listener)
  }

  removeEventListener() {
    // no-op for tests
  }

  close() {
    this.readyState = 2
  }

  // Test helper: simulate receiving an event
  emit(type: string, data: any) {
    const handlers = this.listeners[type] || []
    handlers.forEach((h) => h({ data: JSON.stringify(data) }))
  }

  static reset() {
    MockEventSource.instances = []
  }
}

// Assign mock globally
vi.stubGlobal('EventSource', MockEventSource)

// Import hook after mocks are set up
import { useSSE } from './useSSE'

describe('useSSE', () => {
  let queryClient: QueryClient

  function createWrapper() {
    return function Wrapper({ children }: { children: ReactNode }) {
      return (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      )
    }
  }

  beforeEach(() => {
    MockEventSource.reset()
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    vi.spyOn(queryClient, 'invalidateQueries')
    // Simulate logged-in state
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('mock-jwt-token')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('creates EventSource connection on mount', () => {
    renderHook(() => useSSE(), { wrapper: createWrapper() })
    expect(MockEventSource.instances).toHaveLength(1)
    expect(MockEventSource.instances[0].url).toContain('/events')
  })

  it('does not connect when no auth token', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null)
    renderHook(() => useSSE(), { wrapper: createWrapper() })
    expect(MockEventSource.instances).toHaveLength(0)
  })

  it('closes EventSource on unmount', () => {
    const { unmount } = renderHook(() => useSSE(), { wrapper: createWrapper() })
    const es = MockEventSource.instances[0]
    expect(es.readyState).not.toBe(2) // not closed
    unmount()
    expect(es.readyState).toBe(2) // closed
  })

  it('registers event listeners for known event types', () => {
    renderHook(() => useSSE(), { wrapper: createWrapper() })
    const es = MockEventSource.instances[0]

    const expectedEvents = [
      'case-updated',
      'todo-updated',
      'draft-updated',
      'cron-updated',
      'settings-updated',
      'case-session-thinking',
      'case-session-completed',
      'case-session-failed',
      'patrol-state',
      'patrol-case',
    ]

    for (const event of expectedEvents) {
      expect(es.listeners[event]?.length).toBeGreaterThan(0)
    }
  })

  it('invalidates cases query on case-updated event', () => {
    renderHook(() => useSSE(), { wrapper: createWrapper() })
    const es = MockEventSource.instances[0]

    es.emit('case-updated', { data: { caseNumber: '123' } })

    expect(queryClient.invalidateQueries).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['cases'] })
    )
  })

  it('invalidates todos query on todo-updated event', () => {
    renderHook(() => useSSE(), { wrapper: createWrapper() })
    const es = MockEventSource.instances[0]

    es.emit('todo-updated', { data: { caseNumber: '456' } })

    expect(queryClient.invalidateQueries).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['todos'] })
    )
  })

  it('invalidates settings query on settings-updated event', () => {
    renderHook(() => useSSE(), { wrapper: createWrapper() })
    const es = MockEventSource.instances[0]

    es.emit('settings-updated', {})

    expect(queryClient.invalidateQueries).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['settings'] })
    )
  })

  it('handles malformed JSON gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    renderHook(() => useSSE(), { wrapper: createWrapper() })
    const es = MockEventSource.instances[0]

    // Directly call handler with invalid JSON
    const handlers = es.listeners['case-updated'] || []
    handlers.forEach((h) => h({ data: 'not-valid-json{' }))

    // Should not throw, just warn
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })
})

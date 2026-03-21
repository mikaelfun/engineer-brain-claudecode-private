/**
 * AgentMonitor page tests
 *
 * Tests unified session view: grouping, filtering, type badges, status dots,
 * expand/collapse detail panel, completed sessions separation
 * Mocks API hooks to provide predictable session data
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, screen, within, userEvent } from '../test-utils'

// Mock API hooks
const mockUnifiedSessions = vi.fn()
const mockAgents = vi.fn()
const mockCronJobs = vi.fn()
const mockPatrolState = vi.fn()
const mockCancelPatrol = vi.fn()
const mockCaseMessages = vi.fn()

vi.mock('../api/hooks', () => ({
  useUnifiedSessions: () => mockUnifiedSessions(),
  useAgents: () => mockAgents(),
  useCronJobs: () => mockCronJobs(),
  usePatrolState: () => mockPatrolState(),
  useCancelPatrol: () => mockCancelPatrol(),
  useCaseMessages: () => mockCaseMessages(),
}))

// Mock patrol store
vi.mock('../stores/patrolStore', () => ({
  usePatrolStore: vi.fn((selector: (s: any) => any) => {
    const store = {
      isRunning: false,
      phase: null,
      totalCases: 0,
      changedCases: 0,
      processedCases: 0,
      currentCase: null,
      caseProgress: [],
      error: null,
    }
    return selector(store)
  }),
}))

// Mock case session store
vi.mock('../stores/caseSessionStore', () => ({
  useCaseSessionStore: vi.fn((selector: (s: any) => any) => {
    const store = {
      messages: {},
      addMessage: vi.fn(),
      clearMessages: vi.fn(),
    }
    return selector(store)
  }),
}))

// Mock api client
vi.mock('../api/client', () => ({
  apiPost: vi.fn(),
  apiDelete: vi.fn(),
}))

// Mock implement store
vi.mock('../stores/implementStore', () => ({
  useImplementStore: vi.fn((selector: (s: any) => any) => {
    const store = {
      sessions: {},
    }
    return selector(store)
  }),
}))

// Mock issue track store
vi.mock('../stores/issueTrackStore', () => ({
  useIssueTrackStore: vi.fn((selector: (s: any) => any) => {
    const store = {
      messages: {},
      verifyMessages: {},
    }
    return selector(store)
  }),
  EMPTY_TRACK_MESSAGES: [],
  EMPTY_VERIFY_MESSAGES: [],
}))

import AgentMonitor from './AgentMonitor'

// ---- Test data factories ----

function createUnifiedSession(overrides: Record<string, any> = {}) {
  return {
    id: 'test-session-1',
    type: 'case',
    status: 'active',
    context: '2401010010000001',
    intent: 'Process case',
    startedAt: new Date().toISOString(),
    lastActivityAt: new Date().toISOString(),
    metadata: {},
    ...overrides,
  }
}

describe('AgentMonitor', () => {
  beforeEach(() => {
    // Default: empty data, not loading
    mockAgents.mockReturnValue({ data: { agents: [] }, isLoading: false })
    mockCronJobs.mockReturnValue({ data: { jobs: [] }, isLoading: false })
    mockPatrolState.mockReturnValue({ data: null })
    mockCancelPatrol.mockReturnValue({ mutate: vi.fn(), isPending: false })
    mockCaseMessages.mockReturnValue({ data: null })
    mockUnifiedSessions.mockReturnValue({
      data: { sessions: [], total: 0 },
      isLoading: false,
    })
  })

  it('renders page header with Agent Monitor title', () => {
    renderWithProviders(<AgentMonitor />)
    expect(screen.getByText('Agent Monitor')).toBeInTheDocument()
  })

  it('shows loading state when agents are loading', () => {
    mockAgents.mockReturnValue({ data: null, isLoading: true })
    renderWithProviders(<AgentMonitor />)
    expect(screen.getByText('Loading agents...')).toBeInTheDocument()
  })

  it('shows empty state when no sessions exist', () => {
    renderWithProviders(<AgentMonitor />)
    expect(screen.getByText('No sessions')).toBeInTheDocument()
    expect(screen.getByText('No agent sessions recorded yet')).toBeInTheDocument()
  })

  it('displays session count summary in header', () => {
    const sessions = [
      createUnifiedSession({ id: 's1', status: 'active', type: 'case' }),
      createUnifiedSession({ id: 's2', status: 'completed', type: 'implement' }),
      createUnifiedSession({ id: 's3', status: 'active', type: 'verify' }),
    ]
    mockUnifiedSessions.mockReturnValue({
      data: { sessions, total: 3 },
      isLoading: false,
    })

    renderWithProviders(<AgentMonitor />)
    expect(screen.getByText(/2 active/)).toBeInTheDocument()
    expect(screen.getByText(/3 total sessions/)).toBeInTheDocument()
  })

  it('groups sessions by type with correct labels', () => {
    const sessions = [
      createUnifiedSession({ id: 's1', type: 'case', context: 'CASE-001' }),
      createUnifiedSession({ id: 's2', type: 'implement', context: 'ISS-001' }),
      createUnifiedSession({ id: 's3', type: 'verify', context: 'ISS-002' }),
      createUnifiedSession({ id: 's4', type: 'track-creation', context: 'ISS-003' }),
    ]
    mockUnifiedSessions.mockReturnValue({
      data: { sessions, total: 4 },
      isLoading: false,
    })

    renderWithProviders(<AgentMonitor />)
    expect(screen.getByText(/Case Sessions/)).toBeInTheDocument()
    expect(screen.getByText(/Implement Sessions/)).toBeInTheDocument()
    expect(screen.getByText(/Verify Sessions/)).toBeInTheDocument()
    expect(screen.getByText(/Track Sessions/)).toBeInTheDocument()
  })

  it('renders session context and intent text', () => {
    const sessions = [
      createUnifiedSession({
        id: 's1',
        type: 'case',
        context: '2401010010000123',
        intent: 'Troubleshoot VM issue',
      }),
    ]
    mockUnifiedSessions.mockReturnValue({
      data: { sessions, total: 1 },
      isLoading: false,
    })

    renderWithProviders(<AgentMonitor />)
    expect(screen.getByText('2401010010000123')).toBeInTheDocument()
    expect(screen.getByText('Troubleshoot VM issue')).toBeInTheDocument()
  })

  it('shows track badge for implement sessions', () => {
    const sessions = [
      createUnifiedSession({
        id: 'impl-1',
        type: 'implement',
        context: 'ISS-044',
        intent: 'Implement track agent-session-view_20260321',
        metadata: { trackId: 'agent-session-view_20260321' },
      }),
    ]
    mockUnifiedSessions.mockReturnValue({
      data: { sessions, total: 1 },
      isLoading: false,
    })

    renderWithProviders(<AgentMonitor />)
    expect(screen.getByText('agent-session-view_20260321')).toBeInTheDocument()
  })

  it('shows awaiting input badge for track-creation with pending question', () => {
    const sessions = [
      createUnifiedSession({
        id: 'track-1',
        type: 'track-creation',
        context: 'ISS-045',
        metadata: { hasPendingQuestion: true },
      }),
    ]
    mockUnifiedSessions.mockReturnValue({
      data: { sessions, total: 1 },
      isLoading: false,
    })

    renderWithProviders(<AgentMonitor />)
    expect(screen.getByText(/Awaiting input/)).toBeInTheDocument()
  })

  it('toggles filter panel visibility', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AgentMonitor />)

    // Filter panel should not be visible initially
    expect(screen.queryByText('Type:')).not.toBeInTheDocument()

    // Click filter button
    await user.click(screen.getByText('Filter'))

    // Filter panel should now be visible
    expect(screen.getByText('Type:')).toBeInTheDocument()
    expect(screen.getByText('Status:')).toBeInTheDocument()
  })

  it('shows cron jobs section', () => {
    mockCronJobs.mockReturnValue({
      data: {
        jobs: [
          {
            id: 'cron-1',
            agentId: 'main',
            name: 'Daily Patrol',
            enabled: true,
            schedule: { kind: 'cron', expr: '0 9 * * *' },
          },
        ],
      },
      isLoading: false,
    })

    renderWithProviders(<AgentMonitor />)
    expect(screen.getByText('Daily Patrol')).toBeInTheDocument()
    expect(screen.getByText('Enabled')).toBeInTheDocument()
  })

  it('shows empty state for cron jobs when none exist', () => {
    renderWithProviders(<AgentMonitor />)
    expect(screen.getByText('No cron jobs')).toBeInTheDocument()
  })

  it('does not render agent grid when no agents', () => {
    renderWithProviders(<AgentMonitor />)
    expect(screen.queryByText('Agents')).not.toBeInTheDocument()
  })

  it('renders agent grid when agents exist', () => {
    mockAgents.mockReturnValue({
      data: {
        agents: [
          { id: 'agent-1', name: 'Main Agent', model: 'claude-sonnet-4-20250514' },
        ],
      },
      isLoading: false,
    })

    renderWithProviders(<AgentMonitor />)
    expect(screen.getByText('Main Agent')).toBeInTheDocument()
  })

  it('separates completed sessions into collapsed group', () => {
    const sessions = [
      createUnifiedSession({ id: 's1', type: 'case', status: 'active', context: 'CASE-001' }),
      createUnifiedSession({ id: 's2', type: 'case', status: 'completed', context: 'CASE-002' }),
      createUnifiedSession({ id: 's3', type: 'implement', status: 'completed', context: 'ISS-001' }),
    ]
    mockUnifiedSessions.mockReturnValue({
      data: { sessions, total: 3 },
      isLoading: false,
    })

    renderWithProviders(<AgentMonitor />)

    // Active case should be in main view
    expect(screen.getByText('CASE-001')).toBeInTheDocument()

    // Completed sessions group header should exist
    expect(screen.getByText(/Completed Sessions/)).toBeInTheDocument()

    // Completed sessions should show count badge
    expect(screen.getByText('2')).toBeInTheDocument()

    // Completed session content should NOT be visible (collapsed by default)
    expect(screen.queryByText('CASE-002')).not.toBeInTheDocument()
  })

  it('expands completed sessions group on click', async () => {
    const user = userEvent.setup()
    const sessions = [
      createUnifiedSession({ id: 's1', type: 'case', status: 'completed', context: 'CASE-DONE' }),
    ]
    mockUnifiedSessions.mockReturnValue({
      data: { sessions, total: 1 },
      isLoading: false,
    })

    renderWithProviders(<AgentMonitor />)

    // Should be collapsed initially
    expect(screen.queryByText('CASE-DONE')).not.toBeInTheDocument()

    // Click to expand
    await user.click(screen.getByText(/Completed Sessions/))

    // Should now show the completed session
    expect(screen.getByText('CASE-DONE')).toBeInTheDocument()
  })

  it('clicking a session row expands detail panel', async () => {
    const user = userEvent.setup()
    const sessions = [
      createUnifiedSession({ id: 's1', type: 'implement', status: 'active', context: 'ISS-010', intent: 'Implement feature' }),
    ]
    mockUnifiedSessions.mockReturnValue({
      data: { sessions, total: 1 },
      isLoading: false,
    })

    renderWithProviders(<AgentMonitor />)

    // Session should be visible
    expect(screen.getByText('ISS-010')).toBeInTheDocument()

    // Click the session row to expand
    await user.click(screen.getByText('ISS-010'))

    // Detail panel should appear (implement session shows message panel)
    expect(screen.getByText('Waiting for messages...')).toBeInTheDocument()
  })

  it('shows chat input and stop button for expanded active case sessions', async () => {
    const user = userEvent.setup()
    const sessions = [
      createUnifiedSession({ id: 's1', type: 'case', status: 'active', context: 'CASE-ACTIVE' }),
    ]
    mockUnifiedSessions.mockReturnValue({
      data: { sessions, total: 1 },
      isLoading: false,
    })

    renderWithProviders(<AgentMonitor />)

    // Click to expand
    await user.click(screen.getByText('CASE-ACTIVE'))

    // Chat input and stop button should be visible
    expect(screen.getByPlaceholderText('Send message to session...')).toBeInTheDocument()
    // Multiple Stop buttons: inline row button + detail panel button
    const stopButtons = screen.getAllByText('Stop')
    expect(stopButtons.length).toBeGreaterThanOrEqual(1)
  })
})

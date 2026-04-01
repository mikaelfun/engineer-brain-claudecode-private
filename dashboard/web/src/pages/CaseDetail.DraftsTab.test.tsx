/**
 * CaseDetail DraftsTab tests
 *
 * Tests draft collapse behavior: latest expanded, historical collapsed,
 * expand/collapse toggle, copy button, and Historical badge.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, screen, userEvent } from '../test-utils'

// Mock all API hooks used by CaseDetail
const mockDrafts = [
  {
    filename: 'follow-up-20260331.md',
    content: '# Follow Up\n\nDear customer, here is the update.',
    createdAt: '2026-03-31T08:00:00Z',
  },
  {
    filename: 'initial-response-20260330.md',
    content: '# Initial Response\n\nThank you for contacting us.',
    createdAt: '2026-03-30T10:00:00Z',
  },
  {
    filename: 'closure-20260329.md',
    content: '# Closure\n\nWe are closing this case.',
    createdAt: '2026-03-29T12:00:00Z',
  },
]

const mockCaseDetail = vi.fn()
const mockCaseEmails = vi.fn()
const mockCaseNotes = vi.fn()
const mockCaseTeams = vi.fn()
const mockCaseMeta = vi.fn()
const mockCaseAnalysis = vi.fn()
const mockCaseDrafts = vi.fn()
const mockCaseInspection = vi.fn()
const mockCaseTodo = vi.fn()
const mockCaseTodoFile = vi.fn()
const mockCaseTiming = vi.fn()
const mockCaseLogs = vi.fn()
const mockCaseAttachments = vi.fn()
const mockToggleCaseTodo = vi.fn()

vi.mock('../api/hooks', () => ({
  useCaseDetail: () => mockCaseDetail(),
  useCaseEmails: () => mockCaseEmails(),
  useCaseNotes: () => mockCaseNotes(),
  useCaseTeams: () => mockCaseTeams(),
  useCaseMeta: () => mockCaseMeta(),
  useCaseAnalysis: () => mockCaseAnalysis(),
  useCaseDrafts: () => mockCaseDrafts(),
  useCaseInspection: () => mockCaseInspection(),
  useCaseTodo: () => mockCaseTodo(),
  useCaseTodoFile: () => mockCaseTodoFile(),
  useCaseTiming: () => mockCaseTiming(),
  useCaseLogs: () => mockCaseLogs(),
  useCaseAttachments: () => mockCaseAttachments(),
  useToggleCaseTodo: () => mockToggleCaseTodo(),
}))

// Mock react-router
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: () => ({ id: '12345678' }),
    useNavigate: () => vi.fn(),
  }
})

// Mock CaseAIPanel to avoid heavy deps
vi.mock('../components/CaseAIPanel', () => ({
  default: () => <div data-testid="mock-ai-panel" />,
}))

function setupDefaultMocks() {
  mockCaseDetail.mockReturnValue({
    data: {
      caseNumber: '12345678',
      title: 'Test Case',
      severity: 'B',
      status: 'Active',
      product: 'Azure VM',
      customerName: 'Test Corp',
    },
    isLoading: false,
    error: null,
  })
  mockCaseEmails.mockReturnValue({ data: { emails: [], total: 0 } })
  mockCaseNotes.mockReturnValue({ data: { notes: [], total: 0 } })
  mockCaseTeams.mockReturnValue({ data: { messages: [], total: 0 } })
  mockCaseMeta.mockReturnValue({ data: null })
  mockCaseAnalysis.mockReturnValue({ data: { exists: false } })
  mockCaseDrafts.mockReturnValue({ data: { drafts: mockDrafts, total: mockDrafts.length } })
  mockCaseInspection.mockReturnValue({ data: { exists: false } })
  mockCaseTodo.mockReturnValue({ data: { latest: null, files: [] } })
  mockCaseTodoFile.mockReturnValue({ data: null, isLoading: false })
  mockCaseTiming.mockReturnValue({ data: null })
  mockCaseLogs.mockReturnValue({ data: { logs: [], total: 0 } })
  mockCaseAttachments.mockReturnValue({ data: { attachments: [], total: 0 } })
  mockToggleCaseTodo.mockReturnValue({ mutate: vi.fn() })
}

import CaseDetail from './CaseDetail'

describe('CaseDetail DraftsTab', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupDefaultMocks()
  })

  it('shows latest draft expanded and historical drafts collapsed', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CaseDetail />, { route: '/case/12345678' })

    // Click the Drafts tab
    const draftsTab = screen.getByText('Drafts')
    await user.click(draftsTab)

    // Latest draft content should be visible (expanded)
    expect(screen.getByText(/Follow Up/)).toBeInTheDocument()
    expect(screen.getByText(/Dear customer/)).toBeInTheDocument()

    // Historical draft filenames visible but content hidden
    expect(screen.getByText('initial-response-20260330.md')).toBeInTheDocument()
    expect(screen.getByText('closure-20260329.md')).toBeInTheDocument()
    expect(screen.queryByText(/Thank you for contacting us/)).not.toBeInTheDocument()
    expect(screen.queryByText(/We are closing this case/)).not.toBeInTheDocument()
  })

  it('shows Historical badge on non-latest drafts', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CaseDetail />, { route: '/case/12345678' })

    const draftsTab = screen.getByText('Drafts')
    await user.click(draftsTab)

    // Should have Historical badges for the 2 older drafts
    const badges = screen.getAllByText('Historical')
    expect(badges.length).toBe(2)
  })

  it('expands collapsed draft on click', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CaseDetail />, { route: '/case/12345678' })

    const draftsTab = screen.getByText('Drafts')
    await user.click(draftsTab)

    // Historical draft content should be hidden initially
    expect(screen.queryByText(/Thank you for contacting us/)).not.toBeInTheDocument()

    // Click on the historical draft header to expand
    const historicalHeader = screen.getByText('initial-response-20260330.md')
    await user.click(historicalHeader)

    // Now the content should be visible
    expect(screen.getByText(/Thank you for contacting us/)).toBeInTheDocument()
  })

  it('collapses expanded draft on click', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CaseDetail />, { route: '/case/12345678' })

    const draftsTab = screen.getByText('Drafts')
    await user.click(draftsTab)

    // Latest draft content should be visible
    expect(screen.getByText(/Dear customer/)).toBeInTheDocument()

    // Click on the latest draft header to collapse it
    const latestHeader = screen.getByText('follow-up-20260331.md')
    await user.click(latestHeader)

    // Content should now be hidden
    expect(screen.queryByText(/Dear customer/)).not.toBeInTheDocument()
  })

  it('shows empty state when no drafts', async () => {
    mockCaseDrafts.mockReturnValue({ data: { drafts: [], total: 0 } })
    const user = userEvent.setup()
    renderWithProviders(<CaseDetail />, { route: '/case/12345678' })

    const draftsTab = screen.getByText('Drafts')
    await user.click(draftsTab)

    expect(screen.getByText('No drafts')).toBeInTheDocument()
  })

  it('single draft is expanded without Historical badge', async () => {
    mockCaseDrafts.mockReturnValue({
      data: { drafts: [mockDrafts[0]], total: 1 },
    })
    const user = userEvent.setup()
    renderWithProviders(<CaseDetail />, { route: '/case/12345678' })

    const draftsTab = screen.getByText('Drafts')
    await user.click(draftsTab)

    // Single draft content should be visible
    expect(screen.getByText(/Dear customer/)).toBeInTheDocument()
    // No Historical badge
    expect(screen.queryByText('Historical')).not.toBeInTheDocument()
  })
})

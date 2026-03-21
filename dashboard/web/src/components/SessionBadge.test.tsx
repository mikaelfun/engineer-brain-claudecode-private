/**
 * SessionBadge component tests
 *
 * Tests different session status rendering: active, paused, completed, failed
 * Uses test-utils render helper and mock factories
 */
import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen } from '../test-utils'
import { SessionBadge } from './SessionBadge'

describe('SessionBadge', () => {
  it('renders Active label for active status', () => {
    renderWithProviders(<SessionBadge status="active" />)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('renders Paused label for paused status', () => {
    renderWithProviders(<SessionBadge status="paused" />)
    expect(screen.getByText('Paused')).toBeInTheDocument()
  })

  it('renders Ended label for completed status', () => {
    renderWithProviders(<SessionBadge status="completed" />)
    expect(screen.getByText('Ended')).toBeInTheDocument()
  })

  it('renders Failed label for failed status', () => {
    renderWithProviders(<SessionBadge status="failed" />)
    expect(screen.getByText('Failed')).toBeInTheDocument()
  })

  it('shows truncated sessionId when not compact', () => {
    const sessionId = 'abcdef12-3456-7890-abcd-ef1234567890'
    renderWithProviders(<SessionBadge status="active" sessionId={sessionId} />)
    expect(screen.getByText('abcdef12')).toBeInTheDocument()
  })

  it('hides sessionId in compact mode', () => {
    const sessionId = 'abcdef12-3456-7890-abcd-ef1234567890'
    renderWithProviders(<SessionBadge status="active" sessionId={sessionId} compact />)
    expect(screen.queryByText('abcdef12')).not.toBeInTheDocument()
  })

  it('does not show sessionId when not provided', () => {
    renderWithProviders(<SessionBadge status="active" />)
    // Should only have the label text, no monospace span
    const badge = screen.getByText('Active').closest('span')
    const monoSpans = badge?.querySelectorAll('.font-mono')
    expect(monoSpans?.length ?? 0).toBe(0)
  })

  it('applies animate-pulse class only for active status', () => {
    const { container } = renderWithProviders(<SessionBadge status="active" />)
    const dot = container.querySelector('.animate-pulse')
    expect(dot).not.toBeNull()
  })

  it('does not apply animate-pulse for non-active status', () => {
    const { container } = renderWithProviders(<SessionBadge status="paused" />)
    const dot = container.querySelector('.animate-pulse')
    expect(dot).toBeNull()
  })

  it('falls back to completed config for unknown status', () => {
    // @ts-expect-error — testing unknown status fallback
    renderWithProviders(<SessionBadge status="unknown" />)
    expect(screen.getByText('Ended')).toBeInTheDocument()
  })
})

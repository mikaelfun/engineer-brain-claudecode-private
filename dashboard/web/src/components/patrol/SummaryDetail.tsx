/**
 * SummaryDetail — Summary step detail panel.
 * Shows summarize status and result text.
 */
import type { StepState } from '../../stores/patrolStore'

function formatDuration(ms: number): string {
  if (ms < 1000) return '<1s'
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  if (m > 0) return `${m}m ${s % 60}s`
  return `${s}s`
}

interface SummaryDetailProps {
  summarizeStep?: StepState
  durationMs?: number
}

export default function SummaryDetail({ summarizeStep, durationMs }: SummaryDetailProps) {
  if (!summarizeStep || summarizeStep.status === 'pending') return null

  const isActive = summarizeStep.status === 'active'

  return (
    <div style={{
      background: 'var(--bg-inset)', border: '1px solid var(--border-subtle)',
      borderRadius: 10, padding: '14px 16px',
      animation: 'detail-slide 0.2s ease-out',
    }}>
      <div style={{
        fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.6px', color: 'var(--text-tertiary)', marginBottom: 10,
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: isActive ? 'var(--accent-blue)' : 'var(--accent-green)' }} />
        Summary{durationMs !== undefined ? ` · ${formatDuration(durationMs)}` : ''}
      </div>

      {isActive ? (
        <div style={{ fontSize: 12, color: 'var(--accent-blue)', opacity: 0.7 }}>
          Generating todo…
        </div>
      ) : (
        <div style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--text-secondary)' }}>
          {summarizeStep.result || 'Todo updated'}
        </div>
      )}
    </div>
  )
}

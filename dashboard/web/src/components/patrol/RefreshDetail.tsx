/**
 * RefreshDetail — Subtask grid for Data Refresh step detail panel.
 * Shows D365, Teams, ICM, OneNote, Attachments with delta counts.
 */
import type { SubtaskState } from '../../stores/patrolStore'

const SUBTASK_ORDER = ['d365', 'teams', 'icm', 'onenote', 'attachments'] as const
const SUBTASK_LABELS: Record<string, string> = {
  d365: 'D365', teams: 'Teams', icm: 'ICM', onenote: 'OneNote', attachments: 'Attach',
}

function formatDelta(name: string, delta?: Record<string, number>): string | null {
  if (!delta) return null
  switch (name) {
    case 'd365': {
      const parts: string[] = []
      if (delta.newEmails) parts.push(`+${delta.newEmails} emails`)
      if (delta.newNotes) parts.push(`+${delta.newNotes} note`)
      return parts.join(' · ') || null
    }
    case 'teams': {
      const parts: string[] = []
      if (delta.newChats) parts.push(`${delta.newChats} chats`)
      if (delta.newMessages) parts.push(`${delta.newMessages} msgs`)
      return parts.join(' · ') || null
    }
    case 'icm': return delta.newEntries ? `+${delta.newEntries} disc` : null
    case 'onenote': {
      const pages = (delta.newPages || 0) + (delta.updatedPages || 0)
      return pages ? `${pages} pages` : null
    }
    case 'attachments': return delta.downloaded ? `+${delta.downloaded} file` : null
    default: return null
  }
}

function formatDurationShort(ms: number): string {
  if (ms < 1000) return '<1s'
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  if (m > 0) return `${m}m ${s % 60}s`
  return `${s}s`
}

interface RefreshDetailProps {
  subtasks?: Record<string, SubtaskState>
  durationMs?: number
}

export default function RefreshDetail({ subtasks, durationMs }: RefreshDetailProps) {
  return (
    <div style={{
      background: 'var(--bg-inset)', border: '1px solid var(--border-subtle)',
      borderRadius: 10, padding: '14px 16px',
      animation: 'detail-slide 0.2s ease-out',
    }}>
      <div style={{
        fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.6px', color: 'var(--text-tertiary)', marginBottom: 10,
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-green)' }} />
        Data Refresh{durationMs !== undefined ? ` · ${formatDurationShort(durationMs)}` : ''}
      </div>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8,
      }}>
        {SUBTASK_ORDER.map(name => {
          const sub = subtasks?.[name]
          if (!sub) return null
          const isSkipped = sub.status === 'skipped'
          const deltaText = formatDelta(name, sub.delta)
          return (
            <div key={name} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 10px', borderRadius: 8,
              background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                background: isSkipped ? 'var(--text-tertiary)' : 'var(--accent-green)',
                opacity: isSkipped ? 0.4 : 1,
              }} />
              <span style={{
                fontSize: 11, fontWeight: 600,
                color: isSkipped ? 'var(--text-tertiary)' : 'var(--accent-green)',
                opacity: isSkipped ? 0.6 : 1,
              }}>
                {SUBTASK_LABELS[name]}
              </span>
              <span style={{ fontSize: 9, color: 'var(--text-tertiary)', marginLeft: 'auto', whiteSpace: 'nowrap', opacity: isSkipped ? 0.5 : 1 }}>
                {isSkipped ? 'skipped' : (deltaText || 'no new')}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

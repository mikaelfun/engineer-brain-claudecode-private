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
  // Derive header status from subtasks
  const allSubs = subtasks ? Object.values(subtasks) : []
  const hasActive = allSubs.some(s => s.status === 'active')
  const allDone = allSubs.length > 0 && allSubs.every(s => s.status === 'completed' || s.status === 'skipped')
  const headerDotColor = allDone ? 'var(--accent-green)' : hasActive ? 'var(--accent-blue)' : 'var(--text-tertiary)'

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
        <div style={{
          width: 6, height: 6, borderRadius: '50%', background: headerDotColor,
          ...(hasActive ? { animation: 'sidebar-pulse 2s ease-in-out infinite' } : {}),
        }} />
        Data Refresh{durationMs !== undefined ? ` · ${formatDurationShort(durationMs)}` : ''}
      </div>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8,
      }}>
        {SUBTASK_ORDER.map(name => {
          // Teams: merge teams-search + teams-write into one card
          const isTeams = name === 'teams'
          const sub = isTeams
            ? (subtasks?.['teams-search'] || subtasks?.['teams'])
            : subtasks?.[name]
          if (!sub) return null
          const isDone = sub.status === 'completed'
          const isActive = sub.status === 'active'
          const isSkipped = sub.status === 'skipped'
          const isFailed = sub.status === 'failed'
          const isPending = !isDone && !isActive && !isSkipped && !isFailed
          const deltaText = formatDelta(name, sub.delta)
          const searchMs = isTeams ? (subtasks?.['teams-search']?.durationMs) : sub.durationMs
          const writeMs = isTeams ? (subtasks?.['teams-write']?.durationMs) : undefined
          const durText = searchMs !== undefined ? formatDurationShort(searchMs) : null

          // Status-aware colors
          const dotColor = isDone ? 'var(--accent-green)'
            : isActive ? 'var(--accent-blue)'
            : isFailed ? 'var(--accent-red)'
            : 'var(--text-tertiary)'
          const labelColor = isDone ? 'var(--accent-green)'
            : isActive ? 'var(--accent-blue)'
            : isFailed ? 'var(--accent-red)'
            : 'var(--text-tertiary)'
          const dotOpacity = isSkipped || isPending ? 0.4 : 1
          const labelOpacity = isSkipped ? 0.6 : isPending ? 0.5 : 1

          return (
            <div key={name} style={{
              padding: '8px 12px', borderRadius: 8,
              background: isActive ? 'rgba(106,95,193,0.04)' : 'var(--bg-surface)',
              border: `1px solid ${isActive ? 'rgba(106,95,193,0.22)' : 'var(--border-subtle)'}`,
            }}>
              {/* Row 1: dot + label + duration */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                  background: dotColor, opacity: dotOpacity,
                  ...(isActive ? { animation: 'sidebar-pulse 2s ease-in-out infinite' } : {}),
                }} />
                <span style={{
                  fontSize: 12, fontWeight: 700,
                  color: labelColor, opacity: labelOpacity,
                }}>
                  {SUBTASK_LABELS[name]}
                </span>
                {durText && (
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)', marginLeft: 'auto' }}>
                    {isTeams && writeMs !== undefined
                      ? `${durText} + ${formatDurationShort(writeMs)}`
                      : durText}
                  </span>
                )}
              </div>
              {/* Row 2: delta or status */}
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', paddingLeft: 12, opacity: isSkipped || isPending ? 0.5 : 0.8 }}>
                {isSkipped ? 'skipped'
                  : isActive ? 'running…'
                  : isPending ? 'waiting'
                  : isFailed ? 'failed'
                  : (deltaText || 'no new')}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

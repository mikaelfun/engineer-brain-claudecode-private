/**
 * SessionBadge — Case SDK session 状态指示器 (design system v2)
 */

interface SessionBadgeProps {
  status: 'active' | 'paused' | 'completed' | 'failed'
  sessionId?: string
  compact?: boolean
}

const statusConfig: Record<string, { dotColor: string; textColor: string; bg: string; label: string; animate?: boolean }> = {
  active: {
    dotColor: 'var(--accent-green)',
    textColor: 'var(--accent-green)',
    bg: 'var(--accent-green-dim)',
    label: 'Active',
    animate: true,
  },
  paused: {
    dotColor: 'var(--accent-amber)',
    textColor: 'var(--accent-amber)',
    bg: 'var(--accent-amber-dim)',
    label: 'Paused',
  },
  completed: {
    dotColor: 'var(--text-tertiary)',
    textColor: 'var(--text-tertiary)',
    bg: 'var(--bg-inset)',
    label: 'Ended',
  },
  failed: {
    dotColor: 'var(--accent-red)',
    textColor: 'var(--accent-red)',
    bg: 'var(--accent-red-dim)',
    label: 'Failed',
  },
}

export function SessionBadge({ status, sessionId, compact }: SessionBadgeProps) {
  const config = statusConfig[status] || statusConfig.completed

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: config.bg, color: config.textColor }}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${config.animate ? 'animate-pulse' : ''}`}
        style={{ background: config.dotColor }}
      />
      {config.label}
      {!compact && sessionId && (
        <span className="font-mono text-[10px] opacity-60">
          {sessionId.slice(0, 8)}
        </span>
      )}
    </span>
  )
}

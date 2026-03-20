/**
 * SessionBadge — Case SDK session 状态指示器
 */

interface SessionBadgeProps {
  status: 'active' | 'paused' | 'completed' | 'failed'
  sessionId?: string
  compact?: boolean
}

const statusConfig = {
  active: {
    dot: 'bg-green-500 animate-pulse',
    text: 'text-green-700',
    bg: 'bg-green-50',
    label: 'Active',
  },
  paused: {
    dot: 'bg-yellow-500',
    text: 'text-yellow-700',
    bg: 'bg-yellow-50',
    label: 'Paused',
  },
  completed: {
    dot: 'bg-gray-400',
    text: 'text-gray-500',
    bg: 'bg-gray-50',
    label: 'Ended',
  },
  failed: {
    dot: 'bg-red-500',
    text: 'text-red-700',
    bg: 'bg-red-50',
    label: 'Failed',
  },
}

export function SessionBadge({ status, sessionId, compact }: SessionBadgeProps) {
  const config = statusConfig[status] || statusConfig.completed

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
      {!compact && sessionId && (
        <span className="font-mono text-[10px] opacity-60">
          {sessionId.slice(0, 8)}
        </span>
      )}
    </span>
  )
}

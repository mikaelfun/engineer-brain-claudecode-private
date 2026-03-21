/**
 * ImplementPanel — Real-time progress display for issue implementation
 *
 * Shows live agent activity during conductor:implement execution.
 * Supports page-refresh recovery via useImplementStatus hook.
 * CSS variables for dark/light theme support.
 */
import { useEffect, useRef } from 'react'
import { Loader2, Wrench, Brain, CheckCircle2, AlertCircle, Rocket, Play } from 'lucide-react'
import { useImplementStore, type ImplementMessage } from '../stores/implementStore'
import { useImplementStatus } from '../api/hooks'

interface ImplementPanelProps {
  issueId: string
  trackId: string
}

export default function ImplementPanel({ issueId, trackId }: ImplementPanelProps) {
  const session = useImplementStore((s) => s.sessions[issueId])
  const loadSession = useImplementStore((s) => s.loadSession)
  const scrollRef = useRef<HTMLDivElement>(null)
  const hasRecoveredRef = useRef(false)

  // Recovery: fetch from backend when in-progress but no local session data
  const needsRecovery = !session && !hasRecoveredRef.current
  const { data: recoveredData } = useImplementStatus(issueId, needsRecovery)

  useEffect(() => {
    if (recoveredData && recoveredData.status !== 'none' && !session && !hasRecoveredRef.current) {
      hasRecoveredRef.current = true
      loadSession(issueId, {
        status: recoveredData.status as 'active' | 'completed' | 'failed',
        trackId: recoveredData.trackId || trackId,
        messages: recoveredData.messages as ImplementMessage[],
        startedAt: recoveredData.startedAt || new Date().toISOString(),
      })
    }
  }, [recoveredData, session, issueId, trackId, loadSession])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [session?.messages.length])

  if (!session) return null

  const { status, messages } = session
  const isActive = status === 'active'
  const isCompleted = status === 'completed'
  const isFailed = status === 'failed'

  return (
    <div className="px-4 py-3" style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-inset)' }}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        {isActive ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: 'var(--accent-blue)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--accent-blue)' }}>Implementing...</span>
          </>
        ) : isCompleted ? (
          <>
            <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--accent-green)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--accent-green)' }}>Implementation Complete</span>
          </>
        ) : isFailed ? (
          <>
            <AlertCircle className="w-3.5 h-3.5" style={{ color: 'var(--accent-red)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--accent-red)' }}>Implementation Failed</span>
          </>
        ) : (
          <>
            <Play className="w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Implementation Progress</span>
          </>
        )}
        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>({trackId})</span>
      </div>

      {/* Message stream */}
      <div ref={scrollRef} className="max-h-48 overflow-y-auto space-y-1 text-xs">
        {messages.map((msg, i) => (
          <ImplementMessageRow key={i} msg={msg} />
        ))}
        {/* Show spinner at bottom if still active */}
        {isActive && messages.length > 0 && (
          <div className="flex items-center gap-1.5 py-0.5" style={{ color: 'var(--text-tertiary)' }}>
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Processing...</span>
          </div>
        )}
      </div>
    </div>
  )
}

/** Single message row with icon */
function ImplementMessageRow({ msg }: { msg: ImplementMessage }) {
  switch (msg.type) {
    case 'started':
      return (
        <div className="flex items-center gap-1.5 py-0.5" style={{ color: 'var(--accent-blue)' }}>
          <Rocket className="w-3 h-3 shrink-0" />
          <span>{msg.content || 'Implementation started'}</span>
        </div>
      )
    case 'thinking':
      return (
        <div className="flex items-start gap-1.5 py-0.5" style={{ color: 'var(--text-secondary)' }}>
          <Brain className="w-3 h-3 shrink-0 mt-0.5" />
          <span className="line-clamp-2">{msg.content}</span>
        </div>
      )
    case 'tool-call':
      return (
        <div className="flex items-center gap-1.5 py-0.5" style={{ color: 'var(--accent-purple)' }}>
          <Wrench className="w-3 h-3 shrink-0" />
          <span>Tool: {msg.toolName || msg.content}</span>
        </div>
      )
    case 'tool-result':
      return (
        <div className="flex items-start gap-1.5 py-0.5" style={{ color: 'var(--text-tertiary)' }}>
          <CheckCircle2 className="w-3 h-3 shrink-0 mt-0.5" />
          <span className="line-clamp-1">{msg.content}</span>
        </div>
      )
    case 'completed':
      return (
        <div className="flex items-center gap-1.5 py-0.5 font-medium" style={{ color: 'var(--accent-green)' }}>
          <CheckCircle2 className="w-3 h-3 shrink-0" />
          <span>{msg.content || 'Implementation completed'}</span>
        </div>
      )
    case 'failed':
      return (
        <div className="flex items-center gap-1.5 py-0.5" style={{ color: 'var(--accent-red)' }}>
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>Error: {msg.content}</span>
        </div>
      )
    default:
      return null
  }
}

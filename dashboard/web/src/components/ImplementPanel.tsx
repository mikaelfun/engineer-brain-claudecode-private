/**
 * ImplementPanel — Real-time progress display for issue implementation
 *
 * Shows live agent activity during conductor:implement execution.
 * Uses issueTrackStore for state (unified with track creation + verify).
 * Message grouping: consecutive tool-call → collapsed expandable group,
 * consecutive thinking → show only last message.
 * CSS variables for dark/light theme support.
 */
import { useState, useEffect, useRef, useMemo } from 'react'
import { Loader2, Wrench, Brain, CheckCircle2, AlertCircle, Rocket, ChevronDown, ChevronRight, Play } from 'lucide-react'
import { useIssueTrackStore, EMPTY_IMPLEMENT_MESSAGES, type ImplementMessage } from '../stores/issueTrackStore'
import { useImplementStatus } from '../api/hooks'

interface ImplementPanelProps {
  issueId: string
  trackId: string
}

// ---- Message grouping types (mirrors TrackProgressPanel pattern) ----

interface ImplementDisplayMessage {
  kind: 'single' | 'collapsed-tools' | 'collapsed-thinking'
  messages: ImplementMessage[]
  toolNames: string[]
  timestamp: string
}

/** Merge consecutive tool-call and thinking messages into collapsed groups */
function processImplementMessages(messages: ImplementMessage[]): ImplementDisplayMessage[] {
  if (!messages.length) return []
  const result: ImplementDisplayMessage[] = []
  let i = 0
  while (i < messages.length) {
    const msg = messages[i]
    // Consecutive tool-call → collapsed-tools
    if (msg.kind === 'tool-call') {
      const group: ImplementMessage[] = []
      const names: string[] = []
      while (i < messages.length && messages[i].kind === 'tool-call') {
        group.push(messages[i])
        const name = messages[i].toolName || 'unknown'
        if (!names.includes(name)) names.push(name)
        i++
      }
      if (group.length === 1) {
        result.push({ kind: 'single', messages: [group[0]], toolNames: [], timestamp: group[0].timestamp })
      } else {
        result.push({ kind: 'collapsed-tools', messages: group, toolNames: names, timestamp: group[group.length - 1].timestamp })
      }
      continue
    }
    // Consecutive thinking → collapsed-thinking (show only last)
    if (msg.kind === 'thinking') {
      const group: ImplementMessage[] = []
      while (i < messages.length && messages[i].kind === 'thinking') {
        group.push(messages[i])
        i++
      }
      if (group.length === 1) {
        result.push({ kind: 'single', messages: [group[0]], toolNames: [], timestamp: group[0].timestamp })
      } else {
        result.push({ kind: 'collapsed-thinking', messages: group, toolNames: [], timestamp: group[group.length - 1].timestamp })
      }
      continue
    }
    // Everything else (started, completed, failed, tool-result) → single
    result.push({ kind: 'single', messages: [msg], toolNames: [], timestamp: msg.timestamp })
    i++
  }
  return result
}

export default function ImplementPanel({ issueId, trackId }: ImplementPanelProps) {
  const messages = useIssueTrackStore((s) => s.implementMessages[issueId] ?? EMPTY_IMPLEMENT_MESSAGES)
  const status = useIssueTrackStore((s) => s.implementStatus[issueId])
  const storedTrackId = useIssueTrackStore((s) => s.implementTrackId[issueId])
  const loadImplementMessages = useIssueTrackStore((s) => s.loadImplementMessages)
  const scrollRef = useRef<HTMLDivElement>(null)
  const hasRecoveredRef = useRef(false)

  const displayTrackId = storedTrackId || trackId

  // Recovery: fetch from backend when in-progress but no local session data
  const needsRecovery = messages.length === 0 && !hasRecoveredRef.current
  const { data: recoveredData } = useImplementStatus(issueId, needsRecovery)

  useEffect(() => {
    if (recoveredData && recoveredData.status !== 'none' && messages.length === 0 && !hasRecoveredRef.current) {
      hasRecoveredRef.current = true
      // Map recovered messages (backend uses 'type' field) to ImplementMessage (uses 'kind' field)
      const mappedMsgs: ImplementMessage[] = (recoveredData.messages || []).map((m) => ({
        kind: m.type as ImplementMessage['kind'],
        content: m.content,
        toolName: m.toolName,
        timestamp: m.timestamp,
      }))
      loadImplementMessages(
        issueId,
        mappedMsgs,
        recoveredData.status as 'active' | 'completed' | 'failed',
        recoveredData.trackId || trackId,
      )
    }
  }, [recoveredData, messages.length, issueId, trackId, loadImplementMessages])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages.length])

  if (!status && messages.length === 0) return null

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
        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>({displayTrackId})</span>
      </div>

      {/* Message stream — with grouping */}
      <div ref={scrollRef} className="max-h-48 overflow-y-auto space-y-1 text-xs">
        <ProcessedImplementList messages={messages} />
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

/** Renders processed (collapsed) implement message list */
function ProcessedImplementList({ messages }: { messages: ImplementMessage[] }) {
  const processed = useMemo(() => processImplementMessages(messages), [messages])
  return (
    <>
      {processed.map((item, i) => {
        if (item.kind === 'collapsed-tools') return <CollapsedToolGroup key={i} group={item} />
        if (item.kind === 'collapsed-thinking') return <CollapsedThinkingGroup key={i} group={item} />
        return <ImplementMessageRow key={i} msg={item.messages[0]} />
      })}
    </>
  )
}

/** Collapsed tool group — compact one-line with expand/collapse */
function CollapsedToolGroup({ group }: { group: ImplementDisplayMessage }) {
  const [expanded, setExpanded] = useState(false)
  const label = group.toolNames.slice(0, 3).join(', ') + (group.toolNames.length > 3 ? '...' : '')
  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 py-0.5 w-full text-left"
        style={{ color: 'var(--accent-purple)' }}
      >
        {expanded ? <ChevronDown className="w-3 h-3 shrink-0" /> : <ChevronRight className="w-3 h-3 shrink-0" />}
        <Wrench className="w-3 h-3 shrink-0" />
        <span>{label} ({group.messages.length} tools)</span>
      </button>
      {expanded && (
        <div className="ml-5 space-y-0.5" style={{ borderLeft: '2px solid var(--accent-purple-dim, var(--border-subtle))' }}>
          {group.messages.map((m, j) => (
            <div key={j} className="flex items-center gap-1.5 py-0.5 pl-2" style={{ color: 'var(--text-tertiary)' }}>
              <Wrench className="w-2.5 h-2.5 shrink-0" />
              <span>Tool: {m.toolName}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/** Collapsed thinking group — shows only last thinking message */
function CollapsedThinkingGroup({ group }: { group: ImplementDisplayMessage }) {
  const last = group.messages[group.messages.length - 1]
  return (
    <div className="flex items-start gap-1.5 py-0.5" style={{ color: 'var(--text-secondary)' }}>
      <Brain className="w-3 h-3 shrink-0 mt-0.5" />
      <span className="line-clamp-2">{last.content}</span>
    </div>
  )
}

/** Single message row with icon */
function ImplementMessageRow({ msg }: { msg: ImplementMessage }) {
  switch (msg.kind) {
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

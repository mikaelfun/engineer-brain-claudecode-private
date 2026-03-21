/**
 * SessionMessageList — Shared message display components
 *
 * Extracted from CaseAIPanel.tsx for reuse in AgentMonitor SessionDetailPanel.
 * Processes raw SSE messages into display-friendly groups (collapsed tools,
 * collapsed thinking) and renders them with expand/collapse support.
 */
import { useState, useMemo } from 'react'
import {
  Sparkles, Send, CheckCircle2, Loader2, Wrench, Brain,
  AlertCircle, ChevronRight
} from 'lucide-react'
import type { CaseSessionMessage } from '../../stores/caseSessionStore'

// ============================================================
// Message processing — collapse verbose tool/thinking streams
// ============================================================

/** Types that are always shown individually (never collapsed) */
const ALWAYS_SHOW: Set<string> = new Set(['system', 'completed', 'failed', 'user'])

/** Collapsible verbose types */
const TOOL_TYPES: Set<string> = new Set(['tool-call', 'tool-result'])

export interface DisplayMessage {
  kind: 'single' | 'collapsed-tools' | 'collapsed-thinking'
  /** Original messages in this group */
  messages: CaseSessionMessage[]
  /** Unique tool names in this group */
  toolNames: string[]
  /** Last step tag seen */
  step?: string
  /** Timestamp of last message */
  timestamp: string
}

/**
 * Process raw SSE messages into display-friendly groups.
 * - Consecutive tool-call/tool-result -> single collapsed-tools item
 * - Consecutive thinking -> single collapsed-thinking item (latest text)
 * - system/completed/failed/user -> always shown as single items
 * - Empty-content system messages are filtered out (ISS-059)
 */
export function processMessages(messages: CaseSessionMessage[]): DisplayMessage[] {
  if (messages.length === 0) return []

  // ISS-059: Filter out messages with empty/whitespace-only content
  // Exception: tool-call/tool-result may have empty content but meaningful toolName — keep them
  // Historical data may have raw SDK types (assistant, user) with empty content
  const filtered = messages.filter(msg => {
    if (msg.content && msg.content.trim().length > 0) return true
    // Keep tool messages even with empty content (they show toolName)
    if (TOOL_TYPES.has(msg.type) || msg.type === 'tool_use' || msg.type === 'tool_result') return true
    return false
  })

  if (filtered.length === 0) return []

  const result: DisplayMessage[] = []
  let i = 0

  while (i < filtered.length) {
    const msg = filtered[i]

    // Always-show types: emit as single
    if (ALWAYS_SHOW.has(msg.type)) {
      result.push({
        kind: 'single',
        messages: [msg],
        toolNames: [],
        step: msg.step,
        timestamp: msg.timestamp,
      })
      i++
      continue
    }

    // Tool types: merge consecutive run
    if (TOOL_TYPES.has(msg.type)) {
      const group: CaseSessionMessage[] = []
      const toolNameSet = new Set<string>()
      let lastStep = msg.step
      let lastTimestamp = msg.timestamp

      while (i < filtered.length && TOOL_TYPES.has(filtered[i].type)) {
        const m = filtered[i]
        group.push(m)
        if (m.toolName) toolNameSet.add(m.toolName)
        if (m.step) lastStep = m.step
        lastTimestamp = m.timestamp
        i++
      }

      result.push({
        kind: 'collapsed-tools',
        messages: group,
        toolNames: Array.from(toolNameSet),
        step: lastStep,
        timestamp: lastTimestamp,
      })
      continue
    }

    // Thinking: merge consecutive run, keep last content
    if (msg.type === 'thinking') {
      const group: CaseSessionMessage[] = []
      let lastStep = msg.step
      let lastTimestamp = msg.timestamp

      while (i < filtered.length && filtered[i].type === 'thinking') {
        const m = filtered[i]
        group.push(m)
        if (m.step) lastStep = m.step
        lastTimestamp = m.timestamp
        i++
      }

      result.push({
        kind: 'collapsed-thinking',
        messages: group,
        toolNames: [],
        step: lastStep,
        timestamp: lastTimestamp,
      })
      continue
    }

    // Fallback: show as single
    result.push({
      kind: 'single',
      messages: [msg],
      toolNames: [],
      step: msg.step,
      timestamp: msg.timestamp,
    })
    i++
  }

  return result
}

// ============================================================
// Rendered message list with collapse/expand support
// ============================================================

export interface SessionMessageListProps {
  messages: CaseSessionMessage[]
  /** Optional ref for the scrollable container */
  containerRef?: React.RefObject<HTMLDivElement | null>
  /** Max height CSS class. Defaults to 'max-h-48' */
  maxHeightClass?: string
}

export function SessionMessageList({
  messages,
  containerRef,
  maxHeightClass = 'max-h-48',
}: SessionMessageListProps) {
  const displayMessages = useMemo(() => processMessages(messages), [messages])

  return (
    <div ref={containerRef as React.LegacyRef<HTMLDivElement>} className={`${maxHeightClass} overflow-y-auto space-y-1`}>
      {displayMessages.map((dm, i) => {
        if (dm.kind === 'single') {
          return <MessageBubble key={i} message={dm.messages[0]} />
        }
        return <CollapsedGroup key={i} group={dm} />
      })}
    </div>
  )
}

/** Collapsed group — compact summary with expand toggle */
export function CollapsedGroup({ group }: { group: DisplayMessage }) {
  const [expanded, setExpanded] = useState(false)

  if (group.kind === 'collapsed-tools') {
    const toolCount = group.messages.filter(m => m.type === 'tool-call').length
    const toolLabel = group.toolNames.length <= 2
      ? group.toolNames.join(', ')
      : `${group.toolNames.slice(0, 2).join(', ')}…`

    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center gap-1.5 pl-2 py-1 text-left rounded-sm transition-colors"
          style={{ borderLeft: '2px solid var(--accent-amber)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
        >
          <Loader2 className="w-3 h-3 animate-spin flex-shrink-0" style={{ color: 'var(--accent-amber)' }} />
          <span className="text-[11px] font-medium truncate" style={{ color: 'var(--text-secondary)' }}>
            {toolLabel || 'Working'}
          </span>
          {toolCount > 1 && (
            <span className="text-[10px] font-mono flex-shrink-0" style={{ color: 'var(--text-tertiary)' }}>
              ({toolCount})
            </span>
          )}
          {group.step && (
            <span className="text-[10px] ml-auto font-mono flex-shrink-0" style={{ color: 'var(--text-tertiary)' }}>{group.step}</span>
          )}
          <ChevronRight
            className={`w-3 h-3 flex-shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`}
            style={{ color: 'var(--text-tertiary)' }}
          />
        </button>
        {expanded && (
          <div className="ml-3 mt-0.5 space-y-0.5">
            {group.messages.map((msg, j) => (
              <MessageBubble key={j} message={msg} compact />
            ))}
          </div>
        )}
      </div>
    )
  }

  // collapsed-thinking
  const lastThinking = group.messages[group.messages.length - 1]
  const preview = lastThinking.content.length > 60
    ? lastThinking.content.slice(0, 60) + '…'
    : lastThinking.content

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-1.5 pl-2 py-1 text-left rounded-sm transition-colors"
        style={{ borderLeft: '2px solid var(--accent-blue)' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
      >
        <Brain className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--accent-blue)' }} />
        <span className="text-[11px] truncate" style={{ color: 'var(--text-secondary)' }}>
          {preview || 'Thinking…'}
        </span>
        {group.messages.length > 1 && (
          <ChevronRight
            className={`w-3 h-3 ml-auto flex-shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`}
            style={{ color: 'var(--text-tertiary)' }}
          />
        )}
      </button>
      {expanded && group.messages.length > 1 && (
        <div className="ml-3 mt-0.5 space-y-0.5">
          {group.messages.map((msg, j) => (
            <MessageBubble key={j} message={msg} compact />
          ))}
        </div>
      )}
    </div>
  )
}

/** Compact message bubble for sidebar width — with expand/collapse for long content */
export function MessageBubble({ message, compact }: { message: { type: string; content: string; toolName?: string; step?: string }; compact?: boolean }) {
  const [expanded, setExpanded] = useState(false)

  const styles: Record<string, { borderColor: string; icon: React.ReactNode; label: string }> = {
    thinking: {
      borderColor: 'var(--accent-blue)',
      icon: <Brain className="w-3 h-3" style={{ color: 'var(--accent-blue)' }} />,
      label: 'Thinking',
    },
    'tool-call': {
      borderColor: 'var(--accent-amber)',
      icon: <Wrench className="w-3 h-3" style={{ color: 'var(--accent-amber)' }} />,
      label: message.toolName || 'Tool',
    },
    'tool-result': {
      borderColor: 'var(--accent-green)',
      icon: <CheckCircle2 className="w-3 h-3" style={{ color: 'var(--accent-green)' }} />,
      label: message.toolName || 'Result',
    },
    completed: {
      borderColor: 'var(--accent-green)',
      icon: <CheckCircle2 className="w-3 h-3" style={{ color: 'var(--accent-green)' }} />,
      label: 'Done',
    },
    failed: {
      borderColor: 'var(--accent-red)',
      icon: <AlertCircle className="w-3 h-3" style={{ color: 'var(--accent-red)' }} />,
      label: 'Error',
    },
    user: {
      borderColor: 'var(--accent-blue)',
      icon: <Send className="w-3 h-3" style={{ color: 'var(--accent-blue)' }} />,
      label: 'You',
    },
    system: {
      borderColor: 'var(--text-tertiary)',
      icon: <Sparkles className="w-3 h-3" style={{ color: 'var(--text-tertiary)' }} />,
      label: 'System',
    },
  }

  const style = styles[message.type] || styles.system

  // Increased preview limits: normal 500, compact 200
  const maxLen = compact ? 200 : 500
  const isTruncated = message.content.length > maxLen
  const displayContent = (isTruncated && !expanded)
    ? message.content.slice(0, maxLen) + '…'
    : message.content

  return (
    <div
      className={`pl-2 py-1 ${message.type === 'user' ? 'ml-4' : ''}`}
      style={{ borderLeft: `2px solid ${style.borderColor}` }}
    >
      <div className="flex items-center gap-1">
        {style.icon}
        <span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>{style.label}</span>
        {message.step && (
          <span className="text-[10px] ml-auto font-mono" style={{ color: 'var(--text-tertiary)' }}>{message.step}</span>
        )}
      </div>
      {displayContent && (
        <p className={`text-[11px] mt-0.5 ml-4 leading-relaxed break-words whitespace-pre-wrap ${compact && !expanded ? 'line-clamp-3' : ''}`} style={{ color: 'var(--text-secondary)' }}>
          {displayContent}
        </p>
      )}
      {isTruncated && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[10px] ml-4 mt-0.5 font-medium cursor-pointer hover:underline"
          style={{ color: 'var(--accent-blue)' }}
        >
          {expanded ? '▲ Show less' : '▼ Show more'}
        </button>
      )}
    </div>
  )
}

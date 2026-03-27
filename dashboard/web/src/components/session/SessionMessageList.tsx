/**
 * SessionMessageList — Shared message display components
 *
 * Extracted from CaseAIPanel.tsx for reuse in AgentMonitor SessionDetailPanel.
 * Processes raw SSE messages into display-friendly groups (collapsed tools,
 * collapsed thinking) and renders them with expand/collapse support.
 *
 * groupByStep mode (ISS-085): When enabled, messages are first grouped by
 * their `step` field, then each step group is rendered as a collapsible
 * section with a step header showing name + status.
 */
import { useState, useMemo } from 'react'
import {
  Sparkles, Send, CheckCircle2, Loader2, Wrench, Brain,
  AlertCircle, ChevronRight, ChevronDown, Clock, Play
} from 'lucide-react'
import type { CaseSessionMessage } from '../../stores/caseSessionStore'

// ============================================================
// Message processing — collapse verbose tool/thinking streams
// ============================================================

/** Types that are always shown individually (never collapsed) */
const ALWAYS_SHOW: Set<string> = new Set(['system', 'completed', 'failed', 'user', 'queued'])

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
    if (TOOL_TYPES.has(msg.type) || (msg.type as string) === 'tool_use' || (msg.type as string) === 'tool_result') return true
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
// Step grouping — group messages by step field (ISS-085)
// ============================================================

/** Human-friendly step labels */
const STEP_LABELS: Record<string, string> = {
  'full-process': 'Full Process',
  'data-refresh': 'Data Refresh',
  'compliance-check': 'Compliance Check',
  'status-judge': 'Status Judge',
  'teams-search': 'Teams Search',
  'troubleshoot': 'Troubleshoot',
  'draft-email': 'Draft Email',
  'inspection': 'Summary',
  'generate-kb': 'Generate KB',
}

export interface StepGroup {
  /** Step name or '__general__' for messages without step */
  stepName: string
  /** Human-friendly label */
  label: string
  /** Inferred status from messages */
  status: 'running' | 'completed' | 'failed'
  /** Messages in this step group */
  messages: CaseSessionMessage[]
  /** First message timestamp */
  startTime: string
  /** Last message timestamp */
  endTime: string
}

/**
 * Group messages by their `step` field into StepGroup[].
 * Preserves chronological order of first appearance.
 */
export function groupMessagesByStep(messages: CaseSessionMessage[]): StepGroup[] {
  if (messages.length === 0) return []

  // Build ordered map: stepName → messages
  const stepOrder: string[] = []
  const stepMap = new Map<string, CaseSessionMessage[]>()

  for (const msg of messages) {
    const key = msg.step || '__general__'
    if (!stepMap.has(key)) {
      stepOrder.push(key)
      stepMap.set(key, [])
    }
    stepMap.get(key)!.push(msg)
  }

  return stepOrder.map((stepName): StepGroup => {
    const msgs = stepMap.get(stepName)!
    // Infer status: if any message is 'completed', step is completed;
    // if any is 'failed', step is failed; otherwise running
    const hasCompleted = msgs.some(m => m.type === 'completed')
    const hasFailed = msgs.some(m => m.type === 'failed')
    const status = hasFailed ? 'failed' : hasCompleted ? 'completed' : 'running'

    return {
      stepName,
      label: stepName === '__general__' ? 'General' : (STEP_LABELS[stepName] || stepName),
      status,
      messages: msgs,
      startTime: msgs[0]?.timestamp || '',
      endTime: msgs[msgs.length - 1]?.timestamp || '',
    }
  })
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
  /** Group messages by step field (ISS-085). Used by Agent Monitor for case sessions. */
  groupByStep?: boolean
}

export function SessionMessageList({
  messages,
  containerRef,
  maxHeightClass = 'max-h-48',
  groupByStep = false,
}: SessionMessageListProps) {
  const displayMessages = useMemo(() => processMessages(messages), [messages])
  const stepGroups = useMemo(() => groupByStep ? groupMessagesByStep(messages) : [], [messages, groupByStep])

  // When no maxHeightClass and no containerRef, skip overflow wrapper (parent handles scrolling)
  const wrapperClass = maxHeightClass
    ? `${maxHeightClass} overflow-y-auto space-y-2`
    : 'space-y-2'

  // Step-grouped mode (ISS-085)
  if (groupByStep && stepGroups.length > 0) {
    // Only use step-grouped mode when there are at least 2 distinct steps
    // (or when there's at least 1 named step); otherwise fall back to flat display
    const hasNamedSteps = stepGroups.some(g => g.stepName !== '__general__')
    if (hasNamedSteps) {
      return (
        <div ref={containerRef as React.LegacyRef<HTMLDivElement>} className={wrapperClass}>
          {stepGroups.map((group, i) => (
            <StepGroupSection
              key={`${group.stepName}-${i}`}
              group={group}
              defaultExpanded={i === stepGroups.length - 1}
            />
          ))}
        </div>
      )
    }
  }

  // Default flat display
  return (
    <div ref={containerRef as React.LegacyRef<HTMLDivElement>} className={wrapperClass}>
      {displayMessages.map((dm, i) => {
        if (dm.kind === 'single') {
          return <MessageBubble key={i} message={dm.messages[0]} />
        }
        return <CollapsedGroup key={i} group={dm} isLast={i === displayMessages.length - 1} />
      })}
    </div>
  )
}

/** Step group section — collapsible step header with inner message list (ISS-085) */
function StepGroupSection({ group, defaultExpanded }: { group: StepGroup; defaultExpanded: boolean }) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const innerDisplayMessages = useMemo(() => processMessages(group.messages), [group.messages])

  const statusConfig = {
    running: {
      icon: <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: 'var(--accent-blue)' }} />,
      color: 'var(--accent-blue)',
      bg: 'var(--accent-blue-dim)',
      label: 'Running',
    },
    completed: {
      icon: <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--accent-green)' }} />,
      color: 'var(--accent-green)',
      bg: 'var(--accent-green-dim)',
      label: 'Done',
    },
    failed: {
      icon: <AlertCircle className="w-3.5 h-3.5" style={{ color: 'var(--accent-red)' }} />,
      color: 'var(--accent-red)',
      bg: 'var(--accent-red-dim)',
      label: 'Failed',
    },
  }

  const sc = statusConfig[group.status]
  const msgCount = group.messages.length
  const ChevronIcon = expanded ? ChevronDown : ChevronRight

  return (
    <div className="rounded-md overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
      {/* Step header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left transition-colors"
        style={{ background: 'var(--bg-inset)' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-inset)' }}
      >
        <ChevronIcon className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--text-tertiary)' }} />
        {group.stepName !== '__general__' ? (
          <Play className="w-3 h-3 flex-shrink-0" style={{ color: sc.color }} />
        ) : (
          <Sparkles className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--text-tertiary)' }} />
        )}
        <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
          {group.label}
        </span>
        {/* Status badge */}
        <span
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs"
          style={{ background: sc.bg, color: sc.color }}
        >
          {sc.icon}
          {sc.label}
        </span>
        {/* Message count */}
        <span className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>
          {msgCount} msg{msgCount !== 1 ? 's' : ''}
        </span>
        {/* Time range */}
        {group.startTime && (
          <span className="text-xs font-mono ml-auto" style={{ color: 'var(--text-tertiary)' }}>
            {formatTime(group.startTime)}
            {group.endTime && group.endTime !== group.startTime && ` → ${formatTime(group.endTime)}`}
          </span>
        )}
      </button>

      {/* Expanded message body */}
      {expanded && (
        <div className="px-2.5 py-1.5 space-y-1" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          {innerDisplayMessages.map((dm, i) => {
            if (dm.kind === 'single') {
              return <MessageBubble key={i} message={dm.messages[0]} />
            }
            return <CollapsedGroup key={i} group={dm} isLast={i === innerDisplayMessages.length - 1} />
          })}
        </div>
      )}
    </div>
  )
}

/** Collapsed group — compact summary with expand toggle */
export function CollapsedGroup({ group, isLast }: { group: DisplayMessage; isLast?: boolean }) {
  // Tools: default collapsed; Thinking: default expanded (show full content)
  const [expanded, setExpanded] = useState(group.kind !== 'collapsed-tools')

  if (group.kind === 'collapsed-tools') {
    const toolCount = group.messages.filter(m => m.type === 'tool-call').length
    const toolLabel = group.toolNames.length <= 2
      ? group.toolNames.join(', ')
      : `${group.toolNames.slice(0, 2).join(', ')}…`

    // Show spinner only if this is the last group (still executing)
    const ToolIcon = isLast ? Loader2 : Wrench
    const iconClass = isLast ? 'w-3.5 h-3.5 animate-spin flex-shrink-0' : 'w-3.5 h-3.5 flex-shrink-0'

    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center gap-1.5 pl-2 py-1 text-left rounded-sm transition-colors"
          style={{ borderLeft: '2px solid var(--accent-amber)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
        >
          <ToolIcon className={iconClass} style={{ color: 'var(--accent-amber)' }} />
          <span className="text-xs font-medium truncate" style={{ color: 'var(--text-secondary)' }}>
            {toolLabel || 'Working'}
          </span>
          {toolCount > 1 && (
            <span className="text-xs font-mono flex-shrink-0" style={{ color: 'var(--text-tertiary)' }}>
              ({toolCount})
            </span>
          )}
          {group.step && (
            <span className="text-xs font-mono flex-shrink-0" style={{ color: 'var(--text-tertiary)' }}>{group.step}</span>
          )}
          {group.timestamp && (
            <span className="text-xs font-mono flex-shrink-0" style={{ color: 'var(--text-tertiary)' }}>{formatTime(group.timestamp)}</span>
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

  // collapsed-thinking — show all messages expanded by default (full content)
  return (
    <div className="space-y-0.5">
      {group.messages.map((msg, j) => (
        <MessageBubble key={j} message={msg} />
      ))}
    </div>
  )
}

/** Format timestamp as HH:MM:SS */
function formatTime(ts: string | undefined): string {
  if (!ts) return ''
  try {
    const d = new Date(ts)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  } catch {
    return ''
  }
}

/** Compact message bubble for sidebar width — with expand/collapse for long content */
export function MessageBubble({ message, compact }: { message: { type: string; content: string; toolName?: string; step?: string; timestamp?: string }; compact?: boolean }) {
  const [expanded, setExpanded] = useState(false)

  const styles: Record<string, { borderColor: string; icon: React.ReactNode; label: string }> = {
    thinking: {
      borderColor: 'var(--accent-blue)',
      icon: <Brain className="w-3.5 h-3.5" style={{ color: 'var(--accent-blue)' }} />,
      label: 'Thinking',
    },
    'tool-call': {
      borderColor: 'var(--accent-amber)',
      icon: <Wrench className="w-3.5 h-3.5" style={{ color: 'var(--accent-amber)' }} />,
      label: message.toolName || 'Tool',
    },
    'tool-result': {
      borderColor: 'var(--accent-green)',
      icon: <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--accent-green)' }} />,
      label: message.toolName || 'Result',
    },
    completed: {
      borderColor: 'var(--accent-green)',
      icon: <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--accent-green)' }} />,
      label: 'Done',
    },
    failed: {
      borderColor: 'var(--accent-red)',
      icon: <AlertCircle className="w-3.5 h-3.5" style={{ color: 'var(--accent-red)' }} />,
      label: 'Error',
    },
    user: {
      borderColor: 'var(--accent-blue)',
      icon: <Send className="w-3.5 h-3.5" style={{ color: 'var(--accent-blue)' }} />,
      label: 'You',
    },
    system: {
      borderColor: 'var(--text-tertiary)',
      icon: <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} />,
      label: 'System',
    },
    queued: {
      borderColor: 'var(--accent-amber)',
      icon: <Clock className="w-3.5 h-3.5" style={{ color: 'var(--accent-amber)' }} />,
      label: '⏳ Queued',
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
      className={`pl-2.5 py-1.5 ${message.type === 'user' || message.type === 'queued' ? 'ml-4' : ''}`}
      style={{ borderLeft: `2px solid ${style.borderColor}` }}
    >
      <div className="flex items-center gap-1.5">
        {style.icon}
        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{style.label}</span>
        {message.step && (
          <span className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>{message.step}</span>
        )}
        {message.timestamp && (
          <span className="text-xs font-mono ml-auto flex-shrink-0" style={{ color: 'var(--text-tertiary)' }}>{formatTime(message.timestamp)}</span>
        )}
      </div>
      {displayContent && (
        <p className={`text-sm mt-0.5 ml-5 leading-relaxed break-words whitespace-pre-wrap ${compact && !expanded ? 'line-clamp-3' : ''}`} style={{ color: 'var(--text-secondary)' }}>
          {displayContent}
        </p>
      )}
      {isTruncated && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs ml-5 mt-0.5 font-medium cursor-pointer hover:underline"
          style={{ color: 'var(--accent-blue)' }}
        >
          {expanded ? '▲ Show less' : '▼ Show more'}
        </button>
      )}
    </div>
  )
}

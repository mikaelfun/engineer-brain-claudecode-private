/**
 * AgentMonitor — Agent/Session/Cron 监控页
 *
 * Unified view of all session types: case, implement, verify, track-creation.
 * Two-panel "Active Sessions" layout with inline sub-agent tree.
 */
import { Card } from '../components/common/Card'
import { Badge } from '../components/common/Badge'
import { Loading, EmptyState } from '../components/common/Loading'
import { useAgents, useCronJobs, useUnifiedSessions, useCaseMessages, useTriggers, useDeleteTrigger, useRunTrigger, useCancelTrigger, useToggleTrigger } from '../api/hooks'
import type { UnifiedSession } from '../api/hooks'
import { useCaseSessionStore, type CaseSessionMessage } from '../stores/caseSessionStore'
import { useIssueTrackStore, EMPTY_TRACK_MESSAGES, EMPTY_IMPLEMENT_MESSAGES, EMPTY_VERIFY_MESSAGES } from '../stores/issueTrackStore'
import type { IssueTrackMessage, ImplementMessage, VerifyMessage } from '../stores/issueTrackStore'
import { useSubAgentStore, type SubAgent } from '../stores/subAgentStore'
import { SessionMessageList } from '../components/session/SessionMessageList'
import { QueueStatusIndicator } from '../components/session/QueueStatusIndicator'
import { StepQuestionForm } from '../components/session/StepQuestionForm'
import { useQueryClient } from '@tanstack/react-query'
import { RefreshCw, ChevronDown, ChevronRight, Filter, Send, Square, Plus, Trash2, Play, Loader2, XCircle, CheckCircle2, AlertCircle, Trash, Pencil, Power } from 'lucide-react'
import { useState, useEffect, useRef, useMemo } from 'react'
import { apiPost, apiDelete } from '../api/client'
import { CreateTriggerDialog, type TriggerEditData } from '../components/agents/CreateTriggerDialog'
import { useTriggerRunStore } from '../stores/triggerRunStore'
import { DaemonStatusCard } from '../components/DaemonStatusCard'

const EMPTY_MESSAGES: CaseSessionMessage[] = []

// ---- Session type display config ----

const SESSION_TYPE_CONFIG: Record<string, { label: string; icon: string; bg: string; color: string }> = {
  case: { label: 'Case', icon: '📋', bg: 'var(--accent-blue-dim)', color: 'var(--accent-blue)' },
  queue: { label: 'Queue', icon: '🔄', bg: 'var(--accent-purple-dim, var(--accent-blue-dim))', color: 'var(--accent-purple, var(--accent-blue))' },
  implement: { label: 'Implement', icon: '🔧', bg: 'var(--accent-purple-dim, var(--accent-blue-dim))', color: 'var(--accent-purple, var(--accent-blue))' },
  verify: { label: 'Verify', icon: '🧪', bg: 'var(--accent-amber-dim)', color: 'var(--accent-amber)' },
  'track-creation': { label: 'Track', icon: '📝', bg: 'var(--accent-teal-dim, var(--accent-green-dim))', color: 'var(--accent-teal, var(--accent-green))' },
}

const STATUS_CONFIG: Record<string, { label: string; dotColor: string; animate?: boolean }> = {
  active: { label: 'Active', dotColor: 'var(--accent-blue)', animate: true },
  paused: { label: 'Paused', dotColor: 'var(--accent-amber)' },
  completed: { label: 'Done', dotColor: 'var(--accent-green)' },
  failed: { label: 'Failed', dotColor: 'var(--accent-red)' },
}

// ---- Sub-Agent display config ----

const AGENT_TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  casework: { bg: 'var(--accent-blue-dim)', color: 'var(--accent-blue)' },
  troubleshooter: { bg: 'var(--accent-purple-dim)', color: 'var(--accent-purple)' },
  'email-drafter': { bg: 'var(--accent-amber-dim)', color: 'var(--accent-amber)' },
  reassess: { bg: 'var(--accent-teal-dim, var(--accent-green-dim))', color: 'var(--accent-teal, var(--accent-green))' },
  challenger: { bg: 'var(--accent-red-dim)', color: 'var(--accent-red)' },
  summarize: { bg: 'var(--accent-green-dim)', color: 'var(--accent-green)' },
}
const DEFAULT_AGENT_COLOR = { bg: 'var(--bg-inset)', color: 'var(--text-secondary)' }

// ---- Shared sub-components ----

function SessionTypeBadge({ type }: { type: string }) {
  const config = SESSION_TYPE_CONFIG[type] || SESSION_TYPE_CONFIG.case
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
      style={{ background: config.bg, color: config.color }}
    >
      {config.icon} {config.label}
    </span>
  )
}

function StatusDot({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.completed
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${config.animate ? 'animate-pulse' : ''}`}
      style={{ background: config.dotColor }}
      title={config.label}
    />
  )
}

function AgentTypeBadge({ type }: { type: string }) {
  const c = AGENT_TYPE_COLORS[type] || DEFAULT_AGENT_COLOR
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase"
      style={{ background: c.bg, color: c.color, letterSpacing: '0.2px' }}
    >
      {type}
    </span>
  )
}

function SubAgentStatusDot({ status }: { status: SubAgent['status'] }) {
  const config: Record<string, { color: string; animate?: boolean }> = {
    running: { color: 'var(--accent-blue)', animate: true },
    completed: { color: 'var(--accent-green)' },
    failed: { color: 'var(--accent-red)' },
    stopped: { color: 'var(--text-tertiary)' },
  }
  const c = config[status] || config.completed
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full shrink-0 ${c.animate ? 'animate-pulse' : ''}`}
      style={{ background: c.color }}
      title={status}
    />
  )
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  const s = Math.floor(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  const remaining = s % 60
  return remaining > 0 ? `${m}m ${remaining}s` : `${m}m`
}

function formatTimeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
  return `${Math.floor(diffMins / 1440)}d ago`
}

// ---- SSE message converters (shared by detail panels) ----

/** Convert ImplementMessage[] to CaseSessionMessage[] for SessionMessageList */
function implementToSessionMessages(msgs: ImplementMessage[]): CaseSessionMessage[] {
  return msgs.map(m => ({
    type: m.kind === 'started' ? 'system' as const : m.kind as CaseSessionMessage['type'],
    content: m.content || '',
    toolName: m.toolName,
    timestamp: m.timestamp,
  }))
}

/** Convert IssueTrackMessage[] to CaseSessionMessage[] for SessionMessageList */
function trackToSessionMessages(msgs: IssueTrackMessage[]): CaseSessionMessage[] {
  return msgs.map(m => {
    const typeMap: Record<string, CaseSessionMessage['type']> = {
      'started': 'system',
      'thinking': 'thinking',
      'tool-call': 'tool-call',
      'completed': 'completed',
      'error': 'failed',
      'question': 'system',
    }
    return {
      type: typeMap[m.kind] || 'system',
      content: m.content || m.error || m.trackId || '',
      toolName: m.toolName,
      timestamp: m.timestamp,
    }
  })
}

/** Convert VerifyMessage[] to CaseSessionMessage[] for SessionMessageList */
function verifyToSessionMessages(msgs: VerifyMessage[]): CaseSessionMessage[] {
  return msgs.map(m => {
    const typeMap: Record<string, CaseSessionMessage['type']> = {
      'started': 'system',
      'thinking': 'thinking',
      'tool-call': 'tool-call',
      'tool-result': 'tool-result',
      'completed': 'completed',
      'error': 'failed',
    }
    return {
      type: typeMap[m.kind] || 'system',
      content: m.content || '',
      toolName: m.toolName,
      timestamp: m.timestamp,
    }
  })
}

// ---- Session Detail panels (rendered in the right panel) ----

/** Implement session detail — reads from issueTrackStore */
function ImplementSessionDetail({ session }: { session: UnifiedSession }) {
  const issueId = session.context
  const implMessages = useIssueTrackStore(s => s.implementMessages[issueId] ?? EMPTY_IMPLEMENT_MESSAGES)
  const containerRef = useRef<HTMLDivElement>(null)

  const messages = implMessages.length > 0 ? implementToSessionMessages(implMessages) : EMPTY_MESSAGES
  const isActive = session.status === 'active'

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [messages.length])

  return (
    <div className="rounded-lg overflow-hidden h-full" style={{ border: '1px solid var(--border-subtle)' }}>
      <div className="px-3 pt-2">
        {messages.length === 0 ? (
          <p className="text-xs py-2" style={{ color: 'var(--text-tertiary)' }}>
            {isActive ? 'Waiting for messages...' : 'No messages recorded'}
          </p>
        ) : (
          <SessionMessageList
            messages={messages}
            containerRef={containerRef}
            maxHeightClass="max-h-[calc(100vh-340px)]"
          />
        )}
      </div>
    </div>
  )
}

/** Verify session detail — reads from issueTrackStore verify state */
function VerifySessionDetail({ session }: { session: UnifiedSession }) {
  const issueId = session.context
  const verifyMsgs = useIssueTrackStore(s => s.verifyMessages[issueId] || EMPTY_VERIFY_MESSAGES)
  const containerRef = useRef<HTMLDivElement>(null)

  const messages = verifyToSessionMessages(verifyMsgs)
  const isActive = session.status === 'active'

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [messages.length])

  return (
    <div className="rounded-lg overflow-hidden h-full" style={{ border: '1px solid var(--border-subtle)' }}>
      <div className="px-3 pt-2">
        {messages.length === 0 ? (
          <p className="text-xs py-2" style={{ color: 'var(--text-tertiary)' }}>
            {isActive ? 'Waiting for messages...' : 'No messages recorded'}
          </p>
        ) : (
          <SessionMessageList
            messages={messages}
            containerRef={containerRef}
            maxHeightClass="max-h-[calc(100vh-340px)]"
          />
        )}
      </div>
    </div>
  )
}

/** Track-creation session detail — reads from issueTrackStore */
function TrackCreationSessionDetail({ session }: { session: UnifiedSession }) {
  const issueId = session.context
  const trackMsgs = useIssueTrackStore(s => s.messages[issueId] || EMPTY_TRACK_MESSAGES)
  const containerRef = useRef<HTMLDivElement>(null)

  const messages = trackToSessionMessages(trackMsgs)
  const isActive = session.status === 'active'

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [messages.length])

  return (
    <div className="rounded-lg overflow-hidden h-full" style={{ border: '1px solid var(--border-subtle)' }}>
      <div className="px-3 pt-2">
        {messages.length === 0 ? (
          <p className="text-xs py-2" style={{ color: 'var(--text-tertiary)' }}>
            {isActive ? 'Waiting for messages...' : 'No messages recorded'}
          </p>
        ) : (
          <SessionMessageList
            messages={messages}
            containerRef={containerRef}
            maxHeightClass="max-h-[calc(100vh-340px)]"
          />
        )}
      </div>
    </div>
  )
}

/** Case session detail with live SSE messages, chat input, and stop button */
function CaseSessionDetail({ session }: { session: UnifiedSession }) {
  const caseNumber = session.context
  const sessionId = session.id
  const sessionKey = sessionId ? `${caseNumber}:${sessionId}` : ''
  const perSessionMessages = useCaseSessionStore(s => sessionKey ? (s.sessionMessages[sessionKey] || EMPTY_MESSAGES) : EMPTY_MESSAGES)
  const caseLevelMessages = useCaseSessionStore(s => s.messages[caseNumber] || EMPTY_MESSAGES)
  const storeMessages = perSessionMessages.length > 0 ? perSessionMessages : caseLevelMessages
  const pendingQuestion = useCaseSessionStore(s => s.getPendingQuestion(caseNumber))
  const addMessage = useCaseSessionStore(s => s.addMessage)
  const addSessionMessage = useCaseSessionStore(s => s.addSessionMessage)
  const containerRef = useRef<HTMLDivElement>(null)
  const [chatInput, setChatInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isStopping, setIsStopping] = useState(false)
  const hasRecoveredRef = useRef(false)

  // Recover persisted messages on first expand
  const { data: recoveredData } = useCaseMessages(caseNumber)
  useEffect(() => {
    if (recoveredData?.messages && !hasRecoveredRef.current && storeMessages.length === 0) {
      hasRecoveredRef.current = true
      for (const msg of recoveredData.messages) {
        addMessage(caseNumber, msg as CaseSessionMessage)
        if (sessionId) {
          addSessionMessage(caseNumber, sessionId, msg as CaseSessionMessage)
        }
      }
    }
  }, [recoveredData, storeMessages.length, caseNumber, sessionId, addMessage, addSessionMessage])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [storeMessages.length])

  const isActive = session.status === 'active' || session.status === 'paused'
  const isDismissable = isActive || session.status === 'failed'

  const handleChat = async () => {
    const text = chatInput.trim()
    if (!text || isSending) return
    setChatInput('')
    setIsSending(true)

    addMessage(caseNumber, {
      type: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    })

    try {
      await apiPost(`/case/${caseNumber}/chat`, { message: text, sessionId: session.id })
    } catch {
      addMessage(caseNumber, {
        type: 'system',
        content: 'Failed to send message',
        timestamp: new Date().toISOString(),
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleStop = async () => {
    if (isStopping) return
    setIsStopping(true)
    try {
      await apiDelete(`/case/${caseNumber}/session`, { sessionId: session.id })
    } catch {
      // Session may already be ended
    } finally {
      setIsStopping(false)
    }
  }

  return (
    <div className="rounded-lg overflow-hidden h-full flex flex-col" style={{ border: '1px solid var(--border-subtle)' }}>
      {/* Messages */}
      <div className="px-3 pt-2 flex-1 min-h-0">
        {storeMessages.length === 0 ? (
          <p className="text-xs py-2" style={{ color: 'var(--text-tertiary)' }}>
            {isActive ? 'Waiting for messages...' : 'No messages recorded'}
          </p>
        ) : (
          <SessionMessageList
            messages={storeMessages}
            containerRef={containerRef}
            maxHeightClass="max-h-[calc(100vh-400px)]"
            groupByStep
          />
        )}
      </div>

      {/* Pending question form */}
      {pendingQuestion && (
        <div className="px-3 py-2">
          <StepQuestionForm
            caseNumber={caseNumber}
            questions={pendingQuestion.questions}
            contextMessages={storeMessages}
            onAnswered={() => { useCaseSessionStore.getState().clearPendingQuestion(caseNumber) }}
          />
        </div>
      )}

      {/* Chat input + Stop/Dismiss button */}
      {isDismissable && (
        <div className="flex items-center gap-2 px-3 py-2 mt-auto" style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
          {isActive && (
            <>
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleChat() }}
                placeholder="Send message to session..."
                className="flex-1 text-xs px-2.5 py-1.5 rounded border outline-none"
                style={{
                  background: 'var(--bg-inset)',
                  color: 'var(--text-primary)',
                  borderColor: 'var(--border-default)',
                }}
                disabled={isSending}
              />
              <button
                onClick={handleChat}
                disabled={!chatInput.trim() || isSending}
                className="p-1.5 rounded transition-colors disabled:opacity-40"
                style={{ color: 'var(--accent-blue)' }}
                title="Send"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </>
          )}
          {!isActive && (
            <span className="flex-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Session failed — dismiss to clean up
            </span>
          )}
          <button
            onClick={handleStop}
            disabled={isStopping}
            className="flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors disabled:opacity-40"
            style={{ color: 'var(--accent-red)', background: 'var(--accent-red-dim)' }}
            title={isActive ? 'Stop session' : 'Dismiss failed session'}
          >
            <Square className="w-3 h-3" />
            {isActive ? 'Stop' : 'Dismiss'}
          </button>
        </div>
      )}
    </div>
  )
}

// ---- Sub-Agent Detail Panel ----

function SubAgentDetailPanel({ agent }: { agent: SubAgent }) {
  const durationMs = agent.usage?.duration_ms
    || (agent.completedAt && agent.startedAt
      ? new Date(agent.completedAt).getTime() - new Date(agent.startedAt).getTime()
      : agent.startedAt
        ? Date.now() - new Date(agent.startedAt).getTime()
        : undefined)

  return (
    <div className="space-y-3 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-2 flex-wrap">
        <AgentTypeBadge type={agent.agentType} />
        {agent.caseNumber && (
          <span className="text-sm font-mono" style={{ color: 'var(--text-primary)' }}>{agent.caseNumber}</span>
        )}
        <Badge
          variant={agent.status === 'running' ? 'primary' : agent.status === 'completed' ? 'success' : agent.status === 'failed' ? 'danger' : 'secondary'}
          size="xs"
        >
          {agent.status}
        </Badge>
      </div>

      {/* Description */}
      {agent.description && (
        <p className="text-xs leading-relaxed line-clamp-3" style={{ color: 'var(--text-secondary)' }}>
          {agent.description}
        </p>
      )}

      {/* Summary */}
      {agent.summary && (
        <div>
          <span className="text-[10px] font-semibold uppercase" style={{ color: 'var(--text-tertiary)' }}>Summary</span>
          <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {agent.summary}
          </p>
        </div>
      )}

      {/* Usage stats */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <span style={{ color: 'var(--text-tertiary)' }}>Duration</span>
          <p style={{ color: 'var(--text-secondary)' }}>{durationMs ? formatDuration(durationMs) : '-'}</p>
        </div>
        <div>
          <span style={{ color: 'var(--text-tertiary)' }}>Tokens</span>
          <p style={{ color: 'var(--text-secondary)' }}>
            {agent.usage?.total_tokens ? agent.usage.total_tokens.toLocaleString() : '-'}
          </p>
        </div>
        <div>
          <span style={{ color: 'var(--text-tertiary)' }}>Tool Uses</span>
          <p style={{ color: 'var(--text-secondary)' }}>{agent.usage?.tool_uses ?? '-'}</p>
        </div>
      </div>

      {/* Last tool */}
      {agent.lastToolName && (
        <div>
          <span className="text-[10px] font-semibold uppercase" style={{ color: 'var(--text-tertiary)' }}>Last Tool</span>
          <p className="text-xs mt-0.5 font-mono" style={{ color: 'var(--text-secondary)' }}>
            {agent.lastToolName}
          </p>
        </div>
      )}

      {/* Timestamps */}
      <div className="text-[10px] space-y-0.5" style={{ color: 'var(--text-tertiary)' }}>
        <div>Started: {new Date(agent.startedAt).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
        {agent.completedAt && (
          <div>Completed: {new Date(agent.completedAt).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
        )}
      </div>
    </div>
  )
}

// ---- Active Sessions Section ----

/** Renders the appropriate session detail based on session type */
function SessionDetailByType({ session }: { session: UnifiedSession }) {
  if (session.type === 'case') return <CaseSessionDetail session={session} />
  if (session.type === 'implement') return <ImplementSessionDetail session={session} />
  if (session.type === 'verify') return <VerifySessionDetail session={session} />
  if (session.type === 'track-creation') return <TrackCreationSessionDetail session={session} />

  // Unknown type: simple status
  return (
    <div className="rounded-lg p-3 text-xs h-full" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
      <div className="flex items-center gap-2">
        <StatusDot status={session.status} />
        <span style={{ color: 'var(--text-secondary)' }}>
          {session.status === 'active' ? 'Session is running...' :
           session.status === 'paused' ? 'Session paused — waiting for input' :
           session.status === 'completed' ? 'Session completed successfully' :
           session.status === 'failed' ? 'Session failed' : session.status}
        </span>
      </div>
      {session.intent && (
        <p className="mt-1 ml-4" style={{ color: 'var(--text-tertiary)' }}>{session.intent}</p>
      )}
    </div>
  )
}

/** Right panel: full-width main SSE, or 50/50 split when sub-agent is selected */
function MainAgentDetailPanel({
  session,
  selectedSub,
}: {
  session: UnifiedSession | null
  selectedSub: SubAgent | null
}) {
  if (!session) {
    return (
      <div className="flex items-center justify-center h-full min-h-[200px] rounded-lg" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
          Select a main agent to view details
        </span>
      </div>
    )
  }

  // No sub-agent selected → full-width main session detail
  if (!selectedSub) {
    return <SessionDetailByType session={session} />
  }

  // Sub-agent selected → 50/50 split
  return (
    <div className="grid grid-cols-2 gap-3 h-full">
      {/* Left half: Session SSE stream */}
      <SessionDetailByType session={session} />
      {/* Right half: Sub-Agent detail */}
      <div className="rounded-lg p-4 overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        <SubAgentDetailPanel agent={selectedSub} />
      </div>
    </div>
  )
}

/** A row in the left panel list for a main agent, with collapsible sub-agent children */
function MainAgentRow({
  session,
  isSelected,
  subAgents,
  isSubExpanded,
  selectedSubId,
  onSelectMain,
  onToggleSubList,
  onSelectSub,
  onStopSession,
}: {
  session: UnifiedSession
  isSelected: boolean
  subAgents: SubAgent[]
  isSubExpanded: boolean
  selectedSubId: string | null
  onSelectMain: () => void
  onToggleSubList: () => void
  onSelectSub: (subId: string) => void
  onStopSession?: () => void
}) {
  const typeConfig = SESSION_TYPE_CONFIG[session.type] || SESSION_TYPE_CONFIG.case
  const [isStopping, setIsStopping] = useState(false)
  const timeAgo = formatTimeAgo(session.lastActivityAt)

  const isStoppable = session.type === 'case' && (session.status === 'active' || session.status === 'paused' || session.status === 'failed')

  const handleInlineStop = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isStopping || !onStopSession) return
    setIsStopping(true)
    try {
      await apiDelete(`/case/${session.context}/session`, { sessionId: session.id })
      onStopSession()
    } catch {
      // Session may already be ended
    } finally {
      setIsStopping(false)
    }
  }

  const runningSubCount = subAgents.filter(a => a.status === 'running').length

  return (
    <div>
      {/* Session row */}
      <button
        onClick={onSelectMain}
        className="flex items-center justify-between py-2.5 px-3 w-full text-left transition-colors"
        style={{
          background: isSelected ? 'var(--bg-active)' : 'transparent',
          borderBottom: '1px solid var(--border-subtle)',
        }}
        onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)' }}
        onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = isSelected ? 'var(--bg-active)' : 'transparent' }}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <StatusDot status={session.status} />
          <SessionTypeBadge type={session.type} />
          <span
            className="text-sm font-mono truncate"
            style={{ color: typeConfig.color }}
          >
            {session.context}
          </span>
          <span
            className="text-xs truncate max-w-[200px] hidden lg:inline"
            style={{ color: 'var(--text-tertiary)' }}
          >
            {session.intent}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          {/* Type-specific metadata badges */}
          {session.type === 'implement' && session.metadata?.trackId && (
            <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-active)', color: 'var(--text-tertiary)' }}>
              {String(session.metadata.trackId)}
            </span>
          )}
          {session.type === 'verify' && session.metadata?.result && (
            <span className="text-xs px-1.5 py-0.5 rounded" style={{
              background: (session.metadata.result as any)?.overall ? 'var(--accent-green-dim)' : 'var(--accent-red-dim)',
              color: (session.metadata.result as any)?.overall ? 'var(--accent-green)' : 'var(--accent-red)',
            }}>
              {(session.metadata.result as any)?.overall ? '✅ Pass' : '❌ Fail'}
            </span>
          )}
          {session.type === 'track-creation' && session.metadata?.hasPendingQuestion && (
            <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--accent-amber-dim)', color: 'var(--accent-amber)' }}>
              ⏳ Awaiting input
            </span>
          )}
          {/* Sub-agents toggle */}
          {subAgents.length > 0 && (
            <span
              role="button"
              onClick={(e) => { e.stopPropagation(); onToggleSubList() }}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium cursor-pointer transition-colors"
              style={{
                background: 'var(--bg-inset)',
                color: runningSubCount > 0 ? 'var(--accent-blue)' : 'var(--text-tertiary)',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-inset)' }}
              title={`${subAgents.length} sub-agent(s)`}
            >
              {isSubExpanded
                ? <ChevronDown className="w-3 h-3" />
                : <ChevronRight className="w-3 h-3" />
              }
              sub-agents ({subAgents.length})
              {runningSubCount > 0 && (
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--accent-blue)' }} />
              )}
            </span>
          )}
          {/* Inline Stop */}
          {isStoppable && (
            <span
              role="button"
              onClick={handleInlineStop}
              className={`inline-flex items-center justify-center w-5 h-5 rounded cursor-pointer transition-all ${isStopping ? 'opacity-40 pointer-events-none animate-pulse' : 'hover:scale-110'}`}
              style={{ color: 'var(--accent-red)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--accent-red-dim)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              title="Stop session"
            >
              <Square className="w-3 h-3" style={{ fill: isStopping ? 'var(--accent-red)' : 'none' }} />
            </span>
          )}
          <span className="text-xs whitespace-nowrap" style={{ color: 'var(--text-tertiary)' }}>
            {timeAgo}
          </span>
        </div>
      </button>

      {/* Sub-agents list (expanded) */}
      {isSubExpanded && subAgents.length > 0 && (
        <div style={{ background: 'var(--bg-inset)' }}>
          {subAgents.map((sub) => {
            const isSubSelected = selectedSubId === sub.taskId
            const subDuration = sub.usage?.duration_ms
              || (sub.completedAt && sub.startedAt
                ? new Date(sub.completedAt).getTime() - new Date(sub.startedAt).getTime()
                : sub.startedAt && sub.status === 'running'
                  ? Date.now() - new Date(sub.startedAt).getTime()
                  : undefined)

            return (
              <button
                key={sub.taskId}
                onClick={() => onSelectSub(sub.taskId)}
                className="flex items-center gap-2.5 w-full text-left py-2 pl-8 pr-3 transition-colors"
                style={{
                  background: isSubSelected ? 'var(--bg-active)' : 'transparent',
                  borderBottom: '1px solid color-mix(in srgb, var(--border-subtle) 50%, transparent)',
                }}
                onMouseEnter={e => { if (!isSubSelected) (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)' }}
                onMouseLeave={e => { if (!isSubSelected) (e.currentTarget as HTMLElement).style.background = isSubSelected ? 'var(--bg-active)' : 'transparent' }}
              >
                <SubAgentStatusDot status={sub.status} />
                <AgentTypeBadge type={sub.agentType} />
                {sub.caseNumber && (
                  <span className="text-xs font-mono" style={{ color: 'var(--text-primary)' }}>
                    {sub.caseNumber}
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  {sub.lastToolName && (
                    <span className="text-[10px] truncate block" style={{ color: 'var(--text-tertiary)' }}>
                      {sub.lastToolName}
                    </span>
                  )}
                </div>
                {subDuration !== undefined && (
                  <span className="text-[10px] whitespace-nowrap shrink-0" style={{ color: 'var(--text-tertiary)' }}>
                    {formatDuration(subDuration)}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

/** Main two-panel layout: left = agent list, right = detail */
function MainAgentsSection({
  sessions,
  allSessions,
  sessionsLoading,
  onStopAllCaseSessions,
  stoppingAll,
  onRefreshSessions,
}: {
  sessions: UnifiedSession[]
  allSessions: UnifiedSession[]
  sessionsLoading: boolean
  onStopAllCaseSessions: (sessions: UnifiedSession[]) => void
  stoppingAll: boolean
  onRefreshSessions: () => void
}) {
  const [selectedMainId, setSelectedMainId] = useState<string | null>(null)
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null)
  const [expandedSubAgents, setExpandedSubAgents] = useState<Set<string>>(new Set())
  const [showCompleted, setShowCompleted] = useState(false)

  // Sub-agent store
  const allSubAgents = useSubAgentStore((s) => s.agents)

  // Group sub-agents by parent session
  const subAgentsBySession = useMemo(() => {
    const map: Record<string, SubAgent[]> = {}
    for (const agent of Object.values(allSubAgents)) {
      if (!map[agent.parentSessionId]) map[agent.parentSessionId] = []
      map[agent.parentSessionId].push(agent)
    }
    // Sort each group by startedAt desc
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
    }
    return map
  }, [allSubAgents])

  // Split & sort sessions: active first (sorted by lastActivityAt desc), completed at bottom
  const activeSessions = useMemo(() =>
    sessions
      .filter(s => s.status !== 'completed')
      .sort((a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime()),
    [sessions]
  )

  const completedSessions = useMemo(() =>
    sessions
      .filter(s => s.status === 'completed')
      .sort((a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime()),
    [sessions]
  )

  const selectedSession = selectedMainId
    ? sessions.find(s => s.id === selectedMainId) || null
    : null

  const selectedSub = selectedSubId
    ? allSubAgents[selectedSubId] || null
    : null

  // Count stoppable case sessions for "Stop All" button
  const stoppableCount = activeSessions.filter(s => s.type === 'case' && (s.status === 'active' || s.status === 'paused' || s.status === 'failed')).length

  const handleSelectMain = (sessionId: string) => {
    setSelectedMainId(sessionId)
    setSelectedSubId(null)
  }

  const handleToggleSubList = (sessionId: string) => {
    setExpandedSubAgents(prev => {
      const next = new Set(prev)
      if (next.has(sessionId)) {
        next.delete(sessionId)
      } else {
        next.add(sessionId)
      }
      return next
    })
  }

  const handleSelectSub = (subId: string) => {
    // Click same sub-agent again → deselect
    if (selectedSubId === subId) {
      setSelectedSubId(null)
    } else {
      setSelectedSubId(subId)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          Active Sessions
          {sessions.length !== allSessions.length && (
            <span className="ml-2 text-sm font-normal" style={{ color: 'var(--text-tertiary)' }}>
              ({sessions.length} of {allSessions.length})
            </span>
          )}
        </h3>
        {stoppableCount > 0 && (
          <button
            onClick={() => onStopAllCaseSessions(activeSessions)}
            disabled={stoppingAll}
            className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-md border transition-all disabled:opacity-50 hover:brightness-110"
            style={{
              color: 'var(--accent-red)',
              background: 'var(--accent-red-dim)',
              borderColor: 'color-mix(in srgb, var(--accent-red) 30%, transparent)',
            }}
            title="Stop all active case sessions"
          >
            <Square className="w-3 h-3" style={{ fill: stoppingAll ? 'var(--accent-red)' : 'none' }} />
            {stoppingAll ? 'Stopping...' : `Stop All (${stoppableCount})`}
          </button>
        )}
      </div>

      {sessionsLoading ? (
        <Loading text="Loading sessions..." />
      ) : sessions.length === 0 ? (
        <EmptyState icon="🧠" title="No sessions" description={allSessions.length > 0 ? 'No sessions match current filters' : 'No agent sessions recorded yet'} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4" style={{ minHeight: '300px' }}>
          {/* Left panel: scrollable agent list */}
          <Card padding="none">
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 340px)' }}>
              {/* Active/Recent sessions */}
              {activeSessions.map((session) => (
                <MainAgentRow
                  key={session.id}
                  session={session}
                  isSelected={selectedMainId === session.id}
                  subAgents={subAgentsBySession[session.id] || []}
                  isSubExpanded={expandedSubAgents.has(session.id)}
                  selectedSubId={selectedSubId}
                  onSelectMain={() => handleSelectMain(session.id)}
                  onToggleSubList={() => handleToggleSubList(session.id)}
                  onSelectSub={handleSelectSub}
                  onStopSession={onRefreshSessions}
                />
              ))}

              {/* Completed sessions (collapsible) */}
              {completedSessions.length > 0 && (
                <>
                  <button
                    onClick={() => setShowCompleted(!showCompleted)}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 transition-colors"
                    style={{
                      background: 'var(--bg-surface)',
                      borderBottom: '1px solid var(--border-subtle)',
                      borderTop: activeSessions.length > 0 ? '1px solid var(--border-default)' : undefined,
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-surface)' }}
                  >
                    {showCompleted
                      ? <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} />
                      : <ChevronRight className="w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} />
                    }
                    <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
                      ✅ Completed
                    </span>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full"
                      style={{ background: 'var(--accent-green-dim)', color: 'var(--accent-green)' }}
                    >
                      {completedSessions.length}
                    </span>
                  </button>

                  {showCompleted && completedSessions.map((session) => (
                    <MainAgentRow
                      key={session.id}
                      session={session}
                      isSelected={selectedMainId === session.id}
                      subAgents={subAgentsBySession[session.id] || []}
                      isSubExpanded={expandedSubAgents.has(session.id)}
                      selectedSubId={selectedSubId}
                      onSelectMain={() => handleSelectMain(session.id)}
                      onToggleSubList={() => handleToggleSubList(session.id)}
                      onSelectSub={handleSelectSub}
                      onStopSession={onRefreshSessions}
                    />
                  ))}
                </>
              )}
            </div>
          </Card>

          {/* Right panel: detail */}
          <MainAgentDetailPanel session={selectedSession} selectedSub={selectedSub} />
        </div>
      )}
    </div>
  )
}

// ---- Cron Job Detail Panel ----

function CronJobDetailPanel({ job, triggerRun, onDismissRun }: {
  job: any | null
  triggerRun?: any
  onDismissRun: () => void
}) {
  const isJobRunning = triggerRun?.status === 'running' || job?.running
  const justFinished = triggerRun && triggerRun.status !== 'running'

  if (!job) {
    return (
      <Card>
        <div className="flex items-center justify-center h-full min-h-[120px]">
          <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            Select a job to view details
          </span>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="space-y-3">
        {/* Header */}
        <div>
          <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{job.name}</h4>
          {(job as any).description && (
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{(job as any).description}</p>
          )}
          {(job as any).prompt && (job as any).prompt !== job.name && (
            <p className="text-xs mt-1 font-mono px-2 py-1 rounded" style={{ background: 'var(--bg-inset)', color: 'var(--text-secondary)' }}>
              {(job as any).prompt}
            </p>
          )}
        </div>

        {/* Stats row */}
        {job.state && (
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div>
              <span style={{ color: 'var(--text-tertiary)' }}>Status</span>
              <p>
                <Badge
                  variant={job.state.lastStatus === 'error' ? 'danger' : job.state.lastStatus === 'success' ? 'success' : 'secondary'}
                  size="xs"
                >
                  {job.state.lastStatus || 'pending'}
                </Badge>
              </p>
            </div>
            <div>
              <span style={{ color: 'var(--text-tertiary)' }}>Duration</span>
              <p style={{ color: 'var(--text-secondary)' }}>{job.state.lastDurationMs ? `${Math.round(job.state.lastDurationMs / 1000)}s` : '-'}</p>
            </div>
            <div>
              <span style={{ color: 'var(--text-tertiary)' }}>Last Run</span>
              <p style={{ color: 'var(--text-secondary)' }}>{job.state.lastRunAtMs ? new Date(job.state.lastRunAtMs).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'Never'}</p>
            </div>
            <div>
              <span style={{ color: 'var(--text-tertiary)' }}>Errors</span>
              <p style={{ color: job.state.consecutiveErrors > 0 ? 'var(--accent-red)' : 'var(--text-secondary)' }}>
                {job.state.consecutiveErrors || 0}
              </p>
            </div>
          </div>
        )}

        {/* Live run output */}
        {isJobRunning && triggerRun && (
          <div className="rounded overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
            <div className="flex items-center justify-between px-3 py-1.5" style={{ background: 'var(--accent-blue-dim)' }}>
              <span className="text-xs font-medium flex items-center gap-1.5" style={{ color: 'var(--accent-blue)' }}>
                <Loader2 className="w-3 h-3 animate-spin" />
                Running... {triggerRun.elapsedMs > 0 && `(${Math.round(triggerRun.elapsedMs / 1000)}s)`}
              </span>
            </div>
            {triggerRun.output && (
              <pre className="px-3 py-2 text-xs overflow-auto whitespace-pre-wrap" style={{ background: 'var(--bg-inset)', color: 'var(--text-primary)', maxHeight: '300px' }}>
                {triggerRun.output}
              </pre>
            )}
          </div>
        )}

        {/* Just-finished result */}
        {justFinished && (
          <div className="rounded overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
            <div className="flex items-center justify-between px-3 py-1.5" style={{
              background: triggerRun.status === 'completed' ? 'var(--accent-green-dim)' : triggerRun.status === 'failed' ? 'var(--accent-red-dim)' : 'var(--bg-hover)',
            }}>
              <span className="text-xs font-medium flex items-center gap-1.5" style={{
                color: triggerRun.status === 'completed' ? 'var(--accent-green)' : triggerRun.status === 'failed' ? 'var(--accent-red)' : 'var(--text-secondary)',
              }}>
                {triggerRun.status === 'completed' && <><CheckCircle2 className="w-3 h-3" /> Done ({Math.round(triggerRun.elapsedMs / 1000)}s)</>}
                {triggerRun.status === 'failed' && <><AlertCircle className="w-3 h-3" /> Failed ({Math.round(triggerRun.elapsedMs / 1000)}s)</>}
                {triggerRun.status === 'cancelled' && <><XCircle className="w-3 h-3" /> Cancelled</>}
              </span>
              <button onClick={onDismissRun} className="text-xs px-2 py-0.5 rounded hover:bg-[var(--bg-hover)]" style={{ color: 'var(--text-tertiary)' }}>
                Dismiss
              </button>
            </div>
            {triggerRun.output && (
              <pre className="px-3 py-2 text-xs overflow-auto whitespace-pre-wrap" style={{ background: 'var(--bg-inset)', color: 'var(--text-primary)', maxHeight: '300px' }}>
                {triggerRun.output}
              </pre>
            )}
            {triggerRun.error && (
              <div className="px-3 py-2 text-xs" style={{ color: 'var(--accent-red)' }}>{triggerRun.error}</div>
            )}
          </div>
        )}

        {/* Historical output (when idle) */}
        {!isJobRunning && !justFinished && (
          <>
            {job.state?.lastError && (
              <div className="p-2 rounded text-xs break-all" style={{ background: 'var(--accent-red-dim)', color: 'var(--accent-red)' }}>
                {job.state.lastError}
              </div>
            )}
            {job.state?.lastOutput ? (
              <div>
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Last Output</span>
                <pre className="mt-1 p-2 rounded text-xs overflow-auto whitespace-pre-wrap" style={{ background: 'var(--bg-inset)', color: 'var(--text-primary)', maxHeight: '300px' }}>
                  {job.state.lastOutput}
                </pre>
              </div>
            ) : (
              <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>No output recorded</div>
            )}
          </>
        )}
      </div>
    </Card>
  )
}

// ---- Main Component ----

export default function AgentMonitor() {
  const { data: agentsData, isLoading: agentsLoading } = useAgents()
  const { data: cronData, isLoading: cronLoading } = useCronJobs()
  const { data: triggersData } = useTriggers()
  const deleteTrigger = useDeleteTrigger()
  const runTrigger = useRunTrigger()
  const cancelTrigger = useCancelTrigger()
  const toggleTrigger = useToggleTrigger()
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingTrigger, setEditingTrigger] = useState<TriggerEditData | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Trigger run store
  const triggerRuns = useTriggerRunStore((s) => s.runs)
  const clearTriggerRun = useTriggerRunStore((s) => s.clearRun)

  // Reconcile stale trigger "running" state with API truth.
  useEffect(() => {
    if (!triggersData) return
    const triggers: any[] = (triggersData as any).triggers || (triggersData as any).jobs || []
    const store = useTriggerRunStore.getState()
    for (const [triggerId, run] of Object.entries(store.runs)) {
      if ((run as any)?.status !== 'running') continue
      const apiTrigger = triggers.find((t: any) => t.id === triggerId)
      if (!apiTrigger || apiTrigger.running) continue
      const state = apiTrigger.state || {}
      if (state.lastStatus === 'success') {
        store.onTriggerCompleted(triggerId, state.lastDurationMs || 0, state.lastOutput?.slice(0, 300))
      } else if (state.lastStatus === 'error') {
        store.onTriggerFailed(triggerId, state.lastDurationMs || 0, state.lastError)
      } else if (state.lastStatus === 'cancelled') {
        store.onTriggerCancelled(triggerId, state.lastDurationMs || 0)
      } else {
        store.onTriggerCompleted(triggerId, state.lastDurationMs || 0)
      }
      console.log(`[AgentMonitor] Reconciled stale trigger ${triggerId}: was 'running', API says '${state.lastStatus || 'done'}'`)
    }
  }, [triggersData])

  const { data: unifiedData, isLoading: sessionsLoading } = useUnifiedSessions()

  // Global queue status
  const queueStatus = useCaseSessionStore((s) => s.queueStatus)

  const queryClient = useQueryClient()
  const [refreshing, setRefreshing] = useState(false)

  // Filters
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  // Stop All state
  const [stoppingAll, setStoppingAll] = useState(false)

  // Cron job detail panel
  const [selectedCronJobId, setSelectedCronJobId] = useState<string | null>(null)

  // Cleanup state
  const [cleaning, setCleaning] = useState(false)
  const [cleanupResult, setCleanupResult] = useState<{ purged: number; remaining: number } | null>(null)

  // Auto-refresh
  const autoRefreshInterval = 30_000
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    }, autoRefreshInterval)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [autoRefreshInterval, queryClient])

  const handleRefresh = () => {
    setRefreshing(true)
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['agents'] }),
      queryClient.invalidateQueries({ queryKey: ['agents', 'cron-jobs'] }),
      queryClient.invalidateQueries({ queryKey: ['sessions'] }),
    ]).finally(() => {
      setTimeout(() => setRefreshing(false), 500)
    })
  }

  if (agentsLoading || cronLoading) return <Loading text="Loading agents..." />

  const agents = agentsData?.agents || []
  const cronJobs = cronData?.jobs || []
  const allSessions: UnifiedSession[] = unifiedData?.sessions || []

  // Apply filters — reclassify internal sessions as 'queue' type
  const filteredSessions = allSessions
    .map((s) => s.context?.startsWith('__') ? { ...s, type: 'queue' as const } : s)
    .filter((s) => {
      if (typeFilter !== 'all' && s.type !== typeFilter) return false
      if (statusFilter !== 'all' && s.status !== statusFilter) return false
    return true
  })

  // Summary counts
  const activeSessions = allSessions.filter((s) => s.status === 'active')
  const typeCounts: Record<string, number> = {}
  for (const s of allSessions) {
    typeCounts[s.type] = (typeCounts[s.type] || 0) + 1
  }

  const refreshSessions = () => {
    queryClient.invalidateQueries({ queryKey: ['sessions'] })
  }

  const handleStopAllCaseSessions = async (sessions: UnifiedSession[]) => {
    const activeCaseSessions = sessions.filter(s => s.type === 'case' && (s.status === 'active' || s.status === 'paused' || s.status === 'failed'))
    if (activeCaseSessions.length === 0) return
    setStoppingAll(true)
    try {
      await Promise.allSettled(
        activeCaseSessions.map(s => apiDelete(`/case/${s.context}/session`, { sessionId: s.id }))
      )
      refreshSessions()
    } finally {
      setStoppingAll(false)
    }
  }

  const handleCleanup = async () => {
    setCleaning(true)
    setCleanupResult(null)
    try {
      const res = await apiPost('/sessions/cleanup')
      setCleanupResult(res as { purged: number; remaining: number })
      refreshSessions()
      setTimeout(() => setCleanupResult(null), 5000)
    } catch { /* ignore */ } finally {
      setCleaning(false)
    }
  }

  // Count stale sessions
  const now = Date.now()
  const staleSessions = allSessions.filter(s => {
    const age = now - new Date(s.lastActivityAt).getTime()
    return (
      ((s.status === 'completed' || s.status === 'failed') && age > 60 * 60 * 1000) ||
      (s.status === 'paused' && age > 15 * 60 * 1000)
    )
  })

  // Group ordering for filters
  const typeOrder = ['case', 'queue', 'implement', 'verify', 'track-creation']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Agent Monitor</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
            {activeSessions.length} active | {allSessions.length} total sessions | {cronJobs.length} cron jobs
          </p>
          {queueStatus && (
            <div className="mt-1.5">
              <QueueStatusIndicator
                currentLabel={queueStatus.currentLabel}
                queueLength={queueStatus.queueLength}
                queueLabels={queueStatus.queueLabels}
              />
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-lg transition-colors"
            style={{
              color: showFilters ? 'var(--accent-blue)' : 'var(--text-secondary)',
              background: showFilters ? 'var(--accent-blue-dim)' : 'var(--bg-surface)',
              borderColor: showFilters ? 'var(--accent-blue)' : 'var(--border-default)',
            }}
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>
          {staleSessions.length > 0 && (
            <button
              onClick={handleCleanup}
              disabled={cleaning}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-lg transition-colors disabled:opacity-50"
              style={{ color: 'var(--accent-amber)', background: 'var(--accent-amber-dim)', borderColor: 'var(--accent-amber)' }}
              title={`Clean up ${staleSessions.length} expired session(s)`}
            >
              <Trash className={`w-4 h-4 ${cleaning ? 'animate-pulse' : ''}`} />
              Clean up ({staleSessions.length})
            </button>
          )}
          {cleanupResult && (
            <span className="text-xs px-2 py-1 rounded" style={{ background: 'var(--accent-green-dim)', color: 'var(--accent-green)' }}>
              Purged {cleanupResult.purged}, {cleanupResult.remaining} left
            </span>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-lg transition-colors disabled:opacity-50"
            style={{ color: 'var(--text-secondary)', background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
            title="Refresh all"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex items-center gap-4 p-3 rounded-lg" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>Type:</span>
            {['all', ...typeOrder].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className="px-2 py-1 text-xs rounded-md transition-colors"
                style={{
                  background: typeFilter === t ? 'var(--accent-blue-dim)' : 'transparent',
                  color: typeFilter === t ? 'var(--accent-blue)' : 'var(--text-tertiary)',
                }}
              >
                {t === 'all' ? 'All' : SESSION_TYPE_CONFIG[t]?.label || t}
                {t !== 'all' && typeCounts[t] ? ` (${typeCounts[t]})` : ''}
              </button>
            ))}
          </div>
          <div className="h-4 w-px" style={{ background: 'var(--border-subtle)' }} />
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs rounded-md px-2 py-1 border"
              style={{ background: 'var(--bg-inset)', color: 'var(--text-secondary)', borderColor: 'var(--border-default)' }}
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      )}

      {/* Daemon + Patrol — side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Token Daemon Status */}
        <DaemonStatusCard />

        {/* Patrol — link to dedicated page */}
        <div className="rounded-xl p-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>🔄</span>
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Patrol</span>
            </div>
            <a
              href="/patrol"
              className="text-sm px-3 py-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--accent-blue)', background: 'var(--accent-blue-dim)' }}
            >
              Open Patrol →
            </a>
          </div>
        </div>
      </div>

      {/* Active Sessions — two-panel layout */}
      <MainAgentsSection
        sessions={filteredSessions}
        allSessions={allSessions}
        sessionsLoading={sessionsLoading}
        onStopAllCaseSessions={handleStopAllCaseSessions}
        stoppingAll={stoppingAll}
        onRefreshSessions={refreshSessions}
      />

      {/* Agent Grid */}
      {agents.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Agents</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {agents.map((agent: any) => (
              <Card key={agent.id}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🤖</span>
                  <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{agent.name || agent.id}</h4>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center justify-between">
                    <span style={{ color: 'var(--text-tertiary)' }}>Model</span>
                    <Badge variant="primary" size="xs">
                      {agent.model.split('/').pop()}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: 'var(--text-tertiary)' }}>ID</span>
                    <span className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>{agent.id}</span>
                  </div>
                  {agent.subagents?.allowAgents && (
                    <div className="flex items-center justify-between">
                      <span style={{ color: 'var(--text-tertiary)' }}>Sub-agents</span>
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {agent.subagents.allowAgents.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Cron Jobs — List + Detail Panel */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Cron Jobs</h3>
          <button
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors"
            style={{
              background: 'var(--accent-blue)',
              color: 'white',
            }}
          >
            <Plus className="w-4 h-4" />
            New Cron Job
          </button>
        </div>
        {cronJobs.length === 0 ? (
          <EmptyState icon="⏰" title="No cron jobs" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-4">
            {/* Left: job list */}
            <Card padding="none">
              <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                {cronJobs.map((job: any) => {
                  const triggerRun = triggerRuns[job.id]
                  const isJobRunning = triggerRun?.status === 'running' || job.running
                  const justFinished = triggerRun && triggerRun.status !== 'running'
                  const isSelected = selectedCronJobId === job.id

                  return (
                    <div
                      key={job.id}
                      className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors"
                      style={{
                        background: isSelected ? 'var(--bg-active)' : 'transparent',
                        borderBottom: '1px solid var(--border-subtle)',
                      }}
                      onClick={() => setSelectedCronJobId(isSelected ? null : job.id)}
                      onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)' }}
                      onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                    >
                      {/* Status dot */}
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${isJobRunning ? 'animate-pulse' : ''}`}
                        style={{
                          background: isJobRunning ? 'var(--accent-blue)'
                            : !job.enabled ? 'var(--text-tertiary)'
                            : job.state?.lastStatus === 'error' ? 'var(--accent-red)'
                            : job.state?.lastStatus === 'success' ? 'var(--accent-green)'
                            : 'var(--text-tertiary)',
                        }}
                      />
                      {/* Name + meta */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                            {job.name}
                          </span>
                          {!job.enabled && (
                            <span className="text-[10px] px-1 rounded" style={{ background: 'var(--bg-inset)', color: 'var(--text-tertiary)' }}>OFF</span>
                          )}
                          {isJobRunning && (
                            <Loader2 className="w-3 h-3 animate-spin shrink-0" style={{ color: 'var(--accent-blue)' }} />
                          )}
                          {justFinished && triggerRun.status === 'completed' && (
                            <CheckCircle2 className="w-3 h-3 shrink-0" style={{ color: 'var(--accent-green)' }} />
                          )}
                          {justFinished && triggerRun.status === 'failed' && (
                            <AlertCircle className="w-3 h-3 shrink-0" style={{ color: 'var(--accent-red)' }} />
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] font-mono" style={{ color: 'var(--text-tertiary)' }}>
                            {job.schedule?.kind === 'cron' ? job.schedule.expr : job.schedule?.kind}
                          </span>
                          {job.state?.lastRunAtMs && (
                            <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                              {new Date(job.state.lastRunAtMs).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                              {job.state.lastDurationMs ? ` (${Math.round(job.state.lastDurationMs / 1000)}s)` : ''}
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Action buttons */}
                      <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => toggleTrigger.mutate({ id: job.id, enabled: !job.enabled })}
                          disabled={toggleTrigger.isPending || isJobRunning}
                          className="p-1 rounded transition-colors hover:bg-[var(--bg-hover)]"
                          style={{ color: job.enabled ? 'var(--accent-green)' : 'var(--text-tertiary)' }}
                          title={job.enabled ? 'Disable' : 'Enable'}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingTrigger({
                            id: job.id,
                            name: job.name,
                            prompt: (job as any).prompt || '',
                            cron: job.schedule?.expr || '',
                            description: (job as any).description || '',
                          })}
                          disabled={isJobRunning}
                          className="p-1 rounded transition-colors hover:bg-[var(--bg-hover)]"
                          style={{ color: isJobRunning ? 'var(--text-tertiary)' : 'var(--text-secondary)' }}
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        {isJobRunning ? (
                          <button
                            onClick={() => cancelTrigger.mutate(job.id)}
                            disabled={cancelTrigger.isPending}
                            className="p-1 rounded transition-colors hover:bg-[var(--bg-hover)]"
                            style={{ color: 'var(--accent-red)' }}
                            title="Cancel"
                          >
                            <Square className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => runTrigger.mutate(job.id)}
                            disabled={runTrigger.isPending || !job.enabled}
                            className="p-1 rounded transition-colors hover:bg-[var(--bg-hover)]"
                            style={{ color: !job.enabled ? 'var(--text-tertiary)' : 'var(--accent-green)' }}
                            title={job.enabled ? 'Run now' : 'Enable first'}
                          >
                            <Play className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {deletingId === job.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => { deleteTrigger.mutate(job.id); setDeletingId(null) }}
                              className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                              style={{ background: 'var(--accent-red)', color: 'white' }}
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setDeletingId(null)}
                              className="px-1.5 py-0.5 rounded text-[10px]"
                              style={{ color: 'var(--text-tertiary)' }}
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeletingId(job.id)}
                            disabled={isJobRunning}
                            className="p-1 rounded transition-colors hover:bg-[var(--bg-hover)]"
                            style={{ color: isJobRunning ? 'var(--text-tertiary)' : 'var(--accent-red)' }}
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>

            {/* Right: selected job detail / output */}
            <CronJobDetailPanel
              job={cronJobs.find((j: any) => j.id === selectedCronJobId) || null}
              triggerRun={selectedCronJobId ? triggerRuns[selectedCronJobId] : undefined}
              onDismissRun={() => selectedCronJobId && clearTriggerRun(selectedCronJobId)}
            />
          </div>
        )}
      </div>

      {/* Create Trigger Dialog */}
      <CreateTriggerDialog
        isOpen={showCreateDialog || !!editingTrigger}
        onClose={() => { setShowCreateDialog(false); setEditingTrigger(null) }}
        editData={editingTrigger}
      />
    </div>
  )
}

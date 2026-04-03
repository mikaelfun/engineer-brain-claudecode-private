/**
 * AgentMonitor — Agent/Session/Cron 监控页
 *
 * Unified view of all session types: case, implement, verify, track-creation.
 * Each session row is expandable to show live SSE messages and interaction controls.
 */
import { Card, CardHeader } from '../components/common/Card'
import { Badge } from '../components/common/Badge'
import { Loading, EmptyState } from '../components/common/Loading'
import { useAgents, useCronJobs, usePatrolState, useCancelPatrol, useUnifiedSessions, useCaseMessages, useTriggers, useDeleteTrigger, useRunTrigger, useCancelTrigger } from '../api/hooks'
import type { UnifiedSession } from '../api/hooks'
import { usePatrolStore } from '../stores/patrolStore'
import { useCaseSessionStore, type CaseSessionMessage } from '../stores/caseSessionStore'
import { useIssueTrackStore, EMPTY_TRACK_MESSAGES, EMPTY_IMPLEMENT_MESSAGES, EMPTY_VERIFY_MESSAGES } from '../stores/issueTrackStore'
import type { IssueTrackMessage, ImplementMessage, VerifyMessage } from '../stores/issueTrackStore'
import { SessionMessageList } from '../components/session/SessionMessageList'
import { QueueStatusIndicator } from '../components/session/QueueStatusIndicator'
import { StepQuestionForm } from '../components/session/StepQuestionForm'
import { useQueryClient } from '@tanstack/react-query'
import { RefreshCw, ChevronDown, ChevronRight, Filter, Send, Square, Plus, Trash2, Play, Loader2, XCircle, CheckCircle2, AlertCircle } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { apiPost, apiDelete } from '../api/client'
import { CreateTriggerDialog } from '../components/agents/CreateTriggerDialog'
import { useTriggerRunStore } from '../stores/triggerRunStore'

const EMPTY_MESSAGES: CaseSessionMessage[] = []

// ---- Session type display config ----

const SESSION_TYPE_CONFIG: Record<string, { label: string; icon: string; bg: string; color: string }> = {
  case: { label: 'Case', icon: '📋', bg: 'var(--accent-blue-dim)', color: 'var(--accent-blue)' },
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

// ---- Sub-components ----

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

function SessionRow({ session, isExpanded, onToggle, onStop }: { session: UnifiedSession; isExpanded: boolean; onToggle: () => void; onStop?: () => void }) {
  const typeConfig = SESSION_TYPE_CONFIG[session.type] || SESSION_TYPE_CONFIG.case
  const [isStopping, setIsStopping] = useState(false)

  // Format relative time
  const lastActivity = new Date(session.lastActivityAt)
  const now = new Date()
  const diffMs = now.getTime() - lastActivity.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const timeAgo = diffMins < 1 ? 'just now'
    : diffMins < 60 ? `${diffMins}m ago`
    : diffMins < 1440 ? `${Math.floor(diffMins / 60)}h ago`
    : `${Math.floor(diffMins / 1440)}d ago`

  const isStoppable = session.type === 'case' && (session.status === 'active' || session.status === 'paused' || session.status === 'failed')

  const handleInlineStop = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isStopping || !onStop) return
    setIsStopping(true)
    try {
      await apiDelete(`/case/${session.context}/session`, { sessionId: session.id })
      onStop()
    } catch {
      // Session may already be ended
    } finally {
      setIsStopping(false)
    }
  }

  return (
    <div>
      <button
        onClick={onToggle}
        className="flex items-center justify-between py-2 px-3 rounded-lg w-full text-left transition-colors"
        style={{
          background: isExpanded ? 'var(--bg-active)' : 'var(--bg-inset)',
        }}
        onMouseEnter={e => { if (!isExpanded) (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)' }}
        onMouseLeave={e => { if (!isExpanded) (e.currentTarget as HTMLElement).style.background = 'var(--bg-inset)' }}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <ChevronRight
            className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            style={{ color: 'var(--text-tertiary)' }}
          />
          <StatusDot status={session.status} />
          <SessionTypeBadge type={session.type} />
          <span
            className="text-sm font-mono truncate"
            style={{ color: typeConfig.color }}
          >
            {session.context}
          </span>
          <span
            className="text-xs truncate max-w-[300px] hidden md:inline"
            style={{ color: 'var(--text-tertiary)' }}
          >
            {session.intent}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-2">
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
          {/* Inline Stop/Dismiss button for active/paused/failed case sessions */}
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
      {isExpanded && (
        <SessionDetailPanel session={session} />
      )}
    </div>
  )
}

/** Detail panel shown when a session row is expanded */
function SessionDetailPanel({ session }: { session: UnifiedSession }) {
  if (session.type === 'case') {
    return <CaseSessionDetail session={session} />
  }
  if (session.type === 'implement') {
    return <ImplementSessionDetail session={session} />
  }
  if (session.type === 'verify') {
    return <VerifySessionDetail session={session} />
  }
  if (session.type === 'track-creation') {
    return <TrackCreationSessionDetail session={session} />
  }

  // Unknown type: simple status text
  return (
    <div className="ml-7 mt-1 mb-2 px-3 py-2 rounded-lg text-xs" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
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

/** Implement session detail — reads from issueTrackStore */
function ImplementSessionDetail({ session }: { session: UnifiedSession }) {
  const issueId = session.context
  const implMessages = useIssueTrackStore(s => s.implementMessages[issueId] ?? EMPTY_IMPLEMENT_MESSAGES)
  const containerRef = useRef<HTMLDivElement>(null)

  const messages = implMessages.length > 0 ? implementToSessionMessages(implMessages) : EMPTY_MESSAGES
  const isActive = session.status === 'active'

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [messages.length])

  return (
    <div className="ml-7 mt-1 mb-2 rounded-lg overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
      <div className="px-3 pt-2">
        {messages.length === 0 ? (
          <p className="text-xs py-2" style={{ color: 'var(--text-tertiary)' }}>
            {isActive ? 'Waiting for messages...' : 'No messages recorded'}
          </p>
        ) : (
          <SessionMessageList
            messages={messages}
            containerRef={containerRef}
            maxHeightClass="max-h-64"
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
    <div className="ml-7 mt-1 mb-2 rounded-lg overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
      <div className="px-3 pt-2">
        {messages.length === 0 ? (
          <p className="text-xs py-2" style={{ color: 'var(--text-tertiary)' }}>
            {isActive ? 'Waiting for messages...' : 'No messages recorded'}
          </p>
        ) : (
          <SessionMessageList
            messages={messages}
            containerRef={containerRef}
            maxHeightClass="max-h-64"
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
    <div className="ml-7 mt-1 mb-2 rounded-lg overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
      <div className="px-3 pt-2">
        {messages.length === 0 ? (
          <p className="text-xs py-2" style={{ color: 'var(--text-tertiary)' }}>
            {isActive ? 'Waiting for messages...' : 'No messages recorded'}
          </p>
        ) : (
          <SessionMessageList
            messages={messages}
            containerRef={containerRef}
            maxHeightClass="max-h-64"
          />
        )}
      </div>
    </div>
  )
}

/** Case session detail with live SSE messages, chat input, and stop button */
function CaseSessionDetail({ session }: { session: UnifiedSession }) {
  const caseNumber = session.context // case sessions use caseNumber as context
  const sessionId = session.id
  // Use per-session messages when sessionId is available, fallback to case-level aggregate
  const sessionKey = sessionId ? `${caseNumber}:${sessionId}` : ''
  const perSessionMessages = useCaseSessionStore(s => sessionKey ? (s.sessionMessages[sessionKey] || EMPTY_MESSAGES) : EMPTY_MESSAGES)
  const caseLevelMessages = useCaseSessionStore(s => s.messages[caseNumber] || EMPTY_MESSAGES)
  // Prefer per-session; fallback to case-level if per-session is empty
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
        // Also populate per-session bucket so future reads use it
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

    // Optimistic user message
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
    <div className="ml-7 mt-1 mb-2 rounded-lg overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
      {/* Messages */}
      <div className="px-3 pt-2">
        {storeMessages.length === 0 ? (
          <p className="text-xs py-2" style={{ color: 'var(--text-tertiary)' }}>
            {isActive ? 'Waiting for messages...' : 'No messages recorded'}
          </p>
        ) : (
          <SessionMessageList
            messages={storeMessages}
            containerRef={containerRef}
            maxHeightClass="max-h-64"
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
        <div className="flex items-center gap-2 px-3 py-2 mt-1" style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
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

// ---- Main Component ----

export default function AgentMonitor() {
  const { data: agentsData, isLoading: agentsLoading } = useAgents()
  const { data: cronData, isLoading: cronLoading } = useCronJobs()
  const { data: triggersData } = useTriggers()
  const deleteTrigger = useDeleteTrigger()
  const runTrigger = useRunTrigger()
  const cancelTrigger = useCancelTrigger()
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Trigger run store
  const triggerRuns = useTriggerRunStore((s) => s.runs)
  const clearTriggerRun = useTriggerRunStore((s) => s.clearRun)
  const { data: patrol } = usePatrolState()
  const { data: unifiedData, isLoading: sessionsLoading } = useUnifiedSessions()

  // Patrol store
  const isRunning = usePatrolStore((s) => s.isRunning)
  const phase = usePatrolStore((s) => s.phase)
  const totalCases = usePatrolStore((s) => s.totalCases)
  const changedCases = usePatrolStore((s) => s.changedCases)
  const processedCases = usePatrolStore((s) => s.processedCases)
  const currentCase = usePatrolStore((s) => s.currentCase)
  const caseProgress = usePatrolStore((s) => s.caseProgress)
  const patrolError = usePatrolStore((s) => s.error)

  // Global queue status
  const queueStatus = useCaseSessionStore((s) => s.queueStatus)

  const cancelPatrol = useCancelPatrol()
  const queryClient = useQueryClient()
  const [refreshing, setRefreshing] = useState(false)

  // Expand/collapse per session
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null)

  // Filters
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  // Stop All state
  const [stoppingAll, setStoppingAll] = useState(false)

  // Collapsed groups
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({
    __completed: true, // Completed sessions collapsed by default
  })

  // Auto-refresh
  const autoRefreshInterval = isRunning ? 5_000 : 30_000
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      queryClient.invalidateQueries({ queryKey: ['agents', 'patrol-state'] })
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
      queryClient.invalidateQueries({ queryKey: ['agents', 'patrol-state'] }),
    ]).finally(() => {
      setTimeout(() => setRefreshing(false), 500)
    })
  }

  if (agentsLoading || cronLoading) return <Loading text="Loading agents..." />

  const agents = agentsData?.agents || []
  const cronJobs = cronData?.jobs || []
  const allSessions: UnifiedSession[] = unifiedData?.sessions || []

  // Apply filters
  const filteredSessions = allSessions.filter((s) => {
    if (typeFilter !== 'all' && s.type !== typeFilter) return false
    if (statusFilter !== 'all' && s.status !== statusFilter) return false
    return true
  })

  // Split into active/recent vs completed
  const activeSessions2 = filteredSessions.filter(s => s.status !== 'completed')
  const completedSessions = filteredSessions.filter(s => s.status === 'completed')

  // Group active/recent by type
  const sessionsByType: Record<string, UnifiedSession[]> = {}
  for (const s of activeSessions2) {
    if (!sessionsByType[s.type]) sessionsByType[s.type] = []
    sessionsByType[s.type].push(s)
  }

  // Group completed by type (for expanded view)
  const completedByType: Record<string, UnifiedSession[]> = {}
  for (const s of completedSessions) {
    if (!completedByType[s.type]) completedByType[s.type] = []
    completedByType[s.type].push(s)
  }

  // Summary counts
  const activeSessions = allSessions.filter((s) => s.status === 'active')
  const typeCounts: Record<string, number> = {}
  for (const s of allSessions) {
    typeCounts[s.type] = (typeCounts[s.type] || 0) + 1
  }

  const toggleGroup = (type: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [type]: !prev[type] }))
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

  // Group ordering
  const typeOrder = ['case', 'implement', 'verify', 'track-creation']

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

      {/* Patrol Progress (real-time, SSE-driven) */}
      {(isRunning || phase) && (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <CardHeader
              title="Patrol Progress"
              icon={<span>{isRunning ? '🔄' : '✅'}</span>}
              subtitle={phase}
            />
            {isRunning && (
              <button
                onClick={() => cancelPatrol.mutate()}
                disabled={cancelPatrol.isPending}
                className="px-3 py-1 text-xs font-medium rounded-lg disabled:opacity-50 transition-colors"
                style={{ color: 'var(--accent-red)', background: 'var(--accent-red-dim)' }}
              >
                {cancelPatrol.isPending ? 'Cancelling...' : 'Cancel Patrol'}
              </button>
            )}
          </div>

          {changedCases > 0 && (
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>
                <span>{processedCases} / {changedCases} cases</span>
                <span>{Math.round((processedCases / changedCases) * 100)}%</span>
              </div>
              <div className="w-full rounded-full h-2" style={{ background: 'var(--bg-active)' }}>
                <div
                  className="rounded-full h-2 transition-all duration-500"
                  style={{ width: `${(processedCases / changedCases) * 100}%`, background: 'var(--accent-blue)' }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            {isRunning && (
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--accent-blue)' }} />
            )}
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {phase === 'discovering' && `Discovering active cases... ${totalCases ? `(${totalCases} found)` : ''}`}
              {phase === 'filtering' && `Found ${totalCases} cases, ${changedCases} changed`}
              {phase === 'processing' && `Processing ${changedCases} cases in parallel${currentCase ? ` (latest: ${currentCase})` : ''}...`}
              {phase === 'aggregating' && 'Aggregating todos...'}
              {phase === 'completed' && `Patrol complete. ${processedCases}/${totalCases || processedCases} cases processed.`}
              {phase === 'failed' && `Patrol failed: ${patrolError}`}
            </span>
          </div>

          {caseProgress.length > 0 && (
            <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Cases ({caseProgress.filter(c => c.status === 'completed').length}/{caseProgress.length} done):</span>
                {caseProgress.filter(c => c.status === 'processing').length > 0 && (
                  <span className="text-xs font-medium" style={{ color: 'var(--accent-blue)' }}>
                    {caseProgress.filter(c => c.status === 'processing').length} running in parallel
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {caseProgress.map((cp) => (
                  <span
                    key={cp.caseNumber}
                    className="px-1.5 py-0.5 rounded text-xs font-mono flex items-center gap-1"
                    style={{
                      background: cp.status === 'completed' ? 'var(--accent-green-dim)'
                        : cp.status === 'processing' ? 'var(--accent-blue-dim)'
                        : cp.status === 'failed' ? 'var(--accent-red-dim)'
                        : 'var(--bg-inset)',
                      color: cp.status === 'completed' ? 'var(--accent-green)'
                        : cp.status === 'processing' ? 'var(--accent-blue)'
                        : cp.status === 'failed' ? 'var(--accent-red)'
                        : 'var(--text-secondary)',
                    }}
                    title={cp.error || cp.status}
                  >
                    {cp.status === 'processing' && <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--accent-blue)' }} />}
                    {cp.status === 'completed' && <span style={{ color: 'var(--accent-green)' }}>✓</span>}
                    {cp.status === 'failed' && <span style={{ color: 'var(--accent-red)' }}>✗</span>}
                    {cp.caseNumber.slice(-6)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {patrolError && (
            <div
              className="mt-2 p-2 rounded text-xs"
              style={{ background: 'var(--accent-red-dim)', color: 'var(--accent-red)' }}
            >
              {patrolError}
            </div>
          )}
        </Card>
      )}

      {/* All Sessions — Active/Recent grouped by type, then Completed */}
      <div>
        <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
          Sessions
          {filteredSessions.length !== allSessions.length && (
            <span className="ml-2 text-sm font-normal" style={{ color: 'var(--text-tertiary)' }}>
              ({filteredSessions.length} of {allSessions.length})
            </span>
          )}
        </h3>

        {sessionsLoading ? (
          <Loading text="Loading sessions..." />
        ) : filteredSessions.length === 0 ? (
          <EmptyState icon="🧠" title="No sessions" description={allSessions.length > 0 ? 'No sessions match current filters' : 'No agent sessions recorded yet'} />
        ) : (
          <div className="space-y-3">
            {/* Active/Recent sessions grouped by type */}
            {typeOrder
              .filter((t) => sessionsByType[t]?.length)
              .map((type) => {
                const sessions = sessionsByType[type]
                const config = SESSION_TYPE_CONFIG[type]
                const isCollapsed = collapsedGroups[type]
                const activeCount = sessions.filter((s) => s.status === 'active').length
                const stoppableCount = sessions.filter((s) => s.type === 'case' && (s.status === 'active' || s.status === 'paused' || s.status === 'failed')).length

                return (
                  <Card key={type}>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => toggleGroup(type)}
                        className="flex items-center gap-2 text-left"
                      >
                        {isCollapsed
                          ? <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                          : <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                        }
                        <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                          {config.icon} {config.label} Sessions
                        </span>
                        <span
                          className="text-xs px-1.5 py-0.5 rounded-full"
                          style={{ background: config.bg, color: config.color }}
                        >
                          {sessions.length}
                        </span>
                        {activeCount > 0 && (
                          <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--accent-blue)' }}>
                            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--accent-blue)' }} />
                            {activeCount} active
                          </span>
                        )}
                      </button>
                      {/* Stop All button for case sessions with stoppable sessions */}
                      {type === 'case' && stoppableCount > 0 && (
                        <button
                          onClick={() => handleStopAllCaseSessions(sessions)}
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

                    {!isCollapsed && (
                      <div className="mt-3 space-y-1.5">
                        {sessions.map((session) => (
                          <SessionRow
                            key={session.id}
                            session={session}
                            isExpanded={expandedSessionId === session.id}
                            onToggle={() => setExpandedSessionId(expandedSessionId === session.id ? null : session.id)}
                            onStop={refreshSessions}
                          />
                        ))}
                      </div>
                    )}
                  </Card>
                )
              })}

            {/* Completed Sessions — collapsed by default */}
            {completedSessions.length > 0 && (
              <Card>
                <button
                  onClick={() => toggleGroup('__completed')}
                  className="flex items-center justify-between w-full text-left"
                >
                  <div className="flex items-center gap-2">
                    {collapsedGroups.__completed
                      ? <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                      : <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                    }
                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                      ✅ Completed Sessions
                    </span>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-full"
                      style={{ background: 'var(--accent-green-dim)', color: 'var(--accent-green)' }}
                    >
                      {completedSessions.length}
                    </span>
                  </div>
                </button>

                {!collapsedGroups.__completed && (
                  <div className="mt-3 space-y-3">
                    {typeOrder
                      .filter(t => completedByType[t]?.length)
                      .map(type => {
                        const sessions = completedByType[type]
                        const config = SESSION_TYPE_CONFIG[type]
                        return (
                          <div key={type}>
                            <div className="flex items-center gap-2 mb-1.5 ml-1">
                              <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
                                {config.icon} {config.label}
                              </span>
                              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>({sessions.length})</span>
                            </div>
                            <div className="space-y-1.5">
                              {sessions.map(session => (
                                <SessionRow
                                  key={session.id}
                                  session={session}
                                  isExpanded={expandedSessionId === session.id}
                                  onToggle={() => setExpandedSessionId(expandedSessionId === session.id ? null : session.id)}
                                  onStop={refreshSessions}
                                />
                              ))}
                            </div>
                          </div>
                        )
                      })}
                  </div>
                )}
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Last Patrol */}
      {patrol && (
        <Card>
          <CardHeader
            title="Last Patrol"
            icon={<span>🔄</span>}
            subtitle={`${patrol.patrolType} | ${new Date(patrol.lastPatrol).toLocaleString()}`}
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <span style={{ color: 'var(--text-tertiary)' }}>Cases</span>
              <p className="font-bold">{patrol.lastRunTiming?.caseCount || 0}</p>
            </div>
            <div>
              <span style={{ color: 'var(--text-tertiary)' }}>Duration</span>
              <p className="font-bold">{patrol.lastRunTiming?.wallClockMinutes || 0} min</p>
            </div>
            <div>
              <span style={{ color: 'var(--text-tertiary)' }}>Compute</span>
              <p className="font-bold">{patrol.lastRunTiming?.computeSeconds || 0}s</p>
            </div>
            <div>
              <span style={{ color: 'var(--text-tertiary)' }}>Started</span>
              <p className="font-bold text-xs">{patrol.currentPatrolStartedAt ? new Date(patrol.currentPatrolStartedAt).toLocaleString() : '-'}</p>
            </div>
          </div>
          {patrol.lastRunTiming?.bottlenecks?.length > 0 && (
            <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Bottlenecks:</span>
              <ul className="text-xs mt-1 space-y-0.5" style={{ color: 'var(--text-secondary)' }}>
                {patrol.lastRunTiming.bottlenecks.map((b: string, i: number) => (
                  <li key={i}>• {b}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}

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

      {/* Cron Jobs Table */}
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
          <div className="space-y-3">
            {cronJobs.map((job: any) => {
              const triggerRun = triggerRuns[job.id]
              const isJobRunning = triggerRun?.status === 'running' || job.running
              const justFinished = triggerRun && triggerRun.status !== 'running'

              return (
              <Card key={job.id}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{job.name}</h4>
                      <Badge variant={job.enabled ? 'success' : 'secondary'} size="xs">
                        {job.enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                      {isJobRunning && (
                        <Badge variant="primary" size="xs">
                          <span className="flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Running
                          </span>
                        </Badge>
                      )}
                      {justFinished && triggerRun.status === 'completed' && (
                        <Badge variant="success" size="xs">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Done ({Math.round(triggerRun.elapsedMs / 1000)}s)
                          </span>
                        </Badge>
                      )}
                      {justFinished && triggerRun.status === 'failed' && (
                        <Badge variant="danger" size="xs">
                          <span className="flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Failed
                          </span>
                        </Badge>
                      )}
                      {justFinished && triggerRun.status === 'cancelled' && (
                        <Badge variant="secondary" size="xs">
                          <span className="flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            Cancelled
                          </span>
                        </Badge>
                      )}
                    </div>
                    {(job as any).prompt && (job as any).prompt !== job.name && (
                      <p className="text-xs mt-0.5 font-mono truncate" style={{ color: 'var(--text-tertiary)' }}>
                        {(job as any).prompt}
                      </p>
                    )}
                    {(job as any).description && (
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                        {(job as any).description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                    <Badge variant="primary" size="xs">
                      {job.schedule?.kind === 'cron' ? job.schedule.expr : job.schedule?.kind}
                    </Badge>
                    {isJobRunning ? (
                      <button
                        onClick={() => cancelTrigger.mutate(job.id)}
                        disabled={cancelTrigger.isPending}
                        className="p-1.5 rounded transition-colors hover:bg-[var(--bg-hover)]"
                        style={{ color: 'var(--accent-red)' }}
                        title="Cancel"
                      >
                        <Square className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => runTrigger.mutate(job.id)}
                        disabled={runTrigger.isPending}
                        className="p-1.5 rounded transition-colors hover:bg-[var(--bg-hover)]"
                        style={{ color: 'var(--accent-green)' }}
                        title="Run now"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    )}
                    {deletingId === job.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { deleteTrigger.mutate(job.id); setDeletingId(null) }}
                          className="px-2 py-0.5 rounded text-xs font-medium"
                          style={{ background: 'var(--accent-red)', color: 'white' }}
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeletingId(null)}
                          className="px-2 py-0.5 rounded text-xs"
                          style={{ color: 'var(--text-tertiary)' }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeletingId(job.id)}
                        disabled={isJobRunning}
                        className="p-1.5 rounded transition-colors hover:bg-[var(--bg-hover)]"
                        style={{ color: isJobRunning ? 'var(--text-tertiary)' : 'var(--accent-red)', cursor: isJobRunning ? 'not-allowed' : 'pointer' }}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Live output during execution */}
                {isJobRunning && triggerRun && (
                  <div className="mt-2 rounded overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
                    <div className="flex items-center justify-between px-3 py-1.5" style={{ background: 'var(--accent-blue-dim)' }}>
                      <span className="text-xs font-medium flex items-center gap-1.5" style={{ color: 'var(--accent-blue)' }}>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Running... {triggerRun.elapsedMs > 0 && `(${Math.round(triggerRun.elapsedMs / 1000)}s)`}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        {triggerRun.output.length > 0 ? `${triggerRun.output.length} chars` : 'Waiting for output...'}
                      </span>
                    </div>
                    {triggerRun.output && (
                      <pre
                        className="px-3 py-2 text-xs overflow-auto whitespace-pre-wrap"
                        style={{
                          background: 'var(--bg-secondary)',
                          color: 'var(--text-primary)',
                          maxHeight: '200px',
                        }}
                      >
                        {triggerRun.output}
                      </pre>
                    )}
                  </div>
                )}

                {/* Finished run result (dismissible) */}
                {justFinished && (
                  <div className="mt-2 rounded overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
                    <div
                      className="flex items-center justify-between px-3 py-1.5"
                      style={{
                        background: triggerRun.status === 'completed' ? 'var(--accent-green-dim)' :
                                    triggerRun.status === 'failed' ? 'var(--accent-red-dim)' : 'var(--bg-hover)',
                      }}
                    >
                      <span
                        className="text-xs font-medium flex items-center gap-1.5"
                        style={{
                          color: triggerRun.status === 'completed' ? 'var(--accent-green)' :
                                 triggerRun.status === 'failed' ? 'var(--accent-red)' : 'var(--text-secondary)',
                        }}
                      >
                        {triggerRun.status === 'completed' && <><CheckCircle2 className="w-3 h-3" /> Completed in {Math.round(triggerRun.elapsedMs / 1000)}s</>}
                        {triggerRun.status === 'failed' && <><AlertCircle className="w-3 h-3" /> Failed after {Math.round(triggerRun.elapsedMs / 1000)}s</>}
                        {triggerRun.status === 'cancelled' && <><XCircle className="w-3 h-3" /> Cancelled after {Math.round(triggerRun.elapsedMs / 1000)}s</>}
                      </span>
                      <button
                        onClick={() => clearTriggerRun(job.id)}
                        className="text-xs px-2 py-0.5 rounded hover:bg-[var(--bg-hover)]"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        Dismiss
                      </button>
                    </div>
                    {triggerRun.output && (
                      <pre
                        className="px-3 py-2 text-xs overflow-auto whitespace-pre-wrap"
                        style={{
                          background: 'var(--bg-secondary)',
                          color: 'var(--text-primary)',
                          maxHeight: '200px',
                        }}
                      >
                        {triggerRun.output}
                      </pre>
                    )}
                    {triggerRun.error && (
                      <div className="px-3 py-2 text-xs" style={{ color: 'var(--accent-red)' }}>
                        {triggerRun.error}
                      </div>
                    )}
                  </div>
                )}

                {/* Historical state (only show when not actively running/just finished) */}
                {!isJobRunning && !justFinished && job.state && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs mt-3 pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                    <div>
                      <span style={{ color: 'var(--text-tertiary)' }}>Last Run</span>
                      <p style={{ color: 'var(--text-secondary)' }}>
                        {job.state.lastRunAtMs
                          ? new Date(job.state.lastRunAtMs).toLocaleString()
                          : 'Never'}
                      </p>
                    </div>
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
                      <p style={{ color: 'var(--text-secondary)' }}>
                        {job.state.lastDurationMs
                          ? `${Math.round(job.state.lastDurationMs / 1000)}s`
                          : '-'}
                      </p>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-tertiary)' }}>Errors</span>
                      <p
                        className={job.state.consecutiveErrors > 0 ? 'font-medium' : ''}
                        style={{ color: job.state.consecutiveErrors > 0 ? 'var(--accent-red)' : 'var(--text-secondary)' }}
                      >
                        {job.state.consecutiveErrors || 0}
                      </p>
                    </div>
                  </div>
                )}

                {!isJobRunning && !justFinished && job.state?.lastError && (
                  <div
                    className="mt-2 p-2 rounded text-xs break-all"
                    style={{ background: 'var(--accent-red-dim)', color: 'var(--accent-red)' }}
                  >
                    {job.state.lastError}
                  </div>
                )}

                {!isJobRunning && !justFinished && job.state?.lastOutput && (
                  <details className="mt-2">
                    <summary
                      className="text-xs cursor-pointer select-none"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Last Output ({job.state.lastOutput.length} chars)
                    </summary>
                    <pre
                      className="mt-1 p-2 rounded text-xs overflow-auto whitespace-pre-wrap"
                      style={{
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        maxHeight: '200px',
                        border: '1px solid var(--border-primary)',
                      }}
                    >
                      {job.state.lastOutput}
                    </pre>
                  </details>
                )}
              </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Create Trigger Dialog */}
      <CreateTriggerDialog isOpen={showCreateDialog} onClose={() => setShowCreateDialog(false)} />
    </div>
  )
}

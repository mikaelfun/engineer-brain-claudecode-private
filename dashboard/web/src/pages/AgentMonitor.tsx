/**
 * AgentMonitor — Agent/Session/Cron 监控页
 *
 * Unified view of all session types: case, implement, verify, track-creation.
 * Each session row is expandable to show live SSE messages and interaction controls.
 */
import { Card, CardHeader } from '../components/common/Card'
import { Badge } from '../components/common/Badge'
import { Loading, EmptyState } from '../components/common/Loading'
import { useAgents, useCronJobs, usePatrolState, useCancelPatrol, useUnifiedSessions, useCaseMessages } from '../api/hooks'
import type { UnifiedSession } from '../api/hooks'
import { usePatrolStore } from '../stores/patrolStore'
import { useCaseSessionStore, type CaseSessionMessage } from '../stores/caseSessionStore'
import { SessionMessageList } from '../components/session/SessionMessageList'
import { useQueryClient } from '@tanstack/react-query'
import { RefreshCw, ChevronDown, ChevronRight, Filter, Send, Square } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { apiPost, apiDelete } from '../api/client'

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

function SessionRow({ session, isExpanded, onToggle }: { session: UnifiedSession; isExpanded: boolean; onToggle: () => void }) {
  const typeConfig = SESSION_TYPE_CONFIG[session.type] || SESSION_TYPE_CONFIG.case

  // Format relative time
  const lastActivity = new Date(session.lastActivityAt)
  const now = new Date()
  const diffMs = now.getTime() - lastActivity.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const timeAgo = diffMins < 1 ? 'just now'
    : diffMins < 60 ? `${diffMins}m ago`
    : diffMins < 1440 ? `${Math.floor(diffMins / 60)}h ago`
    : `${Math.floor(diffMins / 1440)}d ago`

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

  // Non-case sessions: simple status text
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

/** Case session detail with live SSE messages, chat input, and stop button */
function CaseSessionDetail({ session }: { session: UnifiedSession }) {
  const caseNumber = session.context // case sessions use caseNumber as context
  const storeMessages = useCaseSessionStore(s => s.messages[caseNumber] || EMPTY_MESSAGES)
  const addMessage = useCaseSessionStore(s => s.addMessage)
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
      }
    }
  }, [recoveredData, storeMessages.length, caseNumber, addMessage])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [storeMessages.length])

  const isActive = session.status === 'active' || session.status === 'paused'

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
          />
        )}
      </div>

      {/* Chat input + Stop button for active sessions */}
      {isActive && (
        <div className="flex items-center gap-2 px-3 py-2 mt-1" style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
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
          <button
            onClick={handleStop}
            disabled={isStopping}
            className="flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors disabled:opacity-40"
            style={{ color: 'var(--accent-red)', background: 'var(--accent-red-dim)' }}
            title="Stop session"
          >
            <Square className="w-3 h-3" />
            Stop
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

  const cancelPatrol = useCancelPatrol()
  const queryClient = useQueryClient()
  const [refreshing, setRefreshing] = useState(false)

  // Expand/collapse per session
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null)

  // Filters
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  // Collapsed groups
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({})

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

  // Group by type
  const sessionsByType: Record<string, UnifiedSession[]> = {}
  for (const s of filteredSessions) {
    if (!sessionsByType[s.type]) sessionsByType[s.type] = []
    sessionsByType[s.type].push(s)
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

      {/* All Sessions — Grouped by Type */}
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
            {typeOrder
              .filter((t) => sessionsByType[t]?.length)
              .map((type) => {
                const sessions = sessionsByType[type]
                const config = SESSION_TYPE_CONFIG[type]
                const isCollapsed = collapsedGroups[type]
                const activeCount = sessions.filter((s) => s.status === 'active').length

                return (
                  <Card key={type}>
                    <button
                      onClick={() => toggleGroup(type)}
                      className="flex items-center justify-between w-full text-left"
                    >
                      <div className="flex items-center gap-2">
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
                      </div>
                    </button>

                    {!isCollapsed && (
                      <div className="mt-3 space-y-1.5">
                        {sessions.map((session) => (
                          <SessionRow
                            key={session.id}
                            session={session}
                            isExpanded={expandedSessionId === session.id}
                            onToggle={() => setExpandedSessionId(expandedSessionId === session.id ? null : session.id)}
                          />
                        ))}
                      </div>
                    )}
                  </Card>
                )
              })}
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
        <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Cron Jobs</h3>
        {cronJobs.length === 0 ? (
          <EmptyState icon="⏰" title="No cron jobs" />
        ) : (
          <div className="space-y-3">
            {cronJobs.map((job: any) => (
              <Card key={job.id}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{job.name}</h4>
                      <Badge variant={job.enabled ? 'success' : 'secondary'} size="xs">
                        {job.enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>Agent: {job.agentId}</p>
                  </div>
                  <Badge variant="primary" size="xs">
                    {job.schedule?.kind === 'cron' ? job.schedule.expr : job.schedule?.kind}
                  </Badge>
                </div>

                {job.state && (
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
                          variant={job.state.lastStatus === 'error' ? 'danger' : 'success'}
                          size="xs"
                        >
                          {job.state.lastStatus || 'unknown'}
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

                {job.state?.lastError && (
                  <div
                    className="mt-2 p-2 rounded text-xs break-all"
                    style={{ background: 'var(--accent-red-dim)', color: 'var(--accent-red)' }}
                  >
                    {job.state.lastError}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

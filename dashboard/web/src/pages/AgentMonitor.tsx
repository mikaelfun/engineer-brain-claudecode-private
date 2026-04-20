/**
 * AgentMonitor — Agent/Session 监控页
 *
 * Unified view of all session types: case, implement, verify, track-creation.
 * Two-panel "Active Sessions" layout with inline sub-agent tree.
 * Cron Jobs management has been moved to AutomationsPage.
 */
import { Card } from '../components/common/Card'
import { Badge } from '../components/common/Badge'
import { Loading, EmptyState } from '../components/common/Loading'
import { useAgents, useUnifiedSessions, useCaseMessages, useCancelTrigger, useCronMessages, usePatrolMessages, useRunMessages } from '../api/hooks'
import type { UnifiedSession } from '../api/hooks'
import { useCaseSessionStore, type CaseSessionMessage } from '../stores/caseSessionStore'
import { usePatrolAgentStore, type PatrolMainMessage } from '../stores/patrolAgentStore'
import { useIssueTrackStore, EMPTY_TRACK_MESSAGES, EMPTY_IMPLEMENT_MESSAGES, EMPTY_VERIFY_MESSAGES } from '../stores/issueTrackStore'
import type { IssueTrackMessage, ImplementMessage, VerifyMessage } from '../stores/issueTrackStore'
import { useSubAgentStore, type SubAgent } from '../stores/subAgentStore'
import { SessionMessageList } from '../components/session/SessionMessageList'
import { QueueStatusIndicator } from '../components/session/QueueStatusIndicator'
import { StepQuestionForm } from '../components/session/StepQuestionForm'
import { useQueryClient } from '@tanstack/react-query'
import { RefreshCw, ChevronDown, ChevronRight, Filter, Send, Square, Loader2, Trash } from 'lucide-react'
import { useState, useEffect, useRef, useMemo } from 'react'
import { apiPost, apiDelete } from '../api/client'
import { useTriggerRunStore } from '../stores/triggerRunStore'
import { DaemonStatusCard } from '../components/DaemonStatusCard'
import { AzProfileCard } from '../components/AzProfileCard'

const EMPTY_MESSAGES: CaseSessionMessage[] = []

// ---- Session type display config ----

const SESSION_TYPE_CONFIG: Record<string, { label: string; icon: string; bg: string; color: string }> = {
  case: { label: 'Case', icon: '📋', bg: 'var(--accent-blue-dim)', color: 'var(--accent-blue)' },
  queue: { label: 'Queue', icon: '🔄', bg: 'var(--accent-purple-dim, var(--accent-blue-dim))', color: 'var(--accent-purple, var(--accent-blue))' },
  implement: { label: 'Implement', icon: '🔧', bg: 'var(--accent-purple-dim, var(--accent-blue-dim))', color: 'var(--accent-purple, var(--accent-blue))' },
  verify: { label: 'Verify', icon: '🧪', bg: 'var(--accent-amber-dim)', color: 'var(--accent-amber)' },
  'track-creation': { label: 'Track', icon: '📝', bg: 'var(--accent-teal-dim, var(--accent-green-dim))', color: 'var(--accent-teal, var(--accent-green))' },
  patrol: { label: 'Patrol', icon: '🔍', bg: 'var(--accent-green-dim)', color: 'var(--accent-green)' },
  cron: { label: 'Cron', icon: '⏰', bg: 'var(--accent-amber-dim)', color: 'var(--accent-amber)' },
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
            maxHeightClass="max-h-[calc(100vh-220px)]"
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
            maxHeightClass="max-h-[calc(100vh-220px)]"
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
            maxHeightClass="max-h-[calc(100vh-220px)]"
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
  const subAgentHydrate = useSubAgentStore(s => s.hydrate)
  const containerRef = useRef<HTMLDivElement>(null)
  const [chatInput, setChatInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isStopping, setIsStopping] = useState(false)
  const hasRecoveredRef = useRef(false)
  const hasRecoveredSubAgentsRef = useRef(false)

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

  // Recover sub-agents from run-messages (session.jsonl + agents/*.log) on refresh
  // Also recover for 'active' sessions after backend restart (SSE ring buffer is empty)
  const existingSubAgents = useSubAgentStore(s => s.getByParent(sessionId))
  const needsSubAgentRecovery = existingSubAgents.length === 0
  const { data: runData } = useRunMessages(needsSubAgentRecovery ? caseNumber : null)
  useEffect(() => {
    if (runData?.subAgents && !hasRecoveredSubAgentsRef.current) {
      hasRecoveredSubAgentsRef.current = true
      for (const [taskId, sub] of Object.entries(runData.subAgents as Record<string, any>)) {
        subAgentHydrate({
          taskId,
          agentType: sub.agentType || taskId,
          source: 'casework',
          parentSessionId: sessionId,
          caseNumber,
          status: sub.status || 'completed',
          description: sub.description,
          startedAt: sub.startedAt || '',
          completedAt: sub.completedAt,
          summary: sub.summary,
          usage: sub.usage,
          messages: (sub.messages || []).map((m: any) => ({
            type: m.type || 'system',
            content: m.content || '',
            toolName: m.toolName,
            timestamp: m.timestamp || '',
          })),
        })
      }
    }
  }, [runData, subAgentHydrate, sessionId, caseNumber])

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
            maxHeightClass="max-h-[calc(100vh-260px)]"
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
  const containerRef = useRef<HTMLDivElement>(null)
  const durationMs = agent.usage?.duration_ms
    || (agent.completedAt && agent.startedAt
      ? new Date(agent.completedAt).getTime() - new Date(agent.startedAt).getTime()
      : agent.startedAt
        ? Date.now() - new Date(agent.startedAt).getTime()
        : undefined)

  // Check if messages are incomplete (only system/tool-call/completed from main agent's task_progress)
  const hasDetailedMessages = (agent.messages || []).some(m =>
    m.type === 'thinking' || m.type === 'response' || m.type === 'tool-result'
  )

  // If agent has a caseNumber and messages are incomplete, fetch full log from case run
  const { data: runData } = useRunMessages(
    (!hasDetailedMessages && agent.caseNumber && agent.status !== 'running') ? agent.caseNumber : null
  )

  // Convert messages: prefer full log from run, fallback to agent.messages
  const messages = useMemo((): CaseSessionMessage[] => {
    // Try to find this agent's full log in runData.subAgents
    if (runData?.subAgents) {
      for (const sub of Object.values(runData.subAgents as Record<string, any>)) {
        if (sub.messages?.length > 0 && sub.messages.some((m: any) => m.type === 'thinking' || m.type === 'response' || m.type === 'tool-result')) {
          // Match by taskId prefix or agentType
          const isMatch = sub.taskId === agent.taskId
            || agent.taskId.startsWith(sub.taskId?.slice(0, 8) || '__none__')
            || sub.taskId?.startsWith(agent.taskId.slice(0, 8))
          if (isMatch) {
            return sub.messages.map((m: any) => ({
              type: m.type as CaseSessionMessage['type'],
              content: m.content || '',
              toolName: m.toolName,
              timestamp: m.timestamp,
            }))
          }
        }
      }
      // No exact match — if there's only one sub-agent with full messages, use it
      const fullSubs = Object.values(runData.subAgents as Record<string, any>)
        .filter((s: any) => s.messages?.some((m: any) => m.type === 'thinking' || m.type === 'response'))
      if (fullSubs.length === 1) {
        return (fullSubs[0] as any).messages.map((m: any) => ({
          type: m.type as CaseSessionMessage['type'],
          content: m.content || '',
          toolName: m.toolName,
          timestamp: m.timestamp,
        }))
      }
    }

    // Fallback: use agent.messages from store
    return (agent.messages || []).map(m => ({
      type: m.type as CaseSessionMessage['type'],
      content: m.content,
      toolName: m.toolName,
      timestamp: m.timestamp,
    }))
  }, [agent.messages, agent.taskId, runData])

  // Auto-scroll on new messages
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [messages.length])

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Compact header: type + case + status + duration */}
      <div className="flex items-center gap-2 flex-wrap px-1 pb-2 flex-shrink-0" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <AgentTypeBadge type={agent.agentType} />
        {agent.caseNumber && (
          <span className="text-xs font-mono" style={{ color: 'var(--text-primary)' }}>{agent.caseNumber}</span>
        )}
        <Badge
          variant={agent.status === 'running' ? 'primary' : agent.status === 'completed' ? 'success' : agent.status === 'failed' ? 'danger' : 'secondary'}
          size="xs"
        >
          {agent.status}
        </Badge>
        {durationMs !== undefined && (
          <span className="text-[10px] font-mono ml-auto" style={{ color: 'var(--text-tertiary)' }}>
            {formatDuration(durationMs)}
          </span>
        )}
        {agent.usage?.total_tokens && (
          <span className="text-[10px] font-mono" style={{ color: 'var(--text-tertiary)' }}>
            {agent.usage.total_tokens.toLocaleString()} tok
          </span>
        )}
      </div>

      {/* Message stream */}
      <div ref={containerRef} className="flex-1 overflow-y-auto pt-2" style={{ maxHeight: 'calc(100vh - 300px)' }}>
        {messages.length === 0 ? (
          <p className="text-xs py-2" style={{ color: 'var(--text-tertiary)' }}>
            {agent.status === 'running' ? 'Waiting for events...' : 'No events recorded'}
          </p>
        ) : (
          <SessionMessageList messages={messages} maxHeightClass="" />
        )}
      </div>
    </div>
  )
}

// ---- Active Sessions Section ----

/** Convert PatrolMainMessage kind to CaseSessionMessage type */
function patrolKindToType(kind: string): CaseSessionMessage['type'] {
  switch (kind) {
    case 'tool-call': return 'tool-call'
    case 'tool-result': return 'tool-result'
    case 'response': return 'response'
    default: return 'thinking'
  }
}

/** Patrol session detail — reads live SSE from patrolAgentStore + recovers from API on refresh */
function PatrolSessionDetail({ session }: { session: UnifiedSession }) {
  const mainMessages = usePatrolAgentStore(s => s.mainMessages)
  const storeSessionId = usePatrolAgentStore(s => s.sessionId)
  const containerRef = useRef<HTMLDivElement>(null)
  const hasRecoveredRef = useRef(false)
  const subAgentHydrate = useSubAgentStore(s => s.hydrate)

  const isActive = session.status === 'active'
  const logFile = (session.metadata?.logFile as string) || null
  const isRecovered = !!session.metadata?.recovered

  // Recovery: for recovered sessions, fetch by logFile; for live, use store or latest
  // Also trigger recovery when store messages belong to a different session
  const sessionIdMismatch = !!(storeSessionId && session.id && storeSessionId !== session.id)
  const needsRecovery = isRecovered || mainMessages.length === 0 || sessionIdMismatch
  const { data: recoveredData } = usePatrolMessages(logFile, needsRecovery)

  // Hydrate subAgentStore from recovered sub-agent data (with full messages)
  useEffect(() => {
    if (recoveredData?.subAgents && !hasRecoveredRef.current) {
      hasRecoveredRef.current = true
      for (const [taskId, sub] of Object.entries(recoveredData.subAgents as Record<string, any>)) {
        subAgentHydrate({
          taskId,
          agentType: sub.agentType || taskId,
          source: 'patrol',
          parentSessionId: session.id,
          caseNumber: sub.caseNumber,
          status: sub.status || 'completed',
          description: sub.description,
          startedAt: sub.startedAt || '',
          completedAt: sub.completedAt,
          summary: sub.summary,
          usage: sub.usage,
          messages: (sub.messages || []).map((m: any) => ({
            type: m.type || 'system',
            content: m.content || '',
            toolName: m.toolName,
            timestamp: m.timestamp || '',
          })),
        })
      }
    }
  }, [recoveredData, subAgentHydrate, session.id])

  // Convert store messages or recovered messages into CaseSessionMessage[]
  const messages = useMemo((): CaseSessionMessage[] => {
    // For live (non-recovered) sessions, prefer in-memory store —
    // but ONLY if store messages belong to this session (sessionId match)
    const sessionIdMatch = !session.id || !storeSessionId || storeSessionId === session.id
    if (!isRecovered && mainMessages.length > 0 && sessionIdMatch) {
      return mainMessages.map(m => ({
        type: patrolKindToType(m.kind),
        content: m.content || '',
        toolName: m.toolName,
        timestamp: m.timestamp,
      }))
    }

    // Recovered or empty store → use API data
    if (recoveredData?.messages) {
      return recoveredData.messages.map((m: any) => ({
        type: patrolKindToType(m.kind || m.type),
        content: m.content || '',
        toolName: m.toolName,
        timestamp: m.timestamp,
      }))
    }

    return []
  }, [isRecovered, mainMessages, recoveredData, storeSessionId, session.id])

  // Client-side elapsed timer
  const startedAt = session.startedAt
  const [localElapsed, setLocalElapsed] = useState(0)

  useEffect(() => {
    if (!isActive || !startedAt) {
      setLocalElapsed(0)
      return
    }
    setLocalElapsed(Date.now() - new Date(startedAt).getTime())
    const timer = setInterval(() => {
      setLocalElapsed(Date.now() - new Date(startedAt).getTime())
    }, 1000)
    return () => clearInterval(timer)
  }, [isActive, startedAt])

  // Auto-scroll
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [messages.length])

  return (
    <div className="rounded-lg overflow-hidden h-full flex flex-col" style={{ border: '1px solid var(--border-subtle)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5" style={{
        background: isActive ? 'var(--accent-green-dim)' : 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <span className="text-xs font-medium flex items-center gap-1.5" style={{ color: 'var(--accent-green)' }}>
          {isActive && <Loader2 className="w-3 h-3 animate-spin" />}
          🔍 {session.intent || 'Patrol'}
          {localElapsed > 0 ? ` (${Math.round(localElapsed / 1000)}s)` : ''}
        </span>
      </div>

      {/* Message stream */}
      <div ref={containerRef} className="flex-1 overflow-y-auto px-3 py-2" style={{ maxHeight: 'calc(100vh - 240px)' }}>
        {messages.length === 0 ? (
          <p className="text-xs py-2" style={{ color: 'var(--text-tertiary)' }}>
            {isActive ? 'Waiting for messages...' : 'No messages recorded'}
          </p>
        ) : (
          <SessionMessageList
            messages={messages}
            maxHeightClass=""
          />
        )}
      </div>
    </div>
  )
}

/** Cron session detail — reads live output from triggerRunStore, recovers from API on refresh */
function CronSessionDetail({ session }: { session: UnifiedSession }) {
  const triggerId = session.context
  const triggerRun = useTriggerRunStore(s => s.runs[triggerId])
  const containerRef = useRef<HTMLDivElement>(null)
  const hasRecoveredRef = useRef(false)
  const cancelTriggerMut = useCancelTrigger()

  // Client-side elapsed timer — ticks every second while running,
  // independent of SSE events (fixes frozen timer during long Bash commands)
  const isRunning = triggerRun?.status === 'running'
  const startedAt = triggerRun?.startedAt
  const [localElapsed, setLocalElapsed] = useState(0)

  useEffect(() => {
    if (!isRunning || !startedAt) {
      // Show final elapsedMs from server when not running
      setLocalElapsed(triggerRun?.elapsedMs || 0)
      return
    }
    // Immediately compute current elapsed
    setLocalElapsed(Date.now() - startedAt)
    const timer = setInterval(() => {
      setLocalElapsed(Date.now() - startedAt)
    }, 1000)
    return () => clearInterval(timer)
  }, [isRunning, startedAt, triggerRun?.elapsedMs])

  // Recovery: fetch messages from backend if triggerRunStore is empty (page refresh scenario)
  const { data: recoveredData } = useCronMessages(
    triggerRun ? null : triggerId  // only fetch if store is empty
  )

  // Convert triggerRun.messages or recovered messages into CaseSessionMessage[] for rendering
  const messages = useMemo((): CaseSessionMessage[] => {
    // Prefer live structured messages from triggerRunStore
    if (triggerRun?.messages && triggerRun.messages.length > 0) {
      return triggerRun.messages
    }

    // Fallback: recovered messages from getCronMessages() API
    if (recoveredData?.messages && !hasRecoveredRef.current) {
      hasRecoveredRef.current = true
      return recoveredData.messages.map((m: any) => ({
        type: m.kind === 'tool-call' ? 'tool-call' as const
          : m.kind === 'tool-result' ? 'tool-result' as const
          : m.kind === 'response' ? 'response' as const
          : m.kind?.startsWith('agent-') ? 'system' as const
          : 'thinking' as const,
        content: m.content || '',
        toolName: m.toolName,
        timestamp: m.timestamp,
      }))
    }

    return []
  }, [triggerRun?.messages, recoveredData])

  const isActive = session.status === 'active'

  // Auto-scroll
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [messages.length])

  return (
    <div className="rounded-lg overflow-hidden h-full flex flex-col" style={{ border: '1px solid var(--border-subtle)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5" style={{
        background: isActive ? 'var(--accent-amber-dim)' : 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <span className="text-xs font-medium flex items-center gap-1.5" style={{ color: 'var(--accent-amber)' }}>
          {isActive && <Loader2 className="w-3 h-3 animate-spin" />}
          ⏰ Cron: {session.intent || triggerId}
          {localElapsed ? ` (${Math.round(localElapsed / 1000)}s)` : ''}
        </span>
        {isActive && (
          <button
            onClick={() => cancelTriggerMut.mutate(triggerId)}
            disabled={cancelTriggerMut.isPending}
            className="flex items-center gap-1 px-2 py-0.5 text-xs rounded transition-colors"
            style={{ color: 'var(--accent-red)', background: 'var(--accent-red-dim)' }}
          >
            <Square className="w-3 h-3" />
            Cancel
          </button>
        )}
      </div>

      {/* Message stream */}
      <div className="px-3 pt-2 flex-1 min-h-0">
        {messages.length === 0 ? (
          <p className="text-xs py-2" style={{ color: 'var(--text-tertiary)' }}>
            {isActive ? 'Waiting for output...' : 'No messages recorded'}
          </p>
        ) : (
          <SessionMessageList
            messages={messages}
            containerRef={containerRef}
            maxHeightClass="max-h-[calc(100vh-260px)]"
          />
        )}
      </div>
    </div>
  )
}

/** Renders the appropriate session detail based on session type */
function SessionDetailByType({ session }: { session: UnifiedSession }) {
  if (session.type === 'case') return <CaseSessionDetail session={session} />
  if (session.type === 'patrol') return <PatrolSessionDetail session={session} />
  if (session.type === 'implement') return <ImplementSessionDetail session={session} />
  if (session.type === 'verify') return <VerifySessionDetail session={session} />
  if (session.type === 'track-creation') return <TrackCreationSessionDetail session={session} />
  if (session.type === 'cron') return <CronSessionDetail session={session} />

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
      <div className="flex items-center justify-center h-full min-h-[300px] rounded-lg" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
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
        onClick={() => { onSelectMain(); if (subAgents.length > 0) onToggleSubList() }}
        className="flex items-center justify-between py-2.5 px-3 w-full text-left transition-colors"
        style={{
          background: isSelected ? 'var(--bg-active)' : 'transparent',
          borderBottom: '1px solid var(--border-subtle)',
        }}
        onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)' }}
        onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = isSelected ? 'var(--bg-active)' : 'transparent' }}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Expand chevron (replaces sub-agents button) — doubles as click-to-select when no subs */}
          {subAgents.length > 0 ? (
            <span className="flex-shrink-0" style={{ color: runningSubCount > 0 ? 'var(--accent-blue)' : 'var(--text-tertiary)' }}>
              {isSubExpanded
                ? <ChevronDown className="w-3.5 h-3.5" />
                : <ChevronRight className="w-3.5 h-3.5" />
              }
            </span>
          ) : (
            <span className="w-3.5 flex-shrink-0" /> /* spacer for alignment */
          )}
          <StatusDot status={session.status} />
          <SessionTypeBadge type={session.type} />
          {/* Context: skip if same as type label (e.g. patrol/patrol) */}
          {session.context !== session.type && (
            <span
              className="text-sm font-mono truncate"
              style={{ color: typeConfig.color }}
            >
              {session.context}
            </span>
          )}
          {/* Intent: skip if redundant with type (e.g. "Patrol run" when badge says Patrol) */}
          {session.intent && !session.intent.toLowerCase().startsWith(session.type) && (
            <span
              className="text-xs truncate max-w-[200px] hidden lg:inline"
              style={{ color: 'var(--text-tertiary)' }}
            >
              {session.intent}
            </span>
          )}
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
          {/* Sub-agent count badge (compact, no toggle — chevron is on the left) */}
          {subAgents.length > 0 && (
            <span
              className="text-[10px] font-mono px-1.5 py-0.5 rounded"
              style={{
                background: 'var(--bg-inset)',
                color: runningSubCount > 0 ? 'var(--accent-blue)' : 'var(--text-tertiary)',
              }}
            >
              {subAgents.length} sub{runningSubCount > 0 && (
                <span className="inline-block w-1.5 h-1.5 rounded-full animate-pulse ml-1" style={{ background: 'var(--accent-blue)' }} />
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
      map[key].sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime())
    }
    return map
  }, [allSubAgents])

  /** Lookup sub-agents for a session.
   *  For patrol sessions, sub-agents use parentSessionId='patrol' (sentinel),
   *  so also check session.context as fallback. */
  const getSubAgentsForSession = (session: UnifiedSession): SubAgent[] => {
    const byId = subAgentsBySession[session.id]
    if (byId && byId.length > 0) return byId
    // Fallback: match by context (covers patrol sentinel and similar cases)
    if (session.context && session.context !== session.id) {
      return subAgentsBySession[session.context] || []
    }
    return []
  }

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
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4" style={{ minHeight: 'calc(100vh - 280px)' }}>
          {/* Left panel: scrollable agent list */}
          <Card padding="none">
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 220px)' }}>
              {/* Active/Recent sessions */}
              {activeSessions.map((session) => (
                <MainAgentRow
                  key={session.id}
                  session={session}
                  isSelected={selectedMainId === session.id}
                  subAgents={getSubAgentsForSession(session)}
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
                      subAgents={getSubAgentsForSession(session)}
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

// ---- Main Component ----

export default function AgentMonitor() {
  const { data: agentsData, isLoading: agentsLoading } = useAgents()

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
      queryClient.invalidateQueries({ queryKey: ['sessions'] }),
    ]).finally(() => {
      setTimeout(() => setRefreshing(false), 500)
    })
  }

  if (agentsLoading) return <Loading text="Loading agents..." />

  const agents = agentsData?.agents || []
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
  const typeOrder = ['case', 'patrol', 'queue', 'implement', 'verify', 'track-creation']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Monitor</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
            {activeSessions.length} active | {allSessions.length} total sessions
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

      {/* Token Daemon + Az Profiles — side by side, equal width */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="min-w-0">
          <DaemonStatusCard />
        </div>
        <div className="min-w-0">
          <AzProfileCard />
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
    </div>
  )
}

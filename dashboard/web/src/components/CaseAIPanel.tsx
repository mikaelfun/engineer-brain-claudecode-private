/**
 * CaseAIPanel — AI assistant (design system v2)
 *
 * Two modes:
 * - `compact` — sidebar: quick action buttons + jump-to-tab button + status indicator
 * - `full`    — tab pane: full-width with grid actions + messages + chat input + session management
 */
import { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles, Search, Mail, Play, X, Send,
  CheckCircle2, Loader2, Brain, AlertCircle, ChevronDown,
  RefreshCw, MessageSquare, GitBranch, FileText, BookOpen,
  ChevronRight, Maximize2, ExternalLink, Square, Shield, Zap, Clock
} from 'lucide-react'
import { apiPost, apiDelete } from '../api/client'
import { useCaseSessions, useCaseOperation, useCaseMessages, useEndAllCaseSessions, useEndCaseSession, useCaseStepProgress, useSkills } from '../api/hooks'
import { useCaseSessionStore, type CaseSessionMessage } from '../stores/caseSessionStore'
import { SessionMessageList, groupMessagesByStep } from './session/SessionMessageList'
import { StepQuestionForm } from './session/StepQuestionForm'
import { StepFilterTabs } from './session/StepFilterTabs'
import { StallWarningBanner } from './session/StallWarningBanner'
import { QueueStatusIndicator } from './session/QueueStatusIndicator'

interface CaseAIPanelProps {
  caseNumber: string
  mode?: 'compact' | 'full'
  onOpenFull?: () => void
  /** Skip recovery hydration — used by compact panel instances to prevent
   *  dual-hydration when both full and compact panels coexist (ISS-091) */
  skipRecovery?: boolean
}

type AIAction = 'process' | string

/** A chat message queued locally while a step is executing */
export interface QueuedMessage {
  id: string
  content: string
  timestamp: string
  status: 'queued' | 'sending' | 'sent' | 'failed'
}

const EMPTY_MESSAGES: CaseSessionMessage[] = []

/** Map session intent text → action button label */
const INTENT_LABEL_MAP: Array<[RegExp, string]> = [
  [/full.?casework|Full Process/i, 'Full Process'],
  [/data-refresh/i, 'Refresh'],
  [/compliance-check/i, 'Compliance'],
  [/status-judge/i, 'Status'],
  [/teams-search/i, 'Teams'],
  [/troubleshoot/i, 'Troubleshoot'],
  [/draft-email|email-drafter/i, 'Email'],
  [/inspection/i, 'Summary'],
  [/generate-kb|Knowledge Base/i, 'KB'],
  [/patrol/i, 'Patrol'],
]

function getSessionLabel(session: { intent?: string; sessionId: string }): string {
  if (session.intent) {
    for (const [re, label] of INTENT_LABEL_MAP) {
      if (re.test(session.intent)) return label
    }
    return session.intent.length > 16 ? session.intent.slice(0, 16) + '…' : session.intent
  }
  return session.sessionId.slice(0, 8)
}

export default function CaseAIPanel({ caseNumber, mode = 'full', onOpenFull, skipRecovery = false }: CaseAIPanelProps) {
  const navigate = useNavigate()
  const [chatInput, setChatInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailTypeMenuOpen, setEmailTypeMenuOpen] = useState(false)
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [activeStepFilter, setActiveStepFilter] = useState<string | null>(null)
  const [queuedMessages, setQueuedMessages] = useState<QueuedMessage[]>([])
  const [isDraining, setIsDraining] = useState(false)
  const emailMenuRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const { data: sessionsData } = useCaseSessions(caseNumber)
  const activeSessionId = sessionsData?.activeSession || null
  const isLiveRunning = !!activeSessionId
  const allSessions = sessionsData?.sessions || []
  const endAllSessions = useEndAllCaseSessions()
  const endCaseSession = useEndCaseSession()
  // Filter: only active/paused sessions (exclude completed)
  const activeSessions = useMemo(
    () => allSessions.filter((s: any) => s.status !== 'completed'),
    [allSessions],
  )

  const { data: operationData } = useCaseOperation(caseNumber)
  const activeOperation = operationData?.operation || null
  const hasActiveOperation = !!activeOperation

  // Per-case status from caseSessionStore (unified)
  const caseStatus = useCaseSessionStore((s) => s.getSessionStatus(caseNumber))
  const isStepActive = caseStatus === 'active' || caseStatus === 'waiting-input'
  const isActionDisabled = isProcessing || hasActiveOperation || isStepActive

  // Pending question from caseSessionStore
  const pendingQuestion = useCaseSessionStore((s) => s.getPendingQuestion(caseNumber))

  // Per-case current step
  const currentStep = useCaseSessionStore((s) => s.currentStep[caseNumber])

  // Queue status (global) from caseSessionStore
  const queueStatus = useCaseSessionStore((s) => s.queueStatus)

  // Stall detection: compare lastHeartbeatAt with current time every 5s
  const lastHeartbeat = useCaseSessionStore((s) => s.lastHeartbeatAt[caseNumber])
  const [isStalled, setIsStalled] = useState(false)

  useEffect(() => {
    if (!isStepActive) {
      setIsStalled(false)
      return
    }
    const checkStall = () => {
      if (!lastHeartbeat) { setIsStalled(false); return }
      const elapsed = Date.now() - new Date(lastHeartbeat).getTime()
      setIsStalled(elapsed > 30_000)
    }
    checkStall()
    const timer = setInterval(checkStall, 5_000)
    return () => clearInterval(timer)
  }, [isStepActive, lastHeartbeat])

  // Store-tracked active session ID (from SSE events → caseSessionStore)
  const storeActiveSessionId = useCaseSessionStore((s) => s.activeSessionId[caseNumber])

  /** Background actions can run concurrently — only disabled when the same action is already running */
  const BACKGROUND_ACTIONS: ReadonlySet<AIAction> = new Set(['teams-search'])
  const isDisabledFor = (action: AIAction) => {
    if (BACKGROUND_ACTIONS.has(action)) {
      // Background actions only block if same step type is already running
      // Use caseSessionStore currentStep to check
      const currentStepName = useCaseSessionStore.getState().currentStep[caseNumber]
      return isStepActive && currentStepName === action
    }
    return isActionDisabled
  }

  // Determine the effective selected session:
  // - If user selected a tab, use that
  // - Otherwise use the store's active session
  const effectiveSessionId = selectedSessionId || storeActiveSessionId || activeSessions[0]?.sessionId || null

  // Messages: read from caseSessionStore unified per-case timeline
  const timelineMessages = useCaseSessionStore((s) => s.messages[caseNumber] ?? EMPTY_MESSAGES)
  const clearMessages = useCaseSessionStore((s) => s.clearMessages)

  // Step groups for filter tabs — computed from caseSessionStore timeline
  const stepGroups = useMemo(() => groupMessagesByStep(timelineMessages), [timelineMessages])

  // Filtered messages when a step filter is active
  const filteredMessages = useMemo(() => {
    if (!activeStepFilter) return timelineMessages
    const group = stepGroups.find(g => g.stepName === activeStepFilter)
    return group?.messages ?? EMPTY_MESSAGES
  }, [activeStepFilter, timelineMessages, stepGroups])

  // Use filtered messages as the effective display source
  const effectiveMessages = filteredMessages

  // Auto-select new session when a new step starts (via caseSessionStore)
  useEffect(() => {
    if (storeActiveSessionId && storeActiveSessionId !== selectedSessionId) {
      setSelectedSessionId(storeActiveSessionId)
    }
  }, [storeActiveSessionId])

  const { data: persistedData } = useCaseMessages(skipRecovery ? '' : caseNumber)
  const hasRecoveredRef = useRef(false)

  useEffect(() => {
    if (skipRecovery) return // compact panels skip recovery to prevent dual-hydration (ISS-091)
    if (
      persistedData?.messages?.length &&
      effectiveMessages.length === 0 &&
      !hasRecoveredRef.current
    ) {
      hasRecoveredRef.current = true
      const addMessage = useCaseSessionStore.getState().addMessage
      for (const msg of persistedData.messages) {
        addMessage(caseNumber, {
          type: msg.type as CaseSessionMessage['type'],
          content: msg.content,
          toolName: msg.toolName,
          step: msg.step,
          timestamp: msg.timestamp,
        })
      }
    }
  }, [persistedData, effectiveMessages.length, caseNumber, skipRecovery])

  // Step progress recovery — hydrate caseSessionStore on page refresh
  const hasStepRecoveredRef = useRef(false)
  const needsStepRecovery = !skipRecovery && timelineMessages.length === 0 && !hasStepRecoveredRef.current
  const { data: stepProgressData } = useCaseStepProgress(skipRecovery ? '' : caseNumber, needsStepRecovery)

  useEffect(() => {
    if (skipRecovery) return // compact panels skip recovery to prevent dual-hydration (ISS-091)
    if (stepProgressData && !hasStepRecoveredRef.current) {
      hasStepRecoveredRef.current = true
      const store = useCaseSessionStore.getState()
      if (stepProgressData.messages?.length) {
        // Determine status from step progress data
        const status = stepProgressData.pendingQuestion ? 'waiting-input' as const
          : stepProgressData.isActive ? 'active' as const
          : 'completed' as const
        // Populate caseSessionStore unified timeline
        const KIND_TO_TYPE: Record<string, CaseSessionMessage['type']> = {
          started: 'system', thinking: 'thinking', 'tool-call': 'tool-call',
          'tool-result': 'tool-result', completed: 'completed', error: 'failed', question: 'system',
        }
        for (const msg of stepProgressData.messages) {
          const msgKind = (msg as any).kind || ''
          store.addMessage(caseNumber, {
            type: KIND_TO_TYPE[msgKind] || (msg as any).type || 'system',
            content: msg.content || (msg as any).error || '',
            toolName: msg.toolName,
            step: msg.step,
            timestamp: msg.timestamp,
          })
        }
        // Set status and current step
        store.setSessionStatus(caseNumber, status)
        if (stepProgressData.currentStep) {
          store.setCurrentStep(caseNumber, stepProgressData.currentStep)
        }
      }
      // Recover pending question
      if (stepProgressData.pendingQuestion && !pendingQuestion) {
        store.setPendingQuestion(caseNumber, stepProgressData.pendingQuestion.sessionId, stepProgressData.pendingQuestion.questions)
      }
    }
  }, [stepProgressData, caseNumber, pendingQuestion])

  // Auto-scroll to bottom when messages change.
  useEffect(() => {
    const container = messagesContainerRef.current
    if (container) {
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight
      })
    }
  }, [timelineMessages])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (emailMenuRef.current && !emailMenuRef.current.contains(e.target as Node)) {
        setEmailTypeMenuOpen(false)
      }
    }
    if (emailTypeMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [emailTypeMenuOpen])

  const EMAIL_TYPES = [
    { value: 'auto', label: 'AI Auto-detect' },
    { value: 'initial-response', label: 'Initial Response' },
    { value: 'follow-up', label: 'Follow-up' },
    { value: 'status-update', label: 'Status Update' },
    { value: 'closure', label: 'Closure' },
    { value: 'escalation', label: 'Escalation' },
  ] as const

  const handleAction = async (action: AIAction, emailType?: string) => {
    if (hasActiveOperation && !BACKGROUND_ACTIONS.has(action)) {
      setError(`Operation already running: ${activeOperation!.operationType}`)
      return
    }

    setIsProcessing(true)
    setError(null)
    // Reset for new action: clear previous messages and status
    useCaseSessionStore.getState().clearAll(caseNumber)
    setActiveStepFilter(null)

    try {
      if (action === 'process') {
        await apiPost<{ status: string; caseNumber: string }>(
          `/case/${caseNumber}/process`,
          { intent: 'Full casework processing' }
        )
      } else {
        const body: Record<string, string> = {}
        if (action === 'draft-email' && emailType) {
          body.emailType = emailType
        }
        await apiPost<{ status: string; caseNumber: string; step: string }>(
          `/case/${caseNumber}/step/${action}`,
          Object.keys(body).length > 0 ? body : undefined
        )
      }
    } catch (err: any) {
      if (err?.status === 409) {
        setError('This case already has an active operation running. Please wait for it to complete.')
      } else {
        setError(err?.message || 'Failed to start action')
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const handleChat = async () => {
    // Chat routes to the real backend session (not the display filter)
    const chatSessionId = activeSessionId || activeSessions[0]?.sessionId || null
    if (!chatInput.trim()) return
    const message = chatInput.trim()
    setChatInput('')

    // If step is active or we're draining the queue, queue the message locally
    if (isStepActive || isDraining) {
      const queuedMsg: QueuedMessage = {
        id: `queued-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        content: message,
        timestamp: new Date().toISOString(),
        status: 'queued',
      }
      setQueuedMessages(prev => [...prev, queuedMsg])
      // Also show in the session message list as a user message with queued indicator
      useCaseSessionStore.getState().addMessage(caseNumber, {
        type: 'queued',
        content: message,
        timestamp: queuedMsg.timestamp,
      })
      return
    }

    useCaseSessionStore.getState().addMessage(caseNumber, {
      type: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    })

    try {
      await apiPost(`/case/${caseNumber}/chat`, {
        ...(chatSessionId ? { sessionId: chatSessionId } : {}),
        message,
      })
    } catch (err: any) {
      useCaseSessionStore.getState().addMessage(caseNumber, {
        type: 'failed',
        content: err?.message || 'Failed to send message',
        timestamp: new Date().toISOString(),
      })
    }
  }

  // ---- Auto-drain queued messages when step completes ----
  const prevIsStepActiveRef = useRef(isStepActive)

  useEffect(() => {
    const wasActive = prevIsStepActiveRef.current
    prevIsStepActiveRef.current = isStepActive

    // Detect transition: step was active → now idle, and we have queued messages
    if (wasActive && !isStepActive && queuedMessages.length > 0) {
      drainQueue()
    }
  }, [isStepActive]) // eslint-disable-line react-hooks/exhaustive-deps

  /** Drain queued messages sequentially via POST /case/:id/chat */
  async function drainQueue() {
    const chatSessionId = activeSessionId || activeSessions[0]?.sessionId
    if (!chatSessionId) return

    setIsDraining(true)
    const toSend = [...queuedMessages]

    for (const qMsg of toSend) {
      // Update status to "sending"
      setQueuedMessages(prev =>
        prev.map(m => m.id === qMsg.id ? { ...m, status: 'sending' as const } : m)
      )

      try {
        // Replace the "queued" message in the stream with a normal "user" message
        // (The queued one is already shown; we add a user-type so the response context is clear)
        useCaseSessionStore.getState().addMessage(caseNumber, {
          type: 'user',
          content: qMsg.content,
          timestamp: new Date().toISOString(),
        })

        await apiPost(`/case/${caseNumber}/chat`, {
          sessionId: chatSessionId,
          message: qMsg.content,
        })

        // Remove from queue on success
        setQueuedMessages(prev => prev.filter(m => m.id !== qMsg.id))
      } catch (err: any) {
        // Mark as failed, keep remaining in queue
        setQueuedMessages(prev =>
          prev.map(m => m.id === qMsg.id ? { ...m, status: 'failed' as const } : m)
        )
        useCaseSessionStore.getState().addMessage(caseNumber, {
          type: 'failed',
          content: `Failed to send queued message: ${err?.message || 'Unknown error'}`,
          timestamp: new Date().toISOString(),
        })
        break // Stop draining on first error
      }
    }

    setIsDraining(false)
  }

  const handleDismissTab = (_targetId: string) => {
    // Mark as completed in the store, then end the underlying SDK session
    useCaseSessionStore.getState().setSessionStatus(caseNumber, 'completed')
    // End the SDK session so buttons are released
    if (activeSessionId) {
      apiDelete(`/case/${caseNumber}/session`, { sessionId: activeSessionId }).catch(() => {})
    }
  }

  const handleEndSession = async () => {
    // Cancel the active step execution
    try {
      await apiPost(`/case/${caseNumber}/step-cancel`, {})
    } catch {
      // Fallback: try ending the SDK session directly
      if (activeSessionId) {
        await apiDelete(`/case/${caseNumber}/session`, { sessionId: activeSessionId }).catch(() => {})
      }
    }
    // Mark as failed (cancelled) in caseSessionStore
    useCaseSessionStore.getState().setSessionStatus(caseNumber, 'failed')
  }

  const { data: skills } = useSkills()

  const SKILL_ICONS: Record<string, typeof RefreshCw> = {
    'data-refresh': RefreshCw,
    'teams-search': MessageSquare,
    'troubleshoot': Search,
    'inspection': FileText,
    'inspection-writer': FileText,
    'generate-kb': BookOpen,
    'compliance-check': Shield,
    'labor-estimate': Clock,
    'note-gap': FileText,
    'onenote-case-search': Search,
  }

  const SKILL_COLORS: Record<string, string> = {
    'data-refresh': 'var(--accent-blue)',
    'teams-search': 'var(--accent-purple)',
    'troubleshoot': 'var(--accent-red)',
    'inspection-writer': 'var(--accent-blue)',
    'generate-kb': 'var(--accent-purple)',
    'labor-estimate': 'var(--accent-green)',
    'note-gap': 'var(--accent-amber)',
    'onenote-case-search': 'var(--accent-purple)',
  }

  // Only show case-relevant skills as quick actions
  const CASE_SKILL_ALLOWLIST = new Set([
    'data-refresh', 'troubleshoot', 'inspection-writer',
    'generate-kb', 'teams-search', 'labor-estimate', 'note-gap',
    'onenote-case-search',
  ])

  const quickActions = [
    // From skill registry
    ...(skills ?? [])
      .filter(s => CASE_SKILL_ALLOWLIST.has(s.name))
      .map(s => ({
        id: (s.webUiAlias || s.name) as AIAction,
        icon: SKILL_ICONS[s.webUiAlias || s.name] || SKILL_ICONS[s.name] || Zap,
        label: s.displayName,
        color: SKILL_COLORS[s.webUiAlias || s.name] || SKILL_COLORS[s.name] || 'var(--accent-blue)',
      })),
    // Agent-based actions (not in skill registry)
    { id: 'onenote-case-search' as AIAction, icon: Search, label: 'OneNote 搜索', color: 'var(--accent-purple)' },
  ]

  // ========== COMPACT MODE ==========
  if (mode === 'compact') {
    return (
      <div
        className="rounded-xl sticky top-20"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" style={{ color: 'var(--accent-blue)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>AI Assistant</span>
          </div>
        </div>

        <div className="p-3 space-y-2">
          {/* Primary CTA */}
          <button
            onClick={() => handleAction('process')}
            disabled={isActionDisabled}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'var(--accent-blue)', color: 'var(--text-inverse)' }}
          >
            {isProcessing
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Play className="w-4 h-4" />
            }
            Full Process
          </button>

          {/* Draft Email — split button */}
          <div className="relative" ref={emailMenuRef}>
            <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--border-default)' }}>
              <button
                onClick={() => handleAction('draft-email', 'auto')}
                disabled={isActionDisabled}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                <Mail className="w-3.5 h-3.5" style={{ color: 'var(--accent-green)' }} />
                Draft Email
              </button>
              <button
                onClick={() => setEmailTypeMenuOpen(!emailTypeMenuOpen)}
                disabled={isActionDisabled}
                className="flex items-center px-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ borderLeft: '1px solid var(--border-default)', color: 'var(--text-tertiary)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${emailTypeMenuOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>
            {emailTypeMenuOpen && (
              <div
                className="absolute top-full left-0 right-0 mt-1 rounded-lg z-20 py-1"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  boxShadow: 'var(--shadow-elevated)',
                }}
              >
                {EMAIL_TYPES.map((et) => (
                  <button
                    key={et.value}
                    onClick={() => {
                      setEmailTypeMenuOpen(false)
                      handleAction('draft-email', et.value)
                    }}
                    className="w-full text-left px-3 py-2 text-sm transition-colors"
                    style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = 'var(--accent-blue-dim)'
                      ;(e.currentTarget as HTMLElement).style.color = 'var(--accent-blue)'
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = 'transparent'
                      ;(e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'
                    }}
                  >
                    {et.label}
                    {et.value === 'auto' && <span style={{ color: 'var(--text-tertiary)' }} className="ml-1">(default)</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="my-1" style={{ borderTop: '1px solid var(--border-subtle)' }} />

          {/* Quick Actions — compact list */}
          <div className="space-y-0.5">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleAction(action.id)}
                disabled={isDisabledFor(action.id)}
                className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-left text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed group"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'
                  ;(e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent'
                  ;(e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'
                }}
              >
                <action.icon className="w-4 h-4 flex-shrink-0" style={{ color: action.color }} />
                <span className="truncate">{action.label}</span>
                <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" style={{ color: 'var(--text-tertiary)' }} />
              </button>
            ))}
          </div>
        </div>

        {/* Active Operation Status (compact) */}
        {hasActiveOperation && (
          <div className="px-3 pb-2">
            <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg" style={{ background: 'var(--accent-amber-dim)' }}>
              <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" style={{ color: 'var(--accent-amber)' }} />
              <span className="text-xs font-medium truncate flex-1" style={{ color: 'var(--accent-amber)' }}>
                {activeSessions.length > 1
                  ? `${activeSessions.length} steps running`
                  : activeOperation!.operationType}
              </span>
            </div>
          </div>
        )}

        {/* Active Sessions (compact sidebar) */}
        {(activeSessions.length > 0 || allSessions.length > 0) && (
          <div style={{ borderTop: '1px solid var(--border-subtle)' }} className="px-3 py-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium flex items-center gap-1" style={{ color: 'var(--text-tertiary)' }}>
                <Brain className="w-3 h-3" />
                {activeSessions.length > 0
                  ? `${activeSessions.length} active`
                  : 'No active'
                }
              </span>
              <div className="flex items-center gap-1">
                {activeSessions.length >= 2 && (
                  <button
                    onClick={() => endAllSessions.mutate(caseNumber)}
                    className="text-xs px-1.5 py-0.5 rounded transition-colors"
                    style={{ color: 'var(--accent-red)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--accent-red-dim)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                  >
                    Stop All
                  </button>
                )}
                <button
                  onClick={() => navigate('/agents')}
                  className="text-xs px-1.5 py-0.5 rounded transition-colors"
                  style={{ color: 'var(--accent-blue)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--accent-blue-dim)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                >
                  Monitor
                </button>
              </div>
            </div>
            {activeSessions.length > 0 && (
              <div className="space-y-1">
                {activeSessions.map((s: any) => (
                  <div
                    key={s.sessionId}
                    className="flex items-center justify-between text-xs py-1 px-1.5 rounded"
                    style={{ background: 'var(--bg-inset)' }}
                  >
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{
                          background: s.status === 'active' ? 'var(--accent-green)' : 'var(--accent-amber)',
                        }} />
                      </span>
                      <span className="truncate" style={{ color: 'var(--text-secondary)' }}>
                        {getSessionLabel(s)}
                      </span>
                    </div>
                    <button
                      onClick={() => endCaseSession.mutate({ caseId: caseNumber, sessionId: s.sessionId })}
                      className="p-0.5 rounded transition-colors flex-shrink-0"
                      style={{ color: 'var(--text-tertiary)' }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.color = 'var(--accent-red)'
                        ;(e.currentTarget as HTMLElement).style.background = 'var(--accent-red-dim)'
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)'
                        ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                      }}
                      title="Stop"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Open Full AI Assistant button */}
        {onOpenFull && (
          <div style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <button
              onClick={onOpenFull}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-medium transition-colors"
              style={{ color: 'var(--accent-blue)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--accent-blue-dim)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              Open AI Assistant
            </button>
          </div>
        )}
      </div>
    )
  }

  // ========== FULL MODE ==========
  return (
    <div
      className="rounded-xl flex flex-col"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-card)',
        minHeight: '600px',
        maxHeight: 'calc(100vh - 160px)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" style={{ color: 'var(--accent-blue)' }} />
          <span className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>AI Assistant</span>
          {(hasActiveOperation || isStepActive) && (
            <div className="flex items-center gap-1.5 ml-2 px-2 py-0.5 rounded-full" style={{ background: caseStatus === 'waiting-input' ? 'var(--accent-purple-dim)' : 'var(--accent-amber-dim)' }}>
              <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: caseStatus === 'waiting-input' ? 'var(--accent-purple)' : 'var(--accent-amber)' }} />
              <span className="text-xs font-medium" style={{ color: caseStatus === 'waiting-input' ? 'var(--accent-purple)' : 'var(--accent-amber)' }}>
                {caseStatus === 'waiting-input'
                  ? 'Waiting for input'
                  : activeSessions.length > 1
                    ? `${activeSessions.length} steps running`
                    : activeOperation?.operationType || 'Processing'}
              </span>
            </div>
          )}
          {caseStatus === 'completed' && !hasActiveOperation && (
            <div className="flex items-center gap-1.5 ml-2 px-2 py-0.5 rounded-full" style={{ background: 'var(--accent-green-dim)' }}>
              <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--accent-green)' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--accent-green)' }}>Completed</span>
            </div>
          )}
          {caseStatus === 'failed' && !hasActiveOperation && (
            <div className="flex items-center gap-1.5 ml-2 px-2 py-0.5 rounded-full" style={{ background: 'var(--accent-red-dim)' }}>
              <AlertCircle className="w-3.5 h-3.5" style={{ color: 'var(--accent-red)' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--accent-red)' }}>Failed</span>
            </div>
          )}
          {isLiveRunning && !hasActiveOperation && !isStepActive && caseStatus === 'idle' && (
            <div className="flex items-center gap-1.5 ml-2 px-2 py-0.5 rounded-full" style={{ background: 'var(--accent-blue-dim)' }}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: 'var(--accent-blue)' }} />
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: 'var(--accent-blue)' }} />
              </span>
              <span className="text-xs font-medium" style={{ color: 'var(--accent-blue)' }}>Session Active</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeSessions.length > 0 && (
            <span className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>
              {activeSessions.length} active
            </span>
          )}
          {activeSessionId && (
            <button
              onClick={handleEndSession}
              className="text-xs flex items-center gap-1 px-2 py-1 rounded transition-colors"
              style={{ color: 'var(--text-tertiary)' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = 'var(--accent-red)'
                ;(e.currentTarget as HTMLElement).style.background = 'var(--accent-red-dim)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)'
                ;(e.currentTarget as HTMLElement).style.background = 'transparent'
              }}
            >
              <X className="w-3 h-3" /> End Session
            </button>
          )}
          {activeSessions.length > 1 && (
            <button
              onClick={() => endAllSessions.mutate(caseNumber)}
              className="text-xs flex items-center gap-1 px-2 py-1 rounded transition-colors"
              style={{ color: 'var(--accent-red)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--accent-red-dim)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              End All
            </button>
          )}
        </div>
      </div>

      {/* Stall Warning + Queue Status */}
      <StallWarningBanner visible={isStalled} />
      {queueStatus && (
        <div className="px-5 pt-1">
          <QueueStatusIndicator
            currentLabel={queueStatus.currentLabel}
            queueLength={queueStatus.queueLength}
            queueLabels={queueStatus.queueLabels}
          />
        </div>
      )}

      {/* Action Buttons — single row, compact */}
      <div className="px-5 py-2 flex-shrink-0" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Primary: Full Process */}
          <button
            onClick={() => handleAction('process')}
            disabled={isActionDisabled}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'var(--accent-blue)', color: 'var(--text-inverse)' }}
          >
            {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            Full Process
          </button>

          {/* Draft Email — split button */}
          <div className="relative" ref={emailMenuRef}>
            <div className="flex rounded-md overflow-hidden" style={{ border: '1px solid var(--border-default)' }}>
              <button
                onClick={() => handleAction('draft-email', 'auto')}
                disabled={isActionDisabled}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                <Mail className="w-3.5 h-3.5" style={{ color: 'var(--accent-green)' }} />
                Email
              </button>
              <button
                onClick={() => setEmailTypeMenuOpen(!emailTypeMenuOpen)}
                disabled={isActionDisabled}
                className="flex items-center px-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ borderLeft: '1px solid var(--border-default)', color: 'var(--text-tertiary)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                <ChevronDown className={`w-3 h-3 transition-transform ${emailTypeMenuOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>
            {emailTypeMenuOpen && (
              <div
                className="absolute top-full left-0 mt-1 rounded-lg z-20 py-1 min-w-[180px]"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  boxShadow: 'var(--shadow-elevated)',
                }}
              >
                {EMAIL_TYPES.map((et) => (
                  <button
                    key={et.value}
                    onClick={() => {
                      setEmailTypeMenuOpen(false)
                      handleAction('draft-email', et.value)
                    }}
                    className="w-full text-left px-3 py-2 text-sm transition-colors"
                    style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = 'var(--accent-blue-dim)'
                      ;(e.currentTarget as HTMLElement).style.color = 'var(--accent-blue)'
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = 'transparent'
                      ;(e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'
                    }}
                  >
                    {et.label}
                    {et.value === 'auto' && <span style={{ color: 'var(--text-tertiary)' }} className="ml-1">(default)</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions as pill buttons */}
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleAction(action.id)}
              disabled={isDisabledFor(action.id)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'
                ;(e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'transparent'
                ;(e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'
              }}
            >
              <action.icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: action.color }} />
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mx-5 mt-3 flex items-start gap-2 px-3 py-2.5 rounded-lg" style={{ background: 'var(--accent-red-dim)' }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-px" style={{ color: 'var(--accent-red)' }} />
          <span className="text-sm flex-1" style={{ color: 'var(--accent-red)' }}>{error}</span>
          <button onClick={() => setError(null)} className="flex-shrink-0">
            <X className="w-3 h-3" style={{ color: 'var(--accent-red)' }} />
          </button>
        </div>
      )}

      {/* Step Filter Tabs — shown when timeline has step groups */}
      <StepFilterTabs
        steps={stepGroups}
        activeFilter={activeStepFilter}
        onFilterChange={setActiveStepFilter}
        onClear={() => {
          useCaseSessionStore.getState().clearAll(caseNumber)
          setSelectedSessionId(null)
          setActiveStepFilter(null)
        }}
      />

      {/* Messages area — flex-grow, scrollable */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-5 py-3"
        style={{ minHeight: '300px' }}
      >
        {effectiveMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12" style={{ color: 'var(--text-tertiary)' }}>
            <Brain className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-base">No messages yet</p>
            <p className="text-sm mt-1">Run an action above to start interacting with the AI assistant</p>
          </div>
        ) : (
          <SessionMessageList messages={effectiveMessages} maxHeightClass="" groupByStep={!activeStepFilter} />
        )}
      </div>

      {/* Step Question Form — shown when case has a pending question */}
      {pendingQuestion && (
        <StepQuestionForm
          caseNumber={caseNumber}
          questions={pendingQuestion.questions}
          contextMessages={timelineMessages}
          onAnswered={() => {
            useCaseSessionStore.getState().clearPendingQuestion(caseNumber)
          }}
        />
      )}

      {/* Chat Input — fixed at bottom */}
      <div className="px-5 py-4 flex-shrink-0" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleChat()}
            placeholder={
              isStepActive ? 'Message AI (queued while busy)...'
              : 'Message AI...'
            }
            className="flex-1 px-4 py-2.5 text-sm rounded-lg outline-none transition-all disabled:opacity-50"
            style={{
              background: 'var(--bg-inset)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)',
            }}
          />
          <button
            onClick={handleChat}
            disabled={!chatInput.trim()}
            className="px-3.5 py-2.5 rounded-lg transition-colors disabled:opacity-40"
            style={{ background: 'var(--accent-blue)', color: 'var(--text-inverse)' }}
          >
            <Send className="w-4.5 h-4.5" />
          </button>
        </div>
        {effectiveSessionId && (
          <div className="flex items-center gap-1.5 mt-2">
            {/* State-driven action buttons — based on case session status */}
            {caseStatus === 'active' && (
              <button
                onClick={handleEndSession}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded transition-colors"
                style={{ color: 'var(--accent-red)', background: 'var(--accent-red-dim)' }}
              >
                <Square className="w-3.5 h-3.5" /> Cancel
              </button>
            )}
            {(caseStatus === 'completed' || caseStatus === 'failed') && (
              <button
                onClick={() => handleDismissTab(effectiveSessionId)}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded transition-colors"
                style={{ color: 'var(--accent-green)', background: 'var(--accent-green-dim)' }}
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Done
              </button>
            )}
            <button
              onClick={() => { useCaseSessionStore.getState().clearAll(caseNumber); setActiveStepFilter(null) }}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded transition-colors ml-auto"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Clear Messages
            </button>
          </div>
        )}
      </div>

      {/* Session Info Footer — Agent Monitor link + Stop All */}
      {activeSessions.length > 0 && (
        <div style={{ borderTop: '1px solid var(--border-subtle)' }} className="flex-shrink-0 px-5 py-2 flex items-center justify-between">
          <span className="text-xs font-medium flex items-center gap-1.5" style={{ color: 'var(--text-tertiary)' }}>
            <Brain className="w-3.5 h-3.5" />
            {activeSessions.length} active session{activeSessions.length > 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-2">
            {activeSessions.length >= 2 && (
              <button
                onClick={() => endAllSessions.mutate(caseNumber)}
                className="text-xs flex items-center gap-1 px-2 py-1 rounded transition-colors"
                style={{ color: 'var(--accent-red)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--accent-red-dim)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                <Square className="w-3 h-3" /> Stop All
              </button>
            )}
            <button
              onClick={() => navigate('/agents')}
              className="text-xs flex items-center gap-1 px-2 py-1 rounded transition-colors"
              style={{ color: 'var(--accent-blue)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--accent-blue-dim)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              <ExternalLink className="w-3 h-3" /> Monitor
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

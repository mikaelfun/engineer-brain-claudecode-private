/**
 * CaseAIPanel — AI assistant (design system v2)
 *
 * Two modes:
 * - `compact` — sidebar: quick action buttons + jump-to-tab button + status indicator
 * - `full`    — tab pane: full-width with grid actions + messages + chat input + session management
 */
import { useState, useRef, useEffect } from 'react'
import {
  Sparkles, Search, Mail, Play, X, Send,
  CheckCircle2, Loader2, Brain, AlertCircle, ChevronDown,
  RefreshCw, MessageSquare, ShieldCheck, GitBranch, FileText, BookOpen,
  Zap, ChevronRight, Maximize2
} from 'lucide-react'
import { apiPost, apiDelete } from '../api/client'
import { useCaseSessions, useCaseOperation, useCaseMessages, useEndAllCaseSessions } from '../api/hooks'
import { useCaseSessionStore, type CaseSessionMessage } from '../stores/caseSessionStore'
import { SessionBadge } from './SessionBadge'
import { SessionMessageList } from './session/SessionMessageList'

interface CaseAIPanelProps {
  caseNumber: string
  mode?: 'compact' | 'full'
  onOpenFull?: () => void
}

type AIAction = 'process' | 'data-refresh' | 'compliance-check' | 'status-judge' | 'teams-search' | 'troubleshoot' | 'draft-email' | 'inspection' | 'generate-kb'

const EMPTY_MESSAGES: CaseSessionMessage[] = []

export default function CaseAIPanel({ caseNumber, mode = 'full', onOpenFull }: CaseAIPanelProps) {
  const [chatInput, setChatInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailTypeMenuOpen, setEmailTypeMenuOpen] = useState(false)
  const emailMenuRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const { data: sessionsData } = useCaseSessions(caseNumber)
  const activeSessionId = sessionsData?.activeSession || null
  const isLiveRunning = !!activeSessionId
  const allSessions = sessionsData?.sessions || []
  const endAllSessions = useEndAllCaseSessions()

  const { data: operationData } = useCaseOperation(caseNumber)
  const activeOperation = operationData?.operation || null
  const hasActiveOperation = !!activeOperation

  const isActionDisabled = isProcessing || isLiveRunning || hasActiveOperation

  const messages = useCaseSessionStore((s) => s.messages[caseNumber] ?? EMPTY_MESSAGES)
  const clearMessages = useCaseSessionStore((s) => s.clearMessages)

  const { data: persistedData } = useCaseMessages(caseNumber)
  const hasRecoveredRef = useRef(false)

  useEffect(() => {
    if (
      persistedData?.messages?.length &&
      messages.length === 0 &&
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
  }, [persistedData, messages.length, caseNumber])

  useEffect(() => {
    const container = messagesContainerRef.current
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  }, [messages.length])

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
    if (hasActiveOperation) {
      setError(`Operation already running: ${activeOperation!.operationType}`)
      return
    }

    setIsProcessing(true)
    setError(null)
    clearMessages(caseNumber)

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
    if (!chatInput.trim() || !activeSessionId) return
    const message = chatInput.trim()
    setChatInput('')

    useCaseSessionStore.getState().addMessage(caseNumber, {
      type: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    })

    try {
      await apiPost(`/case/${caseNumber}/chat`, {
        sessionId: activeSessionId,
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

  const handleEndSession = async () => {
    if (!activeSessionId) return
    try {
      await apiDelete(`/case/${caseNumber}/session`, { sessionId: activeSessionId })
      clearMessages(caseNumber)
    } catch {
      // ignore
    }
  }

  const quickActions: Array<{ id: AIAction; icon: typeof RefreshCw; label: string; color: string }> = [
    { id: 'data-refresh', icon: RefreshCw, label: 'Refresh Data', color: 'var(--accent-blue)' },
    { id: 'teams-search', icon: MessageSquare, label: 'Teams Search', color: 'var(--accent-purple)' },
    { id: 'compliance-check', icon: ShieldCheck, label: 'Compliance', color: 'var(--accent-green)' },
    { id: 'status-judge', icon: GitBranch, label: 'Status Judge', color: 'var(--accent-amber)' },
    { id: 'troubleshoot', icon: Search, label: 'Troubleshoot', color: 'var(--accent-red)' },
    { id: 'inspection', icon: FileText, label: 'Inspection', color: 'var(--accent-blue)' },
    { id: 'generate-kb', icon: BookOpen, label: 'Generate KB', color: 'var(--accent-purple)' },
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
                disabled={isActionDisabled}
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
                {activeOperation!.operationType}
              </span>
            </div>
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
          {hasActiveOperation && (
            <div className="flex items-center gap-1.5 ml-2 px-2 py-0.5 rounded-full" style={{ background: 'var(--accent-amber-dim)' }}>
              <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: 'var(--accent-amber)' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--accent-amber)' }}>{activeOperation!.operationType}</span>
            </div>
          )}
          {isLiveRunning && !hasActiveOperation && (
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
          {allSessions.length > 0 && (
            <span className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>
              {allSessions.length} session{allSessions.length > 1 ? 's' : ''}
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
          {allSessions.length > 1 && (
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

      {/* Action Buttons — horizontal grid */}
      <div className="px-5 py-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex flex-wrap gap-2">
          {/* Primary: Full Process */}
          <button
            onClick={() => handleAction('process')}
            disabled={isActionDisabled}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'var(--accent-blue)', color: 'var(--text-inverse)' }}
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Full Process
          </button>

          {/* Draft Email — split button */}
          <div className="relative" ref={emailMenuRef}>
            <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--border-default)' }}>
              <button
                onClick={() => handleAction('draft-email', 'auto')}
                disabled={isActionDisabled}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                <Mail className="w-4 h-4" style={{ color: 'var(--accent-green)' }} />
                Draft Email
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
              disabled={isActionDisabled}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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

      {/* Messages area — flex-grow, scrollable */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-5 py-3"
        style={{ minHeight: '300px' }}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12" style={{ color: 'var(--text-tertiary)' }}>
            <Brain className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-base">No messages yet</p>
            <p className="text-sm mt-1">Run an action above to start interacting with the AI assistant</p>
          </div>
        ) : (
          <SessionMessageList messages={messages} containerRef={messagesContainerRef} />
        )}
      </div>

      {/* Chat Input — fixed at bottom */}
      <div className="px-5 py-4 flex-shrink-0" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleChat()}
            placeholder={activeSessionId ? 'Message AI...' : 'Start an action above first...'}
            disabled={!activeSessionId}
            className="flex-1 px-4 py-2.5 text-sm rounded-lg outline-none transition-all disabled:opacity-50"
            style={{
              background: 'var(--bg-inset)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)',
            }}
          />
          <button
            onClick={handleChat}
            disabled={!chatInput.trim() || !activeSessionId}
            className="px-3.5 py-2.5 rounded-lg transition-colors disabled:opacity-40"
            style={{ background: 'var(--accent-blue)', color: 'var(--text-inverse)' }}
          >
            <Send className="w-4.5 h-4.5" />
          </button>
        </div>
        {activeSessionId && (
          <div className="flex items-center gap-1.5 mt-2">
            <button
              onClick={handleEndSession}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded transition-colors"
              style={{ color: 'var(--accent-green)', background: 'var(--accent-green-dim)' }}
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Done
            </button>
            <button
              onClick={() => handleAction('process')}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded transition-colors"
              style={{ color: 'var(--text-secondary)', background: 'var(--bg-inset)' }}
            >
              <Loader2 className="w-3.5 h-3.5" /> Retry
            </button>
            <button
              onClick={() => clearMessages(caseNumber)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded transition-colors ml-auto"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Clear Messages
            </button>
          </div>
        )}
      </div>

      {/* Session History — collapsible */}
      {allSessions.length > 0 && (
        <div style={{ borderTop: '1px solid var(--border-subtle)' }} className="flex-shrink-0">
          <details className="px-5 py-2.5">
            <summary className="text-xs cursor-pointer select-none flex items-center justify-between" style={{ color: 'var(--text-tertiary)' }}>
              <span className="flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5" />
                {allSessions.length} session{allSessions.length > 1 ? 's' : ''}
              </span>
            </summary>
            <div className="mt-2 space-y-1.5">
              {allSessions.map((s: any) => (
                <div
                  key={s.sessionId}
                  className="flex items-center justify-between text-xs py-1.5 px-2 rounded"
                  style={{ background: 'var(--bg-inset)' }}
                >
                  <SessionBadge status={s.status} sessionId={s.sessionId} compact />
                  <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {s.intent && <span className="truncate max-w-[200px]">{s.intent}</span>}
                    <span className="tabular-nums">{new Date(s.lastActivityAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}
    </div>
  )
}

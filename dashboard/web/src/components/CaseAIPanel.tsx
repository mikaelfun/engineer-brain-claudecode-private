/**
 * CaseAIPanel — AI assistant sidebar (design system v2)
 *
 * Sticky sidebar that stays visible while browsing tabs.
 * All colors via CSS variables for dark/light theme support.
 */
import { useState, useRef, useEffect } from 'react'
import {
  Sparkles, Search, Mail, Play, X, Send,
  CheckCircle2, Loader2, Brain, AlertCircle, ChevronDown,
  RefreshCw, MessageSquare, ShieldCheck, GitBranch, FileText, BookOpen,
  Zap, ChevronRight
} from 'lucide-react'
import { apiPost, apiDelete } from '../api/client'
import { useCaseSessions, useCaseOperation, useCaseMessages, useEndAllCaseSessions } from '../api/hooks'
import { useCaseSessionStore, type CaseSessionMessage } from '../stores/caseSessionStore'
import { SessionBadge } from './SessionBadge'
import { SessionMessageList } from './session/SessionMessageList'

interface CaseAIPanelProps {
  caseNumber: string
}

type AIAction = 'process' | 'data-refresh' | 'compliance-check' | 'status-judge' | 'teams-search' | 'troubleshoot' | 'draft-email' | 'inspection' | 'generate-kb'

const EMPTY_MESSAGES: CaseSessionMessage[] = []

export default function CaseAIPanel({ caseNumber }: CaseAIPanelProps) {
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
        {activeSessionId && (
          <button
            onClick={handleEndSession}
            className="text-xs flex items-center gap-1 transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--accent-red)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)' }}
          >
            <X className="w-3 h-3" /> End
          </button>
        )}
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
                  className="w-full text-left px-3 py-1.5 text-xs transition-colors"
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
              <action.icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: action.color }} />
              <span className="truncate">{action.label}</span>
              <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" style={{ color: 'var(--text-tertiary)' }} />
            </button>
          ))}
        </div>
      </div>

      {/* Status / Messages / Chat — below divider */}
      {(hasActiveOperation || isLiveRunning || error || messages.length > 0 || activeSessionId) && (
        <div className="p-3 space-y-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          {/* Active Operation */}
          {hasActiveOperation && (
            <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg" style={{ background: 'var(--accent-amber-dim)' }}>
              <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" style={{ color: 'var(--accent-amber)' }} />
              <span className="text-xs font-medium truncate flex-1" style={{ color: 'var(--accent-amber)' }}>
                {activeOperation!.operationType}
              </span>
              <span className="text-[10px] tabular-nums flex-shrink-0" style={{ color: 'var(--text-tertiary)' }}>
                {new Date(activeOperation!.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}

          {/* Active Session */}
          {isLiveRunning && !hasActiveOperation && (
            <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg" style={{ background: 'var(--accent-blue-dim)' }}>
              <span className="relative flex h-2 w-2 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: 'var(--accent-blue)' }} />
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: 'var(--accent-blue)' }} />
              </span>
              <span className="text-xs font-medium" style={{ color: 'var(--accent-blue)' }}>Session Active</span>
              <span className="text-[10px] font-mono ml-auto" style={{ color: 'var(--text-tertiary)' }}>{activeSessionId.slice(0, 8)}</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 px-2.5 py-2 rounded-lg" style={{ background: 'var(--accent-red-dim)' }}>
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-px" style={{ color: 'var(--accent-red)' }} />
              <span className="text-xs" style={{ color: 'var(--accent-red)' }}>{error}</span>
            </div>
          )}

          {/* SSE Messages — filtered & collapsed */}
          {messages.length > 0 && (
            <SessionMessageList messages={messages} containerRef={messagesContainerRef} />
          )}

          {/* Chat Input */}
          {activeSessionId && (
            <>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                  placeholder="Message AI..."
                  className="flex-1 px-2.5 py-1.5 text-sm rounded-lg outline-none transition-all"
                  style={{
                    background: 'var(--bg-inset)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)',
                  }}
                />
                <button
                  onClick={handleChat}
                  disabled={!chatInput.trim()}
                  className="px-2 py-1.5 rounded-lg transition-colors disabled:opacity-40"
                  style={{ background: 'var(--accent-blue)', color: 'var(--text-inverse)' }}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleEndSession}
                  className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded transition-colors"
                  style={{ color: 'var(--accent-green)', background: 'var(--accent-green-dim)' }}
                >
                  <CheckCircle2 className="w-3 h-3" /> Done
                </button>
                <button
                  onClick={() => handleAction('process')}
                  className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded transition-colors"
                  style={{ color: 'var(--text-secondary)', background: 'var(--bg-inset)' }}
                >
                  <Loader2 className="w-3 h-3" /> Retry
                </button>
                <button
                  onClick={handleEndSession}
                  className="flex items-center gap-1 px-2 py-1 text-[11px] rounded transition-colors ml-auto"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  <X className="w-3 h-3" /> Dismiss
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Session History */}
      {allSessions.length > 0 && (
        <div style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <details className="px-3 py-2">
            <summary className="text-[11px] cursor-pointer select-none flex items-center justify-between" style={{ color: 'var(--text-tertiary)' }}>
              <span className="flex items-center gap-1">
                <Brain className="w-3 h-3" />
                {allSessions.length} session{allSessions.length > 1 ? 's' : ''}
              </span>
              {allSessions.length > 1 && (
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    endAllSessions.mutate(caseNumber)
                  }}
                  className="text-[11px] transition-colors"
                  style={{ color: 'var(--accent-red)' }}
                >
                  end all
                </button>
              )}
            </summary>
            <div className="mt-1.5 space-y-1">
              {allSessions.map((s: any) => (
                <div
                  key={s.sessionId}
                  className="flex items-center justify-between text-xs py-1 px-1.5 rounded"
                  style={{ background: 'var(--bg-inset)' }}
                >
                  <SessionBadge status={s.status} sessionId={s.sessionId} compact />
                  <div className="flex items-center gap-1.5 text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                    {s.intent && <span className="truncate max-w-[80px]">{s.intent}</span>}
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

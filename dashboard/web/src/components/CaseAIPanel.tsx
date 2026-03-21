/**
 * CaseAIPanel — AI assistant sidebar (right column, ~30% width)
 *
 * Design: matches dashboard's existing design language (blue primary, white/gray surfaces)
 * Sticky sidebar that stays visible while browsing tabs
 */
import { useState, useRef, useEffect } from 'react'
import {
  Sparkles, Search, Mail, Play, X, Send,
  CheckCircle2, Loader2, Wrench, Brain, AlertCircle, ChevronDown,
  RefreshCw, MessageSquare, ShieldCheck, GitBranch, FileText, BookOpen,
  Zap, ChevronRight
} from 'lucide-react'
import { apiPost, apiDelete } from '../api/client'
import { useCaseSessions, useCaseOperation, useCaseMessages, useEndAllCaseSessions } from '../api/hooks'
import { useCaseSessionStore, type CaseSessionMessage } from '../stores/caseSessionStore'
import { SessionBadge } from './SessionBadge'

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

  const quickActions: Array<{ id: AIAction; icon: typeof RefreshCw; label: string }> = [
    { id: 'data-refresh', icon: RefreshCw, label: 'Refresh Data' },
    { id: 'teams-search', icon: MessageSquare, label: 'Teams Search' },
    { id: 'compliance-check', icon: ShieldCheck, label: 'Compliance' },
    { id: 'status-judge', icon: GitBranch, label: 'Status Judge' },
    { id: 'troubleshoot', icon: Search, label: 'Troubleshoot' },
    { id: 'inspection', icon: FileText, label: 'Inspection' },
    { id: 'generate-kb', icon: BookOpen, label: 'Generate KB' },
  ]

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm sticky top-20">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-semibold text-gray-900">AI Assistant</span>
        </div>
        {activeSessionId && (
          <button
            onClick={handleEndSession}
            className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
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
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <Play className="w-4 h-4" />
          }
          Full Process
        </button>

        {/* Draft Email — split button */}
        <div className="relative" ref={emailMenuRef}>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => handleAction('draft-email', 'auto')}
              disabled={isActionDisabled}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Mail className="w-3.5 h-3.5 text-gray-400" />
              Draft Email
            </button>
            <button
              onClick={() => setEmailTypeMenuOpen(!emailTypeMenuOpen)}
              disabled={isActionDisabled}
              className="flex items-center px-2 border-l border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${emailTypeMenuOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
          {emailTypeMenuOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-20 py-1">
              {EMAIL_TYPES.map((et) => (
                <button
                  key={et.value}
                  onClick={() => {
                    setEmailTypeMenuOpen(false)
                    handleAction('draft-email', et.value)
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                >
                  {et.label}
                  {et.value === 'auto' && <span className="text-gray-400 ml-1">(default)</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 my-1" />

        {/* Quick Actions — compact list */}
        <div className="space-y-0.5">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleAction(action.id)}
              disabled={isActionDisabled}
              className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-left text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed group"
            >
              <action.icon className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0" />
              <span className="truncate">{action.label}</span>
              <ChevronRight className="w-3 h-3 text-gray-300 ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Status / Messages / Chat — below divider */}
      {(hasActiveOperation || isLiveRunning || error || messages.length > 0 || activeSessionId) && (
        <div className="border-t border-gray-100 p-3 space-y-2">
          {/* Active Operation */}
          {hasActiveOperation && (
            <div className="flex items-center gap-2 px-2.5 py-2 bg-amber-50 rounded-lg">
              <Loader2 className="w-3.5 h-3.5 text-amber-600 animate-spin flex-shrink-0" />
              <span className="text-xs text-amber-700 font-medium truncate flex-1">
                {activeOperation!.operationType}
              </span>
              <span className="text-[10px] text-amber-400 tabular-nums flex-shrink-0">
                {new Date(activeOperation!.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}

          {/* Active Session */}
          {isLiveRunning && !hasActiveOperation && (
            <div className="flex items-center gap-2 px-2.5 py-2 bg-blue-50 rounded-lg">
              <span className="relative flex h-2 w-2 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
              </span>
              <span className="text-xs text-blue-700 font-medium">Session Active</span>
              <span className="text-[10px] text-blue-400 font-mono ml-auto">{activeSessionId.slice(0, 8)}</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 px-2.5 py-2 bg-red-50 rounded-lg">
              <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-px" />
              <span className="text-xs text-red-600">{error}</span>
            </div>
          )}

          {/* SSE Messages */}
          {messages.length > 0 && (
            <div ref={messagesContainerRef} className="max-h-48 overflow-y-auto space-y-1">
              {messages.map((msg, i) => (
                <MessageBubble key={i} message={msg} />
              ))}
            </div>
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
                  className="flex-1 px-2.5 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 focus:bg-white transition-all placeholder:text-gray-400"
                />
                <button
                  onClick={handleChat}
                  disabled={!chatInput.trim()}
                  className="px-2 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleEndSession}
                  className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-green-700 bg-green-50 rounded hover:bg-green-100 transition-colors"
                >
                  <CheckCircle2 className="w-3 h-3" /> Done
                </button>
                <button
                  onClick={() => handleAction('process')}
                  className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                >
                  <Loader2 className="w-3 h-3" /> Retry
                </button>
                <button
                  onClick={handleEndSession}
                  className="flex items-center gap-1 px-2 py-1 text-[11px] text-gray-400 rounded hover:bg-gray-100 transition-colors ml-auto"
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
        <div className="border-t border-gray-100">
          <details className="px-3 py-2">
            <summary className="text-[11px] text-gray-400 cursor-pointer hover:text-gray-600 select-none flex items-center justify-between">
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
                  className="text-red-400 hover:text-red-500 text-[11px] transition-colors"
                >
                  end all
                </button>
              )}
            </summary>
            <div className="mt-1.5 space-y-1">
              {allSessions.map((s: any) => (
                <div
                  key={s.sessionId}
                  className="flex items-center justify-between text-xs py-1 px-1.5 bg-gray-50 rounded"
                >
                  <SessionBadge status={s.status} sessionId={s.sessionId} compact />
                  <div className="flex items-center gap-1.5 text-gray-400 text-[10px]">
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

/** Compact message bubble for sidebar width */
function MessageBubble({ message }: { message: { type: string; content: string; toolName?: string; step?: string } }) {
  const styles: Record<string, { border: string; icon: React.ReactNode; label: string }> = {
    thinking: {
      border: 'border-l-blue-300',
      icon: <Brain className="w-3 h-3 text-blue-400" />,
      label: 'Thinking',
    },
    'tool-call': {
      border: 'border-l-amber-300',
      icon: <Wrench className="w-3 h-3 text-amber-500" />,
      label: message.toolName || 'Tool',
    },
    'tool-result': {
      border: 'border-l-green-300',
      icon: <CheckCircle2 className="w-3 h-3 text-green-500" />,
      label: message.toolName || 'Result',
    },
    completed: {
      border: 'border-l-green-400',
      icon: <CheckCircle2 className="w-3 h-3 text-green-500" />,
      label: 'Done',
    },
    failed: {
      border: 'border-l-red-400',
      icon: <AlertCircle className="w-3 h-3 text-red-500" />,
      label: 'Error',
    },
    user: {
      border: 'border-l-blue-400',
      icon: <Send className="w-3 h-3 text-blue-500" />,
      label: 'You',
    },
    system: {
      border: 'border-l-gray-300',
      icon: <Sparkles className="w-3 h-3 text-gray-400" />,
      label: 'System',
    },
  }

  const style = styles[message.type] || styles.system

  const displayContent = message.content.length > 200
    ? message.content.slice(0, 200) + '…'
    : message.content

  return (
    <div className={`border-l-2 ${style.border} pl-2 py-1 ${message.type === 'user' ? 'ml-4' : ''}`}>
      <div className="flex items-center gap-1">
        {style.icon}
        <span className="text-[11px] font-medium text-gray-500">{style.label}</span>
        {message.step && (
          <span className="text-[10px] text-gray-400 ml-auto font-mono">{message.step}</span>
        )}
      </div>
      {displayContent && (
        <p className="text-[11px] text-gray-600 mt-0.5 ml-4 leading-relaxed break-words whitespace-pre-wrap">
          {displayContent}
        </p>
      )}
    </div>
  )
}

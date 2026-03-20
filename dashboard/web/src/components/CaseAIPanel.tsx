/**
 * CaseAIPanel — Case AI action panel with real-time SSE message display
 *
 * Features:
 * - Action buttons: Full Process / Troubleshoot / Draft Email
 * - Routes troubleshoot → /case/:id/step/troubleshoot, draft-email → /case/:id/step/draft-email
 * - Full process → /case/:id/process (full casework)
 * - Real-time SSE messages from caseSessionStore (thinking / tool-call / tool-result / completed / failed)
 * - Interactive chat when session is active
 */
import { useState, useRef, useEffect } from 'react'
import {
  Sparkles, Search, Mail, Play, X, Send,
  CheckCircle2, Loader2, Wrench, Brain, AlertCircle, ChevronDown
} from 'lucide-react'
import { Card, CardHeader } from '../components/common/Card'
import { apiPost, apiDelete } from '../api/client'
import { useCaseSessions, useCaseOperation, useCaseMessages, useEndAllCaseSessions } from '../api/hooks'
import { useCaseSessionStore, type CaseSessionMessage } from '../stores/caseSessionStore'
import { SessionBadge } from './SessionBadge'

interface CaseAIPanelProps {
  caseNumber: string
}

type AIAction = 'process' | 'troubleshoot' | 'draft-email'

// Stable empty array to avoid Zustand infinite re-render loop
// (creating [] inline in selector → new ref each call → Object.is fails → re-render → loop)
const EMPTY_MESSAGES: CaseSessionMessage[] = []

export default function CaseAIPanel({ caseNumber }: CaseAIPanelProps) {
  const [chatInput, setChatInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailTypeMenuOpen, setEmailTypeMenuOpen] = useState(false)
  const emailMenuRef = useRef<HTMLDivElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const { data: sessionsData } = useCaseSessions(caseNumber)
  const activeSessionId = sessionsData?.activeSession || null
  const isLiveRunning = !!activeSessionId
  const allSessions = sessionsData?.sessions || []
  const activeSession = allSessions.find((s: any) => s.sessionId === activeSessionId)
  const endAllSessions = useEndAllCaseSessions()

  // Check backend operation lock status (prevents duplicate spawn)
  const { data: operationData } = useCaseOperation(caseNumber)
  const activeOperation = operationData?.operation || null
  const hasActiveOperation = !!activeOperation

  // Button should be disabled if: local processing state, live session running, OR backend operation active
  const isActionDisabled = isProcessing || isLiveRunning || hasActiveOperation

  // Real-time SSE messages from the store — use stable empty ref to prevent infinite loop
  const messages = useCaseSessionStore((s) => s.messages[caseNumber] ?? EMPTY_MESSAGES)
  const clearMessages = useCaseSessionStore((s) => s.clearMessages)

  // Recover persisted messages on mount (after page refresh)
  const { data: persistedData } = useCaseMessages(caseNumber)
  const hasRecoveredRef = useRef(false)

  useEffect(() => {
    // On mount, if no live SSE messages but persisted messages exist, recover them
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
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  // Close email type dropdown on outside click
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
    // Double-check: prevent action if operation already running
    if (hasActiveOperation) {
      setError(`Operation already running: ${activeOperation!.operationType}`)
      return
    }

    setIsProcessing(true)
    setError(null)
    // Clear previous messages on new action
    clearMessages(caseNumber)

    try {
      if (action === 'process') {
        // Full casework → /case/:id/process
        await apiPost<{ status: string; caseNumber: string }>(
          `/case/${caseNumber}/process`,
          { intent: 'Full casework processing' }
        )
      } else {
        // Step-specific routes → /case/:id/step/{step}
        const stepName = action // 'troubleshoot' or 'draft-email'
        const body: Record<string, string> = {}
        if (action === 'draft-email' && emailType) {
          body.emailType = emailType
        }
        await apiPost<{ status: string; caseNumber: string; step: string }>(
          `/case/${caseNumber}/step/${stepName}`,
          Object.keys(body).length > 0 ? body : undefined
        )
      }
    } catch (err: any) {
      // Handle 409 Conflict (duplicate operation)
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

    // Add user message to store
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

  const actions = [
    {
      id: 'process' as AIAction,
      label: 'Full Process',
      icon: <Play className="w-3.5 h-3.5" />,
      color: 'bg-blue-600 hover:bg-blue-700',
      description: 'Data refresh + compliance check + troubleshoot + email + inspection',
    },
    {
      id: 'troubleshoot' as AIAction,
      label: 'Troubleshoot',
      icon: <Search className="w-3.5 h-3.5" />,
      color: 'bg-amber-600 hover:bg-amber-700',
      description: 'Technical analysis with Kusto, ADO, and docs',
    },
    {
      id: 'draft-email' as AIAction,
      label: 'Draft Email',
      icon: <Mail className="w-3.5 h-3.5" />,
      color: 'bg-green-600 hover:bg-green-700',
      description: 'Write email draft with humanizer',
    },
  ]

  return (
    <Card className="border-purple-200">
      <CardHeader
        title="AI Assistant"
        icon={<Sparkles className="w-4 h-4 text-purple-500" />}
        action={
          activeSessionId ? (
            <button
              onClick={handleEndSession}
              className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
            >
              <X className="w-3 h-3" /> End Session
            </button>
          ) : undefined
        }
      />

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {actions.map((action) => (
          action.id === 'draft-email' ? (
            /* Draft Email — split button with email type dropdown */
            <div key={action.id} className="relative" ref={emailMenuRef}>
              <div className="flex rounded-lg overflow-hidden">
                <button
                  onClick={() => handleAction('draft-email', 'auto')}
                  disabled={isActionDisabled}
                  className={`flex-1 flex flex-col items-center gap-1.5 p-3 text-white text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${action.color}`}
                  title={action.description}
                >
                  {isProcessing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    action.icon
                  )}
                  {action.label}
                </button>
                <button
                  onClick={() => setEmailTypeMenuOpen(!emailTypeMenuOpen)}
                  disabled={isActionDisabled}
                  className={`flex items-center px-1.5 text-white border-l border-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${action.color}`}
                  title="Choose email type"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
              {emailTypeMenuOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-10 py-1">
                  {EMAIL_TYPES.map((et) => (
                    <button
                      key={et.value}
                      onClick={() => {
                        setEmailTypeMenuOpen(false)
                        handleAction('draft-email', et.value)
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                    >
                      {et.label}
                      {et.value === 'auto' && (
                        <span className="text-gray-400 ml-1">(default)</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <button
              key={action.id}
              onClick={() => handleAction(action.id)}
              disabled={isActionDisabled}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-lg text-white text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${action.color}`}
              title={action.description}
            >
              {isProcessing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                action.icon
              )}
              {action.label}
            </button>
          )
        ))}
      </div>

      {/* Active Operation Info (from backend lock) */}
      {hasActiveOperation && (
        <div className="flex items-center gap-2 mb-3 px-2 py-1.5 bg-amber-50 rounded-lg">
          <Loader2 className="w-3.5 h-3.5 text-amber-600 animate-spin" />
          <span className="text-xs text-amber-700 font-medium">
            Running: {activeOperation!.operationType}
          </span>
          <span className="text-xs text-amber-400 ml-auto">
            {new Date(activeOperation!.startedAt).toLocaleTimeString()}
          </span>
        </div>
      )}

      {/* Active Session Info */}
      {isLiveRunning && (
        <div className="flex items-center gap-2 mb-3 px-2 py-1.5 bg-purple-50 rounded-lg">
          <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
          <span className="text-xs text-purple-700 font-medium">
            Session Active
          </span>
          <span className="text-xs text-purple-400 ml-auto font-mono">
            {activeSessionId.slice(0, 12)}...
          </span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-3 p-2 bg-red-50 rounded-lg text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Real-time SSE Messages */}
      {messages.length > 0 && (
        <div className="max-h-60 overflow-y-auto mb-3 space-y-1.5">
          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} />
          ))}
          <div ref={chatEndRef} />
        </div>
      )}

      {/* Chat Input — only when session is active */}
      {activeSessionId && (
        <div className="flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleChat()}
            placeholder="Send feedback to AI..."
            className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
          <button
            onClick={handleChat}
            disabled={!chatInput.trim()}
            className="p-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quick Actions — only when session is active */}
      {activeSessionId && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
          <button
            onClick={handleEndSession}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <CheckCircle2 className="w-3 h-3" /> Satisfied
          </button>
          <button
            onClick={() => handleAction('process')}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Loader2 className="w-3 h-3" /> Regenerate
          </button>
          <button
            onClick={handleEndSession}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-500 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors ml-auto"
          >
            <X className="w-3 h-3" /> Dismiss
          </button>
        </div>
      )}

      {/* Session History (integrated from CaseSessionPanel) */}
      {allSessions.length > 0 && (
        <details className="mt-3 pt-3 border-t border-gray-100">
          <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 select-none flex items-center justify-between">
            <span>🧠 {allSessions.length} session{allSessions.length > 1 ? 's' : ''}</span>
            {allSessions.length > 1 && (
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  endAllSessions.mutate(caseNumber)
                }}
                className="text-red-400 hover:text-red-600 text-xs"
              >
                end all
              </button>
            )}
          </summary>
          <div className="mt-2 space-y-1">
            {allSessions.map((s: any) => (
              <div
                key={s.sessionId}
                className="flex items-center justify-between text-xs py-1 px-2 bg-gray-50 rounded"
              >
                <SessionBadge
                  status={s.status}
                  sessionId={s.sessionId}
                  compact
                />
                <div className="flex items-center gap-2 text-gray-400">
                  {s.intent && (
                    <span className="truncate max-w-[150px]">{s.intent}</span>
                  )}
                  <span>{new Date(s.lastActivityAt).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </details>
      )}
    </Card>
  )
}

/** Individual message bubble with type-specific styling */
function MessageBubble({ message }: { message: { type: string; content: string; toolName?: string; step?: string } }) {
  const typeConfig: Record<string, { icon: React.ReactNode; bg: string; text: string; label: string }> = {
    thinking: {
      icon: <Brain className="w-3 h-3 flex-shrink-0" />,
      bg: 'bg-purple-50',
      text: 'text-purple-800',
      label: 'Thinking',
    },
    'tool-call': {
      icon: <Wrench className="w-3 h-3 flex-shrink-0" />,
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      label: message.toolName || 'Tool',
    },
    'tool-result': {
      icon: <CheckCircle2 className="w-3 h-3 flex-shrink-0" />,
      bg: 'bg-green-50',
      text: 'text-green-800',
      label: message.toolName || 'Result',
    },
    completed: {
      icon: <CheckCircle2 className="w-3 h-3 flex-shrink-0" />,
      bg: 'bg-green-50',
      text: 'text-green-700',
      label: 'Done',
    },
    failed: {
      icon: <AlertCircle className="w-3 h-3 flex-shrink-0" />,
      bg: 'bg-red-50',
      text: 'text-red-700',
      label: 'Error',
    },
    user: {
      icon: <Send className="w-3 h-3 flex-shrink-0" />,
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      label: 'You',
    },
    system: {
      icon: <Sparkles className="w-3 h-3 flex-shrink-0" />,
      bg: 'bg-gray-50',
      text: 'text-gray-700',
      label: 'System',
    },
  }

  const config = typeConfig[message.type] || typeConfig.system

  // Truncate long content for display
  const displayContent = message.content.length > 300
    ? message.content.slice(0, 300) + '...'
    : message.content

  return (
    <div className={`text-xs p-2 rounded-lg ${config.bg} ${config.text} ${message.type === 'user' ? 'ml-8' : 'mr-4'}`}>
      <div className="flex items-center gap-1.5 mb-0.5">
        {config.icon}
        <span className="font-medium">{config.label}</span>
        {message.step && (
          <span className="text-[10px] opacity-60 ml-auto">{message.step}</span>
        )}
      </div>
      {displayContent && (
        <div className="ml-5 break-words whitespace-pre-wrap opacity-90">
          {displayContent}
        </div>
      )}
    </div>
  )
}

/**
 * TrackProgressPanel — Real-time progress display for track creation (design system v2)
 *
 * Shows live agent activity. CSS variables for dark/light theme support.
 * Includes interactive QuestionForm for agent AskUserQuestion calls.
 */
import { useState, useEffect, useRef, type FormEvent } from 'react'
import { Loader2, Wrench, Brain, CheckCircle2, AlertCircle, Rocket, ChevronDown, MessageCircleQuestion, Send } from 'lucide-react'
import { useIssueTrackStore, EMPTY_TRACK_MESSAGES, type IssueTrackMessage, type IssueTrackQuestion } from '../stores/issueTrackStore'
import { useTrackProgress, useAnswerTrackQuestion } from '../api/hooks'

interface TrackProgressPanelProps {
  issueId: string
  /** If the issue status is 'tracking', try to recover progress on mount */
  isTracking: boolean
  /** Called when user clicks retry after error */
  onRetry?: () => void
}

export default function TrackProgressPanel({ issueId, isTracking, onRetry }: TrackProgressPanelProps) {
  const messages = useIssueTrackStore((s) => s.messages[issueId] ?? EMPTY_TRACK_MESSAGES)
  const isActive = useIssueTrackStore((s) => s.activeTracking[issueId] ?? false)
  const pendingQuestion = useIssueTrackStore((s) => s.pendingQuestions[issueId])
  const loadMessages = useIssueTrackStore((s) => s.loadMessages)
  const setPendingQuestion = useIssueTrackStore((s) => s.setPendingQuestion)
  const clearPendingQuestion = useIssueTrackStore((s) => s.clearPendingQuestion)
  const scrollRef = useRef<HTMLDivElement>(null)
  const hasRecoveredRef = useRef(false)

  // Recovery: if tracking and no SSE messages yet, fetch from backend
  const { data: recoveredData } = useTrackProgress(
    issueId,
    isTracking && messages.length === 0 && !hasRecoveredRef.current
  )

  useEffect(() => {
    if (recoveredData?.messages?.length && messages.length === 0 && !hasRecoveredRef.current) {
      hasRecoveredRef.current = true
      loadMessages(issueId, recoveredData.messages, recoveredData.isActive)
      // Restore pending question from backend state
      if (recoveredData.pendingQuestion) {
        setPendingQuestion(
          issueId,
          recoveredData.pendingQuestion.sessionId,
          recoveredData.pendingQuestion.questions,
        )
      }
    }
  }, [recoveredData, messages.length, issueId, loadMessages, setPendingQuestion])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages.length])

  if (messages.length === 0 && !isTracking) return null

  // Find the completed or error message if any
  const completedMsg = messages.find(m => m.kind === 'completed')
  const errorMsg = messages.find(m => m.kind === 'error')
  const hasPendingQuestion = !!pendingQuestion

  return (
    <div className="px-4 py-3" style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-inset)' }}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        {hasPendingQuestion ? (
          <>
            <MessageCircleQuestion className="w-3.5 h-3.5" style={{ color: 'var(--accent-amber)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--accent-amber)' }}>Waiting for input...</span>
          </>
        ) : isActive || (isTracking && !completedMsg && !errorMsg) ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: 'var(--accent-blue)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--accent-blue)' }}>Creating Track...</span>
          </>
        ) : completedMsg ? (
          <>
            <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--accent-green)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--accent-green)' }}>Track Created</span>
          </>
        ) : errorMsg ? (
          <>
            <AlertCircle className="w-3.5 h-3.5" style={{ color: 'var(--accent-red)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--accent-red)' }}>Creation Failed</span>
          </>
        ) : (
          <>
            <Rocket className="w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Track Progress</span>
          </>
        )}
      </div>

      {/* Message stream */}
      <div ref={scrollRef} className="max-h-48 overflow-y-auto space-y-1 text-xs">
        {messages.map((msg, i) => (
          <MessageRow key={i} msg={msg} />
        ))}
        {/* Show spinner at bottom if still active and no pending question */}
        {!hasPendingQuestion && (isActive || (isTracking && !completedMsg && !errorMsg)) && messages.length > 0 && (
          <div className="flex items-center gap-1.5 py-0.5" style={{ color: 'var(--text-tertiary)' }}>
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Processing...</span>
          </div>
        )}
      </div>

      {/* Question form (shown when agent asks a question) */}
      {hasPendingQuestion && (
        <QuestionForm
          issueId={issueId}
          questions={pendingQuestion.questions}
          onAnswered={() => clearPendingQuestion(issueId)}
        />
      )}

      {/* Plan summary (shown after completion) */}
      {completedMsg?.planSummary && (
        <PlanSummary plan={completedMsg.planSummary} />
      )}

      {/* Error + retry */}
      {errorMsg && onRetry && (
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs" style={{ color: 'var(--accent-red)' }}>{errorMsg.error}</span>
          <button
            onClick={onRetry}
            className="px-2 py-1 text-xs rounded transition-colors"
            style={{ background: 'var(--accent-red-dim)', color: 'var(--accent-red)' }}
          >
            Retry
          </button>
        </div>
      )}
    </div>
  )
}

/** Interactive question form for agent AskUserQuestion */
function QuestionForm({
  issueId,
  questions,
  onAnswered,
}: {
  issueId: string
  questions: IssueTrackQuestion[]
  onAnswered: () => void
}) {
  const [answer, setAnswer] = useState('')
  const [selectedOptions, setSelectedOptions] = useState<Record<number, string>>({})
  const answerMutation = useAnswerTrackQuestion()
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleOptionClick = (questionIdx: number, label: string) => {
    setSelectedOptions(prev => ({ ...prev, [questionIdx]: label }))
    setAnswer(label)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = answer.trim()
    if (!trimmed || answerMutation.isPending) return

    answerMutation.mutate(
      { id: issueId, answer: trimmed },
      { onSuccess: () => {
        setAnswer('')
        setSelectedOptions({})
        onAnswered()
      }},
    )
  }

  return (
    <div
      className="mt-2 rounded-lg p-3 space-y-3"
      style={{ border: '1px solid var(--accent-amber)', background: 'var(--accent-amber-dim)' }}
    >
      {questions.map((q, i) => (
        <div key={i} className="space-y-1.5">
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{q.question}</p>
          {q.options && q.options.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {q.options.map((opt, j) => (
                <button
                  key={j}
                  type="button"
                  onClick={() => handleOptionClick(i, opt.label)}
                  className="px-2.5 py-1 text-xs rounded-md transition-colors"
                  style={{
                    background: selectedOptions[i] === opt.label ? 'var(--accent-amber)' : 'var(--bg-surface)',
                    border: `1px solid ${selectedOptions[i] === opt.label ? 'var(--accent-amber)' : 'var(--border-default)'}`,
                    color: selectedOptions[i] === opt.label ? 'var(--text-inverse)' : 'var(--text-primary)',
                  }}
                  title={opt.description}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer or select an option above..."
          className="flex-1 px-2.5 py-1.5 text-xs rounded-md outline-none transition-all"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-primary)',
          }}
          disabled={answerMutation.isPending}
        />
        <button
          type="submit"
          disabled={!answer.trim() || answerMutation.isPending}
          className="px-3 py-1.5 text-xs rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
          style={{ background: 'var(--accent-amber)', color: 'var(--text-inverse)' }}
        >
          {answerMutation.isPending ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Send className="w-3 h-3" />
          )}
          Send
        </button>
      </form>

      {answerMutation.isError && (
        <p className="text-xs" style={{ color: 'var(--accent-red)' }}>
          Failed to send answer: {(answerMutation.error as Error)?.message || 'Unknown error'}
        </p>
      )}
    </div>
  )
}

/** Single message row */
function MessageRow({ msg }: { msg: IssueTrackMessage }) {
  switch (msg.kind) {
    case 'started':
      return (
        <div className="flex items-center gap-1.5 py-0.5" style={{ color: 'var(--accent-blue)' }}>
          <Rocket className="w-3 h-3 shrink-0" />
          <span>{msg.content || 'Track creation started'}</span>
        </div>
      )
    case 'thinking':
      return (
        <div className="flex items-start gap-1.5 py-0.5" style={{ color: 'var(--text-secondary)' }}>
          <Brain className="w-3 h-3 shrink-0 mt-0.5" />
          <span className="line-clamp-2">{msg.content}</span>
        </div>
      )
    case 'tool-call':
      return (
        <div className="flex items-center gap-1.5 py-0.5" style={{ color: 'var(--accent-purple)' }}>
          <Wrench className="w-3 h-3 shrink-0" />
          <span>Tool: {msg.toolName}</span>
        </div>
      )
    case 'question':
      return (
        <div className="flex items-start gap-1.5 py-0.5" style={{ color: 'var(--accent-amber)' }}>
          <MessageCircleQuestion className="w-3 h-3 shrink-0 mt-0.5" />
          <span className="font-medium">{msg.content}</span>
        </div>
      )
    case 'completed':
      return (
        <div className="flex items-center gap-1.5 py-0.5 font-medium" style={{ color: 'var(--accent-green)' }}>
          <CheckCircle2 className="w-3 h-3 shrink-0" />
          <span>
            Track created
            {msg.trackId && <span className="ml-1" style={{ color: 'var(--accent-blue)' }}>({msg.trackId})</span>}
          </span>
        </div>
      )
    case 'error':
      return (
        <div className="flex items-center gap-1.5 py-0.5" style={{ color: 'var(--accent-red)' }}>
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>Error: {msg.error}</span>
        </div>
      )
    default:
      return null
  }
}

/** Collapsible plan summary display */
function PlanSummary({ plan }: { plan: string }) {
  // Extract phase/task lines from plan.md for a quick overview
  const lines = plan.split('\n')
  const phases: string[] = []
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('## Phase') || trimmed.startsWith('## phase')) {
      phases.push(trimmed.replace(/^##\s*/, ''))
    } else if (trimmed.startsWith('### ') && phases.length > 0) {
      // Task under a phase — show indented
      phases.push('  ' + trimmed.replace(/^###\s*/, ''))
    }
  }

  // If we couldn't parse phases, just show the first part as-is
  const hasParsedPhases = phases.length > 0

  return (
    <details className="mt-2 group">
      <summary className="flex items-center gap-1 text-xs cursor-pointer" style={{ color: 'var(--accent-blue)' }}>
        <ChevronDown className="w-3 h-3 group-open:rotate-180 transition-transform" />
        Plan Overview ({hasParsedPhases ? `${phases.filter(p => !p.startsWith('  ')).length} phases` : 'raw'})
      </summary>
      <div className="mt-1.5 pl-4" style={{ borderLeft: '2px solid var(--accent-blue-dim)' }}>
        {hasParsedPhases ? (
          <ul className="space-y-0.5 text-xs">
            {phases.map((p, i) => (
              <li
                key={i}
                style={{ color: p.startsWith('  ') ? 'var(--text-tertiary)' : 'var(--text-primary)' }}
                className={p.startsWith('  ') ? 'ml-3' : 'font-medium'}
              >
                {p}
              </li>
            ))}
          </ul>
        ) : (
          <pre className="text-xs whitespace-pre-wrap max-h-40 overflow-y-auto" style={{ color: 'var(--text-secondary)' }}>
            {plan.slice(0, 1000)}
          </pre>
        )}
      </div>
    </details>
  )
}

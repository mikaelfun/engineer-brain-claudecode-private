/**
 * TrackProgressPanel — Real-time progress display for track creation (design system v2)
 *
 * Shows live agent activity. CSS variables for dark/light theme support.
 * Includes interactive QuestionForm for agent AskUserQuestion calls.
 */
import { useState, useEffect, useRef, useMemo, type FormEvent } from 'react'
import { Loader2, Wrench, Brain, CheckCircle2, AlertCircle, Rocket, ChevronDown, ChevronRight, MessageCircleQuestion, Send, History } from 'lucide-react'
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
  const [collapsed, setCollapsed] = useState(false)

  // Recovery: fetch from backend when tracking with missing state.
  // ISS-029: Also fetch when we have messages but no pendingQuestion (question may have
  // arrived before component mounted, so frontend missed the SSE but backend has it).
  const needsRecovery = isTracking && !hasRecoveredRef.current && (messages.length === 0 || !pendingQuestion)
  const { data: recoveredData } = useTrackProgress(issueId, needsRecovery)

  useEffect(() => {
    if (recoveredData?.messages?.length && messages.length === 0 && !hasRecoveredRef.current) {
      hasRecoveredRef.current = true
      loadMessages(issueId, recoveredData.messages, recoveredData.isActive)
    }
    // ISS-029: Always recover pendingQuestion if backend has one and frontend doesn't,
    // regardless of messages state. This handles the case where the question arrived
    // before the component mounted.
    if (recoveredData?.pendingQuestion && !pendingQuestion) {
      setPendingQuestion(
        issueId,
        recoveredData.pendingQuestion.sessionId,
        recoveredData.pendingQuestion.questions,
      )
    }
  }, [recoveredData, messages.length, issueId, loadMessages, setPendingQuestion, pendingQuestion])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages.length])

  // Find the completed or error message if any
  const completedMsg = messages.find(m => m.kind === 'completed')
  const errorMsg = messages.find(m => m.kind === 'error')
  const hasPendingQuestion = !!pendingQuestion

  // ISS-036: Auto-collapse when track creation completes (not active, not waiting for question)
  const isFinished = !!completedMsg && !isActive && !hasPendingQuestion
  useEffect(() => {
    if (isFinished) setCollapsed(true)
  }, [isFinished])

  // Expand when question arrives or tracking restarts
  useEffect(() => {
    if (hasPendingQuestion || isActive) setCollapsed(false)
  }, [hasPendingQuestion, isActive])

  if (messages.length === 0 && !isTracking) return null

  return (
    <div className="px-4 py-3" style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-inset)' }}>
      {/* Header */}
      <div className="flex items-center gap-2">
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
            <span className="text-xs font-medium" style={{ color: 'var(--accent-green)' }}>
              Track Created
              {completedMsg.trackId && <span className="ml-1 font-normal" style={{ color: 'var(--text-secondary)' }}>({completedMsg.trackId})</span>}
            </span>
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

        {/* ISS-036: Toggle button — show when there are messages and finished or collapsed */}
        {messages.length > 0 && (isFinished || collapsed) && (
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto flex items-center gap-1 px-1.5 py-0.5 rounded text-xs transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
            title={collapsed ? 'Show creation log' : 'Hide creation log'}
          >
            <History className="w-3 h-3" />
            {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        )}
      </div>

      {/* Message stream — hidden when collapsed */}
      {!collapsed && (
        <>
          <div ref={scrollRef} className="max-h-48 overflow-y-auto space-y-1 text-xs mt-2">
            <ProcessedMessageList messages={messages} />
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
        </>
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

/** Display message after collapsing consecutive tool-call/thinking messages */
export interface TrackDisplayMessage {
  kind: 'single' | 'collapsed-tools' | 'collapsed-thinking'
  messages: IssueTrackMessage[]
  toolNames: string[]
  timestamp: string
}

/** Merge consecutive tool-call and thinking messages into collapsed groups */
export function processTrackMessages(messages: IssueTrackMessage[]): TrackDisplayMessage[] {
  if (!messages.length) return []
  const result: TrackDisplayMessage[] = []
  let i = 0
  while (i < messages.length) {
    const msg = messages[i]
    // Consecutive tool-call → collapsed-tools
    if (msg.kind === 'tool-call') {
      const group: IssueTrackMessage[] = []
      const names: string[] = []
      while (i < messages.length && messages[i].kind === 'tool-call') {
        group.push(messages[i])
        const name = messages[i].toolName || 'unknown'
        if (!names.includes(name)) names.push(name)
        i++
      }
      if (group.length === 1) {
        result.push({ kind: 'single', messages: [group[0]], toolNames: [], timestamp: group[0].timestamp })
      } else {
        result.push({ kind: 'collapsed-tools', messages: group, toolNames: names, timestamp: group[group.length - 1].timestamp })
      }
      continue
    }
    // Consecutive thinking → collapsed-thinking (keep last)
    if (msg.kind === 'thinking') {
      const group: IssueTrackMessage[] = []
      while (i < messages.length && messages[i].kind === 'thinking') {
        group.push(messages[i])
        i++
      }
      if (group.length === 1) {
        result.push({ kind: 'single', messages: [group[0]], toolNames: [], timestamp: group[0].timestamp })
      } else {
        result.push({ kind: 'collapsed-thinking', messages: group, toolNames: [], timestamp: group[group.length - 1].timestamp })
      }
      continue
    }
    // Everything else (started, completed, error, question) → single
    result.push({ kind: 'single', messages: [msg], toolNames: [], timestamp: msg.timestamp })
    i++
  }
  return result
}

/** Renders processed (collapsed) message list */
function ProcessedMessageList({ messages }: { messages: IssueTrackMessage[] }) {
  const processed = useMemo(() => processTrackMessages(messages), [messages])
  return (
    <>
      {processed.map((item, i) => {
        if (item.kind === 'collapsed-tools') return <CollapsedToolGroup key={i} group={item} />
        if (item.kind === 'collapsed-thinking') return <CollapsedThinkingGroup key={i} group={item} />
        return <MessageRow key={i} msg={item.messages[0]} />
      })}
    </>
  )
}

/** Collapsed tool group — compact one-line with expand/collapse */
function CollapsedToolGroup({ group }: { group: TrackDisplayMessage }) {
  const [expanded, setExpanded] = useState(false)
  const label = group.toolNames.slice(0, 3).join(', ') + (group.toolNames.length > 3 ? '...' : '')
  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 py-0.5 w-full text-left"
        style={{ color: 'var(--accent-purple)' }}
      >
        {expanded ? <ChevronDown className="w-3 h-3 shrink-0" /> : <ChevronRight className="w-3 h-3 shrink-0" />}
        <Wrench className="w-3 h-3 shrink-0" />
        <span>{label} ({group.messages.length} tools)</span>
      </button>
      {expanded && (
        <div className="ml-5 space-y-0.5" style={{ borderLeft: '2px solid var(--accent-purple-dim, var(--border-subtle))' }}>
          {group.messages.map((m, j) => (
            <div key={j} className="flex items-center gap-1.5 py-0.5 pl-2" style={{ color: 'var(--text-tertiary)' }}>
              <Wrench className="w-2.5 h-2.5 shrink-0" />
              <span>Tool: {m.toolName}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/** Collapsed thinking group — shows only last thinking message */
function CollapsedThinkingGroup({ group }: { group: TrackDisplayMessage }) {
  const last = group.messages[group.messages.length - 1]
  return (
    <div className="flex items-start gap-1.5 py-0.5" style={{ color: 'var(--text-secondary)' }}>
      <Brain className="w-3 h-3 shrink-0 mt-0.5" />
      <span className="line-clamp-2">{last.content}</span>
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

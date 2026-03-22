/**
 * StepQuestionForm — Shared inline question form for AskUserQuestion interception
 *
 * Extracted from CaseAIPanel for reuse in AgentMonitor CaseSessionDetail.
 * Renders an "INPUT REQUIRED" card with:
 * - Context content (thinking messages before the question)
 * - Question text with selectable options
 * - Free-text input + submit button
 *
 * Used by:
 * - CaseAIPanel (full mode) — when a step has a pending question
 * - AgentMonitor CaseSessionDetail — when a case session is waiting-input
 */
import { useState, useRef, useEffect, useMemo, type FormEvent } from 'react'
import { MessageCircleQuestion, Loader2, Send } from 'lucide-react'
import { useAnswerStepQuestion } from '../../api/hooks'

export interface StepQuestion {
  question: string
  header?: string
  options?: Array<{ label: string; description?: string }>
  multiSelect?: boolean
}

/** Generic message shape for context extraction — works with both store types */
interface ContextMessage {
  content?: string
  type?: string  // CaseSessionMessage uses 'type'
  kind?: string  // CaseStepMessage uses 'kind'
}

/**
 * Extract thinking content before question as context for INPUT REQUIRED card.
 * Works with both CaseStepMessage (kind-based) and CaseSessionMessage (type-based).
 */
function extractContext(messages: ContextMessage[]): string {
  const thinkingTexts: string[] = []
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i]
    const msgType = m.kind || m.type
    if (msgType === 'thinking' && m.content) {
      thinkingTexts.unshift(m.content)
    } else if (msgType === 'question' || msgType === 'tool-call' || msgType === 'system') {
      continue
    } else {
      break
    }
  }
  return thinkingTexts.join('\n\n').trim()
}

export interface StepQuestionFormProps {
  caseNumber: string
  questions: StepQuestion[]
  /** Messages for context extraction (supports both CaseStepMessage and CaseSessionMessage) */
  contextMessages?: ContextMessage[]
  onAnswered: () => void
  /** Optional className override for the outer container */
  className?: string
}

export function StepQuestionForm({
  caseNumber,
  questions,
  contextMessages = [],
  onAnswered,
  className,
}: StepQuestionFormProps) {
  const [answer, setAnswer] = useState('')
  const [selectedOptions, setSelectedOptions] = useState<Record<number, string>>({})
  const answerMutation = useAnswerStepQuestion()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const contextContent = useMemo(() => extractContext(contextMessages), [contextMessages])

  const handleOptionClick = (questionIdx: number, label: string) => {
    setSelectedOptions(prev => ({ ...prev, [questionIdx]: label }))
    setAnswer(label)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = answer.trim()
    if (!trimmed || answerMutation.isPending) return

    answerMutation.mutate(
      { caseNumber, answer: trimmed },
      {
        onSuccess: () => {
          setAnswer('')
          setSelectedOptions({})
          onAnswered()
        },
      },
    )
  }

  return (
    <div
      className={className || 'mx-5 mt-3 rounded-lg p-4 space-y-3'}
      style={{
        border: '2px solid var(--accent-amber)',
        background: 'var(--accent-amber-dim)',
      }}
    >
      {/* Header badge */}
      <div className="flex items-center gap-1.5 mb-1">
        <MessageCircleQuestion className="w-4 h-4" style={{ color: 'var(--accent-amber)' }} />
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--accent-amber)' }}>
          Input Required
        </span>
      </div>

      {/* Context content — thinking messages before the question */}
      {contextContent && (
        <div
          className="rounded-md px-3 py-2.5 text-xs leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto"
          style={{
            background: 'var(--bg-surface)',
            borderLeft: '3px solid var(--accent-amber)',
            color: 'var(--text-secondary)',
          }}
        >
          {contextContent}
        </div>
      )}

      {questions.map((q, i) => (
        <div key={i} className="space-y-2">
          <p className="text-sm font-semibold leading-relaxed" style={{ color: 'var(--text-primary)' }}>
            {q.question}
          </p>

          {q.options && q.options.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {q.options.map((opt, j) => (
                <button
                  key={j}
                  type="button"
                  onClick={() => handleOptionClick(i, opt.label)}
                  className="px-3 py-1.5 text-xs rounded-md transition-colors font-medium"
                  style={{
                    background: selectedOptions[i] === opt.label ? 'var(--accent-amber)' : 'var(--bg-surface)',
                    border: `1.5px solid ${selectedOptions[i] === opt.label ? 'var(--accent-amber)' : 'var(--border-default)'}`,
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
          className="flex-1 px-3 py-2 text-sm rounded-md outline-none transition-all"
          style={{
            background: 'var(--bg-surface)',
            border: '1.5px solid var(--border-default)',
            color: 'var(--text-primary)',
          }}
          disabled={answerMutation.isPending}
        />
        <button
          type="submit"
          disabled={!answer.trim() || answerMutation.isPending}
          className="px-3 py-2 text-sm rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 font-medium"
          style={{ background: 'var(--accent-amber)', color: 'var(--text-inverse)' }}
        >
          {answerMutation.isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
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

/**
 * PatrolCaseRow — Per-case row with 5-step horizontal pipeline
 *
 * Header bar: case number + status pill + summary tags + step count + duration
 * Pipeline body: start → data-refresh → assess → act → summarize (collapsible for done cases)
 */
import { useState, useEffect } from 'react'
import { ChevronRight, Loader2, RotateCw } from 'lucide-react'
import type { CaseState, StepState, StepStatus, SubtaskState, ActionState } from '../../stores/patrolStore'

// ─── Props ───

interface PatrolCaseRowProps {
  caseState: CaseState
  defaultExpanded: boolean
}

// ─── Constants ───

const PIPELINE_STEPS = ['start', 'data-refresh', 'assess', 'act', 'summarize'] as const
const STEP_LABELS: Record<string, string> = {
  start: 'Start',
  'data-refresh': 'Refresh',
  assess: 'Assess',
  act: 'Act',
  summarize: 'Summary',
}

const DR_SUBTASK_NAMES = ['d365', 'teams', 'icm', 'onenote', 'attachments'] as const
const DR_SUBTASK_LABELS: Record<string, string> = {
  d365: 'D365',
  teams: 'Teams',
  icm: 'ICM',
  onenote: 'OneNote',
  attachments: 'Attach',
}

// ─── Helpers ───

function formatDuration(ms: number): string {
  if (ms < 1000) return '<1s'
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  if (m > 0) return `${m}m ${s % 60}s`
  return `${s}s`
}

function isCaseComplete(c: CaseState): boolean {
  const sum = c.steps?.summarize
  const act = c.steps?.act
  return (
    sum?.status === 'completed' ||
    sum?.status === 'skipped' ||
    (act?.status === 'completed' && sum?.status !== 'active')
  )
}

function isCaseActive(c: CaseState): boolean {
  return Object.values(c.steps).some(s => s.status === 'active')
}

function getCaseDuration(c: CaseState): number | undefined {
  let total = 0
  let hasAny = false
  for (const step of Object.values(c.steps)) {
    if (step.durationMs) { total += step.durationMs; hasAny = true }
  }
  return hasAny ? total : undefined
}

function getCompletedStepCount(c: CaseState): number {
  return Object.values(c.steps).filter(
    s => s.status === 'completed' || s.status === 'skipped'
  ).length
}

function formatDelta(name: string, delta?: Record<string, number>): string | null {
  if (!delta) return null
  switch (name) {
    case 'd365': {
      const parts: string[] = []
      if (delta.emails) parts.push(`+${delta.emails} emails`)
      if (delta.notes) parts.push(`+${delta.notes} note`)
      return parts.join(' \u00b7 ') || null
    }
    case 'teams': {
      const parts: string[] = []
      if (delta.chats) parts.push(`${delta.chats} chats`)
      if (delta.messages) parts.push(`${delta.messages} msgs`)
      return parts.join(' \u00b7 ') || null
    }
    case 'icm':
      return delta.discussions ? `+${delta.discussions} discussions` : null
    case 'onenote':
      return delta.pagesUpdated ? `${delta.pagesUpdated} pages updated` : null
    case 'attachments': {
      if (!delta.files) return null
      let s = `+${delta.files} file`
      if (delta.sizeKB) s += ` (${delta.sizeKB} KB)`
      return s
    }
    default:
      return null
  }
}

function getActSummary(c: CaseState): string {
  const act = c.steps?.act
  if (act?.status === 'skipped') return 'act skipped'
  if (!act?.actions?.length) return ''
  return (
    act.actions
      .filter(a => a.status === 'completed')
      .map(a => a.type.replace('-', ' '))
      .join(' + ') || ''
  )
}

function hasFailed(c: CaseState): boolean {
  return Object.values(c.steps).some(s => s.status === 'failed')
}

// ─── Status icon (22px circle) ───

function StepStatusIcon({ status }: { status: StepStatus }) {
  const size = 22
  if (status === 'completed') {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: 'var(--accent-green)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
          <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    )
  }
  if (status === 'active') {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: 'transparent',
          border: '2.5px solid var(--accent-blue)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          animation: 'patrol-step-pulse 2s ease-in-out infinite',
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'var(--accent-blue)',
          }}
        />
      </div>
    )
  }
  if (status === 'failed') {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: 'var(--accent-red)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2.5 2.5L7.5 7.5M7.5 2.5L2.5 7.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    )
  }
  if (status === 'skipped') {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: 'var(--bg-inset)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          opacity: 0.5,
        }}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 5H8" stroke="var(--text-tertiary)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    )
  }
  // pending
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: '2px solid var(--border-subtle)',
        background: 'var(--bg-surface)',
        flexShrink: 0,
      }}
    />
  )
}

// ─── Step-specific body content ───

function StartBody({ step }: { step?: StepState }) {
  const status = step?.status || 'pending'
  if (status === 'completed') {
    return <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>SDK session ready</div>
  }
  if (status === 'active') {
    return (
      <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--accent-blue)' }}>
        <Loader2 size={12} className="animate-spin" />
        Launching SDK session\u2026
      </div>
    )
  }
  return null
}

function DataRefreshBody({ step }: { step?: StepState }) {
  if (!step) return null
  return (
    <div className="space-y-1">
      {DR_SUBTASK_NAMES.map(name => {
        const sub: SubtaskState | undefined = step.subtasks?.[name]
        const status = sub?.status || 'pending'
        const deltaText = formatDelta(name, sub?.delta)
        return (
          <div key={name} className="flex items-center gap-2">
            {/* 6px status dot */}
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                flexShrink: 0,
                background:
                  status === 'completed' ? 'var(--accent-green)' :
                  status === 'active' ? 'var(--accent-blue)' :
                  status === 'failed' ? 'var(--accent-red)' :
                  'var(--border-subtle)',
                animation: status === 'active' ? 'patrol-dot-pulse 2s ease-in-out infinite' : undefined,
              }}
            />
            {/* Name */}
            <span
              className="text-[13px] font-medium"
              style={{ minWidth: 70, color: 'var(--text-primary)' }}
            >
              {DR_SUBTASK_LABELS[name]}
            </span>
            {/* Delta */}
            {deltaText && (
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                {deltaText}
              </span>
            )}
            {!deltaText && status === 'completed' && (
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>no new</span>
            )}
            {/* Duration */}
            {sub?.durationMs !== undefined && (
              <span
                className="text-[11px] ml-auto"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  color: 'var(--text-tertiary)',
                  flexShrink: 0,
                }}
              >
                {formatDuration(sub.durationMs)}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

function AssessBody({ step }: { step?: StepState }) {
  if (!step) return null
  const result = step.result
  const reasoning = step.reasoning

  const isNeedsAction = result === 'needs-action'
  const isNoChange = result === 'no-change'

  return (
    <div className="space-y-2">
      {/* Result pill */}
      {result && (
        <div
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold rounded-lg px-3 py-1"
          style={{
            background: isNeedsAction
              ? 'var(--accent-amber-dim)'
              : 'var(--bg-inset)',
            color: isNeedsAction
              ? 'var(--accent-amber)'
              : 'var(--text-tertiary)',
          }}
        >
          {isNeedsAction && (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
              <path d="M7 4V7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="7" cy="10" r="0.75" fill="currentColor" />
            </svg>
          )}
          {isNoChange && (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
              <path d="M4.5 7H9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          )}
          {result}
        </div>
      )}
      {/* Reasoning */}
      {reasoning && (
        <div
          className="text-xs"
          style={{
            color: 'var(--text-tertiary)',
            borderLeft: '2px solid var(--border-subtle)',
            paddingLeft: 10,
          }}
        >
          {reasoning}
        </div>
      )}
    </div>
  )
}

function ActBody({ step }: { step?: StepState }) {
  if (!step) return null
  const actions = step.actions
  if (!actions?.length) {
    if (step.status === 'active') {
      return (
        <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--accent-blue)' }}>
          <Loader2 size={12} className="animate-spin" />
          Waiting\u2026
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-1.5">
      {actions.map((action, idx) => (
        <ActionCard key={`${action.type}-${idx}`} action={action} />
      ))}
    </div>
  )
}

function ActionCard({ action }: { action: ActionState }) {
  const { type, status, durationMs, detail, result, subtype } = action

  // Smart name: reassess gets special label, email-drafter shows subtype
  const name = type === 'reassess'
    ? 'reassess'
    : type === 'email-drafter' && subtype
      ? `email: ${subtype}`
      : type.replace(/-/g, ' ')

  if (status === 'completed') {
    return (
      <div
        className="rounded-lg"
        style={{
          padding: '8px 12px',
          border: '1px solid var(--accent-green)',
          opacity: 0.8,
        }}
      >
        <div className="flex items-center gap-1.5">
          {type === 'reassess' ? (
            <RotateCw size={12} style={{ color: 'var(--accent-green)', flexShrink: 0 }} />
          ) : (
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--accent-green)',
                flexShrink: 0,
              }}
            />
          )}
          <span className="text-[13px] font-semibold" style={{ color: 'var(--accent-green)' }}>
            {name}
          </span>
          {durationMs !== undefined && (
            <span
              className="text-[11px] ml-auto"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: 'var(--text-tertiary)',
              }}
            >
              {formatDuration(durationMs)}
            </span>
          )}
        </div>
        {result && (
          <div className="text-[11px]" style={{ marginTop: 3, color: 'var(--text-tertiary)', paddingLeft: 14 }}>
            {result}
          </div>
        )}
      </div>
    )
  }

  if (status === 'active') {
    const isLaunching = detail?.toLowerCase().includes('launching')
    return (
      <div
        className="rounded-lg"
        style={{
          padding: '8px 12px',
          background: 'var(--accent-blue-dim)',
          border: '1px solid rgba(106,95,193,0.25)',
        }}
      >
        <div className="flex items-center gap-1.5">
          {isLaunching ? (
            <Loader2 size={12} className="animate-spin" style={{ color: 'var(--accent-blue)', flexShrink: 0 }} />
          ) : type === 'reassess' ? (
            <RotateCw size={12} className="animate-spin" style={{ color: 'var(--accent-blue)', flexShrink: 0 }} />
          ) : (
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--accent-blue)',
                flexShrink: 0,
                animation: 'patrol-dot-pulse 2s ease-in-out infinite',
              }}
            />
          )}
          <span className="text-[13px] font-semibold" style={{ color: 'var(--accent-blue)' }}>
            {name}
          </span>
          {durationMs !== undefined && (
            <span
              className="text-[11px] ml-auto"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: 'var(--text-tertiary)',
              }}
            >
              {formatDuration(durationMs)}
            </span>
          )}
        </div>
        {detail && (
          <div className="text-[11px]" style={{ marginTop: 3, color: 'var(--accent-blue)', paddingLeft: 18 }}>
            {detail}
          </div>
        )}
      </div>
    )
  }

  // pending
  return (
    <div className="rounded-lg" style={{ padding: '8px 12px', opacity: 0.3 }}>
      <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
        {name}
      </span>
    </div>
  )
}

function SummarizeBody({ step }: { step?: StepState }) {
  if (!step) return null
  const status = step.status
  if (status === 'completed') {
    return (
      <div className="space-y-0.5">
        <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Todo updated</div>
        {step.result && (
          <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{step.result}</div>
        )}
      </div>
    )
  }
  if (status === 'active') {
    return (
      <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--accent-blue)' }}>
        <Loader2 size={12} className="animate-spin" />
        Summarizing\u2026
      </div>
    )
  }
  if (status === 'pending') {
    return <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Waiting\u2026</div>
  }
  return null
}

// ─── Main Component ───

export default function PatrolCaseRow({ caseState, defaultExpanded }: PatrolCaseRowProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const isComplete = isCaseComplete(caseState)
  const isActive = isCaseActive(caseState)
  const failed = hasFailed(caseState)
  const duration = getCaseDuration(caseState)
  const completedCount = getCompletedStepCount(caseState)

  // Auto-collapse when case transitions from active → done
  // (useState only reads defaultExpanded on first render, so we
  //  need to explicitly sync when the case finishes)
  useEffect(() => {
    if (isComplete && !isActive) {
      setExpanded(false)
    }
  }, [isComplete, isActive])

  const showBody = isActive || expanded

  return (
    <div
      className="rounded-xl transition-all duration-200"
      style={{
        background: 'var(--bg-surface)',
        border: isActive
          ? '1px solid rgba(106,95,193,0.25)'
          : '1px solid rgba(106,95,193,0.12)',
        boxShadow: isActive
          ? '0 4px 20px rgba(106,95,193,0.15)'
          : '0 1px 4px rgba(106,95,193,0.04)',
        overflow: 'hidden', // clip header bg to card radius
      }}
      onMouseEnter={e => {
        if (!isActive) {
          (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(106,95,193,0.08)'
        }
      }}
      onMouseLeave={e => {
        if (!isActive) {
          (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(106,95,193,0.04)'
        }
      }}
    >
      {/* ─── Header bar ─── */}
      <div
        className="flex items-center gap-3"
        style={{
          padding: '14px 20px',
          background: 'var(--bg-base)',
          cursor: isComplete ? 'pointer' : undefined,
          userSelect: 'none',
        }}
        onClick={() => {
          if (isComplete) setExpanded(e => !e)
        }}
      >
        {/* Chevron (done cases only) */}
        {isComplete && (
          <ChevronRight
            size={16}
            style={{
              color: 'var(--text-tertiary)',
              transition: 'transform 150ms ease',
              transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
              flexShrink: 0,
            }}
          />
        )}

        {/* Case number */}
        <span
          className="text-[15px] font-bold shrink-0"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            color: isActive ? 'var(--accent-blue)' : 'rgba(106,95,193,0.7)',
          }}
        >
          {caseState.caseNumber}
        </span>

        {/* Status pill */}
        {isActive && (
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase rounded-xl px-3 py-1"
            style={{
              background: 'var(--accent-blue-dim)',
              color: 'var(--accent-blue)',
              flexShrink: 0,
              letterSpacing: '0.3px',
            }}
          >
            <Loader2 size={11} className="animate-spin" />
            {STEP_LABELS[caseState.currentStep || ''] || caseState.currentStep || 'Processing'}
          </span>
        )}
        {isComplete && !failed && (
          <span
            className="inline-flex items-center gap-1 text-[11px] font-bold uppercase rounded-xl px-3 py-1"
            style={{
              background: 'var(--accent-green-dim)',
              color: 'var(--accent-green)',
              flexShrink: 0,
              letterSpacing: '0.3px',
            }}
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path d="M2 5.5L4.5 8L9 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Done
          </span>
        )}
        {failed && (
          <span
            className="inline-flex items-center gap-1 text-[11px] font-bold uppercase rounded-xl px-3 py-1"
            style={{
              background: 'var(--accent-red-dim)',
              color: 'var(--accent-red)',
              flexShrink: 0,
              letterSpacing: '0.3px',
            }}
          >
            Failed
          </span>
        )}

        {/* Summary tags (only when collapsed done) */}
        {isComplete && !expanded && (
          <div className="flex items-center gap-2 min-w-0 overflow-hidden">
            {/* Assess result tag */}
            {caseState.steps?.assess?.result && (
              <span
                className="text-[11px] font-semibold shrink-0"
                style={{
                  padding: '3px 10px',
                  borderRadius: 6,
                  background: 'var(--bg-inset)',
                  color: 'var(--text-tertiary)',
                }}
              >
                {caseState.steps.assess.result}
              </span>
            )}
            {/* Act summary */}
            {getActSummary(caseState) && (
              <span
                className="text-[11px] truncate"
                style={{ color: 'var(--text-tertiary)' }}
              >
                &middot; {getActSummary(caseState)}
              </span>
            )}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Step count */}
        <span
          className="text-xs shrink-0"
          style={{ color: 'var(--text-tertiary)' }}
        >
          {completedCount} / 5
        </span>

        {/* Duration */}
        {duration !== undefined && (
          <span
            className="shrink-0 font-mono"
            style={{
              fontSize: 13,
              fontWeight: 500,
              fontFamily: "'JetBrains Mono', monospace",
              color: 'var(--text-tertiary)',
            }}
          >
            {formatDuration(duration)}
          </span>
        )}
      </div>

      {/* ─── Pipeline body ─── */}
      {showBody && (
        <div
          style={{
            padding: '18px 20px',
            borderTop: '1px solid var(--bg-hover)',
          }}
        >
          {/* ── Step columns ── */}
          <div style={{ display: 'flex', gap: 0, alignItems: 'flex-start' }}>
            {PIPELINE_STEPS.map((stepId, idx) => {
              const step = caseState.steps[stepId]
              const status: StepStatus = step?.status || 'pending'
              const isStart = stepId === 'start'

              return (
                <div key={stepId} style={{ flex: isStart ? 0.6 : 1, minWidth: 0 }}>
                  {/* Step header */}
                  <div className="flex items-center gap-2 mb-2">
                    <StepStatusIcon status={status} />
                    <span
                      className="text-sm font-bold uppercase tracking-wide"
                      style={{
                        color:
                          status === 'active' ? 'var(--accent-blue)' :
                          status === 'completed' ? 'var(--accent-green)' :
                          'var(--text-tertiary)',
                      }}
                    >
                      {STEP_LABELS[stepId]}
                    </span>
                    {step?.durationMs !== undefined && (
                      <span
                        className="text-xs"
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          color: 'var(--text-tertiary)',
                        }}
                      >
                        {formatDuration(step.durationMs)}
                      </span>
                    )}
                  </div>
                  {/* Step body (left-padded to align under name) */}
                  <div style={{ paddingLeft: 29 }}>
                    {stepId === 'start' && <StartBody step={step} />}
                    {stepId === 'data-refresh' && <DataRefreshBody step={step} />}
                    {stepId === 'assess' && <AssessBody step={step} />}
                    {stepId === 'act' && <ActBody step={step} />}
                    {stepId === 'summarize' && <SummarizeBody step={step} />}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ─── Animations ─── */}
      <style>{`
        @keyframes patrol-dot-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes patrol-step-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(106,95,193,0.3); }
          50% { box-shadow: 0 0 0 4px rgba(106,95,193,0); }
        }
      `}</style>
    </div>
  )
}

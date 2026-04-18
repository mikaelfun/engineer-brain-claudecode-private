/**
 * PatrolCaseRow — Per-case row in the patrol list
 *
 * Compact mode: one-line with case number + 4 step dots + status badge + duration
 * Expanded mode: inline chips showing substep progress
 */
import type { CaseState, StepState, StepStatus } from '../../stores/patrolStore'

interface PatrolCaseRowProps {
  caseState: CaseState
  isExpanded: boolean
}

const MAIN_STEPS = ['data-refresh', 'assess', 'act', 'summarize'] as const
const STEP_LABELS: Record<string, string> = {
  'data-refresh': 'Refresh',
  assess: 'Assess',
  act: 'Act',
  summarize: 'Summary',
}

const DR_SUBTASKS = ['d365', 'teams', 'onenote', 'icm', 'attachments'] as const
const ACT_ACTIONS = ['troubleshooter', 'email-drafter', 'challenger'] as const

const STATUS_COLORS: Record<StepStatus, string> = {
  completed: 'var(--accent-green)',
  active: 'var(--accent-blue)',
  failed: 'var(--accent-red)',
  pending: 'var(--text-tertiary)',
  skipped: 'var(--text-tertiary)',
}

function getStepStatus(steps: Record<string, StepState>, stepId: string): StepStatus {
  return steps[stepId]?.status || 'pending'
}

function getCaseDuration(caseState: CaseState): number | undefined {
  let total = 0
  let hasAny = false
  for (const step of Object.values(caseState.steps)) {
    if (step.durationMs) {
      total += step.durationMs
      hasAny = true
    }
  }
  return hasAny ? total : undefined
}

function formatDuration(ms: number): string {
  const s = Math.round(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  return `${m}m ${s % 60}s`
}

function isCaseComplete(caseState: CaseState): boolean {
  const sum = caseState.steps.summarize
  const act = caseState.steps.act
  return (
    sum?.status === 'completed' ||
    sum?.status === 'skipped' ||
    (act?.status === 'completed' && sum?.status !== 'active')
  )
}

function isCaseActive(caseState: CaseState): boolean {
  return Object.values(caseState.steps).some(s => s.status === 'active')
}

export default function PatrolCaseRow({ caseState, isExpanded }: PatrolCaseRowProps) {
  const duration = getCaseDuration(caseState)
  const complete = isCaseComplete(caseState)
  const active = isCaseActive(caseState)

  return (
    <div
      className="rounded-lg transition-all duration-150"
      style={{
        background: isExpanded ? 'var(--bg-hover)' : 'transparent',
        border: isExpanded ? '1px solid var(--border-subtle)' : '1px solid transparent',
      }}
    >
      {/* Compact row */}
      <div className="flex items-center gap-3 px-3 py-2">
        {/* Case number */}
        <span
          className="text-xs font-medium shrink-0"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            color: active ? 'var(--accent-blue)' : complete ? 'var(--text-secondary)' : 'var(--text-primary)',
            minWidth: 100,
          }}
        >
          {caseState.caseNumber}
        </span>

        {/* 4 step dots */}
        <div className="flex items-center gap-1.5">
          {MAIN_STEPS.map(stepId => {
            const status = getStepStatus(caseState.steps, stepId)
            return (
              <div
                key={stepId}
                className="rounded-full transition-all duration-200"
                style={{
                  width: status === 'active' ? 9 : 7,
                  height: status === 'active' ? 9 : 7,
                  background: STATUS_COLORS[status],
                  opacity: status === 'skipped' ? 0.4 : 1,
                  animation: status === 'active' ? 'patrol-dot-pulse 2s ease-in-out infinite' : undefined,
                }}
                title={`${STEP_LABELS[stepId]}: ${status}`}
              />
            )
          })}
        </div>

        {/* Current step label */}
        {caseState.currentStep && active && (
          <span
            className="text-[10px] font-medium uppercase tracking-wide"
            style={{ color: 'var(--accent-blue)' }}
          >
            {STEP_LABELS[caseState.currentStep] || caseState.currentStep}
          </span>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Status badge */}
        {complete && (
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide"
            style={{
              background: 'var(--accent-green-dim)',
              color: 'var(--accent-green)',
            }}
          >
            Done
          </span>
        )}
        {Object.values(caseState.steps).some(s => s.status === 'failed') && (
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide"
            style={{
              background: 'var(--accent-red-dim)',
              color: 'var(--accent-red)',
            }}
          >
            Failed
          </span>
        )}

        {/* Duration */}
        {duration !== undefined && (
          <span
            className="text-[11px]"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: 'var(--text-tertiary)',
            }}
          >
            {formatDuration(duration)}
          </span>
        )}
      </div>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="px-3 pb-3 pt-1 space-y-2">
          {/* Data-refresh: parallel subtask chips */}
          <ExpandedStep
            label="Data Refresh"
            step={caseState.steps['data-refresh']}
            renderDetail={() => (
              <div className="flex items-center gap-1.5 flex-wrap">
                {DR_SUBTASKS.map(st => {
                  const sub = caseState.steps['data-refresh']?.subtasks?.[st]
                  const status = sub?.status || 'pending'
                  return (
                    <SubtaskChip
                      key={st}
                      label={st}
                      status={status}
                      durationMs={sub?.durationMs}
                    />
                  )
                })}
              </div>
            )}
          />

          {/* Assess */}
          <ExpandedStep
            label="Assess"
            step={caseState.steps.assess}
            renderDetail={() => {
              const result = caseState.steps.assess?.result
              return result ? (
                <span
                  className="text-[10px] font-medium px-2 py-0.5 rounded"
                  style={{ background: 'var(--bg-inset)', color: 'var(--text-secondary)' }}
                >
                  {result}
                </span>
              ) : null
            }}
          />

          {/* Act: serial actions with arrows */}
          <ExpandedStep
            label="Act"
            step={caseState.steps.act}
            renderDetail={() => {
              const actions = caseState.steps.act?.actions
              if (!actions?.length) return null
              return (
                <div className="flex items-center gap-1 flex-wrap">
                  {actions.map((action, idx) => (
                    <div key={action.type} className="flex items-center gap-1">
                      <SubtaskChip
                        label={action.type}
                        status={action.status}
                        durationMs={action.durationMs}
                      />
                      {idx < actions.length - 1 && (
                        <span
                          className="text-[10px]"
                          style={{ color: 'var(--text-tertiary)' }}
                        >
                          →
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )
            }}
          />

          {/* Summarize */}
          <ExpandedStep
            label="Summary"
            step={caseState.steps.summarize}
          />
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes patrol-dot-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}

/* ─── Sub-components ─── */

function ExpandedStep({
  label,
  step,
  renderDetail,
}: {
  label: string
  step?: StepState
  renderDetail?: () => React.ReactNode
}) {
  const status = step?.status || 'pending'

  return (
    <div className="flex items-start gap-2">
      {/* Status dot */}
      <div
        className="mt-1 rounded-full shrink-0"
        style={{
          width: 6,
          height: 6,
          background: STATUS_COLORS[status],
          opacity: status === 'skipped' ? 0.4 : 1,
        }}
      />
      {/* Label */}
      <span
        className="text-[11px] font-semibold uppercase tracking-wide shrink-0"
        style={{
          color: status === 'active' ? 'var(--accent-blue)' : 'var(--text-tertiary)',
          minWidth: 72,
        }}
      >
        {label}
      </span>
      {/* Detail content */}
      <div className="flex-1">
        {renderDetail?.()}
      </div>
      {/* Duration */}
      {step?.durationMs !== undefined && (
        <span
          className="text-[10px] shrink-0"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            color: 'var(--text-tertiary)',
          }}
        >
          {formatDuration(step.durationMs)}
        </span>
      )}
    </div>
  )
}

function SubtaskChip({
  label,
  status,
  durationMs,
}: {
  label: string
  status: StepStatus
  durationMs?: number
}) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-all"
      style={{
        background: status === 'active'
          ? 'var(--accent-blue-dim)'
          : status === 'completed'
            ? 'var(--accent-green-dim)'
            : status === 'failed'
              ? 'var(--accent-red-dim)'
              : 'var(--bg-inset)',
        color: STATUS_COLORS[status],
        opacity: status === 'skipped' ? 0.4 : 1,
      }}
    >
      {status === 'active' && (
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{
            background: 'var(--accent-blue)',
            animation: 'patrol-dot-pulse 2s ease-in-out infinite',
          }}
        />
      )}
      {label}
      {durationMs !== undefined && (
        <span style={{ fontFamily: "'JetBrains Mono', monospace", opacity: 0.7 }}>
          {formatDuration(durationMs)}
        </span>
      )}
    </span>
  )
}

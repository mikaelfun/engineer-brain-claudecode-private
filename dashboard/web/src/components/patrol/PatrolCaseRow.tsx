/**
 * PatrolCaseRow — 3-step pipeline + expandable detail panels (v6)
 *
 * Layout:
 *   ┌─ Header: case# | pill | flow pills (collapsed) | duration ─┐
 *   │  Pipeline: [Refresh] ─── [Act] ─── [Summary]                │
 *   │  Detail panel (slide-down, switches per selected step)       │
 *   └─────────────────────────────────────────────────────────────┘
 */
import { useState, useEffect, useMemo } from 'react'
import { ChevronRight, Loader2 } from 'lucide-react'
import type { CaseState, StepStatus, ActionState } from '../../stores/patrolStore'
import RefreshDetail from './RefreshDetail'
import ActionFlowTimeline from './ActionFlowTimeline'
import SummaryDetail from './SummaryDetail'

// ─── Types ───

type SelectedStep = 'init' | 'refresh' | 'act' | 'summary' | null

interface PatrolCaseRowProps {
  caseState: CaseState
  title?: string
  defaultExpanded: boolean
}

// ─── Helpers ───

function LiveDuration({ startedAt }: { startedAt: string }) {
  const [elapsed, setElapsed] = useState(() => Date.now() - new Date(startedAt).getTime())
  useEffect(() => {
    const start = new Date(startedAt).getTime()
    setElapsed(Date.now() - start)
    const timer = setInterval(() => setElapsed(Date.now() - start), 1000)
    return () => clearInterval(timer)
  }, [startedAt])
  return (
    <span className="shrink-0" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--accent-blue)' }}>
      {formatDuration(elapsed)}
    </span>
  )
}

function formatDuration(ms: number): string {
  if (ms < 1000) return '<1s'
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  if (m > 0) return `${m}m ${s % 60}s`
  return `${s}s`
}

function isCaseComplete(c: CaseState): boolean {
  const sum = c.steps?.summarize
  return sum?.status === 'completed' || sum?.status === 'skipped'
}

function isCaseActive(c: CaseState): boolean {
  return Object.values(c.steps).some(s =>
    s.status === 'active' || (s.status as string) === 'waiting-troubleshooter'
  )
}

function hasFailed(c: CaseState): boolean {
  return Object.values(c.steps).some(s => s.status === 'failed')
}

function getCaseDuration(c: CaseState): number | undefined {
  if (isCaseActive(c)) {
    for (const step of Object.values(c.steps)) {
      if (step.status === 'active' && step.startedAt) {
        const ms = new Date(step.startedAt).getTime()
        if (!isNaN(ms)) return Date.now() - ms
      }
    }
    const startStep = c.steps?.start
    if (startStep?.startedAt) {
      const ms = new Date(startStep.startedAt).getTime()
      if (!isNaN(ms)) return Date.now() - ms
    }
    return undefined
  }
  const startStep = c.steps?.start
  if (!startStep?.startedAt) return undefined
  const startMs = new Date(startStep.startedAt).getTime()
  if (isNaN(startMs)) return undefined
  let latestMs = startMs
  for (const step of Object.values(c.steps)) {
    if (step.completedAt) {
      const t = new Date(step.completedAt).getTime()
      if (!isNaN(t) && t > latestMs) latestMs = t
    }
  }
  if (c.updatedAt) {
    const t = new Date(c.updatedAt).getTime()
    if (!isNaN(t) && t > latestMs) latestMs = t
  }
  return latestMs > startMs ? latestMs - startMs : undefined
}

// ─── Derive 3-step pipeline statuses ───

interface PipelineStepInfo {
  id: string
  label: string
  status: StepStatus
  durationMs?: number
  connectorType: 'none' | 'green' | 'gradient-blue' | 'gradient-purple' | 'empty'
}

function derivePipelineSteps(steps: Record<string, any>): PipelineStepInfo[] {
  const refresh = steps?.['data-refresh']
  const start = steps?.start
  const act = steps?.act
  const summarize = steps?.summarize

  // Init: agent cold start (reading SKILL.md, --init, warmup)
  const initStatus: StepStatus = start?.status === 'completed' ? 'completed'
    : start?.status === 'active' ? 'active'
    : 'pending'
  const initDur = start?.durationMs

  // Refresh: only active when data-refresh itself is active (not during start/init)
  const refreshStatus: StepStatus = refresh?.status === 'completed' ? 'completed'
    : refresh?.status === 'active' ? 'active'
    : 'pending'
  const refreshDur = refresh?.durationMs

  // Act: assess lives inside act.actions[type=assess], not as a separate step
  const actActions = act?.actions || []
  const assessAction = actActions.find((a: ActionState) => a.type === 'assess')
  const hasReassessActive = actActions.some((a: ActionState) => a.type === 'reassess' && a.status === 'active')

  // Treat 'waiting-troubleshooter' and similar intermediate statuses as 'active'
  const actRawStatus = act?.status as string | undefined
  const isActEffectivelyActive = actRawStatus === 'active' || actRawStatus === 'waiting-troubleshooter'
  const isActEffectivelyCompleted = actRawStatus === 'completed'

  const actStatus: StepStatus =
    isActEffectivelyCompleted ? 'completed'
    : isActEffectivelyActive ? 'active'
    : assessAction?.status === 'completed' && !isActEffectivelyCompleted ? 'active' // between assess done and next action
    : 'pending'
  const actDur = act?.durationMs || undefined

  // Summary
  const sumStatus: StepStatus = summarize?.status || 'pending'
  const sumDur = summarize?.durationMs

  // Connector types
  const initConn: PipelineStepInfo['connectorType'] = 'none'

  let refreshConn: PipelineStepInfo['connectorType'] = 'empty'
  if (initStatus === 'completed' && refreshStatus === 'completed') refreshConn = 'green'
  else if (initStatus === 'completed' && refreshStatus === 'active') refreshConn = 'gradient-blue'
  else if (initStatus === 'completed') refreshConn = 'green' // init done, refresh pending

  let actConn: PipelineStepInfo['connectorType'] = 'empty'
  if (refreshStatus === 'completed' && actStatus === 'completed') actConn = 'green'
  else if (refreshStatus === 'completed' && actStatus === 'active') actConn = hasReassessActive ? 'gradient-purple' : 'gradient-blue'

  let sumConn: PipelineStepInfo['connectorType'] = 'empty'
  if (actStatus === 'completed' && sumStatus === 'completed') sumConn = 'green'
  else if (actStatus === 'completed' && sumStatus === 'active') sumConn = 'gradient-blue'

  return [
    { id: 'init', label: 'Init', status: initStatus, durationMs: initDur, connectorType: initConn },
    { id: 'refresh', label: 'Refresh', status: refreshStatus, durationMs: refreshDur, connectorType: refreshConn },
    { id: 'act', label: 'Act', status: actStatus, durationMs: actDur, connectorType: actConn },
    { id: 'summary', label: 'Summary', status: sumStatus, durationMs: sumDur, connectorType: sumConn },
  ]
}

// ─── Collapsed flow pills ───

type PillColor = 'default' | 'green' | 'blue' | 'purple'

function deriveFlowPills(steps: Record<string, any>): Array<{ label: string; color: PillColor }> {
  const refresh = steps?.['data-refresh']
  const start = steps?.start
  const act = steps?.act
  const summarize = steps?.summarize
  const actions: ActionState[] = act?.actions || []

  // Nothing started yet
  if (!refresh && !start) return []

  const pills: Array<{ label: string; color: PillColor }> = []

  // 1. Refresh
  const refreshDone = refresh?.status === 'completed'
  const refreshActive = refresh?.status === 'active' || start?.status === 'active'
  pills.push({ label: 'refresh', color: refreshDone ? 'green' : refreshActive ? 'blue' : 'default' })

  // 2. Assess — from act.actions[type=assess]
  const assessAction = actions.find(a => a.type === 'assess')
  const assessDone = assessAction?.status === 'completed'
  const assessActive = assessAction?.status === 'active'
  if (assessDone || assessActive || act) {
    pills.push({ label: 'assess', color: assessDone ? 'green' : assessActive ? 'blue' : 'default' })
  }

  // 3. Act actions (skip assess — already shown above)
  for (const a of actions) {
    if (a.type === 'assess') continue
    const done = a.status === 'completed'
    const active = a.status === 'active'
    const lbl = a.type === 'email-drafter' ? 'email' : a.type === 'troubleshooter' ? 'troubleshoot' : a.type
    pills.push({ label: lbl, color: done ? 'green' : active ? (a.type === 'reassess' ? 'purple' : 'blue') : 'default' })
  }

  // 4. Summary
  if (summarize) {
    const sumDone = summarize.status === 'completed'
    const sumActive = summarize.status === 'active'
    pills.push({ label: 'summary', color: sumDone ? 'green' : sumActive ? 'blue' : 'default' })
  }

  return pills
}

// ─── Check Icon ───

function CheckIcon({ size = 9 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
      <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── Pipeline Step Node ───

function PipelineStep({
  step,
  isSelected,
  onClick,
}: {
  step: PipelineStepInfo
  isSelected: boolean
  onClick: () => void
}) {
  const { status, label, durationMs, connectorType } = step
  const isActive = status === 'active'
  const isDone = status === 'completed'
  const isPending = status === 'pending' || status === 'skipped'

  const iconColor = isDone ? 'var(--accent-green)' : isActive ? 'var(--accent-blue)' : 'var(--text-tertiary)'

  // Ring color for selected state (only when not naturally active)
  const ringStyle: React.CSSProperties = isSelected && !isActive ? {
    boxShadow: `0 0 0 3px ${isDone ? 'rgba(22,163,74,0.25)' : 'rgba(106,95,193,0.25)'}`,
  } : {}

  // Connector background
  const connectorBg = connectorType === 'green' ? 'var(--accent-green)'
    : connectorType === 'gradient-blue' ? 'linear-gradient(90deg, var(--accent-green), var(--accent-blue))'
    : connectorType === 'gradient-purple' ? 'linear-gradient(90deg, var(--accent-green), var(--accent-purple))'
    : 'var(--border-subtle)'
  const connectorOpacity = connectorType === 'empty' ? 1 : 0.45

  return (
    <div
      style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        position: 'relative', cursor: 'pointer', padding: '4px 4px 8px',
      }}
      onClick={onClick}
    >
      {/* Connector (drawn on this element, connects from prev step) */}
      {connectorType !== 'none' && (
        <div style={{
          position: 'absolute', top: 20, height: 2, borderRadius: 1,
          right: 'calc(50% + 20px)', left: 'calc(-50% + 20px)',
          background: connectorBg, opacity: connectorOpacity,
        }} />
      )}

      {/* Icon */}
      <div
        style={{
          width: 32, height: 32, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, flexShrink: 0,
          position: 'relative', zIndex: 1,
          transition: 'transform 0.15s ease, box-shadow 0.2s ease',
          ...(isDone ? { background: 'var(--accent-green)', color: 'white' } :
            isActive ? { border: '2.5px solid var(--accent-blue)', background: 'var(--accent-blue-dim)' } :
            { border: '2px solid var(--border-default)', color: 'var(--text-tertiary)', opacity: 0.4 }),
          ...ringStyle,
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.08)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
      >
        {isDone && <CheckIcon size={12} />}
        {isActive && (
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-blue)', animation: 'patrol-pulse 2s ease-in-out infinite' }} />
        )}
      </div>

      {/* Label */}
      <span style={{
        fontSize: 11, fontWeight: 700, marginTop: 5, textAlign: 'center',
        color: iconColor, opacity: isPending ? 0.4 : 1,
      }}>
        {label}
      </span>

      {/* Duration */}
      {isDone && durationMs !== undefined && (
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: 'var(--text-tertiary)', marginTop: 2 }}>
          {formatDuration(durationMs)}
        </span>
      )}
    </div>
  )
}

// ─── Main Component ───

export default function PatrolCaseRow({ caseState, title, defaultExpanded }: PatrolCaseRowProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [selectedStep, setSelectedStep] = useState<SelectedStep>(null)
  const isComplete = isCaseComplete(caseState)
  const isActive = isCaseActive(caseState)
  const failed = hasFailed(caseState)

  // Live duration tick
  const [, setTick] = useState(0)
  useEffect(() => {
    if (!isActive) return
    const timer = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(timer)
  }, [isActive])

  const duration = getCaseDuration(caseState)
  const pipelineSteps = useMemo(() => derivePipelineSteps(caseState.steps), [caseState.steps])
  const flowPills = useMemo(() => deriveFlowPills(caseState.steps), [caseState.steps])

  // Auto-collapse on complete, auto-expand when active
  useEffect(() => {
    if (isComplete && !isActive) { setExpanded(false); setSelectedStep(null) }
    if (isActive && !expanded) { setExpanded(true) }
  }, [isComplete, isActive])

  // Active case: auto-select the currently active pipeline step
  useEffect(() => {
    if (!isActive) return
    const dr = caseState.steps?.['data-refresh']
    const act = caseState.steps?.act
    const summarize = caseState.steps?.summarize
    const start = caseState.steps?.start
    const actRawStatus = act?.status as string | undefined
    const assessAction = (act?.actions || []).find((a: ActionState) => a.type === 'assess')

    const sumStatus = summarize?.status as string | undefined

    if (sumStatus === 'active') {
      setSelectedStep('summary')
    } else if (assessAction?.status === 'active' || act?.status === 'active' || actRawStatus === 'waiting-troubleshooter' ||
               (assessAction?.status === 'completed' && sumStatus !== 'active' && sumStatus !== 'completed')) {
      // Stay on act during entire act phase (assess done → act actions → waiting-troubleshooter)
      setSelectedStep('act')
    } else if (dr?.status === 'active') {
      setSelectedStep('refresh')
    } else if (start?.status === 'active') {
      setSelectedStep('init')
    }
  }, [isActive, caseState.steps])

  // Determine current active pill label
  const actActions = caseState.steps?.act?.actions || []
  const activeAction = actActions.find((a: ActionState) => a.status === 'active')
  const assessActionActive = actActions.some((a: ActionState) => a.type === 'assess' && a.status === 'active')
  const pillLabel = activeAction?.type === 'reassess' ? 'Reassess'
    : activeAction?.type === 'email-drafter' ? 'Email'
    : activeAction?.type === 'troubleshooter' ? 'Troubleshoot'
    : activeAction?.type === 'challenger' ? 'Challenger'
    : (assessActionActive) ? 'Assess'
    : caseState.steps?.summarize?.status === 'active' ? 'Summary'
    : caseState.steps?.['data-refresh']?.status === 'active' ? 'Refresh'
    : (caseState.steps?.act?.status as string) === 'waiting-troubleshooter' ? 'Troubleshoot'
    : caseState.currentStep || 'Processing'
  const isPurplePill = activeAction?.type === 'reassess'

  const showBody = expanded
  const canCollapse = true

  function handleStepClick(stepId: string) {
    const step = stepId as SelectedStep
    setSelectedStep(prev => prev === step ? null : step)
  }

  return (
    <div
      className="rounded-xl transition-all duration-200"
      style={{
        background: 'var(--bg-surface)',
        border: isActive ? '1px solid rgba(106,95,193,0.22)' : '1px solid var(--border-subtle)',
        boxShadow: isActive ? '0 2px 12px rgba(106,95,193,0.08)' : '0 1px 3px rgba(0,0,0,0.04)',
        overflow: 'hidden',
      }}
    >
      {/* ─── Header ─── */}
      <div
        style={{
          padding: '10px 18px', background: 'var(--bg-inset)',
          cursor: canCollapse ? 'pointer' : undefined, userSelect: 'none',
        }}
        onClick={() => canCollapse && setExpanded(e => !e)}
      >
        {/* Row 1: chevron + case number + status pill + duration */}
        <div className="flex items-center gap-2.5">
          {canCollapse && (
            <ChevronRight size={14} style={{
              color: 'var(--text-tertiary)', flexShrink: 0,
              transition: 'transform 150ms ease',
              transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
            }} />
          )}
          <span className="text-[13px] font-bold" style={{
            fontFamily: "'JetBrains Mono', monospace",
            color: isActive ? 'var(--accent-blue)' : 'rgba(106,95,193,0.55)',
            minWidth: 175, flexShrink: 0,
          }}>
            {caseState.caseNumber}
          </span>

          {/* Status pill */}
          {isActive && (
            <span className="inline-flex items-center gap-1 text-[9.5px] font-bold uppercase rounded-lg px-2.5 py-0.5 shrink-0" style={{
              background: isPurplePill ? 'var(--accent-purple-dim)' : 'var(--accent-blue-dim)',
              color: isPurplePill ? 'var(--accent-purple)' : 'var(--accent-blue)',
              letterSpacing: '0.3px',
            }}>
              <Loader2 size={10} className="animate-spin" />
              {pillLabel}
            </span>
          )}
          {isComplete && !failed && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase rounded-lg px-3 py-1 shrink-0" style={{
              background: 'var(--accent-green)', color: 'white', letterSpacing: '0.4px',
            }}>
              <CheckIcon size={10} /> Done
            </span>
          )}
          {failed && (
            <span className="inline-flex items-center gap-1 text-[9.5px] font-bold uppercase rounded-lg px-2.5 py-0.5 shrink-0" style={{
              background: 'rgba(239,68,68,0.10)', color: 'var(--accent-red)', letterSpacing: '0.3px',
            }}>
              Failed
            </span>
          )}

          <div className="flex-1" />
          {isActive && caseState.steps?.start?.startedAt ? (
            <LiveDuration startedAt={caseState.steps.start.startedAt} />
          ) : duration !== undefined ? (
            <span className="shrink-0" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-tertiary)' }}>
              {formatDuration(duration)}
            </span>
          ) : null}
        </div>

        {/* Row 2: title + flow pills */}
        {(title || (canCollapse && !expanded && flowPills.length > 0)) && (
          <div className="flex items-center gap-2 mt-1" style={{ marginLeft: canCollapse ? 22 : 0 }}>
            {title && (
              <span style={{
                fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                minWidth: 0, flex: 1, opacity: 0.7,
              }}>
                {title}
              </span>
            )}
            {canCollapse && !expanded && flowPills.length > 0 && (
              <div className="flex items-center gap-0.5 shrink-0">
                {flowPills.map((fp, i) => (
                  <span key={i} className="flex items-center gap-0.5">
                    {i > 0 && <span style={{ color: 'var(--text-tertiary)', fontSize: 9, padding: '0 1px' }}>→</span>}
                    <span style={{
                      padding: '2px 7px', borderRadius: 4, fontSize: 10, fontWeight: 600,
                      background: fp.color === 'purple' ? 'var(--accent-purple-dim)'
                        : fp.color === 'green' ? 'var(--accent-green-dim)'
                        : fp.color === 'blue' ? 'var(--accent-blue-dim)'
                        : 'var(--bg-inset)',
                      color: fp.color === 'purple' ? 'var(--accent-purple)'
                        : fp.color === 'green' ? 'var(--accent-green)'
                        : fp.color === 'blue' ? 'var(--accent-blue)'
                        : 'var(--text-tertiary)',
                    }}>
                      {fp.label}
                    </span>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── Body ─── */}
      <div style={{
        maxHeight: showBody ? 800 : 0, opacity: showBody ? 1 : 0,
        overflow: 'hidden', transition: 'max-height 300ms ease, opacity 200ms ease',
      }}>
        {/* Pipeline stepper (full width) */}
        <div style={{ display: 'flex', alignItems: 'flex-start', padding: '16px 24px 6px' }}>
          {pipelineSteps.map(step => (
            <PipelineStep
              key={step.id}
              step={step}
              isSelected={selectedStep === step.id}
              onClick={() => handleStepClick(step.id)}
            />
          ))}
        </div>

        {/* Detail panel */}
        {selectedStep && selectedStep !== 'init' && (
          <div style={{ padding: '0 20px 16px' }}>
            {selectedStep === 'refresh' && (
              <RefreshDetail
                subtasks={caseState.steps?.['data-refresh']?.subtasks}
                durationMs={caseState.steps?.['data-refresh']?.durationMs}
              />
            )}
            {selectedStep === 'act' && (
              <ActionFlowTimeline steps={caseState.steps} caseNumber={caseState.caseNumber} />
            )}
            {selectedStep === 'summary' && (
              <SummaryDetail
                summarizeStep={caseState.steps?.summarize}
                durationMs={caseState.steps?.summarize?.durationMs}
              />
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes patrol-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(106,95,193,0.25); }
          50% { box-shadow: 0 0 0 5px rgba(106,95,193,0); }
        }
        @keyframes detail-slide {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

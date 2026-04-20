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

type SelectedStep = 'refresh' | 'act' | 'summary' | null

interface PatrolCaseRowProps {
  caseState: CaseState
  defaultExpanded: boolean
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
  return sum?.status === 'completed' || sum?.status === 'skipped' || (act?.status === 'completed' && sum?.status !== 'active')
}

function isCaseActive(c: CaseState): boolean {
  return Object.values(c.steps).some(s => s.status === 'active')
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
  const assess = steps?.assess
  const act = steps?.act
  const summarize = steps?.summarize

  // Refresh: done when data-refresh completed
  const refreshStatus: StepStatus = refresh?.status === 'completed' ? 'completed'
    : refresh?.status === 'active' ? 'active'
    : start?.status === 'active' ? 'active' // start is part of refresh phase
    : 'pending'
  const refreshDur = (start?.durationMs || 0) + (refresh?.durationMs || 0) || undefined

  // Act: active if assess or act is active, done if both done
  const actActions = act?.actions || []
  const hasReassessActive = actActions.some((a: ActionState) => a.type === 'reassess' && a.status === 'active')
  const actStatus: StepStatus = (assess?.status === 'completed' && act?.status === 'completed') ? 'completed'
    : (assess?.status === 'active' || act?.status === 'active') ? 'active'
    : assess?.status === 'completed' && act?.status !== 'active' && act?.status !== 'completed' ? 'active' // between assess done and act actions
    : 'pending'
  const actDur = (assess?.durationMs || 0) + (act?.durationMs || 0) || undefined

  // Summary
  const sumStatus: StepStatus = summarize?.status || 'pending'
  const sumDur = summarize?.durationMs

  // Connector types
  const refreshConn: PipelineStepInfo['connectorType'] = 'none' // first step, no left connector

  let actConn: PipelineStepInfo['connectorType'] = 'empty'
  if (refreshStatus === 'completed' && actStatus === 'completed') actConn = 'green'
  else if (refreshStatus === 'completed' && actStatus === 'active') actConn = hasReassessActive ? 'gradient-purple' : 'gradient-blue'

  let sumConn: PipelineStepInfo['connectorType'] = 'empty'
  if (actStatus === 'completed' && sumStatus === 'completed') sumConn = 'green'
  else if (actStatus === 'completed' && sumStatus === 'active') sumConn = 'gradient-blue'

  return [
    { id: 'refresh', label: 'Refresh', status: refreshStatus, durationMs: refreshDur, connectorType: refreshConn },
    { id: 'act', label: 'Act', status: actStatus, durationMs: actDur, connectorType: actConn },
    { id: 'summary', label: 'Summary', status: sumStatus, durationMs: sumDur, connectorType: sumConn },
  ]
}

// ─── Collapsed flow pills ───

function deriveFlowPills(steps: Record<string, any>): Array<{ label: string; color: 'default' | 'green' | 'purple' }> {
  const assess = steps?.assess
  const act = steps?.act
  const actions = act?.actions || []

  if (!assess || assess.status === 'pending') return []

  if (actions.length === 0) {
    return [
      { label: 'assess', color: 'default' },
      { label: assess.result || 'no-change', color: 'green' },
    ]
  }

  const pills: Array<{ label: string; color: 'default' | 'green' | 'purple' }> = [
    { label: 'assess', color: 'default' },
  ]
  for (const a of actions) {
    pills.push({
      label: a.type === 'email-drafter' ? 'email' : a.type === 'troubleshooter' ? 'troubleshoot' : a.type,
      color: a.type === 'reassess' ? 'purple' : 'default',
    })
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

export default function PatrolCaseRow({ caseState, defaultExpanded }: PatrolCaseRowProps) {
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

  // Auto-collapse on complete
  useEffect(() => {
    if (isComplete && !isActive) { setExpanded(false); setSelectedStep(null) }
  }, [isComplete, isActive])

  // Active case: auto-select Act
  useEffect(() => {
    if (isActive) {
      setSelectedStep('act')
    }
  }, [isActive])

  // Determine current active pill label
  const actActions = caseState.steps?.act?.actions || []
  const activeAction = actActions.find((a: ActionState) => a.status === 'active')
  const pillLabel = activeAction?.type === 'reassess' ? 'Reassess'
    : activeAction?.type === 'email-drafter' ? 'Email'
    : activeAction?.type === 'troubleshooter' ? 'Troubleshoot'
    : activeAction?.type === 'challenger' ? 'Challenger'
    : caseState.steps?.assess?.status === 'active' ? 'Assess'
    : caseState.steps?.summarize?.status === 'active' ? 'Summary'
    : caseState.steps?.['data-refresh']?.status === 'active' ? 'Refresh'
    : caseState.currentStep || 'Processing'
  const isPurplePill = activeAction?.type === 'reassess'

  const showBody = isActive || expanded
  const canCollapse = !isActive

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
        className="flex items-center gap-2.5"
        style={{
          padding: '10px 18px', background: 'var(--bg-inset)',
          cursor: canCollapse ? 'pointer' : undefined, userSelect: 'none',
        }}
        onClick={() => canCollapse && setExpanded(e => !e)}
      >
        {canCollapse && (
          <ChevronRight size={14} style={{
            color: 'var(--text-tertiary)', flexShrink: 0,
            transition: 'transform 150ms ease',
            transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
          }} />
        )}
        <span className="text-[13px] font-bold shrink-0" style={{
          fontFamily: "'JetBrains Mono', monospace",
          color: isActive ? 'var(--accent-blue)' : 'rgba(106,95,193,0.55)',
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
          <span className="inline-flex items-center gap-1 text-[9.5px] font-bold uppercase rounded-lg px-2.5 py-0.5 shrink-0" style={{
            background: 'var(--accent-green-dim)', color: 'var(--accent-green)', letterSpacing: '0.3px',
          }}>
            <CheckIcon size={8} /> Done
          </span>
        )}
        {failed && (
          <span className="inline-flex items-center gap-1 text-[9.5px] font-bold uppercase rounded-lg px-2.5 py-0.5 shrink-0" style={{
            background: 'rgba(239,68,68,0.10)', color: 'var(--accent-red)', letterSpacing: '0.3px',
          }}>
            Failed
          </span>
        )}

        {/* Collapsed flow pills */}
        {canCollapse && !expanded && flowPills.length > 0 && (
          <div className="flex items-center gap-0.5 min-w-0 overflow-hidden">
            {flowPills.map((fp, i) => (
              <span key={i} className="flex items-center gap-0.5">
                {i > 0 && <span style={{ color: 'var(--text-tertiary)', fontSize: 9, padding: '0 1px' }}>→</span>}
                <span style={{
                  padding: '2px 7px', borderRadius: 4, fontSize: 10, fontWeight: 600,
                  background: fp.color === 'purple' ? 'var(--accent-purple-dim)' : fp.color === 'green' ? 'var(--accent-green-dim)' : 'var(--bg-inset)',
                  color: fp.color === 'purple' ? 'var(--accent-purple)' : fp.color === 'green' ? 'var(--accent-green)' : 'var(--text-tertiary)',
                }}>
                  {fp.label}
                </span>
              </span>
            ))}
          </div>
        )}

        <div className="flex-1" />
        {duration !== undefined && (
          <span className="shrink-0" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-tertiary)' }}>
            {formatDuration(duration)}
          </span>
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
        {selectedStep && (
          <div style={{ padding: '0 20px 16px' }}>
            {selectedStep === 'refresh' && (
              <RefreshDetail
                subtasks={caseState.steps?.['data-refresh']?.subtasks}
                durationMs={caseState.steps?.['data-refresh']?.durationMs}
              />
            )}
            {selectedStep === 'act' && (
              <ActionFlowTimeline steps={caseState.steps} />
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

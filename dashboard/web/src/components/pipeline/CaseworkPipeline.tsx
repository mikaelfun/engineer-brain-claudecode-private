/**
 * CaseworkPipeline — Horizontal step stepper for casework processing pipeline
 *
 * Visualizes the 4-step casework pipeline:
 *   Data Refresh -> Assess -> Act -> Summarize
 *
 * Supports normal and compact modes, with per-step status indicators,
 * duration labels, connector lines, error tooltips, and a running timer.
 */
import React, { useMemo, useCallback } from 'react'
import {
  RefreshCw,
  Scale,
  GitBranch,
  Search,
  Mail,
  FileText,
  Check,
  X,
  Minus,
  Loader2,
  Clock,
  type LucideIcon,
} from 'lucide-react'

// ─── Types ──────────────────────────────────────────────────────────────────

export type StepStatus = 'pending' | 'active' | 'completed' | 'failed' | 'skipped'

export interface PipelineStep {
  id: string
  label: string
  status: StepStatus
  /** Duration in milliseconds (shown when completed) */
  durationMs?: number
  /** Error message (shown as tooltip when failed) */
  error?: string
}

export interface CaseworkPipelineProps {
  steps: PipelineStep[]
  /** Total elapsed time in ms */
  elapsedMs?: number
  /** Whether the pipeline is currently running */
  isRunning: boolean
  /** Compact mode for patrol per-case rows (smaller, no labels) */
  compact?: boolean
}

// ─── Icon registry ──────────────────────────────────────────────────────────

const STEP_ICONS: Record<string, LucideIcon> = {
  'data-refresh': RefreshCw,
  assess: Scale,
  act: GitBranch,
  summarize: FileText,
}

// ─── Default steps ──────────────────────────────────────────────────────────

export const DEFAULT_CASEWORK_STEPS: PipelineStep[] = [
  { id: 'data-refresh', label: 'Data Refresh', status: 'pending' },
  { id: 'assess', label: 'Assess', status: 'pending' },
  { id: 'act', label: 'Act', status: 'pending' },
  { id: 'summarize', label: 'Summarize', status: 'pending' },
]

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Format milliseconds to human-readable duration (e.g. "2s", "1m 23s") */
function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  const totalSeconds = Math.round(ms / 1000)
  if (totalSeconds < 60) return `${totalSeconds}s`
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`
}

/** CSS color variables per status */
function getStatusColor(status: StepStatus): string {
  switch (status) {
    case 'completed':
      return 'var(--accent-green)'
    case 'active':
      return 'var(--accent-blue)'
    case 'failed':
      return 'var(--accent-red)'
    case 'skipped':
    case 'pending':
    default:
      return 'var(--text-tertiary)'
  }
}

/** CSS dim-background variables per status */
function getStatusBg(status: StepStatus): string {
  switch (status) {
    case 'completed':
      return 'var(--accent-green-dim)'
    case 'active':
      return 'var(--accent-blue-dim)'
    case 'failed':
      return 'var(--accent-red-dim)'
    case 'skipped':
    case 'pending':
    default:
      return 'var(--bg-elevated)'
  }
}

// ─── Sub-components ─────────────────────────────────────────────────────────

/** Small overlay icon indicating the step result (check, x, dash) */
const StatusOverlay = React.memo(function StatusOverlay({
  status,
  compact,
}: {
  status: StepStatus
  compact: boolean
}) {
  const size = compact ? 8 : 10

  if (status === 'completed') {
    return (
      <div
        className="absolute -bottom-0.5 -right-0.5 rounded-full flex items-center justify-center"
        style={{
          width: compact ? 12 : 14,
          height: compact ? 12 : 14,
          background: 'var(--accent-green)',
          color: 'var(--bg-base)',
          boxShadow: '0 0 0 2px var(--bg-surface)',
        }}
      >
        <Check size={size} strokeWidth={3} />
      </div>
    )
  }

  if (status === 'failed') {
    return (
      <div
        className="absolute -bottom-0.5 -right-0.5 rounded-full flex items-center justify-center"
        style={{
          width: compact ? 12 : 14,
          height: compact ? 12 : 14,
          background: 'var(--accent-red)',
          color: 'var(--bg-base)',
          boxShadow: '0 0 0 2px var(--bg-surface)',
        }}
      >
        <X size={size} strokeWidth={3} />
      </div>
    )
  }

  if (status === 'skipped') {
    return (
      <div
        className="absolute -bottom-0.5 -right-0.5 rounded-full flex items-center justify-center"
        style={{
          width: compact ? 12 : 14,
          height: compact ? 12 : 14,
          background: 'var(--bg-elevated)',
          color: 'var(--text-tertiary)',
          boxShadow: '0 0 0 2px var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <Minus size={size} strokeWidth={3} />
      </div>
    )
  }

  return null
})

/** Individual pipeline step node */
const PipelineStepNode = React.memo(function PipelineStepNode({
  step,
  compact,
}: {
  step: PipelineStep
  compact: boolean
}) {
  const Icon = STEP_ICONS[step.id] ?? FileText
  const color = getStatusColor(step.status)
  const bg = getStatusBg(step.status)
  const isActive = step.status === 'active'
  const isSkipped = step.status === 'skipped'

  // Node sizes
  const nodeSize = compact ? 28 : 36
  const iconSize = compact ? 13 : 16

  return (
    <div
      className="flex flex-col items-center flex-shrink-0 group"
      style={{ opacity: isSkipped ? 0.45 : 1 }}
      role="listitem"
      aria-label={`${step.label}: ${step.status}`}
      aria-current={isActive ? 'step' : undefined}
    >
      {/* Icon circle */}
      <div className="relative">
        {/* Pulse ring for active step */}
        {isActive && (
          <div
            className="absolute inset-0 rounded-full animate-ping"
            style={{
              background: 'var(--accent-blue)',
              opacity: 0.2,
            }}
          />
        )}

        {/* Main circle */}
        <div
          className="relative rounded-full flex items-center justify-center transition-all"
          style={{
            width: nodeSize,
            height: nodeSize,
            background: bg,
            border: `1.5px solid ${color}`,
            boxShadow: isActive ? '0 0 12px var(--accent-blue-dim)' : undefined,
          }}
        >
          {isActive ? (
            <Loader2 size={iconSize} strokeWidth={2.5} className="animate-spin" style={{ color }} />
          ) : (
            <Icon size={iconSize} strokeWidth={2} style={{ color }} />
          )}
        </div>

        {/* Status overlay badge */}
        <StatusOverlay status={step.status} compact={compact} />
      </div>

      {/* Label (hidden in compact mode) */}
      {!compact && (
        <span
          className="mt-1.5 text-[10px] font-medium text-center leading-tight max-w-[64px] truncate"
          style={{ color }}
          title={step.label}
        >
          {step.label}
        </span>
      )}

      {/* Duration (shown for completed steps, hidden in compact) */}
      {!compact && step.status === 'completed' && step.durationMs != null && (
        <span
          className="text-[9px] font-mono"
          style={{ color: 'var(--text-tertiary)' }}
        >
          {formatDuration(step.durationMs)}
        </span>
      )}

      {/* Error tooltip on hover (failed steps) */}
      {step.status === 'failed' && step.error && (
        <div
          className="absolute top-full mt-1 left-1/2 -translate-x-1/2 hidden group-hover:block z-50
                     px-2.5 py-1.5 rounded-lg text-[10px] max-w-[200px] whitespace-pre-wrap pointer-events-none"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--accent-red)',
            color: 'var(--accent-red)',
            boxShadow: 'var(--shadow-elevated)',
          }}
          role="tooltip"
        >
          {step.error}
        </div>
      )}
    </div>
  )
})

/** Connector line between two steps */
const Connector = React.memo(function Connector({
  leftStatus,
  rightStatus,
  compact,
}: {
  leftStatus: StepStatus
  rightStatus: StepStatus
  compact: boolean
}) {
  // The connector is "filled" (green) when the left step is completed
  // and the right step is completed, active, or failed (i.e., progression reached it)
  const isFilled =
    leftStatus === 'completed' &&
    (rightStatus === 'completed' || rightStatus === 'active' || rightStatus === 'failed')

  const lineColor = isFilled ? 'var(--accent-green)' : 'var(--border-subtle)'

  return (
    <div
      className="flex-shrink-0 self-center transition-colors"
      style={{
        width: compact ? 12 : 20,
        height: 2,
        background: lineColor,
        // Vertically center with the icon circle
        marginTop: compact ? 0 : -16,
        borderRadius: 1,
      }}
      aria-hidden="true"
    />
  )
})

// ─── Main Component ─────────────────────────────────────────────────────────

export const CaseworkPipeline = React.memo(function CaseworkPipeline({
  steps,
  elapsedMs,
  isRunning,
  compact = false,
}: CaseworkPipelineProps) {
  // Build the step+connector sequence
  const renderSteps = useCallback(() => {
    const elements: React.ReactNode[] = []

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]

      // Add connector before step (except the first)
      if (i > 0) {
        elements.push(
          <Connector
            key={`conn-${i}`}
            leftStatus={steps[i - 1].status}
            rightStatus={step.status}
            compact={compact}
          />
        )
      }

      elements.push(
        <PipelineStepNode
          key={step.id}
          step={step}
          compact={compact}
        />
      )
    }

    return elements
  }, [steps, compact])

  // Summary counts for a11y
  const summary = useMemo(() => {
    const counts = { completed: 0, active: 0, failed: 0, pending: 0, skipped: 0 }
    for (const step of steps) {
      counts[step.status]++
    }
    return counts
  }, [steps])

  return (
    <div
      className={`flex items-center ${compact ? 'gap-0' : 'gap-0'}`}
      role="list"
      aria-label={`Casework pipeline: ${summary.completed} completed, ${summary.active} active, ${summary.failed} failed, ${summary.pending} pending, ${summary.skipped} skipped`}
    >
      {/* Step nodes + connectors */}
      <div className={`flex items-start ${compact ? 'gap-0' : 'gap-0'} overflow-x-auto`}>
        {renderSteps()}
      </div>

      {/* Elapsed time badge */}
      {elapsedMs != null && (
        <div
          className={`flex items-center gap-1 flex-shrink-0 font-mono ${compact ? 'ml-2' : 'ml-4'}`}
          style={{ color: isRunning ? 'var(--accent-blue)' : 'var(--text-tertiary)' }}
          title={`Total elapsed: ${formatDuration(elapsedMs)}`}
        >
          <Clock size={compact ? 10 : 12} strokeWidth={2} />
          <span className={compact ? 'text-[9px]' : 'text-[11px] font-medium'}>
            {formatDuration(elapsedMs)}
          </span>
        </div>
      )}
    </div>
  )
})

export default CaseworkPipeline

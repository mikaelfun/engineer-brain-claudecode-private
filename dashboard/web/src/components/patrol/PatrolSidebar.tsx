/**
 * PatrolSidebar — Vertical pipeline: 6 stages with status icons, labels,
 * durations, detail text, and connecting lines.
 *
 * Stages: Start → Discover → Filter → Warmup → Process → Aggregate
 */
import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { usePatrolStore, type PatrolPhase } from '../../stores/patrolStore'
import { Card } from '../common/Card'

// ─── Types ───

type StageStatus = 'pending' | 'active' | 'completed'

interface StageConfig {
  id: string
  phase: PatrolPhase
  label: string
}

interface StageState extends StageConfig {
  status: StageStatus
  durationMs?: number
  liveStartedAt?: string
  detail: string
}

// ─── Constants ───

const STAGES: StageConfig[] = [
  { id: 'starting',     phase: 'starting',     label: 'Start' },
  { id: 'discovering',  phase: 'discovering',  label: 'Discover' },
  { id: 'filtering',    phase: 'filtering',    label: 'Filter' },
  { id: 'warming-up',   phase: 'warming-up',   label: 'Warmup' },
  { id: 'processing',   phase: 'processing',   label: 'Process' },
  { id: 'aggregating',  phase: 'aggregating',  label: 'Aggregate' },
]

const PHASE_ORDER: PatrolPhase[] = STAGES.map(s => s.phase)

// ─── Helpers ───

function formatDuration(ms: number): string {
  if (ms < 1000) return '<1s'
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  if (m > 0) return `${m}m ${s % 60}s`
  return `${s}s`
}

/** Live counter for the active stage */
function LiveTimer({ startedAt }: { startedAt: string }) {
  const [elapsed, setElapsed] = useState(() => Date.now() - new Date(startedAt).getTime())

  useEffect(() => {
    const start = new Date(startedAt).getTime()
    setElapsed(Date.now() - start)
    const timer = setInterval(() => setElapsed(Date.now() - start), 1000)
    return () => clearInterval(timer)
  }, [startedAt])

  return (
    <span className="font-mono text-[11px]" style={{ color: 'var(--accent-blue)' }}>
      {formatDuration(elapsed)}
    </span>
  )
}

// ─── Warmup status friendly text ───

function friendlyWarmupStatus(raw?: string): string {
  if (!raw) return 'Checking tokens\u2026'
  const s = raw.toLowerCase()
  if (s.includes('alive') || s.includes('running') || s.includes('ready'))
    return 'Token daemon ready'
  if (s.includes('valid') || s.includes('fresh'))
    return 'All tokens valid'
  if (s.includes('expired') || s.includes('refresh'))
    return 'Refreshing tokens\u2026'
  if (s.includes('offline') || s.includes('not running') || s.includes('failed'))
    return 'Daemon offline \u2014 using fallback'
  if (s.includes('warmup') || s.includes('starting'))
    return 'Starting daemon\u2026'
  // Fallback: truncate raw to something readable
  return raw.length > 30 ? raw.slice(0, 30) + '\u2026' : raw
}

// ─── Stage derivation ───

function deriveStages(
  phase: PatrolPhase,
  phaseTimings: Record<string, number> | undefined,
  phaseStartedAt: string | undefined,
  store: {
    totalFound?: number
    changedCases: number
    skippedCount?: number
    warmupStatus?: string
    processedCases: number
    totalCases: number
    currentAction?: string
    archivedCount?: number
    transferredCount?: number
  },
): StageState[] {
  const currentIdx = PHASE_ORDER.indexOf(phase)

  return STAGES.map((cfg, idx) => {
    // Derive status
    let status: StageStatus = 'pending'
    if (phase === 'completed') {
      status = 'completed'
    } else if (phase === 'failed') {
      status = idx <= currentIdx ? 'completed' : 'pending'
    } else if (currentIdx >= 0) {
      if (idx < currentIdx) status = 'completed'
      else if (idx === currentIdx) status = 'active'
    }

    // Timing
    const durationMs = status === 'completed' ? phaseTimings?.[cfg.phase] : undefined
    const liveStartedAt = status === 'active' && phaseStartedAt ? phaseStartedAt : undefined

    // Detail text per stage
    let detail = ''
    switch (cfg.phase) {
      case 'starting':
        detail = status === 'completed' ? 'SDK session launched' : 'Launching SDK session…'
        break
      case 'discovering':
        if (status === 'pending') {
          detail = ''
        } else if (store.totalFound !== undefined) {
          detail = `D365 query \u2192 ${store.totalFound} active cases`
        } else {
          detail = 'Querying D365\u2026'
        }
        break
      case 'filtering':
        if (status === 'pending') {
          detail = ''
        } else if (store.changedCases > 0 || store.skippedCount !== undefined ||
                   store.archivedCount !== undefined || store.transferredCount !== undefined) {
          const parts: string[] = []
          // Main count: cases to process
          parts.push(`${store.changedCases} to process`)
          // Skipped by patrolSkipHours (only meaningful in non-force mode)
          if (store.skippedCount && store.skippedCount > 0) {
            parts.push(`${store.skippedCount} skipped (recent)`)
          }
          // Archive/transfer results from detect-case-status.ps1
          if (store.archivedCount && store.archivedCount > 0) {
            parts.push(`${store.archivedCount} archived`)
          }
          if (store.transferredCount && store.transferredCount > 0) {
            parts.push(`${store.transferredCount} transferred`)
          }
          detail = parts.join(' \u00b7 ')
        } else {
          detail = 'Checking changes\u2026'
        }
        break
      case 'warming-up':
        if (status === 'pending') {
          detail = ''
        } else {
          detail = friendlyWarmupStatus(store.warmupStatus)
        }
        break
      case 'processing':
        // detail is handled specially in rendering (progress bar + currentAction)
        detail = ''
        break
      case 'aggregating':
        if (status === 'active') {
          detail = 'Aggregating todos\u2026'
        } else if (status === 'completed') {
          detail = 'Todos aggregated'
        }
        break
    }

    return { ...cfg, status, durationMs, liveStartedAt, detail }
  })
}

// ─── Icons ───

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path
        d="M2.5 6L5 8.5L9.5 3.5"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ─── Component ───

export default function PatrolSidebar() {
  const phase = usePatrolStore(s => s.phase)
  const phaseTimings = usePatrolStore(s => s.phaseTimings)
  const phaseStartedAt = usePatrolStore(s => s.phaseStartedAt)
  const totalFound = usePatrolStore(s => s.totalFound)
  const changedCases = usePatrolStore(s => s.changedCases)
  const skippedCount = usePatrolStore(s => s.skippedCount)
  const warmupStatus = usePatrolStore(s => s.warmupStatus)
  const processedCases = usePatrolStore(s => s.processedCases)
  const totalCases = usePatrolStore(s => s.totalCases)
  const currentAction = usePatrolStore(s => s.currentAction)
  const archivedCount = usePatrolStore(s => s.archivedCount)
  const transferredCount = usePatrolStore(s => s.transferredCount)

  if (phase === 'idle') return null

  const stages = deriveStages(phase, phaseTimings, phaseStartedAt, {
    totalFound, changedCases, skippedCount, warmupStatus,
    processedCases, totalCases, currentAction,
    archivedCount, transferredCount,
  })

  const progressPct = totalCases > 0 ? Math.round((processedCases / totalCases) * 100) : 0

  return (
    <Card padding="none">
      <div className="" style={{ padding: '16px 18px 10px', lineHeight: '16px' }}>
        {/* Title */}
        <span
          className="text-[11px] font-bold uppercase"
          style={{ letterSpacing: '0.8px', color: 'var(--text-tertiary)' }}
        >
          Pipeline
        </span>
      </div>

      <div className="" style={{ padding: '0 18px 18px' }}>
        {stages.map((stage, idx) => {
          const isLast = idx === stages.length - 1
          const nextStatus: StageStatus | undefined = isLast ? undefined : stages[idx + 1].status

          return (
            <div key={stage.id} className="relative flex gap-3" style={{ padding: '28px 0' }}>
              {/* Connecting line (between icon centers) */}
              {!isLast && (
                <div
                  className="absolute"
                  style={{
                    left: 11, // center of 24px icon
                    top: 60,  // below icon + padding
                    bottom: -20,
                    width: 2,
                    borderRadius: 1,
                    ...getLineStyle(stage.status, nextStatus),
                  }}
                />
              )}

              {/* Status icon */}
              <div className="relative flex-shrink-0 flex items-start" style={{ width: 24 }}>
                <div
                  className="flex items-center justify-center rounded-full"
                  style={{
                    width: 24,
                    height: 24,
                    ...getIconStyle(stage.status),
                    opacity: stage.status === 'pending' ? 0.35 : 1,
                  }}
                >
                  {stage.status === 'completed' && <CheckIcon />}
                  {stage.status === 'active' && (
                    <div
                      className="rounded-full"
                      style={{
                        width: 8,
                        height: 8,
                        background: 'var(--accent-blue)',
                        animation: 'sidebar-pulse 2s ease-in-out infinite',
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Content */}
              <div
                className="flex-1 min-w-0"
                style={{ opacity: stage.status === 'pending' ? 0.35 : 1 }}
              >
                {/* Label row: name + duration */}
                <div className="flex items-baseline justify-between gap-2">
                  <span
                    className="text-sm font-bold"
                    style={{ color: getNameColor(stage.status) }}
                  >
                    {stage.label}
                  </span>

                  {/* Duration */}
                  {stage.liveStartedAt ? (
                    <LiveTimer startedAt={stage.liveStartedAt} />
                  ) : stage.durationMs !== undefined ? (
                    <span
                      className="font-mono text-[11px]"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      {formatDuration(stage.durationMs)}
                    </span>
                  ) : null}
                </div>

                {/* Detail text */}
                {stage.phase === 'processing' && stage.status !== 'pending' ? (
                  <ProcessingDetail
                    status={stage.status}
                    processedCases={processedCases}
                    totalCases={totalCases}
                    progressPct={progressPct}
                    currentAction={currentAction}
                  />
                ) : stage.detail ? (
                  <p
                    className="text-xs"
                    style={{ marginTop: 3, color: 'var(--text-secondary)', lineHeight: 1.5 }}
                  >
                    {stage.detail}
                  </p>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes sidebar-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.7); }
        }
      `}</style>
    </Card>
  )
}

// ─── Processing stage sub-component ───

function ProcessingDetail({
  status,
  processedCases,
  totalCases,
  progressPct,
  currentAction,
}: {
  status: StageStatus
  processedCases: number
  totalCases: number
  progressPct: number
  currentAction?: string
}) {
  return (
    <div className="mt-1 space-y-1.5">
      {/* Case count */}
      <p
        className="text-xs"
        style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}
      >
        {processedCases} / {totalCases} cases
      </p>

      {/* Progress bar */}
      {totalCases > 0 && (
        <div className="flex items-center gap-2">
          <div
            className="flex-1 rounded-full overflow-hidden"
            style={{ height: 4, background: 'var(--bg-hover)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPct}%`,
                background: 'linear-gradient(90deg, var(--accent-green), var(--accent-blue))',
              }}
            />
          </div>
          <span
            className="font-mono text-[10px] flex-shrink-0"
            style={{ color: 'var(--text-tertiary)', minWidth: 28, textAlign: 'right' }}
          >
            {progressPct}%
          </span>
        </div>
      )}

      {/* Current action */}
      {status === 'active' && currentAction && (
        <div
          className="flex items-start gap-1.5 text-xs"
          style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}
        >
          <Loader2
            className="w-3 h-3 animate-spin flex-shrink-0"
            style={{ marginTop: 2, color: 'var(--accent-blue)' }}
          />
          <span className="break-words min-w-0">{currentAction}</span>
        </div>
      )}
    </div>
  )
}

// ─── Style helpers ───

function getIconStyle(status: StageStatus): React.CSSProperties {
  switch (status) {
    case 'completed':
      return { background: 'var(--accent-green)' }
    case 'active':
      return { border: '2.5px solid var(--accent-blue)', background: 'transparent' }
    case 'pending':
      return { border: '2px solid var(--border-default)', background: 'transparent' }
  }
}

function getNameColor(status: StageStatus): string {
  switch (status) {
    case 'completed': return 'var(--accent-green)'
    case 'active':    return 'var(--accent-blue)'
    case 'pending':   return 'var(--text-tertiary)'
  }
}

function getLineStyle(
  currentStatus: StageStatus,
  nextStatus: StageStatus | undefined,
): React.CSSProperties {
  if (currentStatus === 'completed' && nextStatus === 'completed') {
    return { background: 'var(--accent-green)', opacity: 0.3 }
  }
  if (currentStatus === 'completed' && nextStatus === 'active') {
    return {
      background: 'linear-gradient(180deg, var(--accent-green), var(--accent-blue))',
      opacity: 0.4,
    }
  }
  if (currentStatus === 'active') {
    return {
      background: 'linear-gradient(180deg, var(--accent-blue), var(--border-subtle))',
      opacity: 0.4,
    }
  }
  return { background: 'var(--border-subtle)' }
}

/**
 * PatrolHeader — Page title, Start/Cancel button, stat chips, elapsed timer
 */
import { useState, useEffect } from 'react'
import { Play, Square, Loader2, RotateCcw } from 'lucide-react'
import { usePatrolStore, type PatrolPhase } from '../../stores/patrolStore'
import { useStartPatrol, useCancelPatrol } from '../../api/hooks'

function formatElapsed(ms: number): string {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const h = Math.floor(m / 60)
  if (h > 0) return `${h}h ${m % 60}m ${s % 60}s`
  if (m > 0) return `${m}m ${s % 60}s`
  return `${s}s`
}

const RUNNING_PHASES: PatrolPhase[] = [
  'starting', 'discovering', 'filtering', 'warming-up', 'processing', 'aggregating',
]

export default function PatrolHeader() {
  const phase = usePatrolStore(s => s.phase)
  const totalCases = usePatrolStore(s => s.totalCases)
  const processedCases = usePatrolStore(s => s.processedCases)
  const startedAt = usePatrolStore(s => s.startedAt)
  const cases = usePatrolStore(s => s.cases)
  const error = usePatrolStore(s => s.error)

  const startPatrol = useStartPatrol()
  const cancelPatrol = useCancelPatrol()

  const isRunning = RUNNING_PHASES.includes(phase)
  const isCompleted = phase === 'completed'
  const isFailed = phase === 'failed'

  // Derive stats
  const activeCases = Object.values(cases).filter(c => {
    const hasActive = Object.values(c.steps).some(s => s.status === 'active')
    return hasActive
  }).length

  const queuedCases = totalCases - processedCases - activeCases

  // Elapsed timer
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    if (!isRunning || !startedAt) {
      if (startedAt && (isCompleted || isFailed)) {
        setElapsed(Date.now() - new Date(startedAt).getTime())
      }
      return
    }
    const start = new Date(startedAt).getTime()
    setElapsed(Date.now() - start)
    const timer = setInterval(() => setElapsed(Date.now() - start), 1000)
    return () => clearInterval(timer)
  }, [isRunning, startedAt, isCompleted, isFailed])

  const handleStart = () => {
    usePatrolStore.getState().start()
    startPatrol.mutate(true)
  }

  const handleCancel = () => {
    cancelPatrol.mutate()
  }

  const handleReset = () => {
    usePatrolStore.getState().reset()
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Left: title + status */}
      <div className="flex items-center gap-3">
        <h1
          className="text-xl font-semibold"
          style={{ color: 'var(--text-primary)', letterSpacing: '-0.3px' }}
        >
          Patrol
        </h1>

        {/* Phase badge */}
        {phase !== 'idle' && (
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide"
            style={{
              background: isRunning
                ? 'var(--accent-blue-dim)'
                : isCompleted
                  ? 'var(--accent-green-dim)'
                  : 'var(--accent-red-dim)',
              color: isRunning
                ? 'var(--accent-blue)'
                : isCompleted
                  ? 'var(--accent-green)'
                  : 'var(--accent-red)',
            }}
          >
            {isRunning && <Loader2 className="w-3 h-3 animate-spin" />}
            {phase}
          </span>
        )}

        {/* Elapsed */}
        {startedAt && elapsed > 0 && (
          <span
            className="text-xs font-mono"
            style={{ color: 'var(--text-tertiary)' }}
          >
            {formatElapsed(elapsed)}
          </span>
        )}
      </div>

      {/* Right: stat chips + action button */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Stat chips */}
        {(isRunning || isCompleted || isFailed) && (
          <div className="flex items-center gap-2">
            <StatChip label="Total" value={totalCases} color="var(--text-secondary)" />
            <StatChip label="Done" value={processedCases} color="var(--accent-green)" />
            <StatChip label="Active" value={activeCases} color="var(--accent-blue)" />
            <StatChip label="Queue" value={Math.max(0, queuedCases)} color="var(--text-tertiary)" />
          </div>
        )}

        {/* Error message */}
        {error && (
          <span className="text-xs" style={{ color: 'var(--accent-red)' }}>
            {error}
          </span>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {isRunning ? (
            <button
              onClick={handleCancel}
              disabled={cancelPatrol.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wide transition-all"
              style={{
                background: 'var(--accent-red)',
                color: 'var(--text-inverse)',
                border: '1px solid rgba(0,0,0,0.1)',
                opacity: cancelPatrol.isPending ? 0.6 : 1,
                cursor: cancelPatrol.isPending ? 'not-allowed' : 'pointer',
              }}
            >
              {cancelPatrol.isPending
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Square className="w-4 h-4" />
              }
              Cancel
            </button>
          ) : (
            <>
              <button
                onClick={handleStart}
                disabled={startPatrol.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wide transition-all"
                style={{
                  background: 'var(--accent-blue)',
                  color: 'var(--text-inverse)',
                  border: '1px solid rgba(0,0,0,0.1)',
                  boxShadow: 'rgba(0,0,0,0.06) 0 1px 3px 0 inset',
                  opacity: startPatrol.isPending ? 0.6 : 1,
                  cursor: startPatrol.isPending ? 'not-allowed' : 'pointer',
                }}
              >
                {startPatrol.isPending
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Play className="w-4 h-4" />
                }
                Start Patrol
              </button>
              {(isCompleted || isFailed) && (
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors"
                  style={{ color: 'var(--text-tertiary)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                  title="Clear results"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function StatChip({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs"
      style={{ background: 'var(--bg-hover)' }}
    >
      <span className="font-medium uppercase tracking-wide" style={{ color: 'var(--text-tertiary)', fontSize: 10 }}>
        {label}
      </span>
      <span className="font-bold font-mono" style={{ color }}>
        {value}
      </span>
    </div>
  )
}

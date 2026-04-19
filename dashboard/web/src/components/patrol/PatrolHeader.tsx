/**
 * PatrolHeader — Slim header: title, phase badge, timer, error, action buttons
 *
 * Timer display:
 *   - Running:   live counter "4m 32s"
 *   - Completed: "Completed in 5m 32s · 14:23 → 14:28"
 *   - Failed:    "Failed after 3m 12s · 14:23 → 14:26"
 *
 * Stat chips moved to PatrolPage (separate row).
 */
import { useState, useEffect, useRef } from 'react'
import { Loader2 } from 'lucide-react'
import { usePatrolStore, type PatrolPhase } from '../../stores/patrolStore'

function formatElapsed(ms: number): string {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const h = Math.floor(m / 60)
  if (h > 0) return `${h}h ${m % 60}m ${s % 60}s`
  if (m > 0) return `${m}m ${s % 60}s`
  return `${s}s`
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const RUNNING_PHASES: PatrolPhase[] = [
  'starting', 'discovering', 'filtering', 'warming-up', 'processing', 'aggregating',
]

export default function PatrolHeader() {
  const phase = usePatrolStore(s => s.phase)
  const startedAt = usePatrolStore(s => s.startedAt)
  const completedAt = usePatrolStore(s => s.completedAt)
  const error = usePatrolStore(s => s.error)

  const isRunning = RUNNING_PHASES.includes(phase)
  const isCompleted = phase === 'completed'
  const isFailed = phase === 'failed'
  const isDone = isCompleted || isFailed

  // ── Total elapsed timer ──
  // Uses a ref to lock in the start time once, immune to SSE overwrites.
  // store.start() sets an optimistic startedAt; SSE later sends the
  // orchestrator's startedAt (a few hundred ms different). Without the ref,
  // useEffect would re-trigger and reset the counter on every such change.
  const startTimeRef = useRef<number | null>(null)
  const [elapsed, setElapsed] = useState(0)

  // Lock start time on first running frame; clear on idle
  useEffect(() => {
    if ((isRunning || isDone) && startedAt && startTimeRef.current === null) {
      startTimeRef.current = new Date(startedAt).getTime()
    }
    if (phase === 'idle') {
      startTimeRef.current = null
      setElapsed(0)
    }
  }, [isRunning, isDone, startedAt, phase])

  // Live counter (running) or frozen snapshot (done)
  useEffect(() => {
    const origin = startTimeRef.current
    if (!origin) return

    if (isDone) {
      const end = completedAt ? new Date(completedAt).getTime() : Date.now()
      setElapsed(end - origin)
      return
    }

    if (!isRunning) return

    setElapsed(Date.now() - origin)
    const timer = setInterval(() => setElapsed(Date.now() - origin), 1000)
    return () => clearInterval(timer)
  }, [isRunning, isDone, completedAt, startTimeRef.current])

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <h1
        className="text-2xl font-extrabold"
        style={{ color: 'var(--text-primary)', letterSpacing: '-0.5px' }}
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

      {/* Timer — contextual display */}
      {startedAt && elapsed > 0 && (
        <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-tertiary)' }}>
          {isRunning ? (
            <span className="font-mono">{formatElapsed(elapsed)}</span>
          ) : isDone ? (
            <>
              <span className="font-mono font-medium" style={{
                color: isCompleted ? 'var(--accent-green)' : 'var(--accent-red)',
              }}>
                {formatElapsed(elapsed)}
              </span>
              <span style={{ opacity: 0.6 }}>·</span>
              <span style={{ opacity: 0.7 }}>
                {formatTime(startedAt)}
                {completedAt && <> → {formatTime(completedAt)}</>}
              </span>
            </>
          ) : null}
        </div>
      )}

      {/* Error */}
      {error && (
        <span className="text-xs" style={{ color: 'var(--accent-red)' }}>
          {error}
        </span>
      )}
    </div>
  )
}

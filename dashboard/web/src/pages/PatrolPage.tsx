/**
 * PatrolPage — Sidebar + Content layout
 *
 * Layout:
 *   ┌─ Sidebar (260px, sticky) ─┬─ Content (flex:1) ────────────────┐
 *   │  PatrolSidebar             │  PatrolHeader (slim)               │
 *   │  (vertical pipeline)       │  StatRow (chips)                   │
 *   │                            │  PatrolCaseList                    │
 *   └────────────────────────────┴───────────────────────────────────┘
 *
 * State flow:
 *   - Mount: one-time hydration from GET /api/patrol/status
 *   - Real-time: SSE 'patrol-state' events via patrolStore.onPatrolState()
 *   - No periodic polling — SSE is the sole real-time channel
 *     (SSE has lastSeq replay + exponential backoff reconnect)
 *
 * caseStates stale filtering & stuck-step fixup is handled server-side
 * in the /api/patrol/status endpoint — frontend just passes data through.
 */
import { useEffect } from 'react'
import { Play, Square, Loader2, RotateCcw } from 'lucide-react'
import { usePatrolStore, type PatrolPhase } from '../stores/patrolStore'
import { useStartPatrol, useCancelPatrol } from '../api/hooks'
import PatrolHeader from '../components/patrol/PatrolHeader'
import PatrolSidebar from '../components/patrol/PatrolSidebar'
import PatrolCaseList from '../components/patrol/PatrolCaseList'

const RUNNING_PHASES: PatrolPhase[] = [
  'starting', 'discovering', 'filtering', 'warming-up', 'processing', 'aggregating',
]

export default function PatrolPage() {
  const phase = usePatrolStore(s => s.phase)
  const totalCases = usePatrolStore(s => s.totalCases)
  const processedCases = usePatrolStore(s => s.processedCases)
  const cases = usePatrolStore(s => s.cases)

  // One-time hydration on mount — SSE handles all subsequent updates
  useEffect(() => {
    fetch('/api/patrol/status')
      .then(r => r.json())
      .then((status: any) => {
        const store = usePatrolStore.getState()
        const ps = status.patrolState

        if (ps) {
          // Hydrate global patrol state from StateManager snapshot
          store.onPatrolState(ps)
        }

        // Hydrate per-case state (already filtered/fixed by API)
        if (status.caseStates) {
          for (const [cn, cs] of Object.entries(status.caseStates)) {
            if (cs && typeof cs === 'object') {
              store.onCaseUpdate({ caseNumber: cn, ...(cs as any) })
            }
          }
        }
      })
      .catch(() => {})
  }, [])

  const isIdle = phase === 'idle'
  const isRunning = RUNNING_PHASES.includes(phase)
  const isCompleted = phase === 'completed'
  const isFailed = phase === 'failed'

  const startPatrol = useStartPatrol()
  const cancelPatrol = useCancelPatrol()

  const handleStart = () => {
    usePatrolStore.getState().start()
    startPatrol.mutate(true)
  }
  const handleCancel = () => cancelPatrol.mutate()
  const handleReset = () => usePatrolStore.getState().reset()

  // Derive stat values for the stat row
  const activeCases = Object.values(cases).filter(c =>
    Object.values(c.steps).some(s => s.status === 'active')
  ).length
  const queuedCases = Math.max(0, totalCases - processedCases - activeCases)

  return (
    <div className="space-y-5">
      {/* Header: title + badge + timer ... stats ... button (full width) */}
      <div className="flex items-center gap-4">
        <PatrolHeader />

        <div className="flex items-center gap-4 ml-auto">
          {/* Stat chips */}
          {!isIdle && (
            <>
              <StatChip label="Total" value={totalCases} color="var(--text-secondary)" />
              <StatChip label="Done" value={processedCases} color="var(--accent-green)" />
              <StatChip label="Active" value={activeCases} color="var(--accent-blue)" />
              <StatChip label="Queue" value={queuedCases} color="var(--text-tertiary)" />
            </>
          )}

          {/* Action button — rightmost */}
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
              {cancelPatrol.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Square className="w-4 h-4" />}
              Cancel
            </button>
          ) : (
            <div className="flex items-center gap-2">
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
                {startPatrol.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
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
            </div>
          )}
        </div>
      </div>

      {/* Sidebar + Content */}
      <div className="flex gap-6 items-start">
        {/* Left sidebar */}
        {!isIdle && (
          <div className="w-[260px] flex-shrink-0 sticky top-7">
            <PatrolSidebar />
          </div>
        )}

        {/* Right content: case list */}
        <div className="flex-1 min-w-0">
          <PatrolCaseList />
        </div>
      </div>
    </div>
  )
}

function StatChip({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col items-center" style={{ minWidth: 40 }}>
      <span className="font-mono text-xl font-bold" style={{ color, lineHeight: 1.1 }}>
        {value}
      </span>
      <span
        className="font-semibold uppercase tracking-widest"
        style={{ color: 'var(--text-tertiary)', fontSize: 8 }}
      >
        {label}
      </span>
    </div>
  )
}

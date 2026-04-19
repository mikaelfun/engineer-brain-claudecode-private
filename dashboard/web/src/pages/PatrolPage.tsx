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
import { usePatrolStore } from '../stores/patrolStore'
import PatrolHeader from '../components/patrol/PatrolHeader'
import PatrolSidebar from '../components/patrol/PatrolSidebar'
import PatrolCaseList from '../components/patrol/PatrolCaseList'

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

  // Derive stat values for the stat row
  const activeCases = Object.values(cases).filter(c =>
    Object.values(c.steps).some(s => s.status === 'active')
  ).length
  const queuedCases = Math.max(0, totalCases - processedCases - activeCases)

  return (
    <div className="flex gap-6 items-start">
      {/* Left sidebar — only show when not idle */}
      {!isIdle && (
        <div className="w-[260px] flex-shrink-0 sticky top-7">
          <PatrolSidebar />
        </div>
      )}

      {/* Right content */}
      <div className="flex-1 min-w-0 space-y-5">
        <PatrolHeader />

        {/* Stat chips row */}
        {!isIdle && (
          <div className="flex items-center gap-3">
            <StatChip label="Total" value={totalCases} color="var(--text-secondary)" />
            <StatChip label="Done" value={processedCases} color="var(--accent-green)" />
            <StatChip label="Active" value={activeCases} color="var(--accent-blue)" />
            <StatChip label="Queue" value={queuedCases} color="var(--text-tertiary)" />
          </div>
        )}

        <PatrolCaseList />
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

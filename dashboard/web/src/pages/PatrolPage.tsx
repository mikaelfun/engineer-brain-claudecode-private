/**
 * PatrolPage — Independent patrol page
 *
 * Composes: PatrolHeader + PatrolGlobalPipeline + PatrolCaseList
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
import PatrolGlobalPipeline from '../components/patrol/PatrolGlobalPipeline'
import PatrolCaseList from '../components/patrol/PatrolCaseList'

export default function PatrolPage() {
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

  return (
    <div className="space-y-5">
      <PatrolHeader />
      <PatrolGlobalPipeline />
      <PatrolCaseList />
    </div>
  )
}

/**
 * PatrolPage — Independent patrol page
 *
 * Composes: PatrolHeader + PatrolGlobalPipeline + PatrolCaseList
 * Hydrates store on mount from /api/patrol/status
 */
import { useEffect } from 'react'
import { usePatrolStore } from '../stores/patrolStore'
import PatrolHeader from '../components/patrol/PatrolHeader'
import PatrolGlobalPipeline from '../components/patrol/PatrolGlobalPipeline'
import PatrolCaseList from '../components/patrol/PatrolCaseList'

export default function PatrolPage() {
  // Hydrate store from backend on mount
  useEffect(() => {
    fetch('/api/patrol/status')
      .then(r => r.json())
      .then((status: any) => {
        const store = usePatrolStore.getState()

        // If backend says running — hydrate live progress
        if (status.running && status.liveProgress) {
          const lp = status.liveProgress
          store.onPatrolState({
            phase: lp.phase || 'processing',
            totalCases: lp.totalCases,
            changedCases: lp.changedCases,
            processedCases: lp.processedCases,
            caseList: lp.caseList,
            startedAt: lp.startedAt,
          })

          // Hydrate per-case state
          if (lp.caseStates && typeof lp.caseStates === 'object') {
            for (const [cn, cs] of Object.entries(lp.caseStates)) {
              store.onCaseUpdate({ caseNumber: cn, ...(cs as object) })
            }
          }
        } else if (!status.running && status.lastRun && store.phase === 'idle') {
          // Not running but has last run — show completed state
          const lr = status.lastRun
          if (lr.phase === 'completed' || lr.phase === 'failed') {
            store.onPatrolState({
              phase: lr.phase,
              totalCases: lr.totalCases ?? 0,
              changedCases: lr.changedCases ?? 0,
              processedCases: lr.processedCases ?? 0,
              startedAt: lr.startedAt,
            })
          }
        }
      })
      .catch(() => { /* ignore hydration errors */ })
  }, [])

  return (
    <div className="space-y-5">
      <PatrolHeader />
      <PatrolGlobalPipeline />
      <PatrolCaseList />
    </div>
  )
}

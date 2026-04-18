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
  // Hydrate store from backend on mount + periodic reconciliation
  useEffect(() => {
    function reconcile() {
      fetch('/api/patrol/status')
        .then(r => r.json())
        .then((status: any) => {
          const store = usePatrolStore.getState()

          if (status.running && status.liveProgress) {
            // Backend says running — hydrate live progress
            const lp = status.liveProgress
            store.onPatrolState({
              phase: lp.phase || 'processing',
              totalCases: lp.totalCases,
              changedCases: lp.changedCases,
              processedCases: lp.processedCases,
              caseList: lp.caseList,
              startedAt: lp.startedAt,
            })
            if (lp.caseStates && typeof lp.caseStates === 'object') {
              for (const [cn, cs] of Object.entries(lp.caseStates)) {
                store.onCaseUpdate({ caseNumber: cn, ...(cs as object) })
              }
            }
          } else if (!status.running) {
            // Backend says NOT running
            const isStoreRunning = !['idle', 'completed', 'failed'].includes(store.phase)
            if (isStoreRunning) {
              // Store thinks patrol is running but backend says no → force complete/fail
              const lr = status.lastRun
              store.onPatrolState({
                phase: lr?.phase || 'completed',
                totalCases: lr?.totalCases ?? store.totalCases,
                changedCases: lr?.changedCases ?? store.changedCases,
                processedCases: lr?.processedCases ?? store.processedCases,
                startedAt: lr?.startedAt ?? store.startedAt,
                error: lr?.error,
              })
            } else if (store.phase === 'idle' && status.lastRun) {
              // First load — show last run result
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
          }
        })
        .catch(() => {})
    }

    reconcile() // Initial hydration

    // Poll every 8s while patrol is running (SSE fallback)
    const interval = setInterval(() => {
      const { phase } = usePatrolStore.getState()
      if (!['idle', 'completed', 'failed'].includes(phase)) {
        reconcile()
      }
    }, 8_000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-5">
      <PatrolHeader />
      <PatrolGlobalPipeline />
      <PatrolCaseList />
    </div>
  )
}

/**
 * PatrolPage — Independent patrol page
 *
 * Composes: PatrolHeader + PatrolGlobalPipeline + PatrolCaseList
 * Hydrates store on mount from /api/patrol/status (includes per-case state.json)
 */
import { useEffect } from 'react'
import { usePatrolStore } from '../stores/patrolStore'
import PatrolHeader from '../components/patrol/PatrolHeader'
import PatrolGlobalPipeline from '../components/patrol/PatrolGlobalPipeline'
import PatrolCaseList from '../components/patrol/PatrolCaseList'

/** Hydrate per-case state from backend caseStates map.
 *  Filters stale data and fixes stuck 'active' steps when patrol is done. */
function hydrateCaseStates(caseStates: Record<string, any>, patrolStartedAt?: string, patrolDone?: boolean) {
  const store = usePatrolStore.getState()
  const cutoff = patrolStartedAt ? new Date(patrolStartedAt).getTime() - 60_000 : 0 // 1min grace
  for (const [cn, cs] of Object.entries(caseStates)) {
    if (!cs || typeof cs === 'string') continue
    // Skip stale case state from previous patrol
    if (cutoff > 0 && cs.updatedAt) {
      const updated = new Date(cs.updatedAt).getTime()
      if (updated < cutoff) continue
    }
    // Fix stuck 'active' steps when patrol has completed
    if (patrolDone && cs.steps) {
      for (const step of Object.values(cs.steps) as any[]) {
        if (step?.status === 'active') step.status = 'completed'
      }
    }
    store.onCaseUpdate({ caseNumber: cn, ...cs })
  }
}

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
          } else if (!status.running) {
            // Backend says NOT running
            const isStoreRunning = !['idle', 'completed', 'failed'].includes(store.phase)
            if (isStoreRunning) {
              // Store thinks running but backend says no → force complete/fail
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

          // Hydrate per-case state from disk — filter by patrol start time
          if (status.caseStates && Object.keys(status.caseStates).length > 0) {
            // Use current patrol's startedAt (running) or lastRun's startedAt (completed)
            const patrolStart = status.running
              ? (status.liveProgress?.startedAt || store.startedAt)
              : status.lastRun?.startedAt
            const patrolDone = !status.running && ['completed', 'failed'].includes(status.lastRun?.phase)
            hydrateCaseStates(status.caseStates, patrolStart, patrolDone)
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

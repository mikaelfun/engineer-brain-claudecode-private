/**
 * Dashboard — Command Center v2
 *
 * Three-zone layout:
 * 1. Actions & Todo list (urgency-scored)
 * 2. Case Pipeline (4-column Kanban)
 * 3. Health Metrics + Activity Feed (bottom)
 *
 * Keyboard shortcuts: j/k navigate actions, Enter opens case, p scrolls to pipeline
 */
import { useState, useRef, useMemo } from 'react'
import { Loading, ErrorState } from '../components/common/Loading'
import { useCases } from '../api/hooks'
import {
  DashboardTopBar,
  ActionsList,
  CasePipeline,
  HealthMetrics,
  ActivityFeed,
} from '../components/dashboard'
import { useDashboardKeys } from '../hooks/useDashboardKeys'
import { classifyCase } from './CasesPage'
import { computeUrgencyScore } from '../utils/urgencyScore'

export default function Dashboard() {
  const { data: casesData, isLoading, error } = useCases()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const pipelineRef = useRef<HTMLDivElement>(null)

  const cases = casesData?.cases || []

  // Build action items list for keyboard navigation (mirrors ActionsList logic)
  const actionItems = useMemo(() => {
    return cases.map((c: any) => ({
      id: c.caseNumber ?? c.id,
      caseNumber: c.caseNumber ?? c.id,
    }))
  }, [cases])

  // Keyboard shortcuts
  useDashboardKeys({
    actionItems,
    selectedIndex,
    setSelectedIndex,
    pipelineRef,
  })

  if (isLoading) return <Loading text="Loading Command Center..." />
  if (error) return <ErrorState message="Failed to load cases" onRetry={() => window.location.reload()} />

  // Classify cases for stat badges
  const classifications = cases.map((c: any) => ({ case: c, ...classifyCase(c) }))
  const slaRiskCount = classifications.filter((c: any) => c.slaAtRisk).length
  const needActionCount = classifications.filter((c: any) => c.needsMyAction).length

  // Placeholder for last patrol time — will be wired when patrol store exposes timestamp
  const lastPatrolTime: string | null = null

  return (
    <div className="space-y-5">
      {/* Top Bar — greeting, badges, patrol */}
      <DashboardTopBar
        slaRiskCount={slaRiskCount}
        needActionCount={needActionCount}
        lastPatrolTime={lastPatrolTime}
        totalCases={cases.length}
      />

      {/* Zone 1 + Zone 2: Actions + Pipeline (side by side on wide screens) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Zone 1: Actions & Todo List */}
        <div className="lg:col-span-2">
          <ActionsList
            cases={cases}
            className="h-full"
            selectedIndex={selectedIndex}
            onSelectedIndexChange={setSelectedIndex}
          />
        </div>

        {/* Zone 2: Case Pipeline */}
        <div className="lg:col-span-3" ref={pipelineRef}>
          <CasePipeline cases={cases} className="h-full" />
        </div>
      </div>

      {/* Zone 3: Health Metrics + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <HealthMetrics cases={cases} />
        <ActivityFeed cases={cases} />
      </div>
    </div>
  )
}

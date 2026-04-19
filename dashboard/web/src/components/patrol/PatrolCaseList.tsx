/**
 * PatrolCaseList — Sorted case list with progress bar
 *
 * Shows phase-appropriate content:
 * - Pre-processing phases: status message with spinner
 * - Processing/completed: per-case pipeline rows
 */
import { useMemo } from 'react'
import { usePatrolStore, type CaseState, type PatrolPhase } from '../../stores/patrolStore'
import { Card, CardHeader } from '../common/Card'
import PatrolCaseRow from './PatrolCaseRow'

function isCaseActive(c: CaseState): boolean {
  return Object.values(c.steps).some(s => s.status === 'active')
}

function isCaseComplete(c: CaseState): boolean {
  const sum = c.steps?.summarize
  const act = c.steps?.act
  return (
    sum?.status === 'completed' ||
    sum?.status === 'skipped' ||
    (act?.status === 'completed' && sum?.status !== 'active')
  )
}

function sortCases(cases: CaseState[]): CaseState[] {
  return [...cases].sort((a, b) => {
    const aActive = isCaseActive(a)
    const bActive = isCaseActive(b)
    const aComplete = isCaseComplete(a)
    const bComplete = isCaseComplete(b)

    if (aActive && !bActive) return -1
    if (!aActive && bActive) return 1
    if (!aComplete && bComplete) return -1
    if (aComplete && !bComplete) return 1
    return a.caseNumber.localeCompare(b.caseNumber)
  })
}

/** Phase-specific status messages shown before cases are available */
const PHASE_STATUS: Partial<Record<PatrolPhase, { icon: string; text: string }>> = {
  starting:      { icon: '🚀', text: 'Launching patrol agent...' },
  discovering:   { icon: '🔍', text: 'Querying D365 for active cases...' },
  filtering:     { icon: '📋', text: 'Checking which cases have changes...' },
  'warming-up':  { icon: '🔑', text: 'Warming up tokens (Teams / ICM / DTM)...' },
  aggregating:   { icon: '📊', text: 'Aggregating todos...' },
}

export default function PatrolCaseList() {
  const cases = usePatrolStore(s => s.cases)
  const totalCases = usePatrolStore(s => s.totalCases)
  const processedCases = usePatrolStore(s => s.processedCases)
  const phase = usePatrolStore(s => s.phase)
  const caseList = usePatrolStore(s => s.caseList)

  const sortedCases = useMemo(() => sortCases(Object.values(cases)), [cases])

  const queuedOnly = useMemo(() => {
    const inStore = new Set(Object.keys(cases))
    return caseList.filter(cn => !inStore.has(cn))
  }, [cases, caseList])

  if (phase === 'idle') return null

  const hasCases = sortedCases.length > 0 || queuedOnly.length > 0
  const showProgress = totalCases > 0
  const pct = totalCases > 0 ? Math.round((processedCases / totalCases) * 100) : 0

  // Pre-processing phases: show status message, not case list
  const phaseStatus = PHASE_STATUS[phase]
  if (phaseStatus && !hasCases) {
    return (
      <Card padding="none">
        <div className="flex items-center justify-center gap-3 py-12">
          <span className="text-xl">{phaseStatus.icon}</span>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {phaseStatus.text}
            </p>
            {phase === 'filtering' && totalCases > 0 && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                {totalCases} active cases found
              </p>
            )}
          </div>
          {/* Spinner */}
          <div
            className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--accent-blue)', borderTopColor: 'transparent' }}
          />
        </div>
      </Card>
    )
  }

  return (
    <Card padding="none">
      <div className="px-4 pt-4 pb-2">
        <CardHeader
          title="Cases"
          subtitle={showProgress ? `${processedCases} / ${totalCases} processed` : undefined}
        />

        {/* Progress bar */}
        {showProgress && (
          <div className="mt-1 mb-2">
            <div
              className="w-full rounded-full overflow-hidden"
              style={{ height: 4, background: 'var(--bg-inset)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${pct}%`,
                  background: phase === 'completed'
                    ? 'var(--accent-green)'
                    : phase === 'failed'
                      ? 'var(--accent-red)'
                      : 'var(--accent-blue)',
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Case rows */}
      <div className="px-2 pb-2 space-y-0.5">
        {sortedCases.map(c => (
          <PatrolCaseRow
            key={c.caseNumber}
            caseState={c}
            isExpanded={isCaseActive(c) || !isCaseComplete(c)}
          />
        ))}

        {/* Queued cases (in caseList but not yet started) */}
        {queuedOnly.map(cn => (
          <div
            key={cn}
            className="flex items-center gap-3 px-3 py-2"
          >
            <span
              className="text-xs font-medium"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: 'var(--text-tertiary)',
                minWidth: 100,
              }}
            >
              {cn}
            </span>
            <div className="flex items-center gap-1.5">
              {[0, 1, 2, 3].map(i => (
                <div
                  key={i}
                  className="rounded-full"
                  style={{
                    width: 7,
                    height: 7,
                    background: 'var(--text-tertiary)',
                    opacity: 0.3,
                  }}
                />
              ))}
            </div>
            <div className="flex-1" />
            <span
              className="text-[10px] font-medium uppercase tracking-wide"
              style={{ color: 'var(--text-tertiary)', opacity: 0.5 }}
            >
              Queued
            </span>
          </div>
        ))}

        {/* Aggregating phase (after processing, before final) */}
        {phase === 'aggregating' && sortedCases.length > 0 && (
          <div className="flex items-center justify-center gap-2 py-4">
            <span>📊</span>
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Aggregating todos...
            </span>
            <div
              className="w-3 h-3 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: 'var(--accent-blue)', borderTopColor: 'transparent' }}
            />
          </div>
        )}
      </div>
    </Card>
  )
}

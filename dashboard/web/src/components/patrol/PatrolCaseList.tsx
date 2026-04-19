/**
 * PatrolCaseList — Sorted case list with progress bar
 */
import { useMemo } from 'react'
import { usePatrolStore, type CaseState } from '../../stores/patrolStore'
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

    // Active first
    if (aActive && !bActive) return -1
    if (!aActive && bActive) return 1

    // Then queued (not complete, not active)
    if (!aComplete && bComplete) return -1
    if (aComplete && !bComplete) return 1

    // Same group: alphabetical
    return a.caseNumber.localeCompare(b.caseNumber)
  })
}

export default function PatrolCaseList() {
  const cases = usePatrolStore(s => s.cases)
  const totalCases = usePatrolStore(s => s.totalCases)
  const processedCases = usePatrolStore(s => s.processedCases)
  const phase = usePatrolStore(s => s.phase)
  const caseList = usePatrolStore(s => s.caseList)

  const sortedCases = useMemo(() => sortCases(Object.values(cases)), [cases])

  // Build queued-only cases (in caseList but not yet in cases store)
  const queuedOnly = useMemo(() => {
    const inStore = new Set(Object.keys(cases))
    return caseList.filter(cn => !inStore.has(cn))
  }, [cases, caseList])

  const showProgress = totalCases > 0 && phase !== 'idle'
  const pct = totalCases > 0 ? Math.round((processedCases / totalCases) * 100) : 0

  if (phase === 'idle') return null

  return (
    <Card padding="none">
      <div className="px-4 pt-4 pb-2">
        <CardHeader
          title="Cases"
          subtitle={totalCases > 0 ? `${processedCases} / ${totalCases} processed` : undefined}
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

        {/* Queued cases (not yet in store — show as grey placeholders) */}
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

        {/* Empty state */}
        {sortedCases.length === 0 && queuedOnly.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              {phase === 'starting' || phase === 'discovering'
                ? 'Discovering cases...'
                : 'No cases to process'
              }
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}

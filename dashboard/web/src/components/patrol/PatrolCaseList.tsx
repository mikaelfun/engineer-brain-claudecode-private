/**
 * PatrolCaseList — Sorted case list with progress bar
 *
 * Shows per-case pipeline rows with a section header and progress bar.
 * Phase status messages are handled by the sidebar.
 */
import { useMemo } from 'react'
import { usePatrolStore, type CaseState } from '../../stores/patrolStore'
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

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center gap-3 px-1 pb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Cases
          </h3>
          {totalCases > 0 && (
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
              {processedCases} / {totalCases} processed
            </p>
          )}
        </div>

        {/* Progress bar */}
        {totalCases > 0 && (
          <div className="w-full max-w-[220px] rounded-full overflow-hidden" style={{ height: 5, background: 'var(--bg-hover)' }}>
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${Math.round((processedCases / totalCases) * 100)}%`,
                background: phase === 'completed' ? 'var(--accent-green)' : 'linear-gradient(90deg, var(--accent-green), var(--accent-blue))',
              }}
            />
          </div>
        )}
      </div>

      {/* Case rows */}
      <div className="space-y-0.5">
        {sortedCases.map(c => (
          <PatrolCaseRow
            key={c.caseNumber}
            caseState={c}
            defaultExpanded={isCaseActive(c) || !isCaseComplete(c)}
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
    </div>
  )
}

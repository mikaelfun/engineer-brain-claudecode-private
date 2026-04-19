/**
 * PatrolCaseList — Sorted case list with progress bar
 *
 * Shows per-case pipeline rows with a section header and progress bar.
 * Wrapped in a Card to match the Pipeline sidebar's visual level.
 * Phase status messages are handled by the sidebar.
 */
import { useMemo } from 'react'
import { usePatrolStore, type CaseState } from '../../stores/patrolStore'
import { Card } from '../common/Card'
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
    <Card padding="none" style={{ background: 'var(--bg-base)' }}>
      {/* Section header — matches sidebar's "PIPELINE" label style exactly:
          same padding (16px 18px 10px), same 11px uppercase bold, same color */}
      <div style={{ padding: '16px 18px 10px' }}>
        <div className="flex items-center gap-3" style={{ lineHeight: '16px' }}>
          <span
            className="text-[11px] font-bold uppercase"
            style={{ letterSpacing: '0.8px', color: 'var(--text-tertiary)' }}
          >
            Cases
          </span>
          {totalCases > 0 && (
            <span
              className="text-[11px] font-medium"
              style={{ color: 'var(--text-tertiary)', letterSpacing: '0.3px' }}
            >
              {processedCases} / {totalCases}
            </span>
          )}
          {totalCases > 0 && (
            <div className="flex-1 max-w-[180px] rounded-full overflow-hidden" style={{ height: 4, background: 'var(--bg-hover)' }}>
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${Math.round((processedCases / totalCases) * 100)}%`,
                  background: 'linear-gradient(90deg, var(--accent-green), var(--accent-blue))',
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Case rows — inner padding matches sidebar (0 18px 18px) */}
      <div className="space-y-2.5" style={{ padding: '0 18px 18px' }}>
        {sortedCases.map(c => (
          <PatrolCaseRow
            key={c.caseNumber}
            caseState={c}
            defaultExpanded={isCaseActive(c) || !isCaseComplete(c)}
          />
        ))}

        {/* Queued cases — faded card style matching mockup (.cc.q) */}
        {queuedOnly.map(cn => (
          <div
            key={cn}
            className="rounded-xl"
            style={{
              opacity: 0.3,
              border: '1px solid var(--border-subtle)',
              background: 'transparent',
            }}
          >
            <div
              className="flex items-center gap-3"
              style={{ padding: '14px 20px' }}
            >
              <span
                className="text-[15px] font-bold"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  color: 'var(--text-tertiary)',
                }}
              >
                {cn}
              </span>
              <div className="flex-1" />
              <span
                className="text-[11px] font-medium uppercase tracking-wide"
                style={{ color: 'var(--text-tertiary)' }}
              >
                Queued
              </span>
            </div>
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

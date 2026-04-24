/**
 * PatrolCaseList — Sorted case list with progress bar
 *
 * Shows per-case pipeline rows with a section header and progress bar.
 * Wrapped in a Card to match the Pipeline sidebar's visual level.
 * Phase status messages are handled by the sidebar.
 */
import { useMemo, useEffect, useState } from 'react'
import { usePatrolStore, type CaseState, type PatrolPhase } from '../../stores/patrolStore'
import { Card } from '../common/Card'
import PatrolCaseRow from './PatrolCaseRow'
import { apiGet } from '../../api/client'

const RUNNING_PHASES: PatrolPhase[] = [
  'initializing', 'processing', 'finalizing',
]

function isCaseActive(c: CaseState): boolean {
  return Object.values(c.steps).some(s =>
    s.status === 'active' || (s.status as string) === 'waiting-troubleshooter'
  )
}

function isCaseComplete(c: CaseState): boolean {
  const sum = c.steps?.summarize
  return (
    sum?.status === 'completed' ||
    sum?.status === 'skipped'
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

function SkeletonCard() {
  return (
    <div
      className="rounded-xl"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid rgba(106,95,193,0.12)',
        overflow: 'hidden',
      }}
    >
      {/* Header skeleton */}
      <div
        className="flex items-center gap-3"
        style={{ padding: '14px 20px', background: 'var(--bg-base)' }}
      >
        <div className="skeleton-shimmer rounded" style={{ width: 80, height: 16 }} />
        <div className="skeleton-shimmer rounded" style={{ width: 60, height: 14 }} />
        <div className="flex-1" />
        <div className="skeleton-shimmer rounded" style={{ width: 40, height: 14 }} />
      </div>
      {/* Body skeleton */}
      <div style={{ padding: '18px 20px' }}>
        <div className="flex gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex-1 space-y-2">
              <div className="skeleton-shimmer rounded" style={{ width: '60%', height: 12 }} />
              <div className="skeleton-shimmer rounded" style={{ width: '80%', height: 10 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function PatrolCaseList() {
  const cases = usePatrolStore(s => s.cases)
  const totalCases = usePatrolStore(s => s.totalCases)
  const processedCases = usePatrolStore(s => s.processedCases)
  const phase = usePatrolStore(s => s.phase)
  const caseList = usePatrolStore(s => s.caseList)

  // Fetch case titles (with auth)
  const [titleMap, setTitleMap] = useState<Record<string, string>>({})
  useEffect(() => {
    apiGet<{ cases: Array<{ caseNumber: string; title: string }> }>('/cases')
      .then(data => {
        const map: Record<string, string> = {}
        for (const c of (data.cases || [])) {
          if (c.caseNumber && c.title) map[c.caseNumber] = c.title
        }
        setTitleMap(map)
      })
      .catch(() => {})
  }, [])

  const sortedCases = useMemo(() => {
    const allCases = Object.values(cases)
    // Filter to only show cases in the current run's caseList (if available)
    const filtered = caseList.length > 0
      ? allCases.filter(c => caseList.includes(c.caseNumber))
      : allCases
    // Fixed order: follow caseList sequence (patrol init order), don't re-sort on status change
    if (caseList.length > 0) {
      const orderMap = new Map(caseList.map((cn, i) => [cn, i]))
      return [...filtered].sort((a, b) =>
        (orderMap.get(a.caseNumber) ?? 999) - (orderMap.get(b.caseNumber) ?? 999)
      )
    }
    // Fallback: alphabetical by case number
    return [...filtered].sort((a, b) => a.caseNumber.localeCompare(b.caseNumber))
  }, [cases, caseList])

  const queuedOnly = useMemo(() => {
    const inStore = new Set(Object.keys(cases))
    return caseList.filter(cn => !inStore.has(cn))
  }, [cases, caseList])

  if (phase === 'idle') return null

  const isRunning = RUNNING_PHASES.includes(phase)
  const caseEntries = sortedCases

  // If running but no cases yet, show skeletons
  if (isRunning && caseEntries.length === 0 && queuedOnly.length === 0) {
    return (
      <Card padding="none" style={{ background: 'var(--bg-base)' }}>
        <div style={{ padding: '16px 18px 10px' }}>
          <div className="flex items-center gap-3" style={{ lineHeight: '16px' }}>
            <span
              className="text-[11px] font-bold uppercase"
              style={{ letterSpacing: '0.8px', color: 'var(--text-tertiary)' }}
            >
              Cases
            </span>
          </div>
        </div>
        <div className="space-y-2.5" style={{ padding: '0 18px 18px' }}>
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
        <style>{`
          @keyframes skeleton-shimmer {
            0% { opacity: 0.15; }
            50% { opacity: 0.25; }
            100% { opacity: 0.15; }
          }
          .skeleton-shimmer {
            background: var(--text-tertiary);
            animation: skeleton-shimmer 1.5s ease-in-out infinite;
          }
        `}</style>
      </Card>
    )
  }

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
            title={titleMap[c.caseNumber]}
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

      </div>
    </Card>
  )
}

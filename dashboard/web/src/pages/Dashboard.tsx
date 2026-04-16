/**
 * Dashboard — Statistics overview & visualization
 * Case list has been moved to CasesPage.tsx (ISS-076)
 */
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Briefcase, ShieldAlert, UserCheck, Clock, Activity, Play, Loader2, AlertTriangle, TrendingUp, BarChart3, X, Square, Ban, CheckCircle2, XCircle, Wrench } from 'lucide-react'
import { Card, CardHeader } from '../components/common/Card'
import { Loading, ErrorState, EmptyState } from '../components/common/Loading'
import { useCases, usePatrolState, useStartPatrol, useCancelPatrol } from '../api/hooks'
import { usePatrolStore } from '../stores/patrolStore'
import { apiGet } from '../api/client'
import { classifyCase } from './CasesPage'

/** Parse age string like "3d 5h" to hours */
function parseAge(age: string) {
  const days = parseInt(age.match(/(\d+)d/)?.[1] || '0')
  const hours = parseInt(age.match(/(\d+)h/)?.[1] || '0')
  return days * 24 + hours
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { data: casesData, isLoading, error } = useCases()
  const { data: patrol } = usePatrolState()
  const startPatrol = useStartPatrol()
  const cancelPatrol = useCancelPatrol()

  // Real-time patrol state from SSE-driven Zustand store
  const patrolRunning = usePatrolStore((s) => s.isRunning)
  const patrolPhase = usePatrolStore((s) => s.phase)
  const patrolTotal = usePatrolStore((s) => s.totalCases)
  const patrolChanged = usePatrolStore((s) => s.changedCases)
  const patrolProcessed = usePatrolStore((s) => s.processedCases)
  const patrolCurrentCase = usePatrolStore((s) => s.currentCase)
  const patrolError = usePatrolStore((s) => s.error)
  const patrolLastCompleted = usePatrolStore((s) => s.lastCompletedAt)
  const patrolCaseProgress = usePatrolStore((s) => s.caseProgress)
  const patrolDetail = usePatrolStore((s) => s.detail)

  // Show completed summary for 15 seconds after patrol finishes
  const showCompleted = !patrolRunning && patrolPhase === 'completed' && patrolLastCompleted

  const isPatrolActive = patrolRunning || startPatrol.isPending

  // Recover patrol state on page load/refresh (ISS-094)
  // Hydrate from backend: running state + live progress + last run results
  // Also runs when phase is 'starting' (set by startNew()) to recover if SSE is broken
  useEffect(() => {
    const { phase } = usePatrolStore.getState()
    if (patrolRunning && phase !== 'starting') return // Store already knows patrol is running (from SSE)
    let cancelled = false
    apiGet<{ running: boolean; liveProgress?: any; lastRun?: any }>('/patrol/status').then((res) => {
      if (cancelled) return
      if (res.running && res.liveProgress) {
        // Backend says patrol running with live progress — hydrate full state
        const lp = res.liveProgress
        usePatrolStore.getState().onPatrolProgress({
          phase: lp.phase || 'processing',
          totalCases: lp.totalCases,
          changedCases: lp.changedCases,
          processedCases: lp.processedCases,
          caseList: lp.caseList,
          detail: lp.detail,
        })
        // Hydrate completed case results
        if (lp.caseResults?.length) {
          for (const cr of lp.caseResults) {
            usePatrolStore.getState().onPatrolProgress({ phase: lp.phase, currentCase: cr.caseNumber })
            usePatrolStore.getState().onPatrolCaseCompleted({ caseNumber: cr.caseNumber, durationMs: cr.durationMs, error: cr.error })
          }
          // Re-set phase after hydration
          usePatrolStore.getState().onPatrolProgress({
            phase: lp.phase || 'processing',
            totalCases: lp.totalCases,
            changedCases: lp.changedCases,
            processedCases: lp.processedCases,
          })
        }
      } else if (res.running) {
        // Backend says patrol running but no live progress — set minimal state
        usePatrolStore.getState().onPatrolProgress({ phase: 'processing' })
      } else if (res.lastRun && !usePatrolStore.getState().phase) {
        // Not running, but we have persisted last run — hydrate store
        const lr = res.lastRun
        usePatrolStore.getState().onPatrolProgress({
          phase: lr.phase || 'completed',
          totalCases: lr.totalCases,
          changedCases: lr.changedCases,
          processedCases: lr.processedCases,
          error: lr.error,
        })
        // Hydrate case-level results
        if (lr.caseResults?.length) {
          for (const cr of lr.caseResults) {
            // Add as processing first (to register), then complete
            usePatrolStore.getState().onPatrolProgress({ phase: lr.phase, currentCase: cr.caseNumber })
            usePatrolStore.getState().onPatrolCaseCompleted({ caseNumber: cr.caseNumber, durationMs: cr.durationMs, error: cr.error })
          }
          // Re-set the final phase (hydration complete)
          usePatrolStore.getState().onPatrolProgress({
            phase: lr.phase || 'completed',
            totalCases: lr.totalCases,
            changedCases: lr.changedCases,
            processedCases: lr.processedCases,
          })
        }
      }
    }).catch(() => { /* ignore */ })
    return () => { cancelled = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) return <Loading text="Loading dashboard..." />
  if (error) return <ErrorState message="Failed to load cases" onRetry={() => window.location.reload()} />

  const cases = casesData?.cases || []

  // Compute stats (single source of truth from useCases)
  const classifications = cases.map((c: any) => ({ case: c, ...classifyCase(c) }))
  const statCounts = {
    total: cases.length,
    slaAtRisk: classifications.filter((c: any) => c.slaAtRisk).length,
    needsMyAction: classifications.filter((c: any) => c.needsMyAction).length,
    awaitingOthers: classifications.filter((c: any) => c.awaitingOthers).length,
  }

  // Severity distribution
  const sevCounts: Record<string, number> = { A: 0, B: 0, C: 0 }
  cases.forEach((c: any) => { sevCounts[c.severity] = (sevCounts[c.severity] || 0) + 1 })

  // Status distribution
  const statusCounts: Record<string, number> = {}
  cases.forEach((c: any) => {
    const s = c.meta?.actualStatus || c.status || 'unknown'
    statusCounts[s] = (statusCounts[s] || 0) + 1
  })

  // Response metrics
  const casesWithDays = cases.filter((c: any) => c.meta?.daysSinceLastContact != null)
  const avgDays = casesWithDays.length > 0
    ? (casesWithDays.reduce((sum: number, c: any) => sum + (c.meta.daysSinceLastContact ?? 0), 0) / casesWithDays.length).toFixed(1)
    : '—'
  const longestNoContact = casesWithDays.length > 0
    ? casesWithDays.reduce((max: any, c: any) => (c.meta.daysSinceLastContact ?? 0) > (max.meta?.daysSinceLastContact ?? 0) ? c : max, casesWithDays[0])
    : null
  const irMet = cases.filter((c: any) => c.meta?.irSla?.status === 'met').length
  const irNotMet = cases.filter((c: any) => c.meta?.irSla?.status === 'not-met').length
  const irTotal = irMet + irNotMet

  // Clickable stat card component (navigates to /cases?filter=xxx)
  const ClickableStat = ({ label, value, color, filter }: { label: string; value: number; color: string; filter: string }) => (
    <button
      onClick={() => navigate(`/cases?filter=${filter}`)}
      className="flex flex-col items-center justify-center p-4 rounded-xl border transition-all hover:scale-[1.02]"
      style={{
        background: `color-mix(in srgb, var(--accent-${color}) 6%, var(--bg-surface))`,
        borderColor: `color-mix(in srgb, var(--accent-${color}) 20%, transparent)`,
      }}
    >
      <span className="text-3xl font-extrabold font-mono" style={{ color: `var(--accent-${color})` }}>{value}</span>
      <span className="text-xs mt-1 font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</span>
    </button>
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>Dashboard</h2>
          <p className="text-xs mt-1 font-mono" style={{ color: 'var(--text-tertiary)' }}>
            {cases.length} active cases
            {patrol && ` · patrol ${new Date(patrol.lastPatrol).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', timeZone: 'Asia/Singapore' })} ${new Date(patrol.lastPatrol).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Singapore' })}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {patrolRunning && (
            <button
              onClick={() => cancelPatrol.mutate()}
              disabled={cancelPatrol.isPending}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[13px] uppercase hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-semibold"
              style={{ background: 'var(--accent-red-dim)', color: 'var(--accent-red)', backdropFilter: 'blur(8px)', letterSpacing: '0.2px' }}
            >
              <Square className="w-3.5 h-3.5" />
              {cancelPatrol.isPending ? 'Cancelling...' : 'Cancel'}
            </button>
          )}
          <button
            onClick={() => {
              usePatrolStore.getState().startNew()
              startPatrol.mutate(true)
              // Fallback: if SSE is broken and no progress arrives within 15s,
              // poll backend to recover actual state
              setTimeout(() => {
                const s = usePatrolStore.getState()
                if (s.phase === 'starting') {
                  apiGet<{ running: boolean; lastRun?: any }>('/patrol/status').then((res) => {
                    if (!res.running && res.lastRun) {
                      // Patrol already finished — hydrate from lastRun
                      usePatrolStore.getState().onPatrolProgress({
                        phase: res.lastRun.phase || 'completed',
                        totalCases: res.lastRun.totalCases,
                        changedCases: res.lastRun.changedCases,
                        processedCases: res.lastRun.processedCases,
                        error: res.lastRun.error,
                      })
                    } else if (res.running) {
                      usePatrolStore.getState().onPatrolProgress({ phase: 'processing' })
                    }
                  }).catch(() => {})
                }
              }, 15_000)
            }}
            disabled={isPatrolActive}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-[13px] uppercase hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-semibold"
            style={{ background: 'var(--accent-blue)', color: 'var(--text-inverse)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15), var(--shadow-card)', letterSpacing: '0.2px' }}
          >
            {isPatrolActive ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {isPatrolActive ? 'Patrolling...' : 'Start Patrol'}
          </button>
        </div>
      </div>

      {/* Patrol Progress (real-time SSE) */}
      {(patrolRunning || showCompleted || patrolError) && (
        <div
          className="rounded-xl px-4 py-3 border transition-all"
          style={{
            background: patrolError
              ? 'var(--accent-red-dim)'
              : showCompleted
                ? 'var(--accent-green-dim)'
                : 'color-mix(in srgb, var(--accent-blue) 8%, var(--bg-surface))',
            borderColor: patrolError
              ? 'color-mix(in srgb, var(--accent-red) 30%, transparent)'
              : showCompleted
                ? 'color-mix(in srgb, var(--accent-green) 30%, transparent)'
                : 'color-mix(in srgb, var(--accent-blue) 20%, transparent)',
          }}
        >
          {/* Status line */}
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              {patrolRunning && <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: 'var(--accent-blue)' }} />}
              {showCompleted && <Activity className="w-3.5 h-3.5" style={{ color: 'var(--accent-green)' }} />}
              {patrolError && <AlertTriangle className="w-3.5 h-3.5" style={{ color: 'var(--accent-red)' }} />}
              <span className="text-xs font-semibold" style={{
                color: patrolError ? 'var(--accent-red)' : showCompleted ? 'var(--accent-green)' : 'var(--accent-blue)',
              }}>
                {patrolError
                  ? 'Patrol Failed'
                  : showCompleted
                    ? `Patrol Complete — ${patrolProcessed} cases processed, ${patrolChanged} changed`
                    : patrolPhase === 'starting' || patrolPhase === 'discovering'
                      ? 'Discovering cases...'
                      : patrolPhase === 'filtering'
                      ? `Filtering... ${patrolTotal > 0 ? `${patrolTotal} cases` : ''}`
                      : patrolPhase === 'warming-up'
                        ? `Warming up... ${patrolChanged > 0 ? `${patrolChanged} cases to process` : ''}`
                        : patrolPhase === 'processing'
                        ? `Processing${patrolChanged > 0 ? ` (${patrolProcessed}/${patrolChanged})` : patrolTotal > 0 ? ` (${patrolProcessed}/${patrolTotal})` : '...'}`
                        : patrolPhase === 'aggregating'
                          ? 'Aggregating todos...'
                          : patrolDetail || 'Patrol running...'
                }
              </span>
            </div>
            {patrolRunning && patrolChanged > 0 && (
              <span className="text-[10px] font-mono" style={{ color: 'var(--text-tertiary)' }}>
                {patrolProcessed}/{patrolChanged}
              </span>
            )}
          </div>

          {/* Progress bar */}
          {patrolRunning && patrolChanged > 0 && (
            <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: 'var(--bg-inset)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min((patrolProcessed / patrolChanged) * 100, 100)}%`,
                  background: 'var(--accent-blue)',
                  minWidth: patrolProcessed > 0 ? '8px' : '0',
                }}
              />
            </div>
          )}

          {/* Detail text (warmup results, discovering info, etc.) */}
          {patrolDetail && patrolPhase !== 'completed' && (
            <p className="text-[10px] mb-1.5" style={{ color: 'var(--text-tertiary)' }}>{patrolDetail}</p>
          )}

          {/* Per-case progress — compact grid */}
          {patrolCaseProgress.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {patrolCaseProgress.map((cp) => (
                <div
                  key={cp.caseNumber}
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px]"
                  style={{
                    background: cp.status === 'completed' ? 'var(--accent-green-dim)'
                      : cp.status === 'failed' ? 'var(--accent-red-dim)'
                      : 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                  }}
                  title={cp.error || cp.caseNumber}
                >
                  {cp.status === 'processing' && <Loader2 className="w-3 h-3 animate-spin flex-shrink-0" style={{ color: 'var(--accent-blue)' }} />}
                  {cp.status === 'completed' && <CheckCircle2 className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--accent-green)' }} />}
                  {cp.status === 'failed' && <XCircle className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--accent-red)' }} />}
                  {(cp.status === 'pending' || cp.status === 'queued') && <Clock className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--text-tertiary)' }} />}
                  <span
                    className="font-mono cursor-pointer"
                    style={{ color: 'var(--text-primary)' }}
                    onClick={() => navigate(`/cases/${cp.caseNumber}`)}
                  >
                    {cp.caseNumber.slice(-6)}
                  </span>
                  {cp.status === 'processing' && cp.currentStep && (
                    <span className="text-[10px] truncate max-w-[80px]" style={{ color: 'var(--text-tertiary)' }}>
                      {cp.currentStep}
                    </span>
                  )}
                  {(cp.status === 'completed' || cp.status === 'failed') && cp.durationMs != null && (
                    <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                      {cp.durationMs < 60000
                        ? `${Math.round(cp.durationMs / 1000)}s`
                        : `${(cp.durationMs / 60000).toFixed(1)}m`}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Error detail */}
          {patrolError && (
            <p className="text-[11px] mt-1" style={{ color: 'var(--accent-red)' }}>{patrolError}</p>
          )}
        </div>
      )}

      {/* Overview Stat Cards — clickable, navigate to /cases?filter=xxx */}
      {cases.length === 0 ? (
        <EmptyState icon="📊" title="No data yet" description="Add cases to see statistics" />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <ClickableStat label="Total Active" value={statCounts.total} color="blue" filter="all" />
            <ClickableStat label="SLA At Risk" value={statCounts.slaAtRisk} color="red" filter="sla-at-risk" />
            <ClickableStat label="Needs My Action" value={statCounts.needsMyAction} color="amber" filter="needs-my-action" />
            <ClickableStat label="Awaiting Others" value={statCounts.awaitingOthers} color="green" filter="awaiting-others" />
          </div>

          {/* Entitlement & RDSE & Patrol */}
          {(() => {
            const entitlementCases = cases.filter((c: any) => c.meta?.compliance?.entitlementOk === false)
            const rdseCases = cases.filter((c: any) => c.meta?.ccAccount)
            const hasAlerts = entitlementCases.length > 0 || rdseCases.length > 0 || patrol
            if (!hasAlerts) return null
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {entitlementCases.length > 0 && (
                  <div
                    className="rounded-xl p-4 border"
                    style={{
                      background: 'color-mix(in srgb, var(--accent-red) 8%, var(--bg-surface))',
                      borderColor: 'color-mix(in srgb, var(--accent-red) 25%, transparent)',
                    }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Ban className="w-4 h-4" style={{ color: 'var(--accent-red)' }} />
                      <span className="text-sm font-bold" style={{ color: 'var(--accent-red)' }}>
                        Entitlement Warning ({entitlementCases.length})
                      </span>
                    </div>
                    <div className="space-y-2">
                      {entitlementCases.map((c: any) => (
                        <button
                          key={c.caseNumber}
                          onClick={() => navigate(`/case/${c.caseNumber}`)}
                          className="w-full text-left px-3 py-2 rounded-lg transition-colors"
                          style={{ background: 'color-mix(in srgb, var(--accent-red) 6%, transparent)' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'color-mix(in srgb, var(--accent-red) 12%, transparent)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'color-mix(in srgb, var(--accent-red) 6%, transparent)'}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-semibold" style={{ color: 'var(--accent-blue)' }}>{c.caseNumber}</span>
                            <span className="text-[10px] font-mono" style={{ color: 'var(--accent-red)' }}>Contact TA</span>
                          </div>
                          <div className="text-[10px] mt-0.5 font-mono" style={{ color: 'var(--text-tertiary)' }}>
                            {c.meta.compliance.serviceName || 'N/A'} · {c.meta.compliance.schedule || 'N/A'} · {c.meta.compliance.contractCountry || 'N/A'}
                          </div>
                          <div className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-secondary)' }}>{c.title}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {rdseCases.length > 0 && (
                  <div
                    className="rounded-xl px-4 py-3 border"
                    style={{
                      background: 'color-mix(in srgb, var(--accent-purple) 6%, var(--bg-surface))',
                      borderColor: 'color-mix(in srgb, var(--accent-purple) 20%, transparent)',
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldAlert className="w-3.5 h-3.5" style={{ color: 'var(--accent-purple)' }} />
                      <span className="text-xs font-bold" style={{ color: 'var(--accent-purple)' }}>
                        RDSE ({rdseCases.length})
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {rdseCases.map((c: any) => {
                        // Show short account name (first alias before /)
                        const shortName = (c.meta.ccAccount || '').split('/')[0].trim()
                        return (
                          <button
                            key={c.caseNumber}
                            onClick={() => navigate(`/case/${c.caseNumber}`)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[18px] text-[10px] font-mono font-semibold uppercase transition-colors"
                            style={{
                              background: 'color-mix(in srgb, var(--accent-purple) 10%, transparent)',
                              border: '1px solid color-mix(in srgb, var(--accent-purple) 15%, transparent)',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'color-mix(in srgb, var(--accent-purple) 20%, transparent)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'color-mix(in srgb, var(--accent-purple) 10%, transparent)'}
                            title={`${c.caseNumber} · ${c.title}`}
                          >
                            <span style={{ color: 'var(--accent-blue)' }}>{c.caseNumber.slice(-4)}</span>
                            <span style={{ color: 'var(--accent-purple)' }}>{shortName}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
                {patrol && (
                  <div
                    className="rounded-xl px-4 py-3 border"
                    style={{
                      background: 'color-mix(in srgb, var(--accent-blue) 6%, var(--bg-surface))',
                      borderColor: 'color-mix(in srgb, var(--accent-blue) 20%, transparent)',
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-3.5 h-3.5" style={{ color: 'var(--accent-blue)' }} />
                      <span className="text-xs font-bold" style={{ color: 'var(--accent-blue)' }}>
                        Patrol
                      </span>
                      <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                        {patrol.patrolType} · {patrol.lastRunTiming?.caseCount || 0} cases · {patrol.lastRunTiming?.wallClockMinutes || 0}min
                      </span>
                    </div>
                    <div className="grid grid-cols-5 gap-1.5 text-xs">
                      <div className="px-2 py-1.5 rounded-lg text-center" style={{ background: 'var(--accent-red-dim)' }}>
                        <p className="font-bold" style={{ color: 'var(--accent-red)' }}>{patrol.summary?.pendingEngineer || 0}</p>
                        <span className="text-[9px]" style={{ color: 'var(--text-tertiary)' }}>PE</span>
                      </div>
                      <div className="px-2 py-1.5 rounded-lg text-center" style={{ background: 'var(--accent-amber-dim)' }}>
                        <p className="font-bold" style={{ color: 'var(--accent-amber)' }}>{patrol.summary?.pendingCustomer || 0}</p>
                        <span className="text-[9px]" style={{ color: 'var(--text-tertiary)' }}>PC</span>
                      </div>
                      <div className="px-2 py-1.5 rounded-lg text-center" style={{ background: 'var(--accent-blue-dim)' }}>
                        <p className="font-bold" style={{ color: 'var(--accent-blue)' }}>{patrol.summary?.waitingPG || 0}</p>
                        <span className="text-[9px]" style={{ color: 'var(--text-tertiary)' }}>PG</span>
                      </div>
                      <div className="px-2 py-1.5 rounded-lg text-center" style={{ background: 'var(--accent-purple-dim)' }}>
                        <p className="font-bold" style={{ color: 'var(--accent-purple)' }}>{patrol.summary?.ar || 0}</p>
                        <span className="text-[9px]" style={{ color: 'var(--text-tertiary)' }}>AR</span>
                      </div>
                      <div className="px-2 py-1.5 rounded-lg text-center" style={{ background: 'var(--accent-green-dim)' }}>
                        <p className="font-bold" style={{ color: 'var(--accent-green)' }}>{patrol.summary?.normal || 0}</p>
                        <span className="text-[9px]" style={{ color: 'var(--text-tertiary)' }}>OK</span>
                      </div>
                    </div>
                    {patrol.lastRunTiming?.bottlenecks?.length > 0 && (
                      <div className="mt-1.5 text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                        Bottlenecks: {patrol.lastRunTiming.bottlenecks.join(' | ')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })()}

          {/* Two-column layout for distribution cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Severity Distribution */}
            <Card>
              <CardHeader
                title="Severity Distribution"
                icon={<BarChart3 className="w-5 h-5" style={{ color: 'var(--accent-blue)' }} />}
              />
              <div className="space-y-3">
                {Object.entries(sevCounts).map(([sev, count]) => {
                  const pct = cases.length > 0 ? (count / cases.length) * 100 : 0
                  const colorMap: Record<string, string> = { A: 'red', B: 'amber', C: 'blue' }
                  const c = colorMap[sev] || 'blue'
                  return (
                    <div key={sev} className="flex items-center gap-3">
                      <span className="text-xs font-bold font-mono w-8" style={{ color: `var(--accent-${c})` }}>Sev {sev}</span>
                      <div className="flex-1 h-5 rounded-md overflow-hidden" style={{ background: 'var(--bg-inset)' }}>
                        <div
                          className="h-full rounded-md transition-all duration-500"
                          style={{ width: `${pct}%`, background: `var(--accent-${c})`, minWidth: count > 0 ? '8px' : '0' }}
                        />
                      </div>
                      <span className="text-sm font-bold font-mono w-8 text-right" style={{ color: 'var(--text-primary)' }}>{count}</span>
                    </div>
                  )
                })}
              </div>
            </Card>

            {/* Status Distribution */}
            <Card>
              <CardHeader
                title="Status Breakdown"
                icon={<TrendingUp className="w-5 h-5" style={{ color: 'var(--accent-purple)' }} />}
              />
              <div className="space-y-2">
                {Object.entries(statusCounts)
                  .sort(([, a], [, b]) => b - a)
                  .map(([status, count]) => {
                    const statusColorMap: Record<string, string> = {
                      'pending-engineer': 'red',
                      'new': 'red',
                      'researching': 'amber',
                      'pending-customer': 'green',
                      'pending-pg': 'blue',
                      'ready-to-close': 'purple',
                    }
                    const c = statusColorMap[status] || 'blue'
                    return (
                      <div key={status} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: `color-mix(in srgb, var(--accent-${c}) 8%, transparent)` }}>
                        <span className="text-xs font-medium capitalize" style={{ color: 'var(--text-secondary)' }}>
                          {status.replace(/-/g, ' ')}
                        </span>
                        <span className="text-sm font-bold font-mono" style={{ color: `var(--accent-${c})` }}>{count}</span>
                      </div>
                    )
                  })}
              </div>
            </Card>
          </div>

          {/* Response Metrics */}
          <Card>
            <CardHeader
              title="Response Metrics"
              icon={<AlertTriangle className="w-5 h-5" style={{ color: 'var(--accent-amber)' }} />}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Avg days since last contact */}
              <div className="text-center p-4 rounded-xl" style={{ background: 'var(--bg-inset)' }}>
                <span className="text-3xl font-extrabold font-mono" style={{ color: Number(avgDays) >= 3 ? 'var(--accent-red)' : 'var(--accent-green)' }}>
                  {avgDays}
                </span>
                <p className="text-xs mt-1 font-medium" style={{ color: 'var(--text-secondary)' }}>Avg Days Since Contact</p>
              </div>

              {/* Longest no-contact case */}
              <div className="text-center p-4 rounded-xl" style={{ background: 'var(--bg-inset)' }}>
                {longestNoContact ? (
                  <>
                    <span className="text-3xl font-extrabold font-mono" style={{ color: 'var(--accent-red)' }}>
                      {longestNoContact.meta?.daysSinceLastContact ?? 0}d
                    </span>
                    <p className="text-xs mt-1 font-medium" style={{ color: 'var(--text-secondary)' }}>Longest No Contact</p>
                    <button
                      onClick={() => navigate(`/case/${longestNoContact.caseNumber}`)}
                      className="text-[10px] mt-1 font-mono hover:underline"
                      style={{ color: 'var(--accent-blue)' }}
                    >
                      {longestNoContact.caseNumber}
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-3xl font-extrabold font-mono" style={{ color: 'var(--text-tertiary)' }}>—</span>
                    <p className="text-xs mt-1 font-medium" style={{ color: 'var(--text-secondary)' }}>Longest No Contact</p>
                  </>
                )}
              </div>

              {/* IR SLA ratio bar */}
              <div className="text-center p-4 rounded-xl" style={{ background: 'var(--bg-inset)' }}>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl font-extrabold font-mono" style={{ color: 'var(--accent-green)' }}>{irMet}</span>
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>/</span>
                  <span className="text-xl font-extrabold font-mono" style={{ color: 'var(--accent-red)' }}>{irNotMet}</span>
                </div>
                <p className="text-xs mt-1 font-medium" style={{ color: 'var(--text-secondary)' }}>IR Met / Not Met</p>
                {irTotal > 0 && (
                  <div className="mt-2 h-2 rounded-full overflow-hidden flex" style={{ background: 'var(--bg-base)' }}>
                    <div className="h-full" style={{ width: `${(irMet / irTotal) * 100}%`, background: 'var(--accent-green)' }} />
                    <div className="h-full" style={{ width: `${(irNotMet / irTotal) * 100}%`, background: 'var(--accent-red)' }} />
                  </div>
                )}
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}

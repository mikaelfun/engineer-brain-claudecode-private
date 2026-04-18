/**
 * Dashboard — Statistics overview & visualization
 * Case list has been moved to CasesPage.tsx (ISS-076)
 */
import { useNavigate } from 'react-router-dom'
import { ShieldAlert, Clock, Activity, Play, Loader2, AlertTriangle, TrendingUp, BarChart3, Ban } from 'lucide-react'
import { Card, CardHeader } from '../components/common/Card'
import { Loading, ErrorState, EmptyState } from '../components/common/Loading'
import { useCases, useStartPatrol, useCancelPatrol } from '../api/hooks'
import { usePatrolStore } from '../stores/patrolStore'
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
  const startPatrol = useStartPatrol()
  const cancelPatrol = useCancelPatrol()

  // Patrol summary from SSE-driven Zustand store
  const patrolPhase = usePatrolStore((s) => s.phase)
  const patrolTotal = usePatrolStore((s) => s.totalCases)
  const patrolProcessed = usePatrolStore((s) => s.processedCases)
  const patrolError = usePatrolStore((s) => s.error)

  const patrolRunning = patrolPhase !== 'idle' && patrolPhase !== 'completed' && patrolPhase !== 'failed'
  const isPatrolActive = patrolRunning || startPatrol.isPending

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
          </p>
        </div>
        <button
          onClick={() => {
            usePatrolStore.getState().start()
            startPatrol.mutate(true)
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

      {/* Patrol Status Card — summary only, details at /patrol */}
      {patrolPhase !== 'idle' && (
        <div
          className="rounded-xl px-4 py-3 border transition-all"
          style={{
            background: patrolError
              ? 'var(--accent-red-dim)'
              : patrolPhase === 'completed'
                ? 'var(--accent-green-dim)'
                : 'color-mix(in srgb, var(--accent-blue) 8%, var(--bg-surface))',
            borderColor: patrolError
              ? 'color-mix(in srgb, var(--accent-red) 30%, transparent)'
              : patrolPhase === 'completed'
                ? 'color-mix(in srgb, var(--accent-green) 30%, transparent)'
                : 'color-mix(in srgb, var(--accent-blue) 20%, transparent)',
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {patrolRunning && <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: 'var(--accent-blue)' }} />}
              {patrolPhase === 'completed' && <Activity className="w-3.5 h-3.5" style={{ color: 'var(--accent-green)' }} />}
              {patrolPhase === 'failed' && <AlertTriangle className="w-3.5 h-3.5" style={{ color: 'var(--accent-red)' }} />}
              <span className="text-xs font-semibold" style={{
                color: patrolError ? 'var(--accent-red)' : patrolPhase === 'completed' ? 'var(--accent-green)' : 'var(--accent-blue)',
              }}>
                {patrolPhase === 'failed'
                  ? 'Patrol Failed'
                  : patrolPhase === 'completed'
                    ? `Done (${patrolProcessed} cases)`
                    : `${patrolPhase}... ${patrolProcessed}/${patrolTotal}`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <a href="/patrol" className="text-xs px-2.5 py-1 rounded-lg"
                 style={{ color: 'var(--accent-blue)', background: 'var(--accent-blue-dim)' }}>
                Details →
              </a>
              {patrolRunning && (
                <button
                  onClick={() => cancelPatrol.mutate()}
                  disabled={cancelPatrol.isPending}
                  className="text-xs px-2.5 py-1 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                  style={{ background: 'var(--accent-red-dim)', color: 'var(--accent-red)' }}
                >
                  {cancelPatrol.isPending ? 'Cancelling...' : 'Cancel'}
                </button>
              )}
            </div>
          </div>
          {patrolError && (
            <p className="text-[11px] mt-1.5" style={{ color: 'var(--accent-red)' }}>{patrolError}</p>
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

          {/* Entitlement & RDSE */}
          {(() => {
            const entitlementCases = cases.filter((c: any) => c.meta?.compliance?.entitlementOk === false)
            const rdseCases = cases.filter((c: any) => c.meta?.ccAccount)
            const hasAlerts = entitlementCases.length > 0 || rdseCases.length > 0
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

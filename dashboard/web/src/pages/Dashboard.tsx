/**
 * Dashboard — Statistics overview & visualization
 * Case list has been moved to CasesPage.tsx (ISS-076)
 */
import { useNavigate } from 'react-router-dom'
import { Briefcase, ShieldAlert, UserCheck, Clock, Activity, Play, Loader2, AlertTriangle, TrendingUp, BarChart3 } from 'lucide-react'
import { Card, CardHeader } from '../components/common/Card'
import { Loading, ErrorState, EmptyState } from '../components/common/Loading'
import { useCases, usePatrolState, useStartPatrol } from '../api/hooks'
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
            {patrol && ` · patrol ${new Date(patrol.lastPatrol).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })} ${new Date(patrol.lastPatrol).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`}
          </p>
        </div>
        <button
          onClick={() => startPatrol.mutate()}
          disabled={startPatrol.isPending}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          style={{ background: 'var(--accent-blue)', color: 'var(--text-inverse)', boxShadow: 'var(--shadow-card)' }}
        >
          {startPatrol.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          {startPatrol.isPending ? 'Patrolling...' : 'Start Patrol'}
        </button>
      </div>

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

          {/* Patrol Status */}
          {patrol && (
            <Card>
              <CardHeader
                title="Patrol Status"
                icon={<Activity className="w-5 h-5" style={{ color: 'var(--accent-blue)' }} />}
                subtitle={`Type: ${patrol.patrolType} | ${patrol.lastRunTiming?.caseCount || 0} cases in ${patrol.lastRunTiming?.wallClockMinutes || 0} min`}
              />
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                <div className="px-3 py-2 rounded-lg" style={{ background: 'var(--accent-red-dim)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Pending Engineer</span>
                  <p className="font-bold" style={{ color: 'var(--accent-red)' }}>{patrol.summary?.pendingEngineer || 0}</p>
                </div>
                <div className="px-3 py-2 rounded-lg" style={{ background: 'var(--accent-amber-dim)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Pending Customer</span>
                  <p className="font-bold" style={{ color: 'var(--accent-amber)' }}>{patrol.summary?.pendingCustomer || 0}</p>
                </div>
                <div className="px-3 py-2 rounded-lg" style={{ background: 'var(--accent-blue-dim)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Waiting PG</span>
                  <p className="font-bold" style={{ color: 'var(--accent-blue)' }}>{patrol.summary?.waitingPG || 0}</p>
                </div>
                <div className="px-3 py-2 rounded-lg" style={{ background: 'var(--accent-purple-dim)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>AR</span>
                  <p className="font-bold" style={{ color: 'var(--accent-purple)' }}>{patrol.summary?.ar || 0}</p>
                </div>
                <div className="px-3 py-2 rounded-lg" style={{ background: 'var(--accent-green-dim)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Normal</span>
                  <p className="font-bold" style={{ color: 'var(--accent-green)' }}>{patrol.summary?.normal || 0}</p>
                </div>
              </div>
              {patrol.lastRunTiming?.bottlenecks?.length > 0 && (
                <div className="mt-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Bottlenecks: {patrol.lastRunTiming.bottlenecks.join(' | ')}
                </div>
              )}
            </Card>
          )}
        </>
      )}
    </div>
  )
}

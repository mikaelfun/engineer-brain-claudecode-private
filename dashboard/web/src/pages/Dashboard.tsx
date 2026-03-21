/**
 * Dashboard — 总览页
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Briefcase, AlertTriangle, Clock, CheckCircle, Activity, Play, Loader2, ArrowUpDown } from 'lucide-react'
import { StatCard, Card, CardHeader } from '../components/common/Card'
import { SeverityBadge, CaseStatusBadge, SlaBadge } from '../components/common/Badge'
import { Loading, ErrorState, EmptyState } from '../components/common/Loading'
import { useCases, useCaseStats, usePatrolState, useStartPatrol } from '../api/hooks'

export default function Dashboard() {
  const navigate = useNavigate()
  const { data: casesData, isLoading, error } = useCases()
  const { data: stats } = useCaseStats()
  const { data: patrol } = usePatrolState()
  const startPatrol = useStartPatrol()
  const [sortBy, setSortBy] = useState<'default' | 'severity' | 'status' | 'age'>('default')

  if (isLoading) return <Loading text="Loading dashboard..." />
  if (error) return <ErrorState message="Failed to load cases" onRetry={() => window.location.reload()} />

  const cases = casesData?.cases || []

  // Multi-sort: default = severity > status priority, or user-selected single sort
  const sortedCases = [...cases].sort((a, b) => {
    const sevOrder: Record<string, number> = { A: 0, B: 1, C: 2 }
    const statusOrder: Record<string, number> = {
      'Pending Engineer': 0,
      'Active': 1,
      'Waiting PG': 2,
      'Pending Customer': 3,
      'AR': 4,
    }

    if (sortBy === 'severity') {
      return (sevOrder[a.severity] ?? 3) - (sevOrder[b.severity] ?? 3)
    }
    if (sortBy === 'status') {
      return (statusOrder[a.status] ?? 5) - (statusOrder[b.status] ?? 5)
    }
    if (sortBy === 'age') {
      // Parse age like "3d 5h" → compare numerically
      const parseAge = (age: string) => {
        const days = parseInt(age.match(/(\d+)d/)?.[1] || '0')
        const hours = parseInt(age.match(/(\d+)h/)?.[1] || '0')
        return days * 24 + hours
      }
      return parseAge(b.caseAge || '0d') - parseAge(a.caseAge || '0d') // oldest first
    }
    // Default: severity > status
    const sevDiff = (sevOrder[a.severity] ?? 3) - (sevOrder[b.severity] ?? 3)
    if (sevDiff !== 0) return sevDiff
    return (statusOrder[a.status] ?? 5) - (statusOrder[b.status] ?? 5)
  })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Dashboard</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {cases.length} active cases
            {patrol && ` | Last patrol: ${new Date(patrol.lastPatrol).toLocaleString()}`}
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

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          label="Active Cases"
          value={stats?.total ?? cases.length}
          icon={<Briefcase className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          label="Urgent Items"
          value={stats?.urgentItems ?? 0}
          icon={<AlertTriangle className="w-6 h-6" />}
          color="red"
        />
        <StatCard
          label="Pending Items"
          value={stats?.pendingItems ?? 0}
          icon={<Clock className="w-6 h-6" />}
          color="yellow"
        />
        <StatCard
          label="Normal"
          value={stats?.normalItems ?? 0}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
        />
      </div>

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

      {/* Case Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Active Cases</h3>
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs border rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
              style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-default)', background: 'var(--bg-surface)' }}
            >
              <option value="default">Severity + Status</option>
              <option value="severity">Severity</option>
              <option value="status">Status</option>
              <option value="age">Age (oldest first)</option>
            </select>
          </div>
        </div>
        {cases.length === 0 ? (
          <EmptyState icon="📂" title="No active cases" description="No cases found in the workspace" />
        ) : (
          <div className="grid gap-3">
            {sortedCases.map((c: any) => (
              <Card
                key={c.caseNumber}
                hover
                onClick={() => navigate(`/case/${c.caseNumber}`)}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm" style={{ color: 'var(--text-secondary)' }}>{c.caseNumber}</span>
                      <SeverityBadge severity={c.severity} />
                      <CaseStatusBadge status={c.status} />
                    </div>
                    <h4 className="font-medium mt-1 line-clamp-2" style={{ color: 'var(--text-primary)' }} title={c.title || 'Untitled'}>{c.title || 'Untitled'}</h4>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      {c.customer} | {c.assignedTo} | Age: {c.caseAge}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs flex-shrink-0">
                    {c.meta && (
                      <>
                        <div className="text-center">
                          <span className="block" style={{ color: 'var(--text-tertiary)' }}>IR</span>
                          <SlaBadge status={c.meta.irSla?.status || 'unknown'} />
                        </div>
                        <div className="text-center">
                          <span className="block" style={{ color: 'var(--text-tertiary)' }}>FWR</span>
                          <SlaBadge status={c.meta.fwr?.status || 'unknown'} />
                        </div>
                        {c.meta.teams_chat_count > 0 && (
                          <div className="text-center">
                            <span className="block" style={{ color: 'var(--text-tertiary)' }}>Teams</span>
                            <span className="font-medium" style={{ color: 'var(--accent-purple)' }}>{c.meta.teams_chat_count}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

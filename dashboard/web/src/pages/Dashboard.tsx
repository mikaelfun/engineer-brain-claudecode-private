/**
 * Dashboard — 总览页
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Briefcase, AlertTriangle, Clock, CheckCircle, Activity, Play, Loader2, ArrowUpDown, RefreshCw, Zap, MessageSquare } from 'lucide-react'
import { StatCard, Card, CardHeader } from '../components/common/Card'
import { SeverityBadge, CaseStatusBadge, SlaBadge } from '../components/common/Badge'
import { Loading, ErrorState, EmptyState } from '../components/common/Loading'
import { useCases, useCaseStats, usePatrolState, useStartPatrol, useActiveOperations } from '../api/hooks'
import { apiPost } from '../api/client'
import { relativeTime } from '../utils/relativeTime'

export default function Dashboard() {
  const navigate = useNavigate()
  const { data: casesData, isLoading, error } = useCases()
  const { data: stats } = useCaseStats()
  const { data: patrol } = usePatrolState()
  const startPatrol = useStartPatrol()
  const { data: activeOps } = useActiveOperations()
  const [actionLoading, setActionLoading] = useState<Record<string, string>>({}) // caseNumber -> action type
  const [sortBy, setSortBy] = useState<'default' | 'severity' | 'status' | 'age'>('default')

  // Build set of case numbers with active operations
  const busyCases = new Set<string>()
  if (activeOps?.operations) {
    for (const op of activeOps.operations) {
      busyCases.add(op.caseNumber)
    }
  }

  const handleCaseAction = async (caseNumber: string, action: 'refresh' | 'process', e: React.MouseEvent) => {
    e.stopPropagation() // Don't navigate to case detail
    setActionLoading(prev => ({ ...prev, [caseNumber]: action }))
    try {
      if (action === 'refresh') {
        await apiPost(`/case/${caseNumber}/step/data-refresh`, { intent: 'Data refresh from dashboard' })
      } else {
        await apiPost(`/case/${caseNumber}/process`, { intent: 'Full casework processing from dashboard' })
      }
      navigate(`/case/${caseNumber}`)
    } catch {
      // On error, just clear loading — user can retry
    } finally {
      setActionLoading(prev => {
        const next = { ...prev }
        delete next[caseNumber]
        return next
      })
    }
  }

  if (isLoading) return <Loading text="Loading dashboard..." />
  if (error) return <ErrorState message="Failed to load cases" onRetry={() => window.location.reload()} />

  const cases = casesData?.cases || []

  // Helper to parse age string like "3d 5h" to hours
  const parseAge = (age: string) => {
    const days = parseInt(age.match(/(\d+)d/)?.[1] || '0')
    const hours = parseInt(age.match(/(\d+)h/)?.[1] || '0')
    return days * 24 + hours
  }

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
          <div className="grid gap-2">
            {sortedCases.map((c: any) => {
              const sevColorMap: Record<string, string> = {
                A: 'var(--accent-red)',
                B: 'var(--accent-amber)',
                C: 'var(--accent-blue)',
              }
              const sevColor = sevColorMap[c.severity] || 'var(--border-subtle)'
              const isBusy = busyCases.has(c.caseNumber) || !!actionLoading[c.caseNumber]
              const currentAction = actionLoading[c.caseNumber]
              return (
                <Card
                  key={c.caseNumber}
                  hover
                  onClick={() => navigate(`/case/${c.caseNumber}`)}
                  padding="none"
                >
                  <div className="flex" style={{ borderLeft: `3px solid ${sevColor}` }}>
                    <div className="flex-1 min-w-0 px-4 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-semibold" style={{ color: 'var(--accent-blue)' }}>{c.caseNumber}</span>
                        <SeverityBadge severity={c.severity} />
                        <CaseStatusBadge status={c.status} />
                      </div>
                      <h4 className="font-medium mt-1 text-[13px] truncate" style={{ color: 'var(--text-primary)' }} title={c.title || 'Untitled'}>{c.title || 'Untitled'}</h4>
                      <p className="text-xs mt-0.5 flex items-center gap-1.5 flex-wrap">
                        <span
                          className="inline-block font-semibold text-[11px] px-1.5 py-0.5 rounded"
                          style={{
                            color: 'var(--accent-cyan)',
                            background: 'color-mix(in srgb, var(--accent-cyan) 12%, transparent)',
                          }}
                        >
                          {c.customer || 'Unknown'}
                        </span>
                        <span style={{ color: 'var(--text-tertiary)' }}>·</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{c.assignedTo}</span>
                        <span style={{ color: 'var(--text-tertiary)' }}>·</span>
                        <span className="font-mono" style={{ color: parseAge(c.caseAge) > 168 ? 'var(--accent-red)' : 'var(--text-secondary)' }}>
                          {c.caseAge}
                        </span>
                      </p>
                      {/* Timestamps row */}
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] font-mono" style={{ color: 'var(--text-tertiary)' }}>
                        {c.fetchedAt && (
                          <span className="flex items-center gap-1" title={`Data refreshed: ${c.fetchedAt}`}>
                            <RefreshCw className="w-2.5 h-2.5" />
                            {relativeTime(c.fetchedAt)}
                          </span>
                        )}
                        {c.teamsLastMessageTime && (
                          <span className="flex items-center gap-1" title={`Teams last message: ${c.teamsLastMessageTime}`}>
                            <MessageSquare className="w-2.5 h-2.5" />
                            {relativeTime(c.teamsLastMessageTime)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 px-3 flex-shrink-0">
                      {/* Action buttons */}
                      <div className="flex flex-col gap-1.5" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={(e) => handleCaseAction(c.caseNumber, 'refresh', e)}
                          disabled={isBusy}
                          className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded border transition-all disabled:opacity-40 hover:brightness-110"
                          style={{
                            color: 'var(--accent-blue)',
                            background: 'var(--accent-blue-dim)',
                            borderColor: 'color-mix(in srgb, var(--accent-blue) 25%, transparent)',
                          }}
                          title="Refresh case data"
                        >
                          <RefreshCw className={`w-3 h-3 ${currentAction === 'refresh' ? 'animate-spin' : ''}`} />
                          Refresh
                        </button>
                        <button
                          onClick={(e) => handleCaseAction(c.caseNumber, 'process', e)}
                          disabled={isBusy}
                          className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded border transition-all disabled:opacity-40 hover:brightness-110"
                          style={{
                            color: 'var(--accent-green)',
                            background: 'var(--accent-green-dim)',
                            borderColor: 'color-mix(in srgb, var(--accent-green) 25%, transparent)',
                          }}
                          title="Full casework processing"
                        >
                          <Zap className={`w-3 h-3 ${currentAction === 'process' ? 'animate-pulse' : ''}`} />
                          Process
                        </button>
                      </div>
                      {/* SLA badges */}
                      <div className="flex items-center gap-4 text-xs">
                        {c.meta && (
                          <>
                            <div className="text-center">
                              <span className="block text-[10px] font-medium" style={{ color: 'var(--text-tertiary)' }}>IR</span>
                              <SlaBadge status={c.meta.irSla?.status || 'unknown'} />
                            </div>
                            {c.meta.healthScore != null && (
                              <div
                                className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-[11px] font-extrabold font-mono"
                                style={{
                                  border: `2px solid ${c.meta.healthScore >= 80 ? 'var(--accent-green)' : c.meta.healthScore >= 50 ? 'var(--accent-amber)' : 'var(--accent-red)'}`,
                                  color: c.meta.healthScore >= 80 ? 'var(--accent-green)' : c.meta.healthScore >= 50 ? 'var(--accent-amber)' : 'var(--accent-red)',
                                  background: c.meta.healthScore >= 80 ? 'var(--accent-green-dim)' : c.meta.healthScore >= 50 ? 'var(--accent-amber-dim)' : 'var(--accent-red-dim)',
                                }}
                              >
                                {c.meta.healthScore}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

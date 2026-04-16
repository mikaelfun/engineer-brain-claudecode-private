/**
 * CasesPage — Case list with stat filter cards, sort, and action buttons
 * Extracted from Dashboard.tsx (ISS-076)
 */
import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Briefcase, ShieldAlert, UserCheck, Clock, ArrowUpDown, RefreshCw, Zap, MessageSquare, Loader2 } from 'lucide-react'
import { StatCard, Card } from '../components/common/Card'
import { SeverityBadge, CaseStatusBadge, SlaBadge, EntitlementWarningBadge, RdseBadge } from '../components/common/Badge'
import { Loading, ErrorState, EmptyState } from '../components/common/Loading'
import { useCases, useActiveOperations } from '../api/hooks'
import { apiPost } from '../api/client'
import { relativeTime } from '../utils/relativeTime'

type FilterType = 'all' | 'sla-at-risk' | 'needs-my-action' | 'awaiting-others'

/** Classify a case by SLA risk, action needed, awaiting others */
export function classifyCase(c: any) {
  const meta = c.meta
  if (!meta) return { slaAtRisk: false, needsMyAction: false, awaitingOthers: false }
  const status = meta.actualStatus || ''
  const days = meta.daysSinceLastContact ?? 0
  const irSlaStatus = meta.irSla?.status || ''
  return {
    slaAtRisk: irSlaStatus === 'not-met' || days >= 3,
    needsMyAction: ['pending-engineer', 'new', 'researching'].includes(status),
    awaitingOthers: ['pending-customer', 'pending-pg', 'ready-to-close'].includes(status),
  }
}

/** Parse age string like "3d 5h" to hours */
function parseAge(age: string) {
  const days = parseInt(age.match(/(\d+)d/)?.[1] || '0')
  const hours = parseInt(age.match(/(\d+)h/)?.[1] || '0')
  return days * 24 + hours
}

export default function CasesPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { data: casesData, isLoading, error } = useCases()
  const { data: activeOps } = useActiveOperations()
  const [actionLoading, setActionLoading] = useState<Record<string, string>>({})
  const [sortBy, setSortBy] = useState<'default' | 'severity' | 'status' | 'age'>('default')
  const [filter, setFilter] = useState<FilterType>('all')

  // Support URL query param: ?filter=sla-at-risk
  useEffect(() => {
    const qf = searchParams.get('filter') as FilterType | null
    if (qf && ['all', 'sla-at-risk', 'needs-my-action', 'awaiting-others'].includes(qf)) {
      setFilter(qf)
    }
  }, [searchParams])

  // Build set of case numbers with active operations
  const busyCases = new Set<string>()
  if (activeOps?.operations) {
    for (const op of activeOps.operations) {
      busyCases.add(op.caseNumber)
    }
  }

  const handleCaseAction = async (caseNumber: string, action: 'refresh' | 'process', e: React.MouseEvent) => {
    e.stopPropagation()
    setActionLoading(prev => ({ ...prev, [caseNumber]: action }))
    try {
      if (action === 'refresh') {
        await apiPost(`/case/${caseNumber}/step/data-refresh`, { intent: 'Data refresh from cases page' })
      } else {
        await apiPost(`/case/${caseNumber}/process`, { intent: 'Full casework processing from cases page' })
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

  if (isLoading) return <Loading text="Loading cases..." />
  if (error) return <ErrorState message="Failed to load cases" onRetry={() => window.location.reload()} />

  const cases = casesData?.cases || []

  // Compute stat counts (single source of truth)
  const caseClassifications = cases.map((c: any) => ({ case: c, ...classifyCase(c) }))
  const statCounts = {
    total: cases.length,
    slaAtRisk: caseClassifications.filter((c: any) => c.slaAtRisk).length,
    needsMyAction: caseClassifications.filter((c: any) => c.needsMyAction).length,
    awaitingOthers: caseClassifications.filter((c: any) => c.awaitingOthers).length,
  }

  const filteredCases = filter === 'all'
    ? cases
    : caseClassifications
        .filter((c: any) => filter === 'sla-at-risk' ? c.slaAtRisk : filter === 'needs-my-action' ? c.needsMyAction : c.awaitingOthers)
        .map((c: any) => c.case)

  // Multi-sort
  const sortedCases = [...filteredCases].sort((a: any, b: any) => {
    const sevOrder: Record<string, number> = { A: 0, B: 1, C: 2 }
    const statusOrder: Record<string, number> = {
      'Pending Engineer': 0, 'Active': 1, 'Waiting PG': 2, 'Pending Customer': 3, 'AR': 4,
    }

    if (sortBy === 'severity') return (sevOrder[a.severity] ?? 3) - (sevOrder[b.severity] ?? 3)
    if (sortBy === 'status') return (statusOrder[a.status] ?? 5) - (statusOrder[b.status] ?? 5)
    if (sortBy === 'age') return parseAge(b.caseAge || '0d') - parseAge(a.caseAge || '0d')
    // Default: severity > status
    const sevDiff = (sevOrder[a.severity] ?? 3) - (sevOrder[b.severity] ?? 3)
    if (sevDiff !== 0) return sevDiff
    return (statusOrder[a.status] ?? 5) - (statusOrder[b.status] ?? 5)
  })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>Cases</h2>
        <p className="text-xs mt-1 font-mono" style={{ color: 'var(--text-tertiary)' }}>
          {cases.length} active cases
        </p>
      </div>

      {/* Stat Filter Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          label="Active Cases"
          value={statCounts.total}
          icon={<Briefcase className="w-6 h-6" />}
          color="blue"
          active={filter === 'all'}
          onClick={() => setFilter('all')}
        />
        <StatCard
          label="SLA At Risk"
          value={statCounts.slaAtRisk}
          icon={<ShieldAlert className="w-6 h-6" />}
          color="red"
          active={filter === 'sla-at-risk'}
          onClick={() => setFilter(f => f === 'sla-at-risk' ? 'all' : 'sla-at-risk')}
        />
        <StatCard
          label="Needs My Action"
          value={statCounts.needsMyAction}
          icon={<UserCheck className="w-6 h-6" />}
          color="yellow"
          active={filter === 'needs-my-action'}
          onClick={() => setFilter(f => f === 'needs-my-action' ? 'all' : 'needs-my-action')}
        />
        <StatCard
          label="Awaiting Others"
          value={statCounts.awaitingOthers}
          icon={<Clock className="w-6 h-6" />}
          color="green"
          active={filter === 'awaiting-others'}
          onClick={() => setFilter(f => f === 'awaiting-others' ? 'all' : 'awaiting-others')}
        />
      </div>

      {/* Case List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            {filter === 'all' ? 'Active Cases' : filter === 'sla-at-risk' ? 'SLA At Risk' : filter === 'needs-my-action' ? 'Needs My Action' : 'Awaiting Others'}
            {filter !== 'all' && (
              <span className="text-xs font-normal ml-2" style={{ color: 'var(--text-tertiary)' }}>
                {filteredCases.length} / {cases.length}
              </span>
            )}
          </h3>
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
                        {c.meta?.compliance && <EntitlementWarningBadge compliance={c.meta.compliance} />}
                        {c.meta?.ccAccount && <RdseBadge ccAccount={c.meta.ccAccount} />}
                      </div>
                      <h4 className="font-medium mt-1 text-[13px] truncate" style={{ color: 'var(--text-primary)' }} title={c.title || 'Untitled'}>{c.title || 'Untitled'}</h4>
                      <p className="text-xs mt-0.5 flex items-center gap-1.5 flex-wrap">
                        <span
                          className="inline-block text-[10px] px-2.5 py-0.5 rounded-[18px] border font-semibold"
                          style={{
                            color: 'color-mix(in srgb, var(--accent-cyan) 75%, var(--text-secondary))',
                            background: 'color-mix(in srgb, var(--accent-cyan) 8%, transparent)',
                            borderColor: 'color-mix(in srgb, var(--accent-cyan) 25%, transparent)',
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
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold uppercase rounded-[13px] border transition-all disabled:opacity-40 hover:brightness-110"
                          style={{
                            color: 'var(--accent-blue)',
                            background: 'var(--accent-blue-dim)',
                            borderColor: 'color-mix(in srgb, var(--accent-blue) 25%, transparent)',
                            letterSpacing: '0.2px',
                          }}
                          title="Refresh case data"
                        >
                          <RefreshCw className={`w-3 h-3 ${currentAction === 'refresh' ? 'animate-spin' : ''}`} />
                          Refresh
                        </button>
                        <button
                          onClick={(e) => handleCaseAction(c.caseNumber, 'process', e)}
                          disabled={isBusy}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold uppercase rounded-[13px] border transition-all disabled:opacity-40 hover:brightness-110"
                          style={{
                            color: 'var(--accent-green)',
                            background: 'var(--accent-green-dim)',
                            borderColor: 'color-mix(in srgb, var(--accent-green) 25%, transparent)',
                            letterSpacing: '0.2px',
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

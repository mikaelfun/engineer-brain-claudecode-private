/**
 * AgentMonitor — Agent/Cron 监控页
 */
import { Card, CardHeader } from '../components/common/Card'
import { Badge } from '../components/common/Badge'
import { Loading, EmptyState } from '../components/common/Loading'
import { useAgents, useCronJobs, usePatrolState, useAllSessions, useCancelPatrol } from '../api/hooks'
import { usePatrolStore } from '../stores/patrolStore'
import { SessionBadge } from '../components/SessionBadge'
import { useQueryClient } from '@tanstack/react-query'
import { RefreshCw } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

export default function AgentMonitor() {
  const { data: agentsData, isLoading: agentsLoading } = useAgents()
  const { data: cronData, isLoading: cronLoading } = useCronJobs()
  const { data: patrol } = usePatrolState()
  // Select individual state slices to avoid re-renders on unrelated store changes
  const isRunning = usePatrolStore((s) => s.isRunning)
  const phase = usePatrolStore((s) => s.phase)
  const totalCases = usePatrolStore((s) => s.totalCases)
  const changedCases = usePatrolStore((s) => s.changedCases)
  const processedCases = usePatrolStore((s) => s.processedCases)
  const currentCase = usePatrolStore((s) => s.currentCase)
  const caseProgress = usePatrolStore((s) => s.caseProgress)
  const patrolError = usePatrolStore((s) => s.error)
  const { data: sessionsData } = useAllSessions()
  const cancelPatrol = useCancelPatrol()
  const queryClient = useQueryClient()
  const [refreshing, setRefreshing] = useState(false)

  // Auto-refresh: 5s when patrol running, 30s when idle
  // (liveSessions computed below, use isRunning as proxy for active work)
  const autoRefreshInterval = isRunning ? 5_000 : 30_000
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      queryClient.invalidateQueries({ queryKey: ['agents', 'patrol-state'] })
    }, autoRefreshInterval)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [autoRefreshInterval, queryClient])

  const handleRefresh = () => {
    setRefreshing(true)
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['agents'] }),
      queryClient.invalidateQueries({ queryKey: ['agents', 'cron-jobs'] }),
      queryClient.invalidateQueries({ queryKey: ['sessions'] }),
      queryClient.invalidateQueries({ queryKey: ['agents', 'patrol-state'] }),
    ]).finally(() => {
      setTimeout(() => setRefreshing(false), 500)
    })
  }

  if (agentsLoading || cronLoading) return <Loading text="Loading agents..." />

  const agents = agentsData?.agents || []
  const cronJobs = cronData?.jobs || []
  const liveSessions = (sessionsData?.sessions || []).filter(
    (s: any) => s.status === 'active'
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Agent Monitor</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
            {agents.length} agents | {cronJobs.length} cron jobs | {liveSessions.length} live sessions
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-lg transition-colors disabled:opacity-50"
          style={{ color: 'var(--text-secondary)', background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
          title="Refresh all"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Patrol Progress (real-time, SSE-driven) */}
      {(isRunning || phase) && (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <CardHeader
              title="Patrol Progress"
              icon={<span>{isRunning ? '🔄' : '✅'}</span>}
              subtitle={phase}
            />
            {isRunning && (
              <button
                onClick={() => cancelPatrol.mutate()}
                disabled={cancelPatrol.isPending}
                className="px-3 py-1 text-xs font-medium rounded-lg disabled:opacity-50 transition-colors"
                style={{ color: 'var(--accent-red)', background: 'var(--accent-red-dim)' }}
              >
                {cancelPatrol.isPending ? 'Cancelling...' : 'Cancel Patrol'}
              </button>
            )}
          </div>

          {/* Progress bar */}
          {changedCases > 0 && (
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>
                <span>{processedCases} / {changedCases} cases</span>
                <span>{Math.round((processedCases / changedCases) * 100)}%</span>
              </div>
              <div className="w-full rounded-full h-2" style={{ background: 'var(--bg-active)' }}>
                <div
                  className="rounded-full h-2 transition-all duration-500"
                  style={{ width: `${(processedCases / changedCases) * 100}%`, background: 'var(--accent-blue)' }}
                />
              </div>
            </div>
          )}

          {/* Phase description */}
          <div className="flex items-center gap-2">
            {isRunning && (
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--accent-blue)' }} />
            )}
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {phase === 'discovering' && `Discovering active cases... ${totalCases ? `(${totalCases} found)` : ''}`}
              {phase === 'filtering' && `Found ${totalCases} cases, ${changedCases} changed`}
              {phase === 'processing' && `Processing ${changedCases} cases in parallel${currentCase ? ` (latest: ${currentCase})` : ''}...`}
              {phase === 'aggregating' && 'Aggregating todos...'}
              {phase === 'completed' && `Patrol complete. ${processedCases}/${totalCases || processedCases} cases processed.`}
              {phase === 'failed' && `Patrol failed: ${patrolError}`}
            </span>
          </div>

          {/* Per-case parallel progress */}
          {caseProgress.length > 0 && (
            <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Cases ({caseProgress.filter(c => c.status === 'completed').length}/{caseProgress.length} done):</span>
                {caseProgress.filter(c => c.status === 'processing').length > 0 && (
                  <span className="text-xs font-medium" style={{ color: 'var(--accent-blue)' }}>
                    {caseProgress.filter(c => c.status === 'processing').length} running in parallel
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {caseProgress.map((cp) => (
                  <span
                    key={cp.caseNumber}
                    className="px-1.5 py-0.5 rounded text-xs font-mono flex items-center gap-1"
                    style={{
                      background: cp.status === 'completed' ? 'var(--accent-green-dim)'
                        : cp.status === 'processing' ? 'var(--accent-blue-dim)'
                        : cp.status === 'failed' ? 'var(--accent-red-dim)'
                        : 'var(--bg-inset)',
                      color: cp.status === 'completed' ? 'var(--accent-green)'
                        : cp.status === 'processing' ? 'var(--accent-blue)'
                        : cp.status === 'failed' ? 'var(--accent-red)'
                        : 'var(--text-secondary)',
                    }}
                    title={cp.error || cp.status}
                  >
                    {cp.status === 'processing' && <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--accent-blue)' }} />}
                    {cp.status === 'completed' && <span style={{ color: 'var(--accent-green)' }}>✓</span>}
                    {cp.status === 'failed' && <span style={{ color: 'var(--accent-red)' }}>✗</span>}
                    {cp.caseNumber.slice(-6)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {patrolError && (
            <div
              className="mt-2 p-2 rounded text-xs"
              style={{ background: 'var(--accent-red-dim)', color: 'var(--accent-red)' }}
            >
              {patrolError}
            </div>
          )}
        </Card>
      )}

      {/* Live Sessions */}
      {liveSessions.length > 0 && (
        <Card>
          <CardHeader title="Live Sessions" icon={<span>🧠</span>} />
          <div className="space-y-2">
            {liveSessions.map((s: any) => (
              <div
                key={s.sessionId}
                className="flex items-center justify-between py-1.5 px-2 rounded"
                style={{ background: 'var(--bg-inset)' }}
              >
                <div className="flex items-center gap-2">
                  <SessionBadge status={s.status} compact />
                  <span className="text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>{s.caseNumber}</span>
                </div>
                <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  {s.intent && <span className="truncate max-w-[200px]">{s.intent}</span>}
                  <span>{new Date(s.lastActivityAt).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Patrol Status Card */}
      {patrol && (
        <Card>
          <CardHeader
            title="Last Patrol"
            icon={<span>🔄</span>}
            subtitle={`${patrol.patrolType} | ${new Date(patrol.lastPatrol).toLocaleString()}`}
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <span style={{ color: 'var(--text-tertiary)' }}>Cases</span>
              <p className="font-bold">{patrol.lastRunTiming?.caseCount || 0}</p>
            </div>
            <div>
              <span style={{ color: 'var(--text-tertiary)' }}>Duration</span>
              <p className="font-bold">{patrol.lastRunTiming?.wallClockMinutes || 0} min</p>
            </div>
            <div>
              <span style={{ color: 'var(--text-tertiary)' }}>Compute</span>
              <p className="font-bold">{patrol.lastRunTiming?.computeSeconds || 0}s</p>
            </div>
            <div>
              <span style={{ color: 'var(--text-tertiary)' }}>Started</span>
              <p className="font-bold text-xs">{patrol.currentPatrolStartedAt ? new Date(patrol.currentPatrolStartedAt).toLocaleString() : '-'}</p>
            </div>
          </div>
          {patrol.lastRunTiming?.bottlenecks?.length > 0 && (
            <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Bottlenecks:</span>
              <ul className="text-xs mt-1 space-y-0.5" style={{ color: 'var(--text-secondary)' }}>
                {patrol.lastRunTiming.bottlenecks.map((b: string, i: number) => (
                  <li key={i}>• {b}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}

      {/* Agent Grid */}
      <div>
        <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Agents</h3>
        {agents.length === 0 ? (
          <EmptyState icon="🤖" title="No agents" description="No agents configured" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {agents.map((agent: any) => (
              <Card key={agent.id}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🤖</span>
                  <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{agent.name || agent.id}</h4>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center justify-between">
                    <span style={{ color: 'var(--text-tertiary)' }}>Model</span>
                    <Badge variant="primary" size="xs">
                      {agent.model.split('/').pop()}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: 'var(--text-tertiary)' }}>ID</span>
                    <span className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>{agent.id}</span>
                  </div>
                  {agent.subagents?.allowAgents && (
                    <div className="flex items-center justify-between">
                      <span style={{ color: 'var(--text-tertiary)' }}>Sub-agents</span>
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {agent.subagents.allowAgents.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Cron Jobs Table */}
      <div>
        <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Cron Jobs</h3>
        {cronJobs.length === 0 ? (
          <EmptyState icon="⏰" title="No cron jobs" />
        ) : (
          <div className="space-y-3">
            {cronJobs.map((job: any) => (
              <Card key={job.id}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{job.name}</h4>
                      <Badge variant={job.enabled ? 'success' : 'secondary'} size="xs">
                        {job.enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>Agent: {job.agentId}</p>
                  </div>
                  <Badge variant="primary" size="xs">
                    {job.schedule?.kind === 'cron' ? job.schedule.expr : job.schedule?.kind}
                  </Badge>
                </div>

                {job.state && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs mt-3 pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                    <div>
                      <span style={{ color: 'var(--text-tertiary)' }}>Last Run</span>
                      <p style={{ color: 'var(--text-secondary)' }}>
                        {job.state.lastRunAtMs
                          ? new Date(job.state.lastRunAtMs).toLocaleString()
                          : 'Never'}
                      </p>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-tertiary)' }}>Status</span>
                      <p>
                        <Badge
                          variant={job.state.lastStatus === 'error' ? 'danger' : 'success'}
                          size="xs"
                        >
                          {job.state.lastStatus || 'unknown'}
                        </Badge>
                      </p>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-tertiary)' }}>Duration</span>
                      <p style={{ color: 'var(--text-secondary)' }}>
                        {job.state.lastDurationMs
                          ? `${Math.round(job.state.lastDurationMs / 1000)}s`
                          : '-'}
                      </p>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-tertiary)' }}>Errors</span>
                      <p
                        className={job.state.consecutiveErrors > 0 ? 'font-medium' : ''}
                        style={{ color: job.state.consecutiveErrors > 0 ? 'var(--accent-red)' : 'var(--text-secondary)' }}
                      >
                        {job.state.consecutiveErrors || 0}
                      </p>
                    </div>
                  </div>
                )}

                {job.state?.lastError && (
                  <div
                    className="mt-2 p-2 rounded text-xs break-all"
                    style={{ background: 'var(--accent-red-dim)', color: 'var(--accent-red)' }}
                  >
                    {job.state.lastError}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

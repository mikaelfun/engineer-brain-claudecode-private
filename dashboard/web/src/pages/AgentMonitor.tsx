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
          <h2 className="text-2xl font-bold text-gray-900">Agent Monitor</h2>
          <p className="text-gray-500 text-sm mt-1">
            {agents.length} agents | {cronJobs.length} cron jobs | {liveSessions.length} live sessions
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
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
                className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors"
              >
                {cancelPatrol.isPending ? 'Cancelling...' : 'Cancel Patrol'}
              </button>
            )}
          </div>

          {/* Progress bar */}
          {changedCases > 0 && (
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{processedCases} / {changedCases} cases</span>
                <span>{Math.round((processedCases / changedCases) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 rounded-full h-2 transition-all duration-500"
                  style={{ width: `${(processedCases / changedCases) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Phase description */}
          <div className="flex items-center gap-2">
            {isRunning && (
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            )}
            <span className="text-sm text-gray-700">
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
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-gray-500">Cases ({caseProgress.filter(c => c.status === 'completed').length}/{caseProgress.length} done):</span>
                {caseProgress.filter(c => c.status === 'processing').length > 0 && (
                  <span className="text-xs text-blue-600 font-medium">
                    {caseProgress.filter(c => c.status === 'processing').length} running in parallel
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {caseProgress.map((cp) => (
                  <span
                    key={cp.caseNumber}
                    className={`px-1.5 py-0.5 rounded text-xs font-mono flex items-center gap-1 ${
                      cp.status === 'completed' ? 'bg-green-50 text-green-700'
                        : cp.status === 'processing' ? 'bg-blue-50 text-blue-700'
                        : cp.status === 'failed' ? 'bg-red-50 text-red-700'
                        : 'bg-gray-50 text-gray-600'
                    }`}
                    title={cp.error || cp.status}
                  >
                    {cp.status === 'processing' && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />}
                    {cp.status === 'completed' && <span className="text-green-500">✓</span>}
                    {cp.status === 'failed' && <span className="text-red-500">✗</span>}
                    {cp.caseNumber.slice(-6)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {patrolError && (
            <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-600">
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
              <div key={s.sessionId} className="flex items-center justify-between py-1.5 px-2 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  <SessionBadge status={s.status} compact />
                  <span className="text-sm font-mono text-gray-700">{s.caseNumber}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400">
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
              <span className="text-gray-500">Cases</span>
              <p className="font-bold">{patrol.lastRunTiming?.caseCount || 0}</p>
            </div>
            <div>
              <span className="text-gray-500">Duration</span>
              <p className="font-bold">{patrol.lastRunTiming?.wallClockMinutes || 0} min</p>
            </div>
            <div>
              <span className="text-gray-500">Compute</span>
              <p className="font-bold">{patrol.lastRunTiming?.computeSeconds || 0}s</p>
            </div>
            <div>
              <span className="text-gray-500">Started</span>
              <p className="font-bold text-xs">{patrol.currentPatrolStartedAt ? new Date(patrol.currentPatrolStartedAt).toLocaleString() : '-'}</p>
            </div>
          </div>
          {patrol.lastRunTiming?.bottlenecks?.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-500">Bottlenecks:</span>
              <ul className="text-xs text-gray-600 mt-1 space-y-0.5">
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
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Agents</h3>
        {agents.length === 0 ? (
          <EmptyState icon="🤖" title="No agents" description="No agents configured" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {agents.map((agent: any) => (
              <Card key={agent.id}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🤖</span>
                  <h4 className="font-semibold text-gray-900">{agent.name || agent.id}</h4>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Model</span>
                    <Badge variant="primary" size="xs">
                      {agent.model.split('/').pop()}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">ID</span>
                    <span className="font-mono text-xs text-gray-600">{agent.id}</span>
                  </div>
                  {agent.subagents?.allowAgents && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Sub-agents</span>
                      <span className="text-xs text-gray-600">
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
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Cron Jobs</h3>
        {cronJobs.length === 0 ? (
          <EmptyState icon="⏰" title="No cron jobs" />
        ) : (
          <div className="space-y-3">
            {cronJobs.map((job: any) => (
              <Card key={job.id}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900">{job.name}</h4>
                      <Badge variant={job.enabled ? 'success' : 'secondary'} size="xs">
                        {job.enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">Agent: {job.agentId}</p>
                  </div>
                  <Badge variant="primary" size="xs">
                    {job.schedule?.kind === 'cron' ? job.schedule.expr : job.schedule?.kind}
                  </Badge>
                </div>

                {job.state && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs mt-3 pt-3 border-t border-gray-100">
                    <div>
                      <span className="text-gray-500">Last Run</span>
                      <p className="text-gray-700">
                        {job.state.lastRunAtMs
                          ? new Date(job.state.lastRunAtMs).toLocaleString()
                          : 'Never'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Status</span>
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
                      <span className="text-gray-500">Duration</span>
                      <p className="text-gray-700">
                        {job.state.lastDurationMs
                          ? `${Math.round(job.state.lastDurationMs / 1000)}s`
                          : '-'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Errors</span>
                      <p className={job.state.consecutiveErrors > 0 ? 'text-red-600 font-medium' : 'text-gray-700'}>
                        {job.state.consecutiveErrors || 0}
                      </p>
                    </div>
                  </div>
                )}

                {job.state?.lastError && (
                  <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-600 break-all">
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

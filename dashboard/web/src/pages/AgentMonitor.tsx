/**
 * AgentMonitor — Agent/Cron 监控页
 */
import { Card, CardHeader } from '../components/common/Card'
import { Badge } from '../components/common/Badge'
import { Loading, EmptyState } from '../components/common/Loading'
import { useAgents, useCronJobs, usePatrolState } from '../api/hooks'

export default function AgentMonitor() {
  const { data: agentsData, isLoading: agentsLoading } = useAgents()
  const { data: cronData, isLoading: cronLoading } = useCronJobs()
  const { data: patrol } = usePatrolState()

  if (agentsLoading || cronLoading) return <Loading text="Loading agents..." />

  const agents = agentsData?.agents || []
  const cronJobs = cronData?.jobs || []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Agent Monitor</h2>
        <p className="text-gray-500 text-sm mt-1">
          {agents.length} agents | {cronJobs.length} cron jobs
        </p>
      </div>

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
          <EmptyState icon="🤖" title="No agents" description="openclaw.json not found" />
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

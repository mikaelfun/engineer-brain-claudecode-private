/**
 * AutomationsPage — Cron Jobs + Teams Watch management
 *
 * Migrated from AgentMonitor. Centralized automation management.
 * Tab layout: Cron Jobs | Teams Watch (placeholder)
 */
import { Card } from '../components/common/Card'
import { Badge } from '../components/common/Badge'
import { Loading, EmptyState } from '../components/common/Loading'
import {
  useCronJobs, useTriggers, useDeleteTrigger, useRunTrigger, useCancelTrigger, useToggleTrigger,
  useTeamsWatches, useTeamsWatchHistory, useStartTeamsWatch, useStopTeamsWatch,
  useDeleteTeamsWatch, useCreateTeamsWatch, useSbaStatus, useToggleAutoPatrol,
  useRestartTeamsWatch,
  useCronMessages,
} from '../api/hooks'
import { SessionMessageList } from '../components/session/SessionMessageList'
import { useTriggerRunStore } from '../stores/triggerRunStore'
import { CreateTriggerDialog, type TriggerEditData } from '../components/agents/CreateTriggerDialog'
import { useQueryClient } from '@tanstack/react-query'
import {
  RefreshCw, Plus, Trash2, Play, Loader2,
  CheckCircle2, AlertCircle, XCircle, Pencil, Power, Square,
} from 'lucide-react'
import { useState, useEffect, useRef, useMemo } from 'react'
import { useNotificationStore } from '../stores/notificationStore'

// ---- Watch Health Status ----

export type WatchHealthStatus = 'running' | 'stale' | 'stopped'

/**
 * Compute the health status of a Teams Watch based on heartbeat data.
 *
 * - stopped: backend reports status=stopped (PID dead)
 * - stale: PID alive but lastPollAt is missing or older than 3×interval
 * - running: PID alive and lastPollAt within 3×interval
 */
export function getWatchHealthStatus(
  lastPollAt: string | null,
  interval: number,
  status: 'running' | 'stopped',
  consecutiveErrors: number,
): WatchHealthStatus {
  if (status === 'stopped') return 'stopped'

  // PID alive but no poll data yet — stale
  if (!lastPollAt) return 'stale'

  const elapsed = Date.now() - new Date(lastPollAt).getTime()
  const threshold = 3 * interval * 1000

  if (elapsed > threshold) return 'stale'

  return 'running'
}

/**
 * Format a timestamp as relative time (e.g. "2 分钟前", "刚刚").
 */
export function formatRelativeTime(ts: string | null): string {
  if (!ts) return 'Never'
  const diff = Date.now() - new Date(ts).getTime()
  if (diff < 0) return '刚刚'
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

// ---- Cron Job Detail Panel ----

function CronJobDetailPanel({ job, triggerRun, onDismissRun }: {
  job: any | null
  triggerRun?: any
  onDismissRun: () => void
}) {
  const isJobRunning = triggerRun?.status === 'running' || job?.running
  const justFinished = triggerRun && triggerRun.status !== 'running'

  // Recovery: fetch persisted messages from backend when no SSE messages in store
  const { data: recoveredData } = useCronMessages(
    job?.id && !triggerRun?.messages?.length ? job.id : null
  )
  // Merge: SSE messages (live) > recovered messages (disk/memory)
  // disk (parseSessionLog) returns mainMessages with `type` field — already CaseSessionMessage compatible
  // in-memory (cronMessageStore) returns messages with `kind` field — needs mapping
  const displayMessages = useMemo(() => {
    if (triggerRun?.messages?.length > 0) return triggerRun.messages
    // Disk recovery: mainMessages already has correct `type` field
    if (recoveredData?.mainMessages && recoveredData.mainMessages.length > 0) {
      return recoveredData.mainMessages.map((m: any) => ({
        type: m.type || 'thinking',
        content: m.content || '',
        toolName: m.toolName,
        timestamp: m.timestamp,
      }))
    }
    // In-memory recovery: messages use `kind` field, needs mapping
    if (recoveredData?.messages && recoveredData.messages.length > 0) {
      return recoveredData.messages.map((m: any) => ({
        type: m.type || (m.kind === 'tool-call' ? 'tool-call'
          : m.kind === 'tool-result' ? 'tool-result'
          : m.kind === 'response' ? 'response'
          : m.kind?.startsWith('agent-') ? 'system'
          : 'thinking'),
        content: m.content || '',
        toolName: m.toolName,
        timestamp: m.timestamp,
      }))
    }
    return []
  }, [triggerRun?.messages, recoveredData])
  const hasMessages = displayMessages.length > 0

  // Auto-scroll SSE output to bottom
  const sseScrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = sseScrollRef.current
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  }, [displayMessages])

  // Client-side elapsed timer — ticks every second while running
  const [localElapsed, setLocalElapsed] = useState(0)
  useEffect(() => {
    if (!isJobRunning || !triggerRun?.startedAt) {
      setLocalElapsed(triggerRun?.elapsedMs || 0)
      return
    }
    setLocalElapsed(Date.now() - triggerRun.startedAt)
    const timer = setInterval(() => {
      setLocalElapsed(Date.now() - triggerRun.startedAt)
    }, 1000)
    return () => clearInterval(timer)
  }, [isJobRunning, triggerRun?.startedAt, triggerRun?.elapsedMs])

  // Banner dismiss — only hides status header, keeps SSE messages visible
  const [bannerDismissed, setBannerDismissed] = useState(false)
  useEffect(() => { if (isJobRunning) setBannerDismissed(false) }, [isJobRunning])

  if (!job) {
    return (
      <Card className="h-full">
        <div className="flex items-center justify-center h-full min-h-[120px]">
          <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            Select a job to view details
          </span>
        </div>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 min-h-0 gap-3 overflow-hidden">
        {/* Header */}
        <div>
          <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{job.name}</h4>
          {(job as any).description && (
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{(job as any).description}</p>
          )}
          {(job as any).prompt && (job as any).prompt !== job.name && (
            <p className="text-xs mt-1 font-mono px-2 py-1 rounded" style={{ background: 'var(--bg-inset)', color: 'var(--text-secondary)' }}>
              {(job as any).prompt}
            </p>
          )}
        </div>

        {/* Stats row */}
        {job.state && (
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div>
              <span style={{ color: 'var(--text-tertiary)' }}>Status</span>
              <p>
                <Badge
                  variant={job.state.lastStatus === 'error' ? 'danger' : job.state.lastStatus === 'success' ? 'success' : 'secondary'}
                  size="xs"
                >
                  {job.state.lastStatus || 'pending'}
                </Badge>
              </p>
            </div>
            <div>
              <span style={{ color: 'var(--text-tertiary)' }}>Duration</span>
              <p style={{ color: 'var(--text-secondary)' }}>{job.state.lastDurationMs ? `${Math.round(job.state.lastDurationMs / 1000)}s` : '-'}</p>
            </div>
            <div>
              <span style={{ color: 'var(--text-tertiary)' }}>Last Run</span>
              <p style={{ color: 'var(--text-secondary)' }}>{job.state.lastRunAtMs ? new Date(job.state.lastRunAtMs).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'Never'}</p>
            </div>
            <div>
              <span style={{ color: 'var(--text-tertiary)' }}>Errors</span>
              <p style={{ color: job.state.consecutiveErrors > 0 ? 'var(--accent-red)' : 'var(--text-secondary)' }}>
                {job.state.consecutiveErrors || 0}
              </p>
            </div>
          </div>
        )}

        {/* Status banner — running */}
        {isJobRunning && triggerRun && (
          <div className="flex items-center px-3 py-1.5 rounded shrink-0" style={{ background: 'var(--accent-blue-dim)' }}>
            <span className="text-xs font-medium flex items-center gap-1.5" style={{ color: 'var(--accent-blue)' }}>
              <Loader2 className="w-3 h-3 animate-spin" />
              Running... {localElapsed > 0 && `(${Math.round(localElapsed / 1000)}s)`}
            </span>
          </div>
        )}

        {/* Status banner — just finished (dismissible, only hides banner not output) */}
        {justFinished && !bannerDismissed && (
          <div className="flex items-center justify-between px-3 py-1.5 rounded shrink-0" style={{
            background: triggerRun.status === 'completed' ? 'var(--accent-green-dim)' : triggerRun.status === 'failed' ? 'var(--accent-red-dim)' : 'var(--bg-hover)',
          }}>
            <span className="text-xs font-medium flex items-center gap-1.5" style={{
              color: triggerRun.status === 'completed' ? 'var(--accent-green)' : triggerRun.status === 'failed' ? 'var(--accent-red)' : 'var(--text-secondary)',
            }}>
              {triggerRun.status === 'completed' && <><CheckCircle2 className="w-3 h-3" /> Done ({Math.round(localElapsed / 1000)}s)</>}
              {triggerRun.status === 'failed' && <><AlertCircle className="w-3 h-3" /> Failed ({Math.round(localElapsed / 1000)}s)</>}
              {triggerRun.status === 'cancelled' && <><XCircle className="w-3 h-3" /> Cancelled</>}
            </span>
            <button onClick={() => setBannerDismissed(true)} className="text-xs px-2 py-0.5 rounded hover:bg-[var(--bg-hover)]" style={{ color: 'var(--text-tertiary)' }}>
              Dismiss
            </button>
          </div>
        )}

        {/* Error detail from run */}
        {justFinished && triggerRun.error && (
          <div className="px-3 py-2 text-xs rounded break-all" style={{ background: 'var(--accent-red-dim)', color: 'var(--accent-red)' }}>
            {triggerRun.error}
          </div>
        )}

        {/* Output area — SSE messages persist after completion, plain lastOutput as fallback */}
        <div className="flex-1 min-h-0 flex flex-col">
          {hasMessages ? (
            <div className="rounded overflow-hidden flex-1 min-h-0 flex flex-col" style={{ border: '1px solid var(--border-subtle)' }}>
              <div ref={sseScrollRef} className="px-2 py-1 flex-1 min-h-0 overflow-y-auto">
                <SessionMessageList messages={displayMessages} maxHeightClass="" />
              </div>
            </div>
          ) : triggerRun?.output ? (
            <pre className="p-2 rounded text-xs overflow-auto whitespace-pre-wrap flex-1 min-h-0" style={{ background: 'var(--bg-inset)', color: 'var(--text-primary)' }}>
              {triggerRun.output}
            </pre>
          ) : isJobRunning ? (
            <div className="flex items-center justify-center flex-1 min-h-[80px]">
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Waiting for output...</span>
            </div>
          ) : (
            <>
              {!isJobRunning && job.state?.lastError && (
                <div className="p-2 rounded text-xs break-all shrink-0" style={{ background: 'var(--accent-red-dim)', color: 'var(--accent-red)' }}>
                  {job.state.lastError}
                </div>
              )}
              {job.state?.lastOutput ? (
                <div className="flex-1 min-h-0 flex flex-col">
                  <span className="text-xs shrink-0" style={{ color: 'var(--text-tertiary)' }}>Last Output</span>
                  <pre className="mt-1 p-2 rounded text-xs overflow-auto whitespace-pre-wrap flex-1 min-h-0" style={{ background: 'var(--bg-inset)', color: 'var(--text-primary)' }}>
                    {job.state.lastOutput}
                  </pre>
                </div>
              ) : (
                <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>No output recorded</div>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  )
}

// ---- Tab type ----

type AutomationTab = 'cron' | 'teams-watch' | 'activity-feed'

// ---- Main Component ----

export default function AutomationsPage() {
  const [activeTab, setActiveTab] = useState<AutomationTab>('cron')

  // ---- Teams Watch state (page-level for tab count) ----
  const { data: teamsWatchData } = useTeamsWatches()
  const teamsWatches = teamsWatchData?.watches || []

  // ---- Cron Jobs state ----
  const { data: cronData, isLoading: cronLoading } = useCronJobs()
  const { data: triggersData } = useTriggers()
  const deleteTrigger = useDeleteTrigger()
  const runTrigger = useRunTrigger()
  const cancelTrigger = useCancelTrigger()
  const toggleTrigger = useToggleTrigger()
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingTrigger, setEditingTrigger] = useState<TriggerEditData | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [selectedCronJobId, setSelectedCronJobId] = useState<string | null>(null)

  // Trigger run store
  const triggerRuns = useTriggerRunStore((s) => s.runs)
  const clearTriggerRun = useTriggerRunStore((s) => s.clearRun)

  const queryClient = useQueryClient()
  const [refreshing, setRefreshing] = useState(false)

  // Reconcile stale trigger "running" state with API truth
  useEffect(() => {
    if (!triggersData) return
    const triggers: any[] = (triggersData as any).triggers || (triggersData as any).jobs || []
    const store = useTriggerRunStore.getState()
    for (const [triggerId, run] of Object.entries(store.runs)) {
      if ((run as any)?.status !== 'running') continue
      const apiTrigger = triggers.find((t: any) => t.id === triggerId)
      if (!apiTrigger || apiTrigger.running) continue
      const state = apiTrigger.state || {}
      if (state.lastStatus === 'success') {
        store.onTriggerCompleted(triggerId, state.lastDurationMs || 0, state.lastOutput?.slice(0, 300))
      } else if (state.lastStatus === 'error') {
        store.onTriggerFailed(triggerId, state.lastDurationMs || 0, state.lastError)
      } else if (state.lastStatus === 'cancelled') {
        store.onTriggerCancelled(triggerId, state.lastDurationMs || 0)
      } else {
        store.onTriggerCompleted(triggerId, state.lastDurationMs || 0)
      }
    }
  }, [triggersData])

  // Auto-refresh every 30s
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['agents', 'cron-jobs'] })
    }, 30_000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [queryClient])

  const handleRefresh = () => {
    setRefreshing(true)
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['agents', 'cron-jobs'] }),
      queryClient.invalidateQueries({ queryKey: ['agents', 'triggers'] }),
    ]).finally(() => {
      setTimeout(() => setRefreshing(false), 500)
    })
  }

  const cronJobs = cronData?.jobs || []

  // ---- Tab definitions ----
  const tabs: { key: AutomationTab; label: string; icon: string; count?: number }[] = [
    { key: 'cron', label: 'Cron Jobs', icon: '⏰', count: cronJobs.length },
    { key: 'teams-watch', label: 'Teams Watch', icon: '👁️', count: teamsWatches.length },
    { key: 'activity-feed', label: 'Activity Feed', icon: '📡' },
  ]

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Automations</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
            Manage recurring tasks and automated watchers
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'cron' && (
            <button
              onClick={() => setShowCreateDialog(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors"
              style={{ background: 'var(--accent-blue)', color: 'white' }}
            >
              <Plus className="w-4 h-4" />
              New Cron Job
            </button>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-lg transition-colors disabled:opacity-50"
            style={{ color: 'var(--text-secondary)', background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex items-center gap-1 p-1 rounded-lg shrink-0" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all"
            style={{
              background: activeTab === tab.key ? 'var(--bg-active)' : 'transparent',
              color: activeTab === tab.key ? 'var(--text-primary)' : 'var(--text-tertiary)',
              boxShadow: activeTab === tab.key ? '0 1px 3px rgba(0,0,0,0.2)' : 'none',
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
            {tab.count !== undefined && (
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-full font-mono"
                style={{
                  background: activeTab === tab.key ? 'var(--accent-blue-dim)' : 'var(--bg-inset)',
                  color: activeTab === tab.key ? 'var(--accent-blue)' : 'var(--text-tertiary)',
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 min-h-0 flex flex-col">
      {activeTab === 'cron' && (
        <CronJobsTab
          cronJobs={cronJobs}
          cronLoading={cronLoading}
          triggerRuns={triggerRuns}
          selectedCronJobId={selectedCronJobId}
          setSelectedCronJobId={setSelectedCronJobId}
          deletingId={deletingId}
          setDeletingId={setDeletingId}
          deleteTrigger={deleteTrigger}
          runTrigger={runTrigger}
          cancelTrigger={cancelTrigger}
          toggleTrigger={toggleTrigger}
          clearTriggerRun={clearTriggerRun}
          setEditingTrigger={setEditingTrigger}
        />
      )}

      {activeTab === 'teams-watch' && (
        <TeamsWatchTab watches={teamsWatches} />
      )}

      {activeTab === 'activity-feed' && (
        <ActivityFeedTab />
      )}
      </div>

      {/* Create/Edit Trigger Dialog */}
      <CreateTriggerDialog
        isOpen={showCreateDialog || !!editingTrigger}
        onClose={() => { setShowCreateDialog(false); setEditingTrigger(null) }}
        editData={editingTrigger}
      />
    </div>
  )
}

// ---- Cron Jobs Tab ----

function CronJobsTab({
  cronJobs,
  cronLoading,
  triggerRuns,
  selectedCronJobId,
  setSelectedCronJobId,
  deletingId,
  setDeletingId,
  deleteTrigger,
  runTrigger,
  cancelTrigger,
  toggleTrigger,
  clearTriggerRun,
  setEditingTrigger,
}: {
  cronJobs: any[]
  cronLoading: boolean
  triggerRuns: Record<string, any>
  selectedCronJobId: string | null
  setSelectedCronJobId: (id: string | null) => void
  deletingId: string | null
  setDeletingId: (id: string | null) => void
  deleteTrigger: any
  runTrigger: any
  cancelTrigger: any
  toggleTrigger: any
  clearTriggerRun: (id: string) => void
  setEditingTrigger: (data: TriggerEditData | null) => void
}) {
  if (cronLoading) return <Loading text="Loading cron jobs..." />

  if (cronJobs.length === 0) {
    return <EmptyState icon="⏰" title="No cron jobs" description="Create a cron job to automate recurring tasks" />
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[minmax(260px,340px)_1fr] gap-4 flex-1 min-h-0 overflow-hidden">
      {/* Left: job list */}
      <Card padding="none" className="h-full overflow-auto">
        <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
          {cronJobs.map((job: any) => {
            const triggerRun = triggerRuns[job.id]
            const isJobRunning = triggerRun?.status === 'running' || job.running
            const justFinished = triggerRun && triggerRun.status !== 'running'
            const isSelected = selectedCronJobId === job.id

            return (
              <div
                key={job.id}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors"
                style={{
                  background: isSelected ? 'var(--bg-active)' : 'transparent',
                  borderBottom: '1px solid var(--border-subtle)',
                }}
                onClick={() => setSelectedCronJobId(isSelected ? null : job.id)}
                onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)' }}
                onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                {/* Status dot */}
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${isJobRunning ? 'animate-pulse' : ''}`}
                  style={{
                    background: isJobRunning ? 'var(--accent-blue)'
                      : !job.enabled ? 'var(--text-tertiary)'
                      : job.state?.lastStatus === 'error' ? 'var(--accent-red)'
                      : job.state?.lastStatus === 'success' ? 'var(--accent-green)'
                      : 'var(--text-tertiary)',
                  }}
                />
                {/* Name + meta */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {job.name}
                    </span>
                    {!job.enabled && (
                      <span className="text-[10px] px-1 rounded" style={{ background: 'var(--bg-inset)', color: 'var(--text-tertiary)' }}>OFF</span>
                    )}
                    {isJobRunning && (
                      <Loader2 className="w-3 h-3 animate-spin shrink-0" style={{ color: 'var(--accent-blue)' }} />
                    )}
                    {justFinished && triggerRun.status === 'completed' && (
                      <CheckCircle2 className="w-3 h-3 shrink-0" style={{ color: 'var(--accent-green)' }} />
                    )}
                    {justFinished && triggerRun.status === 'failed' && (
                      <AlertCircle className="w-3 h-3 shrink-0" style={{ color: 'var(--accent-red)' }} />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] font-mono" style={{ color: 'var(--text-tertiary)' }}>
                      {job.schedule?.kind === 'cron' ? job.schedule.expr : job.schedule?.kind}
                    </span>
                    {job.state?.lastRunAtMs && (
                      <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                        {new Date(job.state.lastRunAtMs).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        {job.state.lastDurationMs ? ` (${Math.round(job.state.lastDurationMs / 1000)}s)` : ''}
                      </span>
                    )}
                  </div>
                </div>
                {/* Action buttons */}
                <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => toggleTrigger.mutate({ id: job.id, enabled: !job.enabled })}
                    disabled={toggleTrigger.isPending || isJobRunning}
                    className="p-1 rounded transition-colors hover:bg-[var(--bg-hover)]"
                    style={{ color: job.enabled ? 'var(--accent-green)' : 'var(--text-tertiary)' }}
                    title={job.enabled ? 'Disable' : 'Enable'}
                  >
                    <Power className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setEditingTrigger({
                      id: job.id,
                      name: job.name,
                      prompt: (job as any).prompt || '',
                      cron: job.schedule?.expr || '',
                      description: (job as any).description || '',
                    })}
                    disabled={isJobRunning}
                    className="p-1 rounded transition-colors hover:bg-[var(--bg-hover)]"
                    style={{ color: isJobRunning ? 'var(--text-tertiary)' : 'var(--text-secondary)' }}
                    title="Edit"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  {isJobRunning ? (
                    <button
                      onClick={() => cancelTrigger.mutate(job.id)}
                      disabled={cancelTrigger.isPending}
                      className="p-1 rounded transition-colors hover:bg-[var(--bg-hover)]"
                      style={{ color: 'var(--accent-red)' }}
                      title="Cancel"
                    >
                      <Square className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => runTrigger.mutate(job.id)}
                      disabled={runTrigger.isPending || !job.enabled}
                      className="p-1 rounded transition-colors hover:bg-[var(--bg-hover)]"
                      style={{ color: !job.enabled ? 'var(--text-tertiary)' : 'var(--accent-green)' }}
                      title={job.enabled ? 'Run now' : 'Enable first'}
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {deletingId === job.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { deleteTrigger.mutate(job.id); setDeletingId(null) }}
                        className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                        style={{ background: 'var(--accent-red)', color: 'white' }}
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setDeletingId(null)}
                        className="px-1.5 py-0.5 rounded text-[10px]"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeletingId(job.id)}
                      disabled={isJobRunning}
                      className="p-1 rounded transition-colors hover:bg-[var(--bg-hover)]"
                      style={{ color: isJobRunning ? 'var(--text-tertiary)' : 'var(--accent-red)' }}
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Right: selected job detail / output */}
      <CronJobDetailPanel
        job={cronJobs.find((j: any) => j.id === selectedCronJobId) || null}
        triggerRun={selectedCronJobId ? triggerRuns[selectedCronJobId] : undefined}
        onDismissRun={() => selectedCronJobId && clearTriggerRun(selectedCronJobId)}
      />
    </div>
  )
}

// ---- Teams Watch Tab ----

function TeamsWatchTab({ watches }: { watches: any[] }) {
  const [selectedWatchId, setSelectedWatchId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTopic, setNewTopic] = useState('')
  const [newInterval, setNewInterval] = useState('60')
  const [newAction, setNewAction] = useState('notify')
  const [notification, setNotification] = useState<null>(null) // kept for TS compat, not used
  const pushNotification = useNotificationStore((s) => s.push)

  // Track last message changes for global notification
  const prevMsgRef = useRef<Record<string, string>>({})
  useEffect(() => {
    for (const w of watches) {
      const key = w.watchId
      const prev = prevMsgRef.current[key]
      const curr = w.lastMessageId
      if (prev && curr && prev !== curr) {
        const card = w.history?.find((e: any) => e.parsedCard?.type === 'case-assignment')?.parsedCard
        if (card?.caseNumber) {
          pushNotification(`🔔 New case assigned: SR ${card.caseNumber} (Sev ${card.severity || '?'}) → ${card.assignedTo || '?'}`, 'warning', 15000)
        } else {
          pushNotification(`📩 ${w.topic}: ${w.lastMessageFrom || 'New'} — ${w.lastMessagePreview || ''}`, 'info')
        }
      }
      prevMsgRef.current[key] = curr || ''
    }
  }, [watches, pushNotification])

  const startWatch = useStartTeamsWatch()
  const stopWatch = useStopTeamsWatch()
  const restartWatch = useRestartTeamsWatch()
  const deleteWatch = useDeleteTeamsWatch()
  const createWatch = useCreateTeamsWatch()

  const { data: historyData } = useTeamsWatchHistory(selectedWatchId)
  const history = historyData?.history || []

  const selectedWatch = watches.find((w: any) => w.watchId === selectedWatchId) || null

  // Auto-refresh history when lastMessageId changes (new message detected)
  const queryClient = useQueryClient()
  const lastMsgId = selectedWatch?.lastMessageId || ''
  useEffect(() => {
    if (selectedWatchId && lastMsgId) {
      queryClient.invalidateQueries({ queryKey: ['teams-watch', selectedWatchId, 'history'] })
    }
  }, [lastMsgId, selectedWatchId, queryClient])

  const handleCreate = () => {
    if (!newTopic.trim()) return
    createWatch.mutate(
      { topic: newTopic.trim(), interval: Number(newInterval), action: newAction },
      {
        onSuccess: () => {
          setNewTopic('')
          setNewInterval('60')
          setNewAction('notify')
          setShowAddForm(false)
        },
      },
    )
  }

  if (watches.length === 0 && !showAddForm) {
    return (
      <div className="space-y-4">
        <EmptyState icon="👁️" title="No watches" description="Create a watch to monitor Teams chats" />
        <div className="flex justify-center">
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors"
            style={{ background: 'var(--accent-blue)', color: 'white' }}
          >
            <Plus className="w-4 h-4" />
            Add Watch
          </button>
        </div>
        {showAddForm && (
          <Card>
            <TeamsWatchAddForm
              newTopic={newTopic} setNewTopic={setNewTopic}
              newInterval={newInterval} setNewInterval={setNewInterval}
              newAction={newAction} setNewAction={setNewAction}
              onCreate={handleCreate}
              onCancel={() => setShowAddForm(false)}
              isPending={createWatch.isPending}
            />
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-4 flex-1 min-h-0 overflow-hidden">
      {/* Left: watch list */}
      <Card padding="none">
        <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
          {watches.map((watch: any) => {
            const healthStatus = getWatchHealthStatus(watch.lastPollAt, watch.interval || 60, watch.status, watch.consecutiveErrors || 0)
            const isSelected = selectedWatchId === watch.watchId

            return (
              <div
                key={watch.watchId}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors"
                style={{
                  background: isSelected ? 'var(--bg-active)' : 'transparent',
                  borderBottom: '1px solid var(--border-subtle)',
                }}
                onClick={() => setSelectedWatchId(isSelected ? null : watch.watchId)}
                onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)' }}
                onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                {/* Status dot — green/yellow/red */}
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{
                    background: healthStatus === 'running' ? 'var(--accent-green)'
                      : healthStatus === 'stale' ? 'var(--accent-amber)'
                      : 'var(--text-tertiary)',
                  }}
                />
                {/* Name + meta */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {watch.topic || 'Untitled Watch'}
                    </span>
                    {healthStatus === 'running' && (
                      <span className="text-[10px] px-1 rounded" style={{ background: 'var(--accent-green-dim)', color: 'var(--accent-green)' }}>ON</span>
                    )}
                    {healthStatus === 'stale' && (
                      <span className="text-[10px] px-1 rounded" style={{ background: 'var(--accent-amber-dim)', color: 'var(--accent-amber)' }}>STALE</span>
                    )}
                    {healthStatus === 'stopped' && (
                      <span className="text-[10px] px-1 rounded" style={{ background: 'var(--bg-inset)', color: 'var(--text-tertiary)' }}>OFF</span>
                    )}
                    {(watch.consecutiveErrors || 0) > 0 && (
                      <span className="text-[10px] px-1 rounded font-medium" style={{ background: 'var(--accent-red-dim)', color: 'var(--accent-red)' }}>
                        ⚠ {watch.consecutiveErrors}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] font-mono" style={{ color: 'var(--text-tertiary)' }}>
                      {watch.interval || 60}s | {watch.action || 'notify'} | {formatRelativeTime(watch.lastPollAt)}
                    </span>
                  </div>
                </div>
                {/* Action buttons */}
                <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                  {healthStatus === 'running' ? (
                    <button
                      onClick={() => stopWatch.mutate(watch.watchId)}
                      disabled={stopWatch.isPending}
                      className="p-1 rounded transition-colors hover:bg-[var(--bg-hover)]"
                      style={{ color: stopWatch.isPending ? 'var(--text-tertiary)' : 'var(--accent-red)' }}
                      title="Stop"
                    >
                      {stopWatch.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Square className="w-3.5 h-3.5" />}
                    </button>
                  ) : healthStatus === 'stale' ? (
                    <button
                      onClick={() => restartWatch.mutate(watch.watchId)}
                      disabled={restartWatch.isPending}
                      className="p-1 rounded transition-colors hover:bg-[var(--bg-hover)]"
                      style={{ color: restartWatch.isPending ? 'var(--text-tertiary)' : 'var(--accent-amber)' }}
                      title="Restart (stop + start)"
                    >
                      {restartWatch.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                    </button>
                  ) : (
                    <button
                      onClick={() => startWatch.mutate(watch.watchId)}
                      disabled={startWatch.isPending}
                      className="p-1 rounded transition-colors hover:bg-[var(--bg-hover)]"
                      style={{ color: startWatch.isPending ? 'var(--text-tertiary)' : 'var(--accent-green)' }}
                      title="Start"
                    >
                      {startWatch.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                    </button>
                  )}
                  {deletingId === watch.watchId ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          deleteWatch.mutate(watch.watchId)
                          setDeletingId(null)
                          if (selectedWatchId === watch.watchId) setSelectedWatchId(null)
                        }}
                        className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                        style={{ background: 'var(--accent-red)', color: 'white' }}
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setDeletingId(null)}
                        className="px-1.5 py-0.5 rounded text-[10px]"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeletingId(watch.watchId)}
                      className="p-1 rounded transition-colors hover:bg-[var(--bg-hover)]"
                      style={{ color: 'var(--accent-red)' }}
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Add Watch section */}
        <div className="px-4 py-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          {showAddForm ? (
            <TeamsWatchAddForm
              newTopic={newTopic} setNewTopic={setNewTopic}
              newInterval={newInterval} setNewInterval={setNewInterval}
              newAction={newAction} setNewAction={setNewAction}
              onCreate={handleCreate}
              onCancel={() => setShowAddForm(false)}
              isPending={createWatch.isPending}
            />
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1.5 w-full justify-center py-1.5 rounded text-sm transition-colors"
              style={{ color: 'var(--accent-blue)' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
            >
              <Plus className="w-4 h-4" />
              Add Watch
            </button>
          )}
        </div>
      </Card>

      {/* Right: selected watch detail */}
      <TeamsWatchDetailPanel watch={selectedWatch} history={history} />
    </div>
  )
}

// ---- Teams Watch Add Form ----

function TeamsWatchAddForm({
  newTopic, setNewTopic,
  newInterval, setNewInterval,
  newAction, setNewAction,
  onCreate, onCancel,
  isPending,
}: {
  newTopic: string; setNewTopic: (v: string) => void
  newInterval: string; setNewInterval: (v: string) => void
  newAction: string; setNewAction: (v: string) => void
  onCreate: () => void; onCancel: () => void
  isPending: boolean
}) {
  return (
    <div className="space-y-2">
      <input
        type="text"
        placeholder="Topic name"
        value={newTopic}
        onChange={e => setNewTopic(e.target.value)}
        className="w-full px-2 py-1.5 rounded text-sm"
        style={{
          background: 'var(--bg-inset)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-subtle)',
          outline: 'none',
        }}
        onKeyDown={e => { if (e.key === 'Enter') onCreate() }}
      />
      <div className="flex gap-2">
        <select
          value={newInterval}
          onChange={e => setNewInterval(e.target.value)}
          className="flex-1 px-2 py-1.5 rounded text-sm"
          style={{
            background: 'var(--bg-inset)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-subtle)',
            outline: 'none',
          }}
        >
          <option value="30">30s</option>
          <option value="60">60s</option>
          <option value="120">120s</option>
          <option value="300">300s</option>
        </select>
        <select
          value={newAction}
          onChange={e => setNewAction(e.target.value)}
          className="flex-1 px-2 py-1.5 rounded text-sm"
          style={{
            background: 'var(--bg-inset)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-subtle)',
            outline: 'none',
          }}
        >
          <option value="notify">notify</option>
          <option value="log">log</option>
          <option value="self-message">self-message</option>
        </select>
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <button
          onClick={onCancel}
          className="px-3 py-1 rounded text-xs"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Cancel
        </button>
        <button
          onClick={onCreate}
          disabled={!newTopic.trim() || isPending}
          className="flex items-center gap-1 px-3 py-1 rounded text-xs font-medium disabled:opacity-50"
          style={{ background: 'var(--accent-blue)', color: 'white' }}
        >
          {isPending && <Loader2 className="w-3 h-3 animate-spin" />}
          Add
        </button>
      </div>
    </div>
  )
}

// ---- Teams Watch Detail Panel ----

function TeamsWatchDetailPanel({ watch, history }: { watch: any | null; history: any[] }) {
  const [historyOpen, setHistoryOpen] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editInterval, setEditInterval] = useState(60)
  const [editAction, setEditAction] = useState('notify')
  const stopWatch = useStopTeamsWatch()
  const createWatch = useCreateTeamsWatch()
  const restartWatch = useRestartTeamsWatch()
  const { data: sbaStatus } = useSbaStatus()
  const autoPatrolMut = useToggleAutoPatrol()
  // Local optimistic state for instant UI feedback
  const [localAutoPatrol, setLocalAutoPatrol] = useState<boolean | null>(null)

  if (!watch) {
    return (
      <Card className="h-full">
        <div className="flex items-center justify-center h-full min-h-[120px]">
          <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            Select a watch to view details
          </span>
        </div>
      </Card>
    )
  }

  const healthStatus = getWatchHealthStatus(watch.lastPollAt, watch.interval || 60, watch.status, watch.consecutiveErrors || 0)
  const lastPollRelative = formatRelativeTime(watch.lastPollAt)

  // SBA-specific: auto patrol toggle
  const isSbaWatch = watch.chatId?.includes('deeeb1e6') || watch.topic?.includes('SBA')
  const autoPatrolEnabled = localAutoPatrol ?? sbaStatus?.autoPatrolEnabled ?? true

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 min-h-0 gap-3 overflow-hidden">
        {/* Header */}
        <div>
          <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {watch.topic || 'Untitled Watch'}
          </h4>
          {watch.chatId && (
            <p className="text-[10px] mt-0.5 font-mono break-all" style={{ color: 'var(--text-tertiary)' }}>
              {watch.chatId}
            </p>
          )}
          <div className="flex items-center gap-3 mt-1">
            {editing ? (
              <>
                <select
                  value={editInterval}
                  onChange={e => setEditInterval(Number(e.target.value))}
                  className="text-[11px] px-1 py-0.5 rounded"
                  style={{ background: 'var(--bg-inset)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
                >
                  <option value={30}>30s</option>
                  <option value={60}>60s</option>
                  <option value={120}>120s</option>
                  <option value={300}>300s</option>
                </select>
                <select
                  value={editAction}
                  onChange={e => setEditAction(e.target.value)}
                  className="text-[11px] px-1 py-0.5 rounded"
                  style={{ background: 'var(--bg-inset)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
                >
                  <option value="notify">notify</option>
                  <option value="log">log</option>
                  <option value="self-message">self-message</option>
                </select>
                <button
                  onClick={() => {
                    // Stop then restart with new params
                    stopWatch.mutate(watch.watchId, {
                      onSuccess: () => {
                        createWatch.mutate({ chatId: watch.chatId, interval: editInterval, action: editAction })
                        setEditing(false)
                      }
                    })
                  }}
                  disabled={stopWatch.isPending || createWatch.isPending}
                  className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                  style={{ background: 'var(--accent-blue)', color: 'white' }}
                >
                  {(stopWatch.isPending || createWatch.isPending) ? '...' : 'Save'}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="text-[10px] px-1.5 py-0.5 rounded"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                  Interval: {watch.interval || 60}s
                </span>
                <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                  Action: {watch.action || 'notify'}
                </span>
                <button
                  onClick={() => { setEditInterval(watch.interval || 60); setEditAction(watch.action || 'notify'); setEditing(true) }}
                  className="p-0.5 rounded hover:bg-[var(--bg-hover)]"
                  style={{ color: 'var(--text-tertiary)' }}
                  title="Edit"
                >
                  <Pencil className="w-3 h-3" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Stats row — Status + Last Poll + Poll Count + Errors */}
        <div className="grid grid-cols-4 gap-2 text-xs">
          <div>
            <span style={{ color: 'var(--text-tertiary)' }}>Status</span>
            <p>
              <Badge
                variant={healthStatus === 'running' ? 'success' : healthStatus === 'stale' ? 'warning' : 'danger'}
                size="xs"
              >
                {healthStatus}
              </Badge>
            </p>
          </div>
          <div>
            <span style={{ color: 'var(--text-tertiary)' }}>Last Poll</span>
            <p style={{ color: healthStatus === 'stale' ? 'var(--accent-amber)' : 'var(--text-secondary)' }}>
              {lastPollRelative}
            </p>
          </div>
          <div>
            <span style={{ color: 'var(--text-tertiary)' }}>Polls</span>
            <p style={{ color: 'var(--text-secondary)' }}>{watch.pollCount ?? 0}</p>
          </div>
          <div>
            <span style={{ color: 'var(--text-tertiary)' }}>Errors</span>
            <p style={{ color: (watch.consecutiveErrors || 0) > 0 ? 'var(--accent-red)' : 'var(--text-secondary)' }}>
              {watch.consecutiveErrors || 0}
            </p>
          </div>
        </div>

        {/* Stale warning + Restart button */}
        {healthStatus === 'stale' && (
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded text-xs" style={{ background: 'var(--accent-amber-dim)', border: '1px solid var(--accent-amber)' }}>
            <span style={{ color: 'var(--accent-amber)' }}>
              ⚠ Daemon may have stopped polling. Last seen: {lastPollRelative}
            </span>
            <button
              onClick={() => restartWatch.mutate(watch.watchId)}
              disabled={restartWatch.isPending}
              className="px-2 py-0.5 rounded text-[10px] font-medium transition-colors flex items-center gap-1"
              style={{ background: 'var(--accent-amber)', color: 'white' }}
            >
              {restartWatch.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
              Restart
            </button>
          </div>
        )}

        {/* Auto Patrol toggle (SBA watch only) */}
        {isSbaWatch && (
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded text-xs" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <div>
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Auto Patrol</span>
              <span className="ml-2" style={{ color: 'var(--text-tertiary)' }}>
                {autoPatrolEnabled ? 'Case assignment → auto patrol' : 'Notifications only'}
              </span>
            </div>
            <button
              onClick={() => { const next = !autoPatrolEnabled; setLocalAutoPatrol(next); autoPatrolMut.mutate(next, { onSettled: () => setLocalAutoPatrol(null) }) }}
              disabled={autoPatrolMut.isPending}
              className="px-2 py-0.5 rounded text-[10px] font-medium transition-colors"
              style={{
                background: autoPatrolEnabled ? 'var(--accent-green)' : 'var(--bg-inset)',
                color: autoPatrolEnabled ? 'white' : 'var(--text-tertiary)',
              }}
            >
              {autoPatrolEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
        )}

        {/* Latest message */}
        {watch.lastMessageFrom && (
          <div className="rounded px-2.5 py-1.5 text-xs" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium" style={{ color: 'var(--text-tertiary)' }}>Latest Message</span>
              {watch.lastMessageTime && (
                <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                  {new Date(watch.lastMessageTime).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
            <p className="mt-0.5" style={{ color: 'var(--text-primary)', overflowWrap: 'break-word', wordBreak: 'break-word' }}>
              {watch.lastMessageFrom}: {decodeHtml(watch.lastMessagePreview || '(no content)')}
            </p>
          </div>
        )}

        {/* History section — collapsible */}
        <div className="flex-1 min-h-0 flex flex-col">
          <button
            onClick={() => setHistoryOpen(!historyOpen)}
            className="flex items-center gap-1 text-xs shrink-0 mb-1 hover:opacity-80"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <span style={{ display: 'inline-block', transform: historyOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}>▶</span>
            History ({history.length})
          </button>
          {historyOpen && (
            history.length === 0 ? (
              <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>No history yet</div>
            ) : (
              <div className="flex-1 min-h-0 overflow-auto space-y-1.5">
                {(() => {
                  // Deduplicate by messageTime+from+preview
                  const seen = new Set<string>()
                  return [...history].reverse().filter((entry: any) => {
                    const key = `${entry.messageTime || entry.detectedAt}|${entry.from}|${entry.preview}`
                    if (seen.has(key)) return false
                    seen.add(key)
                    return true
                  }).map((entry: any, idx: number) => (
                    <TeamsWatchHistoryEntry key={idx} entry={entry} />
                  ))
                })()}
              </div>
            )
          )}
        </div>
      </div>
    </Card>
  )
}

// ---- Teams Watch History Entry ----

// Decode HTML entities in preview text (e.g. &gt; → >)
function decodeHtml(text: string): string {
  const el = document.createElement('textarea')
  el.innerHTML = text
  return el.value
}

function TeamsWatchHistoryEntry({ entry }: { entry: any }) {
  const rawTs = entry.messageTime || entry.detectedAt || entry.timestamp || ''
  const ts = rawTs
    ? new Date(rawTs).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
    : ''

  // SBA card entry
  if (entry.parsedCard) {
    const card = entry.parsedCard
    return (
      <div
        className="rounded px-2.5 py-2 text-xs overflow-hidden"
        style={{ background: 'var(--accent-blue-dim)', border: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-center justify-between">
          <span className="font-medium" style={{ color: 'var(--accent-blue)' }}>
            🔔 SR {card.caseNumber || '?'} (Sev {card.severity || '?'})
          </span>
          <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{ts}</span>
        </div>
        {card.assignedTo && (
          <div className="mt-0.5 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
            Assigned: {card.assignedTo}
          </div>
        )}
        <div className="flex items-center gap-3 mt-0.5">
          {card.sla && (
            <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>SLA: {card.sla}</span>
          )}
          {card.patrolStatus && (
            <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Patrol: {card.patrolStatus}</span>
          )}
        </div>
      </div>
    )
  }

  // Normal message entry
  return (
    <div
      className="rounded px-2.5 py-1.5 text-xs"
      style={{ background: 'var(--bg-inset)' }}
    >
      <div className="flex items-center justify-between mb-0.5">
        <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>
          📩 {entry.from || 'Unknown'}
        </span>
        <span className="text-[10px] shrink-0 ml-2" style={{ color: 'var(--text-tertiary)' }}>{ts}</span>
      </div>
      <p className="break-words" style={{ color: 'var(--text-primary)' }}>
        {decodeHtml(entry.preview || entry.message || 'No content')}
      </p>
    </div>
  )
}

// ---- Activity Feed Tab (placeholder) ----

function ActivityFeedTab() {
  const feedSources = [
    { icon: '🚨', name: 'Live Site Incidents', desc: 'ICM MCP 定期查询或 Teams 频道监听', status: 'planned' },
    { icon: '⚠️', name: 'Known Issues', desc: 'SharePoint MCP 搜索产品已知问题', status: 'planned' },
    { icon: '💬', name: 'Team Hot Topics', desc: 'M365 Copilot 搜索团队热点讨论', status: 'planned' },
    { icon: '📅', name: 'Calendar Reminders', desc: '即将到来的外部客户会议（calendar MCP）', status: 'ready' },
  ]

  return (
    <Card className="flex-1 min-h-0">
      <div className="flex flex-col items-center justify-center h-full gap-6">
        <span className="text-4xl">📡</span>
        <div className="text-center">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Activity Feed
          </h3>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
            Coming Soon — ISS-234
          </p>
          <p className="text-xs mt-2 max-w-lg" style={{ color: 'var(--text-tertiary)' }}>
            Aggregate external information streams into a unified timeline.
            Each feed source polls independently and renders in reverse chronological order.
          </p>
        </div>

        {/* Feed source preview */}
        <div className="w-full max-w-lg space-y-2 mt-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide px-1" style={{ color: 'var(--text-tertiary)' }}>
            Planned Feed Sources
          </h4>
          {feedSources.map((src) => (
            <div
              key={src.name}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
            >
              <span className="text-lg shrink-0">{src.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{src.name}</div>
                <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{src.desc}</div>
              </div>
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0"
                style={{
                  background: src.status === 'ready' ? 'var(--accent-green-dim)' : 'var(--bg-inset)',
                  color: src.status === 'ready' ? 'var(--accent-green)' : 'var(--text-tertiary)',
                }}
              >
                {src.status === 'ready' ? 'MCP Ready' : 'Planned'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

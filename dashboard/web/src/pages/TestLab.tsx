/**
 * TestLab.tsx — Test Supervisor Dashboard
 *
 * Real-time visibility into test-loop supervisor runs:
 * - Phase Pipeline stepper
 * - Stats Cards (passed/failed/fixed/skipped)
 * - Round Journey table
 * - Queue tables (test/fix/verify)
 * - Phase History timeline
 * - Discovery bug tracker
 * - Trend chart (SVG area chart)
 */
import { useState, useMemo, useEffect, useRef } from 'react'
import { useTestState, useTestDiscoveries, useTestTrends, useTestRegistry, useRunnerStatus, useRunnerStart, useRunnerStop, useTestEvolution } from '../api/hooks'
import { Card, CardHeader, StatCard } from '../components/common/Card'
import { Badge } from '../components/common/Badge'
import { Loading, EmptyState } from '../components/common/Loading'
import { CheckCircle, XCircle, Wrench, SkipForward, Activity, Clock, FlaskConical, Bug, Play, Square, Pause, AlertTriangle, Zap, Milestone } from 'lucide-react'
import { BASE_URL } from '../api/client'

// ============ Runner Control ============

function RunnerControl() {
  const { data: runnerStatus } = useRunnerStatus()
  const startMutation = useRunnerStart()
  const stopMutation = useRunnerStop()

  const status = runnerStatus?.status || 'idle'
  const startedAt = runnerStatus?.startedAt
  const lastRunAt = runnerStatus?.lastRunAt

  const statusConfig: Record<string, { color: string; bg: string; label: string; pulse: boolean }> = {
    idle: { color: 'var(--text-tertiary)', bg: 'var(--bg-inset)', label: 'IDLE', pulse: false },
    running: { color: 'var(--accent-green)', bg: 'var(--accent-green-dim)', label: 'RUNNING', pulse: true },
    paused: { color: 'var(--accent-amber)', bg: 'var(--accent-amber-dim)', label: 'PAUSED', pulse: false },
  }
  const cfg = statusConfig[status] || statusConfig.idle

  function formatTime(ts: string | null | undefined): string {
    if (!ts) return '-'
    try {
      return new Date(ts).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
    } catch { return ts }
  }

  return (
    <div className="flex items-center gap-3">
      {/* Status indicator */}
      <div className="flex items-center gap-1.5">
        <div
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{
            background: cfg.color,
            boxShadow: cfg.pulse ? `0 0 8px ${cfg.color}` : 'none',
            animation: cfg.pulse ? 'pulse 2s ease-in-out infinite' : 'none',
          }}
        />
        <span className="text-[11px] font-bold font-mono" style={{ color: cfg.color }}>{cfg.label}</span>
      </div>

      {/* Time info */}
      {(startedAt || lastRunAt) && (
        <span className="text-[10px] font-mono" style={{ color: 'var(--text-tertiary)' }}>
          {status === 'running' ? `开始: ${formatTime(startedAt)}` : `上次: ${formatTime(lastRunAt)}`}
        </span>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-1">
        {status === 'idle' && (
          <button
            onClick={() => startMutation.mutate()}
            disabled={startMutation.isPending}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all hover:opacity-80 disabled:opacity-50"
            style={{ background: 'var(--accent-green-dim)', color: 'var(--accent-green)' }}
          >
            <Play className="w-3 h-3" /> Start
          </button>
        )}
        {status === 'running' && (
          <button
            onClick={() => stopMutation.mutate()}
            disabled={stopMutation.isPending}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all hover:opacity-80 disabled:opacity-50"
            style={{ background: 'var(--accent-red-dim)', color: 'var(--accent-red)' }}
          >
            <Square className="w-3 h-3" /> Stop
          </button>
        )}
        {status === 'paused' && (
          <>
            <button
              onClick={() => startMutation.mutate()}
              disabled={startMutation.isPending}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all hover:opacity-80 disabled:opacity-50"
              style={{ background: 'var(--accent-green-dim)', color: 'var(--accent-green)' }}
            >
              <Play className="w-3 h-3" /> Resume
            </button>
            <button
              onClick={() => stopMutation.mutate()}
              disabled={stopMutation.isPending}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all hover:opacity-80 disabled:opacity-50"
              style={{ background: 'var(--accent-red-dim)', color: 'var(--accent-red)' }}
            >
              <Square className="w-3 h-3" /> Stop
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ============ Attention Panel ============

interface AttentionItem {
  level: 'red' | 'yellow'
  icon: string
  title: string
  detail: string
}

function computeAttentionItems(state: any, discoveries: any): AttentionItem[] {
  const items: AttentionItem[] = []
  if (!state) return items

  // 1. Framework fix items — tests that failed and are being fixed
  const fixQueue = state.fixQueue || []
  if (fixQueue.length > 0) {
    items.push({
      level: 'red',
      icon: '🔧',
      title: `${fixQueue.length} 个测试待修复`,
      detail: fixQueue.map((f: any) => f.testId).join(', '),
    })
  }

  // 2. Regressions from discoveries
  if (discoveries?.discoveries) {
    const regressions = discoveries.discoveries.filter((d: any) => d.status === 'regression')
    if (regressions.length > 0) {
      items.push({
        level: 'red',
        icon: '📉',
        title: `${regressions.length} 个 Regression 问题`,
        detail: regressions.map((r: any) => r.testId).join(', '),
      })
    }
  }

  // 3. Health issues — high failure rate
  const stats = state.stats || {}
  const total = (stats.passed || 0) + (stats.failed || 0)
  if (total > 0) {
    const failRate = (stats.failed || 0) / total
    if (failRate > 0.5) {
      items.push({
        level: 'red',
        icon: '🚨',
        title: `失败率过高: ${Math.round(failRate * 100)}%`,
        detail: `${stats.failed} 失败 / ${total} 总计`,
      })
    } else if (failRate > 0.2) {
      items.push({
        level: 'yellow',
        icon: '⚠️',
        title: `失败率偏高: ${Math.round(failRate * 100)}%`,
        detail: `${stats.failed} 失败 / ${total} 总计`,
      })
    }
  }

  // 4. Stale probes — round stuck for too long
  if (state.roundStartedAt) {
    const elapsed = Date.now() - new Date(state.roundStartedAt).getTime()
    const hours = elapsed / (1000 * 60 * 60)
    if (hours > 2) {
      items.push({
        level: 'yellow',
        icon: '⏰',
        title: `当前 Round 已运行 ${Math.round(hours)}h`,
        detail: `Round ${state.round} 开始于 ${new Date(state.roundStartedAt).toLocaleTimeString('zh-CN')}`,
      })
    }
  }

  // 5. Retry queue growing
  const retryNeeded = discoveries?.discoveries?.filter((d: any) => d.status === 'retryNeeded') || []
  if (retryNeeded.length > 3) {
    items.push({
      level: 'yellow',
      icon: '🔄',
      title: `${retryNeeded.length} 个测试需要重试`,
      detail: retryNeeded.map((r: any) => r.testId).join(', '),
    })
  }

  // Sort: red before yellow
  items.sort((a, b) => (a.level === 'red' ? 0 : 1) - (b.level === 'red' ? 0 : 1))
  return items
}

function AttentionPanel({ state, discoveries }: { state: any; discoveries: any }) {
  const items = useMemo(() => computeAttentionItems(state, discoveries), [state, discoveries])

  if (items.length === 0) {
    return (
      <div
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[12px]"
        style={{ background: 'var(--accent-green-dim)', color: 'var(--accent-green)' }}
      >
        <CheckCircle className="w-4 h-4" />
        <span className="font-medium">✅ 系统正常运行中</span>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div
          key={i}
          className="flex items-start gap-2.5 px-4 py-2.5 rounded-lg text-[12px]"
          style={{
            background: item.level === 'red' ? 'var(--accent-red-dim)' : 'var(--accent-amber-dim)',
            border: `1px solid color-mix(in srgb, ${item.level === 'red' ? 'var(--accent-red)' : 'var(--accent-amber)'} 30%, transparent)`,
          }}
        >
          <span className="text-sm flex-shrink-0 mt-0.5">{item.icon}</span>
          <div className="min-w-0">
            <div className="font-bold" style={{ color: item.level === 'red' ? 'var(--accent-red)' : 'var(--accent-amber)' }}>
              {item.title}
            </div>
            <div className="text-[11px] truncate mt-0.5" style={{ color: 'var(--text-secondary)' }} title={item.detail}>
              {item.detail}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ============ Activity Stream ============

interface ActivityEvent {
  type: string
  phase?: string
  action?: string
  detail?: string
  timestamp: string
}

function ActivityStream({ phaseHistory }: { phaseHistory: any[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [events, setEvents] = useState<ActivityEvent[]>([])

  // Load recent events from API on mount (survives page refresh)
  useEffect(() => {
    fetch(`${BASE_URL}/api/tests/recent-events?limit=20`)
      .then(r => r.ok ? r.json() : [])
      .then((stored: any[]) => {
        if (stored.length > 0) {
          const mapped = stored.map((evt: any) => {
            const d = evt.data || {}
            const eventType = (evt.type || '').replace('test-', '').replace('runner-', '')
            let detail = d.testId || d.note || ''
            if (eventType === 'state-updated' && d.phase) {
              const parts: string[] = []
              if (d.currentTest) parts.push(d.currentTest)
              else if (d.testId) parts.push(d.testId)
              if (d.queues) {
                parts.push(`T:${d.queues.test} F:${d.queues.fix} V:${d.queues.verify} R:${d.queues.regression}`)
              }
              if (d.round !== undefined) parts.push(`R${d.round}`)
              detail = parts.join(' · ') || eventType
            }
            return {
              type: eventType,
              phase: d.phase,
              action: d.action || (eventType === 'state-updated' ? d.phase : undefined),
              detail,
              timestamp: evt.timestamp || new Date().toISOString(),
            }
          })
          setEvents(mapped)
        } else if (phaseHistory?.length) {
          // Fallback to phaseHistory if no stored events
          const recent = phaseHistory.slice(-20).map((entry: any) => ({
            type: 'phase-history',
            phase: entry.phase,
            action: entry.action,
            detail: entry.note || entry.testId || '',
            timestamp: entry.timestamp || new Date().toISOString(),
          }))
          setEvents(recent)
        }
      })
      .catch(() => {
        // Fallback to phaseHistory on error
        if (phaseHistory?.length) {
          const recent = phaseHistory.slice(-20).map((entry: any) => ({
            type: 'phase-history',
            phase: entry.phase,
            action: entry.action,
            detail: entry.note || entry.testId || '',
            timestamp: entry.timestamp || new Date().toISOString(),
          }))
          setEvents(recent)
        }
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Subscribe to real-time SSE events
  useEffect(() => {
    const token = localStorage.getItem('eb_token')
    if (!token) return

    const es = new EventSource(`${BASE_URL}/events`)

    const handleTestEvent = (e: MessageEvent, eventType: string) => {
      try {
        const parsed = JSON.parse(e.data)
        const d = parsed.data || parsed
        // Build a meaningful detail string from SSE data
        let detail = d.testId || d.note || ''
        if (eventType === 'state-updated' && d.phase) {
          const parts: string[] = []
          if (d.currentTest) parts.push(d.currentTest)
          else if (d.testId) parts.push(d.testId)
          if (d.queues) {
            parts.push(`T:${d.queues.test} F:${d.queues.fix} V:${d.queues.verify} R:${d.queues.regression}`)
          }
          if (d.round !== undefined) parts.push(`R${d.round}`)
          detail = parts.join(' · ') || eventType
        }
        const newEvent: ActivityEvent = {
          type: eventType,
          phase: d.phase,
          action: d.action || (eventType === 'state-updated' ? d.phase : undefined),
          detail,
          timestamp: d.timestamp || new Date().toISOString(),
        }
        setEvents(prev => {
          const next = [...prev, newEvent]
          return next.slice(-20) // keep last 20
        })
      } catch { /* ignore parse errors */ }
    }

    es.addEventListener('test-state-updated', (e) => handleTestEvent(e, 'state-updated'))
    es.addEventListener('test-discoveries-updated', (e) => handleTestEvent(e, 'discoveries-updated'))
    es.addEventListener('test-result-updated', (e) => handleTestEvent(e, 'result-updated'))
    es.addEventListener('test-evolution-updated', (e) => handleTestEvent(e, 'evolution-updated'))
    es.addEventListener('runner-status-changed', (e) => handleTestEvent(e, 'runner-changed'))

    return () => es.close()
  }, [])

  // Auto-scroll to bottom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [events])

  function phaseBadgeColor(phase?: string): string {
    if (!phase) return 'var(--text-tertiary)'
    const colors: Record<string, string> = {
      SCAN: 'var(--accent-blue)',
      GENERATE: 'var(--accent-purple)',
      TEST: 'var(--accent-amber)',
      FIX: 'var(--accent-red)',
      VERIFY: 'var(--accent-green)',
    }
    return colors[phase.toUpperCase()] || 'var(--text-secondary)'
  }

  function formatTime(ts: string): string {
    try {
      return new Date(ts).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    } catch { return '' }
  }

  return (
    <Card>
      <CardHeader
        title="实时动态"
        subtitle={`${events.length} 条事件`}
        icon={<Zap className="w-4 h-4" style={{ color: 'var(--accent-amber)' }} />}
      />
      <div ref={containerRef} className="max-h-[240px] overflow-y-auto space-y-0">
        {events.length === 0 ? (
          <p className="text-center py-4 text-[12px]" style={{ color: 'var(--text-tertiary)' }}>暂无事件</p>
        ) : (
          events.map((evt, i) => (
            <div
              key={i}
              className="flex items-center gap-2 py-1.5 px-2"
              style={{ borderBottom: '1px solid var(--border-subtle)' }}
            >
              <span className="text-[10px] font-mono shrink-0 w-[56px]" style={{ color: 'var(--text-tertiary)' }}>
                {formatTime(evt.timestamp)}
              </span>
              {evt.phase && (
                <span
                  className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded shrink-0"
                  style={{
                    color: phaseBadgeColor(evt.phase),
                    background: `color-mix(in srgb, ${phaseBadgeColor(evt.phase)} 15%, transparent)`,
                  }}
                >
                  {evt.phase.toUpperCase().slice(0, 4)}
                </span>
              )}
              <span className="text-[10px] font-mono shrink-0 w-[70px]" style={{ color: 'var(--text-secondary)' }}>
                {evt.action || evt.type}
              </span>
              <span className="text-[11px] truncate" style={{ color: 'var(--text-secondary)' }} title={evt.detail}>
                {evt.detail || ''}
              </span>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}

// ============ Evolution Timeline ============

function EvolutionTimeline() {
  const { data: evolution } = useTestEvolution()
  const [expanded, setExpanded] = useState(false)

  if (!evolution || evolution.length === 0) return null

  const displayItems = expanded ? evolution : evolution.slice(-5)

  return (
    <Card>
      <CardHeader
        title="框架演进"
        subtitle={`${evolution.length} 个里程碑`}
        icon={<Milestone className="w-4 h-4" style={{ color: 'var(--accent-purple)' }} />}
      />
      <div className="relative pl-6 space-y-3 py-2">
        {/* Timeline line */}
        <div
          className="absolute left-[11px] top-2 bottom-2 w-[2px]"
          style={{ background: 'var(--border-subtle)' }}
        />

        {displayItems.map((entry: any, i: number) => (
          <div key={i} className="relative flex items-start gap-3">
            {/* Timeline dot */}
            <div
              className="absolute left-[-17px] w-3 h-3 rounded-full border-2 flex-shrink-0 mt-1"
              style={{
                borderColor: entry.category === 'fix' ? 'var(--accent-red)' :
                  entry.category === 'feature' ? 'var(--accent-green)' :
                  entry.category === 'refactor' ? 'var(--accent-blue)' : 'var(--accent-purple)',
                background: 'var(--bg-primary)',
              }}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-bold" style={{ color: 'var(--text-primary)' }}>
                  {entry.title}
                </span>
                {entry.round && (
                  <Badge variant="secondary" size="xs">R{entry.round}</Badge>
                )}
                {entry.category && (
                  <Badge
                    variant={entry.category === 'fix' ? 'danger' : entry.category === 'feature' ? 'success' : 'primary'}
                    size="xs"
                  >
                    {entry.category}
                  </Badge>
                )}
              </div>
              {entry.impact && (
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  {typeof entry.impact === 'string' ? entry.impact : `${entry.impact.files_changed || 0} files changed, ${entry.impact.components_added || 0} added, ${entry.impact.components_modified || 0} modified`}
                </p>
              )}
              {entry.timestamp && (
                <span className="text-[10px] font-mono" style={{ color: 'var(--text-tertiary)' }}>
                  {new Date(entry.timestamp).toLocaleDateString('zh-CN')}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {evolution.length > 5 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full text-center py-2 text-[11px] font-bold transition-all hover:opacity-80"
          style={{ color: 'var(--accent-blue)', borderTop: '1px solid var(--border-subtle)' }}
        >
          {expanded ? '收起' : `展开全部 (${evolution.length} 项)`}
        </button>
      )}
    </Card>
  )
}

// ============ Phase Pipeline ============

const PHASES = ['SCAN', 'GENERATE', 'TEST', 'FIX', 'VERIFY'] as const

function phaseIcon(status: string): string {
  if (status === 'done') return '\u2705'
  if (status === 'running' || status === 'in-progress') return '\uD83C\uDFC3'
  return '\u23F3'
}

function phaseColor(status: string): string {
  if (status === 'done') return 'var(--accent-green)'
  if (status === 'running' || status === 'in-progress') return 'var(--accent-blue)'
  return 'var(--text-tertiary)'
}

function PhasePipeline({ roundJourney, currentTest, phase, registry }: {
  roundJourney: Record<string, { status: string; summary: string }>
  currentTest: string
  phase: string
  registry: Record<string, any>
}) {
  const currentLabel = currentTest
    ? (registry[currentTest]?.name || currentTest)
    : phase ? `Phase: ${phase}` : undefined
  return (
    <Card>
      <CardHeader
        title="Phase Pipeline"
        subtitle={currentLabel ? `Currently: ${currentLabel}` : undefined}
        icon={<Activity className="w-4 h-4" style={{ color: 'var(--accent-blue)' }} />}
      />
      <div className="flex items-center gap-0 overflow-x-auto pb-2">
        {PHASES.map((p, i) => {
          const journey = roundJourney[p]
          const status = journey?.status || 'pending'
          // If this is the current active phase from state.phase, mark it running
          const effectiveStatus = (p === phase && status === 'pending') ? 'running' : status
          const color = phaseColor(effectiveStatus)
          return (
            <div key={p} className="flex items-center flex-shrink-0">
              <div className="flex flex-col items-center min-w-[80px]">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm mb-1 transition-all"
                  style={{
                    background: effectiveStatus === 'done' ? 'var(--accent-green-dim)' :
                      effectiveStatus === 'running' ? 'var(--accent-blue-dim)' : 'var(--bg-inset)',
                    border: `2px solid ${color}`,
                  }}
                >
                  {phaseIcon(effectiveStatus)}
                </div>
                <span
                  className="text-[11px] font-bold font-mono uppercase"
                  style={{ color }}
                >
                  {p}
                </span>
                {journey?.summary && (
                  <span
                    className="text-[10px] max-w-[100px] text-center truncate mt-0.5"
                    style={{ color: 'var(--text-tertiary)' }}
                    title={journey.summary}
                  >
                    {journey.summary.length > 30 ? journey.summary.slice(0, 30) + '...' : journey.summary}
                  </span>
                )}
              </div>
              {i < PHASES.length - 1 && (
                <div
                  className="w-8 h-[2px] mt-[-16px] flex-shrink-0"
                  style={{
                    background: effectiveStatus === 'done' ? 'var(--accent-green)' : 'var(--border-subtle)',
                  }}
                />
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}

// ============ Stats Cards ============

function TestStatsCards({ stats }: { stats: { passed: number; failed: number; fixed: number; skipped: number } }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatCard label="Passed" value={stats.passed} color="green" icon={<CheckCircle className="w-5 h-5" />} />
      <StatCard label="Failed" value={stats.failed} color="red" icon={<XCircle className="w-5 h-5" />} />
      <StatCard label="Fixed" value={stats.fixed} color="yellow" icon={<Wrench className="w-5 h-5" />} />
      <StatCard label="Skipped" value={stats.skipped} color="purple" icon={<SkipForward className="w-5 h-5" />} />
    </div>
  )
}

// ============ Round Journey ============

function RoundJourney({ roundJourney, phase }: {
  roundJourney: Record<string, { status: string; summary: string }>
  phase: string
}) {
  return (
    <Card>
      <CardHeader
        title="Round Journey"
        subtitle="Current round phase progression"
        icon={<Clock className="w-4 h-4" style={{ color: 'var(--accent-blue)' }} />}
      />
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <th className="text-left py-2 px-3 font-semibold" style={{ color: 'var(--text-tertiary)' }}>Phase</th>
              <th className="text-left py-2 px-3 font-semibold" style={{ color: 'var(--text-tertiary)' }}>Status</th>
              <th className="text-left py-2 px-3 font-semibold" style={{ color: 'var(--text-tertiary)' }}>Summary</th>
            </tr>
          </thead>
          <tbody>
            {PHASES.map(p => {
              const journey = roundJourney[p]
              const status = journey?.status || 'pending'
              const effectiveStatus = (p === phase && status === 'pending') ? 'running' : status
              return (
                <tr key={p} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td className="py-2 px-3 font-mono font-bold" style={{ color: 'var(--text-primary)' }}>{p}</td>
                  <td className="py-2 px-3">
                    <Badge variant={effectiveStatus === 'done' ? 'success' : effectiveStatus === 'running' ? 'primary' : 'default'} size="xs">
                      {effectiveStatus}
                    </Badge>
                  </td>
                  <td className="py-2 px-3" style={{ color: 'var(--text-secondary)' }}>{journey?.summary || '-'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

// ============ Queue Tables ============

type QueueTab = 'test' | 'fix' | 'verify' | 'regression'

function QueueTable({ testQueue, fixQueue, verifyQueue, regressionQueue, registry }: {
  testQueue: any[]
  fixQueue: any[]
  verifyQueue: any[]
  regressionQueue: any[]
  registry: Record<string, any>
}) {
  const [activeTab, setActiveTab] = useState<QueueTab>('test')
  const queues: Record<QueueTab, any[]> = {
    test: testQueue || [],
    fix: fixQueue || [],
    verify: verifyQueue || [],
    regression: regressionQueue || [],
  }
  const items = queues[activeTab]
  const tabs: { key: QueueTab; label: string; count: number }[] = [
    { key: 'test', label: 'Test', count: (testQueue || []).length },
    { key: 'fix', label: 'Fix', count: (fixQueue || []).length },
    { key: 'verify', label: 'Verify', count: (verifyQueue || []).length },
    { key: 'regression', label: 'Regression', count: (regressionQueue || []).length },
  ]

  return (
    <Card>
      <CardHeader
        title="Queues"
        subtitle={`${items.length} items in ${activeTab} queue`}
        icon={<FlaskConical className="w-4 h-4" style={{ color: 'var(--accent-purple)' }} />}
      />
      <div className="flex gap-1 mb-3">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className="px-3 py-1.5 rounded-md text-[11px] font-bold font-mono transition-all"
            style={{
              background: activeTab === t.key ? 'var(--accent-blue-dim)' : 'transparent',
              color: activeTab === t.key ? 'var(--accent-blue)' : 'var(--text-tertiary)',
            }}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>
      {items.length === 0 ? (
        <p className="text-center py-4 text-[12px]" style={{ color: 'var(--text-tertiary)' }}>Queue empty</p>
      ) : (
        <div className="overflow-x-auto max-h-[200px] overflow-y-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <th className="text-left py-1.5 px-3 font-semibold" style={{ color: 'var(--text-tertiary)' }}>Test ID</th>
                <th className="text-left py-1.5 px-3 font-semibold" style={{ color: 'var(--text-tertiary)' }}>Name</th>
                <th className="text-left py-1.5 px-3 font-semibold" style={{ color: 'var(--text-tertiary)' }}>Category</th>
                <th className="text-left py-1.5 px-3 font-semibold" style={{ color: 'var(--text-tertiary)' }}>Source</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: any, i: number) => {
                const entry = registry[item.testId]
                return (
                  <tr key={item.testId || i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td className="py-1.5 px-3 font-mono" style={{ color: 'var(--text-primary)' }}>{item.testId}</td>
                    <td
                      className="py-1.5 px-3 max-w-[260px] truncate"
                      style={{ color: 'var(--text-secondary)' }}
                      title={entry?.description || entry?.name || ''}
                    >
                      {entry?.name || '-'}
                    </td>
                    <td className="py-1.5 px-3">
                      <Badge variant="secondary" size="xs">{item.category || '-'}</Badge>
                    </td>
                    <td className="py-1.5 px-3" style={{ color: 'var(--text-secondary)' }}>{item.source || '-'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}

// ============ Phase History Timeline ============

function PhaseTimeline({ phaseHistory, registry }: { phaseHistory: any[]; registry: Record<string, any> }) {
  const [filter, setFilter] = useState<string>('all')
  const reversed = useMemo(() => [...(phaseHistory || [])].reverse(), [phaseHistory])
  const filtered = filter === 'all' ? reversed : reversed.filter((e: any) => e.phase === filter)
  const phases = useMemo(() => {
    const set = new Set<string>((phaseHistory || []).map((e: any) => e.phase as string))
    return ['all', ...Array.from(set)]
  }, [phaseHistory])

  function actionColor(action: string): string {
    if (action.includes('pass')) return 'var(--accent-green)'
    if (action.includes('fail')) return 'var(--accent-red)'
    if (action.includes('fix') || action.includes('generate')) return 'var(--accent-amber)'
    if (action.includes('scan')) return 'var(--accent-blue)'
    if (action.includes('verify')) return 'var(--accent-purple)'
    return 'var(--text-secondary)'
  }

  function formatTime(ts: string): string {
    try {
      const d = new Date(ts)
      return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    } catch { return ts }
  }

  function summarize(entry: any): string {
    if (entry.testId) return registry[entry.testId]?.name || entry.testId
    if (entry.note) return entry.note.length > 60 ? entry.note.slice(0, 60) + '...' : entry.note
    if (entry.count) return `${entry.count} tests`
    if (entry.gaps !== undefined) return `${entry.gaps} gaps, ${entry.regression_gaps || 0} regression`
    if (entry.tests_added !== undefined) return `${entry.tests_added} tests added`
    if (entry.issue_gaps !== undefined) return `${entry.issue_gaps} issue gaps, ${entry.regression_gaps || 0} regression`
    return entry.action || ''
  }

  return (
    <Card>
      <CardHeader
        title="Phase History"
        subtitle={`${(phaseHistory || []).length} events`}
        icon={<Clock className="w-4 h-4" style={{ color: 'var(--accent-amber)' }} />}
      />
      <div className="flex gap-1 mb-3 overflow-x-auto">
        {phases.map(p => (
          <button
            key={p}
            onClick={() => setFilter(p)}
            className="px-2 py-1 rounded text-[10px] font-bold font-mono uppercase whitespace-nowrap"
            style={{
              background: filter === p ? 'var(--accent-blue-dim)' : 'transparent',
              color: filter === p ? 'var(--accent-blue)' : 'var(--text-tertiary)',
            }}
          >
            {p}
          </button>
        ))}
      </div>
      <div className="max-h-[300px] overflow-y-auto space-y-0">
        {filtered.slice(0, 50).map((entry: any, i: number) => (
          <div
            key={i}
            className="flex items-start gap-3 py-1.5 px-2"
            style={{ borderBottom: '1px solid var(--border-subtle)' }}
          >
            <span className="text-[10px] font-mono shrink-0 mt-0.5 w-[42px]" style={{ color: 'var(--text-tertiary)' }}>
              {formatTime(entry.timestamp)}
            </span>
            <span
              className="text-[10px] font-bold font-mono uppercase shrink-0 w-[42px] mt-0.5"
              style={{ color: actionColor(entry.action || '') }}
            >
              {(entry.phase || '').slice(0, 4)}
            </span>
            <span className="text-[10px] font-mono shrink-0 w-[80px] mt-0.5" style={{ color: actionColor(entry.action || '') }}>
              {entry.action || ''}
            </span>
            <span className="text-[11px] truncate" style={{ color: 'var(--text-secondary)' }} title={summarize(entry)}>
              {summarize(entry)}
            </span>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center py-4 text-[12px]" style={{ color: 'var(--text-tertiary)' }}>No events</p>
        )}
      </div>
    </Card>
  )
}

// ============ Discovery Table ============

function DiscoveryTable({ discoveries, registry }: { discoveries: any; registry: Record<string, any> }) {
  if (!discoveries) return null
  const { summary, discoveries: items } = discoveries
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const filtered = statusFilter === 'all' ? items : items.filter((d: any) => d.status === statusFilter)
  const statuses = useMemo(() => {
    const set = new Set<string>((items || []).map((d: any) => d.status as string))
    return ['all', ...Array.from(set)]
  }, [items])

  function statusBadgeVariant(status: string): 'success' | 'danger' | 'warning' | 'primary' | 'purple' | 'default' {
    if (status === 'verified') return 'success'
    if (status === 'regression') return 'danger'
    if (status === 'fixedUnverified' || status === 'fixed') return 'warning'
    if (status === 'retryNeeded') return 'primary'
    if (status === 'diagnosed') return 'purple'
    return 'default'
  }

  return (
    <Card>
      <CardHeader
        title="Discoveries"
        subtitle={`${summary?.total || 0} total: ${summary?.verified || 0} verified, ${summary?.fixedUnverified || 0} fixed, ${summary?.regression || 0} regression`}
        icon={<Bug className="w-4 h-4" style={{ color: 'var(--accent-red)' }} />}
      />
      <div className="flex gap-1 mb-3 overflow-x-auto">
        {statuses.map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className="px-2 py-1 rounded text-[10px] font-bold font-mono whitespace-nowrap"
            style={{
              background: statusFilter === s ? 'var(--accent-blue-dim)' : 'transparent',
              color: statusFilter === s ? 'var(--accent-blue)' : 'var(--text-tertiary)',
            }}
          >
            {s} {s !== 'all' ? `(${(items || []).filter((d: any) => d.status === s).length})` : `(${(items || []).length})`}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto max-h-[350px] overflow-y-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <th className="text-left py-1.5 px-3 font-semibold" style={{ color: 'var(--text-tertiary)' }}>Test ID</th>
              <th className="text-left py-1.5 px-3 font-semibold" style={{ color: 'var(--text-tertiary)' }}>Name</th>
              <th className="text-left py-1.5 px-3 font-semibold" style={{ color: 'var(--text-tertiary)' }}>Found</th>
              <th className="text-left py-1.5 px-3 font-semibold" style={{ color: 'var(--text-tertiary)' }}>Status</th>
              <th className="text-left py-1.5 px-3 font-semibold" style={{ color: 'var(--text-tertiary)' }}>Root Cause</th>
              <th className="text-left py-1.5 px-3 font-semibold" style={{ color: 'var(--text-tertiary)' }}>Assertion</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d: any) => (
              <tr key={d.testId} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td className="py-1.5 px-3 font-mono" style={{ color: 'var(--text-primary)' }}>{d.testId}</td>
                <td
                  className="py-1.5 px-3 max-w-[220px] truncate"
                  style={{ color: 'var(--text-secondary)' }}
                  title={registry[d.testId]?.description || registry[d.testId]?.name || ''}
                >
                  {registry[d.testId]?.name || '-'}
                </td>
                <td className="py-1.5 px-3 font-mono" style={{ color: 'var(--text-secondary)' }}>R{d.foundRound}</td>
                <td className="py-1.5 px-3">
                  <Badge variant={statusBadgeVariant(d.status)} size="xs">{d.status}</Badge>
                </td>
                <td className="py-1.5 px-3 font-mono text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                  {d.rootCause ? d.rootCause.replace(/^\*+\s*/, '') : '-'}
                </td>
                <td className="py-1.5 px-3 max-w-[200px] truncate" style={{ color: 'var(--text-tertiary)' }} title={d.firstFailedAssertion}>
                  {d.firstFailedAssertion || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center py-4 text-[12px]" style={{ color: 'var(--text-tertiary)' }}>No discoveries matching filter</p>
        )}
      </div>
    </Card>
  )
}

// ============ Trend Chart (SVG) ============

function TrendChart({ trends }: { trends: any[] }) {
  if (!trends || trends.length < 2) return null

  const WIDTH = 600
  const HEIGHT = 160
  const PADDING = { top: 10, right: 10, bottom: 25, left: 40 }
  const chartW = WIDTH - PADDING.left - PADDING.right
  const chartH = HEIGHT - PADDING.top - PADDING.bottom

  const maxVal = Math.max(...trends.map(t => Math.max(t.stats?.passed || 0, t.stats?.failed || 0, t.stats?.fixed || 0)), 1)
  const xStep = chartW / Math.max(trends.length - 1, 1)

  function toY(val: number): number {
    return PADDING.top + chartH - (val / maxVal) * chartH
  }

  function buildPath(accessor: (t: any) => number): string {
    return trends.map((t, i) => {
      const x = PADDING.left + i * xStep
      const y = toY(accessor(t))
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    }).join(' ')
  }

  function buildArea(accessor: (t: any) => number): string {
    const line = trends.map((t, i) => {
      const x = PADDING.left + i * xStep
      const y = toY(accessor(t))
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    }).join(' ')
    const lastX = PADDING.left + (trends.length - 1) * xStep
    const baseY = PADDING.top + chartH
    return `${line} L${lastX.toFixed(1)},${baseY} L${PADDING.left},${baseY} Z`
  }

  const passedPath = buildPath(t => t.stats?.passed || 0)
  const failedPath = buildPath(t => t.stats?.failed || 0)
  const fixedPath = buildPath(t => t.stats?.fixed || 0)

  const passedArea = buildArea(t => t.stats?.passed || 0)
  const failedArea = buildArea(t => t.stats?.failed || 0)

  // Y-axis labels
  const yLabels = [0, Math.round(maxVal / 2), maxVal]

  return (
    <Card>
      <CardHeader
        title="Trends"
        subtitle={`Pass/Fail/Fixed across ${trends.length} rounds`}
        icon={<Activity className="w-4 h-4" style={{ color: 'var(--accent-green)' }} />}
      />
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" style={{ maxHeight: '200px' }}>
        {/* Grid lines */}
        {yLabels.map(v => (
          <g key={v}>
            <line
              x1={PADDING.left} y1={toY(v)}
              x2={WIDTH - PADDING.right} y2={toY(v)}
              stroke="var(--border-subtle)" strokeDasharray="3,3" strokeWidth="0.5"
            />
            <text x={PADDING.left - 5} y={toY(v) + 3} textAnchor="end"
              fontSize="9" fill="var(--text-tertiary)" fontFamily="JetBrains Mono, monospace">
              {v}
            </text>
          </g>
        ))}

        {/* X-axis round labels */}
        {trends.map((t, i) => {
          // Only show every Nth label to avoid clutter
          const show = trends.length <= 15 || i % Math.ceil(trends.length / 10) === 0 || i === trends.length - 1
          if (!show) return null
          const x = PADDING.left + i * xStep
          return (
            <text key={i} x={x} y={HEIGHT - 5} textAnchor="middle"
              fontSize="9" fill="var(--text-tertiary)" fontFamily="JetBrains Mono, monospace">
              R{t.round}
            </text>
          )
        })}

        {/* Area fills */}
        <path d={passedArea} fill="var(--accent-green)" opacity="0.1" />
        <path d={failedArea} fill="var(--accent-red)" opacity="0.1" />

        {/* Lines */}
        <path d={passedPath} fill="none" stroke="var(--accent-green)" strokeWidth="2" />
        <path d={failedPath} fill="none" stroke="var(--accent-red)" strokeWidth="1.5" />
        <path d={fixedPath} fill="none" stroke="var(--accent-amber)" strokeWidth="1.5" strokeDasharray="4,2" />

        {/* Dots on last point */}
        {trends.length > 0 && (() => {
          const last = trends[trends.length - 1]
          const x = PADDING.left + (trends.length - 1) * xStep
          return (
            <>
              <circle cx={x} cy={toY(last.stats?.passed || 0)} r="3" fill="var(--accent-green)" />
              <circle cx={x} cy={toY(last.stats?.failed || 0)} r="3" fill="var(--accent-red)" />
              <circle cx={x} cy={toY(last.stats?.fixed || 0)} r="3" fill="var(--accent-amber)" />
            </>
          )
        })()}
      </svg>

      {/* Legend */}
      <div className="flex gap-4 mt-2 justify-center">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-[2px]" style={{ background: 'var(--accent-green)' }} />
          <span className="text-[10px] font-mono" style={{ color: 'var(--text-secondary)' }}>Passed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-[2px]" style={{ background: 'var(--accent-red)' }} />
          <span className="text-[10px] font-mono" style={{ color: 'var(--text-secondary)' }}>Failed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-[2px] border-b border-dashed" style={{ borderColor: 'var(--accent-amber)' }} />
          <span className="text-[10px] font-mono" style={{ color: 'var(--text-secondary)' }}>Fixed</span>
        </div>
      </div>
    </Card>
  )
}

// ============ Main Page ============

export default function TestLab() {
  const { data: state, isLoading: stateLoading } = useTestState()
  const { data: discoveries } = useTestDiscoveries()
  const { data: trends } = useTestTrends()
  const { data: registry } = useTestRegistry()
  const reg = registry || {}

  if (stateLoading) return <Loading text="Loading test state..." />

  if (!state) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <span className="text-lg">🧪</span> Test Lab
          </h1>
          <RunnerControl />
        </div>
        <EmptyState
          icon="🧪"
          title="暂无测试数据"
          description="点击 Start 按钮或运行 /test-supervisor 开始测试"
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Page Header with Runner Controls */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <span className="text-lg">🧪</span> Test Lab
        </h1>
        <div className="flex items-center gap-3">
          <RunnerControl />
          <div className="flex items-center gap-2 ml-2">
            <Badge variant="primary" size="md">R{state.round}/{state.maxRounds}</Badge>
            <Badge variant={state.phase === 'TEST' ? 'warning' : state.phase === 'VERIFY' ? 'purple' : 'default'} size="md">
              {state.phase}
            </Badge>
          </div>
        </div>
      </div>

      {/* Attention Panel — full width below title */}
      <AttentionPanel state={state} discoveries={discoveries} />

      {/* Phase Pipeline */}
      <PhasePipeline
        roundJourney={state.roundJourney || {}}
        currentTest={state.currentTest || ''}
        phase={state.phase || ''}
        registry={reg}
      />

      {/* Stats Cards */}
      <TestStatsCards stats={state.stats || { passed: 0, failed: 0, fixed: 0, skipped: 0 }} />

      {/* Activity Stream + Round Journey side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ActivityStream phaseHistory={state.phaseHistory || []} />
        <RoundJourney roundJourney={state.roundJourney || {}} phase={state.phase || ''} />
      </div>

      {/* Queues */}
      <QueueTable
        testQueue={state.testQueue || []}
        fixQueue={state.fixQueue || []}
        verifyQueue={state.verifyQueue || []}
        regressionQueue={state.regressionQueue || []}
        registry={reg}
      />

      {/* Phase History */}
      <PhaseTimeline phaseHistory={state.phaseHistory || []} registry={reg} />

      {/* Discoveries */}
      <DiscoveryTable discoveries={discoveries} registry={reg} />

      {/* Trend Chart */}
      <TrendChart trends={trends || []} />

      {/* Evolution Timeline — below Trend chart */}
      <EvolutionTimeline />
    </div>
  )
}

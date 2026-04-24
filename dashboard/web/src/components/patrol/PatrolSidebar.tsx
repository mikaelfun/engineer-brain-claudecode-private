/**
 * PatrolSidebar — 3 parent stages with sub-steps
 *
 * Stages: Initialize → Process → Finalize
 * Each has expandable sub-steps derived from patrol store fields.
 */
import { useState, useEffect } from 'react'
import { usePatrolStore, type PatrolPhase } from '../../stores/patrolStore'
import { usePatrolAgentStore, type PatrolAgent } from '../../stores/patrolAgentStore'
import { Card } from '../common/Card'

// ─── Types ───

type StageStatus = 'pending' | 'active' | 'completed'

interface SubStep {
  id: string
  label: string
  status: StageStatus
  detail?: string
}

// ─── Helpers ───

function formatDuration(ms: number): string {
  if (ms < 1000) return '<1s'
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  if (m > 0) return `${m}m ${s % 60}s`
  return `${s}s`
}

function LiveTimer({ startedAt }: { startedAt: string }) {
  const [elapsed, setElapsed] = useState(() => Date.now() - new Date(startedAt).getTime())
  useEffect(() => {
    const start = new Date(startedAt).getTime()
    setElapsed(Date.now() - start)
    const timer = setInterval(() => setElapsed(Date.now() - start), 1000)
    return () => clearInterval(timer)
  }, [startedAt])
  return (
    <span className="font-mono text-[11px]" style={{ color: 'var(--accent-blue)' }}>
      {formatDuration(elapsed)}
    </span>
  )
}

function friendlyWarmupStatus(raw?: string): string {
  if (!raw) return 'Checking tokens\u2026'
  const s = raw.toLowerCase()
  if (s.includes('alive') || s.includes('running') || s.includes('ready')) return 'Token daemon ready'
  if (s.includes('valid') || s.includes('fresh')) return 'All tokens valid'
  if (s.includes('expired') || s.includes('refresh')) return 'Refreshing tokens\u2026'
  if (s.includes('offline') || s.includes('not running') || s.includes('failed')) return 'Daemon offline \u2014 using fallback'
  if (s.includes('warmup') || s.includes('warming up') || s.includes('starting')) return 'Warming up tokens\u2026'
  return raw.length > 30 ? raw.slice(0, 30) + '\u2026' : raw
}

// ─── Derive parent stage status ───

function deriveStageStatus(phase: PatrolPhase, stagePhase: PatrolPhase): StageStatus {
  const ORDER: PatrolPhase[] = ['initializing', 'processing', 'finalizing']
  const currentIdx = ORDER.indexOf(phase)
  const stageIdx = ORDER.indexOf(stagePhase)

  if (phase === 'completed') return 'completed'
  if (phase === 'failed') return stageIdx <= currentIdx ? 'completed' : 'pending'
  if (currentIdx < 0) return 'pending' // idle
  if (stageIdx < currentIdx) return 'completed'
  if (stageIdx === currentIdx) return 'active'
  return 'pending'
}

// ─── Derive Initialize sub-steps ───
// Uses existing store fields — the backend's old 6-phase data maps perfectly.
// "starting" → SDK Session, "discovering" → D365 Query, etc.
// Since backend still writes granular phases (starting, discovering, filtering, warming-up)
// even though the parent phase maps to "initializing", we can use currentAction and
// the presence of data fields to determine which sub-step is active/complete.

function deriveInitSubSteps(store: {
  phase: PatrolPhase
  currentAction?: string
  totalFound?: number
  changedCases: number
  skippedCount?: number
  warmupStatus?: string
  archivedCount?: number
  transferredCount?: number
  phaseTimings?: Record<string, number>
}): SubStep[] {
  const parentDone = store.phase !== 'initializing' && store.phase !== 'idle'
  const isInit = store.phase === 'initializing'
  const t = store.phaseTimings || {}

  // Data availability heuristics
  const hasD365 = store.totalFound !== undefined
  const hasFilter = store.changedCases > 0 || store.skippedCount !== undefined || store.archivedCount !== undefined
  const hasWarmup = store.warmupStatus !== undefined

  function subStatus(subDone: boolean, subActive: boolean): StageStatus {
    if (parentDone) return 'completed'
    if (subDone) return 'completed'
    if (subActive) return 'active'
    return 'pending'
  }

  // D365 Query — covers starting + discovering phases
  const d365Done = hasFilter || hasWarmup || (hasD365 && !isInit)
  const d365Active = isInit && hasD365 && !hasFilter && !hasWarmup
  const d365Ms = (t['starting'] || 0) + (t['discovering'] || 0)

  // Filter & Archive
  const filterDone = hasWarmup || (hasFilter && !isInit)
  const filterActive = isInit && hasFilter && !hasWarmup
  const filterMs = t['filtering'] || 0

  // Token Warmup
  const warmupDone = parentDone
  const warmupActive = isInit && hasWarmup && !parentDone
  const warmupMs = t['warming-up'] || 0

  const steps: SubStep[] = [
    {
      id: 'd365-query',
      label: 'D365 Query',
      status: subStatus(!!d365Done, d365Active),
      detail: store.totalFound !== undefined
        ? `${store.totalFound} found${d365Ms ? ' · ' + formatDuration(d365Ms) : ''}`
        : (d365Active ? 'Querying\u2026' : undefined),
    },
    {
      id: 'filter-archive',
      label: 'Filter & Archive',
      status: subStatus(!!filterDone, filterActive),
      detail: hasFilter
        ? buildFilterDetail(store) + (filterMs ? ' · ' + formatDuration(filterMs) : '')
        : (filterActive ? 'Checking\u2026' : undefined),
    },
    {
      id: 'token-warmup',
      label: 'Token Warmup',
      status: subStatus(!!warmupDone, warmupActive),
      detail: hasWarmup
        ? friendlyWarmupStatus(store.warmupStatus) + (warmupMs ? ' · ' + formatDuration(warmupMs) : '')
        : undefined,
    },
  ]
  return steps
}

function buildFilterDetail(store: {
  changedCases: number
  skippedCount?: number
  archivedCount?: number
  transferredCount?: number
}): string {
  const parts: string[] = [`${store.changedCases} proc`]
  if (store.skippedCount !== undefined) parts.push(`${store.skippedCount} skip`)
  if (store.archivedCount !== undefined) parts.push(`${store.archivedCount} arch`)
  if (store.transferredCount !== undefined) parts.push(`${store.transferredCount} xfer`)
  return parts.join(' \u00b7 ')
}

// ─── Check Icon ───

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── Parent Stage Component ───

function ParentStage({
  label,
  status,
  durationMs,
  liveStartedAt,
  rightLabel,
  children,
}: {
  label: string
  status: StageStatus
  durationMs?: number
  liveStartedAt?: string
  rightLabel?: string
  children: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: 6 }}>
      {/* Parent header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0' }}>
        <div
          style={{
            width: 30, height: 30, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            ...(status === 'completed' ? { background: 'var(--accent-green)', color: 'white' } :
              status === 'active' ? { border: '2.5px solid var(--accent-blue)', background: 'var(--accent-blue-dim)' } :
              { border: '2px solid var(--border-default)', opacity: 0.4 }),
          }}
        >
          {status === 'completed' && <CheckIcon />}
          {status === 'active' && (
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-blue)', animation: 'sidebar-pulse 2s ease-in-out infinite' }} />
          )}
        </div>

        <div style={{
          fontSize: 15, fontWeight: 800, flex: 1, letterSpacing: '0.3px',
          color: status === 'completed' ? 'var(--accent-green)' : status === 'active' ? 'var(--accent-blue)' : 'var(--text-tertiary)',
          opacity: status === 'pending' ? 0.4 : 1,
        }}>
          {label}
        </div>

        {/* Right: duration or counter */}
        {rightLabel ? (
          <span className="font-mono text-[12px] font-bold" style={{ color: status === 'active' ? 'var(--accent-blue)' : 'var(--text-tertiary)' }}>
            {rightLabel}
          </span>
        ) : liveStartedAt ? (
          <LiveTimer startedAt={liveStartedAt} />
        ) : durationMs !== undefined ? (
          <span className="font-mono text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
            {formatDuration(durationMs)}
          </span>
        ) : null}
      </div>

      {/* Sub-steps */}
      <div style={{
        marginLeft: 15,
        paddingLeft: 18,
        paddingBottom: 6,
        borderLeft: `2px solid ${
          status === 'completed' ? 'rgba(22,163,74,0.15)' :
          status === 'active' ? 'rgba(106,95,193,0.15)' :
          'var(--border-subtle)'
        }`,
        opacity: status === 'pending' ? 0.35 : 1,
      }}>
        {children}
      </div>
    </div>
  )
}

// ─── Sub-step row ───

function SubStepRow({ step }: { step: SubStep }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0' }}>
      <div style={{
        width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
        ...(step.status === 'completed' ? { background: 'var(--accent-green)' } :
          step.status === 'active' ? { background: 'var(--accent-blue)', animation: 'sidebar-pulse 2s ease-in-out infinite' } :
          { background: 'var(--border-default)', opacity: 0.35 }),
      }} />
      <span style={{
        fontSize: 12, fontWeight: 600,
        color: step.status === 'active' ? 'var(--accent-blue)' : 'var(--text-primary)',
        opacity: step.status === 'pending' ? 0.45 : step.status === 'completed' ? 0.7 : 1,
      }}>
        {step.label}
      </span>
      {step.detail && (
        <span style={{ fontSize: 10, color: 'var(--text-tertiary)', marginLeft: 'auto', whiteSpace: 'nowrap' }}>
          {step.detail}
        </span>
      )}
    </div>
  )
}

// ─── Agent Row (Process sub-step) ───

function AgentRow({ agent }: { agent: PatrolAgent }) {
  const isRunning = agent.status === 'running'
  const isDone = agent.status === 'completed'

  // Derive agent type label from description
  const agentType = agent.description
    ? agent.description.replace(/^Casework patrol\b/i, 'casework').replace(/^Casework phase2\b/i, 'phase2').split(' ')[0]
    : undefined

  return (
    <div style={{
      padding: '10px 12px', margin: '4px 0', borderRadius: 10,
      overflow: 'hidden',
      background: isRunning ? 'rgba(106,95,193,0.04)' : 'var(--bg-surface)',
      border: `1px solid ${isRunning ? 'rgba(106,95,193,0.22)' : 'var(--border-subtle)'}`,
      opacity: isDone ? 0.65 : 1,
    }}>
      {/* Row 1: status dot + agent type + duration */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        <div style={{
          width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
          background: isDone ? 'var(--accent-green)' : isRunning ? 'var(--accent-blue)' : 'var(--border-default)',
          ...(isRunning ? { animation: 'sidebar-pulse 2s ease-in-out infinite' } : {}),
        }} />
        {agentType && (
          <span style={{
            fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px',
            color: isDone ? 'var(--accent-green)' : isRunning ? 'var(--accent-blue)' : 'var(--text-tertiary)',
          }}>
            {agentType}
          </span>
        )}
        {agent.usage?.duration_ms !== undefined && (
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: 'var(--text-tertiary)', flexShrink: 0, marginLeft: 'auto', whiteSpace: 'nowrap' }}>
            {formatDuration(agent.usage.duration_ms)}
          </span>
        )}
      </div>
      {/* Row 2: case number */}
      <div style={{ marginTop: 3, marginLeft: 15 }}>
        <span style={{
          fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
          fontSize: 11, fontWeight: 600,
          color: isDone ? 'rgba(22,163,74,0.7)' : isRunning ? 'rgba(106,95,193,0.7)' : 'var(--text-tertiary)',
        }}>
          {agent.caseNumber || agent.taskId.slice(0, 8)}
        </span>
      </div>
      {/* Row 2: last response summary (running or done) */}
      {agent.summary && (
        <div style={{
          marginTop: 4, marginLeft: 15, fontSize: 10, lineHeight: 1.4,
          color: isRunning ? 'var(--text-secondary)' : 'var(--text-secondary)',
          opacity: isDone ? 0.6 : 0.8,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {agent.summary}
        </div>
      )}
      {/* Row 3: current tool (only when running) */}
      {isRunning && agent.lastToolName && (
        <div style={{ marginTop: 3, marginLeft: 15, display: 'flex', alignItems: 'center', gap: 4 }}>
          <svg width="10" height="10" viewBox="0 0 16 16" style={{ animation: 'agent-spin 1.5s linear infinite', flexShrink: 0 }}>
            <path d="M8 1a7 7 0 1 0 7 7" stroke="var(--accent-blue)" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
          </svg>
          <span style={{
            fontSize: 9, fontWeight: 600, letterSpacing: '0.3px',
            color: 'var(--accent-blue)', opacity: 0.7,
          }}>
            {agent.lastToolName}
          </span>
        </div>
      )}
    </div>
  )
}

// ─── Main Component ───

export default function PatrolSidebar() {
  const phase = usePatrolStore(s => s.phase)
  const phaseTimings = usePatrolStore(s => s.phaseTimings)
  const phaseStartedAt = usePatrolStore(s => s.phaseStartedAt)
  const totalFound = usePatrolStore(s => s.totalFound)
  const changedCases = usePatrolStore(s => s.changedCases)
  const skippedCount = usePatrolStore(s => s.skippedCount)
  const warmupStatus = usePatrolStore(s => s.warmupStatus)
  const processedCases = usePatrolStore(s => s.processedCases)
  const totalCases = usePatrolStore(s => s.totalCases)
  const currentAction = usePatrolStore(s => s.currentAction)
  const archivedCount = usePatrolStore(s => s.archivedCount)
  const transferredCount = usePatrolStore(s => s.transferredCount)
  const queuedCaseList = usePatrolStore(s => s.caseList)

  const agents = usePatrolAgentStore(s => s.agents)

  if (phase === 'idle') return null

  // Derive statuses
  const initStatus = deriveStageStatus(phase, 'initializing')
  const processStatus = deriveStageStatus(phase, 'processing')
  const finalizeStatus = deriveStageStatus(phase, 'finalizing')

  // Initialize sub-steps (consuming phaseTimings for real durations)
  const initSubSteps = deriveInitSubSteps({
    phase, currentAction, totalFound, changedCases,
    skippedCount, warmupStatus, archivedCount, transferredCount,
    phaseTimings,
  })

  // Initialize total duration: sum of old phase timings that map to "initializing"
  const initDuration = phaseTimings
    ? (phaseTimings['starting'] || 0) + (phaseTimings['discovering'] || 0) +
      (phaseTimings['filtering'] || 0) + (phaseTimings['warming-up'] || 0) +
      (phaseTimings['initializing'] || 0)
    : undefined

  // Process agents sorted by start time
  const sortedAgents = Object.values(agents).sort((a, b) =>
    new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
  )
  const casesInAgents = new Set(sortedAgents.map(a => a.caseNumber).filter(Boolean))

  // Finalize: parse currentAction for structured display
  // Only use currentAction if it contains finalize-specific keywords (orphan/aggregat/cleanup)
  // Otherwise it's a stale value from processing phase
  let finalizeDetail: string | undefined
  if (finalizeStatus === 'completed' || finalizeStatus === 'active') {
    const isFinalizeAction = currentAction && (
      /orphan/i.test(currentAction) || /aggregat/i.test(currentAction) || /cleanup/i.test(currentAction)
    )
    if (isFinalizeAction) {
      const orphanMatch = currentAction!.match(/Killed (\d+) orphan/i)
      const noOrphan = /No orphans/i.test(currentAction!)
      const aggMatch = currentAction!.match(/(\d+\/\d+).*aggregat/i)
      const parts: string[] = []
      if (orphanMatch) parts.push(`${orphanMatch[1]} orphans killed`)
      else if (noOrphan) parts.push('0 orphans')
      if (aggMatch) parts.push(`${aggMatch[1]} cases`)
      finalizeDetail = parts.length > 0 ? parts.join(' · ') : undefined
    }
    if (!finalizeDetail) {
      finalizeDetail = finalizeStatus === 'active' ? 'Cleaning up…' : `${processedCases} cases`
    }
  }
  const finalizeSubSteps: SubStep[] = [
    {
      id: 'cleanup-aggregate',
      label: 'Cleanup & Write',
      status: finalizeStatus,
      detail: finalizeDetail,
    },
  ]

  return (
    <Card padding="none">
      <div style={{ padding: '16px 18px 10px', lineHeight: '16px' }}>
        <span className="text-[11px] font-bold uppercase" style={{ letterSpacing: '0.8px', color: 'var(--text-tertiary)' }}>
          Pipeline
        </span>
      </div>

      <div style={{ padding: '0 18px 18px' }}>
        {/* Initialize */}
        <ParentStage
          label="Initialize"
          status={initStatus}
          durationMs={initStatus === 'completed' ? initDuration : undefined}
          liveStartedAt={initStatus === 'active' ? phaseStartedAt : undefined}
        >
          {initSubSteps.map(step => <SubStepRow key={step.id} step={step} />)}
        </ParentStage>

        {/* Process */}
        <ParentStage
          label="Process"
          status={processStatus}
          rightLabel={totalCases > 0 ? `${processedCases} / ${totalCases}` : undefined}
          liveStartedAt={processStatus === 'active' ? phaseStartedAt : undefined}
        >
          {sortedAgents.map(agent => <AgentRow key={agent.taskId} agent={agent} />)}
          {/* Queued cases not yet spawned */}
          {queuedCaseList
            .filter(cn => !casesInAgents.has(cn))
            .map(cn => (
              <div key={cn} style={{ padding: '4px 10px', opacity: 0.35, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', border: '1.5px solid var(--border-default)' }} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: 'var(--text-tertiary)' }}>{cn}</span>
                <span style={{ fontSize: 9, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>queued</span>
              </div>
            ))}
        </ParentStage>

        {/* Finalize */}
        <ParentStage
          label="Finalize"
          status={finalizeStatus}
          durationMs={finalizeStatus === 'completed' ? (phaseTimings?.['aggregating'] || phaseTimings?.['finalizing'] || 0) : undefined}
          liveStartedAt={finalizeStatus === 'active' ? phaseStartedAt : undefined}
        >
          {finalizeSubSteps.map(step => <SubStepRow key={step.id} step={step} />)}
        </ParentStage>
      </div>

      <style>{`
        @keyframes sidebar-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.7); }
        }
        @keyframes agent-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Card>
  )
}

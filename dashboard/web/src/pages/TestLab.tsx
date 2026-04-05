/**
 * TestLab.tsx — Test Supervisor Dashboard (V3: Compact Header + Pipeline)
 *
 * V3 Design:
 * 1. TestLabHeader — cycle info + stage badge + elapsed + supervisor status badge + controls
 * 2. SelfHealBanner — amber alert, only shown when self-heal event exists
 * 3. StagePipeline — horizontal 6-stage flow (SCAN -> GENERATE -> TEST -> VALIDATE -> FIX -> VERIFY)
 * 4. StatsBar — compact inline cumulative + cycle stats
 * 5. Tab content: Overview (Activity + Queues), Discoveries, Trends, Evolution
 */
import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useQueryClient } from '@tanstack/react-query'
import {
  useTestState,
  useTestDiscoveries,
  useTestTrends,
  useTestRegistry,
  useRunnerStatus,
  useRunnerStart,
  useRunnerStop,
  useTestEvolution,
  useTestPipeline,
  useTestSupervisor,
  useTestQueues,
  useTestStats,
  useTestStory,
  useFeatureMap,
} from '../api/hooks'
import { Card, CardHeader } from '../components/common/Card'
import { Badge } from '../components/common/Badge'
import { Loading, EmptyState } from '../components/common/Loading'
import {
  CheckCircle, XCircle, Wrench, SkipForward, Activity,
  Bug, Play, Square, Zap, Milestone, ChevronDown, ChevronUp, Trash2,
} from 'lucide-react'
import { BASE_URL, apiGet } from '../api/client'
import { formatActivityMessage, isDuplicateEvent } from '../utils/activityFormatter'

// ============ Stage Color Map ============

const STAGE_COLORS: Record<string, string> = {
  SCAN: 'var(--accent-blue)',
  GENERATE: 'var(--accent-purple)',
  TEST: 'var(--accent-amber)',
  VALIDATE: 'var(--accent-cyan, #22d3ee)',
  FIX: 'var(--accent-red)',
  VERIFY: 'var(--accent-green)',
}

const STAGES = ['SCAN', 'GENERATE', 'TEST', 'VALIDATE', 'FIX', 'VERIFY'] as const

function stageColorOf(stage?: string): string {
  if (!stage) return 'var(--text-tertiary)'
  return STAGE_COLORS[stage.toUpperCase()] || 'var(--text-secondary)'
}

const STAGE_ICONS: Record<string, string> = {
  SCAN: '\uD83D\uDD0D',
  GENERATE: '\u2699\uFE0F',
  TEST: '\uD83E\uDDEA',
  VALIDATE: '\uD83D\uDCCB',
  FIX: '\uD83D\uDD27',
  VERIFY: '\u2705',
}

// ============ CSS Animation Injection ============

const TESTLAB_KEYFRAMES = `
@keyframes bar-pulse {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.25; }
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes stage-glow {
  0%, 100% {
    box-shadow: 0 0 24px var(--glow-color, rgba(107,163,232,0.15)),
                0 0 48px var(--glow-far, rgba(107,163,232,0.06)),
                inset 0 1px 0 rgba(255,255,255,0.04);
  }
  50% {
    box-shadow: 0 0 36px var(--glow-color, rgba(107,163,232,0.22)),
                0 0 72px var(--glow-far, rgba(107,163,232,0.09)),
                inset 0 1px 0 rgba(255,255,255,0.06);
  }
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-3px); }
}
@keyframes connector-flow {
  0%   { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}
@keyframes shimmer-border {
  0%   { background-position: -300% 0; }
  100% { background-position: 300% 0; }
}
@keyframes pulse-ring {
  0%   { transform: scale(1); opacity: 0.6; }
  100% { transform: scale(2.2); opacity: 0; }
}
[data-theme="light"] {
  --glass-bg: rgba(255,255,255,0.82);
  --glass-border: rgba(0,0,0,0.08);
  --glass-blur: blur(8px);
}
`

function useInjectKeyframes() {
  useEffect(() => {
    const id = 'testlab-keyframes'
    if (document.getElementById(id)) return
    const style = document.createElement('style')
    style.id = id
    style.textContent = TESTLAB_KEYFRAMES
    document.head.appendChild(style)
    return () => { style.remove() }
  }, [])
}

// ============ Glassmorphism Utilities ============

import type { CSSProperties } from 'react'

function glassStyle(extra?: CSSProperties): CSSProperties {
  return {
    background: 'var(--glass-bg)',
    backdropFilter: 'var(--glass-blur, blur(14px))',
    WebkitBackdropFilter: 'var(--glass-blur, blur(14px))',
    border: '1px solid var(--glass-border)',
    ...extra,
  }
}

function glassCardStyle(extra?: CSSProperties): CSSProperties {
  return glassStyle({
    borderRadius: 'var(--radius-lg, 16px)',
    padding: '18px 20px',
    ...extra,
  })
}

// ============ Elapsed Timer Hook ============

function useElapsedTimer(startedAt: string | null | undefined, active: boolean, lastRunAt?: string | null): string {
  const [elapsed, setElapsed] = useState('')

  useEffect(() => {
    if (!active) {
      if (startedAt && lastRunAt) {
        const diff = Math.max(0, new Date(lastRunAt).getTime() - new Date(startedAt).getTime())
        const h = Math.floor(diff / 3600000)
        const m = Math.floor((diff % 3600000) / 60000)
        const s = Math.floor((diff % 60000) / 1000)
        setElapsed(h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`)
      } else {
        setElapsed('\u2014')
      }
      return
    }
    if (!startedAt) { setElapsed('00:00'); return }
    const update = () => {
      const diff = Math.max(0, Date.now() - new Date(startedAt).getTime())
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setElapsed(h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`)
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [startedAt, active, lastRunAt])

  return elapsed
}

function useCountdown(nextRunAt: string | null | undefined): string {
  const [text, setText] = useState('')
  useEffect(() => {
    if (!nextRunAt) { setText(''); return }
    const update = () => {
      const diff = Math.max(0, new Date(nextRunAt).getTime() - Date.now())
      if (diff <= 0) { setText('starting...'); return }
      const m = Math.floor(diff / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setText(`${m}:${String(s).padStart(2, '0')}`)
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [nextRunAt])
  return text
}

// ============ TestLabHeader ============

function TestLabHeader({ pipelineData, supervisorData }: { pipelineData: any; supervisorData?: any }) {
  const { data: runnerStatus } = useRunnerStatus()
  const startMutation = useRunnerStart()
  const stopMutation = useRunnerStop()

  const status = runnerStatus?.status || 'idle'
  const startedAt = runnerStatus?.startedAt
  const lastRunAt = runnerStatus?.lastRunAt
  const isRunning = status === 'running'
  const isWaiting = status === 'waiting'
  // Detect external: backend says 'external', or runner idle but pipeline is actively running
  // Note: pipelineData.currentStage persists from last run — check pipelineStatus instead
  const isExternal = status === 'external' || (status === 'idle' && pipelineData?.pipelineStatus === 'running')
  const isActive = isRunning || isWaiting || isExternal
  const loopEnabled = runnerStatus?.loop || false
  const runsCompleted = runnerStatus?.runsCompleted || 0
  const nextRunAt = runnerStatus?.nextRunAt

  const cycle = pipelineData?.cycle || 0
  const maxCycles = pipelineData?.maxCycles || 0
  const currentStage = pipelineData?.currentStage || ''
  const stageColor = stageColorOf(currentStage)

  const elapsed = useElapsedTimer(startedAt, isActive, lastRunAt)
  const countdown = useCountdown(nextRunAt)

  // Start menu dropdown
  const [showStartMenu, setShowStartMenu] = useState(false)
  const startMenuRef = useRef<HTMLDivElement>(null)
  const startDropdownRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!showStartMenu) return
    const handler = (e: MouseEvent) => {
      if (startMenuRef.current && !startMenuRef.current.contains(e.target as Node)
        && startDropdownRef.current && !startDropdownRef.current.contains(e.target as Node)) setShowStartMenu(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showStartMenu])

  // Stop confirmation
  const [confirmStop, setConfirmStop] = useState(false)
  const confirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const handleStopClick = useCallback(() => {
    if (confirmStop) {
      stopMutation.mutate()
      setConfirmStop(false)
      if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current)
    } else {
      setConfirmStop(true)
      confirmTimerRef.current = setTimeout(() => setConfirmStop(false), 3000)
    }
  }, [confirmStop, stopMutation])

  return (
    <div
      style={glassCardStyle({
        overflow: 'hidden',
        position: 'relative',
        padding: 0,
      })}
    >
      {/* Animated top shimmer bar when active */}
      {isActive && (
        <div style={{
          height: '3px',
          background: `linear-gradient(90deg, transparent 0%, ${stageColor} 25%, var(--accent-purple, #9e8cc7) 50%, ${stageColor} 75%, transparent 100%)`,
          backgroundSize: '200% 100%',
          animation: 'shimmer-border 2.4s linear infinite',
        }} />
      )}

      {/* Single-line header content */}
      <div className="flex items-center justify-between px-5 py-3 gap-4">
        {/* Left: Cycle info + Stage badge + Elapsed */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Cycle counter */}
          <span className="font-bold font-mono" style={{ fontSize: '20px', color: 'var(--text-primary)', whiteSpace: 'nowrap', letterSpacing: '-0.5px' }}>
            Cycle {cycle}/{maxCycles}
          </span>

          {/* Stage badge */}
          {currentStage ? (
            <span
              className="text-[10px] font-bold font-mono px-2.5 py-1 rounded"
              style={{
                color: stageColor,
                background: `color-mix(in srgb, ${stageColor} 15%, transparent)`,
                border: `1px solid color-mix(in srgb, ${stageColor} 30%, transparent)`,
                whiteSpace: 'nowrap',
              }}
            >
              {STAGE_ICONS[currentStage.toUpperCase()] || ''} {currentStage.toUpperCase()}
            </span>
          ) : (
            <span className="text-[10px] font-mono px-2 py-1 rounded" style={{ color: 'var(--text-tertiary)', background: 'var(--bg-inset)' }}>
              —
            </span>
          )}

          {/* Elapsed timer */}
          <span
            className="text-[15px] font-mono font-bold tabular-nums"
            style={{ color: isActive ? stageColor : 'var(--text-tertiary)', whiteSpace: 'nowrap' }}
          >
            {isWaiting ? (countdown || '--:--') : elapsed}
          </span>
          <span className="text-[10px] font-mono" style={{ color: 'var(--text-tertiary)' }}>
            {isWaiting ? 'next run' : isRunning ? 'elapsed' : 'last run'}
          </span>

          {/* Supervisor status badge — single-line indicator */}
          {(() => {
            const supStep = supervisorData?.step || ''
            const supStatus = supervisorData?.status || 'idle'
            const pipeComplete = currentStage === 'COMPLETE' || pipelineData?.pipelineStatus === 'complete'

            // Activity description map
            const actMap: Record<string, string> = {
              observe: 'pre-flight',
              diagnose: 'trends',
              decide: 'strategy',
              act: `worker: ${currentStage || 'running'}`,
              reflect: 'summary',
            }

            let badgeIcon = ''
            let badgeText = ''
            let badgeColor = 'var(--text-tertiary)'

            if (isExternal) {
              badgeIcon = '\u26A1'
              badgeText = `CLI: ${currentStage || 'running'}`
              badgeColor = 'var(--accent-blue)'
            } else if (isActive && supStep) {
              badgeIcon = '\u26A1'
              badgeText = actMap[supStep] || supStep
              badgeColor = stageColor
            } else if (pipeComplete) {
              badgeIcon = '\u2705'
              badgeText = 'cycle done'
              badgeColor = 'var(--accent-green)'
            } else if (currentStage) {
              badgeIcon = '\uD83D\uDCA4'
              badgeText = `next \u2192 ${currentStage}`
              badgeColor = 'var(--text-tertiary)'
            }

            if (!badgeText) return null

            return (
              <>
                <div style={{ width: '1px', height: '16px', background: 'var(--border-subtle)', flexShrink: 0 }} />
                <span
                  className="text-[11px] font-bold font-mono px-2 py-0.5 rounded"
                  style={{
                    color: badgeColor,
                    background: `color-mix(in srgb, ${badgeColor} 10%, transparent)`,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {badgeIcon} {badgeText}
                </span>
              </>
            )
          })()}
        </div>

        {/* Right: Status + Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Status indicator */}
          <div
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{
              background: isRunning ? 'var(--accent-green)' :
                isWaiting ? 'var(--accent-purple)' :
                isExternal ? 'var(--accent-amber)' :
                status === 'paused' ? 'var(--accent-amber)' : 'var(--text-tertiary)',
              boxShadow: isActive ? `0 0 6px ${isWaiting ? 'var(--accent-purple)' : isExternal ? 'var(--accent-amber)' : 'var(--accent-green)'}` : 'none',
              animation: isWaiting ? 'blink 1.5s ease-in-out infinite' : isExternal ? 'blink 2s ease-in-out infinite' : 'none',
            }}
          />
          <span className="text-[12px] font-bold font-mono" style={{
            color: isRunning ? 'var(--accent-green)' :
              isWaiting ? 'var(--accent-purple)' :
              isExternal ? 'var(--accent-amber)' :
              status === 'paused' ? 'var(--accent-amber)' : 'var(--text-tertiary)',
          }}>
            {isExternal ? 'EXTERNAL' : isWaiting ? 'WAITING' : status.toUpperCase()}
          </span>

          {/* Loop badge */}
          {isActive && loopEnabled && (
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded" style={{ background: 'var(--accent-purple-dim, var(--accent-blue-dim))', color: 'var(--accent-purple)' }}>
              LOOP #{runsCompleted + 1}
            </span>
          )}

          {/* Start button (when idle, not external) */}
          {status === 'idle' && !isExternal && (
            <div ref={startMenuRef} style={{ position: 'relative' }}
              onKeyDown={(e) => { if (e.key === 'Escape' && showStartMenu) { setShowStartMenu(false); e.stopPropagation() } }}
            >
              <button
                onClick={() => setShowStartMenu(!showStartMenu)}
                disabled={startMutation.isPending}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] font-bold transition-all hover:opacity-80 disabled:opacity-50"
                style={{ background: 'var(--accent-green)', color: '#fff', boxShadow: '0 0 12px rgba(92,191,138,0.3)' }}
              >
                <Play className="w-4 h-4" /> Start
                <ChevronDown className="w-3.5 h-3.5" style={{ transform: showStartMenu ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
              </button>
              {showStartMenu && (() => {
                const rect = startMenuRef.current?.getBoundingClientRect()
                return rect ? createPortal(
                  <div ref={startDropdownRef} style={{
                    position: 'fixed', top: rect.bottom + 4, right: window.innerWidth - rect.right,
                    background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                    borderRadius: '8px', padding: '4px', minWidth: '170px', zIndex: 9999,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  }}>
                    <button
                      onClick={() => { startMutation.mutate({}); setShowStartMenu(false) }}
                      className="w-full text-left px-3 py-2 rounded-md text-[12px] font-bold transition-all"
                      style={{ color: 'var(--accent-green)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--accent-green-dim)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <Play className="w-3.5 h-3.5 inline mr-1.5" style={{ verticalAlign: 'middle' }} />
                      Single Run
                    </button>
                    <div className="px-3 pt-2 pb-0.5 text-[9px] font-mono font-bold" style={{ color: 'var(--text-tertiary)' }}>LOOP MODE</div>
                    {[5, 10, 15, 30].map(mins => (
                      <button
                        key={mins}
                        onClick={() => { startMutation.mutate({ loop: true, intervalMinutes: mins }); setShowStartMenu(false) }}
                        className="w-full text-left px-3 py-1.5 rounded-md text-[12px] font-bold transition-all"
                        style={{ color: 'var(--accent-purple)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--accent-blue-dim)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        {'\u267B\uFE0F'} Every {mins}m
                      </button>
                    ))}
                  </div>,
                  document.body
                ) : null
              })()}
            </div>
          )}

          {/* Stop button (when running/waiting/external) */}
          {(status === 'running' || status === 'waiting' || status === 'external') && (
            <button
              onClick={handleStopClick}
              disabled={stopMutation.isPending}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] font-bold transition-all hover:opacity-80 disabled:opacity-50"
              style={{ background: 'var(--accent-red)', color: '#fff', boxShadow: '0 0 12px rgba(212,114,114,0.3)' }}
            >
              <Square className="w-4 h-4" /> {confirmStop ? 'Confirm?' : 'Stop'}
            </button>
          )}

          {/* Resume + Stop (when paused) */}
          {status === 'paused' && (
            <>
              <button
                onClick={() => startMutation.mutate({})}
                disabled={startMutation.isPending}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-bold transition-all hover:opacity-80 disabled:opacity-50"
                style={{ background: 'var(--accent-green-dim)', color: 'var(--accent-green)' }}
              >
                <Play className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleStopClick}
                disabled={stopMutation.isPending}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-bold transition-all hover:opacity-80 disabled:opacity-50"
                style={{ background: 'var(--accent-red-dim)', color: 'var(--accent-red)' }}
              >
                <Square className="w-3.5 h-3.5" /> {confirmStop ? '?' : ''}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ============ Self-Heal Banner ============

function SelfHealBanner({ selfHealEvent }: { selfHealEvent?: any }) {
  if (!selfHealEvent) return null

  const description = typeof selfHealEvent === 'string'
    ? selfHealEvent
    : selfHealEvent?.description || JSON.stringify(selfHealEvent)

  return (
    <div
      style={glassCardStyle({
        padding: '11px 16px',
        borderLeft: '3px solid var(--accent-amber)',
        borderColor: 'color-mix(in srgb, var(--accent-amber) 30%, transparent)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        animation: 'fadeIn 0.35s ease-out',
      })}
    >
      <span style={{ fontSize: '15px', flexShrink: 0 }}>{'\uD83D\uDD27'}</span>
      <div>
        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-amber)' }}>Self-Heal</span>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '8px' }}>{description}</span>
      </div>
    </div>
  )
}

// ============ Stage Pipeline ============

function StagePipeline({ pipelineData }: { pipelineData: any }) {
  const stages = pipelineData?.stages || {}
  const currentStage = (pipelineData?.currentStage || '').toUpperCase()
  const currentTest = pipelineData?.currentTest || ''

  return (
    <div
      style={glassCardStyle({ padding: '20px 24px' })}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, width: '100%' }}>
        {STAGES.map((stage, i) => {
          const stageData = stages[stage] || {}
          const status = stageData.status || (stage === currentStage ? 'running' : 'pending')
          const isDone = status === 'done' || status === 'completed'
          const isActive = status === 'running' || status === 'in-progress' || stage === currentStage
          const isPending = !isDone && !isActive
          const color = isDone ? 'var(--accent-green)' : isActive ? stageColorOf(stage) : 'var(--text-tertiary)'
          const summary = stageData.summary || ''
          const stageCol = stageColorOf(stage)

          // Compute glow CSS vars for active stage
          const glowVars: Record<string, string> = {}
          if (isActive && !isDone) {
            if (stage === 'FIX') {
              glowVars['--glow-color'] = 'rgba(212,164,74,0.16)'
              glowVars['--glow-far'] = 'rgba(212,164,74,0.06)'
            } else if (stage === 'VERIFY') {
              glowVars['--glow-color'] = 'rgba(92,191,138,0.16)'
              glowVars['--glow-far'] = 'rgba(92,191,138,0.06)'
            } else if (stage === 'GENERATE') {
              glowVars['--glow-color'] = 'rgba(158,140,199,0.16)'
              glowVars['--glow-far'] = 'rgba(158,140,199,0.06)'
            } else if (stage === 'TEST') {
              glowVars['--glow-color'] = 'rgba(212,164,74,0.16)'
              glowVars['--glow-far'] = 'rgba(212,164,74,0.06)'
            } else if (stage === 'VALIDATE') {
              glowVars['--glow-color'] = 'rgba(34,211,238,0.16)'
              glowVars['--glow-far'] = 'rgba(34,211,238,0.06)'
            } else {
              glowVars['--glow-color'] = 'rgba(107,163,232,0.16)'
              glowVars['--glow-far'] = 'rgba(107,163,232,0.06)'
            }
          }

          // Connector state
          const nextStage = i < STAGES.length - 1 ? STAGES[i + 1] : null
          const nextData = nextStage ? (stages[nextStage] || {}) : {}
          const nextStatus = nextData.status || (nextStage === currentStage ? 'running' : 'pending')
          const nextActive = nextStatus === 'running' || nextStatus === 'in-progress' || nextStage === currentStage
          const connectorLit = isDone
          const connectorFlowing = isActive && !isDone

          return (
            <div key={stage} style={{ display: 'contents' }}>
              {/* Stage card */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '26px 24px 22px',
                  borderRadius: 'var(--radius-xl, 20px)',
                  border: `1.5px solid ${isDone ? 'rgba(92,191,138,0.12)' : isActive ? `color-mix(in srgb, ${stageCol} 28%, transparent)` : 'var(--border-subtle)'}`,
                  background: isDone ? 'rgba(92,191,138,0.03)'
                    : isActive ? `linear-gradient(170deg, color-mix(in srgb, ${stageCol} 6%, transparent) 0%, var(--bg-inset) 100%)`
                    : 'var(--bg-inset)',
                  flex: 1,
                  minWidth: '120px',
                  maxWidth: '220px',
                  position: 'relative',
                  zIndex: 2,
                  transition: 'all 0.45s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isActive && !isDone ? 'scale(1.06)' : 'scale(1)',
                  animation: isActive && !isDone ? 'stage-glow 2.8s ease-in-out infinite' : 'none',
                  opacity: isPending ? 0.38 : 1,
                  ...glowVars as any,
                }}
                title={summary || `${stage}: ${status}`}
              >
                {/* Large icon */}
                <span style={{
                  fontSize: '36px',
                  lineHeight: 1,
                  transition: 'transform 0.3s',
                  animation: isActive && !isDone ? 'float 2.2s ease-in-out infinite' : 'none',
                }}>
                  {STAGE_ICONS[stage]}
                </span>

                {/* Stage name */}
                <span className="font-mono" style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  letterSpacing: '1.8px',
                  textTransform: 'uppercase',
                  color: isDone ? 'var(--text-secondary)' : isActive ? 'var(--text-primary)' : isPending ? 'var(--text-tertiary)' : 'var(--text-primary)',
                }}>
                  {stage}
                </span>

                {/* Status text */}
                <span className="font-mono" style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}>
                  {isDone && <span style={{ color: 'var(--accent-green)' }}>{'\u2705'} Done</span>}
                  {isActive && !isDone && (
                    <>
                      <span style={{
                        display: 'inline-block',
                        width: '12px', height: '12px',
                        border: `2px solid color-mix(in srgb, ${stageCol} 18%, transparent)`,
                        borderTopColor: stageCol,
                        borderRadius: '50%',
                        animation: 'spin 0.75s linear infinite',
                      }} />
                      Running
                    </>
                  )}
                  {isPending && <span style={{ color: 'var(--text-tertiary)' }}>Pending</span>}
                </span>

                {/* Summary text */}
                {summary && (
                  <span className="font-mono" style={{
                    fontSize: '10px',
                    color: 'var(--text-tertiary)',
                    textAlign: 'center',
                    maxWidth: '160px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }} title={summary}>
                    {summary}
                  </span>
                )}
              </div>

              {/* Connector line — three states: lit / flowing / off */}
              {i < STAGES.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    minWidth: '24px',
                    maxWidth: '80px',
                    height: '2px',
                    borderRadius: '1px',
                    zIndex: 1,
                    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    ...(connectorLit ? {
                      background: `linear-gradient(90deg, var(--accent-green), rgba(92,191,138,0.25))`,
                      boxShadow: '0 0 10px rgba(92,191,138,0.12)',
                    } : connectorFlowing ? {
                      background: stage === 'FIX' || stage === 'TEST' || stage === 'VALIDATE'
                        ? 'linear-gradient(90deg, rgba(212,164,74,0.2), var(--accent-amber), rgba(212,164,74,0.2))'
                        : 'linear-gradient(90deg, rgba(107,163,232,0.2), var(--accent-blue), rgba(107,163,232,0.2))',
                      backgroundSize: '200% 100%',
                      animation: 'connector-flow 1.6s linear infinite',
                      boxShadow: stage === 'FIX' || stage === 'TEST' || stage === 'VALIDATE'
                        ? '0 0 10px rgba(212,164,74,0.08)'
                        : '0 0 10px rgba(107,163,232,0.08)',
                    } : {
                      background: 'rgba(255,255,255,0.05)',
                    }),
                  }}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Current test indicator */}
      {currentTest && (
        <div className="flex items-center gap-2 mt-2 pt-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <span className="text-[10px] font-mono" style={{ color: 'var(--text-tertiary)' }}>Running:</span>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded truncate"
            style={{ background: 'var(--accent-blue-dim)', color: 'var(--accent-blue)' }}>
            {currentTest}
          </span>
        </div>
      )}
    </div>
  )
}

// ============ Stats Bar ============

function StatsBar({ statsData }: { statsData: any }) {
  const cumulative = statsData?.cumulative || {}
  const cycleStats = statsData?.cycleStats || {}

  return (
    <div
      className="flex items-center justify-between"
      style={glassCardStyle({ padding: '10px 16px' })}
    >
      {/* Cumulative stats */}
      <div className="flex items-center gap-4">
        <span className="text-[10px] font-mono font-bold" style={{ color: 'var(--text-tertiary)' }}>TOTAL</span>
        <div className="flex items-center gap-3">
          <StatItem icon={<CheckCircle className="w-3.5 h-3.5" />} color="var(--accent-green)" value={cumulative.passed || 0} label="passed" />
          <StatItem icon={<XCircle className="w-3.5 h-3.5" />} color="var(--accent-red)" value={cumulative.failed || 0} label="failed" />
          <StatItem icon={<Wrench className="w-3.5 h-3.5" />} color="var(--accent-amber)" value={cumulative.fixed || 0} label="fixed" />
          <StatItem icon={<SkipForward className="w-3.5 h-3.5" />} color="var(--accent-purple)" value={cumulative.skipped || 0} label="skipped" />
        </div>
      </div>

      {/* Separator */}
      <div style={{ width: '1px', height: '20px', background: 'var(--border-subtle)' }} />

      {/* Cycle stats */}
      <div className="flex items-center gap-4">
        <span className="text-[10px] font-mono font-bold" style={{ color: 'var(--text-tertiary)' }}>CYCLE</span>
        <div className="flex items-center gap-3">
          <StatItem icon={<CheckCircle className="w-3.5 h-3.5" />} color="var(--accent-green)" value={cycleStats.passed || 0} label="passed" />
          <StatItem icon={<XCircle className="w-3.5 h-3.5" />} color="var(--accent-red)" value={cycleStats.failed || 0} label="failed" />
          <StatItem icon={<Wrench className="w-3.5 h-3.5" />} color="var(--accent-amber)" value={cycleStats.fixed || 0} label="fixed" />
          <StatItem icon={<SkipForward className="w-3.5 h-3.5" />} color="var(--accent-purple)" value={cycleStats.skipped || 0} label="skipped" />
        </div>
      </div>
    </div>
  )
}

function StatItem({ icon, color, value, label }: { icon: React.ReactNode; color: string; value: number; label: string }) {
  return (
    <div className="flex items-center gap-1" style={{ color }}>
      {icon}
      <span className="text-[13px] font-mono font-bold">{value}</span>
      <span className="text-[10px] font-mono" style={{ color: 'var(--text-tertiary)' }}>{label}</span>
    </div>
  )
}

// ============ Queues Panel ============

function QueuesPanel({ queuesData, registry }: { queuesData: any; registry: Record<string, any> }) {
  const [expandedQueue, setExpandedQueue] = useState<string | null>(null)

  const queueDefs: { key: string; label: string; color: string }[] = [
    { key: 'testQueue', label: 'Test Queue', color: 'var(--accent-blue)' },
    { key: 'fixQueue', label: 'Fix Queue', color: 'var(--accent-amber)' },
    { key: 'verifyQueue', label: 'Verify Queue', color: 'var(--accent-green)' },
    { key: 'regressionQueue', label: 'Regression Queue', color: 'var(--accent-red)' },
  ]

  // Filter to non-empty queues
  const nonEmptyQueues = queueDefs.filter(q => {
    const items = queuesData?.[q.key]
    return Array.isArray(items) && items.length > 0
  })

  // Additional data
  const gaps = queuesData?.gaps
  const inProgress = queuesData?.inProgress
  const skipRegistry = queuesData?.skipRegistry

  if (nonEmptyQueues.length === 0 && !gaps?.length && !inProgress?.length && !skipRegistry) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-lg text-[12px]"
        style={{ background: 'var(--accent-green-dim)', color: 'var(--accent-green)' }}>
        <CheckCircle className="w-4 h-4" />
        <span className="font-medium">All queues empty</span>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Standard queues */}
      {nonEmptyQueues.map(q => {
        const items = queuesData[q.key] || []
        const isExpanded = expandedQueue === q.key

        return (
          <div key={q.key} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}>
            <button
              onClick={() => setExpandedQueue(isExpanded ? null : q.key)}
              className="w-full flex items-center justify-between px-3 py-2 transition-all hover:opacity-90"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-bold" style={{ color: q.color }}>{q.label}</span>
                <Badge variant="primary" size="xs">{items.length}</Badge>
              </div>
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} />
              )}
            </button>

            {isExpanded && (
              <div className="px-3 pb-2 space-y-1 max-h-[200px] overflow-y-auto" style={{ animation: 'fadeIn 0.15s ease-out' }}>
                {items.map((item: any, idx: number) => {
                  const entry = registry[item.testId]
                  return (
                    <div key={item.testId || idx}
                      className="flex items-center gap-2 px-2 py-1 rounded text-[11px]"
                      style={{ background: 'var(--bg-inset)' }}>
                      <span className="font-mono font-bold truncate" style={{ color: 'var(--text-primary)' }} title={item.testId}>
                        {item.testId}
                      </span>
                      {entry?.name && (
                        <span className="text-[10px] truncate" style={{ color: 'var(--text-tertiary)' }} title={entry.name}>
                          {entry.name}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}

      {/* Gaps */}
      {Array.isArray(gaps) && gaps.length > 0 && (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}>
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-bold" style={{ color: 'var(--accent-purple)' }}>Coverage Gaps</span>
              <Badge variant="purple" size="xs">{gaps.length}</Badge>
            </div>
          </div>
          <div className="px-3 pb-2 space-y-1 max-h-[150px] overflow-y-auto">
            {gaps.map((gap: any, i: number) => (
              <div key={i} className="text-[11px] font-mono px-2 py-1 rounded" style={{ background: 'var(--bg-inset)', color: 'var(--text-secondary)' }}>
                {typeof gap === 'string' ? gap : gap.description || gap.area || JSON.stringify(gap)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skip registry */}
      {skipRegistry && (Array.isArray(skipRegistry) ? skipRegistry.length > 0 : Object.keys(skipRegistry).length > 0) && (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}>
          <div className="flex items-center gap-2 px-3 py-2">
            <span className="text-[12px] font-bold" style={{ color: 'var(--text-tertiary)' }}>Skipped Tests</span>
            <Badge variant="default" size="xs">{Array.isArray(skipRegistry) ? skipRegistry.length : Object.keys(skipRegistry).length}</Badge>
          </div>
          <div className="px-3 pb-2 space-y-1 max-h-[150px] overflow-y-auto">
            {(Array.isArray(skipRegistry)
              ? skipRegistry.map((entry: any, idx: number) => (
                  <div key={entry.testId || idx} className="flex items-center gap-2 text-[11px] font-mono px-2 py-1 rounded"
                    style={{ background: 'var(--bg-inset)' }}>
                    <span style={{ color: 'var(--text-primary)' }}>{entry.testId || `#${idx}`}</span>
                    <span style={{ color: 'var(--text-tertiary)' }}>{entry.reason || ''}</span>
                  </div>
                ))
              : Object.entries(skipRegistry).map(([testId, reason]) => (
                  <div key={testId} className="flex items-center gap-2 text-[11px] font-mono px-2 py-1 rounded"
                    style={{ background: 'var(--bg-inset)' }}>
                    <span style={{ color: 'var(--text-primary)' }}>{testId}</span>
                    <span style={{ color: 'var(--text-tertiary)' }}>{String(reason)}</span>
                  </div>
                ))
            )}
          </div>
        </div>
      )}
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
  data?: Record<string, unknown>
}

function eventIcon(type: string): string {
  const icons: Record<string, string> = {
    'self-heal': '\uD83D\uDD27',
    'learning': '\uD83D\uDCDD',
    'strategy': '\uD83E\uDDE0',
    'state-updated': '\uD83D\uDCE1',
    'result-updated': '\uD83E\uDDEA',
    'discoveries-updated': '\uD83D\uDD0D',
    'evolution-updated': '\uD83E\uDDEC',
    'runner-changed': '\uD83C\uDFC3',
    'connection': '\uD83D\uDD0C',
    'phase-history': '\uD83D\uDD52',
  }
  return icons[type] || '\u2022'
}

function ActivityStream() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [events, setEvents] = useState<ActivityEvent[]>([])
  const CLEAR_KEY = 'activity-stream-cleared-at'

  const handleClear = useCallback(() => {
    setEvents([])
    sessionStorage.setItem(CLEAR_KEY, new Date().toISOString())
  }, [])

  // Load initial events from API
  useEffect(() => {
    const clearedAt = sessionStorage.getItem(CLEAR_KEY)

    apiGet<any[]>('/tests/recent-events', { limit: 30 })
      .then((stored: any[]) => stored || [])
      .then((stored: any[]) => {
        // Filter to only test/runner events — exclude case-step, patrol, etc.
        const testEvents = stored.filter((evt: any) => {
          const t = evt.type || ''
          if (!t.startsWith('test-') && !t.startsWith('runner-')) return false
          // Skip events before user's last clear
          if (clearedAt && evt.timestamp && evt.timestamp <= clearedAt) return false
          return true
        })
        if (testEvents.length > 0) {
          const mapped = testEvents.map((evt: any) => {
            const d = evt.data || {}
            const eventType = (evt.type || '').replace('test-', '').replace('runner-', '')
            return {
              type: eventType,
              phase: d.phase,
              action: d.action || (eventType === 'state-updated' ? d.phase : undefined),
              detail: d.testId || d.note || '',
              timestamp: evt.timestamp || new Date().toISOString(),
              data: d,
            }
          })
          // Deduplicate consecutive identical events from history
          const deduped = mapped.filter((evt: any, i: number) =>
            i === 0 || !isDuplicateEvent(evt, mapped.slice(0, i))
          )
          setEvents(deduped)
        }
      })
      .catch(() => { /* silent */ })
  }, [])

  // SSE for live events
  useEffect(() => {
    const token = localStorage.getItem('eb_token')
    if (!token) return

    const es = new EventSource(`${BASE_URL}/events`)

    const handleTestEvent = (e: MessageEvent, eventType: string) => {
      try {
        const parsed = JSON.parse(e.data)
        const d = parsed.data || parsed
        const newEvent: ActivityEvent = {
          type: eventType,
          phase: d.phase,
          action: d.action || (eventType === 'state-updated' ? d.phase : undefined),
          detail: d.testId || d.note || '',
          timestamp: d.timestamp || new Date().toISOString(),
          data: d,
        }
        setEvents(prev => {
          if (isDuplicateEvent(newEvent, prev)) return prev
          return [...prev, newEvent].slice(-30)
        })
      } catch { /* ignore */ }
    }

    es.addEventListener('test-state-updated', (e) => handleTestEvent(e, 'state-updated'))
    es.addEventListener('test-discoveries-updated', (e) => handleTestEvent(e, 'discoveries-updated'))
    es.addEventListener('test-result-updated', (e) => handleTestEvent(e, 'result-updated'))
    es.addEventListener('test-evolution-updated', (e) => handleTestEvent(e, 'evolution-updated'))
    es.addEventListener('runner-status-changed', (e) => handleTestEvent(e, 'runner-changed'))
    // New event types for V2
    es.addEventListener('test-self-heal', (e) => handleTestEvent(e, 'self-heal'))
    es.addEventListener('test-learning', (e) => handleTestEvent(e, 'learning'))
    es.addEventListener('test-strategy', (e) => handleTestEvent(e, 'strategy'))

    es.onerror = () => {
      setEvents(prev => {
        const last = prev[prev.length - 1]
        if (last?.type === 'connection') return prev
        return [...prev, {
          type: 'connection',
          action: 'reconnecting',
          detail: 'SSE disconnected \u2014 reconnecting\u2026',
          timestamp: new Date().toISOString(),
        }].slice(-30)
      })
    }

    return () => es.close()
  }, [])

  // Auto-scroll
  useEffect(() => {
    if (containerRef.current) containerRef.current.scrollTop = containerRef.current.scrollHeight
  }, [events])

  function formatTime(ts: string): string {
    try { return new Date(ts).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) }
    catch { return '' }
  }

  return (
    <Card>
      <CardHeader
        title="Activity Stream"
        subtitle={`${events.length} events`}
        icon={<Zap className="w-4 h-4" style={{ color: 'var(--accent-amber)' }} />}
        action={
          events.length > 0 ? (
            <button
              onClick={handleClear}
              className="flex items-center gap-1 px-2 py-1 rounded text-[11px] transition-colors"
              style={{
                color: 'var(--text-tertiary)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-secondary)'
                e.currentTarget.style.background = 'var(--hover-bg)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-tertiary)'
                e.currentTarget.style.background = 'transparent'
              }}
              title="Clear all activity"
            >
              <Trash2 className="w-3 h-3" />
              Clear
            </button>
          ) : undefined
        }
      />
      <div ref={containerRef} className="max-h-[260px] overflow-y-auto space-y-0">
        {events.length === 0 ? (
          <p className="text-center py-4 text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
            No events yet \u2014 events appear when a test run is active
          </p>
        ) : (
          events.map((evt, i) => (
            <div
              key={`${evt.timestamp}-${evt.type}-${i}`}
              className="flex items-center gap-2 py-1.5 px-2"
              style={{
                borderBottom: i < events.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              }}
            >
              <span className="text-[12px] flex-shrink-0">{eventIcon(evt.type)}</span>
              <span className="text-[10px] font-mono shrink-0 w-[56px]" style={{ color: 'var(--text-tertiary)' }}>
                {formatTime(evt.timestamp)}
              </span>
              {evt.phase && (
                <span
                  className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded shrink-0"
                  style={{
                    color: stageColorOf(evt.phase),
                    background: `color-mix(in srgb, ${stageColorOf(evt.phase)} 15%, transparent)`,
                  }}
                >
                  {evt.phase.toUpperCase().slice(0, 4)}
                </span>
              )}
              {(() => {
                const formatted = formatActivityMessage(evt)
                return (
                  <>
                    <span className="text-[10px] font-mono shrink-0" style={{ color: 'var(--text-secondary)', maxWidth: '120px' }}>
                      {formatted.message}
                    </span>
                    {formatted.detail && (
                      <span className="text-[11px] truncate" style={{ color: 'var(--text-tertiary)' }} title={formatted.detail}>
                        {formatted.detail}
                      </span>
                    )}
                  </>
                )
              })()}
            </div>
          ))
        )}
      </div>
    </Card>
  )
}

// ============ Story Narrative ============

function StoryNarrative() {
  const { data: story, isLoading } = useTestStory()

  if (isLoading) return <Loading text="Loading story..." />
  if (!story) return <EmptyState icon="\uD83D\uDCD6" title="No story yet" description="Run a test cycle first" />

  const sectionStyle: React.CSSProperties = {
    background: 'var(--card-bg)',
    borderRadius: 10,
    padding: '16px 20px',
    border: '1px solid var(--border-subtle)',
  }

  const headingStyle: React.CSSProperties = {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 10,
    color: 'var(--text-primary)',
  }

  const bodyStyle: React.CSSProperties = {
    fontSize: 13,
    lineHeight: 1.7,
    color: 'var(--text-secondary)',
  }

  const tagStyle = (color: string): React.CSSProperties => ({
    display: 'inline-block',
    fontSize: 11,
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: 6,
    background: color + '18',
    color,
    marginRight: 6,
  })

  return (
    <div className="space-y-3" style={{ animation: 'fadeIn 0.2s ease-out' }}>
      {/* Title */}
      <div style={{ ...sectionStyle, background: 'linear-gradient(135deg, var(--card-bg), var(--surface-hover))' }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>
          Test Framework Story — Cycle {story.cycle}/{story.maxCycles}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>
          Current stage: <span style={tagStyle('var(--accent-blue)')}>{story.currentStage}</span>
        </div>
      </div>

      {/* Round Narrative */}
      {story.roundNarrative.length > 0 && (
        <div style={sectionStyle}>
          <div style={headingStyle}>This Cycle</div>
          <div style={bodyStyle}>
            {story.roundNarrative.map((line: string, i: number) => (
              <div key={i} style={{ marginBottom: 6 }} dangerouslySetInnerHTML={{
                __html: line.replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--text-primary)">$1</strong>')
              }} />
            ))}
            {story.scanStrategyNote && (
              <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                Strategy: {story.scanStrategyNote}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Scorecard */}
      <div style={sectionStyle}>
        <div style={headingStyle}>Scorecard</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
          {[
            { label: 'Fixed & Stable', value: story.scorecard.verified, color: '#22c55e', icon: '\u2705' },
            { label: 'Fixed, Unverified', value: story.scorecard.fixedUnverified, color: '#3b82f6', icon: '\uD83D\uDD27' },
            { label: 'Regressed', value: story.scorecard.regression, color: '#f59e0b', icon: '\uD83D\uDD04' },
            { label: 'Retrying', value: story.scorecard.retryNeeded, color: '#ef4444', icon: '\uD83D\uDD01' },
            { label: 'Total Found', value: story.scorecard.total, color: 'var(--text-secondary)', icon: '\uD83D\uDCCB' },
          ].map(item => (
            <div key={item.label} style={{
              textAlign: 'center',
              padding: '12px 8px',
              borderRadius: 8,
              background: item.color + '10',
              border: `1px solid ${item.color}30`,
            }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: item.color }}>{item.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                {item.icon} {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Success Stories */}
      <div style={sectionStyle}>
        <div style={headingStyle}>{'\uD83C\uDFC6'} Successfully Fixed</div>
        {story.successStories.length === 0 ? (
          <div style={{ ...bodyStyle, fontStyle: 'italic' }}>No verified fixes yet</div>
        ) : (
          <div style={{ ...bodyStyle, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {story.successStories.map((s: any) => (
              <div key={s.testId} style={{
                padding: '8px 12px',
                borderRadius: 6,
                background: '#22c55e10',
                borderLeft: '3px solid #22c55e',
              }}>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{s.testId}</span>
                <span style={{ margin: '0 6px', color: 'var(--text-tertiary)' }}>—</span>
                {s.description}
                {s.fixedRound != null && (
                  <span style={{ fontSize: 11, color: 'var(--text-tertiary)', marginLeft: 6 }}>
                    (verified R{s.fixedRound})
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Struggles */}
      <div style={sectionStyle}>
        <div style={headingStyle}>{'\u26A0\uFE0F'} Still Struggling</div>
        {story.struggles.length === 0 ? (
          <div style={{ ...bodyStyle, fontStyle: 'italic' }}>No regressions — all clear!</div>
        ) : (
          <div style={{ ...bodyStyle, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {story.struggles.map((s: any) => (
              <div key={s.testId} style={{
                padding: '8px 12px',
                borderRadius: 6,
                background: '#f59e0b10',
                borderLeft: '3px solid #f59e0b',
              }}>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{s.testId}</span>
                {s.rootCause && (
                  <span style={tagStyle('#f59e0b')}>{s.rootCause}</span>
                )}
                {s.foundRound != null && (
                  <span style={{ fontSize: 11, color: 'var(--text-tertiary)', marginLeft: 6 }}>
                    found R{s.foundRound}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Learnings */}
      {story.learnings.length > 0 && (
        <div style={sectionStyle}>
          <div style={headingStyle}>{'\uD83D\uDCDD'} Lessons Learned</div>
          <div style={{ ...bodyStyle, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {story.learnings.map((l: any) => (
              <div key={l.id} style={{
                padding: '8px 12px',
                borderRadius: 6,
                background: 'var(--surface-hover)',
              }}>
                <div>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{l.id}</span>
                  <span style={tagStyle('var(--accent-blue)')}>{l.category}</span>
                </div>
                <div style={{ marginTop: 4 }}>{l.problem}</div>
                {l.solution && (
                  <div style={{ marginTop: 2, fontSize: 12, color: 'var(--text-tertiary)' }}>
                    Fix: {l.solution}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Step */}
      <div style={{ ...sectionStyle, borderColor: 'var(--accent-blue)30', background: 'var(--accent-blue)08' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-blue)' }}>
          {'\u23ED\uFE0F'} Next: {story.nextStep}
        </div>
      </div>
    </div>
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
              border: 'none', cursor: 'pointer',
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
                <td className="py-1.5 px-3 max-w-[220px] truncate" style={{ color: 'var(--text-secondary)' }} title={registry[d.testId]?.description || registry[d.testId]?.name || ''}>
                  {registry[d.testId]?.name || '-'}
                </td>
                <td className="py-1.5 px-3 font-mono" style={{ color: 'var(--text-secondary)' }}>C{d.foundRound}</td>
                <td className="py-1.5 px-3"><Badge variant={statusBadgeVariant(d.status)} size="xs">{d.status}</Badge></td>
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

  function toY(val: number): number { return PADDING.top + chartH - (val / maxVal) * chartH }

  function buildPath(accessor: (t: any) => number): string {
    return trends.map((t, i) => `${i === 0 ? 'M' : 'L'}${(PADDING.left + i * xStep).toFixed(1)},${toY(accessor(t)).toFixed(1)}`).join(' ')
  }

  function buildArea(accessor: (t: any) => number): string {
    const line = buildPath(accessor)
    const lastX = PADDING.left + (trends.length - 1) * xStep
    const baseY = PADDING.top + chartH
    return `${line} L${lastX.toFixed(1)},${baseY} L${PADDING.left},${baseY} Z`
  }

  const passedPath = buildPath(t => t.stats?.passed || 0)
  const failedPath = buildPath(t => t.stats?.failed || 0)
  const fixedPath = buildPath(t => t.stats?.fixed || 0)
  const passedArea = buildArea(t => t.stats?.passed || 0)
  const failedArea = buildArea(t => t.stats?.failed || 0)
  const yLabels = [0, Math.round(maxVal / 2), maxVal]

  return (
    <Card>
      <CardHeader
        title="Trends"
        subtitle={`Pass/Fail/Fixed across ${trends.length} cycles`}
        icon={<Activity className="w-4 h-4" style={{ color: 'var(--accent-green)' }} />}
      />
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" style={{ maxHeight: '200px' }} role="img" aria-label="Trend chart">
        {yLabels.map(v => (
          <g key={v}>
            <line x1={PADDING.left} y1={toY(v)} x2={WIDTH - PADDING.right} y2={toY(v)} stroke="var(--border-subtle)" strokeDasharray="3,3" strokeWidth="0.5" />
            <text x={PADDING.left - 5} y={toY(v) + 3} textAnchor="end" fontSize="9" fill="var(--text-tertiary)" fontFamily="JetBrains Mono, monospace">{v}</text>
          </g>
        ))}
        {trends.map((t, i) => {
          const show = trends.length <= 15 || i % Math.ceil(trends.length / 10) === 0 || i === trends.length - 1
          if (!show) return null
          return <text key={i} x={PADDING.left + i * xStep} y={HEIGHT - 5} textAnchor="middle" fontSize="9" fill="var(--text-tertiary)" fontFamily="JetBrains Mono, monospace">C{t.round}</text>
        })}
        <path d={passedArea} fill="var(--accent-green)" opacity="0.1" />
        <path d={failedArea} fill="var(--accent-red)" opacity="0.1" />
        <path d={passedPath} fill="none" stroke="var(--accent-green)" strokeWidth="2" />
        <path d={failedPath} fill="none" stroke="var(--accent-red)" strokeWidth="1.5" />
        <path d={fixedPath} fill="none" stroke="var(--accent-amber)" strokeWidth="1.5" strokeDasharray="4,2" />
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

// ============ Evolution Timeline ============

function EvolutionTimeline() {
  const { data: evolution } = useTestEvolution()
  const [expanded, setExpanded] = useState(false)

  if (!evolution || evolution.length === 0) return null

  const displayItems = expanded ? evolution : evolution.slice(-5)

  return (
    <Card>
      <CardHeader
        title="Framework Evolution"
        subtitle={`${evolution.length} milestones`}
        icon={<Milestone className="w-4 h-4" style={{ color: 'var(--accent-purple)' }} />}
      />
      <div className="relative pl-6 space-y-3 py-2">
        <div className="absolute left-[11px] top-2 bottom-2 w-[2px]" style={{ background: 'var(--border-subtle)' }} />
        {displayItems.map((entry: any, i: number) => (
          <div key={`${entry.timestamp || ''}-${entry.title || i}`} className="relative flex items-start gap-3">
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
                <span className="text-[12px] font-bold" style={{ color: 'var(--text-primary)' }}>{entry.title}</span>
                {entry.round && <Badge variant="secondary" size="xs">C{entry.round}</Badge>}
                {entry.category && (
                  <Badge variant={entry.category === 'fix' ? 'danger' : entry.category === 'feature' ? 'success' : 'primary'} size="xs">
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
          style={{ color: 'var(--accent-blue)', borderTop: '1px solid var(--border-subtle)', background: 'transparent', border: 'none', cursor: 'pointer' }}
        >
          {expanded ? 'Collapse' : `Show all (${evolution.length})`}
        </button>
      )}
    </Card>
  )
}

// ============ Feature Map Panel ============

interface FeatureMapEntry {
  title: string
  issueStatus: string
  freshness: 'fresh' | 'stale' | 'unknown'
  codeAnchors: { type: string; path: string; exists: boolean }[]
  criteria: unknown[]
  coverage: string
}

interface FeatureMapData {
  version: number
  lastUpdated: string
  features: Record<string, FeatureMapEntry>
  summary: {
    totalFeatures: number
    fresh: number
    stale: number
    unknown: number
    overallCoverage: string
  }
}

const FRESHNESS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  fresh:   { bg: 'rgba(52,211,153,0.15)', text: 'var(--accent-green)',  label: 'Fresh' },
  stale:   { bg: 'rgba(248,113,113,0.15)', text: 'var(--accent-red)',    label: 'Stale' },
  unknown: { bg: 'rgba(251,191,36,0.15)',  text: 'var(--accent-amber)',  label: 'Unknown' },
}

function FeatureMapPanel() {
  const { data, isLoading, error } = useFeatureMap()

  if (isLoading) return <Loading text="Loading feature map..." />
  if (error || !data) return (
    <EmptyState
      icon="\uD83D\uDDFA\uFE0F"
      title="No feature map"
      description={(error as any)?.message || 'Run feature-map generation first. Use /test-supervisor to scan features.'}
    />
  )

  const features = Object.entries(data.features)
  const { summary } = data

  return (
    <div className="space-y-3">
      {/* Summary bar */}
      <Card>
        <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {summary.totalFeatures} Features
          </span>
          <span style={{ fontSize: '11px', color: 'var(--accent-green)' }}>
            {summary.fresh} fresh
          </span>
          <span style={{ fontSize: '11px', color: 'var(--accent-red)' }}>
            {summary.stale} stale
          </span>
          <span style={{ fontSize: '11px', color: 'var(--accent-amber)' }}>
            {summary.unknown} unknown
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginLeft: 'auto' }}>
            Coverage: <strong style={{ color: 'var(--text-primary)' }}>{summary.overallCoverage}</strong>
          </span>
          <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>
            Updated: {new Date(data.lastUpdated).toLocaleString()}
          </span>
        </div>
      </Card>

      {/* Feature table */}
      <Card>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                {['Feature', 'Freshness', 'Tests', 'Coverage'].map(h => (
                  <th
                    key={h}
                    style={{
                      padding: '8px 12px',
                      textAlign: 'left',
                      fontWeight: 700,
                      color: 'var(--text-tertiary)',
                      fontSize: '10px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map(([id, entry]) => {
                const fr = FRESHNESS_COLORS[entry.freshness] || FRESHNESS_COLORS.unknown
                const anchorCount = entry.codeAnchors?.length || 0
                return (
                  <tr
                    key={id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover, rgba(255,255,255,0.03))')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* Feature */}
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                        {entry.title}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>
                        {id} · {entry.issueStatus}
                      </div>
                    </td>
                    {/* Freshness */}
                    <td style={{ padding: '10px 12px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          fontSize: '10px',
                          fontWeight: 700,
                          background: fr.bg,
                          color: fr.text,
                        }}
                      >
                        {fr.label}
                      </span>
                    </td>
                    {/* Tests (anchor count) */}
                    <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>
                      {anchorCount} anchor{anchorCount !== 1 ? 's' : ''}
                    </td>
                    {/* Coverage */}
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{
                        fontWeight: 700,
                        color: entry.coverage === '0%' ? 'var(--accent-red)' : 'var(--accent-green)',
                      }}>
                        {entry.coverage}
                      </span>
                    </td>
                  </tr>
                )
              })}
              {features.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '12px' }}>
                    <div style={{ marginBottom: '4px' }}>🗺️ No features mapped yet</div>
                    <div style={{ fontSize: '10px' }}>Run a scan cycle to populate the feature map</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ============ Main Page ============

type TabKey = 'overview' | 'story' | 'discoveries' | 'trends' | 'evolution' | 'feature-map'

const TAB_DEFS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'overview', label: 'Overview', icon: '\uD83D\uDCCA' },
  { key: 'story', label: 'Story', icon: '\uD83D\uDCD6' },
  { key: 'discoveries', label: 'Discoveries', icon: '\uD83D\uDD0D' },
  { key: 'trends', label: 'Trends', icon: '\uD83D\uDCC8' },
  { key: 'evolution', label: 'Evolution', icon: '\uD83E\uDDEC' },
  { key: 'feature-map', label: 'Feature Map', icon: '\uD83D\uDDFA\uFE0F' },
]

export default function TestLab() {
  useInjectKeyframes()

  const [activeTab, setActiveTab] = useState<TabKey>('overview')

  // New split-state hooks (primary data sources)
  const { data: pipeline } = useTestPipeline()
  const { data: supervisor } = useTestSupervisor()
  const { data: queues } = useTestQueues()
  const { data: stats } = useTestStats()
  const { data: runnerStatus } = useRunnerStatus()

  // Legacy hooks (fallback + tab data)
  const { data: state, isLoading: stateLoading } = useTestState()
  const { data: discoveries } = useTestDiscoveries()
  const { data: trends } = useTestTrends()
  const { data: registry } = useTestRegistry()
  const reg = registry || {}

  // Merge pipeline data with fallback to legacy state
  const pipelineData = useMemo(() => {
    if (pipeline) return pipeline
    if (!state) return null
    return {
      cycle: state.round || 0,
      maxCycles: state.maxRounds || 0,
      currentStage: state.phase || '',
      currentTest: state.currentTest || '',
      stages: state.roundJourney || {},
    }
  }, [pipeline, state])

  // Merge stats data with fallback
  const statsData = useMemo(() => {
    if (stats) return stats
    if (!state?.stats) return null
    return {
      cumulative: state.stats,
      cycleStats: state.stats,
    }
  }, [stats, state])

  // Merge queues data with fallback
  const queuesData = useMemo(() => {
    if (queues) return queues
    if (!state) return null
    return {
      testQueue: state.testQueue || [],
      fixQueue: state.fixQueue || [],
      verifyQueue: state.verifyQueue || [],
      regressionQueue: state.regressionQueue || [],
    }
  }, [queues, state])

  // Supervisor data (no fallback — new only)
  const supervisorData = supervisor || null

  if (stateLoading && !pipeline) return <Loading text="Loading test state..." />

  // Determine if registry is empty (cleared)
  const registryEmpty = reg && Object.keys(reg).length === 0

  // Show header + empty state when no data at all
  if (!state && !pipeline) {
    return (
      <div className="space-y-3">
        <TestLabHeader pipelineData={null} supervisorData={null} />
        <EmptyState
          icon={registryEmpty ? '\uD83D\uDDC3\uFE0F' : '\uD83E\uDDEA'}
          title={registryEmpty ? 'Registry cleared — ready for fresh scan' : 'No test data yet'}
          description={registryEmpty
            ? 'Test registry has been reset. Click Start above or run /test-supervisor to scan and generate new tests.'
            : 'Click Start in the header above or run /test-supervisor to begin testing'
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* 1. Header — compact one-line with supervisor status */}
      <TestLabHeader pipelineData={pipelineData} supervisorData={supervisorData} />

      {/* 2. Self-heal banner — only shown when event exists */}
      <SelfHealBanner selfHealEvent={supervisorData?.selfHealEvent} />

      {/* 3. Stage Pipeline — 6-stage horizontal flow */}
      <StagePipeline pipelineData={pipelineData} />

      {/* 4. Stats Bar — compact inline */}
      <StatsBar statsData={statsData} />

      {/* 5. Tab Bar */}
      <div className="flex gap-1 px-1" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        {TAB_DEFS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-bold transition-all"
            style={{
              color: activeTab === tab.key ? 'var(--accent-blue)' : 'var(--text-tertiary)',
              borderBottom: activeTab === tab.key ? '2px solid var(--accent-blue)' : '2px solid transparent',
              background: 'transparent',
              border: 'none',
              borderBottomWidth: '2px',
              borderBottomStyle: 'solid',
              borderBottomColor: activeTab === tab.key ? 'var(--accent-blue)' : 'transparent',
              cursor: 'pointer',
              marginBottom: '-1px',
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* 6. Tab Content */}
      <div style={{ animation: 'fadeIn 0.15s ease-out' }}>
        {activeTab === 'overview' && (
          <div className="space-y-3">
            <ActivityStream />
            <QueuesPanel queuesData={queuesData} registry={reg} />
          </div>
        )}

        {activeTab === 'story' && (
          <StoryNarrative />
        )}

        {activeTab === 'discoveries' && (
          <DiscoveryTable discoveries={discoveries} registry={reg} />
        )}

        {activeTab === 'trends' && (
          <TrendChart trends={trends || []} />
        )}

        {activeTab === 'evolution' && (
          <EvolutionTimeline />
        )}

        {activeTab === 'feature-map' && (
          <FeatureMapPanel />
        )}
      </div>
    </div>
  )
}

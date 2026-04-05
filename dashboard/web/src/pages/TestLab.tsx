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
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react'
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
  useTestPipeline,
  useTestSupervisor,
  useTestQueues,
  useTestStats,
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
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,500;0,9..40,700;0,9..40,800;1,9..40,400&display=swap');

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
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeInStagger {
  from { opacity: 0; transform: translateX(-6px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes stage-glow {
  0%, 100% {
    box-shadow: 0 0 20px var(--glow-color, rgba(107,163,232,0.12)),
                0 0 40px var(--glow-far, rgba(107,163,232,0.04)),
                inset 0 1px 0 rgba(255,255,255,0.03);
  }
  50% {
    box-shadow: 0 0 32px var(--glow-color, rgba(107,163,232,0.18)),
                0 0 64px var(--glow-far, rgba(107,163,232,0.07)),
                inset 0 1px 0 rgba(255,255,255,0.05);
  }
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-2px); }
}
@keyframes connector-flow {
  0%   { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}
@keyframes connector-dash {
  0%   { stroke-dashoffset: 12; }
  100% { stroke-dashoffset: 0; }
}
@keyframes connector-pulse {
  0%, 100% { opacity: 0.5; }
  50%      { opacity: 1; }
}
@keyframes shimmer-border {
  0%   { background-position: -300% 0; }
  100% { background-position: 300% 0; }
}
@keyframes pulse-ring {
  0%   { transform: scale(1); opacity: 0.6; }
  100% { transform: scale(2.2); opacity: 0; }
}
@keyframes countUp {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes rowReveal {
  from { opacity: 0; transform: translateX(-4px); }
  to   { opacity: 1; transform: translateX(0); }
}
.testlab-display { font-family: 'DM Sans', var(--font-display); }
.testlab-tab-active {
  background: var(--accent-blue-dim) !important;
  color: var(--accent-blue) !important;
  border-radius: 8px 8px 0 0;
}
.testlab-stat-value {
  animation: countUp 0.3s ease-out both;
}
.testlab-feature-row {
  transition: all 0.15s ease;
}
.testlab-feature-row:hover {
  background: var(--bg-hover, rgba(255,255,255,0.03)) !important;
  border-left: 2px solid var(--accent-blue);
  padding-left: 10px;
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
    backdropFilter: 'var(--glass-blur, blur(16px))',
    WebkitBackdropFilter: 'var(--glass-blur, blur(16px))',
    border: '1px solid var(--glass-border)',
    boxShadow: '0 1px 2px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.02)',
    ...extra,
  }
}

function glassCardStyle(extra?: CSSProperties): CSSProperties {
  return glassStyle({
    borderRadius: 'var(--radius-lg, 14px)',
    padding: '16px 18px',
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
          <span className="font-bold font-mono testlab-display" style={{ fontSize: '19px', color: 'var(--text-primary)', whiteSpace: 'nowrap', letterSpacing: '-0.6px', fontWeight: 800 }}>
            Cycle {cycle}/{maxCycles}
          </span>

          {/* Stage badge */}
          {currentStage && currentStage !== 'COMPLETE' ? (
            <span
              className="text-[10px] font-bold font-mono px-2.5 py-1 rounded"
              style={{
                color: isActive ? stageColor : 'var(--text-tertiary)',
                background: isActive
                  ? `color-mix(in srgb, ${stageColor} 15%, transparent)`
                  : 'var(--bg-inset)',
                border: `1px solid ${isActive ? `color-mix(in srgb, ${stageColor} 30%, transparent)` : 'var(--border-subtle)'}`,
                whiteSpace: 'nowrap',
              }}
            >
              {isActive ? `${STAGE_ICONS[currentStage.toUpperCase()] || ''} ${currentStage.toUpperCase()}` : `next → ${currentStage.toUpperCase()}`}
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
          {/* Status indicator — idle: gray dot, running: green dot with pulse ring */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '16px', height: '16px', flexShrink: 0 }}>
            {isActive && (
              <div style={{
                position: 'absolute',
                width: '10px', height: '10px',
                borderRadius: '50%',
                border: `2px solid ${isWaiting ? 'var(--accent-purple)' : isExternal ? 'var(--accent-amber)' : 'var(--accent-green)'}`,
                animation: 'pulse-ring 1.5s ease-out infinite',
              }} />
            )}
            <div
              className="rounded-full"
              style={{
                width: '8px', height: '8px',
                background: isRunning ? 'var(--accent-green)' :
                  isWaiting ? 'var(--accent-purple)' :
                  isExternal ? 'var(--accent-amber)' :
                  status === 'paused' ? 'var(--accent-amber)' : 'var(--text-tertiary)',
                boxShadow: isActive ? `0 0 6px ${isWaiting ? 'var(--accent-purple)' : isExternal ? 'var(--accent-amber)' : 'var(--accent-green)'}` : 'none',
                animation: isWaiting ? 'blink 1.5s ease-in-out infinite' : isExternal ? 'blink 2s ease-in-out infinite' : 'none',
                position: 'relative',
                zIndex: 1,
              }}
            />
          </div>
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
                title="Start test cycle — click to choose single run or loop mode"
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
                      title="Run one full scan-generate-test-validate-fix-verify cycle"
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

// ============ Stage Pipeline (Vertical Sidebar) ============

function StagePipeline({ pipelineData }: { pipelineData: any }) {
  const stages = pipelineData?.stages || {}
  const currentStage = (pipelineData?.currentStage || '').toUpperCase()
  const currentTest = pipelineData?.currentTest || ''
  const pipelineRunning = pipelineData?.pipelineStatus === 'running'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      {STAGES.map((stage, i) => {
        const stageData = stages[stage] || {}
        // Only treat as running if pipeline is actually running AND this is the current stage
        const status = stageData.status || (stage === currentStage && pipelineRunning ? 'running' : 'pending')
        const isDone = status === 'done' || status === 'completed'
        const isActive = (status === 'running' || status === 'in-progress') && pipelineRunning
        const isNext = !isDone && !isActive && stage === currentStage && !pipelineRunning
        const isPending = !isDone && !isActive && !isNext
        const stageCol = stageColorOf(stage)
        const summary = stageData.summary || ''

        // Glow vars for active
        const glowVars: Record<string, string> = {}
        if (isActive && !isDone) {
          const glowMap: Record<string, [string, string]> = {
            SCAN: ['rgba(107,163,232,0.16)', 'rgba(107,163,232,0.06)'],
            GENERATE: ['rgba(158,140,199,0.16)', 'rgba(158,140,199,0.06)'],
            TEST: ['rgba(212,164,74,0.16)', 'rgba(212,164,74,0.06)'],
            VALIDATE: ['rgba(34,211,238,0.16)', 'rgba(34,211,238,0.06)'],
            FIX: ['rgba(212,164,74,0.16)', 'rgba(212,164,74,0.06)'],
            VERIFY: ['rgba(92,191,138,0.16)', 'rgba(92,191,138,0.06)'],
          }
          const [gc, gf] = glowMap[stage] || glowMap.SCAN
          glowVars['--glow-color'] = gc
          glowVars['--glow-far'] = gf
        }

        return (
          <React.Fragment key={stage}>
            {/* Stage row — compact horizontal */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 10px',
                borderRadius: '10px',
                border: `1px solid ${isDone ? 'rgba(92,191,138,0.12)' : isActive ? `color-mix(in srgb, ${stageCol} 25%, transparent)` : isNext ? `color-mix(in srgb, ${stageCol} 15%, transparent)` : 'var(--border-subtle)'}`,
                background: isDone ? 'rgba(92,191,138,0.03)'
                  : isActive ? `linear-gradient(135deg, color-mix(in srgb, ${stageCol} 6%, transparent) 0%, var(--bg-inset) 100%)`
                  : isNext ? `color-mix(in srgb, ${stageCol} 3%, var(--bg-inset))`
                  : 'var(--bg-inset)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                animation: isActive && !isDone ? 'stage-glow 2.8s ease-in-out infinite' : 'none',
                opacity: isPending ? 0.4 : isNext ? 0.7 : 1,
                ...glowVars as any,
              }}
              title={summary || `${stage}: ${status}`}
            >
              {/* Icon */}
              <span style={{
                fontSize: '16px',
                lineHeight: 1,
                flexShrink: 0,
                animation: isActive && !isDone ? 'float 2.2s ease-in-out infinite' : 'none',
              }}>
                {STAGE_ICONS[stage]}
              </span>

              {/* Name + status */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="font-mono" style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase' as const,
                  color: isDone ? 'var(--text-secondary)' : isActive ? 'var(--text-primary)' : isNext ? stageCol : 'var(--text-tertiary)',
                  whiteSpace: 'nowrap',
                }}>
                  {stage}
                </div>
                {summary && (
                  <div className="font-mono" style={{
                    fontSize: '9px',
                    color: 'var(--text-tertiary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }} title={summary}>
                    {summary}
                  </div>
                )}
              </div>

              {/* Status indicator */}
              <div style={{ flexShrink: 0 }}>
                {isDone && <span style={{ color: 'var(--accent-green)', fontSize: '10px', fontWeight: 600 }}>✓</span>}
                {isActive && !isDone && (
                  <span style={{
                    display: 'inline-block',
                    width: '8px', height: '8px',
                    border: `2px solid color-mix(in srgb, ${stageCol} 18%, transparent)`,
                    borderTopColor: stageCol,
                    borderRadius: '50%',
                    animation: 'spin 0.75s linear infinite',
                  }} />
                )}
                {isNext && <span style={{ color: stageCol, fontSize: '10px' }}>⏸</span>}
                {isPending && <span style={{ color: 'var(--text-tertiary)', fontSize: '10px' }}>—</span>}
              </div>
            </div>

            {/* Vertical connector line between stages */}
            {i < STAGES.length - 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                height: '8px',
                position: 'relative',
              }}>
                <div style={{
                  width: isDone ? '2px' : '1px',
                  height: '100%',
                  background: isDone ? 'var(--accent-green)' : isActive ? stageCol : 'var(--border-subtle)',
                  opacity: isDone ? 0.5 : isActive ? 0.6 : 0.3,
                  transition: 'all 0.4s',
                }} />
              </div>
            )}
          </React.Fragment>
        )
      })}

      {/* Current test indicator */}
      {currentTest && (
        <div className="flex items-center gap-2 mt-1 pt-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <span className="text-[9px] font-mono" style={{ color: 'var(--text-tertiary)' }}>Running:</span>
          <span className="text-[10px] font-mono font-bold truncate"
            style={{ color: 'var(--accent-blue)' }}>
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

  const totalSum = (cumulative.passed || 0) + (cumulative.failed || 0) + (cumulative.fixed || 0) + (cumulative.skipped || 0)
  const cycleSum = (cycleStats.passed || 0) + (cycleStats.failed || 0) + (cycleStats.fixed || 0) + (cycleStats.skipped || 0)
  const allZero = totalSum === 0 && cycleSum === 0

  if (allZero) {
    return (
      <div style={{ textAlign: 'center' }}>
        <span className="text-[10px]" style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>No results yet</span>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {/* Total stats */}
      <div>
        <span className="text-[9px] font-mono font-bold" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.08em' }}>TOTAL</span>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginTop: '4px' }}>
          <StatItem icon={<CheckCircle className="w-3 h-3" />} color="var(--accent-green)" value={cumulative.passed || 0} label="pass" />
          <StatItem icon={<XCircle className="w-3 h-3" />} color="var(--accent-red)" value={cumulative.failed || 0} label="fail" />
          <StatItem icon={<Wrench className="w-3 h-3" />} color="var(--accent-amber)" value={cumulative.fixed || 0} label="fix" />
          <StatItem icon={<SkipForward className="w-3 h-3" />} color="var(--accent-purple)" value={cumulative.skipped || 0} label="skip" />
        </div>
      </div>

      {cycleSum > 0 && (
        <>
          <div style={{ borderTop: '1px solid var(--border-subtle)' }} />
          <div>
            <span className="text-[9px] font-mono font-bold" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.08em' }}>CYCLE</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginTop: '4px' }}>
              <StatItem icon={<CheckCircle className="w-3 h-3" />} color="var(--accent-green)" value={cycleStats.passed || 0} label="pass" />
              <StatItem icon={<XCircle className="w-3 h-3" />} color="var(--accent-red)" value={cycleStats.failed || 0} label="fail" />
              <StatItem icon={<Wrench className="w-3 h-3" />} color="var(--accent-amber)" value={cycleStats.fixed || 0} label="fix" />
              <StatItem icon={<SkipForward className="w-3 h-3" />} color="var(--accent-purple)" value={cycleStats.skipped || 0} label="skip" />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function StatItem({ icon, color, value, label }: { icon: React.ReactNode; color: string; value: number; label: string }) {
  return (
    <div className="flex items-center gap-1" style={{ color }}>
      {icon}
      <span className="text-[13px] font-mono font-bold testlab-stat-value" key={value}>{value}</span>
      <span className="text-[10px]" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.02em' }}>{label}</span>
    </div>
  )
}

// ============ Queues Panel ============

function QueuesPanel({ queuesData, registry }: { queuesData: any; registry: Record<string, any> }) {
  const [expandedQueue, setExpandedQueue] = useState<string | null>(null)

  const queueDefs: { key: string; label: string; color: string }[] = [
    { key: 'testQueue', label: 'TEST', color: 'var(--accent-blue)' },
    { key: 'fixQueue', label: 'FIX', color: 'var(--accent-red)' },
    { key: 'verifyQueue', label: 'VERIFY', color: 'var(--accent-green)' },
    { key: 'regressionQueue', label: 'REGRESS', color: 'var(--accent-amber)' },
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
      <div style={glassCardStyle({ padding: 0 })}>
        <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: 'none' }}>
          <span style={{ fontSize: '12px' }}>📦</span>
          <span className="text-[11px] font-bold testlab-display" style={{ color: 'var(--text-primary)', letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>Queues</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-3 justify-center">
          <CheckCircle className="w-3.5 h-3.5" style={{ color: 'var(--accent-green)' }} />
          <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>All queues empty</span>
        </div>
      </div>
    )
  }

  return (
    <div style={glassCardStyle({ padding: 0 })}>
      <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <span style={{ fontSize: '12px' }}>📦</span>
        <span className="text-[11px] font-bold testlab-display" style={{ color: 'var(--text-primary)', letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>Queues</span>
      </div>
      <div style={{ padding: '4px 0' }}>
        {/* All queues — show even empty ones as dim */}
        {queueDefs.map(q => {
          const items = queuesData?.[q.key] || []
          const count = Array.isArray(items) ? items.length : 0
          const isExpanded = expandedQueue === q.key

          return (
            <div key={q.key}>
              <button
                onClick={() => count > 0 ? setExpandedQueue(isExpanded ? null : q.key) : undefined}
                className="w-full flex items-center gap-2 px-3 py-1.5 transition-all"
                style={{
                  background: 'transparent', border: 'none',
                  cursor: count > 0 ? 'pointer' : 'default',
                  opacity: count === 0 ? 0.4 : 1,
                }}
              >
                {/* Color bar */}
                <div style={{
                  width: '3px', height: '16px', borderRadius: '2px',
                  background: q.color, flexShrink: 0,
                }} />
                <span className="text-[11px] font-bold font-mono" style={{ color: count > 0 ? 'var(--text-primary)' : 'var(--text-tertiary)', flex: 1, textAlign: 'left' }}>
                  {q.label}
                </span>
                {/* Count badge */}
                {count > 0 && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    minWidth: '22px', height: '18px', borderRadius: '9px',
                    fontSize: '10px', fontWeight: 700, fontFamily: 'var(--font-mono)',
                    background: `color-mix(in srgb, ${q.color} 18%, transparent)`,
                    color: q.color,
                  }}>
                    {count}
                  </span>
                )}
              </button>
              {/* Expanded items */}
              {isExpanded && count > 0 && (
                <div className="px-3 pb-2 space-y-1 max-h-[120px] overflow-y-auto" style={{ animation: 'fadeIn 0.12s ease-out', marginLeft: '12px' }}>
                  {items.map((item: any, idx: number) => (
                    <div key={item.testId || idx} className="text-[10px] font-mono px-2 py-0.5 rounded truncate"
                      style={{ background: 'var(--bg-inset)', color: 'var(--text-secondary)' }}>
                      {item.testId}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ============ Reasoning Narrative ============

const REASONING_STEPS = [
  { key: 'observe', icon: '👁', label: 'OBSERVE', color: 'var(--accent-blue)' },
  { key: 'diagnose', icon: '🔬', label: 'DIAGNOSE', color: 'var(--accent-purple)' },
  { key: 'decide', icon: '🧠', label: 'DECIDE', color: 'var(--accent-amber)' },
  { key: 'act', icon: '⚡', label: 'ACT', color: 'var(--accent-green)' },
  { key: 'reflect', icon: '💬', label: 'REFLECT', color: 'var(--accent-cyan, #5ec4d4)' },
] as const

function ReasoningNarrative({ supervisorData }: { supervisorData: any }) {
  const [collapsed, setCollapsed] = useState(false)
  const reasoning = supervisorData?.reasoning || {}
  const currentStep = supervisorData?.step || null
  const isActive = supervisorData?.status === 'running'
  const hasContent = Object.keys(reasoning).length > 0

  // Find the index of the current step for the progress line
  const currentStepIdx = REASONING_STEPS.findIndex(s => s.key === currentStep)

  return (
    <div style={{
      ...glassCardStyle({ padding: 0 }),
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer' }}
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-2">
          <span style={{ fontSize: '14px' }}>{isActive ? '🧠' : '💤'}</span>
          <span className="text-[11px] font-bold testlab-display" style={{
            color: 'var(--text-primary)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase' as const,
          }}>
            Reasoning Narrative
          </span>
          {isActive && currentStep && (
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded" style={{
              color: REASONING_STEPS[currentStepIdx]?.color || 'var(--text-tertiary)',
              background: `color-mix(in srgb, ${REASONING_STEPS[currentStepIdx]?.color || 'var(--text-tertiary)'} 12%, transparent)`,
            }}>
              {currentStep}
            </span>
          )}
        </div>
        <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
          {collapsed ? 'expand' : 'collapse'}
        </span>
      </div>

      {/* Content */}
      {!collapsed && (
        <div style={{ padding: '12px 16px', position: 'relative' }}>
          {!hasContent && !isActive ? (
            <div className="flex items-center gap-3 py-4" style={{ justifyContent: 'center' }}>
              <span style={{ fontSize: '16px', opacity: 0.3 }}>🧠</span>
              <span className="text-[11px]" style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                Waiting for supervisor to start reasoning…
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', position: 'relative' }}>
              {/* Vertical progress line */}
              <div style={{
                position: 'absolute',
                left: '9px',
                top: '12px',
                bottom: '12px',
                width: '2px',
                background: 'var(--border-subtle)',
                borderRadius: '1px',
              }} />
              {/* Progress fill */}
              {currentStepIdx >= 0 && (
                <div style={{
                  position: 'absolute',
                  left: '9px',
                  top: '12px',
                  height: `${Math.min(100, ((currentStepIdx + 1) / REASONING_STEPS.length) * 100)}%`,
                  width: '2px',
                  background: 'var(--accent-green)',
                  borderRadius: '1px',
                  transition: 'height 0.5s ease',
                }} />
              )}

              {REASONING_STEPS.map((step, idx) => {
                const text = reasoning[step.key] || null
                const isCurrentStep = step.key === currentStep
                const isDone = currentStepIdx > idx || (text && !isCurrentStep)
                const isPending = !isDone && !isCurrentStep

                return (
                  <div key={step.key} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '6px 0 6px 24px',
                    position: 'relative',
                    opacity: isPending ? 0.35 : 1,
                    transition: 'opacity 0.3s',
                  }}>
                    {/* Step dot */}
                    <div style={{
                      position: 'absolute',
                      left: '4px',
                      top: '10px',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: isDone ? 'var(--accent-green)' : isCurrentStep ? step.color : 'var(--bg-inset)',
                      border: `2px solid ${isDone ? 'var(--accent-green)' : isCurrentStep ? step.color : 'var(--border-subtle)'}`,
                      transition: 'all 0.3s',
                      boxShadow: isCurrentStep ? `0 0 8px color-mix(in srgb, ${step.color} 30%, transparent)` : 'none',
                    }}>
                      {isCurrentStep && (
                        <div style={{
                          position: 'absolute',
                          inset: '-4px',
                          borderRadius: '50%',
                          border: `2px solid ${step.color}`,
                          animation: 'pulse-ring 1.5s ease-out infinite',
                        }} />
                      )}
                    </div>

                    {/* Content */}
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize: '11px' }}>{step.icon}</span>
                        <span className="font-mono text-[10px] font-bold" style={{
                          color: isDone ? 'var(--text-secondary)' : isCurrentStep ? step.color : 'var(--text-tertiary)',
                          letterSpacing: '0.05em',
                        }}>
                          {step.label}
                        </span>
                      </div>
                      {text && (
                        <div className="font-mono text-[11px] mt-1" style={{
                          color: 'var(--text-primary)',
                          lineHeight: 1.5,
                        }}>
                          {text}
                        </div>
                      )}
                      {isCurrentStep && !text && (
                        <div className="flex items-center gap-2 mt-1">
                          <span style={{
                            display: 'inline-block', width: '8px', height: '8px',
                            border: `2px solid color-mix(in srgb, ${step.color} 20%, transparent)`,
                            borderTopColor: step.color, borderRadius: '50%',
                            animation: 'spin 0.75s linear infinite',
                          }} />
                          <span className="text-[10px]" style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                            Processing…
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ============ Current Test Panel ============

function CurrentTestPanel({ pipelineData }: { pipelineData: any }) {
  const currentTest = pipelineData?.currentTest || ''

  return (
    <div style={{
      ...glassCardStyle({ padding: 0 }),
      overflow: 'hidden',
      flex: 1,
    }}>
      <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: currentTest ? '1px solid var(--border-subtle)' : 'none' }}>
        <span style={{ fontSize: '12px' }}>⚙️</span>
        <span className="text-[11px] font-bold testlab-display" style={{
          color: 'var(--text-primary)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase' as const,
        }}>Current Test</span>
      </div>
      <div className="px-3 py-2">
        {currentTest ? (
          <div className="font-mono text-[11px] font-bold" style={{ color: 'var(--accent-blue)' }}>
            {currentTest}
          </div>
        ) : (
          <span className="text-[10px]" style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
            No test running
          </span>
        )}
      </div>
    </div>
  )
}

// ============ Stage Progress Panel ============
// Replaces generic Activity Stream with stage-aware progress display

function StageProgressPanel({ pipelineData }: { pipelineData: any }) {
  const stages = pipelineData?.stages || {}
  const currentStage = (pipelineData?.currentStage || '').toUpperCase()
  const stageProgress = pipelineData?.stageProgress || null
  const currentTest = pipelineData?.currentTest || ''

  // Build timeline: completed stages + current progress
  const completedStages = STAGES.filter(s => {
    const d = stages[s]
    return d && (d.status === 'done' || d.status === 'completed')
  })
  const isActive = STAGES.some(s => s === currentStage && (stages[s]?.status === 'running' || stages[s]?.status === 'in-progress'))
  const pipelineIdle = pipelineData?.pipelineStatus === 'idle' || !pipelineData?.pipelineStatus

  return (
    <div style={{
      ...glassCardStyle({ padding: 0 }),
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <Activity className="w-3.5 h-3.5" style={{ color: 'var(--accent-amber)' }} />
        <span className="text-[11px] font-bold testlab-display" style={{
          color: 'var(--text-primary)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase' as const,
        }}>Stage Progress</span>
      </div>

      <div style={{ padding: '8px 0', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
        {/* No activity yet */}
        {completedStages.length === 0 && !isActive && (
          <div className="flex items-center gap-2 px-4 py-4 justify-center">
            <span style={{ fontSize: '14px', opacity: 0.3 }}>📡</span>
            <span className="text-[10px]" style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
              Waiting for pipeline to start…
            </span>
          </div>
        )}

        {/* Completed stages — summary lines */}
        {completedStages.map(stage => {
          const d = stages[stage]
          const color = stageColorOf(stage)
          const duration = d.duration_ms ? `${(d.duration_ms / 1000).toFixed(1)}s` : ''
          return (
            <div key={stage} className="flex items-center gap-2 px-4 py-1.5" style={{
              borderBottom: '1px solid var(--border-subtle)',
              animation: 'fadeIn 0.2s ease-out',
            }}>
              <span style={{ color: 'var(--accent-green)', fontSize: '10px', width: '14px', textAlign: 'center' }}>✓</span>
              <span style={{
                fontSize: '9px', fontWeight: 700, padding: '1px 5px', borderRadius: '4px',
                color, background: `color-mix(in srgb, ${color} 12%, transparent)`,
                width: '48px', textAlign: 'center',
              }}>
                {stage}
              </span>
              <span style={{ color: 'var(--text-secondary)', flex: 1 }}>
                {d.summary || 'Done'}
              </span>
              {duration && (
                <span style={{ color: 'var(--text-tertiary)', fontSize: '10px', flexShrink: 0 }}>
                  {duration}
                </span>
              )}
            </div>
          )
        })}

        {/* Current stage — live progress */}
        {isActive && currentStage && (
          <div style={{
            padding: '8px 14px',
            background: `color-mix(in srgb, ${stageColorOf(currentStage)} 4%, transparent)`,
            borderLeft: `3px solid ${stageColorOf(currentStage)}`,
            animation: 'fadeIn 0.2s ease-out',
          }}>
            {/* Stage header with spinner */}
            <div className="flex items-center gap-2 mb-1">
              <span style={{
                display: 'inline-block', width: '10px', height: '10px',
                border: `2px solid color-mix(in srgb, ${stageColorOf(currentStage)} 20%, transparent)`,
                borderTopColor: stageColorOf(currentStage),
                borderRadius: '50%', animation: 'spin 0.75s linear infinite',
              }} />
              <span style={{
                fontSize: '10px', fontWeight: 700, color: stageColorOf(currentStage),
                letterSpacing: '0.05em',
              }}>
                {currentStage}
              </span>
              {stageProgress && (
                <span style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>
                  {stageProgress.current}/{stageProgress.total}
                </span>
              )}
            </div>

            {/* Progress bar (when we have current/total) */}
            {stageProgress?.total > 0 && (
              <div style={{
                height: '3px', borderRadius: '2px', background: 'var(--bg-inset)',
                marginBottom: '6px', overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', borderRadius: '2px',
                  width: `${Math.round((stageProgress.current / stageProgress.total) * 100)}%`,
                  background: stageColorOf(currentStage),
                  transition: 'width 0.5s ease',
                }} />
              </div>
            )}

            {/* Current item description */}
            {currentTest && (
              <div style={{ color: 'var(--text-primary)', fontSize: '11px', fontWeight: 500 }}>
                {STAGE_ICONS[currentStage]} {stageProgressDescription(currentStage, currentTest, stageProgress)}
              </div>
            )}

            {/* Stage-specific context */}
            {!currentTest && currentStage === 'SCAN' && (
              <div style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>
                Scanning issues, specs, and code anchors for test gaps…
              </div>
            )}
            {!currentTest && currentStage === 'GENERATE' && (
              <div style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>
                Generating test YAMLs from discovered gaps…
              </div>
            )}
          </div>
        )}

        {/* Idle with pending next stage — show stop reason */}
        {!isActive && pipelineIdle && currentStage && currentStage !== 'COMPLETE' && completedStages.length > 0 && (() => {
          const stopReason = pipelineData?.stopReason || null
          const stopDetail = pipelineData?.stopDetail || null

          // Map stopReason to user-friendly display
          const reasonMap: Record<string, { icon: string; label: string; color: string }> = {
            queue_handoff: { icon: '📋', label: 'Queue handoff', color: 'var(--accent-blue)' },
            circuit_breaker: { icon: '🚨', label: 'Circuit breaker', color: 'var(--accent-red)' },
            cycle_complete: { icon: '✅', label: 'Cycle complete', color: 'var(--accent-green)' },
            context_limit: { icon: '⚠️', label: 'Context limit', color: 'var(--accent-amber)' },
          }
          const reason = stopReason ? (reasonMap[stopReason] || { icon: '💤', label: stopReason, color: 'var(--text-tertiary)' }) : null

          return (
            <div style={{
              padding: '10px 14px',
              borderLeft: `3px solid ${reason?.color || 'var(--border-subtle)'}`,
              background: reason ? `color-mix(in srgb, ${reason.color} 4%, transparent)` : 'transparent',
            }}>
              <div className="flex items-center gap-2" style={{ marginBottom: stopDetail ? '4px' : 0 }}>
                <span style={{ fontSize: '12px' }}>{reason?.icon || '💤'}</span>
                <span style={{ fontSize: '11px', fontWeight: 600, color: reason?.color || 'var(--text-tertiary)' }}>
                  {reason?.label || 'Paused'}
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>
                  — next: <strong style={{ color: 'var(--text-secondary)' }}>{currentStage}</strong>
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginLeft: 'auto' }}>
                  Click Start ▶
                </span>
              </div>
              {stopDetail && (
                <div className="font-mono" style={{ fontSize: '10px', color: 'var(--text-secondary)', paddingLeft: '22px' }}>
                  {stopDetail}
                </div>
              )}
            </div>
          )
        })()}
      </div>
    </div>
  )
}

/** Generate human-readable description for current stage progress */
function stageProgressDescription(stage: string, testId: string, progress: any): string {
  const idx = progress?.current || '?'
  const total = progress?.total || '?'
  switch (stage) {
    case 'SCAN': return `Scanning: ${testId}`
    case 'GENERATE': return `Generating test ${idx}/${total}: ${testId}`
    case 'TEST': return `Running test ${idx}/${total}: ${testId}`
    case 'VALIDATE': return `Validating ${idx}/${total}: ${testId}`
    case 'FIX': return `Fixing ${idx}/${total}: ${testId}`
    case 'VERIFY': return `Verifying ${idx}/${total}: ${testId}`
    default: return testId
  }
}

// ============ Activity Stream (compact log) ============

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
    <div style={{
      ...glassCardStyle({ padding: 0 }),
      overflow: 'hidden',
    }}>
      {/* Compact header */}
      <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5" style={{ color: 'var(--accent-amber)' }} />
          <span className="text-[11px] font-bold testlab-display" style={{ color: 'var(--text-primary)' }}>Activity</span>
          <span className="text-[10px] font-mono" style={{ color: 'var(--text-tertiary)' }}>{events.length}</span>
        </div>
        {events.length > 0 && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] transition-colors"
            style={{ color: 'var(--text-tertiary)', background: 'transparent', border: 'none', cursor: 'pointer' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-secondary)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)' }}
            title="Clear"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Event log — monospace terminal style */}
      <div ref={containerRef} className="overflow-y-auto" style={{ maxHeight: '280px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-1">
            <span style={{ fontSize: '16px', opacity: 0.3 }}>📡</span>
            <span className="text-[10px]" style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>Listening…</span>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {events.map((evt, i) => {
                const formatted = formatActivityMessage(evt)
                return (
                  <tr
                    key={`${evt.timestamp}-${evt.type}-${i}`}
                    style={{
                      borderBottom: i < events.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                  >
                    {/* Time — fixed width */}
                    <td style={{ padding: '4px 6px', color: 'var(--text-tertiary)', whiteSpace: 'nowrap', width: '60px', fontSize: '10px' }}>
                      {formatTime(evt.timestamp)}
                    </td>
                    {/* Phase badge — fixed width */}
                    <td style={{ padding: '4px 2px', width: '42px' }}>
                      {evt.phase ? (
                        <span style={{
                          fontSize: '9px',
                          fontWeight: 700,
                          padding: '1px 4px',
                          borderRadius: '4px',
                          color: stageColorOf(evt.phase),
                          background: `color-mix(in srgb, ${stageColorOf(evt.phase)} 12%, transparent)`,
                        }}>
                          {evt.phase.toUpperCase().slice(0, 4)}
                        </span>
                      ) : (
                        <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>{eventIcon(evt.type)}</span>
                      )}
                    </td>
                    {/* Message + detail — fill remaining */}
                    <td style={{ padding: '4px 6px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 0 }}>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{formatted.message}</span>
                      {formatted.detail && (
                        <span style={{ color: 'var(--text-tertiary)', marginLeft: '6px' }}>{formatted.detail}</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
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
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null)

  if (isLoading) return <Loading text="Loading feature map..." />
  if (error || !data) return (
    <div style={glassCardStyle({ padding: '28px 32px' })}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        <span style={{ fontSize: '28px', lineHeight: 1, flexShrink: 0 }}>{'\uD83D\uDDFA\uFE0F'}</span>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
            No feature map yet
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            {(error as any)?.message || 'The feature map is generated during scan cycles.'}
          </div>
          <div style={{
            fontSize: '11px',
            color: 'var(--text-tertiary)',
            padding: '8px 12px',
            borderRadius: '8px',
            background: 'var(--bg-inset)',
            border: '1px solid var(--border-subtle)',
          }}>
            Run <code style={{ color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)' }}>/test-supervisor run</code> to scan features and generate the map.
          </div>
        </div>
      </div>
    </div>
  )

  const features = Object.entries(data.features)
  const { summary } = data

  // Parse coverage percentage for progress bar
  function parseCoveragePercent(coverage: string): number {
    const match = coverage.match(/(\d+)/)
    return match ? parseInt(match[1], 10) : 0
  }

  return (
    <div className="space-y-2">
      {/* Summary bar */}
      <Card>
        <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <span className="testlab-display" style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>
            {summary.totalFeatures} Features
          </span>
          <div style={{ width: '1px', height: '14px', background: 'var(--border-subtle)' }} />
          {[
            { count: summary.fresh, color: 'var(--accent-green)', label: 'fresh', dimColor: 'var(--accent-green-dim)' },
            { count: summary.stale, color: 'var(--accent-red)', label: 'stale', dimColor: 'var(--accent-red-dim)' },
            { count: summary.unknown, color: 'var(--accent-amber)', label: 'unknown', dimColor: 'var(--accent-amber-dim)' },
          ].map(item => (
            <span key={item.label} style={{
              fontSize: '11px', fontWeight: 600, color: item.color,
              padding: '1px 8px', borderRadius: '6px',
              background: item.dimColor,
            }}>
              {item.count} {item.label}
            </span>
          ))}
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
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '50%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '20%' }} />
            </colgroup>
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
              {features.map(([id, entry]: [string, any]) => {
                const fr = FRESHNESS_COLORS[entry.freshness] || FRESHNESS_COLORS.unknown
                const anchorCount = entry.codeAnchors?.length || 0
                const coveragePercent = parseCoveragePercent(entry.coverage)
                const isExpanded = expandedFeature === id
                const coverageColor = coveragePercent === 0 ? 'var(--accent-red)' : coveragePercent >= 80 ? 'var(--accent-green)' : coveragePercent >= 50 ? 'var(--accent-amber)' : 'var(--accent-red)'

                return (
                  <React.Fragment key={id}>
                    <tr
                      className="testlab-feature-row"
                      style={{
                        borderBottom: isExpanded ? 'none' : '1px solid var(--border-subtle)',
                        cursor: (entry.criteria?.length || 0) > 0 ? 'pointer' : 'default',
                        borderLeft: '2px solid transparent',
                        animation: `rowReveal 0.2s ease-out ${0.03 * features.indexOf(features.find(f => f[0] === id)!)}s both`,
                      }}
                      onClick={() => {
                        if ((entry.criteria?.length || 0) > 0) setExpandedFeature(isExpanded ? null : id)
                      }}
                    >
                      {/* Feature */}
                      <td style={{ padding: '8px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {(entry.criteria?.length || 0) > 0 && (
                            <span style={{ color: 'var(--text-tertiary)', fontSize: '10px', flexShrink: 0 }}>
                              {isExpanded ? '\u25BC' : '\u25B6'}
                            </span>
                          )}
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {entry.title}
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {id} · {entry.issueStatus}
                            </div>
                          </div>
                        </div>
                      </td>
                      {/* Freshness */}
                      <td style={{ padding: '8px 12px' }}>
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
                      <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>
                        {anchorCount} anchor{anchorCount !== 1 ? 's' : ''}
                      </td>
                      {/* Coverage — progress bar */}
                      <td style={{ padding: '8px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            flex: 1,
                            height: '6px',
                            borderRadius: '3px',
                            background: 'var(--bg-inset)',
                            overflow: 'hidden',
                            minWidth: '40px',
                          }}>
                            <div style={{
                              height: '100%',
                              width: `${coveragePercent}%`,
                              borderRadius: '3px',
                              background: coverageColor,
                              transition: 'width 0.3s ease',
                            }} />
                          </div>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            fontFamily: 'var(--font-mono)',
                            color: coverageColor,
                            minWidth: '32px',
                            textAlign: 'right',
                          }}>
                            {entry.coverage}
                          </span>
                        </div>
                      </td>
                    </tr>
                    {/* Expanded row: criteria details */}
                    {isExpanded && (entry.criteria?.length || 0) > 0 && (
                      <tr>
                        <td colSpan={4} style={{ padding: '0 12px 10px 40px', borderBottom: '1px solid var(--border-subtle)' }}>
                          <div style={{
                            background: 'var(--bg-inset)',
                            borderRadius: '8px',
                            padding: '8px 12px',
                            animation: 'fadeIn 0.15s ease-out',
                          }}>
                            <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                              Acceptance Criteria
                            </div>
                            {(entry.criteria as any[]).map((ac: any, idx: number) => (
                              <div key={ac.testId || idx} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '4px 0',
                                borderBottom: idx < (entry.criteria as any[]).length - 1 ? '1px solid var(--border-subtle)' : 'none',
                                fontSize: '11px',
                              }}>
                                <span className="font-mono" style={{ color: 'var(--accent-blue)', fontWeight: 600, minWidth: '80px' }}>
                                  {ac.testId || `AC-${idx + 1}`}
                                </span>
                                <span style={{
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  fontSize: '10px',
                                  fontWeight: 700,
                                  background: ac.lastResult === 'pass' ? 'rgba(52,211,153,0.15)' : ac.lastResult === 'fail' ? 'rgba(248,113,113,0.15)' : 'rgba(251,191,36,0.15)',
                                  color: ac.lastResult === 'pass' ? 'var(--accent-green)' : ac.lastResult === 'fail' ? 'var(--accent-red)' : 'var(--accent-amber)',
                                }}>
                                  {ac.lastResult || 'untested'}
                                </span>
                                {ac.fixLevel && (
                                  <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>
                                    fix: {ac.fixLevel}
                                  </span>
                                )}
                                {ac.description && (
                                  <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {ac.description}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
              {features.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '12px' }}>
                    <div style={{ marginBottom: '4px' }}>{'\uD83D\uDDFA\uFE0F'} No features mapped yet</div>
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

type TabKey = 'overview' | 'discoveries' | 'trends' | 'feature-map'

const TAB_DEFS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'overview', label: 'Overview', icon: '📊' },
  { key: 'discoveries', label: 'Discoveries', icon: '🔍' },
  { key: 'trends', label: 'Trends', icon: '📈' },
  { key: 'feature-map', label: 'Feature Map', icon: '🗺️' },
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

  return (
    <div className="space-y-2">
      {/* 1. Header — full-width top bar */}
      <TestLabHeader pipelineData={pipelineData} supervisorData={supervisorData} />

      {/* 2. Self-heal banner — only shown when event exists */}
      <SelfHealBanner selfHealEvent={supervisorData?.selfHealEvent} />

      {/* 3. Dual-column layout: Pipeline sidebar + Content area */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        {/* Left sidebar: Pipeline + Stats */}
        <div style={{
          width: '180px',
          flexShrink: 0,
          position: 'sticky',
          top: '12px',
        }}>
          <div style={glassCardStyle({ padding: '12px' })}>
            {/* Pipeline label */}
            <div className="testlab-display" style={{
              fontSize: '10px',
              fontWeight: 700,
              color: 'var(--text-tertiary)',
              textTransform: 'uppercase' as const,
              letterSpacing: '0.08em',
              marginBottom: '8px',
            }}>
              Pipeline
            </div>

            {/* Vertical stage pipeline */}
            <StagePipeline pipelineData={pipelineData} />

            {/* Stats divider */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '10px 0 8px' }} />

            {/* Compact stats */}
            <StatsBar statsData={statsData} />
          </div>
        </div>

        {/* Right content: Tabs + Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Tab Bar */}
          {(() => {
            const discoveriesCount = discoveries?.discoveries?.length || 0
            const trendsCount = trends?.length || 0
            const tabCounts: Record<TabKey, number> = {
              overview: 0,
              discoveries: discoveriesCount,
              trends: trendsCount,
              'feature-map': 0,
            }

            return (
              <div className="flex gap-0.5 px-1" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                {TAB_DEFS.map(tab => {
                  const count = tabCounts[tab.key]
                  const isActive = activeTab === tab.key
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className="flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-bold transition-all testlab-display"
                      style={{
                        color: isActive ? 'var(--accent-blue)' : 'var(--text-tertiary)',
                        background: isActive ? 'var(--accent-blue-dim)' : 'transparent',
                        border: 'none',
                        borderBottom: `2px solid ${isActive ? 'var(--accent-blue)' : 'transparent'}`,
                        borderRadius: '8px 8px 0 0',
                        cursor: 'pointer',
                        marginBottom: '-1px',
                        letterSpacing: '0.01em',
                      }}
                      onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = 'var(--text-secondary)' }}
                      onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = 'var(--text-tertiary)' }}
                    >
                      <span>{tab.icon}</span>
                      {tab.label}
                      {count > 0 && (
                        <span
                          className="font-mono"
                          style={{
                            fontSize: '9px',
                            fontWeight: 700,
                            padding: '1px 5px',
                            borderRadius: '8px',
                            background: isActive ? 'var(--accent-blue-dim)' : 'var(--bg-inset)',
                            color: isActive ? 'var(--accent-blue)' : 'var(--text-tertiary)',
                            marginLeft: '2px',
                          }}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )
          })()}

      {/* 6. Tab Content */}
      <div style={{ animation: 'fadeIn 0.15s ease-out' }}>
        {activeTab === 'overview' && (
          <div className="space-y-3">
            {/* Onboarding guide — shown when pipeline has never run (cycle 0, no stages done) */}
            {(() => {
              const neverRun = !pipelineData?.cycle || pipelineData.cycle === 0
              const noStageDone = !pipelineData?.stages || !Object.values(pipelineData.stages).some((s: any) => s?.status === 'done')
              if (neverRun && noStageDone) {
                return (
                  <div style={{
                    ...glassCardStyle({ padding: '24px 28px' }),
                    animation: 'fadeIn 0.3s ease-out',
                    background: 'linear-gradient(135deg, var(--glass-bg) 0%, color-mix(in srgb, var(--accent-blue) 3%, var(--glass-bg)) 100%)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                      <span style={{ fontSize: '28px', lineHeight: 1, flexShrink: 0, animation: 'float 3s ease-in-out infinite' }}>{registryEmpty ? '🗃️' : '🧪'}</span>
                      <div style={{ flex: 1 }}>
                        <div className="testlab-display" style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px', letterSpacing: '-0.3px' }}>
                          {registryEmpty ? 'Registry cleared — ready for first scan' : 'No test data yet'}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                          Get started with the test pipeline in three steps:
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {[
                            { step: '1', icon: '▶️', text: 'Run /test-supervisor run', desc: 'or click the Start button above' },
                            { step: '2', icon: '🔍', text: 'Watch pipeline progress', desc: 'SCAN → GENERATE → TEST → VALIDATE → FIX → VERIFY' },
                            { step: '3', icon: '🗺️', text: 'Review Feature Map', desc: 'coverage and freshness for every feature' },
                          ].map((item, idx) => (
                            <div key={item.step} style={{
                              display: 'flex', alignItems: 'center', gap: '12px',
                              padding: '10px 14px', borderRadius: '10px',
                              background: 'var(--bg-inset)', border: '1px solid var(--border-subtle)',
                              animation: `fadeInStagger 0.3s ease-out ${0.1 + idx * 0.08}s both`,
                              transition: 'border-color 0.2s, background 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--accent-blue) 25%, transparent)'
                              e.currentTarget.style.background = 'color-mix(in srgb, var(--accent-blue) 4%, var(--bg-inset))'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = 'var(--border-subtle)'
                              e.currentTarget.style.background = 'var(--bg-inset)'
                            }}
                            >
                              <span style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: '22px', height: '22px', borderRadius: '50%',
                                background: 'var(--accent-blue-dim)', color: 'var(--accent-blue)',
                                fontSize: '11px', fontWeight: 800, fontFamily: 'var(--font-mono)', flexShrink: 0,
                              }}>{item.step}</span>
                              <div>
                                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                                  {item.icon} {item.text}
                                </span>
                                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginLeft: '8px' }}>
                                  {item.desc}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }
              return null
            })()}
            {/* Row 1: Reasoning Narrative (left) + Queues & Current Test (right) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: '12px', alignItems: 'stretch' }}>
              <ReasoningNarrative supervisorData={supervisorData} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <QueuesPanel queuesData={queuesData} registry={reg} />
                <CurrentTestPanel pipelineData={pipelineData} />
              </div>
            </div>
            {/* Row 2: Stage Progress (primary) + Activity Log (secondary) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignItems: 'start' }}>
              <StageProgressPanel pipelineData={pipelineData} />
              <ActivityStream />
            </div>
          </div>
        )}

        {activeTab === 'discoveries' && (
          <DiscoveryTable discoveries={discoveries} registry={reg} />
        )}

        {activeTab === 'trends' && (
          <TrendChart trends={trends || []} />
        )}

        {activeTab === 'feature-map' && (
          <FeatureMapPanel />
        )}
      </div>
        </div>
      </div>
    </div>
  )
}

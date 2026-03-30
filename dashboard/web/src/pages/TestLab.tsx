/**
 * TestLab.tsx — Test Supervisor Dashboard (V2: Flat Pipeline Model)
 *
 * V2 Design (Cycle/Stage/Reasoning Steps):
 * 1. TestLabHeader — compact one-line: Cycle info + stage badge + elapsed + controls
 * 2. ReasoningNarrative — supervisor 5-step reasoning with smart fold
 * 3. StagePipeline — horizontal 5-stage flow (SCAN → GENERATE → TEST → FIX → VERIFY)
 * 4. StatsBar — compact inline cumulative + cycle stats
 * 5. Tab content: Overview (Activity + Queues), Discoveries, Trends, Evolution
 */
import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
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
} from '../api/hooks'
import { Card, CardHeader } from '../components/common/Card'
import { Badge } from '../components/common/Badge'
import { Loading, EmptyState } from '../components/common/Loading'
import {
  CheckCircle, XCircle, Wrench, SkipForward, Activity,
  Bug, Play, Square, Zap, Milestone, ChevronDown, ChevronUp,
} from 'lucide-react'
import { BASE_URL } from '../api/client'

// ============ Stage Color Map ============

const STAGE_COLORS: Record<string, string> = {
  SCAN: 'var(--accent-blue)',
  GENERATE: 'var(--accent-purple)',
  TEST: 'var(--accent-amber)',
  FIX: 'var(--accent-red)',
  VERIFY: 'var(--accent-green)',
}

const STAGES = ['SCAN', 'GENERATE', 'TEST', 'FIX', 'VERIFY'] as const

function stageColorOf(stage?: string): string {
  if (!stage) return 'var(--text-tertiary)'
  return STAGE_COLORS[stage.toUpperCase()] || 'var(--text-secondary)'
}

const STAGE_ICONS: Record<string, string> = {
  SCAN: '\uD83D\uDD0D',
  GENERATE: '\u2699\uFE0F',
  TEST: '\uD83E\uDDEA',
  FIX: '\uD83D\uDD27',
  VERIFY: '\u2705',
}

// ============ CSS Animation Injection ============

const TESTLAB_KEYFRAMES = `
@keyframes bar-pulse {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes stage-glow {
  0%, 100% { box-shadow: 0 0 0 0 currentColor; }
  50% { box-shadow: 0 0 0 4px color-mix(in srgb, currentColor 20%, transparent); }
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

function TestLabHeader({ pipelineData }: { pipelineData: any }) {
  const { data: runnerStatus } = useRunnerStatus()
  const startMutation = useRunnerStart()
  const stopMutation = useRunnerStop()

  const status = runnerStatus?.status || 'idle'
  const startedAt = runnerStatus?.startedAt
  const lastRunAt = runnerStatus?.lastRunAt
  const isRunning = status === 'running'
  const isWaiting = status === 'waiting'
  const isActive = isRunning || isWaiting
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
  useEffect(() => {
    if (!showStartMenu) return
    const handler = (e: MouseEvent) => {
      if (startMenuRef.current && !startMenuRef.current.contains(e.target as Node)) setShowStartMenu(false)
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
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '10px',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Animated top bar when active */}
      {isActive && (
        <div style={{
          height: '2px',
          background: `linear-gradient(90deg, transparent, ${stageColor}, transparent)`,
          animation: 'bar-pulse 2s ease-in-out infinite',
        }} />
      )}

      {/* Single-line header content */}
      <div className="flex items-center justify-between px-4 py-2.5 gap-4">
        {/* Left: Cycle info + Stage badge + Elapsed */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Cycle counter */}
          <span className="text-[15px] font-bold font-mono" style={{ color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
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
        </div>

        {/* Right: Status + Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Status indicator */}
          <div
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{
              background: isRunning ? 'var(--accent-green)' :
                isWaiting ? 'var(--accent-purple)' :
                status === 'paused' ? 'var(--accent-amber)' : 'var(--text-tertiary)',
              boxShadow: isActive ? `0 0 6px ${isWaiting ? 'var(--accent-purple)' : 'var(--accent-green)'}` : 'none',
              animation: isWaiting ? 'blink 1.5s ease-in-out infinite' : 'none',
            }}
          />
          <span className="text-[12px] font-bold font-mono" style={{
            color: isRunning ? 'var(--accent-green)' :
              isWaiting ? 'var(--accent-purple)' :
              status === 'paused' ? 'var(--accent-amber)' : 'var(--text-tertiary)',
          }}>
            {isWaiting ? 'WAITING' : status.toUpperCase()}
          </span>

          {/* Loop badge */}
          {isActive && loopEnabled && (
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded" style={{ background: 'var(--accent-purple-dim, var(--accent-blue-dim))', color: 'var(--accent-purple)' }}>
              LOOP #{runsCompleted + 1}
            </span>
          )}

          {/* Start button (when idle) */}
          {status === 'idle' && (
            <div ref={startMenuRef} style={{ position: 'relative' }}
              onKeyDown={(e) => { if (e.key === 'Escape' && showStartMenu) { setShowStartMenu(false); e.stopPropagation() } }}
            >
              <button
                onClick={() => setShowStartMenu(!showStartMenu)}
                disabled={startMutation.isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all hover:opacity-80 disabled:opacity-50"
                style={{ background: 'var(--accent-green-dim)', color: 'var(--accent-green)' }}
              >
                <Play className="w-3.5 h-3.5" /> Start
                <ChevronDown className="w-3 h-3" style={{ transform: showStartMenu ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
              </button>
              {showStartMenu && (
                <div style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: '4px',
                  background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                  borderRadius: '8px', padding: '4px', minWidth: '170px', zIndex: 50,
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
                </div>
              )}
            </div>
          )}

          {/* Stop button (when running/waiting) */}
          {(status === 'running' || status === 'waiting') && (
            <button
              onClick={handleStopClick}
              disabled={stopMutation.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all hover:opacity-80 disabled:opacity-50"
              style={{ background: 'var(--accent-red-dim)', color: 'var(--accent-red)' }}
            >
              <Square className="w-3.5 h-3.5" /> {confirmStop ? 'Confirm?' : 'Stop'}
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

// ============ Reasoning Narrative ============

const REASONING_STEPS = ['observe', 'diagnose', 'decide', 'act', 'reflect'] as const
const REASONING_LABELS: Record<string, { icon: string; label: string }> = {
  observe: { icon: '\uD83D\uDC41\uFE0F', label: 'Observe' },
  diagnose: { icon: '\uD83E\uDE7A', label: 'Diagnose' },
  decide: { icon: '\uD83E\uDDE0', label: 'Decide' },
  act: { icon: '\u26A1', label: 'Act' },
  reflect: { icon: '\uD83D\uDCAD', label: 'Reflect' },
}

function ReasoningNarrative({ supervisorData }: { supervisorData: any }) {
  const [manualToggle, setManualToggle] = useState<boolean | null>(null)

  const reasoning = supervisorData?.reasoning || {}
  const selfHealEvent = supervisorData?.selfHealEvent
  const supervisorStep = supervisorData?.step || ''
  const tick = supervisorData?.tick

  // Smart fold: auto-expand on self-heal or reflect content
  const shouldAutoExpand = !!(selfHealEvent || reasoning.reflect)
  const isExpanded = manualToggle !== null ? manualToggle : shouldAutoExpand

  // Derive collapsed summary text
  const summaryText = useMemo(() => {
    if (selfHealEvent) return `\uD83D\uDD27 Self-heal detected \u2014 ${typeof selfHealEvent === 'string' ? selfHealEvent : selfHealEvent?.description || 'intervention in progress'}`
    if (reasoning.reflect) return `\uD83D\uDCAD Reflecting \u2014 ${typeof reasoning.reflect === 'string' ? reasoning.reflect.slice(0, 80) : 'analysis complete'}${typeof reasoning.reflect === 'string' && reasoning.reflect.length > 80 ? '...' : ''}`
    if (!supervisorData || supervisorData.status === 'idle') return '\uD83D\uDCA4 Supervisor idle'
    if (supervisorStep) {
      const meta = REASONING_LABELS[supervisorStep]
      return `${meta?.icon || '\u2705'} ${meta?.label || supervisorStep} \u2014 step ${REASONING_STEPS.indexOf(supervisorStep as any) + 1}/5`
    }
    return '\u2705 Normal \u2014 all steps passed'
  }, [supervisorData, selfHealEvent, reasoning.reflect, supervisorStep])

  const summaryColor = selfHealEvent ? 'var(--accent-amber)' : reasoning.reflect ? 'var(--accent-purple)' : 'var(--accent-green)'

  // Count filled reasoning steps
  const filledSteps = REASONING_STEPS.filter(s => reasoning[s]).length

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: `1px solid ${selfHealEvent ? 'color-mix(in srgb, var(--accent-amber) 30%, transparent)' : 'var(--border-subtle)'}`,
        borderRadius: '10px',
        overflow: 'hidden',
      }}
    >
      {/* Collapsed summary — always visible */}
      <button
        onClick={() => setManualToggle(prev => prev === null ? !shouldAutoExpand : !prev)}
        className="w-full flex items-center justify-between px-4 py-2.5 transition-all hover:opacity-90"
        style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[12px] font-bold" style={{ color: summaryColor, whiteSpace: 'nowrap' }}>
            {summaryText}
          </span>
          {tick != null && (
            <span className="text-[10px] font-mono" style={{ color: 'var(--text-tertiary)' }}>
              tick #{tick}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {filledSteps > 0 && (
            <span className="text-[10px] font-mono" style={{ color: 'var(--text-tertiary)' }}>
              {filledSteps}/5 steps
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} />
          )}
        </div>
      </button>

      {/* Expanded 5-step narrative */}
      {isExpanded && (
        <div
          className="px-4 pb-3 space-y-2"
          style={{ borderTop: '1px solid var(--border-subtle)', animation: 'fadeIn 0.2s ease-out' }}
        >
          {/* Self-heal banner */}
          {selfHealEvent && (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg mt-2 text-[12px]"
              style={{ background: 'var(--accent-amber-dim)', color: 'var(--accent-amber)' }}
            >
              <span>\uD83D\uDD27</span>
              <span className="font-bold">Self-Heal Event:</span>
              <span style={{ color: 'var(--text-secondary)' }}>
                {typeof selfHealEvent === 'string' ? selfHealEvent : JSON.stringify(selfHealEvent)}
              </span>
            </div>
          )}

          {/* Reasoning steps */}
          <div className="space-y-1.5 mt-2">
            {REASONING_STEPS.map((step) => {
              const meta = REASONING_LABELS[step]
              const content = reasoning[step]
              const isCurrent = supervisorStep === step
              const hasContent = !!content

              return (
                <div
                  key={step}
                  className="flex items-start gap-2.5 px-3 py-1.5 rounded-lg"
                  style={{
                    background: isCurrent ? 'color-mix(in srgb, var(--accent-blue) 8%, transparent)' : 'transparent',
                    opacity: hasContent || isCurrent ? 1 : 0.4,
                  }}
                >
                  <span className="text-[14px] flex-shrink-0 mt-0.5">{meta.icon}</span>
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] font-bold font-mono" style={{
                      color: isCurrent ? 'var(--accent-blue)' : hasContent ? 'var(--text-primary)' : 'var(--text-tertiary)',
                    }}>
                      {meta.label}
                    </span>
                    {hasContent && (
                      <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        {typeof content === 'string' ? content : JSON.stringify(content)}
                      </p>
                    )}
                  </div>
                  {isCurrent && (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded flex-shrink-0"
                      style={{ background: 'var(--accent-blue-dim)', color: 'var(--accent-blue)' }}>
                      NOW
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
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
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '10px',
        padding: '14px 16px',
      }}
    >
      <div className="flex items-center gap-0 overflow-x-auto">
        {STAGES.map((stage, i) => {
          const stageData = stages[stage] || {}
          const status = stageData.status || (stage === currentStage ? 'running' : 'pending')
          const isDone = status === 'done' || status === 'completed'
          const isActive = status === 'running' || status === 'in-progress' || stage === currentStage
          const isPending = !isDone && !isActive
          const color = isDone ? 'var(--accent-green)' : isActive ? stageColorOf(stage) : 'var(--text-tertiary)'
          const summary = stageData.summary || ''

          return (
            <div key={stage} className="flex items-center flex-shrink-0" style={{ flex: i < STAGES.length - 1 ? 1 : undefined }}>
              {/* Stage pill */}
              <div
                className="flex flex-col items-center gap-1"
                style={{ minWidth: '80px' }}
                title={summary || `${stage}: ${status}`}
              >
                {/* Icon + status */}
                <div
                  className="flex items-center justify-center rounded-lg px-3 py-1.5 gap-1.5 transition-all"
                  style={{
                    background: isDone ? 'color-mix(in srgb, var(--accent-green) 12%, transparent)'
                      : isActive ? `color-mix(in srgb, ${stageColorOf(stage)} 12%, transparent)`
                      : 'var(--bg-inset)',
                    border: `1.5px solid ${isDone ? 'var(--accent-green)' : isActive ? stageColorOf(stage) : 'var(--border-subtle)'}`,
                    animation: isActive && !isDone ? 'stage-glow 2s ease-in-out infinite' : 'none',
                    color,
                  }}
                >
                  <span className="text-[14px]">{STAGE_ICONS[stage]}</span>
                  <span className="text-[11px] font-bold font-mono" style={{ color }}>
                    {stage}
                  </span>
                  <span className="text-[10px]">
                    {isDone ? '\u2705' : isActive ? '\uD83D\uDD04' : '\u23F3'}
                  </span>
                </div>

                {/* Summary text */}
                {summary && (
                  <span className="text-[9px] font-mono text-center truncate max-w-[100px]"
                    style={{ color: 'var(--text-tertiary)' }} title={summary}>
                    {summary}
                  </span>
                )}
              </div>

              {/* Connector line */}
              {i < STAGES.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: '2px',
                    minWidth: '12px',
                    background: isDone ? 'var(--accent-green)' : 'var(--border-subtle)',
                    transition: 'background 0.3s',
                    alignSelf: 'center',
                    marginBottom: summary ? '16px' : '0',
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
      className="flex items-center justify-between px-4 py-2.5 rounded-lg"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '10px' }}
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
      {skipRegistry && Object.keys(skipRegistry).length > 0 && (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}>
          <div className="flex items-center gap-2 px-3 py-2">
            <span className="text-[12px] font-bold" style={{ color: 'var(--text-tertiary)' }}>Skipped Tests</span>
            <Badge variant="default" size="xs">{Object.keys(skipRegistry).length}</Badge>
          </div>
          <div className="px-3 pb-2 space-y-1 max-h-[150px] overflow-y-auto">
            {Object.entries(skipRegistry).map(([testId, reason]) => (
              <div key={testId} className="flex items-center gap-2 text-[11px] font-mono px-2 py-1 rounded"
                style={{ background: 'var(--bg-inset)' }}>
                <span style={{ color: 'var(--text-primary)' }}>{testId}</span>
                <span style={{ color: 'var(--text-tertiary)' }}>{String(reason)}</span>
              </div>
            ))}
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

  // Load initial events from API
  useEffect(() => {
    fetch(`${BASE_URL}/api/tests/recent-events?limit=30`)
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
              if (d.queues) parts.push(`T:${d.queues.test} F:${d.queues.fix} V:${d.queues.verify} R:${d.queues.regression}`)
              if (d.round !== undefined) parts.push(`C${d.round}`)
              detail = parts.join(' \u00B7 ') || eventType
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
        let detail = d.testId || d.note || ''
        if (eventType === 'state-updated' && d.phase) {
          const parts: string[] = []
          if (d.currentTest) parts.push(d.currentTest)
          else if (d.testId) parts.push(d.testId)
          if (d.queues) parts.push(`T:${d.queues.test} F:${d.queues.fix} V:${d.queues.verify} R:${d.queues.regression}`)
          if (d.round !== undefined) parts.push(`C${d.round}`)
          detail = parts.join(' \u00B7 ') || eventType
        }
        const newEvent: ActivityEvent = {
          type: eventType,
          phase: d.phase,
          action: d.action || (eventType === 'state-updated' ? d.phase : undefined),
          detail,
          timestamp: d.timestamp || new Date().toISOString(),
        }
        setEvents(prev => [...prev, newEvent].slice(-30))
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

// ============ Main Page ============

type TabKey = 'overview' | 'discoveries' | 'trends' | 'evolution'

const TAB_DEFS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'overview', label: 'Overview', icon: '\uD83D\uDCCA' },
  { key: 'discoveries', label: 'Discoveries', icon: '\uD83D\uDD0D' },
  { key: 'trends', label: 'Trends', icon: '\uD83D\uDCC8' },
  { key: 'evolution', label: 'Evolution', icon: '\uD83E\uDDEC' },
]

export default function TestLab() {
  useInjectKeyframes()

  const [activeTab, setActiveTab] = useState<TabKey>('overview')

  // New split-state hooks (primary data sources)
  const { data: pipeline } = useTestPipeline()
  const { data: supervisor } = useTestSupervisor()
  const { data: queues } = useTestQueues()
  const { data: stats } = useTestStats()

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

  // Show header + empty state when no data at all
  if (!state && !pipeline) {
    return (
      <div className="space-y-3">
        <TestLabHeader pipelineData={null} />
        <EmptyState
          icon="\uD83E\uDDEA"
          title="No test data yet"
          description="Click Start in the header above or run /test-supervisor to begin testing"
        />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* 1. Header — compact one-line */}
      <TestLabHeader pipelineData={pipelineData} />

      {/* 2. Reasoning Narrative — smart fold */}
      <ReasoningNarrative supervisorData={supervisorData} />

      {/* 3. Stage Pipeline — 5-stage horizontal flow */}
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

        {activeTab === 'discoveries' && (
          <DiscoveryTable discoveries={discoveries} registry={reg} />
        )}

        {activeTab === 'trends' && (
          <TrendChart trends={trends || []} />
        )}

        {activeTab === 'evolution' && (
          <EvolutionTimeline />
        )}
      </div>
    </div>
  )
}

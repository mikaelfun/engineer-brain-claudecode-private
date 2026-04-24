/**
 * DashboardTopBar — Command Center top bar
 *
 * Time-of-day greeting, date display, alert badges, and patrol trigger.
 * Patrol button has a dropdown for mode selection (Force Patrol / New Cases Only).
 */
import { useState, useRef, useEffect } from 'react'
import { Play, Loader2, AlertTriangle, Clock, Zap, Shield, ChevronDown, Plus } from 'lucide-react'
import { useStartPatrol, useCancelPatrol } from '../../api/hooks'
import { usePatrolStore } from '../../stores/patrolStore'

interface DashboardTopBarProps {
  slaRiskCount: number
  needActionCount: number
  lastPatrolTime?: string | null
  totalCases: number
  engineerName?: string
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function formatPatrolTime(iso: string | null | undefined): string {
  if (!iso) return 'Never'
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `${diffH}h ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function DashboardTopBar({
  slaRiskCount,
  needActionCount,
  lastPatrolTime,
  totalCases,
  engineerName,
}: DashboardTopBarProps) {
  const startPatrol = useStartPatrol()
  const cancelPatrol = useCancelPatrol()
  const patrolPhase = usePatrolStore((s) => s.phase)
  const patrolRunning =
    patrolPhase !== 'idle' && patrolPhase !== 'completed' && patrolPhase !== 'failed'
  const isPatrolActive = patrolRunning || startPatrol.isPending

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [dropdownOpen])

  const handlePatrolClick = () => {
    if (isPatrolActive) {
      cancelPatrol.mutate()
    } else {
      // Default: force patrol
      startPatrol.mutate({ force: true, mode: 'normal' })
    }
  }

  const handleNewCases = () => {
    setDropdownOpen(false)
    if (!isPatrolActive) {
      startPatrol.mutate({ force: false, mode: 'new-cases' })
    }
  }

  return (
    <div
      className="flex items-center justify-between gap-4 px-6 py-4 rounded-xl"
      style={{ background: 'var(--bg-surface)' }}
    >
      {/* Left — Greeting */}
      <div className="min-w-0">
        <h1
          className="text-xl font-extrabold tracking-tight truncate"
          style={{ color: 'var(--text-primary)' }}
        >
          {getGreeting()}, {engineerName || 'Engineer'}
        </h1>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
          {totalCases} active case{totalCases !== 1 ? 's' : ''} ·{' '}
          <span style={{ color: 'var(--text-secondary)' }}>{formatDate()}</span>
        </p>
      </div>

      {/* Right — Badges + Patrol */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* SLA Risk badge */}
        {slaRiskCount > 0 && (
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold"
            style={{
              background: 'var(--accent-red)',
              color: '#fff',
            }}
          >
            <AlertTriangle className="w-3 h-3" />
            {slaRiskCount} SLA
          </span>
        )}

        {/* Need Action badge */}
        {needActionCount > 0 && (
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold"
            style={{
              background: 'var(--accent-amber)',
              color: '#000',
            }}
          >
            <Zap className="w-3 h-3" />
            {needActionCount} Action
          </span>
        )}

        {/* Last Patrol badge */}
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono"
          style={{
            background: 'var(--bg-inset)',
            color: 'var(--accent-blue)',
          }}
        >
          <Clock className="w-3 h-3" />
          {formatPatrolTime(lastPatrolTime)}
        </span>

        {/* Patrol split button */}
        <div className="relative" ref={dropdownRef}>
          <div className="flex">
            {/* Main button */}
            <button
              onClick={handlePatrolClick}
              disabled={cancelPatrol.isPending}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-all duration-150 disabled:opacity-50"
              style={{
                background: isPatrolActive ? 'var(--accent-red)' : 'var(--accent-blue)',
                color: '#fff',
                borderRadius: '8px 0 0 8px',
              }}
              title={isPatrolActive ? 'Cancel patrol' : 'Start patrol (force)'}
            >
              {isPatrolActive ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Patrol
                </>
              ) : (
                <>
                  <Shield className="w-3.5 h-3.5" />
                  Patrol
                </>
              )}
            </button>

            {/* Dropdown toggle */}
            {!isPatrolActive && (
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="inline-flex items-center px-1.5 py-1.5 text-xs font-bold transition-all duration-150"
                style={{
                  background: 'var(--accent-blue)',
                  color: '#fff',
                  borderRadius: '0 8px 8px 0',
                  borderLeft: '1px solid rgba(255,255,255,0.2)',
                }}
                title="Patrol options"
              >
                <ChevronDown className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Dropdown menu */}
          {dropdownOpen && !isPatrolActive && (
            <div
              className="absolute right-0 mt-1 py-1 rounded-lg shadow-lg z-50"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                minWidth: 160,
              }}
            >
              <button
                onClick={handleNewCases}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium transition-colors hover:bg-[var(--bg-inset)]"
                style={{ color: 'var(--text-primary)' }}
              >
                <Plus className="w-3.5 h-3.5" style={{ color: 'var(--accent-green)' }} />
                New Cases Only
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * StepFilterTabs — Filter tab strip for step-grouped session timeline
 *
 * Renders [All] + per-step filter buttons with status badges (✅🔄❌)
 * and message counts. Clicking a tab filters the timeline to show only
 * that step's messages.
 *
 * Used by CaseAIPanel to replace the per-executionId tab isolation model
 * with a unified session timeline + step filters.
 */
import { CheckCircle2, Loader2, AlertCircle, X } from 'lucide-react'
import type { StepGroup } from './SessionMessageList'

export interface StepFilterTabsProps {
  /** Step groups from groupMessagesByStep() */
  steps: StepGroup[]
  /** Currently active filter: null = All, stepName = filtered */
  activeFilter: string | null
  /** Called when user clicks a filter tab */
  onFilterChange: (stepName: string | null) => void
  /** Called when user clicks Clear to dismiss all messages */
  onClear?: () => void
}

/** Status badge icon for a step */
function StepStatusIcon({ status }: { status: StepGroup['status'] }) {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="w-3 h-3" style={{ color: 'var(--accent-green)' }} />
    case 'failed':
      return <AlertCircle className="w-3 h-3" style={{ color: 'var(--accent-red)' }} />
    case 'running':
      return <Loader2 className="w-3 h-3 animate-spin" style={{ color: 'var(--accent-amber)' }} />
  }
}

export function StepFilterTabs({
  steps,
  activeFilter,
  onFilterChange,
  onClear,
}: StepFilterTabsProps) {
  if (steps.length === 0) return null

  const totalMessages = steps.reduce((sum, s) => sum + s.messages.length, 0)

  return (
    <div
      className="flex items-center gap-1 px-5 py-1.5 flex-shrink-0 overflow-x-auto"
      style={{ borderBottom: '1px solid var(--border-subtle)' }}
    >
      {/* All tab */}
      <button
        onClick={() => onFilterChange(null)}
        className="px-2.5 py-1 rounded text-xs font-medium transition-colors flex-shrink-0 flex items-center gap-1.5"
        style={{
          background: activeFilter === null ? 'var(--accent-blue-dim)' : 'transparent',
          color: activeFilter === null ? 'var(--accent-blue)' : 'var(--text-tertiary)',
        }}
        onMouseEnter={e => { if (activeFilter !== null) (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)' }}
        onMouseLeave={e => { if (activeFilter !== null) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
      >
        All
        <span
          className="text-[10px] px-1 py-px rounded-full"
          style={{
            background: activeFilter === null ? 'var(--accent-blue)' : 'var(--bg-elevated)',
            color: activeFilter === null ? 'var(--text-inverse)' : 'var(--text-tertiary)',
          }}
        >
          {totalMessages}
        </span>
      </button>

      {/* Per-step filter tabs */}
      {steps.map((step) => {
        // Skip __general__ from filter tabs (its messages show in All)
        if (step.stepName === '__general__') return null
        const isActive = activeFilter === step.stepName
        return (
          <button
            key={step.stepName}
            onClick={() => onFilterChange(isActive ? null : step.stepName)}
            className="px-2.5 py-1 rounded text-xs font-medium transition-colors flex-shrink-0 flex items-center gap-1.5"
            style={{
              background: isActive ? 'var(--accent-blue-dim)' : 'transparent',
              color: isActive ? 'var(--accent-blue)' : 'var(--text-tertiary)',
            }}
            onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)' }}
            onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
          >
            <StepStatusIcon status={step.status} />
            {step.label}
            <span
              className="text-[10px] px-1 py-px rounded-full"
              style={{
                background: isActive ? 'var(--accent-blue)' : 'var(--bg-elevated)',
                color: isActive ? 'var(--text-inverse)' : 'var(--text-tertiary)',
              }}
            >
              {step.messages.length}
            </span>
          </button>
        )
      })}

      {/* Clear button */}
      {onClear && (
        <button
          onClick={onClear}
          className="px-2 py-1 rounded text-xs transition-colors flex-shrink-0 ml-auto flex items-center gap-1"
          style={{ color: 'var(--text-tertiary)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
          title="Clear all messages"
        >
          <X className="w-3 h-3" />
          Clear
        </button>
      )}
    </div>
  )
}

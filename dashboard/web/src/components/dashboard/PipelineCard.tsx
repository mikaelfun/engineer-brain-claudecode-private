/**
 * PipelineCard — Compact case card for pipeline columns
 *
 * Shows case number, title (2-line clamp), severity badge, age,
 * and micro-tags (RDSE / 21V / S500).
 */
import { ArrowRight } from 'lucide-react'
import { SeverityBadge } from '../common/Badge'

interface PipelineCardProps {
  caseNumber: string
  title: string
  severity: string
  age: string
  ccAccount?: string
  isS500?: boolean
  is21V?: boolean
  onClick: () => void
}

export function PipelineCard({
  caseNumber,
  title,
  severity,
  age,
  ccAccount,
  isS500,
  is21V,
  onClick,
}: PipelineCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full text-left rounded-lg p-2.5 transition-colors duration-150 cursor-pointer"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-card)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--bg-hover)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'var(--bg-surface)'
      }}
    >
      {/* Case number */}
      <div className="flex items-center justify-between">
        <span
          className="font-mono text-[11px] font-semibold truncate"
          style={{ color: 'var(--accent-blue)' }}
        >
          {caseNumber}
        </span>
        <ArrowRight
          className="w-3 h-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
          style={{ color: 'var(--text-tertiary)' }}
        />
      </div>

      {/* Title — 2-line clamp */}
      <p
        className="text-xs leading-snug mt-1 line-clamp-2"
        style={{ color: 'var(--text-primary)' }}
        title={title}
      >
        {title}
      </p>

      {/* Bottom row: severity, age, micro-tags */}
      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
        <SeverityBadge severity={severity} />
        <span
          className="font-mono text-[10px] font-medium"
          style={{ color: 'var(--text-tertiary)' }}
        >
          {age}
        </span>

        {/* Spacer pushes tags to right when there's room */}
        <span className="flex-1" />

        {ccAccount && (
          <span
            className="inline-flex items-center px-1.5 py-px text-[9px] font-bold font-mono rounded uppercase"
            style={{
              background: 'var(--accent-purple-dim)',
              color: 'var(--accent-purple)',
            }}
            title={`RDSE: ${ccAccount}`}
          >
            RDSE
          </span>
        )}
        {is21V && (
          <span
            className="inline-flex items-center px-1.5 py-px text-[9px] font-bold font-mono rounded uppercase"
            style={{
              background: 'var(--accent-amber-dim)',
              color: 'var(--accent-amber)',
            }}
          >
            21V
          </span>
        )}
        {isS500 && (
          <span
            className="inline-flex items-center px-1.5 py-px text-[9px] font-bold font-mono rounded uppercase"
            style={{
              background: 'var(--accent-red-dim)',
              color: 'var(--accent-red)',
            }}
          >
            S500
          </span>
        )}
      </div>
    </button>
  )
}

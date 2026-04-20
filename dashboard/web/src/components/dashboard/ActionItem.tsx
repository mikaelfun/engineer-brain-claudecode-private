/**
 * ActionItem — Single row in the unified action list
 *
 * Displays urgency score pill, case ID, title, source label,
 * and meta info (severity, contact gap, SLA status, factor tags).
 */
import { getUrgencyColor, type UrgencyFactor } from '../../utils/urgencyScore'

export type ActionSource = 'case' | 'patrol-todo' | 'manual-todo'

export interface ActionItemData {
  /** Unique key (e.g., caseNumber or "todo-caseNumber-lineIdx") */
  id: string
  /** Linked case number */
  caseNumber?: string
  /** Case title or todo text */
  title: string
  /** Urgency score 0-100 */
  score: number
  /** Urgency factor breakdown */
  factors: UrgencyFactor[]
  /** Where this action came from */
  source: ActionSource
  /** Severity letter: "A", "B", "C" */
  severity?: string
  /** Days since last customer contact */
  daysSinceContact?: number
  /** IR SLA status */
  slaStatus?: string
}

interface ActionItemProps {
  item: ActionItemData
  onClick?: () => void
  /** Optional inline styles (used for keyboard selection highlight) */
  style?: React.CSSProperties
}

const SOURCE_LABELS: Record<ActionSource, string> = {
  case: 'CASE ACTION',
  'patrol-todo': 'PATROL TODO',
  'manual-todo': 'MANUAL TODO',
}

const SOURCE_COLORS: Record<ActionSource, string> = {
  case: 'var(--accent-purple)',
  'patrol-todo': 'var(--accent-blue)',
  'manual-todo': 'var(--accent-green)',
}

function ScorePill({ score }: { score: number }) {
  const color = getUrgencyColor(score)
  return (
    <span
      className="inline-flex items-center justify-center w-10 h-7 rounded-md font-mono text-sm font-bold flex-shrink-0"
      style={{ background: color, color: '#fff' }}
    >
      {score}
    </span>
  )
}

function FactorTag({ factor }: { factor: UrgencyFactor }) {
  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium"
      style={{
        background: 'var(--bg-inset)',
        color: 'var(--text-secondary)',
      }}
    >
      {factor.label}
    </span>
  )
}

export function ActionItem({ item, onClick, style }: ActionItemProps) {
  const activeFactors = item.factors.filter((f) => f.value > 0)

  return (
    <button
      onClick={onClick}
      className="w-full text-left px-3 py-2.5 rounded-lg transition-colors duration-150 group"
      style={{ background: 'transparent', ...style }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = style?.background
          ? String(style.background)
          : 'var(--bg-hover)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = style?.background
          ? String(style.background)
          : 'transparent'
      }}
    >
      {/* Top row: score + case ID + title + source label */}
      <div className="flex items-center gap-2 min-w-0">
        <ScorePill score={item.score} />

        {item.caseNumber && (
          <span
            className="font-mono text-xs font-medium flex-shrink-0"
            style={{ color: 'var(--accent-blue)' }}
          >
            {item.caseNumber}
          </span>
        )}

        <span
          className="text-sm truncate min-w-0 flex-1"
          style={{ color: 'var(--text-primary)' }}
        >
          {item.title}
        </span>

        <span
          className="text-[10px] font-bold tracking-wider flex-shrink-0 ml-1"
          style={{ color: SOURCE_COLORS[item.source] }}
        >
          {SOURCE_LABELS[item.source]}
        </span>
      </div>

      {/* Bottom row: meta info + factor tags */}
      <div className="flex items-center gap-1.5 mt-1 ml-12">
        {/* Meta chips */}
        {item.severity && (
          <span
            className="text-[11px] font-mono font-medium"
            style={{ color: 'var(--text-secondary)' }}
          >
            Sev {item.severity}
          </span>
        )}

        {item.daysSinceContact !== undefined && item.daysSinceContact > 0 && (
          <>
            <span style={{ color: 'var(--text-tertiary)' }} className="text-[11px]">
              ·
            </span>
            <span
              className="text-[11px] font-mono"
              style={{
                color:
                  item.daysSinceContact >= 3
                    ? 'var(--accent-red)'
                    : item.daysSinceContact >= 2
                      ? 'var(--accent-amber)'
                      : 'var(--text-secondary)',
              }}
            >
              {item.daysSinceContact}d gap
            </span>
          </>
        )}

        {item.slaStatus && (
          <>
            <span style={{ color: 'var(--text-tertiary)' }} className="text-[11px]">
              ·
            </span>
            <span
              className="text-[11px] font-mono"
              style={{
                color:
                  item.slaStatus === 'not-met'
                    ? 'var(--accent-red)'
                    : 'var(--accent-green)',
              }}
            >
              SLA {item.slaStatus === 'not-met' ? 'breached' : 'met'}
            </span>
          </>
        )}

        {/* Spacer */}
        {activeFactors.length > 0 && (
          <span style={{ color: 'var(--text-tertiary)' }} className="text-[11px] mx-0.5">
            ·
          </span>
        )}

        {/* Factor tags */}
        {activeFactors.map((f) => (
          <FactorTag key={f.name} factor={f} />
        ))}
      </div>
    </button>
  )
}

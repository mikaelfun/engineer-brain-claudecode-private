/**
 * TeamIntelCard — Displays team intelligence items (known issues, LSI alerts, swarming).
 *
 * Used as structured placeholders in ActivityFeed for v1.
 * Future: sourced from {dataRoot}/intel/ directory.
 */

export interface TeamIntelItem {
  type: 'known-issue' | 'lsi' | 'swarming'
  title: string
  description: string
  source?: string
  timestamp?: string
  affectedCases?: string[]
}

interface TeamIntelCardProps {
  item: TeamIntelItem
}

const iconMap: Record<TeamIntelItem['type'], string> = {
  'known-issue': '\u{1F514}',  // bell
  'lsi': '\u{1F6E1}\uFE0F',   // shield
  'swarming': '\u{1F4AC}',    // speech bubble
}

const labelMap: Record<TeamIntelItem['type'], string> = {
  'known-issue': 'Known Issue',
  'lsi': 'LSI Alert',
  'swarming': 'Swarming',
}

const colorMap: Record<TeamIntelItem['type'], string> = {
  'known-issue': 'var(--accent-amber)',
  'lsi': 'var(--accent-purple)',
  'swarming': 'var(--accent-blue)',
}

export function TeamIntelCard({ item }: TeamIntelCardProps) {
  const icon = iconMap[item.type]
  const label = labelMap[item.type]
  const accentColor = colorMap[item.type]
  const isPlaceholder = !item.source

  return (
    <div
      className="rounded-lg px-4 py-3 transition-colors duration-150"
      style={{
        background: 'var(--bg-inset)',
        border: isPlaceholder
          ? `1px dashed var(--border-subtle)`
          : `1px solid var(--border-subtle)`,
      }}
    >
      {/* Type badge */}
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-sm">{icon}</span>
        <span
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: accentColor }}
        >
          {label}
        </span>
        {item.timestamp && (
          <span
            className="text-xs ml-auto"
            style={{ color: 'var(--text-tertiary)' }}
          >
            {item.timestamp}
          </span>
        )}
      </div>

      {/* Title */}
      <p
        className="text-sm font-bold leading-snug mb-1"
        style={{ color: 'var(--text-primary)' }}
      >
        {item.title}
      </p>

      {/* Description */}
      <p
        className="text-xs leading-relaxed"
        style={{ color: 'var(--text-secondary)' }}
      >
        {item.description}
      </p>

      {/* Affected cases */}
      {item.affectedCases && item.affectedCases.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {item.affectedCases.map((cn) => (
            <span
              key={cn}
              className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded"
              style={{
                background: 'var(--bg-hover)',
                color: 'var(--text-secondary)',
              }}
            >
              {cn}
            </span>
          ))}
        </div>
      )}

      {/* Source indicator for non-placeholder items */}
      {item.source && (
        <div className="mt-2 pt-1.5" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <span
            className="text-[10px]"
            style={{ color: 'var(--text-tertiary)' }}
          >
            Source: {item.source}
          </span>
        </div>
      )}
    </div>
  )
}

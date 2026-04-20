import { Activity, Zap } from 'lucide-react'

interface ActivityItem {
  id: string
  icon: string
  text: string
  time: string
  color: string
  caseNumber?: string
}

interface ActivityFeedProps {
  cases: any[]
  className?: string
}

function parseAgeToHours(age: string): number {
  const days = parseInt(age.match(/(\d+)d/)?.[1] || '0')
  const hours = parseInt(age.match(/(\d+)h/)?.[1] || '0')
  return days * 24 + hours
}

function deriveActivities(cases: any[]): ActivityItem[] {
  const activities: ActivityItem[] = []

  for (const c of cases) {
    const caseNum = c.caseNumber || 'unknown'
    const meta = c.meta || {}

    // SLA breached
    if (meta.irSla?.status === 'not-met') {
      activities.push({
        id: `sla-${caseNum}`,
        icon: '\u{1F534}',
        text: `SLA breached: ${caseNum}`,
        time: 'active',
        color: 'var(--accent-red)',
        caseNumber: caseNum,
      })
    }

    // Contacted today
    if (meta.daysSinceLastContact === 0) {
      activities.push({
        id: `contact-${caseNum}`,
        icon: '\u{1F7E2}',
        text: `Contacted customer on ${caseNum}`,
        time: 'today',
        color: 'var(--accent-green)',
        caseNumber: caseNum,
      })
    }

    // Recently inspected (within 24h)
    if (meta.lastInspected) {
      const inspectedAt = new Date(meta.lastInspected)
      const hoursAgo = (Date.now() - inspectedAt.getTime()) / (1000 * 60 * 60)
      if (hoursAgo <= 24 && hoursAgo >= 0) {
        const timeStr =
          hoursAgo < 1
            ? `${Math.round(hoursAgo * 60)}m ago`
            : `${Math.round(hoursAgo)}h ago`
        activities.push({
          id: `inspect-${caseNum}`,
          icon: '\u{1F535}',
          text: `Inspected ${caseNum}`,
          time: timeStr,
          color: 'var(--accent-blue)',
          caseNumber: caseNum,
        })
      }
    }

    // New case (age < 1 day)
    if (c.age && parseAgeToHours(c.age) < 24) {
      activities.push({
        id: `new-${caseNum}`,
        icon: '\u{1F7E3}',
        text: `New case: ${caseNum}`,
        time: c.age,
        color: 'var(--accent-purple)',
        caseNumber: caseNum,
      })
    }
  }

  // Sort by recency heuristic: SLA first, then contact, inspect, new
  // For items with parseable time, sort numerically
  activities.sort((a, b) => {
    const parseTime = (t: string): number => {
      const mMatch = t.match(/(\d+)m ago/)
      if (mMatch) return parseInt(mMatch[1])
      const hMatch = t.match(/(\d+)h ago/)
      if (hMatch) return parseInt(hMatch[1]) * 60
      if (t === 'today') return 0
      if (t === 'active') return -1
      return 9999
    }
    return parseTime(a.time) - parseTime(b.time)
  })

  return activities.slice(0, 8)
}

const teamIntelItems = [
  { icon: '\u{1F514}', text: 'Known Issues feed \u2014 coming soon', color: 'var(--accent-amber)' },
  { icon: '\u{1F6E1}\uFE0F', text: 'LSI alerts \u2014 coming soon', color: 'var(--accent-purple)' },
  { icon: '\u{1F4AC}', text: 'Teams swarming \u2014 coming soon', color: 'var(--accent-blue)' },
]

export function ActivityFeed({ cases, className }: ActivityFeedProps) {
  const activities = deriveActivities(cases || [])

  return (
    <div
      className={`rounded-xl p-4 ${className || ''}`}
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Activity className="w-4 h-4" style={{ color: 'var(--accent-purple)' }} />
        <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
          Activity Feed
        </h2>
      </div>

      {/* My Activity section */}
      <div className="mb-4">
        <h3
          className="text-[10px] font-bold uppercase tracking-wider mb-2"
          style={{ color: 'var(--text-tertiary)' }}
        >
          My Activity
        </h3>
        <div className="space-y-1">
          {activities.length === 0 ? (
            <div
              className="text-xs py-2 px-2 text-center rounded-lg"
              style={{ color: 'var(--text-tertiary)', background: 'var(--bg-inset)' }}
            >
              No recent activity
            </div>
          ) : (
            activities.map((item) => (
              <a
                key={item.id}
                href={item.caseNumber ? `/case/${item.caseNumber}` : undefined}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors group"
                style={{ cursor: item.caseNumber ? 'pointer' : 'default' }}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                }}
                onClick={(e) => {
                  if (!item.caseNumber) e.preventDefault()
                }}
              >
                <span className="text-sm flex-shrink-0">{item.icon}</span>
                <span
                  className="text-xs flex-1 truncate"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {item.text}
                </span>
                <span
                  className="text-[10px] font-mono flex-shrink-0"
                  style={{ color: item.color }}
                >
                  {item.time}
                </span>
              </a>
            ))
          )}
        </div>
      </div>

      {/* Team Intel section */}
      <div>
        <h3
          className="text-[10px] font-bold uppercase tracking-wider mb-2"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Team Intel
        </h3>
        <div className="space-y-1.5">
          {teamIntelItems.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
              style={{
                border: '1px dashed var(--border-subtle)',
                background: 'var(--bg-inset)',
              }}
            >
              <span className="text-sm flex-shrink-0">{item.icon}</span>
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

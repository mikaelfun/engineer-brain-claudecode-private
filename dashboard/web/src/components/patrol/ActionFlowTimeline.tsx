/**
 * ActionFlowTimeline — Vertical timeline with rich action cards.
 * Shows the assess → troubleshoot → reassess → challenger → email chain
 * with status, reasoning, findings, and context tags.
 */
import type { StepState, ActionState, StepStatus } from '../../stores/patrolStore'

// ─── Types ───

interface ActionCard {
  type: string
  label: string
  status: StepStatus
  durationMs?: number
  detail?: string     // reasoning / findings / evaluation text
  result?: string     // assess result (needs-action / no-change)
  subtype?: string    // email subtype
  tags?: string[]     // context tags
}

interface ActionFlowTimelineProps {
  steps: Record<string, StepState>
}

// ─── Derive action cards from steps ───

function deriveCards(steps: Record<string, StepState>): ActionCard[] {
  const cards: ActionCard[] = []
  const assess = steps?.assess
  if (!assess || assess.status === 'pending') return cards

  // Card 1: Assess
  cards.push({
    type: 'assess',
    label: 'Assess',
    status: assess.status,
    durationMs: assess.durationMs,
    detail: assess.reasoning,
    result: assess.result,
  })

  // Cards from act.actions[]
  const act = steps?.act
  const actions: ActionState[] = act?.actions || []
  for (const action of actions) {
    const isReassess = action.type === 'reassess'
    const isEmail = action.type === 'email-drafter'
    cards.push({
      type: action.type,
      label: isReassess ? 'Reassess'
           : isEmail ? `Email${action.subtype ? ': ' + action.subtype : ''}`
           : action.type.charAt(0).toUpperCase() + action.type.slice(1).replace(/-/g, ' '),
      status: action.status || 'pending',
      durationMs: action.durationMs,
      detail: action.detail,
      result: action.result,
      subtype: action.subtype,
    })
  }

  return cards
}

// ─── Helpers ───

function formatDuration(ms: number): string {
  if (ms < 1000) return '<1s'
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  if (m > 0) return `${m}m ${s % 60}s`
  return `${s}s`
}

function statusColor(status: StepStatus): string {
  switch (status) {
    case 'completed': return 'var(--accent-green)'
    case 'active': return 'var(--accent-blue)'
    case 'failed': return 'var(--accent-red)'
    default: return 'var(--border-default)'
  }
}

function isReassessType(type: string): boolean {
  return type === 'reassess'
}

function cardAccentColor(card: ActionCard): string {
  if (isReassessType(card.type) && card.status === 'active') return 'var(--accent-purple)'
  return statusColor(card.status)
}

function resultPillColor(result?: string): { bg: string; color: string } {
  if (result === 'needs-action') return { bg: 'var(--accent-amber-dim)', color: 'var(--accent-amber)' }
  if (result === 'no-change') return { bg: 'var(--accent-green-dim)', color: 'var(--accent-green)' }
  return { bg: 'var(--accent-blue-dim)', color: 'var(--accent-blue)' }
}

// ─── Main Component ───

export default function ActionFlowTimeline({ steps }: ActionFlowTimelineProps) {
  const cards = deriveCards(steps)

  if (cards.length === 0) return null

  const noAction = cards.length === 1 && cards[0].result === 'no-change'

  return (
    <div style={{
      background: 'var(--bg-inset)', border: '1px solid var(--border-subtle)',
      borderRadius: 10, padding: '14px 16px',
      animation: 'detail-slide 0.2s ease-out',
    }}>
      <div style={{
        fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.6px', color: 'var(--text-tertiary)', marginBottom: 12,
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <div style={{
          width: 6, height: 6, borderRadius: '50%',
          background: cards.some(c => c.status === 'active')
            ? cardAccentColor(cards.find(c => c.status === 'active')!)
            : 'var(--accent-green)',
        }} />
        Action Flow
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {cards.map((card, idx) => {
          const isLast = idx === cards.length - 1
          const accent = cardAccentColor(card)
          const isPending = card.status === 'pending'
          const isActive = card.status === 'active'
          const isDone = card.status === 'completed'

          return (
            <div key={`${card.type}-${idx}`} style={{ display: 'flex', alignItems: 'stretch' }}>
              {/* Timeline: dot + line */}
              <div style={{ width: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, paddingTop: 14 }}>
                <div style={{
                  width: 10, height: 10, borderRadius: '50%', flexShrink: 0, zIndex: 1,
                  background: isPending ? 'var(--border-default)' : accent,
                  opacity: isPending ? 0.35 : 1,
                  ...(isActive ? { animation: 'sidebar-pulse 2s ease-in-out infinite' } : {}),
                }} />
                {!isLast && (
                  <div style={{
                    width: 2, flex: 1, borderRadius: 1, marginTop: 4,
                    background: isDone ? 'rgba(22,163,74,0.2)' : isActive ? 'rgba(106,95,193,0.15)' : 'var(--border-subtle)',
                    opacity: isPending ? 0.5 : 1,
                  }} />
                )}
              </div>

              {/* Card body */}
              <div style={{ flex: 1, padding: '8px 0 8px 10px' }}>
                <div style={{
                  padding: '10px 14px', borderRadius: 8,
                  background: isActive ? 'rgba(106,95,193,0.03)' : isPending ? 'transparent' : 'var(--bg-surface)',
                  border: `1px solid ${isPending ? 'var(--border-subtle)' : isActive ? 'rgba(106,95,193,0.25)' : 'var(--border-subtle)'}`,
                  borderStyle: isPending ? 'dashed' : 'solid',
                  opacity: isPending ? 0.45 : 1,
                }}>
                  {/* Header row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: isPending ? 'var(--text-tertiary)' : accent }}>
                      {card.label}
                    </span>
                    {card.result && (
                      <span style={{
                        fontSize: 8, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                        ...resultPillColor(card.result),
                      }}>
                        {card.result}
                      </span>
                    )}
                    {isActive && (
                      <span style={{
                        fontSize: 8, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                        background: isReassessType(card.type) ? 'var(--accent-purple-dim)' : 'var(--accent-blue-dim)',
                        color: isReassessType(card.type) ? 'var(--accent-purple)' : 'var(--accent-blue)',
                      }}>
                        ⟳ {card.detail?.split(' ')[0] || 'running'}
                      </span>
                    )}
                    {card.durationMs !== undefined && (
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: 'var(--text-tertiary)', marginLeft: 'auto' }}>
                        {formatDuration(card.durationMs)}
                      </span>
                    )}
                  </div>

                  {/* Detail text (only for non-pending) */}
                  {!isPending && card.detail && (
                    <div style={{
                      marginTop: 5, fontSize: 11, lineHeight: 1.55,
                      color: isActive ? accent : 'var(--text-secondary)',
                      opacity: isActive ? 0.7 : 1,
                    }}>
                      {card.detail}
                    </div>
                  )}

                  {/* Tags */}
                  {card.tags && card.tags.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                      {card.tags.map((tag, i) => (
                        <span key={i} style={{
                          fontSize: 9, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                          background: 'var(--bg-inset)', color: 'var(--text-tertiary)',
                        }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {noAction && (
        <div style={{ marginTop: 8, fontSize: 10, color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
          No actions needed — proceeding to summary
        </div>
      )}
    </div>
  )
}

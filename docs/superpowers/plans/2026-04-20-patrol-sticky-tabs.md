# Patrol Case Row v5 — Sticky Tabs Accordion

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the 5-column horizontal pipeline in PatrolCaseRow with a 3-zone layout: fixed left (Start+Refresh), dynamic center (sticky tabs + front card), fixed right (Summary).

**Architecture:** The center zone renders a `cardStack[]` array derived from `state.json`. Done steps become colored sticky-note tabs; the active step is a full-size front card; pending steps are dimmed queued items. The backend `update-state.py` continues writing to `steps.act.actions[]`; the frontend derives `cardStack` from `steps` at render time (no backend schema change needed).

**Tech Stack:** React + TypeScript + Zustand + CSS variables (existing dashboard design system)

**Design reference:** `dashboard/design-patrol-v5-light.html` (approved v5 light theme mockup)

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `dashboard/web/src/components/patrol/PatrolCaseRow.tsx` | **Rewrite** | 3-zone layout, sticky tabs, front card, queued |
| `dashboard/web/src/stores/patrolStore.ts` | **Minor modify** | Add `ActionState.subtype?` field (already optional, ensure type) |
| `dashboard/web/src/components/patrol/PatrolCaseList.tsx` | **Minor modify** | Update `isCaseComplete` helper for new cardStack logic |
| `dashboard/web/src/index.css` | **Add** | CSS variables for sticky tab colors (both themes) |

No backend changes needed — `update-state.py` already writes `steps.assess`, `steps.act.actions[]` (with reassess/troubleshooter/email-drafter types). The frontend derives the card stack from these existing fields.

---

### Task 1: Add sticky tab CSS variables to both themes

**Files:**
- Modify: `dashboard/web/src/index.css`

- [ ] **Step 1: Add tab color variables to dark theme**

In `index.css`, inside the `:root` (dark theme) block, after the `--accent-purple-dim` line, add:

```css
  /* Sticky tab colors (patrol card stack) */
  --tab-green: rgba(74,222,128,0.18);
  --tab-green-border: rgba(74,222,128,0.35);
  --tab-green-text: #6ee7a0;
  --tab-amber: rgba(251,191,36,0.15);
  --tab-amber-border: rgba(251,191,36,0.30);
  --tab-amber-text: #fbbf24;
  --tab-purple: rgba(167,139,250,0.18);
  --tab-purple-border: rgba(167,139,250,0.35);
  --tab-purple-text: #b8a4fb;
  --bg-front: #2e2e54;
```

- [ ] **Step 2: Add tab color variables to light theme**

In `index.css`, inside the `[data-theme="light"]` block, after the `--accent-purple-dim` line, add:

```css
  /* Sticky tab colors (patrol card stack) */
  --tab-green: rgba(22,163,74,0.10);
  --tab-green-border: rgba(22,163,74,0.30);
  --tab-green-text: #15803d;
  --tab-amber: rgba(217,119,6,0.10);
  --tab-amber-border: rgba(217,119,6,0.25);
  --tab-amber-text: #b45309;
  --tab-purple: rgba(124,58,237,0.10);
  --tab-purple-border: rgba(124,58,237,0.28);
  --tab-purple-text: #6d28d9;
  --bg-front: #ffffff;
```

- [ ] **Step 3: Verify variables load**

Run: `cd dashboard && npm run dev` (should compile without errors)

- [ ] **Step 4: Commit**

```bash
git add dashboard/web/src/index.css
git commit -m "feat(patrol): add sticky tab CSS variables for both themes"
```

---

### Task 2: Rewrite PatrolCaseRow with 3-zone sticky tabs layout

**Files:**
- Rewrite: `dashboard/web/src/components/patrol/PatrolCaseRow.tsx`

This is the core change. The component goes from a 5-column horizontal pipeline to:
- **Zone L** (140px): Start + Refresh steps (vertical, with data-refresh subtask delta)
- **Zone C** (flex): Sticky tab row (done steps) + Front card (active step) + Queued items (pending)
- **Zone R** (110px): Summary step

The card stack is derived at render time from `caseState.steps`:
1. `steps.assess` → card type "assess"
2. `steps.act.actions[]` → one card per action (troubleshooter, reassess, email-drafter)
3. If no actions and assess result is "no-change" → no additional cards

- [ ] **Step 1: Write the new PatrolCaseRow component**

Replace the entire content of `PatrolCaseRow.tsx` with:

```tsx
/**
 * PatrolCaseRow — 3-zone sticky tabs layout (v5)
 *
 * Layout:
 *   Zone L (140px)  │  Zone C (flex, card stack)  │  Zone R (110px)
 *   ✓ Start         │  [tab] [tab] [tab]          │  ○ Summary
 *   ✓ Refresh       │  ╔══ Front Card ══╗         │
 *     +2 emails     │  ║  active step   ║         │
 *                   │  ╚════════════════╝         │
 *                   │  ┌ queued ──────┐           │
 *
 * Card stack derived from steps.assess + steps.act.actions[]:
 *   done → sticky tab (colored, micro-rotated)
 *   active → front card (elevated, pulsing icon)
 *   pending → queued (dashed border, dimmed)
 */
import { useState, useEffect, useMemo } from 'react'
import { ChevronRight, Loader2 } from 'lucide-react'
import type { CaseState, StepState, StepStatus, SubtaskState, ActionState } from '../../stores/patrolStore'

// ─── Types ───

interface CardItem {
  type: string       // assess, troubleshooter, reassess, email-drafter
  status: StepStatus
  durationMs?: number
  result?: string
  detail?: string
  subtype?: string   // email subtype: result-confirm, follow-up, etc.
  label: string      // display name
  tabColor: 'green' | 'amber' | 'purple'  // sticky tab color
}

interface PatrolCaseRowProps {
  caseState: CaseState
  defaultExpanded: boolean
}

// ─── Constants ───

const DR_SUBTASK_NAMES = ['d365', 'teams', 'icm', 'onenote', 'attachments'] as const
const DR_SUBTASK_LABELS: Record<string, string> = {
  d365: 'D365', teams: 'Teams', icm: 'ICM', onenote: 'OneNote', attachments: 'Attach',
}

// Tab rotation per index for organic sticky-note feel
const TAB_ROTATIONS = ['-0.8deg', '0.5deg', '-0.4deg', '0.6deg']

// ─── Helpers ───

function formatDuration(ms: number): string {
  if (ms < 1000) return '<1s'
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  if (m > 0) return `${m}m ${s % 60}s`
  return `${s}s`
}

function formatDelta(name: string, delta?: Record<string, number>): string | null {
  if (!delta) return null
  switch (name) {
    case 'd365': {
      const parts: string[] = []
      if (delta.newEmails) parts.push(`+${delta.newEmails} emails`)
      if (delta.newNotes) parts.push(`+${delta.newNotes} note`)
      return parts.join(' · ') || null
    }
    case 'teams': {
      const parts: string[] = []
      if (delta.newChats) parts.push(`${delta.newChats} chats`)
      if (delta.newMessages) parts.push(`${delta.newMessages} msgs`)
      return parts.join(' · ') || null
    }
    case 'icm': return delta.newEntries ? `+${delta.newEntries} disc` : null
    case 'onenote': {
      const pages = (delta.newPages || 0) + (delta.updatedPages || 0)
      return pages ? `${pages} pages` : null
    }
    case 'attachments': return delta.downloaded ? `+${delta.downloaded} file` : null
    default: return null
  }
}

/** Derive card stack from steps — the core data transform */
function deriveCardStack(steps: Record<string, StepState>): CardItem[] {
  const cards: CardItem[] = []
  const assess = steps?.assess
  if (!assess || assess.status === 'pending') return cards

  // Card 1: Assess
  cards.push({
    type: 'assess',
    status: assess.status,
    durationMs: assess.durationMs,
    result: assess.result,
    detail: assess.reasoning,
    label: 'Assess',
    tabColor: 'amber',
  })

  // Cards from act.actions[]
  const act = steps?.act
  const actions = act?.actions || []
  for (const action of actions) {
    const isReassess = action.type === 'reassess'
    const isEmail = action.type === 'email-drafter'
    cards.push({
      type: action.type,
      status: action.status || 'pending',
      durationMs: action.durationMs,
      result: action.result,
      detail: action.detail,
      subtype: action.subtype,
      label: isReassess ? 'Reassess'
           : isEmail ? `Email${action.subtype ? ': ' + action.subtype : ''}`
           : action.type.charAt(0).toUpperCase() + action.type.slice(1).replace(/-/g, ' '),
      tabColor: isReassess ? 'purple' : 'green',
    })
  }

  return cards
}

function isCaseComplete(c: CaseState): boolean {
  const sum = c.steps?.summarize
  const act = c.steps?.act
  return (
    sum?.status === 'completed' || sum?.status === 'skipped' ||
    (act?.status === 'completed' && sum?.status !== 'active')
  )
}

function isCaseActive(c: CaseState): boolean {
  return Object.values(c.steps).some(s => s.status === 'active')
}

function hasFailed(c: CaseState): boolean {
  return Object.values(c.steps).some(s => s.status === 'failed')
}

function getCaseDuration(c: CaseState): number | undefined {
  if (isCaseActive(c)) {
    for (const step of Object.values(c.steps)) {
      if (step.status === 'active' && step.startedAt) {
        const ms = new Date(step.startedAt).getTime()
        if (!isNaN(ms)) return Date.now() - ms
      }
    }
    const startStep = c.steps?.start
    if (startStep?.startedAt) {
      const ms = new Date(startStep.startedAt).getTime()
      if (!isNaN(ms)) return Date.now() - ms
    }
    return undefined
  }
  const startStep = c.steps?.start
  if (!startStep?.startedAt) return undefined
  const startMs = new Date(startStep.startedAt).getTime()
  if (isNaN(startMs)) return undefined
  let latestMs = startMs
  for (const step of Object.values(c.steps)) {
    if (step.completedAt) {
      const t = new Date(step.completedAt).getTime()
      if (!isNaN(t) && t > latestMs) latestMs = t
    }
  }
  if (c.updatedAt) {
    const t = new Date(c.updatedAt).getTime()
    if (!isNaN(t) && t > latestMs) latestMs = t
  }
  return latestMs > startMs ? latestMs - startMs : undefined
}

/** Get the front card's label for the header pill */
function getFrontCardLabel(cards: CardItem[]): string | null {
  const front = cards.find(c => c.status === 'active')
  if (front) return front.label
  // All cards done? Check summarize
  return null
}

// ─── Sub-components ───

function CheckIcon({ size = 9 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
      <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function StatusDot({ status, color }: { status: StepStatus; color?: string }) {
  const size = 18
  if (status === 'completed') {
    return (
      <div style={{ width: size, height: size, borderRadius: '50%', background: color || 'var(--accent-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <CheckIcon />
      </div>
    )
  }
  if (status === 'active') {
    const borderColor = color || 'var(--accent-blue)'
    return (
      <div style={{ width: size, height: size, borderRadius: '50%', border: `2.5px solid ${borderColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, animation: 'patrol-pulse 2s ease-in-out infinite' }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: borderColor }} />
      </div>
    )
  }
  // pending
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', border: '1.5px solid var(--border-subtle)', flexShrink: 0 }} />
  )
}

/** Sticky tab — small colored label for completed step */
function StickyTab({ card, index }: { card: CardItem; index: number }) {
  const colorMap = {
    green:  { bg: 'var(--tab-green)',  border: 'var(--tab-green-border)',  text: 'var(--tab-green-text)' },
    amber:  { bg: 'var(--tab-amber)',  border: 'var(--tab-amber-border)',  text: 'var(--tab-amber-text)' },
    purple: { bg: 'var(--tab-purple)', border: 'var(--tab-purple-border)', text: 'var(--tab-purple-text)' },
  }
  const colors = colorMap[card.tabColor]
  const rotation = TAB_ROTATIONS[index % TAB_ROTATIONS.length]

  // Detail suffix: assess shows result, reassess shows conclusion
  let detailText = ''
  if (card.type === 'assess' && card.result) detailText = `· ${card.result}`
  else if (card.type === 'reassess' && card.result) detailText = `· ${card.result}`
  else if (card.durationMs) detailText = `· ${formatDuration(card.durationMs)}`

  return (
    <div
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '3px 9px',
        borderRadius: '5px 5px 1px 1px',
        fontSize: 10, fontWeight: 700,
        background: colors.bg, color: colors.text,
        borderBottom: `2px solid ${colors.border}`,
        transform: `rotate(${rotation})`,
        transition: 'all 120ms ease',
        cursor: 'default',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'rotate(0deg) translateY(-1px)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = `rotate(${rotation})` }}
    >
      {card.label}
      {detailText && (
        <span style={{ fontSize: 8, fontWeight: 500, opacity: 0.7, marginLeft: 2 }}>
          {detailText}
        </span>
      )}
    </div>
  )
}

/** Front card — active step, full size */
function FrontCard({ card }: { card: CardItem }) {
  const isPurple = card.type === 'reassess'
  const accentColor = isPurple ? 'var(--accent-purple)' : 'var(--accent-blue)'
  const detailColor = isPurple ? 'rgba(var(--accent-purple), 0.75)' : undefined

  return (
    <div
      style={{
        padding: '14px 16px', borderRadius: 10,
        background: 'var(--bg-front)',
        border: `1px solid ${isPurple ? 'rgba(124,58,237,0.2)' : 'rgba(106,95,193,0.15)'}`,
        boxShadow: isPurple
          ? '0 2px 10px rgba(124,58,237,0.08), 0 0 0 1px rgba(124,58,237,0.06)'
          : '0 2px 10px rgba(106,95,193,0.08), 0 0 0 1px rgba(106,95,193,0.04)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <StatusDot status="active" color={accentColor} />
        <span style={{ fontSize: 13, fontWeight: 700, color: accentColor }}>
          {card.label}
        </span>
        {card.durationMs !== undefined && (
          <span style={{ marginLeft: 'auto', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-tertiary)' }}>
            {formatDuration(card.durationMs)}
          </span>
        )}
      </div>
      {card.detail && (
        <div style={{ fontSize: 11, marginTop: 5, paddingLeft: 26, color: accentColor, opacity: 0.7 }}>
          {card.detail}
        </div>
      )}
    </div>
  )
}

/** Queued item — pending step */
function QueuedItem({ card }: { card: CardItem }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '5px 12px', borderRadius: 7,
      border: '1.5px dashed var(--border-subtle)',
      marginTop: 4, opacity: 0.45,
    }}>
      <div style={{ width: 14, height: 14, borderRadius: '50%', border: '1.5px solid var(--border-subtle)', flexShrink: 0 }} />
      <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{card.label}</span>
      {card.type === 'email-drafter' && !card.subtype && (
        <span style={{ fontSize: 9, color: 'var(--text-tertiary)', fontStyle: 'italic', marginLeft: 2 }}>
          待决定类型
        </span>
      )}
    </div>
  )
}

/** "All steps done" summary bar (shown when all cards completed, summarize not yet active) */
function AllDoneBar({ cards }: { cards: CardItem[] }) {
  const totalMs = cards.reduce((acc, c) => acc + (c.durationMs || 0), 0)
  return (
    <div style={{
      padding: '8px 12px', borderRadius: 8,
      background: 'var(--bg-inset)', border: '1px solid var(--border-subtle)',
      display: 'flex', alignItems: 'center', gap: 6,
    }}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="6" stroke="var(--accent-green)" strokeWidth="1.5" />
        <path d="M4 7l2 2 4-4" stroke="var(--accent-green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span style={{ fontSize: 11, color: 'var(--accent-green)', fontWeight: 600 }}>All steps done</span>
      {totalMs > 0 && (
        <span style={{ marginLeft: 'auto', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-tertiary)' }}>
          {formatDuration(totalMs)} total
        </span>
      )}
    </div>
  )
}

// ─── Main Component ───

export default function PatrolCaseRow({ caseState, defaultExpanded }: PatrolCaseRowProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const isComplete = isCaseComplete(caseState)
  const isActive = isCaseActive(caseState)
  const failed = hasFailed(caseState)

  // Tick every second while case is active (live duration)
  const [, setTick] = useState(0)
  useEffect(() => {
    if (!isActive) return
    const timer = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(timer)
  }, [isActive])

  const duration = getCaseDuration(caseState)

  // Auto-collapse when case finishes
  useEffect(() => {
    if (isComplete && !isActive) setExpanded(false)
  }, [isComplete, isActive])

  // Derive card stack
  const cards = useMemo(() => deriveCardStack(caseState.steps), [caseState.steps])
  const doneCards = cards.filter(c => c.status === 'completed' || c.status === 'skipped')
  const frontCard = cards.find(c => c.status === 'active')
  const queuedCards = cards.filter(c => c.status === 'pending')
  const allCardsDone = cards.length > 0 && !frontCard && queuedCards.length === 0

  // Header pill: front card label or current step
  const pillLabel = frontCard?.label
    || (caseState.steps?.summarize?.status === 'active' ? 'Summary' : null)
    || caseState.currentStep || 'Processing'
  const isPurplePill = frontCard?.type === 'reassess'

  const showBody = isActive || expanded
  const canCollapse = !isActive

  // Collapsed flow pills for done cases
  const flowPills = useMemo(() => {
    if (cards.length === 0) return []
    // If assess found no-change and no actions
    if (cards.length === 1 && cards[0].type === 'assess') {
      return [
        { label: 'assess', color: 'default' as const },
        { label: cards[0].result || 'no-change', color: 'green' as const },
      ]
    }
    return cards.map(c => ({
      label: c.type === 'email-drafter' ? 'email' : c.type === 'troubleshooter' ? 'troubleshoot' : c.type,
      color: (c.type === 'reassess' ? 'purple' : 'default') as 'default' | 'purple' | 'green',
    }))
  }, [cards])

  return (
    <div
      className="rounded-xl transition-all duration-200"
      style={{
        background: 'var(--bg-surface)',
        border: isActive ? '1px solid rgba(106,95,193,0.22)' : '1px solid var(--border-subtle)',
        boxShadow: isActive ? '0 2px 12px rgba(106,95,193,0.08)' : '0 1px 3px rgba(0,0,0,0.04)',
        overflow: 'hidden',
      }}
    >
      {/* ─── Header ─── */}
      <div
        className="flex items-center gap-2.5"
        style={{
          padding: '10px 18px',
          background: 'var(--bg-base)',
          cursor: canCollapse ? 'pointer' : undefined,
          userSelect: 'none',
        }}
        onClick={() => canCollapse && setExpanded(e => !e)}
      >
        {canCollapse && (
          <ChevronRight
            size={14}
            style={{
              color: 'var(--text-tertiary)', flexShrink: 0,
              transition: 'transform 150ms ease',
              transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
            }}
          />
        )}

        <span
          className="text-[13px] font-bold shrink-0"
          style={{ fontFamily: "'JetBrains Mono', monospace", color: isActive ? 'var(--accent-blue)' : 'rgba(106,95,193,0.55)' }}
        >
          {caseState.caseNumber}
        </span>

        {/* Status pill */}
        {isActive && (
          <span
            className="inline-flex items-center gap-1 text-[9.5px] font-bold uppercase rounded-lg px-2.5 py-0.5 shrink-0"
            style={{
              background: isPurplePill ? 'var(--accent-purple-dim)' : 'var(--accent-blue-dim)',
              color: isPurplePill ? 'var(--accent-purple)' : 'var(--accent-blue)',
              letterSpacing: '0.3px',
            }}
          >
            <Loader2 size={10} className="animate-spin" />
            {pillLabel}
          </span>
        )}
        {isComplete && !failed && (
          <span
            className="inline-flex items-center gap-1 text-[9.5px] font-bold uppercase rounded-lg px-2.5 py-0.5 shrink-0"
            style={{ background: 'var(--accent-green-dim)', color: 'var(--accent-green)', letterSpacing: '0.3px' }}
          >
            <CheckIcon size={8} /> Done
          </span>
        )}
        {failed && (
          <span
            className="inline-flex items-center gap-1 text-[9.5px] font-bold uppercase rounded-lg px-2.5 py-0.5 shrink-0"
            style={{ background: 'rgba(239,68,68,0.10)', color: 'var(--accent-red)', letterSpacing: '0.3px' }}
          >
            Failed
          </span>
        )}

        {/* Collapsed flow pills */}
        {canCollapse && !expanded && flowPills.length > 0 && (
          <div className="flex items-center gap-0.5 min-w-0 overflow-hidden">
            {flowPills.map((fp, i) => (
              <span key={i} className="flex items-center gap-0.5">
                {i > 0 && <span style={{ color: 'var(--text-tertiary)', fontSize: 9, padding: '0 1px' }}>→</span>}
                <span
                  style={{
                    padding: '2px 7px', borderRadius: 4, fontSize: 10, fontWeight: 600,
                    background: fp.color === 'purple' ? 'var(--accent-purple-dim)'
                             : fp.color === 'green' ? 'var(--accent-green-dim)'
                             : 'var(--bg-inset)',
                    color: fp.color === 'purple' ? 'var(--accent-purple)'
                         : fp.color === 'green' ? 'var(--accent-green)'
                         : 'var(--text-tertiary)',
                  }}
                >
                  {fp.label}
                </span>
              </span>
            ))}
          </div>
        )}

        <div className="flex-1" />

        {/* Duration */}
        {duration !== undefined && (
          <span className="shrink-0" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-tertiary)' }}>
            {formatDuration(duration)}
          </span>
        )}
      </div>

      {/* ─── Body (animated) ─── */}
      <div style={{
        maxHeight: showBody ? 400 : 0, opacity: showBody ? 1 : 0,
        overflow: 'hidden', transition: 'max-height 300ms ease, opacity 200ms ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'stretch', padding: '14px 18px', gap: 14, borderTop: '1px solid var(--bg-hover)' }}>

          {/* ── Zone L: Start + Refresh ── */}
          <div style={{ width: 140, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Start */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <StatusDot status={caseState.steps?.start?.status || 'pending'} />
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px', color: (caseState.steps?.start?.status === 'completed') ? 'var(--accent-green)' : (caseState.steps?.start?.status === 'active') ? 'var(--accent-blue)' : 'var(--text-tertiary)' }}>
                  Start
                </span>
                {caseState.steps?.start?.durationMs !== undefined && (
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--text-tertiary)' }}>
                    {formatDuration(caseState.steps.start.durationMs)}
                  </span>
                )}
              </div>
            </div>

            {/* Refresh */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <StatusDot status={caseState.steps?.['data-refresh']?.status || 'pending'} />
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px', color: (caseState.steps?.['data-refresh']?.status === 'completed') ? 'var(--accent-green)' : (caseState.steps?.['data-refresh']?.status === 'active') ? 'var(--accent-blue)' : 'var(--text-tertiary)' }}>
                  Refresh
                </span>
                {caseState.steps?.['data-refresh']?.durationMs !== undefined && (
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--text-tertiary)' }}>
                    {formatDuration(caseState.steps['data-refresh'].durationMs)}
                  </span>
                )}
              </div>
              {/* Subtask delta rows */}
              {caseState.steps?.['data-refresh']?.subtasks && (
                DR_SUBTASK_NAMES.map(name => {
                  const sub = caseState.steps?.['data-refresh']?.subtasks?.[name]
                  if (!sub || sub.status === 'pending') return null
                  if (sub.status === 'skipped') return null
                  const deltaText = formatDelta(name, sub.delta)
                  return (
                    <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 5, paddingLeft: 24 }}>
                      <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent-green)', flexShrink: 0 }} />
                      <span style={{ fontSize: 10, color: 'var(--text-secondary)', minWidth: 42 }}>{DR_SUBTASK_LABELS[name]}</span>
                      <span style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>{deltaText || 'no new'}</span>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* ── Zone C: Card Stack ── */}
          <div style={{ flex: 1, minWidth: 0, maxWidth: 460, display: 'flex', flexDirection: 'column', gap: 0 }}>
            {/* Sticky tabs (done cards) */}
            {doneCards.length > 0 && (
              <div style={{ display: 'flex', gap: 4, paddingBottom: 6, flexWrap: 'wrap' }}>
                {doneCards.map((card, i) => (
                  <StickyTab key={`${card.type}-${i}`} card={card} index={i} />
                ))}
              </div>
            )}

            {/* Front card (active) */}
            {frontCard && <FrontCard card={frontCard} />}

            {/* All done bar (when all cards complete but summarize not yet) */}
            {allCardsDone && <AllDoneBar cards={cards} />}

            {/* Queued items */}
            {queuedCards.map((card, i) => (
              <QueuedItem key={`q-${card.type}-${i}`} card={card} />
            ))}
          </div>

          {/* ── Zone R: Summary ── */}
          <div style={{ width: 110, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
              <span style={{
                fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px',
                color: caseState.steps?.summarize?.status === 'active' ? 'var(--accent-blue)' : 'var(--text-tertiary)',
              }}>
                Summary
              </span>
              <StatusDot status={caseState.steps?.summarize?.status || 'pending'} />
            </div>
            {caseState.steps?.summarize?.status === 'active' && (
              <div style={{ fontSize: 10, color: 'var(--accent-blue)', textAlign: 'right' }}>
                Summarizing…
              </div>
            )}
            {caseState.steps?.summarize?.status === 'completed' && (
              <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textAlign: 'right' }}>
                Todo updated
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Animations ─── */}
      <style>{`
        @keyframes patrol-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(106,95,193,0.25); }
          50% { box-shadow: 0 0 0 5px rgba(106,95,193,0); }
        }
      `}</style>
    </div>
  )
}
```

- [ ] **Step 2: Verify the component compiles**

Run: `cd dashboard && npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 3: Commit**

```bash
git add dashboard/web/src/components/patrol/PatrolCaseRow.tsx
git commit -m "feat(patrol): rewrite CaseRow with 3-zone sticky tabs layout

Replaces 5-column horizontal pipeline with:
- Zone L: Start + Refresh (fixed 140px)
- Zone C: sticky tab row (done) + front card (active) + queued
- Zone R: Summary (fixed 110px)

Card stack derived from steps.assess + steps.act.actions[].
No backend schema changes needed."
```

---

### Task 3: Update PatrolCaseList helpers for new completion logic

**Files:**
- Modify: `dashboard/web/src/components/patrol/PatrolCaseList.tsx`

The `isCaseComplete` and `isCaseActive` helpers need to stay compatible with the new row component. The existing logic already works because it checks `steps.summarize.status` and `steps.act.status`, which haven't changed.

- [ ] **Step 1: Verify no changes needed**

Read `PatrolCaseList.tsx` — the `isCaseComplete()` and `isCaseActive()` helpers reference `c.steps.summarize` and `c.steps.act`, which are still present in `state.json`. The `PatrolCaseRow` import path is unchanged. No modifications needed.

- [ ] **Step 2: Run full build to verify integration**

Run: `cd dashboard && npx tsc --noEmit && cd web && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Visual verification**

1. Open `http://localhost:5173` (dashboard web)
2. Navigate to Patrol page
3. If a recent patrol run exists, verify:
   - Completed cases show sticky tabs + collapsed flow pills
   - The 3-zone layout renders correctly
   - Colors match the approved v5-light mockup

- [ ] **Step 4: Commit (if any adjustments were made)**

```bash
git add -A
git commit -m "fix(patrol): adjust CaseList helpers for v5 layout compatibility"
```

---

### Task 4: Clean up design mockup files

**Files:**
- Delete: `dashboard/design-patrol-reassess.html`
- Delete: `dashboard/design-patrol-cardstack.html`
- Delete: `dashboard/design-patrol-cardstack-v3.html`
- Delete: `dashboard/design-patrol-v4.html`
- Delete: `dashboard/design-patrol-v5.html`
- Keep: `dashboard/design-patrol-v5-light.html` (approved reference)

- [ ] **Step 1: Remove obsolete design files**

```bash
cd dashboard
rm -f design-patrol-reassess.html design-patrol-cardstack.html design-patrol-cardstack-v3.html design-patrol-v4.html design-patrol-v5.html
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "chore: clean up obsolete patrol design mockups, keep v5-light"
```

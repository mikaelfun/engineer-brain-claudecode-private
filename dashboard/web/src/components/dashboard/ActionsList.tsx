/**
 * ActionsList — Unified, urgency-sorted list of case actions and todo items
 *
 * Merges cases (with computed urgency scores) and unchecked todo items
 * into a single prioritized action list with tab filtering.
 */
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ListChecks, Inbox } from 'lucide-react'
import { ActionItem, type ActionItemData, type ActionSource } from './ActionItem'
import { computeUrgencyScore } from '../../utils/urgencyScore'
import { useTodoList } from '../../api/hooks'

type FilterTab = 'all' | 'case' | 'todo' | 'manual'

interface ActionsListProps {
  cases: any[]
  className?: string
  /** Optional keyboard-driven selection index (from useDashboardKeys) */
  selectedIndex?: number
  /** Callback when selectedIndex changes (used by keyboard navigation) */
  onSelectedIndexChange?: (idx: number | ((prev: number) => number)) => void
}

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'case', label: 'Case' },
  { key: 'todo', label: 'Todo' },
  { key: 'manual', label: 'Manual' },
]

/**
 * Build a lookup map from case number → urgency result for linking todo items.
 */
function buildCaseScoreMap(cases: any[]): Map<string, { score: number; factors: any[] }> {
  const map = new Map<string, { score: number; factors: any[] }>()
  for (const c of cases) {
    const id = c.caseNumber ?? c.id
    if (!id) continue
    const result = computeUrgencyScore(c)
    map.set(id, result)
  }
  return map
}

/**
 * Determine whether a todo item came from patrol or is a manual todo.
 * Patrol todos typically have filenames matching the patrol output pattern.
 */
function classifyTodoSource(file: any): 'patrol-todo' | 'manual-todo' {
  const filename: string = file.filename ?? ''
  // Patrol-generated files follow YYMMDD-HHMM.md naming pattern
  if (/^\d{6}-\d{4}\.md$/.test(filename)) return 'patrol-todo'
  return 'manual-todo'
}

export function ActionsList({ cases, className, selectedIndex, onSelectedIndexChange }: ActionsListProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const navigate = useNavigate()
  const { data: todosData } = useTodoList()

  // Build unified action list
  const actions = useMemo<ActionItemData[]>(() => {
    const items: ActionItemData[] = []
    const caseScoreMap = buildCaseScoreMap(cases)

    // --- Cases → ActionItemData ---
    for (const c of cases) {
      const caseNumber = c.caseNumber ?? c.id
      if (!caseNumber) continue

      const result = caseScoreMap.get(caseNumber) ?? computeUrgencyScore(c)
      const severity = (c.severity ?? '').toString().trim()
      const sevLetter = severity.replace(/[^A-Ca-c]/g, '').toUpperCase().charAt(0) || undefined

      const irSla = c.meta?.irSla
      const slaStatus: string | undefined = irSla?.status ?? undefined

      items.push({
        id: caseNumber,
        caseNumber,
        title: c.title ?? c.caseTitle ?? 'Untitled Case',
        score: result.score,
        factors: result.factors,
        source: 'case',
        severity: sevLetter,
        daysSinceContact: c.meta?.daysSinceLastContact,
        slaStatus,
      })
    }

    // --- Todo items → ActionItemData ---
    if (todosData?.files) {
      for (const file of todosData.files) {
        const fileCaseNumber: string | undefined = file.caseNumber
        const todoSource = classifyTodoSource(file)
        const bonus = todoSource === 'manual-todo' ? 5 : 0

        // Find linked case score
        const linked = fileCaseNumber ? caseScoreMap.get(fileCaseNumber) : undefined
        const baseScore = linked?.score ?? 20 // default score for orphan todos

        const todoItems: any[] = file.items ?? []
        for (let idx = 0; idx < todoItems.length; idx++) {
          const todo = todoItems[idx]
          // Only include unchecked items
          if (todo.checked) continue

          const text: string = todo.text ?? todo.line ?? ''
          if (!text.trim()) continue

          const todoScore = Math.min(100, Math.max(0, baseScore + bonus))
          const todoFactors = linked?.factors ?? []

          items.push({
            id: `todo-${fileCaseNumber ?? 'none'}-${idx}`,
            caseNumber: fileCaseNumber,
            title: text,
            score: todoScore,
            factors: todoFactors,
            source: todoSource,
          })
        }
      }
    }

    // Sort by score descending
    items.sort((a, b) => b.score - a.score)

    return items
  }, [cases, todosData])

  // Filter by active tab
  const filteredActions = useMemo(() => {
    if (activeTab === 'all') return actions
    if (activeTab === 'case') return actions.filter((a) => a.source === 'case')
    if (activeTab === 'todo') return actions.filter((a) => a.source === 'patrol-todo')
    if (activeTab === 'manual') return actions.filter((a) => a.source === 'manual-todo')
    return actions
  }, [actions, activeTab])

  // Count per tab
  const counts = useMemo(() => {
    const c = { all: actions.length, case: 0, todo: 0, manual: 0 }
    for (const a of actions) {
      if (a.source === 'case') c.case++
      else if (a.source === 'patrol-todo') c.todo++
      else if (a.source === 'manual-todo') c.manual++
    }
    return c
  }, [actions])

  const handleClick = (item: ActionItemData) => {
    if (item.caseNumber) {
      navigate(`/case/${item.caseNumber}`)
    }
  }

  return (
    <div
      className={`rounded-xl overflow-hidden ${className ?? ''}`}
      style={{ background: 'var(--bg-surface)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <ListChecks
            className="w-4.5 h-4.5"
            style={{ color: 'var(--accent-blue)' }}
          />
          <h2
            className="text-sm font-extrabold tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            Actions
          </h2>
          <span
            className="font-mono text-xs font-bold px-1.5 py-0.5 rounded"
            style={{
              background: 'var(--bg-inset)',
              color: 'var(--text-secondary)',
            }}
          >
            {filteredActions.length}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-5 pb-3">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="px-2.5 py-1 rounded-full text-xs font-medium transition-colors duration-150"
              style={{
                background: isActive ? 'var(--accent-blue)' : 'var(--bg-inset)',
                color: isActive ? '#fff' : 'var(--text-secondary)',
              }}
            >
              {tab.label}
              <span className="ml-1 font-mono">
                ({counts[tab.key]})
              </span>
            </button>
          )
        })}
      </div>

      {/* Divider */}
      <div className="h-px mx-5" style={{ background: 'var(--border-subtle)' }} />

      {/* Scrollable list */}
      <div
        className="max-h-[500px] overflow-y-auto px-2 py-2"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--bg-hover) transparent',
        }}
      >
        {filteredActions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <Inbox className="w-8 h-8" style={{ color: 'var(--text-tertiary)' }} />
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              No actions found
            </p>
          </div>
        ) : (
          filteredActions.map((item, idx) => (
            <ActionItem
              key={item.id}
              item={item}
              onClick={() => handleClick(item)}
              style={
                selectedIndex !== undefined && selectedIndex === idx
                  ? {
                      outline: '2px solid var(--accent-blue)',
                      outlineOffset: '-2px',
                      borderRadius: '0.5rem',
                      background: 'var(--bg-hover)',
                    }
                  : undefined
              }
            />
          ))
        )}
      </div>
    </div>
  )
}

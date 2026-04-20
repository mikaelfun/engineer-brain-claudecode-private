/**
 * CasePipeline — 4-column Kanban-style pipeline view
 *
 * Classifies cases by actualStatus into Engineer / Customer / PG / Close columns.
 */
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutGrid } from 'lucide-react'
import { PipelineCard } from './PipelineCard'
import { Badge } from '../common/Badge'

/* ------------------------------------------------------------------ */
/*  Types & config                                                     */
/* ------------------------------------------------------------------ */

type PipelineColumn = 'engineer' | 'customer' | 'pg' | 'close'

interface CasePipelineProps {
  cases: any[]
  className?: string
}

const columnConfig: Record<PipelineColumn, { label: string; color: string }> = {
  engineer: { label: 'Engineer', color: 'var(--accent-red)' },
  customer: { label: 'Customer', color: 'var(--accent-green)' },
  pg:       { label: 'PG',       color: 'var(--accent-purple)' },
  close:    { label: 'Close',    color: 'var(--accent-blue)' },
}

const columnOrder: PipelineColumn[] = ['engineer', 'customer', 'pg', 'close']

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function classifyToPipeline(actualStatus: string): PipelineColumn {
  switch (actualStatus) {
    case 'pending-engineer':
    case 'new':
    case 'researching':
      return 'engineer'
    case 'pending-customer':
      return 'customer'
    case 'pending-pg':
      return 'pg'
    case 'ready-to-close':
    case 'resolved':
      return 'close'
    default:
      return 'engineer' // fallback
  }
}

/** Heuristic: case number starting with '2' indicates 21Vianet / Mooncake */
function detect21V(c: any): boolean {
  return typeof c.caseNumber === 'string' && c.caseNumber.startsWith('2')
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function CasePipeline({ cases, className = '' }: CasePipelineProps) {
  const navigate = useNavigate()

  // Classify cases into buckets
  const buckets = useMemo(() => {
    const b: Record<PipelineColumn, any[]> = {
      engineer: [],
      customer: [],
      pg: [],
      close: [],
    }
    for (const c of cases) {
      const status = c.meta?.actualStatus || c.status || ''
      const col = classifyToPipeline(status)
      b[col].push(c)
    }
    return b
  }, [cases])

  return (
    <div className={className}>
      {/* Section header */}
      <div className="flex items-center gap-2 mb-3">
        <LayoutGrid className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
        <h2
          className="text-sm font-extrabold tracking-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          Case Pipeline
        </h2>
        <Badge variant="default" size="xs">{cases.length}</Badge>
      </div>

      {/* 4-column grid */}
      <div className="grid grid-cols-4 gap-3">
        {columnOrder.map((col) => {
          const cfg = columnConfig[col]
          const items = buckets[col]

          return (
            <div
              key={col}
              className="rounded-lg overflow-hidden"
              style={{
                background: 'var(--bg-inset)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {/* Colored top border */}
              <div
                className="h-[2px] rounded-t-lg"
                style={{ background: cfg.color }}
              />

              {/* Column header */}
              <div className="flex items-center justify-between px-3 py-2">
                <span
                  className="text-xs font-bold"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {cfg.label}
                </span>
                <span
                  className="font-mono text-[10px] font-bold min-w-[20px] text-center rounded-full px-1.5 py-0.5"
                  style={{
                    background: items.length > 0
                      ? `color-mix(in srgb, ${cfg.color} 18%, transparent)`
                      : 'transparent',
                    color: items.length > 0 ? cfg.color : 'var(--text-tertiary)',
                  }}
                >
                  {items.length}
                </span>
              </div>

              {/* Scrollable card list */}
              <div
                className="px-2 pb-2 space-y-2 max-h-[400px] overflow-y-auto"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'var(--border-subtle) transparent',
                }}
              >
                {items.length === 0 && (
                  <p
                    className="text-[10px] text-center py-4"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    No cases
                  </p>
                )}
                {items.map((c: any) => (
                  <PipelineCard
                    key={c.caseNumber}
                    caseNumber={c.caseNumber}
                    title={c.title}
                    severity={c.severity}
                    age={c.age}
                    ccAccount={c.meta?.ccAccount}
                    isS500={!!c.meta?.ccAccount}
                    is21V={detect21V(c)}
                    onClick={() => navigate(`/cases/${c.caseNumber}`)}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

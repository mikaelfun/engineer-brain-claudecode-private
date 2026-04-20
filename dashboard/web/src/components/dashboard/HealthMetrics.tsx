/**
 * HealthMetrics — At-a-glance health dashboard
 *
 * Derives all metrics from the live cases array:
 *  1. IR SLA Ring
 *  2. Active Cases + Pipeline Mini-bar
 *  3. Avg Contact Days Ring
 *  4. Severity Stacked Bar + 7d Sparkline
 *  5. Closed This Week Ring
 */
import { Activity } from 'lucide-react'
import { RingChart } from './RingChart'
import { SparkLine } from './SparkLine'

interface HealthMetricsProps {
  cases: any[]
  className?: string
}

/* ---------- tiny helpers ---------- */

/** Metric card wrapper */
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-lg p-3 flex flex-col items-center justify-center gap-2"
      style={{ background: 'var(--bg-inset)' }}
    >
      {children}
    </div>
  )
}

/** Tiny colored legend dot + label */
function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span
        className="inline-block w-1.5 h-1.5 rounded-full"
        style={{ background: color }}
      />
      <span
        className="text-[9px]"
        style={{ color: 'var(--text-tertiary)' }}
      >
        {label}
      </span>
    </span>
  )
}

/* ---------- main component ---------- */

export function HealthMetrics({ cases, className }: HealthMetricsProps) {
  /* ---- 1. IR SLA ---- */
  const irMet = cases.filter(
    (c) => c.meta?.irSla?.status === 'met',
  ).length
  const irTotal = cases.filter((c) => c.meta?.irSla?.status).length

  /* ---- 2. Pipeline counts ---- */
  const counts = { engineer: 0, customer: 0, pg: 0, close: 0 }
  cases.forEach((c) => {
    const s: string = c.meta?.actualStatus || ''
    if (['pending-engineer', 'new', 'researching'].includes(s))
      counts.engineer++
    else if (s === 'pending-customer') counts.customer++
    else if (s === 'pending-pg') counts.pg++
    else if (['ready-to-close', 'resolved'].includes(s)) counts.close++
  })
  const total = cases.length || 1 // avoid /0
  const pct = (n: number) => (n / total) * 100

  /* ---- 3. Avg contact days ---- */
  const withDays = cases.filter(
    (c) => c.meta?.daysSinceLastContact != null,
  )
  const avgDays =
    withDays.length > 0
      ? Math.round(
          (withDays.reduce(
            (sum: number, c: any) =>
              sum + (c.meta.daysSinceLastContact ?? 0),
            0,
          ) /
            withDays.length) *
            10,
        ) / 10
      : 0
  const contactThreshold = 5
  const contactColor =
    avgDays > contactThreshold
      ? 'var(--accent-red)'
      : 'var(--accent-amber)'

  /* ---- 4. Severity counts ---- */
  const sevCounts: Record<string, number> = { A: 0, B: 0, C: 0 }
  cases.forEach((c) => {
    const sev = c.severity as string
    if (sev in sevCounts) sevCounts[sev]++
  })
  const sevTotal = sevCounts.A + sevCounts.B + sevCounts.C || 1
  const sevPct = (n: number) => (n / sevTotal) * 100

  // Mock 7d sparkline data for v1
  const sparkData = [3, 5, 4, 7, 6, 8, cases.length]

  /* ---- 5. Closed this week ---- */
  const closedCount = counts.close

  return (
    <div
      className={`rounded-xl p-4 ${className ?? ''}`}
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      {/* Section header */}
      <div className="flex items-center gap-2 mb-3">
        <Activity
          className="w-4 h-4"
          style={{ color: 'var(--accent-green)' }}
        />
        <h2
          className="text-sm font-bold"
          style={{ color: 'var(--text-primary)' }}
        >
          Health Metrics
        </h2>
      </div>

      {/* Metric grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {/* ---- 1  IR SLA ---- */}
        <Card>
          <RingChart
            value={irMet}
            max={irTotal}
            color="var(--accent-green)"
            label="IR SLA Met"
          />
        </Card>

        {/* ---- 2  Active Cases + Pipeline Mini-bar ---- */}
        <Card>
          <span
            className="font-mono text-lg font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            {cases.length}
          </span>
          <span
            className="text-[10px] font-medium"
            style={{ color: 'var(--text-tertiary)' }}
          >
            Active Cases
          </span>

          {/* Pipeline mini-bar */}
          <div className="w-full mt-1">
            <div
              className="h-2 rounded-full flex overflow-hidden"
              style={{ background: 'var(--bg-inset)' }}
            >
              <div
                style={{
                  width: `${pct(counts.engineer)}%`,
                  background: 'var(--accent-red)',
                }}
              />
              <div
                style={{
                  width: `${pct(counts.customer)}%`,
                  background: 'var(--accent-green)',
                }}
              />
              <div
                style={{
                  width: `${pct(counts.pg)}%`,
                  background: 'var(--accent-purple)',
                }}
              />
              <div
                style={{
                  width: `${pct(counts.close)}%`,
                  background: 'var(--accent-blue)',
                }}
              />
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1 justify-center">
              <LegendDot color="var(--accent-red)" label="Eng" />
              <LegendDot color="var(--accent-green)" label="Cust" />
              <LegendDot color="var(--accent-purple)" label="PG" />
              <LegendDot color="var(--accent-blue)" label="Close" />
            </div>
          </div>
        </Card>

        {/* ---- 3  Avg Contact Days ---- */}
        <Card>
          <RingChart
            value={Math.round(avgDays)}
            max={contactThreshold}
            color={contactColor}
            label="Avg Contact Days"
          />
        </Card>

        {/* ---- 4  Severity + Sparkline ---- */}
        <Card>
          <span
            className="text-[10px] font-medium mb-1"
            style={{ color: 'var(--text-tertiary)' }}
          >
            Severity Distribution
          </span>
          {/* Stacked bar */}
          <div className="w-full">
            <div
              className="h-2 rounded-full flex overflow-hidden"
              style={{ background: 'var(--bg-inset)' }}
            >
              <div
                style={{
                  width: `${sevPct(sevCounts.A)}%`,
                  background: 'var(--accent-red)',
                }}
              />
              <div
                style={{
                  width: `${sevPct(sevCounts.B)}%`,
                  background: 'var(--accent-amber)',
                }}
              />
              <div
                style={{
                  width: `${sevPct(sevCounts.C)}%`,
                  background: 'var(--accent-blue)',
                }}
              />
            </div>
            <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1 justify-center">
              <LegendDot color="var(--accent-red)" label={`A:${sevCounts.A}`} />
              <LegendDot
                color="var(--accent-amber)"
                label={`B:${sevCounts.B}`}
              />
              <LegendDot color="var(--accent-blue)" label={`C:${sevCounts.C}`} />
            </div>
          </div>
          {/* 7d sparkline */}
          <SparkLine
            data={sparkData}
            color="var(--accent-amber)"
            width={100}
            height={28}
          />
        </Card>

        {/* ---- 5  Closed This Week ---- */}
        <Card>
          <RingChart
            value={closedCount}
            max={cases.length || 1}
            color="var(--accent-blue)"
            label="Closed This Week"
          />
        </Card>
      </div>
    </div>
  )
}

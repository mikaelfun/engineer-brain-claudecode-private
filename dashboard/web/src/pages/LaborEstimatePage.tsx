/**
 * DailyOpsPage — Daily Operations: note gap detection & labor estimation
 *
 * Sections (top → bottom):
 * 1. Note Gaps — AI-drafted notes for cases with long silence, editable + submittable
 * 2. Labor Estimates — editable table with batch D365 submit
 */
import { useState, useCallback } from 'react'
import {
  useLaborEstimates,
  useLaborEstimateAll,
  useLaborEstimateUpdate,
  useLaborBatchSubmit,
  useAllNoteGaps,
  useSubmitNote,
  useDismissNoteGap,
  type LaborEstimateItem,
  type NoteGapItem,
} from '../api/hooks'

const CLASSIFICATIONS = [
  'Troubleshooting',
  'Research',
  'Communications',
  'Tech Review',
  'Scoping',
  'Recovery & Billing',
  'Admin Review',
]

// ===== NoteGapEditCard =====

function NoteGapEditCard({ gap, onUpdate }: { gap: NoteGapItem; onUpdate: () => void }) {
  const [title, setTitle] = useState(gap.title)
  const [body, setBody] = useState(gap.body)
  const submitNote = useSubmitNote(gap.caseNumber)
  const dismissGap = useDismissNoteGap(gap.caseNumber)

  const handleSubmit = async () => {
    await submitNote.mutateAsync({ title, body })
    onUpdate()
  }

  const handleDismiss = async () => {
    await dismissGap.mutateAsync()
    onUpdate()
  }

  return (
    <div
      className="rounded-lg p-4 space-y-3"
      style={{
        border: '1px solid var(--accent-amber)',
        background: 'var(--bg-secondary)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-medium text-foreground">{gap.caseNumber}</span>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: 'var(--accent-amber-dim)', color: 'var(--accent-amber)' }}
          >
            {gap.gapDays}d gap
          </span>
        </div>
        <span className="text-xs text-muted">Last note: {gap.lastNoteDate}</span>
      </div>

      {/* Editable title */}
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        className="w-full px-3 py-2 text-sm bg-surface border border-border rounded focus:outline-none text-foreground"
        placeholder="Note title..."
        onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent-amber)')}
        onBlur={e => (e.currentTarget.style.borderColor = '')}
      />

      {/* Editable body */}
      <textarea
        value={body}
        onChange={e => setBody(e.target.value)}
        rows={3}
        className="w-full px-3 py-2 text-sm bg-surface border border-border rounded focus:outline-none text-foreground resize-none"
        placeholder="Note body..."
        onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent-amber)')}
        onBlur={e => (e.currentTarget.style.borderColor = '')}
      />

      {/* Actions */}
      <div className="flex items-center gap-2 justify-end">
        <button
          onClick={handleDismiss}
          disabled={dismissGap.isPending}
          className="px-3 py-1.5 text-xs rounded-lg border border-border text-muted hover:text-foreground hover:bg-surface-hover transition-colors disabled:opacity-50"
        >
          Dismiss
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitNote.isPending || !title.trim()}
          className="px-4 py-1.5 text-xs rounded-lg disabled:opacity-50 transition-colors"
          style={{ background: 'var(--accent-amber)', color: 'var(--text-inverse)' }}
        >
          {submitNote.isPending ? 'Submitting...' : '📝 Submit Note'}
        </button>
      </div>
    </div>
  )
}

// ===== EditableRow =====

interface EditableRow {
  caseNumber: string
  caseTitle?: string
  totalMinutes: number
  classification: string
  description: string
  originalMinutes: number
  selected: boolean
  status: string
}

// ===== DailyOpsPage =====

export default function DailyOpsPage() {
  const { data, isLoading, refetch } = useLaborEstimates()
  const estimateAll = useLaborEstimateAll()
  const updateEstimate = useLaborEstimateUpdate()
  const batchSubmit = useLaborBatchSubmit()
  const { data: allGaps, refetch: refetchGaps } = useAllNoteGaps()

  const [rows, setRows] = useState<EditableRow[]>([])
  const [estimating, setEstimating] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitResults, setSubmitResults] = useState<Array<{ caseNumber: string; success: boolean; message: string }> | null>(null)

  // Initialize rows from loaded estimates
  const initRowsFromEstimates = useCallback((estimates: LaborEstimateItem[]) => {
    setRows(
      estimates
        .filter(e => e.status !== 'submitted')
        .map(e => ({
          caseNumber: e.caseNumber,
          caseTitle: (e as any).caseTitle,
          totalMinutes: e.estimated.totalMinutes,
          classification: e.estimated.classification,
          description: e.estimated.description,
          originalMinutes: e.estimated.totalMinutes,
          selected: true,
          status: e.status,
        }))
    )
  }, [])

  // Handle "Estimate All" button
  const handleEstimateAll = async () => {
    setEstimating(true)
    setSubmitResults(null)
    try {
      const result = await estimateAll.mutateAsync()
      await refetch()
      const freshEstimates = result.estimates
        .filter((r: any) => r.success && r.estimate)
        .map((r: any) => r.estimate!)
      initRowsFromEstimates(freshEstimates)
    } catch (err) {
      console.error('Estimation failed:', err)
    } finally {
      setEstimating(false)
    }
  }

  // Load existing estimates into rows
  const handleLoadExisting = () => {
    if (data?.estimates) {
      initRowsFromEstimates(data.estimates)
    }
  }

  // Update a row field
  const updateRow = (idx: number, field: keyof EditableRow, value: any) => {
    setRows(prev => {
      const next = [...prev]
      next[idx] = { ...next[idx], [field]: value }
      return next
    })
  }

  // Toggle select all
  const toggleSelectAll = () => {
    const allSelected = rows.every(r => r.selected)
    setRows(prev => prev.map(r => ({ ...r, selected: !allSelected })))
  }

  // Submit selected rows to D365
  const handleBatchSubmit = async () => {
    const selected = rows.filter(r => r.selected)
    if (selected.length === 0) return

    setSubmitting(true)
    setSubmitResults(null)
    try {
      const result = await batchSubmit.mutateAsync(
        selected.map(r => ({
          caseNumber: r.caseNumber,
          totalMinutes: r.totalMinutes,
          classification: r.classification,
          description: r.description,
        }))
      )
      setSubmitResults(result.results)
      const succeededCases = new Set(result.results.filter(r => r.success).map(r => r.caseNumber))
      setRows(prev => prev.filter(r => !succeededCases.has(r.caseNumber)))
      await refetch()
    } catch (err) {
      console.error('Batch submit failed:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const totalMinutes = rows.reduce((sum, r) => sum + (r.selected ? r.totalMinutes : 0), 0)
  const selectedCount = rows.filter(r => r.selected).length
  const pendingEstimates = data?.estimates?.filter(e => e.status !== 'submitted') ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Daily Operations</h1>
          <p className="text-sm text-muted mt-1">
            Note gap detection &amp; labor estimation for all active cases
          </p>
        </div>
        <div className="flex gap-2">
          {pendingEstimates.length > 0 && rows.length === 0 && (
            <button
              onClick={handleLoadExisting}
              className="px-4 py-2 text-sm rounded-lg border border-border text-foreground hover:bg-surface-hover transition-colors"
            >
              Load Existing ({pendingEstimates.length})
            </button>
          )}
          <button
            onClick={handleEstimateAll}
            disabled={estimating}
            className="px-4 py-2 text-sm rounded-lg disabled:opacity-50 transition-colors flex items-center gap-2"
            style={{ background: 'var(--accent-blue)', color: 'var(--text-inverse)' }}
          >
            {estimating ? (
              <>
                <span className="animate-spin inline-block">&#9203;</span>
                Estimating...
              </>
            ) : (
              <>&#129518; Estimate All</>
            )}
          </button>
        </div>
      </div>

      {/* Note Gaps Section */}
      {allGaps && allGaps.gaps.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-medium text-foreground flex items-center gap-2">
            ⚠️ Note Gaps
            <span className="text-sm font-normal text-muted">({allGaps.gaps.length} cases)</span>
          </h2>
          {allGaps.gaps.map(gap => (
            <NoteGapEditCard key={gap.caseNumber} gap={gap} onUpdate={() => refetchGaps()} />
          ))}
        </div>
      )}

      {/* Submit Results */}
      {submitResults && (
        <div
          className="p-4 rounded-lg border"
          style={
            submitResults.every(r => r.success)
              ? { borderColor: 'var(--accent-green)', background: 'var(--accent-green-dim)' }
              : { borderColor: 'var(--accent-amber)', background: 'var(--accent-amber-dim)' }
          }
        >
          <h3 className="font-medium text-sm mb-2 text-foreground">Submit Results</h3>
          {submitResults.map((r, i) => (
            <div key={i} className="text-sm text-foreground">
              {r.success ? '\u2705' : '\u274C'} Case {r.caseNumber}: {r.message}
            </div>
          ))}
        </div>
      )}

      {/* Labor Estimates Section */}
      <div className="space-y-3">
        <h2 className="text-lg font-medium text-foreground flex items-center gap-2">
          ⏱️ Labor Estimates
        </h2>

        {rows.length > 0 ? (
          <>
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-surface-secondary text-xs text-muted uppercase tracking-wider">
                    <th className="p-3 text-left w-10">
                      <input
                        type="checkbox"
                        checked={rows.length > 0 && rows.every(r => r.selected)}
                        onChange={toggleSelectAll}
                        className="rounded"
                      />
                    </th>
                    <th className="p-3 text-left">Case</th>
                    <th className="p-3 text-left w-24">Minutes</th>
                    <th className="p-3 text-left w-48">Classification</th>
                    <th className="p-3 text-left">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((row, idx) => (
                    <tr key={row.caseNumber} className="hover:bg-surface-hover transition-colors">
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={row.selected}
                          onChange={() => updateRow(idx, 'selected', !row.selected)}
                          className="rounded"
                        />
                      </td>
                      <td className="p-3">
                        <div className="font-mono text-sm text-foreground">{row.caseNumber}</div>
                        {row.caseTitle && (
                          <div className="text-xs text-muted truncate max-w-[200px]">{row.caseTitle}</div>
                        )}
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          value={row.totalMinutes}
                          onChange={e => updateRow(idx, 'totalMinutes', parseInt(e.target.value) || 0)}
                          min={0}
                          max={480}
                          className="w-20 px-2 py-1 text-sm bg-surface border border-border rounded focus:outline-none text-foreground"
                          style={{ '--focus-color': 'var(--accent-blue)' } as React.CSSProperties}
                          onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent-blue)')}
                          onBlur={e => (e.currentTarget.style.borderColor = '')}
                        />
                      </td>
                      <td className="p-3">
                        <select
                          value={row.classification}
                          onChange={e => updateRow(idx, 'classification', e.target.value)}
                          className="w-full px-2 py-1 text-sm bg-surface border border-border rounded focus:border-accent-blue focus:outline-none text-foreground"
                        >
                          {CLASSIFICATIONS.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={row.description}
                          onChange={e => updateRow(idx, 'description', e.target.value)}
                          className="w-full px-2 py-1 text-sm bg-surface border border-border rounded focus:border-accent-blue focus:outline-none text-foreground"
                          placeholder="Labor description..."
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted">
                {selectedCount} selected &middot; Total:{' '}
                <span className="font-mono font-medium text-foreground">{totalMinutes}</span> min
              </div>
              <button
                onClick={handleBatchSubmit}
                disabled={submitting || selectedCount === 0}
                className="px-6 py-2 text-sm rounded-lg disabled:opacity-50 transition-colors flex items-center gap-2"
                style={{ background: 'var(--accent-green)', color: 'var(--text-inverse)' }}
              >
                {submitting ? (
                  <>
                    <span className="animate-spin inline-block">&#9203;</span>
                    Submitting...
                  </>
                ) : (
                  <>&#128228; Submit Selected ({selectedCount})</>
                )}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-16 text-muted">
            <div className="text-4xl mb-4">&#129518;</div>
            <h3 className="text-lg font-medium text-foreground mb-2">No Labor Estimates</h3>
            <p className="text-sm">
              Click &quot;Estimate All&quot; to analyze today&apos;s activities across all active cases.
            </p>
            {pendingEstimates.length > 0 && (
              <p className="text-sm mt-2">
                Or load {pendingEstimates.length} existing estimate{pendingEstimates.length > 1 ? 's' : ''} from previous runs.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

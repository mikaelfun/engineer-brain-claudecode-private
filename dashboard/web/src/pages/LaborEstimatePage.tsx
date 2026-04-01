/**
 * DailyOpsPage — Daily Operations: note gap detection & labor estimation
 *
 * Layout: Left-right split
 * - Left: Note Gaps (always visible, empty state when no gaps)
 * - Right: Labor Estimates (table with batch submit)
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
  const [submitted, setSubmitted] = useState(false)
  const submitNote = useSubmitNote(gap.caseNumber)
  const dismissGap = useDismissNoteGap(gap.caseNumber)

  const handleSubmit = async () => {
    await submitNote.mutateAsync({ title, body })
    setSubmitted(true)
    setTimeout(() => onUpdate(), 1500)
  }

  const handleDismiss = async () => {
    await dismissGap.mutateAsync()
    onUpdate()
  }

  if (submitted) {
    return (
      <div className="rounded-lg p-3 text-center text-sm"
        style={{ border: '1px solid var(--accent-green)', background: 'var(--accent-green-dim)', color: 'var(--accent-green)' }}>
        ✅ Note submitted for {gap.caseNumber}
      </div>
    )
  }

  return (
    <div className="rounded-lg p-3 space-y-2"
      style={{ border: '1px solid var(--accent-amber)', background: 'var(--bg-secondary)' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-medium text-foreground">{gap.caseNumber}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
            style={{ background: 'var(--accent-amber-dim)', color: 'var(--accent-amber)' }}>
            {gap.gapDays}d
          </span>
        </div>
        <span className="text-[10px] text-muted">Last: {gap.lastNoteDate}</span>
      </div>

      {/* Title */}
      <input type="text" value={title} onChange={e => setTitle(e.target.value)}
        className="w-full px-2 py-1 text-xs bg-surface border border-border rounded focus:outline-none text-foreground"
        placeholder="Note title..."
        onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent-amber)')}
        onBlur={e => (e.currentTarget.style.borderColor = '')} />

      {/* Body */}
      <textarea value={body} onChange={e => setBody(e.target.value)} rows={4}
        className="w-full px-2 py-1 text-xs bg-surface border border-border rounded focus:outline-none text-foreground resize-none font-mono"
        placeholder="Note body..."
        onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent-amber)')}
        onBlur={e => (e.currentTarget.style.borderColor = '')} />

      {/* Actions */}
      <div className="flex items-center gap-2 justify-end">
        <button onClick={handleDismiss} disabled={dismissGap.isPending}
          className="px-2 py-1 text-[10px] rounded border border-border text-muted hover:text-foreground hover:bg-surface-hover transition-colors disabled:opacity-50">
          Dismiss
        </button>
        <button onClick={handleSubmit} disabled={submitNote.isPending || !title.trim() || !body.trim()}
          className="px-3 py-1 text-[10px] rounded disabled:opacity-50 transition-colors"
          style={{ background: 'var(--accent-amber)', color: 'var(--text-inverse)' }}>
          {submitNote.isPending ? 'Writing...' : '📝 Write to D365'}
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

  const handleLoadExisting = () => {
    if (data?.estimates) {
      initRowsFromEstimates(data.estimates)
    }
  }

  const updateRow = (idx: number, field: keyof EditableRow, value: any) => {
    setRows(prev => {
      const next = [...prev]
      next[idx] = { ...next[idx], [field]: value }
      return next
    })
  }

  const toggleSelectAll = () => {
    const allSelected = rows.every(r => r.selected)
    setRows(prev => prev.map(r => ({ ...r, selected: !allSelected })))
  }

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
  const gapCount = allGaps?.gaps?.length ?? 0

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Daily Operations</h1>
        <p className="text-sm text-muted mt-1">
          Note gap detection &amp; labor estimation for all active cases
        </p>
      </div>

      {/* Left-Right Split */}
      <div className="flex gap-4 items-start">

        {/* ===== Left: Note Gaps (always visible) ===== */}
        <div className="w-[400px] min-w-[360px] shrink-0 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-foreground flex items-center gap-2">
              ⚠️ Note Gaps
              {gapCount > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded-full"
                  style={{ background: 'var(--accent-amber-dim)', color: 'var(--accent-amber)' }}>
                  {gapCount}
                </span>
              )}
            </h2>
            {/* TODO: "Check All" button to trigger batch /note-gap via SDK */}
          </div>

          {gapCount > 0 ? (
            <div className="space-y-2">
              {allGaps!.gaps.map(gap => (
                <NoteGapEditCard key={gap.caseNumber} gap={gap} onUpdate={() => refetchGaps()} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg p-6 text-center"
              style={{ border: '1px dashed var(--border-default)', background: 'var(--bg-secondary)' }}>
              <div className="text-2xl mb-2">✅</div>
              <p className="text-sm text-muted">All notes up to date</p>
              <p className="text-xs text-muted mt-1">
                Run <code className="px-1 py-0.5 rounded text-xs" style={{ background: 'var(--bg-tertiary)' }}>/note-gap</code> in CLI to check for gaps
              </p>
            </div>
          )}
        </div>

        {/* ===== Right: Labor Estimates ===== */}
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-foreground flex items-center gap-2">
              ⏱️ Labor Estimates
            </h2>
            <div className="flex gap-2">
              {pendingEstimates.length > 0 && rows.length === 0 && (
                <button onClick={handleLoadExisting}
                  className="px-3 py-1.5 text-xs rounded-lg border border-border text-foreground hover:bg-surface-hover transition-colors">
                  Load Existing ({pendingEstimates.length})
                </button>
              )}
              <button onClick={handleEstimateAll} disabled={estimating}
                className="px-3 py-1.5 text-xs rounded-lg disabled:opacity-50 transition-colors flex items-center gap-1.5"
                style={{ background: 'var(--accent-blue)', color: 'var(--text-inverse)' }}>
                {estimating ? (
                  <><span className="animate-spin inline-block">⏳</span> Estimating...</>
                ) : (
                  <>🧮 Estimate All</>
                )}
              </button>
            </div>
          </div>

          {/* Submit Results */}
          {submitResults && (
            <div className="p-3 rounded-lg border text-sm"
              style={submitResults.every(r => r.success)
                ? { borderColor: 'var(--accent-green)', background: 'var(--accent-green-dim)' }
                : { borderColor: 'var(--accent-amber)', background: 'var(--accent-amber-dim)' }}>
              {submitResults.map((r, i) => (
                <div key={i} className="text-foreground">
                  {r.success ? '✅' : '❌'} Case {r.caseNumber}: {r.message}
                </div>
              ))}
            </div>
          )}

          {/* Labor Table */}
          {rows.length > 0 ? (
            <>
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-surface-secondary text-xs text-muted uppercase tracking-wider">
                      <th className="p-2 text-left w-8">
                        <input type="checkbox"
                          checked={rows.length > 0 && rows.every(r => r.selected)}
                          onChange={toggleSelectAll} className="rounded" />
                      </th>
                      <th className="p-2 text-left">Case</th>
                      <th className="p-2 text-left w-20">Min</th>
                      <th className="p-2 text-left w-40">Classification</th>
                      <th className="p-2 text-left">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {rows.map((row, idx) => (
                      <tr key={row.caseNumber} className="hover:bg-surface-hover transition-colors">
                        <td className="p-2">
                          <input type="checkbox" checked={row.selected}
                            onChange={() => updateRow(idx, 'selected', !row.selected)} className="rounded" />
                        </td>
                        <td className="p-2">
                          <div className="font-mono text-xs text-foreground">{row.caseNumber}</div>
                          {row.caseTitle && (
                            <div className="text-[10px] text-muted truncate max-w-[180px]">{row.caseTitle}</div>
                          )}
                        </td>
                        <td className="p-2">
                          <input type="number" value={row.totalMinutes}
                            onChange={e => updateRow(idx, 'totalMinutes', parseInt(e.target.value) || 0)}
                            min={0} max={480}
                            className="w-16 px-1.5 py-1 text-xs bg-surface border border-border rounded focus:outline-none text-foreground"
                            onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent-blue)')}
                            onBlur={e => (e.currentTarget.style.borderColor = '')} />
                        </td>
                        <td className="p-2">
                          <select value={row.classification}
                            onChange={e => updateRow(idx, 'classification', e.target.value)}
                            className="w-full px-1.5 py-1 text-xs bg-surface border border-border rounded focus:outline-none text-foreground">
                            {CLASSIFICATIONS.map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-2">
                          <input type="text" value={row.description}
                            onChange={e => updateRow(idx, 'description', e.target.value)}
                            className="w-full px-1.5 py-1 text-xs bg-surface border border-border rounded focus:outline-none text-foreground"
                            placeholder="Description..." />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted">
                  {selectedCount} selected · Total: <span className="font-mono font-medium text-foreground">{totalMinutes}</span> min
                </div>
                <button onClick={handleBatchSubmit} disabled={submitting || selectedCount === 0}
                  className="px-4 py-1.5 text-xs rounded-lg disabled:opacity-50 transition-colors flex items-center gap-1.5"
                  style={{ background: 'var(--accent-green)', color: 'var(--text-inverse)' }}>
                  {submitting ? (
                    <><span className="animate-spin inline-block">⏳</span> Submitting...</>
                  ) : (
                    <>📤 Submit Selected ({selectedCount})</>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="rounded-lg p-6 text-center"
              style={{ border: '1px dashed var(--border-default)', background: 'var(--bg-secondary)' }}>
              <div className="text-2xl mb-2">🧮</div>
              <p className="text-sm text-muted">No labor estimates</p>
              <p className="text-xs text-muted mt-1">
                Click "Estimate All" or run <code className="px-1 py-0.5 rounded text-xs" style={{ background: 'var(--bg-tertiary)' }}>/labor-estimate all</code> in CLI
              </p>
              {pendingEstimates.length > 0 && (
                <p className="text-xs text-muted mt-1">
                  Or load {pendingEstimates.length} existing estimate{pendingEstimates.length > 1 ? 's' : ''}.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

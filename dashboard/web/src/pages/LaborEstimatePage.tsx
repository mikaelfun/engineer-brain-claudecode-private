/**
 * DailyOpsPage — Daily Operations: note gap detection & labor estimation
 *
 * Layout: Left-right equal split (50/50)
 * - Left: Note Gaps (always visible, empty state when no gaps)
 * - Right: Labor Estimates (cards with batch submit)
 */
import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  useLaborEstimates,
  useLaborEstimateAll,
  useLaborEstimateUpdate,
  useLaborEstimateDiscard,
  useLaborEstimateDiscardAll,
  useLaborBatchSubmit,
  useAllNoteGaps,
  useCheckAllNoteGaps,
  type LaborEstimateItem,
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

// ===== NoteGapRow (managed by parent) =====

interface NoteGapRow {
  caseNumber: string
  caseTitle?: string
  gapDays: number
  lastNoteDate: string
  title: string
  body: string
  selected: boolean
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
  daysSinceLastLabor?: number
  lastLaborDate?: string
}

// ===== DailyOpsPage =====

export default function DailyOpsPage() {
  const navigate = useNavigate()
  const { data, isLoading, refetch } = useLaborEstimates()
  const estimateAll = useLaborEstimateAll()
  const updateEstimate = useLaborEstimateUpdate()
  const discardOne = useLaborEstimateDiscard()
  const discardAll = useLaborEstimateDiscardAll()
  const batchSubmit = useLaborBatchSubmit()
  const { data: allGaps, refetch: refetchGaps } = useAllNoteGaps()
  const checkAllGaps = useCheckAllNoteGaps()

  const [rows, setRows] = useState<EditableRow[]>([])
  const [estimating, setEstimating] = useState(false)
  const [checking, setChecking] = useState(false)
  const [checkResult, setCheckResult] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitResults, setSubmitResults] = useState<Array<{ caseNumber: string; success: boolean; message: string }> | null>(null)

  // Note Gap state (lifted from NoteGapEditCard)
  const [gapRows, setGapRows] = useState<NoteGapRow[]>([])
  const [submittingNotes, setSubmittingNotes] = useState(false)
  const [noteSubmitResults, setNoteSubmitResults] = useState<Array<{ caseNumber: string; success: boolean; message: string }> | null>(null)

  // Sync gapRows from allGaps data
  useEffect(() => {
    if (allGaps?.gaps && allGaps.gaps.length > 0) {
      setGapRows(prev => {
        // Merge: keep edited values for existing rows, add new ones
        const existing = new Map(prev.map(r => [r.caseNumber, r]))
        return allGaps.gaps.map(g => {
          const ex = existing.get(g.caseNumber)
          return ex || {
            caseNumber: g.caseNumber,
            caseTitle: (g as any).caseTitle,
            gapDays: g.gapDays,
            lastNoteDate: g.lastNoteDate,
            title: g.title,
            body: g.body,
            selected: true,
          }
        })
      })
    } else {
      setGapRows([])
    }
  }, [allGaps?.gaps])

  const updateGapRow = (idx: number, field: keyof NoteGapRow, value: any) => {
    setGapRows(prev => {
      const next = [...prev]
      next[idx] = { ...next[idx], [field]: value }
      return next
    })
  }

  const toggleSelectAllGaps = () => {
    const allSelected = gapRows.every(r => r.selected)
    setGapRows(prev => prev.map(r => ({ ...r, selected: !allSelected })))
  }

  const selectedGapCount = gapRows.filter(r => r.selected).length

  const handleBatchSubmitNotes = async () => {
    const selected = gapRows.filter(r => r.selected && r.title.trim() && r.body.trim())
    if (selected.length === 0) return

    setSubmittingNotes(true)
    setNoteSubmitResults(null)
    const results: Array<{ caseNumber: string; success: boolean; message: string }> = []

    for (const gap of selected) {
      try {
        const res = await fetch(`/api/case/${gap.caseNumber}/note-gap/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('eb_token')}` },
          body: JSON.stringify({ title: gap.title, body: gap.body }),
        })
        const data = await res.json()
        results.push({ caseNumber: gap.caseNumber, success: res.ok, message: res.ok ? 'Note written' : (data.error || 'Failed') })
      } catch (e: any) {
        results.push({ caseNumber: gap.caseNumber, success: false, message: e.message || 'Network error' })
      }
    }

    setNoteSubmitResults(results)
    const succeededCases = new Set(results.filter(r => r.success).map(r => r.caseNumber))
    setGapRows(prev => prev.filter(r => !succeededCases.has(r.caseNumber)))
    await refetchGaps()
    setSubmittingNotes(false)
  }

  const handleDismissGap = async (caseNumber: string, idx: number) => {
    try {
      await fetch(`/api/case/${caseNumber}/note-gap`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('eb_token')}` },
      })
    } catch {}
    setGapRows(prev => prev.filter((_, i) => i !== idx))
    refetchGaps()
  }

  const initRowsFromEstimates = useCallback((estimates: LaborEstimateItem[]) => {
    setRows(
      estimates
        .filter(e => e.status !== 'submitted' && (e as any).daysSinceLastLabor !== 0 && e.estimated.totalMinutes > 0)
        .map(e => ({
          caseNumber: e.caseNumber,
          caseTitle: (e as any).caseTitle,
          totalMinutes: e.estimated.totalMinutes,
          classification: e.estimated.classification,
          description: e.estimated.description,
          originalMinutes: e.estimated.totalMinutes,
          selected: true,
          status: e.status,
          daysSinceLastLabor: (e as any).daysSinceLastLabor,
          lastLaborDate: (e as any).lastLaborDate,
        }))
    )
  }, [])

  // Auto-load rows from cache when returning to page
  const autoLoaded = useRef(false)
  useEffect(() => {
    if (!autoLoaded.current && data?.estimates && data.estimates.length > 0 && rows.length === 0) {
      const pending = data.estimates.filter(e => e.status !== 'submitted')
      if (pending.length > 0) {
        initRowsFromEstimates(data.estimates)
        autoLoaded.current = true
      }
    }
  }, [data?.estimates])

  const [estimateProgress, setEstimateProgress] = useState<string | null>(null)

  const handleEstimateAll = async () => {
    setEstimating(true)
    setSubmitResults(null)
    setEstimateProgress(null)

    // Listen for SSE progress events
    const evtSource = new EventSource('/api/events')
    const progressHandler = (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data)
        if (data.type === 'labor-estimate-progress') {
          const p = data.payload
          if (p.status === 'estimating') {
            setEstimateProgress(`正在估算 Case ${p.current}... (${p.completed + 1}/${p.total})`)
          } else if (p.status === 'completed') {
            setEstimateProgress(`完成！已估算 ${p.total} 个 Case`)
          }
        }
      } catch {}
    }
    evtSource.addEventListener('message', progressHandler)

    try {
      const result = await estimateAll.mutateAsync()
      await refetch()
      const freshEstimates = result.estimates
        .filter((r: any) => r.success && r.estimate)
        .map((r: any) => r.estimate!)
      initRowsFromEstimates(freshEstimates)
    } catch (err) {
      console.error('Estimation failed:', err)
      setEstimateProgress('估算失败')
    } finally {
      evtSource.close()
      setEstimating(false)
      setTimeout(() => setEstimateProgress(null), 5000)
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

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Daily Operations</h1>
        <p className="text-sm text-muted mt-1">
          Note gap detection &amp; labor estimation for all active cases
        </p>
      </div>

      {/* Left-Right Split — equal 50/50 */}
      <div className="grid grid-cols-2 gap-4 items-start">

        {/* ===== Left: Note Gaps (always visible) ===== */}
        <div className="min-w-0 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-medium text-foreground flex items-center gap-2">
              ⚠️ Note Gaps
              {gapRows.length > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded-full"
                  style={{ background: 'var(--accent-amber-dim)', color: 'var(--accent-amber)' }}>
                  {gapRows.length}
                </span>
              )}
            </h2>
            <div className="flex gap-2">
              {gapRows.length > 0 && (
                <button onClick={async () => {
                  for (const gap of gapRows) {
                    try { await fetch(`/api/case/${gap.caseNumber}/note-gap`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('eb_token')}` } }) } catch {}
                  }
                  setGapRows([])
                  refetchGaps()
                }}
                  className="px-3 py-1.5 text-xs rounded-lg border border-border text-muted hover:text-foreground hover:bg-surface-hover transition-colors">
                  Dismiss All
                </button>
              )}
              {selectedGapCount > 0 && (
                <button onClick={handleBatchSubmitNotes} disabled={submittingNotes}
                  className="px-3 py-1.5 text-xs rounded-lg disabled:opacity-50 transition-colors flex items-center gap-1.5"
                  style={{ background: 'var(--accent-green)', color: 'var(--text-inverse)' }}>
                  {submittingNotes ? (
                    <><span className="animate-spin inline-block">⏳</span> Submitting...</>
                  ) : (
                    <>📤 Submit ({selectedGapCount})</>
                  )}
                </button>
              )}
              <button
                onClick={async () => {
                  setChecking(true)
                  setCheckResult(null)
                  try {
                    const result = await checkAllGaps.mutateAsync()
                    setCheckResult(`检测 ${result.checked} cases，发现 ${result.gaps} 个 gap，新生成 ${result.generated} 个 draft`)
                    await refetchGaps()
                  } catch (e: any) {
                    setCheckResult(`检测失败: ${e.message || '未知错误'}`)
                  } finally {
                    setChecking(false)
                  }
                }}
                disabled={checking}
                className="px-3 py-1.5 text-sm rounded-lg disabled:opacity-50 transition-colors flex items-center gap-1.5"
                style={{ background: 'var(--accent-amber)', color: 'var(--text-inverse)' }}
              >
                {checking ? (
                  <><span className="animate-spin inline-block">⏳</span> 检测中...</>
                ) : (
                  <>🔍 Check All</>
                )}
              </button>
            </div>
          </div>

          {checkResult && (
            <div className="text-xs px-3 py-1.5 rounded"
              style={{
                background: checkResult.includes('失败') ? 'color-mix(in srgb, var(--accent-red) 10%, transparent)' : 'color-mix(in srgb, var(--accent-green) 10%, transparent)',
                color: checkResult.includes('失败') ? 'var(--accent-red)' : 'var(--accent-green)',
              }}>
              {checkResult}
            </div>
          )}

          {/* Note Submit Results */}
          {noteSubmitResults && (
            <div className="p-3 rounded-lg border text-sm"
              style={noteSubmitResults.every(r => r.success)
                ? { borderColor: 'var(--accent-green)', background: 'var(--accent-green-dim)' }
                : { borderColor: 'var(--accent-amber)', background: 'var(--accent-amber-dim)' }}>
              {noteSubmitResults.map((r, i) => (
                <div key={i} className="text-foreground">
                  {r.success ? '✅' : '❌'} Case {r.caseNumber}: {r.message}
                </div>
              ))}
            </div>
          )}

          {gapRows.length > 0 ? (
            <>
              {/* Select All */}
              <div className="flex items-center justify-between px-1">
                <label className="flex items-center gap-1.5 text-xs cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
                  <input type="checkbox"
                    checked={gapRows.length > 0 && gapRows.every(r => r.selected)}
                    onChange={toggleSelectAllGaps} className="rounded" />
                  Select All
                </label>
                <span className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>
                  {selectedGapCount}/{gapRows.length}
                </span>
              </div>

              {/* Gap Cards */}
              <div className="space-y-2">
                {gapRows.map((gap, idx) => (
                  <div key={gap.caseNumber}
                    className="rounded-lg px-3 py-2 transition-colors"
                    style={{
                      border: gap.selected ? '1px solid var(--accent-amber)' : '1px solid var(--border-default)',
                      background: 'var(--bg-secondary)',
                    }}>
                    {/* Row 1: checkbox + caseID + title + gap badge + dismiss */}
                    <div className="flex items-center gap-2 mb-1.5">
                      <input type="checkbox" checked={gap.selected}
                        onChange={() => updateGapRow(idx, 'selected', !gap.selected)} className="rounded flex-shrink-0" />
                      <span className="font-mono text-xs font-medium cursor-pointer hover:underline flex-shrink-0"
                        style={{ color: 'var(--accent-blue)' }}
                        onClick={() => navigate(`/case/${gap.caseNumber}?tab=notes`)}>
                        {gap.caseNumber}
                      </span>
                      {gap.caseTitle && (
                        <span className="text-xs truncate min-w-0" style={{ color: 'var(--text-tertiary)' }} title={gap.caseTitle}>
                          {gap.caseTitle.includes('|') ? gap.caseTitle.split('|').pop()!.trim() : gap.caseTitle}
                        </span>
                      )}
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0"
                        style={{ background: 'var(--accent-amber-dim)', color: 'var(--accent-amber)' }}>
                        {gap.gapDays}d
                      </span>
                      <button
                        onClick={() => handleDismissGap(gap.caseNumber, idx)}
                        className="ml-auto p-0.5 rounded transition-colors flex-shrink-0"
                        style={{ color: 'var(--text-tertiary)' }}
                        title="Dismiss"
                      >✕</button>
                    </div>

                    {/* Row 2: title input */}
                    <input type="text" value={gap.title}
                      onChange={e => updateGapRow(idx, 'title', e.target.value)}
                      className="w-full px-2 py-1 text-xs bg-surface border border-border rounded focus:outline-none text-foreground mb-1"
                      placeholder="Note title..."
                      onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent-amber)')}
                      onBlur={e => (e.currentTarget.style.borderColor = '')} />

                    {/* Row 3: body textarea */}
                    <textarea value={gap.body}
                      onChange={e => updateGapRow(idx, 'body', e.target.value)}
                      rows={4}
                      className="w-full px-2 py-1 text-xs bg-surface border border-border rounded focus:outline-none text-foreground resize-y font-mono min-h-[60px]"
                      placeholder="Note body..."
                      onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent-amber)')}
                      onBlur={e => (e.currentTarget.style.borderColor = '')} />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-lg p-6 text-center"
              style={{ border: '1px dashed var(--border-default)', background: 'var(--bg-secondary)' }}>
              <div className="text-2xl mb-2">✅</div>
              <p className="text-sm text-muted">All notes up to date</p>
              <p className="text-xs text-muted mt-1">
                Click <strong>Check All</strong> to scan for new gaps
              </p>
            </div>
          )}
        </div>

        {/* ===== Right: Labor Estimates ===== */}
        <div className="min-w-0 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-medium text-foreground flex items-center gap-2">
              ⏱️ Labor Estimates
            </h2>
            <div className="flex gap-2">
              {(pendingEstimates.length > 0 || rows.length > 0) && (
                <button onClick={async () => {
                  await discardAll.mutateAsync()
                  setRows([])
                  await refetch()
                }}
                  disabled={discardAll.isPending}
                  className="px-3 py-1.5 text-xs rounded-lg border border-border text-muted hover:text-foreground hover:bg-surface-hover transition-colors disabled:opacity-50">
                  {discardAll.isPending ? 'Discarding...' : 'Discard All'}
                </button>
              )}
              {selectedCount > 0 && (
                <button onClick={handleBatchSubmit} disabled={submitting || selectedCount === 0}
                  className="px-3 py-1.5 text-xs rounded-lg disabled:opacity-50 transition-colors flex items-center gap-1.5"
                  style={{ background: 'var(--accent-green)', color: 'var(--text-inverse)' }}>
                  {submitting ? (
                    <><span className="animate-spin inline-block">⏳</span> Submitting...</>
                  ) : (
                    <>📤 Submit ({selectedCount})</>
                  )}
                </button>
              )}
              {pendingEstimates.length > 0 && rows.length === 0 && (
                <button onClick={handleLoadExisting}
                  className="px-3 py-1.5 text-xs rounded-lg border border-border text-foreground hover:bg-surface-hover transition-colors">
                  Load Existing ({pendingEstimates.length})
                </button>
              )}
              <button onClick={handleEstimateAll} disabled={estimating}
                className="px-3 py-1.5 text-sm rounded-lg disabled:opacity-50 transition-colors flex items-center gap-1.5"
                style={{ background: 'var(--accent-blue)', color: 'var(--text-inverse)' }}>
                {estimating ? (
                  <><span className="animate-spin inline-block">⏳</span> Estimating...</>
                ) : (
                  <>🧮 Estimate All</>
                )}
              </button>
            </div>
          </div>

          {/* Estimate Progress */}
          {estimateProgress && (
            <div className="text-xs px-3 py-1.5 rounded"
              style={{
                background: estimateProgress.includes('失败')
                  ? 'color-mix(in srgb, var(--accent-red) 10%, transparent)'
                  : 'color-mix(in srgb, var(--accent-blue) 10%, transparent)',
                color: estimateProgress.includes('失败') ? 'var(--accent-red)' : 'var(--accent-blue)',
              }}>
              {estimateProgress}
            </div>
          )}

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

          {/* Labor Cards */}
          {rows.length > 0 ? (
            <>
              {/* Select All + Summary Bar */}
              <div className="flex items-center justify-between px-1">
                <label className="flex items-center gap-1.5 text-xs cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
                  <input type="checkbox"
                    checked={rows.length > 0 && rows.every(r => r.selected)}
                    onChange={toggleSelectAll} className="rounded" />
                  Select All
                </label>
                <span className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>
                  {selectedCount}/{rows.length} · {totalMinutes} min
                </span>
              </div>

              {/* Cards */}
              <div className="space-y-2">
                {rows.map((row, idx) => (
                  <div key={row.caseNumber}
                    className="rounded-lg px-3 py-2 transition-colors"
                    style={{
                      border: row.selected ? '1px solid var(--accent-blue)' : '1px solid var(--border-default)',
                      background: 'var(--bg-secondary)',
                    }}>
                    {/* Row 1: checkbox + caseID + title + days badge + discard */}
                    <div className="flex items-center gap-2 mb-1.5 min-w-0">
                      <input type="checkbox" checked={row.selected}
                        onChange={() => updateRow(idx, 'selected', !row.selected)} className="rounded flex-shrink-0" />
                      <span className="font-mono text-xs font-medium cursor-pointer hover:underline flex-shrink-0"
                        style={{ color: 'var(--accent-blue)' }}
                        onClick={() => navigate(`/case/${row.caseNumber}?tab=notes`)}>
                        {row.caseNumber}
                      </span>
                      {row.caseTitle && (
                        <span className="text-xs truncate flex-1 min-w-0" style={{ color: 'var(--text-tertiary)' }} title={row.caseTitle}>
                          {row.caseTitle.includes('|') ? row.caseTitle.split('|').pop()!.trim() : row.caseTitle}
                        </span>
                      )}
                      {row.daysSinceLastLabor != null && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0"
                          style={{
                            background: row.daysSinceLastLabor === 0 ? 'var(--accent-green-dim)' : row.daysSinceLastLabor >= 3 ? 'var(--accent-red-dim)' : 'var(--accent-blue-dim)',
                            color: row.daysSinceLastLabor === 0 ? 'var(--accent-green)' : row.daysSinceLastLabor >= 3 ? 'var(--accent-red)' : 'var(--accent-blue)',
                          }}
                          title={row.lastLaborDate ? `Last labor: ${row.lastLaborDate}` : undefined}>
                          {row.daysSinceLastLabor === 0 ? '✓ today' : `${row.daysSinceLastLabor}d`}
                        </span>
                      )}
                      <button
                        onClick={async () => {
                          await discardOne.mutateAsync(row.caseNumber)
                          setRows(prev => prev.filter((_, i) => i !== idx))
                          await refetch()
                        }}
                        className="p-0.5 rounded transition-colors flex-shrink-0"
                        style={{ color: 'var(--text-tertiary)' }}
                        title="Discard"
                      >✕</button>
                    </div>

                    {/* Row 2: left (min + classification) | right (description) — equal height */}
                    <div className="flex items-stretch gap-3">
                      {/* Left: time + classification stacked */}
                      <div className="flex-shrink-0 space-y-1" style={{ width: '140px' }}>
                        <div className="flex items-center gap-1.5">
                          <input type="number" value={row.totalMinutes}
                            onChange={e => updateRow(idx, 'totalMinutes', parseInt(e.target.value) || 0)}
                            min={0} max={480}
                            className="w-14 px-1 py-0.5 text-sm font-semibold bg-surface border border-border rounded focus:outline-none text-foreground text-center"
                            onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent-blue)')}
                            onBlur={e => (e.currentTarget.style.borderColor = '')} />
                          <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>min</span>
                        </div>
                        <select value={row.classification}
                          onChange={e => updateRow(idx, 'classification', e.target.value)}
                          className="w-full px-1 py-0.5 text-[10px] bg-surface border border-border rounded focus:outline-none text-foreground">
                          {CLASSIFICATIONS.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      {/* Right: description — stretches to match left height */}
                      <textarea value={row.description}
                        onChange={e => updateRow(idx, 'description', e.target.value)}
                        className="flex-1 min-w-0 px-2 py-1 text-xs bg-surface border border-border rounded focus:outline-none text-foreground resize-none"
                        placeholder="Description..."
                        onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent-blue)')}
                        onBlur={e => (e.currentTarget.style.borderColor = '')} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-lg p-6 text-center"
              style={{ border: '1px dashed var(--border-default)', background: 'var(--bg-secondary)' }}>
              <div className="text-2xl mb-2">🧮</div>
              <p className="text-sm text-muted">No labor estimates</p>
              <p className="text-xs text-muted mt-1">
                Click <strong>Estimate All</strong> to scan for new estimates
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

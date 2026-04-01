/**
 * LaborEstimatePage — Batch labor estimation with editable table
 *
 * Flow:
 * 1. "Estimate All" button triggers AI estimation for all active cases
 * 2. Results shown in editable table (minutes, classification, description)
 * 3. User can edit inline, select cases, and batch submit to D365
 */
import { useState, useCallback } from 'react'
import {
  useLaborEstimates,
  useLaborEstimateAll,
  useLaborEstimateUpdate,
  useLaborBatchSubmit,
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

export default function LaborEstimatePage() {
  const { data, isLoading, refetch } = useLaborEstimates()
  const estimateAll = useLaborEstimateAll()
  const updateEstimate = useLaborEstimateUpdate()
  const batchSubmit = useLaborBatchSubmit()

  const [rows, setRows] = useState<EditableRow[]>([])
  const [estimating, setEstimating] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitResults, setSubmitResults] = useState<Array<{ caseNumber: string; success: boolean; message: string }> | null>(null)

  // Initialize rows from loaded estimates
  const initRowsFromEstimates = useCallback((estimates: LaborEstimateItem[]) => {
    setRows(estimates
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
      // Build rows from fresh estimates
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
      // Remove submitted rows
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
          <h1 className="text-2xl font-semibold text-foreground">Labor Estimates</h1>
          <p className="text-sm text-muted mt-1">
            AI-powered labor time estimation for D365 cases
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
            className="px-4 py-2 text-sm rounded-lg bg-accent-blue text-white hover:bg-accent-blue/90 disabled:opacity-50 transition-colors flex items-center gap-2"
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

      {/* Submit Results */}
      {submitResults && (
        <div className={`p-4 rounded-lg border ${
          submitResults.every(r => r.success)
            ? 'border-accent-green/30 bg-accent-green/5'
            : 'border-accent-yellow/30 bg-accent-yellow/5'
        }`}>
          <h3 className="font-medium text-sm mb-2 text-foreground">Submit Results</h3>
          {submitResults.map((r, i) => (
            <div key={i} className="text-sm text-foreground">
              {r.success ? '\u2705' : '\u274C'} Case {r.caseNumber}: {r.message}
            </div>
          ))}
        </div>
      )}

      {/* Editable Table */}
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
                        onChange={(e) => updateRow(idx, 'totalMinutes', parseInt(e.target.value) || 0)}
                        min={0}
                        max={480}
                        className="w-20 px-2 py-1 text-sm bg-surface border border-border rounded focus:border-accent-blue focus:outline-none text-foreground"
                      />
                    </td>
                    <td className="p-3">
                      <select
                        value={row.classification}
                        onChange={(e) => updateRow(idx, 'classification', e.target.value)}
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
                        onChange={(e) => updateRow(idx, 'description', e.target.value)}
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
              {selectedCount} selected &middot; Total: <span className="font-mono font-medium text-foreground">{totalMinutes}</span> min
            </div>
            <button
              onClick={handleBatchSubmit}
              disabled={submitting || selectedCount === 0}
              className="px-6 py-2 text-sm rounded-lg bg-accent-green text-white hover:bg-accent-green/90 disabled:opacity-50 transition-colors flex items-center gap-2"
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
  )
}

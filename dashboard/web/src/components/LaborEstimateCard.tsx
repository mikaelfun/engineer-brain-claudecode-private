import { useState } from 'react'
import { Clock, X, CheckCircle, RefreshCw, Calculator } from 'lucide-react'
import {
  useLaborEstimate,
  useLaborEstimateTrigger,
  useLaborEstimateUpdate,
  useLaborEstimateDiscard,
  useLaborSubmit,
} from '../api/hooks'

interface LaborEstimateCardProps {
  caseNumber: string
  hasLaborToday?: boolean
}

const CLASSIFICATIONS = [
  'Troubleshooting', 'Research', 'Communications', 'Tech Review',
  'Scoping', 'Recovery & Billing', 'Admin Review',
]

export function LaborEstimateCard({ caseNumber, hasLaborToday }: LaborEstimateCardProps) {
  const { data, isLoading } = useLaborEstimate(caseNumber)
  const trigger = useLaborEstimateTrigger()
  const update = useLaborEstimateUpdate()
  const discard = useLaborEstimateDiscard()
  const submit = useLaborSubmit()

  const [dismissed, setDismissed] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editMinutes, setEditMinutes] = useState<number | ''>('')
  const [editClassification, setEditClassification] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [confirmOverride, setConfirmOverride] = useState(false)

  // Success state — auto-fade after 3s
  if (showSuccess) {
    return (
      <div
        className="rounded-lg p-3 mt-3 transition-opacity duration-500"
        style={{
          border: '1px solid var(--accent-green)',
          background: 'var(--bg-secondary)',
        }}
      >
        <div className="flex items-center gap-2">
          <CheckCircle size={14} style={{ color: 'var(--accent-green)' }} />
          <span className="text-xs font-medium" style={{ color: 'var(--accent-green)' }}>
            Labor 已写入 D365
          </span>
        </div>
      </div>
    )
  }

  // Loading
  if (isLoading) return null

  const estimate = data?.estimate

  // No estimate or dismissed — show Estimate button
  if (!estimate || dismissed) {
    const isPending = trigger.isPending && !dismissed
    return (
      <div
        className="rounded-lg p-3 mt-3"
        style={{
          border: '1px solid var(--border-default)',
          background: 'var(--bg-secondary)',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Clock size={14} style={{ color: 'var(--text-tertiary)' }} />
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Labor
            </span>
          </div>
          <button
            onClick={() => {
              if (hasLaborToday && !confirmOverride) {
                setConfirmOverride(true)
                return
              }
              setConfirmOverride(false)
              setDismissed(false)
              trigger.mutate(caseNumber)
            }}
            disabled={isPending}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors disabled:opacity-50"
            style={{
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-default)',
            }}
          >
            <Calculator size={12} />
            {isPending ? '估算中...' : 'Estimate'}
          </button>
        </div>
        {confirmOverride && (
          <div className="mt-2 p-2 rounded"
            style={{ background: 'color-mix(in srgb, var(--accent-yellow, #f59e0b) 15%, transparent)', border: '1px solid color-mix(in srgb, var(--accent-yellow, #f59e0b) 40%, transparent)' }}
          >
            <p className="text-[11px] mb-1.5" style={{ color: 'var(--text-primary)' }}>
              当天已有 labor 记录，确认继续估算以增加记录？
            </p>
            <div className="flex gap-1.5">
              <button
                onClick={() => setConfirmOverride(false)}
                className="px-2 py-1 rounded text-[10px]"
                style={{ color: 'var(--text-tertiary)', border: '1px solid var(--border-default)' }}
              >
                取消
              </button>
              <button
                onClick={() => { setConfirmOverride(false); setDismissed(false); trigger.mutate(caseNumber) }}
                className="px-2 py-1 rounded text-[10px] font-medium"
                style={{ background: 'var(--accent-blue)', color: 'white' }}
              >
                继续估算
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Already submitted — show compact read-only
  if (estimate.status === 'submitted') {
    const mins = estimate.final?.totalMinutes ?? estimate.estimated.totalMinutes
    return (
      <div
        className="rounded-lg p-3 mt-3"
        style={{
          border: '1px solid var(--border-default)',
          background: 'var(--bg-secondary)',
        }}
      >
        <div className="flex items-center gap-1.5">
          <CheckCircle size={14} style={{ color: 'var(--accent-green)' }} />
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Labor: {mins} min — submitted
          </span>
        </div>
      </div>
    )
  }

  // Pending/confirmed — editable card
  const minutes = estimate.final?.totalMinutes ?? estimate.estimated.totalMinutes
  const classification = estimate.estimated.classification
  const description = estimate.estimated.description

  const handleSave = () => {
    const newMinutes = editMinutes === '' ? minutes : Number(editMinutes)
    update.mutate(
      {
        caseNumber,
        totalMinutes: newMinutes,
        classification: editClassification,
        description: editDescription,
      },
      { onSuccess: () => setEditing(false) }
    )
  }

  const handleSubmit = () => {
    if (hasLaborToday && !confirmOverride) {
      setConfirmOverride(true)
      return
    }
    setSubmitError(null)
    setConfirmOverride(false)
    const finalMinutes = editing ? (Number(editMinutes) || minutes) : minutes
    const finalClassification = editing ? editClassification : classification
    const finalDescription = editing ? editDescription : description
    submit.mutate(
      {
        caseNumber,
        totalMinutes: finalMinutes,
        classification: finalClassification,
        description: finalDescription,
      },
      {
        onSuccess: (data: any) => {
          if (data.success) {
            setShowSuccess(true)
            setTimeout(() => setShowSuccess(false), 3000)
          } else {
            setSubmitError(data.message || '写入失败')
          }
        },
      }
    )
  }

  return (
    <div
      className="rounded-lg px-3 py-2 mt-3"
      style={{
        border: '1px solid var(--accent-blue)',
        background: 'var(--bg-secondary)',
      }}
    >
      {/* Row 1: icon + label + Discard + Hide */}
      <div className="flex items-center gap-2 mb-1.5">
        <Clock size={14} style={{ color: 'var(--accent-blue)' }} />
        <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
          Labor Estimate
        </span>
        <span className="flex-1" />
        <button
          onClick={() => discard.mutate(caseNumber)}
          className="text-[10px] transition-colors"
          style={{ color: 'var(--text-tertiary)' }}
          title="Discard estimate"
        >
          Discard
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="p-0.5 rounded transition-colors"
          style={{ color: 'var(--text-tertiary)' }}
          title="Hide"
        >
          <X size={12} />
        </button>
      </div>

      {/* Row 2: left (min + classification) | right (description) */}
      <div className="flex items-stretch gap-3 mb-1.5">
        {/* Left: time + classification stacked */}
        <div className="flex-shrink-0 space-y-1" style={{ width: '140px' }}>
          <div className="flex items-center gap-1.5">
            <input type="number" value={editing ? editMinutes : minutes}
              onChange={(e) => {
                if (!editing) { setEditMinutes(Number(e.target.value) || 0); setEditClassification(classification); setEditDescription(description); setEditing(true); }
                else setEditMinutes(e.target.value === '' ? '' : Number(e.target.value))
              }}
              min={0} max={480}
              className="w-14 px-1 py-0.5 text-sm font-semibold bg-surface border border-border rounded focus:outline-none text-foreground text-center"
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent-blue)')}
              onBlur={e => (e.currentTarget.style.borderColor = '')} />
            <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>min</span>
          </div>
          <select value={editing ? editClassification : classification}
            onChange={e => {
              if (!editing) { setEditMinutes(minutes); setEditClassification(e.target.value); setEditDescription(description); setEditing(true); }
              else setEditClassification(e.target.value)
            }}
            className="w-full px-1 py-0.5 text-[10px] bg-surface border border-border rounded focus:outline-none text-foreground">
            {CLASSIFICATIONS.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Right: description */}
        <textarea value={editing ? editDescription : description}
          onChange={e => {
            if (!editing) { setEditMinutes(minutes); setEditClassification(classification); setEditDescription(e.target.value); setEditing(true); }
            else setEditDescription(e.target.value)
          }}
          className="flex-1 min-w-0 px-2 py-1 text-xs bg-surface border border-border rounded focus:outline-none text-foreground resize-none"
          placeholder="Description..."
          onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent-blue)')}
          onBlur={e => (e.currentTarget.style.borderColor = '')} />
      </div>

      {/* Row 3: actions */}
      <div className="flex justify-end gap-1.5">
        {editing && (
          <button
            onClick={handleSave}
            disabled={update.isPending}
            className="px-2 py-1 text-[10px] rounded border border-border text-muted hover:text-foreground transition-colors disabled:opacity-50"
          >
            {update.isPending ? 'Saving...' : 'Save'}
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={submit.isPending}
          className="px-3 py-1 text-[10px] rounded disabled:opacity-50 transition-colors"
          style={{ background: 'var(--accent-green)', color: 'var(--text-inverse)' }}
        >
          {submit.isPending ? 'Writing...' : '📤 Write to D365'}
        </button>
      </div>

      {/* Duplicate warning */}
      {confirmOverride && (
        <div className="mt-1.5 p-2 rounded"
          style={{ background: 'color-mix(in srgb, var(--accent-yellow, #f59e0b) 15%, transparent)', border: '1px solid color-mix(in srgb, var(--accent-yellow, #f59e0b) 40%, transparent)' }}
        >
          <p className="text-[11px] mb-1.5" style={{ color: 'var(--text-primary)' }}>
            当天已有 labor 记录，确认增加一条？
          </p>
          <div className="flex gap-1.5">
            <button onClick={() => setConfirmOverride(false)}
              className="px-2 py-1 rounded text-[10px]"
              style={{ color: 'var(--text-tertiary)', border: '1px solid var(--border-default)' }}>
              取消
            </button>
            <button onClick={handleSubmit}
              className="px-2 py-1 rounded text-[10px] font-medium"
              style={{ background: 'var(--accent-blue)', color: 'white' }}>
              确认写入
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {(submit.isError || submitError) && (
        <div className="mt-1.5 p-1.5 rounded"
          style={{ background: 'color-mix(in srgb, var(--accent-red) 10%, transparent)' }}>
          <p className="text-[10px] mb-1" style={{ color: 'var(--accent-red)' }}>
            {submitError || (submit.error as any)?.message || '写入失败'}
          </p>
          <button onClick={() => { submit.reset(); setSubmitError(null); handleSubmit() }}
            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px]"
            style={{ color: 'var(--accent-red)' }}>
            <RefreshCw size={10} /> 重试
          </button>
        </div>
      )}
    </div>
  )
}

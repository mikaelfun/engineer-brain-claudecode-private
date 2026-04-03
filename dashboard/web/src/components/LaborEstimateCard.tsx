import { useState, useCallback } from 'react'
import { Clock, Send, X, CheckCircle, RefreshCw, Calculator, Pencil } from 'lucide-react'
import {
  useLaborEstimate,
  useLaborEstimateTrigger,
  useLaborEstimateUpdate,
  useLaborSubmit,
} from '../api/hooks'

interface LaborEstimateCardProps {
  caseNumber: string
}

export function LaborEstimateCard({ caseNumber }: LaborEstimateCardProps) {
  const { data, isLoading } = useLaborEstimate(caseNumber)
  const trigger = useLaborEstimateTrigger()
  const update = useLaborEstimateUpdate()
  const submit = useLaborSubmit()

  const [dismissed, setDismissed] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editMinutes, setEditMinutes] = useState<number | ''>('')
  const [editClassification, setEditClassification] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

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

  // Dismissed — hide until refresh
  if (dismissed) return null

  // Loading
  if (isLoading) return null

  const estimate = data?.estimate

  // No estimate — show Estimate button
  if (!estimate) {
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
            onClick={() => trigger.mutate(caseNumber)}
            disabled={trigger.isPending}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors disabled:opacity-50"
            style={{
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-default)',
            }}
          >
            <Calculator size={12} />
            {trigger.isPending ? '估算中...' : 'Estimate'}
          </button>
        </div>
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

  const handleSave = useCallback(() => {
    const newMinutes = editMinutes === '' ? minutes : Number(editMinutes)
    const changed =
      newMinutes !== minutes ||
      editClassification !== classification ||
      editDescription !== description
    if (!changed) {
      setEditing(false)
      return
    }
    update.mutate(
      {
        caseNumber,
        totalMinutes: newMinutes,
        classification: editClassification,
        description: editDescription,
      },
      { onSuccess: () => setEditing(false) }
    )
  }, [editMinutes, editClassification, editDescription, minutes, classification, description, caseNumber, update])

  const handleSubmit = useCallback(() => {
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
        onSuccess: () => {
          setShowSuccess(true)
          setTimeout(() => setShowSuccess(false), 3000)
        },
      }
    )
  }, [caseNumber, minutes, classification, description, submit, editing, editMinutes])

  return (
    <div
      className="rounded-lg p-3 mt-3"
      style={{
        border: '1px solid var(--accent-blue)',
        background: 'var(--bg-secondary)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Clock size={14} style={{ color: 'var(--accent-blue)' }} />
          <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
            Labor Estimate
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="p-0.5 rounded transition-colors"
          style={{ color: 'var(--text-tertiary)' }}
          title="Dismiss"
        >
          <X size={12} />
        </button>
      </div>

      {/* Minutes display / edit */}
      <div className="flex items-center gap-2 mb-1.5">
        {editing ? (
          <input
            type="number"
            value={editMinutes}
            onChange={(e) => setEditMinutes(e.target.value === '' ? '' : Number(e.target.value))}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            autoFocus
            min={0}
            className="w-16 px-2 py-0.5 rounded text-sm text-center"
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--accent-blue)',
              color: 'var(--text-primary)',
            }}
          />
        ) : (
          <span
            className="text-lg font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            {minutes}
          </span>
        )}
        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>min</span>
        {!editing && (
          <button
            onClick={() => {
              setEditMinutes(minutes)
              setEditClassification(classification)
              setEditDescription(description)
              setEditing(true)
            }}
            className="p-0.5 rounded transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
            title="Edit"
          >
            <Pencil size={12} />
          </button>
        )}
      </div>

      {/* Classification */}
      {editing ? (
        <input
          type="text"
          value={editClassification}
          onChange={(e) => setEditClassification(e.target.value)}
          className="w-full px-2 py-0.5 rounded text-[11px] mb-1.5"
          style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-secondary)',
          }}
          placeholder="Classification"
        />
      ) : (
        <div className="mb-1.5">
          <span
            className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium"
            style={{
              background: 'var(--bg-tertiary)',
              color: 'var(--text-secondary)',
            }}
          >
            {classification}
          </span>
        </div>
      )}

      {/* Description */}
      {editing ? (
        <textarea
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          rows={3}
          className="w-full px-2 py-1 rounded text-xs mb-2.5 resize-y"
          style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-primary)',
            fontFamily: 'inherit',
          }}
          placeholder="Description"
        />
      ) : (
        <p
          className="text-xs mb-2.5 line-clamp-2"
          style={{ color: 'var(--text-tertiary)' }}
        >
          {description}
        </p>
      )}

      {/* Action buttons */}
      <div className="flex gap-1.5">
        {editing && (
          <button
            onClick={handleSave}
            disabled={update.isPending}
            className="flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs font-medium transition-colors disabled:opacity-50"
            style={{
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-default)',
            }}
          >
            {update.isPending ? '保存中...' : 'Save'}
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={submit.isPending}
          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs font-medium transition-colors disabled:opacity-50"
          style={{
            background: 'var(--accent-blue)',
            color: 'white',
          }}
        >
          <Send size={11} />
          {submit.isPending ? '写入中...' : 'Write to D365'}
        </button>
      </div>

      {/* Error */}
      {submit.isError && (
        <div className="flex items-center justify-between mt-2 p-1.5 rounded"
          style={{ background: 'color-mix(in srgb, var(--accent-red) 10%, transparent)' }}
        >
          <p className="text-[10px]" style={{ color: 'var(--accent-red)' }}>
            写入失败
          </p>
          <button
            onClick={() => { submit.reset(); handleSubmit() }}
            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px]"
            style={{ color: 'var(--accent-red)' }}
          >
            <RefreshCw size={10} />
            重试
          </button>
        </div>
      )}
    </div>
  )
}

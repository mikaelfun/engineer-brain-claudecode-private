/**
 * CreateTriggerDialog — Modal form for creating or editing a cron job trigger
 */
import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useCreateTrigger, useUpdateTrigger } from '../../api/hooks'

const CRON_PRESETS = [
  { label: 'Every 1 hour', value: '0 */1 * * *' },
  { label: 'Every 3 hours', value: '0 */3 * * *' },
  { label: 'Every 6 hours', value: '0 */6 * * *' },
  { label: 'Every 12 hours', value: '0 */12 * * *' },
  { label: 'Daily at 9am', value: '0 9 * * *' },
  { label: 'Weekdays at 9am', value: '0 9 * * 1-5' },
  { label: 'Every 30 minutes', value: '*/30 * * * *' },
  { label: 'Every 15 minutes', value: '*/15 * * * *' },
  { label: 'Custom', value: '' },
]

const PROMPT_PRESETS = [
  { label: 'Select a template...', value: '' },
  { label: 'OneNote Sync (incremental)', value: '/onenote-export sync' },
  { label: 'Patrol (batch inspect)', value: '/patrol' },
  { label: 'RAG Sync', value: '/rag-sync' },
  { label: 'Test Supervisor Run', value: '/test-supervisor run' },
  { label: 'Product Learn Auto Enrich', value: '/product-learn auto-enrich' },
]

export interface TriggerEditData {
  id: string
  name: string
  prompt: string
  cron: string
  description: string
}

interface Props {
  isOpen: boolean
  onClose: () => void
  editData?: TriggerEditData | null  // If provided, dialog is in edit mode
}

export function CreateTriggerDialog({ isOpen, onClose, editData }: Props) {
  const [name, setName] = useState('')
  const [prompt, setPrompt] = useState('')
  const [cronExpr, setCronExpr] = useState('0 */3 * * *')
  const [selectedPreset, setSelectedPreset] = useState('0 */3 * * *')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  const createTrigger = useCreateTrigger()
  const updateTrigger = useUpdateTrigger()

  const isEditing = !!editData

  // Populate form when editing
  useEffect(() => {
    if (editData) {
      setName(editData.name)
      setPrompt(editData.prompt)
      setCronExpr(editData.cron)
      setDescription(editData.description)
      // Check if cron matches a preset
      const matchedPreset = CRON_PRESETS.find(p => p.value === editData.cron)
      setSelectedPreset(matchedPreset ? matchedPreset.value : '')
    } else {
      setName('')
      setPrompt('')
      setCronExpr('0 */3 * * *')
      setSelectedPreset('0 */3 * * *')
      setDescription('')
    }
    setError('')
  }, [editData, isOpen])

  if (!isOpen) return null

  const handlePresetChange = (value: string) => {
    setSelectedPreset(value)
    if (value) setCronExpr(value)
  }

  const handlePromptPreset = (value: string) => {
    if (value) {
      setPrompt(value)
      if (!name) setName(value)
    }
  }

  const handleSubmit = async () => {
    setError('')

    if (!name.trim()) {
      setError('Name is required')
      return
    }
    if (!prompt.trim()) {
      setError('Prompt/command is required')
      return
    }
    if (!cronExpr.trim()) {
      setError('Cron expression is required')
      return
    }

    // Basic cron validation
    const parts = cronExpr.trim().split(/\s+/)
    if (parts.length !== 5) {
      setError('Invalid cron expression: must have 5 fields (minute hour day month weekday)')
      return
    }

    try {
      if (isEditing) {
        await updateTrigger.mutateAsync({
          id: editData!.id,
          name: name.trim(),
          prompt: prompt.trim(),
          cron: cronExpr.trim(),
          description: description.trim() || undefined,
        })
      } else {
        await createTrigger.mutateAsync({
          name: name.trim(),
          prompt: prompt.trim(),
          cron: cronExpr.trim(),
          description: description.trim() || undefined,
        })
      }
      // Reset form and close
      setName('')
      setPrompt('')
      setCronExpr('0 */3 * * *')
      setSelectedPreset('0 */3 * * *')
      setDescription('')
      onClose()
    } catch (err: any) {
      setError(err.message || `Failed to ${isEditing ? 'update' : 'create'} trigger`)
    }
  }

  const isPending = isEditing ? updateTrigger.isPending : createTrigger.isPending

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-lg rounded-lg shadow-xl p-6"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            {isEditing ? 'Edit Cron Job' : 'New Cron Job'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[var(--bg-hover)]"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Sync OneNote notebooks"
              className="w-full px-3 py-2 rounded text-sm"
              style={{
                background: 'var(--bg-base)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {/* Prompt with presets */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
              Prompt / Command *
            </label>
            {!isEditing && (
              <select
                onChange={(e) => handlePromptPreset(e.target.value)}
                className="w-full px-3 py-2 rounded text-sm mb-2"
                style={{
                  background: 'var(--bg-base)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-secondary)',
                }}
              >
                {PROMPT_PRESETS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            )}
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., /onenote-export --incremental"
              className="w-full px-3 py-2 rounded text-sm"
              style={{
                background: 'var(--bg-base)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {/* Cron expression with presets */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
              Schedule *
            </label>
            <select
              value={selectedPreset}
              onChange={(e) => handlePresetChange(e.target.value)}
              className="w-full px-3 py-2 rounded text-sm mb-2"
              style={{
                background: 'var(--bg-base)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-secondary)',
              }}
            >
              {CRON_PRESETS.map((p) => (
                <option key={p.label} value={p.value}>{p.label}</option>
              ))}
            </select>
            <input
              type="text"
              value={cronExpr}
              onChange={(e) => { setCronExpr(e.target.value); setSelectedPreset('') }}
              placeholder="*/30 * * * *"
              className="w-full px-3 py-2 rounded text-sm font-mono"
              style={{
                background: 'var(--bg-base)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
              }}
            />
            <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
              Format: minute hour day month weekday (e.g., 0 */3 * * * = every 3 hours)
            </p>
          </div>

          {/* Description (optional) */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              className="w-full px-3 py-2 rounded text-sm"
              style={{
                background: 'var(--bg-base)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-2 rounded text-xs" style={{ background: 'var(--accent-red-dim)', color: 'var(--accent-red)' }}>
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded text-sm"
              style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="px-4 py-2 rounded text-sm font-medium"
              style={{
                background: 'var(--accent-blue)',
                color: 'white',
                opacity: isPending ? 0.6 : 1,
              }}
            >
              {isPending ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Save' : 'Create')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

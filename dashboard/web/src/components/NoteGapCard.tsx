import { useState, useEffect } from 'react'
import { AlertTriangle, Send, X } from 'lucide-react'
import { useNoteGap, useSubmitNote, useDismissNoteGap } from '../api/hooks'

interface NoteGapCardProps {
  caseId: string
}

export function NoteGapCard({ caseId }: NoteGapCardProps) {
  const { data } = useNoteGap(caseId)
  const submitNote = useSubmitNote(caseId)
  const dismissGap = useDismissNoteGap(caseId)

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [initialized, setInitialized] = useState(false)

  // Initialize edit fields when draft first loads
  useEffect(() => {
    if (data?.draft && !initialized) {
      setTitle(data.draft.title)
      setBody(data.draft.body)
      setInitialized(true)
    }
  }, [data?.draft, initialized])

  // Reset when draft is dismissed/submitted
  useEffect(() => {
    if (!data?.hasGap) {
      setInitialized(false)
      setTitle('')
      setBody('')
    }
  }, [data?.hasGap])

  if (!data?.hasGap || !data.draft) return null

  const { gapDays, lastNoteDate } = data.draft
  const isSubmitting = submitNote.isPending
  const isDismissing = dismissGap.isPending

  return (
    <div
      className="rounded-lg p-4 mb-4"
      style={{
        border: '1px solid var(--accent-amber)',
        background: 'var(--bg-secondary)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} style={{ color: 'var(--accent-amber)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Note Gap: {gapDays} 天未更新
          </span>
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            上次: {lastNoteDate}
          </span>
        </div>
        <button
          onClick={() => dismissGap.mutate()}
          disabled={isDismissing}
          className="p-1 rounded transition-colors"
          style={{ color: 'var(--text-tertiary)' }}
          title="忽略"
        >
          <X size={14} />
        </button>
      </div>

      {/* Title */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full px-3 py-1.5 rounded text-sm mb-2"
        style={{
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-default)',
          color: 'var(--text-primary)',
        }}
        placeholder="Note Title"
      />

      {/* Body */}
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={5}
        className="w-full px-3 py-2 rounded text-sm mb-3 resize-y"
        style={{
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-default)',
          color: 'var(--text-primary)',
          fontFamily: 'inherit',
        }}
        placeholder="Note Body"
      />

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <button
          onClick={() => submitNote.mutate({ title, body })}
          disabled={isSubmitting || !title.trim() || !body.trim()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors disabled:opacity-50"
          style={{
            background: 'var(--accent-blue)',
            color: 'white',
          }}
        >
          <Send size={14} />
          {isSubmitting ? '写入中...' : '写入 D365'}
        </button>
      </div>

      {submitNote.isError && (
        <p className="text-xs mt-2" style={{ color: 'var(--accent-red)' }}>
          写入失败: {(submitNote.error as any)?.message || '未知错误'}
        </p>
      )}

      {submitNote.isSuccess && (
        <p className="text-xs mt-2" style={{ color: 'var(--accent-green)' }}>
          ✅ Note 已成功写入 D365
        </p>
      )}
    </div>
  )
}

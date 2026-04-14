import { useState, useEffect, useCallback, useRef } from 'react'
import { AlertTriangle, Send, X, CheckCircle, RefreshCw, ClipboardCheck, Sparkles, Plus } from 'lucide-react'
import { useNoteGap, useSubmitNote, useDismissNoteGap, useInvalidateNoteGap, useNoteGapCheckAI } from '../api/hooks'

interface NoteGapCardProps {
  caseId: string
}

interface DraftVersion {
  id: string
  title: string
  body: string
  gapDays: number
  lastNoteDate: string
  generatedAt: string
}

export function NoteGapCard({ caseId }: NoteGapCardProps) {
  const { data, refetch } = useNoteGap(caseId)
  const submitNote = useSubmitNote(caseId)
  const dismissGap = useDismissNoteGap(caseId)
  const invalidateNoteGap = useInvalidateNoteGap(caseId)
  const checkGapAI = useNoteGapCheckAI()

  const [aiLoading, setAiLoading] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const checkStartRef = useRef<number>(0)  // track when AI check started

  // Multi-version drafts
  const [drafts, setDrafts] = useState<DraftVersion[]>([])
  const [activeIdx, setActiveIdx] = useState(0)
  const [editTitle, setEditTitle] = useState('')
  const [editBody, setEditBody] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  const [checkResult, setCheckResult] = useState<string | null>(null)

  // Sync active draft to edit fields
  useEffect(() => {
    const d = drafts[activeIdx]
    if (d) { setEditTitle(d.title); setEditBody(d.body) }
  }, [activeIdx, drafts])

  // When server draft appears, add to drafts list if new
  useEffect(() => {
    if (data?.hasGap && data?.draft) {
      const sd = data.draft
      setDrafts(prev => {
        if (prev.some(d => d.generatedAt === sd.generatedAt)) return prev
        const next = [...prev, {
          id: `draft-${Date.now()}`,
          title: sd.title || 'fangkun note',
          body: sd.body || '',
          gapDays: sd.gapDays || 0,
          lastNoteDate: sd.lastNoteDate || '',
          generatedAt: sd.generatedAt || new Date().toISOString(),
        }]
        setTimeout(() => setActiveIdx(next.length - 1), 0)
        return next
      })
    }
  }, [data?.hasGap, data?.draft?.generatedAt])

  // Cleanup polling on unmount
  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [])

  // Stop polling when result arrives (either draft or no-gap)
  // Guard: don't accept hasGap=false until at least 12s elapsed (AI step session takes ~15-20s)
  // SSE case-step-completed will also invalidate the note-gap query when done
  useEffect(() => {
    if (aiLoading && data) {
      if (data.hasGap && data.draft) {
        // Gap found with draft — accept immediately
        setAiLoading(false)
        setCheckResult(null)
        if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
      } else if (data.hasGap === false) {
        // No gap — but only accept after minimum wait (AI may still be running)
        const elapsed = Date.now() - checkStartRef.current
        if (elapsed >= 12000) {
          setAiLoading(false)
          setCheckResult('No note gap detected')
          setTimeout(() => setCheckResult(null), 5000)
          if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
        }
        // else: keep polling, AI step is likely still running
      }
    }
  }, [aiLoading, data?.hasGap, data?.draft])

  // Trigger AI check via SDK step session + poll for result
  const handleCheck = useCallback(() => {
    setAiLoading(true)
    checkStartRef.current = Date.now()
    checkGapAI.mutate(caseId, {
      onError: () => setAiLoading(false),
    })
    let elapsed = 0
    pollRef.current = setInterval(() => {
      elapsed += 3000
      refetch()
      if (elapsed >= 60000) {
        setAiLoading(false)
        if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
      }
    }, 3000)
  }, [caseId, checkGapAI, refetch])

  // Submit active draft to D365
  const handleSubmit = useCallback(() => {
    submitNote.mutate(
      { title: editTitle, body: editBody },
      {
        onSuccess: () => {
          setShowSuccess(true)
          setDrafts([])
          setActiveIdx(0)
          setTimeout(() => { setShowSuccess(false); invalidateNoteGap() }, 3000)
        },
      }
    )
  }, [submitNote, editTitle, editBody, invalidateNoteGap])

  // Dismiss a single draft version
  const dismissDraft = useCallback((idx: number) => {
    setDrafts(prev => {
      const next = prev.filter((_, i) => i !== idx)
      if (next.length === 0) dismissGap.mutate()
      return next
    })
    setActiveIdx(prev => prev >= drafts.length - 1 ? Math.max(0, drafts.length - 2) : prev)
  }, [drafts.length, dismissGap])

  // ── Success ──
  if (showSuccess) {
    return (
      <div className="rounded-lg p-4 transition-opacity duration-500"
        style={{ border: '1px solid var(--accent-green)', background: 'var(--bg-secondary)' }}>
        <div className="flex items-center gap-2">
          <CheckCircle size={16} style={{ color: 'var(--accent-green)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--accent-green)' }}>Note 已成功写入 D365</span>
        </div>
      </div>
    )
  }

  // ── No drafts — compact card with Check button ──
  if (drafts.length === 0 && (!data?.hasGap || !data.draft)) {
    return (
      <div className="rounded-lg p-3"
        style={{ border: '1px solid var(--border-default)', background: 'var(--bg-secondary)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ClipboardCheck size={14} style={{ color: 'var(--text-tertiary)' }} />
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Note Gap</span>
            {data?.draft?.gapDays != null && (
              <span className="text-xs" style={{ color: data.draft.gapDays >= 3 ? 'var(--accent-amber)' : 'var(--text-tertiary)' }}>
                · {data.draft.gapDays}d ago
              </span>
            )}
          </div>
          <button
            onClick={handleCheck}
            disabled={aiLoading}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors disabled:opacity-50"
            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-default)' }}
          >
            {aiLoading ? (
              <><Sparkles size={12} className="animate-pulse" style={{ color: 'var(--accent-purple)' }} /> AI 检测中...</>
            ) : (
              <><Sparkles size={12} style={{ color: 'var(--accent-purple)' }} /> Check</>
            )}
          </button>
        </div>
        {checkResult && (
          <div className="mt-2 flex items-center gap-1.5">
            <CheckCircle size={12} style={{ color: 'var(--accent-green)' }} />
            <span className="text-xs" style={{ color: 'var(--accent-green)' }}>{checkResult}</span>
          </div>
        )}
      </div>
    )
  }

  // ── Has drafts — compact editor (matching Daily Ops design) ──
  const activeDraft = drafts[activeIdx]
  const isSubmitting = submitNote.isPending

  return (
    <div className="rounded-lg px-3 py-2"
      style={{
        border: `1px solid ${submitNote.isError ? 'var(--accent-red)' : 'var(--accent-amber)'}`,
        background: 'var(--bg-secondary)',
      }}>

      {/* Row 1: icon + gap info + version tabs + actions */}
      <div className="flex items-center gap-2 mb-1.5">
        <AlertTriangle size={14} style={{ color: 'var(--accent-amber)' }} />
        <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
          Note Gap
        </span>
        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0"
          style={{ background: 'var(--accent-amber-dim)', color: 'var(--accent-amber)' }}>
          {activeDraft?.gapDays ?? data?.draft?.gapDays ?? '?'}d
        </span>
        {drafts.length > 1 && (
          <div className="flex items-center gap-0.5">
            {drafts.map((_, i) => (
              <button key={i}
                onClick={() => setActiveIdx(i)}
                className="px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors"
                style={{
                  background: i === activeIdx ? 'var(--accent-purple-dim)' : 'transparent',
                  color: i === activeIdx ? 'var(--accent-purple)' : 'var(--text-tertiary)',
                }}>
                V{i + 1}
              </button>
            ))}
          </div>
        )}
        <span className="flex-1" />
        <button
          onClick={handleCheck}
          disabled={aiLoading}
          className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] transition-colors disabled:opacity-50"
          style={{ color: 'var(--accent-purple)' }}
          title="生成另一个版本"
        >
          {aiLoading ? <Sparkles size={10} className="animate-pulse" /> : <Plus size={10} />}
        </button>
        <button
          onClick={() => dismissDraft(activeIdx)}
          className="p-0.5 rounded transition-colors flex-shrink-0"
          style={{ color: 'var(--text-tertiary)' }}
          title="Dismiss"
        >✕</button>
      </div>

      {/* Editor */}
      {activeDraft && (
        <>
          <input
            type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)}
            className="w-full px-2 py-1 text-xs bg-surface border border-border rounded focus:outline-none text-foreground mb-1"
            placeholder="Note title..."
            onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent-amber)')}
            onBlur={e => (e.currentTarget.style.borderColor = '')}
          />
          <textarea
            value={editBody} onChange={e => setEditBody(e.target.value)} rows={4}
            className="w-full px-2 py-1 text-xs bg-surface border border-border rounded focus:outline-none text-foreground resize-y font-mono min-h-[60px] mb-1.5"
            placeholder="Note body..."
            onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent-amber)')}
            onBlur={e => (e.currentTarget.style.borderColor = '')}
          />
        </>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-1.5">
        <button
          onClick={() => { setDrafts([]); dismissGap.mutate() }}
          className="px-2 py-1 text-[10px] rounded border border-border text-muted hover:text-foreground transition-colors"
        >
          Dismiss All
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !editTitle.trim() || !editBody.trim()}
          className="px-3 py-1 text-[10px] rounded disabled:opacity-50 transition-colors"
          style={{ background: 'var(--accent-amber)', color: 'var(--text-inverse)' }}
        >
          {isSubmitting ? 'Writing...' : '📝 Write to D365'}
        </button>
      </div>

      {/* Error */}
      {submitNote.isError && (
        <div className="flex items-center justify-between mt-2 p-2 rounded"
          style={{ background: 'color-mix(in srgb, var(--accent-red) 10%, transparent)' }}>
          <p className="text-xs" style={{ color: 'var(--accent-red)' }}>
            写入失败: {(submitNote.error as any)?.message || '未知错误'}
          </p>
          <button onClick={() => { submitNote.reset(); handleSubmit() }}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
            style={{ color: 'var(--accent-red)', border: '1px solid var(--accent-red)' }}>
            <RefreshCw size={12} /> 重试
          </button>
        </div>
      )}
    </div>
  )
}

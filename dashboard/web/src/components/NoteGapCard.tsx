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

  // Multi-version drafts
  const [drafts, setDrafts] = useState<DraftVersion[]>([])
  const [activeIdx, setActiveIdx] = useState(0)
  const [editTitle, setEditTitle] = useState('')
  const [editBody, setEditBody] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

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

  // Stop polling when draft appears
  useEffect(() => {
    if (aiLoading && data?.hasGap && data?.draft) {
      setAiLoading(false)
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
    }
  }, [aiLoading, data?.hasGap, data?.draft])

  // Trigger AI check via SDK step session + poll for result
  const handleCheck = useCallback(() => {
    setAiLoading(true)
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
            {data?.gapDays != null && (
              <span className="text-xs" style={{ color: data.gapDays >= 3 ? 'var(--accent-amber)' : 'var(--text-tertiary)' }}>
                · {data.gapDays}d ago
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
      </div>
    )
  }

  // ── Has drafts — multi-version editor ──
  const activeDraft = drafts[activeIdx]
  const isSubmitting = submitNote.isPending

  return (
    <div className="rounded-lg p-4"
      style={{
        border: `1px solid ${submitNote.isError ? 'var(--accent-red)' : 'var(--accent-amber)'}`,
        background: 'var(--bg-secondary)',
      }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} style={{ color: 'var(--accent-amber)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Note Gap: {activeDraft?.gapDays ?? data?.draft?.gapDays ?? '?'} 天未更新
          </span>
        </div>
        <button
          onClick={handleCheck}
          disabled={aiLoading}
          className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors disabled:opacity-50"
          style={{ color: 'var(--accent-purple)', border: '1px solid var(--border-default)' }}
          title="生成另一个版本"
        >
          {aiLoading ? (
            <><Sparkles size={12} className="animate-pulse" /> 生成中...</>
          ) : (
            <><Plus size={12} /> 再生成</>
          )}
        </button>
      </div>

      {/* Version tabs — only when >1 */}
      {drafts.length > 1 && (
        <div className="flex items-center gap-1 mb-3 flex-wrap">
          {drafts.map((d, i) => (
            <div key={d.id} className="flex items-center">
              <button
                onClick={() => setActiveIdx(i)}
                className={`flex items-center gap-1 px-2 py-1 rounded-l text-xs font-medium transition-colors ${i === activeIdx ? '' : 'opacity-60'}`}
                style={{
                  background: i === activeIdx ? 'var(--accent-purple-dim)' : 'var(--bg-tertiary)',
                  color: i === activeIdx ? 'var(--accent-purple)' : 'var(--text-secondary)',
                  border: `1px solid ${i === activeIdx ? 'var(--accent-purple)' : 'var(--border-default)'}`,
                  borderRight: 'none',
                }}
              >
                <Sparkles size={10} />
                V{i + 1}
              </button>
              <button
                onClick={() => dismissDraft(i)}
                className="flex items-center px-1 py-1 rounded-r text-xs transition-colors"
                style={{
                  background: i === activeIdx ? 'var(--accent-purple-dim)' : 'var(--bg-tertiary)',
                  color: 'var(--text-tertiary)',
                  border: `1px solid ${i === activeIdx ? 'var(--accent-purple)' : 'var(--border-default)'}`,
                }}
                title={`删除版本 ${i + 1}`}
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Editor */}
      {activeDraft && (
        <>
          <input
            type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)}
            className="w-full px-3 py-1.5 rounded text-sm mb-2"
            style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
            placeholder="Note Title"
          />
          <textarea
            value={editBody} onChange={e => setEditBody(e.target.value)} rows={5}
            className="w-full px-3 py-2 rounded text-sm mb-3 resize-y"
            style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontFamily: 'inherit' }}
            placeholder="Note Body"
          />
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium"
              style={{ background: 'var(--accent-purple-dim)', color: 'var(--accent-purple)' }}>
              <Sparkles size={9} /> AI
            </span>
            <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
              {new Date(activeDraft.generatedAt).toLocaleTimeString()}
            </span>
          </div>
        </>
      )}

      {/* Actions */}
      <div className="flex justify-between">
        <button
          onClick={() => { setDrafts([]); dismissGap.mutate() }}
          className="flex items-center gap-1 px-2 py-1.5 rounded text-xs transition-colors"
          style={{ color: 'var(--text-tertiary)' }} title="全部忽略"
        >
          <X size={12} /> 忽略
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !editTitle.trim() || !editBody.trim()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors disabled:opacity-50"
          style={{ background: 'var(--accent-blue)', color: 'white' }}
        >
          <Send size={14} />
          {isSubmitting ? '写入中...' : '写入 D365'}
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

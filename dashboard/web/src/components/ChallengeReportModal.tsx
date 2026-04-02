/**
 * ChallengeReportModal — Displays the Challenger agent's review report
 */

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { useChallengeReport } from '../api/hooks'
import { Loading } from './common/Loading'
import MarkdownContent from './common/MarkdownContent'

interface ChallengeReportModalProps {
  caseId: string
  isOpen: boolean
  onClose: () => void
}

export function ChallengeReportModal({ caseId, isOpen, onClose }: ChallengeReportModalProps) {
  const { data, isLoading } = useChallengeReport(isOpen ? caseId : '')

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0" style={{ background: 'rgba(0, 0, 0, 0.6)' }} />

      {/* Modal */}
      <div
        className="relative w-full max-w-3xl max-h-[80vh] rounded-xl overflow-hidden flex flex-col"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-card)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Challenge Report
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = '')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-6 py-4 flex-1">
          {isLoading ? (
            <Loading text="Loading challenge report..." />
          ) : !data?.content ? (
            <div className="text-center py-12">
              <span className="text-4xl block mb-3">📋</span>
              <h3 className="text-lg font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                No challenge report
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Run the /challenge skill to generate a review report
              </p>
            </div>
          ) : (
            <MarkdownContent>{data.content}</MarkdownContent>
          )}
        </div>
      </div>
    </div>
  )
}

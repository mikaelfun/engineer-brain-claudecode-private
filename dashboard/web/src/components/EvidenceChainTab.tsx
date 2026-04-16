/**
 * EvidenceChainTab — Displays claims.json evidence chain with status color-coding
 */

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useCaseClaims } from '../api/hooks'
import { Loading, EmptyState } from './common/Loading'
import { ChallengeReportModal } from './ChallengeReportModal'

interface Evidence {
  source: string
  excerpt: string
  sourceType: string
  url?: string
}

interface Claim {
  id: string
  claim?: string
  statement?: string  // legacy: some troubleshooter runs used 'statement' instead of 'claim'
  type: string
  confidence: string
  evidence?: Evidence[]
  status: string
  note?: string
  challengerNote?: string
}

// Helper: get claim text from either 'claim' or 'statement' field
function getClaimText(claim: Claim): string {
  return claim.claim || claim.statement || '(no text)'
}

interface ClaimsData {
  version: number
  generatedAt: string
  generatedBy: string
  analysisRef: string
  overallConfidence: string
  triggerChallenge: boolean
  retryCount: number
  claims: Claim[]
}

const STATUS_CONFIG: Record<string, { emoji: string; color: string; bg: string }> = {
  verified:   { emoji: '\u2705', color: 'var(--accent-green, #22c55e)',  bg: 'rgba(34, 197, 94, 0.12)' },
  challenged: { emoji: '\u26a0\ufe0f', color: 'var(--accent-amber, #f59e0b)',  bg: 'rgba(245, 158, 11, 0.12)' },
  rejected:   { emoji: '\u274c', color: 'var(--accent-red, #ef4444)',    bg: 'rgba(239, 68, 68, 0.12)' },
  pending:    { emoji: '\u23f3', color: 'var(--text-tertiary, #9ca3af)', bg: 'rgba(156, 163, 175, 0.12)' },
}

const CONFIDENCE_COLORS: Record<string, { color: string; bg: string }> = {
  high:   { color: 'var(--accent-green, #22c55e)',  bg: 'rgba(34, 197, 94, 0.12)' },
  medium: { color: 'var(--accent-blue, #3b82f6)',   bg: 'rgba(59, 130, 246, 0.12)' },
  low:    { color: 'var(--accent-amber, #f59e0b)',   bg: 'rgba(245, 158, 11, 0.12)' },
  none:   { color: 'var(--accent-red, #ef4444)',     bg: 'rgba(239, 68, 68, 0.12)' },
}

const TYPE_COLORS: Record<string, string> = {
  'root-cause':     'var(--accent-red, #ef4444)',
  'cause-chain':    'var(--accent-amber, #f59e0b)',
  'impact':         'var(--accent-blue, #3b82f6)',
  'recommendation': 'var(--accent-green, #22c55e)',
  'observation':    'var(--text-tertiary, #9ca3af)',
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ color: cfg.color, background: cfg.bg }}
    >
      {cfg.emoji} {status}
    </span>
  )
}

function ConfidenceBadge({ confidence }: { confidence: string }) {
  const cfg = CONFIDENCE_COLORS[confidence] || CONFIDENCE_COLORS.low
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ color: cfg.color, background: cfg.bg }}
    >
      {confidence}
    </span>
  )
}

function TypeBadge({ type }: { type: string }) {
  const color = TYPE_COLORS[type] || 'var(--text-tertiary)'
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
      style={{ color, background: `color-mix(in srgb, ${color} 15%, transparent)` }}
    >
      {type}
    </span>
  )
}

function SourceTypeBadge({ sourceType }: { sourceType: string }) {
  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono"
      style={{ color: 'var(--text-tertiary)', background: 'var(--bg-inset)' }}
    >
      {sourceType}
    </span>
  )
}

function ClaimRow({ claim }: { claim: Claim }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <tr
        className="cursor-pointer transition-colors"
        onClick={() => setExpanded(!expanded)}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
        onMouseLeave={e => (e.currentTarget.style.background = '')}
      >
        <td className="px-3 py-2.5 text-sm font-mono" style={{ color: 'var(--text-tertiary)' }}>
          <div className="flex items-center gap-1">
            {expanded
              ? <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />
              : <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
            }
            {claim.id}
          </div>
        </td>
        <td className="px-3 py-2.5 text-sm" style={{ color: 'var(--text-primary)' }}>
          <span title={getClaimText(claim)}>
            {getClaimText(claim).length > 80 ? getClaimText(claim).slice(0, 80) + '...' : getClaimText(claim)}
          </span>
        </td>
        <td className="px-3 py-2.5"><TypeBadge type={claim.type} /></td>
        <td className="px-3 py-2.5"><ConfidenceBadge confidence={claim.confidence} /></td>
        <td className="px-3 py-2.5"><StatusBadge status={claim.status} /></td>
        <td className="px-3 py-2.5 text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
          {claim.evidence?.length ?? 0}
        </td>
      </tr>

      {/* Expanded detail row */}
      {expanded && (
        <tr>
          <td colSpan={6} className="px-3 py-0">
            <div
              className="mb-3 ml-6 p-3 rounded-lg text-sm space-y-3"
              style={{ background: 'var(--bg-inset)', border: '1px solid var(--border-subtle)' }}
            >
              {/* Full claim text */}
              <div>
                <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>Claim:</span>
                <p className="mt-0.5" style={{ color: 'var(--text-primary)' }}>{getClaimText(claim)}</p>
              </div>

              {/* Evidence list */}
              {(claim.evidence?.length ?? 0) > 0 && (
                <div>
                  <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
                    Evidence ({claim.evidence?.length ?? 0}):
                  </span>
                  <div className="mt-1 space-y-2">
                    {(claim.evidence || []).map((ev, i) => (
                      <div
                        key={i}
                        className="p-2 rounded"
                        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <SourceTypeBadge sourceType={ev.sourceType} />
                          {ev.url ? (
                            <a
                              href={ev.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-mono truncate hover:underline"
                              style={{ color: 'var(--accent-blue)' }}
                              onClick={e => e.stopPropagation()}
                            >
                              {ev.source}
                            </a>
                          ) : (
                            <span className="text-xs font-mono truncate" style={{ color: 'var(--text-secondary)' }}>
                              {ev.source}
                            </span>
                          )}
                        </div>
                        <p className="text-xs italic" style={{ color: 'var(--text-secondary)' }}>
                          "{ev.excerpt}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {claim.note && (
                <div>
                  <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>Note:</span>
                  <p className="mt-0.5 text-xs" style={{ color: 'var(--text-secondary)' }}>{claim.note}</p>
                </div>
              )}
              {claim.challengerNote && (
                <div>
                  <span className="text-xs font-medium" style={{ color: 'var(--accent-amber, #f59e0b)' }}>
                    Challenger:
                  </span>
                  <p className="mt-0.5 text-xs" style={{ color: 'var(--text-secondary)' }}>{claim.challengerNote}</p>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export default function EvidenceChainTab({ caseId }: { caseId: string }) {
  const { data, isLoading } = useCaseClaims(caseId)
  const [reportOpen, setReportOpen] = useState(false)

  if (isLoading) return <Loading text="Loading claims..." />

  // API returns the full claims.json object when exists, or { claims: null } when not
  const claimsData = data as ClaimsData | { claims: null } | undefined
  if (!claimsData || claimsData.claims === null || !('claims' in claimsData) || !Array.isArray(claimsData.claims)) {
    return <EmptyState icon="🔗" title="No evidence chain" description="Claims are generated after running the troubleshooter analysis" />
  }

  const claims = claimsData.claims
  const challenged = claims.filter(c => c.status === 'challenged').length
  const rejected = claims.filter(c => c.status === 'rejected').length
  const verified = claims.filter(c => c.status === 'verified').length
  const pending = claims.filter(c => c.status === 'pending').length

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Overall confidence */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>Confidence:</span>
            <ConfidenceBadge confidence={claimsData.overallConfidence} />
          </div>
          {/* Status summary */}
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: '0.75rem' }}>
              {verified > 0 && <span style={{ color: 'var(--accent-green, #22c55e)' }}>{verified} verified</span>}
              {verified > 0 && (challenged + rejected + pending > 0) && <span> &middot; </span>}
              {challenged > 0 && <span style={{ color: 'var(--accent-amber, #f59e0b)' }}>{challenged} challenged</span>}
              {challenged > 0 && (rejected + pending > 0) && <span> &middot; </span>}
              {rejected > 0 && <span style={{ color: 'var(--accent-red, #ef4444)' }}>{rejected} rejected</span>}
              {rejected > 0 && pending > 0 && <span> &middot; </span>}
              {pending > 0 && <span>{pending} pending</span>}
            </span>
          </div>
        </div>

        {/* Challenge Report button */}
        <button
          onClick={() => setReportOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          style={{
            color: 'var(--text-secondary)',
            background: 'var(--bg-inset)',
            border: '1px solid var(--border-subtle)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--bg-hover)'
            e.currentTarget.style.borderColor = 'var(--border-default)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'var(--bg-inset)'
            e.currentTarget.style.borderColor = 'var(--border-subtle)'
          }}
        >
          Challenge Report
        </button>
      </div>

      {/* Claims table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <th className="px-3 py-2.5 text-left text-xs font-medium w-16" style={{ color: 'var(--text-tertiary)' }}>ID</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>Claim</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium w-32" style={{ color: 'var(--text-tertiary)' }}>Type</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium w-24" style={{ color: 'var(--text-tertiary)' }}>Confidence</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium w-28" style={{ color: 'var(--text-tertiary)' }}>Status</th>
              <th className="px-3 py-2.5 text-center text-xs font-medium w-16" style={{ color: 'var(--text-tertiary)' }}>Ev.</th>
            </tr>
          </thead>
          <tbody>
            {claims.map(claim => (
              <ClaimRow key={claim.id} claim={claim} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Metadata footer */}
      <div className="flex items-center gap-3 text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
        <span>Generated: {new Date(claimsData.generatedAt).toLocaleString()}</span>
        <span>&middot;</span>
        <span>Source: {claimsData.analysisRef}</span>
        {claimsData.retryCount > 0 && (
          <>
            <span>&middot;</span>
            <span>Retries: {claimsData.retryCount}</span>
          </>
        )}
      </div>

      {/* Challenge Report Modal */}
      <ChallengeReportModal caseId={caseId} isOpen={reportOpen} onClose={() => setReportOpen(false)} />
    </div>
  )
}

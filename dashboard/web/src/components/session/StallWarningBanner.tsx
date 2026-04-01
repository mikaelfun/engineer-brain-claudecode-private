/**
 * StallWarningBanner — Amber warning when no heartbeat received for 30 seconds.
 * Auto-clears when heartbeat resumes. No manual dismiss.
 *
 * Uses CSS-driven opacity toggle (not early-return null) so the 300ms
 * fade-out animation can fire before the element visually disappears.
 */
import { AlertTriangle } from 'lucide-react'

export interface StallWarningBannerProps {
  visible: boolean
}

export function StallWarningBanner({ visible }: StallWarningBannerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-2 mx-5 mt-2 px-3 py-2 rounded-lg"
      style={{
        background: 'var(--accent-amber-dim)',
        border: '1px solid var(--accent-amber)',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity 300ms ease-out',
        // Collapse height when fully hidden to avoid layout gap
        maxHeight: visible ? '100px' : '0px',
        paddingTop: visible ? undefined : '0px',
        paddingBottom: visible ? undefined : '0px',
        marginTop: visible ? undefined : '0px',
        overflow: 'hidden',
      }}
    >
      <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--accent-amber)' }} />
      <span className="text-xs font-semibold" style={{ color: 'var(--accent-amber)', lineHeight: '1.4' }}>
        Processing may be stalled — no response for 30 seconds
      </span>
    </div>
  )
}

/**
 * QueueStatusIndicator — Purple pill showing SDK queue position.
 * Shown when an operation is queued behind another.
 *
 * Per UI-SPEC: role="status" + aria-live="polite"
 */
import { Clock } from 'lucide-react'

export interface QueueStatusIndicatorProps {
  currentLabel: string | null
  queueLength: number
  queueLabels: string[]
}

/** Map queue labels to human-friendly display text */
function getQueueCopy(currentLabel: string | null, queueLabels: string[]): string | null {
  if (!currentLabel || queueLabels.length === 0) return null

  const isPatrolQueued = queueLabels.some(l => l === 'patrol')
  const isCaseworkRunning = currentLabel.startsWith('casework:') || currentLabel.startsWith('step:')
  const isPatrolRunning = currentLabel === 'patrol'
  const hasCaseworkQueued = queueLabels.some(l => l.startsWith('casework:') || l.startsWith('step:'))

  if (isPatrolQueued && isCaseworkRunning) {
    return 'Patrol queued — waiting for casework to finish'
  }
  if (hasCaseworkQueued && isPatrolRunning) {
    return 'Casework queued — waiting for patrol to finish'
  }
  return `${queueLabels.length} operation${queueLabels.length > 1 ? 's' : ''} queued`
}

export function QueueStatusIndicator({ currentLabel, queueLength, queueLabels }: QueueStatusIndicatorProps) {
  if (queueLength === 0) return null

  const copy = getQueueCopy(currentLabel, queueLabels)
  if (!copy) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
      style={{
        background: 'var(--accent-purple-dim)',
        color: 'var(--accent-purple)',
        opacity: 1,
        transition: 'opacity 200ms ease-out',
      }}
    >
      <Clock className="w-3.5 h-3.5" />
      <span className="text-xs font-semibold" style={{ lineHeight: '1.4' }}>
        {copy}
      </span>
    </div>
  )
}

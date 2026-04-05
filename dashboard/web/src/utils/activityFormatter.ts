/**
 * activityFormatter.ts — Human-readable message formatter for ActivityStream events
 *
 * Transforms raw SSE event data into meaningful progress summaries.
 * Deduplicates repetitive events (e.g., repeated state-updated with same phase/queues).
 */

export interface ActivityEvent {
  type: string
  phase?: string
  action?: string
  detail?: string
  timestamp: string
  /** Raw data payload from SSE (optional, for richer formatting) */
  data?: Record<string, unknown>
}

/**
 * Generate a fingerprint for deduplication.
 * Events with the same fingerprint as the previous event are considered duplicates.
 * Returns null for event types that should never be deduplicated.
 */
function eventFingerprint(event: ActivityEvent): string | null {
  const d = event.data || {}

  switch (event.type) {
    case 'state-updated': {
      // Unified stage fingerprint — dedups with pipeline-updated too
      const phase = (d.phase as string || '').toUpperCase()
      return `stage:${phase}:${d.round ?? ''}`
    }
    case 'pipeline-updated': {
      // Same unified fingerprint as state-updated
      const stage = (d.currentStage as string || '').toUpperCase()
      return `stage:${stage}:${d.cycle ?? ''}`
    }
    case 'discoveries-updated':
    case 'evolution-updated':
      return `${event.type}`
    case 'runner-changed': {
      const status = d.status || event.action || ''
      return `runner:${status}`
    }
    default:
      return null
  }
}

/**
 * Check if a new event is a duplicate of ANY recent event (last 3).
 */
export function isDuplicateEvent(newEvent: ActivityEvent, prevEvents: ActivityEvent[]): boolean {
  if (prevEvents.length === 0) return false

  const newFp = eventFingerprint(newEvent)
  if (newFp === null) return false

  // Check last 3 events (not just last one) to catch interleaved duplicates
  const recentCount = Math.min(3, prevEvents.length)
  for (let i = prevEvents.length - 1; i >= prevEvents.length - recentCount; i--) {
    const fp = eventFingerprint(prevEvents[i])
    if (fp === newFp) return true
  }
  return false
}

/**
 * Format an ActivityEvent into a human-readable message.
 * Returns { message, detail } where message replaces the action column
 * and detail replaces the raw detail column.
 */
export function formatActivityMessage(event: ActivityEvent): { message: string; detail: string } {
  const d = event.data || {}

  switch (event.type) {
    case 'state-updated': {
      const phase = (d.phase as string) || event.phase || ''
      const round = d.round as number | undefined
      const queues = d.queues as Record<string, number> | undefined
      const currentTest = (d.currentTest as string) || (d.testId as string) || ''
      const action = (d.action as string) || event.action || ''

      let message = phase ? `Phase ${phase}` : 'State updated'
      if (round !== undefined) message += `, round ${round}`

      const details: string[] = []
      if (currentTest) details.push(currentTest)
      if (action && action !== phase) details.push(action)
      if (queues) {
        const qParts: string[] = []
        if (queues.test) qParts.push(`${queues.test} to test`)
        if (queues.fix) qParts.push(`${queues.fix} to fix`)
        if (queues.verify) qParts.push(`${queues.verify} to verify`)
        if (queues.regression) qParts.push(`${queues.regression} regression`)
        if (qParts.length > 0) details.push(qParts.join(', '))
      }

      return { message, detail: details.join(' · ') }
    }

    case 'pipeline-updated': {
      const stage = (d.currentStage as string) || ''
      const cycle = d.cycle as number | undefined
      const currentTest = (d.currentTest as string) || ''

      let message = stage ? `Moved to ${stage}` : 'Pipeline updated'
      if (cycle !== undefined) message += ` (round ${cycle})`

      return { message, detail: currentTest || '' }
    }

    case 'discoveries-updated': {
      return { message: 'Discoveries updated', detail: 'New issues found' }
    }

    case 'result-updated': {
      const testId = (d.testId as string) || ''
      const status = (d.status as string) || ''
      const message = status ? `Result: ${status}` : 'Test result updated'
      return { message, detail: testId }
    }

    case 'evolution-updated': {
      const milestone = (d.milestone as string) || (d.note as string) || ''
      return { message: 'Evolution milestone', detail: milestone || 'Framework evolved' }
    }

    case 'runner-changed': {
      const status = (d.status as string) || event.action || ''
      const statusMap: Record<string, string> = {
        running: 'Runner started',
        stopped: 'Runner stopped',
        paused: 'Runner paused',
        idle: 'Runner idle',
        active: 'Runner active',
      }
      return { message: statusMap[status] || `Runner ${status}`, detail: '' }
    }

    case 'self-heal': {
      const testId = (d.testId as string) || ''
      return { message: 'Self-heal triggered', detail: testId }
    }

    case 'learning': {
      const note = (d.note as string) || ''
      return { message: 'New learning captured', detail: note }
    }

    case 'strategy': {
      const detail = (d.note as string) || (d.detail as string) || ''
      return { message: 'Strategy updated', detail }
    }

    case 'connection': {
      return { message: event.action || 'Connection', detail: event.detail || '' }
    }

    case 'phase-history': {
      const action = event.action || ''
      return { message: action || 'Phase history', detail: event.detail || '' }
    }

    default: {
      // Graceful fallback for unknown event types
      return {
        message: event.action || event.type,
        detail: event.detail || '',
      }
    }
  }
}

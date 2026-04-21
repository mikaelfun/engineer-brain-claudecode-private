/**
 * sba-patrol-trigger.ts — SBA Adaptive Card 解析 + 自动巡检触发
 *
 * 每 60 秒检查 SBA Watch 是否有新消息，如果新消息是 Case 分配卡片
 * 且分配给当前工程师，则自动触发巡检。
 */
import { readGraphToken } from './graph-token-reader.js'
import { getSbaTarget, findWatchByChatId, type ParsedCard } from './teams-watch-reader.js'
import { config } from '../config.js'
import { sseManager } from '../watcher/sse-manager.js'

// ── Lazy patrol imports (avoid circular deps) ──

let _runSdkPatrol: ((force: boolean, mode: string) => Promise<any>) | null = null
let _isSdkPatrolRunning: (() => boolean) | null = null

async function getPatrolFns() {
  if (!_runSdkPatrol) {
    const mod = await import('../agent/patrol-orchestrator.js')
    _runSdkPatrol = mod.runSdkPatrol
    _isSdkPatrolRunning = mod.isSdkPatrolRunning
  }
  return { runSdkPatrol: _runSdkPatrol!, isSdkPatrolRunning: _isSdkPatrolRunning! }
}

// ── State ──

let pollTimer: ReturnType<typeof setInterval> | null = null
let lastKnownMessageCount = -1
let lastProcessedMessageId: string | null = null
let lastCheckAt: string | null = null
let triggerCount = 0
let lastError: string | null = null

const POLL_INTERVAL_MS = 60_000

// ── Adaptive Card Parser ──

/**
 * Parse an SBA Adaptive Card into a structured ParsedCard.
 * Returns null if the card doesn't match the expected SBA assignment format.
 */
export function parseSbaCard(card: any): ParsedCard | null {
  try {
    if (!card || card.type !== 'AdaptiveCard' || !Array.isArray(card.body)) {
      return null
    }

    // Find the assignment text block (e.g. "**Kun Fang** has been assigned a SR")
    let assignedTo: string | undefined
    for (const block of card.body) {
      if (block.type === 'TextBlock' && typeof block.text === 'string') {
        const match = block.text.match(/\*\*(.+?)\*\*\s+has been assigned/)
        if (match) {
          assignedTo = match[1]
          break
        }
      }
    }

    if (!assignedTo) return null

    // Find FactSet with SR details
    let caseNumber: string | undefined
    let severity: string | undefined
    let slaExpire: string | undefined

    for (const block of card.body) {
      if (block.type === 'FactSet' && Array.isArray(block.facts)) {
        for (const fact of block.facts) {
          if (fact.title === 'SR') caseNumber = fact.value
          if (fact.title === 'Severity') severity = fact.value
          if (fact.title === 'Sla Expire Date') slaExpire = fact.value
        }
      }
    }

    // Find D365 URL from ActionSet
    let d365Url: string | undefined
    for (const block of card.body) {
      if (block.type === 'ActionSet' && Array.isArray(block.actions)) {
        for (const action of block.actions) {
          if (action.type === 'Action.OpenUrl' && action.url) {
            d365Url = action.url
            break
          }
        }
      }
    }

    return {
      type: 'case-assignment',
      caseNumber,
      assignedTo,
      severity,
      slaExpire,
      d365Url,
    }
  } catch {
    return null
  }
}

// ── Check Loop ──

async function checkForNewSbaMessages(): Promise<void> {
  lastCheckAt = new Date().toISOString()

  try {
    // 1. Get SBA target chatId
    const sbaTarget = getSbaTarget()
    if (!sbaTarget) {
      lastError = 'No SBA target configured in watch-targets.json'
      return
    }

    // 2. Find active watch for that chatId
    const watch = findWatchByChatId(sbaTarget.chatId)
    if (!watch) {
      lastError = `No active watch for SBA chatId ${sbaTarget.chatId}`
      return
    }

    // 3. Compare newMessageCount
    if (lastKnownMessageCount === -1) {
      // First run — just record baseline, don't trigger
      lastKnownMessageCount = watch.newMessageCount
      lastProcessedMessageId = watch.lastMessageId
      lastError = null
      return
    }

    if (watch.newMessageCount <= lastKnownMessageCount) {
      // No new messages
      lastError = null
      return
    }

    // 4. Deduplicate by lastMessageId
    if (watch.lastMessageId && watch.lastMessageId === lastProcessedMessageId) {
      lastKnownMessageCount = watch.newMessageCount
      lastError = null
      return
    }

    // New message detected!
    lastKnownMessageCount = watch.newMessageCount
    lastProcessedMessageId = watch.lastMessageId
    console.log(`[SBA-Trigger] New message detected (count: ${watch.newMessageCount}, id: ${watch.lastMessageId})`)

    // 5. Read Graph token
    const token = readGraphToken()
    if (!token?.isValid) {
      lastError = 'Graph token invalid or expired — cannot fetch message content'
      sseManager.broadcast('teams-watch-update', {
        source: 'sba-patrol-trigger',
        event: 'new-message-detected',
        error: lastError,
      })
      return
    }

    // 6. Fetch recent messages
    const res = await fetch(
      `https://graph.microsoft.com/v1.0/me/chats/${sbaTarget.chatId}/messages?$top=5`,
      {
        headers: { Authorization: `Bearer ${token.secret}` },
      }
    )

    if (!res.ok) {
      lastError = `Graph API error: ${res.status} ${res.statusText}`
      return
    }

    const data = await res.json()
    const messages: any[] = data.value || []

    // 7. Find Adaptive Card attachment in the latest messages
    let parsedCard: ParsedCard | null = null
    for (const msg of messages) {
      if (!Array.isArray(msg.attachments)) continue
      for (const att of msg.attachments) {
        if (att.contentType === 'application/vnd.microsoft.card.adaptive') {
          let cardContent: any
          try {
            cardContent = typeof att.content === 'string'
              ? JSON.parse(att.content)
              : att.content
          } catch {
            continue
          }
          parsedCard = parseSbaCard(cardContent)
          if (parsedCard) break
        }
      }
      if (parsedCard) break
    }

    if (!parsedCard) {
      lastError = null
      sseManager.broadcast('teams-watch-update', {
        source: 'sba-patrol-trigger',
        event: 'new-message-no-card',
        messageCount: watch.newMessageCount,
      })
      return
    }

    // 8. Check if assigned to current engineer
    const engineerName = config.engineerName
    const isAssignedToMe = parsedCard.assignedTo
      ? parsedCard.assignedTo.toLowerCase().includes(engineerName.toLowerCase())
      : false

    console.log(`[SBA-Trigger] Parsed card: SR=${parsedCard.caseNumber}, assignedTo=${parsedCard.assignedTo}, isMe=${isAssignedToMe}`)

    sseManager.broadcast('teams-watch-update', {
      source: 'sba-patrol-trigger',
      event: 'case-assignment-detected',
      card: parsedCard,
      isAssignedToMe,
    })

    if (!isAssignedToMe) {
      lastError = null
      return
    }

    // 9. Trigger patrol
    const { runSdkPatrol, isSdkPatrolRunning } = await getPatrolFns()

    if (isSdkPatrolRunning()) {
      console.log('[SBA-Trigger] Patrol already running, skipping trigger')
      lastError = 'Patrol already running'
      return
    }

    triggerCount++
    console.log(`[SBA-Trigger] Triggering patrol for SR ${parsedCard.caseNumber} (trigger #${triggerCount})`)

    sseManager.broadcast('teams-watch-update', {
      source: 'sba-patrol-trigger',
      event: 'patrol-triggered',
      card: parsedCard,
      triggerCount,
    })

    // Fire-and-forget — don't await, let it run in background
    runSdkPatrol(true, 'normal').catch((err: Error) => {
      console.error('[SBA-Trigger] Patrol failed:', err.message)
    })

    lastError = null
  } catch (err: unknown) {
    lastError = err instanceof Error ? err.message : String(err)
    console.error('[SBA-Trigger] Check error:', lastError)
  }
}

// ── Public API ──

/**
 * Start the SBA patrol trigger (60s polling interval).
 */
export function initSbaPatrolTrigger(): void {
  if (pollTimer) {
    console.log('[SBA-Trigger] Already running, skipping init')
    return
  }

  console.log('[SBA-Trigger] Starting SBA patrol trigger (60s interval)')
  lastKnownMessageCount = -1
  lastProcessedMessageId = null
  lastError = null

  // Initial check
  checkForNewSbaMessages().catch(() => {})

  // Periodic check
  pollTimer = setInterval(() => {
    checkForNewSbaMessages().catch(() => {})
  }, POLL_INTERVAL_MS)

  // Don't block process exit
  if (pollTimer.unref) pollTimer.unref()
}

/**
 * Stop the SBA patrol trigger.
 */
export function stopSbaPatrolTrigger(): void {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
    console.log('[SBA-Trigger] Stopped')
  }
}

/**
 * Get current status for API endpoints.
 */
export function getSbaPatrolStatus(): {
  running: boolean
  lastCheckAt: string | null
  lastKnownMessageCount: number
  lastProcessedMessageId: string | null
  triggerCount: number
  lastError: string | null
} {
  return {
    running: pollTimer !== null,
    lastCheckAt,
    lastKnownMessageCount,
    lastProcessedMessageId,
    triggerCount,
    lastError,
  }
}

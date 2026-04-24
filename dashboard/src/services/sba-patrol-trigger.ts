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
let lastProcessedDetectedAt: string | null = null  // Only check history entries newer than this
let triggerCount = 0
let lastError: string | null = null
let autoPatrolEnabled = true // Can be toggled via API

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
      lastError = null // Not an error — watch just not started
      return
    }

    // 3. Compare newMessageCount (calibration on first run)
    if (lastKnownMessageCount === -1) {
      lastKnownMessageCount = watch.newMessageCount
      lastProcessedMessageId = watch.lastMessageId
      // Snapshot current history high-water mark so we don't re-trigger old cards
      const latestEntry = watch.history[watch.history.length - 1]
      lastProcessedDetectedAt = latestEntry?.detectedAt ?? new Date().toISOString()
      lastError = null
      return
    }

    if (watch.newMessageCount <= lastKnownMessageCount) {
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

    // 5. Get parsedCard from NEW history entries only (not entire history)
    //    Only entries with detectedAt > lastProcessedDetectedAt are candidates.
    //    This prevents re-triggering patrol for old cards when a non-card message arrives.
    const newEntries = lastProcessedDetectedAt
      ? watch.history.filter(e => e.detectedAt > lastProcessedDetectedAt!)
      : watch.history

    let parsedCard: ParsedCard | null = null
    for (const entry of [...newEntries].reverse()) {
      if (entry.parsedCard?.type === 'case-assignment') {
        parsedCard = entry.parsedCard
        break
      }
    }

    // Advance high-water mark regardless of whether we found a card
    if (watch.history.length > 0) {
      lastProcessedDetectedAt = watch.history[watch.history.length - 1].detectedAt
    }

    // 6. Fallback: fetch from Graph API if no card in history
    if (!parsedCard) {
      const token = readGraphToken()
      if (token?.isValid) {
        try {
          const res = await fetch(
            `https://graph.microsoft.com/v1.0/me/chats/${encodeURIComponent(sbaTarget.chatId)}/messages?$top=5`,
            { headers: { Authorization: `Bearer ${token.secret}` } }
          )
          if (res.ok) {
            const data = await res.json()
            for (const msg of (data.value || [])) {
              for (const att of (msg.attachments || [])) {
                if (att.contentType === 'application/vnd.microsoft.card.adaptive' && att.content) {
                  try {
                    const cardJson = typeof att.content === 'string' ? JSON.parse(att.content) : att.content
                    parsedCard = parseSbaCard(cardJson)
                    if (parsedCard) break
                  } catch {}
                }
              }
              if (parsedCard) break
            }
          }
        } catch {}
      }
    }

    if (!parsedCard) {
      // New message but not a case assignment card — just notify
      lastError = null
      sseManager.broadcast('teams-watch-update', {
        source: 'sba-patrol-trigger',
        event: 'new-message',
        topic: watch.topic,
        lastMessageFrom: watch.lastMessageFrom,
        lastMessagePreview: watch.lastMessagePreview,
      })
      return
    }

    // 7. Check if assigned to current engineer
    const engineerName = config.engineerName
    const isAssignedToMe = parsedCard.assignedTo
      ? parsedCard.assignedTo.toLowerCase().includes(engineerName.toLowerCase())
      : false

    console.log(`[SBA-Trigger] Case assignment: SR=${parsedCard.caseNumber}, assignedTo=${parsedCard.assignedTo}, isMe=${isAssignedToMe}`)

    sseManager.broadcast('teams-watch-update', {
      source: 'sba-patrol-trigger',
      event: 'case-assignment',
      card: parsedCard,
      isAssignedToMe,
    })

    if (!isAssignedToMe) {
      lastError = null
      return
    }

    // 8. Trigger patrol for the specific new case
    if (!autoPatrolEnabled) {
      console.log('[SBA-Trigger] Auto patrol disabled, skipping')
      lastError = null
      return
    }

    const { runSdkPatrol, isSdkPatrolRunning } = await getPatrolFns()

    if (isSdkPatrolRunning()) {
      console.log('[SBA-Trigger] Patrol already running, skipping')
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

    // Fire-and-forget — patrol runs in background
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
  lastProcessedDetectedAt = null
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
export function getSbaPatrolStatus() {
  return {
    running: pollTimer !== null,
    autoPatrolEnabled,
    lastCheckAt,
    lastKnownMessageCount,
    lastProcessedMessageId,
    triggerCount,
    lastError,
  }
}

export function setAutoPatrol(enabled: boolean): void {
  autoPatrolEnabled = enabled
  console.log(`[SBA-Trigger] Auto patrol ${enabled ? 'enabled' : 'disabled'}`)
}

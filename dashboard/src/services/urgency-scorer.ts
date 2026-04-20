/**
 * urgency-scorer.ts — Server-side urgency scoring service
 *
 * Mirrors the frontend 6-factor model (urgencyScore.ts) but with direct
 * filesystem access, enabling richer scoring in future versions
 * (email sentiment, note recency, Teams thread analysis, etc.).
 *
 * Factors (same as frontend):
 *   1. prod_impact    (0-20)  — keyword match on title / SAP
 *   2. customer_sentiment (0-15) — placeholder for v1
 *   3. severity       (0-25)  — A=25 / B=15 / C=5
 *   4. contact_gap    (0-20)  — days since last contact
 *   5. teams_pressure (0-10)  — Teams message count in meta
 *   6. sla_bonus      (0-10)  — IR SLA status + remaining hours
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import { config } from '../config.js'
import { readCaseMeta } from './meta-reader.js'
import { parseCaseInfo } from './case-reader.js'
import { listActiveCases } from './workspace.js'

// ============ Types ============

export interface UrgencyFactor {
  name: string
  label: string
  value: number
  reason: string
}

export interface UrgencyResult {
  score: number
  factors: UrgencyFactor[]
}

export interface ActionItem {
  id: string
  caseNumber?: string
  title: string
  score: number
  factors: UrgencyFactor[]
  source: 'case' | 'patrol-todo' | 'manual-todo'
  severity?: string
  daysSinceContact?: number
  slaStatus?: string
  actualStatus?: string
  customer?: string
}

// ============ Constants ============

/** Keywords that indicate production / high-severity impact. Case-insensitive. */
const PROD_IMPACT_KEYWORDS: readonly string[] = [
  'outage',
  'down',
  'production',
  'critical',
  'not working',
  'unavailable',
  'crash',
  'data loss',
  'security',
  'breach',
] as const

// ============ Factor Computers ============

/**
 * Factor 1 — prod_impact (0-20)
 * Keyword match on case title and SAP.
 */
function computeProdImpact(caseData: any): UrgencyFactor {
  const title: string = (caseData.title ?? '').toLowerCase()
  const sap: string = (caseData.sap ?? '').toLowerCase()
  const combined = `${title} ${sap}`

  const matched = PROD_IMPACT_KEYWORDS.filter((kw) => combined.includes(kw))

  if (matched.length > 0) {
    return {
      name: 'prod_impact',
      label: 'Production Impact',
      value: 20,
      reason: `Keyword match: ${matched.join(', ')}`,
    }
  }

  return {
    name: 'prod_impact',
    label: 'Production Impact',
    value: 0,
    reason: 'No production-impact keywords detected',
  }
}

/**
 * Factor 2 — customer_sentiment (0-15)
 * Placeholder for v1 — always returns 0.
 * Future: read emails for sentiment analysis.
 */
function computeCustomerSentiment(_caseData: any): UrgencyFactor {
  return {
    name: 'customer_sentiment',
    label: 'Customer Sentiment',
    value: 0,
    reason: 'Placeholder — sentiment analysis not implemented',
  }
}

/**
 * Factor 3 — severity (0-25)
 * Based on the case severity field.
 */
function computeSeverity(caseData: any): UrgencyFactor {
  const raw: string = (caseData.severity ?? '').toString().trim().toLowerCase()
  const normalised = raw.replace(/[^a-z]/g, '')

  if (normalised.includes('seva') || normalised === 'a') {
    return { name: 'severity', label: 'Severity', value: 25, reason: 'Sev A' }
  }
  if (normalised.includes('sevb') || normalised === 'b') {
    return { name: 'severity', label: 'Severity', value: 15, reason: 'Sev B' }
  }
  if (normalised.includes('sevc') || normalised === 'c') {
    return { name: 'severity', label: 'Severity', value: 5, reason: 'Sev C' }
  }

  return { name: 'severity', label: 'Severity', value: 0, reason: 'Unknown severity' }
}

/**
 * Factor 4 — contact_gap (0-20)
 * Days since last customer contact (from casework-meta.json).
 */
function computeContactGap(meta: any): UrgencyFactor {
  const days: number | undefined = meta?.daysSinceLastContact

  if (days === undefined || days === null || isNaN(Number(days))) {
    return {
      name: 'contact_gap',
      label: 'Contact Gap',
      value: 0,
      reason: 'No contact gap data available',
    }
  }

  const d = Number(days)

  if (d >= 5) {
    return { name: 'contact_gap', label: 'Contact Gap', value: 20, reason: `${d} days since last contact (>= 5)` }
  }
  if (d >= 3) {
    return { name: 'contact_gap', label: 'Contact Gap', value: 15, reason: `${d} days since last contact (>= 3)` }
  }
  if (d >= 2) {
    return { name: 'contact_gap', label: 'Contact Gap', value: 10, reason: `${d} days since last contact (>= 2)` }
  }
  if (d >= 1) {
    return { name: 'contact_gap', label: 'Contact Gap', value: 5, reason: `${d} days since last contact (>= 1)` }
  }

  return { name: 'contact_gap', label: 'Contact Gap', value: 0, reason: `${d} days since last contact (< 1)` }
}

/**
 * Factor 5 — teams_pressure (0-10)
 * Checks Teams chat count from casework-meta.json.
 */
function computeTeamsPressure(meta: any): UrgencyFactor {
  const count: number | undefined = meta?.teams_chat_count

  if (count !== undefined && count !== null && Number(count) > 0) {
    return {
      name: 'teams_pressure',
      label: 'Teams Pressure',
      value: 10,
      reason: `${count} Teams chat(s) detected`,
    }
  }

  return {
    name: 'teams_pressure',
    label: 'Teams Pressure',
    value: 0,
    reason: 'No Teams chats detected',
  }
}

/**
 * Parse remaining SLA string (e.g. "2h30m", "1.5h", "45m") into hours.
 */
function parseRemainingHours(remaining: string | null | undefined): number | undefined {
  if (!remaining) return undefined

  // Try parsing "Xh Ym" or "XhYm" format
  const hMatch = remaining.match(/(\d+(?:\.\d+)?)\s*h/i)
  const mMatch = remaining.match(/(\d+(?:\.\d+)?)\s*m/i)

  let hours = 0
  let found = false

  if (hMatch) {
    hours += parseFloat(hMatch[1])
    found = true
  }
  if (mMatch) {
    hours += parseFloat(mMatch[1]) / 60
    found = true
  }

  // Try plain number (assume hours)
  if (!found) {
    const num = parseFloat(remaining)
    if (!isNaN(num)) return num
    return undefined
  }

  return hours
}

/**
 * Factor 6 — sla_bonus (0-10)
 * Based on IR SLA status and remaining hours.
 */
function computeSlaBonus(meta: any): UrgencyFactor {
  const irSla = meta?.irSla

  if (!irSla) {
    return { name: 'sla_bonus', label: 'SLA Bonus', value: 0, reason: 'No IR SLA data available' }
  }

  const status: string = (irSla.status ?? '').toLowerCase()
  const remainingHours = parseRemainingHours(irSla.remaining)

  if (status === 'not-met') {
    return { name: 'sla_bonus', label: 'SLA Bonus', value: 10, reason: 'IR SLA already breached' }
  }

  if (status === 'met' && remainingHours !== undefined) {
    if (remainingHours < 2) {
      return { name: 'sla_bonus', label: 'SLA Bonus', value: 8, reason: `IR SLA met but only ${remainingHours.toFixed(1)}h remaining (< 2)` }
    }
    if (remainingHours < 8) {
      return { name: 'sla_bonus', label: 'SLA Bonus', value: 5, reason: `IR SLA met but only ${remainingHours.toFixed(1)}h remaining (< 8)` }
    }
  }

  return { name: 'sla_bonus', label: 'SLA Bonus', value: 0, reason: 'IR SLA within safe range' }
}

// ============ Public API ============

/**
 * Compute urgency score for a case based on 6 factors.
 * Score range: 0-100 (higher = more urgent).
 *
 * @param caseData - CaseInfo from parseCaseInfo()
 * @param meta     - CaseHealthMeta from readCaseMeta()
 */
export function computeUrgencyScore(caseData: any, meta: any): UrgencyResult {
  const factors: UrgencyFactor[] = [
    computeProdImpact(caseData),
    computeCustomerSentiment(caseData),
    computeSeverity(caseData),
    computeContactGap(meta),
    computeTeamsPressure(meta),
    computeSlaBonus(meta),
  ]

  const raw = factors.reduce((sum, f) => sum + f.value, 0)
  const score = Math.min(100, Math.max(0, raw))

  return { score, factors }
}

// ============ Todo Reader ============

interface TodoEntry {
  line: number
  checked: boolean
  text: string
}

/**
 * Read the latest todo file for a case and extract unchecked items.
 */
function readCaseTodos(caseId: string): TodoEntry[] {
  const todoDir = join(config.activeCasesDir, caseId, 'todo')
  if (!existsSync(todoDir)) return []

  try {
    const files = readdirSync(todoDir).filter(f => f.endsWith('.md')).sort().reverse()
    if (files.length === 0) return []

    const content = readFileSync(join(todoDir, files[0]), 'utf-8')
    return content.split('\n')
      .map((line, idx) => {
        const match = line.match(/^- \[([ x])\] (.+)/)
        if (!match) return null
        return { line: idx, checked: match[1] === 'x', text: match[2] }
      })
      .filter((item): item is TodoEntry => item !== null)
  } catch {
    return []
  }
}

// ============ Actions Cache ============

let _cache: { actions: ActionItem[]; timestamp: number } | null = null
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Get merged and scored actions list.
 * Combines active cases + per-case unchecked todos, computes scores, sorts by urgency desc.
 * Results are cached for 5 minutes.
 */
export function getActions(forceRefresh = false): ActionItem[] {
  const now = Date.now()
  if (!forceRefresh && _cache && (now - _cache.timestamp) < CACHE_TTL) {
    return _cache.actions
  }

  const actions: ActionItem[] = []
  const caseIds = listActiveCases()

  for (const caseId of caseIds) {
    try {
      const caseInfo = parseCaseInfo(caseId)
      const meta = readCaseMeta(caseId)

      if (!caseInfo) continue

      // Compute urgency for this case
      const { score, factors } = computeUrgencyScore(caseInfo, meta)

      // Add the case itself as an action
      actions.push({
        id: `case-${caseId}`,
        caseNumber: caseId,
        title: caseInfo.title || `Case ${caseId}`,
        score,
        factors,
        source: 'case',
        severity: caseInfo.severity,
        daysSinceContact: meta?.daysSinceLastContact,
        slaStatus: meta?.irSla?.status,
        actualStatus: meta?.actualStatus,
        customer: caseInfo.customer,
      })

      // Read unchecked todos for this case and add as separate action items
      const todos = readCaseTodos(caseId)
      const unchecked = todos.filter(t => !t.checked)

      for (const todo of unchecked) {
        // Todo inherits case score with a small bonus for being an explicit action item
        const todoScore = Math.min(100, score + 5)
        actions.push({
          id: `todo-${caseId}-L${todo.line}`,
          caseNumber: caseId,
          title: todo.text,
          score: todoScore,
          factors, // inherit case factors
          source: 'patrol-todo',
          severity: caseInfo.severity,
          daysSinceContact: meta?.daysSinceLastContact,
          slaStatus: meta?.irSla?.status,
          actualStatus: meta?.actualStatus,
          customer: caseInfo.customer,
        })
      }
    } catch (err) {
      console.warn(`[urgency-scorer] Error processing case ${caseId}:`, err)
    }
  }

  // Sort by score descending
  actions.sort((a, b) => b.score - a.score)

  // Cache result
  _cache = { actions, timestamp: now }

  return actions
}

/** Invalidate the actions cache (e.g. after a file watcher detects changes). */
export function invalidateActionsCache(): void {
  _cache = null
}

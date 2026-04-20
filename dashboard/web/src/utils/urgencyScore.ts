// ---------------------------------------------------------------------------
// urgencyScore.ts — Pure utility for computing case urgency scores (0-100)
// ---------------------------------------------------------------------------
// Each factor contributes an independent sub-score. The total is the sum of
// all factor values, clamped to [0, 100].
// ---------------------------------------------------------------------------

/** A single contributing factor to the overall urgency score. */
export interface UrgencyFactor {
  /** Machine-readable factor identifier */
  name: string
  /** Human-readable label */
  label: string
  /** Individual score contribution (0-25) */
  value: number
  /** Human-readable explanation of why this value was assigned */
  reason: string
}

/** Result returned by `computeUrgencyScore`. */
export interface UrgencyResult {
  /** Overall urgency score: 0-100, higher = more urgent */
  score: number
  /** Breakdown of individual contributing factors */
  factors: UrgencyFactor[]
}

// ---- Internal constants ---------------------------------------------------

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

// ---- Factor computers -----------------------------------------------------

/**
 * Factor 1 — prod_impact (0-20)
 * Keyword match on case title and SAP (Support Area Path).
 */
function computeProdImpact(caseData: any): UrgencyFactor {
  const title: string = (caseData.title ?? caseData.caseTitle ?? '').toLowerCase()
  const sap: string = (caseData.sap ?? caseData.supportAreaPath ?? '').toLowerCase()
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
 */
function computeCustomerSentiment(_caseData: any): UrgencyFactor {
  return {
    name: 'customer_sentiment',
    label: 'Customer Sentiment',
    value: 0,
    reason: 'Placeholder \u2014 sentiment analysis not implemented',
  }
}

/**
 * Factor 3 — severity (0-25)
 * Based on the case severity field.
 */
function computeSeverity(caseData: any): UrgencyFactor {
  const raw: string = (caseData.severity ?? '').toString().trim().toLowerCase()

  // Normalise common representations: "Sev A", "A", "sevA", "sev-a", etc.
  const normalised = raw.replace(/[^a-z]/g, '') // strip non-alpha

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
 * Days since last customer contact.
 */
function computeContactGap(caseData: any): UrgencyFactor {
  const days: number | undefined = caseData.meta?.daysSinceLastContact

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
 * Placeholder for v1 — checks if Teams message count > 0.
 */
function computeTeamsPressure(caseData: any): UrgencyFactor {
  const count: number | undefined = caseData.meta?.teamsMessageCount

  if (count !== undefined && count !== null && Number(count) > 0) {
    return {
      name: 'teams_pressure',
      label: 'Teams Pressure',
      value: 10,
      reason: `${count} Teams message(s) detected`,
    }
  }

  return {
    name: 'teams_pressure',
    label: 'Teams Pressure',
    value: 0,
    reason: 'Placeholder \u2014 Teams pressure detection not fully implemented',
  }
}

/**
 * Factor 6 — sla_bonus (0-10)
 * Based on IR SLA status and remaining hours.
 */
function computeSlaBonus(caseData: any): UrgencyFactor {
  const irSla = caseData.meta?.irSla

  if (!irSla) {
    return { name: 'sla_bonus', label: 'SLA Bonus', value: 0, reason: 'No IR SLA data available' }
  }

  const status: string = (irSla.status ?? '').toLowerCase()
  const remainingHours: number | undefined = irSla.remainingHours

  if (status === 'not-met') {
    return { name: 'sla_bonus', label: 'SLA Bonus', value: 10, reason: 'IR SLA already breached' }
  }

  if (status === 'met' && remainingHours !== undefined && remainingHours !== null) {
    const h = Number(remainingHours)
    if (h < 2) {
      return { name: 'sla_bonus', label: 'SLA Bonus', value: 8, reason: `IR SLA met but only ${h}h remaining (< 2)` }
    }
    if (h < 8) {
      return { name: 'sla_bonus', label: 'SLA Bonus', value: 5, reason: `IR SLA met but only ${h}h remaining (< 8)` }
    }
  }

  return { name: 'sla_bonus', label: 'SLA Bonus', value: 0, reason: 'IR SLA within safe range' }
}

// ---- Public API -----------------------------------------------------------

/**
 * Compute urgency score for a case based on 6 factors.
 * Score range: 0-100 (higher = more urgent).
 *
 * @param caseData - Case object with title, severity, sap, meta, etc.
 * @param _todos   - Optional todos (reserved for future use)
 * @returns UrgencyResult with total score and factor breakdown
 */
export function computeUrgencyScore(caseData: any, _todos?: any[]): UrgencyResult {
  const factors: UrgencyFactor[] = [
    computeProdImpact(caseData),
    computeCustomerSentiment(caseData),
    computeSeverity(caseData),
    computeContactGap(caseData),
    computeTeamsPressure(caseData),
    computeSlaBonus(caseData),
  ]

  const raw = factors.reduce((sum, f) => sum + f.value, 0)
  const score = Math.min(100, Math.max(0, raw))

  return { score, factors }
}

// ---- Color helpers --------------------------------------------------------

/** Get CSS custom-property value for urgency score. */
export function getUrgencyColor(score: number): string {
  if (score >= 70) return 'var(--accent-red)'
  if (score >= 40) return 'var(--accent-amber)'
  return 'var(--accent-green)'
}

/** Get semantic color name for urgency score. */
export function getUrgencyColorName(score: number): 'red' | 'amber' | 'green' {
  if (score >= 70) return 'red'
  if (score >= 40) return 'amber'
  return 'green'
}

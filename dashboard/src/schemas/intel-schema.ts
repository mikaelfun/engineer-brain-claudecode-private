/**
 * Team Intel — schema for future ingestion of known issues, LSI alerts, and swarming data.
 *
 * Directory: {dataRoot}/intel/
 * Files: {type}-{timestamp}.json
 *
 * Example: known-issue-20260420T0900.json
 */

/** Valid intel types */
export type TeamIntelType = 'known-issue' | 'lsi' | 'swarming'

/** Severity level for intel records */
export type TeamIntelSeverity = 'high' | 'medium' | 'low'

/** A single team intelligence record */
export interface TeamIntelRecord {
  /** Type of intelligence item */
  type: TeamIntelType
  /** Short title / headline */
  title: string
  /** Detailed description */
  description: string
  /** Where this intel came from (e.g. "ICM", "Teams", "manual") */
  source: string
  /** ISO 8601 timestamp of when the intel was captured */
  timestamp: string
  /** Case numbers affected by this intel */
  affectedCases: string[]
  /** Optional severity indicator */
  severity?: TeamIntelSeverity
  /** Whether the issue has been resolved */
  resolved?: boolean
  /** Arbitrary metadata for extensibility */
  metadata?: Record<string, unknown>
}

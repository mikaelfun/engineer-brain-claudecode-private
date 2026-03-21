/**
 * conductor-reader.ts — Conductor track 目录读写操作
 */
import { existsSync, readFileSync, writeFileSync, readdirSync, mkdirSync } from 'fs'
import { join } from 'path'
import { config } from '../config.js'
import type { TrackMetadata, Issue, IssueStatus, IssueVerifyResult } from '../types/index.js'

function getTracksDir(): string {
  return join(config.projectRoot, 'conductor', 'tracks')
}

/** Read metadata.json for a given track ID */
export function getTrackMetadata(trackId: string): TrackMetadata | null {
  const metaPath = join(getTracksDir(), trackId, 'metadata.json')
  if (!existsSync(metaPath)) return null
  try {
    return JSON.parse(readFileSync(metaPath, 'utf-8')) as TrackMetadata
  } catch {
    return null
  }
}

/** Update metadata.json for a given track ID (partial update) */
export function updateTrackMetadata(trackId: string, updates: Partial<TrackMetadata>): TrackMetadata | null {
  const existing = getTrackMetadata(trackId)
  if (!existing) return null
  const updated = { ...existing, ...updates, updated: new Date().toISOString() }
  const metaPath = join(getTracksDir(), trackId, 'metadata.json')
  writeFileSync(metaPath, JSON.stringify(updated, null, 2), 'utf-8')
  return updated
}

/** Update tracks.md row status for a given track ID */
export function updateTracksMdStatus(trackId: string, newStatus: '[ ]' | '[~]' | '[x]'): boolean {
  const tracksMdPath = join(config.projectRoot, 'conductor', 'tracks.md')
  if (!existsSync(tracksMdPath)) return false
  try {
    let content = readFileSync(tracksMdPath, 'utf-8')
    // Match the row with this trackId and replace the status marker
    const escaped = trackId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`\\| \\[.\\] \\| ${escaped}`)
    if (!regex.test(content)) return false
    content = content.replace(regex, `| ${newStatus} | ${trackId}`)
    writeFileSync(tracksMdPath, content, 'utf-8')
    return true
  } catch {
    return false
  }
}

/** List all track directory names */
export function listTrackIds(): string[] {
  const dir = getTracksDir()
  if (!existsSync(dir)) return []
  try {
    return readdirSync(dir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name)
  } catch {
    return []
  }
}

/** Generate a track ID from an issue: slugified-title_YYYYMMDD */
function generateTrackId(issue: Issue): string {
  const slug = issue.title
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  return `${slug}_${date}`
}

/**
 * Create a conductor track from an issue.
 * Creates: trackDir/metadata.json, spec.md, plan.md, index.md
 * Returns the generated trackId.
 */
export function createTrackFromIssue(issue: Issue): string {
  const trackId = generateTrackId(issue)
  const trackDir = join(getTracksDir(), trackId)

  if (existsSync(trackDir)) {
    throw new Error(`Track directory already exists: ${trackId}`)
  }

  mkdirSync(trackDir, { recursive: true })

  const now = new Date().toISOString()

  // metadata.json
  const metadata: TrackMetadata = {
    id: trackId,
    title: issue.title,
    type: issue.type,
    status: 'planned',
    created: now,
    updated: now,
    phases: { total: 0, completed: 0 },
    tasks: { total: 0, completed: 0 },
  }
  writeFileSync(join(trackDir, 'metadata.json'), JSON.stringify(metadata, null, 2), 'utf-8')

  // spec.md
  const spec = `# ${issue.title}

## Source
Issue: ${issue.id} (${issue.type}, ${issue.priority})

## Description
${issue.description || 'No description provided.'}

## Acceptance Criteria
- [ ] TBD
`
  writeFileSync(join(trackDir, 'spec.md'), spec, 'utf-8')

  // plan.md
  const plan = `# Implementation Plan — ${issue.title}

## Phases
_To be defined during planning._
`
  writeFileSync(join(trackDir, 'plan.md'), plan, 'utf-8')

  // index.md
  const index = `# ${trackId}

- **Status**: planned
- **Issue**: ${issue.id}
- **Created**: ${now}
`
  writeFileSync(join(trackDir, 'index.md'), index, 'utf-8')

  return trackId
}

/**
 * Derive issue status and verifyResult from track metadata.
 * This is the single mapping rule from track state → issue state.
 *
 * Mapping:
 *   track.status = "pending"/"planned"  → "tracked"
 *   track.status = "in_progress"        → "in-progress"
 *   track.status = "complete"/"completed" →
 *     verification absent/pending/running → "implemented"
 *     verification.status = "passed"      → "done" (auto-verified)
 *     verification.status = "skipped"     → "done" (manual mark done)
 *     verification.status = "failed"      → "implemented"
 */
export function deriveIssueStatus(track: TrackMetadata): { status: IssueStatus; verifyResult?: IssueVerifyResult } {
  const s = track.status

  if (s === 'in_progress') {
    return { status: 'in-progress' }
  }

  if (s === 'complete' || s === 'completed') {
    const v = track.verification
    if (!v || v.status === 'pending' || v.status === 'running') {
      return { status: 'implemented' }
    }
    if (v.status === 'passed' || v.status === 'skipped') {
      const verifyResult = v.result ? {
        unitTest: v.result.unitTest,
        uiTest: v.result.uiTest,
        verifiedAt: v.result.verifiedAt,
      } : undefined
      return { status: 'done', verifyResult }
    }
    if (v.status === 'failed') {
      // Failed verification — still show as implemented so user can re-verify
      const verifyResult = v.result ? {
        unitTest: v.result.unitTest,
        uiTest: v.result.uiTest,
        verifiedAt: v.result.verifiedAt,
      } : undefined
      return { status: 'implemented', verifyResult }
    }
  }

  // pending, planned, or any other → tracked
  return { status: 'tracked' }
}

/**
 * Enrich an issue with status derived from its track metadata.
 * If the issue has a trackId, reads the track metadata and overwrites
 * the issue's status and verifyResult with derived values.
 * If track metadata can't be read, falls back to the issue's own status.
 */
export function enrichIssueFromTrack(issue: Issue): Issue {
  if (!issue.trackId) return issue

  const track = getTrackMetadata(issue.trackId)
  if (!track) return issue // fallback to issue's own status

  const derived = deriveIssueStatus(track)
  return {
    ...issue,
    status: derived.status,
    verifyResult: derived.verifyResult ?? issue.verifyResult,
  }
}

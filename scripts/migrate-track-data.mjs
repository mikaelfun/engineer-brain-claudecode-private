/**
 * migrate-track-data.mjs — One-time migration to add issueId + verification to track metadata
 */
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

const issuesDir = './issues'
const tracksDir = './conductor/tracks'

const issueFiles = readdirSync(issuesDir).filter(f => f.endsWith('.json'))
let fixedIssueId = 0
let fixedVerification = 0

for (const f of issueFiles) {
  const issue = JSON.parse(readFileSync(join(issuesDir, f), 'utf-8'))
  if (!issue.trackId) continue

  const metaPath = join(tracksDir, issue.trackId, 'metadata.json')
  if (!existsSync(metaPath)) {
    console.log('SKIP (no metadata):', issue.id, issue.trackId)
    continue
  }

  const meta = JSON.parse(readFileSync(metaPath, 'utf-8'))
  let changed = false

  // 1. Add issueId if missing
  if (!meta.issueId) {
    meta.issueId = issue.id
    fixedIssueId++
    changed = true
  }

  // 2. Add verification for done issues (all historical were manual — no verifyResult exists)
  if (!meta.verification) {
    const trackStatus = meta.status
    if (issue.status === 'done' && (trackStatus === 'complete' || trackStatus === 'completed')) {
      meta.verification = { status: 'skipped', method: 'manual' }
      fixedVerification++
      changed = true
    }
  }

  if (changed) {
    meta.updated = new Date().toISOString()
    writeFileSync(metaPath, JSON.stringify(meta, null, 2) + '\n', 'utf-8')
    console.log('FIXED:', issue.id, '->', issue.trackId,
      meta.issueId === issue.id ? '+issueId' : '',
      meta.verification ? '+verification' : '')
  }
}

console.log(`\nDone: ${fixedIssueId} issueId added, ${fixedVerification} verification added`)

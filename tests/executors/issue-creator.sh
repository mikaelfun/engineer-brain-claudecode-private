#!/usr/bin/env bash
# tests/executors/issue-creator.sh — Create an Issue from test-loop discovery
#
# Usage: bash tests/executors/issue-creator.sh <testId> <round> <title> <description> <priority> <fixRef>
# Example: bash tests/executors/issue-creator.sh auth-endpoints 5 "Auth endpoint returns wrong status" "Login API returns 401..." P1 "tests/results/fixes/auth-endpoints-fix.md"
#
# Output: ISSUE_CREATED|ISS-XXX|testId  or  ISSUE_EXISTS|ISS-XXX|testId
#
# Called by LLM reasoning in FIX phase when a discovery is classified as a product bug.

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# ============================================================
# Arguments
# ============================================================
TEST_ID="${1:?Usage: issue-creator.sh <testId> <round> <title> <description> <priority> <fixRef>}"
ROUND="${2:?Missing round number}"
TITLE="${3:?Missing issue title}"
DESCRIPTION="${4:?Missing issue description}"
PRIORITY="${5:-P1}"
FIX_REF="${6:-}"

ISSUES_DIR="$PROJECT_ROOT/issues"
mkdir -p "$ISSUES_DIR"

log_info "=== Issue Creator ==="
log_info "Test: $TEST_ID"
log_info "Round: $ROUND"
log_info "Title: $TITLE"

# ============================================================
# De-duplication: check if Issue already exists for this testId
# ============================================================
EXISTING_ISSUE=""
EXISTING_ISSUE=$(NODE_PATH="$DASHBOARD_DIR/node_modules" ISSUES_PATH="$ISSUES_DIR" SEARCH_TEST_ID="$TEST_ID" node -e "
  const fs = require('fs');
  const path = require('path');
  const issuesDir = process.env.ISSUES_PATH;
  const searchTestId = process.env.SEARCH_TEST_ID;
  const files = fs.readdirSync(issuesDir).filter(f => f.startsWith('ISS-') && f.endsWith('.json'));
  for (const f of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(issuesDir, f), 'utf8'));
      if (data.discoveredBy === 'test-loop' && data.testId === searchTestId) {
        console.log(data.id);
        process.exit(0);
      }
    } catch(e) {}
  }
  console.log('');
" 2>/dev/null || echo "")

if [ -n "$EXISTING_ISSUE" ]; then
  log_warn "Issue already exists for testId=$TEST_ID: $EXISTING_ISSUE"
  echo "ISSUE_EXISTS|$EXISTING_ISSUE|$TEST_ID"
  exit 0
fi

# ============================================================
# Find next Issue ID
# ============================================================
NEXT_ID=$(NODE_PATH="$DASHBOARD_DIR/node_modules" ISSUES_PATH="$ISSUES_DIR" node -e "
  const fs = require('fs');
  const files = fs.readdirSync(process.env.ISSUES_PATH).filter(f => /^ISS-\d+\.json$/.test(f));
  let max = 0;
  for (const f of files) {
    const n = parseInt(f.match(/ISS-(\d+)/)[1], 10);
    if (n > max) max = n;
  }
  console.log(max + 1);
" 2>/dev/null || echo "")

if [ -z "$NEXT_ID" ] || [ "$NEXT_ID" = "0" ]; then
  log_fail "Could not determine next Issue ID"
  exit 1
fi

# Pad to 3 digits
ISSUE_ID=$(printf "ISS-%03d" "$NEXT_ID")
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

log_info "Creating $ISSUE_ID"

# ============================================================
# Write Issue JSON
# ============================================================
ISSUE_FILE="$ISSUES_DIR/${ISSUE_ID}.json"

# Use node to write proper JSON (avoids shell escaping issues)
NODE_PATH="$DASHBOARD_DIR/node_modules" \
  ISSUE_FILE_PATH="$ISSUE_FILE" \
  ISSUE_ID_VAL="$ISSUE_ID" \
  ISSUE_TITLE="$TITLE" \
  ISSUE_DESC="$DESCRIPTION" \
  ISSUE_PRIORITY="$PRIORITY" \
  ISSUE_TEST_ID="$TEST_ID" \
  ISSUE_ROUND="$ROUND" \
  ISSUE_FIX_REF="$FIX_REF" \
  ISSUE_TIMESTAMP="$TIMESTAMP" \
  node -e "
  const fs = require('fs');
  const issue = {
    id: process.env.ISSUE_ID_VAL,
    title: process.env.ISSUE_TITLE,
    description: process.env.ISSUE_DESC,
    type: 'bug',
    priority: process.env.ISSUE_PRIORITY,
    status: 'pending',
    testLoopScan: true,
    discoveredBy: 'test-loop',
    testId: process.env.ISSUE_TEST_ID,
    round: parseInt(process.env.ISSUE_ROUND, 10),
    fixRef: process.env.ISSUE_FIX_REF || null,
    createdAt: process.env.ISSUE_TIMESTAMP,
    updatedAt: process.env.ISSUE_TIMESTAMP
  };
  fs.writeFileSync(process.env.ISSUE_FILE_PATH, JSON.stringify(issue, null, 2) + '\n');
  console.log('OK');
" 2>/dev/null

if [ $? -eq 0 ]; then
  log_pass "Issue created: $ISSUE_FILE"
else
  log_fail "Failed to write Issue JSON"
  exit 1
fi

# ============================================================
# Auto-Track: Generate conductor track so issue becomes "tracked"
# and issue-scanner can detect gaps in next SCAN cycle.
# ============================================================
log_info "Auto-generating conductor track for $ISSUE_ID..."

TRACKS_DIR="$PROJECT_ROOT/conductor/tracks"
TRACKS_MD="$PROJECT_ROOT/conductor/tracks.md"
DATE_SHORT=$(date -u +"%Y%m%d")
DATE_ISO=$(date -u +"%Y-%m-%d")

# trackId format: testloop-iss-NNN_YYYYMMDD (lowercase for consistency)
TRACK_ID="testloop-$(echo "$ISSUE_ID" | tr '[:upper:]' '[:lower:]')_${DATE_SHORT}"
TRACK_DIR="$TRACKS_DIR/$TRACK_ID"

mkdir -p "$TRACK_DIR"

# Convert paths for Node.js on Windows
TRACK_DIR_WIN=$(cygpath -w "$TRACK_DIR" 2>/dev/null || echo "$TRACK_DIR")
FIX_REF_WIN=""
if [ -n "$FIX_REF" ] && [ -f "$PROJECT_ROOT/$FIX_REF" ]; then
  FIX_REF_WIN=$(cygpath -w "$PROJECT_ROOT/$FIX_REF" 2>/dev/null || echo "$PROJECT_ROOT/$FIX_REF")
fi
ISSUE_FILE_WIN=$(cygpath -w "$ISSUE_FILE" 2>/dev/null || echo "$ISSUE_FILE")
TRACKS_MD_WIN=$(cygpath -w "$TRACKS_MD" 2>/dev/null || echo "$TRACKS_MD")

NODE_PATH="$DASHBOARD_DIR/node_modules" \
  TRACK_DIR_PATH="$TRACK_DIR_WIN" \
  FIX_REF_PATH="$FIX_REF_WIN" \
  ISSUE_FILE_PATH="$ISSUE_FILE_WIN" \
  TRACKS_MD_PATH="$TRACKS_MD_WIN" \
  TRACK_ID_VAL="$TRACK_ID" \
  ISSUE_ID_VAL="$ISSUE_ID" \
  ISSUE_TITLE="$TITLE" \
  ISSUE_DESC="$DESCRIPTION" \
  ISSUE_PRIORITY="$PRIORITY" \
  DATE_ISO_VAL="$DATE_ISO" \
  ISSUE_TIMESTAMP="$TIMESTAMP" \
  node -e "
const fs = require('fs');
const path = require('path');

const trackDir = process.env.TRACK_DIR_PATH;
const fixRefPath = process.env.FIX_REF_PATH;
const issueFile = process.env.ISSUE_FILE_PATH;
const tracksMdPath = process.env.TRACKS_MD_PATH;
const trackId = process.env.TRACK_ID_VAL;
const issueId = process.env.ISSUE_ID_VAL;
const title = process.env.ISSUE_TITLE;
const desc = process.env.ISSUE_DESC;
const priority = process.env.ISSUE_PRIORITY;
const dateIso = process.env.DATE_ISO_VAL;
const timestamp = process.env.ISSUE_TIMESTAMP;

// ---- Step 1: Extract ACs from fixRef or fallback to title+description ----
let acs = [];

if (fixRefPath) {
  try {
    const fixContent = fs.readFileSync(fixRefPath, 'utf8');
    // Extract meaningful lines from fix analysis as ACs
    // Look for: root cause, what was fixed, what should work
    const lines = fixContent.split(/\r?\n/);
    const acCandidates = [];

    for (const line of lines) {
      const trimmed = line.trim();
      // Skip empty, headers, and very short lines
      if (!trimmed || trimmed.startsWith('#') || trimmed.length < 15) continue;
      // Look for lines describing behavior, fixes, or expectations
      if (/(?:should|must|fixed|resolved|correct|proper|ensure|verify|bug|issue|error|fail)/i.test(trimmed)) {
        // Clean up markdown formatting
        let ac = trimmed.replace(/^[-*>]\s*/, '').replace(/\*\*/g, '');
        if (ac.length > 10 && ac.length < 200) {
          acCandidates.push(ac);
        }
      }
    }

    // Take up to 5 most relevant ACs
    acs = acCandidates.slice(0, 5);
  } catch (e) {
    // fixRef file not readable, fall through to fallback
  }
}

// Fallback: use title and description as ACs
if (acs.length === 0) {
  acs.push(title);
  if (desc && desc.length > 10 && desc !== title) {
    // Split description into sentences for granular ACs
    const sentences = desc.split(/[.。;；\n]/).map(s => s.trim()).filter(s => s.length > 10);
    acs.push(...sentences.slice(0, 4));
  }
}

// ---- Step 2: Write spec.md ----
const acLines = acs.map((ac, i) => '- [ ] AC' + (i+1) + ': ' + ac).join('\n');

const specContent = '# Specification: ' + title + '\n' +
  '\n' +
  '**Track ID:** ' + trackId + '\n' +
  '**Type:** Bug (auto-discovered by test-loop)\n' +
  '**Created:** ' + dateIso + '\n' +
  '**Status:** Draft\n' +
  '\n' +
  '## Summary\n' +
  '\n' +
  title + '\n' +
  '\n' +
  '## Problem Description\n' +
  '\n' +
  desc + '\n' +
  '\n' +
  '## Acceptance Criteria\n' +
  '\n' +
  acLines + '\n' +
  '\n' +
  '## Dependencies\n' +
  '\n' +
  'Auto-discovered by test-loop. Priority: ' + priority + '\n' +
  '\n' +
  '---\n' +
  '\n' +
  '_Auto-generated by issue-creator.sh (test-loop discovery)._\n';

fs.writeFileSync(path.join(trackDir, 'spec.md'), specContent);

// ---- Step 3: Write metadata.json ----
const metadata = {
  id: trackId,
  title: title,
  type: 'bug',
  status: 'pending',
  created: timestamp,
  updated: timestamp,
  phases: { total: 1, completed: 0 },
  tasks: { total: acs.length, completed: 0 }
};
fs.writeFileSync(path.join(trackDir, 'metadata.json'), JSON.stringify(metadata, null, 2) + '\n');

// ---- Step 4: Update issue JSON — set trackId + status=tracked ----
try {
  const issue = JSON.parse(fs.readFileSync(issueFile, 'utf8'));
  issue.trackId = trackId;
  issue.status = 'tracked';
  issue.updatedAt = timestamp;
  fs.writeFileSync(issueFile, JSON.stringify(issue, null, 2) + '\n');
} catch (e) {
  console.error('WARN: Failed to update issue JSON: ' + e.message);
}

// ---- Step 5: Append to tracks.md ----
try {
  const row = '| [ ] | ' + trackId + ' | ' + title + ' | ' + dateIso + ' | ' + dateIso + ' |\n';
  fs.appendFileSync(tracksMdPath, row);
} catch (e) {
  console.error('WARN: Failed to append to tracks.md: ' + e.message);
}

console.log('TRACK_CREATED|' + trackId);
" 2>/dev/null

if [ $? -eq 0 ]; then
  log_pass "Auto-track created: $TRACK_ID"
else
  log_warn "Auto-track generation failed (issue still created without track)"
fi

echo "ISSUE_CREATED|$ISSUE_ID|$TEST_ID"

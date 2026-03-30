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

echo "ISSUE_CREATED|$ISSUE_ID|$TEST_ID"

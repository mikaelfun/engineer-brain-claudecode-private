#!/usr/bin/env bash
# refresh-live-cases.sh — Refresh live case pool from D365 active cases
# Called by SCAN phase when live-cases.yaml is stale (>24h)
# Usage: refresh-live-cases.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
LIVE_CASES_FILE="$PROJECT_ROOT/tests/fixtures/live-cases.yaml"
# Node.js needs Windows-style path for fs.readFileSync
WIN_PROJECT_ROOT=$(echo "$PROJECT_ROOT" | sed 's|^/\([a-z]\)/|\U\1:/|; s|/|\\\\|g')
CASES_ROOT=$(node -e "console.log(JSON.parse(require('fs').readFileSync('${WIN_PROJECT_ROOT}/config.json','utf8')).casesRoot || '')" 2>/dev/null || echo "")
CASES_ROOT=$(echo "$CASES_ROOT" | sed 's|\\|/|g; s|^\([A-Z]\):|/\L\1|')
# Fallback if config.json read fails
if [[ -z "$CASES_ROOT" ]]; then
  CASES_ROOT="$PROJECT_ROOT/cases"
fi

echo "[refresh-live-cases] Starting live case pool refresh..."

# ─── Check staleness ─────────────────────────────────────
if [[ -f "$LIVE_CASES_FILE" ]]; then
  LAST_REFRESHED=$(grep "lastRefreshed:" "$LIVE_CASES_FILE" | sed 's/.*: *"\(.*\)"/\1/' | head -1)
  INTERVAL=$(grep "refreshInterval:" "$LIVE_CASES_FILE" | sed 's/.*: *\([0-9]*\).*/\1/' | head -1)
  INTERVAL=${INTERVAL:-86400}

  if [[ -n "$LAST_REFRESHED" ]]; then
    # Check if stale
    LAST_EPOCH=$(date -d "$LAST_REFRESHED" +%s 2>/dev/null || echo "0")
    NOW_EPOCH=$(date +%s)
    DIFF=$((NOW_EPOCH - LAST_EPOCH))

    if [[ "$DIFF" -lt "$INTERVAL" ]]; then
      echo "[refresh-live-cases] Cache still fresh (${DIFF}s < ${INTERVAL}s). Skipping refresh."
      exit 0
    fi
  fi
fi

# ─── Scan active case directories ─────────────────────────
# Instead of calling D365 API directly (which requires browser auth),
# we scan the local cases/active/ directory for case data.
# This is reliable because data-refresh keeps local data up to date.

ACTIVE_DIR="${CASES_ROOT}/active"
if [[ ! -d "$ACTIVE_DIR" ]]; then
  echo "[refresh-live-cases] ERROR: Active cases directory not found: $ACTIVE_DIR"
  exit 1
fi

NOW_ISO=$(date -u '+%Y-%m-%dT%H:%M:%SZ')
CASE_COUNT=0

# Build YAML content
YAML_CONTENT="# Live Cases Pool — Active D365 Cases for Test Loop
# Auto-refreshed by refresh-live-cases.sh
# Last refresh: $NOW_ISO

lastRefreshed: \"$NOW_ISO\"
refreshInterval: 86400  # 24 hours in seconds
source: \"scan-active-dir\"

cases:"

# Scan each case directory
for case_dir in "$ACTIVE_DIR"/*/; do
  [[ -d "$case_dir" ]] || continue
  CASE_ID=$(basename "$case_dir")

  # Skip non-numeric case IDs (temp dirs, etc.)
  [[ "$CASE_ID" =~ ^[0-9] ]] || continue

  # Read metadata from case-info.md
  CASE_INFO="$case_dir/case-info.md"
  if [[ ! -f "$CASE_INFO" ]]; then
    continue
  fi

  # Extract fields
  TITLE=$(grep "| Title |" "$CASE_INFO" 2>/dev/null | sed 's/.*| Title | *\(.*\) *|/\1/' | sed 's/ *$//' | head -1)
  SEVERITY=$(grep "| Severity |" "$CASE_INFO" 2>/dev/null | sed 's/.*| Severity | *\(.\).*/\1/' | head -1)
  TITLE=${TITLE:-"Unknown"}
  SEVERITY=${SEVERITY:-"C"}

  # Check for emails
  EMAIL_COUNT=0
  HAS_EMAILS="false"
  if [[ -f "$case_dir/emails.md" ]]; then
    EMAIL_COUNT=$(grep "Total:" "$case_dir/emails.md" 2>/dev/null | sed 's/.*Total: *\([0-9]*\).*/\1/' | head -1)
    EMAIL_COUNT=${EMAIL_COUNT:-0}
    [[ "$EMAIL_COUNT" -gt 0 ]] && HAS_EMAILS="true"
  fi

  # Check for ICM
  HAS_ICM="false"
  if [[ -f "$case_dir/casework-meta.json" ]]; then
    # Convert POSIX path to Windows for Node
    win_meta_path=$(echo "${case_dir}/casework-meta.json" | sed 's|^/\([a-z]\)/|\U\1:/|; s|/|\\\\|g')
    ICM_ID=$(node -e "
      try {
        const m = JSON.parse(require('fs').readFileSync('${win_meta_path}','utf8'));
        if (m.icmIdAtJudge) console.log('true');
        else console.log('false');
      } catch(e) { console.log('false'); }
    " 2>/dev/null || echo "false")
    HAS_ICM=${ICM_ID:-false}
  fi

  # Determine pool
  POOL="data_rich"
  if [[ "$EMAIL_COUNT" -eq 0 ]]; then
    POOL="minimal"
  elif [[ "$EMAIL_COUNT" -lt 3 ]]; then
    POOL="data_sparse"
  fi

  YAML_CONTENT="$YAML_CONTENT
  - id: \"$CASE_ID\"
    title: \"$TITLE\"
    severity: \"$SEVERITY\"
    pool: \"$POOL\"
    hasEmails: $HAS_EMAILS
    emailCount: $EMAIL_COUNT
    hasICM: $HAS_ICM
    tags: []"

  CASE_COUNT=$((CASE_COUNT + 1))
done

# ─── Write output ─────────────────────────────────────────
echo "$YAML_CONTENT" > "$LIVE_CASES_FILE"

echo "[refresh-live-cases] ✅ Refreshed live-cases.yaml"
echo "   Cases found: $CASE_COUNT"
echo "   File: $LIVE_CASES_FILE"

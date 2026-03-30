#!/usr/bin/env bash
# tests/executors/queue-recycler.sh — Recycle unresolved items back to testQueue
#
# Moves items from regressionQueue, fixQueue (retryCount<3), and verifyQueue
# back into testQueue so SCAN doesn't idle when no new gaps are found.
#
# Usage: bash tests/executors/queue-recycler.sh
# Output: RECYCLE|{fromQueue}|{testId}|{reason}  (per item)
#         RECYCLE_SUMMARY|{total}|{fromRegression}|{fromFix}|{fromVerify}
#
# Side effects: Updates state.json via state-writer.sh (atomic write)

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

STATE_FILE="$TESTS_ROOT/state.json"

if [ ! -f "$STATE_FILE" ]; then
  log_fail "state.json not found"
  exit 1
fi

init_progress
write_progress "recycler" "start" "Checking queues for recyclable items" "scan"

log_info "=== Queue Recycler ==="

# ============================================================
# Temp files for separating log output from state JSON
# ============================================================
TMP_STATE=$(mktemp)
TMP_LOG=$(mktemp)
trap "rm -f '$TMP_STATE' '$TMP_LOG'" EXIT

# ============================================================
# Read state and compute recycle plan via node
# ============================================================
STATE_PATH="$STATE_FILE" TMP_STATE_PATH="$TMP_STATE" TMP_LOG_PATH="$TMP_LOG" \
  NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
const fs = require('fs');
const state = JSON.parse(fs.readFileSync(process.env.STATE_PATH, 'utf8'));

const recycled = [];
let fromRegression = 0;
let fromFix = 0;
let fromVerify = 0;

// 1. Recycle ALL items from regressionQueue
if (state.regressionQueue && state.regressionQueue.length > 0) {
  for (const item of state.regressionQueue) {
    const testId = typeof item === 'string' ? item : item.testId;
    recycled.push({ testId, from: 'regressionQueue', reason: 'regression retest' });
    fromRegression++;
  }
  state.regressionQueue = [];
}

// 2. Recycle fixQueue items with retryCount < 3
if (state.fixQueue && state.fixQueue.length > 0) {
  const keep = [];
  for (const item of state.fixQueue) {
    const retryCount = item.retryCount || 0;
    if (retryCount < 3) {
      recycled.push({ testId: item.testId, from: 'fixQueue', reason: 'retry #' + (retryCount + 1) });
      fromFix++;
    } else {
      keep.push(item);  // retryCount >= 3 stays (needs human intervention)
    }
  }
  state.fixQueue = keep;
}

// 3. Recycle ALL items from verifyQueue
if (state.verifyQueue && state.verifyQueue.length > 0) {
  for (const item of state.verifyQueue) {
    const testId = typeof item === 'string' ? item : item.testId;
    recycled.push({ testId, from: 'verifyQueue', reason: 'pending verification' });
    fromVerify++;
  }
  state.verifyQueue = [];
}

const total = recycled.length;

// Add recycled items to testQueue (dedup by testId)
const existingTestIds = new Set((state.testQueue || []).map(t => typeof t === 'string' ? t : t.testId));
for (const r of recycled) {
  if (!existingTestIds.has(r.testId)) {
    state.testQueue.push({ testId: r.testId, recycledFrom: r.from, reason: r.reason });
    existingTestIds.add(r.testId);
  }
}

// Write recycle log to temp file
const logLines = [];
for (const r of recycled) {
  logLines.push('RECYCLE|' + r.from + '|' + r.testId + '|' + r.reason);
}
logLines.push('RECYCLE_SUMMARY|' + total + '|' + fromRegression + '|' + fromFix + '|' + fromVerify);
fs.writeFileSync(process.env.TMP_LOG_PATH, logLines.join('\n'));

// Write updated state to temp file
fs.writeFileSync(process.env.TMP_STATE_PATH, JSON.stringify(state));
" 2>/dev/null

# ============================================================
# Output recycle log
# ============================================================
RECYCLE_OUTPUT=$(cat "$TMP_LOG")
echo "$RECYCLE_OUTPUT"

# Extract summary
TOTAL=$(echo "$RECYCLE_OUTPUT" | grep "^RECYCLE_SUMMARY" | cut -d'|' -f2)
FROM_REG=$(echo "$RECYCLE_OUTPUT" | grep "^RECYCLE_SUMMARY" | cut -d'|' -f3)
FROM_FIX=$(echo "$RECYCLE_OUTPUT" | grep "^RECYCLE_SUMMARY" | cut -d'|' -f4)
FROM_VER=$(echo "$RECYCLE_OUTPUT" | grep "^RECYCLE_SUMMARY" | cut -d'|' -f5)

TOTAL="${TOTAL:-0}"

if [ "$TOTAL" -gt 0 ]; then
  log_info "Recycled $TOTAL items: regression=$FROM_REG, fix=$FROM_FIX, verify=$FROM_VER"

  # Write updated state via state-writer.sh (atomic)
  bash "$EXECUTORS_DIR/state-writer.sh" --file "$TMP_STATE"
else
  log_info "No items to recycle — all queues empty or retryCount >= 3"
fi

clear_progress "recycler"

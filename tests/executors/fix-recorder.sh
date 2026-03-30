#!/usr/bin/env bash
# tests/executors/fix-recorder.sh — Record a completed fix
#
# Usage: bash tests/executors/fix-recorder.sh <test-id> <fix-type> <description> [modified-files] [recipe-used]
# Example: bash tests/executors/fix-recorder.sh auth-endpoints code_bug "Updated test assertion to use isSetup" "tests/registry/backend-api/auth-endpoints.yaml"
#
# Called by the FIX agent after applying a fix.
# Records the fix to tests/results/fixes/{testId}-fix.md
# Moves the test from fixQueue to verifyQueue in state.json
#
# fix-type: "code_bug" or "env_issue"
# - code_bug: fix recorded to results/fixes/
# - env_issue: fix recorded + learnings-writer.sh called

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# ============================================================
# Arguments
# ============================================================
TEST_ID="${1:?Usage: fix-recorder.sh <test-id> <fix-type> <description> [modified-files] [recipe-used]}"
FIX_TYPE="${2:?Missing fix-type (code_bug|env_issue)}"
DESCRIPTION="${3:?Missing fix description}"
MODIFIED_FILES="${4:-}"
RECIPE_USED="${5:-}"

STATE_FILE="$TESTS_ROOT/state.json"
FIXES_DIR="$RESULTS_DIR/fixes"
mkdir -p "$FIXES_DIR"

log_info "=== Fix Recorder ==="
log_info "Test: $TEST_ID"
log_info "Type: $FIX_TYPE"
log_info "Description: $DESCRIPTION"
[ -n "$RECIPE_USED" ] && log_info "Recipe: $RECIPE_USED"

# ============================================================
# Capture git diff of modified files (if any)
# ============================================================
GIT_DIFF=""
if [ -n "$MODIFIED_FILES" ]; then
  IFS=',' read -ra FILES <<< "$MODIFIED_FILES"
  for f in "${FILES[@]}"; do
    f=$(echo "$f" | tr -d ' \r')
    [ -z "$f" ] && continue
    FULL_PATH="$PROJECT_ROOT/$f"
    if [ -f "$FULL_PATH" ]; then
      DIFF=$(cd "$PROJECT_ROOT" && git diff -- "$f" 2>/dev/null || echo "no diff available")
      if [ -n "$DIFF" ] && [ "$DIFF" != "no diff available" ]; then
        GIT_DIFF="${GIT_DIFF}### $f\n\`\`\`diff\n${DIFF}\n\`\`\`\n\n"
      fi
    fi
  done
fi

# ============================================================
# Write fix report
# ============================================================
FIX_FILE="$FIXES_DIR/${TEST_ID}-fix.md"

cat > "$FIX_FILE" << FIX_EOF
# Fix Report: $TEST_ID

**Test ID:** $TEST_ID
**Fix Type:** $FIX_TYPE
**Description:** $DESCRIPTION
**Modified Files:** ${MODIFIED_FILES:-none}
**Fixed At:** $(date -u +"%Y-%m-%dT%H:%M:%SZ")
**Recipe Used:** ${RECIPE_USED:-none}

## What Was Fixed

$DESCRIPTION

## Modified Files

$(if [ -n "$MODIFIED_FILES" ]; then
  IFS=',' read -ra TMP_FILES <<< "$MODIFIED_FILES"
  for f in "${TMP_FILES[@]}"; do
    echo "- \`$(echo "$f" | tr -d ' \r')\`"
  done
else
  echo "No files modified (configuration/environment fix)"
fi)

## Diff

$(if [ -n "$GIT_DIFF" ]; then
  echo -e "$GIT_DIFF"
else
  echo "No git diff captured (files may not be tracked or no changes)"
fi)
FIX_EOF

log_info "Fix report written to: $FIX_FILE"

# ============================================================
# Update state.json: move from fixQueue to verifyQueue
# ============================================================
if [ -f "$STATE_FILE" ]; then
  STATE_PATH="$STATE_FILE" FIX_TEST_ID="$TEST_ID" FIX_TYPE_VAL="$FIX_TYPE" FIX_DESC="$DESCRIPTION" RECIPE_USED="${RECIPE_USED:-}" \
  NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
    const fs = require('fs');
    const state = JSON.parse(fs.readFileSync(process.env.STATE_PATH, 'utf8'));

    // Remove from fixQueue
    const testId = process.env.FIX_TEST_ID;
    const fixIdx = state.fixQueue.findIndex(e => e.testId === testId);
    let retryCount = 0;
    if (fixIdx >= 0) {
      retryCount = state.fixQueue[fixIdx].retryCount || 0;
      state.fixQueue.splice(fixIdx, 1);
    }

    // Add to verifyQueue
    if (!state.verifyQueue) state.verifyQueue = [];
    const existsInVerify = state.verifyQueue.some(e => e.testId === testId);
    if (!existsInVerify) {
      state.verifyQueue.push({
        testId: testId,
        fixType: process.env.FIX_TYPE_VAL,
        fixDescription: process.env.FIX_DESC,
        recipeUsed: process.env.RECIPE_USED || null,
        retryCount: retryCount,
        fixedAt: new Date().toISOString()
      });
    }

    fs.writeFileSync(process.env.STATE_PATH, JSON.stringify(state, null, 2) + '\\n');
    console.log('Moved ' + testId + ' from fixQueue to verifyQueue');
    console.log('fixQueue: ' + state.fixQueue.length + ', verifyQueue: ' + state.verifyQueue.length);
  " 2>/dev/null

  if [ $? -eq 0 ]; then
    log_pass "state.json updated: $TEST_ID moved to verifyQueue"
  else
    log_warn "Failed to update state.json"
  fi
else
  log_warn "state.json not found — skipping queue update"
fi

# ============================================================
# For env_issue: also write to learnings.yaml
# ============================================================
if [ "$FIX_TYPE" = "env_issue" ]; then
  log_info "Env issue detected — writing to learnings.yaml"
  bash "$SCRIPT_DIR/learnings-writer.sh" \
    "fix-${TEST_ID}" \
    "test" \
    "$DESCRIPTION" \
    "See fix report: tests/results/fixes/${TEST_ID}-fix.md"
fi

# ============================================================
# Run regression tracker if files were modified
# ============================================================
if [ -n "$MODIFIED_FILES" ] && [ "$FIX_TYPE" = "code_bug" ]; then
  log_info "Code bug fix — tracking regressions"
  bash "$SCRIPT_DIR/regression-tracker.sh" "$TEST_ID" "$MODIFIED_FILES"
fi

echo "FIX_RECORDED|$TEST_ID|$FIX_TYPE|$FIX_FILE|${RECIPE_USED:-}"

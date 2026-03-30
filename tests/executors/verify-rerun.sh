#!/usr/bin/env bash
# tests/executors/verify-rerun.sh — VERIFY Phase: Re-run a fixed test
#
# Usage: bash tests/executors/verify-rerun.sh <test-id> <round>
# Example: bash tests/executors/verify-rerun.sh auth-endpoints 1
#
# Reads: tests/registry/<category>/<test-id>.yaml (to determine executor)
#        tests/state.json (verifyQueue/fixQueue)
# Writes: tests/results/<round>-<test-id>.json (new result)
# Output: VERIFY_RESULT|<test-id>|pass|<assertions>
#     or: VERIFY_RESULT|<test-id>|fail|<reason>
#
# Flow:
# 1. Find the test definition to determine category/executor
# 2. Re-run the appropriate executor
# 3. Compare with previous failure
# 4. Output structured result for state machine

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# ============================================================
# Arguments
# ============================================================
TEST_ID="${1:?Usage: verify-rerun.sh <test-id> <round>}"
ROUND="${2:-0}"

log_info "=== VERIFY Rerun ==="
log_info "Test: $TEST_ID (Round $ROUND)"
init_progress
write_progress "$TEST_ID" "verify_start" "Finding test definition and executor" "verify"

# ============================================================
# Find test definition and determine category
# ============================================================
CATEGORY=""
TEST_DEF_FILE=""

for cat_dir in backend-api ui-interaction ui-visual workflow-e2e frontend observability; do
  if [ -f "$REGISTRY_DIR/$cat_dir/${TEST_ID}.yaml" ]; then
    CATEGORY="$cat_dir"
    TEST_DEF_FILE="$REGISTRY_DIR/$cat_dir/${TEST_ID}.yaml"
    break
  fi
done

if [ -z "$CATEGORY" ]; then
  log_fail "Could not find test definition for $TEST_ID in any category"
  echo "VERIFY_RESULT|$TEST_ID|error|test_definition_not_found"
  exit 1
fi

log_info "Category: $CATEGORY"
log_info "Definition: $TEST_DEF_FILE"

# ============================================================
# Determine which executor to use
# ============================================================
EXECUTOR=""
case "$CATEGORY" in
  backend-api|frontend)
    EXECUTOR="$EXECUTORS_DIR/api-runner.sh"
    ;;
  workflow-e2e)
    EXECUTOR="$EXECUTORS_DIR/e2e-runner.sh"
    ;;
  ui-interaction)
    EXECUTOR="$EXECUTORS_DIR/ui-runner.sh"
    ;;
  ui-visual)
    EXECUTOR="$EXECUTORS_DIR/visual-runner.sh"
    ;;
  observability)
    EXECUTOR="$EXECUTORS_DIR/observability-runner.sh"
    ;;
  *)
    log_fail "Unknown category: $CATEGORY"
    echo "VERIFY_RESULT|$TEST_ID|error|unknown_category_$CATEGORY"
    exit 1
    ;;
esac

if [ ! -f "$EXECUTOR" ]; then
  log_fail "Executor not found: $EXECUTOR"
  echo "VERIFY_RESULT|$TEST_ID|error|executor_not_found"
  exit 1
fi

log_info "Executor: $EXECUTOR"

# ============================================================
# Check previous failure result (for comparison)
# ============================================================
PREV_ROUND=$((ROUND - 1))
PREV_RESULT_FILE="$RESULTS_DIR/${PREV_ROUND}-${TEST_ID}.json"
PREV_FAILURE=""

if [ -f "$PREV_RESULT_FILE" ]; then
  PREV_FAILURE=$(RESULT_PATH="$PREV_RESULT_FILE" NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
    const d=JSON.parse(require('fs').readFileSync(process.env.RESULT_PATH,'utf8'));
    const failed = (d.assertions||[]).filter(a => a.pass === false);
    failed.forEach(a => console.log(a.name + ': ' + (a.actual||'?')));
  " 2>/dev/null || echo "could not read previous result")
  log_info "Previous failure(s):"
  echo "$PREV_FAILURE"
else
  log_warn "No previous result file found at $PREV_RESULT_FILE"
fi

# ============================================================
# Re-run the test
# ============================================================
log_info "Re-running test with executor..."
write_progress "$TEST_ID" "verify_executing" "Re-running $CATEGORY test via $EXECUTOR" "verify:$CATEGORY"

EXECUTOR_OUTPUT=""
EXECUTOR_EXIT=0
EXECUTOR_OUTPUT=$(bash "$EXECUTOR" "$TEST_ID" "$CATEGORY" "$ROUND" 2>&1) || EXECUTOR_EXIT=$?

# ============================================================
# Check the new result
# ============================================================
NEW_RESULT_FILE="$RESULTS_DIR/${ROUND}-${TEST_ID}.json"

if [ ! -f "$NEW_RESULT_FILE" ]; then
  log_fail "Executor did not produce result file: $NEW_RESULT_FILE"
  echo "VERIFY_RESULT|$TEST_ID|error|no_result_file"
  exit 1
fi

NEW_STATUS=$(RESULT_PATH="$NEW_RESULT_FILE" NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
  const d=JSON.parse(require('fs').readFileSync(process.env.RESULT_PATH,'utf8'));
  console.log(d.status);
" 2>/dev/null || echo "unknown")

NEW_PASSED=$(RESULT_PATH="$NEW_RESULT_FILE" NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
  const d=JSON.parse(require('fs').readFileSync(process.env.RESULT_PATH,'utf8'));
  const p = (d.assertions||[]).filter(a => a.pass === true).length;
  const t = (d.assertions||[]).length;
  console.log(p + '/' + t);
" 2>/dev/null || echo "?/?")

log_info "Verify result: $NEW_STATUS ($NEW_PASSED assertions)"

# ============================================================
# Write verification summary
# ============================================================
VERIFY_DIR="$RESULTS_DIR/fixes"
mkdir -p "$VERIFY_DIR"

VERIFY_FILE="$VERIFY_DIR/${TEST_ID}-verify.md"
cat > "$VERIFY_FILE" << VERIFY_EOF
# Verify Result: $TEST_ID

**Round:** $ROUND (previous failure: Round $PREV_ROUND)
**Category:** $CATEGORY
**Status:** $NEW_STATUS
**Assertions:** $NEW_PASSED
**Verified At:** $(date -u +"%Y-%m-%dT%H:%M:%SZ")

## Previous Failures

$PREV_FAILURE

## Executor Output

\`\`\`
$(echo "$EXECUTOR_OUTPUT" | tail -30)
\`\`\`

## Verdict

$(if [ "$NEW_STATUS" = "pass" ]; then
  echo "✅ FIX VERIFIED — test now passes"
  echo ""
  echo "Action: Remove from verifyQueue, increment stats.fixed"
  if [ "$CATEGORY" = "observability" ]; then
    echo ""
    echo "📊 Triggering baseline-updater for observability probe..."
  fi
elif [ "$NEW_STATUS" = "fail" ]; then
  echo "❌ FIX NOT VERIFIED — test still fails"
  echo ""
  echo "Action: Move back to fixQueue with increased retryCount"
else
  echo "⚠️ INCONCLUSIVE — status=$NEW_STATUS"
  echo ""
  echo "Action: Keep in verifyQueue for manual review"
fi)
VERIFY_EOF

log_info "Verify summary written to: $VERIFY_FILE"
clear_progress "$TEST_ID"

# ============================================================
# Post-verify: update baselines for passing observability probes
# ============================================================
if [ "$CATEGORY" = "observability" ] && [ "$NEW_STATUS" = "pass" ]; then
  BASELINE_UPDATER="$EXECUTORS_DIR/baseline-updater.sh"
  if [ -f "$BASELINE_UPDATER" ]; then
    log_info "Running baseline-updater for $TEST_ID..."
    BASELINE_OUTPUT=$(bash "$BASELINE_UPDATER" "$TEST_ID" 2>&1)
    log_info "Baseline update: $(echo "$BASELINE_OUTPUT" | grep "BASELINE_UPDATE" || echo "no output")"
  fi
fi

# ============================================================
# Output structured result for state machine
# ============================================================
echo "VERIFY_RESULT|$TEST_ID|$NEW_STATUS|$NEW_PASSED"

#!/usr/bin/env bash
# tests/executors/fix-recorder.sh — Record a completed fix
#
# Usage: bash tests/executors/fix-recorder.sh <test-id> <fix-type> <description> [modified-files] [recipe-used]
# Example: bash tests/executors/fix-recorder.sh auth-endpoints code_bug "Updated test assertion to use isSetup" "tests/registry/backend-api/auth-endpoints.yaml"
#
# Called by the FIX agent after applying a fix.
# Records the fix to tests/results/fixes/{testId}-fix.md
# Moves the test from fixQueue to verifyQueue in queues.json
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

# ============================================================
# Input validation: detect CLI flags passed as positional args
# (Defense against LLM agents using --fixId/--testId/--category
#  named-flag syntax instead of positional args)
# ============================================================
_validate_not_flag() {
  local name="$1" value="$2"
  if [[ "$value" == --* ]]; then
    log_fail "fix-recorder: $name looks like a CLI flag ('$value'), not a value."
    log_fail "Usage: fix-recorder.sh <test-id> <fix-type> <description> [modified-files] [recipe-used]"
    log_fail "All arguments are POSITIONAL. Do NOT use --fixId/--testId/--category flags."
    echo "FIX_REJECTED|$value|cli_flag_as_value"
    exit 1
  fi
}
_validate_not_flag "test-id (arg 1)" "$TEST_ID"
_validate_not_flag "fix-type (arg 2)" "$FIX_TYPE"
_validate_not_flag "description (arg 3)" "$DESCRIPTION"
[ -n "$MODIFIED_FILES" ] && _validate_not_flag "modified-files (arg 4)" "$MODIFIED_FILES"
[ -n "$RECIPE_USED" ] && _validate_not_flag "recipe-used (arg 5)" "$RECIPE_USED"

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
# Update queues.json: move from fixQueue to verifyQueue
# ============================================================
if [ -f "$QUEUES_FILE" ]; then
  QUEUES_PATH="$QUEUES_FILE" FIX_TEST_ID="$TEST_ID" FIX_TYPE_VAL="$FIX_TYPE" FIX_DESC="$DESCRIPTION" RECIPE_USED="${RECIPE_USED:-}" \
  NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
    const fs = require('fs');
    const queues = JSON.parse(fs.readFileSync(process.env.QUEUES_PATH, 'utf8'));

    // Remove from fixQueue
    const testId = process.env.FIX_TEST_ID;
    const fixIdx = queues.fixQueue.findIndex(e => e.testId === testId);
    let retryCount = 0;
    if (fixIdx >= 0) {
      retryCount = queues.fixQueue[fixIdx].retryCount || 0;
      queues.fixQueue.splice(fixIdx, 1);
    }

    // Add to verifyQueue
    if (!queues.verifyQueue) queues.verifyQueue = [];
    const existsInVerify = queues.verifyQueue.some(e => e.testId === testId);
    if (!existsInVerify) {
      queues.verifyQueue.push({
        testId: testId,
        fixType: process.env.FIX_TYPE_VAL,
        fixDescription: process.env.FIX_DESC,
        recipeUsed: process.env.RECIPE_USED || null,
        retryCount: retryCount,
        fixedAt: new Date().toISOString()
      });
    }

    fs.writeFileSync(process.env.QUEUES_PATH, JSON.stringify(queues, null, 2) + '\\n');
    console.log('Moved ' + testId + ' from fixQueue to verifyQueue');
    console.log('fixQueue: ' + queues.fixQueue.length + ', verifyQueue: ' + queues.verifyQueue.length);
  " 2>/dev/null

  if [ $? -eq 0 ]; then
    log_pass "queues.json updated: $TEST_ID moved to verifyQueue"
  else
    log_warn "Failed to update queues.json"
  fi
else
  log_warn "queues.json not found — skipping queue update"
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
# Handle retro-fix items (from Phase Retrospective)
# ============================================================
# retro-fix items have testIds like "retro-fix-{round}-{PHASE}" and may carry
# retroContext in the fixQueue (targetFile, targetLine, rootCause, anomaly).
# When recording such fixes, enrich the fix report with retro_fix metadata.
if [[ "$TEST_ID" == retro-fix-* ]] || [[ "$FIX_TYPE" == "framework_fix" ]]; then
  log_info "Retro-fix item detected (testId=$TEST_ID) — enriching fix report with retroContext"

  # Try to extract retroContext from queues.json for this item
  RETRO_CONTEXT=""
  if [ -f "$QUEUES_FILE" ]; then
    RETRO_CONTEXT=$(QUEUES_PATH="$QUEUES_FILE" FIX_TEST_ID="$TEST_ID" \
      NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
      const fs = require('fs');
      const queues = JSON.parse(fs.readFileSync(process.env.QUEUES_PATH, 'utf8'));
      // Search in fixQueue and verifyQueue
      const allItems = [...(queues.fixQueue || []), ...(queues.verifyQueue || [])];
      const item = allItems.find(e => e.testId === process.env.FIX_TEST_ID);
      if (item && item.retroContext) {
        console.log(JSON.stringify(item.retroContext, null, 2));
      }
    " 2>/dev/null || echo "")
  fi

  # Append retroContext section to fix report if available
  if [ -n "$RETRO_CONTEXT" ] && [ "$RETRO_CONTEXT" != "" ]; then
    cat >> "$FIX_FILE" << RETRO_EOF

## Retro Context (Phase Retrospective)

\`\`\`json
$RETRO_CONTEXT
\`\`\`

This fix was generated from a Phase Retrospective finding.
The retroContext above contains the anomaly, root cause, and target location
identified during the stage retrospective analysis.
RETRO_EOF
    log_info "retroContext appended to fix report"
  fi
fi

# ============================================================
# Run regression tracker if files were modified
# ============================================================
if [ -n "$MODIFIED_FILES" ] && [ "$FIX_TYPE" = "code_bug" ]; then
  log_info "Code bug fix — tracking regressions"
  bash "$SCRIPT_DIR/regression-tracker.sh" "$TEST_ID" "$MODIFIED_FILES"
fi

echo "FIX_RECORDED|$TEST_ID|$FIX_TYPE|$FIX_FILE|${RECIPE_USED:-}"

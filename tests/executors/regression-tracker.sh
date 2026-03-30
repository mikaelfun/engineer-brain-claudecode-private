#!/usr/bin/env bash
# tests/executors/regression-tracker.sh — Track regression needs after FIX
#
# Usage: bash tests/executors/regression-tracker.sh <fixed-test-id> <modified-files>
# Example: bash tests/executors/regression-tracker.sh auth-endpoints "dashboard/src/routes/auth.ts,tests/registry/backend-api/auth-endpoints.yaml"
#
# When FIX modifies source code, this script:
# 1. Identifies which other tests reference the modified files
# 2. Adds those tests to state.json's regressionQueue
# 3. Next TEST round prioritizes regression tests
#
# Reads: tests/state.json, tests/registry/**/*.yaml
# Writes: tests/state.json (regressionQueue updated)
# Output: REGRESSION|<count>|<test-ids>

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# ============================================================
# Arguments
# ============================================================
FIXED_TEST_ID="${1:?Usage: regression-tracker.sh <fixed-test-id> <modified-files>}"
MODIFIED_FILES="${2:-}"

STATE_FILE="$TESTS_ROOT/state.json"

if [ ! -f "$STATE_FILE" ]; then
  log_fail "state.json not found"
  exit 1
fi

log_info "=== Regression Tracker ==="
log_info "Fixed test: $FIXED_TEST_ID"
log_info "Modified files: ${MODIFIED_FILES:-none}"

# ============================================================
# Find tests affected by modified files
# ============================================================
AFFECTED_TESTS=""
AFFECTED_COUNT=0

if [ -n "$MODIFIED_FILES" ]; then
  # Split comma-separated file list
  IFS=',' read -ra FILES <<< "$MODIFIED_FILES"

  for mod_file in "${FILES[@]}"; do
    mod_file=$(echo "$mod_file" | tr -d ' \r')
    [ -z "$mod_file" ] && continue

    # Extract just the filename for broader matching
    mod_basename=$(basename "$mod_file")

    log_info "Checking for tests referencing: $mod_file"

    # Search all test definitions for references to this file
    for cat_dir in backend-api ui-interaction ui-visual workflow-e2e frontend; do
      cat_path="$REGISTRY_DIR/$cat_dir"
      [ -d "$cat_path" ] || continue

      for yaml_file in "$cat_path"/*.yaml; do
        [ -f "$yaml_file" ] || continue

        # Extract test ID from filename
        test_id=$(basename "$yaml_file" .yaml)

        # Skip the fixed test itself
        [ "$test_id" = "$FIXED_TEST_ID" ] && continue

        # Check if this test references the modified file
        if grep -q "$mod_basename" "$yaml_file" 2>/dev/null || \
           grep -q "$mod_file" "$yaml_file" 2>/dev/null; then
          # Check if already in affected list
          if ! echo "$AFFECTED_TESTS" | grep -q "$test_id"; then
            AFFECTED_TESTS="${AFFECTED_TESTS:+$AFFECTED_TESTS,}$test_id"
            AFFECTED_COUNT=$((AFFECTED_COUNT + 1))
            log_info "  → Affected: $test_id (references $mod_basename)"
          fi
        fi
      done
    done
  done
fi

# ============================================================
# Also check tests in the same category as the fixed test
# ============================================================
FIXED_CATEGORY=""
for cat_dir in backend-api ui-interaction ui-visual workflow-e2e frontend; do
  if [ -f "$REGISTRY_DIR/$cat_dir/${FIXED_TEST_ID}.yaml" ]; then
    FIXED_CATEGORY="$cat_dir"
    break
  fi
done

if [ -n "$FIXED_CATEGORY" ] && [ "$FIXED_CATEGORY" != "unknown" ]; then
  # Add same-category tests as potential regression candidates
  # (only if they share source files — checked via "source:" field)
  FIXED_SOURCE=""
  if [ -f "$REGISTRY_DIR/$FIXED_CATEGORY/${FIXED_TEST_ID}.yaml" ]; then
    FIXED_SOURCE=$(grep "^source:" "$REGISTRY_DIR/$FIXED_CATEGORY/${FIXED_TEST_ID}.yaml" | sed 's/source: *"\{0,1\}\(.*\)"\{0,1\}/\1/' | tr -d '\r"')
  fi

  if [ -n "$FIXED_SOURCE" ]; then
    # Extract primary source file (before any " — " separator)
    PRIMARY_SOURCE=$(echo "$FIXED_SOURCE" | sed 's/ — .*//')

    for yaml_file in "$REGISTRY_DIR/$FIXED_CATEGORY"/*.yaml; do
      [ -f "$yaml_file" ] || continue
      test_id=$(basename "$yaml_file" .yaml)
      [ "$test_id" = "$FIXED_TEST_ID" ] && continue

      # Check if this test shares the same source
      test_source=$(grep "^source:" "$yaml_file" | sed 's/source: *"\{0,1\}\(.*\)"\{0,1\}/\1/' | tr -d '\r"')
      if echo "$test_source" | grep -q "$PRIMARY_SOURCE" 2>/dev/null; then
        if ! echo "$AFFECTED_TESTS" | grep -q "$test_id"; then
          AFFECTED_TESTS="${AFFECTED_TESTS:+$AFFECTED_TESTS,}$test_id"
          AFFECTED_COUNT=$((AFFECTED_COUNT + 1))
          log_info "  → Same-source regression: $test_id"
        fi
      fi
    done
  fi
fi

# ============================================================
# Update state.json regressionQueue
# ============================================================
if [ $AFFECTED_COUNT -gt 0 ]; then
  log_info "Found $AFFECTED_COUNT test(s) for regression"

  # Build JSON array of regression entries
  REGRESSION_ENTRIES=""
  IFS=',' read -ra TEST_IDS <<< "$AFFECTED_TESTS"
  for tid in "${TEST_IDS[@]}"; do
    tid=$(echo "$tid" | tr -d ' \r')
    [ -z "$tid" ] && continue
    ENTRY="{\"testId\":\"$tid\",\"triggeredBy\":\"$FIXED_TEST_ID\",\"addedAt\":\"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"}"
    REGRESSION_ENTRIES="${REGRESSION_ENTRIES:+$REGRESSION_ENTRIES,}$ENTRY"
  done

  # Update state.json using node (safe JSON manipulation)
  STATE_PATH="$STATE_FILE" REG_ENTRIES="$REGRESSION_ENTRIES" \
  NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
    const fs = require('fs');
    const state = JSON.parse(fs.readFileSync(process.env.STATE_PATH, 'utf8'));

    const newEntries = [${REGRESSION_ENTRIES}];

    // Merge with existing regressionQueue (no duplicates)
    if (!state.regressionQueue) state.regressionQueue = [];
    for (const entry of newEntries) {
      const exists = state.regressionQueue.some(e => e.testId === entry.testId);
      if (!exists) {
        state.regressionQueue.push(entry);
      }
    }

    fs.writeFileSync(process.env.STATE_PATH, JSON.stringify(state, null, 2) + '\\n');
    console.log('Updated regressionQueue: ' + state.regressionQueue.length + ' entries');
  " 2>/dev/null

  if [ $? -eq 0 ]; then
    log_pass "Regression queue updated with $AFFECTED_COUNT test(s)"
  else
    log_warn "Failed to update state.json — manual update needed"
  fi
else
  log_info "No regression tests needed (no other tests reference modified files)"
fi

# ============================================================
# Write regression report
# ============================================================
FIXES_DIR="$RESULTS_DIR/fixes"
mkdir -p "$FIXES_DIR"

REGRESSION_FILE="$FIXES_DIR/${FIXED_TEST_ID}-regression.md"
cat > "$REGRESSION_FILE" << REG_EOF
# Regression Tracking: $FIXED_TEST_ID

**Fixed Test:** $FIXED_TEST_ID
**Category:** ${FIXED_CATEGORY:-unknown}
**Modified Files:** ${MODIFIED_FILES:-none}
**Affected Tests:** $AFFECTED_COUNT
**Tracked At:** $(date -u +"%Y-%m-%dT%H:%M:%SZ")

## Affected Tests

$(if [ $AFFECTED_COUNT -gt 0 ]; then
  IFS=',' read -ra TMP_IDS <<< "$AFFECTED_TESTS"
  for tid in "${TMP_IDS[@]}"; do
    echo "- \`$tid\` — needs regression re-run"
  done
else
  echo "No other tests affected by this fix."
fi)

## Next Steps

$(if [ $AFFECTED_COUNT -gt 0 ]; then
  echo "These tests will be prioritized in the next TEST round."
  echo "The state machine checks regressionQueue before testQueue."
else
  echo "No regression run needed. Proceed normally."
fi)
REG_EOF

log_info "Regression report: $REGRESSION_FILE"

# ============================================================
# Output for state machine
# ============================================================
echo "REGRESSION|$AFFECTED_COUNT|${AFFECTED_TESTS:-none}"

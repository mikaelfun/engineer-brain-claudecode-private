#!/usr/bin/env bash
# tests/executors/unit-runner.sh — Unit Test Executor (npm test wrapper)
#
# Usage: bash tests/executors/unit-runner.sh <test-id> <round>
# Example: bash tests/executors/unit-runner.sh unit-all 0
#          bash tests/executors/unit-runner.sh unit-server 0
#          bash tests/executors/unit-runner.sh unit-web 0
#
# Reads: tests/registry/unit-test/<test-id>.yaml
# Writes: tests/results/<round>-<test-id>.json
#
# Wraps npm test commands, parses Vitest output, and produces standard result JSON.

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# ============================================================
# Arguments
# ============================================================
TEST_ID="${1:?Usage: unit-runner.sh <test-id> <round>}"
ROUND="${2:-0}"

TEST_FILE="$REGISTRY_DIR/unit-test/${TEST_ID}.yaml"

if [ ! -f "$TEST_FILE" ]; then
  log_fail "Test definition not found: $TEST_FILE"
  exit 1
fi

log_info "=== Unit Test Runner ==="
log_info "Test: $TEST_ID (Round $ROUND)"
log_info "Definition: $TEST_FILE"

start_timer
reset_assertions
init_progress
write_progress "$TEST_ID" "preflight" "Starting unit test execution" "unit-test"

# ============================================================
# Parse test definition — extract npm_command
# ============================================================
# Lightweight YAML parsing (same pattern as other runners)
NPM_COMMAND=""
NPM_PREFIX=""
EXPECTED_EXIT="0"

while IFS= read -r line; do
  line=$(echo "$line" | tr -d '\r')
  case "$line" in
    npm_command:*)  NPM_COMMAND=$(echo "$line" | sed 's/^npm_command: *//' | tr -d '"') ;;
    npm_prefix:*)   NPM_PREFIX=$(echo "$line" | sed 's/^npm_prefix: *//' | tr -d '"') ;;
    expected_exit:*) EXPECTED_EXIT=$(echo "$line" | sed 's/^expected_exit: *//' | tr -d '"') ;;
  esac
done < "$TEST_FILE"

# Defaults
NPM_COMMAND="${NPM_COMMAND:-test}"
NPM_PREFIX="${NPM_PREFIX:-}"

log_info "npm command: npm ${NPM_PREFIX:+--prefix $NPM_PREFIX }run $NPM_COMMAND"

# ============================================================
# Execute npm test
# ============================================================
write_progress "$TEST_ID" "execution" "Running npm ${NPM_PREFIX:+--prefix $NPM_PREFIX }run $NPM_COMMAND" "unit-test"

cd "$DASHBOARD_DIR" || { log_fail "Cannot cd to $DASHBOARD_DIR"; exit 1; }

# Build the npm command
NPM_ARGS="run $NPM_COMMAND"
if [ -n "$NPM_PREFIX" ]; then
  NPM_ARGS="--prefix $NPM_PREFIX $NPM_ARGS"
fi

# Run and capture output + exit code
OUTPUT_FILE=$(mktemp)
npm $NPM_ARGS > "$OUTPUT_FILE" 2>&1
EXIT_CODE=$?

OUTPUT=$(cat "$OUTPUT_FILE")
rm -f "$OUTPUT_FILE"

cd "$PROJECT_ROOT" || true

log_info "npm exit code: $EXIT_CODE"

# ============================================================
# Parse Vitest output for test counts
# ============================================================
# Strip ANSI color codes before parsing
CLEAN_OUTPUT=$(echo "$OUTPUT" | sed 's/\x1b\[[0-9;]*m//g')

# Vitest output format: "Tests  42 passed | 2 failed (44)"
# or: "Tests  42 passed (42)"
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

# Try to parse Vitest summary line
SUMMARY_LINE=$(echo "$CLEAN_OUTPUT" | grep -E "Tests\s+[0-9]+" | tail -1)
if [ -n "$SUMMARY_LINE" ]; then
  TESTS_PASSED=$(echo "$SUMMARY_LINE" | grep -oE "[0-9]+ passed" | grep -oE "[0-9]+" || echo "0")
  TESTS_FAILED=$(echo "$SUMMARY_LINE" | grep -oE "[0-9]+ failed" | grep -oE "[0-9]+" || echo "0")
  TESTS_TOTAL=$(echo "$SUMMARY_LINE" | grep -oE "\([0-9]+\)" | grep -oE "[0-9]+" || echo "0")
fi

# Fallback: try "Test Files" line
if [ "$TESTS_TOTAL" = "0" ]; then
  FILES_LINE=$(echo "$CLEAN_OUTPUT" | grep -E "Test Files\s+[0-9]+" | tail -1)
  if [ -n "$FILES_LINE" ]; then
    TESTS_PASSED=$(echo "$FILES_LINE" | grep -oE "[0-9]+ passed" | grep -oE "[0-9]+" || echo "0")
    TESTS_FAILED=$(echo "$FILES_LINE" | grep -oE "[0-9]+ failed" | grep -oE "[0-9]+" || echo "0")
  fi
fi

log_info "Tests: $TESTS_PASSED passed, $TESTS_FAILED failed"

# ============================================================
# Build assertions
# ============================================================

# Assertion 1: exit code matches expected
if [ "$EXIT_CODE" = "$EXPECTED_EXIT" ]; then
  add_assertion "npm_exit_code" "true" "$EXPECTED_EXIT" "$EXIT_CODE"
else
  add_assertion "npm_exit_code" "false" "$EXPECTED_EXIT" "$EXIT_CODE" "npm test exited with unexpected code"
fi

# Assertion 2: no test failures
if [ "$TESTS_FAILED" = "0" ] || [ "$TESTS_FAILED" = "" ]; then
  add_assertion "no_test_failures" "true" "0" "${TESTS_FAILED:-0}"
else
  # Extract first failed test name for context
  FIRST_FAIL=$(echo "$OUTPUT" | grep -E "FAIL|✗|×" | head -1 | sed 's/^[[:space:]]*//' | head -c 200)
  add_assertion "no_test_failures" "false" "0" "$TESTS_FAILED" "First failure: $FIRST_FAIL"
fi

# Assertion 3: at least some tests ran
if [ "${TESTS_PASSED:-0}" -gt 0 ] 2>/dev/null; then
  add_assertion "tests_executed" "true" ">0" "$TESTS_PASSED"
else
  add_assertion "tests_executed" "false" ">0" "${TESTS_PASSED:-0}" "No tests passed — possible configuration issue"
fi

finalize_assertions

# ============================================================
# Determine overall status
# ============================================================
if [ "$ASSERTIONS_FAILED" -gt 0 ]; then
  OVERALL_STATUS="fail"
  ERROR_MSG="\"$TESTS_FAILED test(s) failed, exit code $EXIT_CODE\""
else
  OVERALL_STATUS="pass"
  ERROR_MSG="null"
fi

# ============================================================
# Write result
# ============================================================
ELAPSED=$(get_elapsed_ms)
write_result "$ROUND" "$TEST_ID" "$OVERALL_STATUS" "$ASSERTIONS_JSON" "$ERROR_MSG" "$ELAPSED"

# Summary
if [ "$OVERALL_STATUS" = "pass" ]; then
  log_pass "Unit test $TEST_ID: PASS ($TESTS_PASSED tests passed in ${ELAPSED}ms)"
else
  log_fail "Unit test $TEST_ID: FAIL ($TESTS_FAILED failures in ${ELAPSED}ms)"
fi

clear_progress "$TEST_ID"

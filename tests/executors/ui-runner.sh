#!/usr/bin/env bash
# tests/executors/ui-runner.sh — UI Interaction & Visual Test Executor
#
# Usage: bash tests/executors/ui-runner.sh <test-id> <category> <round>
# Example: bash tests/executors/ui-runner.sh dashboard-navigation ui-interaction 0
#
# Reads: tests/registry/<category>/<test-id>.yaml
# Writes: tests/results/<round>-<test-id>.json
#
# UI tests are designed to be run by spawned sub-agents with Playwright MCP access.
# This script provides the pre-flight checks, JWT setup, and result writing framework.
# The actual browser interaction is performed by the calling agent using Playwright tools.
#
# When called directly (without Playwright MCP), it runs API-level UI verification:
# - Check pages load (via curl)
# - Check frontend assets serve correctly
# - Verify API responses that back UI components

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# ============================================================
# Arguments
# ============================================================
TEST_ID="${1:?Usage: ui-runner.sh <test-id> <category> <round>}"
CATEGORY="${2:-ui-interaction}"
ROUND="${3:-0}"

TEST_FILE="$REGISTRY_DIR/${CATEGORY}/${TEST_ID}.yaml"

if [ ! -f "$TEST_FILE" ]; then
  log_fail "Test definition not found: $TEST_FILE"
  exit 1
fi

log_info "=== UI Test Runner ==="
log_info "Test: $TEST_ID (Round $ROUND)"
log_info "Category: $CATEGORY"
log_info "Definition: $TEST_FILE"

# ============================================================
# Pre-flight
# ============================================================
ensure_backend || exit 1
ensure_frontend || log_warn "Frontend not available — API-only checks"

TOKEN=$(generate_jwt)
log_info "JWT generated"

start_timer
reset_assertions

# ============================================================
# Determine if we have Playwright available
# Check: is PLAYWRIGHT_AVAILABLE env var set (agents set this)
# ============================================================
PLAYWRIGHT_MODE="${PLAYWRIGHT_AVAILABLE:-false}"

if [ "$PLAYWRIGHT_MODE" = "true" ]; then
  log_info "Playwright mode: agent-driven (MCP tools available)"
  # Agent handles browser interaction — this script just provides utilities
  # Output the configuration for the agent to use
  cat << AGENT_CONFIG
=== UI Test Configuration ===
FRONTEND_URL=$FRONTEND_URL
API_BASE=$API_BASE
TOKEN=$TOKEN
TEST_FILE=$TEST_FILE
RESULTS_DIR=$RESULTS_DIR
SCREENSHOTS_DIR=$SCREENSHOTS_DIR
ROUND=$ROUND
TEST_ID=$TEST_ID
=== End Configuration ===
AGENT_CONFIG

  # Agent will call write_ui_result.sh when done
  exit 0
fi

# ============================================================
# Non-Playwright mode: API-level UI verification
# ============================================================
log_info "Running in API-level verification mode (no Playwright)"

# Check frontend serves pages
log_info "--- Checking frontend pages ---"

check_page() {
  local path="$1"
  local name="$2"

  local status
  status=$(curl -sf -o /dev/null -w "%{http_code}" "${FRONTEND_URL}${path}" 2>/dev/null || echo "000")
  if [ "$status" = "200" ]; then
    log_pass "Page loads: $name ($path) → $status"
    add_assertion "Page loads: $name" "true" "200" "$status"
  else
    log_fail "Page fails: $name ($path) → $status"
    add_assertion "Page loads: $name" "false" "200" "$status"
  fi
}

# Parse steps from YAML to determine which pages to check
PAGES_CHECKED=0

while IFS= read -r line; do
  line="${line//$'\r'/}"

  # Check for navigate actions
  if echo "$line" | grep -q "navigate"; then
    url=""
    while IFS= read -r nline; do
      nline="${nline//$'\r'/}"
      if echo "$nline" | grep -q "url:"; then
        url=$(echo "$nline" | sed 's/.*url: *"\{0,1\}\(.*\)"\{0,1\}/\1/' | tr -d '"' | sed 's/ *$//')
        url=$(echo "$url" | sed "s|{frontend_url}||g")
        break
      fi
      if echo "$nline" | grep -q "^  -"; then
        break
      fi
    done

    if [ -n "$url" ]; then
      check_page "$url" "Navigate: $url"
      PAGES_CHECKED=$((PAGES_CHECKED + 1))
    fi
  fi
done < "$TEST_FILE"

# If no specific pages found, check common pages
if [ "$PAGES_CHECKED" -eq 0 ]; then
  check_page "/" "Dashboard root"
  check_page "/cases" "Cases page"
  check_page "/issues" "Issues page"
fi

# Check backing APIs return data
log_info "--- Checking backing APIs ---"

http_request "GET" "$API_BASE/api/cases" "$TOKEN"
if [ "$HTTP_STATUS" = "200" ]; then
  add_assertion "API: cases data available" "true" "200" "$HTTP_STATUS"
else
  add_assertion "API: cases data available" "false" "200" "$HTTP_STATUS"
fi

http_request "GET" "$API_BASE/api/issues" "$TOKEN"
if [ "$HTTP_STATUS" = "200" ]; then
  add_assertion "API: issues data available" "true" "200" "$HTTP_STATUS"
else
  add_assertion "API: issues data available" "false" "200" "$HTTP_STATUS"
fi

# ============================================================
# Finalize
# ============================================================
finalize_assertions
ELAPSED=$(get_elapsed_ms)

OVERALL_STATUS="pass"
if [ "$ASSERTIONS_FAILED" -gt 0 ]; then
  OVERALL_STATUS="fail"
fi

ERROR_VAL="null"
if [ "$OVERALL_STATUS" = "fail" ]; then
  ERROR_VAL="\"$ASSERTIONS_FAILED of $ASSERTION_COUNT assertions failed\""
fi

write_result "$ROUND" "$TEST_ID" "$OVERALL_STATUS" "$ASSERTIONS_JSON" "$ERROR_VAL" "$ELAPSED"

echo ""
log_info "=== UI Test Summary ==="
log_info "Test: $TEST_ID"
log_info "Category: $CATEGORY"
log_info "Mode: API-level verification"
log_info "Status: $OVERALL_STATUS"
log_info "Assertions: $ASSERTIONS_PASSED passed, $ASSERTIONS_FAILED failed (total $ASSERTION_COUNT)"
log_info "Duration: ${ELAPSED}ms"

if [ "$OVERALL_STATUS" = "fail" ]; then
  exit 1
else
  exit 0
fi

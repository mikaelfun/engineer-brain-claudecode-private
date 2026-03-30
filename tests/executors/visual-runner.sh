#!/usr/bin/env bash
# tests/executors/visual-runner.sh — UI Visual Test Executor
#
# Usage: bash tests/executors/visual-runner.sh <test-id> <round>
# Example: bash tests/executors/visual-runner.sh theme-responsive 0
#
# Reads: tests/registry/ui-visual/<test-id>.yaml
# Writes: tests/results/<round>-<test-id>.json
#         tests/results/screenshots/<round>-<test-id>-*.jpeg
#
# Visual tests take screenshots at specified viewports and verify layout/theme.
# When run by an agent with Playwright MCP, screenshots are taken via browser tools.
# When run standalone, verifies pages return 200 and checks for required CSS/classes.

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# ============================================================
# Arguments
# ============================================================
TEST_ID="${1:?Usage: visual-runner.sh <test-id> <round>}"
ROUND="${2:-0}"

TEST_FILE="$REGISTRY_DIR/ui-visual/${TEST_ID}.yaml"

if [ ! -f "$TEST_FILE" ]; then
  log_fail "Test definition not found: $TEST_FILE"
  exit 1
fi

log_info "=== Visual Test Runner ==="
log_info "Test: $TEST_ID (Round $ROUND)"

# ============================================================
# Pre-flight
# ============================================================
ensure_backend || exit 1
ensure_frontend || { log_fail "Frontend required for visual tests"; exit 1; }

TOKEN=$(generate_jwt)
log_info "JWT generated"

start_timer
reset_assertions
mkdir -p "$SCREENSHOTS_DIR"

# ============================================================
# Check pages load
# ============================================================
log_info "--- Verifying pages load ---"

# Parse pages from YAML
PAGES=()
while IFS= read -r line; do
  line="${line//$'\r'/}"
  if echo "$line" | grep -q "url:"; then
    page_url=$(echo "$line" | sed 's/.*url: *"\{0,1\}\(.*\)"\{0,1\}/\1/' | tr -d '"' | sed 's/ *$//')
    page_url=$(echo "$page_url" | sed "s|{frontend_url}|$FRONTEND_URL|g" | sed "s|{base_url}|$FRONTEND_URL|g")
    if [ -n "$page_url" ]; then
      PAGES+=("$page_url")
    fi
  fi
done < "$TEST_FILE"

# If no pages specified, check common ones
if [ ${#PAGES[@]} -eq 0 ]; then
  PAGES=("$FRONTEND_URL" "$FRONTEND_URL/cases" "$FRONTEND_URL/issues")
fi

for page in "${PAGES[@]}"; do
  status=$(curl -sf -o /dev/null -w "%{http_code}" "$page" 2>/dev/null || echo "000")
  if [ "$status" = "200" ]; then
    log_pass "Page loads: $page → $status"
    add_assertion "Page loads: $(echo "$page" | sed "s|$FRONTEND_URL||")" "true" "200" "$status"
  else
    log_fail "Page fails: $page → $status"
    add_assertion "Page loads: $(echo "$page" | sed "s|$FRONTEND_URL||")" "false" "200" "$status"
  fi
done

# ============================================================
# Check theme CSS exists (dark mode support)
# ============================================================
log_info "--- Verifying theme support ---"

# Fetch frontend HTML and check for theme-related elements
HTML=$(curl -sf "$FRONTEND_URL" 2>/dev/null || echo "")
if [ -n "$HTML" ]; then
  # Check for dark/light mode indicators
  if echo "$HTML" | grep -qi "theme\|dark\|light\|color-scheme"; then
    log_pass "Theme support: CSS theme references found"
    add_assertion "Theme CSS present" "true" "theme references" "found"
  else
    log_warn "Theme support: No CSS theme references found in HTML"
    add_assertion "Theme CSS present" "false" "theme references" "not found"
  fi

  # Check Vite/React assets load
  if echo "$HTML" | grep -q "src=.*\.js\|src=.*\.tsx"; then
    log_pass "Frontend assets: JS/React bundles referenced"
    add_assertion "Frontend JS assets" "true" "JS references" "found"
  else
    log_warn "Frontend assets: No JS references found"
    add_assertion "Frontend JS assets" "false" "JS references" "not found"
  fi
fi

# ============================================================
# Check viewport meta for responsive
# ============================================================
if echo "$HTML" | grep -q "viewport"; then
  log_pass "Responsive: viewport meta tag found"
  add_assertion "Viewport meta tag" "true" "present" "found"
fi

# ============================================================
# Generate screenshot command for agents
# ============================================================
log_info "--- Screenshot Instructions (for Playwright agents) ---"
log_info "Screenshots should be saved to: $SCREENSHOTS_DIR/"
log_info "Format: JPEG, quality 60, viewport 1280x720"
log_info "Naming: ${ROUND}-${TEST_ID}-{page}.jpeg"

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
log_info "=== Visual Test Summary ==="
log_info "Test: $TEST_ID"
log_info "Status: $OVERALL_STATUS"
log_info "Assertions: $ASSERTIONS_PASSED passed, $ASSERTIONS_FAILED failed (total $ASSERTION_COUNT)"
log_info "Duration: ${ELAPSED}ms"
log_info "Note: Full visual verification requires Playwright agent"

if [ "$OVERALL_STATUS" = "fail" ]; then
  exit 1
else
  exit 0
fi

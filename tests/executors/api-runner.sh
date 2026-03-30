#!/usr/bin/env bash
# tests/executors/api-runner.sh — Backend API Test Executor
#
# Usage: bash tests/executors/api-runner.sh <test-id> <round>
# Example: bash tests/executors/api-runner.sh core-endpoints 0
#
# Reads: tests/registry/backend-api/<test-id>.yaml
# Writes: tests/results/<round>-<test-id>.json
#
# The runner parses YAML test definitions and executes HTTP requests.
# Since we avoid adding npm dependencies for YAML parsing, we use
# a lightweight line-based YAML reader approach.

set -u  # no -e/-o pipefail: we handle errors via assertions

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# ============================================================
# Arguments
# ============================================================
TEST_ID="${1:?Usage: api-runner.sh <test-id> <round>}"
ROUND="${2:-0}"

TEST_FILE="$REGISTRY_DIR/backend-api/${TEST_ID}.yaml"

if [ ! -f "$TEST_FILE" ]; then
  log_fail "Test definition not found: $TEST_FILE"
  exit 1
fi

log_info "=== API Test Runner ==="
log_info "Test: $TEST_ID (Round $ROUND)"
log_info "Definition: $TEST_FILE"

# ============================================================
# Pre-flight: Backend health + JWT
# ============================================================
if ! ensure_backend; then
  # Backend not running — write env-skip result so VERIFY/regression-tracker
  # doesn't see a missing result file (no_result_file regression pattern).
  # Same pattern as e2e-runner.sh env-skip fix (framework-fix-26-env-detect).
  start_timer
  reset_assertions
  init_progress
  ELAPSED=$(get_elapsed_ms)
  write_result "$ROUND" "$TEST_ID" "skip" "[]" '"env_skip: backend not running"' "$ELAPSED"
  clear_progress "$TEST_ID"
  log_info "Env-skip: backend not available — result written, test skipped"
  exit 0
fi

TOKEN=$(generate_jwt)
log_info "JWT generated (valid 1h)"

start_timer
reset_assertions
init_progress
write_progress "$TEST_ID" "preflight" "Backend health check + JWT generation" "api"

# ============================================================
# Parse test definition (lightweight YAML parsing)
# Extract steps: method + url + expected_status + body
# ============================================================
# We parse the YAML by extracting structured data line by line.
# For complex YAML, agents should use Node.js instead.

parse_steps() {
  local in_steps=false
  local in_step=false
  local current_method=""
  local current_url=""
  local current_body=""
  local current_expected_status=""
  local current_safety=""
  local step_count=0
  # Dynamic ID storage — populated by execute_api_step on successful responses
  CREATED_ISSUE_ID=""
  FIRST_CASE_ID=""

  while IFS= read -r line; do
    # Strip Windows CRLF
    line="${line//$'\r'/}"

    # Detect steps section
    if echo "$line" | grep -q "^steps:"; then
      in_steps=true
      continue
    fi

    # Detect end of steps (next top-level key)
    if $in_steps && echo "$line" | grep -qE "^[a-z]"; then
      in_steps=false
      # Execute last step if pending
      if [ -n "$current_method" ] && [ -n "$current_url" ]; then
        execute_api_step "$current_method" "$current_url" "$current_expected_status" "$current_body" "$current_safety"
        step_count=$((step_count + 1))
        current_method=""
        current_url=""
      fi
      continue
    fi

    if ! $in_steps; then
      continue
    fi

    # New step starts with "  - action:"
    if echo "$line" | grep -q "^  - action:"; then
      # Execute previous step if any
      if [ -n "$current_method" ] && [ -n "$current_url" ]; then
        execute_api_step "$current_method" "$current_url" "$current_expected_status" "$current_body" "$current_safety"
        step_count=$((step_count + 1))
      fi
      current_method=""
      current_url=""
      current_body=""
      current_expected_status="200"
      current_safety=""
      in_step=true
      continue
    fi

    if ! $in_step; then
      continue
    fi

    # Extract method
    if echo "$line" | grep -q "method:"; then
      current_method=$(echo "$line" | sed 's/.*method: *"\{0,1\}\([A-Z]*\)"\{0,1\}/\1/' | tr -d '"' | tr -d ' ')
    fi

    # Extract url (replace placeholders)
    if echo "$line" | grep -q "url:"; then
      current_url=$(echo "$line" | sed 's/.*url: *"\{0,1\}\(.*\)"\{0,1\}/\1/' | tr -d '"' | sed 's/ *$//')
      # Replace standard placeholders
      current_url=$(echo "$current_url" | sed "s|{api_base}|$API_BASE|g" | sed "s|{base_url}|$API_BASE|g" | sed "s|{frontend_url}|$FRONTEND_URL|g")
      # Replace custom placeholders from test definition (e.g., {test_case_id})
      if echo "$current_url" | grep -q '{test_case_id}'; then
        if [ -z "${TEST_CASE_ID:-}" ]; then
          TEST_CASE_ID=$(grep "^test_case_id:" "$TEST_FILE" | head -1 | sed 's/^test_case_id: *"\{0,1\}\([^"]*\)"\{0,1\}.*/\1/' | tr -d '\r ')
        fi
        current_url=$(echo "$current_url" | sed "s|{test_case_id}|${TEST_CASE_ID}|g")
      fi
      # Replace dynamic ID placeholders set by previous steps (e.g., {created_issue_id})
      if echo "$current_url" | grep -q '{created_issue_id}'; then
        current_url=$(echo "$current_url" | sed "s|{created_issue_id}|${CREATED_ISSUE_ID:-}|g")
      fi
      # Replace {first_case_id} — extracted from a prior GET /api/cases response
      if echo "$current_url" | grep -q '{first_case_id}'; then
        if [ -z "${FIRST_CASE_ID:-}" ]; then
          log_warn "{first_case_id} placeholder used but no case ID extracted from prior GET /api/cases"
        fi
        current_url=$(echo "$current_url" | sed "s|{first_case_id}|${FIRST_CASE_ID:-first_case_id}|g")
      fi
    fi

    # Extract body
    if echo "$line" | grep -q "body:"; then
      current_body=$(echo "$line" | sed "s/.*body: *'\(.*\)'/\1/" | sed 's/.*body: *"\(.*\)"/\1/')
    fi

    # Extract expected status
    if echo "$line" | grep -q "expected_status:"; then
      current_expected_status=$(echo "$line" | sed 's/.*expected_status: *\[\{0,1\}\([0-9, ]*\)\]\{0,1\}/\1/' | tr -d '[] "'"'")
    fi

    # Extract safety check
    if echo "$line" | grep -q "safety_check:"; then
      current_safety=$(echo "$line" | sed 's/.*safety_check: *"\(.*\)"/\1/')
    fi

  done < "$TEST_FILE"

  # Execute last step
  if [ -n "$current_method" ] && [ -n "$current_url" ]; then
    execute_api_step "$current_method" "$current_url" "$current_expected_status" "$current_body" "$current_safety"
    step_count=$((step_count + 1))
  fi

  log_info "Executed $step_count API steps"
}

# ============================================================
# Execute a single API step
# ============================================================
execute_api_step() {
  local method="$1"
  local url="$2"
  local expected_statuses="$3"
  local body="$4"
  local safety="$5"

  # Safety gate
  local action_name="$method $(echo "$url" | sed "s|$API_BASE||")"
  if ! is_api_safe "$action_name"; then
    log_skip "BLOCKED by safety gate: $action_name"
    add_assertion "$action_name → safety gate" "true" "BLOCKED" "BLOCKED" "Skipped per safety.yaml"
    return 0
  fi

  log_info "→ $method $url"

  # CONTRACT_MISMATCH guard: catch unresolved placeholders before curl
  if ! validate_no_raw_placeholders "$url" "API URL: $method $url"; then
    return 0  # assertion already recorded; skip curl to avoid opaque 404
  fi

  # Execute request
  http_request "$method" "$url" "$TOKEN" "$body"

  local assertion_name="$method $(echo "$url" | sed "s|$API_BASE||") → HTTP $HTTP_STATUS"

  # Check status code
  local status_ok=false
  for expected in $(echo "$expected_statuses" | tr ',' ' '); do
    expected=$(echo "$expected" | tr -d ' ')
    if [ "$HTTP_STATUS" = "$expected" ]; then
      status_ok=true
      break
    fi
  done

  if $status_ok; then
    log_pass "$assertion_name"
    local body_preview
    body_preview=$(echo "$HTTP_BODY" | head -c 150 | tr '\n' ' ' | tr '"' "'")
    add_assertion "$assertion_name" "true" "$expected_statuses" "$HTTP_STATUS" "$body_preview"
  else
    log_fail "$assertion_name (expected $expected_statuses)"
    local body_preview
    body_preview=$(echo "$HTTP_BODY" | head -c 200 | tr '\n' ' ' | tr '"' "'")
    add_assertion "$assertion_name" "false" "$expected_statuses" "$HTTP_STATUS" "$body_preview"
  fi

  # Quick JSON check — lightweight (no Node.js spawn), just check first char
  if [ -n "$HTTP_BODY" ] && [ "$HTTP_STATUS" != "204" ]; then
    local first_char
    first_char=$(echo "$HTTP_BODY" | head -c 1)
    if [ "$first_char" = "{" ] || [ "$first_char" = "[" ]; then
      add_assertion "$action_name → JSON response" "true" "JSON" "JSON"
    fi
  fi

  # Extract dynamic IDs from successful POST responses for subsequent step substitution
  # Supports {created_issue_id} placeholder in YAML test definitions
  if [ "$method" = "POST" ] && $status_ok; then
    # POST /api/issues (create) → extract issue ID
    if echo "$url" | grep -qE "/api/issues$"; then
      local extracted_id
      extracted_id=$(echo "$HTTP_BODY" | NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "try{const d=JSON.parse(require('fs').readFileSync(0,'utf8'));console.log(d.id||d.issueId||'')}catch(e){console.log('')}" 2>/dev/null || echo "")
      if [ -n "$extracted_id" ]; then
        CREATED_ISSUE_ID="$extracted_id"
        log_info "Stored created_issue_id: $CREATED_ISSUE_ID"
      fi
    fi
  fi

  # Extract first_case_id from successful GET /api/cases responses
  # Supports {first_case_id} placeholder in YAML test definitions
  if [ "$method" = "GET" ] && $status_ok; then
    if echo "$url" | grep -qE "/api/cases(\?|$)"; then
      if [ -z "${FIRST_CASE_ID:-}" ]; then
        local case_id
        case_id=$(echo "$HTTP_BODY" | NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
          try {
            const d = JSON.parse(require('fs').readFileSync(0, 'utf8'));
            const cases = d.cases || d.data || (Array.isArray(d) ? d : []);
            if (cases.length > 0) {
              console.log(cases[0].caseNumber || cases[0].id || cases[0].caseId || '');
            } else { console.log(''); }
          } catch(e) { console.log(''); }
        " 2>/dev/null || echo "")
        if [ -n "$case_id" ]; then
          FIRST_CASE_ID="$case_id"
          log_info "Stored first_case_id: $FIRST_CASE_ID"
        fi
      fi
    fi
  fi
}

# ============================================================
# Handle extract_id and variable substitution for CRUD tests
# ============================================================
# For CRUD tests that need dynamic IDs (like issues-crud),
# we provide a specialized execution mode

execute_crud_test() {
  log_info "Executing CRUD test: $TEST_ID"

  # Check if this is a CRUD test (has extract_id steps)
  if grep -q "extract_id" "$TEST_FILE"; then
    execute_crud_flow
  else
    parse_steps
  fi
}

execute_crud_flow() {
  local created_id=""

  # Step 1: List (GET)
  log_info "--- CRUD Step 1: List ---"
  http_request "GET" "$API_BASE/api/issues" "$TOKEN"
  if [ "$HTTP_STATUS" = "200" ]; then
    log_pass "GET /api/issues → 200"
    add_assertion "GET /api/issues → 200" "true" "200" "$HTTP_STATUS"
    # Verify it returns valid JSON
    local is_json
    is_json=$(echo "$HTTP_BODY" | NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "try{JSON.parse(require('fs').readFileSync(0,'utf8'));console.log('true')}catch(e){console.log('false')}" 2>/dev/null || echo "false")
    add_assertion "GET /api/issues → valid JSON" "$is_json" "true" "$is_json"
  else
    log_fail "GET /api/issues → $HTTP_STATUS"
    add_assertion "GET /api/issues → 200" "false" "200" "$HTTP_STATUS"
  fi

  # Step 2: Create (POST)
  log_info "--- CRUD Step 2: Create ---"
  local create_body='{"title":"TEST-AUTO: API Runner Test Issue","type":"bug","priority":"P2","description":"Auto-created by api-runner.sh, will be deleted in teardown"}'
  http_request "POST" "$API_BASE/api/issues" "$TOKEN" "$create_body"
  if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "201" ]; then
    log_pass "POST /api/issues → $HTTP_STATUS"
    add_assertion "POST /api/issues → create" "true" "200|201" "$HTTP_STATUS"
    # Extract ID
    created_id=$(echo "$HTTP_BODY" | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8'));console.log(d.id||d.issueId||'')" 2>/dev/null || echo "")
    if [ -n "$created_id" ]; then
      log_info "Created issue: $created_id"
    else
      log_warn "Could not extract issue ID from response"
    fi
  else
    log_fail "POST /api/issues → $HTTP_STATUS"
    add_assertion "POST /api/issues → create" "false" "200|201" "$HTTP_STATUS" "$HTTP_BODY"
  fi

  # Step 3: Read (GET by ID)
  if [ -n "$created_id" ]; then
    log_info "--- CRUD Step 3: Read ---"
    http_request "GET" "$API_BASE/api/issues/$created_id" "$TOKEN"
    if [ "$HTTP_STATUS" = "200" ]; then
      log_pass "GET /api/issues/$created_id → 200"
      add_assertion "GET /api/issues/:id → read" "true" "200" "$HTTP_STATUS"
      # Verify title matches
      local title
      title=$(echo "$HTTP_BODY" | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8'));console.log(d.title||'')" 2>/dev/null || echo "")
      if echo "$title" | grep -q "TEST-AUTO"; then
        add_assertion "GET /api/issues/:id → title match" "true" "contains TEST-AUTO" "$title"
      else
        add_assertion "GET /api/issues/:id → title match" "false" "contains TEST-AUTO" "$title"
      fi
    else
      log_fail "GET /api/issues/$created_id → $HTTP_STATUS"
      add_assertion "GET /api/issues/:id → read" "false" "200" "$HTTP_STATUS"
    fi

    # Step 4: Update (PUT)
    log_info "--- CRUD Step 4: Update ---"
    local update_body='{"title":"TEST-AUTO: Updated by API Runner","priority":"P1"}'
    http_request "PUT" "$API_BASE/api/issues/$created_id" "$TOKEN" "$update_body"
    if [ "$HTTP_STATUS" = "200" ]; then
      log_pass "PUT /api/issues/$created_id → 200"
      add_assertion "PUT /api/issues/:id → update" "true" "200" "$HTTP_STATUS"
    else
      log_fail "PUT /api/issues/$created_id → $HTTP_STATUS"
      add_assertion "PUT /api/issues/:id → update" "false" "200" "$HTTP_STATUS" "$HTTP_BODY"
    fi

    # Step 5: Delete (teardown)
    log_info "--- CRUD Step 5: Delete (teardown) ---"
    http_request "DELETE" "$API_BASE/api/issues/$created_id" "$TOKEN"
    if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "204" ]; then
      log_pass "DELETE /api/issues/$created_id → $HTTP_STATUS"
      add_assertion "DELETE /api/issues/:id → teardown" "true" "200|204" "$HTTP_STATUS"
    else
      log_fail "DELETE /api/issues/$created_id → $HTTP_STATUS"
      add_assertion "DELETE /api/issues/:id → teardown" "false" "200|204" "$HTTP_STATUS"
    fi

    # Step 6: Verify deleted
    log_info "--- CRUD Step 6: Verify deleted ---"
    http_request "GET" "$API_BASE/api/issues/$created_id" "$TOKEN"
    if [ "$HTTP_STATUS" = "404" ]; then
      log_pass "GET /api/issues/$created_id → 404 (deleted)"
      add_assertion "GET /api/issues/:id → verify deleted" "true" "404" "$HTTP_STATUS"
    else
      log_warn "GET /api/issues/$created_id → $HTTP_STATUS (expected 404)"
      add_assertion "GET /api/issues/:id → verify deleted" "false" "404" "$HTTP_STATUS" "Issue may not be fully deleted"
    fi
  fi
}

# ============================================================
# Main Execution
# ============================================================
log_info "Starting test execution..."
write_progress "$TEST_ID" "executing" "Running API test steps" "api"

# Determine execution mode
if grep -q "extract_id\|crud" "$TEST_FILE" 2>/dev/null; then
  execute_crud_test
else
  parse_steps
fi

# Finalize
finalize_assertions
ELAPSED=$(get_elapsed_ms)

# Determine overall status
OVERALL_STATUS="pass"
if [ "$ASSERTIONS_FAILED" -gt 0 ]; then
  OVERALL_STATUS="fail"
fi

# Write result
ERROR_VAL="null"
if [ "$OVERALL_STATUS" = "fail" ]; then
  ERROR_VAL="\"$ASSERTIONS_FAILED of $ASSERTION_COUNT assertions failed\""
fi

write_result "$ROUND" "$TEST_ID" "$OVERALL_STATUS" "$ASSERTIONS_JSON" "$ERROR_VAL" "$ELAPSED"
clear_progress "$TEST_ID"

# Summary
echo ""
log_info "=== Test Summary ==="
log_info "Test: $TEST_ID"
log_info "Status: $OVERALL_STATUS"
log_info "Assertions: $ASSERTIONS_PASSED passed, $ASSERTIONS_FAILED failed (total $ASSERTION_COUNT)"
log_info "Duration: ${ELAPSED}ms"

# Exit code
if [ "$OVERALL_STATUS" = "fail" ]; then
  exit 1
else
  exit 0
fi

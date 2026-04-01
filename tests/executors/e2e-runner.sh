#!/usr/bin/env bash
# tests/executors/e2e-runner.sh — Workflow E2E Test Executor
#
# Usage: bash tests/executors/e2e-runner.sh <test-id> <round>
# Example: bash tests/executors/e2e-runner.sh full-scenario 0
#
# Reads: tests/registry/workflow-e2e/<test-id>.yaml
# Writes: tests/results/<round>-<test-id>.json
#
# Executes backup → prepare data → run workflow → verify outputs → restore.
# For casework/patrol, uses the Dashboard API (POST /api/case/:id/process etc.)
# For script-based tests, runs bash scripts directly.

# set -u removed: too many unbound variable edge cases in YAML parsing loops

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# ============================================================
# Arguments
# ============================================================
TEST_ID="${1:?Usage: e2e-runner.sh <test-id> [category] <round>}"
# Support both 2-arg (test-id round) and 3-arg (test-id category round) conventions
# verify-rerun.sh passes 3 args: test-id category round
if [ $# -ge 3 ]; then
  ROUND="${3:-0}"
else
  ROUND="${2:-0}"
fi

TEST_FILE="$REGISTRY_DIR/workflow-e2e/${TEST_ID}.yaml"

if [ ! -f "$TEST_FILE" ]; then
  log_fail "Test definition not found: $TEST_FILE"
  exit 1
fi

log_info "=== E2E Test Runner ==="
log_info "Test: $TEST_ID (Round $ROUND)"
log_info "Definition: $TEST_FILE"

# ============================================================
# Pre-flight
# ============================================================
# Auto-detect if backend is needed: skip if all assertions are bash_exit_zero/bash_output
# (pure file/script checks don't require a running backend)
NEEDS_BACKEND=true
if grep -q "action:" "$TEST_FILE" && ! grep -q "api_call\|http_request\|curl\|localhost\|API_BASE\|Bearer" "$TEST_FILE"; then
  if ! grep -q "type:" "$TEST_FILE" || grep "type:" "$TEST_FILE" | grep -vq "api_response\|http_status"; then
    if grep "type:" "$TEST_FILE" | grep -q "bash_exit_zero\|bash_output"; then
      if ! grep "type:" "$TEST_FILE" | grep -qv "bash_exit_zero\|bash_output"; then
        NEEDS_BACKEND=false
        log_info "All assertions are bash-type — skipping backend check"
      fi
    fi
  fi
fi
if $NEEDS_BACKEND; then
  if ! ensure_backend; then
    # Backend not running — write env-skip result so VERIFY/regression-tracker
    # doesn't see a missing result file (no_result_file regression pattern).
    # Precedent: frontend_not_running → emit skip result, exit 0.
    start_timer
    reset_assertions
    init_progress
    ELAPSED=$(get_elapsed_ms)
    write_result "$ROUND" "$TEST_ID" "skip" "[]" '"env_skip: backend not running"' "$ELAPSED"
    clear_progress "$TEST_ID"
    log_info "Env-skip: backend not available — result written, test skipped"
    exit 0
  fi
fi

TOKEN=$(generate_jwt)
log_info "JWT generated"

start_timer
reset_assertions
init_progress
write_progress "$TEST_ID" "preflight" "Backend health check + JWT generation"

# ============================================================
# Parse test definition — extract key fields
# ============================================================
CASES_ROOT="$PROJECT_ROOT/cases"
TEST_CASE_ID=""
BACKUP_DIR=""
HAS_SETUP=false
HAS_TEARDOWN=false
TIMEOUT_SECONDS=300
WORKFLOW_TYPE="unknown"

# Read key fields from YAML
while IFS= read -r line; do
  line="${line//$'\r'/}"

  if echo "$line" | grep -q "^test_case_id:"; then
    TEST_CASE_ID=$(echo "$line" | sed 's/test_case_id: *"\{0,1\}\([^"]*\)"\{0,1\}/\1/' | sed 's/ *#.*//' | tr -d ' ')
  fi
  if echo "$line" | grep -q "^setup:"; then
    HAS_SETUP=true
  fi
  if echo "$line" | grep -q "^teardown:"; then
    HAS_TEARDOWN=true
  fi
  if echo "$line" | grep -q "^timeout_seconds:"; then
    TIMEOUT_SECONDS=$(echo "$line" | sed 's/timeout_seconds: *\([0-9]*\)/\1/' | tr -d ' ')
  fi
done < "$TEST_FILE"

# Determine case directory — support data_source field
DATA_SOURCE=$(read_yaml_value "$TEST_FILE" "data_source" 2>/dev/null || echo "")

if [ -n "$DATA_SOURCE" ]; then
  # New data_source mode: use resolve_case_dir()
  CASE_DIR=$(resolve_case_dir "$TEST_FILE")
  # Source synthetic resolve info (profile + seed) for seed recording on failure
  if [ "$DATA_SOURCE" = "synthetic" ] && [ -f /tmp/synthetic-resolve-info.env ]; then
    source /tmp/synthetic-resolve-info.env
  fi
  if [ -n "$CASE_DIR" ]; then
    TEST_CASE_ID=$(basename "$CASE_DIR")
    log_info "Data source: $DATA_SOURCE → $CASE_DIR"
  else
    log_fail "resolve_case_dir() returned empty for data_source=$DATA_SOURCE"
    add_assertion "resolve_case_dir" "false" "valid path" "empty" "data_source=$DATA_SOURCE"
    finalize_assertions
    ELAPSED=$(get_elapsed_ms)
    write_result "$ROUND" "$TEST_ID" "fail" "$ASSERTIONS_JSON" "\"resolve_case_dir failed\"" "$ELAPSED"
    exit 1
  fi
elif [ -n "$TEST_CASE_ID" ]; then
  CASE_DIR="$CASES_ROOT/active/$TEST_CASE_ID"
  log_info "Test case: $TEST_CASE_ID"
  log_info "Case dir: $CASE_DIR"

  if [ ! -d "$CASE_DIR" ]; then
    log_fail "Case directory not found: $CASE_DIR"
    add_assertion "Case directory exists" "false" "exists" "not found" "$CASE_DIR"
    finalize_assertions
    ELAPSED=$(get_elapsed_ms)
    write_result "$ROUND" "$TEST_ID" "fail" "$ASSERTIONS_JSON" "\"Case directory not found: $CASE_DIR\"" "$ELAPSED"
    exit 1
  fi
else
  log_info "No specific test_case_id — using general E2E mode"
fi

# ============================================================
# Setup Phase — Backup
# ============================================================

# Define restore function before trap registration
restore_e2e_backup() {
  if [ -n "${BACKUP_DIR:-}" ] && [ -d "${BACKUP_DIR:-}" ]; then
    log_info "--- Teardown: Restoring backup ---"
    # Restore backed up files
    for item in case-summary.md casehealth-meta.json timing.json; do
      if [ -f "$BACKUP_DIR/$item" ]; then
        cp "$BACKUP_DIR/$item" "$CASE_DIR/$item" 2>/dev/null || true
      fi
    done
    # Restore directories
    for dir_item in todo context; do
      if [ -d "$BACKUP_DIR/$dir_item" ]; then
        rm -rf "$CASE_DIR/$dir_item" 2>/dev/null || true
        cp -r "$BACKUP_DIR/$dir_item" "$CASE_DIR/$dir_item" 2>/dev/null || true
      fi
    done
    rm -rf "$BACKUP_DIR"
    log_info "Backup restored and cleaned up"
  fi
  # Clean up old synthetic directories
  cleanup_synthetic 2>/dev/null || true
}

if $HAS_SETUP && [ -n "$TEST_CASE_ID" ]; then
  log_info "--- Setup: Backup ---"
  BACKUP_DIR="/tmp/e2e-backup-${TEST_ID}-$(date +%s)"
  mkdir -p "$BACKUP_DIR"

  # Backup key files
  for item in case-summary.md casehealth-meta.json timing.json todo context; do
    if [ -e "$CASE_DIR/$item" ]; then
      cp -r "$CASE_DIR/$item" "$BACKUP_DIR/" 2>/dev/null || true
    fi
  done

  log_info "Backup created at: $BACKUP_DIR"
  add_assertion "Setup: backup created" "true" "backup exists" "created at $BACKUP_DIR"

  # Register cleanup trap
  trap 'restore_e2e_backup' EXIT

  # ---- Execute setup actions (modify_meta, corrupt_file, delete_dir) ----
  write_progress "$TEST_ID" "setup_actions" "Executing setup actions from YAML" "setup"
  local_in_setup=false
  while IFS= read -r sline; do
    sline="${sline//$'\r'/}"
    if echo "$sline" | grep -q "^setup:"; then
      local_in_setup=true
      continue
    fi
    if $local_in_setup && echo "$sline" | grep -qE "^[a-z]"; then
      break
    fi
    if ! $local_in_setup; then continue; fi

    # modify_meta: modify a JSON field in a file
    if echo "$sline" | grep -q "action: .modify_meta"; then
      mm_file="" ; mm_field="" ; mm_value=""
      while IFS= read -r mline; do
        mline="${mline//$'\r'/}"
        if echo "$mline" | grep -q "file:"; then
          mm_file=$(echo "$mline" | sed 's/.*file: *"\(.*\)"/\1/' | sed "s|{cases_root}|$CASES_ROOT|g" | sed "s|{test_case_id}|$TEST_CASE_ID|g" | sed "s|{live_case_id}|$TEST_CASE_ID|g")
        fi
        if echo "$mline" | grep -q "field:"; then
          mm_field=$(echo "$mline" | sed 's/.*field: *"\(.*\)"/\1/')
        fi
        if echo "$mline" | grep -q "value:"; then
          mm_value=$(echo "$mline" | sed 's/.*value: *"\(.*\)"/\1/')
          break
        fi
      done
      # CONTRACT_MISMATCH guard: catch unresolved placeholders in setup paths
      validate_no_raw_placeholders "$mm_file" "setup:modify_meta file" || true
      if [ -n "$mm_file" ] && [ -n "$mm_field" ] && [ -f "$mm_file" ]; then
        log_info "Setup: modify_meta $mm_field=$mm_value in $(basename "$mm_file")"
        # Convert POSIX path to Windows for Node.js (Git Bash path not recognized by Node)
        mm_file_win=$(cygpath -w "$mm_file" 2>/dev/null || echo "$mm_file")
        MM_FILE_WIN="$mm_file_win" MM_FIELD="$mm_field" MM_VALUE="$mm_value" NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
          const fs=require('fs');
          const fp=process.env.MM_FILE_WIN;
          const d=JSON.parse(fs.readFileSync(fp,'utf8'));
          const keys=process.env.MM_FIELD.split('.');
          let obj=d;
          for(let i=0;i<keys.length-1;i++){
            if(!obj[keys[i]])obj[keys[i]]={};
            obj=obj[keys[i]];
          }
          let val=process.env.MM_VALUE;
          if(val==='true')val=true;
          else if(val==='false')val=false;
          else if(val==='null')val=null;
          else if(!isNaN(val)&&val!=='')val=Number(val);
          obj[keys[keys.length-1]]=val;
          fs.writeFileSync(fp,JSON.stringify(d,null,2)+'\n');
        " 2>/dev/null && log_pass "modify_meta done" || log_warn "modify_meta failed"
      fi
    fi

    # corrupt_file: overwrite file with invalid content
    if echo "$sline" | grep -q "action: .corrupt_file"; then
      cf_file="" ; cf_content=""
      while IFS= read -r cline; do
        cline="${cline//$'\r'/}"
        if echo "$cline" | grep -q "file:"; then
          cf_file=$(echo "$cline" | sed 's/.*file: *"\(.*\)"/\1/' | sed "s|{cases_root}|$CASES_ROOT|g" | sed "s|{test_case_id}|$TEST_CASE_ID|g" | sed "s|{live_case_id}|$TEST_CASE_ID|g")
        fi
        if echo "$cline" | grep -q "content:"; then
          cf_content=$(echo "$cline" | sed 's/.*content: *"\(.*\)"/\1/')
          break
        fi
      done
      # CONTRACT_MISMATCH guard: catch unresolved placeholders in setup paths
      validate_no_raw_placeholders "${cf_file:-}" "setup:corrupt_file file" || true
      if [ -n "$cf_file" ]; then
        echo "$cf_content" > "$cf_file" 2>/dev/null && log_pass "corrupt_file done" || log_warn "corrupt_file failed"
      fi
    fi

    # delete_dir: remove a directory
    if echo "$sline" | grep -q "action: .delete_dir"; then
      dd_target=""
      while IFS= read -r dline; do
        dline="${dline//$'\r'/}"
        if echo "$dline" | grep -q "target:"; then
          dd_target=$(echo "$dline" | sed 's/.*target: *"\(.*\)"/\1/' | sed "s|{cases_root}|$CASES_ROOT|g" | sed "s|{test_case_id}|$TEST_CASE_ID|g" | sed "s|{live_case_id}|$TEST_CASE_ID|g")
          break
        fi
      done
      # CONTRACT_MISMATCH guard: catch unresolved placeholders in setup paths
      validate_no_raw_placeholders "${dd_target:-}" "setup:delete_dir target" || true
      if [ -n "$dd_target" ] && [ -e "$dd_target" ]; then
        log_info "Setup: delete_dir $(basename "$dd_target")"
        rm -rf "$dd_target" 2>/dev/null && log_pass "delete_dir done" || log_warn "delete_dir failed"
      fi
    fi
  done < "$TEST_FILE"
fi

# ============================================================
# Determine test type and execute
# ============================================================
# Read the steps section to determine what kind of workflow to run
WORKFLOW_TYPE="unknown"

while IFS= read -r line; do
  line="${line//$'\r'/}"
  if echo "$line" | grep -q "run_casework"; then
    WORKFLOW_TYPE="casework"
    break
  fi
  if echo "$line" | grep -q "run_skill"; then
    # run_skill maps to casework — skill execution goes through the same API
    WORKFLOW_TYPE="casework"
    break
  fi
  if echo "$line" | grep -q "modify_meta_and_run"; then
    # modify_meta_and_run maps to casework — setup actions handled separately
    WORKFLOW_TYPE="casework"
    break
  fi
  if echo "$line" | grep -q "run_single_step"; then
    WORKFLOW_TYPE="single_step"
    # Extract step name from params
    STEP_NAME=$(grep -A5 "run_single_step" "$TEST_FILE" | grep "step_name" | sed 's/.*step_name: *"\(.*\)".*/\1/' | head -1)
    break
  fi
  if echo "$line" | grep -q "run_patrol"; then
    WORKFLOW_TYPE="patrol"
    break
  fi
  if echo "$line" | grep -q "run_script"; then
    WORKFLOW_TYPE="script"
    break
  fi
  if echo "$line" | grep -q "verify_file"; then
    # If we only see verify_file actions, it's a file-check test
    if [ "$WORKFLOW_TYPE" = "unknown" ]; then
      WORKFLOW_TYPE="file-check"
    fi
  fi
  if echo "$line" | grep -q "bash_command"; then
    # bash_command steps: execute bash and capture output for assertion evaluation
    if [ "$WORKFLOW_TYPE" = "unknown" ]; then
      WORKFLOW_TYPE="bash-check"
    fi
  fi
  if echo "$line" | grep -q "run_api"; then
    WORKFLOW_TYPE="api"
    break
  fi
done < "$TEST_FILE"

log_info "Workflow type: $WORKFLOW_TYPE"

# Function definitions follow — actual execution is at "Main Execution" section below

# ============================================================
# Casework Workflow Test
# ============================================================
execute_casework_test() {
  log_info "--- Executing casework workflow ---"
  write_progress "$TEST_ID" "casework_start" "POST /api/case/$TEST_CASE_ID/process" "casework"

  if [ -z "$TEST_CASE_ID" ]; then
    log_fail "casework test requires test_case_id"
    add_assertion "casework requires case ID" "false" "has case ID" "missing"
    return 1
  fi

  # Pre-clean: remove stale timing.json from previous runs to prevent premature completion detection
  if [ -n "$CASE_DIR" ] && [ -f "$CASE_DIR/timing.json" ]; then
    log_info "Removing stale timing.json from previous run"
    rm -f "$CASE_DIR/timing.json"
  fi

  # Call Dashboard API to process case
  log_info "POST /api/case/$TEST_CASE_ID/process"
  http_request "POST" "$API_BASE/api/case/$TEST_CASE_ID/process" "$TOKEN" '{"steps":"all"}'

  if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "202" ]; then
    log_pass "Process started: HTTP $HTTP_STATUS"
    add_assertion "POST /api/case/:id/process" "true" "200|202" "$HTTP_STATUS"
  else
    log_fail "Process failed: HTTP $HTTP_STATUS"
    add_assertion "POST /api/case/:id/process" "false" "200|202" "$HTTP_STATUS" "$HTTP_BODY"
    return 1
  fi

  # If async (202), poll until completion
  if [ "$HTTP_STATUS" = "202" ]; then
    log_info "Async operation — polling for completion (timeout: ${TIMEOUT_SECONDS}s)..."
    write_progress "$TEST_ID" "polling" "Waiting for casework completion (timeout: ${TIMEOUT_SECONDS}s)" "casework"
    poll_for_completion "$TEST_CASE_ID" "$TIMEOUT_SECONDS" 10 "$CASE_DIR" "$TEST_ID"
    local poll_result=$?
    if [ $poll_result -ne 0 ]; then
      log_warn "Casework did not complete within ${TIMEOUT_SECONDS}s — verifying partial outputs"
      add_assertion "Casework completed within timeout" "false" "completed" "timeout after ${TIMEOUT_SECONDS}s"
    else
      log_pass "Casework completed"
      add_assertion "Casework completed within timeout" "true" "completed" "completed"
    fi
  fi

  log_info "Verifying expected outputs..."
  write_progress "$TEST_ID" "verifying" "Checking assertions against expected outputs" "$WORKFLOW_TYPE"
  verify_case_outputs "$TEST_CASE_ID"
}

# ============================================================
# Single Step Workflow Test
# ============================================================
# Calls POST /api/case/:id/step/{step_name} instead of full casework.
# Much faster — only runs one skill (e.g. inspection-writer, compliance-check).
# Step API also returns 202 for async, so we poll for completion.
execute_single_step_test() {
  log_info "--- Executing single-step workflow: $STEP_NAME ---"
  write_progress "$TEST_ID" "single_step_start" "POST /api/case/$TEST_CASE_ID/step/$STEP_NAME" "single_step"

  if [ -z "$TEST_CASE_ID" ]; then
    log_fail "single_step test requires test_case_id"
    add_assertion "single_step requires case ID" "false" "has case ID" "missing"
    return 1
  fi

  if [ -z "$STEP_NAME" ]; then
    log_fail "single_step test requires step_name in params"
    add_assertion "single_step requires step_name" "false" "has step_name" "missing"
    return 1
  fi

  # Pre-clean: remove stale timing.json
  if [ -n "$CASE_DIR" ] && [ -f "$CASE_DIR/timing.json" ]; then
    log_info "Removing stale timing.json from previous run"
    rm -f "$CASE_DIR/timing.json"
  fi

  # Call step API
  log_info "POST /api/case/$TEST_CASE_ID/step/$STEP_NAME"
  http_request "POST" "$API_BASE/api/case/$TEST_CASE_ID/step/$STEP_NAME" "$TOKEN" '{}'

  if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "202" ]; then
    log_pass "Step started: HTTP $HTTP_STATUS"
    add_assertion "POST /api/case/:id/step/$STEP_NAME" "true" "200|202" "$HTTP_STATUS"
  else
    log_fail "Step failed: HTTP $HTTP_STATUS — $HTTP_BODY"
    add_assertion "POST /api/case/:id/step/$STEP_NAME" "false" "200|202" "$HTTP_STATUS" "$HTTP_BODY"
    return 1
  fi

  # If async (202), poll until completion
  if [ "$HTTP_STATUS" = "202" ]; then
    log_info "Async step — polling for completion (timeout: ${TIMEOUT_SECONDS}s)..."
    write_progress "$TEST_ID" "polling" "Waiting for step completion (timeout: ${TIMEOUT_SECONDS}s)" "single_step"
    poll_for_completion "$TEST_CASE_ID" "$TIMEOUT_SECONDS" 10 "$CASE_DIR" "$TEST_ID"
    local poll_result=$?
    if [ $poll_result -ne 0 ]; then
      log_warn "Step did not complete within ${TIMEOUT_SECONDS}s — verifying partial outputs"
      add_assertion "Step completed within timeout" "false" "completed" "timeout after ${TIMEOUT_SECONDS}s"
    else
      log_pass "Step completed"
      add_assertion "Step completed within timeout" "true" "completed" "completed"
    fi
  fi

  log_info "Verifying expected outputs..."
  write_progress "$TEST_ID" "verifying" "Checking assertions against expected outputs" "$WORKFLOW_TYPE"
  verify_case_outputs "$TEST_CASE_ID"
}

# ============================================================
# Patrol Workflow Test
# ============================================================
execute_patrol_test() {
  log_info "--- Executing patrol workflow ---"

  http_request "POST" "$API_BASE/api/patrol" "$TOKEN" '{}'

  if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "202" ]; then
    log_pass "Patrol started: HTTP $HTTP_STATUS"
    add_assertion "POST /api/patrol" "true" "200|202" "$HTTP_STATUS"
  else
    log_fail "Patrol failed: HTTP $HTTP_STATUS"
    add_assertion "POST /api/patrol" "false" "200|202" "$HTTP_STATUS" "$HTTP_BODY"
    return 1
  fi

  # Check patrol status
  http_request "GET" "$API_BASE/api/patrol/status" "$TOKEN"
  if [ "$HTTP_STATUS" = "200" ]; then
    log_pass "Patrol status: HTTP 200"
    add_assertion "GET /api/patrol/status" "true" "200" "$HTTP_STATUS"
  else
    log_warn "Patrol status: HTTP $HTTP_STATUS"
    add_assertion "GET /api/patrol/status" "false" "200" "$HTTP_STATUS"
  fi
}

# ============================================================
# Script-based Test (e.g., generate-todo.sh)
# ============================================================
execute_script_test() {
  log_info "--- Executing script-based test ---"

  # Parse script command from YAML
  local script_cmd=""
  local in_steps=false

  while IFS= read -r line; do
    line="${line//$'\r'/}"
    if echo "$line" | grep -q "^steps:"; then
      in_steps=true
      continue
    fi
    if $in_steps && echo "$line" | grep -q "command:"; then
      script_cmd=$(echo "$line" | sed 's/.*command: *"\{0,1\}\(.*\)"\{0,1\}/\1/' | tr -d '"')
      break
    fi
  done < "$TEST_FILE"

  if [ -z "$script_cmd" ]; then
    log_fail "No script command found in test definition"
    add_assertion "Script command present" "false" "has command" "missing"
    return 1
  fi

  # Replace variables
  script_cmd=$(echo "$script_cmd" | sed "s|{cases_root}|$CASES_ROOT|g" | sed "s|{test_case_id}|$TEST_CASE_ID|g" | sed "s|{live_case_id}|$TEST_CASE_ID|g" | sed "s|{project_root}|$PROJECT_ROOT|g" | sed "s|{case_dir}|${CASE_DIR:-}|g")

  # CONTRACT_MISMATCH guard: catch unresolved placeholders in script command
  if ! validate_no_raw_placeholders "$script_cmd" "script command"; then
    add_assertion "Script command placeholders resolved" "false" "all resolved" "$script_cmd"
    return 1
  fi

  log_info "Running: $script_cmd"
  local output
  output=$(eval "$script_cmd" 2>&1) || true
  local exit_code=$?

  if [ $exit_code -eq 0 ]; then
    log_pass "Script exited 0"
    add_assertion "Script exit code" "true" "0" "$exit_code"
  else
    log_fail "Script exited $exit_code"
    add_assertion "Script exit code" "false" "0" "$exit_code" "$(echo "$output" | tail -5 | tr '\n' ' ')"
  fi

  # Parse expected output patterns from YAML
  parse_output_assertions "$output"
}

# ============================================================
# Standalone Bash Assertions (bash_exit_zero / bash_output)
# For tests that don't need a running backend
# Single-pass state machine — avoids nested-read fd collision
# ============================================================
_exec_bash_exit_zero_assertion() {
  local target="$1"
  local label="$2"
  # Unescape YAML double-quoted string escapes before eval:
  #   \\  → \  (must be first, to avoid double-processing \"→")
  #   \"  → "
  local cmd
  cmd=$(echo "$target" | sed 's/\\\\/\\/g' | sed 's/\\"/"/g')
  # Fallback: python3 → python if python3 not available (Windows Git Bash)
  if ! command -v python3 >/dev/null 2>&1 && command -v python >/dev/null 2>&1; then
    cmd=$(echo "$cmd" | sed 's/\bpython3\b/python/g')
  fi
  if eval "$cmd" >/dev/null 2>&1; then
    log_pass "$label"
    add_assertion "$label" "true" "exit 0" "exit 0"
  else
    local actual_out
    actual_out=$(eval "$cmd" 2>&1 | tail -3 | tr '\n' ' ')
    log_fail "$label"
    add_assertion "$label" "false" "exit 0" "non-zero exit" "$actual_out"
  fi
}

_exec_bash_output_contains_assertion() {
  local target="$1"
  local expected="$2"
  local label="$3"
  # Unescape YAML double-quoted string escapes
  local cmd
  cmd=$(echo "$target" | sed 's/\\\\/\\/g' | sed 's/\\"/"/g')
  local expected_str
  expected_str=$(echo "$expected" | sed 's/\\\\/\\/g' | sed 's/\\"/"/g')
  # Fallback: python3 → python if python3 not available (Windows Git Bash)
  if ! command -v python3 >/dev/null 2>&1 && command -v python >/dev/null 2>&1; then
    cmd=$(echo "$cmd" | sed 's/\bpython3\b/python/g')
  fi
  local actual_out
  actual_out=$(eval "$cmd" 2>&1)
  if echo "$actual_out" | grep -qF "$expected_str"; then
    log_pass "$label"
    add_assertion "$label" "true" "contains '$expected_str'" "contains '$expected_str'"
  else
    local tail_out
    tail_out=$(echo "$actual_out" | tail -3 | tr '\n' ' ')
    log_fail "$label"
    add_assertion "$label" "false" "contains '$expected_str'" "not found in output" "$tail_out"
  fi
}

_exec_bash_output_not_contains_assertion() {
  local target="$1"
  local expected="$2"
  local label="$3"
  # Unescape YAML double-quoted string escapes
  local cmd
  cmd=$(echo "$target" | sed 's/\\\\/\\/g' | sed 's/\\"/"/g')
  local expected_str
  expected_str=$(echo "$expected" | sed 's/\\\\/\\/g' | sed 's/\\"/"/g')
  # Fallback: python3 → python if python3 not available (Windows Git Bash)
  if ! command -v python3 >/dev/null 2>&1 && command -v python >/dev/null 2>&1; then
    cmd=$(echo "$cmd" | sed 's/\bpython3\b/python/g')
  fi
  local actual_out
  actual_out=$(eval "$cmd" 2>&1)
  if echo "$actual_out" | grep -qF "$expected_str"; then
    local matched_lines
    matched_lines=$(echo "$actual_out" | grep -F "$expected_str" | tail -3 | tr '\n' ' ')
    log_fail "$label"
    add_assertion "$label" "false" "not contains '$expected_str'" "found in output" "$matched_lines"
  else
    log_pass "$label"
    add_assertion "$label" "true" "not contains '$expected_str'" "not contains '$expected_str'"
  fi
}

run_standalone_bash_assertions() {
  local in_assertions=false
  local current_type=""
  local current_target=""
  local current_expected=""
  local current_desc=""

  # Helper: flush pending assertion
  _flush_bash_assertion() {
    if [ -z "$current_target" ]; then return; fi
    case "$current_type" in
      bash_exit_zero)
        _exec_bash_exit_zero_assertion "$current_target" "${current_desc:-$current_target}"
        ;;
      bash_output_contains)
        _exec_bash_output_contains_assertion "$current_target" "$current_expected" "${current_desc:-$current_target}"
        ;;
      bash_output_not_contains)
        _exec_bash_output_not_contains_assertion "$current_target" "$current_expected" "${current_desc:-$current_target}"
        ;;
    esac
  }

  while IFS= read -r line; do
    line="${line//$'\r'/}"

    # Enter assertions section
    if echo "$line" | grep -q "^assertions:"; then
      in_assertions=true
      continue
    fi
    # Exit on top-level key (no indent, not blank)
    if $in_assertions && echo "$line" | grep -qE "^[a-zA-Z]"; then
      break
    fi
    if ! $in_assertions; then continue; fi

    # New assertion: any "  - type:" line triggers flush+reset; only bash_* types start collection
    if echo "$line" | grep -q "  - type:"; then
      # Flush previous bash assertion (no-op if current_target is empty)
      _flush_bash_assertion
      # Only set current_type for bash_* assertion types; others → reset to "" to stop field collection
      if echo "$line" | grep -q "bash_exit_zero\|bash_output_contains\|bash_output_not_contains"; then
        current_type=$(echo "$line" | sed 's/.*type: *"\{0,1\}//' | sed 's/"\{0,1\} *$//' | sed 's/ *#.*//' | tr -d ' ')
      else
        current_type=""
      fi
      current_target=""
      current_expected=""
      current_desc=""
      continue
    fi

    # Only collect fields for bash_* assertions
    case "$current_type" in
      bash_exit_zero|bash_output_contains|bash_output_not_contains) ;;
      *) continue ;;
    esac

    if echo "$line" | grep -q "^ *target:"; then
      current_target=$(echo "$line" | sed 's/.*target: *//' | sed 's/^"//' | sed 's/"$//' | sed 's/ *#.*//')
    fi
    if echo "$line" | grep -q "^ *expected:"; then
      current_expected=$(echo "$line" | sed 's/.*expected: *//' | sed 's/^"//' | sed 's/"$//' | sed "s/^'//" | sed "s/'$//" | sed 's/ *#.*//')
    fi
    if echo "$line" | grep -q "^ *description:"; then
      current_desc=$(echo "$line" | sed 's/.*description: *//' | sed "s/^'//" | sed "s/'$//" | sed 's/^"//' | sed 's/"$//')
    fi
  done < "$TEST_FILE"

  # Flush last assertion
  _flush_bash_assertion
}

# ============================================================
# File Verification (check existing outputs without running workflow)
# ============================================================
# ============================================================
# Bash-Check Workflow: execute bash_command steps + evaluate text_gt/text_equals/text_contains assertions
# ============================================================
execute_bash_check_test() {
  log_info "--- Executing bash-check workflow ---"
  write_progress "$TEST_ID" "bash_check" "Running bash_command steps" "bash-check"

  # === Phase 1: Execute bash_command steps and capture outputs ===
  local step_index=0
  local in_steps=false
  local in_params=false
  local current_command=""

  # Declare associative-like storage using indexed arrays (bash 3 compat)
  local step_outputs=""

  while IFS= read -r line; do
    line="${line//$'\r'/}"

    if echo "$line" | grep -q "^steps:"; then
      in_steps=true
      continue
    fi
    # Exit steps on next top-level key
    if $in_steps && echo "$line" | grep -qE "^[a-zA-Z]"; then
      in_steps=false
      continue
    fi
    if ! $in_steps; then continue; fi

    # New step entry
    if echo "$line" | grep -q "  - action:.*bash_command"; then
      # Execute previous command if pending
      if [ -n "$current_command" ]; then
        step_index=$((step_index + 1))
        local step_result
        # YAML unescape: \" → " and \\ → \ (order: \" first to avoid double-processing)
        local cmd_unescaped
        cmd_unescaped=$(printf '%s' "$current_command" | sed 's/\\"/"/g' | sed 's/\\\\/\\/g')
        # Write to temp file and execute via bash with timeout (avoids eval + prevents hang)
        local tmpfile
        tmpfile=$(mktemp)
        printf '%s\n' "$cmd_unescaped" > "$tmpfile"
        local step_timeout=${TIMEOUT_SECONDS:-30}
        step_result=$(timeout "$step_timeout" bash "$tmpfile" 2>&1) || true
        local exit_code=$?
        rm -f "$tmpfile"
        if [ "$exit_code" -eq 124 ]; then
          step_result="TIMEOUT after ${step_timeout}s"
          log_warn "Step ${step_index} timed out after ${step_timeout}s"
        fi
        step_result=$(echo "$step_result" | tr -d '\r' | sed '/^$/d')
        log_info "Step ${step_index} output: ${step_result}"
        eval "STEP_OUTPUT_${step_index}=\"\$step_result\""
        current_command=""
      fi
      in_params=false
      continue
    fi

    # Enter params section
    if echo "$line" | grep -q "params:"; then
      in_params=true
      continue
    fi

    # Read command from params (supports single-line and multi-line YAML block scalar |)
    if $in_params && echo "$line" | grep -q "command:"; then
      local cmd_value
      cmd_value=$(echo "$line" | sed 's/.*command: *//' | sed 's/^"//' | sed 's/"$//')
      if [ "$cmd_value" = "|" ] || [ "$cmd_value" = "|-" ]; then
        # Multi-line YAML block scalar: read subsequent indented lines
        current_command=""
        local block_indent=""
        while IFS= read -r bline; do
          bline="${bline//$'\r'/}"
          # Detect indent level from first non-empty line
          if [ -z "$block_indent" ]; then
            if echo "$bline" | grep -qE "^[[:space:]]*$"; then continue; fi
            block_indent=$(echo "$bline" | sed 's/[^ ].*//')
          fi
          # End of block: line with less or equal indent that's not blank
          if [ -n "$bline" ] && ! echo "$bline" | grep -qE "^${block_indent}"; then
            # Unread is not possible in bash, but this line belongs to next section
            # We'll lose this line — acceptable since it's safety_check or next step
            break
          fi
          # Strip the block indent prefix
          local stripped
          stripped=$(echo "$bline" | sed "s/^${block_indent}//")
          if [ -n "$current_command" ]; then
            current_command="${current_command}
${stripped}"
          else
            current_command="$stripped"
          fi
        done
      else
        current_command="$cmd_value"
      fi
      in_params=false
      continue
    fi
  done < "$TEST_FILE"

  # Execute last pending command
  if [ -n "$current_command" ]; then
    step_index=$((step_index + 1))
    local step_result
    local cmd_unescaped
    cmd_unescaped=$(printf '%s' "$current_command" | sed 's/\\"/"/g' | sed 's/\\\\/\\/g')
    local tmpfile
    tmpfile=$(mktemp)
    printf '%s\n' "$cmd_unescaped" > "$tmpfile"
    local step_timeout=${TIMEOUT_SECONDS:-30}
    step_result=$(timeout "$step_timeout" bash "$tmpfile" 2>&1) || true
    local exit_code=$?
    rm -f "$tmpfile"
    if [ "$exit_code" -eq 124 ]; then
      step_result="TIMEOUT after ${step_timeout}s"
      log_warn "Step ${step_index} timed out after ${step_timeout}s"
    fi
    step_result=$(echo "$step_result" | tr -d '\r' | sed '/^$/d')
    log_info "Step ${step_index} output: ${step_result}"
    eval "STEP_OUTPUT_${step_index}=\"\$step_result\""
  fi

  local total_steps=$step_index
  log_info "Executed $total_steps bash_command steps"

  # === Phase 2: Evaluate assertions referencing step outputs ===
  write_progress "$TEST_ID" "asserting" "Evaluating assertions" "bash-check"

  local in_assertions=false
  local current_type=""
  local current_target=""
  local current_expected=""
  local current_desc=""

  _flush_bash_check_assertion() {
    if [ -z "$current_type" ] || [ -z "$current_target" ]; then return; fi

    # bash_exit_zero / bash_output_*: target IS the command to run — no STEP_OUTPUT needed
    # text_gt / text_equals / text_contains: target is stepN_output reference — resolve STEP_OUTPUT
    local actual_value=""
    case "$current_type" in
      text_gt|text_equals|text_contains)
        local step_num
        if [ "$current_target" = "command_output" ]; then
          step_num="1"
        else
          step_num=$(echo "$current_target" | sed 's/step\([0-9]*\)_output/\1/')
        fi
        # Validate step_num is numeric; fallback to error if target format is unexpected
        if ! echo "$step_num" | grep -qE '^[0-9]+$'; then
          log_warn "Unexpected assertion target format: $current_target (expected stepN_output)"
          add_assertion "${current_desc:-$current_type: $current_target}" "false" "valid step ref" "unparseable target: $current_target"
          return
        fi
        eval "actual_value=\"\${STEP_OUTPUT_${step_num}:-}\""
        ;;
    esac

    case "$current_type" in
      bash_exit_zero)
        _exec_bash_exit_zero_assertion "$current_target" "${current_desc:-bash_exit_zero: $current_target}"
        ;;
      bash_output_contains)
        _exec_bash_output_contains_assertion "$current_target" "$current_expected" "${current_desc:-bash_output_contains: $current_target}"
        ;;
      bash_output_not_contains)
        _exec_bash_output_not_contains_assertion "$current_target" "$current_expected" "${current_desc:-bash_output_not_contains: $current_target}"
        ;;
      text_gt)
        local actual_int=$(echo "$actual_value" | grep -o '[0-9]*' | head -1)
        local expected_int=$(echo "$current_expected" | grep -o '[0-9]*' | head -1)
        actual_int=${actual_int:-0}
        expected_int=${expected_int:-0}
        if [ "$actual_int" -gt "$expected_int" ] 2>/dev/null; then
          log_pass "${current_desc:-text_gt} ($actual_int > $expected_int)"
          add_assertion "${current_desc:-text_gt: $current_target}" "true" ">$expected_int" "$actual_int"
        else
          log_fail "${current_desc:-text_gt} ($actual_int <= $expected_int)"
          add_assertion "${current_desc:-text_gt: $current_target}" "false" ">$expected_int" "$actual_int"
        fi
        ;;
      text_equals)
        if [ "$actual_value" = "$current_expected" ]; then
          log_pass "${current_desc:-text_equals} ($actual_value == $current_expected)"
          add_assertion "${current_desc:-text_equals: $current_target}" "true" "$current_expected" "$actual_value"
        else
          log_fail "${current_desc:-text_equals} ($actual_value != $current_expected)"
          add_assertion "${current_desc:-text_equals: $current_target}" "false" "$current_expected" "$actual_value"
        fi
        ;;
      text_contains)
        if echo "$actual_value" | grep -q "$current_expected"; then
          log_pass "${current_desc:-text_contains} (found: $current_expected)"
          add_assertion "${current_desc:-text_contains: $current_target}" "true" "$current_expected" "found"
        else
          log_fail "${current_desc:-text_contains} (missing: $current_expected)"
          add_assertion "${current_desc:-text_contains: $current_target}" "false" "$current_expected" "not found in: $actual_value"
        fi
        ;;
    esac
  }

  while IFS= read -r line; do
    line="${line//$'\r'/}"

    if echo "$line" | grep -q "^assertions:"; then
      in_assertions=true
      continue
    fi
    if $in_assertions && echo "$line" | grep -qE "^[a-zA-Z]"; then
      break
    fi
    if ! $in_assertions; then continue; fi

    # New assertion entry
    if echo "$line" | grep -q "  - type:"; then
      _flush_bash_check_assertion
      current_type=$(echo "$line" | sed 's/.*type: *//' | sed 's/^"//' | sed 's/"$//' | tr -d ' ')
      current_target=""
      current_expected=""
      current_desc=""
      continue
    fi

    if echo "$line" | grep -q "^ *target:"; then
      current_target=$(echo "$line" | sed 's/.*target: *//' | sed 's/^"//' | sed 's/"$//' | sed 's/ *#.*//')
    fi
    if echo "$line" | grep -q "^ *expected:"; then
      current_expected=$(echo "$line" | sed 's/.*expected: *//' | sed 's/^"//' | sed 's/"$//' | sed "s/^'//" | sed "s/'$//" | sed 's/ *#.*//')
    fi
    if echo "$line" | grep -q "^ *description:"; then
      current_desc=$(echo "$line" | sed 's/.*description: *//' | sed 's/^"//' | sed 's/"$//' | sed "s/^'//" | sed "s/'$//" )
    fi
  done < "$TEST_FILE"

  # Flush last assertion
  _flush_bash_check_assertion
}

execute_file_verification() {
  log_info "--- Executing file verification ---"

  if [ -z "$TEST_CASE_ID" ]; then
    log_info "No case ID — running assertion-only mode"
    # Still run verify_case_outputs with empty ID so file_exists/json_field assertions work
    verify_case_outputs ""
    run_standalone_bash_assertions
  else
    verify_case_outputs "$TEST_CASE_ID"
    run_standalone_bash_assertions
  fi
}

# ============================================================
# API-based Workflow Test
# ============================================================
execute_api_workflow_test() {
  log_info "--- Executing API workflow test ---"

  # Parse API calls from steps
  local in_steps=false
  local current_method=""
  local current_url=""
  local current_body=""

  while IFS= read -r line; do
    line="${line//$'\r'/}"

    if echo "$line" | grep -q "^steps:"; then
      in_steps=true
      continue
    fi
    if $in_steps && echo "$line" | grep -qE "^[a-z]"; then
      in_steps=false
      if [ -n "$current_method" ] && [ -n "$current_url" ]; then
        http_request "$current_method" "$current_url" "$TOKEN" "$current_body"
        local name="$current_method $(echo "$current_url" | sed "s|$API_BASE||")"
        if [ "$HTTP_STATUS" -ge 200 ] && [ "$HTTP_STATUS" -lt 300 ]; then
          log_pass "$name → HTTP $HTTP_STATUS"
          add_assertion "$name" "true" "2xx" "$HTTP_STATUS"
        else
          log_fail "$name → HTTP $HTTP_STATUS"
          add_assertion "$name" "false" "2xx" "$HTTP_STATUS"
        fi
      fi
      continue
    fi

    if ! $in_steps; then continue; fi

    if echo "$line" | grep -q "method:"; then
      current_method=$(echo "$line" | sed 's/.*method: *"\(.*\)"/\1/')
    fi
    if echo "$line" | grep -q "url:"; then
      current_url=$(echo "$line" | sed 's/.*url: *"\(.*\)"/\1/' | sed "s|{api_base}|$API_BASE|g" | sed "s|{base_url}|$API_BASE|g")
    fi
    if echo "$line" | grep -q "body:"; then
      current_body=$(echo "$line" | sed "s/.*body: *'\(.*\)'/\1/" | sed 's/.*body: *"\(.*\)"/\1/')
    fi
  done < "$TEST_FILE"
}

# ============================================================
# Verify Case Outputs
# ============================================================
verify_case_outputs() {
  local case_id="$1"
  local case_dir="${CASE_DIR:-$CASES_ROOT/active/$case_id}"

  # Parse assertions from YAML
  local in_assertions=false

  while IFS= read -r line; do
    line="${line//$'\r'/}"

    if echo "$line" | grep -q "^assertions:"; then
      in_assertions=true
      continue
    fi
    if $in_assertions && echo "$line" | grep -qE "^[a-z]"; then
      in_assertions=false
      continue
    fi
    if ! $in_assertions; then continue; fi

    # file_exists assertions
    if echo "$line" | grep -q "type: .file_exists"; then
      local target=""
      local expected="true"
      # Read next lines for target and expected
      while IFS= read -r aline; do
        aline="${aline//$'\r'/}"
        if echo "$aline" | grep -q "target:"; then
          target=$(echo "$aline" | sed 's/.*target: *"\(.*\)"/\1/' | sed "s|{cases_root}|$CASES_ROOT|g" | sed "s|{test_case_id}|$case_id|g" | sed "s|{live_case_id}|$case_id|g" | sed "s|{case_dir}|$case_dir|g")
        fi
        if echo "$aline" | grep -q "expected:"; then
          expected=$(echo "$aline" | sed 's/.*expected: *\(.*\)/\1/' | tr -d ' "')
          break
        fi
        if echo "$aline" | grep -q "^  - type:"; then
          break
        fi
      done

      if [ -n "$target" ]; then
        # CONTRACT_MISMATCH guard: catch unresolved placeholders in assertion targets
        validate_no_raw_placeholders "$target" "assertion:file_exists target" || true
        if [ -e "$target" ]; then
          log_pass "File exists: $(basename "$target")"
          add_assertion "File exists: $(basename "$target")" "true" "exists" "exists"
        else
          log_fail "File missing: $target"
          add_assertion "File exists: $(basename "$target")" "false" "exists" "missing"
        fi
      fi
    fi

    # file_content assertions (check valid JSON etc.)
    if echo "$line" | grep -q "type: .file_content"; then
      local target=""
      local expected=""
      while IFS= read -r aline; do
        aline="${aline//$'\r'/}"
        if echo "$aline" | grep -q "target:"; then
          target=$(echo "$aline" | sed 's/.*target: *"\(.*\)"/\1/' | sed "s|{cases_root}|$CASES_ROOT|g" | sed "s|{test_case_id}|$case_id|g" | sed "s|{live_case_id}|$case_id|g" | sed "s|{case_dir}|$case_dir|g")
        fi
        if echo "$aline" | grep -q "expected:"; then
          # Preserve content after "expected:" including spaces for contains/not_contains prefixes
          expected=$(echo "$aline" | sed 's/.*expected: *"\{0,1\}\(.*\)"\{0,1\}/\1/' | sed 's/^ *//;s/ *$//' | tr -d '"')
          break
        fi
      done

      if [ -n "$target" ] && [ -f "$target" ]; then
        # CONTRACT_MISMATCH guard
        validate_no_raw_placeholders "$target" "assertion:file_content target" || true
        case "$expected" in
          valid_json)
            if NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'))" "$target" 2>/dev/null; then
              log_pass "Valid JSON: $(basename "$target")"
              add_assertion "Valid JSON: $(basename "$target")" "true" "valid_json" "valid"
            else
              log_fail "Invalid JSON: $(basename "$target")"
              add_assertion "Valid JSON: $(basename "$target")" "false" "valid_json" "invalid"
            fi
            ;;
          non_empty)
            local fsize
            fsize=$(wc -c < "$target" 2>/dev/null || echo "0")
            fsize=$(echo "$fsize" | tr -d ' ')
            if [ "$fsize" -gt 0 ]; then
              log_pass "File non-empty: $(basename "$target") (${fsize} bytes)"
              add_assertion "Non-empty: $(basename "$target")" "true" "non_empty" "${fsize} bytes"
            else
              log_fail "File is empty: $(basename "$target")"
              add_assertion "Non-empty: $(basename "$target")" "false" "non_empty" "empty"
            fi
            ;;
          not_contains:*)
            # Check that file does NOT contain the pattern
            local nc_pattern
            nc_pattern=$(echo "$expected" | sed 's/^not_contains: *//')
            if grep -q "$nc_pattern" "$target" 2>/dev/null; then
              log_fail "File should not contain: $nc_pattern"
              add_assertion "Not contains: $(basename "$target")" "false" "not_contains: $nc_pattern" "found"
            else
              log_pass "File does not contain: $nc_pattern"
              add_assertion "Not contains: $(basename "$target")" "true" "not_contains: $nc_pattern" "not found"
            fi
            ;;
          contains:*)
            # Check that file DOES contain the pattern
            local c_pattern
            c_pattern=$(echo "$expected" | sed 's/^contains: *//')
            if grep -q "$c_pattern" "$target" 2>/dev/null; then
              log_pass "File contains: $c_pattern"
              add_assertion "Contains: $(basename "$target")" "true" "contains: $c_pattern" "found"
            else
              log_fail "File missing content: $c_pattern"
              add_assertion "Contains: $(basename "$target")" "false" "contains: $c_pattern" "not found"
            fi
            ;;
          *)
            # Generic content check
            if grep -q "$expected" "$target" 2>/dev/null; then
              add_assertion "Content match: $(basename "$target")" "true" "$expected" "found"
            else
              add_assertion "Content match: $(basename "$target")" "false" "$expected" "not found"
            fi
            ;;
        esac
      fi
    fi

    # registry_count_above assertions (check directory has more than N files/dirs)
    if echo "$line" | grep -q "type: .registry_count_above"; then
      local target=""
      local expected=""
      while IFS= read -r aline; do
        aline="${aline//$'\r'/}"
        if echo "$aline" | grep -q "target:"; then
          target=$(echo "$aline" | sed 's/.*target: *"\(.*\)"/\1/' | sed "s|{cases_root}|$CASES_ROOT|g" | sed "s|{test_case_id}|$case_id|g" | sed "s|{live_case_id}|$case_id|g" | sed "s|{case_dir}|$case_dir|g")
        fi
        if echo "$aline" | grep -q "expected:"; then
          expected=$(echo "$aline" | sed 's/.*expected: *"\{0,1\}\(.*\)"\{0,1\}/\1/' | sed 's/ *#.*//' | tr -d ' "')
          break
        fi
        if echo "$aline" | grep -q "^  - type:"; then
          break
        fi
      done

      if [ -n "$target" ] && [ -d "$target" ]; then
        validate_no_raw_placeholders "$target" "assertion:registry_count_above target" || true
        local count
        count=$(ls -1 "$target" 2>/dev/null | wc -l | tr -d ' ')
        local threshold
        threshold=$(echo "$expected" | tr -d '>')
        if [ "$count" -gt "$threshold" ]; then
          log_pass "Dir count: $(basename "$target") has $count entries (>$threshold)"
          add_assertion "Dir count above $threshold: $(basename "$target")" "true" ">$threshold" "$count"
        else
          log_fail "Dir count: $(basename "$target") has $count entries (need >$threshold)"
          add_assertion "Dir count above $threshold: $(basename "$target")" "false" ">$threshold" "$count"
        fi
      elif [ -n "$target" ]; then
        log_fail "Directory not found: $target"
        add_assertion "Dir count: $(basename "$target")" "false" ">$expected" "dir not found"
      fi
    fi

    # json_field assertions (check nested JSON field value)
    # NOTE: use 'json_field"' pattern (with closing quote) to exclude json_field_enum from matching here
    if echo "$line" | grep -q 'type: .json_field"'; then
      local target=""
      local field=""
      local expected=""
      while IFS= read -r aline; do
        aline="${aline//$'\r'/}"
        if echo "$aline" | grep -q "target:"; then
          target=$(echo "$aline" | sed 's/.*target: *"\(.*\)"/\1/' | sed "s|{cases_root}|$CASES_ROOT|g" | sed "s|{test_case_id}|$case_id|g" | sed "s|{live_case_id}|$case_id|g" | sed "s|{case_dir}|$case_dir|g")
        fi
        if echo "$aline" | grep -q "field:"; then
          field=$(echo "$aline" | sed 's/.*field: *"\{0,1\}\(.*\)"\{0,1\}/\1/' | sed 's/ *#.*//' | tr -d ' "')
        fi
        if echo "$aline" | grep -q "expected:"; then
          expected=$(echo "$aline" | sed 's/.*expected: *"\{0,1\}\(.*\)"\{0,1\}/\1/' | sed 's/ *#.*//' | tr -d ' "')
          break
        fi
      done

      if [ -n "$target" ] && [ -f "$target" ] && [ -n "$field" ]; then
        # CONTRACT_MISMATCH guard
        validate_no_raw_placeholders "$target" "assertion:json_field target" || true
        local field_val=""
        field_val=$(NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
          const d=JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'));
          const keys='${field}'.split('.');
          let v=d;
          for(const k of keys){v=v&&v[k];}
          console.log(v!==undefined&&v!==null?JSON.stringify(v):'NULL');
        " "$target" 2>/dev/null || echo "ERROR")

        case "$expected" in
          not_null)
            if [ "$field_val" != "NULL" ] && [ "$field_val" != "ERROR" ]; then
              log_pass "JSON field $field is not null"
              add_assertion "JSON field: $field not null" "true" "not_null" "$field_val"
            else
              log_fail "JSON field $field is null/missing"
              add_assertion "JSON field: $field not null" "false" "not_null" "$field_val"
            fi
            ;;
          *)
            if echo "$field_val" | grep -q "$expected"; then
              add_assertion "JSON field: $field = $expected" "true" "$expected" "$field_val"
            else
              add_assertion "JSON field: $field = $expected" "false" "$expected" "$field_val"
            fi
            ;;
        esac
      fi
    fi

    # json_field_enum assertions (check if field value is one of valid enum values)
    if echo "$line" | grep -q "type: .json_field_enum"; then
      local target=""
      local field=""
      local expected_arr=""
      while IFS= read -r aline; do
        aline="${aline//$'\r'/}"
        if echo "$aline" | grep -q "target:"; then
          target=$(echo "$aline" | sed 's/.*target: *"\(.*\)"/\1/' | sed "s|{cases_root}|$CASES_ROOT|g" | sed "s|{test_case_id}|$case_id|g" | sed "s|{live_case_id}|$case_id|g" | sed "s|{case_dir}|$case_dir|g")
        fi
        if echo "$aline" | grep -q "field:"; then
          field=$(echo "$aline" | sed 's/.*field: *"\{0,1\}\(.*\)"\{0,1\}/\1/' | sed 's/ *#.*//' | tr -d ' "')
        fi
        if echo "$aline" | grep -q "expected:"; then
          # expected is a YAML array like ["idle", "running", "paused"]
          expected_arr=$(echo "$aline" | sed 's/.*expected: *\[\(.*\)\]/\1/' | tr -d '"' | sed 's/,/ /g')
          break
        fi
      done

      if [ -n "$target" ] && [ -f "$target" ] && [ -n "$field" ]; then
        validate_no_raw_placeholders "$target" "assertion:json_field_enum target" || true
        local field_val=""
        field_val=$(NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
          const d=JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'));
          const keys='${field}'.split('.');
          let v=d;
          for(const k of keys){v=v&&v[k];}
          console.log(v!==undefined&&v!==null?JSON.stringify(v):'NULL');
        " "$target" 2>/dev/null || echo "ERROR")

        if [ "$field_val" = "NULL" ] || [ "$field_val" = "ERROR" ]; then
          log_fail "JSON field $field is null/missing"
          add_assertion "JSON field: $field in enum [${expected_arr}]" "false" "enum:${expected_arr}" "NULL"
        else
          # Strip quotes from field_val for comparison
          local field_val_clean=$(echo "$field_val" | tr -d '"')
          local found=false
          for enum_val in $expected_arr; do
            if [ "$field_val_clean" = "$enum_val" ]; then
              found=true
              break
            fi
          done
          if [ "$found" = "true" ]; then
            log_pass "JSON field $field = $field_val_clean (valid enum value)"
            add_assertion "JSON field: $field in enum [${expected_arr}]" "true" "enum:${expected_arr}" "$field_val_clean"
          else
            log_fail "JSON field $field = $field_val_clean (not in valid enum: [${expected_arr}])"
            add_assertion "JSON field: $field in enum [${expected_arr}]" "false" "enum:${expected_arr}" "$field_val_clean"
          fi
        fi
      fi
    fi
  done < "$TEST_FILE"
}
# ============================================================
parse_output_assertions() {
  local script_output="$1"

  local in_assertions=false

  while IFS= read -r line; do
    line="${line//$'\r'/}"

    if echo "$line" | grep -q "^assertions:"; then
      in_assertions=true
      continue
    fi
    if $in_assertions && echo "$line" | grep -qE "^[a-z]"; then
      break
    fi
    if ! $in_assertions; then continue; fi

    if echo "$line" | grep -q "type: .text_contains"; then
      local target=""
      local expected=""
      while IFS= read -r aline; do
        aline="${aline//$'\r'/}"
        if echo "$aline" | grep -q "expected:"; then
          expected=$(echo "$aline" | sed 's/.*expected: *"\{0,1\}\(.*\)"\{0,1\}/\1/' | tr -d '"')
          break
        fi
      done
      if [ -n "$expected" ]; then
        if echo "$script_output" | grep -q "$expected"; then
          log_pass "Output contains: $expected"
          add_assertion "Output contains: $expected" "true" "$expected" "found"
        else
          log_fail "Output missing: $expected"
          add_assertion "Output contains: $expected" "false" "$expected" "not found"
        fi
      fi
    fi
  done < "$TEST_FILE"
}

# ============================================================
# Main Execution
# ============================================================
log_info "Starting E2E test execution..."

# Determine and run the appropriate workflow type
case "$WORKFLOW_TYPE" in
  casework)     execute_casework_test ;;
  single_step)  execute_single_step_test ;;
  patrol)       execute_patrol_test ;;
  script)       execute_script_test
                # Also run file/json assertions if present (supports synthetic tests)
                if [ -n "$TEST_CASE_ID" ]; then
                  verify_case_outputs "$TEST_CASE_ID"
                fi
                run_standalone_bash_assertions
                ;;
  api)          execute_api_workflow_test ;;
  bash-check)   execute_bash_check_test ;;
  file-check|unknown) execute_file_verification ;;
esac

# Finalize
finalize_assertions
ELAPSED=$(get_elapsed_ms)

OVERALL_STATUS="pass"
if [ "$ASSERTIONS_FAILED" -gt 0 ]; then
  OVERALL_STATUS="fail"
elif [ "$ASSERTION_COUNT" -eq 0 ]; then
  # Phantom pass prevention: 0 assertions = no verification occurred → SKIP
  OVERALL_STATUS="skip"
  log_warn "No assertions executed — marking as skip (phantom pass prevention)"
fi

ERROR_VAL="null"
if [ "$OVERALL_STATUS" = "fail" ]; then
  ERROR_VAL="\"$ASSERTIONS_FAILED of $ASSERTION_COUNT assertions failed\""
elif [ "$OVERALL_STATUS" = "skip" ]; then
  ERROR_VAL="\"no assertions executed (phantom pass prevention)\""
fi

write_result "$ROUND" "$TEST_ID" "$OVERALL_STATUS" "$ASSERTIONS_JSON" "$ERROR_VAL" "$ELAPSED"
clear_progress "$TEST_ID"

# Record synthetic seed on failure (for reproducible regression)
if [ "$OVERALL_STATUS" = "fail" ] && [ "${DATA_SOURCE:-}" = "synthetic" ]; then
  if [ -n "${RESOLVED_SYNTHETIC_PROFILE:-}" ] && [ -n "${RESOLVED_SYNTHETIC_SEED:-}" ]; then
    FAIL_DESC="$ASSERTIONS_FAILED of $ASSERTION_COUNT assertions failed"
    bash "$EXECUTORS_DIR/seed-recorder.sh" \
      "$RESOLVED_SYNTHETIC_PROFILE" "$RESOLVED_SYNTHETIC_SEED" "$TEST_ID" "$FAIL_DESC" \
      2>/dev/null || log_warn "seed-recorder.sh failed (non-fatal)"
  fi
fi

# Summary
echo ""
log_info "=== E2E Test Summary ==="
log_info "Test: $TEST_ID"
log_info "Workflow: $WORKFLOW_TYPE"
log_info "Status: $OVERALL_STATUS"
log_info "Assertions: $ASSERTIONS_PASSED passed, $ASSERTIONS_FAILED failed (total $ASSERTION_COUNT)"
log_info "Duration: ${ELAPSED}ms"

if [ "$OVERALL_STATUS" = "fail" ]; then
  exit 1
else
  exit 0
fi

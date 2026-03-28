#!/usr/bin/env bash
# tests/executors/common.sh — Shared utilities for all test executors
# Source this file: source "$(dirname "$0")/common.sh"

set -u  # no -e/-o pipefail: we handle errors via assertions

# ============================================================
# Paths
# ============================================================
PROJECT_ROOT="/c/Users/fangkun/Documents/Claude Code Projects/EngineerBrain"
TESTS_ROOT="$PROJECT_ROOT/tests"
RESULTS_DIR="$TESTS_ROOT/results"
SCREENSHOTS_DIR="$RESULTS_DIR/screenshots"
REGISTRY_DIR="$TESTS_ROOT/registry"
EXECUTORS_DIR="$TESTS_ROOT/executors"
DASHBOARD_DIR="$PROJECT_ROOT/dashboard"

# ============================================================
# Environment (from env.yaml — hardcoded for performance)
# ============================================================
API_BASE="http://localhost:3010"
FRONTEND_URL="http://localhost:5173"
JWT_SECRET="engineer-brain-local-dev-secret-2026"

# ============================================================
# Colors & Logging
# ============================================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info()  { echo -e "${BLUE}[INFO]${NC} $*"; }
log_pass()  { echo -e "${GREEN}[PASS]${NC} $*"; }
log_fail()  { echo -e "${RED}[FAIL]${NC} $*"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC} $*"; }
log_skip()  { echo -e "${YELLOW}[SKIP]${NC} $*"; }

# ============================================================
# JWT Generation
# ============================================================
generate_jwt() {
  NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "const jwt=require('jsonwebtoken');console.log(jwt.sign({sub:'engineer'},'${JWT_SECRET}',{expiresIn:'1h'}))"
}

# ============================================================
# Health Check
# ============================================================
check_backend() {
  local status
  status=$(curl -sf -o /dev/null -w "%{http_code}" "$API_BASE/api/health" 2>/dev/null || echo "000")
  if [ "$status" = "200" ]; then
    return 0
  else
    return 1
  fi
}

check_frontend() {
  local status
  status=$(curl -sf -o /dev/null -w "%{http_code}" "$FRONTEND_URL" 2>/dev/null || echo "000")
  if [ "$status" = "200" ]; then
    return 0
  else
    return 1
  fi
}

ensure_backend() {
  if ! check_backend; then
    log_fail "Backend not running at $API_BASE"
    echo "Start with: cd dashboard && npm run dev"
    return 1
  fi
  log_info "Backend healthy at $API_BASE"
}

ensure_frontend() {
  if ! check_frontend; then
    log_warn "Frontend not running at $FRONTEND_URL (UI tests may fail)"
    return 1
  fi
  log_info "Frontend healthy at $FRONTEND_URL"
}

# ============================================================
# Result Writing
# ============================================================
# Write test result JSON
# Usage: write_result $round $testId $status "$assertions_json" "$error" $duration_ms
write_result() {
  local round="$1"
  local testId="$2"
  local status="$3"
  local assertions="$4"
  local error="$5"
  local duration_ms="$6"

  mkdir -p "$RESULTS_DIR"

  local result_file="$RESULTS_DIR/${round}-${testId}.json"
  local timestamp
  timestamp=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")

  cat > "$result_file" << RESULTEOF
{
  "testId": "$testId",
  "round": $round,
  "timestamp": "$timestamp",
  "status": "$status",
  "assertions": $assertions,
  "error": $error,
  "duration_ms": $duration_ms
}
RESULTEOF

  log_info "Result written to $result_file"
}

# ============================================================
# Safety Gate (lightweight — full version in safety-gate.sh)
# ============================================================
# Check if an API action is safe
# Usage: is_api_safe "GET /api/health" → returns 0 (safe) or 1 (blocked)
is_api_safe() {
  local action="$1"
  # Blocked list (from safety.yaml)
  case "$action" in
    "POST /api/todo/"*"/execute") return 1 ;;  # D365 write
    *) return 0 ;;
  esac
}

# ============================================================
# HTTP Request Helper
# ============================================================
# Usage: http_request "GET" "http://..." ["auth_token"] → sets HTTP_STATUS, HTTP_BODY
HTTP_STATUS=""
HTTP_BODY=""

http_request() {
  local method="$1"
  local url="$2"
  local token="${3:-}"
  local body="${4:-}"

  local tmp_file
  tmp_file=$(mktemp)
  local tmp_headers
  tmp_headers=$(mktemp)

  local curl_args=(-s -o "$tmp_file" -w "%{http_code}" -X "$method")

  if [ -n "$token" ]; then
    curl_args+=(-H "Authorization: Bearer $token")
  fi

  curl_args+=(-H "Content-Type: application/json")

  if [ -n "$body" ]; then
    curl_args+=(-d "$body")
  fi

  HTTP_STATUS=$(curl "${curl_args[@]}" "$url" 2>/dev/null || echo "000")
  HTTP_BODY=$(cat "$tmp_file" 2>/dev/null || echo "")

  rm -f "$tmp_file" "$tmp_headers"
}

# ============================================================
# Assertion Helpers
# ============================================================
ASSERTIONS_JSON="["
ASSERTION_COUNT=0
ASSERTIONS_PASSED=0
ASSERTIONS_FAILED=0

reset_assertions() {
  ASSERTIONS_JSON="["
  ASSERTION_COUNT=0
  ASSERTIONS_PASSED=0
  ASSERTIONS_FAILED=0
}

# Add assertion result
# Usage: add_assertion "name" true|false "expected" "actual" ["note"]
add_assertion() {
  local name="$1"
  local passed="$2"
  local expected="$3"
  local actual="$4"
  local note="${5:-}"

  ASSERTION_COUNT=$((ASSERTION_COUNT + 1))

  if [ "$passed" = "true" ]; then
    ASSERTIONS_PASSED=$((ASSERTIONS_PASSED + 1))
  else
    ASSERTIONS_FAILED=$((ASSERTIONS_FAILED + 1))
  fi

  # Add comma separator if not first
  if [ $ASSERTION_COUNT -gt 1 ]; then
    ASSERTIONS_JSON="${ASSERTIONS_JSON},"
  fi

  # Escape special characters in strings for JSON
  local escaped_name
  escaped_name=$(echo "$name" | sed 's/"/\\"/g')
  local escaped_expected
  escaped_expected=$(echo "$expected" | sed 's/"/\\"/g')
  local escaped_actual
  escaped_actual=$(echo "$actual" | sed 's/"/\\"/g')
  local escaped_note
  escaped_note=$(echo "$note" | sed 's/"/\\"/g')

  ASSERTIONS_JSON="${ASSERTIONS_JSON}{\"name\":\"$escaped_name\",\"pass\":$passed,\"expected\":\"$escaped_expected\",\"actual\":\"$escaped_actual\""
  if [ -n "$note" ]; then
    ASSERTIONS_JSON="${ASSERTIONS_JSON},\"note\":\"$escaped_note\""
  fi
  ASSERTIONS_JSON="${ASSERTIONS_JSON}}"
}

finalize_assertions() {
  ASSERTIONS_JSON="${ASSERTIONS_JSON}]"
}

# ============================================================
# Backup / Restore Helpers (for E2E tests)
# ============================================================
create_backup() {
  local source_dir="$1"
  local backup_dir
  backup_dir="/tmp/test-backup-$(date +%s)"
  mkdir -p "$backup_dir"
  cp -r "$source_dir"/* "$backup_dir/" 2>/dev/null || true
  echo "$backup_dir"
}

restore_backup() {
  local backup_dir="$1"
  local target_dir="$2"
  if [ -d "$backup_dir" ]; then
    rm -rf "$target_dir"/*
    cp -r "$backup_dir"/* "$target_dir/" 2>/dev/null || true
    rm -rf "$backup_dir"
    log_info "Restored from backup: $backup_dir → $target_dir"
  fi
}

# ============================================================
# Progress Tracking (for supervisor visibility)
# ============================================================
# Write progress file so supervisor can see what's happening in real-time
# Usage: write_progress <testId> <step> <detail> [type]
write_progress() {
  local testId="$1"
  local step="$2"
  local detail="${3:-}"
  local prog_type="${4:-}"
  local elapsed_s=$(( ($(date +%s) - ${PROGRESS_START_TIME:-$(date +%s)}) ))
  local timestamp
  timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

  mkdir -p "$RESULTS_DIR"
  cat > "$RESULTS_DIR/.progress-${testId}.json" << PROGRESSEOF
{
  "testId": "$testId",
  "type": "$prog_type",
  "step": "$step",
  "detail": "$detail",
  "elapsed_s": $elapsed_s,
  "timestamp": "$timestamp"
}
PROGRESSEOF
}

# Clear progress file when executor completes
# Usage: clear_progress <testId>
clear_progress() {
  local testId="$1"
  rm -f "$RESULTS_DIR/.progress-${testId}.json"
}

# Initialize progress start time (call at executor start)
init_progress() {
  PROGRESS_START_TIME=$(date +%s)
}

# ============================================================
# Timer
# ============================================================
TIMER_START=0

start_timer() {
  TIMER_START=$(date +%s%3N 2>/dev/null || python3 -c "import time; print(int(time.time()*1000))" 2>/dev/null || echo "0")
}

get_elapsed_ms() {
  local now
  now=$(date +%s%3N 2>/dev/null || python3 -c "import time; print(int(time.time()*1000))" 2>/dev/null || echo "0")
  echo $(( now - TIMER_START ))
}

# ============================================================
# Observability Helpers
# ============================================================

# Simple YAML value reader (for flat/nested keys)
# Usage: read_yaml_value "file.yaml" "key"
# For nested: searches for indented key under parent context
read_yaml_value() {
  local file="$1"
  local key="$2"
  grep "^  *${key}:" "$file" 2>/dev/null | head -1 | sed 's/^[^:]*: *"\{0,1\}\(.*\)"\{0,1\}$/\1/' | tr -d '\r"'
}

# JSON path reader using node
# Usage: read_json_path "file.json" "path.to.value"
read_json_path() {
  local file="$1"
  local path="$2"
  NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
    const d = JSON.parse(require('fs').readFileSync('$file','utf8'));
    const keys = '${path}'.split('.');
    let v = d;
    for (const k of keys) { v = v && v[k]; }
    console.log(v !== undefined && v !== null ? v : '');
  " 2>/dev/null || echo ""
}

# Check ratio against baseline thresholds
# Usage: check_ratio actual baseline warn_ratio [critical_ratio]
# Returns: "pass" / "warn" / "fail" / "skip"
# ============================================================
# Async Polling — wait for casework/step operation to complete
# ============================================================
# Usage: poll_for_completion <case_id> <timeout_seconds> [poll_interval] [case_dir] [test_id]
# Returns: 0 = completed, 1 = timeout
# When case_dir and test_id are provided, infers casework phase from file changes
# and updates .progress-{testId}.json for supervisor visibility.
poll_for_completion() {
  local case_id="$1"
  local timeout="${2:-300}"
  local interval="${3:-10}"
  local case_dir="${4:-}"
  local poll_test_id="${5:-}"
  local elapsed=0
  local last_phase="polling"

  log_info "Polling GET /api/case/$case_id/operation (interval=${interval}s, timeout=${timeout}s)..."

  while [ $elapsed -lt $timeout ]; do
    sleep "$interval"
    elapsed=$((elapsed + interval))

    # ---- Phase inference from case directory files ----
    if [ -n "$case_dir" ] && [ -n "$poll_test_id" ] && [ -d "$case_dir" ]; then
      local inferred_phase=""
      inferred_phase=$(infer_casework_phase "$case_dir")
      if [ -n "$inferred_phase" ] && [ "$inferred_phase" != "$last_phase" ]; then
        last_phase="$inferred_phase"
        log_info "Phase: casework:$inferred_phase (elapsed: ${elapsed}s)"
        write_progress "$poll_test_id" "casework:$inferred_phase" "Running casework phase: $inferred_phase (${elapsed}s)" "casework"
      fi

      # ---- File-system fallback: timing.json exists → casework completed ----
      if [ -f "$case_dir/timing.json" ]; then
        log_pass "Completion detected via timing.json fallback (elapsed: ${elapsed}s)"
        return 0
      fi
    fi

    http_request "GET" "$API_BASE/api/case/$case_id/operation" "$TOKEN"

    if [ "$HTTP_STATUS" != "200" ]; then
      log_warn "Poll: HTTP $HTTP_STATUS (elapsed: ${elapsed}s)"
      continue
    fi

    # Check if operation is complete:
    # API returns { caseNumber, operation: ActiveOperation | null }
    # - operation is null/undefined → no active operation → completed
    # - operation is a non-null object → still running
    # ActiveOperation has { caseNumber, operationType, startedAt } — NO status/active fields
    local op_active=""
    op_active=$(echo "$HTTP_BODY" | NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
      const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
      if (d.operation === null || d.operation === undefined) {
        console.log('false');
      } else {
        console.log('true');
      }
    " 2>/dev/null || echo "unknown")

    if [ "$op_active" = "false" ]; then
      log_pass "Operation completed (elapsed: ${elapsed}s)"
      return 0
    fi

    if [ "$op_active" = "unknown" ]; then
      log_warn "Poll: failed to parse response (elapsed: ${elapsed}s), body: $(echo "$HTTP_BODY" | head -c 200)" >&2
    fi

    log_info "Still running... (elapsed: ${elapsed}s, op_active=$op_active)"
  done

  # ---- Timeout diagnostics ----
  log_warn "Timeout after ${timeout}s"
  log_warn "Last API response (HTTP $HTTP_STATUS): $(echo "$HTTP_BODY" | head -c 300)" >&2
  if [ -n "$case_dir" ] && [ -d "$case_dir" ]; then
    local diag_phase=""
    diag_phase=$(infer_casework_phase "$case_dir" 2>/dev/null || echo "unknown")
    log_warn "Casework phase at timeout: $diag_phase" >&2
    log_warn "timing.json exists: $([ -f "$case_dir/timing.json" ] && echo 'yes' || echo 'no')" >&2
  fi
  return 1
}

# ============================================================
# Infer current casework phase from case directory file changes
# ============================================================
# Casework creates .t_*_start / .t_*_end files in logs/ during execution.
# Phase order: init → changegate → fastpath|spawnAndPrep → compliance →
#              waitAgents → statusJudge → routing → dataGathering → inspection
# Also checks file modifications (casehealth-meta.json, case-summary.md, todo/)
#
# Usage: infer_casework_phase <case_dir>
# Output: phase name string (e.g. "changegate", "waitAgents", "inspection")
infer_casework_phase() {
  local cdir="$1"
  local logs_dir="$cdir/logs"

  # Priority 1: Check .t_*_start files (most precise — casework writes these)
  # Find the latest _start file that doesn't have a matching _end file
  if [ -d "$logs_dir" ]; then
    # Ordered list of phases (last match wins = current phase)
    local phase_order="init changegate fastpath spawnAndPrep compliance agentWait statusJudge routing dataGathering inspection"
    local current=""
    for phase in $phase_order; do
      if [ -f "$logs_dir/.t_${phase}_start" ]; then
        if [ ! -f "$logs_dir/.t_${phase}_end" ]; then
          # Started but not ended = currently running
          echo "$phase"
          return
        fi
        current="$phase"  # ended, track as last completed
      fi
    done
    # All started phases have ended → use last completed + "done"
    if [ -n "$current" ]; then
      echo "${current}_done"
      return
    fi
  fi

  # Priority 2: Infer from file modifications (fallback when .t_ files cleaned up)
  # Check in reverse order of casework execution
  if [ -d "$cdir/todo" ]; then
    local todo_count
    todo_count=$(ls "$cdir/todo/"*.md 2>/dev/null | wc -l)
    if [ "$todo_count" -gt 0 ]; then
      # Check if any todo was modified in last 60s
      local recent_todo
      recent_todo=$(find "$cdir/todo" -name "*.md" -newer "$cdir/logs/.t_changegate_start" 2>/dev/null | head -1)
      if [ -n "$recent_todo" ]; then
        echo "inspection"
        return
      fi
    fi
  fi

  if [ -f "$cdir/case-summary.md" ]; then
    # case-summary exists → at least past dataGathering
    if [ -f "$cdir/timing.json" ]; then
      # timing.json written last → casework complete or near-complete
      echo "timing"
      return
    fi
  fi

  if [ -f "$cdir/casehealth-meta.json" ]; then
    # meta exists → at least past compliance/judge
    echo "post-judge"
    return
  fi

  # No signals → early phase
  echo "starting"
}

check_ratio() {
  local actual="$1"
  local baseline="$2"
  local warn_ratio="$3"
  local critical_ratio="${4:-999}"

  if [ -z "$actual" ] || [ -z "$baseline" ] || [ "$baseline" = "0" ]; then
    echo "skip"
    return
  fi

  NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
    const a = parseFloat('${actual}');
    const b = parseFloat('${baseline}');
    const w = parseFloat('${warn_ratio}');
    const c = parseFloat('${critical_ratio}');
    if (isNaN(a) || isNaN(b)) { console.log('skip'); process.exit(0); }
    const ratio = a / b;
    if (ratio >= c) console.log('fail');
    else if (ratio >= w) console.log('warn');
    else console.log('pass');
  " 2>/dev/null || echo "skip"
}

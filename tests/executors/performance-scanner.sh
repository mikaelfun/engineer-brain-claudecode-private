#!/usr/bin/env bash
# tests/executors/performance-scanner.sh — SCAN Phase: Performance Scanner
#
# Checks API endpoint response times and casework timing data
# against baselines defined in tests/baselines.yaml.
#
# Usage: bash tests/executors/performance-scanner.sh
# Output: GAP|performance|perf-scan|{category}|{description}|{priority}
#         PERFORMANCE_SCAN|{gap_count}|{details}
#
# Prerequisite: Dashboard must be running (graceful skip if not)
# Schedule: every_3_rounds (from scan-strategies.yaml)

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

BASELINES_FILE="$TESTS_ROOT/baselines.yaml"
CONFIG_FILE="$PROJECT_ROOT/config.json"

log_info "=== Performance Scanner ==="

GAP_COUNT=0
DETAILS=""

# ============================================================
# Pre-flight: Check if dashboard is running
# ============================================================
if ! check_backend; then
  log_skip "Backend not running at $API_BASE — performance scan skipped"
  echo "PERFORMANCE_SCAN|0|backend_offline"
  exit 0
fi

log_info "Backend healthy, starting performance checks..."

# ============================================================
# Load baselines
# ============================================================
if [ ! -f "$BASELINES_FILE" ]; then
  log_warn "baselines.yaml not found — using defaults"
fi

# ============================================================
# 1. API Endpoint Response Times
# ============================================================
log_info "Checking API response times..."

# Define endpoints and their baselines (ms)
# Format: endpoint|baseline_ms|warn_ratio|critical_ratio
ENDPOINTS=(
  "/api/health|500|1.5|3.0"
  "/api/cases|2000|1.5|2.5"
  "/api/tests/state|500|1.5|3.0"
  "/api/todos|1000|1.5|2.5"
  "/api/issues|1000|1.5|2.5"
  "/api/auth/status|300|2.0|4.0"
)

# Generate JWT for authenticated endpoints
TOKEN=$(generate_jwt 2>/dev/null || echo "")

API_ISSUES=0
for entry in "${ENDPOINTS[@]}"; do
  IFS='|' read -r endpoint baseline_ms warn_ratio critical_ratio <<< "$entry"

  # Measure response time (3 requests, take median)
  TIMES=()
  for i in 1 2 3; do
    START_MS=$(date +%s%3N 2>/dev/null || echo "0")
    if [ -n "$TOKEN" ]; then
      HTTP_CODE=$(curl -sf -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TOKEN" "$API_BASE$endpoint" 2>/dev/null || echo "000")
    else
      HTTP_CODE=$(curl -sf -o /dev/null -w "%{http_code}" "$API_BASE$endpoint" 2>/dev/null || echo "000")
    fi
    END_MS=$(date +%s%3N 2>/dev/null || echo "0")
    ELAPSED=$((END_MS - START_MS))

    # Skip if endpoint returned error (not a perf issue)
    if [ "$HTTP_CODE" != "200" ] && [ "$HTTP_CODE" != "401" ]; then
      continue
    fi

    TIMES+=("$ELAPSED")
  done

  if [ "${#TIMES[@]}" -eq 0 ]; then
    log_warn "Endpoint $endpoint: all requests failed (HTTP $HTTP_CODE)"
    continue
  fi

  # Sort and take median
  SORTED=($(printf '%s\n' "${TIMES[@]}" | sort -n))
  MEDIAN_IDX=$(( ${#SORTED[@]} / 2 ))
  ACTUAL_MS="${SORTED[$MEDIAN_IDX]}"

  # Check against threshold
  RESULT=$(check_ratio "$ACTUAL_MS" "$baseline_ms" "$warn_ratio" "$critical_ratio")

  case "$RESULT" in
    fail)
      RATIO=$(node -e "console.log(($ACTUAL_MS/$baseline_ms).toFixed(1))" 2>/dev/null || echo "?")
      echo "GAP|performance|perf-scan|backend-api|$endpoint response ${ACTUAL_MS}ms exceeds critical (baseline ${baseline_ms}ms, ${RATIO}x)|P1"
      GAP_COUNT=$((GAP_COUNT + 1))
      API_ISSUES=$((API_ISSUES + 1))
      log_fail "$endpoint: ${ACTUAL_MS}ms (baseline: ${baseline_ms}ms, ${RATIO}x) — CRITICAL"
      ;;
    warn)
      RATIO=$(node -e "console.log(($ACTUAL_MS/$baseline_ms).toFixed(1))" 2>/dev/null || echo "?")
      echo "GAP|performance|perf-scan|backend-api|$endpoint response ${ACTUAL_MS}ms exceeds warn (baseline ${baseline_ms}ms, ${RATIO}x)|P2"
      GAP_COUNT=$((GAP_COUNT + 1))
      API_ISSUES=$((API_ISSUES + 1))
      log_warn "$endpoint: ${ACTUAL_MS}ms (baseline: ${baseline_ms}ms, ${RATIO}x) — WARN"
      ;;
    *)
      log_pass "$endpoint: ${ACTUAL_MS}ms (baseline: ${baseline_ms}ms)"
      ;;
  esac
done

if [ "$API_ISSUES" -gt 0 ]; then
  DETAILS="${DETAILS}api_slow($API_ISSUES) "
fi

# ============================================================
# 2. Casework Timing Drift
# ============================================================
log_info "Checking casework timing drift..."

# Read cases root
CASES_ROOT=""
if [ -f "$CONFIG_FILE" ]; then
  CASES_ROOT=$(cd "$PROJECT_ROOT" && NODE_PATH="$DASHBOARD_DIR/node_modules" node --input-type=commonjs <<'NODEEOF'
    const path = require('path');
    const c = JSON.parse(require('fs').readFileSync('config.json','utf8'));
    let p = c.casesRoot || 'cases';
    p = path.resolve(p);
    p = p.split(path.sep).join('/').replace(/^([A-Z]):/, (m,d) => '/' + d.toLowerCase());
    console.log(p);
NODEEOF
  )
fi
CASES_ROOT="${CASES_ROOT:-$PROJECT_ROOT/cases}"

# Find most recent timing.json
LATEST_TIMING=""
LATEST_TIME=0
for tf in "$CASES_ROOT/active/"*/timing.json; do
  [ -f "$tf" ] || continue
  MTIME=$(stat -c %Y "$tf" 2>/dev/null || stat -f %m "$tf" 2>/dev/null || echo "0")
  if [ "$MTIME" -gt "$LATEST_TIME" ]; then
    LATEST_TIME="$MTIME"
    LATEST_TIMING="$tf"
  fi
done

TIMING_ISSUES=0
if [ -n "$LATEST_TIMING" ]; then
  log_info "Latest timing: $LATEST_TIMING"

  # Read baselines for casework steps
  BL_TOTAL=$(read_yaml_value "$BASELINES_FILE" "baseline" 2>/dev/null || echo "405")

  # Check total time
  TOTAL_SEC=$(TIMING_FILE="$LATEST_TIMING" NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
    const t = JSON.parse(require('fs').readFileSync(process.env.TIMING_FILE,'utf8'));
    console.log(t.totalSeconds || 0);
  " 2>/dev/null || echo "0")

  BL_WARN_RATIO=$(read_yaml_value "$BASELINES_FILE" "warn_ratio" 2>/dev/null || echo "1.3")
  BL_CRIT_RATIO=$(read_yaml_value "$BASELINES_FILE" "critical_ratio" 2>/dev/null || echo "1.8")

  if [ "$TOTAL_SEC" != "0" ]; then
    RESULT=$(check_ratio "$TOTAL_SEC" "$BL_TOTAL" "$BL_WARN_RATIO" "$BL_CRIT_RATIO")

    case "$RESULT" in
      fail)
        RATIO=$(node -e "console.log(($TOTAL_SEC/$BL_TOTAL).toFixed(1))" 2>/dev/null || echo "?")
        echo "GAP|performance|perf-scan|workflow-e2e|Casework total ${TOTAL_SEC}s exceeds critical (baseline ${BL_TOTAL}s, ${RATIO}x)|P1"
        GAP_COUNT=$((GAP_COUNT + 1))
        TIMING_ISSUES=$((TIMING_ISSUES + 1))
        ;;
      warn)
        RATIO=$(node -e "console.log(($TOTAL_SEC/$BL_TOTAL).toFixed(1))" 2>/dev/null || echo "?")
        echo "GAP|performance|perf-scan|workflow-e2e|Casework total ${TOTAL_SEC}s exceeds warn (baseline ${BL_TOTAL}s, ${RATIO}x)|P2"
        GAP_COUNT=$((GAP_COUNT + 1))
        TIMING_ISSUES=$((TIMING_ISSUES + 1))
        ;;
    esac

    # Check individual steps
    STEP_NAMES="dataRefresh complianceCheck statusJudge teamsSearch inspectionWriter"
    for step in $STEP_NAMES; do
      STEP_SEC=$(TIMING_FILE="$LATEST_TIMING" STEP_NAME="$step" NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
        const t = JSON.parse(require('fs').readFileSync(process.env.TIMING_FILE,'utf8'));
        const steps = t.steps || {};
        const s = steps[process.env.STEP_NAME];
        console.log(s ? s.durationSeconds || 0 : 0);
      " 2>/dev/null || echo "0")

      [ "$STEP_SEC" = "0" ] && continue

      # Read step-specific baselines
      STEP_BL=$(grep -A3 "^    $step:" "$BASELINES_FILE" 2>/dev/null | grep "baseline:" | head -1 | sed 's/.*: *//' | tr -d '\r')
      STEP_WARN=$(grep -A3 "^    $step:" "$BASELINES_FILE" 2>/dev/null | grep "warn_ratio:" | head -1 | sed 's/.*: *//' | tr -d '\r')
      STEP_CRIT=$(grep -A3 "^    $step:" "$BASELINES_FILE" 2>/dev/null | grep "critical_ratio:" | head -1 | sed 's/.*: *//' | tr -d '\r')

      [ -z "$STEP_BL" ] && continue

      STEP_RESULT=$(check_ratio "$STEP_SEC" "$STEP_BL" "${STEP_WARN:-1.5}" "${STEP_CRIT:-2.5}")

      case "$STEP_RESULT" in
        fail|warn)
          STEP_RATIO=$(node -e "console.log(($STEP_SEC/$STEP_BL).toFixed(1))" 2>/dev/null || echo "?")
          PRIO="P2"
          [ "$STEP_RESULT" = "fail" ] && PRIO="P1"
          echo "GAP|performance|perf-scan|workflow-e2e|Casework step $step: ${STEP_SEC}s (baseline ${STEP_BL}s, ${STEP_RATIO}x)|$PRIO"
          GAP_COUNT=$((GAP_COUNT + 1))
          TIMING_ISSUES=$((TIMING_ISSUES + 1))
          ;;
      esac
    done
  fi

  if [ "$TIMING_ISSUES" -gt 0 ]; then
    DETAILS="${DETAILS}timing_drift($TIMING_ISSUES) "
  fi
else
  log_info "No timing.json found — casework timing check skipped"
fi

# ============================================================
# Summary
# ============================================================
log_info "=== Performance Scanner Complete ==="
log_info "Gaps found: $GAP_COUNT"
log_info "Details: ${DETAILS:-none}"

echo "PERFORMANCE_SCAN|$GAP_COUNT|${DETAILS:-none}"

if [ "$GAP_COUNT" -gt 0 ]; then
  log_warn "$GAP_COUNT performance issues found"
else
  log_pass "All endpoints and timing within baselines"
fi

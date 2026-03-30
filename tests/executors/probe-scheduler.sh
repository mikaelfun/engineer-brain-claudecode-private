#!/usr/bin/env bash
# tests/executors/probe-scheduler.sh — Run all observability probes directly during SCAN
#
# Usage: bash tests/executors/probe-scheduler.sh <round>
#
# Logic:
# 1. List all probe IDs from tests/registry/observability/*.yaml
# 2. For each probe, check latest result round (staleness check)
# 3. If lastRound < currentRound - INTERVAL (default 5), execute the probe
# 4. Call observability-runner.sh <probe-id> <round>
# 5. Collect results, output summary: PROBE_SCAN|{ran}/{total}|{passed}/{ran}|{details}
#
# Design:
# - PROBE_INTERVAL from baselines.yaml probe_schedule.interval_rounds (default 5)
# - First round (no history) → run all
# - Each probe runs independently; one failure doesn't block others
# - Expected total time: ~15-30s (5-6 probes × 2-10s, serial)

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# ============================================================
# Arguments
# ============================================================
ROUND="${1:?Usage: probe-scheduler.sh <round>}"

BASELINES_FILE="$TESTS_ROOT/baselines.yaml"
OBS_REGISTRY="$REGISTRY_DIR/observability"

# ============================================================
# Read probe schedule config from baselines.yaml
# ============================================================
PROBE_INTERVAL=5
FORCE_ON_FIRST=true

if [ -f "$BASELINES_FILE" ]; then
  _interval=$(NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
    const fs = require('fs');
    const yaml = fs.readFileSync('$BASELINES_FILE', 'utf8');
    const lines = yaml.split('\n');
    let inSection = false;
    for (const line of lines) {
      const trimmed = line.trimStart();
      if (trimmed.startsWith('probe_schedule:')) { inSection = true; continue; }
      if (inSection && /^[a-z]/.test(trimmed)) { inSection = false; }
      if (inSection && trimmed.startsWith('interval_rounds:')) {
        console.log(trimmed.split(':')[1].trim());
        process.exit(0);
      }
    }
    console.log('5');
  " 2>/dev/null || echo "5")
  PROBE_INTERVAL="${_interval:-5}"

  _force=$(NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
    const fs = require('fs');
    const yaml = fs.readFileSync('$BASELINES_FILE', 'utf8');
    const lines = yaml.split('\n');
    let inSection = false;
    for (const line of lines) {
      const trimmed = line.trimStart();
      if (trimmed.startsWith('probe_schedule:')) { inSection = true; continue; }
      if (inSection && /^[a-z]/.test(trimmed)) { inSection = false; }
      if (inSection && trimmed.startsWith('force_on_first:')) {
        console.log(trimmed.split(':')[1].trim());
        process.exit(0);
      }
    }
    console.log('true');
  " 2>/dev/null || echo "true")
  FORCE_ON_FIRST="${_force:-true}"
fi

log_info "=== Probe Scheduler ==="
log_info "Round: $ROUND | Interval: $PROBE_INTERVAL | ForceOnFirst: $FORCE_ON_FIRST"

# ============================================================
# Enumerate all probes from registry
# ============================================================
PROBE_IDS=()
for probe_file in "$OBS_REGISTRY"/*.yaml; do
  [ -f "$probe_file" ] || continue
  # Extract id from YAML (line: id: "xxx" or id: xxx)
  probe_id=$(grep "^id:" "$probe_file" | head -1 | sed 's/^id: *"\{0,1\}\(.*\)"\{0,1\}$/\1/' | tr -d '\r"')
  if [ -z "$probe_id" ]; then
    # Fallback: use filename without .yaml
    probe_id=$(basename "$probe_file" .yaml)
  fi
  PROBE_IDS+=("$probe_id")
done

TOTAL=${#PROBE_IDS[@]}
log_info "Found $TOTAL probes: ${PROBE_IDS[*]}"

if [ "$TOTAL" -eq 0 ]; then
  log_warn "No probes found in $OBS_REGISTRY"
  echo "PROBE_SCAN|0/0|0/0|no probes found"
  exit 0
fi

# ============================================================
# Staleness check: find last result round for each probe
# ============================================================
get_last_probe_round() {
  local pid="$1"
  # Find the latest result file matching *-{probe-id}.json
  local latest_round=-1
  for f in "$RESULTS_DIR"/*-"${pid}.json"; do
    [ -f "$f" ] || continue
    local fname
    fname=$(basename "$f")
    # Extract round number from filename: {round}-{probe-id}.json
    local r
    r=$(echo "$fname" | sed "s/-${pid}\.json$//" | grep -oE '^[0-9]+$')
    if [ -n "$r" ] && [ "$r" -gt "$latest_round" ]; then
      latest_round=$r
    fi
  done
  echo "$latest_round"
}

# ============================================================
# Execute due probes
# ============================================================
RAN=0
PASSED=0
FAILED=0
SKIPPED=0
DETAILS=""

for probe_id in "${PROBE_IDS[@]}"; do
  last_round=$(get_last_probe_round "$probe_id")

  # Determine if this probe is due
  if [ "$last_round" -lt 0 ]; then
    # Never run before
    if [ "$FORCE_ON_FIRST" = "true" ]; then
      log_info "[$probe_id] Never run before → executing"
    else
      log_info "[$probe_id] Never run, force_on_first=false → skipping"
      SKIPPED=$((SKIPPED + 1))
      continue
    fi
  else
    # Check staleness: due if (currentRound - lastRound) >= interval
    gap=$((ROUND - last_round))
    if [ "$gap" -lt "$PROBE_INTERVAL" ]; then
      log_info "[$probe_id] Last run: R${last_round}, gap=${gap} < interval=${PROBE_INTERVAL} → skipping"
      SKIPPED=$((SKIPPED + 1))
      continue
    fi
    log_info "[$probe_id] Last run: R${last_round}, gap=${gap} >= interval=${PROBE_INTERVAL} → executing"
  fi

  # Execute the probe
  RAN=$((RAN + 1))
  log_info "--- Running probe: $probe_id ---"

  probe_output=$(bash "$SCRIPT_DIR/observability-runner.sh" "$probe_id" "$ROUND" 2>&1)
  probe_exit=$?

  # Parse result from the last PROBE_RESULT line
  result_line=$(echo "$probe_output" | grep "^PROBE_RESULT|" | tail -1)
  if [ -n "$result_line" ]; then
    probe_status=$(echo "$result_line" | cut -d'|' -f3)
  else
    probe_status="fail"
  fi

  if [ "$probe_status" = "pass" ]; then
    PASSED=$((PASSED + 1))
    log_pass "[$probe_id] PASS"
  else
    FAILED=$((FAILED + 1))
    log_fail "[$probe_id] FAIL"
  fi

  # Accumulate details
  if [ -n "$DETAILS" ]; then
    DETAILS="${DETAILS}, "
  fi
  DETAILS="${DETAILS}${probe_id}=${probe_status}"
done

# ============================================================
# Persist observabilityStatus to state.json (ISS-140)
# ============================================================
# Build lastResults JSON from result files
OBS_JSON=$(NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
const fs = require('fs');
const path = require('path');
const resultsDir = '$RESULTS_DIR';
const probeIds = '${PROBE_IDS[*]}'.split(' ').filter(Boolean);
const round = $ROUND;
const interval = $PROBE_INTERVAL;

const lastResults = {};
for (const pid of probeIds) {
  // Find latest result file for this probe
  let latestRound = -1;
  let latestData = null;
  try {
    const files = fs.readdirSync(resultsDir);
    for (const f of files) {
      const m = f.match(new RegExp('^(\\\\d+)-' + pid.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\\\$&') + '\\\\.json\$'));
      if (m) {
        const r = parseInt(m[1]);
        if (r > latestRound) {
          latestRound = r;
          try {
            latestData = JSON.parse(fs.readFileSync(path.join(resultsDir, f), 'utf8'));
          } catch(e) {}
        }
      }
    }
  } catch(e) {}

  if (latestRound >= 0 && latestData) {
    const stale = (round - latestRound) >= interval;
    lastResults[pid] = {
      round: latestRound,
      status: latestData.status || (latestData.assertions ? (latestData.assertions.every(a => a.pass) ? 'pass' : 'fail') : 'unknown'),
      timestamp: latestData.timestamp || new Date().toISOString(),
      stale: stale
    };
  }
}

const probesPass = Object.values(lastResults).filter(v => v.status === 'pass').length;
const probesFail = Object.values(lastResults).filter(v => v.status === 'fail').length;
const staleCount = Object.values(lastResults).filter(v => v.stale).length;

const obsStatus = {
  probesTotal: probeIds.length,
  probesRun: Object.keys(lastResults).length,
  probesPass,
  probesFail,
  staleCount,
  lastResults
};

console.log(JSON.stringify({ observabilityStatus: obsStatus }));
" 2>/dev/null)

if [ -n "$OBS_JSON" ] && [ "$OBS_JSON" != "null" ]; then
  echo "$OBS_JSON" | bash "$SCRIPT_DIR/state-writer.sh" --merge >/dev/null 2>&1
  log_info "Persisted observabilityStatus to state.json"
fi

# ============================================================
# Summary
# ============================================================
log_info "=== Probe Scheduler Complete ==="
log_info "Ran: $RAN/$TOTAL | Passed: $PASSED/$RAN | Skipped: $SKIPPED | Failed: $FAILED"

echo "PROBE_SCAN|${RAN}/${TOTAL}|${PASSED}/${RAN}|${DETAILS}"

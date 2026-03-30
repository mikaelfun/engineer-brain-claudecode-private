#!/usr/bin/env bash
# tests/executors/baseline-updater.sh — Auto-evolve baselines using sliding average
#
# Usage: bash tests/executors/baseline-updater.sh [probe-id]
#
# Called after observability probe PASS in VERIFY phase.
# Updates baselines.yaml using sliding average from recent timing.json data.
#
# Rules:
# - Only updates timing-related baselines (casework_timing section)
# - Uses sliding average of last N=10 timing.json files
# - Single update cannot shift baseline more than 10% (prevents outlier pollution)
# - Records update history in baselines.yaml
# - Other baselines (agent_config, skill_prompt, bash_stability) are static

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

PROBE_ID="${1:-casework-timing-baseline}"
BASELINES_FILE="$TESTS_ROOT/baselines.yaml"
CONFIG_FILE="$PROJECT_ROOT/config.json"
MAX_SAMPLES=10
MAX_SHIFT=0.10  # 10% max shift per update

log_info "=== Baseline Updater ==="
log_info "Probe: $PROBE_ID"

if [ ! -f "$BASELINES_FILE" ]; then
  log_fail "Baselines file not found: $BASELINES_FILE"
  exit 1
fi

# Only timing baselines are auto-updated
case "$PROBE_ID" in
  casework-timing-baseline)
    log_info "Updating casework timing baselines..."
    ;;
  *)
    log_info "Probe $PROBE_ID does not have auto-evolving baselines — skipping"
    echo "BASELINE_UPDATE|$PROBE_ID|skip|static_baseline"
    exit 0
    ;;
esac

# ============================================================
# Collect timing data from recent cases
# ============================================================
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

# Find timing.json files, sorted by modification time (newest first), take N
# Use a temp file to avoid pipe+variable issues
TIMING_LIST_FILE=$(mktemp)
find "$CASES_ROOT/active" -name "timing.json" -type f 2>/dev/null > "$TIMING_LIST_FILE"

# Sort by mtime using ls (use -0/-d to handle paths with spaces)
TIMING_FILES=""
if [ -s "$TIMING_LIST_FILE" ]; then
  TIMING_FILES=$(tr '\n' '\0' < "$TIMING_LIST_FILE" | xargs -0 ls -t 2>/dev/null | head -$MAX_SAMPLES)
fi
rm -f "$TIMING_LIST_FILE"

SAMPLE_COUNT=$(echo "$TIMING_FILES" | grep -c . || true)

if [ "$SAMPLE_COUNT" -lt 2 ]; then
  log_warn "Only $SAMPLE_COUNT timing files found — need >=2 for meaningful average. Skipping."
  echo "BASELINE_UPDATE|$PROBE_ID|skip|insufficient_data($SAMPLE_COUNT)"
  exit 0
fi

log_info "Collected $SAMPLE_COUNT timing samples"

# ============================================================
# Compute sliding averages using node
# ============================================================
AVGS_FILE=$(mktemp)
TIMING_LIST_TMP=$(mktemp)
echo "$TIMING_FILES" > "$TIMING_LIST_TMP"

# Convert Git Bash /tmp paths to Windows-compatible paths for node
BU_TIMING_LIST_WIN=$(cygpath -m "$TIMING_LIST_TMP" 2>/dev/null || echo "$TIMING_LIST_TMP")
BU_AVGS_OUT_WIN=$(cygpath -m "$AVGS_FILE" 2>/dev/null || echo "$AVGS_FILE")

# Also convert each timing file path for node to read
TIMING_CONV_TMP=$(mktemp)
while IFS= read -r tf_line; do
  [ -z "$tf_line" ] && continue
  cygpath -m "$tf_line" 2>/dev/null || echo "$tf_line"
done < "$TIMING_LIST_TMP" > "$TIMING_CONV_TMP"
BU_TIMING_CONV_WIN=$(cygpath -m "$TIMING_CONV_TMP" 2>/dev/null || echo "$TIMING_CONV_TMP")

AVERAGES=$(cd "$PROJECT_ROOT" && BU_TIMING_LIST="$BU_TIMING_CONV_WIN" BU_AVGS_OUT="$BU_AVGS_OUT_WIN" NODE_PATH="$DASHBOARD_DIR/node_modules" node --input-type=commonjs <<'NODEAVG'
  const fs = require('fs');
  const files = fs.readFileSync(process.env.BU_TIMING_LIST, 'utf8').trim().split('\n').filter(Boolean);

  const allSteps = {};
  const totals = [];

  for (const f of files) {
    try {
      const t = JSON.parse(fs.readFileSync(f.trim(), 'utf8'));
      const total = t.totalSeconds || 0;
      if (total > 0) totals.push(total);
      // Support both "steps" and "phases" keys in timing.json
      const steps = t.steps || t.phases || {};
      for (const [name, data] of Object.entries(steps)) {
        const sec = typeof data === 'object' ? (data.seconds || 0) : data;
        if (sec > 0) {
          if (!allSteps[name]) allSteps[name] = [];
          allSteps[name].push(sec);
        }
      }
    } catch(e) { /* skip bad files */ }
  }

  const avg = arr => arr.reduce((a,b) => a+b, 0) / arr.length;

  const result = { total: 0, steps: {} };
  if (totals.length > 0) result.total = Math.round(avg(totals));
  for (const [name, values] of Object.entries(allSteps)) {
    result.steps[name] = Math.round(avg(values));
  }

  fs.writeFileSync(process.env.BU_AVGS_OUT, JSON.stringify(result));
  console.log(JSON.stringify(result));
NODEAVG
)

rm -f "$TIMING_LIST_TMP" "$TIMING_CONV_TMP"
if [ -z "$AVERAGES" ] && [ -f "$AVGS_FILE" ]; then
  AVERAGES=$(cat "$AVGS_FILE" 2>/dev/null)
fi
rm -f "$AVGS_FILE"

if [ -z "$AVERAGES" ] || [ "$AVERAGES" = "null" ]; then
  log_warn "Could not compute averages"
  echo "BASELINE_UPDATE|$PROBE_ID|error|compute_failed"
  exit 1
fi

log_info "Computed averages: $AVERAGES"

# ============================================================
# Apply capped update to baselines.yaml
# ============================================================
# Read current baselines and compute new values with 10% cap
AVGS_FILE2=$(mktemp)
echo "$AVERAGES" > "$AVGS_FILE2"

# Convert paths for node
BU_AVGS_IN_WIN=$(cygpath -m "$AVGS_FILE2" 2>/dev/null || echo "$AVGS_FILE2")
BU_BASELINES_WIN=$(cygpath -m "$BASELINES_FILE" 2>/dev/null || echo "$BASELINES_FILE")

UPDATED=$(cd "$PROJECT_ROOT" && BU_AVGS_IN="$BU_AVGS_IN_WIN" BU_BASELINES="$BU_BASELINES_WIN" BU_MAX_SHIFT="$MAX_SHIFT" NODE_PATH="$DASHBOARD_DIR/node_modules" node --input-type=commonjs <<'NODEUPD'
  const fs = require('fs');
  const avgs = JSON.parse(fs.readFileSync(process.env.BU_AVGS_IN, 'utf8'));

  const content = fs.readFileSync(process.env.BU_BASELINES, 'utf8');
  const lines = content.split('\n');
  const maxShift = parseFloat(process.env.BU_MAX_SHIFT);

  function capShift(current, target, ms) {
    if (current <= 0) return target;
    const ratio = target / current;
    if (ratio > 1 + ms) return Math.round(current * (1 + ms));
    if (ratio < 1 - ms) return Math.round(current * (1 - ms));
    return Math.round(target);
  }

  // Parse YAML structure by indent level
  // We track: casework_timing > total_seconds > baseline
  //           casework_timing > steps > {stepName} > baseline
  let section = '';        // e.g. 'casework_timing'
  let subsection = '';     // e.g. 'total_seconds' or 'steps'
  let currentStep = '';    // e.g. 'dataRefresh'
  const updates = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith('#')) continue;

    const indent = line.length - line.trimStart().length;
    const trimmed = line.trim();

    // Top level (indent 0)
    if (indent === 0 && trimmed.endsWith(':')) {
      section = trimmed.replace(':', '');
      subsection = '';
      currentStep = '';
      continue;
    }

    // Level 2 (indent 2)
    if (indent === 2 && trimmed.endsWith(':') && section === 'casework_timing') {
      subsection = trimmed.replace(':', '');
      currentStep = '';
      continue;
    }

    // Level 4 (indent 4) — step names under 'steps'
    if (indent === 4 && trimmed.endsWith(':') && subsection === 'steps') {
      currentStep = trimmed.replace(':', '');
      continue;
    }

    // Baseline value lines
    if (trimmed.startsWith('baseline:') && section === 'casework_timing') {
      const currentVal = parseInt(trimmed.split(':')[1].trim());
      let newVal = currentVal;

      if (subsection === 'total_seconds' && avgs.total > 0) {
        newVal = capShift(currentVal, avgs.total, maxShift);
        if (newVal !== currentVal) updates.push('total: ' + currentVal + '->' + newVal);
      } else if (subsection === 'steps' && currentStep && avgs.steps[currentStep]) {
        newVal = capShift(currentVal, avgs.steps[currentStep], maxShift);
        if (newVal !== currentVal) updates.push(currentStep + ': ' + currentVal + '->' + newVal);
      }

      if (newVal !== currentVal) {
        lines[i] = line.replace(/baseline: *[0-9]+/, 'baseline: ' + newVal);
      }
    }
  }

  // Update timestamp
  const today = new Date().toISOString().split('T')[0];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('updated_at:')) {
      lines[i] = 'updated_at: "' + today + '"';
      break;
    }
  }

  if (updates.length > 0) {
    fs.writeFileSync(process.env.BU_BASELINES, lines.join('\n'));
    console.log('UPDATED|' + updates.join(', '));
  } else {
    console.log('NO_CHANGE|baselines already optimal');
  }
NODEUPD
)

log_info "Update result: $UPDATED"
rm -f "$AVGS_FILE2"

# ============================================================
# Output
# ============================================================
if echo "$UPDATED" | grep -q "^UPDATED"; then
  CHANGES=$(echo "$UPDATED" | sed 's/^UPDATED|//')
  log_pass "Baselines updated: $CHANGES"
  echo "BASELINE_UPDATE|$PROBE_ID|updated|$CHANGES"
else
  log_info "No baseline changes needed"
  echo "BASELINE_UPDATE|$PROBE_ID|no_change|baselines_optimal"
fi

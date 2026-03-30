#!/usr/bin/env bash
# tests/executors/state-writer.sh — Atomic write utility for state.json
#
# Usage:
#   echo '{"phase":"TEST",...}' | bash tests/executors/state-writer.sh
#   bash tests/executors/state-writer.sh < /path/to/new-state.json
#   bash tests/executors/state-writer.sh --file /path/to/new-state.json
#   bash tests/executors/state-writer.sh --merge < partial.json
#   echo '{"phase":"FIX","round":5}' | bash tests/executors/state-writer.sh --merge
#
# Modes:
#   (default)  Full replace — input must be a complete state object.
#              Auto-downgrades to merge if truncation detected (>50% field loss).
#   --merge    Shallow merge — reads current state.json, overlays input fields,
#              writes the merged result. Safe for partial updates.
#
# Reads JSON from stdin (or --file), validates it, writes atomically via
# temp file + rename. This prevents corrupted state.json from partial writes.
#
# Exit codes: 0 = success, 1 = validation failed, 2 = write failed
# Output: STATE_WRITE|<status>|<detail>

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

STATE_FILE="$TESTS_ROOT/state.json"

# ============================================================
# Arguments
# ============================================================
INPUT_FILE=""
MERGE_MODE="false"
while [ $# -gt 0 ]; do
  case "${1}" in
    --file)
      INPUT_FILE="${2:-}"
      shift 2 || { echo "STATE_WRITE|failed|--file requires a path"; exit 1; }
      ;;
    --merge)
      MERGE_MODE="true"
      shift
      ;;
    *)
      shift
      ;;
  esac
done

# ============================================================
# Read input into temp file (avoids stdin/pipe issues with node)
# ============================================================
TMP_INPUT=$(mktemp)
trap "rm -f '$TMP_INPUT'" EXIT

if [ -n "$INPUT_FILE" ]; then
  if [ ! -f "$INPUT_FILE" ]; then
    echo "STATE_WRITE|failed|input file not found: $INPUT_FILE"
    exit 1
  fi
  cp "$INPUT_FILE" "$TMP_INPUT"
else
  # Read from stdin
  cat > "$TMP_INPUT"
fi

if [ ! -s "$TMP_INPUT" ]; then
  echo "STATE_WRITE|failed|empty input"
  exit 1
fi

# ============================================================
# Validate + atomic write via node (paths via env vars)
# ============================================================
WRITE_RESULT=$(STATE_PATH="$STATE_FILE" INPUT_PATH="$TMP_INPUT" MERGE="$MERGE_MODE" \
  NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
const fs = require('fs');

const input = fs.readFileSync(process.env.INPUT_PATH, 'utf8');
const stateFile = process.env.STATE_PATH;
const mergeMode = process.env.MERGE === 'true';

// Step 1: Validate input JSON
let parsed;
try {
  parsed = JSON.parse(input);
} catch(e) {
  console.log('INVALID|' + e.message);
  process.exit(1);
}

if (!parsed || typeof parsed !== 'object') {
  console.log('INVALID|not an object');
  process.exit(1);
}

// Step 2: Read current state (needed for merge + truncation guard)
let current = null;
try {
  current = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
} catch(e) {
  // No existing state or corrupted — skip guards
}

// Step 3: Merge or replace

// Helper: apply deep merge logic (stats, roundJourney, phaseHistory append)
function deepMerge(base, overlay) {
  const result = { ...base, ...overlay };
  // Deep merge for known nested objects
  if (overlay.stats && base.stats) {
    result.stats = { ...base.stats, ...overlay.stats };
  }
  if (overlay.roundJourney && base.roundJourney) {
    result.roundJourney = { ...base.roundJourney };
    for (const [phase, val] of Object.entries(overlay.roundJourney)) {
      result.roundJourney[phase] = { ...(base.roundJourney[phase] || {}), ...val };
    }
  }
  // Array append for phaseHistory (not replace)
  if (overlay.phaseHistory && Array.isArray(overlay.phaseHistory)) {
    if (overlay.phaseHistory.length === 0) {
      // Empty array = explicit reset (round transition)
      result.phaseHistory = [];
    } else {
      const existing = Array.isArray(base.phaseHistory) ? base.phaseHistory : [];
      result.phaseHistory = existing.concat(overlay.phaseHistory);
    }
  }
  return result;
}

let final;
let autoMerged = false;
if (mergeMode) {
  // Shallow merge: current fields preserved, input fields overlaid
  if (!current) {
    // No existing state — require full object
    const requiredFields = ['phase', 'round', 'stats'];
    const missing = requiredFields.filter(f => !(f in parsed));
    if (missing.length > 0) {
      console.log('INVALID|merge with no existing state — missing required fields: ' + missing.join(', '));
      process.exit(1);
    }
    final = parsed;
  } else {
    final = deepMerge(current, parsed);
  }
} else {
  // Full replace mode
  const requiredFields = ['phase', 'round', 'stats'];
  const missing = requiredFields.filter(f => !(f in parsed));
  if (missing.length > 0) {
    console.log('INVALID|missing required fields: ' + missing.join(', '));
    process.exit(1);
  }

  // Truncation guard: auto-downgrade to merge if new object drops >50% of fields
  if (current) {
    const currentKeys = Object.keys(current).length;
    const newKeys = Object.keys(parsed).length;
    if (currentKeys > 5 && newKeys < currentKeys * 0.5) {
      // Auto-downgrade: merge instead of replace to prevent data loss
      autoMerged = true;
      const warning = 'TRUNCATION_GUARD: field count ' + currentKeys + ' → ' + newKeys + ' (>50% loss). Auto-downgraded to merge.';
      process.stderr.write('[WARN] ' + warning + '\n');
      final = deepMerge(current, parsed);
    } else {
      final = parsed;
    }
  } else {
    final = parsed;
  }
}

// Step 4: Validate final object has required fields
const finalRequired = ['phase', 'round', 'stats'];
const finalMissing = finalRequired.filter(f => !(f in final));
if (finalMissing.length > 0) {
  console.log('INVALID|final object missing required fields: ' + finalMissing.join(', '));
  process.exit(1);
}

// Step 5: Pretty-print with consistent formatting
const formatted = JSON.stringify(final, null, 2) + '\n';

// Step 6: Atomic write — write to temp file in same directory, then rename
const tmpFile = stateFile + '.write-tmp-' + process.pid;
try {
  fs.writeFileSync(tmpFile, formatted, 'utf8');
  fs.renameSync(tmpFile, stateFile);
  const mode = mergeMode ? 'merge' : (autoMerged ? 'auto-merge' : 'replace');
  console.log('OK|' + formatted.length + ' bytes (' + mode + ', ' + Object.keys(final).length + ' fields)');
} catch(e) {
  try { fs.unlinkSync(tmpFile); } catch(e2) {}
  console.log('WRITE_ERROR|' + e.message);
  process.exit(2);
}
" 2>"$TMP_INPUT.stderr")

WRITE_STATUS=$(echo "$WRITE_RESULT" | cut -d'|' -f1)
WRITE_DETAIL=$(echo "$WRITE_RESULT" | cut -d'|' -f2-)
STDERR_OUTPUT=""
[ -f "$TMP_INPUT.stderr" ] && STDERR_OUTPUT=$(cat "$TMP_INPUT.stderr") && rm -f "$TMP_INPUT.stderr"

case "$WRITE_STATUS" in
  OK)
    # Check if auto-merge was triggered → log warning + record learning
    if echo "$WRITE_DETAIL" | grep -q "auto-merge"; then
      log_warn "state-writer: truncation guard triggered — auto-downgraded to merge"
      [ -n "$STDERR_OUTPUT" ] && log_warn "$STDERR_OUTPUT"
      # Record learning for post-mortem (async, don't block)
      if [ -x "$SCRIPT_DIR/learnings-writer.sh" ]; then
        bash "$SCRIPT_DIR/learnings-writer.sh" \
          "state-truncation-automerge-$(date +%Y%m%d-%H%M%S)" \
          "test" \
          "Truncation guard auto-merged: a caller passed a partial state object in full-replace mode. $STDERR_OUTPUT" \
          "Auto-downgraded to merge. Caller should use --merge flag explicitly." 2>/dev/null &
      fi
      echo "STATE_WRITE|auto-merged|$WRITE_DETAIL"
    else
      echo "STATE_WRITE|success|$WRITE_DETAIL"
    fi
    exit 0
    ;;
  INVALID)
    log_fail "state-writer: validation failed: $WRITE_DETAIL"
    echo "STATE_WRITE|invalid|$WRITE_DETAIL"
    exit 1
    ;;
  WRITE_ERROR)
    log_fail "state-writer: write failed: $WRITE_DETAIL"
    echo "STATE_WRITE|write_error|$WRITE_DETAIL"
    exit 2
    ;;
  *)
    log_fail "state-writer: unexpected result: $WRITE_RESULT"
    echo "STATE_WRITE|failed|unexpected"
    exit 1
    ;;
esac

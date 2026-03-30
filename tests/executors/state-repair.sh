#!/usr/bin/env bash
# tests/executors/state-repair.sh — Auto-repair corrupted state.json
#
# Usage: bash tests/executors/state-repair.sh
# Exit codes: 0 = repaired or already valid, 1 = unrepairable
#
# Called by test-supervisor when health-check.sh fails.
# Attempts common JSON fixes: trailing commas, duplicate entries,
# stray brackets, truncated JSON.
# Uses atomic write (temp + rename) for the repaired output.
#
# Output: REPAIR|<status>|<detail>
#   status: valid (no repair needed), repaired, failed

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

STATE_FILE="$TESTS_ROOT/state.json"
BACKUP_DIR="$RESULTS_DIR/backups"

# ============================================================
# Check prerequisites
# ============================================================
if [ ! -f "$STATE_FILE" ]; then
  echo "REPAIR|failed|state.json not found"
  exit 1
fi

# ============================================================
# Step 1: Try parsing as-is (pass path via env var, POSIX format)
# ============================================================
PARSE_RESULT=$(STATE_PATH="$STATE_FILE" NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
  try {
    JSON.parse(require('fs').readFileSync(process.env.STATE_PATH, 'utf8'));
    console.log('valid');
  } catch(e) {
    console.log('invalid|' + e.message);
  }
" 2>/dev/null || echo "invalid|node_error")

if [ "$(echo "$PARSE_RESULT" | cut -d'|' -f1)" = "valid" ]; then
  echo "REPAIR|valid|state.json is valid JSON, no repair needed"
  exit 0
fi

PARSE_ERROR=$(echo "$PARSE_RESULT" | cut -d'|' -f2-)
log_warn "state.json is corrupted: $PARSE_ERROR"

# ============================================================
# Step 2: Backup corrupted file
# ============================================================
mkdir -p "$BACKUP_DIR"
BACKUP_FILE="$BACKUP_DIR/state-$(date +%Y%m%d-%H%M%S)-corrupted.json"
cp "$STATE_FILE" "$BACKUP_FILE"
log_info "Backed up corrupted file to: $BACKUP_FILE"

# ============================================================
# Step 3: Attempt repair via node (all paths via env vars)
# ============================================================
REPAIR_RESULT=$(STATE_PATH="$STATE_FILE" NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
const fs = require('fs');

const stateFile = process.env.STATE_PATH;
let raw = fs.readFileSync(stateFile, 'utf8');
const fixes = [];

// ---- Fix 1: Remove trailing commas before ] or } ----
const beforeTrailing = raw;
raw = raw.replace(/,(\s*[}\]])/g, '\$1');
if (raw !== beforeTrailing) fixes.push('removed trailing commas');

// ---- Fix 2: Remove stray ] or } not matching structure ----
function tryRemoveAt(str, pos) {
  const ch = str[pos];
  if (ch === ']' || ch === '}' || ch === ',') {
    return str.slice(0, pos) + str.slice(pos + 1);
  }
  return null;
}

// ---- Fix 3: Add missing comma between } and { ----
const beforeComma = raw;
raw = raw.replace(/}(\s*)\{/g, '},\$1{');
if (raw !== beforeComma) fixes.push('added missing commas between objects');

// ---- Try parsing after basic fixes ----
function writeRepaired(parsed) {
  for (const queueName of ['testQueue', 'fixQueue', 'verifyQueue', 'regressionQueue']) {
    if (Array.isArray(parsed[queueName])) {
      const seen = new Set();
      const before = parsed[queueName].length;
      parsed[queueName] = parsed[queueName].filter(item => {
        const key = item.testId || JSON.stringify(item);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      const removed = before - parsed[queueName].length;
      if (removed > 0) fixes.push('removed ' + removed + ' duplicate(s) in ' + queueName);
    }
  }
  const tmpFile = stateFile + '.repair-tmp';
  fs.writeFileSync(tmpFile, JSON.stringify(parsed, null, 2) + '\n');
  fs.renameSync(tmpFile, stateFile);
  console.log('REPAIRED|' + (fixes.length > 0 ? fixes.join('; ') : 'reformatted'));
  process.exit(0);
}

try {
  const parsed = JSON.parse(raw);
  if (parsed && typeof parsed === 'object' && parsed.phase && parsed.stats) {
    writeRepaired(parsed);
  } else {
    throw new Error('parsed but not a valid state object');
  }
} catch(e1) {
  // Basic fixes weren't enough, try positional removal
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      JSON.parse(raw);
      break;
    } catch(e) {
      const match = e.message.match(/position (\d+)/);
      if (!match) break;
      const pos = parseInt(match[1]);
      const fixed = tryRemoveAt(raw, pos);
      if (fixed) {
        raw = fixed;
        fixes.push('removed stray char at position ' + pos);
      } else {
        break;
      }
    }
  }

  // Try one more time
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.phase) {
      writeRepaired(parsed);
    }
  } catch(e2) {
    // ---- Last resort: truncation recovery ----
    let depth = 0;
    let lastValidEnd = -1;
    let inString = false;
    let escaped = false;
    for (let i = 0; i < raw.length; i++) {
      const ch = raw[i];
      if (escaped) { escaped = false; continue; }
      if (ch === '\\\\') { escaped = true; continue; }
      if (ch === '\"') { inString = !inString; continue; }
      if (inString) continue;
      if (ch === '{') depth++;
      if (ch === '}') { depth--; if (depth === 0) lastValidEnd = i; }
    }

    if (lastValidEnd > 0) {
      const truncated = raw.slice(0, lastValidEnd + 1);
      try {
        const parsed = JSON.parse(truncated);
        if (parsed && parsed.phase) {
          fixes.push('truncation recovery at position ' + lastValidEnd);
          writeRepaired(parsed);
        }
      } catch(e3) {}
    }

    console.log('FAILED|' + e2.message);
    process.exit(1);
  }
}
" 2>/dev/null)

REPAIR_STATUS=$(echo "$REPAIR_RESULT" | cut -d'|' -f1)
REPAIR_DETAIL=$(echo "$REPAIR_RESULT" | cut -d'|' -f2-)

if [ "$REPAIR_STATUS" = "REPAIRED" ]; then
  log_pass "state.json repaired: $REPAIR_DETAIL"
  echo "REPAIR|repaired|$REPAIR_DETAIL"
  exit 0
elif [ "$REPAIR_STATUS" = "FAILED" ]; then
  log_fail "state.json repair failed: $REPAIR_DETAIL"
  log_info "Corrupted backup at: $BACKUP_FILE"
  echo "REPAIR|failed|$REPAIR_DETAIL"
  exit 1
else
  log_fail "Unexpected repair result: $REPAIR_RESULT"
  echo "REPAIR|failed|unexpected result"
  exit 1
fi

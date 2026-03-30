#!/usr/bin/env bash
# tests/executors/seed-recorder.sh — Record synthetic test seed on failure
#
# Usage: bash tests/executors/seed-recorder.sh <profile> <seed> <testId> <failure-desc>
# Example: bash tests/executors/seed-recorder.sh edge-corrupted-meta 12345 wf-compliance-edge "JSON parse error not caught"
#
# Appends to the synthetic_seeds section of tests/learnings.yaml.
# De-duplicates by profile+seed+testId combo.
# Called by e2e-runner.sh when a synthetic test fails.

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# ============================================================
# Arguments
# ============================================================
PROFILE="${1:?Usage: seed-recorder.sh <profile> <seed> <testId> <failure-desc>}"
SEED="${2:?Missing seed}"
TEST_ID="${3:?Missing testId}"
FAILURE="${4:?Missing failure description}"

LEARNINGS_FILE="$TESTS_ROOT/learnings.yaml"

if [ ! -f "$LEARNINGS_FILE" ]; then
  log_fail "learnings.yaml not found at $LEARNINGS_FILE"
  exit 1
fi

log_info "=== Seed Recorder ==="
log_info "Profile: $PROFILE"
log_info "Seed: $SEED"
log_info "Test: $TEST_ID"

# ============================================================
# De-duplicate: check if this profile+seed+testId already recorded
# ============================================================
# Simple grep: if same profile AND seed AND testId exist nearby, skip
if grep -q "seed: $SEED" "$LEARNINGS_FILE" 2>/dev/null; then
  # More precise check: same profile+seed combo
  if grep -A1 "profile: $PROFILE" "$LEARNINGS_FILE" 2>/dev/null | grep -q "seed: $SEED"; then
    log_warn "Seed $SEED for profile $PROFILE already recorded — skipping"
    echo "SEED_SKIP|$PROFILE|$SEED|duplicate"
    exit 0
  fi
fi

# ============================================================
# Append to synthetic_seeds section
# ============================================================
# The section is at the end of learnings.yaml as:
#   synthetic_seeds: []
# or:
#   synthetic_seeds:
#     - profile: ...
#
# Strategy: if "synthetic_seeds: []" exists, replace with populated version.
# Otherwise, append entry at end.

DISCOVERED_AT=$(date -u +%Y-%m-%d)

# Escape double quotes in failure description
ESCAPED_FAILURE=$(echo "$FAILURE" | sed 's/"/\\"/g')

if grep -q "synthetic_seeds: \[\]" "$LEARNINGS_FILE" 2>/dev/null; then
  # Replace empty array with first entry
  LEARNINGS_WIN=$(cygpath -w "$LEARNINGS_FILE" 2>/dev/null || echo "$LEARNINGS_FILE")
  LEARNINGS_WIN="$LEARNINGS_WIN" PROFILE="$PROFILE" SEED="$SEED" TEST_ID="$TEST_ID" \
  FAILURE="$ESCAPED_FAILURE" DISCOVERED_AT="$DISCOVERED_AT" \
  node -e "
    const fs = require('fs');
    const fp = process.env.LEARNINGS_WIN;
    let content = fs.readFileSync(fp, 'utf8');
    const entry = [
      'synthetic_seeds:',
      '  - profile: ' + process.env.PROFILE,
      '    seed: ' + process.env.SEED,
      '    testId: ' + process.env.TEST_ID,
      '    failure: \"' + process.env.FAILURE + '\"',
      '    discoveredAt: \"' + process.env.DISCOVERED_AT + '\"'
    ].join('\n');
    content = content.replace('synthetic_seeds: []', entry);
    fs.writeFileSync(fp, content);
    console.log('Replaced empty synthetic_seeds with first entry');
  "
else
  # Append new entry at end of file
  cat >> "$LEARNINGS_FILE" << SEED_EOF
  - profile: $PROFILE
    seed: $SEED
    testId: $TEST_ID
    failure: "$ESCAPED_FAILURE"
    discoveredAt: "$DISCOVERED_AT"
SEED_EOF
fi

log_pass "Seed recorded: profile=$PROFILE seed=$SEED testId=$TEST_ID"
echo "SEED_RECORDED|$PROFILE|$SEED|$TEST_ID"

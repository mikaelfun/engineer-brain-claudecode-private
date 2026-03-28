#!/usr/bin/env bash
# tests/executors/pattern-detector.sh — Detect failure patterns for self-healing
#
# Usage: bash tests/executors/pattern-detector.sh [round]
# Example: bash tests/executors/pattern-detector.sh 0
#
# Reads: tests/state.json (fixQueue)
#        tests/results/{round}-{testId}.json (failure details)
#
# Outputs (to stdout, one per detected pattern):
#   PATTERN_DETECT|{pattern-id}|{type:systemic|stuck}|{signature}|{affected-test-ids-comma}|{suggested-action}
#
# Exit code: 0 = patterns detected, 1 = no patterns found
#
# Self-healing integration:
#   - systemic: 2+ tests share same failure signature AND at least one has retryCount >= 2
#   - stuck: single test failed 2+ times with same signature unchanged

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# ============================================================
# Arguments
# ============================================================
ROUND="${1:-0}"

STATE_FILE="$TESTS_ROOT/state.json"

if [ ! -f "$STATE_FILE" ]; then
  log_fail "state.json not found"
  exit 1
fi

log_info "=== Pattern Detector ==="
log_info "Round: $ROUND"

# ============================================================
# Read fixQueue from state.json
# ============================================================
FIX_QUEUE_JSON=$(NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
  const s = JSON.parse(require('fs').readFileSync('$STATE_FILE','utf8'));
  console.log(JSON.stringify(s.fixQueue || []));
" 2>/dev/null)

FIX_QUEUE_COUNT=$(echo "$FIX_QUEUE_JSON" | NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
  const q = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
  console.log(q.length);
" 2>/dev/null)

if [ "$FIX_QUEUE_COUNT" = "0" ]; then
  log_info "fixQueue is empty — no patterns to detect"
  exit 1
fi

log_info "fixQueue has $FIX_QUEUE_COUNT items"

# ============================================================
# Extract failure signatures from result files
# For each test in fixQueue, read its result file and extract
# the first failed assertion's signature
# ============================================================
# Output: JSON array of { testId, retryCount, signature, reason }
SIGNATURES_JSON=$(NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
  const fs = require('fs');
  const path = require('path');

  const fixQueue = $FIX_QUEUE_JSON;
  const resultsDir = '$RESULTS_DIR';
  const round = $ROUND;

  const signatures = [];

  for (const item of fixQueue) {
    const testId = item.testId;
    const retryCount = item.retryCount || 0;
    const reason = item.reason || '';

    // Try to read result file
    const resultFile = path.join(resultsDir, round + '-' + testId + '.json');
    let signature = 'unknown';

    try {
      const result = JSON.parse(fs.readFileSync(resultFile, 'utf8'));
      if (result.assertions && Array.isArray(result.assertions)) {
        // Find first failed assertion
        const failed = result.assertions.find(a => !a.pass);
        if (failed) {
          // Normalize signature: {failure-type}:{assertion-name-normalized}
          const name = (failed.name || 'unknown').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
          const actual = String(failed.actual || '').toLowerCase();

          if (actual.includes('timeout')) {
            signature = 'timeout:' + name;
          } else if (actual.includes('409') || actual.includes('active operation')) {
            signature = 'lock_conflict:' + name;
          } else if (actual.match(/^\d{3}$/)) {
            signature = 'http_status_' + actual + ':' + name;
          } else {
            signature = 'assertion:' + name;
          }
        }
      }
    } catch (e) {
      // Result file may not exist for this round
      // Try to extract signature from reason string
      if (reason.includes('timeout') || reason.includes('timed out')) {
        signature = 'timeout:poll_for_completion';
      } else if (reason.includes('409') || reason.includes('active operation')) {
        signature = 'lock_conflict:operation_lock';
      }
    }

    signatures.push({ testId, retryCount, signature, reason });
  }

  console.log(JSON.stringify(signatures));
" 2>/dev/null)

log_info "Extracted signatures: $(echo "$SIGNATURES_JSON" | NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
  const sigs = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
  sigs.forEach(s => console.log('  ' + s.testId + ': ' + s.signature + ' (retry=' + s.retryCount + ')'));
" 2>/dev/null)"

# ============================================================
# Cluster into patterns: systemic and stuck
# ============================================================
PATTERNS_JSON=$(echo "$SIGNATURES_JSON" | NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
  const signatures = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
  const patterns = [];
  let patternNum = 0;

  // Group by signature
  const groups = {};
  for (const s of signatures) {
    if (!groups[s.signature]) groups[s.signature] = [];
    groups[s.signature].push(s);
  }

  // Systemic: 2+ tests with same signature, at least one retryCount >= 2
  for (const [sig, tests] of Object.entries(groups)) {
    if (sig === 'unknown') continue;
    if (tests.length >= 2) {
      const hasRetried = tests.some(t => t.retryCount >= 2);
      if (hasRetried) {
        patternNum++;
        const patternId = 'PAT-' + String(patternNum).padStart(3, '0');
        const testIds = tests.map(t => t.testId);
        patterns.push({
          id: patternId,
          type: 'systemic',
          signature: sig,
          affectedTestIds: testIds,
          suggestedAction: 'skip_all_and_create_framework_fix',
          diagnosis: 'Multiple tests (' + testIds.join(', ') + ') failing with same signature: ' + sig
        });
      }
    }
  }

  // Stuck: single test with retryCount >= 2 and consistent signature
  for (const s of signatures) {
    if (s.signature === 'unknown') continue;
    if (s.retryCount >= 2) {
      // Check if already covered by a systemic pattern
      const isSystemic = patterns.some(p =>
        p.type === 'systemic' && p.affectedTestIds.includes(s.testId)
      );
      if (!isSystemic) {
        patternNum++;
        const patternId = 'PAT-' + String(patternNum).padStart(3, '0');
        patterns.push({
          id: patternId,
          type: 'stuck',
          signature: s.signature,
          affectedTestIds: [s.testId],
          suggestedAction: 'skip_test',
          diagnosis: 'Test ' + s.testId + ' stuck: failed ' + s.retryCount + ' times with signature: ' + s.signature
        });
      }
    }
  }

  console.log(JSON.stringify(patterns));
" 2>/dev/null)

# ============================================================
# Output detected patterns
# ============================================================
PATTERN_COUNT=$(echo "$PATTERNS_JSON" | NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
  const p = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
  console.log(p.length);
" 2>/dev/null)

if [ "$PATTERN_COUNT" = "0" ]; then
  log_info "No failure patterns detected"
  exit 1
fi

log_info "Detected $PATTERN_COUNT pattern(s)"

# Output each pattern in pipe-delimited format
echo "$PATTERNS_JSON" | NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
  const patterns = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
  for (const p of patterns) {
    const testIds = p.affectedTestIds.join(',');
    console.log('PATTERN_DETECT|' + p.id + '|' + p.type + '|' + p.signature + '|' + testIds + '|' + p.suggestedAction);
  }
" 2>/dev/null

exit 0

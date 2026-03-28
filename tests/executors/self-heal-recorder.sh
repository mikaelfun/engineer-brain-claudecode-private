#!/usr/bin/env bash
# tests/executors/self-heal-recorder.sh — Record self-heal actions
#
# Usage: bash tests/executors/self-heal-recorder.sh <pattern-id> <type> <signature> <affected-tests> <diagnosis> <actions>
# Example: bash tests/executors/self-heal-recorder.sh PAT-001 systemic "timeout:poll" "fast-path,state-routing" "Poll bug" "skipped 2 tests, created framework fix"
#
# Writes: tests/results/fixes/{pattern-id}-self-heal.md

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# ============================================================
# Arguments
# ============================================================
PATTERN_ID="${1:?Usage: self-heal-recorder.sh <pattern-id> <type> <signature> <affected-tests> <diagnosis> <actions>}"
PATTERN_TYPE="${2:?Missing pattern type (systemic|stuck)}"
SIGNATURE="${3:?Missing signature}"
AFFECTED_TESTS="${4:?Missing affected test IDs (comma-separated)}"
DIAGNOSIS="${5:?Missing diagnosis}"
ACTIONS="${6:?Missing actions taken}"

FIXES_DIR="$RESULTS_DIR/fixes"
mkdir -p "$FIXES_DIR"

HEAL_FILE="$FIXES_DIR/${PATTERN_ID}-self-heal.md"
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)

log_info "=== Self-Heal Recorder ==="
log_info "Pattern: $PATTERN_ID ($PATTERN_TYPE)"
log_info "Signature: $SIGNATURE"
log_info "Affected: $AFFECTED_TESTS"

cat > "$HEAL_FILE" << HEALEOF
# Self-Heal Record: $PATTERN_ID

- **Pattern Type:** $PATTERN_TYPE
- **Signature:** $SIGNATURE
- **Affected Tests:** $AFFECTED_TESTS
- **Diagnosis:** $DIAGNOSIS
- **Actions Taken:** $ACTIONS
- **Timestamp:** $TIMESTAMP

## Details

The test loop detected a $PATTERN_TYPE failure pattern (\`$SIGNATURE\`) affecting tests: $AFFECTED_TESTS.

### Actions
$ACTIONS

### Resolution
This pattern was automatically handled by the self-heal system. Affected tests were skipped and$([ "$PATTERN_TYPE" = "systemic" ] && echo " a framework-level fix item was created to address the root cause." || echo " the issue was recorded for future analysis.")
HEALEOF

log_pass "Self-heal record written: $HEAL_FILE"
echo "SELF_HEAL_RECORDED|$PATTERN_ID|$PATTERN_TYPE|$SIGNATURE|$AFFECTED_TESTS"

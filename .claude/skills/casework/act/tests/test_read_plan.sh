#!/usr/bin/env bash
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
SCRIPT="$HERE/../scripts/read-plan.sh"
PASS=0; FAIL=0

run_test() {
  local name="$1" fixture="$2" expected_var="$3" expected_val="$4"
  local output
  output=$(bash "$SCRIPT" "$HERE/fixtures/$fixture")
  eval "$output"
  local actual="${!expected_var}"
  if [ "$actual" = "$expected_val" ]; then
    echo "  ✓ $name"; PASS=$((PASS+1))
  else
    echo "  ✗ $name: expected $expected_var='$expected_val', got '$actual'"; FAIL=$((FAIL+1))
  fi
}

echo "=== read-plan.sh tests ==="

# T1: no actions
run_test "no-actions count" "plan-no-actions.json" "ACTION_COUNT" "0"

# T2: troubleshooter only
run_test "ts-only count" "plan-troubleshooter-only.json" "ACTION_COUNT" "1"
output=$(bash "$SCRIPT" "$HERE/fixtures/plan-troubleshooter-only.json")
eval "$output"
[ "$ACTION_0_TYPE" = "troubleshooter" ] && { echo "  ✓ ts-only type"; PASS=$((PASS+1)); } || { echo "  ✗ ts-only type"; FAIL=$((FAIL+1)); }

# T3: IR-first detection
run_test "ir-first status" "plan-ir-first.json" "ACTUAL_STATUS" "pending-engineer"
output=$(bash "$SCRIPT" "$HERE/fixtures/plan-ir-first.json")
eval "$output"
[ "$IR_FIRST" = "1" ] && { echo "  ✓ ir-first flag"; PASS=$((PASS+1)); } || { echo "  ✗ ir-first flag: got '$IR_FIRST'"; FAIL=$((FAIL+1)); }

# T4: dependency chain
output=$(bash "$SCRIPT" "$HERE/fixtures/plan-with-dependency.json")
eval "$output"
[ "$ACTION_1_DEPENDS_ON" = "troubleshooter" ] && { echo "  ✓ dependency"; PASS=$((PASS+1)); } || { echo "  ✗ dependency"; FAIL=$((FAIL+1)); }

echo "=== $PASS passed, $FAIL failed ==="
[ $FAIL -eq 0 ]

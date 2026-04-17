#!/usr/bin/env bash
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
SCRIPT="$HERE/../scripts/derive-change-path.sh"
FIXTURES="$HERE/../../assess/tests/fixtures"
PASS=0; FAIL=0

run_test() {
  local name="$1" fixture="$2" expected="$3"
  local actual
  actual=$(bash "$SCRIPT" "$fixture")
  if [ "$actual" = "$expected" ]; then
    echo "  ✓ $name"; PASS=$((PASS+1))
  else
    echo "  ✗ $name: expected '$expected', got '$actual'"; FAIL=$((FAIL+1))
  fi
}

echo "=== derive-change-path.sh tests ==="
run_test "delta-ok" "$FIXTURES/data-refresh-output-full.json" "CHANGED"
run_test "delta-empty" "$FIXTURES/data-refresh-output-delta-empty.json" "NO_CHANGE"
run_test "teams-only" "$FIXTURES/data-refresh-output-teams-only.json" "CHANGED"
run_test "missing-file" "/nonexistent/path.json" "CHANGED"

echo "=== $PASS passed, $FAIL failed ==="
[ $FAIL -eq 0 ]

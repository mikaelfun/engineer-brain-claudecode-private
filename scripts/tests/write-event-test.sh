#!/usr/bin/env bash
# Tests for skills/casework/scripts/write-event.sh
# Covers: basic write, tmp cleanup, concurrent safety (50 writers).
#
# NOTE: Uses a relative ./scripts/tests/tmp-* dir instead of mktemp -d to
# avoid the Git Bash /tmp vs Windows python3 /tmp path mismatch documented
# in spike-notes.md.
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
SRC_ROOT="$(cd "$HERE/../.." && pwd)"
SCRIPT="$SRC_ROOT/skills/casework/scripts/write-event.sh"

# Use a RELATIVE path for tmp — Windows python3 misinterprets Git Bash's
# /c/... POSIX paths (see spike-notes.md "Atomic Write Validation").
cd "$SRC_ROOT"
TMP_REL="scripts/tests/tmp-write-event-$$"
rm -rf "$TMP_REL"; mkdir -p "$TMP_REL"
trap 'rm -rf "$TMP_REL"' EXIT

if [ ! -x "$SCRIPT" ] && [ ! -f "$SCRIPT" ]; then
  echo "FAIL: $SCRIPT does not exist"
  exit 1
fi

# Test 1: basic write
bash "$SCRIPT" "$TMP_REL/e.json" '{"task":"d365","status":"active"}'
python3 -c "import json; assert json.load(open('$TMP_REL/e.json'))['status']=='active'"
echo "PASS: basic write"

# Test 2: no tmp residual
shopt -s nullglob
residual=( "$TMP_REL"/e.json.tmp* )
if [ ${#residual[@]} -eq 0 ]; then
  echo "PASS: tmp cleaned"
else
  echo "FAIL: tmp residual: ${residual[*]}"
  exit 1
fi

# Test 3: concurrent write survives (50 workers)
for i in $(seq 1 50); do
  ( bash "$SCRIPT" "$TMP_REL/c.json" "{\"n\":$i}" ) &
done
wait
python3 -c "import json; json.load(open('$TMP_REL/c.json'))"
echo "PASS: concurrent write survives"

# Test 4: after concurrent, still no tmp residual
residual2=( "$TMP_REL"/c.json.tmp* )
if [ ${#residual2[@]} -eq 0 ]; then
  echo "PASS: concurrent tmp cleaned"
else
  echo "FAIL: concurrent tmp residual: ${residual2[*]}"
  exit 1
fi

echo "ALL PASS"

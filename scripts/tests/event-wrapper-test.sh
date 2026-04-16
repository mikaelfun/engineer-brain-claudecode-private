#!/usr/bin/env bash
# Tests for skills/casework/scripts/event-wrapper.sh.
# Uses relative TMP dir (Git Bash/Windows python3 compat, see spike-notes.md).
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
SRC_ROOT="$(cd "$HERE/../.." && pwd)"
WRAPPER="$SRC_ROOT/skills/casework/scripts/event-wrapper.sh"

cd "$SRC_ROOT"
TMP_REL="scripts/tests/tmp-event-wrapper-$$"
rm -rf "$TMP_REL"; mkdir -p "$TMP_REL"
trap 'rm -rf "$TMP_REL"' EXIT

if [ ! -f "$WRAPPER" ]; then
  echo "FAIL: $WRAPPER missing"
  exit 1
fi

# Test 1: success path — status=completed, durationMs > 0
bash "$WRAPPER" ok "$TMP_REL" -- sleep 0.1
python3 - <<PY
import json
d = json.load(open("$TMP_REL/ok.json"))
assert d["task"] == "ok", d
assert d["status"] == "completed", d
assert d["durationMs"] > 0, d
assert "startedAt" in d and "completedAt" in d, d
print("PASS: success path")
PY

# Test 2: failure path — wrapper preserves exit code, status=failed
set +e
bash "$WRAPPER" bad "$TMP_REL" -- bash -c 'exit 7'
WRAPPER_EXIT=$?
set -e
if [ "$WRAPPER_EXIT" != "7" ]; then
  echo "FAIL: expected exit 7, got $WRAPPER_EXIT"
  exit 1
fi
python3 - <<PY
import json
d = json.load(open("$TMP_REL/bad.json"))
assert d["status"] == "failed", d
assert d["error"] == "exit 7", d
print("PASS: failure path (exit preserved)")
PY

# Test 3: missing -- separator still works (grace path)
bash "$WRAPPER" nosep "$TMP_REL" bash -c 'true'
python3 - <<PY
import json
d = json.load(open("$TMP_REL/nosep.json"))
assert d["status"] == "completed", d
print("PASS: without -- separator")
PY

echo "ALL PASS"

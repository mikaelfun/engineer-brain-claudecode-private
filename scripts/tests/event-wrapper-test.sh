#!/usr/bin/env bash
# Tests for .claude/skills/casework/scripts/event-wrapper.sh.
# Uses relative TMP dir (Git Bash/Windows python3 compat, see spike-notes.md).
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
SRC_ROOT="$(cd "$HERE/../.." && pwd)"
WRAPPER="$SRC_ROOT/.claude/skills/casework/scripts/event-wrapper.sh"

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
assert "delta" not in d, d  # no side file written → no delta field
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

# Test 4: delta injection — child writes EVENT_DELTA_FILE, wrapper merges into completed
bash "$WRAPPER" withdelta "$TMP_REL" -- bash -c \
  'echo "{\"newEmails\":3,\"newNotes\":1}" > "$EVENT_DELTA_FILE"; exit 0'
python3 - <<PY
import json, os
d = json.load(open("$TMP_REL/withdelta.json"))
assert d["status"] == "completed", d
assert d.get("delta") == {"newEmails":3,"newNotes":1}, d
# side file must be cleaned up
assert not os.path.exists("$TMP_REL/withdelta.delta.json"), "delta side file not cleaned"
print("PASS: delta injection into completed event")
PY

# Test 5: delta injection on failure — wrapper still merges delta into failed event
set +e
bash "$WRAPPER" faildelta "$TMP_REL" -- bash -c \
  'echo "{\"partial\":2}" > "$EVENT_DELTA_FILE"; exit 3'
FE=$?
set -e
[ "$FE" = "3" ] || { echo "FAIL: faildelta expected exit 3 got $FE"; exit 1; }
python3 - <<PY
import json
d = json.load(open("$TMP_REL/faildelta.json"))
assert d["status"] == "failed", d
assert d.get("delta") == {"partial":2}, d
assert d["error"] == "exit 3", d
print("PASS: delta merged on failure too")
PY

# Test 6: malformed delta is dropped, not propagated — event stays valid JSON
bash "$WRAPPER" baddelta "$TMP_REL" -- bash -c \
  'echo "this is not json {{" > "$EVENT_DELTA_FILE"; exit 0' 2>/dev/null
python3 - <<PY
import json, os
d = json.load(open("$TMP_REL/baddelta.json"))   # must parse
assert d["status"] == "completed", d
assert "delta" not in d, "malformed delta should not enter event"
assert not os.path.exists("$TMP_REL/baddelta.delta.json")
print("PASS: malformed delta dropped, event still valid")
PY

# Test 7: stale delta from previous run must not leak into next run
echo '{"stale":true}' > "$TMP_REL/stale.delta.json"
bash "$WRAPPER" stale "$TMP_REL" -- bash -c 'exit 0'   # child writes nothing
python3 - <<PY
import json
d = json.load(open("$TMP_REL/stale.json"))
assert "delta" not in d, f"stale delta leaked: {d}"
print("PASS: stale delta pre-wipe")
PY

echo "ALL PASS"

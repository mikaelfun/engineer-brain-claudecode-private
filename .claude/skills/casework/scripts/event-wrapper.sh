#!/usr/bin/env bash
# event-wrapper.sh — generic active/completed/failed event emitter around a command.
#
# Usage: event-wrapper.sh <task-name> <event-dir> -- <command> [args...]
#
# Emits <event-dir>/<task-name>.json via the sibling write-event.sh:
#   start    → {"status":"active", startedAt}
#   success  → {"status":"completed", startedAt, completedAt, durationMs, [delta]}
#   failure  → {"status":"failed", startedAt, durationMs, error:"exit N"}
#
# Delta injection (casework v2 Task 5 contract):
#   Wrapper exports EVENT_DELTA_FILE=<event-dir>/<task>.delta.json to the child.
#   If the child writes valid JSON to that path before exiting, wrapper merges
#   it into the completed event under `"delta": {...}` and removes the file.
#   Children that don't care about delta can safely ignore the env var.
#
# Preserves the wrapped command's exit code so callers see pass/fail
# as if the wrapper weren't there.
set -uo pipefail

TASK="${1:?task required}"; shift
EVENT_DIR="${1:?event-dir required}"; shift
if [ "${1:-}" = "--" ]; then shift; fi

if [ $# -eq 0 ]; then
  echo "event-wrapper: no command supplied" >&2
  exit 2
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
WRITE_EVENT="$SCRIPT_DIR/write-event.sh"

if [ ! -f "$WRITE_EVENT" ]; then
  echo "event-wrapper: write-event.sh not found at $WRITE_EVENT" >&2
  exit 2
fi

mkdir -p "$EVENT_DIR"

START_TS=$(date -u +%FT%TZ)
START_NS=$(date +%s%N)

DELTA_FILE="$EVENT_DIR/$TASK.delta.json"
rm -f "$DELTA_FILE"  # stale-proof: previous run's delta must not leak

bash "$WRITE_EVENT" "$EVENT_DIR/$TASK.json" \
  "{\"task\":\"$TASK\",\"status\":\"active\",\"startedAt\":\"$START_TS\"}"

export EVENT_DELTA_FILE="$DELTA_FILE"

set +e
"$@"
EXIT=$?
set -e

END_TS=$(date -u +%FT%TZ)
DUR_MS=$(( ($(date +%s%N) - START_NS) / 1000000 ))

# Read optional delta JSON from side file. Validate minimally — if it doesn't
# parse as JSON we silently drop it rather than corrupt the event file.
DELTA_SNIPPET=""
if [ -s "$DELTA_FILE" ]; then
  if python3 -c "import json,sys; json.load(open(sys.argv[1]))" "$DELTA_FILE" 2>/dev/null; then
    DELTA_JSON=$(python3 -c "import json,sys; print(json.dumps(json.load(open(sys.argv[1]))))" "$DELTA_FILE" 2>/dev/null || echo "")
    [ -n "$DELTA_JSON" ] && DELTA_SNIPPET=",\"delta\":$DELTA_JSON"
  else
    echo "event-wrapper: $TASK delta file exists but is not valid JSON, dropping" >&2
  fi
  rm -f "$DELTA_FILE"
fi

if [ $EXIT -eq 0 ]; then
  bash "$WRITE_EVENT" "$EVENT_DIR/$TASK.json" \
    "{\"task\":\"$TASK\",\"status\":\"completed\",\"startedAt\":\"$START_TS\",\"completedAt\":\"$END_TS\",\"durationMs\":$DUR_MS$DELTA_SNIPPET}"
else
  bash "$WRITE_EVENT" "$EVENT_DIR/$TASK.json" \
    "{\"task\":\"$TASK\",\"status\":\"failed\",\"startedAt\":\"$START_TS\",\"durationMs\":$DUR_MS,\"error\":\"exit $EXIT\"$DELTA_SNIPPET}"
fi
exit $EXIT

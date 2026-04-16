#!/usr/bin/env bash
# event-wrapper.sh — generic active/completed/failed event emitter around a command.
#
# Usage: event-wrapper.sh <task-name> <event-dir> -- <command> [args...]
#
# Emits <event-dir>/<task-name>.json via the sibling write-event.sh:
#   start    → {"status":"active", startedAt}
#   success  → {"status":"completed", startedAt, completedAt, durationMs}
#   failure  → {"status":"failed", startedAt, durationMs, error:"exit N"}
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

bash "$WRITE_EVENT" "$EVENT_DIR/$TASK.json" \
  "{\"task\":\"$TASK\",\"status\":\"active\",\"startedAt\":\"$START_TS\"}"

set +e
"$@"
EXIT=$?
set -e

END_TS=$(date -u +%FT%TZ)
DUR_MS=$(( ($(date +%s%N) - START_NS) / 1000000 ))

if [ $EXIT -eq 0 ]; then
  bash "$WRITE_EVENT" "$EVENT_DIR/$TASK.json" \
    "{\"task\":\"$TASK\",\"status\":\"completed\",\"startedAt\":\"$START_TS\",\"completedAt\":\"$END_TS\",\"durationMs\":$DUR_MS}"
else
  bash "$WRITE_EVENT" "$EVENT_DIR/$TASK.json" \
    "{\"task\":\"$TASK\",\"status\":\"failed\",\"startedAt\":\"$START_TS\",\"durationMs\":$DUR_MS,\"error\":\"exit $EXIT\"}"
fi
exit $EXIT

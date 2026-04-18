#!/usr/bin/env bash
# event-wrapper.sh — wrap a command with state.json progress tracking
#
# Usage: event-wrapper.sh <task-name> <case-dir> -- <command> [args...]
#
# Note: Interface changed from v1. Second arg is now case-dir (was event-dir).
# The --step is always 'data-refresh' and --subtask is the task-name.
set -uo pipefail

TASK="${1:?task required}"; shift
CASE_DIR="${1:?case-dir required}"; shift
if [ "${1:-}" = "--" ]; then shift; fi

if [ $# -eq 0 ]; then
  echo "event-wrapper: no command supplied" >&2
  exit 2
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
UPDATE_STATE="$SCRIPT_DIR/update-state.py"

if [ ! -f "$UPDATE_STATE" ]; then
  echo "event-wrapper: update-state.py not found at $UPDATE_STATE" >&2
  exit 2
fi

START_NS=$(date +%s%N)

python3 "$UPDATE_STATE" --case-dir "$CASE_DIR" --step data-refresh --subtask "$TASK" --status active

set +e
"$@"
EXIT=$?
set -e

DUR_MS=$(( ($(date +%s%N) - START_NS) / 1000000 ))

if [ $EXIT -eq 0 ]; then
  python3 "$UPDATE_STATE" --case-dir "$CASE_DIR" --step data-refresh --subtask "$TASK" --status completed --duration-ms "$DUR_MS"
else
  python3 "$UPDATE_STATE" --case-dir "$CASE_DIR" --step data-refresh --subtask "$TASK" --status failed
fi
exit $EXIT

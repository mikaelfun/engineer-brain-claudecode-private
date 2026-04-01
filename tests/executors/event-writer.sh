#!/usr/bin/env bash
# event-writer.sh — Append structured events to events.jsonl
# Usage: bash tests/executors/event-writer.sh --type <type> --impact <P0-P3> --area <area> --detail <detail> [--result pass|fail] [--method direct|competitive] [--chosen <agent>] [--confidence <0-1>] [--delta <string>] [--fixed true|false]
#
# Output: EVENT_WRITE|success|<type>|<impact>
# Appends one JSONL line to tests/results/events.jsonl

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
EVENTS_FILE="$SCRIPT_DIR/../results/events.jsonl"

# Parse arguments
TYPE="" IMPACT="" AREA="" DETAIL="" RESULT="" METHOD="" CHOSEN="" CONFIDENCE="" DELTA="" FIXED=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --type)      TYPE="$2"; shift 2 ;;
    --impact)    IMPACT="$2"; shift 2 ;;
    --area)      AREA="$2"; shift 2 ;;
    --detail)    DETAIL="$2"; shift 2 ;;
    --result)    RESULT="$2"; shift 2 ;;
    --method)    METHOD="$2"; shift 2 ;;
    --chosen)    CHOSEN="$2"; shift 2 ;;
    --confidence) CONFIDENCE="$2"; shift 2 ;;
    --delta)     DELTA="$2"; shift 2 ;;
    --fixed)     FIXED="$2"; shift 2 ;;
    *) echo "EVENT_WRITE|error|unknown arg: $1" >&2; exit 1 ;;
  esac
done

# Validate required fields
if [[ -z "$TYPE" || -z "$IMPACT" || -z "$AREA" || -z "$DETAIL" ]]; then
  echo "EVENT_WRITE|error|missing required fields (--type --impact --area --detail)" >&2
  exit 1
fi

# Validate type
VALID_TYPES="feature_verified bug_discovered bug_fixed fix_failed perf_regression perf_improved ui_issue flow_broken needs_human"
if ! echo "$VALID_TYPES" | grep -qw "$TYPE"; then
  echo "EVENT_WRITE|error|invalid type: $TYPE" >&2
  exit 1
fi

# Validate impact
if [[ ! "$IMPACT" =~ ^P[0-3]$ ]]; then
  echo "EVENT_WRITE|error|invalid impact: $IMPACT (must be P0-P3)" >&2
  exit 1
fi

# Ensure results directory exists
mkdir -p "$(dirname "$EVENTS_FILE")"

# Build JSON line
TS=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Escape detail for JSON (handle quotes and backslashes)
DETAIL_ESCAPED=$(printf '%s' "$DETAIL" | sed 's/\\/\\\\/g; s/"/\\"/g; s/\t/\\t/g')

JSON="{\"ts\":\"$TS\",\"type\":\"$TYPE\",\"impact\":\"$IMPACT\",\"area\":\"$AREA\",\"detail\":\"$DETAIL_ESCAPED\""

# Add optional fields
[[ -n "$RESULT" ]]     && JSON="$JSON,\"result\":\"$RESULT\""
[[ -n "$METHOD" ]]     && JSON="$JSON,\"method\":\"$METHOD\""
[[ -n "$CHOSEN" ]]     && JSON="$JSON,\"chosen\":\"$CHOSEN\""
[[ -n "$CONFIDENCE" ]] && JSON="$JSON,\"confidence\":$CONFIDENCE"
[[ -n "$DELTA" ]]      && JSON="$JSON,\"delta\":\"$DELTA\""
[[ -n "$FIXED" ]]      && JSON="$JSON,\"fixed\":$FIXED"

JSON="$JSON}"

# Atomic append (>> is atomic for lines < PIPE_BUF on POSIX)
echo "$JSON" >> "$EVENTS_FILE"

echo "EVENT_WRITE|success|$TYPE|$IMPACT"

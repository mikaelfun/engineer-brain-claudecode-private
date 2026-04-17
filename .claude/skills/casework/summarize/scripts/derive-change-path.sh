#!/usr/bin/env bash
# derive-change-path.sh — Map deltaStatus to changePath for inspection-writer
# Usage: bash derive-change-path.sh <data-refresh-output.json>
# Output: CHANGED | NO_CHANGE
set -euo pipefail
INPUT="${1:-}"

if [ -z "$INPUT" ] || [ ! -f "$INPUT" ]; then
  echo "CHANGED"
  exit 0
fi

DELTA=$(python3 -c "
import json, sys
try:
    d = json.load(open(sys.argv[1], encoding='utf-8'))
    print(d.get('deltaStatus', 'DELTA_OK'))
except:
    print('DELTA_OK')
" "$INPUT")

if [ "$DELTA" = "DELTA_EMPTY" ]; then
  echo "NO_CHANGE"
else
  echo "CHANGED"
fi

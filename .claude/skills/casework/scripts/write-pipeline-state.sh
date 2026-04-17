#!/usr/bin/env bash
# write-pipeline-state.sh — Write .casework/pipeline-state.json for dashboard SSE
#
# Usage:
#   bash write-pipeline-state.sh <case-dir> <current-step> [completed-steps...]
#
# Example:
#   bash write-pipeline-state.sh ./cases/active/123 assess data-refresh
#   → data-refresh=completed, assess=active, act=pending, summarize=pending
#
# The file-watcher picks up pipeline-state.json changes and emits
# 'patrol-pipeline-update' SSE events to the dashboard.

set -uo pipefail

CASE_DIR="${1:?usage: write-pipeline-state.sh <case-dir> <current-step> [completed-steps...]}"
CURRENT_STEP="${2:?usage: write-pipeline-state.sh <case-dir> <current-step> [completed-steps...]}"
shift 2
COMPLETED_STEPS=("$@")

CASE_NUMBER=$(basename "$CASE_DIR")
OUT_DIR="$CASE_DIR/.casework"
mkdir -p "$OUT_DIR"

# Build JSON via python (reliable cross-platform)
python3 -c "
import json, os, sys
from datetime import datetime

current = '$CURRENT_STEP'
completed = [s for s in '${COMPLETED_STEPS[*]:-}'.split() if s]
all_steps = ['data-refresh', 'assess', 'act', 'summarize']

steps = {}
for s in all_steps:
    if s in completed:
        steps[s] = {'status': 'completed'}
    elif s == current:
        steps[s] = {'status': 'active'}
    else:
        steps[s] = {'status': 'pending'}

state = {
    'caseNumber': '$CASE_NUMBER',
    'currentStep': current,
    'steps': steps,
    'updatedAt': datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ'),
}

p = os.path.join(r'$OUT_DIR', 'pipeline-state.json')
tmp = p + '.tmp'
with open(tmp, 'w', encoding='utf-8') as f:
    json.dump(state, f, ensure_ascii=False, indent=2)
os.replace(tmp, p)
" 2>/dev/null

#!/usr/bin/env bash
# patrol-finalize.sh — Extract patrol SKILL.md Steps 7-8
#
# Handles: orphan cleanup, aggregating phase, case result aggregation,
#          patrol-state.json writing, phase completion, lock release.
#
# Usage:
#   bash .claude/skills/patrol/scripts/patrol-finalize.sh \
#     --cases-root ./cases --patrol-dir ../data/.patrol \
#     --cases "case1,case2" --source cli [--started-at "ISO"]
#
# Exit code: always 0 (best-effort cleanup)
# stdout:   single JSON object at the very end
# stderr:   all progress/debug logs

set -uo pipefail

# ── Helpers ──────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
log() { echo "[patrol-finalize] $*" >&2; }

# ── Argument parsing ─────────────────────────────────────────────────
CASES_ROOT=""
PATROL_DIR=""
CASES_CSV=""
SOURCE="cli"
STARTED_AT=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --cases-root)  CASES_ROOT="$2"; shift 2 ;;
    --patrol-dir)  PATROL_DIR="$2"; shift 2 ;;
    --cases)       CASES_CSV="$2";  shift 2 ;;
    --source)      SOURCE="$2";     shift 2 ;;
    --started-at)  STARTED_AT="$2"; shift 2 ;;
    *) log "Unknown arg: $1"; shift ;;
  esac
done

if [[ -z "$CASES_ROOT" || -z "$PATROL_DIR" ]]; then
  log "ERROR: --cases-root and --patrol-dir are required"
  echo '{"status":"error","error":"missing required args"}'
  exit 0
fi

# Default startedAt to now if not provided
if [[ -z "$STARTED_AT" ]]; then
  STARTED_AT="$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
fi

# ── Step 1: Cleanup orphan agency processes ──────────────────────────
log "Cleaning up orphan agency processes..."
AGENCY_COUNT=$(tasklist 2>/dev/null | grep -c -i agency.exe || echo 0)
if [ "$AGENCY_COUNT" -gt 0 ]; then
  log "Found $AGENCY_COUNT agency.exe processes, killing..."
  taskkill /IM agency.exe /F 2>/dev/null || true
fi

# ── Step 2: update-phase → aggregating ───────────────────────────────
log "Phase → aggregating"
python3 "$SCRIPT_DIR/update-phase.py" \
  --patrol-dir "$PATROL_DIR" --phase aggregating >/dev/null 2>&1 || true

# ── Step 3: Aggregate case results ───────────────────────────────────
log "Aggregating case results..."

# Split CSV into array
IFS=',' read -ra CASE_LIST <<< "$CASES_CSV"

TOTAL_CASES=${#CASE_LIST[@]}
PROCESSED=0
CASE_RESULTS_JSON="["

for i in "${!CASE_LIST[@]}"; do
  CASE_NUM="${CASE_LIST[$i]}"
  # Trim whitespace
  CASE_NUM="$(echo "$CASE_NUM" | tr -d '[:space:]')"
  [[ -z "$CASE_NUM" ]] && continue

  STATE_FILE="${CASES_ROOT}/active/${CASE_NUM}/.casework/state.json"
  CASE_STATUS="incomplete"

  if [[ -f "$STATE_FILE" ]]; then
    # Use python3 to parse state.json and determine status
    CASE_STATUS=$(python3 -c "
import json, sys
try:
    data = json.load(open(sys.argv[1], encoding='utf-8'))
    steps = data.get('steps', {})
    if not steps:
        print('incomplete')
        sys.exit(0)
    # steps can be dict {name: {status:...}} or list [{status:...}]
    if isinstance(steps, dict):
        statuses = [s.get('status','') for s in steps.values() if isinstance(s, dict)]
    elif isinstance(steps, list):
        statuses = [s.get('status','') for s in steps if isinstance(s, dict)]
    else:
        print('incomplete')
        sys.exit(0)
    if not statuses:
        print('incomplete')
    elif any(s == 'failed' for s in statuses):
        print('failed')
    elif all(s in ('completed','skipped') for s in statuses):
        print('completed')
    else:
        print('incomplete')
except Exception as e:
    print('incomplete', file=sys.stderr)
    print('incomplete')
" "$STATE_FILE" 2>/dev/null)
    # Fallback if python3 returned empty
    CASE_STATUS="${CASE_STATUS:-incomplete}"
  else
    log "  state.json not found for $CASE_NUM, marking incomplete"
  fi

  log "  $CASE_NUM → $CASE_STATUS"
  PROCESSED=$((PROCESSED + 1))

  # Build JSON array element
  if [[ $i -gt 0 ]]; then
    CASE_RESULTS_JSON="${CASE_RESULTS_JSON},"
  fi
  CASE_RESULTS_JSON="${CASE_RESULTS_JSON}{\"caseNumber\":\"${CASE_NUM}\",\"status\":\"${CASE_STATUS}\"}"
done

CASE_RESULTS_JSON="${CASE_RESULTS_JSON}]"

# ── Step 4: Write patrol-state.json ──────────────────────────────────
COMPLETED_AT="$(date -u '+%Y-%m-%dT%H:%M:%SZ')"

log "Writing patrol-state.json (processedCases=$PROCESSED)"

# Read changedCases from patrol-progress.json if available
CHANGED_CASES="$PROCESSED"
PROGRESS_FILE="${PATROL_DIR}/patrol-progress.json"
if [[ -f "$PROGRESS_FILE" ]]; then
  CHANGED_CASES_READ=$(python3 -c "
import json, sys
try:
    data = json.load(open(sys.argv[1], encoding='utf-8'))
    print(data.get('changedCases', $PROCESSED))
except:
    print($PROCESSED)
" "$PROGRESS_FILE" 2>/dev/null)
  CHANGED_CASES="${CHANGED_CASES_READ:-$PROCESSED}"
fi

python3 -c "
import json, sys
state = {
    'startedAt': sys.argv[1],
    'completedAt': sys.argv[2],
    'source': sys.argv[3],
    'totalCases': int(sys.argv[4]),
    'changedCases': int(sys.argv[5]),
    'processedCases': int(sys.argv[6]),
    'phase': 'completed',
    'caseResults': json.loads(sys.argv[7])
}
with open(sys.argv[8], 'w', encoding='utf-8') as f:
    json.dump(state, f, indent=2, ensure_ascii=False)
" "$STARTED_AT" "$COMPLETED_AT" "$SOURCE" "$TOTAL_CASES" "$CHANGED_CASES" "$PROCESSED" "$CASE_RESULTS_JSON" "${PATROL_DIR}/patrol-state.json" 2>/dev/null

log "patrol-state.json written"

# ── Step 5: update-phase → completed ─────────────────────────────────
log "Phase → completed"
python3 "$SCRIPT_DIR/update-phase.py" \
  --patrol-dir "$PATROL_DIR" --phase completed \
  --processed-cases "$PROCESSED" >/dev/null 2>&1 || true

# ── Step 6: Release lock ─────────────────────────────────────────────
log "Releasing patrol lock"
rm -f "$PATROL_DIR/patrol.lock"

# ── Output (single JSON to stdout) ───────────────────────────────────
echo "{\"status\":\"ok\",\"processedCases\":${PROCESSED},\"caseResults\":${CASE_RESULTS_JSON}}"

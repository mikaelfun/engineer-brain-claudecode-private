#!/usr/bin/env bash
# patrol-init.sh — Patrol Steps 1-5 orchestrator.
#
# Replaces SKILL.md Steps 1-5 (config, mutex, case listing, filtering,
# archiving, warmup) with a single deterministic script. Outputs one JSON
# to stdout for the LLM agent to consume.
#
# Usage:
#   bash .claude/skills/patrol/scripts/patrol-init.sh \
#     --cases-root ./cases --patrol-dir ../data/.patrol \
#     --source cli [--force]
#
# If --cases-root or --patrol-dir not provided, reads from config.json.
#
# Output (stdout): single JSON object
#   OK:         {"status":"ok","cases":[...],...}
#   Early-exit: {"status":"early-exit","cases":[],...}
#   Error:      {"status":"error","error":"..."}
#
# Exit: 0 = ok/early-exit, 1 = error
#
# CRITICAL: All progress/debug logs go to STDERR. stdout is reserved for JSON.
set -uo pipefail

# ── Helpers ──
HERE="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$HERE/../../../.." && pwd)"
to_win() { cygpath -m "$1" 2>/dev/null || echo "$1"; }
PROJECT_ROOT_WIN="$(to_win "$PROJECT_ROOT")"

log() { echo "$*" >&2; }

die_json() {
  local msg="$1"
  local escaped
  escaped=$(echo "$msg" | python3 -c "import json,sys; print(json.dumps(sys.stdin.read().strip()))" 2>/dev/null || echo "\"$msg\"")
  echo "{\"status\":\"error\",\"error\":$escaped}"
  exit 1
}

update_phase() {
  # All update-phase.py stdout (PHASE|...) goes to /dev/null so it doesn't
  # pollute our JSON output. Stderr is left open for regression warnings.
  python3 "$HERE/update-phase.py" "$@" >/dev/null
}

# ── Args ──
CASES_ROOT="" PATROL_DIR="" SOURCE="cli" FORCE="false" MODE="normal"
while [[ $# -gt 0 ]]; do
  case "$1" in
    --cases-root)  CASES_ROOT="$2"; shift 2 ;;
    --patrol-dir)  PATROL_DIR="$2"; shift 2 ;;
    --source)      SOURCE="$2"; shift 2 ;;
    --force)       FORCE="true"; shift ;;
    --mode)        MODE="$2"; shift 2 ;;
    *) shift ;;
  esac
done

# ── Step 1: Read config.json ──
CONFIG_FILE="$PROJECT_ROOT_WIN/config.json"
if [ ! -f "$CONFIG_FILE" ]; then
  die_json "config.json not found at $CONFIG_FILE"
fi

# Fill missing args from config.json
read_cfg() {
  python3 -c "
import json
cfg = json.load(open(r'$CONFIG_FILE', encoding='utf-8'))
print(cfg.get('casesRoot', './cases'))
print(cfg.get('patrolDir', '../data/.patrol'))
print(cfg.get('patrolSkipHours', 3))
" 2>/dev/null
}

CFG_LINES=$(read_cfg)
CFG_CASES_ROOT=$(echo "$CFG_LINES" | sed -n '1p')
CFG_PATROL_DIR=$(echo "$CFG_LINES" | sed -n '2p')
SKIP_HOURS=$(echo "$CFG_LINES" | sed -n '3p')

[ -z "$CASES_ROOT" ] && CASES_ROOT="$CFG_CASES_ROOT"
[ -z "$PATROL_DIR" ] && PATROL_DIR="$CFG_PATROL_DIR"
[ -z "$SKIP_HOURS" ] && SKIP_HOURS=3

# Resolve pwsh command from config.json → platform.pwsh
PWSH_CMD=$(python3 -c "import json; print(json.load(open(r'$CONFIG_FILE',encoding='utf-8')).get('platform',{}).get('pwsh','pwsh'))" 2>/dev/null || echo "pwsh")

log "🚀 patrol-init.sh: casesRoot=$CASES_ROOT patrolDir=$PATROL_DIR skipHours=$SKIP_HOURS force=$FORCE source=$SOURCE"

# ── Step 2: Mutex check ──
mkdir -p "$PATROL_DIR"

if [ -f "$PATROL_DIR/patrol.lock" ]; then
  LOCK_SOURCE=$(python3 -c "
import json
try: print(json.load(open('$PATROL_DIR/patrol.lock', encoding='utf-8')).get('source','unknown'))
except: print('unknown')
" 2>/dev/null || echo "unknown")
  # WebUI mode: lock was written by patrol-orchestrator.ts, not a conflict
  if [ "$SOURCE" = "webui" ] && [ "$LOCK_SOURCE" = "webui" ]; then
    log "📌 WebUI mode: lock exists (managed by orchestrator), proceeding"
  else
    echo "{\"status\":\"error\",\"error\":\"Patrol already running (source=$LOCK_SOURCE)\"}"
    exit 1
  fi
fi

# ── Step 3: Write lock file + clear previous progress ──
NOW_ISO=$(date -u +%Y-%m-%dT%H:%M:%SZ)
FORCE_JSON="false"
[ "$FORCE" = "true" ] && FORCE_JSON="true"

# ── Generate patrol runId + create run directory ──
RUN_ID=$(date +%y%m%d-%H%M)
RUN_DIR="$PATROL_DIR/runs/$RUN_ID"
SCRIPTS_DIR="$RUN_DIR/scripts"
mkdir -p "$SCRIPTS_DIR"
log "📁 Run directory: $RUN_DIR"

echo "{\"source\":\"$SOURCE\",\"pid\":$$,\"startedAt\":\"$NOW_ISO\",\"force\":$FORCE_JSON,\"runId\":\"$RUN_ID\"}" > "$PATROL_DIR/patrol.lock"
rm -f "$PATROL_DIR/patrol-progress.json"
echo "{\"runId\":\"$RUN_ID\",\"startedAt\":\"$NOW_ISO\",\"source\":\"$SOURCE\",\"force\":$FORCE_JSON}" > "$RUN_DIR/run-info.json"

# ── Step 4: update-phase → starting, then discovering ──
update_phase --patrol-dir "$PATROL_DIR" --phase starting --source "$SOURCE"
update_phase --patrol-dir "$PATROL_DIR" --phase discovering --source "$SOURCE"

# ── Step 5: Get active case list from D365 ──
log "⏳ Querying D365 active cases..."
ACTIVE_JSON_TMP="$PATROL_DIR/.active-cases-tmp.json"
ACTIVE_RAW_TMP="$PATROL_DIR/.active-cases-raw.tmp"
$PWSH_CMD -NoProfile -File "$PROJECT_ROOT/.claude/skills/d365-case-ops/scripts/list-active-cases.ps1" -OutputJson > "$ACTIVE_RAW_TMP" 2>&1
LIST_EXIT=$?
cp "$ACTIVE_RAW_TMP" "$SCRIPTS_DIR/list-active-cases.log" 2>/dev/null || true

# Extract only the JSON line (Write-Host log lines pollute stdout in non-console pwsh)
python3 -c "
import json
for line in open('$ACTIVE_RAW_TMP', encoding='utf-8'):
    line = line.strip()
    if line.startswith('[') or line.startswith('{'):
        json.loads(line)  # validate
        print(line)
        break
" > "$ACTIVE_JSON_TMP" 2>/dev/null

ACTIVE_CASES_JSON=""
[ -f "$ACTIVE_JSON_TMP" ] && ACTIVE_CASES_JSON=$(cat "$ACTIVE_JSON_TMP")

if [ $LIST_EXIT -ne 0 ] || [ -z "$ACTIVE_CASES_JSON" ]; then
  # Cleanup lock + tmp on failure
  rm -f "$PATROL_DIR/patrol.lock" "$ACTIVE_JSON_TMP"
  die_json "list-active-cases.ps1 failed (exit=$LIST_EXIT)"
fi

# Extract case numbers from JSON array (read from temp file, not shell variable)
TOTAL_FOUND=$(python3 -c "
import json
try:
    cases = json.load(open('$ACTIVE_JSON_TMP', encoding='utf-8'))
    print(len(cases))
except:
    print(0)
" 2>/dev/null)

ALL_CASE_NUMBERS=$(python3 -c "
import json
try:
    cases = json.load(open('$ACTIVE_JSON_TMP', encoding='utf-8'))
    for c in cases:
        tn = c.get('ticketnumber', c.get('TicketNumber', ''))
        if tn: print(tn)
except: pass
" 2>/dev/null)

log "📋 D365 returned $TOTAL_FOUND active cases"

# ── Step 6: update-phase → filtering ──
update_phase --patrol-dir "$PATROL_DIR" --phase filtering --total-found "$TOTAL_FOUND"

# ── Step 7: Filter cases ──
CHANGED_CASES_LIST=""
SKIPPED_COUNT=0
CHANGED_COUNT=0

if [ "$MODE" = "new-cases" ]; then
  # New-case mode: only cases without local directory
  FILTER_RESULT=$(python3 -c "
import os, sys

cases_root = '$CASES_ROOT'

case_numbers = []
for line in sys.stdin:
    cn = line.strip()
    if cn: case_numbers.append(cn)

changed = []
skipped = 0

for cn in case_numbers:
    case_dir = os.path.join(cases_root, 'active', cn)
    if not os.path.isdir(case_dir):
        changed.append(cn)
    else:
        skipped += 1

print(skipped)
for cn in changed:
    print(cn)
" <<< "$ALL_CASE_NUMBERS" 2>/dev/null)

  SKIPPED_COUNT=$(echo "$FILTER_RESULT" | head -1)
  CHANGED_CASES_LIST=$(echo "$FILTER_RESULT" | tail -n +2)
  CHANGED_COUNT=$(echo "$CHANGED_CASES_LIST" | grep -c . || true)
  log "🆕 New-case mode: $CHANGED_COUNT new cases, $SKIPPED_COUNT already cached"
elif [ "$FORCE" = "true" ]; then
  # Force mode: include all cases
  CHANGED_CASES_LIST="$ALL_CASE_NUMBERS"
  CHANGED_COUNT=$TOTAL_FOUND
  SKIPPED_COUNT=0
  log "🔓 Force mode: including all $TOTAL_FOUND cases"
else
  # Normal mode: filter by lastInspected age
  FILTER_RESULT=$(python3 -c "
import json, os, sys, time

cases_root = '$CASES_ROOT'
skip_hours = int('$SKIP_HOURS')
now = time.time()

# Read all case numbers from stdin
case_numbers = []
for line in sys.stdin:
    cn = line.strip()
    if cn: case_numbers.append(cn)

changed = []
skipped = 0

for cn in case_numbers:
    meta_path = os.path.join(cases_root, 'active', cn, 'casework-meta.json')
    include = True
    try:
        if os.path.exists(meta_path):
            meta = json.load(open(meta_path, encoding='utf-8'))
            last = meta.get('lastInspected', '')
            if last:
                # Parse ISO timestamp (handles +08:00 and Z)
                import re
                # Normalize: remove colon in timezone offset for strptime
                ts = last
                # Handle +HH:MM timezone
                tz_match = re.search(r'[+-]\d{2}:\d{2}$', ts)
                if tz_match:
                    tz_str = tz_match.group().replace(':', '')
                    ts = ts[:tz_match.start()] + tz_str
                    t = time.mktime(time.strptime(ts, '%Y-%m-%dT%H:%M:%S%z').timetuple())
                elif ts.endswith('Z'):
                    from datetime import datetime, timezone
                    dt = datetime.strptime(ts, '%Y-%m-%dT%H:%M:%SZ').replace(tzinfo=timezone.utc)
                    t = dt.timestamp()
                else:
                    t = time.mktime(time.strptime(ts[:19], '%Y-%m-%dT%H:%M:%S'))
                age_hours = (now - t) / 3600
                if age_hours < skip_hours:
                    include = False
    except Exception:
        pass  # Missing/corrupt meta → include

    if include:
        changed.append(cn)
    else:
        skipped += 1

# Output: first line = skipped count, remaining lines = case numbers
print(skipped)
for cn in changed:
    print(cn)
" <<< "$ALL_CASE_NUMBERS" 2>/dev/null)

  SKIPPED_COUNT=$(echo "$FILTER_RESULT" | head -1)
  CHANGED_CASES_LIST=$(echo "$FILTER_RESULT" | tail -n +2)
  CHANGED_COUNT=$(echo "$CHANGED_CASES_LIST" | grep -c . || true)
  log "🔍 Filter: $CHANGED_COUNT changed, $SKIPPED_COUNT skipped (skipHours=$SKIP_HOURS)"
fi

# ── Step 8: Archive detection (skip in new-cases mode — no local dirs to archive) ──
ARCHIVED_COUNT=0
TRANSFERRED_COUNT=0

if [ "$MODE" = "new-cases" ]; then
  log "⏭️ New-case mode: skipping archive detection"
else
log "⏳ Running archive/transfer detection..."

DETECT_JSON_TMP="$PATROL_DIR/.detect-status-tmp.json"
$PWSH_CMD -NoProfile -File "$PROJECT_ROOT/.claude/skills/d365-case-ops/scripts/detect-case-status.ps1" \
  -CasesRoot "$CASES_ROOT" -ActiveCasesJson "$ACTIVE_CASES_JSON" > "$DETECT_JSON_TMP" 2>&1
[ -f "$DETECT_JSON_TMP" ] && cp "$DETECT_JSON_TMP" "$SCRIPTS_DIR/detect-case-status.log" 2>/dev/null || true

ARCHIVED_COUNT=0
TRANSFERRED_COUNT=0

if [ -s "$DETECT_JSON_TMP" ]; then
  # Process archive/transfer results (read from temp file for safety)
  ARCHIVE_RESULT=$(DETECT_FILE="$DETECT_JSON_TMP" CASES_ROOT_PY="$CASES_ROOT" PATROL_DIR_PY="$PATROL_DIR" \
    python3 -c "
import json, os, sys, shutil, time

detect_file = os.environ['DETECT_FILE']
cases_root = os.environ['CASES_ROOT_PY']
patrol_dir = os.environ['PATROL_DIR_PY']

try:
    items = json.load(open(detect_file, encoding='utf-8'))
except:
    # detect-case-status.ps1 mixes log lines with JSON — extract JSON lines only
    try:
        raw = open(detect_file, encoding='utf-8').read()
        items = []
        for line in raw.strip().splitlines():
            line = line.strip()
            if line.startswith('{'):
                try:
                    items.append(json.loads(line))
                except:
                    pass
        if not items:
            # Try parsing entire content as JSON array
            items = json.loads(raw)
    except:
        items = []

if not isinstance(items, list):
    items = []

archived = 0
transferred = 0
archived_cases = []
transferred_cases = []
now_iso = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())

for item in items:
    cn = item.get('caseNumber', '')
    status = item.get('status', '')
    reason = item.get('reason', '')
    evidence = item.get('closureEmailEvidence', '')
    if not cn or not status: continue

    src = os.path.join(cases_root, 'active', cn)
    if not os.path.isdir(src): continue

    if status == 'archived':
        dst_parent = os.path.join(cases_root, 'archived')
        archived += 1
        archived_cases.append(cn)
    elif status == 'transferred':
        dst_parent = os.path.join(cases_root, 'transfer')
        transferred += 1
        transferred_cases.append(cn)
    else:
        continue

    dst = os.path.join(dst_parent, cn)
    os.makedirs(dst_parent, exist_ok=True)

    # cp+rm pattern (NOT mv — Windows NTFS issue)
    try:
        if os.path.exists(dst):
            shutil.rmtree(dst)
        shutil.copytree(src, dst)
        shutil.rmtree(src)
    except Exception as e:
        print(f'MOVE_ERROR|{cn}|{e}', file=sys.stderr)
        continue

    # Append to archive-log.jsonl
    to_dir = 'archived' if status == 'archived' else 'transfer'
    log_entry = json.dumps({
        'timestamp': now_iso,
        'caseNumber': cn,
        'status': status,
        'reason': reason,
        'closureEmailEvidence': evidence,
        'from': 'active/',
        'to': f'{to_dir}/'
    }, ensure_ascii=False)
    log_path = os.path.join(patrol_dir, 'archive-log.jsonl')
    with open(log_path, 'a', encoding='utf-8') as f:
        f.write(log_entry + '\n')

# Output: archived_count|transferred_count|comma_separated_moved_cases
moved = archived_cases + transferred_cases
print(f'{archived}|{transferred}|{chr(44).join(moved)}')
" 2>&1)

  ARCHIVED_COUNT=$(echo "$ARCHIVE_RESULT" | cut -d'|' -f1)
  TRANSFERRED_COUNT=$(echo "$ARCHIVE_RESULT" | cut -d'|' -f2)
  MOVED_CASES=$(echo "$ARCHIVE_RESULT" | cut -d'|' -f3)

  # Remove archived/transferred cases from changed list
  if [ -n "$MOVED_CASES" ]; then
    CHANGED_CASES_LIST=$(python3 -c "
import sys
moved = set('$MOVED_CASES'.split(','))
for line in sys.stdin:
    cn = line.strip()
    if cn and cn not in moved:
        print(cn)
" <<< "$CHANGED_CASES_LIST" 2>/dev/null)

    CHANGED_COUNT=$(echo "$CHANGED_CASES_LIST" | grep -c . || true)
    log "📦 Archived: $ARCHIVED_COUNT, Transferred: $TRANSFERRED_COUNT → $CHANGED_COUNT cases remaining"
  fi
fi
fi  # end of new-cases archive skip

[ -z "$ARCHIVED_COUNT" ] && ARCHIVED_COUNT=0
[ -z "$TRANSFERRED_COUNT" ] && TRANSFERRED_COUNT=0

# ── Step 9: update-phase filtering with all counts ──
update_phase --patrol-dir "$PATROL_DIR" --phase filtering \
  --total-found "$TOTAL_FOUND" --changed-cases "$CHANGED_COUNT" \
  --skipped-count "$SKIPPED_COUNT" \
  --archived-count "$ARCHIVED_COUNT" --transferred-count "$TRANSFERRED_COUNT"

# ── Step 10: Early-exit check ──
if [ "$CHANGED_COUNT" -eq 0 ]; then
  log "📊 Patrol: 0 cases to process (all within skipHours). Done."

  # Write patrol-state.json for early exit
  python3 -c "
import json, time
now = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
state = {
    'startedAt': '$NOW_ISO',
    'completedAt': now,
    'source': '$SOURCE',
    'totalCases': $TOTAL_FOUND,
    'changedCases': 0,
    'processedCases': 0,
    'archivedCount': $ARCHIVED_COUNT,
    'transferredCount': $TRANSFERRED_COUNT,
    'phase': 'completed',
    'caseResults': []
}
with open('$PATROL_DIR/patrol-state.json', 'w', encoding='utf-8') as f:
    json.dump(state, f, indent=2, ensure_ascii=False)
" 2>/dev/null

  update_phase --patrol-dir "$PATROL_DIR" --phase completed \
    --total-found "$TOTAL_FOUND" --changed-cases 0 --skipped-count "$SKIPPED_COUNT" \
    --archived-count "$ARCHIVED_COUNT" --transferred-count "$TRANSFERRED_COUNT"

  # Release lock + cleanup temp files
  rm -f "$PATROL_DIR/patrol.lock" "$ACTIVE_JSON_TMP" "${DETECT_JSON_TMP:-}"

  # Output early-exit JSON to stdout
  FINAL_JSON="{\"status\":\"early-exit\",\"runId\":\"$RUN_ID\",\"cases\":[],\"totalFound\":$TOTAL_FOUND,\"changedCases\":0,\"skippedCount\":$SKIPPED_COUNT,\"archivedCount\":$ARCHIVED_COUNT,\"transferredCount\":$TRANSFERRED_COUNT,\"warmupStatus\":\"\",\"source\":\"$SOURCE\",\"force\":$FORCE_JSON,\"message\":\"All cases within skipHours\"}"
  echo "$FINAL_JSON" | tee "$SCRIPTS_DIR/patrol-init.json"
  exit 0
fi

# ── Step 11: Warmup (parallel) ──
log "⏳ Warming up (IR batch + token daemon)..."
update_phase --patrol-dir "$PATROL_DIR" --phase warming-up --warmup-status "warming up tokens"

# IR/FDR/FWR batch (background, ~3s)
$PWSH_CMD -NoProfile -File "$PROJECT_ROOT/.claude/skills/d365-case-ops/scripts/check-ir-status-batch.ps1" \
  -SaveMeta -MetaDir "$CASES_ROOT/active" > "$SCRIPTS_DIR/ir-check.log" 2>&1 &
PID_IR=$!

# Token daemon warmup (foreground, capture output)
WARMUP_OUT=$(node "$PROJECT_ROOT/.claude/skills/browser-profiles/scripts/token-daemon.js" warmup 2>"$SCRIPTS_DIR/warmup.log" || echo "daemon offline")
echo "$WARMUP_OUT" >> "$SCRIPTS_DIR/warmup.log"
WARMUP_STATUS=$(echo "$WARMUP_OUT" | head -1 | cut -c1-60)

# Update warmup status immediately
update_phase --patrol-dir "$PATROL_DIR" --phase warming-up --warmup-status "$WARMUP_STATUS"

# Wait for IR batch
wait "$PID_IR" 2>/dev/null || true
log "✅ Warmup done: $WARMUP_STATUS"

# ── Step 12: Build case list CSV + update-phase → processing ──
CASE_LIST_CSV=$(echo "$CHANGED_CASES_LIST" | tr '\n' ',' | sed 's/,$//')

# Build JSON array of case numbers (use stdin to avoid shell quoting issues)
CASES_JSON_ARRAY=$(echo "$CASE_LIST_CSV" | python3 -c "
import json, sys
csv_val = sys.stdin.read().strip()
cases = [c.strip() for c in csv_val.split(',') if c.strip()]
print(json.dumps(cases))
" 2>/dev/null || echo "[]")

update_phase --patrol-dir "$PATROL_DIR" --phase processing \
  --total-found "$TOTAL_FOUND" --changed-cases "$CHANGED_COUNT" \
  --skipped-count "$SKIPPED_COUNT" --warmup-status "$WARMUP_STATUS" \
  --case-list "$CASE_LIST_CSV" \
  --archived-count "$ARCHIVED_COUNT" --transferred-count "$TRANSFERRED_COUNT"

# ── Output final JSON to stdout ──
WARMUP_ESCAPED=$(echo "$WARMUP_STATUS" | python3 -c "import json,sys; print(json.dumps(sys.stdin.read().strip()))" 2>/dev/null || echo "\"\"")
FINAL_JSON="{\"status\":\"ok\",\"runId\":\"$RUN_ID\",\"cases\":$CASES_JSON_ARRAY,\"totalFound\":$TOTAL_FOUND,\"changedCases\":$CHANGED_COUNT,\"skippedCount\":$SKIPPED_COUNT,\"archivedCount\":$ARCHIVED_COUNT,\"transferredCount\":$TRANSFERRED_COUNT,\"warmupStatus\":$WARMUP_ESCAPED,\"source\":\"$SOURCE\",\"force\":$FORCE_JSON}"
echo "$FINAL_JSON" | tee "$SCRIPTS_DIR/patrol-init.json"

# Cleanup temp files
rm -f "$ACTIVE_JSON_TMP" "${DETECT_JSON_TMP:-}"
exit 0

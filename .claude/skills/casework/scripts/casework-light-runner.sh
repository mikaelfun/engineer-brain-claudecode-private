#!/usr/bin/env bash
# casework-light-runner.sh — All-in-one runner for casework-light agent
#
# Combines: changegate → gather → attachments → ICM cache → teams wait → context collect
# into ONE Bash call, eliminating ~10 LLM round-trips.
#
# For NO_CHANGE cases: writes execution-plan.json directly (zero LLM needed).
# For CHANGED cases: writes runner-output.json with all context for LLM status-judge.
#
# Usage: bash casework-light-runner.sh \
#   --case-number 2601290030000748 \
#   --case-dir ./cases/active/2601290030000748 \
#   --project-root . \
#   --cases-root ./cases \
#   --is-ar false \
#   --main-case-id "" \
#   --teams-cache-hours 8
#
# Output (stdout last line):
#   NO_CHANGE|plan_written|actualStatus=X|days=N
#   CHANGED|runner_output_written|delta=DELTA_OK|icm_needs_refresh=true
set -uo pipefail

# --- Parse arguments ---
CASE_NUMBER="" CASE_DIR="" PROJECT_ROOT="" CASES_ROOT=""
IS_AR="false" MAIN_CASE_ID="" TEAMS_CACHE_HOURS="8"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --case-number)       CASE_NUMBER="$2"; shift 2 ;;
    --case-dir)          CASE_DIR="$2"; shift 2 ;;
    --project-root)      PROJECT_ROOT="$2"; shift 2 ;;
    --cases-root)        CASES_ROOT="$2"; shift 2 ;;
    --is-ar)             IS_AR="$2"; shift 2 ;;
    --main-case-id)      MAIN_CASE_ID="$2"; shift 2 ;;
    --teams-cache-hours) TEAMS_CACHE_HOURS="$2"; shift 2 ;;
    *) shift ;;
  esac
done

if [ -z "$CASE_NUMBER" ] || [ -z "$CASE_DIR" ] || [ -z "$PROJECT_ROOT" ]; then
  echo "ERROR|missing required args" >&2
  exit 1
fi

# Path guard: reject absolute Windows paths (causes files to land in wrong locations)
if echo "$CASE_DIR" | grep -qE "^[A-Z]:|^/[a-z]/"; then
  echo "ERROR|CASE_DIR contains absolute path: $CASE_DIR. Must use relative path like ./cases/active/..." >&2
  exit 1
fi
if echo "$CASES_ROOT" | grep -qE "^[A-Z]:|^/[a-z]/"; then
  echo "ERROR|CASES_ROOT contains absolute path: $CASES_ROOT. Must use relative path like ./cases" >&2
  exit 1
fi

CD="$PROJECT_ROOT"
LOG="$CASE_DIR/logs/casework-light.log"
T_START=$(date +%s)

mkdir -p "$CASE_DIR/logs" "$CASE_DIR/teams" "$CASE_DIR/onenote" "$CASE_DIR/context" "$CASE_DIR/.casework"
# execution-plan.json is orchestrator-internal state (only casework-light-runner writes it,
# no external readers) — lives in .casework/ per Casework v2 layout. Also clean up legacy
# case-root copy from pre-migration runs.
rm -f "$CASE_DIR/.casework/execution-plan.json" "$CASE_DIR/execution-plan.json"
echo "$T_START" > "$CASE_DIR/logs/.t_start"

# ═══════════════════════════════════════════
# STEP 1: Changegate
# ═══════════════════════════════════════════
CHANGE_RESULT=$(pwsh -NoProfile -File "$CD/.claude/skills/d365-case-ops/scripts/check-case-changes.ps1" \
  -TicketNumber "$CASE_NUMBER" -OutputDir "$CASES_ROOT/active" 2>&1 | tail -1)
# Strip trailing \r from pwsh CRLF output to prevent Python SyntaxError
CHANGE_RESULT="${CHANGE_RESULT%$'\r'}"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] STEP 1 OK | changegate=$CHANGE_RESULT isAR=$IS_AR" >> "$LOG"

# ═══════════════════════════════════════════
# FAST PATH: NO_CHANGE → write plan directly
# ═══════════════════════════════════════════
if echo "$CHANGE_RESULT" | grep -qiE "^(NO_CHANGE|UNCHANGED)"; then
  # Read meta for current status
  META_FILE="$CASE_DIR/casework-meta.json"
  if [ -f "$META_FILE" ]; then
    # Write python to temp file to avoid Windows 8191-char command line limit
    FAST_PY=$(mktemp /tmp/casework-fast-XXXXXX.py)
    trap "rm -f '$FAST_PY'" EXIT
    cat > "$FAST_PY" << PYEOF
import json, time, os, re as _re, sys
from datetime import datetime as _dt

meta = json.load(open('$META_FILE'))
status = meta.get('actualStatus', 'pending-engineer')
days = meta.get('daysSinceLastContact', 0)

# --- Recalculate daysSinceLastContact from email/note dates (NO_CHANGE path too) ---
import re as _re2
from datetime import date as _date2
_latest = None
for _fp in ['$CASE_DIR/emails.md', '$CASE_DIR/notes.md']:
    try:
        _txt = open(_fp, encoding='utf-8').read()
        _ds = _re2.findall(r'(\d{4}-\d{2}-\d{2})', _txt)
        if _ds:
            _d = max(_ds)
            if _latest is None or _d > _latest:
                _latest = _d
    except: pass
if _latest:
    _p = _latest.split('-')
    days = (_date2.today() - _date2(int(_p[0]), int(_p[1]), int(_p[2]))).days

reasoning = meta.get('statusReasoning', '')
email_count = meta.get('emailCountAtJudge', 0)
note_count = meta.get('noteCountAtJudge', 0)
recommended = meta.get('recommendedActions')  # Gap 3: LLM recommended actions

# --- AR context (Gap 5) ---
is_ar = '$IS_AR' == 'true'
ar_meta = meta.get('ar', {})
communication_mode = ar_meta.get('communicationMode', 'customer-facing') if is_ar else None
ar_scope = ar_meta.get('scope', '') if is_ar else None
case_owner_email = ar_meta.get('caseOwnerEmail', '') if is_ar else None
case_owner_name = ar_meta.get('caseOwnerName', '') if is_ar else None

# --- Helper: check if a draft of given type is still valid ---
def check_draft_valid(draft_type, days_since_contact):
    """Check if a draft exists and is still valid (not stale).
    Returns (has_valid, stale_info_or_None)"""
    drafts_dir = os.path.join('$CASE_DIR', 'drafts')
    if not os.path.isdir(drafts_dir):
        return False, None
    now_ts = time.time()
    for f in sorted(os.listdir(drafts_dir), reverse=True):
        if draft_type not in f:
            continue
        m = _re.match(r'(\d{8})-(\d{4})', f)
        if m:
            try:
                draft_ts = _dt.strptime(m.group(1)+m.group(2), '%Y%m%d%H%M').timestamp()
                draft_age_days = (now_ts - draft_ts) / 86400
                # Valid: (1) no new interaction after draft, (2) not older than 7 days
                if draft_age_days <= days_since_contact + 0.5 and draft_age_days <= 7:
                    return True, None
                reasons = []
                if draft_age_days > days_since_contact + 0.5:
                    reasons.append(f'new interaction after draft (draft={draft_age_days:.0f}d old, lastContact={days_since_contact}d ago)')
                if draft_age_days > 7:
                    reasons.append(f'draft too old ({draft_age_days:.0f}d)')
                return False, f'{f}: {"; ".join(reasons)}'
            except:
                pass
        break  # only check the most recent draft of this type
    return False, None

# --- Routing decision ---
actions = []
no_action_reason = None
routing_source = 'rule-table'  # track where decision came from

# Gap 3: Check LLM recommendedActions first (from last status-judge)
# Format can be: string ("no-agent: reason") or list of dicts ([{"action":"no-agent","reason":"..."}])
# TTL: only trust if statusJudgedAt < 24 hours ago (LLM context may be time-sensitive)
rec_action_str = None
rec_expired = False
if recommended:
    judged_at = meta.get('statusJudgedAt', '')
    if judged_at:
        try:
            jt = _dt.fromisoformat(judged_at)
            age_hours = (time.time() - jt.timestamp()) / 3600
            if age_hours > 24:
                rec_expired = True
        except: pass

    if not rec_expired:
        if isinstance(recommended, list) and len(recommended) > 0:
            first = recommended[0] if isinstance(recommended[0], dict) else {}
            rec_action_str = first.get('action', '')
            rec_reason = first.get('reason', str(recommended))
        elif isinstance(recommended, str) and recommended.strip():
            rec_action_str = recommended.strip().lower().split(':')[0]
            rec_reason = recommended.strip()

if rec_action_str:
    rec = rec_action_str.lower().strip()
    if rec == 'no-agent':
        # Override: pending-customer + days>=3 should still trigger follow-up even if LLM said no-agent
        if status == 'pending-customer' and isinstance(days, (int, float)) and days >= 3:
            no_action_reason = None  # let rule-table handle it
            routing_source = 'rule-table-override'
        else:
            no_action_reason = f'NO_CHANGE: LLM recommended no-agent. {rec_reason}'
            routing_source = 'recommendedActions'
    elif 'troubleshooter' in rec and 'email' in rec:
        actions = [{'type':'troubleshooter','priority':1,'status':'pending',
                    'context':f'LLM recommended: {rec_reason}'},
                   {'type':'email-drafter','priority':2,'status':'pending','emailType':'follow-up',
                    'dependsOn':'troubleshooter','context':f'LLM recommended: {rec_reason}'}]
        routing_source = 'recommendedActions'
    elif 'troubleshooter' in rec:
        actions = [{'type':'troubleshooter','priority':1,'status':'pending',
                    'context':f'LLM recommended: {rec_reason}'}]
        routing_source = 'recommendedActions'
    elif 'email' in rec or 'closure' in rec or 'follow-up' in rec:
        email_type = 'closure' if 'closure' in rec else 'follow-up'
        actions = [{'type':'email-drafter','priority':1,'status':'pending','emailType':email_type,
                    'context':f'LLM recommended: {rec_reason}'}]
        routing_source = 'recommendedActions'
    # else: unrecognized format, fall through to rule-table

# Fallback: rule-based routing (only if recommendedActions didn't match)
if not actions and no_action_reason is None:
    routing_source = 'rule-table'

    if status == 'pending-customer' and isinstance(days, (int, float)) and days >= 3:
        has_valid, stale_info = check_draft_valid('follow-up', days)
        if has_valid:
            no_action_reason = f'NO_CHANGE: emails={email_count},notes={note_count}. pending-customer days={days}>=3 but valid follow-up draft exists'
        else:
            ctx = f'pending-customer days={days}(>=3)'
            if stale_info:
                ctx += f', stale draft detected: {stale_info}'
            else:
                ctx += ', no follow-up draft found'
            # Gap 5: AR routing — set correct recipient context
            if is_ar and communication_mode == 'internal':
                ctx += f', AR internal mode: send to case owner ({case_owner_name or case_owner_email})'
            actions = [{'type':'email-drafter','priority':1,'status':'pending','emailType':'follow-up',
                        'context': ctx}]

    elif status == 'pending-customer':
        no_action_reason = f'NO_CHANGE: emails={email_count},notes={note_count}. pending-customer days={days}(<3)'

    elif status == 'pending-pg':
        no_action_reason = f'NO_CHANGE: pending-pg, waiting for PG response. days={days}'

    elif status == 'ready-to-close':
        # Gap 2: check if closure draft already exists and is valid
        has_valid, stale_info = check_draft_valid('closure', days)
        if has_valid:
            no_action_reason = f'NO_CHANGE: ready-to-close but valid closure draft exists'
        else:
            ctx = 'ready-to-close status, need closure email'
            if stale_info:
                ctx += f', stale draft: {stale_info}'
            if is_ar and communication_mode == 'internal':
                ctx += f', AR internal mode: send summary to case owner ({case_owner_name or case_owner_email})'
            actions = [{'type':'email-drafter','priority':1,'status':'pending','emailType':'closure',
                        'context': ctx}]

    elif status == 'pending-engineer':
        actions = [{'type':'troubleshooter','priority':1,'status':'pending',
                    'context':f'pending-engineer, needs technical analysis'},
                   {'type':'email-drafter','priority':2,'status':'pending','emailType':'follow-up',
                    'dependsOn':'troubleshooter','context':'follow-up after troubleshooting'}]

    # Gap 4: researching status → trigger troubleshooter
    elif status == 'researching':
        actions = [{'type':'troubleshooter','priority':1,'status':'pending',
                    'context':f'researching, continue technical analysis. days={days}'}]

    else:
        no_action_reason = f'NO_CHANGE: status={status}, days={days}. {reasoning[:80]}'

elapsed = round(time.time() - $T_START, 1)

plan = {
    'caseNumber': '$CASE_NUMBER',
    'caseDir': '$CASE_DIR',
    'createdAt': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
    'actualStatus': status,
    'daysSinceLastContact': days,
    'isAR': is_ar,
    'completedSteps': ['changegate'],
    'changegatResult': '$CHANGE_RESULT',
    'actions': actions,
    'noActionReason': no_action_reason,
    'routingSource': routing_source,
    'timing': {'elapsed': elapsed, 'bashCalls': 1, 'toolCalls': 1, 'path': 'NO_CHANGE_FAST'}
}
# Gap 5: include AR context in plan for patrol to use when spawning
if is_ar:
    plan['arContext'] = {
        'communicationMode': communication_mode,
        'scope': ar_scope,
        'caseOwnerEmail': case_owner_email,
        'caseOwnerName': case_owner_name
    }

# Write execution-plan.json to .casework/ (orchestrator-internal artifact, not case-root)
plan_path = os.path.join('$CASE_DIR', '.casework', 'execution-plan.json')
with open(plan_path, 'w', encoding='utf-8') as f:
    json.dump(plan, f, indent=2, ensure_ascii=False)

print(f'NO_CHANGE|plan_written|actualStatus={status}|days={days}|actions={len(actions)}')
PYEOF
    PLAN_DATA=$(python3 "$FAST_PY" 2>&1)
    rm -f "$FAST_PY"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] FAST_PATH | $PLAN_DATA" >> "$LOG"
    echo "$PLAN_DATA"
    exit 0
  else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] FAST_PATH FALLBACK | no meta, treating as CHANGED" >> "$LOG"
  fi
fi

# ═══════════════════════════════════════════
# FULL PATH: CHANGED → gather + collect context
# ═══════════════════════════════════════════

# --- Run casework-gather.sh (parallel data-refresh + onenote + compliance + teams request) ---
GATHER_RESULT=$(bash "$CD/.claude/skills/casework/scripts/casework-gather.sh" \
  --case-number "$CASE_NUMBER" \
  --case-dir "$CASE_DIR" \
  --project-root "$CD" \
  --cases-root "$CASES_ROOT" \
  --is-ar "$IS_AR" \
  --main-case-id "$MAIN_CASE_ID" \
  --teams-cache-hours "$TEAMS_CACHE_HOURS" 2>&1 | tail -1)

echo "[$(date '+%Y-%m-%d %H:%M:%S')] STEP 2 OK | $GATHER_RESULT" >> "$LOG"

# --- Attachment check ---
ATTACH_COUNT=$(python3 -c "
import re
try:
    text = open('$CASE_DIR/case-info.md').read()
    m = re.search(r'DTM Attachments:\s*(\d+)', text)
    print(m.group(1) if m else '0')
except: print('0')
" 2>/dev/null)
if [ "$ATTACH_COUNT" -gt 0 ]; then
  pwsh -NoProfile -File "$CD/.claude/skills/d365-case-ops/scripts/download-attachments.ps1" \
    -TicketNumber "$CASE_NUMBER" -OutputDir "$CASES_ROOT/active" > /dev/null 2>&1
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] STEP 2.5 OK | attachments=$ATTACH_COUNT" >> "$LOG"
fi

# --- Teams wait + post-process ---
TEAMS_STATUS="SKIP"
# Only wait if gather reported teams=true (fresh request) AND request.json exists
TEAMS_REQUESTED=$(python3 -c "
s='$GATHER_RESULT'
import re
m = re.search(r'teams=(true|false)', s)
print(m.group(1) if m else 'false')
" 2>/dev/null)

if [ "$TEAMS_REQUESTED" = "true" ] && [ -f "$CASE_DIR/teams/request.json" ]; then
  MAX_WAIT=180; WAITED=0
  while [ $WAITED -lt $MAX_WAIT ]; do
    if [ -f "$CASE_DIR/teams/_mcp-raw.json" ] && [ ! -f "$CASE_DIR/teams/request.json" ]; then
      TEAMS_STATUS="READY"; break
    fi
    sleep 10; WAITED=$((WAITED + 10))
  done
  [ $WAITED -ge $MAX_WAIT ] && TEAMS_STATUS="TIMEOUT"
fi

if [ -f "$CASE_DIR/teams/_mcp-raw.json" ]; then
  python3 "$CD/.claude/skills/teams-search/scripts/build-input-from-raw.py" "$CASE_DIR" > /dev/null 2>&1
  pwsh -NoProfile -File "$CD/.claude/skills/teams-search/scripts/write-teams.ps1" \
    -OutputDir "$CASE_DIR/teams" -InputFile "$CASE_DIR/teams/_input.json" > /dev/null 2>&1
  TEAMS_STATUS="DONE"
elif [ -f "$CASE_DIR/teams/teams-digest.md" ]; then
  TEAMS_STATUS="CACHED"
fi
echo "[$(date '+%Y-%m-%d %H:%M:%S')] STEP 3 OK | teams=$TEAMS_STATUS" >> "$LOG"

# --- ICM cache check ---
ICM_NUMBER=$(python3 -c "
import re
try:
    text = open('$CASE_DIR/case-info.md').read()
    m = re.search(r'ICM.*?(\d{11,})', text)
    print(m.group(1) if m else '')
except: print('')
" 2>/dev/null)
ICM_NEEDS_REFRESH="false"
ICM_CACHED_STATE=""

if [ -n "$ICM_NUMBER" ] && [ -f "$CASE_DIR/casework-meta.json" ]; then
  ICM_CACHED_STATE=$(python3 -c "
import json, time
try:
    meta = json.load(open('$CASE_DIR/casework-meta.json'))
    icm = meta.get('icm', {})
    state = icm.get('state', '')
    fetched = icm.get('fetchedAt', '')
    fp = icm.get('fingerprint', '')
    has_summary = __import__('os').path.exists('$CASE_DIR/icm/icm-summary.md')

    # Check if ICM discussions have newer activity than last fetch
    import os, re as _re
    disc_file = os.path.join('$CASE_DIR', 'icm', 'icm-discussions.md')
    disc_newer = False
    last_disc_author = ''
    last_disc_date = ''
    if os.path.exists(disc_file):
        disc_text = open(disc_file, encoding='utf-8').read()
        # Extract last discussion entry: ### [YYYY-MM-DD HH:MM] ... — Author (alias)
        disc_entries = _re.findall(r'\[(\d{4}-\d{2}-\d{2})\s+\d{2}:\d{2}\].*?—\s+(.+?)(?:\s*\(|$)', disc_text)
        if disc_entries:
            last_disc_date, last_disc_author = disc_entries[-1]
            # Check if last discussion is after fetchedAt
            if fetched:
                fetch_date = fetched[:10]  # YYYY-MM-DD
                if last_disc_date > fetch_date:
                    disc_newer = True
            # Check if last discussion author is CSS (fangkun) → means we asked PG, waiting for reply
            if 'fangkun' in last_disc_author.lower() or 'kun fang' in last_disc_author.lower():
                last_disc_author = 'CSS'
            else:
                last_disc_author = 'PG'

    # Determine if refresh needed
    if not fp or not has_summary:
        print(f'NEEDS_REFRESH|state={state}')
    elif state == 'RESOLVED' and has_summary:
        print(f'RESOLVED_SKIP|state={state}')
    elif disc_newer:
        print(f'NEEDS_REFRESH|state={state}|disc_newer_than_fetch|last_disc={last_disc_date}|by={last_disc_author}')
    else:
        # Check TTL (4 hours)
        from datetime import datetime, timezone
        if fetched:
            age_hours = (datetime.now(timezone.utc) - datetime.fromisoformat(fetched.replace('Z','+00:00'))).total_seconds() / 3600
            if age_hours > 4:
                print(f'NEEDS_REFRESH|state={state}|age={age_hours:.1f}h')
            else:
                # Even if cache is fresh, check if last discussion is CSS asking PG with no reply
                if last_disc_author == 'CSS' and last_disc_date:
                    from datetime import date
                    days_waiting = (date.today() - date.fromisoformat(last_disc_date)).days
                    print(f'CACHE_HIT|state={state}|age={age_hours:.1f}h|css_waiting_pg={days_waiting}d|last_disc={last_disc_date}')
                else:
                    print(f'CACHE_HIT|state={state}|age={age_hours:.1f}h')
        else:
            print(f'NEEDS_REFRESH|state={state}|no_fetchedAt')
except Exception as e:
    print(f'NEEDS_REFRESH|error={e}')
" 2>/dev/null)

  if echo "$ICM_CACHED_STATE" | grep -q "NEEDS_REFRESH"; then
    ICM_NEEDS_REFRESH="true"
  fi
fi

# --- Submit ICM discussion queue request (if ICM needs refresh) ---
if [ "$ICM_NEEDS_REFRESH" = "true" ] && [ -n "$ICM_NUMBER" ]; then
  ICM_SUBMIT_SCRIPT="$CD/.claude/skills/icm-discussion/scripts/icm-queue-submit.sh"
  if [ -f "$ICM_SUBMIT_SCRIPT" ]; then
    bash "$ICM_SUBMIT_SCRIPT" "$ICM_NUMBER" "$CASE_DIR" "$CASE_NUMBER" "$CASES_ROOT" 2>/dev/null
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ICM discussion queue: submitted $ICM_NUMBER" >> "$LOG"
  fi
fi

# --- Collect ALL context for LLM status-judge ---
DELTA_STATUS=$(python3 -c "
s = '$GATHER_RESULT'
import re
m = re.search(r'delta=([^|]+)', s)
print(m.group(1) if m else 'DELTA_FIRST_RUN')
" 2>/dev/null)

python3 -c "
import json, os, time

case_dir = '$CASE_DIR'
delta_status = '$DELTA_STATUS'
icm_number = '$ICM_NUMBER'
icm_cached = '$ICM_CACHED_STATE'

def read_file(path, max_lines=100):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        if len(lines) > max_lines:
            return ''.join(lines[-max_lines:])
        return ''.join(lines)
    except:
        return ''

def read_json(path):
    try:
        return json.load(open(path, encoding='utf-8'))
    except:
        return {}

# --- Calculate fresh daysSinceLastContact from email/note dates ---
import re as _re
from datetime import date as _date
latest_date_str = None
for _fpath in [os.path.join(case_dir, 'emails.md'), os.path.join(case_dir, 'notes.md')]:
    try:
        _text = open(_fpath, encoding='utf-8').read()
        _dates = _re.findall(r'(\d{4}-\d{2}-\d{2})', _text)
        if _dates:
            _d = max(_dates)
            if latest_date_str is None or _d > latest_date_str:
                latest_date_str = _d
    except: pass
fresh_days = None
if latest_date_str:
    _parts = latest_date_str.split('-')
    fresh_days = (_date.today() - _date(int(_parts[0]), int(_parts[1]), int(_parts[2]))).days

# Collect context based on delta status (slim when DELTA_EMPTY)
context = {}
full_meta = read_json(os.path.join(case_dir, 'casework-meta.json'))

if delta_status == 'DELTA_EMPTY':
    # SLIM MODE: only decision-critical fields (saves ~7KB of LLM input tokens)
    context['meta'] = {
        'actualStatus': full_meta.get('actualStatus'),
        'daysSinceLastContact': fresh_days if fresh_days is not None else full_meta.get('daysSinceLastContact', 0),
        'statusReasoning': full_meta.get('statusReasoning', ''),
        'icm': full_meta.get('icm', {}),
        'ar': full_meta.get('ar'),
        'recommendedActions': full_meta.get('recommendedActions'),
        'compliance': {'entitlementOk': full_meta.get('compliance',{}).get('entitlementOk'), 'sapOk': full_meta.get('compliance',{}).get('sapOk')},
        'irSla': {'status': full_meta.get('irSla',{}).get('status')},
        'fdr': {'status': full_meta.get('fdr',{}).get('status')},
        'fwr': {'status': full_meta.get('fwr',{}).get('status')},
    }
    context['deltaContent'] = read_file(os.path.join(case_dir, 'logs', 'delta-since-last-judge.md'), 20)
    # DELTA_EMPTY but ICM has recent discussions → keep ICM context for accurate status-judge
    icm_disc_path = os.path.join(case_dir, 'icm', 'icm-discussions.md')
    icm_sum_path = os.path.join(case_dir, 'icm', 'icm-summary.md')
    _keep_icm = False
    _css_waiting = False
    if os.path.exists(icm_disc_path):
        _disc_text = open(icm_disc_path, encoding='utf-8').read()
        _disc_entries = _re.findall(r'\[(\d{4}-\d{2}-\d{2})\s+\d{2}:\d{2}\].*?—\s+(.+?)(?:\s*\(|$)', _disc_text)
        if _disc_entries:
            _last_date, _last_author = _disc_entries[-1]
            _days_ago = (_date.today() - _date.fromisoformat(_last_date)).days
            if _days_ago <= 5:  # discussion activity in last 5 days → keep context
                _keep_icm = True
            if ('fangkun' in _last_author.lower() or 'kun fang' in _last_author.lower()) and _days_ago <= 5:
                _css_waiting = True
                context['meta']['_icmLastDiscCSS'] = True
                context['meta']['_icmLastDiscDate'] = _last_date
                context['meta']['_icmCSSWaitingDays'] = _days_ago
    if _keep_icm:
        context['icmSummary'] = read_file(icm_sum_path, 20)
        context['icmDiscussions'] = read_file(icm_disc_path, 40)  # last 40 lines of discussion
else:
    # FULL MODE: DELTA_OK or DELTA_FIRST_RUN — include all context for deep analysis
    if fresh_days is not None:
        full_meta['daysSinceLastContact'] = fresh_days
    context['meta'] = full_meta
    context['caseInfoHead'] = read_file(os.path.join(case_dir, 'case-info.md'), 50)
    if delta_status == 'DELTA_OK':
        context['deltaContent'] = read_file(os.path.join(case_dir, 'logs', 'delta-since-last-judge.md'), 80)
    else:
        context['emailsTail'] = read_file(os.path.join(case_dir, 'emails.md'), 100)
        context['notes'] = read_file(os.path.join(case_dir, 'notes.md'), 60)
    context['teamsDigest'] = read_file(os.path.join(case_dir, 'teams', 'teams-digest.md'), 40)
    context['onenoteNotes'] = read_file(os.path.join(case_dir, 'onenote', 'personal-notes.md'), 30)
    if icm_number:
        context['icmSummary'] = read_file(os.path.join(case_dir, 'icm', 'icm-summary.md'), 30)

output = {
    'caseNumber': '$CASE_NUMBER',
    'caseDir': case_dir,
    'isAR': '$IS_AR' == 'true',
    'mainCaseId': '$MAIN_CASE_ID' if '$IS_AR' == 'true' else None,
    'changegate': '$CHANGE_RESULT',
    'gatherResult': '$GATHER_RESULT',
    'deltaStatus': delta_status,
    'attachCount': int('$ATTACH_COUNT'),
    'teamsStatus': '$TEAMS_STATUS',
    'daysSinceLastContact': fresh_days if fresh_days is not None else full_meta.get('daysSinceLastContact', 0),
    'icm': {
        'number': icm_number,
        'needsRefresh': '$ICM_NEEDS_REFRESH' == 'true',
        'cachedState': icm_cached
    },
    'context': context,
    'elapsed': round(time.time() - $T_START, 1)
}

out_path = os.path.join(case_dir, 'context', 'runner-output.json')
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(output, f, indent=2, ensure_ascii=False)

print(f'CHANGED|runner_output_written|delta={delta_status}|icm_needs_refresh=$ICM_NEEDS_REFRESH|teams=$TEAMS_STATUS|elapsed={output[\"elapsed\"]:.0f}s')
" 2>&1

FINAL_LINE=$(tail -1 "$CASE_DIR/context/runner-output.json" 2>/dev/null | head -c 1)
echo "[$(date '+%Y-%m-%d %H:%M:%S')] RUNNER COMPLETE | delta=$DELTA_STATUS icm_refresh=$ICM_NEEDS_REFRESH teams=$TEAMS_STATUS" >> "$LOG"
echo "CHANGED|runner_output_written|delta=$DELTA_STATUS|icm_needs_refresh=$ICM_NEEDS_REFRESH|teams=$TEAMS_STATUS"

#!/usr/bin/env bash
# data-refresh.sh — Casework v2 Step 1 orchestrator (PRD §5.1).
#
# Parallel-launches 6 source paths, aggregates event JSONs into
# data-refresh-output.json per PRD §4.2. No LLM reasoning here — this script
# is pure plumbing. Digest/relevance is Step 2 (assess) responsibility.
#
# Usage:
#   bash data-refresh.sh --case-number 2601290030000748 \
#                        --case-dir ./cases/active/2601290030000748 \
#                        [--project-root .] [--is-ar] [--main-case-number XXX]
#
# Output: {caseDir}/.casework/data-refresh-output.json
# Events: {caseDir}/.casework/events/{d365,teams,icm,onenote,attachments,data-refresh}.json
#
# Exit: 0 = OK or DEGRADED; 1 = L1 source (d365) failed → no output JSON
set -uo pipefail

# ── Args ──
CASE_NUMBER="" CASE_DIR="" PROJECT_ROOT="" IS_AR="false" MAIN_CASE=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --case-number)      CASE_NUMBER="$2"; shift 2 ;;
    --case-dir)         CASE_DIR="$2"; shift 2 ;;
    --project-root)     PROJECT_ROOT="$2"; shift 2 ;;
    --is-ar)            IS_AR="true"; shift ;;
    --main-case-number) MAIN_CASE="$2"; shift 2 ;;
    *) shift ;;
  esac
done
[ -z "$CASE_NUMBER" ] || [ -z "$CASE_DIR" ] && { echo "ERROR|missing --case-number or --case-dir" >&2; exit 2; }

HERE="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="${PROJECT_ROOT:-$(cd "$HERE/../../.." && pwd)}"
# Windows-mixed path (C:/...) so python3 open() doesn't treat /c/ as literal.
# cygpath -m handles both MSYS and Cygwin; fall back to pwd if absent.
to_win() { cygpath -m "$1" 2>/dev/null || echo "$1"; }
mkdir -p "$CASE_DIR"
CASE_DIR_ABS="$(to_win "$(cd "$CASE_DIR" && pwd)")"
PROJECT_ROOT_WIN="$(to_win "$PROJECT_ROOT")"

EVT_DIR="$CASE_DIR_ABS/.casework/events"
OUT_DIR="$CASE_DIR_ABS/.casework"
WRAPPER="$HERE/event-wrapper.sh"
WRITE_EVENT="$HERE/write-event.sh"

# ── Reset .casework ──
rm -rf "$OUT_DIR"
mkdir -p "$EVT_DIR"

TOP_START_TS=$(date -u +%FT%TZ)
TOP_START_NS=$(date +%s%N)

bash "$WRITE_EVENT" "$EVT_DIR/data-refresh.json" \
  "{\"task\":\"data-refresh\",\"status\":\"active\",\"startedAt\":\"$TOP_START_TS\",\"caseNumber\":\"$CASE_NUMBER\"}"

echo "🚀 data-refresh.sh: case=$CASE_NUMBER isAR=$IS_AR"
echo "   case-dir=$CASE_DIR_ABS"
echo "   events=$EVT_DIR"

# ── Launch 5 parallel paths (labor merged into d365) ──
LOGD="$OUT_DIR/logs"; mkdir -p "$LOGD"

OUT_PARENT_WIN="$(to_win "$(dirname "$CASE_DIR_ABS")")"
(
  # NOTE: Do NOT pass -Force. Per PRD §2.2, emails/notes rely on their built-in
  # incremental mechanisms (emails: createdon ge lastFetch; notes: id dedup).
  # -Force wipes existingIds and makes every email look "new", producing false
  # positives in d365.json.delta.newEmails. Snapshot freshness is controlled by
  # -CacheMinutes 10 independently.
  FETCH_ARGS=(-TicketNumber "$CASE_NUMBER" -OutputDir "$OUT_PARENT_WIN" -CacheMinutes 10 -EventDir "$EVT_DIR")
  [ "$IS_AR" = "true" ] && [ -n "$MAIN_CASE" ] && FETCH_ARGS+=(-MainCaseNumber "$MAIN_CASE")
  pwsh -NoProfile -File "$PROJECT_ROOT/.claude/skills/d365-case-ops/scripts/fetch-all-data.ps1" "${FETCH_ARGS[@]}" \
    > "$LOGD/d365.log" 2>&1
) &
PID_D365=$!

# 2. Teams — L2, native events (teams-search-inline.sh already emits).
# Post-processing (build-input + write-teams) is chained INSIDE the bg subshell
# so per-chat .md / _chat-index.json update runs in parallel with the other 4
# paths instead of blocking them at the outer wait. Total path time =
# max(d365, teams+post, icm, onenote, att) instead of max(...) + teams-post.
(
  bash "$PROJECT_ROOT/.claude/skills/casework/teams-search/scripts/teams-search-inline.sh" \
    --case-number "$CASE_NUMBER" --case-dir "$CASE_DIR_ABS" --contact-email "" \
    > "$LOGD/teams.log" 2>&1

  # PRD §4.3: Step 1 must land _chat-index.json + per-chat .md, not just raw.
  if [ -f "$CASE_DIR_ABS/teams/_mcp-raw.json" ]; then
    python3 "$PROJECT_ROOT/.claude/skills/casework/teams-search/scripts/build-input-from-raw.py" \
      "$CASE_DIR_ABS" > "$LOGD/teams-build-input.log" 2>&1 || true
    if [ -f "$CASE_DIR_ABS/teams/_input.json" ]; then
      pwsh -NoProfile -File "$PROJECT_ROOT/.claude/skills/casework/teams-search/scripts/write-teams.ps1" \
        -OutputDir "$CASE_DIR_ABS/teams" -InputFile "$CASE_DIR_ABS/teams/_input.json" \
        > "$LOGD/teams-write.log" 2>&1 || true
    fi
  fi
) &
PID_TEAMS=$!

# 3. ICM — L2, native events (Task 5.3).
# Resolve incidentId via 4-way fallback:
#   1. casework-meta.json (pre-seeded by changegate ISS-219)
#   2. meta.json (legacy)
#   3. icm/_icm-portal-raw.json (legacy cache)
#   4. WAIT for case-info.md to appear (cold start: D365 step writes it)
#      then parse "| ICM Number | NNNNN |" line from case-info.md
ICM_INCIDENT=""
for src in "$CASE_DIR_ABS/casework-meta.json" "$CASE_DIR_ABS/meta.json" "$CASE_DIR_ABS/icm/_icm-portal-raw.json"; do
  if [ -f "$src" ]; then
    ICM_INCIDENT=$(python3 -c "
import json
try:
  d = json.load(open(r'$src', encoding='utf-8'))
  for k in ('incidentId', 'IncidentId'):
    if k in d and d[k]: print(d[k]); break
  else:
    icm = d.get('icm') or {}
    print(icm.get('incidentId', ''))
except Exception: print('')
" 2>/dev/null || echo "")
    [ -n "$ICM_INCIDENT" ] && break
  fi
done

# Cold start fallback: wait for case-info.md (D365 step produces it in ~15-30s)
if [ -z "$ICM_INCIDENT" ]; then
  CASE_INFO="$CASE_DIR_ABS/case-info.md"
  for i in $(seq 1 12); do
    [ -f "$CASE_INFO" ] && break
    sleep 3
  done
  if [ -f "$CASE_INFO" ]; then
    ICM_INCIDENT=$(grep -oP 'ICM Number\s*\|\s*\K[0-9]+' "$CASE_INFO" 2>/dev/null || echo "")
  fi
fi

if [ -n "$ICM_INCIDENT" ]; then
  (
    node "$PROJECT_ROOT/.claude/skills/icm/scripts/icm-discussion-ab.js" \
      --single "$ICM_INCIDENT" --case-dir "$CASE_DIR_ABS" --event-dir "$EVT_DIR" \
      > "$LOGD/icm.log" 2>&1
  ) &
  PID_ICM=$!
else
  # No ICM linked → emit SKIP event directly, no subprocess.
  bash "$WRITE_EVENT" "$EVT_DIR/icm.json" \
    "{\"task\":\"icm\",\"status\":\"completed\",\"startedAt\":\"$TOP_START_TS\",\"completedAt\":\"$TOP_START_TS\",\"durationMs\":0,\"delta\":{\"newEntries\":0,\"skipped\":\"no incidentId in meta\"}}"
  PID_ICM=""
fi

# 4. OneNote — L2, wrapped (emits delta via EVENT_DELTA_FILE contract).
# 拉通 casework-gather.sh 已有方式：{dataRoot}/OneNote Export/{personalNotebook}/
# 之前错读 config.onenoteNotebookDir（不存在的 key）导致永远 skip，md 从未落盘。
NOTEBOOK_DIR=""
# PROJECT_ROOT_WIN is cygpath -m'd (C:/…); python3 open() on Windows chokes on
# POSIX /c/… paths silently — the outer try/except would swallow it and leave
# NOTEBOOK_DIR empty → onenote perpetually skipped. Use the Windows-mixed form.
if [ -f "$PROJECT_ROOT_WIN/config.json" ]; then
  NOTEBOOK_DIR=$(python3 -c "
import json, os
try:
    cfg = json.load(open(r'$PROJECT_ROOT_WIN/config.json', encoding='utf-8'))
    dr = cfg.get('dataRoot', '../data')
    nb = cfg.get('onenote',{}).get('personalNotebook','')
    if nb:
        # dataRoot is relative to project root; resolve absolute.
        if not os.path.isabs(dr):
            dr = os.path.join(r'$PROJECT_ROOT_WIN', dr)
            dr = os.path.normpath(dr).replace('\\\\', '/')
        d = os.path.join(dr, 'OneNote Export', nb)
        print(d if os.path.isdir(d) else '')
except Exception: pass
" 2>/dev/null || echo "")
fi
if [ -n "$NOTEBOOK_DIR" ] && [ -d "$NOTEBOOK_DIR" ]; then
  (
    bash "$WRAPPER" onenote "$EVT_DIR" -- \
      python3 "$PROJECT_ROOT/.claude/skills/onenote/scripts/search-inline.py" \
      --case-dir "$CASE_DIR_ABS" --notebook-dir "$NOTEBOOK_DIR" --case-number "$CASE_NUMBER" \
      > "$LOGD/onenote.log" 2>&1
  ) &
  PID_ONENOTE=$!
else
  bash "$WRITE_EVENT" "$EVT_DIR/onenote.json" \
    "{\"task\":\"onenote\",\"status\":\"completed\",\"startedAt\":\"$TOP_START_TS\",\"completedAt\":\"$TOP_START_TS\",\"durationMs\":0,\"delta\":{\"newPages\":0,\"skipped\":\"no notebook dir\"}}"
  PID_ONENOTE=""
fi

# 5. Attachments — L2, native events.
(
  pwsh -NoProfile -File "$PROJECT_ROOT/.claude/skills/d365-case-ops/scripts/download-attachments.ps1" \
    -TicketNumber "$CASE_NUMBER" -OutputDir "$OUT_PARENT_WIN" -EventDir "$EVT_DIR" \
    > "$LOGD/attachments.log" 2>&1
) &
PID_ATT=$!

echo "⏳ Waiting 5 paths (each path self-times-out; no external watchdog)..."

# Each source has its own timeout discipline (teams-search-inline 50×0.2s proxy
# wait, icm-discussion-ab 35s SSO timeout, etc). No external watchdog needed —
# an unkillable `sleep 180 &` on Git Bash was blocking script exit in v1.
for pid in $PID_D365 $PID_TEAMS $PID_ICM $PID_ONENOTE $PID_ATT; do
  [ -n "$pid" ] && wait "$pid" 2>/dev/null || true
done

echo "✅ All 5 data paths finished."

# ── 6. Digest generation (Teams + OneNote, parallel, LLM API call) ──
# Runs AFTER raw data paths complete (needs their output files).
# Delta-gated: skip if no new data AND existing digest file present.
DIGEST_SCRIPT="$PROJECT_ROOT/.claude/skills/casework/scripts/generate-digest.py"
if [ -f "$DIGEST_SCRIPT" ]; then
  # Read delta from event files
  TEAMS_DELTA=$(python3 -c "
import json
try:
    e = json.load(open(r'$EVT_DIR/teams.json'))
    d = e.get('delta', {})
    print(int(d.get('newMessages', 0)) + int(d.get('newChats', 0)))
except: print(0)
" 2>/dev/null || echo "0")

  ONENOTE_DELTA=$(python3 -c "
import json
try:
    e = json.load(open(r'$EVT_DIR/onenote.json'))
    d = e.get('delta', {})
    print(int(d.get('newPages', 0)) + int(d.get('updatedPages', 0)))
except: print(0)
" 2>/dev/null || echo "0")

  echo "⏳ Digest gate: teams_delta=$TEAMS_DELTA onenote_delta=$ONENOTE_DELTA"

  # Teams digest: delta > 0 OR no existing digest
  PID_DIGEST_TEAMS=""
  if [ "$TEAMS_DELTA" -gt 0 ] || [ ! -f "$CASE_DIR_ABS/teams/teams-digest.md" ]; then
    if ls "$CASE_DIR_ABS/teams/"*.md 2>/dev/null | grep -qv '/_'; then
      (
        python3 "$DIGEST_SCRIPT" --type teams \
          --case-dir "$CASE_DIR_ABS" --case-number "$CASE_NUMBER" \
          --project-root "$PROJECT_ROOT_WIN" \
          > "$LOGD/digest-teams.log" 2>&1
      ) &
      PID_DIGEST_TEAMS=$!
    fi
  else
    echo "DIGEST_SKIP|teams|delta=0|existing=teams-digest.md" > "$LOGD/digest-teams.log"
  fi

  # OneNote digest: delta > 0 OR no existing digest
  PID_DIGEST_ONENOTE=""
  if [ "$ONENOTE_DELTA" -gt 0 ] || [ ! -f "$CASE_DIR_ABS/onenote/onenote-digest.md" ]; then
    if ls "$CASE_DIR_ABS/onenote/_page-"*.md 2>/dev/null | head -1 > /dev/null 2>&1; then
      (
        python3 "$DIGEST_SCRIPT" --type onenote \
          --case-dir "$CASE_DIR_ABS" --case-number "$CASE_NUMBER" \
          --project-root "$PROJECT_ROOT_WIN" \
          > "$LOGD/digest-onenote.log" 2>&1
      ) &
      PID_DIGEST_ONENOTE=$!
    fi
  else
    echo "DIGEST_SKIP|onenote|delta=0|existing=onenote-digest.md" > "$LOGD/digest-onenote.log"
  fi

  # Wait for both digest jobs (if launched)
  [ -n "$PID_DIGEST_TEAMS" ] && wait "$PID_DIGEST_TEAMS" 2>/dev/null || true
  [ -n "$PID_DIGEST_ONENOTE" ] && wait "$PID_DIGEST_ONENOTE" 2>/dev/null || true

  echo "✅ Digest generation done."
fi

echo "✅ Aggregating..."

# ── Aggregate via inline python3 (deltaContent generator + output JSON) ──
TOP_END_TS=$(date -u +%FT%TZ)
TOP_DUR_MS=$(( ($(date +%s%N) - TOP_START_NS) / 1000000 ))
ELAPSED_SEC=$(awk "BEGIN{printf \"%.1f\", $TOP_DUR_MS/1000}")

EVT_DIR_PY="$EVT_DIR" CASE_DIR_PY="$CASE_DIR_ABS" CASE_NUM_PY="$CASE_NUMBER" \
  IS_AR_PY="$IS_AR" OUT_DIR_PY="$OUT_DIR" ELAPSED_PY="$ELAPSED_SEC" \
  PYTHONIOENCODING=utf-8 \
  python3 - > "$OUT_DIR/.aggregate-status" 2> "$OUT_DIR/.aggregate-stderr" <<'PYEOF'
import json, os, pathlib, re, sys

evt = pathlib.Path(os.environ['EVT_DIR_PY'])
case_dir = pathlib.Path(os.environ['CASE_DIR_PY'])
case_num = os.environ['CASE_NUM_PY']
is_ar = os.environ['IS_AR_PY'] == 'true'
out_dir = pathlib.Path(os.environ['OUT_DIR_PY'])
elapsed = float(os.environ['ELAPSED_PY'])

def load_evt(name):
    p = evt / f'{name}.json'
    if not p.exists(): return {}
    try: return json.loads(p.read_text(encoding='utf-8'))
    except Exception: return {}

# --- L1/L2/L3 grading (§2.2) ---
L1 = ['d365']
L2 = ['teams', 'icm', 'onenote', 'attachments']
# labor is folded inside d365 event as delta.laborRecords — no separate grading

def map_status(ev):
    s = ev.get('status', 'missing')
    if s == 'completed': return 'OK'
    if s == 'failed': return 'FAILED'
    if s == 'active':  return 'TIMEOUT'  # watchdog killed before completed
    return 'MISSING'

sources = {}
for name in L1 + L2:
    ev = load_evt(name)
    sources[name] = {
        'status': map_status(ev),
        'delta': ev.get('delta') or {},
        'error': ev.get('error'),
        'durationMs': ev.get('durationMs'),
    }

# Merge labor delta from d365 (surfacing per PRD §4.2 row)
d365_delta = sources['d365']['delta']
sources['labor'] = {
    'status': 'OK' if sources['d365']['status'] == 'OK' else sources['d365']['status'],
    'delta': {
        'records':     d365_delta.get('laborRecords', 0),
        'todayLogged': d365_delta.get('laborTodayLogged', False),
        # Task 5.4h: true delta vs previous labor.md Total snapshot.
        # Without this, "labor delta" was today-only → invisible when logging
        # happens across day boundaries.
        'newRecords':  d365_delta.get('newLaborRecords', 0),
        'prevRecords': d365_delta.get('prevLaborRecords', 0),
    },
}

# --- overallStatus decision (L1 fail = FAILED exit 1) ---
l1_fail = any(sources[x]['status'] == 'FAILED' for x in L1)
l2_fail = [x for x in L2 if sources[x]['status'] in ('FAILED', 'TIMEOUT')]

if l1_fail:
    overall = 'FAILED'
elif l2_fail:
    overall = 'DEGRADED'
else:
    overall = 'OK'

# --- refreshResults flattened per §4.2 ---
refresh_results = {
    'd365':        {'status': sources['d365']['status'],
                    'newEmails': d365_delta.get('newEmails', 0),
                    'newNotes':  d365_delta.get('newNotes', 0),
                    'snapshotFresh': d365_delta.get('snapshotFresh', False)},
    'teams':       {'status': sources['teams']['status'],
                    'newChats':    sources['teams']['delta'].get('newChats', 0),
                    'newMessages': sources['teams']['delta'].get('newMessages', 0)},
    'icm':         {'status': sources['icm']['status'],
                    'newEntries': sources['icm']['delta'].get('newEntries', 0)},
    'onenote':     {'status': sources['onenote']['status'],
                    'newPages': sources['onenote']['delta'].get('newPages', 0),
                    'updatedPages': sources['onenote']['delta'].get('updatedPages', 0)},
    'attachments': {'status': sources['attachments']['status'],
                    'downloaded': sources['attachments']['delta'].get('downloaded', 0),
                    'skipped':    sources['attachments']['delta'].get('skipped', 0)},
    'labor':       {'status': sources['labor']['status'],
                    'records': sources['labor']['delta']['records'],
                    'newRecords': sources['labor']['delta']['newRecords'],
                    'prevRecords': sources['labor']['delta']['prevRecords'],
                    'todayLogged': sources['labor']['delta']['todayLogged']},
}
for k, v in refresh_results.items():
    err = sources.get(k, {}).get('error')
    if err: v['error'] = err

# --- DELTA_STATUS (§2.2 DELTA_EMPTY gate) ---
total_delta = (
    refresh_results['d365']['newEmails'] +
    refresh_results['d365']['newNotes'] +
    refresh_results['icm']['newEntries'] +
    refresh_results['teams']['newMessages'] +
    refresh_results['onenote']['newPages'] +
    refresh_results['onenote']['updatedPages'] +
    refresh_results['attachments']['downloaded'] +
    refresh_results['labor']['newRecords']
)
delta_status = 'DELTA_EMPTY' if total_delta == 0 else 'DELTA_OK'

# --- deltaContent markdown (distributed delta sumup) ---
def tail_lines(path, n):
    try:
        with open(path, 'r', encoding='utf-8', errors='replace') as f:
            return ''.join(f.readlines()[-n:])
    except Exception:
        return ''

def head_lines(path, n):
    try:
        with open(path, 'r', encoding='utf-8', errors='replace') as f:
            return ''.join(f.readlines()[:n])
    except Exception:
        return ''

md_lines = [f'# Delta Since Last Refresh', '',
            f'> Case: `{case_num}` | AR: `{is_ar}` | Elapsed: {elapsed}s | Status: **{delta_status}**', '']

rd = refresh_results
if rd['d365']['newEmails'] > 0 or rd['d365']['newNotes'] > 0:
    md_lines += [f"## 📧 D365", f"- 新邮件: **{rd['d365']['newEmails']}** 封",
                 f"- 新 Notes: **{rd['d365']['newNotes']}** 条",
                 f"- Snapshot: {'fresh (no change)' if rd['d365']['snapshotFresh'] else 'refreshed'}", '']
    emails_path = case_dir / 'emails.md'
    if rd['d365']['newEmails'] > 0 and emails_path.exists():
        tail = tail_lines(emails_path, max(60, rd['d365']['newEmails'] * 50))
        md_lines += ['### 📎 最新邮件节选 (emails.md tail)', '```', tail[-8000:], '```', '']

if rd['icm']['newEntries'] > 0:
    md_lines += [f"## 🎫 ICM Discussion", f"- 新增 **{rd['icm']['newEntries']}** 条 entry", '']
    icm_raw = case_dir / 'icm' / '_icm-portal-raw.json'
    if icm_raw.exists():
        try:
            raw = json.loads(icm_raw.read_text(encoding='utf-8'))
            items = raw.get('discussions', {}).get('Items', [])[-rd['icm']['newEntries']:]
            for it in items[-3:]:  # cap at last 3 to bound size
                ts = it.get('EntryDate', '')
                author = (it.get('SubmittedBy') or {}).get('EmailAddress', 'unknown')
                desc = re.sub('<[^>]+>', '', it.get('Description', ''))[:500]
                md_lines += [f"- **{ts}** @ {author}", f"  > {desc}", '']
        except Exception:
            pass

if rd['teams']['newMessages'] > 0:
    md_lines += [f"## 💬 Teams", f"- {rd['teams']['newChats']} chats / **{rd['teams']['newMessages']}** msgs",
                 f"- 详见 `teams/teams-digest.md` (Step 2 生成)", '']

if rd['onenote']['newPages'] > 0 or rd['onenote']['updatedPages'] > 0:
    md_lines += [f"## 📚 OneNote",
                 f"- 新增 **{rd['onenote']['newPages']}** 页 / 更新 **{rd['onenote']['updatedPages']}** 页",
                 f"- 详见 `onenote/onenote-digest.md`", '']

if rd['attachments']['downloaded'] > 0:
    md_lines += [f"## 📎 Attachments", f"- 新下载: **{rd['attachments']['downloaded']}** 个",
                 f"- 跳过: {rd['attachments']['skipped']} 个 (已存在)", '']

if rd['labor']['status'] == 'OK':
    md_lines += [f"## ⏱️ Labor",
                 f"- 累计: {rd['labor']['records']} 条 (上次: {rd['labor']['prevRecords']})",
                 f"- 新增: **{rd['labor']['newRecords']}** 条",
                 f"- 今日已记录: {'✅' if rd['labor']['todayLogged'] else '❌'}", '']

if delta_status == 'DELTA_EMPTY':
    md_lines += ['## _DELTA_EMPTY_', '所有数据源均无新增内容。Step 2 可直接复用 meta.actualStatus。', '']

delta_md = '\n'.join(md_lines) + '\n'
(out_dir / 'delta-content.md').write_text(delta_md, encoding='utf-8')

# --- context packaging ---
meta_path = case_dir / 'casework-meta.json'
meta_obj = {}
if meta_path.exists():
    try: meta_obj = json.loads(meta_path.read_text(encoding='utf-8'))
    except Exception: meta_obj = {}

ctx = {
    'meta': meta_obj,
    'caseInfoHead': head_lines(case_dir / 'case-info.md', 60),
    'emailsTail':   tail_lines(case_dir / 'emails.md', 200),
    'deltaContent': delta_md,
    'teamsDigest':  {'path': './teams/teams-digest.md',
                     'exists': (case_dir / 'teams' / 'teams-digest.md').exists()},
    'icmSummary':   {'path': './icm/_icm-summary.md',
                     'exists': (case_dir / 'icm' / '_icm-summary.md').exists()},
    'icmDiscussionsRawPath': './icm/_icm-portal-raw.json',
}

# --- days-since-last-contact (best-effort from meta) ---
dslc = meta_obj.get('daysSinceLastContact', None)

output = {
    'caseNumber': case_num,
    'caseDir': str(case_dir),
    'isAR': is_ar,
    'refreshResults': refresh_results,
    'overallStatus': overall,
    'degradedSources': l2_fail,
    'failedSources': [x for x in L1 if sources[x]['status'] == 'FAILED'],
    'deltaStatus': delta_status,
    'daysSinceLastContact': dslc,
    'context': ctx,
    'elapsed': elapsed,
}

if overall != 'FAILED':
    (out_dir / 'data-refresh-output.json').write_text(
        json.dumps(output, ensure_ascii=False, indent=2), encoding='utf-8')

# stdout: aggregate-status payload for the shell to pick up
print(json.dumps({'overall': overall, 'delta': delta_status,
                  'degraded': l2_fail,
                  'totalDelta': total_delta}))
PYEOF

AGG=$(cat "$OUT_DIR/.aggregate-status")
OVERALL=$(echo "$AGG" | python3 -c "import json,sys; print(json.load(sys.stdin)['overall'])")
DELTA=$(echo "$AGG"   | python3 -c "import json,sys; print(json.load(sys.stdin)['delta'])")

# ── Top-level data-refresh.json final event ──
if [ "$OVERALL" = "FAILED" ]; then
  bash "$WRITE_EVENT" "$EVT_DIR/data-refresh.json" \
    "{\"task\":\"data-refresh\",\"status\":\"failed\",\"startedAt\":\"$TOP_START_TS\",\"durationMs\":$TOP_DUR_MS,\"error\":\"L1 source failed\"}"
  echo "❌ DATA_REFRESH_FAILED|case=$CASE_NUMBER|elapsed=${ELAPSED_SEC}s"
  exit 1
fi

bash "$WRITE_EVENT" "$EVT_DIR/data-refresh.json" \
  "{\"task\":\"data-refresh\",\"status\":\"completed\",\"startedAt\":\"$TOP_START_TS\",\"completedAt\":\"$TOP_END_TS\",\"durationMs\":$TOP_DUR_MS,\"delta\":{\"overall\":\"$OVERALL\",\"deltaStatus\":\"$DELTA\"}}"

echo "✅ DATA_REFRESH_OK|case=$CASE_NUMBER|overall=$OVERALL|delta=$DELTA|elapsed=${ELAPSED_SEC}s"
exit 0

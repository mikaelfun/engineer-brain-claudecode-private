#!/usr/bin/env bash
# teams-search-inline.sh — 内联 Teams 搜索（直接调 agency HTTP proxy）
#
# 替代 request.json + teams-search-queue agent 机制。
# 每个 case 独立启动 agency proxy，搜索完毕后关闭。完全并行安全。
#
# 用法: bash teams-search-inline.sh \
#   --case-number 2601290030000748 \
#   --case-dir ../EngineerBrain-Data/cases/active/2601290030000748 \
#   --contact-email "" \
#   [--port 9900]
#
# 输出: TEAMS_OK|chats=N|msgs=M|elapsed=Xs
#        或 TEAMS_SKIP|reason=...
#        或 TEAMS_FAIL|reason=...
set -uo pipefail

CASE_NUMBER="" CASE_DIR="" CONTACT_EMAIL="" PORT=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --case-number)    CASE_NUMBER="$2"; shift 2 ;;
    --case-dir)       CASE_DIR="$2"; shift 2 ;;
    --contact-email)  CONTACT_EMAIL="$2"; shift 2 ;;
    --port)           PORT="$2"; shift 2 ;;
    *) shift ;;
  esac
done

[ -z "$CASE_NUMBER" ] || [ -z "$CASE_DIR" ] && { echo "TEAMS_FAIL|reason=missing args" >&2; exit 1; }

# ═══════════════════════════════════════════
# Event emission setup (casework-v2 Step 1 observability)
# ═══════════════════════════════════════════
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"
WRITE_EVENT="$PROJECT_ROOT/skills/casework/scripts/write-event.sh"
EVENT_DIR="$CASE_DIR/.casework/events"

START_TS=$(date -u +%FT%TZ)
START_NS=$(date +%s%N)

if [ -f "$WRITE_EVENT" ]; then
  mkdir -p "$EVENT_DIR"
  bash "$WRITE_EVENT" "$EVENT_DIR/teams.json" \
    "{\"task\":\"teams\",\"status\":\"active\",\"startedAt\":\"$START_TS\"}"
fi

# ═══════════════════════════════════════════
# Task 5.4i: Terminal-event sentinel.
# Every `exit` path below (agency.exe missing, proxy start timeout, python
# failure, trap-caught interrupts) used to leave teams.json at status=active,
# which data-refresh aggregator maps to TIMEOUT → spurious DEGRADED.
# Trap on EXIT writes `failed` event iff no explicit terminal event ran.
# Mirrors attachments.ps1 Exit-WithEvent pattern (Task 5.4a) at shell scope.
# ═══════════════════════════════════════════
TEAMS_EVENT_WRITTEN=0
mark_event_written() { TEAMS_EVENT_WRITTEN=1; }
write_failed_event() {
  local reason="$1"
  if [ -f "$WRITE_EVENT" ] && [ -d "$EVENT_DIR" ]; then
    local end_ts dur_ms
    end_ts=$(date -u +%FT%TZ)
    dur_ms=$(( ($(date +%s%N) - START_NS) / 1000000 ))
    bash "$WRITE_EVENT" "$EVENT_DIR/teams.json" \
      "{\"task\":\"teams\",\"status\":\"failed\",\"startedAt\":\"$START_TS\",\"completedAt\":\"$end_ts\",\"durationMs\":$dur_ms,\"error\":\"$reason\"}" 2>/dev/null || true
  fi
}

AGENCY_EXE="$APPDATA/agency/CurrentVersion/agency.exe"
[ ! -f "$AGENCY_EXE" ] && { echo "TEAMS_FAIL|reason=agency.exe not found"; exit 1; }

# Auto-assign port from case number hash if not specified
if [ -z "$PORT" ]; then
  PORT=$(python3 -c "print(9900 + hash('$CASE_NUMBER') % 100)" 2>/dev/null || echo 9950)
fi

mkdir -p "$CASE_DIR/teams"
T0=$(date +%s)

# ═══════════════════════════════════════════
# Start agency HTTP proxy (per-case instance)
# ═══════════════════════════════════════════

# Pre-launch: if a stale agency is squatting on our port, kill ONLY that PID.
# Covers orphans from previous runs where EXIT trap didn't fire (e.g. session
# disconnect, Ctrl+C race). Does NOT touch agency processes on other ports.
STALE_PID=$(netstat -ano 2>/dev/null | grep -E "127\.0\.0\.1:$PORT\s.*LISTENING" | awk '{print $NF}' | head -1)
if [ -n "$STALE_PID" ] && [ "$STALE_PID" != "0" ]; then
  echo "  ⚠ port $PORT occupied by PID $STALE_PID — killing stale agency" >&2
  taskkill //PID "$STALE_PID" //F >/dev/null 2>&1 || true
  sleep 0.5
fi

"$AGENCY_EXE" mcp teams --transport http --port "$PORT" > /dev/null 2>&1 &
APID=$!
# Task 5.4i: trap chains proxy-kill + event-sentinel. If any `exit` below fires
# without mark_event_written, emit a failed event so aggregator sees a terminal
# state instead of mapping leftover active → TIMEOUT.
trap '
  kill $APID 2>/dev/null
  if [ "${TEAMS_EVENT_WRITTEN:-0}" = "0" ]; then
    write_failed_event "script exited without terminal event"
  fi
' EXIT

# Wait for proxy ready. Two-phase validation (ISS-216 fix):
# Phase 1: poll until HTTP 200 + SSE body (proxy is listening).
# Phase 2: parse initialize response to detect upstream outage:
#   - "UnexpectedError" in body → upstream service down → retry w/ 10s gap, fail-fast after 3
#   - -32700 parse error → chronic upstream quirk (initialize returns non-standard
#     response missing jsonrpc field); proxy+auth are fine, tools/call works → treat as ready
#   - "result" in body → clean ready
WAITED=0
INIT_OUTAGE_COUNT=0
INIT_BODY=""
while [ $WAITED -lt 50 ]; do
  INIT_RAW=$(curl -s -w "\n%{http_code}" --max-time 10 -X POST "http://localhost:$PORT/" \
    -H "Content-Type: application/json" -H "Accept: application/json, text/event-stream" \
    -d '{"jsonrpc":"2.0","id":0,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"teams-inline","version":"1.0"}}}' 2>/dev/null || true)
  INIT_STATUS=$(echo "$INIT_RAW" | tail -1)
  INIT_BODY=$(echo "$INIT_RAW" | sed '$d' | grep -o 'data: {.*}' | sed 's/^data: //' | head -1)
  if [ "$INIT_STATUS" = "200" ] && [ -n "$INIT_BODY" ]; then
    # Proxy is up. Check for upstream outage signal.
    if echo "$INIT_BODY" | grep -q '"UnexpectedError"'; then
      INIT_OUTAGE_COUNT=$((INIT_OUTAGE_COUNT + 1))
      echo "  ⚠ initialize: upstream UnexpectedError (#$INIT_OUTAGE_COUNT) — ${INIT_BODY:0:200}" >&2
      if [ $INIT_OUTAGE_COUNT -ge 3 ]; then
        echo "TEAMS_FAIL|reason=upstream_init_error:UnexpectedError (${INIT_OUTAGE_COUNT}x)"
        exit 1
      fi
      sleep 10
      WAITED=$((WAITED + 5))
      continue
    fi
    # -32700 parse error / any other response = proxy ready (tools/call works fine)
    echo "  ✓ proxy ready (init: ${INIT_BODY:0:120})" >&2
    break
  fi
  sleep 0.2; WAITED=$((WAITED + 1))
done
[ $WAITED -ge 50 ] && { echo "TEAMS_FAIL|reason=proxy start timeout (last init: ${INIT_BODY:0:200})"; exit 1; }

# ═══════════════════════════════════════════
# MCP searches → temp files → Python parses + fetches messages → dump
# ═══════════════════════════════════════════

# Temp dir via python (Windows-safe)
WD=$(MCP_CN="$CASE_NUMBER" python3 -c "
import tempfile,os
d=os.path.join(tempfile.gettempdir(),'teams-inline',os.environ['MCP_CN'])
os.makedirs(d,exist_ok=True)
print(d)
")

# mcp_search_with_retry <req-id> <query-string> <size> <outfile>
# Issues a tools/call with retry + exponential backoff.
# ISS-216 lessons: (P1) 2 retries @ 5s was too few for 60s+ upstream outages;
# (P3) generic "empty/error" log hid upstream body — now surfaces first 200 chars.
mcp_search_with_retry() {
  local rid="$1" qs="$2" size="$3" outfile="$4"
  local body="{\"jsonrpc\":\"2.0\",\"id\":$rid,\"method\":\"tools/call\",\"params\":{\"name\":\"SearchTeamMessagesQueryParameters\",\"arguments\":{\"queryString\":\"$qs\",\"size\":$size}}}"
  local attempt=0 max_retries=3
  while [ $attempt -lt $max_retries ]; do
    curl -s --max-time 30 -X POST "http://localhost:$PORT/" \
      -H "Content-Type: application/json" -H "Accept: application/json, text/event-stream" \
      -d "$body" 2>/dev/null | grep -o 'data: {.*}' | sed 's/^data: //' | head -1 > "$outfile"
    # Success criterion: file non-empty AND contains a JSON-RPC result (not an error wrapper)
    if [ -s "$outfile" ] && grep -q '"result"' "$outfile"; then
      [ $attempt -gt 0 ] && echo "  ↻ search retry $((attempt)) succeeded for qs='$qs'" >&2
      return 0
    fi
    attempt=$((attempt + 1))
    # P3 (ISS-216): Surface actual error body — no more blind "empty/error"
    local err_body=""
    [ -s "$outfile" ] && err_body=$(head -c 200 "$outfile")
    if [ $attempt -lt $max_retries ]; then
      # P1: exponential backoff — 5s → 10s → (exit). Covers 15s total gap;
      # original 5s single retry couldn't survive 60s+ upstream outages.
      local sleep_secs=$((5 * attempt))
      echo "  ⚠ search attempt $attempt/$max_retries failed for qs='$qs' (body: ${err_body:-<empty>}), sleeping ${sleep_secs}s…" >&2
      sleep $sleep_secs
    else
      echo "  ✗ search exhausted $max_retries attempts for qs='$qs' (last body: ${err_body:-<empty>})" >&2
    fi
  done
  return 1
}

# Search by case number (with 1 retry on transient auth failure)
mcp_search_with_retry 10 "$CASE_NUMBER" 25 "$WD/q1.json" || true

# Search by contact email (optional)
if [ -n "$CONTACT_EMAIL" ]; then
  mcp_search_with_retry 11 "from:$CONTACT_EMAIL" 5 "$WD/q2.json" || true
fi

# Python: parse chatIds → fetch messages → dump _mcp-raw.json
# All paths via env vars (avoids Windows backslash escaping in heredoc)
# Captured in PY_OUTPUT so final event can report accurate counts.
set +e
PY_OUTPUT=$(MCP_WD="$WD" MCP_CASE_DIR="$CASE_DIR" MCP_CASE_NUMBER="$CASE_NUMBER" \
  MCP_CONTACT_EMAIL="$CONTACT_EMAIL" MCP_PORT="$PORT" MCP_T0="$T0" \
  MCP_EVENT_DIR="$EVENT_DIR" MCP_START_TS="$START_TS" \
  python3 << 'PYEOF'
import json, os, subprocess, time

wd = os.environ['MCP_WD']
case_dir = os.environ['MCP_CASE_DIR']
case_number = os.environ['MCP_CASE_NUMBER']
contact_email = os.environ.get('MCP_CONTACT_EMAIL', '')
port = os.environ['MCP_PORT']
t0 = int(os.environ['MCP_T0'])

def load_resp(name):
    p = os.path.join(wd, name)
    if not os.path.exists(p) or os.path.getsize(p) == 0:
        return None
    try:
        return json.load(open(p, encoding='utf-8'))
    except:
        return None

def extract_chat_ids(resp):
    ids = set()
    if not resp:
        return ids
    for c in resp.get('result', {}).get('content', []):
        text = c.get('text', '')
        try:
            raw = json.loads(text)
            rr = raw.get('rawResponse', '')
            if rr:
                data = json.loads(rr)
                for v in data.get('value', []):
                    for hc in v.get('hitsContainers', []):
                        for hit in hc.get('hits', []):
                            cid = hit.get('resource', {}).get('chatId', '')
                            if cid:
                                ids.add(cid)
            chats = raw.get('chats', [])
            if isinstance(chats, list):
                for ch in chats:
                    cid = ch.get('id', '')
                    if cid:
                        ids.add(cid)
        except:
            pass
    return ids

def mcp_call(tid, tool, args):
    body = json.dumps({
        "jsonrpc": "2.0", "id": tid,
        "method": "tools/call",
        "params": {"name": tool, "arguments": args}
    })
    try:
        r = subprocess.run(
            ['curl', '-s', '--max-time', '60', '-X', 'POST',
             f'http://localhost:{port}/',
             '-H', 'Content-Type: application/json',
             '-H', 'Accept: application/json, text/event-stream',
             '-d', body],
            capture_output=True, text=True, timeout=65
        )
        for line in r.stdout.split('\n'):
            if line.startswith('data: {'):
                return json.loads(line[6:])
    except:
        pass
    return None

# Load search results from files
q1 = load_resp('q1.json')
q2 = load_resp('q2.json')

# Extract all chatIds
all_ids = extract_chat_ids(q1) | extract_chat_ids(q2)

# ── _relevance.json skip list (Step 2 LLM 评分过的 low-relevance chatIds) ──
# 设计背景: teams-search SKILL.md §relevance — Step 2 assess 的 LLM 会给每个
# chatId 打 high/low 分，写入 _relevance.json。一旦被标 low，就是"下游不关心"
# 的噪音（bot 消息 / 不相关同事闲聊等）。
# 这里读取 _relevance.json.low 列表，从 all_ids 里 subtract 掉 →
# 后面 ListChatMessages 不再拉这些 chat → 省 MCP 调用 + 不污染 delta。
# 首次运行（_relevance.json 不存在）自然 no-op，拉全量，走 Step 2 评分路径。
rel_path = os.path.join(case_dir, 'teams', '_relevance.json')
low_ids = set()
if os.path.exists(rel_path):
    try:
        rel = json.load(open(rel_path, encoding='utf-8'))
        # schema: {chats: {fileName: {chatIds: [...], relevance: 'low'|'high'}}}
        # or flatter: {chatIds: {cid: {relevance: 'low'}}} — defend both.
        chats_node = rel.get('chats') or {}
        if isinstance(chats_node, dict):
            for _fn, info in chats_node.items():
                if (info or {}).get('relevance') == 'low':
                    for cid in (info.get('chatIds') or []):
                        low_ids.add(cid)
        # fallback flat form
        flat = rel.get('chatIds') or {}
        if isinstance(flat, dict):
            for cid, info in flat.items():
                if (info or {}).get('relevance') == 'low':
                    low_ids.add(cid)
    except Exception as e:
        print(f'WARN: _relevance.json parse failed: {e}', file=__import__("sys").stderr)

skipped_count = len(all_ids & low_ids)
all_ids = all_ids - low_ids
if skipped_count:
    print(f'RELEVANCE_SKIP|count={skipped_count}', file=__import__("sys").stderr)

# Fetch messages for each chat — PARALLEL via ThreadPoolExecutor.
# Per-token throttle validated (Apr 17 experiments): ≤6 concurrent calls
# on a single proxy = clean 200s; 8+ triggers 502/504. We cap at 3 to
# stay well below the threshold and leave headroom for auth contention.
# (Cross-case concurrency is safe: each case has its own proxy/token bucket.)
import concurrent.futures

# fetch_one_chat: single call with 1 retry on transient upstream 502/504/empty.
# Graph's Teams backend occasionally returns 502 under load — a quick retry
# on the same warm proxy typically succeeds in ~1-2s.
def fetch_one_chat(args):
    call_id, chat_id = args
    msgs = []
    import time as _t
    for attempt in range(2):
        resp = mcp_call(call_id + attempt * 1000, 'ListChatMessages', {'chatId': chat_id, 'top': 20})
        if resp and not resp.get('error'):
            for c in resp.get('result', {}).get('content', []):
                try:
                    raw = json.loads(c.get('text', ''))
                    maybe = raw.get('messages', None)
                    if maybe is not None:  # empty list still means "server responded cleanly"
                        msgs = maybe
                        return chat_id, msgs
                except:
                    pass
        # retry only if we got nothing usable — 5s gap lets transient 502/504
        # upstream throttling clear before second attempt (same rationale as
        # shell-side mcp_search_with_retry).
        if attempt == 0:
            _t.sleep(5)
    return chat_id, msgs

chat_messages = {}
sorted_ids = sorted(all_ids)

# Progress event writer (atomic tmp+replace). Silently no-ops if
# EVENT_DIR/START_TS not set, keeping backwards compat with callers
# that don't enable events.
event_dir = os.environ.get('MCP_EVENT_DIR', '')
start_ts = os.environ.get('MCP_START_TS', '')

def _write_progress(done, total):
    if not event_dir or not start_ts:
        return
    payload = json.dumps({
        "task": "teams", "status": "active",
        "startedAt": start_ts,
        "progress": {"done": done, "total": total}
    })
    tmp = os.path.join(event_dir, f'teams.json.tmp.{os.getpid()}.{done}')
    final = os.path.join(event_dir, 'teams.json')
    try:
        with open(tmp, 'w', encoding='utf-8') as f:
            f.write(payload)
        os.replace(tmp, final)
    except OSError:
        pass

if sorted_ids:
    tasks = [(20 + i, cid) for i, cid in enumerate(sorted_ids)]
    total = len(tasks)
    done_count = 0
    _write_progress(0, total)
    with concurrent.futures.ThreadPoolExecutor(max_workers=min(len(tasks), 3)) as ex:
        futures = {ex.submit(fetch_one_chat, t): t for t in tasks}
        for fut in concurrent.futures.as_completed(futures):
            try:
                chat_id, msgs = fut.result()
                chat_messages[chat_id] = msgs
            except Exception:
                pass
            done_count += 1
            _write_progress(done_count, total)
else:
    pass  # no chats found

# Build search results
search_results = [{'keyword': case_number, 'status': 'success' if q1 else 'error',
                    'chatIds': list(extract_chat_ids(q1))}]
if contact_email:
    search_results.append({'keyword': f'from:{contact_email}',
                           'status': 'success' if q2 else 'error',
                           'chatIds': list(extract_chat_ids(q2))})

# Dump _mcp-raw.json
elapsed = int(time.time()) - t0
raw = {
    '_version': 2,
    '_fetchedAt': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
    'caseNumber': case_number,
    'searchResults': search_results,
    'chatMessages': chat_messages,
    'searchMode': 'full',
    'fallbackTriggered': False,
    'elapsed': elapsed
}
out_path = os.path.join(case_dir, 'teams', '_mcp-raw.json')
os.makedirs(os.path.dirname(out_path), exist_ok=True)
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(raw, f, indent=2, ensure_ascii=False)

total_msgs = sum(len(v) for v in chat_messages.values())

# ── True delta computation (casework-v2 fix for 157-false-positive bug) ──
# Previous behavior: emitted total_msgs as "newMessages" → every refresh
# looked like a big delta even when nothing changed.
# New behavior: diff each msg.createdDateTime against previous run's
# _chat-index.json[chatId].lastMessageTime (same pattern as ICM's
# computeNewEntries). Absent prev index = first run = all new.
chat_index_path = os.path.join(case_dir, 'teams', '_chat-index.json')
prev_index = {}
if os.path.exists(chat_index_path):
    try:
        prev_index = json.load(open(chat_index_path, encoding='utf-8'))
        # _chat-index.json is keyed by chatId → {lastMessageTime, ...}
        if not isinstance(prev_index, dict):
            prev_index = {}
    except Exception:
        prev_index = {}

new_msgs_total = 0
new_chats_count = 0
for chat_id, msgs in chat_messages.items():
    prev_last = (prev_index.get(chat_id) or {}).get('lastMessageTime', '')
    if not msgs:
        continue
    # ISO-8601 strings sort lexicographically when normalized (Z suffix).
    chat_new = [m for m in msgs if (m.get('createdDateTime', '') or '') > prev_last]
    if chat_new:
        new_msgs_total += len(chat_new)
        # A "new chat" = either no prev entry OR prev entry but new msgs arrived.
        # We count any chat with >=1 new msg; first-run = all chats are new.
        if not prev_last:
            new_chats_count += 1
        else:
            # existing chat with incremental messages — count toward newMsgs but
            # NOT newChats (chat itself isn't new). This mirrors user intent.
            pass

# ── Update _chat-index.json baseline for ALL fetched chats (Task 5.4f fix) ──
# Root cause of 40-msg/2-chat recurring false-positive: write-teams.ps1 drops
# chats with empty displayName (bots/SfB history), so those chatIds never enter
# _chat-index.json. Next run's diff sees them as "unseen" → re-flagged as new
# forever. Fix: register a lastMessageTime entry for EVERY chatId we fetched,
# independent of whether write-teams will keep it.
# write-teams.ps1's Save-ChatIndex merges — preserves our entries for dropped chats.
for chat_id, msgs in chat_messages.items():
    if not msgs:
        continue
    last_time = max((m.get('createdDateTime', '') or '' for m in msgs), default='')
    if not last_time:
        continue
    entry = prev_index.get(chat_id)
    if not isinstance(entry, dict):
        entry = {}
    entry['lastMessageTime'] = last_time
    prev_index[chat_id] = entry
prev_index['_lastFetchedAt'] = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
try:
    with open(chat_index_path, 'w', encoding='utf-8') as cif:
        json.dump(prev_index, cif, ensure_ascii=False, indent=2)
except OSError as e:
    print(f'WARN: chat-index baseline write failed: {e}', file=__import__("sys").stderr)

# Contract: if EVERY search returned error, treat as failure so the
# event layer writes status=failed (not a false 'completed|chats=0').
# A genuine "no results" case has status=success with empty chatIds.
if search_results and all(sr.get('status') == 'error' for sr in search_results):
    reasons = '+'.join(sr['keyword'] for sr in search_results)
    print(f'TEAMS_FAIL|reason=all {len(search_results)} search(es) errored ({reasons})|elapsed={elapsed}s')
    import sys; sys.exit(1)

# Emit both totals and deltas. Shell grabs newMsgs/newChats for event delta.
# `msgs=`/`chats=` kept for back-compat with any caller that parses them.
print(f'TEAMS_OK|chats={len(chat_messages)}|msgs={total_msgs}|newMsgs={new_msgs_total}|newChats={new_chats_count}|elapsed={elapsed}s')
PYEOF
)
TEAMS_EXIT=$?
set -e
# Relay python stdout to callers (preserves TEAMS_OK|... contract)
echo "$PY_OUTPUT"

# ═══════════════════════════════════════════
# Write final event (completed | failed)
# ═══════════════════════════════════════════
if [ -f "$WRITE_EVENT" ]; then
  END_TS=$(date -u +%FT%TZ)
  DURATION_MS=$(( ($(date +%s%N) - START_NS) / 1000000 ))
  # Totals (for logging / backwards compat)
  # `|| true` suffix: when python reports TEAMS_FAIL, these fields are absent
  # and grep exits 1 → pipefail propagates → set -e kills the script before
  # the explicit failed-event write. Tolerate missing fields; `${VAR:-0}`
  # below supplies the default.
  TOTAL_CHATS=$(echo "$PY_OUTPUT" | grep -oE '\|chats=[0-9]+' | head -1 | cut -d= -f2 || true)
  TOTAL_MSGS=$(echo "$PY_OUTPUT"  | grep -oE '\|msgs=[0-9]+'  | head -1 | cut -d= -f2 || true)
  # True delta (casework-v2 — diffed against _chat-index.json.lastMessageTime)
  NEW_MSGS=$(echo  "$PY_OUTPUT" | grep -oE 'newMsgs=[0-9]+'  | head -1 | cut -d= -f2 || true)
  NEW_CHATS=$(echo "$PY_OUTPUT" | grep -oE 'newChats=[0-9]+' | head -1 | cut -d= -f2 || true)
  TOTAL_CHATS="${TOTAL_CHATS:-0}"; TOTAL_MSGS="${TOTAL_MSGS:-0}"
  NEW_MSGS="${NEW_MSGS:-0}"; NEW_CHATS="${NEW_CHATS:-0}"
  if [ "$TEAMS_EXIT" = "0" ]; then
    bash "$WRITE_EVENT" "$EVENT_DIR/teams.json" \
      "{\"task\":\"teams\",\"status\":\"completed\",\"startedAt\":\"$START_TS\",\"completedAt\":\"$END_TS\",\"durationMs\":$DURATION_MS,\"delta\":{\"newMessages\":$NEW_MSGS,\"newChats\":$NEW_CHATS,\"totalMessages\":$TOTAL_MSGS,\"totalChats\":$TOTAL_CHATS}}"
  else
    bash "$WRITE_EVENT" "$EVENT_DIR/teams.json" \
      "{\"task\":\"teams\",\"status\":\"failed\",\"startedAt\":\"$START_TS\",\"durationMs\":$DURATION_MS,\"error\":\"python exit $TEAMS_EXIT\"}"
  fi
  # Task 5.4i: both branches wrote a terminal event — tell trap to stand down.
  mark_event_written
fi

# Cleanup temp
rm -rf "$WD"
exit $TEAMS_EXIT

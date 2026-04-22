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
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../../../.." && pwd)"
UPDATE_STATE="$PROJECT_ROOT/.claude/skills/casework/scripts/update-state.py"
# ISS-231: subtask files under runs/{runId}/output/subtasks/
RUN_ID=$(python3 -c "import json,os; p=os.path.join(r'''$CASE_DIR''','.casework','state.json'); print(json.load(open(p,encoding='utf-8')).get('runId',''))" 2>/dev/null || echo "")
SUBTASK_DIR="$CASE_DIR/.casework/runs/$RUN_ID/data-refresh/subtasks"

START_TS=$(date -u +%FT%TZ)
START_NS=$(date +%s%N)

if [ -f "$UPDATE_STATE" ]; then
  mkdir -p "$SUBTASK_DIR"
  python3 "$UPDATE_STATE" --case-dir "$CASE_DIR" --step data-refresh --subtask teams --status active
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
  if [ -f "$UPDATE_STATE" ]; then
    local dur_ms
    dur_ms=$(( ($(date +%s%N) - START_NS) / 1000000 ))
    python3 "$UPDATE_STATE" --case-dir "$CASE_DIR" --step data-refresh --subtask teams --status failed --duration-ms "$dur_ms" 2>/dev/null || true
    # Write subtask delta file for aggregation
    [ -d "$SUBTASK_DIR" ] && echo '{"task":"teams","status":"failed","startedAt":"'"$START_TS"'","durationMs":'"$dur_ms"',"error":"'"$reason"'"}' > "$SUBTASK_DIR/teams.json" 2>/dev/null || true
  fi
}

AGENCY_EXE="$APPDATA/agency/CurrentVersion/agency.exe"
[ ! -f "$AGENCY_EXE" ] && { echo "TEAMS_FAIL|reason=agency.exe not found"; exit 1; }

# Auto-assign port from case number hash if not specified.
# MUST be deterministic: Python hash() is randomized per-process (PYTHONHASHSEED).
# Use hashlib instead — same case number always gets the same port.
if [ -z "$PORT" ]; then
  PORT=$(python3 -c "import hashlib; print(9900 + int(hashlib.md5('$CASE_NUMBER'.encode()).hexdigest(),16) % 100)" 2>/dev/null || echo 9950)
fi

mkdir -p "$CASE_DIR/teams"
T0=$(date +%s)

# ═══════════════════════════════════════════
# Pre-warm ic3 token for image download (runs in background, ~2s if cached)
# Token ready by the time MCP search finishes and image download begins
# ═══════════════════════════════════════════
python3 "$SCRIPT_DIR/warm-teams-token.py" 2>/dev/null &
PID_WARM_TOKEN=$!

# ═══════════════════════════════════════════
# ISS-236: Read Graph API token for parallel message fetch
# ═══════════════════════════════════════════
GRAPH_API_TOKEN=""
GRAPH_TOKEN_FILE="${TEMP:-/tmp}/graph-api-token.json"
GAT_PYPATH="$GRAPH_TOKEN_FILE"
command -v cygpath &>/dev/null && GAT_PYPATH="$(cygpath -m "$GRAPH_TOKEN_FILE")"

GRAPH_API_TOKEN=$(python3 -c "
import json, time
try:
    d = json.load(open('$GAT_PYPATH'))
    secret = d.get('secret', '')
    expires = int(d.get('expiresOn', '0'))
    now = int(time.time())
    if secret and len(secret) > 100 and (expires - now) > 120:
        print(secret)
except: pass
" 2>/dev/null)

if [ -n "$GRAPH_API_TOKEN" ]; then
  echo "  [Graph API] Token valid (len=${#GRAPH_API_TOKEN})" >&2
else
  echo "  [Graph API] No valid token, will use Agency for fetch" >&2
fi

# ═══════════════════════════════════════════
# ISS-236: Read cached chatIds from previous _mcp-raw.json
# ═══════════════════════════════════════════
CACHED_CHAT_IDS=""
RAW_JSON="$CASE_DIR/teams/_mcp-raw.json"
if [ -f "$RAW_JSON" ]; then
  RAW_PYPATH="$RAW_JSON"
  command -v cygpath &>/dev/null && RAW_PYPATH="$(cygpath -m "$RAW_JSON")"
  CACHED_CHAT_IDS=$(python3 -c "
import json
try:
    d = json.load(open('$RAW_PYPATH', encoding='utf-8'))
    ids = list((d.get('chatMessages') or {}).keys())
    if ids: print(','.join(ids))
except: pass
" 2>/dev/null)
  if [ -n "$CACHED_CHAT_IDS" ]; then
    _CACHED_COUNT=$(echo "$CACHED_CHAT_IDS" | tr ',' '\n' | wc -l | tr -d ' ')
    echo "  [Graph API] ${_CACHED_COUNT} cached chatIds from previous run" >&2
  fi
fi

# ═══════════════════════════════════════════
# Start agency HTTP proxy (per-case instance)
# ═══════════════════════════════════════════
# Agency startup serialization: multiple parallel casework agents starting
# agency.exe simultaneously causes upstream rate limiting on agent365.svc.
# Use a file lock to ensure only one agency starts at a time (2s gap).
AGENCY_LOCK="${TMPDIR:-/tmp}/agency-startup.lock"

acquire_agency_lock() {
  local waited=0
  while [ $waited -lt 30 ]; do
    if (set -o noclobber; echo $$ > "$AGENCY_LOCK") 2>/dev/null; then
      return 0
    fi
    # Check if lock holder is still alive
    local lock_pid=$(cat "$AGENCY_LOCK" 2>/dev/null)
    if [ -n "$lock_pid" ] && ! kill -0 "$lock_pid" 2>/dev/null; then
      rm -f "$AGENCY_LOCK"
      continue
    fi
    sleep 1; waited=$((waited + 1))
  done
  echo "  ⚠ agency lock timeout, proceeding anyway" >&2
  return 0
}

release_agency_lock() {
  rm -f "$AGENCY_LOCK" 2>/dev/null
}

# Pre-launch: if a stale agency is squatting on our port, kill ONLY that PID.
# Covers orphans from previous runs where EXIT trap didn't fire (e.g. session
# disconnect, Ctrl+C race). Does NOT touch agency processes on other ports.
STALE_PID=$(netstat -ano 2>/dev/null | grep -E "127\.0\.0\.1:$PORT\s.*LISTENING" | awk '{print $NF}' | head -1)
if [ -n "$STALE_PID" ] && [ "$STALE_PID" != "0" ]; then
  echo "  ⚠ port $PORT occupied by PID $STALE_PID — killing stale agency" >&2
  taskkill //PID "$STALE_PID" //F >/dev/null 2>&1 || true
  sleep 0.5
fi

# Serialize agency startup to avoid upstream rate limiting
acquire_agency_lock

"$AGENCY_EXE" mcp teams --transport http --port "$PORT" > /dev/null 2>&1 &
APID=$!
# Task 5.4i: trap chains proxy-kill + event-sentinel. If any `exit` below fires
# without mark_event_written, emit a failed event so aggregator sees a terminal
# state instead of mapping leftover active → TIMEOUT.
trap '
  kill $APID 2>/dev/null
  release_agency_lock 2>/dev/null
  if [ "${TEAMS_EVENT_WRITTEN:-0}" = "0" ]; then
    write_failed_event "script exited without terminal event"
  fi
' EXIT

# Wait for proxy ready. Two-phase validation (ISS-216 fix):
# Phase 1: poll until HTTP 200 + SSE body (proxy is listening).
# Phase 2: parse initialize response to detect upstream outage:
#   - "UnexpectedError" in body → upstream service down → retry w/ 10s gap, fail-fast after 3
#   - -32700 parse error → proxy started but upstream session broken → kill + restart proxy
#   - "result" in body → clean ready
WAITED=0
INIT_OUTAGE_COUNT=0
INIT_PARSE_ERROR_COUNT=0
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
    # -32700 parse error → proxy started but upstream session is broken.
    # tools/call will return empty body. Kill + restart proxy with backoff.
    if echo "$INIT_BODY" | grep -q '"code":-32700'; then
      INIT_PARSE_ERROR_COUNT=$((INIT_PARSE_ERROR_COUNT + 1))
      echo "  ⚠ initialize: -32700 parse error (#$INIT_PARSE_ERROR_COUNT) — restarting proxy" >&2
      if [ $INIT_PARSE_ERROR_COUNT -ge 3 ]; then
        echo "  ✗ -32700 persists after 3 proxy restarts, proceeding anyway" >&2
        echo "  ✓ proxy ready (degraded, init: ${INIT_BODY:0:120})" >&2
        break
      fi
      kill $APID 2>/dev/null; wait $APID 2>/dev/null || true
      sleep $((INIT_PARSE_ERROR_COUNT * 2))
      "$AGENCY_EXE" mcp teams --transport http --port "$PORT" > /dev/null 2>&1 &
      APID=$!
      WAITED=$((WAITED + 5))
      continue
    fi
    # "result" in body → clean ready
    echo "  ✓ proxy ready (init: ${INIT_BODY:0:120})" >&2
    break
  fi
  sleep 0.2; WAITED=$((WAITED + 1))
done
[ $WAITED -ge 50 ] && { release_agency_lock; echo "TEAMS_FAIL|reason=proxy start timeout (last init: ${INIT_BODY:0:200})"; exit 1; }

# Release startup lock — this agency is initialized, next one can start
release_agency_lock

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
  local attempt=0 max_retries=5
  while [ $attempt -lt $max_retries ]; do
    curl -s --max-time 30 -X POST "http://localhost:$PORT/" \
      -H "Content-Type: application/json" -H "Accept: application/json, text/event-stream" \
      -d "$body" 2>/dev/null | grep -o 'data: {.*}' | sed 's/^data: //' | head -1 > "$outfile"
    if [ -s "$outfile" ] && grep -q '"result"' "$outfile"; then
      [ $attempt -gt 0 ] && echo "  ↻ search retry $((attempt)) succeeded for qs='$qs'" >&2
      return 0
    fi
    attempt=$((attempt + 1))
    local err_body=""
    [ -s "$outfile" ] && err_body=$(head -c 200 "$outfile")

    # After 3 failed attempts on same proxy, restart agency before attempt 4
    if [ $attempt -eq 3 ]; then
      echo "  ⚠ 3 attempts failed, restarting agency proxy on port $PORT…" >&2
      kill $APID 2>/dev/null; wait $APID 2>/dev/null || true
      sleep 1
      "$AGENCY_EXE" mcp teams --transport http --port "$PORT" > /dev/null 2>&1 &
      APID=$!
      # Wait for new proxy ready (quick poll, max 15s)
      local w=0
      while [ $w -lt 30 ]; do
        if curl -sf --max-time 2 "http://localhost:$PORT/" > /dev/null 2>&1; then
          echo "  ✓ proxy restarted (PID=$APID)" >&2
          break
        fi
        sleep 0.5; w=$((w + 1))
      done
    fi

    if [ $attempt -lt $max_retries ]; then
      local sleep_secs=$((2 * attempt + 1))
      echo "  ⚠ search attempt $attempt/$max_retries failed for qs='$qs' (body: ${err_body:-<empty>}), sleeping ${sleep_secs}s…" >&2
      sleep $sleep_secs
    else
      echo "  ✗ search exhausted $max_retries attempts for qs='$qs' (last body: ${err_body:-<empty>})" >&2
    fi
  done
  return 1
}

# Search by case number (with 1 retry on transient auth failure)
SEARCH_T0=$(date +%s)
mcp_search_with_retry 10 "$CASE_NUMBER" 25 "$WD/q1.json" || true

# Search by contact email (optional)
if [ -n "$CONTACT_EMAIL" ]; then
  mcp_search_with_retry 11 "from:$CONTACT_EMAIL" 5 "$WD/q2.json" || true
fi
SEARCH_DUR=$(($(date +%s) - SEARCH_T0))
echo "  PHASE_SEARCH|dur=${SEARCH_DUR}s" >&2

# ISS-226: Pre-fetch ic3 Teams token for image download (Skype API)
# Wait for background warm-up (max 60s, should be done after ~20-40s of MCP search)
if [ -n "${PID_WARM_TOKEN:-}" ]; then
  ( sleep 60; kill "$PID_WARM_TOKEN" 2>/dev/null ) &
  KILL_PID=$!
  wait "$PID_WARM_TOKEN" 2>/dev/null
  WARM_RC=$?
  kill "$KILL_PID" 2>/dev/null; wait "$KILL_PID" 2>/dev/null || true
  if [ $WARM_RC -ne 0 ]; then
    echo "  ⚠ ic3 token warm-up failed (rc=$WARM_RC), images may be skipped" >&2
  fi
fi
# Token comes from warm-teams-token.py cache file
GRAPH_TOKEN=""
IC3_TOKEN_FILE=$(python3 -c "import os,tempfile; print(os.path.join(tempfile.gettempdir(), 'teams-ic3-token.json'))" 2>/dev/null)
if [ -n "$IC3_TOKEN_FILE" ] && [ -f "$IC3_TOKEN_FILE" ]; then
  GRAPH_TOKEN=$(python3 -c "
import json, time, os, tempfile
try:
    fp = os.path.join(tempfile.gettempdir(), 'teams-ic3-token.json')
    d = json.load(open(fp))
    if time.time() < int(d.get('expiresOn', 0)) - 300:
        print(d.get('secret', ''))
except: pass
" 2>/dev/null)
fi

# Python: parse chatIds → fetch messages → dump _mcp-raw.json
# All paths via env vars (avoids Windows backslash escaping in heredoc)
# Captured in PY_OUTPUT so final event can report accurate counts.
set +e
PY_OUTPUT=$(MCP_WD="$WD" MCP_CASE_DIR="$CASE_DIR" MCP_CASE_NUMBER="$CASE_NUMBER" \
  MCP_CONTACT_EMAIL="$CONTACT_EMAIL" MCP_PORT="$PORT" MCP_T0="$T0" \
  MCP_EVENT_DIR="$SUBTASK_DIR" MCP_START_TS="$START_TS" \
  MCP_GRAPH_API_TOKEN="$GRAPH_API_TOKEN" \
  MCP_CACHED_CHAT_IDS="$CACHED_CHAT_IDS" \
  MCP_GRAPH_TOKEN="$GRAPH_TOKEN" \
  python3 << 'PYEOF'
import json, os, subprocess, time, re
import urllib.request

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
    _call_t0 = time.time()
    try:
        r = subprocess.run(
            ['curl', '-s', '--max-time', '60', '-X', 'POST',
             f'http://localhost:{port}/',
             '-H', 'Content-Type: application/json',
             '-H', 'Accept: application/json, text/event-stream',
             '-d', body],
            capture_output=True, text=True, timeout=65
        )
        _call_dur = round(time.time() - _call_t0, 1)
        for line in r.stdout.split('\n'):
            if line.startswith('data: {'):
                parsed = json.loads(line[6:])
                has_error = bool(parsed.get('error'))
                print(f'  MCP_CALL|tool={tool}|id={tid}|dur={_call_dur}s|error={has_error}', file=__import__("sys").stderr)
                return parsed
        print(f'  MCP_CALL|tool={tool}|id={tid}|dur={_call_dur}s|NO_DATA_LINE', file=__import__("sys").stderr)
    except Exception as e:
        _call_dur = round(time.time() - _call_t0, 1)
        print(f'  MCP_CALL|tool={tool}|id={tid}|dur={_call_dur}s|EXCEPTION={e}', file=__import__("sys").stderr)
    return None

# Load search results from files
q1 = load_resp('q1.json')
q2 = load_resp('q2.json')

_phase_t0 = time.time()

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
# ISS-236: Graph API primary (for cached chatIds), Agency MCP fallback.
# Graph API uses OWA token (Chat.Read scope), no proxy needed.
# Agency MCP used for: (1) NEW chatIds not yet fetched by Graph, (2) fallback if Graph fails.
import concurrent.futures

# ── ISS-236: Graph API fetch function ──
graph_api_token = os.environ.get('MCP_GRAPH_API_TOKEN', '').strip()
cached_chat_ids_raw = os.environ.get('MCP_CACHED_CHAT_IDS', '').strip()
cached_chat_ids = set(cached_chat_ids_raw.split(',')) if cached_chat_ids_raw else set()

def fetch_chat_graph(chat_id, token):
    """Fetch messages for a chat via Graph API. Returns list of messages or None on failure."""
    import time as _t
    _t0 = _t.time()
    url = f'https://graph.microsoft.com/v1.0/me/chats/{chat_id}/messages?$top=20'
    req = urllib.request.Request(url, headers={
        'Authorization': f'Bearer {token}',
        'Accept': 'application/json'
    })
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            msgs = data.get('value', [])
            _dur = round(_t.time() - _t0, 1)
            print(f'  GRAPH_FETCH|chat={chat_id[:30]}|msgs={len(msgs)}|dur={_dur}s', file=__import__("sys").stderr)
            return msgs
    except Exception as e:
        _dur = round(_t.time() - _t0, 1)
        print(f'  GRAPH_FETCH_FAIL|chat={chat_id[:30]}|dur={_dur}s|err={str(e)[:80]}', file=__import__("sys").stderr)
        return None

# Per-token throttle validated (Apr 17 experiments): ≤6 concurrent calls
# on a single proxy = clean 200s; 8+ triggers 502/504. We cap at 3 to
# stay well below the threshold and leave headroom for auth contention.
# Graph API: 30 rps/app/tenant, 3 workers is safe.

# fetch_one_chat: single call with 1 retry on transient upstream 502/504/empty.
# Graph's Teams backend occasionally returns 502 under load — a quick retry
# on the same warm proxy typically succeeds in ~1-2s.
def fetch_one_chat(args):
    call_id, chat_id = args
    msgs = []
    import time as _t
    _fetch_t0 = _t.time()
    for attempt in range(2):
        resp = mcp_call(call_id + attempt * 1000, 'ListChatMessages', {'chatId': chat_id, 'top': 20})
        if resp and not resp.get('error'):
            for c in resp.get('result', {}).get('content', []):
                try:
                    raw = json.loads(c.get('text', ''))
                    maybe = raw.get('messages', None)
                    if maybe is not None:  # empty list still means "server responded cleanly"
                        msgs = maybe
                        _fetch_dur = round(_t.time() - _fetch_t0, 1)
                        print(f'  FETCH_CHAT|id={call_id}|chat={chat_id[:30]}|attempt={attempt}|msgs={len(msgs)}|dur={_fetch_dur}s', file=__import__("sys").stderr)
                        return chat_id, msgs
                except:
                    pass
        if attempt == 0:
            print(f'  FETCH_CHAT_RETRY|id={call_id}|chat={chat_id[:30]}|sleeping=2s', file=__import__("sys").stderr)
            _t.sleep(2)
    _fetch_dur = round(_t.time() - _fetch_t0, 1)
    print(f'  FETCH_CHAT_FAIL|id={call_id}|chat={chat_id[:30]}|dur={_fetch_dur}s', file=__import__("sys").stderr)
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

# ── ISS-236: Parallel fetch strategy ──
# If Graph API token is valid AND we have cached chatIds:
#   1. Graph API fetches cached chatIds in parallel (primary path)
#   2. After Agency Search completes, diff to find new chatIds
#   3. New chatIds fetched via Graph API (supplemental)
#   4. Any Graph failures fall back to Agency MCP
# If no Graph token: all chatIds fetched via Agency MCP (legacy path)
_use_graph = bool(graph_api_token) and bool(cached_chat_ids & set(sorted_ids))
_graph_ids = sorted(cached_chat_ids & set(sorted_ids)) if _use_graph else []
_agency_only_ids = sorted(set(sorted_ids) - cached_chat_ids) if _use_graph else sorted_ids
_graph_failed_ids = []

if sorted_ids:
    _fetch_phase_t0 = time.time()
    total = len(sorted_ids)
    done_count = 0
    _write_progress(0, total)

    if _use_graph and _graph_ids:
        # ── Phase A: Graph API parallel fetch for cached chatIds ──
        print(f'  PHASE_FETCH|mode=graph-primary|cached={len(_graph_ids)}|new={len(_agency_only_ids)}|start', file=__import__("sys").stderr)
        with concurrent.futures.ThreadPoolExecutor(max_workers=min(len(_graph_ids), 5)) as ex:
            futures = {ex.submit(fetch_chat_graph, cid, graph_api_token): cid for cid in _graph_ids}
            for fut in concurrent.futures.as_completed(futures):
                cid = futures[fut]
                try:
                    msgs = fut.result()
                    if msgs is not None:
                        chat_messages[cid] = msgs
                    else:
                        _graph_failed_ids.append(cid)
                except Exception:
                    _graph_failed_ids.append(cid)
                done_count += 1
                _write_progress(done_count, total)

        if _graph_failed_ids:
            print(f'  GRAPH_FALLBACK|count={len(_graph_failed_ids)}|ids={",".join(c[:20] for c in _graph_failed_ids[:3])}', file=__import__("sys").stderr)

        # ── Phase B: Fetch new chatIds + Graph-failed chatIds via best available method ──
        _remaining_ids = _agency_only_ids + _graph_failed_ids
        if _remaining_ids:
            # Try Graph API first for remaining (new chatIds that weren't cached)
            _remaining_graph_ok = []
            if graph_api_token:
                with concurrent.futures.ThreadPoolExecutor(max_workers=min(len(_remaining_ids), 5)) as ex:
                    futures = {ex.submit(fetch_chat_graph, cid, graph_api_token): cid for cid in _remaining_ids}
                    for fut in concurrent.futures.as_completed(futures):
                        cid = futures[fut]
                        try:
                            msgs = fut.result()
                            if msgs is not None:
                                chat_messages[cid] = msgs
                                _remaining_graph_ok.append(cid)
                        except Exception:
                            pass
                        done_count += 1
                        _write_progress(done_count, total)

            # Agency MCP fallback for anything Graph couldn't handle
            _agency_fallback_ids = [cid for cid in _remaining_ids if cid not in chat_messages]
            if _agency_fallback_ids:
                print(f'  AGENCY_FALLBACK|count={len(_agency_fallback_ids)}', file=__import__("sys").stderr)
                tasks = [(20 + i, cid) for i, cid in enumerate(_agency_fallback_ids)]
                with concurrent.futures.ThreadPoolExecutor(max_workers=min(len(tasks), 3)) as ex:
                    futures = {ex.submit(fetch_one_chat, t): t for t in tasks}
                    for fut in concurrent.futures.as_completed(futures):
                        try:
                            cid, msgs = fut.result()
                            chat_messages[cid] = msgs
                        except Exception:
                            pass
                        done_count += 1
                        _write_progress(done_count, total)
    else:
        # ── Legacy path: All via Agency MCP (no Graph token or no cached chatIds) ──
        print(f'  PHASE_FETCH|mode=agency-only|chats={len(sorted_ids)}|start', file=__import__("sys").stderr)
        tasks = [(20 + i, cid) for i, cid in enumerate(sorted_ids)]
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

_fetch_phase_dur = round(time.time() - (_fetch_phase_t0 if sorted_ids else _phase_t0), 1)
_total_msgs = sum(len(v) for v in chat_messages.values())
print(f'  PHASE_FETCH|chats={len(chat_messages)}|msgs={_total_msgs}|dur={_fetch_phase_dur}s', file=__import__("sys").stderr)

# ── ISS-226: Download hostedContents images to teams/assets/ ──
# Strategy: base64 decode contentId → extract Skype API URL → Bearer ic3_token
import base64 as _b64
image_map = {}
if not os.environ.get('TEAMS_SKIP_IMAGES', ''):
    _img_re = re.compile(r'<img[^>]*src="(https://graph\.microsoft\.com/[^"]*hostedContents/([^/]+)/\$value)"', re.I)
    url_info = {}  # graph_url → (skype_url, filename)
    for _cid, _msgs in chat_messages.items():
        for _msg in _msgs:
            _body = (_msg.get('body') or {}).get('content', '')
            for _idx, _m in enumerate(_img_re.finditer(_body)):
                _graph_url = _m.group(1)
                _content_id = _m.group(2)
                if _graph_url not in url_info:
                    # Decode base64 contentId to extract Skype API URL
                    _skype_url = None
                    try:
                        _decoded = _b64.b64decode(_content_id + '==').decode('utf-8', errors='replace')
                        _url_match = re.search(r'url=(https://[^,\s]+)', _decoded)
                        if _url_match:
                            _skype_url = _url_match.group(1)
                    except Exception:
                        pass
                    _mid = re.sub(r'[^a-zA-Z0-9]', '', _msg.get('id', ''))[-16:]
                    _fn = f"{_mid}_{_idx}.png"
                    url_info[_graph_url] = (_skype_url, _fn)

    if url_info:
        # Use pre-fetched ic3 token from warm-teams-token.py cache
        _token = os.environ.get('MCP_GRAPH_TOKEN', '').strip()

        if _token:
            _assets = os.path.join(case_dir, 'teams', 'assets')
            os.makedirs(_assets, exist_ok=True)
            _dl = _skip = 0
            for _graph_url, (_skype_url, _fn) in url_info.items():
                if not _skype_url:
                    continue  # couldn't decode Skype URL from contentId
                _local = os.path.join(_assets, _fn)
                _rel = f"assets/{_fn}"
                # Cache: skip if file already exists with content
                if os.path.exists(_local) and os.path.getsize(_local) > 0:
                    image_map[_graph_url] = _rel
                    _skip += 1
                    continue
                try:
                    _req = urllib.request.Request(_skype_url, headers={
                        'Authorization': f'Bearer {_token}'})
                    with urllib.request.urlopen(_req, timeout=15) as _resp:
                        _data = _resp.read()
                        if len(_data) > 1_000_000:
                            continue  # skip >1MB
                        with open(_local, 'wb') as _f:
                            _f.write(_data)
                        image_map[_graph_url] = _rel
                        _dl += 1
                except Exception as _e:
                    print(f'  img-fail: {_fn} — {_e}', file=__import__("sys").stderr)
            if _dl or _skip:
                print(f'  images: {_dl} downloaded, {_skip} cached', file=__import__("sys").stderr)
        else:
            print(f'WARN: no Graph token — skipping {len(url_info)} images', file=__import__("sys").stderr)

    # Write image download event for webui observability
    _evt_dir = os.environ.get('MCP_EVENT_DIR', '')
    if _evt_dir and url_info:
        _img_evt = {
            'task': 'teams-images',
            'status': 'completed' if image_map else ('skipped' if not os.environ.get('MCP_GRAPH_TOKEN','').strip() else 'partial'),
            'totalImages': len(url_info),
            'downloaded': len(image_map),
            'tokenAvailable': bool(os.environ.get('MCP_GRAPH_TOKEN','').strip()),
        }
        try:
            _evt_path = os.path.join(_evt_dir, 'teams-images.json')
            with open(_evt_path, 'w') as _ef:
                json.dump(_img_evt, _ef)
        except: pass

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
    'fallbackTriggered': bool(_graph_failed_ids) if _use_graph else False,
    'fetchMode': 'graph-primary' if _use_graph else 'agency-only',
    'elapsed': elapsed,
    'imageMap': image_map
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
if [ -f "$UPDATE_STATE" ]; then
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
    python3 "$UPDATE_STATE" --case-dir "$CASE_DIR" --step data-refresh --subtask teams --status completed --duration-ms "$DURATION_MS"
    # Write subtask delta file for aggregation (output/subtasks/teams.json)
    echo '{"task":"teams","status":"completed","startedAt":"'"$START_TS"'","completedAt":"'"$(date -u +%FT%TZ)"'","durationMs":'"$DURATION_MS"',"delta":{"newMessages":'"$NEW_MSGS"',"newChats":'"$NEW_CHATS"',"totalMessages":'"$TOTAL_MSGS"',"totalChats":'"$TOTAL_CHATS"'}}' > "$SUBTASK_DIR/teams.json"
  else
    python3 "$UPDATE_STATE" --case-dir "$CASE_DIR" --step data-refresh --subtask teams --status failed --duration-ms "$DURATION_MS"
    # Write subtask delta file for aggregation
    echo '{"task":"teams","status":"failed","startedAt":"'"$START_TS"'","durationMs":'"$DURATION_MS"',"error":"python exit '"$TEAMS_EXIT"'"}' > "$SUBTASK_DIR/teams.json"
  fi
  # Task 5.4i: both branches wrote a terminal event — tell trap to stand down.
  mark_event_written
fi

# Cleanup temp
rm -rf "$WD"
exit $TEAMS_EXIT

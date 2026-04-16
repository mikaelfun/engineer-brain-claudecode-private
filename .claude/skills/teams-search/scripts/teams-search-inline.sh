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

"$AGENCY_EXE" mcp teams --transport http --port "$PORT" > /dev/null 2>&1 &
APID=$!
trap 'kill $APID 2>/dev/null' EXIT

# Wait for proxy ready
WAITED=0
while [ $WAITED -lt 15 ]; do
  curl -s -o /dev/null -w "%{http_code}" -X POST "http://localhost:$PORT/" \
    -H "Content-Type: application/json" -H "Accept: application/json, text/event-stream" \
    -d '{"jsonrpc":"2.0","id":0,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"teams-inline","version":"1.0"}}}' 2>/dev/null | grep -q "200" && break
  sleep 1; WAITED=$((WAITED + 1))
done
[ $WAITED -ge 15 ] && { echo "TEAMS_FAIL|reason=proxy start timeout"; exit 1; }

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
# Issues a tools/call; if the output is empty (curl timeout / auth hiccup),
# retries ONCE on the same proxy instance. Auth token is typically hot after
# the first attempt, so retry cost is ~1-2s even when the first call timed out.
mcp_search_with_retry() {
  local rid="$1" qs="$2" size="$3" outfile="$4"
  local body="{\"jsonrpc\":\"2.0\",\"id\":$rid,\"method\":\"tools/call\",\"params\":{\"name\":\"SearchTeamMessagesQueryParameters\",\"arguments\":{\"queryString\":\"$qs\",\"size\":$size}}}"
  local attempt=0
  while [ $attempt -lt 2 ]; do
    curl -s --max-time 30 -X POST "http://localhost:$PORT/" \
      -H "Content-Type: application/json" -H "Accept: application/json, text/event-stream" \
      -d "$body" 2>/dev/null | grep -o 'data: {.*}' | sed 's/^data: //' | head -1 > "$outfile"
    # Success criterion: file non-empty AND contains a JSON-RPC result (not an error wrapper)
    if [ -s "$outfile" ] && grep -q '"result"' "$outfile"; then
      [ $attempt -gt 0 ] && echo "  ↻ search retry succeeded for qs='$qs'" >&2
      return 0
    fi
    attempt=$((attempt + 1))
    [ $attempt -lt 2 ] && echo "  ⚠ search attempt $attempt empty/error for qs='$qs', retrying…" >&2
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

# Fetch messages for each chat — PARALLEL via ThreadPoolExecutor
# Single proxy handles concurrent requests fine (verified: 1 proxy = N proxy speed)
import concurrent.futures

def fetch_one_chat(args):
    call_id, chat_id = args
    resp = mcp_call(call_id, 'ListChatMessages', {'chatId': chat_id, 'top': 20})
    msgs = []
    if resp:
        for c in resp.get('result', {}).get('content', []):
            try:
                raw = json.loads(c.get('text', ''))
                msgs = raw.get('messages', [])
                break
            except:
                pass
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
    with concurrent.futures.ThreadPoolExecutor(max_workers=min(len(tasks), 8)) as ex:
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

# Contract: if EVERY search returned error, treat as failure so the
# event layer writes status=failed (not a false 'completed|chats=0').
# A genuine "no results" case has status=success with empty chatIds.
if search_results and all(sr.get('status') == 'error' for sr in search_results):
    reasons = '+'.join(sr['keyword'] for sr in search_results)
    print(f'TEAMS_FAIL|reason=all {len(search_results)} search(es) errored ({reasons})|elapsed={elapsed}s')
    import sys; sys.exit(1)

print(f'TEAMS_OK|chats={len(chat_messages)}|msgs={total_msgs}|elapsed={elapsed}s')
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
  CHATS=$(echo "$PY_OUTPUT" | grep -oE 'chats=[0-9]+' | head -1 | cut -d= -f2)
  MSGS=$(echo "$PY_OUTPUT" | grep -oE 'msgs=[0-9]+' | head -1 | cut -d= -f2)
  CHATS="${CHATS:-0}"; MSGS="${MSGS:-0}"
  if [ "$TEAMS_EXIT" = "0" ]; then
    bash "$WRITE_EVENT" "$EVENT_DIR/teams.json" \
      "{\"task\":\"teams\",\"status\":\"completed\",\"startedAt\":\"$START_TS\",\"completedAt\":\"$END_TS\",\"durationMs\":$DURATION_MS,\"delta\":{\"newMessages\":$MSGS,\"newChats\":$CHATS}}"
  else
    bash "$WRITE_EVENT" "$EVENT_DIR/teams.json" \
      "{\"task\":\"teams\",\"status\":\"failed\",\"startedAt\":\"$START_TS\",\"durationMs\":$DURATION_MS,\"error\":\"python exit $TEAMS_EXIT\"}"
  fi
fi

# Cleanup temp
rm -rf "$WD"
exit $TEAMS_EXIT

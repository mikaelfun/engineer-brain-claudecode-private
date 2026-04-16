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

# Search by case number
curl -s --max-time 30 -X POST "http://localhost:$PORT/" \
  -H "Content-Type: application/json" -H "Accept: application/json, text/event-stream" \
  -d "{\"jsonrpc\":\"2.0\",\"id\":10,\"method\":\"tools/call\",\"params\":{\"name\":\"SearchTeamMessagesQueryParameters\",\"arguments\":{\"queryString\":\"$CASE_NUMBER\",\"size\":25}}}" \
  2>/dev/null | grep -o 'data: {.*}' | sed 's/^data: //' | head -1 > "$WD/q1.json"

# Search by contact email (optional)
if [ -n "$CONTACT_EMAIL" ]; then
  curl -s --max-time 30 -X POST "http://localhost:$PORT/" \
    -H "Content-Type: application/json" -H "Accept: application/json, text/event-stream" \
    -d "{\"jsonrpc\":\"2.0\",\"id\":11,\"method\":\"tools/call\",\"params\":{\"name\":\"SearchTeamMessagesQueryParameters\",\"arguments\":{\"queryString\":\"from:$CONTACT_EMAIL\",\"size\":5}}}" \
    2>/dev/null | grep -o 'data: {.*}' | sed 's/^data: //' | head -1 > "$WD/q2.json"
fi

# Python: parse chatIds → fetch messages → dump _mcp-raw.json
# All paths via env vars (avoids Windows backslash escaping in heredoc)
MCP_WD="$WD" MCP_CASE_DIR="$CASE_DIR" MCP_CASE_NUMBER="$CASE_NUMBER" \
  MCP_CONTACT_EMAIL="$CONTACT_EMAIL" MCP_PORT="$PORT" MCP_T0="$T0" \
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

# Fetch messages for each chat
chat_messages = {}
for i, cid in enumerate(sorted(all_ids)):
    resp = mcp_call(20 + i, 'ListChatMessages', {'chatId': cid, 'top': 20})
    msgs = []
    if resp:
        for c in resp.get('result', {}).get('content', []):
            try:
                raw = json.loads(c.get('text', ''))
                msgs = raw.get('messages', [])
                break
            except:
                pass
    chat_messages[cid] = msgs

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
print(f'TEAMS_OK|chats={len(chat_messages)}|msgs={total_msgs}|elapsed={elapsed}s')
PYEOF

# Cleanup temp
rm -rf "$WD"

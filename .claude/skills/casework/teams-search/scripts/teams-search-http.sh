#!/usr/bin/env bash
# teams-search-http.sh — Teams MCP search via agency HTTP proxy
#
# Replaces the LLM-based teams-search-queue agent with direct HTTP calls.
# Performance: ~15-20s/case (vs ~2.6min/case with LLM agent), 10x speedup.
#
# Usage: bash teams-search-http.sh --cases-root ../EngineerBrain-Data/cases [--port 9881]
set -uo pipefail

CASES_ROOT=""
PORT=9881

while [[ $# -gt 0 ]]; do
  case "$1" in
    --cases-root) CASES_ROOT="$2"; shift 2 ;;
    --port)       PORT="$2"; shift 2 ;;
    *) shift ;;
  esac
done

[ -z "$CASES_ROOT" ] && { echo "Usage: teams-search-http.sh --cases-root <path>" >&2; exit 1; }

AGENCY_EXE="$APPDATA/agency/CurrentVersion/agency.exe"
[ ! -f "$AGENCY_EXE" ] && { echo "ERROR: agency.exe not found" >&2; exit 1; }

LOG="$CASES_ROOT/.patrol/teams-queue.log"
# Use python to create temp dir (avoids POSIX /tmp vs Windows path mismatch)
TMPDIR_MCP=$(python3 -c "import tempfile,os; d=os.path.join(tempfile.gettempdir(),'teams-mcp-queue'); os.makedirs(d,exist_ok=True); print(d)")
AGENCY_PID=""
trap 'rm -rf "$TMPDIR_MCP"; [ -n "$AGENCY_PID" ] && kill "$AGENCY_PID" 2>/dev/null' EXIT
mkdir -p "$CASES_ROOT/.patrol"

# ═══════════════════════════════════════════
# STEP 0: Start agency HTTP proxy
# ═══════════════════════════════════════════

"$AGENCY_EXE" mcp teams --transport http --port "$PORT" > /dev/null 2>&1 &
AGENCY_PID=$!
echo "$AGENCY_PID" > "$CASES_ROOT/.patrol/teams-proxy-pid"

WAITED=0
while [ $WAITED -lt 15 ]; do
  curl -s -o /dev/null -w "%{http_code}" -X POST "http://localhost:$PORT/" \
    -H "Content-Type: application/json" -H "Accept: application/json, text/event-stream" \
    -d '{"jsonrpc":"2.0","id":0,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"teams-http","version":"1.0"}}}' 2>/dev/null | grep -q "200" && break
  sleep 1; WAITED=$((WAITED + 1))
done
[ $WAITED -ge 15 ] && { echo "ERROR: proxy start timeout" >&2; exit 1; }

echo "[$(date '+%Y-%m-%d %H:%M:%S')] HTTP QUEUE START | pid=$AGENCY_PID port=$PORT" >> "$LOG"
date +%s > "$CASES_ROOT/.patrol/teams-queue-active"

# ── MCP call helper: saves raw SSE response to file ──
mcp_call_to_file() {
  local ID="$1" TOOL="$2" ARGS="$3" OUTFILE="$4"
  curl -s --max-time 60 -X POST "http://localhost:$PORT/" \
    -H "Content-Type: application/json" -H "Accept: application/json, text/event-stream" \
    -d "{\"jsonrpc\":\"2.0\",\"id\":$ID,\"method\":\"tools/call\",\"params\":{\"name\":\"$TOOL\",\"arguments\":$ARGS}}" \
    2>/dev/null | grep -o 'data: {.*}' | sed 's/^data: //' | head -1 > "$OUTFILE"
}

# ── MCP search with retry (Graph Search API has transient empty responses) ──
mcp_search_with_retry() {
  local ID="$1" QS="$2" SIZE="$3" OUTFILE="$4"
  local attempt=0 max_retries=5
  while [ $attempt -lt $max_retries ]; do
    mcp_call_to_file "$ID" "SearchTeamMessagesQueryParameters" "{\"queryString\":\"$QS\",\"size\":$SIZE}" "$OUTFILE"
    if [ -s "$OUTFILE" ] && grep -q '"result"' "$OUTFILE"; then
      return 0
    fi
    attempt=$((attempt + 1))
    if [ $attempt -lt $max_retries ]; then
      sleep $((5 * attempt))
    fi
  done
  return 1
}

# ═══════════════════════════════════════════
# Process one case (all parsing in single python3 via env vars)
# ═══════════════════════════════════════════

process_case() {
  local REQ_FILE="$1"
  local CASE_DIR CASE_NUMBER CONTACT_EMAIL
  CASE_DIR=$(dirname "$(dirname "$REQ_FILE")")
  CASE_NUMBER=$(python3 -c "import json; print(json.load(open('$REQ_FILE'))['caseNumber'])" 2>/dev/null)
  CONTACT_EMAIL=$(python3 -c "import json; print(json.load(open('$REQ_FILE')).get('contactEmail',''))" 2>/dev/null)
  [ -z "$CASE_NUMBER" ] && { rm -f "$REQ_FILE"; return; }

  local T0=$(date +%s)
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] PROCESSING | $CASE_NUMBER" >> "$LOG"

  # Create working dir via python (Windows-safe path)
  local WD
  WD=$(python3 -c "import os; d=os.path.join(os.environ.get('TMPDIR_MCP','.'), '$CASE_NUMBER'); os.makedirs(d,exist_ok=True); print(d)")

  # --- MCP searches → save to files (with retry for transient Graph API empty responses) ---
  mcp_search_with_retry 10 "$CASE_NUMBER" 25 "$WD/q1.json" || true
  [ -n "$CONTACT_EMAIL" ] && mcp_search_with_retry 11 "from:$CONTACT_EMAIL" 5 "$WD/q2.json" || true
  mcp_call_to_file 12 "ListChats" "{\"topic\":\"$CASE_NUMBER\"}" "$WD/q3.json"

  # --- Python does everything: parse chatIds, fetch messages, dump _mcp-raw.json ---
  # All paths passed via env vars to avoid Windows backslash escaping issues
  local RESULT
  RESULT=$(MCP_WD="$WD" MCP_CASE_DIR="$CASE_DIR" MCP_CASE_NUMBER="$CASE_NUMBER" \
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
            # SearchTeamMessagesQueryParameters
            raw_resp = raw.get('rawResponse', '')
            if raw_resp:
                data = json.loads(raw_resp)
                for v in data.get('value', []):
                    for hc in v.get('hitsContainers', []):
                        for hit in hc.get('hits', []):
                            cid = hit.get('resource', {}).get('chatId', '')
                            if cid:
                                ids.add(cid)
            # ListChats
            chats = raw.get('chats', [])
            if isinstance(chats, list):
                for ch in chats:
                    cid = ch.get('id', '')
                    if cid:
                        ids.add(cid)
        except:
            pass
    return ids

def build_sr(keyword, resp):
    ids = list(extract_chat_ids(resp))
    return {'keyword': keyword, 'status': 'success' if resp else 'error', 'chatIds': ids}

def mcp_call(tid, tool, args):
    body = json.dumps({
        "jsonrpc": "2.0", "id": tid,
        "method": "tools/call",
        "params": {"name": tool, "arguments": args}
    })
    try:
        r = subprocess.run(
            ['curl', '-s', '--max-time', '60', '-X', 'POST', f'http://localhost:{port}/',
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

# Load search results
q1 = load_resp('q1.json')
q2 = load_resp('q2.json')
q3 = load_resp('q3.json')

# Extract chatIds
all_ids = extract_chat_ids(q1) | extract_chat_ids(q2) | extract_chat_ids(q3)

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

# Build output
search_results = [build_sr(case_number, q1)]
if contact_email:
    search_results.append(build_sr(f'from:{contact_email}', q2))

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

print(f'OK|chats={len(chat_messages)}|msgs={sum(len(v) for v in chat_messages.values())}|elapsed={elapsed}s')
PYEOF
  )

  rm -f "$REQ_FILE"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] DONE | $CASE_NUMBER | $RESULT" >> "$LOG"
  echo "$RESULT"
  # Cleanup working dir
  rm -rf "$WD"
}

# ═══════════════════════════════════════════
# Main loop
# ═══════════════════════════════════════════

export TMPDIR_MCP
MAX_WAIT=600; WAITED=0; PROCESSED=0

while [ $WAITED -lt $MAX_WAIT ]; do
  REQUESTS=$(find "$CASES_ROOT/active" -maxdepth 3 -path "*/[0-9]*/teams/request.json" -type f 2>/dev/null | sort)
  COUNT=$(echo "$REQUESTS" | grep -c "request.json" 2>/dev/null || echo 0)
  [ -f "$CASES_ROOT/.patrol/teams-queue-stop" ] && break

  if [ "$COUNT" -gt 0 ]; then
    while IFS= read -r REQ; do
      [ -z "$REQ" ] && continue
      process_case "$REQ"
      PROCESSED=$((PROCESSED + 1))
    done <<< "$REQUESTS"
    WAITED=0; continue
  fi

  sleep 10; WAITED=$((WAITED + 10))
done

rm -f "$CASES_ROOT/.patrol/teams-queue-active" "$CASES_ROOT/.patrol/teams-proxy-pid"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] HTTP QUEUE EXIT | processed=$PROCESSED" >> "$LOG"
echo "QUEUE_EXIT|processed=$PROCESSED"

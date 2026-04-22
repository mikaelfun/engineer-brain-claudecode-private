#!/usr/bin/env bash
# teams-poll.sh — 单次 Teams 消息轮询 (Graph API primary, Agency MCP fallback)
#
# 检查指定聊天是否有新消息，有则执行动作。
# 设计为幂等单次调用，供 /loop、cron、daemon 反复调用。
#
# Data flow:
#   1. Read Graph API token from Token Daemon cache ($TEMP/graph-api-token.json)
#   2. If valid → fetch via Graph API (curl GET)
#   3. If invalid/failed → fall back to Agency MCP proxy (ListChatMessages)
#   4. Python3 processes result (handles both formats), writes state file
#
# 用法:
#   bash teams-poll.sh --topic "MC VM+SCIM POD" [--action notify]
#   bash teams-poll.sh --chat-id "19:xxx@thread.v2" [--action self-message]
#   bash teams-poll.sh --target sba [--action log]
#
# 输出 (stdout 最后一行):
#   WATCH_OK|topic=...|new=0|last=...|poll=N
#   WATCH_NEW|topic=...|new=N|from=...|preview=...
#   WATCH_FAIL|reason=...
set -uo pipefail

CHAT_ID="" TOPIC="" CHANNEL="" TARGET="" SINCE="" ACTION="notify" ACTION_SCRIPT=""
STATE_FILE="" STATE_DIR="" PORT=9840

while [[ $# -gt 0 ]]; do
  case "$1" in
    --chat-id)       CHAT_ID="$2"; shift 2 ;;
    --topic)         TOPIC="$2"; shift 2 ;;
    --channel)       CHANNEL="$2"; shift 2 ;;
    --target)        TARGET="$2"; shift 2 ;;
    --since)         SINCE="$2"; shift 2 ;;
    --action)        ACTION="$2"; shift 2 ;;
    --action-script) ACTION_SCRIPT="$2"; shift 2 ;;
    --state-file)    STATE_FILE="$2"; shift 2 ;;
    --state-dir)     STATE_DIR="$2"; shift 2 ;;
    --port)          PORT="$2"; shift 2 ;;
    *) shift ;;
  esac
done

# ═══════════════════════════════════════════
# Resolve --target from watch-targets.json
# ═══════════════════════════════════════════
if [ -n "$TARGET" ] && [ -z "$CHAT_ID" ]; then
  TARGETS_FILE="$(cd "$(dirname "$0")" && pwd)/../watch-targets.json"
  if [ -f "$TARGETS_FILE" ]; then
    TF="$TARGETS_FILE"
    command -v cygpath &>/dev/null && TF="$(cygpath -m "$TARGETS_FILE")"
    RESOLVED=$(python3 -c "
import json,sys
d=json.load(open('$TF'))
t=d.get('targets',{}).get('$TARGET',{})
if t.get('chatId'): print(t['chatId'])
" 2>/dev/null)
    if [ -n "$RESOLVED" ]; then
      CHAT_ID="$RESOLVED"
      [ -z "$TOPIC" ] && TOPIC="$TARGET"
    else
      echo "WATCH_FAIL|reason=target '$TARGET' not found in watch-targets.json"; exit 1
    fi
  else
    echo "WATCH_FAIL|reason=watch-targets.json not found"; exit 1
  fi
fi

[ -z "$CHAT_ID" ] && [ -z "$TOPIC" ] && [ -z "$CHANNEL" ] && {
  echo "WATCH_FAIL|reason=must specify --chat-id, --topic, --target, or --channel"; exit 1
}

# ═══════════════════════════════════════════
# State directory — default to dataRoot/teams-watch, fallback to $TEMP
# ═══════════════════════════════════════════
if [ -z "$STATE_DIR" ]; then
  SCRIPT_ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
  CONFIG_FILE="$SCRIPT_ROOT/config.json"
  if [ -f "$CONFIG_FILE" ]; then
    CFG_PATH="$CONFIG_FILE"
    command -v cygpath &>/dev/null && CFG_PATH="$(cygpath -m "$CONFIG_FILE")"
    DATA_ROOT=$(python3 -c "import json,os; c=json.load(open('$CFG_PATH')); dr=c.get('dataRoot',''); print(os.path.join(os.path.dirname('$CFG_PATH'), dr) if not os.path.isabs(dr) else dr)" 2>/dev/null)
    if [ -n "$DATA_ROOT" ] && [ -d "$DATA_ROOT" ]; then
      STATE_DIR="$DATA_ROOT/teams-watch"
    fi
  fi
  [ -z "$STATE_DIR" ] && STATE_DIR="$TEMP/teams-watch"
fi
mkdir -p "$STATE_DIR"
# Convert to Windows path with forward slashes for python3
if command -v cygpath &>/dev/null; then
  STATE_DIR="$(cygpath -m "$STATE_DIR")"
fi

# Derive state file from topic/chatId hash
if [ -z "$STATE_FILE" ]; then
  HASH_KEY="${CHAT_ID:-$TOPIC}"
  HASH=$(python3 -c "import hashlib; print(hashlib.md5('$HASH_KEY'.encode()).hexdigest()[:12])")
  STATE_FILE="$STATE_DIR/watch-$HASH.json"
fi

# ═══════════════════════════════════════════
# Read Graph API token from Token Daemon cache
# ═══════════════════════════════════════════
GRAPH_TOKEN=""
GRAPH_TOKEN_FILE="${TEMP:-/tmp}/graph-api-token.json"
GT_PYPATH="$GRAPH_TOKEN_FILE"
command -v cygpath &>/dev/null && GT_PYPATH="$(cygpath -m "$GRAPH_TOKEN_FILE")"

GRAPH_TOKEN=$(python3 -c "
import json, time
try:
    d = json.load(open('$GT_PYPATH'))
    secret = d.get('secret', '')
    expires = int(d.get('expiresOn', '0'))
    now = int(time.time())
    if secret and len(secret) > 100 and (expires - now) > 120:
        print(secret)
except: pass
" 2>/dev/null)

# ═══════════════════════════════════════════
# MCP proxy helper — start on demand, reuse if already running
# ═══════════════════════════════════════════
MCP_PROXY_READY=""
MCP_PROXY_PID=""

ensure_mcp_proxy() {
  [ "$MCP_PROXY_READY" = "1" ] && return 0

  AGENCY_EXE="$APPDATA/agency/CurrentVersion/agency.exe"
  [ ! -f "$AGENCY_EXE" ] && return 1

  if ! curl -s --max-time 2 -o /dev/null "http://localhost:$PORT/" 2>/dev/null; then
    STALE_PID=$(netstat -ano 2>/dev/null | grep -E "127\.0\.0\.1:$PORT\s.*LISTENING" | awk '{print $NF}' | head -1)
    [ -n "$STALE_PID" ] && [ "$STALE_PID" != "0" ] && taskkill //PID "$STALE_PID" //F >/dev/null 2>&1

    "$AGENCY_EXE" mcp teams --transport http --port "$PORT" > /dev/null 2>&1 &
    MCP_PROXY_PID=$!

    WAITED=0
    while [ $WAITED -lt 20 ]; do
      curl -s -o /dev/null -w "%{http_code}" --max-time 3 -X POST "http://localhost:$PORT/" \
        -H "Content-Type: application/json" -H "Accept: application/json, text/event-stream" \
        -d '{"jsonrpc":"2.0","id":0,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"teams-watch","version":"1.0"}}}' 2>/dev/null | grep -q "200" && break
      sleep 0.5; WAITED=$((WAITED + 1))
    done
    [ $WAITED -ge 20 ] && return 1
  fi

  MCP_PROXY_READY="1"
  return 0
}

# Cleanup proxy on exit (only if we started it)
trap '[ -n "$MCP_PROXY_PID" ] && kill $MCP_PROXY_PID 2>/dev/null' EXIT

# ═══════════════════════════════════════════
# Resolve chatId from topic (if needed)
# ═══════════════════════════════════════════
if [ -z "$CHAT_ID" ] && [ -n "$TOPIC" ]; then
  # Check state file for cached chatId
  if [ -f "$STATE_FILE" ]; then
    CACHED_ID=$(python3 -c "
import json
try:
    d=json.load(open('$STATE_FILE'))
    print(d.get('target',{}).get('chatId',''))
except: pass
" 2>/dev/null)
    [ -n "$CACHED_ID" ] && CHAT_ID="$CACHED_ID"
  fi

  # If not cached, resolve via MCP ListChats
  if [ -z "$CHAT_ID" ]; then
    echo "  Resolving topic '$TOPIC' -> chatId..." >&2
    if ! ensure_mcp_proxy; then
      echo "WATCH_FAIL|reason=cannot start MCP proxy for topic resolution"; exit 1
    fi
    CHAT_ID=$(curl -s --max-time 15 -X POST "http://localhost:$PORT/" \
      -H "Content-Type: application/json" -H "Accept: application/json, text/event-stream" \
      -d "{\"jsonrpc\":\"2.0\",\"id\":5,\"method\":\"tools/call\",\"params\":{\"name\":\"ListChats\",\"arguments\":{\"topic\":\"$TOPIC\"}}}" 2>/dev/null \
      | grep -o 'data: {.*}' | sed 's/^data: //' | head -1 \
      | python3 -c "
import json,sys
raw=sys.stdin.read().strip()
if not raw: sys.exit()
d=json.loads(raw)
for c in d.get('result',{}).get('content',[]):
    try:
        obj=json.loads(c.get('text',''))
        chats=obj.get('chats',[])
        if chats: print(chats[0].get('id',''))
    except: pass
" 2>/dev/null)
    [ -z "$CHAT_ID" ] && { echo "WATCH_FAIL|reason=topic '$TOPIC' not found"; exit 1; }
    echo "  -> $CHAT_ID" >&2
  fi
fi

# ═══════════════════════════════════════════
# Read previous state
# ═══════════════════════════════════════════
PREV_LAST_MSG_TIME=""
PREV_LAST_MSG_ID=""
POLL_COUNT=0
TOTAL_NEW=0
if [ -f "$STATE_FILE" ]; then
  eval $(python3 -c "
import json
try:
    d=json.load(open('$STATE_FILE'))
    s=d.get('state',{})
    print(f'PREV_LAST_MSG_TIME=\"{s.get(\"lastMessageTime\",\"\")}\"')
    print(f'PREV_LAST_MSG_ID=\"{s.get(\"lastMessageId\",\"\")}\"')
    print(f'POLL_COUNT={s.get(\"pollCount\",0)}')
    print(f'TOTAL_NEW={s.get(\"newMessageCount\",0)}')
except: pass
" 2>/dev/null)
fi
POLL_COUNT=$((POLL_COUNT + 1))

# ═══════════════════════════════════════════
# Fetch messages: Graph API primary, Agency MCP fallback
# ═══════════════════════════════════════════
RESULT=""
DATA_SOURCE=""

# --- Try Graph API first ---
if [ -n "$GRAPH_TOKEN" ]; then
  echo "  [Graph API] Fetching messages..." >&2
  GRAPH_RESULT=$(curl -s --max-time 15 \
    "https://graph.microsoft.com/v1.0/me/chats/${CHAT_ID}/messages?\$top=10" \
    -H "Authorization: Bearer $GRAPH_TOKEN" \
    -H "Accept: application/json" 2>/dev/null)

  # Validate: JSON with "value" array
  if echo "$GRAPH_RESULT" | python3 -c "import json,sys; d=json.loads(sys.stdin.read()); assert 'value' in d" 2>/dev/null; then
    RESULT="$GRAPH_RESULT"
    DATA_SOURCE="graph"
    echo "  [Graph API] OK" >&2
  else
    echo "  [Graph API] Failed or invalid response, falling back to MCP" >&2
  fi
fi

# --- Fallback: Agency MCP ---
if [ -z "$RESULT" ]; then
  if [ -z "$GRAPH_TOKEN" ]; then
    echo "  [Graph API] No valid token, using MCP fallback" >&2
  fi

  if ensure_mcp_proxy; then
    echo "  [Agency MCP] Fetching messages..." >&2
    MCP_RAW=$(curl -s --max-time 15 -X POST "http://localhost:$PORT/" \
      -H "Content-Type: application/json" -H "Accept: application/json, text/event-stream" \
      -d "{\"jsonrpc\":\"2.0\",\"id\":10,\"method\":\"tools/call\",\"params\":{\"name\":\"ListChatMessages\",\"arguments\":{\"chatId\":\"$CHAT_ID\",\"top\":10}}}" 2>/dev/null \
      | grep -o 'data: {.*}' | sed 's/^data: //' | head -1)

    if [ -n "$MCP_RAW" ]; then
      RESULT="$MCP_RAW"
      DATA_SOURCE="mcp"
      echo "  [Agency MCP] OK" >&2
    fi
  fi
fi

if [ -z "$RESULT" ]; then
  echo "WATCH_FAIL|reason=both Graph API and Agency MCP returned empty"
  exit 1
fi

# ═══════════════════════════════════════════
# Python: process result, detect new messages, execute actions
# Handles both Graph API and MCP response formats.
# ═══════════════════════════════════════════
WATCH_TOPIC="${TOPIC:-$CHAT_ID}"

echo "$RESULT" | CAL_STATE_FILE="$STATE_FILE" CAL_CHAT_ID="$CHAT_ID" CAL_TOPIC="$WATCH_TOPIC" \
  CAL_PREV_TIME="$PREV_LAST_MSG_TIME" CAL_PREV_ID="$PREV_LAST_MSG_ID" \
  CAL_POLL_COUNT="$POLL_COUNT" CAL_TOTAL_NEW="$TOTAL_NEW" \
  CAL_ACTION="$ACTION" CAL_ACTION_SCRIPT="$ACTION_SCRIPT" \
  CAL_PORT="$PORT" CAL_NOTIF_DIR="$STATE_DIR" \
  CAL_DATA_SOURCE="$DATA_SOURCE" \
  python3 -c "
import json, os, sys, subprocess, re
from datetime import datetime, timezone

def utcnow():
    return datetime.now(timezone.utc)

state_file = os.environ['CAL_STATE_FILE']
chat_id = os.environ['CAL_CHAT_ID']
topic = os.environ['CAL_TOPIC']
prev_time = os.environ.get('CAL_PREV_TIME', '')
prev_id = os.environ.get('CAL_PREV_ID', '')
poll_count = int(os.environ.get('CAL_POLL_COUNT', '1'))
total_new = int(os.environ.get('CAL_TOTAL_NEW', '0'))
action = os.environ.get('CAL_ACTION', 'notify')
action_script = os.environ.get('CAL_ACTION_SCRIPT', '')
port = os.environ.get('CAL_PORT', '9840')
notif_dir = os.environ.get('CAL_NOTIF_DIR', '')
data_source = os.environ.get('CAL_DATA_SOURCE', 'unknown')

result_text = sys.stdin.read().strip()
if not result_text:
    print('WATCH_FAIL|reason=no result data'); sys.exit(1)

try:
    d = json.loads(result_text)
except:
    print('WATCH_FAIL|reason=json parse error'); sys.exit(1)

# ---- SBA Adaptive Card parser (mirrors parseSbaCard in sba-patrol-trigger.ts) ----

def parse_sba_card(card):
    if not card or card.get('type') != 'AdaptiveCard' or not isinstance(card.get('body'), list):
        return None
    assigned_to = None
    for block in card['body']:
        if block.get('type') == 'TextBlock' and isinstance(block.get('text'), str):
            m = re.search(r'\*\*(.+?)\*\*\s+has been assigned', block['text'])
            if m:
                assigned_to = m.group(1)
                break
    if not assigned_to:
        return None
    case_number = severity = sla_expire = d365_url = None
    for block in card['body']:
        if block.get('type') == 'FactSet' and isinstance(block.get('facts'), list):
            for fact in block['facts']:
                if fact.get('title') == 'SR': case_number = fact.get('value')
                if fact.get('title') == 'Severity': severity = fact.get('value')
                if fact.get('title') == 'Sla Expire Date': sla_expire = fact.get('value')
        if block.get('type') == 'ActionSet' and isinstance(block.get('actions'), list):
            for act_item in block['actions']:
                if act_item.get('type') == 'Action.OpenUrl' and act_item.get('url'):
                    d365_url = act_item['url']
                    break
    return {'type': 'case-assignment', 'caseNumber': case_number, 'assignedTo': assigned_to,
            'severity': severity, 'slaExpire': sla_expire, 'd365Url': d365_url}

# ---- Extract messages from either format ----

messages = []
if data_source == 'graph':
    # Graph API: { value: [...] }
    messages = d.get('value', [])
elif data_source == 'mcp':
    # Agency MCP: { result: { content: [{ text: JSON-string }] } }
    for c in d.get('result', {}).get('content', []):
        try:
            obj = json.loads(c.get('text', ''))
            messages = obj.get('messages', [])
        except: pass
else:
    # Auto-detect
    if 'value' in d:
        messages = d['value']
    else:
        for c in d.get('result', {}).get('content', []):
            try:
                obj = json.loads(c.get('text', ''))
                messages = obj.get('messages', [])
            except: pass

if not messages:
    print(f'WATCH_OK|topic={topic}|new=0|last=(empty)|poll={poll_count}')
    sys.exit(0)

# ---- Helpers ----

def get_from(msg):
    fr = msg.get('from') or {}
    user = fr.get('user')
    app = fr.get('application')
    if user and user.get('displayName'):
        return user['displayName']
    if app and app.get('displayName'):
        return app['displayName']
    return 'system'

def get_preview(msg, maxlen=80):
    body = (msg.get('body') or {}).get('content', '')
    return re.sub(r'<[^>]+>', '', body).strip()[:maxlen]

def get_parsed_card(msg):
    \"\"\"Extract parsed SBA card from message attachments, if any.\"\"\"
    for att in (msg.get('attachments') or []):
        if att.get('contentType') == 'application/vnd.microsoft.card.adaptive':
            content = att.get('content')
            if isinstance(content, str):
                try: content = json.loads(content)
                except: continue
            if isinstance(content, dict):
                card = parse_sba_card(content)
                if card:
                    return card
    return None

# ---- Process ----

messages.sort(key=lambda m: m.get('createdDateTime', ''), reverse=True)

latest = messages[0]
latest_time = latest.get('createdDateTime', '')
latest_id = latest.get('id', '')
latest_from = get_from(latest)
latest_preview = get_preview(latest)

# Detect new messages since last poll
new_msgs = [m for m in messages if m.get('createdDateTime', '') > prev_time] if prev_time else []
new_count = len(new_msgs)
total_new += new_count

# Load existing history
history = []
if os.path.exists(state_file):
    try:
        history = json.load(open(state_file)).get('history', [])
    except: pass

# Execute action for new messages
if new_count > 0:
    for msg in new_msgs[:5]:
        msg_from = get_from(msg)
        msg_body = get_preview(msg, 120)
        msg_time = msg.get('createdDateTime', '')

        entry = {'detectedAt': utcnow().strftime('%Y-%m-%dT%H:%M:%S')+'Z', 'messageTime': msg_time,
                 'from': msg_from, 'preview': msg_body, 'action': action, 'actionResult': 'ok'}

        # Parse Adaptive Card if present (Graph API provides attachment content)
        parsed = get_parsed_card(msg)
        if parsed:
            entry['parsedCard'] = parsed

        # ---- Action dispatch ----
        if action == 'notify' and notif_dir:
            notif_entry = {'topic': topic, 'from': msg_from, 'preview': msg_body,
                'messageTime': msg_time, 'detectedAt': entry['detectedAt']}
            if parsed:
                notif_entry['parsedCard'] = parsed
            with open(os.path.join(notif_dir, 'notifications.jsonl'), 'a') as nf:
                nf.write(json.dumps(notif_entry, ensure_ascii=False) + '\n')
        elif action == 'self-message':
            try:
                body = json.dumps({'jsonrpc':'2.0','id':99,'method':'tools/call',
                    'params':{'name':'SendMessageToSelf','arguments':{
                        'content':f'[{topic}] {msg_from}: {msg_body}'}}})
                subprocess.run(['curl','-s','--max-time','10','-X','POST',f'http://localhost:{port}/',
                    '-H','Content-Type: application/json','-H','Accept: application/json, text/event-stream',
                    '-d',body], capture_output=True, timeout=12)
            except: entry['actionResult'] = 'failed'
        elif action == 'log' and notif_dir:
            with open(os.path.join(notif_dir, 'watch.log'), 'a') as lf:
                lf.write(f'[{datetime.utcnow().isoformat()}] [{topic}] {msg_from}: {msg_body}\n')
        elif action == 'custom' and action_script:
            try:
                env = os.environ.copy()
                env.update({'WATCH_TOPIC':topic,'WATCH_FROM':msg_from,'WATCH_PREVIEW':msg_body,
                    'WATCH_TIME':msg_time,'WATCH_CHAT_ID':chat_id})
                subprocess.run(['bash',action_script], env=env, timeout=30, capture_output=True)
            except: entry['actionResult'] = 'failed'

        history.append(entry)
    history = history[-50:]

# Write state file
state = {'_version': 2,
    'watchId': f'watch-{os.path.basename(state_file).replace(\".json\",\"\")}',
    'target': {'type':'chat','chatId':chat_id,'topic':topic,
               'resolvedAt':utcnow().strftime('%Y-%m-%dT%H:%M:%S')+'Z'},
    'config': {'interval':0,'action':action,'actionScript':action_script or None},
    'state': {'lastPollAt':utcnow().strftime('%Y-%m-%dT%H:%M:%S')+'Z','lastMessageId':latest_id,
        'lastMessageTime':latest_time,'lastMessageFrom':latest_from,
        'lastMessagePreview':latest_preview,
        'pollCount':poll_count,'newMessageCount':total_new,'consecutiveErrors':0,
        'dataSource':data_source},
    'history': history}

with open(state_file, 'w') as f:
    json.dump(state, f, indent=2, ensure_ascii=False)

if new_count > 0:
    fn = get_from(new_msgs[0])
    fp = get_preview(new_msgs[0], 60)
    print(f'WATCH_NEW|topic={topic}|new={new_count}|from={fn}|preview={fp}')
else:
    print(f'WATCH_OK|topic={topic}|new=0|last={latest_from}: {latest_preview[:40]}|poll={poll_count}')
"

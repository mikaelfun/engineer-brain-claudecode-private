#!/usr/bin/env bash
# teams-poll.sh — 单次 Teams 消息轮询
#
# 检查指定聊天是否有新消息，有则执行动作。
# 设计为幂等单次调用，供 /loop、cron、daemon 反复调用。
#
# 用法:
#   bash teams-poll.sh --topic "MC VM+SCIM POD" [--action notify]
#   bash teams-poll.sh --chat-id "19:xxx@thread.v2" [--action self-message]
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

# Resolve --target from watch-targets.json config
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

AGENCY_EXE="$APPDATA/agency/CurrentVersion/agency.exe"
[ ! -f "$AGENCY_EXE" ] && { echo "WATCH_FAIL|reason=agency.exe not found"; exit 1; }

# State directory — default to dataRoot/teams-watch, fallback to $TEMP
# Use --state-dir to override, or set via config.json dataRoot
if [ -z "$STATE_DIR" ]; then
  # Try to resolve from config.json
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
  # Fallback to $TEMP
  [ -z "$STATE_DIR" ] && STATE_DIR="$TEMP/teams-watch"
fi
mkdir -p "$STATE_DIR"
# Convert to Windows path with forward slashes for python3
# (Git Bash /tmp != Python C:\tmp, and backslashes break python string literals)
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
# Start agency proxy (reuse if already running on port)
# ═══════════════════════════════════════════
PROXY_STARTED=""
if ! curl -s --max-time 2 -o /dev/null "http://localhost:$PORT/" 2>/dev/null; then
  # Kill stale proxy
  STALE_PID=$(netstat -ano 2>/dev/null | grep -E "127\.0\.0\.1:$PORT\s.*LISTENING" | awk '{print $NF}' | head -1)
  [ -n "$STALE_PID" ] && [ "$STALE_PID" != "0" ] && taskkill //PID "$STALE_PID" //F >/dev/null 2>&1

  "$AGENCY_EXE" mcp teams --transport http --port "$PORT" > /dev/null 2>&1 &
  APID=$!
  PROXY_STARTED="$APID"

  # Wait for ready
  WAITED=0
  while [ $WAITED -lt 20 ]; do
    curl -s -o /dev/null -w "%{http_code}" --max-time 3 -X POST "http://localhost:$PORT/" \
      -H "Content-Type: application/json" -H "Accept: application/json, text/event-stream" \
      -d '{"jsonrpc":"2.0","id":0,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"teams-watch","version":"1.0"}}}' 2>/dev/null | grep -q "200" && break
    sleep 0.5; WAITED=$((WAITED + 1))
  done
  [ $WAITED -ge 20 ] && { echo "WATCH_FAIL|reason=proxy start timeout"; exit 1; }
fi

# Cleanup proxy on exit (only if we started it)
if [ -n "$PROXY_STARTED" ]; then
  trap 'kill $PROXY_STARTED 2>/dev/null' EXIT
fi

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

  # If not cached, resolve via ListChats
  if [ -z "$CHAT_ID" ]; then
    echo "  Resolving topic '$TOPIC' → chatId..." >&2
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
        if chats:
            print(chats[0].get('id',''))
    except: pass
" 2>/dev/null)
    [ -z "$CHAT_ID" ] && { echo "WATCH_FAIL|reason=topic '$TOPIC' not found"; exit 1; }
    echo "  → $CHAT_ID" >&2
  fi
fi

# ═══════════════════════════════════════════
# Poll: ListChats for unread status + ListChatMessages for new msgs
# ═══════════════════════════════════════════

# Read previous state
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

# Fetch recent messages
RESULT=$(curl -s --max-time 15 -X POST "http://localhost:$PORT/" \
  -H "Content-Type: application/json" -H "Accept: application/json, text/event-stream" \
  -d "{\"jsonrpc\":\"2.0\",\"id\":10,\"method\":\"tools/call\",\"params\":{\"name\":\"ListChatMessages\",\"arguments\":{\"chatId\":\"$CHAT_ID\",\"top\":10}}}" 2>/dev/null \
  | grep -o 'data: {.*}' | sed 's/^data: //' | head -1)

if [ -z "$RESULT" ]; then
  echo "WATCH_FAIL|reason=empty response from ListChatMessages"
  exit 1
fi

# Python: compare with previous state, detect new messages, execute action
WATCH_TOPIC="${TOPIC:-$CHAT_ID}"

POLL_OUTPUT=$(CAL_STATE_FILE="$STATE_FILE" CAL_CHAT_ID="$CHAT_ID" CAL_TOPIC="$WATCH_TOPIC" \
  CAL_PREV_TIME="$PREV_LAST_MSG_TIME" CAL_PREV_ID="$PREV_LAST_MSG_ID" \
  CAL_POLL_COUNT="$POLL_COUNT" CAL_TOTAL_NEW="$TOTAL_NEW" \
  CAL_ACTION="$ACTION" CAL_ACTION_SCRIPT="$ACTION_SCRIPT" \
  CAL_PORT="$PORT" CAL_NOTIF_DIR="$STATE_DIR" \
  python3 << 'PYEOF'
import json, os, sys, subprocess
from datetime import datetime

result_raw = '''RESULT_PLACEHOLDER'''
# Read from env instead
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

# Read result from stdin
import io
result_text = sys.stdin.read().strip()
if not result_text:
    print('WATCH_FAIL|reason=no result data')
    sys.exit(1)

try:
    d = json.loads(result_text)
except:
    print('WATCH_FAIL|reason=json parse error')
    sys.exit(1)

# Extract messages
messages = []
for c in d.get('result', {}).get('content', []):
    try:
        obj = json.loads(c.get('text', ''))
        messages = obj.get('messages', [])
    except:
        pass

if not messages:
    # No messages, update state
    state = {
        '_version': 1,
        'watchId': f'watch-{os.path.basename(state_file).replace(".json","")}',
        'target': {'type': 'chat', 'chatId': chat_id, 'topic': topic, 'resolvedAt': datetime.utcnow().isoformat() + 'Z'},
        'config': {'interval': 0, 'action': action},
        'state': {
            'lastPollAt': datetime.utcnow().isoformat() + 'Z',
            'lastMessageId': prev_id, 'lastMessageTime': prev_time,
            'pollCount': poll_count, 'newMessageCount': total_new, 'consecutiveErrors': 0
        },
        'history': []
    }
    with open(state_file, 'w') as f:
        json.dump(state, f, indent=2)
    print(f'WATCH_OK|topic={topic}|new=0|last=(none)|poll={poll_count}')
    sys.exit(0)

# Sort by createdDateTime desc (most recent first)
messages.sort(key=lambda m: m.get('createdDateTime', ''), reverse=True)

latest = messages[0]
latest_time = latest.get('createdDateTime', '')
latest_id = latest.get('id', '')
latest_from = (latest.get('from') or {}).get('user', {}).get('displayName', '') or \
              (latest.get('from') or {}).get('application', {}).get('displayName', 'system')
latest_body = (latest.get('body') or {}).get('content', '')
# Strip HTML for preview
import re
latest_preview = re.sub(r'<[^>]+>', '', latest_body).strip()[:80]

# Detect new messages since last poll
new_msgs = []
if prev_time:
    new_msgs = [m for m in messages if m.get('createdDateTime', '') > prev_time]
else:
    # First poll — don't count everything as "new"
    new_msgs = []

new_count = len(new_msgs)
total_new += new_count

# Load existing history
history = []
if os.path.exists(state_file):
    try:
        old = json.load(open(state_file))
        history = old.get('history', [])
    except:
        pass

# Execute action for new messages
if new_count > 0:
    for msg in new_msgs[:5]:  # cap at 5 per poll
        msg_from = (msg.get('from') or {}).get('user', {}).get('displayName', '') or 'system'
        msg_body = re.sub(r'<[^>]+>', '', (msg.get('body') or {}).get('content', '')).strip()[:120]
        msg_time = msg.get('createdDateTime', '')

        entry = {
            'detectedAt': datetime.utcnow().isoformat() + 'Z',
            'messageTime': msg_time,
            'from': msg_from,
            'preview': msg_body,
            'action': action,
            'actionResult': 'ok'
        }

        # Action: notify (write to notifications.jsonl)
        if action == 'notify' and notif_dir:
            notif_path = os.path.join(notif_dir, 'notifications.jsonl')
            notif_entry = {
                'watchId': f'watch-{os.path.basename(state_file).replace(".json","")}',
                'topic': topic, 'from': msg_from, 'preview': msg_body,
                'messageTime': msg_time,
                'detectedAt': datetime.utcnow().isoformat() + 'Z'
            }
            with open(notif_path, 'a') as nf:
                nf.write(json.dumps(notif_entry, ensure_ascii=False) + '\n')

        # Action: self-message (send to self via Teams)
        elif action == 'self-message':
            try:
                body = json.dumps({
                    "jsonrpc": "2.0", "id": 99,
                    "method": "tools/call",
                    "params": {"name": "SendMessageToSelf", "arguments": {
                        "content": f"🔔 [{topic}] {msg_from}: {msg_body}"
                    }}
                })
                subprocess.run(
                    ['curl', '-s', '--max-time', '10', '-X', 'POST',
                     f'http://localhost:{port}/',
                     '-H', 'Content-Type: application/json',
                     '-H', 'Accept: application/json, text/event-stream',
                     '-d', body],
                    capture_output=True, timeout=12
                )
            except:
                entry['actionResult'] = 'failed'

        # Action: log
        elif action == 'log' and notif_dir:
            log_path = os.path.join(notif_dir, 'watch.log')
            with open(log_path, 'a') as lf:
                lf.write(f'[{datetime.utcnow().isoformat()}] [{topic}] {msg_from}: {msg_body}\n')

        # Action: custom script
        elif action == 'custom' and action_script:
            try:
                env = os.environ.copy()
                env.update({
                    'WATCH_TOPIC': topic, 'WATCH_FROM': msg_from,
                    'WATCH_PREVIEW': msg_body, 'WATCH_TIME': msg_time,
                    'WATCH_CHAT_ID': chat_id
                })
                subprocess.run(['bash', action_script], env=env, timeout=30, capture_output=True)
            except:
                entry['actionResult'] = 'failed'

        history.append(entry)

    # Keep history bounded
    history = history[-50:]

# Update state
state = {
    '_version': 1,
    'watchId': f'watch-{os.path.basename(state_file).replace(".json","")}',
    'target': {'type': 'chat', 'chatId': chat_id, 'topic': topic,
               'resolvedAt': datetime.utcnow().isoformat() + 'Z'},
    'config': {'interval': 0, 'action': action, 'actionScript': action_script or None},
    'state': {
        'lastPollAt': datetime.utcnow().isoformat() + 'Z',
        'lastMessageId': latest_id,
        'lastMessageTime': latest_time,
        'lastMessageFrom': latest_from,
        'lastMessagePreview': latest_preview,
        'pollCount': poll_count,
        'newMessageCount': total_new,
        'consecutiveErrors': 0
    },
    'history': history
}

with open(state_file, 'w') as f:
    json.dump(state, f, indent=2, ensure_ascii=False)

if new_count > 0:
    first_new_from = (new_msgs[0].get('from') or {}).get('user', {}).get('displayName', '') or 'system'
    first_preview = re.sub(r'<[^>]+>', '', (new_msgs[0].get('body') or {}).get('content', '')).strip()[:60]
    print(f'WATCH_NEW|topic={topic}|new={new_count}|from={first_new_from}|preview={first_preview}')
else:
    print(f'WATCH_OK|topic={topic}|new=0|last={latest_from}: {latest_preview[:40]}|poll={poll_count}')
PYEOF
)

# Feed result JSON to python via stdin — heredoc approach
echo "$RESULT" | CAL_STATE_FILE="$STATE_FILE" CAL_CHAT_ID="$CHAT_ID" CAL_TOPIC="$WATCH_TOPIC" \
  CAL_PREV_TIME="$PREV_LAST_MSG_TIME" CAL_PREV_ID="$PREV_LAST_MSG_ID" \
  CAL_POLL_COUNT="$POLL_COUNT" CAL_TOTAL_NEW="$TOTAL_NEW" \
  CAL_ACTION="$ACTION" CAL_ACTION_SCRIPT="$ACTION_SCRIPT" \
  CAL_PORT="$PORT" CAL_NOTIF_DIR="$STATE_DIR" \
  python3 -c "
import json, os, sys, subprocess, re
from datetime import datetime

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

result_text = sys.stdin.read().strip()
if not result_text:
    print('WATCH_FAIL|reason=no result data'); sys.exit(1)

try:
    d = json.loads(result_text)
except:
    print('WATCH_FAIL|reason=json parse error'); sys.exit(1)

messages = []
for c in d.get('result', {}).get('content', []):
    try:
        obj = json.loads(c.get('text', ''))
        messages = obj.get('messages', [])
    except: pass

if not messages:
    print(f'WATCH_OK|topic={topic}|new=0|last=(empty)|poll={poll_count}')
    sys.exit(0)

messages.sort(key=lambda m: m.get('createdDateTime', ''), reverse=True)
latest = messages[0]
latest_time = latest.get('createdDateTime', '')
latest_id = latest.get('id', '')
fr = (latest.get('from') or {})
latest_from = fr.get('user', {}).get('displayName', '') if fr.get('user') else \
              fr.get('application', {}).get('displayName', 'system') if fr.get('application') else 'system'
latest_preview = re.sub(r'<[^>]+>', '', (latest.get('body') or {}).get('content', '')).strip()[:80]

new_msgs = [m for m in messages if m.get('createdDateTime', '') > prev_time] if prev_time else []
new_count = len(new_msgs)
total_new += new_count

history = []
if os.path.exists(state_file):
    try:
        history = json.load(open(state_file)).get('history', [])
    except: pass

if new_count > 0:
    for msg in new_msgs[:5]:
        fr2 = (msg.get('from') or {})
        msg_from = fr2.get('user', {}).get('displayName', '') if fr2.get('user') else 'system'
        msg_body = re.sub(r'<[^>]+>', '', (msg.get('body') or {}).get('content', '')).strip()[:120]
        msg_time = msg.get('createdDateTime', '')

        entry = {'detectedAt': datetime.utcnow().isoformat()+'Z', 'messageTime': msg_time,
                 'from': msg_from, 'preview': msg_body, 'action': action, 'actionResult': 'ok'}

        if action == 'notify' and notif_dir:
            with open(os.path.join(notif_dir, 'notifications.jsonl'), 'a') as nf:
                nf.write(json.dumps({'topic': topic, 'from': msg_from, 'preview': msg_body,
                    'messageTime': msg_time, 'detectedAt': entry['detectedAt']}, ensure_ascii=False) + '\n')
        elif action == 'self-message':
            try:
                body = json.dumps({'jsonrpc':'2.0','id':99,'method':'tools/call',
                    'params':{'name':'SendMessageToSelf','arguments':{'content':f'[{topic}] {msg_from}: {msg_body}'}}})
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

state = {'_version':1,
    'watchId': f'watch-{os.path.basename(state_file).replace(\".json\",\"\")}',
    'target': {'type':'chat','chatId':chat_id,'topic':topic,'resolvedAt':datetime.utcnow().isoformat()+'Z'},
    'config': {'interval':0,'action':action,'actionScript':action_script or None},
    'state': {'lastPollAt':datetime.utcnow().isoformat()+'Z','lastMessageId':latest_id,
        'lastMessageTime':latest_time,'lastMessageFrom':latest_from,'lastMessagePreview':latest_preview,
        'pollCount':poll_count,'newMessageCount':total_new,'consecutiveErrors':0},
    'history': history}

with open(state_file, 'w') as f:
    json.dump(state, f, indent=2, ensure_ascii=False)

if new_count > 0:
    nf = (new_msgs[0].get('from') or {})
    fn = nf.get('user',{}).get('displayName','') if nf.get('user') else 'system'
    fp = re.sub(r'<[^>]+>','', (new_msgs[0].get('body') or {}).get('content','')).strip()[:60]
    print(f'WATCH_NEW|topic={topic}|new={new_count}|from={fn}|preview={fp}')
else:
    print(f'WATCH_OK|topic={topic}|new=0|last={latest_from}: {latest_preview[:40]}|poll={poll_count}')
"

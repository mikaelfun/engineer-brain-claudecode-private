#!/usr/bin/env bash
# teams-daemon.sh — Teams 消息监听守护进程
#
# 管理后台轮询进程，持续监听指定 Teams 聊天的新消息。
#
# 用法:
#   bash teams-daemon.sh start --topic "Mooncake SLA Monitor" --interval 60 --action notify
#   bash teams-daemon.sh stop [--topic "..."]
#   bash teams-daemon.sh status
#   bash teams-daemon.sh list
set -uo pipefail

CMD="${1:-status}"; shift 2>/dev/null || true

TOPIC="" CHAT_ID="" INTERVAL=60 ACTION="notify" ACTION_SCRIPT="" PORT=9840

while [[ $# -gt 0 ]]; do
  case "$1" in
    --topic)         TOPIC="$2"; shift 2 ;;
    --chat-id)       CHAT_ID="$2"; shift 2 ;;
    --interval)      INTERVAL="$2"; shift 2 ;;
    --action)        ACTION="$2"; shift 2 ;;
    --action-script) ACTION_SCRIPT="$2"; shift 2 ;;
    --port)          PORT="$2"; shift 2 ;;
    *) shift ;;
  esac
done

STATE_DIR="$TEMP/teams-watch"
PID_DIR="$STATE_DIR/pids"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$STATE_DIR" "$PID_DIR"

case "$CMD" in
  start)
    [ -z "$TOPIC" ] && [ -z "$CHAT_ID" ] && { echo "ERROR: --topic or --chat-id required"; exit 1; }
    LABEL="${TOPIC:-$CHAT_ID}"
    HASH=$(python3 -c "import hashlib; print(hashlib.md5('$LABEL'.encode()).hexdigest()[:12])")
    PID_FILE="$PID_DIR/watch-$HASH.pid"

    # Check if already running
    if [ -f "$PID_FILE" ]; then
      OLD_PID=$(cat "$PID_FILE")
      if kill -0 "$OLD_PID" 2>/dev/null; then
        echo "DAEMON_ALREADY_RUNNING|topic=$LABEL|pid=$OLD_PID"
        exit 0
      fi
      rm -f "$PID_FILE"
    fi

    # Build poll args
    POLL_ARGS=""
    [ -n "$TOPIC" ] && POLL_ARGS="$POLL_ARGS --topic \"$TOPIC\""
    [ -n "$CHAT_ID" ] && POLL_ARGS="$POLL_ARGS --chat-id \"$CHAT_ID\""
    POLL_ARGS="$POLL_ARGS --action $ACTION --port $PORT"
    [ -n "$ACTION_SCRIPT" ] && POLL_ARGS="$POLL_ARGS --action-script \"$ACTION_SCRIPT\""

    # Start background loop
    LOG_FILE="$STATE_DIR/daemon-$HASH.log"
    (
      echo "[$(date '+%Y-%m-%d %H:%M:%S')] DAEMON START | topic=$LABEL interval=${INTERVAL}s action=$ACTION" >> "$LOG_FILE"
      while true; do
        eval "bash \"$SCRIPT_DIR/teams-poll.sh\" $POLL_ARGS" >> "$LOG_FILE" 2>&1
        sleep "$INTERVAL"
      done
    ) &
    DAEMON_PID=$!
    echo "$DAEMON_PID" > "$PID_FILE"

    # Write daemon config for WebUI
    python3 -c "
import json, os
config = {
    'watchId': 'watch-$HASH',
    'topic': '$LABEL',
    'chatId': '$CHAT_ID',
    'interval': $INTERVAL,
    'action': '$ACTION',
    'pid': $DAEMON_PID,
    'startedAt': '$(date -u +%FT%TZ)',
    'logFile': '$LOG_FILE',
    'status': 'running'
}
with open('$STATE_DIR/daemon-$HASH-config.json', 'w') as f:
    json.dump(config, f, indent=2)
"

    echo "DAEMON_STARTED|topic=$LABEL|pid=$DAEMON_PID|interval=${INTERVAL}s|action=$ACTION"
    ;;

  stop)
    if [ -n "$TOPIC" ] || [ -n "$CHAT_ID" ]; then
      LABEL="${TOPIC:-$CHAT_ID}"
      HASH=$(python3 -c "import hashlib; print(hashlib.md5('$LABEL'.encode()).hexdigest()[:12])")
      PID_FILE="$PID_DIR/watch-$HASH.pid"
      if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        kill "$PID" 2>/dev/null && echo "DAEMON_STOPPED|topic=$LABEL|pid=$PID" || echo "DAEMON_NOT_RUNNING|topic=$LABEL"
        rm -f "$PID_FILE"
        # Update config
        CFG="$STATE_DIR/daemon-$HASH-config.json"
        [ -f "$CFG" ] && python3 -c "
import json
d=json.load(open('$CFG'))
d['status']='stopped'
json.dump(d,open('$CFG','w'),indent=2)
"
      else
        echo "DAEMON_NOT_RUNNING|topic=$LABEL"
      fi
    else
      # Stop all
      STOPPED=0
      for pf in "$PID_DIR"/watch-*.pid; do
        [ -f "$pf" ] || continue
        PID=$(cat "$pf")
        kill "$PID" 2>/dev/null && STOPPED=$((STOPPED + 1))
        rm -f "$pf"
      done
      # Update all configs
      for cf in "$STATE_DIR"/daemon-*-config.json; do
        [ -f "$cf" ] || continue
        python3 -c "
import json
d=json.load(open('$cf'))
d['status']='stopped'
json.dump(d,open('$cf','w'),indent=2)
" 2>/dev/null
      done
      echo "DAEMON_STOP_ALL|stopped=$STOPPED"
    fi
    ;;

  status|list)
    echo "=== Teams Watch Daemons ==="
    FOUND=0
    for cf in "$STATE_DIR"/daemon-*-config.json; do
      [ -f "$cf" ] || continue
      FOUND=$((FOUND + 1))
      python3 -c "
import json, os
d=json.load(open('$cf'))
pid=d.get('pid',0)
running = False
try:
    os.kill(pid, 0)
    running = True
except: pass
status = 'running' if running else 'stopped'
topic = d.get('topic','?')
interval = d.get('interval',0)
action = d.get('action','?')
started = d.get('startedAt','?')[:16]
icon = '🟢' if running else '🔴'
print(f'  {icon} {topic:40} | {interval}s | {action:12} | pid={pid} | {started}')
" 2>/dev/null
    done
    [ $FOUND -eq 0 ] && echo "  (no daemons configured)"

    # Also show state files
    echo ""
    echo "=== Watch State Files ==="
    for sf in "$STATE_DIR"/watch-*.json; do
      [ -f "$sf" ] || continue
      python3 -c "
import json
d=json.load(open('$sf'))
topic=d.get('target',{}).get('topic','?')
s=d.get('state',{})
polls=s.get('pollCount',0)
new=s.get('newMessageCount',0)
last_from=s.get('lastMessageFrom','')
last_preview=s.get('lastMessagePreview','')[:30]
last_poll=s.get('lastPollAt','')[:16]
print(f'  {topic:40} | polls={polls} | new={new} | last={last_from}: {last_preview} | {last_poll}')
" 2>/dev/null
    done
    ;;

  *)
    echo "Usage: teams-daemon.sh {start|stop|status|list} [options]"
    exit 1
    ;;
esac

#!/usr/bin/env bash
# icm-discussion-warm.sh — patrol Phase 0.5 启动 ICM discussion daemon
# 用法: bash icm-discussion-warm.sh {casesRoot}
set -uo pipefail

CASES_ROOT="${1:?Usage: icm-discussion-warm.sh <casesRoot>}"
PATROL_DIR="${2:-$CASES_ROOT/.patrol}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# 清理旧信号
rm -f "$PATROL_DIR/icm-queue-active" "$PATROL_DIR/icm-queue-stop"
mkdir -p "$PATROL_DIR/icm-queue"

# 后台启动 daemon
CASES_ROOT="$CASES_ROOT" PATROL_DIR="$PATROL_DIR" node "$SCRIPT_DIR/icm-discussion-daemon.js" > "$PATROL_DIR/icm-daemon.stdout" 2>&1 &
ICM_PID=$!
echo $ICM_PID > "$PATROL_DIR/icm-queue-pid"
echo "ICM_DAEMON_PID=$ICM_PID"

# 等 active 信号 (最多 30s)
WAITED=0
while [ $WAITED -lt 30 ]; do
  if [ -f "$PATROL_DIR/icm-queue-active" ]; then
    echo "ICM_DAEMON_READY|pid=$ICM_PID|waited=${WAITED}s"
    exit 0
  fi
  sleep 1
  WAITED=$((WAITED + 1))
done

# 超时检查进程是否还活着
if kill -0 $ICM_PID 2>/dev/null; then
  echo "ICM_DAEMON_SLOW|pid=$ICM_PID|waited=30s (still running, SSO may be in progress)"
else
  echo "ICM_DAEMON_FAIL|pid=$ICM_PID|process exited"
  cat "$PATROL_DIR/icm-daemon.stdout" 2>/dev/null | tail -10
  exit 1
fi

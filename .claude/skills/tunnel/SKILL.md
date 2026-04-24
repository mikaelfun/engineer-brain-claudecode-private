---
name: tunnel
displayName: 隧道管理
description: "管理 cloudflared 隧道，将本地 Dashboard 暴露到公网供手机端访问。子命令：start, stop, status。触发词：tunnel, 隧道, 内网穿透, 公网访问, 手机访问。"
argument-hint: "start | stop | status"
category: utility
stability: stable
allowed-tools:
  - Bash
  - Read
  - Grep
---

# /tunnel — 隧道管理

管理 cloudflared 快速隧道，将本地 Dashboard 暴露到公网，供手机端飞书等访问。

## 常量（动态读取）

```bash
# 从 config.json 读取端口（适配 dev/prod 不同端口）
TARGET_PORT=$(python3 -c "import json; print(json.load(open('config.json')).get('dashboard',{}).get('webPort',5173))")
RUNTIME_DIR="dashboard/.runtime"
PID_FILE="$RUNTIME_DIR/tunnel.pid"
URL_FILE="$RUNTIME_DIR/tunnel.url"
```

## 命令解析

| 用户输入 | 子命令 |
|---------|--------|
| `start`, `开启`, `打开隧道`, `暴露`, `expose` | start |
| `stop`, `关闭`, `关掉隧道`, `断开` | stop |
| `status`, `状态`, `隧道状态`, `url` | status |

## start

1. **读取端口 + 检查是否已运行**：

```bash
TARGET_PORT=$(python3 -c "import json; print(json.load(open('config.json')).get('dashboard',{}).get('webPort',5173))")
RUNTIME_DIR="dashboard/.runtime"
PID_FILE="$RUNTIME_DIR/tunnel.pid"
URL_FILE="$RUNTIME_DIR/tunnel.url"

if [ -f "$PID_FILE" ]; then
  OLD_PID=$(cat "$PID_FILE")
  if tasklist //FI "PID eq $OLD_PID" 2>/dev/null | grep -q "$OLD_PID"; then
    echo "ALREADY_RUNNING"
    cat "$URL_FILE"
    exit 0
  else
    rm -f "$PID_FILE"
  fi
fi
```

如果 ALREADY_RUNNING，直接输出现有 URL 给用户，不重复启动。

2. **检查 Dashboard 是否在运行**：

```bash
netstat -ano | grep "$TARGET_PORT" | grep "LISTENING"
```

如果端口无监听，提醒用户先启动 Dashboard：`cd dashboard && npm run dev`，不要继续。

3. **启动隧道**：

```bash
mkdir -p "$RUNTIME_DIR"
LOG_FILE="$RUNTIME_DIR/tunnel.log"
npx --yes cloudflared tunnel --url http://localhost:$TARGET_PORT > "$LOG_FILE" 2>&1 &
TUNNEL_PID=$!
echo $TUNNEL_PID > "$PID_FILE"
```

4. **等待并提取 URL**：

```bash
sleep 8
TUNNEL_URL=$(grep -oP 'https://[^\s]+\.trycloudflare\.com' "$LOG_FILE" | head -1)
echo "$TUNNEL_URL" > "$URL_FILE"
echo "$TUNNEL_URL"
```

如果 8 秒后没拿到 URL，再等 5 秒重试一次。如果还是没有，输出日志让用户排查。

5. **输出结果**：向用户展示公网 URL，提醒：
   - 测试完后用 `/tunnel stop` 关闭
   - 不要把 URL 发到公开群

## stop

```bash
RUNTIME_DIR="dashboard/.runtime"
PID_FILE="$RUNTIME_DIR/tunnel.pid"
URL_FILE="$RUNTIME_DIR/tunnel.url"

if [ -f "$PID_FILE" ]; then
  PID=$(cat "$PID_FILE")
  taskkill //PID "$PID" //F //T 2>/dev/null
  rm -f "$PID_FILE" "$URL_FILE"
fi
# 兜底：杀掉所有残留 cloudflared 进程（npx 会 fork 子进程）
for p in $(tasklist 2>/dev/null | grep -i cloudflared | awk '{print $2}'); do
  taskkill //PID "$p" //F 2>/dev/null
done
# 验证
if tasklist 2>/dev/null | grep -iq cloudflared; then
  echo "WARNING: cloudflared still running"
else
  echo "TUNNEL_STOPPED"
fi
```

向用户确认隧道已关闭。

## status

```bash
RUNTIME_DIR="dashboard/.runtime"
PID_FILE="$RUNTIME_DIR/tunnel.pid"
URL_FILE="$RUNTIME_DIR/tunnel.url"

if [ -f "$PID_FILE" ]; then
  PID=$(cat "$PID_FILE")
  if tasklist //FI "PID eq $PID" 2>/dev/null | grep -q "$PID"; then
    echo "RUNNING | PID: $PID"
    [ -f "$URL_FILE" ] && echo "URL: $(cat $URL_FILE)"
  else
    echo "STALE_PID (process dead, cleaning up)"
    rm -f "$PID_FILE" "$URL_FILE"
  fi
else
  echo "NOT_RUNNING"
fi
```

向用户展示隧道状态：运行中（含 URL 和 PID）或未运行。

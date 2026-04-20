---
name: teams-watch
displayName: Teams 消息监听
category: inline
stability: experimental
requiredInput: none
estimatedDuration: persistent
description: "监听指定 Teams 聊天的新消息。支持 Claude /loop 轮询和独立 Bash 守护两种模式。可配合 WebUI 自定义监听目标和触发动作。"
allowed-tools:
  - Bash
  - Read
  - Write
---

# /teams-watch — Teams 消息监听

监听指定 Teams 聊天/频道的新消息，检测到新消息时执行自定义动作（通知、触发 casework、转发等）。

## 两种运行模式

### 模式 A：Claude `/loop` 轮询（推荐交互场景）

在当前 Claude 会话中定期轮询，结果直接展示在对话里。适合临时监听。

```bash
# 每 5 分钟检查 POD 群有没有新消息
/loop 5m bash .claude/skills/teams-watch/scripts/teams-poll.sh --topic "MC VM+SCIM POD"

# 监听特定 chatId
/loop 3m bash .claude/skills/teams-watch/scripts/teams-poll.sh --chat-id "19:xxx@thread.v2"
```

### 模式 B：独立守护进程（推荐持久场景）

后台运行，新消息写入状态文件，Dashboard WebUI 消费。适合长期监听。

```bash
# 启动守护
bash .claude/skills/teams-watch/scripts/teams-daemon.sh start \
  --topic "Mooncake SLA Monitor" \
  --interval 60 \
  --action notify

# 停止
bash .claude/skills/teams-watch/scripts/teams-daemon.sh stop

# 状态
bash .claude/skills/teams-watch/scripts/teams-daemon.sh status
```

## 参数

### teams-poll.sh（单次轮询，供 /loop 或 cron 调用）

| 参数 | 说明 |
|------|------|
| `--chat-id <id>` | 直接指定 chatId（精确） |
| `--topic <name>` | 按聊天名称模糊匹配（首次自动解析为 chatId） |
| `--channel <team>/<channel>` | 监听频道（格式：teamName/channelName） |
| `--since <ISO>` | 只返回此时间之后的消息（默认：上次轮询时间） |
| `--action <type>` | 检测到新消息时的动作（见下方动作表） |
| `--state-file <path>` | 状态文件路径（默认 `$TEMP/teams-watch/{topic-hash}.json`） |
| `--port <N>` | agency proxy 端口（默认 9840） |

### teams-daemon.sh（守护进程管理）

| 子命令 | 说明 |
|--------|------|
| `start` | 启动守护（接受 teams-poll.sh 的所有参数 + `--interval`） |
| `stop` | 停止守护 |
| `status` | 显示运行状态 |
| `list` | 列出所有活跃监听 |

## 触发动作

| action | 说明 | 适用场景 |
|--------|------|---------|
| `notify` | 输出新消息摘要到 stdout / 写入通知文件 | 默认，/loop 模式 |
| `self-message` | 发 Teams 消息给自己（Notes to Self） | 手机端看到推送 |
| `log` | 追加到日志文件 | 审计/记录 |
| `webhook` | POST 到指定 URL | 外部集成 |
| `casework` | 触发 casework 流程（解析消息中的 case number） | SLA Monitor 自动响应 |
| `custom` | 执行自定义脚本 `--action-script <path>` | 灵活扩展 |

## 状态文件 Schema

```json
{
  "_version": 1,
  "watchId": "watch-abc123",
  "target": {
    "type": "chat",
    "chatId": "19:xxx@thread.v2",
    "topic": "Mooncake SLA Monitor",
    "resolvedAt": "2026-04-20T01:00:00Z"
  },
  "config": {
    "interval": 60,
    "action": "notify",
    "actionScript": null
  },
  "state": {
    "lastPollAt": "2026-04-20T01:30:00Z",
    "lastMessageId": "1776392806353",
    "lastMessageTime": "2026-04-20T01:28:50Z",
    "lastMessageFrom": "Winds Wu",
    "lastMessagePreview": "Done",
    "pollCount": 42,
    "newMessageCount": 3,
    "consecutiveErrors": 0
  },
  "history": [
    {
      "detectedAt": "2026-04-20T01:25:00Z",
      "from": "Cover Guo",
      "preview": "这个超有用",
      "action": "notify",
      "actionResult": "ok"
    }
  ]
}
```

## WebUI 集成设计

Dashboard 后端读取 `$TEMP/teams-watch/*.json` 状态文件，前端提供：

### 1. 监听管理页面（Settings → Teams Watch）

```
┌─────────────────────────────────────────────────────┐
│ Teams Watch                              [+ Add]    │
├─────────────────────────────────────────────────────┤
│ 🟢 Mooncake SLA Monitor    | 60s | notify  | 42 polls │
│ 🟢 MC VM+SCIM POD (All)    | 120s| log     | 18 polls │
│ 🔴 APAC Triage (stopped)   | -   | -       | -        │
├─────────────────────────────────────────────────────┤
│ [Start All] [Stop All]                               │
└─────────────────────────────────────────────────────┘
```

### 2. 添加监听对话框

```
┌─ Add Watch ─────────────────────────────────────────┐
│ Target:  [Chat Topic ▼]  [________________]         │
│ Interval: [60s ▼]                                   │
│ Action:   [notify ▼]                                │
│ Action Script: [________________] (optional)        │
│                                                     │
│ Preview: Will poll "MC VM+SCIM POD" every 60s       │
│          Action: send notification on new message   │
│                                     [Cancel] [Add]  │
└─────────────────────────────────────────────────────┘
```

### 3. Dashboard API 端点

| Method | Path | 说明 |
|--------|------|------|
| GET | `/api/teams-watch` | 列出所有监听 |
| POST | `/api/teams-watch` | 添加监听 |
| DELETE | `/api/teams-watch/:id` | 删除监听 |
| POST | `/api/teams-watch/:id/start` | 启动 |
| POST | `/api/teams-watch/:id/stop` | 停止 |
| GET | `/api/teams-watch/:id/history` | 查看消息历史 |

## 输出

### /loop 模式 stdout

```
WATCH_OK|topic=Mooncake SLA Monitor|new=0|last=Winds Wu: Done|poll=42
WATCH_NEW|topic=Mooncake SLA Monitor|new=2|from=Cover Guo|preview=这个超有用
WATCH_FAIL|reason=proxy timeout
```

### 通知文件（action=notify）

写入 `$TEMP/teams-watch/notifications.jsonl`：

```jsonl
{"watchId":"watch-abc","topic":"SLA Monitor","from":"Cover Guo","preview":"这个超有用","detectedAt":"2026-04-20T01:25:00Z"}
```

# Teams Watch Dashboard — Design Spec

## Summary

Dashboard UI + 后端 API 实现 Teams Watch 管理：监听列表、增删启停控制、SSE 实时通知、SBA bot 消息解析触发 patrol。

## Background

- CLI 脚本已可用：`teams-poll.sh`（单次轮询）、`teams-daemon.sh`（守护进程管理）
- 状态文件：`$TEMP/teams-watch/watch-*.json` + `daemon-*-config.json`
- Dashboard 前端已有 `AutomationsPage.tsx` 的 `TeamsWatchTab` placeholder
- 后端没有 teams-watch 路由/service

## Architecture

### Shell-Based 包装模式

后端 `teams-watch-reader.ts` 读取 state file + spawn bash 脚本管理进程，和 `daemon-reader.ts` (Token Daemon) 模式一致。

```
Dashboard Frontend (TeamsWatchTab)
  ↕ REST API
Dashboard Backend (Hono)
  ├─ teams-watch-reader.ts   — state file 读取 + 进程管理
  ├─ teams-watch-routes.ts   — REST API 路由
  ├─ graph-token-reader.ts   — Graph API token 读取（from Token Daemon cache）
  └─ sba-patrol-trigger.ts   — SBA 消息检测 → Adaptive Card 解析 → patrol 触发
     ↕ spawn
  teams-daemon.sh start/stop — 管理后台轮询进程
     ↕ exec
  teams-poll.sh              — 单次 Teams MCP 轮询
     ↕ HTTP
  Agency MCP proxy           — Teams Graph API
```

### Graph API Token 管理

Token Daemon (`browser-profiles/scripts/token-daemon.js`) 统一管理。

**变更：** 在 `browser-profiles/registry.json` 添加 `graph` token：

```json
"graph": {
  "tab": "outlook.office.com",
  "startUrl": "https://outlook.office.com/mail/",
  "tokenSource": "localStorage",
  "tokenMatch": {
    "credentialType": "AccessToken",
    "targetIncludes": "graph.microsoft.com/Chat.Read"
  },
  "cacheFile": "$TEMP/graph-api-token.json",
  "cacheTTLMinutes": 55,
  "description": "Graph API token for Teams chat message attachments (Adaptive Card)"
}
```

Token 从 OWA profile 的 MSAL localStorage 提取，TTL ~60min，Token Daemon 自动刷新。cache 格式同 teams-ic3-token.json：`{secret, expiresOn, fetchedAt}`。

**注意：** Token Daemon 已有 OWA tab（`ui.owa`），但它是 `playwright-cli` runtime 用于 UI 操作。Graph token 需要从同一个 OWA session 的 localStorage 提取，所以复用 Token Daemon 的 OWA tab。Token Daemon 的 `extractToken()` 逻辑需要增加对 `graph` token 的支持——和 `teams` (ic3) token 一样的 localStorage 提取方式，只是 `targetIncludes` 不同。

## Components

### 1. Backend — `dashboard/src/services/teams-watch-reader.ts`

读取 `$TEMP/teams-watch/` 目录下的 state 文件和 daemon config 文件。

```typescript
interface TeamsWatch {
  watchId: string
  topic: string
  chatId: string
  interval: number
  action: string
  status: 'running' | 'stopped'
  pid: number | null
  lastPollAt: string | null
  lastMessageFrom: string | null
  lastMessagePreview: string | null
  pollCount: number
  newMessageCount: number
  consecutiveErrors: number
  history: WatchHistoryEntry[]
}

interface WatchHistoryEntry {
  detectedAt: string
  messageTime: string
  from: string
  preview: string
  action: string
  actionResult: string
  // Enriched fields (from Adaptive Card parsing)
  parsedCard?: {
    type: 'case-assignment' | 'unknown'
    caseNumber?: string
    assignedTo?: string
    severity?: string
    slaExpire?: string
    d365Url?: string
  }
}

// Public API
listWatches(): TeamsWatch[]              // scan state + daemon-config files
startWatch(topic: string, opts): string  // spawn teams-daemon.sh start
stopWatch(watchId: string): boolean      // spawn teams-daemon.sh stop
getWatchHistory(watchId: string): WatchHistoryEntry[]
```

### 2. Backend — `dashboard/src/services/graph-token-reader.ts`

读取 Token Daemon 缓存的 Graph API token。

```typescript
interface GraphToken {
  secret: string
  expiresOn: number
  isValid: boolean
}

readGraphToken(): GraphToken | null  // 读取 $TEMP/graph-api-token.json
```

### 3. Backend — `dashboard/src/services/sba-patrol-trigger.ts`

SBA 消息检测 + Adaptive Card 解析 + patrol 触发。

**启动时机：** Dashboard server 启动时 `initSbaPatrolTrigger()` 注册 60s interval。

**逻辑：**

```
每 60s:
1. 读取 SBA watch state file（watchId 匹配 watch-targets.json 的 sba chatId）
2. 比较 newMessageCount 与上次已知值
3. 如果有新消息:
   a. 读取 Graph token（from graph-token-reader）
   b. 调 Graph API: GET /me/chats/{chatId}/messages?$top=5
   c. 找到 contentType=application/vnd.microsoft.card.adaptive 的 attachment
   d. 解析 Adaptive Card JSON:
      - FactSet → SR (case number), Severity, Sla Expire Date
      - TextBlock → "**{name}** has been assigned a SR"
   e. 如果 assignedTo 包含 config.engineerName:
      - 记录到 history（enriched with parsedCard）
      - 推送 SSE event: teams-watch-case-assignment
      - 调 runSdkPatrol() 触发 patrol
4. 更新 lastKnownMessageCount
```

**Adaptive Card 解析规则：**

```typescript
function parseSbaCard(card: any): ParsedCard | null {
  const facts = card.body
    ?.find(b => b.type === 'FactSet')
    ?.facts || []
  const caseNumber = facts.find(f => f.title === 'SR')?.value
  const severity = facts.find(f => f.title === 'Severity')?.value
  const slaExpire = facts.find(f => f.title === 'Sla Expire Date')?.value
  
  const assignText = card.body
    ?.find(b => b.type === 'TextBlock' && b.text?.includes('assigned'))
    ?.text || ''
  // "**Kun Fang** has been assigned a SR" → "Kun Fang"
  const assignedTo = assignText.match(/\*\*(.+?)\*\*/)?.[1] || ''
  
  const d365Url = card.body
    ?.flatMap(b => b.actions || [])
    ?.find(a => a.title === 'DfM')
    ?.url || ''
  
  return { type: 'case-assignment', caseNumber, assignedTo, severity, slaExpire, d365Url }
}
```

**防护：**
- Graph token 过期时跳过解析，仅检测有新消息（降级到 "unknown" type）
- patrol 触发加锁：如果 `isSdkPatrolRunning()` 则不重复触发
- 60s 轮询间隔内不重复处理同一条消息（用 lastMessageId 去重）

### 4. Backend — `dashboard/src/routes/teams-watch-routes.ts`

```
GET  /api/teams-watch              — listWatches()
POST /api/teams-watch              — startWatch(topic, interval, action)
  body: { topic: string, chatId?: string, interval?: number, action?: string }
DELETE /api/teams-watch/:id        — stopWatch(id) + 清理 state file
POST /api/teams-watch/:id/start    — startWatch (restart stopped)
POST /api/teams-watch/:id/stop     — stopWatch
GET  /api/teams-watch/:id/history  — getWatchHistory(id)
GET  /api/teams-watch/sba/status   — SBA trigger status (last check, last assignment)
```

注册到 `index.ts`:
```typescript
app.use('/api/teams-watch/*', authMiddleware)
app.route('/api/teams-watch', teamsWatchRoutes)
```

### 5. SSE Events

新增 SSE event type: `teams-watch-update`

```typescript
// 当检测到新消息时推送
{
  type: 'teams-watch-update',
  data: {
    watchId: string
    topic: string
    newMessages: number
    latestFrom: string
    latestPreview: string
    parsedCard?: ParsedCard  // SBA 消息才有
    patrolTriggered?: boolean
  }
}
```

通过现有 `sse-manager.ts` 的 `broadcast()` 推送。

### 6. Frontend — `TeamsWatchTab` in `AutomationsPage.tsx`

**布局：** 和 CronJobsTab 一致的左右分栏：

```
┌─────────────────────────────────┬──────────────────────────────────┐
│ Watch List                      │ Watch Detail                     │
│                                 │                                  │
│ 🟢 SBAManager Bot    60s notify │ Topic: SBAManager Bot            │
│ 🟢 POD Chat          120s log   │ ChatId: 19:deee...               │
│ 🔴 Triage (stopped)             │ Interval: 60s | Action: notify   │
│                                 │ Polls: 42 | New: 3              │
│                [+ Add Watch]    │                                  │
│                                 │ ── History ──────────────────    │
│                                 │ 🔔 SR 2604210030003905 (Sev B)  │
│                                 │    assigned → Kun Fang           │
│                                 │    SLA: 2026-04-21 08:59         │
│                                 │    → patrol triggered ✓          │
│                                 │ 📩 Cover Guo: 这个超有用         │
│                                 │ 📩 Winds Wu: Done                │
└─────────────────────────────────┴──────────────────────────────────┘
```

**新增 React 组件：**

- `TeamsWatchTab` — 替换 placeholder，左右分栏
- `TeamsWatchList` — 监听列表（状态图标 + 名称 + 控制按钮）
- `TeamsWatchDetail` — 选中的 watch 详情 + 消息历史
- `AddWatchDialog` — 添加监听对话框

**新增 API hooks：**

```typescript
// dashboard/web/src/api/hooks.ts
useTeamsWatches()                    // GET /api/teams-watch
useTeamsWatchHistory(watchId)        // GET /api/teams-watch/:id/history
useStartTeamsWatch()                 // POST mutation
useStopTeamsWatch()                  // POST mutation
useDeleteTeamsWatch()                // DELETE mutation
useCreateTeamsWatch()                // POST mutation
```

### 7. Token Daemon — `browser-profiles/registry.json` + `token-daemon.js`

**registry.json 变更：** 添加 `graph` token entry（见上方 Architecture 节）。

**token-daemon.js 变更：** 
- 在 `extractToken()` 中增加对 `graph` token 的 localStorage 提取
- 复用现有的 `teams` token 提取逻辑（同样是 localStorage + MSAL AccessToken match）
- 从 Token Daemon 的 OWA tab 提取（Tab 已存在，只需在 token 刷新周期中多提取一个）
- cache 写入 `$TEMP/graph-api-token.json`

## Data Flow — SBA Case Assignment

```
1. teams-daemon.sh (每 60s 调 teams-poll.sh)
   ↓
2. teams-poll.sh 检测到 SBA chat 有新消息
   ↓ 写入
3. $TEMP/teams-watch/watch-{hash}.json (newMessageCount++)
   ↓ 60s interval 扫描
4. sba-patrol-trigger.ts 检测 newMessageCount 变化
   ↓ 读取
5. graph-token-reader.ts → $TEMP/graph-api-token.json (Token Daemon 维护)
   ↓ HTTP GET
6. Graph API: /me/chats/{sba-chatId}/messages?$top=5
   ↓ response 含 attachments
7. parseSbaCard() → { caseNumber: "2604210030003905", assignedTo: "Kun Fang", severity: "B" }
   ↓ 匹配 engineerName
8. runSdkPatrol() → casework 处理该 case
   ↓ 同时
9. SSE broadcast → Dashboard 前端显示通知
```

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `dashboard/src/services/teams-watch-reader.ts` | Create | state file 读取 + 进程管理 |
| `dashboard/src/services/graph-token-reader.ts` | Create | Graph API token 读取 |
| `dashboard/src/services/sba-patrol-trigger.ts` | Create | SBA 消息检测 + patrol 触发 |
| `dashboard/src/routes/teams-watch-routes.ts` | Create | REST API 路由 |
| `dashboard/src/index.ts` | Modify | 注册新路由 + initSbaPatrolTrigger() |
| `dashboard/web/src/pages/AutomationsPage.tsx` | Modify | 实现 TeamsWatchTab |
| `dashboard/web/src/api/hooks.ts` | Modify | 添加 teams-watch API hooks |
| `.claude/skills/browser-profiles/registry.json` | Modify | 添加 `graph` token |
| `.claude/skills/browser-profiles/scripts/token-daemon.js` | Modify | Graph token 提取 |

## Error Handling

- **Graph token 过期/不可用：** SBA trigger 降级到 "检测到新消息但无法解析内容"，Dashboard 显示 ⚠️，不触发 patrol
- **Agency MCP proxy 不可用：** teams-poll.sh 写入 `consecutiveErrors++`，Dashboard 显示错误状态
- **Patrol 已在运行：** 跳过触发，记录 "patrol skipped (already running)"
- **State file 损坏：** JSON parse 失败时 skip 该 watch，不影响其他

## Testing

- 手动：启动 teams-daemon.sh 监听 SBA chat → 在 Teams 中让 SBAManager bot 发消息 → 验证 Dashboard 显示 + patrol 触发
- graph-token-reader.ts：mock token file，验证过期判断
- sba-patrol-trigger.ts：mock Graph API response，验证 Adaptive Card 解析
- parseSbaCard：unit test with real card JSON sample

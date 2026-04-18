---
name: browser-profiles
displayName: Browser Profile Manager
category: infrastructure
stability: beta
description: "Token Daemon + 浏览器 profile 生命周期管理。长驻 Edge 实例多 tab 共享 SSO，各业务脚本消费 token cache。"
allowed-tools:
  - Bash
  - Read
  - Write
---

# Browser Profile Manager

管理所有 Playwright 浏览器 profile、Token Daemon 生命周期、SSO 自动登录。

## 架构概览

```
┌──────────────── Token Daemon（长驻层）────────────────┐
│  单个 Edge 实例，多 tab，共享 SSO session              │
│  Profile: $TEMP/pw-token-daemon-profile               │
│                                                        │
│  Tab 1: teams.cloud.microsoft  → localStorage → token  │
│  Tab 2: client.dtmnebula.xxx   → request intercept     │
│  Tab 3: portal.microsofticm.com → request intercept    │
│                                                        │
│  SSO: 首次自动点 @microsoft.com tile                   │
│  Warmup: token 过期时 reload 对应 tab                  │
│  心跳: $TEMP/pw-token-daemon-heartbeat.json            │
└────────────────────────┬───────────────────────────────┘
                         │ cached token files
                         ▼
┌──────────────── 业务消费层（并发安全）──────────────────┐
│  teams-search-inline.sh → 读 teams-ic3-token.json      │
│  download-attachments.ps1 → 读 dtm-token-global.json   │
│  icm-discussion-ab.js → 读 icm-token-cache.json        │
│  （多 case 并行调 API，各写各的 case 目录，零冲突）      │
└────────────────────────────────────────────────────────┘

┌──────────────── UI 操作层（独立 profile）───────────────┐
│  D365: playwright-cli --persistent（长驻，单实例）       │
│  OWA:  playwright-cli --persistent（长驻，单实例）       │
│  Jarvis/Future: 按需 spawn 独立 profile（并发安全）     │
└────────────────────────────────────────────────────────┘
```

## 配置

所有 profile 注册在 `.claude/skills/browser-profiles/registry.json`。

### Token 类型（daemon 管理）

| Name | 目标站点 | 提取方式 | 缓存 TTL | Cache 文件 |
|------|---------|---------|---------|-----------|
| teams | teams.cloud.microsoft | localStorage | 55 min | `$TEMP/teams-ic3-token.json` |
| dtm | client.dtmnebula.xxx | request intercept | 50 min | `$TEMP/d365-case-ops-runtime/dtm-token-global.json` |
| icm | portal.microsofticm.com | request intercept | 170 min | `$TEMP/icm-token-cache.json` |

### UI Profile（独立管理）

| Name | Profile 路径 | 运行时 | 说明 |
|------|-------------|--------|------|
| d365 | `$TEMP/playwright-d365-profile` | playwright-cli | 长驻，D365 CRM UI |
| owa | `$TEMP/playwright-owa-profile` | playwright-cli | 长驻，OWA 邮件 |

## Daemon 生命周期

### 启动

**CLI 模式**：patrol 首次检测 daemon 不存在时启动：
```bash
node .claude/skills/browser-profiles/scripts/token-daemon.js start
```

**WebUI 模式**：后端 `startServer()` 时启动，agent-monitor 页面显示实时状态。

### 心跳检测

Daemon 每 30s 写心跳文件 `$TEMP/pw-token-daemon-heartbeat.json`：
```json
{
  "pid": 12345,
  "startedAt": "ISO",
  "lastHeartbeat": "ISO",
  "tabs": {
    "teams": { "status": "ok", "tokenExpires": "ISO", "remainMin": 42 },
    "dtm": { "status": "ok", "tokenExpires": "ISO", "remainMin": 38 },
    "icm": { "status": "ok", "tokenExpires": "ISO", "remainMin": 155 }
  }
}
```

### 自动恢复

消费者脚本检测 token cache 过期 + daemon 无心跳 → 自动重启 daemon：
```bash
node .claude/skills/browser-profiles/scripts/token-daemon.js ensure
```

`ensure` 逻辑：
1. 读 PID 文件 → 进程存活？→ 读心跳 → 心跳新鲜？→ 正常
2. 进程不存在 / 心跳过期（>60s）→ 清理残留 → 重新 `start`

### 停止

```bash
node .claude/skills/browser-profiles/scripts/token-daemon.js stop
```

## Warmup 流程（Patrol 预热 Step 4 集成）

```bash
# 替代原来的 4 项独立预热，统一为：
node .claude/skills/browser-profiles/scripts/token-daemon.js warmup
```

`warmup` 逻辑（顺序执行，避免同时 reload 多 tab）：
1. `ensure` daemon 存活
2. 检查每个 token cache：
   - TTL 未到 → SKIP
   - TTL 将到（<5min 余量）或已过期 → reload 对应 tab → 提取新 token → 写 cache
3. 输出汇总：`WARMUP_OK|teams=cached(42m)|dtm=refreshed|icm=cached(155m)`

## SSO 自动登录

所有 token tab 共享同一个 daemon profile 的 SSO session。

**首次登录**（profile 为空）：
1. 导航到任一目标站点 → redirect 到 `login.microsoftonline.com`
2. 检测 `[data-test-id]` tiles → 找包含 `@microsoft.com` 的 → 点击
3. 等待 SSO redirect 回目标站点
4. SSO session 保存在 daemon profile 中，后续所有 tab 共享

**Session 过期**（长时间未使用）：
- 某个 tab reload 后又出现 login 页 → 自动 re-SSO → 所有 tab 恢复

## Token 提取策略

### localStorage 方式（Teams）
```js
// 在 tab 页面上执行 page.evaluate
for (let i = 0; i < localStorage.length; i++) {
  const val = JSON.parse(localStorage.getItem(localStorage.key(i)));
  if (val.credentialType === 'AccessToken' && val.target.includes('ic3.teams')) {
    return { secret: val.secret, expiresOn: val.expiresOn };
  }
}
```

### Request Intercept 方式（DTM / ICM）
```js
// 在 tab 上注册 request 监听 → reload 页面 → 捕获目标 header
page.on('request', req => {
  if (req.url().includes(targetUrlPattern)) {
    token = req.headers()['authorization'];
  }
});
await page.reload();
```

## 新增 Token Profile 指南

要为新的内部工具添加 token 获取：

1. **确认是否只需 token**（不需要 UI 操作）→ 注册到 `registry.json` 的 `tokens` 节
2. **确定提取方式**：
   - 目标站点会在 `localStorage` 存 token → `tokenSource: "localStorage"`
   - 目标站点的 token 在 API request header 里 → `tokenSource: "request-intercept"`
3. **添加 registry 条目**：
   ```json
   "newTool": {
     "tab": "newtool.microsoft.com",
     "startUrl": "https://newtool.microsoft.com/dashboard",
     "tokenSource": "request-intercept",
     "tokenMatch": { "urlIncludes": "api.newtool", "header": "authorization" },
     "cacheFile": "$TEMP/newtool-token.json",
     "cacheTTLMinutes": 60,
     "description": "NewTool Bearer token"
   }
   ```
4. **Token daemon 会自动管理**（新增 tab + warmup）
5. **业务脚本直接读 cache 文件**，不需要关心浏览器

**如果需要 UI 操作**（页面交互、下载文件等）：
1. 评估是否可并发 → 不可并发注册到 `ui` 节（长驻 playwright-cli）
2. 可并发 → 按需 spawn 独立 profile（参考 Jarvis 模式）

## 文件清单

```
.claude/skills/browser-profiles/
├── SKILL.md              # 本文件
├── registry.json         # profile 注册表
├── scripts/
│   ├── token-daemon.js   # Daemon 主进程（start/stop/ensure/warmup/status）
│   ├── sso-handler.js    # SSO 自动登录模块（检测 login → 点 tile）
│   └── extract-token.js  # Token 提取模块（localStorage / request-intercept）
```

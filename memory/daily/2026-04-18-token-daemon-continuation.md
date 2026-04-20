# Token Daemon 续建提示词

## 上下文

ISS-229 Token Daemon 已完成核心实现并 commit（`77f7ea2`）。`warmup` 命令冷启动 3/3 token 全通过（37s）。

文件位置：
- `.claude/skills/browser-profiles/scripts/token-daemon.js` — daemon 主进程
- `.claude/skills/browser-profiles/scripts/sso-handler.js` — SSO 模块
- `.claude/skills/browser-profiles/scripts/extract-token.js` — token 提取
- `.claude/skills/browser-profiles/registry.json` — profile 注册表
- `.claude/skills/browser-profiles/SKILL.md` — skill 定义
- `playbooks/guides/browser-profile-architecture.md` — 架构指南

## 必须先修的 Bug

### DTM workspaceId 冷启动获取

当前 `resolveDtmUrl()` 的获取链：
1. 读 `$TEMP/d365-case-ops-runtime/dtm-workspace-id.json` 缓存
2. 扫 active cases 的 `attachments-meta.json`
3. 调 D365 OData API（通过 `_init.ps1` 的 `Invoke-D365Api`）

**问题**：完全冷启动时（无本地 case 数据），步骤 2 找不到文件。步骤 3 调 `Invoke-D365Api` 可能因为 D365 Playwright session 未建立而失败。

**修复方案**：步骤 3 改为直接用 daemon 自己的 Edge profile 打开 D365 DTM 管理页面获取 workspace ID，或者用 `list-active-cases.ps1` 先拿一个 case number → 用 OData API 查该 case 的 DTM attachment metadata → 提取 workspaceId。`list-active-cases.ps1` 不依赖 Playwright（纯 OData），冷启动也能用。

代码位置：`token-daemon.js` 的 `resolveDtmUrl()` 函数。

## 后续步骤

### 1. Patrol 集成
- `patrol/SKILL.md` Step 4 预热：把 4 项独立预热替换为 `node .claude/skills/browser-profiles/scripts/token-daemon.js warmup`
- IR batch（`check-ir-status-batch.ps1`）仍独立保留（它不是 token，是 SLA 数据）
- IR batch 和 daemon warmup 可以并行

### 2. `start` 命令测试（长驻 daemon 模式）
- `token-daemon.js start` 前台运行，多 tab + 心跳循环
- 验证心跳文件写入、自动 token 刷新（每分钟检查过期）
- `token-daemon.js stop` 能正确 kill

### 3. `ensure` 命令测试
- daemon 不存活时后台 spawn `start`
- 验证 PID 文件、心跳检测
- `warmup` 命令检测 daemon alive 时走"检查 cache"快速路径

### 4. 消费者脚本改造
- `teams-search-inline.sh`：已经读 `$TEMP/teams-ic3-token.json`，无需改
- `download-attachments.ps1`：已经读 `$TEMP/d365-case-ops-runtime/dtm-token-global.json`，需确认 daemon 写的 cache 格式兼容
- `icm-discussion-ab.js`：读 `$TEMP/icm-token-cache.json`，需确认格式兼容（daemon 写 `{ token, timestamp }` vs 原来的 `{ token, timestamp }`）

### 5. 旧脚本清理
- `warm-teams-token.py` 可废弃（已有 `warm-teams-token.js`）
- `warm-dtm-token.ps1` 保留作为 fallback（patrol 可选调用）
- `icm-discussion-ab.js` 的 `--token-only` 模式保留作为 fallback

### 6. WebUI 集成
- Dashboard 后端启动时调 `token-daemon.js ensure`
- Agent Monitor 页面显示 daemon 状态（读 heartbeat.json）
- 各 token 过期倒计时实时显示

## 技术要点备忘

- Node.js playwright-core：`require(path.join(process.env.APPDATA, 'npm', 'node_modules', '@playwright', 'cli', 'node_modules', 'playwright-core'))`
- Daemon profile：`$TEMP/pw-token-daemon-profile`
- DTM workspace ID 缓存：`$TEMP/d365-case-ops-runtime/dtm-workspace-id.json`
- Teams 会 redirect：`teams.microsoft.com → login → teams.microsoft.com/v2/ → teams.cloud.microsoft`
- ICM 有 IdentityProvider 页面（不是直接 Azure AD login）
- DTM 每次都需要 SSO（implicit grant session 不持久化）
- request-intercept 的 listener 必须在 goto 之前注册
- ICM API domain 是 `prod.microsofticm.com`（不是 `api.microsofticm.com`）

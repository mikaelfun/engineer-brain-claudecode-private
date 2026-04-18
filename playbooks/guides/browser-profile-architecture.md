# Browser Profile Architecture

浏览器多 profile 管理架构，覆盖 Token Daemon、UI Profile、SSO 自动登录。

## 设计原则

1. **Token 获取和业务操作分离** — Daemon 管 token 缓存，业务脚本消费 cache 文件
2. **单进程多 tab** — Token Daemon 共用一个 Edge 进程减少资源占用
3. **一次 SSO 所有 tab 共享** — Azure AD session 在 profile 级别，不区分 tab
4. **消费者零感知** — 业务脚本只读 JSON 缓存文件，不知道浏览器的存在
5. **自愈** — token 过期/daemon 挂掉时自动恢复，不需要人工干预

## 两层架构

### Layer 1：Token Daemon（长驻 Edge）

**一个 Edge 进程，多个 tab，统一提供 token。**

- Runtime: Node.js `playwright-core`（`@playwright/cli` 内置的 playwright-core）
- Profile: `$TEMP/pw-token-daemon-profile`（独立，不与 MCP/D365/OWA 共享）
- 注册表: `.claude/skills/browser-profiles/registry.json`

当前注册的 token：

| Name | 目标站点 | 提取方式 | TTL | 消费者 |
|------|---------|---------|-----|--------|
| teams | teams.cloud.microsoft | localStorage | 55m | teams-search-inline.sh |
| dtm | client.dtmnebula.xxx | request intercept | 50m | download-attachments.ps1 |
| icm | portal.microsofticm.com | request intercept | 170m | icm-discussion-ab.js |

**消费者只需读 cache 文件**：
```bash
# 例：teams-search-inline.sh 读 token
TOKEN=$(python3 -c "import json,time,os; d=json.load(open(os.path.join(os.environ['TEMP'],'teams-ic3-token.json'))); print(d['secret'] if time.time()<int(d['expiresOn'])-300 else '')")
```

### Layer 2：UI Profile（独立 Playwright 实例）

**需要页面 UI 交互的场景，各自独立 profile。**

| Name | Profile | Runtime | 用途 | 并发 |
|------|---------|---------|------|------|
| d365 | `$TEMP/playwright-d365-profile` | playwright-cli | D365 CRM UI | 单实例 |
| owa | `$TEMP/playwright-owa-profile` | playwright-cli | OWA 邮件抓取 | 单实例 |
| jarvis | 按需创建 | playwright-core | Jarvis CSV 下载 | 可并发 |

**UI 操作不经过 Daemon**，直接用各自的 playwright-cli 或 playwright-core 实例。

## SSO 机制

所有 Microsoft 内部工具共享 Azure AD SSO：

1. 新 profile 首次导航到任何 Microsoft 工具 → redirect 到 `login.microsoftonline.com`
2. Login 页面显示账号选择 tile → 自动找 `@microsoft.com` 的 tile 点击
3. Azure AD Windows SSO（Kerberos/NTLM）自动完成验证 → redirect 回目标站点
4. Session cookie 保存在 profile 中 → 后续所有同域请求自动携带

**SSO 自愈**：session 过期后某个 tab reload 出现 login 页 → 自动 re-SSO → session 恢复

## 新增 Token 指南（决策树）

```
需要浏览器获取某个 Microsoft 内部工具的数据？
│
├── 能否通过 API + Token 获取？
│   ├── 是 → 注册到 registry.json 的 tokens 节
│   │        Token Daemon 自动管理，业务脚本读 cache
│   │        参考: teams / dtm / icm
│   │
│   └── 否 → 必须页面 UI 操作
│       ├── 是否需要多 case 并发操作同一页面？
│       │   ├── 否（单实例够用）→ 注册到 registry.json 的 ui 节
│       │   │   使用 playwright-cli --persistent 长驻
│       │   │   参考: d365 / owa
│       │   │
│       │   └── 是（需并发隔离）→ 按需 spawn 独立 profile
│       │       每次操作创建临时 profile，完成后清理
│       │       参考: jarvis
```

### 注册新 Token 的步骤

1. 在 `registry.json` 的 `tokens` 节添加：
   ```json
   "newTool": {
     "tab": "newtool.microsoft.com",
     "startUrl": "https://newtool.microsoft.com",
     "tokenSource": "localStorage | request-intercept",
     "tokenMatch": { ... },
     "cacheFile": "$TEMP/newtool-token.json",
     "cacheTTLMinutes": 60,
     "description": "说明"
   }
   ```
2. 确定 `tokenSource`：
   - 打开目标站点 → F12 → Application → Local Storage → 能看到 AccessToken？→ `localStorage`
   - 看不到 → Network → 找到带 Authorization header 的 API 请求 → `request-intercept`
3. Token Daemon 下次启动会自动创建新 tab 并管理

### 注册新 UI Profile 的步骤

1. 在 `registry.json` 的 `ui` 节添加
2. 确认是否需要并发 → 决定长驻 or 按需 spawn
3. 长驻模式用 `playwright-cli open --persistent --profile <path> --browser msedge <url>`

## Token 提取方式详解

### localStorage 方式

适用于：目标站点将 MSAL token 存在 localStorage（如 Teams）

```js
const token = await page.evaluate(() => {
  for (let i = 0; i < localStorage.length; i++) {
    const val = JSON.parse(localStorage.getItem(localStorage.key(i)));
    if (val?.credentialType === 'AccessToken' && val.target?.includes(targetPattern)) {
      return { secret: val.secret, expiresOn: val.expiresOn };
    }
  }
});
```

### Request Intercept 方式

适用于：token 只出现在 API 请求的 Authorization header（如 DTM、ICM）

```js
let token = '';
page.on('request', req => {
  if (req.url().includes(apiUrlPattern)) {
    const auth = req.headers()['authorization'];
    if (auth?.length > 100) token = auth;
  }
});
await page.reload({ waitUntil: 'domcontentloaded' });
// token 现在有值了
```

## Profile 路径约定

| 类型 | 命名规则 | 例子 |
|------|---------|------|
| Token Daemon | `$TEMP/pw-token-daemon-profile` | 唯一 |
| UI 长驻 | `$TEMP/playwright-{name}-profile` | `playwright-d365-profile` |
| 按需 spawn | `$TEMP/pw-{name}-{pid}` | `pw-jarvis-12345` |

## 已知限制

- **Python playwright 与系统 Edge 版本不兼容** — 不要用 Python playwright 的 `launch_persistent_context`，统一用 Node.js playwright-core
- **Teams v2 域名迁移** — Teams 从 `teams.microsoft.com` 迁到 `teams.cloud.microsoft`，token 在新域名的 localStorage
- **MCP Playwright profile 不可共用** — MCP server 独占 profile lock，其他脚本不能复用
- **playwright-cli 不支持 headless** — D365/OWA 的 playwright-cli 实例必须 headed

## Patrol 集成

Patrol Step 4 预热阶段调用 `node token-daemon.js warmup` 统一预热所有 token：

```bash
# 两个并行任务
pwsh -NoProfile -File .../check-ir-status-batch.ps1 -SaveMeta    # IR/SLA 数据（非 token）
node .../token-daemon.js warmup                                   # Teams+DTM+ICM 统一预热
```

**优势**：
- 4 个独立 Edge 实例 → 1 个共享 Edge 实例（省内存、省 SSO 时间）
- 消费者脚本无需改动（cache 文件路径不变）
- 有效 cache 跳过刷新（几乎零耗时）

## 相关文件

| 文件 | 说明 |
|------|------|
| `.claude/skills/browser-profiles/SKILL.md` | Skill 定义 + Daemon 架构 |
| `.claude/skills/browser-profiles/registry.json` | Profile 注册表 |
| `.claude/skills/browser-profiles/scripts/token-daemon.js` | Daemon 主进程 |
| `playbooks/guides/platform-gotchas.md` | Playwright 平台陷阱 |

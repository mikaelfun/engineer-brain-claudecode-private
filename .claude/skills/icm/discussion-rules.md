---
name: icm-discussion
displayName: ICM Discussion 抓取
category: data-source
stability: stable
promptTemplate: |
  Fetch ICM discussion timeline for incident {incidentId}. Read .claude/skills/icm-discussion/SKILL.md and follow all steps.
description: "通过 agent-browser + ICM REST API 抓取 incident discussion timeline，输出结构化 Markdown。支持写入 case 目录。"
allowed-tools:
  - Bash
  - Read
  - Write
---

# /icm-discussion — ICM Discussion Timeline 抓取

从 ICM portal 抓取 incident 的完整 discussion timeline（含 enrichment、transfer、resolve 记录）。

## 执行模式

### agent-browser 模式（首选）

不依赖 playwright-core，无进程残留，天然支持并发：

```bash
node .claude/skills/icm-discussion/scripts/icm-discussion-ab.js \
  --single {incidentId} --case-dir {caseDir}
```

**casework 直接调用这一个脚本即可**，脚本内部自动处理全场景：

```
TOKEN 获取链路（三级 fallback，全自动）:
  1. 读缓存 → 验证有效 → 直接用（~4s）
  2. agent-browser Edge SSO → CDP 拦截 → 新 token（首次 ~60s，有 session ~15s）
  3. Playwright daemon --token-only（最终回落，~7s）
```

Token 缓存在 `$TEMP/icm-ab-token-cache.json`，170 分钟有效，**所有 case 共享复用**。
输出 `ICM_OK|{id}|entries=N|Xs|source=agent-browser`，结果写入 `{caseDir}/icm/_icm-portal-raw.json`。

**也支持 `--token-only` 模式**，只刷新 token 不拉数据：

```bash
node .claude/skills/icm-discussion/scripts/icm-discussion-ab.js --token-only
```

**依赖**：`npm i -g agent-browser ws`

### Playwright 模式（回落）

当 agent-browser 不可用时，回落到 Playwright persistent context：

```bash
node .claude/skills/icm-discussion/scripts/icm-discussion-daemon.js \
  --single {incidentId} --case-dir {caseDir}
```

使用独立 Playwright profile（`$TEMP/pw-icm-discussion-profile`），headless 模式。
启动时自动清理残留 Edge 进程（`cleanStaleLock`）。
热启动 ~9s，首次 SSO ~22s。

**限制**：Playwright persistent context 是单实例锁，无法并发。

也支持 `--token-only` 模式，刷新 token 到共享缓存文件：

```bash
node .claude/skills/icm-discussion/scripts/icm-discussion-daemon.js --token-only
```

### Patrol 队列模式

由 patrol Phase 0.5 启动 daemon 常驻进程：
```bash
bash .claude/skills/icm-discussion/scripts/icm-discussion-warm.sh {casesRoot}
```

casework-light-runner.sh 检测到 ICM 需要刷新时自动提交 request 到队列：
```bash
bash .claude/skills/icm-discussion/scripts/icm-queue-submit.sh {icmId} {caseDir} {caseNumber} {casesRoot}
```

## 输入

- `incidentId`: ICM incident ID（纯数字，如 `51000000887562`）
- `caseNumber`（可选）: 关联的 D365 case number，指定后将结果写入 `{casesRoot}/active/{caseNumber}/icm/icm-discussions.md`

## 技术原理

ICM v5 前端加载 summary 页面时，会请求两个关键内部 API：

1. **Incident Details**（含 Authored Summary）：
```
GET https://prod.microsofticm.com/api2/incidentapi/incidents({incidentId})/GetIncidentDetails?$expand=...
```
返回的 `Description` 字段即 Authored Summary（HTML 格式）。

2. **Discussion Entries**（完整 timeline）：
```
GET https://prod.microsofticm.com/api2/incidentapi/incidents({incidentId})/getdescriptionentries?$top=100&$skip=0
```
返回 `Items[]` 数组，每条 entry 含作者、时间、类型、正文。

两个 API 需要 Bearer Token（通过 ICM SSO 获取）。

**agent-browser 模式**通过 CDP `Network.requestWillBeSent` 事件拦截 Authorization header 获取 token，然后用 Node.js HTTPS 直接调 API。不拦截 response body，不需要 `page.route()`。

**Token 架构**：
- Bearer Token 由 ICM SSO（`/sso2/token`）颁发，audience=`https://prod.microsofticm.com`
- 有效期 180 分钟，无 refresh_token
- **跨 incident 通用**：所有 case 共享同一个 token
- 缓存在 `$TEMP/icm-ab-token-cache.json`，agent-browser 和 Playwright 两种模式共享读写

## 格式化输出

将 authoredSummary + entries 按时间正序（oldest first）生成 Markdown：

```markdown
# ICM Discussion Timeline — {incidentId}

**Title**: {title}
**Status**: {state} | **Severity**: {sev} | **Team**: {team}
**Created**: {date} | **Resolved**: {date}

---

## Authored Summary

{Description field, HTML stripped to plain text}

---

## Discussion Timeline ({count} entries)

### [2026-02-05 11:30] Created — sijiang
Incident Created

### [2026-02-06 01:02] Discussion — hiengu
I'm waiting for logs access of China cloud...
```

### 写入 case 目录（如指定 caseNumber）

**两个输出文件**：

```
{casesRoot}/active/{caseNumber}/icm/icm-summary.md     ← meta + authored summary + manage access
{casesRoot}/active/{caseNumber}/icm/icm-discussions.md  ← discussion timeline
```

### CSS Mooncake Access 检查逻辑

从 `GetIncidentDetails` 的 `AccessRestrictedToClaims` 数组中：
1. 筛选 `ClaimType === 'MemberOfIcmTeamId'` 的条目
2. 对每个 team ID，用 ICM MCP `get_team_by_id` 查名称
3. 检查是否有 team 名称包含 `CSS Mooncake`（不区分大小写）
4. 记录检查结果到 `icm-summary.md` 的 `### CSS Mooncake Access Check` 段

## 数据结构

每条 entry 的字段：

| 字段 | 说明 |
|------|------|
| `DescriptionEntryId` | 递增 ID |
| `Date` | UTC 时间戳 |
| `SubmittedBy` | 作者 alias |
| `SubmittedByDisplayName` | 作者全名 |
| `Cause` | Created / Edited / Other / Transferred / Resolved |
| `Category` | User / System |
| `Text` | HTML 格式的正文 |
| `EnrichmentId` | 如果是 AI enrichment 则有值 |

## 注意

- agent-browser 模式使用独立 session profile，不与桌面 Edge 冲突
- Token 有效期 180 分钟，缓存 170 分钟后自动刷新
- Playwright 模式使用独立 persistent profile，但无法并发
- 大 incident 可能有 100+ entries，用 `$skip` 分页

# Learnings

经验教训记录。每次遇到值得记住的技术发现、最佳实践或工作流程优化，记录在这里。

## 格式
```
### YYYY-MM-DD — 标题
- 上下文：...
- 发现：...
- 教训：...
```

---

### 2026-03-16 — Claude Code subagent 调度必须通过 Agent 工具

- 上下文：从 OpenClaw 迁移到 Claude Code，原先 caseworker spawn 需要显式传 agentId
- 发现：Claude Code 中 subagent 通过 `.claude/agents/*.md` 定义，Main Agent 使用 `Agent` 工具调度，agent 名字即文件名
- 教训：所有 Case 相关任务必须走 subagent 调度，Main Agent 不直接执行 D365 脚本

### 2026-03-16 — Agency MCP 是 Public-side 服务的最佳接入路线

- 上下文：ICM MCP 直连需要 Public tenant token，本地 `az login` 默认在 China tenant，认证不匹配
- 发现：`agency mcp <name>` 自动维护 OAuth token，本地起代理端口，绕过 tenant 不一致问题
- 教训：ICM/ADO/Teams 等 Public-side MCP 优先用 agency 本地代理，不要折腾 HTTP 直连 + 手动拿 token

### 2026-03-19 — Closure 邮件必须严格按样本三段式格式生成

- 上下文：巡检后发现 2603100030005863 和 2603030040001542 两个 Case 的 closure 邮件草稿未按 `case closure.txt` 样本格式，用了自由格式（加粗标题 + 自定义段落）
- 发现：`email-templates.md` 中 closure 类型只有 4 行泛泛描述（"感谢 → 回顾 → 关单 → 重开"），没有强制要求 `=============` 分隔符和三段式结构（问题描述/问题建议/更多信息），导致 email-drafter 自由发挥
- 修复：
  1. 在 `email-templates.md` closure 段详细定义固定格式（三段式 + `=============` 分隔符 + 中英文标题对照）
  2. 顶部加强"必须先读样本文件、严格匹配格式结构"的约束
- 教训：邮件模板指南如果只写抽象结构描述（如"问题回顾"），agent 会自由发挥格式。必须明确指定分隔符、段落标题名称、格式规则等具体约束，才能确保输出一致

### 2026-03-16 — Teams 搜索必须多策略组合

- 上下文：客户在 Teams 的显示名和 D365 Contact Name 经常不一致，邮箱搜索命中率极低
- 发现：caseNumber 搜索最可靠，客户姓名（从 case-info.md 读取）次之，conversationId 兜底
- 教训：不要从用户名推测真名，搜索必须多策略组合

### 2026-03-19 — fetch-emails.ps1 增量拉取时区 Bug

- 上下文：Case 2603130030004157 增量拉取漏了 2 封邮件（3/19 4:02 和 5:00 UTC 的），导致 status-judge 误判为 pending-customer
- 根因：`Generated:` 时间戳用 `Get-Date` 写本地时间（GMT+8），但 FetchXML `createdon ge` 比较时 D365 按 UTC 解析。本地 11:04 被当作 UTC 11:04，实际对应 UTC 03:04 之后的邮件被截断了 8 小时窗口
- 修复：`Generated:` 改用 `(Get-Date).ToUniversalTime()` 写 UTC 时间，header 加 `(UTC)` 标记，注释说明 UTC 语义
- 教训：与 D365 API 交互的时间戳，写入和读取都必须统一用 UTC，不能依赖本地时区。文件中的时间戳要显式标注时区

### 2026-03-19 — write-teams.ps1 缓存失效：0 结果时不写 _chat-index.json

- 上下文：teams-search agent Step 0 有缓存机制（读 `_chat-index.json` 的 `_lastFetchedAt`），但 patrol 中搜索 0 结果的 case 每次都重复搜索（~45s 浪费）
- 根因：`write-teams.ps1` 的 `Save-ChatIndex` 只在 `if ($data.chats)` 块内调用。0 结果时 chats 为空数组或 null，`_chat-index.json` 从不创建，缓存检查永远失败
- 修复：在 chats 处理循环之后，无条件写入顶层 `_lastFetchedAt` 字段并 `Save-ChatIndex`
- 教训：缓存写入逻辑不能只放在"有数据时"的分支里——"没有数据"本身也是需要缓存的有效结果

### 2026-03-19 — fetch-emails.ps1 旧版 emails.md 无 UTC 标记导致增量遗漏

- 上下文：Case 2603190030000206 的 emails.md 只有 1 封系统邮件，实际有 9 封。增量模式未拉取到新邮件
- 根因：旧版代码写 `Generated: 2026-03-19 09:47:42`（本地时间），新版已修复为 `09:47:42 (UTC)`。但旧文件没有 `(UTC)` 标记，脚本解析时当作 UTC 用于 FetchXML `createdon ge` 过滤——实际 09:47 本地 = 01:47 UTC，差了 8 小时，漏掉中间的邮件
- 修复：解析 `Generated:` 时检测是否包含 `(UTC)` 标记。无标记 → 清空 existingIds + lastFetchTime，强制全量重新抓取。重新写入后 header 带 `(UTC)` 标记，后续增量正常
- 教训：修复写入端（新文件正确）还不够，读取端也要兼容旧格式——要么转换，要么 fallback 到安全模式（全量重抓）

### 2026-03-20 — Claude Code Plan Mode 与 Conductor 冲突导致绕过 track 实现

- 上下文：ISS-019 需要实现 "Track 创建流程完善"。Claude Code 自动进入 `EnterPlanMode`，在 plan mode 中探索代码库、写了详细 4 阶段实现计划，然后 `ExitPlanMode`
- 问题：ExitPlanMode 后上下文被清空重置，新 turn 只看到 "Implement the following plan" + plan 文本。此时完全丢失了 conductor 工作流意识，直接手动实现了所有代码
- 后果：conductor/tracks.md、plan.md、metadata.json 全部不同步；没有走 TDD 验证流程；无法追踪 track 完成状态
- 根因：两套 planning 系统冲突 — Claude Code 内置 Plan Mode（临时的，exit 后清空）vs Conductor（持久化到文件系统的 track/spec/plan）
- 修复：在 CLAUDE.md 关键规则中增加 "❌ 禁止对实现任务使用 EnterPlanMode"，规划应通过 `/conductor:new-track` 完成
- 教训：内置 Plan Mode 适合一次性快速探索，但在有 Conductor 管理的项目中必须禁用，否则 ExitPlanMode 的上下文重置会破坏工作流连续性

### 2026-03-23 — Playwright daemon 生命周期：孤儿进程是设计如此，无需手动清理

- 上下文：进程审计发现一个 `playwright-cli run-cli-server --daemon` 孤儿进程（父进程已退出），担心是否资源泄露
- 发现：
  - `playwright-cli` 是 CLI 客户端，通过 session 文件（`--daemon-session=...default.session`）与后台 daemon 通信
  - 所有 `run-code`、`tab-list`、`open` 等命令都发给同一个 daemon，daemon 管理浏览器实例 + D365 登录态
  - 后续 casework 脚本（`download-attachments.ps1`、`warm-dtm-token.ps1` 等）自动连接已有 daemon 复用，不会创建新进程
  - `Restart-D365Browser` 调用 `playwright-cli kill-all` 时会杀掉所有 Playwright 进程（daemon + 浏览器），然后 `open` 启动新的，确保始终只有一个 daemon 实例
- 教训：Playwright daemon 孤儿进程是设计如此（跨 casework 复用），`kill-all → open` 机制保证不会累积。无需手动清理，留着等下次 casework 自然复用即可

## 2026-03-28: E2E Testing > Shallow Testing

**Problem**: Verification plan generation defaulted to `Skip` for refactor/chore tracks with no UI surface. This led to shallow tests (label checks, static assertions) that missed real behavioral issues.

**Solution**: Added `E2E` test type to conductor verification strategy. Core principle: "只要不是 D365 写入和执行操作，都可以自动化验收". E2E tests use backup → execute → verify → restore pattern. Updated both `conductor/workflow.md` and `.claude/commands/conductor/new-track.md`.

**Key changes**:
- New test type `E2E` — backup data → run actual scripts/workflows → verify file outputs + API + UI → restore data
- `refactor/chore | no UI surface | Skip` rule deprecated — use E2E instead when workflows are executable
- `Skip` now restricted to D365 write/execute operations only (must justify)
- 4 E2E test patterns documented: Data Backup/Restore Wrapper, Script Output Verification, API + File Integration, Full Workflow E2E

## 2026-03-28 — Casework Evolution Loop 发现

### 不要全文扫描 Job 输出来判断成功/失败
- **问题**: `fetch-all-data.ps1` 用 `-match '❌|Failed'` 扫描 `Receive-Job` 输出判断是否失败，但邮件正文内容也被包含在输出中。邮件中的 "❌ 不在 EFSkipIPs" 触发了误报 FAIL。
- **修复**: 只扫描输出最后 5 行（`Select-Object -Last 5`），避免业务内容污染诊断结果。
- **教训**: 当 PowerShell Job 的输出包含用户数据时，错误检测必须限定范围——只检查脚本自身的状态输出。

### 缓存值的时间衰减
- **问题**: `daysSinceLastContact` 在 judge 缓存命中跳过时不更新，随时间推移越来越不准确。
- **修复**: 在 `generate-todo.sh` 中用 `statusJudgedAt` 日期与今天日期的日历差来修正缓存值。
- **教训**: 带时间维度的缓存值需要在使用时加上时间衰减补偿，否则会导致触发条件延迟。

### 2026-04-04 — 调试第三方 SDK 适配：先理解再动手

- **上下文**：为 claude-to-im 飞书 bridge 启用流式卡片（CardKit API），库代码写了 v2 但 SDK 只有 v1
- **发现**：
  - 飞书 SDK 命名空间和文档 API path 不一致（`card.element` → SDK 里是 `cardElement` 且和 `card` 同级）
  - 飞书多个 API 的 body 参数要传 **JSON 字符串**而非 object（`settings`、`card` 字段）
  - esbuild 打包时从 `node_modules/xxx/dist/` 读 JS，不是 `src/` 的 TS
- **教训**：调试第三方 SDK 适配时，**改代码之前**必须先完成三件事：
  1. 查官方 API 文档确认每个接口的 request body schema
  2. grep SDK bundle 确认运行时对象的命名空间结构
  3. 读 build config 确认改哪个文件才能生效
- **反模式**：看到错误 → 猜改法 → 改代码 → 重启 → 人肉测试 → 又有新错 → 再猜（循环 10 轮）
- **正模式**：查文档 + grep SDK + 读 build config → 一次性改完 → 一轮验证

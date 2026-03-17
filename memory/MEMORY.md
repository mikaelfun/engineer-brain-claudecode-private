# Long-term Memory

## 用户信息
- Kun Fang, Azure Support Engineer
- Timezone: Asia/Singapore (GMT+8)
- 主要使用 D365 处理 Azure 技术支持 Case

## 系统架构
- 从 OpenClaw 迁移到 Claude Code（2026-03-16 完成）
- Main Agent（CLAUDE.md）+ 6 Subagent 架构
  - data-refresh / teams-search / compliance-check / troubleshooter / email-drafter / inspection-writer
- Dashboard 使用 Hono + React，通过 Claude Code SDK 驱动 per-case session
- MCP 服务全部通过 agency.exe 本地代理接入（ICM/Teams/ADO/Kusto/msft-learn/workiq/mail）
- Claude Code 环境下 PS1 脚本**不能**调用 MCP 工具（无 `mcporter`/`claude mcp call`），MCP 只能由 agent 直接使用

## 用户偏好
- 界面/文档用中文
- 工作时区 GMT+8
- 邮件草稿只是给用户参考，用户自己发。不要问"发不发"，展示完就结束。

## 架构教训（从 OpenClaw 迁移保留）
- Main Agent 是调度者，不要绕过 subagent 自己干活。所有 Case 相关任务 → 编排 subagent。
- subagent 的执行层教训放各自 agent 文档，Main 只存调度层面的教训。
- 关键规则必须写入 CLAUDE.md / agent 定义，不能仅靠会话记忆。
- D365 playwright-cli 的 tab 状态是隐藏依赖——当前 tab 在 about:blank 时所有 D365 API 静默失败。已通过 `Ensure-D365Tab` 守卫修复。
- Generic Account ≠ 没有 Entitlement，不要想当然。
- 巡检输出必须严格按 schema（inspection-YYYYMMDD.md），不得自由发挥结构。

## MCP 接入教训
- 对 Public-side MCP（ICM/ADO），优先用 `agency mcp <name>` 本地代理方式，不要假设 HTTP 直连 + az login 是最稳路线。
- Agency 维护 OAuth token，本地做代理封装——Teams/ICM/ADO 都走这条路。
- 工具 schema 不等于后端真实能力（如 Teams ListChatMessages 的 filter/orderby 实际不可用），增量方案必须以实测为准。

## Teams 搜索策略
- 搜索 A：caseNumber（最可靠）
- 搜索 B：客户联系人姓名（从 case-info.md 读取，不用邮箱）
- 兜底：conversationId 多轮追问
- Teams 显示名和 D365 Contact Name 经常不一致，搜索必须多策略
- 两步走必须的：SearchTeamsMessages 只返回摘要，ListChatMessages 才有完整消息
- Claude Code 环境：agent 直接调 MCP → 结果传给 `write-teams.ps1` 写文件（旧 `fetch-teams.ps1` 已删除）

## D365 KPI 选择器
- IR/FDR/FWR 的 "Expired" 状态有**两种** DOM selector：
  - `fieldControl-ViolatedTimerLabelID`（计时中超时）
  - `fieldControl-UnsucceededLabelId`（直接标记未成功）
  - 两种都要检查，否则会返回 unknown

## 邮件内联图片
- cid 引用图片的 `att.filename` 可能不带扩展名 → 用 `Ensure-Extension` 从 MIME type 补
- 签名/社交图标需过滤：按文件名模式 + 小于 2KB 跳过
- ConvertFrom-Json 会把 `"...Z"` 的 ISO 时间自动转 DateTime，丢失 UTC 信息 → DateTimeOffset::Parse 当本地时间处理，需显式构造 `new DateTimeOffset(dt, TimeSpan.Zero)`

## casework 性能优化（2026-03-17）
- **去掉 `-Force`**：fetch-all-data 不再传 `-Force`，emails/notes 走增量模式（按 `createdon ge lastFetchTime` 服务端过滤）
- **`-CacheMinutes 10`**：snapshot 10 分钟内缓存命中直接跳过
- **效果实测**（同 case 3 次执行对比）：
  - data-refresh: 207s → 161s → **71s**（-66%），emails 从全量 115s 降至增量 6s
  - compliance: 56s → 15s → **13s**（-77%，entitlementOk 缓存命中跳过）
  - 总耗时: 362s → 264s → **242s**（-33%）
- **根因**：`-Force` 会跳过 fetch-emails.ps1 的增量逻辑，每次全量拉取所有邮件 + 内联图片
- **注意**：首次执行仍需全量拉取；短时间内重复执行受益最大

## 重要记录
- 2026-03-16: 完成 OpenClaw → Claude Code 迁移，9 个 skills + 9 个 playbooks + 6 个 subagent + 4 个 slash commands
- 2026-03-17: 首次完整 casework 执行（2603090040000814），修复 3 个脚本 bug，teams-case-search 改为 MCP 直调 + write-teams.ps1
- 2026-03-17: casework 性能优化 — 去掉 `-Force` + `-CacheMinutes 10`，data-refresh 提速 66%
- Case 数据默认在项目 `cases/` 目录，可通过 config.json 的 casesRoot 配置
- 业务参考数据在 `data/` 目录（mooncake-cc.json：21v 客户-CC 映射）

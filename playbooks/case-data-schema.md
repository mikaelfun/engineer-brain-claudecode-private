# Case 数据结构定义

所有 agent / caseworker / Web UI 共用的 Case 数据 schema。

> 路径配置见 `playbooks/config.md`。所有路径使用 `${CASES_ROOT}` 占位符。

## 目录结构

```text
${CASES_ROOT}/
  active/{case-id}/      # 所有活跃 Case（普通 + AR）
  archived/{case-id}/    # 已关单 Case
  casehealth-state.json  # 全局巡检状态
```

## 单 Case 内文件

| 文件 | 格式 | 写入者 | 说明 |
|------|------|--------|------|
| `case-info.md` | Markdown | d365-case-ops | Case 快照（基本信息、联系人、Entitlement 等） |
| `casehealth-meta.json` | JSON | caseworker / IR 脚本 | 巡检元数据（上次巡检时间、状态等） |
| `inspection-YYYYMMDD.md` | Markdown | caseworker | 巡检摘要（固定 schema，见下方） |
| `emails.md` | Markdown | d365-case-ops | 完整邮件历史（按时间倒序） |
| `notes.md` | Markdown | d365-case-ops | Note 历史（增量更新） |
| `teams/` | 目录 | caseworker | Teams 聊天记录（按会话分文件，增量更新） |
| `user-context.md` | Markdown | 用户手动 / Web UI | 用户补充的上下文（电话、会议等） |
| `timing.json` | JSON | casework (Main Agent) | 各步骤执行耗时统计 |

## 子目录

| 目录 | 内容 | 写入者 |
|------|------|--------|
| `attachments/` | 客户附件（DTM 下载） | d365-case-ops (download-attachments.ps1) |
| `analysis/` | 诊断分析报告 | troubleshooter |
| `drafts/` | 邮件草稿 | email-drafter |
| `research/` | 搜索到的文档/Wiki/KB 链接引用 | troubleshooter |
| `kusto/` | Kusto 查询结果 | troubleshooter |
| `teams/` | Teams 聊天记录（按会话分文件） | teams-search |
| `images/` | 邮件内联图片（自动提取） | d365-case-ops (fetch-emails.ps1) |
| `icm/` | ICM 数据（summary/details/impact） | data-refresh |
| `logs/` | subagent 执行日志（每个 agent 一个 .log 文件） | 各 subagent 自动写入 |

## user-context.md（新增）

这是为 Web UI 预留的文件，用户可以在此补充 caseworker 无法自动获取的信息：

```markdown
# 用户补充上下文

## 2026-03-15 电话沟通
- 客户说问题从上周三开始
- 他们没有改过任何配置
- 已经试过重启，没有效果

## 2026-03-14 远程会议
- 看了客户的环境，发现 NSG 规则有问题
- 截图保存在 attachments/nsg-screenshot.png
```

caseworker 每次开始工作时应检查此文件是否有新内容。

## teams/ 目录（Teams 聊天记录）

按聊天对象或群聊标题分文件保存，支持增量更新。

### 目录结构

```text
teams/
  _search-log.md              # 搜索记录
  _chat-index.json            # chatId → 本地文件/最后消息时间索引
  {sanitized-chat-name}.md    # 按会话分文件
```

### _search-log.md

记录每次 Teams 搜索的时间、关键词、结果状态：

```markdown
# Teams Search Log

| 时间 | 关键词 | 状态 | 说明 |
|------|--------|------|------|
| 2026-03-15 21:30 GMT+8 | messages about case 2603090040000814 | ✅ 成功 | 发现 2 个会话 |
| 2026-03-15 21:30 GMT+8 | messages from customer li | ✅ 成功 | 发现 1 个会话（与 case 搜索有重复） |
| 2026-03-16 09:45 GMT+8 | messages about case 2603090040000814 | ⚠️ 超时 | 90s 未返回 |
| 2026-03-16 09:45 GMT+8 | messages from customer li | ✅ 成功 | 发现 1 个会话 |
```

### 会话文件命名

- 1:1 聊天：`{对方姓名}.md`（如 `zhang-lihong.md`）
- 群聊：`{群聊标题}.md`（如 `aks-team-discussion.md`）
- 频道：`{团队名}-{频道名}.md`
- 文件名只用小写字母、数字、连字符，去掉特殊字符

### 会话文件格式

```markdown
# Teams Chat — {原始标题/对方姓名}

> 最后更新：2026-03-16 09:45 GMT+8
> chatId: 19:xxxxx@thread.v2

## 2026-03-15

**张丽红** (15:30): 这个 case 客户说 ACR pull 一直超时，你看下日志

**Kun Fang** (15:45): 收到，我先查下 Kusto

## 2026-03-14

**张丽红** (10:20): 新 AR case 转给你了，客户比较急
```

### 增量更新规则

- caseworker 启动时应先读取已有 `teams/`，把它视为现成上下文
- 每次搜索结果按会话匹配已有文件
- 已有的消息不重复写入（按 `chatId + 时间戳 + 发言人` 去重；当前脚本允许重写单文件，但最终内容应去重）
- 新消息追加到对应日期段
- 搜索结果为空时不创建文件，只在 `_search-log.md` 记录

### caseworker 调用流程

1. **启动阶段**：读取已有 `teams/` 缓存
2. **优先尝试增量搜索**：从 `_search-log.md` 找最近一次成功时间，优先构造自然语言时间窗查询，例如：
   - `messages about case {caseNumber} since {YYYY-MM-DD}`
   - `messages about case {caseNumber} in the last 7 days`
3. **巡检/处理开始**：后台启动 `fetch-teams.ps1`，默认 timeout 90s
4. **继续其他步骤**：snapshot → emails → notes → attachments → ICM → IR check
5. **进入分析前**：poll Teams 后台任务
   - 已完成 → 解析结果，按 `chatId` 去重并增量写入 `teams/`
   - 未完成 → 再等最多 15s
   - 仍未完成 → 标记 `⚠️ teams-pending`，继续无 Teams 数据的分析
6. **回退策略**：若增量时间窗结果明显异常、过窄或未命中但怀疑有上下文遗漏，则回退到无时间窗的全量搜索
7. **inspection 记录**：在“本次完成”段标注 Teams 数据获取状态，并注明本次是“增量搜索”还是“全量回退”

## case-info.md 中的 ICM 信息要求

`case-info.md` 在存在已绑定 ICM 时，应尽量包含：
- ICM Number / Incident ID
- ICM Title（如可获取）
- ICM State / Severity（如可获取）
- Owning Team / Owning Team ID（如可获取）

caseworker 处理 ICM 的默认逻辑：
1. 先从 `case-info.md` 读取已绑定 ICM number
2. 有绑定 → 直接查该 incident
3. 无绑定 → 暂不主动做全量 ICM 搜索（后续单独补功能）

## casehealth-meta.json

机器可读的 Case 元数据，用于快速判断 Case 状态（不需要解析 Markdown）。

### 写入者
- `data-refresh`：通过 `fetch-all-data.ps1 -IncludeIrCheck` 写入 `irSla`/`fdr`/`fwr`（check-ir-status.ps1）
- `compliance-check`：写入 `compliance` 对象（Entitlement + 21v Convert，不涉及 IR）
- `Main Agent`（casework Step 3b）：写入 `actualStatus` / `daysSinceLastContact`

### IR/FDR/FWR status 值

`check-ir-status.ps1` 的原始输出直接写入，**不做 kebab-case 转换**：

| check-ir-status.ps1 输出 | 写入 meta 的值 | 含义 |
|--------------------------|---------------|------|
| `Succeeded` | `Succeeded` | SLA 已满足 |
| `In Progress` | `In Progress` | SLA 计时中 |
| `Nearing` | `Nearing` | 接近超时 |
| `Expired` | `Expired` | SLA 超时 |
| `unknown` | `unknown` | 数据缺失或检查失败 |

### Schema（精确格式，所有写入者必须遵循）

```json
{
  "caseNumber": "2603090040000814",
  "lastInspected": "2026-03-17T11:00:00+08:00",
  "actualStatus": "pending-customer",
  "daysSinceLastContact": 4,
  "irSla": {
    "status": "Succeeded",
    "remaining": null,
    "checkedAt": "2026-03-17T11:00:00+08:00"
  },
  "fdr": {
    "status": "Expired",
    "remaining": null,
    "checkedAt": "2026-03-17T11:00:00+08:00"
  },
  "fwr": {
    "status": "Expired",
    "remaining": null,
    "checkedAt": "2026-03-17T11:00:00+08:00"
  },
  "compliance": {
    "is21vConvert": true,
    "21vCaseId": "20260309398206",
    "21vCaseOwner": "zhang.lihong@oe.21vianet.com",
    "entitlementOk": true,
    "serviceLevel": "Premier",
    "serviceName": "Unfd AddOn | ProSv Ente - China Cld",
    "contractCountry": "China",
    "warnings": []
  }
}
```

### 字段说明

| 字段 | 类型 | 写入者 | 说明 |
|------|------|--------|------|
| `caseNumber` | string | data-refresh | Case 编号 |
| `lastInspected` | ISO 8601 | any | 最后更新时间 |
| `actualStatus` | string | Main Agent | `pending-customer` / `pending-engineer` / `pending-pg` / `ready-to-close` / `new` / `researching` |
| `daysSinceLastContact` | number | Main Agent | 距上次工程师邮件的天数 |
| `irSla` | object | data-refresh | IR SLA 状态 |
| `fdr` | object | data-refresh | FDR 状态 |
| `fwr` | object | data-refresh | FWR 状态 |
| `irSla/fdr/fwr.status` | string | data-refresh | `Succeeded` / `In Progress` / `Nearing` / `Expired` / `unknown` |
| `irSla/fdr/fwr.remaining` | string\|null | data-refresh | 剩余时间，已满足时为 null |
| `irSla/fdr/fwr.checkedAt` | ISO 8601 | data-refresh | 检查时间 |
| `compliance` | object | compliance-check | 合规检查结果 |
| `compliance.is21vConvert` | boolean | compliance-check | 是否 21v 转单 |
| `compliance.21vCaseId` | string\|null | compliance-check | 21v Case ID |
| `compliance.21vCaseOwner` | string\|null | compliance-check | 21v Owner 邮箱 |
| `compliance.entitlementOk` | boolean | compliance-check | Entitlement 是否合规（Service Name/Schedule 含 China Cld/Cloud 且 Contract Country = China） |
| `compliance.serviceLevel` | string | compliance-check | Premier / ProDirect / Standard |
| `compliance.serviceName` | string | compliance-check | Entitlement 的 Service Name 原值 |
| `compliance.contractCountry` | string | compliance-check | Entitlement 的 Contract Country 原值 |
| `compliance.warnings` | string[] | compliance-check | 警告列表 |

### ⚠️ 禁止的字段名

以下字段名曾被 subagent 错误使用，**禁止出现**：
- ❌ `is21v`（用 `compliance.is21vConvert`）
- ❌ `21vCaseNumber` / `twentyOneVTicket`（用 `compliance.21vCaseId`）
- ❌ `21vOwner` / `twentyOneVOwner`（用 `compliance.21vCaseOwner`）
- ❌ `irMet`（用 `irSla.status`）
- ❌ `entitlement`（用 `compliance.serviceLevel`）
- ❌ 顶层的 `entitlementOk`（放在 `compliance` 内）

### 规则
- 使用 **upsert** 模式：读取已有文件 → 合并更新 → 写回
- `irSla`/`fdr`/`fwr` 由 data-refresh 写入，compliance-check 不覆盖
- `actualStatus` 由 Main Agent 写入，其他 agent 不写
- 未知值用 `null`，不省略字段

## inspection-YYYYMMDD.md（巡检摘要）

**文件命名**：`inspection-YYYYMMDD.md`（如 `inspection-20260315.md`）。同一天多次巡检覆盖同一文件。

**caseworker 必须严格按此 schema 输出，不得自由发挥结构。**

```markdown
# Inspection — {case-id} — {YYYY-MM-DD}

## 基本信息

| 字段 | 值 |
|------|-----|
| 巡检时间 | YYYY-MM-DD HH:MM GMT+8 |
| Case Number | |
| 标题 | |
| D365 状态 | |
| 实际状态 | 基于沟通进展判断的实际状态（可能与 D365 不同） |
| 客户 | |
| 联系人 | |

## 本次完成

- [ ] 刷新 case snapshot（若失败则标记“沿用旧缓存”）
- [ ] 归档邮件（N 封非系统邮件 / 或“邮件历史未更新”）
- [ ] 归档 Note（N 条 / 或“Note 历史未更新”）
- [ ] 下载附件（N 个）
- [ ] 更新 ICM 状态（有/无/未查询到）
- [ ] Entitlement / 21v 合规检查（若已缓存合规则跳过）
- [ ] Teams 消息搜索（✅ 成功 N 个会话 / ⚠️ 超时跳过 / ⏭ 已有缓存）

## 合规检查

| 检查项 | 结果 | 说明 |
|--------|------|------|
| Entitlement | OK / 异常 | Service Name / Contract Country / Service Level |
| 21v Convert | 是 / 否 | 21v Case ID / Owner / Teams 邮箱（如适用） |

## 时间线

| 事件 | 时间 | 说明 |
|------|------|------|
| 最后客户邮件 | | 简述内容 |
| 最后工程师回复 | | 简述内容 |
| 最后 Note | | |
| 最后 Labor | | 累计 N min |
| 最后 follow-up | | （如有） |
| 最后 ICM 更新 | | （如有） |

## 分流结论

- **状态分流**：Pending Engineer / Pending Customer / Pending PG ICM / 待关单
- **下一步建议 / 已执行动作**：（1-2 句话概括已做什么、还差什么）

## Todo

### 🔴 需人工决策
- [ ] （需要用户判断才能继续的事项）

### 🟡 待确认执行
- [ ] （caseworker 已做完能做的部分后，仍需要用户点头的事项，如 Note / Labor / SAP）

### ✅ 仅通知
- [x] （已完成的、仅告知的事项）

## 执行统计

数据来源：`timing.json`（由 Main Agent 在 casework 结束时写入）。

| 指标 | 值 |
|------|-----|
| 总耗时 | Xm Xs |
| 步骤耗时 | data-refresh Xs / teams-search Xs / compliance Xs / troubleshooter Xs / email-drafter Xs / inspection Xs |
| 跳过步骤 | {skippedSteps 列表，或"无"} |
| 异常 | {errors 列表，或"无"} |
```

### Schema 规则

1. **字段不能省略**：即使值为空也保留行，填 `N/A` 或 `无`
2. **Todo 必须用三级分类**：🔴 需人工决策 / 🟡 待确认执行 / ✅ 仅通知
3. **时间格式**：`YYYY-MM-DD HH:MM GMT+8`
4. **不要在 inspection 文件里放大段技术分析**，那些放 `analysis/` 目录
5. **分流结论必须明确**，不能含糊（如“可能是 Pending Customer” → 应写“Pending Customer”）
6. inspection 由 caseworker 写；Main 再从中提炼全局 Todo

## analysis/ 目录（诊断分析报告）

### 文件命名建议

```text
YYYYMMDD-HHMM-{topic}.md
```

示例：
- `20260316-1105-acr-pull-timeout.md`
- `20260316-1420-vm-extension-failure.md`

### `topic` 来源规则

按以下优先级确定 `topic`：
1. **Case 主问题关键词**（优先）
   - 例如：`acr-pull-timeout`
2. **产品名 + 症状**
   - 例如：`vm-extension-failure`、`aks-node-notready`
3. **明确的错误码 / 关键报错**
   - 例如：`arm-conflict-409`、`gateway-timeout-504`
4. **若仍不明确** → 使用 `general-analysis`

规则：
- 小写
- 单词间用连字符 `-`
- 避免空格、中文标点、过长标题
- 同一 Case 同一轮分析尽量保持 topic 稳定，方便后续对比

### 标准分析报告结构

`analysis/` 下的报告应参照：
`C:\Users\fangkun\.vscode\Projects\CopilotSkills\VmScimPod\.copilot\copilot-instructions.md`
中的 **`## 标准分析报告结构 (Standard Analysis Report Structure)`**。

至少包含以下四段：

1. **根因分析结论**
   - 关键时间线表格
   - 根因确认
   - 可能原因列表

2. **诊断查询过程**
   每个查询都要说明：
   - 为什么执行这个查询
   - KQL 查询语句
   - 查询结果
   - 发现 / 结论

3. **知识来源引用**
   - 本地知识库
   - ADO-ContentIdea
   - ADO-Wiki
   - Microsoft Learn
   - 技术原理说明

4. **建议后续行动**
   - 需要用户补充的信息
   - 预防 / 解决建议

## drafts/ 目录（邮件草稿）

### 文件命名规范

```text
YYYYMMDD-HHMM-{mail-type}-{lang}-{recipient}.md
```

示例：
- `20260316-1035-request-info-zh-customer-li.md`
- `20260316-1540-result-confirm-en-john-smith.md`

### 文件头规范

```markdown
# Draft Email

- Type: {mail-type}
- Language: zh / en
- To: {recipient}
- Suggested Subject: {subject}
- Based on: {latest-customer-email-time / case status / analysis}

## Body
{邮件正文}

## Notes for User
- 为什么这样写
- 是否有风险 / 是否需要你补充
```

规则：
- 根据客户最近邮件语言自动判断 `zh` / `en`
- 双语或不明确时，以最近一轮客户邮件语言为准
- `## Body` 是发给客户的正文
- `## Notes for User` 只给用户自己看，不进入邮件正文
- caseworker 每次完成邮件初稿后，都应按语言强制走一遍去 AI 风格处理：中文用 `humanizer-zh`，英文用 `humanizer`
- 去 AI 风格处理的目标是改善自然度、减少模板腔和 AI 味，不得改变技术结论、承诺、下一步动作、时间点、客户关键信息
- 邮件由用户自己复制发送，caseworker 不直接发送

## 平台无关性说明

这份数据结构是**纯文件系统**的：
- 所有数据都是 Markdown 或 JSON
- 不依赖任何数据库
- 不依赖 OpenClaw 特有功能
- Web UI / Claude Code / 其他 agent 框架都可以直接读写

未来如果迁移到 Web 方案：
- Case 数据可以直接复用
- Web 后端只需要提供文件读写接口
- 或者迁移到数据库时，这些文件就是数据源

## timing.json（执行时间统计）

**文件位置**：`{caseDir}/timing.json`
**写入者**：casework (Main Agent)
**写入时机**：casework 流程步骤 5.5，所有 subagent 完成后、展示结果前

### Schema

```jsonc
{
  "$schema": "timing-v1",
  "caseworkStartedAt": "2026-03-17T14:30:00+08:00",  // ISO 8601，流程开始时间
  "caseworkCompletedAt": "2026-03-17T14:33:00+08:00", // ISO 8601，流程结束时间
  "totalSeconds": 180,                                // 总耗时（秒，取整）

  "steps": {
    // 每个执行过的步骤都有一条记录
    "dataRefresh": {
      "startedAt": "2026-03-17T14:30:05+08:00",
      "completedAt": "2026-03-17T14:31:05+08:00",
      "seconds": 60
    },
    "teamsSearch": {
      "startedAt": "2026-03-17T14:30:05+08:00",
      "completedAt": "2026-03-17T14:30:50+08:00",
      "seconds": 45
    },
    "complianceCheck": {
      "startedAt": "2026-03-17T14:31:05+08:00",
      "completedAt": "2026-03-17T14:31:35+08:00",
      "seconds": 30
    },
    "troubleshooter": {
      "startedAt": "2026-03-17T14:31:35+08:00",
      "completedAt": "2026-03-17T14:32:15+08:00",
      "seconds": 40
    },
    "emailDrafter": {
      "startedAt": "2026-03-17T14:32:15+08:00",
      "completedAt": "2026-03-17T14:32:40+08:00",
      "seconds": 25
    },
    "inspectionWriter": {
      "startedAt": "2026-03-17T14:32:40+08:00",
      "completedAt": "2026-03-17T14:32:55+08:00",
      "seconds": 15
    }
  },

  // 未执行的 subagent 名称列表
  "skippedSteps": ["troubleshooter"],

  // 执行中遇到的错误/异常摘要（无异常则为空数组）
  "errors": []
}
```

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `$schema` | string | 固定 `"timing-v1"` |
| `caseworkStartedAt` | ISO 8601 | casework 流程开始时间（步骤 1 读配置后） |
| `caseworkCompletedAt` | ISO 8601 | casework 流程结束时间（步骤 5.5） |
| `totalSeconds` | number | 总耗时秒数（取整） |
| `steps` | object | 各步骤耗时明细 |
| `steps.{name}` | object | 单个步骤：`startedAt`/`completedAt` (ISO 8601) + `seconds` (number) |
| `skippedSteps` | string[] | 未执行的 subagent 名称列表 |
| `errors` | string[] | 错误/异常摘要列表 |

### 步骤名称枚举

| steps key | 对应 subagent/阶段 |
|-----------|-------------------|
| `dataRefresh` | data-refresh agent |
| `teamsSearch` | teams-search agent |
| `complianceCheck` | compliance-check agent |
| `troubleshooter` | troubleshooter agent |
| `emailDrafter` | email-drafter agent |
| `inspectionWriter` | inspection-writer agent |

### 规则

- Main Agent 通过 `pwsh -c "(Get-Date).ToString('o')"` 在各步骤边界获取时间戳
- 耗时秒数通过 `pwsh -c "([datetime]'{end}' - [datetime]'{start}').TotalSeconds"` 计算并取整
- 并行步骤（dataRefresh + teamsSearch）使用各自的实际开始/结束时间
- `skippedSteps` 和 `steps` 互斥：同一步骤不会同时出现在两者中
- `errors` 记录执行中的异常摘要（如 "teams-search 超时" "IR 检查脚本失败"），不含敏感信息
- 此文件仅用于性能分析，不影响 `casehealth-meta.json` 中的合规数据
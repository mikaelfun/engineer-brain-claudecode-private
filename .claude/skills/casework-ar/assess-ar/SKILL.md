---
description: "AR Step 2 Assess — AR scope 提取 + communicationMode 检测 + 双模式 status 判断"
name: casework-ar:assess-ar
displayName: AR 状态评估
category: casework-sub-skill
stability: beta
requiredInput: caseNumber
promptTemplate: |
  Run AR assess for Case {caseNumber}. Read .claude/skills/casework-ar/assess-ar/SKILL.md and follow all steps.
allowed-tools:
  - Bash
  - Read
  - Write
  - Agent
---

# /casework-ar:assess-ar — AR Step 2 Assess

AR Case 专用状态评估。与主 casework assess 的区别：增加 AR scope 提取 + communicationMode 检测 + 双模式 status 判断规则。

## 输入契约

- `{caseDir}/.casework/data-refresh-output.json` — Step 1 产物
- `{caseDir}/casework-meta.json` — 必须含 `isAR: true` 和 `mainCaseId`
- `{caseDir}/case-info.md` — D365 snapshot（从 main case 拉取）
- `{caseDir}/emails.md` — 来自 main case 的邮件
- `{caseDir}/notes-ar.md` — AR 专属 notes（如存在）

## 输出契约

- `{caseDir}/casework-meta.json` — upsert ar.scope, ar.communicationMode, actualStatus, daysSinceLastContact
- `{caseDir}/.casework/execution-plan.json` — PRD §4.3 schema

## 执行步骤

### Step 1. DELTA_EMPTY 快速路径

同主 assess：读 data-refresh-output.json，`DELTA_EMPTY` → 复用 meta 的 actualStatus，actions=[]，零 LLM。

### Step 2. Compliance gate（hash cache）

同主 assess 的完整 compliance-check 逻辑（Entitlement + 21v Convert + CC Finder + SAP 三层检查），但 **AR 特化 SAP 检查**：

- **Entitlement**：基于 main case 数据（合同绑在 main case 上）
- **21v Convert**：读 `## AR Customer Statement`（AR 问题描述，优先）+ `## Customer Statement`（main case 兜底）
- **CC Finder**：基于 main case 客户名
- **SAP 三层检查（AR 特化）**：
  - 4.5a Mooncake 路径检测：使用 **`| AR Support Area Path |`** 行（AR 产品必须是 Mooncake）
  - 4.5b Pod 负责范围检测：使用 **`| AR Support Area Path |`** 行（AR scope 必须在 pod 范围内）
  - 4.5c SAP 与问题描述一致性：使用 **`| AR Support Area Path |`** + **`## AR Customer Statement`**（AR SAP 必须匹配 AR 问题，不是 main case 问题）
  - → sapOk = sapMooncake && sapInPod && !sapMismatch
  - 结果写入 compliance 时额外保存 `arSapPath` 字段

AR 缓存策略更积极：Entitlement 基于 main case 数据，合同不因 AR 变化。首次检查后缓存永久有效（`compliance.entitlementOk` 有值即跳过）。

`entitlementOk === false` → 阻断。

### Step 3. AR Scope 提取（首次 or scopeConfirmed !== true）

```
读取 {caseDir}/notes-ar.md + case-info.md（AR case title + AR Customer Statement + AR Support Area Path）
LLM 提取 AR scope 一句话摘要
Upsert meta: ar.scope = "{extracted_scope}", ar.scopeConfirmed = false
```

如果 `meta.ar.scopeConfirmed === true`，跳过提取（scope 已手动确认）。

### Step 4. 沟通模式检测

```
读取 {caseDir}/emails.md 最近几封邮件的 To/CC 字段
检查工程师邮箱（fangkun@microsoft.com）是否在参与者中
是 → communicationMode = "customer-facing"
否 → communicationMode = "internal"
提取 case owner 邮箱/名字（从 case-info.md 的 Owner 字段）
Upsert meta: ar.communicationMode, ar.caseOwnerEmail, ar.caseOwnerName
```

### Step 5. Enrichment：inline OneNote 分析 + Teams（门控）

同主 assess 的 gate-subagents.sh 逻辑，但**全部 inline，不 spawn**。

**OneNote inline 分析**：读 `{caseDir}/onenote/_page-*.md`，分析后**重写 `{caseDir}/onenote/personal-notes.md`**。

格式模板：读取 `.claude/skills/onenote/personal-notes-template.md`，按模板结构输出（Facts/Analysis 汇聚 + 详细页面 + Summary）。

**Teams 搜索关键词**根据沟通模式调整：
- `internal` → 搜 case owner 名 + AR case number
- `customer-facing` → 搜客户名 + main case number

### Step 6. 主 LLM：AR Status 判断 + actions 决策

**AR Mode 判断原则**：

**内部模式** (`communicationMode = "internal"`)：
- 你与 case owner 之间的沟通，不直接面对客户
- `pending-engineer` = case owner 在 notes/Teams 中提了新问题，你未回应
- `pending-customer` = 你在 notes 中回复了，等 case owner 反馈
- `ready-to-close` = AR scope 问题已解决，你已回复 case owner
- `daysSinceLastContact` = 距你最后一次在 `notes-ar.md` 中回复的天数

**客户面向模式** (`communicationMode = "customer-facing"`)：
- 你被拉入客户邮件链，直接面对客户（但只处理 AR scope 内的问题）
- `pending-engineer` = 客户发了新的 AR scope 内问题，你未回复
- `pending-customer` = 你回复了客户（AR scope 内），等客户反馈
- `ready-to-close` = 客户确认 AR scope 问题已解决
- `daysSinceLastContact` = 距你最后一次在 `emails.md` 中给客户发邮件的天数

**AR 判断步骤**：
1. 读取 `notes-ar.md`（最后几条 note）
2. 读取 `emails.md` 最后 100 行
3. 读取 `ar.communicationMode` 和 `ar.scope`
4. **内部模式**：检查 notes-ar.md 最后一条 note 是谁写的
   - case owner → pending-engineer
   - 你 → pending-customer 或 researching
5. **客户面向模式**：分析 emails.md 最后几封邮件
   - 客户最后发邮件且涉及 AR scope → pending-engineer
   - 你最后发邮件（AR scope 回复）→ pending-customer

**Prompt 模板**：

```
你是 D365 AR Case 状态判定助手。

## 判定原则（必须遵守）

### actualStatus 信号分层
actualStatus 是对**实际沟通状态**的事实判断：
- ✅ 输入信号：邮件方向+内容、Notes/notes-ar.md 记录、ICM 状态、Teams Key Facts
- ❌ 不作为 actualStatus 输入：`drafts/` 未发送草稿、`analysis/` 排查文件、todo
- drafts/analysis 只在 actions 决策中使用

### AR 特化：daysSinceLastContact 定义
- internal 模式：距你最后一次在 `notes-ar.md` 中回复的天数
- customer-facing 模式：距你最后一次在 `emails.md` 中给客户发邮件的天数

### 邮件方向 ≠ 状态
最后邮件方向不等于状态，需结合内容（case owner 发"已收到谢谢" ≠ pending-engineer）

## AR Context
- AR Scope: {ar.scope}
- Communication Mode: {ar.communicationMode}
- Case Owner: {ar.caseOwnerName} ({ar.caseOwnerEmail})
- Main Case: {mainCaseId}

## 数据
### notes-ar.md (AR 专属 notes)
{notes_ar_tail}

### emails.md (main case 邮件, 最后 100 行)
{emails_tail}

### meta
{meta_json}

## 输出（纯 JSON）
{
  "caseNumber": "{caseNumber}",
  "actualStatus": "<pending-engineer|pending-customer|pending-pg|researching|ready-to-close>",
  "daysSinceLastContact": <int>,
  "statusReasoning": "<≤200字，AR scope 内关键依据 → {actualStatus}>",
  "actions": [...],
  "noActionReason": "<string or null>",
  "routingSource": "llm"
}
```

### Step 7. 写 execution-plan.json + 更新 meta

调 `write-execution-plan.py`（复用 T2 脚本）+ upsert meta。

**邮件去重规则**（推荐 email-drafter 前必须检查）：
- 读 `{caseDir}/emails.md` 检查工程师是否已发过同类型邮件
- `{caseDir}/drafts/` 有未发送草稿且内容仍相关 → 推荐 `no-agent`
- AR 模式额外注意：internal 模式检查 `notes-ar.md` 最近回复，customer-facing 检查 `emails.md` 最近发出邮件

**AR 安全规则**：保留已有的 `isAR`、`mainCaseId`、`ar.*` 字段不覆盖，只写入 `actualStatus`/`daysSinceLastContact`/`lastAssessedAt`。

## Safety Redlines

- ❌ 不发邮件
- ❌ 不修改 D365
- ✅ AR scope 内容只读分析
- ✅ compliance 基于 main case 数据

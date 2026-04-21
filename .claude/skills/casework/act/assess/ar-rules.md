# AR Case Assess Rules

assess Step 2.5 + Step 4 AR 分支规则。仅 `isAR=true` 时按需加载。

## Step 2.5. AR Enrichment

> 当 `casework-meta.json` 中 `isAR === true` 时执行以下步骤，否则跳过。

### 2.5a. AR Scope 提取（首次 or scopeConfirmed !== true）

```
读取 {caseDir}/notes-ar.md + case-info.md（AR case title + AR Customer Statement + AR Support Area Path）
LLM 提取 AR scope 一句话摘要
Upsert meta: ar.scope = "{extracted_scope}", ar.scopeConfirmed = false
```

如果 `meta.ar.scopeConfirmed === true`，跳过提取（scope 已手动确认）。

### 2.5b. 沟通模式检测

```
读取 {caseDir}/emails.md 最近几封邮件的 To/CC 字段
检查工程师邮箱（fangkun@microsoft.com）是否在参与者中
是 → communicationMode = "customer-facing"
否 → communicationMode = "internal"
提取 case owner 邮箱/名字（从 case-info.md 的 Owner 字段）
Upsert meta: ar.communicationMode, ar.caseOwnerEmail, ar.caseOwnerName
```

### 2.5c. AR-specific OneNote 分析

读 `{caseDir}/onenote/_page-*.md`，分析后**重写 `{caseDir}/onenote/onenote-digest.md`**。
格式模板：读取 `.claude/skills/onenote/onenote-digest-template.md`。

### 2.5d. AR-specific Teams 搜索关键词

根据沟通模式调整搜索关键词：
- `internal` → 搜 case owner 名 + AR case number
- `customer-facing` → 搜客户名 + main case number

## Step 4 AR Mode 判断规则

当 `isAR=true` 时，以下规则**替代**普通模式 status 判断：

**内部模式** (`ar.communicationMode = "internal"`)：
- 你与 case owner 之间的沟通，不直接面对客户
- `pending-engineer` = case owner 在 notes/Teams 中提了新问题，你未回应
- `pending-customer` = 你在 notes 中回复了，等 case owner 反馈
- `ready-to-close` = AR scope 问题已解决，你已回复 case owner
- `daysSinceLastContact` = 距你最后一次在 `notes-ar.md` 中回复的天数

**客户面向模式** (`ar.communicationMode = "customer-facing"`)：
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

## AR Context 注入模板

当 `isAR=true` 时，LLM prompt 额外注入：
```
## AR Context
- AR Scope: {ar.scope}
- Communication Mode: {ar.communicationMode}
- Case Owner: {ar.caseOwnerName} ({ar.caseOwnerEmail})
- Main Case: {mainCaseId}

### notes-ar.md (AR 专属 notes)
{notes_ar_tail}
```

## AR 邮件去重补充

- internal 模式检查 `notes-ar.md` 最近回复
- customer-facing 检查 `emails.md` 最近发出邮件

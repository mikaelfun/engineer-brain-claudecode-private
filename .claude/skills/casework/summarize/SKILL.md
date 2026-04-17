---
description: "Step 4 Summarize — case-summary.md 增量更新 + todo 生成 + meta 更新"
name: casework:summarize
displayName: Case 总结
category: casework-sub-skill
stability: beta
requiredInput: caseNumber
promptTemplate: |
  Run Step 4 (summarize) for Case {caseNumber}. Read .claude/skills/casework/summarize/SKILL.md and follow all steps.
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
---

# /casework:summarize — Step 4 Summarize

增量更新 case-summary.md + 规则化生成 todo + 更新 casework-meta.json。

**本 skill 替代了旧的 `/inspection-writer`**——核心 summary 生成规则已完整内联在 Step 3 中，不依赖外部文件。

## 输入契约

- `{caseDir}/.casework/data-refresh-output.json` — 可选（用于推导 changePath；不存在时视为 CHANGED）
- `{caseDir}/case-info.md` — D365 snapshot
- `{caseDir}/emails.md` — 邮件
- `{caseDir}/casework-meta.json` — 累计元数据

## 输出契约

- `{caseDir}/case-summary.md` — 增量更新（首次生成或追加）
- `{caseDir}/todo/YYMMDD-HHMM.md` — 规则化 todo
- `{caseDir}/casework-meta.json` — upsert `lastInspected`
- `{caseDir}/.casework/pipeline-state.json` — 标记 summarize completed

## 执行步骤

### Step 1. 推导 changePath

v2 取消了 changegate；从 data-refresh-output.json 的 `deltaStatus` 推导：

```bash
CHANGE_PATH=$(bash .claude/skills/casework/summarize/scripts/derive-change-path.sh \
  "{caseDir}/.casework/data-refresh-output.json")
# CHANGED | NO_CHANGE
```

### Step 2. Pipeline state — 标记 summarize running

```bash
python3 .claude/skills/casework/act/scripts/update-pipeline-state.py \
  --case-dir "{caseDir}" --step "summarize" --status "running" \
  --case-number "{caseNumber}"
```

### Step 3. 执行 summary 更新

#### 3.1 changePath 决策树

- `NO_CHANGE + case-summary.md 已存在` → 跳过 summary，直接到 Step 3.5 todo
- `NO_CHANGE + case-summary.md 不存在` → 首次生成（Step 3.2）
- `CHANGED + case-summary.md 不存在` → 首次生成（Step 3.2）
- `CHANGED + case-summary.md 已存在` → 增量追加（Step 3.3）

#### 3.2 首次生成 case-summary.md

读取：`case-info.md`、`emails.md`、`notes.md`、`teams/teams-digest.md`（如有；不存在则回退读 `teams/*.md`）、`claims.json`（如有）、`onenote/personal-notes.md`（如有，仅引用 `[fact]` 条目，`[analysis]` 加 `[unverified]` 前缀）。
AR Case 额外读取 `notes-ar.md`。

用 Write 工具生成完整 summary，格式：

```markdown
# Case Summary — {caseNumber}

## 问题描述
{一句话描述客户问题}

## 排查进展
- [{YYYY-MM-DD}] {事件1}
- [{YYYY-MM-DD}] {事件2}

## 关键发现
- {发现1}

## 风险
- {基于 actualStatus + days + SLA 的风险评估}
```

**规则**：
- 「问题描述」从 case-info title + 首封邮件提取，一句话
- 「排查进展」按时间线梳理关键事件（邮件往来、电话、Note 记录等），每条一行
- 「关键发现」提取诊断结论（来自 analysis/ 或邮件中的技术内容）
- 「风险」评估 SLA、客户响应、是否需要升级等
- **Entitlement 不合规时**：在「风险」首行插入 `⚠️ **Entitlement Warning** — Service: {serviceName}, Schedule: {schedule}, Country: {contractCountry}。请联系 TA 确认。`
- **RDSE 客户时**：在「问题描述」末尾注明 `[RDSE: {ccAccount}]`

**AR Case 规则**（`meta.isAR === true`）：
- 「问题描述」格式：`[AR] {ar.scope} — Main Case: {mainCaseId}`
- 「排查进展」从 notes-ar.md + emails.md 提取 AR scope 相关事件
- 「关键发现」仅包含 AR scope 内的诊断结论
- 「风险」不包含 SLA 风险评估
- 额外 section **「AR 信息」**（放在「问题描述」和「排查进展」之间）：
  ```markdown
  ## AR 信息
  - Main Case: {mainCaseId}
  - Case Owner: {ar.caseOwnerName} ({ar.caseOwnerEmail})
  - Communication Mode: {ar.communicationMode}
  - Scope: {ar.scope}
  ```

#### 3.3 增量追加 case-summary.md

仅读取**新增内容**（自上次 inspection 后的新邮件、notes、teams-digest Key Facts）。

用 **Edit 工具**追加：
1. 在「排查进展」末尾追加 1-2 行新事件
2. 如有新发现，追加到「关键发现」
3. 如风险状况变化，更新「风险」section

**不要**重写整个文件，只 Edit 追加/修改变化部分。

**claims.json 感知**（如 `{caseDir}/claims.json` 存在）：

| claim status | 写入 case-summary 的方式 |
|--------------|------------------------|
| `verified` | 正常写入 |
| `challenged` | 加 `[unverified]` 前缀 |
| `rejected` | **不写入** summary |
| `pending` | 正常写入（向后兼容） |

**清理机制**：已有 `[unverified]` 且 claim 变 `verified` → Edit 移除前缀；claim 变 `rejected` → Edit 删除。

**AR Case**：增量逻辑相同，但只关注 AR scope 相关新事件。如 `ar.communicationMode` 或 `ar.scopeConfirmed` 变化，更新「AR 信息」section。

#### 3.4 SAP 准确性检查

在 summary 更新后（已读完 case-info + summary），判断 SAP 是否与 case 实际内容匹配。

读 `{dataRoot}/sap-scope.json` 的 `podServices` 列表。提取 SAP 叶子节点（最后一个 `/` 后）对比 case-summary 的「问题描述」。

判断结果写入 `casework-meta.json.sapCheck`：`{ currentSap, isAccurate, suggestedSap, reason, checkedAt }`

**跳过条件**：`sapCheck.checkedAt` 距今 < 24h 且已有结果 → 跳过。AR Case → 跳过。

#### 3.5 generate-todo.sh

```bash
bash skills/casework/scripts/generate-todo.sh "{caseDir}"
# 输出: TODO_OK|red=N,yellow=N,green=N
```

#### 3.6 更新 meta

upsert `casework-meta.json.lastInspected` = ISO now

### Step 4. Pipeline state — 标记 summarize completed + 日志

```bash
python3 .claude/skills/casework/act/scripts/update-pipeline-state.py \
  --case-dir "{caseDir}" --step "summarize" --status "completed" \
  --case-number "{caseNumber}"

echo "SUMMARIZE_OK|changePath=$CHANGE_PATH|elapsed=${SECONDS}s"
```

## Safety Redlines

- ❌ 不直接发邮件
- ❌ 不修改 D365（不 add-note、不 record-labor）
- ✅ case-summary.md 增量更新（不重写已有内容）
- ✅ 只 upsert meta.lastInspected，不覆盖 compliance/actualStatus

## Pitfalls (known)

- **changePath 推导**：data-refresh-output.json 不存在时保守视为 CHANGED（触发 LLM summary），避免漏更新
- **AR Case**：AR summary 规则（scope 限定、AR 信息 section）已内联在 Step 3.2 中，不依赖外部文件

## 错误处理

| 场景 | 行为 |
|------|------|
| `data-refresh-output.json` 不存在 | changePath 默认 CHANGED（保守） |
| `case-info.md` 不存在 | exit 2，提示先跑 `/casework:data-refresh` |
| `generate-todo.sh` 失败 | 记日志，不阻塞 meta 更新 |
| LLM summary 生成失败 | pipeline-state 标 failed |

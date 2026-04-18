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

- `{caseDir}/.casework/data-refresh-output.json` — 可选（用于读取 `deltaStatus`；不存在时视为 `DELTA_OK`）
- `{caseDir}/case-info.md` — D365 snapshot
- `{caseDir}/emails.md` — 邮件
- `{caseDir}/casework-meta.json` — 累计元数据

## 输出契约

- `{caseDir}/case-summary.md` — 增量更新（首次生成或追加）
- `{caseDir}/todo/YYMMDD-HHMM.md` — 规则化 todo
- `{caseDir}/casework-meta.json` — upsert `lastInspected`
- `{caseDir}/.casework/pipeline-state.json` — 标记 summarize completed

## 执行步骤

### Step 1. 读取 deltaStatus

直接从 data-refresh-output.json 读取 `deltaStatus`（砍掉了旧的 `changePath` / `derive-change-path.sh` 间接层）：

```bash
DELTA=$(python3 -c "
import json
try: print(json.load(open(r'{caseDir}/.casework/data-refresh-output.json'))['deltaStatus'])
except: print('DELTA_OK')
")
# DELTA_OK | DELTA_EMPTY
```

### Step 2. Pipeline state — 标记 summarize running

```bash
python3 .claude/skills/casework/act/scripts/update-pipeline-state.py \
  --case-dir "{caseDir}" --step "summarize" --status "running" \
  --case-number "{caseNumber}"
```

### Step 3. 执行 summary 更新

#### 3.1 deltaStatus 决策树

- `DELTA_EMPTY + case-summary.md 已存在` → 跳过 summary，直接到 Step 3.5 todo
- `DELTA_EMPTY + case-summary.md 不存在` → 首次生成（Step 3.2）
- `DELTA_OK + case-summary.md 不存在` → 首次生成（Step 3.2）
- `DELTA_OK + case-summary.md 已存在` → 增量追加（Step 3.3）

#### 3.2 首次生成 case-summary.md

读取：`case-info.md`、`emails.md`、`notes.md`、`teams/teams-digest.md`（如有；不存在则回退读 `teams/*.md`）、`.casework/claims.json`（如有）、`onenote/onenote-digest.md`（如有，仅引用 `[fact]` 条目，`[analysis]` 加 `[unverified]` 前缀）。
AR Case 额外读取 `notes-ar.md`。

额外读取 `casework-meta.json` 以获取 compliance、sapCheck、ccAccount 等字段。

用 Write 工具生成完整 summary，格式：

```markdown
# Case Summary — {caseNumber}

## Entitlement 状态
- 综合状态: ✅ 合规 / ⚠️ 不合规
- Service Level: {compliance.serviceLevel 或从 case-info Entitlement 表读取}
- Service Name: {compliance.serviceName 或从 case-info 读取}
- Schedule: {compliance.schedule 或从 case-info 读取}
- Contract Country: {compliance.contractCountry 或从 case-info 读取}
{如 entitlementOk=false，额外输出:}
- ⚠️ 原因: {compliance.warnings 中的具体原因}
- 建议: 联系 TA 确认，无 21V Exhibit 则引导客户从 portal.azure.cn 提工单

## 问题描述
{一句话描述客户问题}

## SAP 与标签
- 当前 SAP: {compliance.sapPath}
- 自识别 SAP: {sapCheck.isAccurate ? compliance.sapPath + " ✅ 一致" : sapCheck.suggestedSap.path + " ⚠️ 不一致，建议修改"}
- RDSE: {ccAccount || "N/A"}
- 21V Convert: {compliance.is21vConvert ? "是，原始 Case " + compliance.21vCaseId : "否"}

## Timeline
- [{YYYY-MM-DD}] {事件描述}

## 关键发现
- {发现1}

## 风险
- {基于 actualStatus + days + IR SLA 状态的风险评估}
```

**规则**：
- 「Entitlement 状态」从 `casework-meta.json → compliance` 读取字段，综合状态：`entitlementOk=true` → `✅ 合规`，`false` → `⚠️ 不合规`。列出构成字段：Service Level, Service Name, Schedule, Contract Country。不合规时附 warnings 和建议
- 「问题描述」从 case-info title + 首封邮件提取，一句话
- 「SAP 与标签」从 `casework-meta.json` 读取 `compliance.sapPath`、`sapCheck`、`ccAccount`、`compliance.is21vConvert` 等字段
- 「Timeline」按时间线梳理关键事件（邮件往来、电话、Note 记录等）。**同一日期的多条事件合并为一条**，用分号分隔。每个日期只保留一行 `- [{YYYY-MM-DD}] {合并后的事件描述}`
- 「关键发现」提取诊断结论（来自 analysis/ 或邮件中的技术内容）
- 「风险」评估 IR SLA 状态、客户响应天数、是否需要升级等。**不关注 FDR/FWR**（这些指标在 Dashboard header 已有 badge 展示）
- **RDSE 客户时**：在「问题描述」末尾注明 `[RDSE: {ccAccount}]`

**AR Case 规则**（`meta.isAR === true`）：
- 「问题描述」格式：`[AR] {ar.scope} — Main Case: {mainCaseId}`
- 「Timeline」从 notes-ar.md + emails.md 提取 AR scope 相关事件（同日期合并规则同上）
- 「关键发现」仅包含 AR scope 内的诊断结论
- 「风险」不包含 SLA 风险评估
- 额外 section **「AR 信息」**（放在「问题描述」和「Timeline」之间）：
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
1. 在「Timeline」末尾追加新事件。**同日期合并规则**：检查已有最后一条是否和新事件同日期 → 是则合并到同一行（分号分隔），否则新增行
2. 如有新发现，追加到「关键发现」
3. 如风险状况变化，更新「风险」section（**不关注 FDR/FWR**）
4. 「Entitlement 状态」和「SAP 与标签」section **不在增量模式下更新**（这些由 assess 步骤维护 meta，summary 不重复）

**不要**重写整个文件，只 Edit 追加/修改变化部分。

**claims.json 感知**（如 `{caseDir}/.casework/claims.json` 存在）：

| claim status | 写入 case-summary 的方式 |
|--------------|------------------------|
| `verified` | 正常写入 |
| `challenged` | 加 `[unverified]` 前缀 |
| `rejected` | **不写入** summary |
| `pending` | 正常写入（向后兼容） |

**清理机制**：已有 `[unverified]` 且 claim 变 `verified` → Edit 移除前缀；claim 变 `rejected` → Edit 删除。

**AR Case**：增量逻辑相同，但只关注 AR scope 相关新事件。如 `ar.communicationMode` 或 `ar.scopeConfirmed` 变化，更新「AR 信息」section。

#### 3.4 SAP 准确性检查

在 summary 更新后（已读完 case-info + summary），用 `match-sap` 脚本化检查 SAP 是否与 case 实际内容匹配。

```bash
# 从 case-summary.md 提取问题描述关键词
QUERY=$(python3 -c "
import re
with open(r'{caseDir}/case-summary.md', encoding='utf-8') as f:
    c = f.read()
desc = re.search(r'问题描述[：:]\s*(.*?)(?=\n##|\n###|\Z)', c, re.DOTALL)
print(desc.group(1).strip()[:200] if desc else '')
")

# match-sap 搜索（mooncake-first + pod-check + JSON）
SAP_RESULT=$(python3 -B .claude/skills/sap-match/match-sap.py $QUERY --scope mooncake-first --pod-check --top 1 --json)
```

用 match-sap 的 top-1 结果与 case-info.md 的 `| SAP |` 做产品级比对。
若不一致：`casework-meta.json.sapCheck.suggestedSap` = match-sap 结果的 `path` + `guid`。

判断结果写入 `casework-meta.json.sapCheck`：`{ currentSap, isAccurate, suggestedSap, reason, checkedAt }`

**跳过条件**：`sapCheck.checkedAt` 距今 < 24h 且已有结果 → 跳过。AR Case → 跳过。

#### 3.5 generate-todo.sh

```bash
bash .claude/skills/casework/scripts/generate-todo.sh "{caseDir}"
# 输出: TODO_OK|red=N,yellow=N,green=N
```

#### 3.6 更新 meta

upsert `casework-meta.json.lastInspected` = ISO now

### Step 4. Pipeline state — 标记 summarize completed + 日志

```bash
python3 .claude/skills/casework/act/scripts/update-pipeline-state.py \
  --case-dir "{caseDir}" --step "summarize" --status "completed" \
  --case-number "{caseNumber}"

echo "SUMMARIZE_OK|delta=$DELTA|elapsed=${SECONDS}s"
```

## Safety Redlines

- ❌ 不直接发邮件
- ❌ 不修改 D365（不 add-note、不 record-labor）
- ✅ case-summary.md 增量更新（不重写已有内容）
- ✅ 只 upsert meta.lastInspected，不覆盖 compliance/actualStatus

## Pitfalls (known)

- **deltaStatus 推导**：data-refresh-output.json 不存在时保守视为 `DELTA_OK`（触发 LLM summary），避免漏更新
- **旧 `changePath` 已移除**：v2 不再使用 `derive-change-path.sh`，直接读 `deltaStatus`
- **AR Case**：AR summary 规则（scope 限定、AR 信息 section）已内联在 Step 3.2 中，不依赖外部文件

## 错误处理

| 场景 | 行为 |
|------|------|
| `data-refresh-output.json` 不存在 | deltaStatus 默认 `DELTA_OK`（保守） |
| `case-info.md` 不存在 | exit 2，提示先跑 `/casework:data-refresh` |
| `generate-todo.sh` 失败 | 记日志，不阻塞 meta 更新 |
| LLM summary 生成失败 | pipeline-state 标 failed |

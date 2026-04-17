---
description: "case-summary 增量更新 + 规则化 todo 生成。可独立调用 /inspection-writer {caseNumber}，也被 casework 内联执行。"
name: inspection-writer
displayName: 汇总 & Todo
category: inline
stability: stable
requiredInput: caseNumber
estimatedDuration: 30s
webUiAlias: inspection
promptTemplate: |
  Execute inspection-writer for Case {caseNumber}. This updates case-summary.md (incremental narrative) and generates todo via generate-todo.sh. Read .claude/skills/inspection-writer/SKILL.md for full instructions, then execute.
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
---

# /inspection-writer — Case Summary + Todo

增量更新 case-summary.md + 规则化生成 todo（generate-todo.sh）。

## 参数
- `$ARGUMENTS` — Case 编号
- 上下文变量（casework 传入）：
  - `changePath` — `NO_CHANGE` | `CHANGED`
  - `caseDir` — Case 目录绝对路径

## 配置读取
读取 `config.json` 获取 `casesRoot`，设置 `caseDir = {casesRoot}/active/{caseNumber}/`（绝对路径）。

## 执行步骤

### 1. 判断 case-summary.md 更新策略

读取 `{caseDir}/case-summary.md`（如存在）+ `{caseDir}/casework-meta.json`。

**决策树**：
- **NO_CHANGE + case-summary.md 已存在** → 跳过 summary，直接到 Step 3
- **NO_CHANGE + case-summary.md 不存在** → 走 Step 2a（首次生成）
- **CHANGED + case-summary.md 不存在** → 走 Step 2a（首次生成）
- **CHANGED + case-summary.md 已存在** → 走 Step 2b（增量追加）

### 2a. 首次生成 case-summary.md

读取：`case-info.md`、`emails.md`、`notes.md`、`teams/teams-digest.md`（如有；不存在则回退读 `teams/*.md`）。
- `{caseDir}/claims.json`（如有，按下方 claims.json 感知规则过滤写入「关键发现」）
- `{caseDir}/onenote/personal-notes.md`（如有）——**仅引用 `[fact]` 条目**，`[analysis]` 条目加 `[unverified]` 前缀后写入
- AR Case 额外读取：`notes-ar.md`（如存在）

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
- **Entitlement 不合规时**：在「风险」section 首行插入 `⚠️ **Entitlement Warning** — Service: {serviceName}, Schedule: {schedule}, Country: {contractCountry}。请联系 TA 确认。`
- **RDSE 客户时**：在「问题描述」末尾注明 `[RDSE: {ccAccount}]`

**AR Case 规则**（`meta.isAR === true`）：
- 「问题描述」格式：`[AR] {ar.scope} — Main Case: {mainCaseId}`
- 「排查进展」从 notes-ar.md + emails.md 提取 AR scope 相关事件
- 「关键发现」仅包含 AR scope 内的诊断结论
- 「风险」不包含 SLA 风险评估（不是 AR owner 的 SLA）
- 额外 section **「AR 信息」**（放在「问题描述」和「排查进展」之间）：
  ```markdown
  ## AR 信息
  - Main Case: {mainCaseId}
  - Case Owner: {ar.caseOwnerName} ({ar.caseOwnerEmail})
  - Communication Mode: {ar.communicationMode}
  - Scope: {ar.scope}
  - Scope Confirmed: {ar.scopeConfirmed}
  ```

### 2b. 增量追加 case-summary.md

**claims.json 感知**（如 `{caseDir}/claims.json` 存在）：

在写入「关键发现」section 前，读取 claims.json 中每个 claim 的 status：

| claim status | 写入 case-summary 的方式 |
|--------------|------------------------|
| `verified` | 正常写入 |
| `challenged` | 加 `[unverified]` 前缀，如：`- [unverified] 升级后 PSS 默认变更 — 需客户确认` |
| `rejected` | **不写入** summary |
| `pending` | 正常写入（向后兼容，未触发 Challenger 的场景） |

**清理机制**：如 summary 中已有 `[unverified]` 标注的条目，且对应 claim 已变为 `verified` → Edit 移除 `[unverified]` 前缀。如 claim 变为 `rejected` → Edit 删除该条目。

> 如 claims.json 不存在，全部按原有逻辑处理（向后兼容）。

仅读取**新增内容**（自上次 inspection 后的新邮件、notes、`teams/teams-digest.md` 的 Key Facts）。

用 **Edit 工具**追加：
1. 在「排查进展」末尾追加 1-2 行新事件
2. 如有新发现，追加到「关键发现」
3. 如风险状况变化，更新「风险」section

**不要**重写整个文件，只 Edit 追加/修改变化部分。

**AR Case**：增量追加逻辑相同，但只关注 AR scope 相关的新事件。如 `ar.communicationMode` 或 `ar.scopeConfirmed` 有变化，更新「AR 信息」section。

### 2.5. SAP 准确性检查

在完成 summary 更新后（已读完 case-info.md + case-summary.md），判断当前 SAP 是否与 case 实际内容匹配。

**输入**：
- `case-info.md` 中的 `| SAP | {path} |`（当前 SAP）
- `case-summary.md` 的「问题描述」+「关键发现」（case 实际内容）
- SAP scope 参考：`{dataRoot}/sap-scope.json` 的 `podServices` 列表

**判断规则**：
1. 提取 SAP 叶子节点（最后一个 `/` 后的部分，如 `Monitor`、`Azure Container Registry`）
2. 对比 case-summary 的「问题描述」：
   - SAP 叶子与问题描述的技术领域是否一致？
   - 例：SAP 是 `Monitor` 但问题是 ACR 镜像推拉 → **不匹配**
   - 例：SAP 是 `Microsoft Entra Sign-ln and Multi-Factor Authentication` 但问题是删除 Entra 用户 → **匹配**（同属 Entra 领域）
3. 判断结果写入 `casework-meta.json`：

```json
{
  "sapCheck": {
    "currentSap": "Azure/Mooncake .../Monitor",
    "isAccurate": true,
    "suggestedSap": null,
    "reason": null,
    "checkedAt": "ISO8601"
  }
}
```

如果不匹配：
```json
{
  "sapCheck": {
    "currentSap": "Azure/21Vianet Mooncake/21Vianet China Azure Database for PostgreSQL",
    "isAccurate": false,
    "suggestedSap": "Azure/Mooncake Support Escalation/Mooncake - VM PoD/Monitor",
    "reason": "Case 实际问题是 Monitor alert rule 不触发，与 PostgreSQL 不符",
    "checkedAt": "ISO8601"
  }
}
```

**suggestedSap 格式**：
- 如果是 Mooncake Support Escalation 下的产品：`Azure/Mooncake Support Escalation/Mooncake - VM PoD/{产品名}`
- 如果是 21Vianet Mooncake 下的产品：`Azure/21Vianet Mooncake/21Vianet China Azure {产品名}`
- 不确定完整路径时只写产品名，如 `suggestedSap: "Monitor (具体路径需确认)"`

**跳过条件**：
- `sapCheck.checkedAt` 距今 < 24 小时 且 `isAccurate` 值已存在 → 跳过重复检查
- AR Case → 跳过（SAP 由 main case owner 管理）

**不增加额外 tool call**：LLM 在 Step 2 已读完 case-info + summary，此处只需用一次 Edit/Bash 更新 meta。

### 3. 规则化生成 todo

调用 bash 脚本：

```bash
bash .claude/skills/casework/scripts/generate-todo.sh "{caseDir}"
```

输出 `TODO_OK|red=N,yellow=N,green=N`。

### 4. 更新 Meta

用 Edit 工具更新 `casework-meta.json` 的 `lastInspected` 字段为当前时间。

### 5. 日志

```bash
echo "[$(date '+%Y-%m-%d %H:%M:%S')] inspection-writer OK | case-summary={created|updated|skipped} todo={red}r/{yellow}y/{green}g" >> "{caseDir}/logs/inspection-writer.log"
```

## 与 casework 集成

casework Step 4 调用本 skill 时：
- **快速路径**（NO_CHANGE + summary 已存在）：只执行 Step 3 + Step 4，跳过 LLM（~2s）
- **快速路径**（NO_CHANGE + summary 不存在）：执行 Step 2a + Step 3 + Step 4（~15s）
- **正常流程**（CHANGED）：执行 Step 2a/2b + Step 3 + Step 4（~10-15s）

## 废弃说明

`inspection-YYYYMMDD.md` 已废弃（legacy），现有文件保留不删。新 casework 不再生成 inspection 文件，改为 `case-summary.md` + `todo/*.md`。

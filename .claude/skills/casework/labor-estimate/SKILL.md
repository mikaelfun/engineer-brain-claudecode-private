---
description: "根据 Case 当天进展估算 Labor 时间，支持单 Case 和批量模式。AI 推算 + 用户修改 + 自动学习偏好。"
name: labor-estimate
displayName: Labor 估算
category: inline
stability: beta
requiredInput: caseNumber or "all"
estimatedDuration: 30s per case
promptTemplate: |
  Execute /labor-estimate for Case {caseNumber}. Read .claude/skills/labor-estimate/SKILL.md for full instructions, then execute. Do NOT ask the user any questions — generate the estimate automatically and save to the labor directory. If there is NO actual activity for today, do NOT create the estimate file — skip silently. Never generate 0-minute estimates.
allowed-tools:
  - Bash
  - Read
  - Write
  - AskUserQuestion
---

# /labor-estimate — Labor 时间估算

根据 Case 当天活动（排查、邮件、分析、笔记等）智能估算 Labor 时间。

## 参数
- `$ARGUMENTS` — Case 编号（单 case）或 `all`（批量）
- 可选 `--date YYYY-MM-DD` 指定日期（默认今天）

## 配置读取
读取 `config.json` 获取 `casesRoot`。
设置 `caseDir = {casesRoot}/active/{caseNumber}/`。

## D365 Classification 可选值
- Troubleshooting（常用）
- Research（常用）
- Communications（常用）
- Tech Review
- Scoping
- Recovery & Billing
- Admin Review

## 执行步骤

### 1. 确定目标日期
- 如有 `--date` 参数，使用指定日期
- 否则使用当天日期（`date '+%Y-%m-%d'`）

### 2. 读取校准数据
```bash
cat .claude/skills/labor-estimate/calibration.json
```
记住各 effort 类型的 multiplier。

### 3. 读取 Case 文件（单 case 模式）
读取以下文件，**只关注目标日期的活动**：

- `{caseDir}/labor.md` — **已有 D365 labor 记录**（由 data-refresh 生成）。解析表格，检查目标日期是否已有记录。如果当天已记录，记下已记录的总时长和分类。
- `{caseDir}/case-summary.md` — 排查进展、关键发现
- `{caseDir}/emails.md`（**只读最后 100 行**）— 当天邮件数量和复杂度
- `{caseDir}/notes.md`（**只读最后 50 行**）— 当天 notes
- `{caseDir}/analysis/*.md` — 分析报告（检查文件修改时间是否是当天）
- `{caseDir}/case-info.md` — 产品、Severity、SLA
- `{caseDir}/teams/*.md`（**只读最后 50 行**）— 当天内部沟通

如果是 `all` 模式，先列出所有活跃 case：
```bash
ls -d {casesRoot}/active/*/
```
然后逐个执行步骤 3-6。

### 4. AI 估算
根据读取的文件内容，对每种 effort 类型估算时间：

| Effort 类型 | 基准范围 | 说明 |
|-------------|---------|------|
| troubleshooting | 15-60 min | Kusto 查询、日志分析、远程排查 |
| email | 5-15 min/封 | 邮件撰写/回复 |
| research | 10-30 min | 文档查阅、KB 搜索 |
| notes | 5-10 min | Case notes 更新 |
| remote_session | 30-90 min | 远程会话 |
| internal_consult | 10-30 min | 内部讨论 |
| analysis | 15-45 min | 生成分析报告 |

**校准**：每种类型的基准值 × `calibration.json` 中对应的 `multiplier`。

**Classification 选择**：根据占比最大的 effort 类型选择对应 D365 classification。

**Description 写法规则（必须严格遵守）：**
- 用英文，1 句话，最多 15 个词
- 以工程师视角描述**做了什么技术工作**，而不是产出了什么文件
- 聚焦：排查了什么问题、研究了什么方向、回复了客户什么问题
- ✅ 好的例子：
  - `Investigated VM boot failure via boot diagnostics`
  - `Researched NSG rule conflict causing connectivity issue`
  - `Replied to customer with RCA and next steps`
  - `Analyzed storage throttling with Kusto logs`
  - `Followed up on PG response regarding quota limit`
- ❌ 禁止的写法：
  - `Produced 3 analysis reports`（流水账，客户不关心你产出几个文件）
  - `Updated case notes and sent email`（太泛，没有技术内容）
  - `Worked on case today`（废话）
  - `No action needed today`（不应生成估算）
  - 任何包含 "produced"、"generated"、"created X reports" 的表述

**⚠️ 零活动跳过规则（必须严格执行）：**
- 如果当天没有任何实际活动（无排查、无邮件、无分析、无沟通） → **必须跳过此 case，不生成 labor-estimate.json 文件**
- 禁止生成 `totalMinutes: 0` 的估算
- 禁止在 description 中写 "no action needed today"、"no activity"、"nothing to report" 等空话
- 只有当确实存在实际工作内容时才生成估算文件

**已有 labor 处理**：如果 `labor.md` 中显示目标日期已有 labor 记录：
- 在估算结果中标注 `⚠️ Already recorded today: {X} min ({classification})`
- 估算仍然正常生成（用户可能需要补充记录）
- 在 Step 6 的 AskUserQuestion 中新增提示：`"⚠️ 当天已记录 {X} min，以下为追加估算"`

### 5. 保存估算结果
```bash
mkdir -p "{caseDir}/labor"
```

写入 `{caseDir}/labor/labor-estimate.json`：
```json
{
  "date": "YYYY-MM-DD",
  "caseNumber": "...",
  "estimated": {
    "totalMinutes": 45,
    "classification": "Troubleshooting",
    "description": "Investigated VM boot failure, analyzed boot diagnostics logs",
    "breakdown": [
      {"type": "troubleshooting", "minutes": 25, "detail": "..."},
      {"type": "email", "minutes": 10, "detail": "..."}
    ]
  },
  "final": null,
  "status": "pending"
}
```

### 6. 展示结果并用 AskUserQuestion 交互

**单 case 模式**：展示估算结果，然后用 AskUserQuestion 提供选项：

选项 1："Submit to D365" — 直接提交
选项 2："Edit duration" — 修改时长（追问具体分钟数）
选项 3："Edit classification" — 修改分类（提供下拉选项）
选项 4："Edit description" — 修改描述（追问新描述）
选项 5："Skip" — 保存到本地但不提交

用户修改后，更新 labor-estimate.json，再次展示确认。

**批量模式**：汇总表格展示所有 case，然后 AskUserQuestion：

选项 1："Submit all to D365"
选项 2："Edit individual cases" — 逐个编辑
选项 3："Submit selected" — 选择提交（追问哪些 case）
选项 4："Skip all"

### 7. 提交到 D365
对每个确认提交的 case，执行：
```bash
pwsh -NoProfile -File .claude/skills/d365-case-ops/scripts/record-labor.ps1 \
  -Minutes {totalMinutes} \
  -Classification "{classification}" \
  -Description "{description}"
```

⚠️ 此脚本需要在 D365 已打开对应 case 的浏览器环境中运行。

成功后更新 `labor-estimate.json` 的 `status` 为 `submitted`，`final` 填入提交值。

### 8. 更新校准数据
如果用户修改了估算值（`final` ≠ `estimated`），更新 `calibration.json`：

对每种 effort 类型，如果用户调整了总时长：
- 计算比例：`ratio = userTotal / aiTotal`
- 更新 multiplier：`new = 0.3 * ratio + 0.7 * old`
- samples += 1

追加到 history：
```json
{
  "date": "...",
  "caseNumber": "...",
  "aiTotal": 45,
  "userTotal": 60
}
```

## 输出
- 每个 case 的 `{caseDir}/labor/labor-estimate.json`
- 更新后的 `.claude/skills/labor-estimate/calibration.json`（如有校准）

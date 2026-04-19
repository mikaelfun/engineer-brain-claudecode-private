---
description: "Reassess — 读取 troubleshooter 结论，分类 fact/analysis 落盘，LLM 决策沟通行动，写 execution-plan phase 2"
name: casework:reassess
displayName: 排查后再评估
category: casework-sub-skill
stability: beta
requiredInput: caseNumber
promptTemplate: |
  Run reassess for Case {caseNumber}. Read .claude/skills/casework/reassess/SKILL.md and follow all steps.
allowed-tools:
  - Bash
  - Read
  - Write
---

# /casework:reassess — Reassess After Troubleshooter

基于 troubleshooter 排查结论，将发现分类为 fact/analysis 落盘到 case 文件，然后 LLM 决策具体沟通行动（email 类型 / ICM 升级 / POD 转移），写入 execution-plan.json phase 2。

## 输入契约

- `{caseDir}/.casework/claims.json` — 必须存在且含 `conclusion` 字段（troubleshooter v2 产物）
- `{caseDir}/analysis/*.md` — 分析报告（troubleshooter 产物）
- `{caseDir}/.casework/execution-plan.json` — plans[0] = assess 结果
- `{caseDir}/casework-meta.json` — 累计元数据
- `{caseDir}/emails.md` — 邮件去重检查

## 输出契约

- `{caseDir}/.casework/execution-plan.json` — append plans[1] (reassess phase)
- `{caseDir}/casework-meta.json` — upsert `investigationFindings`
- `{caseDir}/case-summary.md` — 追加「排查发现」section（fact/analysis 分类）
- `{caseDir}/.casework/reassess-decision.json` — 决策审计轨迹（临时，供 act 读取）

## 执行步骤

### Step 1. 读取 troubleshooter 产出

```bash
CLAIMS="{caseDir}/.casework/claims.json"
if [ ! -f "$CLAIMS" ]; then
  echo "ERROR: claims.json not found — troubleshooter did not complete" >&2
  exit 2
fi

# 验证 conclusion 存在
HAS_CONCLUSION=$(python3 -c "
import json
c = json.load(open(r'$CLAIMS', encoding='utf-8'))
print('1' if c.get('conclusion') else '0')
")
if [ "$HAS_CONCLUSION" = "0" ]; then
  echo "ERROR: claims.json missing conclusion block — troubleshooter version too old" >&2
  exit 2
fi
```

读取 claims.json 获取：
- `conclusion.type` / `conclusion.summary` / `conclusion.confidence`
- `conclusion.suggestedNextAction` / `conclusion.missingInfo`
- `conclusion.scopeAssessment` / `conclusion.outOfScopeTarget`
- `claims[]` 中所有 `type: root-cause` 和 `type: observation` 的 claim

读取最新 `analysis/*.md` 分析报告（按修改时间倒序取第一个）。

### Step 2. Fact/Analysis 分类落盘

从 claims 和分析报告中提取事实和推断，分类持久化。

**分类规则**：
| 来源 | 判据 | 分类 |
|------|------|------|
| claim.type = `observation` + confidence >= medium | 客观观测数据 | `[fact]` |
| claim.type = `root-cause` + confidence = high | 多源交叉验证的结论 | `[fact]` |
| claim.type = `root-cause` + confidence <= medium | 单源或推测结论 | `[analysis]` |
| claim.type = `cause-chain` | 因果推理链 | `[analysis]` |
| claim.type = `recommendation` | 建议方案 | `[analysis]` |
| claim.type = `impact` | 影响判断 | `[analysis]` |

**写入 case-summary.md**：

如果 case-summary.md 已存在「排查发现」section，替换内容；否则在文件末尾追加。

```markdown
## 排查发现（Troubleshooter Findings）
> 最后更新：{ISO timestamp}
> 来源：{analysisRef}

### [fact] 已确认事实
- {observation/root-cause(high) claim 1}（来源：{evidence.source}）
- {observation/root-cause(high) claim 2}（来源：{evidence.source}）

### [analysis] 分析推断
- {root-cause(medium/low) claim}（confidence: {level}）
- {cause-chain claim}（confidence: {level}）
- {recommendation claim}

### 排查结论
- **类型**: {conclusion.type}
- **置信度**: {conclusion.confidence}
- **摘要**: {conclusion.summary}
- **缺失信息**: {conclusion.missingInfo or "无"}
- **范围评估**: {conclusion.scopeAssessment}
```

**写入 casework-meta.json**：

upsert `investigationFindings` 字段：
```json
{
  "investigationFindings": {
    "lastUpdated": "ISO",
    "conclusionType": "found-cause",
    "conclusionConfidence": "high",
    "factCount": 3,
    "analysisCount": 2,
    "scopeAssessment": "in-pod"
  }
}
```

### Step 3. 邮件去重检查

读取 `{caseDir}/emails.md`，检查工程师已发送的邮件类型（复用 assess 的去重规则）：
- 已发过 result-confirm 类邮件 → 不再推荐
- 已发过 request-info 且 < 3 天 → 不再推荐
- `{caseDir}/drafts/` 有未发送草稿且内容仍相关 → 推荐 no-action

### Step 4. LLM 决策

**Prompt**：

```
你是 D365 Case 沟通行动决策助手。基于 troubleshooter 排查结论，决定下一步沟通行动。

## 排查结论
{conclusion JSON}

## 关键发现摘要
### [fact]
{fact claims list}

### [analysis]
{analysis claims list}

## 已发送邮件（去重参考）
{emails summary — 工程师已发的邮件类型和日期}

## 未发送草稿
{drafts/ 目录下的文件列表和简述，如有}

## 决策规则（必须遵守）

1. conclusion.type = found-cause + confidence = high
   → email-drafter(result-confirm)
2. conclusion.type = found-cause + confidence = medium
   → email-drafter(result-confirm)
   → 在 warnings 中标注 "建议用户 /challenge 复核"
3. conclusion.type = found-cause + confidence = low
   → email-drafter(request-info)
   → missingInfo: 需要客户确认的关键假设
4. conclusion.type = need-info
   → email-drafter(request-info)
   → missingInfo 直接传入
5. conclusion.type = exhausted
   → actions=[]
   → noActionReason="exhausted-recommend-icm"
   → warnings: ["排查穷尽，建议开 ICM escalate 到 PG"]
6. conclusion.type = out-of-scope
   → actions=[]
   → noActionReason="out-of-scope-recommend-transfer"
   → warnings: ["非本 POD 范围，建议 AR 到 {outOfScopeTarget}"]
7. conclusion.type = partial
   → email-drafter(request-info)
   → missingInfo: 列出需要的具体信息

## 邮件去重约束
- 已发过同类型邮件 → 不推荐重复发送
- 有未发送相关草稿 → actions=[], noActionReason="unsent draft exists"

## 输出（纯 JSON，无 markdown 包裹）
{
  "actions": [...],
  "noActionReason": "<string or null>",
  "routingSource": "reassess-llm",
  "conclusion": {conclusion object — 透传},
  "warnings": ["..."]
}
```

### Step 5. 写 execution-plan phase 2

将 LLM 决策写入临时文件，调用 `write-execution-plan.py --phase reassess`：

```bash
echo "$LLM_JSON" > "{caseDir}/.casework/reassess-decision.json"
python3 .claude/skills/casework/assess/scripts/write-execution-plan.py \
  --decision "{caseDir}/.casework/reassess-decision.json" \
  --case-dir "{caseDir}" \
  --phase reassess
```

### Step 6. 更新 state + Completion signal

```bash
python3 .claude/skills/casework/scripts/update-state.py \
  --case-dir "{caseDir}" --step reassess --status completed \
  --case-number "{caseNumber}"

echo "REASSESS_OK|conclusion={conclusion_type}|actions={N}|elapsed=${SECONDS}s"
```

## Safety Redlines

- ❌ 不调 D365 写操作
- ❌ 不发邮件
- ❌ 不修改 claims.json（只读消费）
- ✅ 只写 execution-plan、case-summary、casework-meta

## Error Handling

| 场景 | 行为 |
|------|------|
| claims.json 不存在 | exit 2，提示 troubleshooter 未完成 |
| claims.json 无 conclusion | exit 2，提示 troubleshooter 版本过旧 |
| LLM 返回非法 JSON | 写 reassess-decision.json 失败 → exit 2 |
| 邮件去重后 actions 为空 | 正常：noActionReason 说明原因 |

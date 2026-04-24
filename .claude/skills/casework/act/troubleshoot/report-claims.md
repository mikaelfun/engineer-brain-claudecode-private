# 分析报告与证据链（Step 6 + 6a）

> 按需加载：排查执行完成后，写分析报告和 claims.json 时读取。

## 分析报告格式

输出到 `{caseDir}/analysis/YYYYMMDD-HHMM-{topic}.md`：

```markdown
# Analysis Report — {topic}

## 问题概述
{一句话描述}

## 排查框架（来自 Product Skill）
- **产品域**: {product}
- **决策树分支**: {branch}
- **匹配指南**: {guide}
- **Lab 复现**: {applicable|not-applicable}

## 排查过程
### Lab 复现结果（如有）
{复现步骤、错误信息、日志}

### Kusto 查询结果（如有）
{查询和结果}

### 知识库匹配
{相关文档和 Bug}

## 分析结论
{根本原因分析}

## 建议方案
1. {方案 1}
2. {方案 2}

## 后续步骤
- [ ] {步骤}

## 参考链接
- {链接}

## 改进建议
{如在排查中发现系统性改进机会，在此记录。如无则省略。}
```

## 输出文件

- `{caseDir}/analysis/YYYYMMDD-HHMM-{topic}.md` — 分析报告
- `{caseDir}/research/research.md` — 搜索引用（增量）
- `{caseDir}/kusto/*.md` — Kusto 查询结果（如有）
- `{caseDir}/analysis/lab-changes.md` — Lab 配置变更记录（如有）
- `{caseDir}/analysis/lab-resources.md` — Lab 创建资源台账（如有）
- `{caseDir}/.casework/claims.json` — 结构化证据链声明

## 证据链提取（claims.json）

从分析报告中提取每个关键技术判断，生成 `{caseDir}/.casework/claims.json`。

**Per-run snapshot**:
```bash
RUN_DIR=$(bash .claude/skills/casework/scripts/resolve-run-path.sh "{caseDir}" ".")
cp "{caseDir}/.casework/claims.json" "$RUN_DIR/claims.json" 2>/dev/null || true
```

### 提取规则

- 「分析结论」中的每个根因判断 → `type: root-cause`
- 支撑根因的因果链条 → `type: cause-chain`
- 「建议方案」中的每个建议 → `type: recommendation`
- 对客户环境的重要观察 → `type: observation`
- 影响范围判断 → `type: impact`

### Claim 对象结构

**⚠️ 字段名硬约束**：文本字段**必须**命名为 `"claim"`，违反会导致 Dashboard 崩溃。

```json
{
  "id": "C1",
  "claim": "技术判断的自然语言描述",
  "type": "root-cause",
  "confidence": "high",
  "evidence": [{"source": "...", "excerpt": "...", "sourceType": "..."}],
  "status": "pending"
}
```

### Confidence 标注规则

- `high`：≥2 个独立来源交叉验证（如 Kusto + 官方文档，或 Lab 复现 + 文档）
- `medium`：单一可信来源支持
- `low`：有一定线索但证据不充分
- `none`：纯推测，无任何证据支持

> Lab 复现成功 = 至少 `medium`（第一手证据）。Lab 复现 + 文档/Kusto 交叉 = `high`。
> 诚实标注 low 不是失败，是负责任的行为。

### Evidence 引用规则

- `source`：相对于 caseDir 的路径（如 `kusto/20260402-query.md`、`analysis/lab-changes.md`）
- `excerpt`：引用来源中支持 claim 的具体文本（关键句，不是整段）
- `sourceType` enum：`kusto-result` / `official-doc` / `ado-wiki` / `onenote-team` / `onenote-personal` / `product-skill` / `customer-statement` / `icm-data` / `web-search` / `lab-reproduction`

### Confidence 聚合

- `overallConfidence`：所有 claims 都 high → `"high"` | 任何 none/low → `"low"` | 其余 → `"medium"`
- `triggerChallenge`：存在任何 `low` 或 `none` → `true`

### Conclusion 块

```json
{
  "version": 2,
  "generatedAt": "...",
  "generatedBy": "troubleshooter",
  "analysisRef": "...",
  "overallConfidence": "...",
  "triggerChallenge": false,
  "retryCount": 0,
  "conclusion": {
    "type": "found-cause|need-info|exhausted|out-of-scope|partial",
    "summary": "...",
    "confidence": "high",
    "suggestedNextAction": "email-result|email-request-info|escalate-pg|transfer-pod",
    "missingInfo": [],
    "scopeAssessment": "in-pod|out-of-scope|unclear",
    "outOfScopeTarget": null
  },
  "claims": [...]
}
```

Schema 详见 `playbooks/schemas/claims-schema.md`。

### 结论类型判断

| 情况 | type | suggestedNextAction |
|------|------|---------------------|
| 根因确认，≥2 来源交叉 | `found-cause` (high) | `email-result` |
| 根因确认，单一来源 | `found-cause` (medium) | `email-result` |
| 需客户提供信息 | `need-info` | `email-request-info` |
| 所有路径穷尽 | `exhausted` | `escalate-pg` |
| 不属于本 POD | `out-of-scope` | `transfer-pod` |
| 排查未完成 | `partial` | `email-request-info` |

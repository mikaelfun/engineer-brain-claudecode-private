# case-review — 归档案例复盘

> 通用规则（ID 生成、去重、Evolution Log）见 `../SKILL.md`

```
/product-learn case-review {product}          # 扫描该产品所有归档案例
/product-learn case-review {caseNumber}       # 复盘指定案例
```

## 执行步骤

1. **确定案例列表**
   - 如果指定 caseNumber → 读 `cases/active/{caseNumber}/` 或 `cases/archived/{caseNumber}/`
   - 如果指定 product → 扫描所有归档案例，按 case-info.md 中的产品域过滤

2. **对每个案例读取**:
   - `context/case-summary.md` — 问题概述和关键发现
   - `emails.md` — 最后几封邮件（特别是 closure email 中的解决方案）
   - `analysis/*.md` — 排查报告中的根因和发现
   - `casework-meta.json` — 案例状态

3. **提取学习点**
   从每个案例中提取：
   - **根因**: 从 analysis report 的"分析结论"部分
   - **解决方案**: 从 closure email 或 case-summary 的"后续步骤"
   - **客户困惑点**: 从 emails.md 中客户的反复提问（文档改进信号）
   - **有效的 Kusto 查询**: 从 `kusto/*.md` 中产出结果的查询

4. **去重 + append**
   `source: "email-review"`, `sourceRef: "{caseNumber}"`

5. **特别关注**:
   - 反复出现的问题（跨多个案例的相同 symptom）→ confidence = high
   - 客户困惑点 → tag: `["docs-improvement"]`
   - 有效的临时 Kusto 查询 → 建议保存为 kusto 查询模板

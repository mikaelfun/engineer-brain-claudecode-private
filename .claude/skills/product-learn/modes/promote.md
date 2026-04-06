# promote — 知识提升

> 通用规则（ID 生成、去重、Evolution Log）见 `../SKILL.md`

```
/product-learn promote {product}
```

## 执行步骤

1. **读取 known-issues.jsonl**
   筛选 `promoted: false` 且 `confidence: "high"` 的条目

2. **展示候选列表**
   按 symptom 分组，显示出现次数和来源

3. **用户选择**
   用户确认哪些要提升到 SKILL.md

4. **提升执行**
   - 追加到 SKILL.md 的已知问题表
   - 如果发现新的排查路径 → 建议更新决策树
   - 标记 `promoted: true`

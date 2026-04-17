# Phase 2: onenote-extract

> **通用规则**（全局约束、双轨提取、JSONL 格式、去重规则）见 `phases/global-constraints.md`

**目标**：从 Phase 0 分类索引中取出属于当前产品的 OneNote 页面，深度提取排查知识。

> ⚠️ **前置条件**：`classifyState.status === "exhausted"`（Phase 0 分类必须完成）。
> 如果分类未完成，onenote source 保持 `"pending"` 状态，不会被执行。

1. **读取分类索引**：
   过滤 `.claude/skills/products/page-classification.jsonl`，取所有 `products` 数组包含当前产品的条目。

2. **读取 `.enrich/scanned-onenote.json`**，排除已处理的页面路径。
   - 不存在 → 创建：`{"scanned": []}`

3. **取 top 10 未处理页面**（按 confidence 降序，high 优先）。

4. **对每个页面**：
   - Read 文件内容（>5000 字符截取前 3000）
   - LLM 提取 symptom/rootCause/solution 三元组（一个页面可产出 0-5 个）
   - 去重检查（在 `.enrich/known-issues-onenote.jsonl` 内去重）
   - 新条目 append 到 `.enrich/known-issues-onenote.jsonl`：
     ```
     source: "onenote"
     sourceRef: 相对于 ONENOTE_DIR 的路径（如 "MCVKB/VM+SCIM/.../page.md"）
     sourceUrl: null
     id: "{product}-onenote-{seq:03d}"
     ```

5. **更新 `.enrich/scanned-onenote.json → scanned`**：将本次处理的路径 append

6. **Append** `.enrich/evolution-log.md`

7. **判断 exhausted**：
   - 分类索引中该产品的所有页面均已在 `.enrich/scanned-onenote.json → scanned` 中 → `exhausted: true`
   - 否则 → `exhausted: false`（下轮继续）

---

## 自我链式续跑

**完成提取后，如果 `exhausted === false`，立即 spawn 一个续跑 agent**：

```
Agent(
  description: "enrich {product} from onenote (chain)",
  run_in_background: true,
  prompt: |
    产品: {product} | 数据源: onenote | 项目根: {PROJECT_ROOT}
    读取 .claude/skills/product-learn/phases/phase2-onenote.md 执行。
    ⚠️ 写 .claude/skills/products/{product}/.enrich/known-issues-onenote.jsonl, .enrich/scanned-onenote.json, ID: {product}-onenote-{seq:03d}
    page-classification.jsonl 过滤 "{product}", OneNote: {ONENOTE_DIR}
    返回: discovered, deduplicated, exhausted, 摘要(<500bytes)
)
```

**终止条件**：`exhausted === true` → 不 spawn，直接返回结果。
**防爆规则**：每个 agent 只 spawn **1 个**续跑 agent（不分裂）。


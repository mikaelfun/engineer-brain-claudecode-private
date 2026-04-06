# Phase 5: contentidea-kb-scan

> **通用规则**（全局约束、双轨提取、JSONL 格式、去重规则）见 `phases/global-constraints.md`

**目标**：从 ContentIdea ADO 内部 KB 穷举已发布的结构化排查文章。

> ⚠️ **与其他 Phase 的关键区别**：此 Phase **不需要 LLM 提取**。ContentIdea work items 已包含结构化字段
> （`HelpArticleSummarySymptom`/`HelpArticleCause`/`HelpArticleResolution`），直接 strip HTML 即可写入 JSONL。
> 质量审核留给 SYNTHESIZE 阶段用 LLM 做。

1. **读取 config.json** → 取 `podProducts[product].contentIdeaKeywords`
   - 为空数组 → 返回 `exhausted: true`（该产品无 ContentIdea 关键词）

2. **WIQL 查询已发布 KB** — 对每个关键词执行：
   ```bash
   AZURE_CONFIG_DIR="$HOME/.azure-profiles/microsoft-fangkun" az boards query \
     --wiql "SELECT [System.Id], [System.Title], [System.WorkItemType], [System.State] FROM workitems WHERE [System.TeamProject] = 'ContentIdea' AND [ECO.CI.KBArticleNumbers] <> '' AND [ECO.CI.CI.AppliesToProducts] CONTAINS '{keyword}'" \
     --org https://dev.azure.com/ContentIdea --project ContentIdea -o json
   ```
   合并所有关键词结果，按 `System.Id` 去重。

3. **读取 `.enrich/scanned-contentidea-kb.json → scanned`**，过滤已扫描的 work item ID
   - 不存在 → 创建：`{"scanned": []}`

4. **取 top 10 未扫描 ID**，对每个执行：
   ```bash
   AZURE_CONFIG_DIR="$HOME/.azure-profiles/microsoft-fangkun" az boards work-item show \
     --id {workItemId} --org https://dev.azure.com/ContentIdea -o json
   ```

5. **直接提取三元组**（无需 LLM）：
   ```python
   import re
   def strip_html(s): return re.sub(r'<[^>]+>', '', s or '').strip()

   symptom    = strip_html(fields['ECO.CI.CI.HelpArticleSummarySymptom'])
   rootCause  = strip_html(fields['ECO.CI.CI.HelpArticleCause'])
   solution   = strip_html(fields['ECO.CI.CI.HelpArticleResolution'])
   kb_number  = fields.get('ECO.CI.KBArticleNumbers', '')
   ```

   - symptom/rootCause/solution **全为空** → 跳过（老数据无结构化字段），仍标记已扫描
   - 至少有 symptom → 构建 JSONL 条目

6. **构建 JSONL 条目**：
   ```json
   {
     "id": "{product}-{seq:03d}",
     "date": "YYYY-MM-DD",
     "symptom": "{stripped symptom}",
     "rootCause": "{stripped rootCause}",
     "solution": "{stripped solution}",
     "source": "contentidea-kb",
     "sourceRef": "ContentIdea#{workItemId}",
     "sourceUrl": "https://support.microsoft.com/kb/{kb_number}",
     "product": "{product}",
     "confidence": "medium",
     "quality": "raw",
     "tags": ["{articleType}", "contentidea-kb"],
     "21vApplicable": true,
     "promoted": false
   }
   ```
   - `kb_number` 含 `/` 时（如 `3072688/ja`）→ 取 `/` 前部分构造 URL
   - `ECO.CI.O.ContentLink` 保留为备用内部链接（不写入 JSONL，仅在指南的来源注释中使用）

7. **去重 → append** `.enrich/known-issues-contentidea-kb.jsonl`（同标准去重规则）

8. **更新 `.enrich/scanned-contentidea-kb.json → scanned`**：append 本次处理的 work item ID 字符串列表

9. **Append** `.enrich/evolution-log.md`

10. **判断 exhausted**：
    - 已无未扫描 ID → `exhausted: true`
    - 否则 → `exhausted: false`

---

## 自我链式续跑

**完成提取后，如果 `exhausted === false`，立即 spawn 一个续跑 agent**：

```
Agent(
  description: "enrich {product} from contentidea-kb (chain)",
  run_in_background: true,
  prompt: |
    产品: {product} | 数据源: contentidea-kb | 项目根: {PROJECT_ROOT}
    读取 .claude/skills/product-learn/phases/phase5-contentidea.md 执行。
    ⚠️ 写 skills/products/{product}/.enrich/known-issues-contentidea-kb.jsonl, .enrich/scanned-contentidea-kb.json, ID: {product}-contentidea-kb-{seq:03d}
    config: contentIdeaKeywords={keywords}, AZURE_CONFIG_DIR="$HOME/.azure-profiles/microsoft-fangkun"
    返回: discovered, deduplicated, exhausted, 摘要(<500bytes)
)
```

**终止条件**：`exhausted === true` → 不 spawn，直接返回结果。
**防爆规则**：每个 agent 只 spawn **1 个**续跑 agent（不分裂）。


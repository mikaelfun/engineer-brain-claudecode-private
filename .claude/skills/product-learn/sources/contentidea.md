# ContentIdea KB Source Adapter

Per-product adapter. Rules reference: `../shared-rules.md`. Key difference: NO LLM extraction needed.

> ⚠️ **与其他 source adapter 的关键区别**：此 adapter **不需要 LLM 提取**。ContentIdea work items 已包含结构化字段
> （`HelpArticleSummarySymptom`/`HelpArticleCause`/`HelpArticleResolution`），直接 strip HTML 即可写入 JSONL。
> 质量审核留给 SYNTHESIZE 阶段用 LLM 做。

---

## Step 1: 读取关键词配置

**读取 playbooks/product-registry.json** → 取 `podProducts[product].contentIdeaKeywords`
- 为空数组 → 返回 `idle: true`（该产品无 ContentIdea 关键词）

---

## Step 2: WIQL 查询已发布 KB

> ⚠️ **必须使用 `az rest` POST，禁止 `az boards query`**。
> `az boards query` 默认返回上限 1000 条且无法调大，会导致高 ID 条目永久丢失。
> 例如 intune 实际有 4679 条 KB，`az boards query` 只返回前 1000 条。

```bash
# Step 2a: 构建 WIQL body（多关键词用 OR 拼接）
# Python 生成 body 文件，避免 bash 引号转义问题
python3 -c "
import json
keywords = {keywords_list}  # e.g. ['Intune'] or ['Virtual Network', 'Load Balancer']
clauses = ' OR '.join(f'[ECO.CI.CI.AppliesToProducts] CONTAINS \"{k}\"' for k in keywords)
q = f'SELECT [System.Id] FROM workitems WHERE [System.TeamProject]=\"ContentIdea\" AND [ECO.CI.KBArticleNumbers] <> \"\" AND ({clauses})'
open('.enrich/_wiql_body.json','w').write(json.dumps({'query': q}))
"

# Step 2b: 执行 WIQL（$top=20000 覆盖 ADO 服务端上限）
AZ_PROFILE=$(python3 -c "import json; print(json.load(open('config.json'))['azProfile']['global'])")
AZURE_CONFIG_DIR="$HOME/.azure-profiles/$AZ_PROFILE" az rest --method post \
  --url "https://dev.azure.com/ContentIdea/ContentIdea/_apis/wit/wiql?api-version=7.1&\$top=20000" \
  --resource "499b84ac-1321-427f-aa17-267ca6975798" \
  --body @.claude/skills/products/{product}/.enrich/_wiql_body.json
```

从返回的 `workItems[].id` 提取全量 ID 列表，按 `System.Id` 去重。

> 📌 若某产品 KB 总量超过 20000 条（当前所有产品合计 <10000），需改用分页查询。

---

## Step 3: 差集计算（含增量刷新）

读取 `.enrich/scanned-contentidea-kb.json`：
- 不存在 → 创建：`{"scanned": [], "lastRefreshed": null}`

**增量刷新机制**：Step 2 的 WIQL **每次运行都会重查**（不像其他 adapter 使用持久化 index），
因此 ContentIdea 新增的 KB 文章会**自动出现在差集中**。即使上次 `idle: true`，
重新运行仍能发现新条目。

差集 = Step 2 全量 ID 集合 - scanned 集合 = 未扫描 ID。

更新 `lastRefreshed` 为当前时间戳（ISO 格式）。

---

## Step 4: 逐批获取 Work Item

**取 top 10 未扫描 ID**，对每个执行：
```bash
AZ_PROFILE=$(python3 -c "import json; print(json.load(open('config.json'))['azProfile']['global'])")
export AZURE_CONFIG_DIR="$HOME/.azure-profiles/$AZ_PROFILE"
AZURE_CONFIG_DIR="$AZURE_CONFIG_DIR" az boards work-item show \
  --id {workItemId} --org https://dev.azure.com/ContentIdea -o json
```

---

## Step 5: 直接提取三元组（无需 LLM）

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

---

## Step 6: 构建 JSONL 条目

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

---

## Step 7-9: 写入与去重

7. **去重 → append** `.enrich/known-issues-contentidea-kb.jsonl`（同 `../shared-rules.md` 标准去重规则）

8. **更新 `.enrich/scanned-contentidea-kb.json → scanned`**：append 本次处理的 work item ID 字符串列表

9. **Append** `.enrich/evolution-log.md`

---

## Change Detection

7 天刷新周期：即使 adapter 已标记 `idle`，orchestrator 应每 **7 天** 重新触发一轮
（根据 `lastRefreshed` 判断），重新执行 WIQL 查询并与 `scanned` ID 集合做 diff，
捕获 ContentIdea 新增 KB。

---

## Idle Condition

当以下条件满足时，adapter 报告 `idle: true`（无待处理工作）：

- Step 2 WIQL 返回的全量 ID 集合与 `scanned` 集合的差集为空（所有已知 work items 都已扫描）

> 📌 即使 `idle: true`，orchestrator 仍应按 7 天周期重新触发，因为 ContentIdea
> 会持续新增 KB 文章。

---

## Lifecycle

Orchestrator manages continuation. This adapter does NOT self-chain.
Returns: `{discovered, deduplicated, idle: true/false, summary}`

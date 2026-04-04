# Auto-Enrich Mode v2 — 产品知识自动富化

每次执行处理 **1 个产品的 1 个数据源**（EXTRACT tick），全部数据源穷尽后自动触发 SYNTHESIZE。

## 常量

```
PROJECT_ROOT = /c/Users/fangkun/Documents/Projects/EngineerBrain/src
ONENOTE_DIR  = /c/Users/fangkun/Documents/Projects/EngineerBrain/data/OneNote Export
STATE_FILE   = skills/products/enrich-state.json
MCVKB        = ${ONENOTE_DIR}/MCVKB
POD_NB       = ${ONENOTE_DIR}/Mooncake POD Support Notebook
SERVICES_DIR = ${POD_NB}/POD/VMSCIM/4. Services
```

## 产品 → OneNote 目录映射

**不要硬编码**——运行时从 `config.json → podProducts` 读取。每个产品条目包含：

| 字段 | 说明 |
|------|------|
| `id` | 产品 ID（如 `vm`, `aks`） |
| `onenoteSection` | POD Notebook 中的 section 路径（glob pattern） |
| `mcvkbSection` | MCVKB 中的 section 路径（glob pattern） |
| `podServicesDir` | POD Services 目录名（Feature Gap 文件在此） |
| `extraSections` | 可选，额外 OneNote section 列表 |

用法：`config.podProducts.find(p => p.id === currentProduct)` 取映射。

---

## 子命令路由

| 用户输入 | 动作 |
|---------|------|
| `auto-enrich` 或 `auto-enrich run` | 执行一轮 EXTRACT tick |
| `auto-enrich status` | 显示进度 |
| `auto-enrich reset` | 重置状态（可选 `--reset-source {source}` 仅重置单个数据源） |
| `auto-enrich skip` | 跳过当前产品 |
| `synthesize {product}` | 手动触发 SYNTHESIZE（从 SKILL.md 路由过来） |

---

## `status` — 显示进度

读取 `enrich-state.json`，展示：

```
📚 Knowledge Enrichment Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Status:    {status}
Current:   {currentProduct} → {currentSource}
Queue:     {productQueue.length} remaining — [{productQueue.join(', ')}]
Completed: {completedProducts.join(', ') || 'none'}

Product States:
  {product}: 21v-gap={state} | onenote={state} | ado-wiki={state} | mslearn={state} | contentidea-kb={state} | synthesized={bool}
  ...

Stats: {totalDiscovered} discovered, {totalDeduplicated} deduped
  21v-gap:  {bySource.21v-gap}
  OneNote:  {bySource.onenote}
  ADO Wiki: {bySource.ado-wiki}
  MS Learn: {bySource.mslearn}
```

## `reset` — 重置状态

**完全重置**（`auto-enrich reset`）：
1. 将 `enrich-state.json` 重写为初始值（从 `config.json → enrichPriority` 填充 `productQueue`）
2. 保留 `stats` 作为历史记录
3. 清空所有产品的 `scanned-sources.json`（允许重新全量扫描）

**单源重置**（`auto-enrich reset --reset-source {source}`）：
1. 仅将指定 source 的 `productStates[*].{source}` 重置为 `"pending"`
2. 清空各产品 `scanned-sources.json` 中对应 source 的数组
3. 不影响其他 source 的状态

## `skip` — 跳过当前产品

1. 将 `currentProduct` 移入 `completedProducts`（标记跳过）
2. 清空 `currentProduct` 和 `currentSource`
3. 下一次 `run` 将自动取 `productQueue[0]`

---

## `run` — EXTRACT 流程

### Step 0: 读取状态

```bash
cat skills/products/enrich-state.json
```

- `status === "complete"` → 输出 "✅ All products enriched and synthesized"，退出

**分类前置检查**（在 per-product 流程之前）：
- 检查 `classifyState.status`：
  - 不存在或 `"pending"` → 初始化 `classifyState`，开始 Phase 0 page-classify
  - `"scanning"` → 继续 Phase 0 page-classify（跳过 Step 1，直接执行 Phase 0 tick）
  - `"exhausted"` → 分类完成，进入 per-product 流程（Step 1）
- **Phase 0 运行时**：不执行任何 per-product 操作，每 tick 只做页面分类

- `productQueue` 为空且 `currentProduct` 为空：
  - 检查哪些 `completedProducts` 的 `productStates[x].synthesized === false`
  - 有未 synthesize 的 → 自动触发 SYNTHESIZE（逐个）
  - 全部已 synthesize → 设 `status = "complete"`，输出完成报告

### Step 1: 确定 currentProduct + currentSource

**如果 `currentProduct` 为空**：
1. 取 `productQueue[0]`，设为 `currentProduct`
2. 从 `productQueue` 中移除
3. 初始化 `productStates[product]`：
   ```json
   {"21v-gap":"pending","onenote":"pending","ado-wiki":"pending","mslearn":"pending","contentidea-kb":"pending","synthesized":false}
   ```
4. 设 `currentSource` 为第一个 `"pending"` 的 source

**Source 优先级顺序**：`21v-gap` → `onenote` → `ado-wiki` → `mslearn` → `contentidea-kb`

> 注意：`onenote` source 依赖 Phase 0 page-classify 完成。如果 `classifyState.status !== "exhausted"`，
> 遇到 `onenote` 时跳过（保持 `pending`），优先执行不依赖分类的 source（`21v-gap`、`ado-wiki`、`mslearn`）。
> 实际推荐运行顺序：先跑完 Phase 0 全量分类，再开始 per-product 流程。

**Source 推进逻辑**：
- 当前 source 已 `"exhausted"` → 找下一个 `"pending"` source
- 如果所有 4 个 source 都 `"exhausted"` → 产品 EXTRACT 完成：
  1. 将 `currentProduct` 移入 `completedProducts`
  2. 清空 `currentProduct` 和 `currentSource`
  3. 自动触发 SYNTHESIZE（见 Part 6）
  4. 退出本 tick

### Step 2: Spawn Knowledge Enricher Agent

```
Agent(
  subagent_type: "knowledge-enricher",
  description: "enrich {currentProduct} source {currentSource}",
  prompt: |
    产品: {currentProduct}
    数据源: {currentSource}
    项目根: {PROJECT_ROOT}
    
    读取 .claude/skills/product-learn/modes/auto-enrich.md 的 "Phase: {currentSource}" 部分执行。
    
    关键文件：
    - known-issues.jsonl: skills/products/{currentProduct}/known-issues.jsonl
    - scanned-sources.json: skills/products/{currentProduct}/scanned-sources.json
    - 21v-gaps.json: skills/products/{currentProduct}/21v-gaps.json (如果存在)
    - config.json: 读取 podProducts 获取 OneNote 目录映射
    
    完成后返回:
    1. discovered: 新发现条目数
    2. deduplicated: 去重跳过条目数
    3. exhausted: true/false (该数据源是否已穷尽)
    4. 简要摘要 (<500 bytes)
)
```

### Step 3: 更新状态

解析 Agent 返回结果：

1. **更新 stats**：
   - `stats.totalDiscovered += discovered`
   - `stats.totalDeduplicated += deduplicated`
   - `stats.bySource[currentSource] += discovered`
   - `stats.byProduct[currentProduct] = (stats.byProduct[currentProduct] || 0) + discovered`

2. **更新 source 状态**：
   - Agent 报告 `exhausted: true` → 设 `productStates[product][source] = "exhausted"`
   - 否则保持 `"scanning"`（下轮继续扫描该 source）

3. **检查产品是否完成**：
   - 所有 4 个 source 都 `"exhausted"` → 自动触发 SYNTHESIZE

4. **写回 `enrich-state.json`**（用 Write 工具直接写）

### Step 4: 输出摘要

```
📚 Enrichment Tick Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━
Product: {product} | Source: {source}
Discovered: {N} new | Deduped: {M}
Source status: {exhausted ? "✅ exhausted" : "🔄 more pages remaining"}
Next: {nextProduct} → {nextSource}
Queue: {remaining} products remaining
```

---

## Phase 执行指令（Agent 内部读取）

### Phase 0: page-classify（全局页面分类）

**目标**：遍历所有团队笔记本页面，用 LLM 分类每个页面所属的产品域（支持 0-N 个产品）。

> ⚠️ 此 Phase 是全局操作，不属于任何特定产品。在所有 per-product Phase 之前运行。
> 分类完成后产出 `page-classification.jsonl`，供后续 Phase 2 onenote-extract 使用。

**状态**: `enrich-state.json → classifyState`
```json
{
  "classifyState": {
    "status": "pending|scanning|exhausted",
    "totalPages": 0,
    "classifiedPages": 0
  }
}
```

**流程**:

1. **初始化**（首次运行时）：
   - 读取 `config.json → onenote.teamNotebooks` 获取合法笔记本列表
   - 遍历每个团队笔记本目录，列出所有 `.md` 文件：
     ```bash
     for notebook in teamNotebooks:
       find "${ONENOTE_DIR}/{notebook}" -name "*.md" -type f
     ```
   - 将完整文件列表写入 `skills/products/page-list.txt`（一行一个路径，相对于 ONENOTE_DIR）
   - 设 `classifyState.totalPages = len(page-list.txt)`
   - 设 `classifyState.status = "scanning"`
   - 如果 `page-classification.jsonl` 已存在，读取已分类的路径集合，从 `page-list.txt` 中排除

2. **每 tick 处理 10 个页面**：
   - 从 `page-list.txt` 中取下一批 10 个未分类页面（跳过已在 `page-classification.jsonl` 中的）
   - 对每个页面：
     - Read 文件内容（>3000 字符截取前 3000）
     - LLM 分析：这个页面涉及哪些产品域？
   - 产品域列表来自 `config.json → podProducts[*].id`
   - LLM 判断依据：
     - 页面内容涉及的 Azure 服务名（对照 `podProducts[*].services`）
     - 排查的问题域（如 enrollment 相关 → intune，NSG 相关 → networking）
     - 一个页面可以同时属于多个产品（如 Triage 会议记录、跨产品 TSG）
     - 纯流程/人员/会议安排等非技术页面 → `products: []`（不属于任何产品）
   - 每个分类结果 append 到 `skills/products/page-classification.jsonl`：
     ```json
     {"path":"MCVKB/Intune/Deploy Win32 exe.md","notebook":"MCVKB","products":["intune"],"confidence":"high","classifiedAt":"2026-04-04","snippet":"Win32 app EXE deployment config..."}
     {"path":"MCVKB/Mooncake Triage/1.3 FY25 Dec.md","notebook":"MCVKB","products":["intune","vm","aks"],"confidence":"medium","classifiedAt":"2026-04-04","snippet":"Triage notes covering multiple products..."}
     {"path":"MCVKB/General/Team Outing.md","notebook":"MCVKB","products":[],"confidence":"high","classifiedAt":"2026-04-04","snippet":"Non-technical content"}
     ```
   - `snippet`: 页面内容的一句话摘要（<100 字符），便于后续快速浏览

3. **更新状态**：
   - `classifyState.classifiedPages += 本轮处理数`
   - 所有页面处理完 → `classifyState.status = "exhausted"`

4. **输出摘要**：
   ```
   📋 Page Classification Tick
   ━━━━━━━━━━━━━━━━━━━━━━━━━━
   Classified: 10 pages (total: {classifiedPages}/{totalPages})
   Products found: intune×3, vm×2, aks×1, none×4
   Progress: {percentage}%
   ```

**Agent spawn**:
```
Agent(
  description: "classify 10 OneNote pages",
  prompt: |
    Phase: page-classify
    项目根: {PROJECT_ROOT}
    
    读取 .claude/skills/product-learn/modes/auto-enrich.md 的 "Phase 0: page-classify" 部分执行。
    
    关键文件：
    - page-list.txt: skills/products/page-list.txt
    - page-classification.jsonl: skills/products/page-classification.jsonl
    - config.json: 读取 podProducts 获取产品 ID 和 services 列表
    
    完成后返回:
    1. classified: 本轮分类页面数
    2. byProduct: 各产品命中数（如 {"intune":3,"vm":2}）
    3. exhausted: true/false
    4. 简要摘要 (<500 bytes)
)
```

---

### 全局约束（所有 Phase 通用）

- 每个 tick 最多处理 **10 个页面/文件**
- 单个文件超长（>5000 字符）时截取前 **3000 字符** 提取
- 每个 tick 目标完成时间 **< 5 分钟**
- **扫描前**必须先 Read `scanned-sources.json`，**扫描后**必须 append 本次处理的路径/URL
- `known-issues.jsonl` 不存在 → 创建空文件后 append
- `scanned-sources.json` 不存在 → 创建：`{"onenote":[],"ado-wiki":[],"mslearn":[],"contentidea-kb":[]}`

### JSONL 条目格式

```json
{
  "id": "{product}-{seq:03d}",
  "date": "YYYY-MM-DD",
  "symptom": "问题描述",
  "rootCause": "根因分析",
  "solution": "解决方案",
  "source": "onenote|ado-wiki|mslearn",
  "sourceRef": "相对路径或 wiki 路径",
  "sourceUrl": "完整 URL（mslearn/ado-wiki 可用）或 null",
  "product": "{product}",
  "confidence": "high|medium|low",
  "quality": "raw",
  "tags": ["关键词1", "关键词2"],
  "21vApplicable": true,
  "promoted": false
}
```

**ID 生成**：读取现有 `known-issues.jsonl` 中该产品最大序号 +1。

### 去重规则

对每个新提取的条目，与已有 `known-issues.jsonl` 条目对比（按 `symptom` + `rootCause` 关键词）：

| 重叠度 | 动作 |
|--------|------|
| ≥ 80% | 跳过（`stats.totalDeduplicated++`） |
| 50-80% | append，添加 `relatedTo: "{existing-id}"` |
| < 50% | 直接 append |

---

### Phase 1: 21v-gap-scan

**目标**：建立 21V 不支持功能缓存。

1. **检查缓存**：读取 `skills/products/{product}/21v-gaps.json`
   - 存在且 `lastUpdated` 距今 < 30 天 → 跳过，返回 `{discovered:0, deduplicated:0, exhausted:true, summary:"cache valid"}`

2. **读取 config.json**，找到 `podProducts[product].podServicesDir`
   - 为 null → 返回 `exhausted:true`，写空 21v-gaps.json

3. **Glob 搜索 Feature Gap 文件**：
   ```bash
   find "${SERVICES_DIR}/{podServicesDir}" -maxdepth 2 \( -name "*Feature*Gap*" -o -name "*Feature*List*Gap*" \)
   ```

4. **读取文件**（通常 1-2 个），LLM 提取：
   - `unsupportedFeatures`: 明确不支持的功能列表，每条附简短说明
   - `partialFeatures`: 部分支持的功能列表，每条附简短说明

5. **没找到 Feature Gap 文件**时：
   - 用 Grep 在 POD notebook 搜索 `{product}` + `"not support|不支持|gap"`
   - 仍无结果 → 写空 21v-gaps.json（标记 `"noGapDataFound": true`）

6. **Write** `skills/products/{product}/21v-gaps.json`：
   ```json
   {
     "lastUpdated": "YYYY-MM-DD",
     "product": "{product}",
     "unsupportedFeatures": [...],
     "partialFeatures": [...],
     "noGapDataFound": false
   }
   ```

7. **Append** `evolution-log.md`：`[{date}] 21v-gap-scan: {N} unsupported, {M} partial features`

8. 返回 `{discovered: N+M, deduplicated: 0, exhausted: true}`
   > 21v-gap-scan 始终一次完成（scope 小），总是返回 `exhausted: true`。

---

### Phase 2: onenote-extract

**目标**：从 Phase 0 分类索引中取出属于当前产品的 OneNote 页面，深度提取排查知识。

> ⚠️ **前置条件**：`classifyState.status === "exhausted"`（Phase 0 分类必须完成）。
> 如果分类未完成，onenote source 保持 `"pending"` 状态，不会被执行。

1. **读取分类索引**：
   过滤 `skills/products/page-classification.jsonl`，取所有 `products` 数组包含当前产品的条目。

2. **读取 `scanned-sources.json → onenote`**，排除已处理的页面路径。

3. **取 top 10 未处理页面**（按 confidence 降序，high 优先）。

4. **对每个页面**：
   - Read 文件内容（>5000 字符截取前 3000）
   - LLM 提取 symptom/rootCause/solution 三元组（一个页面可产出 0-5 个）
   - 去重检查（见去重规则）
   - 新条目 append 到 `known-issues.jsonl`：
     ```
     source: "onenote"
     sourceRef: 相对于 ONENOTE_DIR 的路径（如 "MCVKB/VM+SCIM/.../page.md"）
     sourceUrl: null
     ```

5. **更新 `scanned-sources.json → onenote`**：将本次处理的路径 append

6. **Append** `evolution-log.md`

7. **判断 exhausted**：
   - 分类索引中该产品的所有页面均已在 `scanned-sources.json → onenote` 中 → `exhausted: true`
   - 否则 → `exhausted: false`（下轮继续）

7. **更新 `scanned-sources.json`**：将本次处理的 10 个路径 append 到 `onenote` 数组

8. **Append** `evolution-log.md`

9. **判断 exhausted**：
   - 已无未扫描页面 → `exhausted: true`
   - 否则 → `exhausted: false`（下轮继续）

---

### Phase 3: ado-wiki-scan

**目标**：从 ADO Wiki 提取 TSG 文档。

1. **搜索 ADO Wiki**：
   ```bash
   pwsh -NoProfile -File scripts/ado-search.ps1 -Type wiki -Query "{product} troubleshooting" -Org msazure -Top 20
   ```

2. **读取 `scanned-sources.json → ado-wiki`**，过滤已扫描的 wiki 路径

3. **取 top 8 未扫描结果**

4. **对每个结果读取内容**：
   ```bash
   az devops wiki page show --wiki "{wikiName}" --path "{pagePath}" --org "https://dev.azure.com/msazure"
   ```
   - 超长（>5000 字符）→ 截取前 3000 字符

5. **LLM 提取三元组**

6. **21V 标记**：读取 `21v-gaps.json`
   - solution 涉及 unsupported feature → 添加 tag `"21v-unsupported"`
   - 设 `21vApplicable: false`

7. **去重 → append** `known-issues.jsonl`：
   ```
   source: "ado-wiki"
   sourceRef: "{wikiName}:{pagePath}"
   sourceUrl: "https://dev.azure.com/msazure/{project}/_wiki/wikis/{wikiName}/{pageId}/{pagePath}"
   ```

8. **更新 `scanned-sources.json → ado-wiki`**

9. **Append** `evolution-log.md`

10. **判断 exhausted**：
    - 已无未扫描结果 → `exhausted: true`
    - 否则 → `exhausted: false`

---

### Phase 4: mslearn-scan

**目标**：从 Microsoft Learn 补充官方文档。

1. **搜索 MS Learn**（两组查询）：
   ```
   mcp__msft-learn__microsoft_docs_search(query: "Azure {product} troubleshoot common issues")
   mcp__msft-learn__microsoft_docs_search(query: "Azure {product} error codes")
   ```

2. **读取 `scanned-sources.json → mslearn`**，过滤已扫描 URL

3. **取 top 8 未扫描结果**

4. **Fetch 全文**：
   ```
   mcp__msft-learn__microsoft_docs_fetch(url: "{resultUrl}")
   ```

5. **LLM 提取三元组**（官方文档通常更结构化，提取质量更高）

6. **21V 标记**：同 ado-wiki-scan 逻辑

7. **去重 → append** `known-issues.jsonl`：
   ```
   source: "mslearn"
   sourceRef: null
   sourceUrl: "{fullUrl}"
   citeable: true
   confidence: "medium"（官方文档不区分 21V 环境差异）
   ```

8. **更新 `scanned-sources.json → mslearn`**

9. **Append** `evolution-log.md`

10. **判断 exhausted**：
    - 已无未扫描 URL → `exhausted: true`
    - 否则 → `exhausted: false`

---

### Phase 5: contentidea-kb-scan

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

3. **读取 `scanned-sources.json → contentidea-kb`**，过滤已扫描的 work item ID

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

7. **去重 → append** `known-issues.jsonl`（同标准去重规则）

8. **更新 `scanned-sources.json → contentidea-kb`**：append 本次处理的 work item ID 字符串列表

9. **Append** `evolution-log.md`

10. **判断 exhausted**：
    - 已无未扫描 ID → `exhausted: true`
    - 否则 → `exhausted: false`

---

## SYNTHESIZE — 综合指南生成

**触发条件**：
- **自动**：某产品全部 4 个 source 均 `"exhausted"` 后自动触发
- **手动**：`/product-learn synthesize {product}`

### 流程

#### 1. 读取数据

读取 `skills/products/{product}/known-issues.jsonl` 全部条目。

#### 2. LLM 主题聚类

按 symptom 语义相似度分组：
- 同类症状（如不同错误信息但同一根因）归为一组
- 每组取一个代表性主题名（英文 slug 用于文件名，中文用于标题）

#### 3. 质量过滤

| 条件 | 动作 |
|------|------|
| 只有 symptom，无 rootCause **且** 无 solution | 丢弃（半成品） |
| 超过 4 年旧 + 无 case 验证 | 丢弃（过时） |
| 单数据源条目 | 保留，标记 confidence: low |
| 多数据源交叉验证 | 保留，提升 confidence: high |

#### 4. 生成排查指南

对每个主题簇 → 生成 `skills/products/{product}/guides/{topic-slug}.md`：

```markdown
# {Product} {Topic} — 综合排查指南

**来源数**: {N} 条 JSONL 条目合并
**置信度**: {high|medium|low} | **21V 适用**: {全部|部分|不适用}
**最后更新**: {date}

## 症状
- {symptom1}
  > 来源: [{sourceRef}]({link})
- {symptom2}
  > 来源: [{sourceRef}]({link})

## 根因分类
1. **{cause1}** — {description}
   > 来源: [{sourceRef}]({link})
2. **{cause2}** — {description}

## 排查步骤
1. {step1}
   ⚠️ **21V 不支持**: {feature} （如适用）
2. {step2}

## 解决方案
- 方案 A: {solution}
  > 来源: [{sourceRef}]({link})
- 方案 B: {solution}
```

**来源注释格式**：
| 来源类型 | 注释格式 |
|---------|---------|
| OneNote | `[MCVKB/.../page.md](relative-path)` |
| ADO Wiki | `[ADO Wiki](https://dev.azure.com/...)` |
| MS Learn | `[MS Learn](https://learn.microsoft.com/...)` |
| ContentIdea KB | `[KB{number}](https://support.microsoft.com/kb/{number})` |
| Case | `[case:NNNN]` |

#### 5. 生成索引

Write `skills/products/{product}/guides/_index.md`：

```markdown
# {Product} 排查指南索引

| 指南 | 关键词 | 来源数 | 置信度 |
|------|--------|--------|--------|
| [{topic}](topic-slug.md) | keyword1, keyword2 | {N} | {high/medium/low} |
| ... | ... | ... | ... |

最后更新: {date}
```

#### 6. 写审计日志

Write `skills/products/{product}/synthesize-log.md`：

```markdown
# Synthesize Log — {product} — {date}

## 保留条目
| ID | 原因 |
|----|------|
| {id} | 多源验证 / 高置信度 / ... |

## 丢弃条目
| ID | 原因 |
|----|------|
| {id} | 半成品（无根因无方案） / 过时 / ... |

## 合并分组
| 指南 | 合并的 IDs |
|------|-----------|
| {topic-slug} | {id1}, {id2}, {id3} |
```

#### 7. 更新状态

- `enrich-state.json → productStates[product].synthesized = true`
- Append `evolution-log.md`：`[{date}] SYNTHESIZE: {N} guides generated, {M} entries kept, {K} discarded`

---

## REFRESH — 增量维护

**触发条件**：OneNote 同步 hook（`onenote-export` 同步团队笔记本后输出 `changedFiles[]`）

### 流程

1. **匹配变更文件**：
   - 对 `changedFiles[]` 中每个路径，检查是否属于某产品的 OneNote 映射目录
   - 同时检查 `scanned-sources.json → onenote` 是否包含该路径

2. **标记重扫**：
   - 匹配到的文件 → 从 `scanned-sources.json → onenote` 中移除（标记为待重扫）

3. **增量 EXTRACT**：
   - 仅对这些特定页面执行 onenote-scan（不走正常队列，直接指定文件列表）
   - 如果提取出的知识与已有 JSONL 条目冲突 → 更新已有条目（保留 ID，更新内容和日期）

4. **增量 SYNTHESIZE**：
   - 仅对受影响的产品重新运行 SYNTHESIZE

### 规则

- **仅团队笔记本**触发 REFRESH（`config.json → onenote.teamNotebooks` 列出的笔记本）
- ADO Wiki / MS Learn：**不自动 REFRESH**，需手动 `auto-enrich reset --reset-source ado-wiki` 触发重扫
- 个人笔记本变更不触发任何操作

---

## 错误处理

| 场景 | 动作 |
|------|------|
| OneNote 目录不存在 | 跳过该 source，日志记录 warning，不阻塞其他 source |
| ADO 搜索失败 | 日志记录 error，设 `productStates[product].ado-wiki = "error"`，不阻塞其他 source |
| msft-learn MCP 不可用 | 跳过 mslearn source，设 `productStates[product].mslearn = "error"` |
| LLM 提取 0 个三元组 | 正常现象，日志记录 "no knowledge extracted"，仍标记页面为已扫描 |
| SYNTHESIZE 聚类失败 | 降级：按 source 分组（而非按主题），仍生成指南 |
| `scanned-sources.json` 损坏 | 从 `known-issues.jsonl` 的 `sourceRef` 字段重建 |
| `known-issues.jsonl` 不存在 | 创建空文件，正常执行 |
| Agent spawn 失败 | 记录 error，不更新状态（下次 run 会重试同一 product+source） |
| config.json 中产品无映射目录 | 该 source 直接标记 `exhausted`（如 `defender` 无 OneNote section） |

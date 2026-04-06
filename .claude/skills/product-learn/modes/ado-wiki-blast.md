# ADO Wiki Blast — 滑动窗口并行扫描模式 (v2)

> 穷举 ADO Wiki，多产品 × 多 batch 并行，完成即续跑，claimed set 防重复。

## 触发方式

```
/product-learn ado-wiki-blast {product}          # 启动滑动窗口扫描
/product-learn ado-wiki-blast {product} status    # 查看进度
/product-learn ado-wiki-blast all                 # 对所有 ado-wiki 未完成的产品执行
/product-learn ado-wiki-blast rebuild-index       # 重建所有产品的 wiki page index
/product-learn ado-wiki-blast rebuild-index {product}  # 重建指定产品的 index
```

## 常量

```
PROJECT_ROOT    = /c/Users/fangkun/Documents/Projects/EngineerBrain/src
MAX_AGENTS      = 15              # maxAgentsPerTick（enrich-state.json 配置）
PAGES_PER_BATCH = 10              # 默认每 batch 处理的页数
BATCH_IDS       = a,b,c,d,e,f,g,h # 最多 8 个 slot per product
```

### 动态 Batch Size（v3 新增）

部分产品 wiki 页面内容特别大，10 页/batch 容易导致 agent context 耗尽。
按产品成功率动态调整 batch size：

| 产品 | 默认 batch size | 原因 |
|------|----------------|------|
| aks, purview, eop | 10 | 页面短小，成功率 100% |
| vm, arm | 8 | 部分大页面（Azure Files TSGs、Stack Hub） |
| entra-id | 6 | 页面内容丰富（B2C/SAML 多子问题） |
| avd | 5 | emoji 路径消耗额外 turns |
| defender | 5 | 零宽空格路径 + 大页面 |

调度器在 `Step 2: 分配页面` 时，读取 `config.json → podProducts[product].blastBatchSize`（如有），
否则使用上表默认值。可通过 config 覆盖。

## 核心机制：滑动窗口 + Claimed Set

### 传统模式（已废弃）
```
Round 1: [A][B][C] ──等全完──→ Round 2: [A][B][C] ──等全完──→ ...
```

### 滑动窗口模式（v2）
```
[A]──完成→合并→claim新页→立即[A']──完成→合并→[A'']...
[B]──────完成→合并→claim新页→立即[B']──────完成→...
[C]────────完成→合并→claim新页→立即[C']────...
```

**核心规则**：每个 agent 完成时立即合并 + 续跑，不等其他 batch。

### Claimed Set 防重复

**文件**: `skills/products/{product}/.enrich/claimed-pages.json`

```json
{
  "pages": [
    "Supportability/AzureAD/AzureAD:/path/to/page1",
    "Supportability/AzureAD/AzureAD:/path/to/page2"
  ],
  "lastUpdated": "2026-04-05T12:00:00Z"
}
```

**生命周期**：
1. **Spawn 前**：将分配给 agent 的页面 append 到 `claimed-pages.json`
2. **Merge 时**：agent 完成 → merge scanned → 从 claimed 中移除已 merge 的页面
3. **计算 unscanned 时**：`unscanned = index - scanned - skipped - claimed`
4. **Session 恢复**：新 session 开始时，如果 claimed 中有页面但无对应 running agent → 清空 claimed（上次 session 中断的残留）

**好处**：完全消除重复分配，不需要用 offset 猜测。

---

## 流程

### Step 0: 前置检查

1. 读取 `skills/products/{product}/.enrich/scanned-ado-wiki.json`
   - 不存在 → 提示先运行 `auto-enrich`（需要 phase3 Step 3a 建索引），退出
2. 读取 `index`、`scanned`、`skipped`
3. **sourceStates 对账**：计算 `unscanned = index - scanned - skipped`
   - 如果 `unscanned` 为空 且 `progress.json → sourceStates.ado-wiki` 不是 `"exhausted"`：
     - 修正 `sourceStates.ado-wiki = "exhausted"` + `adoWikiBlast = "stopped"`
     - 报告 "RECONCILED: {product}/ado-wiki → exhausted"
   - 这修复上次 session 中断导致的标记不一致（对账在 spawn agent 之前执行，单线程无并发）
4. 读取或初始化 `claimed-pages.json`
   - **新 session 检测**：如果 claimed 非空，检查是否有 `scanned-ado-wiki-{bid}.json` temp 文件存在
     - 有 temp 文件 → 先 merge 这些 temp（上次 session 遗留的已完成 agent）
     - 无 temp 文件 → 这些 claimed 页面的 agent 已中断，清空 claimed
5. 重新计算 `unscanned = index - scanned - skipped - claimed`（merge 后可能变化）
6. `unscanned` 为空 → 报告 "✅ ADO Wiki exhausted for {product}"，退出
7. 设置 `progress.json → adoWikiBlast = "running"`

### Step 1: 读取 Agent Registry + 计算可用 slot

**Registry 文件**：`.claude/state/blast-registry.json`

```json
{
  "agents": [
    {"taskId": "abc123", "batchId": "a", "product": "vm", "pageCount": 10, "spawnedAt": "..."}
  ],
  "lastUpdated": "2026-04-06T15:30:00Z"
}
```

```python
# 1. 读取或初始化 registry
registry_path = ".claude/state/blast-registry.json"
registry = read_json(registry_path) or {"agents": []}

# 2. 清理死 agent（spawnedAt > 30 min ago 且无 temp 产出文件）
now = datetime.now()
alive = []
for agent in registry["agents"]:
    age_min = (now - parse(agent["spawnedAt"])).total_seconds() / 60
    temp_exists = exists(f'{agent["product"]}/.enrich/blast-temp/scanned-ado-wiki-{agent["batchId"]}.json')
    if age_min > 30 and not temp_exists:
        log(f'DEAD: {agent["product"]}/{agent["batchId"]} (spawned {age_min:.0f}min ago, no output)')
    else:
        alive.append(agent)
registry["agents"] = alive

# 3. 计算可用 slot
max_agents = enrich_state["maxAgentsPerTick"]  # 默认 20
running = len([a for a in registry["agents"]])
available_slots = max_agents - running

# 4. 当前产品可分配的 slot
product_running = len([a for a in registry["agents"] if a["product"] == product])
product_slots = min(8 - product_running, available_slots)  # 单产品最多 8 slot
```

> **关键规则**：slot 计数的唯一来源是 registry 文件，不是 context 记忆。
> 每次读 registry → 计算 → spawn → 写 registry。不依赖"我记得 spawn 了几个"。

### Step 2: 分配页面 + 注册 + Claim + Spawn

```python
for slot_id in available_batch_ids[:product_slots]:
    # 1. 从 unscanned 取下一批页面
    pages = unscanned[:PAGES_PER_BATCH]
    if not pages: break
    
    # 2. Claim：写入 claimed-pages.json
    claimed["pages"].extend([make_key(p) for p in pages])
    write(claimed_file)
    
    # 3. 注册到 registry（在 spawn 之前！）
    registry["agents"].append({
        "taskId": None,  # spawn 后回填
        "batchId": slot_id,
        "product": product,
        "pageCount": len(pages),
        "spawnedAt": now_iso()
    })
    write(registry_path, registry)
    
    # 4. Spawn agent (run_in_background: true)
    result = Agent(
      description: "ado-wiki blast {product} {slot_id}",
      run_in_background: true,
      prompt: ... # 见 Agent Prompt 模板
    )
    
    # 5. 回填 taskId
    registry["agents"][-1]["taskId"] = result.taskId
    write(registry_path, registry)
    
    # 6. 从 unscanned 中移除
    unscanned = unscanned[PAGES_PER_BATCH:]
```

> **写入顺序**：claim → registry → spawn → 回填 taskId
> 如果 spawn 失败，registry 中有条目但无 taskId → 下次 Step 1 清理时判定为 dead

### Step 3: 输出摘要

```
🚀 ADO Wiki Blast — Sliding Window Mode
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Product      Running  Remaining   Registry
 entra-id     8/8      1,488       8 agents tracked
 monitor      7/7      805         7 agents tracked
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Total: 15/20 slots | Registry: .claude/state/blast-registry.json
```

### Step 4: Agent 完成时（task-notification）

收到 `<task-notification>` 时执行：

```python
# 0. 更新 registry（第一步！在 merge 之前）
registry = read_json(registry_path)
registry["agents"] = [a for a in registry["agents"] if a.get("taskId") != completed_task_id]
write(registry_path, registry)

# 1. Merge temp files (with dedup)
merge_batch(product, batchId)
#    - scanned-ado-wiki-{batchId}.json → merge into scanned-ado-wiki.json
#    - known-issues-ado-wiki-{batchId}.jsonl → **dedup against** .enrich/known-issues-ado-wiki.jsonl (per-source)
#      对比 symptom[:100]+rootCause[:100] 指纹，>80% 重叠则跳过
#    - **append 到 per-source 文件**（不直接写 main known-issues.jsonl）
#    - delete temp files

# 2. Update claimed: remove merged pages
merged_pages = [pages that were in the temp file]
claimed["pages"] = [p for p in claimed["pages"] if p not in merged_pages]

# 3. 续跑：从 registry 计算 available slots（不是从 context 记忆！）
registry = read_json(registry_path)  # 重新读，确保是最新
running = len(registry["agents"])
available = max_agents - running
unscanned = index - scanned - skipped - claimed
if unscanned and available > 0:
    next_pages = unscanned[:PAGES_PER_BATCH]
    # Claim + 注册 + Spawn（同 Step 2 流程）
    claimed["pages"].extend([make_key(p) for p in next_pages])
    write(claimed_file)
    registry["agents"].append({...})
    write(registry_path, registry)
    Agent(...)  # Spawn replacement with same slot_id
    registry["agents"][-1]["taskId"] = result.taskId
    write(registry_path, registry)
else:
    # 该产品 exhausted
    mark_exhausted(product)
```

**关键**：Step 4 中 `unscanned` 计算已排除 `claimed`，所以不会分配到其他 running agent 正在处理的页面。

### Step 5: Cron Tick 处理

`/product-learn ado-wiki-blast all` 被 cron 触发时：

1. 对每个非 exhausted 产品执行一次 merge sweep（合并所有可用 temp 文件）
2. 更新 claimed（移除已 merge 的页面）
3. 检查空闲 slot，spawn 新 agent 填满
4. 不需要等待 —— merge + spawn 后立即返回

---

## Agent Prompt 模板

```
产品: {product} | batchId: {batchId}
项目根: /c/Users/fangkun/Documents/Projects/EngineerBrain/src
读取 .claude/skills/product-learn/phases/phase3-ado-wiki.md 执行 "3b-blast" 分支。

隔离规则：
- JSONL: skills/products/{product}/.enrich/blast-temp/known-issues-ado-wiki-{batchId}.jsonl
- 扫描记录: skills/products/{product}/.enrich/blast-temp/scanned-ado-wiki-{batchId}.json
- ID 格式: {product}-ado-wiki-{batchId}-r{round}-{seq:03d}（round 从已有 JSONL 最大 round+1 开始，无已有则 r1）
- 草稿前缀: skills/products/{product}/guides/drafts/ado-wiki-{batchId}-{title}.md
- ⚠️ Temp 文件写到 `.enrich/blast-temp/` 子目录（不是 `.enrich/` 根目录）
- ❌ 不执行自链续跑
- 去重范围: 仅在 per-batch 文件内去重 + 对比主 known-issues.jsonl 的 symptom 前 100 字符（>80% 重叠则跳过）
- ⚠️ 写入 scanned 时使用完整 key 格式（与 index path 一致）
- ⚡ Write-Early: 第一步写 scanned，第二步写 JSONL，最后写 drafts

pagesToProcess ({N} 个页面):
[{pages JSON}]

返回: discovered, deduplicated, batchId, pagesProcessed, 摘要(<500b)
```

---

## `status` 子命令

读取各产品的 `scanned-ado-wiki.json` + `claimed-pages.json`，展示：

```
🚀 ADO Wiki Blast Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Product      Indexed  Scanned  Claimed  Remaining
 entra-id     4264     200      80       3984
 monitor      2977     300      70       2607
 networking   4151     100      0        4051 (paused)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Session: +XXX entries discovered
```

## `all` 子命令

1. 读取 `enrich-state.json → activeProducts + completedProducts + productQueue`
2. 对每个产品检查 `progress.json → sourceStates.ado-wiki`
3. 不是 `"exhausted"` → 纳入 blast
4. **多产品并行**（不再串行），通过 claimed set 控制总 agent 数不超过 MAX_AGENTS
5. 可指定某些产品暂停（如 `networking`），其 slot 分配给其他产品

---

## 状态文件

| 文件 | 位置 | 用途 |
|------|------|------|
| `scanned-ado-wiki.json` | `.enrich/` | 主扫描记录（index + scanned + skipped） |
| `claimed-pages.json` | `.enrich/` | 已分配但未完成的页面（防重复） |
| `wiki-scope.json` | `.enrich/` | Wiki 路径 scope 规则（pathScope/excludeScope） |
| `progress.json` | `.enrich/` | adoWikiBlast 标记 + sourceStates |
| `scanned-ado-wiki-{bid}.json` | `.enrich/blast-temp/` | batch temp file（agent 写，main merge 后删） |
| `known-issues-ado-wiki-{bid}.jsonl` | `.enrich/blast-temp/` | batch temp JSONL（agent 写，main merge 后删） |

**临时文件管理规则**：
- Agent 产出的 temp 文件统一写到 `.enrich/blast-temp/` 子目录
- 调度器的页面分配文件也写到同一目录：`.enrich/blast-temp/batch-{product}-{bid}.json`
- Merge 完成后立即删除对应 temp 文件
- Session 结束前执行一次 sweep：merge 所有残留 temp 文件
- **禁止在 `skills/products/` 根目录写任何临时文件**

---

## 错误处理

| 场景 | 动作 |
|------|------|
| 索引不存在 | 提示先运行 auto-enrich 建索引 |
| batch agent 失败 | claimed 中的页面会在下次 session 恢复时清空，自动重试 |
| ADO API 限流 | agent 内部 retry，调度器不干预 |
| 中途退出 session | 下次 session Step 0 检测 claimed 残留，清空后重新分配 |
| temp 文件存在但无 agent | merge temp → 移除 claimed → 正常续跑 |

## `rebuild-index` 子命令

重建 wiki page index，用当前实际 wiki 页面树替换过期索引。解决 wiki 重构导致的大量 404 问题。

```
/product-learn ado-wiki-blast rebuild-index          # 重建所有产品（含 exhausted，发现新页面会重新标记为 scanning）
/product-learn ado-wiki-blast rebuild-index {product} # 重建指定产品
```

### 执行步骤

1. **读取产品的 adoWikis 配置**
   从 `config.json → podProducts → [{product}].adoWikis` 获取 wiki 列表：
   ```json
   [{"org": "Supportability", "project": "AzureAD"}]
   ```

2. **递归枚举当前 wiki 页面树**
   对每个 wiki 执行：
   ```bash
   MSYS_NO_PATHCONV=1 az devops wiki page show \
     --org https://dev.azure.com/{org} \
     --project {project} \
     --wiki {wiki_name} \
     --path "/" \
     --recursion-level full \
     --output json
   ```
   
   递归提取所有叶子页面路径（`subPages` 为空的节点），**并拼接完整 key**：
   ```powershell
   $prefix = "{org}/{project}/{wiki_name}:"
   function Get-Leaves($page) {
       if (-not $page.subPages -or $page.subPages.Count -eq 0) {
           if ($page.path -ne "/") { Write-Output "$prefix$($page.path)" }
       }
       foreach ($sub in $page.subPages) { Get-Leaves $sub }
   }
   ```
   
   > ⚠️ **必须**拼接 `{org}/{project}/{wiki_name}:` 前缀。`$page.path` 是 wiki 相对路径（如 `/AdminUI`），
   > 不含前缀会导致 index 与 scanned key 格式不一致，差集计算错误。
   
   **wiki_name 确定**：
   - 如果 adoWikis 配置中有 `wiki` 字段 → 使用该值
   - 否则 → 先调用 `az devops wiki list` 获取项目下的 wiki 列表，取第一个

3. **构建 key + pathScope 过滤**
   每个叶子页面的 key 格式：`{org}/{project}/{wiki_name}:{path}`
   与 `scanned-ado-wiki.json` 中的 scanned 记录格式一致。

   > ⚠️ **Key 格式验证**：每个 index 条目必须包含 `:`。
   > 如果一条 key 不含 `:` 则说明前缀拼接遗漏，必须修正后再写入。
   > 常见错误：直接使用 `$page.path`（wiki 相对路径）而忘记拼接 `{org}/{project}/{wiki_name}:` 前缀。

   **pathScope 过滤**（关键步骤！）：
   从 `skills/products/{product}/.enrich/wiki-scope.json` 读取对应 wiki 的 scope 规则（不再从 config.json 读取）：
   ```python
   # 读取 scope 配置
   scope_file = f'skills/products/{product}/.enrich/wiki-scope.json'
   path_scope, exclude_scope = None, None
   if os.path.exists(scope_file):
       with open(scope_file) as f:
           scopes = json.load(f).get('scopes', [])
       wiki_key = f'{org}/{project}'  # 或含 wiki name
       for s in scopes:
           if s['wikiKey'] in wiki_key or wiki_key in s['wikiKey']:
               path_scope = s.get('pathScope')
               exclude_scope = s.get('excludeScope')
               break
   
   if path_scope:
       # 只保留 path 以 pathScope 中任一前缀开头的叶子页面
       filtered_leaves = [
           key for key in crawled_leaves
           if any(key.split(":")[1].startswith(scope) for scope in path_scope)
       ]
       crawled_leaves = filtered_leaves
   ```
   
   **excludeScope 过滤**（pathScope 之后应用）：
   从同一个 `wiki-scope.json` 中读取（已在 pathScope 步骤中加载）：
   ```python
   if exclude_scope:
       # 排除 path 以 excludeScope 中任一前缀开头的叶子页面
       filtered_leaves = [
           key for key in crawled_leaves
           if not any(key.split(":")[1].startswith(ex) for ex in exclude_scope)
       ]
       crawled_leaves = filtered_leaves
   ```
   > pathScope 用于有效 section 少的情况（白名单），excludeScope 用于噪音 section 少的情况（黑名单）。
   > 两者可以同时使用（先 include 再 exclude）。
   > 例如 VM 配置 `pathScope: ["/SME Topics"]`，则只保留 path 以 `/SME Topics` 开头的页面，
   > 排除 `/Tip of the Day`、`/Processes`、`/Announcements` 等低价值子树。
   > 
   > 如果没有 `pathScope` → 不过滤，保留全量叶子页面（向后兼容）。

4. **合并到 index**（含安全门）
   ```python
   old_index = scanned_ado_wiki["index"]  # 旧索引
   new_pages = crawled_leaves             # 新 crawl 的叶子页面
   
   # ⛔ 安全门 1: 空结果保护
   if len(new_pages) == 0:
       print(f"ABORT: crawl returned 0 leaves for {product}, keeping old index")
       continue  # 跳过该产品，不写入
   
   # ⛔ 安全门 2: 骤降保护（>50% 缩减需人工确认）
   if len(old_index) > 0 and len(new_pages) < len(old_index) * 0.5:
       print(f"WARNING: index shrunk by >50% ({len(old_index)} -> {len(new_pages)})")
       print(f"  This may indicate a crawl failure. Confirm before writing.")
       # 仍然写入，但保留 scanned 不做清洗
   
   # 合并：直接替换为新的完整索引
   merged_index = new_pages
   
   scanned_ado_wiki["index"] = merged_index
   scanned_ado_wiki["indexUpdatedAt"] = now_iso
   
   # scanned 清洗：只移除不在新 index 中的旧记录
   # 注意：不要在 new_pages 为空时清洗 scanned（已被安全门 1 拦截）
   ```

5. **计算增量**
   ```
   新增页面 = new_index - old_index          # 新路径（wiki 重构后的新页面）
   已扫描但路径过期 = scanned - new_index     # 旧路径 404 的，已处理过
   真正的 unscanned = new_index - scanned     # 需要扫描的
   ```

6. **重置 sourceStates**
   如果有大量新增页面（> old_index * 10%）：
   ```python
   progress["sourceStates"]["ado-wiki"] = "scanning"  # 重新标记为 scanning
   ```

7. **输出报告**
   ```
   🔄 Wiki Index Rebuilt — {product}
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Old index:    {old_count} pages
   New index:    {new_count} pages
   New pages:    {added} (wiki 重构后的新路径)
   Stale paths:  {stale} (旧路径已从 wiki 移除)
   Already scanned: {scanned_valid} (仍有效的已扫描页面)
   To scan:      {to_scan} pages
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ```

### 关键设计：旧 scanned 记录不会阻止新路径

- 旧 scanned 记录用的是**旧路径** key（如 `AAD Account Management/Conditional Access/TSG`）
- 新 index 用的是**新路径** key（如 `AAD Authentication/Azure AD Conditional Access Policy/TSG`）
- 由于 key 不同，新路径自然不在 scanned 集合中 → 会被当作 unscanned → 自动分配给 batch
- 旧的 404 路径留在 scanned 中无害（不在新 index 里就不会被分配）

### 多 wiki 处理

某些产品有多个 wiki（如 entra-id 有 AzureAD + WindowsDirectoryServices）。
对每个 wiki 分别 crawl，合并所有叶子页面到同一个 index。

### 超大 wiki 处理

如果 `recursionLevel=full` 返回的 JSON 太大（如 entra-id 4000+ 页面），
分段 crawl：先 `oneLevel` 获取顶级节点，再对每个顶级节点分别 `full` crawl。

---

## 与 auto-enrich 的互斥

- **blast 启动时**：设 `progress.json → adoWikiBlast = "running"`
- **auto-enrich**：检查此标记，跳过 ado-wiki source
- **blast 完成/全 exhausted**：清除标记
- **中途放弃**：手动清除 `adoWikiBlast` 标记即可

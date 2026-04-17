# Auto-Enrich Mode v3 — 双层并行产品知识自动富化

**并行模型**：多产品同时跑 × 产品内多 source 同时扫描。每个 product×source 组合 spawn 独立 agent，通过 per-source 文件隔离消除写冲突。

## 常量

```
PROJECT_ROOT = /c/Users/fangkun/Documents/Projects/EngineerBrain/src
ONENOTE_DIR  = /c/Users/fangkun/Documents/Projects/EngineerBrain/data/OneNote Export
MANIFEST     = .claude/skills/products/enrich-state.json
MCVKB        = ${ONENOTE_DIR}/MCVKB
POD_NB       = ${ONENOTE_DIR}/Mooncake POD Support Notebook
SERVICES_DIR = ${POD_NB}/POD/VMSCIM/4. Services
```

## 产品 → OneNote 目录映射

**不要硬编码**——运行时从 `playbooks/product-registry.json → podProducts` 读取。每个产品条目包含：

| 字段 | 说明 |
|------|------|
| `id` | 产品 ID（如 `vm`, `aks`） |
| `onenoteSection` | POD Notebook 中的 section 路径（glob pattern） |
| `mcvkbSection` | MCVKB 中的 section 路径（glob pattern） |
| `podServicesDir` | POD Services 目录名（Feature Gap 文件在此） |
| `extraSections` | 可选，额外 OneNote section 列表 |

用法：`registry.podProducts.find(p => p.id === currentProduct)` 取映射。

---

## 文件隔离架构

每个 source 写独立文件，MERGE 阶段合并。消除并发写冲突。

```
.claude/skills/products/{product}/
  known-issues.jsonl                ← MERGE 产出（SYNTHESIZE 读这个）
  21v-gaps.json                     ← Phase 1 独占写（不变）
  guides/drafts/*.md                ← Track B 草稿（agent 写，文件名含 source 前缀避冲突）
  .enrich/
    progress.json                   ← 产品级进度（调度器读写，agent 不写）
    known-issues-21v-gap.jsonl      ← Phase 1 agent 独占写
    known-issues-onenote.jsonl      ← Phase 2 agent 独占写
    known-issues-ado-wiki.jsonl     ← Phase 3 agent 独占写
    known-issues-mslearn.jsonl      ← Phase 4 agent 独占写
    known-issues-contentidea-kb.jsonl ← Phase 5 agent 独占写
    scanned-onenote.json            ← Phase 2 agent 独占写（路径数组）
    scanned-ado-wiki.json           ← Phase 3 agent 独占写（含 index + 已扫描）
    scanned-mslearn.json            ← Phase 4 agent 独占写（含 index + 已扫描）
    scanned-contentidea-kb.json     ← Phase 5 agent 独占写
    evolution-log.md                ← 审计日志
    synthesize-log.md               ← 合成审计日志
    topic-plan.json                 ← 主题聚类计划
    synthesize-temp/                ← Map-Reduce 临时文件
```

**Agent 写入规则**：
- JSONL 写入目标：`.enrich/known-issues-{source}.jsonl`（不是 `known-issues.jsonl`）
- 扫描记录：`.enrich/scanned-{source}.json`
- ID 格式：`{product}-{source}-{seq:03d}`（如 `vm-onenote-001`），MERGE 时统一重编为 `{product}-{seq:03d}`
- 去重范围：仅在自己的 per-source 文件内去重（跨 source 去重留给 MERGE）
- 草稿文件名：`guides/drafts/{source}-{sanitized-title}.md`（source 前缀避冲突）

---

## 状态文件

### enrich-state.json（全局 manifest）

```json
{
  "status": "running|complete",
  "activeProducts": ["vm", "aks"],
  "productQueue": ["monitor", "entra-id", ...],
  "completedProducts": ["intune"],
  "maxAgentsPerTick": 20,
  "classifyState": { "status": "exhausted", "totalPages": 4241, "classifiedPages": 4002 }
}
```

不再有 `currentProduct` / `currentSource` 单槽——改用 `activeProducts` 数组。

### progress.json（per-product，新增）

路径：`.claude/skills/products/{product}/.enrich/progress.json`

```json
{
  "product": "vm",
  "status": "extracting|merging|synthesizing|complete",
  "sourceStates": {
    "21v-gap": "pending|scanning|exhausted|error",
    "onenote": "pending|scanning|exhausted|error",
    "ado-wiki": "pending|scanning|exhausted|error",
    "mslearn": "pending|scanning|exhausted|error",
    "contentidea-kb": "pending|scanning|exhausted|error"
  },
  "synthesized": false,
  "synthesizeState": {
    "lastSynthesizedAt": null,
    "lastEntryCount": 0,
    "synthesizedEntryIds": [],
    "topicPlanHash": null
  }
}
```

---

## 子命令路由

| 用户输入 | 动作 |
|---------|------|
| `auto-enrich` 或 `auto-enrich run` | 执行一轮并行 EXTRACT tick |
| `auto-enrich status` | 显示并行进度 |
| `auto-enrich reset` | 重置状态（可选 `--reset-source {source}` 仅重置单个数据源） |
| `auto-enrich skip` | 跳过指定产品（或全部 activeProducts） |
| `synthesize {product}` | 手动触发 MERGE + SYNTHESIZE |

---

## `status` — 显示进度

读取 `enrich-state.json` + 所有 `activeProducts` 的 `.enrich/progress.json`，展示：

```
📚 Knowledge Enrichment Status (Parallel Mode)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Status:    {status}
Active:    {activeProducts.length} products running in parallel
Queue:     {productQueue.length} remaining — [{productQueue.join(', ')}]
Completed: {completedProducts.join(', ') || 'none'}

Active Products:
  🔄 vm:       21v-gap=✅ | onenote=🔄 | ado-wiki=🔄 | mslearn=⏳ | contentidea-kb=⏳ | [12 discovered]
  🔄 aks:      21v-gap=✅ | onenote=⏳ | ado-wiki=🔄 | mslearn=⏳ | contentidea-kb=⏳ | [5 discovered]
  🔄 intune:   21v-gap=✅ | onenote=✅ | ado-wiki=🔄 | mslearn=⏳ | contentidea-kb=⏳ | [30 discovered]

Stats: {totalDiscovered} discovered, {totalDeduplicated} deduped
  21v-gap: {N} | OneNote: {N} | ADO Wiki: {N} | MS Learn: {N} | ContentIdea: {N}
```

图例：✅=exhausted ⏳=pending 🔄=scanning ❌=error

## `reset` — 重置状态

**完全重置**（`auto-enrich reset`）：
1. 将 `enrich-state.json` 重写为初始值（从 `playbooks/product-registry.json → enrichPriority` 填充 `productQueue`，`activeProducts` 清空）
2. 保留 `stats` 作为历史记录
3. 删除所有产品的 `.enrich/progress.json` 和 `.enrich/scanned-*.json`（允许重新全量扫描）
4. 保留 `.enrich/known-issues-*.jsonl`（不删除已提取的知识）

**单源重置**（`auto-enrich reset --reset-source {source}`）：
1. 对所有产品：将 `.enrich/progress.json → sourceStates[source]` 重置为 `"pending"`
2. 删除各产品的 `.enrich/scanned-{source}.json` 和 `.enrich/known-issues-{source}.jsonl`
3. 不影响其他 source

## `skip` — 跳过产品

```
auto-enrich skip              # 跳过所有 activeProducts
auto-enrich skip {product}    # 跳过指定产品
```

1. 将目标产品从 `activeProducts` 移入 `completedProducts`
2. 标记 `.enrich/progress.json → status = "skipped"`
3. 下一次 `run` 将自动从 `productQueue` 补充

---

## `run` — 并行 EXTRACT 流程

### Step -1: Pre-flight 源头变化检测

> 在 Step 0 之前执行。检测各数据源是否有增量变化，自动刷新 index 和 exhausted 状态。
> 确保 exhausted 后新增的 OneNote 页面、ADO Wiki 新页、ContentIdea 新 KB 不会被永久丢失。

#### -1a. OneNote 增量检测

```python
import os, json, glob

# 1. 只扫描团队笔记本（从 config.json → onenote.teamNotebooks 读取）
#    不扫描个人笔记本（如 Kun Fang OneNote）
onenote_dir = config['dataRoot'] + '/OneNote Export'
team_notebooks = config['onenote']['teamNotebooks']  # e.g. ['MCVKB', 'Mooncake POD Support Notebook']
all_md_files = set()
for nb in team_notebooks:
    nb_dir = os.path.join(onenote_dir, nb)
    if not os.path.exists(nb_dir): continue
    for root, dirs, files in os.walk(nb_dir):
        for f in files:
            if f.endswith('.md'):
                rel = os.path.relpath(os.path.join(root, f), onenote_dir)
                all_md_files.add(rel.replace('\\', '/'))

# 2. 读取 page-classification.jsonl 已分类路径
classified = set()
pcf = '.claude/skills/products/page-classification.jsonl'
if os.path.exists(pcf):
    for line in open(pcf, encoding='utf-8'):
        try:
            classified.add(json.loads(line)['path'])
        except: pass

# 3. 差集 = 新增未分类页面
new_pages = all_md_files - classified
if new_pages:
    # Reset classifyState → scanning，Phase 0 会处理新页面
    log(f'PRE-FLIGHT: {len(new_pages)} new OneNote pages detected, resetting classifyState')
```

- 新页面 > 0 → 设 `enrich-state.json → classifyState.status = "scanning"`
- 新页面 = 0 → 跳过

#### Pre-flight 状态重置规则

> ⚠️ **Step -1 结束时，如果任何子步骤检测到增量变化**（新 OneNote 页面、index 有新条目、
> sourceStates 被 reset 回 scanning），**必须同时执行以下重置**：
>
> 1. `enrich-state.json → status` 从 `"complete"` 改为 `"running"`
> 2. 受影响的产品从 `completedProducts` 移回 `activeProducts`
> 3. 更新 `enrich-state.json` 写盘
>
> 否则 Step 0 的 `status === "complete"` 门禁会直接退出，Pre-flight 检测到的增量白费。

#### -1b. ADO Wiki / MS Learn index 刷新

对每个 `activeProducts` + `completedProducts`，检查有 index 的源（ado-wiki, mslearn）：

```python
from datetime import datetime, timedelta

REFRESH_INTERVAL_DAYS = 7

for product in all_products:
    progress = read_progress(product)
    for source in ['ado-wiki', 'mslearn']:
        if progress['sourceStates'].get(source) != 'exhausted':
            continue
        scanned_file = f'{product}/.enrich/scanned-{source}.json'
        if not exists(scanned_file): continue
        data = read_json(scanned_file)
        last_refreshed = data.get('lastRefreshed')
        if last_refreshed and days_since(last_refreshed) < REFRESH_INTERVAL_DAYS:
            continue  # 刷新周期未到

        # ado-wiki: 重新枚举 wiki page tree，对比 index
        # mslearn: 重新 fetch toc.yml，对比 index
        # 有新条目 → 追加 index，reset sourceState 为 scanning
        # 更新 lastRefreshed
        log(f'PRE-FLIGHT: {product}/{source} index refresh triggered (lastRefreshed={last_refreshed})')
```

- ADO Wiki 刷新：重新执行 Phase 3a 的 page tree 枚举，新页面追加到 `index`
- MS Learn 刷新：重新 fetch GitHub toc.yml，新 URL 追加到 `index`
- 刷新后 `lastRefreshed` 更新为当前时间

#### -1c. ContentIdea 增量检测

> 已实现（Phase 5 `lastRefreshed` + auto-enrich Step 0a 的 7 天刷新逻辑）。Pre-flight 无需额外处理。

#### -1d. Registry 健康检查

```python
# 扫描 OneNote Export 顶级目录
pod_services_dir = onenote_dir + '/Mooncake POD Support Notebook/POD/VMSCIM/4. Services'
pod_dirs = set(os.listdir(pod_services_dir)) if os.path.exists(pod_services_dir) else set()

# 读取 registry 已映射的 podServicesDir
registry = read_json('playbooks/product-registry.json')
mapped_dirs = set()
for p in registry['podProducts']:
    if p.get('podServicesDir'):
        mapped_dirs.add(p['podServicesDir'])

# 未被映射的 POD 目录 → 输出警告
unmapped = pod_dirs - mapped_dirs - KNOWN_SKIP_DIRS
# KNOWN_SKIP_DIRS = {'New Service Checklist', 'Security, Cost Efficiency and Sub management', ...}
if unmapped:
    warnings.append(f'Unmapped POD directories: {unmapped}')
```

- 警告写入 `enrich-state.json → registryWarnings` 数组
- 不自动修改 registry（需要人工确认产品归属）
- 输出格式：`⚠️ PRE-FLIGHT: 发现 {N} 个未映射的 OneNote 目录: {list}`

---

### Step 0: 读取状态 + 前置检查

```bash
cat .claude/skills/products/enrich-state.json
```

- `status === "complete"` → 输出 "✅ All products enriched and synthesized"，退出

### Step 0a: sourceStates 对账（磁盘真相 > 内存标记）

> 修复自链式 agent exhausted 信号丢失和 session 中断导致的标记不一致。
> 在 spawn 任何 agent 之前执行，单线程无并发风险。

对每个 `activeProducts` + `completedProducts` 中的产品：

```python
for product in activeProducts + completedProducts:
    progress = read(f'{product}/.enrich/progress.json')
    changed = False
    
    for source in ['ado-wiki', 'mslearn']:  # 有 index 的源，可以算 unscanned
        scanned_file = f'{product}/.enrich/scanned-{source}.json'
        if not exists(scanned_file): continue
        data = read_json(scanned_file)
        index_keys = set(to_key(i) for i in data.get('index', []))
        scanned_keys = set(to_key(s) for s in data.get('scanned', []))
        skipped_keys = set(to_key(s) for s in data.get('skipped', []))
        unscanned = index_keys - scanned_keys - skipped_keys
        
        current = progress['sourceStates'].get(source, 'pending')
        if len(unscanned) == 0 and len(index_keys) > 0 and current != 'exhausted':
            progress['sourceStates'][source] = 'exhausted'
            changed = True
            log(f'RECONCILED: {product}/{source} scanning→exhausted (unscanned=0)')
    
    # blast 标记清理：如果 ado-wiki 已 exhausted 但 adoWikiBlast 还是 running
    if progress.get('adoWikiBlast') in ('running', 'paused'):
        if progress['sourceStates'].get('ado-wiki') == 'exhausted':
            progress['adoWikiBlast'] = 'stopped'
            changed = True
            log(f'RECONCILED: {product}/adoWikiBlast running→stopped')
    
    if changed:
        write(f'{product}/.enrich/progress.json', progress)
```

**规则**：
- 只对有 index 的源（ado-wiki, mslearn）做对账——其他源（onenote, 21v-gap）无 index 无法从磁盘判断
- `index` 为空（len=0）时不标记 exhausted——可能是还没建索引
- 只做 `scanning→exhausted` 方向的修正，不做反向（防止误把正在扫的标记回退）
- **contentidea-kb 定期刷新**：无持久化 index（WIQL 每次重查），按 `lastRefreshed` 时间判断：
  ```python
  # contentidea-kb 7 天刷新机制
  if progress['sourceStates'].get('contentidea-kb') == 'exhausted':
      ck_file = f'{product}/.enrich/scanned-contentidea-kb.json'
      if exists(ck_file):
          ck_data = read_json(ck_file)
          last_refreshed = ck_data.get('lastRefreshed')  # ISO format or null
          if not last_refreshed or days_since(last_refreshed) >= 7:
              progress['sourceStates']['contentidea-kb'] = 'scanning'
              changed = True
              log(f'REFRESH: {product}/contentidea-kb exhausted→scanning (lastRefreshed={last_refreshed})')
  ```

### Step 0.5: Phase 0 分类前置检查
- `classifyState.status !== "exhausted"` → 仅执行 Phase 0 page-classify tick，不进入 per-product 流程
- `classifyState.status === "exhausted"` → 进入 Step 1

**全部完成检查**：
- `activeProducts` 为空且 `productQueue` 为空：
  - 检查 `completedProducts` 中是否有 `synthesized === false` 的产品
  - 有 → 逐个触发 MERGE + SYNTHESIZE
  - 全部已 synthesize → 设 `status = "complete"`

### Step 1: 动态填充 activeProducts

**无固定上限**——将 `productQueue` 中所有产品一次性拉入 `activeProducts`。
`maxAgentsPerTick` 控制并发 agent 总数，不限制 active product 数量。
产品多但 source 少（已 exhausted）时，调度器自然只 spawn 有工作可做的任务。

从 `productQueue` 全量取出：

对每个新加入的产品：
1. 从 `productQueue` 移除
2. 加入 `activeProducts`
3. 创建 `.enrich/progress.json`（如不存在）：
   ```json
   {"product":"{id}","status":"extracting","sourceStates":{"21v-gap":"pending","onenote":"pending","ado-wiki":"pending","mslearn":"pending","contentidea-kb":"pending"},"synthesized":false,"stats":{"discovered":0,"deduplicated":0}}
   ```
4. 更新 `enrich-state.json`（activeProducts + productQueue）

### Step 2: 收集待执行任务

对每个 `activeProduct`，读取其 `.enrich/progress.json`：
- 收集所有 `sourceStates[source] === "pending" || "scanning"` 的 source
- onenote source 需要 `classifyState.status === "exhausted"` → 否则跳过
- **ado-wiki source 互斥检查**：读取 `.enrich/progress.json → adoWikiBlast`，值为 `"running"` → 跳过此 source（由独立 `/product-learn ado-wiki-blast` 模式处理）
- 每个 (product, source) 组合 = 1 个待执行任务

**ADO Wiki 并发分批**：当 source 为 `ado-wiki` 且已有索引时，可将未扫描页面拆分为多个 batch，每个 batch 作为独立任务：
- 读取 `.enrich/scanned-ado-wiki.json`，计算未扫描页面列表
- 按动态分配规则（Step 3b 的 15K 字符凑批）或固定 5 页/batch 拆分
- 每个 batch 分配不重叠的页面范围，在 prompt 中明确指定页面列表
- ID 前缀区分：`{product}-ado-wiki-a-{seq}`, `{product}-ado-wiki-b-{seq}`, ...
- 最多 3 个 batch/产品（避免 API 限流）

**总数上限**：`maxAgentsPerTick`。超过时按优先级截取：
- 优先级排序：先按产品在 `enrichPriority` 中的顺序，再按 source 优先级（`21v-gap` > `onenote` > `ado-wiki` > `mslearn` > `contentidea-kb`）

### Step 3: 并行 Spawn Agents（全部 background）

**在一条消息中同时发出所有 Agent 调用**（Claude Code 原生并行），所有 agent 使用 `run_in_background: true`：

```
对每个 (product, source) 任务：

Agent(
  description: "enrich {product} from {source}",
  run_in_background: true,
  prompt: |
    产品: {product}
    数据源: {source}
    项目根: {PROJECT_ROOT}
    
    读取 .claude/skills/product-learn/phases/{phaseFile} 执行。
    
    Phase 文件映射：
    - onenote → phases/phase2-onenote.md
    - ado-wiki → phases/phase3-ado-wiki.md
    - mslearn → phases/phase4-mslearn.md
    - contentidea-kb → phases/phase5-contentidea.md
    
    ⚠️ 并行隔离规则（v3）：
    - 写入 JSONL: .claude/skills/products/{product}/.enrich/known-issues-{source}.jsonl（不是 known-issues.jsonl）
    - 扫描记录: .claude/skills/products/{product}/.enrich/scanned-{source}.json
    - ID 格式: {product}-{source}-{seq:03d}（在 per-source 文件内递增）
    - 去重范围: 仅在 known-issues-{source}.jsonl 内去重
    - 草稿前缀: guides/drafts/{source}-{title}.md
    - 21v-gaps.json 不存在时: 设 21vApplicable=null（MERGE 阶段补标）
    
    关键文件：
    - known-issues-{source}.jsonl: .claude/skills/products/{product}/.enrich/known-issues-{source}.jsonl
    - scanned-{source}.json: .claude/skills/products/{product}/.enrich/scanned-{source}.json
    - 21v-gaps.json: .claude/skills/products/{product}/21v-gaps.json (如果存在)
    - playbooks/product-registry.json: 读取 podProducts 获取目录映射
    
    完成后返回:
    1. discovered: 新发现条目数
    2. deduplicated: 去重跳过条目数
    3. exhausted: true/false (该数据源是否已穷尽)
    4. 简要摘要 (<500 bytes)
)
```

spawn 后立即输出摘要表格并结束 tick，**不等待 agent 完成**。

### Step 4: 异步结果收集（agent 完成通知触发）

当收到 `<task-notification>` 时，逐个处理：

1. **更新 per-product 进度**（`.enrich/progress.json`）：
   - `sourceStates[source]` = agent.exhausted ? `"exhausted"` : `"scanning"`
   - ❌ **不再写 stats**——stats 只从磁盘文件计算（`/product-learn stats` 命令）

2. **更新全局状态**（`enrich-state.json`）：
   - ❌ **不再写 stats**——stats 只从磁盘文件计算

3. **检查产品完成**：
   对每个 activeProduct：
   - 所有 5 个 source 都 `"exhausted"` → 自动触发 MERGE + SYNTHESIZE：
     1. 设 `.enrich/progress.json → status = "merging"`
     2. 执行 MERGE（见下方 MERGE 阶段）
     3. 执行 SYNTHESIZE
     4. 从 `activeProducts` 移入 `completedProducts`

4. **写回状态文件**

5. **即时补位（Refill）**：
   - 计算当前活跃 agent 数 = 已 spawn 但未完成的 agent 数
   - 空闲 slot = `maxAgentsPerTick - 活跃 agent 数`
   - 如果空闲 slot > 0 且仍有未完成的 (product, source) 任务：
     - 按 Step 2 相同的优先级规则收集待执行任务
     - 立即 spawn 新 agent 填满空位（同样 `run_in_background: true`）
     - 输出简短补位日志：`🔄 Refill: spawned {N} replacement agents`
   - 如果无待执行任务 → 不补位，等所有 agent 完成后进入 MERGE/SYNTHESIZE

> **关键**：这意味着 agent 完成通知不仅触发状态更新，还触发新 agent spawn。
> 效果：slot 利用率从 ~60%（5 分钟 cron 周期内 agent 平均 3 分钟完成）提升到 ~95%。
> cron tick 的作用从"唯一调度点"降级为"兜底检查"——确保即使通知丢失也能恢复。

> **批量通知处理**：如果多个 agent 同时完成通知到达，先批量更新状态，再一次性 spawn 所有补位 agent。

### Step 6: 输出摘要（spawn 后立即输出）

```
📚 Parallel Enrichment Tick — {N} Agents Spawned
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

| Product | onenote | ado-wiki | mslearn | contentidea-kb | 21v-gap |
|---------|---------|----------|---------|----------------|---------|
| intune  | 🔄      | 🔄       | ✅ idx  | 🔄             | ✅      |
| vm      | 🔄      | 🔄       | ✅ idx  | 🔄             | ✅      |
...

Active: {N} products | Queue: {M} remaining
Cumulative: {totalDiscovered} discovered

Total: +18 discovered, 2 deduped
Active: {activeProducts} | Queue: {remaining} remaining
```

---

## MERGE 阶段（SYNTHESIZE 前置步骤）

**触发条件**：某产品全部 5 个 source 均 `"exhausted"` 后自动触发。
也可手动触发：`/product-learn synthesize {product}` 会先执行 MERGE。

### 流程

1. **读取所有 per-source JSONL 文件**：
   ```
   .enrich/known-issues-21v-gap.jsonl
   .enrich/known-issues-onenote.jsonl
   .enrich/known-issues-ado-wiki.jsonl
   .enrich/known-issues-mslearn.jsonl
   .enrich/known-issues-contentidea-kb.jsonl
   ```

2. **跨 source 去重**：
   - 对比所有条目的 `symptom` + `rootCause` 关键词
   - ≥80% 重叠 → 保留 confidence 更高的，丢弃另一个（`stats.deduplicated++`）
   - 50-80% 重叠 → 保留两个，互标 `relatedTo`
   - <50% → 保留

3. **21V 补标**：
   - 读取 `21v-gaps.json`（如存在）
   - 对所有 `21vApplicable === null` 的条目：检查 solution 是否涉及 unsupported feature → 标记

4. **统一重编 ID**：
   - 所有保留条目按 source 优先级排序（21v-gap → onenote → ado-wiki → mslearn → contentidea-kb），source 内按原序
   - 重编为 `{product}-001`, `{product}-002`, ...

5. **写入 `known-issues.jsonl`**（最终合并文件）

6. **更新 `.enrich/progress.json → status = "synthesizing"`**

---

## Phase 执行指令（Agent 内部读取）

> ⚠️ **v3 并行隔离规则**：所有 Phase 写入目标均为 per-source 文件（见"文件隔离架构"节）。
> Agent 从 prompt 中获取 `{source}` 参数，决定写入哪个文件。

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
   - 将完整文件列表写入 `.claude/skills/products/page-list.txt`（一行一个路径，相对于 ONENOTE_DIR）
   - 设 `classifyState.totalPages = len(page-list.txt)`
   - 设 `classifyState.status = "scanning"`
   - 如果 `page-classification.jsonl` 已存在，读取已分类的路径集合，从 `page-list.txt` 中排除

2. **每 tick 处理 10 个页面**：
   - 从 `page-list.txt` 中取下一批 10 个未分类页面（跳过已在 `page-classification.jsonl` 中的）
   - 对每个页面：
     - Read 文件内容（>3000 字符截取前 3000）
     - LLM 分析：这个页面涉及哪些产品域？
   - 产品域列表来自 `playbooks/product-registry.json → podProducts[*].id`
   - LLM 判断依据：
     - 页面内容涉及的 Azure 服务名（对照 `podProducts[*].services`）
     - 排查的问题域（如 enrollment 相关 → intune，NSG 相关 → networking）
     - 一个页面可以同时属于多个产品（如 Triage 会议记录、跨产品 TSG）
     - 纯流程/人员/会议安排等非技术页面 → `products: []`（不属于任何产品）
   - 每个分类结果 append 到 `.claude/skills/products/page-classification.jsonl`：
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
    - page-list.txt: .claude/skills/products/page-list.txt
    - page-classification.jsonl: .claude/skills/products/page-classification.jsonl
    - playbooks/product-registry.json: 读取 podProducts 获取产品 ID 和 services 列表
    
    完成后返回:
    1. classified: 本轮分类页面数
    2. byProduct: 各产品命中数（如 {"intune":3,"vm":2}）
    3. exhausted: true/false
    4. 简要摘要 (<500 bytes)
)
```

---

### 全局约束（所有 Phase 通用）

- 每个 tick 最多处理 **10 个页面/文件**（ADO Wiki 使用动态批量分配，见 Phase 3 Step 3b）
- **不截取页面内容**——通过动态分配（ADO Wiki）或每批 10 页（OneNote 本地文件）控制总量，确保 agent 有足够 token 完成提取+写入
- OneNote 页面：读取完整全文，不截取
- 每个 tick 目标完成时间 **< 5 分钟**
- **大文件写入规则**：任何预计超过 5KB 的 JSON 文件（如 `.enrich/topic-plan.json`、`.enrich/scanned-*.json` 含大量条目时），**禁止用 Write 工具**，必须通过 `Bash` + `python3 -c "import json; ..."` 写入。原因：Write 工具把文件内容作为 output token 生成，大 JSON 会超 max_tokens 导致参数截断死循环。
- **v3 并行写入规则**：
  - 写 JSONL → `.enrich/known-issues-{source}.jsonl`（不是 `known-issues.jsonl`）
  - 写扫描记录 → `.enrich/scanned-{source}.json`
  - ID 格式 → `{product}-{source}-{seq:03d}`（在 per-source 文件内递增）
  - 去重范围 → 仅在自己的 per-source 文件内去重（跨 source 去重留给 MERGE）
  - 草稿文件名 → `guides/drafts/{source}-{sanitized-title}.md`
- **扫描前**必须先 Read `.enrich/scanned-{source}.json`，**扫描后**必须 append 本次处理的路径/URL
- `.enrich/known-issues-{source}.jsonl` 不存在 → 创建空文件后 append
- `.enrich/scanned-{source}.json` 不存在 → 创建合适的初始结构（见各 Phase 说明）

### 双轨提取规则（Phase 2/3/4 通用）

所有需要 LLM 提取的 Phase（onenote/ado-wiki/mslearn）均采用双轨处理：

- **Track A — Break/Fix 型**：有明确的错误现象 + 原因或解决方案 → 提取三元组写 `known-issues.jsonl`
- **Track B — 排查指南型**：决策树、多步诊断、操作手册、参考表 → 保存为 `guides/drafts/{title}.md` 草稿 + 在 JSONL 写一条 `quality: "guide-draft"` 的指引条目

**分类判断**：LLM 在一次 prompt 中同时完成分类和提取。能提出至少一组 symptom + (rootCause 或 solution) → Track A，否则 → Track B。

**SYNTHESIZE 阶段处理 drafts/**：
- 三元组 + 同主题草稿 → 融合：三元组补充到草稿的对应 section
- 纯草稿 → 清洗格式后生成正式指南（写入 `guides/`）
- **草稿永远保留**：`guides/drafts/` 中的原始文件不删除、不移动
  - 用途 1：增量更新时对比原始内容与合成结果
  - 用途 2：重新合成时作为输入源
  - 用途 3：溯源验证——正式指南引用草稿路径，可追查原文
- `guides/drafts/` 中的文件不进入 `_index.md`，只有正式指南才索引
- 正式指南的 frontmatter 中记录来源草稿路径：`draftSources: ["drafts/onenote-xxx.md", "drafts/ado-wiki-yyy.md"]`

Phase 3 (ado-wiki-scan) 的双轨细节见该 Phase 内的"内容分类 + 双轨处理"section。Phase 2 和 Phase 4 遵循相同规则，仅 `source` 和 `sourceRef` 格式不同。

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

1. **检查缓存**：读取 `.claude/skills/products/{product}/21v-gaps.json`
   - 存在且 `lastUpdated` 距今 < 30 天 → 跳过，返回 `{discovered:0, deduplicated:0, exhausted:true, summary:"cache valid"}`

2. **读取 playbooks/product-registry.json**，找到 `podProducts[product].podServicesDir`
   - 为 null → 返回 `exhausted:true`，写空 21v-gaps.json

3. **Glob 搜索 Feature Gap 文件**：
   ```bash
   find "${SERVICES_DIR}/{podServicesDir}" -maxdepth 2 \( -iname "*Feature*Gap*" -o -iname "*Feature*List*Gap*" -o -iname "*feature*parity*" \)
   ```

4. **读取文件**（通常 1-2 个），LLM 提取：
   - `unsupportedFeatures`: 明确不支持的功能列表，每条附简短说明
   - `partialFeatures`: 部分支持的功能列表，每条附简短说明

5. **没找到 Feature Gap 文件**时：
   - 用 Grep 在 POD notebook 搜索 `{product}` + `"not support|不支持|gap"`
   - 仍无结果 → 写空 21v-gaps.json（标记 `"noGapDataFound": true`）

6. **Write** `.claude/skills/products/{product}/21v-gaps.json`：
   ```json
   {
     "lastUpdated": "YYYY-MM-DD",
     "product": "{product}",
     "unsupportedFeatures": [...],
     "partialFeatures": [...],
     "noGapDataFound": false
   }
   ```

7. **Append** `.enrich/evolution-log.md`：`[{date}] 21v-gap-scan: {N} unsupported, {M} partial features`

8. 返回 `{discovered: N+M, deduplicated: 0, exhausted: true}`
   > 21v-gap-scan 始终一次完成（scope 小），总是返回 `exhausted: true`。

---

### Phase 2: onenote-extract

> 📄 **已拆分到独立文件**：`phases/phase2-onenote.md`
> Agent prompt 引用：`读取 .claude/skills/product-learn/phases/phase2-onenote.md 执行`
> 前置条件：`classifyState.status === "exhausted"`（Phase 0 分类必须完成）

---

### Phase 3: ado-wiki-scan

> 📄 **已拆分到独立文件**：`phases/phase3-ado-wiki.md`
> Agent prompt 引用：`读取 .claude/skills/product-learn/phases/phase3-ado-wiki.md 执行`

---

### Phase 4: mslearn-scan

> 📄 **已拆分到独立文件**：`phases/phase4-mslearn.md`
> Agent prompt 引用：`读取 .claude/skills/product-learn/phases/phase4-mslearn.md 执行`
> 范围：只扫描 `support/` 路径下的 troubleshoot 文档，不扫描产品概念/架构文档

---

### Phase 5: contentidea-kb-scan

> 📄 **已拆分到独立文件**：`phases/phase5-contentidea.md`
> Agent prompt 引用：`读取 .claude/skills/product-learn/phases/phase5-contentidea.md 执行`
> 特点：不需要 LLM 提取，ContentIdea work items 已有结构化字段，直接 strip HTML 写入 JSONL

---

## SYNTHESIZE — 综合指南生成

> 📄 **已拆分到独立文件**：`modes/synthesize.md`
> 调度器引用：`Read(".claude/skills/product-learn/modes/synthesize.md")`
> 手动触发：`/product-learn synthesize {product}`

触发条件、并行架构、打分体系、分层生成、增量合成逻辑详见 `synthesize.md`。

---

## REFRESH — 增量维护

**触发条件**：
- **自动**：`onenote-export` 同步后写入 `.claude/skills/products/onenote-changes.json`
- **手动**：`auto-enrich reset --reset-source onenote`

### onenote-export 联动

`onenote-export` sync 完成后，自动写入变更通知文件：
```
.claude/skills/products/onenote-changes.json
```
```json
{
  "syncedAt": "2026-04-05T15:00:00Z",
  "changedFiles": [
    "MCVKB/Intune/Deploy Win32 exe.md",
    "MCVKB/VM+SCIM/=======2. VM & VMSS=======/New known issue.md"
  ],
  "newFiles": [
    "MCVKB/Intune/New enrollment TSG.md"
  ]
}
```

### auto-enrich tick 开始时的 REFRESH 检查

**Step 0 新增**：在读取 enrich-state.json 后、spawn agents 前：

1. 检查 `.claude/skills/products/onenote-changes.json` 是否存在
2. 存在 → 读取 `changedFiles` + `newFiles`
3. 对每个变更文件：
   - 通过 `page-classification.jsonl` 查找所属产品（可能属于多个产品）
   - 从对应产品的 `.enrich/scanned-onenote.json → scanned` 中**移除**该路径
   - 同时在 `.enrich/known-issues-onenote.jsonl` 中标记相关条目为 `"stale": true`（下次提取会覆盖）
4. 对每个新文件：
   - 如果不在 `page-classification.jsonl` 中 → 自动加入分类队列（走 Phase 0 分类）
   - 如果已分类 → 直接加入对应产品的待扫描列表
5. 处理完毕 → **删除** `onenote-changes.json`（防止重复处理）
6. 受影响的产品如果 `onenote` source 已标记 `"exhausted"` → 重置为 `"scanning"`

### 已有条目更新（stale 处理）

当 onenote-extract agent 处理一个被标记 stale 的页面时：
- 提取新三元组
- 与 `stale: true` 的旧条目对比 `sourceRef`
- 匹配到 → **原地更新**（保留 ID，更新 symptom/rootCause/solution/date，清除 stale 标记）
- 未匹配 → 正常 append 新条目
- 旧 stale 条目未被更新覆盖 → 保留但降低 confidence（可能页面内容被删减了）

### 规则

- **仅团队笔记本**触发 REFRESH（`config.json → onenote.teamNotebooks` 列出的笔记本）
- ADO Wiki / MS Learn：**不自动 REFRESH**，需手动 `auto-enrich reset --reset-source ado-wiki` 触发重扫
- 个人笔记本变更不触发任何操作
- REFRESH 处理完成后，如果受影响产品已有合成指南 → 标记 `synthesizeState` 需要增量重合成

---

## 错误处理

| 场景 | 动作 |
|------|------|
| OneNote 目录不存在 | 跳过该 source，日志记录 warning，不阻塞其他 source |
| ADO 搜索失败 | 日志记录 error，设 `productStates[product].ado-wiki = "error"`，不阻塞其他 source |
| msft-learn MCP 不可用 | 跳过 mslearn source，设 `productStates[product].mslearn = "error"` |
| LLM 提取 0 个三元组 | 正常现象，日志记录 "no knowledge extracted"，仍标记页面为已扫描 |
| SYNTHESIZE 聚类失败 | 降级：按 source 分组（而非按主题），仍生成指南 |
| `.enrich/scanned-{source}.json` 损坏 | 从 `.enrich/known-issues-{source}.jsonl` 的 `sourceRef` 字段重建 |
| `known-issues.jsonl` 不存在 | 创建空文件，正常执行 |
| Agent spawn 失败 | 记录 error，不更新状态（下次 run 会重试同一 product+source） |
| config.json 中产品无映射目录 | 该 source 直接标记 `exhausted`（如 `defender` 无 OneNote section） |

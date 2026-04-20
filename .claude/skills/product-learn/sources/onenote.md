# OneNote Source Adapter

> **Per-product adapter.** Rules reference: `../shared-rules.md`
>
> **Orchestrator manages continuation. This adapter does NOT self-chain.**

---

## Dual-Channel Discovery

OneNote 页面的发现不依赖单一来源——通过两个独立 Channel 互补获取，最大化覆盖率。

### Channel 1: Section Mapping（immediate, high precision）

使用 `playbooks/product-registry.json` 中本产品的 `onenoteSection`、`mcvkbSection`、`extraSections` 字段 glob 匹配 OneNote 目录。

**特性**：
- ✅ 立即可用，无需等待 Router 完成
- ✅ 高精度——路径匹配是确定性的
- ❌ 低召回率——只能发现路径明确归属本产品的页面，跨产品内容（如 Triage 会议记录）无法捕获

**示例（vm 产品）**：

```python
# product-registry.json 中 vm 的配置:
# onenoteSection: "VM+SCIM/=======2. VM*"
# mcvkbSection:   "VM+SCIM/=======2. VM*"
# extraSections:  ["VM+SCIM/=======3. Linux*", "VM+SCIM/=======5. Image*"]

import glob, os

ONENOTE_DIR = config['dataRoot'] + '/OneNote Export'
team_notebooks = config['onenote']['teamNotebooks']  # ['MCVKB', 'Mooncake POD Support Notebook']

channel1_pages = set()
sections = ['VM+SCIM/=======2. VM*', 'VM+SCIM/=======3. Linux*', 'VM+SCIM/=======5. Image*']

for notebook in team_notebooks:
    nb_dir = os.path.join(ONENOTE_DIR, notebook)
    if not os.path.exists(nb_dir):
        continue
    for section_pattern in sections:
        # glob 匹配 section 下的所有 .md 文件
        pattern = os.path.join(nb_dir, section_pattern, '**', '*.md')
        for filepath in glob.glob(pattern, recursive=True):
            rel_path = os.path.relpath(filepath, ONENOTE_DIR).replace('\\', '/')
            channel1_pages.add(rel_path)

# channel1_pages 示例:
# {"MCVKB/VM+SCIM/=======2. VM/Boot Diag Failure.md",
#  "MCVKB/VM+SCIM/=======3. Linux/WAAgent Issues.md",
#  "Mooncake POD Support Notebook/.../VM/RDP Connectivity.md"}
```

### Channel 2: Router Results（progressive, high recall）

读取 `.claude/skills/products/page-routing.jsonl`，过滤 `products` 包含当前产品的条目。

**特性**：
- ✅ 高召回率——Router 通过 keyword 和 LLM 发现跨 section 的相关页面
- ❌ 渐进式可用——Router 是后台服务，分类结果逐步增长
- ❌ 中等精度——Layer 2/3 分类有误判可能

```python
import json

def get_channel2_pages(product_id):
    """读取 Router 分类结果，过滤属于本产品的页面"""
    pages = set()
    routing_file = '.claude/skills/products/page-routing.jsonl'
    if not os.path.exists(routing_file):
        return pages
    for line in open(routing_file, encoding='utf-8'):
        try:
            entry = json.loads(line)
            if product_id in entry.get('products', []):
                pages.add(entry['path'])
        except:
            pass
    return pages
```

### Dedup Between Channels

`scanned-onenote.json` 是**唯一去重门控**——无论页面来自 Channel 1 还是 Channel 2，只要已在 `scanned` 数组中就跳过：

```python
# 合并两个 Channel 的页面
all_pages = channel1_pages | channel2_pages

# 读取已扫描记录
scanned = set(read_json(f'{product}/.enrich/scanned-onenote.json').get('scanned', []))

# 待处理 = 全集 - 已扫描
pending = all_pages - scanned
```

---

## Extract Logic

对每个待处理页面执行 LLM 双轨提取。**提取规则的权威定义见 `../shared-rules.md`**，以下为简要引用：

### 1. 读取页面

- Read 文件内容
- > 5000 字符 → 截取前 3000 字符

### 2. LLM 双轨提取

LLM 在一次 prompt 中完成分类和提取（详见 `shared-rules.md § Dual-Track Extraction`）：

1. **先判断 Skip**：纯内部管理/行政内容 → 跳过，不提取
2. **再判断 Track A vs Track B**：
   - 能提出至少一组 `symptom` + (`rootCause` 或 `solution`) → **Track A**
   - 否则 → **Track B**

### 3. Track A → Known Issues JSONL

提取 symptom/rootCause/solution 三元组（一个页面可产出 0-5 个），写入 `.enrich/known-issues-onenote.jsonl`：

```json
{
  "id": "{product}-onenote-{seq:03d}",
  "date": "2026-04-19",
  "symptom": "VM 启动后 Boot Diagnostics 显示 INACCESSIBLE_BOOT_DEVICE",
  "rootCause": "OS 磁盘从 Gen1 转换为 Gen2 后 BCD 未更新",
  "solution": "挂载 OS 磁盘到 rescue VM，执行 bcdboot 修复 BCD 配置",
  "source": "onenote",
  "sourceRef": "MCVKB/VM+SCIM/=======2. VM/Boot Diag Failure.md",
  "sourceUrl": null,
  "product": "{product}",
  "confidence": "high",
  "quality": "raw",
  "tags": ["boot", "bcd", "gen2"],
  "21vApplicable": null,
  "promoted": false
}
```

**ID 生成**：读取 `.enrich/known-issues-onenote.jsonl` 中该 source 最大序号 +1（详见 `shared-rules.md § ID Generation`）。

**去重**：仅与 `.enrich/known-issues-onenote.jsonl` 内已有条目对比（详见 `shared-rules.md § Dedup Rules`）。

### 4. Track B → Guide Draft

保存为 `.claude/skills/products/{product}/guides/drafts/onenote-{sanitized-title}.md`，格式：

```yaml
---
source: onenote
sourceRef: "MCVKB/VM+SCIM/.../page.md"
sourceUrl: null
importDate: "2026-04-19"
type: guide-draft
---
```

### 5. 21V 补标

- 读取 `21v-gaps.json`（如存在）
- 对新提取的 Track A 条目检查 solution 是否涉及 unsupported feature → 标记 `21vApplicable`
- 无 `21v-gaps.json` → 保留 `21vApplicable: null`，留给 MERGE 阶段补标

### 6. 更新 scanned 记录

将本次处理的页面路径 append 到 `.enrich/scanned-onenote.json → scanned`。

### 7. Append evolution log

追加到 `.enrich/evolution-log.md`（格式见 `shared-rules.md § Evolution Log`）。

### Per Tick 处理量

每 tick 处理 **10 个页面**。优先处理 `confidence: "high"` 的页面（Channel 1 和 Router Layer 1 的结果）。

---

## State: scanned-onenote.json

路径：`.claude/skills/products/{product}/.enrich/scanned-onenote.json`

```json
{
  "scanned": [
    "MCVKB/VM+SCIM/=======2. VM/Boot Diag Failure.md",
    "MCVKB/VM+SCIM/=======3. Linux/WAAgent Issues.md"
  ]
}
```

- 不存在 → 创建 `{"scanned": []}`
- **禁止**覆盖已有 `scanned` 数组，只能 append
- orphan 条目（页面已删除但 scanned 中仍有记录）无害，保留不清理

---

## Idle Condition

OneNote source adapter 判定 idle（`exhausted: true`）的条件：

1. **Channel 1 exhausted**：所有 path-matched 页面均已在 `scanned-onenote.json` 中
2. **Router idle**：`enrich-state.json → router.status === "exhausted"`
3. **Channel 2 exhausted**：`page-routing.jsonl` 中属于本产品的所有页面均已在 `scanned-onenote.json` 中

三个条件同时满足 → `exhausted: true`。

如果 Router 仍在运行（`router.status !== "exhausted"`），即使 Channel 1 和当前已有的 Channel 2 都已处理完，仍返回 `exhausted: false`——因为 Router 可能会产出新的属于本产品的页面。

---

## Change Detection (incremental)

当 `onenote-changes.json` 存在时，adapter 在每 tick 开始前检查增量变化：

### changedFiles

1. 从 `.enrich/scanned-onenote.json → scanned` 中移除对应路径（允许重新扫描）
2. 在 `.enrich/known-issues-onenote.jsonl` 中，将 `sourceRef` 匹配的条目标记 `"stale": true`
3. 页面将在后续 tick 中被重新处理，新提取的条目会覆盖 stale 条目

### newFiles routed to this product

1. Router 将新文件分类后，结果出现在 `page-routing.jsonl`
2. Channel 2 自然发现新页面（不在 `scanned` 中 → 自动进入待处理队列）
3. Channel 1 的 path-matched 新文件同理自动发现

### deletedFiles

1. 不需要特殊处理——已删除的文件在 `scanned` 中保留为 orphan（无害）
2. 对应的 JSONL 条目保留（知识不丢失，即使源文件已删除）

---

## Agent Spawn Template

```
Agent(
  description: "enrich {product} from onenote",
  run_in_background: true,
  prompt: |
    任务: OneNote Source Adapter — 从 OneNote 提取 {product} 产品知识
    项目根: {PROJECT_ROOT}
    产品: {product}
    
    读取 .claude/skills/product-learn/sources/onenote.md 获取完整流程。
    提取规则（JSONL 格式、双轨提取、去重、ID 生成、文件写入）见 .claude/skills/product-learn/shared-rules.md。
    
    ⚠️ 写文件必须用 Bash + python3 -c，禁止用 Write 工具（缓存 bug）。
    ⚠️ 文件写入规则详见 shared-rules.md § File Write Rules。
    ⚠️ 此 adapter 不自链——完成后返回结果，由 Orchestrator 决定是否继续。
    
    关键文件:
    - Registry: playbooks/product-registry.json（读取 {product} 的 onenoteSection/mcvkbSection/extraSections/matchKeywords）
    - Router 结果: .claude/skills/products/page-routing.jsonl（Channel 2，过滤 products 含 "{product}"）
    - JSONL 写入: .claude/skills/products/{product}/.enrich/known-issues-onenote.jsonl
    - 扫描记录: .claude/skills/products/{product}/.enrich/scanned-onenote.json
    - Track B 草稿: .claude/skills/products/{product}/guides/drafts/onenote-{title}.md
    - 21V gaps: .claude/skills/products/{product}/21v-gaps.json（如存在则读取补标）
    - Evolution log: .claude/skills/products/{product}/.enrich/evolution-log.md（append）
    - OneNote 目录: {ONENOTE_DIR}
    - Config: config.json（读取 onenote.teamNotebooks）
    
    双 Channel 页面发现:
    1. Channel 1 (Section Mapping): 用 registry 路径 glob 匹配，立即可用
    2. Channel 2 (Router Results): 读 page-routing.jsonl 过滤本产品，渐进式
    3. 合并两个 Channel → 减去 scanned → 取 top 10 处理
    
    每个页面:
    - Read 内容（>5000 字符截取前 3000）
    - LLM 双轨提取（Track A → JSONL, Track B → guide draft）
    - 去重（仅与 known-issues-onenote.jsonl 内对比）
    - ID: {product}-onenote-{seq:03d}
    - 更新 scanned-onenote.json
    
    Idle 判定:
    - Channel 1 all scanned AND router.status === "exhausted" AND Channel 2 all scanned → exhausted: true
    - 否则 → exhausted: false
    
    返回:
    1. discovered: 本轮发现的新知识条目数
    2. guideDrafts: 本轮生成的 Track B 草稿数
    3. deduplicated: 跳过的重复条目数
    4. exhausted: true/false
    5. channel1Remaining: Channel 1 剩余未扫描页面数
    6. channel2Remaining: Channel 2 剩余未扫描页面数
    7. routerStatus: enrich-state.json → router.status
    8. 简要摘要 (<500 bytes)
)
```

# OneNote Router — Page-to-Product Classification

> **Global service.** Runs in parallel with per-product extraction — does NOT block anything.
> Rules reference: `../shared-rules.md`

---

## Purpose

OneNote 团队笔记本的页面并不按产品域组织。例如 `MCVKB/VM+SCIM/` 下混合了 VM、AKS、Monitor、Storage 等多个产品的排查笔记，`MCVKB/Mooncake Triage/` 更是每次会议覆盖所有产品。

Router 的职责是：**确定每个 OneNote 页面属于哪些产品域**，产出分类索引，供各产品的 OneNote source adapter 消费。

Router 是**非阻塞全局服务**——各产品的 source adapter 通过 Channel 1（Path Matching）可以立即开始工作，不需要等 Router 完成。Router 的分类结果通过 Channel 2 逐步补充高召回率的页面。

---

## Output

路径：`.claude/skills/products/page-routing.jsonl`

每行一个已分类的页面：

```json
{"path": "MCVKB/VM+SCIM/=======2. VM/Boot Diag Failure.md", "products": ["vm"], "confidence": "high", "layer": 1, "routedAt": "2026-04-19"}
{"path": "MCVKB/Mooncake Triage/1.3 FY25 Dec.md", "products": ["intune", "vm", "aks"], "confidence": "medium", "layer": 3, "routedAt": "2026-04-19"}
{"path": "MCVKB/General/Team Outing Plan.md", "products": [], "confidence": "high", "layer": 2, "routedAt": "2026-04-19"}
```

| 字段 | 说明 |
|------|------|
| `path` | 相对于 `ONENOTE_DIR` 的 Markdown 文件路径 |
| `products` | 产品 ID 数组（0-N 个），空数组 = 非技术内容 |
| `confidence` | `high`（Layer 1 路径匹配或 Layer 3 明确判断）、`medium`（多产品或 keyword 模糊匹配） |
| `layer` | 分类所用层级：`1` = Path Matching, `2` = Keyword Matching, `3` = LLM Classification |
| `routedAt` | 分类日期 `YYYY-MM-DD` |

---

## Three-Layer Classification

### Layer 1: Path Matching（~60% of pages, zero cost）

根据 `playbooks/product-registry.json → podProducts[*]` 的 `onenoteSection`、`mcvkbSection`、`extraSections` 字段做 glob 匹配。路径匹配是确定性的，无需任何 LLM 调用。

**Registry 路径示例**（实际运行时从 registry 读取，不要硬编码）：

| 产品 | onenoteSection | mcvkbSection | extraSections |
|------|---------------|-------------|---------------|
| `vm` | `VM+SCIM/=======2. VM*` | `VM+SCIM/=======2. VM*` | `["VM+SCIM/=======3. Linux*", "VM+SCIM/=======5. Image*"]` |
| `aks` | `VM+SCIM/=======18. AKS*` | `VM+SCIM/=======18. AKS*` | — |
| `intune` | `Intune/` | — | — |
| `monitor` | `VM+SCIM/=======10. Monitor*` | `VM+SCIM/=======10. Monitor*` | — |
| `disk` | `VM+SCIM/=======6. Storage*` | `VM+SCIM/=======6. Storage*` | — |
| `arm` | `VM+SCIM/=======14. PORTAL*ARM*` | `VM+SCIM/=======14. PORTAL*ARM*` | — |
| `avd` | `VM+SCIM/=======9. AVD*` | `VM+SCIM/=======9. AVD*` | — |
| `entra-id` | `VM+SCIM/=======11. AAD*` | `VM+SCIM/=======11. AAD*` | — |
| `purview` | `M365 Purivew Compliance/` | — | — |
| `eop` | `M365 MDO EOP/` | — | — |
| `defender` | `Microsoft Defender for Cloud/` | `VM+SCIM/======22.Security======` | `["Sentinel/"]` |
| `automation` | `AUTOMATION/` | `VM+SCIM/======16. Automation======` | `["Azure Update Manager/"]` |
| `networking` | — | `Net/` | — |

**匹配逻辑**：

```python
from fnmatch import fnmatch

def layer1_classify(page_path, registry):
    """对每个页面尝试 path matching，返回匹配的产品列表"""
    matched_products = []
    # page_path 格式: "MCVKB/VM+SCIM/=======2. VM/Boot Diag.md"
    # 需要同时匹配两个笔记本前缀：
    #   - MCVKB/ 下的路径 → 匹配 mcvkbSection
    #   - Mooncake POD Support Notebook/ 下的路径 → 匹配 onenoteSection
    #   - 顶级 section（如 "Intune/", "AUTOMATION/"）→ 两个笔记本均可
    
    for product in registry['podProducts']:
        sections = []
        if product.get('onenoteSection'):
            sections.append(product['onenoteSection'])
        if product.get('mcvkbSection'):
            sections.append(product['mcvkbSection'])
        for extra in product.get('extraSections', []):
            sections.append(extra)
        
        # 去重 section patterns
        sections = list(set(sections))
        
        for pattern in sections:
            # 去掉笔记本前缀后匹配
            # e.g., page_rel = "VM+SCIM/=======2. VM/Boot Diag.md"
            #        pattern = "VM+SCIM/=======2. VM*"
            page_rel = strip_notebook_prefix(page_path)
            if fnmatch(page_rel, pattern + '**') or page_rel.startswith(pattern):
                matched_products.append(product['id'])
                break
    
    return matched_products  # 可能匹配 0 个或多个产品
```

- 匹配 ≥ 1 个产品 → `confidence: "high"`, `layer: 1`
- 匹配 0 个 → 传递给 Layer 2

### Layer 2: Keyword Matching（~20%, very low cost）

对 Layer 1 未命中的页面，用 registry 的 `matchKeywords` 做文本匹配。

**步骤**：
1. 读取页面 title（文件名去 `.md`）+ 文件内容前 500 字符
2. 转小写
3. 对每个产品的 `matchKeywords` 做 substring 匹配
4. 命中 ≥ 2 个 keyword → 归入该产品

```python
def layer2_classify(page_path, title, content_head, registry):
    text = (title + ' ' + content_head[:500]).lower()
    matched = []
    for product in registry['podProducts']:
        keywords = [k.lower() for k in product.get('matchKeywords', [])]
        hits = sum(1 for kw in keywords if kw in text)
        if hits >= 2:
            matched.append(product['id'])
    return matched
```

- 命中 ≥ 1 个产品 → `confidence: "medium"`, `layer: 2`（keyword 匹配有误判可能，降低置信度）
- 命中 0 个 → 传递给 Layer 3

### Layer 3: LLM Classification（~20%, high cost）

对 Layer 1 和 Layer 2 均未命中的页面，读取内容由 LLM 判断。

**步骤**：
1. 读取文件内容（> 3000 字符截取前 3000）
2. LLM 分析：这个页面涉及哪些产品域？

**产品 ID 列表**（从 registry 动态读取）：
`intune`, `vm`, `aks`, `monitor`, `entra-id`, `networking`, `disk`, `acr`, `arm`, `avd`, `purview`, `eop`, `defender`, `automation`

**LLM 判断依据**：
- 页面内容涉及的 Azure 服务名（对照 `podProducts[*].services`）
- 排查的问题域（如 enrollment 相关 → `intune`，NSG 相关 → `networking`）
- 一个页面可以同时属于多个产品（如 Triage 会议记录、跨产品 TSG）
- 纯流程/人员/会议安排等非技术页面 → `products: []`（不属于任何产品）

- `products` 非空 → `confidence: "high"`, `layer: 3`
- `products` 为空 → `confidence: "high"`, `layer: 3`（明确判断为非技术内容）

---

## Orchestrator Integration

### 状态位

Router 状态存储在 `enrich-state.json → router`（全局，不属于任何产品）。

Orchestrator 在每个 tick 中可以选择 spawn Router agent。Router 与 per-product source adapter **完全并行**，互不阻塞：
- Source adapter Channel 1（Path Matching）不依赖 Router
- Source adapter Channel 2 消费 Router 已产出的 `page-routing.jsonl`，Router 产出越多，Channel 2 覆盖越广

### Tick 处理量

每 tick 处理 30 个页面：
- **20 个 fast**（Layer 1 + Layer 2）：零或极低 LLM 成本
- **10 个 LLM**（Layer 3）：需要读内容 + LLM 判断

Layer 1 和 Layer 2 先批量处理所有待分类页面中的 fast-path，exhausted 后再进入 Layer 3。

### Spawn 条件

Orchestrator 在以下条件下 spawn Router agent：
1. `router.status !== "exhausted"` — Router 还有未分类页面
2. 当前 tick 的 agent 配额未满

---

## State

`enrich-state.json → router`：

```json
{
  "router": {
    "status": "pending|scanning|exhausted",
    "totalPages": 0,
    "routedPages": 0,
    "byLayer": { "1": 0, "2": 0, "3": 0 },
    "byProduct": {},
    "lastTickAt": null
  }
}
```

| 字段 | 说明 |
|------|------|
| `status` | `pending`（未开始）、`scanning`（进行中）、`exhausted`（所有页面已分类） |
| `totalPages` | 团队笔记本中 `.md` 文件总数 |
| `routedPages` | 已分类页面数 |
| `byLayer` | 各层级分类的页面数 |
| `byProduct` | 各产品命中的页面数（如 `{"vm": 120, "aks": 45, ...}`） |
| `lastTickAt` | 最后一次 tick 时间戳 |

### 初始化（首次运行）

1. 读取 `config.json → onenote.teamNotebooks` 获取合法笔记本列表
2. 遍历每个团队笔记本目录，列出所有 `.md` 文件
3. 将完整文件列表写入 `.claude/skills/products/page-list.txt`（一行一个路径，相对于 ONENOTE_DIR）
4. 设 `router.totalPages = len(page-list.txt)`
5. 设 `router.status = "scanning"`
6. 如果 `page-routing.jsonl` 已存在，读取已分类路径集合，从待处理列表中排除

---

## Incremental Behavior

当 OneNote Export 发生同步更新时，Orchestrator 的 Pre-flight 阶段会产出 `onenote-changes.json`：

```json
{
  "changedFiles": ["MCVKB/VM+SCIM/.../page.md", ...],
  "newFiles": ["MCVKB/VM+SCIM/.../new-page.md", ...],
  "deletedFiles": ["MCVKB/Intune/old-page.md", ...],
  "detectedAt": "2026-04-19T10:00:00+08:00"
}
```

Router 增量处理逻辑：

1. **`newFiles`**：追加到 `page-list.txt`，标记为待分类。Router `status` 从 `exhausted` 回退到 `scanning`
2. **`changedFiles`**：从 `page-routing.jsonl` 中删除对应条目（重新分类，因为内容变化可能导致产品归属变化）。追加到待分类列表
3. **`deletedFiles`**：从 `page-routing.jsonl` 和 `page-list.txt` 中移除。`totalPages` 递减
4. 更新 `router.routedPages` 为 `page-routing.jsonl` 当前行数

---

## Agent Spawn Template

```
Agent(
  description: "OneNote Router — classify {batchSize} pages",
  run_in_background: true,
  prompt: |
    任务: OneNote Page-to-Product Router
    项目根: {PROJECT_ROOT}
    
    你是 OneNote Router，负责将 OneNote 页面分类到产品域。
    
    ⚠️ 写文件必须用 Bash + python3 -c，禁止用 Write 工具（缓存 bug）。
    ⚠️ 文件写入规则详见 .claude/skills/product-learn/shared-rules.md § File Write Rules
    
    关键文件:
    - page-list.txt: .claude/skills/products/page-list.txt（全量页面列表）
    - page-routing.jsonl: .claude/skills/products/page-routing.jsonl（分类结果，append）
    - product-registry.json: playbooks/product-registry.json（产品定义 + 路径映射 + keywords）
    - enrich-state.json: .claude/skills/products/enrich-state.json（router 状态）
    - OneNote 目录: {ONENOTE_DIR}
    
    三层分类逻辑:
    1. Layer 1 (Path Matching): 用 registry 的 onenoteSection/mcvkbSection/extraSections glob 匹配。零成本。
    2. Layer 2 (Keyword Matching): 读标题 + 前 500 字符，匹配 registry.matchKeywords（≥2 命中）。极低成本。
    3. Layer 3 (LLM Classification): 读内容（截取 3000 字符），LLM 判断产品域。高成本。
    
    处理策略:
    - 优先消耗 Layer 1 + Layer 2 的 fast-path 页面（本 tick 最多 20 个）
    - 剩余配额给 Layer 3（本 tick 最多 10 个）
    - 从 page-list.txt 取下一批待分类页面（跳过已在 page-routing.jsonl 中的）
    
    每个分类结果 append 到 page-routing.jsonl:
    {"path":"...","products":[...],"confidence":"high|medium","layer":1|2|3,"routedAt":"YYYY-MM-DD"}
    
    完成后更新 enrich-state.json → router:
    - routedPages += 本轮分类数
    - byLayer.{1|2|3} += 对应层级数
    - byProduct.{productId} += 对应产品数
    - 所有页面处理完 → status = "exhausted"
    - lastTickAt = 当前时间
    
    返回:
    1. classified: 本轮分类页面数
    2. byLayer: {"1": N, "2": N, "3": N}
    3. byProduct: {"vm": N, "aks": N, ...}
    4. exhausted: true/false
    5. 简要摘要 (<500 bytes)
)
```

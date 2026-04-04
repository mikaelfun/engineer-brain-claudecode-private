# Product-Learn Auto-Enrich v2 — Design Specification

**Date:** 2026-04-04
**Status:** Draft
**Author:** Brainstorming session (Kun Fang + Claude)

## 1. Problem Statement

当前 product-learn auto-enrich v1 存在以下问题：

1. **无法穷尽扫描** — maxCycles=3 × top N 固定，搜索结果不稳定时重复扫描相同页面或遗漏页面
2. **输出格式单一** — 只有散装 JSONL 三元组，troubleshooter 需要逐行扫描匹配，效率低
3. **多源知识未整合** — 同一个问题可能在 OneNote、ADO Wiki、MS Learn 各有一条，但不合并
4. **无增量更新** — 没有与 onenote-export sync 联动，每次都从头扫
5. **质量无门槛** — LLM 提取到什么就写什么，半成品 TSG 也会进入知识库
6. **产品范围固定** — 硬编码 12 个产品，未按 POD 服务列表动态管理

## 2. Design Goals

- **穷尽覆盖**：每个产品的每个知识源页面最终都被扫描到
- **知识整合**：多源 TSG 按主题聚类，生成综合排查指南
- **来源追溯**：指南内联来源标注（可点击链接），JSONL 保留审计记录
- **增量维护**：OneNote sync 后自动重扫变更页面，更新受影响指南
- **质量分层**：写入宽松（保留原始数据），综合严格（过滤低质量）
- **消费高效**：troubleshooter 按主题读一篇指南，而非扫几百行 JSONL

## 3. Architecture

### 3.1 三阶段 Pipeline

```
EXTRACT（穷尽扫描）
  所有源 → scanned-sources.json 去重 → JSONL 原始条目
  ↓
SYNTHESIZE（综合生成）
  JSONL 按主题聚类 → guides/{topic}.md 综合排查指南 + _index.md
  ↓
REFRESH（增量维护）
  OneNote sync 钩子 → 检测变更文件 → 只重扫变更页面 → 更新受影响指南
```

### 3.2 数据源（按优先级）

| # | 数据源 | 类型 | 特征 |
|---|--------|------|------|
| 1 | OneNote 团队 Notebook（MCVKB + POD） | 本地 Markdown | 内容最丰富，21V 特有知识，可增量检测 |
| 2 | ADO Wiki（Support-Ability 等） | ADO API | TSG 质量较高，更新频率低 |
| 3 | Microsoft Learn | msft-learn MCP | 官方文档，结构化好，global 视角 |
| 4 | 21V Feature Gap 文件 | 本地 Markdown | POD notebook 中的 feature gap 列表 |
| 5 | Content Idea KB（v2.1） | ADO Work Items | 内部 KB，质量参差不齐，待探索可行性 |
| 6 | Case 复盘（独立入口） | 本地 case 数据 | 实战积累，不纳入 auto-enrich pipeline |

### 3.3 输出结构

```
skills/products/{product}/
  ├── known-issues.jsonl          # 原始层：每条标 sourceRef + quality + date
  ├── scanned-sources.json        # 已扫描页面清单（路径/URL）
  ├── guides/                     # 综合层：按主题分文件
  │   ├── allocation-failure.md   # 综合排查指南
  │   ├── boot-diagnostics.md
  │   ├── ...
  │   └── _index.md               # 主题索引（troubleshooter 入口）
  ├── 21v-gaps.json               # 21V 不支持功能缓存（30 天 TTL）
  ├── synthesize-log.md           # 综合审计：保留/丢弃的条目 + 原因
  └── evolution-log.md            # 变更审计日志
```

### 3.4 known-issues.jsonl 条目格式

```json
{
  "id": "vm-005",
  "date": "2026-04-04",
  "symptom": "Portal 报 AllocationFailed",
  "rootCause": "区域无可用硬件",
  "solution": "更换 VM Size 或区域",
  "source": "onenote",
  "sourceRef": "MCVKB/VM+SCIM/.../AllocationFailed.md",
  "sourceUrl": null,
  "product": "vm",
  "confidence": "high",
  "quality": "raw",
  "tags": ["allocation", "capacity"],
  "21vApplicable": true,
  "promoted": false,
  "guideRef": "allocation-failure.md"
}
```

### 3.5 综合排查指南格式

```markdown
# VM 分配失败 — 综合排查指南

**来源数**: 5 条 JSONL 条目合并
**置信度**: high | **21V 适用**: 部分（见标注）
**最后更新**: 2026-04-04

## 症状
- Portal 报 AllocationFailed
- VMSS scale out 超时
  > 来源: [MCVKB/.../AllocationFailed.md](相对路径) | [MS Learn](https://learn.microsoft.com/...)

## 根因分类
1. **硬件容量不足** — 区域/可用区无可用硬件
   > 来源: [MCVKB/.../AllocationFailed.md](相对路径)
2. **约束冲突** — 可用集/邻近放置组限制
   > 来源: [ADO Wiki](https://dev.azure.com/.../TSG-001)
3. **配额超限** — vCPU/NIC 配额不够
   > 来源: [MS Learn](https://learn.microsoft.com/...)

## 排查步骤
1. 检查 Activity Log 中的错误码
2. Kusto 查询 `AllocationTable` 确认具体失败原因
   ⚠️ **21V 不支持**: Availability Zone
3. ...

## 解决方案
- 方案 A: 更换 VM Size / 区域
- 方案 B: 移除约束（可用集/邻近放置组）
- 方案 C: 申请配额提升
```

## 4. EXTRACT 阶段详细设计

### 4.1 扫描控制

- 每个 tick 处理 **1 个产品的 1 个数据源**（与 v1 一致）
- 每个 tick 最多读取 **10 个未扫描页面**
- 单个文件超 5000 字只取前 3000 字提取
- 每个 tick 目标 **< 5 分钟**
- 用 `/loop 5m /product-learn auto-enrich` 持续运行

### 4.2 scanned-sources.json

```json
{
  "onenote": [
    "MCVKB/VM+SCIM/.../page1.md",
    "MCVKB/VM+SCIM/.../page2.md"
  ],
  "ado-wiki": [
    "Support-Ability:/VM/TSG-allocation-failure"
  ],
  "mslearn": [
    "https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/..."
  ]
}
```

**扫描流程：**
1. 列出所有候选页面（find/search）
2. 读 `scanned-sources.json`，过滤已扫描的
3. 剩余候选中取 top N（按新鲜度/相关度排序）
4. 处理 → 提取 JSONL 条目 → append
5. 将本次扫描的页面路径/URL append 到 `scanned-sources.json`
6. 剩余候选 = 0 → 该数据源标记 `exhausted`

**终止条件：** 所有数据源都 exhausted → 该产品标记 `extracted`，进入 SYNTHESIZE

### 4.3 数据源细节

#### OneNote（团队 Notebook）
- 目录映射：从 `config.json → podProducts` 获取 OneNote section 路径
- 新鲜度过滤：2 年内 high，2-4 年 medium，4 年+ 跳过（除非文件名含 TSG/guide）
- 按 modified 时间倒排

#### ADO Wiki
- 搜索：`pwsh -NoProfile -File scripts/ado-search.ps1 -Type wiki -Query "{product} troubleshooting" -Top 20`
- 单页超长截断到 3000 字
- 每 tick 最多处理 8 个新页面

#### Microsoft Learn
- 搜索：`mcp__msft-learn__microsoft_docs_search(query: "Azure {product} troubleshoot")`
- Fetch 完整页面：`mcp__msft-learn__microsoft_docs_fetch(url: ...)`
- 每 tick 最多处理 8 个新 URL

#### 21V Feature Gap
- 独立 phase，有 30 天 TTL 缓存
- 天然幂等，不需要 scanned-sources 机制

### 4.4 去重

写入前检查 `known-issues.jsonl`：
- symptom + rootCause 关键词重叠 ≥ 80% → 跳过
- 重叠 50-80% → append with `relatedTo: "{existing-id}"`
- 重叠 < 50% → 直接 append

## 5. SYNTHESIZE 阶段详细设计

### 5.1 触发条件

产品所有数据源 exhausted 后自动触发。也可手动：`/product-learn synthesize {product}`

### 5.2 流程

1. 读取该产品的所有 `known-issues.jsonl` 条目
2. **LLM 主题聚类**：按 symptom 语义相似度分组（如 "allocation failure"、"boot failure"、"disk attach"）
3. **质量过滤**：
   - 丢弃：只有 symptom 没有 rootCause 和 solution 的条目（半成品）
   - 丢弃：4 年+ 且无 case 验证的条目（过时风险高）
   - 保留但标注低置信度：只有单一来源的条目
4. **合并生成**：每个主题生成一篇 `guides/{topic-slug}.md`
   - 合并多个来源的 symptom/rootCause/solution
   - 内联来源标注（路径/URL）
   - 标注 21V 不适用的部分（对照 21v-gaps.json）
5. **生成 `guides/_index.md`**：主题索引，列出所有指南 + 关键词
6. **写审计日志 `synthesize-log.md`**：
   - 保留的条目：ID + 原因
   - 丢弃的条目：ID + 原因（如 "incomplete: no solution"）
   - 合并的条目：哪些 ID 合并成了哪篇指南

### 5.3 guides/_index.md 格式

```markdown
# VM 排查指南索引

| 指南 | 关键词 | 来源数 | 置信度 |
|------|--------|--------|--------|
| [allocation-failure.md](./allocation-failure.md) | AllocationFailed, capacity, quota | 5 | high |
| [boot-diagnostics.md](./boot-diagnostics.md) | boot failure, OS provisioning | 3 | high |
| [disk-attach.md](./disk-attach.md) | disk attach failed, LUN limit | 2 | medium |
```

Troubleshooter Step 1.5 读这个 _index.md，用症状关键词匹配最相关的 1-2 篇指南。

## 6. REFRESH 阶段详细设计

### 6.1 触发方式

**钩子模式**：`onenote-export` sync 团队 notebook 完成后，输出 `changedFiles[]`。auto-enrich 检查：

```
changedFiles.filter(f => 
  f 属于某个产品的 OneNote 目录映射
  && f 在该产品的 scanned-sources.json 中
)
```

有匹配 → 该产品的 EXTRACT 标记为 `partial`（只处理变更页面），完成后重跑 SYNTHESIZE。

### 6.2 个人笔记排除

只有 `config.json → onenote.teamNotebooks[]` 中的 notebook 变更才触发 refresh。个人笔记不作为 auto-enrich 来源。

### 6.3 ADO Wiki 和 MS Learn

更新频率低，不做自动增量检测。用户可手动触发 `/product-learn auto-enrich` 重扫（reset scanned-sources 中对应 phase）。

## 7. Troubleshooter 消费方式

### 修改 troubleshooter.md

在 Step 1（理解问题）和 Step 2（Kusto 查询）之间插入：

```
### 1.5. 查产品知识库

1. 读 skills/products/{product}/guides/_index.md
2. 根据 Step 1 理解到的症状关键词，匹配最相关的 1-2 篇指南
3. 读取匹配的指南：
   - 获得预构建的排查路径（跳过搜索阶段）
   - 获得已知根因列表（缩小 Kusto 查询范围）
   - 获得 21V 不适用标注（避免建议不支持的功能）
4. 如果命中 → 排查效率大幅提升
5. 如果未命中 → 走正常搜索流程：onenote → ado wiki → mslearn → kusto queries
   搜索汇总后才确定具体排查方法、Kusto 查询、向客户获取的关键证据
```

## 8. 产品范围

### 8.1 POD 服务列表

产品范围根据 Support Topic List（OneNote）中 **VM+SCIM POD** 的服务列表动态管理：

```json
// config.json
{
  "pod": "VM+SCIM",
  "podProducts": [
    {"id": "vm", "services": ["Virtual Machine running Windows", "Virtual Machine running Linux", "Virtual Machine Scale Sets", "Azure Dedicated Host"]},
    {"id": "aks", "services": ["Azure Kubernetes Service"]},
    {"id": "monitor", "services": ["Monitor", "Alerts", "Log Analytics", "Managed Grafana"]},
    {"id": "entra-id", "services": ["Azure Active Directory (Entra)", "O365 Identity"]},
    {"id": "intune", "services": ["Intune"]},
    {"id": "acr", "services": ["Azure Container Registry/Instance"]},
    {"id": "arm", "services": ["Management Portal", "Azure Arc enabled servers/K8S"]},
    {"id": "avd", "services": ["Azure Virtual Desktop"]},
    {"id": "disk", "services": ["Storage (IaaS)", "Azure Data Box"]},
    {"id": "networking", "services": []},
    {"id": "purview", "services": ["Purview Information Protection", "Microsoft Purview compliance"]},
    {"id": "eop", "services": ["EOP, Defender for M365"]},
    {"id": "defender", "services": ["Defender for Cloud", "Azure Sentinel"]},
    {"id": "automation", "services": ["Automation", "Azure Update Manager"]}
  ]
}
```

> 注：networking 产品属于 Net POD，但 VM+SCIM 也会接触到相关 case，保留。

### 8.2 产品扫描优先级

```
intune → vm → aks → monitor → entra-id → networking → disk → acr → arm → avd → purview → eop → defender → automation
```

## 9. 状态管理

### enrich-state.json

```json
{
  "status": "running",
  "currentProduct": "vm",
  "currentSource": "onenote",
  "productQueue": ["aks", "monitor", ...],
  "completedProducts": ["intune"],
  "productStates": {
    "intune": {
      "onenote": "exhausted",
      "ado-wiki": "exhausted",
      "mslearn": "exhausted",
      "21v-gap": "cached",
      "synthesized": true
    },
    "vm": {
      "onenote": "scanning",
      "ado-wiki": "pending",
      "mslearn": "pending",
      "21v-gap": "pending",
      "synthesized": false
    }
  },
  "stats": {
    "totalDiscovered": 0,
    "totalDeduplicated": 0,
    "bySource": {"onenote": 0, "ado-wiki": 0, "mslearn": 0},
    "byProduct": {}
  }
}
```

### 终止条件

- 所有产品的所有数据源都 `exhausted` + `synthesized: true` → `status: "complete"`
- 没有固定 maxCycles——穷尽就停

## 10. Content Idea KB（v2.1 — 待探索）

### 可行性探索步骤

1. 用 `az boards query` 列出 ContentIdea project 的 KB 类型 work items
2. 检查 work item 字段中是否有 KB URL / 产品标签
3. 如果可穷举 → 加为第 5 个数据源
4. 需做产品筛查：每个 KB 的产品标签可能不准确，需 LLM 判断

### 暂不实现的原因

- az devops extension 刚装好，API 探索需要时间
- KB 质量参差不齐，需要更强的质量过滤
- 不阻塞 v2 主体开发

## 11. 错误处理

| 场景 | 处理 |
|------|------|
| OneNote 目录不存在 | 跳过该数据源，记录 warning |
| ADO 搜索失败 | 记录 error，标记该数据源 `error`，不阻塞其他 |
| msft-learn MCP 不可用 | 跳过 mslearn 数据源 |
| LLM 提取 0 个三元组 | 正常，记录 "no knowledge extracted"，页面仍标记已扫描 |
| SYNTHESIZE 聚类失败 | 降级为按来源分组（不合并） |
| scanned-sources.json 损坏 | 重建：从 known-issues.jsonl 的 sourceRef 恢复 |

## 12. 与现有系统的交互

| 系统 | 交互方式 |
|------|---------|
| troubleshooter | 读 `guides/_index.md` + 匹配指南（Step 1.5） |
| challenger | 读 `known-issues.jsonl` 作为中等可信度证据源 |
| onenote-export | sync 后输出 changedFiles → 触发 REFRESH |
| case-review | 独立入口，写入 JSONL（source: "case"），触发 SYNTHESIZE |
| promote | 从指南中提取核心内容 → 更新 SKILL.md 决策树 |

## 13. 涉及文件变更清单

| 文件 | 变更类型 | 说明 |
|------|---------|------|
| `.claude/skills/product-learn/SKILL.md` | 重写 | 新增 synthesize 子命令 |
| `.claude/skills/product-learn/modes/auto-enrich.md` | 重写 | 3 阶段 pipeline |
| `.claude/agents/troubleshooter.md` | 修改 | 加 Step 1.5 |
| `.claude/agents/knowledge-enricher.md` | 修改 | 适配新 pipeline |
| `config.json` | 修改 | 加 `pod` + `podProducts` |
| `skills/products/enrich-state.json` | 重写 | 新 schema |
| `skills/products/{product}/` | 新增 | `guides/` 目录 + `scanned-sources.json` |

---

_Generated by Brainstorming session. Review and edit as needed._

## 14. 版本路线图

| 版本 | 范围 | 状态 |
|------|------|------|
| **v2.0** | 3 阶段 Pipeline (EXTRACT → SYNTHESIZE → REFRESH) + 双层输出 + scanned-sources 去重 + OneNote sync 钩子 + troubleshooter Step 1.5 | 本 spec |
| **v2.1** | Content Idea KB 数据源 — ADO work items 穷举 + KB URL 读取 + 产品筛查 | 待探索 |
| **v2.2** | Case 复盘自动化 — owa-email-search 周期性拉取 → 增量邮件分析 → 判断 resolved + 提取通用解决方案 → 融合进 pipeline | 待设计 |
| **v2.3** | Dashboard 知识库可视化 — 每个产品的指南列表 + 覆盖率统计 + 手动触发扫描/综合 | 待设计 |

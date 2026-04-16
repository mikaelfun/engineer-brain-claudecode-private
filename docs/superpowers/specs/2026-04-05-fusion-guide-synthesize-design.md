# Fusion Guide Synthesize Pipeline Design

**Date**: 2026-04-05
**Status**: Draft
**Scope**: SYNTHESIZE 管线升级 — 深度融合 draft + Kusto skill + 三元组

---

## 1. 问题定义

当前合成管线（SYNTHESIZE）只做了三元组的聚类和排版：
- `guides/{topic}.md`（速查表）= 三元组的表格排列
- `guides/details/{topic}.md`（详情版）= 三元组的逐条展开

**高价值内容被遗漏**：
- `guides/drafts/` 中 164 个 draft 文件（完整排查步骤、Kusto 查询模板、决策树）只以一行引用 `"见排查指南: guides/drafts/xxx.md"` 出现在 details/ 中
- `skills/kusto/{product}/references/queries/` 中的排查工作流和 KQL 模板完全未被纳入
- VM 产品：721 JSONL 条目中 116 条 guide-draft (16%)，19 个 Kusto query 文件 (3593 行)

**结果**：troubleshooter 读到速查表后无法直接获得可操作的排查流程，需要额外跳转多个文件。

## 2. 设计决策

| 维度 | 选择 | 理由 |
|------|------|------|
| Guide 形态 | **融合型** | details/ 按主题组织，先排查流程后三元组速查 |
| 融合方式 | **深度 LLM 融合** | 多 draft + Kusto 交叉编织为统一排查流程 |
| Agent 架构 | **双 Agent 分工** | Agent-A 速查表 / Agent-B 融合详情 |
| 大 topic 处理 | **Map-Reduce** | Agent-B spawn sub-agent 分块提取，自己融合 |
| sub-agent 接口 | **JSON 结构化** | 固定 schema 的 extract.json |
| Kusto 融入 | **深度融入排查流程** | KQL 直接嵌入排查步骤 |
| Kusto 评分 | **工具层不评分** | KQL 是「怎么查」不参与证据链评分 |
| Kusto skill 未来 | **轻量化 + fallback** | 保留集群配置+schema，query 标记 deprecated |
| Troubleshooter 消费 | **索引引导跳转** | _index.md 标记类型，精准加载 |

## 3. 输入来源体系

### 3.1 证据层（参与评分）

| 优先级 | 来源 | 权重 | 角色 |
|--------|------|------|------|
| 1 | OneNote 团队知识库 | 5 | 一线排查经验，Mooncake 专属 |
| 2 | ADO Wiki TSG | 4 | 产品组标准 TSG |
| 3 | ContentIdea KB | 3 | 已发布 KB 文章 |
| 4 | MS Learn 文档 | 2 | 官方通用文档 |
| 5 | Case 复盘 | 1 | 实际案例验证 |

### 3.2 工具层（不参与评分）

| 来源 | 角色 | 评分规则 |
|------|------|---------|
| Kusto skill query 文件 | 提供 KQL 模板和排查工作流 | 不参与来源质量评分 |
| | | 如与证据层描述同一场景 → 验证强度维度 +1 |

**定位原则**：KQL 回答「怎么查」，证据层回答「结论是什么」。Kusto skill 来自团队个人文件汇集，有参考价值但非第一可信来源。

## 4. 架构设计

### 4.1 整体流程

```
Phase 1（聚类 agent，1 个，串行）
  输入：
    - known-issues.jsonl 全量条目
    - guides/drafts/*.md 文件名 + frontmatter
    - skills/kusto/{product}/references/queries/*.md 文件名 + frontmatter
  输出：topic-plan.json（含 draftPaths + kustoQueryFiles）

Phase 2（生成 agents，N 组并行）
  每个 topic spawn：
    - Agent-A：速查表生成（只读三元组）
    - Agent-B：融合详情生成（三元组 + draft + Kusto query）
      └─ 大 topic 时 spawn sub-agents（Map-Reduce）
```

### 4.2 topic-plan.json 新格式

```json
{
  "product": "vm",
  "generatedAt": "2026-04-06",
  "topics": [
    {
      "slug": "vm-start-stop",
      "title": "VM 启停与可用性",
      "entryIds": ["vm-040", "vm-041", "vm-042"],
      "draftPaths": [
        "guides/drafts/onenote-service-healing-tsg.md",
        "guides/drafts/ado-wiki-unexpected-reboot.md"
      ],
      "kustoQueryFiles": [
        "service-healing.md",
        "vm-operations.md",
        "vma-analysis.md"
      ],
      "hasFusionGuide": true,
      "keywords": ["restart", "service-healing", "availability"]
    }
  ],
  "discarded": [...]
}
```

新增字段：
- `draftPaths`: 聚类时从 JSONL `solution` 字段中提取的 draft 文件引用
- `kustoQueryFiles`: 聚类时按 query 文件 frontmatter 的 name/description 语义匹配的 Kusto query 文件名
- `hasFusionGuide`: `draftPaths` 或 `kustoQueryFiles` 非空即为 true

### 4.3 Agent-A（速查表生成）— 不变

与现有逻辑一致，只读三元组，输出 `guides/{topic}.md`。

唯一改动：有 `hasFusionGuide: true` 的条目在速查表中标记 `📋`，底部加：
```markdown
> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/{topic}.md#排查流程)
```

### 4.4 Agent-B（融合详情生成）

#### 小 topic 路径（≤8 个 draft + Kusto 文件）

Agent-B 直接读取所有输入，一次性融合生成。

```
输入：
  1. 三元组（从 JSONL 按 entryIds 提取）
  2. Draft 全文（按 draftPaths 逐个读取）
  3. Kusto query 文件全文（按 kustoQueryFiles 逐个读取）
输出：
  guides/details/{topic}.md
```

#### 大 topic 路径（>8 个文件）— Map-Reduce

```
Agent-B (编排器 + 融合者)
  ├─ 评估: len(draftPaths) + len(kustoQueryFiles) > 8
  ├─ Map 阶段: spawn sub-agents（每个读 3-5 个文件）
  │    ├─ sub-1: drafts 1-4 → extract-1.json
  │    ├─ sub-2: drafts 5-8 → extract-2.json
  │    ├─ sub-3: drafts 9-12 → extract-3.json
  │    └─ sub-4: kusto queries → extract-4.json
  │         （所有 sub-agent 并行执行）
  │
  └─ Reduce 阶段: Agent-B 读取所有 extract-*.json + 三元组
       → 融合生成 details/{topic}.md
```

**分批规则**：
- Draft 文件：每 4 个一批
- Kusto query 文件：所有 query 文件归一个 sub-agent（通常 1-3 个）
- 如果 Kusto query 文件也超过 5 个：拆为每 3 个一批

**Sub-agent 模型**：继承父级 Opus 模型（1M context）

### 4.5 Sub-agent 提取接口（extract.json schema）

```json
{
  "sourceFile": "onenote-backup-dos-limits-investigation.md",
  "sourceType": "draft | kusto-query",
  "originalSource": "onenote",
  "importDate": "2026-04-04",
  "summary": "Azure Backup/Site Recovery DoS limit 排查，含 Soft/Hard limit 判断和 Kusto 查询",
  "steps": [
    {
      "id": "s1",
      "title": "获取 ARM Correlation ID",
      "content": "从 Azure Portal 操作日志或错误详情中获取 Request ID",
      "kql": null,
      "cluster": null,
      "database": null
    },
    {
      "id": "s2",
      "title": "Kusto 查询 TraceLogMessage",
      "content": "用 ARM Correlation ID 查询操作详情",
      "kql": "TraceLogMessage\n| where TIMESTAMP > ago(24h)\n| where RequestId == \"{correlation_id}\"\n| project TIMESTAMP, Message, TaskId, SubscriptionId, RequestId",
      "cluster": "mabprodmc.kusto.chinacloudapi.cn",
      "database": "MABKustoProd"
    }
  ],
  "decisions": [
    {
      "condition": "判断 DoS limit 类型",
      "branches": [
        {"if": "Soft limit (操作频率限制)", "action": "等待 24 小时后自动重置"},
        {"if": "Hard limit (资源数量上限)", "action": "调整架构或提交支持请求"}
      ]
    }
  ],
  "references": [
    {
      "type": "table",
      "title": "DoS Limit 类型对照表",
      "content": "| 类型 | 描述 | 处理方式 |\n|------|------|--------|\n| Soft | 操作频率限制，24h 重置 | 等待 |\n| Hard | 资源数量上限 | 提工单 |"
    },
    {
      "type": "parameter",
      "title": "必要参数",
      "content": "subscription_id, correlation_id, time_range"
    }
  ],
  "warnings": [
    "Jarvis 路径在 21V 不可用，仅限 Kusto 查询"
  ]
}
```

**字段说明**：

| 字段 | 必填 | 说明 |
|------|------|------|
| `sourceFile` | 是 | 原始文件名 |
| `sourceType` | 是 | `draft` 或 `kusto-query` |
| `originalSource` | 是 | draft 的原始来源: `onenote`/`ado-wiki`/`mslearn` |
| `importDate` | 是 | 从 frontmatter 提取 |
| `summary` | 是 | 一句话描述该文件的内容主题 |
| `steps[]` | 是 | 排查步骤列表（按执行顺序） |
| `steps[].id` | 是 | 步骤 ID（s1, s2, ...） |
| `steps[].title` | 是 | 步骤标题 |
| `steps[].content` | 是 | 步骤描述 |
| `steps[].kql` | 否 | KQL 查询语句（完整，可直接复制执行） |
| `steps[].cluster` | 否 | Kusto 集群 URI |
| `steps[].database` | 否 | 数据库名 |
| `decisions[]` | 否 | 决策分支 |
| `references[]` | 否 | 参考表格、参数表、链接等 |
| `warnings[]` | 否 | 21V 限制、过时警告等 |

**extract.json 存储位置**：
```
skills/products/{product}/synthesize-temp/
  ├── {topic-slug}/
  │   ├── extract-draft-1.json
  │   ├── extract-draft-2.json
  │   └── extract-kusto-1.json
```

合成完成后该目录可清理（但建议保留，增量合成时复用）。

## 5. 融合输出格式

### 5.1 details/{topic}.md — 融合型

```markdown
# {Product} {Topic} — 综合排查指南

**条目数**: {N} | **草稿融合数**: {M} | **Kusto 查询融合**: {K}
**来源草稿**: [draft1.md], [draft2.md], ...
**Kusto 引用**: [query1.md], [query2.md], ...
**生成日期**: {date}

---

## 排查流程

### Phase 1: {阶段标题}
> 来源: {source1} + {source2}

1. {步骤描述}
   ```kusto
   {KQL 查询，完整可执行}
   ```
   `[工具: Kusto skill — {query-file}]`
   
2. {步骤描述}

**判断逻辑**：
| 条件 | 含义 | 后续动作 |
|------|------|---------|
| {condition1} | {meaning} | → Phase 2a |
| {condition2} | {meaning} | → Phase 2b |

`[结论: 🟢 9/10 — {评分理由}]`

### Phase 2a: {条件分支 A}
> 来源: {source}

...

### Phase 2b: {条件分支 B}
> 来源: {source}

...

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | ... | ... | ... | 🟢 9 | ... |
...（与现有三元组表格一致）
```

**融合规则**：
1. **排查流程优先**：从 draft 的排查步骤和 Kusto query 的工作流程中提取骨架
2. **KQL 完整嵌入**：从 Kusto query 文件中提取的 KQL 完整保留（含 cluster/database），标注 `[工具: Kusto skill]`
3. **证据标注**：每个结论/判断步骤标注来源评分（仅证据层参与）
4. **决策树结构化**：多个 draft 中的条件判断合并为表格或分支路径
5. **去重**：多个 draft 描述同一步骤的保留最完整版本，标注所有来源
6. **21V 标注**：涉及 Global-only 功能的步骤加 `⚠️ 21V 不可用` 警告

### 5.2 details/{topic}.md — 仅三元组型

无 draft 也无 Kusto query 匹配的 topic，details/ 格式与现有一致（三元组逐条展开），_index.md 标记为 `📊 速查`。

### 5.3 guides/{topic}.md — 速查表

与现有格式一致。新增：
- 有融合指南的条目标记 `📋`
- 底部提示跳转链接

### 5.4 _index.md

```markdown
# {Product} 排查指南索引

| 指南 | 类型 | Kusto | 关键词 | 来源数 | 置信度 |
|------|------|-------|--------|--------|--------|
| [启停与可用性](vm-start-stop.md) | 📋 融合 | 3 | service-healing, restart | 28 | high |
| [备份与恢复](vm-backup-restore.md) | 📋 融合 | 1 | backup, asr, recovery | 34 | high |
| [GPU](vm-gpu.md) | 📊 速查 | 0 | gpu, nvidia | 8 | medium |

最后更新: {date}
```

新增列：
- **类型**: `📋 融合` (hasFusionGuide=true) / `📊 速查` (hasFusionGuide=false)
- **Kusto**: 融合的 Kusto query 文件数量（0 = 无）

## 6. Troubleshooter 消费逻辑

### Step 1.5 改动

```
读 _index.md → 按症状关键词匹配 topic

if type == "📋 融合":
  → 读 details/{topic}.md
  → 定位「## 排查流程」section
  → 按 Phase 步骤执行排查
  → 如果 Kusto > 0：guide 中的 KQL 可直接使用，跳过 Step 2 中该场景的查询构建
  → 评分决定验证级别（🟢 直接采信 / 🔵 验证关键步骤 / 🟡 仅参考）
  
elif type == "📊 速查":
  → 读 guides/{topic}.md 速查表
  → 按症状匹配三元组（现有逻辑）
  → Step 2 正常构建 Kusto 查询

else (无匹配):
  → fallback 到完整 Kusto skill 流程
  → Step 3 知识库搜索
```

## 7. Kusto Skill 轻量化

### 融合完成后的 Kusto skill 目录结构

```
skills/kusto/{product}/
  ├── SKILL.md              → 保留：集群架构图、诊断层级、触发关键词
  ├── references/
  │   ├── kusto_clusters.csv    → 保留：集群 URI 列表
  │   ├── tables/               → 保留：表 schema 参考
  │   └── queries/
  │       ├── README.md         → 更新：加注 "KQL 已融入 product guide，此目录供 fallback"
  │       └── *.md              → 保留但标记 deprecated
```

**Query 文件 deprecated 标记**：
```yaml
---
name: service-healing
deprecated: true
fusedTo: "skills/products/vm/guides/details/vm-start-stop.md"
fusedAt: "2026-04-06"
---
```

**Troubleshooter fallback 逻辑**：
- 融合 guide 覆盖的场景 → 直接使用 guide 中的 KQL
- guide 未覆盖的场景 → 回退到 Kusto skill query 文件（即使标记 deprecated）
- 新场景（JSONL 中无对应条目）→ 完全走 Kusto skill 原有流程

## 8. Context 预算

### Agent-B 小 topic（直接处理）

| 来源 | 预算 |
|------|------|
| 三元组（~30 条 × 300 字符） | ~9K |
| Draft 全文（3-5 个 × 4K） | ~15-20K |
| Kusto query 文件（1-3 个 × 200 行） | ~10-15K |
| 输出 | ~8-12K |
| **合计** | **~45-55K** |

### Agent-B 大 topic（Map-Reduce）

**Sub-agent（Map 阶段）**：
| 输入 | 预算 |
|------|------|
| 3-5 个 draft 全文 | ~15-25K |
| 输出 extract.json | ~3-5K |
| **合计** | **~20-30K** |

**Agent-B（Reduce 阶段）**：
| 输入 | 预算 |
|------|------|
| 三元组（~30 条） | ~9K |
| extract-*.json（3-4 个） | ~15-20K |
| 输出 details/{topic}.md | ~10-15K |
| **合计** | **~35-45K** |

Opus 1M context 均安全。

### 阈值

| 维度 | 阈值 | 处理 |
|------|------|------|
| 文件数 ≤ 8 | 小 topic | Agent-B 直接读 |
| 文件数 > 8 | 大 topic | Agent-B spawn sub-agents |
| 单 draft > 500 行 | 超大 draft | 单独一个 sub-agent 处理 |
| sub-agent 批次 | 每批 3-5 个文件 | draft 按 4 个分批，Kusto query 按 3 个分批 |

## 9. 增量合成适配

现有增量合成逻辑（`synthesizeState` 跟踪）需要扩展：

### 新增条目触发

- 新增 ≥ 20 条 JSONL 条目 → 重新聚类 + 合成受影响的 topic
- 如果新条目的 `solution` 指向新的 draft 文件 → 该 topic 标记为需要重新融合
- 如果 Kusto skill 新增了 query 文件 → 重新聚类（可能影响 topic-kusto 映射）

### draft 变更触发

- `guides/drafts/` 下新增或修改文件 → 重新聚类受影响 topic
- 检查方法：对比 `synthesizeState.draftHashes`（新增字段，记录每个 draft 的 hash）

### Kusto skill 变更触发

- `skills/kusto/{product}/references/queries/` 下新增或修改文件 → 重新聚类
- 新增 query 文件（`deprecated` 字段不存在或为 false）→ 纳入下一次合成

## 10. 文件变更清单

### 新建文件

| 文件 | 内容 |
|------|------|
| `playbooks/schemas/extract-schema.json` | sub-agent 提取接口的 JSON Schema |

### 修改文件

| 文件 | 改动 |
|------|------|
| `.claude/skills/product-learn/modes/synthesize.md` | Phase 2 改为双 Agent + Map-Reduce；聚类输入新增 Kusto query 文件；topic-plan.json 新增字段；增量合成扩展 |
| `.claude/agents/troubleshooter.md` | Step 1.5 加载逻辑区分融合型/速查型；融合型直接用 guide 中 KQL |
| `skills/kusto/{product}/references/queries/README.md` | 加注 deprecated + fallback 说明 |

### 不变文件

| 文件 | 原因 |
|------|------|
| `skills/kusto/{product}/SKILL.md` | 保留完整，作为 fallback 入口 |
| `skills/kusto/{product}/references/kusto_clusters.csv` | 保留完整 |
| `skills/kusto/{product}/references/tables/` | 保留完整 |
| `guides/drafts/*.md` | 永远保留，不删不移 |

## 11. 风险与缓解

| 风险 | 概率 | 影响 | 缓解 |
|------|------|------|------|
| 聚类阶段 Kusto→topic 映射不准 | 中 | 部分 KQL 归到错误 topic | 聚类 agent 同时读 query frontmatter 的 description + tables 字段提升语义匹配 |
| 大 topic sub-agent 提取质量不一致 | 低 | extract.json 格式偏差 | 严格 JSON schema 校验，不合格重试 |
| 融合后 guide 过长（>5000 字） | 中 | troubleshooter 读取慢 | 排查流程 section 用 offset/limit 只读前半部分；三元组 section 按需读取 |
| Kusto skill 轻量化后新场景无覆盖 | 低 | troubleshooter fallback 到原 query 文件 | deprecated 标记 + fallback 机制确保不丢失 |

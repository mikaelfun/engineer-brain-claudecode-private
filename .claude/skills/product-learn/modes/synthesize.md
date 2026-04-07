# SYNTHESIZE — 融合指南生成（双 Agent + Map-Reduce）

> 本文件从 `auto-enrich.md` 拆分而来。
> 触发方式：`/product-learn synthesize {product}` 或 auto-enrich 流程自动触发。

## 触发条件

- **自动（全量）**：某产品全部 5 个 source 均 `"exhausted"` 后自动触发
- **自动（早期）**：某产品 `known-issues.jsonl` 条目数 ≥ 50 且至少 2 个 source 已 `"exhausted"` → 触发早期合成
  - 早期合成标记 `synthesized: "partial"`（区别于完整合成的 `true`）
  - 后续有新数据时可增量重新合成（覆盖已有指南）
- **手动**：`/product-learn synthesize {product}`

## 输入来源体系

### 证据层（参与评分）

| 优先级 | 来源 | 权重 | 角色 |
|--------|------|------|------|
| 1 | OneNote 团队知识库 | 5 | 一线排查经验，Mooncake 专属 |
| 2 | ADO Wiki TSG | 4 | 产品组标准 TSG |
| 3 | ContentIdea KB | 3 | 已发布 KB 文章 |
| 4 | MS Learn 文档 | 2 | 官方通用文档 |
| 5 | Case 复盘 | 1 | 实际案例验证 |

### 工具层（不参与评分）

| 来源 | 角色 | 说明 |
|------|------|------|
| Kusto skill query 文件 | 提供 KQL 模板和排查工作流 | 来自团队个人文件汇集，有参考价值但非第一可信来源 |

**定位**：KQL 回答「怎么查」（工具），证据层回答「结论是什么」（事实）。如果 Kusto query 文件描述的场景与证据层描述的场景一致 → 验证强度维度 +1。

## 并行架构

SYNTHESIZE 分两个阶段：

```
Phase 1（聚类 agent，1 个，串行）：
  读取全量 JSONL + draft 文件列表 + Kusto query 文件列表
  → LLM 聚类 → 输出 .enrich/topic-plan.json

Phase 2（每 topic 双 Agent 并行）：
  ┌── Agent-A：速查表生成（只读三元组 → guides/{topic}.md）
  └── Agent-B：融合详情生成（三元组 + draft + Kusto → details/{topic}.md）
        └── 大 topic 时 spawn sub-agents（Map-Reduce）
```

**并行生成上限**：每次最多 spawn `min(topic 数 × 2, maxAgentsPerTick)` 个 agent。
超过时分批——第一批完成后 refill 补位。

## 流程

### 1. 读取数据 + 增量检测

读取 `skills/products/{product}/known-issues.jsonl` 全部条目。
读取 `.enrich/progress.json → synthesizeState`。

**增量判断**：
- `synthesizeState.lastEntryCount === 0`（首次合成）→ **全量模式**
- `synthesizeState.lastEntryCount > 0`（增量合成）→ **增量模式**：
  - 新增条目 = JSONL 总条目 - `synthesizedEntryIds` 中已有的
  - 新增条目数 < 20 → 跳过（变化太小不值得重新合成）
  - 新增条目数 ≥ 20 → 执行增量合成
  - 如果新条目的 `solution` 指向新的 draft 文件 → 该 topic 标记为需重新融合
  - 如果 Kusto skill 新增了 query 文件 → 重新聚类（可能影响映射）

**增量合成逻辑**：
1. 对新增条目执行聚类，匹配已有 `.enrich/topic-plan.json` 中的 topic
2. 新条目匹配到已有 topic → **重新生成**该 topic 的速查表和融合详情
3. 新条目无法匹配任何已有 topic → **创建新 topic**
4. 更新 `synthesizeState`：
   - `lastSynthesizedAt` = now
   - `lastEntryCount` = 当前 JSONL 总行数
   - `synthesizedEntryIds` += 新处理的 entry IDs
   - `topicPlanHash` = .enrich/topic-plan.json 的 hash
   - `draftHashes` = 每个 draft 文件的内容 hash（用于检测 draft 变更）

### 2. LLM 主题聚类（Phase 1）

聚类 agent 的输入：

```
1. known-issues.jsonl 全量条目
2. guides/drafts/*.md 的文件名 + frontmatter（source, sourceRef, type）
3. skills/kusto/{product}/references/queries/*.md 的文件名 + frontmatter（name, description, tables）
```

按 symptom 语义相似度分组：
- 同类症状（如不同错误信息但同一根因）归为一组
- 每组取一个代表性主题名（英文 slug 用于文件名，中文用于标题）
- **聚类粒度控制**：单个 topic 超过 15 条三元组时，强制拆分为子 topic
  - 按 rootCause 或 tags 二次聚类

**Draft → topic 映射**：
- **直接扫描 `guides/drafts/` 目录**发现所有 draft 文件（不依赖 JSONL 指引条目）
- 从每个 draft 的 frontmatter 读取 `source`、`sourceRef`、`type` 等元数据
- 聚类 agent 按 frontmatter 的 `sourceRef`、标题和内容语义匹配到最近 topic
- 不与任何 JSONL 条目关联的 draft 文件 → 聚类 agent 按 frontmatter 语义匹配到最近 topic

**Kusto query → topic 映射**：
- 聚类 agent 读取每个 query 文件的 frontmatter（name, description, tables）
- 按语义匹配到对应 topic（如 `service-healing.md` → `vm-start-stop` topic）
- 一个 query 文件可匹配多个 topic

**.enrich/topic-plan.json 格式**：
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
      "keywords": ["restart", "service-healing", "availability"],
      "confidence": "high"
    }
  ],
  "discarded": [
    {"id": "vm-003", "reason": "半成品（无根因无方案）"}
  ]
}
```

> ⚠️ **大文件写入规则（防止 output token 截断）**：
> `.enrich/topic-plan.json` 在产品条目 >100 时通常超过 8000 tokens，**禁止用 Write 工具直接写入**。
> 必须使用 Bash + Python 写入：
> ```bash
> python3 -c "
> import json
> # 在 Python 代码中构建 data dict（聚类逻辑的结果变量）
> data = { 'product': '...', 'topics': topics_list, 'discarded': discarded_list }
> with open('skills/products/{product}/.enrich/topic-plan.json', 'w', encoding='utf-8') as f:
>     json.dump(data, f, ensure_ascii=False, indent=2)
> print(f'Written {len(data[\"topics\"])} topics')
> "
> ```
> **原因**：Write 工具把文件内容作为 output token 生成，大 JSON 超过 max_tokens 会被截断导致参数丢失死循环。
> 通过 Bash + Python，数据在磁盘流转，不经过 output token 瓶颈。
> 此规则同样适用于任何预计超过 5KB 的 JSON/Markdown 文件。

字段说明：
- `draftPaths`: 该 topic 关联的 draft 文件路径（相对于产品目录）
- `kustoQueryFiles`: 该 topic 关联的 Kusto query 文件名（相对于 `skills/kusto/{product}/references/queries/`）
- `hasFusionGuide`: `draftPaths` 或 `kustoQueryFiles` 非空即为 `true`

### 3. 质量过滤

**三元组条目过滤**：

| 条件 | 动作 |
|------|------|
| 只有 symptom，无 rootCause **且** 无 solution | 丢弃（半成品） |
| 超过 4 年旧 + 无 case 验证 | 丢弃（过时） |
| 单数据源条目 | 保留，标记 confidence: low |
| 多数据源交叉验证 | 保留，提升 confidence: high |

**草稿不过滤**——全部参与融合。质量信号内嵌到最终 guide 的评分中。

### 3.5 跨源矛盾检测（Phase 1.5 — Conflict Scan）

> 在聚类（Phase 1）之后、生成（Phase 2）之前，对同 topic 内的跨源条目做矛盾扫描。
> 4,000+ 条知识库中不同来源对同一问题可能给出矛盾的 rootCause 或 solution，
> 若不提前检测，会导致生成的指南自相矛盾。

**输入**：`.enrich/topic-plan.json` + 全量 JSONL 条目
**输出**：`.enrich/conflict-report.json` + `guides/conflict-report.md`（人工审核用）

#### 检测逻辑

对 `topic-plan.json` 中每个 topic 的 `entryIds`：

1. **按 symptom 分组**：同 topic 内 symptom 相似度 > 70% 的条目归为一组（同一问题）
2. **跨源对比**：同组内来自不同 source 的条目，比较 rootCause 和 solution：

| 矛盾类型 | 检测规则 | 示例 |
|----------|---------|------|
| **rootCause 矛盾** | 同 symptom 但 rootCause 语义相反或不兼容 | OneNote 说"权限不足"，ADO Wiki 说"服务限制 by design" |
| **solution 矛盾** | 同 symptom 但 solution 互斥 | OneNote 说"加权限"，MS Learn 说"不支持，换方案" |
| **时效性矛盾** | 旧条目的 solution 在新版本已失效 | 2023 年 OneNote 说用 MMA，2025 年 ADO Wiki 说 MMA 已废弃用 AMA |
| **21V 矛盾** | 一条标注 21vApplicable=true，另一条同 symptom 标注 false | ADO Wiki 全局适用，OneNote 标注 Mooncake 不可用 |

3. **LLM 判断**：将每组可疑矛盾对输入 LLM，判断：
   - `"real_conflict"` — 真矛盾，需人工裁定
   - `"version_superseded"` — 旧版本信息被新版本取代（按日期取新）
   - `"context_dependent"` — 两个都对，适用场景不同（标注条件）
   - `"false_alarm"` — 表述不同但含义一致

#### 输出格式

**.enrich/conflict-report.json**：
```json
{
  "product": "{product}",
  "generatedAt": "2026-04-07",
  "totalConflicts": 5,
  "conflicts": [
    {
      "id": "conflict-001",
      "topic": "vm-start-stop",
      "type": "solution_conflict",
      "severity": "high",
      "entryA": {"id": "vm-onenote-012", "source": "onenote", "date": "2024-08-15", "symptom": "...", "solution": "..."},
      "entryB": {"id": "vm-ado-wiki-045", "source": "ado-wiki", "date": "2025-11-20", "symptom": "...", "solution": "..."},
      "judgment": "version_superseded",
      "reasoning": "MMA 已在 2024-08 废弃，onenote 条目的 solution 已过时",
      "recommendation": "保留 ado-wiki 版本，标注 onenote 版本为 deprecated",
      "resolved": false
    }
  ]
}
```

**guides/conflict-report.md**（人工审核用，可读格式）：
```markdown
# {Product} — 知识矛盾检测报告

| # | Topic | 类型 | 来源A | 来源B | 判断 | 建议 |
|---|-------|------|-------|-------|------|------|
| 1 | vm-start-stop | solution | onenote-012 | ado-wiki-045 | 版本取代 | 用 ado-wiki |
```

#### 矛盾处理规则

| 判断 | Phase 2 处理 |
|------|-------------|
| `version_superseded` | 自动：保留新条目，旧条目标记 `deprecated: true`，不参与指南生成 |
| `context_dependent` | 自动：两个都保留，指南中标注适用条件 |
| `real_conflict` | **阻断**：该 topic 的 Phase 2 生成暂停，等人工在 conflict-report.json 中设 `resolved: true` + 选择保留哪个 |
| `false_alarm` | 自动：忽略，正常融合 |

#### 性能考虑

- 矛盾检测只在 topic 内做（不做全局 N² 对比），复杂度 = O(topic 数 × topic 内条目数²)
- 对大 topic（>15 条目），先按 source 分组再做 cross-source 对比，减少比较次数
- 整个 Phase 1.5 用单个 agent 串行执行（矛盾检测不适合并行，需要全局视角）
- 预计每产品 1-3 分钟（大部分条目不会触发矛盾检测）

### 4. 分层生成排查指南（Phase 2 — 双 Agent）

对每个 topic，spawn 两个 agent 并行工作：

#### 4a. Agent-A — 速查表生成

**输入**：`entryIds` 对应的三元组
**输出**：`skills/products/{product}/guides/{topic-slug}.md`

与现有逻辑一致。**唯一改动**：

如果 `hasFusionGuide == true`：
- 有 draft 引用的条目标记 `📋`
- 速查表底部追加：
  ```markdown
  > 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
  > → [完整排查流程](details/{topic-slug}.md#排查流程)
  ```

**多维度打分制**（满分 10 分，与之前一致）：

| 维度 | 分值 | 评分标准 |
|------|------|---------|
| **来源质量** | 0-3 | OneNote(3) / ADO Wiki(2.5) / ContentIdea KB(2) / Case 清晰(2) / MS Learn(1.5) / Case 模糊(1) |
| **时效性** | 0-2 | <6月(2) / 6-12月(1.5) / 1-2年(1) / 2-4年(0.5) / >4年(0) |
| **验证强度** | 0-3 | 多源交叉(3) / 单源+实证(2) / 单源文档(1) / 纯经验(0) |
| **21V 适用性** | 0-2 | 明确 Mooncake(2) / 通用(1.5) / 未标注(1) / 涉及不支持功能(0) |

**总分 → 可信度标签**：
| 分数 | 显示 | 含义 |
|------|------|------|
| 8-10 | 🟢 | 可直接采信 |
| 5-7.9 | 🔵 | 可参考，建议验证关键步骤 |
| 3-4.9 | 🟡 | 仅供方向参考 |
| 0-2.9 | ⚪ | 可能过时，谨慎参考 |

速查表格式：
```markdown
# {Product} {Topic} — 排查速查

**来源数**: {N} | **21V**: {全部|部分|不适用}
**最后更新**: {date}

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | {symptom} | {cause} | {solution} | 🟢 9.5 — OneNote+Wiki交叉 | [MCVKB/...](path) |
| 2 📋 | {symptom} | {cause} | {solution} | 🟢 8 — 含融合指南 | [ref] |

## 快速排查路径
1. 检查 → {step1} `[来源: OneNote]`
2. 如果 → {step2} `[来源: ADO Wiki]`

> 本 topic 有融合排查指南 → [完整排查流程](details/{topic-slug}.md#排查流程)
```

#### 4b. Agent-B — 融合详情生成

**三层输入**：
1. 三元组（`entryIds` → 从 JSONL 提取）— 证据层
2. Draft 全文（`draftPaths` → 读 `guides/drafts/`）— 证据层
3. Kusto query 文件全文（`kustoQueryFiles` → 读 `skills/kusto/{product}/references/queries/`）— 工具层

**输出**：`skills/products/{product}/guides/details/{topic-slug}.md`

##### 小 topic 路径（≤8 个 draft + Kusto 文件）

Agent-B 直接读取所有输入，一次性融合生成。

##### 大 topic 路径（>8 个文件）— Map-Reduce

```
Agent-B (编排器 + 融合者)
  ├─ 评估: len(draftPaths) + len(kustoQueryFiles) > 8
  ├─ Map 阶段: spawn sub-agents（每个读 3-5 个文件，并行执行）
  │    ├─ sub-1: drafts 1-4 → .enrich/synthesize-temp/{topic}/extract-draft-1.json
  │    ├─ sub-2: drafts 5-8 → .enrich/synthesize-temp/{topic}/extract-draft-2.json
  │    ├─ sub-3: drafts 9-12 → .enrich/synthesize-temp/{topic}/extract-draft-3.json
  │    └─ sub-4: kusto queries → .enrich/synthesize-temp/{topic}/extract-kusto-1.json
  │
  └─ Reduce 阶段: Agent-B 读取所有 extract-*.json + 三元组
       → 融合生成 details/{topic-slug}.md
```

**分批规则**：
- Draft 文件：每 4 个一批
- Kusto query 文件：每 3 个一批（通常一个 topic 关联 1-3 个 query 文件，一批就够）
- 单个 draft 超过 500 行：单独一个 sub-agent 处理

**Sub-agent 模型**：继承父级 Opus 模型

**extract.json schema**：见 `playbooks/schemas/extract-schema.json`

Sub-agent 从每个文件中提取：
- `steps[]`: 排查步骤（含 KQL、集群、数据库信息）
- `decisions[]`: 决策分支（条件 + 各路径）
- `references[]`: 参考表格、参数表
- `warnings[]`: 21V 限制、过时警告

**extract.json 存储**：`skills/products/{product}/.enrich/synthesize-temp/{topic-slug}/`
- 合成完成后保留（增量合成时可复用无变化的 extract）
- `synthesizeState.extractHashes` 记录每个 extract 文件的 hash

##### Agent-B 融合规则

1. **排查流程优先**：从 extract.json 的 `steps[]` 和 `decisions[]` 中提取骨架，按诊断逻辑组织为 Phase 结构
2. **KQL 完整嵌入**：`steps[].kql` 完整保留（含 cluster/database），标注 `[工具: Kusto skill — {file}]`
3. **证据标注**：每个结论/判断标注来源评分（仅证据层参与，KQL 不评分）
4. **决策树结构化**：多个文件的 `decisions[]` 合并为表格或分支路径
5. **去重**：多个文件描述同一步骤 → 保留最完整版本，标注所有来源
6. **21V 标注**：`warnings[]` 中的 21V 限制嵌入对应步骤
7. **冲突处理**（基于 Phase 1.5 矛盾检测结果）：
   - **已裁定矛盾**：读取 `.enrich/conflict-report.json`，按判断结果处理：
     - `version_superseded` → 排除旧条目，仅用新条目
     - `context_dependent` → 两个都保留，标注 `📌 适用条件: {条件}`
     - `real_conflict` + `resolved: true` → 按人工裁定结果处理
     - `real_conflict` + `resolved: false` → **跳过该 topic**（不生成，等人工裁定）
   - **未检测到矛盾的 topic**：按来源权重兜底处理：
     - 权重 OneNote(5) > ADO Wiki(4) > ContentIdea KB(3) > MS Learn(2) > Case(1)
     - 高权重优先，低权重标注 `⚠️ 另有不同说法`
     - 权重相同 → 都保留，标注 `多种方案，视场景选择`

##### 融合输出格式

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

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | ... | ... | ... | 🟢 9 | ... |
...（三元组表格，与速查表一致）
```

**长度控制**：
- 融合详情版：不限长度，但单文件超过 5000 字时拆分为子文件
  - `details/{topic-slug}.md` 保留排查流程
  - `details/{topic-slug}-issues.md` 放三元组速查表
- _index.md 只索引精简版路径

##### 无融合素材的 topic

`hasFusionGuide == false` 的 topic（无 draft 也无 Kusto query）：
- Agent-A 照常生成速查表
- Agent-B 生成的 details/ 与现有格式一致（三元组逐条展开，无排查流程 section）
- _index.md 标记为 `📊 速查`

**草稿处理**：
- **草稿永远保留**：`guides/drafts/` 中的原始文件不删除、不移动
- `guides/drafts/` 中的文件不进入 `_index.md`
- 正式指南的 frontmatter 中记录来源草稿路径

**来源注释格式**：
| 来源类型 | 注释格式 |
|---------|---------|
| OneNote | `[MCVKB/.../page.md](relative-path)` |
| ADO Wiki | `[ADO Wiki](https://dev.azure.com/...)` |
| MS Learn | `[MS Learn](https://learn.microsoft.com/...)` |
| ContentIdea KB | `[KB{number}](https://support.microsoft.com/kb/{number})` |
| Case | `[case:NNNN]` |
| Kusto skill | `[工具: Kusto skill — {file}]` — 不参与评分 |

### 5. 生成索引

Write `skills/products/{product}/guides/_index.md`：

```markdown
# {Product} 排查指南索引

| 指南 | 类型 | Kusto | 关键词 | 来源数 | 置信度 |
|------|------|-------|--------|--------|--------|
| [启停与可用性](vm-start-stop.md) | 📋 融合 | 3 | service-healing, restart | 28 | high |
| [备份与恢复](vm-backup-restore.md) | 📋 融合 | 1 | backup, asr, recovery | 34 | high |
| [GPU](vm-gpu.md) | 📊 速查 | 0 | gpu, nvidia | 8 | medium |

最后更新: {date}
```

列说明：
- **类型**: `📋 融合`（hasFusionGuide=true，有排查流程+KQL）/ `📊 速查`（仅三元组表格）
- **Kusto**: 融合的 Kusto query 文件数量

### 6. 写审计日志

Append `skills/products/{product}/.enrich/synthesize-log.md`：

```markdown
# Synthesize Log — {product} — {date}

## 模式
{全量 | 增量 | 早期}

## 保留条目
| ID | 原因 |
|----|------|
| {id} | 多源验证 / 高置信度 / ... |

## 丢弃条目
| ID | 原因 |
|----|------|
| {id} | 半成品 / 过时 / ... |

## 融合统计
| topic | 类型 | 三元组 | draft | Kusto | sub-agents |
|-------|------|--------|-------|-------|------------|
| vm-start-stop | 📋 融合 | 12 | 3 | 2 | 0 (小 topic) |
| vm-backup-restore | 📋 融合 | 20 | 5 | 1 | 2 (Map-Reduce) |
| vm-gpu | 📊 速查 | 8 | 0 | 0 | 0 |
```

### 7. 更新状态

- `.enrich/progress.json → synthesized = true`（全量）或 `"partial"`（早期）
- `synthesizeState` 更新：
  ```json
  {
    "lastSynthesizedAt": "2026-04-06",
    "lastEntryCount": 721,
    "synthesizedEntryIds": 663,
    "topicPlanHash": "abc123",
    "draftHashes": {"onenote-backup-dos.md": "def456", ...},
    "mode": "full"
  }
  ```
- Append `.enrich/evolution-log.md`：
  ```
  | {date} | SYNTHESIZE | {N} topics ({F} fusion, {C} compact), {M} entries, {K} Kusto queries fused |
  ```

### 8. 动态 topic 分配（不变）

- 小 topic（≤15 条三元组）：1 组 agent (A+B) 可处理 **多个 topic**（按条目总数 ≤30 凑批）
- 中 topic（16-40 条）：1 组 agent 处理 **1 个 topic**
- 大 topic（>40 条）：应已被聚类拆分。如仍超 40 条：
  - Agent-A 独立生成精简版
  - Agent-B 使用 Map-Reduce 处理详情版

### 9. Kusto Skill 轻量化

融合完成后，对已融合的 Kusto query 文件：

1. **不删不移**：query 文件保留原位
2. **标记 deprecated**：在 frontmatter 中加：
   ```yaml
   deprecated: true
   fusedTo: "skills/products/{product}/guides/details/{topic-slug}.md"
   fusedAt: "2026-04-06"
   ```
3. **README 加注**：说明 KQL 已融入 product guide，此目录供 fallback
4. **Troubleshooter fallback**：
   - 融合 guide 覆盖的场景 → 直接用 guide 中的 KQL
   - 未覆盖的场景 → 回退到 Kusto skill query 文件（即使标记 deprecated）
   - Kusto skill 的 SKILL.md、kusto_clusters.csv、tables/ 全部保留

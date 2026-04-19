# Shared Rules — Product Knowledge Extraction

> **⚠️ Single Rule Authority**: 本文件是数据格式、去重、ID 生成、文件写入等规则的**唯一权威定义**。
> 所有 source adapter（phase2-onenote、phase3-ado-wiki、phase4-mslearn、phase5-contentidea）和 orchestrator（auto-enrich）
> 必须引用此文件，不得在各自文件中重复定义这些规则。
>
> v4 架构重构：从 global-constraints.md / auto-enrich.md / SKILL.md 三处合并而来，冲突以 v3 global-constraints 版本为准。

---

## JSONL Entry Format

每条 Track A（break/fix）知识写入 `.enrich/known-issues-{source}.jsonl`，格式如下：

```json
{
  "id": "{product}-{source}-{seq:03d}",
  "date": "YYYY-MM-DD",
  "symptom": "客户遇到的问题现象描述",
  "rootCause": "根因分析（可为空字符串，如仅有 workaround）",
  "solution": "解决方案或 workaround 步骤",
  "source": "onenote|ado-wiki|mslearn|contentidea-kb|21v-gap|manual",
  "sourceRef": "相对路径、wiki 路径或 work item ID（见 Scanned Key Formats）",
  "sourceUrl": "完整 URL（mslearn/ado-wiki 可用）或 null",
  "product": "{product}",
  "confidence": "high|medium|low",
  "quality": "raw",
  "tags": ["关键词1", "关键词2"],
  "21vApplicable": true,
  "promoted": false
}
```

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 条目唯一 ID，提取阶段格式 `{product}-{source}-{seq:03d}`，MERGE 后统一重编为 `{product}-{seq:03d}` |
| `date` | string | 提取日期，`YYYY-MM-DD` |
| `symptom` | string | 问题现象（必填），用一两句话描述客户遇到的错误/异常 |
| `rootCause` | string | 根因分析，可为空字符串（当仅有 workaround 时） |
| `solution` | string | 解决方案或 workaround（必填） |
| `source` | string | 数据来源标识符，枚举值见上 |
| `sourceRef` | string | 源内引用标识（路径/URL/ID），用于溯源和去重 |
| `sourceUrl` | string\|null | 可直接打开的完整 URL；本地文件源（onenote）为 `null` |
| `product` | string | 产品 ID（如 `vm`, `aks`, `intune`） |
| `confidence` | string | 置信度：`high`（明确证实）、`medium`（合理推断）、`low`（仅参考） |
| `quality` | string | 质量状态：`raw`（初始提取）→ 经 SYNTHESIZE 后可升级 |
| `tags` | string[] | 关键词标签，用于搜索和聚类 |
| `21vApplicable` | bool\|null | 是否适用于 21Vianet（Mooncake）；`null` = 未标记，MERGE 阶段补标 |
| `promoted` | bool | 是否已提升到产品 SKILL.md 的排查步骤中 |

**可选字段**（按需出现）：

| 字段 | 说明 |
|------|------|
| `relatedTo` | 关联条目 ID（50-80% 重叠时标记） |
| `stale` | `true` = 源内容已变更，待重新提取覆盖 |

---

## Dual-Track Extraction

所有需要 LLM 提取的数据源（onenote / ado-wiki / mslearn）均采用双轨处理。

### Track A — Break/Fix 型

**条件**：内容包含明确的错误现象 + 原因或解决方案（至少一组 `symptom` + `rootCause` 或 `solution`）。

**动作**：提取三元组，写入 `.enrich/known-issues-{source}.jsonl`。

### Track B — 排查指南型

**条件**：决策树、多步诊断流程、操作手册、参考表——无法拆解为单条 symptom→solution 映射。

**动作**：
- ✅ 保存为 `guides/drafts/{source}-{sanitized-title}.md` 草稿文件
- ❌ **不写 JSONL 条目**（不创建 `quality: "guide-draft"` 的指引条目）
- Draft 文件通过 frontmatter 的 `sourceRef` 自包含所有元数据
- SYNTHESIZE 阶段直接扫描 `guides/drafts/` 目录发现草稿

### LLM 分类 Prompt

LLM 在一次 prompt 中完成分类和提取，判断顺序：

1. **先判断 Skip**：纯内部管理/行政内容（会议安排、人员变动、OOF 通知等）→ 跳过，不提取
2. **再判断 Track A vs Track B**：
   - 能提出至少一组 `symptom` + (`rootCause` 或 `solution`) → **Track A**
   - 否则 → **Track B**

> 先判断是否应该 Skip（内部管理/行政），再判断 Track A 还是 Track B。

### SYNTHESIZE 阶段处理 Drafts

- 直接扫描 `guides/drafts/` 目录发现所有 draft 文件（不依赖 JSONL 指引条目）
- 三元组 + 同主题草稿 → 融合：三元组补充到草稿的对应 section
- 纯草稿 → 清洗格式后升级为正式指南（从 `drafts/` 移到 `guides/`）
- `guides/drafts/` 中的文件不进入 `_index.md`，只有升级为正式指南后才索引

---

## Dedup Rules

### 提取阶段：Per-Source 去重

对每个新提取的条目，仅与 **`.enrich/known-issues-{source}.jsonl`** 中已有条目对比（按 `symptom` + `rootCause` 关键词）：

| 重叠度 | 动作 |
|--------|------|
| ≥ 80% | 跳过（`stats.totalDeduplicated++`） |
| 50-80% | append，添加 `relatedTo: "{existing-id}"` |
| < 50% | 直接 append |

> **提取阶段不做跨 source 去重**——不同 source 的 JSONL 文件完全独立，避免并发读写冲突。

### MERGE 阶段：Cross-Source 去重

当产品所有 source 均 exhausted 后触发 MERGE，合并所有 per-source JSONL 文件：

| 重叠度 | 动作 |
|--------|------|
| ≥ 80% | 保留 `confidence` 更高的条目，丢弃另一个 |
| 50-80% | 保留两个，互标 `relatedTo` |
| < 50% | 保留 |

MERGE 同时执行 21V 补标：读取 `21v-gaps.json`，对 `21vApplicable === null` 的条目检查 solution 是否涉及 unsupported feature。

---

## ID Generation

### 提取阶段（Per-Source 文件内）

格式：`{product}-{source}-{seq:03d}`

示例：`vm-onenote-001`, `vm-ado-wiki-015`, `aks-mslearn-003`

生成方式：读取 `.enrich/known-issues-{source}.jsonl` 中该 source 最大序号 +1。

### MERGE 后（合并文件）

格式：`{product}-{seq:03d}`

示例：`vm-001`, `vm-002`, `aks-001`

生成方式：所有保留条目按 source 优先级排序（`21v-gap` → `onenote` → `ado-wiki` → `mslearn` → `contentidea-kb`），source 内按原序，统一重编。

---

## File Write Rules

> **⚠️ Write Tool 缓存 Bug ([#42383](https://github.com/anthropics/claude-code/issues/42383))**：
> Write/Edit 工具覆盖已有文件后，后续 Bash 命令可能触发文件缓存还原，导致修改静默丢失。
>
> **所有 agent 文件写入必须使用 `Bash` + `python3 -c "..."` 执行，禁止使用 Write 工具。**
> 所有 source adapter 和 orchestrator 引用此规则——不要在其他文件中重复说明 bug 编号和 workaround。

### 标准写入示例

```bash
# Append JSONL 条目
python3 -c "
import json
entry = {\"id\":\"vm-onenote-001\", \"symptom\":\"...\", ...}
open('.claude/skills/products/vm/.enrich/known-issues-onenote.jsonl','a',encoding='utf-8').write(json.dumps(entry,ensure_ascii=False)+'\\n')
"
```

### 大文件规则（> 5KB）

内容超过 5KB 时，用 Python 变量构建完整内容后一次性写入，避免多次 append 产生的 shell 转义问题：

```bash
python3 -c "
content = '''---
source: ado-wiki
sourceRef: Supportability/AzureIaaSVM/...
...
---

# Guide Title

Full content here...
'''
open('guides/drafts/ado-wiki-some-guide.md','w',encoding='utf-8').write(content)
"
```

---

## Per-Source File Isolation

每个 source 写独立文件，MERGE 阶段合并。消除并发写冲突。

### 写入目标

| 文件类型 | 路径 | 写入方 |
|----------|------|--------|
| JSONL（知识条目） | `.enrich/known-issues-{source}.jsonl` | 对应 source 的 agent 独占 |
| 扫描记录 | `.enrich/scanned-{source}.json` | 对应 source 的 agent 独占 |
| 合并 JSONL | `known-issues.jsonl` | MERGE 阶段产出（SYNTHESIZE 读取） |
| Track B 草稿 | `guides/drafts/{source}-{sanitized-title}.md` | 对应 source 的 agent |
| Evolution log | `.enrich/evolution-log.md` | 所有 agent 均可 append |

> 路径均相对于 `.claude/skills/products/{product}/`。

### 扫描记录原子性

- **扫描前**必须先 Read `.enrich/scanned-{source}.json`
- **扫描后**必须 append 本次处理的路径/URL
- `.enrich/known-issues-{source}.jsonl` 不存在 → 创建空文件后 append
- `.enrich/scanned-{source}.json` 不存在 → 创建合适的初始结构（见各 Phase 说明）
- **禁止**：任何代码路径清空或覆盖已有的 scanned 数组
- orphan scanned 条目（不在 index 中）无害，保留不清理
- ❌ **不再使用 `scanned-sources.json`**——已废弃

### 草稿文件名前缀

格式：`guides/drafts/{source}-{sanitized-title}.md`

source 前缀避免不同 source 产出同名草稿时的冲突。

### Blast 模式临时文件

Blast 模式（ado-wiki-blast）使用 `.enrich/blast-temp/` 目录存放 per-batch 中间文件：
- scanned temp → merge 追加到主文件 → 删 temp
- JSONL temp → merge 追加到主文件 → 删 temp

---

## Scanned Key Formats

各数据源在 `scanned-{source}.json` 中使用的 key 格式：

| 数据源 | key 格式 | 示例 |
|--------|----------|------|
| onenote | Markdown 文件相对路径 | `MCVKB/VM+SCIM/.../page.md` |
| ado-wiki | `{org}/{project}/{wiki}:{path}` | `Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/...` |
| mslearn | 完整 URL | `https://learn.microsoft.com/en-us/troubleshoot/...` |
| contentidea-kb | Work item ID | `18275` |
| 21v-gap | 产品路径 | `POD/VMSCIM/4. Services/VM` |

---

## Evolution Log

每次知识写入后，append 到 `.enrich/evolution-log.md`：

```
| {date} | {source} | {简述变更} | {case/link} |
```

示例：

```
| 2026-04-19 | onenote | +3 VM known issues from MCVKB | MCVKB/VM+SCIM/... |
| 2026-04-19 | ado-wiki | +5 AKS issues from TSG wiki | Supportability/AKS/... |
| 2026-04-19 | 21v-gap-scan | 8 unsupported, 3 partial features | POD Services/VM |
```

---

## Temporary File Rules

### 允许的写入目标

- `.enrich/blast-temp/` 下的 per-batch 文件（scanned temp、JSONL temp）
- `guides/drafts/` 下的草稿文件
- `.enrich/synthesize-temp/` 下的 extract JSON（Map-Reduce 中间产物）

### 禁止的文件模式

在 `.enrich/` 根目录或其他位置创建以下模式的文件：
- `_tmp*`, `_blast*`, `tmp_*`, `page_*`, `p[0-9].json`
- 任何未在本节列出的中间文件

> 需要中间数据 → 用 Python 内存变量，不要写磁盘。

---

## Draft Management

### 保留策略

**草稿永远保留**：`guides/drafts/` 中的原始文件不删除、不移动。

用途：
1. 增量更新时对比原始内容与合成结果
2. 重新合成时作为输入源
3. 溯源验证——正式指南引用草稿路径，可追查原文

### 索引规则

- `guides/drafts/` 中的文件**不进入** `_index.md`
- 只有升级为正式指南（`guides/` 根目录）后才索引
- 正式指南的 frontmatter 中记录来源草稿路径：`draftSources: ["drafts/onenote-xxx.md", "drafts/ado-wiki-yyy.md"]`

### Draft Frontmatter 格式

```yaml
---
source: onenote|ado-wiki|mslearn
sourceRef: "相对路径或 wiki 路径"
sourceUrl: "完整 URL 或 null"
importDate: "YYYY-MM-DD"
type: guide-draft
---
```

| 字段 | 说明 |
|------|------|
| `source` | 数据来源标识符 |
| `sourceRef` | 源内引用标识（与 JSONL 条目的 `sourceRef` 同义） |
| `sourceUrl` | 可直接打开的 URL，本地源为 `null` |
| `importDate` | 草稿导入日期 |
| `type` | 固定值 `guide-draft` |

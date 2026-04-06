### 全局约束（所有 Phase 通用）

- 每个 tick 最多处理 **10 个页面/文件**（ADO Wiki 使用动态批量分配，见 Phase 3 Step 3b）
- **不截取页面内容**——通过动态分配（ADO Wiki）或每批 10 页（OneNote 本地文件）控制总量，确保 agent 有足够 token 完成提取+写入
- OneNote 页面：读取完整全文，不截取
- 每个 tick 目标完成时间 **< 5 分钟**
- **v3 并行写入规则**：
  - 写 JSONL → `.enrich/known-issues-{source}.jsonl`（不是 `known-issues.jsonl`）
  - 写扫描记录 → `.enrich/scanned-{source}.json`（不是 `.enrich/scanned-sources.json`）
  - ID 格式 → `{product}-{source}-{seq:03d}`（在 per-source 文件内递增）
  - 去重范围 → 仅在自己的 per-source 文件内去重（跨 source 去重留给 MERGE）
  - 草稿文件名 → `guides/drafts/{source}-{sanitized-title}.md`
- **扫描前**必须先 Read `.enrich/scanned-{source}.json`，**扫描后**必须 append 本次处理的路径/URL
- `.enrich/known-issues-{source}.jsonl` 不存在 → 创建空文件后 append
- `.enrich/scanned-{source}.json` 不存在 → 创建合适的初始结构（见各 Phase 说明）

### 双轨提取规则（Phase 2/3/4 通用）

所有需要 LLM 提取的 Phase（onenote/ado-wiki/mslearn）均采用双轨处理：

- **Track A — Break/Fix 型**：有明确的错误现象 + 原因或解决方案 → 提取三元组写 `.enrich/known-issues-{source}.jsonl`
- **Track B — 排查指南型**：决策树、多步诊断、操作手册、参考表 → 保存为 `guides/drafts/{title}.md` 草稿 + 在 JSONL 写一条 `quality: "guide-draft"` 的指引条目

**分类判断**：LLM 在一次 prompt 中同时完成分类和提取。能提出至少一组 symptom + (rootCause 或 solution) → Track A，否则 → Track B。

**SYNTHESIZE 阶段处理 drafts/**：
- 三元组 + 同主题草稿 → 融合：三元组补充到草稿的对应 section
- 纯草稿 → 清洗格式后升级为正式指南（从 `drafts/` 移到 `guides/`）
- `guides/drafts/` 中的文件不进入 `_index.md`，只有升级为正式指南后才索引

Phase 3 (ado-wiki-scan) 的双轨细节见该 Phase 内的"内容分类 + 双轨处理"section。Phase 2 和 Phase 4 遵循相同规则，仅 `source` 和 `sourceRef` 格式不同。

### JSONL 条目格式

```json
{
  "id": "{product}-{source}-{seq:03d}",
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

**ID 生成**：读取 `.enrich/known-issues-{source}.jsonl` 中该 source 最大序号 +1。格式 `{product}-{source}-{seq:03d}`。

### 去重规则

对每个新提取的条目，与 `.enrich/known-issues-{source}.jsonl` 已有条目对比（仅 per-source 文件内去重，跨 source 留给 MERGE）：

| 重叠度 | 动作 |
|--------|------|
| ≥ 80% | 跳过（`stats.totalDeduplicated++`） |
| 50-80% | append，添加 `relatedTo: "{existing-id}"` |
| < 50% | 直接 append |

---

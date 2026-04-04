# Product-Learn Auto-Enrich v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite product-learn auto-enrich from a fixed-cycle scanner into a 3-stage pipeline (EXTRACT → SYNTHESIZE → REFRESH) that exhaustively scans all knowledge sources, produces dual-layer output (JSONL + Markdown guides), and integrates with OneNote sync for incremental updates.

**Architecture:** Skill/agent Markdown instruction files + JSON config + per-product data directories. No TypeScript code changes — all changes are LLM instruction files that control agent behavior. The pipeline is orchestrated by the main session reading `auto-enrich.md`, spawning `knowledge-enricher` agents per tick, and advancing state in `enrich-state.json`.

**Tech Stack:** Claude Code skills (Markdown), JSON state files, Bash/PowerShell for ADO search, MCP tools (msft-learn, local-rag)

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `config.json` | Modify | Add `pod` + `podProducts` with OneNote section mappings |
| `skills/products/enrich-state.json` | Rewrite | New schema: per-product per-source state tracking |
| `.claude/skills/product-learn/SKILL.md` | Rewrite | New `synthesize` subcommand, updated `auto-enrich` description |
| `.claude/skills/product-learn/modes/auto-enrich.md` | Rewrite | 3-stage pipeline: EXTRACT/SYNTHESIZE/REFRESH |
| `.claude/agents/knowledge-enricher.md` | Modify | Adapt to new pipeline, add scanned-sources.json handling |
| `.claude/agents/troubleshooter.md` | Modify | Add Step 1.5: query product guides |
| `skills/products/{product}/scanned-sources.json` | Create (per product) | Track which pages have been scanned |
| `skills/products/{product}/guides/_index.md` | Create (per product) | Topic index for troubleshooter consumption |

---

### Task 1: Update config.json with POD product configuration

**Files:**
- Modify: `config.json`

This task adds the `pod` and `podProducts` configuration that drives which products to scan and their OneNote directory mappings.

- [ ] **Step 1: Read current config.json**

Read the file to understand existing structure.

- [ ] **Step 2: Add pod configuration**

Add these fields to `config.json` (merge with existing content, do not overwrite):

```json
{
  "pod": "VM+SCIM",
  "podProducts": [
    {
      "id": "intune",
      "services": ["Intune"],
      "onenoteSection": "Intune/",
      "mcvkbSection": null,
      "podServicesDir": "Intune"
    },
    {
      "id": "vm",
      "services": ["Virtual Machine running Windows", "Virtual Machine running Linux", "Virtual Machine Scale Sets", "Azure Dedicated Host"],
      "onenoteSection": "VM+SCIM/=======2. VM*",
      "mcvkbSection": "VM+SCIM/=======2. VM*",
      "podServicesDir": "VM",
      "extraSections": ["VM+SCIM/=======3. Linux*", "VM+SCIM/=======5. Image*"]
    },
    {
      "id": "aks",
      "services": ["Azure Kubernetes Service"],
      "onenoteSection": "VM+SCIM/=======18. AKS*",
      "mcvkbSection": "VM+SCIM/=======18. AKS*",
      "podServicesDir": "AKS"
    },
    {
      "id": "monitor",
      "services": ["Monitor", "Alerts", "Log Analytics", "Managed Grafana"],
      "onenoteSection": "VM+SCIM/=======10. Monitor*",
      "mcvkbSection": "VM+SCIM/=======10. Monitor*",
      "podServicesDir": "MONITOR"
    },
    {
      "id": "entra-id",
      "services": ["Azure Active Directory (Entra)", "O365 Identity"],
      "onenoteSection": "VM+SCIM/=======11. AAD*",
      "mcvkbSection": "VM+SCIM/=======11. AAD*",
      "podServicesDir": "Azure AD _ Ms Entra ID"
    },
    {
      "id": "networking",
      "services": [],
      "onenoteSection": null,
      "mcvkbSection": "Net/",
      "podServicesDir": null
    },
    {
      "id": "disk",
      "services": ["Storage (IaaS)", "Azure Data Box"],
      "onenoteSection": "VM+SCIM/=======6. Storage*",
      "mcvkbSection": "VM+SCIM/=======6. Storage*",
      "podServicesDir": "Azure Shared Disks"
    },
    {
      "id": "acr",
      "services": ["Azure Container Registry/Instance"],
      "onenoteSection": "VM+SCIM/=======18. AKS*",
      "mcvkbSection": "VM+SCIM/=======18. AKS*",
      "podServicesDir": "ACR"
    },
    {
      "id": "arm",
      "services": ["Management Portal", "Azure Arc enabled servers/K8S"],
      "onenoteSection": "VM+SCIM/=======14. PORTAL*ARM*",
      "mcvkbSection": "VM+SCIM/=======14. PORTAL*ARM*",
      "podServicesDir": "DEPLOYMENT"
    },
    {
      "id": "avd",
      "services": ["Azure Virtual Desktop"],
      "onenoteSection": "VM+SCIM/=======9. AVD*",
      "mcvkbSection": "VM+SCIM/=======9. AVD*",
      "podServicesDir": "AVD"
    },
    {
      "id": "purview",
      "services": ["Purview Information Protection", "Microsoft Purview compliance"],
      "onenoteSection": null,
      "mcvkbSection": null,
      "podServicesDir": "M365 Purivew Compliance"
    },
    {
      "id": "eop",
      "services": ["EOP, Defender for M365"],
      "onenoteSection": null,
      "mcvkbSection": null,
      "podServicesDir": "M365 MDO EOP"
    },
    {
      "id": "defender",
      "services": ["Defender for Cloud", "Azure Sentinel"],
      "onenoteSection": null,
      "mcvkbSection": null,
      "podServicesDir": null
    },
    {
      "id": "automation",
      "services": ["Automation", "Azure Update Manager"],
      "onenoteSection": null,
      "mcvkbSection": null,
      "podServicesDir": null
    }
  ],
  "enrichPriority": ["intune", "vm", "aks", "monitor", "entra-id", "networking", "disk", "acr", "arm", "avd", "purview", "eop", "defender", "automation"]
}
```

- [ ] **Step 3: Verify JSON is valid**

Run: `cat config.json | python -m json.tool > /dev/null && echo "valid" || echo "invalid"`
Expected: `valid`

- [ ] **Step 4: Create missing product directories**

```bash
for p in defender automation; do
  mkdir -p skills/products/$p
  touch skills/products/$p/known-issues.jsonl
  echo "| Date | Source | Change | Case/Link |" > skills/products/$p/evolution-log.md
  echo "|------|--------|--------|-----------|" >> skills/products/$p/evolution-log.md
done
```

- [ ] **Step 5: Create scanned-sources.json for all products**

```bash
for p in vm aks networking monitor entra-id acr arm avd disk intune purview eop defender automation; do
  echo '{"onenote":[],"ado-wiki":[],"mslearn":[]}' > skills/products/$p/scanned-sources.json
done
```

- [ ] **Step 6: Create guides/ directories for all products**

```bash
for p in vm aks networking monitor entra-id acr arm avd disk intune purview eop defender automation; do
  mkdir -p skills/products/$p/guides
  cat > skills/products/$p/guides/_index.md << 'EOINDEX'
# Product Troubleshooting Guide Index

No guides generated yet. Run `/product-learn auto-enrich` to populate.

| Guide | Keywords | Sources | Confidence |
|-------|----------|---------|------------|
EOINDEX
done
```

- [ ] **Step 7: Commit**

```bash
git add config.json skills/products/
git commit -m "feat(product-learn): add POD product config + scaffolding for v2"
```

---

### Task 2: Rewrite enrich-state.json with new schema

**Files:**
- Rewrite: `skills/products/enrich-state.json`

- [ ] **Step 1: Write new state file**

```json
{
  "status": "idle",
  "currentProduct": "",
  "currentSource": "",
  "productQueue": ["intune", "vm", "aks", "monitor", "entra-id", "networking", "disk", "acr", "arm", "avd", "purview", "eop", "defender", "automation"],
  "completedProducts": [],
  "productStates": {},
  "stats": {
    "totalDiscovered": 0,
    "totalDeduplicated": 0,
    "bySource": {"onenote": 0, "ado-wiki": 0, "mslearn": 0, "21v-gap": 0},
    "byProduct": {}
  }
}
```

The `productStates` object will be populated as products are processed. Example after processing starts:

```json
"productStates": {
  "intune": {
    "21v-gap": "exhausted",
    "onenote": "scanning",
    "ado-wiki": "pending",
    "mslearn": "pending",
    "synthesized": false
  }
}
```

Valid source states: `"pending"` → `"scanning"` → `"exhausted"` | `"error"` | `"skipped"`

- [ ] **Step 2: Verify JSON valid**

Run: `cat skills/products/enrich-state.json | python -m json.tool > /dev/null && echo "valid"`

- [ ] **Step 3: Commit**

```bash
git add skills/products/enrich-state.json
git commit -m "feat(product-learn): rewrite enrich-state.json for v2 pipeline"
```

---

### Task 3: Rewrite auto-enrich.md — EXTRACT stage

**Files:**
- Rewrite: `.claude/skills/product-learn/modes/auto-enrich.md`

This is the largest task. The file is rewritten from scratch with the 3-stage pipeline. Due to length, this task covers the EXTRACT stage; Task 4 covers SYNTHESIZE and REFRESH.

- [ ] **Step 1: Write the EXTRACT portion of auto-enrich.md**

Write the complete file `.claude/skills/product-learn/modes/auto-enrich.md` with all content up through Phase 4 (mslearn-scan). The file must include:

1. **Header**: constants, paths, product → OneNote directory mapping (read from `config.json → podProducts`)
2. **Subcommand routing**: `run` / `status` / `reset` / `skip` / `synthesize`
3. **`run` flow**: Step 0 read state → Step 1 determine product+source → Step 2 spawn agent → Step 3 update state → Step 4 output summary
4. **Source ordering**: `21v-gap` → `onenote` → `ado-wiki` → `mslearn` (per product)
5. **Exhaustion detection**: when `scanned-sources.json` covers all candidates → source `exhausted`
6. **Auto-advance to SYNTHESIZE**: when all 4 sources exhausted for a product
7. **Global constraints**: 10 pages/tick, 5000→3000 char truncation, <5 min target
8. **scanned-sources.json**: per-phase scan, filter, append flow
9. **Phase execution instructions** for all 4 sources (21v-gap, onenote, ado-wiki, mslearn)
10. **JSONL entry format**: id, date, symptom, rootCause, solution, source, sourceRef, sourceUrl, product, confidence, quality, tags, 21vApplicable, promoted
11. **Dedup logic**: 80%+ skip, 50-80% relatedTo, <50% append

Key differences from v1 to emphasize in the new file:
- No `maxCycles` — exhaustion-driven termination
- `scanned-sources.json` replaces offset — path-based dedup, not position-based
- Source state tracking in `enrich-state.json → productStates`
- Priority order from `config.json → enrichPriority`

- [ ] **Step 2: Verify the file is well-formed Markdown**

Read back the file and check for:
- No unclosed code blocks
- Consistent heading hierarchy
- All JSON examples are valid
- No references to removed v1 concepts (maxCycles, scanOffsets, cycle)

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/product-learn/modes/auto-enrich.md
git commit -m "feat(product-learn): rewrite auto-enrich EXTRACT stage for v2"
```

---

### Task 4: Add SYNTHESIZE and REFRESH stages to auto-enrich.md

**Files:**
- Modify: `.claude/skills/product-learn/modes/auto-enrich.md` (append)

- [ ] **Step 1: Append SYNTHESIZE section**

Append to the file the `## SYNTHESIZE — 综合指南生成` section containing:

1. **Trigger**: auto (all sources exhausted) or manual (`/product-learn synthesize {product}`)
2. **Flow**: read JSONL → LLM topic clustering → quality filter → generate guides/{topic}.md → generate _index.md → write synthesize-log.md
3. **Quality filter rules**:
   - Discard: only symptom, no rootCause or solution
   - Discard: 4+ years old with no case validation
   - Keep but mark low confidence: single-source entries
4. **Guide format**: full template with inline source annotations using clickable links
   - OneNote: relative path `[MCVKB/.../page.md](relative/path)`
   - ADO Wiki: full URL `[ADO Wiki](https://dev.azure.com/...)`
   - MS Learn: full URL `[MS Learn](https://learn.microsoft.com/...)`
   - Case: `[case:NNNN]`
5. **_index.md format**: table with guide name, keywords, source count, confidence
6. **synthesize-log.md format**: kept entries (ID + reason), discarded entries (ID + reason), merged groups (IDs → guide name)
7. **Agent spawn**: spawn a `knowledge-enricher` agent with phase `synthesize`, product ID, and instruction to read this section

- [ ] **Step 2: Append REFRESH section**

Append the `## REFRESH — 增量维护` section containing:

1. **Trigger**: OneNote sync hook — after `onenote-export` syncs a team notebook
2. **Detection**: check `changedFiles[]` against product OneNote directory mappings and `scanned-sources.json`
3. **Flow**: mark affected pages as "needs rescan" in scanned-sources.json → re-extract only those pages → re-run SYNTHESIZE for affected product
4. **Personal notebooks excluded**: only `config.json → onenote.teamNotebooks[]` trigger refresh
5. **ADO Wiki / MS Learn**: no auto-refresh, manual `/product-learn auto-enrich` with `--reset-source ado-wiki` flag

- [ ] **Step 3: Verify complete file structure**

The final `auto-enrich.md` should have these top-level sections:
```
# Auto-Enrich Mode v2
## Constants
## Product → OneNote Directory Mapping
## Subcommand Routing
## `status`
## `reset`
## `skip`
## `run` — EXTRACT
### Step 0-4
## Phase Execution Instructions
### Phase 1: 21v-gap-scan
### Phase 2: onenote-scan
### Phase 3: ado-wiki-scan
### Phase 4: mslearn-scan
## SYNTHESIZE
## REFRESH
## Error Handling
```

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/product-learn/modes/auto-enrich.md
git commit -m "feat(product-learn): add SYNTHESIZE + REFRESH stages to auto-enrich v2"
```

---

### Task 5: Update SKILL.md with new subcommands

**Files:**
- Rewrite: `.claude/skills/product-learn/SKILL.md`

- [ ] **Step 1: Rewrite SKILL.md**

Keep the existing frontmatter (name, description, tools, etc.) but update:

1. **Parameter section**: add `synthesize` subcommand
   ```
   /product-learn synthesize {product}   — 手动触发指南综合生成
   /product-learn auto-enrich            — 执行一轮 EXTRACT（1 产品 × 1 数据源）
   /product-learn auto-enrich status     — 查看进度
   /product-learn auto-enrich reset      — 重置状态（可选 --reset-source 只重置某数据源）
   /product-learn auto-enrich skip       — 跳过当前产品
   ```

2. **Update auto-enrich description**: reference 3-stage pipeline, dual-layer output
3. **Update integration section**: troubleshooter reads `guides/_index.md`, not just `known-issues.jsonl`
4. **Keep existing subcommands**: onenote, ado-wiki, case-review, add, promote, stats — these are unchanged
5. **Add synthesize subcommand docs**: describe manual trigger, what it does, output files

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/product-learn/SKILL.md
git commit -m "feat(product-learn): update SKILL.md with synthesize subcommand and v2 description"
```

---

### Task 6: Update knowledge-enricher agent

**Files:**
- Modify: `.claude/agents/knowledge-enricher.md`

- [ ] **Step 1: Update agent definition**

Changes needed:
1. **Description**: update to mention 3-stage pipeline
2. **Input**: add `source` parameter (replaces `phase`): `21v-gap` | `onenote` | `ado-wiki` | `mslearn` | `synthesize`
3. **Output**: add `scanned-sources.json` updates, `guides/` generation (for synthesize phase)
4. **Constraints section**: add "Must read and update `scanned-sources.json` before and after scanning"

Updated file content:

```markdown
---
name: knowledge-enricher
description: "Execute one stage of product knowledge enrichment: extract from a source or synthesize guides"
tools: Bash, Read, Write, Glob, Grep
model: sonnet
maxTurns: 30
mcpServers:
  - local-rag
  - msft-learn
---

# Knowledge Enricher Agent

## 职责
从可信知识源中提取产品排查知识（EXTRACT），或从已提取的 JSONL 生成综合排查指南（SYNTHESIZE）。

每次 spawn 执行 **1 个产品的 1 个数据源**或 **1 个产品的 SYNTHESIZE**。

## 输入
- `product`: 产品 ID（vm, aks, intune, ...）
- `source`: 当前阶段（21v-gap, onenote, ado-wiki, mslearn, synthesize）
- `projectRoot`: 项目根目录绝对路径

## 执行
读取 `.claude/skills/product-learn/modes/auto-enrich.md` 获取当前 source/阶段的完整执行步骤。

## 关键行为
1. EXTRACT 前：读取 `scanned-sources.json` 过滤已扫描页面
2. EXTRACT 后：将新扫描的页面路径/URL append 到 `scanned-sources.json`
3. SYNTHESIZE：读取 `known-issues.jsonl` → 聚类 → 生成 `guides/*.md` + `_index.md` + `synthesize-log.md`

## 输出
- 新知识条目 → append 到 `skills/products/{product}/known-issues.jsonl`
- 扫描记录 → 更新 `skills/products/{product}/scanned-sources.json`
- 综合指南 → 生成 `skills/products/{product}/guides/*.md`（仅 synthesize）
- 21V gap 缓存 → 写入 `skills/products/{product}/21v-gaps.json`（仅 21v-gap）
- 审计日志 → append 到 `skills/products/{product}/evolution-log.md`

## 限制
- ❌ 不修改 SKILL.md（那是 promotion 流程的事）
- ❌ 不执行 D365 写操作
- ✅ 读取 OneNote 导出文件（Glob/Grep/Read）
- ✅ 使用 local-rag MCP（向量搜索）
- ✅ 使用 msft-learn MCP（官方文档）
- ✅ 执行 ADO 搜索脚本（Bash）
```

- [ ] **Step 2: Commit**

```bash
git add .claude/agents/knowledge-enricher.md
git commit -m "feat(product-learn): update knowledge-enricher agent for v2 pipeline"
```

---

### Task 7: Update troubleshooter.md with Step 1.5

**Files:**
- Modify: `.claude/agents/troubleshooter.md`

- [ ] **Step 1: Add Step 1.5 between existing Step 1 and Step 2**

Find the section after `### 1. 理解问题` and before `### 2. Kusto 查询`. Insert:

```markdown
### 1.5. 查产品知识库

在开始搜索和 Kusto 查询前，先检查是否已有预构建的排查指南。

1. 确定产品域（从 case-info.md 的 SAP 路径推断）
2. 检查 `skills/products/{product}/guides/_index.md` 是否存在且非空
3. 如果存在：
   - 读取 `_index.md`，根据 Step 1 理解到的症状关键词匹配最相关的 1-2 篇指南
   - 读取匹配的指南，获得：
     - 预构建的排查路径（可能可以跳过部分搜索）
     - 已知根因列表（缩小 Kusto 查询范围）
     - 21V 不适用标注（避免建议不支持的功能）
   - 在 troubleshooter.log 记录：`[timestamp] STEP 1.5 OK | matched guide: {guide-name}`
4. 如果不存在或未匹配：
   - 记录：`[timestamp] STEP 1.5 SKIP | no matching guide found`
   - 继续 Step 2，走正常搜索流程：
     - 优先搜索团队 OneNote → ADO Wiki → MS Learn → Kusto skill queries
     - 搜索汇总后才确定具体排查方法、Kusto 查询、向客户获取的关键证据
```

- [ ] **Step 2: Update output files list**

In the `## 输出文件` section, the `known-issues.jsonl` entry already exists. No change needed.

- [ ] **Step 3: Commit**

```bash
git add .claude/agents/troubleshooter.md
git commit -m "feat(product-learn): add troubleshooter Step 1.5 — query product guides"
```

---

### Task 8: Smoke test — run one EXTRACT tick

**Files:**
- No new files — validation of Tasks 1-7

- [ ] **Step 1: Verify all files are in place**

```bash
# Config
cat config.json | python -c "import sys,json; d=json.load(sys.stdin); print(f'POD: {d[\"pod\"]}, products: {len(d[\"podProducts\"])}')"

# State
cat skills/products/enrich-state.json | python -c "import sys,json; d=json.load(sys.stdin); print(f'status: {d[\"status\"]}, queue: {len(d[\"productQueue\"])} products')"

# Scaffolding
for p in intune vm aks; do
  echo "$p: scanned=$(test -f skills/products/$p/scanned-sources.json && echo yes || echo no) guides=$(test -d skills/products/$p/guides && echo yes || echo no)"
done
```

Expected:
```
POD: VM+SCIM, products: 14
status: idle, queue: 14 products
intune: scanned=yes guides=yes
vm: scanned=yes guides=yes
aks: scanned=yes guides=yes
```

- [ ] **Step 2: Run `/product-learn auto-enrich` once**

This should:
1. Read enrich-state.json (status=idle)
2. Pick first product from queue (intune)
3. Set source to 21v-gap
4. Spawn knowledge-enricher agent
5. Update state

Verify the state file advances:
```bash
cat skills/products/enrich-state.json | python -m json.tool | head -10
```

- [ ] **Step 3: Check output artifacts**

```bash
# Check if 21v-gaps.json was created/updated for intune
ls -la skills/products/intune/21v-gaps.json 2>/dev/null

# Check evolution-log.md was updated
tail -3 skills/products/intune/evolution-log.md
```

- [ ] **Step 4: Run `/product-learn auto-enrich status`**

Verify it shows the current progress in a readable format.

---

### Task 9: End-to-end validation — SYNTHESIZE one product

**Files:**
- No new files — validation of SYNTHESIZE flow

This task is run after EXTRACT has processed enough data for at least one product (e.g., monitor which already has 4 JSONL entries).

- [ ] **Step 1: Manually trigger synthesize for monitor**

Run: `/product-learn synthesize monitor`

This should:
1. Read `skills/products/monitor/known-issues.jsonl` (4 entries)
2. Cluster by topic
3. Generate `guides/*.md` with inline source annotations
4. Generate `guides/_index.md`
5. Write `synthesize-log.md`

- [ ] **Step 2: Verify output**

```bash
ls skills/products/monitor/guides/
cat skills/products/monitor/guides/_index.md
cat skills/products/monitor/synthesize-log.md | head -20
```

Expected: at least 1 guide file + populated _index.md + synthesize-log with kept/discarded entries.

- [ ] **Step 3: Verify guide contains inline source annotations**

Read one guide and check for `> 来源:` lines with links/paths.

- [ ] **Step 4: Commit generated guides**

```bash
git add skills/products/monitor/guides/ skills/products/monitor/synthesize-log.md
git commit -m "feat(product-learn): first synthesized guides for monitor product"
```

---

## Self-Review Checklist

- [x] **Spec coverage**: All 14 sections of the spec are covered by tasks
  - §1-2 Problem/Goals: addressed by overall architecture
  - §3 Architecture: Task 2 (state), Task 3-4 (pipeline)
  - §4 EXTRACT: Task 3
  - §5 SYNTHESIZE: Task 4, Task 9
  - §6 REFRESH: Task 4
  - §7 Troubleshooter: Task 7
  - §8 Product range: Task 1
  - §9 State management: Task 2
  - §10 Content Idea KB: explicitly out of scope (v2.1)
  - §11 Error handling: in Task 3-4 (auto-enrich.md)
  - §12 System interactions: Task 6-7
  - §13 File changes: all covered
  - §14 Version roadmap: documented in spec, not implementation
- [x] **Placeholder scan**: no TBD/TODO
- [x] **Type consistency**: `source` parameter name used consistently (not `phase` in some places)

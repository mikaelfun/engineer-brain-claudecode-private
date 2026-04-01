# OneNote Integration into Casework & Troubleshooter — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate OneNote knowledge into the casework pipeline via two stages: personal notes search (casework B2 parallel agent) and team knowledge base search (troubleshooter Step 3 inline).

**Architecture:** New `onenote-case-search` agent spawns alongside `teams-search` in casework B2 to extract personal case notes. Troubleshooter's Step 3 is enhanced with OneNote team notebooks search as first-priority knowledge source, with freshness and 21v-applicability assessment.

**Tech Stack:** Agent markdown definitions, ripgrep-based search (Glob/Grep), LLM keyword rewriting, frontmatter timestamp parsing.

**Spec:** `docs/superpowers/specs/2026-03-31-onenote-integration-design.md`

---

### Task 1: Add OneNote Configuration to config.json

**Files:**
- Modify: `config.json`

- [ ] **Step 1: Read current config.json**

Read `config.json` to confirm current content:
```json
{
  "casesRoot": "./cases",
  "dataRoot": "C:\\Users\\fangkun\\Documents\\EngineerBrain-Data",
  "teamsSearchCacheHours": 4
}
```

- [ ] **Step 2: Add onenote config block**

Edit `config.json` to add the `onenote` section:

```json
{
  "casesRoot": "./cases",
  "dataRoot": "C:\\Users\\fangkun\\Documents\\EngineerBrain-Data",
  "teamsSearchCacheHours": 4,
  "onenote": {
    "personalNotebook": "Kun Fang OneNote",
    "teamNotebooks": ["MCVKB"],
    "freshnessThresholdMonths": 12
  }
}
```

- [ ] **Step 3: Validate JSON syntax**

Run: `python -c "import json; json.load(open('config.json')); print('OK')"`
Expected: `OK`

- [ ] **Step 4: Commit**

```bash
git add config.json
git commit -m "feat(config): add onenote configuration for personal and team notebooks"
```

---

### Task 2: Create onenote-case-search Agent Definition

**Files:**
- Create: `.claude/agents/onenote-case-search.md`

- [ ] **Step 1: Create the agent definition file**

Write `.claude/agents/onenote-case-search.md`:

```markdown
---
name: onenote-case-search
description: "Search personal OneNote for case-specific notes"
tools: Bash, Read, Write, Glob, Grep
model: sonnet
maxTurns: 15
---

# OneNote Case Search Agent

## Purpose
Search the engineer's personal OneNote notebook for notes related to a specific case — remote session findings, customer confirmations, screenshots, action items. Extract key information via LLM reasoning and write a structured summary.

## Input
- `caseNumber`: Case number
- `caseDir`: Case data directory (absolute path)

## Execution Steps

### 1. Read Case Identifiers
Read `{caseDir}/case-info.md` to extract search identifiers:
- Case number (from filename or content)
- Customer name / company name
- Contact name and email
- Subscription ID(s)
- Any other unique identifiers (resource names, cluster names, etc.)

### 2. Read Configuration
Read `config.json` to get `onenote.personalNotebook` name.
Read `.claude/skills/onenote-export/config.json` to get `outputDir`.
Construct personal notebook path: `{outputDir}/{personalNotebook}/`

Verify the directory exists (Glob `{notebookPath}/**/*.md`). If no `.md` files found, write a no-match result (see Step 6) and exit.

### 3. Search by Identifiers

**Phase A: Filename search (highest priority)**
Use Glob to find files whose names contain case number, customer name, or other identifiers.

**Phase B: Content search (supplement)**
Use Grep (`files_with_matches` mode) to search all `.md` files in the personal notebook directory for each identifier:
- Case number (exact match)
- Customer name / contact name
- Subscription ID
- Resource names (if available)

Deduplicate results. Files matching by filename rank higher than content-only matches.

### 4. Read and Analyze Matched Pages
Read the top 5 matched files (typically 1-3 pages exist per case). For each file:
- Parse frontmatter for `title`, `created`, `modified` dates
- Extract the notebook section path from the file path
- Use LLM reasoning to understand the short notes:
  - What was discussed in the remote session?
  - What did the customer confirm or deny?
  - What screenshots were described?
  - What action items or next steps were noted?
  - Any technical findings (error messages, resource states, etc.)

### 5. Write Structured Summary
Write to `{caseDir}/onenote/personal-notes.md`:

```markdown
# Personal OneNote Notes — Case {caseNumber}

> Searched: {YYYY-MM-DD HH:MM} | Source: {personalNotebook}
> Matched pages: {count}

## {Page Title 1}
- **Modified**: {date from frontmatter}
- **Section**: {notebook/section path}
- **Key findings**:
  - {extracted insight 1}
  - {extracted insight 2}

## Summary
{1-2 sentence synthesis of what the personal notes tell us about this case}
```

### 6. No-Match Behavior
If no pages match any identifier, write:
```markdown
# Personal OneNote Notes — Case {caseNumber}

> Searched: {YYYY-MM-DD HH:MM} | Source: {personalNotebook}
> Matched pages: 0

No personal OneNote notes found for this case.
```

This prevents downstream agents from re-searching.

## Output Files
- `{caseDir}/onenote/personal-notes.md` — Structured summary of personal notes

## Constraints
- Read-only: does not modify OneNote files
- Does not search team notebooks (that is troubleshooter's job)
- Uses Glob/Grep for search, not MCP servers
```

- [ ] **Step 2: Verify agent file is valid YAML frontmatter**

Run: `python -c "import re; content=open('.claude/agents/onenote-case-search.md').read(); fm=re.search(r'^---\n(.*?)\n---', content, re.DOTALL); print('VALID' if fm and 'name:' in fm.group(1) and 'description:' in fm.group(1) else 'INVALID')"`
Expected: `VALID`

- [ ] **Step 3: Commit**

```bash
git add .claude/agents/onenote-case-search.md
git commit -m "feat(agent): add onenote-case-search agent for personal notebook search"
```

---

### Task 3: Modify Casework SKILL.md — Add OneNote Search to B2

**Files:**
- Modify: `.claude/skills/casework/SKILL.md` (lines 83-103, B2 section)

- [ ] **Step 1: Read the B2 section**

Read `.claude/skills/casework/SKILL.md` lines 83-103 to confirm current B2 content.

- [ ] **Step 2: Add onenote-case-search spawn after teams-search spawn**

Edit `.claude/skills/casework/SKILL.md`. After the teams-search spawn block (ending at line 101), before the parallel pre-read line (line 103), insert the onenote-case-search spawn block.

Find this text:
```
  ⏱ 最后一个 Bash 调用中写 date +%s > "{caseDir}/logs/.t_teamsSearch_end"
```

同一消息并行预读：`compliance-check/SKILL.md`、`status-judge/SKILL.md`、`casehealth-meta.json`、`case-summary.md`（如存在）、`playbooks/rules/case-lifecycle.md`。后续不再重复 Read。
```

Replace with:
```
  ⏱ 最后一个 Bash 调用中写 date +%s > "{caseDir}/logs/.t_teamsSearch_end"
```

同时 spawn onenote-case-search（与 teams-search 并行后台执行）：

```
subagent_type: "onenote-case-search"
description: "onenote-case-search {caseNumber}"
run_in_background: true
prompt: |
  Case {caseNumber}，caseDir={caseDir}（绝对路径）。
  请先读取 .claude/agents/onenote-case-search.md 获取完整执行步骤，然后执行。
  ⏱ 第一个 Bash 调用中写 date +%s > "{caseDir}/logs/.t_onenoteSearch_start"
  ⏱ 最后一个 Bash 调用中写 date +%s > "{caseDir}/logs/.t_onenoteSearch_end"
```

同一消息并行预读：`compliance-check/SKILL.md`、`status-judge/SKILL.md`、`casehealth-meta.json`、`case-summary.md`（如存在）、`playbooks/rules/case-lifecycle.md`。后续不再重复 Read。
```

- [ ] **Step 3: Update B2 section title to reflect both agents**

Find:
```
**B2. Teams 预检 + 按需 spawn teams-search + 并行预读（同一条消息）**
```

Replace with:
```
**B2. Teams 预检 + 按需 spawn teams-search + onenote-case-search + 并行预读（同一条消息）**
```

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/casework/SKILL.md
git commit -m "feat(casework): spawn onenote-case-search agent in B2 alongside teams-search"
```

---

### Task 4: Modify Troubleshooter Agent — Add OneNote Team KB Search to Step 3

**Files:**
- Modify: `.claude/agents/troubleshooter.md` (Step 3 section, lines 62-95)

- [ ] **Step 1: Read the current Step 3 section**

Read `.claude/agents/troubleshooter.md` lines 62-95 to confirm current Step 3 content.

- [ ] **Step 2: Replace Step 3 with enhanced version including OneNote search**

Find this exact text (lines 62-66):
```
### 3. 知识库搜索
- 使用 `az devops` CLI 搜索 ADO 知识库（见下方「ADO CLI 搜索方法」）
- 参考 `skills/contentidea-kb-search/SKILL.md` 获取 ContentIdea KB 搜索方法
- 使用 msft-learn MCP 搜索官方文档
- 使用 WebSearch 搜索公开资料
```

Replace with:
```
### 3. 知识库搜索

按以下优先级顺序搜索，综合所有来源的信息：

#### 3a. OneNote 团队知识库（最高优先级）

读取 `config.json` 获取 `onenote.teamNotebooks[]` 和 `onenote.freshnessThresholdMonths`。
读取 `.claude/skills/onenote-export/config.json` 获取 `outputDir`。

**关键词生成**（LLM 改写，复用 onenote-search skill 逻辑）：
基于 Step 1 的问题理解，生成 3-5 组搜索词变体：
- 产品/服务名 + 变体（如 "AKS" / "Kubernetes" / "容器服务"）
- 问题类型（如 "image pull failure" / "镜像拉取失败"）
- 错误码或特定标识符
- 中英文双语覆盖

**搜索范围**：遍历 `teamNotebooks[]` 中每个 notebook 的目录 `{outputDir}/{notebookName}/`。
- 阶段 A：Glob 文件名搜索（高优先级）
- 阶段 B：Grep 内容搜索（补充）
- 去重 & 按命中关键词组数排序

**读取 & 甄别**（top 5-10 匹配文件）：
- 解析 frontmatter `modified` 时间戳
- **时效性判断**：`modified` 距今超过 `freshnessThresholdMonths` 个月 → 标记 `⚠️ 可能过时 — 最后修改 {date}`
- **21v 适用性**：判断知识内容是否适用于 21v China Cloud。判断依据：
  1. **OneNote 内的 feature gap 表格**：团队 notebook 中各产品有对应的 feature gap 表格（如 `MCVKB` 中的产品对比页），优先参考这些表格判断 global-only 功能
  2. **msft-learn 官方文档**：Azure China 文档（`docs.azure.cn`）中有各服务的功能差异说明，可用 msft-learn MCP 查询 `"{产品名} Azure China feature differences"` 补充
  3. 基于以上信息标记 `21v: Partial` 或 `Global-only`，注明具体差异（如 "此 TSG 使用的 Azure Resource Graph 在 21v 可用性有限"）
- **相关性**：评估与当前问题的匹配度

**输出**：写入 `{caseDir}/research/research.md` 的 `## OneNote 团队知识库` section：
```markdown
## OneNote 团队知识库
- [{Page Title}]({relative path}) — {相关性简述} | Modified: {date} | 21v: {Compatible|Partial|Global-only} | {[Applied]|[Relevant-unused]|[Background]}
  - Key insight: {1-2 句}
  - ⚠️ 可能过时 — 最后修改 2024-01-15（如适用）
```

如有匹配，还需读取 `{caseDir}/onenote/personal-notes.md`（如存在，由 onenote-case-search agent 在 casework B2 生成），将个人笔记信息纳入排查上下文。

#### 3b. ADO Wiki / Knowledge Base

- 使用 `az devops` CLI 搜索 ADO 知识库（见下方「ADO CLI 搜索方法」）
- 参考 `skills/contentidea-kb-search/SKILL.md` 获取 ContentIdea KB 搜索方法
- ⚠️ Wiki 内容多为 global cloud 视角，用于 21v China cloud 时注意 feature gap 和 troubleshooting tool gap

#### 3c. Microsoft Learn / 官方文档

- 使用 msft-learn MCP 搜索官方文档
- 内容权威但偏浅，适合确认基础概念和官方建议

#### 3d. WebSearch

- 使用 WebSearch 搜索公开资料
- 最广但信噪比最低，用于补充以上来源未覆盖的场景
```

- [ ] **Step 3: Add Improvement Suggestions section to analysis report template**

Find this text in the analysis report template (around line 128):
```
## 参考链接
- {链接}
```

Replace with:
```
## 参考链接
- {链接}

## 改进建议
{如在排查中发现系统性改进机会（如 "MCVKB 缺少此常见场景的页面"、"某 known-issues 条目需要更新"），在此记录。inspection-writer 会据此生成 issue。如无改进建议则省略此 section。}
```

- [ ] **Step 4: Add knowledge preservation tags to research output section**

Find this text (around line 172-193):
```
### Research 引用文件
排查过程中搜索到的相关文档、Wiki、KB 链接统一保存到 `{caseDir}/research/research.md`。
增量更新：如果文件已存在，追加新引用到末尾（去重，不重复添加同一 URL）。

格式：
```markdown
# Research References — Case {caseNumber}

> 最后更新：{YYYY-MM-DD HH:MM}

## Microsoft Learn / 官方文档
- [文章标题](URL) — 相关性简述

## ADO Wiki / Knowledge Base
- [KB 标题](URL) — 相关性简述

## ADO ContentIdea
- [文章标题](URL) — 相关性简述

## 其他来源
- [标题](URL) — 相关性简述
```

Replace with:
```
### Research 引用文件
排查过程中搜索到的相关文档、Wiki、KB 链接统一保存到 `{caseDir}/research/research.md`。
增量更新：如果文件已存在，追加新引用到末尾（去重，不重复添加同一 URL）。
每条引用标注使用状态：`[Applied]`（已采用）、`[Relevant-unused]`（相关但未使用）、`[Background]`（背景参考）。

格式：
```markdown
# Research References — Case {caseNumber}

> 最后更新：{YYYY-MM-DD HH:MM}

## OneNote 团队知识库
- [{Page Title}]({path}) — {相关性} | Modified: {date} | 21v: {Compatible|Partial|Global-only} | {[Applied]|[Relevant-unused]}
  - Key insight: {1-2 句}

## Microsoft Learn / 官方文档
- [文章标题](URL) — 相关性简述 | {[Applied]|[Relevant-unused]|[Background]}

## ADO Wiki / Knowledge Base
- [KB 标题](URL) — 相关性简述 | {[Applied]|[Relevant-unused]|[Background]}

## ADO ContentIdea
- [文章标题](URL) — 相关性简述 | {[Applied]|[Relevant-unused]|[Background]}

## 其他来源
- [标题](URL) — 相关性简述 | {[Applied]|[Relevant-unused]|[Background]}
```

- [ ] **Step 5: Commit**

```bash
git add .claude/agents/troubleshooter.md
git commit -m "feat(troubleshooter): add OneNote team KB as first-priority knowledge source in Step 3"
```

---

### Task 5: Update CLAUDE.md Agent Registry Table

**Files:**
- Modify: `CLAUDE.md` (agent table, lines 85-93)

- [ ] **Step 1: Update agent count and add new entry**

Find this text:
```
**当前已注册的 6 个 agent：**
| name | model | tools | mcpServers |
|------|-------|-------|------------|
| `casework` | sonnet | Bash, Read, Write, Edit, Glob, Grep, Agent | icm |
| `data-refresh` | sonnet | Bash, Read, Write | icm |
| `teams-search` | sonnet | Bash, Read, Write | teams |
| `email-drafter` | sonnet | Read, Write, Bash | — |
| `troubleshooter` | opus | Bash, Read, Write, Glob, Grep, WebSearch | kusto, msft-learn, icm, local-rag |
| `stage-worker` | sonnet | Bash, Read, Write, Glob, Grep, Agent | — |
```

Replace with:
```
**当前已注册的 7 个 agent：**
| name | model | tools | mcpServers |
|------|-------|-------|------------|
| `casework` | opus | Bash, Read, Write, Edit, Glob, Grep, Agent | icm |
| `data-refresh` | sonnet | Bash, Read, Write | icm |
| `teams-search` | sonnet | Bash, Read, Write | teams |
| `email-drafter` | opus | Read, Write, Bash | — |
| `troubleshooter` | opus | Bash, Read, Write, Glob, Grep, WebSearch | kusto, msft-learn, icm, local-rag |
| `stage-worker` | opus | Bash, Read, Write, Glob, Grep, Agent | — |
| `onenote-case-search` | sonnet | Bash, Read, Write, Glob, Grep | — |
```

Note: This also reflects the model changes made earlier in this session (casework → opus, email-drafter → opus, stage-worker → opus).

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs(CLAUDE.md): register onenote-case-search agent and update model versions in agent table"
```

---

### Task 6: Verify Integration End-to-End

- [ ] **Step 1: Verify all files exist and are syntactically valid**

Run:
```bash
echo "=== config.json ===" && python -c "import json; c=json.load(open('config.json')); print('onenote config:', c.get('onenote', 'MISSING'))" && echo "=== onenote-case-search.md ===" && head -7 .claude/agents/onenote-case-search.md && echo "=== casework SKILL.md has onenote-case-search ===" && grep -c "onenote-case-search" .claude/skills/casework/SKILL.md && echo "=== troubleshooter.md has OneNote section ===" && grep -c "OneNote 团队知识库" .claude/agents/troubleshooter.md && echo "=== CLAUDE.md has new agent ===" && grep -c "onenote-case-search" CLAUDE.md
```

Expected output:
```
=== config.json ===
onenote config: {'personalNotebook': 'Kun Fang OneNote', 'teamNotebooks': ['MCVKB'], 'freshnessThresholdMonths': 12}
=== onenote-case-search.md ===
---
name: onenote-case-search
description: "Search personal OneNote for case-specific notes"
tools: Bash, Read, Write, Glob, Grep
model: sonnet
maxTurns: 15
---
=== casework SKILL.md has onenote-case-search ===
3
=== troubleshooter.md has OneNote section ===
1
=== CLAUDE.md has new agent ===
1
```

- [ ] **Step 2: Verify personal notebook directory exists and has content**

Run:
```bash
ONENOTE_DIR=$(python -c "import json; print(json.load(open('.claude/skills/onenote-export/config.json'))['outputDir'])")
PERSONAL=$(python -c "import json; print(json.load(open('config.json'))['onenote']['personalNotebook'])")
echo "Checking: $ONENOTE_DIR/$PERSONAL/"
ls "$ONENOTE_DIR/$PERSONAL/" 2>/dev/null | head -5 || echo "DIR NOT FOUND"
```

Expected: List of section directories in the personal notebook.

- [ ] **Step 3: Verify team notebook directory exists**

Run:
```bash
ONENOTE_DIR=$(python -c "import json; print(json.load(open('.claude/skills/onenote-export/config.json'))['outputDir'])")
for NB in $(python -c "import json; [print(n) for n in json.load(open('config.json'))['onenote']['teamNotebooks']]"); do
  echo "Checking: $ONENOTE_DIR/$NB/"
  ls "$ONENOTE_DIR/$NB/" 2>/dev/null | head -3 || echo "DIR NOT FOUND"
done
```

Expected: List of section directories in MCVKB.

- [ ] **Step 4: Note for manual testing**

After restarting the Claude Code session (so the new agent registers):
1. Run `/casework {caseNumber}` on a case that has personal OneNote notes
2. Verify `{caseDir}/onenote/personal-notes.md` is created during B2
3. Run `/troubleshoot {caseNumber}` and verify `research.md` includes `## OneNote 团队知识库` section

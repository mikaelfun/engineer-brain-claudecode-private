# Casework Architecture Refactor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure casework skill files into a 3-level hierarchy (casework → pipeline steps → actions), unify state writing, split full/patrol modes, and consolidate agent execution logic.

**Architecture:** Three-level nesting mirrors runtime topology: `casework/` (L1 orchestrator) → `data-refresh/`, `act/`, `summarize/` (L2 pipeline steps) → `assess/`, `troubleshoot/`, `reassess/`, `challenge/`, `draft-email/` (L3 actions under `act/`). Two entry points: `SKILL.md` (full mode) and `SKILL-patrol.md` (patrol mode). State writing follows wrapper pattern: L2 orchestrators write all state, L3 SKILL.md files are state-unaware.

**Tech Stack:** Markdown skill files, Bash scripts, Python (update-state.py), Git

**Spec:** `.tmp/casework-architecture-refactor-spec.md` (v3, user-approved)

---

## Critical File Map

**Files being moved (git mv):**
- `.claude/skills/casework/assess/` → `.claude/skills/casework/act/assess/`
- `.claude/skills/casework/reassess/` → `.claude/skills/casework/act/reassess/`
- `.claude/skills/casework/challenge/` → `.claude/skills/casework/act/challenge/`
- `.claude/skills/casework/draft-email/` → `.claude/skills/casework/act/draft-email/`
- `.claude/skills/casework/troubleshoot/` → `.claude/skills/casework/act/troubleshoot/`
- `.claude/skills/casework/teams-search/` → `.claude/skills/casework/data-refresh/teams-search/`

**Files being deleted:**
- `.claude/skills/casework/SKILL.v1-backup.md`

**Files being created:**
- `.claude/skills/casework/SKILL-patrol.md` (new, extracted from SKILL.md)

**Files being rewritten:**
- `.claude/skills/casework/SKILL.md` (slim full-mode orchestrator)
- `.claude/skills/casework/act/SKILL.md` (slim dynamic chain with loop)

**Files being trimmed to spawn configs:**
- `.claude/agents/troubleshooter.md`
- `.claude/agents/email-drafter.md`
- `.claude/agents/challenger.md`
- `.claude/agents/teams-search.md`

**Files with path/content updates:**
- `.claude/skills/casework/act/assess/SKILL.md` (internal script paths)
- `.claude/skills/casework/act/reassess/SKILL.md` (remove --step reassess)
- `.claude/skills/casework/act/challenge/SKILL.md` (remove state writes)
- `.claude/skills/casework/act/draft-email/SKILL.md` (remove state writes)
- `.claude/skills/casework/act/troubleshoot/SKILL.md` (remove state writes)
- `.claude/skills/casework/summarize/SKILL.md` (remove pipeline-state ref, fix step number)
- `.claude/skills/casework/phase2/SKILL.md` (path updates)
- `.claude/skills/casework/scripts/data-refresh.sh` (teams-search path)
- `.claude/skills/casework/scripts/finalize-state.sh` (potential path refs)
- `CLAUDE.md` (architecture description)

---

### Task 1: File Moves + Cleanup

**Files:**
- Move: 6 directories (see map above)
- Delete: `.claude/skills/casework/SKILL.v1-backup.md`

- [ ] **Step 1: Create target directories**

```bash
cd .claude/skills/casework
mkdir -p act/
mkdir -p data-refresh/
```

- [ ] **Step 2: Move act action directories**

```bash
cd .claude/skills/casework
git mv assess/ act/assess/
git mv reassess/ act/reassess/
git mv challenge/ act/challenge/
git mv draft-email/ act/draft-email/
git mv troubleshoot/ act/troubleshoot/
```

- [ ] **Step 3: Move teams-search into data-refresh**

```bash
cd .claude/skills/casework
git mv teams-search/ data-refresh/teams-search/
```

- [ ] **Step 4: Delete backup file**

```bash
git rm .claude/skills/casework/SKILL.v1-backup.md
```

- [ ] **Step 5: Verify moves**

```bash
# All 5 L3 actions should exist under act/
ls .claude/skills/casework/act/assess/SKILL.md
ls .claude/skills/casework/act/reassess/SKILL.md
ls .claude/skills/casework/act/challenge/SKILL.md
ls .claude/skills/casework/act/draft-email/SKILL.md
ls .claude/skills/casework/act/troubleshoot/SKILL.md
# teams-search should be under data-refresh/
ls .claude/skills/casework/data-refresh/teams-search/SKILL.md
# Old locations should not exist
ls .claude/skills/casework/assess/ 2>&1 | grep "No such"
ls .claude/skills/casework/teams-search/ 2>&1 | grep "No such"
ls .claude/skills/casework/SKILL.v1-backup.md 2>&1 | grep "No such"
```

- [ ] **Step 6: Commit**

```bash
git add -A .claude/skills/casework/
git commit -m "refactor(casework): move sub-skills into 3-level hierarchy

Move act actions (assess, reassess, challenge, draft-email, troubleshoot)
under act/ as L3 sub-skills. Move teams-search under data-refresh/.
Delete obsolete v1 backup file.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Merge Agent Execution Logic into L3 SKILL.md

Merge full execution logic from `agents/*.md` into `casework/act/{action}/SKILL.md`. After this task, each L3 SKILL.md is self-contained.

**Files:**
- Modify: `.claude/skills/casework/act/troubleshoot/SKILL.md`
- Modify: `.claude/skills/casework/act/challenge/SKILL.md`
- Modify: `.claude/skills/casework/act/draft-email/SKILL.md`
- Reference: `.claude/agents/troubleshooter.md` (lines 12-573)
- Reference: `.claude/agents/challenger.md` (lines 12-303)
- Reference: `.claude/agents/email-drafter.md` (lines 10-177)

- [ ] **Step 1: Merge troubleshooter**

Read `.claude/agents/troubleshooter.md` lines 12 to end (everything after the `---` frontmatter closing). Write `.claude/skills/casework/act/troubleshoot/SKILL.md` with:

```markdown
---
description: "技术排查 + 写分析报告。作为 act 动态链的 subagent action 执行。"
name: casework:act:troubleshoot
displayName: 技术排查
category: casework-act-action
stability: stable
executionMode: subagent
requiredInput: caseNumber, caseDir
---

{paste agents/troubleshooter.md lines 12-end here, verbatim}
```

Remove any `update-state.py` WRITE calls if present (troubleshooter reads state.json for runId which is fine — only writes are forbidden for L3).

- [ ] **Step 2: Merge challenger**

Read `.claude/agents/challenger.md` lines 12 to end. Write `.claude/skills/casework/act/challenge/SKILL.md` with:

```markdown
---
description: "证据链审计 — 独立审查 troubleshooter 分析的事实依据。作为 act 动态链的 subagent action 执行。"
name: casework:act:challenge
displayName: 证据链审查
category: casework-act-action
stability: beta
executionMode: subagent
requiredInput: caseNumber, caseDir, product
---

{paste agents/challenger.md lines 12-end here, verbatim}
```

- [ ] **Step 3: Merge email-drafter**

Read `.claude/agents/email-drafter.md` lines 10 to end. Write `.claude/skills/casework/act/draft-email/SKILL.md` with:

```markdown
---
description: "写邮件草稿 + humanizer 润色。作为 act 动态链的 inline/subagent action 执行。"
name: casework:act:draft-email
displayName: 邮件草稿
category: casework-act-action
stability: stable
executionMode: inline-preferred
requiredInput: caseNumber, caseDir, emailType
---

{paste agents/email-drafter.md lines 10-end here, verbatim}
```

- [ ] **Step 4: Verify no update-state.py WRITE calls in L3 files**

```bash
grep -rn "update-state" .claude/skills/casework/act/troubleshoot/SKILL.md \
  .claude/skills/casework/act/challenge/SKILL.md \
  .claude/skills/casework/act/draft-email/SKILL.md
# Expected: only state.json READ references (for runId log paths), zero update-state.py calls
# If any update-state.py calls found, remove them (state is written by act orchestrator)
```

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/casework/act/troubleshoot/SKILL.md \
  .claude/skills/casework/act/challenge/SKILL.md \
  .claude/skills/casework/act/draft-email/SKILL.md
git commit -m "refactor(casework): merge agent execution logic into L3 SKILL.md

Troubleshooter, challenger, email-drafter execution logic now lives in
casework/act/{action}/SKILL.md. L3 files are state-unaware (no
update-state.py writes). agents/*.md will be trimmed in next commit.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Slim agents/*.md to Spawn Configs

**Files:**
- Modify: `.claude/agents/troubleshooter.md`
- Modify: `.claude/agents/email-drafter.md`
- Modify: `.claude/agents/challenger.md`
- Modify: `.claude/agents/teams-search.md`

- [ ] **Step 1: Trim troubleshooter.md**

Replace entire `.claude/agents/troubleshooter.md` with:

```markdown
---
name: troubleshooter
description: "技术排查 + 写分析报告"
tools: Bash, Read, Write, Glob, Grep, WebSearch
model: opus
maxTurns: 200
mcpServers:
  - msft-learn
  - local-rag
---

# Troubleshooter Agent

读取 `.claude/skills/casework/act/troubleshoot/SKILL.md` 获取完整执行步骤，然后执行。
```

- [ ] **Step 2: Trim email-drafter.md**

Replace entire `.claude/agents/email-drafter.md` with:

```markdown
---
name: email-drafter
description: "写邮件草稿 + humanizer 润色"
tools: Read, Write, Bash
model: opus
maxTurns: 200
---

# Email Drafter Agent

读取 `.claude/skills/casework/act/draft-email/SKILL.md` 获取完整执行步骤，然后执行。
```

- [ ] **Step 3: Trim challenger.md**

Replace entire `.claude/agents/challenger.md` with:

```markdown
---
name: challenger
description: "证据链审计 — 审查 troubleshooter 分析的事实依据"
tools: Bash, Read, Write, Glob, Grep, WebSearch
model: opus
maxTurns: 200
mcpServers:
  - msft-learn
  - local-rag
---

# Challenger Agent

读取 `.claude/skills/casework/act/challenge/SKILL.md` 获取完整执行步骤，然后执行。
```

- [ ] **Step 4: Trim teams-search.md**

Replace entire `.claude/agents/teams-search.md` with:

```markdown
---
name: teams-search
description: "Teams 消息搜索 + 落盘"
tools: Bash, Read, Write
model: sonnet
maxTurns: 200
mcpServers:
  - teams
---

# Teams Search Agent

读取 `.claude/skills/casework/data-refresh/teams-search/SKILL.md` 获取完整执行步骤，然后执行。
```

- [ ] **Step 5: Verify each agent file is ≤ 15 lines**

```bash
wc -l .claude/agents/troubleshooter.md .claude/agents/email-drafter.md \
  .claude/agents/challenger.md .claude/agents/teams-search.md
# Expected: each ≤ 15 lines
```

- [ ] **Step 6: Commit**

```bash
git add .claude/agents/troubleshooter.md .claude/agents/email-drafter.md \
  .claude/agents/challenger.md .claude/agents/teams-search.md
git commit -m "refactor(agents): slim to spawn configs with SKILL.md references

Agent files now only contain spawn metadata (name, tools, model, mcpServers)
and a one-line reference to the corresponding L3 SKILL.md. Execution logic
lives in casework/act/{action}/SKILL.md.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Update All Path References

**Files:**
- Modify: `.claude/skills/casework/act/SKILL.md` (refs to assess, reassess, agents)
- Modify: `.claude/skills/casework/act/assess/SKILL.md` (internal script paths)
- Modify: `.claude/skills/casework/act/reassess/SKILL.md` (internal refs)
- Modify: `.claude/skills/casework/phase2/SKILL.md` (refs to agents, assess, reassess)
- Modify: `.claude/skills/casework/summarize/SKILL.md` (step number, pipeline-state)
- Modify: `.claude/skills/casework/act/challenge/SKILL.md` (if any casework/ refs)
- Modify: `.claude/skills/casework/scripts/data-refresh.sh` (teams-search path)
- Modify: `.claude/skills/casework/scripts/finalize-state.sh` (if any old refs)
- Modify: `.claude/skills/casework/labor-estimate/SKILL.md` (if any old refs)

- [ ] **Step 1: Find all old path references**

```bash
cd .claude/skills/casework
# Find references to old locations (should all be updated)
grep -rn "casework/assess/" --include="*.md" --include="*.sh" --include="*.py" .
grep -rn "casework/reassess/" --include="*.md" --include="*.sh" --include="*.py" .
grep -rn "casework/challenge/" --include="*.md" --include="*.sh" --include="*.py" .
grep -rn "casework/draft-email/" --include="*.md" --include="*.sh" --include="*.py" .
grep -rn "casework/troubleshoot/" --include="*.md" --include="*.sh" --include="*.py" .
grep -rn "casework/teams-search/" --include="*.md" --include="*.sh" --include="*.py" .
# Also check agents/ references that should now point to L3 SKILL.md
grep -rn "agents/troubleshooter.md" --include="*.md" .
grep -rn "agents/email-drafter.md" --include="*.md" .
grep -rn "agents/challenger.md" --include="*.md" .
```

Output shows every line that needs updating. Record this list.

- [ ] **Step 2: Update each reference**

For each match from Step 1, use Edit tool to replace old path with new path. Key replacements:

| Old | New |
|-----|-----|
| `casework/assess/` | `casework/act/assess/` |
| `casework/reassess/` | `casework/act/reassess/` |
| `casework/challenge/` | `casework/act/challenge/` |
| `casework/draft-email/` | `casework/act/draft-email/` |
| `casework/troubleshoot/` | `casework/act/troubleshoot/` |
| `casework/teams-search/` | `casework/data-refresh/teams-search/` |
| `agents/troubleshooter.md` | `casework/act/troubleshoot/SKILL.md` |
| `agents/email-drafter.md` | `casework/act/draft-email/SKILL.md` |
| `agents/challenger.md` | `casework/act/challenge/SKILL.md` |

Also update data-refresh.sh: search for `teams-search` path references and update.

- [ ] **Step 3: Update summarize/SKILL.md step number**

In `.claude/skills/casework/summarize/SKILL.md`:
- Change frontmatter description from "Step 4" to "Pipeline Step 3"
- Remove `pipeline-state.json` from output contract

- [ ] **Step 4: Verify no old paths remain**

```bash
cd .claude/skills/casework
grep -rn "casework/assess/" --include="*.md" --include="*.sh" --include="*.py" . | grep -v "act/assess"
grep -rn "casework/reassess/" --include="*.md" --include="*.sh" --include="*.py" . | grep -v "act/reassess"
grep -rn "casework/challenge/" --include="*.md" --include="*.sh" --include="*.py" . | grep -v "act/challenge"
grep -rn "casework/draft-email/" --include="*.md" --include="*.sh" --include="*.py" . | grep -v "act/draft-email"
grep -rn "casework/troubleshoot/" --include="*.md" --include="*.sh" --include="*.py" . | grep -v "act/troubleshoot"
grep -rn "casework/teams-search/" --include="*.md" --include="*.sh" --include="*.py" . | grep -v "data-refresh/teams-search"
# Expected: zero matches for all
```

- [ ] **Step 5: Verify no pipeline-state.json references remain**

```bash
grep -rn "pipeline-state" .claude/skills/casework/ --include="*.md"
# Expected: zero matches (all removed)
```

- [ ] **Step 6: Commit**

```bash
git add -A .claude/skills/casework/ .claude/agents/
git commit -m "refactor(casework): update all internal path references

All SKILL.md files now reference the new 3-level paths. Removed all
pipeline-state.json ghost references. Updated data-refresh.sh
teams-search path.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: State Writing Cleanup

**Files:**
- Modify: `.claude/skills/casework/act/reassess/SKILL.md` (fix --step reassess)
- Modify: `.claude/skills/casework/act/assess/SKILL.md` (remove state writes — now L3)
- Modify: `.claude/skills/casework/act/challenge/SKILL.md` (remove state writes — now L3)
- Modify: `.claude/skills/casework/labor-estimate/SKILL.md` (remove state writes — now L3)

- [ ] **Step 1: Fix reassess --step parameter**

In `.claude/skills/casework/act/reassess/SKILL.md`, find all occurrences of `--step reassess` and replace with `--step act --action reassess`. Specifically in Step 6:

```bash
# Old (wrong):
python3 .claude/skills/casework/scripts/update-state.py \
  --case-dir "{caseDir}" --step reassess --status completed

# New (correct):
# REMOVED — L3 SKILL.md does not write state.
# State is written by the act orchestrator (act/SKILL.md) or phase2 orchestrator.
```

Since reassess is now L3 and L3 doesn't write state, simply **remove** all `update-state.py` calls from `reassess/SKILL.md`.

- [ ] **Step 2: Remove state writes from assess/SKILL.md**

In `.claude/skills/casework/act/assess/SKILL.md`, remove all `update-state.py` calls. The act orchestrator handles all action-level state. Specifically remove these patterns:
- `python3 .claude/skills/casework/scripts/update-state.py --case-dir "{caseDir}" --step act --action assess --status active`
- `python3 .claude/skills/casework/scripts/update-state.py --case-dir "{caseDir}" --step act --action assess --status completed`

Keep any state.json READs (for runId log paths) — only remove WRITES.

- [ ] **Step 3: Remove state writes from challenge/SKILL.md**

In `.claude/skills/casework/act/challenge/SKILL.md`, find and remove the state write lines (lines ~54-55 in the original):
```
⏱ 执行前：update-state.py --case-dir "$CASE_DIR" --step act --action challenger --status active
⏱ 执行后：update-state.py --case-dir "$CASE_DIR" --step act --action challenger --status completed
```

- [ ] **Step 4: Remove state writes from labor-estimate/SKILL.md**

In `.claude/skills/casework/labor-estimate/SKILL.md`, remove:
```
python3 .claude/skills/casework/scripts/update-state.py --case-dir "$CASE_DIR" --step act --action labor-estimate --status active
python3 .claude/skills/casework/scripts/update-state.py --case-dir "$CASE_DIR" --step act --action labor-estimate --status completed
```

- [ ] **Step 5: Verify zero update-state.py calls in L3 files**

```bash
grep -rn "update-state.py" \
  .claude/skills/casework/act/assess/SKILL.md \
  .claude/skills/casework/act/reassess/SKILL.md \
  .claude/skills/casework/act/challenge/SKILL.md \
  .claude/skills/casework/act/draft-email/SKILL.md \
  .claude/skills/casework/act/troubleshoot/SKILL.md \
  .claude/skills/casework/labor-estimate/SKILL.md
# Expected: zero matches
```

- [ ] **Step 6: Commit**

```bash
git add -A .claude/skills/casework/
git commit -m "refactor(casework): remove state writes from L3 SKILL.md files

L3 action SKILL.md files no longer call update-state.py. All state
writes are now the responsibility of the L2 orchestrator (act/SKILL.md
or phase2/SKILL.md). Fixed reassess --step parameter bug (was creating
orphan steps.reassess entries).

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Rewrite act/SKILL.md as Slim Dynamic Chain

**Files:**
- Rewrite: `.claude/skills/casework/act/SKILL.md`

- [ ] **Step 1: Read current act/SKILL.md to capture routing table and AR rules**

Read `.claude/skills/casework/act/SKILL.md` fully. Extract the routing table (§ "路由参考表 v4") and AR routing table — these are kept as reference docs. Everything else is replaced.

- [ ] **Step 2: Write new act/SKILL.md**

Replace `.claude/skills/casework/act/SKILL.md` with the slim dynamic chain orchestrator (~100 lines). The key structure:

```markdown
---
description: "Pipeline Step 2 Act — 动态链编排器：assess → [troubleshooter → reassess → challenger ↺] → email-drafter"
name: casework:act
displayName: Act 动态链
category: casework-sub-skill
stability: beta
requiredInput: caseNumber, caseDir
---

# /casework:act — Pipeline Step 2

Full Mode 动态链编排器。先执行 assess 产出 execution-plan，然后按 plan 路由执行。
所有 subagent 使用 general-purpose（不指定 subagent_type）。
本编排器负责所有 action-level 状态写入，L3 SKILL.md 不写状态。

## 输入/输出契约
（keep existing input/output contracts, remove pipeline-state.json）

## 执行步骤

### Act.0 Assess (inline)
update-state --step act --action assess --status active
读取 act/assess/SKILL.md，inline 执行
update-state --step act --action assess --status completed --result "$STATUS"

### Act.1 解析 execution-plan
eval $(bash act/scripts/read-plan.sh "$CASE_DIR")
ACTION_COUNT == 0 → exit

### Act.2 动态链（可回环）

LOOP=true; CHALLENGE_RESULT=""
while $LOOP:
  # troubleshooter (subagent)
  update-state --action troubleshooter --status active
  Agent(general-purpose, model=opus, prompt=读取 act/troubleshoot/SKILL.md + challenge_result)
  update-state --action troubleshooter --status completed

  # reassess (inline)
  update-state --action reassess --status active
  读取 act/reassess/SKILL.md inline 执行
  update-state --action reassess --status completed

  # challenger gate
  if triggerChallenge:
    update-state --action challenger --status active
    Agent(general-purpose, model=opus, prompt=读取 act/challenge/SKILL.md)
    update-state --action challenger --status completed
    if result == retry: continue
  LOOP=false

### Act.3 Email (inline 优先)
if 需要 email:
  update-state --action email-drafter --status active
  inline 读取 act/draft-email/SKILL.md (上下文过长则 subagent)
  update-state --action email-drafter --status completed

echo "ACT_OK|actions=$N|loops=$LOOP_COUNT|elapsed=${SECONDS}s"

## 路由参考表
（keep existing routing tables from old act/SKILL.md）

## Safety Redlines / Error Handling
（keep existing）
```

Note: Show the FULL content when implementing — the above is the structural skeleton.

- [ ] **Step 3: Verify act/SKILL.md has all state writes**

```bash
grep -c "update-state" .claude/skills/casework/act/SKILL.md
# Expected: ≥ 10 (active + completed for each of 5 actions)
```

- [ ] **Step 4: Verify act/SKILL.md does NOT write step-level state**

```bash
grep "update-state.*--step act --status" .claude/skills/casework/act/SKILL.md
# Expected: zero matches (step-level is L1's responsibility)
```

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/casework/act/SKILL.md
git commit -m "refactor(casework): rewrite act/SKILL.md as slim dynamic chain

~100 line orchestrator with loop-back logic. Writes all action-level
state. Does not write step-level state (L1 responsibility). Uses
general-purpose agents for all subagent spawns.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: Mode Split — SKILL.md + SKILL-patrol.md

**Files:**
- Rewrite: `.claude/skills/casework/SKILL.md` (full mode only)
- Create: `.claude/skills/casework/SKILL-patrol.md` (patrol mode)

- [ ] **Step 1: Read current SKILL.md to extract patrol logic**

Read `.claude/skills/casework/SKILL.md`. Identify all patrol-specific sections (mode=patrol branches, patrol routing paths A-F, CASEWORK_PATROL_OK/WAITING signals).

- [ ] **Step 2: Create SKILL-patrol.md**

Write `.claude/skills/casework/SKILL-patrol.md` with the patrol-specific orchestration (~100 lines):

```markdown
---
description: "Case 处理 Patrol Mode：data-refresh → assess → 路由分流（自闭环/退出）"
name: casework:patrol
displayName: Case 处理（Patrol）
category: orchestrator
stability: stable
requiredInput: caseNumber
steps:
  - data-refresh
  - assess
  - route
promptTemplate: |
  Process Case {caseNumber} in patrol mode. Read .claude/skills/casework/SKILL-patrol.md and follow all steps.
---

# /casework:patrol — Patrol Mode

三路分流编排器。data-refresh → assess → 路由分流。

## Pipeline Step 1. 初始化 + Data Refresh
（same as full mode — data-refresh.sh）

## Pipeline Step 2. Assess
update-state --step act --status active
update-state --step act --action assess --status active
读取 act/assess/SKILL.md 执行
update-state --step act --action assess --status completed
eval $(bash act/scripts/read-plan.sh)

## Pipeline Step 3. 路由分流

### 路径 A/B (actions=0)
update-state --step act --status completed
读取 summarize/SKILL.md 执行
echo "CASEWORK_PATROL_OK|path=self-closed|actions=0"

### 路径 C (email only)
update-state --action email-drafter --status active
读取 act/draft-email/SKILL.md inline 执行
update-state --action email-drafter --status completed
update-state --step act --status completed
读取 summarize/SKILL.md 执行
echo "CASEWORK_PATROL_OK|path=self-closed|actions=email"

### 路径 D/E/F (troubleshooter)
if IR_FIRST: 读取 act/draft-email/SKILL.md inline 执行 (emailType=initial-response)
update-state --step act --status waiting-troubleshooter
echo "CASEWORK_PATROL_WAITING|path=needs-troubleshooter"
# 退出。patrol 主 agent 接管 → spawn troubleshooter → spawn phase2
```

Note: Show FULL content when implementing.

- [ ] **Step 3: Rewrite SKILL.md for full mode only**

Remove all patrol branching from `.claude/skills/casework/SKILL.md`. Result is ~80 lines, linear:

```markdown
---
description: "Case 全流程处理 Full Mode：data-refresh → act → summarize"
name: casework
displayName: Case 全流程处理
category: orchestrator
stability: stable
requiredInput: caseNumber
steps:
  - data-refresh
  - act
  - summarize
promptTemplate: |
  Process Case {caseNumber}. Read .claude/skills/casework/SKILL.md and follow all steps.
---

# /casework — Full Mode

三步线性编排器。

## Pipeline Step 1. 初始化 + Data Refresh
（init state, run data-refresh.sh）

## Pipeline Step 2. Act
update-state --step act --status active
读取 act/SKILL.md 执行
update-state --step act --status completed

## Pipeline Step 3. Summarize
update-state --step summarize --status active
读取 summarize/SKILL.md 执行
update-state --step summarize --status completed

## Pipeline Step 4. 展示结果
读取 todo/ 展示
```

- [ ] **Step 4: Update phase2/SKILL.md paths**

In `.claude/skills/casework/phase2/SKILL.md`, update all internal references to use new paths (act/reassess/, act/challenge/, act/draft-email/).

- [ ] **Step 5: Verify both entry points exist and reference correct files**

```bash
head -20 .claude/skills/casework/SKILL.md
head -20 .claude/skills/casework/SKILL-patrol.md
# Verify: SKILL.md references act/SKILL.md, SKILL-patrol.md references act/assess/SKILL.md
grep "act/SKILL.md" .claude/skills/casework/SKILL.md
grep "act/assess/SKILL.md" .claude/skills/casework/SKILL-patrol.md
```

- [ ] **Step 6: Verify SKILL.md has NO patrol references**

```bash
grep -i "patrol" .claude/skills/casework/SKILL.md
# Expected: zero matches (all patrol logic in SKILL-patrol.md)
```

- [ ] **Step 7: Commit**

```bash
git add .claude/skills/casework/SKILL.md .claude/skills/casework/SKILL-patrol.md \
  .claude/skills/casework/phase2/SKILL.md
git commit -m "refactor(casework): split full/patrol modes into separate entry points

SKILL.md is now full-mode only (~80 lines, linear).
SKILL-patrol.md handles patrol routing (3-path branching).
phase2/SKILL.md paths updated.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 8: Update CLAUDE.md + Final Verification

**Files:**
- Modify: `CLAUDE.md`
- Verify: all files

- [ ] **Step 1: Update CLAUDE.md architecture description**

In `CLAUDE.md`, update the "Main Agent 架构" section:

Replace the casework description with:
```markdown
**casework 三步编排器（两入口）：**
- `SKILL.md` (Full Mode): `data-refresh → act → summarize`
- `SKILL-patrol.md` (Patrol Mode): `data-refresh → assess → 路由分流`

子组件架构（三级嵌套）：
- L2: data-refresh/ | act/ | summarize/ | phase2/
- L3 (act 下): assess/ | troubleshoot/ | reassess/ | challenge/ | draft-email/
- L3 (data-refresh 下): teams-search/

状态写入：L1 写 step-level, L2(act) 写 action-level, L3 不写状态
```

- [ ] **Step 2: Final path verification — no old paths anywhere**

```bash
# Full project-wide scan for old paths
grep -rn "casework/assess/" .claude/ --include="*.md" --include="*.sh" --include="*.py" | grep -v "act/assess" | grep -v ".tmp/"
grep -rn "casework/reassess/" .claude/ --include="*.md" --include="*.sh" --include="*.py" | grep -v "act/reassess" | grep -v ".tmp/"
grep -rn "casework/challenge/" .claude/ --include="*.md" --include="*.sh" --include="*.py" | grep -v "act/challenge" | grep -v ".tmp/"
grep -rn "casework/draft-email/" .claude/ --include="*.md" --include="*.sh" --include="*.py" | grep -v "act/draft-email" | grep -v ".tmp/"
grep -rn "casework/troubleshoot/" .claude/ --include="*.md" --include="*.sh" --include="*.py" | grep -v "act/troubleshoot" | grep -v ".tmp/"
grep -rn "casework/teams-search/" .claude/ --include="*.md" --include="*.sh" --include="*.py" | grep -v "data-refresh/teams-search" | grep -v ".tmp/"
# Expected: zero matches for all
```

- [ ] **Step 3: Final state write verification — no L3 state writes**

```bash
grep -rn "update-state" .claude/skills/casework/act/assess/ \
  .claude/skills/casework/act/reassess/ \
  .claude/skills/casework/act/challenge/ \
  .claude/skills/casework/act/draft-email/ \
  .claude/skills/casework/act/troubleshoot/ \
  .claude/skills/casework/labor-estimate/
# Expected: zero matches
```

- [ ] **Step 4: Final pipeline-state verification**

```bash
grep -rn "pipeline-state" .claude/skills/casework/ --include="*.md"
# Expected: zero matches
```

- [ ] **Step 5: Structure verification**

```bash
# Verify 3-level structure exists
echo "=== L2 directories ==="
ls -d .claude/skills/casework/*/
echo "=== L3 under act/ ==="
ls -d .claude/skills/casework/act/*/
echo "=== L3 under data-refresh/ ==="
ls -d .claude/skills/casework/data-refresh/*/
echo "=== Both entry points ==="
ls .claude/skills/casework/SKILL.md .claude/skills/casework/SKILL-patrol.md
```

Expected output:
```
=== L2 directories ===
act/ data-refresh/ summarize/ phase2/ note-gap/ labor-estimate/ scripts/
=== L3 under act/ ===
assess/ troubleshoot/ reassess/ challenge/ draft-email/ scripts/
=== L3 under data-refresh/ ===
teams-search/
=== Both entry points ===
SKILL.md  SKILL-patrol.md
```

- [ ] **Step 6: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md with new casework 3-level architecture

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Verification

After all tasks complete, verify end-to-end:

1. **Structure:** `find .claude/skills/casework -name "SKILL.md" | sort` should show the complete 3-level hierarchy
2. **No orphan refs:** `grep -rn "casework/assess/" .claude/ | grep -v act/assess | grep -v .tmp/` → zero
3. **No pipeline-state:** `grep -rn "pipeline-state" .claude/skills/casework/` → zero
4. **No L3 state writes:** `grep -rn "update-state" .claude/skills/casework/act/{assess,reassess,challenge,draft-email,troubleshoot}/` → zero
5. **Agents are slim:** `wc -l .claude/agents/{troubleshooter,email-drafter,challenger,teams-search}.md` → each ≤ 15
6. **Two entry points:** `ls .claude/skills/casework/SKILL*.md` → `SKILL.md`, `SKILL-patrol.md`
7. **No patrol in SKILL.md:** `grep -i patrol .claude/skills/casework/SKILL.md` → zero

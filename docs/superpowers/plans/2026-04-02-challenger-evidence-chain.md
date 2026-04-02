# Challenger Evidence Chain Audit System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Challenger agent that audits troubleshooter analysis conclusions against objective evidence, preventing confirmation bias from propagating through the casework pipeline.

**Architecture:** Troubleshooter produces `claims.json` alongside analysis reports. When low-confidence claims exist, a Challenger agent independently verifies evidence chains using msft-learn + local-rag MCP. Auto-loop drives retries or request-info emails. Inspection-writer and email-drafter become claims-aware, protecting case-summary.md from unverified conclusions.

**Tech Stack:** Markdown agent/skill definitions, Bash scripting (casework-timing.sh), React 18 + TypeScript + TanStack Query (Dashboard), Hono.js (Dashboard API)

**Spec:** `docs/superpowers/specs/2026-04-02-challenger-evidence-chain-design.md`

---

### Task 1: Claims JSON Schema Documentation

**Files:**
- Create: `playbooks/schemas/claims-schema.md`

This task documents the `claims.json` schema that all subsequent tasks depend on. No other files reference it yet, so it's safe to create first.

- [ ] **Step 1: Create the claims schema document**

Create `playbooks/schemas/claims-schema.md` with this exact content:

```markdown
# claims.json Schema

> Version: 1
> Location: `{caseDir}/claims.json`
> Writers: troubleshooter (creates) → challenger (updates status)
> Consumers: challenger, email-drafter, inspection-writer, Dashboard

## Overview

Structured evidence chain declarations extracted from troubleshooter analysis reports.
Each claim represents a key technical judgment with confidence level and supporting evidence.

## Root Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `version` | number | yes | Schema version, currently `1` |
| `generatedAt` | string (ISO8601) | yes | When claims were extracted |
| `generatedBy` | string | yes | Always `"troubleshooter"` |
| `analysisRef` | string | yes | Relative path to the analysis.md file (e.g. `analysis/20260402-1030-topic.md`) |
| `overallConfidence` | enum | yes | `"high"` / `"medium"` / `"low"` |
| `triggerChallenge` | boolean | yes | Whether to auto-trigger Challenger agent |
| `retryCount` | number | yes | Troubleshooter retry count, starts at `0` |
| `claims` | array | yes | Array of Claim objects |

### overallConfidence Calculation

```
if (all claims confidence === "high") → "high"
else if (any claim confidence === "none") → "low"
else if (any claim confidence === "low") → "low"
else → "medium"
```

### triggerChallenge Calculation

```
triggerChallenge = claims.some(c => c.confidence === "low" || c.confidence === "none")
```

## Claim Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Auto-incrementing: `"C1"`, `"C2"`, ... |
| `claim` | string | yes | Natural language description of the technical judgment |
| `type` | enum | yes | `"root-cause"` / `"cause-chain"` / `"impact"` / `"recommendation"` / `"observation"` |
| `confidence` | enum | yes | `"high"` (multi-source cross-verified) / `"medium"` (single source) / `"low"` (speculative, weak evidence) / `"none"` (pure guess) |
| `evidence` | array | yes | Array of Evidence objects (can be empty for low/none confidence) |
| `status` | enum | yes | `"pending"` → `"verified"` / `"challenged"` / `"rejected"` (updated by Challenger) |
| `note` | string? | no | Troubleshooter's self-annotation |
| `challengerNote` | string? | no | Challenger's review comment |

### Type Mapping from Analysis Report

| Analysis Section | Claim Type |
|------------------|-----------|
| 「分析结论」root cause judgments | `root-cause` |
| Causal chain supporting root cause | `cause-chain` |
| 「建议方案」recommendations | `recommendation` |
| Environmental observations | `observation` |
| Impact scope judgments | `impact` |

## Evidence Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `source` | string | yes | File path relative to caseDir, optionally with `#section` anchor (e.g. `research/research.md#Microsoft Learn`) |
| `excerpt` | string | yes | Specific text from source that supports the claim |
| `sourceType` | enum | yes | See sourceType enum below |
| `url` | string? | no | External URL for `official-doc`, `ado-wiki`, `web-search` types |

### sourceType Enum

| Value | Source | Trust Level |
|-------|--------|-------------|
| `kusto-result` | Kusto query results in `kusto/*.md` | Fact (system telemetry) |
| `official-doc` | Microsoft Learn documentation | Authoritative reference |
| `ado-wiki` | ADO Wiki / TSG pages | High (may be outdated) |
| `onenote-team` | Team OneNote knowledge base | High (check modified date) |
| `onenote-personal` | Personal OneNote notes | Medium (may contain prior AI analysis) |
| `product-skill` | `skills/products/{product}/SKILL.md` or `known-issues.jsonl` | High (project-maintained) |
| `customer-statement` | Customer emails/Teams messages | Fact (customer's own words) |
| `icm-data` | ICM incident data | Fact (system data) |
| `web-search` | Public web search results | Low (lowest signal-to-noise) |

## Status Transitions

```
pending ──┬──→ verified    (Challenger found supporting evidence)
          ├──→ challenged  (Challenger found no evidence, but no contradiction)
          └──→ rejected    (Challenger found contradicting evidence)
```

Only Challenger updates status. Troubleshooter always writes `"pending"`.

## Example

```json
{
  "version": 1,
  "generatedAt": "2026-04-02T10:30:00+08:00",
  "generatedBy": "troubleshooter",
  "analysisRef": "analysis/20260402-1030-aks-pss-policy.md",
  "overallConfidence": "low",
  "triggerChallenge": true,
  "retryCount": 0,
  "claims": [
    {
      "id": "C1",
      "claim": "AKS 集群的 Pod Security Standards enforcement 导致 Pod 被 reject",
      "type": "root-cause",
      "confidence": "high",
      "evidence": [
        {
          "source": "kusto/20260402-1030-aks-audit-logs.md",
          "excerpt": "PodSecurityPolicy violation: privileged=true rejected",
          "sourceType": "kusto-result"
        },
        {
          "source": "research/research.md#Microsoft Learn",
          "excerpt": "AKS PSS enforcement rejects pods violating baseline profile",
          "sourceType": "official-doc",
          "url": "https://learn.microsoft.com/azure/aks/use-psa"
        }
      ],
      "status": "pending",
      "challengerNote": null
    },
    {
      "id": "C2",
      "claim": "升级到 1.28 后 PSS 默认从 warn 变为 enforce",
      "type": "cause-chain",
      "confidence": "low",
      "evidence": [],
      "status": "pending",
      "note": "未找到官方文档确认此行为变化，可能是推测",
      "challengerNote": null
    }
  ]
}
```
```

- [ ] **Step 2: Verify the file**

Run: `cat playbooks/schemas/claims-schema.md | head -5`
Expected: The first 5 lines showing the title and version.

- [ ] **Step 3: Commit**

```bash
git add playbooks/schemas/claims-schema.md
git commit -m "docs: add claims.json schema for evidence chain audit system"
```

---

### Task 2: Challenger Agent Definition

**Files:**
- Create: `.claude/agents/challenger.md`

Creates the Challenger agent that Casework will spawn. Includes full execution steps, trust classification, and logging spec.

- [ ] **Step 1: Create the Challenger agent definition**

Create `.claude/agents/challenger.md` with the complete agent definition. The file must contain:

1. **Frontmatter** (YAML, between `---` markers):
   - `name: challenger`
   - `description: "证据链审计 — 审查 troubleshooter 分析的事实依据"`
   - `tools: Bash, Read, Write, Glob, Grep, WebSearch`
   - `model: opus`
   - `mcpServers:` list with `msft-learn` and `local-rag`
   - `maxTurns: 20`

2. **Body** (Markdown after frontmatter) with these sections:
   - `# Challenger Agent` — role description
   - `## 输入` — caseNumber, caseDir, product
   - `## 执行日志` — log format spec: `{caseDir}/logs/challenger.log`, format `[YYYY-MM-DD HH:MM:SS] ...`
   - `## 数据信任分类` — three sub-sections:
     - `### 事实源（可信）` — table listing case-info.md, emails.md, notes.md, teams/*.md, kusto/*.md, icm/, attachments/, context/user-inputs.jsonl
     - `### 知识源（权威参考）` — table listing Microsoft Learn (official-doc, highest), ADO Wiki (ado-wiki, high but may be outdated), OneNote team KB (onenote-team, high, check modified date), Product SKILL.md (product-skill, high), known-issues.jsonl (product-skill, medium), WebSearch (web-search, low)
     - `### 推断源（需审查，不能自证）` — table listing analysis/*.md, drafts/*.md, case-summary.md, onenote/personal-notes.md CLI analyses
   - `## 执行步骤` with 7 steps exactly as defined in the spec (Section 3):
     - Step 1: 加载事实上下文（list all fact source files to read）
     - Step 2: 加载待审查对象（claims.json + latest analysis.md）
     - Step 3: 结构化声明审计（check matrix table: 引用存在性, 引用准确性, 文档时效性, 21v 适用性, 交叉验证, 逻辑一致性）
     - Step 4: 隐性推断扫描（scan analysis.md for unextracted inferences — hedge words, unverified causal chains, unsourced technical claims → add as new claims with status: challenged）
     - Step 5: 独立证据搜索（for low/none/challenged claims: msft-learn MCP → local-rag → product skill known-issues.jsonl → WebSearch; update status based on findings）
     - Step 6: 产出（6a: update claims.json status + challengerNote; 6b: write challenge-report.md with template from spec）
     - Step 7: 触发后续动作（decision table with 5 rows from spec, return ACTION tag in final output）
   - `## 日志规范` — example log format from spec
   - `## 不使用的工具` — ❌ 不执行 Kusto 查询, ❌ 不写邮件草稿, ❌ 不修改 case-summary.md

**Critical details for the agent body:**
- Step 6b challenge-report.md template must include: header (Reviewed/Reviewed at/Product), 审查摘要 (counts), 详细审查 (per-claim with ✅⚠️❌ prefixes), 需要的额外信息 (checklist), 建议替代方向
- Step 7 decision table: `rejected=0, challenged=0 → ACTION:pass` | `rejected=0, challenged>0, info_needed non-empty → ACTION:request-info` | `rejected=0, challenged>0, info_needed empty → ACTION:pass` | `rejected>0, retryCount=0 → ACTION:retry` | `rejected>0, retryCount>=1 → ACTION:escalate`

- [ ] **Step 2: Verify frontmatter is valid**

Run: `head -10 .claude/agents/challenger.md`
Expected: Valid YAML frontmatter with `name: challenger` and `description:` fields.

- [ ] **Step 3: Commit**

```bash
git add .claude/agents/challenger.md
git commit -m "feat: add Challenger agent for evidence chain audit"
```

---

### Task 3: Troubleshooter Step 5a — Claims Extraction

**Files:**
- Modify: `.claude/agents/troubleshooter.md` (add Step 5a after Step 5, add Step 6 renumbering for knowledge writeback)

This adds the claims extraction step to the troubleshooter. After writing analysis.md (Step 5), troubleshooter extracts each key judgment into claims.json with confidence + evidence references.

- [ ] **Step 1: Add Step 5a to troubleshooter.md**

Insert after the existing `### 5. 写分析报告` section (around line 154) and before `### 6. 排查后知识写回`, add this new section:

```markdown
### 5a. 证据链提取（写 claims.json）

从刚写好的 analysis.md 中提取每个关键技术判断，生成 `{caseDir}/claims.json`。

**提取规则**：
- 「分析结论」section 中的每个根因判断 → `type: root-cause`
- 支撑根因的因果链条 → `type: cause-chain`
- 「建议方案」section 中的每个建议 → `type: recommendation`
- 对客户环境的重要观察 → `type: observation`
- 影响范围判断 → `type: impact`

**Confidence 标注规则**（⚠️ 诚实自评是核心要求）：
- `high`：≥2 个独立来源交叉验证（如 Kusto 结果 + 官方文档）
- `medium`：单一可信来源支持（如仅有 Kusto 结果，或仅有文档说明）
- `low`：有一定线索但证据不充分（如客户描述暗示但未确认）
- `none`：纯推测，无任何证据支持

> 对于无法找到文档支撑的推断，confidence 必须标为 low 或 none。标为 high 但实际无据是最严重的错误——Challenger 会发现并打回整个分析。诚实标注 low 不是失败，是负责任的行为。

**Evidence 引用规则**：
- `source` 使用相对于 caseDir 的路径（如 `kusto/20260402-1030-query.md`）
- 可附加 `#section` anchor 指向文件内特定段落（如 `research/research.md#Microsoft Learn`）
- `excerpt` 引用来源中支持 claim 的具体文本（不是整段复制，是关键句）
- `sourceType` 从 enum 中选择：`kusto-result` / `official-doc` / `ado-wiki` / `onenote-team` / `onenote-personal` / `product-skill` / `customer-statement` / `icm-data` / `web-search`

**overallConfidence 计算**：
- 所有 claims 都是 high → `"high"`
- 任何 claim 是 none → `"low"`
- 任何 claim 是 low → `"low"`
- 其余 → `"medium"`

**triggerChallenge 计算**：
- 存在任何 `confidence: "low"` 或 `confidence: "none"` 的 claim → `true`
- 否则 → `false`

Schema 详见 `playbooks/schemas/claims-schema.md`。

**日志**：
```
[YYYY-MM-DD HH:MM:SS] STEP 5a OK | claims extracted: N total, H high, M medium, L low, X none | triggerChallenge={true|false}
```
```

- [ ] **Step 2: Update the output files section**

Find the `## 输出文件` section and add `claims.json`:

```markdown
- `{caseDir}/claims.json` — 结构化证据链声明（schema 见 `playbooks/schemas/claims-schema.md`）
```

- [ ] **Step 3: Verify the edit**

Run: `grep -n "5a\|claims.json\|triggerChallenge" .claude/agents/troubleshooter.md`
Expected: Multiple matches showing the new Step 5a content and claims.json reference.

- [ ] **Step 4: Commit**

```bash
git add .claude/agents/troubleshooter.md
git commit -m "feat: add Step 5a claims extraction to troubleshooter agent"
```

---

### Task 4: `/challenge` Standalone Skill

**Files:**
- Create: `.claude/skills/challenge/SKILL.md`

This creates the standalone `/challenge {caseNumber}` skill for manual trigger.

- [ ] **Step 1: Create directory and skill file**

```bash
mkdir -p .claude/skills/challenge
```

Create `.claude/skills/challenge/SKILL.md` with:

```markdown
---
name: challenge
displayName: 证据链审查
description: "手动触发 Challenger 审查 troubleshooter 分析的证据链。"
category: agent
stability: experimental
requiredInput: caseNumber
estimatedDuration: 60s
promptTemplate: |
  Execute challenge for Case {caseNumber}. Read .claude/skills/challenge/SKILL.md for full instructions, then execute.
allowed-tools:
  - Bash
  - Read
  - Glob
  - Agent
---

# /challenge — 证据链审查

手动触发 Challenger agent 审查 troubleshooter 分析报告的证据链。

## 参数
- `$ARGUMENTS` — Case 编号

## 执行步骤

### 1. 初始化

读取 `config.json` 获取 `casesRoot`，设置 `caseDir = {casesRoot}/active/{caseNumber}/`（绝对路径）。

### 2. 前置检查

检查 `{caseDir}/claims.json` 是否存在：

- **存在** → 继续到 Step 3
- **不存在** → 检查 `{caseDir}/analysis/` 目录：
  - 有 `.md` 文件 → 提示用户：`⚠️ 该 Case 有分析报告但无 claims.json。请先用 /troubleshoot 重新排查（新版会自动产出 claims.json）。`
  - 无 `.md` 文件 → 提示用户：`⚠️ 该 Case 无分析数据可审查。请先执行 /troubleshoot 进行技术排查。`

### 3. 推断产品域

从 `{caseDir}/case-info.md` 读取 serviceTree / 产品信息，推断 product 标识。

### 4. Spawn Challenger

```
subagent_type: "challenger"
description: "challenge {caseNumber}"
run_in_background: false
prompt: |
  Case {caseNumber}，caseDir={caseDir}（绝对路径）。
  产品域：{product}（从 case-info.md serviceTree 推断）。
  请先读取 .claude/agents/challenger.md 获取完整执行步骤，然后执行。
  ⏱ 第一个 Bash 调用中写 date +%s > "{caseDir}/logs/.t_challenge_start"
  ⏱ 最后一个 Bash 调用中写 date +%s > "{caseDir}/logs/.t_challenge_end"
```

### 5. 展示结果

读取 `{caseDir}/challenge-report.md`，展示：
- 审查摘要（verified/challenged/rejected 计数）
- 需要的额外信息（如有）
- 建议替代方向（如有）

如果 Challenger 返回 `ACTION:request-info`，提示用户可执行 `/draft-email {caseNumber} request-info` 生成信息收集邮件。
```

- [ ] **Step 2: Verify**

Run: `head -10 .claude/skills/challenge/SKILL.md`
Expected: Valid YAML frontmatter with `name: challenge`.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/challenge/SKILL.md
git commit -m "feat: add /challenge standalone skill for manual evidence audit"
```

---

### Task 5: Casework Flow Integration (B5a + B5b)

**Files:**
- Modify: `.claude/skills/casework/SKILL.md` (add B5a Challenge Gate and B5b auto-loop after B5)

This is the core orchestration change. After B5 routing spawns troubleshooter, the casework flow now has an optional challenge gate.

- [ ] **Step 1: Add B5a and B5b to casework SKILL.md**

Find the B5 section that ends with:
```
spawn 时指定 `subagent_type: "troubleshooter"` / `"email-drafter"`，提示读取 `.claude/agents/{name}.md`。
```

Insert after this line (before `### Step 4.`):

```markdown

**B5a. Challenge Gate（troubleshooter 完成后，条件触发）**

troubleshooter 完成后，Main Agent 读取 `{caseDir}/claims.json`：
- `claims.json` 不存在 → 跳过（向后兼容，旧版 troubleshooter 不产出 claims.json）
- `triggerChallenge === false` → 跳过，继续到 email-drafter
- `triggerChallenge === true` → spawn Challenger agent（前台等待）

```
subagent_type: "challenger"
description: "challenge {caseNumber}"
run_in_background: false
prompt: |
  Case {caseNumber}，caseDir={caseDir}（绝对路径）。
  产品域：{product}（从 case-info.md serviceTree 推断）。
  请先读取 .claude/agents/challenger.md 获取完整执行步骤，然后执行。
  ⏱ 第一个 Bash 调用中写 date +%s > "{caseDir}/logs/.t_challenge_start"
  ⏱ 最后一个 Bash 调用中写 date +%s > "{caseDir}/logs/.t_challenge_end"
```

**B5b. Auto-loop（Challenger 完成后）**

Challenger 返回后，Main Agent 读取更新后的 `{caseDir}/claims.json` 和 Challenger 返回文本中的 `ACTION:` 标记：

| ACTION | 执行 |
|--------|------|
| `ACTION:pass` 或无 ACTION | → email-drafter（正常邮件类型，按 B5 路由表） |
| `ACTION:request-info` | → email-drafter（emailType: `request-info`，prompt 附带 `{caseDir}/challenge-report.md` 中「需要的额外信息」section 内容） |
| `ACTION:retry` | → 用 Edit 更新 `claims.json` 的 `retryCount` 为 1 → spawn troubleshooter retry（见下方 prompt）→ troubleshooter 完成后回到 B5a |
| `ACTION:escalate` | → email-drafter（emailType: `request-info`，prompt 附带 challenge-report 中信息）+ 写 Todo 🔴：`⚠️ **分析证据不足** — Challenger 打回后重试仍无法确认根因，请审阅 challenge-report.md 并手动介入` |

**Troubleshooter Retry Prompt**（仅 ACTION:retry 时使用）：

```
subagent_type: "troubleshooter"
description: "troubleshooter-retry {caseNumber}"
run_in_background: false
prompt: |
  Case {caseNumber}，caseDir={caseDir}（绝对路径）。
  ⚠️ 这是 Challenger 打回后的重新排查（retry #1）。
  请先读取 {caseDir}/challenge-report.md 了解被打回的原因。
  被 reject 的 claims:
  {从 claims.json 中 status=rejected 的 claims 列表，每个一行: id + claim 文本}

  要求：
  1. 不要沿用之前被 reject 的分析方向
  2. 参考 challenge-report.md 的「建议替代方向」
  3. 对新结论必须提供明确的证据引用（Step 5a）
  4. 如果确实无法找到证据，诚实标注 confidence: none

  请先读取 .claude/agents/troubleshooter.md 获取完整执行步骤，然后执行。
  ⏱ 第一个 Bash 调用中写 date +%s > "{caseDir}/logs/.t_troubleshooterRetry_start"
  ⏱ 最后一个 Bash 调用中写 date +%s > "{caseDir}/logs/.t_troubleshooterRetry_end"
```

> Retry 后的 troubleshooter 产出新的 analysis.md（新时间戳文件名）和更新 claims.json（retryCount 已递增），再次进入 B5a。
```

- [ ] **Step 2: Update the steps list in the frontmatter**

In the frontmatter `steps:` list, add `challenge` between `troubleshoot` and `draft-email`:

```yaml
steps:
  - data-refresh
  - compliance-check
  - status-judge
  - teams-search
  - troubleshoot
  - challenge
  - draft-email
  - note-gap
  - inspection-writer
```

- [ ] **Step 3: Verify**

Run: `grep -n "B5a\|B5b\|Challenge Gate\|Auto-loop\|ACTION:retry" .claude/skills/casework/SKILL.md`
Expected: Multiple matches showing the new B5a/B5b sections.

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/casework/SKILL.md
git commit -m "feat: add Challenge Gate (B5a) and auto-loop (B5b) to casework flow"
```

---

### Task 6: Inspection Writer — Claims-Aware Summary Protection

**Files:**
- Modify: `.claude/skills/inspection-writer/SKILL.md`

Adds claims.json awareness to the inspection-writer, protecting case-summary.md from unverified conclusions.

- [ ] **Step 1: Add claims awareness to Step 2b**

Find the `### 2b. 增量追加 case-summary.md` section. Before the existing line `仅读取**新增内容**`, insert:

```markdown
**claims.json 感知**（如 `{caseDir}/claims.json` 存在）：

在写入「关键发现」section 前，读取 claims.json 中每个 claim 的 status：

| claim status | 写入 case-summary 的方式 |
|--------------|------------------------|
| `verified` | 正常写入 |
| `challenged` | 加 `[unverified]` 前缀，如：`- [unverified] 升级后 PSS 默认变更 — 需客户确认` |
| `rejected` | **不写入** summary |
| `pending` | 正常写入（向后兼容，未触发 Challenger 的场景） |

**清理机制**：如 summary 中已有 `[unverified]` 标注的条目，且对应 claim 已变为 `verified` → Edit 移除 `[unverified]` 前缀。如 claim 变为 `rejected` → Edit 删除该条目。

> 如 claims.json 不存在，全部按原有逻辑处理（向后兼容）。

```

- [ ] **Step 2: Also add claims awareness to Step 2a**

In the `### 2a. 首次生成 case-summary.md` section, after the `读取：` line, add:

```markdown
- `{caseDir}/claims.json`（如有，按上述 status 规则过滤写入「关键发现」）
```

- [ ] **Step 3: Verify**

Run: `grep -n "claims.json\|unverified\|challenged" .claude/skills/inspection-writer/SKILL.md`
Expected: Matches showing the new claims-awareness content.

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/inspection-writer/SKILL.md
git commit -m "feat: add claims.json awareness to inspection-writer for summary protection"
```

---

### Task 7: Email Drafter — Claims-Aware Writing

**Files:**
- Modify: `.claude/agents/email-drafter.md`

Adds claims.json awareness so email drafts don't contain unverified or rejected conclusions.

- [ ] **Step 1: Add claims.json to context reading**

Find the `### 1. 读取上下文` section. After the line `- playbooks/email-samples/ — 参考样本`, add:

```markdown
- `{caseDir}/claims.json`（如存在）— 证据链声明状态
- `{caseDir}/challenge-report.md`（如存在）— Challenger 审查报告
```

- [ ] **Step 2: Add claims-aware writing rules**

Find the `### 3. 写草稿` section. After `- 如有分析报告，引用关键结论`, add:

```markdown
- **claims.json 感知**（如存在）：
  - `status: verified` 的 claim → 邮件中自信引用，使用确定性语气
  - `status: challenged` 的 claim → 试探性语气表达（如 "Based on our initial analysis, it appears..." / "根据初步分析，可能是..."）
  - `status: rejected` 的 claim → **不写入邮件**
  - `status: pending` 的 claim → 按原有逻辑（向后兼容）
  - 如 claims.json 不存在 → 按原有逻辑（向后兼容）
```

- [ ] **Step 3: Add request-info mode from auto-loop**

After the `### 5. 保存草稿` section, add a new section:

```markdown
### 5a. Challenger 触发的 request-info 模式

当由 casework auto-loop 触发（emailType 为 `request-info` 且 prompt 中包含 Challenger 审查信息）时：

- 从 prompt 中提取 Challenger 发现的「需要的额外信息」列表
- 邮件焦点：收集能验证或推翻待定结论的具体信息
- 将技术问题转化为客户容易回答的具体问题
- **不要暴露内部审查流程**（不要提到 Challenger、claims、evidence chain 等内部概念）
- 语气自然，像正常的信息收集邮件
```

- [ ] **Step 4: Verify**

Run: `grep -n "claims.json\|challenge-report\|verified\|challenged\|request-info 模式" .claude/agents/email-drafter.md`
Expected: Matches showing all three additions.

- [ ] **Step 5: Commit**

```bash
git add .claude/agents/email-drafter.md
git commit -m "feat: add claims.json awareness to email-drafter agent"
```

---

### Task 8: Case Directory Schema + Timing Script Updates

**Files:**
- Modify: `playbooks/schemas/case-directory.md`
- Modify: `skills/d365-case-ops/scripts/casework-timing.sh`

Updates the directory schema documentation and the timing script to support the new challenger phase.

- [ ] **Step 1: Update case-directory.md**

Find the `## 单 Case 内文件` table. After the `timing.json` row, add two new rows:

```markdown
| `claims.json` | JSON | troubleshooter → challenger | 结构化证据链声明（schema 见 `schemas/claims-schema.md`） |
| `challenge-report.md` | Markdown | challenger | 证据链审查报告 |
```

- [ ] **Step 2: Update the timing script**

In `skills/d365-case-ops/scripts/casework-timing.sh`, in the "正常流程" section (the `else` branch starting around line 71), add reading of the new timestamp files. After the existing `t_rt_e` line (`t_rt_e=$(read_ts routing_end)`), add:

```bash
t_ch_s=$(read_ts challenge_start)
t_ch_e=$(read_ts challenge_end)
t_tr_s=$(read_ts troubleshooterRetry_start)
t_tr_e=$(read_ts troubleshooterRetry_end)
```

Then in the PHASES_JSON for the normal flow, after the `"routing"` entry and before `"dataGathering"`, add:

```bash
    "challenge":     { "seconds": $(safe_diff "$t_ch_s" "$t_ch_e"), "label": "Challenger 审查 troubleshooter 分析的证据链" },
    "troubleshooterRetry": { "seconds": $(safe_diff "$t_tr_s" "$t_tr_e"), "label": "Troubleshooter 重新排查（Challenger 打回后）" },
```

Update the PHASE_LINE for normal flow to include challenge and retry durations:

After `route=${p_routing}s`, add: `chal=$(safe_diff "$t_ch_s" "$t_ch_e")s retry=$(safe_diff "$t_tr_s" "$t_tr_e")s`

Also update the background agent line to include these:

```bash
bg_ch=$(safe_diff "$t_ch_s" "$t_ch_e")
bg_tr=$(safe_diff "$t_tr_s" "$t_tr_e")
```

And add to `p_sum` calculation.

> Note: Since challenge and retry steps are optional (only triggered when triggerChallenge=true), the timing script must handle `0` values gracefully — `safe_diff` already returns `"0"` when timestamps are missing, so this is safe.

- [ ] **Step 3: Test timing script with missing challenge timestamps**

```bash
cd "/c/Users/fangkun/Documents/Claude Code Projects/EngineerBrain"
TMPDIR=$(mktemp -d)
mkdir -p "$TMPDIR/logs"
echo "1712000000" > "$TMPDIR/logs/.t_start"
echo "1712000001" > "$TMPDIR/logs/.t_changegate_start"
echo "1712000005" > "$TMPDIR/logs/.t_changegate_end"
echo "1712000010" > "$TMPDIR/logs/.t_compliance_start"
echo "1712000015" > "$TMPDIR/logs/.t_compliance_end"
echo "1712000020" > "$TMPDIR/logs/.t_agentWait_start"
echo "1712000025" > "$TMPDIR/logs/.t_agentWait_end"
echo "1712000030" > "$TMPDIR/logs/.t_statusJudge_start"
echo "1712000035" > "$TMPDIR/logs/.t_statusJudge_end"
echo "1712000040" > "$TMPDIR/logs/.t_routing_start"
echo "1712000050" > "$TMPDIR/logs/.t_routing_end"
echo "1712000055" > "$TMPDIR/logs/.t_inspection_start"
bash skills/d365-case-ops/scripts/casework-timing.sh "$TMPDIR" "" "" '{"bash":5,"tools":15,"agents":3}'
cat "$TMPDIR/timing.json" | head -30
rm -rf "$TMPDIR"
```

Expected: timing.json generated with `challenge: { "seconds": 0 }` and `troubleshooterRetry: { "seconds": 0 }` (both 0 because no timestamps exist).

- [ ] **Step 4: Commit**

```bash
git add playbooks/schemas/case-directory.md skills/d365-case-ops/scripts/casework-timing.sh
git commit -m "feat: update directory schema and timing script for challenger integration"
```

---

### Task 9: Dashboard Backend — Claims + Challenge Report API

**Files:**
- Modify: `dashboard/src/routes/case-routes.ts` (add /claims and /challenge-report endpoints)

Adds API endpoints to serve claims.json and challenge-report.md to the frontend.

- [ ] **Step 1: Read the existing case-routes.ts to understand patterns**

Read `dashboard/src/routes/case-routes.ts` to identify:
- How other file-reading endpoints are structured (e.g., /analysis, /timing)
- The pattern for returning JSON files vs markdown files
- Error handling when files don't exist

- [ ] **Step 2: Add claims endpoint**

Following the existing pattern, add a GET endpoint `/cases/:id/claims` that:
1. Reads `{caseDir}/claims.json`
2. Returns the parsed JSON
3. Returns `{ claims: null }` if file doesn't exist

- [ ] **Step 3: Add challenge-report endpoint**

Add a GET endpoint `/cases/:id/challenge-report` that:
1. Reads `{caseDir}/challenge-report.md`
2. Returns `{ content: "markdown string" }`
3. Returns `{ content: null }` if file doesn't exist

- [ ] **Step 4: Verify the server still starts**

```bash
cd dashboard && npm run build 2>&1 | tail -5
```

Expected: Build succeeds without errors.

- [ ] **Step 5: Commit**

```bash
git add dashboard/src/routes/case-routes.ts
git commit -m "feat: add /claims and /challenge-report API endpoints"
```

---

### Task 10: Dashboard Frontend — Evidence Chain Tab + Challenge Report Modal

**Files:**
- Modify: `dashboard/web/src/pages/CaseDetail.tsx` (add Evidence Chain tab)
- Create: `dashboard/web/src/components/EvidenceChainTab.tsx` (tab content)
- Create: `dashboard/web/src/components/ChallengeReportModal.tsx` (modal)

Adds an "Evidence Chain" tab to the case detail view that displays claims.json data, and a modal for viewing the challenge report.

- [ ] **Step 1: Read CaseDetail.tsx to understand the tab system**

Read `dashboard/web/src/pages/CaseDetail.tsx` to identify:
- How tabs are defined (the tabs array structure)
- How tab content is rendered (switch/conditional)
- How other tabs load data (API calls)
- The badge count pattern

- [ ] **Step 2: Create EvidenceChainTab component**

Create `dashboard/web/src/components/EvidenceChainTab.tsx`:

The component should:
1. Accept `caseId` prop
2. Fetch `/cases/${caseId}/claims` using the existing `apiGet` pattern
3. Show "No claims data" message when claims is null
4. Render a table with columns: ID / Claim / Type / Confidence / Status / Evidence Count
5. Color-code status: verified=green, challenged=amber, rejected=red, pending=gray
6. Expandable rows showing evidence details and challengerNote
7. A "📋 Challenge Report" button (visible when challenge report exists) that opens the modal

- [ ] **Step 3: Create ChallengeReportModal component**

Create `dashboard/web/src/components/ChallengeReportModal.tsx`:

The component should:
1. Accept `caseId` and `isOpen`/`onClose` props
2. Fetch `/cases/${caseId}/challenge-report` when opened
3. Render the markdown content (using existing markdown rendering pattern if available, or `<pre>` with whitespace preservation)
4. Standard modal overlay with close button

- [ ] **Step 4: Integrate into CaseDetail.tsx**

In CaseDetail.tsx:
1. Add the tab to the tabs array: `{ id: 'evidence', label: 'Evidence Chain', icon: '🔗' }`
2. Position it after 'analysis' tab (since it reviews analysis output)
3. Add the tab content rendering case in the switch/conditional
4. Add badge count from claims data (e.g., number of challenged + rejected claims)

- [ ] **Step 5: Verify the frontend builds**

```bash
cd dashboard/web && npm run build 2>&1 | tail -5
```

Expected: Build succeeds without errors.

- [ ] **Step 6: Commit**

```bash
git add dashboard/web/src/components/EvidenceChainTab.tsx dashboard/web/src/components/ChallengeReportModal.tsx dashboard/web/src/pages/CaseDetail.tsx
git commit -m "feat: add Evidence Chain tab and Challenge Report modal to dashboard"
```

---

### Task 11: Integration Verification

**Files:** (no changes — verification only)

End-to-end verification that all pieces connect correctly.

- [ ] **Step 1: Verify all new files exist**

```bash
cd "/c/Users/fangkun/Documents/Claude Code Projects/EngineerBrain"
echo "=== New files ===" && \
ls -la playbooks/schemas/claims-schema.md && \
ls -la .claude/agents/challenger.md && \
ls -la .claude/skills/challenge/SKILL.md && \
echo "=== Modified files ===" && \
grep -c "5a\|claims.json" .claude/agents/troubleshooter.md && \
grep -c "B5a\|Challenge Gate" .claude/skills/casework/SKILL.md && \
grep -c "claims.json\|unverified" .claude/skills/inspection-writer/SKILL.md && \
grep -c "claims.json\|challenge-report" .claude/agents/email-drafter.md && \
grep -c "claims.json\|challenge-report" playbooks/schemas/case-directory.md && \
echo "=== All checks passed ==="
```

Expected: All files exist and grep counts > 0 for each modified file.

- [ ] **Step 2: Verify cross-references**

Check that all file paths referenced in agent/skill definitions actually exist:

```bash
echo "Checking referenced paths..." && \
test -f playbooks/schemas/claims-schema.md && echo "✅ claims-schema.md" && \
test -f .claude/agents/challenger.md && echo "✅ challenger.md" && \
test -f .claude/agents/troubleshooter.md && echo "✅ troubleshooter.md" && \
test -f .claude/agents/email-drafter.md && echo "✅ email-drafter.md" && \
test -f .claude/skills/casework/SKILL.md && echo "✅ casework/SKILL.md" && \
test -f .claude/skills/inspection-writer/SKILL.md && echo "✅ inspection-writer/SKILL.md" && \
test -f .claude/skills/challenge/SKILL.md && echo "✅ challenge/SKILL.md" && \
echo "All cross-references valid"
```

- [ ] **Step 3: Verify frontmatter consistency**

```bash
head -8 .claude/agents/challenger.md | grep "name: challenger" && echo "✅ challenger name OK"
head -8 .claude/skills/challenge/SKILL.md | grep "name: challenge" && echo "✅ challenge skill name OK"
```

- [ ] **Step 4: Dashboard build check**

```bash
cd "/c/Users/fangkun/Documents/Claude Code Projects/EngineerBrain/dashboard" && npm run build 2>&1 | tail -3
```

Expected: Build succeeds.

- [ ] **Step 5: Final commit (if any leftover changes)**

```bash
git status
```

If clean, no action needed. Otherwise commit any remaining changes.

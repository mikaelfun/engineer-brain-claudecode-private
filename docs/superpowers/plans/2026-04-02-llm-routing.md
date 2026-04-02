# LLM-Powered Routing Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace fixed casework routing table with LLM-recommended actions from status-judge, using the routing table as fallback.

**Architecture:** status-judge outputs a new `recommendedActions` array in meta alongside `actualStatus`. Casework B5/AR-B5 reads `recommendedActions` first; if present, follows LLM recommendation; if absent, falls back to existing routing table. No additional LLM calls — status-judge already has all context.

**Tech Stack:** Markdown (SKILL.md files, schema docs) — no code changes, only LLM instruction updates.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `.claude/skills/status-judge/SKILL.md` | Modify | Add Step 4b (recommend actions), extend Step 6 upsert |
| `.claude/skills/casework/SKILL.md` | Modify | B5 + AR-B5: read recommendedActions, fallback to routing table |
| `playbooks/schemas/meta-schema.md` | Modify | Add `recommendedActions` field documentation |

---

### Task 1: Extend status-judge SKILL.md with Action Recommendation

**Files:**
- Modify: `.claude/skills/status-judge/SKILL.md`

- [ ] **Step 1: Add Step 4b after the existing Step 4 section (after the AR 判断步骤 section, before Step 5)**

Insert between the "AR 判断步骤" section (ends at line 100) and "### 5. 计算 daysSinceLastContact" (line 102). Add:

```markdown
### 4b. 推荐下一步行动（recommendedActions）

在判定 actualStatus 后，综合以下已读取的上下文推理最优行动：

- `actualStatus` + `daysSinceLastContact`
- `case-summary.md`（排查进展、关键发现、风险）
- `emails.md` 最后几封邮件（沟通状态、是否已发送关键邮件）
- `notes.md` / `notes-ar.md`（最新工作记录）
- ICM 状态（如有 ICM：PG 是否在处理、是否有新回复）
- `drafts/` 目录是否有未发送草稿（`ls {caseDir}/drafts/*.md 2>/dev/null | wc -l`）

**推理指导**（非严格规则，LLM 应综合判断）：
1. 排查已完成 + 邮件已发送 + ICM pending PG → `no-agent`（等 PG 即可）
2. 有未发送草稿且内容仍相关 → `no-agent`（用户只需发送现有草稿）
3. 排查完成但未告知客户/case owner → `email-drafter`（不需要 troubleshooter）
4. 有新信息需要排查（客户新提供数据、PG 有新回复需要验证）→ `troubleshooter`
5. 新 case + 需要初始排查和首次沟通 → `troubleshooter+email-drafter`
6. 判断不确定 → 留空 `recommendedActions: []`（让 routing fallback 到路由表）

**输出格式**：
```json
"recommendedActions": [
  {
    "action": "no-agent | troubleshooter | email-drafter | troubleshooter+email-drafter",
    "reason": "≤100字，解释为什么推荐这个行动"
  }
]
```

**action 枚举**：
| action | casework 行为 |
|--------|-------------|
| `no-agent` | 跳过 agent spawn，直接到 inspection |
| `troubleshooter` | 仅 spawn troubleshooter |
| `email-drafter` | 仅 spawn email-drafter |
| `troubleshooter+email-drafter` | spawn 两者（先 troubleshooter 后 email-drafter） |

> ⚠️ 仅在 CHANGED 路径（status-judge 实际执行时）输出。快速路径（cache hit）不输出 recommendedActions。
> ⚠️ AR Mode 同样输出 recommendedActions，但推理时考虑 AR scope 和 communicationMode。
```

- [ ] **Step 2: Extend Step 6 upsert to include recommendedActions (line 107-108)**

After the existing JSON in Step 6, add `recommendedActions` to the upsert fields. Replace:

```json
{ "actualStatus": "...", "daysSinceLastContact": 2, "statusJudgedAt": "ISO8601", "statusReasoning": "一句话推理 → {status}", "emailCountAtJudge": 14, "noteCountAtJudge": 2, "icmIdAtJudge": "12345 或空字符串" }
```

With:

```json
{ "actualStatus": "...", "daysSinceLastContact": 2, "statusJudgedAt": "ISO8601", "statusReasoning": "一句话推理 → {status}", "emailCountAtJudge": 14, "noteCountAtJudge": 2, "icmIdAtJudge": "12345 或空字符串", "recommendedActions": [{"action": "...", "reason": "..."}] }
```

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/status-judge/SKILL.md
git commit -m "feat(status-judge): add Step 4b recommendedActions for LLM-powered routing

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Modify casework B5 and AR-B5 Routing Logic

**Files:**
- Modify: `.claude/skills/casework/SKILL.md`

- [ ] **Step 1: Update B5 routing section (around line 214-224)**

Replace the current B5 section:

```markdown
**B5. 按 actualStatus 路由** ⏱ `.t_routing_start/end`

| actualStatus | 执行 |
|---|---|
| `new` / `pending-engineer` | troubleshooter → email-drafter |
| `pending-customer` | email-drafter（仅 days ≥ 3） |
| `pending-pg` | 无额外 agent，仅记录 |
| `researching` | troubleshooter |
| `ready-to-close` | email-drafter (closure) |

spawn 时指定 `subagent_type: "troubleshooter"` / `"email-drafter"`，提示读取 `.claude/agents/{name}.md`。
```

With:

```markdown
**B5. 智能路由** ⏱ `.t_routing_start/end`

**优先读取 LLM 推荐行动**：

1. 读取 `meta.recommendedActions`（由 status-judge Step 4b 写入）
2. 如果 `recommendedActions` 存在且非空：
   - `no-agent` → 跳过 agent spawn，记日志 `STEP B5 OK | LLM: no-agent — {reason}`
   - `troubleshooter` → 仅 spawn troubleshooter
   - `email-drafter` → 仅 spawn email-drafter
   - `troubleshooter+email-drafter` → spawn 两者
3. 如果 `recommendedActions` 不存在、为空、或为 null → **Fallback 到路由表**：

| actualStatus | Fallback 执行 |
|---|---|
| `new` / `pending-engineer` | troubleshooter → email-drafter |
| `pending-customer` | email-drafter（仅 days ≥ 3） |
| `pending-pg` | 无额外 agent，仅记录 |
| `researching` | troubleshooter |
| `ready-to-close` | email-drafter (closure) |

记日志 `STEP B5 OK | Fallback: {actualStatus} → {agents}`

spawn 时指定 `subagent_type: "troubleshooter"` / `"email-drafter"`，提示读取 `.claude/agents/{name}.md`。
```

- [ ] **Step 2: Update AR-B5 routing section (around line 401-414)**

Replace the current AR-B5 section:

```markdown
**AR-B5. 按 actualStatus + communicationMode 路由** ⏱ `.t_routing_start/end`

| actualStatus | communicationMode | 执行 |
|---|---|---|
| `new` | any | troubleshooter（AR scope 内诊断）→ email-drafter |
| `pending-engineer` | `internal` | troubleshooter → email-drafter（收件人: case owner） |
| `pending-engineer` | `customer-facing` | troubleshooter → email-drafter（收件人: 客户，仅 AR scope） |
| `pending-customer` (days<3) | any | 无 agent |
| `pending-customer` (days≥3) | `internal` | email-drafter（follow-up to case owner） |
| `pending-customer` (days≥3) | `customer-facing` | email-drafter（follow-up to customer, AR scope only） |
| `pending-pg` | any | 无 agent |
| `researching` | any | troubleshooter（继续 AR scope 内诊断） |
| `ready-to-close` | `internal` | email-drafter（AR 完成总结 to case owner） |
| `ready-to-close` | `customer-facing` | email-drafter（AR scope 结论 to customer, CC case owner） |
```

With:

```markdown
**AR-B5. 智能路由（AR）** ⏱ `.t_routing_start/end`

**优先读取 LLM 推荐行动**（同 B5 逻辑）：

1. 读取 `meta.recommendedActions`
2. 如果存在且非空 → 按 action 执行（spawn 时 prompt 中包含 AR scope + communicationMode）
3. 如果不存在/为空 → **Fallback 到 AR 路由表**：

| actualStatus | communicationMode | Fallback 执行 |
|---|---|---|
| `new` | any | troubleshooter（AR scope 内诊断）→ email-drafter |
| `pending-engineer` | `internal` | troubleshooter → email-drafter（收件人: case owner） |
| `pending-engineer` | `customer-facing` | troubleshooter → email-drafter（收件人: 客户，仅 AR scope） |
| `pending-customer` (days<3) | any | 无 agent |
| `pending-customer` (days≥3) | `internal` | email-drafter（follow-up to case owner） |
| `pending-customer` (days≥3) | `customer-facing` | email-drafter（follow-up to customer, AR scope only） |
| `pending-pg` | any | 无 agent |
| `researching` | any | troubleshooter（继续 AR scope 内诊断） |
| `ready-to-close` | `internal` | email-drafter（AR 完成总结 to case owner） |
| `ready-to-close` | `customer-facing` | email-drafter（AR scope 结论 to customer, CC case owner） |
```

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/casework/SKILL.md
git commit -m "feat(casework): B5/AR-B5 smart routing with recommendedActions + fallback table

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Update Meta Schema Documentation

**Files:**
- Modify: `playbooks/schemas/meta-schema.md`

- [ ] **Step 1: Add recommendedActions to the complete schema example**

After the `"icmIdAtJudge"` field in the example JSON (around line 36), add:

```json
  "recommendedActions": [
    {
      "action": "no-agent",
      "reason": "排查已完成+ICM pending PG+邮件已发，等 PG 回复"
    }
  ],
```

- [ ] **Step 2: Add field descriptions to the table**

After the `icmIdAtJudge` row in the field description table, add:

```markdown
| `recommendedActions` | array\|null | status-judge | LLM 推荐的下一步行动。casework B5 优先采纳，为空时 fallback 到固定路由表。仅在 CHANGED 路径（status-judge 实际执行时）写入，快速路径不写入。 |
| `recommendedActions[].action` | string | status-judge | `"no-agent"` / `"troubleshooter"` / `"email-drafter"` / `"troubleshooter+email-drafter"` |
| `recommendedActions[].reason` | string | status-judge | ≤100 字，解释推荐理由 |
```

- [ ] **Step 3: Add status-judge as writer of recommendedActions**

In the writers section (around line 10), add after the existing status-judge line:

```markdown
- `status-judge`：写入 `recommendedActions`（LLM 推荐的下一步行动，仅 CHANGED 路径）
```

- [ ] **Step 4: Commit**

```bash
git add playbooks/schemas/meta-schema.md
git commit -m "docs(meta-schema): add recommendedActions field documentation

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

# LLM-Powered Routing Optimization Design Spec

## Overview

Replace the fixed routing table in casework B5/AR-B5 with LLM-powered action recommendation from status-judge, using the routing table as fallback.

## Problem

The current casework routing (B5/AR-B5) uses a fixed table mapping `actualStatus` to agent spawns:

```
pending-engineer → troubleshooter + email-drafter
pending-customer (days≥3) → email-drafter
pending-pg → no agent
...
```

This fails when the actual situation is more nuanced than the status alone can capture. Example: an AR case where investigation is complete, ICM is opened, and email has been sent — `actualStatus` may still be `pending-engineer` (based on stale data), but the correct action is `no-agent` (just wait for PG).

## Solution: `recommendedActions` from status-judge

### Architecture

```
status-judge (existing)
  ├─ Step 4: Judge actualStatus (unchanged)
  ├─ Step 4b: Recommend next actions (NEW)
  │   Input: actualStatus + case-summary + emails + notes + ICM + drafts/
  │   Output: recommendedActions[] in meta
  └─ Step 6: Upsert meta (extended)

casework B5/AR-B5 (modified)
  ├─ Read meta.recommendedActions
  ├─ If present → follow LLM recommendation
  └─ If absent → fallback to fixed routing table
```

### Meta Schema Extension

New field in `casehealth-meta.json`:

```json
{
  "recommendedActions": [
    {
      "action": "no-agent",
      "reason": "排查已完成，ICM 已开 pending PG，邮件已发送，等待 PG 回复即可"
    }
  ]
}
```

### `action` Enum

| action | Meaning | Casework behavior |
|--------|---------|-------------------|
| `no-agent` | No agent spawn needed | Skip directly to Step 4 (inspection) |
| `troubleshooter` | Technical investigation needed | Spawn troubleshooter |
| `email-drafter` | Email drafting needed | Spawn email-drafter |
| `troubleshooter+email-drafter` | Investigate then draft email | Spawn both |

### `reason` Field

One-sentence explanation (≤100 chars) of why this action is recommended. Written to meta for audit trail and todo/inspection reference.

## status-judge Changes

### New Step 4b: Recommend Actions

After determining `actualStatus` (Step 4) and before upsert (Step 6), status-judge performs action recommendation:

**Input context** (already loaded in prior steps — no additional reads):
- `actualStatus` + `daysSinceLastContact`
- `case-summary.md` (investigation progress, key findings)
- `emails.md` last few emails (communication state)
- `notes.md` / `notes-ar.md` (latest work records)
- ICM status (if ICM linked)
- `drafts/` directory existence (unsent drafts)

**Reasoning rules** (guidance for LLM, not rigid):
1. Investigation complete + email sent + ICM pending PG → `no-agent`
2. Unsent drafts exist and still relevant → `no-agent` (user just needs to send existing drafts)
3. Investigation complete but customer/case-owner not yet informed → `email-drafter` only
4. New information requires investigation → `troubleshooter`
5. New issue + no prior communication → `troubleshooter+email-drafter`
6. If uncertain → leave `recommendedActions` empty (triggers fallback)

**Output**: `recommendedActions` array added to meta upsert.

**Execution scope**: Only in CHANGED path (not fast-path). Fast-path cases don't route to agents anyway.

**AR compatibility**: AR status-judge follows same pattern but considers AR scope and communication mode when recommending actions.

## casework Routing Changes (B5/AR-B5)

### Modified Decision Flow

```
B5. Routing
1. Read meta.recommendedActions
2. If recommendedActions exists AND is non-empty:
   a. For each action in recommendedActions:
      - "no-agent" → skip, log reason
      - "troubleshooter" → spawn troubleshooter
      - "email-drafter" → spawn email-drafter
      - "troubleshooter+email-drafter" → spawn both
   b. Log: "STEP B5 OK | LLM recommended: {action} — {reason}"
3. If recommendedActions is missing/empty/null:
   a. Fallback to existing routing table (by actualStatus)
   b. Log: "STEP B5 OK | Fallback routing: {actualStatus} → {agents}"
```

### Safety: Routing Table as Fallback

The existing routing table is PRESERVED as fallback. It activates when:
- status-judge was skipped (cache hit)
- LLM didn't output `recommendedActions` (parsing failure or ambiguity)
- `recommendedActions` is explicitly empty (LLM couldn't decide)

This ensures backward compatibility — the system never breaks, it just becomes smarter when LLM provides recommendations.

## Files to Modify

| File | Change | Description |
|------|--------|-------------|
| `.claude/skills/status-judge/SKILL.md` | Modify | Add Step 4b (recommend actions), update Step 6 upsert fields |
| `.claude/skills/casework/SKILL.md` | Modify | B5/AR-B5: read recommendedActions first, fallback to routing table |
| `playbooks/schemas/meta-schema.md` | Modify | Add `recommendedActions` field documentation |

## Files NOT Modified

| File | Reason |
|------|--------|
| `generate-todo.sh` | Todo rules don't depend on routing decisions |
| `casework-fast-path.sh` | Fast-path doesn't route to agents (NO_CHANGE) |
| `inspection-writer/SKILL.md` | Summary generation doesn't depend on routing |

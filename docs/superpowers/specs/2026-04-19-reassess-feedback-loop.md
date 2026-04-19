# Reassess Feedback Loop — Post-Troubleshooter Decision Making

**Date:** 2026-04-19
**Status:** P0-P2 implemented, P3 deferred

## Problem

Current casework flow: `assess → act(troubleshooter + email-drafter) → summarize`

The assess step decides email type BEFORE troubleshooter runs. This is a prediction, not a data-driven decision. After troubleshooter completes, new findings should feed back to determine the actual communication action:

| Troubleshooter Conclusion | Should Do |
|---------------------------|-----------|
| Found root cause (high confidence) | email-drafter(result-confirm) |
| Need customer info to verify | email-drafter(request-info) |
| Investigation exhausted | Recommend ICM escalation |
| Out of POD scope | Recommend AR transfer |
| Partial findings | email-drafter(request-info) + continue next cycle |

For standalone `/casework`, the main agent has full context to make this judgment inline. For patrol, the linear pipeline (gathering → executing → inspecting → done) has no re-evaluation after troubleshooter — it directly spawns the pre-decided email-drafter.

## Solution

### 1. execution-plan.json becomes plans[] list

Each phase (assess, reassess) appends an entry. Top-level fields reflect latest plan for backward compatibility.

```json
{
  "caseNumber": "...",
  "currentPhase": "reassess",
  "actualStatus": "pending-engineer",
  "actions": [...],
  "plans": [
    {
      "phase": "assess",
      "timestamp": "...",
      "actualStatus": "pending-engineer",
      "actions": [{"type": "troubleshooter"}],
      "deferredActions": ["email-drafter"],
      "deferReason": "email type TBD after troubleshoot reassess"
    },
    {
      "phase": "reassess",
      "timestamp": "...",
      "conclusion": {
        "type": "found-cause",
        "summary": "NSG rule blocking RDP",
        "confidence": "high",
        "suggestedNextAction": "email-result"
      },
      "actions": [{"type": "email-drafter", "emailType": "result-confirm"}]
    }
  ]
}
```

### 2. Troubleshooter outputs `conclusion` block in claims.json

Structured conclusion from Step 4c/4d synthesis. Schema in `playbooks/schemas/claims-schema.md` v2.

```json
{
  "conclusion": {
    "type": "found-cause|need-info|exhausted|out-of-scope|partial",
    "summary": "...",
    "confidence": "high|medium|low",
    "suggestedNextAction": "email-result|email-request-info|escalate-pg|transfer-pod|no-action",
    "missingInfo": ["specific info needed from customer"],
    "scopeAssessment": "in-pod|out-of-scope|unclear",
    "outOfScopeTarget": "Networking POD"
  }
}
```

### 3. New `reassess` sub-skill

Location: `.claude/skills/casework/reassess/SKILL.md`

Flow:
1. Read claims.json.conclusion
2. Classify findings as fact/analysis, persist to case-summary.md
3. Update casework-meta.json.investigationFindings
4. Email dedup check
5. LLM decides communication action
6. Write execution-plan.json phase 2 via `write-execution-plan.py --phase reassess`

Decision rules:
| conclusion.type | confidence | Action |
|----------------|-----------|--------|
| found-cause | high | email-drafter(result-confirm) |
| found-cause | medium | email-drafter(result-confirm) + warning: suggest /challenge |
| found-cause | low | email-drafter(request-info) |
| need-info | any | email-drafter(request-info), missingInfo passed through |
| exhausted | any | actions=[], recommend ICM escalation |
| out-of-scope | any | actions=[], recommend AR transfer to outOfScopeTarget |
| partial | any | email-drafter(request-info) |

### 4. Assess defers email-drafter when troubleshooter present

When assess outputs troubleshooter action: `deferredActions: ["email-drafter"]`. Email type decided by reassess after investigation.

**Exception:** IR-first (new case + initial-response) still outputs email-drafter(initial-response) in assess, because IR is sent immediately without waiting for troubleshooter results.

### 5. IR-first path runs full cycle

```
email-drafter(IR) → troubleshooter → reassess → email-drafter(phase2)
```

1. email-drafter(initial-response) foreground — IR draft to engineer ASAP
2. troubleshooter foreground — full investigation (changed from background)
3. reassess foreground — decide second email based on findings
4. email-drafter(phase2) foreground — second draft if applicable

One cycle may produce 2 drafts (IR + follow-up based on findings).

### 6. casework full mode flow

```
refresh → assess → act {
  if IR-first:
    email(IR) → troubleshooter → reassess → email(phase2)
  elif has-troubleshooter + deferred:
    troubleshooter → reassess → email(phase2)
  else (no troubleshooter):
    email(assess-decided-type)  # follow-up, closure, etc.
} → summarize
```

### 7. Patrol pipeline changes (P3 — deferred)

New state machine phases: `ir-drafting`, `investigating`, `reassessing`, `communicating`.

Will align with patrol-ui-redesign spec's dynamic agent cards in Act step. Act step's `actions[]` in state.json gains `reassess` type and `subtype` field.

Process stage live text examples:
```
0748 troubleshooter done → launching reassess
0748 reassess: found-cause → launching email(result-confirm)
2048 reassess: exhausted → no email, recommend ICM → summarizing
```

**Blocked by:** patrol-ui-redesign (another session)

## Files Changed (P0-P2)

| File | Change |
|------|--------|
| `playbooks/schemas/claims-schema.md` | v2: add Conclusion Object schema |
| `.claude/agents/troubleshooter.md` | Step 4d conclusion synthesis + claims.json v2 output |
| `.claude/skills/casework/assess/scripts/write-execution-plan.py` | plans[] list + --phase reassess |
| `.claude/skills/casework/act/scripts/read-plan.sh` | plans[] support + HAS_DEFERRED/PLAN_PHASE/PLAN_COUNT |
| `.claude/skills/casework/reassess/SKILL.md` | New: reassess sub-skill |
| `.claude/skills/casework/assess/SKILL.md` | deferredActions when troubleshooter present |
| `.claude/skills/casework/act/SKILL.md` | reassess spawn + IR-first full cycle |
| `.claude/skills/casework/SKILL.md` | orchestrator description update |

## Implementation Phases

| Phase | Content | Status |
|-------|---------|--------|
| P0 | claims-schema v2 + troubleshooter conclusion output | Done |
| P1 | reassess SKILL.md + write-execution-plan.py plans[] + read-plan.sh | Done |
| P2 | casework assess/act/SKILL.md updates | Done |
| P3 | patrol pipeline (after patrol-ui-redesign) | Deferred |
| P4 | Dashboard Act agent cards (reassess type + subtype) | Deferred |

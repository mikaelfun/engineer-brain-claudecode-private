# Architecture Review: Reasoning-Driven vs Rule-Driven

**Date:** 2026-03-29
**Reviewer:** Claude (7 parallel explore agents + architect-review subagent)
**Scope:** Full project — identify rule-driven logic that should use LLM reasoning

---

## Executive Summary

The EngineerBrain project has evolved from a script-driven automation tool into an LLM-orchestrated system, but several core decision points still use rigid rule-based logic (if-else / lookup tables) where contextual reasoning would produce significantly better outcomes. This review identified **9 optimization opportunities** across 5 domains, with 8 tracks created for implementation.

### Key Insight: Recipe Architecture Pattern

The recently completed `verify-redesign` (ISS-148) established a proven three-layer pattern:

```
Recipe Index (_index.md)          — Priority-based matching rules
   +
LLM Reasoning Layer               — Read context -> reason -> match recipe -> execute
   +
Reflection + Self-Evolution        — Retries >= 2 / user edits / unexpected outcomes -> update recipe
```

This pattern should be replicated across **5 domains**: todo generation, casework routing, email drafting, troubleshooting, and patrol prioritization.

---

## Methodology

| Agent | Scope | Focus |
|-------|-------|-------|
| Explore #1 | `.claude/skills/casework/` | Casework orchestration & routing |
| Explore #2 | `.claude/skills/inspection-writer/`, `scripts/generate-todo.sh` | Todo & inspection logic |
| Explore #3 | `.claude/agents/email-drafter.md`, `playbooks/guides/email-templates.md` | Email drafting |
| Explore #4 | `.claude/skills/patrol/`, `.claude/agents/troubleshooter.md` | Patrol & troubleshooting |
| Explore #5 | `.claude/skills/conductor/verify/`, `conductor/workflow.md` | Verify & new-track |
| Explore #6 | `.claude/skills/compliance-check/`, `.claude/skills/status-judge/` | Compliance & status |
| Explore #7 | `dashboard/`, `scripts/` | Dashboard & cross-cutting |
| architect-review | Full project | Architectural patterns & anti-patterns |

All 7 explore agents independently converged on the same top-3 findings (B5 routing, todo rules, email auto-type), providing high confidence in prioritization.

---

## Findings

### HIGH Priority (Every Case Affected)

#### 1. Casework B5 Routing — Fixed Status-to-Agent Mapping
**Location:** `.claude/skills/casework/SKILL.md` Step B5
**Current:** `actualStatus -> agent` enum lookup (e.g., `pending-engineer -> [troubleshooter, email-drafter]`)
**Problem:** Same status can need vastly different handling depending on context (email history, severity, customer type, ICM state)
**Fix:** LLM reads all context -> outputs routing plan JSON -> executes
**Issue:** ISS-151 | **Track:** routing-reasoning_20260329

#### 2. Todo Generation — Pure Bash If-Else Rule Matrix
**Location:** `scripts/generate-todo.sh`
**Current:** 7 cascading if-else blocks checking actualStatus + meta fields
**Problem:** 7 identified blindspots (e.g., SevA gets same todo as SevC; no ICM/Teams context; no historical pattern learning)
**Fix:** Shell script collects context JSON -> LLM + todo-recipes generate prioritized actions
**Issue:** ISS-150 | **Track:** todo-reasoning_20260329

#### 3. Email Type Auto-Selection — Fixed Status-to-Type Mapping
**Location:** `.claude/agents/email-drafter.md`
**Current:** `pending-engineer -> follow-up OR result-confirm` (binary choice)
**Problem:** `pending-engineer` could need direct-answer, acknowledge-logs, relay-ICM-findings, etc. User edits to drafts (the richest feedback signal) are completely discarded.
**Fix:** LLM reads email history + context -> reasons type -> matches email-recipe -> draft -> learn from user edits
**Issue:** ISS-152 | **Track:** email-recipes_20260329

### MEDIUM Priority (Efficiency/Quality)

#### 4. Patrol Priority — Binary 24h Threshold
**Location:** `.claude/skills/patrol/SKILL.md`
**Current:** `lastInspected > 24h` filter — SevA and SevC treated identically
**Problem:** SevA should be checked every 4-6h; recently-emailed cases need immediate attention; low-priority cases waste full casework cycles
**Fix:** LLM severity x SLA x activity scoring -> high-priority full casework, low-priority light inspection
**Issue:** ISS-153 | **Track:** patrol-priority_20260329

#### 5. Troubleshooting Search — Fixed 4-Stage Sequential Order
**Location:** `.claude/agents/troubleshooter.md`
**Current:** Always: local KB -> ADO -> Learn -> Web (3-round max)
**Problem:** Known error codes should hit ADO first; performance issues need Kusto time-series; intermittent failures need multi-window comparison
**Fix:** Match problem type -> troubleshooting-recipe -> adapted search order + dynamic iteration limit
**Issue:** ISS-154 | **Track:** troubleshoot-recipes_20260329

#### 6. new-track Verification Plan — Keyword Classification
**Location:** `conductor:new-track` skill, VP generation section
**Current:** Keyword table classifies AC -> test type (keyword -> E2E/Interaction/Visual/API/Skip)
**Problem:** Misclassifies ACs (e.g., "casework fast path no LLM" tagged Skip, but E2E backup->run->verify works)
**Fix:** LLM reads spec -> reasons type -> matches verification-recipes/_index.md
**Issue:** ISS-155 | **Track:** vp-align_20260329

#### 7. verify.md / SKILL.md Dual Implementation
**Location:** `~/.claude/commands/conductor/verify.md` + `.claude/skills/conductor/verify/SKILL.md`
**Current:** Two complete implementations with incompatible metadata formats
**Problem:** Dashboard `conductor-reader.ts` parsing confusion; maintenance burden
**Fix:** verify.md becomes thin bridge (pre-flight + mode detection -> SKILL.md)
**Issue:** ISS-156 | **Track:** verify-bridge_20260329

### LOW Priority (Edge Cases)

#### 8. Compliance Check — Hard-Coded Entitlement Matching
**Location:** `.claude/skills/compliance-check/SKILL.md`
**Current:** Exact string match for entitlement validation
**Problem:** Minor formatting differences cause false negatives
**Fix:** Add fuzzy/soft matching fallback
**Issue:** ISS-157 | **No track** (low priority, isolated impact)

### CROSS-CUTTING

#### 9. Recipe Architecture Shared Guide
**Problem:** 5 domains need recipe architecture, risk of independent reimplementation with inconsistent patterns
**Fix:** Create shared `playbooks/guides/recipe-architecture.md` defining the three-layer pattern, adaptation notes per domain, boundary guidance
**Issue:** ISS-149 | **Track:** recipe-arch_20260329

---

## Implementation Roadmap

### Recommended Order (dependency-aware)

```
Phase 0 (Foundation):
  recipe-arch_20260329 (ISS-149) — shared guide, blocks all recipe tracks

Phase 1 (High Impact):
  todo-reasoning_20260329 (ISS-150)     — every case, biggest blindspot count
  routing-reasoning_20260329 (ISS-151)  — every case, core orchestration

Phase 2 (Feedback Loop):
  email-recipes_20260329 (ISS-152)      — user edit learning = highest value signal

Phase 3 (Efficiency):
  patrol-priority_20260329 (ISS-153)    — batch efficiency improvement
  troubleshoot-recipes_20260329 (ISS-154) — search quality improvement

Phase 4 (Consistency):
  vp-align_20260329 (ISS-155)           — conductor consistency
  verify-bridge_20260329 (ISS-156)      — eliminate dual implementation
```

### Automation Target

All 8 tracks have detailed specs and are designed for `test-loop` / `test-supervisor` auto-implementation. The `recipe-arch` foundation track should be implemented first (manually or via conductor:implement), then remaining tracks can be parallelized.

---

## Metrics

| Metric | Before | After (Expected) |
|--------|--------|-------------------|
| Rule-driven core decisions | 7 | 1 (compliance exact match retained) |
| Recipe-enabled domains | 1 (verify) | 6 |
| User feedback loops | 0 | 2 (email edits, todo edits) |
| Self-evolution triggers | 1 (verify) | 6 |
| Patrol false-urgent rate | ~40% (SevC treated as SevA) | <10% (severity-weighted) |

---

## Appendix: Issue-Track Mapping

| Issue | Title | Priority | Track ID | Type |
|-------|-------|----------|----------|------|
| ISS-149 | Recipe Architecture 共享指南 | P1 | recipe-arch_20260329 | chore |
| ISS-150 | Todo 推理化 | P0 | todo-reasoning_20260329 | feature |
| ISS-151 | Casework 路由推理化 | P0 | routing-reasoning_20260329 | feature |
| ISS-152 | Email Recipes + 学习循环 | P0 | email-recipes_20260329 | feature |
| ISS-153 | Patrol 动态优先级 | P1 | patrol-priority_20260329 | feature |
| ISS-154 | 排查 Recipes | P1 | troubleshoot-recipes_20260329 | feature |
| ISS-155 | new-track VP 推理一致性 | P1 | vp-align_20260329 | bug |
| ISS-156 | verify.md 桥接 SKILL.md | P1 | verify-bridge_20260329 | bug |
| ISS-157 | Compliance 软匹配兜底 | P2 | — | feature |

---

_Generated by comprehensive architecture review. Next review recommended after Phase 2 completion._

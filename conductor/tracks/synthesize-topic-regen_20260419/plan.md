# Implementation Plan: SYNTHESIZE Topic-Level Incremental Regeneration

**Track ID:** synthesize-topic-regen_20260419
**Spec:** [spec.md](./spec.md)
**Created:** 2026-04-19
**Status:** [x] Complete

## Overview

Rewrite the incremental synthesis trigger logic in `synthesize.md` and the result-collection logic in `auto-enrich.md` to operate at topic granularity instead of product-level entry-count threshold. Add kqlHashes tracking to synthesizeState.

## Phase 1: synthesize.md — Incremental Logic Rewrite

Rewrite the §1 "读取数据 + 增量检测" section in `modes/synthesize.md`.

### Tasks

- [x] Task 1.1: Replace the 20-entry threshold block with topic-level change detection loop
  - For each topic in topic-plan.json: check new entries, draft hash changes, kql hash changes
  - Build `topicsToRegen` list with reasons
- [x] Task 1.2: Add "unassigned pool" logic for entries that don't match any existing topic
  - New entries → match against topic keywords → unmatched go to unassigned pool
  - Pool >= 10 → trigger small-range clustering (only for unassigned, not full re-cluster)
  - Pool < 10 → skip, log count
- [x] Task 1.3: Add kqlHashes to synthesizeState schema definition
  - Document new field alongside existing draftHashes
  - Add topicRegenLog array for audit trail
- [x] Task 1.4: Update Phase 2 dispatch to only spawn agents for `topicsToRegen` topics
  - Skip unchanged topics entirely (no Agent-A/B/C spawn)
  - Log: "Skipping {N} unchanged topics, regenerating {M} topics"

### Verification

- [x] Read synthesize.md and confirm: no reference to "20" threshold remains; topic-level loop is present

## Phase 2: auto-enrich.md — Result Collection Topic Trigger

Update Step 4 in `modes/auto-enrich.md` to pass topic-level change signals to SYNTHESIZE.

### Tasks

- [x] Task 2.1: In Step 4 "检查产品完成" section, change the SYNTHESIZE trigger
  - Old: "所有 5 个 source 都 exhausted → 全量 MERGE + SYNTHESIZE"
  - New: After MERGE, detect which topics have new/changed entries → pass to SYNTHESIZE as topicsToRegen
- [x] Task 2.2: Add per-notification topic matching in Step 4 result processing
  - When an agent completes with new entries: match entries to topics via keywords
  - Immediately mark matched topics as dirty (don't wait for all sources to exhaust)
- [x] Task 2.3: Update the "即时补位" section to note that partial-source completion can trigger topic-level synthesis
  - A topic can be regenerated even before all 5 sources exhaust, if its inputs changed

### Verification

- [x] Read auto-enrich.md Step 4 and confirm: topic-level trigger logic is present; old "all exhausted → full SYNTHESIZE" is replaced

## Phase 3: progress.json Schema Update

Update the synthesizeState documentation and examples.

### Tasks

- [x] Task 3.1: Update `.enrich/progress.json` schema in auto-enrich.md "文件隔离架构" section
  - Add kqlHashes field definition
  - Add topicRegenLog field definition
  - Update example JSON
- [x] Task 3.2: Update synthesize.md §7 "更新状态" to write kqlHashes and topicRegenLog
- [x] Task 3.3: Update synthesize.md §1 "增量判断" to read kqlHashes for comparison

### Verification

- [x] Grep all 3 files for "kqlHashes" — should appear in schema def, write, and read locations

## Verification Plan

| # | Acceptance Criterion | Test Type | Test Steps |
|---|---------------------|-----------|------------|
| 1 | Single new entry triggers matched topic regen | E2E | Pick a product with existing topic-plan.json → manually append 1 entry to known-issues.jsonl matching a topic keyword → run `/product-learn synthesize {product}` → verify only that topic's guides are regenerated (check file mtime) |
| 2 | Draft hash change triggers workflow regen | E2E | Modify a draft file in guides/drafts/ → run synthesize → verify the associated topic's workflows/ file is regenerated |
| 3 | Kusto query hash change triggers regen | E2E | Modify a kusto query file → run synthesize → verify associated topic regenerated |
| 4 | Unassigned pool clustering at >=10 | E2E | Append 10 entries with novel symptoms not matching any topic keyword → run synthesize → verify new topic created in topic-plan.json |
| 5 | Phase 1 not re-triggered for matched entries | E2E | Append 1 matched entry → run synthesize → verify topic-plan.json timestamp unchanged (no full re-clustering) |
| 6 | synthesizeState has kqlHashes + topicRegenLog | API | Run synthesize → read progress.json → verify kqlHashes dict and topicRegenLog array present |
| 7 | Old 20-entry threshold removed | E2E | Grep synthesize.md for "20" or "< 20" — should find zero matches in the incremental logic section |

**Test Type Legend:**
- **E2E** — Backup data → run actual workflow/script → verify file outputs + API + UI → restore
- **Interaction** — Playwright clicks, form fills, state assertions
- **Visual** — Navigate + screenshot + visual inspection
- **API** — curl/fetch endpoint + assert response
- **Skip** — D365 write/execute operations only (must justify)

## Post-Implementation Checklist

- [ ] synthesize.md 增量逻辑已重写（topic 级）
- [ ] auto-enrich.md Step 4 已更新（topic 级触发）
- [ ] progress.json schema 已更新（kqlHashes + topicRegenLog）
- [ ] 关联 Issue ISS-230 状态已更新为 `implemented`
- [ ] Track metadata.json 已更新
- [ ] tracks.md 状态标记已更新

---

_Generated by Conductor. Tasks will be marked [~] in progress and [x] complete._

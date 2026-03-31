# Implementation Plan: CC Finder Integration

**Track ID:** cc-finder_20260320
**Spec:** [spec.md](./spec.md)
**Created:** 2026-03-31
**Status:** [~] In Progress

## Overview

Integrate RDSE customer CC lookup into three existing workflow components: compliance-check (lookup + persist), email-drafter (consume + render CC line in draft), and generate-todo.sh (CC reminder). Plus config.json new field and Dashboard UI copy button for CC line.

## Phase 1: CC Lookup in Compliance-Check

Add CC lookup step to compliance-check SKILL.md and implement matching logic.

### Tasks

- [x] Task 1.1: Add `podAlias` field to `config.json` (default `mcpodvm@microsoft.com`)
- [x] Task 1.2: Add CC lookup step (Step 3.5) to `.claude/skills/compliance-check/SKILL.md` — after entitlement/21v checks, before upsert. Logic: read `{dataRoot}/mooncake-cc.json`, fuzzy match case customer name against `accounts[].account`, replace `<Replace with POD alias>` with `config.json → podAlias`, write `ccEmails`/`ccAccount`/`ccKnowMePage` to casehealth-meta.json
- [x] Task 1.3: Update `playbooks/schemas/case-directory.md` to document new casehealth-meta fields (`ccEmails`, `ccAccount`, `ccKnowMePage`)

### Verification

- [ ] Run compliance-check on a known RDSE case → verify `ccEmails` appears in casehealth-meta.json
- [ ] Run compliance-check on a non-RDSE case → verify no CC fields written

## Phase 2: Email Drafter CC Line

Modify email-drafter agent to add CC line for initial-response drafts.

### Tasks

- [ ] Task 2.1: Update `.claude/agents/email-drafter.md` Step 1 (Read Context) to also read `casehealth-meta.json → ccEmails`
- [ ] Task 2.2: Update `.claude/agents/email-drafter.md` Step 5 (Save Draft) to add `**CC:** {ccEmails}` header line when `emailType === 'initial-response'` AND `ccEmails` exists. Place between `**To:**` and `**Subject:**` lines
- [ ] Task 2.3: Update `playbooks/guides/customer-communication.md` to reference CC line for RDSE customers

### Verification

- [ ] Manually review email-drafter.md instructions for correct conditional logic

## Phase 3: Todo CC Reminder

Add CC reminder to generate-todo.sh for RDSE cases.

### Tasks

- [ ] Task 3.1: Add CC check to `skills/d365-case-ops/scripts/generate-todo.sh` — read `ccEmails` from meta.json, if present add yellow item: `发送 Initial Response 时请 CC: {ccEmails}`. If `ccKnowMePage` exists, append ` | [Know-Me Wiki]({url})`

### Verification

- [ ] Run `generate-todo.sh` on a case with ccEmails in meta → verify CC reminder in yellow section
- [ ] Run `generate-todo.sh` on a case without ccEmails → verify no CC item

## Phase 4: Dashboard UI — CC Copy Button

Frontend: parse CC header in draft content, render copy button.

### Tasks

- [ ] Task 4.1: Update `DraftCard` in `dashboard/web/src/pages/CaseDetail.tsx` — parse draft content for `**CC:**` line, extract CC value, render a dedicated copy button (clipboard icon) next to the CC line that copies only the email list
- [ ] Task 4.2: Apply same CC copy button logic to `DraftCard` in `dashboard/web/src/pages/DraftsPage.tsx`
- [ ] Task 4.3: Add `podAlias` field to `dashboard/web/src/pages/SettingsPage.tsx` — read/write from config.json

### Verification

- [ ] Visual: navigate to Drafts tab with a CC-bearing draft → verify copy button appears next to CC line
- [ ] Interaction: click CC copy button → verify clipboard contains correct email list

## Verification Plan

| # | Acceptance Criterion | Test Type | Test Steps |
|---|---------------------|-----------|------------|
| 1 | compliance-check fuzzy matches customer name against mooncake-cc.json | E2E | Backup casehealth-meta.json → set customer name to known RDSE account → run /compliance-check → verify ccEmails field in meta → restore |
| 2 | Matched CC emails written to casehealth-meta.json | E2E | Same as #1 — verify ccEmails, ccAccount, ccKnowMePage fields exist and are correct |
| 3 | POD alias placeholder replaced with config value | E2E | Set podAlias in config.json → run compliance-check on RDSE case → verify ccEmails contains configured POD alias, not placeholder |
| 4 | Unmatched customers silently skipped | E2E | Run compliance-check on non-RDSE case → verify no ccEmails/ccAccount/ccKnowMePage in meta |
| 5 | email-drafter adds CC header in initial-response | Skip | Requires spawning email-drafter agent (LLM cost) — verify by manual review of agent instructions |
| 6 | Non-initial-response drafts skip CC | Skip | Same as #5 — instruction-level verification |
| 7 | Dashboard CC copy button | Interaction | Seed a draft file with CC header → navigate to CaseDetail Drafts tab → verify copy button renders → click → verify clipboard |
| 8 | Todo CC reminder when ccEmails exists | E2E | Write ccEmails to test meta.json → run generate-todo.sh → verify yellow section contains CC reminder |
| 9 | config.json podAlias field in Settings | Interaction | Navigate to Settings page → verify podAlias field visible and editable |

**Test Type Legend:**
- **E2E** — Backup data → run actual workflow/script → verify file outputs + API + UI → restore
- **Interaction** — Playwright clicks, form fills, state assertions
- **Visual** — Navigate + screenshot + visual inspection
- **API** — curl/fetch endpoint + assert response
- **Skip** — D365 write/execute operations only (must justify)

## Post-Implementation Checklist

- [ ] 单元测试文件已创建/更新并通过
- [ ] 关联 Issue JSON 状态已更新为 `implemented`（非 `done`，需 verify 后才可标 `done`）
- [ ] Track metadata.json 已更新
- [ ] tracks.md 状态标记已更新

---

_Generated by Conductor from ISS-009 + design spec._

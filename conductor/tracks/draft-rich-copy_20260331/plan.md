# Implementation Plan: WebUI Draft Rich HTML Copy + Edit

**Track ID:** draft-rich-copy_20260331
**Spec:** [spec.md](./spec.md)
**Created:** 2026-03-31
**Status:** [ ] Not Started

## Overview

Three changes: (1) install `marked` and create a copy-as-HTML utility, (2) add PUT endpoint for draft editing, (3) update DraftCard in both pages with rich copy + edit UI.

## Phase 1: Backend — Draft Save Endpoint

Add PUT endpoint and write function so edits can be persisted.

### Tasks

- [ ] Task 1.1: Add `writeDraft()` to `dashboard/src/services/draft-reader.ts`
  - Import `writeFileSync` from `fs`
  - Add function: `export function writeDraft(caseNumber: string, filename: string, content: string): boolean`
  - Construct path via `getCaseDir(caseNumber)` + `drafts/` + filename
  - Validate file exists before overwriting
  - Return true on success, false on failure

- [ ] Task 1.2: Add PUT route to `dashboard/src/routes/drafts.ts`
  - `PUT /api/drafts/:caseId/:file` — accepts `{ content: string }` body
  - Call `writeDraft()`, return 200 or 404/500

- [ ] Task 1.3: Commit
  ```bash
  git add dashboard/src/services/draft-reader.ts dashboard/src/routes/drafts.ts
  git commit -m "feat(api): add PUT endpoint for saving edited email drafts"
  ```

### Verification

- [ ] Test PUT endpoint with curl

## Phase 2: Frontend — Rich Copy + Edit

Install `marked`, create copy utility, update both DraftCard components.

### Tasks

- [ ] Task 2.1: Install `marked`
  ```bash
  cd dashboard/web && npm install marked
  ```

- [ ] Task 2.2: Create `dashboard/web/src/utils/clipboard.ts`
  - `export async function copyAsRichText(markdown: string): Promise<void>`
  - Strip metadata header (everything before first `---` separator after frontmatter)
  - Use `marked.parse(markdown)` to convert body to HTML
  - Wrap in minimal email-safe HTML (inline styles for Outlook compatibility: font-family, font-size)
  - Use `navigator.clipboard.write([new ClipboardItem({ 'text/html': htmlBlob, 'text/plain': plainBlob })])`
  - Fallback: if clipboard.write() not available, fall back to writeText()

- [ ] Task 2.3: Update DraftCard in `dashboard/web/src/pages/CaseDetail.tsx`
  - Import `copyAsRichText` from utils
  - Add state: `editing: boolean`, `editContent: string`
  - Replace `handleCopy` to use `copyAsRichText(editContent || cleanContent)`
  - Add Edit button next to Copy button (Pencil icon from lucide-react)
  - When editing=true: show textarea with markdown content, Save + Cancel buttons
  - Save: PUT to `/api/drafts/${caseNumber}/${draft.filename}` with editContent, then mutate query
  - Cancel: reset editContent, set editing=false

- [ ] Task 2.4: Update DraftCard in `dashboard/web/src/pages/DraftsPage.tsx`
  - Apply same changes as Task 2.3 (Copy + Edit)
  - This page's DraftCard is nearly identical — apply same pattern

- [ ] Task 2.5: Commit
  ```bash
  git add dashboard/web/package.json dashboard/web/package-lock.json
  git add dashboard/web/src/utils/clipboard.ts
  git add dashboard/web/src/pages/CaseDetail.tsx dashboard/web/src/pages/DraftsPage.tsx
  git commit -m "feat(webui): rich HTML copy + inline edit for email drafts"
  ```

### Verification

- [ ] Build passes: `cd dashboard/web && npm run build`
- [ ] Visual check: Edit + Copy buttons visible on draft cards

## Verification Plan

| # | Acceptance Criterion | Test Type | Test Steps |
|---|---------------------|-----------|------------|
| 1 | Copy outputs text/html to clipboard | Interaction | Navigate to case with drafts → click Copy → paste into test rich text field → verify bold/list preserved |
| 2 | text/plain fallback works | Interaction | Copy → Ctrl+Shift+V into plain text editor → verify plain markdown text |
| 3 | Edit button shows textarea | Interaction | Click Edit → verify textarea appears with markdown content → click Cancel → verify returns to rendered view |
| 4 | Save persists to file | E2E | Backup draft file → click Edit → modify text → click Save → API verify file content changed → restore |
| 5 | Copy after edit uses modified content | Interaction | Edit draft → modify text → Copy → paste → verify modified content appears |
| 6 | Both pages have same behavior | Visual | Check CaseDetail drafts tab and DraftsPage both have Edit + Copy buttons |

**Test Type Legend:**
- **E2E** — Backup data → run actual workflow/script → verify file outputs + API + UI → restore
- **Interaction** — Playwright clicks, form fills, state assertions
- **Visual** — Navigate + screenshot + visual inspection
- **API** — curl/fetch endpoint + assert response
- **Skip** — D365 write/execute operations only (must justify)

## Post-Implementation Checklist

- [ ] 关联 Issue JSON 状态已更新为 `implemented`
- [ ] Track metadata.json 已更新
- [ ] tracks.md 状态标记已更新

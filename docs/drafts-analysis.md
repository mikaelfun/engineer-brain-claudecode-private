# DraftsPage Implementation Analysis

## Overview
The EngineerBrain Dashboard has TWO integrated drafts management views:
1. **DraftsPage** - Global view across all active cases
2. **CaseDetail DraftsTab** - Per-case draft management

Both share the same backend services and TypeScript types.

---

## File Locations

### Frontend Components
- **DraftsPage**: dashboard/web/src/pages/DraftsPage.tsx
- **CaseDetail + DraftsTab**: dashboard/web/src/pages/CaseDetail.tsx (lines 401-595)
- **React Query Hook**: dashboard/web/src/api/hooks.ts (lines 249-256)

### Backend Services  
- **API Routes**: dashboard/src/routes/drafts.ts
- **File I/O**: dashboard/src/services/draft-reader.ts
- **Path Resolution**: dashboard/src/services/workspace.ts
- **Configuration**: dashboard/src/config.ts
- **Types**: dashboard/src/types/index.ts (Draft interface lines 232-238)

### Tests
- **Unit Tests**: dashboard/web/src/pages/CaseDetail.DraftsTab.test.tsx

---

## Disk Storage Structure



Markdown files, one drafts/ directory per case, created on-demand.

---

## TypeScript Type

From src/types/index.ts:


---

## Sorting & Grouping Summary

### DraftsPage (Global)
- FETCH: readAllDrafts() returns all active case drafts, sorted DESC by mtime
- GROUP: Component reduces by caseNumber into object
- DISPLAY: H3 headers per case, collapsible cards

### CaseDetail DraftsTab (Per-Case)
- FETCH: readCaseDrafts() returns unsorted drafts
- SORT: Component sorts DESC by createdAt (newest first)
- DISPLAY: First card auto-expanded, rest with 'Historical' badge

### Archive Handling
- DraftsPage: Active cases only (listActiveCases)
- CaseDetail: Both active and AR (getCaseDir fallback)

---

## How Timestamps Work

1. createdAt = fs.statSync().mtime.toISOString()
2. NOT stored in file content
3. Dynamic - updates when file edited
4. Filename dates (e.g., -20260331.md) are informational only
5. Sorting uses mtime as source of truth

---

## Key Components

DraftCard (shared between both views):
- Expandable header with chevron
- Shows: filename, timestamp, markdown content
- Features: Copy to Outlook, Copy CC emails, Edit inline
- Markdown rendering via <MarkdownContent>

API Endpoints:
- GET /api/drafts → all active drafts (sorted)
- GET /api/drafts/:caseId/:file → single draft
- PUT /api/drafts/:caseId/:file → update content

---

## Data Flow

DraftsPage:
useDrafts() → GET /api/drafts → readAllDrafts() → fs reads drafts/ dir → sorts DESC → groups by case

CaseDetail:
useCaseDrafts(id) → GET /api/cases/{id}/drafts → readCaseDrafts() → fs reads drafts/ dir → component sorts DESC → latest auto-expanded



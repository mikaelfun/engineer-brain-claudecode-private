# CC-Finder Integration Design

**Issue**: ISS-009
**Date**: 2026-03-31
**Status**: Approved

## Overview

Integrate RDSE customer CC (Customer Contact) lookup into the casework workflow. When processing a case for an RDSE customer, automatically find the matching CC email list from `mooncake-cc.json` and surface it in the initial response email draft + todo reminder.

## Requirements Summary

| Requirement | Decision |
|-------------|----------|
| Trigger scope | Initial response email only |
| Display | Draft header CC line (with copy button) + Todo reminder |
| Lookup timing | During compliance-check step |
| POD alias placeholder | Replace with configurable value (default `mcpodvm@microsoft.com`) |
| No match behavior | Silent skip, no CC line in draft |

## Architecture: Approach A — Compliance-check Inline

CC lookup is a compliance-level check (only RDSE customers need it), so it lives inside `compliance-check` rather than as a separate skill. Data flows:

```
compliance-check                    email-drafter              inspection-writer
      |                                  |                           |
 read case-info.md (customer name)       |                           |
 read mooncake-cc.json                   |                           |
 fuzzy match account                     |                           |
 replace POD placeholder                 |                           |
 write casehealth-meta.json              |                           |
      |                            read ccEmails                read ccEmails
      |                            add CC: header line          add todo reminder
      |                            (initial-response only)            |
```

## Section 1: CC Lookup Logic (compliance-check)

### Trigger

After existing entitlement/21v checks, add a CC lookup step.

### Matching Logic

1. Extract customer name from `case-info.md` (`Customer/Account` field)
2. Read `{dataRoot}/mooncake-cc.json`
3. Fuzzy match against `accounts[].account` — account names may contain multiple aliases separated by `/`, mixing Chinese and English (e.g., `"BMW (宝马) / 宝马中国"`)
4. On match: extract `cc` field (semicolon-separated email list)
5. Replace `<Replace with POD alias>` placeholder with `config.json → podAlias` (default `mcpodvm@microsoft.com`)
6. On no match: silent skip, do not write CC fields

### Output to casehealth-meta.json

New fields added when a match is found:

```json
{
  "ccEmails": "tam@microsoft.com; sdm@microsoft.com; mcpodvm@microsoft.com; mcccwl@microsoft.com",
  "ccAccount": "BMW (宝马)",
  "ccKnowMePage": "https://dev.azure.com/..."
}
```

- `ccEmails`: Processed CC list with placeholder replaced
- `ccAccount`: Matched account name (for debugging/display)
- `ccKnowMePage`: Know-Me Wiki link (nullable, omitted if null)

## Section 2: Email Drafter Consumption

### Trigger

Only when generating **initial-response** type drafts. Other types (follow-up, closure) skip CC even if `ccEmails` exists in meta.

### Draft Format Change

Add `CC:` line to draft header:

```
To: customer@example.com
CC: tam@microsoft.com; sdm@microsoft.com; mcpodvm@microsoft.com; mcccwl@microsoft.com
Subject: [Case# 123456] RE: ...
Language: zh
Type: initial-response
---
Email body...
```

### No CC Data

When `casehealth-meta.json` has no `ccEmails` field, draft renders without CC line — identical to current behavior.

## Section 3: Todo Reminder (inspection-writer)

When `casehealth-meta.json` contains `ccEmails`, inspection-writer adds a reminder item:

```markdown
- 🟡 发送 Initial Response 时请 CC: `tam@microsoft.com; sdm@microsoft.com; ...`
```

If `ccKnowMePage` exists, append the link:

```markdown
- 🟡 发送 Initial Response 时请 CC: `tam@...` | [Know-Me Wiki](https://dev.azure.com/...)
```

## Section 4: config.json Change

New field:

```json
{
  "podAlias": "mcpodvm@microsoft.com"
}
```

Used to replace `<Replace with POD alias>` in mooncake-cc.json entries. Editable via Dashboard Settings page.

## Section 5: Dashboard UI — Copy Button

### Location

Email draft render area, inline with the `CC:` header line.

### Behavior

- Click copies plain-text CC email list only (no `CC:` prefix)
- Success state: button briefly shows checkmark (1.5s)
- API: `navigator.clipboard.writeText()`

### Style

Small icon button (clipboard icon), tooltip "Copy CC list" on hover. Consistent with existing draft area styling. Only rendered when `CC:` line exists in draft.

### Render Logic

Dashboard frontend parses draft file header, recognizes `CC:` line, and renders it as a component with the copy button. No CC line = no change to existing UI.

## Files Modified

| File | Change |
|------|--------|
| `.claude/skills/compliance-check/SKILL.md` | Add CC lookup step |
| `.claude/skills/draft-email/SKILL.md` | Add CC line logic for initial-response |
| `.claude/skills/inspection-writer/SKILL.md` | Add CC todo reminder |
| `config.json` | Add `podAlias` field |
| `dashboard/` (frontend) | CC copy button in draft renderer |
| `playbooks/schemas/case-directory.md` | Document new casehealth-meta fields |

## Out of Scope

- Auto-refresh of mooncake-cc.json (existing manual script `fetch-powerbi-cc.js`)
- CC lookup for non-RDSE customers
- CC in follow-up/closure emails
- Auto-sending emails with CC (engineer always sends manually)

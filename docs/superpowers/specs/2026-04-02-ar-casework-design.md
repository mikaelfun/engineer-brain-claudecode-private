# AR Casework Design Spec

## Overview

Extend the existing casework system to support **AR (Assistance Request)** case type processing. When the user is an AR owner (not the main case owner), casework follows a different execution path with AR-specific data collection, status judgment, and routing logic.

## Problem Statement

Currently, casework treats all cases equally as if the user is the primary case owner. AR cases require a fundamentally different workflow:

- The user doesn't own the main case lifecycle (SLA, closure decisions)
- Communication may be with the case owner (internal) or directly with the customer (customer-facing)
- The scope of work is limited to the AR's specific ask
- Data lives across two D365 entities: the main case (emails, case-info) and the AR case (notes with scope/requirements)

## Architecture Decision

**Approach: Casework Internal Branch (Option A)**

Add an AR branch path inside the existing casework SKILL.md, forking after changegate based on the `isAR` flag. This reuses 80% of existing infrastructure (changegate, timing, todo generation, compliance) while customizing the 20% that differs (status-judge semantics, routing, data collection).

Alternatives considered:
- **Independent AR Skill** — rejected due to massive code duplication and dual maintenance burden
- **Strategy/Profile Pattern** — rejected as over-engineering for two case types (YAGNI)

## AR Identification

AR cases are identified by their case number suffix:

- Case number with 3+ digit suffix (e.g., `2603300030003153001`) = AR case
- `mainCaseId` = case number without suffix (e.g., `2603300030003153`)
- Detection happens automatically in changegate, setting `isAR = true` in meta

## Meta Schema Extension

### New `ar` field in casehealth-meta.json

```json
{
  "caseNumber": "2603300030003153001",
  "isAR": true,
  "mainCaseId": "2603300030003153",

  "ar": {
    "scope": "Azure VM performance troubleshooting",
    "scopeConfirmed": false,
    "communicationMode": "internal",
    "caseOwnerEmail": "other.engineer@microsoft.com",
    "caseOwnerName": "Other Engineer"
  },

  "actualStatus": "pending-engineer",
  "daysSinceLastContact": 2

  // irSla / fdr / fwr — NOT written for AR cases (not AR owner's SLA responsibility)
}
```

### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `ar.scope` | string | One-sentence summary of what the AR asks you to do. Extracted from AR notes/description by LLM. |
| `ar.scopeConfirmed` | boolean | Whether the user has confirmed the extracted scope is accurate. |
| `ar.communicationMode` | `"internal"` \| `"customer-facing"` | Auto-detected from email participants. Internal = only communicate with case owner. Customer-facing = pulled into customer email thread. |
| `ar.caseOwnerEmail` | string | Main case owner's email address. Extracted from main case data. |
| `ar.caseOwnerName` | string | Main case owner's display name. |

### Status Enum Reinterpretation for AR

The existing 6-value `actualStatus` enum is reused with AR-specific semantics:

| actualStatus | Main Case Semantics | AR Internal Mode | AR Customer-Facing Mode |
|---|---|---|---|
| `new` | Fresh case, no communication | New AR, not started | New AR, not started |
| `pending-engineer` | Customer waiting for you | **Case owner waiting for your answer** | **Customer waiting for your answer (AR scope)** |
| `pending-customer` | You waiting for customer | **You waiting for case owner info** | **You waiting for customer reply (AR scope)** |
| `pending-pg` | Waiting for PG | AR scope issue waiting for PG | AR scope issue waiting for PG |
| `researching` | Actively diagnosing | Researching AR scope issue | Researching AR scope issue |
| `ready-to-close` | Problem solved | **AR work complete, notify case owner** | **AR scope issue resolved** |

### daysSinceLastContact for AR

- **Internal mode**: Days since your last reply in `notes-ar.md` to case owner
- **Customer-facing mode**: Days since your last email to customer in `emails.md`

## Data Collection (AR Mode)

### AR Case Directory Structure

```
cases/active/2603300030003153001/
+-- case-info.md        <- From main case (AR has no independent case-info)
+-- emails.md           <- From main case D365 (AR has no independent emails)
+-- notes.md            <- Main case notes
+-- notes-ar.md         <- AR case notes (case owner requirements + your work records)  [NEW]
+-- attachments/        <- From main case
+-- casehealth-meta.json
+-- case-summary.md
+-- analysis/           <- Troubleshooter reports
+-- drafts/             <- Email drafts
+-- teams/              <- Teams search results
+-- onenote/            <- OneNote search (search AR ID for personal notes)
+-- todo/               <- Todo files
+-- logs/               <- Timestamps + logs
```

**Key difference**: No `main-case/` subdirectory. All main case data stored directly in the AR case directory.

**`notes-ar.md` format**: Same reverse-chronological append format as `notes.md`. Each note entry includes timestamp, author, and content. This file only contains notes from the AR case entity, keeping AR-specific communications separate from main case notes.

### data-refresh Behavior (isAR = true)

**From mainCaseId (main case):**
- `case-info.md` — main case basic information
- `emails.md` — main case D365 email thread
- `notes.md` — main case notes
- `attachments/` — main case attachments

**From AR caseNumber:**
- `notes-ar.md` — AR-specific notes

**Skipped:**
- `emails-office.md` — not needed for AR
- SLA information — not AR owner's responsibility
- AR case-info — doesn't exist as separate entity

### Communication Mode Auto-Detection

After data-refresh completes, analyze `emails.md` (from main case):

1. Extract all email participants (To/CC) from recent emails
2. Check if AR owner's email is in To/CC
   - Yes -> `communicationMode = "customer-facing"`
   - No -> `communicationMode = "internal"`
3. Extract main case owner email/name -> `ar.caseOwnerEmail`, `ar.caseOwnerName`

### AR Scope Extraction

1. Read `notes-ar.md` -> find case owner's earliest note (usually contains AR requirements)
2. Read AR case description/title from D365 (if available via data-refresh)
3. LLM extracts one-sentence scope summary
4. On first processing -> generate yellow Todo: "AR Scope: {extracted_scope}, please confirm accuracy"
5. After user confirms -> `scopeConfirmed = true`, no further prompts

### Search Strategy

| Search Type | Main Case | AR Internal Mode | AR Customer-Facing Mode |
|---|---|---|---|
| Teams | Customer name | Case owner name + AR ID | Customer name + main case number |
| OneNote | Case number + tech keywords | **AR ID** (personal notes) | AR ID (personal notes) |

## Compliance Check (AR Mode)

### Entitlement Check with Caching

- **First run (new AR)**: Execute full Entitlement check on main case data
  - If FAIL -> RED block, terminate AR casework
  - If PASS -> Cache result in `meta.compliance.entitlementOk`
- **Subsequent runs**: Read `meta.compliance.entitlementOk`
  - If value exists -> Skip check, reuse cached result
  - If missing -> Execute check (first-time scenario)

### 21v Detection and CC Finder

Same caching logic: already-detected values are reused, only first run executes detection.

### Skipped for AR

- SLA checks (IR/FDR/FWR) are completely skipped — not AR owner's responsibility

## AR Status Judge

### Data Sources for Judgment

- `emails.md` (main case emails) -> who communicated last, what's the intent
- `notes-ar.md` (AR notes) -> case owner's latest request, your latest reply
- Teams search results -> supplementary signal (case owner pinging you?)
- `ar.communicationMode` -> determines which rule set to apply

### Internal Mode Rules

| Signal | actualStatus |
|---|---|
| AR just created, you haven't started | `new` |
| Case owner posted new question in notes/Teams, you haven't responded | `pending-engineer` |
| You replied in notes, waiting for case owner feedback | `pending-customer` |
| AR scope issue needs PG investigation (ICM) | `pending-pg` |
| You're actively doing Kusto/doc research | `researching` |
| AR scope issue resolved, you've replied to case owner | `ready-to-close` |

### Customer-Facing Mode Rules

| Signal | actualStatus |
|---|---|
| You were pulled into email thread but haven't replied | `pending-engineer` |
| You replied to customer (AR scope), waiting for customer feedback | `pending-customer` |
| Customer replied with new AR scope question | `pending-engineer` |
| AR scope issue waiting for PG | `pending-pg` |
| Actively researching AR scope technical issue | `researching` |
| Customer confirmed AR scope issue resolved | `ready-to-close` |

## AR Routing

```
AR actualStatus -> Route Decision
+-- new                        -> RED Todo: "New AR, review scope and start processing"
|                                 + spawn troubleshooter (if scope involves tech investigation)
+-- pending-engineer           -> spawn troubleshooter (diagnose AR scope issue)
|                                 + spawn email-drafter (generate reply draft)
+-- pending-customer (days<3)  -> GREEN Todo: "Waiting for reply ({days} days)"
+-- pending-customer (days>=3) -> YELLOW Todo: "No reply for {days} days"
|                                 + spawn email-drafter (follow-up)
|                                 - Internal: follow-up to case owner
|                                 - Customer-facing: follow-up to customer (AR scope only)
+-- pending-pg                 -> GREEN Todo: "AR scope issue waiting for PG"
+-- researching                -> spawn troubleshooter (continue AR scope diagnosis)
+-- ready-to-close             -> YELLOW Todo: "AR work complete"
                                  + spawn email-drafter
                                  - Internal: summary email to case owner
                                  - Customer-facing: conclusion email to customer (CC case owner)
```

### email-drafter AR Adaptation

| Scenario | Recipient | Content Scope |
|---|---|---|
| Internal - reply to case owner | case owner email | AR scope analysis conclusions and recommendations |
| Internal - follow-up | case owner email | Ask if AR assistance is still needed |
| Customer-facing - reply to customer | customer email (reply-all from main case thread) | AR scope reply only |
| Customer-facing - follow-up | customer email | AR scope follow-up only |
| ready-to-close - internal | case owner email | AR completion summary |
| ready-to-close - customer-facing | customer email + CC case owner | AR scope conclusion |

## AR Todo Rules (generate-todo.sh Extension)

### New AR-Specific Rules

```bash
if [ "$IS_AR" = "true" ]; then
  # Scope not confirmed
  if [ "$SCOPE_CONFIRMED" = "false" ]; then
    YELLOW_ITEMS+=("AR Scope: ${AR_SCOPE}, please confirm accuracy")
  fi

  # AR complete
  if [ "$ACTUAL_STATUS" = "ready-to-close" ]; then
    YELLOW_ITEMS+=("AR work complete, notify case owner: ${CASE_OWNER_NAME}")
  fi

  # Skip SLA-related todos (IR/FDR/FWR rules do NOT apply to AR)
fi
```

### Skipped for AR

- IR SLA not met warnings (not your SLA)
- FDR/FWR expiration warnings (not your SLA)

## Casework Execution Flow (AR PATH)

### Flow Diagram

```
Changegate
+-- isAR = false -> [existing NORMAL/FAST PATH, unchanged]
+-- isAR = true  -> AR PATH

--- AR PATH ---

Step A0: AR Initialization
+-- Detect isAR (case number suffix)
+-- Read/create casehealth-meta.json
+-- Extract mainCaseId

Step A1: AR Changegate
+-- Compare main case + AR case cached vs current D365 state
+-- NO_CHANGE + summary exists -> AR FAST PATH (generate todo only)
+-- CHANGED -> AR NORMAL PATH

--- AR NORMAL PATH ---

Step A2: Spawn parallel agents
+-- data-refresh (AR mode: pull main case data + AR notes)
+-- teams-search (case owner name / customer name depending on mode)
+-- onenote-search (AR ID for personal notes)

Step A3: Compliance check (with caching)
+-- Read meta.compliance
+-- If entitlementOk exists -> skip (reuse cache)
+-- If empty (first run) -> full Entitlement check
+-- If FAIL -> RED block, terminate
+-- 21v / CC Finder -> same caching logic

Step A4: Wait for agents (max 180s)

Step A5: AR Scope extraction (first run or scope unconfirmed)
+-- Read notes-ar.md + AR description
+-- LLM extract scope summary
+-- Write meta: ar.scope
+-- Generate YELLOW Todo for confirmation

Step A6: Communication mode detection
+-- Analyze emails.md participants
+-- Detect AR owner email in mail thread
+-- Set ar.communicationMode
+-- Extract ar.caseOwnerEmail / ar.caseOwnerName

Step A7: AR Status Judge
+-- Select rules based on communicationMode
+-- Analyze emails.md + notes-ar.md + Teams results
+-- Determine actualStatus + daysSinceLastContact
+-- Write meta

Step A8: AR Routing
+-- Route by actualStatus + communicationMode
+-- Spawn troubleshooter (scoped to AR) if needed
+-- Spawn email-drafter (recipient based on mode) if needed

Step A9: AR Inspection + Todo
+-- Generate/update case-summary.md (AR perspective)
+-- Run generate-todo.sh (AR mode)
+-- Write timing.json
```

### AR FAST PATH

```
Condition: NO_CHANGE + case-summary.md exists

Execution:
+-- Read existing meta
+-- Run generate-todo.sh (AR mode)
+-- Output todo
+-- Write timing.json
```

## Files to Modify

| File | Change Type | Description |
|---|---|---|
| `.claude/skills/casework/SKILL.md` | Modify | Add AR PATH branch after changegate |
| `.claude/skills/data-refresh/SKILL.md` | Modify | Support isAR mode: pull main case data + AR notes |
| `skills/d365/fetch-all-data.ps1` | Modify | Support mainCaseId parameter for main case data |
| `.claude/skills/compliance-check/SKILL.md` | Modify | Add caching mode (skip if already checked) |
| `.claude/skills/status-judge/SKILL.md` | Modify | Add AR semantic judgment rules |
| `.claude/skills/inspection-writer/SKILL.md` | Modify | AR-perspective summary generation |
| `skills/d365/generate-todo.sh` | Modify | Add AR-specific todo rules, skip SLA rules |
| `playbooks/schemas/case-directory.md` | Modify | Add `notes-ar.md` file description |
| `playbooks/schemas/casehealth-meta.md` | Modify | Add `ar` field schema documentation |

## Files NOT Modified

| File | Reason |
|---|---|
| `.claude/skills/patrol/SKILL.md` | Patrol scans all active/ cases, AR naturally included |
| `.claude/agents/troubleshooter.md` | Troubleshooter prompt dynamically assembled by casework routing |
| `.claude/agents/email-drafter.md` | Email-drafter recipients/scope passed by casework routing |
| `.claude/agents/teams-search.md` | Teams search keywords passed by casework |
| Dashboard WebUI | Todo display format-compatible, no changes needed |

## Test Scenarios

### 1. New AR Case First Processing
- **Input**: AR case number (with suffix)
- **Expected**: Detect isAR -> pull main case data + AR notes -> Entitlement check -> Scope extraction -> status judgment -> generate todo

### 2. AR Internal Mode - pending-engineer
- **Input**: Case owner posted new question in notes
- **Expected**: Status = pending-engineer -> spawn troubleshooter + email-drafter -> generate reply draft to case owner

### 3. AR Customer-Facing Mode - pending-engineer
- **Input**: Customer email with AR scope question
- **Expected**: Status = pending-engineer -> troubleshoot -> generate reply draft to customer (AR scope only)

### 4. AR FAST PATH
- **Input**: Previously processed AR, no main case data changes
- **Expected**: Changegate detects NO_CHANGE -> generate todo directly -> fast completion

### 5. AR Entitlement Caching
- **Input**: AR with previously checked Entitlement, second processing
- **Expected**: Skip Entitlement check, reuse cached result

### 6. AR ready-to-close
- **Internal mode**: Generate summary email draft to case owner
- **Customer-facing mode**: Generate conclusion email to customer (CC case owner)

## D365 Write Operations for AR

- **Note addition**: Reuse existing note functionality, write to AR case (not main case)
- **D365 AR status**: Do NOT modify AR status in D365 (user's explicit requirement)
- **Labor**: Standard labor recording on AR case number

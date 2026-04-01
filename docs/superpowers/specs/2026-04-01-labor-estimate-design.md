# Labor Estimate Skill Design

> AI-powered labor time estimation for D365 cases with learning calibration.

## Overview

A skill that analyzes daily case activities (investigation, emails, analysis, notes) to estimate labor time, presents the estimate for user review and editing, then optionally writes the labor record to D365. Supports both CLI and WebUI, including batch estimation across all active cases.

## Architecture

```
Case Files ──▶ AI Estimation Engine ──▶ labor-estimate.json ──▶ User Edit/Confirm ──▶ record-labor.ps1 ──▶ D365
                     ▲
              calibration.json
              (learned preferences)
```

### Core Files

| File | Location | Purpose |
|------|----------|---------|
| `SKILL.md` | `.claude/skills/labor-estimate/` | Skill definition |
| `labor-estimate.json` | `{caseDir}/labor/` | Per-estimation result, persisted |
| `calibration.json` | `skills/labor-estimate/` | User preference learning data |

## Trigger

- **CLI**: `/labor-estimate {caseNumber}` (single) or `/labor-estimate all` (batch)
- **WebUI**: "Estimate Labor" button per case + "Estimate All Labor" batch button
- **Not auto-triggered** by casework — always manual invocation

## Input Sources

AI reads these files from the case directory to infer daily effort. "Today" is determined by comparing timestamps/dates in file content against the current date (or a user-specified date via `/labor-estimate {caseNumber} --date 2026-03-31`):

| File | Information Extracted |
|------|---------------------|
| `case-summary.md` | Daily investigation progress, key findings, activity timeline |
| `emails.md` | Email count, complexity (length, technical depth) |
| `notes.md` | Notes added today |
| `analysis/*.md` | Investigation reports (Kusto analysis, doc research) |
| `case-info.md` | Product, severity, SLA — influences complexity assessment |
| `teams/*.md` | Internal Teams communication records |
| `calibration.json` | Historical preference calibration multipliers |

## Estimation Logic

### Effort Categories & Baseline Reference

AI uses these as guidelines, not hard rules:

| Effort Type | Baseline Range | Description |
|-------------|---------------|-------------|
| `troubleshooting` | 15-60 min | Kusto queries, log analysis, remote debugging |
| `email` | 5-15 min/email | Composing/replying to emails |
| `research` | 10-30 min | Documentation lookup, KB search |
| `notes` | 5-10 min | Case notes updates |
| `remote_session` | 30-90 min | Remote sessions (e.g., Teams remote) |
| `internal_consult` | 10-30 min | Internal discussions (Teams messages) |
| `analysis` | 15-45 min | Generating analysis reports |

### D365 Classification Mapping

D365 Labor Classification values (actual options):
- `Troubleshooting` — troubleshooting/analysis dominant
- `Research` — research dominant
- `Communications` — email/internal_consult dominant
- `Tech Review` — code/config review activities
- `Scoping` — initial scoping activities
- `Recovery & Billing` — billing/recovery related
- `Admin Review` — administrative tasks

AI selects based on the dominant effort type. User commonly uses: `Troubleshooting`, `Research`, `Communications`.

### Calibration Learning

Each time the user modifies an estimate and submits:

1. Record `{effortType, aiEstimate, userFinal}`
2. Update multiplier using exponential moving average (alpha=0.3):
   - `newMultiplier = 0.3 * (userFinal / aiEstimate) + 0.7 * oldMultiplier`
3. Next estimation: AI baseline * multiplier = calibrated estimate

## Data Structures

### labor-estimate.json

```json
{
  "date": "2026-04-01",
  "caseNumber": "2504010001234",
  "estimated": {
    "totalMinutes": 45,
    "classification": "Troubleshooting",
    "description": "Investigated VM boot failure, analyzed boot diagnostics logs, communicated with customer to confirm configuration",
    "breakdown": [
      {"type": "troubleshooting", "minutes": 25, "detail": "Analyzed boot diagnostics + Kusto query"},
      {"type": "email", "minutes": 10, "detail": "2 email exchanges"},
      {"type": "notes", "minutes": 10, "detail": "Updated case notes"}
    ]
  },
  "final": null,
  "status": "pending"
}
```

Status flow: `pending` → `confirmed` → `submitted`

- `pending`: AI generated estimate, not yet reviewed
- `confirmed`: User reviewed and confirmed values
- `submitted`: Successfully written to D365

### calibration.json

```json
{
  "adjustments": {
    "troubleshooting": { "multiplier": 1.0, "samples": 0 },
    "email": { "multiplier": 1.0, "samples": 0 },
    "research": { "multiplier": 1.0, "samples": 0 },
    "notes": { "multiplier": 1.0, "samples": 0 },
    "remote_session": { "multiplier": 1.0, "samples": 0 },
    "internal_consult": { "multiplier": 1.0, "samples": 0 },
    "analysis": { "multiplier": 1.0, "samples": 0 }
  },
  "history": [
    {
      "date": "2026-04-01",
      "caseNumber": "2504010001234",
      "aiTotal": 45,
      "userTotal": 60,
      "breakdown": [
        {"type": "troubleshooting", "aiMinutes": 25, "userMinutes": 35}
      ]
    }
  ],
  "lastUpdated": "2026-04-01"
}
```

## CLI Interaction

### Single Case: `/labor-estimate 2504010001234`

```
Analyzing Case 2504010001234 daily activities...

Labor Estimate Result:

  Case:           2504010001234 - VM boot failure
  Date:           2026-04-01
  Estimated:      45 minutes
  Classification: Troubleshooting
  Description:    Investigated VM boot failure, analyzed boot diagnostics
                  logs, communicated with customer to confirm configuration

  Breakdown:
    Troubleshooting  25 min  (boot diagnostics + Kusto)
    Email            10 min  (2 emails)
    Notes            10 min
```

Then present `AskUserQuestion` with options:
- "Submit to D365" — write as-is
- "Edit duration" — modify total minutes
- "Edit classification" — change classification
- "Edit description" — modify description text
- "Skip" — save locally but don't submit

User can iterate edits via follow-up `AskUserQuestion` until satisfied.

### Batch: `/labor-estimate all`

```
Analyzing all active cases...

Batch Labor Estimates (2026-04-01):

  #  Case            Product           Min   Classification    Description
  1  2504010001234   Virtual Machines   45   Troubleshooting   Investigated VM boot...
  2  2504010005678   App Service        20   Communications    Replied to deployment...
  3  2504010009012   SQL Database       60   Troubleshooting   Analyzed slow query...

  Total: 125 minutes (3 cases)
```

Then `AskUserQuestion`:
- "Submit all to D365"
- "Edit individual cases" — enter edit mode per case
- "Submit selected" — choose which to submit
- "Skip all" — save locally only

**Description language**: All descriptions are generated in English.

## WebUI Interaction

### Single Case

- Case detail page: "Estimate Labor" button
- Calls `POST /api/labor-estimate/{caseNumber}`
- Renders editable card: duration input, classification dropdown, description textarea
- "Submit to D365" button to confirm

### Batch Mode (Primary Flow)

1. "Estimate All Labor" button (sidebar or case list page header)
2. Backend estimates all active cases in parallel
3. Frontend renders editable table:

| Select | Case | Minutes | Classification | Description |
|--------|------|---------|---------------|-------------|
| ☑ | 250401...1234 | `[45]` | `[Troubleshooting ▼]` | `[Investigated...]` |
| ☑ | 250401...5678 | `[20]` | `[Communications ▼]` | `[Replied to...]` |
| ☐ | 250401...9012 | `[60]` | `[Troubleshooting ▼]` | `[Analyzed slow...]` |

- Each row: inline-editable duration (number input), classification (dropdown), description (text)
- Checkbox to select which cases to submit
- "Submit Selected" button for batch D365 write
- Total minutes displayed at bottom

### API Design

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/labor-estimate/:caseNumber` | POST | Single case estimation |
| `/api/labor-estimate/all` | POST | Batch estimation for all active cases |
| `/api/labor-estimate/:caseNumber/submit` | POST | Submit single case to D365 |
| `/api/labor-estimate/batch-submit` | POST | Batch submit (body: array of {caseNumber, minutes, classification, description}) |

## Edge Cases

| Scenario | Handling |
|----------|---------|
| No activity today | Skip case, don't generate estimate |
| Labor already recorded today | Warn user, ask if append or skip |
| Estimate is 0 minutes | Don't generate record |
| record-labor.ps1 fails | Keep `labor-estimate.json` as `confirmed`, user can retry |
| Partial batch failure | Report per-case results, failed ones stay `confirmed` |

## Safety Boundaries

- **Auto**: Estimation and local file save
- **User confirmation required**: Writing to D365 (CLI via AskUserQuestion, WebUI via Submit button)
- **Never**: Auto-submit to D365 without explicit user action

## Integration Points

- **Reuses**: `record-labor.ps1` for D365 write (no new D365 integration needed)
- **Reads**: Same case files as `inspection-writer` — no new data dependencies
- **Outputs**: `{caseDir}/labor/labor-estimate.json` — new directory under case
- **WebUI**: New page/component + 4 new API endpoints
- **Skill category**: `inline` (Main Agent executes directly)

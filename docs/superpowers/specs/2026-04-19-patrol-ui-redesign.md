# Patrol Page UI Redesign — DevOps Pipeline Style

**Date:** 2026-04-19
**Status:** Design approved, ready for implementation

## Context

Current patrol page has minimal visibility into what each phase/step is doing. The global pipeline shows dots without details, case rows show step dots without substep status, and there are dead periods (agent SDK startup) with no progress indication. The UI also doesn't match the dashboard's Sentry-inspired design system.

## Design Direction

**DevOps Pipeline style** (Azure DevOps / GitHub Actions): stages as cards with status indicators, expandable to show job details, clear visual flow with connecting lines.

## Layout: Left Sidebar + Right Content

```
┌───────────────────────┬──────────────────────────────────────────┐
│  Pipeline (260px)     │  Cases (flex: 1)                        │
│  sticky, vertical     │                                         │
│                       │  ┌─ Active case (expanded) ────────────┐│
│  ● Start        8s    │  │ Start│Refresh│Assess│ Act  │Summary ││
│  │                    │  │  3s  │ 27s   │1m52s │ 32s  │ wait   ││
│  ● Discover    12s    │  └─────────────────────────────────────┘│
│  │                    │  ┌─ Starting case ─────────────────────┐│
│  ● Filter       3s    │  │ Start(launching)│ rest pending      ││
│  │                    │  └─────────────────────────────────────┘│
│  ● Warmup       5s    │  ┌─ Done case (collapsed) ────────────┐│
│  │                    │  │ › 260130... ✓ done  no-change 1m59s ││
│  ◉ Process    4m04s   │  └─────────────────────────────────────┘│
│  │ 5/12 ████░░░       │  ┌─ Queued ───────────────────────────┐│
│  │ 🔄 0748 troub done │  │   260401...  Queued                 ││
│  │   → launching email│  └─────────────────────────────────────┘│
│  │                    │                                         │
│  ○ Aggregate          │                                         │
└───────────────────────┴──────────────────────────────────────────┘
```

## Global Pipeline (Left Sidebar)

Vertical timeline in a sticky card. 6 stages connected by vertical lines.

### Stages and their detail data

| Stage | Detail (2 lines max) | Duration | Data source |
|-------|---------------------|----------|-------------|
| **Start** | "SDK session launched" + session ID | `8s` | orchestrator |
| **Discover** | "D365 query → **18** active cases" | `12s` | patrol skill (new: write to patrol-progress.json) |
| **Filter** | "**12** changed · 6 skipped" | `3s` | patrol skill (new: write to patrol-progress.json) |
| **Warmup** | "Token daemon **running**" | `5s` | patrol skill warmup check |
| **Process** | "**5** / 12 cases" + progress bar + live decision text | `4m04s` | StateManager + patrol skill |
| **Aggregate** | "Todos merged. **3** new actions" | `2s` | patrol skill (new: write to patrol-progress.json) |

### Per-stage timing requirements

Each completed stage shows its duration right-aligned (e.g. `12s`, `4m 3s`). The active stage shows a live counter. All durations should approximately sum to the total patrol time shown in the header.

**Timing accuracy**: Patrol skill writes explicit `phaseTiming` in patrol-progress.json (bash `date +%s%N` at each phase boundary). StateManager prefers these over its own phase-change detection (which can miss fast phases due to chokidar's 300ms stabilization delay).

### Process stage live text

Shows patrol session's **serial decisions** (not per-case parallel work):
- `0748 assess done → launching troubleshooter`
- `0748 troubleshooter done → launching reassess`
- `0748 reassess: found-cause → launching email(result-confirm)`
- `0748 reassess: exhausted → no email, recommend ICM → summarizing`
- `0748 email done → skipping challenge → summarizing`
- `1034 assess done → no action, self-summarizing`
- `2048 assess done → launching email(follow-up)` (no troubleshooter, no reassess)

## Case Pipeline (Right Content)

### 5-step pipeline per case

Each case has a horizontal pipeline: **Start → Refresh → Assess → Act → Summary**

| Step | Content when active | Content when completed |
|------|--------------------|-----------------------|
| **Start** | "Launching SDK session…" | "SDK session ready" + duration |
| **Refresh** | 5 subtasks with status dots | Each subtask: name + delta data + duration |
| **Assess** | Spinner | Result pill (`needs-action` / `no-change`) + reasoning text |
| **Act** | Agent cards (dynamic) | Agent cards with results |
| **Summary** | Spinner | "Todo updated · status" |

### Refresh subtask delta data

Each subtask shows what was fetched, not just "completed":
- D365: `+3 emails · +1 note`
- Teams: `2 chats · 14 msgs`
- ICM: `+5 discussions`
- OneNote: `2 pages updated`
- Attachments: `+1 file (234 KB)`

Requires: casework data-refresh scripts to write delta counts to state.json subtask data.

### Act agent cards — dynamic, not preset

Agent cards appear **only when patrol session decides to trigger them**:
1. Patrol session returns from assess → decides to spawn troubleshooter → card appears
2. Troubleshooter returns → patrol spawns **reassess** → reassess card appears
3. Reassess returns → patrol decides to spawn email drafter (type decided by reassess) → email-drafter card appears
4. If reassess says exhausted/out-of-scope → no email card, proceed to summary
5. Email drafter returns → patrol decides challenge needed → challenger card appears
6. If no challenge needed → no challenger card, proceed to summary

**No-troubleshooter path** (follow-up / closure): assess directly decides email type, no reassess card appears.

Each agent card has 3 visual states:
- **Launching**: purple bg + spinner + "Launching SDK session…"
- **Running**: purple bg + pulse dot + live description ("Querying NSG rules…")
- **Completed**: green border + result summary ("Found: NSG rule blocking RDP")

Reassess card completed state shows conclusion type: `"reassess: found-cause → result-confirm"`

### Case row states

| State | Display |
|-------|---------|
| **Active** | Expanded, purple border glow, full pipeline with subtask details |
| **Starting** | Expanded, Start step active ("Launching SDK session…"), rest pending |
| **Done** | Collapsed to header: chevron + case ID + done pill + assess result tag + act summary + duration. Click chevron to expand full pipeline |
| **Queued** | Single header line, 30% opacity |

### Collapsed done row format
```
› 2602130040001034  ✓ DONE  [no-change] · act skipped  5/5  1m 59s
```

## Design System Alignment

All components use the dashboard's existing design system:
- Colors: `--purple (#6a5fc1)`, `--green (#16a34a)`, `--amber (#d97706)`
- Fonts: Rubik (UI) + JetBrains Mono (data)
- Cards: `border-radius: 12px`, `border: 1px solid var(--border-subtle)`, hover shadow
- Active elements: purple glow animation (`stage-glow`)
- Status dots: pulse animation for active
- Pills: 18px radius, uppercase, 600 weight
- Buttons: inset shadow, 13px radius, uppercase

## Data Requirements (Backend/Skill Changes)

### New fields in patrol-progress.json (written by patrol skill)
```json
{
  "phase": "processing",
  "totalCases": 12,
  "changedCases": 12,
  "processedCases": 5,
  "totalFound": 18,
  "skippedCount": 6,
  "warmupStatus": "daemon running",
  "currentAction": "0748 troubleshooter done → launching reassess",
  "caseList": ["2601290030000748", ...]
}
```

### New fields in per-case state.json
```json
{
  "steps": {
    "start": {
      "status": "completed",
      "durationMs": 3000
    },
    "data-refresh": {
      "subtasks": {
        "d365": { "status": "completed", "durationMs": 12009, "delta": { "emails": 3, "notes": 1 } },
        "teams": { "status": "completed", "durationMs": 22466, "delta": { "chats": 2, "messages": 14 } },
        "icm": { "status": "completed", "durationMs": 11401, "delta": { "discussions": 5 } },
        "onenote": { "status": "completed", "durationMs": 12527, "delta": { "pagesUpdated": 2 } },
        "attachments": { "status": "completed", "durationMs": 5536, "delta": { "files": 1, "sizeKB": 234 } }
      }
    },
    "assess": {
      "status": "completed",
      "result": "needs-action",
      "reasoning": "Customer replied with new error logs. RDP 0x204."
    },
    "act": {
      "actions": [
        { "type": "troubleshooter", "status": "completed", "durationMs": 105000, "result": "Found NSG rule blocking RDP" },
        { "type": "reassess", "status": "completed", "durationMs": 8000, "result": "found-cause → result-confirm" },
        { "type": "email-drafter", "subtype": "result-confirm", "status": "active", "detail": "Launching SDK session…" }
      ]
    }
  }
}
```

### PatrolStateManager additions
- `currentAction` field: updated by patrol skill via patrol-progress.json
- Broadcast includes `currentAction` for left sidebar Process live text

## Implementation Phases

### Phase 1: Frontend components (no backend changes)
- Rewrite PatrolPage layout: sidebar + content
- New PatrolSidebar component (vertical pipeline)
- Rewrite PatrolCaseRow with 5-step pipeline + collapsible
- Wire up existing store data to new components

### Phase 2: Backend data enrichment
- Update patrol skill to write enriched patrol-progress.json
- Update casework to write `start` step + `delta` data + `reasoning`
- Update StateManager to pass through `currentAction`

### Phase 3: Polish
- Animations, transitions
- Dark mode verification
- Responsive behavior

## Mockup Reference

Interactive mockup: `.superpowers/brainstorm/543180-1776581717/content/patrol-v7-sidebar.html`

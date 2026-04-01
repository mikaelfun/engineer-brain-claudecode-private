# Email Fetching Architecture Analysis

**Date:** 2026-04-01  
**Project:** EngineerBrain  

## Summary

Hybrid email fetching using:
1. **D365 OData API** (primary)
2. **Mail MCP Graph API** (complementary)  
3. **Teams Search** (separate)

NO Outlook COM/MAPI components found.

---

## 1. D365 OData Method

**Files:**
- `skills/d365-case-ops/scripts/fetch-emails.ps1` (main)
- `skills/d365-case-ops/scripts/fetch-all-data.ps1` (orchestrator)

**How it works:**

Query via FetchXML to `/api/data/v9.0/emails`:
- Max 200 emails per fetch
- Attributes: activityid, subject, to, from, statuscode, directioncode, createdon, senton, description
- Filter: regardingobjectid = incidentId
- Supports incremental mode (createdon >= lastFetchTime)

Deduplication:
- Extracts existing email IDs from `<!-- id: xxx -->` comments in emails.md
- Parses lastFetchTime from file header
- API applies: createdon >= lastFetchTime
- Skips IDs already in local cache

System emails filtered:
- [Automated Notification], File Uploaded, Ownership accepted, etc.

Output: `cases/active/{caseNumber}/emails.md`

**Parallel execution:** (fetch-all-data.ps1)
- Pre-warms incident ID and browser before launching jobs
- Spawns 3 concurrent jobs: snapshot, emails, notes (120s timeout)
- Monitors last 5 lines for errors

---

## 2. Mail MCP Method

**File:** `.claude/skills/email-search/SKILL.md`

**Tools:**
- `mcp__mail__SearchMessagesQueryParameters` 
- `mcp__mail__GetMessage`

**Why:** D365 content often truncates; MCP provides complete HTML

**How it works:**

Step 1: Search
- Query: `?$search="{caseNumber}"&$top=50&$select=id,subject,from,toRecipients,ccRecipients,receivedDateTime,bodyPreview,isRead`
- Max 50 emails

Step 2: Fetch full content
- Tool: GetMessage(id, bodyPreviewOnly=false, preferHtml=true)
- Gets full HTML body (100KB+ possible)
- Individual email failures don't block others

Step 3: HTML cleanup (Python)
- Remove style/script blocks
- Replace block-level tags with newlines
- Remove remaining HTML tags
- Decode entities
- Compress blank lines

Step 4: Output `cases/active/{caseNumber}/emails-office.md`

Format:
```
### 📤 Sent | 2026-03-26 10:00
**Subject:** {subject}
**From:** {name} <{email}>
**To:** {recipients}

{cleaned body}
```

Direction: @microsoft.com = Sent, else = Received

Step 5: Error handling (graceful degradation)
1. Search fails = report error
2. Single email fails = log, continue
3. Cleanup fails = use bodyPreview
4. Python unavailable = use sed

---

## 3. Key Technical Details

### Incremental Caching (D365 only)

Extract IDs:
```powershell
$idMatches = [regex]::Matches($content, '<!-- id: ([a-f0-9\-]+) -->')
```

Extract timestamp:
```powershell
if ($content -match 'Generated:\s+(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})') {
    $lastFetchTime = $Matches[1]
}
```

API applies: `createdon >= $lastFetchTime`

Mail MCP: No caching (stateless)

### Parallel Execution

Pre-warm (critical):
```powershell
$incidentId = Get-IncidentId -TicketNumber $TicketNumber
Ensure-D365Tab  # Browser ready
```

Reason: Prevents simultaneous Restart-D365Browser calls corrupting state

Launch 3 jobs:
- fetch-case-snapshot.ps1
- fetch-emails.ps1
- fetch-notes.ps1

Wait: 120 second timeout

---

## 4. Configuration

**File:** `config.json`

```json
{
  "casesRoot": "./cases",
  "dataRoot": "C:\Users\fangkun\Documents\EngineerBrain-Data",
  "teamsSearchCacheHours": 4,
  "podAlias": "mcpodvm@microsoft.com"
}
```

No email-specific config (hardcoded):
- D365: count="200"
- Mail MCP: $top=50

---

## 5. No Outlook COM/MAPI

Confirmed NOT FOUND:
- `New-Object -ComObject Outlook.Application`
- `win32com`
- `MAPI`
- `Redemption`

Uses only Graph API via MCP tools.

---

## 6. Performance Benchmarking

**Latest result:** `tests/results/42-perf-casework-timing.json`
```json
{
  "duration_ms": 46118,
  "status": "pass"
}
```

Complete casework: ~46 seconds

**Infrastructure available:**
- `tests/baselines.yaml` (baselines)
- `tests/registry/workflow-e2e/` (test configs)
- `tests/executors/performance-scanner.sh` (gap detector)
- `tests/results/` (result storage)

---

## 7. Comparison Table

| Aspect | D365 OData | Mail MCP |
|--------|-----------|----------|
| Protocol | FetchXML/REST | Graph API |
| Source | CRM DB | Outlook |
| Speed | 5-10s | 10-20s (50 emails) |
| Content | Structured, truncated | Complete HTML |
| Caching | Incremental | None |
| Max Results | 200 | 50 |
| Output | emails.md | emails-office.md |
| Error Recovery | Retry, browser | Graceful degrade |
| Use | Quick data | Complete analysis |

---

## 8. Orchestration Flow

```
casework
  -> data-refresh skill
    -> fetch-all-data.ps1
      -> Pre-warm (incident ID + browser)
      -> 3 Parallel jobs:
         - fetch-case-snapshot.ps1 -> case-info.md
         - fetch-emails.ps1 -> emails.md
         - fetch-notes.ps1 -> notes.md
      -> download-attachments.ps1 -> attachments/
      -> ICM fetch -> icm/
```

Estimated times:
- Sequential: 30-35s
- Parallel: 15-18s
- With attachments: 20-40s

---

## 9. File Structure

```
.claude/skills/email-search/SKILL.md (Mail MCP entry)
.claude/skills/data-refresh/SKILL.md (orchestration entry)
.claude/skills/draft-email/SKILL.md (draft generation)
skills/d365-case-ops/scripts/fetch-emails.ps1 (D365 main)
skills/d365-case-ops/scripts/fetch-all-data.ps1 (orchestrator)
skills/d365-case-ops/scripts/_init.ps1 (shared functions)
tests/results/42-perf-casework-timing.json (timing baseline)
```

---

## 10. Ready for Comparison Testing

Infrastructure available:
✅ Performance framework
✅ Test registry
✅ Results storage
✅ Logging system
✅ Test data

Recommended metrics:
- Speed (by email count)
- Content completeness
- Reliability/error rates
- Resource usage
- API call overhead

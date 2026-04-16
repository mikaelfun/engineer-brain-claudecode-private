# OWA Email Search — Quick Reference Card

## What Is It?

A **PowerShell CLI-based email extraction toolkit** for the EngineerBrain project:
- Extracts emails from Outlook Web Access (OWA) via browser automation (Playwright + Edge)
- OR extracts via Microsoft Graph API + Mail MCP server
- Returns formatted Markdown (with optional JSON + inline images)
- Automatically deduplicates, filters auto-replies, and cleans HTML
- Case-aware (stores results in case directories)

## Files

| File | Role |
|------|------|
| owa-email-fetch.ps1 | **PRIMARY** - Browser automation, OWA email extraction |
| owa-extract-conversation.js | DOM parsing, image extraction, dedup logic (called by owa-email-fetch) |
| email-search-mcp.ps1 | **ALTERNATIVE** - Graph API + MCP server workflow (3-phase) |
| mcp-response-handler.ps1 | MCP response parsing utility |

## Quick Invocation

### Method 1: OWA (Recommended for Interactive Use)

`powershell
pwsh -File owa-email-fetch.ps1 
  -CaseNumber "2603060030001353" 
  -OutputPath "./emails-owa.md"
`

Options:
- -NoImages — text-only (faster)
- -JsonOutput — also save JSON
- -Headed — show browser window (debugging)
- -PreviewOnly — quick preview mode

### Method 2: Graph API (Recommended for Automation)

`powershell
# Phase 1: Dedup search results
pwsh -File email-search-mcp.ps1 
  -CaseNumber "2603060030001353" 
  -CaseDir "./case" 
  -SearchResultJson "./search.json"

# Phase 3: Generate final MD
pwsh -File email-search-mcp.ps1 
  -CaseNumber "2603060030001353" 
  -CaseDir "./case" 
  -Generate
`

## Parameters (All Invocations)

| Parameter | Type | Required | Example |
|-----------|------|----------|---------|
| -CaseNumber | string | YES | "2603060030001353" |
| -CaseDir (graph) or -OutputPath (owa) | string | YES | "./case" or "./emails-owa.md" |
| -NoImages | switch | NO | — |
| -JsonOutput | switch | NO | — |
| -Headed | switch | NO | — |
| -PreviewOnly | switch | NO | — |
| -SearchResultJson (phase 1) | string | NO | "./search.json" |
| -MessageId, -BodyFile (phase 2) | strings | NO | — |
| -Generate (phase 3) | switch | NO | — |

## Output Formats

### Markdown (emails-owa.md or emails-office.md)

`markdown
# Emails (OWA) — Case 2603060030001353

> Generated: 2026-04-16 | Conversations: 3 | Emails: 8 | Bodies: 7 | Images: 2

---

### 📥 Received | 2026-04-15 14:30
**From:** john@example.com

Email body text here...

![image](images/owa-img-001.png)

---

### 📤 Sent | 2026-04-15 15:15
**From:** support@microsoft.com

Response text here...
`

### JSON (emails-owa.json, optional)

`json
{
  "caseNumber": "2603060030001353",
  "emails": [
    {
      "index": 0,
      "direction": "Incoming",
      "from": "john@example.com",
      "date": "Mon 4/15/2026 2:30 PM",
      "body": "Email body...",
      "imageCount": 1
    }
  ]
}
`

## Authentication & Prerequisites

✅ Required:
- Agency CLI at %APPDATA%\agency\CurrentVersion\agency.exe
- Microsoft Edge browser
- OWA access (via O365 account)
- Playwright CLI (auto-installed via npx)

✅ Optional:
- MCP server running (for Graph API method)
- Custom temp directory

✅ Automatic:
- OAuth token caching (Agency handles)
- Browser profile persistence

## Output Locations

| Method | Output File | Additional |
|--------|-------------|-----------|
| OWA | {OutputPath}.md | {OutputPath}.json (if -JsonOutput), images/ folder |
| Graph | {CaseDir}/emails-office.md | logs/email-search.log, .tmp-email-search/ (temp) |

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Browser won't start | Kill stale msedge; rm \C:\Users\fangkun\AppData\Local\Temp\playwright-owa-profile; retry |
| Search no results | Verify case ID; try -Headed to see browser; check OWA access |
| Images fail | Use -NoImages (text-only mode) |
| MCP error | Verify Agency CLI installed; check .mcp.json syntax |
| Timeout | Increase -SearchTimeout (default 15s) |

## Integration Points

### Claude Code Agents
`python
subprocess.run([
    "pwsh", "-File", "skills/email-search/owa-email-fetch.ps1",
    "-CaseNumber", case_id,
    "-OutputPath", output_path
])
`

### Manual Invocation
`powershell
pwsh -File owa-email-fetch.ps1 -CaseNumber "2603..." -OutputPath "./emails.md"
`

### As MCP Tool
Integrated with Claude via Mail MCP (SearchMessages, GetMessage)

## Performance Notes

- **OWA method**: ~30-60s per case (browser initialization + extraction)
- **Graph API method**: ~2-5s search + variable body fetching
- **Dedup**: ~1-2s for 100+ emails
- **Image extraction**: +10-20s if inline images present

Optimizations:
- Use -PreviewOnly for quick check
- Use -NoImages for text-only (faster)
- Use Graph API method for automation (lighter weight)

## Related Documentation

- Full analysis: skills/email-search/ANALYSIS.md
- Project overview: CLAUDE.md
- Setup: SETUP.md
- MCP config: .mcp.json
- Case schema: playbooks/schemas/case-directory.md

---

Generated: 2026-04-16
EngineerBrain Project
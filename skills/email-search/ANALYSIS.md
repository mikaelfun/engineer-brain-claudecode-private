# EngineerBrain OWA Email Search Module — Comprehensive Analysis

**Generated:** 2026-04-16  
**Project:** EngineerBrain (D365 Case Automation)  
**Location:** C:\Users\fangkun\Documents\Projects\EngineerBrain\src\skills\email-search

---

## EXECUTIVE SUMMARY

The **owa-email-search module** is a **PowerShell-based email extraction system** consisting of:
1. **Browser automation** (OWA web scraping via Playwright + Edge)
2. **Graph API search** (Microsoft Mail MCP for search + fetch)
3. **HTML/MD conversion** (JavaScript + PowerShell text cleaning)
4. **Case integration** (saves email data to case directories)

**It is NOT:**
- A Python module
- A CLI tool with a single entry point
- A function library you import

**It IS:**
- A multi-step workflow orchestrated by PowerShell scripts
- Callable via pwsh -File CLI commands
- Integrated with Claude Code skills system and MCP servers

---

## 1. MODULE ARCHITECTURE & INVOCATION

### Core Components

| File | Purpose | Language | Invocation |
|------|---------|----------|-----------|
| owa-email-fetch.ps1 | Main OWA browser automation + extraction | PowerShell | pwsh -File owa-email-fetch.ps1 -CaseNumber "..." -OutputPath "..." |
| owa-extract-conversation.js | DOM parsing, dedup, image extraction, MD generation | JavaScript | Called internally via playwright-cli eval |
| email-search-mcp.ps1 | Graph API search result dedup + body fetching | PowerShell | 3-phase: -SearchResultJson, -MessageId/-BodyFile, -Generate |
| mcp-response-handler.ps1 | JSON parsing & error handling for MCP responses | PowerShell | Processes stdin from MCP tool outputs |

### How to Invoke - OPTION A: OWA Browser Extraction (Full Body + Images)

Simple invocation:
`powershell
pwsh -File owa-email-fetch.ps1 
  -CaseNumber "2603060030001353" 
  -OutputPath "C:\cases\2603060030001353\emails-owa.md"
`

Advanced options:
`powershell
pwsh -File owa-email-fetch.ps1 
  -CaseNumber "2603060030001353" 
  -OutputPath "./emails-owa.md" 
  -NoImages                          # Skip image extraction (text-only)
  -JsonOutput                        # Also save JSON format
  -Headed                            # Run browser in headed mode (debugging)
  -PreviewOnly                       # Only extract previews (fast)
  -ScrollDelay 150                   # Custom scroll delay (ms)
  -SearchTimeout 15                  # Search wait timeout (s)

# Ensure browser ready BEFORE extraction
pwsh -File owa-email-fetch.ps1 -EnsureBrowser
`

Output:
- emails-owa.md — Markdown with all emails
- emails-owa.json — JSON structure (if -JsonOutput)
- images/ — Inline PNG images (unless -NoImages)

### How to Invoke - OPTION B: Graph API Search + Dedup + MD Generation (3-phase workflow)

Phase 1: Dedup search results from MCP
`powershell
pwsh -File email-search-mcp.ps1 
  -CaseNumber "2603060030001353" 
  -CaseDir "C:\cases\2603060030001353" 
  -SearchResultJson "C:\temp\search-results.json"
# Outputs: IDS_FILE, META_FILE, DEDUP_COUNT
`

Phase 2: Fetch body for each email (typically in Claude loop)
`powershell
echo \ | pwsh -File email-search-mcp.ps1 
  -CaseNumber "2603060030001353" 
  -CaseDir "C:\cases\2603060030001353" 
  -MessageId "email-graph-id-123" 
  -BodyFile "C:\cases\2603060030001353\.tmp-email-search\body-xyz.html"
# Outputs: OK|{length}
`

Phase 3: Generate final MD from temp files
`powershell
pwsh -File email-search-mcp.ps1 
  -CaseNumber "2603060030001353" 
  -CaseDir "C:\cases\2603060030001353" 
  -Generate
# Outputs: emails-office.md
`

---

## 2. PARAMETERS & CONFIGURATION

### owa-email-fetch.ps1 Parameters

| Parameter | Type | Required | Default | Purpose |
|-----------|------|----------|---------|---------|
| -CaseNumber | string | YES* | — | Case ID for search (e.g., "2603060030001353") |
| -OutputPath | string | YES* | — | File path for output MD (e.g., "./emails-owa.md") |
| -PreviewOnly | switch | NO | — | Extract only aria-label previews (fast) |
| -NoImages | switch | NO | — | Skip image extraction (text-only) |
| -EnsureBrowser | switch | NO | — | Only ensure browser ready, don't extract |
| -JsonOutput | switch | NO | — | Also save JSON output (emails-owa.json) |
| -Headed | switch | NO | — | Run browser in headed mode (visible) |
| -LogFile | string | NO | owa-extract-{date}.log | Custom log path |
| -ScrollDelay | int | NO | 150 | Scroll delay per email (ms) |
| -SearchTimeout | int | NO | 15 | Search result wait timeout (s) |

*At least -CaseNumber and -OutputPath required (OR -EnsureBrowser)

### email-search-mcp.ps1 Parameters

| Parameter | Type | Purpose |
|-----------|------|---------|
| -CaseNumber | string | Case ID (required) |
| -CaseDir | string | Case directory root (required) |
| -SearchResultJson | string | Phase 1: Path to MCP search results JSON |
| -MessageId | string | Phase 2: Graph message ID |
| -BodyFile | string | Phase 2: Target file path for HTML body |
| -Generate | switch | Phase 3: Generate final emails-office.md |

---

## 3. RETURN FORMATS & DATA STRUCTURES

### OWA Extraction Output (emails-owa.md)

Markdown Format:
`markdown
# Emails (OWA) — Case 2603060030001353

> Generated: 2026-04-16T10:30:00Z | Conversations: 3 | Emails: 8 | Bodies: 7 | Images: 2 | Source: OWA Full Body + Images

---

### 📥 Received | 2026-04-15 14:30
**From:** John Smith <john@example.com>

Hello, this is the email body content...

![image](images/owa-img-001.png)

---

### 📤 Sent | 2026-04-15 15:15
**From:** Azure Support <support@microsoft.com>

Thank you for reaching out...
`

### JSON Output Format (emails-owa.json, if -JsonOutput)

`json
{
  "caseNumber": "2603060030001353",
  "generatedAt": "2026-04-16T10:30:00.000Z",
  "source": "OWA Full Body + Images",
  "conversationCount": 3,
  "emailCount": 8,
  "bodyCount": 7,
  "imageCount": 2,
  "emails": [
    {
      "index": 0,
      "direction": "Incoming",
      "from": "john@example.com",
      "date": "Mon 4/15/2026 2:30 PM",
      "subject": "",
      "body": "Email body text...",
      "imageCount": 0
    }
  ]
}
`

### Graph API Dedup Output (Phase 1)

`
IDS_FILE=/cases/2603/.../.tmp-email-search/message-ids.txt
META_FILE=/cases/2603/.../.tmp-email-search/messages-meta.json
DEDUP_COUNT=12
`

message-ids.txt: One email Graph ID per line
messages-meta.json: JSON array with subject, from, to, cc, date, bodyPreview

### Graph API Phase 3 Output (Final)

`
OUTPUT=/cases/2603/...emails-office.md
COUNT=12
SIZE_KB=45.2
`

---

## 4. AUTHENTICATION & CONFIGURATION

### MCP Requirements

The system relies on MCP servers configured in .mcp.json:

`json
{
  "mcpServers": {
    "mail": {
      "command": "cmd",
      "args": ["/c", "%APPDATA%\\agency\\CurrentVersion\\agency.exe", "mcp", "mail"]
    },
    "playwright": {
      "command": "cmd",
      "args": ["/c", "npx", "@playwright/mcp@latest", "--browser", "msedge"]
    }
  }
}
`

What you need:
1. Agency CLI at %APPDATA%\agency\CurrentVersion\agency.exe
2. Microsoft Graph OAuth token (cached automatically via Agency)
3. Mail MCP server (SearchMessages, GetMessage tools)
4. Playwright CLI (npx @playwright/mcp@latest)
5. Microsoft Edge browser
6. Persistent profile at \C:\Users\fangkun\AppData\Local\Temp\playwright-owa-profile

---

## 5. PROJECT STRUCTURE CONTEXT

### EngineerBrain is Node/PowerShell Hybrid

Location:
C:\Users\fangkun\Documents\Projects\EngineerBrain\src\

Structure:
├── .claude/ — Claude Code skills & agent registry
├── skills/ — Reusable skill modules (email-search, kusto, d365-case-ops, etc.)
├── playbooks/ — Domain knowledge & schemas
├── cases/ — Live case data
├── dashboard/ — React + Hono web UI (npm)
├── scripts/ — Utility scripts
├── .mcp.json — MCP servers config
├── CLAUDE.md — Main architecture
└── SETUP.md — Environment setup

Language Stack:
- PowerShell: Email extraction, D365 ops, case management
- JavaScript: DOM parsing, web automation
- Python: Data processing
- TypeScript: Dashboard backend/frontend
- Markdown: Guides, knowledge bases

### Skills Convention

Each skill is a capability module with:
- SKILL.md (mandatory) — metadata, usage, examples
- scripts/ — PowerShell/Python executable files
- references/ — data files, lookup tables
- Invoked via slash commands or direct Bash/PowerShell calls

---

## 6. EXAMPLE USAGE WORKFLOWS

### Workflow 1: Extract OWA Emails (Simple)

`powershell
# Step 1: Ensure browser ready
pwsh -File C:\path\to\owa-email-fetch.ps1 -EnsureBrowser

# Step 2: Extract emails
pwsh -File C:\path\to\owa-email-fetch.ps1 
  -CaseNumber "2603060030001353" 
  -OutputPath "C:\cases\2603060030001353\emails-owa.md"
`

### Workflow 2: Extract via Graph API + Dedup

Typically orchestrated by Claude in 3 phases (see Section 1)

### Workflow 3: Extract + Analyze + Store in Case

`powershell
\ = "2603060030001353"
\ = "C:\cases\2603060030001353"

# Extract
\ = pwsh -File owa-email-fetch.ps1 
  -CaseNumber \ 
  -OutputPath "\\emails-owa.md" 
  -JsonOutput

# Check status
if (\ -match "STATUS=OK") {
    Write-Host "✅ Extracted"
    # emails-owa.md ready for analysis
}
`

---

## 7. KEY FUNCTION SIGNATURES

### PowerShell: Ensure-OwaBrowser()

Purpose: Ensure persistent Edge session running and OWA ready

Logic:
1. Test browser alive (playwright-cli eval '1+1')
2. If dead → kill processes → start new session
3. Navigate to https://outlook.cloud.microsoft/mail/0/
4. Wait for search box (polling max 24s)

Returns: \True if ready, \False if failed

### JavaScript: extractBodyWithImages(bodyEl)

Purpose: DOM walk of email body, extract text + images

Parameters:
- bodyEl: DOM element to walk
- window.__OWA_WITH_IMAGES: true/false
- window.__OWA_SCROLL_DELAY: milliseconds

Returns: Cleaned markdown with image placeholders

### JavaScript: cleanBody(text)

Purpose: Remove footers, disclaimers, quoted chains

Removes:
- Email disclaimers
- Legal notices
- "Sent from" signatures
- Quoted reply chains (>60% of message)

Returns: Cleaned text

### PowerShell: Dedup-SearchResults()

Purpose: Remove duplicates by (subject + sentDateTime) tuple

Removes:
- Exact duplicates
- Auto-reply emails (pattern matching)
- Emails with bodyPreview < 200 chars

Returns: Unique email array

---

## 8. COMMON ISSUES & DEBUGGING

### Browser Won't Start

`powershell
# Kill stale processes
Get-Process msedge -ErrorAction SilentlyContinue | 
  Where-Object { \.CommandLine -match "playwright-owa-profile" } |
  ForEach-Object { Stop-Process -Id \.Id -Force }

# Clear profile
Remove-Item "\C:\Users\fangkun\AppData\Local\Temp\playwright-owa-profile" -Recurse -Force

# Retry
pwsh -File owa-email-fetch.ps1 -EnsureBrowser
`

### Search Not Finding Results

`powershell
# Verify OWA loaded
pwsh -File owa-email-fetch.ps1 -EnsureBrowser

# Use headed mode
pwsh -File owa-email-fetch.ps1 -CaseNumber "2603..." -OutputPath "./emails.md" -Headed
`

### Image Extraction Failed

`powershell
# Disable image extraction
pwsh -File owa-email-fetch.ps1 
  -CaseNumber "2603..." 
  -OutputPath "./emails.md" 
  -NoImages
`

### MCP Connection Error

`powershell
# Verify Agency CLI installed
Test-Path "\C:\Users\fangkun\AppData\Roaming\agency\CurrentVersion\agency.exe"

# Check .mcp.json syntax
\ = Get-Content .mcp.json | ConvertFrom-Json
\.mcpServers.mail
`

---

## 9. QUICK REFERENCE

### Invoke OWA Extraction
pwsh -File owa-email-fetch.ps1 -CaseNumber "2603060030001353" -OutputPath "./emails-owa.md"

### Invoke Graph API + Dedup

Phase 1:
pwsh -File email-search-mcp.ps1 -CaseNumber "2603..." -CaseDir "./case" -SearchResultJson "./search.json"

Phase 3:
pwsh -File email-search-mcp.ps1 -CaseNumber "2603..." -CaseDir "./case" -Generate

### Key Parameters
- Case ID: Required (e.g., "2603060030001353")
- Output: MD by default, JSON if -JsonOutput
- Images: Extracted unless -NoImages
- Dedup: On (subject + sentDateTime)
- Filter: Auto-replies removed automatically

### Return Format
- emails-owa.md — Formatted email thread
- emails-office.md — Graph API variant (deduped)
- Exit code 0 = success, non-zero = error
- Logs in .log files

### Authentication
- Automatic via Agency CLI (OAuth cached)
- Requires Edge browser + OWA access
- No explicit API keys needed (MCP handles)

---

## 10. RELATED RESOURCES

- Main docs: CLAUDE.md (project architecture)
- Setup: SETUP.md (environment, dependencies)
- Skill definition example: skills/kusto/SKILL.md
- Product guides: skills/products/intune/guides/_index.md
- MCP config: .mcp.json (servers: mail, playwright, kusto)
- Case schema: playbooks/schemas/case-directory.md
- Platform gotchas: playbooks/guides/platform-gotchas.md

---

## 11. FILE ORGANIZATION SUMMARY

| File Path | Type | Purpose |
|-----------|------|---------|
| owa-email-fetch.ps1 | PowerShell | Main CLI entry point, browser control |
| owa-extract-conversation.js | JavaScript | Core DOM parsing + dedup logic |
| email-search-mcp.ps1 | PowerShell | Graph API orchestration (3-phase) |
| mcp-response-handler.ps1 | PowerShell | MCP JSON parsing utility |
| .mcp.json | Config | MCP servers definition |
| ../../CLAUDE.md | Docs | Overall project architecture |
| ../../skills-lock.json | Config | Skills lock file |

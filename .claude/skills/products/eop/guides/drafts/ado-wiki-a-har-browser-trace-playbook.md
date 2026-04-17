---
source: ado-wiki
sourceRef: "ASIM-Security/Messaging Protection/Messaging Protection Wiki:/Troubleshooting Guides/HAR & Browser Trace Playbook"
sourceUrl: "https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?pagePath=%2FTroubleshooting%20Guides%2FHAR%20%26%20Browser%20Trace%20Playbook"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# HAR / Browser Trace Playbook

Consolidated guidance for collecting and troubleshooting HAR/browser traces.

## What is a HAR file?

JSON-formatted log of browser interaction with a website, capturing HTTP/HTTPS traffic. Contains:
- **Pages**: Page load events and timing data
- **Entries**: One entry per HTTP request/response with URL, method, headers, status code, body

### When to request a HAR file
- Portal fails to load or hangs
- HTTP 403/401 errors in web interface
- Pages load slowly
- Feature doesn't behave as expected
- JavaScript or XHR calls fail

### Security
- HAR files may contain cookies, auth headers, tokens
- Always use sanitized HAR export (default in modern browsers)
- Never provide unsanitized HAR unless explicitly asked by Engineering

## How to Collect Browser Trace

### Quick Steps
1. Press F12 or Ctrl+Shift+I to open Dev Tools
2. Reload page with Shift+F5
3. Reproduce the issue
4. In Network tab, stop trace (Ctrl+E) and export sanitized HAR

### Detailed Steps
1. Authenticate in private window
2. Navigate to issue page
3. Open Dev Tools (F12)
4. Network tab: check "Preserve logs", clear log (Ctrl+L)
5. Start recording (Ctrl+E)
6. **IMPORTANT**: Refresh page (F5) to capture TenantContext and RBAC
7. Reproduce issue
8. Stop recording (Ctrl+E)
9. Export sanitized HAR (down arrow button)

## How to Analyze with Fiddler

1. Open Fiddler Classic > Import Sessions > HTTPArchive
2. Filter: HOST = security.microsoft.com, URL starts with /api/*
3. Check Inspectors tab: Request Headers (top) + Response Header (bottom)
4. JSON tab is most informative
5. Key IDs: SID (Session ID), CID (Correlation ID) -- found in X- headers

## How to Analyze with MS HAR Analyzer

1. Navigate to https://hartool.azurewebsites.net/ (corp account)
2. Select "Security and Compliance", insert file(s)
3. Filter by status code, URL, request type
4. Look for x-diagnosticcontext header for internal IDs

## Split Large HAR Files for IcM Upload

IcM has 15MB attachment limit. Use PowerShell function:

```powershell
# Load the function, then:
Split-MDOHAR -FilePath "C:\path\to\file.har"
# Creates .mdohar.zip chunks under 15MB each
```

Engineering can rejoin with: `Rejoin-MDOHAR -FilePath "C:\path\to\rejoined.har"`

## Common HTTP Status Codes

| Code | Meaning | Investigation Focus |
|------|---------|-------------------|
| 200 | OK | Check payload correctness |
| 302/307 | Redirect | Auth loops, conditional access |
| 400 | Bad Request | Malformed payload, invalid params |
| 401 | Unauthorized | Missing/expired token |
| 403 | Forbidden | RBAC permissions, licensing |
| 404 | Not Found | Wrong URL, deprecated API |
| 429 | Too Many Requests | Throttling, check Retry-After |
| 500 | Server Error | Service bug, backend dependency |
| 503 | Unavailable | Outage, maintenance |

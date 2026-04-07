---
source: ado-wiki
sourceRef: "Supportability/WindowsVirtualDesktop/WindowsVirtualDesktop:/Sandbox/In-Development Content/Outdated? - Needs review if still useful/Issues"
sourceUrl: "https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop?pagePath=%2FSandbox%2FIn-Development%20Content%2FOutdated%3F%20-%20Needs%20review%20if%20still%20useful%2FIssues"
importDate: "2026-04-06"
type: troubleshooting-guide
note: "Sandbox/In-Development content — may be outdated. Review before using."
---

# AVD Sub-Issue Routing and Escalation Guide

> ⚠️ This page is marked as in-development / possibly outdated. Review before using in production support.

## Issue Routing Matrix

| Scenario | Supported By |
|--|--|
| ARM Template issues | We use the same ARM template as AIB. AVD engineer will investigate first and if hits roadblock can send collab to AIB. SAP: `Azure\Azure VM Image Builder\Image Template Submission failure` |
| Managed Identity issues | AVD engineer will investigate first to confirm customer is following our doc correctly to create managed identity. If hits roadblock can send collab to AAD. SAP: `Azure\Managed Identities for Azure Resources\User Assigned Managed Identity\Problem with user-assigned managed identity` |
| AIB (Azure Image Builder) platform and service issues | AIB team. SAP: `Azure\Azure VM Image Builder\Image Builder failure` |
| AVD Built-in script issues | AVD engineer will review packer logs. If hits roadblock will create ICM. |
| Custom script issues | AVD cannot support scripts created or modified by customers. Support is best effort for any/all custom scripts. If the customer asks for help with custom script refer them to [Help! My Powershell script isn't working!](https://techcommunity.microsoft.com/t5/ask-the-performance-team/help-my-powershell-script-isn-t-working-can-you-fix-it/ba-p/755797). Also see internal article: Policy: Custom Code and Scripts. |

## MsrdcwForwarder Error Notes (In-Development)

Error observed: MsrdcwForwarder fails with `0x80190194` (HTTP 404 / Not Found)

```
[1]1B2C.0450::08/19/22-12:27:31 [MSRDCForwarder_WILFailure] ErrorCode=0x80190194
BG_E_HTTP_ERROR_404 / HTTP_E_STATUS_NOT_FOUND — Not found (404).
```

> Note: Investigation pending — "need to understand what possible errors may see and solutions"

## AVD Client Trace Notes (In-Development)

- MSI client and Store client both write traces to the same location with the same naming scheme — cannot distinguish between them
- `msrdcforwarder` may not log events on every client launch (new trace file created each time but may be empty)

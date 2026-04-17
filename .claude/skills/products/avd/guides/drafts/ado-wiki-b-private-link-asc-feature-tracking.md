---
source: ado-wiki
sourceRef: "Supportability/WindowsVirtualDesktop/WindowsVirtualDesktop:/Sandbox/In-Development Content/Outdated? - Needs review if still useful/PL/ASC"
sourceUrl: "https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop?pagePath=%2FSandbox%2FIn-Development%20Content%2FOutdated%3F%20-%20Needs%20review%20if%20still%20useful%2FPL%2FASC"
importDate: "2026-04-06"
type: troubleshooting-guide
note: "Sandbox/In-Development content — may be outdated. Review before using."
---

# Private Link ASC Feature Tracking

> ⚠️ This page is marked as in-development / possibly outdated. Review before using in production support.

## Part 1 [Completed]

### Feed
- Column `IsClientPrivateLink` added to **Workspace Feed** tab in ASC

### Connection
- Columns `IsClientPrivateLink` and `IsSessionHostPrivateLink` added to **Connection Errors** tab in ASC

## Part 2 [In Progress — at time of writing]

### Feed
- Add new section called `Microsoft.DesktopVirtualization/workspaces` Properties Tab called **Private Link**
  - Located under workspace properties
  - Will show settings under Firewall and virtual networks from Workspace > Networking blade in portal
  - Will show private endpoint(s) linked to workspace under Private endpoint connections
  - Private endpoint will be hyperlink to its object under `Microsoft.Network\privateEndpoints`
  - Will show AVD-specific DNS records from Private Endpoint > DNS Configuration blade
  - Will show resource target type

### Connection
- Add new section to `Microsoft.DesktopVirtualization/hostpools` Properties tab called **Private Link**
  - Similar structure to workspace Private Link section above

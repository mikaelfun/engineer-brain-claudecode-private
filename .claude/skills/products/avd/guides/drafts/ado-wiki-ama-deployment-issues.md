---
source: ado-wiki
sourceRef: "Supportability/WindowsVirtualDesktop/WindowsVirtualDesktop:/Sandbox/In-Development Content/Outdated? - Needs review if still useful/AMA/Deployment Issues"
sourceUrl: "https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop?pagePath=/Sandbox/In-Development%20Content/Outdated%3F%20-%20Needs%20review%20if%20still%20useful/AMA/Deployment%20Issues"
importDate: "2026-04-05"
type: troubleshooting-guide
status: in-development
---

# AMA Deployment Issues (AVD)

> ⚠️ This content was marked as "in development / not yet ready for consumption" in the wiki.

## Known UI/Portal Issues

### Too many `<query failed>` errors in portal during deployment
- First page load shows 1 error
- Clicking refresh increases errors to 8
- Customers may stop deployment and open support cases due to these errors

### Broken link in Workbooks
- Clicking "Workbooks" redirects to host pool overview page instead of expected workbook

### Typo in Resource Group creation
- "Create a resource group" page has a spelling error for "Resource"

### Deploy Resource Group fails every time
- Clicking "Deploy" consistently fails with an error

### Session host data settings tab errors
- First page load shows errors
- Clicking refresh clears errors but shows `<query failed>` errors
- Clicking refresh again completely changes the page layout

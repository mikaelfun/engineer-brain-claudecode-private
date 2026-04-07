---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Sandbox/In-Development Content/Admin Highlights/Setup Guides"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FSandbox%2FIn-Development%20Content%2FAdmin%20Highlights%2FSetup%20Guides"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Admin Highlights / Admin Insights - Setup Guide

## Where to find Admin Insights cards

Admins access the experience from the **Windows 365 overview page** in the Microsoft Intune admin center.

## What users can do in the Insights UI

Admins can:
- View the Admin Insights experience
- Review service-identified items
- Open the underlying report (where applicable) and/or engage Copilot (if available, requires Copilot in Intune to be enabled and the user to have the Security Copilot Contributor role)
- Dismiss an item for a day (24 hours)

## Expected vs unexpected output

### Expected
- Insights container appears on the Windows 365 overview page.
- Items are categorized by severity (Error, Warning, Recommendation) and ranked.
- "View all" (when present) allows access to more than the initially shown cards.

### Unexpected
- Insights fail to load due to service errors (not simply "no relevant cards").
- Mismatch between card counts and report counts (e.g., report missing filters the card applied).
- A topic never appears when conditions should be met.

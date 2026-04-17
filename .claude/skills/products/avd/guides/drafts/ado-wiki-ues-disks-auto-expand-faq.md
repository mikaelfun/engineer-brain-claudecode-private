---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Sandbox/In-Development Content/UES Disks automatically expand/FAQ"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FSandbox%2FIn-Development%20Content%2FUES%20Disks%20automatically%20expand%2FFAQ"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# UES Disks Auto Expand - FAQ

## Q1. When does disk expansion occur?
Real-time during active user sessions, triggered when storage reaches a defined threshold.

## Q2. Is the user impacted during expansion?
No visible interruption. Expansion is intended to be seamless.

## Q3. Can storage run out before expansion completes?
Yes, rare edge cases: large downloads (ISO), fast OneDrive syncs, git clones. More likely at initial 4 GB.

## Q4. Can admins switch between fixed and auto storage?
Yes, at any time. Changes affect all users under the policy.

## Q5. Can storage be reduced after expansion?
No. Disk shrinking is not supported.

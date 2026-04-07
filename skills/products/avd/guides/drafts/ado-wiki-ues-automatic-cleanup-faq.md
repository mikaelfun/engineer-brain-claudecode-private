---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Sandbox/In-Development Content/UES Automatic Cleanup/FAQ"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Sandbox/In-Development%20Content/UES%20Automatic%20Cleanup/FAQ"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# UES Automatic Cleanup - FAQ

## Q1. What happens to the user after cleanup?
- Their profile is deleted.
- User experience resets to a new profile.

## Q2. Can admins see which users were deleted?
- PM indicated future visibility via:
  - Admin reporting
  - Backend telemetry
- CSS may rely on backend queries for investigation.

## Q3. What if cleanup runs but some storage remains?
- If quota is still exceeded:
  - Forced cleanup logic applies after 7 days.
  - Admin intervention may still be required.

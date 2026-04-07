---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Windows 365 Frontline/Frontline Shared/User Experience Sync/FAQ"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Features/Windows%20365%20Frontline/Frontline%20Shared/User%20Experience%20Sync/FAQ"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# User Experience Sync FAQ

| Question | Answer |
|----------|--------|
| 1. What User data is persisted with this feature? | UES redirects the entire user profile including files and folders under C:\Users\%username% which importantly, also includes a user's NTUser.dat file. The solution also applies default exclusions for Microsoft products to improve the user's experience. |
| 2. Is it possible for IT admins to apply custom inclusions or exclusions? | We are evaluating requirements for custom inclusions and exclusions for future releases. |
| 3. What distinguishes UES from FSLogix? | FSLogix requires the customer to set up, manage, and configure storage and other settings that control its operation. It also depends on SMB storage for user profiles, which necessitates legacy NTFS and Kerberos authentication. |

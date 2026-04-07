---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Domain Join/Workflow: Domain Join: Looking for Known Solutions"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FDomain%20Join%2FWorkflow%3A%20Domain%20Join%3A%20Looking%20for%20Known%20Solutions"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Domain Join: Looking for Known Solutions

**Summary**: Guide for searching and finding known domain join issues in DFMK (DFM Knowledge). Includes search tips and a curated list of common domain join failure articles.

## Search Tips

Domain join known issues are documented internally with prefixes: **ADJoin**, **ADDS:ADJoin**, or **ADDS**.

Search DFMK using keyword "**ADJoin**":
- `ADJoin` - finds all known issues related to local domain join
- `ADJoin + <error received>` - finds articles for specific error messages/codes
  - Example: `ADJoin 'Access is denied.'`
  - Example: `domain join ipc$ 53`

> Note: Some articles may NOT be tagged with "ADJoin" but contain keywords like "Join", "Domain Join", etc.

## Key Known Issue Articles

| ID | Title |
|----|-------|
| [4090678](https://internal.evergreen.microsoft.com/topic/4090678) | ADDS: ADJoin: Domain join fails with "access is denied" if insufficient permissions to system32\config |
| [4340648](https://internal.evergreen.microsoft.com/topic/4340648) | ADJoin: Domain join locator fails on 1803 devices with "An AD DC could not be contacted..." using NetBIOS domain name |
| [4486767](https://internal.evergreen.microsoft.com/topic/4486767) | Error: IPC$ is returned with 53. Unable to join server to domain |
| [4482894](https://internal.evergreen.microsoft.com/topic/4482894) | Unable to add client/server to domain: "An attempt to resolve the DNS name of a DC has failed" |
| [2412101](https://internal.evergreen.microsoft.com/topic/2412101) | Domain join error 0x569: Logon failure - user has not been granted the requested logon type |
| [2389148](https://internal.evergreen.microsoft.com/topic/2389148) | Domain join: Error - The service did not respond to start/control request in timely fashion |
| [2412061](https://internal.evergreen.microsoft.com/topic/2412061) | Domain join error 0x534: No mapping between account names and security IDs |
| [2421138](https://internal.evergreen.microsoft.com/topic/2421138) | Domain join error 0xc002001c / 0x6bf: Remote procedure call failed and did not execute |
| [3030327](https://internal.evergreen.microsoft.com/topic/3030327) | Duplicate SPN check on WS12R2 DCs may cause domain join or migration failure |
| [KB5020276](https://support.microsoft.com/en-us/topic/kb5020276-netjoin-domain-join-hardening-changes-2b65a0f3-1f4c-42ef-ac0f-1caaf421baf8) | Netjoin: Domain join hardening changes |
| 5035086 | Domain join fails in DR environment with cloned DC: "Cannot complete the function" |
| 5035037 | DomainJoin: "The requested operation did not satisfy constraints associated with the class" |
| 5022777 | Domain join radio button is grayed out on Windows server |

---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/MPIP Scanner/Required Information: MPIP Scanner"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FMPIP%20Scanner%2FRequired%20Information%3A%20MPIP%20Scanner"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Required Information: MPIP Scanner

Checklist of information to collect before creating a Scanner escalation.

## Before Escalating

**Always check the AIP Tech-Chat first:**
[AIP Tech-Chat (Teams)](https://teams.microsoft.com/l/channel/19%3A849b72f90c0a4fda90faeb21fac6f258%40thread.tacv2/Tech%20Chat%20-%20AIP?groupId=2779d776-13f4-4e4f-a72e-1035aa299932&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47)

## Required Information for Escalation

When creating an escalation, collect:

1. **Full explanation** of the issue the customer is experiencing on the Scanner server
2. **Full MPIP Scanner logs** — collected while the Scanner service account is logged on, using the following command to export zipped logs:
   ```
   Export-DebugLogs
   ```
   Reference: https://learn.microsoft.com/en-us/powershell/module/purviewinformationprotection/export-debuglogs

---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/Sensitivity Labels/Required Information: Sensitivity Labels"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=/Sensitivity%20Labels/Required%20Information:%20Sensitivity%20Labels"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Required Information: Sensitivity Labels

When creating an escalation, collect the following information:

- The affected Label and Policy name and details:
  - `Get-Label | FL`
  - `Get-LabelPolicy | FL`
- The affected user UPN/Email
- A screenshot of the issue
- The list of affected clients
- A network trace (HAR), if the issue is on the portal (make sure to refresh the page after starting HAR trace to get complete log)

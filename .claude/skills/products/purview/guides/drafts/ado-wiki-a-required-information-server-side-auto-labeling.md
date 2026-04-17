---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/Auto Labeling/Server Side Auto Labeling/Required Information: Server Side Auto Labeling"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FAuto%20Labeling%2FServer%20Side%20Auto%20Labeling%2FRequired%20Information%3A%20Server%20Side%20Auto%20Labeling"
importDate: "2026-04-06"
type: troubleshooting-guide
---

When creating an escalation, please get this information:

- Description of the actual vs expected behavior
- The affected Auto Label policy and rule
```powershell  
Get-AutoSensitivityLabelPolicy -Identity <*policy in question*> -IncludeTestModeResults $True | Select-Object -Property * -ExcludeProperty SerializationData | ConvertTo-Json -Depth 100 > policy.txt
Get-AutoSensitivityLabelRule -Identity "Rule in question" -IncludeExecutionRuleGuids $true -includeexecutionruleinformation $true | Select-Object -Property * -ExcludeProperty SerializationData | ConvertTo-Json -Depth 100 > Rule.txt
```
- If the issue is with simulation or in the Purview portal, a [network trace](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Welcome/9071/How-to-Capture-a-network-trace) and [screen recording](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Welcome/9072/How-to-Capture-a-recording-of-an-issue)
- If the issue is with Exchange emails
  - [Extended Message Trace Detail](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Welcome/9076/How-to-Get-and-read-a-message-trace-detail-report-for-an-email-message) report
  - A copy of the .eml or .msg
- If the issue is with SharePoint or OneDrive
  - The special Document Path of the [affected document](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Data%20Loss%20Prevention/8938/How-to-Get-the-document-path-of-a-document-in-SharePoint-or-OneDrive)
- For the file presented in the file path also provide the timestamp in which the file was last modified in **UTC**.

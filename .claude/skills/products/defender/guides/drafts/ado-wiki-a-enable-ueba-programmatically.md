---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Microsoft Sentinel Wiki/UEBA&Notebooks/Enable UEBA Programmatically"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=%2FMicrosoft%20Sentinel%20Wiki%2FUEBA%26Notebooks%2FEnable%20UEBA%20Programmatically"
importDate: "2026-04-07"
type: troubleshooting-guide
---

**1- Customers can use ARM to enable UEBA** <br>

https://learn.microsoft.com/en-us/rest/api/securityinsights/preview/product-settings/update?tabs=HTTP

The only thing is that it needs to be done in two requests, 1st to enable Entity Analytics and 2nd to enable UEBA.<br>

**2- PowerShell Script to enable UEBA provided by a SR CLOUD SOLUTION ARCHITECT "Pradeep Kondamuri".**<br>

The following PowerShell code (you need to replace the variable values). You need to enable EntityAnalytics before you can enable UEBA<br>

```powershell
#start script

$sub="22441c71-50fc-422b-b928-5631edd6175e"
$rg="pk-test-rg"
$workspace="pk-test-law"
$uri1= "https://management.azure.com/subscriptions/$sub/resourceGroups/$rg/providers/Microsoft.OperationalInsights/workspaces/$workspace/providers/Microsoft.SecurityInsights/settings/EntityAnalytics?api-version=2023-04-01-preview"
$uri2= "https://management.azure.com/subscriptions/$sub/resourceGroups/$rg/providers/Microsoft.OperationalInsights/workspaces/$workspace/providers/Microsoft.SecurityInsights/settings/Ueba?api-version=2023-04-01-preview"

Connect-AzAccount
set-azcontext -Subscription "Microsoft Azure Sponsorship 2"
$payload1 = '{ 
     "kind":"EntityAnalytics",
     "properties": {"entityProviders":["AzureActiveDirectory"]}}
      }'
Invoke-AzRestMethod -uri $uri1 -Method PUT -Payload $payload1
$payload2 = '{ 
     "kind":"Ueba",
     "properties": {"dataSources":["AuditLogs","AzureActivity","SecurityEvent","SigninLogs"]}}
      }'
Invoke-AzRestMethod -uri $uri2 -Method PUT -Payload $payload2

#end script
```

|Contributor Name|Details|Date (MM/DD/YYYY)|
|--|--|--|
| Mohammed Mubarak | Created this section | 04/25/2023 |

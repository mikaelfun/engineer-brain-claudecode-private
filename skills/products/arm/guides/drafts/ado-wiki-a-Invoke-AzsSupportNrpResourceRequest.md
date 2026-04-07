---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Stack Hub/Azs.Support Module/modules/AzureStack.Hub.Network.Nrp.ps1/Invoke-AzsSupportNrpResourceRequest"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Stack%20Hub/Azs.Support%20Module/modules/AzureStack.Hub.Network.Nrp.ps1/Invoke-AzsSupportNrpResourceRequest"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# CSSTools Invoke-AzsSupportNrpResourceRequest

# Synopsis
Allows GET or PUT requests to NRP REST API endpoint for troubleshooting.

# Parameters
## NRPURI / SUBSCRIPTIONID / RESOURCEGROUP / RESOURCETYPE / RESOURCENAME / METHODTYPE / BODY

# Examples
```powershell
Invoke-AzsSupportNrpResourceRequest -SubscriptionID "c2497e26-..." -ResourceGroup "default-rg" -ResourceType publicIpAddresses -MethodType GET
# GET then PUT pattern:
$body = Invoke-AzsSupportNrpResourceRequest -NrpUri $Uri -MethodType GET
Invoke-AzsSupportNrpResourceRequest -NrpUri $Uri -MethodType PUT -Body $body
```

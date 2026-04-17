---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Stack Hub/Azs.Support Module/modules/AzureStack.Hub.Network.Sdn.ps1/Invoke-AzsSupportSdnResourceRequest"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Stack%20Hub/Azs.Support%20Module/modules/AzureStack.Hub.Network.Sdn.ps1/Invoke-AzsSupportSdnResourceRequest"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# CSSTools Invoke-AzsSupportSdnResourceRequest

# Synopsis
Invokes a web request to SDN API for the requested resource.

# Parameters
## NCURI / RESOURCEREF / RESOURCETYPE / BODY / METHODTYPE

# Examples
```powershell
Invoke-AzsSupportSdnResourceRequest -ResourceType PublicIPAddresses
# GET then PUT:
$Body = Invoke-AzsSupportSdnResourceRequest -NcUri "https://nc.$env:USERDNSDOMAIN" -ResourceRef "/publicIPAddresses/..."
Invoke-AzsSupportSdnResourceRequest -NcUri "https://nc.$env:USERDNSDOMAIN" -ResourceRef "/publicIPAddresses/..." -MethodType PUT -Body $Body
```

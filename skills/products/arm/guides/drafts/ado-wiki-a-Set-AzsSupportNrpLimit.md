---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Stack Hub/Azs.Support Module/modules/AzureStack.Hub.Network.Nrp.ps1/Set-AzsSupportNrpLimit"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Stack%20Hub/Azs.Support%20Module/modules/AzureStack.Hub.Network.Nrp.ps1/Set-AzsSupportNrpLimit"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# CSSTools Set-AzsSupportNrpLimit

# Synopsis
Modifies the NRP resource limit for a given subscription.

# Parameters
## SUBSCRIPTION
Subscription GUID.
## RESOURCE
Configurable resource limit (enum NrpResourceLimitsConfigurable).
## NEWLIMIT
New integer value.

# Examples
```powershell
Set-AzsSupportNrpLimit -Subscription 'c2497e26-...' -Resource maxStaticPublicIpsPerSubscription -NewLimit 1000
```

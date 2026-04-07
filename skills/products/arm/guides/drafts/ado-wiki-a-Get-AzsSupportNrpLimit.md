---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Stack Hub/Azs.Support Module/modules/AzureStack.Hub.Network.Nrp.ps1/Get-AzsSupportNrpLimit"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Stack%20Hub/Azs.Support%20Module/modules/AzureStack.Hub.Network.Nrp.ps1/Get-AzsSupportNrpLimit"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# CSSTools Get-AzsSupportNrpLimit

# Synopsis
Reads the NRP settings for a given subscription.

# Parameters
## SUBSCRIPTION
Subscription GUID.
## RESOURCE
Specific configurable resource limit (enum NrpResourceLimitsConfigurable). If omitted returns all settings.

# Examples
```powershell
Get-AzsSupportNrpLimit -Subscription 'c2497e26-...'
Get-AzsSupportNrpLimit -Subscription 'c2497e26-...' -Resource maxStaticPublicIpsPerSubscription
```

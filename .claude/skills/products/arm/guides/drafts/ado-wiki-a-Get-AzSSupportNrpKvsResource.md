---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Stack Hub/Azs.Support Module/modules/AzureStack.Hub.Network.Nrp.ps1/Get-AzSSupportNrpKvsResource"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Stack%20Hub/Azs.Support%20Module/modules/AzureStack.Hub.Network.Nrp.ps1/Get-AzSSupportNrpKvsResource"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# CSSTools Get-AzSSupportNrpKvsResource

# Synopsis
Gets the NRP resource from NRP KVS showing internal properties not exposed via NRP REST API.

# Parameters
## FULLRESOURCEURI
Full URI of the NRP resource.
## SUBSCRIPTION / RESOURCEGROUP / RESOURCETYPE / RESOURCENAME
Individual resource identity components.

# Examples
```powershell
Get-AzSSupportNrpKvsResource -FullResourceUri "/subscriptions/.../Microsoft.Network/virtualNetworks/vmss-RG-A-vnet"
Get-AzSSupportNrpKvsResource -Subscription "2eb54b0f-..." -ResourceGroup "vmss-RG-A" -ResourceType VirtualNetworks -ResourceName "vmss-RG-A-vnet"
```

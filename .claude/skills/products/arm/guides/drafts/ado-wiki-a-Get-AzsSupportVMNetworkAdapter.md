---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Stack Hub/Azs.Support Module/modules/AzureStack.Hub.Network.Sdn.ps1/Get-AzsSupportVMNetworkAdapter"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Stack%20Hub/Azs.Support%20Module/modules/AzureStack.Hub.Network.Sdn.ps1/Get-AzsSupportVMNetworkAdapter"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# CSSTools Get-AzsSupportVMNetworkAdapter

# Synopsis
Retrieves virtual machine network adapters allocated on a Hyper-V host.

# Parameters
## COMPUTERNAME
Host name(s) to query.
## VMSTATE
VM state filter (default: Running).
## EXECUTIONTIMEOUT / POLLINGINTERVAL
Job timing control.

# Examples
```powershell
Get-AzsSupportVMNetworkAdapter -ComputerName (Get-AzsSupportInfrastructureHost -State Up).Name
```

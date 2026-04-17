---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Stack Hub/Azs.Support Module/modules/AzureStack.Hub.Network.Sdn.ps1/Invoke-AzsSupportGetNetView"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Stack%20Hub/Azs.Support%20Module/modules/AzureStack.Hub.Network.Sdn.ps1/Invoke-AzsSupportGetNetView"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# CSSTools Invoke-AzsSupportGetNetView

# Synopsis
Invokes Get-Netview function on specified ComputerNames for network diagnostics.

# Parameters
## COMPUTERNAME
Hosts to target.
## OUTPUTDIRECTORY / BACKGROUNDTHREADS / SKIPADMINCHECK / SKIPLOGS / SKIPNETSHTRACE / SKIPCOUNTERS

# Examples
```powershell
Invoke-AzsSupportGetNetView -ComputerName (Get-AzsSupportInfrastructureHost).Name
```

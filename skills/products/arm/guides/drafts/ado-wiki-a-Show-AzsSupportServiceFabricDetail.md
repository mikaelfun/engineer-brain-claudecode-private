---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Stack Hub/Azs.Support Module/modules/AzureStack.Hub.Fabric.ps1/Show-AzsSupportServiceFabricDetail"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Stack%20Hub/Azs.Support%20Module/modules/AzureStack.Hub.Fabric.ps1/Show-AzsSupportServiceFabricDetail"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# CSSTools Show-AzsSupportServiceFabricDetail

# Synopsis
Retrieve all Service Fabric applications, Services, Partitions and Replicas and return them in psobject

# Parameters
## RING
A value from [Enum]::GetValues([SFInfrastructureRole]), such as ACS or FabricRingServices
## UNHEALTHY
To show only unhealthy Applications, Services, Partitions, Replicas and Instances

# Examples
```powershell
Show-AzsSupportServiceFabricDetail -Ring FabricRingServices
Show-AzsSupportServiceFabricDetail -Ring FabricRingServices -Unhealthy
```

# Outputs
Show the service fabric Applications including Services, Partitions and replicas.

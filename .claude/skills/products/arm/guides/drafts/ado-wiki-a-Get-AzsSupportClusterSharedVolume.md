---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Stack Hub/Azs.Support Module/modules/AzureStack.Hub.Compute.Cluster.ps1/Get-AzsSupportClusterSharedVolume"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Stack%20Hub/Azs.Support%20Module/modules/AzureStack.Hub.Compute.Cluster.ps1/Get-AzsSupportClusterSharedVolume"
importDate: "2026-04-06"
type: cmdlet-reference
---

---
note: This is a dynamically created article. Do not edit directly
template: .templates/Templates/Function.md
---
# CSSTools Get-AzsSupportClusterSharedVolume

# Synopsis

Returns a list of all the cluster shared volumes, sorted by state.

# Parameters

## CLUSTER

Defaults to s-cluster

## NAME

The name of a specific CSV

# Examples

## Example 1

```powershell
Get-AzsSupportClusterSharedVolume
```

## Example 2

```powershell
Get-AzsSupportClusterSharedVolume -Name "Cluster Virtual Disk (Infrastructure_1)"
```

## Example 3

```powershell
Get-AzsSupportClusterSharedVolume -Cluster "s-cluster"
```

---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Stack Hub/Azs.Support Module/modules/AzureStack.Hub.Compute.Cluster.ps1/Move-AzsSupportClusterSharedVolume"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Stack%20Hub/Azs.Support%20Module/modules/AzureStack.Hub.Compute.Cluster.ps1/Move-AzsSupportClusterSharedVolume"
importDate: "2026-04-06"
type: tool-reference
---

---
note: This is a dynamically created article. Do not edit directly
template: .templates/Templates/Function.md
---
# CSSTools Move-AzsSupportClusterSharedVolume

# Synopsis

Moves a Cluster Shared Volume (CSV) to ownership by a different node in a failover cluster.

# Parameters

## CLUSTER

Defaults to s-cluster

## NAME

The name of a specific CSV to move

## NODE

The new node that will own the CSV

# Examples

## Example 1

```powershell
Move-AzsSupportClusterSharedVolume -Name "Cluster Virtual Disk (Infrastructure_1)"
```

## Example 2

```powershell
Move-AzsSupportClusterSharedVolume -Name "Cluster Virtual Disk (ObjStore_1)" -Node "Azs-Node04"
```

## Example 3

```powershell
Move-AzsSupportClusterSharedVolume -Name "Cluster Virtual Disk (ObjStore_1)" -Cluster "s-cluster" -Node "Azs-Node04"
```



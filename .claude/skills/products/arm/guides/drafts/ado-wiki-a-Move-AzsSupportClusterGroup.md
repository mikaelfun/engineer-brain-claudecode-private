---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Stack Hub/Azs.Support Module/modules/AzureStack.Hub.Compute.Cluster.ps1/Move-AzsSupportClusterGroup"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Stack%20Hub/Azs.Support%20Module/modules/AzureStack.Hub.Compute.Cluster.ps1/Move-AzsSupportClusterGroup"
importDate: "2026-04-06"
type: tool-reference
---

---
note: This is a dynamically created article. Do not edit directly
template: .templates/Templates/Function.md
---
# CSSTools Move-AzsSupportClusterGroup

# Synopsis

Moves a clustered role from one node to another in a failover cluster.

# Parameters

## CLUSTER

Defaults to s-cluster, or you can specific a cluster name

## NAME

The name of the cluster group you want to move, default value is "Cluster Group"

# Examples

## Example 1

```powershell
Move-AzsSupportClusterGroup
```

## Example 2

```powershell
Move-AzsSupportClusterGroup -Cluster s-cluster -Name "Cluster Group"
```

## Example 3

```powershell
Move-AzsSupportClusterGroup -Cluster s-cluster -Name "SU1FileServer"
```



---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Stack Hub/Azs.Support Module/modules/AzureStack.Hub.Compute.Cluster.ps1/Get-AzsSupportClusterResource"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Stack%20Hub/Azs.Support%20Module/modules/AzureStack.Hub.Compute.Cluster.ps1/Get-AzsSupportClusterResource"
importDate: "2026-04-06"
type: cmdlet-reference
---

---
note: This is a dynamically created article. Do not edit directly
template: .templates/Templates/Function.md
---
# CSSTools Get-AzsSupportClusterResource

# Synopsis

Gets cluster resources, sorted by State.

# Parameters

## CLUSTER

Defaults to s-cluster

## NAME

The name of a specific cluster resource. Accepts wildcards.

## RESOURCETYPE

Specify the type of resource you wish to query

# Examples

## Example 1

```powershell
Get-AzsSupportClusterResource
```

## Example 2

```powershell
Get-AzsSupportClusterResource -Name "Virtual Machine Azs-ACS01"
```

## Example 3

```powershell
Get-AzsSupportClusterResource -ResourceType "Virtual Machine"
```

## Example 4

```powershell
Get-AzsSupportClusterResource -Cluster "s-cluster" -Name "*ACS01"
```

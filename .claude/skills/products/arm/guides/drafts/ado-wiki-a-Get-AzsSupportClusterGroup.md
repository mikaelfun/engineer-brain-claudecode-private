---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Stack Hub/Azs.Support Module/modules/AzureStack.Hub.Compute.Cluster.ps1/Get-AzsSupportClusterGroup"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Stack%20Hub/Azs.Support%20Module/modules/AzureStack.Hub.Compute.Cluster.ps1/Get-AzsSupportClusterGroup"
importDate: "2026-04-06"
type: cmdlet-reference
---

---
note: This is a dynamically created article. Do not edit directly
template: .templates/Templates/Function.md
---
# CSSTools Get-AzsSupportClusterGroup

# Synopsis

Gets cluster groups, sorted by State

# Parameters

## CLUSTER

Defaults to s-cluster

## NAME

The name of a specific cluster group. Accepts wildcards

## GROUPTYPE

Specify the type of group you wish to query

# Examples

## Example 1

```powershell
Get-AzsSupportClusterGroup
```

## Example 2

```powershell
Get-AzsSupportClusterGroup -Name "SDDC Group"
```

## Example 3

```powershell
Get-AzsSupportClusterGroup -GroupType "VirtualMachine"
```

## Example 4

```powershell
Get-AzsSupportClusterGroup -Cluster "s-cluster" -Name "SDDC*"
```

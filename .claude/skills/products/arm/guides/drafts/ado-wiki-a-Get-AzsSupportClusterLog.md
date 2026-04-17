---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Stack Hub/Azs.Support Module/modules/AzureStack.Hub.Compute.Cluster.ps1/Get-AzsSupportClusterLog"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Stack%20Hub/Azs.Support%20Module/modules/AzureStack.Hub.Compute.Cluster.ps1/Get-AzsSupportClusterLog"
importDate: "2026-04-06"
type: cmdlet-reference
---

---
note: This is a dynamically created article. Do not edit directly
template: .templates/Templates/Function.md
---
# CSSTools Get-AzsSupportClusterLog

# Synopsis

Generates a failover cluster log for the specified nodes and returns the file path to the log. If no nodes are specified, generates cluster log from all nodes.

# Parameters

## COMPUTERNAME

One or more failover cluster node names

## TIMESPAN

Specifies the time span in minutes for which to generate the cluster log.

## CLUSTERHEALTH

Switch used for gathering the health cluster logs instead of the default cluster logs

# Examples

## Example 1

```powershell
Get-AzsSupportClusterLog
```

## Example 2

```powershell
Get-AzsSupportClusterLog -ClusterHealth
```

## Example 3

```powershell
Get-AzsSupportClusterLog -Timespan 30
```

## Example 4

```powershell
Get-AzsSupportClusterLog -ComputerName "Azs-Node01", "Azs-Node02"
```

## Example 5

```powershell
Get-AzsSupportClusterLog -ComputerName "Azs-Node01", "Azs-Node02" -ClusterHealth
```

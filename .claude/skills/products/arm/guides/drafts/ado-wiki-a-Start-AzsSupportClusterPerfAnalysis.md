---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Stack Hub/Azs.Support Module/modules/AzureStack.Hub.Compute.Cluster.Performance.ps1/Start-AzsSupportClusterPerfAnalysis"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Stack%20Hub/Azs.Support%20Module/modules/AzureStack.Hub.Compute.Cluster.Performance.ps1/Start-AzsSupportClusterPerfAnalysis"
importDate: "2026-04-06"
type: cmdlet-reference
---

---
note: This is a dynamically created article. Do not edit directly
template: .templates/Templates/Function.md
---
# CSSTools Start-AzsSupportClusterPerfAnalysis

# Description

The script checks performance history from Storage Space Direct

# Synopsis

Analyzes key performance data such as cluster performance history and exports performance data.

# Parameters

## TIMEFRAME

Sets the TimeFrame of the data you wish to analyse such as:
    LastHour/LastDay/LastWeek

# Examples

## Example 1

```powershell
Start-AzsSupportClusterPerfAnalysis -TimeFrame LastHour
```

## Example 2

```powershell
Start-AzsSupportClusterPerfAnalysis -TimeFrame LastDay
```

## Example 3

```powershell
Start-AzsSupportClusterPerfAnalysis -TimeFrame LastWeek
```

# Inputs

This will need mandatory param TimeFrame set

# Outputs

Performance data for Cluster Nodes

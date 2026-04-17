---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Stack Hub/Azs.Support Module/modules/AzureStack.Hub.Compute.Cluster.Performance.ps1/Get-AzsSupportVHDPerformance"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Stack%20Hub/Azs.Support%20Module/modules/AzureStack.Hub.Compute.Cluster.Performance.ps1/Get-AzsSupportVHDPerformance"
importDate: "2026-04-06"
type: cmdlet-reference
---

---
note: This is a dynamically created article. Do not edit directly
template: .templates/Templates/Function.md
---
# CSSTools Get-AzsSupportVHDPerformance

# Synopsis

Get detailed information VHD performance from Cluster performance history

# Parameters

## TIMEFRAME

Sets the TimeFrame of the data you wish to analyse such as:
LastHour/LastDay/LastWeek

## NODES

Sets the nodes you want to include, allowing targetted investigation of certain nodes such as:
Contoso-Node01

# Examples

## Example 1

```powershell
Get-AzsSupportVHDPerformance -Node $Nodes -TimeFrame LastHour
```

# Outputs

List performance metrics for given Node name

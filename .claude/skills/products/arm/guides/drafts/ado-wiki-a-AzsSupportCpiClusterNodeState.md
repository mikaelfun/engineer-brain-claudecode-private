---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Stack Hub/Azs.Support Module/modules/AzureStack.Hub.Compute.Crp.ps1/Set-AzsSupportCpiClusterNodeState"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Stack%20Hub/Azs.Support%20Module/modules/AzureStack.Hub.Compute.Crp.ps1/Set-AzsSupportCpiClusterNodeState"
importDate: "2026-04-06"
type: tool-reference
---

---
note: This is a dynamically created article. Do not edit directly
template: .templates/Templates/Function.md
---
# CSSTools Set-AzsSupportCpiClusterNodeState

# Synopsis

Enables or disables the cluster node in CPI

# Parameters

## ENABLE

Enable the node in CPI

## DISABLE

Disable the node in CPI

## COMPUTERNAME

The name of the node to enable or disable

# Examples

## Example 1

```powershell
Set-AzsSupportCpiClusterNodeState -ComputerName "Azs-Node01" -Enable
```

## Example 2

```powershell
Set-AzsSupportCpiClusterNodeState -ComputerName "Azs-Node01" -Disable
```

---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Stack Hub/Azs.Support Module/modules/AzureStack.Hub.Common.ps1/Stop-AzsSupportProcess"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Stack%20Hub/Azs.Support%20Module/modules/AzureStack.Hub.Common.ps1/Stop-AzsSupportProcess"
importDate: "2026-04-06"
type: cmdlet-reference
---

---
note: This is a dynamically created article. Do not edit directly
template: .templates/Templates/Function.md
---
# CSSTools Stop-AzsSupportProcess

# Synopsis

Stops (kills) a process on a specified ComputerName.

# Parameters

## COMPUTERNAME

The remote computer to perform operation against

## ID

The Id of the process

# Examples

## Example 1

```powershell
Stop-AzsSupportProcess -ComputerName PREFIX-NODE01 -Id 1234
```

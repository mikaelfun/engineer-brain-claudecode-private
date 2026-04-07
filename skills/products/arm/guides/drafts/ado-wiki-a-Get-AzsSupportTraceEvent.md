---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Stack Hub/Azs.Support Module/modules/AzureStack.Hub.Utilities.ps1/Get-AzsSupportTraceEvent"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Stack%20Hub/Azs.Support%20Module/modules/AzureStack.Hub.Utilities.ps1/Get-AzsSupportTraceEvent"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
note: This is a dynamically created article. Do not edit directly
template: .templates/Templates/Function.md
---
# CSSTools Get-AzsSupportTraceEvent

# Synopsis

Gets the trace events from Get-AzsSupportTraceFilePath.

# Parameters

## FUNCTIONNAME

The function name that you want to filter on

## LEVEL

The log level you want to filter on

## INCLUDEDEBUGEVENTS

Return debug level events from trace file

# Examples

## Example 1

```powershell
Get-AzsSupportTraceEvent -FunctionName 'New-AzsSupportTraceFilePath' -Level Verbose
```

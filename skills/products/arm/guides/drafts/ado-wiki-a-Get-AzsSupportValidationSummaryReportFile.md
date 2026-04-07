---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Stack Hub/Azs.Support Module/modules/AzureStack.Hub.Common.ps1/Get-AzsSupportValidationSummaryReportFile"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Stack%20Hub%2FAzs.Support%20Module%2Fmodules%2FAzureStack.Hub.Common.ps1%2FGet-AzsSupportValidationSummaryReportFile"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# CSSTools Get-AzsSupportValidationSummaryReportFile

# Synopsis

Retrieves the latest AzureStack_Validation_Summary (Test-AzureStack) json and html filepath from the Seed Ring Services virtual machines.

# Parameters

## ALL

Switch to return all the AzureStack_Validation_Summary json and html files found

# Examples

## Example 1

```powershell
Get-AzsSupportValidationSummaryReportFile
```

## Example 2

```powershell
Get-AzsSupportValidationSummaryReportFile -All
```

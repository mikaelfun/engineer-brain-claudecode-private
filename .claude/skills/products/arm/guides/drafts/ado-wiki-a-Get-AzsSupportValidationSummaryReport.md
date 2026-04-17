---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Stack Hub/Azs.Support Module/modules/AzureStack.Hub.Common.ps1/Get-AzsSupportValidationSummaryReport"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Stack%20Hub%2FAzs.Support%20Module%2Fmodules%2FAzureStack.Hub.Common.ps1%2FGet-AzsSupportValidationSummaryReport"
importDate: "2026-04-06"
type: tool-reference
---

# CSSTools Get-AzsSupportValidationSummaryReport

## Synopsis

Returns the latest AzureStack_Validation_Summary (Test-AzureStack) test(s) performed back as an ArrayList Object.

## Parameters

### FILEPATH
Specifies the path to an AzureStack_Validation_Summary json file.

### NEWEST
Specifies a number of files to get (most recently modified).

### TEST
Specifies the validation test within AzureStack_Validation_Summary.

### WARNINGS
Specifies if only validation test(s) that contain Warnings are returned.

### ERRORS
Specifies if only validation test(s) that contain Errors are returned.

## Examples

```powershell
Get-AzsSupportValidationSummaryReport
Get-AzsSupportValidationSummaryReport -Newest 5 -Test 'Alerts'
Get-AzsSupportValidationSummaryReport -Newest 5 -Test 'Alerts' -Warnings
Get-AzsSupportValidationSummaryReport -Newest 5 -Test 'Alerts' -Warnings -Errors
```

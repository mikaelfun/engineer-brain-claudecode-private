---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Stack Hub/Azs.Support Module/modules/AzureStack.Hub.Common.ps1/Get-AzsSupportStampVersion"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Stack%20Hub%2FAzs.Support%20Module%2Fmodules%2FAzureStack.Hub.Common.ps1%2FGet-AzsSupportStampVersion"
importDate: "2026-04-06"
type: tool-reference
---

# CSSTools Get-AzsSupportStampVersion

## Synopsis

Gets the minor version of the stamp version, or the full version of the stamp if the parameter is supplied.

## Parameters

### FULLVERSION
Returns the full version string, such as 1.1910.17.95, instead of just 1910

## Examples

```powershell
Get-AzsSupportStampVersion
Get-AzsSupportStampVersion -FullVersion
```

## Outputs

[Int] if minor version
[String] if -FullVersion is specified

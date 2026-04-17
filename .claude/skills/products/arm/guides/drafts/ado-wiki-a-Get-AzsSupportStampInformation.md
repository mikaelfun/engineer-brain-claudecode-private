---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Stack Hub/Azs.Support Module/modules/AzureStack.Hub.Common.ps1/Get-AzsSupportStampInformation"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Stack%20Hub%2FAzs.Support%20Module%2Fmodules%2FAzureStack.Hub.Common.ps1%2FGet-AzsSupportStampInformation"
importDate: "2026-04-06"
type: tool-reference
---

# CSSTools Get-AzsSupportStampInformation

## Synopsis

Queries ECE for common stamp info properties such as CloudId, Version and HardwareOEM.

## Parameters

### FORCE
Refreshes the cache

## Examples

```powershell
Get-AzsSupportStampInformation
Get-AzsSupportStampInformation -Force
```

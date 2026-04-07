---
source: ado-wiki
sourceRef: Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Stack Hub/Azs.Support Module/modules/AzureStack.Hub.Storage.Diagnostics.ps1/Start-AzsSupportStorageDiagnostic
sourceUrl: https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Stack%20Hub%2FAzs.Support%20Module%2Fmodules%2FAzureStack.Hub.Storage.Diagnostics.ps1%2FStart-AzsSupportStorageDiagnostic
importDate: 2026-04-06
type: troubleshooting-guide
---

# CSSTools Start-AzsSupportStorageDiagnostic

# Description

The script checks storage against known issues

# Synopsis

Runs a series of storage specific diagnostic tests and generates a storage report.

# Parameters

## PHYSICALEXTENTCHECK

Enables checking of the Virtual disks physical extents.

## CACHERESULTTABLE

Enables caching the Result Table for utilising data externally.

# Examples

## Example 1

```powershell
PS C:\>Start-AzsSupportStorageDiagnostic
```

## Example 2

```powershell
PS C:\>Start-AzsSupportStorageDiagnostic -PhysicalExtentCheck
```

## Example 3

```powershell
PS C:\>Start-AzsSupportStorageDiagnostic -CacheResultTable
```

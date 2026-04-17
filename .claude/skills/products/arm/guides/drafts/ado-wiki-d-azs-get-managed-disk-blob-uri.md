---
source: ado-wiki
sourceRef: Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Stack Hub/Azs.Support Module/modules/AzureStack.Hub.Storage.ManagedDisk.ps1/Get-AzsSupportManagedDiskBlobUriAndFilePath
sourceUrl: https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Stack%20Hub%2FAzs.Support%20Module%2Fmodules%2FAzureStack.Hub.Storage.ManagedDisk.ps1%2FGet-AzsSupportManagedDiskBlobUriAndFilePath
importDate: 2026-04-06
type: troubleshooting-guide
---

# CSSTools Get-AzsSupportManagedDiskBlobUriAndFilePath

# Synopsis

Gets the blob uri of a managed disk.

# Parameters

## SUBSCRIPTIONID

The subscription ID

## RESOURCEGROUPNAME

The resource group name

## DISKNAME

The disk name

# Examples

## Example 1

```powershell
Get-AzsSupportManagedDiskBlobUri -SubscriptionId cd25f863-4804-4008-89f3-175ea2bcae84 -ResourceGroupName testrg -DiskName testvm000_disk2_278078f4209a4ccea6ccb35c3794bc8d
```

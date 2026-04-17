---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Stack Hub/Azs.Support Module/modules/AzureStack.Hub.Storage.Acs.ps1/Get-AzsSupportDBPathByStorageAccount"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Stack%20Hub/Azs.Support%20Module/modules/AzureStack.Hub.Storage.Acs.ps1/Get-AzsSupportDBPathByStorageAccount"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# CSSTools Get-AzsSupportDBPathByStorageAccount

## Synopsis
Storage accounts are saved in different ESENT DB partitions. Gets the DB partition directory information for the given storage account.

## Parameters
- **ACCOUNTNAME**: Storage account name

## Examples
```powershell
Get-AzsSupportDBPathByStorageAccount -Accountname frphealthaccount
```

## Outputs
PSCustomObject
- AccountId
- AccountName
- ClusterStoragePath
- LocalStoragePath
- PartitionId

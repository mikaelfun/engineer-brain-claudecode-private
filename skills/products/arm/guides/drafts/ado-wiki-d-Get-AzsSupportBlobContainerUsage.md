---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Stack Hub/Azs.Support Module/modules/AzureStack.Hub.Storage.Acs.ps1/Get-AzsSupportBlobContainerUsage"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Stack%20Hub/Azs.Support%20Module/modules/AzureStack.Hub.Storage.Acs.ps1/Get-AzsSupportBlobContainerUsage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# CSSTools Get-AzsSupportBlobContainerUsage

## Synopsis
Gets storage account container usage information.

## Parameters
- **SHARENAME**: Name of the share where blob container usage data are obtained
- **STARTTOKEN**: Start token for pagination
- **CONTAINERCOUNT**: Number of containers to obtain
- **IGNOREMANAGEDDISK**: Exclude containers for managed disks
- **CREDENTIAL**: Domain admin user credential
- **ACSVMNAME**: Name of an ACS VM

## Examples
```powershell
Get-AzsSupportBlobContainerUsage -ShareName su1_objstore_1
```

## Outputs
HashTable

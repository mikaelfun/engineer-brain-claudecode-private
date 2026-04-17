---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Stack Hub/Azs.Support Module/modules/AzureStack.Hub.Storage.Acs.ps1/Get-AzsSupportBlobInfo"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Stack%20Hub/Azs.Support%20Module/modules/AzureStack.Hub.Storage.Acs.ps1/Get-AzsSupportBlobInfo"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# CSSTools Get-AzsSupportBlobInfo

## Synopsis
Gets storage account blob information.

## Parameters
- **ACCOUNTNAME**: The storage account name
- **CONTAINERNAME**: The container name
- **BLOBNAME**: The blob name
- **SNAPSHOT**: The snapshot tag
- **CREDENTIAL**: Domain admin user credential
- **ACSVMNAME**: Name of an ACS VM

## Examples
```powershell
Get-AzsSupportBlobInfo -AccountName testsa -ContainerName testctn -BlobName blob.txt
```

## Outputs
Microsoft.AzureStack.Services.Storage.Blob.BlobObjectEx

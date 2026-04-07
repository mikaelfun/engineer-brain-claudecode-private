---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Stack Hub/Azs.Support Module/modules/AzureStack.Hub.Storage.Acs.ps1/Get-AzsSupportStorageAccountProperties"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Stack%20Hub/Azs.Support%20Module/modules/AzureStack.Hub.Storage.Acs.ps1/Get-AzsSupportStorageAccountProperties"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# CSSTools Get-AzsSupportStorageAccountProperties

## Synopsis
Get properties for a specified storage account.

## Parameters
- **ACCOUNTNAME**: The storage account name
- **CREDENTIAL**: Domain admin user credential
- **ACSVMNAME**: Name of an ACS VM

## Examples
```powershell
Get-AzsSupportStorageAccountProperties -AccountName testsa
```

## Outputs
Microsoft.AzureStack.Services.Storage.Wac.WacAccountProperties

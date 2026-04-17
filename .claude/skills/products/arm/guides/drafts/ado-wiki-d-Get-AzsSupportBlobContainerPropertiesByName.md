---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Stack Hub/Azs.Support Module/modules/AzureStack.Hub.Storage.Acs.ps1/Get-AzsSupportBlobContainerPropertiesByName"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Stack%20Hub/Azs.Support%20Module/modules/AzureStack.Hub.Storage.Acs.ps1/Get-AzsSupportBlobContainerPropertiesByName"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# CSSTools Get-AzsSupportBlobContainerPropertiesByName

## Synopsis
Gets storage account container properties by name.

## Parameters
- **ACCOUNTNAME**: The storage account name of the container
- **CONTAINERNAME**: The container name
- **CONTAINERLIST**: A list of containers. Format: `(@([pscustomobject]@{account="testsa";containerList=@("testctn1","testctn2")}))`
- **CREDENTIAL**: Domain admin user credential
- **ACSVMNAME**: Name of an ACS VM

## Examples
```powershell
Get-AzsSupportBlobContainerPropertiesByName -AccountName testsa -ContainerName testctn
Get-AzsSupportBlobContainerPropertiesByName -ContainerList (@([pscustomobject]@{account="testsa";containerList=@("testctn1","testctn2")}))
```

## Outputs
Object[PSCustomObject]

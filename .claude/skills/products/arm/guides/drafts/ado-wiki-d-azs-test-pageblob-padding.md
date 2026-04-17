---
source: ado-wiki
sourceRef: Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Stack Hub/Azs.Support Module/modules/AzureStack.Hub.Storage.Acs.ps1/Test-AzsSupportPageBlobPadding
sourceUrl: https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Stack%20Hub%2FAzs.Support%20Module%2Fmodules%2FAzureStack.Hub.Storage.Acs.ps1%2FTest-AzsSupportPageBlobPadding
importDate: 2026-04-06
type: troubleshooting-guide
---

# CSSTools Test-AzsSupportPageBlobPadding

# Synopsis

Test a page blob to see if its padding is correct

# Parameters

## ACCOUNTNAME

The storage account name

## CONTAINERNAME

The container name

## BLOBNAME

The blob name

## CREDENTIAL

The credential of a domain admin user

## ACSVMNAME

The name of an ACS VM

# Examples

## Example 1

```powershell
Test-AzsSupportPageBlobPadding -AccountName testsa -ContainerName testctn -BlobName testblob
```

---
source: ado-wiki
sourceRef: Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Stack Hub/Azs.Support Module/modules/AzureStack.Hub.Storage.Acs.ps1/New-AzsSupportBlobContainer
sourceUrl: https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Stack%20Hub%2FAzs.Support%20Module%2Fmodules%2FAzureStack.Hub.Storage.Acs.ps1%2FNew-AzsSupportBlobContainer
importDate: 2026-04-06
type: troubleshooting-guide
---

# CSSTools New-AzsSupportBlobContainer

# Synopsis

Create a new blob container on a specified storage account.

# Parameters

## ACCOUNTNAME

The storage account name

## CONTAINERNAME

The container name

## SHARENAME

The name of the share where the container will be created

## CREDENTIAL

The credential of a domain admin user

## ACSVMNAME

The name of an ACS VM

# Examples

## Example 1

```powershell
New-AzsSupportBlobContainer -AccountName testsa -ContainerName testctn
```

## Example 2

```powershell
New-AzsSupportBlobContainer -AccountName testsa -ContainerName testctn -ShareName su1_objstore_1
```

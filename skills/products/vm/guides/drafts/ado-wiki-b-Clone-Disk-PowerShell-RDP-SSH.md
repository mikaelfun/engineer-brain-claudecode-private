---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Cant RDP SSH/How Tos/Clone Disk Using PowerShell_RDP SSH"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FCant%20RDP%20SSH%2FHow%20Tos%2FClone%20Disk%20Using%20PowerShell_RDP%20SSH"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Clone Disk Using PowerShell (RDP/SSH Troubleshooting)

## Summary

Below you find one way to create a disk clone over PowerShell.

## Prerequisite

- [Azure PowerShell](https://www.microsoft.com/web/handlers/webpi.ashx/getinstaller/WindowsAzurePowershellGet.3f.3f.3fnew.appids)

## Instructions

```powershell
Select-AzureSubscription "<<SUBSCRIPTION NAME>>"

### Source VHD (South Central US) - authenticated container ###
$srcUri = "<<COMPLETE SOURCE URI FOR THE DISK TO COPY>>"

### Source Storage Account (South Central US) ###
$srcStorageAccount = "<<SOURCE STORAGE ACCOUNT NAME>>"
$srcStorageKey = "<<SOURCE STORAGE ACCOUNT KEY>>"

### Target Storage Account (South Central US) ###
$destStorageAccount = "<<DESTINATION STORAGE ACCOUNT NAME>>"
$destStorageKey = "<<DESTINATION STORAGE ACCOUNT KEY>>"

### Create the source storage account context ###
$srcContext = New-AzureStorageContext -StorageAccountName $srcStorageAccount -StorageAccountKey $srcStorageKey

### Create the destination storage account context ###
$destContext = New-AzureStorageContext -StorageAccountName $destStorageAccount -StorageAccountKey $destStorageKey

### Destination Container Name ###
$containerName = "copiedvhds"

### Create the container on the destination ###
New-AzureStorageContainer -Name $containerName -Context $destContext

### Start the asynchronous copy - specify the source authentication with -SrcContext ###
$blob1 = Start-AzureStorageBlobCopy -srcUri $srcUri -SrcContext $srcContext -DestContainer $containerName -DestBlob "<<DESTINATION VHD NAME>>" -DestContext $destContext
```

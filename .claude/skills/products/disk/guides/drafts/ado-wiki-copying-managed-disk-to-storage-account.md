---
source: ado-wiki
sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Import-Export Service/Copying A Managed Disk to an Azure Storage Account"
sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Import-Export%20Service%2FCopying%20A%20Managed%20Disk%20to%20an%20Azure%20Storage%20Account"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Copying A Managed Disk to an Azure Storage Account

## Overview
Any data that a customer wishes to export from Azure via Import-Export or Data Box must be in a storage account. Managed Disks cannot be moved via Azure Portal or Storage Explorer - only via Azure CLI.

## Prerequisites
- Azure CLI installed: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli-windows
- Customer logged in to Azure account via CLI

## Steps

### 1. Generate SAS URL for the Managed Disk
```powershell
Grant-AzureRmDiskAccess -DiskName "<Disk_Name>" -ResourceGroupName "<RG_Name>" -DurationInSecond 3600 -Access Read
```

### 2. Create temporary destination values
```powershell
$storageAccountName = "<SA_Name>"
$storageContainerName = "<SC_Name>"
$destinationVHDFileName = "<VHD_Name>"
$storageAccountKey = "<SA_Key>"
$destinationContext = New-AzureStorageContext -StorageAccountName $storageAccountName -StorageAccountKey $storageAccountKey
$sas = "<SAS_URL>"
```

### 3. Start the copy
```powershell
Start-AzureStorageBlobCopy -AbsoluteUri $sas -DestContainer $storageContainerName -DestContext $destinationContext -DestBlob $destinationVHDFileName
```

### 4. After copy completes
The disk can be used for an export job via Azure Import-Export service or Data Box POD.

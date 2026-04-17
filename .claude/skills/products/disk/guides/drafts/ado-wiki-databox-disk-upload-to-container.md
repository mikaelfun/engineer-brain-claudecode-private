---
source: ado-wiki
sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Data Box Disk/Connect & Copy/How is data from the Azure Data Box Disk uploaded to a container in the storage account?"
sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Data%20Box%20Disk%2FConnect%20%26%20Copy%2FHow%20is%20data%20from%20the%20Azure%20Data%20Box%20Disk%20uploaded%20to%20a%20container%20in%20the%20storage%20account%3F"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Data Box Disk — How Data is Uploaded to a Storage Account Container

## Overview
When ordering a Data Box Disk, you only specify the Resource Group and Storage Account. The container structure is determined during the upload process.

## Key Rule
"A container is created in the Azure storage account for each subfolder under BlockBlob and PageBlob folders. All files under BlockBlob and PageBlob folders are copied into a default container `$root` under the Azure Storage account. Any files in the `$root` container are always uploaded as block blobs."

## How to Target a Specific Container

### Prepare the disk structure
Name the folders under `BlockBlob` or `PageBlob` according to the container names you want in Azure:
- Disk: `<BlockBlob or PageBlob>/<container-name>/<folder-structure>`
- Azure Storage: `<container-name>/<folder-structure>`

### Use existing containers
Name the sub-folder under `BlockBlob` or `PageBlob` on the Data Box Disk with the same name as your existing container.

## Reference
- [Tutorial: Copy data to Azure Data Box Disk](https://learn.microsoft.com/en-us/azure/databox/data-box-disk-deploy-copy-data)

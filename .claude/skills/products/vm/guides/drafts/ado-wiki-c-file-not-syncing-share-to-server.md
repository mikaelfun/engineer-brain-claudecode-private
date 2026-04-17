---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files Sync/TSGs/File Not Syncing from File Share to Server_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Files%20Sync%2FTSGs%2FFile%20Not%20Syncing%20from%20File%20Share%20to%20Server_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# File Not Syncing from File Share to Server (Cloud to Server)

## Problem Description

Customer copied a file to File share and the file is not showing up in Server Endpoint(s).

Sync from CRUD operations on file share are not realtime. There is no change detection currently on the file share, and hence it won't show up on the server endpoint immediately or in few mins. A file share change detection job is run every 24 hours. Once that job runs, the file metadata is updated in the azure file sync cloud database, and then the server end point will pull down the changes from the file share.

## Check ASC

### 1. Change Detection at cloud endpoint side

- Check cloud change enumeration status (completed, in progress, or failed)
- Look at: timeSinceEnumerationStartedSeconds, filesScannedAcrossCheckpoints, dirsScannedAcrossCheckpoints
- Cloud enumeration completed with error will show an error code indicating the reason

### 2. Download Sync Per-Item Errors

- Check Sync Download Per-Item Error count and Sync Download Per-Item Errors
- Look at 9102 ServerEventID in Jarvis for **DownloadPersistentErrors** value
- DownloadPersistentErrors: 0 means errors are transient and will recover on their own

## Troubleshooting Steps

1. **Determine file change time ($t1)** - Validate in Azure file share if file was really added/updated/deleted
2. **Determine last cloud sync time ($st1)** - Check ASC cloud endpoint Change Detection property
3. If $t1 > $st1, ask customer to wait for $st1 + 24 hours, then check
4. **Check ASC for Sync agent health** - Registered Servers -> Server endpoint -> Status should show online
5. **Check storage account / File share restrictions** - IP whitelist, firewall, RBAC
6. **Follow Azure File Sync issues troubleshooting guide** for any upload/download errors

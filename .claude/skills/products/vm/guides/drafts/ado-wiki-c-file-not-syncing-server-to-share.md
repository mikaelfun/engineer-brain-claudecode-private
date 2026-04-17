---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files Sync/TSGs/File Not Syncing from Server to File Share_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Files%20Sync%2FTSGs%2FFile%20Not%20Syncing%20from%20Server%20to%20File%20Share_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# File Not Syncing from Server to File Share (Server to Cloud)

## Problem Description

Customer copied a file locally on the server sync folder. The file is not showing up on the cloud file share. Sync for CRUD operations on local server are realtime - the file should reflect on the file share within a few minutes.

## Troubleshooting Steps

1. **Check ASC** - Validate no issues with agent on server endpoint, no upload/download errors, check timestamps
2. **Check file changes on the server** - Ask customer to provide screenshot, validate file is in sync folder
3. **Check server endpoint for upload errors** - Run AzureFileSyncErrorReport.ps1 to identify files in error
4. **Collect server diagnostic logs** - Check logs for sync errors
5. **Check ASC for Sync agent health** - Registered Servers -> Server endpoint -> Status should show online
6. **Check storage account / File share restrictions** - IP whitelist, firewall, RBAC
7. **Check for upload/download errors** - Follow sync issues troubleshooting guide, verify latest agent version
8. **If still an issue, create an ICM**

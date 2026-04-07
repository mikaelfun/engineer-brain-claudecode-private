---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files Sync/TSGs/Replace file sync server_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Files%20Sync%2FTSGs%2FReplace%20file%20sync%20server_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Replace an Azure File Sync Server

Guidance on replacing an Azure File Sync server due to hardware decommissioning or end of support (e.g., Windows Server 2012 R2).

## New Azure File Sync server

1. Deploy new on-premises server or Azure VM running a [supported Windows Server OS](https://learn.microsoft.com/en-us/azure/storage/file-sync/file-sync-planning#operating-system-requirements)
2. [Install the latest Azure File Sync agent](https://learn.microsoft.com/en-us/azure/storage/file-sync/file-sync-deployment-guide?tabs=azure-portal%2Cproactive-portal#install-the-azure-file-sync-agent) and [register the server](https://learn.microsoft.com/en-us/azure/storage/file-sync/file-sync-deployment-guide?tabs=azure-portal%2Cproactive-portal#register-windows-server-with-storage-sync-service) to the same Storage Sync Service
3. Create file shares on new server and verify share-level permissions match old server
4. **Optional - Reduce download time**: Use Robocopy to copy cached files from old to new server:
   ```console
   Robocopy <source> <destination> /MT:16 /R:2 /W:1 /COPYALL /MIR /DCOPY:DAT /XA:O /B /IT /UNILOG:RobocopyLog.txt
   ```
   Run again after initial copy to get remaining changes.
5. In Azure portal, navigate to Storage Sync Service > sync group > [create server endpoint](https://learn.microsoft.com/en-us/azure/storage/file-sync/file-sync-server-endpoint-create?tabs=azure-portal#create-a-server-endpoint) on the new server. Repeat for every sync group that has a server endpoint for the old server.
6. Wait for namespace download to complete. Monitor progress: [How do I monitor sync session progress?](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-storage/files/file-sync/file-sync-troubleshoot-sync-errors?tabs=portal1%2Cazure-portal#how-do-i-monitor-the-progress-of-a-current-sync-session)

## User cut-over

- **Option 1**: Rename old server to random name, then rename new server to old server's name
- **Option 2**: Use [DFS Namespaces (DFS-N)](https://learn.microsoft.com/en-us/windows-server/storage/dfs-namespaces/dfs-overview) to redirect users

## Old Azure File Sync server

1. Follow [Deprovision server endpoint](https://learn.microsoft.com/en-us/azure/storage/file-sync/file-sync-server-endpoint-delete#scenario-1-you-intend-to-delete-your-server-endpoint-and-stop-using-your-local-server--vm) to verify all files synced to Azure file share before deleting server endpoints
2. Once all server endpoints deleted, [unregister the server](https://learn.microsoft.com/en-us/azure/storage/file-sync/file-sync-server-registration#unregister-the-server)

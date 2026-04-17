---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files Sync/TSGs/TSG 268 AFS Collect WinHTTP traces_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Files%20Sync%2FTSGs%2FTSG%20268%20AFS%20Collect%20WinHTTP%20traces_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# TSG 268: AFS Collect WinHTTP Traces

## Summary

How to collect WinHTTP debug traces for investigating AFS client connectivity issues.

## Steps

1. **Start trace capture** (elevated command prompt):
   ```
   netsh trace start scenario=InternetClient_dbg capture=yes overwrite=yes maxsize=1024
   ```

2. **Reproduce the issue**:
   ```powershell
   Import-Module "C:\Program Files\Azure\StorageSyncAgent\StorageSync.Management.ServerCmdlets.dll"
   Test-StorageSyncNetworkConnectivity
   ```

3. **Stop trace capture** (elevated command prompt):
   ```
   netsh trace stop
   ```

4. Put the generated `NetTrace.etl` into a ZIP archive and upload to DTM space to share with EEE or File Sync engineering for escalation.

---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files Sync/TSGs/Issues with Azure File Sync Agent AFSS_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Files%20Sync%2FTSGs%2FIssues%20with%20Azure%20File%20Sync%20Agent%20AFSS_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Azure File Sync Agent - Diagnostics & Known Issues

## Latest Azure File Sync agent version

To see the latest version of the agent go to [Release notes for the Azure File Sync agent](https://docs.microsoft.com/en-us/azure/storage/files/storage-files-release-notes)

## How To: Determine what agent version customer is using

**Note**: Use Azure Support Center (ASC) to get the agent version for each server. If ASC is not available, use the Jarvis query below.

1. Run Jarvis query: https://jarvis-west.dc.ad.msft.net/7FE760E6
2. The AgentVersion column contains the agent version information

## How To: View diagnostic data collected from a server

The Telemetry event log is collected from all servers registered with the Storage Sync Service.

If the customer selected during the agent installation to send diagnostic data, the following data is also collected:

**Event Logs:**
- Applications and Services\Microsoft\FileSync\Agent\Diagnostic
- Applications and Services\Microsoft\FileSync\Agent\Operational
- Applications and Services\Microsoft\FileSync\Management\Diagnostic

**ETL Traces:**
- FileSyncSvc trace
- StorageSync trace

To view the diagnostic data collected from a server, follow TSG #151: How to fetch diagnostics data for AFS server.

To determine if diagnostic data collection is enabled for a server, look at Event ID 9000 (IsDiagnosticsDataCollectionEnabled value) in the Telemetry event log.

If diagnostic data collection is disabled, the customer can enable data collection by setting:
`HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Azure\StorageSync\Agent\InstallOptions\EnableDiagnostics` value to `1`.

## Known Issues

**Volume runs out of disk space due to ETL traces in C:\Program Files\Azure\StorageSyncAgent\MAAgent\Diagnostic directory**

Conditions:
- The Azure File Sync agent is installed but the server is not registered with a storage sync service (once registered, extra ETL files will be deleted)
- The Storage Sync Monitor (AzureStorageSyncMonitor.exe) process is not running (restart the server; if issue recurs, uninstall agent, restart server, reinstall agent)

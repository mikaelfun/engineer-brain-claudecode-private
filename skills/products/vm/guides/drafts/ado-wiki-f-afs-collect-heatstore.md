---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files Sync/TSGs/TSG 212 AFS Cloud Tiering Collect heatsore for offline analysis_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Files%20Sync%2FTSGs%2FTSG%20212%20AFS%20Cloud%20Tiering%20Collect%20heatsore%20for%20offline%20analysis_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# TSG 212: AFS Cloud Tiering - Collect Heatstore for Offline Analysis

## Summary

Steps to collect the heat store database for offline investigation by Microsoft support.

## How to Capture Heatstore

1. **Disable and stop the Storage Sync Agent service (FileSyncSvc)**:
   ```
   sc config "filesyncsvc" start=disabled
   net stop filesyncsvc
   taskkill /f /im filesyncsvc.exe /t
   taskkill /f /im mmc.exe /t
   ```
   Or via Services.msc: Right-click Storage Sync Agent > Startup type: Disabled > Stop the service. Reboot if service won't stop.

2. **Access System Volume Information** using PsExec (runs as Local System):
   - Download psexec.exe from https://docs.microsoft.com/en-us/sysinternals/downloads/psexec
   - Copy to server (e.g., `C:\AFS\psexec.exe`)
   - Open elevated command prompt
   - Run: `c:\AFS\psexec.exe -i -s -d cmd`
   - New prompt runs as `nt authority\system`

3. **Copy heatstore databases** for each volume with a Server Endpoint:
   - Navigate to `<VolumeDriveLetter>:\System Volume Information`
   - If `HFS\HeatStore\DB` directory exists:
     ```
     Mkdir C:\AFS\HeatStoreDB\<VolumeDriveLetter>
     copy <VolumeDriveLetter>:\System Volume Information\HFS\HeatStore\DB C:\AFS\HeatStoreDB
     ```
   - Create a zip file from the HFS and HeatStore directories

4. **Restart Storage Sync Agent**:
   - Services.msc > Right-click Storage Sync Agent > Startup type: Automatic > Start

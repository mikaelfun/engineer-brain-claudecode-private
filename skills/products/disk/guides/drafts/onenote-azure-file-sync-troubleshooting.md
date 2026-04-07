# Azure File Sync (AFS) Troubleshooting Guide

> Source: OneNote — Mooncake POD Support Notebook/STORAGE/Azure File Sync
> Status: draft (pending SYNTHESIZE review)

## Initial Sync Process (5 Stages)

1. **Initial Cloud Enumeration**
2. **"Fast DR" Download sync session** — requires stage 1 complete
3. **Initial Server enumeration** — requires stage 2 complete
4. **"Initial upload" Sync Session** — starts concurrently with stage 3
5. **Incremental Sync**

### Sync Session Types (in logs)

| Type | Direction | Description |
|------|-----------|-------------|
| FullGhostedSync | Download only | FastDR (initial download) |
| InitialUploadSync | Upload only | First upload(s) scenario |
| RegularSync | Upload/Download | Typical sync sessions |
| SnapshotSync | Upload only | Daily sync from VSS snapshot |

## Jarvis Telemetry Queries

| Event | Jarvis Link | Table | Notes |
|-------|-------------|-------|-------|
| 9102 - Sync Complete | [jarvis-west/9299C85D](https://jarvis-west.dc.ad.msft.net/9299C85D) | ServerTelemetryEvents | ServerID = server endpoint cloud identity; Tombstone = deleted |
| 9302 - Sync Progress | [jarvis-west/E3F58436](https://jarvis-west.dc.ad.msft.net/E3F58436) | ServerTelemetryEvents | Portal/ASC sync progress display |
| Cloud Change Detection | [jarvis-west/73849751](https://jarvis-west.dc.ad.msft.net/73849751) | AFSCloudChangeDetectionTaskInfo | |
| Cloud Change Enum Progress | [jarvis-west/D8DCD17F](https://jarvis-west.dc.ad.msft.net/D8DCD17F) | SyncChangeEnumerationProgress | |
| 9133 - Server Change Enum | [jarvis-west/B9BC37B7](https://jarvis-west.dc.ad.msft.net/B9BC37B7) | ServerTelemetryEvents | Related: 9125 (start), 9100 (complete) |
| Correlation→ShareID lookup | [jarvis-west/E0E96C4](https://jarvis-west.dc.ad.msft.net/E0E96C4) | CounterWebRequestInfo | ShareID = sync group cloud identity |

> xportal 日志在 `FileFrontEndSummary` 中，不全，只有 fail 部分: [jarvis link](https://jarvis-west.dc.ad.msft.net/69DE196C)
> - CreateDirectory & CreateFile & PutRange → writes metadata
> - RenameFile → creates folder and file

## Diagnostic Commands

```powershell
# Load module
Import-Module "C:\Program Files\Azure\StorageSyncAgent\StorageSync.Management.ServerCmdlets.dll"

# General diagnostics
Debug-StorageSyncServer -Diagnose

# Network connectivity test
Debug-StorageSyncServer -TestNetworkConnectivity

# Per-file sync errors report
Debug-StorageSyncServer -FileSyncErrorsReport

# Full diagnostic trace (verbose)
Debug-StorageSyncServer -AFSDiag -OutputDirectory C:\output -KernelModeTraceLevel Verbose -UserModeTraceLevel Verbose
```

## Compatibility Check (Planning)

```powershell
$validation = Invoke-AzStorageSyncCompatibilityCheck C:\DATA
$validation.Results | Select-Object -Property Type, Path, Level, Description, Result | Export-Csv -Path C:\results.csv -Encoding utf8
```

## Performance Benchmarks (500K files, 490GB, 8CPU/32G VM, SSD 512GB)

| Metric | Azcopy | Robocopy | FileSync |
|--------|--------|----------|----------|
| Time | 4h | 2.5h | — |
| Parameters | 30 workers, 30G buffer | 128 threads | — |
| Directories Total | 670,578 | 4,392,417 | — |
| Directories/Hour | 167,644 | 1,756,966 | — |
| Files Total | 30,558 (starts after 2h) | 0 | — |
| Files/Hour | 15,279 | 0 | — |
| CPU | 80% | 15% | — |
| Memory | 3GB → 20GB | 4GB | — |
| Disk IOPS | 500 | 750 | — |
| Disk Bandwidth | 2.4 Mbps | 4.0 Mbps | — |
| Network (per 5min) | 17MB → 117MB | 700MB | — |

> Robocopy significantly faster for directory creation; Azcopy better for file upload but consumes much more memory.

## Key References

- [Planning for AFS deployment](https://learn.microsoft.com/en-us/azure/storage/file-sync/file-sync-planning)
- [AFS Release notes](https://learn.microsoft.com/en-us/azure/storage/file-sync/file-sync-release-notes)
- [Scale targets](https://learn.microsoft.com/en-us/azure/storage/files/storage-files-scale-targets#azure-file-sync-scale-targets)
- [Troubleshoot AFS](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-storage/files/file-sync/file-sync-troubleshoot)
- ADO Wiki: [Azure Files Sync - Overview](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/519404/Azure-Files-Sync)
- ADO Wiki: [TSG 349 AFS Sync Progress](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/784054/TSG-349-AFS-Sync-Progress-and-Initial-Sync_Storage)
- XSync TSG: [eng.ms/docs/.../tsgs/tsgtemplate](https://eng.ms/docs/cloud-ai-platform/azure-core/azure-storage/azure-file-storage/xsync/storage-xsync-documentation/tsgs/tsgtemplate)

---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files Sync/TSGs/TSG AFS Cloud Tiering Dump heat store data_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Azure%20Files%20Sync/TSGs/TSG%20AFS%20Cloud%20Tiering%20Dump%20heat%20store%20data_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Azure-Files-Sync
- cw.TSG
---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::
 

[[_TOC_]]

:warning: <span style="color:red">**This TSG contains steps to delete AFS databases. Backup existing directories before and apply caution when performing these steps.**</span>  

# Summary 

This TSG mentions steps to dump heatstore data.


# Steps

Files are tiered based on last access time. The last access time is calculated and tracked by storagesync filter. This is then recorded into heat store.

Tiering queries the heatstore and gets records based on index. Currently we have following indexes

  - LastAccessTimeWithSyncAndTieringOrder = 1
  - HeatHistory
  - Epoch
  - FileId
  - SyncGid
  - InverseHeatHistory
  - HeatHistoryWithSyncAndTieringOrder
  - AscendingEpoch
  - LastAccessTimeWithSyncAndTieringOrderV2
  - InverseHeatHistoryV2

#### Get heat of particular file
 
```
Import-Module "C:\Program Files\Azure\StorageSyncAgent\StorageSync.Management.ServerCmdlets.dll"
Get-StorageSyncHeatStoreInformation -FilePath "D:\Data\dir_1_1\dir_2_1\file_1.txt"
```

#### Get the order of files in which files will be tiered using date policy

Get heat store information (.CSV) and manually look at the output
 
```
Import-Module "C:\Program Files\Azure\StorageSyncAgent\StorageSync.Management.ServerCmdlets.dll"
Get-StorageSyncHeatStoreInformation -VolumePath <vol:> -ReportDirectoryPath c:\temp -IndexName LastAccessTimeWithSyncAndTieringOrderV2 -Verbose
```

#### Get the order of files in which files will be tiered using volume policy

```
Import-Module "C:\Program Files\Azure\StorageSyncAgent\StorageSync.Management.ServerCmdlets.dll"
Get-StorageSyncHeatStoreInformation -VolumePath <vol:> -ReportDirectoryPath c:\temp -IndexName HeatHistoryWithSyncAndTieringOrder -Verbose

Get-StorageSyncHeatStoreInformation -VolumePath <vol:> -ReportDirectoryPath c:\temp -IndexName InverseHeatHistoryV2 -Verbose
```

**Columns**


| Column                    | Description                                                                                                                                                                                                 |
| -------------------       | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------  |
| FileId                    | NTFS file id specific to volume                                                                                                                                                                             |
| FileIdHex                 | HEX value of NTFS file id                                                                                                                                                                                   |
| FileName                  | Name of the file                                                                                                                                                                                            |
| LastAccessTime            | The last time the file was accessed. This is tracked by our filter and not to get confused with the Last Modified or Accessed time shown in explorer. (This is long long value not readable until converted)|
| LastAccessTimeUTCString   | The last time the file was accessed in UTC. This is tracked by our filter and not to get confused with the Last Modified or Accessed time shown in explorer.                                                |
| HeatHistory               | This  heat of the file to understand how often the file is accessed. More the file is accessed higher the heat. Helps the system to take decision on which file to tier first                               |
| Epoch                     | Epoch of the nightly maintenance run. Every night maintenance task runs and updates the epoch, tiering engine processes files having highest epoch.                                                         |
| Metadata                  | AFS internal metadata to understand which server endpoint the file belongs to, since the heat store is per volume.                                                                                          |
| SyncGid                   | Unique ID of a file for syncing                                                                                                                                                                             |
| SyncState                 | Indicates if a file has been synced                                                                                                                                                                         |
| GhostingState             | Tiering state i.e. indicates if a file is tiered or not                                                                                                                                                     |
| TotalGhostingCount        | How many times a file was tiered                                                                                                                                                                            |
| GhostingReason            | reason for tiering e.g. tiered via cmdlet, tiered because of space policy, tiered due to date policy                                                                                                        |
| MeanTimeToGhost           | Mean to tier a file (For Future use)                                                                                                                                                                        |
| LastGhostingTime          | Last time the file was tiered (This is long long value not readable until converted)                                                                                                                        |
| LastGhostingTimeUTCString | Last time the file was tiered in readable form in UTC                                                                                                                                                       |
| CacheHitKiloBytes         | How much data for the file was present on disk when a read was performed                                                                                                                                    |
| CacheMissKiloBytes        | Number of bytes that had to be read from the cloud                                                                                                                                                          |
| CacheMissCounter          | How many times the file data had been read from cloud (For Future use)                                                                                                                                      |
| CacheHitCounter           | How many times the file data had been read from disk (For Future use)                                                                                                                                       |
| PhysicalSizeBytes         | Size of file on disk. A fully tiered file will have this as 0, whereas partially tiered file will have some value here.                                                                                     |
| LogicalSizeBytes          | Actual size of file                                                                                                                                                                                         |
| ReparseTag                | This is the reparsetag (https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-fscc/c8e77b37-3909-4fe6-a4ea-2b9d423b1ee4)                                                                          |


::: template /.templates/Processes/Knowledge-Management/Azure-Files-Sync-Feedback-Template.md
:::

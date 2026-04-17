---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files Sync/TSGs/TSG AFS Heat Store_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Azure%20Files%20Sync/TSGs/TSG%20AFS%20Heat%20Store_Storage"
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


#Summary

Heat store is an important component of tiering. Tiering uses the heat store to query for files. If this is not updated properly then tiering wont work. Heat store is a DB which is maintained by AFS and has indexes. Every component queries heat store accordingly and gets the records.  

Ghosting queries the heat store and gets the files that needs to be ghosted. Ghosting queries the heat store based on indexes (SpacePolicy and DatePolicy have different indexes).  
While quiring for SpacePolicy files it stops as soon as it gets a ghosted file.  
For DatePolicy it stops as soon as it gets a file greater than the expected date.

The advantage of using heat store is it has heat information i.e. how often a file accessed. If the file is accessed frequently the heat of the file would be high and we would not tier it.  

The heat store is fed data by:
<ol>
	<li> Maintenance task runs every 24 hrs (inserts file > min file size)
	<li> Sync notifications (when ever file is synced)
	<li> Ghosting engine (Marks file as ghosted)
	<li> Recall (Marks file as untiered)
	<li> Heat tracking
</ol>

# Investigation

Heat store is usually accessed through updater hub. All components access updater hub to update records in heat store.

To check why there are not enough files in heat store, we must see if there was any problem with insertions into heat store.
<ol>
<li> Check if maintenance task is processing records . This happens every 24 hrs. We get the following Telemetry events to see if we have appropriately ghosted files and the system is in a stable state.  

```
9030 - ECSSVC_EVENT_TELEMETRY_SERVER_BOTTOMLESS_HEATSTORE_MAINTVOLSHARE_START
9031 - ECSSVC_EVENT_TELEMETRY_SERVER_BOTTOMLESS_HEATSTORE_MAINTVOLSHARE_END
9032 - ECSSVC_EVENT_TELEMETRY_SERVER_BOTTOMLESS_HEATSTORE_MAINTVOL_END
9035 - ECSSVC_EVENT_TELEMETRY_SERVER_BOTTOMLESS_HEATSTORE_MAINTVOL_START
```


In Telemetry event 9032, Total files = Files AddOrUpdate + NumberofSmallFilesLessThanGhostedSizeSkipped.
This approximately (maintenance might add files which are excluded by sync) should match with the sync event 9102 NamespaceFileCount. This implies that maintenance task has queued up all the valid files to the heat store.  

  
Event ID 9102  
  
<mark style="background-color: lightgrey"> <i>
Replica Sync session completed. ServerEndpointName: fc9842b2-a583-408f-xxxx-f1ac2a607470, ReplicaName: [<GenericShareReplica>], PlatformFlags: 0, SyncGroupName: AFS_Build_SyncGroup7. SyncScenario: RegularSync, SyncDirection: Upload, IsReconcile: false, SyncSessionFlags: 3. HResult: 0, DurationSeconds: 1, CorrelationId: {91EE88D2-EACC-4894-BF92-269FF24938B1}. SyncFileCount: 0, SyncDirectoryCount: 0, SyncTombstoneCount: 0, SyncSizeBytes: 0. AppliedFileCount: 0, AppliedDirCount: 0, AppliedTombstoneCount 0, AppliedSizeBytes: 0. <mark style="background-color: #FFFF8F">NamespaceFileCount: 2056794</mark>, NamespaceDirCount: 334553, NamespaceTombstoneCount: 183472, NamespaceSizeBytes: 1557640554178. PerItemErrorCount: 0, BatchCount: 1. SyncKnowledgeVectorCount: 1, SyncKnowledgeSizeBytes: 513, ForgottenKnowledgeSizeBytes: 513. DataTransfer: 0 MBps, Throughput: 0 MBps. PutSyncKnowledgeDuration: 0 ms, GetChangeBatchDuration: 0 ms, DownloadSyncBatchDataDuration: 0 ms. PrepareSyncBatchDataDuration: 109 ms, UploadSyncBatchDataDuration: 0 ms, PutChangeBatchDuration: 546 ms. OtherOperationsDuration: 0 ms. TransferredFiles: 0, TransferredBytes: 0, FailedToTransferFiles: 0, FailedToTransferBytes: 0, FilesFoundInSeededShare: 0, BytesFoundInSeededShare: 0. IsAbandonedStagingAreaMeasured: false, AbandonedStagingAreaSize: 0. TransferredModifiedGhostedFiles: 0, PartiallyTransferredFiles: 0. WaitingForPutChangeBatchDuration: 0 ms, LastPutChangeBatchDuration: 546 ms. UploadPersistentErrors: 0, DownloadPersistentErrors: 0 <br>
</i>
</mark>
<br>
Event ID 9032  
  
<mark style="background-color: lightgrey"> <i>
Heatstore maintenance finished on Volume:{A40341DF-08F8-4B33-XXXX-74CD87991F1F} for ShareId:{C8C56E77-96A3-477F-BEAC-3BE988E9637A} (Path:\\?\D:\AFS_Share\folder7), HRESULT: 0, Run skipped due to early time trigger:False, TimeTaken(sec): 2084, <mark style="background-color: #FFFF8F">Files AddOrUpdate: 774766</mark>, Files Failed: 0, Files Deleted: 0, <mark style="background-color: #FFFF8F">Total Number of files in share: 2056797, NumberofSmallFilesLessThanGhostedSizeSkipped:1282031</mark> NumberofSystemFilesSkipped:0, NextRunTime (UTC):1/9/2019 3:34:12 PM
</i>
</mark>
<br>
</br>
e.g. https://jarvis-west.dc.ad.msft.net/D4B9C6CE 
    
<li> Check that the file counts are almost same with Telemetry event ID 9102 around the time heatstore maintenance task was running
  
**NOTE**: There might be some discrepancy.

<mark style="background-color: lightgrey"> <i>
    Replica Sync session completed.
    ServerEndpointName: fastdr_download, ReplicaName: [<GenericShareReplica>], PlatformFlags: 17, SyncGroupName: SG_fastdr_12.
    <mark style="background-color: #FFFF8F">SyncScenario: FullGhostedSync</mark>, SyncDirection: Download, IsReconcile: false, SyncSessionFlags: 4103.
    HResult: 0, <mark style="background-color: #FFFF8F">DurationSeconds: 337</mark>, CorrelationId: {7A01E796-AA49-48E4-XXXX-B8503231551C}.
    <mark style="background-color: #FFFF8F">SyncFileCount: 100000</mark>, SyncDirectoryCount: 2, SyncTombstoneCount: 0, SyncSizeBytes: 6553700000.
    <mark style="background-color: #FFFF8F">AppliedFileCount: 100000</mark>, AppliedDirCount: 2, AppliedTombstoneCount 0, AppliedSizeBytes: 6553700000.
    NamespaceFileCount: 100000, NamespaceDirCount: 1, NamespaceTombstoneCount: 0, NamespaceSizeBytes: 6553700000.
    PerItemErrorCount: 0, BatchCount: 101.
    SyncKnowledgeVectorCount: 1, SyncKnowledgeSizeBytes: 205, ForgottenKnowledgeSizeBytes: 0.
    DataTransfer: 0 MBps, Throughput: 0 MBps.
    PutSyncKnowledgeDuration: 2858 ms, GetChangeBatchDuration: 49870 ms, DownloadSyncBatchDataDuration: 159580 ms.
    PrepareSyncBatchDataDuration: 0 ms, UploadSyncBatchDataDuration: 0 ms, PutChangeBatchDuration: 0 ms.
    OtherOperationsDuration: 124739 ms.
    TransferredFiles: 0, TransferredBytes: 0, FailedToTransferFiles: 0, FailedToTransferBytes: 0, FilesFoundInSeededShare: 0, BytesFoundInSeededShare: 0.
    IsAbandonedStagingAreaMeasured: true, AbandonedStagingAreaSize: 0.
    TransferredModifiedGhostedFiles: 0, PartiallyTransferredFiles: 0.
    WaitingForPutChangeBatchDuration: 0 ms, LastPutChangeBatchDuration: 0 ms.
    UploadPersistentErrors: 0, DownloadPersistentErrors: 0. FilesTransferedAcrossSessions: 0.
    </i>
</mark>
    
<li> Check if files are actually getting inserted into heat store by the updater and if there are any errors during insertions.
If there are a lot of failures around the time frame 9032 was fired, then it means that the heat store does not contain all the records.
In this case we can either wait for 24 hrs and see they get ghosted or run PS cmdlet Invoke-StorageSyncCloudTiering (Note: This will tier files in random order)</li>
  
```
9050 ECSSVC_EVENT_TELEMETRY_UPDATEHUB_STATS
9051 ECSSVC_EVENT_TELEMETRY_UPDATEHUB_FAILUREDISTRIBUTION
9052 ECSSVC_EVENT_TELEMETRY_UPDATEHUB_FLUSHFAILED
9053 ECSSVC_EVENT_TELEMETRY_UPDATEHUB_ENTER_LOCKDOWN
9054 ECSSVC_EVENT_TELEMETRY_UPDATEHUB_EXIT_LOCKDOWN
```    
Example events:
  
<mark style="background-color: lightgrey"> <i>
HeatStore queue failure distribution for VolumeGuid: {A40341DF-08F8-4B33-XXXX-74CD87991F1F}, Operation: Process. HResult: 0x80c80261 - Cannot ghost file as the size is less than supported file size. , Failure count : 4748
</i>
</mark>

<mark style="background-color: lightgrey"> <i>
HeatStore queue commit failed for VolumeGuid: {A40341DF-08F8-4B33-XXXX-74CD87991F1F}. RequestCount: 19. HResult: 0x80070490 - Element not found.
</i>
</mark>

<mark style="background-color: lightgrey"> <i>
HeatStore queue stats for VolumeGuid: {A40341DF-08F8-4B33-XXXX-74CD87991F1F}. TotalRequestCount: 103552, SubmittedCountFromSync: 0, SubmittedCountFromHeatTracking: 10, SubmittedCountFromGhosting: 41200, SubmittedCountFromHeatStoreMaintenance: 62342. SubmitFailedCount: 0. TotalProcessedCount: 103674, TotalProcessFailedCount: 0. TotalCommitCount: 103674, TotalCommitFailureCount: 0
</i>
</mark>

e.g. https://jarvis-west.dc.ad.msft.net/1C7AED58 
    

Other HeatStore events:

	9022 - ECSSVC_EVENT_TELEMETRY_HEATSTORE_MIGRATIONTASK
	9021 - ECSSVC_EVENT_TELEMETRY_HEATSTORE_MIGRATED
	9063 - ECSSVC_EVENT_TELEMETRY_SERVER_BOTTOMLESS_HEATSTORE_INDEX_CREATED
	9011 - ECSSVC_EVENT_SERVER_BOTTOMLESS_HEATSTORE_TRANSACTIONINFO
	9012 - ECSSVC_EVENT_SERVER_BOTTOMLESS_HEATSTORE_FILECOUNT
    9013 - ECSSVC_EVENT_TELEMETRY_SERVER_BOTTOMLESS_HEATSTORE_CORRUPT

**NOTE**: pagefile.sys should not be on volume where AFS is configured.


::: template /.templates/Processes/Knowledge-Management/Azure-Files-Sync-Feedback-Template.md
:::

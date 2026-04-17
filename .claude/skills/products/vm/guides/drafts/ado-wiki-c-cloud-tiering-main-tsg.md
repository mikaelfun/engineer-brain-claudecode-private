---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files Sync/TSGs/TSG AFS Cloud Tiering_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Azure%20Files%20Sync/TSGs/TSG%20AFS%20Cloud%20Tiering_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Azure-Files-Sync
- cw.TSG
- cw.Reviewed-12-2025
---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::



[[_TOC_]]

:warning: <span style="color:red">**This TSG contains steps to modify the registry. Backup the existing registry and apply caution when performing these steps.**</span>

# Description

Troubleshooting Azure File Sync Cloud Tiering Issues

# Feature Overview

Learn about Cloud Tiering:  
- [Cloud Tiering Troubleshooting](https://docs.microsoft.com/en-us/azure/storage/files/storage-sync-files-troubleshoot?tabs=portal1%2Cazure-portal#cloud-tiering)  
- [Cloud Tiering Overview](https://docs.microsoft.com/en-us/azure/storage/files/storage-sync-cloud-tiering)

## Cloud Tiering

Cloud tiering is an optional feature of Azure File Sync that allows infrequently used or accessed files larger than 64 KiB to be tiered to Azure Files. When a file is tiered, the Azure File Sync file system filter (StorageSync.sys) replaces the file locally with a pointer, or reparse point. The reparse point represents a URL to the file in Azure Files. A tiered file has the "offline" attribute set in NTFS, enabling third-party applications to identify tiered files (Windows Explorer shows "APLO" in the Attributes column). When a user opens a tiered file, Azure File Sync seamlessly recalls the required file data range from Azure Files without the user needing to know that the file is not stored locally. This functionality is also known as Hierarchical Storage Management (HSM).

**Important:** Cloud tiering is not supported for server endpoints on Windows system volumes.

### Ways Files Can Be Tiered

1. **New Server Endpoint Creation**  
  When a server endpoint is created on a volume where tiering is enabled, files are initially brought down as tiered and later recalled based on the tiering policy in the background.

2. **Background Tiering**  
  - Tiering runs every hour for a maximum of 45 minutes.  
  - When both date and space policies are set on a server endpoint, the date policy runs first to tier files, followed by the volume policy if the space policy is still not met.  
  - For multiple server endpoints on a volume with different space policies, the effective volume free space threshold is the largest value specified across all server endpoints.  

  Learn more:  
  - [Tiering Frequency](https://docs.microsoft.com/en-us/azure/storage/files/storage-sync-cloud-tiering#ive-added-a-new-server-endpoint-how-long-until-my-files-on-this-server-tier)  
  - [Date and Space Policy Interaction](https://docs.microsoft.com/en-us/azure/storage/files/storage-sync-cloud-tiering#how-does-the-date-tiering-policy-work-in-conjunction-with-the-volume-free-space-tiering-policy)  
  - [Multiple Server Endpoints](https://docs.microsoft.com/en-us/azure/storage/files/storage-sync-cloud-tiering#how-is-volume-free-space-interpreted-when-i-have-multiple-server-endpoints-on-a-volume)

3. **On-Demand Tiering**  
  - This is done using PowerShell.  
  - It does not use the heatmap and tiers files by iterating through files on disk, ignoring the policy values set.

## Support Topics

Routing Azure Storage File:  
- **File Sync**  
  - Cloud Tiering or Recall

## Overview

There are two main paths for failures in cloud tiering:  

1. **Files Fail to Tier**  
  Azure File Sync unsuccessfully attempts to tier a file to Azure Files.

2. **Files Fail to Recall**  
  The Azure File Sync file system filter (StorageSync.sys) fails to download data when a user attempts to access a tiered file.

### Common Causes of Cloud Tiering Failures

#### Cloud Storage Failures
- **Transient Storage Service Availability Issues**  
  Refer to the [Service Level Agreement (SLA) for Azure Storage](https://azure.microsoft.com/support/legal/sla/storage/v1_2/).
- **Inaccessible Azure File Share**  
  This typically happens when the Azure file share is deleted while it is still a cloud endpoint in a sync group.
- **Inaccessible Storage Account**  
  This typically happens when the storage account is deleted while it still contains an Azure file share that is a cloud endpoint in a sync group.

#### Server Failures
- **Azure File Sync File System Filter Not Loaded**  
  The Azure File Sync file system filter (StorageSync.sys) must be loaded at all times for Azure File Sync to function properly. The filter may be unloaded manually by an administrator.
- **Missing, Corrupt, or Broken Reparse Point**  
  A reparse point consists of:
  - A reparse tag, indicating that the Azure File Sync file system filter may need to act on IO to the file.
  - Reparse data, indicating the URI of the file on the associated cloud endpoint (Azure file share).  
  Corruption may occur if an administrator modifies the tag or its data.
- **Network Connectivity Issues**  
  The server must have internet connectivity to tier or recall a file.

The following sections provide steps to troubleshoot cloud tiering issues and determine whether the issue is related to cloud storage or the server.

<div></div>

# Troubleshooting


> :exclamation: IMPORTANT WARNING:  
> **Don't attempt to troubleshoot issues with sync, cloud tiering, or any other aspect of Azure File Sync by unregistering and registering a server, or removing and recreating the server endpoints unless explicitly instructed to by a Microsoft engineer.** Unregistering a server and removing server endpoints is a **<font color=red>destructive operation</font>**, and tiered files on the volumes with server endpoints will not be "reconnected" to their locations on the Azure file share after the registered server and server endpoints are recreated, which will result in sync errors. Tiered files that exist outside of a server endpoint namespace might be permanently lost. Tiered files might exist within server endpoints even if cloud tiering was never enabled.

### Impact of Un-Registration

<details close> 
<summary><font color=purple>Expand for details on impact of unregistering a server.</font></summary>
<br>
* Considered a ?big hammer? approach leading to cascading issues:

  * SEPs de-provisioned.
  * Tiered files orphaned/broken.
  * Re-creation of SEPs delayed until Orphaned Files Cleanup completes (time depends on namespace file count).

**Action Required** 

1. If customer attempted this before contacting CSS:
   * Capture details early (server unregistered or SEP de-provisioned) for PG team investigation.

</details>
<br>

## Understanding the Issue and Customer Environment

### Get Cloud Tiering Policies and Current Free Space Levels, Quota, and Minimum File Size

Information about the cloud tiering policy for a customer's server endpoint can be obtained as follows:

- **Option 1: Using ASC**  
  ![Tiering Configuration from ASC](/.attachments/SME-Topics/Azure-Files-Sync/tiering-config-from-asc.png)

- **Option 2: From Server Telemetry**  

  Server Telemetry Event ID: **9001**  

  Example Event 9001:  
  <mark style="background-color: #C2FFFF">Ghosting Configuration for <mark style="background-color: #FFFF8F">ServerEndpointName</mark>:d5855099-XXXX-XXXX-XXXX-ec608c57d3c2, VolumeGuid:{035A75ED-00F1-11E7-80E5-0050569166BC}, <mark style="background-color: #FFFF8F">VolumeCapacityGB:1024</mark>, <mark style="background-color: #FFFF8F">CurrentFreeSpacePercentage</mark>:97, <mark style="background-color: #FFFF8F">IsTieringEnabled</mark>:true, <mark style="background-color: #FFFF8F">GhostingSpaceThresholdPercentage</mark>:20, <mark style="background-color: #FFFF8F">GhostingFilesOlderThanDays</mark>:30, <mark style="background-color: #FFFF8F">GhostingFileSizeLimitKB</mark>:8, IsQuotaConfigured:false, PercentQuotaUsed:-1, QuotaLimitGB:-1, GhostingTransactionPulseInSecs:2700, ServerDataPath: \\?\N:\, SyncGroupName: groupname, <mark style="background-color: #FFFF8F">VolumeClusterSizeInBytes</mark>: 4096</mark>

  - **GhostingSpaceThresholdPercentage**: This is the volume free space policy percentage.  
  - **GhostingFilesOlderThanDays**: This is the date policy days value (0 means date policy is disabled).

  **Using Kusto to Split Event 9001:**

  ```k
  cluster("xfiles.westcentralus.kusto.windows.net").database("xsynctelemetrysf").ServerTelemetryEvents
  | where PreciseTimeStamp > ago(3h)
  | where SubscriptionId contains "{SubscriptionId}" // POPULATE WITH SUBID
  | where ServerId contains "DD6EEC82-XXXX-XXXX-XXXX-75C08BF6007F" // POPULATE WITH SERVERID
  | where ServerEventId in (9001)
  | extend ServerEndpointName = extract("ServerEndpointName:([0-9a-z-]+),", 1, EventDescription)
  | extend VolumeGuid=extract("VolumeGuid:([a-zA-Z0-9-{}]+)", 1, EventDescription)
  | extend VolumeCapacityGB=extract("VolumeCapacityGB:([0-9]+)", 1, EventDescription)
  | extend CurrentFreeSpacePercentage=extract("CurrentFreeSpacePercentage:([0-9]+)", 1, EventDescription)
  | extend GhostingFilesOlderThanDays=extract("GhostingFilesOlderThanDays:([0-9]+)", 1, EventDescription)
  | extend GhostingSpaceThresholdPercentage=extract("GhostingSpaceThresholdPercentage:([0-9]+)", 1, EventDescription)
  | extend GhostingFileSizeLimitKB=extract("GhostingFileSizeLimitKB:([0-9]+)", 1, EventDescription)
  | extend IsTieringEnabled=extract("IsTieringEnabled:([a-z]+)", 1, EventDescription)
  | extend IsQuotaConfigured=extract("IsQuotaConfigured:([a-z]+)", 1, EventDescription)
  | extend PercentQuotaUsed=extract("PercentQuotaUsed:([0-9-]+)", 1, EventDescription)
  | extend QuotaLimitGB=extract("QuotaLimitGB:([0-9-]+)", 1, EventDescription)
  | extend GhostingTransactionPulseInSecs=extract("GhostingTransactionPulseInSecs:([0-9]+)", 1, EventDescription)
  | extend VolumeClusterSizeInBytes=extract("VolumeClusterSizeInBytes: ([0-9]+)", 1, EventDescription)
  | extend SyncGroupName = extract("SyncGroupName: ([A-Za-z0-9-_]+)", 1, EventDescription)
  | extend ServerDataPath=extract("ServerDataPath: ([\\\\?\\][a-zA-Z:\\][a-zA-Z0-9\\_ ]+)", 1, EventDescription)
  | project PreciseTimeStamp, ClientTimeStamp, ServerDataPath, ServerEndpointName, SyncGroupName, IsTieringEnabled, GhostingSpaceThresholdPercentage, GhostingFilesOlderThanDays, CurrentFreeSpacePercentage, AgentVersion, GhostingFileSizeLimitKB, GhostingTransactionPulseInSecs, VolumeCapacityGB, VolumeGuid, VolumeClusterSizeInBytes
  | order by PreciseTimeStamp desc
  ```

### Is Tiering Working at All?

#### Check if Hourly Tiering is Getting Scheduled

Use Event ID **9043** to determine if tiering is scheduled. The message body provides a reason if tiering is not scheduled. This event occurs every hour, regardless of whether tiering is scheduled.

- **Policy Already Met**:  
  If the volume policy is already met, tiering won't be scheduled. For example:

  ```k
  cluster("xfiles.westcentralus.kusto.windows.net").database("synctelemetrysf").ServerTelemetryEvents
  | where PreciseTimeStamp > ago(10d)
  | where ServerEventId == 9043
  | where ServerId == "EDF9F232-XXXX-XXXX-XXXX-B4270CB02143"
  ```

  Example Event Description:  
  <mark style="background-color: #C2FFFF">
  Ghosting share skipped information - SessionID: SessionNotScheduled, ThreadID: 1104, VolumeGuid: {70F1234E-04B5-49E2-A2AE-FE39D0E2A31E}, ServerId: EDF9F232-XXXX-XXXX-XXXX-B4270CB02143, ServerEndpoint: 79cbcec2-XXXX-XXXX-XXXX-397ac5271bd8, <mark style="background-color: #FFFF8F">Reason for skipping: Ghosting not scheduled</mark>. Meeting tiering policy, HResult: 0, SyncGroup: euscapprodstorageprem-repldata-sg, ServerDataPath: \\?\e:\replicateddata
  </mark>

- **Tiering Not Scheduled During Reconciliation Sync**:  
  In these cases, the reason for skipping would be: **Replica not ready**.

  ```k
  cluster("xfiles.westcentralus.kusto.windows.net").database("xsynctelemetrysf").ServerTelemetryEvents
  | where PreciseTimeStamp > ago(30d)
  | where ServerEventId == 9043
  | where ServerId == "CEC62306-XXXX-XXXX-XXXX-1D9DC3C811EC"
  | where EventDescription contains "Replica not ready"
  ```

- **Volume-Policy Tiering Not Scheduled During Initial Upload Sync**:  
  In these cases, the reason for skipping would be: **Initial Upload Pending**.

  ```k
  cluster("xfiles.westcentralus.kusto.windows.net").database("xsynctelemetrysf").ServerTelemetryEvents
  | where PreciseTimeStamp > ago(10d)
  | where ServerEventId == 9043
  | where ServerId == "FE786014-XXXX-XXXX-XXXX-BF4AEEA73506"
  | where EventDescription contains "Initial"
  ```

  **Note**: Date-policy-based tiering will still work when initial upload sync is ongoing.

**Step-by-Step Process**:  
1. Review the **9043** history:  
  - If it shows failures, identify the cause and check if sync was healthy during that time using Event ID **9102**.  
2. Compare file counts in **9004** and **9102**:  
  - If counts are low in **9102**, investigate sync issues.  
  - If counts are low in **9004**, investigate heat store maintenance.  

### How to Check if Tiering is Making Progress Each Hour

Tiering runs every hour on volumes **where cloud tiering is turned ON.**  
Whenever tiering runs, the following events will be logged. These events include the duration for which tiering has run (it runs for a maximum of 45 minutes):  

- **9029**: Endpoint-level tiering event logged every hour.  
- **9016**: Volume-level tiering event logged every hour when tiering occurs.  

**Note**: If tiering is run using the cmdlet, events may be recorded more than once. Event **9029** indicates the PowerShell session in the field **IsPowershell: True**.

:warning: <span style="color:red">These are server-level settings. Please recommend them with caution.</span>

**To increase the frequency of ghosting from once every 60 minutes:**  
```bash
reg ADD "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Azure\StorageSync" /v PerformGhostingTimeIntervalSecs /t REG_DWORD /d 7200 /f
```

**Starting with version 13.1**, if the above registry key is provided, you should also set the following registry key to ensure ghosting makes progress:  
```bash
reg ADD "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Azure\StorageSync" /v GhostingQueueStaleEntryThresholdCount /t REG_DWORD /d 20 /f
```

#### Example Event 9029:  
<mark style="background-color: #C2FFFF">Ghosting SyncFolder Session: Ghosting session information: FileIteratorType: HEATSTORE_ITERATOR, SessionID: {15DD57E1-1D14-4E8D-AF8B-2F48A9D5AC39}, ThreadID: 5524, VolumeId: {36F6393C-BA53-4044-A406-B962D9C31CC4}, <mark style="background-color: #FFFF8F">Number of files attempted in the session</mark>: 45, <mark style="background-color: #FFFF8F">Number of files tiered in the session</mark>: 44, Number of files already tiered: 0, <mark style="background-color: #FFFF8F">DurationSeconds</mark>: 3, Server Id: BEDAA587-XXXX-XXXX-XXXX-02FB27845C30, ServerEndpointName: 6a2241d2-XXXX-XXXX-XXXX-d601f848b8da, Space Reclaimed (MB): 11.56825, <mark style="background-color: #FFFF8F">IsPowershell</mark>: False, RecordCountDroppedDueToNotSynced: 0, RecordCountDroppedDueToGhosted: 0, RecordCountDroppedDueToInvalidCloudEndpointId: 0, HeatHistoryFirstFile: 132291095294641576, LastAccessTimeFirstFile: 3/19/2020 9:38:49 AM, MeanTimeToGhostFirstFile: 0, HeatHistoryLastFile: 132291129097298427, LastAccessTimeLastFile: 3/19/2020 10:35:09 AM, MeanTimeToGhostLastFile: 0, NumberOfDedupFilesMigrated: 0, EstimatedSpaceReclaimedFromDedupFiles: 0 MB, SyncGroupName: SG_TSImages, <mark style="background-color: #FFFF8F">PolicyType</mark>: DATEPOLICY, Share-level ghosting result: 0, Heatstore index used: LastAccessTimeWithSyncTieringOrderAndMetadata</mark>

#### Example Event 9016:  
<mark style="background-color: #C2FFFF">Ghosting Volume Session: SessionID: {34C27C99-69B2-46C3-BA20-1FD12AFBDB0F}, ThreadID: 38080 - Ghosting completed on volume: {4F7DC7AD-0000-0000-0000-100000000000} (Free space percent is: 25, Min free space percentage to start: 20, Max free space percent to stop: 25, Space recovered in MB: 0, <mark style="background-color: #FFFF8F">Number of server endpoints processed</mark>: 3, Number of server endpoints skipped: 0, Number of files ghosted in session: 0, Number of files failed to ghost: 0, Number of files skipped by size or already ghosted: 79, Number of files skipped by age: 0, Number of files skipped due to unsupported reparse point: 0, Number of dedup reparse points skipped: 0, Number of files failed to ghost due to stable version failure: 0, Number of files iterated: 82, FileIteratorType: HEATSTORE_ITERATOR, <mark style="background-color: #FFFF8F">DurationSeconds</mark>: 31, Policy Type: DATEPOLICY, Volume Dedup Enabled: false, Performed Dedup GC: false, Last Dedup GC Result: 0, Time spent on Dedup GC: 0 seconds)</mark>

#### Kusto Queries to Obtain Events 9029 and 9016:

**Query for Event 9029**:  
```k
cluster("xfiles.westcentralus.kusto.windows.net").database("xsynctelemetrysf").ServerTelemetryEvents
| where PreciseTimeStamp > ago(1h)
| where ServerId contains "04F3C31E-XXXX"
| where ServerEventId in (9029)
| order by PreciseTimeStamp desc
| project ClientTimeStamp, ServerEventId, EventDescription, AgentVersion
```

**Query for Event 9016**:  
```k
cluster("xfiles.westcentralus.kusto.windows.net").database("xsynctelemetrysf").ServerTelemetryEvents
| where PreciseTimeStamp > ago(1h)
//| where ServerId contains "04F3C31E-XXXX"
| where ServerEventId in (9016)
| order by PreciseTimeStamp desc
| project ClientTimeStamp, ServerEventId, EventDescription, AgentVersion
```

### How to Check if Heatstore is Corrupted

Refer to [TSG AFS Cloud Tiering Identify a Corrupt Heatstore](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/863882).

### Determine Which Policy is Not Working: Volume Policy or Date Policy

- If the free space percentage of the volume is less than expected by the policy, investigate the **volume policy**.  
- If files accessed older than the policy days are not tiered, investigate the **date policy**.  

## Investigating Cloud Tiering Volume Policy

### Check if Volume Policy is Met

When there is more than one server endpoint on a volume, the effective volume free space threshold is the largest volume free space specified across any server endpoint on that volume. Files will be tiered according to their usage patterns regardless of which server endpoint they belong to.  

For example, if you have two server endpoints on a volume, Endpoint1 and Endpoint2, where Endpoint1 has a volume free space threshold of 25% and Endpoint2 has a volume free space threshold of 50%, the volume free space threshold for both server endpoints will be 50%.

#### Methods to Check Volume Policy:

1. **Event 9043**:  
  If the volume policy is configured on an endpoint, an hourly **9043** event will be fired for the volume where the server endpoint is present.  
  ```k
  cluster("xfiles.westcentralus.kusto.windows.net").database("xsynctelemetrysf").ServerTelemetryEvents
  | where PreciseTimeStamp >= ago(1d)
  | where ServerId == "09C26113-XXXX-XXXX-XXXX-0953765BE386"
  | where ServerEventId == 9043
  | project PreciseTimeStamp, AgentVersion, EventDescription
  ```
  Example:  
  <mark style="background-color: #C2FFFF">Ghosting share skipped information - SessionID: SessionNotScheduled, ThreadID: 3500, VolumeGuid: {2034B422-04DC-471C-AB04-1B5AC1F02868}, ServerId: 3215751A-XXXX-XXXX-XXXX-3C8E20C06B4D, ServerEndpoint: 990b7139-XXXX-XXXX-XXXX-d771d3e9ea4b, <mark style="background-color: #FFFF8F">Reason for skipping</mark>: Ghosting not scheduled. Meeting tiering policy, HResult: 0, SyncGroup: SG-Operations, ServerDataPath: \\?\E:\FS-Root\Operations</mark>

2. **Ghosting Configuration Event (9004)**:  
  ```k
  cluster("xfiles.westcentralus.kusto.windows.net").database("xsynctelemetrysf").ServerTelemetryEvents
  | where PreciseTimeStamp >= ago(1d)
  | where ServerId == "09C26113-XXXX-XXXX-XXXX-0953765BE386"
  | where ServerEventId == 9004
  | project PreciseTimeStamp, AgentVersion, EventDescription
  ```
  Example:  
  <mark style="background-color: #C2FFFF">Ghosting Configuration for ServerEndpointName: d5855099-XXXX-XXXX-XXXX-ec608c57d3c2, VolumeGuid: {035A75ED-00F1-11E7-80E5-0050569166BC}, <mark style="background-color: #FFFF8F">VolumeCapacityGB: 1024</mark>, <mark style="background-color: #FFFF8F">CurrentFreeSpacePercentage</mark>: 97, <mark style="background-color: #FFFF8F">IsTieringEnabled</mark>: true, <mark style="background-color: #FFFF8F">GhostingSpaceThresholdPercentage</mark>: 20, GhostingFilesOlderThanDays: 30, GhostingFileSizeLimitKB: 8, IsQuotaConfigured: false, PercentQuotaUsed: -1, QuotaLimitGB: -1, GhostingTransactionPulseInSecs: 2700, ServerDataPath: \\?\N:\, SyncGroupName: groupname, VolumeClusterSizeInBytes: 4096</mark>

3. **Daily Event 9004**:  
  Since this event is logged daily, it cannot be relied upon completely but can provide useful insights.  
  ```k
  cluster("xfiles.westcentralus.kusto.windows.net").database("xsynctelemetrysf").ServerTelemetryEvents
  | where PreciseTimeStamp >= ago(1d)
  | where ServerId == "09C26113-XXXX-XXXX-XXXX-0953765BE386"
  | where ServerEventId == 9004
  | project PreciseTimeStamp, AgentVersion, EventDescription
  ```
  Example:  
  <mark style="background-color: #C2FFFF">Ghosting Daily Volume Policy SLA: VolumeGuid: {2ED6057B-965B-4EC9-B8AF-F95901731F1A}, Previous heat store maintenance run 86400 seconds ago, Volume Size (GB): 2999.982, <mark style="background-color: #FFFF8F">Number of Tiering enabled shares on volume</mark>: 1 (Maint. Skipped in this run: 1), Number of Tiering disabled shares on volume: 1 (Maint. Skipped in this run: 1), Total files under Tiering enabled shares: 0 (On-disk physical size (GB): 0, Logical size (GB): 0), Total tiered files under Tiering enabled shares: 0 (On-disk physical size (GB): 0, Logical size (GB): 0), Total files under Tiering disabled shares: 0 (On-disk physical size: (GB): 0, Logical size (GB): 0), Total tiered files under Tiering disabled shares: 0 (On-disk physical size (GB): 0, Logical size (GB): 0), Number of files skipped by tiering file size threshold: 0, Total size (GB): 0, Number of system files skipped for tiering: 0, Total size (GB): 0, Number of files not synced (or excluded by sync): 0, Total size (GB): 0, Total physical size (GB) not under tiering enabled shares: 1006.515, <mark style="background-color: #FFFF8F">Current volume free space percent: 66 (Effective Ghosting Policy: Volume Free Space % value: 20), Has Volume free space target met: true, Has Volume free space target met (excluding small, non-synced files)</mark>: true, Small files Physical Size GB: 0, System files Physical Size GB: 0, Non synced files Physical Size GB: 0, Dedup file count: 0, Logical Size GB: 0, Physical Size GB: 0, Unsupported RP file count: 0, Logical Size GB: 0, Physical Size GB: 0, Bytes Per Cluster: 4096</mark>

4. **Event 9016**:  
  If tiering is scheduled, **9016** also provides details.  
  ```k
  cluster("xfiles.westcentralus.kusto.windows.net").database("xsynctelemetrysf").ServerTelemetryEvents
  | where PreciseTimeStamp >= ago(1d)
  | where ServerId == "09C26113-XXXX-XXXX-XXXX-0953765BE386"
  | where ServerEventId == 9016
  | project PreciseTimeStamp, AgentVersion, EventDescription
  ```
  Example:  
  <mark style="background-color: #C2FFFF">Ghosting Volume Session: SessionID: {D1F6FE5F-5484-4BCA-ADDB-A34B2C2ECD9B}, ThreadID: 1036 - Ghosting completed on volume: {6C0A0578-0000-0000-0000-100000000000} <mark style="background-color: #FFFF8F">(Free space percent is: 68, Min free space percentage to start: 30, Max free space percent to stop: 35</mark>, Space recovered in MB: 0, Number of server endpoints processed: 2, Number of server endpoints skipped: 0, Number of files ghosted in session: 0, Number of files failed to ghost: 0, Number of files skipped by size or already ghosted: 1594, Number of files skipped by age: 0, Number of files skipped due to unsupported reparse point: 0, Number of dedup reparse points skipped: 0, Number of files failed to ghost due to stable version failure: 0, Number of files iterated: 1596, FileIteratorType: HEATSTORE_ITERATOR, DurationSeconds: 0, Policy Type: DATEPOLICY, Volume Dedup Enabled: false, Performed Dedup GC: false, Last Dedup GC Result: 0, Time spent on Dedup GC: 0 seconds)</mark>

### Understand the Space Usage on the Volume

When analyzing a volume for free space levels (typically during tiering incidents related to free space policy), consider the following details:

#### Space Usage Breakdown:
1. **User Files Allocated on the Volume:**
  - **Under Tiering-Enabled Share(s):** Files not yet tiered will occupy space.
  - **Under Tiering-Disabled Share(s):** All files will occupy space.

2. **System Volume Information:**
  - Specifically, `<vol:>\System Volume Information\Hfs` is used by Azure File Sync metadata.

3. **Deleted Files in Recycle Bin:**
  - Space is used by files deleted from Explorer and residing in `$RecycleBin`.

4. **NTFS Metadata:**
  - Space is used by NTFS metadata itself.

---

### How Many Files Are Failing to Tier and Why

#### Query Cloud Tiering Error Distribution:
1. **Using ASC:**

  ![ASC Tiering Error Distribution](/.attachments/SME-Topics/Azure-Files-Sync/ASC-tiering-error-distribution.png)

2. **Using Kusto:**

  Server telemetry event **9003** can be used to retrieve this information.

  ```k
  cluster("xfiles.westcentralus.kusto.windows.net").database("xsynctelemetrysf").ServerTelemetryEvents
  | where SubscriptionId contains "{SubscriptionId}"
  | where ServerId contains "11111111-1111-1111-1111-11111111111"
  | where PreciseTimeStamp > ago(10d)
  | where ServerEventId == 9003
  | project ClientTimeStamp, ServerId, AgentVersion, EventDescription
  | order by ClientTimeStamp desc
  ```

  **Example Output:**

  <mark style="background-color: #C2FFFF">
  Ghosting per file error distribution for <mark style="background-color: #FFFF8F">ServerEndpointName</mark>: ed0b46d9-XXXX-XXXX-XXXX-0adf6f1394ce: VolumeGuid: {1D1D5CEC-C326-11E7-80EC-005056916DBF}, <mark style="background-color: #FFFF8F">Error: 0x80c8600e</mark> - Azure: The server is currently unable to receive requests. Please retry your request, ErrorCode: -2134351858, Total Error Count: 1, <mark style="background-color: #FFFF8F">Total Unique Files Failing with This Error: 1</mark>, Session Id: {5183BA9A-CE9F-4A09-A934-75B3A0CCCE19}, ServerDataPath: \\?\W:\, SyncGroupName: mhqfsp01_W
  </mark>

  **Note:** The "Total Unique Files Failing with This Error" field provides the customer impact for the error code.

---

### Investigating Cloud Tiering Date Policy

#### Check if Date Policy is Met:
1. **Hourly Events:**
  - Server telemetry events **9029** and **9016** should be fired every hour, indicating that the policy is `DATEPOLICY`.

2. **Daily Event:**
  - Server telemetry event **9041** is fired daily and indicates whether the server endpoint is within the date policy SLA.

  **Kusto Query for Event 9041:**
  ```k
  cluster("xfiles.westcentralus.kusto.windows.net").database("xsynctelemetrysf").ServerTelemetryEvents
  | where PreciseTimeStamp >= ago(1d)
  | where ServerId == "09C26113-XXXX-XXXX-XXXX-0953765BE386"
  | where ServerEventId == 9041
  | project PreciseTimeStamp, AgentVersion, EventDescription
  ```

  **Example Output:**
  <mark style="background-color: #C2FFFF">
  Ghosting Daily ServerEndpoint Date Policy SLA: VolumeGuid: {21F80092-C7AD-4E82-A8AD-0CB4D1605D48}, ReplicaGroupId: {0AB2C507-A5D7-49C6-AC0C-55A8BAA1EC67}, SyncFolderPath: \\?\E:\UserData, 
  <mark style="background-color: #FFFF8F">Number of Date Policy Tiering Candidate Files (based on LastAccessTime in Heat Store): 2</mark>, 
  Number of Candidate Files with Unknown Sync State (according to Heat Store): 0, 
  <mark style="background-color: #FFFF8F">Number of Candidate Files Not Yet Synced (according to Heat Store): 2</mark>, 
  Number of Candidate Files Synced but Not Tiered (affects Date Policy SLA): 0, 
  Oldest LastAccessTime (UTC) of Tiered File: 2017-01-31T03:12:14.000Z, 
  Newest LastAccessTime (UTC) of Tiered File: 2019-12-20T02:59:44.919Z, 
  Date Policy Tiering Cutoff Time: 2019-12-20T16:21:01.183Z, 
  Within SLA: true, ServerEndpointName: daa1a656-4d28-48cf-8ec0-95a180d59834, SyncGroupName: userdata, DatePolicyDays: 180
  </mark>

---

### Find the LastAccessTime of File(s) / Tiering Order / Heatstore Dump

Refer to [TSG AFS Cloud Tiering Dump Heat Store Data](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/863880).

---

### How Many Files Are Failing to Tier and Why

Refer to the section [How Many Files Are Failing to Tier and Why](#how-many-files-are-failing-to-tier-and-why).

## Tiering Errors

1. Use [Azure Support Center (ASC)](https://azuresupportcenter.msftcloudes.com) to navigate to Resource Explorer, locate `StorageSyncServices`, and select the correct service.  
2. In the summary section, expand the Server Endpoint. You can customize the columns to display, as shown below:  
  ![Tiering1.jpg](/.attachments/SME-Topics/Azure-Files-Sync/34541976-935e-fa2f-fbb1-6d4bad2b97adTiering1.jpg)  
3. In the screenshot below, the agent version is outdated. Download the [latest Sync Agent](https://support.microsoft.com/en-us/help/4481060/update-rollup-for-azure-file-sync-agent-march-2019).  

### Steps to Investigate Errors:

1. In this case, there are per-item errors causing the sync knowledge database to run out of space. Use the query below to identify different per-item errors: [Query Link](https://jarvis-west.dc.ad.msft.net/D17114CA).  
2. Error `ECS_E_SYNC_CONSTRAINT_CONFLICT` indicates a download per-item error. Refer to [Sync Errors](https://docs.microsoft.com/en-us/azure/storage/files/storage-sync-files-troubleshoot?tabs=portal1%2Cazure-portal#how-do-i-see-if-there-are-specific-files-or-folders-that-are-not-syncing).  
3. Use the Sync Session Geneva URL to view DGrep logs and monitor current activities. Sorting by time will help track progress.  

  ![Tiering2.jpg](/.attachments/SME-Topics/Azure-Files-Sync/e51f14be-4d24-6ead-6f47-b070c883208e700px-Tiering2.jpg)  

### Monitoring Tiering Activity on a Server:

To monitor tiering activity, use Event IDs `9003`, `9016`, and `9029` in the Telemetry event log (located under `Applications and Services\Microsoft\FileSync\Agent` in Event Viewer).

- **Event ID 9003**: Provides error distribution for a server endpoint, including Total Error Count and ErrorCode.  
  - Example query for ghosting errors: [Query Link](https://jarvis-west.dc.ad.msft.net/937941FE).  
  - This event is logged hourly if a file fails to tier (one event per error code).  

  ![9003.jpg](/.attachments/SME-Topics/Azure-Files-Sync/27b12986-1b9b-5c2b-e7f0-b047b9eb8931800px-9003.jpg)  

- **Event ID 9016**: Provides ghosting results for a volume, including free space percentage, number of files ghosted, and failed files.  

  ![9016.jpg](/.attachments/SME-Topics/Azure-Files-Sync/015d9b25-9dce-87c9-c13c-25e0015b2745800px-9016.jpg)  

### Error Code Lookup:

1. Grab the `ErrorCode` and check it in [Error Lookup](http://errors/) to understand its meaning.  
2. Refer to the table below for common Cloud Tiering (Ghosting) errors and their resolutions:

| HEX        | Symbolic Name                                | Error String                                                                                     | Common Cause(s)                                                                                     | Recommended Steps                                                                                     |
| ---------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 0x80c80241 | ECS_E_GHOSTING_EXCLUDED_BY_SYNC              | File cannot be ghosted as it is present in the sync exclusion list                               | File is in the sync exclusion list                                                                  | Error can be ignored. Files in the sync exclusion list cannot be tiered.                             |
| 0x80c80261 | ECS_E_GHOSTING_MIN_FILE_SIZE                 | Cannot ghost file as the size is less than supported file size                                   | File size is less than 64KB                                                                         | Error can be ignored. File doesn't meet the minimum file size requirement.                           |
| 0x80c80240 | ECS_E_GHOSTING_CONCURRENCY_CHECK_FAILED      | Ghosting couldn't complete because the file changed                                              | The modified file must be synced to Azure File share before it can be tiered                       | Error can be ignored. File will tier once the modified file has synced to the Azure file share.       |
| 0x80070322 | ERROR_CANNOT_BREAK_OPLOCK                    | The operation did not complete successfully because it would cause an oplock to be broken.       | File is in use                                                                                      | Error can be ignored. File will tier once the file handle is closed and the file has synced.          |
| 0x80c80264 | ECS_E_GHOSTING_FILE_NOT_SYNCED               | Not ghosting file as the file is not synced                                                      | File must be synced to Azure File share before it can be tiered                                     | Error can be ignored. File will tier once the file has synced to the Azure file share.               |
| 0x80070001 | ERROR_INVALID_FUNCTION                       | Incorrect function                                                                               | Cloud tiering filter driver is not running                                                         | Open an elevated command prompt and run: `fltmc load storagesync`.                                   |
| 0x80041284 | SYNC_E_METADATA_ITEM_NOT_FOUND               | The metadata store item not found                                                               | File is not synced                                                                                  | Wait for the file to sync and populate the sync database.                                             |
| 0x80070020 | ERROR_SHARING_VIOLATION                      | The process cannot access the file because it is being used by another process.                 | File is in use                                                                                      | Error can be ignored. File will tier once the file handle is closed and the file has synced.          |
| 0x80070070 | ERROR_DISK_FULL                              | There is not enough space on the disk.                                                          | Insufficient disk space on the volume where the server endpoint is located                          | Free disk space on the volume where the server endpoint is located.                                   |
| 0x80070490 | ERROR_NOT_FOUND                              | Element not found                                                                                | Data not found in sync DB. Likely happens when file is not yet synced and ghosting is attempted.    | Wait for the file to sync and populate the sync database.                                             |
| 0x80c80262 | ECS_E_GHOSTING_UNSUPPORTED_RP                | File is an unsupported reparse point.                                                           | File has an unsupported reparse point and will not be tiered                                        | Files with unsupported reparse points will never be tiered.                                          |
| 0x80c80263 | ECS_E_GHOSTING_UNSUPPORTED_DEDUP_RP          | File is an unsupported Dedup RP                                                                 | File has a Dedup reparse point. Dedup reparse points will not be tiered                             | Files with Dedup reparse points are not currently supported on the same volume.                      |
| 0x80c83052 | ECS_E_CREATE_SV_STREAM_ID_MISMATCH           | A stable version cannot be created because the stream ID of the live file has changed.          | Error occurs when creating a stable version. Indicates the file has been modified.                 | Wait for the file to sync.                                                                            |
| 0x800705aa | ERROR_NO_SYSTEM_RESOURCES                    | Insufficient system resources exist to complete the requested service.                          | Insufficient system resources exist to complete the operation                                       | Identify the driver or application exhausting system resources.                                       |
| 0x8000ffff | E_UNEXPECTED                                 | Catastrophic failure                                                                            | Generic E_UNEXPECTED thrown from code during validation                                             | Should recover after some time.                                                                      |
| 0x80c80269 | ECS_E_GHOSTING_REPLICA_NOT_FOUND             | Replica not found in the cache during ghosting.                                                 | If the replica is busy, ghosting cannot fetch the object.                                           | Ghosting will wait for sync to complete its activity and try again later.                            |
| 0x80c8031d | ECS_E_CONCURRENCY_CHECK_FAILED               | Sync couldn't complete because a file changed. Sync will try again later.                       | The modified file must be synced to Azure File share before it can be tiered                       | Error can be ignored. File will tier once the modified file has synced to the Azure file share.       |
| 0x80072ee2 | WININET_E_TIMEOUT                            | The operation timed out                                                                         | Network reliability issue                                                                           | Error can be ignored if rarely logged. Engage networking team if error consistently occurs.           |
| 0x80c80017 | ECS_E_SYNC_OPLOCK_BROKEN                     | A file was changed during sync, so it needs to be synced again.                                 | The modified file must be synced to Azure File share before it can be tiered                       | Error can be ignored. File will tier once the modified file has synced to the Azure file share.       |

### Common Causes for Orphaned Tiered Files

Tiered files on a server become inaccessible if they aren't recalled before deleting a server endpoint or if tiered files are restored from an on-premises backup to the server endpoint location.

#### Sync Error Codes
- `0x800703ee` (The volume for a file has been externally altered so that the opened file is no longer valid).  
- `0x80070043` (ERROR_BAD_NET_NAME).  

For persistent sync errors, refer to the troubleshooting steps in this TSG.

---

### Analysis

#### Investigating Sync Errors

Execute the following PowerShell command to gather details on files causing synchronization errors:

```powershell
Import-Module "C:\Program Files\Azure\StorageSyncAgent\StorageSync.Management.ServerCmdlets.dll"
Debug-StorageSyncServer -FileSyncErrorsReport
```

#### Checking for Orphaned Files

Execute the following PowerShell command to check for orphaned files (files no longer valid for synchronization):

```powershell
$orphanFiles = Get-StorageSyncOrphanedTieredFiles -Path <server endpoint path>
$orphanFiles.OrphanedTieredFiles > OrphanTieredFiles.txt
```

This command only extracts a list of orphaned files without altering any data.

#### Identifying Broken Tiered Files

Run the following command to identify broken tiered files:

```powershell
Invoke-StorageSyncServerScrubbing -Full -Path <Server Endpoint Path> -Mode Report -ReportDirectoryPath <output file directory>
```

This command checks for broken tiered files and generates a report without modifying any data.

---

### Resolution

#### Run the Repair Command

Execute the following PowerShell command to repair broken tiered files:

```powershell
Invoke-StorageSyncServerScrubbing -Full -Path <SEP path or sub-path> -Mode Repair -ReportDirectoryPath C:\temp\
```

Allow some time for the repair job to complete.

#### Generate a Final Report

After repair completion, generate a final report to confirm no remaining errors:

```powershell
Invoke-StorageSyncServerScrubbing -Full -Path <SEP path or sub-path> -Mode Report -ReportDirectoryPath <output file directory>
```

This will help ensure that no errors remain after the repair.

---

### Restoring Access to Tiered Files

If tiered files aren't accessible due to deleting the server endpoint, restoring access to your tiered files is possible if the following conditions are met:
- Server endpoint was deleted within the past 30 days.
- Cloud endpoint wasn't deleted.
- File share wasn't deleted.
- Sync group wasn't deleted.

If the conditions above are met, you can restore access to the files on the server by recreating the server endpoint at the same path on the server within the same sync group within 30 days.

If the conditions above aren't met or the tiered files were restored from an on-premises (third-party) backup, restoring access isn't possible as these tiered files on the server are now orphaned. Follow these instructions to remove the orphaned tiered files.

> **Note**  
> - When tiered files aren't accessible on the server, the full file should still be accessible if you access the Azure file share directly.  
> - To prevent orphaned tiered files in the future, follow the steps documented in [Remove a server endpoint](https://learn.microsoft.com/en-us/azure/storage/file-sync/file-sync-server-endpoint-delete) when deleting a server endpoint. Avoid restoring tiered files from on-premises backups. See [Disaster recovery best practices with Azure File Sync](https://learn.microsoft.com/en-us/azure/storage/file-sync/file-sync-disaster-recovery-best-practices).

---

### Cleanup Orphaned Files

If there are orphaned files and you want to check and clean them up, follow these steps:

1. Create a VSS snapshot of the server volume.
2. Create an Azure file share snapshot.
3. Use the `Get-StorageSyncOrphanedTieredFiles` cmdlet to get the list of orphaned files and save the list for future recovery if needed.

```powershell
Get-StorageSyncOrphanedTieredFiles -Path <server endpoint path>
```

Review the files to ensure they are indeed broken ghosts from prior ungraceful de-provisioning. Attempt recalls to confirm they are failing.

4. Use the `Remove-StorageSyncOrphanedTieredFiles` cmdlet to clean up orphaned files.

---

### Troubleshooting Files That Fail to Be Tiered

#### If Files Fail to Tier to Azure Files

1. In Event Viewer, review the telemetry, operational, and diagnostic event logs located under `Applications and Services\Microsoft\FileSync\Agent`.
  - Verify the files exist in the Azure file share. (A file must be synced to an Azure file share before it can be tiered.)
  - Verify the server has internet connectivity.
  - Verify the Azure File Sync filter drivers (`StorageSync.sys` and `StorageSyncGuard.sys`) are running:
    - At an elevated command prompt, run `fltmc`. Verify that the `StorageSync.sys` and `StorageSyncGuard.sys` file system filter drivers are listed.

2. Use this Jarvis query to view errors logged for ghosting: [Event ID 9003](https://jarvis-west.dc.ad.msft.net/BB018C11).

Example:

```plaintext
Ghosting per file error distribution for ServerEndpointName:bc578119-XXXX-XXXX-XXXX-7a8d887c118a: VolumeGuid:{E7EDBC5D-0000-0000-0000-100000000000}, Error:0x80c80262 - File is an unsupported RP. , ErrorCode:-2134375838, Total Error Count:2, Total Unique Files failing with this error:2, Session Id: {35222568-700A-4DD6-B361-B51DFE3A9AB8}
```

3. Browse to <http://errors> and check for the above error. Check if the error is documented at [Troubleshoot Azure File Sync](https://docs.microsoft.com/en-us/azure/storage/files/storage-sync-files-troubleshoot?tabs=portal1%2Cazure-portal).

---

### Troubleshooting Files That Fail to Be Recalled

#### If Files Fail to Be Recalled

1. In Event Viewer, review the telemetry, operational, and diagnostic event logs located under `Applications and Services\Microsoft\FileSync\Agent`.
  - Verify the files exist in the Azure file share.
  - Verify the server has internet connectivity.
  - Open the Services MMC snap-in and verify the Storage Sync Agent service (`FileSyncSvc`) is running.
  - Verify the Azure File Sync filter drivers (`StorageSync.sys` and `StorageSyncGuard.sys`) are running:
    - At an elevated command prompt, run `fltmc`. Verify that the `StorageSync.sys` and `StorageSyncGuard.sys` file system filter drivers are listed.

**Common Recall Errors**

| HEX        | Error String                                   | Common Cause(s)                                                                                                                                                                                                 | Recommended Steps                                                                                                                                                                                                 |
|------------|-----------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 0x80070079 | The semaphore timeout period has expired       | I/O timeouts due to a variety of reasons: <ul><li>Server resource constraints</li><li>Network issues - poor connection, blocked</li><li>Azure side issues - throttling, slow</li></ul>                          | Error can be ignored if the error automatically goes away after a few hours. Escalate issue if error is persistent                                                                                              |
| 0x80070005 | Access is denied                               | This can happen due to a variety of reasons: <ul><li>Change of Network firewall rules on Azure file share</li><li>Access policy blocking access to Azure containers</li><li>Possible ACLs on files</li></ul>   | Check access policies on Azure file share, check firewall settings for allowed IP range, check ACLs on files on server                                                                                          |
| 0x80c86030 | The specified share does not exist             | File share was deleted - not recoverable customer error                                                                                                                                                        | Confirm the condition with customer. Ask customer to de-provision the setup through portal and re-create the setup again using new Azure file share. Data may need to be restored from backup (if configured). |
| 0x80c8031d | Sync couldn't complete because a file changed. Sync will try again later | This should be rare, if the customer is running an older agent version                                                                                                                                         | Upgrade to latest agent, error should recover itself                                                                                                                                                            |
| 0x80c86002 | The specified resource does not exist          | Customer likely started using pre-GA agents which have some issues                                                                                                                                             | Upgrade to latest agent. Files likely intact in Azure file share unless anyone deleted those. May need cleanup on server side for orphaned ghosts (we are working on a cmdlet for that).                        |
| 0x80c80037 | Your sync partnership is either not setup or not configured properly. | Server endpoint was deleted without recalling the files. Files that were tiered and were not recalled are now unusable.                                                                                        | Follow steps to identify and delete tiered files that are unusable. Use PowerShell commands to generate a report and clean up unusable files.                                                                   |
| 0x80c86036 | The specified parent path does not exist       | Customer likely started using pre-GA agents, parent directory was renamed                                                                                                                                      | Upgrade to latest agent, error should recover itself                                                                                                                                                            |
| 0x8007000e | Not enough storage is available to complete this operation. | Insufficient disk space on the volume where the server endpoint is located                                                                                                                                      | Free disk space on the volume where the server endpoint is located by copying the files out, let the server recover from this state, let tiering free up more space, then copy the files back in.               |
| 0x800705aa | Insufficient system resources exist to complete the requested service. | Insufficient system resources exist to complete the operation                                                                                                                                                  | Sometimes, massive robocopy-like operations copying AFS tiered files can cause this issue due to resource constraints on the server. Condition should recover on retry. Investigate resource exhaustion.         |
| 0x80c80312 | Couldn't finish downloading files. Sync will try again later. | Customer likely started using pre-GA agents. Network connection or reliability issue                                                                                                                           | Upgrade to latest agent. Error can be ignored if rarely logged. Networking team should be engaged if error consistently occurs.                                                                                  |
| 0x80004005 | Unspecified error                              | Needs investigation by PG                                                                                                                                                                                      | Escalate issue to PG                                                                                                                                                                                             |
| 0x80131500 | Base class for all exceptions in the runtime   | Generally unhandled exceptions from Azure File Sync service. Needs investigation by PG                                                                                                                         | Escalate issue to PG                                                                                                                                                                                             |
| 0x8007054f | An internal error occurred                     | Needs investigation by PG                                                                                                                                                                                      | Escalate issue to PG                                                                                                                                                                                             |
| 0x80072ee7 | The server name or address could not be resolved. | Network connection or reliability issue                                                                                                                                                                        | Error can be ignored if rarely logged. Networking team should be engaged if error consistently occurs.                                                                                                          |
| 0x80072efd | A connection with the server could not be established | Network connection or reliability issue                                                                                                                                                                        | Error can be ignored if rarely logged. Networking team should be engaged if error consistently occurs.                                                                                                          |
| 0x80072f78 | The server returned an invalid or unrecognized response | Network connection or reliability issue                                                                                                                                                                        | Error can be ignored if rarely logged. Networking team should be engaged if error consistently occurs.                                                                                                          |
| 0x80c80310 | The download session response isn't valid.     | Customer likely started using pre-GA agents                                                                                                                                                                    | Upgrade to latest agent. Files likely intact in Azure file share unless customer deleted those. May need cleanup on server side for orphaned ghosts (we are working on a cmdlet for that).                      |
| 0x80c8603d | Unknown failure                                | Needs investigation by PG                                                                                                                                                                                      | Escalate issue to PG                                                                                                                                                                                             |
| 0x80070006 | The handle is invalid.                         | StorageSync filter not installed properly                                                                                                                                                                      | Uninstall agent, reboot, install latest agent                                                                                                                                                                   |
| 0x80072f8f | Content decoding has failed                    | Network connection or reliability issue                                                                                                                                                                        | Error can be ignored if rarely logged. Networking team should be engaged if error consistently occurs.                                                                                                          |

## How to Identify Files That Are Recalled on a Server

1. In Event Viewer, navigate to the *Microsoft-FileSync-Agent/RecallResults* event log.
2. Each file recall is logged as an event. If the `DataTransferHresult` field is `0`, the file recall was successful. If the `DataTransferHresult` field contains an error code, refer to the [Recall Errors and Remediation](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-storage/files/file-sync/file-sync-troubleshoot-cloud-tiering#recall-errors-and-remediation) section for remediation steps.

---

## FAQ

### Why Are My Files Grayed Out?

- When files are tiered, they are not fully downloaded and appear grayed out. When you try to open them, they are downloaded.

### Why Doesn't the "Size on Disk" Property Match the "Size" Property After Using Azure File Sync?

- Windows File Explorer shows two size properties:
  - **Size**: Represents the complete size of the file.
  - **Size on Disk**: Represents the size of the file stream stored on the disk.
- These values may differ due to compression, Data Deduplication, or cloud tiering. For tiered files, the "Size on Disk" is zero because the file stream is stored in Azure Files. Partially tiered files may show a non-zero "Size on Disk."

### How Can I Tell Whether a File Has Been Tiered?

- A tiered file will have the attribute **APLO** or **ALOM** (RS5+).
  - Example:  
    ![Tiered Local File](/.attachments/SME-Topics/Azure-Files-Sync/tiered_local.png)
- A tiered file may appear grayed out or have an "x" over SMB.  
  ![Tiered SMB File](/.attachments/SME-Topics/Azure-Files-Sync/tiered_smb.png)
- The "Size on Disk" in file properties will be 0 bytes (partially tiered files may show a non-zero size).  
  ![Tiered File Properties](/.attachments/SME-Topics/Azure-Files-Sync/tiered_properties.png)

For more details, see [Understanding Cloud Tiering](https://docs.microsoft.com/en-us/azure/storage/files/storage-sync-cloud-tiering#is-my-file-tiered).

### How Can I Recall a Tiered File to Use It Locally?

- The easiest way is to open the file. The Azure File Sync file system filter (StorageSync.sys) will seamlessly download the file from Azure Files.
- To recall multiple files at once, use PowerShell:

```powershell
Import-Module "C:\Program Files\Azure\StorageSyncAgent\StorageSync.Management.ServerCmdlets.dll"
Invoke-StorageSyncFileRecall -Path <file-or-directory-to-be-recalled>
```

### How Do I Force a File or Directory to Be Tiered?

- Use the following PowerShell commands to manually force tiering:

```powershell
Import-Module "C:\Program Files\Azure\StorageSyncAgent\StorageSync.Management.ServerCmdlets.dll"
Invoke-StorageSyncCloudTiering -Path <file-or-directory-to-be-tiered>
```

- To tier files based on their last access time:

```powershell
Invoke-StorageSyncCloudTiering -Path <file-or-directory-to-be-tiered> -MinimumFileAgeDays 8
```

**Note**: Files are not tiered based on last access time when using the above command. Instead, it iterates through files on disk and tiers them.

Example Event 9029 (PowerShell Session):

<mark style="background-color: #C2FFFF">
Ghosting SyncFolder Session: FileIteratorType: HEATSTORE_ITERATOR, SessionID: {15DD57E1-1D14-4E8D-AF8B-2F48A9D5AC39}, ThreadID: 5524, VolumeId: {36F6393C-BA53-4044-A406-B962D9C31CC4}, <mark style="background-color: #FFFF8F">Number of files attempted in the session: 45, Number of files tiered in the session: 44</mark>, DurationSeconds: 3, Server Id: BEDAA587-XXXX-XXXX-XXXX-02FB27845C30, ServerEndpointName: 6a2241d2-XXXX-XXXX-XXXX-d601f848b8da, Space Reclaimed (MB): 11.56825, <mark style="background-color: #FFFF8F">IsPowershell: True</mark>, PolicyType: SPACEPOLICY
</mark>

### How Is Volume Free Space Interpreted When Multiple Server Endpoints Exist on a Volume?

- The effective volume free space threshold is the largest value specified across all server endpoints on the volume. Files are tiered based on usage patterns, regardless of the server endpoint they belong to.

Example:  
If Endpoint1 has a threshold of 25% and Endpoint2 has 50%, the effective threshold for both endpoints is 50%.

---

## Scenarios

### Initial Upload Sync Delaying Background Tiering

In some cases, **InitialUploadSync** delays the background tiering thread, causing the volume to approach full capacity. This is common in data migration scenarios.

#### Mitigation Options:

1. Enable a date policy (e.g., 30 days).  
   - Date policy runs hourly, even if InitialUploadSync is in progress.
   - Files older than 30 days are tiered deterministically.

2. Use the `Invoke-StorageSyncCloudTiering` cmdlet to force tiering.  
   - This tiers all files without considering free space levels.

#### Notes on InitialUploadSync:

- Volume free space policy tiering does not run until InitialUploadSync is complete (by design). This ensures the oldest files are tiered first.
- InitialUploadSync includes all files/folders known before the first sync session. Ongoing churn is not part of this session.

**Design Considerations:**
- This design prevents future issues like recall performance degradation or increased recall costs.
- Gradual data migration over time is less affected, as only the first sync session is part of InitialUploadSync.



::: template /.templates/Processes/Knowledge-Management/Azure-Files-Sync-Feedback-Template.md
:::

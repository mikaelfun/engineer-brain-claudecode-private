---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files Sync/TSGs/TSG AFS Sync investigation Cloud Enumeration and Upload Session_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Azure%20Files%20Sync/TSGs/TSG%20AFS%20Sync%20investigation%20Cloud%20Enumeration%20and%20Upload%20Session_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Azure-Files-Sync
- cw.TSG
- cw.Reviewed-07-2024
---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::
 

[[_TOC_]]

# Summary 

This TSG will help you investigate reports of discrepency with cloud enumeration. 

## Cloud change enumeration

Initial Cloud enumeration -

- Gets triggered when a cloud endpoint is created
- Typical speed is >30 items per sec
- ETA coming up in v13
- ETA = Total Item / speed

**How to correlate user provided information with jarvis queries - How to get shareId**

Most of the jarvis tables are pivoted around shareId which is a unique identifier for a cloud endpoint.  We can get the shareId 
from table CounterAFSManagementEndpointInfo using SyncGroupName/syncservicename/ServerId/ServerName etc. The column SyncGroupUid is the shareId. Here is the query for this table.

 - https://jarvis-west.dc.ad.msft.net/46B4DA0

 **Pro Tip:** Alternative approach to get teh shareId. 
 
- [TSG 206 How to get ShareId from SyncGroup and Subscription ID](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/784050)

**Monitoring Cloud enumeration**

Following jarvis table contains information about enumeration. Filter by ShareId:

1. AFSCloudChangeDetectionTaskInfo - give information about currently running enumeration tasks
2. SyncChangeEnumerationInformation - provide namespace related information like number of files etc
	- https://jarvis-west.dc.ad.msft.net/C56FBB12
3. SyncChangeEnumerationProgress - provide information about currently running enumeration 
    - https://jarvis-west.dc.ad.msft.net/E5E94D23


## Initial Upload
	
1. Require initial cloud enumeration to finish - else gets 'replica not ready' error for any download/upload sync session from server
2. If both cloud and server has data - initial download reconcile happens first after initial cloud enumeration is finished
3. If cloud share has data and server endpoint is empty- initial download fastDR session would happen
4. Initial upload session starts after first reconcile / fast dr download session finishes
5. Initial upload could happen in multiple sync session since it runs in parallel to the server data enumeration

**How to monitor performance and measure progress using logs, telemetry and determine ETA**

ETA calculation arrived in v13. We can calculate ETA from jarvis using queries shared below.

- [TSG 124: How to investigate sync performance and progress](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/784355)
- [TSG 170: Formatting Server Telemetry Events in Jarvis](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/784046)

## 	Troubleshoot top scenarios and mitigation steps

**Metadataknowledge high**

Too many per item error causes sync knowledge in cloud to bloat during upload. Large knowledge == slow upload sync. Reverse is true for download.
		
How to check cloud knowledge size  - lookup into table SyncProcessChangeBatch - for destknowledgesize column for a given shareId.
	
If per item errors recovers, knowledge shrinks and speed improves. If it hit the high limit - only way to recover is to do repair.
		
How to check if it would auto recover - depends on the kind of per item errors. Lookup per item errors from 9121 event and look for itemHresult. If itemHresult is recoverable, it should auto recover else it would need CX intervention. 
		
If customer has just one server endpoint with master copy of the data - recommend authoritative upload repair (v12) - to avoid conflicts and deleted data resurrection.

## High memory usage on the server

Azure File Sync uses Extensible Storage Engine (ESE) databases for sync and cloud tiering. The ESE databases can consume up to 80% of system memory to improve performance. To limit the amount of memory used by the ESE databases, you can configure the `MaxESEDbCachePercent` registry setting on the server.

To reduce the ESE memory usage limit to 60%, which is a good balance between memory utilization and enough cache to maintain decent performance of the databases, run the following command from an elevated command prompt:

```console
REG ADD HKLM\Software\Microsoft\Azure\StorageSync /v MaxESEDbCachePercent /t REG_DWORD /d 60
```

Once the `MaxESEDbCachePercent` registry setting is created, restart the Storage Sync Agent (FileSyncSvc) service. 

## Tools and troubleshooting for Memory, CPU Utilization

We need to per analysis to understand where its taking time:

[TSG 227 Windows Performance Toolkit (WPT) for Customer](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/784052)

There is no clear cut root cause for this. Depends on the server resources, other applications running on the server, number of server endpoints, antivrius etc.
		
Ask from CX - get a dump file when memory usage is High. ESE (esent) database memory utilization.

Basic recommendation:

1. Defrag the ese jet db
  - **Defragment the ESE database (syncmetadata, heatstore etc)**
  - Disable filesyncsvc, then Stop filesyncsvc: , then ensure the service is stopped
  - Powershell instructions:
    - Set-Service "FileSyncSvc"  -StartupType  Disabled; 
    - Stop-Service "FileSyncSvc"; 
    - Get-Service "FileSyncSvc" | fl -Property Status,StartType,DisplayName,ServiceName;
 - CMD/exe instructions
    - sc config "filesyncsvc" start=disabled
    - net stop filesyncsvc
    - sc query filesyncsvc
 - Use psexec.exe to open a command prompt with �system� privileges:
    - Download https://docs.microsoft.com/en-us/sysinternals/downloads/psexec
    - psexec -s -i cmd.exe
    - In the system cmd that opened, type 'whoami' to ensure you are running as 'nt authority\system'
- Find the path of the database that needs repair:
    - Product team can help build the sync metadata path <DB PATH>
    - In SYSTEM cmd prompt: cd \d <DB PATH>
    - esentutl /d meta.edb
    - Save the defrag output with us if the issue is not resolved
 - Enable filesyncsvc: sc config "filesyncsvc" start=auto
 - Start filesyncsvc: net start filesyncsvc
 - Ensure service is started: sc query filesyncsvc
2. Recommend CX to set the reg key to limit the cache size for jet db (coming up in v14)


**Reconciliation scenarios**

- Cloud share has data and server endpoint has data  (authoritative upload) 
- ESE (jet) Database corruption
- Repair (metadata knowledge limit)  (authoritative upload -- Only one server endpoint and one cloud endpoint) 
- Back in time detection
- Old agent (<v11.2)- cluster bug, custom session bug


		
Significant improvement in reconcile speed in v12. More telemetry coming up in v14 to get the category which is most impactful and invest into fixing that. 
		
Reconcile slow reason - AV causing recalls and slows down apply - Sophos, Semantec 
		
Large namespace reconcile - takes long time and user modifies the namespace causing it to break forever. 
		
Resurrect local deleted data.
		
If CX has one server endpoint with master copy of the dataset, ask them for authoritative repair (agent version > v12)

**Large size files not syncing**

Should be per item error. Have not seen this with many customers. 
		
Large file could cause multiple server endpoints to starve. 
		
Need more telemetry about large file size, attempting time to upload etc. 



#### More Information 

- [Azure File Sync Workflow_Storage](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/510939)


::: template /.templates/Processes/Knowledge-Management/Azure-Files-Sync-Feedback-Template.md
:::

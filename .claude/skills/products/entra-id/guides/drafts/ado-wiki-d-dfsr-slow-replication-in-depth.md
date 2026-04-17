---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/DFSR/Workflow: DFSR: Looking for Known Solutions/Common Solutions/Slow Replication/Slow replication (in-depth)"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FDFSR%2FWorkflow%3A%20DFSR%3A%20Looking%20for%20Known%20Solutions%2FCommon%20Solutions%2FSlow%20Replication%2FSlow%20replication%20(in-depth)"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1520867&Instance=1520867&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1520867&Instance=1520867&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:**   
This article provides guidelines for diagnosing and improving slow DFS Replication performance. It includes steps for gathering data, evaluating replication health, and understanding performance counters and their significance.
[[_TOC_]]


# Slow DFS-replication performance

DFS Replication, like any Windows service, is limited in operation by the performance of the systems hardware and the network. The disk, memory, and CPU resources used by DFS Replication depend on a number of factors, including the number and size of the files, rate of change, number of replication group members, and number of replicated folders. Thus, Microsoft provides no details about performance baselines. Each file server administrator must evaluate and test DFSR under typical workloads in order to size the servers resources appropriately.

In addition, some resources are harder to estimate. For example, the Extensible Storage Engine (ESE) technology used for the DFS Replication database can consume a large percentage of available memory, which it releases on demand. Applications other than DFS Replication can be hosted on the same server depending on the server configuration. However, when hosting multiple applications or server roles on a single server, it is important that you test this configuration before implementing it in a production environment.

"Slow replication" is relative to some expectation of performance. It is critical to set expectations about what may be achieved through troubleshooting. For example, it may be determined that a recent increase in load to the file server is negatively affecting DFSR's ability to efficiently replicate files, DFSR is not configured optimally, resources of the system are not operating correctly, etc. Often, DFSR is the victim of some other change that occurred within the environment.

If the previous performance and the current performance cannot be quantified by performance data, it is your responsibility to capture performance data from the system and provide the customer with an explanation about why DFSR is performing "slow." Once the cause has been identified, it may be remedied through server reconfiguration, distribution of load or content to additional servers, and/or acceptance that the performance is the new norm.

# Gathering data

For all performance-related support cases, the following are recommended practices to isolate the root cause:
- Concentrate troubleshooting on two or three specific partners. Select them strategically: each are direct replication partners observed to slowly replicate data.
- When gathering data, gather diagnostic data simultaneously between the partners. This includes performance data, network captures, and DFSR SDP data (debug logs, replication group configuration settings, event logs, etc.).
- Determine the optimal time to gather the data and ensure that the collected data will represent the issue (the "observation period"). Ensure that the performance, debug, and event log data covers the period of interest. Ensure that the performance counter sample intervals are small enough to capture transient states. Verify that the debug logs cover the necessary time range, as some busy servers may wrap 1000 logs in just a matter of minutes or hours. If necessary, increase the size of the BLG output files and consider [increasing the number of debug logs](https://learn.microsoft.com/en-us/troubleshoot/windows-server/networking/change-dfsr-debug-log-settings) maintained by the service (`wmic /namespace:\\root\microsoftdfs path dfsrmachineconfig set maxdebuglogfiles=2000`) while accounting for the additional disk space consumption.
- Canary files placed within each server's replicated folder can be helpful in observing replication behaviors. Name the files uniquely and include the name of the server on which it is created. It is helpful to get the UID of the file using the `dfsrdiag idrecord /filepath:<path to file>` command so that you may mine for it.
- Gather backlog reports at strategic times to confirm that during the observation period the issue manifested. Be careful to only run the backlog report sparingly as it does temporarily interrupt replication operations.

# DFS replication provides three categories of counters

DFS Replication provides three categories of counters to evaluate the performance of various operations:

**DFS Replicated Folders** - This category provides per-folder counters to evaluate these items:
- Remote Differential Compression (RDC) efficiencies
- Amount of uncompressed and compressed file data received
- Conflict and deleted activities
- File installation activities (from 'installing' folder to the file's target location)
- File staging activities
- File received counts
- Updates dropped

**DFS Replication Connections** - This category provides per-connection counters to evaluate these items:
- Bandwidth savings of DFSR as compared to a normal file copy operation of the replicated data
- Bytes received per second
- RDC-specific counters for bytes, compressed files, and size of files received
- Size of files received (since last service start)
- Total bytes and files received (since last service start)

**DFS Replication Service Volumes** - This category provides per-volume counters to evaluate these items:
- Database commit and lookups
- USN journal records accepted, read, and unread percentage

# Below are the counters that are of typical value while troubleshooting DFSR

_For the "receiving" or "downstream" server(s), these are most important:_

**DFS Replication Connections Counters (all instances)**
- **Total Bytes Received**  
  Total Bytes Received shows the total number of bytes received on the connection. The bytes received value includes file data and replication metadata.

- **Total Files Received**  
  Total Files Received shows the number of files that were received on the connection.

- **Bytes Received Per Second**  
  Bytes Received Per Second shows an estimate of the average number of bytes that were received each second over the past 30 seconds.

**DFS Replication Folders Counters (all instances)**
- **File Installs Retried**  
  File Installs Retried shows the number of file installs that are being retried due to sharing violations or other errors encountered when installing the files. The DFS Replication service replicates staged files into the staging folder, uncompresses them in the Installing folder, and renames them to the target location. The second and third steps of this process are known as installing the file.

_For the "sending" or "upstream" servers, these are important:_

**DFS Replication Service Volumes Counters (all instances)**
- **USN Journal Records Accepted**  
  USN Journal Records Accepted shows the number of update sequence number (USN) journal records that were processed by the DFS Replication service. The DFS Replication service processes all USN journal records for replicated content on a volume and ignores records for non-replicated files and folders on the volume.

- **USN Journal Records Read**  
  USN Journal Records Read shows the number of update sequence number (USN) journal records that were read by the DFS Replication service.

- **USN Journal Unread Percentage**  
  USN Journal Unread Percentage shows the percent of the update sequence number (USN) journal that has not yet been read and processed by the DFS Replication service. A journal wrap will occur if this counter reaches 100.

**DFS Replicated Folders Counters (all instances)**
- **Staging Files Cleaned up**  
  Staging Files Cleaned up shows the number of files and folders that were cleaned up from the staging folder by the DFS Replication service. The DFS Replication service stages files and folders in the staging folder before they are replicated and automatically cleans up the staging folder when it exceeds a pre-configured threshold of the quota.

_For all DFSR servers, these are important:_

**Logical Disk (instances associated with replicated folders)**
- Avg. Disk sec/Read
- Avg. Disk sec/Transfer
- Avg. Disk sec/Write

These counters detail the average time, in seconds, of a read/transfer/write to the disk.

Below are other methods to evaluate replication health:

**File Propagation Tracer**

You may run the Propagation test periodically through the DFS Management snap-in or via the command line tool `dfsradmin proptest`. Running this may help you evaluate how long it takes for changes to propagate to various partners and isolate bottlenecks. For more information, see [Create Diagnostic Report](https://techcommunity.microsoft.com/t5/ask-the-directory-services-team/verifying-file-replication-during-the-windows-server-2008-dfsr/ba-p/395317) and [Start-DfsrPropagationTest](https://learn.microsoft.com/en-us/powershell/module/dfsr/start-dfsrpropagationtest?view=windowsserver2022-ps)

**Backlog Report**

Backlog report generation via DFSRDiag, health reports, WMI, or PowerShell is computationally expensive and should be run sparingly on a DFSR server. If frequent report generation is required by the customer or during troubleshooting, keep the frequency at once an hour as a minimum.

````
dfsrdiag backlog /ReceivingMember:<Server> /SendingMember:<Partner Server> /RGName:<Replication Group Name> /RFName:<Replicated Folder Name>
````

[Get-DfsrBacklog (Windows 2012 R2 and Windows 8.1)](https://technet.microsoft.com/en-us/library/dn296583(v=wps.630).aspx)

````
Get-DfsrBacklog [[-GroupName] <String[]> ] [[-FolderName] <String[]> ] [-SourceComputerName] <String> [-DestinationComputerName] <String> [ <CommonParameters>]
````

# General guidelines and steps for performance data collection

Gather performance data for a period sufficient to observe the systems under typical load. The goal is to observe the performance of DFSR replication activities as compared with its dependencies. You must correlate a reduction in replication efficiencies to a change in the server's state.

Performance data can give you great insight into the inner workings of DFSR and how the service is responding to changing server resource, network, or configuration changes.

DFS Replication provides three categories of counters to help evaluate the performance of various operations:
- DFS Replicated Folders
- DFS Replication Connections
- DFS Replication Service Volumes

The commands below may be leveraged as-is or modified to tune the duration of the collection or frequency of the samples. The first command configures a sample interval of 5 minutes, while the second has an interval of 15 seconds. These two intervals are useful if the "condition" or abnormal behavior is short-lived or if you require performance data over a longer period to observe patterns in performance from day to day. The overhead for this logging is low.

Below are examples of the two commands that may be leveraged to create these performance trace sessions. Each BLG output file is limited to a maximum of 300 MB. The size of the BLG is largely dependent upon the number of replicated folders, connections, volumes, and other resources on the system. For example, a server replicating 4 replication groups, 4 replicated folders, and across 4 volumes will allow collection of data for around 15 hours with a sample interval of 15 seconds. A sample interval of 300 seconds for this server will accommodate approximately 55 hours of data.

**Commands**

**Step 1**: The commands below will create the trace log session on the system with the specified counters:
````
Logman.exe create counter PerfLog-5min -o "c:\perflogs\PerfLog-5min.blg" -f bincirc -v mmddhhmm -max 300 -c "\LogicalDisk(*)\*" "\Memory\*" "\Cache\*" "\Network Interface(*)\*" "\Paging File(*)\*" "\PhysicalDisk(*)\*" "\Processor(*)\*" "\Processor Information(*)\*" "\Process(*)\*" "\Redirector\*" "\Server\*" "\System\*" "\Server Work Queues(*)\*" "\DFS Replicated Folders(*)\*" "\DFS Replication Connections(*)\*" "\DFS Replication Service Volumes(*)\*" -si 00:05:00

Logman.exe create counter PerfLog-15sec -o "c:\perflogs\PerfLog-15sec.blg" -f bincirc -v mmddhhmm -max 300 -c "\LogicalDisk(*)\*" "\Memory\*" "\Cache\*" "\Network Interface(*)\*" "\Paging File(*)\*" "\PhysicalDisk(*)\*" "\Processor(*)\*" "\Processor Information(*)\*" "\Process(*)\*" "\Redirector\*" "\Server\*" "\System\*" "\Server Work Queues(*)\*" "\DFS Replicated Folders(*)\*" "\DFS Replication Connections(*)\*" "\DFS Replication Service Volumes(*)\*" -si 00:00:15
````

These trace sessions will appear in Performance Monitor:
![Performance Monitor trace sessions](/.attachments/dfsr/Slow_replication_in_depth_1.png)

**Step 2**: To start the trace sessions, you may right-click and choose start on each session while in Performance Monitor or via the following commands:
````
Logman.exe start PerfLog-5min
Logman.exe start PerfLog-15sec
````

**Step 3**: To stop the trace sessions after a sufficient collection period, you may use Performance Monitor or via the following commands:
````
Logman.exe stop PerfLog-5min
Logman.exe stop PerfLog-15sec
````

# Thinking through replication operations and resource requirements

It is important to consider the flow of updates. This way, you may isolate the resource that is underperforming and verify its impact on replication.

The basic flow of an update is as follows [ms-frs2 - client details](https://msdn.microsoft.com/en-us/library/dd303452.aspx):
1. On one Server A, content is updated and triggers a USN change notification to the local DFSR service.
2. Server A's DFSR database is updated with the metadata for the update.
3. Replication partner Server B is notified that updates are available.
4. Server B requests a version vector exchange and identifies that it requires the update.
5. Server B requests the updates from Server A.
6. Server A builds the response and sends the update to Server B.
7. Server B processes the update.

Monitor the backlog manually or via a scheduled task.

**Ask questions:**
- Does the backlog decrease overnight and then rise again the next day?
- If the replication performance of files decreases at certain periods of the day, is there a corresponding increase in other resources at precisely those times, such as disk utilization, network latencies, or processor utilization?
- What additional diagnostic data (debug logs, network captures, Xperf-level data, etc.) would complement the performance data to understand a performance transition from an acceptable to unacceptable level?
- Are resources overloaded and DFSR is simply unable to keep up with demand?

**Examples:**

Increase in file operations of replicated data on the D volume occurring at specific times of the day (4pm-6pm). It would be expected for the backlog to increase during these times.
![File operations increase](/.attachments/dfsr/Slow_replication_in_depth_2.png)

Bytes replicated occur during the day, virtually none overnight:
![Bytes replicated](/.attachments/dfsr/Slow_replication_in_depth_3.png)

The performance data of the server shows that the average disk seconds per read ("avg. disk sec/read" highlighted in grey) is experiencing an increase in response latencies during evening hours.
![Disk response latencies](/.attachments/dfsr/Slow_replication_in_depth_4.jpg)

The slow disk responses start manifesting at around 6pm but seem to be sustained at an average 0.08 seconds per read between 7pm-9am each day. This is an extremely slow response time and will greatly impact DFSR performance. Below are general classifications of disk performance for Avg Disk sec/read or write:

**Excellent = .008  
Good = .012  
Fair = .020  
Poor = .030**


_All screenshots, machine name references, IP addresses, and log outputs are from internal lab machines and not customer data._
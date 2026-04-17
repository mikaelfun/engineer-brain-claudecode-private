---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/DFSR/Workflow: DFSR: Data Collection"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FDFSR%2FWorkflow%3A%20DFSR%3A%20Data%20Collection"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1320792&Instance=1320792&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1320792&Instance=1320792&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:**  
This guide provides detailed steps for troubleshooting Distributed File System Replication (DFSR) issues. It includes data collection methods, tools, and commands to diagnose and resolve common DFSR problems.

[[_TOC_]]


# DFSR troubleshooting guide

For DFSR troubleshooting, it is critical to obtain all relevant diagnostic data from appropriate members. This means collecting DFSR-specific diagnostic data via the Windows Troubleshooting Script (TSS) and, as needed, setting up additional data collection or configurations to help investigate future occurrences of problematic behavior.

**It is good to set expectations with customers that we will likely need to collect data on multiple members/servers and may need to collect multiple sets of data.**

## Data collection details

How you gather the data and what you can expect to obtain...

Currently, the best method for collecting data is utilizing the Windows **T**rouble**s**hooting **S**cript (TSS) Toolset.

- Customers can download TSS.zip from the public site at https://aka.ms/getTSS
- Have the customer unzip the TSS.zip to the machine to collect data on.
- Open an elevated PowerShell prompt and change to the directory where the TSS toolset is located.
- Run the command `.\TSS.ps1 -SDP Dom` and accept the EULA.
- Unless you have a specific need for the Security event logs, select **No** and then select **1** to **Collect All DFSR** Information.

  ![Screenshot of TSS for dfsr](/.attachments/image-11d663c2-1f7b-4758-bd80-9378ce852471.png)

Note: _The defaults will be yes to collect the security log and collect all DFSR information after the built-in timeouts._

**For information regarding TSS please see:**   
[Getting Started with Windows TroubleShootingScript (TSS) Toolset](https://internal.evergreen.microsoft.com/en-us/topic/1baaa597-fafe-85f3-1dae-3dec5329f101)

### SDP: dfsr data collected

See below for the various information collected by the diagnostic.

- The script will write the data collection into the `C:\MS_Data\SDP_Dom` folder by default. See below the "tss_240202-191840_2022-FDC1-F_psSDP_Dom.zip" file contains the results of the collection.

  ![screenshot of SDP content folder](/.attachments/image-d38bcdfb-5d9b-4870-8031-40d63e5441d6.png)

#### DFSR health reports

({Computername}_DFSR_{RG_Name}_HealthReport.html/xml) - For each replication group, an HTML health report is generated. It contains:

- Errors and warnings for all contained members (per Anti-Eventing, only relevant events are reported efficiently; for event timing, consult DFS Replication event log).
- Per member: FQDN, Domain, DC contacted, IP information, AD Site, local Time Zone, Service State, Uptime, DFSRS.EXE/Service version, Summary of Replicated Folder: Name, Status by name (`0: Uninitialized, 1: Initialized, 2: Initial Sync, 3: Auto Recovery, 4: Normal, 5: In Error`), # of files received since started, Bandwidth Savings.
- Per configured volume/drive: Size, Free Space, %Free Space, USN Journal Size.

#### DFSR conflicts and deletes

({Computername}_DFSR_ConflictAndDeleted.xls) - XLS Excel file about conflicts and remote deletions, relevant if customer reports missing files.

#### DFSR file versions

({Computername}_DFSR_File_Versions.txt) - Versions number of relevant files.

#### DFSR configuration information

({Computername}_DFSR_Info.txt)  Detailed information about DFSR-specific configuration settings.

- Reports detected members, connections, replication groups, and replicated folders hosted by the target server.
- Identifies the volume(s) hosting replicated data.
- Complexity of the environment, very important when authoritative restore should be considered.
- Topology: Hub/spoke, full mesh, or a combination.
- Connection topology (site topology per NTDS settings when it is Sysvol).
- Reports configured staging folder sizes, if folders are read-only, replication schedules, bandwidth throttling, disabled connections or members, file or folder replication filters.
- Machine configuration information: debug log configuration, high/low watermark config.
- Configuration information stored in Active Directory: Member objects, DFSR-LOCALSETTINGS, DFSR-GLOBALSETTINGS, object permissions.

#### DFSR database GUIDs

({Computername}_DFSR_DBGUIDs.txt)  Relevant for debug log analysis, to convert DB-GUID to owning member names.

#### DFSR registry key

({Computername}_DFSR_RegKey_DFSR.txt)  Registry settings for DFSR.

#### DFSR debug log files

(Dfsr*.log, Dfsr*.log.gz) - Debug logging is enabled by default at level '4', creates 1000 rolling log files, and are written to the `c:\windows\debug` folder of a DFSR server. (Note: Analyzing DFSR debug logs may require consulting a DFSR SME for collaboration).

**Important:**    
Ensure that when collecting the diagnostic data, you do so simultaneously from each replication partner requiring investigation. Failure to do so may result in a failure to properly identify the reason for a particular behavior. Usually, replication behaviors can only be explained when analyzing both the source and destination partners. 

---

## Problem scenarios

The problem scenario (**slow** replication, **failing** replication, **root cause analysis**) may influence data collection. You may start with the following per scenario:

### Slow replication

Customer observes increasing backlog or unexpected replication delay:

- **TSS-SDP**/Support Diagnostic from both members.
- **Canary file**, to provide observable activities within the debug logs of the Upstream and Downstream partners.
- **Performance monitor** (to provide context to the debug logs and pinpoint slow dependencies).
- **Network captures** (optional, but increasingly necessary if above data sources suggest network-related issues).

### Failing replication

No replication is observed and replication backlog never decreases:

- **TSS-SDP**/Support Diagnostic from both members.
- **Canary file**, to provide observable activities within the debug logs of the Upstream and Downstream partners.
- **Network captures** (essential in scenarios where symptoms suggest a connectivity failure).

### Root cause analysis

Replication is now operating properly, but the customer wishes to investigate a prior failure:

- **TSS-SDP**/Support Diagnostic from both members (must be collected as soon as possible as debug logs are circular).
- Request s**pecific file names and paths** of affected data and timeframe of the issue (as closely as possible). The customer needs to provide exact path information when RCA focus is about specific files/folders to allow proper review of debug logs.
- **Setting expectations** about RCA:
  - Only operations covered in available debug logs may be evaluated.
  - Debug logs only cover the when, what, and where. It is not possible to determine who modified content or why the content was modified or deleted.

### Data collection items

- **TSS-SDP**: See _Data Collection Details_ section above for details.
  - The ideal time to collect SDP is at the end of the current troubleshooting session (to allow for correlation of debug log entries with canary file processing, performance data, and network captures).

- **Canary file**: Strict timing, file name, and file location information from the customer about when a behavior or problem can be reproduced. This information may then be mined from the debug logs to help explain the behaviors. It is very helpful to reproduce the failure with unique file names (e.g., LocalServerName_Date_Time.txt) at a specific time and allowed sufficient time for the DFSR service to attempt replication of them. Then, collect the "Windows Directory Services" diagnostic data from both partners.

- **DFSR-specific utilities**: These can include DfsrDiag.exe backlog and replicationstate data for immediate feedback on DFSR operations, or appropriate DFSR PowerShell cmdlets.

- **Performance monitor**: Collections on both DFSR servers to correlate DFSR operations with other dependencies, such as disk, CPU, memory, and network performance counters.

- **Network captures**: Ideally gathered from both partners simultaneously and for as short of a period to reproduce the problem.

---

## Collection timing and extension

- Determine the optimal time to gather the data and that the collected data will represent the issue. You want to ensure that the performance, debug, and event log data covers the period of interest. Verify that the debug logs being gathered cover the necessary time range, as some busy servers may wrap 1000 logs in just a matter of minutes or hours. Ensure that the performance counter sample intervals are small enough to capture transient states.
- Gather backlog reports and/or replication state output at strategic times to confirm the period of the problem state. Be careful to only run the backlog report sparingly as it does temporarily interrupt replication operations.
- Although rare, if it is necessary you may increase the size of the BLG output files and consider [increasing the number of debug logs](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1372793/WMIC) maintained by the service (`wmic /namespace:\\root\microsoftdfs path dfsrmachineconfig set maxdebuglogfiles=2000`) while accounting for the additional disk space consumption. Depending on the scenario, [increased verbosity of the debug logs](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1372793/WMIC) may be temporarily enabled (`wmic /namespace:\\root\microsoftdfs path dfsrmachineconfig set debuglogseverity=5`). Remember to return the values back to defaults prior to case closure.

---

## Tool outputs: utilities and commands

Note: With Windows Server 2012 R2, we introduced the new feature of DFSR Windows PowerShell. For the corresponding cmdlet for the tool outputs mentioned, please visit the blog [DFSR pwrshell](https://blogs.technet.microsoft.com/filecab/2013/08/20/dfs-replication-in-windows-server-2012-r2-if-you-only-knew-the-power-of-the-dark-shell/) and article [DFSR cmdlet reference](https://docs.microsoft.com/en-us/powershell/module/dfsr/?view=win10-ps).

### DFSR backlog report

To determine how many acknowledged updates have yet to be replicated between partners:
```powershell
dfsrdiag backlog /ReceivingMember:<Server> /SendingMember:<Partner Server> /RGName:<Replication Group Name> /RFName:<Replicated Folder Name>
```

```powershell
Get-DfsrBacklog -GroupName rg01 -FolderName * -SourceComputerName srv02 -DestinationComputerName srv01 -verbose | ft FullPathName
```

The output details the number of content updates pending replication from the Sending member to the Receiving member. The 100 files awaiting replication in the top of the backlog are listed. Below, 82 content changes are awaiting replication:

![backlog file count](/.attachments/DFSR/DFSR_Data_Collection_image_2.png)

### Replication state information

Gives you an instantaneous list of files actively being replicated (transmitted) over a connection:

```powershell
Get-DfsrState -ComputerName srv01 | Sort UpdateState -descending | ft path,inbound,UpdateState,SourceComputerName -auto -wrap
```

The 'replicationstate' command is lightweight and may be used repeatedly to determine if, during each execution of the command, different files are being processed by the replication service and confirming that replication is processing.

  ![dfsr Replication state output](/.attachments/image-348f57ac-1dad-4ed8-a37a-1a9923e9700f.png)

Interpreting the output:

- **Active inbound connection** - Lists connections over which data/updates are replicated into the server running the replicationstate command.
- **Connection GUID** - The connection GUID is a unique identifier that distinguishes individual connections on a DFS Replication member server.
- **Active outbound connection** - Lists connections over which data/updates are replicated out from the server running the replicationstate command.
- **Sending member** - The name of the replication partner which is sending data over the specified connection.
- **Number of updates** - The sum of the number of updates being currently processed and scheduled for the given connection.
- **Updates being processed** - The number of updates that the DFS Replication service is currently processing (downloading for inbound and transmitting for outbound connections).
- **Updates scheduled** - The number of updates that have been queued for processing over the connection.
- **Update name** - The name of the file being replicated (updates processed).

For further details:
[Dfsrdiag.exe ReplicationState: Whats DFSR up to?](https://blogs.technet.microsoft.com/filecab/2009/05/28/dfsrdiag-exe-replicationstate-whats-dfsr-up-to/)

---

### Replicated folder state

The query below is useful to evaluate the state of all replicated folders hosted by the target server. This can help you quickly evaluate if the DFSR service is in an error state for a replicated folder, undergoing initial synchronization, or is in a normal state.

```cmd
wmic /namespace:\\root\microsoftdfs path dfsrreplicatedfolderinfo get replicationgroupname,replicatedfoldername,state
```

 **Note:** Run the command above exactly as stated.

Example output:
```cmd
ReplicatedFolderName ReplicationGroupName State 
rftestfolder1        rg3                  4 
rftestfolder2        rg2                  2 
rftestfolder3        rg5                  2 
```

The "State" values can be:

0 = Uninitialized  
1 = Initialized  
2 = Initial Sync  
3 = Auto Recovery  
4 = Normal  
5 = In Error  

Any unexpected state may be important in isolating why the server or specific replicated folder is not operating as expected.

---

### Performance data

Performance data can give you great insight into the inner workings of DFSR and how the service is responding to server resource utilization, network states, or configuration settings.

Beyond the data provided within the DFSR diagnostic package, performance data can give you great insight into the inner workings of DFSR and how the service is responding to server resource utilization, network states, or configuration settings.

DFS Replication provides three categories of counters to help evaluate the performance of various operations:

- DFS Replicated Folders
- DFS Replication Connections
- DFS Replication Service Volumes

The commands below may be leveraged as-is or modified to tune the duration of the collection or frequency of the samples. The first command configures a sample interval of 5 minutes, while the second has an interval of 15 seconds. These two intervals are useful if the "condition" or abnormal behavior is short-lived or if you require performance data over a longer period to observe patterns in performance from day to day. The overhead for this logging is low.

Below are examples of the two commands that may be leveraged to create these performance trace sessions. Each BLG output file is limited to a maximum of 300 MB. The size of the BLG is largely dependent upon the number of replicated folders, connections, volumes, and other resources on the system. For example, a server replicating 4 replication groups, 4 replicated folders, and across 4 volumes will allow collection of data for around 15 hours with a sample interval of 15 seconds. A sample interval of 300 seconds for this server will accommodate approximately 55 hours of data.

#### PerfCounter logman commands

The commands below will create the trace log session on the system with the specified counters:

```cmd
Logman.exe create counter PerfLog-5min -o "c:\perflogs\PerfLog-5min.blg" -f bincirc -v mmddhhmm -max 300 -c "\LogicalDisk(*)\*" "\Memory\*" "\Cache\*" "\Network Interface(*)\*" "\Paging File(*)\*" "\PhysicalDisk(*)\*" "\Processor(*)\*" "\Processor Information(*)\*" "\Process(*)\*" "\Redirector\*" "\Server\*" "\System\*" "\Server Work Queues(*)\*" "\DFS Replicated Folders(*)\*" "\DFS Replication Connections(*)\*" "\DFS Replication Service Volumes(*)\*"  -si 00:05:00
```

```cmd
Logman.exe create counter PerfLog-15sec -o "c:\perflogs\PerfLog-15sec.blg" -f bincirc -v mmddhhmm -max 300 -c "\LogicalDisk(*)\*" "\Memory\*" "\Cache\*" "\Network Interface(*)\*" "\Paging File(*)\*" "\PhysicalDisk(*)\*" "\Processor(*)\*" "\Processor Information(*)\*" "\Process(*)\*" "\Redirector\*" "\Server\*" "\System\*" "\Server Work Queues(*)\*" "\DFS Replicated Folders(*)\*" "\DFS Replication Connections(*)\*" "\DFS Replication Service Volumes(*)\*"  -si 00:00:15
```

These trace sessions will appear in Performance Monitor:

![DFSR Perflog](/.attachments/DFSR/DFSR_Data_Collection_image_4.png)

To start the trace sessions, you may right-click and choose start on each session while in Performance Monitor or via the following commands:

```cmd
Logman.exe start PerfLog-5min 
Logman.exe start PerfLog-15sec
```

Allow collection of the performance metrics to sufficiently capture the server's operations during a reproduction of the problematic behavior. To stop the trace sessions after a sufficient collection period, you may use Performance Monitor or via the following commands:

```cmd
Logman.exe stop PerfLog-5min 
Logman.exe stop PerfLog-15sec
```

The performance data (BLG files) may be reviewed on any Windows server or client system.

---

### Network captures

Network captures may help isolate if the replication behaviors are due to a particular network condition or failure. If possible, gather network traces simultaneously on two direct replication partners. Network captures may be gathered via a dedicated network capture tool ([Network Monitor](https://www.microsoft.com/en-us/download/details.aspx?id=4865), [Message Analyzer](https://www.microsoft.com/en-us/download/details.aspx?id=44226), Wireshark), Netsh, or on a diagnostic/mirrored port of a switch.

Below are some steps to gather a network capture. A network capture of 2 minutes is advisable, but for busy file servers, you may have to shorten the duration. Monitor the number of packets being gatheredif the count increases beyond 400,000-500,000 frames, you may wish to stop the captures.

#### Network Monitor 3.4

Begin a network capture using the command below in an elevated command prompt. If Network Monitor 3.4 is not already installed, it may be downloaded from http://www.microsoft.com/en-us/download/details.aspx?id=4865.

Syntax to create a chain of 300MB output files until stopped:

```cmd
%ProgramFiles%\Microsoft Network Monitor 3\nmcap" /network * /capture /file c:\temp\%ComputerName%.chn:300M /DisableConversations
```

#### Netsh.exe

(Included within Windows Server 2008 R2, but not appropriate for later operating systems)

Syntax to start a capture:

```cmd
Netsh trace start capture=yes report=no tracefile=c:\temp\capture.cap maxsize=400MB
```

Syntax to stop a capture:

```cmd
Netsh trace stop
```

#### PowerShell

(For operating systems version 2012 and later)

Syntax to start a capture:

``` powershell
New-NetEventSession -Name netTrace -LocalFilePath "c:\netTrace.etl" -MaxFileSize 1024; Add-NetEventPacketCaptureProvider -SessionName netTrace -Level 4 -TruncationLength 1500; Start-NetEventSession netTrace 
````
 
Syntax to stop a capture: 
``` powershell
Stop-NetEventSession netTrace; ren C:\netTrace.etl C:\netTrace`_$(Get-Date -f MM-dd_HH-mm-ss)`.etl; Remove-NetEventSession netTrace 
````

---
**TSS using ADS_DFSR scenario (Temp until DFSR perf switch created)** 

Syntax to start a capture: 
``` powershell
.\TSS.ps1 -Start -Scenario ADS_DFSR -Netsh -WPR General -SkipPdbGen 
````


_All screenshots, machine name references, IP addresses, and log outputs are from internal lab machines and not customer data._
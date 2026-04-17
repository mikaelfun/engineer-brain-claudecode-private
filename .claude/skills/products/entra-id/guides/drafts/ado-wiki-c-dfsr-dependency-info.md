---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/DFSR/Workflow: DFSR: Dependency information"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FDFSR%2FWorkflow%3A%20DFSR%3A%20Dependency%20information"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1320793&Instance=1320793&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1320793&Instance=1320793&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:**   
This article details the components and dependencies of the Distributed File System Replication (DFSR) service, focusing on network and disk requirements, Active Directory dependencies, and useful paths and logs. It includes specific port information, disk stability requirements, and Active Directory container locations.

[[_TOC_]]

# DFSR service: components and dependencies

The chart below details the components and dependencies of the DFSR service.

Distributed File System Replication (DFSR) is highly dependent on the available network and disk I/O. DFSR has no chance of success without a stable network and disk infrastructure.

![DFSR Workflow Dependency Information](/.attachments/dfsr/Workflow_DFSR_Dependency_information.png)

## Network requirements for DFSR

RPC (Remote Procedure Call) - TCP (Transmission Control Protocol) - Port 135  
RPC - TCP - Randomly assigned port number between 49152-65535

| Application Protocol | Network Protocol | Ports |
|--|--|--|
| RPC | TCP | 135 |
| RPC | TCP | Random port assigned between 49165-65535 (see note 2 below) |
| RPC | TCP | 5722 (see note 1 below) |

**Note 1:** Port 5722 is a legacy port that was only used on Domain Controllers running Windows Server 2008/2008 R2. It is not used for or on anything running Windows Server 2012 and above.

**Note 2:** By default, DFSR will use multiple dynamic RPC ports for replication and management. It may be necessary in some restricted environments to limit the traffic to a specific port. This can be done using the command line (`dfsrdiag`) or PowerShell (`Set-DfsrServiceConfiguration`). See the [DFSR: Useful Tools and Commands](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1357247/Workflow-DFSR-Useful-Tools-and-Commands) wiki page for more details.

Ref: [Service overview and network port requirements for Windows](https://learn.microsoft.com/en-us/troubleshoot/windows-server/networking/service-overview-and-network-port-requirements)

## Disk requirements

The disk subsystem must always be stable and available. Instability with the disk will cause database issues and recovery events that can be detrimental to replication and performance. If you are having disk issues, you will need to engage your storage team or vendor for investigation and troubleshooting. If there is an issue with the Windows components or disk subsystem, then the **Windows High Availability team** should be engaged for assistance.

### DFSR service ESE database

- **Definition:** One single monolithic Extensible Storage Engine (ESE) DFSR database per volume, even if there are multiple replicated folders from different replication groups.
- **Location:**
  - Root folder: `%volumeLetter%\System Volume Information\DFSR`
  - Specific folder: `\DFSR\database_50DA_221B_DA21_FDBA` (please note that DA21_FDBA could match volume Serial Number)
  - Example:
    ```
    C:\ms>dir  
    Volume in drive C is Windows  
    Volume Serial Number is DA21-FDBA
    ```
- **Logs:** Application log, Source ESENT, monitor for:
  - W 508, 510, 533, 902, 906, 482, 428 ESENT storage performance issues
  - W 636, 640 ESENT database access issues
  - E 454, 455 ESENT database logging/recovery attempted/failed

### XML configuration files

- **Definition:** Multiple XML files describing the DFSR infrastructure
  - One XML per volume (`Volume_xyz.xml`)
  - One XML per each replication group defined on the volume (`Replica_1.xml`, `Replica_2.xml`, etc.)
  - One XML as a placeholder of the last installation/change on the server (`DfsrMachineConfig.xml`)
- **Location:**
  - Root folder: `%volumeLetter%\System Volume Information\DFSR\config`

## Active Directory dependencies

### DFSR-LocalSettings container

| | |
|--|--|
| **Definition** | Under the computer account object of a DFSR server, defining current memberships |
| **Location 1** | **DFSR-LocalSettings container:** `CN=DFSR-LocalSettings,CN=ContPKIMUM,OU=TestGPOs,DC=contoso,DC=com` |
| **Location 2** | **DFSR Subscriptions:** `CN=a95dec9f-b491-4ddb-a971-33e04b99b76a,CN=DFSR-LocalSettings,CN=ContPKIMUM,OU=TestGPOs,DC=contoso,DC=com` |

### DFSR-GlobalSettings container

| | |
|--|--|
| **Definition** | Under the Domain NC System Container, describing all replication groups, replicated folders, and members, in the local domain or in trusted domains of the same forest |
| **Location 1** | **DFSR-GlobalSettings container:** `CN=DFSR-GlobalSettings,CN=System,DC=contoso,DC=com` |
| **Location 2** | **Replication group info:** `msDFSR-ReplicationGroup` class objects, like `CN=RG1,CN=DFSR-GlobalSettings,CN=System,DC=contoso,DC=com` |
| **Location 3** | **Replication folder(s) info:** `msDFSR-ContentSet` class objects, like `CN=RG1,CN=Content,CN=RG1,CN=DFSR-GlobalSettings,CN=System,DC=contoso,DC=com` |
| **Location 4** | **Topology (members) info:** `msDFSR-Member` class objects, like `CN=9f8e2fc5-9dd2-41a1-af19-fc063e8bb64c,CN=Topology,CN=RG1,CN=DFSR-GlobalSettings,CN=System,DC=contoso,DC=com` |

_All screenshots, machine name references, IP addresses, and log outputs are from internal lab machines and not customer data_
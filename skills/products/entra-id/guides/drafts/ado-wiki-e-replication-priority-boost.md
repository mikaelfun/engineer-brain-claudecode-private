---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/AD Changes in Windows Server 2025 and Windows 11 24H2/Replication Priority Boost"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FAD%20Changes%20in%20Windows%20Server%202025%20and%20Windows%2011%2024H2%2FReplication%20Priority%20Boost"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1712890&Instance=1712890&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1712890&Instance=1712890&Feedback=2)

___
<div id='cssfeedback-end'></div>

![VNext-Banner.png](/.attachments/VNext-Banner-098bb40b-bb91-44b9-9e54-14a3e12b6701.png)
[[_TOC_]]

<span style="color:CornflowerBlue">**Note:** <span style="color:Black">Before diving into the details of the new feature, this document provides a primer on the topic to ensure readers have the necessary background and context to fully understand the changes.

#**Pre-Req information**
- Active Directory Replication Concepts [Click here](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/get-started/replication/active-directory-replication-concepts)


#Replication Priority Boost

AD now allows administrators to increase the system calculated replication priority with a particular replication partner for a particular Naming Context (NC). This feature allows more flexibility in configuring the replication order to address specific scenarios.

Active Directory is a distributed system.  When a write happens on one DC, it is propagated to other DCs through replication.  Changes may happen concurrently on multiple DCs.  A destination DC gets the changes from its replication partners one after another.

When a destination DC retrieves changes from multiple DCs, these tasks are served based on their respective priority.  What is the priority of a particular task is determined by a set of hard-coded numbers in Active Directory.  The priority numbers are designed to follow some heuristics rules. 

For example, the Configuration NC has higher priority because a topology change might be more important.  Intra-site partners have higher priority because geographically closer DCs might have more relevant changes for the DCs in the same site.

##Scenarios for priority:

While these built-in priority numbers work fine in most scenarios, there are cases where customers may desire a different order of the priority of replication tasks.  

For example, in some configurations, customers may have one site for active and the other site for backup, that for the relay site, anything happens in the active site is more important than intra-site changes.  Another example is over-the-wire installation.  For forests with large databases, this is a very time-consuming process. The new DC wants to stick to the same source DC for replication, instead of switching to other DCs which could cause the replication to restart from the beginning.

The Replication Priority Boost feature is designed to help customers in these situations.  It is achieved via a rootDSE modify operation, to specify a priority boost on top of the built-in priority of a naming context with a partner DC.  Each boost factor adds 10 to the base priority.  Typically, a boost factor of 2 would give a replication partner higher priority than its peer DCs on the same naming context. The rootDSE attribute _msDS-PriorityBoost_ provides the current setting of replication boost.

- Relay Sites 
- DC Promo (Replication over the wire) 


##Active Directory Replication priority order
- Security & Critical changes: User passwords, Account lockouts 
- Schema & Configuration partitions 
- Domain Partition 
- Application partitions (like ForestDNSZones and DomainDNSZones)

##Applicable to 
- Windows Server 2025 Domain Controller 
- Windows Server 2025 ADLDS instance 

#Operating System: (Supported)
- Windows Server 2025 <br>
(There is no DFL or FFL requirement)<br>

**Priority Values:** 1-10 (1 being Highest and 10 being Lowest)

**Example:** DC=EMEA,DC=contoso,DC=com:7bebde39-d04f-4bfe-9b25-4aac73927f24:1

The Source DC the Destination DC is pulling the changes from does not need to be a Windows Server 2025 DC. 
In the below example the Destination-DC10 can get replication boost from a Windows Server 2019 Domain Controller. 
The Administrator would configure Source-DC01 in the RootDSE attribute for a given partition.   

![ReplicationBoost.png](/.attachments/ReplicationBoost-a1e091f2-e486-4e60-bcf4-014b5a96751b.png)

#How to increase the priority order

- Sign-in using an Enterprise Admin
- Open LDP.exe
- Connect and Bind to the destination domain controller
- Attribute name: SetPriorityBoost
- Value: dc=contoso,dc=com:<DSAGuid>:<PriorityValue>

![LDP.png](/.attachments/LDP-7aea54df-9d49-41c3-81db-be289b17b332.png =350x500)

 
#Replication Events

Increase the "5 Replication Events" diagnostic logging value to 5:

_reg add "HKLM\SYSTEM\CurrentControlSet\Services\NTDS\Diagnostics" /v "5 Replication Events" /t REG_DWORD /d 5 /f_

```
Log Name:      Directory Service
Source:        Microsoft-Windows-ActiveDirectory_DomainService
Date:          10/25/2024 8:06:43 AM
Event ID:      1045
Task Category: Replication
Level:         Information
Keywords:      Classic
User:          ANONYMOUS LOGON
Computer:      vNextDC01.contoso.com
Description:
Internal event: The directory replication agent was prompted to modify the repsFrom attribute with the following parameters. 
 
Directory partition:
DC=EMEA,DC=contoso,DC=com 
Source UUID:
7bebde39-d04f-4bfe-9b25-4aac73927f24 
Source address:
 
Replica-Flags:
0x0 
Modify-Fields:
0x100 
Options:
0x0
```

```
Log Name:      Directory Service
Source:        Microsoft-Windows-ActiveDirectory_DomainService
Date:          10/25/2024 8:06:43 AM
Event ID:      3073
Task Category: Replication
Level:         Information
Keywords:      Classic
User:          ANONYMOUS LOGON
Computer:      vNextDC01.contoso.com
Description:
The directory replication agent was prompted to modify the repsFrom attribute priority boost. 
 
Directory partition:
DC=EMEA,DC=contoso,DC=com 
Source UUID:
7bebde39-d04f-4bfe-9b25-4aac73927f24 
Old Priority Boost:
0 
New Priority Boost:
1 
 
Recommendations: priority boost is designed to boost the priority of some replicas higher than its peer replicas in the same category.  2 or 3 is the recommended value for this purpose. 
It is not recommended to boost the priority too high that it may supress the replication jobs in other categories. 

For example, it is not recommended to boost the domain NC priority higher than Configuration NC, so that a boosted job can be preempted for more important information.  Not to boost an asynchronous job higher than a synchronous job to allow Active Directory to be responsive to a blocking request.  Not to boost any job priority higher than a synchronous ReplicaModify job to allow changing priority boost in te middle of a boosted job. 
The default replication job priorities can be found by dumping the replication queue.

```

```
Log Name:      Directory Service
Source:        Microsoft-Windows-ActiveDirectory_DomainService
Date:          10/25/2024 8:06:43 AM
Event ID:      3073
Task Category: Replication
Level:         Information
Keywords:      Classic
User:          ANONYMOUS LOGON
Computer:      vNextDC01.contoso.com
Description:
The directory replication agent was prompted to modify the repsFrom attribute priority boost. 
 
Directory partition:
DC=EMEA,DC=contoso,DC=com 
Source UUID:
7bebde39-d04f-4bfe-9b25-4aac73927f24 
Old Priority Boost:
0 
New Priority Boost:
1 
 
Recommendations: priority boost is designed to boost the priority of some replicas higher than its peer replicas in the same category.  2 or 3 is the recommended value for this purpose. 
It is not recommended to boost the priority too high that it may supress the replication jobs in other categories. 

For example, it is not recommended to boost the domain NC priority higher than Configuration NC, so that a boosted job can be preempted for more important information.  Not to boost an asynchronous job higher than a synchronous job to allow Active Directory to be responsive to a blocking request.  Not to boost any job priority higher than a synchronous ReplicaModify job to allow changing priority boost in te middle of a boosted job. 
The default replication job priorities can be found by dumping the replication queue.
```

```
Log Name:      Directory Service
Source:        Microsoft-Windows-ActiveDirectory_DomainService
Date:          10/25/2024 8:06:43 AM
Event ID:      1060
Task Category: Replication
Level:         Information
Keywords:      Classic
User:          ANONYMOUS LOGON
Computer:      vNextDC01.contoso.com
Description:
Internal event: The directory replication agent request was successfully completed.
```

```
Log Name:      Directory Service
Source:        Microsoft-Windows-ActiveDirectory_DomainService
Date:          10/25/2024 8:06:51 AM
Event ID:      1070
Task Category: Replication
Level:         Information
Keywords:      Classic
User:          ANONYMOUS LOGON
Computer:      vNextDC01.contoso.com
Description:
Internal event: The directory service was prompted to synchronize a replica of the following directory partition with the directory service at the following network address with these options 
 
Directory partition:
DC=emea,DC=contoso,DC=com 
Network address:
7bebde39-d04f-4bfe-9b25-4aac73927f24 (vNextChildDC01.emea.contoso.com) 
Options:
0x3 
Active ReplicaSync sessions:
1
```


___
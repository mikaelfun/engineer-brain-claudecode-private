---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/AD Replication/Workflow: Common Solutions to Replication Failures/Error 8606 - Lingering Objects"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FAD%20Replication%2FWorkflow%3A%20Common%20Solutions%20to%20Replication%20Failures%2FError%208606%20-%20Lingering%20Objects"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/423188&Instance=423188&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/423188&Instance=423188&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This walkthrough provides detailed steps to troubleshoot and resolve Active Directory (AD) replication error 8606, which occurs due to insufficient attributes being given to create an object. The guide covers identifying and removing lingering objects using various tools like repadmin.exe, repldiag.exe, and the Lingering Object Liquidator (LoL) tool.

---

# **Walkthrough: troubleshoot and resolve AD replication error 8606**

**8606 | Insufficient attributes were given to create an object**

In this exercise, you will use repadmin.exe to identify lingering objects. You will then use the Lingering Object Liquidator tool to remove lingering objects from the Contoso forest and resolve AD replication error 8606 in the process.

repadmin or repldiag.exe will also be described to understand the manual steps and what LoL is performing.

This replication status indicates that one or more lingering objects exist on the source domain controller (DC).

**Tip:**  
This section is jargon intense, a **Lingering Object Glossary** is provided in the Appendix for your reference.

**More:**  
Lingering object: An object that is present on one DC, but has been deleted and garbage collected on one or more DCs. Error 8606 is logged when the source DC sends an update of one or more attributes for an object that does not exist on the destination DC.

---

**Useful links:**

[Active Directory Replication Error 8606: "Insufficient attributes were given to create an object"](https://learn.microsoft.com/troubleshoot/windows-server/active-directory/replication-error-8606)  

[Description of the Lingering Object Liquidator tool](https://learn.microsoft.com/troubleshoot/windows-server/active-directory/lingering-object-liquidator-tool)  

You can find in this article the main graphical user interface of LingeringObject Liquidator and the legend that explains each UI element:

[ADREPL: Tools: Lingering Object Liquidator v2 (LOL) usage](https://internal.evergreen.microsoft.com/topic/4c2bfb2d-1065-9d8d-7e52-be2fd24b3e24)  

[ADREPL: TOOLS: Lingering Object Liquidator (LOL) usage and availability](https://internal.evergreen.microsoft.com/topic/1a2e50b8-a895-de6a-9a54-647deae816ed)  

[Remove Lingering Objects that cause AD Replication error 8606 and friends](https://techcommunity.microsoft.com/blog/askds/remove-lingering-objects-that-cause-ad-replication-error-8606-and-friends/400292)  

---

**Cause**

Error 8606 is logged when the following conditions are true:
- A source domain controller sends an update to an object (instead of an originating object create) that has already been created, deleted, and then reclaimed by garbage collection from a destination domain controller's copy of Active Directory.
- The destination domain controller was configured to run in [strict replication consistency](https://learn.microsoft.com/previous-versions/windows/it-pro/windows-server-2008-R2-and-2008/cc816938(v=ws.10)?redirectedfrom=MSDN).
- If the destination domain controller was configured to use loose replication consistency, the object would have been "reanimated" on the destination domain controller's copy of the directory. Specific variations that can cause error 8606 are documented in the "More Information" section. However, the error is caused by one of the following:
  - A permanently lingering object whose removal will require admin intervention
  - A transient lingering object that will correct itself when the source domain controller performs its next garbage-collection cleanup. The introduction of the first Windows newest OS domain controller in an existing forest and updates to the partial attribute set are known causes of this condition.
  - An object that was undeleted or restored at the cusp of tombstone lifetime expiration
  - When you troubleshoot 8606 errors, think about the following points:
    - Although error 8606 is logged on the destination domain controller, the problem object that is blocking replication resides on the source domain controller. Additionally, the source domain controller or a transitive replication partner of the source domain controller potentially did not inbound-replicate knowledge of a deleted tombstone lifetime number of days in the past.
    - Lingering objects may exist under the following circumstances:
      - As "live" objects, as CNF or conflict mangled objects "live" objects, or as CNF or conflict mangled objects in the deleted objects container of the source domain controller
      - In any directory partition except the schema partition. Lingering objects are most frequently found in read-only domain partitions on GCs. Lingering objects may also exist in writable domain partitions as well as the configuration partition. The schema partition does not support deletes.
      - In any object class (users, computers, groups, and DNS records are most common).
    - Remember to search for potentially lingering objects by object GUID versus DN path so that objects can be found regardless of their host partition and parent container. Searching by object GUID will also locate objects that are in the deleted objects container without using the deleted objects LDAP control.
    - The NTDS Replication 1988 event identifies only the current object on the source domain controller that is blocking incoming replication by a strict mode destination domain controller. There are likely additional objects "behind" the object that is referenced in the 1988 event that are also lingering.
    - The presence of lingering objects on a source domain controller prevents or blocks strict mode destination domain controllers from inbound-replicating "good" changes that exist behind the lingering object in the replication queue.
    - Because of the way that domain controllers individually delete objects from their deleted object containers (the garbage-collection daemon runs every 12 hours from the last time each domain controller last started), the objects that are causing 8606 errors on destination domain controllers could be subject to removal in the next garbage-collection cleanup execution. Lingering objects in this class are transient and should remove themselves in no more than 12 hours from problem start.
    - The lingering object in question is likely one that was intentionally deleted by an administrator or application. Factor this into your resolution plan, and beware of reanimating objects, especially security principals that were intentionally deleted.

_From [Active Directory Replication Error 8606: Insufficient attributes were given to create an object](https://learn.microsoft.com/troubleshoot/windows-server/active-directory/replication-error-8606)_

---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

**Scenario**

- AD replication of the Root partition from DC2 to DC1 fails with error, "Insufficient attributes were given to create an object".
- AD replication of the Root partition from TRDC1 to other GCs hosting a read-only copy of the partition fail with the same error.  
  ![image.png](/.attachments/image-ad097c85-2d44-46fe-a276-668baa49df04.png)

- DC2 and TRDC1 are DCs that have at least one lingering object in the root.contoso.com partition
- DC1 reports error 8606 replicating from DC2

**More:**  
There are many methods to remove lingering objects. This exercise presents 3 most common:
- Lingering Object Liquidator tool
- Repldiag /removelingeringobjects
- Repadmin /removelingeringobjects

Other methods are listed in the appendix.

---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

## **Task 1 - Lingering object symptoms and identification**

AD replication status 8606 and event ID 1988 are good indicators of lingering objects (when the DCs are configured for Strict Replication Consistency). It is important to note, however, that AD replication may complete successfully (and not log an error) from a DC containing lingering objects since replication is based on changes. If there are no changes to any of the lingering objects, there is no reason to replicate them and they will continue to exist. For this reason, when cleaning up lingering objects, do not just clean up the DCs logging the errors; instead, assume that all DCs may contain them, and clean them up as well.

**Symptoms**

- Incoming replication that is triggered by the Replicate Now command in the Active Directory Sites and Services snap-in DSSITE.MSC is unsuccessful and generates the error "Insufficient attributes were given to create an object." When you right-click a connection object from a source DC and then select Replicate now, the replication is unsuccessful and generates the following error: "Access is denied." Additionally, you receive the following error message:
  - _Dialog title text: Replicate Now_
  - Dialog message text: _The following error occurred during the attempt to synchronize naming context <%active directory partition name%> from domain controller <source DC> to domain controller <destination DC>:_
  - _Insufficient attributes were given to create an object. This object may not exist because it may have been deleted and already garbage collected._
- The DCDIAG reports that the Active Directory Replications test failed with error 8606: "Insufficient attributes were given to create an object."
- Various REPADMIN.EXE commands fail with error 8606

Perform this task on DC1.  
Manually initiate replication between DC1 and DC2 (have DC1 pull from DC2):
```
Repadmin /replicate dc1 dc2 "dc=root,dc=contoso,dc=com"
```
Replication fails with the following error:
```
DsReplicaSync() failed with status 8606 (0x219e):
Insufficient attributes were given to create an object. This object may not exist because it may have been deleted and already garbage collected.
```

Event 1988 is logged in the Directory Service event log.  
Review the Directory Services event log on DC1 for event 1988 using event viewer (eventvwr.msc) or PowerShell  
![image.png](/.attachments/image-3e48c2a1-fce4-47c3-bece-ceb48f67c3ca.png)


**Figure 2 Event 1988**

Using event log:  
You can filter the event log using XML:  
Filter current log / XML / edit manually  
Example:
```XML
<QueryList>
  <Query Id="0" Path="Directory Service">
    <Select Path="Directory Service">*[System[(EventID=1988)]]</Select>
  </Query>
</QueryList>
```
Using PowerShell:
```powershell
Get-WinEvent -LogName "Directory Service" -MaxEvents 5 | fl
```
Directly on the DC:
```powershell
Get-WinEvent -FilterHashTable @{LogName='Directory Service';ID='1988'} -MaxEvents 10 | fl message
```
If you have an .evtx file exported from the customer:
```powershell
Get-WinEvent -Path "C:\stagetools\DS.evtx" | Where-Object -Property ID -match "1988" | fl message | Out-File "c:\stagetools\1988.csv"
```

**Note:**  
Event 1988 only reports the first lingering object encountered during the replication attempt. There are usually many more lingering objects present on the source DC. Use repadmin /removelingeringobjects with the **/advisory_mode** switch to have all lingering objects reported.

Identify the following from event 1988 (they are needed later in the exercise):
- Object GUID
- Source DC
- Partition DN

---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

## **Task 2 - Lingering object analysis**

In this task, you will use repadmin to return replication metadata for the lingering object identified in event ID 1988. The repadmin output will allow you to identify DCs containing the lingering object reported in the event.

Perform this task on **DC1** and **DC2**.

Obtain the ObjectGUID reported in the event on **DC1**. (see Figure 1 for location of ObjectGUID)  
Identify all DCs that have a copy of this object using repadmin /showobjmeta
```
Repadmin /showobjmeta * "<GUID=5ca6ebca-d34c-4f60-b79c-e8bd5af127d8>" >obj.txt
```

Open **obj.txt**. Any DC that returns replication metadata for this object are DCs containing one or more lingering objects. DCs that do not have a copy of the object report status 8439, "The distinguished name specified for this replication operation is invalid".

**Which DCs return replication metadata for the object?**

**Important:**  
This is a good method to conduct a quick spot check of DCs containing the lingering object reported in the event. It is NOT a good method to discover all lingering objects. For more information, see the Lingering Object discovery section of the appendix.

Obtain DC1's DSA ObjectGUID and use repadmin /removelingeringobjects with the /advisory_mode parameter to identify all lingering objects in the ROOT partition on DC2.

**Note:**  
In order to use the /removelingeringobjects command you need to know three things:
- You need to know which DCs contain lingering objects
- Which partition the lingering object resides in
- The DSA Object GUID of a good reference DC that hosts that partition that does not contain lingering objects

Obtain the DSA object GUID on DC1
```
Repadmin /showrepl DC1 >showrepl.txt
The DSA object GUID is at the top of the output and will look like this:
DSA object GUID: 70ff33ce-2f41-4bf4-b7ca-7fa71d4ca13e
```

In the following command, you will verify the existence of lingering objects on DC2 by comparing its copy of the ROOT partition with DC1.

Run the following repadmin command (ensure you use the **/advisory_mode** parameter)
```
Repadmin /removelingeringobjects DC2 70ff33ce-2f41-4bf4-b7ca-7fa71d4ca13e "dc=root,dc=contoso,dc=com" /Advisory_Mode
```

RemoveLingeringObjects successful on dc2.

Review the Directory Service event log on DC2. If there are any lingering objects present, each one will be reported in its own event ID 1946. The total count of lingering objects for the partition checked is reported in event 1942.

---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

## **Task 3 - Remove lingering objects**

In this task, you will remove the lingering objects using either LoL or repadmin.

**Note:**

**Lingering Object Liquidator tool**
- Download and run Lingering Object Liquidator on a DC or member computer in the forest you want to remove lingering objects from.
- The Microsoft .NET Framework 4.5.2 must be installed on the computer that's running the tool.
- Permissions: The user account running the tool must have Domain Administrator credentials for each domain in the forest that the executing computer resides in. Members of the Enterprise Administrators group have domain administrator credentials in all domains within a forest by default. Domain Administrator credentials are sufficient in a single domain or a single domain forest.
- You must enable the Remote Event Log Management (RPC) firewall rule on any DC that needs scanning. Otherwise, the tool returns an "Exception: The RPC server is unavailable" error.
- The liquidation of lingering objects in Active Directory Lightweight Directory Services (AD LDS / ADAM) environments is not supported.

You will run commands to remove lingering objects from all partitions even though only one lingering object was discovered in the prior task.

**Important:**  
When lingering objects are discovered, assume they are present on all DCs in all partitions. Do not just clean up the DCs reporting the errors. Repldiag automates the majority of the cleanup work. See the **Lingering Object discovery and cleanup** section in the appendix for more information.

Lingering object detection using Lingering Object Liquidator tool  
Run the tool as a domain administrator (or as an Enterprise administrator if you want to scan the entire forest). To do this follow these steps.  
**Note You will receive error 8453 if the tool is not run as elevated.**  
![image.png](/.attachments/image-ab48454d-83db-4f14-b057-acf72e063dfb.png)

**Lingering Object Liquidator**  
In the Topology Detection section, select Fast.

Fast detection populates the Naming Context, Reference DC, and Target DC lists by querying the local DC. Thorough detection does a more exhaustive search of all DCs and leverages DC Locator and DSBind calls. Be aware that Thorough detection will likely fail if one or more DCs are unreachable.

The following are the fields on the Lingering Objects tab:

**Naming Context**  
![image.png](/.attachments/image-f0160b42-dd58-4cc1-a87d-28e917c0ad3b.png)

**Reference DC**  
This is the DC you will compare to the target DC. The reference DC hosts a writable copy of the partition.  
![image.png](/.attachments/image-31d3d494-e148-466f-91bd-819ad8f13f98.png)

**Note**: All DCs in the forest are displayed even if they are unsuitable as reference DCs (ChildDC2 is an RODC and is not a valid Reference DC since it doesnt host a writable copy of a DC).

**Target DC**  
The target DC that lingering objects are to be removed from.  
![image.png](/.attachments/image-595e11d6-32fb-4378-b634-f1cc75733bfb.png)

Click **Detect** to use these DCs for the comparison or leave all fields blank to scan the entire environment.

The tool does a comparison amongst all DCs for all partitions in a pair-wise fashion when all fields are left blank. In a large environment, this comparison will take a great deal of time (possibly even days) as the operation targets (n * (n-1)) number of DCs in the forest for all locally held partitions. **For shorter, targeted operations, select a naming context, reference DC, and target DC. The reference DC must hold a writable copy of the selected naming context. Be aware that clicking Stop does not actually stop the server-side API, it just stops the work in the client-side tool**.  
![image.png](/.attachments/image-446db719-9e28-4916-8561-316f23e4e353.png)

During the scan, several buttons are disabled, and the current count of lingering objects is displayed on the status bar at the bottom of the screen, together with the current tool status. During this execution phase, the tool is running in an advisory mode and reading the event log data that's reported on each target DC.  
![image.png](/.attachments/image-deacf098-b943-44de-b4f4-d9f576bb05aa.png)

**Current count of lingering objects**

When the scan is complete, the status bar updates, buttons are re-enabled, and the total count of lingering objects is displayed. The Results pane at the bottom of the window updates with any errors encountered during the scan.

If you see error 1396 or error 8440 in the status pane, you are using an early beta-preview version of the tool and should update to the latest version. Error 1396 is logged if the tool incorrectly used a read-only domain controller (RODC) as a reference DC. Error 8440 is logged when the targeted reference DC does not host a writable copy of the partition.

**Notes about the Lingering Object Liquidator discovery method**

- Leverages DRSReplicaVerifyObjects method in Advisory Mode.
- Runs for all DCs and all partitions.
- Collects lingering object event ID 1946s and displays objects in the main content pane.
- List can be exported to CSV for offline analysis (or modification for import).
- Supports import and removal of objects from CSV import (leverage for objects not discoverable using DRSReplicaVerifyObjects).
- Supports removal of objects by DRSReplicaVerifyObjects and LDAP rootDSE removeLingeringobjects modification.

The tool leverages the Advisory Mode method exposed by DRSReplicaVerifyObjects that both repadmin /removelingeringobjects /Advisory_Mode and repldiag /removelingeringobjects use. In addition to the normal Advisory Moderelated events logged on each DC, it displays each of the lingering objects within the main content pane.  
![image.png](/.attachments/image-079f3ed2-27e8-48c7-a695-74011cb58ba1.png)

**Display of lingering objects**

Results of the scan are logged in the Results pane. Many more details of all operations are logged in the linger<Date-TimeStamp>.log.txt file in the same directory as the tool's executable.

The Export button allows you to export a list of all lingering objects listed in the main pane into a CSV file. View the file in Excel, modify if necessary, and use the Import button later to view the objects without having to do a new scan. The Import feature is also useful if you discover abandoned objects (not discoverable with DRSReplicaVerifyObjects) that you need to remove.

**A note about transient lingering objects:**

Garbage collection is an independent process that runs on each DC every 12 hours by default. One of its jobs is to remove objects that have been deleted and have existed as a tombstone for greater than the tombstone lifetime number of days. There is a rolling 12-hour period where an object eligible for garbage collection exists on some DCs but has already been removed by the garbage collection process on other DCs. These objects will also be reported as lingering objects by the tool; however, no action is required as they will automatically get removed the next time the garbage collector process runs on the DC.

To remove individual objects, select a single object or multi-select multiple objects by using the Ctrl or Shift key. Press Ctrl to select multiple objects, or Shift to select a range of objects, and then select Remove.  
![image.png](/.attachments/image-47ffdc3d-2455-4ca4-a1ce-2931c8ace4c5.png)

**Remove individual objects**  
![image.png](/.attachments/image-06d271a0-5397-4fb8-aa0e-aa1b0d7ae2ac.png)

The status bar is updated with the new count of lingering objects and the status of the removal operation:  
![image.png](/.attachments/image-39f67ff2-3c71-4a22-a959-c4f8f409626f.png)


**Status bar**

The tool dumps a list of attributes for each object before removal and logs this along with the results of the object removal in the removedLingeringObjects.log.txt log file. This log file is in the same location as the tool's executable.

```
C:\tools\LingeringObjects\removedLingeringObjects<DATE-TIMEStamp.log.txt
```

**Example contents of the log file:**

```
the obj DN: <GUID=0bb376aa1c82a348997e5187ff012f4a>;<SID=010500000000000515000000609701d7b0ce8f6a3e529d669f040000>;CN=Dick Schenk,OU=R&D,DC=root,DC=contoso,DC=com 
objectClass:top, person, organizationalPerson, user; 
sn:Schenk ; 
whenCreated:20121126224220.0Z; 
name:Dick Schenk; 
objectSid:S-1-5-21-3607205728-1787809456-1721586238-1183;primaryGroupID:513; 
sAMAccountType:805306368; 
uSNChanged:32958; 
objectCategory:<GUID=11ba1167b1b0af429187547c7d089c61>;CN=Person,CN=Schema,CN=Configuration,DC=root,DC=contoso,DC=com; 
whenChanged:20121126224322.0Z; 
cn:Dick Schenk; 
uSNCreated:32958; 
l:Boulder; 
distinguishedName:<GUID=0bb376aa1c82a348997e5187ff012f4a>;<SID=010500000000000515000000609701d7b0ce8f6a3e529d669f040000>;CN=Dick Schenk,OU=R&D,DC=root,DC=contoso,DC=com; 
displayName:Dick Schenk ; 
st:Colorado; 
dSCorePropagationData:16010101000000.0Z; 
userPrincipalName:Dick@root.contoso.com; 
givenName:Dick; 
instanceType:0; 
sAMAccountName:Dick; 
userAccountControl:650; 
objectGUID:aa76b30b-821c-48a3-997e-5187ff012f4a; 
value is :<GUID=70ff33ce-2f41-4bf4-b7ca-7fa71d4ca13e>:<GUID=aa76b30b-821c-48a3-997e-5187ff012f4a> 
Lingering Obj CN=Dick Schenk,OU=R&D,DC=root,DC=contoso,DC=com is removed from the directory, mod response result code = Success 
---------------------------------------------- 
RemoveLingeringObject returned Success 
```

After all objects are identified, they can be bulk-removed by selecting all objects and then Remove, or exported into a CSV file. The CSV file can later be imported again to do bulk removal. Be aware that there's a Remove All button that leverages the repadmin /removelingeringobject method of lingering object removal.

**Repadmin**

Use these steps if you prefer to remove the lingering objects using repadmin.
Clean up the reference DCs first.

**Configuration partition**
```
Repadmin /removelingeringobjects childdc1.child.root.contoso.com 70ff33ce-2f41-4bf4-b7ca-7fa71d4ca13e "cn=configuration,dc=root,dc=contoso,dc=com"
Repadmin /removelingeringobjects childdc1.child.root.contoso.com 3fe45b7f-e6b1-42b1-bcf4-2561c38cc3a6 "cn=configuration,dc=root,dc=contoso,dc=com"
Repadmin /removelingeringobjects childdc1.child.root.contoso.com 0b457f73-96a4-429b-ba81-1a3e0f51c848 "cn=configuration,dc=root,dc=contoso,dc=com"
```

**ForestDNSZones partition**
```
Repadmin /removelingeringobjects childdc1.child.root.contoso.com 70ff33ce-2f41-4bf4-b7ca-7fa71d4ca13e "dc=forestdnszones,dc=root,dc=contoso,dc=com"
Repadmin /removelingeringobjects childdc1.child.root.contoso.com 3fe45b7f-e6b1-42b1-bcf4-2561c38cc3a6 "dc=forestdnszones,dc=root,dc=contoso,dc=com"
Repadmin /removelingeringobjects childdc1.child.root.contoso.com 0b457f73-96a4-429b-ba81-1a3e0f51c848 "dc=forestdnszones,dc=root,dc=contoso,dc=com"
```

**Root domain partition**
```
repadmin /removelingeringobjects dc1.root.contoso.com 3fe45b7f-e6b1-42b1-bcf4-2561c38cc3a6 "dc=root,dc=contoso,dc=com"
```
**DomainDNSZones application partition for the root domain**
```
repadmin /removelingeringobjects dc1.root.contoso.com 3fe45b7f-e6b1-42b1-bcf4-2561c38cc3a6 "dc=domaindnszones,dc=root,dc=contoso,dc=com"
```
**Note:**  
You do not need to clean up reference DCs for the Child, TreeRoot, or their DomainDNSZones partitions. This is because there is only one DC in each domain that hosts a writable copy of the partition. The schema partition is not checked or cleaned up because you cannot delete objects from the schema.

Now that the reference DCs are cleaned up, clean up all remaining DCs against the reference DCs.

**Configuration**
```
Repadmin /removelingeringobjects dc1.root.contoso.com 0c559ee4-0adc-42a7-8668-e34480f9e604 "cn=configuration,dc=root,dc=contoso,dc=com"
Repadmin /removelingeringobjects dc2.root.contoso.com 0c559ee4-0adc-42a7-8668-e34480f9e604 "cn=configuration,dc=root,dc=contoso,dc=com"
Repadmin /removelingeringobjects childdc2.child.root.contoso.com 0c559ee4-0adc-42a7-8668-e34480f9e604 "cn=configuration,dc=root,dc=contoso,dc=com"
Repadmin /removelingeringobjects trdc1.treeroot.fabrikam.com 0c559ee4-0adc-42a7-8668-e34480f9e604 "cn=configuration,dc=root,dc=contoso,dc=com"
```

**ForestDNSZones**
```
Repadmin /removelingeringobjects dc1.root.contoso.com 0c559ee4-0adc-42a7-8668-e34480f9e604 "dc=forestdnszones,dc=root,dc=contoso,dc=com"
Repadmin /removelingeringobjects dc2.root.contoso.com 0c559ee4-0adc-42a7-8668-e34480f9e604 "dc=forestdnszones,dc=root,dc=contoso,dc=com"
Repadmin /removelingeringobjects childdc2.child.root.contoso.com 0c559ee4-0adc-42a7-8668-e34480f9e604 "dc=forestdnszones,dc=root,dc=contoso,dc=com"
Repadmin /removelingeringobjects trdc1.treeroot.fabrikam.com 0c559ee4-0adc-42a7-8668-e34480f9e604 "dc=forestdnszones,dc=root,dc=contoso,dc=com"
```

**Root domain partition**
```
Repadmin /removelingeringobjects childdc1.child.root.contoso.com 70ff33ce-2f41-4bf4-b7ca-7fa71d4ca13e "dc=root,dc=contoso,dc=com"
Repadmin /removelingeringobjects childdc2.child.root.contoso.com 70ff33ce-2f41-4bf4-b7ca-7fa71d4ca13e "dc=root,dc=contoso,dc=com"
Repadmin /removelingeringobjects dc2.root.contoso.com 70ff33ce-2f41-4bf4-b7ca-7fa71d4ca13e "dc=root,dc=contoso,dc=com"
Repadmin /removelingeringobjects trdc1.treeroot.fabrikam.com 70ff33ce-2f41-4bf4-b7ca-7fa71d4ca13e "dc=root,dc=contoso,dc=com"
```

**DomainDNSZones - Root**
```
Repadmin /removelingeringobjects dc2.root.contoso.com 70ff33ce-2f41-4bf4-b7ca-7fa71d4ca13e "dc=domaindnszones,dc=root,dc=contoso,dc=com"
```

**Child domain partition**
```
Repadmin /removelingeringobjects dc1.root.contoso.com 0c559ee4-0adc-42a7-8668-e34480f9e604 "dc=child,dc=root,dc=contoso,dc=com"
Repadmin /removelingeringobjects dc2.root.contoso.com 0c559ee4-0adc-42a7-8668-e34480f9e604 "dc=child,dc=root,dc=contoso,dc=com"
Repadmin /removelingeringobjects childdc2.child.root.contoso.com 0c559ee4-0adc-42a7-8668-e34480f9e604 "dc=child,dc=root,dc=contoso,dc=com"
Repadmin /removelingeringobjects trdc1.treeroot.fabrikam.com 0c559ee4-0adc-42a7-8668-e34480f9e604 "dc=child,dc=root,dc=contoso,dc=com"
```

**DomainDNSZones - Child**
```
Repadmin /removelingeringobjects childdc2.child.root.contoso.com 0c559ee4-0adc-42a7-8668-e34480f9e604 "dc=domaindnszones,dc=child,dc=root,dc=contoso,dc=com"
```

**TreeRoot domain partition**
```
Repadmin /removelingeringobjects childdc1.child.root.contoso.com 0b457f73-96a4-429b-ba81-1a3e0f51c848 "dc=treeroot,dc=fabrikam,dc=com"
Repadmin /removelingeringobjects childdc2.child.root.contoso.com 0b457f73-96a4-429b-ba81-1a3e0f51c848 "dc=treeroot,dc=fabrikam,dc=com"
Repadmin /removelingeringobjects dc1.root.contoso.com 0b457f73-96a4-429b-ba81-1a3e0f51c848 "dc=treeroot,dc=fabrikam,dc=com"
Repadmin /removelingeringobjects dc2.root.contoso.com 0b457f73-96a4-429b-ba81-1a3e0f51c848 "dc=treeroot,dc=fabrikam,dc=com"
```
---

# **Lingering object discovery and cleanup**

**Repadmin /removelingeringobjects /advisory_mode** is a good method to conduct a spot check of lingering objects on an individual domain controller (DC), per partition basis.

However, lingering objects may exist on DCs without any noticeable symptoms. For that reason, checking and cleaning up just the DCs that report errors is not a good method to ensure all lingering objects are removed from the environment.

**To remove lingering objects:**

- Determine the root cause of the lingering object issue and prevent it from occurring again.
- Assume all DCs contain lingering objects in all partitions and clean up everyone.
  - Those that clean up just the source DCs reported with AD replication status 8606 usually find they have more objects to clean up later.
- To accomplish the above using repadmin, you need to do the following:
  - Identify one DC per partition to use as a reference DC.
  - Clean up each DC identified against all other DCs that host a writable copy of the same partition. This DC is now considered "clean" and suitable to use as a reference DC.
  - Clean up all other DCs against the reference DCs.
  - In the simple, five DC, three-domain lab environment, this requires 30 separate executions of the repadmin command. In a real-world production environment, the count of repadmin executions is usually in the hundreds or thousands.


**To prevent their recurrence:**

- Resolve replication failures within tombstone lifetime (TSL).
- Ensure Strict Replication Consistency is enabled.
- Ensure large jumps in system time are blocked via registry key or policy.
- Do not remove replication quarantine with the "allowDivergent" setting without removing lingering objects first.
- Do not restore system backups that are near TSL number of days old.
- Do not bring DCs back online that haven't replicated within TSL.
- Do not allow a server to replicate that has experienced a USN rollback.

## **Lingering Object Job Aid**

## **Lingering Object Glossary**

| Term  | Definition  |
|--|--|
| Abandoned delete  | An object deleted on one DC that never was replicated to other DCs hosting a writable copy of the naming context (NC) for that object. The deletion replicates to DCs/GCs hosting a read-only copy of the NC. The DC that originated the object deletion goes offline prior to replicating the change to other DCs hosting a writable copy of the partition.   |
| Abandoned object  | An object created on one DC that never got replicated to other DCs hosting a writable copy of the NC but does get replicated to DCs/GCs hosting a read-only copy of the NC. The originating DC goes offline prior to replicating the originating write to other DCs that contain a writable copy of the partition.  |
| Lingering link  | A linked attribute contains the distinguished name (DN) of an object that no longer exists in Active Directory. These stale references are referred to as lingering links.  |
| Lingering Object  | An object that is present on one replica, but has been deleted and garbage collected on another replica.  |
| Loose Replication Consistency | With this behavior enabled, if a destination DC receives a change to an attribute for an object that it does not have, the entire object is replicated to the target for the sake of replication consistency. This undesirable behavior causes a lingering object to be reanimated.  |
| Strict Replication Consistency  | With this behavior enabled, if a destination DC receives a change to an attribute for an object that it does not have, replication is blocked with the source DC for the partition where the lingering object was detected  |
| Tombstone  | An object that has been deleted but not yet garbage collected  |
| Tombstone Lifetime (TSL)  | The amount of time tombstones are retained in Active Directory before being garbage collected and permanently purged from the database. |

**Deleted object:**  
When AD recycle bin is enabled, an object that is deleted (deleted object) is recoverable with a full set of attributes using a PowerShell command (2008 R2) or via PowerShell and a GUI-based tool (ADAC) in Windows Server 2012. The object remains in this state until the deleted object lifetime expires and then it becomes a recycled object.

**Notes:**
```
IsDeleted = True 
IsRecycled = <not set> 
Stored in the Deleted Objects container in most instances (some objects do not get moved on deletion). 
```

**[Deleted object lifetime:](https://learn.microsoft.com/openspecs/windows_protocols/ms-adts/1887de08-2a9e-4694-95e2-898cde411180)**  
The deleted object lifetime is determined by the value of the msDS-deletedObjectLifetime attribute.
- By default, tombstoneLifetime is set to null. When tombstoneLifetime is set to null, the tombstone lifetime defaults to 60 days (hard-coded in the system).
- By default, msDS-deletedObjectLifetime is also set to null. When msDS-deletedObjectLifetime is set to null, the deleted object lifetime is set to the value of the tombstone lifetime.
- If msDS-deletedObjectLifetime is manually set, it becomes the effective lifetime of a system state backup.

**Notes:**
```
CN=Directory Service,CN=Windows NT,CN=Services,CN=Configuration,DC=<mydomain>,DC=<com> 
Attribute: msDS-deletedObjectLifetime 
```

**[Garbage Collection:](https://learn.microsoft.com/openspecs/windows_protocols/ms-adts/639b5050-a896-4bc7-8239-41cfb0e9d244?redirectedfrom=MSDN)**  
A process that permanently deletes tombstone objects or recycled objects.
- Runs on DCs every 12 hours by default / 15 minutes after restart.
- Can be manually initiated with LDP or other LDAP tool.

**Notes:**
```
Repadmin /setattr "" "" doGarbageCollection add 1"
```

**[Offline defrag:](https://learn.microsoft.com/troubleshoot/windows-server/active-directory/ad-database-offline-defragmentation)**  
Invokes Esentutl.exe to compact the existing AD database and writes the compacted file to the specified directory.

**Notes:**  
Access in DS restore mode:
```
Ntdsutil / act in ntds / files / compact to c:\temp
```

**[Semantic Database Analysis:](https://learn.microsoft.com/previous-versions/windows/it-pro/windows-server-2012-R2-and-2012/cc770715(v=ws.11)?redirectedfrom=MSDN)**  
Verifies the integrity of Active Directory database files with respect to Active Directory semantics.

**Notes:**  
Access in DS restore mode:
```
Ntdsutil / act in ntds / sem da an / go
```

**[Recycled object:](https://learn.microsoft.com/previous-versions/windows/it-pro/windows-server-2008-R2-and-2008/dd379542(v=ws.10)?redirectedfrom=MSDN#recycled-objects)**  
After a deleted object lifetime expires, the logically deleted object is turned into a recycled object and most of its attributes are stripped away.

**Notes:**
```
IsDeleted = True 
IsRecycled = True 
```
Can only be recovered if toggle recycled objects flag is used during the authoritative restore process.


**Tombstone**

Generically, this is an object that has been deleted but not garbage collected. Prior to the introduction of the AD recycle bin, this is the term for a deleted object.

If AD recycle bin is enabled:

- An object that is deleted retains all of its attribute values and does not become a recycled object until the deleted object lifetime expires.

If AD recycle bin is not enabled:

- A deleted object immediately becomes a tombstone and is stripped of most attribute values.
- To recover a tombstone with a full set of attributes, you must perform an authoritative restore.

**Notes:**  
If AD recycle bin is not enabled:
```
IsDeleted = True
IsRecycled = True
```
If AD recycle bin is enabled and the object is within the deleted object lifetime:
```
IsDeleted=True
IsRecycled=not set
```
If AD recycle bin is enabled and the object is now a recycled object:
```
IsDeleted=True
IsRecycled=True
```

## **Tombstone Lifetime (TSL)**

The number of days before tombstones or recycled objects are eligible for garbage collection.

By default, tombstoneLifetime is set to null. When tombstoneLifetime is set to null, the tombstone lifetime defaults to 60 days (hard-coded in the system).

This is also the effective lifetime of a system state backup. If msDS-deletedObjectLifetime is manually set, it becomes the effective lifetime of a system state backup.

**Notes:**
```
CN=Directory Service,CN=Windows NT,CN=Services,CN=Configuration,DC=<mydomain>,DC=<com> 
Attribute: tombstoneLifetime 
```

# **Removal methods**

## **Lingering Object Liquidator**

Per-object and per-partition removal

**Leverages:**
- RemoveLingeringObjects LDAP rootDSE modification
- DRSReplicaVerifyObjects method

**Details:**
- GUI-based
- Quickly displays all lingering objects in the forest to which the executing computer is joined
- Built-in discovery through the DRSReplicaVerifyObjects method
- Automated method to remove lingering objects from all partitions
- Removes lingering objects from all DCs (including RODCs) but not lingering links
- Windows Server 2008 and later DCs (will not work against Windows Server 2003 DCs)

## **LDAP RemoveLingeringObjects rootDSE primitive** (most commonly executed using LDP.EXE or an LDIFDE import script)

Per-object removal

**Details:**
- Requires a separate discovery method
- Removes a single object per execution unless scripted.

## **Repadmin /removelingeringobjects**

Per-partition removal

**Leverages:**
- DRSReplicaVerifyObjects method

**Details:**
- Command line only
- Built-in discovery through DRSReplicaVerifyObjects
- Displays discovered objects in events on DCs
- Requires many executions if a comprehensive (n * (n-1)) pairwise cleanup is required.
- **Note:** The repldiag tool and the Lingering Object Liquidator tool automate this task.

---

# **Replication Consistency Settings**

## **Strict Replication Consistency**

Defines how a destination domain controller (DC) behaves if a source DC sends updates to an object that does not exist in the destination DCs local copy of Active Directory.

- Destination DCs should see USN for creates before object is modified.
- Only modifies for lingering objects arrive for object not on destination DC.
- Only destination DCs enforce strict replication and log events.
- Destination DCs stop replicating from source DCs' partitions containing lingering objects (LOs).
- Lingering objects are quarantined on source DCs where they can be detected.
- End-to-end replication may be impacted for partitions containing lingering objects.
- Administrators must remove lingering objects to restore replication.

**Enabling Strict Replication**
Use Repadmin from Windows Server 2003 SP1 or later to set strict replication via command prompt:
For all domain controllers, type:
```
repadmin /regkey * +strict
```
For all global catalog servers, type:
```
repadmin /regkey gc: +strict
```
You can also enable strict replication by manually setting the Strict Replication Consistency registry value to 1.
- Key: `HKLM\System\CurrentControlSet\Services\NTDS\Parameter`
- Value: `Strict Replication Consistency`
- Type: `Reg_DWORD`
- Value Data: `1`
  - 1 (enabled): Inbound replication of the specified directory partition from the source is stopped on the destination.

**Warning:**  
Ensure you are prepared to deal with replication failures after enabling strict replication consistency due to the existence of lingering objects.

## **Loose Replication Consistency**

If you enable Loose Replication Consistency, if a destination receives a change to an object that it does not have, the entire object is replicated to the target for the sake of replication consistency. This behavior causes a lingering object to be reapplied to all domain controllers in the replication topology.

**Enable Loose Replication**
Use Repadmin (from Windows Server 2003 SP1 or later) to set strict replication via command prompt:

For all domain controllers, type:
```
repadmin /regkey * -strict
```
For all global catalog servers, type:
```
repadmin /regkey gc: -strict
```
You can also enable strict replication by manually setting the Strict Replication Consistency registry value to 0.
- Key: `HKLM\System\CurrentControlSet\Services\NTDS\Parameters`
- Value: `Strict Replication Consistency`
- Type: `Reg_DWORD`
- Value Data: `0`
  - 0 (disabled): The destination requests the full object from the source domain controller, and the lingering object is revived in the directory.

**Critical:**  
The Loose Replication Consistency setting will cause the undesirable behavior of reanimation of lingering objects.

## **Default Settings for Strict Replication Consistency**

The default value for the strict replication consistency registry entry is determined by the conditions under which the domain controller was installed into the forest.

**Note:** Raising the domain or forest functional level does not change the replication consistency setting on any domain controller.

| Upgrade Path | Default | Notes |
|--|--|--|
| Windows NT 4.0 | Loose |  |
| Windows 2000 RTM Root | Loose | A post-SP2 NTDSA.DLL defaulted to strict replication consistency but was quickly recalled. Windows 2000 Services 1 through 4 all default to loose replication consistency. |
| Windows NT 4.0 to Windows 2000 Root | Loose |  |
| Windows 2000 to Windows Server 2003 SP1 | Loose | Upgrading a Windows 2000 forest to Windows Server 2003 slipstreamed with SP1 does not enable strict replication consistency. |
| Windows Server 2003 RTM Root | Strict | DCPROMO creates an operational GUID that causes Windows Server 2003 domain controllers to inherit strict replication mode but is ignored by Windows 2000 domain controllers. |
| Windows Server 2003 SP1 root and later: <br> Windows Server 2003 R2 <br> Windows Server 2008 <br> Windows Server 2008 R2 <br> Windows Server 2012 <br> Windows Server 2012 R2 <br> | Strict | Same as above. |
| Windows NT 4.0 to Windows Server 2003 root | Strict | DCPROMO creates an operational GUID that causes Windows Server 2003 domain controllers to inherit strict replication mode but is ignored by Windows 2000 domain controllers. |

**More Information:**  
https://techcommunity.microsoft.com/blog/askds/strict-replication-consistency---myth-versus-reality/397453 

---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

## **Repadmin RLO example usage**

The command's syntax is:
```
repadmin /removelingeringobjects LingeringDC ReferenceDC_DSA_GUID Partition
```

**Where:**
- **LingeringDC:** FQDN of DC that has the lingering objects
- **ReferenceDC_DSA_GUID:** The DSA GUID of a domain controller that hosts a writable copy of the partition
- **Partition:** The distinguished name of the directory partition where the lingering objects exist

**Example:**
We have a server named DC1.contoso.com that contains lingering objects. We know that the lingering object is in the childdomain.contoso.com partition. We know that DC3.childdomain.contoso.com hosts a writable copy of the partition and does not contain any lingering objects.

We need to find the DSA GUID of DC3, so we run:  
```
repadmin /showrepl DC3.childdomain.contoso.com
```
At the top of the output, locate the DC Object GUID entry. This is the GUID you need to enter in the command for the reference DC.

The command would be:
```
repadmin /removelingeringobjects DC1.contoso.com 5ed02b33-a6ab-4576-b109-bb688221e6e3 dc=childdomain,dc=contoso,dc=com
```
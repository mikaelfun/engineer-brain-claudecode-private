---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files All Topics/How Tos/SMB File Share Snapshots_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Azure%20Files%20All%20Topics/How%20Tos/SMB%20File%20Share%20Snapshots_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Azure-Files-All-Topics
- cw.How-To
- cw.Reviewed-09-2023
---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::

 


[[_TOC_]]

# Description

Azure File Share Snapshot

# Overview

**Overview**  
Azure File Share Snapshot is a new feature in Azure File Share and it enables customers to:  

  - Take a point in time back up of a file share  
  - Pick and choose to restore a file from a snapshot  
  - Mount the snapshot share as a drive and restore the entire snapshot  

**Benefits**  

  - Protection against application error and data corruption
  - Protection against accidental deletions or unintended changes
  - General backup purpose

**Functionalities**  
File share snapshots capabilities and the available APIs can be found in the table below.  

| Functionality                           | SMB (e.g. File Explorer) | Powershell/CLI | Client Library | Portal |
| --------------------------------------- | ------------------------ | -------------- | -------------- | ------ |
| Create a file share snapshot            | No                       | Yes            | Yes            | Yes    |
| List snapshots of a file share          | Yes                      | Yes            | Yes            | Yes    |
| List snapshots of a file                | Yes                      | No             | No             | No     |
| List snapshots of a directory           | Yes                      | No             | No             | No     |
| Delete a snapshot                       | No                       | Yes            | Yes            | Yes    |
| Retrieve content of a snapshot          | Yes                      | Yes            | Yes            | Yes    |
| Restore a file from a snapshot          | Yes                      | Yes            | Yes            | Yes    |
| Restore a folder from a snapshot        | Yes                      | Yes            | Yes            | No     |
| Restore an entire snapshot              | Yes                      | Yes            | Yes            | No     |
| Create, view, delete snapshot schedules | No                       | Yes            | Yes            | Yes    |

NOTE: Not everything can be done in a single call. Some will need scripting.  
**Developer References:**

  - Rest API, <https://docs.microsoft.com/en-us/rest/api/storageservices/snapshot-share>
  - Storage CLI, <https://docs.microsoft.com/en-us/azure/storage/common/storage-azure-cli#create-share-snapshot>
  - Dot Net, <https://docs.microsoft.com/en-us/azure/storage/files/storage-dotnet-how-to-use-files#share-snapshots-preview>
  - Python, <https://docs.microsoft.com/en-us/azure/storage/files/storage-python-how-to-use-file-storage#create-share-snapshot-preview>

**FAQ**  
***Where are my share snapshots stored?***  
Share snapshots are stored in the same storage account as the file share.  
  
***What happens to my snapshot if I delete my storage account?***  
If you delete your storage account, the snapshots will be deleted as well.  
  
***Are there any performance implications for using share snapshots?***  
Share snapshots do not have any performance overhead.  
  
***How much does snapshots cost?***  
Snapshots transaction is not charged but standard storage cost will still apply. Snapshots are incremental in nature. The base snapshot is the share itself. All the subsequent snapshots are incremental and will only store the diff from the previous snapshot. See Pricing page for more information. You will be able to view the size of the snapshot using x-ms-share-quota from REST API or on Azure Portal.  
  
***Can I create snapshot of individual files?***  
You can restore individual files from the file-share snapshot but you cannot create file-level snapshots.  
  
***Are share snapshots application-consistent?***  
No, share snapshots are not application-consistent. The user must flush the writes from the application to the share before taking the share snapshot.  
  
***Are there limits on the number of share snapshots I can use?***  
Yes. Azure Files can retain a maximum of 200 share snapshots. Share snapshots do not count toward the share quota, so there is no per-share limit on the total space that's used by all the share snapshots. Storage account limits still apply. After 200 share snapshots, you must delete older snapshots to create new share snapshots.  
  
***Is there file versioning in Snapshot?***  
No, there isn't file versioning  
  
***Can I share a previous version using SAS key from my snapshot with other users?***  
Snapshot also has file level SAS key. However, Snapshot is a read-only copy of the file, so only read operations will work on the file.  
  
***What is the default snapshot name and can it be changed?***  
File share snapshot name is the UTC time stamp at the time the snapshot is created and this name cannot be changed.  
  
Complete FAQ can be found [here](https://docs.microsoft.com/en-us/azure/storage/files/storage-files-faq)

# Case Handling

**Support topics:**  

  - Routing Azure Storage File\\Azure Files Snapshots

**Routing queue:** POD Azure IaaS VM/Storage  

Follow the diagram below to determine if you should collaborate with Azure Backup and Recovery Service team

[![CollaborationDiagram.jpg](/.attachments/SME-Topics/Azure-Files-All-Topics/a145eae0-e774-1d3a-4092-02b69e0bf4b9800px-CollaborationDiagram.jpg)](/.attachments/SME-Topics/Azure-Files-All-Topics/a145eae0-e774-1d3a-4092-02b69e0bf4b9800px-CollaborationDiagram.jpg)

# How It Works

File Share Snapshots are **incremental** in nature. Only the data that has changed after the most recent share snapshot is saved. This minimizes the time required to create the share snapshot and saves on storage costs. Any write operation to the object or property or metadata update operation is counted toward "changed content" and is stored in the share snapshot.  

**Creating a Snapshot**  
When a snapshot is created no data is copied around. Only version numbers and few other metadata is updated.

**Accessing and Modifying Files**  
Consider the XFiles table for a share that contains a single file ?File1?:  
[![Dataflow1.JPG](/.attachments/SME-Topics/Azure-Files-All-Topics/c8c9c40b-0d1f-759a-adaf-b1b49f2efb43300px-Dataflow1.JPG)](/.attachments/SME-Topics/Azure-Files-All-Topics/c8c9c40b-0d1f-759a-adaf-b1b49f2efb43300px-Dataflow1.JPG)  

Before any snapshots are created, the container version of the share is 0. Now, let?s assume two snapshots are created, bumping the container version of the share to 2. After the snapshots are created, if a client opens a handle to File1 on the share snapshot with version 1, two pairs of rows will be created: a pair with ContainerVersion 1, and another pair with ContainerVersion 2.  

[![Dataflow2.JPG](/.attachments/SME-Topics/Azure-Files-All-Topics/8c3d0a4f-fb04-e6c2-bb5d-e8ee81b0d5b2300px-Dataflow2.JPG)](/.attachments/SME-Topics/Azure-Files-All-Topics/8c3d0a4f-fb04-e6c2-bb5d-e8ee81b0d5b2300px-Dataflow2.JPG)

This way, any changes that need to be made to the file rows by operations that target different versions of the share are isolated from each other.

**Deleting a Snapshot**  
The row is marked with expiry date and GC lazily cleans it up.

1.  Verify the root container exists and is valid (not expired, disabled etc.)
2.  Verify the snapshot exists and is valid (not expired, disabled, in progress etc.)
3.  Add a work item to the container GC agent queue for the deleted snapshot.

# Limitations

The **maximum** number of share snapshots to be created per File Share today is **200**. After **200** share snapshots, customers need to delete older share snapshots in order to create new ones.  
Share snapshots do not count toward the share quota, so there is no per-share limit on the total space that's used by all the share snapshots. Storage account limits still apply.  
**Gotchas**  

  - Snapshot name cannot be changed
  - File share cannot be deleted if snapshot still exists
  - **If storage account is deleted, the file share and its snapshots will also be deleted. There's no way to restore it.**
  - Snapshot cannot be scheduled out of the box. Customers can use Azure Backup or user Azure Scheduler to automate it themselves mentioned [here](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/496072/File-Share-Snapshots_Storage-How-To?anchor=how-to-schedule-snapshot-via-azure-scheduler)
  - Snapshots are created at the file share level. You **cannot take a snapshot of individual/selected files** within a file share. However, individual/selected files can be restored, if the snapshot of the entire file share is available..

# Known Issues

1.  Timestamp is not shown when trying to restore from Previous Version in File Explorer
2.  Not seeing all snapshots in File Explorer when trying to restore a file from previous
3.  Not seeing snapshots in the Portal but able to see the snapshots in File Explorer
4.  Seeing extra snapshots that are not taken by customers

## Timestamp is not shown when trying to restore from Previous Version in File Explorer

  - Issue: once mapped to a local network drive when I right click on a folder in the share and Restore from Previous Version I dont' get any Dates, just a group the says Unspecified.
  - Cause: Bug in Windows 10 version 1703
  - How found: Reported by customer [here](https://social.technet.microsoft.com/Forums/en-US/a955b9d8-da1a-4b20-846f-6449fc90ee90/windows-previous-version-shadow-copy-showing-as-unspecified?forum=win10itprogeneral)
  - Work around: none

[![Windows10bug.JPG](/.attachments/SME-Topics/Azure-Files-All-Topics/2a39cd01-4b01-4aae-eb75-23d055e7e062200px-Windows10bug.JPG)](/.attachments/SME-Topics/Azure-Files-All-Topics/2a39cd01-4b01-4aae-eb75-23d055e7e062200px-Windows10bug.JPG)

## Not seeing all snapshots in File Explorer when trying to restore a file from previous version

  - Issue: file stamp not refresh in File Explorer causes not all snapshots to be shown when trying to do a file restore from previous versions
  - Cause: Bug in Azure Files REST operations causes Win32 timestamps not updated.
  - Work around
      - customer can edit the file in File Explorer and the updated snapshot list will be shown
      - customer can restore the file using Portal, Powershell, CLI
  - Repro steps:
      - Edit a file in the portal and save
      - Create a snapshot
      - Edit the same file again and save
      - Mount the snapshot using File Explorer
      - Navigate to the mount drive, right click on the File and select Restore from previous version. Expected result is to see the first snapshot on the list but the list might be empty

[![FileExplorerBug.jpg](/.attachments/SME-Topics/Azure-Files-All-Topics/95725b30-4ab2-43cc-edcf-18c1ec214209400px-FileExplorerBug.jpg)](/.attachments/SME-Topics/Azure-Files-All-Topics/95725b30-4ab2-43cc-edcf-18c1ec214209400px-FileExplorerBug.jpg)

## Not seeing snapshots in the Portal but able to see the snapshots in File Explorer

  - Issue: Customers not able to see snapshots in the Portal
  - Cause: Bug in the Portal (icm\#61113053)
  - Please ask customer to take a Fiddler trace and follow the escalation process, <https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/496072?anchor=escalation>

## Seeing extra snapshots that are not taken by me

  - Issue: Customers are seeing snapshots that are not taken by themselves
  - Cause: if customers are using File Sync or Azure File Backup on the **same File Share**, they will see snapshots taken by these services. To find out if these snapshots were created by these service follow [TSG](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/496072/File-Share-Snapshots_Storage-How-To?anchor=how-to-distinguish-snapshots-created-by-file-share-snaphot-from-azure-file-backup-and-azure-file-sync-service)

There is already a feature request to fix the display problem where customer will see the source of these snapshots. ETA is unknown at this point.

# HowTo

The "How To" section contains the followings:  

  - How to use XDS XTable to locate Azure File Share Snapshot
  - How to distinguish snapshots created by File Share Snaphot from Azure File Backup and Azure File Sync service
  - How to find out if customers have exceeded the snapshot count
  - How to use Jarvis to find out if a snapshot was deleted
  - How to look up Snapshot errors in Geneva
  - How to schedule snapshot via Azure Scheduler
  - How to find out when a restore occurs
  - How to find number of snapshots per file share
  - How to look up list of files in a snapshot

## How to use XDS XTable to locate Azure File Share Snapshot

Below steps show you how to get list of Azure File Share snapshots  

1.  Open XPortal: https://aka.ms/xportal 
2. Navigate to Account section.
3. Enter the name of the Storage Account being investigated into the Account textbox and click Refresh.
4. Hover over the Tenant name hyperlink.
5. From the contextual menu, select XDS. Warning: This link will require a SAW/SAWVM device to open successfully.Browse https://aka.ms/xportal on SAVM

![ClickOnXDS.JPG](/.attachments/SME-Topics/Azure-Files-All-Topics/ClickonXDS.png)

6.  If you have clicked on the XDS link, the XLocations webpage has launched for the specific stamp that we are using.

7.  Click on the XTable button in the bottom left pane as shown below

![ClickonXTable.JPG](/.attachments/SME-Topics/Azure-Files-All-Topics/ClickonXTable.png)

8.  Click on Tables on the top left pane as shown below

![ClickonTables.JPG](/.attachments/SME-Topics/Azure-Files-All-Topics/ClickonTables.png)

9.  Click on XFileContainers and then click on View Rows

![ClickonXFileContainers.JPG](/.attachments/SME-Topics/Azure-Files-All-Topics/ClickonXFileContainers.png)

10.  Click Filter by Key

![FilterbyKey.JPG](/.attachments/SME-Topics/Azure-Files-All-Topics/FilterbyKey.png)

11.  Select Specify key low value radio button and enter the Storage Account name

![FilterByKey1.JPG](/.attachments/SME-Topics/Azure-Files-All-Topics/FilterByKey1.png)

12.  Click on Key High (less than) tab and enter the Storage Account name with the "**\~**" at the end as shown below and click OK

![ClickonXFileContainers.JPG](/.attachments/SME-Topics/Azure-Files-All-Topics/ClickonXFileContainers.png)

13.  In the output, the SnapshotTimeStamp column indicates the time the snapshot was created.

The timestamp is the actual Snapshot name in format yyyy-mm-ddThh:mm:ss.0000000Z  
Ex: 2017-11-07T22:43:54.0000000Z  
  
Compare to the output below where there is no snapshot created for this storage account, the SnapshotTimestamp is 9999. This indicates that this file share does not have any snapshot created.  
![noSnapshot.JPG](/.attachments/SME-Topics/Azure-Files-All-Topics/noSnapshot.png)

## How to distinguish snapshots created by File Share Snaphot from Azure File Backup and Azure File Sync service

Azure File Backup and Azure File Sync service use Azure File Share Snapshots under the hood to backup a file share as well as syncing files from on-prem to Azure File Share. In the scenario customers enable Azure File Backup and Azure File Sync on the **same file share** where snapshot is taken, the snapshots created by these services will also be shown in the same view and can cause confusion. Customers cannot tell if the snapshots are created by which service. In XDASH, there is a way to distinguish based on the **ApplicationMetadata** column

1.  Follow the steps mentioned above in [How to use XDS XTable to locate Azure File Share Snapshot](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/496072?anchor=how-to-use-xds-xtable-to-locate-azure-file-share-snapshot)
2.  In the view, look at the ApplicationMetada column
    1.  If it contains **Initiator:Manual**, the snapshots created by Azure File Share Snapshots
    2.  If it contains **Initiator:AzureBackup**, the snapshots created by Azure File Backup
    3.  If it contains **CreatedFor:KailaniOps**, the snapshots created by Azure File Sync service

![TypesOfSnapshots.JPG](/.attachments/SME-Topics/Azure-Files-All-Topics/TypesOfSnapshots.png)

Below is what customers will see in the portal. The **Intiator** column shows snapshot creator.
![CxSnapshotView.JPG](/.attachments/SME-Topics/Azure-Files-All-Topics/CxSnapshotView.png)

## How to find out if customers have exceeded the snapshot count

The number of allowed snapshots to be created per file share is **200**. If customers have met this limit and tried to create another snapshot, the operation will fail.  
Below is the error message if customer tries to do the operation in **Bash**  

    The total number of snapshots for the share is over the limit.

  
Below is the error message if customer tries to do the operation in **Powershell**  

    Exception calling "Snapshot" with "0" argument(s): "The remote server returned an error: (409) Conflict."
    At line:1 char:1
    + $snapshot=$share.Snapshot()
    + 22:12, 6 December 2017 (UTC)22:12, 6 December 2017 (UTC)22:12, 6 December 2017 (UTC)22:12, 6 December 2017 (UTC)22:12, 6 December 2017 (UTC)~~
       + CategoryInfo         ?: NotSpecified: (:) [], MethodInvocationException
       + FullyQualifiedErrorId?: StorageException

If the customer tries to do this in the Portal, customers will see the following error  
[![Portalcreateerror.JPG](/.attachments/SME-Topics/Azure-Files-All-Topics/9f3d6d45-9298-4c14-69ad-b3fa31d9aee9400px-Portalcreateerror.JPG)](/.attachments/SME-Topics/Azure-Files-All-Topics/9f3d6d45-9298-4c14-69ad-b3fa31d9aee9400px-Portalcreateerror.JPG)  

In order to find out if customers have exceeded the number of snapshots allowed:

1. In [Jarvis /MDM](http://aka.ms/jarvis) access the <u>Logs</u> section.
2. Select <u>DGRep</u> subsection.
3. Complete the query with your environment details. Example: <https://jarvis-west.dc.ad.msft.net/94121655>
  - Endpoint: **Diagnostics PROD**
  - Namespace: **Xstore**
  - Events to search: **FrontEndSummaryPerfLogs**
  - Specify the time the error occurs
  - Scoping conditions: **Role == Nephos.File**
  - Specify account name
  - Operation contains **snapshotshare**

[![Geneva1.JPG](/.attachments/SME-Topics/Azure-Files-All-Topics/2e495119-5213-886b-19b1-99ac854841cbGeneva1.JPG)](/.attachments/SME-Topics/Azure-Files-All-Topics/2e495119-5213-886b-19b1-99ac854841cbGeneva1.JPG)  
The **status** column will contain **ShareSnapshotCountExceeded**  
[![Exceededsnapshot.JPG](/.attachments/SME-Topics/Azure-Files-All-Topics/cdf93ab9-5332-e3af-9aba-9fc2e0d8f7b0Exceededsnapshot.JPG)](/.attachments/SME-Topics/Azure-Files-All-Topics/cdf93ab9-5332-e3af-9aba-9fc2e0d8f7b0Exceededsnapshot.JPG)

## How to find out if a snapshot was deleted

Once a snapshot is created, it's treated similar as a file share. To find out if a snapshot was deleted, look for **XFileFE\_DeleteShare** RequestType in Jarvis. However, you won't be able to know the snapshot name that was deleted and its status. To do that, you will need to have access to Storage logs that only EEEs have access to.

1.  Launch <https://jarvis-west.dc.ad.msft.net>
2.  Specify
    1.  Endpoint: **Diagnostics PROD**
    2.  Namespace: **Xstore**
    3.  Events to search: **AccountTransactionOneMinuteEvent**
    4.  Time Range
    5.  Scoping conditions
        1.  **Role == EnPn**
        2.  **Tenant == ms-\<tenant name\>**
    6.  Filtering conditions
        1.  Subscription == \<subscriptionID\>
        2.  AccountName contains \<storageaccountname\>
        3.  **RequestType == XFileFE\_DeleteShare**

Note: To find the tenant name, open a command prompt and type  
ping \<storage account name\>.file.core.windows.net

Sample query: <https://jarvis-west.dc.ad.msft.net/?page=logs&be=DGrep&offset=-5&offsetUnit=Minutes&UTC=false&ep=Diagnostics%20PROD&ns=Xstore&en=AccountTransactionOneMinuteEvent>
[![Jarvis deleteshare.jpg](/.attachments/SME-Topics/Azure-Files-All-Topics/2eaaeb81-aa63-f573-c825-cf884164b5fe1000px-Jarvis_deleteshare.jpg)](/.attachments/SME-Topics/Azure-Files-All-Topics/2eaaeb81-aa63-f573-c825-cf884164b5fe1000px-Jarvis_deleteshare.jpg)

## How to look up Snapshot errors in Geneva

Snapshot related errors are stored in the XStore **FrontEndSummaryPerfLogs** in Geneva.

1.  Follow the [HowToFindExceedSnapshotCount](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/496072/File-Share-Snapshots_Storage-How-To?anchor=how-to-find-out-if-customers-have-exceeded-the-snapshot-count) to query the Geneva log to look for snapshot related errors  
2.  In the client query specify

HttpStatusCode \> 201  

[![Snapshoterrors.JPG](/.attachments/SME-Topics/Azure-Files-All-Topics/382e0e75-c09b-5fd0-b7ac-a825d5f9eef11000px-Snapshoterrors.JPG)](/.attachments/SME-Topics/Azure-Files-All-Topics/382e0e75-c09b-5fd0-b7ac-a825d5f9eef11000px-Snapshoterrors.JPG)

## How to schedule snapshot via Azure Scheduler

Currently File Share Snapshot scheduling cannot be automated. If customers would like to automate this process, there are **2 different ways** customers can do this:

1.  Customers can use Azure File Share Backup (currently in public preview) to schedule their file share automatically. More information can be found here, <https://azure.microsoft.com/en-in/blog/introducing-backup-for-azure-file-shares/>
2.  Send the attached doc to customers to schedule snapshots using Azure Scheduler

[File:Scheduling a snapshot via Azure Scheduler.pdf](/index.php/File:Scheduling_a_snapshot_via_Azure_Scheduler.pdf "File:Scheduling a snapshot via Azure Scheduler.pdf")

## How to find out when a restore occurs

If a file is being restored from a snapshot using the Portal, you can see the operation in one of the XStore Log in Geneva

1.  Launch <https://jarvis-west.dc.ad.msft.net>
2.  Specify the following
    1.  Endpoint: **Diagnostic PROD**
    2.  Namespace: **Xstore**
    3.  Events to search: **AccountTransactionOneHourEvent**
    4.  Time range
    5.  Scoping conditions:
        1.  Role == **EnPn**
    6.  Filtering conditions:
        1.  AccountName contains \<storage account name\>
        2.  RequestType == **XFileFE\_CopyFile**

Sample query: <https://jarvis-west.dc.ad.msft.net/2485B9A5>

[![RestoreJarvis.jpg](/.attachments/SME-Topics/Azure-Files-All-Topics/85d8020e-50a8-49b6-f0eb-06e9b7de57031000px-RestoreJarvis.jpg)](/.attachments/SME-Topics/Azure-Files-All-Topics/85d8020e-50a8-49b6-f0eb-06e9b7de57031000px-RestoreJarvis.jpg)

## How to find number of snapshots per file share

Below steps show you how to get list of Azure File Share snapshots  


1.  Browse https://aka.ms/xportal on SAVM
2.  Look up the storage account 
3.  Click on XDS by hovering over Tenant name

![ClickOnXDS.JPG](/.attachments/SME-Topics/Azure-Files-All-Topics/ClickonXDS.png)

4.  If you have clicked on the XDS link, the XLocations webpage has launched for the specific stamp that we are using.

5.  Click on the XTable button in the bottom left pane as shown below

![ClickonXTable.JPG](/.attachments/SME-Topics/Azure-Files-All-Topics/ClickonXTable.png)

6.  Click on Tables on the top left pane as shown below

![ClickonTables.JPG](/.attachments/SME-Topics/Azure-Files-All-Topics/ClickonTables.png)

7.  Click on XFileContainers and then click on View Rows

![ClickonXFileContainers.JPG](/.attachments/SME-Topics/Azure-Files-All-Topics/ClickonXFileContainers.png)

8.  Click Filter by Key

![FilterbyKey.JPG](/.attachments/SME-Topics/Azure-Files-All-Topics/FilterbyKey.png)

9.  Select Specify key low value radio button and enter the Storage Account name

![FilterByKey1.JPG](/.attachments/SME-Topics/Azure-Files-All-Topics/FilterByKey1.png)

10.  Click on Key High (less than) tab and enter the Storage Account name with the "**\~**" at the end as shown below and click OK

![ClickonXFileContainers.JPG](/.attachments/SME-Topics/Azure-Files-All-Topics/ClickonXFileContainers.png)

11.  Click OK
    1.  Search for a row with SnapshotTimestamp of 9999/12/31/23:59:59.9999. This indicates this is a file share and not a snapshot
    2.  Expand the ServiceMetadaMap column and the SanpshotCount is mentioned in this column. In the example below, the snapshot count is 2.

![SnapshotCount.JPG](/.attachments/SME-Topics/Azure-Files-All-Topics/SnapshotCount.png)

# Customer's How To Scenarios

## How to mount Azure File Share

1.  Customers can only mount a file share using File Explorer in Windows.
2.  Article explains how to do it, <https://docs.microsoft.com/en-us/azure/storage/files/storage-how-to-use-files-snapshots>

## How to set up snapshot using CLI

1.  CLI: <https://docs.microsoft.com/en-us/azure/storage/common/storage-azure-cli#create-share-snapshot>

## How to compare snapshot content

1.  Mount snapshot to a local drive following [this article](https://docs.microsoft.com/en-us/azure/storage/files/storage-how-to-use-files-snapshots)
2.  Download Beyond Compare and compare content between 2 snapshots

## How to find out which snapshot has the backup file that I need

1.  This information is published at <https://docs.microsoft.com/en-us/azure/storage/files/storage-how-to-use-files-snapshots>

## How to restore an entire snapshot

Currently you can only restore an entire snapshot by using File Explorer.

1.  Mount snapshot to a local drive following [this article](https://docs.microsoft.com/en-us/azure/storage/files/storage-how-to-use-files-snapshots)
2.  Right click on the mount drive and select Restore from previous version.

[![RestoreSnapshot.JPG](/.attachments/SME-Topics/Azure-Files-All-Topics/c3284565-eb06-496f-b28a-cc6a786c92fb400px-RestoreSnapshot.JPG)](/.attachments/SME-Topics/Azure-Files-All-Topics/c3284565-eb06-496f-b28a-cc6a786c92fb400px-RestoreSnapshot.JPG)

1.  Select the snapshot version and click Restore. You can also click on Open to check if the snapshot has the changes that you need.

[![RestoreSnapshot2.JPG](/.attachments/SME-Topics/Azure-Files-All-Topics/88143613-e3ca-6c6f-31bd-9b9dfd4fd300400px-RestoreSnapshot2.JPG)](/.attachments/SME-Topics/Azure-Files-All-Topics/88143613-e3ca-6c6f-31bd-9b9dfd4fd300400px-RestoreSnapshot2.JPG)


# TSG Scenarios

## Where do I see my snapshots

Customers can see their snapshots and create new snapshots by following one of these steps

1.  Click on the share and select Snapshots

![Snapshots.JPG](/.attachments/SME-Topics/Azure-Files-All-Topics/Snapshots.png)

2.  Or Click on the ... next to the share name and select View Snapshots
![ViewSnapshots.JPG](/.attachments/SME-Topics/Azure-Files-All-Topics/ViewSnapshots.png)

Note: If the customers ask why we make these changes we should encourage customers to use Azure File Backup as their primary backup source and only use Snapshot for ad-hoc backup need. Customers can find out more information at <https://azure.microsoft.com/en-us/blog/introducing-backup-for-azure-file-shares/>  

## Cannot Create Snapshots

**Possible Causes:**

1.  Customers have reached the snapshot limit of 200. Snapshots created by Azure Files Backup and Azure File Sync service are counted toward the 200 snapshot count limit. When customers look at the Snapshot View in the Portal and do not recognize why some snapshots were not created by them, let them know that some of these snapshots are created by Azure Files Backup or Azure File Sync service.
2.  Bug in the system

**Troubleshooting steps:**

1.  Determine if customers have exceeded the snapshot count of 200, following [How to find if customers have exceeded snapshot count](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/496072/File-Share-Snapshots_Storage-How-To?anchor=how-to-find-out-if-customers-have-exceeded-the-snapshot-count)
    1.  If yes, tell customers that they have exceeded the snapshot count limit and older snapshots need to be deleted.
    2.  If not, check for errors following [How to find errors in Geneva](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/496072/File-Share-Snapshots_Storage-How-To?anchor=how-to-look-up-snapshot-errors-in-geneva)
    3.  If you cannot determine the root cause of the error, escalate following <https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/496072?anchor=escalation>

## Cannot Browse a Snapshot

**Possible causes:**

1.  Customers try to browse the snapshot in Linux or use old version of Azure CLI
2.  Port 445 is blocked

**Troubleshooting steps:**

1.  If customers try to browse the snapshot in Linux tell them that this is not supported as it's not a functionality in Linux. Browse snapshot only works in Windows, Powershell, and Azure CLI v2.0
2.  Make sure customers are using the correct steps, send customers this public doc, <https://docs.microsoft.com/en-us/azure/storage/files/storage-how-to-use-files-snapshots>
3.  Make sure port 445 is not blocked on customer's environment following [this article](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/496209)
    1.  if port 445 is blocked, follow [this article](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/496209)
    2.  if port 445 is not blocked, escalate following <https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/496072?anchor=escalation>

## Cannot Find a Snapshot

**Possible causes:**

1.  Customers never create the snapshot
2.  Customers delete the snapshot
3.  Bug in the system

**Troubleshooting Steps:**

1.  Check metadata if the snapshot exists, following [List Snapshots](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/496072/File-Share-Snapshots_Storage-How-To?anchor=how-to-use-xds-xtable-to-locate-azure-file-share-snapshot)
    1.  If the snapshot does not exist, check to see if snapshot was deleted,following [this article](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/496072/File-Share-Snapshots_Storage-How-To?anchor=how-to-find-out-if-a-snapshot-was-deleted)
    2.  If the snapshot exists, escalate following <https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/496072?anchor=escalation>

## Restoring Snapshot Takes Too Long

**Possible causes:**

1.  Customer is using File Explorer or Azure Cloud Shell to restore
2.  Performance issue on Storage account

**Troubleshooting steps:**

1.  Find out from customers the method they use to restore
2.  Suggest one of the Fast method below

| Method              | Performance                                                |
| ------------------- | ---------------------------------------------------------- |
| Using File Explorer | Slow as file is being downloaded locally and uploaded      |
| Using Azure Portal  | **Fast** as the operation occurs server to server in Azure |
| Using Powershell    | **Fast** if the source and destination are in Azure        |
| Using Azure Cloud Shell    | Slow as the file is being downloaded locally and uploaded  |

1.  Send customer Azure File Share Snapshot Best Practices, <https://docs.microsoft.com/en-us/azure/storage/files/storage-snapshots-files#general-best-practices>
2.  If customer is using one of the Fast method mentioned above, then the issue could be related to the Storage itself, follow the existing Storage performance TSG

## Cannot restore a file

**Possible causes:**

1.  Write is protected on the destination
2.  Firewall rule in place

**Troubleshooting steps:**

1.  Tell customers to check if Write is not protected on the destination Storage account
2.  Check to see if Firewall rule is in place to prevent from copying
3.  Follow [this article](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/496072/File-Share-Snapshots_Storage-How-To?anchor=how-to-look-up-snapshot-errors-in-geneva) to find the errors in Geneva logs
4.  If you cannot determine the root cause, escalate following <https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/496072?anchor=escalation>

## Cannot delete a snapshot

**Possible cause:**

1.  Snapshot was deleted but the Portal was not refreshed

**Troubleshooting steps:**

1.  Ask customer to refresh the portal or try the operation again
2.  Follow [this article](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/496072/File-Share-Snapshots_Storage-How-To?anchor=how-to-look-up-snapshot-errors-in-geneva) to find the errors in Geneva logs
3.  If you cannot determine the root cause, escalate following <https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/496072?anchor=escalation>

## What is my snapshot size

Unfortunately there is no metric available that we can tell customers what their snapshot size is. This information is not available today.

## Cannot launch Manage Backups or issues with Manage Backups

If a file share has Azure File Backup enabled, customer will see Manage Backups button inside File Share blade. Support for Manage Backups is provided by Azure Backup and Recovery Services team.


## Developer Scenarios

### Other scenarios

Collaborate with **Developer POD** for these scenarios. Please ask the customer to take a **Fiddler** trace or use **Postman** to test API call before reaching out to Dev POD  

  - Coding issue
  - Running out of memory
  - Application crash

**Fiddler** is very useful tool do debug Service Management API errors when you are working with PowerShell or REST API based application. The problem is that due to SSL channel the communication is decrypted and you would need to encrypt this communication to see what actually is happening so you would need to decrypt the SSL traffic in Fiddler.

  - Download [Fiddler](https://www.telerik.com/fiddler)
  - How to use Fiddler [OneNote](https://microsoft.sharepoint.com/teams/WATS/_layouts/OneNote.aspx?id=%2Fteams%2FWATS%2FSiteAssets%2FWATS%20Notebook&wd=target%283_DIAGNOSTICS%2FTOOLS%20EXTERNAL%2FNETWORK.one%7C7258B644-A3C9-4A89-A449-EDFCEB819684%2FFiddler%7C83FDAFF8-F7AD-4D1E-A95D-8272EF3A487A%2F%29)  

**Postman** generates and hosts browser-based API documentation for your collections automatically in real-time. Each collection has a private and public documentation view that Postman generates from synced data in the servers

  - Download [Postman](https://www.getpostman.com/postman)
  - Introduction to Postman [video](https://www.youtube.com/watch?v=ptvV_Fc3hd8&list=PLM-7VG-sgbtCJYpjQfmLCcJZ6Yd74oytQ&autoplay=1)

**Collaboration with Dev POD**  
If you need to collaborate with Developer POD, below is the information:  
Queue: **Pod Azure Dev Storage**  

## Escalation

::: template /.templates/SME-Topics/Azure-Storage-Engineering-Escalation.md
:::



# Public Documentation

  - Announcement, <https://azure.microsoft.com/en-us/blog/announcing-azure-files-share-snapshots-public-preview/>
  - Feature overview, <https://docs.microsoft.com/en-us/azure/storage/files/storage-snapshots-files>
  - FAQ, <https://docs.microsoft.com/en-us/azure/storage/files/storage-files-faq>
  - Development related documents
      - Rest API, <https://docs.microsoft.com/en-us/rest/api/storageservices/snapshot-share>
      - Storage CLI, <https://docs.microsoft.com/en-us/azure/storage/common/storage-azure-cli#create-share-snapshot>
      - Dot Net, <https://docs.microsoft.com/en-us/azure/storage/files/storage-dotnet-how-to-use-files#share-snapshots-preview>
      - Python, <https://docs.microsoft.com/en-us/azure/storage/files/storage-python-how-to-use-file-storage#create-share-snapshot-preview>

# Other Resources

Below is a link to a blog post that's created by the PM, Rena Shah. It contains some information that is not published externally.  

  - [File Share Snapshots Blog Post](https://microsoft-my.sharepoint.com/:w:/r/personal/renash_microsoft_com/_layouts/15/WopiFrame.aspx?sourcedoc=%7B0167d0b3-30e4-4e62-9e51-fae55262116a%7D&action=edit&wdPid=29fe1abb)
  - Training link, <https://learn.microsoft.com/activity/S1963614/launch#/>


::: template /.templates/Processes/Knowledge-Management/Azure-Files-All-Topics-Feedback-Template.md
:::

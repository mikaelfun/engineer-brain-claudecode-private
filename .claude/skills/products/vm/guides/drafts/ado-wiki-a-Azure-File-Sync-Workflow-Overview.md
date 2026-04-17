---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files Sync/Workflows/Azure File Sync Workflow_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Azure%20Files%20Sync/Workflows/Azure%20File%20Sync%20Workflow_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Azure-Files-Sync
- cw.Workflow
- cw.Reviewed-12-2025
---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::

 

[[_TOC_]]

# Description

Azure File Sync

# Feature Overview

**Overview**

Azure File Sync allows you to centralize your organization's file shares in Azure Files without giving up the flexibility, performance, and compatibility of an on-premises file server. Your Windows Server installations are transformed into a quick cache of your Azure file share. You can use any protocol that's available on Windows Server to access your data locally (including SMB, NFS, and FTPS). You can have as many caches as you need around the world.

Azure File Sync enables organizations to:

- Centralize file services in Azure Files
- Cache data in multiple locations for fast, local performance
- Eliminate local backup and DR

**Scenario Overview**

- Multi-site sync: Attach up to 50 servers to sync with a single Azure file share.
- Cloud Tiering: Optional feature of Azure File Sync in which infrequently used or accessed files greater than 64 KiB in size can be tiered to Azure Files.
- Rapid Disaster Recovery: When you add a new server to a sync group, the full namespace will be available immediately without the actual data transfer. After the full namespace sync, the sync engine will fill the local disk space (download files in the background) based on the cloud tiering policy for the server endpoint.
- Cloud-based backup: Backups of an Azure file share using snapshots are currently in preview. Hardening in which the latest snapshot moves into a backup vault will be supported post-GA (timeline: TBD).

**Region Availability**

Please consult the [linked public documentation](https://learn.microsoft.com/en-us/azure/storage/file-sync/file-sync-planning#azure-file-sync-region-availability) to get the most updated information concerning regional availability.

As of the writing of this wiki, the following regions require one to request access to Azure Storage prior to being able to use Azure File Sync:
```
France South, South Africa West, and UAE Central.
```
**Standard file shares** with 100 TiB capacity have certain limitations:

- Currently, only locally redundant storage (LRS) and zone redundant storage (ZRS) accounts are supported.
- Once you enable large file shares, you cannot convert storage accounts to geo-redundant storage (GRS) or geo-zone-redundant storage (GZRS) accounts.
- Once you enable large file shares, you can't disable it.

**Azure File Sync scalability and performance targets:**

For the most up-to-date information on Azure File Sync Scalability and Performance Targets, please consult the [linked public documentation](https://learn.microsoft.com/en-us/azure/storage/files/storage-files-scale-targets#azure-file-sync-scale-targets). As quoted from this:

> Since the Azure File Sync agent runs on a Windows Server machine that connects to the Azure file shares, the effective sync performance depends upon a number of factors in your infrastructure: Windows Server and the underlying disk configuration, network bandwidth between the server and the Azure storage, file size, total dataset size, and the activity on the dataset. Since Azure File Sync works on the file level, the performance characteristics of an Azure File Sync-based solution should be measured by the number of objects (files and directories) processed per second.
>
> For Azure File Sync, performance is critical in two stages:
> 1. Initial one-time provisioning: To optimize performance on initial provisioning, refer to Onboarding with Azure File Sync for the optimal deployment details.
> 2. Ongoing sync: After the data is initially seeded in the Azure file shares, Azure File Sync keeps multiple endpoints in sync.

**List of limitations can be found here:** [Release notes for the Azure File Sync agent](https://docs.microsoft.com/en-us/azure/storage/files/storage-files-release-notes)

### RBAC for Azure File Sync 

**Feature Overview**

This feature aims to introduce detailed role-based access control (RBAC) specifically for Azure File Sync within the Azure platform. At present, Azure File Sync utilizes broad roles such as Owner and Contributor, which may not allow for specific control or clear separation of duties when managing file synchronization services. Using custom roles can result in inconsistencies and added administrative complexity. The introduction of dedicated built-in RBAC roles for Azure File Sync would allow organizations to apply the principle of least privilege, supporting both security and operational efficiency in the management of Azure File Sync resources.  

**Azure File Sync RBAC roles**

We propose two built-in RBAC roles specific to Azure File Sync Service: 

- **<span style="color:blue">Azure File Sync Administrator:</span>** This role provides full access to manage all Azure File Sync (Storage Sync Service) resources, including the ability to assign roles in Azure RBAC. 
- **<span style="color:blue">Azure File Sync Reader:</span>** This role provides read access to Azure File Sync service (Storage Sync Service). 

**Azure File Sync Administrator**

<span style="color:purple">This role provides full access to manage all Azure File Sync (Storage Sync Service) resources, including the ability to assign roles in Azure RBAC.</span>

[Learn more](/azure/storage/file-sync/file-sync-deployment-guide)

> | Actions | Description |
> | --- | --- |
> | [Microsoft.StorageSync](../permissions/storage.md#microsoftstoragesync)/register/action | Registers the server to Storage Sync Service |
> | [Microsoft.StorageSync](../permissions/storage.md#microsoftstoragesync)/unregister/action | Unregisters the server to Storage Sync Service  |
> | [Microsoft.StorageSync](../permissions/storage.md#microsoftstoragesync)/locations/* |  |
> | [Microsoft.StorageSync](../permissions/storage.md#microsoftstoragesync)/deployments/preflight/action |  |
> | [Microsoft.StorageSync](../permissions/storage.md#microsoftstoragesync)/storageSyncServices/* |  |
> | [Microsoft.StorageSync](../permissions/storage.md#microsoftstoragesync)/operations/read | Returns the status of Storage Sync operations |
> | [Microsoft.Insights](../permissions/monitor.md#microsoftinsights)/AlertRules/* | Create and manage a classic metric alert |
> | [Microsoft.Resources](../permissions/management-and-governance.md#microsoftresources)/deployments/* | Create and manage a deployment |
> | [Microsoft.Resources](../permissions/management-and-governance.md#microsoftresources)/subscriptions/resourceGroups/read | Gets or lists resource groups |
> | [Microsoft.Support](../permissions/general.md#microsoftsupport)/* | Create and update a support ticket |
> | [Microsoft.Authorization](../permissions/management-and-governance.md#microsoftauthorization)/roleAssignments/write | Create and update role assignments |
> | [Microsoft.Authorization](../permissions/management-and-governance.md#microsoftauthorization)/roleAssignments/read | Read role assignments |
> | [Microsoft.Storage](../permissions/storage.md#microsoftstorage)/storageAccounts/read | Returns the list of storage accounts or gets the properties for the specified storage account |
> | [Microsoft.Storage](../permissions/storage.md#microsoftstorage)/storageAccounts/fileServices/read | List file services |
> | [Microsoft.Storage](../permissions/storage.md#microsoftstorage)/storageAccounts/fileServices/shares/read | Get file share |
> | **NotActions** |  |
> | *none* |  |
> | **DataActions** |  |
> | *none* |  |
> | **NotDataActions** |  |
> | *none* |  |
```json
{
  "assignableScopes": [
    "/"
  ],
  "description": "This role provides full access to manage all Azure File Sync (Storage Sync Service) resources, including the ability to assign roles in Azure RBAC.",
  "id": "/providers/Microsoft.Authorization/roleDefinitions/92b92042-07d9-4307-87f7-36a593fc5850",
  "name": "92b92042-07d9-4307-87f7-36a593fc5850",
  "permissions": [
    {
      "actions": [
        "Microsoft.StorageSync/register/action",
        "Microsoft.StorageSync/unregister/action",
        "Microsoft.StorageSync/locations/*",
        "Microsoft.StorageSync/deployments/preflight/action",
        "Microsoft.StorageSync/storageSyncServices/*",
        "Microsoft.StorageSync/operations/read",
        "Microsoft.Insights/AlertRules/*",
        "Microsoft.Resources/deployments/*",
        "Microsoft.Resources/subscriptions/resourceGroups/read",
        "Microsoft.Support/*",
        "Microsoft.Authorization/roleAssignments/write",
        "Microsoft.Authorization/roleAssignments/read",
        "Microsoft.Storage/storageAccounts/read",
        "Microsoft.Storage/storageAccounts/fileServices/read",
        "Microsoft.Storage/storageAccounts/fileServices/shares/read"
      ],
      "notActions": [],
      "dataActions": [],
      "notDataActions": []
    }
  ],
  "roleName": "Azure File Sync Administrator",
  "roleType": "BuiltInRole",
  "type": "Microsoft.Authorization/roleDefinitions"
}
```
**Azure File Sync Reader**
<span style="color:purple">This role provides read access to Azure File Sync service (Storage Sync Service).</span>

[Learn more](/azure/storage/file-sync/file-sync-deployment-guide)

> | Actions | Description |
> | --- | --- |
> | [Microsoft.StorageSync](../permissions/storage.md#microsoftstoragesync)/*/read |  |
> | **NotActions** |  |
> | *none* |  |
> | **DataActions** |  |
> | *none* |  |
> | **NotDataActions** |  |
> | *none* |  |
```json
{
  "assignableScopes": [
    "/"
  ],
  "description": "This role provides full access to manage all Azure File Sync (Storage Sync Service) resources, including the ability to assign roles in Azure RBAC.",
  "id": "/providers/Microsoft.Authorization/roleDefinitions/754c1a27-40dc-4708-8ad4-2bffdeee09e8",
  "name": "754c1a27-40dc-4708-8ad4-2bffdeee09e8",
  "permissions": [
    {
      "actions": [
        "Microsoft.StorageSync/*/read"
      ],
      "notActions": [],
      "dataActions": [],
      "notDataActions": []
    }
  ],
  "roleName": "Azure File Sync Reader",
  "roleType": "BuiltInRole",
  "type": "Microsoft.Authorization/roleDefinitions"
}
```

### How it works

This section provides more information not listed in the Feature Overview section.

The following is a summary of the deployment experience:

1. Create an Azure storage account.
2. Create an Azure file share.
3. Create the Azure File Sync service in the portal by clicking "New" and searching for "Azure File Sync."
    1. As soon as the user clicks 'Create,' the next blade is called 'Deploy storage sync.'
    2. After the service is created, the portal experience will be within the 'Storage Sync Services' blade.
4. Install the Storage Sync Agent on the file server(s) and register the server (establishing a trust relationship between the server and the service).
5. Within the Storage Sync Service, create a Sync Group and specify the Cloud Endpoint (Azure file share you want to sync to).
6. Within the Sync Group, create a Server Endpoint (directory or volume on the server you want to sync to the Azure file share) and optionally specify the cloud tiering settings.
7. Within the Sync Group, create additional Server Endpoints (other file servers) for multi-site access to the same Azure file share.

For more information, see the Azure File Sync deployment guide: <https://docs.microsoft.com/en-us/azure/storage/files/storage-sync-files-deployment-guide?tabs=portal>

## Latest Azure File Sync agent version

- See release notes for the latest version: <https://docs.microsoft.com/en-us/azure/storage/files/storage-files-release-notes>

*Note: It is a best practice to ensure the agent is up to date.*

**Important: Please take the time to review** [File Sync V11.1 - Portal Improvements - Initial cloud change enumeration & File Sync Errors](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495813/Azure_Storage_Azure-File-Sync-V11.1-Portal-Improvements-Initial-cloud-change-enumeration-File-Sync-Errors).

## Azure File Sync Terminology

This information is from the planning guide: <https://docs.microsoft.com/en-us/azure/storage/files/storage-sync-files-planning>

*Note: It is prudent to encourage our customers to leverage the Evaluation tool during the planning phase of the deployment.*

**Storage Sync Service**  
The Storage Sync Service is the top-level Azure resource for Azure File Sync. The Storage Sync Service resource is a peer of the storage account resource and can similarly be deployed to Azure resource groups. A distinct top-level resource from the storage account resource is required because the Storage Sync Service can create sync relationships with multiple storage accounts via multiple sync groups. A subscription can have multiple Storage Sync Service resources deployed.  
[![AzureStorage-AFSManagementConcepts.png](/.attachments/SME-Topics/Azure-Files-Sync/2fc4258d-0316-011c-ddf2-5da85217156e300px-AzureStorage-AFSManagementConcepts.png)](/.attachments/SME-Topics/Azure-Files-Sync/2fc4258d-0316-011c-ddf2-5da85217156e300px-AzureStorage-AFSManagementConcepts.png)  

**Sync Group**  
A Sync Group defines the sync topology for a set of files. Endpoints (see below) within a Sync Group will be kept in sync with each other. If, for example, you have two distinct sets of files that you want to manage with AFS, you would create two Sync Groups and add different endpoints to each. A Storage Sync Service can host as many Sync Groups as you need.  
[![AzureStorage-AFSSyncGroup.png](/.attachments/SME-Topics/Azure-Files-Sync/fc3b8898-0938-ffa1-0b23-e285e4cba286300px-AzureStorage-AFSSyncGroup.png)](/.attachments/SME-Topics/Azure-Files-Sync/fc3b8898-0938-ffa1-0b23-e285e4cba286300px-AzureStorage-AFSSyncGroup.png)  

**Registered Server**  
The registered server object represents a trust relationship between your server (or cluster) and the Storage Sync Service. You can register as many servers to a Storage Sync Service instance as you want. However, a server (or cluster) can be registered with only one Storage Sync Service at a time.  

**Cloud Endpoint**  
A cloud endpoint is an Azure file share that is part of a sync group. The entire Azure file share syncs, and an Azure file share can be a member of only one cloud endpoint. Therefore, an Azure file share can be a member of only one sync group. If you add an Azure file share that has an existing set of files as a cloud endpoint to a sync group, the existing files are merged with any other files that are already on other endpoints in the sync group.

Important: Azure File Sync supports making changes to the Azure file share directly. However, any changes made on the Azure file share first need to be discovered by an Azure File Sync change detection job. A change detection job is initiated for a cloud endpoint only once every 24 hours. In addition, changes made to an Azure file share over the REST protocol will not update the SMB last modified time and will not be seen as a change by sync. For more information, see Azure Files frequently asked questions.

**Server Endpoint**  
A server endpoint represents a specific location on a registered server, such as a folder on a server volume. Multiple server endpoints can exist on the same volume if their namespaces do not overlap (for example, `F:\sync1` and `F:\sync2`). You can configure cloud tiering policies individually for each server endpoint.

You can create a server endpoint via a mountpoint. Note, mountpoints within the server endpoint are skipped.

You can create a server endpoint on the system volume, but there are two limitations if you do so:

- Cloud tiering cannot be enabled.
- Rapid namespace restore (where the system quickly brings down the entire namespace and then starts to recall content) is not performed.

Important: Only non-removable volumes are supported. Drives mapped from a remote share are not supported for a server endpoint path. In addition, a server endpoint may be located on the Windows system volume though cloud tiering is not supported on the system volume.

If you add a server location that has an existing set of files as a server endpoint to a sync group, those files are merged with any other files that are already on other endpoints in the sync group.

<div style="width: 85%; margin: auto">
    <div style="background:#ffac07; color:black; font-weight:bold; text-align:center;">
        Note!
    </div>
    <div style="background:#ffda92; color:black; font-weight:bold; text-align:center;">
 
Azure Files Sync takes a snapshot of the Azure file share as a backup before creating the server endpoint. This snapshot can be used to restore the share to the state before the server endpoint was created. The snapshot is not removed automatically after the server endpoint is created, so you can delete it manually if you don't need it. You can find the snapshots created by Azure File Sync by looking at the snapshots for the Azure file share and checking for AzureFileSync in the Initiator column.

</div>
</div>

**Cloud Tiering**

Cloud tiering is an optional feature of Azure File Sync in which infrequently used or accessed files greater than 64 KiB in size can be tiered to Azure Files. When a file is tiered, the Azure File Sync file system filter (StorageSync.sys) replaces the file locally with a pointer, or reparse point. The reparse point represents a URL to the file in Azure Files. A tiered file has the "offline" attribute set in NTFS so third-party applications can identify tiered files (Windows explorer shows APLO in the Attributes column). When a user opens a tiered file, Azure File Sync seamlessly recalls the required file data range from Azure Files without the user needing to know that the file is not stored locally on the system. This functionality is also known as Hierarchical Storage Management (HSM).

Important: Cloud tiering is not supported for server endpoints on the Windows system volumes.

**Azure File Sync Agent**

The Azure File Sync agent is a downloadable package that enables Windows Server to be synced with an Azure file share. The Azure File Sync agent has three main components:

- **FileSyncSvc.exe**: The background Windows service that is responsible for monitoring changes on server endpoints, and for initiating sync sessions to Azure, ghosting and recall core implementation.
- **StorageSync.sys**: The Azure File Sync file system filter, which is responsible for tiering files to Azure Files (when cloud tiering is enabled), fulfilling user/application recall requests, and tracking file heat information.
- **PowerShell management cmdlets**: PowerShell cmdlets that you use to interact with the Microsoft.StorageSync Azure resource provider. You can find these at the following (default) locations:
    - C:\\Program Files\\Azure\\StorageSyncAgent\\StorageSync.Management.PowerShell.Cmdlets.dll
    - C:\\Program Files\\Azure\\StorageSyncAgent\\StorageSync.Management.ServerCmdlets.dll

## Architecture
<details close> 
<summary> (<span style="color:blue">Click to expand</span>) </summary>
<br>
The following architecture diagrams show the Microsoft Sync Framework (MSF) and the overall architecture of the Azure File Sync (AFS) feature.

### Architecture Diagram - Microsoft Sync Framework

Azure File Sync utilizes the Microsoft Sync Framework (MSF) for syncing files and folders:

![AzureStorage-Architecture-MicrosoftSyncFramework.png](/.attachments/SME-Topics/Azure-Files-Sync/be2c4fff-61fd-d2c6-a7e8-f81d7a997169800px-AzureStorage-Architecture-MicrosoftSyncFramework.png)

### Architecture Diagram - Azure File Sync (AFS)

The following architecture diagram shows the overall Azure File Sync feature (Note that the beta name of AFS was Kailani):

![AzureStorage-Architecture-AzureFileSync.png](/.attachments/SME-Topics/Azure-Files-Sync/408bbcbc-78e9-26cc-9b42-4e548b820329AzureStorage-Architecture-AzureFileSync.png)

</details>
<br>

## Common Sync Errors, Common Management Errors, Common Recall Errors, Agent


> :exclamation: IMPORTANT WARNING:  
> **Don't attempt to troubleshoot issues with sync, cloud tiering, or any other aspect of Azure File Sync by unregistering and registering a server, or removing and recreating the server endpoints unless explicitly instructed to by a Microsoft engineer.** Unregistering a server and removing server endpoints is a **<font color=red>destructive operation</font>**, and tiered files on the volumes with server endpoints will not be "reconnected" to their locations on the Azure file share after the registered server and server endpoints are recreated, which will result in sync errors. Tiered files that exist outside of a server endpoint namespace might be permanently lost. Tiered files might exist within server endpoints even if cloud tiering was never enabled.

### Impact of Un-Registration

<details close> 
<summary><font color=purple>Expand for details on impact of unregistering a server.</font></summary>
<br>
* Considered a �big hammer� approach leading to cascading issues:

  * SEPs de-provisioned.
  * Tiered files orphaned/broken.
  * Re-creation of SEPs delayed until Orphaned Files Cleanup completes (time depends on namespace file count).

**Action Required** 

1. If customer attempted this before contacting CSS:
   * Capture details early (server unregistered or SEP de-provisioned) for PG team investigation.

</details>
<br>

For the latest collection of well-known errors and remediation maintained by our product group, see:

- [Troubleshooting per file/directory sync errors](https://docs.microsoft.com/en-us/azure/storage/file-sync/file-sync-troubleshoot?tabs=portal1%2Cazure-portal#troubleshooting-per-filedirectory-sync-errors)
- [Common sync errors](https://docs.microsoft.com/en-us/azure/storage/file-sync/file-sync-troubleshoot?tabs=portal1%2Cazure-portal#common-sync-errors)
- [Common management errors](https://docs.microsoft.com/en-us/azure/storage/file-sync/file-sync-troubleshoot?tabs=portal1%2Cazure-portal#sync-group-management)
- [Tiering errors and remediation](https://docs.microsoft.com/en-us/azure/storage/file-sync/file-sync-troubleshoot?tabs=portal1%2Cazure-portal#tiering-errors-and-remediation)
- [Recall errors and remediation](https://docs.microsoft.com/en-us/azure/storage/file-sync/file-sync-troubleshoot?tabs=portal1%2Cazure-portal#recall-errors-and-remediation)
- [Troubleshoot Azure File Sync agent installation and server registration](https://learn.microsoft.com/en-us/azure/storage/file-sync/file-sync-troubleshoot-installation?source=recommendations)
- [Deprovision your Azure File Sync server endpoint](https://learn.microsoft.com/en-us/azure/storage/file-sync/file-sync-server-endpoint-delete?source=recommendations)

## Advanced File Sync Troubleshooting Guides for Deeper Investigations

(**Note:** TSGs are in no particular order. Leverage the relevant TSG that applies to the customer scenario.)

- [TSG 124 How to investigate sync performance and progress](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/784355)
- [TSG 170 AFS Formatting Server Telemetry Events in DGrep Storage](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/784046)
- [TSG 173 AFS Generating Crash Dumps filesyncsvc Storage](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/784047)
- [TSG 174 AFS Enabling or Disabling diagnostics on Customer server Storage](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/784048)
- [TSG 193 AFS Investigate Missing Server Telemetry or Server Showing No Activity Storage](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/784049)
- [TSG 206 AFS How to get ShareId from SyncGroup and Subscription ID Storage](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/784050)
- [TSG 222 AFS Agent Installation troubleshooting Storage](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/784051)
- [TSG 227 AFS Windows Performance Toolkit for Customer Servers Storage](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/784052)
- [TSG 268 AFS Collect WinHTTP traces Storage](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/784053)
- [TSG 349 AFS Sync Progress and Initial Sync Storage](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/784054)
- [TSG 372 AFS How to Troubleshoot Private Endpoint failures Storage](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/784055)
- [TSG 428 AFS Disable VSS Sync Storage](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/784056)
- [TSG 504 AFS ECS_E_DIRECTORY_RENAME_FAILED per item upload errors_storage](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/1032001)
- [TSG AFS Enable files and folder Auditing on Windows Server Storage](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/784057)
- [TSG AFS Getting Kernel dump for Investigation Storage](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/784058)
- [TSG AFS Sync investigation Cloud Enumeration and Upload Session Storage](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/784060)
- [TSG AFS Server Certificate Issues Storage](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/784059)
- [TSG-AFS-MacOS-slow-file-recall-tiering_Storage](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/1093994)
- [File Sync Issues - Unsupported characters](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495832)
 - [File Sync Issues - Mgmt Fileshare Authorization Failed](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/1879364)

### Cloud Tiering Investigations

- [TSG AFS Cloud Tiering_Storage](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495822)
- [TSG AFS Cloud Tiering Check why a file is tiered](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/863879)
- [TSG AFS Cloud Tiering Dump heat store data](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/863880)
- [TSG AFS Cloud Tiering Heat tracking Process name exclusion from last access time tracking](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/863881)
- [TSG AFS Cloud Tiering Identify a corrupt heatstore](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/863882)
- [TSG AFS Heat Store_Storage](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/863883)
- [TSG 196 AFS Delete an ESE database on the Server](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/863876)
- [TSG 212 AFS Cloud Tiering Collect heatsore for offline analysis](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/863877)
- [TSG 213 AFS Cloud Tiering Deleting a heatstore](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/863878)

## How to Approach File Sync Escalations

- Refer to the section labeled **'How to Approach File Sync Escalations'** in the Storage engineering escalation guide.

::: template /.templates/SME-Topics/Azure-Storage-Engineering-Escalation.md  
::: 

### Tracking AFS ICMs

- [Active and Mitigating Issues for Azure File Sync (XSync)](https://portal.microsofticm.com/imp/v3/incidents/search/basic?serviceCategories=0&services=10127&teams=0&environments=PROD&environments=TEST&environments=PPE&environments=OTHER&severities=0&severities=1&severities=2&severities=3&severities=4&statuses=Active&statuses=Mitigating&acknowledgment=Yes&acknowledgment=No&startDate=2010-01-01T08:00:00.000Z&endDate=2017-09-26T07:00:00.000Z&dateTimeRangeType=3)


### Public Documentation

**Azure Files Documentation**
- Marketing landing page: [Azure Files](https://azure.microsoft.com/en-us/services/storage/files/)
- Technical landing page: [Introduction to Azure Files](https://docs.microsoft.com/en-us/azure/storage/files/storage-files-introduction)
- [Azure built-in roles for Storage](https://learn.microsoft.com/en-us/azure/role-based-access-control/built-in-roles/storage#azure-file-sync-administrator)

**Azure File Sync Documentation**
- **Overview and Technical**
    - [Azure File Sync release notes](https://docs.microsoft.com/en-us/azure/storage/files/storage-files-release-notes)
    - [Planning for Azure File Sync deployment](https://docs.microsoft.com/en-us/azure/storage/files/storage-sync-files-planning)
    - [Azure File Sync scale targets and performance metrics](https://docs.microsoft.com/en-us/azure/storage/files/storage-files-scale-targets#azure-file-sync-scale-targets)
    - [Cloud Tiering overview](https://docs.microsoft.com/en-us/azure/storage/files/storage-sync-cloud-tiering)
    - [How to deploy Azure File Sync](https://docs.microsoft.com/en-us/azure/storage/files/storage-sync-files-deployment-guide)
    - [Azure File Sync proxy and firewall settings](https://docs.microsoft.com/en-us/azure/storage/files/storage-sync-files-firewall-and-proxy)
    - [Register/unregister a server with Azure File Sync](https://docs.microsoft.com/en-us/azure/storage/files/storage-sync-files-server-registration)
    - [Add/remove an Azure File Sync Server Endpoint](https://docs.microsoft.com/en-us/azure/storage/files/storage-sync-files-server-endpoint)
    - [Manage registered servers with Azure File Sync](https://learn.microsoft.com/en-us/azure/storage/file-sync/file-sync-server-registration?source=recommendations)
    - [Monitor Azure File Sync](https://learn.microsoft.com/en-us/azure/storage/file-sync/file-sync-monitoring)
- **Troubleshooting and FAQ**
    - [Troubleshoot Azure File Sync](https://docs.microsoft.com/en-us/azure/storage/files/storage-sync-files-troubleshoot)
        - [Troubleshooting Azure File Sync - AFSDiag section](https://docs.microsoft.com/en-us/azure/storage/files/storage-sync-files-troubleshoot#general-troubleshooting)
    - [Azure File Sync section of "Frequently Asked Questions about Azure Files"](https://docs.microsoft.com/en-us/azure/storage/files/storage-files-faq#azure-file-sync)
- **Azure Portal**
    - [Azure File Sync in the Marketplace](https://portal.azure.com/#blade/Microsoft_Azure_Marketplace/GalleryFeaturedMenuItemBlade/selectedMenuItemId/home/searchQuery/Azure%20File%20Sync/resetMenuId/)
    - [Deploy Storage Sync Service](https://portal.azure.com/#create/Microsoft.HfsGalleryPackage)

#### Training and Other Resources

**PG/CSS Sessions**:
- Feature Overview (Boyd Benson, Jeff Patterson)
    - Recording: [Azure Files Sync Services Overview - Tuesday, July 10, 2018.mp4](https://microsoft.sharepoint.com/:v:/t/VMHub/ETqltq-79K5LvMApZvqe80MB2Xif5gcPthm4BYJWoMYkhw?e=DIjkED)
    - Shared OneDrive Location:
        - Folder: [AFS Feature Overview 20180710](https://microsoft-my.sharepoint.com/:f:/p/bbenson/Ejn1zScWyJxLkPKGKMQmvxgBd_mlamHFJvV4DZuKbMHLQg?e=o1a9mp)
        - Recording: [Azure Files Sync Services Overview - Tuesday, July 10, 2018.mp4](https://microsoft-my.sharepoint.com/:v:/p/bbenson/EWDKkBbLIepNiP6UaJ7EvokBDgFssXTE4kfIEO4uhlSRIw?e=E8NpAG)
        - PPT: [AzureFileSync_FeatureOverview_20180710.pptx](https://microsoft-my.sharepoint.com/:p:/p/bbenson/EQpWFB7SMYtOk9rCHI8JjsIBaLn5UGLfkw7J0W1UVkZbWg?e=qoVPzR)
- Sync Architecture - Part 1 (Spencer Bishop)
    - Recording: [Sync Architecture - Tuesday, September 25, 2018](https://microsoft.sharepoint.com/:v:/t/IaaSVMPODEMEA/ETImUmuVL6lMiYKgNYZWz6YB8-Ct6rPtNn6aXHXdwyxS2A)
- Sync Architecture - Part 2 (Jason Shay)
    - Recording: [Sync Architecture - Tuesday, October 30, 2018](https://microsoft.sharepoint.com/teams/IaaSVMPODEMEA/Shared%20Documents1/Forms/AllItems.aspx?id=%2Fteams%2FIaaSVMPODEMEA%2FShared%20Documents1%2FBrownbag%20recordings%2FAzure%20File%20Sync%20monthly%20brownbag%20-%20Sync%20in%20Azure%20File%20Sync%20(Jason%20Shay.Jeff%20Patterson)%20-%2030-Oct-2018.mp4&parent=%2Fteams%2FIaaSVMPODEMEA%2FShared%20Documents1%2FBrownbag%20recordings&p=true&slrid=1ada9d9e-207a-0000-b067-d8da16ca74aa)
- Cloud Tiering Architecture (Amit Karandikar)
    - Recording: [Cloud Tiering Architecture - Tuesday, January 8, 2019](https://microsoft.sharepoint.com/:v:/t/IaaSVMPODEMEA/ERQJRipRQMpCiBg3QURcHQkBOy_2pyL7EPegFVGmE8IQLA)
    - PPT: [Cloud Tiering Architecture](https://microsoft.sharepoint.com/:p:/t/IaaSVMPODEMEA/ESuYOyrGRRRLlR0qmFm4fNYB9Umd-nk3i6UmezeMWOsEmA?rtime=Acrhj2J21kg)

- Offline Data Transfer (Fabian Uhse)
    - Recording: [Offline Data Transfer - Thursday, April 11, 2019](https://microsoft.sharepoint.com/:v:/t/VMHub/EQiKQjyW73xFk05RWOAyGFUBZ4zqre_BbnzvhGJa2bBwow?e=z2sMy1)
- Azure Support Center Overview (Jeff Patterson, Jawahar Ali)
    - Recording: [Introducing Azure Support Center for Azure File Sync - Tuesday, July 31, 2018](https://microsoft.sharepoint.com/teams/IaaSVMPODEMEA/Shared%20Documents1/Forms/AllItems.aspx?id=%2Fteams%2FIaaSVMPODEMEA%2FShared%20Documents1%2FBrownbag%20recordings%2FIntroducing%20Azure%20Support%20Center%20for%20AFS(Azure%20File%20Sync).mp4&parent=%2Fteams%2FIaaSVMPODEMEA%2FShared%20Documents1%2FBrownbag%20recordings&p=true&slrid=3525829e-e03b-0000-a5ec-d71a33677e7b)

- AFS PowerBI Dashboard session:
    - Recording: [PG - AFS PowerBI Dashboard - Jawahar Ali 20180208.mp4](https://microsoft-my.sharepoint.com/:v:/p/bbenson/EdVV7tA2viFKg9iWpt0aMiIBovidjg5OhI5WgMFkJBv5kA?e=NXURyW)
    - Folder: [PG PowerBI Dashboard Jawahar](https://microsoft-my.sharepoint.com/:f:/p/bbenson/EvOM4EAIrpNPqTzFKiy6VGQBPmWPYkVSgE2LQJy1wS-c6w?e=FTzn4b)

- Azure File Sync and Windows Admin Center:
    - Recording: [Azure File Sync and Windows Admin Center](https://microsoft.sharepoint.com/:v:/t/VMHub/IQAkiZLQWSUEQqdRyw5bIKvHAf-XYkkq3kiSLZXUkWZwfDk?e=7NVbSV)

**Older Presentations**:
- [AFS overview presentation (10/2017)](https://microsoft.sharepoint.com/teams/HSS/Shared%20Documents/CSS/Architecture%20Overview/Hybrid%20File%20Services%20(HFS)%20Overview.mp4?csf=1)
    - This presentation provides a high-level overview of the AFS architecture (start at minute 40 in the presentation).
- [First look: Azure Storage Hybrid File Services (TechReady 24 - 2/6/2017)](https://techreadytv.com/TR24/session?sCode=AZR226)
    - Description: �The attraction of cloud storage is clear: on-demand capacity, pay for just what you use, no more hardware migration headaches, global reach with availability SLAs, offload backup/recovery/DR, and a reduction in storage management costs. This sounds great, but how can your customers achieve those goals without compromising on performance and compatibility for their existing applications and users? In this session we�ll share our near-term plans for delivering truly hybrid file services to extend Azure Files into your customers� datacenters by turning a file server (or multiple servers deployed across branch offices) into a lightweight, disposable, performance cache without deploying new hardware or making any changes to their existing storage infrastructure. We�ll also share the progress we�re making with our private preview customers and the feedback we�re hearing from them to prepare you to start talking to your customers when we reach public preview. This talk is presented by the Azure Storage engineering team.�
- [Azure Files with Sync: Managed SMB in the Cloud and Seamlessly Extending your File Servers to Azure (Ready - 7/20/2017)](https://digital.microsoftready.com/FY18/Session/TECH-CI222)
    - Description: �Azure Files is a fully managed SMB service in the Azure Cloud for use on Azure Windows and Linux VMs and accessible from on-premises servers. In this talk, we will cover the many new capabilities coming soon for Azure Files including larger shares, share snapshots and AAD integration. In addition, the new Azure Files Sync service makes it possible to extend your existing Windows File servers to Azure with multi-site access, tiered storage, cloud backup and restore and more. It's never been easier to get our customers to move their data to the cloud�come learn how to use this service and get ready for a fantastic launch in CY17.�

#### LabBox
**LabBox Readiness Lab**
<details close> 
<summary> (<span style="color:blue">Click to expand</span>) </summary>
<br>

Manual Steps and Options for Customer Setup Process: A guide for post-deployment tasks and readiness assessment

Deployment Link:
[LabBox Deployment](https://labboxprod.azurewebsites.net/api/Labbox?url=https://supportability.visualstudio.com/azureiaasvm/_git/labbox?path=/sme/storage/filesynclab1.json)

This lab spins up the infra needed for a basic Azure File sync environment.
- 2 VMs with 1 data disk each (for cloud tiering functionality)
- 1 File Sync Service and Sync Group
- 1 Storage Account with 1 File Share

Manual steps required after deployment mimic customer setup process. Understanding these steps and options is aimed towards readiness.

Provide RBAC access to the VMs:
1. Navigate to the Storage Sync Service in the Azure Portal and select "Access Control (IAM)"
2. Add -> Add role assignment -> Privileged Administrator Roles -> Add "Contributor" -> Next
3. Managed Identity -> Select Members -> Managed Identity -> Virtual Machines -> select "afsvm1" and "afsvm2" -> Select -> Review and Assign

Allow RDP connection to VM public endpoint (if NSG policy blocks RDP connection):
1. In Portal, Navigate to one of the Virtual Machines and select "Network Settings" on the left pane.
2. Select the "RDP" rule to edit the subnet NSG.
3. Under the "Source" dropdown box, select "My IP Address" and press the "Save" button at bottom.

VM configuration - connect to each VM via RDP and perform the steps:
1. In Server Manager - Disable "IE Security Enhanced Configuration"
2. Navigate to C:\AFSAGENT and install the File Sync agent. After install succeeds, the registration UI appears. The registration process links the server to the storage sync service.
3. At the Registration step:
        - Option 1: If your tenant has security restrictions that do not allow authentication to Azure from unmanaged devices, such as the internal MSFT FDPO tenant, you cannot perform the registration step from the installer UI as logging in will fail. The workaround is to exit the Registration UI at this step and use the VM's managed identity with PowerShell to log in and register:
                - To log in, launch PowerShell and execute: `Add-AzAccount -Identity` (if you have more than 1 subscription, add the parameter: -Subscription <subid>)
                - You'll need the resource group name and the storage sync name from the Portal.
                - Then register the server endpoint to the storage sync service with cmdlet: `Register-AzStorageSyncServer -ResourceGroupName "<resource-group-name>" -StorageSyncServiceName "<storage-sync-service-name>"`
        - Option 2: If you have no such security restrictions, you can proceed to log into Azure using the UI and register the server endpoint.

4. Sync Service Endpoint Configuration
        1. In Azure Portal - Navigate to File Sync Services and select corresponding service and sync group.
        2. Add New Cloud Endpoint - point to newly created storage account and file share
        3. Add New Server Endpoints, one for each VM. Select the registered server and set share path to S:\
        4. Select the appropriate configuration options for the lab scenario for initial upload type, cloud tiering, etc.
        5. On VM1, create a file on the S: drive and observe sync into the Azure File Share (Navigate in portal) and down to S: drive on VM2.

</details>
<br>

::: template /.templates/Processes/Knowledge-Management/Azure-Files-Sync-Feedback-Template.md
:::


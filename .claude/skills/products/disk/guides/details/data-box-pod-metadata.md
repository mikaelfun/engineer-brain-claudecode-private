# Disk Data Box POD: Metadata & ACL — 综合排查指南

**条目数**: 7 | **草稿融合数**: 2 | **Kusto 查询融合**: 0
**来源草稿**: ado-wiki-a-applying-acl-permissions-data-box.md, ado-wiki-a-metadata-preservation-permissions-data-box.md
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Ado Wiki A Applying Acl Permissions Data Box
> 来源: ADO Wiki (ado-wiki-a-applying-acl-permissions-data-box.md)

1. sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Data Box/Connect & Copy/Applying ACL and Permissions at destination and removing source ACLs before data transfer to Data Box"
2. sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Data%20Box%2FConnect%20%26%20Copy%2FApplying%20ACL%20and%20Permissions%20at%20destination%20and%20removing%20source%20ACLs%2
3. importDate: "2026-04-05"
4. type: troubleshooting-guide
5. This can apply to situations where the customer does NOT want to retain ACL's, or they want their files to inherit permissions from the destination domain. For example, customer is trying to copy source data from their on-premises domain (Domain-A) t
6. However, they do not want to retain the source Permissions/ACL's, and would like the copied files to inherit the permissions from the destination, in this case Domain-B
7. By design when using SMB, the databox only sees source ACL's, retains source ACL's, and does not inherit permissions if it already has source ACL's, as this is the most common use-case for the Databox Service.
8. There are three known options to do this:
9. * **Option 1:**   Use databox as is, and forward source permissions, inherit everything downwards at destination
10. `With this option, once the data is transferred to its destination, customer will be required to inherit permissions from share-root directory to files manually. This can be time-consuming especially with large amounts of data it could take days or w

### Phase 2: Troubleshooting Guide: Metadata and Permissions Issues on Data Box  
> 来源: ADO Wiki (ado-wiki-a-metadata-preservation-permissions-data-box.md)

1. sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Data Box/Connect & Copy/Metadata Preservation and Permissions Issues on Data Box"
2. sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Data%20Box%2FConnect%20%26%20Copy%2FMetadata%20Preservation%20and%20Permissions%20Issues%20on%20Data%20Box"
3. importDate: "2026-04-05"
4. type: troubleshooting-guide
5. Upon completing data transfer to the Data Box, customers may notice that metadata such as ACLs, timestamps, and file attributes are not preserved. They may also encounter issues with editing or deleting data due to permission problems.
6. 1. Metadata isn't preserved when transferring data to Blob Storage.
7. 2. Metadata such as `LastAccessTime`, `File_Attribute_Offline`, and `File_Attribute_Not_Content_Indexed` aren't transferred.
8. 3. ACLs aren't transferred during data copies over Network File System (NFS).
9. 4. ACLs aren't transferred when using the Data Copy service.
10. 5. User is not a backup operator or "Backup Operator Privileges" is disabled.

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Customer wants files to inherit destination domain permissions instead of retaining source ACLs when copying to Data Box | By design, Data Box over SMB retains source ACLs and does not inherit destination permissions | Three options: (1) Copy as-is then manually inherit permissions at destination using share-root inheritance; (2) Disable | 🟢 8.5 | [ADO Wiki] |
| 2 | Metadata (ACLs, timestamps, attributes) not preserved when transferring data from Data Box to Blob Storage | Blob Storage does not support NTFS file metadata (ACLs, timestamps, attributes); only Azure Files pr | Transfer data to Azure Files instead of Blob Storage to preserve metadata | 🟢 8.5 | [ADO Wiki] |
| 3 | LastAccessTime, File_Attribute_Offline, and File_Attribute_Not_Content_Indexed metadata not transferred via Data Box | By design, Data Box does not transfer these specific metadata attributes | This is by-design behavior; these metadata types are not supported for transfer via Data Box | 🟢 8.5 | [ADO Wiki] |
| 4 | Cannot copy data with ACL preservation on Data Box; permission errors during copy process | User is not a Backup Operator or Backup Operator Privileges is disabled in Data Box Web UI | Ensure user is part of the Backup Operator group and enable Backup Operator Privileges via Data Box Web UI | 🟢 8.5 | [ADO Wiki] |
| 5 | ACLs and metadata not transferred during Data Box copy even when expected; Enable ACLs for Azure Files setting is disabl | The Enable ACLs for Azure Files option is disabled in Data Box Web UI, preventing metadata transfer | Enable ACLs for Azure Files in the Data Box local Web UI to transfer metadata including ACLs, file attributes, and times | 🟢 8.5 | [ADO Wiki] |
| 6 | Unable to delete or rename files/folders on Data Box device; errors about invalid characters, Administrator permission,  | Folders with invalid characters or improperly copied folders in root directory; user lacks permissio | 1) Ensure device unlocked, login with domain admin. 2) Disable UAC and reboot. 3) Create empty temp: mkdir c:\temp\empty | 🟢 8.5 | [ADO Wiki] |
| 7 | Unable to delete or rename files/folders on Data Box device; errors include Administrator permission required, invalid c | Folders with invalid characters or improperly copied files placed in root directory; user lacks requ | 1) Verify device unlocked, user logged in with domain admin. 2) Disable UAC and test. 3) Reboot pod and retry. 4) Roboco | 🟢 8.5 | [ADO Wiki] |

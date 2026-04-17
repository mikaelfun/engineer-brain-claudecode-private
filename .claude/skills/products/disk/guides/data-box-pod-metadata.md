# Disk Data Box POD: Metadata & ACL — 排查速查

**来源数**: 7 | **21V**: 全部适用
**最后更新**: 2026-04-07
**关键词**: acl, azure-files, backup-operator, blob-storage, by-design, data-box, delete-files, file-attributes, invalid-characters, metadata

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | Customer wants files to inherit destination domain permissions instead of retaining source ACLs when copying to Data Box | By design, Data Box over SMB retains source ACLs and does not inherit destination permissions | Three options: (1) Copy as-is then manually inherit permissions at destination using share-root inheritance; (2) Disable | 🟢 8.5 | [ADO Wiki] |
| 2 📋 | Metadata (ACLs, timestamps, attributes) not preserved when transferring data from Data Box to Blob Storage | Blob Storage does not support NTFS file metadata (ACLs, timestamps, attributes); only Azure Files pr | Transfer data to Azure Files instead of Blob Storage to preserve metadata | 🟢 8.5 | [ADO Wiki] |
| 3 📋 | LastAccessTime, File_Attribute_Offline, and File_Attribute_Not_Content_Indexed metadata not transferred via Data Box | By design, Data Box does not transfer these specific metadata attributes | This is by-design behavior; these metadata types are not supported for transfer via Data Box | 🟢 8.5 | [ADO Wiki] |
| 4 📋 | Cannot copy data with ACL preservation on Data Box; permission errors during copy process | User is not a Backup Operator or Backup Operator Privileges is disabled in Data Box Web UI | Ensure user is part of the Backup Operator group and enable Backup Operator Privileges via Data Box Web UI | 🟢 8.5 | [ADO Wiki] |
| 5 📋 | ACLs and metadata not transferred during Data Box copy even when expected; Enable ACLs for Azure Files setting is disabl | The Enable ACLs for Azure Files option is disabled in Data Box Web UI, preventing metadata transfer | Enable ACLs for Azure Files in the Data Box local Web UI to transfer metadata including ACLs, file attributes, and times | 🟢 8.5 | [ADO Wiki] |
| 6 📋 | Unable to delete or rename files/folders on Data Box device; errors about invalid characters, Administrator permission,  | Folders with invalid characters or improperly copied folders in root directory; user lacks permissio | 1) Ensure device unlocked, login with domain admin. 2) Disable UAC and reboot. 3) Create empty temp: mkdir c:\temp\empty | 🟢 8.5 | [ADO Wiki] |
| 7 📋 | Unable to delete or rename files/folders on Data Box device; errors include Administrator permission required, invalid c | Folders with invalid characters or improperly copied files placed in root directory; user lacks requ | 1) Verify device unlocked, user logged in with domain admin. 2) Disable UAC and test. 3) Reboot pod and retry. 4) Roboco | 🟢 8.5 | [ADO Wiki] |

## 快速排查路径

1. Customer wants files to inherit destination domain permissions instead of retain → Three options: (1) Copy as-is then manually inherit permissions at destination using share-root inhe `[来源: ado-wiki]`
2. Metadata (ACLs, timestamps, attributes) not preserved when transferring data fro → Transfer data to Azure Files instead of Blob Storage to preserve metadata `[来源: ado-wiki]`
3. LastAccessTime, File_Attribute_Offline, and File_Attribute_Not_Content_Indexed m → This is by-design behavior; these metadata types are not supported for transfer via Data Box `[来源: ado-wiki]`
4. Cannot copy data with ACL preservation on Data Box; permission errors during cop → Ensure user is part of the Backup Operator group and enable Backup Operator Privileges via Data Box  `[来源: ado-wiki]`
5. ACLs and metadata not transferred during Data Box copy even when expected; Enabl → Enable ACLs for Azure Files in the Data Box local Web UI to transfer metadata including ACLs, file a `[来源: ado-wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/data-box-pod-metadata.md#排查流程)

# Disk Disk Backup, Restore & Snapshots — 排查速查

**来源数**: 13 | **21V**: 全部适用
**最后更新**: 2026-04-07
**关键词**: 403, 500, 60-day-limit, application-consistency, asr, backup, backup-vault, cmk, commvault, delete

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | Managed disk snapshot fails with error: The snapshot rate was exceeded for a disk. Occurs when 3rd party backup (Commvau | Managed disk snapshot rate limit is once per minute (applies to both premium and standard managed di | 1) Stagger backup schedules: ensure Commvault and ASR do not snapshot same disk within 1 minute. 2) Query DiskManagerApi | 🟢 9 | [MCVKB] |
| 2 📋 | Azure Disk Backup fails with errors like 'UserErrorNotEnoughPermissionOnDisk', 'UserErrorNotEnoughPermissionOnSnapshotRG | The Backup vault's managed identity lacks the required RBAC permissions on the source disk, snapshot | Grant the Backup vault managed identity: 1) Disk Backup Reader on the source disk. 2) Disk Snapshot Contributor on the s | 🔵 7.5 | [MS Learn] |
| 3 📋 | Azure Disk Backup restore fails with 'UserErrorDiskSnapshotNotFound' or 'UserErrorSnapshotMetadataNotFound'. The disk sn | The snapshot associated with the selected restore point was deleted or moved from the snapshot data  | Choose a different recovery point that has an intact snapshot. Follow recommended guidelines for snapshot RG management: | 🔵 7.5 | [MS Learn] |
| 4 📋 | Disk/snapshot SAS URI returns 403 after Feb 2025 change. SAS with >60 day expiration fails unexpectedly. | Since Feb 15 2025, Azure enforces max 60-day SAS expiration for disks/snapshots. Existing SAS with l | Revoke existing SAS via az disk revoke-access. Generate new SAS <=60 days (5184000 seconds). Update automation scripts. | 🔵 7.5 | [MS Learn] |
| 5 📋 | Cannot delete VM restore point: error 'DiskRestorePointUsedByCustomer - There is an active shared access signature outst | Active Shared Access Signatures (SAS) exist on the underlying disk restore points. Azure prevents de | Call EndGetAccess on all disk restore points within the restore point collection to revoke the SAS tokens, then retry th | 🔵 7.0 | [MS Learn] |
| 6 📋 | Restore point creation fails with 'OperationNotAllowed - disk(s) have not been allocated successfully'. Cannot create VM | One or more disks attached to the VM are not properly allocated (failed provisioning or incomplete a | Exclude the unallocated disks using the excludeDisks property in REST API, or use CLI/PowerShell/Portal to exclude them  | 🔵 7.0 | [MS Learn] |
| 7 📋 | Restore point creation fails with 'DiskRestorePointClientError - Keyvault associated with DiskEncryptionSet not found'.  | The Key Vault used for the DiskEncryptionSet has been deleted or is inaccessible. Restore point crea | Re-create the missing Key Vault resource with the same name and restore the encryption keys, then retry the restore poin | 🔵 7.0 | [MS Learn] |
| 8 📋 | Restore point creation fails: 'VMRestorePointClientError - Restore Point creation failed due to VSS Writers in bad state | VSS writers are in a bad/failed state, preventing the VM snapshot extension from flushing in-memory  | 1) Run 'vssadmin list writers' to identify failed writers. 2) Restart the failed VSS writer services (net stop/start). 3 | 🔵 7.0 | [MS Learn] |
| 9 📋 | Restore point creation fails: 'VMRestorePointClientError - maximum allowed snapshot limit of one or more disk blobs has  | Total restore points across restore point collections and resource groups for a VM exceeds the 500-s | Delete older/unnecessary restore points from existing restore point collections to bring the count below 500, then retry | 🔵 7.0 | [MS Learn] |
| 10 📋 | VM backup fails: 'UserErrorFsFreezeFailed - Failed to freeze one or more mount-points of the VM'. Linux VM backup failur | Backup extension cannot fsfreeze mount points. Causes: duplicate mount entries in fstab, corrupt fil | 1) Unmount problematic devices (umount). 2) Run fsck. 3) Remount and retry. 4) If unmount fails, edit /etc/azure/vmbacku | 🔵 7.0 | [MS Learn] |
| 11 📋 | Azure Disk Backup restore fails with 'UserErrorNotEnoughPermissionOnTargetRG'. Restored disk cannot be created in target | Backup vault managed identity lacks Disk Restore Operator role on target resource group. | 1) Click 'Grant Permissions' on restore validation page. 2) Wait ~15 min for role propagation. 3) Revalidate and restore | 🔵 7.0 | [MS Learn] |
| 12 📋 | Disk restore fails: 'UserErrorSameNameDiskAlreadyExists'. Cannot restore because disk with same name exists in target re | A managed disk with the specified restore name already exists. Azure does not allow overwriting exis | Provide a different name for the restored disk, or choose a different target resource group. | 🔵 7.0 | [MS Learn] |
| 13 📋 | After VM restore from backup, disks appear offline or Linux VM missing folders/mount points. Restored disks not mounted  | Windows: restore script machine does not meet OS requirements or restoring to same source. Linux: di | Windows: verify OS requirements, do not restore to same source. Linux: always mount via UUID from blkid in /etc/fstab in | 🔵 7.0 | [MS Learn] |

## 快速排查路径

1. Managed disk snapshot fails with error: The snapshot rate was exceeded for a dis → 1) Stagger backup schedules: ensure Commvault and ASR do not snapshot same disk within 1 minute `[来源: onenote]`
2. Azure Disk Backup fails with errors like 'UserErrorNotEnoughPermissionOnDisk', ' → Grant the Backup vault managed identity: 1) Disk Backup Reader on the source disk `[来源: mslearn]`
3. Azure Disk Backup restore fails with 'UserErrorDiskSnapshotNotFound' or 'UserErr → Choose a different recovery point that has an intact snapshot `[来源: mslearn]`
4. Disk/snapshot SAS URI returns 403 after Feb 2025 change. SAS with >60 day expira → Revoke existing SAS via az disk revoke-access `[来源: mslearn]`
5. Cannot delete VM restore point: error 'DiskRestorePointUsedByCustomer - There is → Call EndGetAccess on all disk restore points within the restore point collection to revoke the SAS t `[来源: mslearn]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/disk-backup-restore.md#排查流程)

# Disk Miscellaneous Disk Issues — 排查速查

**来源数**: 5 | **21V**: 全部适用
**最后更新**: 2026-04-07
**关键词**: access, acquirediskleasefailed, blob, config-hub, coreidentity, data-box, data-operator, data-size-mismatch, diskblobalreadyinusebyanotherdisk, download

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | Blob download fails when blob name has special Unicode multi-byte chars; old Java SDK encodes differently | Some Unicode chars consist of 2 chars but display as 1 glyph. Old Java SDK converts to single char,  | Upgrade to latest Java SDK. | 🟢 9 | [MCVKB] |
| 2 📋 | Data copied to Data Box and uploaded to Azure, file count matches but total size on NAS source differs significantly fro | NAS devices (EMC Epsilon/Isilon) report physical size (with data protection) vs logical size (actual | Check source NAS for physical vs logical size. Explain: logical size (Azure) is smaller because Data Box allocates by ph | 🟢 8.5 | [ADO Wiki] |
| 3 📋 | Need access to Config Hub for Azure Storage Devices root cause classification | User not a member of Confighub-Product-Author role | Go to CoreIdentity (https://coreidentity.microsoft.com) and request Confighub-Product-Author membership | 🟢 8.5 | [ADO Wiki] |
| 4 📋 | Disk upload/download fails with permission denied when Entra ID data access auth enforced. Cannot generate SAS or upload | dataAccessAuthMode=AzureActiveDirectory requires Data Operator for managed disks RBAC role with Comp | Assign Data Operator for managed disks role. For snapshots also need snapshots/download\|upload/action. VHDs cannot uplo | 🔵 7.5 | [MS Learn] |
| 5 📋 | Error 'AcquireDiskLeaseFailed': Failed to acquire lease while creating disk using blob with URI. Blob is already in use. | The VHD blob in storage has an active lease held by another disk/VM. Cannot create a new disk from a | Examine the blob metadata for disk reference information to identify which VM owns the disk. Detach or delete the confli | 🔵 7.0 | [MS Learn] |

## 快速排查路径

1. Blob download fails when blob name has special Unicode multi-byte chars; old Jav → Upgrade to latest Java SDK `[来源: onenote]`
2. Data copied to Data Box and uploaded to Azure, file count matches but total size → Check source NAS for physical vs logical size `[来源: ado-wiki]`
3. Need access to Config Hub for Azure Storage Devices root cause classification → Go to CoreIdentity (https://coreidentity `[来源: ado-wiki]`
4. Disk upload/download fails with permission denied when Entra ID data access auth → Assign Data Operator for managed disks role `[来源: mslearn]`
5. Error 'AcquireDiskLeaseFailed': Failed to acquire lease while creating disk usin → Examine the blob metadata for disk reference information to identify which VM owns the disk `[来源: mslearn]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/misc-disk-issues.md#排查流程)

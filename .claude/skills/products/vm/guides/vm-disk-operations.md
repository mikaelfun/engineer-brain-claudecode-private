# VM 托管磁盘操作 — 排查速查

**来源数**: 3 (AW, ML, ON) | **条目**: 30 | **21V**: 全部
**最后更新**: 2026-04-24

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | ASR Mooncake: run computers on managed disks after failover/migration from on-premises option not sh | Mooncake bug (ICM 69531690) previously caused managed disk option to be absent i | Option in Replication Items -> Settings -> Compute and Network. Applicable ONLY  | 🟢 9 | ON |
| 2 | ASR Mooncake portal missing 'use managed disks' option for failover/migration from on-premises; noti | Mooncake initially did not support managed disk option in ASR portal for on-prem | Fixed by PG. The managed disk option is now available in Mooncake ASR portal. On | 🟢 9 | ON |
| 3 | Linux VM filesystem corruption (Buffer I/O errors on dm device) after attaching 6th standard data di | Azure restricts VM disk cache to max 4 standard disks (by slot order). When more | 1) Use premium data disks to avoid the 4-disk cache restriction. 2) If using sta | 🟢 8 | ON |
| 4 | Customer deleted managed disk and needs recovery; disk was hard deleted (not in soft-delete state) | Managed disk was hard deleted — either soft-delete conditions not met (disk crea | Open Sev.2 or Sev.3 ICM to XStore/Table Server team. ICM template: O01O2z. If no | 🟢 8 | ON |
| 5 | Customer questions unexpected Ultra Disk billing charges or notices billing amount changed after Oct | Ultra Disk billing model changed from tiered billing to per-GiB billing effectiv | No customer action required; billing switched automatically on October 15, 2025. | 🔵 7.5 | AW |
| 6 | When performing Swap OS disk on Azure VM, newly created Managed Disk is not visible in selection lis | Mismatch in Availability Zone configuration between original OS disk and new Man | Match the Availability Zone setting of original OS disk exactly when creating re | 🔵 7 | ON |
| 7 | Error 'Cross subscription incremental snapshots are not supported. Copy source is in subscription {A | Incremental snapshots of Ultra Disk and Premium SSD v2 across different subscrip | Create the incremental snapshot in the same subscription as the source disk. Cro | 🔵 6.5 | AW |
| 8 | Error 'Only incremental snapshots are supported for disks of Sku {sku}' when attempting to create a  | Full (non-incremental) snapshots are not supported for Ultra Disk and Premium SS | Use incremental snapshots instead of full snapshots when snapshotting Ultra Disk | 🔵 6.5 | AW |
| 9 | Error 'Changing the logical sector size of a disk is not permitted' when creating a disk from Ultra/ | Logical sector size cannot be changed when creating a disk from a snapshot; the  | Create the new disk with the same logical sector size as the source snapshot. Cr | 🔵 6.5 | AW |
| 10 | Resource SKUs API returns empty/null MaxResourceVolumeMB for v6 VM sizes (Dasv6/Easv6/Fasv6). Custom | New v6 sizes use NVMe protocol for local storage instead of SCSI. The API field  | Update scripts/automation to use NVMEDiskSizeinMiB field instead of MaxResourceV | 🔵 6.5 | AW |
| 11 | Error 'Source incremental snapshot {id} copy is still in progress. Please retry after source snapsho | The source incremental snapshot has not finished replicating/copying; the copy o | Wait for the source snapshot copy to complete before creating a disk from it. Mo | 🔵 6.5 | AW |
| 12 | 需要确认 VM 使用的 DiskControllerType（SCSI 或 NVMe），但 Azure Portal 尚未显示该属性 | Azure Portal 暂不显示 DiskControllerType，需通过后端查询获取 | 方法一（Kusto）：查询 moseisley.kusto.windows.net AzureCM.LogContainerSnapshot，extend ex | 🔵 6.5 | AW |
| 13 | Cannot attach Ultra/Premium V2 disk to VM while disk is still being provisioned/created from a snaps | Disk provisioning operation has not yet completed; disk is still being created a | Wait for disk provisioning to finish before attaching to VM. This was a known li | 🔵 6.5 | AW |
| 14 | Cannot attach data disk to VM. Error: AttachDiskWhileBeingDetached — disk is currently being detache | Previous data disk detach operation failed, leaving the disk in a transitional ' | PowerShell: Get-AzVM, set $vm.StorageProfile.DataDisks[n].ToBeDetached = $true,  | 🔵 6.5 | ML |
| 15 | Lsv3/Lasv3 VM local NVMe disk shows error 'The format did not complete successfully' when customer t | Hardware cluster deployed with incorrect cluster settings (unlikely but known sc | Redeploy the VM to another Availability Zone. If persists, engage HostAgent team | 🔵 6.5 | AW |
| 16 | Error 'Minimum api-version of {version} required to create incremental restore points on ultra or pr | API version used is below the minimum required (2022-03-22) for incremental rest | Upgrade to Azure compute REST API version 2022-03-22 or later when creating incr | 🔵 6.5 | AW |
| 17 | Error 'Minimum api-version {version} is required to restore an Ultra or PremiumV2 disk from restore  | API version used is below the minimum required (2022-03-22) for restore operatio | Upgrade to Azure compute REST API version 2022-03-22 or later when restoring Ult | 🔵 6.5 | AW |
| 18 | Changing dataAccessAuthorizationMode on managed disk fails with error: Property dataAccessAuthorizat | An active SAS token exists on the disk (generated via Get-AzDiskAccess, az disk  | Wait for the SAS token to expire, or explicitly revoke SAS access using EndGetAc | 🔵 6.5 | AW |
| 19 | Error 'Minimum api-version of {version} required to create snapshots on ultra or premiumV2 disks' wh | The API version specified in the request is below the minimum required (2022-03- | Upgrade to Azure compute REST API version 2022-03-22 or later when creating snap | 🔵 6.5 | AW |
| 20 | Error 'Architecture.Arm64 image requests to be deployed through only managed disk. Please set proper | Arm64 VMs only support managed disk scenarios; unmanaged disk is not supported o | Customer must use managed disk with Arm64 VMs; set VM disk type to Managed and r | 🔵 6.5 | AW |
| 21 | Error indicating too many snapshots are already pending for export when trying to create snapshots o | Platform limit reached: too many snapshot copy/export operations are concurrentl | Click the link in the error message to view snapshots pending export; wait for e | 🔵 6.5 | AW |
| 22 | Cannot change dataAccessAuthorizationMode on disk while there is an active SAS. Error: PropertyChang | An active SAS token exists on the disk (granted via Get-AzDiskAccess, az disk gr | Call EndGetAccess on the disk or wait for the SAS to expire before retrying the  | 🔵 6.5 | AW |
| 23 | After ASR test failover, target VM fails to boot with grub2 files missing: /grub2/i386-pc/normal.mod | OS disk was swapped while VM replication was enabled without reconfiguring repli | Cleanup test failover, disable replication, re-enable replication (reconfigure), | 🔵 6.5 | AW |
| 24 | Error 'The move resources request contains Ultra or PremiumV2 disk created from snapshot and still g | The disk was created from a snapshot but the data hydration (copy from snapshot) | Wait for disk hydration to complete (monitor provisioning state until disk is fu | 🔵 6.5 | AW |
| 25 | Error 'Import of disk {id} is in progress. Creation of snapshot is not allowed until completion' whe | The target disk's import or creation operation has not yet completed (completion | Wait until the disk completion percentage reaches 100% before creating a snapsho | 🔵 6.5 | AW |
| 26 | Error: 'Architecture.Arm64 image requests to be deployed through only managed disk' when deploying o | Customer attempted to use an unmanaged disk with an Arm64 image; Arm64 VMs only  | Use managed disk (not unmanaged disk) when deploying Arm64 VMs. Ensure vmDiskTyp | 🔵 6.5 | AW |
| 27 | 客户在 NVMe-enabled VM 上配置 Ephemeral OS Disk 失败，或在 Portal 中无法对 NVMe VM 执行 Ultra DD resize | Ephemeral OS disk 和 Ultra DD resize（Portal 中）是 NVMe-enabled VM 的已知不支持功能 | Ephemeral OS disk 不支持 NVMe-enabled VM：当 OS disk 配置为 ephemeral 时，data disk 仍会使用 N | 🔵 6.5 | AW |
| 28 | Disk export/import fails with error: dataAccessAuthorizationMode is not supported for this subscript | AFEC (internal feature flag) is not enabled for the subscription or region | Enable AFEC flag for the subscription/region. See https://aka.ms/afec | 🔵 6.0 | AW |
| 29 | Data disk mounted under /mnt fails to mount after unexpected reboot on cloud-init provisioned Linux  | For Linux VMs provisioned with cloud-init, the temporary disk is mounted at /mnt | 1) Avoid mounting data disks under /mnt/ (reserved for temp disk); 2) If /mnt/ m | 🔵 6 | ON |
| 30 | Cannot attach data disk to VM — error AttachDiskWhileBeingDetached: disk is currently being detached | Previous data disk detach operation failed, leaving the disk in a transitional s | Set the toBeDetached flag to true on the failing disk via PowerShell (Update-AzV | 🔵 5.5 | ML |

## 快速排查路径

1. **ASR Mooncake: run computers on managed disks after failover/migration from on-pr**
   - 根因: Mooncake bug (ICM 69531690) previously caused managed disk option to be absent in ASR portal; fixed by PG.
   - 方案: Option in Replication Items -> Settings -> Compute and Network. Applicable ONLY when: on-prem physical/Hyper-V/VMware to Azure scenario AND protected 
   - `[🟢 9 | ON]`

2. **ASR Mooncake portal missing 'use managed disks' option for failover/migration fr**
   - 根因: Mooncake initially did not support managed disk option in ASR portal for on-premises to Azure scenarios. PG confirmed vi
   - 方案: Fixed by PG. The managed disk option is now available in Mooncake ASR portal. Only works when: (1) scenario is on-prem (physical/Hyper-V/VMware) to Az
   - `[🟢 9 | ON]`

3. **Linux VM filesystem corruption (Buffer I/O errors on dm device) after attaching **
   - 根因: Azure restricts VM disk cache to max 4 standard disks (by slot order). When more than 4 standard disks have cache enable
   - 方案: 1) Use premium data disks to avoid the 4-disk cache restriction. 2) If using standard disks, enable cache on at most 4 data disks. 3) For stripe sets 
   - `[🟢 8 | ON]`

4. **Customer deleted managed disk and needs recovery; disk was hard deleted (not in **
   - 根因: Managed disk was hard deleted — either soft-delete conditions not met (disk created <10 days, deleted >4 days ago, or Ul
   - 方案: Open Sev.2 or Sev.3 ICM to XStore/Table Server team. ICM template: O01O2z. If no direct access to route ICM, ask TA to route or email cssstgrec@micros
   - `[🟢 8 | ON]`

5. **Customer questions unexpected Ultra Disk billing charges or notices billing amou**
   - 根因: Ultra Disk billing model changed from tiered billing to per-GiB billing effective October 15, 2025. Old model: provision
   - 方案: No customer action required; billing switched automatically on October 15, 2025. Customers have the option to continue using tiered pricing or use the
   - `[🔵 7.5 | AW]`


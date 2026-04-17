# Disk Disk Management (Attach/Detach/Resize) — 排查速查

**来源数**: 13 | **21V**: 全部适用
**最后更新**: 2026-04-07
**关键词**: 4tib, attach, attachdiskwhilebeingdetached, blob, blobcache, boot-failure, caching, cloud-init, convert, data-disk

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | Data loss on Azure VM temporary disk after VM upgrade, migration, or maintenance | Temporary disk is local/ephemeral storage wiped during VM maintenance operations. Data on temp disk  | Linux: set ResourceDisk.Format=n in /etc/waagent.conf, restart VM. Windows: 1) Remove paging file from temp disk (Advanc | 🟢 9 | [MCVKB] |
| 2 📋 | Cannot attach data disk to VM: error 'AttachDiskWhileBeingDetached' — the disk is currently being detached or the last d | Previous detach operation on the data disk failed, leaving the disk stuck in a 'being detached' stat | Use PowerShell: set $vm.StorageProfile.DataDisks[N].ToBeDetached = $true then Update-AzVM. Or use REST API PATCH with to | 🔵 7.5 | [MS Learn] |
| 3 📋 | Linux VM doesn't fully boot after OS disk resize in Azure. Serial console shows '[Errno 28] No space left on device' fro | The OS disk was full before resize. Cloud-init tries to auto-resize the root filesystem on reboot bu | Clear unneeded data from the OS disk to free a small amount of space, then expand the filesystem. Use az vm repair or re | 🔵 7.5 | [MS Learn] |
| 4 📋 | Error 'Disk resizing is allowed only when creating a VM or when the VM is deallocated' when trying to expand a managed d | Disk resize requires VM to be deallocated unless the disk meets 'Expand without downtime' requiremen | 1) Check if disk supports online expansion (Expand without downtime). 2) If not, Stop/Deallocate VM first. 3) Resize dis | 🔵 7.5 | [MS Learn] |
| 5 📋 | Attempt to shrink or downsize a managed disk fails. No option available in portal, CLI, or PowerShell to reduce disk siz | Azure Managed Disks do not support shrinking or downsizing. This is by design. Only increasing disk  | Shrinking managed disks is not supported. Workaround: 1) Create a new smaller disk of desired size, 2) Attach both old a | 🔵 7.5 | [MS Learn] |
| 6 📋 | Host caching (ReadOnly/ReadWrite) cannot be enabled for managed disks provisioned at 4096 GiB or larger. Disk caching op | Azure host caching (BlobCache) only supported for disk sizes up to 4095 GiB. Disks provisioned >= 40 | 1) If host caching required, keep disk provisioned size <= 4095 GiB. 2) For disks >= 4096 GiB, set caching to None. 3) F | 🔵 7.5 | [MS Learn] |
| 7 📋 | Cannot delete storage account/container/VHD blob: lease on blob/container, no lease ID specified. Deletion blocked. | VHD page blob Lease State is Leased because attached to VM. Azure prevents deletion to avoid corrupt | Identify attached VM via blob metadata MicrosoftAzureCompute_VMName. OS disk: delete VM. Data disk: detach. Wait for lea | 🔵 7.5 | [MS Learn] |
| 8 📋 | Disk type conversion rejected: can only change disk type twice per day. | Azure enforces max 2 disk type changes per day per disk. | Wait until next day for additional changes. Plan conversions to minimize changes. | 🔵 7.5 | [MS Learn] |
| 9 📋 | Cannot directly convert to Premium SSD v2 from Gallery image disk or Ultra Disk. Multiple conversion restrictions. | PSSv2 conversion limits: no OS disk, 512 sector only, max 50 concurrent/sub/region, must detach shar | Use incremental snapshot migration for Ultra/PSSv2 conversion. Create snapshot then new disk with target type. Ensure 51 | 🔵 7.5 | [MS Learn] |
| 10 📋 | Data disk shows as Offline or Missing in Windows Disk Management inside Azure VM. No drive letter assigned. May show err | Multiple causes: disk not initialized (no valid signature), dynamic disk from another system shows F | 1) Right-click offline disk -> Online. 2) If Not Initialized -> Initialize Disk (MBR/GPT). 3) If Foreign -> Import Forei | 🔵 7.0 | [MS Learn] |
| 11 📋 | Cannot take data disk offline in standalone Windows Server 2022 VM. VM hangs when using Disk Management or DiskPart to o | Disk configuration issues, virtual storage subsystem/controller problems, or disk corruption causing | 1) Install pending WS2022 updates. 2) Run chkdsk /scan and review event logs. 3) If not OS disk, detach and attach to di | 🔵 7.0 | [MS Learn] |
| 12 📋 | Data loss with ReadWrite host caching on data disks when VM crashes. Cached writes not persisted. | ReadWrite cache stores writes in host memory/SSD before Azure Storage. VM crash before flush loses c | Use ReadWrite only when app handles flushing (SQL Server). None for write-heavy. ReadOnly for read-heavy. Cache change d | 🔵 7.0 | [MS Learn] |
| 13 📋 | OS disk swap: repaired disk not in Swap OS disk list for 10-15 min after detaching from repair VM. | Lease release and metadata propagation takes 10-15 minutes after detach. | Wait 10-15 min after detaching. Portal: VM > Disks > Swap OS disk. PowerShell: Set-AzVMOSDisk then Update-AzVM. | 🔵 7.0 | [MS Learn] |

## 快速排查路径

1. Data loss on Azure VM temporary disk after VM upgrade, migration, or maintenance → Linux: set ResourceDisk `[来源: onenote]`
2. Cannot attach data disk to VM: error 'AttachDiskWhileBeingDetached' — the disk i → Use PowerShell: set $vm `[来源: mslearn]`
3. Linux VM doesn't fully boot after OS disk resize in Azure. Serial console shows  → Clear unneeded data from the OS disk to free a small amount of space, then expand the filesystem `[来源: mslearn]`
4. Error 'Disk resizing is allowed only when creating a VM or when the VM is deallo → 1) Check if disk supports online expansion (Expand without downtime) `[来源: mslearn]`
5. Attempt to shrink or downsize a managed disk fails. No option available in porta → Shrinking managed disks is not supported `[来源: mslearn]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/disk-management.md#排查流程)

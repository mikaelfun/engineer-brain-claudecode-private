# Disk VM Boot Failures — 综合排查指南

**条目数**: 16 | **草稿融合数**: 2 | **Kusto 查询融合**: 0
**来源草稿**: ado-wiki-a-support-operations-reboot-cache.md, mslearn-kernel-boot-issues-linux.md
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Support Operations — Reboot Cache (HPC Cache)
> 来源: ADO Wiki (ado-wiki-a-support-operations-reboot-cache.md)

1. sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Avere - HPC Cache/Support Operations - Reboot Cache"
2. sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAvere%20-%20HPC%20Cache%2FSupport%20Operations%20-%20Reboot%20Cache"
3. importDate: "2026-04-05"
4. type: troubleshooting-guide
5. Access Geneva Actions: https://aka.ms/GenevaActions
6. The **Reboot Cache** operation allows authorized users to reboot specific nodes or the entire HPC Cache using a Geneva Action. The reboot process is similar to FXT/vFXT cluster reboot and takes several minutes to complete.
7. Reboot Cache is a **read/write action** — a valid Access Token for the specified Endpoint is required.
8. **Environment Parameter**
9. - `Environment`: Cloud environment used to create the cache
10. **HPC Cache Parameters**

### Phase 2: Linux Kernel Boot Issues Troubleshooting
> 来源: MS Learn (mslearn-kernel-boot-issues-linux.md)

1. Serial console shows:
2. [300.206297] Kernel panic - xxxxxxxx
3. **Cause**: Missing initramfs after kernel update.
4. **Fix - ALAR automated**:
5. az vm repair repair-button --button-command initrd -g $RG --name $VM
6. **Fix - Manual (chroot)**:
7. depmod -a <kernel-version>
8. dracut -f /boot/initramfs-<kernel-version>.img <kernel-version>
9. dracut -f /boot/initrd-<kernel-version> <kernel-version>
10. mkinitramfs -k -o /boot/initrd.img-<kernel-version>

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Storage account high E2E latency (MAX up to 24s) on GetBlob operations - random transient spikes causing application tim | Partition merge operation on storage stamp caused transient TableServer latency spike (TotalPartitio | 1) Check Jarvis Shoebox API Dashboard for E2E vs server latency. 2) Xportal auto-analysis: look for TotalPartitionWaitTi | 🟢 8.5 | [MCVKB] |
| 2 | Linux VM shuts down unexpectedly and fails to boot when OS disk is full. Serial console shows 'Starting Security Auditin | auditd is configured with disk_full_action=HALT / admin_space_left_action=HALT in /etc/audit/auditd. | 1) Access OS disk via az vm repair or recovery VM. 2) Change auditd.conf settings from HALT to SUSPEND/IGNORE. 3) Swap d | 🔵 7.5 | [MS Learn] |
| 3 | Cannot resize MBR partition beyond 2 TB using fdisk on Linux VM data disk. fdisk shows 'DOS partition table format can n | MBR partition table uses 32-bit sector addressing, limiting partition size to 2^32 × 512 bytes = 2 T | Convert partition from MBR to GPT using gdisk: 1) Take snapshot. 2) Stop app and unmount. 3) Use gdisk to delete old par | 🔵 7.5 | [MS Learn] |
| 4 | Cannot resize (expand) a shared disk while it is attached to multiple VMs. Error or operation blocked when trying to exp | Azure shared disks (maxShares > 1) cannot be expanded without either deallocating ALL VMs the disk i | To resize a shared disk: 1) Stop/deallocate ALL VMs attached to the shared disk, OR detach the disk from all VMs. 2) Res | 🔵 7.5 | [MS Learn] |
| 5 | Windows VM fails to boot with error 0xc00000ba: 'The operating system couldn't be loaded because a critical system drive | Windows system files are corrupt. Common causes: unfinished Windows update/installation, incomplete  | 1) Attach OS disk to recovery VM as data disk. 2) Run DISM with WinRE as source: Dism /image:G:\ /cleanup-image /restore | 🔵 7.5 | [MS Learn] |
| 6 | Windows VM boot error INACCESSIBLE_BOOT_DEVICE or Boot failure Reboot and Select proper Boot device. | BCD corrupted or partition containing Windows not marked active (Gen1 only). | Stop/deallocate restart. If persists: attach to repair VM, verify Active via diskpart, chkdsk /f, repair BCD with bcdedi | 🔵 7.5 | [MS Learn] |
| 7 | Windows VM boot error: A disk read error occurred. Press Ctrl+Alt+Del to restart. | Disk structure corrupted and unreadable. Gen1: boot partition may not be Active. | Create repair VM, attach OS disk. Set Active with diskpart (Gen1). chkdsk /f. Enable serial console. Rebuild VM. | 🔵 7.5 | [MS Learn] |
| 8 | Windows VM boot error: This is not a bootable disk. Please insert a bootable floppy. | OS boot process cannot locate active system partition or missing BCD reference to Windows partition. | Repair VM: set Active via diskpart, chkdsk /f, bcdboot to create boot record, rebuild VM. | 🔵 7.5 | [MS Learn] |
| 9 | Windows Boot Manager error 0xC0000225 Status not found: boot selection failed, required device inaccessible. | BCD corrupted, or VHD migrated from on-premises not prepared correctly. | Attach to troubleshooting VM. Identify Boot/Windows partitions. Repair BCD via bcdedit (set bootmgr/loader device). Gen2 | 🔵 7.5 | [MS Learn] |
| 10 | When reviewing permissions of a mount point via explorer and diskmgmt.msc you may see differences in NTFS permissions un | Mount   point folder is essentially just a shortcut that guides you to the root of a   new partition | There is no difference in the permission set to the LUN �LPC interface� when we check from disk management as well as fr | 🔵 7.5 | [KB] |
| 11 | Azure VM Windows Server 2016 fails to boot with 0x1E KMODE_EXCEPTION_NOT_HANDLED bugcheck. Faulting instruction is rdmsr | Spectre/Meltdown mitigation issue in pre-July 2018 kernels. FeatureSettingsOverride registry value s | Attach OS disk to recovery VM, change FeatureSettingOverride from 8 to 3 in registry, disk swap back, then Windows Updat | 🔵 7.5 | [KB] |
| 12 | Cannot extend/resize Multi-Resilient Storage Spaces Direct (S2D) volume from GUI | Multi-Resilient volumes use two tiers (capacity + performance). Both tiers must be expanded separate | Use PowerShell: Get-StorageTier to check tiers, Resize-StorageTier for each tier, Get-PartitionSupportedSize for max siz | 🔵 7.5 | [KB] |
| 13 | Unable to extend S2D virtual disk after adding new physical disks to storage pool. Error: 'Not enough available capacity | Newly added physical disks show MediaType as 'Unspecified' instead of 'HDD'. OS cannot identify new  | Manually set MediaType to HDD: Get-StoragePool 'PoolName' \| Get-PhysicalDisk \| Where MediaType -eq 'Unspecified' \| Se | 🔵 7.5 | [KB] |
| 14 | AD LDS service fails to start after raising instance functional level to WIN2016 by manually changing msDS-Behavior-Vers | Manually setting msDS-Behavior-Version attribute value to 7 on LDS instances is not supported. | If single server: restore from backup. If multiple replicas and one still running: 1) Seize Schema/Domain Naming FSMO ro | 🔵 7.5 | [KB] |
| 15 | Windows Server 2012 R2 hangs during boot due to SxS error loading services.exe. Wininit.exe encounters STATUS_SXS_CANT_G | Side-by-side (SxS) component store corruption prevents wininit.exe from generating activation contex | Use SFC and/or DISM to inspect and repair services.exe. | 🔵 7.5 | [KB] |
| 16 | Customer has 2 servers with Windows Storage 2012 R2 configured as file server with Windows Failover Cluster role install |  | Provided the below answers to the customer queries. What is this data classification �C:\Windows\ServiceProfiles\Network | 🔵 7.5 | [KB] |

# Disk Data Box Disk: Unlock & Hardware — 综合排查指南

**条目数**: 19 | **草稿融合数**: 2 | **Kusto 查询融合**: 0
**来源草稿**: ado-wiki-a-generic-access-denied-validation-tool.md, ado-wiki-a-usbtreeview-troubleshoot-undetected-disk-unlocking.md
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Access Denied error during checksum/Prepare to Ship phase
> 来源: ADO Wiki (ado-wiki-a-generic-access-denied-validation-tool.md)

1. sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Data Box Disk/Disk Validation/Generic \"Access Denied\" Error When Using Data Box Disk Validation Tool"
2. sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=/Azure%20Data%20Box%20Disk/Disk%20Validation/Generic%20%22Access%20Denied%22%20Error%20When%20Using%20Data%20Box%20Disk%20Validation%20
3. importDate: "2026-04-05"
4. type: troubleshooting-guide
5. When running the Validation Tool on an Azure Data Box Disk, you might receive an 'Access Denied' error during the checksum or Prepare to Ship phase.
6. Several issues could cause this error. Follow the steps in the Resolution section to investigate and resolve the problem.
7. Confirm that the permissions of the Azure Data Box Disk are correct.
8. 1. Run the script again from PowerShell as an Administrator.
9. 2. Check if `Everyone` is listed under 'Group or user names:' Navigate to the share/folder or file properties in the security tab.
10. If not, add it with full permissions. After making this change, re-run the Validation Tool.

### Phase 2: Disks undetected or cannot be unlocked on Azure Data Box Disk
> 来源: ADO Wiki (ado-wiki-a-usbtreeview-troubleshoot-undetected-disk-unlocking.md)

1. sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Data Box Disk/Hardware & Unlock/Using USBTreeView tool to troubleshoot undetected disks or disks that cannot be unlocked"
2. sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Data%20Box%20Disk%2FHardware%20%26%20Unlock%2FUsing%20USBTreeView%20tool%20to%20troubleshoot%20undetected%20disks%20or%20dis
3. importDate: "2026-04-05"
4. type: troubleshooting-guide
5. When a customer receives an Azure Data Box Disk and the disk is either undetected by their host machine or detected but cannot be unlocked, despite following the documentation, they may need to troubleshoot the issue using the USBTreeView tool.
6. This issue could be due to a problem with the disk itself or the customer not following the instructions correctly.
7. For disks that are undetected by the host machine, the disk is likely to be corrupt. Test for this by trying the following before creating an IcM and requesting new disks:
8. 1. Connect the disk(s) to a different USB port on the host machine.
9. 2. Connect the disk(s) to a different host machine.
10. 3. Connect the disk(s) using a different USB cable.

## ⚠️ 矛盾处理

📌 **disk-015 vs disk-122** — 适用条件不同：
   - 指南中两个都保留，标注条件：轻度损坏先尝试 ntfsfix，严重损坏/物理故障则安排换盘
📌 **disk-019 vs disk-128** — 适用条件不同：
   - 指南中先列 ADO Wiki 具体修复方案，OneNote 的换 OS 作为 fallback

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Data Box Disk cannot be opened after unlock - filesystem errors or RAW partition | Filesystem corruption or physical disk damage on the Data Box Disk | Disk is unusable. Collect diagnostic data, submit to PG, arrange re-shipment of replacement disk. | 🟢 10 | [MCVKB] |
| 2 | Data Box Disk unlock tool fails on Red Hat Enterprise Linux 7.x | Known compatibility issue with RHEL 7.x and Data Box Disk unlock toolset | Refer to internal KB (a2861f24). Verify OS requirements, PowerShell version, prerequisites. Try alternative supported OS | 🟢 10 | [MCVKB] |
| 3 | Data Box Disk: after PC restart, disk requires re-unlock via DataBoxDiskUnlock tool; cannot enter passkey in Windows Bit | Data Box Disk uses BitLocker encryption but passkey cannot be entered through standard Windows BitLo | Run DataBoxDiskUnlock.exe again with passkey from Azure portal after restart. Do not use Windows BitLocker prompt. | 🟢 10 | [MCVKB] |
| 4 | Data Box Disk requires re-unlock after host PC reboot or USB reconnection | By design, Data Box Disk lock re-engages after the disk is disconnected or the host reboots. The unl | After reboot or USB reconnection, re-run the Data Box Disk unlock tool with the passkey before resuming data copy operat | 🟢 10 | [MCVKB] |
| 5 | Data Box Disk USB drive disappears or gets locked during Robocopy large file copy (both local and MS disk ejected simult | Host PC USB interface instability under sustained I/O load (especially with Robocopy /MT:64 or /MT:8 | Reduce Robocopy thread count (e.g. /MT:4), use File Explorer for copying, or use a different USB 3.0 port/hub. After eje | 🟢 10 | [MCVKB] |
| 6 | Azure Data Box Disk not mounted or accessible on Linux after rsync process is killed or system is restarted; NTFS partit | NTFS inconsistencies or NTFS journal file corruption caused by unclean unmount after process kill or | Run 'ntfsfix /dev/sdX' on the NTFS volume to fix common NTFS problems and reset the journal file, then remount the disk  | 🟢 9.5 | [ADO Wiki] |
| 7 | Unable to mount Azure Data Box Disk on Oracle Linux 7.9; disk not recognized or mount fails on unsupported Linux distrib | Oracle Linux 7.9 is not in the supported OS list for Azure Data Box Disk. Only specific Linux distri | Switch to a supported OS such as CentOS. Refer to the Data Box Disk system requirements page for the full list of suppor | 🟢 9.5 | [ADO Wiki] |
| 8 | Azure Data Box Disk in security locked state; DC cannot upload data; CreateDCInfra fails with DiskSecurityLockedExceptio | Abnormal number of system power drops in quick succession causes the disk to enter Security Locked s | The disk cannot be recovered from security locked state. A secure erase must be performed. Customer must create a new Da | 🟢 9.5 | [ADO Wiki] |
| 9 | Unlocking Data Box Disk on Red Hat Linux (RHEL) 7.x fails with passkey error; logs show dislocker-file was not created | DataBoxDiskUnlock_Prep.sh script contains broken URL (HTTP 404) for epel-release RPM package, causin | Manually download epel-release RPM from valid URL: wget https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noar | 🟢 9.5 | [ADO Wiki] |
| 10 | Data Box Disk not detected by host machine after connecting via USB | Disk may be physically corrupt, or USB port/cable incompatibility | 1) Try different USB port on host; 2) Connect to a different host machine; 3) Use a different USB cable; If still undete | 🟢 9.5 | [ADO Wiki] |
| 11 | After unlocking Azure Data Box Disk, copying data fails with 'ERROR: The media is write protected'; disk contents are vi | Disk read-only attribute may be set; could also be caused by host write policy, insufficient folder  | (1) Try drag-and-drop instead of Robocopy to rule out app-specific issues; (2) Test on multiple host devices to rule out | 🟢 9.5 | [ADO Wiki] |
| 12 | Data Box Disk validation error: InvalidShareContainerFormat when container/share/fileshare names contain uppercase lette | Azure storage naming conventions require all lowercase for container, page blob container, and file  | Rename all subfolders under BlockBlob/PageBlob/AzureFile to use only lowercase letters, digits, and hyphens. Re-run vali | 🟢 9 | [MCVKB] |
| 13 | Data Box Disk: data copied into user-created folder (not one of the precreated folders on the disk) fails to upload to A | Data Box Disk creates precreated folder structures (BlockBlob, PageBlob, AzureFile with subfolders)  | Instruct customer to only copy data into precreated folders on the unlocked disk. Do not create new top-level or sub-fol | 🟢 9 | [MCVKB] |
| 14 | Blob upload fails at Azure datacenter with error code 'IOFailed'; this error code does not appear in public Azure docume | Hardware failure on the Data Box Disk causes a disk read error during the datacenter upload process. | 1) Run the DataBoxDiskValidation tool before shipping to verify data integrity. 2) If validation shows errors, order ano | 🟢 8.5 | [ADO Wiki] |
| 15 | Data Box Disk shows 'Drive Formatted' error at the datacenter; ASC copy status shows 'Bitlocker Failed'; disk is invalid | Customer or vendor technician formatted the Data Box Disk after receiving it, erasing the pre-config | There is no recovery for a formatted Data Box Disk (customer error). If multiple disks were ordered and others remain un | 🟢 8.5 | [ADO Wiki] |
| 16 | During data copy to Azure Data Box Disk, error 'Power Surge On Hub Port: A USB device has exceeded the power limits of i | USB device draws more power than the hub port allows; some systems (e.g., Data Loggers based on Wind | (1) Confirm client OS is supported and meets system requirements; (2) Verify USB cable is properly connected; (3) Connec | 🟢 8.5 | [ADO Wiki] |
| 17 | Data Box Disk drive gets mounted as read-only on Linux client during data copy | Unclean NTFS filesystem on the Data Box Disk causes Linux to mount it as read-only. Remounting as re | Install ntfsprogs, unmount, run ntfsfix on the dislocker-file path, remove hibernation metadata with ntfs-3g -o remove_h | 🟢 8.5 | [MS Learn] |
| 18 | Data copied to Data Box Disk does not persist after unmount and remount | Drive was initially mounted as read-only due to unclean filesystem, then remounted as read-write, bu | Follow the read-only drive resolution: ntfsfix + clean unmount/mount cycle. If issue persists, collect logs from Data Bo | 🟢 8.5 | [MS Learn] |
| 19 | Data Box Disk detected by host but cannot be unlocked; disk may show as RAW or Unallocated in Disk Management | USB port not USB 3.0, cable/host compatibility issue, or disk filesystem corruption showing as RAW/U | 1) Ensure USB 3.0 port; 2) Try different host/cable; 3) Check Disk Management for RAW/Unallocated status; 4) Check Devic | 🟢 8.0 | [ADO Wiki] |

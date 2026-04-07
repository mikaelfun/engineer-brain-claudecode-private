# Disk Data Box Disk: Unlock & Hardware — 排查速查

**来源数**: 19 | **21V**: 全部适用
**最后更新**: 2026-04-07
**关键词**: azcopy, bitlocker, blob-upload, compatibility, corrupt, customer-error, data-box-disk, data-copy, data-copy-azure, data-loss

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | Data Box Disk cannot be opened after unlock - filesystem errors or RAW partition | Filesystem corruption or physical disk damage on the Data Box Disk | Disk is unusable. Collect diagnostic data, submit to PG, arrange re-shipment of replacement disk. | 🟢 10 | [MCVKB] |
| 2 📋 | Data Box Disk unlock tool fails on Red Hat Enterprise Linux 7.x | Known compatibility issue with RHEL 7.x and Data Box Disk unlock toolset | Refer to internal KB (a2861f24). Verify OS requirements, PowerShell version, prerequisites. Try alternative supported OS | 🟢 10 | [MCVKB] |
| 3 📋 | Data Box Disk: after PC restart, disk requires re-unlock via DataBoxDiskUnlock tool; cannot enter passkey in Windows Bit | Data Box Disk uses BitLocker encryption but passkey cannot be entered through standard Windows BitLo | Run DataBoxDiskUnlock.exe again with passkey from Azure portal after restart. Do not use Windows BitLocker prompt. | 🟢 10 | [MCVKB] |
| 4 📋 | Data Box Disk requires re-unlock after host PC reboot or USB reconnection | By design, Data Box Disk lock re-engages after the disk is disconnected or the host reboots. The unl | After reboot or USB reconnection, re-run the Data Box Disk unlock tool with the passkey before resuming data copy operat | 🟢 10 | [MCVKB] |
| 5 📋 | Data Box Disk USB drive disappears or gets locked during Robocopy large file copy (both local and MS disk ejected simult | Host PC USB interface instability under sustained I/O load (especially with Robocopy /MT:64 or /MT:8 | Reduce Robocopy thread count (e.g. /MT:4), use File Explorer for copying, or use a different USB 3.0 port/hub. After eje | 🟢 10 | [MCVKB] |
| 6 📋 | Azure Data Box Disk not mounted or accessible on Linux after rsync process is killed or system is restarted; NTFS partit | NTFS inconsistencies or NTFS journal file corruption caused by unclean unmount after process kill or | Run 'ntfsfix /dev/sdX' on the NTFS volume to fix common NTFS problems and reset the journal file, then remount the disk  | 🟢 9.5 | [ADO Wiki] |
| 7 📋 | Unable to mount Azure Data Box Disk on Oracle Linux 7.9; disk not recognized or mount fails on unsupported Linux distrib | Oracle Linux 7.9 is not in the supported OS list for Azure Data Box Disk. Only specific Linux distri | Switch to a supported OS such as CentOS. Refer to the Data Box Disk system requirements page for the full list of suppor | 🟢 9.5 | [ADO Wiki] |
| 8 📋 | Azure Data Box Disk in security locked state; DC cannot upload data; CreateDCInfra fails with DiskSecurityLockedExceptio | Abnormal number of system power drops in quick succession causes the disk to enter Security Locked s | The disk cannot be recovered from security locked state. A secure erase must be performed. Customer must create a new Da | 🟢 9.5 | [ADO Wiki] |
| 9 📋 | Unlocking Data Box Disk on Red Hat Linux (RHEL) 7.x fails with passkey error; logs show dislocker-file was not created | DataBoxDiskUnlock_Prep.sh script contains broken URL (HTTP 404) for epel-release RPM package, causin | Manually download epel-release RPM from valid URL: wget https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noar | 🟢 9.5 | [ADO Wiki] |
| 10 📋 | Data Box Disk not detected by host machine after connecting via USB | Disk may be physically corrupt, or USB port/cable incompatibility | 1) Try different USB port on host; 2) Connect to a different host machine; 3) Use a different USB cable; If still undete | 🟢 9.5 | [ADO Wiki] |
| 11 📋 | After unlocking Azure Data Box Disk, copying data fails with 'ERROR: The media is write protected'; disk contents are vi | Disk read-only attribute may be set; could also be caused by host write policy, insufficient folder  | (1) Try drag-and-drop instead of Robocopy to rule out app-specific issues; (2) Test on multiple host devices to rule out | 🟢 9.5 | [ADO Wiki] |
| 12 📋 | Data Box Disk validation error: InvalidShareContainerFormat when container/share/fileshare names contain uppercase lette | Azure storage naming conventions require all lowercase for container, page blob container, and file  | Rename all subfolders under BlockBlob/PageBlob/AzureFile to use only lowercase letters, digits, and hyphens. Re-run vali | 🟢 9 | [MCVKB] |
| 13 📋 | Data Box Disk: data copied into user-created folder (not one of the precreated folders on the disk) fails to upload to A | Data Box Disk creates precreated folder structures (BlockBlob, PageBlob, AzureFile with subfolders)  | Instruct customer to only copy data into precreated folders on the unlocked disk. Do not create new top-level or sub-fol | 🟢 9 | [MCVKB] |
| 14 📋 | Blob upload fails at Azure datacenter with error code 'IOFailed'; this error code does not appear in public Azure docume | Hardware failure on the Data Box Disk causes a disk read error during the datacenter upload process. | 1) Run the DataBoxDiskValidation tool before shipping to verify data integrity. 2) If validation shows errors, order ano | 🟢 8.5 | [ADO Wiki] |
| 15 📋 | Data Box Disk shows 'Drive Formatted' error at the datacenter; ASC copy status shows 'Bitlocker Failed'; disk is invalid | Customer or vendor technician formatted the Data Box Disk after receiving it, erasing the pre-config | There is no recovery for a formatted Data Box Disk (customer error). If multiple disks were ordered and others remain un | 🟢 8.5 | [ADO Wiki] |
| 16 📋 | During data copy to Azure Data Box Disk, error 'Power Surge On Hub Port: A USB device has exceeded the power limits of i | USB device draws more power than the hub port allows; some systems (e.g., Data Loggers based on Wind | (1) Confirm client OS is supported and meets system requirements; (2) Verify USB cable is properly connected; (3) Connec | 🟢 8.5 | [ADO Wiki] |
| 17 📋 | Data Box Disk drive gets mounted as read-only on Linux client during data copy | Unclean NTFS filesystem on the Data Box Disk causes Linux to mount it as read-only. Remounting as re | Install ntfsprogs, unmount, run ntfsfix on the dislocker-file path, remove hibernation metadata with ntfs-3g -o remove_h | 🟢 8.5 | [MS Learn] |
| 18 📋 | Data copied to Data Box Disk does not persist after unmount and remount | Drive was initially mounted as read-only due to unclean filesystem, then remounted as read-write, bu | Follow the read-only drive resolution: ntfsfix + clean unmount/mount cycle. If issue persists, collect logs from Data Bo | 🟢 8.5 | [MS Learn] |
| 19 📋 | Data Box Disk detected by host but cannot be unlocked; disk may show as RAW or Unallocated in Disk Management | USB port not USB 3.0, cable/host compatibility issue, or disk filesystem corruption showing as RAW/U | 1) Ensure USB 3.0 port; 2) Try different host/cable; 3) Check Disk Management for RAW/Unallocated status; 4) Check Devic | 🟢 8.0 | [ADO Wiki] |

## 快速排查路径

1. Data Box Disk cannot be opened after unlock - filesystem errors or RAW partition → Disk is unusable `[来源: onenote]`
2. Data Box Disk unlock tool fails on Red Hat Enterprise Linux 7.x → Refer to internal KB (a2861f24) `[来源: onenote]`
3. Data Box Disk: after PC restart, disk requires re-unlock via DataBoxDiskUnlock t → Run DataBoxDiskUnlock `[来源: onenote]`
4. Data Box Disk requires re-unlock after host PC reboot or USB reconnection → After reboot or USB reconnection, re-run the Data Box Disk unlock tool with the passkey before resum `[来源: onenote]`
5. Data Box Disk USB drive disappears or gets locked during Robocopy large file cop → Reduce Robocopy thread count (e `[来源: onenote]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/data-box-disk-setup.md#排查流程)

## ⚠️ 已知矛盾
- **solution_conflict** (context_dependent): disk-015 vs disk-122 — 两个方案针对不同严重程度：ntfsfix 可修复日志损坏等轻度问题；若物理损坏或严重文件系统错误则需替换磁盘。两者并不互斥。
- **solution_conflict** (context_dependent): disk-019 vs disk-128 — OneNote 给出通用指引（换 OS），ADO Wiki 给出具体修复（修复脚本中的 broken URL）。两个方案在不同场景下都有效。

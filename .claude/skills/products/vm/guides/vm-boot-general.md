# VM Windows 启动通用问题 — 排查速查

**来源数**: 3 (AW, ML, ON) | **条目**: 12 | **21V**: 全部
**最后更新**: 2026-04-24

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | VM screenshot shows 'Working on features ##% complete Don't turn off your computer' and VM is stuck  | Customer added or removed a Windows Server role or feature, and the operation is | Take multiple screenshots to validate if progress is being made. Only intercede  | 🔵 7.5 | AW |
| 2 | VM displays Fatal error C0000034 applying update operations on boot screen after installing a Window | Corrupted pending update operations after Windows Cumulative Update installation | OFFLINE: Create rescue VM or nested environment, run dism /image:G:\ /cleanup-im | 🔵 6.5 | AW |
| 3 | Standard_D96ds_v5 or Standard_D96ads_v5 (96 vCPU) VM with Trusted Launch and Secure Boot fails to bo | Firmware bug in virtual firmware layer that only manifests with 96 vCPU SKUs (St | Resize VM to a non-96 vCPU SKU (e.g. Standard_D64ds_v5) as workaround; for perma | 🔵 6.5 | AW |
| 4 | Azure VM screenshot shows 'Please wait for the Local Session Manager' - OS hangs waiting for Local S | Local Session Manager service is stuck during startup. Root cause depends on mem | Use online hang scenario troubleshooting: backup OS disk, collect memory dump vi | 🔵 6.5 | AW |
| 5 | Windows VM screenshot shows Linux/Grub boot process instead of Windows boot - the VM is encrypted wi | CloudLink encryption uses a Linux-based machine to manage encryption keys. If th | Engage CloudLink support to troubleshoot key retrieval. If Bitlocker team involv | 🔵 6.5 | AW |
| 6 | Windows 11 Trusted Launch VM fails to boot with error 'The boot loader did not load an operating sys | When the EFI partition is deleted and recreated at a different location, the VM  | Deallocate VM, download VHD, upload to new storage account, create new managed d | 🔵 6.5 | AW |
| 7 | RHEL 7/8 Gen 2 Azure VM fails to boot with 'Failed to open \EFI\redhat\grubx64.efi Not Found' - rebo | Missing grubx64.efi file from the EFI system partition. Can be caused by misconf | Create RHEL Gen2 rescue VM with same distro, attach broken OS disk copy, mount a | 🔵 6.5 | AW |
| 8 | Windows VM fails to boot due to corrupted registry hive (SYSTEM, SOFTWARE, etc.) — serial console sh | Registry hive file was not properly closed or became corrupted, preventing Windo | Offline repair: 1) Delete VM (keep OS disk). 2) Attach OS disk to repair VM. 3)  | 🔵 6.5 | ML |
| 9 | Generation 1 Windows VM fails to boot because the Windows partition is not marked as Active in disk  | The boot partition on the OS disk is not flagged as Active. Generation 1 VMs (BI | Offline repair: 1) Attach OS disk to repair VM. 2) Open diskpart. 3) Select the  | 🔵 6.5 | ML |
| 10 | Linux VM fails to boot due to incorrect HugePages. OOM, udev failure, or Kernel panic deadlocked on  | vm.nr_hugepages in /etc/sysctl.conf set too high, reserving all memory for HugeP | Boot single user mode or rescue VM. Reduce vm.nr_hugepages in /etc/sysctl.conf.  | 🔵 6.5 | ML |
| 11 | Windows VM fails to boot after cumulative updates (KB5040434/KB5040562). Stuck at update screen afte | Portal shutdown triggers Host Agent 10-min forced power-off. If updates take >10 | Shutdown/restart from within guest OS, not Azure portal. Ref wiki: Windows Fails | 🔵 6 | ON |
| 12 | Linux VM fails to boot after OS disk resize. cloud-init Errno 28 No space left on device | Cloud-init requires some free space to expand root filesystem. Full disk prevent | Clear unneeded data via rescue VM or single user mode, then expand filesystem | 🔵 5.5 | ML |

## 快速排查路径

1. **VM screenshot shows 'Working on features ##% complete Don't turn off your comput**
   - 根因: Customer added or removed a Windows Server role or feature, and the operation is taking long or is stuck.
   - 方案: Take multiple screenshots to validate if progress is being made. Only intercede if truly stuck to avoid breaking the role/feature. If stuck, use OFFLI
   - `[🔵 7.5 | AW]`

2. **VM displays Fatal error C0000034 applying update operations on boot screen after**
   - 根因: Corrupted pending update operations after Windows Cumulative Update installation cause boot failure
   - 方案: OFFLINE: Create rescue VM or nested environment, run dism /image:G:\ /cleanup-image /revertpendingactions /scratchdir:G:\temp to revert pending action
   - `[🔵 6.5 | AW]`

3. **Standard_D96ds_v5 or Standard_D96ads_v5 (96 vCPU) VM with Trusted Launch and Sec**
   - 根因: Firmware bug in virtual firmware layer that only manifests with 96 vCPU SKUs (Standard_D96ds_v5/Standard_D96ads_v5) unde
   - 方案: Resize VM to a non-96 vCPU SKU (e.g. Standard_D64ds_v5) as workaround; for permanent fix, file ICM to EEE RDOS team
   - `[🔵 6.5 | AW]`

4. **Azure VM screenshot shows 'Please wait for the Local Session Manager' - OS hangs**
   - 根因: Local Session Manager service is stuck during startup. Root cause depends on memory dump analysis (could be driver confl
   - 方案: Use online hang scenario troubleshooting: backup OS disk, collect memory dump via run command or serial console for root cause analysis. Escalate to W
   - `[🔵 6.5 | AW]`

5. **Windows VM screenshot shows Linux/Grub boot process instead of Windows boot - th**
   - 根因: CloudLink encryption uses a Linux-based machine to manage encryption keys. If the CloudLink vault fails to retrieve the 
   - 方案: Engage CloudLink support to troubleshoot key retrieval. If Bitlocker team involvement needed, set up machine on Nested virtualization first, then cut 
   - `[🔵 6.5 | AW]`


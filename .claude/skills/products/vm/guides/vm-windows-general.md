# VM Windows OS 通用问题 — 排查速查

**来源数**: 4 (AW, KB, ML, ON) | **条目**: 37 | **21V**: 35/37
**最后更新**: 2026-04-24

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | MARS system state backup fails with warning: Failed: Hr: = [0x80070057] BlbutilGetPartitionInformati | SAN policy on Windows server set to offlineall, causing MARS to fail when access | Check and fix SAN policy via diskpart: 1) Run diskpart; 2) Run SAN to view curre | 🟢 8 | ON |
| 2 | Questions about Windows 10 client image support lifecycle and availability on Azure Mooncake/Fairfax | Windows client images are not published to Mooncake or Fairfax because those sys | 1) Advise upgrade to latest supported Windows version; 2) Win10 client images on | 🟢 8 | ON |
| 3 | Need to collect memory dump or process dump from Windows VM for crash / hang / high-CPU debugging |  | Comprehensive dump collection reference. (1) Kernel/full crash dump: CrashDumpEn | 🟢 8 | ON |
| 4 | Windows Azure VM experiencing low memory, OOM (out-of-memory), high paging, application failures or  | Either (1) insufficient physical RAM causing excessive paging to disk; or (2) me | (1) PerfInsights: run General VM Slow analysis - check Findings + Top Memory Con | 🟢 8 | ON |
| 5 | Certificate thumbprint validation fails even though thumbprint appears visually correct after removi | MMC Certificate Properties dialog embeds an invisible zero-width Unicode charact | Do NOT copy certificate thumbprint from MMC UI. Use PowerShell: dir Cert:\Curren | 🟢 8 | ON |
| 6 | Customer running Windows Server 2008/R2 workloads in Azure asks about ESU support eligibility or ent | Azure customers are automatically entitled to ESU + Support for actively running | Azure customers with ability to open Azure support case are entitled to ESU + Su | 🔵 7.5 | AW |
| 7 | Azure Windows VM screenshot shows: 'An operating system wasn't found'. VM cannot boot. | Ransomware attack has encrypted or destroyed the boot sector and/or OS partition | Restore from backup if available. Check Azure Backup vault for recovery points.  | 🔵 7.5 | AW |
| 8 | Azure Windows VM screenshot shows: 'An operating system wasn't found. Try disconnecting any drivers  | The OS boot process could not locate an active system partition. The system part | OFFLINE: Attach OS disk to rescue VM. Use diskpart to identify and activate the  | 🔵 7.5 | AW |
| 9 | Windows VM screenshot shows CHKDSK is in progress during boot, VM is stuck at disk check screen | Dirty flag was set on the OS disk (by user action or NTFS corruption), forcing C | Wait for CHKDSK to complete (can take hours on large disks). If VM recovered, ch | 🔵 7.5 | AW |
| 10 | Windows Server 2008/2008R2 ESU MAK key is missing or incorrect in Azure Portal | ESU MAK in Azure Portal is managed by Volume Licensing Service Center (VLSC), no | Route to VLSC: https://www.microsoft.com/Licensing/Servicecenter/Help/Contact.as | 🔵 7.5 | AW |
| 11 | Black screen after RDP on Windows 10 RS3 VM deployed with single CPU (MicrosoftWindowsDesktop.Window | Known issue with Windows 10 RS3 image: when deployed with only 1 CPU, the OS han | Resize the VM to a size with 2 or more CPUs. With 2 CPUs the OS will complete in | 🔵 7.5 | AW |
| 12 | Unable to install Azure PowerShell modules (Az/AzureRM) on Windows Server 2012R2 or 2016. Install-Mo | PowerShell Gallery requires TLS 1.2 since April 2020. Older Windows Server versi | Mitigation 1: Add [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityPro | 🔵 7.5 | AW |
| 13 | VM shows error 0xC0000605 "A component of the operating system has expired" and cannot boot | VM was built from a preview/trial OS image (not RTM release), trial period has e | No fix. Customer must delete VM (keep disks), mount OS disk to another VM to cop | 🔵 7.5 | AW |
| 14 | VM screenshot shows 'Working on features ##% complete Don't turn off your computer' and VM is stuck  | Customer added or removed a Windows Server role or feature, and the operation is | Take multiple screenshots to validate if progress is being made. Only intercede  | 🔵 7.5 | AW |
| 15 | VM screenshot shows "A disk read error occurred. Press Ctrl+Alt+Del to restart" | OS disk structure is corrupted and unreadable | Stop-deallocate and start the VM. If persists, attach OS disk to rescue VM, back | 🔵 7.5 | AW |
| 16 | Windows 2012 R2 VMs may experience poor performance if the VM is storage stack is in emulated mode.  | The issue is caused due to a recently discovered bug in Windows which is exposed | Currently there are two methods to mitigate the issue. Method:1 Using Device Man | 🔵 7 | KB |
| 17 | Windows VM stuck on Getting ready or Getting Windows ready. Dont turn off your computer. VM does not | Server performing final restart after configuration change (Windows Update or ro | 1. Restore VM from backup if available. 2. Otherwise attach OS disk to recovery  | 🔵 6.5 | ML |
| 18 | VM Application deployment fails with OS mismatch error: 'Current VM Application Version supports OS  | The VM Application was created for a different OS type than the target VM's oper | Use an application version that matches the target machine's OS type (Windows or | 🔵 6.5 | AW |
| 19 | Pinging a Clustered Name (Failover Cluster Network Name or client access point IP) from non-owner no | Expected behavior: Clustered IP address resources have limited functions in Azur | Use TCP connectivity tests instead of ICMP ping. For cluster management, connect | 🔵 6.5 | ML |
| 20 | Accelerated Networking toggle is ON during VM provisioning but no Mellanox entry appears in Device M | Sporadic platform issue where Accelerated Networking NIC (Mellanox ConnectX-4 Lx | Disable Accelerated Networking, or redeploy the VM (may not always work). Perman | 🔵 6.5 | AW |
| 21 | ISV Graph API calls to Windows Update for Business Deployment Service return 403 response; or ISV re | null | Route to MSaaS Developer App and Services Dev queue. REST API and PowerShell/Azu | 🔵 6.5 | AW |
| 22 | Gen2 Trusted Launch VM with Secure Boot hangs in reboot loop - Windows.VmBoot failures lasting 40min | Race condition / timing issue in the Firmware / HAL layer of guest VM with Trust | Restart from Azure portal or reboot the VM (issue is intermittent and usually re | 🔵 6.5 | AW |
| 23 | Azure Windows VM fails to boot with error 0xC0000098: critical system driver missing or corrupt. | Binary file is from a different version of Windows than the VM operating system. | Attach OS disk to troubleshooting VM. chkdsk /F. Replace corrupt .sys from WinSx | 🔵 6.5 | ML |
| 24 | Azure Windows VM fails to boot with error 0xC0000359: critical system driver missing or corrupt. | The binary file is the 32-bit version and needs to be replaced by the 64-bit ver | Attach OS disk to troubleshooting VM. chkdsk /F. Replace with correct 64-bit .sy | 🔵 6.5 | ML |
| 25 | DCesv6/ECesv6 Linux VM time drifting - system time drifts by seconds on long-running VMs | Intel TDX 5th Gen (Emerald Rapids) architecture time sync bug affecting Linux on | Manual workaround per FAQ: https://learn.microsoft.com/en-us/azure/confidential- | 🔵 6.5 | AW |
| 26 | ASR V2A enable replication fails with error 78006 / provider error 31337 "Protection could not be di | Docker volume paths using devicemapper storage driver contain colons (e.g., dock | Option 1: Switch Docker storage driver from devicemapper to overlay2 (recommende | 🔵 6.5 | ON |
| 27 | Active Directory domain controller VM in reboot loop with error 0xC00002E2 (STATUS_DS_INIT_FAILURE)  | Multiple possible causes: (1) No access to disk holding NTDS.DIT, (2) No free sp | Offline: (RCA1) Check disk/storage access; (RCA2) Expand disk or free space if < | 🔵 6.5 | AW |
| 28 | Windows VM on diskless Dv4/Ev4 series appears to have no pagefile; pagefile.sys not visible in File  | Bug in Windows provisioning causes pagefile.sys to be created as a hidden + syst | In File Explorer → View → Options → View tab: enable 'Show hidden files' and unc | 🔵 6.5 | AW |
| 29 | Azure Windows VM stuck on 'Checking file system on C:' or 'Scanning and repairing drive (C:)' during | NTFS file system error found after unexpected VM restart or abrupt shutdown. Win | If VM is stuck and not progressing: 1. Snapshot OS disk as backup. 2. Attach OS  | 🔵 6.5 | ML |
| 30 | NVs_v3 GPU driver disabled with error Code 43 after VM reboot | GPU driver becomes disabled with Windows Device Manager Code 43 after reboot on  | Follow TSG: AzureIaaSVM wiki 'NVs_v3-GPU-Driver-is-disabled-with-code-43-after-r | 🔵 6.5 | ON |
| 31 | Azure Windows VM fails to boot with error 0xC0000011: Windows failed to load because a critical syst | File version mismatch between the binary file indicated in the error and the ver | Attach OS disk to troubleshooting VM. Run chkdsk /F. Replace corrupt .sys: renam | 🔵 6.5 | ML |
| 32 | Add virtual machine host job fails with: Add virtual machine host job will fail with: Error (20594)T | NetworkVirtualization is required by SCVMM and is not a Feature that ships with  |  | 🔵 6 | KB |
| 33 | System Center Virtual Machine Manager 2016 Agent Installation can fail with the following error mess | SCVMM 2016 Agent installation can fail with the error message: ôThere is a probl | The installation of vcredist_x64.exe was triggered automatically by the VMM Agen | 🔵 6 | KB |
| 34 | Azure Windows VM with multiple IPs loses Internet after configuring secondary IP addresses. | Windows selects lowest numerical IP as primary regardless of Azure portal. Only  | PowerShell: Set-NetIPAddress -IPAddress primaryIP -SkipAsSource false; Set-NetIP | 🔵 5.5 | ML |
| 35 | Azure VM running Windows Server 2012 R2 experiences poor performance. Severe decrease in local resou | Bug in Windows exposed when provisioned image has phantom IDE devices. The storf | Apply update KB4057903 (Hyper-V integration components update for Windows virtua | 🔵 5.5 | ML |
| 36 | Azure Linux VM maximum memory limited to 64 GB despite larger VM size. free -m shows only 64GB insid | Bug in Linux kernel prior to 3.10 with MTRR handling on Windows Server 2016 Hype | Add disable_mtrr_trim as kernel boot line option in GRUB config. Or upgrade to n | 🔵 5.5 | ML |
| 37 | [container] VM+SCIM Windows section index page |  | Section container page. No actionable content. | 🔵 5 | ON |

## 快速排查路径

1. **MARS system state backup fails with warning: Failed: Hr: = [0x80070057] BlbutilG**
   - 根因: SAN policy on Windows server set to offlineall, causing MARS to fail when accessing the dynamically created VHD (SSBStag
   - 方案: Check and fix SAN policy via diskpart: 1) Run diskpart; 2) Run SAN to view current policy; 3) Run SAN POLICY=offlineShared (cluster servers) or SAN PO
   - `[🟢 8 | ON]`

2. **Questions about Windows 10 client image support lifecycle and availability on Az**
   - 根因: Windows client images are not published to Mooncake or Fairfax because those systems cannot verify Visual Studio Subscri
   - 方案: 1) Advise upgrade to latest supported Windows version; 2) Win10 client images only on Global Azure with MSDN subscription; 3) Not available on Mooncak
   - `[🟢 8 | ON]`

3. **Need to collect memory dump or process dump from Windows VM for crash / hang / h**
   - 方案: Comprehensive dump collection reference. (1) Kernel/full crash dump: CrashDumpEnabled registry (0=None,1=Full,2=Kernel,3=Small,7=Auto) under HKLM\Syst
   - `[🟢 8 | ON]`

4. **Windows Azure VM experiencing low memory, OOM (out-of-memory), high paging, appl**
   - 根因: Either (1) insufficient physical RAM causing excessive paging to disk; or (2) memory leak - application fails to release
   - 方案: (1) PerfInsights: run General VM Slow analysis - check Findings + Top Memory Consumers + High Memory Usage Periods. Alert thresholds: %Committed Bytes
   - `[🟢 8 | ON]`

5. **Certificate thumbprint validation fails even though thumbprint appears visually **
   - 根因: MMC Certificate Properties dialog embeds an invisible zero-width Unicode character at the beginning of the thumbprint va
   - 方案: Do NOT copy certificate thumbprint from MMC UI. Use PowerShell: dir Cert:\CurrentUser\My or dir Cert:\LocalMachine\My — output has no hidden character
   - `[🟢 8 | ON]`


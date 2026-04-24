# VM Windows BSOD 蓝屏 — 排查速查

**来源数**: 3 (AW, ML, ON) | **条目**: 16 | **21V**: 全部
**最后更新**: 2026-04-24

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Azure Windows VM BSOD caused by CrowdStrike Falcon Sensor update (csagent.sys) on 2024-07-19, VM boo | CrowdStrike channel file C-00000291*.sys with timestamp 2024-07-19 0409 UTC was  | Auto: BSOD-Autofix.ps1 with az vm repair (handles encrypted/unmanaged). Manual:  | 🟢 8 | ON |
| 2 | After CrowdStrike BSOD fix, Azure VM fails to boot with winload.exe error 0xC000000E or winload.efi  | BCD corruption or incorrect OS disk reference after OS disk swap during CrowdStr | 0xC000000E: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machine | 🔵 7 | ON |
| 3 | VM shows BSOD with stop code MSSECCORE_ASSERTION_FAILURE. | Low disk space on the OS drive causes assertion failures in msseccore. | Create rescue VM using az vm repair create, attach OS disk, increase OS drive si | 🔵 6.5 | AW |
| 4 | Windows 10 VM crashes with Bugcheck 0x0000009F DRIVER_POWER_STATE_FAILURE, first parameter is 3. | Code defect in Windows 10 (OS Bug 19651151): Turn off Hard Drives after 20mins f | Online fix: go to Power Options and set Turn off hard drives after value to 0 (d | 🔵 6.5 | AW |
| 5 | After installing July 2018 security patches (KB4338825, KB4338814, etc.), VMs running network worklo | Regression caused by MSRC case 44653 shipped in July 2018 (07B) patches, introdu | If VM is accessible (online): install resolving KB (e.g., KB4345421 for RS4, KB4 | 🔵 6.5 | AW |
| 6 | VM shows BSOD with stop code UNMOUNTABLE_BOOT_VOLUME (0x000000ED). | I/O subsystem attempted to mount the boot volume and failed, typically due to di | Offline troubleshooting: attach OS disk to rescue VM, run chkdsk f: /f on OS dis | 🔵 6.5 | AW |
| 7 | Windows VM shows blue screen error (BSOD) on boot. Boot diagnostics shows stop error: Your PC ran in | Driver problem, corrupted system file or memory, or application accessing forbid | 1. Attach OS disk to recovery VM. 2. Locate Memory.dmp in Windows folder. 3. If  | 🔵 6.5 | ML |
| 8 | Azure Windows VM (domain controller) stuck in reboot loop, boot diagnostics shows stop code 0xC00002 | LSASS.exe cannot authenticate because the domain controller has no read/write ac | Attach OS disk to repair VM. 1) Free disk space if <300MB. 2) Verify NTDS.DIT di | 🔵 6.5 | ML |
| 9 | Azure VM unresponsive during boot, boot diagnostics screenshot shows OS stuck with message: Applying | Multiple potential causes requiring memory dump analysis. OS hangs while applyin | 1) Create repair VM using VM Repair Commands (steps 1-3). 2) Attach OS disk to r | 🔵 6.5 | ML |
| 10 | Azure VM BSOD with Windows stop code 0x00000074 BAD_SYSTEM_CONFIG_INFO: Your PC ran into a problem a | SYSTEM registry hive is corrupted. Possible causes: registry hive not closed pro | 1) Delete VM (keep OS disk). 2) Attach OS disk as data disk to troubleshooting V | 🔵 6.5 | ML |
| 11 | Azure VM (Windows Server 2008) crashes with blue screen: *** Hardware Malfunction - Call your vendor | Guest OS was not set up correctly and a Non-Maskable Interrupt (NMI) was sent. A | 1) Restart VM via Azure portal. 2) Once booted, run elevated cmd: REG ADD HKLM\S | 🔵 6.5 | ML |
| 12 | Azure VM BSOD with stop error 0xC000021A STATUS_SYSTEM_PROCESS_TERMINATED: Your PC ran into a proble | Critical process failed: Winlogon (winlogon.exe) or Client Server Run-Time Subsy | 1) Try restoring VM from backup. 2) If no backup: create repair VM, attach OS di | 🔵 6.5 | ML |
| 13 | Azure VM BSOD with stop error 0x0000007E SYSTEM_THREAD_EXCEPTION_NOT_HANDLED: A system thread except | Cannot be determined until memory dump is analyzed. A system thread generated an | 1) Try restoring VM from backup. 2) Create repair VM, attach OS disk. 3) Connect | 🔵 6.5 | ML |
| 14 | Azure Windows VM BSOD with bug check IRQL_NOT_LESS_OR_EQUAL (0x0000000A). VM fails to boot, blue scr | OS does not support more than 64 vCPUs but VM is configured with higher vCPU cou | 1) Reduce vCPUs to 64 or fewer. 2) Rebuild VM with OS supporting >64 vCPUs (Wind | 🔵 6.5 | ML |
| 15 | Azure Windows VM BSOD with bug check MEMORY_MANAGEMENT (0x0000001A). VM crashes with blue screen. | Server memory management error occurred. Specific cause requires detailed dump a | Collect OS memory dump file and file Azure support request for dump analysis. | 🔵 5.5 | ML |
| 16 | Azure Windows VM BSOD with bug check KMODE_EXCEPTION_NOT_HANDLED (0x0000001E). VM crashes with blue  | Kernel-mode program generated an exception that the error handler didn't catch. | Collect OS memory dump file to identify which exception was generated. File Azur | 🔵 5.5 | ML |

## 快速排查路径

1. **Azure Windows VM BSOD caused by CrowdStrike Falcon Sensor update (csagent.sys) o**
   - 根因: CrowdStrike channel file C-00000291*.sys with timestamp 2024-07-19 0409 UTC was problematic; hosts online before 0527 UT
   - 方案: Auto: BSOD-Autofix.ps1 with az vm repair (handles encrypted/unmanaged). Manual: 1) Snapshot; 2) Create managed disk; 3) Attach to repair VM; 4) Delete
   - `[🟢 8 | ON]`

2. **After CrowdStrike BSOD fix, Azure VM fails to boot with winload.exe error 0xC000**
   - 根因: BCD corruption or incorrect OS disk reference after OS disk swap during CrowdStrike remediation
   - 方案: 0xC000000E: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/error-code-0xc000000e; 0xc0000225: https://learn.microsoft.c
   - `[🔵 7 | ON]`

3. **VM shows BSOD with stop code MSSECCORE_ASSERTION_FAILURE.**
   - 根因: Low disk space on the OS drive causes assertion failures in msseccore.
   - 方案: Create rescue VM using az vm repair create, attach OS disk, increase OS drive size from Disk Management, then swap disk back to original VM.
   - `[🔵 6.5 | AW]`

4. **Windows 10 VM crashes with Bugcheck 0x0000009F DRIVER_POWER_STATE_FAILURE, first**
   - 根因: Code defect in Windows 10 (OS Bug 19651151): Turn off Hard Drives after 20mins feature enabled causes crash when OS retu
   - 方案: Online fix: go to Power Options and set Turn off hard drives after value to 0 (disabled). If VM is not accessible (non-boot), use offline troubleshoot
   - `[🔵 6.5 | AW]`

5. **After installing July 2018 security patches (KB4338825, KB4338814, etc.), VMs ru**
   - 根因: Regression caused by MSRC case 44653 shipped in July 2018 (07B) patches, introducing a race condition in network stack.
   - 方案: If VM is accessible (online): install resolving KB (e.g., KB4345421 for RS4, KB4345419 for RS3, KB4345418 for RS1). If VM is non-boot (offline): use D
   - `[🔵 6.5 | AW]`


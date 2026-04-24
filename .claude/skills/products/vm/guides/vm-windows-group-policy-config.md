# VM Windows 组策略与系统配置 — 排查速查

**来源数**: 3 (AW, ML, ON) | **条目**: 19 | **21V**: 全部
**最后更新**: 2026-04-24

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Event Viewer shows garbled descriptions or "The description for Event ID X cannot be found. The loca | Event source component (message DLL / registry) not installed on the computer | Install the corresponding Windows role/feature component: Windows 10 -> Settings | 🟢 8 | ON |
| 2 | Azure Windows VM is stuck during boot displaying 'Applying Audit Policy Configuration policy' messag | Known OS Bug 5880648 - GPO (Group Policy Object) processing deadlock during boot | ONLINE: Use Run Command or Serial Console to disable the problematic GPO. OFFLIN | 🔵 7.5 | AW |
| 3 | Azure Windows VM is stuck during boot displaying 'Applying computer settings' message. VM does not p | Known OS Bug 5880648 - GPO processing deadlock during boot. Can also be caused b | ONLINE: Use Run Command or Serial Console to disable problematic GPO. OFFLINE: A | 🔵 7.5 | AW |
| 4 | Azure Windows VM is stuck during boot displaying 'Applying Group Policy Environment policy' message. | Group Policy Environment policy processing hang during boot. Specific root cause | ONLINE only (OFFLINE not possible - scenario needs in-state analysis). Use Seria | 🔵 7.5 | AW |
| 5 | Need to track which process or user is modifying specific Windows registry keys on Azure VM | Registry changes by unknown processes causing configuration drift; standard logs | 1) gpedit.msc -> Advanced Audit Policy -> Object Access -> Audit Registry -> ena | 🔵 7 | ON |
| 6 | Azure VM Bugcheck 7B. Pending/Staged updates per 7Bchecks DISM check. | Pending updates left system inconsistent. | dism /cleanup-image /revertpendingactions or /Remove-Package. | 🔵 6.5 | AW |
| 7 | Windows VM caught in reboot loop: boot diagnostics shows VM booting but process gets interrupted and | Three possible causes: (1) Third-party service flagged as critical cannot start; | Attach OS disk to rescue VM. Cause 1: Check ErrorControl registry value for RDAg | 🔵 6.5 | ML |
| 8 | Azure VM unresponsive during boot showing Applying Audit Policy Configuration policy message. Applie | Conflicting locks when Delete user profiles older than N days on system restart  | Attach OS disk to rescue VM. Load SOFTWARE hive as BROKENSOFTWARE. Delete Cleanu | 🔵 6.5 | ML |
| 9 | Azure VM unresponsive during boot showing Applying Group Policy Local Users and Groups policy or Ple | Conflicting locks when Delete user profiles older than N days policy (CleanupPro | Attach OS disk to rescue VM. Load SOFTWARE hive as BROKENSOFTWARE. Delete Cleanu | 🔵 6.5 | ML |
| 10 | Azure VM (domain controller) unresponsive on restart, boot diagnostics shows Default Domain Controll | Recent changes to Default Domain Controllers Policy causing boot hang. Specific  | Undo recent Default Domain Controllers Policy changes. If unknown cause: attach  | 🔵 5.5 | ML |
| 11 | Azure Windows VM fails to boot with error 0xC00000BA: a critical system driver is missing or contain | Windows system files corruption from unfinished installation/erasure, bad applic | 1) Disable recently installed service via registry (set Start=4). 2) Repair file | 🔵 5.5 | ML |
| 12 | Azure Windows VM stuck during boot on Applying Group Policy Environment policy screen, VM unresponsi | Group Policy Environment policy processing hangs during boot. Specific root caus | Collect OS memory dump file from the VM. Create Azure support request with the d | 🔵 5.5 | ML |
| 13 | Azure Windows VM stuck during boot on Applying Group Policy Scheduled Tasks policy screen, VM unresp | Group Policy Scheduled Tasks policy processing hangs during boot. Specific root  | Collect OS memory dump file from the VM. Create Azure support request with the d | 🔵 5.5 | ML |
| 14 | Azure Windows VM stuck during boot on Applying Group Policy Registry policy screen, VM unresponsive. | Group Policy Registry policy processing hangs during boot. Specific root cause r | Collect OS memory dump file from the VM. Create Azure support request with the d | 🔵 5.5 | ML |
| 15 | Azure Windows VM stuck during boot on Applying Group Policy Services policy screen, VM unresponsive. | Group Policy Services policy processing hangs during boot. Specific root cause r | Collect OS memory dump file from the VM. Create Azure support request with the d | 🔵 5.5 | ML |
| 16 | Windows VM stuck during boot at 'Applying Group Policy Power Options policy' message shown in boot d | Group Policy processing stall during boot. Specific cause requires memory dump a | Collect OS memory dump file via rescue VM, then file Azure support request for d | 🔵 5.5 | ML |
| 17 | Windows VM stuck during boot at 'Applying Software Installation policy' message shown in boot diagno | Group Policy software installation policy processing stall during boot. Specific | Collect OS memory dump file via rescue VM, then file Azure support request for d | 🔵 5.5 | ML |
| 18 | Windows VM stuck during boot at 'Please wait for the Group Policy Client' message. VM does not progr | VM is applying many or complex Group Policy settings at startup. Normal processi | Wait up to 1 hour for GP processing to complete. If still stuck, collect OS memo | 🔵 5.5 | ML |
| 19 | Azure Windows VM stuck during boot on 'Applying Group Policy Shortcuts policy' screen. VM unresponsi | Group Policy Shortcuts policy processing hangs during startup. Specific root cau | Collect OS memory dump file using repair VM, then open support request with the  | 🔵 5.5 | ML |

## 快速排查路径

1. **Event Viewer shows garbled descriptions or "The description for Event ID X canno**
   - 根因: Event source component (message DLL / registry) not installed on the computer
   - 方案: Install the corresponding Windows role/feature component: Windows 10 -> Settings > Apps > Optional Features; Windows Server -> Server Manager > Add Ro
   - `[🟢 8 | ON]`

2. **Azure Windows VM is stuck during boot displaying 'Applying Audit Policy Configur**
   - 根因: Known OS Bug 5880648 - GPO (Group Policy Object) processing deadlock during boot. Can also be caused by 'delete profiles
   - 方案: ONLINE: Use Run Command or Serial Console to disable the problematic GPO. OFFLINE: Attach OS disk to rescue VM, navigate to HKLM\SOFTWARE\Microsoft\Wi
   - `[🔵 7.5 | AW]`

3. **Azure Windows VM is stuck during boot displaying 'Applying computer settings' me**
   - 根因: Known OS Bug 5880648 - GPO processing deadlock during boot. Can also be caused by 'delete profiles older than...' policy
   - 方案: ONLINE: Use Run Command or Serial Console to disable problematic GPO. OFFLINE: Attach OS disk to rescue VM via OSDisk Swap API or manual attach. Check
   - `[🔵 7.5 | AW]`

4. **Azure Windows VM is stuck during boot displaying 'Applying Group Policy Environm**
   - 根因: Group Policy Environment policy processing hang during boot. Specific root cause depends on kernel dump analysis from GE
   - 方案: ONLINE only (OFFLINE not possible - scenario needs in-state analysis). Use Serial Console or Run Command to collect NMI crash dump. Engage Connectivit
   - `[🔵 7.5 | AW]`

5. **Need to track which process or user is modifying specific Windows registry keys **
   - 根因: Registry changes by unknown processes causing configuration drift; standard logs do not capture registry mods by default
   - 方案: 1) gpedit.msc -> Advanced Audit Policy -> Object Access -> Audit Registry -> enable; 2) regedit -> right-click key -> Permissions -> Advanced -> Audit
   - `[🔵 7 | ON]`


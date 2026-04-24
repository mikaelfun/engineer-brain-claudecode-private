# VM RDP 组策略与注册表配置 — 排查速查

**来源数**: 2 (AW, ON) | **条目**: 18 | **21V**: 全部
**最后更新**: 2026-04-24

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Azure Windows VM fails to boot after post-installation changes or system configuration modifications | Recent OS configuration changes corrupted the current ControlSet, preventing the | Attach OS disk to rescue VM as data disk. Load the SYSTEM hive: reg load HKLM\BR | 🔵 7.5 | AW |
| 2 | Cannot RDP to VM. No NIC visible in ipconfig. Only loopback interface in route print. UserPnp Event  | Ghost/hidden NICs accumulated beyond threshold (~1204). Every MAC address change | Remove ghost NICs using PowerShell or Device Manager (show hidden devices). For  | 🔵 7.5 | AW |
| 3 | Azure VM not booting, stuck at "Applying Group Policy Local Users and Groups" on boot screenshot. OS | OS Bug 5880648 - GPO Local Users and Groups policy processing causes hang/deadlo | 1) Backup OS disk. 2) ONLINE: Use hang scenario mitigation template (NMI crash d | 🔵 7.5 | AW |
| 4 | Azure VM not booting, stuck at "Applying Group Policy Power Options policy" on boot screenshot. | GPO Power Options policy processing hangs during boot. Root cause depends on mem | ONLINE troubleshooting: Use hang scenario mitigation template (run command / NMI | 🔵 7.5 | AW |
| 5 | Azure VM not booting, stuck at "Applying Group Policy Registry policy" on boot screenshot. | GPO Registry policy processing hangs during boot. Root cause depends on memory d | ONLINE troubleshooting: Use hang scenario mitigation template (run command / NMI | 🔵 7.5 | AW |
| 6 | Azure VM not booting, stuck at "Applying Group Policy Scheduled Tasks policy" on boot screenshot. | GPO Scheduled Tasks policy processing hangs during boot. Root cause depends on m | ONLINE troubleshooting: Use hang scenario mitigation template (run command / NMI | 🔵 7.5 | AW |
| 7 | Azure VM not booting, stuck at "Applying Group Policy Services policy" on boot screenshot. | GPO Services policy processing hangs during boot. Root cause depends on memory d | ONLINE troubleshooting: Use hang scenario mitigation template (run command / NMI | 🔵 7.5 | AW |
| 8 | Azure VM not booting, stuck at "Applying Group Policy Shortcuts policy" on boot screenshot. | GPO Shortcuts policy processing hangs during boot. Root cause depends on memory  | ONLINE troubleshooting: Use hang scenario mitigation template (run command / NMI | 🔵 7.5 | AW |
| 9 | Azure VM not booting, stuck at "Applying Registry policy" on boot screenshot (general Registry polic | Registry policy processing hangs during boot. Root cause depends on memory dump  | ONLINE troubleshooting: Use hang scenario mitigation template (run command / NMI | 🔵 7.5 | AW |
| 10 | Azure VM not booting, stuck at "Applying Software Installation policy" on boot screenshot. | GPO Software Installation policy processing hangs during boot. Root cause depend | ONLINE troubleshooting: Use hang scenario mitigation template (run command / NMI | 🔵 7.5 | AW |
| 11 | Azure VM crashes with bugcheck 0x00000074 (BAD_SYSTEM_CONFIG_INFO). VM screenshot shows BAD_SYSTEM_C | SYSTEM registry hive is corrupt, or critical registry keys and values are missin | OFFLINE mitigation: (1) Run CHKREG to repair registry corruption on rescue VM, ( | 🔵 7.5 | AW |
| 12 | Azure VM stuck during Windows Update with error C01A001D, Service Control Manager event 7023 "Log sp | During patch installation, poqexec creates many registry transaction keys. CLFS  | Offline: attach OS disk to rescue VM. Fix the security descriptor on the CLFS ba | 🔵 7.5 | AW |
| 13 | Azure VM screenshot shows 'Please wait for the Group Policy Client' - OS hangs waiting for Group Pol | Windows is processing and applying Group Policies. Many or complex policies can  | Wait up to 1 hour for Group Policy processing to complete. If VM is still stuck  | 🔵 7.5 | AW |
| 14 | Black screen after RDP login to Azure VM with Citrix XenApp/XenDesktop 7.15 LTSR CU2 or 7.17 VDA wit | Citrix Profile Management deletes some registry keys after session logoff causin | Update Citrix XenApp/XenDesktop to patched version. Ref: Citrix CTX235100. As wo | 🔵 7.5 | AW |
| 15 | RDP connection to Citrix VM fails with Remote Desktop license server error and license store creatio | Citrix XenApp uses ICA protocol which consumes RD licenses even for admin connec | 1) Verify licensing mode is correct (set to 4=per user); 2) Ensure SpecifiedLice | 🔵 7 | ON |
| 16 | Azure Windows VM stuck in reboot loop after Windows Update showing Preparing to configure windows or | At restart, boot critical drivers load and registry reads Pending.xml location w | Offline repair: create rescue VM with nested virtualization, boot from recovery  | 🔵 6.5 | AW |
| 17 | RDP to Windows VM returns 'Access is denied' during authentication due to user profile loading error | Login error while loading user profiles, caused by user policy conflicts on the  | Set registry: Set-ItemProperty -Path 'HKLM:\SYSTEM\CurrentControlSet\Control\Ter | 🔵 6.5 | AW |
| 18 | Cannot RDP to Azure VM with generic 'Remote Desktop cannot connect' three-reasons error; PSPING resp | Remote Desktop Services connection was disabled on the machine by the customer | Re-enable Remote Desktop Services connection: ONLINE via Serial Console using TS | 🔵 6.5 | AW |

## 快速排查路径

1. **Azure Windows VM fails to boot after post-installation changes or system configu**
   - 根因: Recent OS configuration changes corrupted the current ControlSet, preventing the VM from booting with the active configu
   - 方案: Attach OS disk to rescue VM as data disk. Load the SYSTEM hive: reg load HKLM\BROKENSYSTEM f:\windows\system32\config\SYSTEM. Increment all ControlSet
   - `[🔵 7.5 | AW]`

2. **Cannot RDP to VM. No NIC visible in ipconfig. Only loopback interface in route p**
   - 根因: Ghost/hidden NICs accumulated beyond threshold (~1204). Every MAC address change (e.g. after stop/start) creates a new N
   - 方案: Remove ghost NICs using PowerShell or Device Manager (show hidden devices). For VMs with Accelerated Networking, periodically clean ghost NICs as rout
   - `[🔵 7.5 | AW]`

3. **Azure VM not booting, stuck at "Applying Group Policy Local Users and Groups" on**
   - 根因: OS Bug 5880648 - GPO Local Users and Groups policy processing causes hang/deadlock during boot. Can also be caused by pr
   - 方案: 1) Backup OS disk. 2) ONLINE: Use hang scenario mitigation template (NMI crash dump + analysis). 3) OFFLINE: Mount OS disk on rescue VM, load BROKENSY
   - `[🔵 7.5 | AW]`

4. **Azure VM not booting, stuck at "Applying Group Policy Power Options policy" on b**
   - 根因: GPO Power Options policy processing hangs during boot. Root cause depends on memory dump analysis.
   - 方案: ONLINE troubleshooting: Use hang scenario mitigation template (run command / NMI for crash dump). OFFLINE not applicable. Escalate to RDP SME or Windo
   - `[🔵 7.5 | AW]`

5. **Azure VM not booting, stuck at "Applying Group Policy Registry policy" on boot s**
   - 根因: GPO Registry policy processing hangs during boot. Root cause depends on memory dump analysis.
   - 方案: ONLINE troubleshooting: Use hang scenario mitigation template (run command / NMI for crash dump). OFFLINE not applicable. Escalate to RDP SME or Windo
   - `[🔵 7.5 | AW]`


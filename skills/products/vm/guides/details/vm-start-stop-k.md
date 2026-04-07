# VM Vm Start Stop K — 综合排查指南

**条目数**: 30 | **草稿融合数**: 3 | **Kusto 查询融合**: 0
**来源草稿**: [ado-wiki-f-startbuild-fail-avdimage-languagepack.md](../../guides/drafts/ado-wiki-f-startbuild-fail-avdimage-languagepack.md), [mslearn-start-vm-last-known-good.md](../../guides/drafts/mslearn-start-vm-last-known-good.md), [onenote-script-vm-restart-events.md](../../guides/drafts/onenote-script-vm-restart-events.md)
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 2: 排查与诊断
> 来源: ADO Wiki

1. 参照 [ado-wiki-f-startbuild-fail-avdimage-languagepack.md](../../guides/drafts/ado-wiki-f-startbuild-fail-avdimage-languagepack.md) 排查流程
2. 参照 [mslearn-start-vm-last-known-good.md](../../guides/drafts/mslearn-start-vm-last-known-good.md) 排查流程
3. 参照 [onenote-script-vm-restart-events.md](../../guides/drafts/onenote-script-vm-restart-events.md) 排查流程

### Phase 3: 根因判断与解决

**判断逻辑**：

| 条件 | 含义 | 后续动作 |
|------|------|---------|
| Race condition / timing issue in the Firmware / HA | 1 条相关 | Restart from Azure portal or reboot the VM (issue is intermi... |
| MAC preservation feature bug: RNM team enabled MAC | 1 条相关 | Stop and start the VM to get a new MAC/IP assignment. Altern... |
| Ghost/hidden NICs accumulated beyond threshold (~1 | 1 条相关 | Remove ghost NICs using PowerShell or Device Manager (show h... |
| Duplicate SIDs accumulated in registry HKLM\SYSTEM | 1 条相关 | Create rescue nested VM (Hyper-V). Open regedit, navigate to... |
| The migrated VM was a Hyper-V host. The Hyper-V vi | 1 条相关 | Do not migrate Hyper-V hosts directly to Azure. Create a new... |
| Static IP hardcoded in Linux network configuration | 1 条相关 | Change network config to DHCP. RHEL/CentOS: edit /etc/syscon... |
| Static IP configured on Windows NIC inside Guest O | 1 条相关 | Online via Serial Console: netsh interface ip set address Et... |
| Restrictive IPSec policy configured on the Guest O | 1 条相关 | Online (2008/2008R2): netsh nap client set enforcement ID=79... |
| Customer used MSConfig to customize system service | 1 条相关 | Restore to Normal Startup: ONLINE via Serial Console/RunComm... |
| McAfee VirusScan Enterprise software is blocking a | 1 条相关 | ONLINE: 1) Stop/disable McAfee services via sc stop/sc confi... |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Gen2 Trusted Launch VM with Secure Boot hangs in reboot loop - Windows.VmBoot failures lasting 40min... | Race condition / timing issue in the Firmware / HAL layer of guest VM with Trust... | Restart from Azure portal or reboot the VM (issue is intermittent and usually re... | 🔵 7.0 | ADO Wiki |
| 2 | Cannot RDP to Azure VM. No connectivity on VIP/DIP. Guest agent logs show EndpointNotFoundException:... | MAC preservation feature bug: RNM team enabled MAC preservation on subset of sub... | Stop and start the VM to get a new MAC/IP assignment. Alternatively, delete the ... | 🔵 7.0 | ADO Wiki |
| 3 | Cannot RDP to VM. No NIC visible in ipconfig. Only loopback interface in route print. UserPnp Event ... | Ghost/hidden NICs accumulated beyond threshold (~1204). Every MAC address change... | Remove ghost NICs using PowerShell or Device Manager (show hidden devices). For ... | 🔵 7.0 | ADO Wiki |
| 4 | Cannot RDP to Azure VM. netsh advfirewall show allprofiles state returns error 0x45b. Windows Defend... | Duplicate SIDs accumulated in registry HKLM\SYSTEM\ControlSet001\Services\mpssvc... | Create rescue nested VM (Hyper-V). Open regedit, navigate to HKLM\SYSTEM\Control... | 🔵 7.0 | ADO Wiki |
| 5 | Cannot RDP to VM migrated from on-premises (via VHD upload or ASR). No NIC in ipconfig, only loopbac... | The migrated VM was a Hyper-V host. The Hyper-V virtual switch (VMSMP) conflicts... | Do not migrate Hyper-V hosts directly to Azure. Create a new VM with nested virt... | 🔵 7.0 | ADO Wiki |
| 6 | Cannot SSH to Linux VM. No connectivity on VIP/DIP. Console serial log shows different DIP IP than A... | Static IP hardcoded in Linux network configuration file does not match Azure DHC... | Change network config to DHCP. RHEL/CentOS: edit /etc/sysconfig/network-scripts/... | 🔵 7.0 | ADO Wiki |
| 7 | Cannot RDP to Windows VM. WinGuestAnalyzer Health Signal shows EnableDHCP=FALSE on primary NIC. ipco... | Static IP configured on Windows NIC inside Guest OS differs from Azure platform-... | Online via Serial Console: netsh interface ip set address Ethernet dhcp. Or Powe... | 🔵 7.0 | ADO Wiki |
| 8 | Cannot RDP to Windows VM. VM screenshot shows OS at login screen. No connections in Guest OS logs. W... | Restrictive IPSec policy configured on the Guest OS blocking all inbound traffic... | Online (2008/2008R2): netsh nap client set enforcement ID=79619 ADMIN=DISABLE. O... | 🔵 7.0 | ADO Wiki |
| 9 | Cannot RDP/SSH to Azure VM. VM may be stuck booting or have no connectivity. MSConfig was used to di... | Customer used MSConfig to customize system services startup, disabling critical ... | Restore to Normal Startup: ONLINE via Serial Console/RunCommands - re-enable dis... | 🔵 7.0 | ADO Wiki |
| 10 | Cannot RDP to Azure VM. OS is fully loaded at CAD screen. No inbound connections possible. Brief con... | McAfee VirusScan Enterprise software is blocking all inbound connections due to ... | ONLINE: 1) Stop/disable McAfee services via sc stop/sc config start=disabled. 2)... | 🔵 7.0 | ADO Wiki |
| 11 | Cannot RDP to Azure VM. OS loaded and waiting for credentials. No VIP/DIP connectivity. Event ID 704... | Message Queuing (MSMQ) service is taking too long to start or hung, blocking the... | ONLINE: sc config msmq start=demand (set to manual). Check for other services in... | 🔵 7.0 | ADO Wiki |
| 12 | Linux VM deployed with multiple NICs but only primary NIC is visible/up; additional NICs are not con... | Additional NICs are not auto-configured depending on Linux distro: Ubuntu 16.04 ... | Configure additional NIC manually in /etc/network/interfaces.d/50-cloud-init.cfg... | 🔵 7.0 | ADO Wiki |
| 13 | Cannot RDP to Azure VM. OS loaded at CAD screen. Red cross/yellow bang on network card icon or no ic... | Network stack is corrupted - the system cannot properly process the network inte... | ONLINE: Mitigation 1: netsh winhttp reset proxy + powercfg /setactive SCHEME_MIN... | 🔵 7.0 | ADO Wiki |
| 14 | Azure VM Bugcheck 7B. NoBootDeviceCheck: driver Start value NOT BOOT. | Driver Start not 0 (disabled/misconfigured). | Load SYSTEM hive, set Start=0 for the driver, recreate VM. | 🔵 7.0 | ADO Wiki |
| 15 | Password reset fails. VMAccess cannot install/execute. | VM Agent not installed/running/broken. | Check agent in Health Signal. Start via Serial Console. Reinstall if missing. | 🔵 7.0 | ADO Wiki |
| 16 | APIPA address 169.254.x.x. DHCP Client service disabled. | DHCP Client service disabled/broken. | sc config dhcp start=auto; net start dhcp via Serial Console. | 🔵 7.0 | ADO Wiki |
| 17 | Azure VM has no RDP connectivity. VM screenshot shows OS fully loaded at credentials screen. WinHTTP... | WinHttpAutoProxySvc service is not running due to: (1) service set to disabled, ... | OFFLINE: Attach OS disk to rescue VM. Fix 1 (disabled): Enable service via regis... | 🔵 7.0 | ADO Wiki |
| 18 | Azure VM has no RDP connectivity. VM screenshot shows OS at credentials screen. Windows Firewall ser... | Windows Firewall service (MpsSvc) is not running due to: (1) service disabled, (... | OFFLINE: Attach OS disk to rescue VM. Fix 1 (disabled): Enable service via regis... | 🔵 7.0 | ADO Wiki |
| 19 | Azure Windows VM shows BSOD with stop code 0x000000FC (ATTEMPTED_EXECUTE_OF_NOEXECUTE_MEMORY). VM sc... | An attempt was made to execute non-executable memory, typically caused by a faul... | OFFLINE troubleshooting required (guest OS is not operational). Attach OS disk t... | 🔵 7.0 | ADO Wiki |
| 20 | Azure Windows VM screenshot shows an administrative CMD window with title 'Administrator: ERROR HAND... | ErrorHandler.CMD is part of the IaaS provisioning agent that should only run dur... | The image is likely broken. Change support topic to: Product: Azure Virtual Mach... | 🔵 7.0 | ADO Wiki |
| 21 | Azure Windows VM screenshot shows: 'An operating system wasn't found. Try disconnecting any drivers ... | The OS boot process could not locate an active system partition. The system part... | OFFLINE: Attach OS disk to rescue VM. Use diskpart to identify and activate the ... | 🔵 7.0 | ADO Wiki |
| 22 | Azure Windows VM is stuck during boot displaying 'Applying Audit Policy Configuration policy' messag... | Known OS Bug 5880648 - GPO (Group Policy Object) processing deadlock during boot... | ONLINE: Use Run Command or Serial Console to disable the problematic GPO. OFFLIN... | 🔵 7.0 | ADO Wiki |
| 23 | Azure Windows VM is stuck during boot displaying 'Applying computer settings' message. VM does not p... | Known OS Bug 5880648 - GPO processing deadlock during boot. Can also be caused b... | ONLINE: Use Run Command or Serial Console to disable problematic GPO. OFFLINE: A... | 🔵 7.0 | ADO Wiki |
| 24 | Azure VM not booting, stuck at "Applying Group Policy Power Options policy" on boot screenshot. | GPO Power Options policy processing hangs during boot. Root cause depends on mem... | ONLINE troubleshooting: Use hang scenario mitigation template (run command / NMI... | 🔵 7.0 | ADO Wiki |
| 25 | VM screenshot shows BOOTMGR image is corrupt. The system cannot boot. | BCD store is corrupted or inaccessible, usually after an unexpected VM restart c... | Offline troubleshooting: stop/deallocate VM, snapshot OS disk, attach to rescue ... | 🔵 7.0 | ADO Wiki |
| 26 | VM screenshot shows BOOTMGR is missing, Press Ctrl+Alt+Del to restart. | OS boot process could not locate an active system partition. The partition holdi... | Offline troubleshooting: attach OS disk to rescue VM. Use diskpart to set the sy... | 🔵 7.0 | ADO Wiki |
| 27 | VM shows BSOD with stop code MSSECCORE_ASSERTION_FAILURE. | Low disk space on the OS drive causes assertion failures in msseccore. | Create rescue VM using az vm repair create, attach OS disk, increase OS drive si... | 🔵 7.0 | ADO Wiki |
| 28 | VM screenshot shows BitLocker recovery key prompt at boot: Plug in USB driver with BitLocker key, or... | VM unable to locate BitLocker BEK file to decrypt encrypted disk, typically beca... | First try stop/deallocate/start VM to force BEK retrieval from Key Vault (allow ... | 🔵 7.0 | ADO Wiki |
| 29 | VM screenshot shows: Boot failure. Reboot and Select proper Boot device or Insert Boot Media in sele... | BCD store partition is not active, or BCD corruption causing OS unable to locate... | Stop/deallocate/start VM first. If persists, offline troubleshooting: attach OS ... | 🔵 7.0 | ADO Wiki |
| 30 | Windows 10 VM crashes with Bugcheck 0x0000009F DRIVER_POWER_STATE_FAILURE, first parameter is 3. | Code defect in Windows 10 (OS Bug 19651151): Turn off Hard Drives after 20mins f... | Online fix: go to Power Options and set Turn off hard drives after value to 0 (d... | 🔵 7.0 | ADO Wiki |


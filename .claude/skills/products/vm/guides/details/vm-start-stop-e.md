# VM Vm Start Stop E — 综合排查指南

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
| Zonal migration left stale file handles in /var/li | 1 条相关 | Stop waagent (systemctl stop waagent.service), move waagent ... |
| New version of Guest Agent terminated abnormally ( | 3 条相关 | 1. Fix WireServer connectivity (168.63.129.16). 2. Find blac... |
| CNG Key Isolation (KeyIso) Windows service is disa | 2 条相关 | 1. Verify CNG Key Isolation service (KeyIso) status. 2. Star... |
| VMAgentDisabler.dll in C:\Windows\System32\ has th | 1 条相关 | Remove the hidden attribute from VMAgentDisabler.dll: Run el... |
| Highly restrictive network lockdown or proxy filte | 1 条相关 | Coordinate with network/security team to ensure IMDS IP 169.... |
| Guest Agent versions prior to 2.4.0.2 do not suppo | 1 条相关 | Update Guest Agent to version 2.4.0.2 or above: 1. Ensure Au... |
| VMAgentDisabler.dll has the hidden attribute set,  | 1 条相关 | Remove hidden attribute from elevated cmd: attrib -H C:\Wind... |
| Network proxy or restrictive firewall intercepts r | 1 条相关 | Ensure IMDS endpoint 169.254.169.254 is accessible and retur... |
| Python < 3.8 in Rocky Linux 8: get_distro() picks  | 1 条相关 | Remove symlinks: sudo rm /etc/centos-release /etc/redhat-rel... |
| Linux GA < 2.4.0.2 does not support multiconfig re | 1 条相关 | 1. Set AutoUpdate.Enabled=y in /etc/waagent.conf, restart wa... |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | After zonal migration, WALinuxAgent fails to start with 'PermissionError: [Errno 1] Operation not pe... | Zonal migration left stale file handles in /var/lib/waagent/ for extension confi... | Stop waagent (systemctl stop waagent.service), move waagent dir (mv /var/lib/waa... | 🔵 7.0 | ADO Wiki |
| 2 | Linux Guest Agent stuck on old version; waagent --version shows outdated Goal state agent version; w... | New version of Guest Agent terminated abnormally (e.g., WireServer connectivity ... | 1. Fix WireServer connectivity (168.63.129.16). 2. Find blacklisted agent folder... | 🔵 7.0 | ADO Wiki |
| 3 | WaAppAgent.log shows RdCrypt Initialization failed Error Code -2147023143 (0x6d9 EPT_S_NOT_REGISTERE... | CNG Key Isolation (KeyIso) Windows service is disabled or not running, causing R... | 1. Verify CNG Key Isolation service (KeyIso) status. 2. Start the CNG Key Isolat... | 🔵 7.0 | ADO Wiki |
| 4 | RdAgent service (WaAppAgent.exe) fails to start with Error 1067; MonitoringAgent.log shows Access to... | VMAgentDisabler.dll in C:\Windows\System32\ has the hidden attribute set, causin... | Remove the hidden attribute from VMAgentDisabler.dll: Run elevated command promp... | 🔵 7.0 | ADO Wiki |
| 5 | Windows Guest Agent status not reported; WaAppAgent.log shows 'Received the Identity data response, ... | Highly restrictive network lockdown or proxy filtering on the VM prevents IMDS e... | Coordinate with network/security team to ensure IMDS IP 169.254.169.254 is acces... | 🔵 7.0 | ADO Wiki |
| 6 | Linux Guest Agent not ready; waagent.log shows repeated WireServer endpoint not found / WireServer n... | Guest Agent versions prior to 2.4.0.2 do not support multiconfig which Managed R... | Update Guest Agent to version 2.4.0.2 or above: 1. Ensure AutoUpdate.Enabled=y i... | 🔵 7.0 | ADO Wiki |
| 7 | Linux Guest Agent (waagent) stays on old version and does not auto-update; Goal state agent shows ou... | New version of Guest Agent terminated abnormally (e.g. due to WireServer connect... | 1. Fix WireServer connectivity to 168.63.129.16 first. 2. Find blacklisted versi... | 🔵 7.0 | ADO Wiki |
| 8 | RdAgent service fails to start with Error 1067 The process terminated unexpectedly; MonitoringAgent.... | VMAgentDisabler.dll has the hidden attribute set, preventing Guest Agent from lo... | Remove hidden attribute from elevated cmd: attrib -H C:\Windows\System32\VMAgent... | 🔵 7.0 | ADO Wiki |
| 9 | Windows Guest Agent reports environment is OnPrem in WaAppAgent.log; agent status not reported; log ... | Network proxy or restrictive firewall intercepts requests to IMDS endpoint 169.2... | Ensure IMDS endpoint 169.254.169.254 is accessible and returns expected 404 for ... | 🔵 7.0 | ADO Wiki |
| 10 | Rocky Linux 8 VM shows as centos in Azure Portal Operating System; waagent.log shows OS: centos 8.7;... | Python < 3.8 in Rocky Linux 8: get_distro() picks up /etc/centos-release symlink... | Remove symlinks: sudo rm /etc/centos-release /etc/redhat-release, then restart w... | 🔵 7.0 | ADO Wiki |
| 11 | Linux Guest Agent Not Ready with repeated WireServer is not responding and Exceeded max retry updati... | Linux GA < 2.4.0.2 does not support multiconfig required by Managed Run Command ... | 1. Set AutoUpdate.Enabled=y in /etc/waagent.conf, restart waagent. 2. If repo GA... | 🔵 7.0 | ADO Wiki |
| 12 | Azure Linux Guest Agent (waagent) stuck on old version after newer version is blacklisted. waagent -... | New version of Guest Agent terminated abnormally (e.g., WireServer connectivity ... | 1. Fix WireServer connectivity to 168.63.129.16 (see WireServer TSG). 2. Delete ... | 🔵 7.0 | ADO Wiki |
| 13 | Windows Guest Agent fails with RdCrypt Initialization failed Error Code -2147023143 (0x6d9 = EPT_S_N... | CNG Key Isolation (KeyIso) Windows service is disabled or not running, causing R... | 1. Verify CNGKEYISO in RPC endpoints: portqry -n <VMName> -e 135. 2. Start the C... | 🔵 7.0 | ADO Wiki |
| 14 | RdAgent service (WaAppAgent.exe) fails to start with Error 1067: The process terminated unexpectedly... | VMAgentDisabler.dll file in C:\Windows\System32 has the hidden attribute set, pr... | Remove the hidden attribute from VMAgentDisabler.dll: attrib -H C:\Windows\Syste... | 🔵 7.0 | ADO Wiki |
| 15 | Windows Guest Agent shows as Not Ready. WaAppAgent.log shows Received the Identity data response env... | IMDS endpoint 169.254.169.254/Microsoft.Compute/identity returns a non-404 respo... | 1. Test IMDS from within VM: browse http://169.254.169.254/Microsoft.Compute/ide... | 🔵 7.0 | ADO Wiki |
| 16 | Linux Guest Agent Not Ready with repeated WireServer connection loop in waagent.log: WireServer endp... | RunCommandv2 (Managed Run Command / Microsoft.CPlat.Core.RunCommandHandlerLinux)... | 1. Check /etc/waagent.conf: ensure AutoUpdate.Enabled=y. 2. Restart waagent serv... | 🔵 7.0 | ADO Wiki |
| 17 | WindowsAzureGuestAgent service not installed when installing Windows Guest Agent from MSI. Transpare... | sc.exe create command in ServiceHelper.cs has a syntax error (missing spaces aft... | Uninstall Windows Azure VM Agent from Programs and Features. Install .1010 MSI (... | 🔵 7.0 | ADO Wiki |
| 18 | RdAgent or Windows Azure Guest Agent service fails to start with Error 1053: The service did not res... | Third-party firewall or antivirus software (e.g., Symantec Endpoint Protection s... | Create a whitelist/exception in the customer firewall for agent paths: C:\Window... | 🔵 7.0 | ADO Wiki |
| 19 | Windows Guest Agent crashes immediately after starting. ConfigurationErrorsException: system.service... | Third-party BizTalk adapters (Siebel, Oracle DB, SAP) have registered binding ex... | 1) Backup machine.config. 2) Comment out lines containing siebelBinding (and oth... | 🔵 7.0 | ADO Wiki |
| 20 | Linux VM guest agent (waagent) fails with TransportCert.pem is missing. waagent.log shows /usr/bin/o... | The /usr/bin/openssl symlink is broken, pointing to /usr/local/ssl/bin/openssl w... | 1) Unlink broken symlink: sudo unlink /usr/bin/openssl. 2) Reinstall openssl: su... | 🔵 7.0 | ADO Wiki |
| 21 | Linux Guest Agent stuck on old version; waagent --version shows outdated Goal state agent; waagent.l... | New Guest Agent version terminated abnormally (e.g., WireServer 168.63.129.16 co... | 1. Fix WireServer connectivity to 168.63.129.16. 2. Find blacklisted agent folde... | 🔵 7.0 | ADO Wiki |
| 22 | Windows Guest Agent status not reported; WaAppAgent.log shows Received the Identity data response en... | Network proxy or firewall is intercepting/responding to IMDS requests at 169.254... | 1. Verify IMDS access: test http://169.254.169.254/Microsoft.Compute/identity fr... | 🔵 7.0 | ADO Wiki |
| 23 | Linux Guest Agent Not Ready after installing Managed Run Command extension (Microsoft.CPlat.Core.Run... | Linux Guest Agent versions prior to 2.4.0.2 do not support multiconfig required ... | 1. Ensure AutoUpdate.Enabled=y in /etc/waagent.conf, restart agent (systemctl re... | 🔵 7.0 | ADO Wiki |
| 24 | Black screen after RDP on Windows 10 RS3 VM deployed with single CPU (MicrosoftWindowsDesktop.Window... | Known issue with Windows 10 RS3 image: when deployed with only 1 CPU, the OS han... | Resize the VM to a size with 2 or more CPUs. With 2 CPUs the OS will complete in... | 🔵 7.0 | ADO Wiki |
| 25 | Linux VM cannot be reached via SSH; serial console shows only Enter username: prompt due to GRUB sup... | GRUB superuser password protection is enabled (set before VHD upload to Azure or... | Attach OS disk to a rescue Linux VM. Mount at /rescue. Edit /rescue/boot/grub/gr... | 🔵 7.0 | ADO Wiki |
| 26 | Azure VM screenshot shows Windows setup error: The computer restarted unexpectedly or encountered an... | First boot of a generalized (sysprepped) image fails to process the unattended a... | Change support topic to: Product=Azure Virtual Machine Windows, Topic=Cannot cre... | 🔵 7.0 | ADO Wiki |
| 27 | Azure VM screenshot shows: This is not a bootable disk. Please insert a bootable floppy and press an... | The OS boot process could not locate an active system partition - the system par... | Cannot troubleshoot online (Guest OS not operational). Use OFFLINE approach: att... | 🔵 7.0 | ADO Wiki |
| 28 | NFS mount fails with mount.nfs: Remote I/O error | The file share is SMB type, not NFS. Customer is attempting to mount an SMB shar... | Verify the share protocol in Azure Portal or ASC Resource Explorer (Files tab > ... | 🔵 7.0 | ADO Wiki |
| 29 | Azure VM in reboot loop; screenshots show boot process interrupted and restarting; Event ID 7007 Lev... | A third-party service flagged as critical is failing to start, causing OS to res... | Disable autoreboot first to see the actual bug check code/error. OFFLINE: attach... | 🔵 7.0 | ADO Wiki |
| 30 | Azure VM in reboot loop after OS change (KB update, application install, or new policy); or due to f... | OS changes (KB/application installation or policy change) or file system corrupt... | Disable autoreboot to see error. OFFLINE: check Event Logs, CBS.log, WindowsUpda... | 🔵 7.0 | ADO Wiki |


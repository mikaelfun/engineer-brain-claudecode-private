# VM Vm Connectivity Rdp B — 综合排查指南

**条目数**: 30 | **草稿融合数**: 12 | **Kusto 查询融合**: 0
**来源草稿**: [ado-wiki-b-Clone-Disk-PowerShell-RDP-SSH.md](../../guides/drafts/ado-wiki-b-Clone-Disk-PowerShell-RDP-SSH.md), [ado-wiki-b-Collect-Logs-Inspect-IaaS-Disk-RDP-SSH.md](../../guides/drafts/ado-wiki-b-Collect-Logs-Inspect-IaaS-Disk-RDP-SSH.md), [ado-wiki-b-Collect-Procmon-Traces-RDP-SSH.md](../../guides/drafts/ado-wiki-b-Collect-Procmon-Traces-RDP-SSH.md), [ado-wiki-b-Collecting-VHD-RDP-SSH.md](../../guides/drafts/ado-wiki-b-Collecting-VHD-RDP-SSH.md), [ado-wiki-c-identify-thumbprint-of-rdp-listener-cert.md](../../guides/drafts/ado-wiki-c-identify-thumbprint-of-rdp-listener-cert.md), [ado-wiki-c-recreate-rdp-listener.md](../../guides/drafts/ado-wiki-c-recreate-rdp-listener.md), [ado-wiki-d-Connect-Using-Bastion-RDP-SSH.md](../../guides/drafts/ado-wiki-d-Connect-Using-Bastion-RDP-SSH.md), [ado-wiki-d-Query-or-Change-Registry-RDP-SSH.md](../../guides/drafts/ado-wiki-d-Query-or-Change-Registry-RDP-SSH.md), [ado-wiki-f-Registry-Key-References-RDP.md](../../guides/drafts/ado-wiki-f-Registry-Key-References-RDP.md), [ado-wiki-f-Run-RDP-Portrait-Mode.md](../../guides/drafts/ado-wiki-f-Run-RDP-Portrait-Mode.md), [mslearn-rdp-troubleshooting-guide.md](../../guides/drafts/mslearn-rdp-troubleshooting-guide.md), [onenote-enable-local-admin-without-rdp.md](../../guides/drafts/onenote-enable-local-admin-without-rdp.md)
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 2: 排查与诊断
> 来源: MS Learn, ADO Wiki, KB

1. 参照 [ado-wiki-b-Clone-Disk-PowerShell-RDP-SSH.md](../../guides/drafts/ado-wiki-b-Clone-Disk-PowerShell-RDP-SSH.md) 排查流程
2. 参照 [ado-wiki-b-Collect-Logs-Inspect-IaaS-Disk-RDP-SSH.md](../../guides/drafts/ado-wiki-b-Collect-Logs-Inspect-IaaS-Disk-RDP-SSH.md) 排查流程
3. 参照 [ado-wiki-b-Collect-Procmon-Traces-RDP-SSH.md](../../guides/drafts/ado-wiki-b-Collect-Procmon-Traces-RDP-SSH.md) 排查流程
4. 参照 [ado-wiki-b-Collecting-VHD-RDP-SSH.md](../../guides/drafts/ado-wiki-b-Collecting-VHD-RDP-SSH.md) 排查流程
5. 参照 [ado-wiki-c-identify-thumbprint-of-rdp-listener-cert.md](../../guides/drafts/ado-wiki-c-identify-thumbprint-of-rdp-listener-cert.md) 排查流程
6. 参照 [ado-wiki-c-recreate-rdp-listener.md](../../guides/drafts/ado-wiki-c-recreate-rdp-listener.md) 排查流程
7. 参照 [ado-wiki-d-Connect-Using-Bastion-RDP-SSH.md](../../guides/drafts/ado-wiki-d-Connect-Using-Bastion-RDP-SSH.md) 排查流程
8. 参照 [ado-wiki-d-Query-or-Change-Registry-RDP-SSH.md](../../guides/drafts/ado-wiki-d-Query-or-Change-Registry-RDP-SSH.md) 排查流程
9. 参照 [ado-wiki-f-Registry-Key-References-RDP.md](../../guides/drafts/ado-wiki-f-Registry-Key-References-RDP.md) 排查流程
10. 参照 [ado-wiki-f-Run-RDP-Portrait-Mode.md](../../guides/drafts/ado-wiki-f-Run-RDP-Portrait-Mode.md) 排查流程
11. 参照 [mslearn-rdp-troubleshooting-guide.md](../../guides/drafts/mslearn-rdp-troubleshooting-guide.md) 排查流程
12. 参照 [onenote-enable-local-admin-without-rdp.md](../../guides/drafts/onenote-enable-local-admin-without-rdp.md) 排查流程

### Phase 3: 根因判断与解决

**判断逻辑**：

| 条件 | 含义 | 后续动作 |
|------|------|---------|
| GRUB superuser password protection is enabled (set | 1 条相关 | Attach OS disk to a rescue Linux VM. Mount at /rescue. Edit ... |
| The OS boot process could not locate an active sys | 1 条相关 | Cannot troubleshoot online (Guest OS not operational). Use O... |
| BCD (Boot Configuration Data) corruption - missing | 1 条相关 | OFFLINE approach: attach OS disk to rescue VM. Rebuild BCD s... |
| TrustedInstaller (Windows Modules Installer) servi | 1 条相关 | Use online hang scenario troubleshooting: backup OS disk, co... |
| VM BCD configuration has displaybootmenu enabled w | 1 条相关 | Disable BCD displaybootmenu flag. For CRP machines: set disp... |
| During KB installation or rollback, OS needs time  | 1 条相关 | Wait for update to complete (can take hours). If stuck in lo... |
| CloudLink encryption uses a Linux-based machine to | 1 条相关 | Engage CloudLink support to troubleshoot key retrieval. If B... |
| Lack of permissions for users to read the certific | 1 条相关 | Grant READ access to 'Remote Desktop Users' group on registr... |
| MTU size is set incorrectly on the on-premises fir | 1 条相关 | Update MTU size on on-premises firewall. Or change locally o... |
| Winlogon cannot complete logon and policy processi | 1 条相关 | Collect a memory dump while the VM is in the failing state a... |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Linux VM cannot be reached via SSH; serial console shows only Enter username: prompt due to GRUB sup... | GRUB superuser password protection is enabled (set before VHD upload to Azure or... | Attach OS disk to a rescue Linux VM. Mount at /rescue. Edit /rescue/boot/grub/gr... | 🟢 8.0 | ADO Wiki |
| 2 | Azure VM screenshot shows: This is not a bootable disk. Please insert a bootable floppy and press an... | The OS boot process could not locate an active system partition - the system par... | Cannot troubleshoot online (Guest OS not operational). Use OFFLINE approach: att... | 🟢 8.0 | ADO Wiki |
| 3 | Azure VM shows This is not a bootable disk error due to BCD corruption with missing reference to Win... | BCD (Boot Configuration Data) corruption - missing reference in the BCD store to... | OFFLINE approach: attach OS disk to rescue VM. Rebuild BCD store using standard ... | 🟢 8.0 | ADO Wiki |
| 4 | Azure VM screenshot shows 'Please wait for the TrustedInstaller' - OS hangs waiting for TrustedInsta... | TrustedInstaller (Windows Modules Installer) service is stuck during boot, typic... | Use online hang scenario troubleshooting: backup OS disk, collect memory dump vi... | 🟢 8.0 | ADO Wiki |
| 5 | Azure VM screenshot shows Windows Boot Manager menu waiting for user input to select boot partition ... | VM BCD configuration has displaybootmenu enabled with a boot delay, causing VM t... | Disable BCD displaybootmenu flag. For CRP machines: set displaybootmenu to 'no' ... | 🟢 8.0 | ADO Wiki |
| 6 | Azure VM screenshot shows Windows Update in progress ('Working on updates ##% complete') or revertin... | During KB installation or rollback, OS needs time to process updates. Large numb... | Wait for update to complete (can take hours). If stuck in loop: offline troubles... | 🟢 8.0 | ADO Wiki |
| 7 | Windows VM screenshot shows Linux/Grub boot process instead of Windows boot - the VM is encrypted wi... | CloudLink encryption uses a Linux-based machine to manage encryption keys. If th... | Engage CloudLink support to troubleshoot key retrieval. If Bitlocker team involv... | 🟢 8.0 | ADO Wiki |
| 8 | RDP to Windows 2008 R2 VM returns 'Access is denied' during authentication, but administrative sessi... | Lack of permissions for users to read the certificate registry entries on termin... | Grant READ access to 'Remote Desktop Users' group on registry key HKLM:\SOFTWARE... | 🟢 8.0 | ADO Wiki |
| 9 | RDP via site-to-site VPN/VNET from on-premises shows black screen after authentication, disconnects ... | MTU size is set incorrectly on the on-premises firewall, causing packets larger ... | Update MTU size on on-premises firewall. Or change locally on VM: netsh interfac... | 🟢 8.0 | ADO Wiki |
| 10 | Black screen after entering RDP credentials; user profile does not finish loading; VM has network co... | Winlogon cannot complete logon and policy processing; a process or thread is dea... | Collect a memory dump while the VM is in the failing state and analyze it to ide... | 🟢 8.0 | ADO Wiki |
| 11 | Black screen on both VM console screenshot and RDP session; Desktop Window Manager (dwm.exe) crashes... | OS file corruption affecting the GUI subsystem, specifically dwm.exe; related to... | Apply KB3137061 fix. For file corruption, run SFC /scannow and DISM /online /cle... | 🟢 8.0 | ADO Wiki |
| 12 | RDP shows black screen then disconnects; VM is under brute force RDP attack causing performance degr... | Brute force RDP attack over the internet causing CPU/memory performance spike, e... | Enable Azure NSG rules to restrict RDP access to known IP ranges; enable JIT VM ... | 🟢 8.0 | ADO Wiki |
| 13 | RDP shows black screen then disconnects; explorer.exe crashes with Application Error Event ID 1000 (... | Explorer.exe process crashes due to TwinUI.dll fault, preventing the desktop she... | Run SFC /scannow and DISM /online /cleanup-image /restorehealth to repair the co... | 🟢 8.0 | ADO Wiki |
| 14 | After entering RDP credentials, Windows GUI does not load and only an administrator CMD window appea... | .NET Framework was removed from the Windows Server system, typically through the... | Reinstall .NET Framework using Server Manager or DISM. See 'Removing .NET Framew... | 🟢 8.0 | ADO Wiki |
| 15 | RDP connection hangs on 'Configuring remote session' when connecting to Azure VM; OS is fully loaded... | The server is unable to reach the RD license server or the license server inform... | Configure RD Licensing on the server: ONLINE via Serial Console using RD License... | 🟢 8.0 | ADO Wiki |
| 16 | RDP connection fails using MSTSC or MSRDC client older than version 1.2.675; errors include 'Somethi... | All connections from old legacy RDP clients (MSTSC and MSRDC older than 1.2.675)... | Update to the latest Windows Desktop Remote Desktop client (MSRDC version 1.2.67... | 🟢 8.0 | ADO Wiki |
| 17 | Cannot RDP to Azure VM with generic 'Remote Desktop cannot connect' three-reasons error; PSPING resp... | Remote Desktop Services connection was disabled on the machine by the customer | Re-enable Remote Desktop Services connection: ONLINE via Serial Console using TS... | 🟢 8.0 | ADO Wiki |
| 18 | RDP fails with 'Because of an error in data encryption, this session will end. Please try connecting... | Incorrect SecurityLayer and UserAuthentication registry values; encryption level... | 1) Temporarily disable NLA: set UserAuthentication=0 via Serial Console or Run C... | 🟢 8.0 | ADO Wiki |
| 19 | RDP fails with three-reasons error on VM with Citrix XenApp 6.x/7.x installed or recently uninstalle... | Citrix XenApp 6.x/7.x RDS VDA modifies RDP listener LoadableProtocol_Object regi... | Restore LoadableProtocol_Object registry to original GUID: for Server 2008 R2 us... | 🟢 8.0 | ADO Wiki |
| 20 | Azure systems fail to boot with a 0x1E KMODE_EXCEPTION_NOT_HANDLED bugcheck. The bugcheck is almost ... | This is a Spectre/Meltdown mitigation related issue that is mitigated in current... | Action plan: Change registry value to allow system to boot so current patch leve... | 🔵 7.5 | KB |
| 21 | RDP connection fails with error: Remote Desktop can't find the computer. DNS resolution failure or i... | The Remote Desktop client cannot resolve the VM's DNS name. Common when using lo... | Use the RDP file generated from Azure portal (contains correct FQDN and endpoint... | 🔵 7.0 | MS Learn |
| 22 | RDP error: Your credentials did not work. Occurs after promoting VM to domain controller or when usi... | After promoting VM to DC in a new AD forest, the local admin account is deleted ... | For local accounts use ComputerName\UserName. For domain accounts use DomainName... | 🔵 7.0 | MS Learn |
| 23 | RDP error: This computer can't connect to the remote computer. User account does not have Remote Des... | The account used to RDP is not a member of the Remote Desktop Users local group ... | Add the user to the Remote Desktop Users local group via MMC snap-in. As workaro... | 🔵 7.0 | MS Learn |
| 24 | VMAccess extension (enablevmAccess) fails with error: VMAccess Extension does not support Domain Con... | The VMAccessAgent extension explicitly does not support VMs configured as domain... | Do not use VMAccess extension on domain controllers. For password reset on DC, u... | 🔵 7.0 | MS Learn |
| 25 | RDP connection error: You must change your password before logging on the first time. Cannot log in ... | The user account has the 'User must change password at next logon' flag set. RDP... | If VM agent is running: use Run Command to reset password via 'net user <USERNAM... | 🔵 7.0 | MS Learn |
| 26 | Cannot RDP to Azure VM; massive Event 4625 failed logons every second. Session ends unexpectedly. Wo... | Brute force attack on RDP port 3389 consuming service resources. | Enable JIT access. Use Azure Bastion or VPN Gateway. Restrict NSG to specific IP... | 🔵 7.0 | MS Learn |
| 27 | RDP times out or refused due to NSG misconfiguration. Works from one IP but not another. | NSG blocking port 3389: no allow rule, priority conflict, subnet/NIC conflict, s... | Use Network Watcher IP Flow Verify. Check effective security rules. Add Allow fo... | 🔵 7.0 | MS Learn |
| 28 | RDP internal error: An internal error has occurred. Connection stuck at Configuring Remote. | MachineKeys permission corruption, TLS disabled, RDP certificate corrupted/expir... | Check NSG. Verify port 3389 used by Termservice. Renew RDP cert. Reset MachineKe... | 🔵 7.0 | MS Learn |
| 29 | RDP login fails with Access is denied. Can connect via mstsc /admin but normal RDP denied. | Certificate registry key permission missing for Remote Desktop Users; user profi... | Grant Read on certificate key. Set IgnoreRegUserConfigErrors=1. Set MaxTokenSize... | 🔵 7.0 | MS Learn |
| 30 | RDP fails when Remote Desktop Connection Broker role is installed. Event 2056 (SessionBroker) or Eve... | The hostname of the Remote Desktop Connection Broker server was changed after fa... | Reinstall the Remote Desktop Connection Broker role and the Windows Internal Dat... | 🔵 7.0 | MS Learn |


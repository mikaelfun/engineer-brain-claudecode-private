# VM Vm Connectivity Rdp A — 综合排查指南

**条目数**: 30 | **草稿融合数**: 12 | **Kusto 查询融合**: 0
**来源草稿**: [ado-wiki-b-Clone-Disk-PowerShell-RDP-SSH.md](../../guides/drafts/ado-wiki-b-Clone-Disk-PowerShell-RDP-SSH.md), [ado-wiki-b-Collect-Logs-Inspect-IaaS-Disk-RDP-SSH.md](../../guides/drafts/ado-wiki-b-Collect-Logs-Inspect-IaaS-Disk-RDP-SSH.md), [ado-wiki-b-Collect-Procmon-Traces-RDP-SSH.md](../../guides/drafts/ado-wiki-b-Collect-Procmon-Traces-RDP-SSH.md), [ado-wiki-b-Collecting-VHD-RDP-SSH.md](../../guides/drafts/ado-wiki-b-Collecting-VHD-RDP-SSH.md), [ado-wiki-c-identify-thumbprint-of-rdp-listener-cert.md](../../guides/drafts/ado-wiki-c-identify-thumbprint-of-rdp-listener-cert.md), [ado-wiki-c-recreate-rdp-listener.md](../../guides/drafts/ado-wiki-c-recreate-rdp-listener.md), [ado-wiki-d-Connect-Using-Bastion-RDP-SSH.md](../../guides/drafts/ado-wiki-d-Connect-Using-Bastion-RDP-SSH.md), [ado-wiki-d-Query-or-Change-Registry-RDP-SSH.md](../../guides/drafts/ado-wiki-d-Query-or-Change-Registry-RDP-SSH.md), [ado-wiki-f-Registry-Key-References-RDP.md](../../guides/drafts/ado-wiki-f-Registry-Key-References-RDP.md), [ado-wiki-f-Run-RDP-Portrait-Mode.md](../../guides/drafts/ado-wiki-f-Run-RDP-Portrait-Mode.md), [mslearn-rdp-troubleshooting-guide.md](../../guides/drafts/mslearn-rdp-troubleshooting-guide.md), [onenote-enable-local-admin-without-rdp.md](../../guides/drafts/onenote-enable-local-admin-without-rdp.md)
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 2: 排查与诊断
> 来源: ADO Wiki

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
| NSG 规则开放了 RDP 端口（3389），且 Source IP 为通配符（*），任意互联网 I | 1 条相关 | 将 NSG 规则的 RDP 来源 IP 限制为本地公网 IP（非 *）；或启用 Just-In-Time (JIT) V... |
| Microsoft does not support resetting passwords on  | 2 条相关 | Use Domain Controller password reset procedure instead. See:... |
| VMAccess does not support password reset on Domain | 1 条相关 | Use Domain Controller-specific password reset procedure. See... |
| MSI-based authentication from Serial Console/Cloud | 1 条相关 | Run handle commands from a local machine or Azure VM with pr... |
| AIB proxy VM receives traffic from two sources on  | 1 条相关 | Add two NSG inbound rules before the DenyAll rule: (1) TCP 6... |
| Recent OS configuration changes corrupted the curr | 1 条相关 | Attach OS disk to rescue VM as data disk. Load the SYSTEM hi... |
| Misconfigured User Defined Routes (UDR) causing ne | 1 条相关 | Check UDR via ASC Resource Explorer -> VM -> Virtual Network... |
| The computer account trust relationship with the A | 1 条相关 | Rejoin the VM to the domain using Custom Script Extension (n... |
| The secure channel between the VM computer account | 1 条相关 | Rejoin VM to domain using: (1) CustomScriptExtension with ne... |
| Bug in ISC state transition in 2022 10B servicing  | 1 条相关 | Uninstall the problematic October 2022 Windows Update (KB501... |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | VM 可能遭受 RDP 暴力破解攻击（VM potentially under attack via internet-exposed RDP） | NSG 规则开放了 RDP 端口（3389），且 Source IP 为通配符（*），任意互联网 IP 均可连接，攻击者可暴力破解后横向移动 | 将 NSG 规则的 RDP 来源 IP 限制为本地公网 IP（非 *）；或启用 Just-In-Time (JIT) VM Access 替代开放 RDP 端口 | 🔵 7.0 | ADO Wiki |
| 2 | VMAccess Extension fails with 'VMAccess Extension does not support Domain Controller' when trying to... | Microsoft does not support resetting passwords on Domain Controllers via VMAcces... | Use Domain Controller password reset procedure instead. See: https://learn.micro... | 🔵 7.0 | ADO Wiki |
| 3 | VMAccess extension fails with 'VMAccess Extension does not support Domain Controller' when attemptin... | VMAccess does not support password reset on Domain Controller VMs | Use Domain Controller-specific password reset procedure. See wiki VM-Password-Re... | 🔵 7.0 | ADO Wiki |
| 4 | VMAccess extension fails with 'VMAccess Extension does not support Domain Controller' | Microsoft does not support resetting passwords on Domain Controllers via VMAcces... | Follow DC password reset procedure instead of VMAccess. Public doc: https://lear... | 🔵 7.0 | ADO Wiki |
| 5 | Get-AzStorageFileHandle returns 403 AuthorizationFailure when running from Azure Serial Console or C... | MSI-based authentication from Serial Console/Cloud Shell uses managed identity t... | Run handle commands from a local machine or Azure VM with proper interactive Con... | 🔵 7.0 | ADO Wiki |
| 6 | AIB build with custom VNET fails after ~30 minutes with connection timeout. Windows: WinRM proxyconn... | AIB proxy VM receives traffic from two sources on ports 60000-60001: Azure Load ... | Add two NSG inbound rules before the DenyAll rule: (1) TCP 60000-60001 from Azur... | 🔵 7.0 | ADO Wiki |
| 7 | Azure Windows VM fails to boot after post-installation changes or system configuration modifications... | Recent OS configuration changes corrupted the current ControlSet, preventing the... | Attach OS disk to rescue VM as data disk. Load the SYSTEM hive: reg load HKLM\BR... | 🔵 7.0 | ADO Wiki |
| 8 | VM connectivity degraded: slow connection, random disconnections, black screen over RDP, or VM compl... | Misconfigured User Defined Routes (UDR) causing network loops, or traffic routed... | Check UDR via ASC Resource Explorer -> VM -> Virtual Network -> Subnet -> Route ... | 🔵 7.0 | ADO Wiki |
| 9 | Cannot access Azure VM remotely because the trusted communication between the VM and the Active Dire... | The computer account trust relationship with the AD domain has been broken, prev... | Rejoin the VM to the domain using Custom Script Extension (netdom remove + netdo... | 🔵 7.0 | ADO Wiki |
| 10 | Cannot access Azure VM remotely. Trusted communication between VM and Active Directory domain is bro... | The secure channel between the VM computer account and the AD domain controller ... | Rejoin VM to domain using: (1) CustomScriptExtension with netdom remove/join, (2... | 🔵 7.0 | ADO Wiki |
| 11 | TLS/SSL connection handshakes fail with SEC_E_ILLEGAL_MESSAGE after installing October 2022 Windows ... | Bug in ISC state transition in 2022 10B servicing branch - code fails to check i... | Uninstall the problematic October 2022 Windows Update (KB5018427/KB5018418/KB501... | 🔵 7.0 | ADO Wiki |
| 12 | Cannot RDP to Windows VM. VM screenshot shows OS at login screen. No inbound/outbound network traffi... | Guest OS firewall RDP rule (Remote Desktop TCP-In) is disabled or not configured... | Online: Enable the RDP firewall rule via Serial Console: netsh advfirewall firew... | 🔵 7.0 | ADO Wiki |
| 13 | Cannot RDP to Windows VM. All inbound connections blocked. VM screenshot shows OS at login. No conne... | One or more Guest OS firewall profiles (Domain/Private/Public) configured with B... | Online via Serial Console: netsh advfirewall set allprofiles state off (temporar... | 🔵 7.0 | ADO Wiki |
| 14 | Cannot RDP/SSH to Azure VM. OS is fully loaded at CAD screen but VM is unreachable. ASC Stateful Tes... | NSG security rules are blocking inbound RDP/SSH traffic. Either no Allow rule ex... | For standard NSG: Review Effective Security Rules and add/modify a customer-defi... | 🔵 7.0 | ADO Wiki |
| 15 | Cannot RDP to Azure VM that belongs to Microsoft Corp Domain (internal MSFT employee). OS is fully l... | AD Group Policy is blocking all connections except from specific network subnets... | Verify AD policy by checking registry keys under HKLM\SOFTWARE\Policies\Microsof... | 🔵 7.0 | ADO Wiki |
| 16 | Cannot RDP to Azure VM after configuring multiple IPs per NIC feature. Guest OS NIC set to static IP... | The primary IP for the primary NIC has a mismatched IP address between the Azure... | Re-enable DHCP on the primary NIC in the Guest OS. Azure VMs require DHCP mode f... | 🔵 7.0 | ADO Wiki |
| 17 | Cannot RDP to Azure VM. NIC is disabled in Guest OS. Event ID 6 shows Miniport NIC is halting. WaApp... | The network interface card (NIC) was manually disabled in the Guest OS, removing... | ONLINE via Serial Console: 1) netsh interface show interface (verify NIC is Disa... | 🔵 7.0 | ADO Wiki |
| 18 | Cannot RDP with local account despite correct password. | Wrong auth context format (dot-backslash or bare username). | Use backslash-username, DOMAIN-backslash-username, IP-backslash-username, or use... | 🔵 7.0 | ADO Wiki |
| 19 | Built-in admin disabled per WinGuestAnalyzer Health Signal. | Admin disabled by GPO or manual action. | VMAccess or Portal Reset Password. Or EnableAdminAccount Run Command. | 🔵 7.0 | ADO Wiki |
| 20 | Cannot SSH into Azure Linux VM, connection times out. No connectivity on VIP or DIP verified with VM... | UFW (Uncomplicated Firewall) is the guest OS firewall on the Linux VM and does n... | Connect via Serial Console or Run Command. Allow SSH: 'sudo ufw allow 22/tcp' or... | 🔵 7.0 | ADO Wiki |
| 21 | Azure Windows VM is stuck during boot displaying 'Applying Group Policy Environment policy' message.... | Group Policy Environment policy processing hang during boot. Specific root cause... | ONLINE only (OFFLINE not possible - scenario needs in-state analysis). Use Seria... | 🔵 7.0 | ADO Wiki |
| 22 | Azure VM crashes with bugcheck 0x000000D1 (DRIVER_IRQL_NOT_LESS_OR_EQUAL) after applying July (07B) ... | Regression caused by MSRC case 44653 shipped in July 07B patches. | Uninstall the problematic July 07B security update via rescue VM (OSDisk Swap AP... | 🔵 7.0 | ADO Wiki |
| 23 | Azure VM crashes with bugcheck 0x000000D1 (DRIVER_IRQL_NOT_LESS_OR_EQUAL). VM screenshot shows DRIVE... | A driver accessed pageable memory at too high IRQL. Depends on dump analysis to ... | If screenshot shows "What failed: myfault.sys", the crash was intentional via No... | 🔵 7.0 | ADO Wiki |
| 24 | Azure VM displays "A disk read error occurred" - boot partition deactivated | The partition holding the boot configuration data (BCD) is not set as active, so... | Offline fix: attach OS disk to rescue VM, open diskpart, select the BCD/boot par... | 🔵 7.0 | ADO Wiki |
| 25 | Azure VM fails to boot with error 0xC0000605 "A component of the operating system has expired" - Win... | The VM was built from a Windows Server preview/trial image (not RTM). Preview im... | This cannot be mitigated. The customer must delete the VM (keep disks), mount th... | 🔵 7.0 | ADO Wiki |
| 26 | Azure VM screenshot shows 'Please wait for the Group Policy Client' - OS hangs waiting for Group Pol... | Windows is processing and applying Group Policies. Many or complex policies can ... | Wait up to 1 hour for Group Policy processing to complete. If VM is still stuck ... | 🔵 7.0 | ADO Wiki |
| 27 | Azure VM screenshot shows 'Please wait for the TrustedInstaller' - OS hangs waiting for TrustedInsta... | TrustedInstaller (Windows Modules Installer) service is stuck during boot, typic... | Use online hang scenario troubleshooting: backup OS disk, collect memory dump vi... | 🔵 7.0 | ADO Wiki |
| 28 | RDP shows black screen then disconnects; explorer.exe crashes with Application Error Event ID 1000 (... | Explorer.exe process crashes due to TwinUI.dll fault, preventing the desktop she... | Run SFC /scannow and DISM /online /cleanup-image /restorehealth to repair the co... | 🔵 7.0 | ADO Wiki |
| 29 | Azure VM screenshot shows OS shutdown with Stopping services message; VM stuck and unresponsive to R... | Windows shutdown process performing system maintenance (binary updates, role/fea... | Check STOP_PENDING services: Get-Service / Where-Object {$_.Status -eq 'STOP_PEN... | 🔵 7.0 | ADO Wiki |
| 30 | RDP fails with 'The connection was denied because the user account is not authorized for remote logi... | The user trying to login via RDP is not a member of the local Remote Desktop Use... | Add the user to Remote Desktop Users group: run net localgroup remote desktop us... | 🔵 7.0 | ADO Wiki |


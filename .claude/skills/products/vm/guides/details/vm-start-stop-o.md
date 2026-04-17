# VM Vm Start Stop O — 综合排查指南

**条目数**: 30 | **草稿融合数**: 3 | **Kusto 查询融合**: 0
**来源草稿**: [ado-wiki-f-startbuild-fail-avdimage-languagepack.md](../../guides/drafts/ado-wiki-f-startbuild-fail-avdimage-languagepack.md), [mslearn-start-vm-last-known-good.md](../../guides/drafts/mslearn-start-vm-last-known-good.md), [onenote-script-vm-restart-events.md](../../guides/drafts/onenote-script-vm-restart-events.md)
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 2: 排查与诊断
> 来源: MS Learn, ADO Wiki, KB

1. 参照 [ado-wiki-f-startbuild-fail-avdimage-languagepack.md](../../guides/drafts/ado-wiki-f-startbuild-fail-avdimage-languagepack.md) 排查流程
2. 参照 [mslearn-start-vm-last-known-good.md](../../guides/drafts/mslearn-start-vm-last-known-good.md) 排查流程
3. 参照 [onenote-script-vm-restart-events.md](../../guides/drafts/onenote-script-vm-restart-events.md) 排查流程

### Phase 3: 根因判断与解决

**判断逻辑**：

| 条件 | 含义 | 后续动作 |
|------|------|---------|
| Desktop Window Manager (dwm.exe) fails to start wi | 1 条相关 | Check Group Policy applied to the VMs for settings affecting... |
| Another application or service has bound to RDP po | 1 条相关 | Run 'netstat -anob' to identify the process listening on por... |
| The user trying to login via RDP is not a member o | 1 条相关 | Add the user to Remote Desktop Users group: run net localgro... |
| DNS Client (DNSCache) service is not running due t | 1 条相关 | Diagnose via sc query DNSCACHE: if disabled set sc config DN... |
| Expired Dynamics AX trial license causing the syst | 1 条相关 | Transfer the entire case to the Dynamics AX queue. Update ca... |
| Citrix injects the binary TWI3.dll into the winlog | 1 条相关 | Update or remove the faulty Citrix TWI3.dll. If Citrix is no... |
| Citrix Profile Management deletes some registry ke | 1 条相关 | Update Citrix XenApp/XenDesktop to patched version. Ref: Cit... |
| Configuration of the port to be used by VMM server | 1 条相关 | Run the command below on the hyper-V node to remove the winr... |
| This can happen when the VMM Cluster was upgraded  | 1 条相关 | To resolve the issue, be sure all nodes of the VMM Cluster a... |
| The issue is caused due to a recently discovered b | 1 条相关 | Currently there are two methods to mitigate the issue. Metho... |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Black screen after RDP on domain-joined VMs; boot diagnostic shows spinning circle; dwm.exe crashes ... | Desktop Window Manager (dwm.exe) fails to start with error 0xc0000142 on domain-... | Check Group Policy applied to the VMs for settings affecting DWM or desktop comp... | 🟢 8.0 | ADO Wiki |
| 2 | RDP error 'Because of a protocol error detected at the client (code 0x1104), this session will be di... | Another application or service has bound to RDP port 3389 instead of Terminal Se... | Run 'netstat -anob' to identify the process listening on port 3389. Either stop ... | 🟢 8.0 | ADO Wiki |
| 3 | RDP fails with 'The connection was denied because the user account is not authorized for remote logi... | The user trying to login via RDP is not a member of the local Remote Desktop Use... | Add the user to Remote Desktop Users group: run net localgroup remote desktop us... | 🟢 8.0 | ADO Wiki |
| 4 | Azure VM OS fully loaded but cannot connect; DNS Client (DNSCache) service not running; Event ID 702... | DNS Client (DNSCache) service is not running due to: service disabled, crashing/... | Diagnose via sc query DNSCACHE: if disabled set sc config DNSCACHE start=auto an... | 🟢 8.0 | ADO Wiki |
| 5 | Azure IaaS VM reboots every hour; user can log in after reboot; Guest OS Event logs show Dynamics, I... | Expired Dynamics AX trial license causing the system to automatically reboot eve... | Transfer the entire case to the Dynamics AX queue. Update case Product to Dynami... | 🟢 8.0 | ADO Wiki |
| 6 | Winlogon crashes after entering credentials when RDPing to Azure VM with Citrix installed; Event 400... | Citrix injects the binary TWI3.dll into the winlogon process; a faulty version o... | Update or remove the faulty Citrix TWI3.dll. If Citrix is no longer needed, full... | 🟢 8.0 | ADO Wiki |
| 7 | Black screen after RDP login to Azure VM with Citrix XenApp/XenDesktop 7.15 LTSR CU2 or 7.17 VDA wit... | Citrix Profile Management deletes some registry keys after session logoff causin... | Update Citrix XenApp/XenDesktop to patched version. Ref: Citrix CTX235100. As wo... | 🟢 8.0 | ADO Wiki |
| 8 | SCVMM configures whether to use Winrm over http or https during the installation of the VMM Server. ... | Configuration of the port to be used by VMM server to contact the Hyper-v nodes ... | Run the command below on the hyper-V node to remove the winrm listener on HTTPS:... | 🔵 7.5 | KB |
| 9 | When attempting to add an S2D (Storage Spaces Direct) or SOFS (Scale Out File Server) Cluster to the... | This can happen when the VMM Cluster was upgraded from an earlier version of Win... | To resolve the issue, be sure all nodes of the VMM Cluster are up using the foll... | 🔵 7.5 | KB |
| 10 | Windows 2012 R2 VMs may experience poor performance if the VM is storage stack is in emulated mode. ... | The issue is caused due to a recently discovered bug in Windows which is exposed... | Currently there are two methods to mitigate the issue. Method:1 Using Device Man... | 🔵 7.5 | KB |
| 11 | The vm deployment failed for specific site. It used to fail at Install VM components stage with belo... | This can happen if the 443 is bound to other application certificate. In my case... | In log we found that deployment is failed with this hex code 0x80072F0D That cod... | 🔵 7.5 | KB |
| 12 | When trying to view VM Screenshot in Boot Diagnostics, the following error might happen Failed to ge... | There can be multiple causes to this issue: Virtual Machines with Operating Syst... | Depending on the cause, you can try: Virtual Machines with Operating System Wind... | 🔵 7.5 | KB |
| 13 | When trying to connect the VM network to VM in VMM 2012 R2 UR14 it fails with below error Error (127... | Not sure what has the cause but looks WMI got corrupted. Tried uninstalling the ... | Put the host in to maintenance mode in VMM Login to hyper v host From an admin c... | 🔵 7.5 | KB |
| 14 | Enable the debug logs by following this article https://supportability.visualstudio.com/AzureAD/_wik... | This issue is caused because the metadata sends the location name as IndiaCentra... | This issue is fixed in the Plugin release 1.0.011360001 to install this plugin p... | 🔵 7.5 | KB |
| 15 | Purpose of this internal content is to present solution to how to:How to increase quota of a VHDXHow... | E.g. after having configured User Profile Disk, it is not possible to change quo... | For the 2 actions below the user must have signed out otherwise the VHDX won't b... | 🔵 7.5 | KB |
| 16 | Windows Update fails on Azure VM with servicing stack corruption errors such as 0x80073712 (ERROR_SX... | Internal corruption in the Windows servicing stack responsible for managing upda... | Perform in-place upgrade (IPU) of Windows Server within the Azure VM: 1) Back up... | 🔵 7.0 | MS Learn |
| 17 | Error "Hyper-V cannot be installed because virtualization support is not enabled in the BIOS" when t... | Trusted Launch VMs do not support nested virtualization. The hypervisor is not e... | 1) Change VM security type to Standard (not Trusted Launch). 2) If hypervisor no... | 🔵 7.0 | MS Learn |
| 18 | Azure VM OS disk encrypted with ADE (Azure Disk Encryption) appears locked with a lock icon when att... | Azure Disk Encryption (ADE/BitLocker) is enabled on the OS disk. The disk remain... | For ADE v2 (single-pass) managed disk: use az vm repair create --unlock-encrypte... | 🔵 7.0 | MS Learn |
| 19 | VM availability metric continues to show Available (value=1) during VM restart — Azure Monitor Metri... | A 15-second delay in the monitoring service gathering health status, plus up to ... | Wait at least 3 minutes and 15 seconds after observing Available status before t... | 🔵 7.0 | MS Learn |
| 20 | Azure VM is stuck in Failed state in the Azure portal — VM status shows Failed and cannot be changed | The last operation run on the VM failed after its input was accepted, leaving th... | Run the Reapply command: Portal: VM > Support + troubleshooting > Redeploy + rea... | 🔵 7.0 | MS Learn |
| 21 | Receive alert VM is unavailable for 15 minutes in Azure Resource Health or Activity Log after VM sto... | Platform sends unavailability notification when VM is deleted, stopped, dealloca... | This is expected behavior in most cases. Check if the operation was user-initiat... | 🔵 7.0 | MS Learn |
| 22 | RDP authentication error: The Local Security Authority cannot be contacted. User provides credential... | VM cannot locate the security authority specified in username. The domain contro... | For local accounts use ComputerName\UserName format. For domain accounts verify ... | 🔵 7.0 | MS Learn |
| 23 | Cannot RDP to Azure Windows VM after disabling the default NIC or manually setting a static IP addre... | Disabling the NIC or setting an incorrect static IP breaks network connectivity.... | Use Azure portal/PowerShell/CLI to reset NIC: change Private IP to Static with a... | 🔵 7.0 | MS Learn |
| 24 | Multiple ghost Mellanox/Hyper-V network adapters appear after Azure VM deallocation (stop/start). Ca... | By design with Accelerated Networking: VM moves to new physical host with differ... | Detect via RunCommand script. Clean up via Device Manager (View > Show hidden de... | 🔵 7.0 | MS Learn |
| 25 | RDP fails with CredSSP encryption oracle remediation error: The function requested is not supported. | CredSSP update CVE-2018-0886 installed on one side but not the other. Encryption... | Install CredSSP update on both sides. Workaround: REG ADD AllowEncryptionOracle=... | 🔵 7.0 | MS Learn |
| 26 | Azure Windows VM with multiple IPs loses Internet after configuring secondary IP addresses. | Windows selects lowest numerical IP as primary regardless of Azure portal. Only ... | PowerShell: Set-NetIPAddress -IPAddress primaryIP -SkipAsSource false; Set-NetIP... | 🔵 7.0 | MS Learn |
| 27 | Azure VM RDP fails; Netlogon service hung (Event 7022), dependency failure (Event 7001), or terminat... | Netlogon disabled, hung, or Workstation service dependency failed. | Serial Console: sc query/start Netlogon. If disabled: sc config NETLOGON start=a... | 🔵 7.0 | MS Learn |
| 28 | Azure VM network connectivity lost; NSI service hung (Event 7022), dependency failure (Event 7001), ... | NSI service disabled, hung, or account mismatch. Core networking service failure... | Serial Console: sc query/start NSI. If disabled: sc config NSI start=auto. Fix d... | 🔵 7.0 | MS Learn |
| 29 | TermService not starting on Azure VM. Event 7022: Remote Desktop Services hung on starting. | TermService stopped/disabled/crashing. Causes: service Disabled, Access Denied, ... | sc query TermService. Disabled -> start= demand; Access Denied -> ProcMon; Logon... | 🔵 7.0 | MS Learn |
| 30 | RDP disconnects frequently/intermittently. Initial connection succeeds then drops. | RDP Listener misconfigured, typically on custom image VMs. Security/encryption/k... | Reset RDP listener: SecurityLayer=0, MinEncryptionLevel=1, KeepAliveTimeout=1, f... | 🔵 7.0 | MS Learn |


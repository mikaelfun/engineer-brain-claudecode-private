# VM Vm Start Stop B — 综合排查指南

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
| Azure Files does not support direct conversion bet | 1 条相关 | Create a new file share in the desired tier, then manually c... |
| (1) The SYSTEM account does not have the 'Shut dow | 1 条相关 | 1) Verify SYSTEM account has 'Shut down the system' privileg... |
| The fixEmulatedIO extension was deployed by Micros | 3 条相关 | Remove via PowerShell: Get-AzVMExtension -ResourceGroupName ... |
| 1) The SYSTEM account does not have the required ' | 1 条相关 | 1) Verify SYSTEM account has 'Shut down the system' privileg... |
| This is by-design behavior. The EnableVMAccess ext | 1 条相关 | This behavior is by design. If customer requires ChallengeRe... |
| Storage account key-based access is disabled at th | 1 条相关 | Enable key-based access at the storage account level in Conf... |
| 1. The SYSTEM account does not have the required S | 1 条相关 | 1. Verify SYSTEM account has Shut down the system privilege ... |
| The VMSnapshotLinux extension's pre_check() calls  | 1 条相关 | Configure pre/post backup scripts to stop and start the LDAP... |
| The System PATH environment variable is missing re | 1 条相关 | For PowerShell: add C:\Windows\System32\WindowsPowerShell\v1... |
| OpenSSH on Windows Server 2016 is not supported by | 2 条相关 | For Server 2016: not supported — direct customer to GitHub i... |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Customer wants to convert existing standard file share to premium (or vice versa) but no direct conv... | Azure Files does not support direct conversion between standard and premium file... | Create a new file share in the desired tier, then manually copy data using Roboc... | 🔵 7.0 | ADO Wiki |
| 2 | Domain join extension (JsonADDomainExtension) fails with 'Failed to initiate system shutdown'. VM re... | (1) The SYSTEM account does not have the 'Shut down the system' privilege (remov... | 1) Verify SYSTEM account has 'Shut down the system' privilege: Computer Configur... | 🔵 7.0 | ADO Wiki |
| 3 | Customer wants to remove the legacy fixEmulatedIO extension (deployed for Spectre mitigation) from t... | The fixEmulatedIO extension was deployed by Microsoft to mitigate the Spectre se... | Remove via PowerShell: Get-AzVMExtension -ResourceGroupName <RG> -VMName <VM> -N... | 🔵 7.0 | ADO Wiki |
| 4 | Domain join extension (JsonADDomainExtension) fails with error 'Failed to initiate system shutdown'.... | 1) The SYSTEM account does not have the required 'Shut down the system' privileg... | 1) Verify SYSTEM account has 'Shut down the system' privilege in Local Policy > ... | 🔵 7.0 | ADO Wiki |
| 5 | After using Reset Password on Linux VM, ChallengeResponseAuthentication is changed to 'no' in sshd_c... | This is by-design behavior. The EnableVMAccess extension intentionally sets Chal... | This behavior is by design. If customer requires ChallengeResponseAuthentication... | 🔵 7.0 | ADO Wiki |
| 6 | Customer wants to remove the legacy fixEmulatedIO extension (deployed for Spectre security mitigatio... | The fixEmulatedIO extension was deployed by Microsoft on customer's behalf durin... | Remove via Azure Cloud Shell PowerShell: Get-AzVMExtension -ResourceGroupName <R... | 🔵 7.0 | ADO Wiki |
| 7 | Error when browsing Azure file share in portal: You do not have permission to use the access key to ... | Storage account key-based access is disabled at the account level in the configu... | Enable key-based access at the storage account level in Configuration settings v... | 🔵 7.0 | ADO Wiki |
| 8 | Domain join extension (JsonADDomainExtension) fails with 'Failed to initiate system shutdown' error.... | 1. The SYSTEM account does not have the required Shut down the system privilege.... | 1. Verify SYSTEM account has Shut down the system privilege in Local Policies > ... | 🔵 7.0 | ADO Wiki |
| 9 | Customer wants to remove the fixEmulatedIO extension (Spectre security mitigation) from their VM. Ex... | The fixEmulatedIO extension was deployed by Microsoft to mitigate the Spectre se... | 1. Try PowerShell: Get-AzVMExtension -ResourceGroupName {rg} -VMName {vm} -Name ... | 🔵 7.0 | ADO Wiki |
| 10 | VMSnapshotForLinux (Azure Backup) extension fails with 'ManagedRPCreationFailedInCrpButExtensionSucc... | The VMSnapshotLinux extension's pre_check() calls getpwuid() which triggers LDAP... | Configure pre/post backup scripts to stop and start the LDAP service (e.g., lsas... | 🔵 7.0 | ADO Wiki |
| 11 | VM extension (RunCommand or others) fails on Windows with 'powershell is not recognized as an intern... | The System PATH environment variable is missing required entries (e.g., C:\Windo... | For PowerShell: add C:\Windows\System32\WindowsPowerShell\v1.0 to System PATH (C... | 🔵 7.0 | ADO Wiki |
| 12 | OpenSSH extension (Microsoft.Azure.OpenSSH.WindowsOpenSSH) fails to install on Windows Server with e... | OpenSSH on Windows Server 2016 is not supported by CSS. For Windows Server 2019+... | For Server 2016: not supported — direct customer to GitHub issues (https://githu... | 🔵 7.0 | ADO Wiki |
| 13 | Net use error code 1326 'The username or password is incorrect' when accessing Azure File Share with... | Applications running as SYSTEM/Network Service use computer account SID which ha... | Computer accounts require default share level permissions for AD Auth. Configure... | 🔵 7.0 | ADO Wiki |
| 14 | System error 5 'Access is denied' when accessing Azure File Share - on-prem SID does not match Azure... | On-premises user SID does not match the corresponding Azure AD onPremisesSecurit... | Compare on-prem SID (whoami /user) with Azure AD SID (Get-AzureADUser -objectid ... | 🔵 7.0 | ADO Wiki |
| 15 | Access denied when mounting Azure File Share with Kerberos - wrong encryption type (e.g. RC4 when on... | Kerberos ticket encrypted with unsupported encryption type for the storage accou... | Use correct encryption type or allow required type at storage account level. See... | 🔵 7.0 | ADO Wiki |
| 16 | Customer reinstalls or reapplies JsonADDomainExtension with a different OU path, but the VM's comput... | OU placement is evaluated only during the initial domain join operation. The ext... | Use Active Directory Users and Computers (ADUC) or PowerShell Move-ADObject to m... | 🔵 7.0 | ADO Wiki |
| 17 | VMSnapshotForLinux extension fails with ManagedRPCreationFailedInCrpButExtensionSucceeded. CRP shows... | The VMSnapshotLinux extension calls getpwuid() during pre-checks which triggers ... | Configure Azure Backup pre/post scripts to stop and start the LDAP service aroun... | 🔵 7.0 | ADO Wiki |
| 18 | RunCommand extension fails with "'powershell' is not recognized as an internal or external command" ... | The PowerShell path (C:\Windows\System32\WindowsPowerShell\v1.0) is missing from... | 1) Add 'C:\Windows\System32\WindowsPowerShell\v1.0' to the System PATH environme... | 🔵 7.0 | ADO Wiki |
| 19 | Windows VM extension fails with '<command> is not recognized as an internal or external command, ope... | The PATH system environment variable is misconfigured, or cmd.exe has preconfigu... | 1) Open Command Prompt in the VM and reproduce the error to identify which comma... | 🔵 7.0 | ADO Wiki |
| 20 | OpenSSH extension (Microsoft.Azure.OpenSSH.WindowsOpenSSH) fails to install on Windows VM with exit ... | OpenSSH on Windows Server 2016 is not supported by CSS. Only Windows Server 2019... | For Windows Server 2016: OpenSSH is not supported, direct customer to GitHub iss... | 🔵 7.0 | ADO Wiki |
| 21 | Azure VM created from NetApp CVO (Cloud Volumes ONTAP) image shows notification about unsupported VM... | Cloud Volumes ONTAP uses customized FreeBSD derivative, not Linux. Azure VM exte... | Remove all extensions via PowerShell: Invoke-AzRestMethod PUT with empty resourc... | 🔵 7.0 | ADO Wiki |
| 22 | RunCommand execution fails with error code 'RunCommandConflict' / 'Conflict': 'Run command extension... | Another RunCommand operation is already in progress on the VM. Concurrent RunCom... | Wait for existing RunCommand to complete (up to 90 min default timeout). If comm... | 🔵 7.0 | ADO Wiki |
| 23 | Extension installation fails with 'the system cannot find the file specified, Code: 1007' or 'Failed... | ComSpec environment variable changed from 'c:\windows\system32\cmd.exe' to anoth... | Reset ComSpec: PowerShell [Environment]::SetEnvironmentVariable('ComSpec', 'c:\w... | 🔵 7.0 | ADO Wiki |
| 24 | Azure VM extensions fail or trigger BlueXP notifications on VMs created from NetApp Cloud Volumes ON... | Cloud Volumes ONTAP uses customized FreeBSD-based ONTAP OS (not Linux). Azure VM... | Remove all extensions using PowerShell Invoke-AzRestMethod PUT with empty resour... | 🔵 7.0 | ADO Wiki |
| 25 | RunCommand execution fails with Conflict error: 'Run command extension execution is in progress. Ple... | A previous RunCommand operation is still in progress. Only one RunCommand can ex... | 1) Wait for existing RunCommand to complete (up to 90 min). 2) If hung, log into... | 🔵 7.0 | ADO Wiki |
| 26 | Extension install fails on Windows VM with 'the system cannot find the file specified, Code: 1007' o... | ComSpec environment variable changed from c:\windows\system32\cmd.exe to somethi... | Set ComSpec back: [Environment]::SetEnvironmentVariable('ComSpec', 'c:\windows\s... | 🔵 7.0 | ADO Wiki |
| 27 | VM fails to start or extension install fails with 'No version found in the artifact repository' or '... | Extension publisher/type/version specified incorrectly, or extension was acciden... | Remove the extension: Remove-AzVMExtension -ResourceGroupName <RG> -VMName <VM> ... | 🔵 7.0 | ADO Wiki |
| 28 | VMAccess extension fails with 'CannotModifyExtensionsWhenVMNotRunning' - cannot modify extensions wh... | VM is deallocated or stopped; extensions cannot be modified in this state. | Confirm VM is up and running in Azure portal or ASC before retrying extension op... | 🔵 7.0 | ADO Wiki |
| 29 | VMAccessAgent fails with COMException 0x800706D9: 'There are no more endpoints available from the en... | Windows Firewall service (MpsSvc) is disabled. VMAccess cannot enumerate firewal... | 1) Run Windows Guest Analyzer from ASC RE Diagnostics tab. 2) Check if MpsSvc se... | 🔵 7.0 | ADO Wiki |
| 30 | VMAccessForLinux extension fails: 'ascii' codec can't decode byte 0xe2 in position 852. Extension ve... | Non-ASCII characters (e.g., UTF-8 encoded chars) present in /etc/ssh/sshd_config... | 1) Snapshot OS disk. 2) Backup /etc/ssh/sshd_config. 3) Find non-ASCII chars wit... | 🔵 7.0 | ADO Wiki |


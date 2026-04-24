# VM Azure Files 通用问题 — 排查速查

**来源数**: 2 (AW, ON) | **条目**: 44 | **21V**: 全部
**最后更新**: 2026-04-24

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Customer pinned Azure Files Premium storage account to a specific zone via Zonal Placement but wants | Customers cannot self-select another zone after pinning. Zone-to-zone migration  | For large customers (>50 TB, S500): 1. Customer unpins (set to None). 2. Open IC | 🔵 7.5 | AW |
| 2 | Azure Files AAD Kerberos clients connecting through VPN fail to retrieve Kerberos token. klist retur | VPN misconfiguration preventing Windows clients from reaching AAD Kerberos servi | 1) Verify client meets prerequisites (Win10/Server 2022 with required patches).  | 🔵 7.5 | AW |
| 3 | Black screen after entering RDP credentials; user profile does not finish loading; VM has network co | Winlogon cannot complete logon and policy processing; a process or thread is dea | Collect a memory dump while the VM is in the failing state and analyze it to ide | 🔵 7.5 | AW |
| 4 | Azure Files AD DS authentication fails after a period of time; storage account Kerberos key expired  | The AD account (service logon or computer account) representing the storage acco | Run Update-AzStorageAccountADObjectPassword -RotateToKerbKey kerb2 -ResourceGrou | 🔵 7.5 | AW |
| 5 | Error 1396 when AES256 not properly enabled on Azure Files storage account - xportal shows no keytab | AES256 encryption not enabled on storage account, possibly due to outdated AzFil | 1) Check XPORTAL > storage account > Basic Info > search keytab. 2) If not found | 🔵 7.5 | AW |
| 6 | Server Side Encryption with Customer Managed Keys (SSE+CMK) fails to configure or DiskEncryptionSet  | Azure Key Vault used for CMK does not have Soft Delete and Purge Protection enab | Enable Soft Delete and Purge Protection on Key Vault. PowerShell (new KV): New-A | 🔵 7.5 | AW |
| 7 | Azure Files Premium LRS to ZRS redundancy conversion fails when the storage account has Zonal Placem | ZRS conversion is blocked when the storage account is zone-pinned via Zonal Plac | 1. Set Availability Zone to None in Storage Account > Availability. 2. Navigate  | 🔵 7.5 | AW |
| 8 | Error 1396 / KRB_AP_ERR_MODIFIED after manual domain join - missing UPN on AD object for storage acc | Manual AD domain join omits setting UPN on AD object. Causes kerbkey mismatch af | Set UPN: Set-ADUser -Identity <name> -UserPrincipalName cifs/<sa>.file.core.wind | 🔵 7.5 | AW |
| 9 | System error 5 'Access is denied' when accessing Azure File Share - on-prem SID does not match Azure | On-premises user SID does not match the corresponding Azure AD onPremisesSecurit | Compare on-prem SID (whoami /user) with Azure AD SID (Get-AzureADUser -objectid  | 🔵 7.5 | AW |
| 10 | Azure Files Kerberos authentication fails; storage account SPN (cifs/storageaccount.file.core.window | Storage account was not properly domain-joined to ADDS via Join-AzStorageAccount | 1) Verify SPN exists: setspn -q cifs/<storageaccount>.file.core.windows.net. If  | 🔵 7.5 | AW |
| 11 | Black screen after RDP on Windows 10 RS3 VM deployed with single CPU (MicrosoftWindowsDesktop.Window | Known issue with Windows 10 RS3 image: when deployed with only 1 CPU, the OS han | Resize the VM to a size with 2 or more CPUs. With 2 CPUs the OS will complete in | 🔵 7.5 | AW |
| 12 | Customer cannot see a specific Availability Zone during Azure Files Premium (LRS) storage account cr | Azure intentionally hides zones that have current capacity or infrastructure con | Explain that zones reappear automatically when capacity is restored. Do not prov | 🔵 7.5 | AW |
| 13 | Windows Server 2012/2012 R2 client: SMB Multichannel data loss bug. Azure Files blocks multichannel  | Known Windows bug causing data loss with multichannel on Azure Files. Fixed in W | No fix for 2012/2012 R2. Only single-channel communication available. If pressin | 🔵 7.5 | AW |
| 14 | Customer requests recovery of deleted Elastic SAN volume, volume group, or snapshot | Elastic SAN has an internal soft delete feature with a 10-day retention period.  | Collect Elastic SAN Resource ID, Region, deletion date from ASC Operations tab.  | 🔵 7.5 | AW |
| 15 | Join-AzStorageAccount cmdlet fails with 'Get-ADDomain: Unable to contact the server. This may be bec | Active Directory Web Services (ADWS) is not running on domain controller, or por | 1) Test port 9389: Test-NetConnection <DomainName> -port 9389. 2) Check ADWS in  | 🔵 7.5 | AW |
| 16 | After a long-running Azure Storage outage, STATUS_QUOTA_EXCEEDED errors persist on Azure File Share  | During storage outage, application (e.g., IIS) handle close operations fail, res | Confirm Azure Storage outage occurred affecting the Storage Account. List opened | 🔵 7.5 | AW |
| 17 | Azure Files klist get cifs/<sa>.file.core.windows.net fails with error 0x80090342/-2146892990: The e | Mismatch between encryption types supported by the client, the storage account A | 1) Run Get-AzStorageKerberosTicketStatus (AzFilesHybrid module) to check health  | 🔵 7.5 | AW |
| 18 | Azure File Share operations fail with STATUS_QUOTA_EXCEEDED when applications register excessive Fil | Exceeding internal limit of 1,000 File Change Notify operations per SMB share (M | For IIS: disable File Change Notifications and lower W3WP worker process polling | 🔵 7.5 | AW |
| 19 | Join-AzStorageAccountforAuth fails with 'The directory service was unable to allocate a relative ide | RID Master domain controller is unavailable or was removed from domain and resto | Verify all DCs in Active Directory Users and Computers > Domain Controllers cont | 🔵 7.5 | AW |
| 20 | Net Use or New-SmbMapping succeeds but no drive letter appears in Windows File Explorer / My Compute | Windows File Explorer does not run as administrator by default. Network drives m | Option 1: Mount the share from a non-administrator command line. Option 2: Confi | 🔵 7.5 | AW |
| 21 | Failed to delete/modify file on Azure File Share: The specified resource is marked for deletion by a | Open/orphaned SMB file handle preventing file or directory from being modified o | Use PowerShell: Get-AzStorageFileHandle -ShareName <share> -Recursive -Context $ | 🔵 7.5 | AW |
| 22 | Black screen on both VM console screenshot and RDP session; Desktop Window Manager (dwm.exe) crashes | OS file corruption affecting the GUI subsystem, specifically dwm.exe; related to | Apply KB3137061 fix. For file corruption, run SFC /scannow and DISM /online /cle | 🔵 7.5 | AW |
| 23 | Join-AzStorageAccountforAuth fails with "Cannot bind positional parameters because no names were giv | Syntax error in command, commonly misspelled parameter "-OrganizationUnitName" ( | Check command for misspellings. Ensure parameter is "-OrganizationalUnitName" (n | 🔵 7.5 | AW |
| 24 | VMSS nodes enter failed state after Scale-in operation due to Fabric Failover | Fabric Failover triggered during or after VMSS scale-in operation causes remaini | Investigate Fabric Failover root cause via Kusto/ICM. Ref ICM: 120205931. | 🔵 7 | ON |
| 25 | Black screen after RDP credentials on Windows Server 2012 R2; VM in partial hang state; apps (e.g.,  | Deadlock in WinHttpAutoProxySvc: when this service is disabled and the system is | Enable the WinHttpAutoProxySvc service (set to Manual or Automatic). Apply lates | 🔵 6.5 | AW |
| 26 | Azure Files StorageFileLogs diagnostic logs show only SmbPrimarySID but RequesterUserName, Requester | When using on-premises Active Directory authentication, AD only shares the Secur | Use PowerShell command Get-AdUser <SID> to map the SmbPrimarySID from logs to th | 🔵 6.5 | AW |
| 27 | net use command fails with 'The option /key== is unknown' when mapping Azure file share network driv | cmd.exe interprets forward slash (/) in storage account key as a command line op | Use PowerShell New-SmbMapping instead of net use: New-SmbMapping -LocalPath z: - | 🔵 6.5 | AW |
| 28 | Error 'resource was disallowed by policy' when running Set-AzStorageAccount to enable SMB OAuth for  | Azure Policy on subscription blocking Set-AzStorageAccount operation. | Retry with -AllowBlobPublicAccess $false flag: Set-AzStorageAccount -ResourceGro | 🔵 6.5 | AW |
| 29 | RequesterAppId, RequesterUpn, RequesterUserName empty in StorageFileLogs diagnostic logs when using  | When using on-premises Active Directory authentication, only the Security Identi | Use Get-AdUser <SID> PowerShell command to resolve the SID to a username for aud | 🔵 6.5 | AW |
| 30 | Error "The request to microsoft graph failed with code BadRequest" / "Credential type not allowed as | Entra ID app management policies ("Block password addition" and "Restrict max pa | Exclude the Storage Resource Provider in the Excluded callers section of the app | 🔵 6.5 | AW |
| 31 | Azure Files SMB session disconnects after 12 hours when using Entra-Only Kerberos authentication | Windows session limitation with Kerberos token expiration; known issue with Entr | Lock/unlock or reboot the session to re-establish the Kerberos ticket. A Windows | 🔵 6.5 | AW |
| 32 | ls command hangs or returns 'Cannot access FilePath: Input/output error' when listing files in Azure | Missing Linux OS kernel fixes for Azure Files SMB client | Upgrade Linux kernel to 4.4.87+, 4.9.48+, 4.12.11+, or any version >= 4.13 | 🔵 6.5 | AW |
| 33 | klist failed with 0xc000009a/-1073741670 "Insufficient system resources" when running klist get cifs | Customer disabled Microsoft Entra Kerberos on the storage account without deleti | Disable Microsoft Entra ID Kerberos for the storage account, delete the correspo | 🔵 6.5 | AW |
| 34 | Close-AzStorageFileHandle returns HTTP 404 ParentNotFound even with correct path when closing Azure  | Azure Storage Account Firewall is enabled, blocking the PowerShell file handle o | Temporarily set storage account networking to Enabled from all networks, retry C | 🔵 6.5 | AW |
| 35 | RDP error 'Because of a protocol error detected at the client (code 0x1104), this session will be di | Another application or service has bound to RDP port 3389 instead of Terminal Se | Run 'netstat -anob' to identify the process listening on port 3389. Either stop  | 🔵 6.5 | AW |
| 36 | Linux ls command hangs when listing Azure Files directory, or returns error: ls: cannot access FileP | Missing Linux OS kernel fixes for Azure Files SMB client operations | Upgrade the Linux kernel to one of these fixed versions: 4.4.87+, 4.9.48+, 4.12. | 🔵 6.5 | AW |
| 37 | Azure Windows VM stuck in reboot loop after Windows Update showing Preparing to configure windows or | At restart, boot critical drivers load and registry reads Pending.xml location w | Offline repair: create rescue VM with nested virtualization, boot from recovery  | 🔵 6.5 | AW |
| 38 | RDP shows black screen then disconnects; explorer.exe crashes with Application Error Event ID 1000 ( | Explorer.exe process crashes due to TwinUI.dll fault, preventing the desktop she | Run SFC /scannow and DISM /online /cleanup-image /restorehealth to repair the co | 🔵 6.5 | AW |
| 39 | Azure Files REST API call (ARM or SRP) returns empty value array with nextLink present; no apparent  | By design - REST API enumeration can return partial or empty results depending o | Follow nextLink pagination: send GET requests to the URL in nextLink property un | 🔵 6.5 | AW |
| 40 | Error when browsing Azure file share in portal: You do not have permission to use the access key to  | Storage account key-based access is disabled at the account level in the configu | Enable key-based access at the storage account level in Configuration settings v | 🔵 6.5 | AW |
| 41 | Azure Files REST API call through ARM (management.azure.com) or SRP returns empty value array with n | By design - REST APIs depending on enumeration can return partial results includ | Always follow continuation tokens: send GET requests to the nextLink URL until i | 🔵 6.5 | AW |
| 42 | 需要用 PowerShell 批量停止 VM 备份并删除 Recovery Services Vault（含 Soft Delete 已启用的场景） |  | PowerShell 脚本（适用于仅有 VM 备份、无 SQL 等其他资源的 Vault）：1) Connect-AzAccount -Environment  | 🔵 6 | ON |
| 43 | Fiddler Classic unable to decrypt HTTPS traffic for Entra Kerberos debugging - requests to login.mic | Fiddler certificate configuration is corrupt or not properly trusted by the syst | In Fiddler go to Tools > Options > HTTPS > Actions > Reset All Certificates. Acc | 🟡 4.0 | AW |
| 44 | klist get cifs/<storageaccount>.file.core.windows.net fails with error 0x51f / 0xc000005e/-107374173 | Fiddler proxy settings (port 8888) not cleaned up correctly after process exit,  | Run: (1) netsh winhttp reset autoproxy, (2) netsh winhttp reset proxy, (3) In re | 🟡 4.0 | AW |

## 快速排查路径

1. **Customer pinned Azure Files Premium storage account to a specific zone via Zonal**
   - 根因: Customers cannot self-select another zone after pinning. Zone-to-zone migration is not a customer-facing operation.
   - 方案: For large customers (>50 TB, S500): 1. Customer unpins (set to None). 2. Open ICM to backend team. 3. Backend moves account. SLA ~1 week, no downtime.
   - `[🔵 7.5 | AW]`

2. **Azure Files AAD Kerberos clients connecting through VPN fail to retrieve Kerbero**
   - 根因: VPN misconfiguration preventing Windows clients from reaching AAD Kerberos service over HTTPS. AAD Kerberos uses HTTPS (
   - 方案: 1) Verify client meets prerequisites (Win10/Server 2022 with required patches). 2) Check AAD join status and line-of-sight to on-prem domain. 3) Verif
   - `[🔵 7.5 | AW]`

3. **Black screen after entering RDP credentials; user profile does not finish loadin**
   - 根因: Winlogon cannot complete logon and policy processing; a process or thread is deadlocked on a shared resource, preventing
   - 方案: Collect a memory dump while the VM is in the failing state and analyze it to identify the blocking thread/process. Run 'dism /online /cleanup-image /r
   - `[🔵 7.5 | AW]`

4. **Azure Files AD DS authentication fails after a period of time; storage account K**
   - 根因: The AD account (service logon or computer account) representing the storage account was created under an OU with passwor
   - 方案: Run Update-AzStorageAccountADObjectPassword -RotateToKerbKey kerb2 -ResourceGroupName <rg> -StorageAccountName <sa> from the AzFilesHybrid module. The
   - `[🔵 7.5 | AW]`

5. **Error 1396 when AES256 not properly enabled on Azure Files storage account - xpo**
   - 根因: AES256 encryption not enabled on storage account, possibly due to outdated AzFilesHybrid module (prior to Jan 2023). XPO
   - 方案: 1) Check XPORTAL > storage account > Basic Info > search keytab. 2) If not found, enable AES256 per docs. 3) Verify keytab1/keytab2 appear. 4) klist p
   - `[🔵 7.5 | AW]`


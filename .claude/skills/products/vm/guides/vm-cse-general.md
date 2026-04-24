# VM CSE/Run Command 通用 — 排查速查

**来源数**: 3 (AW, ML, ON) | **条目**: 27 | **21V**: 全部
**最后更新**: 2026-04-24

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Need comprehensive Kusto endpoints + query templates for VM fabric investigation: node/host health,  | Host node hardware failure (disk capacity below 4GB, CSIDiag_62012/DISK_ER_CDF12 | Endpoints (Mooncake): ARM=armmcadx.chinaeast2; FC/CM=azurecm.chinanorth2 DB:Azur | 🟢 8 | ON |
| 2 | Azure Files mount fails with private endpoint configured; DNS resolves storage account to public IP  | Private DNS zone (privatelink.file.core.windows.net) not associated with the pri | 1) Verify private DNS zone (privatelink.file.core.windows.net) is associated wit | 🔵 7.5 | AW |
| 3 | High latency and slow performance on Azure File Share during metadata-heavy operations (createfile,  | Known Azure platform internal resource limitations cause metadata operations to  | Create a VHD on the Azure File Share and mount it from the client. The client-ow | 🔵 7.5 | AW |
| 4 | AKS VMSS node fails to provision; vmssCSE (Custom Script Extension) reports failure with exit code ( | AKS uses CSE to install Kubernetes components on VMSS nodes. Exit codes indicate | 1) ASC → VM → Extensions → expand failed CSE → Status Message for error code. 2) | 🔵 7.5 | AW |
| 5 | Azure Files AAD Kerberos clients connecting through VPN fail to retrieve Kerberos token. klist retur | VPN misconfiguration preventing Windows clients from reaching AAD Kerberos servi | 1) Verify client meets prerequisites (Win10/Server 2022 with required patches).  | 🔵 7.5 | AW |
| 6 | Azure Files AAD Kerberos mount prompts for credentials with error: The SAM database on the Windows S | Storage account AD object is missing or disabled in Active Directory. | 1) Run Get-AzStorageAccountADObject to verify object exists. 2) If missing, rejo | 🔵 7.5 | AW |
| 7 | VM extension (RunCommand or others) fails on Windows with 'powershell is not recognized as an intern | The System PATH environment variable is missing required entries (e.g., C:\Windo | For PowerShell: add C:\Windows\System32\WindowsPowerShell\v1.0 to System PATH (C | 🔵 7.5 | AW |
| 8 | Access Denied when trying to update NTFS permissions on Azure File Share via identity-based authenti | Customer is using cached AD credentials instead of Storage Account Access Key wh | 1) Drop existing mount. 2) Clear cached credentials via Windows Credential Manag | 🔵 7.5 | AW |
| 9 | User with file share level RBAC permissions navigates to Azure portal file share browse but gets acc | User lacks reader-level RBAC permissions at the storage account scope or higher. | Assign at least Reader role at storage account level or higher scope (e.g. subsc | 🔵 7.5 | AW |
| 10 | Custom Script Extension (CSE) fails on Windows with error: The remote server returned an error: (404 | The storage account name configured in the CSE command is incorrect, or the blob | Verify the storage account name is correct in the CSE command. Check that the bl | 🔵 7.5 | AW |
| 11 | Azure Files AD DS authentication or NTFS authorization fails for synced user or group despite correc | OnPremisesSecurityIdentifier attribute not correctly synchronized between on-pre | 1) Get on-prem SID: whoami /user or Get-ADUser -Identity <user>. 2) Get Azure AD | 🔵 7.5 | AW |
| 12 | Join-AzStorageAccount cmdlet fails with 'Get-ADDomain: Unable to contact the server. This may be bec | Active Directory Web Services (ADWS) is not running on domain controller, or por | 1) Test port 9389: Test-NetConnection <DomainName> -port 9389. 2) Check ADWS in  | 🔵 7.5 | AW |
| 13 | Need to enable or disable Encryption at Host for a Windows VM to encrypt data at the VM host level |  | Prerequisites: Register feature with Register-AzProviderFeature -FeatureName "En | 🔵 7.5 | AW |
| 14 | Join-AzStorageAccountforAuth fails with 'The directory service was unable to allocate a relative ide | RID Master domain controller is unavailable or was removed from domain and resto | Verify all DCs in Active Directory Users and Computers > Domain Controllers cont | 🔵 7.5 | AW |
| 15 | Black screen after RDP credentials on Windows Server 2012 R2; VM in partial hang state; apps (e.g.,  | Deadlock in WinHttpAutoProxySvc: when this service is disabled and the system is | Enable the WinHttpAutoProxySvc service (set to Manual or Automatic). Apply lates | 🔵 6.5 | AW |
| 16 | Elastic SAN volume created from Managed Disk snapshot via PowerShell shows as not initialized. Issue | PowerShell command missing -CreationDataCreateSource DiskSnapshot switch. Withou | Add -CreationDataCreateSource DiskSnapshot parameter when creating Elastic SAN v | 🔵 6.5 | AW |
| 17 | Creating Azure Compute Gallery image version via Capture fails with Conflict error: 'The resource ha | The source VM was created from a Marketplace image with a purchase plan, but the | Re-create the Image Definition with the correct purchase plan information (name, | 🔵 6.5 | AW |
| 18 | Azure Files AAD Kerberos mount prompts for credentials repeatedly. klist returns error 0x80090342 SE | RC4 encryption is not enabled on the customer domain, causing Kerberos ticket re | Enable RC4 encryption on the domain. See related TSG: 1396 - The target account  | 🔵 6.5 | AW |
| 19 | Windows 11 Trusted Launch VM fails to boot with error 'The boot loader did not load an operating sys | When the EFI partition is deleted and recreated at a different location, the VM  | Deallocate VM, download VHD, upload to new storage account, create new managed d | 🔵 6.5 | AW |
| 20 | Azure Compute Gallery image version update fails with error: 'The replication region and replica cou | When Shallow Replication is enabled for an image version, replication settings ( | Configure all desired replication regions and replica counts BEFORE enabling the | 🔵 6.5 | AW |
| 21 | RunCommand extension fails with "'powershell' is not recognized as an internal or external command"  | The PowerShell path (C:\Windows\System32\WindowsPowerShell\v1.0) is missing from | 1) Add 'C:\Windows\System32\WindowsPowerShell\v1.0' to the System PATH environme | 🔵 6.5 | AW |
| 22 | Access Denied for root or specific folders in Azure File Share while child folders are accessible wi | Default NTFS ACLs are missing on the file share or folder | Mount file share using storage key and verify default ACLs exist: BUILTIN\Admini | 🔵 6.5 | AW |
| 23 | Custom Script Extension (CSE) fails to provision with Exceeded maximum file download time timeout. H | CSE has a hard-coded 30-minute maximum download time for script files. The custo | Inform customer of the 30-minute hard-coded download time limit. Advise to reduc | 🔵 6.5 | AW |
| 24 | Elastic SAN volume shows lower than expected performance (bandwidth/IOPS) when running sequential wo | Product limitation: shard level performance limits of 5,000 IOPS and 256 MB/s ar | Workaround: stripe multiple volumes to achieve target performance. Use Storage S | 🔵 6.5 | AW |
| 25 | CSE fails with Change is in conflict 409 error | VM has CSE installed with different resource name. Only one CSE instance allowed | Use same -Name as existing CSE, or remove existing CSE first then reinstall. | 🔵 5.5 | ML |
| 26 | CSE fails with FileUris in both protected and public config sections | FileUris specified in both public and protected settings sections | Remove existing CSE, reinstall with fileUris in single config section only. | 🔵 5.5 | ML |
| 27 | Disk Encryption Set with Confidential disk encryption + CMK fails to grant KeyVault permissions with | Confidential VM Orchestrator service principal (AppId bf7b6499-ff71-4aa2-97a4-f3 | Register the service principal using Microsoft Graph SDK: Connect-Graph -Tenant  | 🟡 4.0 | AW |

## 快速排查路径

1. **Need comprehensive Kusto endpoints + query templates for VM fabric investigation**
   - 根因: Host node hardware failure (disk capacity below 4GB, CSIDiag_62012/DISK_ER_CDF12) caused VM reboot; found via AzureDCMDb
   - 方案: Endpoints (Mooncake): ARM=armmcadx.chinaeast2; FC/CM=azurecm.chinanorth2 DB:AzureCM access:MyAccess-12894; CRP=azcrpmc (TM-CSSMCUS-RW); DiskRP=disksmc
   - `[🟢 8 | ON]`

2. **Azure Files mount fails with private endpoint configured; DNS resolves storage a**
   - 根因: Private DNS zone (privatelink.file.core.windows.net) not associated with the private endpoint, or virtual network link n
   - 方案: 1) Verify private DNS zone (privatelink.file.core.windows.net) is associated with the private endpoint. 2) Configure virtual network link from private
   - `[🔵 7.5 | AW]`

3. **High latency and slow performance on Azure File Share during metadata-heavy oper**
   - 根因: Known Azure platform internal resource limitations cause metadata operations to have higher latency than read/write oper
   - 方案: Create a VHD on the Azure File Share and mount it from the client. The client-owned filesystem makes metadata operations local, offering performance s
   - `[🔵 7.5 | AW]`

4. **AKS VMSS node fails to provision; vmssCSE (Custom Script Extension) reports fail**
   - 根因: AKS uses CSE to install Kubernetes components on VMSS nodes. Exit codes indicate specific failures: ERR_OUTBOUND_CONN_FA
   - 方案: 1) ASC → VM → Extensions → expand failed CSE → Status Message for error code. 2) Cross-reference exit code: https://github.com/Azure/acs-engine/blob/m
   - `[🔵 7.5 | AW]`

5. **Azure Files AAD Kerberos clients connecting through VPN fail to retrieve Kerbero**
   - 根因: VPN misconfiguration preventing Windows clients from reaching AAD Kerberos service over HTTPS. AAD Kerberos uses HTTPS (
   - 方案: 1) Verify client meets prerequisites (Win10/Server 2022 with required patches). 2) Check AAD join status and line-of-sight to on-prem domain. 3) Verif
   - `[🔵 7.5 | AW]`


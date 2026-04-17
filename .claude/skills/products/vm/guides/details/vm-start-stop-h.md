# VM Vm Start Stop H — 综合排查指南

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
| Disk Encryption Set system-assigned managed identi | 1 条相关 | For KV Access Policy model: Navigate to DES overview, click ... |
| The Key Vault key associated with the Disk Encrypt | 1 条相关 | Rotate the key: In Azure portal, go to Key Vault > Keys, sel... |
| MSI credential for Disk Encryption Set requires pe | 1 条相关 | First rule out: 1) Missing KV permissions (check Get/List/Un... |
| Unknown | 7 条相关 | Use Set-AzVMDiskEncryptionExtension -ResourceGroupName $RG -... |
| ASC EncryptionType property (e.g. EncryptionAtRest | 1 条相关 | To check CMK: use PowerShell Get-AzDisk and inspect $disk.En... |
| The EncryptionAtHost feature is not registered for | 1 条相关 | Register the feature: Register-AzProviderFeature -FeatureNam... |
| Azure Files Storage service bug (starting 8/14/202 | 1 条相关 | Provide credentials explicitly: (1) Use net use command with... |
| Default 10% memory allocation for Azure File Sync  | 1 条相关 | Increase allowed memory for recalls by modifying registry se... |
| Stale/cached credentials from previous authenticat | 1 条相关 | 1) List stored credentials: cmdkey /list; 2) Remove stale cr... |
| Open/orphaned SMB file handle preventing file or d | 1 条相关 | Use PowerShell: Get-AzStorageFileHandle -ShareName <share> -... |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | SSE+CMK encrypted VM in failed state, start fails with KeyVaultAccessForbidden. DES managed identity... | Disk Encryption Set system-assigned managed identity does not have the required ... | For KV Access Policy model: Navigate to DES overview, click the error to auto-gr... | 🔵 6.0 | ADO Wiki |
| 2 | SSE+CMK encrypted VM fails to start: Unable to access key - Key is expired. Key Vault key used by Di... | The Key Vault key associated with the Disk Encryption Set has expired, preventin... | Rotate the key: In Azure portal, go to Key Vault > Keys, select the expired key ... | 🔵 6.0 | ADO Wiki |
| 3 | SSE+CMK encrypted VM fails to start with KeyVaultAccessTokenCannotBeAcquired error (403 Forbidden). ... | MSI credential for Disk Encryption Set requires periodic backend updates by an a... | First rule out: 1) Missing KV permissions (check Get/List/Unwrap/Wrap Key) 2) Ke... | 🔵 6.0 | ADO Wiki |
| 4 | Need to migrate VM from Dual Pass ADE (with AAD/Service Principal) to Single Pass ADE (without AAD) |  | Use Set-AzVMDiskEncryptionExtension -ResourceGroupName $RG -VMName $VM -Migrate.... | 🔵 7.0 | ADO Wiki |
| 5 | Need to verify if SSE+CMK (Customer Managed Key) encryption is enabled on an Azure managed disk |  | PowerShell: $disk = Get-AzDisk -ResourceGroupName $RG -DiskName $DiskName; $disk... | 🔵 7.0 | ADO Wiki |
| 6 | Windows VM is encrypted with BEK only (no KEK) and needs to be re-encrypted with KEK for enhanced ke... |  | Re-encrypt with KEK using PowerShell: $keyEncryptionKeyUrl = (Get-AzKeyVaultKey ... | 🔵 7.0 | ADO Wiki |
| 7 | Need to enable or disable Encryption at Host for a Windows VM to encrypt data at the VM host level |  | Prerequisites: Register feature with Register-AzProviderFeature -FeatureName "En... | 🔵 7.0 | ADO Wiki |
| 8 | Azure Support Center (ASC) disk search shows EncryptionType for SSE+CMK encrypted disks, but does no... | ASC EncryptionType property (e.g. EncryptionAtRestWithCustomerKey) only reflects... | To check CMK: use PowerShell Get-AzDisk and inspect $disk.Encryption.Type, or se... | 🔵 7.0 | ADO Wiki |
| 9 | Enabling Encryption at Host on a VM fails. The option is not available or returns an error in Azure ... | The EncryptionAtHost feature is not registered for the subscription. This featur... | Register the feature: Register-AzProviderFeature -FeatureName "EncryptionAtHost"... | 🔵 7.0 | ADO Wiki |
| 10 | Customer needs to migrate VM from ADE Dual Pass (with AAD) to Single Pass (without AAD) encryption. ... |  | Use PowerShell: Set-AzVMDiskEncryptionExtension -ResourceGroupName RG -VMName VM... | 🔵 7.0 | ADO Wiki |
| 11 | Customer has ADE-encrypted Windows VM with BEK only and needs to upgrade to KEK (Key Encryption Key)... |  | Re-run Set-AzVMDiskEncryptionExtension with KEK parameters on already BEK-encryp... | 🔵 7.0 | ADO Wiki |
| 12 | Need to encrypt Linux VM data disks with ADE using KEK via Azure CLI. Customer prefers CLI over Powe... |  | az vm encryption enable --resource-group RG --name VM --disk-encryption-keyvault... | 🔵 7.0 | ADO Wiki |
| 13 | Azure Files SMB mount via UNC path fails with STATUS_OBJECT_NAME_NOT_FOUND instead of prompting for ... | Azure Files Storage service bug (starting 8/14/2023) changed SMB Session Setup e... | Provide credentials explicitly: (1) Use net use command with credential paramete... | 🔵 7.0 | ADO Wiki |
| 14 | Azure File Sync recall failures with RecallToDiskType: No errors. Tiered files fail to download full... | Default 10% memory allocation for Azure File Sync recalls is insufficient. When ... | Increase allowed memory for recalls by modifying registry settings to allocate 3... | 🔵 7.0 | ADO Wiki |
| 15 | Network drive mapping fails when using Microsoft Entra ID authentication for Azure Files. Mount comm... | Stale/cached credentials from previous authentication methods conflict with new ... | 1) List stored credentials: cmdkey /list; 2) Remove stale credential: cmdkey /de... | 🔵 7.0 | ADO Wiki |
| 16 | Failed to delete/modify file on Azure File Share: The specified resource is marked for deletion by a... | Open/orphaned SMB file handle preventing file or directory from being modified o... | Use PowerShell: Get-AzStorageFileHandle -ShareName <share> -Recursive -Context $... | 🔵 7.0 | ADO Wiki |
| 17 | Close-AzStorageFileHandle returns HTTP 404 ParentNotFound even with correct path when closing Azure ... | Azure Storage Account Firewall is enabled, blocking the PowerShell file handle o... | Temporarily set storage account networking to Enabled from all networks, retry C... | 🔵 7.0 | ADO Wiki |
| 18 | Access Denied error when mounting Azure File Share using storage account key after SMB security sett... | Storage account SMB security settings configured to allow only Kerberos, disabli... | Update SMB security settings: PowerShell Update-AzStorageFileServiceProperty -Sm... | 🔵 7.0 | ADO Wiki |
| 19 | Azure File Share mount fails on Linux during system boot. The fstab entry for the file share fails t... | Entries in /etc/fstab are processed before networking is enabled, causing mount ... | Add the _netdev option to the Azure File Share entry in /etc/fstab so it is not ... | 🔵 7.0 | ADO Wiki |
| 20 | Access Denied error when trying to mount Azure File Share using storage account key (NTLMv2 authenti... | Storage account SMB security settings restrict authentication methods (e.g., onl... | Check and adjust SMB security settings: PowerShell Update-AzStorageFileServicePr... | 🔵 7.0 | ADO Wiki |
| 21 | After a long-running Azure Storage outage, STATUS_QUOTA_EXCEEDED errors persist on Azure File Share ... | During storage outage, application (e.g., IIS) handle close operations fail, res... | Confirm Azure Storage outage occurred affecting the Storage Account. List opened... | 🔵 7.0 | ADO Wiki |
| 22 | Azure File Share mounted via PowerShell (New-PSDrive) is accessible in PowerShell session but return... | New-PSDrive command was used without the -Persist option, creating a session-onl... | Mount with -Persist flag: New-PSDrive -Name Z -PSProvider FileSystem -Root '\\<s... | 🔵 7.0 | ADO Wiki |
| 23 | Fiddler Classic unable to decrypt HTTPS traffic for Entra Kerberos debugging - requests to login.mic... | Fiddler certificate configuration is corrupt or not properly trusted by the syst... | In Fiddler go to Tools > Options > HTTPS > Actions > Reset All Certificates. Acc... | 🔵 6.0 | ADO Wiki |
| 24 | klist get cifs/<storageaccount>.file.core.windows.net fails with error 0x51f / 0xc000005e/-107374173... | Fiddler proxy settings (port 8888) not cleaned up correctly after process exit, ... | Run: (1) netsh winhttp reset autoproxy, (2) netsh winhttp reset proxy, (3) In re... | 🔵 6.0 | ADO Wiki |
| 25 | Application or service cannot connect to mounted Azure Files drive. Mapped drive not visible when ap... | Mapped drives are mounted per user. If the application/service runs under a diff... | Mount the Azure File share from the same user context as the application using P... | 🔵 7.0 | ADO Wiki |
| 26 | Join-AzStorageAccountforAuth fails with "Cannot bind positional parameters because no names were giv... | Syntax error in command, commonly misspelled parameter "-OrganizationUnitName" (... | Check command for misspellings. Ensure parameter is "-OrganizationalUnitName" (n... | 🔵 7.0 | ADO Wiki |
| 27 | Accessing Azure file share via UNC path in Windows Explorer takes more than 5 minutes; same issue in... | Windows with Client for NFS feature installed tries connecting via port 111 (sun... | Remove Client for NFS feature from Windows (uncheck in Remove Features screen) a... | 🔵 7.0 | ADO Wiki |
| 28 | net use command fails with 'The option /key== is unknown' when mapping Azure file share network driv... | cmd.exe interprets forward slash (/) in storage account key as a command line op... | Use PowerShell New-SmbMapping instead of net use: New-SmbMapping -LocalPath z: -... | 🔵 7.0 | ADO Wiki |
| 29 | RequesterAppId, RequesterUpn, RequesterUserName empty in StorageFileLogs diagnostic logs when using ... | When using on-premises Active Directory authentication, only the Security Identi... | Use Get-AdUser <SID> PowerShell command to resolve the SID to a username for aud... | 🔵 7.0 | ADO Wiki |
| 30 | Accessing Azure Files through Explorer using UNC path takes more than 5 minutes. Applications (Excel... | Windows with Client for NFS feature installed attempts to connect via port 111 (... | Remove the Client for NFS feature: open Remove Features screen, uncheck Client f... | 🔵 7.0 | ADO Wiki |


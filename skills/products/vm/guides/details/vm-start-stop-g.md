# VM Vm Start Stop G — 综合排查指南

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
| Bug in Elastic SAN RP related to Volume Groups wit | 1 条相关 | Workaround 1: Fix missing subnets in Volume Group VNET rules... |
| iSCSI initiator session timeout (LinkDownTime) def | 1 条相关 | Increase iSCSI initiator session timeout (LinkDownTime) to 3... |
| PowerShell command missing -CreationDataCreateSour | 1 条相关 | Add -CreationDataCreateSource DiskSnapshot parameter when cr... |
| After VM reboot, the guest agent starts ~90 second | 1 条相关 | 1) Have Commvault query Extension InstanceView API instead o... |
| ADE and Encryption at Host are mutually exclusive  | 1 条相关 | To migrate from ADE to Encryption at Host: 1) Follow ADE-to-... |
| Not all VM sizes support Encryption at Host. The V | 1 条相关 | Check VM size support: 1) REST API: Resource Skus API, check... |
| No alert mechanism configured to notify when Key V | 1 条相关 | Configure Event Grid integration with Logic App on Key Vault... |
| ADE Dual Pass (with AAD) is deprecated legacy vers | 1 条相关 | Run Set-AzVMDiskEncryptionExtension -ResourceGroupName <rg> ... |
| Customer was not aware of key/secret expiration in | 1 条相关 | Set up Key Vault expiration alerts using Event Grid + Logic ... |
| Azure Key Vault used for CMK does not have Soft De | 1 条相关 | Enable Soft Delete and Purge Protection on Key Vault. PowerS... |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Elastic SAN scale out fails in Azure Portal with Service Error when updating SAN size (e.g. Canada C... | Bug in Elastic SAN RP related to Volume Groups with missing subnets in VNET conf... | Workaround 1: Fix missing subnets in Volume Group VNET rules, then retry update ... | 🔵 7.0 | ADO Wiki |
| 2 | Elastic SAN disk unexpectedly unmounts during Windows Failover Cluster restart. iSCSI initiator fail... | iSCSI initiator session timeout (LinkDownTime) defaults to 15 seconds, which is ... | Increase iSCSI initiator session timeout (LinkDownTime) to 30 seconds. See: http... | 🔵 7.0 | ADO Wiki |
| 3 | Elastic SAN volume created from Managed Disk snapshot via PowerShell shows as not initialized. Issue... | PowerShell command missing -CreationDataCreateSource DiskSnapshot switch. Withou... | Add -CreationDataCreateSource DiskSnapshot parameter when creating Elastic SAN v... | 🔵 7.0 | ADO Wiki |
| 4 | Commvault backup jobs fail on ADE-encrypted VMs reporting ADE extension in failed state: 'Encryption... | After VM reboot, the guest agent starts ~90 seconds after container starts and t... | 1) Have Commvault query Extension InstanceView API instead of ProvisioningState ... | 🔵 7.0 | ADO Wiki |
| 5 | Cannot enable Encryption at Host on a VM that currently or ever had Azure Disk Encryption (ADE) enab... | ADE and Encryption at Host are mutually exclusive by design. The restriction app... | To migrate from ADE to Encryption at Host: 1) Follow ADE-to-SSE+CMK migration st... | 🔵 7.0 | ADO Wiki |
| 6 | Enabling Encryption at Host fails because VM size does not support the EncryptionAtHost feature | Not all VM sizes support Encryption at Host. The VM must use a size with Encrypt... | Check VM size support: 1) REST API: Resource Skus API, check EncryptionAtHostSup... | 🔵 7.0 | ADO Wiki |
| 7 | Azure Key Vault key or secret expiration causes ADE or SSE+CMK encrypted VMs to fail to start withou... | No alert mechanism configured to notify when Key Vault keys or secrets approach ... | Configure Event Grid integration with Logic App on Key Vault to monitor Certific... | 🔵 7.0 | ADO Wiki |
| 8 | VM using legacy ADE Dual Pass (with AAD) encryption needs migration to current Single Pass (without ... | ADE Dual Pass (with AAD) is deprecated legacy version that relies on Azure AD fo... | Run Set-AzVMDiskEncryptionExtension -ResourceGroupName <rg> -VMName <vm> -Migrat... | 🔵 7.0 | ADO Wiki |
| 9 | VM fails to start or ADE-encrypted VM becomes inaccessible because the Azure Key Vault key or secret... | Customer was not aware of key/secret expiration in Azure Key Vault. There is no ... | Set up Key Vault expiration alerts using Event Grid + Logic App: 1) Register Mic... | 🔵 7.0 | ADO Wiki |
| 10 | Server Side Encryption with Customer Managed Keys (SSE+CMK) fails to configure or DiskEncryptionSet ... | Azure Key Vault used for CMK does not have Soft Delete and Purge Protection enab... | Enable Soft Delete and Purge Protection on Key Vault. PowerShell (new KV): New-A... | 🔵 7.0 | ADO Wiki |
| 11 | VM is running ADE Dual Pass (with AAD) encryption - older ADE version (Windows: 1.1.*, Linux: 0.1.*)... | VM was encrypted with the older ADE version that relied on Azure Active Director... | Migrate using PowerShell: Set-AzVMDiskEncryptionExtension -ResourceGroupName <rg... | 🔵 7.0 | ADO Wiki |
| 12 | Cannot attach ADE Dual Pass encrypted managed disk as a data disk to rescue VM. Azure Portal shows e... | Dual Pass encrypted managed disks have encryption settings metadata that prevent... | Clear encryption settings before attaching. PowerShell (Az): $disk = Get-AzDisk ... | 🔵 7.0 | ADO Wiki |
| 13 | BEK volume does not appear on rescue VM after attaching ADE encrypted disk. Cannot find BEK file to ... | The encrypted disk was attached after VM creation. BEK volume is only provisione... | Must attach the encrypted disk DURING rescue VM creation (in the Disks blade of ... | 🔵 7.0 | ADO Wiki |
| 14 | Encrypted Windows VM or VMSS fails to start with error: secret does not have the DiskEncryptionKeyFi... | The Key Vault secret used by ADE is missing required tags (DiskEncryptionKeyFile... | Navigate to Key Vault > secret current version > Tags. Add missing tag: DiskEncr... | 🔵 7.0 | ADO Wiki |
| 15 | Attaching an ADE-encrypted managed disk as a data disk to another VM fails with: Disk contains encry... | Disk-level encryption settings prevent attaching an encrypted OS disk as a data ... | Copy the managed disk VHD to a storage account (Grant-AzDiskAccess + Start-AzSto... | 🔵 7.0 | ADO Wiki |
| 16 | Linux VM data disk secrets lost after boot: LinuxPassPhraseFileName_1_0 missing from /mnt/azure_bek_... | Race condition between ADE and Fast Attach/Detach (FAD) during VM creation. CRP ... | Deallocate and start the VM to remount BEK volume with data disk secrets. For no... | 🔵 7.0 | ADO Wiki |
| 17 | ADE encryption fails with VMExtensionProvisioningError: [2.4.0.21] BEK disk is missing or not initia... | BEK volume is offline or not initialized. Often caused by NoAutoMount registry s... | Check Disk Management and diskpart for BEK volume status. If offline, make it on... | 🔵 7.0 | ADO Wiki |
| 18 | Starting an ADE-encrypted VM (stopped/deallocated) fails with DiskEncryptionInternalError: Internal ... | The secret and/or key used for Azure Disk Encryption has been deleted from the K... | 1) Re-enable Key Vault access policies: enable Azure Disk Encryption for volume ... | 🔵 6.0 | ADO Wiki |
| 19 | VM Start/Stop/PUT/PATCH operations fail with 403 Forbidden: The key vault key is not found to unwrap... | Storage account uses Customer Managed Keys (CMK) for encryption at rest, and the... | 1) Verify Key Vault has the correct key name and latest version matching ASC. 2)... | 🔵 6.0 | ADO Wiki |
| 20 | Microsoft Defender shows VM as Not Compliant for encryption policy even after ADE or Encryption at H... | Multiple possible causes: 1) VM is deallocated (known issue -- Defender cannot a... | 1) Start the VM if deallocated. 2) Enable System Assigned Managed Identity. 3) V... | 🔵 6.0 | ADO Wiki |
| 21 | ADE extension fails with ProtectKeyWithExternalKey failed with 2150695003. BitLocker startup options... | Conflict in BitLocker startup options group policy (or local policy). One UseTPM... | 1) Check registry at HKLM\software\policies\microsoft\fve for UseTPM, UseTPMPIN,... | 🔵 6.0 | ADO Wiki |
| 22 | ADE extension fails with ProtectKeyWithExternalKey failed with 2150695023. Error: The drive is too s... | One of the drives (e.g. F: drive) has less than 250MB of free space, which is be... | 1) Request customer to deallocate and restart VM to check if encryption status u... | 🔵 6.0 | ADO Wiki |
| 23 | VM Start/Stop/PUT/PATCH operations fail with 'The key vault key is not found to unwrap the encryptio... | Storage account uses Customer Managed Keys for encryption at rest, and the key v... | Verify the Key Vault key version is current, ensure the key is not deleted/disab... | 🔵 7.0 | ADO Wiki |
| 24 | Microsoft Defender shows VM as non-compliant for encryption policy/recommendation even after enablin... | Known issue: Defender cannot assess encryption compliance for deallocated VMs. | Start the VM so that Defender can recognize it as compliant. If still non-compli... | 🔵 7.0 | ADO Wiki |
| 25 | ADE extension fails with ProtectKeyWithExternalKey failed with 2150695003 during BitLocker encryptio... | Conflict in BitLocker startup options group policy. UseTPM registry entries have... | Fix GPO conflict: either (1) set one UseTPM* to 0x1 (Require) and all others to ... | 🔵 7.0 | ADO Wiki |
| 26 | ADE enable fails with "Failed to configure bitlocker as expected. Exception: SaveExternalKeyToFile f... | GPO or registry setting FDVDenyWriteAccess=1 (Deny write access to removable dri... | Set registry FDVDenyWriteAccess to 0: reg add "HKLM\SYSTEM\CurrentControlSet\Pol... | 🔵 6.0 | ADO Wiki |
| 27 | Data disks show "The disk is write-protected. Remove the write-protection or use another disk" when ... | GPO or tattooed GPO setting FDVDenyWriteAccess=1 at HKLM\SYSTEM\CurrentControlSe... | Remove registry: reg delete "HKLM\SYSTEM\CurrentControlSet\Policies\Microsoft\FV... | 🔵 6.0 | ADO Wiki |
| 28 | Attaching data disk or updating VM fails with "User encryption settings in the VM model are not supp... | VM was previously encrypted with Dual Pass ADE. After disabling Dual Pass and re... | Clear encryption settings via PowerShell (only after confirming: DP fully disabl... | 🔵 6.0 | ADO Wiki |
| 29 | Disk Encryption Set shows Invalid value found at accessPolicies TenantId error after moving VM/DES/K... | System-assigned managed identity does not move across tenants. After subscriptio... | 1) Set DES identity type to None via ARM template (Export template > Deploy > Ed... | 🔵 6.0 | ADO Wiki |
| 30 | SSE+CMK disk encryption update fails: Cannot update encryption properties for disk because it alread... | Azure platform restriction: managed disk and all associated incremental snapshot... | Option A (Azure Disk Backup): Go to Resiliency > Protection inventory > Protecte... | 🔵 6.0 | ADO Wiki |


# VM 主机加密与 SSE+CMK — 排查速查

**来源数**: 1 (AW) | **条目**: 29 | **21V**: 28/29
**最后更新**: 2026-04-24

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Need to verify if SSE+CMK (Customer Managed Key) encryption is enabled on an Azure managed disk |  | PowerShell: $disk = Get-AzDisk -ResourceGroupName $RG -DiskName $DiskName; $disk | 🔵 7.5 | AW |
| 2 | VM fails to start with error: InternalDiskManagementError -- The given encryption scope is not avail | The DiskEncryptionSet system-assigned managed identity requires Get/Wrap Key/Unw | 1. In Azure Portal, go to Disk Encryption Set > Overview. If an error is shown,  | 🔵 7.5 | AW |
| 3 | Enabling Encryption at Host on a VM fails. The option is not available or returns an error in Azure  | The EncryptionAtHost feature is not registered for the subscription. This featur | Register the feature: Register-AzProviderFeature -FeatureName "EncryptionAtHost" | 🔵 7.5 | AW |
| 4 | Microsoft Defender shows VM as non-compliant for encryption policy/recommendation even after enablin | Known issue: Defender cannot assess encryption compliance for deallocated VMs. | Start the VM so that Defender can recognize it as compliant. If still non-compli | 🔵 7.5 | AW |
| 5 | New VM deployment with Encryption at Host (EAH) enabled fails with OS Provisioning Timed Out. Same d | Encryption at Host infrastructure prerequisites not met. Typical causes: unsuppo | Verify disk compatibility: az disk show --query "{sku:sku.name, created:timeCrea | 🔵 7.5 | AW |
| 6 | CVM disk/snapshot operations fail: 'Cannot create disk or snapshot by copying CVM disk from differen | CVM CMK-encrypted disks cannot be copied cross-subscription. Snapshot/copy opera | 1) Copy/snapshot CVM CMK disks within same subscription only. 2) Do not change s | 🔵 7.5 | AW |
| 7 | Enabling Encryption at Host fails because VM size does not support the EncryptionAtHost feature | Not all VM sizes support Encryption at Host. The VM must use a size with Encrypt | Check VM size support: 1) REST API: Resource Skus API, check EncryptionAtHostSup | 🔵 7.5 | AW |
| 8 | Need to switch Disk Encryption Set from system-assigned to user-assigned managed identity, or DES op | Customer requires user-assigned managed identity for DES (centralized identity m | CLI: 1) az disk-encryption-set identity remove --system-assigned 2) az identity  | 🔵 7.5 | AW |
| 9 | Microsoft Defender shows VM as non-compliant for encryption policy even after enabling ADE or Encryp | Missing prerequisites: System Assigned Managed Identity not enabled, Policy exte | Enable System Assigned Managed Identity on the VM. Verify the Policy extension i | 🔵 7.5 | AW |
| 10 | Need to enable or disable Encryption at Host for a Windows VM to encrypt data at the VM host level |  | Prerequisites: Register feature with Register-AzProviderFeature -FeatureName "En | 🔵 7.5 | AW |
| 11 | VM fails to start with error: KeyVaultKeyNotEnabled -- The key vault key used for disk encryption se | The Key Vault key configured in the Disk Encryption Set was disabled. Azure cann | 1. Navigate to Key Vault in the error message. 2. Keys > select the key > open C | 🔵 7.5 | AW |
| 12 | CVM DiskEncryptionSet type mismatch: 'The type of the Disk Encryption Set in the request is Confiden | User used a DES of type 'ConfidentialVmEncryptedWithCustomerKey' for SSE CMK enc | For CVM CMK encryption: use DES of type 'ConfidentialVmEncryptedWithCustomerKey' | 🔵 7.0 | AW |
| 13 | Windows VM screenshot shows Linux/Grub boot process instead of Windows boot - the VM is encrypted wi | CloudLink encryption uses a Linux-based machine to manage encryption keys. If th | Engage CloudLink support to troubleshoot key retrieval. If Bitlocker team involv | 🔵 6.5 | AW |
| 14 | Disk Encryption Set (DES) unable to update to new key version or perform operations - key vault acce | The system-assigned managed identity used by DES for authenticating with Key Vau | CLI: 1) az disk-encryption-set identity remove --system-assigned 2) az disk-encr | 🔵 6.5 | AW |
| 15 | Azure Advisor security recommendation "Virtual machines should enable Azure Disk Encryption or Encry | The recommendation requires 3 separate steps to be fully resolved, not just enab | Verify customer has completed all 3 steps: enable encryption + enable Guest Conf | 🔵 6.5 | AW |
| 16 | VM fails to start with error: KeyVaultSecretDoesNotExist -- The Key Vault secret with URL ... does n | The Key Vault secret (certificate) referenced by the VM has been disabled. CRP c | In Azure Portal: navigate to Key Vault > Secrets > find the referenced secret >  | 🔵 6.5 | AW |
| 17 | Auto-key rotation for CVM DiskEncryptionSet fails: 'Auto-key rotation for DiskEncryptionSet with Enc | Automatic key rotation is not supported for DES with EncryptionType 'Confidentia | Set rotationToLatestKeyVersionEnabled to false on the DES. Manual key rotation m | 🔵 6.0 | AW |
| 18 | Azure Site Recovery, Azure Dedicated Host, Customer-managed keys for OS disk pre-encryption, or Trus | These features are known preview restrictions for Nested Confidential VM series  | These are known preview limitations. Customer must wait for GA support or use al | 🔵 5.5 | AW |
| 19 | SSE+CMK encrypted VM in failed state, start fails with KeyVaultAccessForbidden. DES managed identity | Disk Encryption Set system-assigned managed identity does not have the required  | For KV Access Policy model: Navigate to DES overview, click the error to auto-gr | 🔵 5.0 | AW |
| 20 | Disk Encryption Set shows Invalid value found at accessPolicies TenantId error after moving VM/DES/K | System-assigned managed identity does not move across tenants. After subscriptio | 1) Set DES identity type to None via ARM template (Export template > Deploy > Ed | 🔵 5.0 | AW |
| 21 | SSE+CMK auto key rotation fails: Key Vault rotation policy creates new key version but DES does not  | Key rotation policy created a new key version in Key Vault but the Disk Encrypti | Customer should rotate the key manually (docs: https://learn.microsoft.com/en-us | 🔵 5.0 | AW |
| 22 | SSE+CMK encrypted VM fails to start with KeyVaultAccessTokenCannotBeAcquired error (403 Forbidden).  | MSI credential for Disk Encryption Set requires periodic backend updates by an a | First rule out: 1) Missing KV permissions (check Get/List/Unwrap/Wrap Key) 2) Ke | 🔵 5.0 | AW |
| 23 | Disk Encryption Set provisioning failed: Previous identity update is in failed state. Cannot update  | Previous system-assigned managed identity associated with the DES was soft-delet | 1) Engage AAD Team to verify the system-assigned managed identity is soft-delete | 🔵 5.0 | AW |
| 24 | SSE+CMK disk encryption update fails: Cannot update encryption properties for disk because it alread | Azure platform restriction: managed disk and all associated incremental snapshot | Option A (Azure Disk Backup): Go to Resiliency > Protection inventory > Protecte | 🔵 5.0 | AW |
| 25 | CMK storage account update fails with ManagedServiceIdentityNotFound error after the associated mana | The managed identity associated with the storage account for CMK encryption was  | Regenerate the managed identity: Set-AzStorageAccount -IdentityType None, then s | 🔵 5.0 | AW |
| 26 | Microsoft Defender shows VM as Not Compliant for encryption policy even after ADE or Encryption at H | Multiple possible causes: 1) VM is deallocated (known issue -- Defender cannot a | 1) Start the VM if deallocated. 2) Enable System Assigned Managed Identity. 3) V | 🔵 5.0 | AW |
| 27 | SSE+CMK fails for PremiumV2_LRS or UltraSSD_LRS disk: DiskEncryptionSet with UserAssigned identity t | User-assigned managed identities are not supported for Ultra Disks and Premium S | Create a new DiskEncryptionSet using system-assigned managed identity instead of | 🟡 4.0 | AW |
| 28 | SSE+CMK encrypted VM fails to start: Unable to access key - Key is expired. Key Vault key used by Di | The Key Vault key associated with the Disk Encryption Set has expired, preventin | Rotate the key: In Azure portal, go to Key Vault > Keys, select the expired key  | 🟡 4.0 | AW |
| 29 | Disk Encryption Set with Confidential disk encryption + CMK fails to grant KeyVault permissions with | Confidential VM Orchestrator service principal (AppId bf7b6499-ff71-4aa2-97a4-f3 | Register the service principal using Microsoft Graph SDK: Connect-Graph -Tenant  | 🟡 4.0 | AW |

## 快速排查路径

1. **Need to verify if SSE+CMK (Customer Managed Key) encryption is enabled on an Azu**
   - 方案: PowerShell: $disk = Get-AzDisk -ResourceGroupName $RG -DiskName $DiskName; $disk.Encryption.Type. Result "EncryptionAtRestWithCustomerKey" confirms SS
   - `[🔵 7.5 | AW]`

2. **VM fails to start with error: InternalDiskManagementError -- The given encryptio**
   - 根因: The DiskEncryptionSet system-assigned managed identity requires Get/Wrap Key/Unwrap Key permissions on the associated Ke
   - 方案: 1. In Azure Portal, go to Disk Encryption Set > Overview. If an error is shown, click it to auto-grant required KV permissions. 2. Alternatively, KV >
   - `[🔵 7.5 | AW]`

3. **Enabling Encryption at Host on a VM fails. The option is not available or return**
   - 根因: The EncryptionAtHost feature is not registered for the subscription. This feature requires explicit opt-in registration 
   - 方案: Register the feature: Register-AzProviderFeature -FeatureName "EncryptionAtHost" -ProviderNamespace "Microsoft.Compute". Check status: Get-AzProviderF
   - `[🔵 7.5 | AW]`

4. **Microsoft Defender shows VM as non-compliant for encryption policy/recommendatio**
   - 根因: Known issue: Defender cannot assess encryption compliance for deallocated VMs.
   - 方案: Start the VM so that Defender can recognize it as compliant. If still non-compliant after 30 min with VM running, verify prerequisites (SAMI, Policy e
   - `[🔵 7.5 | AW]`

5. **New VM deployment with Encryption at Host (EAH) enabled fails with OS Provisioni**
   - 根因: Encryption at Host infrastructure prerequisites not met. Typical causes: unsupported disk type/sector size (512e disks m
   - 方案: Verify disk compatibility: az disk show --query "{sku:sku.name, created:timeCreated}". Check VM size supports EAH: az vm list-skus -l <region>. Use ne
   - `[🔵 7.5 | AW]`


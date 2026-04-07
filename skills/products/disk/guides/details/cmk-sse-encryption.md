# Disk CMK & SSE Encryption — 详细速查

**条目数**: 5 | **类型**: 📊 速查（无融合素材）
**生成日期**: 2026-04-07

---

### 1. Storage account blob access returns InternalError from portal - CMK encryption configured but MSI id

**分数**: 🟢 9 | **来源**: [MCVKB] | **置信度**: high
**21V 适用**: ✅ 是

**根因**: Storage account has CMK encryption with Key Vault but MSI was set to None via CLI. Without MSI the SA cannot authenticate to Key Vault to retrieve encryption key

**方案**: 1) Check Xportal metadata: msiIdentityType=None with keyVaultUri configured. 2) Search ARM logs for PATCH that changed --identity-type. 3) Fix: re-assign MSI identity. 4) Customer misconfiguration: CLI allows setting identity to None with CMK enabled

**标签**: storage-account, CMK, MSI, identity, InternalError, Key-Vault, encryption

---

### 2. VMs with customer-managed key (CMK) encrypted disks auto-shutdown. Disk I/O (read/write) fails appro

**分数**: 🔵 7.5 | **来源**: [MS Learn] | **置信度**: high
**21V 适用**: ✅ 是

**根因**: When a customer-managed key in Azure Key Vault is disabled, deleted, or expired, managed disks can no longer unwrap the data encryption key (DEK). VMs automatically shut down and won't boot until the key issue is resolved.

**方案**: Re-enable the key in Key Vault, restore deleted key (if soft-delete/purge protection enabled), or assign a new key to the DiskEncryptionSet. Enable auto-key-rotation to prevent future expiry issues. Ensure Key Vault has purge protection enabled. Note: moving subscription between AAD tenants breaks CMK association.

**标签**: CMK, customer-managed-key, DiskEncryptionSet, Key-Vault, auto-shutdown, encryption, SSE

---

### 3. Creating DiskEncryptionSet fails with Cannot find the Active Directory object error when granting Ke

**分数**: 🔵 7.5 | **来源**: [MS Learn] | **置信度**: high
**21V 适用**: ✅ 是

**根因**: After creating DiskEncryptionSet, Azure needs minutes to create managed identity in Entra ID. Identity not yet propagated when access policy runs.

**方案**: Wait a few minutes and retry. DES identity needs Get/WrapKey/UnwrapKey on Key Vault. Use az disk-encryption-set show to get principalId. Key Vault must have soft-delete and purge protection.

**标签**: CMK, DiskEncryptionSet, KeyVault, managed-identity, SSE

---

### 4. CMK encryption stops working after moving subscription/RG/disk to different Entra tenant. VMs fail t

**分数**: 🔵 7.5 | **来源**: [MS Learn] | **置信度**: high
**21V 适用**: ✅ 是

**根因**: CMK relies on managed identities. Cross-tenant move does not transfer managed identity. DiskEncryptionSet loses Key Vault access.

**方案**: Reassign managed identity to DES. Grant new identity permissions in Key Vault. DES/disks/snapshots must be same subscription/region. Key Vault can differ subscription but same region.

**标签**: CMK, cross-tenant, managed-identity, DiskEncryptionSet, Entra-ID

---

### 5. Cannot disable CMK on managed disk with incremental snapshots. Reverting to platform-managed key blo

**分数**: 🔵 7.5 | **来源**: [MS Learn] | **置信度**: high
**21V 适用**: ✅ 是

**根因**: Platform restriction: once CMK enabled on disk with incremental snapshots, cannot be disabled. All incremental snapshots must share same DiskEncryptionSet.

**方案**: Copy all data to different managed disk not using CMK via az disk create --source or New-AzDiskConfig -CreateOption Copy.

**标签**: CMK, incremental-snapshot, DiskEncryptionSet, copy-disk

---


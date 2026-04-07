# Disk CMK & SSE Encryption — 排查速查

**来源数**: 5 | **21V**: 全部适用
**最后更新**: 2026-04-07
**关键词**: auto-shutdown, cmk, copy-disk, cross-tenant, customer-managed-key, diskencryptionset, encryption, entra-id, identity, incremental-snapshot

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Storage account blob access returns InternalError from portal - CMK encryption configured but MSI identity is None | Storage account has CMK encryption with Key Vault but MSI was set to None via CLI. Without MSI the S | 1) Check Xportal metadata: msiIdentityType=None with keyVaultUri configured. 2) Search ARM logs for PATCH that changed - | 🟢 9 | [MCVKB] |
| 2 | VMs with customer-managed key (CMK) encrypted disks auto-shutdown. Disk I/O (read/write) fails approximately 1 hour afte | When a customer-managed key in Azure Key Vault is disabled, deleted, or expired, managed disks can n | Re-enable the key in Key Vault, restore deleted key (if soft-delete/purge protection enabled), or assign a new key to th | 🔵 7.5 | [MS Learn] |
| 3 | Creating DiskEncryptionSet fails with Cannot find the Active Directory object error when granting Key Vault access polic | After creating DiskEncryptionSet, Azure needs minutes to create managed identity in Entra ID. Identi | Wait a few minutes and retry. DES identity needs Get/WrapKey/UnwrapKey on Key Vault. Use az disk-encryption-set show to  | 🔵 7.5 | [MS Learn] |
| 4 | CMK encryption stops working after moving subscription/RG/disk to different Entra tenant. VMs fail to boot or disk I/O f | CMK relies on managed identities. Cross-tenant move does not transfer managed identity. DiskEncrypti | Reassign managed identity to DES. Grant new identity permissions in Key Vault. DES/disks/snapshots must be same subscrip | 🔵 7.5 | [MS Learn] |
| 5 | Cannot disable CMK on managed disk with incremental snapshots. Reverting to platform-managed key blocked. | Platform restriction: once CMK enabled on disk with incremental snapshots, cannot be disabled. All i | Copy all data to different managed disk not using CMK via az disk create --source or New-AzDiskConfig -CreateOption Copy | 🔵 7.5 | [MS Learn] |

## 快速排查路径

1. Storage account blob access returns InternalError from portal - CMK encryption c → 1) Check Xportal metadata: msiIdentityType=None with keyVaultUri configured `[来源: onenote]`
2. VMs with customer-managed key (CMK) encrypted disks auto-shutdown. Disk I/O (rea → Re-enable the key in Key Vault, restore deleted key (if soft-delete/purge protection enabled), or as `[来源: mslearn]`
3. Creating DiskEncryptionSet fails with Cannot find the Active Directory object er → Wait a few minutes and retry `[来源: mslearn]`
4. CMK encryption stops working after moving subscription/RG/disk to different Entr → Reassign managed identity to DES `[来源: mslearn]`
5. Cannot disable CMK on managed disk with incremental snapshots. Reverting to plat → Copy all data to different managed disk not using CMK via az disk create --source or New-AzDiskConfi `[来源: mslearn]`

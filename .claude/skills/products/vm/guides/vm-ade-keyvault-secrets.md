# VM ADE KeyVault 密钥管理 — 排查速查

**来源数**: 1 (AW) | **条目**: 12 | **21V**: 全部
**最后更新**: 2026-04-24

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Azure Disk Encryption (ADE) extension installation blocked on new VMs/VMSS, or ADE-encrypted VMs fai | ADE is being retired on 15 Sep 2028. Timeline: Sep 2026 → new enablement blocked | Migrate from ADE to Encryption at Host before Sep 2028. Follow migration guide:  | 🔵 7.5 | AW |
| 2 | Azure Key Vault key or secret expiration causes ADE or SSE+CMK encrypted VMs to fail to start withou | No alert mechanism configured to notify when Key Vault keys or secrets approach  | Configure Event Grid integration with Logic App on Key Vault to monitor Certific | 🔵 7.5 | AW |
| 3 | ADE encryption fails with 0xc1425072 RUNTIME_E_KEYVAULT_SET_SECRET_FAILED Failed to set secret to Ke | Key Vault missing required access permissions: Wrap/Unwrap key permissions not g | In Key Vault Access Configuration: enable Azure Disk Encryption for volume encry | 🔵 7.5 | AW |
| 4 | ADE encryption fails with 0xc1425072 RUNTIME_E_KEYVAULT_SET_SECRET_FAILED and Key Vault log shows 'S | Azure Policy 'Key Vault secrets should have an expiration date' with Deny effect | Go to Azure Policy > Definitions, find the policy requiring secret expiration da | 🔵 7.5 | AW |
| 5 | VM fails to start or ADE-encrypted VM becomes inaccessible because the Azure Key Vault key or secret | Customer was not aware of key/secret expiration in Azure Key Vault. There is no  | Set up Key Vault expiration alerts using Event Grid + Logic App: 1) Register Mic | 🔵 6.5 | AW |
| 6 | Attaching an ADE-encrypted managed disk as a data disk to another VM fails with: Disk contains encry | Disk-level encryption settings prevent attaching an encrypted OS disk as a data  | Copy the managed disk VHD to a storage account (Grant-AzDiskAccess + Start-AzSto | 🔵 6.5 | AW |
| 7 | ADE encryption fails with 0xc142506f RUNTIME_E_KEYVAULT_SECRET_WRAP_WITH_KEK_FAILED or Bad Length er | KEK (Key Encryption Key) in Key Vault is expired or disabled, preventing ADE fro | Check Key Vault key status: if expired, renew the key; if disabled, re-enable it | 🔵 6.5 | AW |
| 8 | VM Start/Stop/PUT/PATCH operations fail with 'The key vault key is not found to unwrap the encryptio | Storage account uses Customer Managed Keys for encryption at rest, and the key v | Verify the Key Vault key version is current, ensure the key is not deleted/disab | 🔵 6.5 | AW |
| 9 | Starting an ADE-encrypted VM (stopped/deallocated) fails with DiskEncryptionInternalError: Internal  | The secret and/or key used for Azure Disk Encryption has been deleted from the K | 1) Re-enable Key Vault access policies: enable Azure Disk Encryption for volume  | 🔵 5.0 | AW |
| 10 | ADE encryption fails with error: secret does not have DiskEncryptionKeyEncryptionAlgorithm tags. Key | When an Azure subscription is moved from tenant A to tenant B, existing Key Vaul | 1) Update Key Vault tenant ID: Set-AzureRmResource to change TenantId to new ten | 🔵 5.0 | AW |
| 11 | VM Start/Stop/PUT/PATCH operations fail with 403 Forbidden: The key vault key is not found to unwrap | Storage account uses Customer Managed Keys (CMK) for encryption at rest, and the | 1) Verify Key Vault has the correct key name and latest version matching ASC. 2) | 🔵 5.0 | AW |
| 12 | ADE encryption fails with error: Keyvault not found in the directory. | The Key Vault is not in the same Azure AD tenant as the AD Application used for  | Ensure the Key Vault and the AD Application are in the same Azure AD tenant. | 🟡 4.0 | AW |

## 快速排查路径

1. **Azure Disk Encryption (ADE) extension installation blocked on new VMs/VMSS, or A**
   - 根因: ADE is being retired on 15 Sep 2028. Timeline: Sep 2026 → new enablement blocked (portal and extension install); Sep 202
   - 方案: Migrate from ADE to Encryption at Host before Sep 2028. Follow migration guide: https://learn.microsoft.com/en-us/azure/virtual-machines/disk-encrypti
   - `[🔵 7.5 | AW]`

2. **Azure Key Vault key or secret expiration causes ADE or SSE+CMK encrypted VMs to **
   - 根因: No alert mechanism configured to notify when Key Vault keys or secrets approach expiration
   - 方案: Configure Event Grid integration with Logic App on Key Vault to monitor CertificateNearExpiry, KeyNearExpiry, SecretNearExpiry events. Register Micros
   - `[🔵 7.5 | AW]`

3. **ADE encryption fails with 0xc1425072 RUNTIME_E_KEYVAULT_SET_SECRET_FAILED Failed**
   - 根因: Key Vault missing required access permissions: Wrap/Unwrap key permissions not granted, or Azure Disk Encryption for vol
   - 方案: In Key Vault Access Configuration: enable Azure Disk Encryption for volume encryption. For ARM deployments also enable Azure Virtual Machines for depl
   - `[🔵 7.5 | AW]`

4. **ADE encryption fails with 0xc1425072 RUNTIME_E_KEYVAULT_SET_SECRET_FAILED and Ke**
   - 根因: Azure Policy 'Key Vault secrets should have an expiration date' with Deny effect blocks ADE from creating secrets withou
   - 方案: Go to Azure Policy > Definitions, find the policy requiring secret expiration dates. Remove the policy assignment or change effect from Deny to Audit.
   - `[🔵 7.5 | AW]`

5. **VM fails to start or ADE-encrypted VM becomes inaccessible because the Azure Key**
   - 根因: Customer was not aware of key/secret expiration in Azure Key Vault. There is no built-in Azure Monitor alert for key exp
   - 方案: Set up Key Vault expiration alerts using Event Grid + Logic App: 1) Register Microsoft.EventGrid resource provider, 2) Create a Logic App triggered by
   - `[🔵 6.5 | AW]`


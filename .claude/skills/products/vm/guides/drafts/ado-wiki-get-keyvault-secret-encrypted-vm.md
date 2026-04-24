---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Encryption/How Tos/Azure Disk Encryption (ADE)/Get Keyvault Secret Used by Encrypted VM_Encryption"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Encryption%2FHow%20Tos%2FAzure%20Disk%20Encryption%20(ADE)%2FGet%20Keyvault%20Secret%20Used%20by%20Encrypted%20VM_Encryption"
importDate: "2026-04-23"
type: guide-draft
---

# Get Keyvault Secret Used by Encrypted VM

## Scenario

Customer wants to recover an encrypted VHD and needs to know the secret to download the BEK file and unlock/recover the VHD.

## Windows VM

1. Get VM model details with encryption settings:
   ```powershell
   Get-AzVM -ResourceGroupName <RG> -Name <VM> -DisplayHint Expand
   ```
2. Find the SecretUrl in the output - it contains the BEK file name and version.
3. Alternative narrow query:
   ```powershell
    = Get-AzVM -ResourceGroupName <RG> -Name <VM>
   .StorageProfile.OsDisk.EncryptionSettings.DiskEncryptionKey.SecretUrl
   ```
4. Can also check in Keyvault portal directly.
5. Windows ADE extension creates tags on the Secret: MachineName, VolumeLetter (makes it easy to identify which VM uses which secret).

## Linux VM

1. Same PowerShell commands to get the SecretUrl.
2. Note: Linux ADE extension does NOT create MachineName/VolumeLetter tags on the secret.
3. Use the SecretUrl to download the BEK/secret from Key Vault.

## Key Points

- SecretUrl format contains the BEK name and version
- Windows secrets have VM identification tags; Linux secrets do not
- Use this to recover encrypted VHDs by downloading the BEK and unlocking offline

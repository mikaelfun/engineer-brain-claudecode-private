---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Encryption/How Tos/Azure Disk Encryption (ADE)/Convert BEK to KEK_Encryption"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Encryption%2FHow%20Tos%2FAzure%20Disk%20Encryption%20(ADE)%2FConvert%20BEK%20to%20KEK_Encryption"
importDate: "2026-04-23"
type: guide-draft
---

# Convert BEK to KEK Encryption

## Summary

Customers who have encrypted their VM using only BEK and now need to enable KEK to take advantage of Azure Backup and Recovery can follow these steps. You do not need to decrypt your VM.

## Prerequisites

- Azure PowerShell installed
- VM encrypted with BEK (single-pass ADE)
- Key Vault with a KEK key created

## Instructions for Single Pass Encryption

1. Install Azure PowerShell
2. Connect to Azure account:
   ```powershell
   Connect-AzAccount
   ```
3. Get current encryption settings:
   ```powershell
   Get-AzVmDiskEncryptionStatus -ResourceGroupName <RG> -VMName <VM>
   ```
4. Create a KEK in the Key Vault:
   ```powershell
   Add-AzKeyVaultKey -VaultName <KV> -Name <KeyName> -Destination Software
   ```
5. Re-run encryption with KEK:
   ```powershell
   Set-AzVmDiskEncryptionExtension -ResourceGroupName <RG> -VMName <VM> -DiskEncryptionKeyVaultUrl <KVUrl> -DiskEncryptionKeyVaultId <KVId> -KeyEncryptionKeyUrl <KEKUrl> -KeyEncryptionKeyVaultId <KVId>
   ```
6. Verify the encryption status shows KEK is now enabled.

## Notes

- For Dual Pass encryption, the process differs (see Disable Dual Pass guide)
- Always verify encryption status after the operation
- Azure Backup requires KEK-based encryption for backup/restore scenarios

## References

- [Convert BEK Disk Encryption to KEK for Azure Recovery Services](https://blogs.msdn.microsoft.com/mast/2016/11/28/azure-disk-encryption-how-to-encrypt-azure-resource-manager-iaas-vm-using-kek/)
- [Backup and restore encrypted VMs using Azure Backup](https://docs.microsoft.com/en-us/azure/backup/backup-azure-vms-encryption)

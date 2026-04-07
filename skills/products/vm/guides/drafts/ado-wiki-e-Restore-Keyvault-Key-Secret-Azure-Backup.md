---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:%2FSME%20Topics%2FAzure%20Encryption%2FHow%20Tos%2FAzure%20Disk%20Encryption%20%28ADE%29%2FHow%20to%20restore%20keyvault%20key%20and%20secret%20for%20encrypted%20VMs%20using%20Azure%20Backup_Encryption"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Azure-Encryption
- cw.How-To
- cw.Reviewed-06-2024
---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::



[[_TOC_]]

#Summary
 
If your key and secret does not exist in your key vault, then we can use Azure Backup of encrypted VMs to restore the key and secret to the key vault. These 
steps can also be used if you want to maintain a separate copy of the key (Key Encryption Key) and secret (Bitlocker Encryption Key) for the restored VM.

#Pre-Requisites

- Backup encrypted VMs - Encrypted Azure VMs have been backed up using Azure Backup. Refer this [document](https://learn.microsoft.com/en-us/azure/backup/backup-azure-vms-automation) to backup the VM.
- Configure Azure Key Vault – Ensure that key vault to which keys and secrets need to be restored is already present. 
- Restore disk - Ensure that you've triggered the restore job for restoring disks for encrypted VM using [PowerShell steps](https://learn.microsoft.com/en-us/azure/backup/backup-azure-vms-automation#restore-an-azure-vm). 
This is because this job generates a JSON file in your storage account containing keys and secrets for the encrypted VM to be restored.

#Instructions

## 1. Restore Encrypted VMs

```
Note: Encrypted VMs can only be restored by restoring the VM disk and creating a virtual machine instance as explained below. 
Replace existing disk on the existing VM, creating a VM from restore points and files or folder level restore are currently not supported.
```

### Step 1: Select the VM
To get the PowerShell object that identifies the right backup item, start from the container in the vault, and work your way down the object hierarchy. 
To select the container that represents the VM, use the `Get-AzRecoveryServicesBackupContainer` cmdlet and pipe that to the `Get-AzRecoveryServicesBackupItem` cmdlet.

```powershell
$targetVaultID = Get-AzRecoveryServicesVault -ResourceGroupName "<ResourceGroupName>" -Name "<KeyVaultName>" | select -ExpandProperty ID
$namedContainer = Get-AzRecoveryServicesBackupContainer  -ContainerType "AzureVM"  -FriendlyName "<VMName>" -VaultId $targetVaultID
$backupitem = Get-AzRecoveryServicesBackupItem -Container $namedContainer  -WorkloadType "AzureVM" -VaultId $targetVaultID
```
### Step 2: Choose a recovery point
Use the `Get-AzRecoveryServicesBackupRecoveryPoint` cmdlet to list all recovery points for the backup item. Then choose the recovery point to restore. 
If you're unsure which recovery point to use, it's a good practice to choose the most recent RecoveryPointType = AppConsistent point in the list.

In the following script, the variable, `$rp`, is an array of recovery points for the selected backup item, from the past seven days. 
The array is sorted in reverse order of time with the latest recovery point at index 0. Use standard PowerShell array indexing to pick the recovery point. 
In the example, `$rp[0]` selects the latest recovery point.

```powershell
$startDate = (Get-Date).AddDays(-7)
$endDate = Get-Date
$rp = Get-AzRecoveryServicesBackupRecoveryPoint -Item $backupitem -StartDate $startdate.ToUniversalTime() -EndDate $enddate.ToUniversalTime() -VaultId $targetVault.ID
$rp[0]
```
![ADE1](/.attachments/SME-Topics/Azure-Encryption/ADE1.png)

### Step 3: Restore the disks
Use the `Restore-AzRecoveryServicesBackupItem` cmdlet to restore a backup item's data and configuration to a recovery point. 
Once you identify a recovery point, use it as the value for the -RecoveryPoint parameter. 
In the sample above, $rp[0] was the recovery point to use. In the following sample code, $rp[0] is the recovery point to use for restoring the disk.

To restore the disks and configuration information:

```powershell
$vault = Get-AzRecoveryServicesVault -Name '<KeyVaultName>'          
Set-AzRecoveryServicesVaultContext -Vault $vault
$restorejob = Restore-AzRecoveryServicesBackupItem -RecoveryPoint $rp[0] -StorageAccountName "DestAccount" -StorageAccountResourceGroupName "DestRG" -TargetResourceGroupName "DestRGforManagedDisks" -VaultId $targetVaultID
$restorejob
```
The **VMConfig.JSON** file will be restored to the storage account and the managed disks will be restored to the specified target RG.

![ADE2](/.attachments/SME-Topics/Azure-Encryption/ADE2.png)

Use the `Wait-AzRecoveryServicesBackupJob` cmdlet to wait for the Restore job to complete.

```powershell
Wait-AzRecoveryServicesBackupJob -Job $restorejob -Timeout 43200
```

Once the Restore job has completed, use the `Get-AzRecoveryServicesBackupJobDetail` cmdlet to get the details of the restore operation. 
The `Details` property has the information needed to rebuild the VM.

```powershell
$restorejob = Get-AzRecoveryServicesBackupJob -Job $restorejob -VaultId $targetVaultID
$details = Get-AzRecoveryServicesBackupJobDetail -Job $restorejob -VaultId $targetVaultID
```
![ADE3](/.attachments/SME-Topics/Azure-Encryption/ADE3.png)

## 2. Restore Key and Secret from Backed Up VM

### Step 1: Get key and secret from Azure Backup

Once disk has been restored for the encrypted VM, ensure that:
- `$details` is populated with restore disk job details, as mentioned in PowerShell steps in Restore the Disks section.
- VM should be created from restored disks only after key and secret is restored to key vault.

Query the restored disk properties for the job details.

```powershell
$properties = $details.properties
$storageAccountName = $properties["Target Storage Account Name"]
$containerName = $properties["Config Blob Container Name"]
$encryptedBlobName = $properties["Encryption Info Blob Name"]
```
![ADE4](/.attachments/SME-Topics/Azure-Encryption/ADE4.png)

You would get the above details in the VHD that has been copied to the storage account.

![ADE5](/.attachments/SME-Topics/Azure-Encryption/ADE5.png)

Set the Azure storage context and restore JSON configuration file containing key and secret details for encrypted VM.

```powershell
Set-AzCurrentStorageAccount -Name $storageaccountname -ResourceGroupName '<rg-name>'
$destination_path = 'C:\vmencryption_config.json'
Get-AzStorageBlobContent -Blob $encryptedBlobName -Container $containerName -Destination $destination_path
$encryptionObject = Get-Content -Path $destination_path  | ConvertFrom-Json
```

### Step 2: Restore key
Once the JSON file is generated in the destination path mentioned above, 
generate key blob file from the JSON and feed it to restore key cmdlet to put the key (KEK) back in the key vault.

```powershell
$keyDestination = 'C:\keyDetails.blob'
[io.file]::WriteAllBytes($keyDestination, [System.Convert]::FromBase64String($encryptionObject.OsDiskKeyAndSecretDetails.KeyBackupData))
Restore-AzureKeyVaultKey -VaultName '<target_key_vault_name>' -InputFile $keyDestination
```
![ADE6](/.attachments/SME-Topics/Azure-Encryption/ADE6.png)

Verify the same from portal if the key is copied to the key vault.

![ADE7](/.attachments/SME-Topics/Azure-Encryption/ADE7.png)

### Step 3: Restore Secret
Use the JSON file generated above to get secret name and value and feed it to set secret cmdlet to put the secret (BEK) back in the key vault. 

Use these cmdlets if your VM is encrypted using BEK and KEK.

```powershell
$secretdata = $encryptionObject.OsDiskKeyAndSecretDetails.SecretData
$Secret = ConvertTo-SecureString -String $secretdata -AsPlainText -Force
$secretname = 'B3284AAA-DAAA-4AAA-B393-60CAA848AAAA'
$Tags = @{'DiskEncryptionKeyEncryptionAlgorithm' = 'RSA-OAEP';'DiskEncryptionKeyFileName' = 'B3284AAA-DAAA-4AAA-B393-60CAA848AAAA.BEK';'DiskEncryptionKeyEncryptionKeyURL' = $encryptionObject.OsDiskKeyAndSecretDetails.KeyUrl;'MachineName' = 'vm-name'}
Set-AzKeyVaultSecret -VaultName '<target_key_vault_name>' -Name $secretname -SecretValue $Secret -ContentType  'Wrapped BEK' -Tags $Tags
```

![ADE8](/.attachments/SME-Topics/Azure-Encryption/ADE8.png)

You can also verify from portal.

![ADE9](/.attachments/SME-Topics/Azure-Encryption/ADE9.png)

# Conclusion

If you've backed up encrypted VM using Azure VM Backup, the PowerShell cmdlets mentioned above help you restore key and secret back to the key vault. 
After restoring them, refer to the article [Manage backup and restore of Azure VMs using PowerShell](https://learn.microsoft.com/en-us/azure/backup/backup-azure-vms-automation#create-a-vm-from-restored-disks) to create encrypted VMs from restored disk, key, 
and secret.

::: template /.templates/Processes/Knowledge-Management/Azure-ADE-Feedback-Template.md
:::

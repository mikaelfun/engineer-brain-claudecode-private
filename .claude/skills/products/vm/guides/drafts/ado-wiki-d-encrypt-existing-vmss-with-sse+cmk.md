---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Encryption/How Tos/Server Side Encryption (SSE)/Encrypt Existing VMSS with SSE+CMK_Encryption"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Encryption%2FHow%20Tos%2FServer%20Side%20Encryption%20(SSE)%2FEncrypt%20Existing%20VMSS%20with%20SSE%2BCMK_Encryption"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Encrypt Existing VMSS with SSE+CMK

## Summary

How to encrypt existing VMSS (Virtual Machine Scale Set) with SSE+CMK. Available for both Linux and Windows VMSS including OS and data disks. Only available via PowerShell and CLI (not Portal).

## Prerequisites

1. Create a Key Vault with purge protection
2. Create a Disk Encryption Set (DES)
3. Set access policy for DES to communicate with Key Vault

## Steps

### 1. Create Key Vault and Key

```powershell
$ResourceGroupName = "yourResourceGroupName"
$LocationName = "westcentralus"
$keyVaultName = "yourKeyVaultName"
$keyName = "yourKeyName"

$keyVault = New-AzKeyVault -Name $keyVaultName -ResourceGroupName $ResourceGroupName -Location $LocationName -EnablePurgeProtection
$key = Add-AzKeyVaultKey -VaultName $keyVaultName -Name $keyName -Destination "Software"
```

### 2. Create Disk Encryption Set

```powershell
$diskEncryptionSetName = "yourDiskEncryptionSetName"
$desConfig = New-AzDiskEncryptionSetConfig -Location $LocationName -SourceVaultId $keyVault.ResourceId -KeyUrl $key.Key.Kid -IdentityType SystemAssigned
$des = New-AzDiskEncryptionSet -Name $diskEncryptionSetName -ResourceGroupName $ResourceGroupName -InputObject $desConfig
Set-AzKeyVaultAccessPolicy -VaultName $keyVaultName -ObjectId $des.Identity.PrincipalId -PermissionsToKeys wrapkey,unwrapkey,get
```

### 3. Encrypt OS Disk in VMSS

```powershell
$vmssname = "name of the vmss"
$diskencryptionsetname = "name of the diskencryptionset"
$vmssrgname = "vmss resourcegroup name"
$diskencryptionsetrgname = "diskencryptionset resourcegroup name"

$ssevmss = Get-AzVmss -ResourceGroupName $vmssrgname -VMScaleSetName $vmssname
$ssevmss.VirtualMachineProfile.StorageProfile.OsDisk.ManagedDisk.DiskEncryptionSet = New-Object -TypeName Microsoft.Azure.Management.Compute.Models.DiskEncryptionSetParameters
$des = Get-AzDiskEncryptionSet -ResourceGroupName $diskencryptionsetrgname -Name $diskencryptionsetname
$ssevmss.VirtualMachineProfile.StorageProfile.OsDisk.ManagedDisk.DiskEncryptionSet.id = $des.Id
$ssevmss | Update-AzVmss
```

### 4. Encrypt OS + Data Disks

Add data disk encryption after OS disk setup:

```powershell
$ssevmss.VirtualMachineProfile.StorageProfile.DataDisks | foreach {
    $_.ManagedDisk.DiskEncryptionSet = New-Object -TypeName Microsoft.Azure.Management.Compute.Models.DiskEncryptionSetParameters
    $_.ManagedDisk.DiskEncryptionSet.Id = $des.Id
}
$ssevmss | Update-AzVmss
```

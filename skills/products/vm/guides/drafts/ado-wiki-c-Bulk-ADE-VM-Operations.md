---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Encryption/How Tos/Azure Disk Encryption (ADE)/Bulk ADE VM Operations_Encryption"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Azure%20Encryption/How%20Tos/Azure%20Disk%20Encryption%20%28ADE%29/Bulk%20ADE%20VM%20Operations_Encryption"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Azure-Encryption
- cw.How-To
---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::



[[_TOC_]]

##Summary

There are only two scenarios where the steps below will be helpful: 
1-	Encrypting Windows VMs with Single Pass by first time 
2-	Decrypting Windows VMs which were encrypted with Single Pass 

**Note: This does not work for VMs with dual pass**

##Considerations
<li>Make sure the VMs are running.</li>
<li>Virtual Machine Scale Sets – would require different cmdlets.</li>
<li>If Azure Backup/ Azure Site Recovery are being used at the same time these steps may need to be adjusted to reflect that or to make sense for the customer scenario (restoring from backups will be different after this point).</li>  
<li>Key vault resources remain in the user subscription and are billed to the user.  This might not be obvious to them.</li>
<li>If the user deletes the key vault they will not be able to restore from an older backup.</li>
<li>If Azure Security Center is enabled on the subscription it will detect that the VM’s are no longer encrypted.</li>
<li>If customer has an advanced configuration – such as on Windows storage spaces, or containers, or on Linux a custom LVM scheme or docker, then special steps may not be required.</li>
<li>If the VMs on the resource group uses a different keyvault each one, then this will not work.</li>

##Bulk Encryption of VMs with BEK

1. Get virtual machines for a specific resource group

     ``` 
     $vmlist = Get-AzVM -ResourceGroupName "BulkEncryption"; 
      ``` 

2. Get the keyvault used to encrypt the VMs on that resource group. This will get only one keyvault so it is important to clarify this should be the one used for the VMs on that resource group.

     ``` 
     $KeyVault = Get-AzKeyVault -VaultName BulkKV1 -ResourceGroupName "BulkEncryption"

    ``` 
3. This loop will be in charge of enabling the encryption and installing the extension. 
     ``` 
     foreach($vm in $vmlist)
     {
     Set-AzVMDiskEncryptionExtension -ResourceGroupName $vm.ResourceGroupName -VMName $vm.Name -DiskEncryptionKeyVaultUrl $KeyVault.VaultUri -DiskEncryptionKeyVaultId $KeyVault.ResourceId -Confirm true 
     }
    ```
##Disable and Remove of ADE in Bulk

1. Get virtual machines for a specific resource group 
    ``` 
     $vmlist = Get-AzVM -ResourceGroupName "BulkEncryption";
      ``` 

2. This loop will be in charge of disable the encryption and remove the extension. 
    ``` 
    foreach($vm in $vmlist) {
    Disable-AzVMDiskEncryption -ResourceGroupName $vm.ResourceGroupName -VMName $vm.Name -VolumeType "all" -Confirm 
    Remove-AzVMDiskEncryptionExtension -ResourceGroupName $vm.ResourceGroupName -VMName $vm.Name -Confirm
    }
    ```
**You will get the confirmation boxes below where you must indicate Y to proceed with the operation.**


##Bulk Encryption of VMs with KEK

1. Get virtual machines for a specific resource group

     ``` 
      $vmlist = Get-AzVM -ResourceGroupName "BulkEncryption"; 

      ``` 
2. Get the keyvault used to encrypt the VMs on that resource group. This will get only one keyvault so it is important to clarify this should be the one used for the VMs on that resource group.

     ``` 
     $KeyVault = Get-AzKeyVault -VaultName "BulkKV1" -ResourceGroupName "BulkEncryption"

    ``` 
3. Name of the key used for the encryption 

     ``` 
      $keyEncryptionKeyName = 'MyKey';

     ``` 
This will get the URL automatically. 

      
        $keyEncryptionKeyUrl = (Get-AzKeyVaultKey -VaultName "BulkKV1" -Name $keyEncryptionKeyName).Key.kid;

     
4. This loop will be in charge of enabling the encryption and installing the extension. 
    ``` 
    foreach($vm in $vmlist)
    {
    Set-AzVMDiskEncryptionExtension -ResourceGroupName $vm.ResourceGroupName -VMName $vm.Name -DiskEncryptionKeyVaultUrl $KeyVault.VaultUri -DiskEncryptionKeyVaultId $KeyVault.ResourceId -KeyEncryptionKeyUrl $keyEncryptionKeyUrl -KeyEncryptionKeyVaultId $KeyVault.ResourceId -VolumeType "All"
    }

    ```
5. Once it succeeds you should get an output like this

RequestId IsSuccessStatusCode StatusCode ReasonPhrase
--------- ------------------- ---------- ------------
                         True         OK OK
                         True         OK OK
                         True         OK OK



::: template /.templates/Processes/Knowledge-Management/Azure-ADE-Feedback-Template.md
:::


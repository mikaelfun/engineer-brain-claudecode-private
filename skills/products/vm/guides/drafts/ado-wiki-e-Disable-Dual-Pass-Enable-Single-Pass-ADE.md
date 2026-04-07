---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:%2FSME%20Topics%2FAzure%20Encryption%2FHow%20Tos%2FAzure%20Disk%20Encryption%20%28ADE%29%2FDisable%20Dual%20Pass%20and%20Enable%20Single%20Pass%20ADE%20Extension_Encryption"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Azure-Encryption
- cw.How-To
- cw.Reviewed-01-2025
---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::

 

[[_TOC_]]


## Summary

In this TSG, you will learn how to disable ADE Dual Pass and enable Single Pass in Windows. Steps can be found here: [How to Disable ADE DP and Enable ADE SP](https://gist.github.com/ejarvi/9f9b69247cbf3d77c113464260ef9fde).

**Note: If you are seeking to migrate from Dual Pass to Single Pass, we highly recommend using the migration steps as per [how to - Migrate From Dual Pass to Single Pass extension](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/501737) or the public document [Upgrading the Azure Disk Encryption version](https://docs.microsoft.com/en-us/azure/virtual-machines/linux/disk-encryption-upgrade?tabs=CLI).**

**Note: These instructions are currently for Windows only. On Linux, decrypting volumes is not supported once the OS drive has been encrypted.**

**Warning: If the VM was DP encrypted using the AAD Client Certificate option (rather than client secret/password), these steps do not include the instructions needed to remove the old client certificate information from the VM model.**

## Instructions

On Windows, a VM that has been encrypted with AAD credentials ("dual pass" or "DP") can be fully decrypted and returned to a clean start state. Then, it can be re-encrypted without AAD credentials ("single pass" or "SP") using the following sequence:

1. Enable DP (with AAD credentials)
    ```powershell
    $VMRGName = "myrg"
    $vmName = "myvm"
    $aadClientID = "myaadclient"
    $aadClientSecret = "myaadsecret"
    $KeyVaultName = "mykv"
    $keyEncryptionKeyName = "mykek"
    $diskEncryptionKeyVaultUrl = "https://mykv.vault.azure.net/"
    $KeyVaultResourceId = "/subscriptions/abc/resourceGroups/myrg/providers/Microsoft.KeyVault/vaults/mykv"

    Set-AzVmDiskEncryptionExtension -ResourceGroupName $VMRGName -VMName $vmName -AadClientID $aadClientID -AadClientSecret $aadClientSecret -DiskEncryptionKeyVaultUrl $diskEncryptionKeyVaultUrl -DiskEncryptionKeyVaultId $KeyVaultResourceId
    ```

    Expected result:
    ```powershell
    Enable AzureDiskEncryption on the VM
    This cmdlet prepares the VM and enables encryption which may reboot the machine and takes 10-15 minutes to finish.
    Please save your work on the VM before confirming. Do you want to continue?
    [Y] Yes  [N] No  [S] Suspend  [?] Help (default is "Y"): Y
    RequestId IsSuccessStatusCode StatusCode ReasonPhrase
    --------- ------------------- ---------- ------------
    True         OK OK
    $vm = Get-AzVM -ResourceGroupName $VMRGName -VMName $vmName
    $vm.StorageProfile.OsDisk.EncryptionSettings | format-custom

    class DiskEncryptionSettings
    {
        DiskEncryptionKey =
        class KeyVaultSecretReference
        {
            SecretUrl = https://myvault.vault.azure.net/secrets/placeholdersecret
            SourceVault =
            class SubResource
            {
                Id = /subscriptions/abc/resourceGroups/myrg/providers/Microsoft.KeyVault/vaults/mykv
            }
        }
        KeyEncryptionKey = mykek
        Enabled = True
    }
    ```

2. Disable DP Encryption
    ```powershell
    Disable-AzVMDiskEncryption -ResourceGroupName $VMRGName -VMName $vmName -Force
    ```

    Expected result (encryption settings null, but extension still associated with VM model):
    ```powershell
    RequestId IsSuccessStatusCode StatusCode ReasonPhrase
    --------- ------------------- ---------- ------------
    True         OK OK

    PS > $vm = Get-AzVM -ResourceGroupName $VMRGName -VMName $vmName
    PS > $vm.StorageProfile.OsDisk.EncryptionSettings | format-custom

    class DiskEncryptionSettings
    {
        DiskEncryptionKey =
        KeyEncryptionKey =
        Enabled = False
    }

    PS > $vm.Extensions[0]

    ForceUpdateTag              :
    Publisher                   : Microsoft.Azure.Security
    VirtualMachineExtensionType : AzureDiskEncryption
    TypeHandlerVersion          : 1.1
    AutoUpgradeMinorVersion     : True
    Settings                    : {VolumeType, EncryptionOperation, SequenceVersion}
    ProtectedSettings           :
    ProvisioningState           : Succeeded
    InstanceView                :
    Id                          : /subscriptions/abc/resourceGroups/myrg/providers/Microsoft.Compute/virtualMachines/myvm/extensions/AzureDiskEncryption
    Name                        : AzureDiskEncryption
    Type                        : Microsoft.Compute/virtualMachines/extensions
    Location                    : eastus2euap
    Tags                        :
    ```

3. Remove DP Extension
    ```powershell
    Remove-AzVMDiskEncryptionExtension -ResourceGroupName $VMRGName -VMName $vmName -Force
    ```

    Expected result (encryption settings still null, extension is now also removed from the VM model):
    ```powershell
    RequestId IsSuccessStatusCode StatusCode ReasonPhrase
    --------- ------------------- ---------- ------------
    True         OK OK

    PS > $vm = Get-AzVM -ResourceGroupName $VMRGName -VMName $vmName
    PS > $vm.StorageProfile.OsDisk.EncryptionSettings | format-custom

    class DiskEncryptionSettings
    {
        DiskEncryptionKey =
        KeyEncryptionKey =
        Enabled = False
    }
    ```

4. Enable SP (without AAD credentials)

    Enabling "single pass" is done by **not** including AAD parameters in the call to `Set-AzVMDiskEncryptionExtension`.
    ```powershell
    Set-AzVMDiskEncryptionExtension -ResourceGroupName $VMRGName -VMName $vmName -DiskEncryptionKeyVaultUrl $diskEncryptionKeyVaultUrl -DiskEncryptionKeyVaultId $KeyVaultResourceId -KeyEncryptionKeyUrl $keyEncryptionKeyUrl -KeyEncryptionKeyVaultId $KeyVaultResourceId
    ```
## Expected Result

**Note: The cleared dual pass encryption settings block is still present in the VM model even after single pass encryption completes. This leftover fragment of dual pass encryption will be removed in the next step.**

```
Enable AzureDiskEncryption on the VM
This cmdlet prepares the VM and enables encryption which may reboot the machine and takes 10-15 minutes to finish.
Please save your work on the VM before confirming. Do you want to continue?
[Y] Yes  [N] No  [S] Suspend  [?] Help (default is "Y"): Y

RequestId IsSuccessStatusCode StatusCode ReasonPhrase
--------- ------------------- ---------- ------------
                        True         OK OK

PS > $vm = Get-AzVM -ResourceGroupName $VMRGname -VMName $vmName
PS > $vm.StorageProfile.OsDisk.EncryptionSettings | format-custom

class DiskEncryptionSettings
{
    DiskEncryptionKey =
    KeyEncryptionKey =
    Enabled = False
}

PS > $vm.Extensions[0]

ForceUpdateTag              :
Publisher                   : Microsoft.Azure.Security
VirtualMachineExtensionType : AzureDiskEncryption
TypeHandlerVersion          : 2.2
AutoUpgradeMinorVersion     : True
Settings                    : {SequenceVersion, KeyEncryptionKeyURL, KeyVaultResourceId, AADClientID...}
ProtectedSettings           :
ProvisioningState           : Succeeded
InstanceView                :
Id                          : /subscriptions/abc/resourceGroups/myrg/providers/Microsoft.Compute/virtualMachines/myvm/extensions/AzureDiskEncryption
Name                        : AzureDiskEncryption
Type                        : Microsoft.Compute/virtualMachines/extensions
Location                    : eastus2euap
Tags                        :
```

## Remove DP Encryption Settings

Immediately after the VM has been properly single pass encrypted, it will still have a leftover encryption settings block with Enabled=False. Removing this leftover artifact will complete the migration from dual to single pass.

Removing the old DP encryption settings artifact should only be done in the following circumstances:

- DP has been fully disabled and removed
- The encryption settings block is already null with Enabled=False
- Single pass encryption has completed successfully on the VM

If that criteria is met, the old dual pass encryption settings artifact can be removed using the following steps:

```powershell
$vm = Get-AzVM -ResourceGroupName $VMRGname -VMName $vmName
$vm.StorageProfile.OsDisk.EncryptionSettings = $null
$vm | Update-AzVM
```

Before (EncryptionSettings is a DiskEncryptionSettings object):
```powershell
$vm.StorageProfile.OsDisk.EncryptionSettings | format-custom

class DiskEncryptionSettings
{
    DiskEncryptionKey =
    KeyEncryptionKey =
    Enabled = False
}
```

After (EncryptionSettings is null, with no DiskEncryptionSettings object):
```powershell
$vm.StorageProfile.OsDisk.EncryptionSettings
$vm.StorageProfile.OsDisk

OsType                  : Windows
EncryptionSettings      :
Name                    : myvm_OsDisk_1_955aa7be282a4b7684a23bc22dafa94b
Vhd                     :
Image                   :
Caching                 : ReadWrite
WriteAcceleratorEnabled :
DiffDiskSettings        :
CreateOption            : FromImage
DiskSizeGB              : 127
ManagedDisk             : Microsoft.Azure.Management.Compute.Models.ManagedDiskParameters
```

## LabBox

For the purpose of training or following along with this TSG, you can use the following link to deploy a dual-pass ADE encrypted VM with this scenario built-in. This lab is not to be shared with customers.

[![Click to Deploy]( /.attachments/SME-Topics/Cant-RDP-SSH/ARMDeploy_Deploy-ARM-JSON-to-Azure.png)](https://labboxprod.azurewebsites.net/api/Labbox?url=https://labboxprod.azurewebsites.net/api/Labbox?url=https://supportability.visualstudio.com/AzureIaaSVM/_git/Labbox?path=/SME/Encryption/adeDPtoSP.json)

::: template /.templates/Processes/Knowledge-Management/Azure-ADE-Feedback-Template.md
:::

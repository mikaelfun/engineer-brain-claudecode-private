---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:%2FSME%20Topics%2FAzure%20Encryption%2FHow%20Tos%2FAzure%20Disk%20Encryption%20%28ADE%29%2FEncrypt%20Disk%20with%20KEK_Encryption"
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

## Scenario

The customer would like to encrypt the IaaS Virtual Machine with KEK (wrapped BEK) key 

## Prerequisites for Single Pass


1.  Azure subscription: an active, valid Azure Subscription is needed
2.  Azure PowerShell: Please use the latest version of Azure PowerShell SDK version to configure Azure Disk Encryption. Download it from [here](https://docs.microsoft.com/en-us/powershell/scripting/install/installing-windows-powershell?view=powershell-7). Azure Disk Encryption is *NOT* supported by [Azure SDK version 1.1.0](https://github.com/Azure/azure-powershell/releases/tag/v1.1.0-January2016). If you are receiving an error related to using Azure PowerShell 1.1.0, please see [this article](http://blogs.msdn.com/b/azuresecurity/archive/2016/02/10/azure-disk-encryption-error-related-to-azure-powershell-1-1-0.aspx). Once Powershell is installed, install the Az Module with the command Install-Module -Name Az -AllowClobber
3.  Azure Key Vault: Azure Disk Encryption securely stores the encryption secrets in a specified Azure Key Vault. Please refer to [Azure Key Vault](https://docs.microsoft.com/en-us/azure/virtual-machines/windows/disk-encryption-key-vault) for more details on how to setup a Key Vault in Azure. In order to make sure the encryption secrets don’t cross regional boundaries, <b>Azure Disk Encryption needs the Key Vault and the VM to be located in the same region. Please create and use a Key Vault that is in the same region as the VM to be encrypted.</b>
4.  Azure Key Vault Key: In Azure Key Vault, select Keys from the *SETTINGS* column. Select the Key that you want to use. If you don't have a key, then you need to create a key. Select *Generate/Import*, from the new window, you only need to input the *Name*. Then select *Create*. Once created, you will be able to select the key *NAME*, then select the *CURRENT VERSION*, then copy the *Key Identifier*. This will be the *KeyEncryptionKeyUrl*. 
5.  IaaS VM in Azure: Azure Disk Encryption works only on IaaS VMs (virtual machines created using the Azure Resource Management model). Please refer to [Different ways to create a Windows virtual machine with Resource Manager](https://azure.microsoft.com/en-us/documentation/articles/virtual-machines-windows-choices-create-vm/) for information on how to create IaaS virtual machines in Azure. Please create a VM in the same region as the Key Vault. Latest gallery images in Azure are optimized to finish encryption operation quickly. So it is recommended to create VMs using the latest gallery images.

## Encrypt the IaaS Virtual Machine with Single Pass (Powershell)

1.  Run the following on an elevated PS session
    
    <span class="small"></span>
    
    ```
        Connect-AzAccount
        Get-AzSubscription
        Select-AzSubscription -Subscription "<your subscription>"


        $KVRGname = 'MyKeyVaultResourceGroup';
        $VMRGName = 'MyVirtualMachineResourceGroup';
        $vmName = 'MyExtraSecureVM';
        $KeyVaultName = 'MySecureVault';
        $keyEncryptionKeyName = 'MyKeyEncryptionKey';
        $KeyVault = Get-AzKeyVault -VaultName $KeyVaultName -ResourceGroupName $KVRGname;
        $diskEncryptionKeyVaultUrl = $KeyVault.VaultUri;
        $KeyVaultResourceId = $KeyVault.ResourceId;
        $keyEncryptionKeyUrl = (Get-AzKeyVaultKey -VaultName $KeyVaultName -Name $keyEncryptionKeyName).Key.kid;

        Set-AzVMDiskEncryptionExtension -ResourceGroupName $VMRGname -VMName $vmName -DiskEncryptionKeyVaultUrl $diskEncryptionKeyVaultUrl -DiskEncryptionKeyVaultId $KeyVaultResourceId -KeyEncryptionKeyUrl $keyEncryptionKeyUrl -KeyEncryptionKeyVaultId $KeyVaultResourceId;

    ```

2. To verify encryption process use


        Get-AzVmDiskEncryptionStatus -ResourceGroupName $VMRGName -VMName $vmName
    

## Encrypt the IaaS Virtual Machine with Single Pass (CLI)


1.  Run the following on an elevated CLI session
    
    ```
        az vm encryption enable --resource-group "MyVirtualMachineResourceGroup" --name "MySecureVM" --disk-encryption-keyvault  "MySecureVault" --key-encryption-key "MyKEK_URI" --key-encryption-keyvault "MySecureVaultContainingTheKEK" --volume-type [All|OS|Data]

    ```
2. You can verify the status of disks being encrypted with the following command

    ```
        az vm show --name MyVM -g MyResourceGroup    

    ```

3.  If you are successful, you should see the following output confirming the VM encryption was successful:
    
     ```
        "EncryptionOperation": "EnableEncryption"  

     ```

## Encrypt the IaaS Virtual Machine with Sinlge Pass (Template) 

1.  Use the template found [here](https://github.com/Azure/azure-quickstart-templates/tree/master/201-encrypt-running-windows-vm-without-aad) to encrypt the virtual machine.

2.  Once you are on the Azure Quickstart Template, fill in the required fields.  You can then save the template so that you can reuse when needed. For KEK, fill the KeK Encryption Key URL field.

3.  Select the Purchase button to run the template. 


## Encrypt the IaaS Virtual Machine (Portal)

1. Select the VM you want to encrypt and go to disks. Then select encryption at the top.<br>
    ![portalencrtypt.png](/.attachments/SME-Topics/Azure-Encryption/portalencrtypt.png)
2. Select if you want to encrypt only the OS or OS and data from the dropdown menu.<br>
    ![Encrypt-Disk-with-KEK_ADE-HowTo_or-os-data.png](/.attachments/SME-Topics/Azure-Encryption/Encrypt-Disk-with-KEK_ADE-HowTo_or-os-data.png)
3. Select the encryption settings option for adding a Key Vault<br>
    ![Encrypt-Disk-with-KEK_ADE-HowTo_select-kv.png](/.attachments/SME-Topics/Azure-Encryption/Encrypt-Disk-with-KEK_ADE-HowTo_select-kv.png)
4. Select the Key Vault you plan to use. Add the Key and the Version to encrypt with KEK.<br>
    ![Encrypt-Disk-with-KEK_ADE-HowTo_select-kv2.png](/.attachments/SME-Topics/Azure-Encryption/Encrypt-Disk-with-KEK_ADE-HowTo_select-kv2.png) 


## Prerequisites for Dual Pass

1.  Azure subscription: an active, valid Azure subscription is needed.
2.  Azure PowerShell: Please use the latest version of Azure PowerShell SDK version to configure Azure Disk Encryption. Download it from [here](https://docs.microsoft.com/en-us/powershell/scripting/install/installing-windows-powershell?view=powershell-7). Azure Disk Encryption is *NOT* supported by [Azure SDK version 1.1.0](https://github.com/Azure/azure-powershell/releases/tag/v1.1.0-January2016). If you are receiving an error related to using Azure PowerShell 1.1.0, please see [this article](http://blogs.msdn.com/b/azuresecurity/archive/2016/02/10/azure-disk-encryption-error-related-to-azure-powershell-1-1-0.aspx). Once Powershell is installed, install the Az Module with the command Install-Module -Name Az -AllowClobber
3.  Azure Key Vault: Azure Disk Encryption securely stores the encryption secrets in a specified Azure Key Vault. Please refer to [Azure Key Vault](https://docs.microsoft.com/en-us/azure/virtual-machines/windows/disk-encryption-key-vault) for more details on how to setup a Key Vault in Azure. In order to make sure the encryption secrets don’t cross regional boundaries, <b>Azure Disk Encryption needs the Key Vault and the VM to be located in the same region. Please create and use a Key Vault that is in the same region as the VM to be encrypted.</b>
4.  Azure Key Vault Key: In Azure Key Vault, select Keys from the *SETTINGS* column. Select the Key that you want to use. If you don't have a key, then you need to create a key. Select *Generate/Import*, from the new window, you only need to input the *Name*. Then select *Create*. Once created, you will be able to select the key *NAME*, then select the *CURRENT VERSION*, then copy the *Key Identifier*. This will be the *KeyEncryptionKeyUrl*. 
5.  Azure Active Directory Client ID and Secret: In order to write encryption secrets to a specified Key Vault, Azure Disk Encryption needs the Client ID and the Client Secret of the Azure Active Directory application that has permissions to write secrets to the specified Key Vault. Please refer to [Azure Key Vault](https://docs.microsoft.com/en-us/azure/virtual-machines/windows/disk-encryption-key-vault#set-key-vault-advanced-access-policies) for more detail on how to get the Azure Active Directory Client ID and Client Secret using Azure portal.
6.  IaaS VM in Azure: Azure Disk Encryption works only on IaaS VMs (virtual machines created using the Azure Resource Management model). Please refer to [Different ways to create a Windows virtual machine with Resource Manager](https://azure.microsoft.com/en-us/documentation/articles/virtual-machines-windows-choices-create-vm/) for information on how to create IaaS virtual machines in Azure. Please create a VM in the same region as the Key Vault. Latest gallery images in Azure are optimized to finish encryption operation quickly. So it is recommended to create VMs using the latest gallery images.

## Encrypt the IaaS Virtual Machine with KEK (Powershell)

1.  Setup your variables
    
    <span class="small"></span>
    
    ```
        Connect-AzAccount
        Get-AzSubscription
        Select-AzSubscription -Subscription "<your subscription>"
        
        
        $RGName = "MyResourceGroup"
        $VMName = "MyTestVM"

        $AADClientID = "<clientID of your Azure AD app>"
        $AADClientSecret = "<clientSecret of your Azure AD app>"

        $VaultName= "MyKeyVault"
        $KeyVault = Get-AzKeyVault -VaultName $VaultName -ResourceGroupName $RGName
        $DiskEncryptionKeyVaultUrl = $KeyVault.VaultUri
        $KeyVaultResourceId = $KeyVault.ResourceId
        $VolumeType = "All"

        $KEKName = "MyKeyEncryptionKey"
        $KEK = Add-AzKeyVaultKey -VaultName $VaultName -Name $KEKName -Destination "Software"
        $KeyEncryptionKeyUrl = $KEK.Key.kid


    ```

2.  The Azure fabric needs to access encryption secrets in order to boot the encrypted VM. Use the below cmdlet to set Key Vault access policies to allow Azure platform access the encryption secrets placed in the Key Vault.
    
    <span class="small"></span>
    
    ```
        Set-AzKeyVaultAccessPolicy -VaultName $VaultName -ResourceGroupName $RGName -EnabledForDiskEncryption
    ```

3.  This cmdlet uses the variables initialized above. It is recommended to create IaaS VMs using the latest gallery images to quickly enable encryption.
    
    <span class="small"></span>
    
    ```
        Set-AzVMDiskEncryptionExtension -ResourceGroupName $VMRGname -VMName $vmName -AadClientID $aadClientID -AadClientSecret $aadClientSecret -DiskEncryptionKeyVaultUrl $diskEncryptionKeyVaultUrl -DiskEncryptionKeyVaultId $KeyVaultResourceId -KeyEncryptionKeyUrl $keyEncryptionKeyUrl -KeyEncryptionKeyVaultId $KeyVaultResourceId;
    ```

4.  If you are successful, you should see the following output confirming the VM encryption was successful:
    
    <span class="small"></span>
    
    ```
        RequestId IsSuccessStatusCode StatusCode ReasonPhrase
        --------- ------------------- ---------- ------------
                                True         OK OK
    ```
    
    Please refer to the [Set-AzVMDiskEncryptionExtension](https://docs.microsoft.com/en-us/powershell/module/az.compute/set-azvmdiskencryptionextension?view=azps-3.5.0) cmdlet for full list options and details.

5.  Once you have enabled and deployed an encrypted VM, the [Get-AzVmDiskEncryptionStatus](https://docs.microsoft.com/en-us/powershell/module/az.compute/get-azvmdiskencryptionstatus?view=azps-3.5.0) cmdlet displays encryption status of OS volume, data volumes and the encryption secret Key Vault URLs of OS volume.
    
    <span class="small"></span>
    
    ```
        Get-AzVmDiskEncryptionStatus -ResourceGroupName $RGName -VMName $VMName
    ```

6.  You should be able to see that both the OS volume and the data volumes are now encrypted:
    
    <span class="small"></span>
    
    ```
        OsVolumeEncrypted         : Encrypted
        DataVolumesEncrypted      : Encrypted
        OsVolumeEncryptionSettings : Microsoft.Azure.Management.Compute.Models.DiskEncryptionSettings
        ProgressMessage           : OsVolume: Encrypted, DataVolumes: Encrypted
    ```

## Process to encrypt VM with KEK- Template

1.  The template to encrypt a VM with KEK is [here](https://github.com/Azure/azure-quickstart-templates/tree/master/201-encrypt-running-windows-vm).<br>
![837b074f-b76e-4c32-e950-af02622e9856Adesettings6.jpg](/.attachments/SME-Topics/Azure-Encryption/837b074f-b76e-4c32-e950-af02622e9856Adesettings6.jpg)
2.  Once you are on the Azure quickstart template, fill in the required fields.  You can then save the template so that you can reuse when needed.<br>
![ec1043c7-3f75-b5d6-a77c-3fdd49234b4d490px-Adesettings7.jpg](/.attachments/SME-Topics/Azure-Encryption/ec1043c7-3f75-b5d6-a77c-3fdd49234b4d490px-Adesettings7.jpg)
3.  Press the Purchase button to run the template.

## Get a list of all encrypted VMs in your subscription

1.  If you have multiple VMs in your subscription and you want to list the OS volume and data volumes encryption status for all VMs to see which of the VMs are encrypted, the below cmdlets show you how to do that.
    
    <span class="small"></span>
    
    ```
        $osVolEncrypted = {(Get-AzVMDiskEncryptionStatus -ResourceGroupName $_.ResourceGroupName -VMName $_.Name).OsVolumeEncrypted}
        $dataVolEncrypted= {(Get-AzVMDiskEncryptionStatus -ResourceGroupName $_.ResourceGroupName -VMName $_.Name).DataVolumesEncrypted}
        Get-AzVm | Format-Table @{Label="MachineName"; Expression={$_.Name}}, @{Label="OsVolumeEncrypted"; Expression=$osVolEncrypted}, @{Label="DataVolumesEncrypted"; Expression=$dataVolEncrypted}
    ```

2.  Here is one way you can see the list of VMs that are encrypted in a structured output:
    
    <span class="small"></span>
    
    ```
        MachineName   OsVolumeEncrypted DataVolumesEncrypted
        -----------   ----------------- --------------------
        TestVM1                 Unknown             Unknown
        TestVM2               Encrypted         NotEncrypted
        TestVM3
        TestVM4               Encrypted           Encrypted
        TestVM5            NotEncrypted         NotEncrypted
        TestVM6       ...tionInProgress EncryptionInProgress
    ```

## Get a list of all disk encryption secrets used for encrypting VM in your subscription

1.  The Azure Disk Encryption functionality uploads encryption secrets corresponding to all the volumes into the Key Vault specified while enabling encryption. If you would like to see all the disk encryption secrets in a given Key Vault written by Azure Disk Encryption and the corresponding machine names and volume letters, the following syntax will provide that report for you:
    
    <span class="small"></span>
    
    ```
        Get-AzKeyVaultSecret -VaultName $KeyVaultName | where {$_.Tags.ContainsKey('DiskEncryptionKeyFileName')} | format-table @{Label="MachineName"; Expression={$_.Tags['MachineName']}}, @{Label="VolumeLetter"; Expression={$_.Tags['VolumeLetter']}}, @{Label="EncryptionKeyURL"; Expression={$_.Id}}
    ```

2.  It will be structured and displayed in similar format:
    
    <span class="small"></span>
    
    ```
        MachineName  Volume   EncryptionKeyURL
        -----------  ------   ----------------
        MYSECUREVM   D:       https://mysecurevault.vault.azure.net:443/secrets/7832CE5C-A252-4E50-B3CC-2A1630F2B279
        MYSECUREVM   C:       https://mysecurevault.vault.azure.net:443/secrets/FA44FF92-91F0-4312-A1E8-224B78BEF1D5
    ```

::: template /.templates/Processes/Knowledge-Management/Azure-ADE-Feedback-Template.md
:::

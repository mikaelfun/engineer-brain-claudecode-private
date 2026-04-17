---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:%2FSME%20Topics%2FAzure%20Encryption%2FHow%20Tos%2FAzure%20Disk%20Encryption%20%28ADE%29%2FEncrypt%20a%20Windows%20VM_Encryption"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Azure-Encryption
- cw.How-To
- cw.Reviewed-02-2025
---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::




[[_TOC_]]

## Scenario

A customer would like to encrypt their machine using PowerShell or a template.

## Prerequisites for Single Pass

1. Azure subscription: An active, valid Azure subscription is needed.
2. Azure PowerShell: Please use the latest version of Azure PowerShell SDK to configure Azure Disk Encryption. Download it from [here](https://docs.microsoft.com/en-us/powershell/scripting/install/installing-windows-powershell?view=powershell-7). Azure Disk Encryption is *NOT* supported by [Azure SDK version 1.1.0](https://github.com/Azure/azure-powershell/releases/tag/v1.1.0-January2016). If you are receiving an error related to using Azure PowerShell 1.1.0, please see [this article](http://blogs.msdn.com/b/azuresecurity/archive/2016/02/10/azure-disk-encryption-error-related-to-azure-powershell-1-1-0.aspx). Once PowerShell is installed, install the Az Module with the command `Install-Module -Name Az -AllowClobber`.
3. Azure Key Vault: Azure Disk Encryption securely stores the encryption secrets in a specified Azure Key Vault. Please refer to [Azure Key Vault](https://docs.microsoft.com/en-us/azure/virtual-machines/windows/disk-encryption-key-vault) for more details on how to set up a Key Vault in Azure. To ensure the encryption secrets don’t cross regional boundaries, **Azure Disk Encryption needs the Key Vault and the VM to be located in the same region. Please create and use a Key Vault that is in the same region as the VM to be encrypted.**
4. IaaS VM in Azure: Azure Disk Encryption works only on IaaS VMs (virtual machines created using the Azure Resource Management model). Please refer to [Different ways to create a Windows virtual machine with Resource Manager](https://azure.microsoft.com/en-us/documentation/articles/virtual-machines-windows-choices-create-vm/) for information on how to create IaaS virtual machines in Azure. Please create a VM in the same region as the Key Vault. Latest gallery images in Azure are optimized to finish the encryption operation quickly. So it is recommended to create VMs using the latest gallery images.

## Encrypt the IaaS Virtual Machine with Single Pass (PowerShell)

1. Run the following on an elevated PowerShell session:

    ```powershell
    Connect-AzAccount
    Get-AzSubscription
    Select-AzSubscription -Subscription "<your subscription>"

    $KVRGname = 'MyKeyVaultResourceGroup'
    $VMRGName = 'MyVirtualMachineResourceGroup'
    $vmName = 'MySecureVM'
    $KeyVaultName = 'MySecureVault'
    $KeyVault = Get-AzKeyVault -VaultName $KeyVaultName -ResourceGroupName $KVRGname
    $diskEncryptionKeyVaultUrl = $KeyVault.VaultUri
    $KeyVaultResourceId = $KeyVault.ResourceId

    Set-AzVMDiskEncryptionExtension -ResourceGroupName $VMRGname -VMName $vmName -DiskEncryptionKeyVaultUrl $diskEncryptionKeyVaultUrl -DiskEncryptionKeyVaultId $KeyVaultResourceId
    ```

2. To verify the encryption process, use:

    ```powershell
    Get-AzVmDiskEncryptionStatus -ResourceGroupName 'MyVirtualMachineResourceGroup' -VMName 'MySecureVM'
    ```

## Encrypt the IaaS Virtual Machine with Single Pass (CLI)

1. Run the following on an elevated CLI session:

    ```bash
    az vm encryption enable --resource-group "MyVirtualMachineResourceGroup" --name "MySecureVM" --disk-encryption-keyvault "MySecureVault" --key-encryption-key "MyKEK_URI" --key-encryption-keyvault "MySecureVaultContainingTheKEK" --volume-type [All|OS|Data]
    ```

2. You can verify the status of disks being encrypted with the following command:

    ```bash
    az vm show --name MyVM -g MyResourceGroup
    ```

3. If you are successful, you should see the following output confirming the VM encryption was successful:

    ```json
    "EncryptionOperation": "EnableEncryption"
    ```

## Encrypt the IaaS Virtual Machine with Single Pass (Template)

1. Use the template found [here](https://github.com/Azure/azure-quickstart-templates/tree/master/201-encrypt-running-windows-vm-without-aad) to encrypt the virtual machine.

2. Once you are on the Azure Quickstart Template, fill in the required fields. You can then save the template so that you can reuse it when needed.

3. Select the Purchase button to run the template.

## Encrypt the IaaS Virtual Machine (Portal)

1. Select the VM you want to encrypt and go to disks. Then select encryption at the top.<br>
![Encrypt-a-Windows-VM_ADE-How-To_001.png](/.attachments/SME-Topics/Azure-Encryption/Encrypt-a-Windows-VM_ADE-How-To_001.png)

2. Select if you want to encrypt only the OS or OS and data from the dropdown menu.<br>
![Encrypt-a-Windows-VM_ADE-How-To_002.png](/.attachments/SME-Topics/Azure-Encryption/Encrypt-a-Windows-VM_ADE-How-To_002.png)

3. Select the encryption settings option for adding a Key Vault.<br>
![Encrypt-a-Windows-VM_ADE-How-To_003.png](/.attachments/SME-Topics/Azure-Encryption/Encrypt-a-Windows-VM_ADE-How-To_003.png)

4. Select the Key Vault you plan to use. Note: If you want to encrypt with BEK, make sure to fill only the Key Vault. Adding the Key and the Version will encrypt with KEK.<br>
![Encrypt-a-Windows-VM_ADE-How-To_004.png](/.attachments/SME-Topics/Azure-Encryption/Encrypt-a-Windows-VM_ADE-How-To_004.png)

**Deploy labbox for Windows Single-Pass**

[![Click to Deploy]( /.attachments/SME-Topics/Cant-RDP-SSH/ARMDeploy_Deploy-ARM-JSON-to-Azure.png)](https://labboxprod.azurewebsites.net/api/Labbox?url=https://supportability.visualstudio.com/AzureIaaSVM/_git/Labbox?path=/SME/Encryption/adeWinSPDay02.json)

## Prerequisites for Dual Pass

1. Azure subscription: An active, valid Azure subscription is needed.
2. Azure PowerShell: Please use the latest version of Azure PowerShell SDK to configure Azure Disk Encryption. Download it from [here](https://docs.microsoft.com/en-us/powershell/scripting/install/installing-windows-powershell?view=powershell-7). Azure Disk Encryption is *NOT* supported by [Azure SDK version 1.1.0](https://github.com/Azure/azure-powershell/releases/tag/v1.1.0-January2016). If you are receiving an error related to using Azure PowerShell 1.1.0, please see [this article](http://blogs.msdn.com/b/azuresecurity/archive/2016/02/10/azure-disk-encryption-error-related-to-azure-powershell-1-1-0.aspx). Once PowerShell is installed, install the Az Module with the command `Install-Module -Name Az -AllowClobber`.
3. Azure Key Vault: Azure Disk Encryption securely stores the encryption secrets in a specified Azure Key Vault. Please refer to [Azure Key Vault](https://docs.microsoft.com/en-us/azure/virtual-machines/windows/disk-encryption-key-vault) for more details on how to set up a Key Vault in Azure. To ensure the encryption secrets don’t cross regional boundaries, **Azure Disk Encryption needs the Key Vault and the VM to be located in the same region. Please create and use a Key Vault that is in the same region as the VM to be encrypted.**
4. Azure Active Directory Client ID and Secret: To write encryption secrets to a specified Key Vault, Azure Disk Encryption needs the Client ID and the Client Secret of the Azure Active Directory application that has permissions to write secrets to the specified Key Vault. Please refer to [Azure Key Vault](https://docs.microsoft.com/en-us/azure/virtual-machines/windows/disk-encryption-key-vault#set-key-vault-advanced-access-policies) for more details on how to get the Azure Active Directory Client ID and Client Secret using the Azure portal.
5. IaaS VM in Azure: Azure Disk Encryption works only on IaaS VMs (virtual machines created using the Azure Resource Management model). Please refer to [Different ways to create a Windows virtual machine with Resource Manager](https://azure.microsoft.com/en-us/documentation/articles/virtual-machines-windows-choices-create-vm/) for information on how to create IaaS virtual machines in Azure. Please create a VM in the same region as the Key Vault. Latest gallery images in Azure are optimized to finish the encryption operation quickly. So it is recommended to create VMs using the latest gallery images.

## Encrypt the IaaS Virtual Machine with Dual Pass (PowerShell)

1. Run the following on an elevated PowerShell session:

    ```powershell
    Connect-AzAccount
    Get-AzSubscription
    Select-AzSubscription -Subscription "<your subscription>"

    $RGName = "MyResourceGroup"
    $VMName = "MyTestVM"
    $AADClientID = "<clientID of your Azure AD app>"
    $AADClientSecret = "<clientSecret of your Azure AD app>"
    $VaultName = "MyKeyVault"
    $KeyVault = Get-AzKeyVault -VaultName $VaultName -ResourceGroupName $RGName
    $DiskEncryptionKeyVaultUrl = $KeyVault.VaultUri
    $KeyVaultResourceId = $KeyVault.ResourceId
    $VolumeType = "All"
    ```

2. Set the Key Vault access policies to allow the specified Azure AD application to write secrets to Key Vault:

    ```powershell
    Set-AzKeyVaultAccessPolicy -VaultName $VaultName -ServicePrincipalName $AADClientID -PermissionsToKeys 'WrapKey' -PermissionsToSecrets 'Set' -ResourceGroupName $RGName
    ```

3. Set Key Vault access policies to allow Azure platform access to the encryption secrets placed in the Key Vault:

    ```powershell
    Set-AzKeyVaultAccessPolicy -VaultName $VaultName -ResourceGroupName $RGName -EnabledForDiskEncryption
    ```

4. Encrypt the VM using the `Set-AzVMDiskEncryptionExtension` cmdlet:

    ```powershell
    Set-AzVMDiskEncryptionExtension -ResourceGroupName $RGName -VMName $VMName -AadClientID $AADClientID -AadClientSecret $AADClientSecret -DiskEncryptionKeyVaultUrl $DiskEncryptionKeyVaultUrl -DiskEncryptionKeyVaultId $KeyVaultResourceId -VolumeType $VolumeType
    ```

5. Verify the encryption process:

    ```powershell
    Get-AzVmDiskEncryptionStatus -ResourceGroupName $RGName -VMName $VMName
    ```

## Encrypt the IaaS Virtual Machine with Dual Pass (CLI)

1. Use the following command for encrypting a VM with BEK:

    ```bash
    az vm encryption enable --resource-group "MyVirtualMachineResourceGroup" --name "MySecureVM" --aad-client-id "<my spn created with CLI/my Azure AD ClientID>" --aad-client-secret "My-AAD-client-secret" --disk-encryption-keyvault "MySecureVault" --volume-type [All|OS|Data]
    ```

2. Verify the status of disks being encrypted:

    ```bash
    az vm encryption show --name "MySecureVM" --resource-group "MyVirtualMachineResourceGroup"
    ```

## Encrypt the IaaS Virtual Machine with Dual Pass (Template)

1. Use the template found [here](https://github.com/Azure/azure-quickstart-templates/tree/master/201-encrypt-running-windows-vm) to encrypt the virtual machine.

    ![837b074f-b76e-4c32-e950-af02622e9856Adesettings6.jpg](/.attachments/SME-Topics/Azure-Encryption/837b074f-b76e-4c32-e950-af02622e9856Adesettings6.jpg)

2. Fill in the required fields on the Azure Quickstart Template.

    ![1102d060-27f1-9e92-4095-1db6ca0ef771Adesettings7.jpg](/.attachments/SME-Topics/Azure-Encryption/1102d060-27f1-9e92-4095-1db6ca0ef771Adesettings7.jpg)

3. Select the Purchase button to run the template.

## Get a List of All Encrypted VMs in Your Subscription

1. If you have multiple VMs in your subscription and you want to list the OS volume and data volumes encryption status for all VMs to see which of the VMs are encrypted, the below cmdlets show you how to do that.

    ```powershell
    $osVolEncrypted = {(Get-AzVMDiskEncryptionStatus -ResourceGroupName $_.ResourceGroupName -VMName $_.Name).OsVolumeEncrypted}
    $dataVolEncrypted = {(Get-AzVMDiskEncryptionStatus -ResourceGroupName $_.ResourceGroupName -VMName $_.Name).DataVolumesEncrypted}
    Get-AzVm | Format-Table @{Label="MachineName"; Expression={$_.Name}}, @{Label="OsVolumeEncrypted"; Expression=$osVolEncrypted}, @{Label="DataVolumesEncrypted"; Expression=$dataVolEncrypted}
    ```

2. Here is one way you can see the list of VMs that are encrypted in a structured output:

    ```plaintext
    MachineName       OsVolumeEncrypted DataVolumesEncrypted
    -----------       ----------------- --------------------
    CentOS73rondom    Unknown           Unknown
    centos73ron...    Unknown           Unknown
    mdrondom          Encrypted         NotEncrypted
    mdrondom-bds
    mdrondom16Data    Encrypted         Encrypted
    mdrondom3         NotEncrypted      NotEncrypted
    ubu1404-2...      EncryptionInProgress EncryptionInProgress
    ubu1404-3...      EncryptionInProgress EncryptionInProgress
    ```

## Get a List of All Disk Encryption Secrets Used for Encrypting VMs in Your Subscription

1. The Azure Disk Encryption functionality uploads encryption secrets corresponding to all the volumes into the Key Vault specified while enabling encryption. If you would like to see all the disk encryption secrets in a given Key Vault written by Azure Disk Encryption and the corresponding machine names and volume letters, the following syntax will provide that report for you:

    ```powershell
    Get-AzKeyVaultSecret -VaultName $KeyVaultName | where {$_.Tags.ContainsKey('DiskEncryptionKeyFileName')} | Format-Table @{Label="MachineName"; Expression={$_.Tags['MachineName']}}, @{Label="VolumeLetter"; Expression={$_.Tags['VolumeLetter']}}, @{Label="EncryptionKeyURL"; Expression={$_.Id}}
    ```

2. It will be structured and displayed in a similar format:

    ```plaintext
    MachineName  Volume  EncryptionKeyURL
    -----------  ------  ----------------
    MYSECUREVM   D:      https://mysecurevault.vault.azure.net:443/secrets

::: template /.templates/Processes/Knowledge-Management/Azure-ADE-Feedback-Template.md
:::

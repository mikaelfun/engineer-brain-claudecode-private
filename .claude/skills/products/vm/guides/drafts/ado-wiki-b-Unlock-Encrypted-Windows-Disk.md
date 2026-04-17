---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Encryption/How Tos/Azure Disk Encryption (ADE)/Unlock Encrypted Windows Disk_Encryption"
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

There are two scenarios where you are going to apply this article:

- Whenever you want to collect the logs from the disk: None of our tools are going to work to pull logs due to the encryption, so this recollection needs to be manual.
- Whenever you have a broken machine and you need to perform changes on the file system of the OS drive.
- This TSG will help you unlock a VM encrypted using BEK and KEK (works for both "with AAD" and "without AAD").

**Note: This process DOES NOT decrypt the disk**

**Unlock vs. Decrypt**

Unlocking the disk IS NOT the same as decrypting. Unlocking the disk means that you gain access to it, you can only see the files. Decrypting the disk means you removed the encryption entirely.

### References

- [Retrieve Encryption key via secret URL](https://gist.github.com/vermashi/7f3544a911cf0ed75d6b32b562b77237)
- [Troubleshoot BitLocker boot error](https://docs.microsoft.com/en-us/azure/virtual-machines/troubleshooting/troubleshoot-bitlocker-boot-error)
- [Retrieve Encryption key via secret URL Version 2 (for Az cmdlets)](https://gist.github.com/vermashi/1c2aa03a96f12c07c76fd2da1b67636f)
- [Azure Disk Encryption for Windows and Linux IaaS VMs](https://docs.microsoft.com/en-us/azure/security/fundamentals/azure-disk-encryption-vms-vmss)
- [Mount Encrypted OS Disk in a Nested VM](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495069/Mount-Encrypted-OS-Disk-in-a-Nested-VM_Encryption)
- [Unlocking an encrypted disk for offline repair](https://docs.microsoft.com/en-us/troubleshoot/azure/virtual-machines/unlock-encrypted-disk-offline)

## Automatic Troubleshoot

**Note: This solution only applies for single pass encrypted VMs. If this is a Dual Pass VM, please proceed with** [Manual Troubleshoot](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495071/Azure_Virtual-Machine_Features_Disk-Encryption_HowTo_Unlock-an-encrypted-disk-V2?anchor=manual-troubleshoot).

Azure VM repair commands can be used to create a new VM (aka the repair VM) to diagnose and fix issues when a VM (aka the source VM) is unbootable. The feature allows customers to connect the disk to the repair VM to fix any errors, and then rebuild their original VM without deleting and recreating the VM. The command will auto-unlock any encrypted disks on the repair VM without any additional input from the customer. Currently, repair commands for encrypted VMs support Linux/Windows VMs using managed disks encrypted with Single Pass Encryption (with and without KEK).

1. Install or Update repair-vm CLI extension. In case you already have installed the repair extension, just run the update command.

    For installing use:
    ```
    az extension add -n vm-repair
    ```

    Make sure you are using the latest az vm repair cmdlet. For updating use:
    ```
    az extension update -n vm-repair
    ```

2. Run the create command on an encrypted VM:
    ```
    az vm repair create -g {rg} -n {source-vm-name} --verbose
    ```

    You will get a confirmation prompt to unlock the copied OS disk within the repair VM. You can add the `--unlock-encrypted-vm` parameter to skip that prompt.
    ```
    az vm repair create -g {rg} -n {source-vm-name} --unlock-encrypted-vm --verbose
    ```

    ![Capture.JPG](/.attachments/SME-Topics/Azure-Encryption/Capture.JPG)

3. Once the command finishes running, you can log in to the new VM and verify that the disk is already unlocked.

    ![unlock2021.png](/.attachments/SME-Topics/Azure-Encryption/unlock2021.png)

    **Note: If the customer does not want to continue with the disk encrypted, you will have to run the following command for decrypting the disk:**
    ```
    manage-bde -off <DRIVE LETTER>:
    ```

4. Once you are done with the troubleshooting, use the `az vm repair restore` command to replace the source VM's OS disk with the data disk from the repair VM.
    ```
    az vm repair restore -g MyResourceGroup -n MyVM --verbose
    ```

    **Note: If Automatic troubleshoot fails or the customer does not have permissions, proceed with** [Manual Troubleshoot](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495071/Azure_Virtual-Machine_Features_Disk-Encryption_HowTo_Unlock-an-encrypted-disk-V2?anchor=manual-troubleshoot).

## Semi-Automatic Troubleshoot

**Note: This solution applies for managed disks encrypted with single pass. If you have a VM encrypted with Dual Pass, please follow** [Manual Troubleshoot](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495071/Azure_Virtual-Machine_Features_Disk-Encryption_HowTo_Unlock-an-encrypted-disk-V2?anchor=manual-troubleshoot).

**Note: If the encrypted VM uses unmanaged disks, please follow** [Manual Troubleshoot](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495071/Azure_Virtual-Machine_Features_Disk-Encryption_HowTo_Unlock-an-encrypted-disk-V2?anchor=manual-troubleshoot).

1. Take a snapshot of the encrypted OS disk and create a disk from that snapshot.

2. Create a new Rescue VM, adding in the Disks blade the encrypted disk you just created.

**Note: Please make sure to add the disk DURING the VM creation as explained in the following screenshots, as the BEK volume only gets attached during VM creation since it detects encryption settings and adds that BEK Volume. Adding the encrypted disk you want to troubleshoot AFTER VM creation will NOT attach the BEK volume.**

![createvm1.png](/.attachments/SME-Topics/Azure-Encryption/createvm1.png)

![createvm2.png](/.attachments/SME-Topics/Azure-Encryption/createvm2.png)

3. Once the VM has been created, RDP to the VM and navigate to the Disk Management. Locate the BEK volume.
    
    ![createvm3.png](/.attachments/SME-Topics/Azure-Encryption/createvm3.png)

4. Right-click on the BEK volume to add a drive letter for the BEK volume. Select *Change Drive Letter and Paths*.
    
    ![createvm4.png](/.attachments/SME-Topics/Azure-Encryption/createvm4.png)

5. Click on *Add* and select a drive letter to assign the BEK volume. In this case, the letter will be H. Then click on Ok.
    
    ![createvm5.png](/.attachments/SME-Topics/Azure-Encryption/createvm5.png)

6. Navigate into This PC and you will see that we can see the BEK Volume already.
    
    ![createvm7.png](/.attachments/SME-Topics/Azure-Encryption/createvm7.png)

7. The files in the BEK volume are hidden, so open a Command Prompt and run the following command to show the hidden files. We will need the .BEK file for unlocking the drive.
    ```
    dir <DRIVE LETTER>: /a:h /b /s
    ```
    For example:
    ```
    dir H: /a:h /b /s
    ```
    
    ![createvm8.png](/.attachments/SME-Topics/Azure-Encryption/createvm8.png)

8. Take note of the .BEK file as we will be using it. In the Command Prompt, run the following command:
    ```
    manage-bde -unlock <DRIVE LETTER>: -RecoveryKey <.BEK FILE PATH>
    ```
    For example:
    ```
    manage-bde -unlock G: -RecoveryKey H:\C7CE778D-(...)CAD1.BEK
    ```
    
    ![createvm9.png](/.attachments/SME-Topics/Azure-Encryption/createvm9.png)

    You will get a successfully unlocked drive message.

9. Go back to This PC and you will see that the drive is no longer locked.
    
    ![createvm10.png](/.attachments/SME-Topics/Azure-Encryption/createvm10.png)

**Note: If the customer does not want to continue with the disk encrypted, you will have to run the following command to decrypt the disk:**

```shell
manage-bde -off <DRIVE LETTER>:
```

10. Once you finish troubleshooting, proceed with Disk Swapping.
    - Stop the VM.
    - Go to the affected source VM.
    - Select Disks from the blade.
    - Click on the Swap Disk button, choose the disk you want to replace, and provide the name of the VM.

![swapdisk.jpg](/.attachments/SME-Topics/Azure-Encryption/swapdisk.jpg)

**Video:**

[Watch the video](https://microsoft.sharepoint.com/:v:/t/VMHub/EXjYXlpO-cBEqstg3bXGX_0B3ylDCwMaAmYRmpQYL2dYaw?e=j9z4qs)

## Automatically Retrieve the BEK Files

Following this procedure, you will be able to download the necessary BEK file to unlock the Single Pass encrypted disk using any existing VM as a rescue. This procedure is designed to be used locally or from Azure Cloud Shell to eliminate the need for the manual process, which can cause delays or additional issues due to the diversity of environments in terms of PowerShell version, OS version, user permissions, internet connectivity, etc.

[BEK Retrieval TSG](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/911664/How-to-Automatically-Retrieve-the-BEK_Encryption)

## Manual Troubleshoot

**Video:**

[Watch the video](https://microsoft.sharepoint.com/:v:/t/VMHub/IQBi7nkNjt8oQ7VBBjtGx2FqAT4PZIJI3ow_CN6N7gqPHcM?e=6bm7Cf)

1. Create a Recovery VM located in the same Resource Group and Location as the impacted VM. Recommended OS: Windows 2016 Datacenter.
2. If the disk is Managed, create a snapshot of the locked disk and create a disk from that snapshot.

If you are working with Unmanaged disks:
    1. Stop/Deallocate the affected VM.
    2. Login to Storage Explorer. If you do not have it installed, please download and install it from here.
    3. Go to the Storage account where the affected OS disk is located.
    4. Copy the affected OS disk from the existing container and paste it into a different container in the same Storage Account.

![unmanaged1.png](/.attachments/SME-Topics/Azure-Encryption/unmanaged1.png)

    5. If you do not have another container in the same Storage Account, please create one using Storage Explorer.
    6. Paste the affected OS VHD into the second container.
    ![unmanaged2.png](/.attachments/SME-Topics/Azure-Encryption/unmanaged2.png)

3. Attach the affected VM's OS disk as a data disk to the recovery VM.
    1. If attaching a managed disk fails because it contains encryption settings and therefore cannot be used as a data disk, proceed with the following:

![duallpassrescuevmdiskattacherror.png](/.attachments/SME-Topics/Azure-Encryption/duallpassrescuevmdiskattacherror.png)

```powershell
$rgName = "ResourceGroupName"
$osDiskName = "OsDiskName"
New-AzureRmDiskUpdateConfig -EncryptionSettingsEnabled $false | Update-AzureRmDisk -diskName $osDiskName -ResourceGroupName $rgName

$recoveryVMName = "RecoveryVMName"
$recoveryVMRG = "RecoveryVMRG"
$OSDisk = Get-AzureRmDisk -ResourceGroupName $rgName -DiskName $osDiskName
$vm = Get-AzureRMVM -ResourceGroupName $recoveryVMRG -Name $recoveryVMName
Add-AzureRmVMDataDisk -VM $vm -Name $osDiskName -ManagedDiskId $osDisk.Id -Caching None -Lun 3 -CreateOption Attach
Update-AzureRMVM -VM $vm -ResourceGroupName $recoveryVMRG
```

or

Clear the encryption settings of the faulty disk that you want to attach to the rescue VM using the following commands. First, validate the encryption properties details:

```powershell
$rgName = "MyRG"
$diskName = "Faultyosdisk"
$disk = Get-AzDisk -ResourceGroupName $rgName -DiskName $diskName
$disk.EncryptionSettingsCollection.EncryptionSettings | ConvertTo-Json -Depth 10
```

Clear and validate the null encryption properties. The output will be no or null.

```powershell
$disk.EncryptionSettingsCollection = @{}
$disk | Update-AzDisk
$disk.EncryptionSettingsCollection.EncryptionSettings | ConvertTo-Json -Depth 10
```

Now, proceed with attaching the faulty disk to the rescue VM as a data disk.

**Note:** You cannot attach a managed disk to a VM that was restored from a blob image.

## Preparation

### Install Az Module in the Rescue VM

**Note: You can also perform these steps using the customer�s local computer instead of the Rescue VM.**

Run the following commands in PowerShell:

1. `[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12`
2. `Install-Module -Name Az -AllowClobber`
3. `Import-Module -Name Az`
4. `Login-AzAccount`

### Create Required Folders in the Rescue VM

1. Open the C: drive on your Rescue VM computer and create the following folder: `C:\BEK`
    - **Note:** If you know you're using a **KEK/Wrapped BEK**, create a `C:\Script` folder, saving the GitHub template to that folder and naming it `RetrieveEncryptionSecretViaUrl.ps1`
    - <https://gist.github.com/ShridharParameshwarBhat/5a4f439afdb99ec4730e481b91bcb795>

    ![UnlockFolders.JPG](/.attachments/SME-Topics/Azure-Encryption/b5faa861-319d-657d-5533-aaee1e033f74UnlockFolders.JPG)

### Retrieve BEK Filename

Go to the Azure Portal and open Azure Cloud Shell. Run the following, modifying "vmName" and "vault". This is to view the BEK/Wrapped BEK of all the drives.
- If using the Recovery VM name does not work, change the vmName to the affected VM.

```powershell
## AZ module version
$vmName = "EncryptedVM"
$vault = "javanencKV"

# Get the Secrets for all VM Drives from Azure Key Vault
Get-AzKeyVaultSecret -VaultName $vault | where {($_.Tags.MachineName -eq $vmName) -and ($_.ContentType -match 'BEK')} `
    | Sort-Object -Property Created `
    | ft  Created, `
        @{Label="Content Type";Expression={$_.ContentType}}, `
        @{Label ="Volume"; Expression = {$_.Tags.VolumeLetter}}, `
        @{Label ="DiskEncryptionKeyFileName"; Expression = {$_.Tags.DiskEncryptionKeyFileName}}, `
        @{Label ="URL"; Expression = {$_.Id}}
```

![beks.png](/.attachments/SME-Topics/Azure-Encryption/beks.png)
![4effce3f-d4c0-57f1-a56e-80d3d2104155BEKOutput.JPG](/.attachments/SME-Topics/Azure-Encryption/4effce3f-d4c0-57f1-a56e-80d3d2104155BEKOutput.JPG)
![57adacb5-5e34-34e0-0b5a-f64d5347c461800px-CloudShell.JPG](/.attachments/SME-Topics/Azure-Encryption/57adacb5-5e34-34e0-0b5a-f64d5347c461800px-CloudShell.JPG)

#### BEK

1. Once you have the .BEK name, navigate to your Key Vault and verify the secret with the BEK filename obtained.
2. Copy and paste the below script to PowerShell ISE on your Rescue VM/on your local computer and run.

Replace the values for `$vault` and `$bek` with the values of your environment. For the `$bek` value, use the disk encryption file name with .BEK that you obtained in the last procedure Retrieve BEK filename.

```powershell
$vault = "myKeyVault"
$bek = "xx7B2F5A-xxxx-4637-xxxx-xxx99C12F85C"
$keyVaultSecret = Get-AzKeyVaultSecret -VaultName $vault -Name $bek
$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($keyVaultSecret.SecretValue)
$bekSecretBase64 = [Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
$bekFileBytes = [Convert]::FromBase64String($bekSecretBase64)
$path = "C:\BEK\testBEK.BEK"
[System.IO.File]::WriteAllBytes($path, $bekFileBytes)
```

3. If the script runs successfully, there will be no output or completion message. However, a new file will be created in the `C:\BEK` folder. (The `C:\BEK` folder must already exist.)
4. The output path should be `C:\BEK\testBEK` (what you want the BEK file to be named after output, i.e., testBEK).
5. Copy and paste the BEK folder to the recovery VM in the same location `C:\` (if you have run the script on your local machine).
6. Proceed to the "Unlock VM/Drive" section.

#### KEK

1. The following script needs to be saved to a .ps1 file, such as "RetrieveEncryptionSecretViaUrl.ps1". **DO NOT** copy to a PowerShell ISE window.
    - <https://gist.github.com/ShridharParameshwarBhat/5a4f439afdb99ec4730e481b91bcb795>
2. The logged-in user account must have "unwrap" permission in the Key Vault Access policies in the USER | Key permissions | Cryptographic Operations | Unwrap Key.
    - Please copy and paste the parameters below into a notepad:
        - KEK URL -> Full URL of the KEK
        - Secret URL -> Full URL of the Secret
        - Output path -> On your local machine, this should be the `C:\BEK` folder. Make sure this is created prior to running the script.
    - KEK URL:
        ![UnlockKEKURL.JPG](/.attachments/SME-Topics/Azure-Encryption/8bbc97c4-2024-55eb-c9d0-c5ee23dba503700px-UnlockKEKURL.JPG)

3. Go back to the Rescue VM and open PowerShell ISE and run the following:
    - `C:\Scripts\RetrieveEncryptionSecretViaUrl.ps1 -secretUrl <SecretURL> -kekUrl <KEKURL> -secretFilePath <Output Path C:\BEK\TestKEK>`
    - Example: `C:\Scripts\RetrieveEncryptionSecretViaUrl.ps1 -secretUrl https://singlepassvault.vault.azure.net/secrets/70F... -kekUrl https://singlepassvault.vault.azure.net/keys/KEKTest/f9b... -secretFilePath C:\BEK\TestKEK`

    ![PSRun.JPG](/.attachments/SME-Topics/Azure-Encryption/48498eac-984c-405f-7125-15158e1227891400px-PSRun.JPG)

### Unlock VM/Drive

1. After executing the .ps1 script for either BEK/KEK, you will notice that there's no output/completion message.
2. You can check for the BEK/KEK output by navigating to the `C:\BEK` folder on your local machine and finding the output file name.
    
    ![UnlockFileName.JPG](/.attachments/SME-Topics/Azure-Encryption/fedf6ec9-80df-e99f-9aec-e6d568d4c622600px-UnlockFileName.JPG)

3. If everything worked correctly, you can open up the file and you will see "BitLocker Extension Key Protector".
    ![KeyUnlockSuccess.JPG](/.attachments/SME-Topics/Azure-Encryption/07b82c5e-6484-87ee-04ca-cf1c61e51e18800px-KeyUnlockSuccess.JPG)

4. After verification, copy the BEK folder from your local machine to the VM.
    - In order to unlock, confirm the drive letter that needs to be unlocked. This drive will have a "Gold Lock and Key".

    ![UnlockDrive.JPG](/.attachments/SME-Topics/Azure-Encryption/cb09a674-8fe6-2e43-d390-7a5b7d5e89d9600px-UnlockDrive.JPG)

5. Open an elevated CMD prompt.
    - Run `manage-bde -unlock <DRIVE LETTER> -RecoveryKey [file path of the BEK file or the .BEK name (i.e., C:\BEK\TestKEK)]`
        - Example: `manage-bde -unlock E: -RecoveryKey C:\BEK\TestKEK.bek`
        - Copy that command into a notepad, edit with the correct drive letters, and unlock the VM.

        ![Manage-bde.JPG](/.attachments/SME-Topics/Azure-Encryption/79912116-10ad-cc2f-731b-0bb83f27eeb4600px-Manage-bde.JPG)

6. When unlocking the VM, if you receive the error message below, please refer to the screenshot.

    **"ERROR: An error occurred while attempting to read the key from disk."**

    In some cases, you will have to drop the ".bek" file extension when trying to unlock the drive.

    ![Unlocked.JPG](/.attachments/SME-Topics/Azure-Encryption/40058177-2ca3-1c68-782f-adc07bb8b7571200px-Unlocked.JPG)

**Note: If the customer does not want to continue with the disk encrypted, you will have to run the following command to decrypt the disk:**

```shell
manage-bde -off <DRIVE LETTER>:
```
#### Rebuild the VM

- **Rebuild the VM using PowerShell (Unmanaged Disk)**

    ```powershell
    # To login to Azure Resource Manager
    Login-AzAccount
    
    # To view all subscriptions for your account
    Get-AzSubscription
    
    # To select a default subscription for your current session
    Set-AzContext �SubscriptionID �SubscriptionID�
    
    $rgname = "rgnane"
    $loc = "location"
    $vmsize = "vmsize"
    $vmname = "vmname"
    $vm = New-AzVMConfig -VMName $vmname -VMSize $vmsize
    
    $nic = Get-AzNetworkInterface -Name "nicname" -ResourceGroupName $rgname
    $nicId = $nic.Id
    
    $vm = Add-AzVMNetworkInterface -VM $vm -Id $nicId
    
    $osDiskName = "osdiskname"
    $osDiskVhdUri = "https://storageacount.blob.core.windows.net/vhds/nameofdisk.vhd"
    
    $vm = Set-AzVMOSDisk -VM $vm -VhdUri $osDiskVhdUri -name $osDiskName -CreateOption attach -Windows
    
    New-AzVM -ResourceGroupName $rgname -Location $loc -VM $vm -Verbose
    ```

- **Rebuild the VM from the snapshot (Managed Disk) or swap the repaired disk to the original VM**

- **Rebuild the VM using an automated script**: The restore script can be found here: [Recreate DualPass Encrypted VM from fixed encrypted disk_Encryption](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/623835) (Dualpassvm)

## LabBox

For the purpose of training or following along with this TSG, you can use the following link to deploy a VM with this scenario built-in. This lab is not to be shared with customers.

[![Click to Deploy]( /.attachments/SME-Topics/Cant-RDP-SSH/ARMDeploy_Deploy-ARM-JSON-to-Azure.png)](https://labboxprod.azurewebsites.net/api/Labbox?url=https://supportability.visualstudio.com/AzureIaaSVM/_git/Labbox?path=/SME/Encryption/adeAdvancedday01.json)

::: template /.templates/Processes/Knowledge-Management/Azure-ADE-Feedback-Template.md
:::

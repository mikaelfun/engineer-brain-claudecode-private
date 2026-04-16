# VM Windows OS — 排查工作流

**来源草稿**: ado-wiki-b-Guest-Agent-Event-Logs-Reference-Guide-WindowsOS.md, ado-wiki-b-Unlock-Encrypted-Windows-Disk.md, ado-wiki-c-aad-login-extension-for-windows.md, ado-wiki-c-monitoring-extension-windows-manual-upgrade.md, ado-wiki-c-windows-partitions-non-boot.md, ado-wiki-d-access-file-share-from-windows.md, ado-wiki-e-Encrypt-a-Windows-VM.md, ado-wiki-f-Search-Windows-Events-From-SAC.md, mslearn-windows-activation-troubleshoot.md, mslearn-windows-vm-deployment-faqs.md, onenote-windows-server-eos-esu-policy.md
**Kusto 引用**: (无额外 Kusto 查询文件)
**场景数**: 2
**覆盖子主题**: vm-windows-os
**生成日期**: 2026-04-07

---

## Scenario 1: Ado Wiki D Access File Share From Windows
> 来源: ado-wiki-d-access-file-share-from-windows.md | 适用: Mooncake \u2705

### 排查步骤
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files All Topics/How Tos/Access Azure File Share from Windows VM_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Azure%20Files%20All%20Topics/How%20Tos/Access%20Azure%20File%20Share%20from%20Windows%20VM_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
Tags:
- cw.Azure-Files-All-Topics
- cw.How-To
::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::
[[_TOC_]]
## Summary
This article is describing the available options to access an existing Azure File share from a Windows machine (Azure VM or on premises), using Command Prompt or Windows PowerShell.
## What is Azure File?
Azure File storage is a service that offers file shares in the cloud using the standard Server Message Block (SMB) Protocol. Both SMB 2.1 and SMB 3.0 are supported. With Azure File storage, you can migrate legacy applications that rely on file shares to Azure quickly and without costly rewrites. Applications running in Azure virtual machines or cloud services or from on-premises clients can mount a file share in the cloud, just as a desktop application mounts a typical SMB share. Any number of application components can then mount and access the File storage share simultaneously.
Since a File storage share is a standard SMB file share, applications running in Azure can access data in the share via file sytem I/O APIs. Developers can therefore leverage their existing code and skills to migrate existing applications. IT Pros can use PowerShell cmdlets to create, mount, and manage File storage shares as part of the administration of Azure applications.
You can create Azure file shares using Azure Portal, the Azure Storage PowerShell cmdlets, the Azure Storage client libraries, or the Azure Storage REST API. Additionally, because these file shares are SMB shares, you can access them via standard and familiar file system APIs.
## Azure File Share mounting scenarios
With support for SMB 3.0, File storage now supports encryption and persistent handles from SMB 3.0 clients. Support for encryption means that SMB 3.0 clients can mount a file share from anywhere, including from:
  - An Azure virtual machine in the same region (also supported by SMB 2.1)
  - An Azure virtual machine in a different region (SMB 3.0 only)
  - An on-premises client application (SMB 3.0 only)
When a client accesses File storage, the SMB version used depends on the SMB version supported by the operating system. Please refer to [this blog](https://azure.microsoft.com/en-us/blog/azure-file-storage-now-generally-available/") for more details on SMB versions.
## Mount the file share from an Azure virtual machine or on premises machine running Windows
### Persisting connections to Microsoft Azure Files
By default, Windows attempts to persist connections to SMB shares across reboots. However, it will not automatically persist your Azure Files credentials across reboots, so it will fail to reconnect to an Azure Files share after a reboot. There are several ways to persist these credentials. One of these options, using the cmdkey command line utility, is described below. You can find other methods to persist the connections to Azure Files [here](https://blogs.msdn.microsoft.com/windowsazurestorage/2014/05/26/persisting-connections-to-microsoft-azure-files/).
The easiest way to establish a persistent connections is to save your storage account credentials into windows using the CmdKey command line utility. The following is an example command line for persisting your storage account credentials into your VM:
    cmdkey /add:[storage account name].file.core.windows.net /user:[storage account name] /pass:[storage account key]
*Note: yourstorageaccountname is not your live id but the name in the endpoint. CmdKey will also allow you to list the credentials it stored:*
    C:\>cmdkey /list
    Currently stored credentials:
Once the credentials have been persisted, you no longer have to supply them when connecting to your share. Instead you can connect without specifying any credentials.
Then you can reboot your VM (this will disconnect you from your VM). When your VM has restarted and you reconnect, you can open up another command window and confirm that your connection has been automatically reconnected:
    C:\>net use
    New connections will be remembered.
    Status Local Remote Network
    OK Z: \\filedemo.file.core.windows.net\demo1
    Microsoft Windows Network
    The command completed successfully.
### Method to mount the Azure File Share to another machine (Azure or on premises) via the Azure Portal
For mounting the file share from an on-premises client running Windows, you must first install a version of Windows which supports SMB 3.0. Windows will leverage SMB 3.0 encryption to securely transfer data between your on-premises client and the Azure file share in the cloud. **Open Internet access for port 445 (TCP Outbound) in your local network, as is required by the SMB protocol.**
*Note that some Internet service providers may block port 445, so you may need to check with your service provider.*
1.  Create a RM/Classic Storage Account from the Portal:
    ![File Share Storage Account](/.attachments/SME-Topics/Azure-Files-All-Topics/70c85275-3934-3303-0924-5939a162e3f2AzureStorage_Creating_FileshareStorageAccount.png)
2.  On the Storage Account, go to Files and click **+File share,** then add the name and the quota. Please note that the quota cannot be larger than 5120 GB.
    ![Creating File Share](/.attachments/SME-Topics/Azure-Files-All-Topics/c93a4486-1d9d-8e40-95eb-9c73c1d2a20cAzureStorage_CreatingAzFileShare.png)
3.  Upload Files to the share. This example uses a Microsoft Word file created on premises:
    ![File Share Example](/.attachments/SME-Topics/Azure-Files-All-Topics/93061c3c-5a6d-c549-3a2a-fc66dde75bb0AzureStorage_FileShareExample.png)
    ![FileShare Upload](/.attachments/SME-Topics/Azure-Files-All-Topics/26d7ccc0-54f0-92b0-e257-856088e76100AzureStorage_FileShareUpload.png)
4.  To view instructions on how to add the file share, click on Connect:
    ![File Share Mounting Instructions](/.attachments/SME-Topics/Azure-Files-All-Topics/9b072b60-134a-36e7-9f83-60892dc49512AzureStorage_FileShareMountingInstructions.png)
5.  Power up an Azure Windows Virtual Machine (within or outside the region where the File Share is located) and RDP into it, or just power up your on prem machine, then open the elevated Command Prompt and paste in the command displayed on the Connect blade in the Azure Portal, **replacing the drive letter and the Storage Account Key with the ones from your own scenario**:
    ![File Share Command Mount](/.attachments/SME-Topics/Azure-Files-All-Topics/a0538872-b728-58b1-7c18-7903ca644869AzureStorage_FileShareCmdMount.png)
6.  Check the File Explorer, find the File Share and check if it is displayed correctly. You can also access the Share via Command Prompt or PowerShell by accessing the drive letter you assigned to it:
    ![File Share Mount Windows](/.attachments/SME-Topics/Azure-Files-All-Topics/38a45b6a-1180-df99-93e8-689e0866e8d2AzureStorage_FileShareMountWindows.png)
### Method to create and mount Azure File Share to another machine (Azure or on premises) via Azure PowerShell
Alternatively, you can use Azure PowerShell to create and manage file shares. Please be sure you use the latest Azure PowerShell version. The last release can be downloaded from [here](https://learn.microsoft.com/en-us/powershell/azure/install-azure-powershell).
1.  **Create a context for your storage account and key**  
    Create the storage account context. The context encapsulates the storage account name and account key.  
    Replace `storage-account-name` and `storage-account-key` with your storage account name and key in the following example. **\# create a context for account and key**  
    **$ctx=New-AzureStorageContext storage-account-name storage-account-key**  
2.  **Create a new file share**  
    Next, create the new share, named `logs`. Please remember that the name of your file share must be all lowercase. For complete details about naming file shares and files, see [Naming and Referencing Shares, Directories, Files, and Metadata](/https://learn.microsoft.com/en-us/rest/api/storageservices/naming-and-referencing-shares--directories--files--and-metadata).  
    **\# create a new share**  
    **$s = New-AzureStorageShare logs -Context $ctx**  
3.  **Create a directory in the file share**  
    Next, create a directory in the share. In the following example, the directory is named `CustomLogs`.  
    **\# create a directory in the share**  
    **New-AzureStorageDirectory -Share $s -Path CustomLogs**  
4.  **Upload a local file to the directory**  
    Now upload a local file to the directory. The following example uploads a file from `C:\temp\Log1.txt`. Edit the file path so that it points to a valid file on your local machine.  
    **\# upload a local file to the new directory**  
    **Set-AzureStorageFileContent -Share $s -Source C:\\temp\\Log1.txt -Path CustomLogs**  
5.  **List the files in the directory**  
    To see the file in the directory, you can list all of the directory's files. This command returns the files and subdirectories (if there are any) in the CustomLogs directory.  
    **\# list files in the new directory**  
    **Get-AzureStorageFile -Share $s -Path CustomLogs | Get-AzureStorageFile Get-AzureStorageFile**  
    returns a list of files and directories for whatever directory object is passed in. "Get-AzureStorageFile -Share $s" returns a list of files and directories in the root directory. To get a list of files in a subdirectory, you have to pass the subdirectory to Get-AzureStorageFile. That's what this does -- the first part of the command up to the pipe returns a directory instance of the subdirectory CustomLogs. Then that is passed into Get-AzureStorageFile, which returns the files and directories in CustomLogs.  
6.  **Copy files**  
    Beginning with version 0.9.7 of Azure PowerShell, you can copy a file to another file, a file to a blob, or a blob to a file. Below we demonstrate how to perform these copy operations using PowerShell cmdlets.  
    **\# copy a file to the new directory**  
    **Start-AzureStorageFileCopy -SrcShareName srcshare -SrcFilePath srcdir/hello.txt -DestShareName destshare -DestFilePath destdir/hellocopy.txt -Context $srcCtx -DestContext $destCtx**  
    **\# copy a blob to a file directory**  
    **Start-AzureStorageFileCopy -SrcContainerName srcctn -SrcBlobName hello2.txt -DestShareName hello -**  
7.  **Mount the created file share to Azure Virtual Machine (same or different region) or to an on premises machine** To mount the File Share on a Windows machine, you could use the Windows PowerShell cmdlet [New-SmbMapping](https://learn.microsoft.com/en-us/powershell/module/smbshare/new-smbmapping?view=windowsserver2022-ps). Alternatively, the steps **A.4. - A.6**. can be followed to mount the file share to your machine.
## Troubleshoot mounting/connection issues with Azure File Shares
  - [Azure/Storage/Azure Files Connectivity Workflow](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/496116/)
  - [Azure/Storage/TSG/Problem mapping a drive when Storage Account key has a forward slash](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/496191 "Azure_Storage_TSG_Problem mapping a drive when Storage Account key has a forward slash")
  - [Azure/Storage/TSG/Problem accessing Azure Files Drive mapped under a different user](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/496189 "Azure_Storage_TSG_Problem accessing Azure Files Drive mapped under a different user")
  - [Azure/Storage/TSG/System Error 53 when connecting to an Azure Files share](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/496230 "Azure_Storage_TSG_System Error 53 when connecting to an Azure Files share")
## References
  - [Get started with Azure File storage on Windows](https://learn.microsoft.com/en-us/azure/storage/files/storage-files-quick-create-use-windows)
  - [Introducing Microsoft Azure File Service](https://learn.microsoft.com/en-us/azure/storage/files/storage-files-introduction)
::: template /.templates/Processes/Knowledge-Management/Azure-Files-All-Topics-Feedback-Template.md
:::

---

## Scenario 2: Ado Wiki E Encrypt A Windows Vm
> 来源: ado-wiki-e-Encrypt-a-Windows-VM.md | 适用: Mooncake \u2705

### 排查步骤
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:%2FSME%20Topics%2FAzure%20Encryption%2FHow%20Tos%2FAzure%20Disk%20Encryption%20%28ADE%29%2FEncrypt%20a%20Windows%20VM_Encryption"
importDate: "2026-04-06"
type: troubleshooting-guide
Tags:
- cw.Azure-Encryption
- cw.How-To
- cw.Reviewed-02-2025
::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::
[[_TOC_]]
## Scenario
A customer would like to encrypt their machine using PowerShell or a template.
## Prerequisites for Single Pass
1. Azure subscription: An active, valid Azure subscription is needed.
2. Azure PowerShell: Please use the latest version of Azure PowerShell SDK to configure Azure Disk Encryption. Download it from [here](https://docs.microsoft.com/en-us/powershell/scripting/install/installing-windows-powershell?view=powershell-7). Azure Disk Encryption is *NOT* supported by [Azure SDK version 1.1.0](https://github.com/Azure/azure-powershell/releases/tag/v1.1.0-January2016). If you are receiving an error related to using Azure PowerShell 1.1.0, please see [this article](http://blogs.msdn.com/b/azuresecurity/archive/2016/02/10/azure-disk-encryption-error-related-to-azure-powershell-1-1-0.aspx). Once PowerShell is installed, install the Az Module with the command `Install-Module -Name Az -AllowClobber`.
3. Azure Key Vault: Azure Disk Encryption securely stores the encryption secrets in a specified Azure Key Vault. Please refer to [Azure Key Vault](https://docs.microsoft.com/en-us/azure/virtual-machines/windows/disk-encryption-key-vault) for more details on how to set up a Key Vault in Azure. To ensure the encryption secrets don�t cross regional boundaries, **Azure Disk Encryption needs the Key Vault and the VM to be located in the same region. Please create and use a Key Vault that is in the same region as the VM to be encrypted.**
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
3. Azure Key Vault: Azure Disk Encryption securely stores the encryption secrets in a specified Azure Key Vault. Please refer to [Azure Key Vault](https://docs.microsoft.com/en-us/azure/virtual-machines/windows/disk-encryption-key-vault) for more details on how to set up a Key Vault in Azure. To ensure the encryption secrets don�t cross regional boundaries, **Azure Disk Encryption needs the Key Vault and the VM to be located in the same region. Please create and use a Key Vault that is in the same region as the VM to be encrypted.**
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
    MYSECUREVM   D:      https://mysecurevault.vault.azure.net:443/secrets
::: template /.templates/Processes/Knowledge-Management/Azure-ADE-Feedback-Template.md
:::

`[来源: ado-wiki-e-Encrypt-a-Windows-VM.md]`

---

## 关联已知问题

| 症状 | 方案 | 指向 |
|------|------|------|

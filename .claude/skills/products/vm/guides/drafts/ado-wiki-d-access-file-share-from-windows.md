---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files All Topics/How Tos/Access Azure File Share from Windows VM_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Azure%20Files%20All%20Topics/How%20Tos/Access%20Azure%20File%20Share%20from%20Windows%20VM_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Azure-Files-All-Topics
- cw.How-To
---

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

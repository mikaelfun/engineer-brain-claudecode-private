---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files All Topics/How Tos/Azure Files Identity/How to Execute Debug AzStorageAccountAuth script_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Azure%20Files%20All%20Topics/How%20Tos/Azure%20Files%20Identity/How%20to%20Execute%20Debug%20AzStorageAccountAuth%20script_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Azure-Files-All-Topics
- cw.How-To 
- cw.How-It-Works
- cw.Reviewed-06-2024
---

:::template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::


[[_TOC_]]

# Summary
The `Debug-AzStorageAccountAuth` cmdlet to conduct a set of basic checks on your Storage Account domain joined to AD DS or Entra Kerberos, it checks configurations with the logged-on AD user.

This should be the first option to troubleshoot AD DS and Entra Kerberos authentication issues.


# Scenarios
- On-premises Active Directory Domain Services (AD DS)
- Microsoft Entra Kerberos for hybrid user identities

> `IMPORTANT: Entra DS accounts are not yet supported on Debug-AzStorageAccountAuth` manual, validation is required.

# Instructions

### List of checks



[Debug-AzStorageAccountAuth cmdlet performs these checks in sequence and provides guidance for failures](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-storage/files/security/files-troubleshoot-smb-authentication?tabs=azure-portal#self-diagnostics-steps).


### Prerequisites
https://learn.microsoft.com/en-us/azure/storage/files/storage-files-identity-ad-ds-enable#prerequisites

- [.NET Framework 4.7.2 or higher](https://dotnet.microsoft.com/download/dotnet-framework/).
- [Azure PowerShell](https://learn.microsoft.com/en-us/powershell/azure/install-azure-powershell) (Az module) and [Az.Storage](https://www.powershellgallery.com/packages/Az.Storage/). You must have at least Az.PowerShell 2.8.0+ and Az.Storage 4.3.0+ to use AzFilesHybrid.
- [Active Directory PowerShell](https://learn.microsoft.com/en-us/powershell/module/activedirectory/) module.
- `Debug-AzStorageAccountAuth` cmdlet is supported on [AzFilesHybrid v0.1.2+ version](https://github.com/Azure-Samples/azure-files-samples/releases).
- You must run the script below in PowerShell 5.1 on a device that's domain joined to your on-premises AD DS

### Preparation Steps

1. [Download and unzip the latest version of the AzFilesHybrid module](https://github.com/Azure-Samples/azure-files-samples/releases).
2. Open `PowerShell` as Administrator
3. Change the execution policy to unblock importing AzFilesHybrid.psm1 module
   ```PowerShell
   Set-ExecutionPolicy -ExecutionPolicy Unrestricted -Scope CurrentUser
   ```
4. Navigate to where AzFilesHybrid is unzipped and stored and run to copy the files into your path
   ```PowerShell
   .\CopyToPSPath.ps1 
   ```
5. Import AzFilesHybrid module
   ```PowerShell
   Import-Module -Name AzFilesHybrid
   ```

### Execution Steps

6. From a Non-Administrator `PowerShell` session. Run `Connect-AzAccount` to set up your Microsoft Entra hybrid identity credentials you want to test the file share access.
7. Run the `Debug-AzStorageAccountAuth` cmdlet to conduct a set of basic checks on your AD configuration with the logged-on AD user. 

   > `IMPORTANT You need to run this cmdlet with an AD user that has owner permission on the target storage account.`

   ```PowerShell
   $ResourceGroupName = "<resource-group-name-here>"
   $StorageAccountName = "<storage-account-name-here>"

    Debug-AzStorageAccountAuth `
    -StorageAccountName $StorageAccountName `
    -ResourceGroupName $ResourceGroupName `
    -Verbose
    ```

   If you just want to run a sub-selection checks, you can use the `-Filter` parameter, along with a comma-separated list of checks to run. For example, to run all checks related to share-level permissions (RBAC), use the following PowerShell cmdlets:

    ```PowerShell
    $ResourceGroupName = "<resource-group-name-here>"
   $StorageAccountName = "<storage-account-name-here>"

   Debug-AzStorageAccountAuth `
    -Filter CheckSidHasAadUser,CheckUserRbacAssignment `
    -StorageAccountName $StorageAccountName `
    -ResourceGroupName $ResourceGroupName `
    -Verbose
   ```

   If you have the file share mounted on `X:`, and if you only want to run the check related to file-level permissions (Windows ACLs), you can run the following PowerShell cmdlets:

   ```PowerShell
   $ResourceGroupName = "<resource-group-name-here>"
   $StorageAccountName = "<storage-account-name-here>"
   $FilePath = "X:\example.txt"

    Debug-AzStorageAccountAuth `
    -Filter CheckUserFileAccess `
    -StorageAccountName $StorageAccountName `
    -ResourceGroupName $ResourceGroupName `
    -FilePath $FilePath `
    -Verbose
   ```


# References

- [Azure Files Domain Authentication Debugging](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-storage/files/security/files-troubleshoot-smb-authentication?tabs=azure-portal#self-diagnostics-steps).
- [Enable AD DS authentication for Azure file shares](https://learn.microsoft.com/en-us/azure/storage/files/storage-files-identity-ad-ds-enable).
- [Enable Microsoft Entra Kerberos authentication for hybrid identities on Azure Files](https://learn.microsoft.com/en-us/azure/storage/files/storage-files-identity-auth-hybrid-identities-enable?tabs=azure-portal).

::: template /.templates/Processes/Knowledge-Management/Azure-Files-All-Topics-Feedback-Template.md
:::

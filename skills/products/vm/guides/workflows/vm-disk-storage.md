# VM Disk & Storage — 排查工作流

**来源草稿**: ado-wiki-f-adds-hybrid-storage-aadj-haadj.md, ado-wiki-f-debug-azstorage-account-auth.md, onenote-vm-storage-performance-throttling.md
**Kusto 引用**: (无额外 Kusto 查询文件)
**场景数**: 6
**覆盖子主题**: vm-disk-storage-a, vm-disk-storage-b, vm-disk-storage-c, vm-disk-storage-d, vm-disk-storage-e, vm-disk-storage-f
**生成日期**: 2026-04-07

---

## Scenario 1: In AADJ machine- How to access AD DS Joined & AAD Hybrid Joined storage accounts
> 来源: ado-wiki-f-adds-hybrid-storage-aadj-haadj.md | 适用: Mooncake \u2705

### 排查步骤
- Scenario 1.1: AD DS Joined Storage account
        a.	Create a AADJ VM following.
        b.	Create an on-prem DC or use an existing one.
        c.	Login to on-prem Domain Controller
        d.	Create a storage account in azure portal and join it to the domain using Join-AzStorageAccount  cmdlet from AZ hybridfile follow this link https://learn.microsoft.com/en-us/azure/storage/files/storage-files-identity-ad-ds-enable
        e.	Set second SPN using following powershell cmdlet
                $spnvalue = "cifs/siemens1.ad001.azurefilesidentity.net"
                Set-ADComputer -Identity $StorageAccountName -ServicePrincipalNames @{Add=$spnValue} -ErrorAction Stop 
        f.	Run the following cmdlet
                Get-ADComputer -identity <Storage account name> -Properties ServiceprincipalName, The result will show the added SPN as below.
        g.	Add a CNAME entry using Active Directory DNS Manager and follow the steps below for each storage account in the domain that the storage account is joined to
            - Go to Server manager -> Go to DNS -> right click on selected server and Select DNS Manager. 
            - Under your Doman, Go to Forward Looking Zones.
            - Go to your domain and right click, Select New Alias (CNAME)
            - For the alias name, enter your storage account name.
            - For the fully qualified domain name (FQDN), enter <storage-account-name>.<domain-name>, such as mystorageaccount.onpremad1.com.
            - For the target host FQDN, enter <storage-account-name>.file.core.windows.net
        h.	Login to AADJ VM- for each user and try to login (using user@Domain credentials) to it. Then run below command in elevated window. And restart the VM 
            - Follow the following steps to edit your RDP file to add user credentials to it to Run the VM as a specified user.
            - **	Edit your RDP file to end with the following lines**
                    username:s:.\AzureAD\KerbUser01@aadintcanaryoutlook.onmicrosoft.com
                    enablecredsspsupport:i:0
                    authentication level:i:2
                **Note** Why are we adding the rdp property in the text editor. Details here https://learn.microsoft.com/en-us/windows-server/remote/remote-desktop-services/clients/rdp-files 
        i.	Once you login as a specified user run the following command to add reg key.
                    reg add HKLM\SYSTEM\CurrentControlSet\Control\Lsa\Kerberos\Parameters /v CloudKerberosTicketRetrievalEnabled /t REG_DWORD /d 1 <--(this is not relevant to access AD DS joined SA but good to have it to show that the sa can be accessed after setting this reg key.)
        j.	Now try to mount to the file share created under the AD DS joined storage account.
- Scenario 1.2: AAD Hybrid joined Storage account
        a.	Using same on-prem DC server
        b.	Using same AADJ VM
        c.	Create a storage account and follow this link to enable AAD Kerberos via portal https://learn.microsoft.com/en-us/azure/storage/files/storage-files-identity-auth-hybrid-identities-enable?tabs=azure-portal 
        d.	Login to AADJ VM. (if logged in as local admin user)
        e.	Add Reg key
            reg add HKLM\SYSTEM\CurrentControlSet\Control\Lsa\Kerberos\Parameters /v CloudKerberosTicketRetrievalEnabled /t REG_DWORD /d 1 
        f.	If you login as **Local admin** user- Open cmd prompt and run the below cmd-
            - Runas /user:Domain\user cmd
            - New window will open: mount the file share using following command:
                Net use X: \\Storageaccount.file.core.windows.net\Fileshare
        g.	If you log as AD Admin user, open cmd prompt and try to mount it should work.

---

## Scenario 2: In HAADJ machine- how to access AD DS Joined & AAD Hybrid Joined storage accounts
> 来源: ado-wiki-f-adds-hybrid-storage-aadj-haadj.md | 适用: Mooncake \u2705

### 排查步骤
- Scenario 2.1: AD DS Joined Storage account
        a.	Follow the same steps as mentioned above for AADJ VM.
- Scenario 2.2: AAD Hybrid joined Storage account
        a.	Create a Storage account and Follow this link to enable AAD kerberos via portal. https://learn.microsoft.com/en-us/azure/storage/files/storage-files-identity-auth-hybrid-identities-enable?tabs=azure-portal 
        b.	Login to HAADJ VM (local admin) or as admin user , add the reg key and Try to Mount
        c.	If you login as Local admin user- Open cmd prompt and run the below command:
            - Runas /user:Domain\user cmd
        d.	New window will open: mount the file share:
            - Net use X: \\Storageaccount.file.core.windows.net\Fileshare
        e.	If you log as AD Admin user, open cmd prompt and try to mount it should work.
**Notes**: 
If mount does't work or if you are not able to get kerberos ticket, you would need to debug using fiddler and wireshark. Once done with debugging- please cleanup (its important) 
**Important note**: 
AADJ and HAADJ to have CloudKerberosTicketRetrievalEnabled Regkey enabled which allows access to AAD Hybrid Storage account
```cmd
reg add HKLM\SYSTEM\CurrentControlSet\Control\Lsa\Kerberos\Parameters /v CloudKerberosTicketRetrievalEnabled /t REG_DWORD /d 1
```

`[来源: ado-wiki-f-adds-hybrid-storage-aadj-haadj.md]`

---

## Scenario 3: Debug Azstorage Account Auth
> 来源: ado-wiki-f-debug-azstorage-account-auth.md | 适用: Mooncake \u2705

### 排查步骤
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

`[来源: ado-wiki-f-debug-azstorage-account-auth.md]`

---

## Scenario 4: Temp disk NOT required
> 来源: onenote-vm-storage-performance-throttling.md | 适用: Mooncake \u2705

### 排查步骤
1. Disable temp local disk
2. Ensure: VM total cached disk throughput < VM cached max limit
3. Ensure: Total disk throughput < VM uncached max limit

---

## Scenario 5: Temp disk IS required
> 来源: onenote-vm-storage-performance-throttling.md | 适用: Mooncake \u2705

### 排查步骤
1. Do NOT enable disk cache on mission critical disks (temp disk triggers cached throttling)
2. Total disk throughput (excluding temp) < VM uncached max limit
3. Consider disabling OS disk cache too (P10 OS without cache may be slow, upgrade to P20/P30)

---

## Scenario 6: Large VM still throttled
> 来源: onenote-vm-storage-performance-throttling.md | 适用: Mooncake \u2705

### 排查步骤
- Move workload to different server if even largest VM size throttles

---

## 关联已知问题

| 症状 | 方案 | 指向 |
|------|------|------|

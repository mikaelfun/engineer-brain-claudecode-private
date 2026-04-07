---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files All Topics/Workflows/Azure Files Identity/AD DS with AD Connect Syncing to AAD with AAD DS/Mount Issues with Azure AD DS Integration_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Azure%20Files%20All%20Topics/Workflows/Azure%20Files%20Identity/AD%20DS%20with%20AD%20Connect%20Syncing%20to%20AAD%20with%20AAD%20DS/Mount%20Issues%20with%20Azure%20AD%20DS%20Integration_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Mount Issues with Azure AD DS Integration - Decision Tree

## Scenario
Customer configured AAD DS and created file share but cannot mount or authenticate with domain account.

## Troubleshooting Steps

### 1. Port 445 connectivity
```powershell
Test-NetConnection -ComputerName "StorageAccount.file.core.windows.net" -Port 445
```
- **Yes** (TcpTestSucceeded = True): Continue to step 2
- **No**: Ensure outbound connectivity to storage account on port 445

### 2. Storage account domain joined?
Check: Storage Account > Configuration > AD DS should be enabled with correct domain.
- **Yes**: Continue to step 3
- **No**: Join the domain first

### 3. Can mount with storage account key?
Try mounting with storage account name + access key (not domain credentials).
- **Error**: Follow [Windows mount troubleshooting](https://docs.microsoft.com/en-us/azure/storage/files/storage-troubleshoot-windows-file-connection-problems)
- **Success**: Continue to step 4

### 4. Workstation domain joined?
Check via System Properties or `dsregcmd /status`.
- **Yes**: Continue to step 5
- **No**: Join workstation to the correct domain

### 5. NTFS permissions configured?
Check if NTFS permissions are set for the user/group on the file share.
- **No**: Follow [Configure Windows ACLs with File Explorer](https://docs.microsoft.com/en-us/azure/storage/files/storage-files-identity-ad-ds-configure-permissions#configure-windows-acls-with-windows-file-explorer)
- **Yes**: Continue to step 6

### 6. RBAC assigned?
Verify: Storage Account > Access Control (IAM) > Check role assignments for user/group.
Ensure appropriate Azure Files role is assigned (e.g., Storage File Data SMB Share Contributor).

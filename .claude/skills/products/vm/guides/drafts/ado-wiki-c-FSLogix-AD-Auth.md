---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files All Topics/TSGs/Azure Files Identity/AD DS with AD Connect Syncing to AAD with AAD DS/FSLogix_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Files%20All%20Topics%2FTSGs%2FAzure%20Files%20Identity%2FAD%20DS%20with%20AD%20Connect%20Syncing%20to%20AAD%20with%20AAD%20DS%2FFSLogix_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# FSLogix with AD Authentication for Azure Files

FSLogix is designed to roam profiles in remote computing environments, such as Windows Virtual Desktop. It stores a complete user profile in a single container.

## Setup Steps

### 1. RBAC Azure Permissions

After domain-joining the Azure storage account, assign Azure RBAC permissions:

- **Admin account**: `Storage File Data SMB Share Elevated Contributor`
- **User accounts**: `Storage File Data SMB Share Contributor`

> Accounts must be created in on-premises AD and synced to Azure AD. Accounts created directly in Azure AD won't work.

Steps:
1. Open Azure Portal -> Storage Account -> Access Control (IAM)
2. Select "Add a role assignment"
3. Assign appropriate role

### 2. NTFS Windows Permissions

Mount the file share with storage account key:
```cmd
net use <drive-letter>: <UNC-path> <SA-key> /user:Azure\<SA-name>
```

Configure NTFS permissions:
```cmd
icacls <drive>: /grant <user-email>:(M)
icacls <drive>: /grant "Creator Owner":(OI)(CI)(IO)(M)
icacls <drive>: /remove "Authenticated Users"
icacls <drive>: /remove "Builtin\Users"
```

### 3. Configure FSLogix on Session Host

1. RDP to the session host VM
2. Download and install [FSLogix](https://docs.microsoft.com/en-us/fslogix/install-ht)
3. Configure registry:
   - Navigate to `HKLM\SOFTWARE\FSLogix`
   - Create `Profiles` key
   - Create `Enabled` DWORD = 1
   - Create `VHDLocations` MULTI_SZ = UNC path to file share
4. Restart the VM

## Troubleshooting

**Symptom**: Users profiles unable to read or write to the storage account.

**Check**: At the Azure File Share level, verify WVD Users and Admin have correct Azure SMB permissions (Storage File Data SMB Share Contributor/Elevated Contributor roles).

## Collaboration

If user needs help configuring FSLogix, create collaboration to FSLogix team:
- **Routing**: `Azure\Azure Virtual Desktop\FSLogix\Issue with Profile and Office Container`
- Request customer upload most recent FSLogix logs for the affected machine

## Key References

- [Configure SMB Storage Permissions](https://learn.microsoft.com/en-us/fslogix/how-to-configure-storage-permissions)
- [Troubleshooting container attach/detach](https://learn.microsoft.com/en-us/fslogix/troubleshooting-container-attach-detach#storage-permissions)
- [Troubleshooting SMB file share open handles](https://learn.microsoft.com/en-us/fslogix/troubleshooting-open-file-handles)
- [Users don't have access to storage provider](https://learn.microsoft.com/en-us/fslogix/troubleshooting-old-temp-local-profiles#users-dont-have-access-to-the-storage-provider-permissions)
- [Troubleshoot Known Issues](https://learn.microsoft.com/en-us/fslogix/troubleshooting-known-issues)
- [FSLogix error codes](https://learn.microsoft.com/en-us/fslogix/troubleshooting-error-codes)
- [Troubleshooting with Logging and Diagnostics](https://learn.microsoft.com/en-us/fslogix/troubleshooting-events-logs-diagnostics)
- [Storage options for FSLogix profile containers](https://docs.microsoft.com/en-us/azure/virtual-desktop/store-fslogix-profile)

### Log Types

FSLogix creates three log types:
1. Client event logs
2. Text-based log files
3. Event Trace Logging (ETL)

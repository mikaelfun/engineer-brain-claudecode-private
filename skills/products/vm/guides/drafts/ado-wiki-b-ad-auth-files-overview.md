---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files All Topics/How Tos/Azure Files Identity/AD DS with AD Connect Syncing to AAD with AAD DS/AD Authentication for Files Overview_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Files%20All%20Topics%2FHow%20Tos%2FAzure%20Files%20Identity%2FAD%20DS%20with%20AD%20Connect%20Syncing%20to%20AAD%20with%20AAD%20DS%2FAD%20Authentication%20for%20Files%20Overview_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Active Directory Authentication over SMB for Azure Files

## Overview
Azure Files supports identity-based authentication over SMB through Azure AD DS (GA) and Active Directory (AD DS). AD domain joined machines from on-premises or Azure can mount Azure Files using existing AD credentials. AD identities must be synced to Azure AD to enforce share-level permissions via RBAC. NTFS DACLs from existing file servers are preserved.

## End-to-End Workflow
1. Enable Azure Files AD authentication on storage account
2. Assign access permissions for a share to the Azure AD identity (synced with target AD identity)
3. Configure NTFS permissions over SMB for directories and files
4. Mount Azure file share from AD domain joined VM

## Prerequisites
1. AD environment synced to Azure AD (AD Connect)
2. Domain-joined machine or Azure VM (Windows 7+ / Server 2008 R2+)
3. Azure file share (same subscription as Azure AD tenant)
4. Verify connectivity by mounting with storage account key first

## Limitations
- Only one domain service per storage account (Azure AD DS OR AD DS)
- AD identities must be synced to Azure AD (Password Hash Sync optional)
- AD auth does not support Computer accounts
- Single AD forest support only
- AD auth for SMB supported for Azure File Sync

## Enable AD Authentication
1. Download AzureFilesActiveDirectoryUtilities.psm1
2. Domain-join device with AD credentials (permissions to create service logon/computer account)
3. Run with Azure AD credential (storage account owner/contributor):
```powershell
Set-ExecutionPolicy -ExecutionPolicy Unrestricted -Scope Currentuser
Import-Module -Name AzFilesHybrid
Connect-AzAccount
Select-AzureSubscription -SubscriptionId <id>
Join-AzStorageAccountForAuth -ResourceGroupName "<rg>" -Name "<sa>" -DomainAccountType <ServiceLogonAccount|ComputerAccount> -OrganizationUnitName "<ou>"
```

## Password Rotation
If OU enforces password expiration, rotate before max age:
```powershell
Update-AzStorageAccountADObjectPassword -RotateToKerbKey kerb2 -ResourceGroupName "<rg>" -StorageAccountName "<sa>"
```

## Case Handling / Escalation
- Windows Directory Services: AD OU/identity/domain-join issues
- Azure AD: AD Connect sync issues
- IaaS Storage: Enable feature, Join command, mounting, NTFS/RBAC permissions
- Azure Networking: Private endpoint connectivity
- FSLogix: Profile/Office container issues
- Escalation: Ava Channel (STG - Files - All topics)

## Common TSG Error Codes
- Error 5: Access Denied
- Error 1219: Multiple Connections
- Error 1326: Username or password incorrect
- Error 1396: Target account name incorrect
- System Error 86: Windows 7/2008 compatibility

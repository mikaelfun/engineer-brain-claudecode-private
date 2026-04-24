---
source: mslearn
sourceRef: null
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-storage/files/security/files-troubleshoot-smb-authentication
importDate: "2026-04-24"
type: guide-draft
---

# Azure Files SMB Identity-Based Authentication Diagnostic Guide

## Overview

This guide covers systematic troubleshooting for identity-based authentication issues with SMB Azure file shares, including AD DS, Microsoft Entra Domain Services, and Microsoft Entra Kerberos authentication.

## Self-Diagnostics with Debug-AzStorageAccountAuth

The `Debug-AzStorageAccountAuth` cmdlet performs comprehensive checks on AD configuration:

### Prerequisites
- AzFilesHybrid v0.1.2+ (for AD DS) or v0.3.0+ (for Entra Kerberos)
- Logged in as AD user with owner permission on storage account

### Running Diagnostics

```powershell
Connect-AzAccount
$ResourceGroupName = "<resource-group>"
$StorageAccountName = "<storage-account>"
Debug-AzStorageAccountAuth -StorageAccountName $StorageAccountName -ResourceGroupName $ResourceGroupName -Verbose
```

### Checks Performed (AD DS)

1. **CheckADObjectPasswordIsCorrect** - Verify storage account AD identity password matches kerb1/kerb2 key
2. **CheckADObject** - Confirm AD object exists with correct SPN
3. **CheckDomainJoined** - Validate client machine is domain joined
4. **CheckPort445Connectivity** - Verify port 445 is open for SMB
5. **CheckSidHasAadUser** - Check if AD user is synced to Entra ID
6. **CheckAadUserHasSid** - Verify Entra user has SID associated
7. **CheckGetKerberosTicket** - Attempt to get Kerberos ticket for storage account
8. **CheckStorageAccountDomainJoined** - Verify AD authentication is enabled
9. **CheckUserRbacAssignment** - Check RBAC share-level permissions
10. **CheckUserFileAccess** - Check directory/file level Windows ACLs
11. **CheckKerberosTicketEncryption** - Verify encryption type compatibility
12. **CheckChannelEncryption** - Verify SMB channel encryption compatibility
13. **CheckDomainLineOfSight** - Check DC network connectivity
14. **CheckDefaultSharePermission** - Verify default share-level permission
15. **CheckAadKerberosRegistryKeyIsOff** - Check Entra Kerberos registry key

### Checks Performed (Entra Kerberos)

1. **CheckPort445Connectivity** - SMB port
2. **CheckAADConnectivity** - Entra connectivity
3. **CheckEntraObject** - Entra object and SPN
4. **CheckRegKey** - CloudKerberosTicketRetrieval registry key
5. **CheckRealmMap** - Kerberos realm mappings
6. **CheckAdminConsent** - Microsoft Graph permissions
7. **CheckWinHttpAutoProxySvc** - WinHTTP Web Proxy Auto-Discovery Service
8. **CheckIpHlpScv** - IP Helper service
9. **CheckFiddlerProxy** - Fiddler proxy interference
10. **CheckEntraJoinType** - Machine Entra join type

### Selective Checks

Run specific checks only:
```powershell
Debug-AzStorageAccountAuth -Filter CheckSidHasAadUser,CheckUserRbacAssignment -StorageAccountName $StorageAccountName -ResourceGroupName $ResourceGroupName -Verbose
```

### File-level Permission Check

```powershell
Debug-AzStorageAccountAuth -Filter CheckUserFileAccess -StorageAccountName $StorageAccountName -ResourceGroupName $ResourceGroupName -FilePath "X:\example.txt" -Verbose
```

## Common Issues Quick Reference

| Symptom | Likely Check | Fix |
|---------|-------------|-----|
| Access denied mounting share | CheckUserRbacAssignment | Assign share-level RBAC role |
| Kerberos ticket fails | CheckGetKerberosTicket | Run klist, check SPN config |
| AD password mismatch | CheckADObjectPasswordIsCorrect | Run Update-AzStorageAccountADObjectPassword |
| Port 445 blocked | CheckPort445Connectivity | Open port 445 or use VPN |
| Wrong encryption type | CheckKerberosTicketEncryption | Update storage account encryption settings |

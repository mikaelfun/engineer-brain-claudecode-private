---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files Identity/TSGs/SMB Windows Permission Model/SMB Windows Permission Model_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Files%20Identity%2FTSGs%2FSMB%20Windows%20Permission%20Model%2FSMB%20Windows%20Permission%20Model_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Azure-Files-All-Topics
- cw.Overview
- cw.Reviewed-11-2025
---


[[_TOC_]]

# Overview TSG: SMB Windows Permission Model (RBAC) 

This guide supports CSS engineers in diagnosing and resolving issues related to the **SMB Windows Permission model**, which introduces two new RBAC roles. To help customers transition from legacy shared key access to identity-based access for Azure File Shares, delivering a Windows administrator-level experience. It leverages advanced privileges (SeBackupPrivilege, SeRestorePrivilege, SeTakeOwnershipPrivilege) to match the flexibility and security of traditional storage account keys, but with modern RBAC and identity controls.

# Feature Overview 

Key Features:

| **Role Name**  | **Description** | **RBAC Actions** |
|--------------------------------------|-----------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Storage File Data SMB Take Ownership** | Allows end user to assume ownership of a file or directory             | <ul><li>``Microsoft.Storage/storageAccounts/fileServices/takeOwnership/action`</li>                                                                                                                       |
| **Storage File Data SMB Admin**          | Allows admin access equivalent to storage account key for end users over SMB | <ul><li>`Microsoft.Storage/storageAccounts/fileServices/fileshares/files/read`</li><li>`Microsoft.Storage/storageAccounts/fileServices/fileshares/files/write`</li><li>`Microsoft.Storage/storageAccounts/fileServices/fileshares/files/delete`</li><li>`Microsoft.Storage/storageAccounts/fileServices/fileshares/files/modifypermissions/action`</li><li>`Microsoft.Storage/storageAccounts/fileServices/readFileBackupSemantics/action`</li><li>`Microsoft.Storage/storageAccounts/fileServices/writeFileBackupSemantics/action`</li><li>`Microsoft.Storage/storageAccounts/fileServices/takeOwnership/action`</li></ul> |

## High Level Design 

Certainly! Heres your high-level design information formatted in Markdown for the CSS wiki, including tables where appropriate for clarity and quick reference.

***

# High Level Design: Privilege-Based Access for Azure File Shares

## Overview

Customers can use the following Windows privileges for Azure File Shares if the corresponding permissions are included as **data actions in Azure RBAC**:

| Privilege                    | Required RBAC Data Action                                                        |
| ---------------------------- | -------------------------------------------------------------------------------- |
| **SeBackupPrivilege**        | `Microsoft.Storage/storageAccounts/fileServices/readFileBackupSemantics/action`  |
| **SeRestorePrivilege**       | `Microsoft.Storage/storageAccounts/fileServices/writeFileBackupSemantics/action` |
| **SeTakeOwnershipPrivilege** | `Microsoft.Storage/storageAccounts/fileServices/takeOwnership/action`            |

***

## API Usage & Flags

| Privilege   | API Call  |  Required Flag/Parameter  | Notes |
| ---------------------------------------- | -------------- | -------------------------------------------------- | -------------------------------------------------------- |
| SeBackupPrivilege,<br>SeRestorePrivilege | `NtCreateFile` | `CreateOptions: FILE_OPEN_FOR_BACKUP_INTENT`       | Set when opening file handles for backup/restore intent. |
| SeBackupPrivilege,<br>SeRestorePrivilege | `CreateFile`   | `dwFlagsAndAttributes: FILE_FLAG_BACKUP_SEMANTICS` | Equivalent flag for CreateFile API.                      |
| SeTakeOwnershipPrivilege                 | `NtCreateFile` | `DesiredAccess: WRITE_OWNER`                       | Enables ownership changes.                               |
| SeTakeOwnershipPrivilege                 | `CreateFile`   | `dwDesiredAccess: WRITE_OWNER`                     | Enables ownership changes.                               |


**Note:** The client application must have SeBackupPrivilege and SeRestorePrivilege enabled in the security token attached to the process that mounts the file share, so the flag is sent to the Azure File Share SMB service.



## Privilege Enforcement Flow

### XSmbServer

*   **RBAC is checked during TreeConnect.**
*   If any of the required data actions are assigned, a security token flag is set on the TreeConnect context.
*   When the client opens a handle, the relevant flags (`FILE_OPEN_FOR_BACKUP_INTENT`, `WRITE_OWNER`) are checked.
*   The handle records a set of security token flags for the enabled privileges.
*   The security token and flags are sent to XTableServer for access check.

### XTableServer

*   Checks the security token flags passed from XSmbServer.
*   Grants corresponding access rights before performing access check on the security token.

***

## Privilege Details & Granted Access Rights

### SeBackupPrivilege

Grants **read access** to any file, regardless of ACL. Other access requests are still evaluated with the ACL.

| Access Rights Granted    |
| ------------------------ |
| READ\_CONTROL            |
| ACCESS\_SYSTEM\_SECURITY |
| FILE\_GENERIC\_READ      |
| FILE\_TRAVERSE           |

***

### SeRestorePrivilege

Grants **write access** to any file, regardless of ACL. Other access requests are still evaluated with the ACL.

| Access Rights Granted    |
| ------------------------ |
| WRITE\_DAC               |
| WRITE\_OWNER             |
| ACCESS\_SYSTEM\_SECURITY |
| FILE\_GENERIC\_WRITE     |
| FILE\_ADD\_FILE          |
| FILE\_ADD\_SUBDIRECTORY  |
| DELETE                   |
| FILE\_DELETE\_CHILD      |

***

### SeTakeOwnershipPrivilege

Allows the owner of a file to be set to the identity represented by the provided security token.  
A customer with this privilege can take ownership of any file and reconfigure the ACL.

***

#### Summary Table

| Privilege  | Purpose   | Key Access Rights Granted  |
| ------------------------ | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| SeBackupPrivilege        | Read any file, bypassing ACL       | READ\_CONTROL, ACCESS\_SYSTEM\_SECURITY,<br>FILE\_GENERIC\_READ, FILE\_TRAVERSE                                                                    |
| SeRestorePrivilege       | Write to any file, bypassing ACL   | WRITE\_DAC, WRITE\_OWNER, ACCESS\_SYSTEM\_SECURITY,<br>FILE\_GENERIC\_WRITE, FILE\_ADD\_FILE, FILE\_ADD\_SUBDIRECTORY, DELETE, FILE\_DELETE\_CHILD |
| SeTakeOwnershipPrivilege | Take ownership and reconfigure ACL | WRITE\_OWNER                                                                                                                                       |

***

### Client Application Requirements 

***

**Key Takeaways**

*   These privileges are enforced via RBAC data actions and security token flags.
*   Proper flag setting in API calls is required for privilege recognition.
*   Ownership changes and ACL reconfiguration are possible with SeTakeOwnershipPrivilege.

***

# How it works

1. Privilege Assignment: Support engineers ensure customers have the correct RBAC data actions.
2. Mounting & Access: Customers mount file shares using identity-based authentication (AD, AADDS, AADKerberos).
3. Privilege Enforcement: When accessing files, the system checks for privilege flags and grants access accordigly.
4. Ownership Changes: Users with takeOwnership can set themselves as file owners and update ACLs.

***

## Best Practices for troubleshooting

- Educate Customers: Explain the benefits of identity-based access and how privileges work.
- Validate RBAC: Confirm correct privilege assignment in troubleshooting scenarios.

    **Note:** If configuring ACLs for share with a large number of files recursively via either Windows Explorer or icals and ran into issues or if you are simply getting the error: Failed to enumerate objects in the container. Access is denied. Recommends customer to use [RestSetAcls](https://github.com/Azure-Samples/azure-files-samples/tree/master/RestSetAcls) instead.

- Use Test Tools: Employ Robocopy and takeown for privilege validation and ACL management.
- Monitor Rollout: Track staged rollout phases and log privilege usage for sustainability.

# Escalation 

- Use existing templates for challenges related to Azure Files Identity with SAP path **Azure\Files Storage\Security\Authentication and Authorization**

# Training 

- [Feature Onboarding - CSS Deep Dive | SMB Windows Permission Model for Azure Files-20251103_113319-Meeting Recording](https://microsoft.sharepoint.com/:v:/t/VMHub/IQDurxOHRNbLT5bnkXWtZBOuASvpFA7mYIjwkMYpCoGbjnA?e=J6kHrb&nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJTdHJlYW1XZWJBcHAiLCJyZWZlcnJhbFZpZXciOiJTaGFyZURpYWxvZy1MaW5rIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXcifX0%3D)


# Other Resources

- [Privilege Constants (Authorization)](https://learn.microsoft.com/en-us/windows/win32/secauthz/privilege-constants)
- [robocopy](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/robocopy)
- [takeown](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/takeown)


::: template /.templates/Processes/Knowledge-Management/Azure-Files-All-Topics-Feedback-Template.md
:::
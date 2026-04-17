---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files Identity/TSGs/SMB Windows Permission Model/SMB Widows Permission Model TSG_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Files%20Identity%2FTSGs%2FSMB%20Windows%20Permission%20Model%2FSMB%20Widows%20Permission%20Model%20TSG_Storage"
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


# TSG Overview: SMB Admin Support for Azure Storage

## **Purpose**

Enable support engineers to troubleshoot and guide customers transitioning from shared key access to identity-based access for Azure File Shares, focusing on administrator-level privileges and RBAC integration.


### **Key Concepts**

- **Administrator Privileges Supported:**
   -   **SeBackupPrivilege**: Grants read access regardless of ACL.
   -   **SeRestorePrivilege**: Grants write access regardless of ACL.
   -   **SeTakeOwnershipPrivilege**: Allows taking ownership and reconfiguring ACLs.

-   **RBAC Data Actions Required:**
   - `readFileBackupSemantics`
   - `writeFileBackupSemantics`
   - `takeOwnership`

- **Windows API Flags:**
   - For backup/restore: `FILE_OPEN_FOR_BACKUP_INTENT` (NtCreateFile), `FILE_FLAG_BACKUP_SEMANTICS` (CreateFile)
   - For ownership: `WRITE_OWNER`

##  Troubleshooting Workflow


flowchart TD
    A[Start: Customer Issue Reported] --> B[Gather Details & Authentication Method]
    B --> C[Verify RBAC Privileges]
    C --> D[Attempt Access & Collect Errors]
    D --> E[Review ACLs & Ownership]
    E --> F{Access Successful?}
    F -- Yes --> G[Resolve & Document]
    F -- No --> H[Manual Privilege Enforcement Test]
    H --> I{Privileges Correct?}
    I -- No --> J[Correct Privileges & Retest]
    I -- Yes --> K[Escalate to Engineering]
    K --> L[Document Findings & Open Ticket]
    L --> M[Track Progress & Update KB]
    G --> M


## **Quick Checklist for CSS Engineers**

- [ ] Validate RBAC assignments and privilege flags.
- [ ] Use test matrix to confirm access decisions.
- [ ] Run robocopy and takeown tests for privilege validation.
- [ ] Monitor logs for privilege and access events.
- [ ] Escalate issues with privilege escalation or ACL conflicts.
***

## **Troubleshooting Steps**


### Summary Flow

1.  **Gather info**  2. **Validate privileges**  3. **Reproduce & collect errors**  4. **Review ACLs/ownership**  5. **Test enforcement**  6. **Check for common issues**  7. **Use tools to confirm**  8. **Execute & resolve**

## **SMB Admin Support Troubleshooting Flow (VMPOD Team)**

### **Step 1: Initial Assessment**

- **Gather Details**
    - Confirm the customers authentication method (AD, AADDS, or AADKerberos).
    - Identify the file share and what the customer is trying to do (read, write, take ownership).
    - Check if the user is assigned the necessary RBAC data actions:
        - `readFileBackupSemantics`
        - `writeFileBackupSemantics`
        - `takeOwnership`


### **Step 2: Privilege Validation**

- Use Azure Portal or PowerShell to confirm the users RBAC assignments. [Pro Tip: See wiki titled **How to Assign New RBAC Roles for SMB Admin Privileges in Azure Files**]
- Make sure the users security token includes the required privilege flags. [See section below | **Advanced Privilege Validation checks**]
- During file operations, check that the correct flags are set and privileges are reflected in the security token.[See section below | **Advanced Privilege Validation checks** ]

<details close> 
<summary><span style="color:purple">Advance: Privilege Validation checks</span></summary>
<br>

*Note that these validations may require assistance from engineering. If you are not confident performing these steps, clearly document the troubleshooting you have completed in your ICM submission.*

## Operational Validation (Runtime Privilege Flags)

> The following steps show how a support engineer validates that the **required privilege flags are present in the users security token** and that **SMB file operations reflect those flags**. Where possible we reference Microsoft Learn guidance for RBAC verification and troubleshooting Azure Files identity-based access.

### 1) Make sure the users security token includes the required privilege flags

**Goal:** Confirm the server recognized the users RBAC role(s) and set the expected SMB privilege flags on the security token at connect/open time.

**A) Share-level RBAC sanity check (PowerShell)**

*   Use the Azure Files troubleshooting script checks to confirm the user has the needed **share-level** RBAC (prereq for token flags):
    ```powershell
    # AzFilesHybrid module recommended for identity-based auth troubleshooting
    # Example targeted check for share-level RBAC (see MS Learn troubleshooting guidance)
    # Run on a domain-joined Windows machine with AzFilesHybrid installed:
    Import-Module AzFilesHybrid
    # Filter to RBAC-related checks (example from MS Learn page)
    Debug-AzStorageSyncConfiguration -Filter "CheckUserRbacAssignment,CheckDefaultSharePermission"
    ```
    *If your environment uses a different helper, run the equivalent RBAC checks described in the Azure Files identity-based auth troubleshooting doc.*

**B) Server-side XDS logging review (when available in your environment)**

*   **TreeConnect / Session**: Look for RBAC grants and privilege capability bits. Typical log lines (from engineering TSG) show whether RBAC granted backup/restore semantics and take ownership:
    ```text
    info: XSmbServer.exe: [RBAC] Access granted for Data Action permission Microsoft.Storage/storageAccounts/fileServices/readFileBackupSemantics/action ...
    info: XSmbServer.exe: [RBAC] Access granted for Data Action permission Microsoft.Storage/storageAccounts/fileServices/writeFileBackupSemantics/action ...
    info: XSmbServer.exe: [Kerberos] ... hasDataActionTakeOwnership=1 hasDataActionReadFileBackupSemantics=1 hasDataActionWriteFileBackupSemantics=1 ...
    ```
*   **What this proves:** The users security context at the share has the **SMB Admin** privileges (backup/restore) and/or **Take Ownership** enabled by RBAC.

> **Note:** XDS paths and collection procedures are environment-specific; follow your teams standard collect XDS workflow. If XDS isnt available, proceed with the **functional tests** below.

**C) Functional privilege probes from the client (no keys)**

*   Mount the share using the users **identity** (no storage key). Attempt **read in backup mode** against a path where ACL would normally deny read:
    ```powershell
    # Backup-mode read (uses backup semantics)
    robocopy \\<storageaccount>.file.core.windows.net\<share>\DeniedFolder C:\Temp /E /B /R:0 /W:0 /NFL /NDL
    ```
    *   Success here indicates the **readFileBackupSemantics** privilege (part of **SMB Admin**) is in effect.
*   Attempt **take ownership** on a file the user doesnt own:
    ```powershell
    # Requires "Storage File Data SMB Take Ownership" (or SMB Admin, which includes it)
    icacls "\\<storageaccount>.file.core.windows.net\<share>\path\file.txt" /setowner "<DOMAIN>\<UserName>"
    ```
    *   Success indicates **takeOwnership/action** is in effect.

> These client-side probes dont print the flags, but they validate the **effective privileges** governed by the RBAC role.

*References:*

*   Microsoft LearnAzure RBAC assignment/validation (Portal/PowerShell/CLI)
*   Microsoft LearnAzure Files identity-based access troubleshooting checklist (share-level RBAC checks)

***

### 2) During the file operations, check that the correct flags are set and privileges are reflected in the security token

**Goal:** Confirm that **on open (SMB create)** the server set privilege flags matching the new roles and that subsequent operations (read/write/take ownership/modify permissions) align with those flags.

**A) XDS log validation at SmbCreate (when available)**

*   On **XSmbServer** and **XTableServer**, inspect SmbCreate handling:
    ```text
    # XSmbServer: Token flags inferred from RBAC and client intent
    info: XSmbServer.exe: HandleSecurityTokenFlags=0xc ShareSecurityTokenFlags=0xe DesiredAccess=0x100081 MaximalAccess=0x11f01ff CreateOptions=0x4003

    # XTableServer: Flags evaluated for data-plane decisions
    info: XTableServer.exe: Token provided Flags=0xE CreateDisposition=0x1 DesiredAccess=0x80080 Acl=...
    ```
    *   **Flag hints** (from TSG enum):
        *   `SmbTokenFlag_ReadFileBackupSemantics`
        *   `SmbTokenFlag_WriteFileBackupSemantics`
        *   `SmbTokenFlag_TakeOwnership`
    *   Presence of these bits during **SmbCreate** indicates the server recognized the **SMB Admin** and/or **Take Ownership** role at operation time.

**B) Operation-to-privilege correlation (functional checks)**

*   **Backup semantics read/write (SMB Admin)**  
    Use `robocopy /B` (backup mode) for read and a test write to a location where normal ACL would deny:
    ```powershell
    # Read via backup semantics
    robocopy \\<storageaccount>.file.core.windows.net\<share>\DeniedFolder C:\Temp /E /B /R:0 /W:0

    # Write a test file where write is normally denied; use a tool that sets backup intent if applicable
    echo "test" | Out-File "\\<storageaccount>.file.core.windows.net\<share>\DeniedFolder\backup_semantics_write.txt" -Encoding ascii
    ```
    *   Success demonstrates **readFileBackupSemantics** and **writeFileBackupSemantics** are honored over SMB (via **SMB Admin** role).

*   **Take ownership (SMB Take Ownership or SMB Admin)**
    ```powershell
    icacls "\\<storageaccount>.file.core.windows.net\<share>\path\file.txt" /setowner "<DOMAIN>\<UserName>"
    ```
    *   Success demonstrates **takeOwnership/action** is honored.

*   **Modify permissions (SMB Admin)**
    ```powershell
    icacls "\\<storageaccount>.file.core.windows.net\<share>\path\file.txt" /grant "<DOMAIN>\<UserName>:(F)"
    ```
    *   Success indicates **files/modifypermissions/action** capability available via **SMB Admin**.

**C) Azure CLI equivalents for assignment re-checks before/after operations**

```bash
# Confirm the user still holds the expected roles at the storage account scope
az role assignment list \
  --assignee <objectId> \
  --scope "/subscriptions/<subscriptionId>/resourceGroups/<rgName>/providers/Microsoft.Storage/storageAccounts/<storageAccountName>" \
  --output table
```

**D) Troubleshooting pointers (from MS Learn checklist)**

*   If functional checks fail:
    *   Re-run **share-level RBAC** checks and default share permission checks from the Azure Files troubleshooting guidance.
    *   Verify the **role definition** truly contains the SMB data actions:
        ```bash
        az role definition list --name "Storage File Data SMB Admin" --query "[].dataActions"
        az role definition list --name "Storage File Data SMB Take Ownership" --query "[].dataActions"
        ```
    *   Confirm the client reconnects after assignment (Kerberos ticket/SMB session may cache state). Remount the share or log off/on.

</details>
<br>

### **Step 3: Access Attempt & Error Collection**

- Try to reproduce the issue using the same method as the customer (e.g., Robocopy, Windows Explorer).
- Collect any error messages (such as Access Denied or Insufficient Privilege).


### **Step 4: ACL & Ownership Review**

- Review the file or directory ACLs for restrictive entries.
- If access is denied, verify whether assigned privileges should override the ACLs.
- If the issue involves ownership, confirm the user has the `takeOwnership` privilege.


**Note:** If configuring ACLs for share with a large number of files recursively via either Windows Explorer or icals and ran into issues or if you are simply getting the error: Failed to enumerate objects in the container. Access is denied. Recommends customer to use [RestSetAcls](https://github.com/Azure-Samples/azure-files-samples/tree/master/RestSetAcls) instead.
  

### **Step 5: Privilege Enforcement Testing**

- Use test accounts with and without privileges to validate enforcement.
- Attempt file operations with backup/restore flags via Windows APIs.
- Use the provided test matrix to validate access decisions based on privilege and ACL configuration (e.g., with SeBackupPrivilege, read access should be allowed even if ACL denies it).


### **Step 6: Common Issues & Checks**

- **Overly Permissive Access:** Make sure RBAC roles are not too broad (avoid granting `*` dataActions unless necessary).
- **ACL Conflicts:** After privilege rollout, verify users do not gain unintended access due to privilege escalation.


### **Step 7: Testing Tools**

- **Robocopy:** Use `/b /copyall /mir` flags to test backup/restore and ownership operations.
- **Windows Explorer:** Test ACL configuration and privilege-based access.
- **takeown:** Run `takeown /f <target directory> /r` to validate ownership changes.


### **Step 8: Setup & Execution**

- Grant necessary RBAC privileges.
- Mount the file share with identity-based authentication.
- Run Robocopy and takeown commands as needed to validate backup/restore and ownership scenarios.


**Pro Tip:**  *If you get stuck or privileges seem correct but access is still denied, document your findings and escalate to engineering with all relevant details.*


#### **Metrics & Logging**

  - Monitor TreeConnect events for granted privileges.
  - Use XDS and XSMBPerfMetric logs to track access checks and privilege grants.

###+Additional Tips for troubleshooting 

1. Always validate RBAC assignments before escalating.
2. Use test accounts to isolate privilege enforcement issues.
3. Document every step for efficient escalation and knowledge sharing.

### Advanced - Query Storage Verbose Logs (ASC) 

**<span style="color:purple">Pro Tip: Support engineers in CSS cannot access XDS directly, so use ASC's XDS search to retrieve detailed logs for analysis. See the Query Storage Verbose Logs video link and expand the SMB Admin Privileges section below.</span>**


- [Query Storage Verbose Logs_Storage](https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/690091)
- [ CSS Deep Dive Troubleshooting - See this video for help with verbose logs.)](https://microsoft.sharepoint.com/:v:/t/VMHub/IQDurxOHRNbLT5bnkXWtZBOuASvpFA7mYIjwkMYpCoGbjnA?e=ztgPOZ&nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJTdHJlYW1XZWJBcHAiLCJyZWZlcnJhbFZpZXciOiJTaGFyZURpYWxvZy1MaW5rIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXcifSwicGxheWJhY2tPcHRpb25zIjp7InN0YXJ0VGltZUluU2Vjb25kcyI6MjE5OC4xNH19)

<details close> 
<summary>Advanced: SMB Admin Privileges</summary>
<br>

## Summary

To support customers transitioning from shared key access to identity-based access for improved security, Windows administrator-level access control must provide experiences comparable to storage account key capabilities. Unlike non-administrator access, administrator access on Windows can perform operations on a file that may be denied in the files security descriptor due to special privileges:

*   **SeBackupPrivilege**
*   **SeRestorePrivilege**
*   **SeTakeOwnershipPrivilege**

***

## Privilege Details

### SeBackupPrivilege

*   Grants all read access to any file, regardless of the ACL.
*   Other access requests (not read) are still evaluated with the ACL.
*   **Access rights granted:**
    *   `READ_CONTROL`
    *   `ACCESS_SYSTEM_SECURITY`
    *   `FILE_GENERIC_READ`
    *   `FILE_TRAVERSE`

### SeRestorePrivilege

*   Grants all write access to any file, regardless of the ACL.
*   Other access requests (not write) are still evaluated with the ACL.
*   **Access rights granted:**
    *   `WRITE_DAC`
    *   `WRITE_OWNER`
    *   `ACCESS_SYSTEM_SECURITY`
    *   `FILE_GENERIC_WRITE`
    *   `FILE_ADD_FILE`
    *   `FILE_ADD_SUBDIRECTORY`
    *   `DELETE`
    *   `FILE_DELETE_CHILD`

### SeTakeOwnershipPrivilege

*   Allows the owner of a file to be set to the identity represented by the provided security token.
*   Enables taking ownership of any file and reconfiguring its ACL.

***

## RBAC Configuration Requirements

To use these privileges, configure RBAC policies with required actions for user identities:

| Privilege                | Required RBAC Action                                                             |
| ------------------------ | -------------------------------------------------------------------------------- |
| SeBackupPrivilege        | `Microsoft.Storage/storageAccounts/fileServices/readFileBackupSemantics/action`  |
| SeRestorePrivilege       | `Microsoft.Storage/storageAccounts/fileServices/writeFileBackupSemantics/action` |
| SeTakeOwnershipPrivilege | `Microsoft.Storage/storageAccounts/fileServices/takeOwnership/action`            |

***

## Client Application Requirements

*   For **SeBackupPrivilege** and **SeRestorePrivilege**:
    *   Set `FILE_OPEN_FOR_BACKUP_INTENT` in the `CreateOptions` parameter when calling `NtCreateFile`.
    *   If using `CreateFile`, set `FILE_FLAG_BACKUP_SEMANTICS` in `dwFlagsAndAttributes`.
    *   The client must have the privileges enabled in the security token attached to the process mounting the file share.
    *   To check, use WinDbg debugger and command `!token`.

*   For **SeTakeOwnershipPrivilege**:
    *   Include `WRITE_OWNER` in the `DesiredAccess` parameter for `NtCreateFile` or `dwDesiredAccess` for `CreateFile`.

***

## DC Configuration

Privileges are enabled in `XSmbServer` under `DC XSmbRbacDataActionMode` if the DC value contains flags `READWRITEFILEBACKUPSEMANTICS` and `TAKEOWNERSHIP`.

```c
enum RBAC_DATA_ACTION_MODE {
    RWD = 1,
    MODIFY = 2,
    BYPASSPERMISSION = 4,
    TAKEOWNERSHIP = 8,
    RUNASBUILTINFILEADMINISTRATOR = 16,
    READWRITEFILEBACKUPSEMANTICS = 32
};
```

***

## XDS Log for TreeConnect

*   XDS logs show RBAC configuration.
*   Example log lines indicate backup and restore privileges granted via RBAC, while takeownership is not.

<!---->

    info: XSmbServer.exe: [RBAC] Access granted for Data Action permission Microsoft.Storage/storageAccounts/fileServices/readFileBackupSemantics/action with role assignment Id '9bb947b2-6a25-4167-ad57-bad92fe6f688', reason GrantedByRBAC.
    info: XSmbServer.exe: [RBAC] Access granted for Data Action permission Microsoft.Storage/storageAccounts/fileServices/writeFileBackupSemantics/action with role assignment Id '9bb947b2-6a25-4167-ad57-bad92fe6f688', reason GrantedByRBAC.
    info: XSmbServer.exe: [Kerberos] RefreshKerberosMaximalAccess: Account=grpcldsidsa8\u000101DBB961014D2119 Container=share1, ... hasDataActionTakeOwnership=0 hasDataActionReadFileBackupSemantics=1 hasDataActionWriteFileBackupSemantics=1 ...

***

## XDS Log for SmbCreate on XSmbServer

*   When RBAC is configured and the client uses the privileges, XSmbServer sets flags for the security token in the SmbCreate request.

```c
enum SmbTokenFlags : UINT64 {
    SmbTokenFlag_None = 0x0,
    SmbTokenFlag_BypassPermissions = 0x1,
    SmbTokenFlag_TakeOwnership = 0x2,
    SmbTokenFlag_ReadFileBackupSemantics = 0x4,
    SmbTokenFlag_WriteFileBackupSemantics = 0x8,
    SmbTokenFlag_AllPrivileges = SmbTokenFlag_TakeOwnership
        | SmbTokenFlag_ReadFileBackupSemantics
        | SmbTokenFlag_WriteFileBackupSemantics,
    SmbTokenFlag_All = SmbTokenFlag_BypassPermissions
        | SmbTokenFlag_AllPrivileges
};
```

*   Example log line:

<!---->

    info: XSmbServer.exe: HandleSecurityTokenFlags=0xc ShareSecurityTokenFlags=0xe DesiredAccess=0x100081 MaximalAccess=0x11f01ff CreateOptions=0x4003

***

## XDS Log for SmbCreate on XTableServer

*   Security token flags are checked to determine applicable privileges.

<!---->

    info: XTableServer.exe: Token provided Flags=0x2 CreateDisposition=0x1 DesiredAccess=0x80080 Acl=0xadac2cb032a1c34d.1 ParentAcl=0x10a2faa478bc03c2.1

***

## Troubleshooting Guidelines

If configuration is incorrect, access denied errors may occur. Troubleshooting steps:

1.  **Check DC XSmbRbacDataActionMode** for required privileges support.
2.  **Check customer RBAC policies** for required actions.
3.  **Check client application** for enabled privileges and flags.
4.  **Check XDS logs** for correct evaluation of RBAC policies and security token flags.

Depending on findings, identify the issue and follow up with with the escalation to XEEE.

</details>
<br>


### **References**

- [Privilege Constants (Winnt.h) - Win32 apps](https://learn.microsoft.com/en-us/windows/win32/secauthz/privilege-constants)
- [Robocopy - Microsoft Learn](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/robocopy)
- [takeown - Microsoft Learn](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/takeown)


## More information


 - [IaaS Storage Escalation](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/869944/IaaS-Storage-Escalation_Storage)


::: template /.templates/Processes/Knowledge-Management/Azure-Files-All-Topics-Feedback-Template.md
:::
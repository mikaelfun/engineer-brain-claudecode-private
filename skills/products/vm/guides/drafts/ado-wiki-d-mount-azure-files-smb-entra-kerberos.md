---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files Identity/How Tos/MS Auth Entra Only Kerberos/How to mount Azure Files SMB Entra Only Kerberos_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Files%20Identity%2FHow%20Tos%2FMS%20Auth%20Entra%20Only%20Kerberos%2FHow%20to%20mount%20Azure%20Files%20SMB%20Entra%20Only%20Kerberos_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Azure-Files-All-Topics
- cw.How-to
- cw.Reviewed-11-2025
---


[[_TOC_]]

# How to mount Azure Files SMB – Entra-Only Kerberos Support

## **Mounting Process for Cloud-Only Identities**

**Purpose:** Provide clear, actionable guidance for mounting, troubleshooting, and debugging Azure Files SMB using **Cloud-Only Identities**.

***

### **Diagram: Mounting Workflow**


::: mermaid

graph TD;

    A[Start] --> B{Identity Type?}
    B -->|Cloud-Only| C[Check RBAC & MS Entra Connect/ MS Entra Connect cloud sync]
    C --> D[Verify SID Authority = 12]
    D --> E[Check Kerberos Tickets]
    E --> F[Mount via PowerShell]
    F --> G{Mount Successful?}
    G -->|Yes| H[Access File Share]

:::

***

### **Prerequisites**

*   **RBAC Configuration:** Assign appropriate roles at the storage account level.
*   **AAD Join:** Ensure the machine is Azure AD-joined.
*   **Identity Validation:**
    ```powershell
    whoami /user
    ```
    Cloud-only identities have **SID authority = 12**.

Here’s a simplified explanation with the quick reference table for **cloud-only identities**:

***

#### **What does SID Authority 12 mean?**
<details close> 
<summary>Expand for details.</summary>
<br>

*   **SID (Security Identifier)** is a unique value used to identify users or groups for permissions.
*   The **Authority** part of the SID tells where the identity comes from:
    *   **Authority 5** = NT Authority (on-prem Active Directory)
    *   **Authority 12** = Azure AD Authority (Microsoft Entra ID)
*   So, **Authority 12** means the identity is **cloud-only**, created and managed in Microsoft Entra ID (not synced from on-prem AD).
</details>
<br>


***

### **Quick Reference Table**

| Identity Type          | SID Prefix | Authority Value | Example SID                                            | Notes                                                |
| ---------------------- | ---------- | --------------- | ------------------------------------------------------ | ---------------------------------------------------- |
| **Cloud-only (Entra)** | `S-1-12`   | 12 (Azure AD)   | `S-1-12-1-3468038844-1095076586-2538345371-2726767761` | Pure cloud identity; used for RBAC and ACLs in Azure |

***

**Key Point:**  
If you see `S-1-12`, it’s a cloud-only identity from Microsoft Entra ID. These SIDs are critical for permissions in Azure services like Azure Files, AVD, and RBAC.


***


## Required Roles for Mounting Azure Files SMB (Cloud-Only Kerberos)

To enable mounting with cloud-only identities, you must assign **RBAC roles** at the storage account level. The most relevant roles are:

*   **Storage File Data SMB Share Contributor**
    *   Grants permission to mount and access SMB shares.
    *   Allows read/write/delete operations on files and folders.

*   **Storage File Data SMB Share Elevated Contributor**
    *   Grants all the above, plus permission to change share-level permissions.

*   **Storage File Data SMB Share Reader**
    *   Grants permission to mount and read files/folders, but not write/delete.

*   **Storage File Data SMB Admin**
    *  Allows for admin access equivalent to storage account key for end users over SMB.

* <u>For information about required RBAC roles see:</u> [Azure RBAC roles for Azure Files](https://learn.microsoft.com/en-us/azure/storage/files/storage-files-identity-assign-share-level-permissions?tabs=azure-portal#azure-rbac-roles-for-azure-files)

**Assignment Steps (PowerShell Example):**

```powershell
# Assign SMB Share Contributor role
New-AzRoleAssignment `
  -ObjectId <UserObjectId> `
  -RoleDefinitionName "Storage File Data SMB Share Contributor" `
  -Scope "/subscriptions/<subId>/resourceGroups/<rgName>/providers/Microsoft.Storage/storageAccounts/<storageAccount>"
```

**Important Notes:**

*   For cloud-only identities, RBAC is currently supported only in canary regions (per FAQ). In most regions, you must use **Default Share Permission** and file-level ACLs.
*   Always ensure the user/machine is Azure AD-joined and the required preview tags are enabled on the storage account.


***

### **Mount Steps**

```powershell
# Mount Azure File Share using Kerberos
net use X: \\<storage_account>.file.core.windows.net\<share_name>
```

### **Verify Kerberos Tickets**

**Kerberos Ticket Verification for AADKERB**

When using **Azure AD Kerberos (AADKERB)** for authentication:

*   The Kerberos ticket **must be issued by `microsoftonline.com`**.
*   This ensures the ticket originates from Microsoft Entra ID and validates the cloud-only identity.
*   If the ticket issuer is not `microsoftonline.com`, the authentication flow is incorrect and needs troubleshooting.

```powershell
klist
```

Ensure **TGT** and **Service Ticket** for the storage account exist.

***

### **Editing Permissions via the Portal Interface**

> :exclamation: IMPORTANT: Open the portal with aka.ms/portal/fileperms

* [Configure Windows ACLs using the Azure portal](https://learn.microsoft.com/en-us/azure/storage/files/storage-files-identity-configure-file-level-permissions#configure-windows-acls-using-the-azure-portal)
* [Windows 365 and Azure Virtual Desktop support external identities, now generally available](https://techcommunity.microsoft.com/blog/windows-itpro-blog/windows-365-and-azure-virtual-desktop-support-external-identities-now-generally-/4468103)


::: template /.templates/Processes/Knowledge-Management/Azure-Files-All-Topics-Feedback-Template.md
:::
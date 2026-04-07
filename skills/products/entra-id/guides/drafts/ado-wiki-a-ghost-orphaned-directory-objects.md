---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/M365 Identity/Directory Sync/GhostOrphanedObjects"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FM365%20Identity%2FDirectory%20Sync%2FGhostOrphanedObjects"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Ghost / Orphaned Directory Objects in Microsoft Entra ID

# Overview

Orphaned (ghost) directory objects are Microsoft Entra ID entities that
appear as **synced from on-premises Active Directory**, even though the
corresponding on-prem object **no longer exists**. These objects are
**corrupt, unrepairable replicas** left in the cloud due to
synchronization inconsistencies, filtering mismatches in entra connect
sync, connector space issues, server rebuilds, or domain controller
replication delays.

Ghost/orphaned objects may include:

- Users
- DL /security groups
- Contacts
- Mail users

These objects cause blocking issues across Azure AD, Exchange Online,
SharePoint Online, Teams, and hybrid identity scenarios.

## Symptoms

Admins commonly report:

- Object shows as **"Sync: Yes"** in Entra ID but does **not exist** in
  on-prem AD.
  - Objects deleted in local ad, or removed from the sync scope still
    appear in cloud
  - Duplicate groups/users/contacts visible only in cloud.
- Attempts to modify attributes (proxyAddresses, UPN, group
  membership,etc) **fail**.
- Provisioning errors (duplicate attributes, immutableId mismatches).
- Exchange Online mailbox provisioning blocked due to old duplicate
  identity.

## How to Confirm an Object is Orphaned

The **ONLY reliable validation** is performed on the Entra Connect Sync
server.

### Step-by-step:

1.  Open **Synchronization Service Manager**.
2.  Go to **Connectors**.
3.  Select the **Azure AD connector**.
4.  Choose **Search Connector Space**.
5.  Under **Scope**, select **Pending Import**.
6.  Tick **Add**.
7.  Search for the problematic object on the generated list.

### Interpretation:

- **If the object appears under Pending Import with no matching on-prem
  object - it IS orphaned.**
- **If it does NOT appear - The cloud object has a valid on-prem
  counterpart and has not been properly identified by the admin.**

Optional confirmation:

- Check **LastDirSyncTime** in the cloud (years old - likely orphaned).

## Confirmed Service Impact Scenarios

Ghost/orphaned objects have been observed causing the following issues:

- **Blocking provisioning of new objects** with the same mail attribute
  or UPN - the ghost object still holds the value, preventing creation of
  new identities.
- **Tenant object quota exhaustion** - tens of thousands of
  orphaned objects accumulated and pushed the tenant toward its
  directory object quota, completely blocking provisioning of new
  objects.
- **Incorrect security access** - orphaned security groups may continue
  granting access to users who should no longer have it.
- **Mailflow disruption** - mailenabled users or contacts retain
  addresses currently needed for other purposes, causing delivery
  failures or routing anomalies.
- **Licensing waste** - orphaned user objects will still consume paid
  licenses if still assigned.

## Customer Administrative Decision

The decision on how to proceed rests solely with the customer's
administrator. They may choose to:

- Retain the object temporarily to perform data extraction or back up
  relevant information, or
- Remove the corrupted object and recreate a new, healthy identity from
  scratch.
- Once the administrator confirms that the object is no longer needed,
  or that all required data has been backed up, deletion is recommended.

## Removal Procedure (Graph Explorer)

### Prerequisites

- Sign in at https://aka.ms/ge with an admin account holding minimum permissions
- Consent to required scopes (admin consent required)
- Expected results: 204 No Content on successful deletions
- If 403 Forbidden: Open "Modify permissions" tab, consent needed permissions

### Delete a User

Find the user's id:
```
GET https://graph.microsoft.com/v1.0/users?$filter=userPrincipalName eq 'user@contoso.com'&$select=id,displayName,userPrincipalName
```

Soft delete:
```
DELETE https://graph.microsoft.com/v1.0/users/{id}
```

Hard delete (permanent):
```
DELETE https://graph.microsoft.com/v1.0/directory/deletedItems/{id}
```

### Delete a Group (DL/Security)

Find the group's id:
```
GET https://graph.microsoft.com/v1.0/groups?$filter=displayName eq 'Group Display Name'&$select=id,displayName
```

Soft delete:
```
DELETE https://graph.microsoft.com/v1.0/groups/{id}
```

Hard delete:
```
DELETE https://graph.microsoft.com/v1.0/directory/deletedItems/{id}
```

### Delete an Organizational Contact

Find the contact's id:
```
GET https://graph.microsoft.com/v1.0/contacts?$filter=mail eq 'contact@contoso.com'&$select=id,displayName,mail
```

Soft delete:
```
DELETE https://graph.microsoft.com/v1.0/contacts/{id}
```

Hard delete:
```
DELETE https://graph.microsoft.com/v1.0/directory/deletedItems/{id}
```

Note: Use /contacts (directory), NOT /users/{id}/contacts (mailbox personal contacts).

### Verify Deletion / Audit

```
GET https://graph.microsoft.com/v1.0/directory/deletedItems/{id}
```
Expect 404 Not Found after hard delete.

## DO NOT DO

- Deleting **connector space**
- Disabling synchronization on tenant to "force refresh"
- Editing/manipulating ImmutableId in entra
- Forcing/expecting soft/hard matching to reconnect orphaned objects

## Prevention

- **Maintain consistent OU filtering** - ensure synchronization scope remains stable
- **Replicate ADConnect filtering exactly when rebuilding servers** - duplicate previous server's sync rules and OU selections
- **Use Staging Mode for upgrades or server transitions** - leverage Staging Mode to validate configuration before switching to production

## Root Causes

1.  **Deletion on different domain controllers combined with replication delays** -
    Object deleted on DC1 but Azure AD Connect queries DC2 before deletion replicated.
    Multiple Azure AD Connect servers running simultaneously increases risk.

2.  **Deployment of a new AD Connect server with different OU filtering** -
    New server excludes an OU that was previously synchronized, leaving orphaned objects.

3.  **Legacy synchronization engines or historical filtering changes** -
    Prior engines (DirSync, Azure AD Sync) or earlier filtering configurations
    created objects the current Azure AD Connect cannot map.

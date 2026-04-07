---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Entra ID App Management/Application_and_Service_Principal_Object_Management/How to/Azure AD Soft Deleted Service Principals"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FEntra%20ID%20App%20Management%2FApplication_and_Service_Principal_Object_Management%2FHow%20to%2FAzure%20AD%20Soft%20Deleted%20Service%20Principals"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Azure AD Soft Deleted Service Principals

**IMPORTANT NOTICE**: On March 1, 2023 the Azure AD Directory Platform team began the phased soft-deletion of First-Party service principals to free up storage and improve the backend infrastructure resiliency. Applications targeted for soft-deletion will be ignored if the customer has modified the application in any way. This rollout will not occur on tenants with more than 100 users or 500 apps, or on Top ISV, S500, S2500, and GTP tenants.

## Summary

Microsoft Graph API now supports recovering of accidentally deleted service principal and application objects. Deleting a service principal places it in a soft deleted state for 30 days, after which it will be permanently hard deleted.

The following delete operations result in service principals being soft-deleted:
- App registration deletion from the Entra ID app registrations portal
- Deleting an application from the Enterprise apps portal
- Calling DELETE for a service principal method using Microsoft Graph API
- Using the Remove-MgServicePrincipal Microsoft Graph PowerShell cmdlet

## Limitations

- Managed Identities do not support soft deletion.

## Soft-Deletion of Unused Auto Provisioned Service Principals for 1st Party Apps

On March 1, 2023, the Directory Platform team began phased soft deletion of some categories of First Party service principals:

- **Category 1**: SPs for apps with no ESTS traffic based on a 30-day time window
- **Category 2**: Apps with only app+user traffic - ESTS would issue tokens even if the SP is not present

SPs will NOT be deleted if:
- The customer has modified the SP or if there are links to the SP (owners, policy etc.)
- Tenants with more than 100 users or 500 apps, or S500 tenants

No audit events are generated for these programmatic deletions.

**ICM**: Owning Service = AAD Distributed Directory Services, Team = Storage

## Known Issues

### Issue 1: API GA Before Portal Updates
The List/Get/Delete/Restore deleted servicePrincipals APIs went directly to GA. The App registration portal recovery experience and Enterprise apps Deleted Applications blade came later.

### Issue 2: servicePrincipalNames Conflict
Restoring a soft deleted SP that has URLs in servicePrincipalNames matching an active SP will fail with HTTP 409.

### Issue 2b: App identifierURIs Conflict
Restore of a soft deleted application fails when another active application has matching AppIdentifierUri.

### Issue 3: Directory Quota blocks non-admins
Non-admin users limited to 250 objects. Soft deleted SPs count against quota. Error: `Directory_QuotaExceeded`.

Check quota:
```powershell
$user = "user@contoso.com"
$createdObjects = ((Get-MgUserCreatedObject -UserId $user) | Select id, @{n="Type";e={$_.AdditionalProperties.'@odata.type'}})
$createdApplicationObjects = $createdObjects | where {$_.Type -eq '#microsoft.graph.application'}
$createdApplicationObjects.count
```

### Issue 4: Cannot Restore Without Backing Application
Error: `Cannot restore ServicePrincipal without backing Application <appid>`. Must restore app registration first.

### Issue 5: Delay in recovering sync provisioning data
Wait up to 40 minutes after SP restore for sync provisioning data recovery.

### Issue 6: Delay in recovering app proxy data
Wait up to 24 hours after app proxy SP restore for app proxy configuration recovery.

## How to List Soft Deleted Service Principals

### Microsoft Graph Explorer
```
GET https://graph.microsoft.com/v1.0/directory/deletedItems/microsoft.graph.servicePrincipal
```

Filtered query:
```
GET https://graph.microsoft.com/v1.0/directory/deletedItems/microsoft.graph.servicePrincipal?$filter=appId eq '<AppId>'&$select=id,appDisplayName,deletedDateTime
```

### PowerShell
```powershell
Get-MgDirectoryDeletedItem -DirectoryObjectId "<ObjectId-of_Service_Principal>"
```

## Restore Process (Correct Order)

1. List soft deleted SPs and identify those with matching appId
2. Find the one with oldest `deletedDateTime`
3. Restore the **application** first:
   ```
   POST https://graph.microsoft.com/v1.0/directory/deletedItems/<AppObjectId>/restore
   ```
   ```powershell
   Update-MgDirectoryDeletedItem -DirectoryObjectId "<ObjectId-of_Application>"
   ```
4. Then restore the **service principal**:
   ```
   POST https://graph.microsoft.com/v1.0/directory/deletedItems/<SPObjectId>/restore
   ```
   ```powershell
   Update-MgDirectoryDeletedItem -DirectoryObjectId "<ObjectId-of_Service_Principal>"
   ```

**IMPORTANT**: Do NOT use "Restore deleted applications" in App Registrations portal until the Deleted Applications blade appears in Enterprise Applications — it creates a new SP instead of restoring the original.

## Permanently Delete

```
DELETE https://graph.microsoft.com/v1.0/directory/deleteditems/<servicePrincipalObjectId>
```
```powershell
Remove-MgDirectoryDeletedItem -DirectoryObjectId "<ObjectId-of_Service_Principal>"
```

## Graph Permissions Required

| Permission | Description |
|-----|-----|
| Application.Read.All | Allows listing recently deleted items |
| Application.ReadWrite.All | Allows listing recently deleted items |
| Directory.Read.All | Allows restoring/permanently deleting recently deleted items |

## ICM Escalation

### Soft deleted apps/SPs bugs
- **Owning Service**: AAD First Party Apps
- **Owning Teams**: AAD Application Model

### Auto-deletion of 1P SPs
- **Owning Service**: AAD Distributed Directory Services
- **Owning Teams**: Storage

---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/ACE Identity TSGs/Identity Technical Wiki/How To: Tenant Deletion"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FACE%20Identity%20TSGs%2FIdentity%20Technical%20Wiki%2FHow%20To%3A%20Tenant%20Deletion"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How To: Tenant Deletion

> **Important:** Refer to the official TSG for full procedures:
> [Tenant Deletion - Instructions for Azure Identity Support Engineers (SE)](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/544788/Tenant-Deletion-Instructions-for-Azure-Identity-Support-Engineers-(SE))

## Customer Self-Service Deletion

Have the customer attempt to delete the tenant themselves:
1. Sign in to https://portal.azure.com with a Global Admin account
2. Remove all subscriptions, users, and content from the tenant
3. Navigate to Azure Active Directory > Manage tenants > select tenant > Delete

### Common Blocker: License-Based Subscriptions

If deletion is blocked by active subscriptions:
1. Sign in to https://admin.microsoft.com with a Global Admin account
   - If personal account (outlook.com/live.com) fails, create a new tenant Global Admin account
2. Go to **Billing > Your products** and Cancel all subscriptions
3. Wait **3 days** for subscriptions to be fully deleted
4. Attempt tenant deletion again

> **Tip:** If still blocked, use a newly created Global Admin (associated only with this tenant) rather than the customer's personal/work account. Remove the personal account first so the new admin is the sole user.

## Deletion on Customer Behalf

If the customer cannot delete the tenant themselves (stuck subscriptions, admin left company, etc.), engage the Azure Identity TAs.

Follow the official TSG: [Tenant Deletion - Instructions for Azure Identity Support Engineers (SE)](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/544788/Tenant-Deletion-Instructions-for-Azure-Identity-Support-Engineers-(SE))

Get written confirmation (via email) from the customer to delete the tenant on their behalf.

### Blocker: License-Based Subscriptions (on behalf)

Open a Collab with the **O365 Licensing team**. If a Rave case is not automatically created, ask customer to create one via:
- https://admin.microsoft.com > Support > New service request > search "How do I remove a license" > Contact support

### Blocker: Microsoft Azure Subscriptions

Open a Collab with the **ASMS team**.

## Potential Issues

### PermissionsElevationRequiredToReadSubscriptions Error

All deletion pre-checks show green but deletion fails with:
```json
{
  "errorCode": "PermissionsElevationRequiredToReadSubscriptions",
  "localizedErrorDetails": {
    "permissionsElevationRequiredToReadSubscriptions": "User is not authorized to read Azure subscriptions. Permission elevation is required to proceed."
  }
}
```
**Resolution:** Global Admin must elevate their access before attempting deletion:
- https://docs.microsoft.com/en-us/azure/role-based-access-control/elevate-access-global-admin#elevate-access-for-a-global-administrator

### Enterprise Applications Still Existing

Deletion is blocked by Enterprise Applications even though the Enterprise Applications page appears empty.

**Resolution:** Use Microsoft Graph PowerShell to remove all service principals:
```powershell
Connect-MgGraph -Scopes "Application.ReadWrite.All"

# List all SPs (remove -WhatIf to actually delete)
Get-MgServicePrincipal | Remove-MgServicePrincipal -WhatIf
```
- Ref: https://learn.microsoft.com/en-us/graph/api/serviceprincipal-delete?view=graph-rest-1.0&tabs=powershell
- Ref: https://learn.microsoft.com/en-us/powershell/module/microsoft.graph.applications/remove-mgserviceprincipal?view=graph-powershell-1.0

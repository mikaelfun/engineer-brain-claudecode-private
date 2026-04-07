---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Group Management/Dynamic Groups/Dynamic group Creation and Deletion"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FGroup%20Management%2FDynamic%20Groups%2FDynamic%20group%20Creation%20and%20Deletion"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Dynamic Group Creation and Deletion TSG

## How to troubleshoot dynamic group creation issues

### Cannot create a dynamic group

**Do not see option to create a dynamic group in Azure portal? Or error in creating via PowerShell?**

1. Ensure tenant has Azure AD P1/P2 Premium license
   - [Azure AD license plans](https://www.microsoft.com/cloud-platform/azure-active-directory-pricing)
2. Ensure the user has appropriate admin permissions:
   - Global Administrator or User Administrator role required
   - Check group creation permissions: All groups > General (Settings)
   - "Users can create security groups in Azure portals" / "Users can create Office 365 groups in Azure portals"

### Cannot find the attribute to create a rule

1. User attributes: check the [list of supported properties](https://docs.microsoft.com/azure/active-directory/active-directory-groups-dynamic-membership-azure-portal#supported-properties)
2. Device attributes: check the [list of device attributes](https://docs.microsoft.com/azure/active-directory/active-directory-groups-dynamic-membership-azure-portal#using-attributes-to-create-rules-for-device-objects)
3. If not in Simple Rule dropdown, use **Advanced Rule** with correct object prefix (e.g., `user.country`, `device.deviceOSType`)
4. [Extension Attributes](https://docs.microsoft.com/azure/active-directory/active-directory-groups-dynamic-membership-azure-portal#extension-attributes-and-custom-attributes) can be used for custom attributes
5. Simple rule builder supports up to 5 expressions; use text box for more

### How to create a dynamic membership rule

1. Ensure correct license (P1 Premium)
2. Ensure attribute is in supported properties list
3. For Advanced Rules, use correct syntax with appropriate object prefix
4. [Guidelines on creating an Advanced Rule](https://docs.microsoft.com/azure/active-directory/active-directory-groups-dynamic-membership-azure-portal#constructing-the-body-of-an-advanced-rule)

## Dynamic groups and 'Contains' or 'Match' operator(s)

**Problem**: Dynamic groups with `contains` or `match` operator are not as performant as other dynamic groups.

**Root Cause**: The `contains` operator is not indexed by Mezzo (internal service for dynamic group processing).

**Recommendation**: Use `startsWith` instead. The `contains` operator has been removed from the dynamic group rule builder UX in Entra Admin Center (but can still be typed directly).

**Impact**: Slow processing affects not just the specific group but other dynamic groups in the tenant.

### Creating dynamic rule for users with Company Licenses

Example using `assignedPlans`:
```
(user.assignedPlans -any ((assignedPlan.service -eq "ATP_ENTERPRISE") -and (assignedPlan.capabilityStatus -eq "Enabled")))
```

**Recommended** (use startsWith):
```
(user.assignedPlans -any ((assignedPlan.service -startswith "ATP_ENTERPRISE") -and (assignedPlan.capabilityStatus -eq "Enabled")))
```

To find service plan names via PowerShell:
```powershell
Connect-MgGraph -Scopes "Directory.Read.All"
$skus = Get-MgSubscribedSku -Property *
$skus.ServicePlans | Sort-Object ServicePlanName | Where-Object { $_.AppliesTo -eq "Company" }
```

## Get max groups allowed error

**Symptom**: Error when creating a Dynamic group in PowerShell.

**Cause**: Reached the max limit of 15,000 dynamic groups per tenant.

**Solution**: Delete existing dynamic groups. There is no way to increase the limit.

## Dynamic Group Deletion

### How to delete a group
1. Use [Remove-MgGroup](https://docs.microsoft.com/azure/active-directory/users-groups-roles/groups-settings-v2-cmdlets#delete-groups)
2. Before deleting, ensure you have [deleted all assigned licenses](https://docs.microsoft.com/azure/active-directory/users-groups-roles/licensing-group-advanced#deleting-a-group-with-an-assigned-license) to avoid errors

### How to restore a deleted group
1. **Office 365 groups**: Can be restored up to 30 days before permanent deletion. [Learn more](https://docs.microsoft.com/azure/active-directory/fundamentals/active-directory-groups-restore-azure-portal)
2. Required roles: Global Admin, User Account Admin, Intune Service Admin, Partner Tier1/Tier2, or group owner
3. **Security groups**: Submit ICM to restore via [this wiki](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/1125274/Recover-membership-of-a-deleted-security-group), then check with PG if the rule can be restored

### Restored a deleted dynamic group but no members

When a dynamic group is deleted and restored, it is treated as a new group and re-populated according to the rule. This process might take up to **24 hours**.

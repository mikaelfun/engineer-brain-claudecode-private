---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD Roles and Administrators/Azure AD Dynamic Assigned Admin Units"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FAzure%20AD%20Roles%20and%20Administrators%2FAzure%20AD%20Dynamic%20Assigned%20Admin%20Units"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Azure AD Dynamic Assigned Administrative Units

## Summary

Dynamic assignment to Administrative Units (AU) reduces administrative overhead by automatically assigning users or devices based on property-based rules. Uses the same engine as dynamic membership rules for groups.

## Requirements

- Azure AD P1 license or higher
- Every administrator scoped to an AU and every member of a dynamic AU needs a P1 license
- Roles: Global Administrator or Privileged Role Administrator

## Supported Clouds

Dynamic AUs available in PROD and USGov at General Availability.

## Limitations

- Cannot be created from M365 Admin center
- Total dynamic groups + dynamic AUs combined cannot exceed 5,000
- Rule syntax limited to 3,072 characters
- Maximum 5 expressions per dynamic rule

## Rule Processing

- Initial update triggers dynamic engine, can take up to 5 minutes depending on tenant size
- Updates to users/devices trigger re-evaluation
- Updates to dynamic rules trigger new evaluation

## Known Issues

### Issue 1: Global Admins Cannot Add/Remove Users to Dynamic AU

By design - only the dynamic membership engine can make changes. Workaround: add OR expression with userPrincipalName Equals for specific user.

### Issue 2: Users/Devices Not Dynamically Added

May occur when dynamic rule was copied from a Restricted AU. Users with `isMemberManagementRestricted=true` cannot be updated by dynamic group service. Check DGrep for `Authorization_RequestDenied`.

### Issue 3: All Members Removed After Converting to Dynamic

By design. Converting from Assigned to Dynamic clears all existing assignments. Export members first via CSV bulk operation.

### Issue 4: 400 Bad Request When Saving Dynamic AU

Occurs when membershipRule is empty. Must create at least one dynamic query expression before saving.

## How To: Convert Membership Type

### Azure Portal
1. Navigate to AU Properties blade
2. Change Membership type from Assigned to Dynamic User/Device
3. Click "Add dynamic query" to create expression
4. Save - warning will appear about clearing existing members

### PowerShell
```powershell
$AU = Get-MgDirectoryAdministrativeUnit -Id "<AU-Id>"
Update-MgDirectoryAdministrativeUnit -AdministrativeUnitId $AU.Id `
  -MembershipType "Dynamic" `
  -MembershipRuleProcessingState "On" `
  -MembershipRule '(user.city -eq "new york")'
```

### Microsoft Graph
```
PATCH https://graph.microsoft.com/beta/administrativeUnits/{AU-Id}
{
  "membershipType": "Dynamic",
  "membershipRuleProcessingState": "On",
  "membershipRule": "(user.city -eq \"new york\")"
}
```

## How To: Add Individual Members to Dynamic AU

Add OR expression: `Or | userPrincipalName | Equals | username@contoso.com`

## Troubleshooting

1. Verify Membership type is set to Dynamic on Properties tab
2. Understand logic of the Membership Rule
3. Examine user/device properties - confirm values match the rule
4. If immediate relief needed, add OR expression with specific userPrincipalName

## ASC: Administrative Units

1. Under ASC Tenant Explorer > Administrative Units > Run
2. Membership Type column shows Dynamic vs N/A (Assigned)
3. Expand individual AU to view Membership Rule

---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD User Management/Azure AD Bulk Actions for Users and Groups"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FAzure%20AD%20User%20Management%2FAzure%20AD%20Bulk%20Actions%20for%20Users%20and%20Groups"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Azure AD Bulk Actions for Users and Groups - TSG

## Overview

Bulk operations in Azure AD administration portal support:
- User account Creation/Deletion
- Bulk Invites for Guests
- Download of Users and Groups
- Bulk Download/Import of Group members using CSV
- Bulk operations tracking blade with failure reasons

## How It Works
Uses Azure AD Graph run against uploaded CSV files in the context of the authenticated administrator.

## Role Requirements

| Action | Required Roles |
|--------|---------------|
| Bulk create users | Global Admin, User Admin |
| Bulk invite users | Global Admin, User Admin, Guest Inviter |
| Bulk delete users | Global Admin, User Admin |
| Bulk import group members | Global Admin, User Admin, Group Owner |
| Download list of users/groups | Any AAD admin role |
| View bulk operation reports | Global Admin, User Admin + Global Reader, Reports Reader, Security Reader/Admin |

## Limitations

1. **Cannot bulk create users AND add to groups simultaneously** - two separate operations required
2. **Group membership bulk ops only for manageable groups**: O365 and Azure AD Security Groups only. NOT available for:
   - Directory synced groups
   - Dynamic groups
   - Exchange mastered groups (Mail enabled security groups, Distribution Lists)
3. **Bulk Delete/Create buttons grayed out** if user lacks correct role OR target groups are unmanageable
4. **Bulk invite CSV does not support custom columns** (Job Title, Phone Number, etc.) - use Graph API/PowerShell for custom properties
5. **All SKUs**: Available in all Azure AD SKUs (no premium license required)

## Troubleshooting

### Buttons are grayed out
1. Verify user has Global Administrator or User Administrator role
2. Check if target group is of supported type (not synced/dynamic/exchange-mastered)

### Bulk operation failures
1. Check Bulk operations blade under Users/Groups for failure reasons
2. Verify CSV format matches the downloaded template exactly
3. Check for data validation errors (duplicate UPNs, invalid domains, etc.)

### CSV formatting issues
- Download the template CSV from the portal first
- Do not add extra columns
- Ensure UTF-8 encoding
- Check for special characters in display names

## Public Documentation
- [Create users](https://docs.microsoft.com/azure/active-directory/users-groups-roles/users-bulk-add)
- [Delete users](https://docs.microsoft.com/azure/active-directory/users-groups-roles/users-bulk-delete)
- [Add group members](https://docs.microsoft.com/azure/active-directory/users-groups-roles/groups-bulk-import-members)
- [Download users](https://docs.microsoft.com/azure/active-directory/users-groups-roles/users-bulk-download)

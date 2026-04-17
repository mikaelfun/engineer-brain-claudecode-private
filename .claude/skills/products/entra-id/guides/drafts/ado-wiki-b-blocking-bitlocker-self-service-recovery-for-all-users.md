---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD.wiki:/Authentication/Device Registration/Window Devices/Microsoft Entra Join/Blocking Bitlocker self-service recovery for all users"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/Device%20Registration/Window%20Devices/Microsoft%20Entra%20Join/Blocking%20Bitlocker%20self-service%20recovery%20for%20all%20users"
importDate: "2026-04-05"
type: troubleshooting-guide
---

> **Compliance note**: This wiki contains test/lab data only. Feature is in public preview as of 8 July 2022.

## Overview

This feature allows admins to **block BitLocker key self-service recovery** by end users, restricting recovery to privileged roles only:
- Global Administrator, Cloud Device Administrator, Helpdesk Administrator, Security Reader, Security Administrator, Intune Service Administrator, Registered Owner of the device

Default users without BitLocker read permission will be unable to view or copy their BitLocker keys.

**Licensing**: No additional licensing required.  
**Limitation**: All-or-nothing; cannot be scoped to groups or individual users.

## Configuration Methods

### Azure AD Portal

Navigate to **Azure AD Portal > Device Settings > Restrict non-admin users from recovering the BitLocker key(s) for their owned devices** (toggle).

### Microsoft Graph API (PATCH)

```
PATCH https://graph.microsoft.com/beta/policies/authorizationPolicy/authorizationPolicy
```

Required permission: `Policy.ReadWrite.Authorization`

**Block self-service** (set `false`):
```json
{
  "defaultUserRolePermissions": {
    "allowedToReadBitlockerKeysForOwnedDevice": false
  }
}
```

**Re-enable self-service** (set `true`): same body with `true`.

Allow ~30 minutes for changes to take effect.

### PowerShell (Microsoft Graph SDK)

```powershell
Connect-MgGraph -Scopes Policy.ReadWrite.Authorization

$allowBitLockerSelfService = $false  # Set $true to allow

$authPolicyUri = "https://graph.microsoft.com/beta/policies/authorizationPolicy/authorizationPolicy"

$body = @{
    defaultUserRolePermissions = @{
        allowedToReadBitlockerKeysForOwnedDevice = $allowBitLockerSelfService
    }
} | ConvertTo-Json

Invoke-MgGraphRequest -Uri $authPolicyUri -Method PATCH -Body $body

# Verify current setting:
$authPolicy = Invoke-MgGraphRequest -Uri $authPolicyUri
$authPolicy.defaultUserRolePermissions
```

## Testing the Experience

1. Use an account without BitLocker admin roles
2. Navigate to https://myaccount.microsoft.com/device-list
3. When self-service is **blocked**: "Show recovery key" button hidden
4. When self-service is **enabled**: "Show recovery key" button visible

Also verifiable via Azure AD Portal > Devices blade > Device details.

## Troubleshooting / ICM Escalations

**Service**: Azure Active Directories, Domains and Objects  
**Problem Type**: Devices  
**Problem Subtype**: Device Administration or Other  

ICM template: https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=m2U3B2  
ICM route: **Owning Service**: ADRS | **Owning Team**: ADRS

## References

- [Manage device identities - Azure portal (block BitLocker keys)](https://docs.microsoft.com/en-us/azure/active-directory/devices/device-management-azure-portal#block-users-from-viewing-their-bitlocker-keys-preview)
- [Manage devices from Devices page](https://support.microsoft.com/en-us/account-billing/manage-your-work-or-school-account-connected-devices-from-the-devices-page-6b5a735d-0a7f-4e94-8cfd-f5da6bc13d4e)

---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD MFA/Azure AD System Preferred MFA Method Policy"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20MFA%2FAzure%20AD%20System%20Preferred%20MFA%20Method%20Policy"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Azure AD System Preferred MFA Method Policy

## Summary

System-preferred MFA method allows administrators to override user's specified Default sign-in method. When enabled, users are prompted to use their most secure registered verification method as second factor, rather than their chosen default.

**IMPORTANT**: Contrary to the original plan to switch System preferred MFA method from Disabled to Enabled, the decision was made to leave System-Preferred MFA in its current state. Organizations that modified the State from Microsoft Managed to Disabled will remain as they are.

## Timeline

- **Feb 2023**: Public Preview announced, feature disabled by default (state = Microsoft managed = null)
- **April 3, 2023**: General Availability (GA)
- **July 7, 2023**: Microsoft enabled for all orgs with state = Microsoft Managed
- **October 2, 2023**: All tenants set to All users, Exclude groups removed, State set to Enabled

## Order of Authentication Methods

The order is dynamic and under Microsoft's control. Higher preference = lower number. The system selects the most secure method the user has registered.

Priority order (highest to lowest):
1. Temporary Access Pass
2. FIDO2 Security Key
3. Microsoft Authenticator push notification
4. TOTP (Time-based One-Time Password)
5. Phone sign-in (Passwordless)
6. SMS

## How to Enable/Disable

### Azure AD Portal

Navigate to: Authentication methods policies > Settings > System-preferred multifactor authentication method

### Microsoft Graph API

**Tenant-wide enable:**
```
PATCH https://graph.microsoft.com/beta/policies/authenticationMethodsPolicy
{
    "systemPreferredMethodForSecondaryAuthenticationSettings": {
        "state": "enabled",
        "excludeTargets": [],
        "includeTargets": [{"id": "all_users", "targetType": "group"}]
    }
}
```

**Include/Exclude specific groups:**
```
PATCH https://graph.microsoft.com/beta/policies/authenticationMethodsPolicy
{
    "systemPreferredMethodForSecondaryAuthenticationSettings": {
        "state": "enabled",
        "excludeTargets": [{"id": "<groupId>", "targetType": "group"}],
        "includeTargets": [{"id": "<groupId>", "targetType": "group"}]
    }
}
```

## User Experience

When enabled:
- Users cannot change their default method from Security Info page
- Users see message: "You are using the most advisable sign-in method where it applies"
- If the served method is not accessible, user can select "Sign in another way" to choose from other registered methods

## Known Issues

- M365 Message Center announcement MC523051 had incorrect dates; new announcements were issued
- Organizations that explicitly set state to Disabled before GA retain that setting

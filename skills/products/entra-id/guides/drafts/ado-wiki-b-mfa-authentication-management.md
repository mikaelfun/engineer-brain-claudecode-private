---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD MFA/Azure AD MFA Authentication Management"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20MFA%2FAzure%20AD%20MFA%20Authentication%20Management"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Azure AD MFA Authentication Management

## Summary

Customers have been seeking more granular control over who can manage their end-user's MFA Authentication methods and the caching of remembered devices while following the principal of least user privilege. Two Azure AD roles have been introduced:

- **Authentication Administrator** - Can view, set and reset authentication method information for any non-admin user.
- **Privileged Authentication Administrator** - Can view, set and reset authentication method information for any user (admin or non-admin).

A new **Authentication methods** blade is located in the Azure AD portal under the **Manage** section by selecting a user account. This blade introduces two controls:
1. Manage end-user's MFA Authentication methods
2. Manage caching of remembered devices

## Key Capabilities

### Authentication Administrator Role
- View, set and reset authentication method information for **non-admin users only**
- Cannot manage admin accounts

### Privileged Authentication Administrator Role
- View, set and reset authentication method information for **any user** (admin or non-admin)
- Full control over all authentication methods

### Authentication Methods Blade
Located in Azure AD portal: Users > Select User > Manage > Authentication methods

Controls available:
- Manage MFA authentication methods (add/remove phone numbers, authenticator app, etc.)
- Manage remembered device caching (clear "Remember my device" state)

## Manage Authentication Methods (Resetting MFA)

### Using Azure Portal
1. Sign into Azure portal as Authentication Administrator or Privileged Authentication Administrator
2. Navigate to Azure Active Directory > Users
3. Select the user account
4. Click Authentication methods blade
5. View/modify/reset authentication methods as needed

### Using PowerShell (Microsoft Graph)
```powershell
Connect-MgGraph -Scopes UserAuthenticationMethod.ReadWrite.All
# List user's phone methods
Get-MgUserAuthenticationPhoneMethod -UserId user@contoso.net
# Add new phone method
New-MgUserAuthenticationPhoneMethod -UserId user@contoso.net -phoneType "mobile" -phoneNumber "+1 1112223333"
# Remove phone method
Remove-MgUserAuthenticationPhoneMethod -UserId user@contoso.net -PhoneAuthenticationMethodId $methodId
```

### Using Graph API
```
GET https://graph.microsoft.com/beta/users/{userId}/authentication/phoneMethods
PUT https://graph.microsoft.com/beta/users/{userId}/authentication/phoneMethods/{methodId}
DELETE https://graph.microsoft.com/beta/users/{userId}/authentication/phoneMethods/{methodId}
```

## Public Documentation
- [Manage user authentication methods for Azure AD Multi-Factor Authentication](https://docs.microsoft.com/azure/active-directory/authentication/howto-mfa-userdevicesettings)

---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/ACE Identity TSGs/Identity Technical Wiki/Multi-Factor Authentication/Change Per user MFA Settings Using PowerShell"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FACE%20Identity%20TSGs%2FIdentity%20Technical%20Wiki%2FMulti-Factor%20Authentication%2FChange%20Per%20user%20MFA%20Settings%20Using%20PowerShell"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Change Per-user MFA user settings using Microsoft Graph

> **IMPORTANT NOTE:**
> Management of Per-user MFA user settings is transitioning from the deprecated MSOnline PowerShell module to the Microsoft Graph REST API Beta.
> All processes and scripts previously utilizing the MSOnline module must be updated to use Microsoft Graph for managing Per-user MFA settings.
> For guidance, see: [Enable per-user multifactor authentication - Microsoft Entra ID | Microsoft Learn](https://learn.microsoft.com/en-us/entra/identity/authentication/howto-mfa-userstates#use-microsoft-graph-to-manage-per-user-mfa)

**Tools to use:** [Graph Explorer](https://developer.microsoft.com/en-us/graph/graph-explorer)

**Required permission:** `Policy.ReadWrite.AuthenticationMethod` (consent in Graph Explorer under Modify permissions)

---

## Get current per-user MFA status

- **Method:** GET
- **Version:** beta
- **URL:** `https://graph.microsoft.com/beta/users/<UserInfo>/authentication/requirements`
  - Replace `<UserInfo>` with the user's UPN or GUID

Response will show the current value of `perUserMfaState` in the Response preview section.

---

## Enable Per-user MFA

- **Method:** PATCH
- **Version:** beta
- **URL:** `https://graph.microsoft.com/beta/users/<UserInfo>/authentication/requirements`
- **Request body:**
```json
{
    "perUserMfaState": "enabled"
}
```

---

## Enforce Per-user MFA

- **Method:** PATCH
- **Version:** beta
- **URL:** `https://graph.microsoft.com/beta/users/<UserInfo>/authentication/requirements`
- **Request body:**
```json
{
    "perUserMfaState": "enforced"
}
```

---

## Disable Per-user MFA

- **Method:** PATCH
- **Version:** beta
- **URL:** `https://graph.microsoft.com/beta/users/<UserInfo>/authentication/requirements`
- **Request body:**
```json
{
    "perUserMfaState": "disabled"
}
```

---

## Support documentation

- [Update authentication method states - Microsoft Graph beta](https://learn.microsoft.com/en-us/graph/api/authentication-update?view=graph-rest-beta&tabs=powershell)
- [Enable per-user MFA - Microsoft Entra ID](https://learn.microsoft.com/en-us/entra/identity/authentication/howto-mfa-userstates)

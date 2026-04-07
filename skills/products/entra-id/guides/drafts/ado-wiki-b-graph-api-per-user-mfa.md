---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD MFA/Microsoft Graph API Support for Per User MFA"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20MFA%2FMicrosoft%20Graph%20API%20Support%20for%20Per%20User%20MFA"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Microsoft Graph API Support for Per-User MFA

## Summary

Microsoft Graph can be used to manage Per-User MFA state. The API is accessible under the /beta version of Microsoft Graph.

## Permissions

### To update Per-User MFA State (acting on self)
- Delegated (work or school): `Policy.ReadWrite.AuthenticationMethod`
- Must be assigned: **Authentication Administrator** or **Privileged Authentication Administrator** role
- Application: Not Supported

### To act on others
- Delegated (work or school): `Policy.ReadWrite.AuthenticationMethod`
- Least privileged role: **Authentication Policy Administrator**
- Application: `Policy.ReadWrite.AuthenticationMethod`

## Supported Operations

### View Per-User MFA State
```http
GET https://graph.microsoft.com/beta/users/{ID|UPN}/authentication/requirements
```

Response (if user is enabled for Per-User MFA):
```json
HTTP/1.1 200 OK
Content-Type: application/json
{ "perUserMfaState": "enforced" }
```

### Change Per-User MFA State
```http
PATCH https://graph.microsoft.com/beta/users/{ID|UPN}/authentication/requirements
Content-Type: application/json
{ "perUserMfaState": "disabled" }
```

Response if successful:
```
HTTP/1.1 204 No Content
```

## Possible Values for perUserMfaState
- `disabled` - MFA not required for the user
- `enabled` - MFA required but user hasn't completed registration; prompted at next sign-in
- `enforced` - MFA required and user has completed registration
- `unknownFutureValue`

## ICM Escalations
- Owning Service: **ESTS**
- Owning Team: **Incident Triage**

## Public Documentation
- [Enable per-user Microsoft Entra multifactor authentication](https://learn.microsoft.com/en-us/entra/identity/authentication/howto-mfa-userstates#use-microsoft-graph-to-manage-per-user-mfa)
- [strongAuthenticationRequirements resource type](https://learn.microsoft.com/en-us/graph/api/resources/strongauthenticationrequirements?view=graph-rest-beta)
- [Update authentication method states](https://learn.microsoft.com/en-us/graph/api/authentication-update?view=graph-rest-beta)
- [Get authentication method states](https://learn.microsoft.com/en-us/graph/api/authentication-get?view=graph-rest-beta)

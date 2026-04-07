---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/StrongAuth Passwordless(WHfB FIDO phone based)/Microsoft Authenticator (PSI) For Work Accounts/MS Authenticator PSI Detailed Objects and attributes"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FStrongAuth%20Passwordless(WHfB%20FIDO%20phone%20based)%2FMicrosoft%20Authenticator%20(PSI)%20For%20Work%20Accounts%2FMS%20Authenticator%20PSI%20Detailed%20Objects%20and%20attributes"
importDate: "2026-04-06"
type: troubleshooting-guide
21vNote: "MS Authenticator Passwordless NOT supported in Mooncake"
---

# MS Authenticator PSI Detailed Objects and Attributes

## Authentication Methods Policy Object

MS Authenticator passwordless sign-in is enabled via **Authentication method policy** in Entra ID Admin portal: Protection > Authentication Methods.

Changing any policy creates a **Default User Credential Policy** (PolicyType=24, UserCredentialPolicy).

## UserCredentialType Values

| Type | Description |
|------|-------------|
| Password | Password based credential |
| Voice | Phone call based auth |
| AppNotification | Authenticator push notification |
| HardwareOath | Hardware token |
| SoftwareOath | Software token |
| Sms | SMS based auth |
| Fido | FIDO2 devices |
| Pin | User PIN |
| PhoneSignIn | Passwordless authenticator sign-in |

## PhoneSignIn Section

Controls Passwordless authenticator settings. PolicyDetail JSON contains credential management for:
- FIDO2 Security Key
- Microsoft Authenticator
- Text message (SMS)

## Policy Scope

Policies can be scoped tenant-wide or target specific Users/Groups:
- **includeConditions** with `"type":"User"` + list of user objectIDs
- **includeConditions** with `"type":"Group"` + list of group objectIDs
- `isRegistrationRequired` is always false (registration disabled in UI for this policy)

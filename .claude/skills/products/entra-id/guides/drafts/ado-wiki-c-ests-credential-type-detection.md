---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD ESTS/How ESTS detects Credential Type"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20ESTS%2FHow%20ESTS%20detects%20Credential%20Type"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# How ESTS Detects Credential Type (GetCredentialType API)

## Overview

When a user enters a UPN on the Entra ID sign-in screen, the GetCredentialType API is called to determine:
- Whether the account exists
- What authentication methods are available
- Whether to redirect to a federated IdP

## Key Response Fields

### IfExistsResult

| Value | Meaning |
|-------|---------|
| 0 | Account exists |
| 1 | Account does not exist |
| 2 | Throttled |
| 4 | Error |
| 5 | Exists in other Microsoft IDP (AAD) |
| 6 | Exists in both IDPs |

### DomainType

| Value | Meaning |
|-------|---------|
| 1 | Unknown |
| 2 | Consumer |
| 3 | Managed |
| 4 | Federated |
| 5 | CloudFederated |

### PrefCredential (Most Recently Used)

| Value | Meaning |
|-------|---------|
| 0 | None |
| 1 | Password |
| 2 | RemoteNGC |
| 4 | Federation |
| 7 | Fido |
| 13 | AccessPass |
| 15 | Certificate |
| 18 | QrCodePin |
| 1000 | NoPreferredCredential |

## Federated Users

For federated users, `FederationRedirectUrl` contains the redirect URL (e.g., to AD FS). `DomainType=4` (Federated). With staged rollout enabled, `DomainType` changes to 3 and `FederationRedirectUrl` disappears.

## Known Scenarios Where API Returns NotExists for Existing Users

### Scenario 1: OOBE (Entra Join)
- Federated domain with SAML protocol
- GetCredentialType returns IfExistsResult=1 because SAML is not supported for Entra Join
- Solution: Use WS-Fed instead of SAML

### Scenario 2: B2B Guest - Email OTP Disabled
- Guest user with no available auth method (Email OTP disabled)
- GetCredentialType returns IfExistsResult=1
- Solution: Enable Email OTP in authentication methods policy

## Troubleshooting
- Use Fiddler/HAR trace to capture GetCredentialType request/response
- POST to `https://login.microsoftonline.com/common/GetCredentialType`
- Check IfExistsResult, DomainType, PrefCredential, Credentials in response

---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/StrongAuth Passwordless(WHfB FIDO phone based)/Microsoft Authenticator (PSI) For Work Accounts/MS Authenticator PSI Introduction"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/StrongAuth%20Passwordless%28WHfB%20FIDO%20phone%20based%29/Microsoft%20Authenticator%20%28PSI%29%20For%20Work%20Accounts/MS%20Authenticator%20PSI%20Introduction"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# MS Authenticator Passwordless Phone Sign-in (PSI) - Introduction

## Feature Overview

Microsoft Entra ID offers passwordless authentication through the Microsoft Authenticator app. Users sign in using a mobile device instead of a password. Once registered, users receive a push notification prompting number matching + biometric/PIN verification.

## Key Points

- **Passwordless Sign-In**: Uses key-based authentication tied to a device, unlocked using PIN or biometric.
- **Multiple Accounts**: Users can enable passwordless for multiple accounts on the same device. Guest accounts NOT supported.
- **User Registration**: Users must register their device with each tenant.
- **Device Ownership**: Device registration is tenant-based. First user to enable passwordless in a tenant becomes device owner.
- **Policy Defaults**: Each group enabled by default for "Any" mode (push or passwordless). Admins can override to "Push" or "Passwordless" only.

## Management - Graph API

- `includeTargets` section = Basics tab in portal
- `featureSettings` section = Configure tab (new):
  - `companionAppAllowedState` (Outlook mobile, not in portal)
  - `numberMatchingRequiredState`
  - `displayAppInformationRequiredState`
  - `displayLocationInformationRequiredState`
- Old settings in `includeTargets` (`displayAppInformationRequiredState`, `numberMatchingRequiredState`) are now ignored by ESTS in favor of `featureSettings`.

## Public Documentation

- [Passwordless sign-in overview](https://learn.microsoft.com/en-us/entra/identity/authentication/concept-authentication-passwordless)
- [Enable passwordless sign-in with Authenticator](https://learn.microsoft.com/en-us/entra/identity/authentication/howto-authentication-passwordless-phone)
- [Authenticator authentication method](https://learn.microsoft.com/en-us/entra/identity/authentication/concept-authentication-authenticator-app)

## Prerequisites

See: [Passwordless sign-in prerequisites](https://learn.microsoft.com/en-us/entra/identity/authentication/howto-authentication-passwordless-phone#prerequisites)

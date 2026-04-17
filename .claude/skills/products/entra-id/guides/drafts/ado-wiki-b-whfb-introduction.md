---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/StrongAuth Passwordless(WHfB FIDO phone based)/Hello for Business/WHfB: Introduction"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FStrongAuth%20Passwordless(WHfB%20FIDO%20phone%20based)%2FHello%20for%20Business%2FWHfB%3A%20Introduction"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Windows Hello for Business - Feature Overview

Windows Hello for Business replaces passwords with strong two-factor authentication on PCs and mobile devices. Authentication consists of a user credential tied to a device using biometric or PIN.

## Benefits

- Strengthens protections against credential theft (requires both device and biometric/PIN)
- Circumvents phishing and brute force attacks (asymmetric credentials, isolated TPM environments)
- Simple and convenient authentication backed by PIN
- Biometric devices can be added as part of coordinated rollout

## Deployment Models

Supports **Cloud Only**, **Hybrid**, and **On-premises** deployments.

For on-premises deployment model, the case should start with Directory Service team; they involve AAD Auth if they need help with ADFS.

## Trust Types

- **Cloud Kerberos Trust** - Requires Windows 10 21H2 (KB5010415+) or Windows 11 21H2 (KB5010414+). No CA or ADFS needed.
- **Key Trust** - All supported Windows versions. Requires WS2016+ schema, AAD Connect Sync.
- **Certificate Trust** - All supported Windows versions. Requires WS2016 ADFS (KB4088889), Entra ID P1 license.

## Requirements Summary

| Trust Type | Key Trust | Certificate Trust | Cloud Kerberos Trust |
|---|---|---|---|
| Policy | GPO or MDM | GPO or MDM | GPO or MDM |
| Client | All supported | All supported | Win10 21H2+/Win11 21H2+ |
| DC Version | All supported | All supported | WS2016 (KB3534307+) |
| CA | All supported | All supported | None |
| ADFS | None | WS2016 (KB4088889) | None |
| MFA | Entra MFA (free OK) | Entra MFA | Entra MFA (free OK) |
| AAD Connect | Required | Required | Required |
| License | None | Entra ID P1 | None |

## How It Works

- Credentials based on certificates or asymmetric key pairs, bound to device
- Identity provider (AD, AAD, Microsoft account) validates and maps public key during registration
- Keys generated in hardware (TPM) or software based on policy
- Two-factor: key/certificate tied to device + PIN or biometric
- Private key never leaves device when using TPM
- PIN and biometric trigger cryptographic signing with private key

## Architecture

### Provisioning Flow
Depends on deployment model and trust type. See [How WHfB provisioning works](https://learn.microsoft.com/en-us/windows/security/identity-protection/hello-for-business/how-it-works-provisioning).

### Authentication Flow
Depends on deployment model and trust type. See [WHfB authentication](https://learn.microsoft.com/en-us/windows/security/identity-protection/hello-for-business/how-it-works-authentication).

## FAQ
- Public: https://learn.microsoft.com/en-us/windows/security/identity-protection/hello-for-business/faq

---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/StrongAuth Passwordless(WHfB FIDO phone based)/FIDO2 passkeys/FIDO2: Programmatic Provisioning"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FStrongAuth%20Passwordless(WHfB%20FIDO%20phone%20based)%2FFIDO2%20passkeys%2FFIDO2%3A%20Programmatic%20Provisioning"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# FIDO2: Programmatic Provisioning

## Summary

This feature allows admins and ISVs to perform on-behalf-of registration of a FIDO2 passkey (security key) for a user. On behalf of registration is facilitated by extending the FIDO2 MS Graph APIs.

**Note**: This feature is limited to security keys at this point in time.

## Admin On-Behalf-Of Registration Flow

1. Admin initiates registration via Entra Admin Portal: User > Authentication methods > Add authentication method > Passkey (FIDO2)
2. Or via MS Graph API programmatically

## Scripted Bulk Registration

Two Python scripts facilitate bulk registration:

1. **bulkRegistrationGetFIDO2CreationOptions.py** - Pulls user information from Entra Directory and dumps to .csv file
2. **bulkRegistrationCreateAndActivateCredential.py** - Performs registration using .csv data to create and activate FIDO2 security keys

## Programmatic Provisioning APIs

Two main APIs:

### 1. Credential Option Request

- **Action**: `GET`
- **URI**: `https://graph.microsoft.com/v1.0/users/{userId}/authentication/fido2methods/creationOptions(challengeTimeoutInMinutes=5)`
- **Challenge Timeout** (optional): Min 5 min, Max 43,200 min (30 days) - allows delay between enrollment request and security key registration

### 2. Make Credential (Registration)

Using the output from Creation Options API, a client creates the public/private key pair and stores the credential on the device. Clients can leverage CTAP or WebAuthn libraries.

## Sample Code

- [YubicoOBOregister](https://github.com/YubicoLabs/entraId-register-passkeys-on-behalf-of-users)

## Training

- Deep Dive Session: https://aka.ms/AAspl62

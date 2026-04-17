---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/StrongAuth Passwordless(WHfB FIDO phone based)/FIDO2 passkeys/FIDO2: What is new"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FStrongAuth%20Passwordless(WHfB%20FIDO%20phone%20based)%2FFIDO2%20passkeys%2FFIDO2%3A%20What%20is%20new"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# What's new - FIDO2 Passkeys

## Passkeys in Microsoft registration campaigns (early April 2026)

As per MC1253746, Microsoft Registration Campaigns will support Passkeys (FIDO2) as an additional authentication method starting in early April 2026. This update helps organizations accelerate adoption of phishing-resistant credentials by allowing administrators to opt users into Passkeys and deliver Passkey registration nudges during sign-in.

> **Note**: Registration Campaigns support targeting only one authentication method at a time - either Microsoft Authenticator or Passkeys (FIDO2), but not both simultaneously.

## Support for Entra Passkeys on Windows (FIDO2) (Late March 2026)

As per MC1247893, Entra will ship support for Entra passkeys on Windows in late March 2026.

- Allows users to create device-bound passkeys stored in the Windows Hello container and authenticate using Windows Hello methods (face, fingerprint, or PIN).
- Primarily intended for personal, shared, and unmanaged PCs.
- Windows Hello for Business remains recommended for managed, Entra-joined or registered devices; passkeys supplement unmanaged device scenarios and do not support device sign-in.

## Upcoming Changes to Passkey (FIDO2) Policy (Nov 2025)

1. **Passkey Profiles Introduction** - Support for passkey profiles, enabling organizations to assign different passkey configurations to different groups.
2. **Deprecation Notice** - Planned deprecation of legacy policy settings (`isAttestationEnforced` and `keyRestrictions`).

### Schema Transition and Preview Behavior

- During preview, the new passkey profiles schema is optional and only activated when changes are made via the Azure or Entra portal.
- Tenants using Graph API or third-party tools will continue with the legacy schema unless updated manually.
- Upon GA, the new schema will be automatically applied to all tenants.
- A dual-write mechanism will persist until **October 2027**, ensuring legacy and new schema values remain synchronized.

### API Deprecation Details

- `isAttestationEnforced` and `keyRestrictions` will be replaced by `attestationEnforced` and a new `keyRestrictions` property.
- Existing values will be migrated into the Default Passkey Profile.
- Organizations should update custom automations and integrations to align with the new schema.

### Changes to Attestation Handling

- When attestation enforcement is disabled, Microsoft Entra ID will support a broader range of WebAuthn-compliant keys.
- Customers will be prompted to choose whether to enforce device-bound passkeys, allow synced passkeys, or allow both (recommended).

## Passkey Autofill UI for Entra ID Users (Mid-June 2025)

- Passkey Autofill UI makes signing in quicker on supported browsers for desktop and mobile.
- Users no longer need to type a username or click "Sign-in options" - they can tap directly on the username field.
- Works with any passkey stored in any credential manager.
- Only supported in latest versions of Safari, Edge, and Chrome.
- MC1115980 released for GCC, GCCH, and DoD customers on July 17, 2025.

---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/StrongAuth Passwordless(WHfB FIDO phone based)/FIDO2 passkeys/FIDO2: Synced Passkeys in Entra/(Interrupt) *"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FStrongAuth%20Passwordless(WHfB%20FIDO%20phone%20based)%2FFIDO2%20passkeys%2FFIDO2%3A%20Synced%20Passkeys%20in%20Entra"
importDate: "2026-04-05"
type: troubleshooting-guide
consolidatedFrom:
  - "(Interrupt) Cross Device Registration"
  - "(Interrupt) Same Device Registration"
  - "(Interrupt) Third Party Cross Device Registration"
---

# Synced Passkeys in Entra — Interrupt Registration Flows

Interrupt mode is triggered when the organization uses Conditional Access to require synced passkeys for strong authentication, and the user has not yet registered a synced passkey.

## Common Prerequisites

- Conditional Access policy enforces authentication strength with AAGUIDs for synced passkeys
- User has not yet registered a synced passkey
- User signs in with UPN + password → "More information required" → Next

## Flow A: Cross-Device Registration (Desktop → Mobile)

**Scenario**: User signs in from desktop browser, passkey stored on mobile device via Bluetooth + QR code.

1. Sign in on desktop browser → CA enforces passkey registration
2. Prompt: "Sign in faster with your face, fingerprint, or PIN" → "Specific passkeys" link shows allowed types → Next
3. Click **Change** → "Choose where to save your passkey" → Select **iPhone, iPad, or Android device**
4. QR code appears → Scan with camera app on mobile → Tap "Save a passkey"
5. Bluetooth connects desktop and mobile device
6. Choose provider: iCloud Keychain (iPhone), Google Password Manager (Android), Samsung Pass, or third-party (e.g., Bitwarden)
7. Authenticate with Touch ID / PIN on mobile
8. Desktop popup: "login.microsoft.com is requesting extended information about your security key" → Allow
9. Name the passkey → Save to Entra ID account
10. Sign in with passkey: select iPhone/iPad/Android → scan QR → authenticate → KMSI prompt

## Flow B: Same-Device Registration (Mobile Browser)

**Scenario**: User signs in from mobile browser, passkey stored on same device. No Bluetooth/QR needed.

1. Sign in on mobile browser → CA enforces passkey registration
2. Prompt: "Sign in faster with your face, fingerprint, or PIN" → Next
3. Choose provider: iCloud Keychain, Google Password Manager, Samsung Pass, or third-party
4. Authenticate with Touch ID / PIN
5. Redirected to mysignins.microsoft.com → Name passkey → Save
6. Sign in with passkey: Touch ID / PIN → access granted

## Flow C: Third-Party Cross-Device Registration (Desktop → Mobile 3P Provider)

**Scenario**: User signs in from desktop, passkey stored in third-party provider (e.g., Bitwarden) on mobile via Bluetooth + QR code.

1-4. Same as Flow A (QR code + Bluetooth)
5. Choose third-party provider (e.g., Bitwarden)
6. Unlock provider with biometrics, PIN, or master password
7. If prompted: "Save a passkey as new login"
8. Desktop popup → Allow → Name passkey → Save
9. Sign in with passkey: QR → Bluetooth → authenticate → KMSI

## Key Support Notes

- **"Specific passkeys" link**: Shows the list of allowed AAGUID-based passkeys the user can register
- **Bluetooth required** for all cross-device flows (desktop → mobile)
- **No Bluetooth needed** for same-device (mobile) flows
- **Provider selection**: OS-native providers (iCloud Keychain, Google PM) appear first; third-party apps appear if installed

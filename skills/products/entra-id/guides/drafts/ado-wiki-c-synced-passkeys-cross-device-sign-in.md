---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/StrongAuth Passwordless(WHfB FIDO phone based)/FIDO2 passkeys/FIDO2: Synced Passkeys in Entra/Cross Device Sign in"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FStrongAuth%20Passwordless(WHfB%20FIDO%20phone%20based)%2FFIDO2%20passkeys%2FFIDO2%3A%20Synced%20Passkeys%20in%20Entra%2FCross%20Device%20Sign%20in"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Synced Passkeys — Cross-Device Sign-in Flow

## Summary

This flow describes how a user who has already registered a synced passkey signs in to Microsoft Entra on a desktop browser using that passkey stored on their mobile device. The Conditional Access policy requires the synced passkey for strong authentication.

## Cross-Device Sign-in Steps

1. **Initial Sign-in**: User enters UPN on desktop browser → CA requires synced passkey
2. **Device Selection**: "Choose where to save your passkey" → Select **iPhone, iPad, or Android device**
3. **QR Code**: QR code appears on desktop
4. **Scan**: Scan QR code with camera app on mobile → Tap **Sign in with a passkey**
5. **Bluetooth**: Bluetooth connects desktop and mobile device
6. **Unlock Provider**: User satisfies biometrics, PIN, or master password to unlock the passkey provider
7. **Passkey Provided**: The passkey is supplied to Microsoft Entra
8. **Completion**: Sign-in completes, redirected to KMSI prompt

## Key Support Notes

- Bluetooth is required between desktop and mobile device
- Both devices must be physically nearby (Bluetooth proximity check prevents remote attacks)
- Works with native providers (iCloud Keychain, Google PM) and third-party providers
- User must have already registered a synced passkey before this flow works

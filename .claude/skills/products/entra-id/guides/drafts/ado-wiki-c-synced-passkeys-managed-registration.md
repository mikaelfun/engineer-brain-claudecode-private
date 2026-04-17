---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/StrongAuth Passwordless(WHfB FIDO phone based)/FIDO2 passkeys/FIDO2: Synced Passkeys in Entra/(Managed) *"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FStrongAuth%20Passwordless(WHfB%20FIDO%20phone%20based)%2FFIDO2%20passkeys%2FFIDO2%3A%20Synced%20Passkeys%20in%20Entra"
importDate: "2026-04-05"
type: troubleshooting-guide
consolidatedFrom:
  - "(Managed) Cross Device Registration"
  - "(Managed) Same Device Registration"
  - "(Managed) Third Party Cross Device Registration"
  - "(Managed) Third Party Same Device Registration"
---

# Synced Passkeys in Entra — Managed Registration Flows

Managed mode is when the user proactively goes to Security Info (https://aka.ms/mysecurityinfo) to add a synced passkey, without being forced by Conditional Access.

## Common Steps

1. Sign in to Security Info page
2. Click/Tap **+ Add sign-in method** → **Passkey**
3. "Setting up your passkey" prompt appears

## Flow A: Cross-Device Registration (Desktop → Mobile, Native Provider)

**Scenario**: User on desktop adds passkey stored on mobile device (iCloud Keychain / Google PM).

1. Click **Next** → "Save your passkey" indicates local device
2. Click **Change** → "Choose where to save your passkey" → Select **iPhone, iPad, or Android device**
3. QR code appears → Scan with camera on mobile → "Save a passkey"
4. Bluetooth connects
5. Choose provider: iCloud Keychain, Google Password Manager, Samsung Pass, or third-party
6. Authenticate with Touch ID / PIN
7. Desktop popup: "login.microsoft.com requesting extended information" → Allow
8. Name passkey → Save to Entra ID account
9. Registration complete

## Flow B: Same-Device Registration (Mobile Browser, Native Provider)

**Scenario**: User on mobile browser adds passkey stored on same device. No Bluetooth/QR needed.

1. Tap **Next** → "Sign in faster with your face, fingerprint, or PIN"
2. Choose provider: iCloud Keychain, Google Password Manager, Samsung Pass, or third-party
3. Authenticate with Touch ID / PIN
4. Redirected to Security Info → Name passkey → Save
5. Registration complete

## Flow C: Cross-Device Registration (Desktop → Mobile, Third-Party Provider)

**Scenario**: User on desktop adds passkey stored in third-party provider (e.g., Bitwarden) on mobile.

1-3. Same as Flow A (QR code + Bluetooth)
4. Choose third-party provider (e.g., Bitwarden)
5. If provider not default: "Save another way" → select provider → "Use once" or change default in Settings
6. Unlock provider with biometrics/PIN/master password
7. Desktop popup → Allow → Name passkey → Save
8. Registration complete

## Flow D: Same-Device Registration (Mobile Browser, Third-Party Provider)

**Scenario**: User on mobile browser adds passkey stored in third-party provider on same device.

1. Tap **Next** → "Setting up your passkey" → Next
2. Choose third-party provider
3. Unlock provider → may need to tap "Save passkey as a new login"
4. Redirected to Security Info → Name passkey → Save
5. Registration complete

## Key Support Notes

- **Managed mode** = user-initiated via Security Info page (not CA-forced)
- **Cross-device** always requires Bluetooth + QR code
- **Same-device** flows are simpler (no Bluetooth/QR)
- **Third-party providers**: May require additional steps like "Save another way", "Use once", or master password
- **"Change" button**: On desktop, default save location is Windows device; must click Change to save to mobile

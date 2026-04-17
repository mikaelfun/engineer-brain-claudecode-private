---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/StrongAuth Passwordless(WHfB FIDO phone based)/Microsoft Authenticator (PSI) For Work Accounts/MS Authenticator PSI Detailed User Flow"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FStrongAuth%20Passwordless(WHfB%20FIDO%20phone%20based)%2FMicrosoft%20Authenticator%20(PSI)%20For%20Work%20Accounts%2FMS%20Authenticator%20PSI%20Detailed%20User%20Flow"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# MS Authenticator PSI Detailed User Flow

## Passwordless Sign-in Flow (User Experience)

### With Rich Context (App and Location Enabled)

1. User is presented with a 2-digit number on the sign-in screen
2. User must type in the correct number within the Authenticator approval
   - Older versions (Android < 6.2110.6659, iOS < 6.5.83): User selects from 3 numbers
   - Newer versions: User types the specific number
3. Rich context shows app name and IP-based location for informed approval decisions

### Using Passwordless Sign-in

1. User types their UPN at sign-in
2. System detects registered PSI credential → triggers passwordless flow
3. 2-digit number displayed on login screen + notification sent to device
4. User approves notification → opens Authenticator → verifies 2-digit code
5. User provides device passcode/biometric → authentication approved

**Note**: This is multi-factor: possession (authenticator app) + knowledge/inherence (passcode/biometric).

## Setting Up Phone Sign-in

1. User adds work account to Microsoft Authenticator app
2. User taps the caret on their account → **Set up phone sign-in**
3. If device is not registered → **Continue** to register device in Entra ID
4. Device registration creates NGC (Next Generation Credential) private key on device + public key stored on user object in MSODS

**Updated flow**: Full screen Account Details page → tap account → **Set up phone sign-in** → shows "Phone sign-in enabled" in full screen view.

## Disabling Passwordless Sign-in

Two options:

1. **From device**: Open Microsoft Authenticator → dropdown menu → **Disable phone sign-in**
2. **From web**: Remove device at http://aka.ms/mysecurityinfo

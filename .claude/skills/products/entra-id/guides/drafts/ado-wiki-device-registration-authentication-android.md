---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Device Registration/Android Devices/Device Registration and Authentication on Android"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FDevice%20Registration%2FAndroid%20Devices%2FDevice%20Registration%20and%20Authentication%20on%20Android"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Device Registration and Authentication on Android

## Feature Overview
- Device Registration on Android requires Company Portal or Authenticator
- Registration happens during: Intune enrollment, resource requiring device CA, remote NGC key setup, or manual registration
- After registration, WPJ certificate can be installed for browser access via "Enable Browser Access" in Authenticator/CP settings
- Edge does not need "browser access" certificate
- On non-Samsung/KNOX devices, "Browser access" certificate is not removed upon device un-registration

## Authentication Process
- Client apps use MSAL Library for authentication
- Flow: Check access token cache → use refresh token → interactive request (if both fail)
- First party apps commonly use OneAuth (similar flow to MSAL)

## Authentication using Token Broker
- Broker provides device-wide SSO and satisfies device CA requirements
- Uses Primary Refresh Token (PRT) acquired and held by broker
- Broker shipped in: Microsoft Authenticator, Intune Company Portal, Link-to-Windows
- Active broker = first installed app; uninstalling switches to second app
- When active broker uninstalled, WPJ state and account info cleared (Android 6.0+)

## Device Authentication with PKeyAuth/ClientTLS
- Relies on WPJ certificate created after device registration
- Device auth doesn't require PRT - it verifies device identity via device certificate
- Device joining/registering generates credential (certificate) and creates device object in AAD with public key

## Troubleshooting
1. Get correlationID/UPN, app name and timestamp → find signing logs in ASC
2. Check device properties in sign-in logs (IsManaged, IsCompliant, IsKnown, etc.)
3. If no device properties → check user agent via ASC Azure AD explorer > Diagnostics
4. Determine if app supports ADAL+Broker or MSAL via ASC Authentication troubleshooter → Expert view → Client info

## Common Problems
- First party apps not using ADAL properly (opting not to use broker)
- Power savings interfering with background IPC between client and broker app (fixed in MSAL Android 1.5.2+)
- Interrupted auth doesn't auto-resume post registration (MAM/MDM)
- Android webview (Chrome) doesn't like certain Symantec CA issued certificates
- SSL connection failures → check device clock skew
- Client app denied "Contacts" permission → cannot connect to broker
- Device sign-in method change (password↔pin) → WPJ certificate becomes inaccessible
- Just-in-time enrollment: users enroll, access email, then unenroll
- ESTS shows "Unregistered" when it couldn't authenticate the device
- Device records deleted on service; broker recovery logic has holes
- Email/UPN mismatch (company updates UPN suffix) → broker skips PRT → unnecessary credential prompts
- Shared devices: only registered owner gets SSO, no sign-out support

## Data Collection
- Collect: client app logs + broker logs (from CP/Authenticator/LTW)
- Active broker file: prefix "active-" and ending with "broker.txt"
- Search broker logs for: app name/package, keywords "Acquire, Silent, interactive, error, exception, PRT"
- Use Correlation IDs with LogsMiner for full picture

## Network Troubleshooting
- Look for: "device_network_not_available", "device_network_not_available_doze_mode", io_error
- Causes: internet connectivity, firewall/proxy blocking, outdated app, incorrect config
- Resolution: check internet, disable firewall/proxy, turn off battery optimizations for broker apps

## Escalation
- ADAL+Broker issues → ICM Cloud Identity Authn Client → ADAL client and server middleware
- WPJ issues → ICM ADRS → WPJ Client
- Teams channel: Authentication → Device Registration

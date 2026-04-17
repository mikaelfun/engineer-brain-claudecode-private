---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Device Registration/Apple Devices/MacOS WorkplaceJoin troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FDevice%20Registration%2FApple%20Devices%2FMacOS%20WorkplaceJoin%20troubleshooting"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# TSG Guide for MacOS WorkPlaceJoin

## Applicable to and priority

| Platform | .Net | Xamarin | Android | iOS/macOS | CPP  | JavaScript | Java | Python |
| -------- | :--: | :-----: | :-----: | :-------: | :--: | :--------: | :--: | :----: |
| Priority | N/A  |   N/A   |   N/A   |     1     | N/A  |    N/A     | N/A  |  N/A   |

## What is device identity?

WorkPlaceJoin establishes a valid device identity with AAD via a certificate paired with a private key. This is the basis for device-based conditional access. The device certificate is required for client TLS challenge & PkeyAuth challenge with AAD and ADFS endpoints.

## Device Registration Basics

- On MacOS, only WorkPlaceJoin process is supported (not AADJ/DJ/Hybrid Join)
- Uses Azure Device Registration Service (ADRS) to create signed x.509 certificate
- Certificate contains common name field used as unique device ID
- WPJ keychain items stored in login keychain (ACL model)
- Intune Company Portal is the only channel for device registration on MacOS

## Keychain Basics

- MacOS uses Access Control List (ACL) model for keychain access
- All MS apps with com.microsoft identifier can update/delete WPJ keychains
- WPJ state may remain on device even after Company Portal uninstall (if first-party apps installed)

## Device Authentication on MacOS

- No native Authenticator app; authentication via client TLS/PkeyAuth
- Intune CP (ver 2.12.210100+) integrates broker, enables deviceless PRT during enrollment
- PRT can be upgraded to device-bound PRT at valid token endpoint with valid WPJ status
- SSO extension available for MacOS (preview)

### Supported Browsers

- **WKWebview**: Can access login keychain on MacOS
- **ASWebAuthenticationSession**: Safari instance, device auth via client TLS

### PkeyAuth Flow

1. User-Agent must contain "PKeyAuth/1.0" keyword
2. Successful PKeyAuth: "PkeyAuth AuthToken=" in Authorization field with signed token
3. "DeviceAuthnSessionCookie" indicates valid PKeyAuth session
4. Without valid WPJ certificate, no AuthToken after PKeyAuth keyword

## Common Problems on MacOS

- Apps show non-actionable errors (e.g., Outlook "Something went wrong") - get correlation ID from details, check LogsMiner
- Teams attempts resources with different Authz requirements - get correlation ID from details
- Poorly written apps clear keychain items with user's UPN - re-enroll via Intune CP
- OTA profile endpoint of ADFS DRS or Azure DRS - not supported for device CA

## Other Well Known Problems

1. **Device disabled (401) or not found (404) from ADRS**: WPJ records removed server-side. Client library removes WPJ records from DRS (401) or local keychain only (404). Re-enroll.
2. **Server/client registration mismatch**: PRT session key encrypted by public STK (server) must be decrypted by private STK (client). Mismatch causes PRT acquisition failure.
3. **ESTS shows "Unregistered"**: Cannot authenticate device. Check device_id in details section.
4. **Device records deleted on service**: Re-enrollment through Intune is only workaround.
5. **Email/UPN mismatch after UPN suffix change**: Intune detects and clears existing WPJ record, attempts re-register.

## Troubleshooting WPJ Problems on MacOS

- **Ignore -25300 (errSecItemNotFound)**: Keychain items missing because device never registered; APIs check for WPJ cert presence
- **Device Quota Reached**: Contact ADRS team; remove devices or increase tenant limit
- **Keychain error -25244 (errSecInvalidOwnerEdit)**: Fixed in WPJ library >= 3.3.3 by adding com.microsoft general access to ACL
- **Too many timestamp keychain items**: Resolved in latest WPJ library
- **Third-party apps blocking device auth** (McAfee, Charles): Disable while performing device auth

## Troubleshooting Steps

1. Collect client app logs (Outlook, OneDrive, Intune)
2. Filter by MSAL, ADAL, or WorkPlaceJoin keywords
3. Identify keychain errors (-25300, -25244, etc.)
4. Don't assume first error is root cause
5. Use Charles/Wireshark for network trace (Wireshark preferred - Charles interferes with client TLS)
6. Use WPJ request correlationID to query server-side response via Jarvis

## Common Auth Errors

- **INVALID_GRANT**: RT used to get new tokens but password changed. Check actual error message.
- **INTERACTION_REQUIRED**: MFA required, RT lacks MFA claims. Device auth may have failed, falling back to MFA.
- **USER_CANCELLED**: User could not complete MFA or refused device registration/enrollment.

## Server-side Diagnostics

- Jarvis DGrep: `https://jarvis-west.dc.ad.msft.net/logs/dgrep` - query ADRS response by correlationID
- Role: ADRSArm, filter by correlationID

## Escalation Paths

- ADAL/MSAL client issues: ICM to Cloud Identity Authn Client -> ADAL/MSAL client and server middleware
- WPJ server-side issues: ADRS

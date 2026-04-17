---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/StrongAuth Passwordless(WHfB FIDO phone based)/Azure AD FIDO2 on Non-Windows OSes"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/StrongAuth%20Passwordless(WHfB%20FIDO%20phone%20based)/Azure%20AD%20FIDO2%20on%20Non-Windows%20OSes"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# FIDO2/Passkey on Non-Windows OSes

## Android Support

### Native Apps (Oct 2024+)
Starting mid-late October 2024, Android users can sign into native Microsoft apps using FIDO2/Passkey with an authentication broker.

**Supported apps**: Teams, Outlook, OneDrive, Edge, Office

**Prerequisites**:
- Android 14+ device
- Passkey configured for Entra ID account in Microsoft Authenticator
- Microsoft Authenticator (beta 6.2405.3618+) installed
- Intune Company Portal (beta 5.0.6262.0+) if CP was already installed prior to Authenticator

> Android 13/below support is being investigated with no ETA.

### Web Browser (Apr 2024+)
Chrome and Edge supported. Firefox is NOT supported.

**Known issue**: Android OS specific bugs may cause registration to error out. Google owns the webauthn implementation. **Workaround**: Register key on Windows first, then use for sign-in on Android.

> You can't create and authenticate passkeys from browsers on Android. Microsoft is working to support browser scenarios pending platform API updates.

## iOS/macOS Support

### Web Browser (Sep 2023+)
Passkey/FIDO2 supported in Chrome, Edge, Firefox, Safari on macOS and iOS.

### Native Apps
- iOS: Requires Microsoft Authenticator or Company Portal as broker. iOS/iPadOS 17.1+ with SSO extension, or 16.0+ without.
- macOS: Requires Company Portal. macOS 14.0+ with SSO extension.

## Web Browser Support Matrix

| OS/Browser | Chrome | Edge | Firefox | Safari |
|:---:|:---:|:---:|:---:|:---:|
| Windows | ✅ | ✅ | ✅ | N/A |
| macOS | ✅ | ✅ | ✅ | ✅ |
| iOS | ✅ | ✅ | ✅ | ✅ |
| Android | ✅¹ | ✅¹ | ❌ | N/A |
| ChromeOS | ✅ | N/A | N/A | N/A |
| Linux | ✅ | ❌ | ❌ | N/A |

¹ Security key registration with Entra ID not yet supported on Android.

## FIDO2 Key Interface Support

| OS | USB/Lightning | NFC | BLE |
|:---:|:---:|:---:|:---:|
| Windows | ✅ | ✅ | ✅ |
| macOS | ✅ | ❌ | ❌ |
| iOS | ✅ | ✅ | ❌ |
| Android | ✅² | ❌ | ❌ |
| ChromeOS | ✅ | ❌ | ❌ |
| Linux | ✅¹ | ❌ | ❌ |

¹ Chrome and Firefox only; ² Chrome and Edge only

## Known Issues

1. **Apple PIN provisioning**: Apple cannot provision a new PIN on FIDO2 device. New keys must be set up on Windows first.
2. **Android NFC**: Not supported in any scenario.
3. **W365 mobile passkey**: Not currently supported (planned FY25).

## Case Handling
Supported by AAD - Authentication Premier and AAD - Authentication Professional.

## ICM Escalations
- Login issues: Service=eSTS, Team=Incident Triage
- Registration issues: Service=IAM, Team=IAM Information Worker UX

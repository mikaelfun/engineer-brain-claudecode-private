---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Develop and Customize/App SDK for iOS"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FDevelop%20and%20Customize%2FApp%20SDK%20for%20iOS"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Intune App SDK for iOS

## Quick Reference

| Item | Details |
|------|---------|
| **Current Version** | 21.4.1 (Xcode 26) / 20.9.2 (Xcode 16) |
| **Minimum iOS Version** | iOS 17.0+ (SDK 21.x) / iOS 16.0+ (SDK 20.x) |
| **Minimum Xcode** | Xcode 16.0 or later |
| **GitHub Repository** | [microsoftconnect/ms-intune-app-sdk-ios](https://github.com/microsoftconnect/ms-intune-app-sdk-ios) |
| **Support Minimum** | SDK version 20.0.0+ (older versions not supported) |

## SDK Version Matrix

| SDK Version | Xcode Version | Minimum iOS | Support Level |
|-------------|---------------|-------------|---------------|
| **21.x** | Xcode 26+ | iOS 17.0 | Main release - all features and bug fixes |
| **20.x** | Xcode 16 | iOS 16.0 | High-priority security fixes only |
| **19.x and below** | - | - | **Not supported** |

> Security Update Required: SDK version 20.8.0 or later is required.

## MSAL Integration Guide

MSAL is a **mandatory dependency** for Intune App SDK. Key functions requiring MSAL:
- User Identity & MAM Enrollment
- Conditional Launch checks
- Management Without MDM (MAM-only)
- App Protection Conditional Access

### Authentication Flow Options

1. **App Handles Authentication (Recommended)** — App integrates MSAL, handles sign-in, passes accountId to SDK via `registerAndEnrollAccountId`
2. **SDK Handles Authentication** — SDK handles MSAL auth for simple apps via `loginAndEnrollAccount`
3. **Auto-Enrollment at Launch** — `AutoEnrollOnLaunch=YES` + `MAMPolicyRequired=YES` (cannot submit to App Store)

### Critical: Account ID

Use `tenantProfile.identifier` (Entra Object ID), NOT `account.identifier`.

```objc
NSString *accountId = msalResult.tenantProfile.identifier;
[[IntuneMAMEnrollmentManager instance] registerAndEnrollAccountId:accountId];
```

### SSO and Broker Authentication

| SSO Type | Requirement |
|----------|-------------|
| Keychain SSO | Same keychain group, same Apple Developer account |
| Broker SSO | Authenticator app installed, broker enabled in MSAL |
| Web Browser SSO | User must allow cookie access |

## Integration Steps

### Required Frameworks
MessageUI, Security, CoreServices, SystemConfiguration, libsqlite3, libc++, ImageIO, LocalAuthentication, AudioToolbox, QuartzCore, WebKit, MetricKit

### Keychain Sharing
```xml
<key>keychain-access-groups</key>
<array>
    <string>$(AppIdentifierPrefix)YOUR.BUNDLE.ID</string>
    <string>$(AppIdentifierPrefix)com.microsoft.intune.mam</string>
    <string>$(AppIdentifierPrefix)com.microsoft.adalcache</string>
</array>
```

### IntuneMAMSettings (Info.plist)
```xml
<key>IntuneMAMSettings</key>
<dict>
    <key>ADALClientId</key>
    <string>YOUR-CLIENT-ID-GUID</string>
    <key>ADALRedirectUri</key>
    <string>msauth.com.yourcompany.yourapp://auth</string>
    <key>ADALAuthority</key>
    <string>https://login.microsoftonline.com/YOUR-TENANT-ID</string>
</dict>
```

> Key names use "ADAL" prefix for historical reasons but are used for MSAL configuration.

## Log Collection Methods

| Method | Self-Dev SDK Apps | Wrapped Apps | M365 Apps | Log Type |
|--------|-------------------|--------------|-----------|----------|
| Method 1: App Settings | Yes | Yes | Yes | MAM Diagnostic Logs |
| Method 2: Edge about:intunehelp | Yes | Yes | Yes | MAM Diagnostic Logs |
| Method 3: macOS Console | Device logs only | Device logs only | Device logs only | System/Device Logs |
| Method 4: Remote Diagnostics | No | No | Yes | MAM Diagnostic Logs |

### Method 1: Via App Settings (Recommended)
1. iOS Settings → Your App → Microsoft Intune → "Display Diagnostics Console" ON
2. Launch app → "Collect Intune Diagnostics" screen
3. Enable verbose logging → Get Started → Reproduce issue
4. "Send Logs to Microsoft" → Record Reference ID

### Method 2: Via Edge
Navigate to `about:intunehelp` in Edge → Share Logs → Review IntuneMAMDiagnostics.txt

### Verbose Logging
```xml
<key>VerboseLoggingEnabled</key>
<true/>
```

## Enrollment Status Codes

| Code | Constant | Description |
|------|----------|-------------|
| 0 | IntuneMAMEnrollmentStatusSuccess | Enrollment succeeded |
| 1 | IntuneMAMEnrollmentStatusFailed | Enrollment failed |
| 2 | IntuneMAMEnrollmentStatusAlreadyEnrolled | Already enrolled |
| 3 | IntuneMAMEnrollmentStatusNotLicensed | User not licensed |
| 4 | IntuneMAMEnrollmentStatusLoginRequired | Interactive login required |
| 5 | IntuneMAMEnrollmentStatusUnenrolled | Account unenrolled |
| 6 | IntuneMAMEnrollmentStatusAccountNotFound | Account not found |
| 7 | IntuneMAMEnrollmentStatusDisabled | MAM disabled for tenant |

## Common Issues and Solutions

### Issue 1: SDK Not Receiving Policy
- Check enrollment delegate for status code
- Verify user is in targeted group, app bundle ID in policy, Intune license assigned
- Ensure correct account ID (`tenantProfile.identifier`)

### Issue 2: Keychain Errors
- Verify entitlements include `com.microsoft.intune.mam` and `com.microsoft.adalcache`
- Check provisioning profile supports keychain sharing

### Issue 3: App Restart Loop
- Implement `IntuneMAMPolicyDelegate` and handle `restartApplication`
- Check for MDM/MAM app config conflicts

### Issue 4: MSAL Token Acquisition Fails
- Verify client ID and redirect URI match app registration
- Enable MSAL verbose logging for diagnostics

### Issue 5: Policy Not Applied After Sign-In
- Verify `registerAndEnrollAccountId` called with correct account ID
- Check enrollment status in delegate

### Issue 6: Selective Wipe Not Working
- Implement `wipeDataForAccount:` delegate method
- Verify `doWipe` parameter in deregister call

## Support Boundaries

**Supported:** Integration guidance, SDK API usage, enrollment/policy issues, SDK crashes/bugs
**Unsupported:** Custom app development, MSAL issues separate from SDK, third-party library compatibility, App Store submission issues

## Scoping Questions
1. SDK version, Xcode version, iOS version
2. Enrollment method (MSAL integrated or SDK-handled)
3. Single or multi-identity app
4. Error codes from enrollment delegate
5. SDK diagnostic logs
6. Is app also MDM managed?
7. Can reproduce in sample app?

## Escalation
Escalate to Apps-Development SME team if: enrollment consistently fails, SDK crashes, policy enforcement unexpected, issue reproduces in Chatr sample app, or suspected SDK bug.

## App Wrapping Tool for iOS

For apps without source code access. Use `IntuneMAMPackager`:
```bash
./IntuneMAMPackager/Contents/MacOS/IntuneMAMPackager \
    -i ~/Desktop/MyApp.ipa -o ~/Desktop/MyApp_Wrapped.ipa \
    -p ~/Desktop/Provisioning_Profile.mobileprovision \
    -c "SHA-1-HASH-OF-CERTIFICATE" -v true
```

> Do NOT use both SDK and App Wrapping Tool on the same application.

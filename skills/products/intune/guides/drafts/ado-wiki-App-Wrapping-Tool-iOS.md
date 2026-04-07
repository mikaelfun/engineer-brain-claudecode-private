---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Develop and Customize/App Wrapping Tool for iOS"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FDevelop%20and%20Customize%2FApp%20Wrapping%20Tool%20for%20iOS"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# App Wrapping Tool for iOS

**Page Owner:** Leon Zhu (yihzhu@microsoft.com)

## About
macOS command-line tool that enables Intune APP on in-house iOS LOB apps without source code modification. Requires Xcode 16.0+.

## Key Apple Developer Concepts

### Signing Certificate
- SHA-1 fingerprint required as `-c` parameter
- Must have matching private key in macOS Keychain
- Expired cert: tool won't error but app won't install

### Provisioning Profile
- `.mobileprovision` linking App ID + Certificate + Distribution Method
- Need **In-House** profile (requires Apple Developer Enterprise account)
- Must include same entitlements as the app

### Entitlements
- Key-value pairs granting app permissions (App Groups, Keychain Sharing, Push, etc.)
- Must match between app and provisioning profile
- Use `-e` flag to strip missing entitlements (may break functionality)

### App Extensions
- Each extension needs its own provisioning profile via `-x` parameter
- Use `-xe` to inspect extensions and their required entitlements

## Prerequisites
- macOS with Xcode 16.0+
- Apple Developer Enterprise account
- In-House signing certificate + provisioning profile
- Entra ID app registration with Client ID and Redirect URI
- Input: `.ipa` or `.app`, unencrypted, iOS 16.0+

## Command-Line Parameters

| Param | Required | Description |
|-------|----------|-------------|
| `-i` | Yes | Input `.ipa`/`.app` path |
| `-o` | Yes | Output path |
| `-p` | Yes | Provisioning profile path |
| `-c` | Yes | SHA-1 hash of signing cert |
| `-ac` | Yes | Entra Client ID |
| `-ar` | Yes | Redirect URI |
| `-aa` | Single-tenant | Authority URI |
| `-v` | No | Verbose output |
| `-e` | No | Remove missing entitlements |
| `-xe` | No | Print extension info |
| `-x` | No | Extension provisioning profiles |
| `-ds` | No | Disable Safari WebView protection (SafariViewControllerBlockedOverride) |
| `-finishLaunching` | No | Fix Background App Refresh auth loops |

### `-ds` Deep Dive (SafariViewControllerBlockedOverride)
- Disables Intune hooks on SFSafariViewController/ASWebAuthenticationSession
- Use when: Cordova/React Native apps, non-WKWebView MSAL auth, passwordless via Authenticator
- **WARNING**: Disables protection for ALL Safari-based WebViews, not just auth

## Common GitHub Issues

| # | Issue | Root Cause | Fix |
|---|-------|------------|-----|
| 1 | #124 "damaged and can't be opened" | Ran from wrong directory | Run from mounted DMG path |
| 2 | #120/#121/#139 Stuck on splash | Missing `-ac`/`-ar` params | Register in Entra ID, use msauth redirect |
| 3 | #115 Invalid signing cert | Duplicate/expired/untrusted certs | Clean Keychain, reinstall |
| 4 | #111 AADSTS650057 | Missing MAM API permission | Add Microsoft Mobile Application Management permission |
| 5 | #116 Extension warning | CFBundleDocumentTypes triggers extension | Use `-x` for extension profiles |
| 6 | #130 MSAL auth loop | NSFileProtection + lifecycle delay | Use `-finishLaunching` flag |
| 7 | #123 White/black screen | SDK lifecycle event delay | Use `-finishLaunching` flag |
| 8 | #137 watchOS wrapping fails | watchOS not supported | Remove watchOS extension or use SDK |

## Troubleshooting Quick Reference

- **Invalid signing certificate**: Check duplicates, expiry, trust, intermediate certs in Keychain
- **Entitlements missing**: Create new profile with matching capabilities, or use `-e`
- **App fails to install**: Check cert/profile expiry, Bundle ID match
- **Input is encrypted**: Use original unencrypted build, not App Store download
- **App already wrapped**: Use original unwrapped version

## Scoping Questions
1. Apple Developer Enterprise account? 2. In-house LOB? 3. .ipa or .app? 4. iOS 16.0+? 5. Encrypted? 6. App extensions? 7. Entra ID registered? 8. Single/multi-tenant? 9. Tool version? 10. Cert/profile valid?

## Support Boundaries
| Supported | Not Supported |
|-----------|---------------|
| In-house LOB (.ipa/.app) | App Store apps |
| iOS 16.0+ | Below iOS 16.0 |
| Unencrypted | Encrypted apps |
| macOS + Xcode 16.0+ | Windows/Linux |

## SME Contact
Apps-Development SME team. For tool bugs: GitHub Issues page.

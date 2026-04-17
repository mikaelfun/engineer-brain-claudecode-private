# MSAL Android Package Inspector

Source: https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/app-integration/package-inspector-msal-android-native

## Purpose

Tool for troubleshooting Android MSAL signature hash mismatches. Lists installed packages and shows their signature hashes.

## When to Use

- App auth fails after publishing to Google Play Store (Google Play App Signing changes signature)
- "The redirect URI in the configuration file doesn't match" error
- "Intent filter for: BrowserTabActivity is missing" error

## Installation

1. Clone MSAL Android repo: `https://github.com/AzureAD/microsoft-authentication-library-for-android.git`
2. Open **root package** (not package-inspector dir) in Android Studio
3. Select `package-inspector` from run config dropdown
4. Run on device/emulator

## Common Issues

### Not all packages visible (Android 11+ / API 30+)

Add to `AndroidManifest.xml` in package-inspector:
```xml
<permission android:name="android.permission.QUERY_ALL_PACKAGES" />
<queries>
    <intent>
        <action android:name="android.intent.action.MAIN" />
    </intent>
</queries>
```

## Related

- entra-id-mslearn-017: Android app auth fails after Google Play publish

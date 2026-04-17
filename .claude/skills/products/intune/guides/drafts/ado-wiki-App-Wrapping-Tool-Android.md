---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Develop and Customize/App Wrapping Tool for Android"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FDevelop%20and%20Customize%2FApp%20Wrapping%20Tool%20for%20Android"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# App Wrapping Tool for Android

**Page Owner:** Leon Zhu (yihzhu@microsoft.com)

## About the Intune App Wrapping Tool for Android

The Microsoft Intune App Wrapping Tool for Android is a **Windows command-line application (PowerShell)** that enables Intune App Protection Policies (APP) on in-house Android line-of-business (LOB) apps **without modifying the app's source code**.

> **NOTE**: Only for in-house LOB apps — cannot be used on apps from Google Play Store.
> **WARNING**: Must run on Windows 10+ with Java Runtime Environment (JRE) installed.

### Key Differences vs. iOS App Wrapping Tool

| Aspect | Android | iOS |
|--------|---------|-----|
| OS Requirement | Windows 10+ | macOS with Xcode |
| Input Format | `.apk` | `.ipa` or `.app` |
| Signing Method | Java Keystore (`.jks`/`.keystore`) | Apple certificate + provisioning profile |
| MSAL Parameters | Not required at wrap time | Required (`-ac`, `-ar`) |
| Command Interface | PowerShell (`Invoke-AppWrappingTool`) | Bash (`IntuneMAMPackager`) |

## Key Android Developer Concepts

### Android APK
APK (Android Package Kit) — ZIP archive containing compiled bytecode, resources, AndroidManifest.xml, and signing metadata. The App Wrapping Tool requires an unsigned or previously signed APK as input.

### Android App Bundle (AAB)
AAB is NOT supported directly. Must be converted to universal APK using Google's `bundletool` before wrapping.

### Java Keystore and Signing
- Android requires all APKs to be signed before installation
- **Critical**: App upgrades MUST be signed with the same certificate as the original version
- If keystore is lost, app cannot be upgraded — must publish under a different package name

### DEX Size Limit
64K method reference limit per DEX file. MAM SDK adds classes during wrapping which can exceed this limit.
- Min API ≥ 21: Automatically handled (as of v1.0.2501.1)
- Min API < 21: Use `-UseMinAPILevelForNativeMultiDex` flag

## How It Works

1. Takes original `.apk` as input
2. Injects Intune MAM SDK classes into DEX bytecode
3. Modifies AndroidManifest.xml
4. Outputs **unsigned** wrapped `.apk` — must be signed before deployment

## Prerequisites

| Requirement | Details |
|-------------|---------|
| OS | Windows 10+ |
| Java | Latest version, 64-bit recommended |
| Input | `.apk` only (`.aab` must convert first) |
| App target | Android 9.0 (API 28)+ |
| App must be | Unencrypted, not previously wrapped, in-house LOB |

## Step-by-Step

### Step 1: Convert AAB to APK (if needed)
```powershell
java -jar bundletool.jar build-apks --bundle=input.aab --mode=universal --output=input.apks
Rename-Item input.apks input.zip
Expand-Archive input.zip -DestinationPath .\extracted
# Use .\extracted\universal.apk
```

### Step 2: Download and Install
Download `InstallAWT.exe` from GitHub: https://github.com/microsoftconnect/intune-app-wrapping-tool-android

### Step 3: Import PowerShell Module
```powershell
Import-Module "C:\Program Files (x86)\Microsoft Intune Mobile Application Management\Android\App Wrapping Tool\IntuneAppWrappingTool.psm1"
```

### Step 4: Run the Tool
```powershell
Invoke-AppWrappingTool -InputPath "C:\Apps\HelloWorld.apk" -OutputPath "C:\Apps\HelloWorld_wrapped.apk" -Verbose
```

### Step 5: Sign the Wrapped APK
```powershell
apksigner sign --ks "C:\certs\my-release-key.jks" --ks-key-alias "my-key-alias" --out "C:\Apps\HelloWorld_wrapped_signed.apk" "C:\Apps\HelloWorld_wrapped.apk"
```

### Step 6: Upload to Intune Admin Center

## Common GitHub Issues

| Issue | Symptom | Root Cause | Resolution |
|-------|---------|------------|------------|
| #109 | UnsupportedClassVersionError | Java 8 too old, need Java 11+ | Upgrade JRE |
| #105 | resource android:style/... is private | App uses private framework resources | Test latest tool version or use App SDK |
| #108 | Smali failed writing to DEX | Azure Identity/Key Vault lib conflicts | Use Intune App SDK instead |
| #113 | App target API 36 > MAM target 35 | Tool MAM SDK only supports API 35 | Lower targetSdkVersion or wait for update |
| #119 | Flutter crash NullPointerException MAMFragment | Gradle 8.2+ incompatible output | Downgrade Gradle or use App SDK |

## Troubleshooting

- **"The app has already been wrapped"**: Use original unwrapped APK
- **Java not found**: Install 64-bit JRE, set PATH
- **APK install failure**: Sign with apksigner/jarsigner, use same cert for upgrades
- **DEX overflow**: Update tool (≥v1.0.2501.1) or use `-UseMinAPILevelForNativeMultiDex`
- **OutputPath failure**: Use different directory than InputPath
- **App crashes after wrapping**: Consider Intune App SDK for complex apps
- **Upload fails**: Sign APK before upload; same cert for updates

## Scoping Questions

1. Tool version? 2. App min SDK level? 3. Input .apk or .aab? 4. Error message/log? 5. Signed before upload? 6. Previously deployed? Same cert? 7. New or upgrade? 8. Package name? 9. Error at wrap time or runtime? 10. Previously wrapped?

## Support Boundaries

| Supported | Not Supported |
|-----------|---------------|
| In-house LOB apps as APK | Google Play Store apps |
| Android 9.0 (API 28)+ | Older than Android 9.0 |
| APK input | AAB input directly |
| Not previously wrapped | Re-wrapping |

## SME Contact
For escalations: Intune App Management SME team. Include: tool version, full PowerShell log, AndroidManifest.xml, error/logcat output.

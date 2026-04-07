---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Develop and Customize/App SDK for Android"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FDevelop%20and%20Customize%2FApp%20SDK%20for%20Android"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Intune App SDK for Android Workflow

## What is the Intune App SDK for Android

The Microsoft Intune App SDK for Android lets you incorporate Intune app protection policies (APP/MAM policies) into native Android apps.

**SDK Files:**
- Microsoft.Intune.MAM.SDK.aar: Main SDK components
- Microsoft.Intune.MAM.SDK.Support.v4/v7/v17.jar: Support library classes
- Microsoft.Intune.MAM.SDK.Support.Text.jar: Text package support
- Microsoft.Intune.MAM.SDK.DownlevelStubs.aar: Stubs for newer device classes
- com.microsoft.intune.mam.build.jar: Gradle plugin

**Requirements:**
- Android API 28 (Android 9.0) through Android API 34 (Android 14) fully supported
- API 34 requires Intune App SDK v10.0.0 or later
- APIs 26-27 in limited support; Company Portal not supported below API 26; APP not supported below API 28
- Company Portal app must be present on device for app protection policies

## Two approaches to MAM-enable an app:

| Approach | Use When |
|----------|----------|
| **App SDK integration** | Customer has source code access |
| **App Wrapping Tool** | Customer only has compiled binary |

## Gradle Build Plugin Configuration

```gradle
buildscript {
    repositories { jcenter() }
    dependencies {
        classpath "org.javassist:javassist:3.22.0-GA"
        classpath files("$PATH_TO_MAM_SDK/GradlePlugin/com.microsoft.intune.mam.build.jar")
    }
}
apply plugin: 'com.microsoft.intune.mam'
```

**includeExternalLibraries**: Include a library if it has classes with MAM equivalents (Activity, Fragment, ContentProvider, Service) AND the app uses those classes.

## Scoping Questions (SDK)

1. New development or previously working application?
2. Any updates made to the application?
3. Multiple users impacted? Same device model/OS?
4. Android version on affected device?
5. SDK version used?
6. What errors are observed?

**Additional checks:**
- Check Android SDK Version used (GitHub)
- Check GitHub issues for known problems
- Company Portal version
- IDE: Android Studio or Visual Studio (Xamarin)
- Using both Wrapper and SDK? (should not)

## Troubleshooting Scenarios

**Scenario 1 - Setting up new environment:**
- Customer cannot use the Wrapper
- Resolution: Refer to public docs and Android SDK Workflow

**Scenario 2 - Build process fails after incorporating MAM:**
- Possible causes: compatibility issues with framework/IDE build tools, Gradle packaging issues
- Resolution: Check Azure App Registration scope/permissions; try lower library versions; ICM if lower version works

**Scenario 3 - App crashes at launch with signature mismatch:**
- Error: `java.lang.SecurityException: Signature mismatch for package <package_name>`
- Follow stacktrace to determine if Intune SDK related or project related

## App Wrapping Tool for Android

The App Wrapping Tool runs from PowerShell on Windows:
```powershell
Import-Module .\IntuneAppWrappingTool.psm1
Invoke-AppWrappingTool [-InputPath] <String> [-OutputPath] <String> -KeyStorePath <String> -KeyStorePassword <SecureString> -KeyAlias <String> -KeyPassword <SecureString> [-SigAlg <String>]
```

**Support Boundaries:**
- Supported: syntax help, wrap errors, functionality loss after wrapping, crashes after wrapping
- Unsupported: LOB app crashes with or without wrapping (refer to app vendor); wrapping public Google Play Store apps

## Required Data Collection

- Affected User: UPN, User ID
- Affected Device: Serial Number, Device Name, Intune Device ID
- App type: Store/Managed Store, Application ID, SDK/Wrapper version
- Logs: Company Portal logs, Build logs/ADB LogCat, App protection logs
- Video of actual issue (optional)
- LOB APK file or source code

## Getting Help

- Teams Channel: Apps-Development
- GitHub Issues: https://github.com/msintuneappsdk/ms-intune-app-sdk-android/issues
- Sample App: https://github.com/msintuneappsdk/Taskr-Sample-Intune-Android-App

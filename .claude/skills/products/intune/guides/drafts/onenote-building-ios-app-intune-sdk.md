# Building a Sample iOS Application with Intune SDK (XCode)

> Source: OneNote MCVKB/Intune/iOS — Lab walkthrough

## Overview

Step-by-step instructions for integrating Intune App SDK into a new iOS application using XCode + Objective-C.

## Steps

### 1. Create XCode Project

- New XCode project → Single-View → Objective-C
- Add UI elements (buttons/labels) in Main.storyboard
- Connect buttons/labels to `ViewController.h`
- Create event handlers in `ViewController.m`

### 2. Add Intune iOS SDK

- Download latest SDK: https://github.com/msintuneappsdk/ms-intune-app-sdk-ios
- Follow Steps 1-6 from [official guide](https://docs.microsoft.com/en-us/intune/developer/app-sdk-ios#build-the-sdk-into-your-mobile-app)

### 3. Run IntuneMAMConfigurator

- **Common issue**: File lacks execute permissions
  - Fix: `sudo chmod 777 IntuneMAMConfigurator`
  - macOS may block: Go to **System Preferences > Security & Privacy > General** → Allow
- Run IntuneMAMConfigurator specifying the `info.plist` and entitlement file

### 4. Add ADAL/MSAL via CocoaPods

```bash
pod init
# Edit Podfile to add ADAL
pod install
```

- Close XCode, reopen the `.xcworkspace` file (not `.xcodeproj`)

### 5. Register App in Azure Portal

- Register application
- Add redirect URL
- Add **Microsoft Mobile Application Management** API permission

### 6. Configure IntuneMAMSettings

- Add `IntuneMAMSettings` dictionary to app's Info.plist:
  - `ADALClientId` — App registration client ID
  - `ADALRedirectUri` — Redirect URI from app registration

## Useful Links

- [Configure ADAL/MSAL for Intune SDK](https://docs.microsoft.com/en-us/intune/developer/app-sdk-ios#configure-adalmsal)
- [Azure AD Library for Obj-C](https://github.com/AzureAD/azure-activedirectory-library-for-objc)
- [CocoaPods](https://cocoapods.org/)

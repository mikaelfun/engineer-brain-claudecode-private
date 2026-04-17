# Intune Android MAM 与 App Protection — 排查工作流

**来源草稿**: ado-wiki-Android-App-Deployment.md, ado-wiki-Android-Device-Config.md, ado-wiki-App-Protection-Android.md, ado-wiki-App-Protection-Policies.md, ado-wiki-App-Protection-iOS.md, ado-wiki-App-SDK-for-Android.md, ado-wiki-App-SDK-for-iOS.md, ado-wiki-App-Wrapping-Tool-Android.md, ado-wiki-App-Wrapping-Tool-iOS.md, ado-wiki-Teams-Android-Collecting-Logs.md, ado-wiki-WIP-App-Protection.md, ado-wiki-Windows-MAM.md, ado-wiki-Zebra-Support.md, ado-wiki-a-teams-devices-android-assorted.md, ado-wiki-b-Android-Bug-Report.md, mslearn-troubleshoot-app-protection-policy-deployment.md, mslearn-troubleshoot-mam-user-issues.md, onenote-android-debug-log-collection.md, onenote-android-log-collection-guide.md, onenote-app-protection-edge-windows.md, onenote-app-sdk-vs-wrapping-tool.md, onenote-ios-mam-logs-3rd-party-app.md, onenote-mam-applied-kusto-queries.md, onenote-mam-edge-windows.md, onenote-mam-log-analysis-keywords.md, onenote-mam-logs-3rd-party-ios.md, onenote-mam-timeout-setting.md, onenote-wrap-android-apk.md
**Kusto 引用**: mam-policy.md
**场景数**: 134
**生成日期**: 2026-04-07

---

## Portal 路径

- `1. Open Settings > System > About Device`
- `Intune > Troubleshooting > Policy`
- `Portal > Settings > Diagnostic Logs > Save Logs`
- `3. Go to iExplorer > Preferences > check`
- `1. Open **Settings > System > About Device`
- `2. Go to Applications > Intune > Troubleshooting > Policy`
- `6. Go to **Settings > System > Developer Options`
- `Intune > IOS logs > Gather MAM logs from 3rd party app`
- `2. Open **Company Portal > Settings > Diagnostic Logs > Save Logs`
- `2. Go to iOS **Settings** > find the app >`

## Scenario 1: 安装失败（Install Failed）
> 来源: ado-wiki-Android-App-Deployment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. 查看 OMADM 日志，找 `"Error installing application <app name>, result code: <code>"` 
2. 该 result code 来自 Android OS，搜索此 Android 错误码获取详情
3. 常见失败原因：
   - APK 文件损坏（bad APK）
   - 设备未允许来自未知来源的安装
   - APK 未签名

## Scenario 2: 可用应用安装后状态不更新
> 来源: ado-wiki-Android-App-Deployment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

**原因**：状态通过 IWS（非设备直接上报）更新，安装完成后需 1-2 分钟延迟。离开页面后不再自动刷新。
**解决**：离开 App Details 页面后重新导航回来手动刷新。

## Scenario 3: 如何检查 LOB APK 版本
> 来源: ado-wiki-Android-App-Deployment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

使用 Android Studio 打开 .apk 文件，查看根目录下 `AndroidManifest.xml`：
```xml
<manifest ... android:versionCode="3" android:versionName="1.0" ...>
```
- `android:versionCode`：构建号，Intune 依赖此值判断是否有更新
- `android:versionName`：显示给用户的版本号
- **更新的 APK versionCode 必须高于现有版本**

## Scenario 4: 排查工具和资源
> 来源: ado-wiki-Android-App-Deployment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- OMADM 日志分析：参考 ContentIdea#121254 (How to Analyze OMADM Log)
- Available Installs 排查：KB4612733
- Required Installs 排查：KB4612734
- 完全托管 Android Enterprise 设备 debug 日志：KB4570081

## Kusto 查询

参考 Intune 通用 Kusto 最佳实践（见 Intune: Kusto Examples and Best Practices evergreen topic）。

## 培训资料

- Microsoft Endpoint Manager - Intune - Client Apps - Part VIII - Apps — Android（视频链接见 Wiki）
- Intune Deep Dive Walkthroughs（产品团队）

## 获取帮助

- App Deployment Teams Channel：https://teams.microsoft.com/...（App Deployment 频道）
- 如 1 个工作日内无回复，通过 TA/Lead 提交 Assistance Request
- SME 联系：https://aka.ms/IntuneSMEs

## Scenario 5: Enrollment Types
> 来源: ado-wiki-Android-Device-Config.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Method | Acronym | Type | DPC |
|--------|---------|------|-----|
| AE Work Profile | BYOD | UserEnrollment | Company Portal |
| AE Fully Managed | COBO | AndroidEnterpriseFullyManaged | Android Device Policy |
| AE Dedicated | COSU | AndroidEnterpriseDedicatedDevice | Android Device Policy |
| COSU + Entra Shared Mode | COSU-Shared | AndroidEnterpriseDedicatedDevice | Android Device Policy + Authenticator |
| AE Corp-Owned Work Profile | COPE | AndroidEnterpriseCorporateWorkProfile | Android Device Policy |
| Device Administrator | DA | UserEnrollment (Legacy) | Company Portal |
| AOSP (User/Userless) | AOSP | Limited info | - |

## Support Boundaries
- All Android device config issues are owned by Intune support
- **Do NOT tell customer to contact Google** - Google does not have enterprise support for customers
- If issue is suspected with Android OS, Intune PG can create support ticket with Google PG
- SE/SEEs do not have access to Intune PG <=> Google PG tickets

## DA (Legacy) - Deprecating
- Ending support for DA on devices with GMS (August 2024)
- Supported custom profiles: Wi-Fi PSK, Per-app VPN, Samsung Knox apps, MDE web protection
- If custom profile not in supported list → not supported (may still work, but won't investigate)
- Knox-specific settings require device on Knox supported devices list

## AE Work Profile (BYOD) Custom Profiles
Supported only:
- `./Vendor/MSFT/WiFi/Profile/SSID/Settings`
- `./Vendor/MSFT/VPN/Profile/Name/PackageList`
- `./Vendor/MSFT/WorkProfile/DisallowCrossProfileCopyPaste`

## OEMConfig
- Applies to ALL AE enrollment types
- Functions like app config policy but acts as device configuration
- App must be added to managed Google Play and installed on device
- Samsung Knox Service Plugin: https://docs.samsungknox.com/admin/knox-service-plugin/policies.html

## Managed Home Screen (MHS)
- For dedicated devices in multi-app kiosk mode
- Functions as app config policy
- Setup guide: https://techcommunity.microsoft.com/t5/intune-customer-success/how-to-setup-microsoft-managed-home-screen-on-dedicated-devices/ba-p/1388060

## Log Collection
- **OMADMLog.log**: CP ↔ OS communication, enforcement verification
- **CompanyPortal.log**: CP ↔ Intune service, enrollment issues
- **BrokerAuth.log**: Authentication/Azure registration
- **Sysdump.log**: Samsung-specific (collected only if Samsung requests)
- Enable verbose logging: https://learn.microsoft.com/en-us/mem/intune/user-help/use-verbose-logging-to-help-your-it-administrator-fix-device-issues-android

## Kusto Queries

## Scenario 6: BYOD Work Profile - Policy Status
> 来源: ado-wiki-Android-Device-Config.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kusto
DeviceManagementProvider
| where env_time > ago(3d)
| where deviceId == 'deviceId'
| where applicablilityState == "Applicable"
| where typeAndCategory == "ConfigurationPolicy;None"
| project env_time, name, typeAndCategory, applicablilityState, reportComplianceState, policyId, id, EventMessage, ActivityId, I_App, scenarioType
```

## Scenario 7: BYOD Work Profile - Individual Settings
> 来源: ado-wiki-Android-Device-Config.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kusto
IntuneEvent
| where env_time > ago(10d)
| where DeviceId == "deviceId"
| where Col1 startswith "Done processing rule"
| project env_time, Message=['Col1'], Status=['Col4'], PolicyID=['Col3'], DeviceId, UserId, ComponentName, ActivityId, EventUniqueName
```

## Scenario 8: Corporate-Owned (COBO/COSU/COPE) - Individual Settings
> 来源: ado-wiki-Android-Device-Config.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kusto
IntuneEvent
| where env_time between(datetime(start) .. datetime(end))
| where DeviceId has "deviceID"
| where EventUniqueName == "ProcessedSetting"
| project env_time, ComponentName, EventUniqueName, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, Message
```

## Scenario 9: Assist365 Troubleshooting
> 来源: ado-wiki-Android-Device-Config.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Select correct tenant
2. Go to Applications > Intune > Troubleshooting > Policy
3. Search by policy ID (preferred over name)
4. Verify PolicyPlatformType and PolicyTypeName:
   - BYOD: `AndroidWorkProfile` / `AndroidWorkProfileGeneralDeviceConfiguration`
   - COBO/COSU/COPE: `AndroidForWork` / `AndroidDeviceOwnerGeneralDeviceConfiguration`
5. Review settings values in policy body
6. Check Assignments section for assigned groups

## DCR Guidance
- Check Android Enterprise developer doc: https://developers.google.com/android/work/requirements
- Not listed → Google needs to implement first (DCR rejected)
- "Not applicable" for target enrollment type → Google needs to implement first
- Standard/optional feature → valid Microsoft DCR

## Getting Help
- Teams: Device Config - Certificates, Email, VPN and Wifi channel
- Document: User ID, license, Intune device ID, device model/OS, serial number, enrollment method, policy name/ID/type, assigned groups

## Scenario 10: Interaction with Android OS
> 来源: ado-wiki-App-Protection-Android.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

The Intune App SDK requires changes to an app's source code to enable app management policies. This is done through the replacement of the android base classes with equivalent managed classes, referred to with the prefix MAM. The SDK classes live between the Android base class and the app's own derived version of that class.

## Scenario 11: Interaction with the Company Portal
> 来源: ado-wiki-App-Protection-Android.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

The Intune App SDK for Android relies on the presence of the Company Portal app on the device for enabling MAM policies. When the Company Portal app is not present, the behavior of the MAM enabled app will not be altered. When the Company Portal is installed and has policy for the user, the SDK entry points are initialized asynchronously.

## FAQ

1. **Why is the Company Portal app needed?** Much of app protection functionality is built into the Company Portal app. Device enrollment is not required even though the Company Portal app is always required. For MAM-WE, the end user just needs to have the Company Portal app installed.

2. **Multiple access settings order**: Block takes precedence, then dismissible warning. App version requirement > Android OS version > Android patch version.

3. **SafetyNet Attestation**: Google Play service determination reported at interval determined by Intune service. If no data, access allowed depending on other checks. **SafetyNet API is deprecated → replaced by Play Integrity API.**

4. **Verify Apps API**: User needs to go to Google Play Store > My apps & games > last app scan > Play Protect menu > toggle "Scan device for security threats" to on.

5. **SafetyNet check values**: 'Check basic integrity' - general device integrity (rooted/emulator/tampered fail). 'Check basic integrity & certified devices' - additionally requires Google certification.

6. **Manual device integrity check**: Sign-in Google account > Play Store > Settings > About > tap Play Store version 7x > Settings > General > Developer options > Play Integrity > Check integrity.

7. **SafetyNet vs jailbroken/rooted setting**: SafetyNet requires online. 'Jailbroken/rooted' works offline. Both recommended for layered approach.

8. **Dedicated devices**: APP not supported on Android Enterprise dedicated devices without Shared device mode. Supported with Shared device mode and AOSP userless devices with Shared device mode.

9. **Microsoft Teams Android devices**: Teams on Microsoft Teams Android devices does NOT support APP. Create exclusion group for Teams device users.

## Scenario 12: Prerequisites
> 来源: ado-wiki-App-Protection-Android.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. User must have a Microsoft Entra ID account
2. User must have an Intune license assigned
3. User must sign in with work account targeted by app protection policy
4. Company Portal app required for Android
5. Device must have access to Intune required endpoints
6. Targeted app must be integrated with Intune App SDK

## Scoping Questions

1. What is the UPN? Does it have an Intune license?
2. Affected OS platform? When did problem start? How many users/devices impacted?
3. Device state: Managed, Unmanaged (MAM-WE), or MAM-WE on third-party MDM?
4. All apps or specific app? Store app or LOB? SDK or Wrapper? SDK version?
5. Behavior or error message? Steps to reproduce?

## Scenario 13: Troubleshooting Steps
> 来源: ado-wiki-App-Protection-Android.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Review public troubleshooter: [Troubleshooting app protection policy deployment](https://learn.microsoft.com/en-us/troubleshoot/mem/intune/app-protection-policies/troubleshoot-app-protection-policy-deployment)
- Recommend device updates
- Try reproducing in test tenant
- Narrow down to specific models/devices
- Document UPN and email of affected users
- Collect OMADM and Company Portal logs via PowerLift
- Review Company Portal log for 'MAM Service sign in succeeded'
- Review App protection policy settings logs
- Review App Protection logs on device

## Scenario 14: Known Issues
> 来源: ado-wiki-App-Protection-Android.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- KB 3153257: Phone number in meeting shows "no available apps"
- KB 4022831: App Protection can Save As PDF when policy is set to No
- KB 4490475: Android MAM policy not restricting data transfer to Google Maps
- ICM 56976609: Rooted Android devices can access MAM policy database files to bypass policy
- ICM 57208740: MAM WE Root detection can be bypassed on certain Android ROMs

## Scenario 15: Encryption
> 来源: ado-wiki-App-Protection-Policies.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- **iOS**: Native iOS 256-bit AES encryption (requires device-level PIN)
- **Android**: OpenSSL 256-bit AES + Android Keystore (FIPS 140-2 validated)
- **Windows (WIP)**: Native EFS (Encrypted File System) — WIP EOL end of 2022

## Scenario 16: Platform Differences
> 来源: ado-wiki-App-Protection-Policies.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- **iOS**: SDK per application, Apple Keychain may cache token data
- **Android**: Company Portal required as broker (processes ~80% of SDK), must be installed for ANY Android device
- **Windows**: Uses WIP (EnterpriseDataProtection + Applocker CSP), best-effort protection level

## Scenario 17: Prerequisites for APP
> 来源: ado-wiki-App-Protection-Policies.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Three items must be met:
1. Targeted UPN must resolve in Azure AD
2. UPN must have active Intune license
3. Application must have Intune SDK integrated

**iOS additional**: MAMUPN string must be created and assigned to each application for proper identity.

## Support Boundaries

- MAM policies should NOT be used with third-party MAM or secure container solutions
- On-Premises Skype/Exchange requires Hybrid Modern Auth
- None of the data protection settings control Apple managed Open-In feature on iOS/iPadOS
- Only data marked as "corporate" is encrypted
- BYOD without MDM: can't deploy apps, can't provision certificates, can't provision Wi-Fi/VPN

## Scoping Questions

1. UPN of Azure AD account? Does it have Intune license?
2. Affected OS platform (Android/iOS)? iOS 15.0+ or Android 8.0+
3. Device state: Managed (Intune), Unmanaged (MAM-WE), or 3rd-party MDM?
4. All apps affected or specific app? Store app or LOB?
5. Behavior or error message? Steps to reproduce?
6. Collect app protection logs (Company Portal, MAM, Outlook diagnostics)
7. Screenshots of APP settings
8. Reproducible or intermittent?
9. Any Conditional Access Policies with "Require app protection policy"?

## Kusto Query

```kql
AmsActivityForUser("Insert Entra ID User ID", start=datetime(2024-01-10T00:00:00Z), end=datetime(2024-01-12T13:05:00Z))
| project env_time, ['type'], statusCode, AppId, Os, DeviceId, AppVersion, SdkVersion, ManagementLevel, AppFriendlyName, PolicyState, DeviceModel
```
`[来源: ado-wiki-App-Protection-Policies.md]`

## Scenario 18: Platform-Specific Troubleshooting
> 来源: ado-wiki-App-Protection-Policies.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Android: See /App Protection/Android wiki page
- iOS: See /App Protection/iOS wiki page
- Windows: See /App Protection/WIP wiki page (WIP is EOL)

## SME Contacts

- ATZ: Jeffrey Ault, Steve Bucci (leads); Dylan Sturm, Dina Hennen, Martin Kirtchayan, Carlos Fernandez, Reethan Raj
- EMEA: Mihai Lucian Androne (lead); Mohammad Bazzari, Hossam Remawi, Fadi Jweihan
- APAC: Joe Yang, Ulysse Rugwiro (leads)

## Scenario 19: Device fingerprint or face IDs
> 来源: ado-wiki-App-Protection-iOS.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Intune app protection policies allow control over app access to only the Intune licensed user. One of the ways to control access to the app is to require either Apple's Touch ID or Face ID on supported devices. Intune implements a behavior where if there is any change to the device's biometric database, Intune prompts the user for a PIN when the next inactivity timeout value is met. Changes to biometric data include the addition or removal of a fingerprint, or face. If the Intune user does not have a PIN set, they are led to set up an Intune PIN.

## Scenario 20: iOS Share Extension
> 来源: ado-wiki-App-Protection-iOS.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

You can use the iOS/iPadOS share extension to open work or school data in unmanaged apps, even with the data transfer policy set to managed apps only or no apps. Intune app protection policy cannot control the iOS/iPadOS share extension without managing the device. Therefore, Intune encrypts "corporate" data before it is shared outside the app.

## Scenario 21: Universal Links Support
> 来源: ado-wiki-App-Protection-iOS.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

By default, Intune app protection policies will prevent access to unauthorized application content. Users can disable an app's Universal Links by visiting them in Safari and selecting Open in New Tab or Open. To re-enable, the end user would need to do an Open in <app name> in Safari after long pressing a corresponding link.

Internal article: https://microsoftapc.sharepoint.com/teams/IntuneMAMUniversalLinks2

## Scenario 22: Multiple Access Settings Precedence
> 来源: ado-wiki-App-Protection-iOS.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Intune app protection policies for access will be applied in a specific order: a wipe takes precedence, followed by a block, then a dismissible warning. Intune SDK version requirement takes precedence over app version requirement, followed by iOS/iPadOS operating system version requirement.

## Scenario 23: Collect Initial Data
> 来源: ado-wiki-App-Protection-iOS.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. UPN or Work/School account of affected user
2. Which policy setting isn't applied? Is any policy applied?
3. User experience - installed and started targeted app?
4. When did problem start? Has app protection ever worked?
5. Which platform (Android or iOS)?
6. How many users/devices affected?
7. Using Intune or third-party EMM?
8. All managed apps or only specific apps affected?
9. Collect App Protection logs
10. Verify prerequisites

## Scenario 24: Log Collection
> 来源: ado-wiki-App-Protection-iOS.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- MAM logs: https://learn.microsoft.com/en-us/troubleshoot/mem/intune/app-protection-policies/troubleshoot-app-protection-policy-deployment#step-6-collect-device-data-with-microsoft-edge
- Outlook Logs: https://learn.microsoft.com/en-us/exchange/clients-and-mobile-in-exchange-online/outlook-for-ios-and-android/outlook-for-ios-and-android-faq
- MAM diagnostic report on iOS: https://www.youtube.com/watch?v=VKCuroZUON8
- Company Portal logs: https://www.youtube.com/watch?v=_z3XszE1SP0
- Xcode logs: https://learn.microsoft.com/en-us/mem/intune/user-help/retrieve-ios-app-logs

## Scenario 25: Key Troubleshooting Articles
> 来源: ado-wiki-App-Protection-iOS.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- [Troubleshooting app protection policy deployment](https://learn.microsoft.com/en-us/troubleshoot/mem/intune/app-protection-policies/troubleshoot-app-protection-policy-deployment)
- [Troubleshooting user issues](https://learn.microsoft.com/en-us/troubleshoot/mem/intune/app-protection-policies/troubleshoot-mam)
- [Troubleshooting data transfer between apps](https://learn.microsoft.com/en-us/troubleshoot/mem/intune/app-protection-policies/troubleshoot-data-transfer)
- [Troubleshoot cut, copy, paste](https://learn.microsoft.com/en-us/troubleshoot/mem/intune/app-protection-policies/troubleshoot-cut-copy-paste)
- [Data transfer exemptions](https://learn.microsoft.com/en-us/troubleshoot/mem/intune/app-protection-policies/troubleshoot-data-transfer-exemptions)
- [Common data transfer scenarios](https://learn.microsoft.com/en-us/troubleshoot/mem/intune/app-protection-policies/data-transfer-scenarios)
- [APP delivery timing](https://learn.microsoft.com/en-us/mem/intune/apps/app-protection-policy-delivery)
- [Review client app protection logs](https://learn.microsoft.com/en-us/mem/intune/apps/app-protection-policy-settings-log)

## Scenario 26: Scenarios
> 来源: ado-wiki-App-Protection-iOS.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Set up and validate APP for managed iOS devices: https://support.microsoft.com/en-US/help/4482726
- Deploy APP based on device management state: https://internal.evergreen.microsoft.com/en-US/help/4461231
- Enable APP with Office mobile preview app: https://internal.evergreen.microsoft.com/en-US/help/4534332
- Adobe Acrobat for Intune setup: Intune Deployments - Acrobat Reader Mobile Enterprise Deployment
- Prevent saving from OneDrive to Dropbox/Google Drive/Box: https://internal.evergreen.microsoft.com/en-us/help/3157987
- Mobile Threat Defense for unenrolled devices: https://internal.evergreen.microsoft.com/en-us/help/4531379

## Scenario 27: Troubleshooting Scenarios
> 来源: ado-wiki-App-SDK-for-Android.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

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

## Scenario 28: Authentication Flow Options
> 来源: ado-wiki-App-SDK-for-iOS.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. **App Handles Authentication (Recommended)** — App integrates MSAL, handles sign-in, passes accountId to SDK via `registerAndEnrollAccountId`
2. **SDK Handles Authentication** — SDK handles MSAL auth for simple apps via `loginAndEnrollAccount`
3. **Auto-Enrollment at Launch** — `AutoEnrollOnLaunch=YES` + `MAMPolicyRequired=YES` (cannot submit to App Store)

## Scenario 29: Critical: Account ID
> 来源: ado-wiki-App-SDK-for-iOS.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Use `tenantProfile.identifier` (Entra Object ID), NOT `account.identifier`.

```objc
NSString *accountId = msalResult.tenantProfile.identifier;
[[IntuneMAMEnrollmentManager instance] registerAndEnrollAccountId:accountId];
```

## Scenario 30: SSO and Broker Authentication
> 来源: ado-wiki-App-SDK-for-iOS.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| SSO Type | Requirement |
|----------|-------------|
| Keychain SSO | Same keychain group, same Apple Developer account |
| Broker SSO | Authenticator app installed, broker enabled in MSAL |
| Web Browser SSO | User must allow cookie access |

## Scenario 31: Required Frameworks
> 来源: ado-wiki-App-SDK-for-iOS.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

MessageUI, Security, CoreServices, SystemConfiguration, libsqlite3, libc++, ImageIO, LocalAuthentication, AudioToolbox, QuartzCore, WebKit, MetricKit

## Scenario 32: Keychain Sharing
> 来源: ado-wiki-App-SDK-for-iOS.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```xml
<key>keychain-access-groups</key>
<array>
    <string>$(AppIdentifierPrefix)YOUR.BUNDLE.ID</string>
    <string>$(AppIdentifierPrefix)com.microsoft.intune.mam</string>
    <string>$(AppIdentifierPrefix)com.microsoft.adalcache</string>
</array>
```

## Scenario 33: IntuneMAMSettings (Info.plist)
> 来源: ado-wiki-App-SDK-for-iOS.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

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

## Scenario 34: Method 1: Via App Settings (Recommended)
> 来源: ado-wiki-App-SDK-for-iOS.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. iOS Settings → Your App → Microsoft Intune → "Display Diagnostics Console" ON
2. Launch app → "Collect Intune Diagnostics" screen
3. Enable verbose logging → Get Started → Reproduce issue
4. "Send Logs to Microsoft" → Record Reference ID

## Scenario 35: Method 2: Via Edge
> 来源: ado-wiki-App-SDK-for-iOS.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Navigate to `about:intunehelp` in Edge → Share Logs → Review IntuneMAMDiagnostics.txt

## Scenario 36: Verbose Logging
> 来源: ado-wiki-App-SDK-for-iOS.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```xml
<key>VerboseLoggingEnabled</key>
<true/>
```

## Scenario 37: Enrollment Status Codes
> 来源: ado-wiki-App-SDK-for-iOS.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

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

## Scenario 38: Issue 1: SDK Not Receiving Policy
> 来源: ado-wiki-App-SDK-for-iOS.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Check enrollment delegate for status code
- Verify user is in targeted group, app bundle ID in policy, Intune license assigned
- Ensure correct account ID (`tenantProfile.identifier`)

## Scenario 39: Issue 2: Keychain Errors
> 来源: ado-wiki-App-SDK-for-iOS.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Verify entitlements include `com.microsoft.intune.mam` and `com.microsoft.adalcache`
- Check provisioning profile supports keychain sharing

## Scenario 40: Issue 3: App Restart Loop
> 来源: ado-wiki-App-SDK-for-iOS.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Implement `IntuneMAMPolicyDelegate` and handle `restartApplication`
- Check for MDM/MAM app config conflicts

## Scenario 41: Issue 4: MSAL Token Acquisition Fails
> 来源: ado-wiki-App-SDK-for-iOS.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Verify client ID and redirect URI match app registration
- Enable MSAL verbose logging for diagnostics

## Scenario 42: Issue 5: Policy Not Applied After Sign-In
> 来源: ado-wiki-App-SDK-for-iOS.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Verify `registerAndEnrollAccountId` called with correct account ID
- Check enrollment status in delegate

## Scenario 43: Issue 6: Selective Wipe Not Working
> 来源: ado-wiki-App-SDK-for-iOS.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

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

## Scenario 44: Key Differences vs. iOS App Wrapping Tool
> 来源: ado-wiki-App-Wrapping-Tool-Android.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Aspect | Android | iOS |
|--------|---------|-----|
| OS Requirement | Windows 10+ | macOS with Xcode |
| Input Format | `.apk` | `.ipa` or `.app` |
| Signing Method | Java Keystore (`.jks`/`.keystore`) | Apple certificate + provisioning profile |
| MSAL Parameters | Not required at wrap time | Required (`-ac`, `-ar`) |
| Command Interface | PowerShell (`Invoke-AppWrappingTool`) | Bash (`IntuneMAMPackager`) |

## Key Android Developer Concepts

## Scenario 45: Android APK
> 来源: ado-wiki-App-Wrapping-Tool-Android.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

APK (Android Package Kit) — ZIP archive containing compiled bytecode, resources, AndroidManifest.xml, and signing metadata. The App Wrapping Tool requires an unsigned or previously signed APK as input.

## Scenario 46: Android App Bundle (AAB)
> 来源: ado-wiki-App-Wrapping-Tool-Android.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

AAB is NOT supported directly. Must be converted to universal APK using Google's `bundletool` before wrapping.

## Scenario 47: Java Keystore and Signing
> 来源: ado-wiki-App-Wrapping-Tool-Android.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Android requires all APKs to be signed before installation
- **Critical**: App upgrades MUST be signed with the same certificate as the original version
- If keystore is lost, app cannot be upgraded — must publish under a different package name

## Scenario 48: DEX Size Limit
> 来源: ado-wiki-App-Wrapping-Tool-Android.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

64K method reference limit per DEX file. MAM SDK adds classes during wrapping which can exceed this limit.
- Min API ≥ 21: Automatically handled (as of v1.0.2501.1)
- Min API < 21: Use `-UseMinAPILevelForNativeMultiDex` flag

## How It Works

1. Takes original `.apk` as input
2. Injects Intune MAM SDK classes into DEX bytecode
3. Modifies AndroidManifest.xml
4. Outputs **unsigned** wrapped `.apk` — must be signed before deployment

## Scenario 49: Step 1: Convert AAB to APK (if needed)
> 来源: ado-wiki-App-Wrapping-Tool-Android.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```powershell
java -jar bundletool.jar build-apks --bundle=input.aab --mode=universal --output=input.apks
Rename-Item input.apks input.zip
Expand-Archive input.zip -DestinationPath .\extracted
# Use .\extracted\universal.apk
```

## Scenario 50: Step 2: Download and Install
> 来源: ado-wiki-App-Wrapping-Tool-Android.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Download `InstallAWT.exe` from GitHub: https://github.com/microsoftconnect/intune-app-wrapping-tool-android

## Scenario 51: Step 3: Import PowerShell Module
> 来源: ado-wiki-App-Wrapping-Tool-Android.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```powershell
Import-Module "C:\Program Files (x86)\Microsoft Intune Mobile Application Management\Android\App Wrapping Tool\IntuneAppWrappingTool.psm1"
```

## Scenario 52: Step 4: Run the Tool
> 来源: ado-wiki-App-Wrapping-Tool-Android.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```powershell
Invoke-AppWrappingTool -InputPath "C:\Apps\HelloWorld.apk" -OutputPath "C:\Apps\HelloWorld_wrapped.apk" -Verbose
```

## Scenario 53: Step 5: Sign the Wrapped APK
> 来源: ado-wiki-App-Wrapping-Tool-Android.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```powershell
apksigner sign --ks "C:\certs\my-release-key.jks" --ks-key-alias "my-key-alias" --out "C:\Apps\HelloWorld_wrapped_signed.apk" "C:\Apps\HelloWorld_wrapped.apk"
```

## Scenario 54: Common GitHub Issues
> 来源: ado-wiki-App-Wrapping-Tool-Android.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Issue | Symptom | Root Cause | Resolution |
|-------|---------|------------|------------|
| #109 | UnsupportedClassVersionError | Java 8 too old, need Java 11+ | Upgrade JRE |
| #105 | resource android:style/... is private | App uses private framework resources | Test latest tool version or use App SDK |
| #108 | Smali failed writing to DEX | Azure Identity/Key Vault lib conflicts | Use Intune App SDK instead |
| #113 | App target API 36 > MAM target 35 | Tool MAM SDK only supports API 35 | Lower targetSdkVersion or wait for update |
| #119 | Flutter crash NullPointerException MAMFragment | Gradle 8.2+ incompatible output | Downgrade Gradle or use App SDK |

## Scenario 55: Troubleshooting
> 来源: ado-wiki-App-Wrapping-Tool-Android.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

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

## Scenario 56: Signing Certificate
> 来源: ado-wiki-App-Wrapping-Tool-iOS.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- SHA-1 fingerprint required as `-c` parameter
- Must have matching private key in macOS Keychain
- Expired cert: tool won't error but app won't install

## Scenario 57: Provisioning Profile
> 来源: ado-wiki-App-Wrapping-Tool-iOS.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- `.mobileprovision` linking App ID + Certificate + Distribution Method
- Need **In-House** profile (requires Apple Developer Enterprise account)
- Must include same entitlements as the app

## Scenario 58: Entitlements
> 来源: ado-wiki-App-Wrapping-Tool-iOS.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Key-value pairs granting app permissions (App Groups, Keychain Sharing, Push, etc.)
- Must match between app and provisioning profile
- Use `-e` flag to strip missing entitlements (may break functionality)

## Scenario 59: App Extensions
> 来源: ado-wiki-App-Wrapping-Tool-iOS.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Each extension needs its own provisioning profile via `-x` parameter
- Use `-xe` to inspect extensions and their required entitlements

## Scenario 60: `-ds` Deep Dive (SafariViewControllerBlockedOverride)
> 来源: ado-wiki-App-Wrapping-Tool-iOS.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Disables Intune hooks on SFSafariViewController/ASWebAuthenticationSession
- Use when: Cordova/React Native apps, non-WKWebView MSAL auth, passwordless via Authenticator
- **WARNING**: Disables protection for ALL Safari-based WebViews, not just auth

## Scenario 61: Troubleshooting Quick Reference
> 来源: ado-wiki-App-Wrapping-Tool-iOS.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

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

## Scenario 62: Steps
> 来源: ado-wiki-Teams-Android-Collecting-Logs.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Go to Teams Admin Center: https://admin.teams.microsoft.com/dashboard
2. Teams devices > Select applicable type (panels, phones, displays, etc.)
3. Select display name > Download device logs
4. Get screenshot of software health tab
5. Click History tab > Download when ready
6. In ZIP, find "SessionID_For_Company_Portal_Logs.txt"
7. Take EasyID or GUID from file
8. Search in PowerLift (Intune app): https://powerlift.acompli.net/#/incidents
9. All Intune-related files on the Files tab

If device cannot upgrade to >1449 and has no OEM portal, CP logs cannot be collected and device is likely out of support.

## Scenario 63: 1. Verify Policy Configuration
> 来源: ado-wiki-WIP-App-Protection.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Review policy type (with/without enrollment) in MEM portal
- Generate App protection report: Apps → Monitor → App protection status
- Check RAVE for WIP with enrollment policies

## Scenario 64: 2. Verify Device Prerequisites
> 来源: ado-wiki-WIP-App-Protection.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Windows 10 version compatibility
- MDM: device synced with Intune; MAM: device Azure AD registered
- WIP WE uses port 444/TCP — verify firewall allows it
- Licenses: Intune license required; MAM also needs Azure AD Premium

## Scenario 65: 3. Verify Policy Delivery to Device
> 来源: ado-wiki-WIP-App-Protection.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Generate MDM diagnostic report
- Check registry keys:
  - `HKLM\Software\Microsoft\Provisioning\Evaluator\PostProcess\EDP`
  - `HKLM\Software\Microsoft\EnterpriseResourceManager\Tracked\<id>\device\default`
  - `HKEY_LOCAL_MACHINE\software\microsoft\enterprisedataprotection\policies`
  - `HKLM\Software\Microsoft\PolicyManager\providers\<id>\default\device\DataProtection`
  - `HKLM\Software\Microsoft\PolicyManager\providers\<id>\default\device\NetworkIsolation`
- Verify AppLocker XML at: `C:\Windows\System32\AppLocker\MDM\GUID\8E20DDE6-26B0-4432-8566-77AACA2AEBC4\AppLocker\EnterpriseDataProtection`

## Scenario 66: 4. Verify App and File Context
> 来源: ado-wiki-WIP-App-Protection.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Task Manager → Details tab → "Enterprise Context" column
- Contexts: Personal, Exempt, Unenlightened, Enlightened, Enlightened (permissive)
- If context is wrong → verify app identity and version in WIP policy

## Scenario 67: 5. Device Logs
> 来源: ado-wiki-WIP-App-Protection.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- **EDP-AppLearning**: Event ID 401 — non-protected apps accessing corporate data
- **DeviceManagement-Enterprise-Diagnostics-Provider/Admin**: Event ID 404 — policy apply failures
- **Kusto**: DeviceManagementProvider table for CSP delivery status

## Scenario 68: 6. Common Issues
> 来源: ado-wiki-WIP-App-Protection.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

#### Direct Access conflicts with WIP
- Error: 0x807C0003 on EDPEnforcementLevel CSP
- Cause: Direct Access enabled on device
- Fix: Disable Direct Access or check EDP CSP pre-check errors

#### File encryption fails
- Check EFS service is running
- Check `HKLM\Software\Policies\Microsoft\Windows NT\CurrentVersion\EFS\EfsConfiguration` — value 1 means GPO disabled EFS
- Check DRA certificate expiration

#### DFS namespace not corporate
- DFS namespace (\\domain.name) fails but FQDN (\\fileserver.domain.name) works
- Fix: Add IP address range for DFS namespace servers in addition to domain name

#### Non-standard network stack apps blocked
- Firefox, Chrome, WhatsApp use IP instead of FQDN
- Fix: Add `/*AppCompat*/` string to WIP cloud resources setting

## Data Collection
- Use Feedback Hub to collect WIP traces during repro
- TSS tool: https://aka.ms/getTSS
- IME logs and MDM diagnostic report

## Kusto Query
```kql
DeviceManagementProvider
| where message has "EnterpriseDataProtection"
| project env_time, ActivityId, deviceId, userId, message, errorCode
```
`[来源: ado-wiki-WIP-App-Protection.md]`

## Configuration Notes

## Scenario 69: MDM vs MAM differences
> 来源: ado-wiki-WIP-App-Protection.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- MAM requires Azure AD Premium license
- MAM supports only one user per device
- MAM can only manage enlightened apps
- MDM takes priority on Azure AD joined devices; MAM on workplace-joined devices

## Scenario 70: WIP Removal behavior
> 来源: ado-wiki-WIP-App-Protection.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Unenroll + Revoke ON: files remain encrypted, cannot be opened
- Unenroll + Revoke OFF: files decrypted, can be opened
- Policy unassigned: encryption removed from files
- Always perform selective wipe before removing device

## Scenario 71: Non-enlightened Office apps (Access, Project, Visio)
> 来源: ado-wiki-WIP-App-Protection.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Not included in default AppLocker XML files
- Custom XML files available for including these apps
- Warning: allowing unenlightened apps causes auto-encryption of everything they touch

## Scenario 72: Requirements
> 来源: ado-wiki-Windows-MAM.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Windows 11, build 10.0.22621 (22H2) or later
- Device NOT managed (not AAD Joined, not MDM enrolled)
- Not Workplace Joined to more than 2 users (limit 3 total)
- Windows Security Application Version: 1000.25873.0.9001+
- Windows Security Service Version: 1.0.2306.10002-0+
- Licensing: E3/Microsoft Intune Plan 1 for MAM, Entra ID P1 for CA

## Scenario 73: 1. Configure CA for App Protection on Windows
> 来源: ado-wiki-Windows-MAM.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Cloud apps: Office 365
- Conditions > Device platforms: Windows only
- Conditions > Client apps: Browser only
- Grant: Require app protection policy
- Enable policy: On

## Scenario 74: 2. Enable MTD Connector
> 来源: ado-wiki-Windows-MAM.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Tenant Administration > Connectors and tokens > Mobile Threat Defense
- Add Windows Security Center connector
- Status changes to "Enabled" after first MAM enrollment (~30 min)

## Scenario 75: 3. Configure Application Protection Policies
> 来源: ado-wiki-Windows-MAM.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Ref: https://learn.microsoft.com/en-us/mem/intune/apps/app-protection-policy-settings-windows

## Support Boundaries

| Scenario | Owning Team | Support Area Path |
|---|---|---|
| CA with Require app protection policy fails | MSaaS AAD Auth/Auth | Azure/AAD/CA/Grant or block |
| Workplace Join fails (>3 users) | Identity + Edge | Browser/Edge for Windows |
| Edge Work Profile setup/config/login | Edge support | Browser/Edge for Windows |
| MAM policy sent but behaviors not seen | Edge support | Browser/Edge for Windows |
| edge://edge-dlp-internals MAM flags not enabled | Edge support | Browser/Edge for Windows |
| Device Threat Levels inaccurate | MDE/Security | Security/MDTI |
| Unable to enable MTD connector | Intune | Azure/Intune/Protect/MTD |
| Configure CA for Windows MAM | Intune | Azure/Intune/App Protection - Windows |
| CA deployed but not working correctly | MSaaS AAD + Intune | Azure/AAD/CA |
| Configure APP for Windows MAM | Intune | Azure/Intune/App Protection - Windows |
| MAM flags enabled but compliance check fails | Intune | Azure/Intune/App Protection - Windows/Conditional Launch |

## Scenario 76: Key Diagnostic URLs
> 来源: ado-wiki-Windows-MAM.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- `edge://policy` - View applied policies (MAM policies should appear)
- `edge://edge-dlp-internals` - View DLP state and MAM enabled status
- `edge://mam-internals` - Simulate health-check and deep link scenarios

## Scenario 77: Log Files
> 来源: ado-wiki-Windows-MAM.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Area | Log Path |
|---|---|
| Entra ID / WAM | AAD Sign-in Events in Azure Portal |
| Windows Security Center | `%programfiles%\windows defender\mpcmdrun -Getfiles` |
| MAM Logs | `%LOCALAPPDATA%\Microsoft\Edge\User Data\MamLog.txt` |
| MAM Cache | `%LOCALAPPDATA%\Microsoft\Edge\User Data\MamCache.json` |
| Edge Crash Dumps | `%LOCALAPPDATA%\Microsoft\Edge\User Data\Crashpad\reports` |

## Scenario 78: MamCache.json Structure
> 来源: ado-wiki-Windows-MAM.md | 适用: Mooncake ✅

### 排查步骤

```json
{
  "CacheVersion": "<ver>",
  "Users": [{
    "Identity": "<AAD user ID>",
    "TenantId": "<AAD tenant ID>",
    "CloudEnvironment": "{Public|US|China}",
    "Preproduction": false,
    "Location": "<JWT>",
    "Enrollment": "<JWT>",
    "Policy": "<JWT>",
    "DeviceAction": "<JWT>"
  }]
}
```
All JWTs can be decoded with standard JWT tools.

## Scenario 79: Policy Not Active in Edge
> 来源: ado-wiki-Windows-MAM.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Check `edge://policy` and `edge://edge-dlp-internals/#mam-dlp-policies`
2. If policy not as configured, review MamLog.txt for service connection errors
3. Service request issues logged with correlation ID (client-request-id)

## Scenario 80: Common Scenarios & Guidance
> 来源: ado-wiki-Windows-MAM.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Scenario | Guidance |
|---|---|
| APP not sent to subset of users | Standard targeting troubleshooting + check signed-in Edge Work Profile |
| Data leak scenarios | Managed Locations not applicable in Windows MAM v1 |
| Copy from unmanaged to managed app | Not applicable - only Edge is MAM app |
| App exemptions | Not applicable - Edge is the only Windows MAM app |
| Sharing/Data Transfer | All contained within Edge browser |
| Application Configuration Policies | Not applicable for Windows MAM v1 |
| Managed Location | Not applicable in v1 |

## Escalation Path
1. Post to Intune Apps-Protection and Configuration Teams Channel
2. Review Support Boundaries table
3. If RFC/IET needed after due diligence: email IntuneMAMEdgeCollab@microsoft.com

## Scenario 81: Data Collection for Zebra Issues
> 来源: ado-wiki-Zebra-Support.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Deployment ID (for FOTA deployment issues)
- Device info: Serial Number, Model, FOTA Enrollment status, Update Status
- Email/account on Zebra Portal (when contacting Zebra on customer's behalf)

## Scenario 82: How to Get Deployment ID
> 来源: ado-wiki-Zebra-Support.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Intune Admin Center → Devices → Android → Android FOTA deployments → View Report → ID in report link

## Scenario 83: How to Get Device Info
> 来源: ado-wiki-Zebra-Support.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Settings → System → Advanced → System Updates

## Microsoft → Zebra Escalation Process
1. Raise ICM escalation for CxE team review (ensure misconfigurations ruled out first)
2. If needed, ask customer to raise Zebra ticket at https://supportcommunity.zebra.com/s/contactsupport
3. Get Zebra Case ID, include Microsoft case info in Zebra ticket using template
4. Microsoft SE must be included in all correspondence until case closed

## Zebra → Microsoft Process
1. Ask customer to open Microsoft SR via Intune Admin Center (free of charge)
2. Get Microsoft case ID/SR# from customer
3. Microsoft responds within 1 business day

## Key Notes
- Reach out to Intune CxE team BEFORE contacting Zebra contacts
- Do NOT share Zebra internal contacts with customers
- FOTA training: CxE Readiness - 2305 Zebra Lifeguard Over-the-Air (LG OTA) integration

## Scenario 84: Teams Team Wiki
> 来源: ado-wiki-a-teams-devices-android-assorted.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Internal Teams troubleshooting wiki: [Teams Team Wiki](https://dev.azure.com/Supportability/UC/_wiki/wikis/UC.wiki/3078/Teams-Devices)

## Scenario 85: Teams device software release history
> 来源: ado-wiki-a-teams-devices-android-assorted.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

[Release history](https://support.microsoft.com/en-us/office/what-s-new-in-microsoft-teams-devices-eabf4d81-acdd-4b23-afa1-9ee47bb7c5e2#ID0EBD=Desk_phones) - helpful for determining the version customer is running, how old it is, and any new updates.

## Scenario 86: Certified Teams Devices
> 来源: ado-wiki-a-teams-devices-android-assorted.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

[Certified list](https://learn.microsoft.com/en-us/microsoftteams/devices/teams-ip-phones) - devices here are updated more frequently. Good for checking version vs latest available, especially Company Portal version.

> **Important**: Almost all of the Conditional Access (CA) evaluation on the device side is handled by the Company Portal.

> **Note**: If a device is NOT in the certified list, that does NOT mean the device is not supported.

## Scenario 87: Publicly declared known issues
> 来源: ado-wiki-a-teams-devices-android-assorted.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

[Known issues page](https://learn.microsoft.com/en-us/microsoftteams/troubleshoot/teams-rooms-and-devices/rooms-known-issues) - mostly Teams support items, but several items related to Intune's scope of support.

## Scenario 88: Step 1: Verify Prerequisites
> 来源: mslearn-troubleshoot-app-protection-policy-deployment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- User has Intune license assigned
- User belongs to security group targeted by APP
- Android: Company Portal app installed
- Office apps: M365 Apps license + managed save location configured

## Scenario 89: Step 2: Check APP Status
> 来源: mslearn-troubleshoot-app-protection-policy-deployment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Intune admin center → Apps → Monitor → App protection status → Assigned users
- Verify user is licensed, has policy check-in, last sync time

## Scenario 90: Step 3: Verify User Targeting
> 来源: mslearn-troubleshoot-app-protection-policy-deployment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- APP must target user groups (NOT device groups)
- Android Enterprise: only personally-owned work profiles support APP
- Apple ADE: User Affinity must be enabled

## Scenario 91: Step 4: Verify App Targeting
> 来源: mslearn-troubleshoot-app-protection-policy-deployment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- App must use Intune App SDK
- Check app is in Microsoft Intune protected apps list
- iOS: ensure latest SDK version

## Scenario 92: Step 5: Verify Corporate Account Sign-in
> 来源: mslearn-troubleshoot-app-protection-policy-deployment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- User must sign in with corporate (UPN) credentials
- UPN must match between app and Entra ID
- Modern authentication recommended

## Scenario 93: Step 6: Collect Device Data
> 来源: mslearn-troubleshoot-app-protection-policy-deployment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Microsoft Edge → about:intunehelp → View Intune App Status
- Collect APP logs for support ticket

## Scenario 94: Policy Changes Not Applying
> 来源: mslearn-troubleshoot-app-protection-policy-deployment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- SDK checks every 30 min for selective wipe
- Existing policy changes may take up to 8 hours
- Fix: Log out and back in, or restart device
- Company Portal removal breaks policy updates

## Scenario 95: iOS Managed Devices Need Extra Config
> 来源: mslearn-troubleshoot-app-protection-policy-deployment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- IntuneMAMUPN + IntuneMAMOID required for MDM-managed apps
- IntuneMAMDeviceID required for third-party/LOB MDM apps
- Without IntuneMAMDeviceID, device treated as unmanaged

## Scenario 96: Common Usage Scenarios
> 来源: mslearn-troubleshoot-mam-user-issues.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Platform | Scenario | Explanation |
|----------|----------|-------------|
| iOS | Share extension works despite "Managed apps only" | Intune can't control iOS share extension without device management; data is encrypted |
| iOS | Prompted to install Microsoft Authenticator | Required for App-Based Conditional Access |
| Android | Must install Company Portal even without enrollment | APP functionality built into Company Portal app |
| iOS/Android | APP not applied on draft email in Outlook | Outlook doesn't enforce MAM on draft emails |
| iOS/Android | APP not applied on new unsaved documents | WXP doesn't enforce MAM until saved to managed location |
| Android | More restrictions than iOS on native app access | Android native app associations can be changed; use data transfer exemptions |

## Scenario 97: iOS Error Messages
> 来源: mslearn-troubleshoot-mam-user-issues.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Error | Cause | Fix |
|-------|-------|-----|
| App Not Set Up | No APP deployed | Deploy APP to user's security group targeting the app |
| Sign-in Failed | MAM enrollment failure | Deploy APP + verify targeting |
| Account Not Set Up | No Intune license | Assign Intune license in M365 admin center |
| Device Non-Compliant | Jailbroken device | Factory reset the device |
| Accessing Your Org's Data | Second work account sign-in | Only one work account per device for MAM |
| Alert: App can no longer be used | Certificate validation failure | Update/reinstall the app |

## Scenario 98: Android Error Messages
> 来源: mslearn-troubleshoot-mam-user-issues.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Error | Cause | Fix |
|-------|-------|-----|
| App not set up | No APP deployed | Deploy APP to user's group |
| Failed app launch | App crashes during MAM init | Update app + Company Portal |
| No apps found | No managed apps can open data | Deploy APP to at least one other MAM-enabled app |
| Sign-in failed | Auth failure | Sign in with enrolled account; clear app data |
| Device noncompliant | Rooted device | Factory reset |
| Unable to register the app | MAM auto-enrollment failure | Clear app data; send logs |

## Scenario 99: Enable USB Debugging
> 来源: onenote-android-debug-log-collection.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Settings > About phone/device > Software Info
2. Tap "Build number" 7 times to unlock Developer Mode
3. Settings > Developer Options > enable USB debugging

## Scenario 100: Collect Logs
> 来源: onenote-android-debug-log-collection.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Connect device to PC via USB
2. Accept "Allow USB Debugging" prompt on device
3. Open CMD, navigate to platform-tools folder
4. Verify connection: `adb.exe devices`
5. Start capture: `adb.exe logcat >> log.txt`
6. Reproduce the issue
7. Stop with Ctrl+C
8. Log saved as `log.txt` in platform-tools folder

## Scenario 101: Useful ADB Commands
> 来源: onenote-android-debug-log-collection.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- `adb install C:\package.apk` - Install APK
- `adb uninstall package.name` - Uninstall app
- `adb push C:\file /sdcard/file` - Push file to device
- `adb pull /sdcard/file C:\file` - Pull file from device

## 4. Samsung-Specific ADB Logging

1. Open Samsung Phone Dialer, enter `*#9900#`
2. Select "Enable SecLog"
3. Reboot device
4. Connect to PC, establish ADB connection
5. Enable verbose logging via ADB terminal
6. **Reproduce the issue**
7. Enter `*#9900#` again in Phone Dialer
8. Select "Run dumpstate/logcat"
9. Select "Copy to sdcard (include CP Ramdump)"
10. Collect from sdcard

## Company Portal Log Location (File System)
`device\Internal storage\Android\data\com.microsoft.windowsintune.companyportal`

## Scenario 102: ADB Method (Runtime Logs)
> 来源: onenote-android-log-collection-guide.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Download platform-tools: https://dl.google.com/android/repository/platform-tools-latest-windows.zip
2. Unzip to any location
3. Connect device via USB cable
4. Run `adb.exe devices` to verify connection
5. Accept "Allow USB Debugging" prompt on device
6. Run `adb.exe logcat >> log.txt`
7. Reproduce the issue
8. Stop with Ctrl+C — log saved as log.txt

## Scenario 103: Samsung-Specific Debug Log
> 来源: onenote-android-log-collection-guide.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Open Samsung Phone Dialer
2. Enter `*#9900#`
3. Select **Enable SecLog**
4. Reboot device
5. Connect via ADB, enable verbose logging
6. **Reproduce the issue**
7. Enter `*#9900#` again
8. Select **Run dumpstate/logcat** > **Copy to sdcard (include CP Ramdump)**

## Outlook Diagnostic Log
1. Sign in with a user **without** Intune license (if troubleshooting MAM)
2. Go to **Outlook > Help > Collect Diagnostic log > Upload log**
3. Share the incident ID

## Offline Log Collection (No Network)

## Scenario 104: Android
> 来源: onenote-android-log-collection-guide.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Reproduce the issue
2. Open **Company Portal > Settings > Diagnostic Logs > Save Logs**
3. Save to a new folder
4. Package and transfer logs manually (USB or email later)

## Scenario 105: iOS Outlook (Reference)
> 来源: onenote-android-log-collection-guide.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Tap profile avatar > **Settings > Privacy**
2. Confirm "Optional connected experiences" is OFF
3. Go back, tap **? (Help) > Share diagnostic logs**
4. Transfer the log file to IT or support

## Useful ADB Commands
| Command | Description |
|---------|-------------|
| `adb install C:\package.apk` | Install APK |
| `adb uninstall package.name` | Uninstall app |
| `adb push C:\file /sdcard/file` | Push file to device |
| `adb pull /sdcard/file C:\file` | Pull file from device |

## Scenario 106: Pre-troubleshooting Checklist (Android)
> 来源: onenote-android-log-collection-guide.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Before collecting logs, try these fixes:
1. Turn off **battery optimization** for Outlook and Company Portal
2. Change app **Launch** from Automatic to **Manage Manually** — enable Auto-launch, Secondary launch, Run in background
3. If **Data Saver** enabled, add Outlook and Company Portal to unrestricted data usage
4. Enable **notifications** for Outlook and Company Portal

## Scenario 107: Verify MAM Flags
> 来源: onenote-app-protection-edge-windows.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

`edge://edge-dlp-internals` - Check: mslrmv2=Enabled, msMamDlp=Enabled, Mam DLP Provider=Available

## Scenario 108: MAM Flags Not Persisting
> 来源: onenote-app-protection-edge-windows.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Workaround: `msedge --enable-features="msDesktopMam"`

## Scenario 109: Access Token Issues
> 来源: onenote-app-protection-edge-windows.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Check `%LOCALAPPDATA%\Microsoft\mamlog.txt`. Sign user out/in to refresh WAM token.

## Scenario 110: CA Failure
> 来源: onenote-app-protection-edge-windows.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Check ASC Authentication Diagnostics: Parsed Microsoft enrollment IDs must match EnrollmentIds in DataForConditionEvaluation.

## Scenario 111: Support Team Routing
> 来源: onenote-app-protection-edge-windows.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Issue | Team | SAP |
|---|---|---|
| CA policy fails | AAD Auth | Azure/AAD Sign-In/CA |
| WPJ fails in Edge | Edge | Browser/Edge/Windows |
| Compliance check fails | Intune | Azure/Intune/App Config-Windows/ManagedApps |

## Scenario 112: ICM
> 来源: onenote-app-protection-edge-windows.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- ESTS: [Template](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=83L3k1)
- WAM: [Template](https://aka.ms/wamhot)

## Scenario 113: Locate MAM Logs
> 来源: onenote-ios-mam-logs-3rd-party-app.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

**Option A:** Under **Backup Explorer**, find all AppGroups the app has entitlements for:
- Export all files under `.IntuneMAM`

**Option B:** Under **Backup Explorer** > App > `<bundleID>`:
- Export all files under `Library/.IntuneMAM`

## Scenario 114: Example
> 来源: onenote-ios-mam-logs-3rd-party-app.md | 适用: Mooncake ✅

### 排查步骤

For Board Papers app: `Backup Explorer > App > com.pervasent.broadpapers.intune > Library > .IntuneMAM`

## Notes
- Method 1 works for any app with Intune App SDK integrated
- Method 2 is useful for deeper investigation when MAM policy issues aren't visible in standard diagnostics
- Both methods apply to 3rd party apps using Intune MAM SDK

## Source
- OneNote: Mooncake POD Support Notebook > Intune > IOS logs > Gather MAM logs from 3rd party app

## Scenario 115: Step 1: Get MAM ActivityIds for a User
> 来源: onenote-mam-applied-kusto-queries.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kql
let starttime = datetime(YYYY-MM-DD HH:MM:SS);
let endtime = datetime(YYYY-MM-DD HH:MM:SS);
let userid = '<USER_ID>';
let activityIds = IntuneEvent
| where env_time between (starttime..endtime)
| where UserId == userid
| where ServiceName startswith "StatelessApplicationManagementService"
| where EventUniqueName == "IsAccountInMaintenance"
| project env_time, SourceNamespace, env_cloud_name, AccountId, UserId, ActivityId, cV
| summarize makeset(ActivityId, 10000);
```
`[来源: onenote-mam-applied-kusto-queries.md]`

## Scenario 116: Step 2: Get MAM Policy State (GetAction)
> 来源: onenote-mam-applied-kusto-queries.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kql
IntuneEvent
| where env_time between (starttime..endtime)
| where ActivityId in (activityIds)
| where ServiceName == "StatelessApplicationManagementService"
| where EventUniqueName == "GetAction"
| where ColMetadata contains "AppInstanceId;AadDeviceId;UpdateFlags;PolicyState"
| project env_time, AccountId, UserId, ActivityId,
    AppInstanceId = Col1, AadDeviceId = Col2,
    UpdateFlags = Col3, PolicyState = Col4
```
`[来源: onenote-mam-applied-kusto-queries.md]`

## Scenario 117: Step 3: Full MAM Flow via HttpSubsystem
> 来源: onenote-mam-applied-kusto-queries.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kql
HttpSubsystem
| where env_time between (starttime..endtime)
| where TaskName == "HttpSubsystemCompleteHttpOperationEvent"
| where ActivityId in (activityIds)
| where I_Srv startswith "StatelessApplicationManagementService"
| where httpVerb !in ("Options", "PING")
| extend type = case(
    collectionName == "Actions" and httpVerb == "GetLink", "Checkin",
    httpVerb == "Action", "Action",
    collectionName == "ApplicationInstances" and httpVerb == "Create", "Enroll",
    collectionName == "ApplicationInstances" and httpVerb == "Delete", "Unenroll",
    collectionName == "ApplicationInstances" and httpVerb == "Get", "Get",
    collectionName == "ApplicationInstances" and httpVerb == "Patch", "Patch",
    "???")
// ... extract AppId, Os, DeviceId, AppVersion etc. from URL query parameters
```
`[来源: onenote-mam-applied-kusto-queries.md]`

## Scenario 118: MAM UnenrollReason Codes
> 来源: onenote-mam-applied-kusto-queries.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| ReasonCode | Name | Description |
|---|---|---|
| 300 | CMAREnrollmentTriggerAppUnEnroll | App calls un-enroll |
| 301 | CMAREnrollmentTriggerAppUnEnrollLegacy | Legacy call to un-enroll |
| 302 | CMAREnrollmentTriggerAppUnEnrollLegacySwitchUser | Legacy un-enroll and switch device user |
| 303 | CMAREnrollmentTriggerOfflineWipe | Un-enroll caused by offline wipe |
| 304 | CMAREnrollmentTriggerWipeCommand | Un-enroll caused by wipe command |
| 305 | CMAREnrollmentTriggerDifferentDeviceUser | New device user account |
| 306 | CMAREnrollmentTriggerDifferentMdmUser | Different MDM user account |
| 307 | CMAREnrollmentTriggerSwitchUser | User selected to change primary account |
| 308 | CMAREnrollmentTriggerExceededMaxPinRetryWipe | Wipe due to exceeded max PIN attempts |
| 309 | CMAREnrollmentTriggerDeviceNonCompliant | Wipe due to jailbroken device |
| 310 | CMAREnrollmentTriggerBlockedOSVersion | Wipe due to blocked OS version |
| 311 | CMAREnrollmentTriggerBlockedAppVersion | Wipe due to blocked app version |
| 312 | CMAREnrollmentTriggerBlockedSDKVersion | Wipe due to blocked SDK version |
| 313 | CMAREnrollmentTriggerBlockedDeviceModel | Wipe due to blocked device model |

## AppFriendlyName Mapping (Key Apps)

| AppId pattern | Friendly Name | Tier |
|---|---|---|
| com.microsoft.Office.Outlook | Outlook | 1 |
| com.microsoft.skype.teams / com.microsoft.teams | Teams | 1 |
| com.microsoft.Office.Excel | Excel | 1 |
| com.microsoft.office.word | Word | 1 |
| com.microsoft.sharepoint | SharePoint | 1 |
| skydrive | OneDrive | 1 |
| emmx / msedge | Edge | 1 |
| com.microsoft.powerbi | PowerBI | 2 |
| com.microsoft.dynamics | Dynamics | 2 |
| yammer / wefwef | Yammer | 2 |

## Notes

- AppTier 1 = Core M365 apps, 2 = Secondary, 3 = Utility, 4 = LOB/3rd party
- AppEnvironment: 'prod' for production, 'dogfood'/'dev' for internal testing
- DeviceHealth: 0 = Healthy, 1 = Unhealthy (jailbroken/rooted)

## Scenario 119: High-Level MAM Flow
> 来源: onenote-mam-edge-windows.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. App enrolls via MDM/MAM API
2. App sends enrollment ID to ESTS via WAM parameter
3. Edge sends enrollment ID + Edge App ID in "Enrollment" cookie
4. ESTS validates: if resource requires MAM, looks for enrollment ID
5. Device must be AAD registered (WPJ) for MAM to work
6. If enrollment ID not found: error `unauthorized_client` + suberror `protection_policy_required` (AADSTS53005)

## Scenario 120: Edge App ID
> 来源: onenote-mam-edge-windows.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Application | ClientAppId |
|---|---|
| Microsoft Edge | ecd6b820-32c2-49b6-98a6-444530e5a77a |

## Scenario 121: Key Header
> 来源: onenote-mam-edge-windows.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

`x-ms-enrollments` - comma-separated list of Microsoft enrollment IDs (base64 encoded), sent to AAD Authorize endpoint.

## Conditional Access Configuration
- Under Access controls > Grant: check "Require app protection policy"
- Client apps condition: enable "Browser"
- Non-MAM browsers show "Launch in Edge" prompt
- WARNING: Using OR operand with "Require compliance device" prompts users to install Chrome extension for MDM

## Scenario 122: 1. Verify Device Registration
> 来源: onenote-mam-edge-windows.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Device Join Type must be "Azure AD registered"
- "Allow my organization to manage my device" must have been unchecked

## Scenario 123: 2. Check MAM Flags in Edge
> 来源: onenote-mam-edge-windows.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Navigate to `edge://edge-dlp-internals`:
- Feature Flags: `mslrmv2` = Enabled, `msMamDlp` = Enabled
- Provider States: `Mam Intune DLP` = Available

If flags don't persist:
```
msedge --enable-features="msDesktopMam"
```

## Scenario 124: 3. Check mamlog.txt
> 来源: onenote-mam-edge-windows.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Location: `%LOCALAPPDATA%\Microsoft\`
Look for: "Unable to acquire an access token during check-in"
Fix: Sign out and back into Edge profile to refresh token

## Scenario 125: 4. Conditional Access Failure Investigation
> 来源: onenote-mam-edge-windows.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Get correlation/request ID from failed sign-in
2. In ASC Authentication Diagnostics:
   - CA Diagnostics tab: shows unsatisfied grant controls
   - Device tab: shows ApplicationId, MamEnrollmentId, UserId
3. Expert view > Diagnostic logs:
   - Search "Parsed Microsoft enrollment IDs"
   - Search "EnrollmentIds" in DataForConditionEvaluation
   - Successful: shows "MatchedEnrollmentId"

## Scenario 126: 5. Debug Identity Errors
> 来源: onenote-mam-edge-windows.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```
msedge --enable-logging --v=0
```
Output: `chrome_debug.log` in Edge user data directory

## Scenario 127: 6. View MAM Policy
> 来源: onenote-mam-edge-windows.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Navigate to `edge://policy` in Edge to see last applied time and version

## ICM Escalation Paths

| Issue | Team | Template |
|---|---|---|
| CA + Require app protection fails | ESTS Incident Triage | [Template](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=83L3k1) |
| WAM token issues | Cloud Identity AuthN Client (Windows) | [Template](https://aka.ms/wamhot) |
| WPJ fails in Edge profile | Edge support | Browser > Microsoft Edge > Edge for Windows |
| MAM flags not enabled/persisting | Intune/Edge support | - |
| Compliance check fails with flags enabled | Intune support | Azure > Intune > App Configprofiles - Windows > ManagedApps |

## Case Handling
Four teams may be involved: Edge, Intune, Windows Defender, Azure AD (Identity).
Desktop MAM SDK does NOT participate in authentication - all WAM communication lives within Edge code.

## Scenario 128: 场景一：不同用户身份冲突导致 MAM 注册失败
> 来源: onenote-mam-log-analysis-keywords.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

**日志关键词**：`CMAREnrollmentPreReqOperation`

```
IntuneMAM: CMAREnrollmentPreReqOperation: Failed to enroll user because 
the application is already MDM enrolled and the provided identity does not 
match the MDM enrolled identity.
MDM CMARScrubbedIdentity: <hash1>
Enrolled CMARScrubbedIdentity: <hash2>
```

**含义**：应用已以某用户 MDM 注册，当前尝试注册的用户身份不匹配。

## Scenario 129: 场景二：应用间数据传输
> 来源: onenote-mam-log-analysis-keywords.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

**Outlook 打开附件到 Word**（允许）：
- Outlook 日志：`openURL URL: CMARScrubbedURL:ms-word://...`
- Word 日志：`openURL URL: CMARScrubbedURL:ms-outlook://emails/...`

**Word 共享到 Outlook**（被策略阻止）：
- Word 日志：`Returning FALSE from canOpenURL due to policy setting. url: CMARScrubbedURL:ms-outlook-shared:/`

## Scenario 130: 场景三：PIN 检查
> 来源: onenote-mam-log-analysis-keywords.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

**设备密码检查**：
```
IntuneMAM: CMARConditionalLaunchDevicePIN: passcode check returned device has passcode enabled
```

**App PIN 不合规**：
```
IntuneMAM: Evaluation finished synchronously for PINEnabled with non-compliant.
IntuneMAM: Completed compliance evaluation with status 4 for identity <hash>
IntuneMAM: MAM_CHECKPOINT: PinView - To access your organization's data with this app, set a PIN.
```

**状态码**：
- `status 0` = Compliant（合规）
- `status 4` = Not Compliant（不合规）

## Scenario 131: 场景四：Touch ID / Face ID 替代 PIN
> 来源: onenote-mam-log-analysis-keywords.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```
IntuneMAM: canUseBiometricAuth status = 1
IntuneMAM: Completed compliance evaluation with status 0 for identity <hash>
```

## Scenario 132: 场景五：Web 内容传输限制
> 来源: onenote-mam-log-analysis-keywords.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```
IntuneMAM: MAM_CHECKPOINT: Alert - Your organization requires you to install the Managed Browser app
IntuneMAM: Returning FALSE from canOpenURL due to policy setting. url: CMARScrubbedURL:googlechrome:///
```

## Scenario 133: 场景六：MAM 定时器
> 来源: onenote-mam-log-analysis-keywords.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```
IntuneMAM: CMAROperationScheduler: Setting up background timers for policy-checkins and offline wipe...
IntuneMAM: CMAROperationScheduler: Next policy check-in will happen in 29.9 minutes.
IntuneMAM: CMAROperationScheduler: Offline wipe timeout will expire in 129599 minutes.
```

| 定时器 | 说明 | 默认值 |
|--------|------|--------|
| Policy check-in | MAM 策略刷新间隔 | 30 分钟 |
| Offline wipe timeout | 离线擦除宽限期 | 90 天（129600 分钟） |

## Scenario 134: Example Path
> 来源: onenote-mam-logs-3rd-party-ios.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

For an app with bundle ID `com.pervasent.broadpapers.intune`:
```
Backup Explorer > App > com.pervasent.broadpapers.intune > Library > .IntuneMAM
```

## Notes

- The `.IntuneMAM` folder contains MAM policy enforcement logs and state files
- These logs are critical for diagnosing MAM policy application failures on third-party apps

---

## Kusto 查询参考

### 查询 1: MAM 账户维护状态查询

```kql
let starttime = datetime({startTime});
let endtime = datetime({endTime});
let userid = '{userId}';

let activityIds = IntuneEvent
    | where env_time between (starttime..endtime)
    | where UserId == userid
    | where ServiceName startswith "StatelessApplicationManagementService"
    | where EventUniqueName == "IsAccountInMaintenance"
    | project env_time, SourceNamespace, env_cloud_name, AccountId, UserId, ActivityId, cV, env_cloud_roleInstance, BuildVersion, Pid, Tid
    | summarize makeset(ActivityId, 10000);

IntuneEvent
    | where env_time between (starttime..endtime)
    | where ActivityId in (activityIds)
    | where ServiceName == "StatelessApplicationManagementService"
    | where EventUniqueName == "GetAction"
    | where ColMetadata contains "AppInstanceId;AadDeviceId;UpdateFlags;PolicyState"
    | project 
        env_time, SourceNamespace, env_cloud_name, AccountId, UserId, ActivityId, cV, ColMetadata,
        AppInstanceId = Col1, AadDeviceId = Col2, UpdateFlags = Col3, PolicyState = Col4,
        env_cloud_roleInstance, BuildVersion, Pid, Tid
```
`[来源: mam-policy.md]`

### 查询 2: MAM 完整签入流程 (含 HttpSubsystem)

```kql
let starttime = datetime({startTime});
let endtime = datetime({endTime});
let userid = '{userId}';
let accountID = '{accountId}';

let activityIds = IntuneEvent
    | where env_time between (starttime..endtime)
    | where UserId == userid
    | where ServiceName startswith "StatelessApplicationManagementService"
    | where EventUniqueName == "IsAccountInMaintenance"
    | summarize makeset(ActivityId, 10000);

let MAMappids = IntuneEvent
    | where env_time between (starttime..endtime)
    | where ActivityId in (activityIds)
    | where ServiceName == "StatelessApplicationManagementService"
    | where EventUniqueName == "GetAction"
    | where ColMetadata contains "AppInstanceId;AadDeviceId;UpdateFlags;PolicyState"
    | summarize makeset(Col1, 10000);

HttpSubsystem
    | where env_time between (starttime..endtime)
    | where TaskName == "HttpSubsystemCompleteHttpOperationEvent"
    | where ActivityId in (activityIds)
    | where I_Srv startswith "StatelessApplicationManagementService"
    | where httpVerb !in ("Options", "PING")
    | extend type = case(
        collectionName == "Actions" and httpVerb == "GetLink", "Checkin", 
        httpVerb == "Action", "Action", 
        collectionName == "ApplicationInstances" and httpVerb == "Create", "Enroll", 
        collectionName == "ApplicationInstances" and httpVerb == "Delete", "Unenroll", 
        collectionName == "ApplicationInstances" and httpVerb == "Get", "Get", 
        collectionName == "ApplicationInstances" and httpVerb == "Patch", "Patch", 
        "???")
    | extend parsedUrl = parse_url(url)
    | extend appInstId = extract("guid'([^']*)'", 1, tostring(parsedUrl["Path"]))
    | extend queryParameters = parsedUrl["Query Parameters"]
    | extend Os = tostring(queryParameters["Os"])
    | extend DeviceId = tostring(queryParameters["DeviceId"])
    | extend AppVersion = tostring(queryParameters["AppVersion"])
    | extend SdkVersion = tostring(queryParameters["SdkVersion"])
    | extend DeviceHealth = tostring(queryParameters["DeviceHealth"])
    | extend ManagementLevel = tostring(queryParameters["ManagementLevel"])
    | project env_time, SourceNamespace, env_cloud_name, type, accountId, ActivityId, statusCode,
        appInstId, Os, DeviceId, AppVersion, SdkVersion, DeviceHealth, ManagementLevel,
        collectionName, httpVerb, url, env_cloud_roleInstance, I_BuildVer
```
`[来源: mam-policy.md]`

### BYOD Work Profile - Policy Status

```kql
DeviceManagementProvider
| where env_time > ago(3d)
| where deviceId == 'deviceId'
| where applicablilityState == "Applicable"
| where typeAndCategory == "ConfigurationPolicy;None"
| project env_time, name, typeAndCategory, applicablilityState, reportComplianceState, policyId, id, EventMessage, ActivityId, I_App, scenarioType
```
`[来源: ado-wiki-Android-Device-Config.md]`

### BYOD Work Profile - Individual Settings

```kql
IntuneEvent
| where env_time > ago(10d)
| where DeviceId == "deviceId"
| where Col1 startswith "Done processing rule"
| project env_time, Message=['Col1'], Status=['Col4'], PolicyID=['Col3'], DeviceId, UserId, ComponentName, ActivityId, EventUniqueName
```
`[来源: ado-wiki-Android-Device-Config.md]`

### Corporate-Owned (COBO/COSU/COPE) - Individual Settings

```kql
IntuneEvent
| where env_time between(datetime(start) .. datetime(end))
| where DeviceId has "deviceID"
| where EventUniqueName == "ProcessedSetting"
| project env_time, ComponentName, EventUniqueName, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, Message
```
`[来源: ado-wiki-Android-Device-Config.md]`

---

## 判断逻辑参考

### BYOD Work Profile - Policy Status

| where env_time > ago(3d)
| where deviceId == 'deviceId'
| where applicablilityState == "Applicable"
| where typeAndCategory == "ConfigurationPolicy;None"
| project env_time, name, typeAndCategory, applicablilityState, reportComplianceState, policyId, id, EventMessage, ActivityId, I_App, scenarioType

### Enrollment Status Codes

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

### iOS Error Messages

| Error | Cause | Fix |
|-------|-------|-----|
| App Not Set Up | No APP deployed | Deploy APP to user's security group targeting the app |
| Sign-in Failed | MAM enrollment failure | Deploy APP + verify targeting |
| Account Not Set Up | No Intune license | Assign Intune license in M365 admin center |
| Device Non-Compliant | Jailbroken device | Factory reset the device |
| Accessing Your Org's Data | Second work account sign-in | Only one work account per device for MAM |
| Alert: App can no longer be used | Certificate validation failure | Update/reinstall the app |

### Android Error Messages

| Error | Cause | Fix |
|-------|-------|-----|
| App not set up | No APP deployed | Deploy APP to user's group |
| Failed app launch | App crashes during MAM init | Update app + Company Portal |
| No apps found | No managed apps can open data | Deploy APP to at least one other MAM-enabled app |
| Sign-in failed | Auth failure | Sign in with enrolled account; clear app data |
| Device noncompliant | Rooted device | Factory reset |
| Unable to register the app | MAM auto-enrollment failure | Clear app data; send logs |

### Step 2: Get MAM Policy State (GetAction)

| where env_time between (starttime..endtime)
| where ActivityId in (activityIds)
| where ServiceName == "StatelessApplicationManagementService"
| where EventUniqueName == "GetAction"
| where ColMetadata contains "AppInstanceId;AadDeviceId;UpdateFlags;PolicyState"
| project env_time, AccountId, UserId, ActivityId,

---

> ⚠️ **21V (Mooncake) 注意**: 本主题包含 21V 特有的限制或配置，请注意区分 Global 与 21V 环境差异。

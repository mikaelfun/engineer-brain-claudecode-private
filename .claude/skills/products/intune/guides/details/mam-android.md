# Intune Android MAM 与 App Protection — 综合排查指南

**条目数**: 1 | **草稿融合数**: 28 | **Kusto 查询融合**: 1
**来源草稿**: ado-wiki-Android-App-Deployment.md, ado-wiki-Android-Device-Config.md, ado-wiki-App-Protection-Android.md, ado-wiki-App-Protection-Policies.md, ado-wiki-App-Protection-iOS.md, ado-wiki-App-SDK-for-Android.md, ado-wiki-App-SDK-for-iOS.md, ado-wiki-App-Wrapping-Tool-Android.md, ado-wiki-App-Wrapping-Tool-iOS.md, ado-wiki-Teams-Android-Collecting-Logs.md
**Kusto 引用**: mam-policy.md
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Android App Deployment
> 来源: ADO Wiki — [ado-wiki-Android-App-Deployment.md](../drafts/ado-wiki-Android-App-Deployment.md)

**Intune Android App 部署 — 排查指南**
**功能简介**
**支持的应用类型**
**Scoping Questions**
1. 什么类型的设备（品牌、型号）？
2. Android OS 版本？
3. 应用类型（LOB、Store、Built-in、WebClip 等）？
4. 应用分配方式（User、Group 或 Device）？
5. 问题如何影响客户？是完全阻塞还是有变通方法？

**Support Boundaries**

**常见问题排查**

**安装失败（Install Failed）**
1. 查看 OMADM 日志，找 `"Error installing application <app name>, result code: <code>"` 
2. 该 result code 来自 Android OS，搜索此 Android 错误码获取详情
3. 常见失败原因：
   - APK 文件损坏（bad APK）
   - 设备未允许来自未知来源的安装
   - APK 未签名

**可用应用安装后状态不更新**

**如何检查 LOB APK 版本**
```xml
```
- `android:versionCode`：构建号，Intune 依赖此值判断是否有更新
- `android:versionName`：显示给用户的版本号
- **更新的 APK versionCode 必须高于现有版本**

**排查工具和资源**
- OMADM 日志分析：参考 ContentIdea#121254 (How to Analyze OMADM Log)
- Available Installs 排查：KB4612733
- Required Installs 排查：KB4612734
- 完全托管 Android Enterprise 设备 debug 日志：KB4570081

**Kusto 查询**

**培训资料**
- Microsoft Endpoint Manager - Intune - Client Apps - Part VIII - Apps — Android（视频链接见 Wiki）
- Intune Deep Dive Walkthroughs（产品团队）
... (详见原始草稿)

### Phase 2: Android Device Config
> 来源: ADO Wiki — [ado-wiki-Android-Device-Config.md](../drafts/ado-wiki-Android-Device-Config.md)

**Android Device Configuration Guide**
**Overview**
- Corporate-owned: DPC = Google (Android Device Policy app)
- BYOD: DPC = Company Portal app

**Enrollment Types**

**Support Boundaries**
- All Android device config issues are owned by Intune support
- **Do NOT tell customer to contact Google** - Google does not have enterprise support for customers
- If issue is suspected with Android OS, Intune PG can create support ticket with Google PG
- SE/SEEs do not have access to Intune PG <=> Google PG tickets

**DA (Legacy) - Deprecating**
- Ending support for DA on devices with GMS (August 2024)
- Supported custom profiles: Wi-Fi PSK, Per-app VPN, Samsung Knox apps, MDE web protection
- If custom profile not in supported list → not supported (may still work, but won't investigate)
- Knox-specific settings require device on Knox supported devices list

**AE Work Profile (BYOD) Custom Profiles**
- `./Vendor/MSFT/WiFi/Profile/SSID/Settings`
- `./Vendor/MSFT/VPN/Profile/Name/PackageList`
- `./Vendor/MSFT/WorkProfile/DisallowCrossProfileCopyPaste`

**OEMConfig**
- Applies to ALL AE enrollment types
- Functions like app config policy but acts as device configuration
- App must be added to managed Google Play and installed on device
- Samsung Knox Service Plugin: https://docs.samsungknox.com/admin/knox-service-plugin/policies.html

**Managed Home Screen (MHS)**
- For dedicated devices in multi-app kiosk mode
- Functions as app config policy
- Setup guide: https://techcommunity.microsoft.com/t5/intune-customer-success/how-to-setup-microsoft-managed-home-screen-on-dedicated-devices/ba-p/1388060
... (详见原始草稿)

### Phase 3: App Protection Android
> 来源: ADO Wiki — [ado-wiki-App-Protection-Android.md](../drafts/ado-wiki-App-Protection-Android.md)

**App protection policy for Android**
**Architecture**
**Interaction with Android OS**
**Interaction with the Company Portal**
**FAQ**
1. **Why is the Company Portal app needed?** Much of app protection functionality is built into the Company Portal app. Device enrollment is not required even though the Company Portal app is always required. For MAM-WE, the end user just needs to have the Company Portal app installed.
2. **Multiple access settings order**: Block takes precedence, then dismissible warning. App version requirement > Android OS version > Android patch version.
3. **SafetyNet Attestation**: Google Play service determination reported at interval determined by Intune service. If no data, access allowed depending on other checks. **SafetyNet API is deprecated → replaced by Play Integrity API.**
4. **Verify Apps API**: User needs to go to Google Play Store > My apps & games > last app scan > Play Protect menu > toggle "Scan device for security threats" to on.
5. **SafetyNet check values**: 'Check basic integrity' - general device integrity (rooted/emulator/tampered fail). 'Check basic integrity & certified devices' - additionally requires Google certification.

**Prerequisites**
1. User must have a Microsoft Entra ID account
2. User must have an Intune license assigned
3. User must sign in with work account targeted by app protection policy
4. Company Portal app required for Android
5. Device must have access to Intune required endpoints

**Scoping Questions**
1. What is the UPN? Does it have an Intune license?
2. Affected OS platform? When did problem start? How many users/devices impacted?
3. Device state: Managed, Unmanaged (MAM-WE), or MAM-WE on third-party MDM?
4. All apps or specific app? Store app or LOB? SDK or Wrapper? SDK version?
5. Behavior or error message? Steps to reproduce?

**Troubleshooting Steps**
- Review public troubleshooter: [Troubleshooting app protection policy deployment](https://learn.microsoft.com/en-us/troubleshoot/mem/intune/app-protection-policies/troubleshoot-app-protection-policy-deployment)
- Recommend device updates
- Try reproducing in test tenant
- Narrow down to specific models/devices
- Document UPN and email of affected users
... (详见原始草稿)

### Phase 4: App Protection Policies
> 来源: ADO Wiki — [ado-wiki-App-Protection-Policies.md](../drafts/ado-wiki-App-Protection-Policies.md)

**App Protection Policies (APP/MAM) Troubleshooting Guide**
**Overview**
**How APP Works**
1. MAM-enabled app launched, user authenticated
2. AAD confirms user targeted for MAM policies
3. Intune service deploys MAM payload via mam.manage.microsoft.com (port 444)
4. Payload delivered as encrypted XML containing MAM policies
5. App loads Intune SDK on next launch after successful delivery

**Encryption**
- **iOS**: Native iOS 256-bit AES encryption (requires device-level PIN)
- **Android**: OpenSSL 256-bit AES + Android Keystore (FIPS 140-2 validated)
- **Windows (WIP)**: Native EFS (Encrypted File System) — WIP EOL end of 2022

**Platform Differences**
- **iOS**: SDK per application, Apple Keychain may cache token data
- **Android**: Company Portal required as broker (processes ~80% of SDK), must be installed for ANY Android device
- **Windows**: Uses WIP (EnterpriseDataProtection + Applocker CSP), best-effort protection level

**Prerequisites for APP**
1. Targeted UPN must resolve in Azure AD
2. UPN must have active Intune license
3. Application must have Intune SDK integrated

**Support Boundaries**
- MAM policies should NOT be used with third-party MAM or secure container solutions
- On-Premises Skype/Exchange requires Hybrid Modern Auth
- None of the data protection settings control Apple managed Open-In feature on iOS/iPadOS
- Only data marked as "corporate" is encrypted
- BYOD without MDM: can't deploy apps, can't provision certificates, can't provision Wi-Fi/VPN

**Scoping Questions**
1. UPN of Azure AD account? Does it have Intune license?
... (详见原始草稿)

### Phase 5: App Protection Ios
> 来源: ADO Wiki — [ado-wiki-App-Protection-iOS.md](../drafts/ado-wiki-App-Protection-iOS.md)

**App Protection Policy for iOS**
**Architecture**
**App Experience on iOS**
**Device fingerprint or face IDs**
**iOS Share Extension**
**Universal Links Support**
**Multiple Access Settings Precedence**
**Prerequisites**
1. User must have a Microsoft Entra ID (Azure AD) account.
2. User must have an Intune license assigned.
3. User must sign in into the app with work account targeted by app protection policy.
4. Authenticator is required when there is app based conditional access policy.
5. Device should have access to Intune required endpoints. [(Network endpoints)](https://learn.microsoft.com/en-us/mem/intune/fundamentals/intune-endpoints)
    - key = IntuneMAMUPN, value = username@company.com
    - key = IntuneMAMOID, value = {{userid}}
    - **IntuneMAMOID** is only required for Intune.

**Scoping Questions**
1. What is the UPN of the Azure AD account?
   - Does this UPN have an Intune license?
2. What is the affected OS platform (iOS 15.0+)?
   - Start date? Previous changes? Number of impacted users/devices?
3. Device state: Managed (enrolled with Intune), Unmanaged (MAM-WE), or MAM-WE on third-party MDM?
   - Collect device Serial Number or Intune deviceId
4. Is this impacting all apps or a specific app?
   - Store app or custom LOB using SDK?
   - LOB: SDK integration or Wrapper tool? SDK version?
   - If Outlook: Exchange Server type (O365 vs Exchange On-Prem Hybrid)?
5. What behavior or error message is reported?
   - Steps to reproduce? Expected behavior? Exact error message?
... (详见原始草稿)

### Phase 6: App Sdk For Android
> 来源: ADO Wiki — [ado-wiki-App-SDK-for-Android.md](../drafts/ado-wiki-App-SDK-for-Android.md)

**Intune App SDK for Android Workflow**
**What is the Intune App SDK for Android**
- Microsoft.Intune.MAM.SDK.aar: Main SDK components
- Microsoft.Intune.MAM.SDK.Support.v4/v7/v17.jar: Support library classes
- Microsoft.Intune.MAM.SDK.Support.Text.jar: Text package support
- Microsoft.Intune.MAM.SDK.DownlevelStubs.aar: Stubs for newer device classes
- com.microsoft.intune.mam.build.jar: Gradle plugin
- Android API 28 (Android 9.0) through Android API 34 (Android 14) fully supported
- API 34 requires Intune App SDK v10.0.0 or later
- APIs 26-27 in limited support; Company Portal not supported below API 26; APP not supported below API 28
- Company Portal app must be present on device for app protection policies

**Two approaches to MAM-enable an app:**

**Gradle Build Plugin Configuration**
```gradle
```

**Scoping Questions (SDK)**
1. New development or previously working application?
2. Any updates made to the application?
3. Multiple users impacted? Same device model/OS?
4. Android version on affected device?
5. SDK version used?
- Check Android SDK Version used (GitHub)
- Check GitHub issues for known problems
- Company Portal version
- IDE: Android Studio or Visual Studio (Xamarin)
- Using both Wrapper and SDK? (should not)

**Troubleshooting Scenarios**
- Customer cannot use the Wrapper
... (详见原始草稿)

### Phase 7: App Sdk For Ios
> 来源: ADO Wiki — [ado-wiki-App-SDK-for-iOS.md](../drafts/ado-wiki-App-SDK-for-iOS.md)

**Intune App SDK for iOS**
**Quick Reference**
**SDK Version Matrix**
**MSAL Integration Guide**
- User Identity & MAM Enrollment
- Conditional Launch checks
- Management Without MDM (MAM-only)
- App Protection Conditional Access

**Authentication Flow Options**
1. **App Handles Authentication (Recommended)** — App integrates MSAL, handles sign-in, passes accountId to SDK via `registerAndEnrollAccountId`
2. **SDK Handles Authentication** — SDK handles MSAL auth for simple apps via `loginAndEnrollAccount`
3. **Auto-Enrollment at Launch** — `AutoEnrollOnLaunch=YES` + `MAMPolicyRequired=YES` (cannot submit to App Store)

**Critical: Account ID**
```objc
```

**SSO and Broker Authentication**

**Integration Steps**

**Required Frameworks**

**Keychain Sharing**
```xml
```

**IntuneMAMSettings (Info.plist)**
```xml
```

**Log Collection Methods**

**Method 1: Via App Settings (Recommended)**
1. iOS Settings → Your App → Microsoft Intune → "Display Diagnostics Console" ON
2. Launch app → "Collect Intune Diagnostics" screen
3. Enable verbose logging → Get Started → Reproduce issue
4. "Send Logs to Microsoft" → Record Reference ID

**Method 2: Via Edge**

**Verbose Logging**
```xml
```

**Enrollment Status Codes**

**Common Issues and Solutions**

**Issue 1: SDK Not Receiving Policy**
- Check enrollment delegate for status code
- Verify user is in targeted group, app bundle ID in policy, Intune license assigned
- Ensure correct account ID (`tenantProfile.identifier`)

**Issue 2: Keychain Errors**
- Verify entitlements include `com.microsoft.intune.mam` and `com.microsoft.adalcache`
- Check provisioning profile supports keychain sharing

**Issue 3: App Restart Loop**
- Implement `IntuneMAMPolicyDelegate` and handle `restartApplication`
- Check for MDM/MAM app config conflicts

**Issue 4: MSAL Token Acquisition Fails**
- Verify client ID and redirect URI match app registration
- Enable MSAL verbose logging for diagnostics
... (详见原始草稿)

### Phase 8: App Wrapping Tool Android
> 来源: ADO Wiki — [ado-wiki-App-Wrapping-Tool-Android.md](../drafts/ado-wiki-App-Wrapping-Tool-Android.md)

**App Wrapping Tool for Android**
**About the Intune App Wrapping Tool for Android**
**Key Differences vs. iOS App Wrapping Tool**
**Key Android Developer Concepts**
**Android APK**
**Android App Bundle (AAB)**
**Java Keystore and Signing**
- Android requires all APKs to be signed before installation
- **Critical**: App upgrades MUST be signed with the same certificate as the original version
- If keystore is lost, app cannot be upgraded — must publish under a different package name

**DEX Size Limit**
- Min API ≥ 21: Automatically handled (as of v1.0.2501.1)
- Min API < 21: Use `-UseMinAPILevelForNativeMultiDex` flag

**How It Works**
1. Takes original `.apk` as input
2. Injects Intune MAM SDK classes into DEX bytecode
3. Modifies AndroidManifest.xml
4. Outputs **unsigned** wrapped `.apk` — must be signed before deployment

**Prerequisites**

**Step-by-Step**

**Step 1: Convert AAB to APK (if needed)**
```powershell

**Use .\extracted\universal.apk**
```

**Step 2: Download and Install**

**Step 3: Import PowerShell Module**
```powershell
```

**Step 4: Run the Tool**
```powershell
```

**Step 5: Sign the Wrapped APK**
```powershell
```

**Step 6: Upload to Intune Admin Center**

**Common GitHub Issues**

**Troubleshooting**
- **"The app has already been wrapped"**: Use original unwrapped APK
- **Java not found**: Install 64-bit JRE, set PATH
- **APK install failure**: Sign with apksigner/jarsigner, use same cert for upgrades
- **DEX overflow**: Update tool (≥v1.0.2501.1) or use `-UseMinAPILevelForNativeMultiDex`
- **OutputPath failure**: Use different directory than InputPath
- **App crashes after wrapping**: Consider Intune App SDK for complex apps
- **Upload fails**: Sign APK before upload; same cert for updates

**Scoping Questions**
1. Tool version? 2. App min SDK level? 3. Input .apk or .aab? 4. Error message/log? 5. Signed before upload? 6. Previously deployed? Same cert? 7. New or upgrade? 8. Package name? 9. Error at wrap time or runtime? 10. Previously wrapped?

**Support Boundaries**

**SME Contact**

### Phase 9: App Wrapping Tool Ios
> 来源: ADO Wiki — [ado-wiki-App-Wrapping-Tool-iOS.md](../drafts/ado-wiki-App-Wrapping-Tool-iOS.md)

**App Wrapping Tool for iOS**
**About**
**Key Apple Developer Concepts**
**Signing Certificate**
- SHA-1 fingerprint required as `-c` parameter
- Must have matching private key in macOS Keychain
- Expired cert: tool won't error but app won't install

**Provisioning Profile**
- `.mobileprovision` linking App ID + Certificate + Distribution Method
- Need **In-House** profile (requires Apple Developer Enterprise account)
- Must include same entitlements as the app

**Entitlements**
- Key-value pairs granting app permissions (App Groups, Keychain Sharing, Push, etc.)
- Must match between app and provisioning profile
- Use `-e` flag to strip missing entitlements (may break functionality)

**App Extensions**
- Each extension needs its own provisioning profile via `-x` parameter
- Use `-xe` to inspect extensions and their required entitlements

**Prerequisites**
- macOS with Xcode 16.0+
- Apple Developer Enterprise account
- In-House signing certificate + provisioning profile
- Entra ID app registration with Client ID and Redirect URI
- Input: `.ipa` or `.app`, unencrypted, iOS 16.0+

**Command-Line Parameters**

**`-ds` Deep Dive (SafariViewControllerBlockedOverride)**
- Disables Intune hooks on SFSafariViewController/ASWebAuthenticationSession
- Use when: Cordova/React Native apps, non-WKWebView MSAL auth, passwordless via Authenticator
- **WARNING**: Disables protection for ALL Safari-based WebViews, not just auth

**Common GitHub Issues**

**Troubleshooting Quick Reference**
- **Invalid signing certificate**: Check duplicates, expiry, trust, intermediate certs in Keychain
... (详见原始草稿)

### Phase 10: Teams Android Collecting Logs
> 来源: ADO Wiki — [ado-wiki-Teams-Android-Collecting-Logs.md](../drafts/ado-wiki-Teams-Android-Collecting-Logs.md)

**Collecting Company Portal Logs from Android Teams Devices**
**Steps**
1. Go to Teams Admin Center: https://admin.teams.microsoft.com/dashboard
2. Teams devices > Select applicable type (panels, phones, displays, etc.)
3. Select display name > Download device logs
4. Get screenshot of software health tab
5. Click History tab > Download when ready

### Phase 11: Wip App Protection
> 来源: ADO Wiki — [ado-wiki-WIP-App-Protection.md](../drafts/ado-wiki-WIP-App-Protection.md)

**Windows Information Protection (WIP) — Troubleshooting Guide**
**About WIP**
- WIP is NOT DLP or IRM — it prevents accidental leakage, not deliberate exfiltration
- Two flavors: WIP with MDM (device enrolled) and WIP with MAM (without enrollment)
- Four modes: Block, Allow Overrides, Silent, Off
- Apps: Enlightened (can differentiate corporate/personal) vs Unenlightened (treats everything as corporate)

**Support Boundaries**
- EFS service issues → Windows UEX team
- DRA certificate issues → Windows Directory Services team
- Azure RMS issues → Azure Identity team
- Network configuration → Windows Networking team

**Scoping Questions**
1. WIP mode: MDM or MAM?
2. Windows 10 version
3. Number of impacted users/devices
4. When did the issue start?
5. Has this worked before?

**Troubleshooting Flow**

**1. Verify Policy Configuration**
- Review policy type (with/without enrollment) in MEM portal
- Generate App protection report: Apps → Monitor → App protection status
- Check RAVE for WIP with enrollment policies

**2. Verify Device Prerequisites**
- Windows 10 version compatibility
- MDM: device synced with Intune; MAM: device Azure AD registered
- WIP WE uses port 444/TCP — verify firewall allows it
- Licenses: Intune license required; MAM also needs Azure AD Premium
... (详见原始草稿)

### Phase 12: Windows Mam
> 来源: ADO Wiki — [ado-wiki-Windows-MAM.md](../drafts/ado-wiki-Windows-MAM.md)

**Windows MAM (Mobile Application Management) for Edge**
**About**
**How It Works**
- **Application Configuration Policies (ACP)**: Customize org user experience in Edge
- **Application Protection Policies (APP)**: Secure org data and ensure device health
- **Windows Security Center MTD**: Detect local health threats on personal devices
- **Conditional Access**: Require app protection policy grant control via Entra ID
- **WAM (Web Account Manager)**: MAM-aware Edge acquires access tokens via silent/interactive flows

**Requirements**
- Windows 11, build 10.0.22621 (22H2) or later
- Device NOT managed (not AAD Joined, not MDM enrolled)
- Not Workplace Joined to more than 2 users (limit 3 total)
- Windows Security Application Version: 1000.25873.0.9001+
- Windows Security Service Version: 1.0.2306.10002-0+
- Licensing: E3/Microsoft Intune Plan 1 for MAM, Entra ID P1 for CA

**Configuration Steps**

**1. Configure CA for App Protection on Windows**
- Cloud apps: Office 365
- Conditions > Device platforms: Windows only
- Conditions > Client apps: Browser only
- Grant: Require app protection policy
- Enable policy: On

**2. Enable MTD Connector**
- Tenant Administration > Connectors and tokens > Mobile Threat Defense
- Add Windows Security Center connector
- Status changes to "Enabled" after first MAM enrollment (~30 min)

**3. Configure Application Protection Policies**
- Ref: https://learn.microsoft.com/en-us/mem/intune/apps/app-protection-policy-settings-windows
... (详见原始草稿)

### Phase 13: Kusto 诊断查询

#### mam-policy.md
`[工具: Kusto skill — mam-policy.md]`

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


---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Android LOB 应用集成 Intune MAM SDK 后 Gradle 构建失败 | SDK 版本与 IDE 构建工具、Android Gradle plugin 或 framework 版本不兼容；Gradle 包签名配置不正确；Azur... | 1. 检查 Azure App Registration 的 scope 和 permissions；2. 确认使用 Android Gradle plugin 3.0+ 和 Gradle 4.... | 🟢 8.5 | ADO Wiki |

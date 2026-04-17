# INTUNE 21V 功能差异与不支持特性 — 已知问题详情

**条目数**: 119 | **生成日期**: 2026-04-17

---

## Quick Troubleshooting Path

### Step 1: Intune Android 设备管理在 21V 仅支持 DA 模式
**Solution**: 部分支持：使用 Android DA 模式注册设备；不配置 Android Enterprise Profile 或 AOSP；可管理到 Android 15
`[Source: 21v-gap, Score: 9.5]`

### Step 2: Windows device enrollment fails with error 0x800706BE or 80010106. Event ID 1000 (app crash) seen in Event Viewer > Windows Logs > Application. dme...
**Solution**: Identify and uninstall or disable conflicting third-party UKEY or password agent software, then retry enrollment. Record additional apps matching this pattern for future reference.
`[Source: onenote, Score: 9.5]`

### Step 3: After upgrading Huawei device to HarmonyOS VNEXT (5.0+), Intune MAM policy stops working; Company Portal logs show NOT_COMPLIANT with rooted device...
**Solution**: Intune MAM does NOT support HarmonyOS VNEXT 5.0+. MAM only works on Android AOSP, OpenHarmony, and older HarmonyOS with AOSP layer. DCR may be filed but not on roadmap.
`[Source: onenote, Score: 9.5]`

### Step 4: Company Portal (CP) unable to sign in on iOS/Android in 21Vianet (Mooncake) environment; error message: 'This username may be incorrect. Make sure ...
**Solution**: Temporary workaround: have user first sign in with user@partner.onmschina.cn format, which redirects to correct 21v auth page. Teams and Outlook are not affected because they use office discovery to route to 21v tenant first. If LogsMiner confirms no redirect record, submit IcM (reference: IcM-412709475, IcM-378453964).
`[Source: onenote, Score: 9.5]`

### Step 5: MAM diagnostic Kusto functions AmsActivityForUser() and AMS() are not available in 21v Mooncake; queries using these functions fail
**Solution**: Use alternative queries based on IntuneEvent + HttpSubsystem tables directly. For MAM checkin: query IntuneEvent where ServiceName startswith 'StatelessApplicationManagementService' and EventUniqueName == 'IsAccountInMaintenance', then join ActivityId to HttpSubsystem to get full MAM flow (Checkin/Enroll/Unenroll/Action). For MAM policy state: use GetAction events with ColMetadata containing 'AppInstanceId;AadDeviceId;UpdateFlags;PolicyState'.
`[Source: onenote, Score: 9.5]`

### Step 6: Customer raises commerce/licensing ticket for 21V Intune; unclear which team handles it and what the escalation flow is
**Solution**: 21V Intune commerce flow: Customer raises ticket from portal.partner.microsoftonline.cn → 21V M365 team (equivalent to 21V Commerce) → MS CPC v-Team → MS CPC FTE Team → Engineering Team. The 21V M365 team acts as the first-level commerce handler, and CPC v-/FTE teams act as the Sheldon-equivalent role.
`[Source: onenote, Score: 9.5]`

### Step 7: Windows auto MDM enrollment fails with error 0x80010106 (Cannot change thread mode after it is set). Common in China with financial/banking U-key s...
**Solution**: Uninstall CFCA UKEY-related software. Verify no third-party providers at HKLM\SOFTWARE\Microsoft\Cryptography\Defaults\Provider. Delete enrollment records at HKLM\SOFTWARE\Microsoft\Enrollments. Delete Intune portal records. Restart device. Note: enrollment renews yearly, may recur
`[Source: onenote, Score: 9.5]`

### Step 8: Intune VPN profile for Palo Alto GlobalProtect deployed successfully to iOS device but the GlobalProtect app cannot pick up the VPN configuration i...
**Solution**: Use a Custom VPN profile or create a custom profile with XML payload that uses the China-specific identifier com.paloaltonetworks.globalprotect.vpncn instead of the standard one.
`[Source: onenote, Score: 9.5]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Intune Android 设备管理在 21V 仅支持 DA 模式 | Android Enterprise 和 AOSP 不支持（依赖 GMS）；仅支持 Device Administrator (DA) 模式，包含 And... | 部分支持：使用 Android DA 模式注册设备；不配置 Android Enterprise Profile 或 AOSP；可管理到 Android 15 | 9.5 | 21v-gap |
| 2 | Windows device enrollment fails with error 0x800706BE or 80010106. Event ID 1... | dmenrollengine.dll attempts COM init with COINIT_MULTITHREADED but a third-pa... | Identify and uninstall or disable conflicting third-party UKEY or password ag... | 9.5 | onenote |
| 3 | After upgrading Huawei device to HarmonyOS VNEXT (5.0+), Intune MAM policy st... | HarmonyOS VNEXT removed AOSP compatibility and uses sandbox hiding file paths... | Intune MAM does NOT support HarmonyOS VNEXT 5.0+. MAM only works on Android A... | 9.5 | onenote |
| 4 | Company Portal (CP) unable to sign in on iOS/Android in 21Vianet (Mooncake) e... | User's domain was previously verified in Global Azure AD tenant. When CP atte... | Temporary workaround: have user first sign in with user@partner.onmschina.cn ... | 9.5 | onenote |
| 5 | MAM diagnostic Kusto functions AmsActivityForUser() and AMS() are not availab... | AmsActivityForUser() and AMS() are convenience functions available only in Gl... | Use alternative queries based on IntuneEvent + HttpSubsystem tables directly.... | 9.5 | onenote |
| 6 | Customer raises commerce/licensing ticket for 21V Intune; unclear which team ... | 21V Intune commerce questions go through a different support chain than techn... | 21V Intune commerce flow: Customer raises ticket from portal.partner.microsof... | 9.5 | onenote |
| 7 | Windows auto MDM enrollment fails with error 0x80010106 (Cannot change thread... | Third-party crypto provider (e.g. CFCA_UKEY_csp) at HKLM\SOFTWARE\Microsoft\C... | Uninstall CFCA UKEY-related software. Verify no third-party providers at HKLM... | 9.5 | onenote |
| 8 | Intune VPN profile for Palo Alto GlobalProtect deployed successfully to iOS d... | Known issue: The standard GlobalProtect VPN identifier is com.paloaltonetwork... | Use a Custom VPN profile or create a custom profile with XML payload that use... | 9.5 | onenote |
| 9 | iOS enrollment fails with Company Portal Temporarily Unavailable error message. | The Company Portal app on the device is out of date or corrupted. | 1. Remove the Company Portal app from the device. 2. Validate user credential... | 9.5 | onenote |
| 10 | Edge profile login on MDM-managed iOS device cannot SSO; user must enter user... | Auth request contains Prompt=login parameter which forces a fresh interactive... | 1) Collect broker logs from iOS device. 2) Check for Prompt=login in the auth... | 9.5 | onenote |
| 11 | Customer wants to prohibit or defer users from seeing/upgrading to the latest... | By default iOS devices see new OS updates immediately. Intune provides config... | Create iOS/iPadOS Configuration Profile: (1) Setting Catalog (preferred): set... | 9.5 | onenote |
| 12 | User unable to login Company Portal to complete Intune enrollment. Error: inv... | Customer domain was not in the ESTS ChinaDomainsToSkipRealmCacheLookup list, ... | Escalate to ESTS team (via ICM) to add customer domain to ChinaDomainsToSkipR... | 9.5 | onenote |
| 13 | Android device unable to enroll with Intune. Workplace Join (WPJ) failed duri... | Customer domain was verified by both Global Azure AD and 21Vianet Azure AD. i... | Customer needs to remove the domain from the Global tenant. Having domain ver... | 9.5 | onenote |
| 14 | After Teams Win32 deployment succeeds via Autopilot on Windows 24H2, end user... | Windows 24H2 image includes built-in MSTeams v1.0 which does not include CN r... | 1) Deprovision the built-in v1.0: teamsbootstrapper.exe -x. 2) Provision new ... | 9.5 | onenote |
| 15 | Autopilot V2 (Windows Device Preparation) enrollment fails in China mainland ... | The official Intune China endpoints documentation is incomplete. Autopilot V2... | Whitelist required URLs: clientconfig.passport.net, config.edge.skype.com, ww... | 9.0 | onenote |
| 16 | iOS 应用 MSAL 认证成功后 Intune enrollment 失败 | 传入 registerAndEnrollAccountId 的 account ID 错误——使用了 account.identifier 而非 tena... | 使用 msalResult.tenantProfile.identifier 而非 msalResult.account.identifier 或 msa... | 9.0 | ado-wiki |
| 17 | iOS enrollment troubleshooting requires correlating Kusto data across DeviceL... |  | Query DeviceLifecycle by userId to get scenarioType/ActivityId/managementStat... | 8.5 | onenote |
| 18 | Device check-in fails for multiple devices in Mooncake. Spike in 302 redirect... | Service-side issue causing spike in 302 redirect failures on Mooncake Intune ... | Filed as LSI (Large Scale Incident), MC: IT717941. Service team resolved with... | 8.5 | onenote |
| 19 | iOS/iPadOS User Enrollment method is not available in 21v (Mooncake) Intune; ... | User Enrollment (as a distinct Apple enrollment type using managed Apple ID) ... | Use BYOD enrollment via Company Portal or ADE (Automated Device Enrollment) i... | 8.5 | onenote |
| 20 | Intune 中 Microsoft Endpoint Manager / Endpoint Analytics / Log Analytics 在 21... | Microsoft Endpoint Manager 及相关分析功能在 21V 未上线 | 不支持；无替代方案，跟踪 DCR 进展 | 8.0 | 21v-gap |
| 21 | Intune 中 Tenant Attach 在 21V 环境不可用 | Tenant Attach 功能在 21V 未上线 | 不支持；使用本地 SCCM 管理，不进行 Tenant Attach | 8.0 | 21v-gap |
| 22 | Intune On-Premises Exchange Connector 在 21V 不可用 | Global 已于 CY22 EOL，PM 确认永不会 GA 到 21V | 不支持；迁移到 Exchange Online 或使用 Hybrid Modern Auth | 8.0 | 21v-gap |
| 23 | Intune 中 Microsoft Store（新版）应用部署在 21V 不可用 | 合规问题（win-get）；PM 确认不会支持 Mooncake | 不支持；改用 Win32 app 或 LOB app 部署方式 | 8.0 | 21v-gap |
| 24 | Android 设备通过 Intune 合规策略使用 SafetyNet Device Attestation 在 21V 无效 | SafetyNet Device Attestation 依赖 Google Mobile Services（GMS），在 21V 中国环境不可用 | 不支持；不要在 21V 合规策略中配置 SafetyNet 要求 | 8.0 | 21v-gap |
| 25 | Intune 无法在 21V 管理来自 Google App Store 的应用 | 依赖 Google Mobile Services（GMS），在 21V 中国环境不可用 | 不支持；改用 LOB 应用部署或侧载 APK | 8.0 | 21v-gap |
| 26 | Intune Android Enterprise 在 21V 无法注册或管理 | Android Enterprise 依赖 Google Mobile Services（GMS），在 21V 中国环境不可用 | 不支持；改用 Android Device Administrator (DA) 模式注册管理设备 | 8.0 | 21v-gap |
| 27 | Intune Android (AOSP) 企业设备管理在 21V 不可用 | 依赖 OEM 支持 AOSP；DCR-M365-6783 已提交但尚未完成 | 不支持；改用 Android DA 模式；跟踪 DCR-M365-6783 进展 | 8.0 | 21v-gap |
| 28 | Intune 通过 Jamf 管理 macOS 设备在 21V 不可用 | Partner device management integration with Jamf 依赖 Jamf Apple Management，在 21... | 不支持；改用 Intune 原生 MDM 直接注册 macOS 设备 | 8.0 | 21v-gap |
| 29 | Intune Fencing 功能在 21V 不可用 | Fencing 功能在 21V 未上线 | 不支持；使用其他地理围栏或条件访问策略替代 | 8.0 | 21v-gap |
| 30 | Intune 中 Enterprise Application 在 21V 不可用 | 依赖 Azure 功能，21V Azure 相关依赖未满足 | 不支持；改用 LOB 应用或 Win32 应用部署 | 8.0 | 21v-gap |
| 31 | Intune 中 Microsoft Edge 登录功能在 21V 不稳定或不可用 | Microsoft Edge Sign In 依赖 AAD 相关功能，21V AAD 依赖未完全满足 | 不支持；检查 AAD 设置及条件访问策略；Edge 可能需要单独配置 | 8.0 | 21v-gap |
| 32 | AVD (Azure Virtual Desktop) 设备无法通过 21V Intune 注册管理 | Feature 15571094 追踪中，尚未支持 | 不支持；暂时使用 GPO 或手动配置管理 AVD 设备；跟踪 Feature 15571094 | 8.0 | 21v-gap |
| 33 | AVD (Azure Virtual Desktop) session hosts cannot be enrolled to Intune in Moo... | Intune management for AVD Azure AD-joined VMs is only supported in Azure Publ... | No officially supported enrollment path for AVD in 21v as of 2023-05. Workaro... | 8.0 | onenote |
| 34 | Customer requests Microsoft Tunnel VPN configuration via 21v Intune; Tunnel g... | Microsoft Tunnel requires Microsoft Defender for Endpoint integration which i... | Use third-party VPN apps deployed via Intune App Protection or Per-App VPN pr... | 8.0 | onenote |
| 35 | Customer cannot set up Android Enterprise (Work Profile, Fully Managed/COBO, ... | Android Enterprise requires Google Mobile Services (GMS) specifically Google ... | Use Android Device Administrator (DA) management mode instead. 21v Intune sup... | 8.0 | onenote |
| 36 | Cannot deploy Microsoft Store (new) apps or winget-sourced application packag... | Microsoft Store (new) app type relies on Windows Package Manager (winget). Mi... | Use Win32 app packaging (.intunewin format) for all custom Windows app deploy... | 8.0 | onenote |
| 37 | Cannot access Intune Kusto cluster for Mooncake (intunecn.chinanorth2.kusto.c... | IntuneKusto-CSS entitlement only grants access to Global Intune Kusto cluster... | Request the 'IntuneKusto-CSSMooncake' entitlement from CoreIdentity portal (h... | 8.0 | onenote |
| 38 | iOS user-created email profile blocks Intune profile deployment. Not compliant. | Duplicate email profile detected based on hostname and email address. | Remove manually created email profile before/after enrollment. | 8.0 | mslearn |
| 39 | Deploying device configuration profile to iOS: error 2016341112 iOS device is... | iOS device busy (locked/installing) sends NotNow status via MDM protocol. | Unlock the iOS device. Profile applied automatically once unlocked. | 8.0 | mslearn |
| 40 | Android Enterprise fully managed: password settings deployment fails when pro... | Profile assigned after enrollment does not prompt user during setup. | Assign device restrictions profile with password settings before enrollment. | 8.0 | mslearn |
| 41 | FRP emails not enforced as expected on Android Enterprise after factory reset. | FRP varies by enrollment type/reset method. COPE: Settings reset enforced; CO... | Block Factory reset in restrictions; use Recovery mode for FRP enforcement. | 8.0 | mslearn |
| 42 | Android Enterprise work profile device ownership auto-changed from Personal t... | Corporate device identifier (IMEI/serial) added for the device in Intune Admi... | Delete the corporate identifier, then change device ownership back to Personal. | 8.0 | mslearn |
| 43 | SafetyNet device attestation and Verify Apps settings block users in regions ... | SafetyNet and Verify Apps APIs require Google Play Services which is unavaila... | Do not target SafetyNet attestation or Verify Apps settings for users without... | 7.5 | ado-wiki |
| 44 | Windows MAM 在 GCC-H 或 Mooncake (China) 环境中不可用 | 截至 2023年9月，Windows MAM 功能不支持 GCC-H 和 Mooncake (21Vianet) 云环境，存在阻止 FF/CN 环境的 bug | 1. 确认客户环境是否为 GCC-H 或 Mooncake；2. 如是，告知客户当前不支持，需等待产品团队修复；3. 建议使用替代方案如设备注册 + Co... | 7.5 | ado-wiki |
| 45 | Windows Backup for Organizations 功能在 GCC-H 或 Mooncake (21Vianet) 环境不可用 | Windows Backup for Organizations 目前不支持 GCC-H 和 Mooncake 环境，Portal 配置租户级设置时有明确提示 | 此功能在 GCC-H/Mooncake 暂不支持，计划 1Q26CY 支持。告知客户等待功能上线 | 7.5 | ado-wiki |
| 46 | Linux 设备初始注册时出现 Error 2400 / 'Something went wrong' | JavaBroker（identity broker <2.0.2）在新安装或重启后需要 5-10 分钟才能启动 | 等待 5-10 分钟后重试注册。如果问题持续，确认 microsoft-identity-broker 服务正在运行: systemctl --user ... | 7.5 | ado-wiki |
| 47 | Unable to sign-in to Office applications on Apple devices | Office 365 OneDrive and OneNote apps for iOS and Android updated to use new a... | Use customer facing KB 3015526. If unresolved, consult CSS Intune Escalations. | 7.5 | contentidea-kb |
| 48 | Android device enrollment fails or shows device as rooted. Common fixes: 1) T... |  |  | 7.5 | contentidea-kb |
| 49 | Customer has AirWatch as his MDM and is using MAM w/o enrollment (with the In... | By Design | Only files can be shared on a 3rd Party MDM vendor when the EMM UPN[IntuneMAM... | 7.5 | contentidea-kb |
| 50 | When attempting to enroll an iOS device, the enrollment process fails with th... | This can occur if the user has attempted to enroll more devices then the conf... | To resolve this problem, first verify how many devices the user has enrolled,... | 7.5 | contentidea-kb |
| 51 | You may encounter a customer stating that users are unable to create new cont... | This isn't actually an Intune problem even though customers may report it as ... | A new version of the Outlook app for iOS and Android became available in June... | 7.5 | contentidea-kb |
| 52 | When attempting to enroll an Android or iOS device using the device's reporte... | This is by design but does not necessarily apply to all devices. Most devices... | Note: As of 7/9/19 it is no longer supported to use IMEI on Android and IOSWh... | 7.5 | contentidea-kb |
| 53 | iOS enrollment fails with: Profile Installation Failed. Connection to the ser... | Device was previously enrolled by a different user and the previous user devi... | Login to Azure portal, go to Devices > All Devices, find the device using pre... | 7.5 | contentidea-kb |
| 54 | A user attempts to enroll an iOS based device via the Company Portal applicat... | The Safari browser is configured to "Block All Cookies". | After configuring the Safari browser to allow Cookies, as below, attempt to e... | 7.5 | contentidea-kb |
| 55 | You notice that the Intune Company Portal app for Android no longer receives ... | This can occur if the Company Portal app has not been manually approved in th... | To manually approve the Company Portal app, complete the following steps:1. B... | 7.5 | contentidea-kb |
| 56 | Attempting to enroll an iOS device using the Company Portal app fails with th... | This can occur if the Azure Active Directory Enterprise Applications Microsof... | To resolve this problem complete the following: 1. Open a browser and navigat... | 7.5 | contentidea-kb |
| 57 | When trying to deploy email settings to Outlook for iOS & Android you need to... | incorrect documentation on: https://technet.microsoft.com/EN-US/library/mt829... | Prerequisites: Deploy Outlook as AFW application Next, go to Mobile apps - Ap... | 7.5 | contentidea-kb |
| 58 | User is unable to enroll a Mac into Intune. Each time the login is successful... | Customer made changes to firewall/proxy settings that prevented the enrollmen... | Customer disabled the proxy and the device was able to enroll. | 7.5 | contentidea-kb |
| 59 | When configuring the Cisco AnyConnect VPN client on Android phones, the follo... | This is by design. | This is expected behavior when the Cisco AnyConnect client is used on Android... | 7.5 | contentidea-kb |
| 60 | During IOS enrollment using the Company Portal app, when it redirects to the ... | This can occur if JavaScript is turned off in Safari on the iOS device.This c... | To resolve this problem, turn on JavaScript for the Safari browser on the iOS... | 7.5 | contentidea-kb |
| 61 | Password expiration (days) setting for Android devices in Intune does not pro... | Timer resets every time the policy is edited, even without changing expiratio... | Check policy Last Modified date in Azure Portal. Expiration is relative to La... | 7.5 | contentidea-kb |
| 62 | Starting with the Intune Managed Browser version 1.2.8, diagnosing issues wit... |  |  | 7.5 | contentidea-kb |
| 63 | In many organizations, it�s very common to allow end users to use both Intune... |  |  | 7.5 | contentidea-kb |
| 64 | If you are a customer who is managing Android Enterprise devices with a work ... |  |  | 7.5 | contentidea-kb |
| 65 | After setting Intune enrollment restrictions to require a minimum iOS version... | This is a known issue with iOS 11.3.1. The issue was addressed in iOS 11.4 so... | To work around this problem, configure the iOS platform enrollment restrictio... | 7.5 | contentidea-kb |
| 66 | You see the following error after deploying the iOS Home Screen Layout device... | There are 2 main settings in the Home Screen Layout policy: DockPages While t... | **Important: Other than the error in the console, this issue has no impact on... | 7.5 | contentidea-kb |
| 67 | After deploying a device restriction policy&nbsp;with the setting Personal Ho... | This is expected behavior on Apple's iOS operating system version 12.1 and ea... | Have user upgrade&nbsp;the device to iOS version 12.2 or later | 7.5 | contentidea-kb |
| 68 | Customers who are attempting to enable Auto Enrollment in their tenants that ... | The blade to enable the Auto Enrollment feature is currently not enabled by d... | To resolve this issue GCC High Tenants should login as an admin and then past... | 7.5 | contentidea-kb |
| 69 | Outlook Announcements  There has been a recent change in GCC customers.&nbsp;... |  |  | 7.5 | contentidea-kb |
| 70 | This document provides an overview of the&nbsp;LogMeIn Rescue experience when... |  |  | 7.5 | contentidea-kb |
| 71 | Is there a way to prevent downloading of mail attachments in Windows Phone 8.... | This is a feature that can be achieved using Android or iOS but in the Azure ... | This can be achieved in Windows 8.1 and Windows 10 manually enabling it. But ... | 7.5 | contentidea-kb |
| 72 | In the legacy Android Administrator enrollment type, the Intune Administrator... | Tips and TricksAn Line of Business application in Intune that is published to... | Some more information in regards to Managed Google Play store:&nbsp;The Googl... | 7.5 | contentidea-kb |
| 73 | After enrolling an Android or iOS device in Intune, the device fails to recei... | This can occur if&nbsp;the device has not yet registered.&nbsp;Newly enrolled... | To resolve this issue, wait at least 15 minutes before attempting to send a c... | 7.5 | contentidea-kb |
| 74 | The customer reported that on his iOS Supervised device Intune was blocking t... | If you enable any type of Web Content Filter these options get blocked from t... | Change the Web Content Filter to &quot;Not configured&quot; in the Intune Pol... | 7.5 | contentidea-kb |
| 75 | Scenario 1Actual IssuePasscode Reset Failed in the Intune PortalImpact to Adm... |  |  | 7.5 | contentidea-kb |
| 76 | There are a lot of different acronyms and jargon specific to Android. See the... |  | Android Device Admin / Legacy Android API / Also known as DAhttps://docs.micr... | 7.5 | contentidea-kb |
| 77 | SetupIntroductionWhat is the benefit?Get the Microsoft Edge app for users on ... |  |  | 7.5 | contentidea-kb |
| 78 | When using an app with Xamarin bindings for an app deployed in a sovereign cl... | This can occur because in sovereign cloud environments, such as GCC High, the... | The application must provide the authority to registerAccountForMAM().This ca... | 7.5 | contentidea-kb |
| 79 | Windows Software Inventory information discrepancies - When you receive a cas... | Missing apps (assuming Management Extension is installed, this is a pre-requi... | There have been a few changes to this area introduced in 2001 that allowed th... | 7.5 | contentidea-kb |
| 80 | This article will provide details for the assignment of Device restrictions p... | When enrolling COBO device, we can see some of the device configuration setti... | The PIN code configuration should be assigned before the enrollment, as the P... | 7.5 | contentidea-kb |
| 81 | When attempting to enroll an Android fully-managed device, the enrollment pro... | This can occur if multi-factor authentication (MFA) has been enabled at the s... | To resolve this problem, enable MFA for the users performing enrollment. For ... | 7.5 | contentidea-kb |
| 82 | Follow this&nbsp;process&nbsp;if you receive an advisory ticket for an Intune... |  |  | 7.5 | contentidea-kb |
| 83 | Microsoft Intune adds compliance state data for Azure Active Directory to all... |  |  | 7.5 | contentidea-kb |
| 84 | With Android Teams IP phones, whenever the user signs-out from the device usi... | This is by design. Teams IP Phones use the Company Portal for sign-in/out. Wi... |  | 7.5 | contentidea-kb |
| 85 | Customer with Intune 21V tenant account can't sign in Intune NDES Connector. ... | This is caused by NDESConnector&nbsp;configuration URL is not set properly.&n... | For Intune China customers, they will need to change some settings in config ... | 7.5 | contentidea-kb |
| 86 | Customer is using Google ZTE to enroll the Android device as fully managed wi... | Google confirmed the &quot;Reboot&quot; command currently only works on COPE ... | Reboot command is not supported for Android 11 yet. | 7.5 | contentidea-kb |
| 87 | With MAM policy applied to Word on iOS, users are not able to switch to or ad... | By design.&nbsp;Currently, MAM WE only allows for access to the managed accou... | Currently they are in development of adding account switching between managed... | 7.5 | contentidea-kb |
| 88 | You experience one of the following:1. Clicking on&nbsp;Check device settings... | This can occur if Company Portal Enrollment Availability is set to Unavailabl... | To resolve this problem complete the following:1. In the MEM portal, navigate... | 7.5 | contentidea-kb |
| 89 | Customer blocks personal enrollment for Android enterprise. So when user want... | This issue is normally because the device has been re-imaged, meaning that th... | To resolve this problem you must add the real serial number of the device. He... | 7.5 | contentidea-kb |
| 90 | Create contacts using Scan Business card option not available on Outlook Mobi... | This can occur when the follow is configured:App protection policy : &quot;Sc... | To resolve this problem, enable&nbsp;&quot;Screen capture and Google Assistan... | 7.5 | contentidea-kb |
| 91 | In order to identify the types of issues that are driving our Intune volume a... |  |  | 7.5 | contentidea-kb |
| 92 | Q. Can I have more than 1 MTD Partner per Tenant? A.&nbsp;As all the MTD inte... |  |  | 7.5 | contentidea-kb |
| 93 | When attempting to enroll an Android fully managed device, you receive the fo... | This can occur if a DEM account is being used. According to the official docu... | To resolve this problem, check to see if the impacted user is DEM account und... | 7.5 | contentidea-kb |
| 94 | After enrolling Samsung devices into Intune as Android&nbsp;Fully Managed or ... |  |  | 7.5 | contentidea-kb |
| 95 | Intune integrates with IBM MaaS360 to ensure that only trusted users from com... |  |  | 7.5 | contentidea-kb |
| 96 | This article will help you understand the core information of the Android AD ... |  |  | 7.5 | contentidea-kb |
| 97 | The customer assigned multiple VPN profiles, for different MTG sites, to the ... |  |  | 7.5 | contentidea-kb |
| 98 | What is Tableau Mobile app for Intune?Tableau Mobile app for Intune supports ... |  |  | 7.5 | contentidea-kb |
| 99 | Linux machines can now be enrolled in Intune (Enroll a Linux device in Intune... |  |  | 7.5 | contentidea-kb |
| 100 | Intune Tenant Service Release 2303 introduced a new feature for multiple enro... | When receiving an Android case regarding Fully Managed multiple enrollment pr... | Assign at least Read permission to the scope tags in use by the Enrollment Pr... | 7.5 | contentidea-kb |
| 101 | Attempting to enroll an Android Enterprise device (formerly Android for Work,... | This can occur if&nbsp;Android work profile&nbsp;enrollment for personally ow... | To resolve this problem, implement&nbsp;either&nbsp;of the following:  1. Con... | 7.5 | contentidea-kb |
| 102 | In Recent few cases we have seen that with Introduction of Edge Drop feature ... | Edge drop is a new feature that allows users to share the data across mobile ... | In order to solve this We can make use of the App config policy in order to d... | 7.5 | contentidea-kb |
| 103 | The instructions located on the Meta website for Intune enrollment are not ve... | At the time of writing this article, the webpage indicates that you can selec... | The Json file can be downloaded with these steps:  Go to Endpoint.microsoft.c... | 7.5 | contentidea-kb |
| 104 | This article helps to address issue where admins are not able to enroll devic... | The MDM Authority was set to Microsoft Office 365 hence even Global admin was... | Set MDM authority to Intune:&nbsp;Set the mobile device management authority ... | 7.5 | contentidea-kb |
| 105 | When using an app protection policy with the setting 'Send org data to other ... | This is due the Read Aloud feature being part of the Accessibility Suite appl... | If the customer cannot set to All Apps. They can have it set to Policy Manage... | 7.5 | contentidea-kb |
| 106 | Locate Android device with kiosk (dedicated) mode is failing &nbsp;  &nbsp;  ... | It is needed to change&nbsp;this setting via&nbsp;Graph &quot;shareDeviceLoca... | Via Graph, I see that there is setting added that can only be seen via Graph ... | 7.5 | contentidea-kb |
| 107 | Add Troubleshoot section to DMC: Intune: How-to guides>Set up Android Enrollment |  |  | 7.5 | contentidea-kb |
| 108 | Add Troubleshoot section to DMC: Intune: How-to guides>Set up iOS Enrollment |  |  | 7.5 | contentidea-kb |
| 109 | Archive and redirect: iOS Enrollment GWT |  |  | 7.5 | contentidea-kb |
| 110 | Add Troubleshoot section to DMC: Intune: Troubleshoot Android device enrollment |  |  | 7.5 | contentidea-kb |
| 111 | Request to host Android Remote Help EULA |  |  | 7.5 | contentidea-kb |
| 112 | Android DA device reported Noncompliant with rules: SecurityBlockJailbrokenDe... | Device is rooted OR SafetyNet attestation is failing — device does not pass G... | Use Kusto: `CalculationQueueLibrary / where deviceId == '{deviceId}' / projec... | 7.0 | onenote |
| 113 | Mac enrollment fails with HTTP 404 error when installing management profile. ... | PG confirmed this was a Node issue in the Mooncake (21Vianet) environment. Th... | 1. Collect macOS MDM client logs (mdmclient) to compare working vs non-workin... | 7.0 | onenote |
| 114 | After deploying a device restriction policy with the setting Personal Hotspot... | This is expected behavior on Apple's iOS operating system version 12.1 and ea... | Have user upgrade the device to iOS version 12.2 or later | 4.5 | contentidea-kb |
| 115 | Customers who are attempting to enable Auto Enrollment in their tenants that ... | The blade to enable the Auto Enrollment feature is currently not enabled by d... | To resolve this issue GCC High Tenants should login as an admin and then past... | 4.5 | contentidea-kb |
| 116 | This document provides an overview of the LogMeIn Rescue experience when conn... |  |  | 4.5 | contentidea-kb |
| 117 | Is there a way to prevent downloading of mail attachments in Windows Phone 8.... | This is a feature that can be achieved using Android or iOS but in the Azure ... | This can be achieved in Windows 8.1 and Windows 10 manually enabling it. But ... | 4.5 | contentidea-kb |
| 118 | Outlook Announcements There has been a recent change in GCC customers. You ca... |  |  | 3.0 | contentidea-kb |
| 119 | In the legacy Android Administrator enrollment type, the Intune Administrator... | Tips and Tricks An Line of Business application in Intune that is published t... | Some more information in regards to Managed Google Play store: The Google Pla... | 3.0 | contentidea-kb |

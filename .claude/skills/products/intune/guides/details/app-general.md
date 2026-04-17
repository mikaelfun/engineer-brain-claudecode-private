# INTUNE 应用部署通用问题 — 已知问题详情

**条目数**: 132 | **生成日期**: 2026-04-17

---

## Quick Troubleshooting Path

### Step 1: LOB app update behavior varies by platform and assignment type; iOS auto-updates silently for Available assignment while Android prompts user if Ch...
**Solution**: Upload LOB app and replace original deployment (verify version reflects update). iOS Available: silent auto-update. iOS Required: auto-update. Android Available/Required: prompt if Check apps from external sources enabled; disable setting for silent update.
`[Source: onenote, Score: 9.5]`

### Step 2: macOS LOB app (.pkg wrapped to .intunemac) shows Install status in Company Portal even after successful installation. App is usable but status neve...
**Solution**: Extract the .pkg file using 'xar -x -f <pkg> -C <output>' and verify each sub-package install-location. Ensure all packages install to /Applications or its child folder. If the .pkg contains utilities installing to /usr/local/bin or /Library/Application Support, consider repackaging or using a custom detection script.
`[Source: onenote, Score: 9.5]`

### Step 3: After deploying app as Available type to user group, end user unable to see the app in Company Portal or app takes very long time to appear; Compan...
**Solution**: 1. Check Kusto HttpSubsystem for Company Portal API calls: filter by deviceId, verify resultCount. 2. Check EffectiveGroupMembershipsUserService_RawData for EffectiveGroupChangeTime. 3. Check PolicyAssignmentProvider for policy assignment count changes. 4. Compare timestamps between group change and Company Portal query. 5. If resultCount=0 after group change, wait for replication (typically minutes, can be hours). 6. For apps assigned to 'All Users', verify the assignment is effective regardles
`[Source: onenote, Score: 9.5]`

### Step 4: Cannot deploy Windows Company Portal app as 'Required' to devices via Microsoft Store legacy in Intune; only 'Available' assignment type supported
**Solution**: Download Company Portal offline installer from Microsoft Download Center (https://www.microsoft.com/en-us/download/details.aspx?id=105219) and deploy as Required LOB app. Long-term: PG plans to support via winget
`[Source: onenote, Score: 9.5]`

### Step 5: MSI LOB app deployed via Intune fails to download; no MSI file in C:\Windows\System32\config\systemprofile\AppData\Local\mdm; registry Status=30 (D...
**Solution**: 1) Check registry EnterpriseDesktopManagement for Status (30=DownloadFailed); 2) Run Bitsadmin /list /allusers; 3) Check BITS event log; 4) Reset EnforcementRetryCount and EnforcementRetryIndex to 0, clear LastError and Status to retry
`[Source: onenote, Score: 9.5]`

### Step 6: MSI LOB app downloaded but fails silent installation; no install log at expected path
**Solution**: 1) Check logs: device-targeted at %windir%\temp\{MSIProductID}.msi.log; 2) Enable verbose MSI logging via registry (Debug=7, Logging=voicewarmupx); 3) Manual test: msiexec /I package.msi /l*vx log; 4) Check MDM event log
`[Source: onenote, Score: 9.5]`

### Step 7: Intune always reports Company Portal (WinCP) LOB app deployment as Failure on Windows clients. Detection finds installed version mismatch. Error 0x...
**Solution**: PG confirmed: this is expected behavior for store-signed LOB apps. 1) Accept the failure status as cosmetic. 2) Use winget to download CP: winget download company portal --source msstore. 3) Do NOT use Download Center link. 4) PG is exploring alternative deployment methods.
`[Source: onenote, Score: 9.5]`

### Step 8: iOS LOB/IPA 应用从 Company Portal 安装失败，提示安装错误
**Solution**: 1. 确认 IPA 以 Corporate/Enterprise 方式导出（非 Ad Hoc）；2. 验证 .ipa 和 plist 文件匹配；3. 检查 Apple 签名证书是否过期；4. 先在设备上手动安装测试，排除非 Intune 问题；5. 收集 iOS console log 进一步排查
`[Source: ado-wiki, Score: 9.0]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | LOB app update behavior varies by platform and assignment type; iOS auto-upda... | Platform-specific LOB update handling: iOS auto-updates installed Available L... | Upload LOB app and replace original deployment (verify version reflects updat... | 9.5 | onenote |
| 2 | macOS LOB app (.pkg wrapped to .intunemac) shows Install status in Company Po... | The .pkg file contains multiple app installers (e.g., Wireshark has 3 sub-pac... | Extract the .pkg file using 'xar -x -f <pkg> -C <output>' and verify each sub... | 9.5 | onenote |
| 3 | After deploying app as Available type to user group, end user unable to see t... | Effective group membership change has not yet propagated to Intune backend. W... | 1. Check Kusto HttpSubsystem for Company Portal API calls: filter by deviceId... | 9.5 | onenote |
| 4 | Cannot deploy Windows Company Portal app as 'Required' to devices via Microso... | Microsoft Store legacy integration only supports 'Available' assignment type ... | Download Company Portal offline installer from Microsoft Download Center (htt... | 9.5 | onenote |
| 5 | MSI LOB app deployed via Intune fails to download; no MSI file in C:\Windows\... | BITS job fails to download the MSI package. Common causes: network/proxy bloc... | 1) Check registry EnterpriseDesktopManagement for Status (30=DownloadFailed);... | 9.5 | onenote |
| 6 | MSI LOB app downloaded but fails silent installation; no install log at expec... | MSI package fails to install silently via Intune MDM enforcement. Silent inst... | 1) Check logs: device-targeted at %windir%\temp\{MSIProductID}.msi.log; 2) En... | 9.5 | onenote |
| 7 | Intune always reports Company Portal (WinCP) LOB app deployment as Failure on... | Store-signed apps like Company Portal receive automatic updates from Windows ... | PG confirmed: this is expected behavior for store-signed LOB apps. 1) Accept ... | 9.5 | onenote |
| 8 | iOS LOB/IPA 应用从 Company Portal 安装失败，提示安装错误 | 常见原因：IPA 以 Ad Hoc（而非 Corporate/Enterprise）方式导出、.ipa 与 plist 文件不匹配、签名证书过期 | 1. 确认 IPA 以 Corporate/Enterprise 方式导出（非 Ad Hoc）；2. 验证 .ipa 和 plist 文件匹配；3. 检查... | 9.0 | ado-wiki |
| 9 | DISA Purebred v3 app 无法与旧版 Company Portal 配合完成 derived credential 导入流程 | Purebred v3 app 仅支持 Company Portal 5.2509.0 及以上版本，旧版 CP 不兼容 v3 Purebred app | 1. 将 Company Portal 更新至 5.2509.0+（兼容新旧 Purebred app）；2. 或将 Purebred app 回退到 v... | 9.0 | ado-wiki |
| 10 | macOS Platform SSO: 'app-sso platform -s' command shows null output after enr... | Either the com.apple.extensiblesso Profile is missing from System Settings (p... | Cause 1: Verify user/device is assigned to the Platform SSO device configurat... | 9.0 | ado-wiki |
| 11 | macOS Platform SSO: Platform Credential not available as passkey option in br... | Company Portal is not enabled under 'Use passwords and passkeys from' in macO... | Open System Settings > Passwords and enable 'Company Portal' under 'Use passw... | 9.0 | ado-wiki |
| 12 | Android LOB (.apk) app download fails via Intune Company Portal on cellular n... | HTTP 499 means the client disconnected before the server completed the respon... | Use corporate Wi-Fi network for LOB app installation to avoid network instabi... | 8.5 | onenote |
| 13 | iOS LOB app shows unexpected version after wrapping with Intune App Wrapping ... | The Intune App Wrapping Tool replaces CFBundleVersion value during wrapping. ... | Use plutil on macOS: plutil -p Info.plist / grep -i vers. CFBundleShortVersio... | 8.5 | onenote |
| 14 | Need to check iOS App Store app version details for troubleshooting Intune ap... |  | Use iTunes Store API: https://uclient-api.itunes.apple.com/WebObjects/MZStore... | 8.5 | onenote |
| 15 | Android LOB app update prompts user to install instead of auto-updating when ... | When 'Check apps from external sources' (Verify apps over USB / Play Protect ... | For silent auto-update on Android: disable 'Check apps from external sources'... | 8.5 | onenote |
| 16 | Android LOB app stuck in ERROR_APP_INSTALL_CANCELLED state. App download init... | In China mainland, Google Play services are blocked by firewall. Android LOB ... | 1. During app download, manually switch to Company Portal Settings and click ... | 8.5 | onenote |
| 17 | Applications don't appear as Available in the Intune Company Portal app on Wi... | Users haven't identified their device in the Information Worker portal (IW po... | Users must go to portal.manage.microsoft.com → My Devices → Tap here → select... | 8.0 | mslearn |
| 18 | Error 0x87D13BA2 'One or more apps contain invalid bundleIDs' when deploying ... | Multiple applications included in the macOS app package; not all individual a... | 1) Run 'sudo /usr/libexec/mdmclient QueryInstalledApps > InstalledApps.txt' o... | 8.0 | mslearn |
| 19 | Question whether SCCM can still deploy applications to co-managed devices aft... | Switching Client Apps workload to Intune enables Intune app deployment but do... | After switching Client Apps workload to Intune: 1) Intune-deployed available ... | 7.5 | onenote |
| 20 | GCC-H (Fairfax) 租户客户无法从 Microsoft Store 部署或更新 Company Portal，因为 Fairfax 租户不支持... | GCC-H Fairfax 租户中新版 Microsoft Store 不可用，无法直接通过 Store 推送 Company Portal | 1. 在商业账号（非 GCC-H UPN，否则下载会被阻止）下运行：winget download --id 9WZDNCRFJ3PZ --source ... | 7.5 | ado-wiki |
| 21 | After deploying a WebClip application to an iOS or Android device as Required... | This can occur if the web clip has been deployed as a Required app and the us... | Remove the deployment prior to migrating the user, then redeploy after migrat... | 7.5 | contentidea-kb |
| 22 | This article describes the general support boundaries for app packaging and a... |  |  | 7.5 | contentidea-kb |
| 23 | When you attempt to save the configuration profile with the .csv files for io... | The format has changed in the new portal | The format has changed in the new portal and must be in this format:<app url>... | 7.5 | contentidea-kb |
| 24 | Android only (iOS and Windows still working) devices are not able to login to... | The Azure AD Connect process for Device Write back is not configured or is co... | Disable and Re-enable Device WritebackReference Article: https://docs.microso... | 7.5 | contentidea-kb |
| 25 | Customer wants advisory for the following two areas:1. Recommended practices ... | Advisory | This advisory is written to address not only the two questions below, but app... | 7.5 | contentidea-kb |
| 26 | Users are unable to launch the &quot;All apps&quot; link in the Company Porta... | A configuration policy is configured to either disable or hide Safari on iOS ... | Need to ensure that Safari is not being disabled or blocked in the General Co... | 7.5 | contentidea-kb |
| 27 | When opening a Image in MS Teams App on iOS or Android devices it will need t... | Configuration or missing the AIP App \ Policy on the Device | [Policy Setup]  1. Open the Intune Azure Portal  2. Navigate to Intune Mobile... | 7.5 | contentidea-kb |
| 28 |  | The error occurs when the Company Portal app checks our certificates on ADFS ... | Import the certs up the chain into the intermediate store on the ADFS Proxy S... | 7.5 | contentidea-kb |
| 29 | This article explains how to collect SysDump logging from a Samsung device ru... |  | Open the Phone app. Type *#9900# This will open the SysDump menu. Tap DEBUG L... | 7.5 | contentidea-kb |
| 30 | When setting up Data Alert and Intune integration on iOS and Android devices,... | Still under investigation. | Check the following Service Principal with the AAD Service Principal Policy D... | 7.5 | contentidea-kb |
| 31 | https://internal.support.services.microsoft.com/help/3090505 References the p... |  |  | 7.5 | contentidea-kb |
| 32 | Customer cannot manage iOS and Android devices in Intune for Education portal... | By Design.  Intune for Education manages Windows 10 devices.  However, custom... | Follow the Intune documentation for managing iOS and Android devices: https:/... | 7.5 | contentidea-kb |
| 33 | What inventory is collected per device. Mobile Device inventory collection pr... |  |  | 7.5 | contentidea-kb |
| 34 | After deploying a LOB application to MacOS or iOS, clients receive error: "Un... | Invalid URLs in the .plist file for the app. | Remove the invalid URLs or change them to valid URL addresses in the .plist f... | 7.5 | contentidea-kb |
| 35 | After deploying a LOB application to MacOS or iOS, error: "Unable to Download... | The iOS Distribution Certificate for the app has expired. | Obtain a new iOS Distribution Certificate from Apple, distribute a new versio... | 7.5 | contentidea-kb |
| 36 | After assigning an app to a group of Windows 10 clients as a Required app, th... | This is by design for Windows. Currently only iOS will automatically attempt ... | As a work around, create a second group that contains the same Windows 10 use... | 7.5 | contentidea-kb |
| 37 | When attempting to update an Android or iOS app, the following error message ... | This can occur if the initial APK or IPA file was uploaded without the app wr... | To resolve this problem:If the initial upload was done with the wrapper, the ... | 7.5 | contentidea-kb |
| 38 | When a customer deploys a mobile application as "Available" to a Device Group... | Unsupported | Available Install is not supported for mobile applications to a device group.... | 7.5 | contentidea-kb |
| 39 | Below are some steps that should allow you to enable Conditional Access (CA) ... |  |  | 7.5 | contentidea-kb |
| 40 | You can collect iOS Xcode/Console logs from a Windows PC. The link for the iO... | Old iOSLogInfo link did not support iOS 11.3, new link needed | Use SDSiOSLogInfo from Blackberry.com. Connect iOS device via USB, open admin... | 7.5 | contentidea-kb |
| 41 | When attempting to add a Windows 10 Line Of Business (LOB) app, you receive t... | This can occur if the downloaded app package file does not have a valid exten... | Give the download app package file a file extension of APPX, or whatever file... | 7.5 | contentidea-kb |
| 42 | Recently, Intune released some features that will make understanding and trou... |  |  | 7.5 | contentidea-kb |
| 43 | Beginning in April 2018, Company Portal users will be able to upload Intune-r... |  |  | 7.5 | contentidea-kb |
| 44 | When attempting to deploy a Line of Business (LOB) app to Android devices, th... | This can occur if the app is being assigned as a Required app to a user group... | To resolve this issue, assign the app as a Required app to a device group ins... | 7.5 | contentidea-kb |
| 45 | When wrapping a line of business (LOB) application using the Microsoft Intune... | The issue can occur when the application being wrapped is at or near the Andr... | To resolve this problem complete the following:1. Install the latest version ... | 7.5 | contentidea-kb |
| 46 | When querying for devices based on Corporate ownership, the value Corporate n... | The Corporate value is no longer used for the deviceOwnership attribute. | To work around this issue, replace Corporate with Company to query for corpor... | 7.5 | contentidea-kb |
| 47 | If your customer is reporting Managed Google Play applications are not auto-u... | There are many factors controlled by Google that can impact the app update be... | Managed Google Play app update overview The update experience for apps instal... | 7.5 | contentidea-kb |
| 48 | 1.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Create the web link app.  1)&nbsp;&nbs... |  |  | 7.5 | contentidea-kb |
| 49 | Customer had created an iOS provisioning profile and he could see that in the... | LOB app was expired. | Here are two expiry dates when we talk about the iOS provisioning profile:  1... | 7.5 | contentidea-kb |
| 50 | You notice that several iOS devices stop checking in. When launching the Comp... | In this particular case, the issue was isolated to a possible iOS bug which c... | The following appeared to address the issue:- [Reset All Settings] from the d... | 7.5 | contentidea-kb |
| 51 | A user uninstalls an iOS application that was previously deployed via Intune.... | This was occurring because the devices were reporting back to the service a s... | Resolved with 1903 Intune service release | 7.5 | contentidea-kb |
| 52 | The bookmarks based app configuration policy deploys to the Edge browser on i... | Edge for iOS does not support different app configuration profiles of the sam... | This is expected behavior on iOS,&nbsp;Alternate solution if you require diff... | 7.5 | contentidea-kb |
| 53 | When you apply Conditional Access policy to an iOS or Android store app, user... | The third party app does not support broker assisted logins | You need to work with the app vendor/publisher and request that they implemen... | 7.5 | contentidea-kb |
| 54 | When it comes to wrapping applications, there aren't many scenarios where an ... | Scenario 1 - Customer wants to wrap their application with Intune Wrapper but... | Scenario 1 - Customer wants to wrap their application with Intune Wrapper but... | 7.5 | contentidea-kb |
| 55 | To use Intune for broad deployment, Microsoft has provided MSI files&nbsp; th... |  |  | 7.5 | contentidea-kb |
| 56 | SummaryThis article providess some details on “version” properties we extract... |  |  | 7.5 | contentidea-kb |
| 57 | How Tohttps://docs.microsoft.com/en-us/intune/apps-addIntune supports a wide ... |  |  | 7.5 | contentidea-kb |
| 58 | AndroidDownload and install Android Studio (its free!)&nbsp;https://developer... |  |  | 7.5 | contentidea-kb |
| 59 | How Tohttps://docs.microsoft.com/en-us/intune/lob-apps-androidA line-of-busin... |  |  | 7.5 | contentidea-kb |
| 60 | https://docs.microsoft.com/en-us/intune/supported-devices-browsersIntune supp... |  |  | 7.5 | contentidea-kb |
| 61 | Android Enterprise dedicated devices running Android 9 stuck at Allow Permiss... | This occurs when customers apply Device restriction profile with this setting... | The workaround is to set Notification windows = &quot;Not configured&quot;.No... | 7.5 | contentidea-kb |
| 62 | A common question we get from customers is if/how we can block the Settings a... |  |  | 7.5 | contentidea-kb |
| 63 | Starting with Intune 1907, as administrator can send custom notifications to ... |  |  | 7.5 | contentidea-kb |
| 64 | Documentationhttps://docs.microsoft.com/en-us/intune/device-inventoryMobile D... |  |  | 7.5 | contentidea-kb |
| 65 | Welcome to Intune's workflow for&nbsp;App Based Conditional Access. Here you ... |  |  | 7.5 | contentidea-kb |
| 66 | A customer notices that the following MAM (App Protection policies have been ... |  |  | 7.5 | contentidea-kb |
| 67 | This article describes several tools that are useful for data collection to i... |  | General system informationRun the following command from a Terminal window:su... | 7.5 | contentidea-kb |
| 68 | Some of the features are deprecated due to multiple reasons - there is a lot ... |  |  | 7.5 | contentidea-kb |
| 69 | What are derived credentialsIn an environment where smart cards are required ... |  |  | 7.5 | contentidea-kb |
| 70 | VMware and Microsoft are working together to enable customers’ rapid move to ... |  |  | 7.5 | contentidea-kb |
| 71 | This article describes topics supported by Intune and some of the common issu... |  |  | 7.5 | contentidea-kb |
| 72 | In order to better understand Application Deployment, it is necessary to unde... |  |  | 7.5 | contentidea-kb |
| 73 | Coming soon: A step-by-step on configuring the most common app deployments fo... |  |  | 7.5 | contentidea-kb |
| 74 | Coming soon: A general overview of what we mean when we talk about Intune App... |  |  | 7.5 | contentidea-kb |
| 75 | Before you begin troubleshooting a problem, be sure to check for known Emergi... |  |  | 7.5 | contentidea-kb |
| 76 | Currently if you&nbsp;allow sideloading on Android Enterprise device owner de... |  |  | 7.5 | contentidea-kb |
| 77 | Symptoms   When testing Managed Google Play private app in our Intune Portal,... |  |  | 7.5 | contentidea-kb |
| 78 | Article DefinitionsDeep Links:&nbsp;A direct link to a website or a direct li... |  |  | 7.5 | contentidea-kb |
| 79 | This post is not about any new functionality or changes to the service, it’s ... |  |  | 7.5 | contentidea-kb |
| 80 | Purpose: This article is intended to redirect Intune support professionals to... |  |  | 7.5 | contentidea-kb |
| 81 | There are several moments when it is required to find the Intune App wrapper ... |  |  | 7.5 | contentidea-kb |
| 82 | SCCM Client deployed as INTUNE LOB App failing with Fatal Error on Win10 Mach... | LOB App was created using incorrect Client.MSI File from an incorrect locatio... | We have to create the SCCM Client LOB App using CcmSetup.MSI from the locatio... | 7.5 | contentidea-kb |
| 83 | When customer upload the new version of one IOS LOB app, It will finished wit... | Group A is a greater group which contains group B, Our user is granted the pe... | 1.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Based on the 403 forbidden... | 7.5 | contentidea-kb |
| 84 | How managed Google Play handles LOB app updates&nbsp; There are two activitie... |  |  | 7.5 | contentidea-kb |
| 85 | When working in Office application like Word&nbsp; or Excel or PowerPoint App... | This occurs because there is no App Configuration policy allowing the save. | To resolve this issue, create an App Configuration policy in the Endpoint&nbs... | 7.5 | contentidea-kb |
| 86 | Known Issues        Symptom&nbsp;         Possible Cause&nbsp;         SDK Ar... |  |  | 7.5 | contentidea-kb |
| 87 | The customer plans to deploy 3rd party apps and use a certificate for the aut... | This behavior is by-design. The trusted certificate profile for Android devic... |  | 7.5 | contentidea-kb |
| 88 | For most iOS app deployment issues, an engineer may be required to collect lo... |  |  | 7.5 | contentidea-kb |
| 89 | Users find that before wrapping an iOS LOB app, the app can be installed on i... | According to app install error code                           documentation:f... | To resolve this issue, update the Intune app wrapping tool for iOS to latest ... | 7.5 | contentidea-kb |
| 90 | Users are unable to switch networks while in the Managed Home Screen (MHS) on... | This is by-design per the&nbsp;addNetworkSuggestions API per Google.   We cal... | To work around this issue complete the following: Escape from MHS Change to y... | 7.5 | contentidea-kb |
| 91 | You can configure whether a required iOS/iPadOS app is installed as a removab... |  |  | 7.5 | contentidea-kb |
| 92 | Links help engineers improve understanding of the components and find answers... |  |  | 7.5 | contentidea-kb |
| 93 | Please try to find answers to following questions through lab experience and ... |  |  | 7.5 | contentidea-kb |
| 94 | Level 200+ troubleshooting skills required by a support topic SME – Advanced ... |  |  | 7.5 | contentidea-kb |
| 95 | These links help Support Engineers improve their understanding of the compone... |  |  | 7.5 | contentidea-kb |
| 96 | Please try to find answers to following questions through lab experience and ... |  |  | 7.5 | contentidea-kb |
| 97 | This article describes how to update a Google Play private (LOB) app for Andr... |  |  | 7.5 | contentidea-kb |
| 98 | When assigning an Android LOB app to a Zebra scanner device (which are based ... | Intune checks the hardware requirements of the App, which is defined by App d... | App developer modified the App requirements to be matching exactly the Androi... | 7.5 | contentidea-kb |
| 99 | This article describes how to properly configure a Device Configuration Admin... |  |  | 7.5 | contentidea-kb |
| 100 | Mobile devices have become powerful enough to support various computationally... |  |  | 7.5 | contentidea-kb |
| 101 | Customer have uploaded new app package for existing iOS LOB app.&nbsp;Our off... | We do allow admins to downgrade the app, i.e., allows the upload of an app wi... | It is an allowed scenario. | 7.5 | contentidea-kb |
| 102 | Customer is trying to update their Line of Business (LoB) app on iOS running ... |  | Customer should explore using&nbsp;Autonomous single app mode (ASAM) for thei... | 7.5 | contentidea-kb |
| 103 | These questions will help guide the troubleshooting process but should not be... |  |  | 7.5 | contentidea-kb |
| 104 | Some common issues with IBM MaaS360 include, but are not limited to:  1. Part... |  |  | 7.5 | contentidea-kb |
| 105 | Why does this look so bad? //To know what policies (Compliance, Device config... |  |  | 7.5 | contentidea-kb |
| 106 | First Emulator system requirements. For the best experience, you should use t... |  |  | 7.5 | contentidea-kb |
| 107 | The Intune PG is tracking 4 potential issues related to &quot;Microsoft Store... | For Issue 1: This symptom was resolved as of 12/13/2022 early AM PST. For Iss... | For Issue 1, this symptom was resolved 12/13/2022, early AM PST; customer may... | 7.5 | contentidea-kb |
| 108 | The MDM trace is the next level of troubleshooting to understand and identify... |  |  | 7.5 | contentidea-kb |
| 109 | Troubleshooting Conditional Access related issues with Intune could be relate... |  |  | 7.5 | contentidea-kb |
| 110 | This article describes how to trace an App Selective Wipe request for an iOS ... |  |  | 7.5 | contentidea-kb |
| 111 | Performing a repro (reproduction) of an Intune App protection issue involves ... |  |  | 7.5 | contentidea-kb |
| 112 | The customer has configured the following permissions per the existing docume... | The customer had configured the permissions outlined in the Entrust configura... | There has been a migration from Azure AD Graph to MS Graph.  https://learn.mi... | 7.5 | contentidea-kb |
| 113 | Customer is enrolling a device as Android Enterprise Personally Owned, Fully ... | If we look closely to the app type, we can see that the app type is &quot;Web... | If the customer uses&nbsp;&quot;Managed Google Play web link&quot; apps&nbsp;... | 7.5 | contentidea-kb |
| 114 | MC513662 and MC547638. App registration is now required for apps using the iO... |  | This is the App registration steps:  Go to Azure Active Directory &gt;App reg... | 7.5 | contentidea-kb |
| 115 | If you have a customer trying to configure a VPN Profile for MacOS via Intune... |  | To answer the question of,&nbsp;&quot;Can you configure Azure P2S VPN configu... | 7.5 | contentidea-kb |
| 116 | All new or updated internal KB articles, new content requests such as doc upd... |  |  | 7.5 | contentidea-kb |
| 117 | xinkun.yang@microsoft.comAfter sign-in Company portal app on the macOS, we st... | This is caused by device keychain access to local is locked and company porta... | Open the Keychain Access app on the Mac, check the&nbsp;Local Items&nbsp;keyc... | 7.5 | contentidea-kb |
| 118 | Xamarin.Android, Xamarin.iOS, Xamarin.Mac are now integrated directly into .N... |  |  | 7.5 | contentidea-kb |
| 119 | Intune: How to use Kusto to troubleshoot Remote Help issues for Android Enter... |  |  | 7.5 | contentidea-kb |
| 120 | Users encountering the &quot;error code: 0*0 Unknown&quot; on the Windows pla... | Multiple Company portal deployment from Intune.   Mixed install contexts. Dev... | Create one single company portal deployment with MS store new as UWP and remo... | 7.5 | contentidea-kb |
| 121 | In this article we will cover how to create Android LOB app, and how to gener... |  |  | 7.5 | contentidea-kb |
| 122 | Issue: Admins deploy Google play store Apps, or LOB Apps using Managed Google... | apps not added to any Collection | Apps need to be added in to App Collection, and any app is not listed under a... | 7.5 | contentidea-kb |
| 123 | Customer had created an iOS provisioning profile and he could see that in the... | LOB app was expired. | Here are two expiry dates when we talk about the iOS provisioning profile: 1.... | 4.5 | contentidea-kb |
| 124 | You notice that several iOS devices stop checking in. When launching the Comp... | In this particular case, the issue was isolated to a possible iOS bug which c... | The following appeared to address the issue: - [Reset All Settings] from the ... | 4.5 | contentidea-kb |
| 125 | A user uninstalls an iOS application that was previously deployed via Intune.... | This was occurring because the devices were reporting back to the service a s... | Resolved with 1903 Intune service release | 4.5 | contentidea-kb |
| 126 | When you apply Conditional Access policy to an iOS or Android store app, user... | The third party app does not support broker assisted logins | You need to work with the app vendor/publisher and request that they implemen... | 4.5 | contentidea-kb |
| 127 | 1. Create the web link app. 1) Sign in the Azure portal. 2) Select All servic... |  |  | 3.0 | contentidea-kb |
| 128 | The bookmarks based app configuration policy deploys to the Edge browser on i... | Edge for iOS does not support different app configuration profiles of the sam... | This is expected behavior on iOS, Alternate solution if you require different... | 3.0 | contentidea-kb |
| 129 | When it comes to wrapping applications, there aren't many scenarios where an ... | Scenario 1 - Customer wants to wrap their application with Intune Wrapper but... | Scenario 1 - Customer wants to wrap their application with Intune Wrapper but... | 3.0 | contentidea-kb |
| 130 | To use Intune for broad deployment, Microsoft has provided MSI files that adm... |  |  | 3.0 | contentidea-kb |
| 131 | Summary This article providess some details on “version” properties we extrac... |  |  | 3.0 | contentidea-kb |
| 132 | How To https://docs.microsoft.com/en-us/intune/apps-add Intune supports a wid... |  |  | 3.0 | contentidea-kb |

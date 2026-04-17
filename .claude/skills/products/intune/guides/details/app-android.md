# INTUNE Android 应用部署 — 已知问题详情

**条目数**: 101 | **生成日期**: 2026-04-17

---

## Quick Troubleshooting Path

### Step 1: Huawei device enrollment in Intune fails with overlay error - another app displaying over Settings blocks interaction.
**Solution**: (1) Disable floating window in Settings; (2) If Quick Memo, open Memo app Settings disable Quick Note; (3) Retry enrollment after closing overlay.
`[Source: onenote, Score: 9.5]`

### Step 2: Android 设备上应用部署显示 Install Failed 状态
**Solution**: 1. 查看 OMADM 日志中 'Error installing application <app name>, result code: <code>' 的 Android 错误码；2. 通过网络搜索该 Android result code 获取详细原因；3. 确认设备允许安装来自 Intune 的 APK；4. 验证 APK 已正确签名且 versionCode 比现有版本更高
`[Source: ado-wiki, Score: 9.0]`

### Step 3: Android 设备应用已完成安装，但 Intune Admin Center 的 App Details 页面状态未更新为已安装
**Solution**: 1. 等待 1-2 分钟；2. 离开 App Details 页面后重新导航回来手动刷新；3. 如长时间不更新则通过 Kusto 查询 Intune 服务端 app install 状态
`[Source: ado-wiki, Score: 9.0]`

### Step 4: 用户未收到 derived credential 安装提示，设备上无 derived credential
**Solution**: 1. 确认 derived credentials 策略已正确启用并目标化到用户；2. 确认设备已成功注册/WPJ；3. 在 Company Portal 通知页面下拉刷新；4. 确认设备上只安装了一个版本的 Purebred app
`[Source: ado-wiki, Score: 9.0]`

### Step 5: Managed Google Play (MGP) account upgrade to Entra identity fails with 'Domain is already being used' error during Google Enterprise upgrade flow
**Solution**: Customer must contact Google Support directly to resolve the domain conflict. Reference: https://support.google.com/a/answer/80610
`[Source: ado-wiki, Score: 9.0]`

### Step 6: Cannot perform MGP account upgrade — original user who connected Managed Google Play no longer exists, and no Google Super Admin is available to co...
**Solution**: Customer can either request Google to provide current Super Admin details or initiate a request to assign a new Super Admin. Reference ICM: 617111109
`[Source: ado-wiki, Score: 9.0]`

### Step 7: Managed Google Play account upgrade fails with generic 'Service Error' at Intune portal level during Google API upgrade flow
**Solution**: 1) Retry after some time. 2) If error persists, escalate — potentially involving Google support. Engage SME to evaluate need for ICM. If user fails to complete upgrade flow, tenant falls back to MGP automatically
`[Source: ado-wiki, Score: 8.0]`

### Step 8: Android APK app update fails with 'App installation failed' notification on user devices
**Solution**: Have the users reinstall the app from the Company Portal to their devices.
`[Source: mslearn, Score: 8.0]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Huawei device enrollment in Intune fails with overlay error - another app dis... | Huawei floating window or Quick Memo creates overlay blocking Android Setting... | (1) Disable floating window in Settings; (2) If Quick Memo, open Memo app Set... | 9.5 | onenote |
| 2 | Android 设备上应用部署显示 Install Failed 状态 | 常见原因：APK 文件损坏、设备未允许来自未知来源的安装、APK 未签名 | 1. 查看 OMADM 日志中 'Error installing application <app name>, result code: <code>... | 9.0 | ado-wiki |
| 3 | Android 设备应用已完成安装，但 Intune Admin Center 的 App Details 页面状态未更新为已安装 | 状态更新通过 IWS（Intune Web Service）而非直接从设备读取，存在 1-2 分钟延迟；离开 App Details 页面后不再自动刷新 | 1. 等待 1-2 分钟；2. 离开 App Details 页面后重新导航回来手动刷新；3. 如长时间不更新则通过 Kusto 查询 Intune 服务... | 9.0 | ado-wiki |
| 4 | 用户未收到 derived credential 安装提示，设备上无 derived credential | Derived credentials 策略未正确启用/目标化，或设备未成功注册(WPJ)，或 Company Portal 通知未刷新 | 1. 确认 derived credentials 策略已正确启用并目标化到用户；2. 确认设备已成功注册/WPJ；3. 在 Company Portal... | 9.0 | ado-wiki |
| 5 | Managed Google Play (MGP) account upgrade to Entra identity fails with 'Domai... | The domain is already registered with another Google service or enterprise ac... | Customer must contact Google Support directly to resolve the domain conflict.... | 9.0 | ado-wiki |
| 6 | Cannot perform MGP account upgrade — original user who connected Managed Goog... | MGP upgrade requires Google Super Admin role which was held by the user who i... | Customer can either request Google to provide current Super Admin details or ... | 9.0 | ado-wiki |
| 7 | Managed Google Play account upgrade fails with generic 'Service Error' at Int... | Transient error from Google Enterprise Mobility Management (EMM) API service | 1) Retry after some time. 2) If error persists, escalate — potentially involv... | 8.0 | ado-wiki |
| 8 | Android APK app update fails with 'App installation failed' notification on u... | Users have removed the app from their devices. When Intune tries to update th... | Have the users reinstall the app from the Company Portal to their devices. | 8.0 | mslearn |
| 9 | Android For Work Profiles are not synchronizing. SCCM Console shows Sync Stat... | No Applications are approved in Play for Work. Connectivity issues shown in t... | Make sure at least one app is approved in Play for Work. Make sure the sync w... | 7.5 | contentidea-kb |
| 10 | When trying to push the Delve app on Android the device displays &quot;Device... | Delve for Android is not supported for devices that are enrolled into Microso... |  | 7.5 | contentidea-kb |
| 11 | In an Intune/Configuration Manager hybrid environment, deploying an Android f... | This can occur if the app is deployed as Available. This is by design. | To resolve this problem, remove the existing deployment and re-deploy the app... | 7.5 | contentidea-kb |
| 12 | When opening the Intune Web Company Portal, the end user is not seeing any ap... | IW Portal team made a behavior change to support mobile app install without e... | Open portal.manage.microsoft.com, sign in, click menu > My Devices, click on ... | 7.5 | contentidea-kb |
| 13 | When using an Android for Work App configuration policy created with �Specify... |  | The way to make it work is to use �Browse to a property list file� and enter ... | 7.5 | contentidea-kb |
| 14 | End users installing apps deployed from to their devices enrolled into Intune... | The specific app permissions have changed since the last time the Android for... | The Intune/Android for Work administrator needs to log into the Android for W... | 7.5 | contentidea-kb |
| 15 | When trying to update an Android line of business app to a newer version via ... | This can occur if the name of the updated package does not match the name of ... | To resolve this problem, make sure the update package name matches the name o... | 7.5 | contentidea-kb |
| 16 | When attempting to upload an APK file in the Azure Intune portal, after selec... | This can occur if there is an issue with the manifest for the Android app in ... | Contact the publisher or developer of the app and have them update the app. | 7.5 | contentidea-kb |
| 17 | When testing Knox Mobile Enrollment, customer receives the following error "M... | App package link was incorrect in KNOX console | Customer removed and re-added app package link and the error went away. | 7.5 | contentidea-kb |
| 18 | When Jamf is integrated with Microsoft Intune, if the Create Mobile account a... | Currently this behavior is by design. | To work around this issue, log on using a local account and register the devi... | 7.5 | contentidea-kb |
| 19 | Ensure that the Company Portal app is being launched from the Jamf Self-Servi... |  |  | 7.5 | contentidea-kb |
| 20 | This walkthrough will show you how to configure and enroll a COSU device with... | Education | If you haven't already...Onboard to Google  Approve any applications from    ... | 7.5 | contentidea-kb |
| 21 | Customers are unable to enroll specific Huawei models that are running Androi... | We have an internal thread with Huawei and they informed us that this is a KN... | The below workaround was tested and confirmed for the following device models... | 7.5 | contentidea-kb |
| 22 | After enrolling an Android Enterprise device (aka Android for Work or AfW), u... | This is a known problem with the current version of the Company Portal app pr... | Resolved with December 2018 release of Intune Company Portal | 7.5 | contentidea-kb |
| 23 | Training: Prepare your organization for Android enterprise management with Mi... |  |  | 7.5 | contentidea-kb |
| 24 | Samsung devices enrolled in Intune via Knox Mobile Enrollment tool may displa... | This is a known issue. | This issue will be resolved in the 1812 release. However, existing devices wi... | 7.5 | contentidea-kb |
| 25 | When trying to register with Intune, the following error is seen on Mac devic... | This can occur if the you upgrade from Jamf Pro 10.7 to 10.7.1 and do not rea... | To reaffirm consent, in Jamf Pro an Azure global administrator must navigate ... | 7.5 | contentidea-kb |
| 26 | Apps installed in Android Enterprise either crash or do not let you set certa... | From what we have seen so far, a policy for Android Enterprise work profile t... | Option 1: Set this to Device default and resync the devices and try to run th... | 7.5 | contentidea-kb |
| 27 | Consider the following scenario:1.	A user installs an Android line of busines... | This occurs because Intune attempts to update App X but it’s no longer a mana... | To resolve this problem, the user must reinstall the app from the Intune Comp... | 7.5 | contentidea-kb |
| 28 | When users try to sign-in to the Skype for Business mobile client installed o... | This can occur if the policy setting Add and Remove accounts is set to Block. | Setting is located in Intune portal under&nbsp;Device configuration - Profile... | 7.5 | contentidea-kb |
| 29 | Intune supports configuring Android Enterprise devices with OEMConfig device ... |  |  | 7.5 | contentidea-kb |
| 30 | When personally owned Device Admin enrolled devices navigate to the Company P... | This is By-Design. When both criteria are met 1) Managed Google Play App assi... | To remediate, you need to delete the “Available with or without enrollment” i... | 7.5 | contentidea-kb |
| 31 | After migrating mail accounts from on-premise to O365 exchange environment. t... | Intune doesn’t support MX redirection in exchange | Resolution:The incidence is solved by eliminating the work profile and re-enr... | 7.5 | contentidea-kb |
| 32 | If you see what appear to be personal apps in the Discovered apps blade for y... | These are System Apps and Services that are duplicated within the Work Profil... | This is the expected behavior. Intune does not have the ability to inventory ... | 7.5 | contentidea-kb |
| 33 | After deploying a App protection policy to Android devices. &nbsp; Some users... | This can be caused by battery optimization settings&nbsp; in the Intune Compa... | To resolve this issue disable the battery optimization settings in the Intune... | 7.5 | contentidea-kb |
| 34 | Pre-installed apps such as&nbsp;StageNow, Datawedge, RXLogger and Scan Blueto... | According to Zebra this is by design. This is because in the Oreo image, the ... | To regain access to these pre-installed apps on the device after the upgrade ... | 7.5 | contentidea-kb |
| 35 | How Tohttps://docs.microsoft.com/en-us/intune/apps-deployOnce you've added an... |  |  | 7.5 | contentidea-kb |
| 36 | As we are limited in our troubleshooting options in the Android Device Owner ... | For troubleshooting scenarios when policies or applications do not reach the ... | Built into the settings of your device (Settings &gt; Google &gt; Device Poli... | 7.5 | contentidea-kb |
| 37 | When deploying Zebra device configuration with OEMConfig to an Android Enterp... | This can occur if the device has an OEMConfig Device Configuration profile as... | To resolve this issue, remove (unassign) the&nbsp;OEMConfig Device Configurat... | 7.5 | contentidea-kb |
| 38 | Supported PlatformsGoogle Android Enterprise (requirements)Known IssuesAndroi... |  |  | 7.5 | contentidea-kb |
| 39 | If you need to use Android devices in a Kiosk style scenario where you only w... | This article was written when Dedicated was the only non-Work Profile option ... | For specifics after you have completed setup, start here:Intune &gt; Client A... | 7.5 | contentidea-kb |
| 40 | Follow these steps to enable verbose logging on the Microsoft Intune App for ... |  | Open the Microsoft Intune App (not to be confused with Company Portal) and cl... | 7.5 | contentidea-kb |
| 41 | Error received when trying to add an Android Enterprise System App in Intune.... | If a situation like this is encountered, check the F12 developer logs for mor... | Search in Intune Portal (Microsoft Intune - Client apps – Apps) the applicati... | 7.5 | contentidea-kb |
| 42 | In the App configuration policy for Intune Managed Home screen, customer adde... | For different OEMs, the dialer(phone) app's package name is different while f... | Add the Dialer app in Motorola as Android enterprise system app as steps belo... | 7.5 | contentidea-kb |
| 43 | After enrolling&nbsp;Zebra TC51/TC56 devices as Android Enterprise fully mana... | This is caused by the fact that by default these Zebra devices don't have the... | For this scenario to work the following needs to happen: 1) Zebra needs to ha... | 7.5 | contentidea-kb |
| 44 | In this example scenario I will demonstrate how to use App Config to pre-popu... |  |  | 7.5 | contentidea-kb |
| 45 | After enrolling an Android Enterprise device with work profile, the user is g... | The device was identified as corporate-owned on the Corporate device identifi... | The admin needs to remove this device from the Corporate device identifiers i... | 7.5 | contentidea-kb |
| 46 | DELETE - Duplicate of&nbsp;https://internal.support.services.microsoft.com/en... |  |  | 7.5 | contentidea-kb |
| 47 | This article describes how to Block and Allow specific URLs for the Edge brow... |  |  | 7.5 | contentidea-kb |
| 48 | Managed Google Play has the feature of deploying LOB application instead of u... |  |  | 7.5 | contentidea-kb |
| 49 | The user experiences &quot;App not found&quot; message when he attempts to op... | This happens when the app is either installed on a SD card or moved to SD card | Unenroll the device.Removed SD card.&nbsp;With SD card removed, reenroll the ... | 7.5 | contentidea-kb |
| 50 | The main idea for any kind of API is to provide access to some resources with... |  |  | 7.5 | contentidea-kb |
| 51 | Download and install Android Studio (its free!)&nbsp;https://developer.androi... |  |  | 7.5 | contentidea-kb |
| 52 | Below are some important OMADM log messages for a normal, error-free required... |  |  | 7.5 | contentidea-kb |
| 53 | Intune App Protection policies for Android with Approved Keyboard settings on... | Since June/July Update for Android 10, Samsung released One Ui 2.1 Samsung ho... | To fix this, please manually add the new Approved keyboard inside the Intune ... | 7.5 | contentidea-kb |
| 54 | Google camera application not available in Kiosk Mode on Android even when as... | The app is assigned to a non Google Pixel device.&nbsp; | Google camera application can only be deployed to a Google Pixel. | 7.5 | contentidea-kb |
| 55 | Recently I received a consult from an SE about this. I did some research and ... |  |  | 7.5 | contentidea-kb |
| 56 | Android Enterprise dedicated device with multi-app kiosk mode enabled gets th... | This can occur if one or more apps that are targeted in the multi-app kiosk p... | To resolve this problem, complete one of the following:Make sure all apps tar... | 7.5 | contentidea-kb |
| 57 | When the App Protection policy setting &quot;Org data notification&quot; is s... | This can occur if you are using an older version of the Microsoft Teams for A... | A fix for this issue is released with Microsoft Teams for Android version 141... | 7.5 | contentidea-kb |
| 58 | When a user with an Android COPE device opens the personal Google Play store,... | Google confirmed it is a issue on their side:Play in the personal profile cac... | Google suggested the following action plan:Keep the original Intune policy, t... | 7.5 | contentidea-kb |
| 59 | This guide will show you how to collect logs from the Microsoft Intune app (n... |  |  | 7.5 | contentidea-kb |
| 60 | After deploying an Android Enterprise Wi-Fi profile that has an automatic pro... | This is by design.&nbsp;The proxy feature in Wi-Fi profiles is only supported... | To resolve this issue, either upgrade the devices to Android 8 or later, or r... | 7.5 | contentidea-kb |
| 61 | Android Device Administrator Management is now supported on Fire OS 7 and lat... |  |  | 7.5 | contentidea-kb |
| 62 | Wi-Fi profiles deployed to Android Enterprise clients report an error status ... | There are known issues with Wi-Fi reporting on Android Enterprise fully manag... | Issue #1 is still under investigation for fix. This KB will be updated as new... | 7.5 | contentidea-kb |
| 63 | When deploying an Android Enterprise Wi-Fi profile that has the Automatic pro... | This occurs because the Automatic proxy setting is only supported for Android... | If you want to use&nbsp;the&nbsp;Automatic&nbsp;proxy setting on Android devi... | 7.5 | contentidea-kb |
| 64 | This article demonstrates how to assign a .pac file to mobile Edge with an Ap... |  |  | 7.5 | contentidea-kb |
| 65 | Intune customers may be leveraging SafetyNet device attestation as part of th... |  |  | 7.5 | contentidea-kb |
| 66 | You find that you are unable to install a paid app from the Google Play store... | This is by design and occurs because Google does not support paid apps in the... | The only work around in this scenario is to find a free version of the app, o... | 7.5 | contentidea-kb |
| 67 | During the first time setup of&nbsp;kiosk device configuration profile to ded... | It's related to the start of an activity in a new task in Lock Task Mode (or ... | The only 2 ways to allow the Overlay Permission to MHS app, is to exit kiosk ... | 7.5 | contentidea-kb |
| 68 | After assigning a Device Configuration profile, the policy is applied to devi... | This occured because the customer was using the attribute “mdmDeviceUniqueId”... | To resolve this problem, replace the &quot;mdmDeviceUniqueId&quot; attribute ... | 7.5 | contentidea-kb |
| 69 | In the Intune Company Portal app for Android in the GCCH environment when you... | This can be caused by the DocumentsUI API for the Android operating system be... | The DocumenstUI can be removed by removing any app that has this API.&nbsp; &... | 7.5 | contentidea-kb |
| 70 | You are trying to connect your Intune account to your Managed Google Play acc... | This may happen if you already used this MGP account for an integration in th... | 4. Go to https://play.google.com/work/adminsettings&nbsp;for the Admin Settin... | 7.5 | contentidea-kb |
| 71 | When enrolling a Samsung device as dedicated this devices aren't able to make... | Collecting adb&nbsp;bug report logs I can see these entries:  03-21 11:38:29.... | Target as required system apps both&nbsp;com.samsung.android.incallui (Requir... | 7.5 | contentidea-kb |
| 72 | The Intune Android team is aware of an issue where admins see Managed Google ... | The iframe today asks for a language code and receives a country code from In... | The only known workaround is to work with AAD to change the country associate... | 7.5 | contentidea-kb |
| 73 | NOTES: Company Portal logs cannot be collected directly from the device since... |  |  | 7.5 | contentidea-kb |
| 74 | A customer may delete the Android private app from the Intune portal by mista... |  |  | 7.5 | contentidea-kb |
| 75 | Every time the Android dedicated device is rotated (change screen orientation... | I repro'ed the same in my lab and the configuration below allowed the device ... | We aren't sure if this is a bug or something by design. Furthermore, it might... | 7.5 | contentidea-kb |
| 76 | Customer was trying to enroll Linux 22.04 LTS. The expected procedure for Lin... | This can occur if the the maximum number of Azure Registered Devices has been... | You can gather logs while the user is reproducing the error message by using ... | 7.5 | contentidea-kb |
| 77 | Follow the steps below to enroll a Linux device. 1. Install Edge:    a. Downl... |  |  | 7.5 | contentidea-kb |
| 78 | Test DPC is an app designed to help EMMs (Enterprise Mobility Management), IS... |  |  | 7.5 | contentidea-kb |
| 79 | This article explains how to identify the Company Portal app version for Andr... |  |  | 7.5 | contentidea-kb |
| 80 | Google Lens opens fine on the tablet when you open it outside MHS, when acces... | When the user enters MHS, the device enters a locked task mode, and the syste... | &nbsp;Add the&nbsp;Google quick search box app&nbsp;to the Lock Task Mode whi... | 7.5 | contentidea-kb |
| 81 | This article describes how to Block and Allow specific URLs for the Edge brow... |  |  | 7.5 | contentidea-kb |
| 82 | Google has identified an issue&nbsp;that makes some management policies uncha... | This is a known Android issue&nbsp;that&nbsp;Google is working on. | If&nbsp;the above&nbsp;affected policies&nbsp;are&nbsp;set on Android 13 devi... | 7.5 | contentidea-kb |
| 83 | Customer wants to clear the app data or app cache of an app in dedicated devi... | Service Team shared with us this Google documentation&nbsp;where Android deta... | The way to manage the cache of an app in Android dedicated is to use the Entr... | 7.5 | contentidea-kb |
| 84 | The customer is trying to enable the microphone or camera in Edge browser whi... | This is a privacy protection design from chromium (https://chromium-review.go... | Stating on Edge v121 (February 2024), Edge team added the key Enable Overlay ... | 7.5 | contentidea-kb |
| 85 | User is not able to see Managed Google Play store banner in Company Portal ap... | Company Portal is not a Device Admin app on the Android device | Solution: It is observed that by default Company Portal is not enabled as a D... | 7.5 | contentidea-kb |
| 86 | There are instances where customers are following this documentation&nbsp;htt... | There are multiple ICMs created for this problem examples are:&nbsp; Incident... | Workaround #1:  Guide the customer here&nbsp;https://intune.microsoft.com/#vi... | 7.5 | contentidea-kb |
| 87 | Can't create work profile on Personally Owned Work-profile Android device.  &... | Due to existing work profile present on the same device but not visible in de... | 1) It is observed that there were multiple applications appearing with a brie... | 7.5 | contentidea-kb |
| 88 | Samsung tablet device enrolled to Intune with work profile - corporate owned ... | Cause undetermined as Edge team was unable to confirm the exact cause but sug... | Workaround (as the cause remains undetermined for now)Create an Android app c... | 7.5 | contentidea-kb |
| 89 | After the customer enrolls an Android device as Dedicated or Fully managed wi... | Known issue with some android devices, not all of the devices are affected wi... | There are two possible solutions for this scenario:  If the device is support... | 7.5 | contentidea-kb |
| 90 | Most of the times customers and support have the doubt of what's required in ... |  |  | 7.5 | contentidea-kb |
| 91 | Devices are configured as kiosk (dedicated) and admins/users attempt to clear... | This behavior is **by design** beginning with **Android 11** for devices conf... | By design behavior of Google | 7.5 | contentidea-kb |
| 92 | An updated version of an application is deployed to Samsung Android devices v... | The application package on the affected devices is disabled due to battery op... | We reviewed the Microsoft documentation:Best practices for updating your Andr... | 7.5 | contentidea-kb |
| 93 | Company Portal shows "We cannot update enrollment now. Try again later" notif... | Outdated version of the Company Portal app on the device. | Update Company Portal to the latest version from the respective app store (Mi... | 7.0 | mslearn |
| 94 | Consider the following scenario: 1. A user installs an Android line of busine... | This occurs because Intune attempts to update App X but it’s no longer a mana... | To resolve this problem, the user must reinstall the app from the Intune Comp... | 4.5 | contentidea-kb |
| 95 | After deploying a App protection policy to Android devices. Some users device... | This can be caused by battery optimization settings in the Intune Company Por... | To resolve this issue disable the battery optimization settings in the Intune... | 4.5 | contentidea-kb |
| 96 | Pre-installed apps such as StageNow, Datawedge, RXLogger and Scan Bluetooth o... | According to Zebra this is by design. This is because in the Oreo image, the ... | To regain access to these pre-installed apps on the device after the upgrade ... | 4.5 | contentidea-kb |
| 97 | When users try to sign-in to the Skype for Business mobile client installed o... | This can occur if the policy setting Add and Remove accounts is set to Block . | Setting is located in Intune portal under Device configuration - Profiles è C... | 3.0 | contentidea-kb |
| 98 | Intune supports configuring Android Enterprise devices with OEMConfig device ... |  |  | 3.0 | contentidea-kb |
| 99 | When personally owned Device Admin enrolled devices navigate to the Company P... | This is By-Design. When both criteria are met 1) Managed Google Play App assi... | To remediate, you need to delete the “Available with or without enrollment” i... | 3.0 | contentidea-kb |
| 100 | After migrating mail accounts from on-premise to O365 exchange environment. t... | Intune doesn’t support MX redirection in exchange | Resolution: The incidence is solved by eliminating the work profile and re-en... | 3.0 | contentidea-kb |
| 101 | If you see what appear to be personal apps in the Discovered apps blade for y... | These are System Apps and Services that are duplicated within the Work Profil... | This is the expected behavior. Intune does not have the ability to inventory ... | 3.0 | contentidea-kb |

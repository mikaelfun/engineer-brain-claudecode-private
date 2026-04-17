# INTUNE iOS/iPadOS 通用问题 — 已知问题详情

**条目数**: 188 | **生成日期**: 2026-04-17

---

## Quick Troubleshooting Path

### Step 1: iOS devices enrolled via ABM show Azure AD Registered as empty or false in Intune device export. Large number of devices (1400+) affected.
**Solution**: Adopt Just in Time (JIT) deployment for ABM enrollment to ensure proper Azure AD registration. Note: previously affected devices may not be recoverable and may need to be re-enrolled.
`[Source: onenote, Score: 9.5]`

### Step 2: iOS/iPadOS devices display compliance status as '未评估' (Not Evaluated) in Intune admin portal after ABM enrollment.
**Solution**: Use Just in Time (JIT) deployment for new ABM enrollments. Already affected devices likely require re-enrollment.
`[Source: onenote, Score: 9.5]`

### Step 3: Newly enrolled Apple (iOS/macOS) devices not appearing in Entra dynamic groups after June 2024; device registration incomplete despite successful M...
**Solution**: Ensure users return to Company Portal after enrollment to complete registration. Alternatives: (1) Migrate to web-based enrollment with Just-In-Time registration (auto-registers during normal use); (2) Enable Conditional Access policies to force users back to Company Portal; (3) Migrate from dynamic groups to assignment filters (no registration dependency). macOS Company Portal auto-completes registration if not manually closed.
`[Source: onenote, Score: 9.5]`

### Step 4: Apple Configurator fails to add iOS device to ABM after Intune wipe. Device shows activation lock and cannot be paired.
**Solution**: Before using Apple Configurator, erase the device locally via iOS Settings > General > Transfer or Reset > Erase All Content and Settings (this removes activation lock). Also delete the device from Intune portal. Do NOT use Intune remote wipe for devices that need to be re-enrolled via Apple Configurator.
`[Source: onenote, Score: 9.5]`

### Step 5: DEP device sync disabled in Intune. Sync status shows Terms and Conditions not accepted even after accepting new TC on Apple Business Manager portal.
**Solution**: Use Graph Explorer to manually trigger sync: POST https://graph.microsoft.com/BETA/deviceManagement/depOnboardingSettings/{depOnboardingSettingId}/syncWithAppleDeviceEnrollmentProgram. The depOnboardingSettingId (token ID) can be found in the URL when accessing the DEP token page in Intune admin portal.
`[Source: onenote, Score: 9.5]`

### Step 6: Need to convert an unsupervised iOS managed device to supervised mode without losing user data and apps.
**Solution**: Workaround: (1) Backup Device A via iTunes/iCloud, (2) Restore to temp Device B, (3) Backup Device B, (4) Add Device A to DEP/Apple Configurator and enroll it (supervised), (5) Restore Device B backup onto enrolled Device A. Important: Uncheck Remove apps on profile removal and Restrict App data backup before starting.
`[Source: onenote, Score: 9.5]`

### Step 7: iOS/iPadOS enrollment fails with error NoEnrollmentPolicy - no enrollment policy found. Device cannot complete enrollment.
**Solution**: 1. Verify APNs certificate status in Intune > Tenant administration > Apple MDM Push certificate. 2. Renew if expired (do NOT replace - renewing keeps existing enrollments). 3. Ensure iOS/iPadOS platform is enabled.
`[Source: onenote, Score: 9.5]`

### Step 8: iOS enrollment fails with APNSCertificateNotValid or AccountNotOnboarded error. Device cannot communicate with Intune.
**Solution**: 1. Check APNs cert expiry in Intune admin center. 2. RENEW (not replace) the APNs certificate - replacing requires re-enrollment of ALL iOS devices. 3. For AccountNotOnboarded, re-enroll affected devices after cert renewal. Kusto: PushNotificationProvider | where env_time > ago(1d) | where accountId == '<tenantId>' | project env_time, EventId, TaskName, accountId, responseCode, ex, errorCode, errorCodeString
`[Source: onenote, Score: 9.5]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | iOS devices enrolled via ABM show Azure AD Registered as empty or false in In... | iOS devices were activated via ABM but users did not sign into Company Portal... | Adopt Just in Time (JIT) deployment for ABM enrollment to ensure proper Azure... | 9.5 | onenote |
| 2 | iOS/iPadOS devices display compliance status as '未评估' (Not Evaluated) in Intu... | Same root cause as Azure AD Registered = false issue. Device did not complete... | Use Just in Time (JIT) deployment for new ABM enrollments. Already affected d... | 9.5 | onenote |
| 3 | Newly enrolled Apple (iOS/macOS) devices not appearing in Entra dynamic group... | Starting June 2024 (MC777834), Apple device registration was decoupled from e... | Ensure users return to Company Portal after enrollment to complete registrati... | 9.5 | onenote |
| 4 | Apple Configurator fails to add iOS device to ABM after Intune wipe. Device s... | Intune remote wipe does not remove Find My iPhone (activation lock). The acti... | Before using Apple Configurator, erase the device locally via iOS Settings > ... | 9.5 | onenote |
| 5 | DEP device sync disabled in Intune. Sync status shows Terms and Conditions no... | Apple released new Terms and Conditions causing Intune to stop DEP sync. Re-a... | Use Graph Explorer to manually trigger sync: POST https://graph.microsoft.com... | 9.5 | onenote |
| 6 | Need to convert an unsupervised iOS managed device to supervised mode without... | Supervision state is tied to the enrollment method. Directly supervising an e... | Workaround: (1) Backup Device A via iTunes/iCloud, (2) Restore to temp Device... | 9.5 | onenote |
| 7 | iOS/iPadOS enrollment fails with error NoEnrollmentPolicy - no enrollment pol... | Apple Push Notification Service (APNs) certificate is missing, invalid, or ex... | 1. Verify APNs certificate status in Intune > Tenant administration > Apple M... | 9.5 | onenote |
| 8 | iOS enrollment fails with APNSCertificateNotValid or AccountNotOnboarded erro... | APNs certificate was not properly configured (steps incomplete) or has expire... | 1. Check APNs cert expiry in Intune admin center. 2. RENEW (not replace) the ... | 9.5 | onenote |
| 9 | ADE (Automated Device Enrollment) sync between Intune and Apple fails with Ex... | The ADE/DEP token uploaded to Intune has expired (tokens expire annually), be... | 1. If expired: renew token in ABM/ASM, download new token, upload to Intune. ... | 9.5 | onenote |
| 10 | ADE sync fails with Access denied error. Intune cannot communicate with Apple... | Intune has been removed from the MDM server list in Apple Business Manager/Ap... | 1. Log into ABM/ASM and verify Intune is still listed as MDM server. 2. If re... | 9.5 | onenote |
| 11 | ADE sync fails with Terms and conditions not accepted error in Intune. | Apple has updated their Terms and Conditions in ABM/ASM, and an admin with Ad... | Log into ABM or ASM with an account that has the Administrator role (not just... | 9.5 | onenote |
| 12 | Apple Push Notification (APN) certificate has expired in Intune. Concern abou... | APN certificate can still be renewed even after expiration. The renewal proce... | 1) Do NOT delete the existing APN certificate in Intune. 2) Go to https://ide... | 9.5 | onenote |
| 13 | iOS/macOS device hardware page in Intune portal shows unknown for some fields... | Platform bug (ICM 430321468): When scheduled inventory refresh was skipped be... | 1. Wait for platform fix (ICM 430321468). 2. When device comes online, full i... | 9.5 | onenote |
| 14 | Email profile 部署到 device group 后出现错误和延迟，或目标为 all iOS/iPadOS devices 的 email p... | Email profile 部署到 device group 时，如果组内设备没有关联用户（primary user），profile 无法下发；且 em... | 1. 将 email profile 分配给 user group 而非 device group；2. 如使用 user certificate 认证，... | 9.0 | ado-wiki |
| 15 | iOS/macOS 设备上出现重复的 SCEP 证书 | Apple 平台设计行为：iOS/macOS 会为每个 dependent profile 安装一份 SCEP 证书副本 | By design。参见 Microsoft 文档: Create and assign SCEP certificate profiles in Int... | 9.0 | ado-wiki |
| 16 | iOS or macOS device stops receiving Intune push notifications or policy updat... | APNs response code 1211 (InvalidDeviceCredentials) returned by Apple Notifica... | Query Kusto: `IntuneEvent / where ServiceName == "AppleNotificationRelayServi... | 8.0 | onenote |
| 17 | iPad/iOS device enrollment fails with error 'OS Version XX lower than YY'; Ku... | Intune enrollment restriction policy has a minimum OS version configured (e.g... | Check Intune portal → Devices → Enrollment Restrictions → Platform restrictio... | 8.0 | onenote |
| 18 | iOS VPP app install fails with message VPP user licensing not supported for u... | VPP user licensing requires user affinity on the device. Devices enrolled via... | Change VPP app assignment to device-based licensing. If app is targeted to de... | 8.0 | onenote |
| 19 | DEP token shows warning and sync between Intune and Apple ABM fails. Kusto In... | Customer downloaded the DEP token from ABM portal which caused the existing t... | 1. Renew the DEP token: download a new token from ABM and re-upload to Intune... | 8.0 | onenote |
| 20 | VPP 应用在 iOS/iPadOS/macOS 设备上弹出 'In-App Purchase Disabled' 通知 | VPP 应用的 license 分配方式或设备限制策略与 In-App Purchase 设置冲突 | 1. 确认设备限制策略是否禁用了 In-App Purchase；2. 检查 VPP 应用的 license 类型（Device vs User）；3. ... | 8.0 | ado-wiki |
| 21 | Cannot uninstall iOS apps installed from Apple App Store using Intune - only ... | By design: Intune can only uninstall apps deployed through the MDM channel. A... | 1) Add the apps to Intune and assign as Available or Required (prompts user t... | 8.0 | mslearn |
| 22 | iOS/iPadOS devices not checking in with Intune: Management State Unhealthy, c... | Device cannot successfully sync with Intune; may not be properly enrolled or ... | Open Company Portal app - auto-detects lost contact and syncs. If Unable to s... | 8.0 | mslearn |
| 23 | iOS/iPadOS device stuck on enrollment screen 10+ min: Awaiting final configur... | VPP token issue (expired, out of licenses, used by another service/tenant, de... | Check VPP token in Intune. Fix token issues. Filter blocked devices. Remotely... | 8.0 | mslearn |
| 24 | iOS/iPadOS Profile Installation Failed: Network Error, Connection to server (... | Multiple: iOS corruption; device type restriction; previous enrollment not cl... | Network error: backup, recovery restore, re-enroll. Connection: check restric... | 8.0 | mslearn |
| 25 | Apple Business Manager (ABM) automated device enrollment fails with HTTP 404 ... |  |  | 7.5 | onenote |
| 26 | When updating DEP Token in Intune standalone or hybrid SCCM getting error The... | Corrupt DEP Token | Download new Encryption Key .pem from Intune Portal. Upload to deploy.apple.c... | 7.5 | contentidea-kb |
| 27 | When a customer is seeing Intune SilverLight Dashboard errors for devices sho... | These can be caused for the following reasons:a. The device already has the E... | [When you see the following errors in the Intune SilverLight Dashboard for de... | 7.5 | contentidea-kb |
| 28 | An Apple iPhone is successfully managed by Intune, however when connected to ... | This occurs when using Apple�s Device Enrollment Program (DEP) and the policy... | To fix this problem, complete these steps:1. Open the Intune portal at http:/... | 7.5 | contentidea-kb |
| 29 | Blocking Applications (whitelist/blacklist) on iOS Devices with Microsoft Int... | To block the installation of applications on iOS devices it is required for d... | The resolution at this time requires that the device(s) be placed in Supervis... | 7.5 | contentidea-kb |
| 30 | The information below can be used when troubleshooting enrollment failures wi... |  | DEP enrollment failures can be caused by many different reasons. Note that yo... | 7.5 | contentidea-kb |
| 31 | When it comes to DEP integration with Intune, the topic can seem a bit overwh... |  |  | 7.5 | contentidea-kb |
| 32 | After MDM Authority Reset from Intune to SCCM DEP pre-enrolled devices are sh... | APN Certificate, DEP Token and MDM Server configuration still in place for ol... | This will walk you through clean up and the re-configuration to set up clean ... | 7.5 | contentidea-kb |
| 33 | Customer reporting that all iOS devices they have tried to enroll are hanging... | APN is expired or revoked even though it shows valid in Viewpoint | Check the Apple APN portal at https://identity.apple.com/pushcert/ and verify... | 7.5 | contentidea-kb |
| 34 | *********************************** Please Read *****************************... | After migration to the Azure Portal customers will now need to be manually fl... | Please follow the process below to request the flighitng for these features: ... | 7.5 | contentidea-kb |
| 35 | Communication path between the Intune service and the Apple DEP service. For ... |  |  | 7.5 | contentidea-kb |
| 36 | You are unable to enroll DEP devices when prompting for User Affinity and Con... | We have found that, on some devices that arrive from Apple/DEP vendors, they ... | To resolve this problem, check this VKB first: https://internal.support.servi... | 7.5 | contentidea-kb |
| 37 | Unable to upload VPP token when the Intune subscription is moved to a new Con... | The MDMCertificates table does not contain any data (Certificate data was not... | Use the following steps to resolve this issue:1) Ran the following SQL query ... | 7.5 | contentidea-kb |
| 38 | Apple DEP devices managed via SCCM in supervised mode with policy to block au... | By design | This setting does not affect app updates. | 7.5 | contentidea-kb |
| 39 | After configuring an iOS device in DEP to be supervised and to allow Activati... | This is a known issue per 117062093452694, 117021415317116, 117030315402861 a... | To resolve this problem, upgrade your Configuration Manager environment to th... | 7.5 | contentidea-kb |
| 40 | It admin has replaced the Apple APN certificate instead of renewing and end u... | The Apple APN certificate needs to be renewed yearly | First option with the new certificate in place is to have the users do the fo... | 7.5 | contentidea-kb |
| 41 | After enrolling an iOS 11 device into Intune, the option to share a photo via... | This can occur if either policy setting below is set to Block and the policy ... | This issue is resolved in iOS 11.1 and higher versions. This issue was a resu... | 7.5 | contentidea-kb |
| 42 | Activation Lock State is showing as &quot;Not enabled.&quot;Other fields are ... | DEP enrollment is not directly related to configuring devices for Activation ... | Unless both of these are present on the device, the Activation Lock will auto... | 7.5 | contentidea-kb |
| 43 | Customer installs the Preview release of the Intune Company Portal for MacOS,... | This is due to a change made by apple restricting requirements around the app... | The RTM release of the Intune Company Portal for MacOS will contains the corr... | 7.5 | contentidea-kb |
| 44 | DEP enrolling device, iOS 11.0.0 and newer no longer shows Restore from iClou... | This is due to a iOS 11.0.0 and newer feature change by Apple, they now have ... | Changing the Enrollment Profile to so that the Setup Assistant will show the ... | 7.5 | contentidea-kb |
| 45 | Even when enabling Locked Enrollment in an Apple iOS enrollment profile, MDM ... |  |  | 7.5 | contentidea-kb |
| 46 | Guide on restoring iCloud backups to ADE (DEP) iOS/iPadOS devices. Covers 7 s... |  |  | 7.5 | contentidea-kb |
| 47 | Occasionally you might get a customer asking you about �device licenses� with... |  |  | 7.5 | contentidea-kb |
| 48 | DEP devices that have a profile assigned to them cannot be enrolled as a BYOD... |  |  | 7.5 | contentidea-kb |
| 49 | Customer wants information on how to change the device wallpaper on Supervise... |  |  | 7.5 | contentidea-kb |
| 50 | Manually add your devices iOS 11 devices to DEP  You can also choose to manua... |  |  | 7.5 | contentidea-kb |
| 51 | If we follow the steps from documents below we will have everything set, howe... |  |  | 7.5 | contentidea-kb |
| 52 | Attempting to sign-in to Office 365 applications with a user account other th... | This is currently expected behavior. | As a workaround, you can use a DEP or Apple Configurator profile which doesn'... | 7.5 | contentidea-kb |
| 53 | After configuring DEP enrollment in Intune and deploying new DEP devices to u... | This can occur if both of the following conditions exist:1. The user has not ... | To resolve this problem, either configure Authenticate with Company Portal in... | 7.5 | contentidea-kb |
| 54 | When a user attempts to setup a DEP device and enroll in Intune, if the devic... | This can occur if the device has not been assigned an enrollment profile. Thi... | To resolve this issue, manually assign the device an enrollment profile. If t... | 7.5 | contentidea-kb |
| 55 | When you setup a new DEP Profile, using the New Interface, there is an option... | This is currently expected behavior, and considered by-design. | This is currently by-design.When you enroll, using the above method, we do no... | 7.5 | contentidea-kb |
| 56 | When you enroll an iOS device via Apple's Device Enrollment Program with User... | When the device is enrolled, there is no user information, so the device reco... | Resolved: Code change to change\patch EnrolledByUser property on deviceProvid... | 7.5 | contentidea-kb |
| 57 | We often get questions relating to the Apple MDM push certificate � also know... |  |  | 7.5 | contentidea-kb |
| 58 | Starting with iOS 11, all iOS devices, no matter where they have been purchas... |  |  | 7.5 | contentidea-kb |
| 59 | In February 2018, Intune introduced a new experience to make it easier for cu... |  |  | 7.5 | contentidea-kb |
| 60 | Devices added in the Apple Device Enrollment Program are not showing in the I... | This is caused due to an API change that Apple made in July of 2018 and this ... | A IcM was filed for this https://icm.ad.msft.net/imp/v3/incidents/details/786... | 7.5 | contentidea-kb |
| 61 | Apple Business Manager is supported with Intune.It is not specifically called... |  |  | 7.5 | contentidea-kb |
| 62 | Attempting to enroll an iOS device into Microsoft Intune fails with the follo... | This problem can occur if an Apple MDM push certificate is not configured in ... | If your MDM push certificate is not configured, follow the steps to configure... | 7.5 | contentidea-kb |
| 63 | Attempting to enroll an iOS device fails with the following error: Couldn�t E... | This problem can occur if an Apple MDM push certificate isn't configured in I... | To resolve this issue, perform one of the following:If your MDM push certific... | 7.5 | contentidea-kb |
| 64 | Attempting to enroll an iOs device fails with the following error: This servi... | This problem can occur if an Apple MDM push certificate isn't configured in I... | To resolve this issue, perform one of the following:If your MDM push certific... | 7.5 | contentidea-kb |
| 65 | When you turn on a DEP managed device that is assigned an enrollment profile,... | This issue can occur if the Intune enrollment profile was created before the ... | To resolve this problem, complete the following steps:1. Edit the enrollment ... | 7.5 | contentidea-kb |
| 66 | When turning on a device managed under Apple's Device Enrollment Program (DEP... | This can occur if Authenticate with Company Portal instead of Apple Setup Ass... | To resolve this issue, set Authenticate with Company Portal instead of Apple ... | 7.5 | contentidea-kb |
| 67 | After applying a Configuration Policy that restricts what apps are hidden fro... | There is a policy that is configured to hide the phone app, com.apple.mobilep... | Do not apply a configuration policy that is configured to hide the phone app ... | 7.5 | contentidea-kb |
| 68 | On iPhone/iPad running iOS 12.1 with Teams, OneDrive, Word, Excel, PowerPoint... |  |  | 7.5 | contentidea-kb |
| 69 | When migrating from SCCM Hybrid to Intune Standalone, customers using Apple D... |  |  | 7.5 | contentidea-kb |
| 70 | Customers may find that they are unable to access the Apple ID account to ren... |  |  | 7.5 | contentidea-kb |
| 71 | Apple iOS allows MDM's to configure the home screen layout on iOS devices run... |  |  | 7.5 | contentidea-kb |
| 72 | Even though a DEP enrollment profile is configured to show the iCloud &amp; A... | This can occur if there is an iOS device restriction configuration profile as... | The behavior is expected because this setting is meant to keep the device on ... | 7.5 | contentidea-kb |
| 73 | When you turn on an Apple DEP managed device that is assigned an Intune enrol... | This issue can occur if the enrollment profile is created before the DEP toke... | To resolve this problem, complete the following steps:1. Edit the enrollment ... | 7.5 | contentidea-kb |
| 74 | When powering on a DEP-managed device that is assigned an enrollment profile ... | This can occur if there is a network connection problem between the device an... | To resolve this problem, fix the connection issue or use a different network ... | 7.5 | contentidea-kb |
| 75 | Y ou can enroll up to 1,000 mobile devices with a single Azure Active Directo... |  |  | 7.5 | contentidea-kb |
| 76 | Manual enrollment issues:  1.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Getting a “... |  |  | 7.5 | contentidea-kb |
| 77 | When a user with a DEP enrolled device attempts to access a cloud app and Con... | This can occur if both of the following conditions are exist:1. The enrollmen... | To resolve this problem, either change the DEP profile to authenticate with t... | 7.5 | contentidea-kb |
| 78 | When to use it  Activation Lock is an anti-theft feature from Apple. The norm... | Pre-requisites  Device is Supervised     To confirm the       device is Super... | Scenario #1 - if this is within 15 days of enrollment, you do not actually ne... | 7.5 | contentidea-kb |
| 79 | Expected behavior of the iOS &quot;Delay Visibility of Software Update&quot;&... |  | I wanted to bring to everyone’s attention the iOS Software update “Delay Visi... | 7.5 | contentidea-kb |
| 80 | For many MDM administrators tasked with managing iOS devices, one challenge t... |  |  | 7.5 | contentidea-kb |
| 81 | Customer is deploying iOS devices using the DEP process. The DEP profile is c... | The customer had the ADE profile set to show the Apple ID page during DEP enr... | We changed the DEP profile to Hide the Apple ID screen.The user cannot login ... | 7.5 | contentidea-kb |
| 82 | The purpose of this KB is to demonstrate the different types of enrollment me... |  |  | 7.5 | contentidea-kb |
| 83 | On Apple DEP enrolled devices, an Allow App and Book Assignment message keeps... | Apple has acknowledged that this is a known issue and that they are working o... | As a temporary work around, add iOS store apps to Microsoft Intune instead of... | 7.5 | contentidea-kb |
| 84 | You have enrolled a iOS device through DEP or Apple Configurator device makin... | If you are using the Intune iOS Device Restriction Policy that has the config... | If you wish to rename a iOS device that currently has a Device Restriction Po... | 7.5 | contentidea-kb |
| 85 | In September,&nbsp;iOS 13 is scheduled to be released by Apple. Intune enroll... |  |  | 7.5 | contentidea-kb |
| 86 | if the device has a passcode set, iOS/iPadOS Software Update fails to install... | The passcode prompt notification (Authorization request) is never presented o... | If the passcode can be removed on the device:   Remove the passcode of the   ... | 7.5 | contentidea-kb |
| 87 | Unable to sync newly added DEP devices from Apple to Intune. | DEP account password got changed, this is one of the many reasons why apple w... | Renewed DEP token. | 7.5 | contentidea-kb |
| 88 | When deploying a show or hide apps profile to supervised iOS devices the poli... | Watch for duplicate bundle IDs or bundle ids which are incorrectly formatted ... | Remove the duplicate entry with the capitals and keep the bundle id in lower ... | 7.5 | contentidea-kb |
| 89 | Customer wants to remove a device from ADE (Formerly DEP) and manage it as a ... |  |  | 7.5 | contentidea-kb |
| 90 | Crash on&nbsp;Enrollment Program Tokens Page / Error occurred while opening&n... | This can occur if the&nbsp;Department Phone or Support Phone number exceeds t... | In order to edit Department Phone / Support Phone number, please follow menti... | 7.5 | contentidea-kb |
| 91 | The log below shows a successful Intune registration of a Jamf enrolled Mac d... |  |  | 7.5 | contentidea-kb |
| 92 | Apple DEP devices cannot be enrolled and fail to sync, meaning that&nbsp;devi... | This can occur if Apple updates their Terms and Conditions (ToC) but the new ... | To resolve this issue, have the admin go to the Apple Business Manager portal... | 7.5 | contentidea-kb |
| 93 | Microsoft Intune expands macOS app management supportNew features in macOS Ca... |  |  | 7.5 | contentidea-kb |
| 94 | When attempting to enroll an iOS device the device gets stuck during the proc... | This can happen with the private key of the APNS certificate didn't upload co... | You can see the state of the APNS using the following Kusto query.  PushNotif... | 7.5 | contentidea-kb |
| 95 | How macOS BYOD enrollment works Once the user launches the Company Portal to ... |  |  | 7.5 | contentidea-kb |
| 96 | Prerequisites Complete the following prerequisites before setting up macOS de... |  |  | 7.5 | contentidea-kb |
| 97 | 1.&nbsp;Tell me about the problem you are having?&nbsp;&nbsp; Technician Only... |  |  | 7.5 | contentidea-kb |
| 98 | Support Tip: Accept Apple’s new T&amp;C to ensure Intune can communicate with... |  |  | 7.5 | contentidea-kb |
| 99 | The passcode removal call hits a 500 error and a message indicating that the ... | Apple analyzed the sysdiagnose logs and confirmed that their software needs t... | Until a fix is deployed, devices in this state cannot recover.As per Apple, i... | 7.5 | contentidea-kb |
| 100 | Customers who have added an Apple Enrollment Program token (DEP token) to the... |  |  | 7.5 | contentidea-kb |
| 101 | Customer reports that Intune UI is showing an Unhealthy status for the past w... | This isn't a known issue but sometimes cloud services get brief interruptions... | The best way to fix this issue is to renew the ADE/DEP token, our public docu... | 7.5 | contentidea-kb |
| 102 | Issue with authentication on company portal app. On one of the supervised dev... | DEP devices was updated from BYOD to Supervised via Apple and after that user... | After trying several attempts to Erase all content from device under settings... | 7.5 | contentidea-kb |
| 103 | iOS and iPadOS Software  Inventory internal documentation (In Progress)  Purp... |  |  | 7.5 | contentidea-kb |
| 104 | This article was created thanks to our EMS FastTrack Team (special thanks to ... |  |  | 7.5 | contentidea-kb |
| 105 | After syncing VPP applications,&nbsp; Deployment to iPad is not available as ... | When the application was developed, only iPhone was selected. This can be ver... | Customer should reach out to the app developer so they can make the necessary... | 7.5 | contentidea-kb |
| 106 | This is a how to guide, for scenarios where Console logs are requested from c... |  |  | 7.5 | contentidea-kb |
| 107 | Using Microsoft Intune, you can add or create custom settings for your macOS ... |  |  | 7.5 | contentidea-kb |
| 108 | When Apple devices are upgraded to iOS and iPadOS 14, a MAC address is random... | With the release of iOS and iPadOS 14, MAC randomization is turned on by defa... | Once the upgrade is received, end-users are required to manually turn off MAC... | 7.5 | contentidea-kb |
| 109 | The iOS Adobe Acrobat Reader app&nbsp;version: 20.10.00 (20201013.161436) Pro... | Adobe&nbsp;Acrobat Reader changed the way it manages Microsoft account sign-i... | On the iOS device, open      Adobe reader and start enrolling the device.   I... | 7.5 | contentidea-kb |
| 110 | When attempting to enroll MacOS devices using&nbsp;Apple's Automated Device E... | This issue can occur if multi-factor authentication (MFA) is required for use... | To resolve this issue, disable or exempt MFA for the affected user. | 7.5 | contentidea-kb |
| 111 | PII compliance disclaimer: UserPrincipalName, Serial Number and any other inf... | We found that Apple release new terms and conditions on 4th&nbsp;Dec and Intu... | Follow any of the following steps (just following one of them should fix the ... | 7.5 | contentidea-kb |
| 112 | Currently our DEP Enrollment Profiles settings include the feature 'Device to... |  |  | 7.5 | contentidea-kb |
| 113 | In the Outlook App for IOS you may experience a problem where issue where con... | This &nbsp;issue can be caused by variety of different issues but this articl... | There are couple different polices on the Intune side that can cause Outlook ... | 7.5 | contentidea-kb |
| 114 | PII compliance disclaimer: UserPrincipalName, Serial Number and any other inf... |  |  | 7.5 | contentidea-kb |
| 115 | Prerequisites:Engineers need to read and understand below topics before start... |  |  | 7.5 | contentidea-kb |
| 116 | Lab Experience:Configure Corporate identifierCreate a csv file for Corporate ... |  |  | 7.5 | contentidea-kb |
| 117 | Advanced Troubleshooting: Optional. Level 200+ troubleshooting skills require... |  |  | 7.5 | contentidea-kb |
| 118 | Self-evaluation questions:Android:What is COPE device and COSU device?What is... |  |  | 7.5 | contentidea-kb |
| 119 | These links should help improve your understanding of the components and find... |  |  | 7.5 | contentidea-kb |
| 120 | What is Lost Mode?The Lost mode device action helps you enable lost mode on l... |  |  | 7.5 | contentidea-kb |
| 121 | Customer can use incorrect AAD password to pass Apple setup assistant and get... | When we enter user name and password in Apple set up assistance, it actually ... | This is an ADAL bug.ICM was raise:&nbsp;Incident-205397318 Details - IcM (mic... | 7.5 | contentidea-kb |
| 122 | When enrolling iPad or iPhone with DEP, it fails with the following:Remote Ma... | This error can occur in following two scenarios:The device has not been assig... | If the device has not been assigned an enrollment profile, make sure that one... | 7.5 | contentidea-kb |
| 123 | An iOS or iPadOS update fails to install on supervised devices and in the UI ... | This can occur if two or more iOS/iPadOS Update policies (IOSUpdateConfigurat... | To resolve this problem, exclude or remove the user or device (depending on h... | 7.5 | contentidea-kb |
| 124 | Personal macOS devices enrolled as BYOD in Intune are showing as Supervised: | This is by design by Apple. | This is by design by Apple. In macOS 11 or later, a Mac computer is also cons... | 7.5 | contentidea-kb |
| 125 | Consider the following scenario: You wish to enroll macOS devices as Supervis... | This can occur if the format of the phone number is invalid. The phone number... | To resolve this problem:  1.&nbsp;Unassign the device and delete the enrollme... | 7.5 | contentidea-kb |
| 126 | Apple will be posting an updated version of their Apple Business Manager (ABM... |  |  | 7.5 | contentidea-kb |
| 127 | The customer is trying to enroll an iOS device via DEP and is unable to insta... | Conditional Access policy is targeting the Apple Business Manager cloud app. | As this is a DEP-registered device, the solution is to exclude Apple Business... | 7.5 | contentidea-kb |
| 128 | Over 500+ devices IMEI and Serial numbers are missing on Intune enrolled devi... | It is by design from Apple (without cellular) or Google (for Android 10 and a... | If the device is&nbsp;Android 10&nbsp;or above and was enrolled with &quot;De... | 7.5 | contentidea-kb |
| 129 | Universal links simplify how users transition between web content and applica... |  |  | 7.5 | contentidea-kb |
| 130 | The purpose of this article is to show what to expect for the different iOS A... |  |  | 7.5 | contentidea-kb |
| 131 | Consider the following scenario: You are enrolling ADE devices using Single A... | By default, when &quot;Install Company Portal&quot; is set to &quot;Yes&quot;... | To resolve this probolem, change &quot;Uninstall on      device removal&quot;... | 7.5 | contentidea-kb |
| 132 | After authenticating in Setup Assistant during an ADE enrollment with user af... | This can occur if the Azure AD device registration limit has been reached for... | To resolve this problem complete the following: Validate the current user is ... | 7.5 | contentidea-kb |
| 133 | MEM Admin Center shows &quot;Remove passcode: Failed&quot; Error: &quot;No re... | This can occur if Intune does not have the &quot;UnlockToken&quot; from the a... | To resolve this problem: Unenroll      and re-enroll the affected device. The... | 7.5 | contentidea-kb |
| 134 | On August 17th, Apple released iOS update 15.6.1 to fix two security vulnerab... |  |  | 7.5 | contentidea-kb |
| 135 | When trying to enroll personally owned IOS devices you receive the following ... | This error can be caused by not fully configuring all the requirements for iO... | To resolve this issue an administrator can remove the user from the target gr... | 7.5 | contentidea-kb |
| 136 | After authenticating in Setup Assistant during an ADE enrollment with user af... | The Apple MDM push certificate (APNS) is expired. You can find this informati... | Renew the existing expired      APNS certificate following the steps here htt... | 7.5 | contentidea-kb |
| 137 | This is the device model list for Apple devices, depending on the device spec... |  |  | 7.5 | contentidea-kb |
| 138 | When looking at the IOS management profile on device it shows status of &quot... | This can be caused by the IOSProfileSigning.manange.microsoft.com and Microso... | If the device is communicating with the Intune service it will have updated i... | 7.5 | contentidea-kb |
| 139 | On iOS devices enrolled into the Intune service, when you look at the Device ... | This issue can be caused by some of the IOS MDM certificates like the iOSProf... | On an iOS enrolled device in the Intune service, when iOS mobile device manag... | 7.5 | contentidea-kb |
| 140 | When you receive a Device enrollment notification email message, the device i... | Blank device information in email notification messages is typically caused b... | Both causes of the blank information are by design. The Intune service was de... | 7.5 | contentidea-kb |
| 141 | How to Collect Company Portal Logs on iOS/iPad OS:   1. Open the Company Port... |  |  | 7.5 | contentidea-kb |
| 142 | How to Collect Mac Console Logs 1.&nbsp;Open &quot;Console&quot; on the Mac (... |  |  | 7.5 | contentidea-kb |
| 143 | Automate Device Enrollment (ADE) Token stops syncing, which subsequently caus... | This can occur due to one or more of the following: The password of the Manag... | Regardless of the reason, the token is Invalid and the only solution/remediat... | 7.5 | contentidea-kb |
| 144 | Customers are looking for a way to 'block' or 'ban' restricted applications l... |  |  | 7.5 | contentidea-kb |
| 145 | All new or updated internal KB articles, new content requests such as doc upd... |  |  | 7.5 | contentidea-kb |
| 146 | Due to a known issue, certain devices running Windows 10/11, Android, or iOS/... | Certain operating systems (and/or enrollment types) have known issues with re... | Devices require the following updates, otherwise they will need to unenroll a... | 7.5 | contentidea-kb |
| 147 | This article will guide you to setup (HTTP well-known resource file&nbsp;http... |  |  | 7.5 | contentidea-kb |
| 148 | All new or updated internal KB articles, new content requests such as doc upd... |  |  | 7.5 | contentidea-kb |
| 149 | This article explains the enrollment flow of an iOS ADE device enrolling with... |  |  | 7.5 | contentidea-kb |
| 150 | All new or updated internal KB articles, new content requests such as doc upd... |  |  | 7.5 | contentidea-kb |
| 151 | All new or updated internal KB articles, new content requests such as doc upd... |  |  | 7.5 | contentidea-kb |
| 152 | All new or updated internal KB articles, new content requests such as doc upd... |  |  | 7.5 | contentidea-kb |
| 153 | Apple introduced this new feature &quot;Live Voicemail&quot; with OS 17 (http... | Updated: Starting with iOS 17.2 apple introduced a configurable restriction f... | The current workaround is to create a &quot;Custom Profile&quot; with the&nbs... | 7.5 | contentidea-kb |
| 154 | All new or updated internal KB articles, new content requests such as doc upd... |  |  | 7.5 | contentidea-kb |
| 155 | Intune Managed iOS devices (17.2.1 or later) are unable to make phone calls i... |  |  | 7.5 | contentidea-kb |
| 156 | MaximumFailedAttempts &quot;Maximum allowed sign-in attempts&quot; not workin... | Apple confirmed this is an expected behavior and they will work on updating t... | Per Apple this is expected behavior. | 7.5 | contentidea-kb |
| 157 | UPN changed, IOS BYOD enrolled devices will re-register to AAD | After UPN changed, Company Portal unable to find the ernollment status with p... | when admin changed the user UPN, there is a known issue in AAD, that IOS Auth... | 7.5 | contentidea-kb |
| 158 | on an iPad device enrolled as Apple User Enrollment the user sign in to Edge ... | The enrollment type of User Enrollment causes the Device ID information to be... | We just go an answer from Edge PG (product group) and I want to share it with... | 7.5 | contentidea-kb |
| 159 | If the &quot;MDM server&quot; in Apple Business/School Manager (ABM/ASM) is r... | The &quot;MDM Server&quot; object where all the ADE devices and enrollment pr... | We need to connect a new      &quot;MDM server&quot; from ABM/ASM connected w... | 7.5 | contentidea-kb |
| 160 | Can't see data (files and folder) between managed kiosk iPad device and Windo... | This is because iPad has an encrypted file system for a security reason. | When managed iPad kiosk device connected to Windows machine, the files and fo... | 7.5 | contentidea-kb |
| 161 | Airdrop notification when receiving a file, is never shown to end-users on an... | Apple seems to have introduced a chance for AirDrop with iPadOS 18.x that cau... | The following app must be added to the &quot;Allowed/Show&quot; list of apps ... | 7.5 | contentidea-kb |
| 162 | In a scenario, where the Enrollment program token for apple devices is alread... | In the process of renewing the already configured ADE token (https://learn.mi... | Gather      the&nbsp;tokenID&nbsp;for the affected ADE TokenUse the UI to nav... | 7.5 | contentidea-kb |
| 163 | All users on supervised iOS/iPadOS or macOS devices receive any of the follow... | This is an expected behavior and By Design by Apple Volume Purchase Program (... | By Design by Apple. However, Developers may offer a separate full-featured ve... | 7.5 | contentidea-kb |
| 164 | Even when the&nbsp;Screen capture setting is configured to 'Block'&nbsp;in th... | This is a platform-level limitation by Apple. The iPhone Mirroring app on mac... | This behavior is&nbsp;by design. There is currently&nbsp;no MAM-based control... | 7.5 | contentidea-kb |
| 165 | Starting with iOS 26, Apple's system apps (like Apple TV, Apple Health, Apple... | This is an issue resulting from changes in Apple iOS behavior. For restricted... | This behavior does not necessarily indicate a problem, but if necessary, remo... | 7.5 | contentidea-kb |
| 166 | When attempting Account‑Driven User Enrollment (ADUE) on an iOS/iPadOS device... | This issue occurs when the iOS device is unable to successfully retrieve the ... | ​To resolve this issue, ensure that the MDM service discovery JSON file requi... | 7.5 | contentidea-kb |
| 167 | Approximately 1% of iOS 13+ devices enrolled in Intune cannot perform passwor... | Apple bug in iOS 13 where the token needed to allow password reset is not ret... | 1) Update device to iOS 13.3.1 or later. 2) Remove and re-enroll the device i... | 7.0 | mslearn |
| 168 | iTunes Encrypt local backup option automatically selected and cannot be desel... | Intune certificate profile causes iTunes to force backup encryption. Certific... | Expected behavior by Apple security design. No workaround available. | 6.5 | mslearn |
| 169 | Cannot access company resources on ADE (Apple Automated Device Enrollment) de... | Enrollment profile has Authentication method set to Setup Assistant and Compa... | Solution 1: Change Authentication method to Company Portal in enrollment prof... | 6.5 | mslearn |
| 170 | iOS device enrolled in Apple ADE does not start Intune enrollment process whe... | Enrollment profile created before ADE token upload to Intune, or no MDM profi... | Ensure enrollment profile exists and is assigned; edit profile to update modi... | 5.5 | mslearn |
| 171 | Even though a DEP enrollment profile is configured to show the iCloud & Apple... | This can occur if there is an iOS device restriction configuration profile as... | The behavior is expected because this setting is meant to keep the device on ... | 4.5 | contentidea-kb |
| 172 | When you turn on an Apple DEP managed device that is assigned an Intune enrol... | This issue can occur if the enrollment profile is created before the DEP toke... | To resolve this problem, complete the following steps: 1. Edit the enrollment... | 4.5 | contentidea-kb |
| 173 | When powering on a DEP-managed device that is assigned an enrollment profile ... | This can occur if there is a network connection problem between the device an... | To resolve this problem, fix the connection issue or use a different network ... | 4.5 | contentidea-kb |
| 174 | Expected behavior of the iOS "Delay Visibility of Software Update" |  | I wanted to bring to everyone’s attention the iOS Software update “Delay Visi... | 4.5 | contentidea-kb |
| 175 | You have enrolled a iOS device through DEP or Apple Configurator device makin... | If you are using the Intune iOS Device Restriction Policy that has the config... | If you wish to rename a iOS device that currently has a Device Restriction Po... | 4.5 | contentidea-kb |
| 176 | if the device has a passcode set, iOS/iPadOS Software Update fails to install... | The passcode prompt notification (Authorization request) is never presented o... | If the passcode can be removed on the device: Remove the passcode of the devi... | 4.5 | contentidea-kb |
| 177 | Unable to sync newly added DEP devices from Apple to Intune. | DEP account password got changed, this is one of the many reasons why apple w... | Renewed DEP token. | 4.5 | contentidea-kb |
| 178 | When deploying a show or hide apps profile to supervised iOS devices the poli... | Watch for duplicate bundle IDs or bundle ids which are incorrectly formatted ... | Remove the duplicate entry with the capitals and keep the bundle id in lower ... | 4.5 | contentidea-kb |
| 179 | Y ou can enroll up to 1,000 mobile devices with a single Azure Active Directo... |  |  | 3.0 | contentidea-kb |
| 180 | Manual enrollment issues : 1. Getting a “Company Portal Temporarily Unavailab... |  |  | 3.0 | contentidea-kb |
| 181 | When a user with a DEP enrolled device attempts to access a cloud app and Con... | This can occur if both of the following conditions are exist: 1. The enrollme... | To resolve this problem, either change the DEP profile to authenticate with t... | 3.0 | contentidea-kb |
| 182 | When you turn on an Apple DEP managed device that is assigned an Intune enrol... | This issue can occur if the enrollment profile is created before the DEP toke... | To resolve this problem, complete the following steps: 1. Make sure that an e... | 3.0 | contentidea-kb |
| 183 | When to use it Activation Lock is an anti-theft feature from Apple. The norma... | Pre-requisites Device is Supervised To confirm the device is Supervised in Ku... | Scenario #1 - if this is within 15 days of enrollment, you do not actually ne... | 3.0 | contentidea-kb |
| 184 | For many MDM administrators tasked with managing iOS devices, one challenge t... |  |  | 3.0 | contentidea-kb |
| 185 | Customer is deploying iOS devices using the DEP process. The DEP profile is c... | The customer had the ADE profile set to show the Apple ID page during DEP enr... | We changed the DEP profile to Hide the Apple ID screen. The user cannot login... | 3.0 | contentidea-kb |
| 186 | The purpose of this KB is to demonstrate the different types of enrollment me... |  |  | 3.0 | contentidea-kb |
| 187 | On Apple DEP enrolled devices, an Allow App and Book Assignment message keeps... | Apple has acknowledged that this is a known issue and that they are working o... | As a temporary work around, add iOS store apps to Microsoft Intune instead of... | 3.0 | contentidea-kb |
| 188 | In September, iOS 13 is scheduled to be released by Apple. Intune enrollment,... |  |  | 3.0 | contentidea-kb |

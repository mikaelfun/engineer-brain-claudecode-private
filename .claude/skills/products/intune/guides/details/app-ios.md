# INTUNE iOS 应用部署与 VPP — 已知问题详情

**条目数**: 123 | **生成日期**: 2026-04-17

---

## Quick Troubleshooting Path

### Step 1: Apple VPP token sync completes but purchased apps not showing in Intune; VppApplicationSyncEvent shows 0 applications returned
**Solution**: Check VppApplicationSyncEvent in Kusto: VppFeatureTelemetry | where TaskName == 'VppApplicationSyncEvent' | project applications — if count is 0, customer needs to resolve with Apple why purchased apps are not showing against the token. Also verify: (1) VPP token last sync time via VppService_VppMultiTokenAccount.LastApplicationFullSyncTimeInUtc, (2) user/device counts via VppService_VppMultiTokenUser/Device tables, (3) token state is valid.
`[Source: onenote, Score: 9.5]`

### Step 2: iOS device cannot exit old AppLock (Kiosk single-app mode) when switching to a new AppLock policy; new AppLock profile deployment shows error: The ...
**Solution**: Split into two check-ins: (1) First check-in: unassign old AppLock policy only, do NOT assign new policy - this triggers RemoveProfile and device exits single-app mode. (2) Second check-in: assign new AppLock policy - device enters new single-app mode. No workaround for single-step replacement. Apple notified via PG feedback.
`[Source: onenote, Score: 9.5]`

### Step 3: VPP app install fails on iOS device. Logs show is not ready for install since user yet to accept VPP invite.
**Solution**: Ensure user accepts the VPP invitation. If user did not receive the invite, check that App Store is not blocked via Intune device restriction policy. Use hide app option instead of blocking to maintain VPP functionality.
`[Source: onenote, Score: 9.5]`

### Step 4: VPP app license assignment fails with error code 9632: Too many recent calls to manage licenses with identical requests.
**Solution**: Switch from user-based VPP licensing to device-based licensing. Device licensing associates each VPP license to a unique device and does not require an Apple ID, avoiding the throttling issue.
`[Source: onenote, Score: 9.5]`

### Step 5: VPP app license assignment fails with error code 9616 (regUsersAlreadyAssigned). Some apps install while others fail for the same user.
**Solution**: Options: (1) Move to device licensing that does not involve user Apple ID, (2) Create a brand new Intune user for this user and associate a brand new Apple ID with it.
`[Source: onenote, Score: 9.5]`

### Step 6: VPP app install fails with LicenseNotFound. Apple rejects install request even though Intune shows license assigned.
**Solution**: Options: (1) Log back in with the original Apple ID used when first accepting Apple VPP agreement, (2) Move to device licensing that does not involve user Apple ID, (3) Create a brand new Intune user and associate a brand new Apple ID.
`[Source: onenote, Score: 9.5]`

### Step 7: VPP app install fails with VppDeviceLicenseAssignmentFailedEvent. User gets message Your organization has depleted its licenses for this app.
**Solution**: Options: (1) Switch to device-based VPP licensing, (2) Temporarily revoke app deployment for some users to reclaim licenses, (3) Purchase additional VPP licenses in Apple Business Manager.
`[Source: onenote, Score: 9.5]`

### Step 8: VPP apps not auto-updating on iOS devices despite tenant having auto-update enabled in Intune.
**Solution**: Upgrade devices to iOS 11.3 or later to enable VPP auto-update functionality.
`[Source: onenote, Score: 9.5]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Apple VPP token sync completes but purchased apps not showing in Intune; VppA... | Apple's Volume Purchase Program sync response does not return the purchased a... | Check VppApplicationSyncEvent in Kusto: VppFeatureTelemetry / where TaskName ... | 9.5 | onenote |
| 2 | iOS device cannot exit old AppLock (Kiosk single-app mode) when switching to ... | When old AppLock policy is unassigned and new AppLock policy is assigned in t... | Split into two check-ins: (1) First check-in: unassign old AppLock policy onl... | 9.5 | onenote |
| 3 | VPP app install fails on iOS device. Logs show is not ready for install since... | The user has not accepted the Apple Volume Purchase Program (VPP) invitation.... | Ensure user accepts the VPP invitation. If user did not receive the invite, c... | 9.5 | onenote |
| 4 | VPP app license assignment fails with error code 9632: Too many recent calls ... | Too many devices for a single user or too many Apple IDs making requests from... | Switch from user-based VPP licensing to device-based licensing. Device licens... | 9.5 | onenote |
| 5 | VPP app license assignment fails with error code 9616 (regUsersAlreadyAssigne... | The user Apple ID is already associated with the VPP sToken by another Intune... | Options: (1) Move to device licensing that does not involve user Apple ID, (2... | 9.5 | onenote |
| 6 | VPP app install fails with LicenseNotFound. Apple rejects install request eve... | User updated their Apple ID on one or more devices during the lifecycle of In... | Options: (1) Log back in with the original Apple ID used when first accepting... | 9.5 | onenote |
| 7 | VPP app install fails with VppDeviceLicenseAssignmentFailedEvent. User gets m... | All available VPP user licenses for the app have been claimed. iOS VPP user l... | Options: (1) Switch to device-based VPP licensing, (2) Temporarily revoke app... | 9.5 | onenote |
| 8 | VPP apps not auto-updating on iOS devices despite tenant having auto-update e... | VPP auto-update is not supported for devices running iOS versions below 11.3.... | Upgrade devices to iOS 11.3 or later to enable VPP auto-update functionality. | 9.5 | onenote |
| 9 | VPP app keeps re-installing or prompting for update on iOS/macOS. App version... | Could be: (1) Intune service packages incorrect app version - check CreateInt... | TSG steps: (1) Check app version via Apple lookup API, (2) Query IntuneEvent ... | 9.5 | onenote |
| 10 | VPP license cannot be revoked from retired/removed iOS devices via Intune por... | Intune cannot revoke VPP licenses from devices that are no longer managed. Ap... | Use REST client (Postman/Insomnia) to call Apple VPP API: 1. Get VPP token fr... | 9.5 | onenote |
| 11 | VPP app installation prompts user for Apple ID credentials. Confusion about w... | VPP user-based licensing requires Apple ID association. Each Apple ID can onl... | Switch to VPP device-based licensing to avoid Apple ID prompts. For user-base... | 9.5 | onenote |
| 12 | iOS VPP app is not ready for install. Kusto DeviceManagementProvider shows iO... | User has not accepted the VPP invite. If user did not receive invite, Apple A... | 1. Verify user has accepted VPP invite. 2. If invite was not received, check ... | 9.5 | onenote |
| 13 | VPP apps are not automatically updating on iOS devices even though the tenant... | VPP auto-update is not supported for devices with iOS version below 11.3. App... | Update the iOS device to 11.3 or later to enable VPP app auto-update. For dev... | 9.5 | onenote |
| 14 | VPP token 在 Intune Admin Center 显示 Duplicate 状态，多个 token 关联到同一 ABM location | 管理员在 Intune 中创建了新的 VPP token 而非续签已有 token，导致两个 token 指向同一 ABM location（Duplic... | 1. 在 Intune Admin Center 中删除重复的 VPP token（保留较早创建的那个）；2. 将应用分配重新关联到保留的 token；3... | 9.0 | ado-wiki |
| 15 | 无法删除或撤销 VPP 应用许可证，报错 'The app failed to delete. Ensure that the app is not as... | VPP 应用仍有 license 关联在 ABM location token 上，必须先 revoke 所有 license 才能删除应用 | 1. 在 Intune 中 Revoke 该应用的所有 license（Apps → iOS → select VPP app → App license... | 9.0 | ado-wiki |
| 16 | VPP token sync 失败，Kusto 显示 FailedSTokenValidation error 9625: 'The server has... | VPP sToken 已被 Apple 服务器吊销（过期、ABM 侧手动操作或安全策略触发） | 1. 在 ABM/ASM 中下载新的 sToken 文件；2. 在 Intune Admin Center 中上传新 sToken 续签 token（不要... | 9.0 | ado-wiki |
| 17 | VPP 应用报错 'Could not retrieve license for the app with iTunes Store ID'，应用无法安装 | VPP license 未正确分配到设备或用户，可能由 token sync 问题、license 不足或分配冲突导致 | 1. Sync VPP token → sync 设备；2. 如问题持续，移除 group assignment 并重新分配为 device-licens... | 9.0 | ado-wiki |
| 18 | 点击 Disable Activation Lock 操作后设备上没有任何变化 | 这是预期行为——点击该操作后 Intune 向 Apple 请求更新的绕过代码，管理员需手动在设备 Activation Lock 屏幕输入该代码 | 1. 点击 Disable Activation Lock 后复制绕过代码；2. 在设备 Activation Lock 界面的密码字段手动输入代码；3.... | 9.0 | ado-wiki |
| 19 | Apple Business Manager 与 21V Azure AD Federation 在 21V 无法使用 | ABM app 在 21V AAD 中不可用 | 不支持；不能在 21V 配置 ABM + Intune 自动注册联动 | 8.0 | 21v-gap |
| 20 | iOS VPP app install fails with VPP error code 9632: Too many recent calls to ... | Too many devices for one user or too many Apple IDs making requests from the ... | Switch to device-based VPP licensing instead of user-based licensing to avoid... | 8.0 | onenote |
| 21 | All iOS VPP app installs fail for a given user with LicenseNotFound. Intune s... | The user updated their Apple ID on one of their devices. Apple system records... | 1) Log back in with the original Apple ID used when the user first accepted A... | 8.0 | onenote |
| 22 | iOS VPP app install fails with message Your organization has depleted its lic... | User licensing allows installation on 5-10 devices per user. All available VP... | Either purchase more VPP licenses, switch to device-based licensing, or tempo... | 8.0 | onenote |
| 23 | 'Mismatch between the value type and the configuration value' error when iOS ... | iOS configuration profiles don't support the ampersand character in XML confi... | Replace '&' with '&amp;' in the URL, or create a short URL redirect that avoi... | 8.0 | mslearn |
| 24 | 'Safari cannot open the page because the address is invalid' error when openi... | Web app policy has 'Require a managed browser to open this link' set to Yes, ... | Either install the Intune Managed Browser on the iOS device, or set 'Require ... | 8.0 | mslearn |
| 25 | *********************************** Please Read *****************************... | After migration to the Azure Portal customers will now need to be manually fl... | Requirements for completing the flighting request: � Member of the intunecssf... | 7.5 | contentidea-kb |
| 26 | Apps purchased with the Apple Volume Purchase Program are not appearing in th... | There are two potential causes of this issue:  A user can sync apps from the ... | Cause 1 - By DesignCause 2- Not Supported at this time.  On the Intune side i... | 7.5 | contentidea-kb |
| 27 | When an iPhone user with a paired Apple watch enrolls their phone into Intune... | This can occur if there is an iOS Device Restriction configuration profile as... | To work around this problem, set Viewing corporate documents in unmanaged app... | 7.5 | contentidea-kb |
| 28 | When the Pioneer Trade Show app is deployed to iOS devices, the Share button ... | This can occur if the policy Viewing corporate documents in unmanaged apps is... | To resolve this issue, configure the policy Viewing corporate documents in un... | 7.5 | contentidea-kb |
| 29 | When downloading OneNote for iOS deep link app deployed "As Available" it get... | URL on app was set to Canada - https://itunes.apple.com/ca/app/microsoft-onen... |  | 7.5 | contentidea-kb |
| 30 | Customer has a hybrid Intune environment and has configured a policy to deplo... | The LOB app has expired | The expiration date must be extended per Apple�s instructions. Apple App Deve... | 7.5 | contentidea-kb |
| 31 | Customer wants to make Intune web apps available when applying iOS configurat... |  | Deploy apps to device, then in Device restrictions profile add web app using ... | 7.5 | contentidea-kb |
| 32 | Customer requesting deletion of VPP tokenMultiple VPP tokens in admin portal | Update 12/19/17: The option to delete VPP tokens was added to the Ibiza UI wi... | Template for Customer CommunicationMy name is <SE name> and I will be assisti... | 7.5 | contentidea-kb |
| 33 | First, Determine if customer is using User Licensing or Device Licensing iOS ... |  |  | 7.5 | contentidea-kb |
| 34 | Apple iOS VPP apps do not install with device based licensing with error 1206... | VPP token previously linked to another MDM solution. | Delete the VPP from the 3rd party MDM to place it a &quot;new&quot; token sta... | 7.5 | contentidea-kb |
| 35 | In a standalone Intune environment, App Inventory for corporate-owned iOS dev... | This is expected behavior in a standalone Intune environment. | Per https://docs.microsoft.com/en-us/intune/app-management, Discovered Apps &... | 7.5 | contentidea-kb |
| 36 | Customer reports that on iOS 11.x when sending a corporate file from a manage... | This is expected behavior for iOS 11.x that has been confirmed by the Product... | This is now expected behavior, please note to the customer that Intune encryp... | 7.5 | contentidea-kb |
| 37 | When troubleshooting the deployment of IPAs to iOS devices like iPhones and i... |  |  | 7.5 | contentidea-kb |
| 38 | After configuring and assigning a managed iOS app from the App Store, the ins... | This can occur if the URL for the app is malformed or incorrect. For example,... | To resolve this problem, correct the URL in the app package. | 7.5 | contentidea-kb |
| 39 | When attempting to access offline files in OneDrive when using an iOS device ... | This is caused by a bug in OneDrive. | This is scheduled to be fixed in the January 2018 update for the iOS OneDrive... | 7.5 | contentidea-kb |
| 40 | When a device restriction policy for Show or Hide Apps is configured to show ... | This is by design. The Hidden Apps list and the Visible Apps list only suppor... | There are two potential workarounds for this: 1. Use a bundle ID of com.apple... | 7.5 | contentidea-kb |
| 41 | Customer has an App configuration policy to setup a bookmark in the Managed B... | Cisco ACLs was blocking communication. | Customer was using a Managed Browser with a VPN profile and had applied Cisco... | 7.5 | contentidea-kb |
| 42 | There was an issue in Intune regarding how files are shared in OneDrive. The ... |  |  | 7.5 | contentidea-kb |
| 43 | When configuring iOS Device Restrictions such as single app mode or Home scre... | Every iOS app requires a Bundle ID (e.g. com.microsoft.CompanyPortal). There ... | Find the app in iTunes store, copy the number after id in the URL, navigate t... | 7.5 | contentidea-kb |
| 44 | Finding the App Bundle ID for iOS Apps. There is no way to directly look up b... |  |  | 7.5 | contentidea-kb |
| 45 | In the upcoming iOS release, version 12, Apple has made changes to how VPN fu... |  |  | 7.5 | contentidea-kb |
| 46 | Apple VPP token shows Assigned to external MDM or assignedToExternalMDM or Cl... | The same VPP location token was uploaded in two or more device management sol... | Identify the conflicting MDM. If token needed in both MDMs: keep existing tok... | 7.5 | contentidea-kb |
| 47 | When deploying Intune managed iOS store apps with assignment types of Require... | This can occur if the user is using iOS 11.3.x - 12.x, and the device has ena... | This issue has been fixed by Apple in iOS 12 Beta 6. To resolve this problem,... | 7.5 | contentidea-kb |
| 48 | Intune now supports Cisco AnyConnect 4.0.7 and higher for iOS. In this articl... |  |  | 7.5 | contentidea-kb |
| 49 | Attempting to enroll an iOS device using the Company Portal app fails with on... | This can occur if the Company Portal app is out of date or corrupted. | To resolve this issue complete the following:1. Remove (uninstall) the Compan... | 7.5 | contentidea-kb |
| 50 | When creating an App Configuration Policy for iOS and in Configuration Settin... | The limitation in the UI is due to the limitations of Apple aka their apps\xm... | There are two options for solution for this to align with Apple's requirement... | 7.5 | contentidea-kb |
| 51 | Users are unable to save contacts from the managed Outlook app for iOS to the... | This can occur if there is an iOS device restriction policy that blocks the s... | Microsoft is working with Apple on this issue. In the meantime, the current r... | 7.5 | contentidea-kb |
| 52 | When deploying custom VPN profile to iOS devices, it fails with Error -201634... | There is a formatting error in the XML. | Load the file in Apple Configurator to verify if it is formatted correctly or... | 7.5 | contentidea-kb |
| 53 | Deployed configuration with Autonomous Single App Mode (ASAM) is not locking ... | Application does not support the Autonomous Single App Mode feature. | App must use UIAccessibilityRequestGuidedAccessSession() call. Known supporte... | 7.5 | contentidea-kb |
| 54 | After updating to or installing the latest version of the Company Portal app ... | This occurs because the latest update to the Intune Company Portal app now en... | To resolve this issue, make sure that all your network connections configured... | 7.5 | contentidea-kb |
| 55 | Customer deleted existing VPP token and tried to import newly created token o... | Customer has migrated from Apple VPP to Apple Business Manager and was using ... | Download and import a new token from Apple Business Manager by going to Setti... | 7.5 | contentidea-kb |
| 56 | The Intune App Protection (APP) policy for the iOS setting for Third party ke... |  |  | 7.5 | contentidea-kb |
| 57 | After creating and assigning an app configuration policy for iOS, the policy ... | Many times this can occur if the&nbsp;application was removed from the portal... | To resolve this issue, the App Configuration policy must be recreated using t... | 7.5 | contentidea-kb |
| 58 | Customer has configured an app protection policy to block saving corporate fi... | Apple’s Open-in functionality | Configure the following setting in the app protection policy to block Apple's... | 7.5 | contentidea-kb |
| 59 | When the iOS App is being push from the VPP Account, it shows the error code&... | This was cause due to the fact that there was only 1 token assign to JAMF, bu... | Customer would need to have 1 VPP token for JAMF and one VPP token for Intune. | 7.5 | contentidea-kb |
| 60 | Bottom &quot;insert photo or video&quot; in native iOS email application disa... | In device restriction policy, if the option “Viewing non-corporate documents ... | If you wish to restore this functionality, remove this setting from the devic... | 7.5 | contentidea-kb |
| 61 | In this scenario, there are apps on enrolled devices that were installed via ... | By Design.     Intune       can uninstall applications deployed via the MDM C... | To remove an application on an enrolled device that was not deployed via the ... | 7.5 | contentidea-kb |
| 62 | iOS - Kiosk devices screen is not getting locked. This was causing the batter... | There's a mismatch with the Auto Lock setting on the Intune UI.If the Auto Lo... | To resolve this issue, edit the kiosk policy and set the Auto Lock to Not con... | 7.5 | contentidea-kb |
| 63 | VPP application (in-house app) was updated but the updated version of the app... | Product Engineering team confirmed that there was an issue within the Intune ... | Resolved with Intune 1907 service releaseWorkaround: you could initiate an un... | 7.5 | contentidea-kb |
| 64 | ABM (apple Business Manager) Apps are not getting synced for ABM (apple Busin... |  |  | 7.5 | contentidea-kb |
| 65 | Scenario 1 Actual Error Published IPA file fails to install from Company Port... |  |  | 7.5 | contentidea-kb |
| 66 | How ToiOS Store Appshttps://docs.microsoft.com/en-us/intune/store-apps-iosYou... |  |  | 7.5 | contentidea-kb |
| 67 | When an iPhone user with a paired Apple watch enrolls their phone into Intune... |  |  | 7.5 | contentidea-kb |
| 68 | Scenario 1Actual CauseCustomer does not have latest version of Company Portal... |  |  | 7.5 | contentidea-kb |
| 69 | Customer reported that when trying to download an iOS/iPad OS beta profile th... | The customer had an app protection policy which restricted to save copies of ... | There are three different workarounds that the customer can perform:&nbsp;Exc... | 7.5 | contentidea-kb |
| 70 | Error (0x87D13B9E) is displayed in the Intune console when installing LOB VPP... | Error (0x87D13B9E) indicates that the application was possibly all ready inst... | Manually uninstall the app and redeploy it via Intune&nbsp; | 7.5 | contentidea-kb |
| 71 | Unable to search for app in new IOS app deployment &quot;Stuck at searching&q... | This can be caused by a networking issue on the machine that is binged used t... | Make sure the computer there the Azure portal is binged access from has acces... | 7.5 | contentidea-kb |
| 72 | This is applicable if the following scenario is true:You are deploying Apple ... | User Enrollment on iOS 13+ only supports VPP applications with User Licensing... | At the time of writing (December 6th, 2019) - the Company Portal app will sho... | 7.5 | contentidea-kb |
| 73 | Navigate to Apps &gt; add, iOS Store apps, Search the App Store, when present... | Networking requirements not met | This feature needs internet access to itunes.apple.com via port 443.&nbsp;Wor... | 7.5 | contentidea-kb |
| 74 | When attempting to sign in using the Company Portal app, the user is presente... | The same user could sign in on the Company Portal using a different iOS devic... | Customer installed the Microsoft Authenticator app on the device and this all... | 7.5 | contentidea-kb |
| 75 | When a user tries to install Company Portal app on Mac OSX device using aka.m... | One of the reasons this happens is when the device cannot reach Apple's notar... | Make sure the proxy or firewall is configured to reach Apple's notarization s... | 7.5 | contentidea-kb |
| 76 | After deploying a VPP app, the app fails to install and generates either&nbsp... | This can occur when all of the following are true:The VPP app is deployed as ... | To work around this problem, use device-based licensing for VPP applications.... | 7.5 | contentidea-kb |
| 77 | Welcome to Intune's workflow for&nbsp;App Wrapping Tool for iOS. Here you wil... |  |  | 7.5 | contentidea-kb |
| 78 | Customers who have assigned an iOS VPP app to a group prior to 1           ... | An error in an internal process caused a failure to retrieve metadata for iOS... | Customers should re-target the application at the intended AAD group. In most... | 7.5 | contentidea-kb |
| 79 | In multiple scenarios related to application deployment issue, we have to som... |  |  | 7.5 | contentidea-kb |
| 80 | To renew an Existing VPP location token used with Microsoft Endpoint Manager,... |  |  | 7.5 | contentidea-kb |
| 81 | Always validate the following basic information, as most issues could be iden... |  |  | 7.5 | contentidea-kb |
| 82 | One of my customers opened a ticket due to Two legacy (iDTE / Webex Meetings)... |  | To remove an App via Graph API, we need to get first the Application Id&nbsp;... | 7.5 | contentidea-kb |
| 83 | For iOS we are prohibited from asking customer for a signed copy of IPA. so i... |  |  | 7.5 | contentidea-kb |
| 84 | For iOS we are prohibited from asking customer for a signed copy of IPA. so i... |  |  | 7.5 | contentidea-kb |
| 85 | Some Apple VPP tokens started to show up status &quot;Duplicate&quot; in the ... | A change on Intune service was made around June 15th 2020 Duplicate Apple VPP... | Currently there is only one solution and it is called out in our external doc... | 7.5 | contentidea-kb |
| 86 | When  trying to Deploy LOB App from Intune to Shared iPad Devices App Status ... | Apple  is following a new direction with its platform to Limit Deploying LOB ... | Deploying LOB App to  Shared iPads through Intune is not supported.For custom... | 7.5 | contentidea-kb |
| 87 | Custom configuration iOS profiles current supported maximum size for the Appl... |  |  | 7.5 | contentidea-kb |
| 88 | The new generation of the Apple MacBook now comes with their M1 chip, and on ... |  |  | 7.5 | contentidea-kb |
| 89 | Microsoft Intune helps you manage apps purchased through the Volume Purchase ... | This can occur when the applications you buy using Apple Business Manager are... | To resolve this problem, make sure the application that is not appearing is a... | 7.5 | contentidea-kb |
| 90 | Apps on iOS can be exempted from MAM data transfer restrictions by their URL ... |  |  | 7.5 | contentidea-kb |
| 91 | The Intune DEP profile Install Company Portal with VPP&nbsp;displays “No VPP ... | From Rave-&gt; Troubleshooting -&gt; VPP , you will be able to see the totalV... | To resolve this issue, the customer needs to go to the ABM portal and add the... | 7.5 | contentidea-kb |
| 92 | Cisco ISE fails to get the device registration state and compliance state fro... | iOS 14+ wireless for security has MAC randomization enabled by default.When r... | For Manual steps on iOS device :-Open the Settings app, then tap Wi-Fi.Tap th... | 7.5 | contentidea-kb |
| 93 | an iOS device is suddenly evaluated as noncompliant and a message appears sta... | This can occur if the password has expired. Due to a known Apple bug in the i... | To resolve this problem, change the password on the iOS device manually. | 7.5 | contentidea-kb |
| 94 | After performing a selective wipe, OneNote, Word, PowerPoint or Excel for iOS... | This can occur if&nbsp;there is an&nbsp;inconsistency in accounts across all ... | To work around this problem,&nbsp;clear out the credentials under Settings -&... | 7.5 | contentidea-kb |
| 95 | In-house/Enterprise iOS app may fail to install on new iOS 15 beta version wi... | Apple has strengthened the security of iOS 15. Among the improvements, iOS 15... | Application showing this installation error, and which were signed on macOS 1... | 7.5 | contentidea-kb |
| 96 | After assigning an iOs App Protection Policy, there is no check-in count, and... | This can occur if all the required steps to protect Acrobat Reader have not b... | To resolve this issue, please follow the steps from the Adobe official docume... | 7.5 | contentidea-kb |
| 97 | Apps purchased in ABM not sync'ed in the Intune Console. |  | For this step-by-step process, I'll use the Company Portal as an example. 1. ... | 7.5 | contentidea-kb |
| 98 | This article describes how to&nbsp; check the VPP token info via the intune a... |  | Ask the customer to locate the VPP token downloaded from ABM that was later u... | 7.5 | contentidea-kb |
| 99 | Customer was having below setup: 2 Apps&nbsp;(Teams and Outlook) are availabl... | App Configuration Profile was not successfully deployed to iOS enrolled device. | Troubleshooting Steps taken in order: 1- For App Protection Policy (with Mana... | 7.5 | contentidea-kb |
| 100 | There are times when the VPP App license revocation process fails in the&nbsp... | What to do when the Revoke License option does not work? First, we need to be... | If we confirm that the API successfully revokes the license, this will mean t... | 7.5 | contentidea-kb |
| 101 | This is a troubleshooting guide on how to configure and validate the app conf... |  |  | 7.5 | contentidea-kb |
| 102 | iOS users are unable to download files from the Edge browser and receive the ... | By default, the Edge browser will download files directly to the downloads fo... | Currently there is no app configuration policy available for Edge to change t... | 7.5 | contentidea-kb |
| 103 | iOS users are unable to download files from the Edge browser due to the messa... | It is expected behavior from the Edge browser to download directly to the dow... | As of now, there is no app configuration in Edge to change the location of th... | 7.5 | contentidea-kb |
| 104 | VPP applications fail to install on ADE enrolled devices and the following er... | This can occur if the&nbsp;VPP Token is invalid. To verify that this is your ... | To resolve this issue, renew the VPP token by using the following steps: 1.&n... | 7.5 | contentidea-kb |
| 105 | Unable to update VPP token organization name. | Organization name value is synced from VPP token, should be updated by Apple. | When using Graph API to call get VPP token, customer may found a value organi... | 7.5 | contentidea-kb |
| 106 | This article contains information about the steps to collect and analyze logs... |  |  | 7.5 | contentidea-kb |
| 107 | After deploying IOS settings via either device restriction policy or device c... | This caused by the IOS setting on the device does not support multiple payloa... | To resolve this issue make sure to deploy single policy to the device on poli... | 7.5 | contentidea-kb |
| 108 | End-user is able to login to Windows device successfully but cannot login to ... | Smart Punctuation is turned on. It affects how the keyboard operates | Turn off Smart Punctuation and ask end-user to retry the login  https://suppo... | 7.5 | contentidea-kb |
| 109 | Intune admin is unable to remove a VPP app from Intune portal. When trying to... | In order to be able to Delete/Remove a VPP app from Intune Portal, there cann... | The following actions need to take place before any VPP app can be removed (N... | 7.5 | contentidea-kb |
| 110 | iOS&nbsp;Webclip and weblink deployed to &quot;Available with or without enro... | Webclip are sent to a device as an MDM Payload. &nbsp;The device MUST be enro... | This behavior is by design because Webclip/Weblink needs to go as application... | 7.5 | contentidea-kb |
| 111 | VPP app with device licensing keeps prompting iOS users to click Upgrade even... | After a new app version is released in Apple App Store, Intune initially dete... | 1. Issue is typically transient and resolves after 1-2 weeks. 2. Verify via A... | 7.0 | onenote |
| 112 | Microsoft Store for Business volume-purchased apps do not synchronize and do ... | The apps use the encrypted app package format (EAppxBundle), which is not sup... | Distribute the affected apps through the private store instead of relying on ... | 6.5 | mslearn |
| 113 | After creating and assigning an app configuration policy for iOS, the policy ... | Many times this can occur if the application was removed from the portal and ... | To resolve this issue, the App Configuration policy must be recreated using t... | 4.5 | contentidea-kb |
| 114 | Customer has configured an app protection policy to block saving corporate fi... | Apple’s Open-in functionality | Configure the following setting in the app protection policy to block Apple's... | 4.5 | contentidea-kb |
| 115 | Bottom "insert photo or video" in native iOS email application disappeared or... | In device restriction policy, if the option “Viewing non-corporate documents ... | If you wish to restore this functionality, remove this setting from the devic... | 4.5 | contentidea-kb |
| 116 | iOS - Kiosk devices screen is not getting locked. This was causing the batter... | There's a mismatch with the Auto Lock setting on the Intune UI. If the Auto L... | To resolve this issue, edit the kiosk policy and set the Auto Lock to Not con... | 4.5 | contentidea-kb |
| 117 | The Intune App Protection (APP) policy for the iOS setting for Third party ke... |  |  | 3.0 | contentidea-kb |
| 118 | When the iOS App is being push from the VPP Account, it shows the error code ... | This was cause due to the fact that there was only 1 token assign to JAMF, bu... | Customer would need to have 1 VPP token for JAMF and one VPP token for Intune. | 3.0 | contentidea-kb |
| 119 | In this scenario, there are apps on enrolled devices that were installed via ... | By Design. Intune can uninstall applications deployed via the MDM Channel (In... | To remove an application on an enrolled device that was not deployed via the ... | 3.0 | contentidea-kb |
| 120 | VPP application (in-house app) was updated but the updated version of the app... | Product Engineering team confirmed that there was an issue within the Intune ... | Resolved with Intune 1907 service release Workaround: you could initiate an u... | 3.0 | contentidea-kb |
| 121 | ABM (apple Business Manager) Apps are not getting synced for ABM (apple Busin... |  |  | 3.0 | contentidea-kb |
| 122 | Scenario 1 Actual Error Published IPA file fails to install from Company Port... |  |  | 3.0 | contentidea-kb |
| 123 | How To iOS Store Apps https://docs.microsoft.com/en-us/intune/store-apps-ios ... |  |  | 3.0 | contentidea-kb |

# Intune 应用部署通用问题 — 综合排查指南

**条目数**: 57 | **草稿融合数**: 2 | **Kusto 查询融合**: 1
**来源草稿**: ado-wiki-Company-Portal-GCC-H.md, ado-wiki-a-Web-Company-Portal.md
**Kusto 引用**: app-install.md
**生成日期**: 2026-04-07

---

## ⚠️ 已知矛盾 (16 条)

- **solution_conflict** (high): intune-ado-wiki-a-r1-001 vs intune-contentidea-kb-004 — context_dependent: 不同来源给出不同方案，可能适用不同场景
- **solution_conflict** (high): intune-ado-wiki-a-r1-001 vs intune-contentidea-kb-077 — version_superseded: Entry intune-contentidea-kb-077 contains deprecated/EOL language
- **solution_conflict** (high): intune-ado-wiki-a-r1-001 vs intune-contentidea-kb-319 — context_dependent: 不同来源给出不同方案，可能适用不同场景
- **solution_conflict** (high): intune-ado-wiki-a-r1-001 vs intune-contentidea-kb-557 — context_dependent: 不同来源给出不同方案，可能适用不同场景
- **solution_conflict** (high): intune-ado-wiki-a-r1-001 vs intune-contentidea-kb-621 — context_dependent: 不同来源给出不同方案，可能适用不同场景

## 排查流程

### Phase 1: Company Portal Gcc H
> 来源: ADO Wiki — [ado-wiki-Company-Portal-GCC-H.md](../drafts/ado-wiki-Company-Portal-GCC-H.md)

**Company Portal for GCC-H — ADO Wiki 提取草稿**
**概述**
**Known Issue: GCC-H 无法从 Store 部署 Company Portal**
1. **使用商业账号**下载（⚠️ 不能用 GCC-H UPN，否则下载会被阻止）:
   ```
   ```
2. 将下载的二进制文件打包为 **LOB 应用**，通过 Intune 推送
3. ⚠️ **维护注意**: 每次 Company Portal 有新版本更新时，需重复：下载 → 重打包 → 重部署

**参考链接**
- Wiki: https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FApp%20Management%2FWindows%2FCompany%20Portal%20for%20GCC-H

### Phase 2: A Web Company Portal
> 来源: ADO Wiki — [ado-wiki-a-Web-Company-Portal.md](../drafts/ado-wiki-a-Web-Company-Portal.md)

**About the Company Portal Website**
**Available End-User Actions**
1. Check status - Initiate a status check to verify or regain access to organizational resources.
2. View and manage work apps - Search, filter, and install available work apps.
3. Store recovery key (macOS) - Store and rotate the FileVault key for an encrypted Mac.
4. Get recovery key (macOS) - Retrieve the stored FileVault key.
5. Get recovery key (Windows) - Retrieve the stored BitLocker key.

**Device Compliance Status**

**Configuring the Company Portal Website**

**Scoping Questions**
1. What browser and browser version is the user using?
2. Is the user able to sign in, or does the issue occur before/during/after authentication?
3. Is the device enrolled in Intune? Is it a personal or corporate device?
4. What specific action is the user trying to perform?
5. What error message (if any) is displayed?

**FAQ**

### Phase 3: Kusto 诊断查询

#### app-install.md
`[工具: Kusto skill — app-install.md]`

```kql
DeviceManagementProvider  
| where env_time >= ago(7d)
| where ActivityId == '{deviceId}'
| where (EventId == 5767 or EventId == 5766) 
| project env_time, EventId, TaskName, enforcementType, enforcementState, errorCode, 
    name, ['id'], typeAndCategory, applicablilityState, reportComplianceState, 
    EventMessage, message, env_cloud_name, ActivityId, tenantId, userId, 
    sessionId, relatedActivityId2, appPolicyId, platform, technology, devicePlatformType 
| order by ActivityId, env_time asc 
```

```kql
DeviceManagementProvider  
| where env_time >= ago(2d)
| where ActivityId == '{deviceId}'
| where (['id'] contains '{appId}' or appPolicyId contains '{appId}' 
    or message contains '{appId}' or name contains '{appName}')  
| where (EventId == 5767 or EventId == 5766) 
| project env_time, EventId, TaskName, enforcementType, enforcementState, errorCode, 
    name, ['id'], typeAndCategory, applicablilityState, reportComplianceState, 
    EventMessage, message, env_cloud_name, ActivityId, tenantId, userId, 
    sessionId, relatedActivityId2, appPolicyId, platform, technology, devicePlatformType 
| order by ActivityId, env_time asc 
```

```kql
DeviceManagementProvider
| where env_time >= ago(2d)
| where ActivityId == '{deviceId}'
| where message contains '{appName}' or EventMessage contains '{appName}'
| project env_time, message, EventMessage, aadDeviceId, ActivityId
```

```kql
let devId='{deviceId}';

DeviceManagementProvider
| where SourceNamespace == "IntuneCNP"
| where env_time > ago(7d) and ActivityId == devId
| where EventId==5786
| project env_time, EventId, Level, name, type=typeAndCategory, compliance=reportComplianceState, EventMessage  
| where type=="AppModel;AppModel" and compliance=="NotInstalled"
| summarize lastNotInstalled=max(env_time) by name 
| join kind= leftouter (
    DeviceManagementProvider
    | where SourceNamespace == "IntuneCNP"
    | where env_time > ago(7d) and ActivityId == devId
    | where EventId==5786
    | project env_time, EventId, Level, name, type=typeAndCategory, compliance=reportComplianceState, EventMessage  
    | where type=="AppModel;AppModel" and compliance=="Installed"
    | summarize 1stInstalled=min(env_time) by name 
) on name 
| project name, lastNotInstalled, 1stInstalled, compliance = iff(isnull(1stInstalled), "NotInstalled", "Installed")
```

```kql
DownloadService
| where SourceNamespace == "IntuneCNP"
| where env_time > ago(1d)
| where EventId in (13796)
| where deviceId == '{deviceId}' 
| project env_time, SourceNamespace, accountId, deviceId, userId, TaskName, 
    EventId, status, platform, statusCode, exception, errorEventId, result, EventMessage
```

```kql
IntuneEvent
| where env_time >= ago(3d)
| where ApplicationName == 'SideCar'
| where ActivityId == '{deviceId}'
| project env_time, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, 
    ComponentName, RelatedActivityId, SessionId
```

```kql
IntuneEvent
| where env_time >= ago(24h)
| where ApplicationName == 'SideCar'
| where ActivityId == '{deviceId}'
| extend Policy = split(Col3, ',')
| extend PolicyId = split(Policy[0],':')[1]
| extend PolicyType = split(Policy[1],':')[1]
| extend PolicyVersion = split(Policy[2],':')[1]
| extend PolicyBody = split(Policy[5],'":\"')[1]
| project PolicyId, PolicyType, PolicyVersion, PolicyBody
```

```kql
DeviceManagementProvider
| where env_time >= ago(30d)
| where * contains '{deviceId}'
| where * contains 'IntuneWindowsAgent'
| project env_time, name, applicablilityState, reportComplianceState  
| summarize max(env_time) by name, applicablilityState, reportComplianceState 
```

```kql
let starttime = datetime({startTime});
let endtime = datetime({endTime});
let deviceid = '{deviceId}';
let inputAccountId = '{accountId}';
let ApplicationId = '{appId}';

let correlationTable = cluster('intunecn.chinanorth2.kusto.chinacloudapi.cn').database('intune').
IntuneEvent
| where env_time between (starttime..endtime)
| where DeviceId contains deviceid
| where ComponentName == 'DownloadService'
| where EventUniqueName == 'AppRequestCorrelation'
| where AccountId == inputAccountId
| project env_time, env_seqNum, env_cloud_name, env_cloud_role, env_cloud_roleInstance, ApplicationName, BuildVersion, Pid, Tid, ActivityId, RelatedActivityId,
Level = TraceLevel, EventUniqueName, AccountId, ContextId, UserId, DeviceId, ApplicationId = Col1, ContentId = Col2, FileId = Col3, HttpVerb = Col4, cV, Exception = Message;

correlationTable
| summarize by RelatedActivityId, ApplicationId, ContextId
| join (
    DownloadService
    | where env_time between (starttime..endtime) and EventId == 13796
    | where accountId =~ inputAccountId
    | project env_time, env_seqNum, env_cloud_name, env_cloud_role, env_cloud_roleInstance, ApplicationName = I_App,
    BuildVersion = I_BuildVer, Pid, Tid, ActivityId,
    RelatedActivityId = relatedActivityId2, Level, EventUniqueName = TaskName, AccountId = accountId, UserId = userId, DeviceId = deviceId, exceptionType,
    platform, requestedRange, statusCode, bytesDelivered, bytesRequested, timeElapsed, cV, Message = EventMessage
) on RelatedActivityId
| project-away RelatedActivityId1
| order by env_time asc, env_seqNum asc
| summarize MegabytesTransfered = sum(bytesDelivered)/1024/1024 by ApplicationId, AccountId, DeviceId, bin(env_time, 10m)
| order by MegabytesTransfered desc
| limit 1000
```


---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | OneDrive/Outlook for Android frequently signs out or is unable to sign in; Outlook log shows 'Una... | Microsoft Authenticator (when used as broker app) is not in the Android batte... | Uninstall Microsoft Authenticator app; let Company Portal serve as the authentication broker app.... | 🟢 9.0 | OneNote |
| 2 | Need to understand Intune app deployment architecture to troubleshoot why a required app is not i... | Intune uses two parallel deployment architectures: (1) Main OMA-DM/IWS path f... | Store/LOB apps: trace push notification > OMA-DM check-in > DownloadService > GetAppStatus/Report... | 🟢 9.0 | OneNote |
| 3 | Intune Win32 app or LOB app download fails silently on Windows; BITS (Background Intelligent Tran... | BITS handles background package downloads for Intune LOB and Win32 apps on Wi... | Collect BITS ETL + netmon + procmon + TTT traces: (1) Download netmon and procmon (Sysinternals);... | 🟢 9.0 | OneNote |
| 4 | macOS LOB app (.pkg wrapped to .intunemac) shows Install status in Company Portal even after succ... | The .pkg file contains multiple app installers (e.g., Wireshark has 3 sub-pac... | Extract the .pkg file using 'xar -x -f <pkg> -C <output>' and verify each sub-package install-loc... | 🟢 9.0 | OneNote |
| 5 | After deploying app as Available type to user group, end user unable to see the app in Company Po... | Effective group membership change has not yet propagated to Intune backend. W... | 1. Check Kusto HttpSubsystem for Company Portal API calls: filter by deviceId, verify resultCount... | 🟢 9.0 | OneNote |
| 6 | Cannot deploy Windows Company Portal app as 'Required' to devices via Microsoft Store legacy in I... | Microsoft Store legacy integration only supports 'Available' assignment type ... | Download Company Portal offline installer from Microsoft Download Center (https://www.microsoft.c... | 🟢 9.0 | OneNote |
| 7 | MSI LOB app deployed via Intune fails to download; no MSI file in C:\Windows\System32\config\syst... | BITS job fails to download the MSI package. Common causes: network/proxy bloc... | 1) Check registry EnterpriseDesktopManagement for Status (30=DownloadFailed); 2) Run Bitsadmin /l... | 🟢 9.0 | OneNote |
| 8 | MSI LOB app downloaded but fails silent installation; no install log at expected path | MSI package fails to install silently via Intune MDM enforcement. Silent inst... | 1) Check logs: device-targeted at %windir%\temp\{MSIProductID}.msi.log; 2) Enable verbose MSI log... | 🟢 9.0 | OneNote |
| 9 | iOS enrollment fails with Company Portal Temporarily Unavailable error message. | The Company Portal app on the device is out of date or corrupted. | 1. Remove the Company Portal app from the device. 2. Validate user credentials (Azure AD/Entra ID... | 🟢 9.0 | OneNote |
| 10 | macOS LOB app (.pkg) with multiple sub-components installs successfully but Company Portal shows ... | The .pkg file contains multiple component installers (e.g., Wireshark has 3 s... | 1. Extract the pkg to inspect: xar -x -f <pkg> -C <output>. 2. Check install-location for each co... | 🟢 9.0 | OneNote |
| 11 | macOS FileVault is enabled by the user before Intune enrollment or before FileVault policy is dep... | FileVault was already enabled by the end user (not via MDM payload). Intune c... | 1. Deploy a FileVault policy to the device from Intune (it will not decrypt/re-encrypt, just enab... | 🟢 9.0 | OneNote |
| 12 | iOS/macOS device hardware page in Intune portal shows unknown for some fields and inconsistent va... | Platform bug (ICM 430321468): When scheduled inventory refresh was skipped be... | 1. Wait for platform fix (ICM 430321468). 2. When device comes online, full inventory refresh tri... | 🟢 9.0 | OneNote |
| 13 | Intune always reports Company Portal (WinCP) LOB app deployment as Failure on Windows clients. De... | Store-signed apps like Company Portal receive automatic updates from Windows ... | PG confirmed: this is expected behavior for store-signed LOB apps. 1) Accept the failure status a... | 🟢 9.0 | OneNote |
| 14 | Android 设备应用已完成安装，但 Intune Admin Center 的 App Details 页面状态未更新为已安装 | 状态更新通过 IWS（Intune Web Service）而非直接从设备读取，存在 1-2 分钟延迟；离开 App Details 页面后不再自动刷新 | 1. 等待 1-2 分钟；2. 离开 App Details 页面后重新导航回来手动刷新；3. 如长时间不更新则通过 Kusto 查询 Intune 服务端 app install 状态 | 🟢 8.5 | ADO Wiki |
| 15 | DISA Purebred v3 app 无法与旧版 Company Portal 配合完成 derived credential 导入流程 | Purebred v3 app 仅支持 Company Portal 5.2509.0 及以上版本，旧版 CP 不兼容 v3 Purebred app | 1. 将 Company Portal 更新至 5.2509.0+（兼容新旧 Purebred app）；2. 或将 Purebred app 回退到 v3 之前的版本 | 🟢 8.5 | ADO Wiki |
| 16 | 用户未收到 derived credential 安装提示，设备上无 derived credential | Derived credentials 策略未正确启用/目标化，或设备未成功注册(WPJ)，或 Company Portal 通知未刷新 | 1. 确认 derived credentials 策略已正确启用并目标化到用户；2. 确认设备已成功注册/WPJ；3. 在 Company Portal 通知页面下拉刷新；4. 确认设备上只安... | 🟢 8.5 | ADO Wiki |
| 17 | macOS Platform SSO: Platform Credential not available as passkey option in browser Sign-in Option... | Company Portal is not enabled under 'Use passwords and passkeys from' in macO... | Open System Settings > Passwords and enable 'Company Portal' under 'Use passwords and passkeys fr... | 🟢 8.5 | ADO Wiki |
| 18 | Passcode reset option not available or not working on personal Android device with work profile i... | Passcode reset is not supported on personal Android devices with a work profi... | Inform user that passcode reset is not available for personal Android devices with work profile o... | 🟢 8.5 | ADO Wiki |
| 19 | LOB app update behavior varies by platform and assignment type; iOS auto-updates silently for Ava... | Platform-specific LOB update handling: iOS auto-updates installed Available L... | Upload LOB app and replace original deployment (verify version reflects update). iOS Available: s... | 🟢 8.5 | OneNote |
| 20 | Android LOB (.apk) app download fails via Intune Company Portal on cellular network; 'download fa... | HTTP 499 means the client disconnected before the server completed the respon... | Use corporate Wi-Fi network for LOB app installation to avoid network instability. On cellular: a... | 🟢 8.0 | OneNote |
| 21 | iOS LOB app shows unexpected version after wrapping with Intune App Wrapping Tool; CFBundleVersio... | The Intune App Wrapping Tool replaces CFBundleVersion value during wrapping. ... | Use plutil on macOS: plutil -p Info.plist \| grep -i vers. CFBundleShortVersionString = display v... | 🟢 8.0 | OneNote |
| 22 | Need to check iOS App Store app version details for troubleshooting Intune app deployment. |  | Use iTunes Store API: https://uclient-api.itunes.apple.com/WebObjects/MZStorePlatform.woa/wa/look... | 🟢 8.0 | OneNote |
| 23 | Android LOB app update prompts user to install instead of auto-updating when assignment type is A... | When 'Check apps from external sources' (Verify apps over USB / Play Protect ... | For silent auto-update on Android: disable 'Check apps from external sources' setting on the devi... | 🟢 8.0 | OneNote |
| 24 | GCC-H (Fairfax) 租户客户无法从 Microsoft Store 部署或更新 Company Portal，因为 Fairfax 租户不支持新版 Microsoft Store | GCC-H Fairfax 租户中新版 Microsoft Store 不可用，无法直接通过 Store 推送 Company Portal | 1. 在商业账号（非 GCC-H UPN，否则下载会被阻止）下运行：winget download --id 9WZDNCRFJ3PZ --source msstore；2. 将下载的二进制文件... | 🔵 7.5 | ADO Wiki |
| 25 | Linux 设备注册时出现 Error 1001 / 'An unexpected error has occurred'；日志显示 ErrorCode:PasswordResetRegistr... | 租户启用了 SSPR（Self-Service Password Reset），用户首次登录时被重定向到 mysignins 页面注册必需的 MFA 方法... | 让用户先打开浏览器登录 Azure Portal（portal.azure.com）→ 自动跳转到 mysignins → 注册所需的身份验证方法 → 返回 Linux 设备重新注册 Intun... | 🔵 7.5 | ADO Wiki |
| 26 | Error 0x87D1FDE8 displayed in Intune admin console after deploying Managed Browser policy with al... | Known issue in Microsoft Intune with Managed Browser policy deployment. The e... | The error resolves automatically after the device checks in again. No action needed - safe to ign... | 🔵 7.5 | MS Learn |
| 27 | iOS VPP app install fails with message VPP user licensing not supported for userless enrollment. ... | VPP user licensing requires user affinity on the device. Devices enrolled via... | Change VPP app assignment to device-based licensing. If app is targeted to device groups, ensure ... | 🔵 7.5 | OneNote |
| 28 | After deploying a WebClip application to an iOS or Android device as Required, if you delete the ... | This can occur if the web clip has been deployed as a Required app and the us... | Remove the deployment prior to migrating the user, then redeploy after migration. Or change to Av... | 🔵 7.0 | ContentIdea KB |
| 29 | Customer has an exemption on how many devices per user that can be enrolled into Intune. Customer... | The setting for "Maximum number of devices per user" in Azure IS NOT set to "... | Log into Azure console, under Users and groups -> Device Settings; change the value for "Maximum ... | 🔵 7.0 | ContentIdea KB |
| 30 | Company Portal in infinite loop. Device looping back to login page. Company Portal logs show The ... | Check to see if Company Portal log shows this message The signed in user is n... | Navigate to Azure portal and set user assignment required to NO. If the option is not available t... | 🔵 7.0 | ContentIdea KB |
| 31 | Customer states that Intune Enrollment is not workingCustomer states when they attempt to enroll ... | Tenant Endpoint defectDiagnostic Description: The test determines if the acco... | Resolved the defect on the back end of the tenant via Ops procedureCustomer verified they were ab... | 🔵 7.0 | ContentIdea KB |
| 32 | This document describes how to use Fiddler to capture a network trace, including instructions tha... |  | Fiddler is a free 3rd party tool that customers can download and use if they agree to do so. Fidd... | 🔵 7.0 | ContentIdea KB |
| 33 | Users are unable to launch the &quot;All apps&quot; link in the Company Portal in order to self-s... | A configuration policy is configured to either disable or hide Safari on iOS ... | Need to ensure that Safari is not being disabled or blocked in the General Configuration Policy (... | 🔵 7.0 | ContentIdea KB |
| 34 | Whether a device is a desktop, laptop or tablet is not the primary deciding factor regarding whet... |  | To manage Windows PCs, you have two choices:+ Enroll the device orInstall the Intune software cli... | 🔵 7.0 | ContentIdea KB |
| 35 | For users who had enrolled or re-enrolled their devices into Intune recently, only the Company Po... | �Discovered Apps� reporting will only reflect apps that were captured during ... | The apps that were installed but missing were simply not captured when the initial App Inventory ... | 🔵 7.0 | ContentIdea KB |
| 36 | When scanning for updates with the Intune Agent, you receive error 0x8024001e, and you no longer ... | To verify the Kaspersky agent is the cause of the issue, attempt to delete th... | Customer should contact Kaspersky for guidance on adding the Intune Agent/Windows Update registry... | 🔵 7.0 | ContentIdea KB |
| 37 | Customer has a hybrid Intune environment and has configured a policy to deploy a line-of-business... | The LOB app has expired | The expiration date must be extended per Apple�s instructions. Apple App Developer guide for the ... | 🔵 7.0 | ContentIdea KB |
| 38 | When opening the Intune Web Company Portal, the end user is not seeing any apps that were deploye... | IW Portal team made a behavior change to support mobile app install without e... | Open portal.manage.microsoft.com, sign in, click menu > My Devices, click on a listed device to s... | 🔵 7.0 | ContentIdea KB |
| 39 | After deploying a LOB application to MacOS or iOS, clients receive error: "Unable to Download App... | Invalid URLs in the .plist file for the app. | Remove the invalid URLs or change them to valid URL addresses in the .plist file. | 🔵 7.0 | ContentIdea KB |
| 40 | After deploying a LOB application to MacOS or iOS, error: "Unable to Download App" or "app packag... | The iOS Distribution Certificate for the app has expired. | Obtain a new iOS Distribution Certificate from Apple, distribute a new version of the app signed ... | 🔵 7.0 | ContentIdea KB |
| 41 | A user attempts to enroll an iOS based device via the Company Portal application and after select... | The Safari browser is configured to "Block All Cookies". | After configuring the Safari browser to allow Cookies, as below, attempt to enroll again. -Go to ... | 🔵 7.0 | ContentIdea KB |
| 42 | After assigning an app to a group of Windows 10 clients as a Required app, the app will initially... | This is by design for Windows. Currently only iOS will automatically attempt ... | As a work around, create a second group that contains the same Windows 10 users, then create a ne... | 🔵 7.0 | ContentIdea KB |
| 43 | When a customer deploys a mobile application as "Available" to a Device Group, the application do... | Unsupported | Available Install is not supported for mobile applications to a device group.This includes: Windo... | 🔵 7.0 | ContentIdea KB |
| 44 | Attempting to enroll an iOS device using the Company Portal app fails with the following error: C... | This can occur if the Azure Active Directory Enterprise Applications Microsof... | To resolve this problem complete the following: 1. Open a browser and navigate to the Azure Activ... | 🔵 7.0 | ContentIdea KB |
| 45 | After configuring DEP enrollment in Intune and deploying new DEP devices to users. the devices ne... | This can occur if both of the following conditions exist:1. The user has not ... | To resolve this problem, either configure Authenticate with Company Portal instead of Apple Setup... | 🔵 7.0 | ContentIdea KB |
| 46 | When using an AD mobile account on a Mac the Company portal app fails to launch through the Self-... | By design. The Company portal app does not support AD mobile accounts.&nbsp; | Users must enroll into Jamf using a Local account on the Mac.&nbsp; | 🔵 7.0 | ContentIdea KB |
| 47 | During IOS enrollment using the Company Portal app, when it redirects to the Safari browser to in... | This can occur if JavaScript is turned off in Safari on the iOS device.This c... | To resolve this problem, turn on JavaScript for the Safari browser on the iOS device. This is fou... | 🔵 7.0 | ContentIdea KB |
| 48 | When attempting to add a Windows 10 Line Of Business (LOB) app, you receive the error: File exten... | This can occur if the downloaded app package file does not have a valid exten... | Give the download app package file a file extension of APPX, or whatever file extension is approp... | 🔵 7.0 | ContentIdea KB |
| 49 | Customer is prompted with a keychain signing message for TEAMS, Outlook (O365 apps) after enrolli... | The workplace join key is put down by AAD teams code which the Intune company... | This is expected since an App is trying to access a keychain item and the user is being prompted ... | 🔵 7.0 | ContentIdea KB |
| 50 | Customer is prompted with a keychain signing message for TEAMS, Outlook (O365 apps) after enrolli... | The workplace join key is put down by AAD teams code which the Intune company... | This is expected since an App is trying to access a keychain item and the user is being prompted ... | 🔵 7.0 | ContentIdea KB |
| 51 | Customer enrolls macOS devices into Jamf and registers with Intune for Partner Device Management ... | From CP app logs: Line 7783: 2018-07-25 21:41:25.116 INFO com.microsoft.ssp.a... | Company Portal (CP) should not be launched directly in JAMF cases, only JAMF should be launching ... | 🔵 7.0 | ContentIdea KB |
| 52 | When attempting to deploy a Line of Business (LOB) app to Android devices, the deployment fails t... | This can occur if the app is being assigned as a Required app to a user group... | To resolve this issue, assign the app as a Required app to a device group instead of a user group... | 🔵 7.0 | ContentIdea KB |
| 53 | Attempting to enroll an iOS device using the Company Portal app fails with one of the the followi... | This can occur if the Company Portal app is out of date or corrupted. | To resolve this issue complete the following:1. Remove (uninstall) the Company Portal app from th... | 🔵 7.0 | ContentIdea KB |
| 54 | When turning on a device managed under Apple's Device Enrollment Program (DEP), Apple Business Ma... | This can occur if Authenticate with Company Portal instead of Apple Setup Ass... | To resolve this issue, set Authenticate with Company Portal instead of Apple Setup Assistant to Y... | 🔵 7.0 | ContentIdea KB |
| 55 | After enrolling an Android Enterprise device (aka Android for Work or AfW), users see 2 versions ... | This is a known problem with the current version of the Company Portal app pr... | Resolved with December 2018 release of Intune Company Portal | 🔵 7.0 | ContentIdea KB |
| 56 | Scenario 1 - Base app does not install MacOS line of business (LOB) apps created with the Intune ... | Scenario 1 - Base app does not installAs per Apple documentation https://deve... | Scenario 1 - Base app does not install First of all, remove any Required deployments of the affec... | 🔵 7.0 | ContentIdea KB |
| 57 | Question whether SCCM can still deploy applications to co-managed devices after switching Client ... | Switching Client Apps workload to Intune enables Intune app deployment but do... | After switching Client Apps workload to Intune: 1) Intune-deployed available apps appear in Compa... | 🔵 7.0 | OneNote |

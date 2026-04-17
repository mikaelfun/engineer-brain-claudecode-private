# Intune iOS 应用部署与 VPP — 综合排查指南

**条目数**: 21 | **草稿融合数**: 31 | **Kusto 查询融合**: 3
**来源草稿**: ado-wiki-Apple-DDM-Apps.md, ado-wiki-iOS-Device-Config.md, ado-wiki-iOS-iPadOS-App-Deployment.md, onenote-apple-mdm-protocol-apns.md, onenote-apple-mdm-protocol.md, onenote-building-ios-app-intune-sdk.md, onenote-collecting-vpp-licenses.md, onenote-intune-ios-vpp-app-deployment.md, onenote-ios-ade-console-log-analysis.md, onenote-ios-app-bundle-id-reference.md
**Kusto 引用**: app-install.md, apple-device.md, vpp-token.md
**生成日期**: 2026-04-07

---

## ⚠️ 已知矛盾 (3 条)

- **solution_conflict** (high): intune-ado-wiki-030 vs intune-contentidea-kb-104 — context_dependent: 不同来源给出不同方案，可能适用不同场景
- **rootCause_conflict** (medium): intune-ado-wiki-030 vs intune-contentidea-kb-169 — context_dependent: 不同来源给出不同方案，可能适用不同场景
- **rootCause_conflict** (medium): intune-contentidea-kb-225 vs intune-onenote-214 — version_superseded: Entry intune-onenote-214 contains deprecated/EOL language

## 排查流程

### Phase 1: Apple Ddm Apps
> 来源: ADO Wiki — [ado-wiki-Apple-DDM-Apps.md](../drafts/ado-wiki-Apple-DDM-Apps.md)

**App Declarative Device Management (DDM)**
**About DDM**
- More resilient behavior when devices are intermittently offline
- Fewer "install command > wait > query status" loops
- Richer, real-time app status reports
- No "Not Now" state — DDM eliminates the repeated deferrals seen in MDM

**How DDM Works**

**MDM vs DDM**
- **MDM**: Imperative + reactive. Server sends action commands, device executes and reports. Multiple commands sent for each required app.
- **DDM**: State-based. Server sends a single DDM policy document (manifest). Device handles installations and status reporting. Proactive reporting — device reports every application state change independently.

**DDM Check-In Request Types**

**Requirements and Limitations**
- **Supported Platforms**: iOS/iPadOS 17.4+
- **Supported Assignment Types**: Required and Uninstall only (Available planned for future)
- **Application types**: LOB (Line of Business)
- **Not Supported**:
  - Apps with Intune App SDK (MAM-enabled apps)
  - App configuration policies
  - Available App assignment type
  - Legacy app config settings

**DDM App Settings**

**Troubleshooting DDM Apps**
1. **Tokens Requests** — Verify declaration tokens are being requested and received.
2. **Configuration Requests** — Confirm the device is requesting updated policies.
3. **DeclarationItemsRequest** — Verify device is receiving targeted declarations.
4. **Status Report Requests** — Check for installation issues or error reports. Look for `"Valid":"Invalid"` entries with `Reasons` and error codes.

**Common Error: Error.ConfigurationCannotBeApplied**

**Kusto Queries**
```kql
```

**Scoping Questions**
1. Is the device running iOS/iPadOS 17.4 or later?
2. Is the app a LOB or VPP app type?
... (详见原始草稿)

### Phase 2: Ios Device Config
> 来源: ADO Wiki — [ado-wiki-iOS-Device-Config.md](../drafts/ado-wiki-iOS-Device-Config.md)

**Support boundaries**
**Scoping questions**
- Are all the individual settings erroring out or just a few? Collect Screenshots.
- What error, if any is displayed on Microsoft Endpoint Manager Admin center?
- If only a few, specify how many?
- This will indicate if the issue could be a configuration issue on the policy, or a device specific issue)
- Since Custom profiles are literally Apple Configurator profiles, if the issue persists even without Intune, then customer needs to contact Apple to validate the configuration XML file.
- You can use Assist365, Kusto or the Browser URL from MEM Admin center (while looking at the policy) to gather this information.
- If not sure, use Azure Support Center to look up the Group ID or Display Name. Then validate the type and also that the user or device are members of it.
- Are there any "Exclude" assignments, if so, validate the same affected user/device is not a member of the excluded group.
- If a macOS device is available collect Console logs by following [Intune: How to collect Console Logs using a MacOS Device (Applies to iOS, iPadOS and macOS](https://internal.evergreen.microsoft.com/en-us/topic/da09cdb3-de81-ef4a-80da-f61f0f0a39b1)
- If no macOS device is available, this Microsoft Internal tool [IOS Console Support Tool for PC](https://eng.ms/docs/microsoft-security/management/intune/microsoft-intune/intune/archive/intunewiki/docs/iosconsolesupporttoolforpc) can be used instead.

**Troubleshooting**
1. Before you can start troubleshooting you will need at least the following information. If you don't have it, please review [Scoping questions](#Scoping-questions). before continuing.
2. Validate whether the affected device is Supervised or not. As there are some iOS/iPadOS device restrictions that are only supported (will only apply and work) on supervised devices.
   - This Kusto will show you not only the supervision state, but the actual enrollment type, OS Version and other information typically show in hardware inventory. (**Works on GCCH**)  
        ```
        ```
   - Using Intune admin center > Sample device > Hardware > Supervised
   - From the device itself, you can open the Settings app and a supervised device will show **"This iPhone/iPad/iPod is supervised by <Company Name>"**		 	
3. Use the IntuneDeviceID in this Kusto to validate Intune is sending the policy to the device and its report status.
     - **"ReportComplianceState"** should match MEM admin Center, otherwise you might be facing a reporting issue.
     - **Compliant**: the policy and ALL its individual settings successfully applied to that device
     - **Error**: The policy or at least one of its individual settings did not apply to the device, and further investigation is needed.
     - Feel free to comment out or modify this Kusto depending on what Device configuration type you are troubleshooting.
... (详见原始草稿)

### Phase 3: Ios Ipados App Deployment
> 来源: ADO Wiki — [ado-wiki-iOS-iPadOS-App-Deployment.md](../drafts/ado-wiki-iOS-iPadOS-App-Deployment.md)

**About iOS/iPadOS App deployment**
- App Store apps
- Apple volume Purchase Program (VPP) apps
- Line of business (LOB) apps
- Web clip (Newest)
- Web link (legacy)
- Built-in app (Microsoft 365 apps)

**How it works**

**iOS/iPadOS Store apps**

**Apple Volume Purchase Program (VPP) apps**

**Automatic app update**

**Line of Business (LOB) apps**
- Maximum size limit: 2 GB per app
- Bundle identifiers must be unique

**Built-in app (Microsoft 365 apps)**

**Web clip (Newest)**

**Web link (legacy)**

**Scoping Questions**
- Device type (brand, model)?
- OS Version (iOS 15, 16, 17...)?
- App type (LOB/IPA, Store, Built-In, VPP, Books)?
- Assignment method (user, group, device)?
- If VPP: Device License or User License?
- Device enrolled or not enrolled?
- Assigned as Available or Required?
- Include/exclude groups?
- New deployment or update?
- Error messages on device or Intune console?
- When did issue start? Changes in environment?
- Reproducible?
... (详见原始草稿)

### Phase 4: Apple Mdm Protocol Apns
> 来源: OneNote — [onenote-apple-mdm-protocol-apns.md](../drafts/onenote-apple-mdm-protocol-apns.md)

**Apple MDM Protocol & APNs Reference**
**APNs Network Requirements**
- Apple network range: **17.0.0.0/8** — must be allowed directly or via proxy
- iOS 13.4+, iPadOS 13.4+, macOS 10.15.4+, tvOS 13.4+: APNs supports web proxy via PAC file

**Certificate Management**
- APNs certificate created at [Apple Push Certificates Portal](https://identity.apple.com/pushcert/)
- Must renew **annually** — track the Managed Apple ID used for creation
- SSL certificate for secure MDM ↔ device communication
- Signing certificate for configuration profiles

**Key References**
- [MDM Protocol Reference (PDF)](https://developer.apple.com/business/documentation/MDM-Protocol-Reference.pdf)
- [Device Management API](https://developer.apple.com/documentation/devicemanagement)
- [APNs Deployment Guide](https://support.apple.com/en-sg/guide/deployment/dep2de55389a/web)

### Phase 5: Apple Mdm Protocol
> 来源: OneNote — [onenote-apple-mdm-protocol.md](../drafts/onenote-apple-mdm-protocol.md)

**Apple MDM Protocol Reference**
**Overview**
**Key Resources**
- [MDM | Apple Developer Documentation](https://developer.apple.com/documentation/devicemanagement/mdm)
- [MDM Protocol Reference PDF](https://developer.apple.com/business/documentation/MDM-Protocol-Reference.pdf)
- [Device Management Documentation](https://developer.apple.com/documentation/devicemanagement)

**APNs Communication**

**Required Network Ports**

**Network Requirements**
- Allow traffic from devices to Apple network: **17.0.0.0/8**
- iOS 13.4+, iPadOS 13.4+, macOS 10.15.4+, tvOS 13.4+: APNs can use web proxy via PAC file
- Firewall must allow all network traffic from Apple devices to Apple network

**Certificate Management**
- APNs certificates required for MDM ↔ device communication
- SSL certificate for secure communication
- Certificate to sign configuration profiles
- **Certificates must be renewed annually**
- Note the Managed Apple ID / Apple ID used to create certificates (needed for renewal)
- [Apple Push Certificates Portal](https://identity.apple.com/pushcert/)

**Security**
- Multiple security layers at endpoints and servers
- Traffic inspection/reroute attempts → connection marked as compromised
- No confidential information transmitted through APNs

**Source**
- OneNote: MCVKB/Intune/iOS/Apple MDM Protocol.md

### Phase 6: Building Ios App Intune Sdk
> 来源: OneNote — [onenote-building-ios-app-intune-sdk.md](../drafts/onenote-building-ios-app-intune-sdk.md)

**Building a Sample iOS Application with Intune SDK (XCode)**
**Overview**
**Steps**
**1. Create XCode Project**
- New XCode project → Single-View → Objective-C
- Add UI elements (buttons/labels) in Main.storyboard
- Connect buttons/labels to `ViewController.h`
- Create event handlers in `ViewController.m`

**2. Add Intune iOS SDK**
- Download latest SDK: https://github.com/msintuneappsdk/ms-intune-app-sdk-ios
- Follow Steps 1-6 from [official guide](https://docs.microsoft.com/en-us/intune/developer/app-sdk-ios#build-the-sdk-into-your-mobile-app)

**3. Run IntuneMAMConfigurator**
- **Common issue**: File lacks execute permissions
  - Fix: `sudo chmod 777 IntuneMAMConfigurator`
  - macOS may block: Go to **System Preferences > Security & Privacy > General** → Allow
- Run IntuneMAMConfigurator specifying the `info.plist` and entitlement file

**4. Add ADAL/MSAL via CocoaPods**
```bash

**Edit Podfile to add ADAL**
```
- Close XCode, reopen the `.xcworkspace` file (not `.xcodeproj`)

**5. Register App in Azure Portal**
- Register application
- Add redirect URL
- Add **Microsoft Mobile Application Management** API permission

**6. Configure IntuneMAMSettings**
- Add `IntuneMAMSettings` dictionary to app's Info.plist:
  - `ADALClientId` — App registration client ID
  - `ADALRedirectUri` — Redirect URI from app registration

**Useful Links**
- [Configure ADAL/MSAL for Intune SDK](https://docs.microsoft.com/en-us/intune/developer/app-sdk-ios#configure-adalmsal)
- [Azure AD Library for Obj-C](https://github.com/AzureAD/azure-activedirectory-library-for-objc)
- [CocoaPods](https://cocoapods.org/)
... (详见原始草稿)

### Phase 7: Collecting Vpp Licenses
> 来源: OneNote — [onenote-collecting-vpp-licenses.md](../drafts/onenote-collecting-vpp-licenses.md)

**Collecting VPP Licenses via PowerShell**
**Purpose**
**Prerequisites**
- PowerShell 6.2.3+ (not Windows PowerShell 5.x)
- VPP token file from customer
- Script: `vppGetLicenses.ps1` (available from internal scratch share)

**Steps**
1. Download and install [PowerShell 6 (x86)](https://github.com/PowerShell/PowerShell/releases/download/v6.2.3/PowerShell-6.2.3-win-x86.msi)
2. Share `VppGetLicenses.ps1.txt` to customer; instruct to save as `.ps1`
3. Start command prompt, run:
   ```
   ```
4. Verify version: `$PSVersionTable.PSVersion` → should be 6.2.3+
5. May need: `Set-ExecutionPolicy Unrestricted`

**Reference**
- [VPP App License TSG (IntuneWiki)](https://intunewiki.com/wiki/Vpp_App_License_TSG)

### Phase 8: Intune Ios Vpp App Deployment
> 来源: OneNote — [onenote-intune-ios-vpp-app-deployment.md](../drafts/onenote-intune-ios-vpp-app-deployment.md)

**iOS VPP App Deployment via Intune**
**Overview**
**Prerequisites**
- Apple Business Manager account
- VPP token from Apple

**Steps**
1. **Download VPP Token from Apple**
   - Go to https://business.apple.com/#/main/preferences/myprofile
   - Download the VPP token file
2. **Upload VPP Token to Intune Portal**
   - Navigate to Intune > Tenant administration > Connectors and tokens > Apple VPP tokens
   - Upload the downloaded token
3. **Add VPP App in Apple Business Manager**
   - Return to Apple Business Manager website
   - Purchase/assign the app to the specified location associated with your VPP token
4. **Sync VPP Token in Intune**
   - In Intune portal, navigate to the VPP token
   - Click "Sync" to pull the latest app assignments from Apple
5. **Verify App Appears in App List**
   - After sync, the VPP app should appear in Intune > Apps > All apps
   - Assign the app to target user/device groups

**Notes**
- VPP token sync may take a few minutes
- Apps must be purchased/assigned in Apple Business Manager before they appear in Intune
- For Mooncake (21Vianet), ensure the VPP token is compatible with the China region
... (详见原始草稿)

### Phase 9: Ios Ade Console Log Analysis
> 来源: OneNote — [onenote-ios-ade-console-log-analysis.md](../drafts/onenote-ios-ade-console-log-analysis.md)

**iOS ADE Enrollment Console Log Analysis**
**How to Collect Mac Console Logs**
1. Open **Console** app on Mac (Launchpad > Console)
2. Enable debug logging: **Action** menu > enable both:
   - "Include Info Messages"
   - "Include Debug Messages"
3. Connect iOS/iPadOS device via USB cable
4. If device has passcode, tap "Trust this Device" on the device
5. Reproduce the enrollment issue

**Key Log Entries During ADE Enrollment**

**1. Apps & Data Screen**
```
```

**2. Remote Management Screen**
```
```

**3. SCEP Certificate Request (after authentication)**
```
```

**4. MDM Authentication Complete**
```
```

**5. MDM Profile Installation**
```
```

**6. Intune Device ID Visible**
```
```

**7. Valid MDM Installation Confirmed**
```
```

**8. Device Information Collection**
```
```

**9. Home Screen Reached**

**Reference**
- Detailed steps: https://internal.evergreen.microsoft.com/en-us/topic/da09cdb3-de81-ef4a-80da-f61f0f0a39b1

### Phase 10: Ios App Bundle Id Reference
> 来源: OneNote — [onenote-ios-app-bundle-id-reference.md](../drafts/onenote-ios-app-bundle-id-reference.md)

**iOS App Bundle ID Reference**
**Common Apple Bundle IDs**
**Microsoft Apps**
**How to Find Any App's Bundle ID**
1. Go to the App Store page for the app
2. Copy the ID number from the URL (e.g., `586447913` from `https://itunes.apple.com/us/app/microsoft-word/id586447913`)
3. Browse to `https://itunes.apple.com/lookup?id=586447913`
4. Download and open the resulting `1.txt` file
5. Search for `bundleId` in the file

**Company Portal Redirect URI Format**

**References**
- Apple MDM Bundle ID list: https://support.apple.com/en-sg/guide/mdm/mdm90f60c1ce/web
- Third-party lookup: https://offcornerdev.com/bundleid.html

### Phase 11: Ios App Crash Log
> 来源: OneNote — [onenote-ios-app-crash-log.md](../drafts/onenote-ios-app-crash-log.md)

**iOS App Crash Log Collection**
**Location**
```
```
**Steps**
1. Settings > Privacy > Analytics > Analytics Data
2. Search for the app name (e.g., "excel", "Outlook", "Company Portal")
3. Select the crash entry (check timestamp)
4. Copy the **entire** text content
5. Send the full crash log

**Alternative: Xcode**

**Notes**
- UI path may vary by iOS version (screenshots based on iOS 10.3.1)

**Source**
- OneNote: IOS logs/iOS App Crash Log

### Phase 12: Ios App Deploy Response Codes
> 来源: OneNote — [onenote-ios-app-deploy-response-codes.md](../drafts/onenote-ios-app-deploy-response-codes.md)

**iOS App Deploy Response Codes Reference**
**Overview**
**Common Response Codes (5000-5199)**
**App Install Response Codes (5200-5299)**
**Usage**
- Match HRESULT value from Intune logs/Graph API to identify specific failure reason
- Common in VPP app deployment and managed app lifecycle scenarios

**Source**
- OneNote: MCVKB/Intune/iOS/App Deploy - iOS Response Code.md

### Phase 13: Kusto 诊断查询

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

#### apple-device.md
`[工具: Kusto skill — apple-device.md]`

```kql
let _deviceId = '{deviceId}';

IntuneEvent
| where env_time > ago(6h)
| where env_cloud_name == "CNPASU01"
| where DeviceId == _deviceId
| where EventUniqueName in ("ExternalAppleHttpCallRequestBody", "ExternalAppleHttpCallResponseBody")
| extend _body = iff(EventUniqueName == "ExternalAppleHttpCallRequestBody", Col5, Col4)
| extend _url = iff(EventUniqueName == "ExternalAppleHttpCallRequestBody", Col4, Col3)
| extend _durationMs = iff(EventUniqueName == "ExternalAppleHttpCallRequestBody", parse_json(Col6).durationMs, "(response has no duration)")
| extend _json = parse_json(_body)
| project env_time, cV, _url, _durationMs, _json, DeviceId
| order by env_time asc
```

```kql
IOSEnrollmentService 
| where env_time > ago(30d)
| where ActivityId == '{deviceId}'
| project env_time, userId, callerMethod, message, deviceTypeAsString, 
    serialNumber, siteCode, ActivityId, relatedActivityId2
```

```kql
let accountId = '{accountId}';

DeviceLifecycle
| where env_time > ago(90d)
| where accountId == accountId
| where platform in ("7", "8", "10")  // iPhone, iPad, macOS
| where deviceId != ""
| summarize 
    LastSeen=max(env_time),
    FirstSeen=min(env_time)
  by deviceId, platform
| extend PlatformName = case(
    platform=="7", "iPhone",
    platform=="8", "iPad",
    platform=="10", "macOS",
    platform)
| order by LastSeen desc
| limit 1000
```

#### vpp-token.md
`[工具: Kusto skill — vpp-token.md]`

```kql
VppFeatureTelemetry
| where accountId == '{accountId}'
| where env_time >= ago(7d)
| where TaskName == "VppApplicationSyncEvent"
| project env_time, env_cloud_name, TaskName, ActivityId, accountId, tokenId, 
    applications, userId, ex, clientContextIntune, clientContextExternalVppService, 
    I_Srv, tokenState
| order by env_time desc
```

```kql
VppFeatureTelemetry
| where accountId == '{accountId}'
| where env_time >= ago(7d)
| where isnotempty(ex)
| project env_time, tokenId, tokenState, ex, TaskName
| order by env_time desc
```


---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Apple VPP token sync completes but purchased apps not showing in Intune; VppApplicationSyncEvent ... | Apple's Volume Purchase Program sync response does not return the purchased a... | Check VppApplicationSyncEvent in Kusto: VppFeatureTelemetry \| where TaskName == 'VppApplicationS... | 🟢 9.0 | OneNote |
| 2 | VPP app install fails on iOS device. Logs show is not ready for install since user yet to accept ... | The user has not accepted the Apple Volume Purchase Program (VPP) invitation.... | Ensure user accepts the VPP invitation. If user did not receive the invite, check that App Store ... | 🟢 9.0 | OneNote |
| 3 | VPP app license assignment fails with error code 9632: Too many recent calls to manage licenses w... | Too many devices for a single user or too many Apple IDs making requests from... | Switch from user-based VPP licensing to device-based licensing. Device licensing associates each ... | 🟢 9.0 | OneNote |
| 4 | VPP app install fails with LicenseNotFound. Apple rejects install request even though Intune show... | User updated their Apple ID on one or more devices during the lifecycle of In... | Options: (1) Log back in with the original Apple ID used when first accepting Apple VPP agreement... | 🟢 9.0 | OneNote |
| 5 | VPP app install fails with VppDeviceLicenseAssignmentFailedEvent. User gets message Your organiza... | All available VPP user licenses for the app have been claimed. iOS VPP user l... | Options: (1) Switch to device-based VPP licensing, (2) Temporarily revoke app deployment for some... | 🟢 9.0 | OneNote |
| 6 | VPP apps not auto-updating on iOS devices despite tenant having auto-update enabled in Intune. | VPP auto-update is not supported for devices running iOS versions below 11.3.... | Upgrade devices to iOS 11.3 or later to enable VPP auto-update functionality. | 🟢 9.0 | OneNote |
| 7 | VPP app keeps re-installing or prompting for update on iOS/macOS. App version shows mismatch betw... | Could be: (1) Intune service packages incorrect app version - check CreateInt... | TSG steps: (1) Check app version via Apple lookup API, (2) Query IntuneEvent for CreateIntuneAppM... | 🟢 9.0 | OneNote |
| 8 | VPP license cannot be revoked from retired/removed iOS devices via Intune portal. Licenses remain... | Intune cannot revoke VPP licenses from devices that are no longer managed. Ap... | Use REST client (Postman/Insomnia) to call Apple VPP API: 1. Get VPP token from .vpptoken file. 2... | 🟢 9.0 | OneNote |
| 9 | VPP token 在 Intune Admin Center 显示 Duplicate 状态，多个 token 关联到同一 ABM location | 管理员在 Intune 中创建了新的 VPP token 而非续签已有 token，导致两个 token 指向同一 ABM location（Duplic... | 1. 在 Intune Admin Center 中删除重复的 VPP token（保留较早创建的那个）；2. 将应用分配重新关联到保留的 token；3. 后续始终使用 Renew 而非 Cr... | 🟢 8.5 | ADO Wiki |
| 10 | 无法删除或撤销 VPP 应用许可证，报错 'The app failed to delete. Ensure that the app is not associated with any VP... | VPP 应用仍有 license 关联在 ABM location token 上，必须先 revoke 所有 license 才能删除应用 | 1. 在 Intune 中 Revoke 该应用的所有 license（Apps → iOS → select VPP app → App licenses → Revoke）；2. 在 ABM... | 🟢 8.5 | ADO Wiki |
| 11 | VPP token sync 失败，Kusto 显示 FailedSTokenValidation error 9625: 'The server has revoked the sToken' | VPP sToken 已被 Apple 服务器吊销（过期、ABM 侧手动操作或安全策略触发） | 1. 在 ABM/ASM 中下载新的 sToken 文件；2. 在 Intune Admin Center 中上传新 sToken 续签 token（不要创建新 token）；3. 续签后触发手... | 🟢 8.5 | ADO Wiki |
| 12 | VPP 应用报错 'Could not retrieve license for the app with iTunes Store ID'，应用无法安装 | VPP license 未正确分配到设备或用户，可能由 token sync 问题、license 不足或分配冲突导致 | 1. Sync VPP token → sync 设备；2. 如问题持续，移除 group assignment 并重新分配为 device-licensed；3. 仍不行则在 Apps → i... | 🟢 8.5 | ADO Wiki |
| 13 | iOS VPP app install fails with message Your organization has depleted its licenses for this app. ... | User licensing allows installation on 5-10 devices per user. All available VP... | Either purchase more VPP licenses, switch to device-based licensing, or temporarily revoke app de... | 🔵 7.5 | OneNote |
| 14 | Trying to update a .ipa file  in Intune Software Publisher fails.Possible error messages:&quot;Th... | The .ipa packages were not correctly, or fully, updated in development to ref... | The developer of the software will need to be engaged to correct the package.  There is no fix fr... | 🔵 7.0 | ContentIdea KB |
| 15 | *********************************** Please Read ************************************As of Septemb... | After migration to the Azure Portal customers will now need to be manually fl... | Please follow the process below to request the flighitng for these features: 1) Ensure that the S... | 🔵 7.0 | ContentIdea KB |
| 16 | Apps purchased with the Apple Volume Purchase Program are not appearing in the Intune Console. | There are two potential causes of this issue:  A user can sync apps from the ... | Cause 1 - By DesignCause 2- Not Supported at this time.  On the Intune side is that once you uplo... | 🔵 7.0 | ContentIdea KB |
| 17 | Unable to upload VPP token when the Intune subscription is moved to a new Configuration Manager s... | The MDMCertificates table does not contain any data (Certificate data was not... | Use the following steps to resolve this issue:1) Ran the following SQL query on the Configuration... | 🔵 7.0 | ContentIdea KB |
| 18 | Customer requesting deletion of VPP tokenMultiple VPP tokens in admin portal | Update 12/19/17: The option to delete VPP tokens was added to the Ibiza UI wi... | Template for Customer CommunicationMy name is <SE name> and I will be assisting you with your cas... | 🔵 7.0 | ContentIdea KB |
| 19 | When attempting to update the version of a deployed Line-of-Business app using the Azure Intune p... | Varies | To troubleshoot this issue, attempt to update the app using the classic portal (Silverlight porta... | 🔵 7.0 | ContentIdea KB |
| 20 | When attempting to update an Android or iOS app, the following error message is displayed:The sof... | This can occur if the initial APK or IPA file was uploaded without the app wr... | To resolve this problem:If the initial upload was done with the wrapper, the update must include ... | 🔵 7.0 | ContentIdea KB |
| 21 | Apple VPP token shows Assigned to external MDM or assignedToExternalMDM or ClientContextMismatchD... | The same VPP location token was uploaded in two or more device management sol... | Identify the conflicting MDM. If token needed in both MDMs: keep existing token in one MDM, delet... | 🔵 7.0 | ContentIdea KB |

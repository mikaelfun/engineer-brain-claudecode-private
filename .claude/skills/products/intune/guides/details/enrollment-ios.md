# Intune iOS/iPadOS 注册与 ADE/DEP — 综合排查指南

**条目数**: 4 | **草稿融合数**: 19 | **Kusto 查询融合**: 2
**来源草稿**: ado-wiki-Dual-Enrollment-MMPC.md, ado-wiki-b-Linux-Enrollment.md, mslearn-gp-auto-enrollment-troubleshooting.md, onenote-apple-configurator-enrollment.md, onenote-apple-configurator-iphone-enrollment.md, onenote-apple-enrollment-program-token-setup.md, onenote-comanagement-autoenroll-vs-gpo.md, onenote-comanagement-autoenrollment-process.md, onenote-company-portal-ios-enrollment-log-analysis.md, onenote-configure-gpo-auto-enroll.md
**Kusto 引用**: apple-device.md, enrollment.md
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Dual Enrollment Mmpc
> 来源: ADO Wiki — [ado-wiki-Dual-Enrollment-MMPC.md](../drafts/ado-wiki-Dual-Enrollment-MMPC.md)

**Dual Enrollment Troubleshooting (MMPC, MDE Attach, EPM)**
**Troubleshooting Steps**
1. Collect ODC logs
2. Open Event Viewer > Applications and Services Logs > Microsoft > Windows > DeviceManagement-Enterprise-Diagnostics-Provider > Admin
3. Search for "dual" or "enroll" to find errors

**Finding MMPC Device ID**
- Registry: `HKLM\Software\Microsoft\Enrollments` > DMClient key with "Microsoft Device Management" folder > EntDMID = MMPC Device ID

**Kusto Queries**

**Find MMPC DeviceID from Intune DeviceID**
```kql
```

**Check MMPC Dual Enrollment Activity**
```kql
```

**Drill Down with ActivityId**
```kql
```

### Phase 2: B Linux Enrollment
> 来源: ADO Wiki — [ado-wiki-b-Linux-Enrollment.md](../drafts/ado-wiki-b-Linux-Enrollment.md)

**Linux Enrollment in Intune**
**Architecture Overview**
**Prerequisites**
- Microsoft Edge 102.x or later
- Intune App (`intune-portal`)
- Supported Ubuntu Linux distribution (GNOME desktop required — CLI-only not supported)

**Features (GA)**
- Compliance Policies: password complexity, allowed distro version, custom compliance via script, disk encryption
- Device Inventory / Reporting
- Conditional Access via Microsoft Edge to Office 365 web apps
- Enrollment type: **Corporate only** (BYOD not supported)

**Conditions That Will NOT Work**
- Using Firefox/Chrome/Safari (must use Microsoft Edge)
- CA Policy enabled but not using Edge
- Hardware binding (TPM/HSM) — not currently supported
- WSL — not currently supported

**Installing Intune on Ubuntu**
```bash

**Install prerequisites**

**Add Microsoft package signing key**

**Install**
```

**Uninstalling / Resetting**
```bash
```
```bash
```

**Scoping Questions**
- Linux OS version?
- Intune-portal version? Supported?
- Identity broker version?
- Are broker services running?
- Intune device ID? Entra device ID? (check `~/.config/intune/registration.xml`)
- Compliance policy ID?
- Which browser? Which service?
- Compliant state in Intune app vs. portal vs. Entra ID?
- Sign-in error code?
... (详见原始草稿)

### Phase 3: Gp Auto Enrollment Troubleshooting
> 来源: MS Learn — [mslearn-gp-auto-enrollment-troubleshooting.md](../drafts/mslearn-gp-auto-enrollment-troubleshooting.md)

**Windows 10 Group Policy-based Auto-Enrollment Troubleshooting**
**Verification Checklist**
1. **Intune License**: Verify user has a valid Intune license assigned
2. **Auto-enrollment enabled**: Entra ID > Mobility (MDM and MAM) > Microsoft Intune
   - MDM user scope = All (or Some with correct groups)
   - MAM User scope = None (otherwise overrides MDM scope)
   - MDM discovery URL = `https://enrollment.manage.microsoft.com/enrollmentserver/discovery.svc`
3. **Windows version**: 1709 or later
4. **Hybrid Entra joined**: Run `dsregcmd /status` and verify:
   - AzureAdJoined: YES
   - DomainJoined: YES
   - AzureAdPrt: YES
5. **MDM provider**: If both "Microsoft Intune" and "Microsoft Intune Enrollment" appear under Mobility, configure auto-enrollment under "Microsoft Intune"

**MDM Log Analysis**

**Task Scheduler Diagnostics**

**Task Not Starting**
- **Already enrolled in another MDM**: Event 7016 with error 2149056522 → unenroll from other MDM first
- **Group Policy issue**: Run `gpupdate /force` and troubleshoot AD

### Phase 4: Apple Configurator Enrollment
> 来源: OneNote — [onenote-apple-configurator-enrollment.md](../drafts/onenote-apple-configurator-enrollment.md)

**Apple Configurator Enrollment via macOS**
**Prerequisites**
- macOS device with Apple Configurator 2 installed
- Intune portal access with Apple Configurator enrollment profile configured
- USB cable connecting iOS device to Mac

**Enrollment Steps**
1. **Add device in Intune**: Add device serial/info to Intune Apple Configurator device list, assign enrollment profile
2. **Connect iOS device** to Mac, open Apple Configurator 2
3. **Configure Server**:
   - Go to Apple Configurator > Preferences > Server
   - Copy profile URL from Intune Portal
   - Convert to DEP URL format (usually auto-converts, but may need manual conversion)
   - Create Server entry in AC preferences
4. **Create Blueprints**: Configure device Blueprints in Apple Configurator
5. **Prepare Device**:
   - Select device > Prepare
   - Apply the Blueprints
   - AC will erase the device

**Common Issues**
- **DEP URL auto-conversion fails**: Manually convert the Intune enrollment URL to DEP format
- **TCP connection timeout**: Verify network connectivity between iOS device (via Mac) and MDM server
- Device must be erased during Prepare step - warn customer about data loss

### Phase 5: Apple Configurator Iphone Enrollment
> 来源: OneNote — [onenote-apple-configurator-iphone-enrollment.md](../drafts/onenote-apple-configurator-iphone-enrollment.md)

**Apple Configurator Enrollment via iPhone**
**Prerequisites**
- Apple Configurator app installed on an iPhone (NOT the device being enrolled)
- Access to Apple Business Manager (ABM)
- Intune admin portal access with enrollment profile configured

**Pre-enrollment: Device Preparation**
1. **Erase locally** (NOT via Intune wipe): iOS Settings > General > Transfer or Reset > Erase All Content and Settings
   - This removes Find My / activation lock
   - Intune remote wipe does NOT remove activation lock, which will cause AC enrollment to fail
2. Delete the device from Intune portal

**Steps: Add Device to ABM via Apple Configurator**
1. Launch Apple Configurator on your iPhone
2. Start up the target iPhone/iPad
3. Continue through Setup Assistant, **stop at "Choose a Country or Region" pane**
   - Note: Must restart if you go past the Wi-Fi Network pane
4. Bring iPhone with Apple Configurator close to the target device:
   - Scan the pairing image in Setup Assistant, OR
   - Tap "Pair Manually" and enter the 6-digit code
5. Device serial number is uploaded to ABM

**Steps: Intune + ABM Preparation**
1. In Intune Portal: Add an enrollment profile for the device
2. In ABM: Confirm device is assigned to the correct MDM server
   - Can set auto-assign for new devices
   - If not auto-assigned, manually assign via ABM
3. In Intune: Sync to discover the newly added device
... (详见原始草稿)

### Phase 6: Apple Enrollment Program Token Setup
> 来源: OneNote — [onenote-apple-enrollment-program-token-setup.md](../drafts/onenote-apple-enrollment-program-token-setup.md)

**Setup Apple Enrollment Program Token (ADE/DEP)**
**Overview**
**Steps**
1. **Download MDM token** from Intune portal (Devices > iOS/iPadOS > Enrollment)
2. Go to [Apple Business Manager](https://business.apple.com/)
3. Sign in with your organization's Apple ID
4. Upload the MDM server token
5. Download the enrollment program token from Apple

**Key Notes**
- Token expires annually and must be renewed
- Use the same Apple ID that was used to create the original token
- For Mooncake (21Vianet): Verify ADE support availability

**Source**
- OneNote: Mooncake POD Support Notebook > Intune > How To > Setup Apple Enrollment Program Token

### Phase 7: Comanagement Autoenroll Vs Gpo
> 来源: OneNote — [onenote-comanagement-autoenroll-vs-gpo.md](../drafts/onenote-comanagement-autoenroll-vs-gpo.md)

**Co-management: Auto-Enroll vs GPO for MDM Enrollment**
**Question**
**Answer**
**Behavior Comparison**
**Without GPO**
1. Co-management enabled → enrollment timer queued (randomized, can be hours away)
2. Log: `Queuing enrollment timer to fire at {future_time}`
3. Before user sign-in: `Expected MDM_ConfigSetting instance is missing`
4. After user sign-in but before timer: `timer already set for enrollment, no need to re-randomize`
5. Timer fires → retrieves AAD info → enrollment completes

**With GPO**
1. Same enrollment timer queued by ConfigMgr
2. **But** the GPO triggers MDM enrollment immediately upon being applied (via Event Viewer)
3. When ConfigMgr timer fires later: `Device is already or being enrolled into MDM`
4. `Co-mgmt workloads flag is compliant` / `Machine is already enrolled with MDM`

**Key Log Entries (CoManagementHandler.log)**
- `Queuing enrollment timer to fire at {time}` — timer scheduled
- `Enrollment randomization timer fired` — timer executed
- `Found Active User Session` — user context acquired
- `AAD-Join Info: type = 1, DeviceId, TenantId, EnrollmentUrl` — AAD info read
- `Enrollment type: 6` — co-management enrollment type
- `Intune SA Account ID retrieved` — Intune account confirmed
- `Device is provisioned` — enrollment complete
- `StateID or report hash is changed. Sending up the report for state 107` — state reported

**Conclusion**
- GPO speeds up enrollment by triggering immediately instead of waiting for queue timer
- The device shows in Intune portal as co-managed once MDM enrolled
- Both paths result in the same final state
... (详见原始草稿)

### Phase 8: Comanagement Autoenrollment Process
> 来源: OneNote — [onenote-comanagement-autoenrollment-process.md](../drafts/onenote-comanagement-autoenrollment-process.md)

**Co-management Auto-enrollment Process Flow (ConfigMgr → Intune)**
**Overview**
**Process Flow**
**Phase 1: Client Registration**
```
```
**Phase 2: Initial Policy (AutoEnroll = False)**
```
```
**Phase 3: Move to Pilot Collection (AutoEnroll = True)**
```
```
```
```
**Phase 4: Device Enrollment (Intune Side)**
1. Client requests MDM Policy
2. Certificate Enrollment request sent and processed
3. OMA-DM configured, MDM provisioned and completed
4. Session starts for AAD User (Hybrid User)

**Phase 5: Scheduled Tasks**
- **PushLaunch** — initial enrollment via `deviceenroller.exe`
- **PushRenewal** — enrollment renewal via `deviceenroller.exe`

**Key Configuration Locations**

**WMI Class: CCM_CoMgmt_Configuration**
```powershell
```
- `MDMEnrollmentUrl` — enrollment endpoint (e.g., `https://manage-beta.microsoft.com/EnrollmentServer/Discovery.svc`)
- `MDMClientAppID` — client app ID (e.g., `9ba1a5c7-f17a-4de9-a1f1-6178c8d51223`)
- `MDMServiceResourceID` — service resource
- `MDMServiceResourceUri` — STS token handler URL
- `MDMTenantID` — tenant ID
- `MDMEnrollmentRetries` — retry count (default 3)
- `MDMEnrollmentRetryInterval` — retry interval (15 min)

**Registry: Azure AD Join Info**

**dsregcmd /status**
- `AzureAdJoined: YES` required
- `MdmUrl` shows enrollment endpoint

**Troubleshooting Checkpoints**

**Related Articles**
- [ConfigMgr: CLD: Co-management: Understanding & Tracing MDM enrollment](https://internal.evergreen.microsoft.com/en-us/topic/474db03a-d77c-034f-f31c-d1965f9783e5)
- [Windows Client enrollment process](https://docs.microsoft.com/en-us/intune/enrollment/windows-enroll)

**21v Applicability**

### Phase 9: Company Portal Ios Enrollment Log Analysis
> 来源: OneNote — [onenote-company-portal-ios-enrollment-log-analysis.md](../drafts/onenote-company-portal-ios-enrollment-log-analysis.md)

**Company Portal iOS Enrollment Log Analysis (Good Sample)**
**Overview**
**Key Phases in Enrollment Flow**
**Phase 1: User Login (Company Portal Sign-In)**
```
```
- MSAL acquires token for scope `0000000a-0000-0000-c000-000000000000/.default` (Microsoft Intune resource)
- Successful token fetch: `result: Succeeded | target: AADIntuneToken`

**Phase 2: Enrollment Profile Download**
```
```
- Requests enrollment progress via `StatelessEnrollmentService/EnrollmentSessions`
- Fetches **AADIntuneEnrollmentToken** (resource ID: `d4ebce55-015a-49b5-a083-c84d1797ae8c`)

**Phase 3: Enrollment Eligibility Check**
```
```
- Service URL pattern: `fef.msuc01.manage.microsoft.com` (varies by tenant region)
- Parameters include: `os=iOS`, `os-version`, `ssp-version`, `arch`

**Phase 4: Device Enrollment Execution**
```
```

**Key Resource IDs**

**Key Token Types**

**Troubleshooting Tips**
- If login fails → check `ADALLoginStarted` event and MSAL error
- If enrollment token fails → check authority URL resolution (common → tenant-specific)
- If eligibility check fails → check `EnrollmentEligibility` result in response
- For Mooncake/21Vianet → service URL will differ from global (`fef.msuc01.manage.microsoft.com`)
- Cross-reference with Azure AD Sign-in Activity logs for token acquisition issues

### Phase 10: Configure Gpo Auto Enroll
> 来源: OneNote — [onenote-configure-gpo-auto-enroll.md](../drafts/onenote-configure-gpo-auto-enroll.md)

**Configure GPO for Automatic MDM Enrollment (Intune)**
**Purpose**
**Prerequisites**
- On-premises Active Directory with hybrid Azure AD join configured
- Azure AD Connect syncing device objects
- Intune licenses assigned to users
- Windows 10/11 Pro or Enterprise

**Steps**

**1. Create OU for Target Devices**
- Open Active Directory Users and Computers
- Create a new OU (e.g., "Autopilot Devices") under the domain
- Move target hybrid-joined devices into this OU

**2. (Optional) Create Device Security Group**
- Under Users, create a security group for security filtering
- Add target device objects to this group
- **Note**: Device group membership may require a **device restart** to take effect

**3. Create and Configure GPO**
- Open Group Policy Management
- Right-click the OU > Create a GPO and link it
- Edit the GPO:
  - Navigate to: Computer Configuration > Policies > Administrative Templates > Windows Components > MDM
  - Enable: **"Enable automatic MDM enrollment using default Azure AD credentials"**

**4. (Optional) Configure Security Filtering**
- If using a device security group for targeted deployment:
  - On the GPO Delegation tab > Advanced: uncheck "Apply group policy" for **Authenticated Users**
  - Add the device security group to Security Filtering
- **Important**: Without removing Authenticated Users from Apply, the security group filter is ineffective because all devices in the OU are part of Authenticated Users

**5. Verify on Client Device**
```cmd
```

**6. Confirm Scheduled Task**
- On the client device, open Task Scheduler
... (详见原始草稿)

### Phase 11: Device Enrollment Tsg
> 来源: OneNote — [onenote-device-enrollment-tsg.md](../drafts/onenote-device-enrollment-tsg.md)

**Device Enrollment Troubleshooting (21v Mooncake)**
**Three Types of Enrollment Failures**
1. **Client Errors** - account misconfig or unable to reach enrollment endpoint
2. **Service Errors** - server-side failures
3. **Pre/Post Enrollment Failure** - not visible in DeviceLifecycle log

**General Steps**

**Step 1: Get Client Information**
```kql
```

**Step 2: Query Provider-Specific Logs**
```kql
```

**Step 3: Deep Dive with IntuneEvent**
```kql
```

**Important Notes**
- If no DeviceLifecycle log appears 20 min after failure -> likely pre-enrollment failure
- Pre-enrollment failures: check network connectivity, certificate trust, enrollment endpoint reachability
- Scale units: CNPASU01 (sub: a1472f7d-...), CNBASU01 (sub: 3f7fcc0f-...)

### Phase 12: Enroll After Aadj Methods
> 来源: OneNote — [onenote-enroll-after-aadj-methods.md](../drafts/onenote-enroll-after-aadj-methods.md)

**Intune Enrollment Methods After Azure AD Join (AADJ)**
**Scenario**
**Enrollment Methods Comparison**
**Key Findings**
**OOBE Auto-Enroll (Baseline)**
- Enrollment type: `6 (MDMDeviceWithAAD)` 
- Device ownership: Corporate
- UI shows Microsoft logo

**Manual "Enroll only in Device Management"**
- Enrollment type: `0 (MDMFull)` - BYOD enrollment
- Device ownership: Personal
- UI shows briefcase icon
- May have limitations with IME, AAD CA, etc.

**Group Policy Auto-Enroll (Recommended for post-AADJ)**
- Enrollment type: `6 (MDMDeviceWithAAD)` - same as OOBE
- Device ownership: Corporate
- UI effect identical to OOBE auto-enroll
- Reference: [Enroll a Windows device automatically using Group Policy](https://learn.microsoft.com/en-us/windows/client-management/enroll-a-windows-10-device-automatically-using-group-policy#configure-the-autoenrollment-group-policy-for-a-single-pc)

**UI Icon Explanation**
- **Microsoft logo**: Cloud user logged in after AADJ
- **Briefcase icon**: "Enroll only in Device Management" (always), or local user that performed AADJ (before switching to cloud user)

**Recommendation**

### Phase 13: Kusto 诊断查询

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

#### enrollment.md
`[工具: Kusto skill — enrollment.md]`

```kql
IntuneOperation
| where env_time between (datetime({startTime}) .. datetime({endTime}))
| where TenantId == '{tenantId}'
| where operationName contains "Enrollment"
| project env_time, AccountId, DeviceId, UserId, operationName, resultType, resultDescription
| order by env_time desc
```

```kql
let starttime = datetime({startTime});
let endtime = datetime({endTime});
let deviceid = '{deviceId}';
let accountid = '{accountId}';

DeviceLifecycle
| where env_time between (starttime .. endtime)
| where accountId == accountid
| where deviceId contains deviceid
| project env_time, deviceId, userId, tenantID, accountId, ActivityId, relatedActivityId2
| order by env_time desc
```

```kql
let _deviceId = '{deviceId}';
let _tenantId = '{tenantId}';
let _maxcount = int(5000);

DeviceLifecycle
| where tenantId <> ''
| where deviceId == _deviceId or userId == _deviceId
| extend TypeName = case(
    type==0, 'Unknown', type==1, 'User Personal', type==2, 'User Personal with AAD',
    type==3, 'User Corporate', type==4, 'User Corporate with AAD', type==5, 'Userless Corporate',
    type==10, 'AutoEnrollment', type==12, 'On Premise Comanaged',
    type==13, 'AutoPilot Azure Domain Joined with profile', tostring(type))
| extend EventName = case(
    EventId==46801, 'EnrollmentAddDeviceEvent', EventId==46804, 'EnrollmentAddDeviceFailedEvent',
    EventId==46806, 'EnrollmentStartEvent', EventId==46802, 'Renewal succeeded',
    EventId==46821, 'Registration succeeded', EventId==46822, 'Device removed',
    EventId==46825, 'Device checked in', tostring(EventId))
| extend PlatformName = case(
    platform==3, 'Windows 10', platform==7, 'iPhone', platform==8, 'iPad',
    platform==11, 'Android', platform==14, 'Android for Work', tostring(platform))
| project env_time, EventId, EventName, TypeName, PlatformName, deviceId, userId, accountId,
    oldManagementState, newManagementState, oldRegistrationState, newRegistrationState, details
| limit _maxcount
```

```kql
IOSEnrollmentService 
| where env_time > ago(30d)
| where ActivityId == '{deviceId}'
| project env_time, userId, callerMethod, message, deviceTypeAsString, 
    serialNumber, siteCode, ActivityId, relatedActivityId2
```

```kql
let deviceid = '{deviceId}';
let starttime = datetime({startTime});
let endtime = datetime({endTime});

DeviceManagementProvider
| where env_time between (starttime..endtime)
| where ActivityId == deviceid or userId == deviceid
| project env_time, deviceId, ActivityId, message, EventId, userId, TaskName
| order by env_time
```

```kql
DeviceManagementProvider
| where env_time between (datetime({startTime}) .. datetime({endTime}))
| where ActivityId =~ '{deviceId}'
| where message contains "ending management session" or message contains "starting management session"
| project env_time, message, EventMessage, EventId, ActivityId, relatedActivityId2, 
    actionName, deviceId, accountId
| sort by env_time asc
```


---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | iOS MDM enrollment fails after Quick Start restore with error: Unable to create unlock token - Th... | Quick Start restore runs after Setup Assistant completes and passcode is alre... | Use iCloud or iTunes backup restore during Setup Assistant (before passcode step) instead of Quic... | 🟢 9.0 | OneNote |
| 2 | Activation Lock State is showing as &quot;Not enabled.&quot;Other fields are showing accurately, ... | DEP enrollment is not directly related to configuring devices for Activation ... | Unless both of these are present on the device, the Activation Lock will automatically be ignored... | 🔵 7.0 | ContentIdea KB |
| 3 | iOS enrollment fails with: Profile Installation Failed. Connection to the server could not be est... | Device was previously enrolled by a different user and the previous user devi... | Login to Azure portal, go to Devices > All Devices, find the device using previous or new user UP... | 🔵 7.0 | ContentIdea KB |
| 4 | Apple ADE enrollment fails with XPC_TYPE_ERROR Connection invalid error in mobileassetd logs | Network connection problem between device and Apple ADE service (cannot reach... | Fix network connectivity or use a different network to enroll; if persists contact Apple support | 🔵 5.5 | MS Learn |

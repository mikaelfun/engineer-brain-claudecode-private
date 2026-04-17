# Intune 报告与诊断日志收集 — 综合排查指南

**条目数**: 7 | **草稿融合数**: 3 | **Kusto 查询融合**: 2
**来源草稿**: ado-wiki-b-PowerLift.md, onenote-intune-kusto-diagnostic-queries.md, onenote-offline-mobile-log-collection.md
**Kusto 引用**: device-info.md, intune-events-general.md
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: B Powerlift
> 来源: ADO Wiki — [ado-wiki-b-PowerLift.md](../drafts/ado-wiki-b-PowerLift.md)

**Powerlift**
- Company Portal / Intune app / Tunnel VPN / Edge MAM / Outlook mobile / Authenticator / Defender ATP

**Company Portal, Intune, and Tunnel Server logs**

**Authenticator**

**Defender for Endpoint/ATP (including Tunnel Client) logs**

### Phase 2: Intune Kusto Diagnostic Queries
> 来源: OneNote — [onenote-intune-kusto-diagnostic-queries.md](../drafts/onenote-intune-kusto-diagnostic-queries.md)

**Intune Kusto Diagnostic Queries - Quick Reference**
**1. Check Intune License Status**
- **EventUniqueNames**: LogUnlicensedUserOutOfGracePeriod, LogNotFoundGetUserResult, LogUnlicensedUserWithInGracePeriod, LogUserFoundGetAsyncResultFromDB
- **Table**: IntuneEvent
- **Key fields**: UserId, EventUniqueName, Col1 (license type), Col2 (unlicensed date), Col3 (grace period minutes)
- **Grace period**: Default 43200 minutes (30 days)

**2. Check Device Compliance State**

**Per-device compliance detail**
- **Table**: IntuneEvent, ServiceName = StatelessComplianceCalculationService
- **EventUniqueNames**:
  - ComplianceDetail-GetComplianceDetailsForDeviceAction-FinalResult (current state)
  - ComplianceDetail-ComplianceUpdateDevicePatcher-DeviceCompliantChangedDetails (state changes)
- **Extract**: ComplianceState, RuleDetails, AccountId, DeviceId, UserId from Col1/Col2

**Compliance sync to AAD**
- **Table**: GraphApiProxyLibrary
- Filter by AAD device ID in url/errorMessage
- Watch for httpStatusCode 404 = AAD device not found

**Function shortcut**
- `DeviceComplianceStatusChangesByDeviceId(deviceId, startTime, endTime, maxRows)`

**3. DEM (Device Enrollment Manager) User Verification**
- **Table**: DeviceManagementProvider
- Filter message contains "Service Account" AND contains userId
- If results found -> user is DEM; no results -> likely not DEM

**4. Device Check-in Troubleshooting**

**Session tracking**
- **Table**: DmpLogs, message startswith "New Session"

**Routing service verification**
- **Table**: HttpSubsystem, sourceServiceName = DeviceCheckinRoutingService, I_Srv = SLDMService

**Apple notification result**
- **Table**: IntuneEvent, ServiceName = AppleNotificationRelayService
- **EventUniqueName**: DeviceNotificationResult
... (详见原始草稿)

### Phase 3: Offline Mobile Log Collection
> 来源: OneNote — [onenote-offline-mobile-log-collection.md](../drafts/onenote-offline-mobile-log-collection.md)

**Offline Mobile Log Collection (iOS & Android)**
**iOS Outlook Log**
1. Tap profile avatar in Outlook
2. Go to Settings (gear icon)
3. Select Privacy
4. Confirm "Optional connected experiences" is OFF
5. Return to main UI, tap "?" (Help)

**Android Company Portal Log**
1. **First**: reproduce the issue scenario
2. Open Company Portal app
3. Settings > Diagnostic logs > Save logs
4. Create a new folder when prompted
5. Logs saved to device storage

**Notes**
- iOS logs may be large; recommend internal transfer to IT before uploading to support
- Android logs are saved locally and can be transferred via USB cable
- These methods work when device has no email capability or upload is restricted

### Phase 4: Kusto 诊断查询

#### device-info.md
`[工具: Kusto skill — device-info.md]`

```kql
let searchId = '{searchId}';

DeviceManagementProvider
| where env_time > ago(30d)
| where * has searchId
| parse message with * 'AADDId=' AADdeviceID_Msg ',' *
| where isnotempty(AADdeviceID_Msg) or isnotempty(deviceId)
| summarize 
    FirstSeen=min(env_time), 
    LastSeen=max(env_time)
  by IntuneDeviceID=deviceId, AADDeviceID=AADdeviceID_Msg, accountId, accountContextId
| project FirstSeen, LastSeen, IntuneDeviceID, AADDeviceID, AccountId=accountId, AADTenant=accountContextId
```

```kql
DeviceManagementProvider
| where env_time between(datetime({startTime})..datetime({endTime}))
| where deviceId has '{deviceId}'
| where accountId has '{accountId}'
| project env_time, DeviceID=ActivityId, PolicyName=name, PolicyType=typeAndCategory, 
    Applicability=applicablilityState, Compliance=reportComplianceState, 
    TaskName, EventId, EventMessage, message, tenantContextId, tenantId, 
    aadDeviceId, accountContextId, accountId
| limit 1000
| parse message with * 'AADDId=' AADdeviceID_Msg ',Type' *
| parse message with * 'CIId:' PolicyID_EvM '\';' *
| distinct PolicyID_EvM, AADdeviceID_Msg, DeviceID, AADTenant=accountContextId, accountId
```

```kql
let deviceid = '{deviceId}';
let accountid = '{accountId}';

DeviceLifecycle
| where env_time > ago(30d)
| where accountId == accountid
| where deviceId contains deviceid
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
| order by env_time desc
| limit 500
```

```kql
let accountId = '{accountId}';
let platform = '{platform}';  // 可选

DeviceLifecycle
| where env_time > ago(90d)
| where accountId == accountId
| where platform == platform or platform == ''
| where deviceId != ''
| summarize 
    LastSeen=max(env_time),
    FirstSeen=min(env_time)
  by deviceId, platform
| order by LastSeen desc
| limit 1000
```

```kql
let starttime = datetime({startTime});
let endtime = datetime({endTime});
let deviceid = '{deviceId}';

IntuneEvent
| where env_time between (starttime..endtime)
| where deviceid <> ''
| where DeviceId == deviceid
| where * has 'DeviceOwnership' and Col2 has 'DeviceCategory'
| project env_time, EventUniqueName, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, ServiceName, DeviceId
| summarize count(), max(env_time) by Col2, DeviceId, ServiceName
| parse Col2 with * 'AadDeviceId = ' AADdeviceID ',' *
| project max_env_time, ServiceName, AADdeviceID, fullmsg = Col2, DeviceId
| limit 1000
```

#### intune-events-general.md
`[工具: Kusto skill — intune-events-general.md]`

```kql
let starttime = datetime({startTime});
let endtime = datetime({endTime});
let accountid = '{accountId}';
let deviceid = '{deviceId}';
let userid = '{userId}';
let filterstring = '{filterstring}';
let relatedactivityid = '{relatedActivityId}';
let activityid = '{activityId}';

IntuneEvent
| where env_time between (starttime .. endtime)
| where AccountId == accountid
| extend targetid = iff(relatedactivityid <> '', relatedactivityid, iff(activityid <> '', activityid, iff(deviceid <> '', deviceid, iff(userid <> '', userid, ''))))
| where RelatedActivityId =~ targetid or ActivityId =~ targetid or DeviceId =~ targetid or UserId =~ targetid
| project env_time, ContextId, AccountId, DeviceId, UserId, ActivityId, RelatedActivityId, EventUniqueName, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, Message
| where * contains filterstring
| order by env_time desc
| limit 1000
| extend metakeys = todynamic(split(trim_end(';', ColMetadata), ';'))
| extend metavalues = pack(tostring(metakeys[0]), Col1, tostring(metakeys[1]), Col2, tostring(metakeys[2]), Col3, tostring(metakeys[3]), Col4, tostring(metakeys[4]), Col5, tostring(metakeys[5]), Col6)
| project env_time, EventUniqueName, metavalues, AccountId, DeviceId, UserId, ActivityId, RelatedActivityId
| sort by env_time asc
```

```kql
let starttime = datetime({startTime});
let endtime = datetime({endTime});
let accountid = '{accountId}';
let deviceid = '{deviceId}';
let userid = '{userId}';
let relatedactivityid = '{relatedActivityId}';
let activityid = '{activityId}';
let filterstring = '{filterstring}';

let relatedactivityIds = IntuneEvent
| where env_time between (starttime .. endtime)
| where AccountId == accountid
| extend targetid = iff(relatedactivityid <> '', relatedactivityid, iff(activityid <> '', activityid, iff(deviceid <> '', deviceid, iff(userid <> '', userid, ''))))
| where RelatedActivityId =~ targetid or ActivityId =~ targetid or DeviceId =~ targetid or UserId =~ targetid
| sort by env_time asc
| summarize makeset(RelatedActivityId, 10000);

IntuneEvent
| where env_time between (starttime .. endtime)
| where RelatedActivityId in (relatedactivityIds)
| project env_time, ContextId, AccountId, DeviceId, UserId, ActivityId, RelatedActivityId, EventUniqueName, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, Message
| limit 5000
| extend metakeys = todynamic(split(trim_end(';', ColMetadata), ';'))
| extend metavalues = pack(tostring(metakeys[0]), Col1, tostring(metakeys[1]), Col2, tostring(metakeys[2]), Col3, tostring(metakeys[3]), Col4, tostring(metakeys[4]), Col5, tostring(metakeys[5]), Col6)
| project env_time, EventUniqueName, metavalues, DeviceId, ActivityId, RelatedActivityId
| where EventUniqueName contains filterstring or metavalues contains filterstring
| sort by env_time asc
| limit 5000
```

```kql
let starttime = datetime({startTime});
let endtime = datetime({endTime});
let accountid = '{accountId}';
let deviceid = '{deviceId}';
let relatedactivityid = '{relatedActivityId}';
let activityid = '{activityId}';
let filterstring = '{filterstring}';

DeviceManagementProvider
| where env_time between (starttime .. endtime)
| extend myactivity = iff(relatedactivityid <> '', relatedactivityid, iff(activityid <> '', activityid, iff(deviceid <> '', deviceid, 'non-exists')))
| where ActivityId =~ myactivity or relatedActivityId2 =~ myactivity
| order by env_time desc
| project env_time, message, EventMessage, EventId, ActivityId, relatedActivityId2, actionName, deviceId, accountId
| where * contains filterstring
| sort by env_time asc
| limit 5000
```


---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Collecting diagnostic logs from Intune portal fails or takes ~8 hours. Issue happens on almost al... | Group Policy (GPO) has cloud notifications disabled. Registry key NoCloudAppl... | 1. Check GPO: Computer Configuration > Start Menu and Taskbar > Notifications > Turn off notifica... | 🟢 9.0 | OneNote |
| 2 | EPM elevation reporting data missing — no elevation reports appearing in Intune admin center | EPM elevation reports take 24 hours to populate; or EPM Reporting not enabled... | 1) Wait 24 hours for reports to process. 2) Verify OS supported. 3) Verify EPM Reporting enabled ... | 🟢 8.5 | ADO Wiki |
| 3 | Target OS list is empty when generating Update Device Readiness & Compatibility Risks Report | Prerequisites not met. Device diagnostics not enabled under Tenant Administra... | Enable Device diagnostics under Tenant Admin per https://learn.microsoft.com/mem/intune/remote-ac... | 🟢 8.5 | ADO Wiki |
| 4 | No devices found when Update Readiness (MEM-UR) report is generated | Multiple causes: telemetry AllowTelemetry <1, OneSettings disabled via GPO, O... | 1) Enable Windows data checkboxes under Tenant Admin > Connectors > Windows data 2) Check AllowTe... | 🟢 8.5 | ADO Wiki |
| 5 | When setting up Data Alert and Intune integration on iOS and Android devices, users receive an AD... | Still under investigation. | Check the following Service Principal with the AAD Service Principal Policy Diagnostic in ViewPoi... | 🔵 7.0 | ContentIdea KB |
| 6 | When wrapping a LOB application using Microsoft Intune App Wrapping Tool for Android, the tool cr... | The application being wrapped is at or near the Android dexfile 64k method li... | 1. Install latest Intune App Wrapping Tool for Android. 2. Enable Multidex. If unresolved: reduce... | 🔵 7.0 | ContentIdea KB |
| 7 | Intune device diagnostics log collection from portal fails intermittently or takes approximately ... | Intermittent issue with the log collection upload to logmanagerservice endpoi... | 1. Check HttpSubsystem for logcollect requests to see timing: HttpSubsystem \| where * contains '... | 🔵 6.5 | OneNote |

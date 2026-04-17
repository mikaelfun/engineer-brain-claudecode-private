# Intune 报告与诊断日志收集 — 排查工作流

**来源草稿**: ado-wiki-b-PowerLift.md, onenote-intune-kusto-diagnostic-queries.md, onenote-offline-mobile-log-collection.md
**Kusto 引用**: device-info.md, intune-events-general.md
**场景数**: 26
**生成日期**: 2026-04-07

---

## Scenario 1: Per-device compliance detail
> 来源: onenote-intune-kusto-diagnostic-queries.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- **Table**: IntuneEvent, ServiceName = StatelessComplianceCalculationService
- **EventUniqueNames**:
  - ComplianceDetail-GetComplianceDetailsForDeviceAction-FinalResult (current state)
  - ComplianceDetail-ComplianceUpdateDevicePatcher-DeviceCompliantChangedDetails (state changes)
- **Extract**: ComplianceState, RuleDetails, AccountId, DeviceId, UserId from Col1/Col2

## Scenario 2: Compliance sync to AAD
> 来源: onenote-intune-kusto-diagnostic-queries.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- **Table**: GraphApiProxyLibrary
- Filter by AAD device ID in url/errorMessage
- Watch for httpStatusCode 404 = AAD device not found

## Scenario 3: Function shortcut
> 来源: onenote-intune-kusto-diagnostic-queries.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- `DeviceComplianceStatusChangesByDeviceId(deviceId, startTime, endTime, maxRows)`

## Scenario 4: 3. DEM (Device Enrollment Manager) User Verification
> 来源: onenote-intune-kusto-diagnostic-queries.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- **Table**: DeviceManagementProvider
- Filter message contains "Service Account" AND contains userId
- If results found -> user is DEM; no results -> likely not DEM

## Scenario 5: Session tracking
> 来源: onenote-intune-kusto-diagnostic-queries.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- **Table**: DmpLogs, message startswith "New Session"

## Scenario 6: Routing service verification
> 来源: onenote-intune-kusto-diagnostic-queries.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- **Table**: HttpSubsystem, sourceServiceName = DeviceCheckinRoutingService, I_Srv = SLDMService

## Scenario 7: Apple notification result
> 来源: onenote-intune-kusto-diagnostic-queries.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- **Table**: IntuneEvent, ServiceName = AppleNotificationRelayService
- **EventUniqueName**: DeviceNotificationResult
- Watch for InvalidDeviceCredentials (code 1211)

## Scenario 8: Last check-in time
> 来源: onenote-intune-kusto-diagnostic-queries.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- **EventUniqueName**: UpdateDeviceLastContact (Col1=previous, Col2=current)

## Scenario 9: Policy sync delay detection
> 来源: onenote-intune-kusto-diagnostic-queries.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- **Table**: DeviceManagementProvider, EventId = 5782 (TraceIOSCommandEvent)
- Use prev() + datetime_diff to calculate gaps

## 5. Device Cleanup Rule

## Scenario 10: Check eligible devices
> 来源: onenote-intune-kusto-diagnostic-queries.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- **Table**: DeviceService_Device, filter LastContact < ago(90d)

## Scenario 11: Verify manual delete
> 来源: onenote-intune-kusto-diagnostic-queries.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- **Table**: HttpSubsystem, I_Srv = StatelessDeviceFEService, httpVerb POST/DELETE

## Scenario 12: Cleanup rule audit
> 来源: onenote-intune-kusto-diagnostic-queries.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- **Table**: IntuneEvent, ComponentName = StatelessDeviceOverflowService
- **EventUniqueName**: DeviceRemovalRuleAudit

## 6. Device Configuration Policy Status

## Scenario 13: Per-device policy compliance
> 来源: onenote-intune-kusto-diagnostic-queries.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- **Table**: DeviceManagementProvider, EventId = 5786
- **Fields**: PolicyName, PolicyType, Applicability, Compliance

## Scenario 14: Tattoo removal check
> 来源: onenote-intune-kusto-diagnostic-queries.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Filter message startswith "Attempting to remove" and contains "wired"

## Scenario 15: SSL client certificate verification
> 来源: onenote-intune-kusto-diagnostic-queries.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- **Table**: IntuneEvent, ComponentName = FabricAuthenticationModule
- Check ReceivedCallWithSslClientCertificate + UdaCertificateValidatedSuccessfully

## Scenario 16: Enrollment renewal event
> 来源: onenote-intune-kusto-diagnostic-queries.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- **Table**: DeviceLifecycle, TaskName = EnrollmentRenewDeviceEvent

## Scenario 17: Certificate issuance
> 来源: onenote-intune-kusto-diagnostic-queries.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- **Table**: IntuneEvent, ServiceName = CertificateAuthority
- **EventUniqueName**: IssueCertSuccess

## Scenario 18: 8. Device PIN Reset & Lock Workflow
> 来源: onenote-intune-kusto-diagnostic-queries.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Steps: DeviceProvider -> PushNotificationProvider -> HttpSubsystem -> DeviceManagementProvider
- **Auditing EventIDs**: 1245 (PinReset), 1246 (Lock), 1430 (LostMode)

## 9. Device Retire & Wipe

## Scenario 19: Confirm action issued
> 来源: onenote-intune-kusto-diagnostic-queries.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- **Table**: HttpSubsystem, url contains deviceId AND "retire"/"wipe"

## Scenario 20: Confirm action reached device
> 来源: onenote-intune-kusto-diagnostic-queries.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- **Table**: DeviceManagementProvider, message contains "retire"/"wipe"

## Scenario 21: ManagementState enum
> 来源: onenote-intune-kusto-diagnostic-queries.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- 0=Managed, 1=RetirePending, 3=WipePending, 7=RetireIssued, 8=WipeIssued

## Scenario 22: Initiator enum
> 来源: onenote-intune-kusto-diagnostic-queries.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- 0=Unknown, 1=Admin, 2=User, 3=DataProcessor, 5=O365, 6=Operations

## Scenario 23: Graph API
> 来源: onenote-intune-kusto-diagnostic-queries.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Retire: POST /deviceManagement/managedDevices/{id}/retire -> 204
- Wipe: POST /deviceManagement/managedDevices/{id}/wipe -> 204

## 10. Device/User Effective Group

## Scenario 24: Check current EG
> 来源: onenote-intune-kusto-diagnostic-queries.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- **Table**: DeviceManagementProvider, message contains "DeviceEG" or "UserEG="

## Scenario 25: EG membership changes
> 来源: onenote-intune-kusto-diagnostic-queries.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- **Table**: IntuneEvent, EventUniqueName = EffectiveGroupMembershipUpdated
- Col1=EGId, Col2=TargetId, Col5=ActiveClauses

## Scenario 26: EGPRR
> 来源: onenote-intune-kusto-diagnostic-queries.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- **Table**: IntuneEvent, EventUniqueName = 47121
- EGId -> PayloadId mappings

---

## Kusto 查询参考

### 查询 1: 宽泛搜索确认设备存在

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
`[来源: device-info.md]`

### 查询 2: 获取设备详细信息

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
`[来源: device-info.md]`

### 查询 3: 设备生命周期事件

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
`[来源: device-info.md]`

### 查询 4: 从 DeviceLifecycle 获取设备列表

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
`[来源: device-info.md]`

### 查询 5: 获取 AAD Device ID 注册信息（DeviceOwnership/DeviceCategory）

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
`[来源: device-info.md]`

### 查询 1: IntuneEvent 按设备/用户查询

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
`[来源: intune-events-general.md]`

---

> ⚠️ **21V (Mooncake) 注意**: 本主题包含 21V 特有的限制或配置，请注意区分 Global 与 21V 环境差异。

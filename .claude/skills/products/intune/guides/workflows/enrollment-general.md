# Intune 注册通用问题 — 排查工作流

**来源草稿**: (无)
**Kusto 引用**: device-checkin.md, effective-group.md, enrollment.md
**场景数**: 0
**生成日期**: 2026-04-07

---

## Kusto 查询参考

### 查询 1: 获取会话摘要

```kql
DeviceManagementProvider
| where env_time between(datetime({startTime})..datetime({endTime}))
| where accountId has '{accountId}'
| where ActivityId has '{deviceId}' or deviceId has '{deviceId}'
| summarize LastCheckin=max(env_time), CheckinCount=count() by deviceId
| project LastCheckin, CheckinCount, deviceId
```
`[来源: device-checkin.md]`

### 查询 2: 获取详细 Check-in 属性

```kql
IntuneEvent
| where env_time between(datetime({startTime})..datetime({endTime}))
| where ActivityId has '{deviceId}' or DeviceId has '{deviceId}'
| where EventUniqueName has 'UpdatePerCheckinProps'
| extend metakeys = todynamic(split(trim_end(';',ColMetadata),';'))
| extend metavalues = pack(
    tostring(metakeys[0]), Col1, 
    tostring(metakeys[1]), Col2, 
    tostring(metakeys[2]), Col3, 
    tostring(metakeys[3]), Col4, 
    tostring(metakeys[4]), Col5, 
    tostring(metakeys[5]), Col6
  )
| project env_time, ComponentName, EventUniqueName, metavalues
| order by env_time asc
```
`[来源: device-checkin.md]`

### 查询 3: 完整会话日志

```kql
let start = datetime({startTime});
let end = datetime({endTime});
let _deviceId = '{deviceId}';

DeviceManagementProvider
| where env_time between (start .. end)
| where ActivityId == _deviceId
| project env_time, src='DeviceManagementProvider', ActivityId, deviceId, userId, accountId, accountContextId, message, EventMessage, scenarioInstanceId, Level, cV, I_BuildVer
| union(
  IntuneEvent
  | where env_time between (start .. end)
  | where ServiceName == "SLDMService"
  | where ComponentName in ("DMSPolicyProcessor", "DMSPolicyProcessor_EndProcessingRule")
  | where ActivityId == _deviceId
  | project env_time, src='IntuneEvent', ActivityId, deviceId=DeviceId, userId=UserId, accountId=AccountId, accountContextId=ContextId, message=Col1, scenarioInstanceId=ScenarioInstanceId, Level=TraceLevel
)
| sort by env_time asc
```
`[来源: device-checkin.md]`

### 查询 4: 设备 EG 签入查询

```kql
DeviceManagementProvider 
| where env_time > ago(30d)
| where message contains "DeviceEG" or message contains "UserEG="
| where deviceId has '{deviceId}'
| project env_time, deviceId, userId, message
| order by env_time asc
```
`[来源: device-checkin.md]`

### 查询 5: 从 IntuneOperation 查询操作

```kql
IntuneOperation
| where env_time between (datetime({startTime}) .. datetime({endTime}))
| where AccountId == '{accountId}'
| where DeviceId contains '{deviceId}'
| project env_time, operationName, resultType, durationMs, DeviceId, ActivityId
| order by env_time desc
```
`[来源: device-checkin.md]`

### 查询 6: 设备管理全量日志

```kql
let starttime = datetime({startTime});
let endtime = datetime({endTime});
let accountid = '{accountId}';
let deviceid = '{deviceId}';

DeviceManagementProvider
| where env_time between (starttime .. endtime)
| where ActivityId =~ deviceid
| order by env_time desc 
| project env_time, message, EventMessage, EventId, ActivityId, relatedActivityId2, actionName, deviceId, accountId
| sort by env_time asc
```
`[来源: device-checkin.md]`

### 查询 7: MDMCheckIn 操作查询（IntuneOperation）

```kql
let starttime = datetime({startTime});
let endtime = datetime({endTime});
let deviceid = '{deviceId}';

IntuneOperation
| where env_time between (starttime..endtime)
| where DeviceId == deviceid
| where ScenarioType contains "DeviceSync"
| where operationName == "MDMCheckIn"
| project env_time, env_cloud_role, ServiceName, ApplicationName, operationName, operationType, resultType, resourceType, durationMs, targetEndpointAddress
| order by env_time asc
| limit 1000
```
`[来源: device-checkin.md]`

### 查询 1: 查询设备/用户的 EG 变更

```kql
IntuneEvent
| where env_time > ago(21d)
| where env_cloud_name == "CNPASU01"
| where ServiceName contains "GroupingServiceV2BgTaskService" 
| where EventUniqueName contains "EffectiveGroupMembershipUpdated"
| project env_time, TargetId=Col2, EGId=Col1, AccountId, ActiveClauses=Col5, StaleClauses=Col6, ServiceName, env_cloud_name
| where TargetId == '{targetId}'
| order by env_time asc
```
`[来源: effective-group.md]`

### 查询 2: 查询策略通过 EG 分配的情况

```kql
IntuneEvent
| where env_time >= datetime({startTime}) and env_time <= datetime({endTime})
| where env_cloud_name == "CNPASU01"
| where EventUniqueName == "47121"
| where AccountId == '{accountId}'
| where PayLoadId == '{policyId}'
| extend EffectiveGroupId = Col1
| extend IsDeletedDeployment = Col3
| where EffectiveGroupId in ({egIdList})  // 例如: ("eg-id-1", "eg-id-2")
| extend jsonString = parse_json(extract("SerializedMessage:({.*)",1,Message))
| project env_time, EffectiveGroupId, IsDeletedDeployment, Col4, Col5, Col6, ActivityId
| order by env_time asc
// 注意: ActivityId 是生效的 device
```
`[来源: effective-group.md]`

### 查询 3: 查询策略分配给特定 EG 的设备

```kql
IntuneEvent
| where env_time > ago(7d)
| where env_cloud_name == "CNPASU01"
| where EventUniqueName == "47121"
| where AccountId == '{accountId}'
| where PayLoadId == '{policyId}'
| extend EffectiveGroupId = Col1
| where EffectiveGroupId in ({egIdList})
| extend jsonString = parse_json(extract("SerializedMessage:({.*)",1,Message))
| project env_time, AccountId, PayLoadId, Col1, Col2, Col3, Col4, Col5, Col6, 
    ColMetadata, ActivityId, jsonString, Message
| order by env_time asc
```
`[来源: effective-group.md]`

### 查询 1: 基础注册操作查询

```kql
IntuneOperation
| where env_time between (datetime({startTime}) .. datetime({endTime}))
| where TenantId == '{tenantId}'
| where operationName contains "Enrollment"
| project env_time, AccountId, DeviceId, UserId, operationName, resultType, resultDescription
| order by env_time desc
```
`[来源: enrollment.md]`

### 查询 3: 设备生命周期详细查询 (含事件类型解析)

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
`[来源: enrollment.md]`

### 查询 4: iOS 注册服务查询

```kql
IOSEnrollmentService 
| where env_time > ago(30d)
| where ActivityId == '{deviceId}'
| project env_time, userId, callerMethod, message, deviceTypeAsString, 
    serialNumber, siteCode, ActivityId, relatedActivityId2
```
`[来源: enrollment.md]`

### 查询 5: DDM 日志查询

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
`[来源: enrollment.md]`

### 查询 6: 设备管理会话查询

```kql
DeviceManagementProvider
| where env_time between (datetime({startTime}) .. datetime({endTime}))
| where ActivityId =~ '{deviceId}'
| where message contains "ending management session" or message contains "starting management session"
| project env_time, message, EventMessage, EventId, ActivityId, relatedActivityId2, 
    actionName, deviceId, accountId
| sort by env_time asc
```
`[来源: enrollment.md]`

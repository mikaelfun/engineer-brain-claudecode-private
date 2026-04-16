# Intune Windows 注册与 Auto-Enrollment — 排查工作流

**来源草稿**: (无)
**Kusto 引用**: enrollment.md
**场景数**: 0
**生成日期**: 2026-04-07

---

## Kusto 查询参考

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

### 查询 2: 设备生命周期查询

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

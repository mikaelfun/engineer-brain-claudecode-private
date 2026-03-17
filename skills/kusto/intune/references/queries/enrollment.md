---
name: enrollment
description: Intune 设备注册和生命周期查询
tables:
  - IntuneOperation
  - DeviceLifecycle
  - IOSEnrollmentService
  - DeviceManagementProvider
parameters:
  - name: deviceId
    required: true
    description: Intune 设备 ID
  - name: tenantId
    required: false
    description: 租户 ID
  - name: accountId
    required: false
    description: Intune 账户 ID
  - name: startTime
    required: false
    description: 开始时间
  - name: endTime
    required: false
    description: 结束时间
---

# 设备注册查询

## 用途

查询设备注册操作、生命周期事件、iOS 注册服务等。

---

## 查询 1: 基础注册操作查询

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {tenantId} | 是 | 租户 ID |
| {startTime} | 是 | 开始时间 |
| {endTime} | 是 | 结束时间 |

### 查询语句

```kql
IntuneOperation
| where env_time between (datetime({startTime}) .. datetime({endTime}))
| where TenantId == '{tenantId}'
| where operationName contains "Enrollment"
| project env_time, AccountId, DeviceId, UserId, operationName, resultType, resultDescription
| order by env_time desc
```

---

## 查询 2: 设备生命周期查询

### 查询语句

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

---

## 查询 3: 设备生命周期详细查询 (含事件类型解析)

### 查询语句

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

---

## 查询 4: iOS 注册服务查询

### 查询语句

```kql
IOSEnrollmentService 
| where env_time > ago(30d)
| where ActivityId == '{deviceId}'
| project env_time, userId, callerMethod, message, deviceTypeAsString, 
    serialNumber, siteCode, ActivityId, relatedActivityId2
```

---

## 查询 5: DDM 日志查询

> ⚠️ **注意**: 原 DmpLogs 表在 Mooncake 集群不存在，改用 DeviceManagementProvider

### 查询语句

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

---

## 查询 6: 设备管理会话查询

### 查询语句

```kql
DeviceManagementProvider
| where env_time between (datetime({startTime}) .. datetime({endTime}))
| where ActivityId =~ '{deviceId}'
| where message contains "ending management session" or message contains "starting management session"
| project env_time, message, EventMessage, EventId, ActivityId, relatedActivityId2, 
    actionName, deviceId, accountId
| sort by env_time asc
```

## 关联查询

- [device-info.md](./device-info.md) - 设备信息
- [autopilot.md](./autopilot.md) - Autopilot 注册

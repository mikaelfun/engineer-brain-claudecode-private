---
name: device-checkin
description: 设备 Check-in 和会话状态查询
tables:
  - DeviceManagementProvider
  - IntuneEvent
  - IntuneOperation
parameters:
  - name: deviceId
    required: true
    description: Intune 设备 ID
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

# 设备 Check-in 查询

## 用途

查询设备签到历史、会话信息、Check-in 状态等。

> ⚠️ **注意**: 原 DmpLogs 表在 Mooncake 集群不存在，已改用 DeviceManagementProvider

---

## 查询 1: 获取会话摘要

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {deviceId} | 是 | Intune 设备 ID |
| {accountId} | 是 | Intune 账户 ID |
| {startTime} | 是 | 开始时间 |
| {endTime} | 是 | 结束时间 |

### 查询语句

```kql
DeviceManagementProvider
| where env_time between(datetime({startTime})..datetime({endTime}))
| where accountId has '{accountId}'
| where ActivityId has '{deviceId}' or deviceId has '{deviceId}'
| summarize LastCheckin=max(env_time), CheckinCount=count() by deviceId
| project LastCheckin, CheckinCount, deviceId
```

---

## 查询 2: 获取详细 Check-in 属性

### 查询语句

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

---

## 查询 3: 完整会话日志

### 查询语句

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

---

## 查询 4: 设备 EG 签入查询

### 查询语句

```kql
DeviceManagementProvider 
| where env_time > ago(30d)
| where message contains "DeviceEG" or message contains "UserEG="
| where deviceId has '{deviceId}'
| project env_time, deviceId, userId, message
| order by env_time asc
```

---

## 查询 5: 从 IntuneOperation 查询操作

### 查询语句

```kql
IntuneOperation
| where env_time between (datetime({startTime}) .. datetime({endTime}))
| where AccountId == '{accountId}'
| where DeviceId contains '{deviceId}'
| project env_time, operationName, resultType, durationMs, DeviceId, ActivityId
| order by env_time desc
```

---

## 查询 6: 设备管理全量日志

### 查询语句

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

## 查询 7: MDMCheckIn 操作查询（IntuneOperation）

### 查询语句

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

---

## 查询 8: HttpSubsystem Frontdoor 查询（Check-in 路由）

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {deviceId} | 是 | Intune 设备 ID |
| {accountId} | 是 | Intune 账户 ID |
| {startTime} | 是 | 开始时间 |
| {endTime} | 是 | 结束时间 |

### 查询语句

```kql
let starttime = datetime({startTime});
let endtime = datetime({endTime});
let accountid = '{accountId}';
let deviceid = '{deviceId}';

HttpSubsystem
| where env_time between (starttime .. endtime)
| where accountId == accountid
| where ActivityId =~ deviceid
| where sourceServiceName == "DeviceCheckinRoutingService"
| where I_Srv == "SLDMService"
| project env_time, url, ActivityId, deviceId, statusCode, depthTag, TaskName
| order by env_time
| limit 1000
```

### 结果字段说明

| 字段 | 说明 |
|------|------|
| url | 请求 URL |
| statusCode | HTTP 状态码 |
| depthTag | 深度标签（用于追踪请求链路）|
| sourceServiceName | 源服务（DeviceCheckinRoutingService = Check-in 路由）|

---

## 关联查询

- [device-info.md](./device-info.md) - 设备信息
- [policy-error.md](./policy-error.md) - 策略错误分析
- [policy-status.md](./policy-status.md) - 策略状态

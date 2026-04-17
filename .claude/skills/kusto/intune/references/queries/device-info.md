---
name: device-info
description: 设备信息和 ID 映射查询
tables:
  - DeviceManagementProvider
  - DeviceLifecycle
parameters:
  - name: searchId
    required: true
    description: 用户提供的设备 ID（可能是 Intune ID 或 AAD ID）
  - name: deviceId
    required: false
    description: Intune 设备 ID
  - name: accountId
    required: false
    description: Intune 账户 ID
---

# 设备信息查询

## 用途

查询 Intune 设备信息，获取设备 ID 映射关系（Intune Device ID ↔ AAD Device ID）、租户信息等。

## ⚠️ 重要提示

**Intune 中有两种不同的设备 ID**：
- **Intune Device ID**: Intune 内部设备标识符
- **AAD Device ID (Entra ID Device ID)**: Azure AD 设备标识符

**必须使用 `* has 'device-id'` 宽泛条件搜索**，不要用精确匹配！

---

## 查询 1: 宽泛搜索确认设备存在

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {searchId} | 是 | 用户提供的设备 ID（可能是 Intune ID 或 AAD ID）|

### 查询语句

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

### 结果字段说明

| 字段 | 说明 |
|------|------|
| FirstSeen | 首次发现时间 |
| LastSeen | 最后发现时间 |
| IntuneDeviceID | Intune 设备 ID |
| AADDeviceID | Azure AD 设备 ID |
| AccountId | Intune 账户 ID |
| AADTenant | AAD 租户 ID |

---

## 查询 2: 获取设备详细信息

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

---

## 查询 3: 设备生命周期事件

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {deviceId} | 是 | Intune 设备 ID |
| {accountId} | 是 | Intune 账户 ID |

### 查询语句

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

### 结果字段说明

| 字段 | 说明 |
|------|------|
| EventName | 事件名称（如 EnrollmentAddDeviceEvent）|
| TypeName | 注册类型（如 User Corporate）|
| PlatformName | 平台名称（如 Windows 10、iPhone）|
| oldManagementState | 旧管理状态 |
| newManagementState | 新管理状态 |

---

## 查询 4: 从 DeviceLifecycle 获取设备列表

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {accountId} | 是 | Intune 账户 ID |
| {platform} | 否 | 平台代码（3=Windows, 7=iPhone, 8=iPad, 10=macOS）|

### 查询语句

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

## 查询 5: 获取 AAD Device ID 注册信息（DeviceOwnership/DeviceCategory）

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {deviceId} | 是 | Intune 设备 ID |
| {startTime} | 是 | 开始时间 |
| {endTime} | 是 | 结束时间 |

### 查询语句

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

### 结果字段说明

| 字段 | 说明 |
|------|------|
| AADdeviceID | Azure AD 设备 ID（从注册消息中解析）|
| ServiceName | 服务名称 |
| fullmsg | 完整消息（含 DeviceOwnership、DeviceCategory 等信息）|

---

## 关联查询

- [device-checkin.md](./device-checkin.md) - 设备 Check-in 状态
- [policy-status.md](./policy-status.md) - 策略应用状态
- [enrollment.md](./enrollment.md) - 设备注册事件

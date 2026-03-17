---
name: autopilot
description: Intune Autopilot 查询和预定义函数
tables:
  - IntuneScenarioHealth
  - IntuneEvent
parameters:
  - name: deviceId
    required: true
    description: 设备 ID
---

# Autopilot 查询

## 用途

查询 Autopilot V2 注册、预配、场景结果等。主要使用预定义函数进行诊断。

---

## 预定义函数列表

| 函数名 | 参数 | 说明 |
|--------|------|------|
| CheckAutopilotV2EligibilityForDevice | (lookback, deviceId) | 检查设备是否支持 APv2 |
| GetAutopilotV2EnrollmentEventsForDevice | (lookback, deviceId) | 获取 APv2 注册事件 |
| GetAutopilotV2ProvisioningEventsForDevice | (lookback, deviceId) | 获取 APv2 预配事件 |
| GetAutopilotV2CheckinSessionInfoForDevice | (lookback, intuneDeviceId) | 获取签入会话信息 |
| GetAutopilotV2SidecarInstallEventsForDevice | (lookback, intuneDeviceId) | 获取 Sidecar 安装事件 |
| GetAutopilotV2ScenarioResultEventsForDevice | (lookback, deviceId) | 获取场景结果事件 |
| GetAutopilotV2EnrollmentEventsForActivityId | (lookback, activityId) | 通过 ActivityId 获取注册事件 |

---

## 查询 1: Autopilot V2 设备资格检查

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {deviceId} | 是 | 设备 ID |

### 查询语句

```kql
let deviceId = '{deviceId}';
let lookback = ago(7d);

CheckAutopilotV2EligibilityForDevice(lookback, deviceId)
```

---

## 查询 2: Autopilot V2 注册事件

### 查询语句

```kql
let deviceId = '{deviceId}';
let lookback = ago(7d);

GetAutopilotV2EnrollmentEventsForDevice(lookback, deviceId)
```

---

## 查询 3: Autopilot V2 预配事件

### 查询语句

```kql
let deviceId = '{deviceId}';
let lookback = ago(7d);

GetAutopilotV2ProvisioningEventsForDevice(lookback, deviceId)
```

---

## 查询 4: Autopilot V2 签入会话

### 查询语句

```kql
let intuneDeviceId = '{deviceId}';
let lookback = ago(7d);

GetAutopilotV2CheckinSessionInfoForDevice(lookback, intuneDeviceId)
```

---

## 查询 5: Autopilot V2 Sidecar 安装事件

### 查询语句

```kql
let intuneDeviceId = '{deviceId}';
let lookback = ago(7d);

GetAutopilotV2SidecarInstallEventsForDevice(lookback, intuneDeviceId)
```

---

## 查询 6: Autopilot V2 场景结果

### 查询语句

```kql
let deviceId = '{deviceId}';
let lookback = ago(7d);

GetAutopilotV2ScenarioResultEventsForDevice(lookback, deviceId)
```

---

## 查询 7: 直接查询场景健康状态

### 查询语句

```kql
IntuneScenarioHealth
| where env_time > ago(7d)
| where InstanceId == '{deviceId}'
| where ScenarioType startswith "AutopilotV2"
| extend Scenario = case(
    ScenarioType startswith "AutopilotV2Enrollment/", replace("^AutopilotV2Enrollment/", "", ScenarioType),
    ScenarioType startswith "AutopilotV2/", replace("^AutopilotV2/", "", ScenarioType), 
    ScenarioType)
| project env_time, Scenario, DurationInMs=durationms, Result, ErrorCategory, ErrorDetails
| order by env_time asc
```

---

## 查询 8: Autopilot 通用事件查询

### 查询语句

```kql
IntuneEvent
| where env_time > ago(7d)
| where DeviceId == '{deviceId}' or ActivityId == '{deviceId}'
| where * contains "autopilot"
| project env_time, EventUniqueName, ServiceName, ComponentName, 
    ColMetadata, Col1, Col2, Col3, Col4, Message
| order by env_time asc
```

## 关联查询

- [enrollment.md](./enrollment.md) - 设备注册
- [device-info.md](./device-info.md) - 设备信息

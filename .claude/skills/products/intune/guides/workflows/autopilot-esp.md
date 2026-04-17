# Intune Autopilot ESP 与预配置 — 排查工作流

**来源草稿**: (无)
**Kusto 引用**: autopilot.md
**场景数**: 0
**生成日期**: 2026-04-07

---

## Kusto 查询参考

### 查询 1: Autopilot V2 设备资格检查

```kql
let deviceId = '{deviceId}';
let lookback = ago(7d);

CheckAutopilotV2EligibilityForDevice(lookback, deviceId)
```
`[来源: autopilot.md]`

### 查询 2: Autopilot V2 注册事件

```kql
let deviceId = '{deviceId}';
let lookback = ago(7d);

GetAutopilotV2EnrollmentEventsForDevice(lookback, deviceId)
```
`[来源: autopilot.md]`

### 查询 3: Autopilot V2 预配事件

```kql
let deviceId = '{deviceId}';
let lookback = ago(7d);

GetAutopilotV2ProvisioningEventsForDevice(lookback, deviceId)
```
`[来源: autopilot.md]`

### 查询 4: Autopilot V2 签入会话

```kql
let intuneDeviceId = '{deviceId}';
let lookback = ago(7d);

GetAutopilotV2CheckinSessionInfoForDevice(lookback, intuneDeviceId)
```
`[来源: autopilot.md]`

### 查询 5: Autopilot V2 Sidecar 安装事件

```kql
let intuneDeviceId = '{deviceId}';
let lookback = ago(7d);

GetAutopilotV2SidecarInstallEventsForDevice(lookback, intuneDeviceId)
```
`[来源: autopilot.md]`

### 查询 6: Autopilot V2 场景结果

```kql
let deviceId = '{deviceId}';
let lookback = ago(7d);

GetAutopilotV2ScenarioResultEventsForDevice(lookback, deviceId)
```
`[来源: autopilot.md]`

### 查询 7: 直接查询场景健康状态

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
`[来源: autopilot.md]`

### 查询 8: Autopilot 通用事件查询

```kql
IntuneEvent
| where env_time > ago(7d)
| where DeviceId == '{deviceId}' or ActivityId == '{deviceId}'
| where * contains "autopilot"
| project env_time, EventUniqueName, ServiceName, ComponentName, 
    ColMetadata, Col1, Col2, Col3, Col4, Message
| order by env_time asc
```
`[来源: autopilot.md]`

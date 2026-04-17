# Intune Autopilot ESP 与预配置 — 综合排查指南

**条目数**: 4 | **草稿融合数**: 0 | **Kusto 查询融合**: 1
**Kusto 引用**: autopilot.md
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Kusto 诊断查询

#### autopilot.md
`[工具: Kusto skill — autopilot.md]`

```kql
let deviceId = '{deviceId}';
let lookback = ago(7d);

CheckAutopilotV2EligibilityForDevice(lookback, deviceId)
```

```kql
let deviceId = '{deviceId}';
let lookback = ago(7d);

GetAutopilotV2EnrollmentEventsForDevice(lookback, deviceId)
```

```kql
let deviceId = '{deviceId}';
let lookback = ago(7d);

GetAutopilotV2ProvisioningEventsForDevice(lookback, deviceId)
```

```kql
let intuneDeviceId = '{deviceId}';
let lookback = ago(7d);

GetAutopilotV2CheckinSessionInfoForDevice(lookback, intuneDeviceId)
```

```kql
let intuneDeviceId = '{deviceId}';
let lookback = ago(7d);

GetAutopilotV2SidecarInstallEventsForDevice(lookback, intuneDeviceId)
```

```kql
let deviceId = '{deviceId}';
let lookback = ago(7d);

GetAutopilotV2ScenarioResultEventsForDevice(lookback, deviceId)
```

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

```kql
IntuneEvent
| where env_time > ago(7d)
| where DeviceId == '{deviceId}' or ActivityId == '{deviceId}'
| where * contains "autopilot"
| project env_time, EventUniqueName, ServiceName, ComponentName, 
    ColMetadata, Col1, Col2, Col3, Col4, Message
| order by env_time asc
```


---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Autopilot Pre-Provisioning device shows AzureAdJoined=No and AzurePRT=No in dsregcmd /status afte... | By design: pre-provisioned devices are unjoined from Entra after enrollment. ... | This is expected behavior for Pre-Provisioning. Do not troubleshoot Entra join issues for pre-pro... | 🟢 8.5 | ADO Wiki |
| 2 | Autopilot Pre-Provisioning device shows AzureAdJoined=No and AzurePRT=No in dsregcmd /status afte... | By design: pre-provisioned devices are unjoined from Entra after enrollment. ... | This is expected behavior for Pre-Provisioning. Do not troubleshoot Entra join issues for pre-pro... | 🟢 8.5 | ADO Wiki |
| 3 | HAADJ Autopilot 完成后用户登录 Windows 时出现 Fix your Account 弹窗消息，使用了 SkipUSEResp 预配置模式 | 租户为 Non-Federated（Managed）模式时，HAADJ 注册不会自动完成，需要等待 AADSyncScheduler 将 Intune C... | 1. 如果是 Federated 租户则无此问题（HAADJ registration 自动完成）；2. Non-Federated 租户：等待 30-40 分钟让 AADSync 完成同步后消... | 🟢 8.5 | ADO Wiki |
| 4 | Autopilot Device Preparation (AP-DP) device stuck at 100% during OOBE, deployment does not continue | Known platform issue in AP-DP initial release | End-user needs to manually restart the device for the deployment to continue. Fix is being worked... | 🔵 7.5 | ADO Wiki |

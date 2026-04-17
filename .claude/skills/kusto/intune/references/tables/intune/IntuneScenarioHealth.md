---
name: IntuneScenarioHealth
database: intune
cluster: https://intunecn.chinanorth2.kusto.chinacloudapi.cn
description: Intune 场景健康状态表，记录各场景的执行结果和错误
status: active
columns: 52
related_tables:
  - IntuneEvent
  - DeviceManagementProvider
---

# IntuneScenarioHealth

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://intunecn.chinanorth2.kusto.chinacloudapi.cn |
| 数据库 | intune |
| 列数 | 52 |
| 状态 | ✅ 可用 |

## 用途

记录 Intune 各类场景的执行健康状态，包括 Autopilot、注册、策略应用等场景的执行结果、持续时间、错误信息等。主要用于场景级别的故障诊断和性能分析。

## 关键字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| env_time | datetime | 事件时间 | 2026-01-14T00:00:00Z |
| env_cloud_name | string | 云环境名称 | CNPASU01 |
| ServiceName | string | 服务名称 | DeviceProvisioningService |
| ApplicationName | string | 应用名称 | 服务标识 |
| BuildVersion | string | 构建版本 | 版本号 |
| ScaleUnit | string | 缩放单元 | 服务缩放单元标识 |
| durationms | long | 持续时间(毫秒) | 5000 |
| ScenarioType | string | 场景类型 | AutopilotV2/Enrollment |
| Result | string | 结果 | Success / Failure |
| AccountId | string | Intune 账户 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| ContextId | string | 上下文 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| InstanceId | string | 实例 ID（设备 ID）| xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| ErrorCategory | string | 错误类别 | 错误分类 |
| ErrorDetails | string | 错误详情 | 详细错误信息 |
| CallerContext | string | 调用者上下文 | 调用来源信息 |
| ColMetadata | string | 列元数据 | 动态列说明 |
| Col1-Col6 | string | 动态列 | 根据场景不同而变化 |

## 常用 ScenarioType

| ScenarioType | 说明 |
|--------------|------|
| AutopilotV2/Enrollment | Autopilot V2 注册场景 |
| AutopilotV2/Provisioning | Autopilot V2 预配场景 |
| DeviceEnrollment | 设备注册场景 |
| PolicyDeployment | 策略部署场景 |
| AppDeployment | 应用部署场景 |

## 常用筛选字段

- `InstanceId` - 按设备 ID 筛选
- `AccountId` - 按 Intune 账户筛选
- `ScenarioType` - 按场景类型筛选
- `Result` - 按结果筛选
- `ErrorCategory` - 按错误类别筛选

## 典型应用场景

1. **Autopilot 诊断** - 查询 Autopilot 场景执行结果和错误
2. **注册失败分析** - 分析设备注册场景的失败原因
3. **性能分析** - 通过 durationms 分析场景执行耗时
4. **错误统计** - 统计各类错误的发生频率

## 示例查询

### 查询 Autopilot 场景结果
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

### 查询失败场景
```kql
IntuneScenarioHealth
| where env_time > ago(7d)
| where AccountId == '{accountId}'
| where Result == 'Failure'
| project env_time, InstanceId, ScenarioType, ErrorCategory, ErrorDetails, durationms
| order by env_time desc
```

### 场景成功率统计
```kql
IntuneScenarioHealth
| where env_time > ago(1d)
| where AccountId == '{accountId}'
| summarize 
    Total=count(),
    Success=countif(Result == 'Success'),
    Failure=countif(Result == 'Failure')
    by ScenarioType
| extend SuccessRate = round(100.0 * Success / Total, 2)
| order by SuccessRate asc
```

### 场景耗时分析
```kql
IntuneScenarioHealth
| where env_time > ago(1d)
| where AccountId == '{accountId}'
| where Result == 'Success'
| summarize 
    AvgDuration=avg(durationms),
    MaxDuration=max(durationms),
    P95Duration=percentile(durationms, 95)
    by ScenarioType
| order by AvgDuration desc
```

## 关联表

- [IntuneEvent.md](./IntuneEvent.md) - 详细事件日志
- [DeviceManagementProvider.md](./DeviceManagementProvider.md) - 设备管理详情

## 关联函数

| 函数名 | 说明 |
|--------|------|
| CheckAutopilotV2EligibilityForDevice | Autopilot V2 资格检查 |
| GetAutopilotV2EnrollmentEventsForDevice | Autopilot V2 注册事件 |
| GetAutopilotV2ProvisioningEventsForDevice | Autopilot V2 预配事件 |
| GetAutopilotV2ScenarioResultEventsForDevice | Autopilot V2 场景结果 |

## 注意事项

- 此表记录场景级别的聚合结果，而非详细事件
- `InstanceId` 通常为设备 ID
- Autopilot V2 相关场景可使用内置函数进行查询
- `durationms` 单位为毫秒，可用于性能分析

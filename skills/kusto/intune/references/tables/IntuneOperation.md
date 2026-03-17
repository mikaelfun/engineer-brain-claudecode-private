---
name: IntuneOperation
database: intune
cluster: https://intunecn.chinanorth2.kusto.chinacloudapi.cn
description: Intune 操作表，记录设备同步/签入事件
status: active
columns: 56
related_tables:
  - DeviceManagementProvider
  - IntuneEvent
---

# IntuneOperation

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://intunecn.chinanorth2.kusto.chinacloudapi.cn |
| 数据库 | intune |
| 列数 | 56 |
| 状态 | ✅ 可用 |

## 用途

记录 Intune 操作事件，包括设备同步、签入操作的结果和持续时间。用于分析操作性能和失败原因。

## 关键字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| env_time | datetime | 事件时间 | 2026-01-14T00:00:00Z |
| TenantId | string | 租户 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| AccountId | string | Intune 账户 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| DeviceId | string | 设备 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| UserId | string | 用户 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| operationName | string | 操作名称 | DeviceSync / DeviceCheckin |
| resultType | string | 结果类型 | Success / Failure |
| resultDescription | string | 结果描述 | 详细错误信息 |
| durationMs | long | 持续时间(毫秒) | 1500 |
| ActivityId | string | 活动 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |

## 常用 operationName

| operationName | 说明 |
|---------------|------|
| DeviceSync | 设备同步操作 |
| DeviceCheckin | 设备签入操作 |
| PolicySync | 策略同步 |
| ComplianceCheck | 合规检查 |

## 常用筛选字段

- `DeviceId` - 按设备筛选
- `AccountId` - 按 Intune 账户筛选
- `operationName` - 按操作类型筛选
- `resultType` - 按结果筛选

## 典型应用场景

1. **同步失败诊断** - 查询 resultType='Failure' 分析同步失败原因
2. **性能分析** - 分析 durationMs 了解操作耗时
3. **设备签入状态** - 查询 DeviceCheckin 操作确认设备连接状态
4. **操作统计** - 按操作类型和结果统计成功率

## 示例查询

### 查询设备操作历史
```kql
IntuneOperation
| where env_time > ago(7d)
| where AccountId == '{accountId}'
| where DeviceId contains '{deviceId}'
| project env_time, operationName, resultType, durationMs, resultDescription
| order by env_time desc
```

### 查询失败操作
```kql
IntuneOperation
| where env_time > ago(7d)
| where AccountId == '{accountId}'
| where resultType == 'Failure'
| project env_time, DeviceId, operationName, resultDescription
| order by env_time desc
```

### 操作成功率统计
```kql
IntuneOperation
| where env_time > ago(1d)
| where AccountId == '{accountId}'
| summarize 
    Total=count(), 
    Success=countif(resultType == 'Success'),
    Failure=countif(resultType == 'Failure')
    by operationName
| extend SuccessRate = round(100.0 * Success / Total, 2)
```

### 操作耗时分析
```kql
IntuneOperation
| where env_time > ago(1d)
| where AccountId == '{accountId}'
| where resultType == 'Success'
| summarize 
    AvgDuration=avg(durationMs), 
    MaxDuration=max(durationMs),
    P95Duration=percentile(durationMs, 95)
    by operationName
```

## 关联表

- [DeviceManagementProvider.md](./DeviceManagementProvider.md) - 策略应用详情
- [IntuneEvent.md](./IntuneEvent.md) - 详细事件日志

## 注意事项

- 字段名使用 PascalCase：`AccountId`、`DeviceId`、`UserId`、`TenantId`
- `durationMs` 单位为毫秒
- 可与 `DeviceManagementProvider` 联合查询获取更详细的操作上下文

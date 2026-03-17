---
name: DeviceManagementProvider
database: intune
cluster: https://intunecn.chinanorth2.kusto.chinacloudapi.cn
description: 设备管理提供程序表，记录设备策略应用和合规状态
status: active
columns: 115
related_tables:
  - DeviceLifecycle
  - IntuneEvent
---

# DeviceManagementProvider

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://intunecn.chinanorth2.kusto.chinacloudapi.cn |
| 数据库 | intune |
| 列数 | 115 |
| 状态 | ✅ 可用 |

## 用途

记录设备策略应用状态、合规状态、设备管理事件。是 Intune 最重要的诊断表，包含策略下发、状态报告、错误信息等核心数据。

## 关键字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| env_time | datetime | 事件时间 | 2026-01-14T00:00:00Z |
| deviceId | string | Intune 设备 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| ActivityId | string | 活动 ID（通常等于设备 ID）| xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| name | string | 策略名称 | My Compliance Policy |
| id | string | 策略 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| policyId | string | 策略标识符 | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| typeAndCategory | string | 策略类型和分类 | DeviceConfiguration/Policy |
| applicablilityState | string | 适用性状态 | Applicable / NotApplicable |
| reportComplianceState | string | 合规状态 | Compliant / Error / Pending / NotInstalled |
| EventId | int | 事件 ID | 5786 |
| EventMessage | string | 事件消息 | Policy applied successfully |
| message | string | 详细消息 | JSON 或文本格式详情 |
| tenantContextId | string | 租户上下文 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| tenantId | string | 租户 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| accountId | string | Intune 账户 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| accountContextId | string | 账户上下文 ID (AAD Tenant ID) | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| userId | string | 用户 Object ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| aadDeviceId | string | AAD 设备 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| TaskName | string | 任务名称 | PolicyProcessor |
| appPolicyId | string | 应用策略 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| enforcementType | string | 强制类型 | Required / Available |
| enforcementState | string | 强制状态 | Enforced / NotEnforced |
| errorCode | string | 错误代码 | 0x80070005 |
| platform | string | 平台 | Windows / iOS / Android |
| technology | string | 技术 | MDM / MAM |
| devicePlatformType | string | 设备平台类型 | Windows10 / iOS / Android |

## 常用 EventId

| EventId | 说明 |
|---------|------|
| 5786 | 策略应用状态报告 (Policy Status Report) |
| 5766 | 应用部署事件 (App Deployment Event) |
| 5767 | 应用部署详情 (App Deployment Details) |

## 常用筛选字段

- `deviceId` / `ActivityId` - 按设备筛选
- `accountId` - 按 Intune 账户筛选
- `EventId` - 按事件类型筛选
- `reportComplianceState` - 按合规状态筛选
- `applicablilityState` - 按适用性筛选

## 典型应用场景

1. **策略应用状态查询** - 查看策略在设备上的应用结果
2. **合规状态诊断** - 排查设备不合规原因
3. **应用部署追踪** - 追踪 Win32/LOB 应用安装状态
4. **错误码分析** - 分析策略应用失败原因
5. **设备 Check-in 状态** - 了解设备最近签入情况

## 示例查询

### 查询设备策略状态
```kql
DeviceManagementProvider
| where env_time > ago(7d)
| where ActivityId has '{deviceId}'
| where EventId == 5786
| project env_time, name, id, applicablilityState, reportComplianceState, errorCode
| summarize LastReport=max(env_time) by name, id, applicablilityState, reportComplianceState, errorCode
```

### 查询策略错误
```kql
DeviceManagementProvider
| where env_time > ago(7d)
| where ActivityId has '{deviceId}'
| where reportComplianceState == 'Error' or errorCode != ''
| project env_time, name, id, reportComplianceState, errorCode, message
| order by env_time desc
```

### 查询应用部署事件
```kql
DeviceManagementProvider
| where env_time > ago(7d)
| where ActivityId has '{deviceId}'
| where EventId in (5766, 5767)
| project env_time, name, enforcementType, enforcementState, errorCode, message
| order by env_time desc
```

## 关联表

- [DeviceLifecycle.md](./DeviceLifecycle.md) - 设备生命周期事件
- [IntuneEvent.md](./IntuneEvent.md) - 通用事件日志
- [IntuneOperation.md](./IntuneOperation.md) - 设备操作记录

## 注意事项

- ⚠️ `applicablilityState` 字段名有拼写错误（双 'i'），这是原始 schema 的拼写
- 使用 `has` 而非 `==` 搜索设备 ID，因为 Intune Device ID 和 AAD Device ID 可能不同
- 策略状态报告 (EventId=5786) 是最常用的诊断起点

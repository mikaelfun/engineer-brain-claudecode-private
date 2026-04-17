---
name: DeviceLifecycle
database: intune
cluster: https://intunecn.chinanorth2.kusto.chinacloudapi.cn
description: 设备生命周期表，记录设备注册、状态变更事件
status: active
columns: 93
related_tables:
  - DeviceManagementProvider
  - IOSEnrollmentService
---

# DeviceLifecycle

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://intunecn.chinanorth2.kusto.chinacloudapi.cn |
| 数据库 | intune |
| 列数 | 93 |
| 状态 | ✅ 可用 |

## 用途

记录设备生命周期事件，包括设备注册、注销、状态变更、管理状态转换等。用于排查设备注册失败、设备被移除、设备状态异常等问题。

## 关键字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| env_time | datetime | 事件时间 | 2026-01-14T00:00:00Z |
| deviceId | string | Intune 设备 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| userId | string | 用户 Object ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| tenantId | string | 租户 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| accountId | string | Intune 账户 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| EventId | int | 事件 ID | 46801 |
| type | string | 注册类型（字符串格式）| "3" / "7" / "10" |
| platform | string | 平台代码 | "3" (Windows) / "7" (iPhone) |
| oldManagementState | string | 旧管理状态 | Managed / Unmanaged |
| newManagementState | string | 新管理状态 | Managed / Unmanaged |
| oldRegistrationState | string | 旧注册状态 | Registered / Unregistered |
| newRegistrationState | string | 新注册状态 | Registered / Unregistered |
| details | string | 详细信息（JSON）| {"reason": "..."} |
| ActivityId | string | 活动 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| relatedActivityId2 | string | 关联活动 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |

## 常用 EventId

| EventId | 事件名称 | 说明 |
|---------|----------|------|
| 46801 | EnrollmentAddDeviceEvent | 设备注册成功 |
| 46802 | RenewalSucceeded | MDM 证书续订成功 |
| 46804 | EnrollmentAddDeviceFailedEvent | 设备注册失败 |
| 46806 | EnrollmentStartEvent | 开始注册 |
| 46821 | RegistrationSucceeded | 注册成功 |
| 46822 | DeviceRemoved | 设备被移除 |
| 46825 | DeviceCheckedIn | 设备签入 |

## 注册类型 (type) 映射

| 值 | 类型 | 说明 |
|---|------|------|
| 0 | Unknown | 未知 |
| 1 | User Personal | 用户个人设备 |
| 2 | User Personal with AAD | 用户个人设备 (AAD) |
| 3 | User Corporate | 用户企业设备 |
| 4 | User Corporate with AAD | 用户企业设备 (AAD) |
| 5 | Userless Corporate | 无用户企业设备 |
| 10 | AutoEnrollment | 自动注册 |
| 12 | On Premise Comanaged | 本地 Comanagement |
| 13 | AutoPilot Azure Domain Joined | AutoPilot Azure AD 加入 |

## 平台 (platform) 映射

| 值 | 平台 |
|---|------|
| 3 | Windows 10/11 |
| 7 | iPhone |
| 8 | iPad |
| 10 | macOS |
| 11 | Android |
| 14 | Android for Work |

## 常用筛选字段

- `deviceId` - 按设备 ID 筛选
- `userId` - 按用户筛选
- `accountId` - 按 Intune 账户筛选
- `EventId` - 按事件类型筛选
- `platform` - 按平台筛选

## 典型应用场景

1. **注册失败诊断** - 查看 EventId=46804 分析注册失败原因
2. **设备移除追踪** - 查看 EventId=46822 追踪设备被移除时间和原因
3. **状态变更历史** - 追踪 managementState 和 registrationState 变化
4. **MDM 证书续订** - 查看 EventId=46802 确认证书续订状态
5. **AutoPilot 注册** - 筛选 type=13 查看 AutoPilot 注册事件

## 示例查询

### 查询设备注册历史
```kql
DeviceLifecycle
| where env_time > ago(30d)
| where deviceId has '{deviceId}'
| project env_time, EventId, type, platform, oldManagementState, newManagementState, 
    oldRegistrationState, newRegistrationState, details
| order by env_time desc
```

### 查询注册失败事件
```kql
DeviceLifecycle
| where env_time > ago(7d)
| where accountId == '{accountId}'
| where EventId == 46804
| project env_time, deviceId, userId, details
| order by env_time desc
```

### 查询设备移除事件
```kql
DeviceLifecycle
| where env_time > ago(30d)
| where deviceId has '{deviceId}'
| where EventId == 46822
| project env_time, deviceId, userId, details, oldManagementState, newManagementState
```

### 按平台统计注册
```kql
DeviceLifecycle
| where env_time > ago(7d)
| where accountId == '{accountId}'
| where EventId == 46801
| summarize Count=count() by platform
| extend PlatformName = case(
    platform == "3", "Windows",
    platform == "7", "iPhone",
    platform == "8", "iPad",
    platform == "10", "macOS",
    platform == "11", "Android",
    platform == "14", "Android for Work",
    "Unknown"
)
```

## 关联表

- [DeviceManagementProvider.md](./DeviceManagementProvider.md) - 策略应用状态
- [IOSEnrollmentService.md](./IOSEnrollmentService.md) - iOS ADE 注册详情
- [IntuneEvent.md](./IntuneEvent.md) - 通用事件日志

## 注意事项

- ⚠️ `type` 和 `platform` 字段为字符串类型，值如 "3"、"7" 而非整数
- 注册失败时 details 字段包含失败原因的 JSON 信息
- 设备可能有多个生命周期事件，需按时间排序分析

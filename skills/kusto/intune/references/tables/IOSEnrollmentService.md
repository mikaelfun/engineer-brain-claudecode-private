---
name: IOSEnrollmentService
database: intune
cluster: https://intunecn.chinanorth2.kusto.chinacloudapi.cn
description: iOS 注册服务表，记录 iOS ADE (自动设备注册) 事件
status: active
columns: 90
related_tables:
  - DeviceLifecycle
  - DeviceManagementProvider
---

# IOSEnrollmentService

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://intunecn.chinanorth2.kusto.chinacloudapi.cn |
| 数据库 | intune |
| 列数 | 90 |
| 状态 | ✅ 可用 |

## 用途

记录 iOS 设备的自动设备注册 (ADE/DEP) 事件，包括设备激活、配置文件分配、注册状态等。用于排查 iOS 设备注册问题，特别是 Apple Business Manager 集成场景。

## 关键字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| env_time | datetime | 事件时间 | 2026-01-14T00:00:00Z |
| ActivityId | string | 活动 ID（设备 ID）| xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| userId | string | 用户 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| callerMethod | string | 调用方法 | EnrollDevice / GetProfile |
| message | string | 消息内容 | 详细日志信息 |
| deviceTypeAsString | string | 设备类型字符串 | iPhone / iPad |
| serialNumber | string | 设备序列号 | XXXXXXXXXX |
| siteCode | string | 站点代码 | 用于区分不同服务区域 |
| relatedActivityId2 | string | 关联活动 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |

## 常用 callerMethod

| callerMethod | 说明 |
|--------------|------|
| EnrollDevice | 设备注册 |
| GetProfile | 获取注册配置文件 |
| SyncDevice | 同步设备 |
| AssignProfile | 分配配置文件 |
| ActivateDevice | 激活设备 |

## 常用筛选字段

- `ActivityId` - 按设备 ID 筛选
- `serialNumber` - 按序列号筛选
- `userId` - 按用户筛选
- `callerMethod` - 按操作类型筛选
- `deviceTypeAsString` - 按设备类型筛选

## 典型应用场景

1. **ADE 注册失败诊断** - 追踪注册流程中的错误
2. **配置文件分配问题** - 查看 AssignProfile 操作结果
3. **设备激活追踪** - 追踪设备从 ABM 同步到 Intune 的过程
4. **序列号查找** - 通过序列号定位设备注册历史

## 示例查询

### 查询设备注册事件
```kql
IOSEnrollmentService
| where env_time > ago(7d)
| where ActivityId has '{deviceId}'
| project env_time, callerMethod, message, deviceTypeAsString, serialNumber
| order by env_time desc
```

### 通过序列号查询
```kql
IOSEnrollmentService
| where env_time > ago(30d)
| where serialNumber == '{serialNumber}'
| project env_time, ActivityId, callerMethod, message, deviceTypeAsString
| order by env_time desc
```

### 查询注册失败
```kql
IOSEnrollmentService
| where env_time > ago(7d)
| where message has 'error' or message has 'fail'
| project env_time, ActivityId, serialNumber, callerMethod, message
| order by env_time desc
```

### 按设备类型统计
```kql
IOSEnrollmentService
| where env_time > ago(7d)
| where callerMethod == 'EnrollDevice'
| summarize Count=count() by deviceTypeAsString
```

## 关联表

- [DeviceLifecycle.md](./DeviceLifecycle.md) - 设备生命周期事件
- [DeviceManagementProvider.md](./DeviceManagementProvider.md) - 策略应用状态

## 注意事项

- 此表主要用于 iOS/iPadOS 设备的 ADE 注册场景
- `serialNumber` 是 Apple 设备的唯一标识符
- 注册问题排查通常需要结合 Apple Business Manager 端的日志
- macOS 设备也使用类似的注册流程

---
name: IntuneEvent
database: intune
cluster: https://intunecn.chinanorth2.kusto.chinacloudapi.cn
description: Intune 通用事件日志表，记录 MAM、合规、Check-in 等事件
status: active
columns: 71
related_tables:
  - DeviceManagementProvider
  - HttpSubsystem
---

# IntuneEvent

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://intunecn.chinanorth2.kusto.chinacloudapi.cn |
| 数据库 | intune |
| 列数 | 71 |
| 状态 | ✅ 可用 |

## 用途

记录 Intune 各类事件日志，包括应用安装、MAM 操作、设备 Check-in、合规检查、许可证状态等。是一个综合性日志表，覆盖多种服务组件的事件。

## 关键字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| env_time | datetime | 事件时间 | 2026-01-14T00:00:00Z |
| ActivityId | string | 活动 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| RelatedActivityId | string | 关联活动 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| DeviceId | string | 设备 ID (PascalCase) | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| UserId | string | 用户 Object ID (PascalCase) | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| AccountId | string | Intune 账户 ID (PascalCase) | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| ApplicationName | string | 应用名称 | SideCar |
| ServiceName | string | 服务名称 | StatelessComplianceCalculationService |
| ComponentName | string | 组件名称 | UserProvider / DMSPolicyProcessor |
| EventUniqueName | string | 事件唯一名称 | UpdatePerCheckinProps |
| ColMetadata | string | 列元数据（分号分隔）| key1;key2;key3 |
| Col1-Col6 | string | 动态列数据 | 根据 ColMetadata 解析 |
| Message | string | 消息内容 | 事件详情 |
| env_cloud_name | string | 云环境名称 | CNPASU01 (中国区) |
| cV | string | Correlation Vector | 跨服务追踪 |
| TraceLevel | string | 跟踪级别 | Info / Warning / Error |
| ScenarioInstanceId | string | 场景实例 ID | 用于关联同一场景的事件 |
| PayLoadId | string | 负载 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |

## 常用 EventUniqueName

| EventUniqueName | 说明 |
|-----------------|------|
| UpdatePerCheckinProps | 设备 Check-in 更新属性 |
| GetAction | MAM 获取操作 |
| IsAccountInMaintenance | 账户维护状态检查 |
| GetDeviceIdentityAsync | 获取设备身份（含证书信息）|
| ComplianceDetail-GetComplianceDetailsForDeviceAction-FinalResult | 合规详情最终结果 |
| ComplianceDetail-ComplianceUpdateDevicePatcher-DeviceCompliantChangedDetails | 合规状态变更详情 |
| EffectiveGroupMembershipUpdated | 有效组成员更新 |
| LogUnlicensedUserOutOfGracePeriod | 用户许可证过期超出宽限期 |
| LogUnlicensedUserWithInGracePeriod | 用户在许可证宽限期内 |
| LogNotFoundGetUserResult | 未找到用户 |

## 常用 ServiceName

| ServiceName | 说明 |
|-------------|------|
| StatelessComplianceCalculationService | 合规计算服务 |
| StatelessApplicationManagementService | MAM 服务 |
| GroupingServiceV2BgTaskService | 分组服务 |
| SLDMService | 策略处理器服务 |

## 常用 ComponentName

| ComponentName | 说明 |
|---------------|------|
| SideCar | Win32/LOB 应用安装和管理 |
| UserProvider | 用户许可证信息 |
| DMSPolicyProcessor | 策略处理器 |
| DMSPolicyProcessor_EndProcessingRule | 策略处理结束 |

## 常用筛选字段

- `ActivityId` / `DeviceId` - 按设备筛选
- `UserId` - 按用户筛选
- `AccountId` - 按 Intune 账户筛选
- `EventUniqueName` - 按事件类型筛选
- `ServiceName` / `ComponentName` - 按服务/组件筛选
- `env_cloud_name` - 按云环境筛选

## 典型应用场景

1. **许可证状态诊断** - 查询 UserProvider 组件的许可证事件
2. **MAM 操作追踪** - 查询 StatelessApplicationManagementService 的操作
3. **合规状态变更** - 追踪 ComplianceDetail 相关事件
4. **设备 Check-in 属性** - 查询 UpdatePerCheckinProps 了解签入详情
5. **有效组成员变更** - 追踪 EffectiveGroupMembershipUpdated 事件

## 示例查询

### 查询设备事件
```kql
IntuneEvent
| where env_time > ago(7d)
| where env_cloud_name == 'CNPASU01'
| where ActivityId has '{deviceId}' or DeviceId has '{deviceId}'
| project env_time, ServiceName, ComponentName, EventUniqueName, Message
| order by env_time desc
| take 100
```

### 查询许可证状态
```kql
IntuneEvent
| where env_time > ago(7d)
| where env_cloud_name == 'CNPASU01'
| where ComponentName == 'UserProvider'
| where UserId =~ '{userId}'
| project env_time, EventUniqueName, ColMetadata, Col1, Col2, Col3
```

### 查询合规状态变更
```kql
IntuneEvent
| where env_time > ago(7d)
| where DeviceId has '{deviceId}'
| where EventUniqueName has 'ComplianceDetail'
| project env_time, EventUniqueName, Message, Col1, Col2
| order by env_time desc
```

### 解析动态列
```kql
IntuneEvent
| where env_time > ago(1d)
| where EventUniqueName == 'UpdatePerCheckinProps'
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
```

## 关联表

- [DeviceManagementProvider.md](./DeviceManagementProvider.md) - 策略应用状态
- [HttpSubsystem.md](./HttpSubsystem.md) - MAM HTTP 请求追踪
- [IfxAuditLoggingCommon.md](./IfxAuditLoggingCommon.md) - MSODS 许可证操作

## 注意事项

- ⚠️ 字段名使用 PascalCase：`AccountId`、`DeviceId`、`UserId`（与其他表不同）
- `ColMetadata` 定义了 `Col1-Col6` 的含义，需要动态解析
- 中国区环境使用 `env_cloud_name == 'CNPASU01'` 筛选
- `cV` (Correlation Vector) 可用于跨服务追踪

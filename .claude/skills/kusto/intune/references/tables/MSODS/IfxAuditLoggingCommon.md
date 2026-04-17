---
name: IfxAuditLoggingCommon
database: MSODS
cluster: https://msodsmooncake.chinanorth2.kusto.chinacloudapi.cn
description: MSODS 审计日志表，记录用户许可证操作
status: active
columns: 63
---

# IfxAuditLoggingCommon

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://msodsmooncake.chinanorth2.kusto.chinacloudapi.cn |
| 数据库 | MSODS (大写) |
| 列数 | 63 |
| 状态 | ✅ 可用 |

## 用途

记录 MSODS (Microsoft Online Directory Services) 审计日志，主要用于查询用户许可证分配和变更操作。是许可证问题排查的重要数据源。

## 关键字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| env_time | datetime | 事件时间 | 2026-01-14T00:00:00Z |
| env_ver | string | 版本 | 1.0 |
| env_name | string | 事件名称 | AuditEvent |
| env_cloud_name | string | 云环境 | CNPASU01 |
| operationName | string | 操作名称 | AssignLicense / RemoveLicense |
| operationType | string | 操作类型 | Add / Remove / Update |
| resultType | string | 结果类型 | Success / Failure |
| resultSignature | string | 结果签名 | 错误代码 |
| resultDescription | string | 结果描述 | 详细信息 |
| durationMs | int | 持续时间(毫秒) | 100 |
| callerIpAddress | string | 调用者 IP | 10.0.0.1 |
| targetObjectId | string | 目标对象 ID（用户 Object ID）| xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| targetObjectName | string | 目标对象名称 | user@domain.com |
| internalOperationType | string | 内部操作类型 | LicenseAssignment |
| internalCorrelationId | string | 内部关联 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| contextId | string | 上下文 ID (租户 ID) | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| tenantName | string | 租户名称 | contoso.onmicrosoft.com |
| domainName | string | 域名 | contoso.com |
| correlationId | string | 关联 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| actorContextId | string | 操作者上下文 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| actorObjectId | string | 操作者对象 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |

## 常用 operationName

| operationName | 说明 |
|---------------|------|
| AssignLicense | 分配许可证 |
| RemoveLicense | 移除许可证 |
| UpdateLicense | 更新许可证 |
| EnableService | 启用服务 |
| DisableService | 禁用服务 |

## 常用筛选字段

- `targetObjectId` - 按用户 Object ID 筛选
- `targetObjectName` - 按用户名筛选
- `operationName` - 按操作类型筛选
- `resultType` - 按结果筛选
- `contextId` - 按租户筛选

## 典型应用场景

1. **许可证分配历史** - 查询用户许可证分配记录
2. **许可证问题诊断** - 分析许可证分配失败原因
3. **审计追踪** - 追踪谁在什么时间对许可证做了什么操作
4. **租户级统计** - 统计租户的许可证操作

## 示例查询

### 查询用户许可证操作
```kql
IfxAuditLoggingCommon
| where env_time > ago(30d)
| where targetObjectId == '{userId}'
| where operationName has 'license'
| project env_time, operationName, operationType, resultType, 
    internalOperationType, internalCorrelationId, contextId, 
    targetObjectId, targetObjectName
| order by env_time desc
```

### 查询许可证分配失败
```kql
IfxAuditLoggingCommon
| where env_time > ago(7d)
| where operationName has 'license'
| where resultType != 'Success'
| project env_time, targetObjectName, operationName, resultType, resultDescription
| order by env_time desc
```

### 按租户统计许可证操作
```kql
IfxAuditLoggingCommon
| where env_time > ago(1d)
| where operationName has 'license'
| summarize 
    Total=count(),
    Success=countif(resultType == 'Success'),
    Failure=countif(resultType != 'Success')
    by tenantName
```

### 查询特定时间段的许可证变更
```kql
IfxAuditLoggingCommon
| where env_time between(datetime({startTime})..datetime({endTime}))
| where targetObjectId == '{userId}'
| where operationName has 'license'
| project env_time, operationName, operationType, resultType, actorObjectId
| order by env_time asc
```

## 关联表

- [IntuneEvent.md](./IntuneEvent.md) - Intune 许可证事件（UserProvider 组件）

## 注意事项

- ⚠️ 数据库名称为大写 `MSODS`，不是 `msods`
- 此表在 MSODS 集群，与 Intune 集群分开
- `targetObjectId` 是用户的 AAD Object ID
- 可与 Intune 的 `IntuneEvent` 表（UserProvider 组件）关联分析许可证问题
- `actorObjectId` 可追踪是谁执行了许可证操作（用于审计）

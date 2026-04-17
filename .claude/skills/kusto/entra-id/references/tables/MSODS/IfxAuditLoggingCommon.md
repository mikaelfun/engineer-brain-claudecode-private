---
name: IfxAuditLoggingCommon
database: MSODS
cluster: https://msodsmooncake.chinanorth2.kusto.chinacloudapi.cn
description: MSODS 目录对象审计日志表，记录用户、组、设备等对象的增删改操作
status: active
---

# IfxAuditLoggingCommon

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://msodsmooncake.chinanorth2.kusto.chinacloudapi.cn |
| 数据库 | MSODS |
| 状态 | ✅ 可用 |

## 用途

MSODS (Microsoft Online Directory Services) 目录对象审计日志表，用于：
- 目录对象增删改查审计
- 合规性审查
- 权限变更追踪
- 用户/组/设备操作历史查询

## 关键字段

### 操作信息字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| env_time | datetime | 事件时间戳 | 2026-01-01T00:00:00Z |
| operationName | string | 操作名称 | Add user, Delete group, Update device |
| operationType | string | 操作类型 | Create, Delete, Update, Patch |
| resultType | string | 结果类型 | Success, Failure, PartialSuccess |
| durationMs | int | 操作耗时（毫秒） | 150 |

### 目标对象字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| targetObjectId | string | 被操作的对象 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| targetObjectName | string | 目标对象名称 | user@contoso.com |
| resourceId | string | 资源 ID | - |
| resourceType | string | 资源类型 | user, group, device, servicePrincipal |

### 执行者信息字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| actorObjectId | string | 执行操作的用户/服务主体 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| actorContextId | string | 执行者租户 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| actorIdentityType | string | 执行者身份类型 | User, ServicePrincipal, ManagedIdentity |

### 上下文字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| contextId | string | 上下文租户 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| tenantName | string | 租户名称 | contoso.onmicrosoft.com |
| domainName | string | 域名 | contoso.com |
| internalCorrelationId | string | 内部关联 ID | - |
| internalOperationType | string | 内部操作类型 | - |
| correlationId | string | 关联 ID | - |

### 其他字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| callerIpAddress | string | 调用者 IP 地址 |
| clientIpAddress | string | 客户端 IP 地址 |
| scaleUnit | string | 规模单元 |
| azureRegion | string | Azure 区域 |
| ja4Signature | string | JA4 签名 |

## 常见操作名称

| 操作名称 | 说明 |
|---------|------|
| Add user | 添加用户 |
| Delete user | 删除用户 |
| Update user | 更新用户 |
| Add group member | 添加组成员 |
| Remove group member | 移除组成员 |
| Add owner to group | 添加组所有者 |
| Remove owner from group | 移除组所有者 |
| Reset user password | 重置用户密码 |
| Add device | 添加设备 |
| Delete device | 删除设备 |
| Update device | 更新设备 |
| Add service principal | 添加服务主体 |
| Update application | 更新应用程序 |
| Update authorization policy | 更新授权策略 |

## 常用筛选字段

- `env_time` - 按时间筛选
- `targetObjectId` - 按目标对象 ID 查询
- `actorObjectId` - 按执行者查询
- `operationName` - 按操作类型筛选
- `actorContextId` - 按租户筛选
- `resultType` - 按结果筛选

## 典型应用场景

1. **用户删除追踪**: 查询谁删除了特定用户
2. **权限变更审计**: 追踪组成员或角色变更
3. **密码重置审计**: 查询密码重置操作历史
4. **设备注册问题**: 查询设备添加/删除操作

## 示例查询

### 基础审计查询

```kql
cluster('msodsmooncake.chinanorth2.kusto.chinacloudapi.cn').database('MSODS').IfxAuditLoggingCommon
| where env_time > ago(1d)
| where * contains "{objectId}"
| project env_time, tenantName, operationName, targetObjectId, actorObjectId, resultType
| order by env_time asc
```

### 按操作类型查询

```kql
IfxAuditLoggingCommon
| where env_time between(datetime({startTime})..datetime({endTime}))
| where * has '{objectId}'
| where operationName has '{operationName}'
| where actorContextId has '{tenantId}'
| take 1000
| project env_time, env_seqNum, operationName, operationType, resultType,
    targetObjectId, actorObjectId, resourceId, resourceType, contextId,
    targetObjectName, internalOperationType, internalCorrelationId,
    env_appId, actorIdentityType
| order by env_time asc
```

### 按 internalCorrelationId 查询

```kql
IfxAuditLoggingCommon
| where internalCorrelationId == "{correlationId}"
| project env_time, operationName, resultType, targetObjectId, actorObjectId
```

## 关联表

- [IfxUlsEvents.md](./IfxUlsEvents.md) - 内部操作事件日志
- [IfxBECAuthorizationManager.md](./IfxBECAuthorizationManager.md) - 授权管理日志

## 注意事项

- 📊 **日志保留期**: 约 30 天
- ⏱️ **推荐时间范围**: 审计场景建议 7-30 天
- 🔍 **索引字段**: targetObjectId, actorObjectId, internalCorrelationId

---

> 文档版本: 1.0  
> 最后更新: 2026-01-14  
> 数据来源: .show table IfxAuditLoggingCommon schema as json

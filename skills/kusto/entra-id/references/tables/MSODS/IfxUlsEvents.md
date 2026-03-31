---
name: IfxUlsEvents
database: MSODS
cluster: https://msodsmooncake.chinanorth2.kusto.chinacloudapi.cn
description: MSODS 内部操作事件日志表，记录 AAD Connect 同步、cmdlet 操作、Graph API 调用等
status: active
---

# IfxUlsEvents

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://msodsmooncake.chinanorth2.kusto.chinacloudapi.cn |
| 数据库 | MSODS |
| 状态 | ✅ 可用 |

## 用途

MSODS 内部操作事件日志表，用于：
- AAD Connect 同步诊断
- cmdlet 操作追踪
- Graph API 调用分析
- REST API 操作追踪
- 组许可证分配 (GBL) 问题排查

## 关键字段

### 标识字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| env_time | datetime | 事件时间戳 | 2026-01-01T00:00:00Z |
| env_cloud_role | string | 云角色（标识操作来源） | becwebservice, restdirectoryservice |
| correlationId | string | 关联 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| internalCorrelationId | string | 内部关联 ID | - |
| contextId | string | 租户 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |

### 操作信息字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| operationName | string | 操作名称 | - |
| operationType | string | 操作类型 | - |
| internalOperationType | string | 内部操作类型 | - |
| resultType | string | 结果类型 | Success, Failure |
| message | string | 事件消息（包含详细操作上下文） | 详细的操作信息 |
| tagId | string | 标签 ID | 03jo, 0jlv |

### 对象信息字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| resourceId | string | 资源 ID | - |
| resourceType | string | 资源类型 | - |
| objectId | string | 对象 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| objectClass | string | 对象类 | User, Group, Device |
| userPrincipalName | string | 用户主体名称 | user@contoso.com |

### 上下文字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| tenantName | string | 租户名称 |
| domainName | string | 域名 |
| processName | string | 进程名称 |
| scaleUnit | string | 规模单元 |
| azureRegion | string | Azure 区域 |

## 云角色映射 (env_cloud_role)

| 角色值 | 操作来源 | 说明 |
|--------|---------|------|
| `becwebservice` | MSOL cmdlets, O365 Portal | PowerShell MSOnline 模块和 O365 管理门户操作 |
| `restdirectoryservice` | AAD cmdlets, Graph API | AzureAD 模块和 Microsoft Graph API 调用 |
| `adminwebservice` | AAD Connect | Azure AD Connect 同步服务配置 |
| `msods-syncservice` | Back Sync / Forward Sync | 目录同步服务（前向同步到 AAD，后向同步到本地） |

## 常用筛选字段

- `env_time` - 按时间筛选
- `env_cloud_role` - 按云角色筛选
- `contextId` - 按租户 ID 筛选
- `correlationId` - 按关联 ID 查询
- `objectId` - 按对象 ID 查询
- `message` - 按消息内容搜索
- `tagId` - 按标签 ID 筛选

## 典型应用场景

1. **AAD Connect 同步问题**: 过滤 `env_cloud_role == "msods-syncservice"` 或 `env_cloud_role == "adminwebservice"`
2. **Graph API 调用问题**: 过滤 `env_cloud_role == "restdirectoryservice"`
3. **PowerShell MSOnline 模块问题**: 过滤 `env_cloud_role == "becwebservice"`
4. **组操作追踪**: 使用 tagId 和 message 包含 "Group"
5. **配额使用查询**: 搜索 message 包含 "quotaused"

## 示例查询

### 基础查询

```kql
cluster('msodsmooncake.chinanorth2.kusto.chinacloudapi.cn').database('MSODS').IfxUlsEvents
| where env_time between(datetime({startTime})..datetime({endTime}))
| where * contains "{objectId}"
| project env_time, env_cloud_role, env_cloud_environment, message, internalCorrelationId, tagId, internalOperationType
```

### AAD Connect 同步事件统计

```kql
IfxUlsEvents
| where env_time between(datetime({startTime})..datetime({endTime}))
| where * has '{tenantId}'
| where env_cloud_role in ('msods-syncservice', 'adminwebservice')
| summarize 
    EventCount = count(),
    FirstEventTime = min(env_time),
    LastEventTime = max(env_time)
    by env_cloud_role
| order by EventCount desc
```

### AAD Connect 同步详细事件

```kql
IfxUlsEvents
| where env_time between(datetime({startTime})..datetime({endTime}))
| where * has '{tenantId}'
| where env_cloud_role == 'msods-syncservice'
| project env_time, correlationId, internalOperationType, message
| order by env_time desc
| take 50
```

### 组删除操作查询

```kql
IfxUlsEvents
| where env_time > ago(1h)
| where env_cloud_role == "restdirectoryservice"
| where tagId == "03jo"
| where * contains "Group"
| where * contains "StackResponseProcessing:DELETE"
| where * contains "{groupId}"
| project env_time, env_cloud_role, env_cloud_environment, message, internalCorrelationId, tagId
```

### 组恢复操作查询

```kql
IfxUlsEvents
| where env_time > ago(1h)
| where env_cloud_role == "restdirectoryservice"
| where tagId == "03jo"
| where * contains "StackResponseProcessing:POST"
| where * contains "Microsoft.DirectoryServices.restore"
| where * contains "{groupId}"
| project env_time, env_cloud_role, env_cloud_environment, message, internalCorrelationId, tagId
```

### 查看配额使用情况

```kql
IfxUlsEvents
| where env_time > ago(20m)
| where message contains "{tenantId}" and message contains "quotaused"
| parse message with * "PartitionId=" PartitionId "," *
| parse message with * "QuotaUsedCache: " QuotaUsed ";" *
| project env_time, PartitionId, QuotaUsed
| order by env_time desc
| take 1
```

### 按 CorrelationId 查询所有相关事件

```kql
let start = datetime("{startTime}");
let end = datetime("{endTime}");
let CorrelationId = "{correlationId}";
let firstPass = find in (IfxUlsEvents) where env_time >= start and env_time <= end and * contains CorrelationId;
let cidsToSearch = toscalar(firstPass | summarize makeset(internalCorrelationId)); 
find in (IfxUlsEvents) where env_time >= start and env_time <= end and internalCorrelationId in (cidsToSearch);
```

## 关联表

- [IfxAuditLoggingCommon.md](./IfxAuditLoggingCommon.md) - 目录对象审计日志
- [IfxBECAuthorizationManager.md](./IfxBECAuthorizationManager.md) - 授权管理日志

## 注意事项

- 📊 **日志保留期**: 约 30 天
- ⏱️ **推荐时间范围**: 同步问题建议 1-7 天
- 🔍 **message 字段搜索**: 使用 `has` 而非 `contains` 提升性能
- 📝 **常见同步操作**:
  - `Publish-ProvisionedPlan`: 发布配置计划
  - `Publisher::PublishProvisionedPlans`: 发布租户配置
  - `Publisher::Publish`: 发布对象更改
  - `An exception was thrown`: 同步异常

---

> 文档版本: 1.0  
> 最后更新: 2026-01-14  
> 数据来源: .show table IfxUlsEvents schema as json

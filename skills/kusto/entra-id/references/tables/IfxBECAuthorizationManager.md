---
name: IfxBECAuthorizationManager
database: MSODS
cluster: https://msodsmooncake.chinanorth2.kusto.chinacloudapi.cn
description: MSODS 授权管理日志表，记录权限和授权事件
status: active
---

# IfxBECAuthorizationManager

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://msodsmooncake.chinanorth2.kusto.chinacloudapi.cn |
| 数据库 | MSODS |
| 状态 | ✅ 可用 |

## 用途

MSODS 授权管理日志表，用于：
- 查询权限和授权事件
- 诊断权限被拒绝问题
- 分析应用授权状态
- 追踪角色和范围声明

## 关键字段

### 标识字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| env_time | datetime | 事件时间戳 | 2026-01-01T00:00:00Z |
| internalCorrelationId | string | 内部关联 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| correlationId | string | 关联 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| contextId | string | 租户 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |

### 授权信息字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| result | string | 授权结果 | DENIED, ALLOWED |
| task | string | 任务类型 | - |
| flow | string | 流程 | - |
| action | string | 操作 | - |
| enforcementType | string | 执行类型 | - |

### 身份信息字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| userObjectId | string | 用户对象 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| applicationId | string | 应用程序 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| servicePrincipalObjectId | string | 服务主体对象 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |

### 权限字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| scopeClaim | string | 权限范围声明 | Directory.Read.All |
| roleClaims | string | 角色声明 | - |
| isUserGrantedAccess | string | 用户是否被授权 | true, false |
| isAppGrantedAccess | string | 应用是否被授权 | true, false |
| isCustomRoleEnabled | bool | 是否启用自定义角色 | true, false |
| requestedProperties | string | 请求的属性 | - |

### 上下文字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| tenantName | string | 租户名称 |
| domainName | string | 域名 |
| parameters | string | 参数 |
| scaleUnit | string | 规模单元 |
| azureRegion | string | Azure 区域 |

## 常用筛选字段

- `env_time` - 按时间筛选
- `internalCorrelationId` - 按内部关联 ID 查询
- `userObjectId` - 按用户对象 ID 查询
- `contextId` - 按租户 ID 查询
- `result` - 按授权结果筛选（DENIED/ALLOWED）

## 典型应用场景

1. **权限被拒绝诊断**: 过滤 `result == "DENIED"` 查看被拒绝的请求
2. **应用授权分析**: 查询特定应用的授权状态
3. **用户权限追踪**: 追踪用户的权限范围

## 示例查询

### 基础查询

```kql
cluster('msodsmooncake.chinanorth2.kusto.chinacloudapi.cn').database('MSODS').IfxBECAuthorizationManager
| where env_time > ago(1d)
| where internalCorrelationId == "{correlationId}"
| project env_time, task, result, contextId, userObjectId, scopeClaim
```

### 查询被拒绝的授权

```kql
IfxBECAuthorizationManager
| where env_time between(datetime({startTime})..datetime({endTime}))
| where userObjectId == "{userId}"
| where result == "DENIED"
| project env_time, task, result, scopeClaim, applicationId, isAppGrantedAccess
```

### 按租户查询授权事件

```kql
IfxBECAuthorizationManager
| where env_time > ago(1h)
| where contextId == "{tenantId}"
| summarize 
    AllowedCount = countif(result == "ALLOWED"),
    DeniedCount = countif(result == "DENIED")
    by task
| order by DeniedCount desc
```

## 关联表

- [IfxAuditLoggingCommon.md](./IfxAuditLoggingCommon.md) - 目录对象审计日志
- [IfxUlsEvents.md](./IfxUlsEvents.md) - 内部操作事件日志

## 注意事项

- 📊 **日志保留期**: 约 30 天
- 🔍 **关键字段**: result 字段值为 "DENIED" 或 "ALLOWED"
- 📝 **授权诊断**: 使用 scopeClaim 和 roleClaims 了解权限详情

---

> 文档版本: 1.0  
> 最后更新: 2026-01-14  
> 数据来源: .show table IfxBECAuthorizationManager schema as json

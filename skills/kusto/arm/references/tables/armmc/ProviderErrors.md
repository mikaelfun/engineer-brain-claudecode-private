---
name: ProviderErrors
database: armmc
cluster: https://armmcadx.chinaeast2.kusto.chinacloudapi.cn
description: 资源提供程序返回的错误
status: active
related_tables:
  - HttpOutgoingRequests
  - Errors
schema_verified: 2026-01-14
---

# ProviderErrors

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 (Mooncake) | https://armmcadx.chinaeast2.kusto.chinacloudapi.cn |
| 集群 (Public) | https://armprodgbl.eastus.kusto.windows.net (使用 Unionizer) |
| 数据库 | armmc / ARMProd |
| 状态 | ✅ 可用 |
| Schema 验证时间 | 2026-01-14 |

## 用途

记录资源提供程序（RP）返回给 ARM 的错误信息。用于诊断 RP 层面的问题、分析错误模式。

## 完整字段列表

| 字段名 | 类型 | 说明 |
|--------|------|------|
| TIMESTAMP | datetime | 错误时间 |
| PreciseTimeStamp | datetime | 精确时间戳 |
| Deployment | string | 部署实例 |
| Role | string | 角色 |
| RoleInstance | string | 角色实例 |
| Level | long | ETW 日志级别 |
| ProviderGuid | string | 提供程序 GUID |
| ProviderName | string | 提供程序名称 |
| EventId | long | 事件 ID |
| Pid | long | 进程 ID |
| Tid | long | 线程 ID |
| TaskName | string | 任务名称 |
| subscriptionId | string | 订阅 ID |
| correlationId | string | 关联 ID |
| operationName | string | 操作名称 |
| tenantId | string | 租户 ID |
| providerNamespace | string | 资源提供程序命名空间 |
| resourceType | string | 资源类型 |
| hostName | string | 主机名 |
| message | string | 错误消息 |
| exception | string | 异常信息 |
| additionalProperties | string | 附加属性 |
| principalOid | string | 主体对象 ID |
| SourceNamespace | string | 源命名空间 |
| SourceMoniker | string | 源标识 |
| SourceVersion | string | 源版本 |
| RoleLocation | string | 角色位置 |
| ReleaseVersion | string | 发布版本 |
| dataBoundary | string | 数据边界 |

## 常用筛选字段

- `subscriptionId` - 按订阅筛选
- `correlationId` - 按关联 ID 筛选
- `providerNamespace` - 按资源提供程序筛选
- `message` - 按错误消息筛选
- `TIMESTAMP` - 按时间筛选

## 典型应用场景

1. **诊断 RP 层错误** - 查看具体的 RP 错误详情
2. **分析错误模式** - 统计常见错误类型
3. **追踪特定操作的错误** - 使用 correlationId 关联

## 示例查询

### 按订阅查询 RP 错误
```kql
cluster('armmcadx.chinaeast2').database('armmc').ProviderErrors
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| project TIMESTAMP, providerNamespace, resourceType, operationName, message
| order by TIMESTAMP desc
```

### 统计 RP 错误分布
```kql
cluster('armmcadx.chinaeast2').database('armmc').ProviderErrors
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| summarize count() by providerNamespace, resourceType
| order by count_ desc
```

### 按 correlationId 查询
```kql
cluster('armmcadx.chinaeast2').database('armmc').ProviderErrors
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where correlationId == "{correlationId}"
| project TIMESTAMP, providerNamespace, resourceType, message, exception
| order by TIMESTAMP asc
```

### Public Cloud 查询（使用 Unionizer）
```kql
cluster('armprodgbl.eastus').database('ARMProd').Unionizer("Providers","ProviderErrors")
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| project TIMESTAMP, providerNamespace, message
| order by TIMESTAMP desc
```

## 关联表

- [HttpOutgoingRequests.md](./HttpOutgoingRequests.md) - ARM 到 RP 的请求
- [Errors.md](./Errors.md) - ARM 系统错误

## 注意事项

- `message` 和 `exception` 包含详细错误信息
- 可结合 HttpOutgoingRequests 的 ActivityId 追踪到 RP 日志
- Public Cloud 使用 `Unionizer("Providers","ProviderErrors")` 查询

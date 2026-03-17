---
name: Errors
database: armmc
cluster: https://armmcadx.chinaeast2.kusto.chinacloudapi.cn
description: ARM 系统错误日志
status: active
related_tables:
  - Traces
  - ProviderErrors
schema_verified: 2026-01-14
---

# Errors

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 (Mooncake) | https://armmcadx.chinaeast2.kusto.chinacloudapi.cn |
| 集群 (Public) | https://armprodgbl.eastus.kusto.windows.net (使用 Unionizer) |
| 数据库 | armmc / ARMProd |
| 状态 | ✅ 可用 |
| Schema 验证时间 | 2026-01-14 |

## 用途

记录 ARM 系统层面的错误日志。用于诊断 ARM 内部错误、系统异常。

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
| principalOid | string | 主体对象 ID |
| message | string | 错误消息 |
| exception | string | 异常信息 |
| additionalProperties | string | 附加属性 |
| SourceNamespace | string | 源命名空间 |
| SourceMoniker | string | 源标识 |
| SourceVersion | string | 源版本 |
| RoleLocation | string | 角色位置 |
| ReleaseVersion | string | 发布版本 |
| principalPuid | string | 主体 PUID |

## 示例查询

### 按 correlationId 查询
```kql
cluster('armmcadx.chinaeast2').database('armmc').Errors
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where correlationId == "{correlationId}"
| project TIMESTAMP, operationName, message, exception
| order by TIMESTAMP asc
```

### 按订阅查询
```kql
cluster('armmcadx.chinaeast2').database('armmc').Errors
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| project TIMESTAMP, operationName, message
| order by TIMESTAMP desc
| take 100
```

### Public Cloud 查询
```kql
cluster('armprodgbl.eastus').database('ARMProd').Unionizer("Traces","Errors")
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where correlationId == "{correlationId}"
| project TIMESTAMP, operationName, message
```

## 关联表

- [Traces.md](./Traces.md) - ARM 追踪日志
- [ProviderErrors.md](./ProviderErrors.md) - RP 错误

## 注意事项

- 此表记录 ARM 系统错误，RP 错误在 ProviderErrors 表
- Public Cloud 使用 `Unionizer("Traces","Errors")` 查询

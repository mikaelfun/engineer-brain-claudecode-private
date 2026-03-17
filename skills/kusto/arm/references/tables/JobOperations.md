---
name: JobOperations
database: armmc
cluster: https://armmcadx.chinaeast2.kusto.chinacloudapi.cn
description: ARM 后台作业操作日志
status: active
related_tables:
  - EventServiceEntries
schema_verified: 2026-01-14
---

# JobOperations

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 (Mooncake) | https://armmcadx.chinaeast2.kusto.chinacloudapi.cn |
| 集群 (Public) | https://armprodgbl.eastus.kusto.windows.net (使用 Unionizer) |
| 数据库 | armmc / ARMProd |
| 状态 | ✅ 可用 |
| Schema 验证时间 | 2026-01-14 |

## 用途

记录 ARM 后台作业的操作日志。用于追踪异步操作的执行状态、排查后台作业失败。

## 完整字段列表

| 字段名 | 类型 | 说明 |
|--------|------|------|
| TIMESTAMP | datetime | 时间戳 |
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
| jobPartition | string | 作业分区 |
| jobId | string | 作业 ID |
| tenantId | string | 租户 ID |
| message | string | 消息 |
| exception | string | 异常信息 |
| additionalProperties | string | 附加属性 |
| SourceNamespace | string | 源命名空间 |
| SourceMoniker | string | 源标识 |
| SourceVersion | string | 源版本 |
| RoleLocation | string | 角色位置 |
| ReleaseVersion | string | 发布版本 |
| dataBoundary | string | 数据边界 |

## 常用筛选字段

- `subscriptionId` - 按订阅筛选
- `correlationId` - 按关联 ID 筛选
- `jobId` - 按作业 ID 筛选
- `TIMESTAMP` - 按时间筛选

## 典型应用场景

1. **追踪异步操作** - 查看后台作业执行状态
2. **排查作业失败** - 分析异常信息
3. **关联完整操作链** - 使用 correlationId 关联

## 示例查询

### 按 correlationId 查询
```kql
cluster('armmcadx.chinaeast2').database('armmc').JobOperations
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where correlationId == "{correlationId}"
| project TIMESTAMP, jobId, operationName, message, exception
| order by TIMESTAMP asc
```

### 按作业 ID 查询
```kql
cluster('armmcadx.chinaeast2').database('armmc').JobOperations
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where jobId == "{jobId}"
| project TIMESTAMP, operationName, message
| order by TIMESTAMP asc
```

### Public Cloud 查询
```kql
cluster('armprodgbl.eastus').database('ARMProd').Unionizer("Jobs","JobOperations")
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where correlationId == "{correlationId}"
| project TIMESTAMP, jobId, message
```

## 关联表

- [EventServiceEntries.md](./EventServiceEntries.md) - 操作事件

## 注意事项

- 后台作业用于处理异步操作
- `jobId` 可用于追踪特定作业的完整执行过程
- Public Cloud 使用 `Unionizer("Jobs","JobOperations")` 查询

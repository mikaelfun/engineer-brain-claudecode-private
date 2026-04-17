---
name: JobErrors
database: armmc
cluster: https://armmcadx.chinaeast2.kusto.chinacloudapi.cn
description: ARM 后台作业错误日志
status: active
related_tables:
  - JobOperations
  - Errors
schema_verified: 2026-01-14
---

# JobErrors

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 (Mooncake) | https://armmcadx.chinaeast2.kusto.chinacloudapi.cn |
| 集群 (Public) | https://armprodgbl.eastus.kusto.windows.net (使用 Unionizer) |
| 数据库 | armmc / ARMProd |
| 状态 | ✅ 可用 |
| Schema 验证时间 | 2026-01-14 |

## 用途

记录 ARM 后台作业执行过程中的错误。用于诊断异步操作失败、排查后台作业问题。

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
| ActivityId | string | 活动 ID |
| subscriptionId | string | 订阅 ID |
| correlationId | string | 关联 ID |
| principalOid | string | 主体对象 ID |
| principalPuid | string | 主体 PUID |
| tenantId | string | 租户 ID |
| operationName | string | 操作名称 |
| jobPartition | string | 作业分区 |
| jobId | string | 作业 ID |
| message | string | 错误消息 |
| exception | string | 异常信息 |
| SourceNamespace | string | 源命名空间 |
| SourceMoniker | string | 源标识 |
| SourceVersion | string | 源版本 |
| organizationId | string | 组织 ID |
| activityVector | string | 活动向量 |
| realPuid | string | 真实 PUID |
| altSecId | string | 备用安全 ID |
| additionalProperties | string | 附加属性 |
| RoleLocation | string | 角色位置 |
| ReleaseVersion | string | 发布版本 |
| Stamp | string | 戳记 |
| ClusterName | string | 集群名称 |
| MonitoringApplication | string | 监控应用 |
| LocationId | string | 位置 ID |
| ProviderNamespace | string | 提供程序命名空间 |
| body | string | 消息体 |
| env_name | string | 环境名称 |
| env_time | datetime | 环境时间 |
| env_ver | string | 环境版本 |
| name | string | 名称 |
| severityNumber | long | 严重性编号 |
| severityText | string | 严重性文本 |

## 常用筛选字段

- `subscriptionId` - 按订阅筛选
- `correlationId` - 按关联 ID 筛选
- `jobId` - 按作业 ID 筛选
- `operationName` - 按操作名称筛选
- `message` - 按错误消息筛选
- `TIMESTAMP` - 按时间筛选

## 典型应用场景

1. **诊断后台作业失败** - 分析 message、exception
2. **追踪异步操作错误** - 使用 jobId 关联 JobOperations
3. **统计作业错误分布** - 按 operationName 统计
4. **关联完整操作链** - 使用 correlationId

## 示例查询

### 按 correlationId 查询作业错误
```kql
cluster('armmcadx.chinaeast2').database('armmc').JobErrors
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where correlationId == "{correlationId}"
| project TIMESTAMP, jobId, operationName, message, exception
| order by TIMESTAMP asc
```

### 按作业 ID 查询错误
```kql
cluster('armmcadx.chinaeast2').database('armmc').JobErrors
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where jobId == "{jobId}"
| project TIMESTAMP, operationName, message, exception
| order by TIMESTAMP asc
```

### 按订阅统计作业错误
```kql
cluster('armmcadx.chinaeast2').database('armmc').JobErrors
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| summarize count() by operationName
| order by count_ desc
```

### Public Cloud 查询
```kql
cluster('armprodgbl.eastus').database('ARMProd').Unionizer("Jobs","JobErrors")
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where correlationId == "{correlationId}"
| project TIMESTAMP, jobId, message
```

## 关联表

- [JobOperations.md](./JobOperations.md) - 作业操作日志
- [Errors.md](./Errors.md) - ARM 系统错误

## 注意事项

- 后台作业用于处理异步操作（如长时间运行的部署）
- `jobId` 可用于追踪特定作业的完整执行过程
- `exception` 包含详细的异常堆栈信息
- 与 JobOperations 表配合使用可获得完整的作业执行视图
- Public Cloud 使用 `Unionizer("Jobs","JobErrors")` 查询

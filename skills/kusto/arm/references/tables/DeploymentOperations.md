---
name: DeploymentOperations
database: armmc
cluster: https://armmcadx.chinaeast2.kusto.chinacloudapi.cn
description: ARM 模板部署操作详情
status: active
related_tables:
  - Deployments
  - EventServiceEntries
schema_verified: 2026-01-14
---

# DeploymentOperations

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 (Mooncake) | https://armmcadx.chinaeast2.kusto.chinacloudapi.cn |
| 集群 (Public) | https://armprodgbl.eastus.kusto.windows.net (使用 Unionizer) |
| 数据库 | armmc / ARMProd |
| 状态 | ✅ 可用 |
| Schema 验证时间 | 2026-01-14 |

## 用途

记录 ARM 模板部署中每个资源操作的详细信息。用于追踪部署进度、诊断部署失败、分析资源创建顺序。

## 完整字段列表

| 字段名 | 类型 | 说明 |
|--------|------|------|
| TIMESTAMP | datetime | 操作时间 |
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
| operationId | string | 操作 ID |
| deploymentName | string | 部署名称 |
| deploymentSequenceId | string | 部署序列 ID |
| resourceGroupName | string | 资源组名称 |
| resourceGroupLocation | string | 资源组位置 |
| deploymentScope | string | 部署范围 |
| tenantId | string | 租户 ID |
| providerNamespace | string | 资源提供程序命名空间 |
| resourceType | string | 资源类型 |
| resourceName | string | 资源名称 |
| resourceLocation | string | 资源位置 |
| resourceId | string | 资源完整 ID |
| startTime | string | 操作开始时间 |
| endTime | string | 操作结束时间 |
| durationInMilliseconds | real | 操作耗时（毫秒） |
| executionStatus | string | 执行状态 |
| statusCode | string | 状态代码 |
| statusMessage | string | 状态消息（包含错误详情） |
| apiVersion | string | API 版本 |
| httpMethod | string | HTTP 方法 |
| hasErrorDetails | long | 是否有错误详情 |
| isExtensionResource | long | 是否是扩展资源 |
| isChildResource | long | 是否是子资源 |
| dependencyCount | long | 依赖数 |
| expressionDependencyCount | long | 表达式依赖数 |
| nestedDeploymentName | string | 嵌套部署名称 |
| userAgent | string | 用户代理 |
| SourceNamespace | string | 源命名空间 |
| SourceMoniker | string | 源标识 |
| SourceVersion | string | 源版本 |
| RoleLocation | string | 角色位置 |
| ReleaseVersion | string | 发布版本 |
| isAsyncOperation | long | 是否异步操作 |
| retryAfterInSeconds | long | 重试间隔(秒) |
| asyncPollingCount | long | 异步轮询计数 |
| asyncLatencyInMilliseconds | real | 异步延迟(毫秒) |
| backendLatencyInMilliseconds | real | 后端延迟(毫秒) |
| dataBoundary | string | 数据边界 |

## 常用筛选字段

- `subscriptionId` - 按订阅筛选
- `correlationId` - 按关联 ID 筛选
- `deploymentName` - 按部署名称筛选
- `resourceGroupName` - 按资源组筛选
- `executionStatus` - 按执行状态筛选（Failed/Succeeded）
- `TIMESTAMP` - 按时间筛选

## 典型应用场景

1. **追踪部署进度** - 查看每个资源的创建状态
2. **诊断部署失败** - 检查 statusMessage 获取错误详情
3. **分析资源创建顺序** - 按时间排序查看依赖关系
4. **计算部署耗时** - 使用 durationInMilliseconds

## 示例查询

### 按部署名称查询
```kql
cluster('armmcadx.chinaeast2').database('armmc').DeploymentOperations
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where deploymentName contains "{deploymentName}"
| project TIMESTAMP, operationId, resourceName, resourceType, executionStatus, 
         statusCode, statusMessage, durationInMilliseconds
| order by TIMESTAMP asc
```

### 查询失败的操作
```kql
cluster('armmcadx.chinaeast2').database('armmc').DeploymentOperations
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where executionStatus == "Failed"
| project TIMESTAMP, deploymentName, resourceName, resourceType, statusCode, statusMessage
| order by TIMESTAMP desc
```

### 按资源组查询部署历史
```kql
cluster('armmcadx.chinaeast2').database('armmc').DeploymentOperations
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where resourceGroupName == "{resourceGroup}"
| summarize count() by deploymentName, executionStatus
| order by count_ desc
```

### Public Cloud 查询（使用 Unionizer）
```kql
cluster('armprodgbl.eastus').database('ARMProd').Unionizer("Deployments","DeploymentOperations")
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where deploymentName contains "{deploymentName}"
| project TIMESTAMP, operationId, resourceName, executionStatus, statusMessage
| order by TIMESTAMP desc
```

## 关联表

- [Deployments.md](./Deployments.md) - 部署总体记录
- [EventServiceEntries.md](./EventServiceEntries.md) - 操作事件

## 注意事项

- `statusMessage` 包含详细的错误信息（JSON 格式）
- `durationInMilliseconds` 是 real 类型（浮点数）
- 按 `TIMESTAMP` 排序可查看资源创建顺序
- Public Cloud 使用 `Unionizer("Deployments","DeploymentOperations")` 查询

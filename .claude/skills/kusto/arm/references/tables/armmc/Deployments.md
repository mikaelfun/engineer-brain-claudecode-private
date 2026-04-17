---
name: Deployments
database: armmc
cluster: https://armmcadx.chinaeast2.kusto.chinacloudapi.cn
description: ARM 模板部署记录
status: active
related_tables:
  - DeploymentOperations
  - EventServiceEntries
schema_verified: 2026-01-14
---

# Deployments

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 (Mooncake) | https://armmcadx.chinaeast2.kusto.chinacloudapi.cn |
| 集群 (Public) | https://armprodgbl.eastus.kusto.windows.net (使用 Unionizer) |
| 数据库 | armmc / ARMProd |
| 状态 | ✅ 可用 |
| Schema 验证时间 | 2026-01-14 |

## 用途

记录 ARM 模板部署的总体信息，包括部署统计、资源计数、成功/失败数等。用于查看部署概览和统计分析。

## 完整字段列表

| 字段名 | 类型 | 说明 |
|--------|------|------|
| TIMESTAMP | datetime | 部署时间 |
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
| deploymentName | string | 部署名称 |
| deploymentSequenceId | string | 部署序列 ID |
| deploymentResourceId | string | 部署资源 ID |
| resourceGroupName | string | 资源组名称 |
| resourceGroupLocation | string | 资源组位置 |
| deploymentScope | string | 部署范围 |
| tenantId | string | 租户 ID |
| templateHash | string | 模板哈希值 |
| parametersHash | string | 参数哈希值 |
| startTime | string | 部署开始时间 |
| endTime | string | 部署结束时间 |
| durationInMilliseconds | real | 部署耗时（毫秒） |
| executionStatus | string | 执行状态 |
| resourceCount | long | 资源总数 |
| succeededResourceCount | long | 成功资源数 |
| failedResourceCount | long | 失败资源数 |
| skippedResourceCount | long | 跳过资源数 |
| timedOutResourceCount | long | 超时资源数 |
| resourceProviderCount | long | 资源提供程序数 |
| resourceTypeCount | long | 资源类型数 |
| locationCount | long | 位置数 |
| dependencyCount | long | 依赖数 |
| deploymentMode | string | 部署模式 |
| userAgent | string | 用户代理 |
| statusCode | string | 状态代码 |
| statusMessage | string | 状态消息 |
| expressionEvaluationDurationInMilliseconds | real | 表达式计算耗时(毫秒) |
| validationDurationInMilliseconds | real | 验证耗时(毫秒) |
| SourceNamespace | string | 源命名空间 |
| SourceMoniker | string | 源标识 |
| SourceVersion | string | 源版本 |
| RoleLocation | string | 角色位置 |
| ReleaseVersion | string | 发布版本 |
| nestedDeploymentCount | long | 嵌套部署数 |
| maxDeploymentNestingLevel | long | 最大嵌套级别 |
| completeMode | long | 完整模式 |
| hasOutputs | long | 是否有输出 |
| hasErrorDetails | long | 是否有错误详情 |
| hasNestedDeployments | long | 是否有嵌套部署 |
| hasVariables | long | 是否有变量 |
| debugSettingDetailLevel | string | 调试设置详情级别 |
| nestedTemplateType | string | 嵌套模板类型 |
| dataBoundary | string | 数据边界 |

## 常用筛选字段

- `subscriptionId` - 按订阅筛选
- `correlationId` - 按关联 ID 筛选
- `deploymentName` - 按部署名称筛选
- `resourceGroupName` - 按资源组筛选
- `executionStatus` - 按执行状态筛选
- `TIMESTAMP` - 按时间筛选

## 典型应用场景

1. **查看部署概览** - 快速了解部署成功/失败状态
2. **统计分析** - 分析部署频率、耗时、成功率
3. **追踪模板变更** - 通过 templateHash 跟踪模板版本
4. **分析部署规模** - 查看 resourceCount 等统计信息

## 示例查询

### 按资源组查询部署历史
```kql
cluster('armmcadx.chinaeast2').database('armmc').Deployments
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where resourceGroupName == "{resourceGroup}"
| project TIMESTAMP, deploymentName, executionStatus, resourceCount, 
         succeededResourceCount, failedResourceCount, durationInMilliseconds
| order by TIMESTAMP desc
```

### 查询失败的部署
```kql
cluster('armmcadx.chinaeast2').database('armmc').Deployments
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where executionStatus == "Failed" or failedResourceCount > 0
| project TIMESTAMP, deploymentName, resourceGroupName, executionStatus, 
         resourceCount, failedResourceCount
| order by TIMESTAMP desc
```

### 部署统计分析
```kql
cluster('armmcadx.chinaeast2').database('armmc').Deployments
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| summarize 
    TotalDeployments = count(),
    SuccessfulDeployments = countif(executionStatus == "Succeeded"),
    FailedDeployments = countif(executionStatus == "Failed"),
    AvgDurationMs = avg(durationInMilliseconds)
    by bin(TIMESTAMP, 1d)
| order by TIMESTAMP asc
```

### Public Cloud 查询（使用 Unionizer）
```kql
cluster('armprodgbl.eastus').database('ARMProd').Unionizer("Deployments","Deployments")
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where deploymentName contains "{deploymentName}"
| project TIMESTAMP, deploymentName, executionStatus, resourceCount, failedResourceCount
| order by TIMESTAMP desc
```

## 关联表

- [DeploymentOperations.md](./DeploymentOperations.md) - 部署操作详情
- [EventServiceEntries.md](./EventServiceEntries.md) - 操作事件

## 注意事项

- 此表提供部署级别的统计信息，详细操作需查询 DeploymentOperations
- `durationInMilliseconds` 是 real 类型（浮点数）
- `templateHash` 和 `parametersHash` 可用于追踪模板变更
- Public Cloud 使用 `Unionizer("Deployments","Deployments")` 查询

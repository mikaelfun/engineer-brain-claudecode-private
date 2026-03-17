---
name: deployment-tracking
description: 追踪 ARM 模板部署
tables:
  - Deployments
  - DeploymentOperations
parameters:
  - name: subscription
    required: true
    description: 订阅 ID
  - name: resourceGroup
    required: false
    description: 资源组名称
  - name: deploymentName
    required: false
    description: 部署名称
  - name: startDate
    required: true
    description: 开始时间
  - name: endDate
    required: true
    description: 结束时间
---

# 部署追踪查询

## 用途

追踪 ARM 模板部署，查看部署状态、进度、失败原因。

## 必要参数

| 参数 | 必填 | 说明 | 示例 |
|------|------|------|------|
| {subscription} | 是 | 订阅 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| {resourceGroup} | 否 | 资源组名称 | my-resource-group |
| {deploymentName} | 否 | 部署名称 | my-deployment |
| {startDate} | 是 | 开始时间 | 2025-01-01T00:00:00Z |
| {endDate} | 是 | 结束时间 | 2025-01-02T00:00:00Z |

---

## 查询 1: 按资源组查询部署历史

### Mooncake 查询

```kql
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').Deployments
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where resourceGroupName == "{resourceGroup}"
| project TIMESTAMP, deploymentName, executionStatus, resourceCount, 
         succeededResourceCount, failedResourceCount, durationInMilliseconds
| order by TIMESTAMP desc
```

### Public Cloud 查询

```kql
// cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd') // Public Cloud - 需要权限
// .Unionizer("Deployments","Deployments")
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where resourceGroupName == "{resourceGroup}"
| project TIMESTAMP, deploymentName, executionStatus, resourceCount, failedResourceCount
| order by TIMESTAMP desc
```

---

## 查询 2: 查询失败的部署

### Mooncake 查询

```kql
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').Deployments
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where executionStatus == "Failed" or failedResourceCount > 0
| project TIMESTAMP, deploymentName, resourceGroupName, executionStatus, 
         resourceCount, failedResourceCount
| order by TIMESTAMP desc
```

---

## 查询 3: 按部署名称查询操作详情

### Mooncake 查询

```kql
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').DeploymentOperations
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where deploymentName contains "{deploymentName}"
| project TIMESTAMP, operationId, resourceName, resourceType, executionStatus, 
         statusCode, statusMessage, durationInMilliseconds
| order by TIMESTAMP asc
```

### Public Cloud 查询

```kql
// cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd') // Public Cloud - 需要权限
// .Unionizer("Deployments","DeploymentOperations")
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where deploymentName contains "{deploymentName}"
| project TIMESTAMP, operationId, resourceName, executionStatus, statusMessage
| order by TIMESTAMP asc
```

---

## 查询 4: 查询失败的操作

### Mooncake 查询

```kql
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').DeploymentOperations
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where executionStatus == "Failed"
| project TIMESTAMP, deploymentName, resourceName, resourceType, statusCode, statusMessage
| order by TIMESTAMP desc
```

---

## 查询 5: 部署统计分析

### Mooncake 查询

```kql
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').Deployments
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

---

## 结果字段说明

| 字段 | 说明 |
|------|------|
| deploymentName | 部署名称 |
| executionStatus | 执行状态 (Succeeded/Failed) |
| resourceCount | 资源总数 |
| succeededResourceCount | 成功资源数 |
| failedResourceCount | 失败资源数 |
| statusMessage | 状态消息（包含错误详情） |
| durationInMilliseconds | 耗时（毫秒） |

## 关联查询

- [activity-log.md](./activity-log.md) - 活动日志查询
- [failed-operations.md](./failed-operations.md) - 失败操作查询

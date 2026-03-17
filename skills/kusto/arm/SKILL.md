---
name: arm
description: ARM Kusto 查询专家 - 诊断 Azure Resource Manager 操作、请求追踪、部署问题、限流分析。当用户需要排查 ARM 层问题时触发此 skill。
author: fangkun
last_modified: 2026-01-14
---

# ARM Kusto 查询 Skill

## 概述

本 Skill 用于查询 Azure Resource Manager (ARM) 相关的 Kusto 日志，诊断资源操作、请求追踪、部署问题、限流等问题。

## 触发关键词

- ARM、Azure Resource Manager、资源管理器
- 资源管理、资源操作、CRUD 操作
- 429、限流、Throttling、TooManyRequests
- correlationId、操作追踪、请求追踪
- 活动日志、Activity Log
- 部署、Deployment、ARM 模板
- 资源提供程序、RP 错误

## 集群信息

### Mooncake 环境

| 集群名称 | URI | 数据库 | 用途 |
|----------|-----|--------|------|
| ARM MC ADX | https://armmcadx.chinaeast2.kusto.chinacloudapi.cn | armmc | ARM 主要日志 |
| ARG MC | https://argmcn2arm1pone.chinanorth2.kusto.chinacloudapi.cn | AzureResourceGraph | Resource Graph 日志 |
| Azure Portal MC | https://azportalmc2.chinaeast2.kusto.chinacloudapi.cn | AzurePortal | Portal 前端日志 |

### Public Cloud 环境

| 集群名称 | URI | 数据库 | 用途 |
|----------|-----|--------|------|
| ARM Prod Global | https://armprodgbl.eastus.kusto.windows.net | ARMProd | ARM 全局集群（推荐） |
| ARM Prod East US | https://armprodeus.eastus.kusto.windows.net | ARMProd | ARM 美东区域集群 |
| ARM Prod West Europe | https://armprodweu.westeurope.kusto.windows.net | ARMProd | ARM 西欧区域集群 |
| ARM Prod Southeast Asia | https://armprodsea.southeastasia.kusto.windows.net | ARMProd | ARM 东南亚区域集群 |

> **重要说明**: 
> - Public Cloud 的 ARMprod 集群已于 2023/12/31 退役，替换为 3 个区域集群
> - 推荐使用 ARMPRODGBL 全局集群，通过 `Unionizer` 函数查询所有区域
> - Mooncake 集群暂无变更计划

详细集群信息见: [kusto_clusters.csv](./references/kusto_clusters.csv)

## 主要表

### armmc 数据库 (Mooncake)

| 表名 | 用途 | 文档 |
|------|------|------|
| EventServiceEntries | ARM 事件服务条目（活动日志） | [📄](./references/tables/EventServiceEntries.md) |
| HttpIncomingRequests | ARM 入站 HTTP 请求 | [📄](./references/tables/HttpIncomingRequests.md) |
| HttpOutgoingRequests | ARM 出站 HTTP 请求（到 RP） | [📄](./references/tables/HttpOutgoingRequests.md) |
| ClientRequests | ARM 客户端请求 | [📄](./references/tables/ClientRequests.md) |
| ClientErrors | 客户端错误 | [📄](./references/tables/ClientErrors.md) |
| Deployments | ARM 模板部署记录 | [📄](./references/tables/Deployments.md) |
| DeploymentOperations | ARM 部署操作详情 | [📄](./references/tables/DeploymentOperations.md) |
| ProviderErrors | 资源提供程序错误 | [📄](./references/tables/ProviderErrors.md) |
| Errors | ARM 系统错误 | [📄](./references/tables/Errors.md) |
| Traces | ARM 追踪日志 | [📄](./references/tables/Traces.md) |
| JobOperations | 后台作业操作日志 | [📄](./references/tables/JobOperations.md) |
| JobErrors | 后台作业错误 | [📄](./references/tables/JobErrors.md) |
| CapacityTraces | 容量检查追踪 | [📄](./references/tables/CapacityTraces.md) |
| CapacityErrors | 容量检查错误 | [📄](./references/tables/CapacityErrors.md) |

详细表定义见: [tables/](./references/tables/)

### Public Cloud 数据库结构

| 数据库 | 包含表 |
|--------|--------|
| **Requests** | EventServiceEntries, HttpIncomingRequests, HttpOutgoingRequests |
| **Deployments** | DeploymentOperations, Deployments, PreflightEvents |
| **Traces** | Errors, Traces |
| **Providers** | ProviderErrors, ProviderTraces |
| **Jobs** | JobOperations, JobErrors, JobHistory 等 |
| **General** | CapacityTraces, ClientRequests, ClientErrors 等 |

## Unionizer 函数

在 Public Cloud 全局集群上使用 Unionizer 函数查询所有区域：

```kql
cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd').Unionizer("数据库名", "表名")
```

**示例**:
```kql
// 查询 EventServiceEntries
cluster('armprodgbl.eastus').database('ARMProd').Unionizer("Requests","EventServiceEntries")
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"

// 查询 HttpIncomingRequests
cluster('armprodgbl.eastus').database('ARMProd').Unionizer("Requests","HttpIncomingRequests")
| where TIMESTAMP > ago(1d)
| where subscriptionId == "{subscription}"
```

## 工作流程

### 步骤 1: 查询 ARM 活动日志

```kql
// Mooncake
cluster('armmcadx.chinaeast2').database('armmc').EventServiceEntries
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where correlationId == "{correlationId}"
| project PreciseTimeStamp, operationName, resourceUri, status, properties, claims
| order by PreciseTimeStamp asc
```

### 步骤 2: 查询 HTTP 请求详情

```kql
cluster('armmcadx.chinaeast2').database('armmc').HttpIncomingRequests
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where correlationId == "{correlationId}"
| project TIMESTAMP, httpMethod, targetUri, commandName, httpStatusCode, clientIpAddress, userAgent
```

### 步骤 3: 获取 ActivityId 追踪到 RP

```kql
cluster('armmcadx.chinaeast2').database('armmc').HttpOutgoingRequests
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where targetUri contains "{resourceName}"
| project TIMESTAMP, ActivityId, serviceRequestId, targetUri, httpStatusCode
```

### 步骤 4: 使用 ActivityId 查询 CRP

```kql
cluster('azcrpmc.chinaeast2').database('crp_allmc').ContextActivity
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where activityId == "{activityId}"
| project TIMESTAMP, traceLevel, message, callerName
```

## 常见诊断场景

### 场景 1: 操作失败追踪
1. 查询 EventServiceEntries 获取失败操作（status == "Failed"）
2. 查询 HttpIncomingRequests 获取请求详情
3. 查询 HttpOutgoingRequests 获取 ActivityId
4. 使用 ActivityId 查询对应 RP 日志（如 CRP）

### 场景 2: 429 限流排查
1. 查询 HttpIncomingRequests 筛选 httpStatusCode == 429
2. 按 operationName 聚合统计
3. 分析客户端信息（IP、应用 ID、用户代理）
4. 检查 HttpOutgoingRequests 是否有 RP 层限流

### 场景 3: 查找操作发起者
1. 查询 EventServiceEntries
2. 解析 claims 字段获取用户身份
3. 分析 authorization 字段获取权限信息

### 场景 4: ARM 模板部署失败
1. 查询 Deployments 表获取部署概览
2. 查询 DeploymentOperations 获取失败的操作详情
3. 解析 statusMessage 获取错误详情

### 场景 5: 资源提供程序错误
1. 查询 ProviderErrors 获取 RP 层错误
2. 使用 HttpOutgoingRequests 的 ActivityId 追踪到 RP 日志

### 场景 6: 容量/配额问题
1. 查询 CapacityTraces 检查容量检查结果
2. 分析 skuName、location、quotaId

## 预定义查询

| 查询 | 用途 | 文件 |
|------|------|------|
| 请求追踪 | 使用 correlationId 追踪完整操作链 | [request-tracking.md](./references/queries/request-tracking.md) |
| 活动日志 | 查询 ARM 活动日志事件 | [activity-log.md](./references/queries/activity-log.md) |
| ARM-RP 调用链 | 追踪 ARM 到资源提供程序的调用 | [arm-rp-chain.md](./references/queries/arm-rp-chain.md) |
| 限流分析 | 排查 429 限流问题 | [throttling-analysis.md](./references/queries/throttling-analysis.md) |
| 部署追踪 | 追踪 ARM 模板部署 | [deployment-tracking.md](./references/queries/deployment-tracking.md) |
| 失败操作 | 查找失败的 ARM 操作 | [failed-operations.md](./references/queries/failed-operations.md) |
| 容量检查 | 查询容量检查操作 | [capacity-check.md](./references/queries/capacity-check.md) |

详细查询模板见: [queries/](./references/queries/)

## 关键字段说明

| 字段 | 说明 | 获取方式 |
|------|------|----------|
| correlationId | ARM 请求关联 ID | Azure Portal 活动日志、客户端响应头 |
| ActivityId | 活动 ID（用于关联 RP 日志） | HttpOutgoingRequests 表 |
| subscriptionId | Azure 订阅 ID | Azure Portal |
| operationId | 操作 ID | ARM 响应 |
| commandName | CLI 命令名称 | HttpIncomingRequests 表 |

## 参考链接

- [ARM Kusto Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki/1280669/Kusto-Repo-ARM)
- [ARM 访问权限申请](https://aka.ms/ARMLogsV2Access)
- [Azure Resource Manager 故障排查](https://learn.microsoft.com/azure/azure-resource-manager/troubleshooting/overview)
- [父 Skill](../SKILL.md)

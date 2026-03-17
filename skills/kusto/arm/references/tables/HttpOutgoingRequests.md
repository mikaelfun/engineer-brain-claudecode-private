---
name: HttpOutgoingRequests
database: armmc
cluster: https://armmcadx.chinaeast2.kusto.chinacloudapi.cn
description: ARM 发出的 HTTP 请求（到资源提供程序 RP）
status: active
related_tables:
  - HttpIncomingRequests
  - EventServiceEntries
schema_verified: 2026-01-14
---

# HttpOutgoingRequests

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 (Mooncake) | https://armmcadx.chinaeast2.kusto.chinacloudapi.cn |
| 集群 (Public) | https://armprodgbl.eastus.kusto.windows.net (使用 Unionizer) |
| 数据库 | armmc / ARMProd |
| 状态 | ✅ 可用 |
| Schema 验证时间 | 2026-01-14 |

## 用途

记录 ARM 发送到资源提供程序（RP）的 HTTP 请求。用于获取 ActivityId 追踪到 CRP/其他 RP、识别 RP 层限流、追踪 ARM-RP 通信链路。

## 完整字段列表

| 字段名 | 类型 | 说明 |
|--------|------|------|
| TIMESTAMP | datetime | 请求时间 |
| PreciseTimeStamp | datetime | 精确时间戳 |
| Deployment | string | 部署名称 |
| Role | string | 角色 |
| RoleInstance | string | 角色实例 |
| Level | long | ETW 日志级别 |
| ProviderGuid | string | 提供程序 GUID |
| ProviderName | string | 提供程序名称 |
| EventId | long | 事件 ID |
| Pid | long | 进程 ID |
| Tid | long | 线程 ID |
| TaskName | string | 任务名称 |
| ActivityId | string | 活动 ID（**关键字段，用于关联 RP 日志**） |
| subscriptionId | string | 订阅 ID |
| correlationId | string | 关联 ID |
| tenantId | string | 租户 ID |
| operationName | string | 操作名称 |
| operationId | string | 操作 ID |
| targetResourceProvider | string | 目标资源提供程序 |
| targetResourceType | string | 目标资源类型 |
| targetResourceName | string | 目标资源名称 |
| targetUri | string | 目标 URI |
| hostName | string | 目标主机名（资源提供程序） |
| httpMethod | string | HTTP 方法 |
| httpStatusCode | long | HTTP 状态码 |
| durationInMilliseconds | long | 请求耗时（毫秒） |
| serviceRequestId | string | 服务请求 ID |
| clientRequestId | string | 客户端请求 ID |
| apiVersion | string | API 版本 |
| requestContentLength | long | 请求内容长度 |
| responseContentLength | long | 响应内容长度 |
| httpRequestContentType | string | 请求内容类型 |
| httpResponseContentType | string | 响应内容类型 |
| errorCode | string | 错误代码 |
| errorMessage | string | 错误消息 |
| failureCause | string | 失败原因 |
| isAsync | long | 是否异步 |
| asyncOperationType | string | 异步操作类型 |
| asyncOperationDelayInSeconds | long | 异步操作延迟(秒) |
| retryAfterInSeconds | long | 重试间隔(秒) |
| throttleCategory | string | 限流类别 |
| SourceNamespace | string | 源命名空间 |
| SourceMoniker | string | 源标识 |
| SourceVersion | string | 源版本 |
| RoleLocation | string | 角色位置 |
| ReleaseVersion | string | 发布版本 |
| dataBoundary | string | 数据边界 |

## 常用筛选字段

- `subscriptionId` - 按订阅筛选
- `correlationId` - 按关联 ID 筛选
- `ActivityId` - 按活动 ID 筛选（用于关联 RP 日志）
- `targetUri` - 按目标 URI 筛选
- `hostName` - 按目标 RP 筛选
- `httpStatusCode` - 按状态码筛选
- `TIMESTAMP` - 按时间筛选

## 典型应用场景

1. **获取 ActivityId 追踪到 CRP** - 使用 ActivityId 关联 CRP ContextActivity
2. **识别 RP 层限流问题** - 检查 RP 返回的 429 错误
3. **追踪 ARM 到 RP 的请求流** - 分析请求链路
4. **排查 RP 通信故障** - 检查错误代码和消息

## 示例查询

### 获取 ActivityId
```kql
cluster('armmcadx.chinaeast2').database('armmc').HttpOutgoingRequests
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where targetUri contains "{resourceName}"
| project TIMESTAMP, ActivityId, serviceRequestId, clientRequestId, targetUri, httpMethod, httpStatusCode
| order by TIMESTAMP desc
```

### 检查 RP 层限流
```kql
cluster('armmcadx.chinaeast2').database('armmc').HttpOutgoingRequests
| where subscriptionId == "{subscription}"
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where httpStatusCode == 429
| summarize count() by hostName
| order by count_ desc
```

### 追踪到 CRP（使用 ActivityId）
```kql
// 步骤 1: 从 ARM 获取 ActivityId
let activityId = 
    cluster('armmcadx.chinaeast2').database('armmc').HttpOutgoingRequests
    | where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
    | where targetUri contains "{resourceName}"
    | project ActivityId
    | take 1;
// 步骤 2: 使用 ActivityId 查询 CRP
cluster('azcrpmc.chinaeast2').database('crp_allmc').ContextActivity
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where activityId in (activityId)
| project TIMESTAMP, traceLevel, message, callerName
```

### 按 correlationId 追踪
```kql
cluster('armmcadx.chinaeast2').database('armmc').HttpOutgoingRequests
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where correlationId == "{correlationId}"
| project TIMESTAMP, ActivityId, httpMethod, targetUri, hostName, httpStatusCode, errorCode, errorMessage
| order by TIMESTAMP asc
```

### Public Cloud 查询（使用 Unionizer）
```kql
cluster('armprodgbl.eastus').database('ARMProd').Unionizer("Requests","HttpOutgoingRequests")
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where targetUri contains "{resourceName}"
| project ActivityId, serviceRequestId, targetUri, httpStatusCode
```

## 关联表

- [HttpIncomingRequests.md](./HttpIncomingRequests.md) - ARM 入站请求
- [EventServiceEntries.md](./EventServiceEntries.md) - 操作事件详情

## CRP 关联查询

使用 `ActivityId` 可以追踪到 CRP 层：

```kql
// CRP ContextActivity
cluster('azcrpmc.chinaeast2').database('crp_allmc').ContextActivity
| where activityId == "{activityId}"
| project TIMESTAMP, traceLevel, message
```

## 注意事项

- **ActivityId** 是关联 ARM 到 RP 日志的关键字段
- `hostName` 显示目标资源提供程序的主机名
- 区分 ARM 层限流和 RP 层限流时，需要同时检查 HttpIncomingRequests 和 HttpOutgoingRequests
- Public Cloud 使用 `Unionizer("Requests","HttpOutgoingRequests")` 查询

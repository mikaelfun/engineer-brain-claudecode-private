---
name: ClientRequests
database: armmc
cluster: https://armmcadx.chinaeast2.kusto.chinacloudapi.cn
description: ARM 客户端请求日志
status: active
related_tables:
  - ClientErrors
  - HttpIncomingRequests
schema_verified: 2026-01-14
---

# ClientRequests

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 (Mooncake) | https://armmcadx.chinaeast2.kusto.chinacloudapi.cn |
| 集群 (Public) | https://armprodgbl.eastus.kusto.windows.net (使用 Unionizer) |
| 数据库 | armmc / ARMProd |
| 状态 | ✅ 可用 |
| Schema 验证时间 | 2026-01-14 |

## 用途

记录 ARM 客户端请求的详细信息，包括客户端代理、会话、IP 地址等。用于追踪客户端行为和请求来源。

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
| correlationId | string | 关联 ID |
| tenantId | string | 租户 ID |
| subscriptionId | string | 订阅 ID |
| principalOid | string | 主体对象 ID |
| principalPuid | string | 主体 PUID |
| clientAgent | string | 客户端代理 |
| clientSessionId | string | 客户端会话 ID |
| clientIpAddress | string | 客户端 IP 地址 |
| clientApplicationId | string | 客户端应用 ID |
| id | string | ID |
| eventCorrelationId | string | 事件关联 ID |
| eventTimestamp | string | 事件时间戳 |
| eventName | string | 事件名称 |
| eventData | string | 事件数据 |
| durationInMilliseconds | long | 耗时(毫秒) |
| httpMethod | string | HTTP 方法 |
| targetUri | string | 目标 URI |
| hostName | string | 主机名 |
| apiVersion | string | API 版本 |
| clientRequestId | string | 客户端请求 ID |
| serviceRequestId | string | 服务请求 ID |
| contentLength | long | 内容长度 |
| httpStatusCode | long | HTTP 状态码 |
| SourceNamespace | string | 源命名空间 |
| SourceMoniker | string | 源标识 |
| SourceVersion | string | 源版本 |
| RoleLocation | string | 角色位置 |
| ReleaseVersion | string | 发布版本 |

## 常用筛选字段

- `subscriptionId` - 按订阅筛选
- `correlationId` - 按关联 ID 筛选
- `clientIpAddress` - 按客户端 IP 筛选
- `clientApplicationId` - 按客户端应用筛选
- `httpStatusCode` - 按状态码筛选
- `TIMESTAMP` - 按时间筛选

## 典型应用场景

1. **追踪客户端请求来源** - 分析 clientAgent、clientIpAddress
2. **识别客户端应用** - 通过 clientApplicationId 追踪
3. **分析请求模式** - 统计请求频率和分布
4. **排查客户端问题** - 结合 ClientErrors 表

## 示例查询

### 按 correlationId 查询
```kql
cluster('armmcadx.chinaeast2').database('armmc').ClientRequests
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where correlationId == "{correlationId}"
| project TIMESTAMP, httpMethod, targetUri, httpStatusCode, clientAgent, clientIpAddress, durationInMilliseconds
| order by TIMESTAMP asc
```

### 按订阅统计客户端请求
```kql
cluster('armmcadx.chinaeast2').database('armmc').ClientRequests
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| summarize count() by clientApplicationId, clientAgent
| order by count_ desc
```

### 查询特定客户端 IP 的请求
```kql
cluster('armmcadx.chinaeast2').database('armmc').ClientRequests
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where clientIpAddress == "{clientIp}"
| project TIMESTAMP, subscriptionId, httpMethod, targetUri, httpStatusCode
| order by TIMESTAMP desc
```

## 关联表

- [ClientErrors.md](./ClientErrors.md) - 客户端错误
- [HttpIncomingRequests.md](./HttpIncomingRequests.md) - HTTP 入站请求

## 注意事项

- `clientAgent` 包含客户端工具信息（如 Azure CLI、PowerShell 等）
- `clientSessionId` 可用于追踪同一会话的多个请求
- 与 HttpIncomingRequests 类似但侧重于客户端视角

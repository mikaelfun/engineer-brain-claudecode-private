---
name: HttpIncomingRequests
database: armmc
cluster: https://armmcadx.chinaeast2.kusto.chinacloudapi.cn
description: ARM 接收的 HTTP 请求日志
status: active
related_tables:
  - EventServiceEntries
  - HttpOutgoingRequests
schema_verified: 2026-01-14
---

# HttpIncomingRequests

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 (Mooncake) | https://armmcadx.chinaeast2.kusto.chinacloudapi.cn |
| 集群 (Public) | https://armprodgbl.eastus.kusto.windows.net (使用 Unionizer) |
| 数据库 | armmc / ARMProd |
| 状态 | ✅ 可用 |
| Schema 验证时间 | 2026-01-14 |

## 用途

记录 ARM 接收的所有 HTTP 请求，包括请求方法、URI、状态码、客户端信息等。用于追踪 API 调用、分析限流问题、识别调用来源。

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
| subscriptionId | string | 订阅 ID |
| correlationId | string | 关联 ID |
| operationName | string | 操作名称 |
| targetUri | string | 目标 URI（资源路径） |
| httpMethod | string | HTTP 方法 (GET/PUT/POST/DELETE/PATCH) |
| httpStatusCode | long | HTTP 状态码 |
| durationInMilliseconds | long | 请求耗时（毫秒） |
| clientIpAddress | string | 客户端 IP 地址 |
| principalOid | string | 主体对象 ID |
| principalPuid | string | 主体 PUID |
| tenantId | string | 租户 ID |
| clientApplicationId | string | 客户端应用 ID |
| serviceRequestId | string | 服务请求 ID |
| armServiceRequestId | string | ARM 服务请求 ID |
| clientRequestId | string | 客户端请求 ID |
| clientSessionId | string | 客户端会话 ID |
| userAgent | string | 用户代理（包含工具和版本信息） |
| apiVersion | string | API 版本 |
| authorizationSource | string | 授权来源 |
| authorizationAction | string | 授权操作 |
| errorCode | string | 错误代码 |
| errorMessage | string | 错误消息 |
| exceptionMessage | string | 异常消息 |
| failureCause | string | 失败原因 |
| contentLength | long | 内容长度 |
| contentType | string | 内容类型 |
| contentEncoding | string | 内容编码 |
| hostName | string | 主机名 |
| commandName | string | CLI 命令名称（如 az aks create） |
| parameterSetName | string | 参数集名称 |
| referer | string | 引用来源 |
| locale | string | 区域设置 |
| targetResourceProvider | string | 目标资源提供程序 |
| targetResourceType | string | 目标资源类型 |
| SourceNamespace | string | 源命名空间 |
| SourceMoniker | string | 源标识 |
| SourceVersion | string | 源版本 |
| RoleLocation | string | 角色位置 |
| ReleaseVersion | string | 发布版本 |

## 常用筛选字段

- `subscriptionId` - 按订阅筛选
- `correlationId` - 按关联 ID 筛选
- `targetUri` - 按目标 URI 筛选
- `httpStatusCode` - 按状态码筛选（如 429、500）
- `httpMethod` - 按请求方法筛选（PUT/DELETE 等）
- `commandName` - 按 CLI 命令筛选
- `TIMESTAMP` - 按时间筛选

## 典型应用场景

1. **监控 429 限流错误** - 分析 API 调用频率和限流触发
2. **识别使用的 CLI 命令** - 通过 commandName 追踪操作来源
3. **分析请求来源** - 客户端 IP、应用 ID、用户
4. **追踪 PUT 操作** - 资源创建/更新操作
5. **排查授权问题** - 检查 authorizationAction 和错误

## 示例查询

### 查询 429 限流错误
```kql
cluster('armmcadx.chinaeast2').database('armmc').HttpIncomingRequests
| where subscriptionId == "{subscription}"
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where httpStatusCode == 429
| summarize count() by bin(TIMESTAMP, 1h), operationName
| order by count_ desc
```

### 分析客户端信息
```kql
cluster('armmcadx.chinaeast2').database('armmc').HttpIncomingRequests
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where httpStatusCode != -1
| summarize count() by clientIpAddress, principalOid, clientApplicationId, userAgent, httpStatusCode
| order by count_ desc
```

### 查询所有 ARM 操作
```kql
cluster('armmcadx.chinaeast2').database('armmc').HttpIncomingRequests
| where subscriptionId == "{subscription}"
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where httpStatusCode != -1
| project TIMESTAMP, httpMethod, operationName, targetUri, httpStatusCode, userAgent, commandName
| order by TIMESTAMP desc
```

### 追踪 AKS PUT 操作
```kql
cluster('armmcadx.chinaeast2').database('armmc').HttpIncomingRequests
| where subscriptionId == "{subscription}"
| where targetUri contains "{clusterName}"
| where commandName contains "aks" and httpMethod == "PUT"
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| project TIMESTAMP, httpMethod, commandName, httpStatusCode, serviceRequestId, 
         authorizationAction, errorCode, errorMessage, correlationId, targetUri
| order by TIMESTAMP desc
```

### Public Cloud 查询（使用 Unionizer）
```kql
cluster('armprodgbl.eastus').database('ARMProd').Unionizer("Requests","HttpIncomingRequests")
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where correlationId == "{correlationId}"
| project TIMESTAMP, httpMethod, targetUri, commandName, httpStatusCode, clientIpAddress, userAgent
| order by TIMESTAMP asc
```

## 关联表

- [EventServiceEntries.md](./EventServiceEntries.md) - 操作事件详情
- [HttpOutgoingRequests.md](./HttpOutgoingRequests.md) - ARM 到 RP 的出站请求

## 注意事项

- `httpStatusCode == -1` 表示请求未完成，通常需要过滤掉
- `commandName` 包含 CLI 命令信息（如 az-aks-create）
- 分析限流时注意区分 ARM 层限流和 RP 层限流
- Public Cloud 使用 `Unionizer("Requests","HttpIncomingRequests")` 查询

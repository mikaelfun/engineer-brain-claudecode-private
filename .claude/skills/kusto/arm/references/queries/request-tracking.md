---
name: request-tracking
description: 使用 correlationId 追踪完整操作链
tables:
  - EventServiceEntries
  - HttpIncomingRequests
  - HttpOutgoingRequests
  - JobOperations
parameters:
  - name: subscription
    required: true
    description: 订阅 ID
  - name: correlationId
    required: true
    description: 关联 ID
  - name: startDate
    required: true
    description: 开始时间
  - name: endDate
    required: true
    description: 结束时间
---

# 请求追踪查询

## 用途

使用 correlationId 追踪完整的 ARM 操作链，包括入站请求、出站请求、事件和后台作业。

## 必要参数

| 参数 | 必填 | 说明 | 示例 |
|------|------|------|------|
| {subscription} | 是 | 订阅 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| {correlationId} | 是 | 关联 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| {startDate} | 是 | 开始时间 | 2025-01-01T00:00:00Z |
| {endDate} | 是 | 结束时间 | 2025-01-02T00:00:00Z |

---

## 查询 1: EventServiceEntries - 操作事件

### Mooncake 查询

```kql
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').EventServiceEntries
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where correlationId == "{correlationId}"
| project TIMESTAMP, resourceUri, operationName, status, level, properties, claims
| order by TIMESTAMP asc
```

### Public Cloud 查询（使用 Unionizer）

```kql
// cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd') // Public Cloud - 需要权限
// .Unionizer("Requests","EventServiceEntries")
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where correlationId == "{correlationId}"
| project TIMESTAMP, resourceUri, operationName, status, level, properties, claims
| order by TIMESTAMP asc
```

---

## 查询 2: HttpIncomingRequests - 入站请求

### Mooncake 查询

```kql
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').HttpIncomingRequests
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where correlationId == "{correlationId}"
| project TIMESTAMP, httpMethod, targetUri, commandName, httpStatusCode, clientIpAddress, userAgent
| order by TIMESTAMP asc
```

### Public Cloud 查询

```kql
// cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd') // Public Cloud - 需要权限
// .Unionizer("Requests","HttpIncomingRequests")
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where correlationId == "{correlationId}"
| project TIMESTAMP, httpMethod, targetUri, commandName, httpStatusCode, clientIpAddress, userAgent
| order by TIMESTAMP asc
```

---

## 查询 3: HttpOutgoingRequests - 出站请求（获取 ActivityId）

### Mooncake 查询

```kql
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').HttpOutgoingRequests
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where correlationId == "{correlationId}"
| project TIMESTAMP, ActivityId, httpMethod, targetUri, hostName, httpStatusCode, errorCode
| order by TIMESTAMP asc
```

### Public Cloud 查询

```kql
// cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd') // Public Cloud - 需要权限
// .Unionizer("Requests","HttpOutgoingRequests")
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where correlationId == "{correlationId}"
| project TIMESTAMP, ActivityId, httpMethod, targetUri, hostName, httpStatusCode
| order by TIMESTAMP asc
```

---

## 查询 4: JobOperations - 后台作业（可选）

### Mooncake 查询

```kql
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').JobOperations
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where correlationId == "{correlationId}"
| project TIMESTAMP, jobId, operationName, message
| order by TIMESTAMP asc
```

---

## 结果字段说明

| 字段 | 说明 |
|------|------|
| TIMESTAMP | 时间戳 |
| correlationId | 关联 ID，用于追踪完整操作链 |
| operationName | 操作名称 |
| status | 操作状态 |
| ActivityId | 活动 ID（用于关联 RP 日志） |
| httpStatusCode | HTTP 状态码 |

## 关联查询

- [arm-rp-chain.md](./arm-rp-chain.md) - 使用 ActivityId 追踪到 RP
- [activity-log.md](./activity-log.md) - 活动日志查询

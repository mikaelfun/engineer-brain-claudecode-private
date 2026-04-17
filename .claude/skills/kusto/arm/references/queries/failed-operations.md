---
name: failed-operations
description: 查找失败的 ARM 操作
tables:
  - EventServiceEntries
  - HttpIncomingRequests
  - ProviderErrors
parameters:
  - name: subscription
    required: true
    description: 订阅 ID
  - name: startDate
    required: true
    description: 开始时间
  - name: endDate
    required: true
    description: 结束时间
  - name: correlationId
    required: false
    description: 关联 ID
---

# 失败操作查询

## 用途

查找 ARM 层失败的操作，分析错误原因。

## 必要参数

| 参数 | 必填 | 说明 | 示例 |
|------|------|------|------|
| {subscription} | 是 | 订阅 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| {startDate} | 是 | 开始时间 | 2025-01-01T00:00:00Z |
| {endDate} | 是 | 结束时间 | 2025-01-02T00:00:00Z |
| {correlationId} | 否 | 关联 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |

---

## 查询 1: 查询失败的事件

### Mooncake 查询

```kql
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').EventServiceEntries
| where subscriptionId == "{subscription}"
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where status == "Failed"
| where properties notcontains "isComplianceCheck" and properties notcontains "OK" and properties != ""
| project PreciseTimeStamp, resourceUri, properties, status, level, EventId, eventName, 
         eventCategory, operationName, correlationId, claims, tenantId
| order by PreciseTimeStamp desc
```

### Public Cloud 查询

```kql
// cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd') // Public Cloud - 需要权限
// .Unionizer("Requests","EventServiceEntries")
| where subscriptionId == "{subscription}"
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where status == "Failed"
| where properties notcontains "isComplianceCheck"
| project PreciseTimeStamp, resourceUri, properties, status, operationName, correlationId
| order by PreciseTimeStamp desc
```

---

## 查询 2: 按 correlationId 查询失败详情

### Mooncake 查询

```kql
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').EventServiceEntries
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where correlationId == "{correlationId}"
| where status == "Failed"
| project PreciseTimeStamp, resourceUri, operationName, status, properties
| order by PreciseTimeStamp asc
```

---

## 查询 3: 查询 HTTP 失败请求

### Mooncake 查询

```kql
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').HttpIncomingRequests
| where subscriptionId == "{subscription}"
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where httpStatusCode >= 400 and httpStatusCode != -1
| project TIMESTAMP, httpMethod, targetUri, httpStatusCode, errorCode, errorMessage, 
         failureCause, correlationId, commandName
| order by TIMESTAMP desc
```

### Public Cloud 查询

```kql
// cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd') // Public Cloud - 需要权限
// .Unionizer("Requests","HttpIncomingRequests")
| where subscriptionId == "{subscription}"
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where httpStatusCode >= 400 and httpStatusCode != -1
| project TIMESTAMP, httpMethod, targetUri, httpStatusCode, errorCode, errorMessage, correlationId
| order by TIMESTAMP desc
```

---

## 查询 4: 查询 RP 层错误

### Mooncake 查询

```kql
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').ProviderErrors
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| project TIMESTAMP, providerNamespace, resourceType, operationName, message, exception
| order by TIMESTAMP desc
```

### Public Cloud 查询

```kql
// cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd') // Public Cloud - 需要权限
// .Unionizer("Providers","ProviderErrors")
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| project TIMESTAMP, providerNamespace, resourceType, message
| order by TIMESTAMP desc
```

---

## 查询 5: 错误统计

### Mooncake 查询

```kql
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').HttpIncomingRequests
| where subscriptionId == "{subscription}"
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where httpStatusCode >= 400 and httpStatusCode != -1
| summarize count() by httpStatusCode, operationName
| order by count_ desc
```

---

## 查询 6: 解析错误详情

### Mooncake 查询

```kql
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').EventServiceEntries
| where subscriptionId == "{subscription}"
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where status == "Failed"
| extend errorCode = tostring(parse_json(properties).error.code)
| extend errorMessage = tostring(parse_json(properties).error.message)
| project PreciseTimeStamp, resourceUri, operationName, errorCode, errorMessage
| order by PreciseTimeStamp desc
```

---

## 结果字段说明

| 字段 | 说明 |
|------|------|
| status | 操作状态 |
| httpStatusCode | HTTP 状态码 |
| errorCode | 错误代码 |
| errorMessage | 错误消息 |
| failureCause | 失败原因 |
| properties | 属性（JSON 格式，包含详细错误信息） |

## 常见错误状态码

| 状态码 | 说明 |
|--------|------|
| 400 | Bad Request - 请求格式错误 |
| 401 | Unauthorized - 未授权 |
| 403 | Forbidden - 禁止访问 |
| 404 | Not Found - 资源不存在 |
| 409 | Conflict - 冲突 |
| 429 | Too Many Requests - 限流 |
| 500 | Internal Server Error - 内部错误 |

## 关联查询

- [request-tracking.md](./request-tracking.md) - 完整请求追踪
- [activity-log.md](./activity-log.md) - 活动日志查询

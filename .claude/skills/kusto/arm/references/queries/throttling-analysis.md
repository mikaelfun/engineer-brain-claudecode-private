---
name: throttling-analysis
description: 排查 429 限流问题
tables:
  - HttpIncomingRequests
  - HttpOutgoingRequests
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
---

# 限流分析查询

## 用途

排查 429 限流问题，分析 API 调用频率、识别触发限流的操作和客户端。

## 必要参数

| 参数 | 必填 | 说明 | 示例 |
|------|------|------|------|
| {subscription} | 是 | 订阅 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| {startDate} | 是 | 开始时间 | 2025-01-01T00:00:00Z |
| {endDate} | 是 | 结束时间 | 2025-01-02T00:00:00Z |

---

## 步骤 1: 查找触发 429 的操作

### Mooncake 查询

```kql
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').HttpIncomingRequests
| where subscriptionId == "{subscription}"
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where httpStatusCode == 429
| summarize count() by bin(TIMESTAMP, 1h), operationName
| order by count_ desc
```

### Public Cloud 查询

```kql
// cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd') // Public Cloud - 需要权限
// .Unionizer("Requests","HttpIncomingRequests")
| where subscriptionId == "{subscription}"
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where httpStatusCode == 429
| summarize count() by bin(TIMESTAMP, 1h), operationName
| order by count_ desc
```

---

## 步骤 2: 分析客户端信息

识别触发限流的客户端（使用步骤 1 获取的 operationName）：

### Mooncake 查询

```kql
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').HttpIncomingRequests
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where httpStatusCode != -1
| where operationName == "{operationName}"  // 从步骤 1 获取
| summarize count() by clientIpAddress, principalOid, clientApplicationId, userAgent, httpStatusCode
| order by count_ desc
```

### Public Cloud 查询

```kql
// cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd') // Public Cloud - 需要权限
// .Unionizer("Requests","HttpIncomingRequests")
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where httpStatusCode != -1
| where operationName == "{operationName}"
| summarize count() by clientIpAddress, principalOid, clientApplicationId, userAgent, httpStatusCode
| order by count_ desc
```

---

## 步骤 3: 检查 RP 层限流

确定限流是发生在 ARM 层还是 RP 层：

### Mooncake 查询

```kql
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').HttpOutgoingRequests
| where subscriptionId == "{subscription}"
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where httpStatusCode == 429
| summarize count() by hostName
| order by count_ desc
```

### Public Cloud 查询

```kql
// cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd') // Public Cloud - 需要权限
// .Unionizer("Requests","HttpOutgoingRequests")
| where subscriptionId == "{subscription}"
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where httpStatusCode == 429
| summarize count() by hostName
| order by count_ desc
```

---

## 步骤 4: 查看所有 ARM 操作的统计

### Mooncake 查询

```kql
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').HttpIncomingRequests
| where subscriptionId == "{subscription}"
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where httpStatusCode != -1
| summarize 
    TotalRequests = count(),
    ThrottledRequests = countif(httpStatusCode == 429),
    FailedRequests = countif(httpStatusCode >= 400)
    by bin(TIMESTAMP, 1h), operationName
| order by ThrottledRequests desc
```

---

## 步骤 5: 时间分布分析

### Mooncake 查询

```kql
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').HttpIncomingRequests
| where subscriptionId == "{subscription}"
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| summarize 
    TotalRequests = count(),
    ThrottledRequests = countif(httpStatusCode == 429)
    by bin(TIMESTAMP, 1h)
| render timechart
```

---

## 结果字段说明

| 字段 | 说明 |
|------|------|
| operationName | 触发限流的操作类型 |
| clientIpAddress | 客户端 IP 地址 |
| principalOid | 执行操作的用户/服务主体 OID |
| clientApplicationId | 客户端应用 ID |
| userAgent | 用户代理（包含工具版本信息） |
| hostName | RP 层限流时的目标主机名 |

## 限流类型判断

- **ARM 层限流**: HttpIncomingRequests 返回 429
- **RP 层限流**: HttpOutgoingRequests 返回 429，但 HttpIncomingRequests 可能不是 429

## 关联查询

- [request-tracking.md](./request-tracking.md) - 追踪具体请求
- [activity-log.md](./activity-log.md) - 活动日志查询

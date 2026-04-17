---
name: arm-throttling
description: ARM Throttling 查询 - 排查 429 限流错误
tables:
  - HttpIncomingRequests
  - HttpOutgoingRequests
  - EventServiceEntries
parameters:
  - name: subscription
    required: true
    description: 订阅 ID
  - name: starttime
    required: false
    default: now(-6h)
    description: 开始时间
  - name: endtime
    required: false
    default: now()
    description: 结束时间
---

# ARM Throttling 查询

## 用途

排查 ARM 层的 429 限流错误，识别触发限流的客户端和操作。

## 必要参数

| 参数 | 必填 | 说明 | 示例 |
|------|------|------|------|
| {subscription} | 是 | 订阅 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| {starttime} | 否 | 开始时间 | 2025-01-01T00:00:00Z |
| {endtime} | 否 | 结束时间 | 2025-01-02T00:00:00Z |

## 查询语句

### 统计 Throttling 发生频率

```kql
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').HttpIncomingRequests
| where TIMESTAMP >= now(-6h)
| where subscriptionId == "{subscription}"
| where httpStatusCode == 429
| summarize count() by bin(TIMESTAMP, 10m), operationName
| order by TIMESTAMP asc
```

### 识别触发 Throttling 的客户端

```kql
let subid = "{subscription}";
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').HttpIncomingRequests
| where TIMESTAMP >= now(-1h)
| where subscriptionId == subid
| where httpStatusCode == 429
| summarize count() by clientIpAddress, principalOid, clientApplicationId, userAgent, 
           httpStatusCode, targetUri
```

### 按应用 ID 统计

```kql
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').HttpIncomingRequests
| where TIMESTAMP >= now(-1h)
| where subscriptionId == "{subscription}"
| where httpStatusCode == "429"
| summarize count() by operationName, clientApplicationId
| order by count_ desc
```

### 查询 Throttling 发生位置

```kql
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').HttpOutgoingRequests
| where TIMESTAMP between(datetime({starttime}) .. datetime({endtime}))
| where subscriptionId == "{subscription}"
| where httpStatusCode == 429
| summarize count() by hostName
| order by count_ desc
```

### 查询 ARM 事件服务条目

```kql
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').EventServiceEntries
| where PreciseTimeStamp >= datetime({starttime}) and PreciseTimeStamp <= datetime({endtime})
| where subscriptionId == '{subscription}'
| where operationName notcontains "Microsoft.Authorization/roleAssignments/write"
| project PreciseTimeStamp, operationName, status, correlationId, caller
| order by PreciseTimeStamp desc
```

## 结果字段说明

| 字段 | 说明 |
|------|------|
| clientApplicationId | 触发请求的应用 ID |
| principalOid | 用户/服务主体 OID |
| clientIpAddress | 客户端 IP 地址 |
| userAgent | 用户代理 |
| hostName | 目标主机名 (Throttling 位置) |

## 常见解决方案

| 场景 | 解决方案 |
|------|----------|
| 自动化脚本请求过多 | 添加延迟/指数退避 |
| 监控工具频繁轮询 | 减少轮询频率 |
| 批量操作 | 使用批处理 API |
| 第三方工具 | 检查工具配置 |

## 关联查询

- [arm-tracking.md](./arm-tracking.md) - ARM 追踪查询
- [vm-operations.md](./vm-operations.md) - VM 操作查询

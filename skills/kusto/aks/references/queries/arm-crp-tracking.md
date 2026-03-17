---
name: arm-crp-tracking
description: ARM 和 CRP 请求追踪查询
tables:
  - IncomingRequestTrace
  - OutgoingRequestTrace
parameters:
  - name: subscription
    required: true
    description: 订阅 ID
  - name: correlationId
    required: false
    description: 关联 ID
  - name: startDate
    required: true
    description: 开始时间
  - name: endDate
    required: true
    description: 结束时间
---

# ARM 和 CRP 请求追踪查询

## 用途

追踪 ARM 请求进入 AKS RP 以及 AKS RP 调用 CRP 的请求链路。用于诊断计算资源操作问题。

---

## 查询 1: 查询 ARM 入站请求

### 用途
查看从 ARM 进入 AKS RP 的请求。

### 查询语句

```kql
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').IncomingRequestTrace 
| where PreciseTimeStamp > ago(2d)
| where subscriptionID has '{subscription}'
| where correlationID has "{correlationId}"
| where httpMethod notcontains "GET"
| where operationName notcontains "unknown"
| project PreciseTimeStamp, operationName, suboperationName, targetURI, correlationID, 
         operationID, region, msg, durationInMilliseconds, userAgent
```

---

## 查询 2: 查询 CRP 出站请求

### 用途
查看 AKS RP 调用 CRP 的请求（VMSS 操作）。

### 查询语句

```kql
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').OutgoingRequestTrace
| where TIMESTAMP >= ago(2d)
| where subscriptionID has '{subscription}'
| where correlationID contains "{correlationId}"
| where targetURI contains "vmss"
| extend provider = substring(targetURI, 95, strlen(targetURI))
| project PreciseTimeStamp, serviceRequestID, correlationID, provider, operationName, 
         suboperationName, targetURI, statusCode, log
```

---

## 查询 3: 按时间范围查询出站请求

### 用途
查看特定时间范围内的所有出站请求。

### 查询语句

```kql
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').OutgoingRequestTrace 
| where PreciseTimeStamp >= datetime({startDate}) and PreciseTimeStamp <= datetime({endDate})
| where subscriptionID has '{subscription}'
| where operationName !contains "GetManagedClusterHandler.GET"
| project PreciseTimeStamp, operationID, correlationID, operationName, suboperationName, 
         targetURI, statusCode, durationInMilliseconds
```

---

## 查询 4: 查询 ARM EventServiceEntries

### 用途
查询 ARM 事件服务入口记录。

### 查询语句

```kql
cluster('https://armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').EventServiceEntries
| where subscriptionId == "{subscription}"
| where resourceUri contains "{cluster}" 
| where TIMESTAMP > ago(2d)
// | where status == "Failed" 
| project PreciseTimeStamp, status, operationName, correlationId, properties
```

---

## 查询 5: 追踪完整请求链路

### 用途
使用 correlationID 追踪完整的请求链路。

### 查询语句

```kql
// Step 1: 查询 ARM 入站
let armIn = cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').IncomingRequestTrace 
| where PreciseTimeStamp > ago(2d)
| where correlationID has "{correlationId}"
| project PreciseTimeStamp, Source="ARM_Incoming", operationName, operationID, targetURI, userAgent;
// Step 2: 查询 CRP 出站
let crpOut = cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').OutgoingRequestTrace
| where TIMESTAMP >= ago(2d)
| where correlationID contains "{correlationId}"
| project PreciseTimeStamp, Source="CRP_Outgoing", operationName, serviceRequestID, targetURI, statusCode;
// Step 3: 合并
armIn
| project PreciseTimeStamp, Source, operationName, ID=operationID, targetURI, Info=userAgent
| union (crpOut | project PreciseTimeStamp, Source, operationName, ID=serviceRequestID, targetURI, Info=tostring(statusCode))
| sort by PreciseTimeStamp asc
```

---

## 查询 6: 获取 serviceRequestID 用于 CRP 追踪

### 用途
获取 serviceRequestID 用于在 CRP 日志中进一步追踪。

### 查询语句

```kql
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').OutgoingRequestTrace
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where subscriptionID has '{subscription}'
| where correlationID contains "{correlationId}"
| where targetURI contains "Microsoft.Compute"
| project PreciseTimeStamp, serviceRequestID, targetURI, statusCode
| take 10
```

## 结果字段说明

| 字段 | 说明 |
|------|------|
| correlationID | ARM 关联 ID，用于跨服务追踪 |
| operationID | AKS RP 操作 ID |
| serviceRequestID | CRP 服务请求 ID，用于追踪到 CRP 日志 |
| targetURI | 目标 URI |
| statusCode | HTTP 状态码 |

## 使用 serviceRequestID 追踪到 CRP

获取 `serviceRequestID` 后，可在 CRP 日志中追踪：

```kql
cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').ContextActivity
| where TIMESTAMP > ago(2d)
| where activityId == "{serviceRequestID}"
| project PreciseTimeStamp, message, traceLevel
```

## 关联查询

- [operation-tracking.md](./operation-tracking.md) - 操作追踪
- [cluster-snapshot.md](./cluster-snapshot.md) - 集群快照

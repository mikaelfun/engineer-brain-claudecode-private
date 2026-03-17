---
name: OutgoingRequestTrace
database: AKSprod
cluster: https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn
description: CRP 出站请求追踪，记录 AKS RP 调用 CRP 的请求
status: active
related_tables:
  - IncomingRequestTrace
---

# OutgoingRequestTrace

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn |
| 数据库 | AKSprod |
| 状态 | ✅ 可用 |

## 用途

记录 AKS Resource Provider 调用 Compute Resource Provider (CRP) 的请求，用于追踪 VMSS 等计算资源操作。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| PreciseTimeStamp | datetime | 时间戳 |
| TIMESTAMP | datetime | 时间戳（别名） |
| subscriptionID | string | 订阅 ID |
| correlationID | string | 关联 ID |
| operationID | string | 操作 ID |
| serviceRequestID | string | 服务请求 ID（用于追踪到 CRP） |
| operationName | string | 操作名称 |
| suboperationName | string | 子操作名称 |
| targetURI | string | 目标 URI |
| statusCode | int | HTTP 状态码 |
| log | string | 日志内容 |
| durationInMilliseconds | long | 持续时间（毫秒） |

## 典型应用场景

1. **追踪 VMSS 操作** - 查看节点池扩缩容调用
2. **诊断 CRP 调用失败** - 分析 statusCode 和错误
3. **获取 serviceRequestID** - 用于进一步追踪到 CRP 日志

## 示例查询

### 按 CorrelationID 查询 VMSS 调用
```kql
OutgoingRequestTrace
| where TIMESTAMP >= ago(2d)
| where subscriptionID has '{subscription}'
| where correlationID contains "{correlationId}"
| where targetURI contains "vmss"
| extend provider = substring(targetURI, 95, strlen(targetURI))
| project PreciseTimeStamp, serviceRequestID, correlationID, provider, operationName, 
         suboperationName, targetURI, statusCode, log
```

### 按时间范围和订阅查询
```kql
OutgoingRequestTrace 
| where PreciseTimeStamp >= datetime({startDate}) and PreciseTimeStamp <= datetime({endDate})
| where subscriptionID has '{subscription}'
| where operationName !contains "GetManagedClusterHandler.GET"
| project PreciseTimeStamp, operationID, correlationID, operationName, suboperationName, 
         targetURI, statusCode, durationInMilliseconds
```

## 关联表

- [IncomingRequestTrace.md](./IncomingRequestTrace.md) - ARM 入站请求

## 注意事项

- `serviceRequestID` 可用于在 CRP 日志中追踪请求
- `targetURI` 包含调用的 CRP 资源路径

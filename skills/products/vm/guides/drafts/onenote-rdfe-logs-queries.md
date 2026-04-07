---
source: onenote
sourceRef: "Mooncake POD Support Notebook/POD/VMSCIM/4. Services/VM/Tools/2. Kusto/RDFE logs.md"
sourceUrl: null
importDate: "2026-04-05"
type: diagnostic-reference
---

# RDFE Kusto 查询参考

> Kusto Endpoint: https://rdfemc.kusto.chinacloudapi.cn
> 注意：RDFE 使用 deploymentId 而非 tenantName

## 核心 Kusto 表

### 1. RdfeQosEventEtwTable — RDFE 操作摘要
- 用途：查看所有到达 RDFE 的操作摘要
- 关键字段：OperationId, Operation, Result, ErrorDetails, DeploymentId
- 建议：过滤掉 GET/List 操作以聚焦写操作

```kql
RdfeQosEventEtwTable
| where SubscriptionId == "<subscription-id>"
| where PreciseTimeStamp between(datetime(...) .. datetime(...))
| where Operation !contains "GET" and Operation !contains "List" and Operation <> "null"
| project PreciseTimeStamp, OperationId, Operation, Result, ErrorDetails, DeploymentId
```

### 2. DeploymentContextActivityEtwTable — RDFE 详细日志
- 用途：查看 RdfeQosEventEtwTable 中每个操作的详细活动日志
- 使用 RdfeQosEventEtwTable 的 OperationId 进行关联

```kql
DeploymentContextActivityEtwTable
| where PreciseTimeStamp between(datetime(...) .. datetime(...))
| where OperationId contains "<operation-id>"
| project PreciseTimeStamp, Level, Message, DeploymentName, OperationName, OperationId
```

---
source: onenote
sourceRef: "Mooncake POD Support Notebook/POD/VMSCIM/4. Services/VM/Tools/2. Kusto/PIR Logs.md"
sourceUrl: null
importDate: "2026-04-05"
type: diagnostic-reference
---

# PIR (Platform Image Repository) Kusto 查询参考

> Kusto Endpoint: https://azcrpmc.kusto.chinacloudapi.cn
> 关联 ID 映射：CRP ContextActivity 的 x-ms-request-id == PirCasApiQosEvent 的 operationId == PirCasContextActivityEvent 的 activityId

## 核心 Kusto 表

### 1. PirCasApiQosEvent — PIR 操作摘要
- 用途：查看 PIR 中所有操作的摘要（镜像发布、获取等）
- 关键字段：operationId, correlationId, operationName, resultCode, httpStatusCode, publisher, errorDetails, region, type

```kql
PirCasApiQosEvent
| where subscriptionId == "<subscription-id>"
| where PreciseTimeStamp between(datetime(...) .. datetime(...))
| where operationId contains "<x-ms-request-id>"
| project PreciseTimeStamp, operationId, correlationId, operationName, resultCode, httpStatusCode, publisher, errorDetails, wFAppName, region, ['type']
```

### 2. PirCasContextActivityEvent — PIR 操作详细日志
- 用途：查看 PirCasApiQosEvent 中每个操作的详细（verbose）日志
- 使用 PirCasApiQosEvent 的 operationId 作为 activityId 过滤

```kql
PirCasContextActivityEvent
| where subscriptionId == "<subscription-id>"
| where PreciseTimeStamp between(datetime(...) .. datetime(...))
| where activityId == "<operation-id>"
| project PreciseTimeStamp, activityId, message, traceCode, subscriptionId
```

---
source: onenote
sourceRef: "MCVKB/VM+SCIM/=======18. AKS=======/18.23[MCVKB]track request from AKS RP to CRP_DRP.md"
sourceUrl: null
importDate: "2026-04-04"
type: troubleshooting-guide
---

# AKS RP → CRP/DRP 请求链路追踪（Kusto）

> **场景**: AKS 操作失败（create/upgrade/scale），需从 AKS RP 跨层追踪到 CRP → RDOS/VM extension 定位根因  
> **适用**: Mooncake | 作者: Icy Lin

## 数据流

```
用户请求
  └→ AKS RP (FrontEndQoSEvents / AsyncQoSEvents)
       └→ AKS AsyncContextActivity (error detail)
            └→ AKS OutgoingRequestTrace (HTTP to CRP)
                 └→ CRP ApiQosEvent (correlationId)
                      └→ CRP ContextActivity (CRP detail)
                           └→ azurecm LogContainerSnapshot (containerId)
                                └→ RDOS GuestAgentExtensionEvents (WA/CSE logs)
```

---

## Step 1 — 查 AKS RP OperationID

**Kusto**: `akscn.kusto.chinacloudapi.cn` / db: `AKSprod`

```kql
union 
  cluster('akscn.kusto.chinacloudapi.cn').database('AKSprod').FrontEndQoSEvents,
  cluster('akscn.kusto.chinacloudapi.cn').database('AKSprod').AsyncQoSEvents
| where PreciseTimeStamp between(datetime(YYYY-MM-DD 00:00) .. datetime(YYYY-MM-DD 23:59))
| where subscriptionID == "<subId>"
  and resourceName == "<clusterName>"
| project PreciseTimeStamp, correlationID, operationID, operationName, result, errorDetails
```

---

## Step 2 — 查 AKS RP 错误详情

```kql
cluster('akscn.kusto.chinacloudapi.cn').database('AKSprod').AsyncContextActivity
| where PreciseTimeStamp > ago(3d)
| where operationID == "<operationID from step 1>"
| where level != "info"
| project PreciseTimeStamp, level, msg, fileName, lineNumber, operationID
```

> 典型错误: `vmextension.put.request: error: ContextDeadlineExceeded`

---

## Step 3 — 查 AKS RP → CRP 请求

```kql
cluster('akscn.kusto.chinacloudapi.cn').database('AKSprod').OutgoingRequestTrace
| where TIMESTAMP between(datetime(YYYY-MM-DD HH:00) .. datetime(YYYY-MM-DD HH:59))
| where operationID == "<operationID>"
| where targetURI contains "<vmName>"  // e.g., "cse-agent-7"
| project TIMESTAMP, correlationID, clientRequestID, operationID, msg, statusCode, targetURI
// clientRequestID 即 CRP 侧的 correlationId
```

---

## Step 4 — 查 CRP OperationID

**Kusto**: `azcrpmc.kusto.chinacloudapi.cn` / db: `crp_allmc`

```kql
cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').ApiQosEvent
| where TIMESTAMP between(datetime(YYYY-MM-DD) .. datetime(YYYY-MM-DD+1))
| where correlationId == "<clientRequestID from step 3>"
| where operationName !contains "GET"
| project resourceGroupName, resourceName, goalSeekingActivityId, operationId
// goalSeekingActivityId = activityId in CRP ContextActivity
```

---

## Step 5 — 查 CRP 详情

```kql
cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').ContextActivity
| where TIMESTAMP between(...)
| where activityId == "<goalSeekingActivityId>"
```

---

## Step 6 — 查 ContainerId (azurecm)

**Kusto**: `azurecm.chinanorth2.kusto.chinacloudapi.cn` / db: `azurecm`

```kql
LogContainerSnapshot
| where TIMESTAMP between(...)
| where subscriptionId == "<subId>"
  and roleInstanceName contains "<vmName>"  // e.g., "aks-nodepool1-32471634-7"
| project TIMESTAMP, Tenant, tenantName, containerId, nodeId, roleInstanceName
| sort by TIMESTAMP asc nulls last
```

---

## Step 7 — 查 VM Extension / WA Agent 日志

**Kusto**: `rdosmc.kusto.chinacloudapi.cn` / db: `rdos`

```kql
GuestAgentExtensionEvents
| where PreciseTimeStamp between(...)
| where ContainerId == "<containerId from step 6>"
| where Operation !in ('HeartBeat', 'HttpErrors')
| where isnotempty(Message)
| project PreciseTimeStamp, ContainerId, Level, GAVersion, Version, Operation, Message, Duration
```

---

## 补充：IP/MAC 历史信息

```kql
// azurecm 查 IP/MAC
AllocatorServiceContainerAttributes
| where containerId contains "<containerId>"
| project containerId, name, value, PreciseTimeStamp
```

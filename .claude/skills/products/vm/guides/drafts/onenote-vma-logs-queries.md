---
source: onenote
sourceRef: "Mooncake POD Support Notebook/POD/VMSCIM/4. Services/VM/Tools/2. Kusto/VMA Logs.md"
sourceUrl: null
importDate: "2026-04-05"
type: diagnostic-reference
---

# VMA (VM Availability) Kusto 查询参考

> Kusto Endpoint: https://vmainsight.kusto.windows.net

## 核心 Kusto 表

### 1. VMA — VM 可用性事件
- 用途：查看可能导致 VM 可用性问题的事件（宿主机故障、维护迁移、服务恢复等）
- 关键字段：TenantName, RoleInstanceName, RCALevel1/2/3, RCAEngineCategory, Detail, Cluster, NodeId, ContainerId

```kql
VMA
| where Subscription == "<subscription-id>"
| where PreciseTimeStamp between(datetime(...) .. datetime(...))
| where RoleInstanceName contains "<vm-name>"
| sort by PreciseTimeStamp desc
| project PreciseTimeStamp, TenantName, RoleInstanceName, RCALevel1, RCALevel2, RCALevel3, RCAEngineCategory, Detail, Cluster, NodeId, ContainerId
```

### 2. WindowsEventTable — 宿主机 Windows 事件日志
- 用途：查看宿主机节点上的 Windows Event 日志（使用 ContainerId 在 Description 中过滤特定 VM）
- 关键字段：TimeCreated, Cluster, EventId, ProviderName, Description

```kql
WindowsEventTable
| where PreciseTimeStamp between(datetime(...) .. datetime(...))
| where NodeId == "<node-id>"
| where Description contains "<container-id>"
| sort by TimeCreated desc
| project TimeCreated, Cluster, EventId, ProviderName, Description
```

---
source: onenote
sourceRef: "Mooncake POD Support Notebook/POD/VMSCIM/4. Services/VM/Tools/2. Kusto/Fabric Logs (compute manager).md"
sourceUrl: null
importDate: "2026-04-05"
type: diagnostic-reference
---

# Fabric Logs (Compute Manager) Kusto 查询参考

> Kusto Endpoint: https://azurecm.chinanorth2.kusto.chinacloudapi.cn
> 关联 ID 映射：CRP ContextActivity 的 Tenants/ID == Fabric 的 TenantName；RDFE DeploymentID == Fabric TenantName

## 核心 Kusto 表与用途

### 1. TMMgmtTenantEventsEtwTable — 租户事件
- 用途：查看 serviceHealing、LiveMigration、Allocations 等事件及异常
- 关键字段：PreciseTimeStamp, Tenant, TenantName, RoleInstance, ActivityId, Message

```kql
TMMgmtTenantEventsEtwTable
| where PreciseTimeStamp between(datetime(2022-01-10) .. datetime(2022-01-10 05:00:00))
| where TenantName contains "<tenant-id>"
| project PreciseTimeStamp, Tenant, TenantName, RoleInstance, ActivityId, Message
```

### 2. TMMgmtAllocationStatusEtwTable — 分配请求
- 用途：跟踪租户分配请求的状态
- 关键字段：DeploymentType, AllocationId, NumOfInstancesRequested, NumOfInstancesAllocated, Message

```kql
TMMgmtAllocationStatusEtwTable
| where PreciseTimeStamp between(datetime(...) .. datetime(...))
| project PreciseTimeStamp, DeploymentType, AllocationId, NumOfInstancesRequested, NumOfInstancesAllocated, Message
```

### 3. TMMgmtSlaMeasurementEventEtwTable — 租户生命周期
- 用途：查看租户下所有 RoleInstance 的状态和生命周期
- 关键字段：Context, EntityState, RoleInstanceName, ContainerID, NodeID, TenantName, Region

```kql
TMMgmtSlaMeasurementEventEtwTable
| where PreciseTimeStamp between(datetime(...) .. datetime(...))
| where TenantName contains "<tenant-id>"
| project PreciseTimeStamp, Context, EntityState, RoleInstanceName, Detail0, ContainerID, NodeID, TenantName, Tenant, Region
```

### 4. LogContainerSnapshot — 容器快照
- 用途：查看 nodeID、containerID、VMSize、Cluster、subscriptionId、RoleInstance 等全景信息
- 关键字段：containerId, containerType, roleInstanceName, nodeId, tenantName, subscriptionId, AvailabilityZone

```kql
LogContainerSnapshot
| where PreciseTimeStamp between(datetime(...) .. datetime(...))
| where tenantName contains "<tenant-id>"
| project PreciseTimeStamp, RoleInstance, containerId, containerType, roleInstanceName, nodeId, tenantName, subscriptionId, updateDomain, roleInstanceFamilyId, Region, AvailabilityZone, availabilitySetName, osReleaseUpgradeType
```

### 5. TMMgmtNodeEventsEtwTable — 节点事件
- 用途：查看特定节点上针对容器的事件
- 关键字段：Message, NodeId, DataCenterName

```kql
TMMgmtNodeEventsEtwTable
| where PreciseTimeStamp between(datetime(...) .. datetime(...))
| where NodeId == "<node-id>"
| where Message contains "<container-id>"
| project PreciseTimeStamp, Message, NodeId, DataCenterName
```

### 6. TMClusterFabricAuditEtwTable — CRP→Fabric 调用审计
- 用途：查看从 CRP 到 Fabric 的所有调用摘要
- 关键字段：Tenant, ActivityId, CorrelationState, InterfaceName, OperationName, ParameterNamesAndValues

```kql
TMClusterFabricAuditEtwTable
| where PreciseTimeStamp between(datetime(...) .. datetime(...))
| where ParameterNamesAndValues contains "<tenant-id>"
| project PreciseTimeStamp, Tenant, RoleInstance, ActivityId, CorrelationState, UserName, InterfaceName, InterfaceNamespace, OperationName, ParameterNamesAndValues, Availabilityzone, Region
```

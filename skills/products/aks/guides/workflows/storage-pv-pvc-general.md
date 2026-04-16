# AKS PV/PVC 与卷管理 — general — 排查工作流

**来源草稿**: ado-wiki-crictl-ctr-operations-aks-nodes.md, onenote-aks-crud-operations-log-tracing.md
**Kusto 引用**: 无
**场景数**: 2
**生成日期**: 2026-04-07

---

## Scenario 1: crictl and ctr operations in AKS nodes
> 来源: ado-wiki-crictl-ctr-operations-aks-nodes.md | 适用: 适用范围未明确

### 排查步骤

#### crictl and ctr operations in AKS nodes

#### Summary

This document introduces crictl and ctr operations for managing container images in AKS nodes. Useful when customers face image pulling issues from registries (auth or connectivity) or want to export/import images.

#### crictl vs ctr

- **crictl**: Manages containers through the Container Runtime Interface (CRI). Works with any CRI-compatible runtime.
- **ctr**: Manages containers directly through containerd. Containerd-specific.

#### Operations Reference

| Operation | crictl | ctr (k8s.io namespace) |
|---|---|---|
| List images | `crictl images` | `ctr -n k8s.io images ls` |
| Show image details | `crictl inspecti <imageID>` | N/A |
| Pull images | `crictl pull --creds '<user>:<pass>' <imageRef>` | `ctr -n k8s.io images pull <imageRef> -u <user>:<pass>` |
| Push images | N/A | `ctr -n k8s.io images push <imageRef> --platform <type> -u <user>:<pass>` |
| Export images | N/A | `ctr -n k8s.io images export <file> <imageRef>` |
| Import images | N/A | `ctr -n k8s.io images import <file>` |
| Retag images | N/A | `ctr -n k8s.io tag <source> <target>` |
| Delete images | `crictl rmi <imageID>` | `ctr -n k8s.io images rm <imageRef>` |
| Delete unused images | `crictl rmi --prune` | N/A |
| List containers | `crictl ps` | `ctr -n k8s.io container ls` |
| List pods | `crictl pods` | N/A |
| Delete containers | `crictl rm <containerID>` | `ctr -n k8s.io container rm <containerID>` |
| Container details | `crictl inspect <containerID>` | `ctr -n k8s.io container info <containerID>` |
| Container log | `crictl logs <containerID>` | N/A |
| Image filesystem info | `crictl imagefsinfo` | N/A |
| Runtime/CNI info | `crictl info` | N/A |

#### Key Notes

- All kubernetes pod images are in the `k8s.io` namespace for ctr
- `crictl imagefsinfo` shows the containerd snapshotter overlay filesystem usage
- `crictl info` shows RuntimeReady, NetworkReady status and CNI configuration

#### References

- [Kubernetes - Debug with crictl](https://kubernetes.io/docs/tasks/debug/debug-cluster/crictl/)
- [GitHub - crictl](https://github.com/kubernetes-sigs/cri-tools/blob/master/docs/crictl.md)
- [GitHub - containerd](https://github.com/containerd/containerd)

---

## Scenario 2: AKS CRUD Operations Log Tracing Guide
> 来源: onenote-aks-crud-operations-log-tracing.md | 适用: Mooncake ✅

### 排查步骤

#### AKS CRUD Operations Log Tracing Guide

End-to-end guide for tracing AKS CRUD operations (create, upgrade, scale, delete) across Azure platform services using Kusto queries. Each section covers a different service layer in the AKS operation pipeline.

#### Call Flow Overview

```
ARM → CRP/NRP/DiskRP → Fabric → RNM → NSM (Node)
                                        ↓
                                       VMA (Availability)
```

**Correlation keys:**
- `ServiceRequestId` in ARM EventServiceEntries == `OperationID` in NRP/CRP
- `Tenants/<ID>` in CRP ContextActivity == `TenantName` in Fabric == `ServiceID` in RNM
- `x-ms-request-id` in CRP == `OperationID` in NRP

---

#### 1. ARM Logs (Node Resource Group)

**Cluster:** `armprod.kusto.windows.net` / **DB:** `ARMProd`

##### EventServiceEntries
Activity logs for all operations in the node resource group. Filter by correlationId to see all sub-operations.

```kql
EventServiceEntries
| where PreciseTimeStamp > datetime(YYYY-MM-DD 00:00:00) and PreciseTimeStamp < datetime(YYYY-MM-DD 23:59:59)
| where subscriptionId has '<subId>'
| where resourceUri contains "MC_<clusterRG>_<clusterName>_<region>"
| where correlationId contains "<correlationId>"
| where operationName notcontains "Microsoft.Authorization/policies/"
| project PreciseTimeStamp, operationName, resourceProvider, correlationId, status, subStatus, properties, resourceUri, eventName, operationId, armServiceRequestId, subscriptionId
| sort by PreciseTimeStamp desc
```

Filter by resource provider to trace specific calls:
- **CRP calls**: `| where operationName contains "microsoft.compute"`
- **NRP calls**: `| where operationName contains "microsoft.network"`
- **DiskRP calls**: `| where operationName contains "Microsoft.Compute/disks/write"`

Note the `armServiceRequestId` to trace into the respective RP.

---

#### 2. NRP Logs (Network Resource Provider)

**Cluster:** `nrp.kusto.windows.net` / **DB:** `mdsnrp`
**MC endpoint:** `cluster('aznwchinamc.chinanorth2.kusto.chinacloudapi.cn').database('aznwmds')`

##### QosEtwEvent
Summary of all NRP operations.

```kql
QosEtwEvent
| where PreciseTimeStamp > datetime(YYYY-MM-DD 00:00:00) and PreciseTimeStamp < datetime(YYYY-MM-DD 23:59:59)
| where SubscriptionId has '<subId>'
| where HttpMethod notcontains "GET"
| where OperationId contains "<operationId>"
| project StartTime, PreciseTimeStamp, CorrelationRequestId, OperationId, HttpMethod, ErrorCode, UserError, Success, ErrorDetails, TeamName, ResourceType, ResourceName, OperationName, Region, TraceSource
```

##### FrontendOperationEtwEvent
Verbose logs for each NRP operation.

```kql
FrontendOperationEtwEvent
| where PreciseTimeStamp > datetime(YYYY-MM-DD 00:00:00) and PreciseTimeStamp < datetime(YYYY-MM-DD 23:59:59)
| where SubscriptionId has '<subId>'
| where OperationId contains "<operationId>"
| project PreciseTimeStamp, EventCode, Message, ResourceName, ResourceGroup, HttpMethod, OperationId, SubscriptionId
```

##### ReadOperationResponseEtwEvent / WriteOperationResponseEtwEvent
Check request/response details for GET/PUT calls. Note: response body might be truncated (logging limitation).

---

#### 3. Fabric Logs

**Cluster:** `azurecm.kusto.windows.net` / **DB:** `AzureCM`

##### TMMgmtTenantEventsEtwTable
Tenant lifecycle events: ServiceHealing, LiveMigration, Allocations, exceptions.

```kql
TMMgmtTenantEventsEtwTable
| where PreciseTimeStamp > datetime(YYYY-MM-DD 00:00:00) and PreciseTimeStamp < datetime(YYYY-MM-DD 23:59:59)
| where TenantName contains "<tenantId>"
| where Message notcontains "Audit"
| project PreciseTimeStamp, Message, TaskName, TenantName, RoleInstance, Tenant, Region, ActivityId
```

##### TMMgmtSlaMeasurementEventEtwTable
Tenant lifecycle and agent node status tracking.

```kql
TMMgmtSlaMeasurementEventEtwTable
| where PreciseTimeStamp > datetime(YYYY-MM-DD 00:00:00) and PreciseTimeStamp < datetime(YYYY-MM-DD 23:59:59)
| where TenantName contains "<tenantId>"
| project PreciseTimeStamp, Context, EntityState, RoleInstanceName, Detail0, ContainerID, NodeID, TenantName, Tenant, Region
```

##### LogContainerSnapshot
Maps nodeID, ContainerID, TenantName, VMSize, Cluster, SubscriptionID, role instances.

```kql
LogContainerSnapshot
| where PreciseTimeStamp > datetime(YYYY-MM-DD 00:00:00) and PreciseTimeStamp < datetime(YYYY-MM-DD 23:59:59)
| where tenantName contains "<tenantId>"
| where subscriptionId == "<subId>"
| distinct roleInstanceName, tenantName, Tenant, virtualMachineUniqueId, nodeId, containerId, subscriptionId, containerType, Region, updateDomain, AvailabilityZone, availabilitySetName
```

##### TMMgmtNodeEventsEtwTable
Container-level events on a node (creation, deletion, redeploy).

```kql
TMMgmtNodeEventsEtwTable
| where PreciseTimeStamp > datetime(YYYY-MM-DD 00:00:00) and PreciseTimeStamp < datetime(YYYY-MM-DD 23:59:59)
| where NodeId contains "<nodeId>"
| where Message notcontains "audit"
| where Message contains "<containerId>"
| project PreciseTimeStamp, Message, NodeId, DataCenterName
```

##### LogFabricatorStartUpDetails
Check for Fabric failover events.

```kql
LogFabricatorStartUpDetails
| where PreciseTimeStamp >= datetime(YYYY-MM-DD 00:00:00)
| where Tenant contains "<clusterName>"
| project PreciseTimeStamp, AvailabilityZone, Region, DataCenterName, Tenant, RoleInstance, phase, durationInMillis
```

---

#### 4. NodeService Logs (Fabric → Node)

**Cluster:** `rdos.kusto.windows.net` / **DB:** `rdos`

##### NodeServiceOperationEtwTable
Track NS agent operations on host node. NodeService talks to Fabric, downloads artifacts, pushes commands to RdAgent.

```kql
NodeServiceOperationEtwTable
| where PreciseTimeStamp >= datetime(YYYY-MM-DD 00:00:00) and PreciseTimeStamp <= datetime(YYYY-MM-DD 23:59:59)
| where NodeId == "<nodeId>"
| where Identifier contains "<containerId>"
| project PreciseTimeStamp, OperationName, Identifier, Result, ResultCode, RequestTime, CompleteTime
```

##### NodeServiceEventEtwTable

```kql
NodeServiceEventEtwTable
| where PreciseTimeStamp >= datetime(YYYY-MM-DD 00:00:00) and PreciseTimeStamp <= datetime(YYYY-MM-DD 23:59:59)
| where NodeId == "<nodeId>"
| where Message contains "<containerId>"
| project PreciseTimeStamp, Cluster, NodeId, Message, Scope
```

---

#### 5. RNM Logs (Regional Network Manager)

**Cluster:** `azurecm.kusto.windows.net` / **DB:** `AzureCM`

##### RnmOperationEvents
RNM tracks network programming completion per tenant.

```kql
RnmOperationEvents
| where PreciseTimeStamp > datetime(YYYY-MM-DD 00:00:00) and PreciseTimeStamp < datetime(YYYY-MM-DD 23:59:59)
| where tenantName == "<fabricTenantName>"
| project PreciseTimeStamp, EventMessage
```

**Jarvis dashboards:**
- ServiceExecutionEvent: `https://jarvis-west.dc.ad.msft.net/404B899C`
- AlertsEvents: `https://jarvis-west.dc.ad.msft.net/AF5FA2DA`

---

#### 6. NSM Logs (Node Service Manager)

**FC → NSM logs**: Jarvis `https://jarvis-west.dc.ad.msft.net/91DDBA72`

##### NM Agent Logs
Download from host node using FcShell or ASC (Host Analyzer → Diagnostics tab):

```powershell
$f = get-fabric <ClusterName>
$n = Get-Node -Id <NodeId> -fabric $f
$c = Get-Container -ContainerId <ContainerId> -fabric $f
#### All VM logs within a container
Get-NodeAgentDiagnostics -DiagnosticType AllLogs -Node $n -DestinationPath C:\logs -startTime 'YYYY-MM-DD HH:mm:ss' -endTime 'YYYY-MM-DD HH:mm:ss'
```

---

#### 7. VMA Logs (VM Availability)

**Cluster:** `vmainsight.kusto.windows.net` / **DB:** `vmadb`

##### VMA
Availability events: unexpected reboot, customer-initiated redeploy, VM deleted, etc.

```kql
VMA
| where Subscription == "<subId>"
| where PreciseTimeStamp >= datetime(YYYY-MM-DD 00:00:00) and PreciseTimeStamp <= datetime(YYYY-MM-DD 23:59:59)
| where RoleInstanceName contains "<vmName>"
| sort by PreciseTimeStamp desc
| project PreciseTimeStamp, TenantName, RoleInstanceName, RCALevel1, RCALevel2, RCALevel3, RCAEngineCategory, Detail, Cluster, NodeId, ContainerId
```

##### WindowsEventTable
Windows event logs from the host node.

##### SubId_HE_Updates
Plugin updates impacting a tenant.

```kql
SubId_HE_Updates(datetime(start), datetime(end), "<subId>")
| where ResourceId contains "<vmUniqueId>"
| project PreciseTimeStamp, RoleInstanceName, LastVariableChange, ResourceId
```

##### HighCpuCounterNodeTable
Check high CPU on the physical node.

##### RootHENodeGoalVersionChange
Trace plugin version changes on nodes.

##### fctmmgmtnodestatechangedetwtable
Node state changes (e.g., HumanInvestigate, Booting, Ready).

##### unhealthynode
Reason for unhealthy state including RCA information.

```kql
unhealthynode
| where PreciseTimeStamp >= datetime(YYYY-MM-DD 00:00:00) and PreciseTimeStamp <= datetime(YYYY-MM-DD 23:59:59)
| where NodeId == "<nodeId>"
| project PreciseTimeStamp, StartTime, OldState, NewState, NodeId, Tenant, sac_message, IcmpPingResult, DiagnosticsDone, sactime, RCA, dumpUrl
```

##### AvailabilitySets
List VMs running under an availability set.

---

#### Investigation Flow

1. Start from **ARM EventServiceEntries** with correlationId
2. Note `armServiceRequestId` for each RP call
3. Trace into **CRP** (compute), **NRP** (network), **DiskRP** (storage) using that ID
4. For node-level issues, get `TenantName` from CRP → use in **Fabric** tables
5. Use `NodeId` from Fabric → trace in **NodeService** and **VMA** tables
6. For network programming, use `TenantName` as `ServiceID` in **RNM**
7. For node-level networking, check **NSM** logs via Jarvis or FcShell

---

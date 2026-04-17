# AKS 节点 NotReady — 排查工作流

**来源草稿**: ado-wiki-a-Managed-Prometheus.md, mslearn-node-not-ready-basic-troubleshooting.md
**Kusto 引用**: node-fabric-info.md
**场景数**: 2
**生成日期**: 2026-04-07

---

## Scenario 1: Troubleshooting Flow
> 来源: ado-wiki-a-Managed-Prometheus.md | 适用: 适用范围未明确

### 排查步骤

##### Suggested Troubleshooting workflow

First check if `ama-metrics-ccp` pod is running and steady in controlplane.

- If Pod steady without restarts: Check logs for prom-collector and configmap-watcher containers.
  - If pod steady and container logs indicate correct functioning, escalate to PG.
- If Pod not present: Check how OverlayMgr evaluates CCP Plugin enablement for cluster.
  - If feature logged not enabled, confirm it is enabled for subscription
  - If addon logged as not enabled or missing overlaymgr entries, confirm cluster has addon enabled
  - If addon and feature enabled, consider checking toggle values.
- If Pod present but restarting / otherwise unstable:
  - Check pod events.
  - Check ControlPlane status on underlay.
  - Check container logs for errors.

##### Check how OverlayMgr evaluates CCP Plugin enablement

```kql
let clusterId = "{Cluster_ID}";
let toggle_parameter = 'azure-monitor-metrics-ccp';
cluster('Aks').database('AKSprod').OverlaymgrEvents
| where PreciseTimeStamp > ago(7d)
| where route == strcat("/v1/overlays/", clusterId ,"/reconcile")
| where method != "GET"
| where msg has (toggle_parameter)
| extend TimeStamp = todatetime(logPreciseTime)
| project TimeStamp, method, message = msg, level
```

##### Check Preview Feature is enabled for the Subscription

```kql
let _startTime = datetime(2023-12-16T21:41:27Z);
let _endTime = datetime(2023-12-20T21:41:27Z);
let _subscription = "{Sub_ID}";
cluster('akshuba.centralus').database('AKSprod').ControlPlaneWrapperSnapshot
| where PreciseTimeStamp between (['_startTime'] .. ['_endTime'])
| where subscriptionID == "{Sub_ID}"
| where featureProfile.subscriptionRegisteredFeatures contains "AzureMonitorMetricsControlPlanePreview"
| take 1
```

##### Check events related to feature flag enablement and toggle values

```kql
let clusterId = "{Cluster_ID}";
let toggle_parameter = dynamic(['azure-monitor-metrics-ccp', 'ama-metrics-ccp']);
cluster('Aks').database('AKSprod').OverlaymgrEvents
| where id == clusterId
| where PreciseTimeStamp > ago(1h)
| where method != "GET"
| where msg has_any (toggle_parameter)
| extend TimeStamp = todatetime(logPreciseTime)
| project TimeStamp, method, message = msg, route, level
| top 2500 by TimeStamp desc
```

##### Check pod events

```kql
let clusterId = "{Cluster_ID}";
cluster('Aks').database('AKSprod').OverlaymgrEvents
| where id == "{cluster_id}"
| where PreciseTimeStamp > ago(2h)
| where method != "GET"
| extend Pod = eventObjectName
| where Pod startswith "ama-metrics-ccp"
| extend TimeStamp = todatetime(logPreciseTime)
| project TimeStamp, Pod, message = eventMessage, level
| top 2500 by TimeStamp desc
```

This can also be found in ASI: `MC page -> Overlay -> CCP Events`

##### Check ControlPlane status on underlay - Deployment status

```kql
let queryFrom = datetime("2023-12-20T19:37:09.192Z");
let queryTo = datetime("2023-12-20T20:37:05.705Z");
let queryUnderlay = "{Underlay_Name}";
let queryNamespace = "{ccpNamespace}";
UnderlayAuditLogs
| where PreciseTimeStamp between(queryFrom .. queryTo)
| where isempty(queryUnderlay) or UnderlayName has queryUnderlay
| where level == "RequestResponse" and stage == "ResponseComplete"
| extend objectRef = parse_json(objectRef)
| where objectRef.resource == "deployments"
| where objectRef.namespace == tostring(queryNamespace)
| where objectRef.subresource == "status"
| extend requestObject = parse_json(requestObject)
| where requestObject.metadata.name == "ama-metrics-ccp"
| extend replicas = requestObject.spec.replicas
| extend readyReplicas = iff((isempty(requestObject.status.readyReplicas)), 0, requestObject.status.readyReplicas)
| mv-expand deploymentConditions = requestObject.status.conditions
| where toupper(deploymentConditions.type) == "AVAILABLE"
| extend IsReady = tostring(deploymentConditions.status)
| extend reason = tostring(deploymentConditions.reason)
| project StartTime = PreciseTimeStamp, ready=strcat(readyReplicas, "/", replicas), reason, IsReady
| sort by StartTime asc
```

---

## Scenario 2: Basic Troubleshooting of Node Not Ready Failures in AKS
> 来源: mslearn-node-not-ready-basic-troubleshooting.md | 适用: 适用范围未明确

### 排查步骤

#### Basic Troubleshooting of Node Not Ready Failures in AKS

#### Overview

AKS continuously monitors worker node health and automatically repairs unhealthy nodes. Node heartbeats use two mechanisms:
- **Node .status updates**: kubelet updates every 5 minutes (or on status change)
- **Lease objects**: kubelet updates every 10 seconds in kube-node-lease namespace (lightweight)

Default timeout for unreachable nodes: 40 seconds.

#### Node Conditions

| Condition | Impact |
|-----------|--------|
| `Ready` | Pod scheduling allowed |
| `NotReady` / `Unknown` | Pod scheduling blocked |
| `MemoryPressure` | Must manage resources before scheduling extra pods |
| `DiskPressure` | Must manage resources before scheduling extra pods |
| `PIDPressure` | Must manage resources before scheduling extra pods |
| `NetworkUnavailable` | Must configure network correctly |

#### Prerequisites Checklist

1. **Cluster state**: Must be `Succeeded (Running)` — check via Azure portal or `az aks show`
2. **Node pool state**: Provisioning state `Succeeded`, Power state `Running` — check via portal or `az aks nodepool show`
3. **Egress ports**: Required ports open in NSGs and firewall for API server IP access
4. **Node images**: Latest node images deployed
5. **Node VM state**: Must be `Running` (not Stopped/Deallocated)
6. **K8s version**: Must be AKS-supported version

#### Key References

- [Kubernetes troubleshooting guide](https://kubernetes.io/docs/tasks/debug/debug-cluster/_print/)
- [feiskyer's Kubernetes handbook](https://github.com/feiskyer/kubernetes-handbook/blob/master/en/troubleshooting/index.md)
- [AKS support coverage for agent nodes](https://learn.microsoft.com/en-us/azure/aks/support-policies#user-customization-of-agent-nodes)
- [AKS outbound requirements](https://learn.microsoft.com/en-us/azure/aks/limit-egress-traffic#required-outbound-network-rules-and-fqdns-for-aks-clusters)

#### Important Notes

- Modifying IaaS resources associated with agent nodes (SSH, package updates, network config changes) is **not supported** by AKS
- AKS manages lifecycle and operations of agent nodes

---

## 附录: Kusto 诊断查询

### 来源: node-fabric-info.md

# 节点 Fabric 层信息查询

## 查询语句

### 通过 LogContainerSnapshot 获取节点底层信息

获取 AKS 节点的 NodeID、ContainerID、Fabric Host（Tenant）等信息，用于进一步 Fabric 层排查。

> ⚠️ Mooncake 集群: `azurecm.chinanorth2.kusto.chinacloudapi.cn`

```kql
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').LogContainerSnapshot
| where PreciseTimeStamp >= ago(2d)
//| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where roleInstanceName contains "{vmssInstanceName}"
| project PreciseTimeStamp, Fabric_Host=Tenant, Node_ID=nodeId, Container_ID=containerId
| top 1 by PreciseTimeStamp desc
```

### 通过 GuestAgentExtensionEvents 获取节点扩展日志

可获取已删除节点或 Spot 实例的日志。

> ⚠️ Mooncake 集群: `azcore.chinanorth3.kusto.chinacloudapi.cn`

```kql
cluster('azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').GuestAgentExtensionEvents
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
//| where PreciseTimeStamp > ago(1d)
| where ContainerId == "{containerId}"
| project PreciseTimeStamp, Level, RoleInstanceName, ContainerId, Name, TaskName, Operation, OperationSuccess, Message
```

## 典型应用场景

1. **获取节点 Fabric 信息** - 从 VMSS 实例名获取 ContainerID/NodeID 用于 Fabric 层查询
2. **已删除节点日志** - Spot 实例被回收后仍可通过 ContainerID 查询扩展日志
3. **跨层关联** - 将 AKS 层问题与 Fabric/CRP 层日志关联

## 关联查询

- [cluster-snapshot.md](./cluster-snapshot.md) - 集群快照
- [operation-tracking.md](./operation-tracking.md) - 操作追踪

---

# AKS Cluster Autoscaler — general — 排查工作流

**来源草稿**: ado-wiki-a-CAS-Scaling-Conditions.md, ado-wiki-b-HPA-not-scaling-pods.md
**Kusto 引用**: autoscaler-analysis.md, cluster-snapshot.md, scale-upgrade-operations.md
**场景数**: 2
**生成日期**: 2026-04-07

---

## Scenario 1: Cluster Autoscaler Scaling Conditions
> 来源: ado-wiki-a-CAS-Scaling-Conditions.md | 适用: 适用范围未明确

### 排查步骤

#### Cluster Autoscaler Scaling Conditions

#### Scale Up

Scale up occurs when pending pods exist that cannot be placed on existing nodes based on resource utilization and pod resource requests. Requirements:
- Pod could be placed on a new node
- Maximum node count not reached
- CAS checks for unschedulable pods every 10 seconds (configurable via --scan-interval)

Pod event on scale-up trigger:
```text
default 31s Normal TriggeredScaleUp pod/nginx-userpool-deployment-6dc7b4d69-5xspw pod triggered scale-up: [{aks-userpool-41179476-vmss 2->4 (max: 4)}]
```

CAS log entries:
```text
Schedulable pods present
newNodes: 0, currentTarget: 4, deallocated: 0, readinessReady: 4 ...
VMSS: aks-userpool-41179476-vmss, in-memory size: 4, new size: 4
```

Conditions preventing scale-up: https://learn.microsoft.com/en-us/azure/aks/cluster-autoscaler-overview#not-triggering-scale-up-operations

Pending pods with affinity/topology constraints: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/troubleshoot-pods-remain-pending-state-scenario

#### Scale Down

Scale down when node resource utilization falls below scale-down-utilization-threshold (sum of cpu/memory requests / allocatable).

kubectl events:
```text
13m Normal ScaleDown node/aks-userpool-41179476-vmss00000s marked as toBeDeleted/unschedulable
```

CAS log entries during scale-down evaluation:
```text
Simulating node aks-userpool-41179476-vmss00000s removal
aks-userpool-41179476-vmss00000s was unneeded for 0s
Successfully added DeletionCandidateOfClusterAutoscaler on node ...
```

No candidates: `No candidates for scale down`

Conditions preventing scale-down: https://learn.microsoft.com/en-us/azure/aks/cluster-autoscaler-overview#scale-down-operation-failures

#### Cluster Autoscaler Profile

Configurable settings: https://learn.microsoft.com/en-us/azure/aks/cluster-autoscaler?tabs=azure-cli#cluster-autoscaler-profile-settings

Example: If workloads run every 15 minutes, adjust scale-down delay to 15-20 minutes.

#### References

- https://learn.microsoft.com/en-us/azure/aks/cluster-autoscaler-overview
- https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/FAQ.md

---

## Scenario 2: Troubleshooting Flow
> 来源: ado-wiki-b-HPA-not-scaling-pods.md | 适用: 适用范围未明确

### 排查步骤

#### HPA status

You can see HPA status using Kusto query. Logs are part of `kube-audit` log.
You need to specify `PreciseTimeStamp`, `ccpNamespace`, `RequestURI`, and optionally `averageUtilization`.

```kusto
let ccp_namespace = "<CCP Namespace>";
let hpa_resource_name = "<HPA Resource Name>";
let average_utilization = 30;
union cluster("akshuba.centralus.kusto.windows.net").database("AKSccplogs").ControlPlaneEvents, cluster("akshuba.centralus.kusto.windows.net").database("AKSccplogs").ControlPlaneEventsNonShoebox
| where PreciseTimeStamp between(datetime(2025-02-28T00:00:00) .. datetime(2025-03-02T00:00:00))
| where ccpNamespace == ccp_namespace
| where category == 'kube-audit'
| extend event=parse_json(tostring(parse_json(properties).log))
| where event.stage == "ResponseComplete"
| where event.objectRef.subresource !in ("proxy", "exec")
| extend verb=tostring(event.verb)
| extend subresource=tostring(event.objectRef.subresource)
| extend Pod = extractjson('$.pod', properties, typeof(string))
| extend Log = extractjson('$.log', properties, typeof(string))
| extend Method = parse_json(tostring((parse_json(properties).log))).verb
| extend RequestURI = tostring(parse_json(tostring((parse_json(properties).log))).requestURI)
| extend User = tostring(parse_json(tostring((parse_json(properties).log))).user.username)
| extend UserAgent = parse_json(tostring((parse_json(properties).log))).userAgent
| extend ResponseStatus = parse_json(tostring((parse_json(properties).log))).responseStatus.code
| where Method !in ("get", "list", "watch")
| where RequestURI contains hpa_resource_name
| summarize take_any(*) by PreciseTimeStamp, RequestURI
| extend currentReplicas = parse_json(Log).requestObject.status.currentReplicas
| extend desiredReplicas = parse_json(Log).requestObject.status.desiredReplicas
| extend conditions = parse_json(Log).requestObject.status.conditions
| extend averageValue = parse_json(Log).requestObject.status.currentMetrics[0].resource.current.averageValue
| extend averageUtilization = parse_json(Log).requestObject.status.currentMetrics[0].resource.current.averageUtilization
| where averageUtilization >= average_utilization
| project PreciseTimeStamp, Method, RequestURI, currentReplicas, desiredReplicas, averageValue, averageUtilization, conditions[0].message
| sort by PreciseTimeStamp asc
```

When Pods are not scaled due to the design of HPA, query results show `currentReplicas == desiredReplicas` with message "recommended size matches current size" while `averageUtilization` fluctuates around the threshold.

HPA controller operates on the ratio between desired metric value and current metric value.
HPA controller skips any scaling action if the ratio is sufficiently close to 1.0 (within a globally-configurable tolerance, 0.1 by default).

For example, if the current metric value is `159m` and the desired metric value is `150m`, we get the following ratio `159 / 150 = 1.06`.
Which differs from 1.0 by 0.06 and so is smaller than the default tolerance of 0.1, hence HPA will not scale up.

#### HPA controller logs

Logs are part of `kube-controller-manager` log.

```kusto
let ccp_namespace = "<CCP Namespace>";
union cluster("akshuba.centralus.kusto.windows.net").database("AKSccplogs").ControlPlaneEvents, cluster("akshuba.centralus.kusto.windows.net").database("AKSccplogs").ControlPlaneEventsNonShoebox
| where PreciseTimeStamp between(datetime(2025-02-28T00:00:00) .. datetime(2025-03-02T00:00:00))
| where ccpNamespace == ccp_namespace
| where category == 'kube-controller-manager'
| extend Log = extractjson('$.log', properties, typeof(string))
| where Log contains "horizontal.go"
| project PreciseTimeStamp, Log
```

If logs show "failed to get cpu resource metric value" or "unable to fetch metrics from resource metrics API" -> Metrics API issue, possibly due to control plane maintenance or tunnel connectivity issue.

---

## 附录: Kusto 诊断查询

### 来源: autoscaler-analysis.md

# Cluster Autoscaler 分析查询

## 用途

查询和分析 Cluster Autoscaler 的操作日志、决策过程、版本信息等。

## 前置条件

首先需要从 `ManagedClusterSnapshot` 获取 CCP Namespace：

```kql
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').ManagedClusterSnapshot
| where PreciseTimeStamp > ago(1d)
| where subscription == "{subscription}"
| where customerResourceGroup == "{resourceGroup}"
| where clusterName == "{cluster}"
| sort by PreciseTimeStamp desc
| project namespace
| take 1
```

---

## 查询 1: Autoscaler 操作日志

### 用途
查看 Cluster Autoscaler 的详细操作日志，包括扩缩容决策。

### 查询语句

```kql
let _ccpNamespace = "{ccpNamespace}";
union cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSccplogs').ControlPlaneEvents,
      cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSccplogs').ControlPlaneEventsNonShoebox
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where namespace == _ccpNamespace
| where category contains "cluster-autoscaler"
| project PreciseTimeStamp, category, log=tostring(parse_json(properties).log)
| sort by PreciseTimeStamp asc
```

---

## 查询 2: Autoscaler 日志（过滤噪音）

### 用途
过滤常见的调试日志，只显示重要操作。

### 查询语句

```kql
let _ccpNamespace = "{ccpNamespace}";
union cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSccplogs').ControlPlaneEvents,
      cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSccplogs').ControlPlaneEventsNonShoebox
| where PreciseTimeStamp > ago(13d)
| where ccpNamespace == _ccpNamespace
| where category == "cluster-autoscaler"
| extend p=parse_json(properties)
| where p.log !contains "request.go" and p.log !contains "clusterstate.go:623"
| project PreciseTimeStamp, log=tostring(p.log), ccpNamespace
| sort by PreciseTimeStamp asc
```

---

## 查询 3: Autoscaler QoS 事件

### 用途
查看 Cluster Autoscaler 的 QoS 事件，包括性能指标。

### 查询语句

```kql
let _ccpNamespace = "{ccpNamespace}";
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').ClusterAutoscalerQosEvents
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where ccpNamespace == _ccpNamespace
| project PreciseTimeStamp, *
```

---

## 查询 4: Autoscaler 版本和重启情况

### 用途
查看 Cluster Autoscaler 的版本、重启次数和容器状态。

### 查询语句

```kql
let queryNamespace = "{ccpNamespace}";
let queryFrom = datetime({startDate});
let queryTo = datetime({endDate});
let queryContainerName = "cluster-autoscaler";
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSinfra').ProcessInfo
| where PreciseTimeStamp between(queryFrom..queryTo)
| where PodNamespace == queryNamespace
| where PodContainerName !in ("POD")
| where ImageRepoTags !in ("")
| where PodContainerStartedAt !in ("")
| where PodContainerName == queryContainerName
| extend ContainerImage = extractjson("$.[0]", ImageRepoTags, typeof(string))
| distinct PodName, PodContainerName, PodContainerRestartCount, PodContainerStartedAt, ContainerImage, ContainerID=ID, Host
| order by PodContainerStartedAt desc
```

---

## 查询 5: Autoscaler CRP 调用（扩缩容操作）

### 用途
查看 Cluster Autoscaler 调用 CRP 进行扩缩容的记录。

### 必要参数
- `{mcResourceGroup}`: 托管资源组（MC_xxx）
- `{vmssName}`: VMSS 名称

### 查询语句

```kql
cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').ApiQosEvent
| where userAgent contains "cluster-autoscaler-aks"
| where resourceGroupName contains "{mcResourceGroup}"
| where resourceName == "{vmssName}"
| where PreciseTimeStamp > datetime({startDate}) and PreciseTimeStamp < datetime({endDate})
| join kind = inner (
    cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').VmssQoSEvent
    | where PreciseTimeStamp > datetime({startDate}) and PreciseTimeStamp < datetime({endDate})
) on $left.operationId == $right.operationId
| project PreciseTimeStamp, operationId, requestEntity, httpStatusCode, resourceName,
         e2EDurationInMilliseconds, userAgent, clientApplicationId, region, predominantErrorCode,
         errorDetails, subscriptionId, vmssName, resourceGroupName
```

## 结果字段说明

| 字段 | 说明 |
|------|------|
| log | Autoscaler 原始日志 |
| PodContainerRestartCount | 容器重启次数 |
| ContainerImage | 容器镜像（包含版本） |
| httpStatusCode | CRP 调用状态码 |
| predominantErrorCode | CRP 主要错误码 |

## 常见 Autoscaler 日志模式

| 日志模式 | 说明 |
|----------|------|
| `Scale-up` | 扩容操作 |
| `Scale-down` | 缩容操作 |
| `Unschedulable pods` | 存在无法调度的 Pod |
| `Node is unneeded` | 节点被标记为不需要 |
| `Node deletion in progress` | 节点删除进行中 |

## 关联查询

- [controlplane-logs.md](./controlplane-logs.md) - 控制平面日志
- [operation-tracking.md](./operation-tracking.md) - 操作追踪

---

### 来源: cluster-snapshot.md

# 集群快照查询

## 用途

获取 AKS 集群的基础信息、CCP Namespace、FQDN、Underlay Name 等关键信息。

## 查询 1: 获取集群基础信息

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {subscription} | 是 | 订阅 ID |
| {resourceGroup} | 是 | 资源组名称 |
| {cluster} | 是 | 集群名称 |

### 查询语句

```kql
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').ManagedClusterSnapshot
| where PreciseTimeStamp > ago(1d)
| where subscription == "{subscription}"
| where customerResourceGroup == "{resourceGroup}"
| where clusterName == "{cluster}"
| sort by PreciseTimeStamp desc
| project namespace, apiServerServiceAccountIssuerFQDN, UnderlayName, provisioningState, powerState, clusterNodeCount
| take 1
```

### 结果字段说明

| 字段 | 说明 |
|------|------|
| namespace | CCP 命名空间（用于控制平面日志查询） |
| apiServerServiceAccountIssuerFQDN | API Server FQDN |
| UnderlayName | Underlay 名称 |
| provisioningState | 预配状态 |
| powerState | 电源状态 |
| clusterNodeCount | 节点数量 |

---

## 查询 2: 查询集群状态历史

### 查询语句

```kql
let _fqdn = cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').ManagedClusterSnapshot
| where PreciseTimeStamp > ago(1d)
| where subscription == "{subscription}"
| where customerResourceGroup == "{resourceGroup}"
| where clusterName == "{cluster}"
| sort by PreciseTimeStamp desc
| project apiServerServiceAccountIssuerFQDN
| take 1;
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').ManagedClusterSnapshot
| where PreciseTimeStamp > ago(90d)
| where apiServerServiceAccountIssuerFQDN in (_fqdn)
| project apiServerServiceAccountIssuerFQDN, PreciseTimeStamp, name, provisioningState, powerState, clusterNodeCount, UnderlayName
| order by PreciseTimeStamp asc
```

---

## 查询 3: 检查集群异常状态

### 查询语句

```kql
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').ManagedClusterSnapshot
| where TIMESTAMP > ago(3d)
| where clusterName contains "{cluster}" and subscription == "{subscription}"
| where ['state'] contains "degraded" or ['state'] == 'Unhealthy'
| project PreciseTimeStamp, provisionInfo, provisioningState, powerState, clusterNodeCount,
         autoUpgradeProfile, clusterName, resourceState
| sort by PreciseTimeStamp desc
```

---

## 查询 4: 检查 Extension Addon Profiles (如 Flux)

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {starttime} | 是 | 开始时间 |
| {endtime} | 是 | 结束时间 |
| {ccpNamespace} | 是 | CCP 命名空间 |

### 查询语句

```kql
let queryFrom = datetime('{starttime}');
let queryTo = datetime('{endtime}');
let queryCcpNamespace = '{ccpNamespace}';
ManagedClusterSnapshot
| where PreciseTimeStamp between(queryFrom..queryTo)
| where ['cluster_id'] == queryCcpNamespace
| summarize arg_max(PreciseTimeStamp, clusterName, extensionAddonProfiles) by cluster_id
| extend extensionAddonProfiles = parse_json(extensionAddonProfiles)
| mv-apply extensionAddonProfiles on (
    project extAddonName = tostring(extensionAddonProfiles.name),
            ProvisionStatus = tostring(extensionAddonProfiles.provisioningState)
)
| extend flux_enabled = tobool(iff(extAddonName=='flux', True, False))
| project extAddonName, flux_enabled, ProvisionStatus
```

## 关联查询

- [operation-tracking.md](./operation-tracking.md) - 追踪操作详情
- [controlplane-logs.md](./controlplane-logs.md) - 控制平面日志

---

### 来源: scale-upgrade-operations.md

# Scale/Upgrade 操作查询

## 查询语句

### 查询 Scale/Upgrade 操作事件

```kql
union cluster("mcakshuba.chinaeast2.kusto.chinacloudapi.cn").database("AKSprod").FrontEndContextActivity,
      cluster("mcakshuba.chinaeast2.kusto.chinacloudapi.cn").database("AKSprod").AsyncContextActivity
| where subscriptionID == "{subscription}"
| where resourceName contains "{cluster}"
| where msg contains "intent" or msg contains "Upgrading" or msg contains "Successfully upgraded cluster" or msg contains "Operation succeeded" or msg contains "validateAndUpdateOrchestratorProfile"
| where PreciseTimeStamp > ago(1d)
//| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| project PreciseTimeStamp, operationID, correlationID, level, suboperationName, msg
| sort by PreciseTimeStamp desc
```

### 查询特定操作的错误消息

使用上一个查询获取的 operationID 深入追踪错误。

```kql
union cluster("mcakshuba.chinaeast2.kusto.chinacloudapi.cn").database("AKSprod").FrontEndContextActivity,
      cluster("mcakshuba.chinaeast2.kusto.chinacloudapi.cn").database("AKSprod").AsyncContextActivity
| where operationID == "{operationId}"
| where level != "info"
| project PreciseTimeStamp, level, msg
| sort by PreciseTimeStamp desc
```

## 结果字段说明

| 字段 | 说明 |
|------|------|
| operationID | 操作 ID，用于追踪单个操作 |
| correlationID | 关联 ID |
| level | 日志级别 (info/warning/error) |
| suboperationName | 子操作名称 |
| msg | 详细消息 |

## 关联查询

- [operation-tracking.md](./operation-tracking.md) - 通用操作追踪
- [cluster-snapshot.md](./cluster-snapshot.md) - 集群快照信息

---

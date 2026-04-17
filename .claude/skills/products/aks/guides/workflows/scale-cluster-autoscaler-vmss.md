# AKS Cluster Autoscaler — vmss — 排查工作流

**来源草稿**: ado-wiki-a-Kusto-queries-Cluster-AutoScaler.md, ado-wiki-a-cluster-autoscaler-vms-agent-pool.md, ado-wiki-b-Audit-query-with-Kusto.md, ado-wiki-b-aci-atlas-investigation-flow-kusto.md, onenote-vmss-scaledown-kusto-tracking.md
**Kusto 引用**: autoscaler-analysis.md, cluster-snapshot.md, scale-upgrade-operations.md
**场景数**: 5
**生成日期**: 2026-04-07

---

## Scenario 1: Kusto Queries for AKS Cluster AutoScaler
> 来源: ado-wiki-a-Kusto-queries-Cluster-AutoScaler.md | 适用: 适用范围未明确

### 排查步骤

#### Kusto Queries for AKS Cluster AutoScaler

#### Overview

Useful Kusto queries for troubleshooting AKS Cluster Autoscaler (CAS).

#### Key References

- CAS GitHub repo: https://github.com/kubernetes/autoscaler/tree/master/cluster-autoscaler
- Azure-specific docs: https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/cloudprovider/azure/README.md
- FAQ: https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/FAQ.md
- Retrieve CAS logs: https://learn.microsoft.com/en-us/azure/aks/cluster-autoscaler#retrieve-cluster-autoscaler-logs-and-status

#### Check Scale Up / Scale Down

CAS logs in CCP logs (retained ~2 weeks):

```kusto
union cluster('akshuba.centralus.kusto.windows.net').database('AKSccplogs').ControlPlaneEvents,
      cluster('akshuba.centralus.kusto.windows.net').database('AKSccplogs').ControlPlaneEventsNonShoebox
| where PreciseTimeStamp > datetime(2023-01-27 03:20:10) and PreciseTimeStamp < datetime(2023-01-27 10:25:30)
| where namespace == "{ccpNamespace}"
| where category contains "autoscaler"
| where properties contains "linuxpool"
| extend Pod = extractjson('$.pod', properties, typeof(string))
| extend Log = extractjson('$.log', properties, typeof(string))
| extend _jlog = parse_json(Log)
| extend requestURI = tostring(_jlog.requestURI)
| extend verb = tostring(_jlog.verb)
| extend user = tostring(_jlog.user.username)
| extend replicas = _jlog.responseObject.status.replicas
| extend readyReplicas = _jlog.responseObject.status.readyReplicas
| extend unavailableReplicas = _jlog.responseObject.status.unavailableReplicas
| project PreciseTimeStamp, category, requestURI, verb, user, Log, replicas, readyReplicas, unavailableReplicas
```

##### Filter for scale-up/scale-down events:
```
| where properties contains "plan" or properties contains "increase"
```

Scale-up example log:
```text
I0124 10:18:13.657890  1 scale_up.go:477] Best option to resize: akspool02
I0124 10:18:13.657927  1 scale_up.go:481] Estimated 1 nodes needed in akspool02
I0124 10:18:13.658006  1 scale_up.go:604] Final scale-up plan: [{akspool02 0->1 (max: 50)}]
```

No unschedulable pods:
```text
I0124 09:20:23.228260  1 static_autoscaler.go:463] No unschedulable pods
```

#### Check Node Unneeded / Deletion

No candidates: `No candidates for scale down`

Node unneeded (default 10min timeout):
```text
I0124 09:20:12.218705  1 scale_down.go:862] aks-xxx was unneeded for 10m2.834256816s
I0124 09:20:12.218863  1 scale_down.go:1146] Scale-down: removing empty node aks-xxx
I0124 09:20:13.029650  1 delete.go:104] Successfully added ToBeDeletedTaint on node aks-xxx
I0124 09:20:13.029864  1 azure_scale_set.go:677] Deleting vmss instances [...]
```

##### Deallocate mode:
```
| where properties contains "deallocat"
```

##### VMSS instance operations:
```
| where properties contains "starting vmss instances"
```

#### Note on Kusto Clusters

Use union of ControlPlaneEvents + ControlPlaneEventsNonShoebox (not ControlPlaneEventsAll which may be empty).

---

## Scenario 2: Cluster Autoscaler - VMS Agent Pool
> 来源: ado-wiki-a-cluster-autoscaler-vms-agent-pool.md | 适用: 适用范围未明确

### 排查步骤

#### Cluster Autoscaler - VMS Agent Pool

**This TSG is specifically for VMS agent pool CAS use cases.**

#### Overview

CAS adjusts nodes by watching pending pods. Enabled via `--enable-cluster-autoscaler --min-count --max-count`.

Key points:
* CAS pod runs in **cx-underlay** (not visible to user)
* Only reacts to `Pod Unschedulable` condition (not resource-based)
* Manages VM pools via **CRP** and **NPS** (Node Provisioner Service)
* Node group name format: `<vms-pool-name>/<sku-size>`
* VM scaling operations are **blocking** (up to 30-min timeout)

#### Triaging Steps

1. Check CAS pod running (not Error/Crash) in underlay namespace
2. Verify VMs nodepool has `VirtualMachinesProfile.Scale.Autoscale` property
3. Check ConfigMap: `kubectl describe configmap -n kube-system cluster-autoscaler-status`

#### Kusto Queries

##### Autoscaler Logs

```sql
union ControlPlaneEvents, ControlPlaneEventsNonShoebox
| where PreciseTimeStamp > ago(1d)
| where ccpNamespace == "{{ccpNamespace}}"
| where category == "cluster-autoscaler"
| extend p=parse_json(properties)
| where p.log !contains "request.go" and p.log !contains "clusterstate.go:623"
| project PreciseTimeStamp, p.log, ccpNamespace
| sort by PreciseTimeStamp asc
```

##### NPS Logs

```sql
NPFrontEndQoSEvents
| where PreciseTimeStamp > ago(1h)
| where userAgent contains "cluster-autoscaler-aks"
| where resourceGroupName contains "{{MC_RESOURCE_GROUP}}"
| where resourceName == "{{clusterName}}"
| where agentPoolName == "{{vmsAgentPoolName}}"
| project-reorder PreciseTimeStamp, operationID, operationName
```

Then dig deeper:
```sql
NPFrontEndContextActivity | where operationID == "{{operationID}}"
NPAsyncContextActivity | where operationID == "{{operationID}}"
```

#### Scale Up Issues

**"No expansion options"** reasons:
1. No nodepool can fit pending pod (capacity, labels)
2. Nodepool at max count
3. Previous failure caused exponential back-off

**Scale-up requests failing**: Check NPS logs for error details. Nodepool enters back-off immediately.

**Nodes not coming up**: CAS tracks unregistered VMs. After `--max-node-provision-time` (default 15 min), longUnregistered nodes are deleted and re-scaled.

#### Scale Down Issues

Reasons for not scaling down:
* Node group at minimum size
* Scale-down disabled annotation on node
* Unneeded for < 10 min (`--scale-down-unneeded-time`)
* Scale-up in last 10 min (`--scale-down-delay-after-add`)
* Failed scale-down in last 3 min (`--scale-down-delay-after-failure`)
* Node utilization > 50% (`--scale-down-utilization-threshold`) - based on **requests sum**, not actual usage

#### Concurrency

* **RP Priority**: RP operations preempt CAS requests
* **CAS scale-up**: Allowed during ongoing RP operations
* **CAS scale-down**: Blocked during non-final RP provisioning state

#### Tuning Recommendations

1. Increase `--max-node-provision-time` for slow-provisioning SKUs
2. Increase `--new-pod-scale-up-delay` to 30-60s for laddered workloads
3. Adjust `--scale-down-utilization-threshold`, `--max-empty-bulk-delete`, `--scale-down-delay-after-add` for aggressive scale-down

**Owner:** Jordan Harder <Jordan.Harder@microsoft.com>

---

## Scenario 3: Kube-Audit logs in Kusto
> 来源: ado-wiki-b-Audit-query-with-Kusto.md | 适用: 适用范围未明确

### 排查步骤

#### Kube-Audit logs in Kusto


#### Overview

##### What is Kubernetes audit log

Reference: [https://kubernetes.io/docs/tasks/debug-application-cluster/audit/]

Currently in Kusto we have audit policy as RequestResponse.

##### Why should we care

Audit log is a good place to identify Kubernetes cluster's historical activity on API level.

It can help us to track down events to understand Kubernetes behavior.

In some cases, Kubernetes can have by-design behavior that doesn't meet customer expectation, or have issues where it doesn't behave as expected. We can provide ground truth to customer to explain the by-design behavior.

##### Limitation

* Performance monitoring data works through metric-server and kubelet API, API resources are not involved.
* Audit may not available for all kind of resources according to how the logs are collected.

#### Scenarios

##### Basics

For a basic query that shows the time, requesting resource URI, verb as per [Kubernetes API resource operations](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.18/#resource-operations), user information and a complete log for further information.

```txt
cluster("akshuba.centralus").database("AKSccplogs").ControlPlaneEventsAll
| where PreciseTimeStamp between (datetime(<starttime>) .. datetime(<endtime>))
| where resourceId has '{AKS_resource_id}'
| where category == 'kube-audit'
| extend Pod = extractjson('$.pod', properties, typeof(string))
| extend Log = extractjson('$.log', properties , typeof(string))
| extend _jlog = parse_json(Log)
| extend requestURI = tostring(_jlog.requestURI)
| extend verb = tostring(_jlog.verb)
| extend user = tostring(_jlog.user.username)
| where verb !in ('get', 'list', 'watch')
//***** basics
| project PreciseTimeStamp, requestURI, verb, user, Log
| take 100
```

Note that log storage location of ccp logs has been changed from

* [aks](https://aks.kusto.windows.net/) to
* [aksccplogs.centralus](https://aksccplogs.centralus.kusto.windows.net/), then to
* [HubA](https://akshuba.centralus.kusto.windows.net/). The original cluster still works, because the original tables are replaced with functions linking to the new cluster for compatibility. Latest tables will have longer retention for ccp logs.

Latest tables:

| Cluster | Environment | Geography |
|--|--|--|
| [HubIntv2](https://akshubintv2.eastus.kusto.windows.net/) | INTv2 | All |
| [HubA](https://akshuba.centralus.kusto.windows.net/) | Production | All |
| [HubB](https://akshubb.westus3.kusto.windows.net/) | Production | All |
| [HubEUA](https://akshubeua.westeurope.kusto.windows.net/) | Production | EU |
| [HubEUB](https://akshubeub.northeurope.kusto.windows.net/) | Production | EU |

For public cloud, HubA/HubB should behave the same.

Example:

![image.png](/.attachments/image-0dfe7f1b-0ee8-4103-8408-26102c5dee67.png)

##### Deployment Replicas

Append the following code right behind the basic query, and command the "***** basics" section

```txt
//***** deployment query
| where properties has @'\/deployments'
| where properties has 'coredns' // coredns for example
| extend replicas = _jlog.responseObject.status.replicas
| extend readyReplicas = _jlog.responseObject.status.readyReplicas
| extend unavailableReplicas = _jlog.responseObject.status.unavailableReplicas
| project PreciseTimeStamp, requestURI, verb, user, replicas, readyReplicas, unavailableReplicas, Log
| take 100
```

Example:

![audit deployment](../../../.attachments/aks-audit-deployment.png)

To switch between different code sections, simply select and use `Ctrl` + `/`

![image.png](/.attachments/image-cc466401-4f6a-4e07-bd58-d5eb19f92708.png)
![image.png](/.attachments/image-3f7b3595-226a-489a-95c4-ad32bdff7c22.png)
![image.png](/.attachments/image-75053c5f-c4d0-4ab0-8270-184567459f10.png)

##### Pod Status

```txt
//***** pod status
| where properties has @'\/pods'
| where properties has 'coredns' // coredns for example
| mv-expand podCond = _jlog.requestObject.status.conditions
| extend ownerType = tostring(_jlog.requestObject.metadata.ownerReferences[0].kind)
| extend ownerName = tostring(_jlog.requestObject.metadata.ownerReferences[0].name)
| extend podCondType = tostring(podCond.type)
| extend podCondStatus = tostring(podCond.status)
| extend podCondReason = tostring(podCond.reason)
| extend podCondMessage = tostring(podCond.message)
| project PreciseTimeStamp, requestURI, verb, user, podCondType, podCondStatus, podCondReason, podCondMessage, Log
```

Example:
![audit pod](../../../.attachments/aks-audit-pod.png)

##### Endpoints Readiness

```txt
//***** endpoints readiness
| where properties has @'\/endpoints'
| mv-expand epSubsets = _jlog.requestObject.subsets
| mv-expand epSubsetsAddress = epSubsets.addresses, epSubsetsNotReadyAddresses=epSubsets.notReadyAddresses
| extend readyIP = tostring(epSubsetsAddress.ip)
| extend notReadyIP = tostring(epSubsetsNotReadyAddresses.ip)
| project PreciseTimeStamp, requestURI, verb, user,readyIP, notReadyIP, Log
```

Example:
![audit endpoints](../../../.attachments/aks-audit-endpoint.png)

##### Node Status

```txt
//***** node status
// | where user != 'nodeclient' // uncomment to filter normal heartbeats
| where properties has @'\/api\/v1\/nodes\/'
| mv-expand nodeCondItem = _jlog.requestObject.status.conditions
| extend nodeCondType = nodeCondItem.type, nodeCondStatus = nodeCondItem.status, nodeCondReason = nodeCondItem.reason, nodeCondMsg = nodeCondItem.message
| project PreciseTimeStamp, requestURI, verb, user, nodeCondType, nodeCondStatus, nodeCondReason, nodeCondMsg, nodeCondItem, Log
```

Example:
![audit nodes](../../../.attachments/aks-audit-node.png)

##### Other interesting lab material

Here's some interesting things we can do with audit log queries.

* Tracing user who deleted a namespace
* Tracing a root cause of a pod deletion
* Tracing HPA activities (even though controller-manager log is in most cases good enough)

#### Be creative

Eventually we can tinker the query for the particular scenario. In the last section we already have some extensions in action, but that will just be a start place for you to dive deeper into particular issue.

The `_jlog` in the examples are the parsed json with "dynamic" data type in Kusto. We can access it as accessing objects in programming languages such as Javascript. No error is given if the key accessed is not found, this permissive behavior  can be helpful for allowing hetero-structural data displayed in the same query.

##### Tidy the Log json for exploring

Reviewing the full Json content is usually the first step of extending.

Below is some methods in common text editors:

* VSCode: Ctrl+Alt+F [https://code.visualstudio.com/docs/languages/json#_formatting]
* Notepad++: Install JSTool from Plugins->Plugins Admin, then formatting with Ctrl+Alt+M

##### Follow the Kusto best practice

The [best practice](https://docs.microsoft.com/en-us/azure/kusto/query/best-practices) allows us to work with Kusto safe and green (Hey how many extra watts were wasted?)

##### extend and mv-expand

[Extend](https://docs.microsoft.com/en-us/azure/kusto/query/extendoperator) and [mv-expand](https://docs.microsoft.com/en-us/azure/kusto/query/mvexpandoperator) from Kusto is good for extracting dynamic fields into the table. This way we can focus on fields that matters instead of reading "Matrix". Please refer to the above examples for real-world usage.

#### Further readings

* [Kusto tutorial](https://docs.microsoft.com/en-us/azure/kusto/query/tutorial?pivots=azuredataexplorer)

#### Owner and Contributors

**Owner:** Luis Alvarez <lualvare@microsoft.com>
**Contributors:**

- Luis Alvarez <lualvare@microsoft.com>
- Enrique Lobo Breckenridge <enriquelo@microsoft.com>
- Ping He <pihe@microsoft.com>
- Naomi Priola <Naomi.Priola@microsoft.com>
- Ines Monteiro <t-inmont@microsoft.com>

---

## Scenario 4: ACI ATLAS Deep Investigation Flow using Kusto
> 来源: ado-wiki-b-aci-atlas-investigation-flow-kusto.md | 适用: 适用范围未明确

### 排查步骤

#### ACI ATLAS Deep Investigation Flow using Kusto

Author: dayconlopes

#### Summary

Sequential guide to investigate all types of events on ACI from top RP layer to Service Fabric. Follow the sequence from step 10 to 100 to get findings in ACI infrastructure at multiple levels.

Complement the investigation with Azure Service Insights (ASI). Make sure the ACI option has been added to your own menu profile before use.

#### Investigation Flow (Steps 10–100)

##### Step 10 — Get cluster deployment name

```kql
cluster('accprod').database('accprod').SubscriptionDeployments
| where TIMESTAMP between (datetime(2023-10-29T08:00:00.000Z)..datetime(2023-10-29T23:00:00.000Z))
| where subscriptionId == "<subscriptionId>"
| where containerGroup contains "<containerGroupCaasName>"
| project TIMESTAMP, containerGroup, clusterDeploymentName
```

##### Step 20 — Get Service Fabric SingleInstance name

```kql
union cluster('atlaslogsamericas.eastus').database('telemetry').SbzExecSFEvent,
      cluster('atlaslogseurope.northeurope').database('telemetry').SbzExecSFEvent,
      cluster('atlaslogsasiapacific.southeastasia').database('telemetry').SbzExecSFEvent
| where PreciseTimeStamp between (datetime(...)..datetime(...))
| where TaskName == "Hosting"
| where Message has "<clusterDeploymentName>"
| parse EventMessage with stuff "Entity={ Id=" SingleInstanceName ",ApplicationName=fabric:/" appName ",InstanceId=" instanceid
| where appName =~ "<clusterDeploymentName>"
| where SingleInstanceName !has "servicePkg"
| distinct SingleInstanceName
```

##### Step 30 — Atlas Control Plane RP Events

Replace `{atlasRegion}` with format `WARP-Prod-<region>` (e.g., "WARP-PROD-BN" = East US 2).
List of all ACI regions: https://eng.ms/docs/products/service-fabric-asgard/warp-cluster-metadata/public-azure-cluster-metadata

```kql
cluster('atlaslogscp.eastus').database('telemetry').SeaBreezeRPEvent
| where Tenant =~ "{atlasRegion}"
| where TIMESTAMP between (datetime(...)..datetime(...))
| where Message has "{clusterDeploymentName}"
| where EventMessage !contains "ifx"
| where Level < 4
| extend dM=parse_json(Message)
| extend activity = dM.activityId, appName = parse_json(tostring(dM.context)).applicationName
| project TIMESTAMP, Tenant, appName, EventMessage, Level, Message
| order by TIMESTAMP asc
```

##### Step 40 — Atlas Data Plane Service Fabric Events (Execution cluster)

```kql
union cluster('atlaslogsamericas.eastus').database('telemetry').SbzExecSFEvent,
      cluster('atlaslogseurope.northeurope').database('telemetry').SbzExecSFEvent,
      cluster('atlaslogsasiapacific.southeastasia').database('telemetry').SbzExecSFEvent
| where PreciseTimeStamp between (datetime(...)..datetime(...))
| where AtlasRegion =~ "{atlasRegion}"
| where TaskName == "Hosting"
| where EventMessage has "{clusterDeploymentName}"
| project PreciseTimeStamp, Pid, Level, TaskName, RoleInstance, EventMessage, Tenant, Role, Message
| sort by PreciseTimeStamp asc
```

##### Step 50 — CaaS deployment full lifecycle

```kql
let caasname= '{clusterDeploymentName}';
let poolname = "{poolname}"; // /pools/ACIBYOVNET/clusters/{clusterId}
let sininstance = "{SingleInstanceName}"; // SingleInstance_#####_App####
union cluster('atlaslogsamericas.eastus').database('telemetry').SbzExecSFEvent,
      cluster('atlaslogseurope.northeurope').database('telemetry').SbzExecSFEvent,
      cluster('atlaslogsasiapacific.southeastasia').database('telemetry').SbzExecSFEvent
| where PreciseTimeStamp between (datetime(...)..datetime(...))
| where AtlasRegion =~ "{atlasRegion}"
| where Role has poolname
| extend jMessage = parse_json(Message)
| extend exitcode = extract('ExitCode=([^,]+),', 1, EventMessage)
| where Message has_any(caasname, sininstance)
| where TaskName notcontains 'Gateway'
| where TaskName has_any('Hosting','RA','FM','CM','PLB')
| where Message notcontains 'atlas-sidecar'
| project PreciseTimeStamp, TaskName, Type = jMessage.type, exitcode, EventMessage, RoleInstance, Message, Role, Level
| sort by PreciseTimeStamp asc
```

##### Step 60 — Container Exit reason

```kql
let ATLASREGION = "{atlasRegion}";
let ROLE="{clusterId}-p-0";
let APP_SUFFIX="{clusterDeploymentName}";
cluster('atlaslogsamericas.eastus').database('telemetry').SbzExecSFEvent
| where PreciseTimeStamp between (datetime(...)..datetime(...))
| where AtlasRegion contains ATLASREGION
| where TaskName contains "Hosting"
| where EventMessage !contains "sidecar"
| where Role contains ROLE
| where EventMessage contains APP_SUFFIX
| where EventMessage contains "ApplicationContainerInstanceExited"
| project PreciseTimeStamp, TaskName, RoleInstance, Pid, EventMessage, Tenant, Role
| sort by PreciseTimeStamp asc
| take 3000
```

##### Step 70 — Find container exit code (7147/7148 = platform kill; ExitCode<>0 = app error)

```kql
let caasname= '{clusterDeploymentName}';
let poolname = '{poolname}';
let sininstance = '{SingleInstanceName}';
let region = "{atlasRegion}";
union cluster('atlaslogsamericas.eastus').database('telemetry').SbzExecSFEvent,
      cluster('atlaslogseurope.northeurope').database('telemetry').SbzExecSFEvent,
      cluster('atlaslogsasiapacific.southeastasia').database('telemetry').SbzExecSFEvent
| where PreciseTimeStamp between (datetime(...)..datetime(...))
| where AtlasRegion has region
| where Role has poolname
| extend jMessage = parse_json(Message)
| extend exitcode = extract('ExitCode=([^,]+),', 1, EventMessage)
| where Message has_any(caasname, sininstance)
| where TaskName has_any('Hosting')
| where RoleInstance has '_Dev_'
| where Message has_any('terminated with exit','exitcode')
| where Message !has '-atlas-sidecar-'
| project PreciseTimeStamp, RoleInstance, exitcode, EventMessage, TaskName, Message, Role, Level
| sort by PreciseTimeStamp asc
```

##### Step 80 — SF responses to Seabreeze (HTTP response codes)

```kql
cluster('atlaslogscp.eastus').database('telemetry').ServiceResponseEvent
| where PreciseTimeStamp between (datetime(...)..datetime(...))
| where uri contains "{uri_identifier}"
| project PreciseTimeStamp, httpMethod, uri, responseCode, exception, activityId
```

##### Step 90 — SF Node Down Events

```kql
union cluster('atlaslogsamericas.eastus').database('telemetry').SbzExecSFEvent,
      cluster('atlaslogseurope.northeurope').database('telemetry').SbzExecSFEvent,
      cluster('atlaslogsasiapacific.southeastasia').database('telemetry').SbzExecSFEvent
| where PreciseTimeStamp between (datetime(...)..datetime(...))
| where AtlasRegion =~ "{atlasRegion}"
| where Role has "{clusterId}"
| where EventMessage startswith "EventName: NodeDown" or EventMessage startswith "EventName: NodeUp"
| project TIMESTAMP, RoleInstance, TaskName, EventMessage, Message
```

##### Step 100 — DNC logs (SF networking-related issues)

```kql
cluster('aznwsdn').database("ACN").Messages
| where Tenant has "DNC"
| where PreciseTimeStamp between (datetime(...)..datetime(...))
| where CustomDimensions has_any("{clusterId}")
| where Raw has_any "{networkId}"
| project Timestamp, Level, Raw, CustomDimensions, CustomDimensionsJson, ClientIp, Tenant
```

#### Other Resources

- ICM: [541562239](https://portal.microsofticm.com/imp/v5/incidents/details/541562239/summary)
- https://learn.microsoft.com/en-us/azure/container-instances/container-instances-troubleshooting
- https://learn.microsoft.com/en-us/troubleshoot/azure/azure-container-instances/management/container-group-restart-killing-event-interruption

#### Owner and Contributors

**Owner:** Daycon Lopes <dayconlopes@microsoft.com>

---

## Scenario 5: AKS Cluster Autoscaler VMSS Scale-Down 追踪指南
> 来源: onenote-vmss-scaledown-kusto-tracking.md | 适用: Mooncake ✅

### 排查步骤

#### AKS Cluster Autoscaler VMSS Scale-Down 追踪指南

当 AKS 节点因 cluster-autoscaler 被 scale down 后，如何通过 Kusto 追踪该节点的历史信息（IP、VM ID、containerId 等）。

#### 步骤 1：通过 Kusto 查看 cluster-autoscaler 日志

Kusto 集群：`akscn.kusto.chinacloudapi.cn` / 数据库：`AKSccplogs`

```kusto
union cluster('Akscn').database('AKSccplogs').ControlPlaneEvents,
      cluster('Akscn').database('AKSccplogs').ControlPlaneEventsNonShoebox
| where PreciseTimeStamp >= datetime(2021-03-13 0:00) and PreciseTimeStamp <= datetime(2021-03-13 1:00)
| where resourceId has '<subscription-id>/resourceGroups/<rg>/providers/Microsoft.ContainerService/managedClusters/<cluster-name>'
| where category == 'cluster-autoscaler'
| extend Log = extractjson('$.log', properties, typeof(string))
| where Log contains "scale_down.go"
| project PreciseTimeStamp, Log
```

日志中会显示被跳过或删除的节点，如：
```
Skipping aks-nodepool-72075615-vmss00005r from delete consideration...
```

#### 步骤 2：将 VMSS 节点名转换为实例 ID

VMSS 节点名后缀使用 Base-36 编码，需转换为十进制才能对应 VMSS 实例 ID。

例：`vmss00005r` → `5r`（Base-36）→ 207（十进制）→ VMSS 实例 `_207`

转换工具：https://www.unitconverters.net/numbers/base-36-to-decimal.htm

#### 步骤 3：查询 VMSS 实例历史信息

Kusto 集群：`azurecm.chinanorth2.kusto.chinacloudapi.cn` / 数据库：`azurecm`

```kusto
LogContainerSnapshot
| where TIMESTAMP >= ago(3d)
| where subscriptionId == "<subscription-id>"
| where roleInstanceName contains "aks-nodepool-72075615-vmss"
| project TIMESTAMP, Tenant, nodeId, roleInstanceName, subscriptionId, containerId, tenantName, virtualMachineUniqueId
| summarize arg_max(TIMESTAMP, *) by containerId
```

#### 步骤 4：查询历史 IP 和 MAC 地址

```kusto
AllocatorServiceContainerAttributes
| where containerId contains "<containerId>"
| project containerId, name, value, PreciseTimeStamp
```

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

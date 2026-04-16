# AKS ACI 网络与 DNS — confidential-containers — 排查工作流

**来源草稿**: ado-wiki-a-confidential-containers-kata-cc.md, ado-wiki-aci-spot-containers-evictions.md, ado-wiki-aci-spot-containers.md, ado-wiki-querying-logs-from-customer-la-workspaces.md
**Kusto 引用**: controlplane-logs.md
**场景数**: 4
**生成日期**: 2026-04-07

---

## Scenario 1: Confidential Containers (kata-cc)
> 来源: ado-wiki-a-confidential-containers-kata-cc.md | 适用: 适用范围未明确

### 排查步骤

#### Confidential Containers (kata-cc)

#### Retirement Notice

**Deprecated, removal scheduled March 2026.** See https://learn.microsoft.com/en-us/azure/aks/confidential-containers-overview for alternatives. Contact Jordan Harder or PM Jack Jiang for questions.

#### Overview

Uses kata runtime (`kata-cc-isolation`) for zero-trust container workloads. Feature owner: Fanglu Guo (fangluguo@microsoft.com).

#### Check if cluster is Kata enabled

```bash
kubectl get runtimeclasses
#### Expect: kata-cc, kata-mshv-vm-isolation, runc
```

RuntimeClass `kata-cc` must exist. If missing: `pods "untrusted" is forbidden: RuntimeClass "kata-cc" not found`

#### Check agent pool is Kata-cc enabled

**ASI**: Cluster page > Node Pools > node pool > Features section > "Is Kata" > Nodes > labels

**az CLI**:
```bash
az aks show -n <clusterName> -g <groupName>
#### Look for: workloadRuntime: KataCcIsolation, vmSize: Standard_DC4as_cc_v5, osSku: AzureLinux
```

**kubectl**:
```bash
kubectl describe nodes <node-name>
#### Look for: kubernetes.azure.com/kata-cc-isolation=true
```

#### Check RP service

```sql
cluster("Aks").database("AKSprod").FrontEndContextActivity
| where PreciseTimeStamp > ago(7d)
| where msg contains "Kata: "
| project msg, resourceGroupName, resourceName, serviceBuild, Environment, region, level, TIMESTAMP
```

Expected: `Kata: Using Mariner Kata distro`

#### Known Issues (Kata bugs)

##### FailedCreatePodSandBox

```
rpc error: code = Unknown desc = failed to create containerd task: failed to create shim task: error: Put "http://localhost/api/v1/vm.boot": EOF
```

Indicates Kata software stack issue. **Escalate to feature owner.**

##### Policy Blocked

`CreateContainerRequest is blocked by policy` or `ExecProcessRequest is blocked by policy`

The operation violates rules.rego genpolicy. By design - update policy to allow intended operation.

##### Pod stuck in Running (should be Succeeded)

Kata e2e test pod stuck in running phase. Cannot reproduce consistently. **Escalate to feature owner.**

#### Known Issues (NOT Kata bugs)

* Too much garbage in e2e underlay (overlay resource reclamation)
* mcr.microsoft.com connectivity issues (not related to Kata)

**Owner:** Jordan Harder <Jordan.Harder@microsoft.com>

---

## Scenario 2: TSG ACI Spot Containers Waiting State Due To Evictions
> 来源: ado-wiki-aci-spot-containers-evictions.md | 适用: 适用范围未明确

### 排查步骤

#### TSG ACI Spot Containers Waiting State Due To Evictions

#### Error Message

Spot Container is in 'Waiting' state after reaching 'Running' state. This typically happens when the undelying Spot VM is evicted and all containers within the Container Group are waiting for a new node to be assigned.

Spot VM node evictions can happen any time due to capacity adjustments.
To know if an evcition has happened we query CRP(Compute Resource Provider) and look for eviction events FabricCallback.OnVMScaleSetVMsEvicted.POST and then map these evictions in Service fabric and check for when the move was initiated to another VM in same or different cluster.

#### Eviction Scenarios

All these scenarios are captured by the following query:

#### Spot ContainerGroup Evictions Query

Plug-in these user inputs to the following query:

* startTime: Start time for query search
* endTime: End time for query search
* cg_location: container group location
* resource_group: resource group name
* container_group: container group name
* cg_subscription_id: Container group subscription Id

```sql
// User Input
let startTime=datetime(2023-04-16 10:00:00);
let endTime=datetime(2023-04-17 15:00:00);
let cg_location="{region}";
let resource_group="{rg_name}";
let container_group="{cg_Name}";
let cg_subscription_id="sub_id";
/// User Input End
let poolId="acispot"; // pool id remains same as we are looking at Spot
let VMEvictions=
cluster('azcrp.kusto.windows.net').database('crp_allprod').ApiQosEvent_nonGet
| where PreciseTimeStamp  between (startTime .. endTime)
| where operationName == "FabricCallback.OnVMScaleSetVMsEvicted.POST"
| where region =~ cg_location
| where resourceGroupName startswith "sbz"
| extend devNodeName=parse_json(requestEntity).roleInstanceNames
| mv-expand devNodeName
| extend EvictionTime = PreciseTimeStamp-((e2EDurationInMilliseconds / 1000) * 1sec)
| project EvictionTime, subscriptionId, operationName, devNodeName=tostring(devNodeName), clusterId=tolower(substring(resourceGroupName,indexof(resourceGroupName,"-")+1,36));
let AppDeployments=
cluster('Accprod').database('accprod').SubscriptionDeployments
| where PreciseTimeStamp  between (startTime .. endTime)
| where priority == "Spot"
| where subscriptionId == cg_subscription_id
| where resourceGroup == resource_group
| where containerGroup == container_group
| where location =~ cg_location
| project Application=clusterDeploymentName, subscriptionId, resourceGroup, containerGroup, location;
let AppJumpEvents =
materialize(AppDeployments | join kind = innerunique
(union
cluster('atlaslogsamericas.eastus').database('telemetry').SbzExecSFEvent,
cluster('atlaslogseurope.northeurope').database('telemetry').SbzExecSFEvent,
cluster('atlaslogsasiapacific.southeastasia').database('telemetry').SbzExecSFEvent) on $left.location==$right.Tenant
| where Role startswith strcat("/pools/", poolId)
| where EventId == "17612" //StateTransition Event
| extend data=parse_json(Message)
| where data.Phase=="1" //MoveSecondary
| where data.Action=="6" //NoActionNeeded
| where data.MoveCost=="3" //High
| where data.Service startswith strcat("fabric:/", Application)
| where TIMESTAMP between (startTime  .. endTime)
| extend NodeId=tostring(data.TargetNode)
| project StartTime=PreciseTimeStamp,
    clusterId=substring(Role, strlen(Role) - indexof(reverse(Role), reverse("/")) - strlen("/")+1),
    Role,
    NodeId,
    Application,
    AtlasRegion,
    OperationCategory=data.category,
    resourceGroup, containerGroup, location);
let AppClusterRoles=AppJumpEvents | project Role;
let AppClusterRegion=AppJumpEvents | distinct AtlasRegion;
let NodeInfo=materialize
(union
cluster('atlaslogsamericas.eastus').database('telemetry').SbzExecSFEvent,
cluster('atlaslogseurope.northeurope').database('telemetry').SbzExecSFEvent,
cluster('atlaslogsasiapacific.southeastasia').database('telemetry').SbzExecSFEvent
| where AtlasRegion in (AppClusterRegion)
| where Role in (AppClusterRoles)
| extend data=parse_json(Message)
| extend NodeId=substring(data.id,0,indexof(data.id,":"))
| where data.EventType == "ApplicationHostManager"
| where RoleInstance startswith "_Dev_"
| where TIMESTAMP between (startTime .. endTime)
| distinct NodeId, RoleInstance, Role);
let CGStartTimes=
NodeInfo |
join kind = innerunique (AppJumpEvents) on NodeId, $left.Role==$right.Role
| project StartTime,
AtlasRegion,
devNodeName=RoleInstance,
clusterId,
NodeId,
Application,
OperationCategory;
VMEvictions
| join kind=rightouter CGStartTimes on devNodeName, $left.clusterId==$right.clusterId
| partition hint.strategy = native by Application(
    sort by StartTime asc
    | extend nextStartTime=next(StartTime,1)
    | extend jumpDuration = nextStartTime-EvictionTime
    | summarize JumpCount=dcount(devNodeName1)-1, JumpDurations=strcat_array(make_list(jumpDuration),","), VMWorkerNodes=strcat_array(make_list(devNodeName1), ","), StartTimeStamps=strcat_array(make_list(StartTime), ","), EvictionTimeStamps=strcat_array(make_list(EvictionTime), ",") by Application, AtlasClusterId=clusterId1, AtlasRegion
    | where JumpCount > 0
)
| project  ContainerGroupSubscriptionId=cg_subscription_id,
            ResourceGroup = resource_group,
            ContainerGroupName = container_group,
            ApplicationId = Application,
            JumpCount,
            JumpDurations,
            VMWorkerNodes,
            EvictionTimeStamps,
            StartTimeStamps,
            AtlasClusterId,
            Location = cg_location,
            AtlasRegion,
            poolId
```

#### Analyzing Spot eviction query results

##### Query Result Fields

| Field | Description |
|--|--|
| ContainerGroupSubscriptionId | Subscription Id used to deploy the Container Group |
| ResourceGroup | Resource Group in which ContainerGroup resides |
| ContainerGroupName | Name of the ContainerGroup |
| ApplicationId | Customer's ContainerGroup application id |
| JumpCount | How many times the CG exited due to eviction |
| JumpDurations | How much time it took for each jump due to eviction |
| VMWorkerNodes | Actual Node Ids where ContainerGroup was present |
| EvictionTimestamp | When the actual eviction of the VM Worker Node occured |
| StartTimeStamps | Initial StartTime for ContainerGroup application on the node and then all others after the jump on other node |
| AtlasClusterId | Actual clusterId in backend where the ContainerGroup is present |
| Location | Location where the ContainerGroup is deployed |
| AtlasRegion | Region where the cluster and ContainerGroup group is present |
| PoolId | Backend Cluster's pool Id |

---

## Scenario 3: Azure Container Instances Spot Containers
> 来源: ado-wiki-aci-spot-containers.md | 适用: 适用范围未明确

### 排查步骤

#### Azure Container Instances Spot Containers

#### Summary

ACI is a popular choice for customers wanting to run containers quickly and simply on Azure without deploying and managing Virtual Machines (VMs). ACI Spot containers run on Spot clusters in Atlas in a separate ACISpot pool where the underlying worker VMs are Spot VMs while leveraging the benefits of a fully managed serverless containers platform.
Spot pool has System nodes and Spot Worker nodes and no gateway nodes since there's no inbound connectivity.

Spot Containers run interruptible, containerized workloads on unused Azure capacity at up-to 70% discounted prices vs regular-priority containers on ACI.

#### Availability

| Phase             | API Version           | Available Regions                |
| ----------------- | --------------------- | -------------------------------- |
| Private Preview   | 2022-04-01-preview    | East US2                         |
| Public Preview    | 2022-10-01-preview    | West Europe, East US2, West US   |

#### Benefits

* Spot Containers make it easy and affordable to run workloads at scale that have a short execution time, do not require uptime SLAs, and often already have logic baked-in to checkpoint state so that process can easily be picked-up in the event the container group is interrupted.

#### Supported Features

* Creation via Portal or AZ CLI without VNET or public IP
* All Restart policies [Never, OnFailure, Always]
* Eviction policy based on available capacity
* Dedicated StandardSpotCores quota category
* Linux/Windows OS Container images
* Logging new events for eviction scenarios

#### Recommended workloads

Parallelizable offline workloads. Examples include:

* Image rendering
* Genomic processing
* Monte Carlo simulations
* Dev/test workloads

#### Priority Property

Spot Container Groups will be exposed to ACI customers as the existing Container Group resource with an additional property - 'priority' which could be 'Regular' or 'Spot'.

#### Deployment Experience

* Priority Property - Should be set to 'Spot'. Defaults to 'Regular'.
* Only Standard SKU is supported for Spot Container deployments.
* GPU is not supported for Spot Container deployments.
* VNET and PublicIP are not supported for Spot Container deployments.

#### Team Info

| Team             | Team Name                         | Components Owned                                          | IcM Path                                              |
| ---------------- | --------------------------------- |---------------------------------------------------------- | ----------------------------------------------------- |
| SpotComputeDev   | Spot Compute Dev Team             | ACISpot Container Data Plane and ACISpot Control Plane    | AzureRT/SpotComputeDev                                |

#### Details needed for IcM

* ResourceURI : /subscriptions/<sub_id>/resourceGroups/<rg_name>/providers/Microsoft.ContainerInstance/containerGroups/<cg_name>
* Priority : Priority of the Container Group.
* Description : Details on the issue.
* PreciseTimeStamp(UTC) : Time at which the issue occured.
* API Version : API Version used in the ARM Template.

---

## Scenario 4: Querying customer Log Analytics using ASC
> 来源: ado-wiki-querying-logs-from-customer-la-workspaces.md | 适用: 适用范围未明确

### 排查步骤

#### Querying customer Log Analytics using ASC

#### Summary

When customers have Container Insights or diagnostic logging enabled for their cluster, the data can be stored in a Log Analytics workspace. This data can be queried using Azure Support Center (ASC) using the following steps.

> **Note**: Please make sure to inform the customer or get their approval before using this feature as workspaces can sometimes have confidential customer data.

#### Details

1. Open ASC and open the Resource Explorer view. While viewing the AKS cluster in question for the case, check the "Addon Profiles" section for `Omsagent Config` and copy the resource ID for the Log Analytics workspace configured for the cluster.

2. Navigate to the Log Analytics workspace in the Resource Explorer and open the "Query Customer Data" tab.

3. You can now use the Kusto query language to query the customer's Log Analytics workspace. For example, the following query will return the last 10 records from the `ContainerLog` table:

   ```kusto
   ContainerLog
   | limit 10
   ```

   It's better to draft your queries in a full-fledged editor, such as your own Log Analytics workspace; this provides syntax highlighting and autocomplete. You can then copy the query into ASC and run it to gather the correct data.

---

## 附录: Kusto 诊断查询

### 来源: controlplane-logs.md

# 控制平面日志查询

## 用途

查询 AKS 控制平面组件日志，包括 API Server、Controller Manager、Scheduler、Etcd、Cluster Autoscaler 等。

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

## 查询 1: 查询 Kube-Controller-Manager 事件

### 查询语句

```kql
let _ccpNamespace = "{ccpNamespace}";
union cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSccplogs').ControlPlaneEvents,
      cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSccplogs').ControlPlaneEventsNonShoebox
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where ccpNamespace == _ccpNamespace or namespace == _ccpNamespace
| where category == "kube-controller-manager"
| project PreciseTimeStamp, category, properties
```

---

## 查询 2: 查询 Kube-API 审计日志

### 查询语句

```kql
let _ccpNamespace = "{ccpNamespace}";
union cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSccplogs').ControlPlaneEvents,
      cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSccplogs').ControlPlaneEventsNonShoebox
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where ccpNamespace == _ccpNamespace or namespace == _ccpNamespace
| where category == "kube-audit"
| extend Pod = extractjson("$.pod", properties, typeof(string))
| extend Log = extractjson("$.log", properties, typeof(string))
| extend _jlog = parse_json(Log)
| extend requestURI = tostring(_jlog.requestURI)
| extend verb = tostring(_jlog.verb)
| extend user = tostring(_jlog.user.username)
| where properties has 'api'
| sort by PreciseTimeStamp desc
| project PreciseTimeStamp, requestURI, verb, user, Log
```

---

## 查询 3: 查询 Cluster Autoscaler 日志

### 查询语句

```kql
let _ccpNamespace = "{ccpNamespace}";
union cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSccplogs').ControlPlaneEvents,
      cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSccplogs').ControlPlaneEventsNonShoebox
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where namespace == _ccpNamespace
| where category contains "cluster-autoscaler"
| project PreciseTimeStamp, category, log=tostring(parse_json(properties).log)
```

---

## 查询 4: 查询 Konnectivity 探针告警

### 查询语句

```kql
let _ccpNamespace = "{ccpNamespace}";
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').AKSAlertmanager
| where namespace == _ccpNamespace
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where alertname == "AgentNodesUnreachable"
| summarize dcount(resource_id) by bin(PreciseTimeStamp, 15min), RPTenant
| render areachart
```

---

## 查询 5: 查询 Webhook 调用失败

### 查询语句

```kql
let _ccpNamespace = "{ccpNamespace}";
union cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSccplogs').ControlPlaneEvents,
      cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSccplogs').ControlPlaneEventsNonShoebox
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where ccpNamespace == _ccpNamespace and category == "kube-apiserver"
| where properties has "failed calling webhook"
| extend json = todynamic(properties)
| project PreciseTimeStamp, log = json.log, pod = tostring(json.pod)
| sort by PreciseTimeStamp desc
```

---

## 查询 6: 查询 CSI Driver Controller 事件

### 查询语句

```kql
let _ccpNamespace = "{ccpNamespace}";
union cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSccplogs').ControlPlaneEventsNonShoebox,
      cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSccplogs').ControlPlaneEvents
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where ccpNamespace == _ccpNamespace
| where category contains "csi-azurefile-controller" or category contains "csi-azuredisk-controller"
| project PreciseTimeStamp, ccpNamespace, category, operationName, properties
| order by PreciseTimeStamp desc
```

---

## 查询 7: 查询 Konnectivity Pod 重启

### 查询语句

```kql
let _ccpNamespace = "{ccpNamespace}";
union cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSccplogs').ControlPlaneEvents,
      cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSccplogs').ControlPlaneEventsNonShoebox
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where ccpNamespace == _ccpNamespace
| where category == 'kube-audit'
| where properties has 'terminated'
| extend log = parse_json(tostring(parse_json(properties).log))
| extend cs = log.requestObject.status.containerStatuses[0]
| where cs.lastState.terminated.reason !in ('', 'Completed')
| project PreciseTimeStamp, reason = cs.lastState.terminated.reason, exitCode = cs.lastState.terminated.exitCode, image = cs.image, pod = tostring(log.objectRef.name), restartCount = cs.restartCount
| summarize PreciseTimeStamp = arg_max(PreciseTimeStamp, *) by pod
| order by PreciseTimeStamp desc
```

## 结果字段说明

| 字段 | 说明 |
|------|------|
| category | 组件类别（kube-apiserver, cluster-autoscaler 等） |
| properties | 日志属性（JSON 格式） |
| requestURI | API 请求 URI（审计日志） |
| verb | HTTP 动词（审计日志） |
| user | 用户名（审计日志） |

## 关联查询

- [cluster-snapshot.md](./cluster-snapshot.md) - 获取 CCP Namespace
- [operation-tracking.md](./operation-tracking.md) - 操作追踪

---

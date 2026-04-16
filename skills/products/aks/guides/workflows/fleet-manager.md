# AKS Fleet Manager — 排查工作流

**来源草稿**: ado-wiki-aks-fleet-manager-debug-gates-approvals.md, ado-wiki-aks-fleet-manager-geneva-actions.md, ado-wiki-aks-fleet-manager-overview.md, ado-wiki-b-aks-fleet-manager-kusto-tables.md, ado-wiki-b-aks-fleet-manager-support-tools.md, ado-wiki-b-fleet-manager-faq.md
**Kusto 引用**: extension-manager.md
**场景数**: 6
**生成日期**: 2026-04-07

---

## Scenario 1: How to debug Gates/Approvals in Fleet update runs
> 来源: ado-wiki-aks-fleet-manager-debug-gates-approvals.md | 适用: 适用范围未明确

### 排查步骤

#### How to debug Gates/Approvals in Fleet update runs

#### Background

Fleet allows customers to configure approvals before and after the updates in their update runs. These approvals are modelled by Gate resources, which link to the update runs they are gating.

Reference: [Public doc](https://learn.microsoft.com/en-us/azure/kubernetes-fleet/update-strategies-gates-approvals) | [Gate APIs](https://learn.microsoft.com/en-us/rest/api/fleet/gates/get?view=rest-fleet-2025-04-01-preview&tabs=HTTP)

#### RBAC permissions

To approve a gate means calling the `PATCH Gate` API, changing the `state` to `Completed`. This uses standard ARM RBAC. There is no new built-in role for approving. It has been added to the **Azure Kubernetes Fleet Manager Contributor Role** so existing users should be able to approve with no additional role assignments.

#### Logs

Gate logs are in the standard Fleet tables, e.g. FleetAPIQoSEvents.

##### Find recent gate approvals

```kql
FleetAPIQoSEvents
| where TIMESTAMP > ago(1d)
| where operationName == "PatchGate"
| project-reorder TIMESTAMP, resourceId, httpStatus
```

#### Debugging: Customer approved a gate, but the update run is still pending

Because gates and update runs are separate resources, approving the gate and updating the matching update run status happen separately. The latter is done asynchronously via a GateDoneEvent message that goes via ServiceBus.

**Common cause**: Customer's code queries the update run *immediately* after sending the approval. They need to wait a second or so before the update run is changed.

##### Check async handling logs

```kql
FleetAsyncContextActivityEvents
| where TIMESTAMP > ago(1d)
| where messageType == "GateDoneEvent"
| project-reorder TIMESTAMP, msg
```

Errors on the async side are not reported to the customer, but should show what's going wrong when updating the update run.

#### ARN integration

Customers can build automation for approvals using ARN/ARG integration to publish customer-facing events to EventGrid SystemTopics. The customer can then route events to Azure Functions or other EventGrid destinations for healthchecks, and if they look good, approve the update run by calling `PATCH Gate` API.

Reference: [ARN Event Schema](https://learn.microsoft.com/en-us/azure/event-grid/event-schema-resource-notifications)

---

## Scenario 2: AKS Fleet Manager and Geneva
> 来源: ado-wiki-aks-fleet-manager-geneva-actions.md | 适用: 适用范围未明确

### 排查步骤

#### AKS Fleet Manager and Geneva


This doc explains how to use Fleet geneva actions

#### Fleet Geneva actions in Jarvis

Fleet geneva actions are found in Jarvis under AKS folder: <https://aka.ms/caravel/geneva>

We currently provide geneva actions to trigger a subset of our APIs operations:

- Fleets
  - Get, Update, Fail
- Fleet Credentials
  - List
- Members
  - Get, List, Update, Fail, Delete
- Membership
  - Get, Update, Fail, Delete
- UpdateRuns - (Update Orchestration)
  - Get, List, Update, Start, Stop, Delete

There are no meaningful fields that can be updated on Members or Fleets resources at this time, so very little can actually be done via these actions.

However, both Fleet and Members point at an AKS cluster.

- A Fleet is backed by an AKS cluster (the hub) and so all Geneva actions from AKS can apply to the hub cluster for troubleshooting.
The `HubProfile` is stored on the ManagedCluster internal datamodel, and can be modified and reconciled via AKS geneva actions.

- A Member of a fleet is an AKS cluster.
The `member agent` configuration is stored in the internal datamodel of the aks cluster. Therefore, AKS geneva actions can be used to
troubleshoot Member clusters as well.
For example, you can change a parameter on the MembershipProfile stored on the ManagedCluster and reconcile it.

#### JIT required

The JIT required to run the Geneva actions is outlined by the geneva action itself. We will only have access to actions requiring PlatformServiceViewer.

- READ actions only require PlatformServiceViewer.
- Put Fleet requires AKSEngineer-PlatformServiceOperator

---

## Scenario 3: AKS Fleet Manager
> 来源: ado-wiki-aks-fleet-manager-overview.md | 适用: 适用范围未明确

### 排查步骤

#### AKS Fleet Manager

_Note: Fleet Manager is considered a separate Azure service from AKS. It has its own support topics, case routing, docs library, CLI commands (az fleet), etc._

#### Overview

Azure Kubernetes Fleet Manager (Fleet) enables multi-cluster and at-scale scenarios for Azure Kubernetes Service (AKS) clusters. A Fleet resource creates a cluster that can be used to manage other member clusters.

Fleet supports the following scenarios:

* Create a Fleet resource and group AKS clusters as member clusters.
* Create Kubernetes resource objects on the Fleet resource's cluster and control their propagation to all or a subset of all member clusters.
* Export a service from one member cluster to the Fleet resource. Once successfully exported, the service and its endpoints are synced to the hub, which other member clusters (or any Fleet resource-scoped load balancer) can consume.

#### Architecture

Fleet consists of a "Hub" cluster that is managed by AKS, and not directly accessible as an AKS cluster. The customer will not be able to manage the resources of the hub cluster.

Once a fleet is created, you can then join up to 20 AKS clusters to the fleet. Clusters from different subscriptions and regions can be joined to a fleet, but must be part of the same tenant. This can enable easier multi-region services.

#### Support Scope

Reference: [Which operations or critical user experiences do you support?](https://msazure.visualstudio.com/CloudNativeCompute/_wiki/wikis/CloudNativeCompute.wiki/447003/Overview-Fleet-RP?anchor=operations%3A-which-operations-or-critical-user-experiences-do-you-support%3F)

#### Training Content

- [Fleet Manager GA - Walkthrough.mp4](https://microsoft.sharepoint.com/teams/AzureCSSContainerServicesTeam/_layouts/15/stream.aspx?id=%2fteams%2fAzureCSSContainerServicesTeam%2fShared%20Documents%2fSupport%20Onboarding%2fFleet%20Manager%20GA%20-%20Walkthrough.mp4)
- [Fleet Manager GA - Walkthrough.pptx](https://microsoft.sharepoint.com/:p:/t/AzureCSSContainerServicesTeam/ESvjjqSPyT9Mn1M7IRUpURoBicr7TvYmeMZxTIUVHWtxJw?e=fNscSf)

#### References

##### Public

- [Azure Kubernetes Fleet Manager](https://learn.microsoft.com/en-us/azure/kubernetes-fleet/)
- [Overview](https://learn.microsoft.com/en-us/azure/kubernetes-fleet/overview)
- [Architectural Overview](https://learn.microsoft.com/en-us/azure/kubernetes-fleet/architectural-overview)
- [FAQ](https://learn.microsoft.com/en-us/azure/kubernetes-fleet/faq)
- [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/fleet?view=azure-cli-latest)

##### Internal

- [Caravel](http://aka.ms/aks-caravel)
- [Overview: Fleet RP](https://msazure.visualstudio.com/CloudNativeCompute/_wiki/wikis/CloudNativeCompute.wiki/447003/Overview-Fleet-RP)
- [TSGs #1](https://eng.ms/docs/cloud-ai-platform/azure-core/azure-management-and-platforms/containers-bburns/azure-kubernetes-service/azure-kubernetes-service-troubleshooting-guide/doc/tsg_toc/tsg-by-sig#sig-multi-cluster)
- [TSGs #2](https://msazure.visualstudio.com/CloudNativeCompute/_wiki/wikis/aks-troubleshooting-guide?pagePath=/fleet)

---

## Scenario 4: Fleet Manager Kusto Tables
> 来源: ado-wiki-b-aks-fleet-manager-kusto-tables.md | 适用: 适用范围未明确

### 排查步骤

#### Fleet Manager Kusto Tables

Below are the Kusto tables that would be used for troubleshooting AKS Fleet Manager operations.

| table | kusto cluster | component | description | sample queries |
|-|-|-|-|-|
| FleetAPIContextActivityEvents | <https://aks.kusto.windows.net/> | fleet-api | Detailed logs for each operation | <https://dataexplorer.azure.com/dashboards/6841e8dc-15a0-4abe-b5d2-37cdcfdde702?#eec4a052-4831-485e-b869-c376d1f4b699>|
| FleetAPIContextlessActivityEvents | <https://aks.kusto.windows.net/> | fleet-api | Logs not associated with any operation | <https://dataexplorer.azure.com/dashboards/6841e8dc-15a0-4abe-b5d2-37cdcfdde702?#03aecb89-e0ae-453a-8785-f26736e166d8> |
| FleetAPIQoSEvents | <https://aks.kusto.windows.net/> | fleet-api | Result and latency for each operation | <https://dataexplorer.azure.com/dashboards/6841e8dc-15a0-4abe-b5d2-37cdcfdde702?#eec4a052-4831-485e-b869-c376d1f4b699>|
| FleetAsyncContextActivityEvents | <https://aks.kusto.windows.net/> | fleet-async | Detailed logs for each operation | <https://dataexplorer.azure.com/dashboards/6841e8dc-15a0-4abe-b5d2-37cdcfdde702?#eec4a052-4831-485e-b869-c376d1f4b699>|
| FleetAsyncContextlessActivityEvents | <https://aks.kusto.windows.net/> | fleet-async | Logs not associated with any operation | <https://dataexplorer.azure.com/dashboards/6841e8dc-15a0-4abe-b5d2-37cdcfdde702?#03aecb89-e0ae-453a-8785-f26736e166d8> |
| FleetAsyncQoSEvents | <https://aks.kusto.windows.net/> | fleet-async | Result and latency for each operation | <https://dataexplorer.azure.com/dashboards/6841e8dc-15a0-4abe-b5d2-37cdcfdde702?#eec4a052-4831-485e-b869-c376d1f4b699>|
| FleetAgentEvents | <https://aksccplogs.centralus.kusto.windows.net/> | fleet hub/member agents | Logs of fleet hub/member agents | <https://dataexplorer.azure.com/dashboards/6841e8dc-15a0-4abe-b5d2-37cdcfdde702?#9d5fdaa3-0c26-45ce-9222-ca1fc5039c65>|

#### Caravel Service Dashboard

[Caravel Fleet Dashboard](https://dataexplorer.azure.com/dashboards/6841e8dc-15a0-4abe-b5d2-37cdcfdde702?p-_startTime=24hours&p-_endTime=now#ea664902-48a0-4ed5-8005-2340e4e97b0f)

#### Reference

[AKS Troubleshooting Guide - Fleet Kusto Tables](https://eng.ms/docs/cloud-ai-platform/azure-core/azure-management-and-platforms/containers-bburns/azure-kubernetes-service/azure-kubernetes-service-troubleshooting-guide/doc/fleet/fleetfleet-kusto-tables)

---

## Scenario 5: AKS Fleet Manager Support Tools
> 来源: ado-wiki-b-aks-fleet-manager-support-tools.md | 适用: 适用范围未明确

### 排查步骤

#### AKS Fleet Manager Support Tools

#### Azure Support Center (ASC)

<https://azuresupportcenter.msftcloudes.com/>

There is a resource type called "fleets" under `Microsoft.ContainerService`. Use the top tab **Members** to see what member clusters are connected.

#### Azure Service Insights (ASI)

<https://azureserviceinsights.trafficmanager.net/>

ASI shows check marks in the **Features** area when viewing an AKS cluster, indicating if it is a Fleet Hub or Fleet Member Cluster.

Additionally, use the **Search** function in ASI to find Fleet Resources and Operation IDs.

#### Jarvis / Geneva Actions

[Jarvis / Geneva Actions (SAW REQUIRED)](https://aka.ms/caravel/geneva)

See Geneva Actions wiki page for screenshots and explanation of actions. JIT required:
- READ actions: PlatformServiceViewer
- Put Fleet: AKSEngineer-PlatformServiceOperator

#### Caravel Service Dashboard

[Caravel Service Dashboard](https://dataexplorer.azure.com/dashboards/6841e8dc-15a0-4abe-b5d2-37cdcfdde702?p-_startTime=24hours&p-_endTime=now#ea664902-48a0-4ed5-8005-2340e4e97b0f)

See Kusto Tables wiki page for links to individual dashboards and Kusto table/cluster names.

---

## Scenario 6: AKS Fleet Manager FAQs
> 来源: ado-wiki-b-fleet-manager-faq.md | 适用: 适用范围未明确

### 排查步骤

#### AKS Fleet Manager FAQs


#### What happens if the identity assigned to a Fleet Member changes?

The Hub will be unable to propagate objects to the Fleet Member until you re-add the cluster to the Fleet.

#### What would the Resource Groups look like for a deployed Fleet Manager cluster?

Creating a Fleet resource creates a Kubernetes Fleet Manager in the Resource Group defined on creation as well as a "Hub" AKS cluster in a `FL_` prefix name Resource Group with an additional `MC_FL_` prefix name Resource Group for the Hub clusters resources.

#### What happens when you remove a Fleet Member from a Fleet?

The member becomes a regular AKS cluster with deployed objects remaining in place.

#### Do objects propagated to Fleet Members get deleted when you remove an AKS cluster from a Fleet?

No they remain in place.

#### What happens when you delete a Fleet Member cluster without removing it from the Fleet first?

It is removed from the Fleet automatically.

#### If I remove a member from the Fleet then delete the objects or namespace the Fleet Hub had pushed to the member cluster, then re-add the member cluster to the Fleet does the Fleet Hub push the same objects via the CRP definition to the re-added member cluster?

Yes it does, the objects are replicated upon cluster being added to Fleet if those objects are able to be placed on the added member by selectors defined in the ClusterResourcePlacement (CRP).

#### Do objects deployed to the Fleet Members also deploy to the Hub cluster?

No, the Hub cluster sends replicated objects to the member clusters with the exception of a ServiceExport installed to a member cluster as that will link to a ServiceImport on the Hub cluster.

#### Must a resource exist in the Hub cluster before it can be replicated to member clusters?

Yes, otherwise it will report:

    Message:               the placement didn't select any resource or cluster when describing the clusterresourceplacement object

#### What cluster would the Ingress be deployed to for an application spread across multiple Fleet Member clusters?

This is dependant on where you deploy your MultiClusterService and which clusters are part of your ClusterResourcePlacement definitions.

Reference:
[How to set up multi-cluster Layer 4 load balancing across Azure Kubernetes Fleet Manager member clusters (preview) | Microsoft Learn](https://learn.microsoft.com/en-us/azure/kubernetes-Fleet/l4-load-balancing) covers installing the MultiClusterService to member-1 via ServiceExport which creates a ServiceImport on the Hub cluster and is inclusive of member-2 cluster where traffic to member-1 LB routes to member-1 and member-2 pods.

From [Azure Kubernetes Fleet Manager architectural overview | Microsoft Learn](https://learn.microsoft.com/en-us/azure/kubernetes-Fleet/architectural-overview) note the following:

    Member clusters MUST reside either in the same virtual network, or peered virtual networks such that pods from different clusters can communicate directly with each other using pod IPs.

#### Do my AKS clusters have to be connected via VNET peering or other mechanisms to use Fleet Manager?

Not unless you intend on having one of the AKS clusters as the ingress for an application that would use multiple AKS clusters as a backend.

#### How do we troubleshoot objects not propagating to Fleet Member clusters?

Describe the ClusterResourcePlacement on the Hub cluster and look at the FILL THIS OUT FOR KUSTO TABLE TO REVIEW

#### How do I specify which clusters my CRP propagates objects to?

See the following articles which cover the workflow and labels applied to nodes for this feature to function as well as ability to use cluster names:

- [Azure Kubernetes Fleet Manager architectural overview | Microsoft Learn](https://learn.microsoft.com/en-us/azure/kubernetes-Fleet/architectural-overview#kubernetes-resource-propagation)
- [Cluster names example](https://gitHub.com/Azure/AKS/blob/master/examples/Fleet/helloworld/hello-world-crp-by-cluster-names.yaml)
- [Cluster location/resource group/subscription example](https://gitHub.com/Azure/AKS/blob/master/examples/Fleet/helloworld/hello-world-crp-by-cluster-labels.yaml)

The following labels are added automatically to all member clusters, which can then be used for target cluster selection in resource propagation:
- `Fleet.azure.com/location`
- `Fleet.azure.com/resource-group`
- `Fleet.azure.com/subscription-id`

#### If I edit an object in a member cluster does the Hub overwrite/reconcile the changes I make?

No it does not.

#### If I edit an object in a Hub cluster does the Hub send those changes to the member clusters automatically?

No it does not.

#### If I delete objects deployed to a member cluster does the Hub re-push them to the member via reconciliation?

Yes it does.

#### Can I troubleshoot member clusters the same as a regular AKS cluster?

Yes - same tooling available as regular AKS clusters (ASI/ASC/AppLens/Jarvis).

#### If I delete a ClusterResourcePlacement in the Hub cluster does that also delete the resources propagated to the member clusters?

Yes. Objects deployed are deleted from the member clusters upon deleting a CRP from a Hub cluster. This is also applicable if you delete a resource object like a namespace on the Hub cluster.

#### Can I propagate an entire namespace?

Yes. ClusterResourcePlacement can be used to select and propagate namespaces, which are cluster-scoped resources. When a namespace is selected, all the namespace-scoped objects under this namespace are propagated to the selected member clusters along with this namespace.

#### Can I stop my Fleet Member and Hub clusters to save money?

You can stop the Fleet Member clusters however the Hub cluster has a policy applied to it to prevent it from being stopped. Attempting to stop the Hub cluster will result in an error stating your client ID does not have permission to perform the stop action on your cluster.

#### Why can't I create Pods on the Hub cluster?

The Hub cluster that the Fleet Members attach to does not allow Pod creation but does allow any other resource creation including Deployments, Service Accounts, etc to be propagated to your Fleet Member clusters as defined in your ClusterResourcePlacement.

#### Owner and Contributors

**Owner:** Eric Lucier <ericlucier@microsoft.com>
**Contributors:**

- Eric Lucier <ericlucier@microsoft.com>

---

## 附录: Kusto 诊断查询

### 来源: extension-manager.md

# Extension Manager 扩展管理器日志

## 用途

查询 AKS 扩展 (Extensions) 的配置代理日志，用于诊断 Flux、Azure Policy 等扩展问题。

## 使用场景

1. **扩展安装失败** - 诊断扩展部署问题
2. **Flux GitOps 问题** - 分析 GitOps 配置错误
3. **Azure Policy 问题** - 诊断策略应用失败

## 查询 1: 检查扩展状态 (从 ManagedClusterSnapshot)

```kql
let queryCcpNamespace = '{ccpNamespace}';
ManagedClusterSnapshot
| where PreciseTimeStamp > ago(1d)
| where cluster_id == queryCcpNamespace
| summarize arg_max(PreciseTimeStamp, clusterName, extensionAddonProfiles) by cluster_id
| extend extensionAddonProfiles = parse_json(extensionAddonProfiles)
| mv-apply extensionAddonProfiles on (
    project extAddonName = tostring(extensionAddonProfiles.name),
            ProvisionStatus = tostring(extensionAddonProfiles.provisioningState)
)
| project extAddonName, ProvisionStatus
```

## 查询 2: 扩展错误日志汇总

```kql
let queryFrom = datetime('{starttime}');
let queryTo = datetime('{endtime}');
let queryNamespace = '{ccpNamespace}';
ExtensionManagerConfigAgentTraces
| where PreciseTimeStamp between(queryFrom .. queryTo)
| where namespace == queryNamespace
| where container != "msi-adapter"
| where LogLevel != "Information"
| extend msg = iff(Message != "na", Message, log)
| extend msg = replace_regex(msg, "^\\d{4}/\\d{2}/\\d{2} \\d{2}:\\d{2}:\\d{2} ", "")
| project PreciseTimeStamp, msg, LogLevel, container, pod
| summarize count=count() by binTime=bin(PreciseTimeStamp, 30m), msg, LogLevel, container, pod
| project binTime, LogLevel, count, msg, container, pod
| order by binTime desc, count desc
```

## 查询 3: Flux 扩展日志

```kql
let queryFrom = datetime('{starttime}');
let queryTo = datetime('{endtime}');
let queryNamespace = '{ccpNamespace}';
ExtensionManagerConfigAgentTraces
| where PreciseTimeStamp between(queryFrom .. queryTo)
| where namespace == queryNamespace
| where container has "flux"
| where LogLevel in ("Warning", "Error")
| project PreciseTimeStamp, LogLevel, Message, log, container, pod
| order by PreciseTimeStamp desc
```

## 查询 4: Azure Policy 扩展日志

```kql
let queryFrom = datetime('{starttime}');
let queryTo = datetime('{endtime}');
let queryNamespace = '{ccpNamespace}';
ExtensionManagerConfigAgentTraces
| where PreciseTimeStamp between(queryFrom .. queryTo)
| where namespace == queryNamespace
| where container has "policy" or container has "gatekeeper"
| where LogLevel in ("Warning", "Error")
| project PreciseTimeStamp, LogLevel, Message, log, container, pod
| order by PreciseTimeStamp desc
```

## 常见扩展容器

| 扩展 | 容器名称模式 |
|------|------------|
| Flux (GitOps) | flux-*, source-controller, kustomize-controller |
| Azure Policy | gatekeeper-*, azure-policy-* |
| Dapr | dapr-*, daprd |
| Key Vault | secrets-store-* |

## 注意事项

- 需要先获取 CCP Namespace
- 过滤掉 `msi-adapter` 容器可以减少噪音
- `LogLevel` 通常为 Information/Warning/Error

---

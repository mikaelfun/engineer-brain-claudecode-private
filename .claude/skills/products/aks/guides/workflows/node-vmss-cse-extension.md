# AKS VMSS CSE 与节点启动 — extension — 排查工作流

**来源草稿**: ado-wiki-a-Marketplace-Kubernetes-Apps.md, ado-wiki-a-Windows-Node-Extension.md, ado-wiki-vmss-cse-exit-codes.md
**Kusto 引用**: extension-manager.md, node-fabric-info.md
**场景数**: 3
**生成日期**: 2026-04-07

---

## Scenario 1: Marketplace Kubernetes Applications on AKS
> 来源: ado-wiki-a-Marketplace-Kubernetes-Apps.md | 适用: 适用范围未明确

### 排查步骤

#### Marketplace Kubernetes Applications on AKS


#### Summary

K8s Applications are currently published by ISVs under Azure Container product category. Each k8s application can be identified by a Publisher, Product and Plan.
This guide is to help identify issues with purchase of K8s Applications from Azure Marketplace by the Customers.

#### Scenario

1. User selects a Product\offer\Plan from Azure Marketplace.
2. User provides inputs in the UX presented once offer purchase is initiated.
3. User  accepts EULA and creates.
4. The create initiates an ARM deployment.

#### Components and Ownership

| Component |Description  | Owner |
|--|--|--|
|  Microsoft.KubernetesConfiguration/extensions| The resources which represents the offer  | Arc Extensions Platform team |
|  Microsoft.ContainerService/managedClusters|  the offer may need a new cluster to be created| AKS team  |
|  Helm Chart| ISV provides helm chart and Microsoft distributes it from Microsoft's owned ACR | ISV  |
| ARM template | ISV authors it with Microsoft(Arc team) Provided guidance |  ISV|
|  CreateUIDef | ISV authors it with Microsoft(Arc team) Provided guidance  | ISV |
|  Usage Extension | Microsoft's own extension to collect usage data and is installed before the application is installed | Arc Extensions Platform team  |

ARM template will contain two resources:

- Microsoft.ContainerService/managedClusters
- Microsoft.KubernetesConfiguration/extensions

##### Component and Owner Identification flow

- End user reported a Container offer issue
  - Is it transactable Container offer-k8s?
    - End user reported a Portal navigation issue → Portal team
    - End user reported an ARM deployment error → Identify failed resource:
      - Microsoft.ContainerService/managedClusters → AKS team
      - Microsoft.KubernetesConfiguration/extensions → Arc Extensions Platform team
      - Microsoft.KubernetesConfiguration/extensions/UsageExtension → Arc Extensions Platform team

##### Extension Deployment Failure

#### Information to gather from the Customer

- Subscription\ResourceGroup
- Cluster Arm Resource url
- Correlatition Id displayed in the operation details
- Publisher\offer\plan information
- Region customer is trying to deploy the resource in

#### Initial Analysis

1. Rule out any issues with the cluster health at the time of deployment.
   1. Customer may check the Activity log on the cluster.
2. Confirm on the customers ability to purchase.
   1. the Error on the reource indicates a Store API error.
3. Rule out if the customer has registered the required RPs

##### Prerequisites

1. Get ReadOnly access to **PTN-ClusterConfig** from myaccess/
1. Download Kusto.Explorer from <https://aka.ms/ke>, or use web version from <https://dataexplorer.azure.com>

##### Kusto tables

|Name|Description|
| ---|-----------|
| ConfigAgentTraces  | This table has Arc extension operator and Arc agent log  from  user k8s cluster.|
| ClusterConfigTraces | This table has Arc Azure Service (Resource provider and Data plane) logs.  |

##### Queries

```txt
//Logs by extension instance name or ARM ID
cluster("clusterconfigprod").database("clusterconfig").ClusterConfigTraces
| where ['time'] >= ago(1h)
| where Tenant == "{tenant-Region}"
| where RequestPath contains "extensions/{replaceyourinstancename}" or ArmId contains "{clusterName}"

// Logs by ARM correlation ID or client request ID
cluster("clusterconfigprod").database("clusterconfig").ClusterConfigTraces
| where ['time'] >= ago(1h)
| where Tenant == "{tenant-Region}"
| where CorrelationId == "{CorrelationId}"

// Extension operator logs by extension type
cluster("clusterconfigprod").database("clusterconfig").ConfigAgentTraces
| where ['time'] >= ago(1d)
| where CorrelationId == "{CorrelationId}"

// Extension operator logs by ARM ID
cluster("clusterconfigprod").database("clusterconfig").ConfigAgentTraces
| where ['time'] >= ago(1d)
| where ArmId contains "{ExtensionName}"
```

##### Usage Extension deployment Failure

Usage extension failures can be seen from the CLI. it is installed only for extensions which are not BYOL.

CLI: `az k8s-extension list -g newstablevote -c newstablevote -t managedclusters -o table`

#### Escalation Path

- ICM Team: Cluster Configuration/Cluster Configuration Triage
- Feature Team: <ramyateam@microsoft.com>

#### References

- Public Docs Troubleshooting: <https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/troubleshoot-failed-kubernetes-deployment-offer>
- Extension Types CLI: <https://learn.microsoft.com/en-us/cli/azure/k8s-extension/extension-types?view=azure-cli-latest>
- Offer Samples: <https://github.com/Azure-Samples/kubernetes-offer-samples>

---

## Scenario 2: Windows Node Extension Troubleshooting Guide
> 来源: ado-wiki-a-Windows-Node-Extension.md | 适用: 适用范围未明确

### 排查步骤

#### Windows Node Extension Troubleshooting Guide

#### Overview

AKS Windows nodes have the Azure VM extension  () installed on the VMSS instance. It manages Windows system services including .

Verify extension:

#### Prerequisites

- Customer can run:
- Use GenevaAction to get WindowsGuestVMLogs

#### Diagnostic Sequence

##### 1. windows-exporter logs
- stdout:
- stderr:
- Check service status:
- If service not running → check extension logs

##### 2. Extension logs
- Path:
- Extension script/config:
- If no extension logs → check VM Agent logs

##### 3. VM Agent log (Kusto)


##### 4. aks-operator log (Kusto)


#### Known Issue: Port 19182 Conflict

AKS windows-exporter uses port 19182. Customer deployments using same port will conflict.

See JSONL entry  for full break-fix details.

**Kusto to detect hostPort 19182 conflicts:**


#### Owner
Jordan Harder (joharder@microsoft.com)

---

## Scenario 3: vmssCSE Exit Code Landing Page
> 来源: ado-wiki-vmss-cse-exit-codes.md | 适用: 适用范围未明确

### 排查步骤

#### vmssCSE Exit Code Landing Page


#### Overview

This page serves as a landing page for exit codes generated by the AKS vmssCSE custom script extension. It provides links to both internal and public documentation for each exit code, biasing towards public documentation where available.

#### Exit Codes with Internal Documentation

All exit codes under this header have additional internal documentation available. This should be supplementary to what's already available in the public documentation.

[vmssCSE failures during node provisioning](/Azure-Kubernetes-Service-Wiki/AKS/TSG/CRUD/CSE-Exit-Codes/vmssCSE-failures-during-node-provisioning.md)

##### Windows-specific Internal Documenation

In some cases, exit codes may be unique to Windows and may require additional documentation specific to that platform.

#### Exit Codes with Public Documentation

All exit codes under this header have public documentation available. Whenever possible, link the customer out to the public troubleshooting guides.

* **Exit Code 41** `CniDownloadTimeoutVMExtensionError`: <https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/error-code-cnidownloadtimeoutvmextensionerror>
* **Exit Code 50** `OutboundConnFailVMExtensionError`: <https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/error-code-outboundconnfailvmextensionerror>
* **Exit Code 51** `K8SAPIServerConnFailVMExtensionError`: <https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/error-code-k8sapiserverconnfailvmextensionerror>
* **Exit Code 52** `K8SAPIServerDNSLookupFailVMExtensionError`: <https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/error-code-k8sapiserverdnslookupfailvmextensionerror>
* **Exit Code 65** `ERR_VHD_FILE_NOT_FOUND`: <https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/error-code-vhdfilenotfound>

##### Windows-specific Exit Codes

* **Exit Code 5** `WINDOWS_CSE_ERROR_CHECK_API_SERVER_CONNECTIVITY`: <https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/windows-cse-error-check-api-server-connectivity>

#### Owner and Contributors

**Owner:** Rory Lenertz <rorylen@microsoft.com>

**Contributors:**

* Rory Lenertz <rorylen@microsoft.com>

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

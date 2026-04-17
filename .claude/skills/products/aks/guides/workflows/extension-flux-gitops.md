# AKS Flux / GitOps — 排查工作流

**来源草稿**: ado-wiki-a-Microsoft-Flux-Extension-Installation-TSG.md
**Kusto 引用**: extension-manager.md
**场景数**: 1
**生成日期**: 2026-04-07

---

## Scenario 1: Extension Installation TSG
> 来源: ado-wiki-a-Microsoft-Flux-Extension-Installation-TSG.md | 适用: 适用范围未明确

### 排查步骤

#### Extension Installation TSG


#### Generic Extension Installation Failures

##### Authentication with the Dataplane is Failing

There may be some issue in the authentication with the dataplane inside the `config-agent` that is causing all other calls to fail. Check the pod logs of the `config-agent` to look for the following log lines

> **Note:** You won't be able to use Kusto to find auth issues because this cluster will not even be able to push logs to the dataplane.

```bash
#### If you see lines here, it means that the cluster was not able to retrieve an auth token
kubectl logs -n azure-arc config-agent-xxx -c config-agent --since 1d | grep "In clusterIdentityCRDInteraction status not populated"

#### Logs here indicate the reason that the status is not populated is because we are unable to get the certificate from HIS and reflects some issue with HIS/identity
kubectl logs -n azure-arc clusteridentityoperator-xxx -c manager --since 1d | grep "Failed to get certificate from HIS with error"
```

```bash
#### Looks for 401/403 lines here to indicate that the token we are using to communicate is not valid
kubectl logs -n azure-arc config-agent-xxx -c config-agent --since 1d | grep "GET configurations returned response code"
```

Some issues related to auth may reflect that the cluster identity no longer exists in Azure. Validate that the `connectedCluster` resource still exists in ARM with

```bash
az connectedk8s show -g <resource-group> -n <cluster-name>
```

If this returns a 404, recommend that the customer re-onboard to Azure with

```bash
az connectedk8s connect -g <resource-group> -n <cluster-name>
```

If not and the identity exists, there is some service issue and a CRI will need to be opened

##### ExtensionConfig CRD Doesn't Exist

You can validate this by performing and looking for `extensionconfigs.clusterconfig.azure.com`

```bash
kubectl get crds
```

If you do not see this CRD on the cluster, recommend that the customer upgrade the cluster to re-install the ExtensionConfig CRD

```bash
az connectedk8s upgrade -g <resource-group> -n <cluster-name>
```

##### Other Issues with Config Agent Apply of Extension Config

If there is not an auth issue in the `config-agent`, there is most likely some other issue with the parsing of some parameters when attempting to apply the `extensionconfig` to the cluster.

```bash
cluster("clusterconfigprod").database("clusterconfig").ClusterConfigTraces
| where ['time'] > ago(2d)
| where ArmId =~ "{armId}"
| where AgentName == "ConfigAgent"
| where LogLevel =~ "error"
```

```bash
kubectl logs -n azure-arc config-agent-xxx -c config-agent --since 1d
```

#### Extension Heartbeat

```bash
cluster("clusterconfigprod").database("clusterconfig").ClusterConfigTraces
| where ['time'] >= ago(1d)
| where Message contains "PostStatus Success"
| parse Message with "PostStatus Success" * "configName=extension:" name "," * "configKind=" type "," * "extensionType=" extensionType "," * "releaseTrain=" releaseTrain "," * "version=" extensionVersion "," *  "autoUpdate=" autoUpdate "," * "state=" installState
| project type, extensionType, releaseTrain, extensionVersion, autoUpdate, installState, ArmId, Location, name
| where type == "Extension"
| summarize pingcount=count() by ArmId, name, extensionType, extensionVersion, Location, autoUpdate
```

##### Extension API calls

#### Logs by extension instance name or ArmId

```bash
cluster("clusterconfigprod").database("clusterconfig").ClusterConfigTraces
| where ['time'] >= ago(1h)
| where Location == "{eastus2euap}"
| where RequestPath contains "extensions/<replaceyourinstancename>" or ArmId contains "yourclustername"
```

#### Logs by ARM CorrelationId or ClientRequestId

```bash
cluster("clusterconfigprod").database("clusterconfig").ClusterConfigTraces
| where ['time'] >= ago(1h)
| where Location == "{eastus2euap}"
| where CorrelationId == "{correlation_id}"  or ClientRequestId == "operation client request Id"
```

#### Table for all exceptions

```bash
cluster("clusterconfigprod").database("clusterconfig").ClusterConfigTraces
| where ['time'] >= ago(1h)
| where Location == "{eastus2euap}"
| where Message contains "{some_message}"
| where ClientRequestId  == "{client_Id}"
```

#### Finding ReleaseTrain based on ArmId

```bash
cluster("clusterconfigprod").database("clusterconfig").ClusterConfigTraces
| where Message contains "ClusterConfigService.CreateExtensionDetails" and Message contains "{extensionType}"
| where RequestPath contains "{armId}"
```

##### Agent Logs

#### Extension operator logs by extensionType

```bash
cluster("clusterconfigprod").database("clusterconfig").ClusterConfigTraces
| where ['time'] >= ago(1d)
| where AgentName contains "{openservicemesh}"
```

#### Extension operator logs by ArmId

```bash
cluster("clusterconfigprod").database("clusterconfig").ClusterConfigTraces
| where ['time'] >= ago(1d)
| where ArmId contains "{Arm_id}"
```

#### Failed extensions logs

```bash
cluster("clusterconfigprod").database("clusterconfig").ClusterConfigTraces
| where ['time'] >= ago(1d)
| where LogLevel =~ "Error" and AgentName contains "Appservice"
```

#### Successfully installed extensions by type

```bash
cluster("clusterconfigprod").database("clusterconfig").ClusterConfigTraces
| where ['time'] >= ago(1d)
| where Message contains "{Successfully installed the extension}" and Message contains "cassandradatacentersoperator"
```

**Note:** CorrelationID column can be used to query all related logs both Agent Side and Azure Services

##### Partner TSGs

- [OSM Team TSGs](https://msazure.visualstudio.com/CloudNativeCompute/_wiki/wikis/CloudNativeCompute.wiki/121602/TSG-OSM-Arc)

> **Note:** If unable to resolve issues, escalate to Microsoft.KubernetesConfiguration Team

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

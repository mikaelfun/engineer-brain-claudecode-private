# AKS Cluster Autoscaler — autoscaler — 排查工作流

**来源草稿**: ado-wiki-cluster-upgrades-using-arm.md, ado-wiki-getting-container-throttling-values.md
**Kusto 引用**: autoscaler-analysis.md, cluster-snapshot.md, scale-upgrade-operations.md
**场景数**: 2
**生成日期**: 2026-04-07

---

## Scenario 1: How to upgrade a cluster using an ARM Template
> 来源: ado-wiki-cluster-upgrades-using-arm.md | 适用: 适用范围未明确

### 排查步骤

#### How to upgrade a cluster using an ARM Template

#### Instructions for Portal

1. Navigate to the AKS cluster in Azure Portal, click "Export Template" under Automation, then click Deploy.
2. Click "Edit Template".
3. Update the Kubernetes version in the template:
   - Control Plane version (Properties section)
   - Each node pool version (system and user pools)
   - There may be multiple version references (e.g., line 39, 52, 67, 134, 155 in the example)
4. Click Save, then Review + Create, then Create.
5. The cluster control plane and node pools will show "Upgrading" state with the new version.

#### Instructions for CLI

1. Navigate to the AKS cluster, click "Export Template" under Automation, then click Download.
2. Extract the downloaded zip file (contains parameters.json and template.json).
3. Edit template.json — update all Kubernetes version references (control plane + each node pool).
4. Deploy using Azure CLI:
   ```
   az group deployment create -g aksrg --template-file template.json
   ```
5. The cluster will show "Upgrading" state.

#### Key Points

- All version references in the ARM template must be updated: control plane AND each node pool.
- The `az group deployment create` command is used for CLI deployment (note: newer CLI versions use `az deployment group create`).

---

## Scenario 2: Getting Container CPU Throttling Values on Node Level
> 来源: ado-wiki-getting-container-throttling-values.md | 适用: 适用范围未明确

### 排查步骤

#### Getting Container CPU Throttling Values on Node Level

#### Objective

Parse the cAdvisor metrics from a node to extract `container_cpu_cfs_throttled_seconds_total` values per container.

#### Method

Use the Kubernetes raw API to get cAdvisor metrics from a specific node:

```
kubectl get --raw /api/v1/nodes/<NODE_NAME>/proxy/metrics/cadvisor
```

#### Python Script

```python
import json
import re
import subprocess
import sys

cmdline = "kubectl get --raw".split(" ")
fileName = "/tmp/rawmetrics"

def getmetrics(cmd):
    full_cmd = cmdline + [cmd]
    process = subprocess.run(full_cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, universal_newlines=True)
    if process.returncode == 3:
        raise ValueError("invalid arguments: {}".format(cmdline))
    if process.returncode == 4:
        raise OSError("fping reported syscall error: {}".format(process.stderr))
    file1 = open(fileName, "w")
    file1.write(process.stdout)
    file1.close()
    return process.stdout

def lookfor(word):
    word = 'container_cpu_cfs_throttled_seconds_total'
    with open(fileName, 'r') as fp:
        lines = fp.readlines()
        for line in lines:
            if line.find(word) != -1:
                if line.find("#") == -1:
                    values = line.split(" ")
                    marker1 = '{'
                    marker2 = '}'
                    regexPattern = marker1 + '(.+?)' + marker2
                    str_found = re.search(regexPattern, line).group(1)
                    column = str_found.split(",")
                    print(column[5], "  ", values[1])

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python cadvisor.py nodeName")
    else:
        nodeName = sys.argv[1]
        apicall = "/api/v1/nodes/" + nodeName + "/proxy/metrics/cadvisor"
        metric_output = getmetrics(apicall)
        lookfor("container_cpu_cfs_throttled_seconds_total")
```

#### Usage

```bash
python cadvisor.py <node-name>
```

Output shows container names with their total throttled seconds.

#### Owner

Point of Contact: oborlean@microsoft.com

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

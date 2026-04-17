---
name: autoscaler-analysis
description: Cluster Autoscaler 分析查询
tables:
  - ControlPlaneEvents
  - ControlPlaneEventsNonShoebox
  - ClusterAutoscalerQosEvents
  - ProcessInfo
parameters:
  - name: ccpNamespace
    required: true
    description: CCP 命名空间（从 ManagedClusterSnapshot 获取）
  - name: startDate
    required: true
    description: 开始时间
  - name: endDate
    required: true
    description: 结束时间
---

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

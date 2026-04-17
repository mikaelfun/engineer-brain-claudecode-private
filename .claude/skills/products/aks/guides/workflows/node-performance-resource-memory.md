# AKS 节点性能与资源管理 — memory — 排查工作流

**来源草稿**: ado-wiki-b-Map-processes-to-pods-resource-usage.md, ado-wiki-c-Using-ASI-to-Check-Node-Performance.md, ado-wiki-calculating-allocatable-memory-linux-node.md, ado-wiki-la-query-aks-node-cpu-memory-alerts.md, ado-wiki-tsg-resource-exhaustion.md
**Kusto 引用**: node-fabric-info.md
**场景数**: 5
**生成日期**: 2026-04-07

---

## Scenario 1: Troubleshooting Flow
> 来源: ado-wiki-b-Map-processes-to-pods-resource-usage.md | 适用: 适用范围未明确

### 排查步骤

1. **Identify the target node**:
   ```bash
   kubectl get pods -o wide
   ```

2. **Access the node via debug pod**:
   ```bash
   kubectl debug node/<node-name> -it --image=mcr.microsoft.com/dotnet/runtime-deps:6.0
   ```

3. **Enter host namespace**:
   ```bash
   chroot /host
   ```

4. **Find high-resource processes**:
   Run `top` and press `Ctrl+M` to sort by memory usage. Note the PIDs consuming the most resources.

5. **Map PID to container**:
   Run `ps axjf` and trace the PID hierarchy to find the parent `containerd-shim-runc-v2` process. The `-id` parameter contains the container ID.

   Example process tree:
   ```
   1 1146246 ... /usr/bin/containerd-shim-runc-v2 -namespace k8s.io -id a06266483112c0b3...
   1146246 1146266 ... /pause
   1146246 1146435 ... java -jar /app.jar   # <-- high resource PID
   ```

6. **Get pod name from container ID**:
   Copy first 5-8 characters from the `-id` string and run:
   ```bash
   crictl pods | grep "a0626648"
   ```
   Output shows the pod name:
   ```
   a06266483112c  7 hours ago  Ready  hello-world-rest-api-55d9d4c59d-wkmwr  default  0  (default)
   ```

---

## Scenario 2: How to use Azure Service Insights (ASI) to check AKS node performance metrics
> 来源: ado-wiki-c-Using-ASI-to-Check-Node-Performance.md | 适用: 适用范围未明确

### 排查步骤

#### How to use Azure Service Insights (ASI) to check AKS node performance metrics


#### Summary

This document provides information around how to use Azure Service Insights (ASI) to check AKS node performance metrics.

Node performance may be slower than expected, or the customer may report a node performance or stability issue.

#### Checking node performance metrics

##### Select a Time Range

First, select a time range which you would like to review the node metrics for. To do this, set the Time Range values in ASI. In this example, we are viewing a three-hour window.

##### Select the node

After opening the cluster in ASI, scroll down and click **Nodes**, **Cluster Nodes**, and in **Node Table** of cluster nodes select the name of the node.

Next, scroll down to the **Fabric Placements** section and click the GUID hyperlink for the node under **Analyzer (VM)**.

On the **Analyzer (VM)** page you can view the Disk Latency, the average CPU usage, and the available memory.

##### Checking CPU Percentage

To view the CPU usage, click **VM Counters**, **Shoebox**, and then select **VM CPU**.

Note: The CPU data is based off **average** values, so the max CPU is the max of the average over the sampling period.

In a scenario where there is CPU exhaustion, you may observe that the AvgCPU or MaxCPU values are at or near 100% for a specific timeframe.

##### Available Memory

To view the available memory, click **VM Counters**, **Shoebox**, and then select **VM Memory**.

In a scenario where memory pressure exists, you will observe that no memory or a very small amount of memory is available for a specific timeframe.

##### VM Disk IO Latency Stats

Select **VM Disk IO Latency Stats** to view the disk latency metrics.

Very high latencies will be highlighted in red by the tool.

You can select specific disks for the node by clicking the **Azure Host VM Active Blobs Filter** option.

Note that for checking disk latency metrics, focus on a narrower time frame (+/- 5 minutes of a specific error or issue occurrence).

##### Related articles

* [High memory usage handling in k8s](Azure-Kubernetes-Service-Wiki/AKS/How-Tos/Compute/Linux/High-memory-usage-handling-in-k8s.md)
* [Detecting Disk IO Throttling](Azure-Kubernetes-Service-Wiki/AKS/TSG/Compute/Detecting-Disk-IO-Throttling.md)
* [AKS Performance Investigation Flow](Azure-Kubernetes-Service-Wiki/AKS/TSG/Cluster-Management/AKS-Performance-Investigation-Flow.md)
* [VM Performance Troubleshooting Guideline](Azure-Kubernetes-Service-Wiki/AKS/TSG/Compute/Virtual-Machine-TSGs/VM-Performance-Troubleshooting-Guideline.md)

---

## Scenario 3: Calculating allocatable memory on a Linux AKS node
> 来源: ado-wiki-calculating-allocatable-memory-linux-node.md | 适用: 适用范围未明确

### 排查步骤

#### Calculating allocatable memory on a Linux AKS node

#### Formula

**Usable node memory = User Space Available memory - Kube Reserved - Hard Eviction Threshold - Current Memory Requests**

##### 1. Kernel Space Memory (~3% of total VM memory)

```bash
dmesg | grep Memory:
#### Output: Memory: 65811048K/67107716K available (... 1296668K reserved ...)
#### Green = user space available, Red = total VM memory
```

##### 2. Kube-Reserved Memory

Formula from [AKS docs](https://learn.microsoft.com/en-us/azure/aks/concepts-clusters-workloads#resource-reservations):
- 25% of first 4 GB
- 20% of next 4 GB (up to 8 GB)
- 10% of next 8 GB (up to 16 GB)
- 6% of next 112 GB (up to 128 GB)
- 2% of any memory above 128 GB

Example: 64 GiB VM → 1+0.8+0.8+2.88 = 5.48 GiB (5611Mi)

Verify:
```bash
kubectl debug node/<node> -it --image=mcr.microsoft.com/dotnet/runtime-deps:6.0
chroot /host
ps -ef | grep kubelet | grep "kube-reserved"
#### --kube-reserved=cpu=260m,memory=5611Mi
```

##### 3. Hard Eviction Threshold

Default: 750 MiB

```bash
ps -ef | grep kubelet | grep "eviction-hard"
```

##### 4. System Pods and DaemonSets

Sum memory requests of all system pods on node. Use separate system nodepool to reduce impact.

##### Example (64 GiB VM)

55.76 GiB = 62.76 - 5.48 - 0.75 - 0.776

---

## Scenario 4: Log Analytics query to configure AKS node alerts for CPU and Memory metrics
> 来源: ado-wiki-la-query-aks-node-cpu-memory-alerts.md | 适用: 适用范围未明确

### 排查步骤

#### Log Analytics query to configure AKS node alerts for CPU and Memory metrics

#### Summary

This article provides Log Analytics queries to configure alerts on AKS nodes for CPU and memory metrics.

#### CPU utilization going above 80%

```kql
let endDateTime = now();
let startDateTime = ago(1h);
let trendBinSize = 1m;
let capacityCounterName = 'cpuCapacityNanoCores';
let usageCounterName = 'cpuUsageNanoCores';
KubeNodeInventory
| where TimeGenerated < endDateTime
| where TimeGenerated >= startDateTime
| distinct ClusterName, Computer
| join hint.strategy=shuffle (
  Perf
  | where TimeGenerated < endDateTime
  | where TimeGenerated >= startDateTime
  | where ObjectName == 'K8SNode'
  | where Computer contains "<node name>"
  | where CounterName == capacityCounterName
  | summarize LimitValue = max(CounterValue) by Computer, CounterName, bin(TimeGenerated, trendBinSize)
  | project Computer, CapacityStartTime = TimeGenerated, CapacityEndTime = TimeGenerated + trendBinSize, LimitValue
) on Computer
| join kind=inner hint.strategy=shuffle (
  Perf
  | where TimeGenerated < endDateTime + trendBinSize
  | where TimeGenerated >= startDateTime - trendBinSize
  | where ObjectName == 'K8SNode'
  | where Computer contains "<node name>"
  | where CounterName == usageCounterName
  | project Computer, UsageValue = CounterValue, TimeGenerated
) on Computer
| where TimeGenerated >= CapacityStartTime and TimeGenerated < CapacityEndTime
| project ClusterName, Computer, TimeGenerated, UsagePercent = UsageValue * 100.0 / LimitValue
| where UsagePercent > 80
| summarize AggregatedValue = avg(UsagePercent) by bin(TimeGenerated, trendBinSize), Computer
```

#### Memory Utilization going above 80%

```kql
let endDateTime = now();
let startDateTime = ago(1h);
let trendBinSize = 1m;
let capacityCounterName = 'memoryCapacityBytes';
let usageCounterName = 'memoryRssBytes';
KubeNodeInventory
| where TimeGenerated < endDateTime
| where TimeGenerated >= startDateTime
| distinct ClusterName, Computer
| join hint.strategy=shuffle (
  Perf
  | where TimeGenerated < endDateTime
  | where TimeGenerated >= startDateTime
  | where ObjectName == 'K8SNode'
  | where Computer contains "<node name>"
  | where CounterName == capacityCounterName
  | summarize LimitValue = max(CounterValue) by Computer, CounterName, bin(TimeGenerated, trendBinSize)
  | project Computer, CapacityStartTime = TimeGenerated, CapacityEndTime = TimeGenerated + trendBinSize, LimitValue
) on Computer
| join kind=inner hint.strategy=shuffle (
  Perf
  | where TimeGenerated < endDateTime + trendBinSize
  | where TimeGenerated >= startDateTime - trendBinSize
  | where ObjectName == 'K8SNode'
  | where Computer contains "<node name>"
  | where CounterName == usageCounterName
  | project Computer, UsageValue = CounterValue, TimeGenerated
) on Computer
| where TimeGenerated >= CapacityStartTime and TimeGenerated < CapacityEndTime
| project ClusterName, Computer, TimeGenerated, UsagePercent = UsageValue * 100.0 / LimitValue
| where UsagePercent > 80
| summarize AggregatedValue = avg(UsagePercent) by bin(TimeGenerated, trendBinSize), Computer
```

---

## Scenario 5: tsg-resource-exhaustion
> 来源: ado-wiki-tsg-resource-exhaustion.md | 适用: 适用范围未明确

### 排查步骤

If there was a slow VM caused by resource exhaustion, please provide below recommendations based on the context

1. Customer should configure a reasonable resource limits on their pods and packing the nodes less [  Ref : [Managing Resources for Containers](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/) / [Resource management best practices - Azure Kubernetes Service](https://docs.microsoft.com/en-us/azure/aks/developer-best-practices-resource-management#define-pod-resource-requests-and-limits)

1. Dedicated node pool for running System Resources and PODs

1. Leveraging ephemeral OS Disk [Cluster configuration in Azure Kubernetes Services (AKS) - Azure Kubernetes Service](https://docs.microsoft.com/en-us/azure/aks/cluster-configuration#ephemeral-os)

1. Paid SLA for production level cluster for better ApiServer stability Ref [Azure Kubernetes Service (AKS) Uptime SLA](https://docs.microsoft.com/en-us/azure/aks/uptime-sla)

1. If above suggestion doesn't fix the slow VM, they may need to review their application to see any kind of Memory leak/PORTS exhaustion/application logic (may be a tight loop) etc, and they can leverage [Linux Performance Troubleshooting](https://docs.microsoft.com/en-us/azure/aks/troubleshoot-linux) for isolating the issue.

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

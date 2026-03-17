---
name: vm-health
description: VM 健康状态查询 - 监控 VM 健康状态和性能指标
tables:
  - VmHealthRawStateEtwTable
  - VmHealthTransitionStateEtwTable
  - VmCounterFiveMinuteRoleInstanceCentralBondTable
  - KyberVmAvailabilityMetricEmission  # ⚠️ Mooncake 不可用
  - VmShoeboxCounterTable
  - HighCpuCounterNodeTable
parameters:
  - name: containerId
    required: true
    description: 容器 ID
  - name: nodeId
    required: false
    description: 节点 ID
  - name: vmid
    required: false
    description: VM 唯一 ID
  - name: starttime
    required: true
    description: 开始时间
  - name: endtime
    required: true
    description: 结束时间
---

# VM 健康状态查询

## 用途

监控 VM 健康状态，包括 Hyper-V IC 心跳、电源状态、性能计数器等。用于诊断 VM 可用性和性能问题。

## 必要参数

| 参数 | 必填 | 说明 | 示例 |
|------|------|------|------|
| {containerId} | 是 | 容器 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| {nodeId} | 否 | 节点 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| {vmid} | 否 | VM 唯一 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| {starttime} | 是 | 开始时间 | 2025-01-01T00:00:00Z |
| {endtime} | 是 | 结束时间 | 2025-01-02T00:00:00Z |

## 查询语句

### 查询 VM 健康状态原始数据

```kql
cluster('azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').VmHealthRawStateEtwTable
| where PreciseTimeStamp between (datetime({starttime}) .. datetime({endtime}))
| where ContainerId == "{containerId}"
| project PreciseTimeStamp, VmHyperVIcHeartbeat, VmPowerState, HasHyperVHandshakeCompleted, 
         IsVscStateOperational, ContainerId
| order by PreciseTimeStamp asc
```

### 查询 VM 健康状态转换

```kql
cluster('azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').VmHealthTransitionStateEtwTable
| where PreciseTimeStamp between (datetime({starttime}) .. datetime({endtime}))
| where ContainerId == "{containerId}"
| project PreciseTimeStamp, VmHyperVIcHeartbeatState, VmPowerState, VmHyperVHandshakeState, 
         VmOsCompositeState, VmVscState, VmCompositeState, Context
| order by PreciseTimeStamp asc
```

### 通过 VM ID 查询健康状态

```kql
let vmids = split("{vmid}", ",");
cluster('azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').VmHealthRawStateEtwTable 
| where PreciseTimeStamp between (datetime({starttime}) .. datetime({endtime}))
| where VirtualMachineUniqueId in (vmids)
| project PreciseTimeStamp, ContainerId, NodeId, VmHyperVIcHeartbeat, VmPowerState
```

### 查询 VM 性能计数器

```kql
cluster('azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').VmCounterFiveMinuteRoleInstanceCentralBondTable
| where PreciseTimeStamp between (datetime({starttime}) .. datetime({endtime}))
| where ContainerId == "{containerId}"
| project PreciseTimeStamp, CpuPercentage, MemoryPercentage, DiskReadBytesPerSecond, 
         DiskWriteBytesPerSecond, NetworkBytesInPerSecond, NetworkBytesOutPerSecond
| order by PreciseTimeStamp asc
```

### 查询 Kyber VM 可用性指标

> ⚠️ **Mooncake 不可用**: KyberVmAvailabilityMetricEmission 表在 Mooncake 环境中不存在，仅 Global 可用。Mooncake 请改用 VMA 表 (vmainsight) 查询可用性。

```kql
cluster('azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').KyberVmAvailabilityMetricEmission
| where PreciseTimeStamp between (datetime({starttime}) .. datetime({endtime}))
| where ContainerId == "{containerId}"
| project PreciseTimeStamp, IsAvailable, UnavailabilityReason, ContainerId, NodeId
| order by PreciseTimeStamp asc
```

## 结果字段说明

| 字段 | 说明 |
|------|------|
| VmHyperVIcHeartbeat | Hyper-V IC 心跳状态（string: HeartBeatStateOk / HeartBeatStateNoContact） |
| VmPowerState | VM 电源状态（string: PowerStateEnabled / PowerStateDisabled） |
| HasHyperVHandshakeCompleted | Hyper-V IC 握手是否完成（bool: true/false） |
| IsVscStateOperational | VSC 状态是否正常（bool: true/false） |
| Context | VM 上下文状态（string: VirtualMachineRestarted / StartVm / StopVm） |

## 常见状态值

| VmHyperVIcHeartbeat | 说明 |
|---------------------|------|
| HeartBeatStateOk | 心跳正常 |
| HeartBeatStateNoContact | 无心跳 |

| VmPowerState | 说明 |
|--------------|------|
| PowerStateEnabled | 运行中 |
| PowerStateDisabled | 已关闭 |

## 变体查询

### 检查心跳丢失时间段

```kql
cluster('azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').VmHealthRawStateEtwTable
| where PreciseTimeStamp between (datetime({starttime}) .. datetime({endtime}))
| where ContainerId == "{containerId}"
| where VmHyperVIcHeartbeat == "HeartBeatStateNoContact"
| project PreciseTimeStamp, VmHyperVIcHeartbeat, VmPowerState, Context
| order by PreciseTimeStamp asc
```

### 查询 VM 可用性注解

> ⚠️ **Mooncake 不可用**: KyberAnnotationEvent 表在 Mooncake 环境中不存在，仅 Global 可用。

```kql
cluster('azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').KyberAnnotationEvent
| where PreciseTimeStamp between (datetime({starttime}) .. datetime({endtime}))
| where ContainerId == "{containerId}"
| project PreciseTimeStamp, AnnotationType, AnnotationMessage, ContainerId
| order by PreciseTimeStamp asc
```

## 关联查询

- [container-snapshot.md](./container-snapshot.md) - 获取 containerId
- [node-events.md](./node-events.md) - 节点事件查询
- [vma-analysis.md](./vma-analysis.md) - VMA 可用性分析

---

## 补充查询

### 查询 VM Shoebox 性能计数器 (客户视图)

此查询返回 Shoebox 数据源的 VM 性能指标，与 Azure Portal 中的指标一致：

```kql
cluster('https://azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').VmShoeboxCounterTable
| where TIMESTAMP between (datetime({starttime}) .. datetime({endtime}))
| where isempty("{subscription}") or subscriptionId has "{subscription}"
| where isempty("{vmname}") or VmName has "{vmname}"
| where isempty("{containerId}") or VmId has "{containerId}"
| where isempty("{vmid}") or VMUniqueId has "{vmid}"
| where isempty("{nodeId}") or NodeId has "{nodeId}"
| project PreciseTimeStamp, MDMCounterName, AverageValue
| order by PreciseTimeStamp asc
```

### 查询 VM 性能计数器详细 (节点/内部视图)

```kql
cluster('https://azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').VmCounterFiveMinuteRoleInstanceCentralBondTable
| where TIMESTAMP between (datetime({starttime}) .. datetime({endtime}))
| where isempty("{vmname}") or RoleInstanceId has "{vmname}"
| where isempty("{containerId}") or VmId has "{containerId}"
| where isempty("{nodeId}") or NodeId has "{nodeId}"
| project PreciseTimeStamp, Cluster, TenantId, NodeId, VmId, RoleId, RoleInstanceId, CounterName, SampleCount, AverageCounterValue, MinCounterValue, MaxCounterValue
| summarize sum(AverageCounterValue) by PreciseTimeStamp, CounterName
| order by PreciseTimeStamp asc
```

### 查询主机高 CPU 事件

检查 VM 所在节点是否存在高 CPU 情况，可能影响 VM 性能：

```kql
let NodeIds =
    cluster("azurecm.chinanorth2.kusto.chinacloudapi.cn").database("azurecm").LogContainerSnapshot
    | where TIMESTAMP between (datetime({starttime}) .. datetime({endtime}))
    | where isempty("{subscription}") or subscriptionId has "{subscription}"
    | where isempty("{vmname}") or roleInstanceName has "{vmname}"
    | distinct nodeId;
cluster("azcore.chinanorth3.kusto.chinacloudapi.cn").database("Fa").HighCpuCounterNodeTable
| where NodeId in (NodeIds)
| project TIMESTAMP, NodeId, CounterName, CounterValue
| take 50000
```

### 生成 VM 性能 Dashboard 链接

```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let subscriptionId = "{subscription}";
let VMName = "{vmname}";
let ContId = "{containerId}";
let ShoeBoxMdm = materialize(
    cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('AzureCM').LogClusterSnapshot
    | where shoeboxMdmAccountName != ""
    | extend shoe = trim(" ", shoeboxMdmAccountName)
    | distinct Region, shoeboxMdmAccountName=shoe
);
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').LogContainerSnapshot
| where PreciseTimeStamp >= starttime and PreciseTimeStamp <= endtime
| where ((isnotempty(subscriptionId) and subscriptionId =~ subscriptionId and isnotempty(roleInstanceName) and roleInstanceName contains VMName)) 
    or (isnotempty(containerId) and containerId == ContId)
| summarize STARTTIME=min(TIMESTAMP), ENDTIME=max(TIMESTAMP) by nodeId, containerId, tenantName, Tenant, roleInstanceName, containerType, virtualMachineUniqueId, subscriptionId, Region
| join kind=inner ShoeBoxMdm on $left.Region == $right.Region
| project STARTTIME, ENDTIME, nodeId, containerId, tenantName, Tenant, roleInstanceName, virtualMachineUniqueId, shoeboxMdmAccountName
| order by ENDTIME desc, Tenant asc, tenantName asc
| extend VMPERF_dashboard_URL = strcat("https://portal.microsoftgeneva.com/dashboard/RDOS/Shoebox/VMPerf-WithParameters?overrides=[{\"query\":\"//*[id%3D%27ResourceId%27]%22,%22key%22:%22value%22,%22replacement%22:%22", virtualMachineUniqueId, "%22},{\"query\":\"//dataSources%22,%22key%22:%22account%22,%22replacement%22:%22", shoeboxMdmAccountName, "%22}]%20")
| project STARTTIME, ENDTIME, containerId, roleInstanceName, VMPERF_dashboard_URL
```

### 常用性能计数器说明

| CounterName | 说明 |
|-------------|------|
| \\Processor(_Total)\\% Processor Time | CPU 使用率 |
| \\Memory\\% Committed Bytes In Use | 内存使用率 |
| \\PhysicalDisk(_Total)\\Disk Reads/sec | 磁盘读取 IOPS |
| \\PhysicalDisk(_Total)\\Disk Writes/sec | 磁盘写入 IOPS |
| \\Network Interface(*)\\Bytes Received/sec | 网络入站字节 |
| \\Network Interface(*)\\Bytes Sent/sec | 网络出站字节 |

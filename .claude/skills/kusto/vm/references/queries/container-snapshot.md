---
name: container-snapshot
description: 容器快照查询 - 获取 VM 的 Fabric 层信息 (containerId/nodeId/tenantName)
tables:
  - LogContainerSnapshot
  - LogContainerHealthSnapshot
  - VMApiQosEvent
  - GuestAgentExtensionEvents
  - NodeServiceEventEtwTable
parameters:
  - name: subscription
    required: true
    description: 订阅 ID
  - name: vmname
    required: true
    description: VM 名称
  - name: nodeId
    required: false
    description: 节点 ID
---

# 容器快照查询

## 用途

获取 VM 在 Fabric 层的关键信息，包括 containerId、nodeId、tenantName 等。这些信息是进行深入诊断的基础。

## 必要参数

| 参数 | 必填 | 说明 | 示例 |
|------|------|------|------|
| {subscription} | 是 | 订阅 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| {vmname} | 是 | VM 名称 | myvm |
| {nodeId} | 否 | 节点 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |

## 查询语句

### 获取 VM 的 containerId 和 nodeId

```kql
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').LogContainerSnapshot
| where TIMESTAMP > ago(7d)
| where subscriptionId == "{subscription}"
| where roleInstanceName has "{vmname}"
| project TIMESTAMP, subscriptionId, Tenant, tenantName, containerId, nodeId, roleInstanceName, 
         availabilitySetName, containerType, Region, virtualMachineUniqueId, AvailabilityZone
| summarize arg_max(TIMESTAMP, *) by containerId
```

### 查看 VM 迁移历史

```kql
let sid = "{subscription}"; 
let vmname = "{vmname}";  
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').LogContainerSnapshot  
| where subscriptionId == sid and roleInstanceName has vmname 
| summarize min(PreciseTimeStamp), max(PreciseTimeStamp) by roleInstanceName, creationTime, 
         virtualMachineUniqueId, Tenant, containerId, nodeId, tenantName, containerType
| project VMName=roleInstanceName, VirtualMachineUniqueId=virtualMachineUniqueId, Cluster=Tenant, 
         NodeId=nodeId, ContainerId=containerId, ContainerCreationTime=todatetime(creationTime), 
         StartTimeStamp=min_PreciseTimeStamp, EndTimeStamp=max_PreciseTimeStamp, tenantName
| order by ContainerCreationTime asc
```

### 检查容器健康状态

```kql
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').LogContainerHealthSnapshot 
| where PreciseTimeStamp between (datetime({starttime}) .. datetime({endtime})) 
| where roleInstanceName contains "{vmname}" 
| project PreciseTimeStamp, Tenant, roleInstanceName, tenantName, containerId, nodeId,  
  containerState, actualOperationalState, containerLifecycleState, containerOsState, faultInfo, 
  vmExpectedHealthState, virtualMachineUniqueId, containerIsolationState, AvailabilityZone, Region
```

### 查询特定节点上的 VM

```kql
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').LogContainerSnapshot 
| where nodeId == "{nodeId}"  
| where TIMESTAMP > ago(3d)  
| distinct creationTime, roleInstanceName, subscriptionId, containerType, virtualMachineUniqueId, 
         nodeId, containerId
```

## 结果字段说明

| 字段 | 说明 |
|------|------|
| containerId | 容器 ID (用于后续查询) |
| nodeId | 节点 ID (用于后续查询) |
| tenantName | 租户名称 (用于 TMMgmt* 表查询) |
| Tenant | 集群名称 |
| containerState | 容器状态 |
| containerOsState | 容器 OS 状态 |
| faultInfo | 故障信息 |

## 变体查询

### 通过订阅查找受节点问题影响的 VM

```kql
let NodeList = cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').LogContainerSnapshot
| where subscriptionId == '{subscription}'
| where TIMESTAMP > ago(4d)
| distinct nodeId;

let ImpactedNode = cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').TMMgmtNodeEventsEtwTable 
| where PreciseTimeStamp > ago(4d)
| where NodeId in (NodeList)
| where Message contains "GetState failed. Node is unreachable"
| distinct NodeId;

cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').LogContainerSnapshot
| where subscriptionId == '{subscription}'
| where nodeId in (ImpactedNode)
| where TIMESTAMP > ago(4d)
| distinct roleInstanceName, Region
```

## 关联查询

- [service-healing.md](./service-healing.md) - Service Healing 查询
- [node-events.md](./node-events.md) - 节点事件查询
- [vm-health.md](./vm-health.md) - VM 健康状态

---

## 补充查询

### 获取 VM 扩展属性 (ExtraVMProperties)

联合 LogContainerSnapshot 和 VMApiQosEvent 获取 VM 的扩展属性，包括镜像信息、邻近放置组等：

```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let subscriptionId = "{subscription}"; 
let VMName = "{vmname}"; 
let ContId = "{containerId}";
let Container =
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').LogContainerSnapshot
| where PreciseTimeStamp between (starttime .. endtime)
| where ((isnotempty(subscriptionId) and subscriptionId =~ subscriptionId and isnotempty(roleInstanceName) and roleInstanceName contains VMName))
    or (isnotempty(containerId) and containerId == ContId)
| extend ostype = tostring(split(billingType,'|',0)[0])
| extend VMType = tostring(split(billingType,'|')[1])
| summarize STARTTIME=min(TIMESTAMP), ENDTIME=max(TIMESTAMP)
    by nodeId, containerId, tenantName, Tenant, roleInstanceName, containerType,
       virtualMachineUniqueId, subscriptionId, Region, dedicatedHostContainerPlacementType,
       dedicatedHostGroupId, dedicatedHostId, tenantOwners, ostype, VMType
| summarize arg_max(ENDTIME, *) by virtualMachineUniqueId;
cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').VMApiQosEvent
| where vMId in (Container | distinct virtualMachineUniqueId)
| summarize arg_max(PreciseTimeStamp, vMId, platformImage, galleryImage, extraVMProperties, proximityPlacementGroup, isManaged, oSDiskStorageAccountType) by vMId
| project vMId, platformImage, galleryImage, extraVMProperties, proximityPlacementGroup, isManaged, oSDiskStorageAccountType
```

### 获取 VM GuestOS 和扩展信息

```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let subscriptionId = "{subscription}"; 
let VMName = "{vmname}"; 
let ContId = "{containerId}";
let Container =
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').LogContainerSnapshot
| where PreciseTimeStamp between (starttime .. endtime)
| where ((isnotempty(subscriptionId) and subscriptionId =~ subscriptionId and isnotempty(VMName) and roleInstanceName contains VMName))
    or (isnotempty(containerId) and containerId == ContId)
| summarize STARTTIME=min(TIMESTAMP), ENDTIME=max(TIMESTAMP)
    by nodeId, containerId, tenantName, Tenant, roleInstanceName, containerType,
       virtualMachineUniqueId, subscriptionId, Region
| summarize arg_max(ENDTIME, *) by virtualMachineUniqueId;
cluster('azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').GuestAgentExtensionEvents
| where VMId in (Container | distinct virtualMachineUniqueId)
| summarize arg_max(PreciseTimeStamp, VMId, OSVersion, GAVersion, Name, Operation, OperationSuccess, Version, Processors, RAM) by Name
| project VMId, OSVersion, GAVersion, Name, Operation, OperationSuccess, Version, Processors, RAM
```

### 查询 Container 操作日志 (NodeServiceEventEtwTable)

```kql
let ContainerId = "{containerId}";
cluster('azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').NodeServiceEventEtwTable
| where isnotempty(ContainerId)
| where PreciseTimeStamp >= ago(7d) and ScopeIdentifier == ContainerId
| project PreciseTimeStamp, Message 
| sort by PreciseTimeStamp asc
```

### 查询 Container 完整信息 (含 OS/VM 类型)

```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let subscriptionId = "{subscription}"; 
let VMName = "{vmname}"; 
let ContId = "{containerId}";
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').LogContainerSnapshot
| where PreciseTimeStamp between (starttime .. endtime)
| where ((isnotempty(subscriptionId) and subscriptionId =~ subscriptionId and isnotempty(roleInstanceName) and roleInstanceName contains VMName))
    or (isnotempty(containerId) and containerId == ContId)
| extend ostype = tostring(split(billingType,'|',0)[0])
| extend VMType = tostring(split(billingType,'|')[1])
| summarize STARTTIME=min(TIMESTAMP), ENDTIME=max(TIMESTAMP)
    by nodeId, containerId, tenantName, Tenant, roleInstanceName, containerType,
       virtualMachineUniqueId, subscriptionId, Region, dedicatedHostContainerPlacementType,
       dedicatedHostGroupId, dedicatedHostId, tenantOwners, ostype, VMType
| summarize arg_max(ENDTIME, *) by virtualMachineUniqueId
| project STARTTIME, ENDTIME, nodeId, containerId, tenantName, Tenant, roleInstanceName, 
         virtualMachineUniqueId, subscriptionId, Region, ostype, VMType,
         dedicatedHostGroupId, dedicatedHostId, tenantOwners
```

### 补充字段说明

| 字段 | 说明 |
|------|------|
| ostype | 操作系统类型 (Windows/Linux) |
| VMType | VM 类型 |
| platformImage | 平台镜像信息 |
| galleryImage | 共享镜像库镜像信息 |
| extraVMProperties | 扩展 VM 属性 (JSON) |
| proximityPlacementGroup | 邻近放置组 |
| dedicatedHostGroupId | 专用主机组 ID |
| dedicatedHostId | 专用主机 ID |
| OSVersion | Guest OS 版本 |
| GAVersion | Guest Agent 版本 |

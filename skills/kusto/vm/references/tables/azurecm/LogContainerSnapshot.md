---
name: LogContainerSnapshot
database: azurecm
cluster: https://azurecm.chinanorth2.kusto.chinacloudapi.cn
description: VM 容器快照，记录 VM 在 Fabric 层的部署位置和元数据
status: active
---

# LogContainerSnapshot

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azurecm.chinanorth2.kusto.chinacloudapi.cn |
| 数据库 | azurecm |
| 状态 | ✅ 可用 |

## 用途

记录 VM 容器的快照信息，用于追踪 VM 在不同主机节点上的部署历史和迁移轨迹。是获取 containerId 和 nodeId 的主要来源。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| PreciseTimeStamp | datetime | 快照时间 |
| TIMESTAMP | datetime | 时间戳 |
| subscriptionId | string | 订阅 ID |
| roleInstanceName | string | VM 名称 |
| virtualMachineUniqueId | string | VM 唯一标识符 |
| containerId | string | 容器 ID (关键字段) |
| nodeId | string | 节点 ID (关键字段) |
| tenantName | string | 租户名称 |
| Tenant | string | 集群名称 |
| creationTime | datetime | 容器创建时间 |
| containerType | string | 容器类型 |
| updateDomain | string | 更新域 |
| availabilitySetName | string | 可用性集名称 |
| Region | string | 区域 |
| AvailabilityZone | string | 可用区 |

## 常用筛选字段

- `subscriptionId` - 按订阅筛选
- `roleInstanceName` - 按 VM 名称筛选
- `nodeId` - 按节点筛选
- `containerId` - 按容器筛选

## 典型应用场景

1. **获取 containerId/nodeId** - 用于后续 Fabric 层查询
2. **追踪 VM 迁移历史** - 查看 VM 在哪些节点上运行过
3. **定位 VM 位置** - 确定 VM 当前所在的物理节点
4. **关联订阅和 VM** - 通过订阅查找受影响的 VM

## 示例查询

### 获取 VM 的 containerId 和 nodeId

```kql
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').LogContainerSnapshot
| where TIMESTAMP > ago(7d)
| where subscriptionId == "{sub}"
| where roleInstanceName has "{vmname}"
| project TIMESTAMP, subscriptionId, Tenant, tenantName, containerId, nodeId, roleInstanceName, 
         availabilitySetName, containerType, Region, virtualMachineUniqueId, AvailabilityZone
| summarize arg_max(TIMESTAMP, *) by containerId
```

### 查看 VM 迁移历史

```kql
let sid = "{sub}"; 
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

### 查询特定节点上的 VM

```kql
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').LogContainerSnapshot 
| where nodeId == "{nodeId}"  
| where TIMESTAMP > ago(3d)  
| distinct creationTime, roleInstanceName, subscriptionId, containerType, virtualMachineUniqueId, 
         nodeId, containerId
```

### 通过订阅查找受节点问题影响的 VM

```kql
let NodeList = cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').LogContainerSnapshot
| where subscriptionId == '{sub}'
| where TIMESTAMP > ago(4d)
| distinct nodeId;

let ImpactedNode = cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').TMMgmtNodeEventsEtwTable 
| where PreciseTimeStamp > ago(4d)
| where NodeId in (NodeList)
| where Message contains "GetState failed. Node is unreachable"
| distinct NodeId;

cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').LogContainerSnapshot
| where subscriptionId == '{sub}'
| where nodeId in (ImpactedNode)
| where TIMESTAMP > ago(4d)
| distinct roleInstanceName, Region
```

## 关联表

- [LogContainerHealthSnapshot.md](./LogContainerHealthSnapshot.md) - 容器健康状态
- [TMMgmtTenantEventsEtwTable.md](./TMMgmtTenantEventsEtwTable.md) - 租户事件
- [LogNodeSnapshot.md](./LogNodeSnapshot.md) - 节点快照

## 注意事项

- `containerId` 和 `nodeId` 是进行 Fabric 层查询的关键字段
- VM 可能在多个节点上有历史记录（Live Migration）
- 使用 `arg_max(TIMESTAMP, *)` 获取最新快照

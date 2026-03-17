---
name: Servers
database: aznwmds
cluster: https://aznwchinamc.chinanorth2.kusto.chinacloudapi.cn
description: 服务器节点信息，包含 NodeId 和设备名称映射
status: active
---

# Servers

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://aznwchinamc.chinanorth2.kusto.chinacloudapi.cn |
| 数据库 | aznwmds |
| 状态 | ✅ 可用 |

## 用途

提供服务器节点 ID 与设备名称的映射关系。用于关联 TOR 交换机信息和网络拓扑查询。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| DeviceName | string | 设备名称 |
| NodeId | string | 节点 ID |

## 常用筛选字段

- `NodeId` - 按节点 ID 筛选
- `DeviceName` - 按设备名称筛选

## 典型应用场景

1. **NodeId 转换** - 将 NodeId 转换为设备名称
2. **TOR 交换机查询** - 关联 DeviceInterfaceLinks 获取 TOR 信息
3. **网络拓扑分析** - 结合其他设备表构建拓扑

## 示例查询

### 查询服务器节点的 TOR 交换机信息
```kql
let NodeIds = 
    cluster('azurecm.chinanorth2').database('azurecm').LogContainerSnapshot
    | where TIMESTAMP >= datetime({starttime}) and TIMESTAMP <= datetime({endtime})
    | where subscriptionId == "{subscription}"
    | distinct nodeId;
cluster('aznwchinamc.chinanorth2').database('aznwmds').Servers
| where NodeId in (NodeIds)
| join (
    cluster('aznwchinamc.chinanorth2').database('aznwmds').DeviceInterfaceLinks 
    | project StartDevice, StartPort, EndDevice, EndPort
) on $left.DeviceName == $right.StartDevice
| join (
    cluster('aznwchinamc.chinanorth2').database('aznwmds').DeviceStatic 
    | project Cluster, Regions, DeviceName
) on $left.DeviceName == $right.DeviceName
| join (
    cluster('aznwchinamc.chinanorth2').database('aznwmds').DeviceIpInterface
    | where isnotempty(AddressesV4) 
    | where InterfaceName =~ 'HostIP'
) on DeviceName
| extend nodeId = tolower(NodeId)
| project Regions, Cluster, nodeId, ServerName = StartDevice, ServerPort = StartPort, 
         TOR = EndDevice, TORPort = EndPort, AddressesV4
```

### 按 NodeId 查询设备名称
```kql
cluster('aznwchinamc.chinanorth2').database('aznwmds').Servers
| where NodeId == "{nodeId}"
| project DeviceName, NodeId
```

## 关联表

- [DeviceInterfaceLinks.md](./DeviceInterfaceLinks.md) - 设备接口链接
- [DeviceStatic.md](./DeviceStatic.md) - 设备静态信息
- [DeviceIpInterface.md](./DeviceIpInterface.md) - 设备 IP 接口

## 注意事项

- NodeId 来自 azurecm.LogContainerSnapshot 等表
- 此表结构简单，主要用于关联查询
- 结合 DeviceInterfaceLinks 可获取 TOR 交换机连接信息

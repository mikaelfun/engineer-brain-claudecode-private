---
name: DeviceInterfaceLinks
database: aznwmds
cluster: https://aznwchinamc.chinanorth2.kusto.chinacloudapi.cn
description: 设备接口链接信息，记录网络设备之间的连接关系
status: active
---

# DeviceInterfaceLinks

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://aznwchinamc.chinanorth2.kusto.chinacloudapi.cn |
| 数据库 | aznwmds |
| 状态 | ✅ 可用 |

## 用途

记录网络设备之间的物理连接关系，包括服务器到 TOR 交换机、TOR 到骨干网设备等连接。用于网络拓扑分析和故障定位。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| StartDevice | string | 起始设备名称 |
| StartPort | string | 起始端口 |
| StartSonicPort | string | 起始 SONiC 端口 |
| EndDevice | string | 终止设备名称 |
| EndPort | string | 终止端口 |
| EndSonicPort | string | 终止 SONiC 端口 |
| BandwidthInGbps | int | 带宽 (Gbps) |
| LinkType | string | 链路类型 |
| DataCenter | string | 数据中心 |
| StartPortChannel | string | 起始端口通道 |
| EndPortChannel | string | 终止端口通道 |
| StartBGPV4Peer | string | 起始 BGP IPv4 对等体 |
| EndBGPV4Peer | string | 终止 BGP IPv4 对等体 |
| StartBGPV6Peer | string | 起始 BGP IPv6 对等体 |
| EndBGPV6Peer | string | 终止 BGP IPv6 对等体 |

## 常用筛选字段

- `StartDevice` - 按起始设备筛选
- `EndDevice` - 按终止设备筛选
- `DataCenter` - 按数据中心筛选
- `LinkType` - 按链路类型筛选

## 典型应用场景

1. **TOR 交换机查询** - 查找服务器连接的 TOR 设备
2. **网络拓扑分析** - 分析设备间的连接关系
3. **故障影响范围评估** - 确定故障设备影响的其他设备

## 示例查询

### 查询设备连接的 TOR
```kql
cluster('aznwchinamc.chinanorth2').database('aznwmds').DeviceInterfaceLinks 
| where StartDevice == "{deviceName}"
| project StartDevice, StartPort, EndDevice, EndPort, BandwidthInGbps, LinkType
```

### 查询数据中心的设备链接
```kql
cluster('aznwchinamc.chinanorth2').database('aznwmds').DeviceInterfaceLinks 
| where DataCenter == "{datacenter}"
| summarize LinkCount = count() by StartDevice, EndDevice
| order by LinkCount desc
```

## 关联表

- [Servers.md](./Servers.md) - 服务器节点信息
- [DeviceStatic.md](./DeviceStatic.md) - 设备静态信息
- [DeviceIpInterface.md](./DeviceIpInterface.md) - 设备 IP 接口

## 注意事项

- StartDevice/EndDevice 可关联 Servers 表的 DeviceName 字段
- 结合 DeviceStatic 可获取设备的区域和集群信息
- 此表用于物理网络拓扑分析

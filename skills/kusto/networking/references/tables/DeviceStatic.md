---
name: DeviceStatic
database: aznwmds
cluster: https://aznwchinamc.chinanorth2.kusto.chinacloudapi.cn
description: 设备静态信息，包含网络设备的元数据和配置
status: active
---

# DeviceStatic

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://aznwchinamc.chinanorth2.kusto.chinacloudapi.cn |
| 数据库 | aznwmds |
| 状态 | ✅ 可用 |

## 用途

记录网络设备的静态配置信息，包括设备类型、位置、集群、区域、OS 版本等。用于设备信息查询和网络拓扑分析。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| DeviceName | string | 设备名称 |
| Cluster | string | 集群名称 |
| Regions | string | 区域 |
| Datacenter | string | 数据中心 |
| DcCode | string | 数据中心代码 |
| StaticIP | string | 静态 IP |
| LoopbackV6 | string | Loopback IPv6 |
| ManagementIP | string | 管理 IP |
| ManagementV6 | string | 管理 IPv6 |
| HardwareSku | string | 硬件 SKU |
| NgsDeviceType | string | NGS 设备类型 |
| AzureDeviceType | string | Azure 设备类型 |
| CloudType | string | 云类型 |
| OSVersion | string | 操作系统版本 |
| Status | string | 状态 |
| Role | string | 角色 |
| DeploymentType | string | 部署类型 |
| ASN | real | AS 号 |
| SerialNumber | string | 序列号 |
| Vender | string | 供应商 |

## 常用筛选字段

- `DeviceName` - 按设备名称筛选
- `Cluster` - 按集群筛选
- `Regions` - 按区域筛选
- `AzureDeviceType` - 按设备类型筛选
- `Status` - 按状态筛选

## 典型应用场景

1. **设备信息查询** - 获取设备的详细配置信息
2. **区域/集群分析** - 按区域或集群统计设备
3. **网络拓扑补充** - 为拓扑查询提供设备元数据

## 示例查询

### 查询设备静态信息
```kql
cluster('aznwchinamc.chinanorth2').database('aznwmds').DeviceStatic 
| where DeviceName == "{deviceName}"
| project Cluster, Regions, Datacenter, AzureDeviceType, HardwareSku, 
         OSVersion, Status, ManagementIP
```

### 按区域统计设备
```kql
cluster('aznwchinamc.chinanorth2').database('aznwmds').DeviceStatic 
| summarize DeviceCount = count() by Regions, AzureDeviceType
| order by Regions, DeviceCount desc
```

### 查询集群内的设备
```kql
cluster('aznwchinamc.chinanorth2').database('aznwmds').DeviceStatic 
| where Cluster == "{clusterName}"
| project DeviceName, AzureDeviceType, HardwareSku, Status, OSVersion
| order by AzureDeviceType
```

## 关联表

- [Servers.md](./Servers.md) - 服务器节点信息
- [DeviceInterfaceLinks.md](./DeviceInterfaceLinks.md) - 设备接口链接
- [DeviceIpInterface.md](./DeviceIpInterface.md) - 设备 IP 接口

## AzureDeviceType 常见值

| 值 | 说明 |
|-----|------|
| `TOR` | Top of Rack 交换机 |
| `MUX` | 多路复用器 |
| `BORDER` | 边界路由器 |
| `MSEE` | Microsoft Enterprise Edge |

## 注意事项

- DeviceName 可关联 Servers、DeviceInterfaceLinks 等表
- Regions 字段可能包含多个区域，使用 `contains` 筛选
- 此表提供设备元数据，不包含实时状态

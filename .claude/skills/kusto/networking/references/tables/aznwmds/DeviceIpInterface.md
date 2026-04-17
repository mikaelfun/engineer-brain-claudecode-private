---
name: DeviceIpInterface
database: aznwmds
cluster: https://aznwchinamc.chinanorth2.kusto.chinacloudapi.cn
description: 设备 IP 接口信息，包含网络设备的 IP 地址配置
status: active
---

# DeviceIpInterface

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://aznwchinamc.chinanorth2.kusto.chinacloudapi.cn |
| 数据库 | aznwmds |
| 状态 | ✅ 可用 |

## 用途

记录网络设备的 IP 接口配置，包括 IPv4/IPv6 地址、接口类型、端口信息等。用于获取 MSEE 设备 IP、Loopback 地址等。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| DeviceName | string | 设备名称 |
| InterfaceType | string | 接口类型 (Loopback/Physical 等) |
| InterfaceName | string | 接口名称 |
| AddressesV4 | string | IPv4 地址 |
| AddressesV6 | string | IPv6 地址 |
| Ports | string | 端口信息 |
| VlanId | string | VLAN ID |

## 常用筛选字段

- `DeviceName` - 按设备名称筛选
- `InterfaceType` - 按接口类型筛选
- `InterfaceName` - 按接口名称筛选
- `Ports` - 按端口筛选

## 典型应用场景

1. **获取 MSEE 设备 IP** - 查询 MSEE 的 HostIP 接口
2. **获取 Loopback 地址** - 查询设备的 Loopback0 地址
3. **IP 接口配置核查** - 检查设备的 IP 配置

## 示例查询

### 获取设备的 HostIP
```kql
cluster('aznwchinamc.chinanorth2').database('aznwmds').DeviceIpInterface
| where DeviceName == "{deviceName}"
| where isnotempty(AddressesV4)
| where InterfaceName contains 'HostIP' and Ports != 'Loopback0'
| project DeviceName, InterfaceType, InterfaceName, AddressesV4, AddressesV6
```

### 获取设备的 Loopback0 IPv6
```kql
cluster('aznwchinamc.chinanorth2').database('aznwmds').DeviceIpInterface
| where DeviceName == "{deviceName}"
| where InterfaceType == 'Loopback'
| where AddressesV6 != ''
| where Ports == 'Loopback0'
| project DeviceName, AddressesV6
```

### 查询 MSEE 设备 IP (结合 CircuitTable)
```kql
let mseeDevices = 
    cluster('aznwchinamc.chinanorth2').database('aznwmds').CircuitTable
    | where AzureServiceKey == "{serviceKey}"
    | summarize arg_max(PreciseTimeStamp, PrimaryDeviceName, SecondaryDeviceName) by AzureServiceKey
    | project PrimaryDeviceName, SecondaryDeviceName;
cluster('aznwchinamc.chinanorth2').database('aznwmds').DeviceIpInterface
| where DeviceName in (mseeDevices) or DeviceName in (mseeDevices)
| where isnotempty(AddressesV4)
| where InterfaceName contains 'HostIP'
| project DeviceName, InterfaceType, InterfaceName, AddressesV4, AddressesV6
```

## 关联表

- [CircuitTable.md](./CircuitTable.md) - ExpressRoute 线路信息（获取 MSEE 设备名称）
- [DeviceStatic.md](./DeviceStatic.md) - 设备静态信息
- [Servers.md](./Servers.md) - 服务器节点信息

## InterfaceType 常见值

| 值 | 说明 |
|-----|------|
| `Loopback` | Loopback 接口 |
| `Physical` | 物理接口 |
| `PortChannel` | 端口通道 |
| `Vlan` | VLAN 接口 |

## InterfaceName 常见值

| 值 | 说明 |
|-----|------|
| `HostIP` | 主机 IP 接口 |
| `Loopback0` | 主 Loopback 接口 |
| `Loopback1` | 备用 Loopback 接口 |

## 注意事项

- 获取 MSEE 设备 IP 时，通常查询 InterfaceName 包含 'HostIP' 的记录
- Loopback0 通常是设备的主要标识地址
- AddressesV4/AddressesV6 可能包含多个地址，用逗号分隔

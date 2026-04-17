---
name: CircuitTable
database: aznwmds
cluster: https://aznwchinamc.chinanorth2.kusto.chinacloudapi.cn
description: ExpressRoute 线路信息，包含线路配置、状态和 MSEE 设备信息
status: active
---

# CircuitTable

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://aznwchinamc.chinanorth2.kusto.chinacloudapi.cn |
| 数据库 | aznwmds |
| 状态 | ✅ 可用 |

## 用途

记录 ExpressRoute 线路的配置信息、运营商状态、MSEE 设备信息等。用于 ER 线路故障排查和配置核查。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| TIMESTAMP | datetime | 时间戳 |
| PreciseTimeStamp | datetime | 精确时间戳 |
| AzureSubscriptionId | string | Azure 订阅 ID |
| AzureServiceKey | string | ER 线路 Service Key（关键字段） |
| CircuitName | string | 线路名称 |
| Bandwidth | long | 带宽 (Mbps) |
| Location | string | 对等互连位置 |
| Region | string | Azure 区域 |
| Sku | string | 线路 SKU |
| BillingType | string | 计费类型 |
| DedicatedCircuitStatus | string | 线路状态 |
| ServiceProviderProvisioningState | string | 运营商预配状态 |
| ServiceProviderName | string | 运营商名称 |
| PortPairId | string | 端口对 ID |
| PrimaryDeviceName | string | 主 MSEE 设备名称 |
| SecondaryDeviceName | string | 备 MSEE 设备名称 |
| AllowGlobalReach | bool | 是否允许 Global Reach |
| NrpResourceUri | string | NRP 资源 URI |
| GatewayManagerVersion | string | Gateway Manager 版本 |

## 常用筛选字段

- `AzureServiceKey` - 按 Service Key 筛选
- `AzureSubscriptionId` - 按订阅筛选
- `CircuitName` - 按线路名称筛选
- `Region` - 按区域筛选
- `ServiceProviderName` - 按运营商筛选

## 典型应用场景

1. **ER 线路信息查询** - 获取线路配置和状态
2. **MSEE 设备信息** - 获取主备 MSEE 设备名称
3. **运营商状态检查** - 检查 ServiceProviderProvisioningState
4. **带宽和 SKU 核查** - 确认线路规格

## 示例查询

### 查询 ExpressRoute 线路信息
```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
cluster("aznwchinamc.chinanorth2").database("aznwmds").CircuitTable 
| where PreciseTimeStamp >= starttime - 1d and PreciseTimeStamp <= endtime
| where Region =~ "China East" or Region =~ "China North" or Region =~ "chinaeast" or Region =~ "chinanorth"
| distinct CircuitName, AzureSubscriptionId, ServiceKey = AzureServiceKey, Location, Sku, 
         BillingType, DedicatedCircuitStatus, PortPairId, ServiceProviderProvisioningState, 
         Bandwidth, ServiceProviderName, Region, PrimaryDeviceName, SecondaryDeviceName, 
         AllowGlobalReach, GatewayManagerVersion
```

### 获取 ER 线路关联的 MSEE 设备 IP
```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let subscriptionid = "{subscription}";
let gwname = "{gatewayName}";
let skeys =
    cluster('aznwchinamc.chinanorth2').database('aznwmds').GatewayTenantHealth
    | where PreciseTimeStamp between (starttime - 1d .. endtime)
    | where CustomerSubscriptionId == subscriptionid
    | where GatewayType == "Dedicated"
    | where GatewayName == gwname
    | extend keys = extract_all(@"([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})", tostring(CircuitServiceKey))
    | mv-expand key = keys
    | extend AzureServiceKey = tostring(key)
    | where isnotempty(AzureServiceKey)
    | distinct AzureServiceKey;
cluster('aznwchinamc.chinanorth2').database('aznwmds').CircuitTable
| where AzureServiceKey in (skeys)
| summarize et = max(TIMESTAMP) by AzureServiceKey, NrpResourceUri, PrimaryDeviceName, SecondaryDeviceName
| extend MSEEDeviceAll = strcat('[{"device":"', PrimaryDeviceName, '"},{"device":"', SecondaryDeviceName, '"}]')
| project et, AzureServiceKey, NrpResourceUri, MSEEDeviceAll
| mv-expand MSEEDeviceAll = parse_json(MSEEDeviceAll)
| extend MSEEDevice = tostring(MSEEDeviceAll.device)
| distinct LastIngressTime = et, AzureServiceKey, NrpResourceUri, MSEEDevice
| join (
    cluster('aznwchinamc.chinanorth2').database('aznwmds').DeviceIpInterface
    | where isnotempty(AddressesV4)
    | where InterfaceName contains 'HostIP' and Ports != 'Loopback0'
) on $left.MSEEDevice == $right.DeviceName
| join kind=leftouter (
    cluster('aznwchinamc.chinanorth2').database('aznwmds').DeviceIpInterface
    | where InterfaceType == 'Loopback'
    | where AddressesV6 != ''
    | where Ports == 'Loopback0'
) on $left.DeviceName == $right.DeviceName   
| extend Loopback0_V6 = strcat(AddressesV61, '/128')
| summarize IpList = make_list(AddressesV4) by DeviceName, InterfaceType, LastIngressTime, 
            AzureServiceKey, NrpResourceUri, MSEEDevice, Loopback0_V6   
| project LastIngressTime, AzureServiceKey, NrpResourceUri, MSEEDevice, InterfaceType, 
         Loopback_V4 = strcat(IpList, ','), Loopback0_V6
```

### 按 Service Key 查询线路
```kql
cluster('aznwchinamc.chinanorth2').database('aznwmds').CircuitTable
| where AzureServiceKey == "{serviceKey}"
| summarize arg_max(PreciseTimeStamp, *) by AzureServiceKey
| project CircuitName, Bandwidth, Location, Sku, DedicatedCircuitStatus, 
         ServiceProviderProvisioningState, ServiceProviderName, 
         PrimaryDeviceName, SecondaryDeviceName
```

## 关联表

- [GatewayTenantHealth.md](./GatewayTenantHealth.md) - ER Gateway 健康状态
- [DeviceIpInterface.md](./DeviceIpInterface.md) - MSEE 设备 IP 信息

## ServiceProviderProvisioningState 值说明

| 值 | 说明 |
|-----|------|
| `Provisioned` | 运营商已预配 |
| `NotProvisioned` | 运营商未预配 |
| `Deprovisioning` | 正在取消预配 |

## DedicatedCircuitStatus 值说明

| 值 | 说明 |
|-----|------|
| `Enabled` | 线路已启用 |
| `Disabled` | 线路已禁用 |
| `Deleting` | 正在删除 |

## 注意事项

- AzureServiceKey 是 ER 线路的唯一标识，可从 Azure Portal 获取
- PrimaryDeviceName/SecondaryDeviceName 可关联 DeviceIpInterface 获取 MSEE IP
- 结合 GatewayTenantHealth 的 CircuitServiceKey 字段关联网关信息

---
name: er-circuit
description: ExpressRoute 线路和 MSEE 设备查询
tables:
  - CircuitTable
  - GatewayTenantHealth
  - DeviceIpInterface
parameters:
  - name: serviceKey
    required: false
    description: ExpressRoute Service Key
  - name: subscription
    required: false
    description: 订阅 ID
  - name: starttime
    required: true
    description: 开始时间
  - name: endtime
    required: true
    description: 结束时间
---

# ExpressRoute 线路查询

## 用途

查询 ExpressRoute 线路的配置信息、运营商状态和 MSEE 设备 IP。用于 ER 线路故障排查。

---

## 查询 1: 查询 ExpressRoute 线路信息

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {starttime} | 是 | 开始时间 |
| {endtime} | 是 | 结束时间 |

### 查询语句

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

### 结果字段说明

| 字段 | 说明 |
|------|------|
| CircuitName | 线路名称 |
| ServiceKey | ER Service Key |
| Location | 对等互连位置 |
| Sku | 线路 SKU |
| Bandwidth | 带宽 (Mbps) |
| DedicatedCircuitStatus | 线路状态 |
| ServiceProviderProvisioningState | 运营商预配状态 |
| PrimaryDeviceName | 主 MSEE 设备 |
| SecondaryDeviceName | 备 MSEE 设备 |

---

## 查询 2: 按 Service Key 查询线路

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {serviceKey} | 是 | ExpressRoute Service Key |

### 查询语句

```kql
cluster('aznwchinamc.chinanorth2.kusto.chinacloudapi.cn').database('aznwmds').CircuitTable
| where AzureServiceKey == "{serviceKey}"
| summarize arg_max(PreciseTimeStamp, *) by AzureServiceKey
| project CircuitName, Bandwidth, Location, Sku, DedicatedCircuitStatus, 
         ServiceProviderProvisioningState, ServiceProviderName, 
         PrimaryDeviceName, SecondaryDeviceName, Region
```

---

## 查询 3: 获取 ER 线路关联的 MSEE 设备 IP

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {subscription} | 是 | 客户订阅 ID |
| {gatewayName} | 是 | ExpressRoute Gateway 名称 |
| {starttime} | 是 | 开始时间 |
| {endtime} | 是 | 结束时间 |

### 查询语句

```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let subscriptionid = "{subscription}";
let gwname = "{gatewayName}";
let skeys =
    cluster('aznwchinamc.chinanorth2.kusto.chinacloudapi.cn').database('aznwmds').GatewayTenantHealth
    | where PreciseTimeStamp between (starttime - 1d .. endtime)
    | where CustomerSubscriptionId == subscriptionid
    | where GatewayType == "Dedicated"
    | where GatewayName == gwname
    | extend keys = extract_all(@"([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})", tostring(CircuitServiceKey))
    | mv-expand key = keys
    | extend AzureServiceKey = tostring(key)
    | where isnotempty(AzureServiceKey)
    | distinct AzureServiceKey;
cluster('aznwchinamc.chinanorth2.kusto.chinacloudapi.cn').database('aznwmds').CircuitTable
| where AzureServiceKey in (skeys)
| summarize et = max(TIMESTAMP) by AzureServiceKey, NrpResourceUri, PrimaryDeviceName, SecondaryDeviceName
| extend MSEEDeviceAll = strcat('[{"device":"', PrimaryDeviceName, '"},{"device":"', SecondaryDeviceName, '"}]')
| project et, AzureServiceKey, NrpResourceUri, MSEEDeviceAll
| mv-expand MSEEDeviceAll = parse_json(MSEEDeviceAll)
| extend MSEEDevice = tostring(MSEEDeviceAll.device)
| distinct LastIngressTime = et, AzureServiceKey, NrpResourceUri, MSEEDevice
| join (
    cluster('aznwchinamc.chinanorth2.kusto.chinacloudapi.cn').database('aznwmds').DeviceIpInterface
    | where isnotempty(AddressesV4)
    | where InterfaceName contains 'HostIP' and Ports != 'Loopback0'
) on $left.MSEEDevice == $right.DeviceName
| join kind=leftouter (
    cluster('aznwchinamc.chinanorth2.kusto.chinacloudapi.cn').database('aznwmds').DeviceIpInterface
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

### 结果字段说明

| 字段 | 说明 |
|------|------|
| MSEEDevice | MSEE 设备名称 |
| Loopback_V4 | MSEE IPv4 地址列表 |
| Loopback0_V6 | MSEE Loopback0 IPv6 地址 |

---

## 查询 4: 按订阅查询 ER 线路

### 查询语句

```kql
cluster('aznwchinamc.chinanorth2.kusto.chinacloudapi.cn').database('aznwmds').CircuitTable
| where PreciseTimeStamp > ago(1d)
| where AzureSubscriptionId == "{subscription}"
| summarize arg_max(PreciseTimeStamp, *) by AzureServiceKey
| project CircuitName, AzureServiceKey, Location, Bandwidth, Sku, 
         DedicatedCircuitStatus, ServiceProviderProvisioningState, ServiceProviderName
```

---

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

## 关联查询

- [er-gateway.md](./er-gateway.md) - ExpressRoute Gateway 查询

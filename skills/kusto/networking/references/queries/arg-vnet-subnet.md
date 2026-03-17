---
name: arg-vnet-subnet
description: ARG VNet 和子网配置查询
tables:
  - Resources
parameters:
  - name: vnetResourceGuid
    required: false
    description: VNet resourceGuid
  - name: subscription
    required: false
    description: 订阅 ID
---

# VNet/子网查询

## 用途

通过 Azure Resource Graph 查询虚拟网络和子网配置信息。

---

## 查询 1: 按 VNet resourceGuid 查询子网信息

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {vnetResourceGuid} | 是 | VNet 的 resourceGuid |

### 查询语句

```kql
let VNETID = "{vnetResourceGuid}";
cluster('argmcn2nrpone.chinanorth2.kusto.chinacloudapi.cn').database('AzureResourceGraph').Resources
| where type =~ 'microsoft.network/virtualNetworks'
| where isnotempty(VNETID)
| where properties contains VNETID
| extend vnet_resourceGuid = extractjson('$.resourceGuid', tostring(properties))
| extend subnets = extractjson('$.subnets', tostring(properties))
| mv-expand parse_json(subnets)
| extend subnetname = tostring(subnets['name'])
| extend addressPrefix = iff(
    isnotempty(extractjson('$.addressPrefix', tostring(subnets['properties']))),
    extractjson('$.addressPrefix', tostring(subnets['properties'])),
    extractjson('$.addressPrefixes', tostring(subnets['properties']))
)
| extend id = tolower(id)
| summarize arg_max(timestamp, *) by subnetname
| project LastUpdateDateTime = timestamp, VnetId = vnet_resourceGuid, ResourceUri = id, 
         subnetname, addressPrefix, SubscriptionId = subscriptionId, Region = location
```

### 结果字段说明

| 字段 | 说明 |
|------|------|
| LastUpdateDateTime | 最后更新时间 |
| VnetId | VNet resourceGuid |
| ResourceUri | 资源 URI |
| subnetname | 子网名称 |
| addressPrefix | 地址前缀 |
| SubscriptionId | 订阅 ID |
| Region | 区域 |

---

## 查询 2: 按订阅查询 VNet 列表

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {subscription} | 是 | 订阅 ID |

### 查询语句

```kql
cluster('argmcn2nrpone.chinanorth2.kusto.chinacloudapi.cn').database('AzureResourceGraph').Resources
| where timestamp > ago(1d)
| where subscriptionId == "{subscription}"
| where type =~ "microsoft.network/virtualNetworks"
| summarize arg_max(timestamp, *) by id
| extend addressSpace = tostring(properties.addressSpace.addressPrefixes)
| extend subnetCount = array_length(properties.subnets)
| extend enableDdosProtection = tobool(properties.enableDdosProtection)
| project name, location, resourceGroup, addressSpace, subnetCount, enableDdosProtection, id
| order by name
```

---

## 查询 3: 查询 VNet 详细信息（含子网）

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {vnetName} | 是 | VNet 名称 |
| {subscription} | 是 | 订阅 ID |

### 查询语句

```kql
cluster('argmcn2nrpone.chinanorth2.kusto.chinacloudapi.cn').database('AzureResourceGraph').Resources
| where timestamp > ago(1d)
| where subscriptionId == "{subscription}"
| where type =~ "microsoft.network/virtualNetworks"
| where name == "{vnetName}"
| extend subnets = properties.subnets
| mv-expand subnet = subnets
| extend subnetName = tostring(subnet.name)
| extend subnetPrefix = tostring(subnet.properties.addressPrefix)
| extend nsgId = tostring(subnet.properties.networkSecurityGroup.id)
| extend routeTableId = tostring(subnet.properties.routeTable.id)
| project VNetName = name, SubnetName = subnetName, AddressPrefix = subnetPrefix, 
         NSG = nsgId, RouteTable = routeTableId
```

---

## 查询 4: 查询 VNet Peering 信息

### 查询语句

```kql
cluster('argmcn2nrpone.chinanorth2.kusto.chinacloudapi.cn').database('AzureResourceGraph').Resources
| where timestamp > ago(1d)
| where subscriptionId == "{subscription}"
| where type =~ "microsoft.network/virtualNetworks"
| where name == "{vnetName}"
| extend peerings = properties.virtualNetworkPeerings
| mv-expand peering = peerings
| extend peeringName = tostring(peering.name)
| extend peeringState = tostring(peering.properties.peeringState)
| extend remoteVNet = tostring(peering.properties.remoteVirtualNetwork.id)
| extend allowVNetAccess = tobool(peering.properties.allowVirtualNetworkAccess)
| extend allowForwardedTraffic = tobool(peering.properties.allowForwardedTraffic)
| extend useRemoteGateways = tobool(peering.properties.useRemoteGateways)
| project PeeringName = peeringName, State = peeringState, RemoteVNet = remoteVNet, 
         AllowVNetAccess = allowVNetAccess, AllowForwardedTraffic = allowForwardedTraffic, 
         UseRemoteGateways = useRemoteGateways
```

---

## 查询 5: 查询 VPN/ER Gateway 资源

### 查询语句

```kql
cluster('argmcn2nrpone.chinanorth2.kusto.chinacloudapi.cn').database('AzureResourceGraph').Resources
| where timestamp > ago(1d)
| where subscriptionId == "{subscription}"
| where type =~ "microsoft.network/virtualnetworkgateways"
| summarize arg_max(timestamp, *) by id
| extend gatewayType = tostring(properties.gatewayType)
| extend sku = tostring(properties.sku.name)
| extend vpnType = tostring(properties.vpnType)
| extend activeActive = tobool(properties.activeActive)
| extend bgpSettings = tostring(properties.bgpSettings)
| project name, location, gatewayType, sku, vpnType, activeActive, resourceGroup, id
```

---

## 关联查询

- [arg-publicip.md](./arg-publicip.md) - 公网 IP 查询
- [vpn-tunnel.md](./vpn-tunnel.md) - VPN 隧道查询
- [er-gateway.md](./er-gateway.md) - ExpressRoute Gateway 查询

---
name: Resources
database: AzureResourceGraph
cluster: https://argmcn2nrpone.chinanorth2.kusto.chinacloudapi.cn
description: Azure 资源图，包含所有 Azure 资源的元数据和配置
status: active
---

# Resources (ARG)

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://argmcn2nrpone.chinanorth2.kusto.chinacloudapi.cn |
| 数据库 | AzureResourceGraph |
| 状态 | ✅ 可用 |

## 用途

Azure Resource Graph (ARG) 的主表，包含所有 Azure 资源的元数据、配置和状态。用于资源查询、跨订阅分析和资源关系查询。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| timestamp | datetime | 时间戳 |
| id | string | 资源 ID |
| name | string | 资源名称 |
| type | string | 资源类型 |
| subscriptionId | string | 订阅 ID |
| resourceGroup | string | 资源组 |
| location | string | 位置 |
| properties | dynamic | 资源属性 (JSON) |
| tags | dynamic | 资源标签 |
| sku | dynamic | SKU 信息 |
| tenantId | string | 租户 ID |
| kind | string | 资源种类 |

## 常用筛选字段

- `type` - 按资源类型筛选
- `subscriptionId` - 按订阅筛选
- `resourceGroup` - 按资源组筛选
- `location` - 按位置筛选
- `name` - 按资源名称筛选

## 典型应用场景

1. **公网 IP 查询** - 查询 Public IP 地址并生成监控链接
2. **VNet/子网查询** - 获取虚拟网络和子网配置
3. **资源清单** - 跨订阅查询资源列表
4. **资源关系分析** - 分析资源间的关联关系

## 示例查询

### 按 IP 地址查询公网 IP 资源
```kql
let ipv4address = "{ipAddress}";
cluster('argmcn2nrpone.chinanorth2').database('AzureResourceGraph').Resources
| where timestamp > ago(30d)
| where type contains "Microsoft.Network/publicIPAddresses"
| where properties contains ipv4address
| order by timestamp
| take 1
| extend ip = tostring(properties.ipAddress)
| extend account = strcat("slbhp", tolower(location))
| extend DDoSCRI_Url = strcat(
    "https://portal.microsoftgeneva.com/dashboard/CNS/Mooncake/CRI?overrides=[{%22query%22:%22//*[id%3D%27DestinationVIP%27]%22,%22key%22:%22value%22,%22replacement%22:%22",
    ip, "%22}]"
)
| extend DDoSShoebox_Url = strcat(
    "https://portal.microsoftgeneva.com/dashboard/CNS/Mooncake/shoebox?overrides=[{%22query%22:%22//*[id%3D%27DestinationVIP%27]%22,%22key%22:%22value%22,%22replacement%22:%22",
    ip, "%22}]"
)
| extend SLBVIPBandwidth_Url = strcat(
    "https://portal.microsoftgeneva.com/s/86B4CC57?overrides=[",
    "{\"query\":\"//dataSources\",\"key\":\"account\",\"replacement\":\"", account, "\"},",
    "{\"query\":\"//*[id='VipAddress']\",\"key\":\"value\",\"replacement\":\"", ip, "\"},",
    "{\"query\":\"//*[id='PublicIpArmIdOrILBPA']\",\"key\":\"value\",\"replacement\":\"\"}]"
)
| project timestamp, subscriptionId, type, id, name, location, ip, DDoSCRI_Url, DDoSShoebox_Url, SLBVIPBandwidth_Url
```

### 查询 VNet 子网信息
```kql
let VNETID = "{vnetResourceGuid}";
cluster('argmcn2nrpone.chinanorth2').database('AzureResourceGraph').Resources
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

### 按订阅查询网络资源
```kql
cluster('argmcn2nrpone.chinanorth2').database('AzureResourceGraph').Resources
| where timestamp > ago(1d)
| where subscriptionId == "{subscription}"
| where type startswith "microsoft.network/"
| summarize arg_max(timestamp, *) by id
| project name, type, location, resourceGroup
| order by type, name
```

### 查询 VPN Gateway 资源
```kql
cluster('argmcn2nrpone.chinanorth2').database('AzureResourceGraph').Resources
| where timestamp > ago(1d)
| where type =~ "microsoft.network/virtualnetworkgateways"
| where subscriptionId == "{subscription}"
| extend gatewayType = tostring(properties.gatewayType)
| extend sku = tostring(properties.sku.name)
| extend vpnType = tostring(properties.vpnType)
| project name, location, gatewayType, sku, vpnType, resourceGroup, id
```

## 关联表

- 此表是 ARG 的主表，可与其他 Networking 表关联使用

## 常用网络资源类型

| type | 说明 |
|------|------|
| `microsoft.network/publicipaddresses` | 公网 IP 地址 |
| `microsoft.network/virtualnetworks` | 虚拟网络 |
| `microsoft.network/virtualnetworkgateways` | 虚拟网络网关 |
| `microsoft.network/expressroutecircuits` | ExpressRoute 线路 |
| `microsoft.network/loadbalancers` | 负载均衡器 |
| `microsoft.network/applicationgateways` | 应用程序网关 |
| `microsoft.network/networksecuritygroups` | 网络安全组 |
| `microsoft.network/networkinterfaces` | 网络接口 |

## 注意事项

- `properties` 字段是 JSON 格式，使用 `extractjson()` 或 `parse_json()` 提取数据
- 查询时使用 `arg_max(timestamp, *)` 获取最新状态
- 资源类型比较时建议使用 `=~` (大小写不敏感)
- ARG 数据可能有几分钟延迟

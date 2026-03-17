---
name: arg-publicip
description: ARG 公网 IP 查询和监控链接生成
tables:
  - Resources
parameters:
  - name: ipAddress
    required: true
    description: 公网 IP 地址
---

# 公网 IP 查询

## 用途

通过 Azure Resource Graph 查询公网 IP 地址信息，并生成 DDoS 和 SLB 监控 Dashboard 链接。

---

## 查询 1: 按 IP 地址查询公网 IP 资源并生成监控链接

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {ipAddress} | 是 | 公网 IPv4 地址 |

### 查询语句

```kql
let ipv4address = "{ipAddress}";
cluster('argmcn2nrpone.chinanorth2.kusto.chinacloudapi.cn').database('AzureResourceGraph').Resources
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

### 结果字段说明

| 字段 | 说明 |
|------|------|
| timestamp | 时间戳 |
| subscriptionId | 订阅 ID |
| id | 资源 ID |
| name | 资源名称 |
| location | 位置 |
| ip | IP 地址 |
| DDoSCRI_Url | DDoS CRI Dashboard 链接 |
| DDoSShoebox_Url | DDoS Shoebox Dashboard 链接 |
| SLBVIPBandwidth_Url | SLB VIP 带宽 Dashboard 链接 |

---

## 查询 2: 按订阅查询公网 IP 列表

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {subscription} | 是 | 订阅 ID |

### 查询语句

```kql
cluster('argmcn2nrpone.chinanorth2.kusto.chinacloudapi.cn').database('AzureResourceGraph').Resources
| where timestamp > ago(1d)
| where subscriptionId == "{subscription}"
| where type =~ "microsoft.network/publicipaddresses"
| summarize arg_max(timestamp, *) by id
| extend ip = tostring(properties.ipAddress)
| extend allocationMethod = tostring(properties.publicIPAllocationMethod)
| extend sku = tostring(sku.name)
| project name, ip, location, allocationMethod, sku, resourceGroup, id
| order by name
```

---

## 查询 3: 查询未分配的公网 IP

### 查询语句

```kql
cluster('argmcn2nrpone.chinanorth2.kusto.chinacloudapi.cn').database('AzureResourceGraph').Resources
| where timestamp > ago(1d)
| where subscriptionId == "{subscription}"
| where type =~ "microsoft.network/publicipaddresses"
| summarize arg_max(timestamp, *) by id
| extend ipConfiguration = tostring(properties.ipConfiguration.id)
| where isempty(ipConfiguration)
| extend ip = tostring(properties.ipAddress)
| project name, ip, location, resourceGroup
```

---

## 查询 4: 按资源类型统计公网 IP 关联

### 查询语句

```kql
cluster('argmcn2nrpone.chinanorth2.kusto.chinacloudapi.cn').database('AzureResourceGraph').Resources
| where timestamp > ago(1d)
| where subscriptionId == "{subscription}"
| where type =~ "microsoft.network/publicipaddresses"
| summarize arg_max(timestamp, *) by id
| extend ipConfiguration = tostring(properties.ipConfiguration.id)
| extend associatedResourceType = case(
    ipConfiguration contains "networkInterfaces", "VM NIC",
    ipConfiguration contains "loadBalancers", "Load Balancer",
    ipConfiguration contains "applicationGateways", "Application Gateway",
    ipConfiguration contains "virtualNetworkGateways", "VPN/ER Gateway",
    ipConfiguration contains "bastionHosts", "Bastion",
    isempty(ipConfiguration), "Unassigned",
    "Other"
)
| summarize Count = count() by associatedResourceType
| order by Count desc
```

---

## 关联查询

- [arg-vnet-subnet.md](./arg-vnet-subnet.md) - VNet/子网查询

---
name: er-gateway
description: ExpressRoute Gateway 信息和容器查询
tables:
  - GatewayTenantHealth
  - LogContainerSnapshot
parameters:
  - name: subscription
    required: true
    description: 客户订阅 ID
  - name: gatewayName
    required: false
    description: Gateway 名称
  - name: starttime
    required: true
    description: 开始时间
  - name: endtime
    required: true
    description: 结束时间
---

# ExpressRoute Gateway 查询

## 用途

查询 ExpressRoute Gateway 的配置信息、健康状态和底层容器信息。用于 ER Gateway 故障排查。

---

## 查询 1: 按订阅查询 ExpressRoute Gateway

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {subscription} | 是 | 客户订阅 ID |
| {starttime} | 是 | 开始时间 |
| {endtime} | 是 | 结束时间 |

### 查询语句

```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let subscriptionid = "{subscription}";
cluster('aznwchinamc.chinanorth2.kusto.chinacloudapi.cn').database('aznwmds').GatewayTenantHealth
| where PreciseTimeStamp >= starttime - 1d and PreciseTimeStamp <= endtime
| where CustomerSubscriptionId == subscriptionid
| where GatewayType == "Dedicated"
| where ProvisioningState == "Provisioned"
| distinct GatewayName, CustomerSubscriptionId, GatewayId, GatewayVmSize, VIPAddress, 
         ProvisioningState, VNetName, VNetId, GatewayTenantVersion, GatewayType, 
         Region, GatewayDeploymentType, AzureDeploymentVmSize, PhysicalZones
```

### 结果字段说明

| 字段 | 说明 |
|------|------|
| GatewayName | Gateway 名称 |
| GatewayId | Gateway 资源 ID |
| GatewayVmSize | Gateway VM 大小 |
| VIPAddress | VIP 地址 |
| ProvisioningState | 预配状态 |
| VNetName | 所在 VNet 名称 |
| Region | 区域 |
| PhysicalZones | 物理可用区 |

---

## 查询 2: 获取 ER Gateway 实例容器信息

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
cluster('aznwchinamc.chinanorth2.kusto.chinacloudapi.cn').database('aznwmds').GatewayTenantHealth
| where PreciseTimeStamp >= starttime - 1d and PreciseTimeStamp <= endtime
| where CustomerSubscriptionId == subscriptionid
| where GatewayName == gwname
| distinct DeploymentId
| join kind=leftouter (
    cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').LogContainerSnapshot
    | where TIMESTAMP >= starttime and TIMESTAMP <= endtime
    | where Tenant !contains 'TMBOX'
    | extend vmsize = tostring(split(billingType, '|', 1)[0])
    | extend ostype = tostring(split(billingType, '|', 0)[0])
) on $left.DeploymentId == $right.tenantName
| where containerId != ''
| summarize STARTTIME = min(TIMESTAMP), ENDTIME = max(TIMESTAMP) 
  by nodeId, containerId, roleInstanceName, tenantName, Tenant, vmsize, ostype, 
     virtualMachineUniqueId, subscriptionId, Region
| project STARTTIME, ENDTIME, nodeId, containerId, roleInstanceName, tenantName, 
         Tenant, vmsize, ostype, virtualMachineUniqueId, subscriptionId, Region
```

### 结果字段说明

| 字段 | 说明 |
|------|------|
| nodeId | 物理节点 ID |
| containerId | 容器 ID |
| roleInstanceName | 角色实例名称 |
| virtualMachineUniqueId | VM 唯一 ID |
| vmsize | VM 大小 |
| Region | 区域 |

---

## 查询 3: 查询 VPN Gateway 信息

### 查询语句

```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
cluster('aznwchinamc.chinanorth2.kusto.chinacloudapi.cn').database('aznwmds').GatewayTenantHealth
| where PreciseTimeStamp >= starttime and PreciseTimeStamp <= endtime
| where CustomerSubscriptionId == "{subscription}"
| where GatewayType == "Vpn"
| summarize arg_max(PreciseTimeStamp, *) by GatewayId
| project GatewayName, GatewayId, GatewayVmSize, GatewaySku, VIPAddress, 
         ProvisioningState, Region, RunningState, VNetName
```

---

## 查询 4: 获取 Gateway 关联的 ExpressRoute 线路

### 查询语句

```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
cluster('aznwchinamc.chinanorth2.kusto.chinacloudapi.cn').database('aznwmds').GatewayTenantHealth
| where PreciseTimeStamp between (starttime - 1d .. endtime)
| where CustomerSubscriptionId == "{subscription}"
| where GatewayType == "Dedicated"
| where GatewayName == "{gatewayName}"
| extend keys = extract_all(@"([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})", tostring(CircuitServiceKey))
| mv-expand key = keys
| extend AzureServiceKey = tostring(key)
| where isnotempty(AzureServiceKey)
| distinct GatewayName, AzureServiceKey
```

---

## GatewayType 值说明

| 值 | 说明 |
|-----|------|
| `Dedicated` | ExpressRoute Gateway |
| `Vpn` | VPN Gateway |
| `DedicatedVpn` | VPN 和 ER 共存 |

## 关联查询

- [er-circuit.md](./er-circuit.md) - ExpressRoute 线路查询
- [vpn-tunnel.md](./vpn-tunnel.md) - VPN 隧道查询

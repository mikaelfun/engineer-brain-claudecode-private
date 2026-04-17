---
name: GatewayTenantHealth
database: aznwmds
cluster: https://aznwchinamc.chinanorth2.kusto.chinacloudapi.cn
description: 网关租户健康状态，包含 VPN/ExpressRoute Gateway 配置和状态信息
status: active
---

# GatewayTenantHealth

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://aznwchinamc.chinanorth2.kusto.chinacloudapi.cn |
| 数据库 | aznwmds |
| 状态 | ✅ 可用 |

## 用途

记录 VPN Gateway 和 ExpressRoute Gateway 的健康状态、配置信息和部署详情。用于获取网关元数据和关联容器信息。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| TIMESTAMP | datetime | 时间戳 |
| PreciseTimeStamp | datetime | 精确时间戳 |
| GatewayId | string | Gateway 资源 ID |
| GatewayName | string | Gateway 名称 |
| GatewayType | string | 网关类型 (Dedicated=ER, Vpn=VPN) |
| CustomerSubscriptionId | string | 客户订阅 ID |
| VNetId | string | 虚拟网络 ID |
| VNetName | string | 虚拟网络名称 |
| DeploymentId | string | 部署 ID（用于关联 LogContainerSnapshot） |
| VIPAddress | string | VIP 地址 |
| ProvisioningState | string | 预配状态 |
| GatewayVmSize | string | Gateway VM 大小 |
| AzureDeploymentVmSize | string | Azure 部署 VM 大小 |
| GatewaySku | string | Gateway SKU |
| Region | string | 区域 |
| GatewayDeploymentType | string | 部署类型 |
| PhysicalZones | string | 物理可用区 |
| GatewayTenantVersion | string | Gateway 租户版本 |
| CircuitServiceKey | string | ExpressRoute 线路 Service Key |
| BgpSettings | string | BGP 配置 |
| GatewayManagerVersion | string | Gateway Manager 版本 |
| RunningState | string | 运行状态 |

## 常用筛选字段

- `CustomerSubscriptionId` - 按订阅筛选
- `GatewayName` - 按网关名称筛选
- `GatewayType` - 按网关类型筛选 (Dedicated/Vpn)
- `ProvisioningState` - 按预配状态筛选
- `Region` - 按区域筛选

## 典型应用场景

1. **获取 ER Gateway 信息** - 查询 GatewayType == "Dedicated" 的记录
2. **获取 VPN Gateway 信息** - 查询 GatewayType == "Vpn" 的记录
3. **关联容器信息** - 通过 DeploymentId 关联 LogContainerSnapshot
4. **检查 SKU 和配置** - 获取 GatewayVmSize, GatewaySku 等

## 示例查询

### 按订阅查询 ExpressRoute Gateway
```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let subscriptionid = "{subscription}";
cluster('aznwchinamc.chinanorth2').database('aznwmds').GatewayTenantHealth
| where PreciseTimeStamp >= starttime - 1d and PreciseTimeStamp <= endtime
| where CustomerSubscriptionId == subscriptionid
| where GatewayType == "Dedicated"
| where ProvisioningState == "Provisioned"
| distinct GatewayName, CustomerSubscriptionId, GatewayId, GatewayVmSize, VIPAddress, 
         ProvisioningState, VNetName, VNetId, GatewayTenantVersion, GatewayType, 
         Region, GatewayDeploymentType, AzureDeploymentVmSize, PhysicalZones
```

### 获取 ER Gateway 实例容器信息
```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let subscriptionid = "{subscription}";
let gwname = "{gatewayName}";
cluster('aznwchinamc.chinanorth2').database('aznwmds').GatewayTenantHealth
| where PreciseTimeStamp >= starttime - 1d and PreciseTimeStamp <= endtime
| where CustomerSubscriptionId == subscriptionid
| where GatewayName == gwname
| distinct DeploymentId
| join kind=leftouter (
    cluster('azurecm.chinanorth2').database('azurecm').LogContainerSnapshot
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

### 查询 VPN Gateway 信息
```kql
cluster('aznwchinamc.chinanorth2').database('aznwmds').GatewayTenantHealth
| where PreciseTimeStamp > ago(1d)
| where CustomerSubscriptionId == "{subscription}"
| where GatewayType == "Vpn"
| summarize arg_max(PreciseTimeStamp, *) by GatewayId
| project GatewayName, GatewayId, GatewayVmSize, GatewaySku, VIPAddress, 
         ProvisioningState, Region, RunningState
```

## 关联表

- [TunnelEventsTable.md](./TunnelEventsTable.md) - VPN 隧道事件
- [CircuitTable.md](./CircuitTable.md) - ExpressRoute 线路信息

## GatewayType 值说明

| 值 | 说明 |
|-----|------|
| `Dedicated` | ExpressRoute Gateway |
| `Vpn` | VPN Gateway |
| `DedicatedVpn` | VPN 和 ER 共存 |

## 注意事项

- DeploymentId 可用于关联 azurecm.LogContainerSnapshot 获取底层容器信息
- CircuitServiceKey 可用于关联 CircuitTable 获取 ExpressRoute 线路信息
- 查询时使用 `summarize arg_max()` 获取最新记录

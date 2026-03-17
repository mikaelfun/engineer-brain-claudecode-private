---
name: ApplicationGatewaysExtendedLatestProd
database: aznwmds
cluster: https://aznwchinamc.chinanorth2.kusto.chinacloudapi.cn
description: Application Gateway 扩展信息快照，包含 V1 (Standard/WAF) 网关配置
status: active
---

# ApplicationGatewaysExtendedLatestProd

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://aznwchinamc.chinanorth2.kusto.chinacloudapi.cn |
| 数据库 | aznwmds |
| 状态 | ✅ 可用 |

## 用途

记录 Application Gateway 的扩展配置信息，包括 SKU、实例数、VNet 配置、客户信息等。主要用于 App GW V1 (Standard/WAF) 的信息查询。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| SnapshotTime | datetime | 快照时间 |
| GatewayId | string | Application Gateway ID |
| GatewayName | string | Application Gateway 名称 |
| ResourceUri | string | 资源 URI |
| CustomerSubscriptionId | string | 客户订阅 ID |
| SkuType | string | SKU 类型 (Standard/WAF/Standard_v2/WAF_v2) |
| GatewaySize | string | 网关大小 |
| InstanceCount | int | 实例数量 |
| State | string | 状态 |
| Substate | string | 子状态 |
| DeploymentId | string | 部署 ID |
| DeploymentType | string | 部署类型 |
| VnetId | string | VNet ID |
| VnetName | string | VNet 名称 |
| Subnets | string | 子网信息 |
| VirtualIPs | string | VIP 地址 |
| LocationConstraint | string | 位置约束（区域） |
| CreatedDateTimeUTC | string | 创建时间 (UTC) |
| CloudCustomerName | string | 云客户名称 |
| TPName | string | TP 名称 |
| GatewayVersion | string | Gateway 版本 |

## 常用筛选字段

- `CustomerSubscriptionId` - 按订阅筛选
- `GatewayName` - 按网关名称筛选
- `SkuType` - 按 SKU 类型筛选
- `LocationConstraint` - 按区域筛选
- `State` - 按状态筛选

## 典型应用场景

1. **App GW V1 信息查询** - 查询 Standard/WAF SKU 的网关
2. **客户网关清单** - 获取订阅下的 App GW 列表
3. **实例状态检查** - 检查实例数量和状态
4. **VNet 关联查询** - 获取网关所在的 VNet 信息

## 示例查询

### 查询 App GW V1 信息
```kql
cluster('aznwchinamc.chinanorth2').database('aznwmds').ApplicationGatewaysExtendedLatestProd
| where SnapshotTime >= ago(3d)
| where SkuType == "Standard" or SkuType == "WAF"
| project SnapshotTime, CreatedDateTimeUTC, GatewayId, ResourceUri, SkuType, 
         CloudCustomerName, TPName, LocationConstraint
```

### 按订阅查询 App GW
```kql
cluster('aznwchinamc.chinanorth2').database('aznwmds').ApplicationGatewaysExtendedLatestProd
| where SnapshotTime >= ago(1d)
| where CustomerSubscriptionId == "{subscription}"
| summarize arg_max(SnapshotTime, *) by GatewayId
| project GatewayName, GatewayId, SkuType, GatewaySize, InstanceCount, 
         State, Substate, VnetName, LocationConstraint
```

### 查询特定 App GW 详情
```kql
cluster('aznwchinamc.chinanorth2').database('aznwmds').ApplicationGatewaysExtendedLatestProd
| where SnapshotTime >= ago(7d)
| where GatewayName == "{gatewayName}"
| project SnapshotTime, State, Substate, InstanceCount, GatewayVersion, 
         VirtualIPs, Subnets, DeploymentId
| order by SnapshotTime desc
```

## 关联表

- [GatewayTenantHealth.md](./GatewayTenantHealth.md) - VPN/ER Gateway 信息

## SkuType 值说明

| 值 | 说明 |
|-----|------|
| `Standard` | Application Gateway V1 Standard |
| `WAF` | Application Gateway V1 WAF |
| `Standard_v2` | Application Gateway V2 Standard |
| `WAF_v2` | Application Gateway V2 WAF |

## State 值说明

| 值 | 说明 |
|-----|------|
| `Running` | 运行中 |
| `Stopped` | 已停止 |
| `Starting` | 正在启动 |
| `Stopping` | 正在停止 |
| `Failed` | 失败 |

## 注意事项

- 此表主要包含 App GW V1 (Standard/WAF) 信息
- 使用 `arg_max(SnapshotTime, *)` 获取最新快照
- DeploymentId 可用于关联底层容器信息

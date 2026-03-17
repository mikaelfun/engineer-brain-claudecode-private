---
name: appgw
description: Application Gateway 信息查询
tables:
  - ApplicationGatewaysExtendedLatestProd
parameters:
  - name: subscription
    required: false
    description: 订阅 ID
  - name: gatewayName
    required: false
    description: Application Gateway 名称
---

# Application Gateway 查询

## 用途

查询 Application Gateway 的配置信息、实例状态和 VNet 配置。主要用于 App GW V1 (Standard/WAF) 信息查询。

---

## 查询 1: 查询 App GW V1 信息

### 查询语句

```kql
cluster('aznwchinamc.chinanorth2.kusto.chinacloudapi.cn').database('aznwmds').ApplicationGatewaysExtendedLatestProd
| where SnapshotTime >= ago(3d)
| where SkuType == "Standard" or SkuType == "WAF"
| project SnapshotTime, CreatedDateTimeUTC, GatewayId, ResourceUri, SkuType, 
         CloudCustomerName, TPName, LocationConstraint
```

### 结果字段说明

| 字段 | 说明 |
|------|------|
| SnapshotTime | 快照时间 |
| GatewayId | Gateway ID |
| ResourceUri | 资源 URI |
| SkuType | SKU 类型 |
| CloudCustomerName | 客户名称 |
| LocationConstraint | 区域 |

---

## 查询 2: 按订阅查询 Application Gateway

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {subscription} | 是 | 订阅 ID |

### 查询语句

```kql
cluster('aznwchinamc.chinanorth2.kusto.chinacloudapi.cn').database('aznwmds').ApplicationGatewaysExtendedLatestProd
| where SnapshotTime >= ago(1d)
| where CustomerSubscriptionId == "{subscription}"
| summarize arg_max(SnapshotTime, *) by GatewayId
| project GatewayName, GatewayId, SkuType, GatewaySize, InstanceCount, 
         State, Substate, VnetName, LocationConstraint
```

### 结果字段说明

| 字段 | 说明 |
|------|------|
| GatewayName | Gateway 名称 |
| SkuType | SKU 类型 |
| GatewaySize | 网关大小 |
| InstanceCount | 实例数量 |
| State | 状态 |
| Substate | 子状态 |
| VnetName | VNet 名称 |

---

## 查询 3: 查询特定 Application Gateway 详情

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {gatewayName} | 是 | Application Gateway 名称 |

### 查询语句

```kql
cluster('aznwchinamc.chinanorth2.kusto.chinacloudapi.cn').database('aznwmds').ApplicationGatewaysExtendedLatestProd
| where SnapshotTime >= ago(7d)
| where GatewayName == "{gatewayName}"
| project SnapshotTime, State, Substate, InstanceCount, GatewayVersion, 
         VirtualIPs, Subnets, DeploymentId, SkuType, GatewaySize
| order by SnapshotTime desc
```

---

## 查询 4: 查询 App GW 状态历史

### 查询语句

```kql
cluster('aznwchinamc.chinanorth2.kusto.chinacloudapi.cn').database('aznwmds').ApplicationGatewaysExtendedLatestProd
| where SnapshotTime >= ago(7d)
| where GatewayName == "{gatewayName}"
| project SnapshotTime, State, Substate, InstanceCount
| order by SnapshotTime asc
```

---

## 查询 5: 按区域统计 App GW

### 查询语句

```kql
cluster('aznwchinamc.chinanorth2.kusto.chinacloudapi.cn').database('aznwmds').ApplicationGatewaysExtendedLatestProd
| where SnapshotTime >= ago(1d)
| summarize arg_max(SnapshotTime, *) by GatewayId
| summarize GatewayCount = count() by LocationConstraint, SkuType
| order by LocationConstraint, SkuType
```

---

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

## 关联查询

- [arg-publicip.md](./arg-publicip.md) - 公网 IP 查询

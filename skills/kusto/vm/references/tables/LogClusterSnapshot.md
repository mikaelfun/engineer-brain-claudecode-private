---
name: LogClusterSnapshot
database: azurecm
cluster: https://azurecm.chinanorth2.kusto.chinacloudapi.cn
description: 集群快照，记录 Fabric 集群的配置和元数据信息
status: active
---

# LogClusterSnapshot

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azurecm.chinanorth2.kusto.chinacloudapi.cn |
| 数据库 | azurecm |
| 状态 | ✅ 可用 |

## 用途

记录 Fabric 集群级别的快照信息，包括集群 SKU、Build 版本、虚拟化环境类型等。用于确认集群配置和定位集群级别问题。

## 关键字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| PreciseTimeStamp | datetime | 精确时间戳 | |
| Tenant | string | 集群名称 | ZQZ21PrdApp03 |
| Region | string | 区域 | chinan3 |
| DataCenterName | string | 数据中心 | |
| buildVersion | string | 集群 Build 版本 | |
| clusterSku | string | 集群 SKU | |
| hostingEnvironment | string | 托管环境类型 | |
| virtualEnvironment | string | 虚拟化环境 | |
| isKsrSupported | string | 是否支持 KSR | |
| isBarbera | string | 是否 Barbera 集群 | |

## 常用筛选字段

- `Tenant` - 按集群名称筛选
- `Region` - 按区域筛选
- `DataCenterName` - 按数据中心筛选

## 典型应用场景

1. **集群配置查询** - 确认集群 SKU 和 Build 版本
2. **区域集群列表** - 列出指定区域的所有集群
3. **集群能力确认** - 检查是否支持 KSR/AzPE 等功能

## 示例查询

```kql
LogClusterSnapshot
| where PreciseTimeStamp > ago(1d)
| where Tenant == "{clusterName}"
| project PreciseTimeStamp, Tenant, Region, buildVersion, clusterSku, hostingEnvironment
| take 1
```

## 关联表

- [LogNodeSnapshot.md](./LogNodeSnapshot.md) - 节点快照
- [LogContainerSnapshot.md](./LogContainerSnapshot.md) - 容器快照

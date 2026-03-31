---
name: LogAllocatableVmCountMetric
database: azurecm
cluster: https://azurecm.chinanorth2.kusto.chinacloudapi.cn
description: 可分配 VM 数量指标表，记录每个区域/数据中心可分配的 VM 数量统计信息
status: active
---

# LogAllocatableVmCountMetric

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azurecm.chinanorth2.kusto.chinacloudapi.cn |
| 数据库 | azurecm |
| 状态 | ✅ 可用 |

## 用途

可分配 VM 数量指标表，记录每个区域/数据中心可分配的 VM 数量统计信息，用于容量分析。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| TIMESTAMP | datetime | 时间戳 |
| PreciseTimeStamp | datetime | 精确时间戳 |
| Region | string | 区域 |
| DataCenterName | string | 数据中心名称 |
| AvailabilityZone | string | 可用区 |
| vmType | string | VM 类型/SKU |
| vmCount | long | 可分配 VM 数量 |
| limitType | string | 限制类型 |
| henToReserve | long | 预留 HEN 数量 |
| sellableAvailableCores | real | 可售可用核心数 |
| occupiesWholeNode | bool | 是否占用整个节点 |
| takesExactlyOneCore | bool | 是否恰好使用一个核心 |
| VmCountSource | string | VM 数量来源 |
| edgeZone | string | 边缘区域 |

## 示例查询

```kql
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').LogAllocatableVmCountMetric
| where PreciseTimeStamp > ago(1h)
| where Region == 'chinanorth2'
| summarize AvgVmCount=avg(vmCount), MaxVmCount=max(vmCount) by vmType, AvailabilityZone
| order by vmType
```

## 关联表

- [LogNodeSnapshot.md](./LogNodeSnapshot.md) - 节点快照

---
name: VmShoeboxCounterTable
database: Fa
cluster: https://azcore.chinanorth3.kusto.chinacloudapi.cn
description: VM 性能计数器 Shoebox 表，记录 VM 级别的 MDM 计数器数据（含百分位统计）
status: active
---

# VmShoeboxCounterTable

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azcore.chinanorth3.kusto.chinacloudapi.cn |
| 数据库 | Fa |
| 状态 | ✅ 可用 |

## 用途

记录 VM 的各项 MDM 性能计数器数据，包含平均值、最大值和完整百分位统计（P0-P100）。用于 VM 性能分析、CPU/内存/磁盘瓶颈定位。

## 关键字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| PreciseTimeStamp | datetime | 精确时间戳 | 2025-01-01T00:00:00Z |
| MDMCounterName | string | 计数器名称 | \Processor(_Total)\% Processor Time |
| AverageValue | real | 平均值 | 45.6 |
| MaxValueInaMinute | real | 1分钟内最大值 | 98.3 |
| DurationInMinutes | long | 持续时间（分钟） | 5 |
| VmId | string | VM ID | |
| VMUniqueId | string | VM 唯一 ID | |
| VmName | string | VM 名称 | myVM |
| subscriptionId | string | 订阅 ID | |
| resourceGroupName | string | 资源组 | |
| ArmId | string | ARM 资源 ID | |
| P0/P25/P50/P75/P90/P95/P99/P100 | real | 百分位值 | |

## 常用筛选字段

- `subscriptionId` - 按订阅筛选
- `VmName` / `ArmId` - 按 VM 筛选
- `MDMCounterName` - 按计数器名称筛选
- `PreciseTimeStamp` - 按时间筛选

## 典型应用场景

1. **CPU 使用率分析** - 查询 Processor Time 计数器的百分位分布
2. **内存压力诊断** - 查询 Available MBytes 趋势
3. **磁盘性能瓶颈** - 查询 Disk Queue Length、Disk Latency

## 示例查询

```kql
VmShoeboxCounterTable
| where PreciseTimeStamp > ago(1d)
| where subscriptionId == "{subscription}"
| where VmName == "{vmName}"
| where MDMCounterName has "Processor"
| project PreciseTimeStamp, MDMCounterName, AverageValue, P50, P95, P99
| order by PreciseTimeStamp desc
| take 100
```

## 关联表

- [VmHealthRawStateEtwTable.md](./VmHealthRawStateEtwTable.md) - VM 健康状态
- [VmCounterFiveMinuteRoleInstanceCentralBondTable.md](./VmCounterFiveMinuteRoleInstanceCentralBondTable.md) - 5分钟聚合计数器

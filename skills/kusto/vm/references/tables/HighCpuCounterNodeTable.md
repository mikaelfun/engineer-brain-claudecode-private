---
name: HighCpuCounterNodeTable
database: Fa
cluster: https://azcore.chinanorth3.kusto.chinacloudapi.cn
description: 节点高 CPU 计数器表，记录物理节点的 CPU 计数器数据
status: active
---

# HighCpuCounterNodeTable

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azcore.chinanorth3.kusto.chinacloudapi.cn |
| 数据库 | Fa |
| 状态 | ✅ 可用 |

## 用途

记录物理节点（Host）的 CPU 相关计数器数据。用于判断 VM 性能问题是否由宿主机 CPU 争用导致。

## 关键字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| PreciseTimeStamp | datetime | 精确时间戳 | |
| Cluster | string | 集群名称 | ZQZ21PrdApp03 |
| NodeId | string | 节点 ID | |
| CounterName | string | 计数器名称 | |
| CounterValue | real | 计数器值 | 85.3 |

## 常用筛选字段

- `NodeId` - 按节点筛选
- `Cluster` - 按集群筛选
- `CounterName` - 按计数器名称筛选

## 典型应用场景

1. **Noisy Neighbor 诊断** - 查询宿主机 CPU 使用率判断是否存在邻居噪音
2. **Host CPU 争用分析** - 结合 VM 性能计数器交叉对比

## 示例查询

```kql
HighCpuCounterNodeTable
| where PreciseTimeStamp between (datetime({starttime}) .. datetime({endtime}))
| where NodeId == "{nodeId}"
| project PreciseTimeStamp, CounterName, CounterValue
| order by PreciseTimeStamp desc
| take 100
```

## 关联表

- [VmShoeboxCounterTable.md](./VmShoeboxCounterTable.md) - VM 级别计数器
- [LogNodeSnapshot.md](./LogNodeSnapshot.md) - 节点快照信息

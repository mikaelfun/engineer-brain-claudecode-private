---
name: VmCounterFiveMinuteRoleInstanceCentralBondTable
database: Fa
cluster: https://azcore.chinanorth3.kusto.chinacloudapi.cn
description: VM 性能计数器五分钟聚合表，记录 VM 的各项性能计数器的 5 分钟聚合数据
status: active
---

# VmCounterFiveMinuteRoleInstanceCentralBondTable

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azcore.chinanorth3.kusto.chinacloudapi.cn |
| 数据库 | Fa |
| 状态 | ✅ 可用 |

## 用途

VM 性能计数器五分钟聚合表，记录 VM 的各项性能计数器的 5 分钟聚合数据（平均值、最小值、最大值）。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| TIMESTAMP | datetime | 时间戳 |
| PreciseTimeStamp | datetime | 精确时间戳 |
| Region | string | 区域 |
| DataCenter | string | 数据中心 |
| Cluster | string | 集群 |
| NodeId | string | 节点 ID |
| VmId | string | VM ID |
| ContainerId | string | 容器 ID |
| TenantId | string | 租户 ID |
| RoleId | string | 角色 ID |
| RoleInstanceId | string | 角色实例 ID |
| CounterName | string | 计数器名称 |
| SampleCount | long | 样本数量 |
| AverageCounterValue | real | 平均值 |
| MinCounterValue | real | 最小值 |
| MaxCounterValue | real | 最大值 |

## 示例查询

```kql
cluster('azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').VmCounterFiveMinuteRoleInstanceCentralBondTable
| where PreciseTimeStamp > ago(1d)
| where VmId == '{vmId}' or ContainerId == '{containerId}'
| where CounterName has 'CPU'
| project PreciseTimeStamp, CounterName, AverageCounterValue, MinCounterValue, MaxCounterValue
| order by PreciseTimeStamp desc
```

## 关联表

- [VmHealthRawStateEtwTable.md](./VmHealthRawStateEtwTable.md) - VM 健康状态
- [LogContainerSnapshot.md](./LogContainerSnapshot.md) - 获取 ContainerId

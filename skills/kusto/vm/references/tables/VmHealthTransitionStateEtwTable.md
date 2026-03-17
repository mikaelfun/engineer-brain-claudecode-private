---
name: VmHealthTransitionStateEtwTable
database: Fa
cluster: https://azcore.chinanorth3.kusto.chinacloudapi.cn
description: VM 健康状态转换事件表，记录状态变化点
status: active
---

# VmHealthTransitionStateEtwTable

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azcore.chinanorth3.kusto.chinacloudapi.cn |
| 数据库 | Fa |
| 状态 | ✅ 可用 |

## 用途

记录 VM 健康状态的转换事件，仅在状态发生变化时记录。相比 VmHealthRawStateEtwTable 更高效，用于快速定位状态变化点。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| PreciseTimeStamp | datetime | 精确时间戳 |
| ContainerId | string | 容器 ID |
| NodeId | string | 节点 ID |
| VmHyperVIcHeartbeatState | string | 心跳状态（HeartBeatStateOk / HeartBeatStateNoContact） |
| VmPowerState | string | 电源状态（PowerStateEnabled / PowerStateDisabled） |
| VmHyperVHandshakeState | string | IC 握手状态 |
| VmOsCompositeState | string | OS 综合状态 |
| VmVscState | string | VSC 状态 |
| VmCompositeState | string | VM 综合健康状态 |
| Context | string | 上下文信息 |

## 示例查询

```kql
cluster('azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').VmHealthTransitionStateEtwTable
| where PreciseTimeStamp between (datetime({starttime}) .. datetime({endtime}))
| where ContainerId == "{containerId}"
| project PreciseTimeStamp, VmHyperVIcHeartbeatState, VmPowerState, VmHyperVHandshakeState, 
         VmOsCompositeState, VmVscState, VmCompositeState, Context
| order by PreciseTimeStamp asc
```

## 关联表

- [VmHealthRawStateEtwTable.md](./VmHealthRawStateEtwTable.md) - 原始健康状态数据

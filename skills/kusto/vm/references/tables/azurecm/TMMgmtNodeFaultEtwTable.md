---
name: TMMgmtNodeFaultEtwTable
database: azurecm
cluster: https://azurecm.chinanorth2.kusto.chinacloudapi.cn
description: 节点故障事件表，记录物理节点的故障码和故障详情
status: active
---

# TMMgmtNodeFaultEtwTable

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azurecm.chinanorth2.kusto.chinacloudapi.cn |
| 数据库 | azurecm |
| 状态 | ✅ 可用 |

## 用途

记录物理节点发生的故障事件，包括故障码（FaultCode）、故障原因和详细信息。用于诊断硬件故障导致的 VM 可用性影响。

## 关键字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| PreciseTimeStamp | datetime | 精确时间戳 | |
| Tenant | string | 集群名称 | |
| SourceNodeId | string | 节点 ID | |
| FaultCode | long | 故障码 | |
| Reason | string | 故障原因 | |
| Details | string | 故障详情 | |
| Time | datetime | 故障发生时间 | |
| CorrelationGuid | string | 关联 GUID | |
| BladeID | string | 刀片 ID | |
| FaultInfoJsonString | string | 故障信息 JSON | |

## 常用筛选字段

- `SourceNodeId` - 按节点 ID 筛选
- `FaultCode` - 按故障码筛选
- `Tenant` - 按集群筛选

## 典型应用场景

1. **硬件故障诊断** - 查询节点故障码和原因
2. **VM 不可用根因分析** - 确认 VM 所在节点是否发生故障
3. **故障时间线重建** - 结合 Service Healing 事件分析

## 示例查询

```kql
TMMgmtNodeFaultEtwTable
| where PreciseTimeStamp between (datetime({starttime}) .. datetime({endtime}))
| where SourceNodeId == "{nodeId}"
| project PreciseTimeStamp, FaultCode, Reason, Details, CorrelationGuid
| order by PreciseTimeStamp desc
```

## 关联表

- [TMMgmtNodeEventsEtwTable.md](./TMMgmtNodeEventsEtwTable.md) - 节点事件
- [TMMgmtNodeStateChangedEtwTable.md](./TMMgmtNodeStateChangedEtwTable.md) - 节点状态变更
- [ServiceHealingTriggerEtwTable.md](./ServiceHealingTriggerEtwTable.md) - Service Healing 触发

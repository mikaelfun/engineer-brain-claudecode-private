---
name: LogNodeSnapshot
database: azurecm
cluster: https://azurecm.chinanorth2.kusto.chinacloudapi.cn
description: 节点快照，记录物理节点的状态和配置信息
status: active
---

# LogNodeSnapshot

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azurecm.chinanorth2.kusto.chinacloudapi.cn |
| 数据库 | azurecm |
| 状态 | ✅ 可用 |

## 用途

记录节点的快照信息，包括节点状态、可用性状态、磁盘配置等。用于排查节点级别问题，如 Unallocatable、HumanInvestigate 状态。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| PreciseTimeStamp | datetime | 快照时间 |
| nodeId | string | 节点 ID |
| Tenant | string | 集群名称 |
| nodeState | string | 节点状态 (Ready/Booting/OutForRepair/HumanInvestigate) |
| nodeAvailabilityState | string | 可用性状态 (Available/Unallocatable/Faulted) |
| containerCount | int | 容器数量 |
| diskConfiguration | string | 磁盘配置 (AllDisksInStripe) |
| faultInfo | string | 故障信息 |
| rootUpdateAllocationType | string | 根更新分配类型 |
| RoleInstance | string | 角色实例 |
| healthSignals | string | 健康信号 |
| cmNodeChannelAggregatedHealthStatus | string | 节点通道聚合健康状态 |

## 常用筛选字段

- `nodeId` - 按节点 ID 筛选 (必需)
- `nodeState` - 按节点状态筛选
- `nodeAvailabilityState` - 按可用性状态筛选
- `Tenant` - 按集群筛选

## 节点状态说明

| nodeState | 说明 |
|-----------|------|
| Ready | 正常就绪 |
| Booting | 正在启动 |
| OutForRepair | 维修中 |
| HumanInvestigate | 需人工调查 |
| PoweringOn | 正在开机 |
| PoweredOff | 已关机 |
| Dead | 已失效 |
| Recovering | 恢复中 |

| nodeAvailabilityState | 说明 |
|----------------------|------|
| Available | 可用 |
| Unallocatable | 不可分配 |
| Faulted | 故障 |
| OutForRepair | 维修中 |

## 示例查询

### 查询节点状态

```kql
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').LogNodeSnapshot
| where TIMESTAMP > ago(1d)
| where nodeId == "{nodeId}"
| project PreciseTimeStamp, nodeState, nodeAvailabilityState, faultInfo, containerCount, 
         aliveContainerCount, isIsolated, isOffline
```

### 查询节点状态变更历史

```kql
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').LogNodeSnapshot
| where PreciseTimeStamp >= datetime({starttime}) and PreciseTimeStamp <= datetime({endtime})
| where nodeId == "{nodeId}"
| project PreciseTimeStamp, RoleInstance, nodeState, nodeAvailabilityState, containerCount, 
         faultInfo, healthSignals, diskConfiguration, cmNodeChannelAggregatedHealthStatus
| order by PreciseTimeStamp asc
| extend flag = case(nodeState <> prev(nodeState) 
   or nodeAvailabilityState <> prev(nodeAvailabilityState) 
   or faultInfo <> prev(faultInfo), "changed", "")
| where flag <> ""
| extend level = case(
   nodeAvailabilityState in ("Faulted", "OutForRepair") or nodeState in ("Booting", "OutForRepair", 
   "PoweringOn", "HumanInvestigate", "PoweredOff", "Dead", "Recovering"), "error", 
   nodeAvailabilityState == "Available" and nodeState == "Ready", "info", "warning")
```

### 检查节点 Unallocatable 状态

```kql
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').LogNodeSnapshot 
| where nodeId =~ "{nodeId}" 
| where PreciseTimeStamp >= datetime({starttime}) and PreciseTimeStamp <= datetime({endtime}) 
| project PreciseTimeStamp, nodeState, nodeAvailabilityState, containerCount, diskConfiguration, 
         faultInfo, rootUpdateAllocationType, RoleInstance
```

## 关联表

- [TMMgmtNodeEventsEtwTable.md](./TMMgmtNodeEventsEtwTable.md) - 节点事件
- [TMMgmtNodeStateChangedEtwTable.md](./TMMgmtNodeStateChangedEtwTable.md) - 状态变更事件
- [FaultHandlingRecoveryEventEtwTable.md](./FaultHandlingRecoveryEventEtwTable.md) - 故障恢复事件
- [ResourceSnapshotHistoryV1.md](./ResourceSnapshotHistoryV1.md) - DCM 层节点信息

## 注意事项

- 节点问题通常需要关联多个表进行综合分析
- `Unallocatable` 状态表示节点不能接受新的 VM 分配
- `HumanInvestigate` 状态表示需要人工调查
- 使用状态变更查询可以快速定位问题发生时间点

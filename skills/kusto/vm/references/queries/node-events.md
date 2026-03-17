---
name: node-events
description: 节点事件查询 - 排查节点状态变更和故障
tables:
  - LogNodeSnapshot
  - TMMgmtNodeEventsEtwTable
  - TMMgmtNodeStateChangedEtwTable
  - FaultHandlingRecoveryEventEtwTable
parameters:
  - name: nodeId
    required: true
    description: 节点 ID
  - name: starttime
    required: true
    description: 开始时间
  - name: endtime
    required: true
    description: 结束时间
---

# 节点事件查询

## 用途

排查节点级别问题，包括状态变更、故障恢复、Unallocatable/HumanInvestigate 状态等。

## 必要参数

| 参数 | 必填 | 说明 | 示例 |
|------|------|------|------|
| {nodeId} | 是 | 节点 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| {starttime} | 是 | 开始时间 | 2025-01-01T00:00:00Z |
| {endtime} | 是 | 结束时间 | 2025-01-02T00:00:00Z |

## 查询语句

### 查询节点状态快照

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

### 查询节点状态变更事件

```kql
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').TMMgmtNodeStateChangedEtwTable  
| where BladeID == "{nodeId}" 
| where PreciseTimeStamp >= datetime({starttime}) 
| where PreciseTimeStamp <= datetime({endtime})   
| project PreciseTimeStamp, BladeID, OldState, NewState
```

### 查询节点事件详情

```kql
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').TMMgmtNodeEventsEtwTable   
| where NodeId == "{nodeId}" 
| where PreciseTimeStamp >= datetime({starttime})  
| where PreciseTimeStamp <= datetime({endtime}) 
| project PreciseTimeStamp = tostring(PreciseTimeStamp), Message  
| sort by PreciseTimeStamp asc
```

### 查询故障恢复事件

```kql
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').FaultHandlingRecoveryEventEtwTable
| where PreciseTimeStamp >= datetime({starttime}) and PreciseTimeStamp <= datetime({endtime})
| where NodeId == "{nodeId}"
| project PreciseTimeStamp, NodeId, Reason, RecoveryAction, RecoveryResult
```

## 结果字段说明

| 字段 | 说明 |
|------|------|
| nodeState | 节点状态 (Ready/Booting/OutForRepair/HumanInvestigate) |
| nodeAvailabilityState | 可用性状态 (Available/Unallocatable/Faulted) |
| faultInfo | 故障信息 |
| RecoveryAction | 恢复操作 (PowerCycle/RebootNode/MarkNodeAsUnallocatable) |
| RecoveryResult | 恢复结果 (Successful/Failed/Scheduled) |

## 变体查询

### 确认集群内多节点重启

```kql
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').TMMgmtNodeStateChangedEtwTable  
| where PreciseTimeStamp >= datetime({starttime}) and PreciseTimeStamp <= datetime({endtime}) 
| where Tenant == "{cluster}" 
| where NewState == "Booting" 
| project PreciseTimeStamp, BladeID, OldState, NewState
```

### 查询节点故障事件

```kql
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').TMMgmtNodeFaultEtwTable
| where TIMESTAMP >= datetime({starttime}) and TIMESTAMP <= datetime({endtime})
| where BladeID == "{nodeId}"
| project TIMESTAMP, BladeID, Details, FaultCode, Reason
```

## 关联查询

- [container-snapshot.md](./container-snapshot.md) - 获取 nodeId
- [hardware-failure.md](./hardware-failure.md) - 硬件故障查询
- [service-healing.md](./service-healing.md) - Service Healing 查询

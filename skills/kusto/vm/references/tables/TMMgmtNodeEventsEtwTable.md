---
name: TMMgmtNodeEventsEtwTable
database: azurecm
cluster: https://azurecm.chinanorth2.kusto.chinacloudapi.cn
description: 节点事件表，记录节点级别的操作和状态变化
status: active
---

# TMMgmtNodeEventsEtwTable

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azurecm.chinanorth2.kusto.chinacloudapi.cn |
| 数据库 | azurecm |
| 状态 | ✅ 可用 |

## 用途

记录节点级别的操作事件和状态变化，包括节点不可达、重启、故障等事件。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| PreciseTimeStamp | datetime | 精确时间戳 |
| NodeId | string | 节点 ID |
| Tenant | string | 集群名称 |
| Role | string | 角色名称 |
| RoleInstance | string | 角色实例 |
| SourceNodeId | string | 源节点 ID |
| ActivityId | string | 活动 ID |
| Message | string | 事件消息 |
| Region | string | 区域 |

## 示例查询

### 查询节点事件

```kql
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').TMMgmtNodeEventsEtwTable   
| where NodeId == "{nodeId}" 
| where PreciseTimeStamp >= datetime({starttime})  
| where PreciseTimeStamp <= datetime({endtime}) 
| project PreciseTimeStamp = tostring(PreciseTimeStamp), Message  
| sort by PreciseTimeStamp asc
```

### 查询节点不可达事件

```kql
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').TMMgmtNodeEventsEtwTable 
| where PreciseTimeStamp > ago(4d)
| where NodeId == "{nodeId}"
| where Message contains "GetState failed. Node is unreachable"
| project PreciseTimeStamp, NodeId, Message
```

## 关联表

- [TMMgmtNodeStateChangedEtwTable.md](./TMMgmtNodeStateChangedEtwTable.md) - 节点状态变更
- [LogNodeSnapshot.md](./LogNodeSnapshot.md) - 节点快照
- [FaultHandlingRecoveryEventEtwTable.md](./FaultHandlingRecoveryEventEtwTable.md) - 故障恢复事件
